import { sendgridApiKey, port } from "../config/env.js";

import { validationResult } from "express-validator";
import { randomBytes } from "crypto";
import { createTransport } from "nodemailer";
import { hash } from "bcryptjs";

import User from "../models/user.js";

const transporter = createTransport({
  host: "smtp.sendgrid.net",
  port: 587,
  auth: {
    user: "apikey",
    pass: sendgridApiKey,
  },
});

export const getLogin = (req, res) => {
  res.render("auth/login", {
    title: "Login",
    errorMessage: req.flash("error"),
    oldInputs: {
      email: "",
      password: "",
    },
    validationErrors: [],
  });
};

export const getSignup = (req, res) => {
  res.render("auth/signup", {
    title: "Signup",
    errorMessage: req.flash("error"),
    oldInput: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationErrors: [],
  });
};

export const getReset = (req, res) => {
  res.render("auth/reset", {
    title: "Reset Password",
    errorMessage: req.flash("error"),
  });
};

export const postSignup = (req, res) => {
  const { email, password, confirmPassword } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("auth/signup", {
      title: "Signup",
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email,
        password,
        confirmPassword,
      },
      validationErrors: errors.array().map((e) => e.path),
    });
  }

  const user = new User({
    email: email,
    password: password,
    cart: { items: [] },
  });
  user
    .addNewUser()
    .then(() => {
      console.log("Created new user!");
      res.redirect("/login");
      return transporter.sendMail({
        to: email,
        from: "abdulrahmanismael2023@gmail.com",
        subject: "Welcome to ShopHub!",
        html: "<h1>Hello and Welcome, you are signed up successfully!</h1>",
      });
    })
    .catch((err) => console.log(err));
};

export const postLogin = (req, res) => {
  const { email, password } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login", {
      title: "Login",
      errorMessage: errors.array()[0].msg,
      oldInputs: { email, password },
      validationErrors: errors.array().map((e) => e.path),
    });
  }

  User.findOne({ email })
    .then((user) => {
      if (!user) {
        return res.status(422).render("auth/login", {
          title: "Login",
          errorMessage: "Invalid Email or password!",
          oldInputs: { email, password },
          validationErrors: ["email"],
        });
      }
      return user.verifyPassword(password).then((doMatch) => {
        if (!doMatch) {
          return res.status(422).render("auth/login", {
            title: "Login",
            errorMessage: "Invalid Password!",
            oldInputs: { email, password },
            validationErrors: ["password"],
          });
        }
        req.session.isLoggedIn = true;
        req.session.userId = user._id.toString();
        return req.session.save((err) => {
          if (err) console.log(err);
          res.redirect(err ? "/login" : "/");
        });
      });
    })
    .catch((err) => {
      console.log(err);
      req.flash("error", "Something went wrong!");
      res.redirect("/login");
    });
};

export const postLogout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error while logging out.");
    }
    res.redirect("/");
  });
};

export const postReset = (req, res) => {
  const email = req.body.email;

  randomBytes(32, (err, buffer) => {
    if (err) {
      req.flash("error", "Something went wrong! Please try again later.");
      return res.redirect("/reset");
    }
    const token = buffer.toString("hex");
    User.findOne({ email })
      .then((user) => {
        if (!user) {
          req.flash("error", "No account with that email");
          return res.redirect("/reset");
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user
          .save()
          .then(() => {
            res.redirect("/");
            return transporter.sendMail({
              to: email,
              from: "abdulrahmanismael2023@gmail.com",
              subject: "Password Reset Request",
              html: `
          <p>We heard you lost your password, sorry to hear that!</p>
          <p><a href="http://localhost:${port}/reset/${token}">Click link</a> to reset your password.</p>
          `,
            });
          })
          .catch((err) => {
            console.log(err);
            req.flash("err", "Something went wrong! Please try again later.");
            res.redirect("/reset");
          });
      })
      .catch((err) => {
        console.log(err);
        req.flash("err", "Something went wrong! Please try again later.");
        res.redirect("/reset");
      });
  });
};

export const getNewPassword = (req, res) => {
  const token = req.params.token;

  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then((user) => {
      if (!user) {
        req.flash("error", "Invalid or expired reset token.");
        return res.redirect("/reset");
      }
      res.render("auth/new-password", {
        title: "New Password",
        userId: user._id.toString(),
        errorMessage: req.flash("error"),
        passwordToken: token,
      });
    })
    .catch((err) => {
      console.log(err);
      req.flash("error", "Invalid or expired reset token.");
      return res.redirect("/reset");
    });
};

export const postNewPassword = (req, res) => {
  const { password, confirmPassword, userId, passwordToken } = req.body;
  if (!password || !confirmPassword) {
    req.flash("error", "All fields are required!");
    return res.redirect(`/reset/${passwordToken}`);
  }

  if (password !== confirmPassword) {
    req.flash("error", "Passwords don't match!");
    return res.redirect(`/reset/${passwordToken}`);
  }

  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId,
  })
    .then((user) => {
      if (!user) {
        req.flash("error", "Invalid or expired reset token.");
        return res.redirect("/reset");
      }
      hash(password, 12)
        .then((hashedPassword) => {
          user.password = hashedPassword;
          user.resetToken = undefined;
          user.resetTokenExpiration = undefined;
          return user.save();
        })
        .then(() => {
          console.log("Password reset successfully!");
          res.redirect("/login");
        })
        .catch((err) => {
          console.log(err);
          req.flash("error", "Something went wrong! Please try again later.");
          res.redirect("/reset");
        });
    })
    .catch((err) => {
      console.log(err);
      req.flash("error", "Invalid or expired reset token.");
      return res.redirect("/reset");
    });
};
