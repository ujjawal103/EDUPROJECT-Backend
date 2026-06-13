const crypto = require("crypto");

const generateOtp = (length = 6) => {
    const digits = "0123456789";
    let otp = "";

    for (let i = 0; i < length; i++) {
        otp += digits[crypto.randomInt(0, digits.length)];
    }

    return otp;
};

const hashOtp = (otp) => {
    return crypto
        .createHash("sha256")
        .update(otp)
        .digest("hex");
};


const getOtpExpiry = (
    minutes = 10
) => {
    return new Date(
        Date.now() +
        minutes * 60 * 1000
    );
};

const isOtpExpired = (
    expiresAt
) => {
    return Date.now() >
           new Date(expiresAt).getTime();
};


const verifyOtp = (
    enteredOtp,
    storedOtp
) => {
    return (
        hashOtp(String(enteredOtp)) === storedOtp
    );
};

module.exports = {
    generateOtp,
    hashOtp,
    getOtpExpiry,
    verifyOtp,
};