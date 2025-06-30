const Sequelize = require("sequelize");

class Order extends Sequelize.Model {
  static initiate(sequelize) {
    Order.init(
      {
        userId: { type: Sequelize.INTEGER, allowNull: false },
        totalPrice: { type: Sequelize.INTEGER, allowNull: false },
        status: {
          type: Sequelize.ENUM("pending", "paid", "shipped", "delivered", "cancelled"),
          allowNull: false,
          defaultValue: "pending",
        },
      },
      {
        sequelize,
        modelName: "Order",
        tableName: "orders",
        timestamps: true,
        paranoid: true,
      }
    );
  }

  static associate(db) {
    Order.belongsTo(db.User, { foreignKey: "userId" });
    Order.hasMany(db.OrderDetail, { foreignKey: "orderId" });
  }
}

module.exports = Order;
