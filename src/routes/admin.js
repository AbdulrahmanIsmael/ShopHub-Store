const express = require("express");

const adminController = require("../controllers/admin");
const isAuth = require("../middleware/isAuth");

const router = express.Router();

router.get("/add-product", isAuth, adminController.getAddProductPage);

router.post("/add-product", isAuth, adminController.postProducts);

router.get("/products", isAuth, adminController.getAdminProductsPage);

router.get(
  "/edit-product/:productId",
  isAuth,
  adminController.getEditProductPage,
);

router.post("/edit-product", isAuth, adminController.postEditProduct);

router.post(
  "/delete-product/:productId",
  isAuth,
  adminController.postDeleteProduct,
);

module.exports = router;
