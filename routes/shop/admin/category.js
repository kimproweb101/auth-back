const express = require("express");
const router = express.Router();
const {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} = require("../../../controllers/shop/admin/category");
const { isLoggedIn, isAdmin } = require("../../../middlewares");

router.post("/", isLoggedIn, isAdmin, createCategory);
router.get("/", isLoggedIn, isAdmin, getCategories);
router.patch("/:id", isLoggedIn, isAdmin, updateCategory);
router.delete("/:id", isLoggedIn, isAdmin, deleteCategory);

module.exports = router;
