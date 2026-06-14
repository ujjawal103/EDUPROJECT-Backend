const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user.models");
const EmailOtp = require("../models/emailOtp.model");
const PendingUser = require("../models/pendingUser.model");

const AppError = require("../utils/AppError");
const { generateOtp, hashOtp, getOtpExpiry , verifyOtp } = require("../utils/otp.utils");
const { sendOtpEmail } = require("../services/email.service");
const { sendSignupOtpSchema , verifySignupOtpSchema , resendOtpSchema , loginSchema , forgotPasswordSchema , verifyForgotPasswordOtpSchema , resetPasswordSchema} = require("../validators/auth.validator");
const OTP_PURPOSES = require("../constants/otpPurposes");
const sendAuthResponse = require("../utils/authResponse.utils");
const {generateTokens , hashRefreshToken , verifyRefreshToken , generatePasswordResetToken} = require("../utils/token.utils");
const {clearAuthCookies} = require("../utils/cookie.utils");




exports.sendSignupOtp = async ( req, res, next ) => {
    try {

        const validatedData = sendSignupOtpSchema.parse(req.body);                    // parse throw an automatic error if fails in validation of zod

        const { firstName, lastName, email, password, role, angelOneClientId } = validatedData;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return next(
                new AppError(
                    "User already exists",
                    409
                )
            );
        }

        const hashedPassword = await User.hashPassword(password);

        const otp = generateOtp();
        const hashedOtp = hashOtp(otp);
        const expiresAt = getOtpExpiry();

        const pendingUser = await PendingUser.findOneAndUpdate(
            { email },
            {
                fullName: {
                    firstName,
                    lastName,
                },
                email,
                password: hashedPassword,

                role,
                angelOneClientId,
                expiresAt
            },
            {
                upsert: true,
                new: true,
            }
        );
        

        await EmailOtp.findOneAndUpdate(
            {
                email,
                purpose:
                    OTP_PURPOSES.EMAIL_VERIFICATION,
            },
            {
                otp: hashedOtp,
                expiresAt,
                attempts: 0,
                verified:
                    false,
            },
            {
                upsert: true,
                new: true,
            }
        );

        await sendOtpEmail({
            email,
            otp,
            purpose: OTP_PURPOSES.EMAIL_VERIFICATION,
        });

        return res.status(200).json({
                success: true,
                message: "OTP sent successfully",
            });

    } catch (error) {
        next(error);
    }
};


