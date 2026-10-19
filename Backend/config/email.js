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
    // Force IPv4 to prevent ENETUNREACH network errors on certain networks
    socketTimeout: 60000,
    connectionTimeout: 60000,
});

// Force DNS to resolve to IPv4 addresses to bypass IPv6 network blocks
const dns = require('dns');
dns.setDefaultResultOrder?.('ipv4first');

transporter.verify()
    .then(() => {
        console.log("Email server is ready.");
    })
    .catch((error) => {
        console.error("EMAIL CONNECTION ERROR:", error.message);
    });

module.exports = transporter;