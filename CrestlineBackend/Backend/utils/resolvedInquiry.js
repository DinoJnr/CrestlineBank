const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const getSubjectStyles = (subject) => {
  const themes = {
    "Transaction Dispute": { color: "#ef4444", text: "Transaction Dispute" },
    "Tier Upgrade Issue": { color: "#a855f7", text: "Tier Upgrade Issue" },
    "Card Management": { color: "#f97316", text: "Card Management" },
    "Security/Recovery": { color: "#eab308", text: "Security & Recovery" },
    "Other Feedback": { color: "#0d9488", text: "Customer Feedback Support" }
  };
  return themes[subject] || { color: "#64748b", text: "Customer Support Portal" };
};

const sendInquiryResolutionEmail = async (user, inquiryData) => {
  const customerName = user.fullName || "Valued Client";
  const customerEmail = user.email;
  const { subject, message, resolutionNotes } = inquiryData;

  const theme = getSubjectStyles(subject);
  const date = new Date().toLocaleDateString("en-GB", { 
    day: "numeric", 
    month: "long", 
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  const html = `
  <!DOCTYPE html>
  <html>
  <body style="margin:0; padding:0; background:#f4f7f9; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
    <div style="max-width:600px; margin:32px auto; background:#ffffff; border-radius:12px; overflow:hidden; border:1px solid #e1e8ed;">
      
      <div style="background:#0a0a0b; padding:40px 32px; text-align:center; border-bottom: 4px solid ${theme.color};">
        <div style="display:inline-flex; align-items:center; gap:10px;">
          <span style="color:#ffffff; font-size:22px; font-weight:800; letter-spacing:-0.04em;">CRESTLINE</span>
        </div>
        <p style="color:#64748b; font-size:10px; letter-spacing:0.3em; text-transform:uppercase; margin:8px 0 0;">Official Ticket Resolution</p>
      </div>

      <div style="padding:40px 32px;">
        <p style="font-size:24px; color:#0f172a; margin:0 0 12px; font-weight:700;">Support Case Resolved</p>
        <p style="font-size:15px; color:#475569; line-height:1.6; margin:0 0 32px;">
          Hello ${customerName}, our administrative team has successfully reviewed and processed your support request concerning <strong>${theme.text}</strong>.
        </p>

        <div style="background:#f8fafc; border-radius:12px; padding:20px; margin-bottom:24px; border:1px solid #e2e8f0;">
          <span style="font-size:10px; color:#94a3b8; text-transform:uppercase; font-weight:700; letter-spacing:0.05em;">Your Inquiry Message:</span>
          <p style="font-size:14px; color:#475569; margin:8px 0 0; font-style:italic; line-height:1.5;">
            "${message}"
          </p>
        </div>

        <div style="border-left:4px solid ${theme.color}; background:#fafafa; padding:24px; margin-bottom:32px; border-radius:0 12px 12px 0; box-shadow: inset 1px 0 0 0 #e2e8f0, inset 0 1px 0 0 #e2e8f0, inset 0 -1px 0 0 #e2e8f0;">
          <span style="font-size:10px; color:${theme.color}; text-transform:uppercase; font-weight:800; letter-spacing:0.05em;">Official Resolution Notes:</span>
          <p style="font-size:14px; font-weight:600; color:#0f172a; margin:8px 0 0; line-height:1.6;">
            ${resolutionNotes || "This ticket has been marked as completed. No further actions are required from your end."}
          </p>
        </div>

        <div style="background:#ffffff; border-radius:12px; padding:20px; border:1px solid #e2e8f0;">
            <table style="width:100%;">
                <tr>
                    <td style="padding-bottom:10px;">
                        <span style="font-size:10px; color:#94a3b8; text-transform:uppercase;">Category Block</span>
                        <div style="font-size:13px; font-weight:700; color:#0f172a; margin-top:2px;">${subject}</div>
                    </td>
                    <td style="padding-bottom:10px; text-align:right;">
                        <span style="font-size:10px; color:#94a3b8; text-transform:uppercase;">Resolution Status</span>
                        <div style="font-size:13px; font-weight:700; color:#10b981; margin-top:2px;">ARCHIVED / CLOSED</div>
                    </td>
                </tr>
                <tr>
                    <td style="padding-top:10px; border-top:1px dashed #e2e8f0;">
                        <span style="font-size:10px; color:#94a3b8; text-transform:uppercase;">Processed At</span>
                        <div style="font-size:13px; font-weight:600; color:#0f172a; margin-top:2px;">${date}</div>
                    </td>
                </tr>
            </table>
        </div>

        <p style="font-size:13px; color:#64748b; margin:32px 0 0; text-align:center; line-height:1.5;">
          If you feel your issue was not fully addressed, please reply directly to this email or open an updated log trace terminal inside your dashboard account workspace.
        </p>
      </div>

      <div style="background:#f1f5f9; padding:24px 32px; text-align:center;">
        <p style="font-size:10px; color:#94a3b8; margin:0;">
          &copy; ${new Date().getFullYear()} Crestline Institutional Terminal. Securing the world's most valuable financial assets.
        </p>
      </div>
    </div>
  </body>
  </html>
  `;

  return transporter.sendMail({
    from: `"Crestline Support" <${process.env.EMAIL_USER}>`,
    to: customerEmail,
    subject: `Support Resolved: ${subject}`,
    html,
  });
};

module.exports = { sendInquiryResolutionEmail };