import { Application } from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Request, Response, NextFunction } from "express";

// Swagger options
const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "SQL ORM Comparison API",
      version: "1.0.0",
      description: "A comparison of different SQL ORMs in Express.js",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: "Development server",
      },
    ],
  },
  apis: ["./src/**/*.ts", "./src/**/*.js"], // Path to the API docs
};

// Initialize swagger-jsdoc
const specs = swaggerJsdoc(options);

// Setup swagger middleware
export const setupSwagger = (app: Application) => {
  app.use(
    "/docs",
    swaggerUi.serve,
    swaggerUi.setup(specs, {
      explorer: true,
      customCss: `
      .swagger-ui .topbar { 
        display: none; 
      }
      .swagger-ui .information-container {
        display: none;
      }
    `,
    }),
  );

  // Add a route to serve the raw swagger JSON
  app.get("/docs/swagger.json", (req: Request, res: Response) => {
    res.setHeader("Content-Type", "application/json");
    res.send(specs);
  });
};

export default setupSwagger;
