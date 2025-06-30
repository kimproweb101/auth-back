const { Order } = require("../../../models");

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.findAll();
    res.status(200).json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: "주문 조회 실패", error: err.message });
  }
};
