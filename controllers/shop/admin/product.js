const { Product, Category } = require("../../../models");
const { Op } = require("sequelize");

exports.createProduct = async (req, res) => {
  try {
    const { name, price, stock, categoryId } = req.body;

    // 유효성 검사
    if (!name || typeof name !== "string" || name.trim() === "") {
      return res
        .status(400)
        .json({ success: false, message: "상품명을 입력해주세요." });
    }

    if (price === undefined || isNaN(price) || price < 0) {
      return res
        .status(400)
        .json({ success: false, message: "유효한 가격을 입력해주세요." });
    }

    if (stock === undefined || isNaN(stock) || stock < 0) {
      return res
        .status(400)
        .json({ success: false, message: "유효한 재고 수량을 입력해주세요." });
    }

    if (!categoryId || isNaN(categoryId)) {
      return res
        .status(400)
        .json({ success: false, message: "카테고리 ID가 유효하지 않습니다." });
    }

    const product = await Product.create({ name, price, stock, categoryId });

    res.status(201).json({ success: true, data: product });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "상품 생성 실패", error: err.message });
  }
};

exports.getProducts = async (req, res) => {
  try {
    let { page = 1, limit = 10, keyword = "" } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    // 유효성 검사
    if (!Number.isInteger(page) || page < 1) {
      return res
        .status(400)
        .json({ success: false, message: "page는 1 이상의 정수여야 합니다." });
    }

    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        message: "limit은 1~100 사이의 정수여야 합니다.",
      });
    }

    if (typeof keyword !== "string") {
      return res.status(400).json({
        success: false,
        message: "검색어(keyword)는 문자열이어야 합니다.",
      });
    }

    if (keyword.length > 100) {
      return res
        .status(400)
        .json({ success: false, message: "검색어는 100자 이내여야 합니다." });
    }

    const offset = (page - 1) * limit;

    const where = {};

    if (keyword && keyword.trim() !== "") {
      where.name = {
        [Op.like]: `%${keyword}%`,
      };
    }

    const { count, rows } = await Product.findAndCountAll({
      where, // <- keyword 있을 때만 조건 포함
      offset,
      limit,
      order: [["createdAt", "DESC"]],
    });

    const categories = await Category.findAndCountAll({
      include: [{ model: Category, as: "Children" }],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      total: count,
      page,
      limit,
      data: rows,
      cgData: categories,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "상품 조회 실패",
      error: err.message,
    });
  }
};

// controllers/shop/admin/product.js
exports.updateProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const { name, price, stock, categoryId } = req.body;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "상품 ID가 필요합니다." });
    }

    const product = await Product.findByPk(id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "상품을 찾을 수 없습니다." });
    }

    // 선택적으로 변경할 값만 업데이트
    if (name !== undefined) product.name = name;
    if (price !== undefined) {
      if (isNaN(price) || price < 0)
        return res
          .status(400)
          .json({ success: false, message: "유효한 가격을 입력해주세요." });
      product.price = price;
    }
    if (stock !== undefined) {
      if (isNaN(stock) || stock < 0)
        return res
          .status(400)
          .json({ success: false, message: "유효한 재고를 입력해주세요." });
      product.stock = stock;
    }
    if (categoryId !== undefined) product.categoryId = categoryId;

    await product.save();

    res.status(200).json({ success: true, data: product });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "상품 수정 실패", error: err.message });
  }
};

// controllers/shop/admin/product.js

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "상품 ID가 필요합니다." });
    }

    const product = await Product.findByPk(id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "상품을 찾을 수 없습니다." });
    }

    await product.destroy(); // 소프트 삭제 (paranoid: true)
    res.status(200).json({ success: true, message: "상품이 삭제되었습니다." });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "상품 삭제 실패", error: err.message });
  }
};

// controllers/shop/admin/product.js

exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res
        .status(400)
        .json({ success: false, message: "유효한 상품 ID가 필요합니다." });
    }

    const product = await Product.findByPk(id);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "상품을 찾을 수 없습니다." });
    }

    res.status(200).json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "상품 조회 실패",
      error: err.message,
    });
  }
};
