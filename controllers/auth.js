const bcrypt = require("bcrypt");
const passport = require("passport");
const User = require("../models/user");
const Auth = require("../models/auth");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const { Op } = require("sequelize");

exports.join = async (req, res, next) => {
  const { email, nickname, password } = req.body;
  try {
    const exUser = await User.findOne({ where: { email } });
    if (exUser) {
      return res.json({
        success: false,
        message: "이메일이 중복되었습니다.",
      });
    }
    const exNickname = await User.findOne({ where: { nickname } });
    if (exNickname) {
      return res.json({
        success: false,
        message: "닉네임이 중복되었습니다.",
      });
    }
    const hash = await bcrypt.hash(password, 12);
    await User.create({
      email,
      nickname,
      password: hash,
    });

    // start
    passport.authenticate("local", (authError, user, info) => {
      if (authError) {
        return next(authError);
      }
      if (!user) {
        return res.status(400).json({
          success: false,
          message: "계정 정보를 확인해 주세요",
        });
      }
      return req.login(user, (loginError) => {
        if (loginError) {
          return next(loginError);
        }
        const loggedInUser = {
          id: user.id,
          email: user.email,
          nickname: user.nickname,
          provider: user.provider,
        };

        // return the information including token as JSON
        return res.status(200).json({
          success: true,
          user: loggedInUser,
          message: "회원가입 완료",
        });
      });
    })(req, res, next);
    // end
  } catch (err) {
    console.error(err);
    return next(error);
  }
};

exports.loadUser = async (req, res, next) => {
  try {
    const user = req.user;
    const data = {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      provider: user.provider,
    };
    res.status(200).json({
      success: true,
      message: data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err,
    });
  }
};

exports.login = (req, res, next) => {
  passport.authenticate("local", (authError, user, info) => {
    if (authError) {
      console.error(authError);
      return next(authError);
    }
    if (!user) {
      return res.status(200).json({
        success: false,
        message: "계정 정보를 확인해 주세요",
      });
    }
    return req.login(user, (loginError) => {
      if (loginError) {
        console.error(loginError);
        return next(loginError);
      }
      const loggedInUser = {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        provider: user.provider,
      };
      return res.status(200).json({
        success: true,
        user: loggedInUser,
        message: "로그인 성공",
      });
    });
  })(req, res, next); // 미들웨어 내의 미들웨어에는 (req, res, next)를 붙입니다.
};

exports.confirmPw = (req, res, next) => {
  passport.authenticate("local", (authError, user, info) => {
    if (authError) {
      console.error(authError);
      return next(authError);
    }
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "계정 정보를 확인해 주세요",
      });
    }
    return req.login(user, (loginError) => {
      if (loginError) {
        console.error(loginError);
        return next(loginError);
      }
      // return the information including token as JSON
      return res.status(200).json({
        success: true,
        message: "비밀번호 확인 성공",
      });
    });
  })(req, res, next); // 미들웨어 내의 미들웨어에는 (req, res, next)를 붙입니다.
};

exports.logout = (req, res) => {
  if (req.isAuthenticated()) {
    req.logout(() => {
      return res.status(200).send("로그아웃 되었습니다.");
    });
  }
};

exports.accountUpdate = async (req, res) => {
  try {
    const exNickname = await User.findOne({ where: { nickname } });
    if (exNickname) {
      return res.status(400).json({
        success: false,
        message: "닉네임이 중복되었습니다.",
      });
    }

    await User.update(
      {
        nickname: req.body.nickname,
      },
      { where: { id: req.user.id } }
    );
    const fullUser = await User.findOne({
      attributes: ["id", "email", "nickname", "provider"],
      where: { id: req.user.id },
    });
    return res.status(200).json({
      success: true,
      user: fullUser,
      message: "수정 성공",
    });
  } catch (err) {
    console.log(err);
    return err;
  }
};

exports.accountPasswordUpdate = async (req, res) => {
  const hash = await bcrypt.hash(req.body.password, 12);
  try {
    await User.update(
      {
        password: hash,
      },
      { where: { id: req.user.id } }
    );
    return res.status(200).json({
      success: true,
      message: "비밀번호 변경 성공",
    });
  } catch (err) {
    console.log(err);
    return res.status(err.status || 500).json({
      success: false,
      message: "서버 내부 에러가 발생했습니다.",
    });
  }
};

function generatePassword() {
  const reg = /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,15}$/;
  const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const specials = "!@#$%^*+=-";
  const allChars = letters + numbers + specials;

  // 랜덤 길이 (8~10)
  const length = Math.floor(Math.random() * 3) + 8;

  // 필수 문자 각각 1개 이상 포함
  const getRandom = (str) => str[Math.floor(Math.random() * str.length)];

  let password = [getRandom(letters), getRandom(numbers), getRandom(specials)];

  // 나머지 문자 채우기
  for (let i = password.length; i < length; i++) {
    password.push(getRandom(allChars));
  }

  // 랜덤하게 섞기
  password = password.sort(() => Math.random() - 0.5).join("");

  // 정규식 검사
  return reg.test(password) ? password : generatePassword();
}

