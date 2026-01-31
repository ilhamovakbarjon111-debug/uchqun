import nodemailer from 'nodemailer';
import logger from './logger.js';

// Create transporter based on environment variables
const createTransporter = () => {
  // If SMTP is configured, use it
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Fallback to Gmail OAuth2 if configured
  if (process.env.GMAIL_CLIENT_ID && process.env.GMAIL_CLIENT_SECRET && process.env.GMAIL_REFRESH_TOKEN) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.GMAIL_USER,
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN,
      },
    });
  }

  // Development: Use ethereal.email for testing (no real emails sent)
  if (process.env.NODE_ENV === 'development') {
    logger.warn('No email configuration found. Using console logging for email in development.');
    return {
      sendMail: async (options) => {
        logger.info('📧 Email would be sent:', {
          to: options.to,
          subject: options.subject,
          text: options.text?.substring(0, 100) + '...',
        });
        console.log('\n=== EMAIL (Development Mode) ===');
        console.log('To:', options.to);
        console.log('Subject:', options.subject);
        console.log('Body:', options.text || options.html);
        console.log('===============================\n');
        return { messageId: 'dev-' + Date.now() };
      },
    };
  }

  throw new Error('Email configuration not found. Please set SMTP or Gmail OAuth2 credentials.');
};

/**
 * Send email
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} text - Plain text body
 * @param {string} html - HTML body (optional)
 * @returns {Promise<Object>}
 */
export async function sendEmail(to, subject, text, html = null) {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.SMTP_USER || 'noreply@uchqun.uz',
      to,
      subject,
      text,
      html: html || text.replace(/\n/g, '<br>'),
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info('Email sent successfully', {
      to,
      subject,
      messageId: info.messageId,
    });
    return info;
  } catch (error) {
    logger.error('Failed to send email', {
      to,
      subject,
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

/**
 * Send admin registration approval email with login credentials
 * @param {string} email - Admin email
 * @param {string} password - Generated password
 * @param {string} firstName - Admin first name
 * @returns {Promise<Object>}
 */
export async function sendAdminApprovalEmail(email, password, firstName) {
  const subject = 'Uchqun Admin Panel - Login Ma\'lumotlari';
  const text = `
Salom ${firstName},

Sizning admin ro'yxatdan o'tish so'rovingiz super-admin tomonidan tasdiqlandi.

Quyidagi ma'lumotlar bilan tizimga kirishingiz mumkin:

Email: ${email}
Parol: ${password}

Eslatma: Xavfsizlik uchun iltimos, birinchi marta kirgandan so'ng parolingizni o'zgartiring.

Admin panel: ${process.env.ADMIN_PANEL_URL || 'http://localhost:5174'}

Hurmat bilan,
Uchqun Jamoasi
  `;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .credentials { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
        .credential-item { margin: 10px 0; }
        .label { font-weight: bold; color: #667eea; }
        .value { font-family: monospace; background: #f0f0f0; padding: 5px 10px; border-radius: 4px; }
        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Uchqun Admin Panel</h1>
        </div>
        <div class="content">
          <p>Salom <strong>${firstName}</strong>,</p>
          <p>Sizning admin ro'yxatdan o'tish so'rovingiz super-admin tomonidan tasdiqlandi.</p>
          
          <div class="credentials">
            <h3>Login Ma'lumotlari:</h3>
            <div class="credential-item">
              <span class="label">Email:</span>
              <span class="value">${email}</span>
            </div>
            <div class="credential-item">
              <span class="label">Parol:</span>
              <span class="value">${password}</span>
            </div>
          </div>

          <div class="warning">
            <strong>⚠️ Eslatma:</strong> Xavfsizlik uchun iltimos, birinchi marta kirgandan so'ng parolingizni o'zgartiring.
          </div>

          <p>
            <a href="${process.env.ADMIN_PANEL_URL || 'http://localhost:5174'}/login" 
               style="display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">
              Admin Panelga Kirish
            </a>
          </p>
        </div>
        <div class="footer">
          <p>Hurmat bilan,<br>Uchqun Jamoasi</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail(email, subject, text, html);
}
