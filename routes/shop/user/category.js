const express = require("express");
const router = express.Router();
const { getCategories } = require("../../../controllers/shop/user/category");

router.get("/", getCategories);

module.exports = router;
