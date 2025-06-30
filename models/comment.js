const Sequelize = require("sequelize");

class Comment extends Sequelize.Model {
  static initiate(sequelize) {
    Comment.init(
      {
        content: {
          type: Sequelize.STRING(500),
          allowNull: false,
        },
      },
      {
        sequelize,
        timestamps: true,
        underscored: false,
        modelName: "Comment",
        tableName: "comments",
        paranoid: true, // soft delete
        charset: "utf8mb4",
        collate: "utf8mb4_general_ci",
      }
    );
  }

  static associate(db) {
    // 댓글 작성자 (User)
    db.Comment.belongsTo(db.User, { as: "author", foreignKey: "userId" });

    // 댓글이 속한 게시글
    db.Comment.belongsTo(db.Board, { foreignKey: "boardId" });

    // 부모 댓글
    db.Comment.belongsTo(db.Comment, { as: "parent", foreignKey: "parentId" });

    // 자식 댓글 (재귀 관계)
    db.Comment.hasMany(db.Comment, { as: "replies", foreignKey: "parentId" });
  }
}

module.exports = Comment;
