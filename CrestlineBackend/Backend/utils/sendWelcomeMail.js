const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendRegisterwelcomeEmail = async (user) => {
  const customerName = user.fullName || "Valued Client";
  const customerEmail = user.email;
  const accountNumber = user.accountNumber;
  const balance = Number(user.balance || 0).toLocaleString();
  const date = new Date().toLocaleDateString("en-GB", { 
    day: "numeric", 
    month: "long", 
    year: "numeric" 
  });

  const html = `
  <!DOCTYPE html>
  <html>
  <body style="margin:0; padding:0; background:#f4f7f9; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
    <div style="max-width:600px; margin:32px auto; background:#ffffff; border-radius:12px; overflow:hidden; border:1px solid #e1e8ed; shadow: 0 4px 12px rgba(0,0,0,0.05);">

      <div style="background:#0a0a0b; padding:40px 32px; text-align:center; border-bottom: 4px solid #2563eb;">
        <div style="display:inline-flex; align-items:center; gap:10px;">
          <div style="width:24px; height:24px; background:#2563eb; border-radius:4px;"></div>
          <span style="color:#ffffff; font-size:22px; font-weight:800; letter-spacing:-0.04em; italic">CRESTLINE</span>
        </div>
        <p style="color:#64748b; font-size:10px; letter-spacing:0.3em; text-transform:uppercase; margin:8px 0 0;">
          Premier Digital Vault
        </p>
      </div>

      <div style="background:#f0f9ff; padding:12px 32px; text-align:center; border-bottom: 1px solid #e0f2fe;">
        <span style="color:#0369a1; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.1em;">
          Institutional Account Activated
        </span>
      </div>

      <div style="padding:40px 32px;">
        <p style="font-size:24px; color:#0f172a; margin:0 0 12px; font-weight:700; letter-spacing:-0.02em;">
          Welcome to the Elite, ${customerName.split('')[0]}
        </p>
        <p style="font-size:15px; color:#475569; line-height:1.6; margin:0 0 32px;">
          Your digital infrastructure is now live. At Crestline, we provide more than just banking; we provide the precision tools necessary to architect your financial future.
        </p>

        <div style="background:#0f172a; border-radius:16px; padding:24px; margin-bottom:32px; color:#ffffff; position:relative; overflow:hidden;">
            <div style="position:absolute; top:-20px; right:-20px; width:100px; height:100px; background:rgba(37,99,235,0.2); border-radius:50%;"></div>
            
            <table style="width:100%;" cellpadding="0" cellspacing="0">
                <tr>
                    <td style="padding-bottom:20px;">
                        <span style="font-size:10px; color:#94a3b8; text-transform:uppercase; letter-spacing:0.15em;">Account Holder</span>
                        <div style="font-size:16px; font-weight:600; margin-top:4px;">${customerName}</div>
                    </td>
                </tr>
                <tr>
                    <td>
                        <span style="font-size:10px; color:#94a3b8; text-transform:uppercase; letter-spacing:0.15em;">Account Number</span>
                        <div style="font-size:20px; font-weight:700; letter-spacing:0.2em; margin-top:4px; color:#3b82f6;">${accountNumber}</div>
                    </td>
                    <td style="text-align:right;">
                        <span style="font-size:10px; color:#94a3b8; text-transform:uppercase; letter-spacing:0.15em;">Initial Balance</span>
                        <div style="font-size:20px; font-weight:700; margin-top:4px;">$${balance}</div>
                    </td>
                </tr>
            </table>
        </div>

        <div style="border-left:3px solid #2563eb; background:#f8fafc; padding:20px; margin-bottom:32px;">
            <p style="font-size:13px; font-weight:700; color:#0f172a; margin:0 0 4px; text-transform:uppercase;">Next Steps: Funding</p>
            <p style="font-size:13px; color:#64748b; margin:0;">
                Your vault is ready but empty. To begin accruing our <strong>5.2% APY</strong>, please initiate a transfer to your new account number above.
            </p>
        </div>

        <a href="${process.env.CLIENT_URL}/login" style="display:block; background:#2563eb; color:#ffffff; text-align:center; padding:18px; border-radius:8px; text-decoration:none; font-weight:700; font-size:14px; text-transform:uppercase; letter-spacing:0.1em;">
            Access Your Vault
        </a>

      </div>

      <div style="background:#f1f5f9; padding:24px 32px; text-align:center;">
        <p style="font-size:11px; color:#94a3b8; margin:0 0 8px; text-transform:uppercase; letter-spacing:0.1em;">
          Military-Grade Encryption &nbsp;·&nbsp; AES-256 Enabled
        </p>
        <p style="font-size:10px; color:#cbd5e1; margin:0;">
          &copy; ${new Date().getFullYear()} Crestline Institutional. All rights reserved.
        </p>
      </div>
    </div>
  </body>
  </html>
  `;

  return transporter.sendMail({
    from: `"Crestline Vault" <${process.env.EMAIL_USER}>`,
    to: customerEmail,
    subject: `Vault Activated: ${accountNumber}`,
    html,
  });
};

module.exports = { sendRegisterwelcomeEmail };