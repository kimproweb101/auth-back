const express = require("express");
const router = express.Router();
const { getOrders } = require("../../../controllers/shop/admin/order");
const { isLoggedIn, isAdmin } = require("../../../middlewares");

router.get("/", isLoggedIn, isAdmin, getOrders);

module.exports = router;
