const nodemailer = require("nodemailer");
const AppError = require("../utils/AppError");


console.log(process.env.BREVO_SMTP_USER , process.env.BREVO_SMTP_PASS)

const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.BREVO_SMTP_USER,
        pass: process.env.BREVO_SMTP_PASS,
    },
});


transporter.verify((error, success) => {
    if (error) {
        console.log("SMTP VERIFY ERROR:");
        console.log(error);
    } else {
        console.log("SMTP READY");
    }
});



const sendMail = async ({ to, subject, html, }) => {
    try {
        await transporter.sendMail({
            from: `"${process.env.APP_NAME}" <${process.env.BREVO_SENDER}>`,
            to,
            subject,
            html,
        });
    } catch (error) {
        console.error(
            "Email Service Error:",
            error
        );

        throw new AppError(
            "Failed to send email",
            500
        );
    }
};



const generateOtpTemplate = ({ otp, purpose, }) => {
    const purposeText = {
        email_verification: "Email Verification",
        forgot_password: "Password Reset",
        change_email: "Email Change Verification",
    };

    return `
        <div style="font-family: Arial, Helvetica, sans-serif; background-color:#f5f7fb; padding:20px;">
            <div style="max-width:550px; margin:auto; background:#ffffff; border-radius:10px; padding:30px;">

                <div style="text-align:center;">
                    <h2 style="margin:0; color:#2563eb;">
                        ${process.env.APP_NAME}
                    </h2>

                    <p style="color:#666;">
                        Secure Verification
                    </p>
                </div>

                <p>
                    Hello 👋
                </p>

                <p>
                    Use the OTP below to complete
                    your
                    <strong>
                        ${purposeText[purpose] || "Verification"}
                    </strong>.
                </p>

                <div
                    style="
                        text-align:center;
                        margin:30px 0;
                    "
                >
                    <div
                        style="
                            display:inline-block;
                            background:#eff6ff;
                            color:#1d4ed8;
                            padding:14px 24px;
                            border-radius:8px;
                            font-size:28px;
                            font-weight:bold;
                            letter-spacing:6px;
                        "
                    >
                        ${otp}
                    </div>
                </div>

                <p>
                    This OTP is valid for
                    <strong>
                        10 minutes
                    </strong>.
                </p>

                <p>
                    Never share this OTP with
                    anyone.
                </p>

                <hr
                    style="
                        border:none;
                        border-top:1px solid #eee;
                        margin:25px 0;
                    "
                />

                <p
                    style="
                        color:#777;
                        font-size:12px;
                        text-align:center;
                    "
                >
                    © ${new Date().getFullYear()}
                    ${process.env.APP_NAME}
                </p>

            </div>
        </div>
    `;
};



const sendOtpEmail = async ({ email, otp, purpose, }) => {
    return sendMail({
        to: email,
        subject: "Your Verification Code",
        html: generateOtpTemplate({
            otp,
            purpose,
        }),
    });
};

module.exports = {
    sendMail,
    sendOtpEmail,
};