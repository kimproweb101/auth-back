const express = require("express");
const router = express.Router();
const {
  createProduct,
  getProductById,
  getProducts,
  updateProduct,
  deleteProduct,
} = require("../../../controllers/shop/admin/product");

const { isLoggedIn, isAdmin } = require("../../../middlewares");

router.post("/", isLoggedIn, isAdmin, createProduct);
router.get("/", isLoggedIn, isAdmin, getProducts);
router.get("/:id", isLoggedIn, isAdmin, getProductById);
router.patch("/:id", isLoggedIn, isAdmin, updateProduct);
router.delete("/", isLoggedIn, isAdmin, deleteProduct);

module.exports = router;
