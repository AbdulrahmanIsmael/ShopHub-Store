import { port, mongodbUri, sessionSecret } from "./config/env.js";

import express from "express";
import process from "process";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

import csrf from "@dr.pogodin/csurf";

import session from "express-session";
import connectMongoDBSession from "connect-mongodb-session";
import flash from "connect-flash";

import mongoose from "mongoose";

import User from "./models/user.js";

import adminRouter from "./routes/admin.js";
import productsRouter from "./routes/products.js";
import shopRouter from "./routes/shop.js";
import authRouter from "./routes/auth.js";

import { getErrorPage } from "./controllers/error.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isRunDirectly = import.meta.url === pathToFileURL(process.argv[1]).href;

const MongoDbSession = connectMongoDBSession(session);

// initialize session store for MongoDB
const store = new MongoDbSession({
  uri: mongodbUri,
  databaseName: "shop", // used in case db name not in the uri string
  collection: "sessions",
});
// getting csrf middleware for configuring csrf
const csrfProtection = csrf.default ? csrf.default() : csrf();

// EJS configuration
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Request body parsers
app.use(express.urlencoded({ extended: true }));
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
if (!isRunDirectly) {
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
app.use(getErrorPage);

// Local development only.
if (isRunDirectly) {
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
export default app;
