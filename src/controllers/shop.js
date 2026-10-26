const Product = require("../models/product");
const Order = require("../models/order");

const { handleError } = require("../utils/errorHandler");

// get the main page
exports.getHome = (req, res) => {
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
exports.getCart = (req, res) => {
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
exports.getOrders = (req, res) => {
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
exports.postCart = (req, res) => {
  const user = req.user;
  const productId = req.body.productId;

  user
    .addToCart(productId)
    .then(() => res.redirect("/cart"))
    .catch((err) => handleError(res, err));
};

exports.postRemoveFromCart = (req, res) => {
  const user = req.user;
  user
    .removeItemFromCart(req.body.productId)
    .then(() => res.redirect("/cart"))
    .catch((err) => handleError(res, err));
};

// post new order
exports.postOrder = (req, res) => {
  const user = req.user;
  user
    .populate("cart.items.productId")
    .then((user) => Order.createOrder(user.cart.items, req.user._id))
    .then(() => user.clearCart())
    .then(() => res.redirect("/orders"))
    .catch((err) => handleError(res, err));
};
