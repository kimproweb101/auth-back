const { Category } = require("../../../models");
const { Op } = require("sequelize");

exports.createCategory = async (req, res) => {
  try {
    const { name, parentId } = req.body;
    const category = await Category.create({ name, parentId });
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "생성 실패", error: err.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.findAndCountAll({
      include: [{ model: Category, as: "Children" }],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      total: categories.count,
      data: categories.rows,
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "조회 실패", error: err.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const id = req.params.id;
    const { name, parentId } = req.body;
    const category = await Category.findByPk(id);
    if (!category)
      return res.status(404).json({ success: false, message: "카테고리 없음" });

    await category.update({ name, parentId });
    res.status(200).json({ success: true, data: category });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "수정 실패", error: err.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const id = req.params.id;
    const category = await Category.findByPk(id);
    if (!category)
      return res.status(404).json({ success: false, message: "카테고리 없음" });

    await category.destroy();
    res.status(200).json({ success: true, message: "삭제됨" });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "삭제 실패", error: err.message });
  }
};
