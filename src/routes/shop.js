const express = require("express");

const shopController = require("../controllers/shop");
const isAuth = require("../middleware/isAuth");

const router = express.Router();

router.get("/", shopController.getHome);
router.get("/cart", isAuth, shopController.getCart);
router.post("/cart", isAuth, shopController.postCart);
router.post("/delete-from-cart", isAuth, shopController.postRemoveFromCart);
router.post("/orders", isAuth, shopController.postOrder);
router.get("/orders", isAuth, shopController.getOrders);

module.exports = router;
