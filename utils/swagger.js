import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import path from "path";
import { fileURLToPath } from "url";

// Recreate __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: " Bangle App API Documentation",
      version: "1.0.0",
      description: "This is the API documentation for Bangle App.",
    },
    servers: [
      {
        url: "http://localhost:3000", // Your API base URL
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: [
    path.join(__dirname, "./../app.js"),
    path.join(__dirname, "./../src/user/index.js"),
    path.join(__dirname, "./../src/Manufacturer/Design/design.routes.js"),
   
  ],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

const setupSwagger = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
  console.log("Swagger Docs available at http://localhost:3000/api-docs");
};

export default setupSwagger;
