import Product from "../models/product.model.js";
import Order from "../models/order.model.js";

import { handleError } from "../utils/errorHandler.js";

// get the main page
export const getHome = async (req, res) => {
  try {
    const products = await Product.find();

    res.render("shop/index", {
      title: "Shop",
      products,
    });
  } catch (err) {
    handleError(res, err);
  }
};

// get the cart page
export const getCart = async (req, res) => {
  try {
    const user = req.user;
    const userProducts = await user.getCart();
    const totalPrice = userProducts.reduce(
      (acc, prod) => +acc + +prod?.price * +prod?.quantity || 0,
      0,
    );

    res.render("shop/cart", {
      title: "My Cart",
      products: userProducts,
      totalPrice: totalPrice ?? 0,
    });
  } catch (err) {
    handleError(res, err);
  }
};

// get the orders page
export const getOrders = async (req, res) => {
  try {
    const userId = req.session.userId;
    const userOrders = await Order.find({ userId });

    res.render("shop/orders", {
      title: "My Orders",
      orders: userOrders,
    });
  } catch (err) {
    handleError(res, err);
  }
};

// add product to cart
export const postCart = async (req, res) => {
  try {
    const user = req.user;
    const productId = req.body.productId;

    await user.addToCart(productId);
    res.redirect("/cart");
  } catch (err) {
    console.error(err);
  }
};

export const postRemoveFromCart = async (req, res) => {
  const user = req.user;
  await user.removeItemFromCart(req.body.productId);
  res.redirect("/cart");
};

// post new order
export const postOrder = async (req, res) => {
  try {
    const user = req.user;
    const populatedUser = await user.populate("cart.items.productId");

    await Order.createOrder(populatedUser.cart.items, req.user._id);
    await user.clearCart();
    res.redirect("/orders");
  } catch (err) {
    console.error(err);
  }
};
