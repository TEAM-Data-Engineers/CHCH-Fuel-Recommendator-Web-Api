const express = require("express");
const pool = require("../config/db.js");
const bcrypt = require("bcryptjs");
const { authenticateToken } = require("../middlewares/authorization.js");

const router = express.Router();

router.get("/", authenticateToken, async (req, res) => {
    try {
        console.log("req.cookies: ", req.cookies);
        const users = await pool.query("SELECT * FROM users");
        res.json({ users: users.rows });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post("/", async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await pool.query(
            "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *",
            [username, email, hashedPassword]
        );
        res.json({ user: newUser.rows[0] });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete("/", async (req, res) => {
    try {
        const users = await pool.query("DELETE FROM users");
        res.status(204).json(users.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
