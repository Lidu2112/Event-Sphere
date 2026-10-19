
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

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
        <p>Your payment was successful and your ticket is confirmed!</p>
        <p><b>Ticket ID:</b> ${escapeHtml(data.ticketId)}</p>
        <p><b>Event:</b> ${escapeHtml(data.eventName)}</p>
        <p><b>Date:</b> ${escapeHtml(data.eventDate)}</p>
        <p><b>Venue:</b> ${escapeHtml(data.venue)}</p>
        ${
            data.qrCode
                ? `<img src="${escapeHtml(data.qrCode)}" alt="Ticket QR Code" width="220"/>`
                : "<p>Your ticket QR code is not available in this email.</p>"
        }
    `;

    try {
        const result = await resend.emails.send({
    from: 'EventSphere <onboarding@resend.dev>',
    to: data.email,
    subject: 'Your Event-Sphere Ticket Confirmation',
    html,
});

if (result.error) {
    console.error("RESEND EMAIL FAILED:", result.error);
    throw new Error(result.error.message || "Resend failed to send email.");
}

console.log("Ticket email accepted by Resend:", result.data?.id);
return result;
    } catch (error) {
        console.error("TICKET EMAIL FAILED:", error.message);
        throw error;
    }
};
