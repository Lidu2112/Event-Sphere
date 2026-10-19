
const nodemailer = require("nodemailer");

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("EMAIL ERROR: EMAIL_USER or EMAIL_PASS is missing.");
}

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

transporter.verify()
    .then(() => {
        console.log("Email server is ready.");
    })
    .catch((error) => {
        console.error("EMAIL CONNECTION ERROR:", error.message);
    });

module.exports = transporter;
