// routes/swagger.js
const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("../swagger/swaggerConfig");

const router = express.Router();

router.use("/doc", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

module.exports = router;
