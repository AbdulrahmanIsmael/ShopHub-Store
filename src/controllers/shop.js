import Product from "../models/product.js";
import Order from "../models/order.js";

import { handleError } from "../utils/errorHandler.js";

// get the main page
export const getHome = (req, res) => {
  Product.find()
    .then((products) => {
      res.render("shop/index", {
        title: "Shop",
        products,
      });
    })
    .catch((err) => handleError(res, err));
};

// get the cart page
export const getCart = (req, res) => {
  const user = req.user;
  user
    .getCart()
    .then((products) => {
      const totalPrice = products.reduce(
        (acc, prod) => +acc + +prod?.price * +prod?.quantity || 0,
        0,
      );

      res.render("shop/cart", {
        title: "My Cart",
        products: products,
        totalPrice: totalPrice ?? 0,
      });
    })
    .catch((err) => handleError(res, err));
};

// get the orders page
export const getOrders = (req, res) => {
  const userId = req.session.userId;

  Order.find({ userId })
    .then((orders) => {
      res.render("shop/orders", {
        title: "My Orders",
        orders,
      });
    })
    .catch((err) => handleError(res, err));
};

// add product to cart
export const postCart = (req, res) => {
  const user = req.user;
  const productId = req.body.productId;

  user
    .addToCart(productId)
    .then(() => res.redirect("/cart"))
    .catch((err) => handleError(res, err));
};

export const postRemoveFromCart = (req, res) => {
  const user = req.user;
  user
    .removeItemFromCart(req.body.productId)
    .then(() => res.redirect("/cart"))
    .catch((err) => handleError(res, err));
};

// post new order
export const postOrder = (req, res) => {
  const user = req.user;
  user
    .populate("cart.items.productId")
    .then((user) => Order.createOrder(user.cart.items, req.user._id))
    .then(() => user.clearCart())
    .then(() => res.redirect("/orders"))
    .catch((err) => handleError(res, err));
};
