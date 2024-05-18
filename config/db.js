const { Sequelize, DataTypes } = require("sequelize");
const dotenv = require("dotenv");
const winston = require("winston");

dotenv.config({
    path: process.env.NODE_ENV === "production" ? ".env.production.local" : ".env.development.local",
});

// Create a logger
const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.printf(({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`)
    ),
    transports: [new winston.transports.Console(), new winston.transports.File({ filename: "db_connection.log" })],
});

const localClientConfig = {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    dialect: "postgres",
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false, // 这将忽略证书验证
        }
    },
};

const sequelizeConfig = process.env.DATABASE_URL
    ? {
          connectionString: process.env.DATABASE_URL,
          dialect: "postgres",
          dialectOptions: { ssl: { rejectUnauthorized: false } },
      }
    : localClientConfig;

// Log the database connection details (excluding password for security)
logger.info("Database connection details:", {
    user: localClientConfig.username,
    host: localClientConfig.host,
    port: localClientConfig.port,
    database: localClientConfig.database,
    environment: process.env.NODE_ENV,
    using_database_url: !!process.env.DATABASE_URL,
});

const sequelize = new Sequelize(
    sequelizeConfig.database,
    sequelizeConfig.username,
    sequelizeConfig.password,
    sequelizeConfig
);

async function connectToDatabase() {
    try {
        await sequelize.authenticate();
        logger.info("Connected to the database");
        return sequelize;
    } catch (err) {
        logger.error("Failed to connect to the database:", err);
        throw err;
    }
}

module.exports = connectToDatabase;
