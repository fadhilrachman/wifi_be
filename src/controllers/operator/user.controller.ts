import { Prisma, PrismaClient, UserRole } from "@prisma/client";
import { Request, Response } from "express";
import { createPagination, parsePagination } from "../../lib/helper";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

// Removed company scoping helper; scoping can be applied at router/middleware level if needed

export const getUsers = async (req: Request, res: Response) => {
  try {
    const { page, per_page, skip, take } = parsePagination(req.query);

    const filter: any = { deleted_at: null, role: "customer" };
    if (req.query.company_id) {
      filter.company_id = String(req.query.company_id);
    }
    if (req.query.q) {
      const q = String(req.query.q);
      filter.OR = [{ username: { contains: q } }, { email: { contains: q } }];
    }

    const count = await prisma.users.count({ where: filter });
    const result = await prisma.users.findMany({
      where: filter,
      skip,
      take,
      orderBy: { created_at: "desc" },
    });
    const pagination = createPagination({ page, per_page, total_data: count });
    return res
      .status(200)
      .json({ message: "Success get users", result, pagination });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  const id = String(req.params.id);
  try {
    const user = await prisma.users.findUnique({
      where: { id },
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json({ message: "Success get user", data: user });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const createUser = async (req: Request, res: Response) => {
  const { username, email, latitude, longitude, password, company_id } = req.body;

  try {
    const data: any = {
      username: username !== undefined ? String(username) : undefined,
      email: email !== undefined ? String(email) : undefined,
      role: "customer",
      company_id: company_id !== undefined ? String(company_id) : undefined,
      latitude: latitude !== undefined ? String(latitude) : "",
      longitude: longitude !== undefined ? String(longitude) : "",
    };
    if (password !== undefined) {
      data.password = await bcrypt.hash(String(password), 10);
    }

    const created = await prisma.users.create({ data });
    const { password: _pw, ...safe } = created as any;
    return res.status(201).json({ message: "Success create user", data: safe });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const id = String(req.params.id);
  if (!id) return res.status(400).json({ message: "Invalid user id" });
  const { username, email, latitude, longitude } = req.body;
  try {
    const data = { username, email, latitude, longitude };

    const updated = await prisma.users.update({ where: { id }, data });
    return res
      .status(200)
      .json({ message: "Success update user", data: updated });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const id = String(req.params.id);
  if (!id) return res.status(400).json({ message: "Invalid user id" });
  try {
    await prisma.users.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
    return res.status(200).json({ message: "Success delete user" });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};
