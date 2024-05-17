const pg = require("pg");
const { Pool } = pg;
const dotenv = require("dotenv");

dotenv.config();

const localPoolConfig = {
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "password",
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5433,
    database: process.env.DB_NAME || "p_database",
};

const poolConfig = process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
    : localPoolConfig;

const pool = new Pool(poolConfig);

module.exports = pool;
