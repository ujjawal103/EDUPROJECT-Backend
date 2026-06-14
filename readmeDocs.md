const AppError = require("../utils/AppError");

exports.deleteCustomer = async (req, res, next) => {
    try {

        const customer = await Customer.findById(
            req.params.id
        );

        if (!customer) {
            return next(
                new AppError(
                    "Customer not found",
                    404
                )
            );
        }

        await customer.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Customer deleted successfully"
        });

    } catch (error) {
        next(error);
    }
};





this will be our new api style.

































In AUth We Have Implemented This .

✅ sendSignupOtp
✅ verifySignupOtp
✅ resendOtp

✅ login
✅ refreshToken
✅ logout
✅ logoutAllDevices

✅ forgotPassword
✅ verifyForgotPasswordOtp
✅ resetPassword

✅ authMiddleware
✅ roleMiddleware

✅ Web + Mobile auth strategy
✅ Sliding Sessions
✅ Refresh Token Rotation