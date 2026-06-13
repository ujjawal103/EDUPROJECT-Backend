const jwt = require("jsonwebtoken");
const crypto = require("crypto");


const generateAccessToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            role: user.role,
        },
        process.env.JWT_ACCESS_SECRET,
        {
            expiresIn:
                process.env.JWT_ACCESS_EXPIRES_IN || "15m",
        }
    );
};



const generateRefreshToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
        },
        process.env.JWT_REFRESH_SECRET,
        {
            expiresIn:
                process.env.JWT_REFRESH_EXPIRES_IN || "30d",
        }
    );
};


const generateTokens = (user) => {
    return {
        accessToken:
            generateAccessToken(user),

        refreshToken:
            generateRefreshToken(user),
    };
};



const verifyAccessToken = (token) => {
    return jwt.verify(
        token,
        process.env.JWT_ACCESS_SECRET
    );
};



const verifyRefreshToken = (token) => {
    return jwt.verify(
        token,
        process.env.JWT_REFRESH_SECRET
    );
};


const hashRefreshToken = ( refreshToken ) => {
    return crypto
        .createHash("sha256")
        .update(refreshToken)
        .digest("hex");
};




//reset password by token
const generatePasswordResetToken = (
    user
) => {
    return jwt.sign(
        {
            id: user._id,
            purpose: "password_reset",
        },
        process.env.JWT_RESET_SECRET,
        {
            expiresIn: "10m",
        }
    );
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    generateTokens,

    verifyAccessToken,
    verifyRefreshToken,

    hashRefreshToken,

    generatePasswordResetToken
};