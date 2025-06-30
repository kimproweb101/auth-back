const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const { isLoggedIn } = require("../middlewares");

const {
  getCommentTree,
  createComment,
  updateComment,
  deleteComment,
} = require("../controllers/comment");

const router = express.Router();

router.post("/:id", isLoggedIn, createComment);
router.put("/:commentId", isLoggedIn, updateComment);
router.delete("/:commentId", isLoggedIn, deleteComment);
router.get("/board/:boardId", getCommentTree);

module.exports = router;
