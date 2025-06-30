const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const { isLoggedIn } = require("../middlewares");

const router = express.Router();

// uploads 폴더 static 제공
router.use(
  "/uploads",
  isLoggedIn,
  express.static(path.join(__dirname, "uploads"))
);

// Multer 저장 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// 라우트: 파일 하나 업로드
router.post("/upload", upload.single("file"), (req, res) => {
  res.json({
    message: "파일 업로드 성공",
    filePath: `/uploads/${req.file.filename}`,
  });
});

module.exports = router;
