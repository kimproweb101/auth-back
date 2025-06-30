const { User, Board, Comment } = require("../models"); // 누락되었을 경우 추가

// 유틸 함수: 부모 댓글 뎁스 확인
const getCommentDepth = async (parentId) => {
  let depth = 1;
  let current = await Comment.findByPk(parentId);
  while (current && current.parentId) {
    depth++;
    if (depth >= 3) break; // 제한 깊이 설정 (예: 3)
    current = await Comment.findByPk(current.parentId);
  }
  return depth;
};

// 수정된 createComment
exports.createComment = async (req, res) => {
  try {
    const id = req.params.id;
    const { content, parentId } = req.body;

    if (!id || !content) {
      return res
        .status(400)
        .json({ message: "boardId와 content는 필수입니다." });
    }

    const board = await Board.findByPk(id);
    if (!board) {
      return res
        .status(404)
        .json({ message: "해당 게시글을 찾을 수 없습니다." });
    }

    if (parentId) {
      const parentComment = await Comment.findByPk(parentId);
      if (!parentComment) {
        return res
          .status(400)
          .json({ message: "존재하지 않는 부모 댓글입니다." });
      }

      const depth = await getCommentDepth(parentId);
      if (depth >= 3) {
        return res
          .status(400)
          .json({ message: "대댓글은 최대 3단계까지만 작성 가능합니다." });
      }
    }

    const comment = await Comment.create({
      content,
      boardId: id,
      parentId: parentId || null,
      userId: req.user.id,
    });

    res.status(201).json(comment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "댓글 작성 중 오류가 발생했습니다." });
  }
};

// 댓글 수정
exports.updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      return res.status(404).json({ message: "댓글을 찾을 수 없습니다." });
    }

    if (comment.userId !== req.user.id) {
      return res.status(403).json({ message: "수정 권한이 없습니다." });
    }

    comment.content = content;
    await comment.save();

    res.status(200).json({ message: "댓글이 수정되었습니다.", comment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "댓글 수정 중 오류 발생" });
  }
};

// 댓글 삭제
exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      return res.status(404).json({ message: "댓글을 찾을 수 없습니다." });
    }

    // 권한 확인
    if (comment.userId !== req.user.id) {
      return res.status(403).json({ message: "삭제 권한이 없습니다." });
    }

    // 하위 댓글이 있는지 확인
    const replyCount = await Comment.count({
      where: { parentId: comment.id },
    });

    if (replyCount > 0) {
      return res
        .status(400)
        .json({ message: "답글이 있어 삭제할 수 없습니다." });
    }

    // soft-delete
    await comment.destroy(); // paranoid: true인 경우 삭제된 것처럼 표시만

    res.status(200).json({ message: "댓글이 삭제되었습니다." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "댓글 삭제 중 오류 발생" });
  }
};

// 댓글 트리 조회
// 댓글 트리 조회
exports.getCommentTree = async (req, res) => {
  try {
    const { boardId } = req.params;

    const rootComments = await Comment.findAll({
      where: { boardId, parentId: null },
      include: [
        {
          model: Comment,
          as: "replies",
          include: [
            {
              model: Comment,
              as: "replies",
              include: [
                {
                  model: User,
                  as: "author",
                  attributes: ["id", "nickname"],
                },
              ],
            },
            {
              model: User,
              as: "author",
              attributes: ["id", "nickname"],
            },
          ],
        },
        { model: Board },
        {
          model: User,
          as: "author",
          attributes: ["id", "nickname"],
        },
      ],
      order: [["createdAt", "ASC"]],
    });

    res.status(200).json(rootComments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "댓글 조회 중 오류 발생" });
  }
};
