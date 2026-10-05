const transporter = require("../config/email");

module.exports = async function sendTicketEmail(data) {
    return transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: data.email,
        subject: "Your Event Ticket",
        html: `
            <h2>Hello ${data.userName}</h2>

            <p>Your payment was successful.</p>

            <p><b>Ticket ID:</b> ${data.ticketId}</p>
            <p><b>Event:</b> ${data.eventName}</p>
            <p><b>Date:</b> ${data.eventDate}</p>
            <p><b>Venue:</b> ${data.venue}</p>

            <img src="${data.qrCode}" width="220"/>
        `
    });
}