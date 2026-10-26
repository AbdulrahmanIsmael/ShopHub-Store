const { port, mongodbUri, sessionSecret } = require("./config/env");

const express = require("express");
const path = require("path");

const csrf = require("@dr.pogodin/csurf").default;

const session = require("express-session");
const MongoDBSession = require("connect-mongodb-session")(session);
const flash = require("connect-flash");

const mongoose = require("mongoose");

const User = require("./models/user");

const adminRouter = require("./routes/admin");
const productsRouter = require("./routes/products");
const shopRouter = require("./routes/shop");
const authRouter = require("./routes/auth");

const errorController = require("./controllers/error");

const app = express();

// initialize session store for MongoDB
const store = new MongoDBSession({
  uri: mongodbUri,
  databaseName: "shop", // used in case db name not in the uri string
  collection: "sessions",
});
// getting csrf middleware for configuring csrf
const csrfProtection = csrf();

// EJS configuration
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Request body parsers
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(express.static(path.join(__dirname, "..", "public")));

// initiale express session middleware
app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: store, // changing store from the default (memory) to the database using connect-mongodb-session package
  }),
);
// using csrf protection middleware
app.use(csrfProtection);
// initialize flash session
app.use(flash());

app.use((req, res, next) => {
  const userId = req.session.userId;
  if (!userId) {
    return next();
  }
  User.findById(userId)
    .then((user) => {
      req.user = user;
      return next();
    })
    .catch((err) => {
      console.log("Error: ", err);
      res.status(500).send("Internal Server Error!");
    });
});

// production middleware - not running on local dev
if (require.main !== module) {
  app.use((req, res, next) => {
    // connect to mongoose database
    mongoose
      .connect(mongodbUri)
      .then(() => {
        console.log("Connected to MongoDB");
        next();
      })
      .catch((err) => {
        console.error("Failed to connect to MongoDB:", err);
        res.status(500).send("Server error");
      });
  });
}

app.use((req, res, next) => {
  res.locals.isAuth = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();

  next();
});
// Routes
app.use("/admin", adminRouter);
app.use(productsRouter);
app.use(shopRouter);
app.use(authRouter);

// 404 handler
app.use(errorController.getErrorPage);

// Local development only.
if (require.main === module) {
  mongoose
    .connect(mongodbUri, {
      dbName: "shop",
    })
    .then(() => {
      app.listen(port, "0.0.0.0", () => {
        console.log(`Server is running on port ${port}`);
        console.log(`http://localhost:${port}`);
      });
    })
    .catch((err) => {
      console.error("Failed to connect to MongoDB:", err);
      process.exit(1);
    });
}

// Required for Vercel
module.exports = app;
