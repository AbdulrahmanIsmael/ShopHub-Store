import express from "express";

import {
  getLogin,
  getNewPassword,
  getReset,
  getSignup,
  postLogin,
  postSignup,
  postLogout,
  postNewPassword,
  postReset,
} from "../controllers/auth.js";

import { signupValidator, loginValidator } from "../validators/auth.js";

const router = express.Router();

router.get("/login", getLogin);
router.get("/signup", getSignup);
router.get("/reset", getReset);
router.get("/reset/:token", getNewPassword);

router.post("/login", loginValidator, postLogin);
router.post("/signup", signupValidator, postSignup);
router.post("/logout", postLogout);
router.post("/reset", postReset);
router.post("/new-password", postNewPassword);

export default router;
