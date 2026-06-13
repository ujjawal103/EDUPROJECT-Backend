const { setAuthCookies } = require("./cookie.utils");

const sendAuthResponse = ({ req, res, statusCode = 200, user, accessToken, refreshToken, message = "Success", }) => {

    const clientType = req.headers["x-client-type"];      // web or app

    const responseData = {
        success: true,
        message,
        accessToken,
        user,
    };

    if (clientType === "web") {
        setAuthCookies(
            res,
            refreshToken
        );
        return res
            .status(statusCode)
            .json(responseData);
    }

    return res                                // for app we will send refresh token also
        .status(statusCode)
        .json({
            ...responseData,
            refreshToken,
        });
};

module.exports = sendAuthResponse;