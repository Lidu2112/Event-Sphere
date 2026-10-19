
const transporter = require("../config/email");

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

module.exports = async function sendTicketEmail(data) {
    if (!data?.email) {
        throw new Error("Ticket email recipient is missing.");
    }

    const html = `
        <h2>Hello ${escapeHtml(data.userName || "Attendee")}</h2>
        <p>Your payment was successful.</p>
        <p><b>Ticket ID:</b> ${escapeHtml(data.ticketId)}</p>
        <p><b>Event:</b> ${escapeHtml(data.eventName)}</p>
        <p><b>Date:</b> ${escapeHtml(data.eventDate)}</p>
        <p><b>Venue:</b> ${escapeHtml(data.venue)}</p>
        ${
            data.qrCode
                ? `<img src="${escapeHtml(data.qrCode)}"
                        alt="Ticket QR Code" width="220"/>`
                : "<p>Your ticket QR code is not available in this email.</p>"
        }
    `;

    try {
        const result = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: data.email,
            subject: "Your Event-Sphere Ticket",
            html,
        });

        console.log("Ticket email sent:", result.messageId);
        return result;
    } catch (error) {
        console.error("TICKET EMAIL FAILED:", error.message);
        throw error;
    }
};
