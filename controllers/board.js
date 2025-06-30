const path = require("path");
const fs = require("fs");
const { Op } = require("sequelize");
const { getByteLength } = require("../utils/val");
const { Board, User } = require("../models");

const MAX_CONTENT_BYTES = 5000;
// Create
exports.createBoard = async (req, res) => {
  const { bid, title, content } = req.body;
  if (!bid || !title | !content) {
    return res.status(400).json({
      success: false,
      message: "필수 입력 값을 확인해 주세요.",
    });
  }

  if (getByteLength(title) > 140) {
    return res.status(400).json({
      success: false,
      message: "제목을 140 바이트 이하로 작성해 주세요.",
    });
  }

  if (getByteLength(title) > MAX_CONTENT_BYTES) {
    return res.status(400).json({
      success: false,
      message: `본문을 ${MAX_CONTENT_BYTES} 바이트 이하로 작성해 주세요.`,
    });
  }

  const createData = {
    bid,
    title,
    content,
    count: 0,
    UserId: req.user.id,
  };
  if (req.file && req.file.filename) {
    createData.file = req.file.filename;
  }

  try {
    const board = await Board.create(createData);
    return res.status(201).json(board);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

// Read All
exports.getBoards = async (req, res) => {
  try {
    const page = parseInt(req.query.params.page) || 1; // 기본값 1페이지
    const limit = parseInt(req.query.params.limit) || 10; // 기본값 한 페이지당 10개
    const offset = (page - 1) * limit;

    const where = {};
    if (req.query.params.bid) {
      where.bid = req.query.params.bid;
    }

    if (
      req.query.search.searchType === "title" &&
      req.query.search.searchValue
    ) {
      where.title = { [Op.like]: `%${req.query.search.searchValue}%` };
    }
    if (
      req.query.search.searchType === "content" &&
      req.query.search.searchValue
    ) {
      where.content = { [Op.like]: `%${req.query.search.searchValue}%` };
    }

    const { count, rows } = await Board.findAndCountAll({
      where,
      offset,
      limit,
      order: [["id", "DESC"]],
      include: [
        {
          model: User, // 연결된 User 모델
          attributes: ["nickname"], // 필요한 사용자 필드만 선택
        },
      ],
    });
    res.json({
      success: true,
      where: where,
      totalItems: count,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      boards: rows,
    });
  } catch (err) {
    console.error(err);
    res.json({
      success: false,
      message: err,
    });
  }
};

// Read One
exports.getBoard = async (req, res) => {
  try {
    const board = await Board.findByPk(req.params.id, {
      attributes: [
        "id",
        "bid",
        "title",
        "content",
        "count",
        "file",
        "createdAt",
        "updatedAt",
      ],
      include: [
        {
          model: User,
          attributes: ["nickname"],
        },
      ],
    });

    if (!board) {
      return res.json({
        success: false,
        data: null,
        message: "해당 데이터가 없습니다.",
      });
    }

    // 조회수(count) +1 증가
    board.count += 1;
    await board.save(); // DB에 반영

    res.json({
      success: true,
      data: board,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "서버 오류" });
  }
};

// File download
exports.downloadBoard = async (req, res) => {
  try {
    const board = await Board.findByPk(req.params.id);
    if (!board || !board.file) {
      return res.status(404).json({ message: "파일을 찾을 수 없습니다." });
    }
    const safeFileName = path.basename(board.file);
    const filePath = path.resolve(__dirname, "..", "uploads", safeFileName);
    // 보안: 실제 파일 존재 여부 확인
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "파일이 존재하지 않습니다." });
    }
    res.download(filePath, safeFileName);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "서버 오류" });
  }
};

// Update

exports.updateBoard = async (req, res) => {
  try {
    const { bid, title, content } = req.body;

    const updateData = {
      bid,
      title,
      content,
    };

    // 기존 게시글 조회
    const board = await Board.findByPk(req.params.id);
    if (!board) {
      return res.status(404).json({ error: "Not found" });
    }

    // 수정 권한 확인
    if (board.UserId !== req.user.id) {
      return res.status(403).json({ error: "게시글 수정 권한이 없습니다." });
    }

    if (req.file) {
      if (board.file) {
        const filePath = path.join(__dirname, "../uploads", board.file);
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error("Failed to delete old file:", err);
          } else {
            console.log("Old file deleted:", board.file);
          }
        });
      }
      updateData.file = req.file.filename;
    }
    const [updated] = await Board.update(updateData, {
      where: { id: req.params.id },
    });
    if (updated) {
      res.json({ message: "Updated" });
    } else {
      res.status(404).json({ error: "Not found" });
    }
  } catch (error) {
    console.error("Update failed:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Delete
exports.deleteBoard = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({
        success: false,
        message: "게시글을 선택 후 요청해주세요.",
      });
    }
    const board = await Board.findByPk(req.params.id);

    if (!board) {
      return res.status(404).json({
        success: false,
        message: "삭제할 게시물이 없습니다.",
      });
    }

    // 삭제 권한 확인
    if (board.UserId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "게시글 삭제 권한이 없습니다.",
      });
    }

    const deleted = await Board.destroy({ where: { id: req.params.id } });
    if (deleted) {
      return res.status(200).json({
        success: true,
        message: "삭제가 정상 처리되었습니다.",
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "삭제할 게시물이 없습니다.",
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다.",
      error: err,
    });
  }
};
