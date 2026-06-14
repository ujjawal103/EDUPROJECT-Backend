const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
    {
        fullName: {
            firstName: {
                type: String,
                required: [true, "First name is required"],
                trim: true,
                minlength: 2,
                maxlength: 50,
            },

            lastName: {
                type: String,
                trim: true,
                maxlength: 50,
                default: "",
            },
        },

        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
            match: [
                /^\S+@\S+\.\S+$/,
                "Please enter a valid email address",
            ],
        },

        password: {
            type: String,
            minlength: 6,
            select: false,
        },

        role: {
            type: String,
            enum: ["admin", "educator", "customer"],
            default: null,
            index: true,
        },

        authProvider: {
            type: String,
            enum: ["local", "google"],
            default: "local",
        },

        googleId: {
            type: String,
            default: null,
            index: true,
            sparse: true,
        },
        onboardingCompleted: {
            type: Boolean,
            default: false               // will be true when user choosed his role if he login via google
        },

        emailVerified: {
            type: Boolean,
            default: false,
        },

        angelOneClientId: {
            type: String,
            default: null,
            trim: true,
        },

        angelOneVerified: {
            type: Boolean,
            default: false,
        },

        profileImage: {
            type: String,
            default: null,
        },

        refreshTokens: [                      // hashed all
            {
                type: String,
                select: false,
            }
        ],

        isActive: {
            type: Boolean,
            default: true,
        },

        passwordResetVersion: {
            type: Number,
            default: 0,
            select: false
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);



userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.statics.hashPassword = async function (password) {
    return await bcrypt.hash(password, 10);
};

// indexes are defined inside the fields.


const User = mongoose.model("User", userSchema);

module.exports = User;