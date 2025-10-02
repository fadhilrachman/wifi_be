import { Prisma, PrismaClient, Package as PackageEnum } from "@prisma/client";
import { Request, Response } from "express";
import { createPagination, parsePagination } from "../../lib/helper";

const prisma = new PrismaClient();

const isValidPackage = (val: any): val is PackageEnum => {
  return ["beginner", "intermidiate", "expert"].includes(String(val));
};

export const getCompanies = async (req: Request, res: Response) => {
  try {
    const { page, per_page, skip, take } = parsePagination(req.query);

    const filter: any = { deleted_at: null };
    if (req.query.package && isValidPackage(req.query.package)) {
      filter.package = req.query.package as PackageEnum;
    }
    if (req.query.q) {
      const q = String(req.query.q);
      filter.OR = [{ name: { contains: q } }, { email: { contains: q } }];
    }

    const count = await prisma.companys.count({ where: filter });
    const result = await prisma.companys.findMany({
      where: filter,
      skip,
      take,
      orderBy: { created_at: "desc" },
    });
    const pagination = createPagination({ page, per_page, total_data: count });
    return res
      .status(200)
      .json({ message: "Success get companies", result, pagination });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getCompanyById = async (req: Request, res: Response) => {
  const id = String(req.params.id);
  if (!id) {
    return res.status(400).json({ message: "Invalid company id" });
  }
  try {
    const company = await prisma.companys.findFirst({
      where: { id, deleted_at: null },
    });
    if (!company) return res.status(404).json({ message: "Company not found" });
    return res
      .status(200)
      .json({ message: "Success get company", data: company });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const createCompany = async (req: Request, res: Response) => {
  const {
    name,
    address,
    phone,
    email,
    logo,
    latitude,
    longitude,
    wa_billing_message,
    wa_billing_paid_message,
    api_wa_token,
    is_wa_notification,
    is_email_notification,
    package: pkg,
  } = req.body;

  if (!isValidPackage(pkg)) {
    return res.status(400).json({ message: "Invalid package value" });
  }

  try {
    const created = await prisma.companys.create({
      data: {
        name: String(name),
        address: String(address ?? ""),
        phone: Number(phone ?? 0),
        email: String(email),
        logo: String(logo ?? ""),
        latitude: String(latitude ?? ""),
        longitude: String(longitude ?? ""),
        wa_billing_message: String(wa_billing_message ?? ""),
        wa_billing_paid_message: String(wa_billing_paid_message ?? ""),
        api_wa_token: String(api_wa_token ?? ""),
        is_wa_notification:
          is_wa_notification !== undefined
            ? Boolean(is_wa_notification)
            : false,
        is_email_notification:
          is_email_notification !== undefined
            ? Boolean(is_email_notification)
            : false,
        package: pkg as PackageEnum,
      },
    });
    return res
      .status(201)
      .json({ message: "Success create company", data: created });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateCompany = async (req: Request, res: Response) => {
  const id = String(req.params.id);
  if (!id) {
    return res.status(400).json({ message: "Invalid company id" });
  }
  const {
    name,
    address,
    phone,
    email,
    logo,
    latitude,
    longitude,
    wa_billing_message,
    wa_billing_paid_message,
    api_wa_token,
    is_wa_notification,
    is_email_notification,
    package: pkg,
  } = req.body;

  try {
    const data: any = req.body;

    const updated = await prisma.companys.update({
      where: { id },
      data,
    });
    return res
      .status(200)
      .json({ message: "Success update company", data: updated });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return res.status(404).json({ message: "Company not found" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteCompany = async (req: Request, res: Response) => {
  const id = String(req.params.id);
  if (!id) {
    return res.status(400).json({ message: "Invalid company id" });
  }
  try {
    await prisma.companys.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
    return res.status(200).json({ message: "Success delete company" });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return res.status(404).json({ message: "Company not found" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};
