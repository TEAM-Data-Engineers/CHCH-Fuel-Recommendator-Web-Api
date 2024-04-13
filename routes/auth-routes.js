const express = require("express");
const pool = require("../config/db.js");
const bcrypt = require("bcryptjs");
const jwtTokens = require("../utils/jwt-helpers.js").jwtTokens;
const jwt = require("jsonwebtoken");

const router = express.Router();

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const users = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (users.rows.length === 0) return res.status(401).json({ message: "Invalid credentials" });
        const validPassword = await bcrypt.compare(password, users.rows[0].password);
        if (!validPassword) return res.status(401).json({ message: "Invalid credentials" });
        let tokens = jwtTokens(users.rows[0]);
        res.cookie("refresh_token", tokens.refreshToken, {
            // ...(process.env.COOKIE_DOMAIN && { domain: process.env.COOKIE_DOMAIN }),
            httpOnly: true,
            // sameSite: "none",
            // secure: true,
        });
        res.json(tokens);
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
});

router.get("/refresh_token", (req, res) => {
    try {
        const refreshToken = req.cookies.refresh_token;
        if (refreshToken === null) {
            return res.sendStatus(401);
        }
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (error, user) => {
            if (error) {
                return res.status(403).json({ message: error.message });
            }
            let tokens = jwtTokens(user);
            res.cookie("refresh_token", tokens.refreshToken, {
                // ...(process.env.COOKIE_DOMAIN && { domain: process.env.COOKIE_DOMAIN }),
                httpOnly: true,
                // sameSite: "none",
                // secure: true,
            });
            return res.json(tokens);
        });
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
});

router.delete("/refresh_token", (req, res) => {
    try {
        res.clearCookie("refresh_token");
        return res.status(200).json({ message: "Refresh token deleted" });
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
});

module.exports = router;
