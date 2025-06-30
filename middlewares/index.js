const { User } = require("../models");

exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(403).json({ success: false, message: "로그인 후 이용해주세요" });
  }
};

exports.isNotLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    next();
  } else {
    res.status(400).json({ success: false, message: "로그인한 상태입니다." });
  }
};

exports.isAdmin = async (req, res, next) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(403).json({ success: false, message: "로그인 필요" });
    }
    if (req.user?.email === "kimcannon101@gmail.com") {
      return next();
    } else {
      return res.status(403).json({ success: false, message: "관리자 권한 필요" });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: "관리자 검증 실패" });
  }
};
