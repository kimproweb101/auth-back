const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const session = require("express-session");
const dotenv = require("dotenv");
const passport = require("passport");
const cors = require("cors");
dotenv.config();

const studyRouter = require("./routes/study");
const swaggerRouter = require("./routes/swagger");
const authRouter = require("./routes/auth");
const postRouter = require("./routes/post");
const boardRouter = require("./routes/board");

const adminCategoryRouter = require("./routes/shop/admin/category");
const adminOrderRouter = require("./routes/shop/admin/order");
const adminProductRouter = require("./routes/shop/admin/product");

const userCartRouter = require("./routes/shop/user/cart");
const userCategoryRouter = require("./routes/shop/user/category");
const userOrderRouter = require("./routes/shop/user/order");
const userProductRouter = require("./routes/shop/user/product");

const commentRouter = require("./routes/comment");
const userRouter = require("./routes/user");
const { sequelize } = require("./models");
const passportConfig = require("./passport");

const app = express();

app.use(
  cors({
    origin: "http://localhost:9000",
    credentials: true,
  })
);

passportConfig(); // 패스포트 설정
app.set("port", process.env.PORT || 8001);

sequelize
  .sync({ force: false })
  .then(() => {
    console.log("데이터베이스 연결 성공");
  })
  .catch((err) => {
    console.error(err);
  });

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
      httpOnly: true,
      secure: false,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => {
  return res.status(400).json({
    success: true,
    message: "message",
  });
});

app.use("/swagger", swaggerRouter);
app.use("/study", studyRouter);
app.use("/auth", authRouter);
app.use("/post", postRouter);
app.use("/boards", boardRouter);
app.use("/comment", commentRouter);
app.use("/user", userRouter);

app.use("/shop/admin/category", adminCategoryRouter);
app.use("/shop/admin/order", adminOrderRouter);
app.use("/shop/admin/product", adminProductRouter);
app.use("/shop/user/cart", userCartRouter);
app.use("/shop/user/category", userCategoryRouter);
app.use("/shop/user/order", userOrderRouter);
app.use("/shop/user/product", userProductRouter);

app.use((req, res, next) => {
  const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  res.json({
    success: false,
    message: err.message || "에러 메시지",
    status: err.status || 500,
    error: process.env.NODE_ENV !== "production" ? err : {},
  });
});

app.listen(app.get("port"), () => {
  console.log(app.get("port"), "번 포트에서 대기중");
});
