const { Order, OrderDetail } = require("../../../models");

exports.createOrder = async (req, res) => {
  try {
    const { items, totalPrice } = req.body;

    // 유효성 검사
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "주문 항목(items)을 하나 이상 포함해야 합니다.",
      });
    }

    if (totalPrice === undefined || isNaN(totalPrice) || totalPrice < 0) {
      return res.status(400).json({
        success: false,
        message: "유효한 총 금액(totalPrice)을 입력해주세요.",
      });
    }

    for (const [index, item] of items.entries()) {
      if (
        !item.productId ||
        isNaN(item.productId) ||
        !item.quantity ||
        isNaN(item.quantity) ||
        item.quantity <= 0 ||
        item.price === undefined ||
        isNaN(item.price) ||
        item.price < 0
      ) {
        return res.status(400).json({
          success: false,
          message: `items[${index}] 항목의 productId, quantity, price 값이 유효하지 않습니다.`,
        });
      }
    }

    const order = await Order.create({
      userId: req.user.id,
      totalPrice,
    });

    for (const item of items) {
      await OrderDetail.create({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      });
    }

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "주문 실패",
      error: err.message,
    });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "인증된 사용자만 주문 내역을 조회할 수 있습니다.",
      });
    }

    const orders = await Order.findAll({
      where: { userId: req.user.id },
      include: ["OrderDetails"], // 모델 관계에 정의되어 있어야 함
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "주문 조회 실패",
      error: err.message,
    });
  }
};
