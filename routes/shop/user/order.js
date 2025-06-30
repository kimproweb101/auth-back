const express = require("express");
const router = express.Router();
const {
  createOrder,
  getMyOrders,
} = require("../../../controllers/shop/user/order");
const { isLoggedIn } = require("../../../middlewares");

router.post("/", isLoggedIn, createOrder);
router.get("/", isLoggedIn, getMyOrders);

module.exports = router;
