const express = require("express");
const router = express.Router();
const {
  getCart,
  addToCart,
  removeFromCart,
  decreaseCartItem,
  clearCart,
  removeByProductId,
  updateCartQuantity,
  bulkUpdateCart,
} = require("../../../controllers/shop/user/cart");
const { isLoggedIn } = require("../../../middlewares");

router.get("/", isLoggedIn, getCart);
router.post("/", isLoggedIn, addToCart);
router.delete("/", isLoggedIn, removeFromCart);
router.post("/decrease", isLoggedIn, decreaseCartItem);
router.delete("/clear", isLoggedIn, clearCart);
router.delete("/remove-by-product/:productId", isLoggedIn, removeByProductId);
router.patch("/update:productId", isLoggedIn, updateCartQuantity);
router.patch("/bulk", isLoggedIn, bulkUpdateCart);

module.exports = router;
