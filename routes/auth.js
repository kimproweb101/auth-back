const express = require('express');
const passport = require('passport');

const { isLoggedIn, isNotLoggedIn } = require('../middlewares');
const { join, login, logout, loadUser } = require('../controllers/auth');

const router = express.Router();


// POST /auth/loaduser
router.get('/loadUser', isLoggedIn, loadUser);

// POST /auth/join
router.post('/join', isNotLoggedIn, join); 

// POST /auth/login
router.post('/login', isNotLoggedIn, login);

// GET /auth/logout
router.get('/logout', isLoggedIn, logout);

// GET /auth/kakao
router.get('/kakao', passport.authenticate('kakao'));

// GET /auth/kakao/callback
router.get('/kakao/callback', passport.authenticate('kakao', {
  failureRedirect: 'http://localhost:8080/error',
}), (req, res) => {
  res.redirect('http://localhost:8080/main'); // 성공 시에는 /로 이동
});

// GET /auth/kakao
router.get('/naver', passport.authenticate('naver'));

// GET /auth/naver/callback
router.get('/naver/callback', passport.authenticate('naver', {
  failureRedirect: 'http://localhost:8080/error',
}), (req, res) => {
  res.redirect('http://localhost:8080/main'); // 성공 시에는 /로 이동
});

module.exports = router;
