const express = require("express");
const pool = require("../config/db.js");
const { authenticateToken } = require("../middlewares/authorization.js");

const router = express.Router();

const EARTH_RADIUS = 6371; // 地球半径，单位：公里

// Haversine公式计算距离
const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const toRadians = (degrees) => degrees * (Math.PI / 180);

    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const lat1Rad = toRadians(lat1);
    const lat2Rad = toRadians(lat2);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1Rad) * Math.cos(lat2Rad);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = EARTH_RADIUS * c;

    return distance;
};

router.get("/", async (req, res) => {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
        return res.status(400).json({ message: "Latitude and longitude are required" });
    }

    try {
        // 获取所有加油站
        const gasStations = await pool.query("SELECT * FROM gas_station");

        // 筛选出5000米范围内的加油站
        const nearbyStations = gasStations.rows.filter((station) => {
            const distance = haversineDistance(
                parseFloat(latitude),
                parseFloat(longitude),
                parseFloat(station.latitude),
                parseFloat(station.longitude)
            );
            return distance <= 5;
        });

        // 获取这些加油站的油价信息
        const locationIds = nearbyStations.map((station) => station.location_id);
        if (locationIds.length > 0) {
            const query = `
                SELECT 
                    g.location_id,
                    g.brand_name,
                    g.location_name,
                    g.latitude,
                    g.longitude,
                    g.address_line1,
                    g.city,
                    g.state_province,
                    g.postal_code,
                    g.country,
                    ARRAY_AGG(f.fuel_type) AS fuel_types,
                    ARRAY_AGG(f.price) AS prices,
                    ARRAY_AGG(f.date) AS dates
                FROM fuel_price AS f 
                JOIN gas_station AS g 
                ON f.location_id = g.location_id 
                WHERE g.location_id = ANY($1::text[])
                AND f.date = CURRENT_DATE
                GROUP BY g.location_id, g.brand_name, g.location_name, g.latitude, g.longitude, g.address_line1, g.city, g.state_province, g.postal_code, g.country
            `;

            const values = [locationIds];
            const prices = await pool.query(query, values);

            res.json({ gasStations: prices.rows });
        } else {
            res.json({ gasStations: [] });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
