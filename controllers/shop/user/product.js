const { Product } = require("../../../models");
const { Op } = require("sequelize");

exports.getProducts = async (req, res) => {
  try {
    let { page = 1, limit = 10 } = req.query;

    // 숫자로 변환
    page = parseInt(page);
    limit = parseInt(limit);

    if (isNaN(page) || page < 1) {
      return res.status(400).json({
        success: false,
        message: "page는 1 이상의 숫자여야 합니다.",
      });
    }

    if (isNaN(limit) || limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        message: "limit은 1~100 사이의 숫자여야 합니다.",
      });
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Product.findAndCountAll({
      offset,
      limit,
      order: [["createdAt", "DESC"]], // 최신순
    });

    res.status(200).json({
      success: true,
      total: count,
      page,
      limit,
      data: rows,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "상품 조회 실패",
      error: err.message,
    });
  }
};

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
