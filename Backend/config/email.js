
const { Resend } = require('resend');

if (!process.env.RESEND_API_KEY) {
    console.error("EMAIL ERROR: RESEND_API_KEY is missing in environment variables.");
}

const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = resend;