const { Category } = require("../../../models");

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { parentId: null },
      include: {
        model: Category,
        as: "Children",
        include: {
          model: Category,
          as: "Children",
          include: {
            model: Category,
            as: "Children"
          }
        }
      }
    });
    res.status(200).json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, message: "카테고리 조회 실패", error: err.message });
  }
};
