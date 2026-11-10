import { Schema, model } from "mongoose";

import Product from "./product.js";

const orderSchema = new Schema({
  products: [
    {
      title: { type: String, required: true },
      price: { type: Number, required: true },
      description: String,
      imageUrl: String,
      quantity: { type: Number, required: true },
    },
  ],
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: String,
  },
});

orderSchema.statics.createOrder = function (cartItems, userId) {
  const productIds = cartItems.map((item) => item.productId);
  if (!productIds.length) return Promise.reject("No Products included!");

  return Product.find({ _id: { $in: productIds } })
    .select("title price description imageUrl")
    .then((products) => {
      const orderItems = products.map((product) => ({
        ...product.toObject(),
        quantity: cartItems.find((item) => {
          const itemProdId = item.productId._id || item.productId;
          return itemProdId.toString() === product._id.toString();
        })?.quantity,
      }));

      return new this({
        products: orderItems,
        userId,
        createdAt: new Date().toISOString(),
      }).save();
    })
    .then(() => console.log("Order created!"))
    .catch((err) => console.log(err));
};

const Order = model("Order", orderSchema);

export default Order;
