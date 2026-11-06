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
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Ticket Confirmation</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f7f3f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #2d1b2d;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f7f3f7; padding: 20px 0;">
                <tr>
                    <td align="center">
                        <table width="600" border="0" cellspacing="0" cellpadding="0" style="background: #ffffff; border-radius: 16px; padding: 32px; box-shadow: 0 4px 20px rgba(45, 27, 45, 0.08); border: 1px solid #f0e6f0;">
                            <!-- Header -->
                            <tr>
                                <td style="border-bottom: 1px solid #f0e6f0; padding-bottom: 16px; margin-bottom: 24px;">
                                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                        <tr>
                                            <td style="font-weight: bold; font-size: 18px; color: #3a1c3a;">📅 EventSphere</td>
                                            <td align="right" style="font-size: 14px; color: #6b516b;">Discover &bull; Book &bull; Enjoy</td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>

                            <!-- Success Icon & Title -->
                            <tr>
                                <td align="center" style="padding: 24px 0 8px 0;">
                                    <div style="width: 64px; height: 64px; background-color: #3a1c3a; border-radius: 50%; display: inline-block; text-align: center; line-height: 64px; color: #ffffff; font-size: 28px; font-weight: bold;">&#10003;</div>
                                    <h2 style="color: #3a1c3a; font-size: 24px; margin: 16px 0 8px 0;">Hello ${escapeHtml(data.userName || "Attendee")}!</h2>
                                    <p style="color: #6b516b; font-size: 15px; margin: 0 0 24px 0;">Your payment was successful and your ticket is confirmed!</p>
                                </td>
                            </tr>

                            <!-- Ticket Details Box -->
                            <tr>
                                <td>
                                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #fcf8fc; border: 1px solid #eadeed; border-radius: 12px; padding: 24px;">
                                        <tr>
                                            <td style="padding-bottom: 12px; font-size: 15px;">
                                                <strong style="color: #3a1c3a; display: inline-block; width: 90px;">Event:</strong>
                                                <span style="color: #4a334a;"><b>${escapeHtml(data.eventName)}</b></span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="padding-bottom: 12px; font-size: 15px;">
                                                <strong style="color: #3a1c3a; display: inline-block; width: 90px;">Date:</strong>
                                                <span style="color: #4a334a;">${escapeHtml(data.eventDate)}</span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="padding-bottom: 12px; font-size: 15px;">
                                                <strong style="color: #3a1c3a; display: inline-block; width: 90px;">Venue:</strong>
                                                <span style="color: #4a334a;">${escapeHtml(data.venue)}</span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="padding-bottom: 16px; font-size: 15px;">
                                                <strong style="color: #3a1c3a; display: inline-block; width: 90px;">Ticket ID:</strong>
                                                <span style="color: #4a334a;"><code>${escapeHtml(data.ticketId)}</code></span>
                                            </td>
                                        </tr>
                                        <!-- QR Code -->
                                        <tr>
                                            <td align="center" style="padding-top: 20px; border-top: 1px dashed #eadeed;">
                                                ${
                                                    data.qrCode
                                                        ? `<img src="${escapeHtml(data.qrCode)}" alt="Ticket QR Code" width="180" style="border-radius: 8px; background: #fff; padding: 8px; border: 1px solid #eadeed;" />`
                                                        : "<p style='color: #8c738c; font-size: 14px;'>Your ticket QR code is not available in this email.</p>"
                                                }
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>

                            <!-- Footer -->
                            <tr>
                                <td align="center" style="font-size: 13px; color: #8c738c; border-top: 1px solid #f0e6f0; padding-top: 20px; margin-top: 24px;">
                                    Thank you for choosing EventSphere!<br>
                                    We look forward to seeing you at the event.
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
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