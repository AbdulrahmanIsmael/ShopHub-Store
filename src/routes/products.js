import express from "express";

import {
  getProductDetailsById,
  getProductsPage,
} from "../controllers/products.js";

const router = express.Router();

router.get("/products", getProductsPage);

router.get("/products/:productId", getProductDetailsById);

export default router;
