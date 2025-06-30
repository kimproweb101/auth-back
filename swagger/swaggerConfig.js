const swaggerJSDoc = require("swagger-jsdoc");
const path = require("path");

const options = {
  definition: {
    openapi: "3.0.0",
    info: { title: "API 문서", version: "1.0.0" },
    servers: [{ url: "http://localhost:8001" }],
  },
  apis: [
    path.join(__dirname, "paths/*.yaml"),
    path.join(__dirname, "components/*.yaml"),
  ],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
