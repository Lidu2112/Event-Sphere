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
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f3f7; margin: 0; padding: 20px; color: #2d1b2d; }
                .email-card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px; box-shadow: 0 4px 20px rgba(45, 27, 45, 0.08); border: 1px solid #f0e6f0; }
                .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f0e6f0; padding-bottom: 16px; margin-bottom: 24px; font-size: 14px; color: #6b516b; }
                .logo { font-weight: bold; font-size: 18px; color: #3a1c3a; display: flex; align-items: center; gap: 8px; }
                .success-badge { text-align: center; margin: 24px 0; }
                .icon-circle { width: 64px; height: 64px; background-color: #3a1c3a; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; color: #ffffff; font-size: 28px; box-shadow: 0 4px 12px rgba(58, 28, 58, 0.2); }
                h2 { color: #3a1c3a; font-size: 24px; text-align: center; margin: 16px 0 8px 0; }
                .subtitle { text-align: center; color: #6b516b; font-size: 15px; margin-bottom: 32px; }
                .ticket-box { background-color: #fcf8fc; border: 1px solid #eadeed; border-radius: 12px; padding: 24px; margin-bottom: 24px; }
                .ticket-row { margin-bottom: 12px; font-size: 15px; display: flex; align-items: flex-start; }
                .ticket-label { font-weight: 600; color: #3a1c3a; width: 90px; flex-shrink: 0; }
                .ticket-value { color: #4a334a; flex-grow: 1; }
                .qr-container { text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px dashed #eadeed; }
                .footer { text-align: center; font-size: 13px; color: #8c738c; border-top: 1px solid #f0e6f0; padding-top: 20px; margin-top: 24px; }
            </style>
        </head>
        <body>
            <div class="email-card">
                <div class="header">
                    <div class="logo">EventSphere</div>
                    <div>Discover &bull; Book &bull; Enjoy</div>
                </div>
                
                <div class="success-badge">
                    <div class="icon-circle">&#10003;</div>
                </div>
                
                <h2>Hello ${escapeHtml(data.userName || "Attendee")}!</h2>
                <div class="subtitle">Your payment was successful and your ticket is confirmed!</div>
                
                <div class="ticket-box">
                    <div class="ticket-row">
                        <span class="ticket-label">Event:</span>
                        <span class="ticket-value"><b>${escapeHtml(data.eventName)}</b></span>
                    </div>
                    <div class="ticket-row">
                        <span class="ticket-label">Date:</span>
                        <span class="ticket-value">${escapeHtml(data.eventDate)}</span>
                    </div>
                    <div class="ticket-row">
                        <span class="ticket-label">Venue:</span>
                        <span class="ticket-value">${escapeHtml(data.venue)}</span>
                    </div>
                    <div class="ticket-row">
                        <span class="ticket-label">Ticket ID:</span>
                        <span class="ticket-value"><code>${escapeHtml(data.ticketId)}</code></span>
                    </div>
                    
                    <div class="qr-container">
                        ${
                            data.qrCode
                                ? `<img src="${escapeHtml(data.qrCode)}" alt="Ticket QR Code" width="180" style="border-radius: 8px; background: #fff; padding: 8px; border: 1px solid #eadeed;" />`
                                : "<p style='color: #8c738c; font-size: 14px;'>Your ticket QR code is not available in this email.</p>"
                        }
                    </div>
                </div>
                
                <div class="footer">
                    Thank you for choosing EventSphere!<br>
                    We look forward to seeing you at the event.
                </div>
            </div>
        </body>
        </html>
    `;

    try {
        const result = await resend.emails.send({
            from: 'EventSphere <kelemzhekale@gmail.com>',
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