exports.verifySignupOtp = async ( req, res, next ) => {
    try {
        const validatedData = verifySignupOtpSchema.parse( req.body );

        const { email, otp } = validatedData;

        const existingUser = await User.findOne({ email });

        if(existingUser){
            return next(
                new AppError(
                    "User is Already Registered",
                    409
                )
            )
        }

        const otpRecord = await EmailOtp.findOne({ email, purpose: OTP_PURPOSES.EMAIL_VERIFICATION }).select("+otp");

        if (!otpRecord) {
            return next(
                new AppError(
                    "OTP expired",
                    400
                )
            );
        }

        if (!verifyOtp(otp, otpRecord.otp)) {
            otpRecord.attempts += 1;
            if (otpRecord.attempts >= 5) {

                await EmailOtp.deleteOne({
                    _id: otpRecord._id,
                });

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

        const pendingUser = await PendingUser.findOne({ email }).select("+password");

        if (!pendingUser) {
            return next(
                new AppError(
                    "Registration expired. Please register again.",
                    400
                )
            );
        }

        const user = await User.create({
                fullName:
                    pendingUser.fullName,

                email:
                    pendingUser.email,

                password:
                    pendingUser.password,

                role:
                    pendingUser.role,

                angelOneClientId:
                    pendingUser.angelOneClientId,

                emailVerified:
                    true,
            });

        const { accessToken, refreshToken } = generateTokens(user);

        const hashedRefreshToken = hashRefreshToken( refreshToken );

        user.refreshTokens.push( hashedRefreshToken );

        await user.save();
        await EmailOtp.deleteOne({ _id: otpRecord._id, });

        await PendingUser.deleteOne({  _id: pendingUser._id, });

        return sendAuthResponse({
            req,
            res,
            statusCode: 201,
            user,
            accessToken,
            refreshToken,
            message:
                "Account created successfully",
        });

    } catch (error) {
        next(error);
    }
};


//resend otp for signup and reset pass but not for change email.
exports.resendOtp = async ( req, res, next ) => {
    try {
        const validatedData = resendOtpSchema.parse( req.body );

        const { email, purpose } = validatedData;

        const user = await User.findOne({ email });                     // check if already registered

        switch (purpose) {

            case OTP_PURPOSES.EMAIL_VERIFICATION: {

                const pendingUser =
                    await PendingUser.findOne({ email });

                if (!pendingUser && !user) {
                    return next(
                        new AppError(
                            "Registration expired. Please signup again.",
                            400
                        )
                    );
                }else if(user){
                    return next(
                        new AppError(
                            "User Already Registered - please login",
                            400
                        )
                    );
                }

                break;
            }

            case OTP_PURPOSES.FORGOT_PASSWORD: {

                

                if (!user) {
                    return next(
                        new AppError(
                            "User not found",
                            404
                        )
                    );
                }

                break;
            }

            default:
                return next(
                    new AppError(
                        "Invalid OTP purpose",
                        400
                    )
                );
        }

        const otp =
            generateOtp();

        const hashedOtp =
            hashOtp(otp);

        const expiresAt =
            getOtpExpiry();

        await EmailOtp.findOneAndUpdate(
            {
                email,
                purpose,
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
            email,
            otp,
            purpose,
        });

        return res.status(200).json({
            success: true,
            message:
                "OTP resent successfully",
        });

    } catch (error) {
        next(error);
    }
};






exports.login = async ( req, res, next ) => {
    try {
        const validatedData = loginSchema.parse( req.body );
        const { email, password } = validatedData;

        const user = await User.findOne({ email,}).select( "+password +refreshTokens");

        if (!user) {
            return next(
                new AppError(
                    "Invalid email or password",
                    401
                )
            );
        }

        const isPasswordValid = await user.comparePassword( password );

        if (!isPasswordValid) {
            return next(
                new AppError(
                    "Invalid email or password",
                    401
                )
            );
        }

        const { accessToken, refreshToken } = generateTokens(user);

        const hashedRefreshToken = hashRefreshToken( refreshToken );

        user.refreshTokens.push( hashedRefreshToken );

        await user.save();

        return sendAuthResponse({
            req,
            res,
            statusCode: 200,
            user,
            accessToken,
            refreshToken,
            message: "Login successful",
        });

    } catch (error) {
        next(error);
    }
};




exports.refreshToken = async ( req, res, next ) => {
    try {
        const clientType = req.headers["x-client-type"];

        const refreshToken = clientType === "web" ? req.cookies?.refreshToken : req.body?.refreshToken;

        if (!refreshToken) {
            return next(
                new AppError(
                    "Session Expired , Please login",                     // refresh token also expired so need to login now
                    401
                )
            );
        }

        const decoded = verifyRefreshToken( refreshToken );

        const user = await User.findById( decoded.id ).select( "+refreshTokens" );

        if (!user) {
            return next(
                new AppError(
                    "User not found",
                    404
                )
            );
        }

        const hashedRefreshToken = hashRefreshToken( refreshToken );               // everytime hashing return the same hash for same string in crypto sha256

        const tokenExists = user.refreshTokens.includes( hashedRefreshToken );    

        if (!tokenExists) {
            return next(
                new AppError(
                    "Session Expired , Please Login Again",
                    401
                )
            );
        }

        /*
        |----------------------------------
        | Refresh Token Rotation
        |----------------------------------
        */

        user.refreshTokens = user.refreshTokens.filter( token => token !== hashedRefreshToken);  //old refresh token deleted so that expiry increase

        const { accessToken, refreshToken:newRefreshToken } = generateTokens(user);        //const newRefreshToken =tokens.refreshToken;     [refreshToken:newRefreshToken ===> we just renamed of refreshtoken with newRefreshtoken]

        user.refreshTokens.push(
            hashRefreshToken(
                newRefreshToken
            )
        );

        await user.save();

        return sendAuthResponse({
            req,
            res,
            statusCode: 200,
            user,
            accessToken,
            refreshToken: newRefreshToken,
            message: "Token refreshed successfully",
        });

    } catch (error) {
        next(error);
    }
};





// reset password ---> 3 page flow + auto login after change pass

exports.forgotPassword = async ( req, res, next) => {
    try {
        const { email } = forgotPasswordSchema.parse( req.body );

        const user = await User.findOne({ email });

        if (!user) {
            return next(
                new AppError(
                    "User not found",
                    404
                )
            );
        }

        const otp = generateOtp();

        const hashedOtp = hashOtp(otp);

        const expiresAt = getOtpExpiry();

        await EmailOtp.findOneAndUpdate({ email, purpose:OTP_PURPOSES.FORGOT_PASSWORD,},
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
            email,
            otp,
            purpose:
                OTP_PURPOSES.FORGOT_PASSWORD,
        });

        return res.status(200).json({
            success: true,
            message:
                "Password reset OTP sent successfully",
        });

    } catch (error) {
        next(error);
    }
};

exports.verifyForgotPasswordOtp = async ( req, res, next ) => {
        try {
            const { email, otp } = verifyForgotPasswordOtpSchema.parse(req.body);

            const otpRecord = await EmailOtp.findOne({ email, purpose:OTP_PURPOSES.FORGOT_PASSWORD,}).select( "+otp");

            if (!otpRecord) {
                return next(
                    new AppError(
                        "OTP expired",
                        400
                    )
                );
            }

            if (!verifyOtp( otp,  otpRecord.otp)) {
                otpRecord.attempts += 1;
                if ( otpRecord.attempts >= 5) {
                    await EmailOtp.deleteOne({
                        _id:otpRecord._id,
                    });

                    return next(
                        new AppError(
                            "Maximum OTP attempts exceeded",
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

            const user = await User.findOne({ email }).select("+passwordResetVersion");

            const resetToken = generatePasswordResetToken( user );

            await EmailOtp.deleteOne({
                _id: otpRecord._id,
            });

            return res.status(200).json({
                success: true,
                message: "OTP verified successfully",
                resetToken,
            });

        } catch (error) {
            next(error);
        }
};

exports.resetPassword = async ( req, res, next ) => {
        try {
            const { resetToken, newPassword } = resetPasswordSchema.parse(  req.body );

            const decoded = jwt.verify( resetToken,  process.env.JWT_RESET_SECRET );

            if ( decoded.purpose !== "password_reset" ) {
                return next(
                    new AppError(
                        "Invalid reset , please generate new otp",
                        401
                    )
                );
            }    

            const user = await User.findById( decoded.id ).select( "+passwordResetVersion" );

            if (!user) {
                return next(
                    new AppError(
                        "User not found",
                        404
                    )
                );
            }

            console.log(user);

            const validToken = decoded.version === user.passwordResetVersion;                // when same token used for multiple resets.
            if(!validToken){
                return next(
                    new AppError(
                        "Invalid reset , please generate new otp",
                        401
                    )
                );
            }

            user.password = await User.hashPassword( newPassword );

            /*
            |------------------------
            | Logout all devices
            |------------------------
            */
            user.passwordResetVersion += 1;
            user.refreshTokens = [];

            await user.save();

            const { accessToken, refreshToken } = generateTokens(user);

            user.refreshTokens.push( hashRefreshToken( refreshToken ));

            await user.save();

            return sendAuthResponse({
                req,
                res,
                statusCode: 200,
                user,
                accessToken,
                refreshToken,
                message:
                    "Password reset successfully",
            });

        } catch (error) {
            next(error);
        }
};







// logout

exports.logout = async ( req, res, next ) => {
    try {
        const clientType = req.headers["x-client-type"];

        const refreshToken = clientType === "web" ? req.cookies?.refreshToken : req.body?.refreshToken;

        if (!refreshToken) {                   // even if refreshtoken expired or notprovided , logout happens
            if (clientType === "web") {
                clearAuthCookies(res);
            }

            return res.status(200).json({
                success: true,
                message:
                    "Logged out successfully",
            });
        }

        try {
            const decoded = verifyRefreshToken( refreshToken );

            const user = await User.findById( decoded.id ).select("+refreshTokens");

            if (user) {
                const hashedRefreshToken = hashRefreshToken( refreshToken );

                user.refreshTokens = user.refreshTokens.filter( token => token !== hashedRefreshToken );

                await user.save();
            }

        } catch (error) {

            /*
            |----------------------------------
            | Token expired / invalid
            |----------------------------------
            | Logout should still succeed.
            */

        }

        if (clientType === "web") {
            clearAuthCookies(res);
        }

        return res.status(200).json({
            success: true,
            message:
                "Logged out successfully",
        });

    } catch (error) {
        next(error);
    }
};




exports.logoutAllDevices = async ( req, res, next ) => {
        try {
            req.user.refreshTokens = [];                      // from middleware we have res.user = user
            await req.user.save();
            clearAuthCookies(
                res
            );

            return res.status(200).json({
                success: true,
                message: "Logged out from all devices successfully",
            });

        } catch (error) {
            next(error);
        }
};


