import express from "express";

import {
  getAddProductPage,
  postProducts,
  getAdminProductsPage,
  postEditProduct,
  postDeleteProduct,
  getEditProductPage,
} from "../controllers/admin.controller.js";
import isAuth from "../middlewares/isAuth.middleware.js";

import { addProductValidator } from "../validators/admin.validator.js";

const router = express.Router();

router.get("/add-product", isAuth, getAddProductPage);
router.get("/products", isAuth, getAdminProductsPage);
router.get("/edit-product/:productId", isAuth, getEditProductPage);

router.post("/add-product", isAuth, addProductValidator, postProducts);
router.post("/edit-product", isAuth, addProductValidator, postEditProduct);
router.post("/delete-product/:productId", isAuth, postDeleteProduct);

export default router;
