import { Request, Response } from "express";

// Mock @prisma/client BEFORE importing the controller
const prismaMock = {
  companys: {
    count: jest.fn(),
    findMany: jest.fn(),
  },
};

jest.mock("@prisma/client", () => {
  return {
    PrismaClient: jest.fn(() => prismaMock),
    // Minimal Prisma namespace stub (not used in getCompanies but safe for import)
    Prisma: { PrismaClientKnownRequestError: class {} },
    // Enum stub used by controller validation
    Package: {
      beginner: "beginner",
      intermidiate: "intermidiate",
      expert: "expert",
    },
  };
});

import { getCompanies } from "../../src/controllers/superadmin/company.controller";

const createMockRes = () => {
  const res: Partial<Response> = {};
  let statusCode = 200;
  let jsonBody: any = undefined;
  (res as any).status = jest.fn().mockImplementation((code: number) => {
    statusCode = code;
    return res;
  });
  (res as any).json = jest.fn().mockImplementation((body: any) => {
    jsonBody = body;
    return res;
  });
  return {
    res: res as Response,
    get status() {
      return statusCode;
    },
    get body() {
      return jsonBody;
    },
  };
};

describe("getCompanies (unit)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns paginated companies list with defaults", async () => {
    prismaMock.companys.count.mockResolvedValue(12);
    prismaMock.companys.findMany.mockResolvedValue([
      { id: "uuid-1", name: "Incit A" },
      { id: "uuid-2", name: "Incit B" },
    ]);

    const req = { query: {} } as unknown as Request;
    const { res, status, body } = createMockRes();

    await getCompanies(req, res);

    expect(prismaMock.companys.count).toHaveBeenCalledWith({
      where: { deleted_at: null },
    });
    expect(prismaMock.companys.findMany).toHaveBeenCalled();
    const arg = prismaMock.companys.findMany.mock.calls[0][0];
    expect(arg.skip).toBe(0);
    expect(arg.take).toBe(10);
    expect(arg.orderBy).toEqual({ created_at: "desc" });

    expect(status).toBe(200);
    expect(body).toHaveProperty("result");
    expect(body).toHaveProperty("pagination");
    expect(body.pagination).toEqual({ current: 1, total_data: 12, total_page: 2 });
  });

  it("applies search, package filter, and pagination", async () => {
    prismaMock.companys.count.mockResolvedValue(17);
    prismaMock.companys.findMany.mockResolvedValue([
      { id: "uuid-3", name: "Incit C" },
      { id: "uuid-4", name: "Incit D" },
    ]);

    const req = {
      query: { page: "2", per_page: "5", q: "incit", package: "beginner" },
    } as unknown as Request;
    const { res, status, body } = createMockRes();

    await getCompanies(req, res);

    expect(prismaMock.companys.count).toHaveBeenCalled();
    expect(prismaMock.companys.findMany).toHaveBeenCalled();
    const arg = prismaMock.companys.findMany.mock.calls[0][0];

    expect(arg.skip).toBe(5);
    expect(arg.take).toBe(5);
    expect(arg.where.package).toBe("beginner");
    expect(arg.where.OR).toBeDefined();
    expect(Array.isArray(arg.where.OR)).toBe(true);

    expect(status).toBe(200);
    expect(body.pagination).toEqual({ current: 2, total_data: 17, total_page: 4 });
  });

  it("handles internal error", async () => {
    prismaMock.companys.count.mockRejectedValue(new Error("DB error"));

    const req = { query: {} } as unknown as Request;
    const { res, status, body } = createMockRes();

    await getCompanies(req, res);

    expect(status).toBe(500);
    expect(body).toEqual({ message: "Internal server error" });
  });
});

