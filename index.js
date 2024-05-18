const express = require("express");
const { json } = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const path = require("path");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const winston = require("winston");

// Load environment variables
const envFile = process.env.NODE_ENV === "production" ? ".env.production.local" : ".env.development.local";
dotenv.config({ path: path.resolve(__dirname, envFile) });

const usersRouter = require("./routes/users-routes.js");
const authRouter = require("./routes/auth-routes.js");
const gasStationRouter = require("./routes/gas-station-routes.js");

const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.printf(({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`)
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: "server.log" })
    ],
});

const options = {
    definition: {
        openapi: "3.1.0",
        info: {
            title: "LogRocket Express API with Swagger",
            version: "0.1.0",
            description: "This is a simple CRUD API application made with Express and documented with Swagger",
            license: {
                name: "MIT",
                url: "https://spdx.org/licenses/MIT.html",
            },
            contact: {
                name: "LogRocket",
                url: "https://logrocket.com",
                email: "info@email.com",
            },
        },
        servers: [
            {
                url: "http://localhost:5002",
            },
        ],
    },
    apis: ["./routes/*.js"],
};
const specs = swaggerJsdoc(options);

const app = express();
const PORT = process.env.PORT || 5002;

app.use(cors());
app.use(json());
app.use(cookieParser());

app.use("/", express.static(path.join(__dirname, "public")));
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/gas-stations", gasStationRouter);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs, { explorer: true }));

app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
    console.log(`Server is running on port ${PORT}`);
});
