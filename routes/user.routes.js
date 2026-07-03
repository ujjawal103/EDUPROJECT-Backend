const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");

const { getMe , changePassword , changeEmail , verifyChangeEmailOtp} = require("../controllers/user.controller");

router.get( "/me",
    authMiddleware,
    getMe
);

router.patch(
    "/change-password",
    authMiddleware,
    changePassword
);


router.patch(
    "/change-email",
    authMiddleware,
    changeEmail
);

router.post(
    "/verify-change-email-otp",
    authMiddleware,
    verifyChangeEmailOtp
);

module.exports = router;