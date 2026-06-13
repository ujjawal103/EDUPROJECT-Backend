const dotenv = require("dotenv")
dotenv.config();
const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors")
const helmet = require("helmet");
const compression = require("compression");
// const mongoSanitize = require("express-mongo-sanitize");
const sanitizeMiddleware = require("./middlewares/sanitize.middleware");
const errorMiddleware = require("./middlewares/error.middleware");
const AppError = require("./utils/AppError");

const authRoutes = require("./routes/auth.routes");



app.set("trust proxy", 1);
app.use(helmet());
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));
// app.use(mongoSanitize());
app.use(express.json());
app.use(compression());
app.use(express.urlencoded({ extended: true }));
app.use(sanitizeMiddleware);
app.use(cookieParser());


app.use("/api/v1/auth" , authRoutes)

app.get("/" , (req,res) =>{
    res.send("hello world");
})

app.get("/health", (req,res)=>{
    return res.status(200).json({
        success: true,
        message: "Server is healthy"
    });
});



// when no routes matche [ in express 5 , we don't need to use *]

app.use((req, res, next) => {
    next(
        new AppError(
            "Route not found",
            404
        )
    );
});



app.use(errorMiddleware);



module.exports = app;