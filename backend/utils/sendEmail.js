// ============================================
// sendEmail.js - Production Ready (Brevo API)
// يعمل على Render بدون SMTP
// ============================================

const axios = require('axios');

// ============================================
// إرسال البريد عبر Brevo API (HTTPS)
// ============================================
const sendEmail = async (options) => {
  try {
    console.log('📧 Sending email via Brevo API...');

    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: {
          name: process.env.EMAIL_FROM_NAME || 'Baker App',
          email: process.env.EMAIL_FROM_ADDRESS,
        },
        to: [
          {
            email: options.email,
          },
        ],
        subject: options.subject,
        htmlContent: options.html,
      },
      {
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    console.log('✅ Email sent successfully via Brevo API');
    console.log('📬 To:', options.email);
    console.log('📧 Subject:', options.subject);
    console.log('🆔 Message ID:', response.data.messageId);

    return response.data;
  } catch (error) {
    console.error(
      '❌ Brevo API Error:',
      error.response?.data || error.message
    );
    throw new Error('Email sending failed');
  }
};

// ============================================
// Templates (كما هي)
// ============================================

const getVerificationEmailTemplate = (verificationUrl, name) => {
  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial; background:#f4f4f4; padding:20px">
      <div style="max-width:600px;margin:auto;background:#fff;padding:30px;border-radius:10px">
        <h1>🎉 مرحباً ${name}!</h1>
        <p>يرجى تفعيل حسابك بالضغط على الزر أدناه:</p>
        <p style="text-align:center">
          <a href="${verificationUrl}" style="padding:12px 30px;background:#4CAF50;color:#fff;text-decoration:none;border-radius:5px">
            تفعيل الحساب
          </a>
        </p>
        <p>أو انسخ الرابط:</p>
        <a href="${verificationUrl}">${verificationUrl}</a>
        <p style="color:red;font-size:12px">⚠️ صالح لمدة 24 ساعة</p>
      </div>
    </body>
    </html>
  `;
};

const getResetPasswordEmailTemplate = (resetUrl, name) => {
  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
    </head>
    <body style="font-family: Arial; background:#f4f4f4; padding:20px">
      <div style="max-width:600px;margin:auto;background:#fff;padding:30px;border-radius:10px">
        <h1>🔐 إعادة تعيين كلمة المرور</h1>
        <p>مرحباً ${name}</p>
        <p>اضغط على الزر أدناه:</p>
        <p style="text-align:center">
          <a href="${resetUrl}" style="padding:12px 30px;background:#f44336;color:#fff;text-decoration:none;border-radius:5px">
            إعادة تعيين كلمة المرور
          </a>
        </p>
        <p>أو انسخ الرابط:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p style="color:red;font-size:12px">⚠️ صالح لمدة 10 دقائق</p>
      </div>
    </body>
    </html>
  `;
};

module.exports = {
  sendEmail,
  getVerificationEmailTemplate,
  getResetPasswordEmailTemplate,
};
