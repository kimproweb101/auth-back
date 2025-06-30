const Sequelize = require("sequelize");

class OrderDetail extends Sequelize.Model {
  static initiate(sequelize) {
    OrderDetail.init(
      {
        orderId: { type: Sequelize.INTEGER, allowNull: false },
        productId: { type: Sequelize.INTEGER, allowNull: false },
        quantity: { type: Sequelize.INTEGER, allowNull: false },
        price: { type: Sequelize.INTEGER, allowNull: false },
      },
      {
        sequelize,
        modelName: "OrderDetail",
        tableName: "order_details",
        timestamps: true,
        paranoid: true,
      }
    );
  }

  static associate(db) {
    OrderDetail.belongsTo(db.Order, { foreignKey: "orderId" });
    OrderDetail.belongsTo(db.Product, { foreignKey: "productId" });
  }
}

module.exports = OrderDetail;
