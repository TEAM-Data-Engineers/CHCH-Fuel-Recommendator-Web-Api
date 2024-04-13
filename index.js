const express = require("express");
const { json } = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const path = require("path");
const usersRouter = require("./routes/users-routes.js");
const authRouter = require("./routes/auth-routes.js");
const gasStationRouter = require("./routes/gas-station-routes.js");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;
const corsOptions = { Credentials: true, origin: process.env.CLIENT_URL || "*" };

app.use(cors(corsOptions));
app.use(json());
app.use(cookieParser());

app.use("/", express.static(path.join(__dirname, "public")));
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/gas-stations", gasStationRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
