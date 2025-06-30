const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProductById,
} = require("../../../controllers/shop/user/product");

router.get("/", getProducts);
router.get("/:id", getProductById);

module.exports = router;
