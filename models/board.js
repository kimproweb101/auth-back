const Sequelize = require("sequelize");

class Board extends Sequelize.Model {
  static initiate(sequelize) {
    Board.init(
      {
        bid: {
          type: Sequelize.STRING(20),
          allowNull: false,
        },
        title: {
          type: Sequelize.STRING(140),
          allowNull: false,
        },
        content: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        count: {
          type: Sequelize.INTEGER,
          allowNull: false,
          default: 0,
        },
        file: {
          type: Sequelize.STRING(200),
          allowNull: true,
        },
      },
      {
        sequelize,
        timestamps: true,
        underscored: false,
        modelName: "Board",
        tableName: "boards",
        paranoid: true,
        charset: "utf8mb4",
        collate: "utf8mb4_general_ci",
      }
    );
  }

  static associate(db) {
    db.Board.belongsTo(db.User); // 게시글 작성자
    db.Board.hasMany(db.Comment, {
      foreignKey: "boardId",
      onDelete: "CASCADE",
    }); // 게시글 댓글들
  }
}

module.exports = Board;
