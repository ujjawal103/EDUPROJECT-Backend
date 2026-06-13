const mongoose = require("mongoose");

const pendingUserSchema = new mongoose.Schema(
    {
        fullName: {
            firstName: {
                type: String,
                required: true,
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
            required: true,
            lowercase: true,
            trim: true,
            unique: true,
        },

        password: {
            type: String,
            required: true,
            select: false,
        },

        role: {
            type: String,
            enum: ["educator", "customer"],
            required: true,
            index: true,
        },

        angelOneClientId: {
            type: String,
            default: null,
            trim: true,
        },

        authProvider: {
            type: String,
            enum: ["local", "google"],
            default: "local",
        },

        expiresAt: {
            type: Date,
            required: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

/*
|--------------------------------------------------------------------------
| Indexes
|--------------------------------------------------------------------------
*/

pendingUserSchema.index(
    { expiresAt: 1 },
    { expireAfterSeconds: 0 }
);

pendingUserSchema.index({
    email: 1,
});

const PendingUser = mongoose.model(
    "PendingUser",
    pendingUserSchema
);

module.exports = PendingUser;