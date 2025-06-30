const Sequelize = require("sequelize");

class Auth extends Sequelize.Model {
  static initiate(sequelize) {
    Auth.init(
      {
        email: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        token: {
          type: Sequelize.STRING(40),
          allowNull: false,
        },
        password: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        confirm: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
        },
      },
      {
        sequelize,
        timestamps: true,
        underscored: false,
        modelName: "Auth",
        tableName: "auths",
        paranoid: true,
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }
}

module.exports = Auth;
