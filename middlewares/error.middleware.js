const { ZodError } = require("zod");

const errorMiddleware = (
    err,
    req,
    res,
    next
) => {

    if (err instanceof ZodError) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: err.issues.map(
                issue => ({
                    field: issue.path.join("."),
                    message: issue.message,
                })
            ),
        });
    }

    err.statusCode =
        err.statusCode || 500;

    err.message =
        err.message ||
        "Internal Server Error";

    return res
        .status(err.statusCode)
        .json({
            success: false,
            message: err.message,
        });
};

module.exports = errorMiddleware;