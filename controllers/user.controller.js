const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user.models");
const EmailOtp = require("../models/emailOtp.model");

const AppError = require("../utils/AppError");
const { generateOtp, hashOtp, getOtpExpiry , verifyOtp } = require("../utils/otp.utils");
const { sendOtpEmail } = require("../services/email.service");
const {changePasswordSchema , } = require("../validators/user.validator");
const OTP_PURPOSES = require("../constants/otpPurposes");
const sendAuthResponse = require("../utils/authResponse.utils");
const {generateTokens , hashRefreshToken , verifyRefreshToken , generatePasswordResetToken} = require("../utils/token.utils");


exports.getMe = async ( req, res, next ) => {
    try {
        return res.status(200).json({
            success: true,
            user: req.user,
        });
    } catch (error) {
        next(error);
    }
};


exports.changePassword = async ( req, res, next ) => {
    try {
        const { currentPassword, newPassword } = changePasswordSchema.parse( req.body );

        const user = await User.findById( req.user._id ).select("+password +refreshTokens");

        if ( user.authProvider === "google") {
            return next(
                new AppError(
                    "Google accounts cannot change password",
                    400
                )
            );
        }

        const isPasswordCorrect = await user.comparePassword( currentPassword );

        if (!isPasswordCorrect) {
            return next(
                new AppError(
                    "Current password is incorrect",
                    400
                )
            );
        }

        const isSamePassword = await user.comparePassword( newPassword );

        if (isSamePassword) {
            return next(
                new AppError(
                    "New password must be different from current password",
                    400
                )
            );
        }

        user.password = await User.hashPassword( newPassword );

        /*
        |--------------------------
        | Logout All Devices
        |--------------------------
        */

        user.refreshTokens = [];

        await user.save();

        const { accessToken, refreshToken, } = generateTokens(user);

        user.refreshTokens.push( hashRefreshToken(refreshToken));

        await user.save();

        return sendAuthResponse({
            req,
            res,
            statusCode: 200,
            user,
            accessToken,
            refreshToken,
            message:
                "Password changed successfully",
        });

    } catch (error) {
        next(error);
    }
};

exports.changeEmail = async ( req, res, next) => {
    try {
        const { currentPassword, newEmail, } = changeEmailSchema.parse(req.body);

        const user = await User.findById( req.user._id ).select("+password");

        if ( user.authProvider === "google") {
            return next(
                new AppError(
                    "Google accounts cannot change email",
                    400
                )
            );
        }

        const isPasswordCorrect = await user.comparePassword( currentPassword );

        if (!isPasswordCorrect) {
            return next(
                new AppError(
                    "Current password is incorrect",
                    400
                )
            );
        }

        if ( user.email === newEmail) {
            return next(
                new AppError(
                    "New email must be different from current email",
                    400
                )
            );
        }

        const existingUser = await User.findOne({ email: newEmail });

        if (existingUser) {
            return next(
                new AppError(
                    "Email already in use",
                    409
                )
            );
        }

        const otp = generateOtp();

        const hashedOtp = hashOtp(otp);

        const expiresAt = getOtpExpiry();

        await EmailOtp.findOneAndUpdate(
            {
                email: newEmail,
                purpose: OTP_PURPOSES.CHANGE_EMAIL,
            },
            {
                otp: hashedOtp,
                expiresAt,
                attempts: 0,
                verified: false,
            },
            {
                upsert: true,
                new: true,
            }
        );

        await sendOtpEmail({
            email: newEmail,
            otp,
            purpose: OTP_PURPOSES.CHANGE_EMAIL,
        });

        return res.status(200).json({
            success: true,
            message:
                "OTP sent to new email successfully",
        });

    } catch (error) {
        next(error);
    }
};

exports.verifyChangeEmailOtp = async ( req, res, next) => {
    try {
        const { newEmail, otp } = verifyChangeEmailOtpSchema.parse(req.body);

        const otpRecord = await EmailOtp.findOne({
                email: newEmail,
                purpose: OTP_PURPOSES.CHANGE_EMAIL,
            }).select("+otp");

        if (!otpRecord) {
            return next(
                new AppError(
                    "OTP expired",
                    400
                )
            );
        }

        if ( !verifyOtp(otp, otpRecord.otp)) {
            otpRecord.attempts += 1;
            if ( otpRecord.attempts >= 5) {
                await EmailOtp.deleteOne({_id: otpRecord._id, });

                return next(
                    new AppError(
                        "Maximum OTP attempts exceeded. Please request a new OTP.",
                        400
                    )
                );
            }

            await otpRecord.save();

            return next(
                new AppError(
                    `Invalid OTP. ${5 - otpRecord.attempts} attempts remaining.`,
                    400
                )
            );
        }

        const existingUser = await User.findOne({ email: newEmail });

        if (existingUser) {
            return next(
                new AppError(
                    "Email already in use",
                    409
                )
            );
        }

        const user = await User.findById(req.user._id).select("+refreshTokens");

        user.email = newEmail;

        /*
        |--------------------------
        | Logout All Devices
        |--------------------------
        */

        user.refreshTokens = [];

        await user.save();

        const { accessToken, refreshToken } = generateTokens(user);

        user.refreshTokens.push(mhashRefreshToken( refreshToken ));

        await user.save();

        await EmailOtp.deleteOne({_id: otpRecord._id,});

        return sendAuthResponse({
            req,
            res,
            statusCode: 200,
            user,
            accessToken,
            refreshToken,
            message:
                "Email changed successfully",
        });

    } catch (error) {
        next(error);
    }
};