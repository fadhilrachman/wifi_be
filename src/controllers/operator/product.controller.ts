import { Prisma, PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { createPagination, parsePagination } from "../../lib/helper";

const prisma = new PrismaClient();

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { page, per_page, skip, take } = parsePagination(req.query);

    const filter: any = { deleted_at: null };
    if (req.query.company_id) {
      filter.company_id = String(req.query.company_id);
    }

    const count = await prisma.products.count({ where: filter });
    const result = await prisma.products.findMany({
      where: filter,
      orderBy: { created_at: "desc" },
      skip,
      take,
    });
    const pagination = createPagination({ page, per_page, total_data: count });
    return res
      .status(200)
      .json({ message: "Success get products", result, pagination });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  const id = String(req.params.id);
  if (!id) {
    return res.status(400).json({ message: "Invalid product id" });
  }
  try {
    const product = await prisma.products.findFirst({
      where: { id, deleted_at: null },
    });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res
      .status(200)
      .json({ message: "Success get product", data: product });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  const { name, price, company_id, description } = req.body;
  if (!name || price === undefined || !company_id) {
    return res.status(400).json({
      message: "'name', 'price', and 'company_id' are required",
    });
  }
  try {
    const created = await prisma.products.create({
      data: {
        name: String(name),
        price: Number(price),
        company_id: String(company_id),
        description: description ? String(description) : "",
      },
    });
    return res.status(201).json({
      message: "Success create product",
      data: created,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  const id = String(req.params.id);
  if (!id) {
    return res.status(400).json({ message: "Invalid product id" });
  }
  const { name, price, company_id, description } = req.body;
  try {
    const updated = await prisma.products.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name: String(name) } : {}),
        ...(price !== undefined ? { price: Number(price) } : {}),
        ...(company_id !== undefined ? { company_id: String(company_id) } : {}),
        ...(description !== undefined ? { description: String(description) } : {}),
      },
    });
    return res
      .status(200)
      .json({ message: "Success update product", data: updated });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  const id = String(req.params.id);
  if (!id) {
    return res.status(400).json({ message: "Invalid product id" });
  }
  try {
    await prisma.products.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
    return res.status(200).json({ message: "Success delete product" });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};