exports.accountResetPasswordWithEmail = async (req, res) => {
  const email = req.body.email;
  if (!email) {
    return res.json({
      success: false,
      message: "이메일은 필수 입력값 입니다.",
    });
  }

  try {
    const exEmail = await User.findOne({ where: { email } });
    if (!exEmail) {
      return res.status(404).json({
        success: false,
        message: "해당 이메일이 없습니다.",
      });
    }
  } catch (err) {
    console.log(err);
    return res.json({
      success: false,
      message: err,
    });
  }

  /* 3분안에 보낸 메일이 있는경우 다시 보내지 않음 */
  const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000); // 3분 전

  try {
    const exAuth = await Auth.findOne({
      where: {
        email,
        createdAt: {
          [Op.gte]: threeMinutesAgo, // createdAt >= 3분 전
        },
      },
    });
    if (exAuth) {
      return res.json({
        success: true,
        message: "이메일을 확인 하신후 비밀번호를 재설정 해주세요.",
      });
    }
  } catch (err) {
    console.log(err);
    res.json({
      success: false,
      message: error,
    });
  }

  const token = crypto.randomBytes(20).toString("hex");
  const password = generatePassword();
  const subject = "비밀번호 재설정 메일입니다.";
  const html = `
    <div
      style="
        max-width: 596px;
        border: 1px solid #c2c2c2;
        margin: 0 auto;
        padding: 20px;
        color: #696969;
      "
    >
      <div>
        안녕하세요. 회원정보찾기에 따른 비밀번호 변경 확인 안내드립니다.
      </div>
      <ul style="padding-top: 10px">
        <li>변경될 비밀번호 : ${password}</li>
      </ul>
      <div style="padding-top: 10px">
        변경될 비밀번호를 확인하신 후, 비밀번호 변경 버튼을 클릭하세요.
      </div>
      <div style="padding-top: 10px; padding-bottom: 30px">
        비밀번호가 변경되었다는 인증 메세지가 출력되면, 홈페이지에서
        회원아이디와 변경된 비밀번호를 입력하시고 로그인 하세요. 로그인 후에는
        정보수정 메뉴에서 새로운 비밀번호로 변경해 주십시오.
      </div>
      <div style="padding-bottom: 20px">
        <a
          href="${process.env.FRONT_URL}/auth/find-password-confirm?email=${email}&token=${token}"
          style="
            margin-top: 10px;
            padding: 15px;
            text-align: center;
            color: #fff;
            background: #f27824;
            text-decoration: none;
          "
          >비밀번호 변경</a
        >
      </div>
      <div style="padding-top: 10px">감사합니다.</div>
    </div>
  `;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.NODEMAILER_USER,
      pass: process.env.NODEMAILER_PASS,
    },
  });

  const mailOptions = {
    from: process.env.NODEMAILER_USER,
    to: email,
    subject,
    html,
  };

  // 저장 로직
  const hash = await bcrypt.hash(password, 12);
  try {
    const res = await Auth.create({
      email,
      token,
      password: hash,
      confirm: false,
    });
  } catch (err) {
    console.error(err);
    return res.json({
      success: false,
      message: err,
    });
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    return res.json({
      success: true,
      messageId: info.messageId,
      message: "비밀번호 재설정 메일을 확인해 주세요",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      error: err.message,
      message: "이메일 보내기가 실패했습니다. 다시 시도해 주세요.",
    });
  }
};

exports.accountResetPasswordWithEmailConfirm = async (req, res) => {
  const { email, token } = {
    email: req.body.email,
    token: req.body.token,
  };

  if (!email || !token) {
    return res.json({
      success: false,
      message: "이메일 또는 토큰 정보가 없습니다.",
    });
  }

  /* 3분안에 인증 */
  const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000); // 3분 전
  const exAuth = await Auth.findOne({
    where: {
      email,
      token,
      createdAt: {
        [Op.gte]: threeMinutesAgo, // createdAt >= 3분 전
      },
    },
    order: [["createdAt", "DESC"]],
  });
  if (!exAuth) {
    return res.json({
      success: false,
      message: "인증시간이 만료되었습니다. 다시 시도해 주세요",
    });
  }

  try {
    await User.update(
      {
        password: exAuth.password,
      },
      { where: { email } }
    );
    return res.json({
      success: true,
      message: "비밀번호를 변경 했습니다.",
    });
  } catch (err) {
    console.error(err);
    return res.json({
      success: false,
      message: "비밀번호 변경이 실패했습니다.",
    });
  }
};

exports.accountUpdate = async (req, res) => {
  try {
    await User.update(
      {
        nickname: req.body.nickname,
      },
      { where: { id: req.user.id } }
    );
    const fullUser = await User.findOne({
      attributes: ["id", "email", "nickname"],
      where: { id: req.user.id },
    });
    return res.json({
      success: true,
      user: fullUser,
      message: "수정 성공",
    });
  } catch (err) {
    console.error(err);
    return res.json({
      success: false,
      message: err,
    });
  }
};
