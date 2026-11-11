import { Schema, model } from "mongoose";
import { hash, compare } from "bcryptjs";

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

userSchema.methods.addToCart = async function (productId) {
  try {
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

    await this.save();
    console.log("Cart has been updated!");
  } catch (err) {
    console.error(err);
  }
};

userSchema.methods.getCart = async function () {
  try {
    const user = await this.populate(
      "cart.items.productId",
      "-_id -userId -__v",
    );

    return user.cart.items.map((item) => ({
      ...item.productId.toObject(),
      quantity: item.quantity,
      _id: item._id,
    }));
  } catch (err) {
    console.error(err);
  }
};

userSchema.methods.removeItemFromCart = async function (productId) {
  try {
    const updatedCart = {
      items: this.cart.items.filter(
        (item) => item._id.toString() !== productId.toString(),
      ),
    };
    this.cart = updatedCart;

    await this.save();
    console.log("Removed item from cart");
  } catch (err) {
    console.error(err);
  }
};

userSchema.methods.clearCart = async function () {
  try {
    this.cart.items = [];

    await this.save();
    console.log("Cart has been cleared");
  } catch (err) {
    console.error(err);
  }
};

userSchema.methods.verifyPassword = function (password) {
  return compare(password, this.password);
};

userSchema.methods.addNewUser = async function () {
  try {
    const hashedPassword = await hash(this.password, 12);
    this.password = hashedPassword;

    await this.save();
    console.log("New user added!");
  } catch (err) {
    console.error(err);
  }
};

const User = model("User", userSchema);

export default User;
