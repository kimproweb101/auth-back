const Sequelize = require("sequelize");

class Cart extends Sequelize.Model {
  static initiate(sequelize) {
    Cart.init(
      {
        userId: { type: Sequelize.INTEGER, allowNull: false },
        productId: { type: Sequelize.INTEGER, allowNull: false },
        quantity: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 1,
        },
      },
      {
        sequelize,
        modelName: "Cart",
        tableName: "carts",
        timestamps: true,
        paranoid: true,
        indexes: [
          {
            unique: true,
            fields: ["userId", "productId"],
          },
        ],
      }
    );
  }

  static associate(db) {
    Cart.belongsTo(db.User, { foreignKey: "userId" });
    Cart.belongsTo(db.Product, { foreignKey: "productId" });
  }
}

module.exports = Cart;
