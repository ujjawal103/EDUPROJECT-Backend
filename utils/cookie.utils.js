// const setAuthCookies = ( res, refreshToken ) => {
//     res.cookie( "refreshToken", refreshToken , {
//             httpOnly: true,
//             secure: process.env.NODE_ENV === "production",
//             sameSite: "strict",
//             maxAge: 30 * 24 * 60 * 60 * 1000,
//         }
//     );
// };


const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000,
};

const setAuthCookies = ( res, refreshToken ) => {
    res.cookie(
        "refreshToken",
        refreshToken,
        COOKIE_OPTIONS
    );
};

const clearAuthCookies = (res) => {
    res.clearCookie("refreshToken");
};

module.exports = {
    setAuthCookies,
    clearAuthCookies,
};