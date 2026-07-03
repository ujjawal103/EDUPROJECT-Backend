const z = require("zod");
const OTP_PURPOSES = require("../constants/otpPurposes");

const roles = ["customer", "educator"];


const changePasswordSchema =z.object({
        currentPassword:
            z.string()
             .min(1, "Password must be at least 1 characters")
             .max(100, "Password cannot exceed 100 characters"),

        newPassword:
            z.string()
             .min(6, "Password must be at least 6 characters")
             .max(100, "Password cannot exceed 100 characters"),
});


const changeEmailSchema = z.object({
        currentPassword:
            z.string()
            .min(1, "Password must be at least 1 characters"),

        newEmail:
            z.email()
             .trim()
             .toLowerCase(),
    });

const verifyChangeEmailOtpSchema =
    z.object({
        newEmail:
            z.email()
            .trim(),

        otp:
            z.string()
             .length(6 , "Please enter a valid otp"),
    });






module.exports = {
    changePasswordSchema,
    changeEmailSchema,
    verifyChangeEmailOtpSchema
};