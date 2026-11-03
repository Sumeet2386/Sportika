import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'sumeetgite23@gmail.com';
const SMTP_USER = process.env.SMTP_USER || 'sumeetgite23@gmail.com';
const SMTP_PASS = process.env.SMTP_PASS || '';

// Create reusable transporter
const createTransporter = () => {
  if (!SMTP_PASS || SMTP_PASS === 'your_app_password') {
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // true for 465, false for 587
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
};

export interface SendOtpOptions {
  toEmail: string;
  userName?: string;
  otp: string;
  type?: 'registration' | 'login' | 'reset_password';
}

/**
 * Send an OTP verification email to a customer from sumeetgite23@gmail.com
 */
export async function sendOtpEmail({
  toEmail,
  userName = 'Valued Athlete',
  otp,
  type = 'registration',
}: SendOtpOptions): Promise<{ success: boolean; messageId?: string; simulated?: boolean }> {
  const transporter = createTransporter();

  const title =
    type === 'registration'
      ? 'Verify Your Sportika Account'
      : type === 'reset_password'
      ? 'Reset Your Sportika Password'
      : 'Your Sportika Sign-In Code';

  const actionText =
    type === 'registration'
      ? 'Thank you for joining the Sportika community! Please use the 6-digit code below to verify your email address and activate your account.'
      : type === 'reset_password'
      ? 'We received a request to reset your Sportika password. Use the verification code below to set a new password.'
      : 'Use this 6-digit one-time password (OTP) to quickly access your Sportika account.';

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0F172A; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #FFFFFF;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0F172A; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table role="presentation" width="100%" style="max-width: 540px; background-color: #1E293B; border-radius: 20px; overflow: hidden; box-shadow: 0 25px 60px rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.08);" cellspacing="0" cellpadding="0">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #0A1128 0%, #1565C0 100%); padding: 36px 32px 30px; text-align: center;">
              <div style="font-size: 28px; font-weight: 900; letter-spacing: 2px; font-style: italic; color: #FFFFFF; font-family: sans-serif;">
                SPORTI<span style="color: #FF6B35;">KA</span>
              </div>
              <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 3px; color: rgba(255,255,255,0.7); margin-top: 6px;">
                Global Sportswear & Performance Apparel
              </div>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 36px 32px;">
              <h2 style="margin: 0 0 12px; font-size: 22px; font-weight: 800; color: #FFFFFF; text-align: center;">
                ${title}
              </h2>

              <p style="font-size: 14px; line-height: 1.6; color: #94A3B8; text-align: center; margin: 0 0 28px;">
                Hello <strong>${userName}</strong>,<br>
                ${actionText}
              </p>

              <!-- OTP Code Display Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 0 0 28px;">
                <tr>
                  <td align="center">
                    <div style="background: linear-gradient(145deg, #0F172A, #182234); border: 2px dashed #FF6B35; border-radius: 16px; padding: 22px 32px; display: inline-block;">
                      <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #FF6B35; margin-bottom: 8px;">
                        Your Verification Code
                      </div>
                      <div style="font-size: 38px; font-weight: 900; letter-spacing: 12px; color: #FFFFFF; font-family: 'Courier New', Courier, monospace; text-shadow: 0 0 16px rgba(255,107,53,0.4);">
                        ${otp}
                      </div>
                      <div style="font-size: 12px; color: #64748B; margin-top: 8px;">
                        ⏱ Valid for 10 minutes
                      </div>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Security Notice -->
              <div style="background-color: rgba(255,255,255,0.04); border-left: 3px solid #3B82F6; border-radius: 8px; padding: 14px 16px; margin: 0 0 24px;">
                <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #94A3B8;">
                  🔒 <strong>Security Tip:</strong> Never share this code with anyone. Sportika representatives will never ask for your one-time verification password.
                </p>
              </div>

              <p style="font-size: 12px; color: #64748B; text-align: center; margin: 0;">
                If you did not request this email, you can safely ignore it.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0F172A; padding: 24px 32px; border-top: 1px solid rgba(255,255,255,0.06); text-align: center;">
              <p style="margin: 0 0 6px; font-size: 11px; color: #64748B;">
                Sent with ❤️ by <strong>Sportika Official</strong> (<a href="mailto:${ADMIN_EMAIL}" style="color: #FF6B35; text-decoration: none;">${ADMIN_EMAIL}</a>)
              </p>
              <p style="margin: 0; font-size: 10px; color: #475569;">
                © 2026 Sportika Global. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  if (!transporter) {
    console.log(`\n📬 [MAIL SIMULATOR - Live Transporter Not Configured]`);
    console.log(`From: Sportika <${ADMIN_EMAIL}>`);
    console.log(`To: ${toEmail}`);
    console.log(`Subject: ${title}`);
    console.log(`OTP Code: [ ${otp} ]`);
    console.log(`Tip: Add SMTP_PASS (Gmail 16-character App Password) in backend/.env to send real emails to inbox.\n`);
    return { success: true, simulated: true };
  }

  try {
    const info = await transporter.sendMail({
      from: `"Sportika Official" <${ADMIN_EMAIL}>`,
      to: toEmail,
      subject: `🔐 ${otp} is your Sportika verification code`,
      html,
    });

    console.log(`✅ [Real Email Sent via Gmail SMTP]: Message ID: ${info.messageId} to ${toEmail}`);
    return { success: true, messageId: info.messageId, simulated: false };
  } catch (error: any) {
    console.error(`❌ [SMTP Send Error]:`, error.message);
    // Still return success with simulated=true so customer registration doesn't fail
    return { success: false, simulated: true };
  }
}
