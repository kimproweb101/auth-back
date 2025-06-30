const { Cart, sequelize } = require("../../../models");

exports.getCart = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "인증된 사용자만 장바구니를 조회할 수 있습니다.",
      });
    }

    const cart = await Cart.findAll({ where: { userId: req.user.id } });
    res.status(200).json({ success: true, data: cart });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "장바구니 조회 실패",
      error: err.message,
    });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || isNaN(productId)) {
      return res.status(400).json({
        success: false,
        message: "유효한 productId를 입력해주세요.",
      });
    }

    if (!quantity || isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "수량(quantity)은 1 이상의 숫자여야 합니다.",
      });
    }

    // 기존에 동일 상품이 장바구니에 있는지 확인
    const existingItem = await Cart.findOne({
      where: {
        userId: req.user.id,
        productId,
      },
    });

    let updatedItem;

    if (existingItem) {
      // 수량만 증가
      existingItem.quantity += quantity;
      await existingItem.save();
      updatedItem = existingItem;
    } else {
      // 새로 추가
      updatedItem = await Cart.create({
        userId: req.user.id,
        productId,
        quantity,
      });
    }

    res.status(201).json({ success: true, data: updatedItem });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "장바구니 추가 실패",
      error: err.message,
    });
  }
};

exports.decreaseCartItem = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId || isNaN(productId)) {
      return res.status(400).json({
        success: false,
        message: "유효한 productId가 필요합니다.",
      });
    }

    const item = await Cart.findOne({
      where: {
        userId: req.user.id,
        productId,
      },
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "장바구니에 해당 상품이 없습니다.",
      });
    }

    if (item.quantity > 1) {
      item.quantity -= 1;
      await item.save();
      res.status(200).json({ success: true, data: item });
    } else {
      await item.destroy();
      res.status(200).json({
        success: true,
        message: "상품 수량이 1이라 삭제되었습니다.",
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "장바구니 수량 감소 실패",
      error: err.message,
    });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "유효한 장바구니 항목 ID(id)가 필요합니다.",
      });
    }

    const item = await Cart.findOne({
      where: { id, userId: req.user.id },
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "해당 장바구니 항목을 찾을 수 없습니다.",
      });
    }

    await item.destroy();
    res
      .status(200)
      .json({ success: true, message: "장바구니 항목이 삭제되었습니다." });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "장바구니 삭제 실패",
      error: err.message,
    });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "로그인이 필요합니다.",
      });
    }

    const deleted = await Cart.destroy({
      where: { userId },
    });

    res.status(200).json({
      success: true,
      message: `장바구니가 초기화되었습니다. (${deleted}개 삭제됨)`,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "장바구니 초기화 실패",
      error: err.message,
    });
  }
};

exports.removeByProductId = async (req, res) => {
  try {
    const productId = req.params.productId;

    if (!productId || isNaN(productId)) {
      return res.status(400).json({
        success: false,
        message: "유효한 productId가 필요합니다.",
      });
    }

    const item = await Cart.findOne({
      where: { userId: req.user.id, productId },
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "해당 상품이 장바구니에 없습니다.",
      });
    }

    await item.destroy();

    res.status(200).json({
      success: true,
      message: "해당 상품이 장바구니에서 삭제되었습니다.",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "상품별 삭제 실패",
      error: err.message,
    });
  }
};

exports.updateCartQuantity = async (req, res) => {
  try {
    const productId = req.params.productId;
    const { quantity } = req.body;

    // 유효성 검사
    if (!productId || isNaN(productId)) {
      return res.status(400).json({
        success: false,
        message: "유효한 productId가 필요합니다.",
      });
    }

    if (quantity === undefined || isNaN(quantity)) {
      return res.status(400).json({
        success: false,
        message: "수량(quantity)은 숫자여야 합니다.",
      });
    }

    const item = await Cart.findOne({
      where: {
        userId: req.user.id,
        productId,
      },
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "해당 상품이 장바구니에 없습니다.",
      });
    }

    if (quantity <= 0) {
      await item.destroy();
      return res.status(200).json({
        success: true,
        message: "수량이 0 이하라 장바구니에서 해당 상품이 삭제되었습니다.",
      });
    }

    item.quantity = quantity;
    await item.save();

    res.status(200).json({
      success: true,
      message: "수량이 수정되었습니다.",
      data: item,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "장바구니 수량 수정 실패",
      error: err.message,
    });
  }
};
exports.bulkUpdateCart = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const updates = req.body;

    if (!Array.isArray(updates)) {
      return res.status(400).json({
        success: false,
        message: "배열 형식의 데이터를 보내야 합니다.",
      });
    }

    const updatedItems = [];
    const deletedItems = [];
    const skippedItems = [];

    for (const item of updates) {
      const { id, quantity } = item;

      // 유효성 검사
      if (!id || isNaN(id) || quantity === undefined || isNaN(quantity)) {
        skippedItems.push({ id, reason: "유효하지 않은 입력" });
        continue;
      }

      const cartItem = await Cart.findOne({
        where: { id, userId: req.user.id },
        transaction: t,
      });

      if (!cartItem) {
        skippedItems.push({ id, reason: "장바구니 항목 없음" });
        continue;
      }

      if (quantity <= 0) {
        await cartItem.destroy({ transaction: t });
        deletedItems.push(id);
      } else {
        cartItem.quantity = quantity;
        await cartItem.save({ transaction: t });
        updatedItems.push({ id, quantity });
      }
    }

    await t.commit();

    res.status(200).json({
      success: true,
      message: "장바구니 일괄 수정 완료",
      updated: updatedItems,
      deleted: deletedItems,
      skipped: skippedItems,
    });
  } catch (err) {
    await t.rollback();
    res.status(500).json({
      success: false,
      message: "장바구니 일괄 수정 실패",
      error: err.message,
    });
  }
};
