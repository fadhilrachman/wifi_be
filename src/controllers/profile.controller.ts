import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
import { NextFunction, Request, Response } from "express";
const prisma = new PrismaClient();
import bcrypt from "bcrypt";

export const getDataProfile = async (req: Request, res: Response) => {
  const user = req.user;
  try {
    const result = await prisma.users.findUnique({
      where: {
        id: user?.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
    return res
      .status(200)
      .json({ message: "Succes get data profile", data: result });
  } catch (error) {
    console.log({ error });

    return res.status(500).json({ message: error });
  }
};

export const patchDataProfile = async (req: Request, res: Response) => {
  const user = req.user;
  const { name } = req.body;
  try {
    const result = await prisma.users.update({
      where: {
        id: user?.id,
      },
      data: {
        name,
      },
    });

    return res.status(201).json({ message: "Success update profile" });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};
export const changePassword = async (req: Request, res: Response) => {
  const user = req.user;
  const { oldPassword, password } = req.body;
  try {
    const checkUser = await prisma.users.findUnique({
      where: {
        id: user?.id,
      },
    });

    if (checkUser?.password) {
      const isPasswordValid = await bcrypt.compare(
        oldPassword,
        checkUser?.password as string
      );

      if (isPasswordValid)
        return res.status(401).json({
          message: "The password you entered is incorrect. Please try again",
        });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      process.env.BCRYPT_HASH as string
    );

    await prisma.users.update({
      where: { id: user?.id },
      data: {
        password: hashedPassword,
      },
    });

    return res.status(201).json({ message: "Succes change password" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
