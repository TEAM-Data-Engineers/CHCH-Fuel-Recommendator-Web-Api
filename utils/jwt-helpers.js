const jwt = require("jsonwebtoken");

function jwtTokens({ id, username, email }) {
    const user = { id, username, email };
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "120m" });
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
    return { accessToken, refreshToken };
}

module.exports = { jwtTokens };
