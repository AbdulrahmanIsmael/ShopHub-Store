const express = require("express");

const adminController = require("../controllers/admin");
const isAuth = require("../middleware/isAuth");

const { addProductValidator } = require("../validators/admin");

const router = express.Router();

router.get("/add-product", isAuth, adminController.getAddProductPage);
router.get("/products", isAuth, adminController.getAdminProductsPage);
router.get(
  "/edit-product/:productId",
  isAuth,
  adminController.getEditProductPage,
);

router.post(
  "/add-product",
  isAuth,
  addProductValidator,
  adminController.postProducts,
);
router.post(
  "/edit-product",
  isAuth,
  addProductValidator,
  adminController.postEditProduct,
);
router.post(
  "/delete-product/:productId",
  isAuth,
  adminController.postDeleteProduct,
);

module.exports = router;
