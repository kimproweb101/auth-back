const Sequelize = require("sequelize");

class Category extends Sequelize.Model {
  static initiate(sequelize) {
    Category.init(
      {
        name: { type: Sequelize.STRING(100), allowNull: false },
        parentId: { type: Sequelize.INTEGER, allowNull: true },
      },
      {
        sequelize,
        modelName: "Category",
        tableName: "categories",
        timestamps: true,
        paranoid: true,
      }
    );
  }

  static associate(db) {
    Category.belongsTo(db.Category, { as: "Parent", foreignKey: "parentId" });
    Category.hasMany(db.Category, { as: "Children", foreignKey: "parentId" });
  }
}

module.exports = Category;
