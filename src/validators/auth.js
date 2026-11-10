import { body } from "express-validator";

import User from "../models/user.js";

export const signupValidator = [
  body("email", "Please enter a valid email address.")
    .trim()
    .normalizeEmail()
    .isEmail()
    .custom((value) => {
      return User.findOne({ email: value }).then((existingUser) => {
        if (existingUser)
          return Promise.reject("Email address already existed!");
      });
    })
    .withMessage("Email address already existed!"),
  body(
    "password",
    "Please enter a valid password with only alphanumeric characters and at least 6 characters long!",
  )
    .trim()
    .isAlphanumeric()
    .isLength({ min: 6 }),
  body("confirmPassword", "Password has to be matched.")
    .trim()
    .custom((value, { req }) => {
      return value === req.body.password;
    }),
];

export const loginValidator = [
  body("email")
    .trim()
    .normalizeEmail()
    .notEmpty()
    .withMessage("Please don't leave email field empty!"),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Please don't leave password field empty!")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters!")
    .isAlphanumeric()
    .withMessage("Invalid password, please try again!"),
];
