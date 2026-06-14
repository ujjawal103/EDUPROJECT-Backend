const User = require("../models/user.models");
const AppError = require("../utils/AppError");
const { verifyAccessToken } = require("../utils/token.utils");

const authMiddleware = async ( req, res, next ) => {
    try {
        const authHeader = req.headers.authorization;

        if ( !authHeader || !authHeader.startsWith("Bearer ")) {
            return next(
                new AppError(
                    "Unauthorized",
                    401
                )
            );
        }

        const accessToken = authHeader.split(" ")[1];           // access token is only in header not in cookies also.

        const decoded = verifyAccessToken( accessToken );

        const user = await User.findById( decoded.id );

        if (!user) {
            return next(
                new AppError(
                    "User not found",
                    404
                )
            );
        }

        req.user = user;

        next();

    } catch (error) {
        next(error);
    }
};

module.exports = authMiddleware;