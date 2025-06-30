const express = require("express");
const passport = require("passport");

const { isLoggedIn, isNotLoggedIn } = require("../middlewares");
const {
  join,
  login,
  logout,
  loadUser,
  confirmPw,
  accountUpdate,
  accountPasswordUpdate,
  accountResetPasswordWithEmail,
  accountResetPasswordWithEmailConfirm,
} = require("../controllers/auth");

const router = express.Router();

// POST /auth/login/email
router.post("/login/email", isNotLoggedIn, login);

// POST /auth/loaduser
router.get("/loadUser", isLoggedIn, loadUser);

// POST /auth/join
router.post("/join", isNotLoggedIn, join);

// patch auth/account
router.patch("/account", isLoggedIn, accountUpdate);

// patch auth/account/password
router.patch("/account/password", isLoggedIn, accountPasswordUpdate);

// auth/account/resetPasswordWithEmail
router.post(
  "/account/resetPasswordWithEmail",
  isNotLoggedIn,
  accountResetPasswordWithEmail
);

// auth/account/resetPasswordWithEmailConfirm
router.post(
  "/account/resetPasswordWithEmailConfirm",
  isNotLoggedIn,
  accountResetPasswordWithEmailConfirm
);

// POST /auth/confirm
router.post("/confirmPw", isLoggedIn, confirmPw);

// GET /auth/logout
router.get("/logout", isLoggedIn, logout);

// GET /auth/kakao
router.get("/kakao", passport.authenticate("kakao"));

// GET /auth/kakao/callback
router.get(
  "/kakao/callback",
  passport.authenticate("kakao", {
    failureRedirect: `${process.env.FRONT_URL}/error`,
  }),
  (req, res) => {
    res.redirect(`${process.env.FRONT_URL}`); // 성공 시에는 /로 이동
  }
);

// GET /auth/naver
router.get("/naver", passport.authenticate("naver"));

// GET /auth/naver/callback
router.get(
  "/naver/callback",
  passport.authenticate("naver", {
    failureRedirect: `${process.env.FRONT_URL}/error`,
  }),
  (req, res) => {
    res.redirect(`${process.env.FRONT_URL}`); // 성공 시에는 /로 이동
  }
);

module.exports = router;
