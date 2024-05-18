const express = require("express");
const connectToDatabase = require("../config/db.js");
const { authenticateToken } = require("../middlewares/authorization.js");
const winston = require("winston");
const { Sequelize, DataTypes } = require('sequelize');

// Create a logger
const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.printf(({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`)
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: "gas_station_routes.log" })
    ],
});

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

let sequelize;
let GasStation;
let FuelPrice;

const initializeDatabase = async () => {
    sequelize = await connectToDatabase();

    // 定义 gas_station 和 fuel_price 模型
    GasStation = sequelize.define('GasStation', {
        location_id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        brand_name: DataTypes.STRING,
        location_name: DataTypes.STRING,
        latitude: DataTypes.FLOAT,
        longitude: DataTypes.FLOAT,
        address_line1: DataTypes.STRING,
        city: DataTypes.STRING,
        state_province: DataTypes.STRING,
        postal_code: DataTypes.STRING,
        country: DataTypes.STRING,
    }, {
        timestamps: false,
        tableName: 'gas_station',
    });

    FuelPrice = sequelize.define('FuelPrice', {
        location_id: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        fuel_type: DataTypes.STRING,
        price: DataTypes.FLOAT,
        date: DataTypes.DATEONLY,
    }, {
        timestamps: false,
        tableName: 'fuel_price',
    });

    // 设置模型关系
    FuelPrice.belongsTo(GasStation, { foreignKey: 'location_id' });
};

initializeDatabase();

router.get("/", async (req, res) => {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
        logger.error("Latitude and longitude are required");
        return res.status(400).json({ message: "Latitude and longitude are required" });
    }

    try {
        // 获取所有加油站
        const gasStations = await GasStation.findAll();

        // 筛选出5000米范围内的加油站
        const nearbyStations = gasStations.filter((station) => {
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
            const prices = await FuelPrice.findAll({
                where: {
                    location_id: locationIds,
                    date: {
                        [Sequelize.Op.eq]: Sequelize.literal('CURRENT_DATE') // 正确使用日期比较
                    }
                },
                include: [GasStation],
                attributes: [
                    [sequelize.col('GasStation.location_id'), 'location_id'],
                    [sequelize.col('GasStation.brand_name'), 'brand_name'],
                    [sequelize.col('GasStation.location_name'), 'location_name'],
                    [sequelize.col('GasStation.latitude'), 'latitude'],
                    [sequelize.col('GasStation.longitude'), 'longitude'],
                    [sequelize.col('GasStation.address_line1'), 'address_line1'],
                    [sequelize.col('GasStation.city'), 'city'],
                    [sequelize.col('GasStation.state_province'), 'state_province'],
                    [sequelize.col('GasStation.postal_code'), 'postal_code'],
                    [sequelize.col('GasStation.country'), 'country'],
                    [sequelize.fn('ARRAY_AGG', sequelize.col('FuelPrice.fuel_type')), 'fuel_types'],
                    [sequelize.fn('ARRAY_AGG', sequelize.col('FuelPrice.price')), 'prices'],
                    [sequelize.fn('ARRAY_AGG', sequelize.col('FuelPrice.date')), 'dates'],
                ],
                group: [
                    'GasStation.location_id',
                    'GasStation.brand_name',
                    'GasStation.location_name',
                    'GasStation.latitude',
                    'GasStation.longitude',
                    'GasStation.address_line1',
                    'GasStation.city',
                    'GasStation.state_province',
                    'GasStation.postal_code',
                    'GasStation.country'
                ],
            });

            logger.info(`Found ${prices.length} gas stations within 5km`);
            res.json({ gasStations: prices });
        } else {
            logger.info("No gas stations found within 5km");
            res.json({ gasStations: [] });
        }
    } catch (error) {
        logger.error(`Error fetching gas stations: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
