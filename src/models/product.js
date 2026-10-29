const { Schema, model } = require("mongoose");

const productSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  description: String,
  imageUrl: String,

  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const Product = model("Product", productSchema);

module.exports = Product;
