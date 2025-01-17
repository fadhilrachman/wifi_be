import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
import { NextFunction, Request, Response } from "express";
import moment from "moment";

const prisma = new PrismaClient();

export const getDataDashboard = async (req: Request, res: Response) => {
  try {
    const sevenDaysAgo = moment().subtract(7, "days").toDate();
    const userRegistered = await prisma.users.count();
    const sessionActiveToday = await prisma.sessions.count({
      where: {
        expiredAt: {
          gte: moment().toDate(),
        },
      },
    });
    const sessionsLast7Days = await prisma.sessions.count({
      where: {
        expiredAt: {
          gte: sevenDaysAgo,
        },
      },
    });

    return res.status(200).json({
      message: "Success get data dashboard",
      data: {
        userRegistered,
        sessionActiveToday,
        sessionsLast7Days,
      },
    });
  } catch (error) {
    console.log({ error });

    return res.status(500).json({ message: error });
  }
};
export const getDataUser = async (req: Request, res: Response) => {
  try {
    const result = await prisma.users.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        lastLogOut: true,

        createdAt: true,
        _count: {
          select: {
            session: true,
          },
        },
      },
    });
    return res.status(200).json({
      message: "Success get data user",
      data: result,
    });
  } catch (error) {
    console.log({ error });

    return res.status(500).json({ message: error });
  }
};
