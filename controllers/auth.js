const bcrypt = require('bcrypt');
const passport = require('passport');
const User = require('../models/user');

exports.join = async (req, res, next) => {
  const { email, nick, password } = req.body;
  try {
    const exUser = await User.findOne({ where: { email } });
    if (exUser) {
      return res.redirect('/join?error=exist');
    }
    const hash = await bcrypt.hash(password, 12);
    await User.create({
      email,
      nick,
      password: hash,
    });
    return res.json({
      success: true,      
      message: 'Join Success',
    })
  } catch (error) {
    console.error(error);
    return next(error);
  }
}

exports.loadUser = async (req, res, next) => {  
  const user = req.user;  
  const data={id:user.id, email:user.email, nick:user.nick, provider:user.provider}
  res.json(data);
};

exports.login = (req, res, next) => {
  passport.authenticate('local', (authError, user, info) => {
    if (authError) {
      console.error(authError);      
      return next(authError);
    }
    if (!user) {
      return res.status(401).send(info.message);
    }
    return req.login(user, (loginError) => {
      if (loginError) {
        console.error(loginError);
        return next(loginError);
      }
       const loggedInUser = {
        email: user.email,
        nickname: user.nick,
      };

      // return the information including token as JSON
      return res.status(200).json({
        success: true,
        user: loggedInUser,
        message: 'Login Success',
        token: 'dsadasdsadsa',
      });
    });
  })(req, res, next); // 미들웨어 내의 미들웨어에는 (req, res, next)를 붙입니다.
};

exports.logout = (req, res) => {
  if(req.isAuthenticated()){      
      req.logout(() => {    
        return res.status(200).send('로그아웃 되었습니다.');
      });
  }  
};
