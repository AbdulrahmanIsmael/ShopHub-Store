const { body } = require("express-validator");

const addProductValidator = [
  body("productName", "Please enter a valid Product Name!")
    .notEmpty()
    .isString()
    .isLength({ min: 2 })
    .trim(),
  body("productQuantity", "Please enter the Product Quantity!")
    .notEmpty()
    .custom((value) => +value > 0)
    .trim(),
  body("productPrice", "Please enter a valid price!")
    .notEmpty()
    .isFloat()
    .trim(),
];

module.exports = { addProductValidator };
