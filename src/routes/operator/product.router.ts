import { Router } from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../controllers/operator/product.controller";
import {} from "../../lib/middleware";

const router = Router();

router.get("/operator/products", getProducts);
router.post("/operator/products", createProduct);

router.get("/operator/products/:id", getProductById);
router.put("/operator/products/:id", updateProduct);
router.delete("/operator/products/:id", deleteProduct);

export default router;
