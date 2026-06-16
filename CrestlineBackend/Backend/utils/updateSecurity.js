const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendSecurityUpdateEmail = async (user, type) => {
  const customerName = user.fullName || "Valued Client";
  const customerEmail = user.email;
  const securityType = type === 'password' ? "Login Password" : "Transaction PIN";
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
      <div style="background:#0a0a0b; padding:40px 32px; text-align:center; border-bottom: 4px solid #ef4444;">
        <div style="display:inline-flex; align-items:center; gap:10px;">
          <span style="color:#ffffff; font-size:22px; font-weight:800; letter-spacing:-0.04em;">CRESTLINE</span>
        </div>
        <p style="color:#64748b; font-size:10px; letter-spacing:0.3em; text-transform:uppercase; margin:8px 0 0;">Security Protocol Alert</p>
      </div>

      <div style="padding:40px 32px;">
        <p style="font-size:24px; color:#0f172a; margin:0 0 12px; font-weight:700;">Security Update Detected</p>
        <p style="font-size:15px; color:#475569; line-height:1.6; margin:0 0 32px;">
          Hello ${customerName}, this is an automated notification to confirm that your <strong>${securityType}</strong> has been successfully updated.
        </p>

        <div style="background:#f8fafc; border-radius:16px; padding:24px; margin-bottom:32px; border:1px solid #e2e8f0;">
            <table style="width:100%;">
                <tr>
                    <td style="padding-bottom:10px;">
                        <span style="font-size:10px; color:#94a3b8; text-transform:uppercase;">Credential Type</span>
                        <div style="font-size:14px; font-weight:600; color:#0f172a;">${securityType}</div>
                    </td>
                    <td style="padding-bottom:10px; text-align:right;">
                        <span style="font-size:10px; color:#94a3b8; text-transform:uppercase;">Status</span>
                        <div style="font-size:14px; font-weight:600; color:#10b981;">SUCCESSFUL</div>
                    </td>
                </tr>
                <tr>
                    <td>
                        <span style="font-size:10px; color:#94a3b8; text-transform:uppercase;">Timestamp</span>
                        <div style="font-size:14px; font-weight:600; color:#0f172a;">${date}</div>
                    </td>
                </tr>
            </table>
        </div>

        <div style="border-left:3px solid #ef4444; background:#fef2f2; padding:20px; margin-bottom:32px;">
            <p style="font-size:13px; font-weight:700; color:#991b1b; margin:0 0 4px; text-transform:uppercase;">Not You?</p>
            <p style="font-size:13px; color:#b91c1c; margin:0;">
                If you did not authorize this change, your vault may be compromised. Please contact the Crestline Security Terminal immediately to freeze your account.
            </p>
        </div>
      </div>

      <div style="background:#f1f5f9; padding:24px 32px; text-align:center;">
        <p style="font-size:10px; color:#cbd5e1; margin:0;">
          &copy; ${new Date().getFullYear()} Crestline Institutional. Securing the world's most valuable assets.
        </p>
      </div>
    </div>
  </body>
  </html>
  `;

  return transporter.sendMail({
    from: `"Crestline Security" <${process.env.EMAIL_USER}>`,
    to: customerEmail,
    subject: `Security Alert: ${securityType} Modified`,
    html,
  });
};

module.exports = { sendSecurityUpdateEmail };