const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const { isLoggedIn } = require("../middlewares");

const {
  createBoard,
  getBoards,
  getBoard,
  updateBoard,
  deleteBoard,
  downloadBoard,
} = require("../controllers/board");

const router = express.Router();

router.use(
  "/uploads",
  isLoggedIn,
  express.static(path.join(__dirname, "uploads"))
);

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

try {
  fs.readdirSync("uploads");
} catch (error) {
  console.error("uploads 폴더가 없어 uploads 폴더를 생성합니다.");
  fs.mkdirSync("uploads");
}

router.post("/", isLoggedIn, upload.single("file"), createBoard);

// GET /boards/
// router.get("/", isLoggedIn, getBoards);
router.get("/", getBoards);

// GET /boards/:bid/:id
router.get("/:id", getBoard);

router.get("/download/:id", isLoggedIn, downloadBoard);

// PATCH /board/update
router.patch("/:id", isLoggedIn, upload.single("file"), updateBoard);

// PATCH /board/delete
router.delete("/:id", isLoggedIn, deleteBoard);

module.exports = router;
