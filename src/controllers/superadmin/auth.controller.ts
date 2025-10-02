import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || "change-me";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";

export const loginSuperadmin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "'email' and 'password' are required" });
    }

    const user = await prisma.users.findFirst({
      where: { email: String(email), role: "superadmin", deleted_at: null },
    });

    if (!user || !user.password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(String(password), user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      {
        sub: user.id,
        role: user.role,
        company_id: user.company_id,
        email: user.email,
        username: user.username,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const { password: _pw, ...safe } = user as any;
    return res.status(200).json({ message: "Login success", token, user: safe });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const meSuperadmin = async (req: Request, res: Response) => {
  try {
    // Prefer user injected by middleware if available
    const bearer = req.header("Authorization");
    let userId: string | undefined = undefined;

    if ((req as any).user?.id) {
      userId = (req as any).user.id;
    } else if (bearer) {
      try {
        const decoded = jwt.verify(bearer, JWT_SECRET) as any;
        userId = decoded?.sub;
      } catch (_) {
        return res.status(401).json({ message: "Invalid or expired token" });
      }
    }

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await prisma.users.findFirst({
      where: { id: userId, role: "superadmin", deleted_at: null },
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    const { password: _pw, ...safe } = user as any;
    return res.status(200).json({ message: "OK", user: safe });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

