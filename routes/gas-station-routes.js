const express = require("express");
const pool = require("../config/db.js");
const { authenticateToken } = require("../middlewares/authorization.js");

const router = express.Router();

router.get("/",authenticateToken, async (req, res) => {
    try {
        const gasStations = await pool.query("SELECT * FROM gas_station");
        res.json({ gasStations: gasStations.rows });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
