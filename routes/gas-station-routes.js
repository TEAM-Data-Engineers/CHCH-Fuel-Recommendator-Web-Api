import express from "express";
import pool from "../config/db.js";
import { authenticateToken } from "../middlewares/authorization.js";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const gasStations = await pool.query("SELECT * FROM gas_station");
        res.json({ gasStations: gasStations.rows });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
