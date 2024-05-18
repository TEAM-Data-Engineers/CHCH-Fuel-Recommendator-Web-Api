const pg = require("pg");
const { Pool } = pg;
const dotenv = require("dotenv");

dotenv.config({
    path: process.env.NODE_ENV === "production" ? ".env.production.local" : ".env.development.local",
});

const localPoolConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
};

const poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
};

const pool = new Pool(poolConfig);

pool.connect((err, client, release) => {
    if (err) {
        console.error(`Failed to connect to the database: ${err.message}`);
    } else {
        console.log("Successfully connected to the database");
        release();
    }
});

module.exports = pool;
