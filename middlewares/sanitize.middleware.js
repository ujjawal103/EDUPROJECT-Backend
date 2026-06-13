const sanitizeObject = (obj) => {

    if (!obj || typeof obj !== "object") {
        return;
    }

    for (const key of Object.keys(obj)) {

        if (
            key.startsWith("$") ||
            key.includes(".")
        ) {
            delete obj[key];
            continue;
        }

        sanitizeObject(obj[key]);
    }
};

const sanitizeMiddleware = (
    req,
    res,
    next
) => {

    sanitizeObject(req.body);
    sanitizeObject(req.params);
    sanitizeObject(req.query);
    next();
};

module.exports = sanitizeMiddleware;



// prevent nosql injection