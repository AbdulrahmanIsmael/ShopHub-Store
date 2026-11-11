import express from "express";

import {
  getCart,
  getHome,
  getOrders,
  postCart,
  postOrder,
  postRemoveFromCart,
} from "../controllers/shop.controller.js";
import isAuth from "../middlewares/isAuth.middleware.js";

const router = express.Router();

router.get("/", getHome);
router.get("/cart", isAuth, getCart);
router.post("/cart", isAuth, postCart);
router.post("/delete-from-cart", isAuth, postRemoveFromCart);
router.post("/orders", isAuth, postOrder);
router.get("/orders", isAuth, getOrders);

export default router;
