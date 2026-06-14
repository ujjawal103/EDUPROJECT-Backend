const express = require("express");

const router = express.Router();

const { sendSignupOtp, verifySignupOtp , resendOtp , login , refreshToken , forgotPassword , verifyForgotPasswordOtp, resetPassword , logout , logoutAllDevices } = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.post(
    "/send-signup-otp",
    sendSignupOtp
);

router.post(
    "/verify-signup-otp",
    verifySignupOtp
);

router.post(
    "/resend-otp",
    resendOtp
);

router.post(
    "/login",
    login
);

router.post(
    "/refresh-token",
    refreshToken
);





router.post(
    "/forgot-password",
    forgotPassword
);

router.post(
    "/verify-forgot-password-otp",
    verifyForgotPasswordOtp
);

router.post(
    "/reset-password",
    resetPassword
);






router.post(
    "/logout",
    logout
);



router.post(
    "/logout-all-devices",
    authMiddleware,
    logoutAllDevices
);








router.get("/test", (req, res) => {
    return res.json({
        success: true,
        message: "Auth route working"
    });
});

module.exports = router;