const User = require("../models/user");

exports.getLogin = (req, res) => {
  res.render("auth/login", {
    title: "Login",
  });
};

exports.getSignup = (req, res) => {
  res.render("auth/signup", {
    title: "Signup",
  });
};

exports.postSignup = (req, res) => {
  const { email, password, confirmPassword } = req.body;

  User.findOne({ email })
    .then((existingUser) => {
      if (existingUser) {
        console.log("User already exists with that email");
        return res.redirect("/login");
      }

      if (password === confirmPassword) {
        User.addNewUser(email, password)
          .then(() => {
            console.log("Created new user!");
            return res.redirect("/login");
          })
          .catch((err) => console.log(err));
      } else {
        console.log("Password don't match!");
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
        console.log("User not found!");
        return res.redirect("/login");
      }
      return user.verifyPassword(password).then((doMatch) => {
        if (!doMatch) {
          console.log("Invalid Password!");
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
