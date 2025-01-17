import { NextFunction, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import moment from "moment";
const prisma = new PrismaClient();
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        name: string;
        email: string;
      };
    }
  }
}
export const protectRoute = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("Authorization");
  if (!token) {
    return res
      .status(401)
      .json({ message: "Access Denied. No token provided" });
  }

  const checkTokenExcisted = await prisma.sessions.findUnique({
    where: {
      token,
    },
    select: {
      token: true,
      expiredAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
  console.log({
    date: moment(checkTokenExcisted?.expiredAt).format("HH:mm:ss"),
  });

  if (!checkTokenExcisted)
    return res.status(401).json({ message: "Invalid or expired token" });

  const isSessionActive = moment().isBefore(
    moment(checkTokenExcisted.expiredAt)
  );

  if (!isSessionActive)
    return res.status(401).json({ message: "Invalid or expired token" });

  req.user = checkTokenExcisted.user;
  next();
};
