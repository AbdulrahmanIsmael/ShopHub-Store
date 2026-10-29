const express = require("express");

const authController = require("../controllers/auth");

const { signupValidator, loginValidator } = require("../validators/auth");

const router = express.Router();

router.get("/login", authController.getLogin);
router.get("/signup", authController.getSignup);
router.get("/reset", authController.getReset);
router.get("/reset/:token", authController.getNewPassword);

router.post("/login", loginValidator, authController.postLogin);
router.post("/signup", signupValidator, authController.postSignup);
router.post("/logout", authController.postLogout);
router.post("/reset", authController.postReset);
router.post("/new-password", authController.postNewPassword);

module.exports = router;
