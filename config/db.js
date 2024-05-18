const { Client } = require("pg");
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

const localClientConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
};

const clientConfig = process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
    : localClientConfig;

async function connectToDatabase() {
    const client = new Client(clientConfig);
    try {
        await client.connect();
        logger.info('Connected to the database');
        return client;
    } catch (err) {
        logger.error('Failed to connect to the database:', err.message);
        throw err;
    }
}

module.exports = connectToDatabase;
