const { Pool } = require("pg");
const dotenv = require("dotenv");
const winston = require("winston");

dotenv.config({
    path: process.env.NODE_ENV === "production" ? ".env.production.local" : ".env.development.local"
});

// Create a logger
const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.printf(({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`)
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: "db_connection.log" })
    ],
});

const localPoolConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
};

const poolConfig = process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
    : localPoolConfig;

const pool = new Pool(poolConfig);

pool.on('connect', () => {
    logger.info('Connected to the database');
});

pool.on('error', (err) => {
    logger.error('Failed to connect to the database:', err.message);
});

module.exports = pool;
