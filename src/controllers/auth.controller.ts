import * as dotenv from "dotenv";
import { NextFunction, Request, Response } from "express";
import { google } from "googleapis";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import moment from "moment";
import { sendEmail } from "../../lib/send-mail";

const prisma = new PrismaClient();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "http://localhost:5000/auth/google/callback"
);

const scopes = [
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
];

const authorizationUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  scope: scopes,
  include_granted_scopes: true,
});

export const authGoogle = (req: Request, res: Response) => {
  res.status(200).jsonp({ url: authorizationUrl });
};

export const authGoogleCallback = async (req: Request, res: Response) => {
  try {
    const { code } = req.query;

    const { tokens } = await oauth2Client.getToken(code as string);

    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: "v2",
    });

    const { data } = await oauth2.userinfo.get();

    if (!data.email || !data.name) {
      return res.json({
        data: data,
      });
    }

    let user = await prisma.users.findUnique({
      where: {
        email: data.email,
      },
    });

    if (!user) {
      user = await prisma.users.create({
        data: {
          name: data.name,
          email: data.email,
          is_email_verified: true,
        },
      });
    }

    const payload = {
      id: user?.id,
      name: user?.name,
    };

    const secret = process.env.JWT_SECRET!;

    const expiresIn = 60 * 60 * 24;

    const token = jwt.sign(payload, secret, { expiresIn: expiresIn });
    await prisma.sessions.create({
      data: {
        token,
        userId: user.id,
        expiredAt: new Date(Date.now() + expiresIn * 1000),
      },
    });
    return res.redirect(`${process.env.FE_URL}/success-login?token=${token}`);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.users.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      return res.status(404).json({
        message:
          "The email or password you entered is incorrect. Please try again",
      });
    }

    if (!user.password) {
      return res.status(404).json({
        message:
          "The email or password you entered is incorrect. Please try again",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password as string
    );

    if (isPasswordValid) {
      const payload = {
        id: user.id,
        name: user.name,
      };

      const secret = process.env.JWT_SECRET!;

      const expiresIn = 60 * 60 * 24;

      const token = jwt.sign(payload, secret, { expiresIn: expiresIn });
      await prisma.sessions.create({
        data: {
          token,
          userId: user.id,
          expiredAt: moment().add(expiresIn, "seconds").toDate(),
        },
      });
      return res.json({
        token: token,
      });
    } else {
      return res.status(403).json({
        message:
          "The email or password you entered is incorrect. Please try again",
      });
    }
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  try {
    const checkUserDuplicate = await prisma.users.findFirst({
      where: {
        email,
      },
    });

    if (checkUserDuplicate)
      return res.status(400).json({ message: "User already registered" });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.users.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    const payload = {
      id: user.id,
      name: user.name,
    };

    const secret = process.env.JWT_SECRET!;

    const expiresIn = 60 * 60 * 24;
    const token = jwt.sign(payload, secret, { expiresIn: expiresIn });
    await prisma.sessions.create({
      data: {
        token,
        userId: user.id,
        expiredAt: moment().add(expiresIn, "seconds").toDate(),
      },
    });

    await sendEmail({
      subject: "User verified",
      to: email,
      text: `Access this link for open your dashboard ${process.env.FE_URL}/success-login?token=${token}&is_need_verified=true`,
    });
    res.json({
      message: "User created",
    });
  } catch (error) {
    console.log({ error });

    res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = async (req: Request, res: Response) => {
  const token = req.header("Authorization");
  try {
    const result = await prisma.$transaction(async (prisma) => {
      const session = await prisma.sessions.update({
        where: {
          token,
        },
        data: {
          expiredAt: moment().toDate(),
        },
      });
      await prisma.users.update({
        where: {
          id: session?.userId,
        },
        data: {
          lastLogOut: moment().toDate(),
        },
      });
    });

    return res.status(200).json({ message: "Succes logout" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const verifiedEmail = async (req: Request, res: Response) => {
  const { token } = req.body;
  try {
    // const result = await prisma.users.u
    const checkSession = await prisma.sessions.findUnique({
      where: {
        token,
      },
    });

    if (!checkSession)
      return res.status(401).json({ message: "Token not found" });

    const result = await prisma.users.update({
      where: {
        id: checkSession.userId,
      },
      data: {
        is_email_verified: true,
      },
    });
    return res.status(200).json({ message: "Succes verified email" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
