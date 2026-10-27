const { Schema, model } = require("mongoose");
const { hash, compare } = require("bcryptjs");

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  resetToken: String,
  resetTokenExpiration: Date,
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
  },
});

userSchema.methods.addToCart = function (productId) {
  const updatedCart = { items: [...this.cart.items] };

  const productIndex = updatedCart.items.findIndex(
    (item) => item.productId.toString() === productId.toString(),
  );

  // if existed, increase quantity, if not, add it
  if (productIndex >= 0) {
    updatedCart.items[productIndex].quantity =
      +updatedCart.items[productIndex].quantity + 1;
  } else {
    updatedCart.items.push({
      productId: productId,
      quantity: 1,
    });
  }

  this.cart = updatedCart;

  return this.save()
    .then(() => console.log("Cart has been updated!"))
    .catch((err) => console.log(err));
};

userSchema.methods.getCart = function () {
  return this.populate("cart.items.productId", "-_id -userId -__v")
    .then((user) => {
      return user.cart.items.map((item) => ({
        ...item.productId.toObject(),
        quantity: item.quantity,
        _id: item._id,
      }));
    })
    .catch((err) => console.log(err));
};

userSchema.methods.removeItemFromCart = function (productId) {
  const updatedCart = {
    items: this.cart.items.filter(
      (item) => item._id.toString() !== productId.toString(),
    ),
  };
  this.cart = updatedCart;

  return this.save()
    .then(() => console.log("Removed item from cart"))
    .catch((err) => console.log(err));
};

userSchema.methods.clearCart = function () {
  this.cart.items = [];

  return this.save()
    .then(() => console.log("Cart has been cleared"))
    .catch((err) => console.log(err));
};

userSchema.methods.verifyPassword = function (password) {
  return compare(password, this.password);
};

userSchema.methods.addNewUser = function () {
  return hash(this.password, 12).then((hashedPassword) => {
    this.password = hashedPassword;
    return this.save();
  });
};

const User = model("User", userSchema);

module.exports = User;
