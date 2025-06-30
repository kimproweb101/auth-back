const Sequelize = require("sequelize");

class Product extends Sequelize.Model {
  static initiate(sequelize) {
    Product.init(
      {
        name: { type: Sequelize.STRING(100), allowNull: false },
        price: { type: Sequelize.INTEGER, allowNull: false },
        stock: { type: Sequelize.INTEGER, allowNull: false },
        categoryId: { type: Sequelize.INTEGER, allowNull: false },
      },
      {
        sequelize,
        modelName: "Product",
        tableName: "products",
        timestamps: true,
        paranoid: true,
      }
    );
  }

  static associate(db) {
    Product.belongsTo(db.Category, { foreignKey: "categoryId", as: "Category" });
  }
}

module.exports = Product;
