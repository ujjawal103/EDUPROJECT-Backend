const z = require("zod");
const OTP_PURPOSES = require("../constants/otpPurposes");

const roles = ["customer", "educator"];


// Send Signup OTP
const sendSignupOtpSchema = z.object({
    firstName: z
        .string()
        .trim()
        .min(2, "First name must be at least 2 characters")
        .max(50, "First name cannot exceed 50 characters"),

    lastName: z
        .string()
        .trim()
        .max(50, "Last name cannot exceed 50 characters")
        .optional()
        .or(z.literal("")),

    email: z
        .email("Invalid email address")
        .transform((email) => email.toLowerCase()),

    password: z
        .string()
        .min(6, "Password must be at least 6 characters")
        .max(100, "Password cannot exceed 100 characters"),

    role: z.enum(roles),
    angelOneClientId : z
         .string()
         .trim()
        .max(10, "AngelOne id cannot exceed 10 characters")
        .optional()
        .or(z.literal("")),
});


// Verify Signup OTP
const verifySignupOtpSchema = z.object({
    email: z
        .email("Invalid email address")
        .transform((email) => email.toLowerCase()),

    otp: z
        .string()
        .length(6, "OTP must be 6 digits"),
});




// resend otp
const resendOtpSchema = z.object({
    email: z
        .email("Invalid email address")
        .trim()
        .toLowerCase(),

    purpose: z.enum([
        OTP_PURPOSES.EMAIL_VERIFICATION,
        OTP_PURPOSES.FORGOT_PASSWORD,                   // change email will be only for loggedin users
    ]),
});







// Login
const loginSchema = z.object({
    email: z
        .email("Invalid email address")
        .transform((email) => email.toLowerCase()),

    password: z
        .string()
        .min(6, "Password must be at least 6 characters"),
});



// Forgot Password - Send OTP
const forgotPasswordSchema = z.object({
    email: z
        .email("Invalid email address")
        .trim()
        .toLowerCase(),
});



// Verify Forgot Password OTP
const verifyForgotPasswordOtpSchema = z.object({
    email: z
        .email("Invalid email address")
        .transform((email) => email.toLowerCase()),

    otp: z
        .string()
        .length(6, "OTP must be 6 digits"),
});




 // Reset Password
const resetPasswordSchema = z.object({
        resetToken:
            z.string(),

        newPassword:
            z.string()
             .min(6, "Password must be at least 6 characters")
             .max(100, "Password cannot exceed 100 characters"),
    });


const googleAuthSchema =z.object({ 
        idToken: z.string().min(1),
});    

const selectRoleSchema = z.object({
    role: z.enum([
        "customer",
        "educator",
    ]),
});


module.exports = {
    sendSignupOtpSchema,
    verifySignupOtpSchema,
    resendOtpSchema,
    loginSchema,
    forgotPasswordSchema,
    verifyForgotPasswordOtpSchema,
    resetPasswordSchema,
    googleAuthSchema,
    selectRoleSchema
};