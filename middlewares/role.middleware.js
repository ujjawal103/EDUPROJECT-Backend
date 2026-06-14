const AppError = require("../utils/AppError");

const authorizeRoles = (...roles) => {

        return ( req, res, next ) => {
            if ( !roles.includes( req.user.role)) {
                return next(
                    new AppError(
                        "Access denied",
                        403
                    )
                );
            }

            next();
        };
    };

module.exports = authorizeRoles;




// here's how it will decide authorization based on role 

// router.get(
//     "/all-users",
//     authMiddleware,
//     authorizeRoles(
//         USER_ROLES.ADMIN                   // only admin can access
//     ),
//     getAllUsers
// );



// router.get(
//     "/my-subscriptions",
//     authMiddleware,
//     authorizeRoles(
//         USER_ROLES.CUSTOMER,          // customer and educator both are allowed for this api
//         USER_ROLES.EDUCATOR
//     ),
//     getSubscriptions
// );


// and similiarly we can decide for multiple roles