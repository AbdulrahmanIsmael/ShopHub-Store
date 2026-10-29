const { body } = require("express-validator");

const User = require("../models/user");

const signupValidator = [
  body("email", "Please enter a valid email address.")
    .trim()
    .isEmail()
    .custom((value) => {
      return User.findOne({ email: value }).then((existingUser) => {
        if (existingUser)
          return Promise.reject("Email address already existed!");
      });
    }),
  body(
    "password",
    "Please enter a valid password with only alphanumeric characters and at least 6 characters long!",
  )
    .trim()
    .isAlphanumeric()
    .isLength({ min: 6 }),
  body("confirmPassword", "Password has to be matched.").custom(
    (value, { req }) => {
      return value === req.body.password ? true : false;
    },
  ),
];

const loginValidator = [
  body("email").notEmpty().withMessage("Please don't leave email field empty!"),
  body("password", "Invalid Password, Please try again!")
    .notEmpty()
    .withMessage("Please don't leave password field empty!")
    .isLength({ min: 6 })
    .isAlphanumeric(),
];

module.exports = {
  signupValidator,
  loginValidator,
};
