const User = require("../models/user");

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
            return res.redirect("/login");
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
