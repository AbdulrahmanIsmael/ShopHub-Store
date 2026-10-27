const { sendgridApiKey, port } = require("../config/env");

const { randomBytes } = require("crypto");
const { createTransport } = require("nodemailer");
const { hash } = require("bcryptjs");

const User = require("../models/user");

const transporter = createTransport({
  host: "smtp.sendgrid.net",
  port: 587,
  auth: {
    user: "apikey",
    pass: sendgridApiKey,
  },
});

exports.getLogin = (req, res) => {
  res.render("auth/login", {
    title: "Login",
    errorMessage: req.flash("error"),
  });
};

exports.getSignup = (req, res) => {
  res.render("auth/signup", {
    title: "Signup",
    errorMessage: req.flash("error"),
  });
};

exports.getReset = (req, res) => {
  res.render("auth/reset", {
    title: "Reset Password",
    errorMessage: req.flash("error"),
  });
};

exports.postSignup = (req, res) => {
  const { email, password, confirmPassword } = req.body;

  User.findOne({ email })
    .then((existingUser) => {
      if (existingUser) {
        req.flash("error", "User already exists with that email");
        return res.redirect("/login");
      }

      if (password === confirmPassword) {
        const user = new User({ email, password, cart: { items: [] } });
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
      } else {
        req.flash("error", "Password don't match!");
        return res.redirect("/signup");
      }
    })
    .catch((err) => console.log(err));
};

exports.postLogin = (req, res) => {
  const { email, password } = req.body;

  User.findOne({ email })
    .then((user) => {
      if (!user) {
        req.flash("error", "User not found!");
        return res.redirect("/login");
      }
      return user.verifyPassword(password).then((doMatch) => {
        if (!doMatch) {
          req.flash("error", "Invalid Password!");
          return res.redirect("/login");
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

exports.postLogout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error while logging out.");
    }
    res.redirect("/");
  });
};

exports.postReset = (req, res) => {
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

exports.getNewPassword = (req, res) => {
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

exports.postNewPassword = (req, res) => {
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
