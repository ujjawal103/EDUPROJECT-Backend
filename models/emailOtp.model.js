const mongoose = require("mongoose");

const emailOtpSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        otp: {                     // hashed
            type: String,
            required: true,
            select: false,
        },
        purpose: {
            type: String,
            enum: [
                "email_verification",
                "forgot_password",
                "change_email"
            ],
            required: true,
        },

        expiresAt: {
            type: Date,
            required: true,
        },

        attempts: {
            type: Number,
            default: 0,
        },

        verified: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

emailOtpSchema.index(
    { expiresAt: 1 },
    { expireAfterSeconds: 0 }
);

emailOtpSchema.index({
    email: 1,
    purpose: 1,
});

const EmailOtp = mongoose.model(
    "EmailOtp",
    emailOtpSchema
);

module.exports = EmailOtp;