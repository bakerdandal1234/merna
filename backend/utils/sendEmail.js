// ============================================
// sendEmail.js - Production Ready with Brevo
// يدعم Brevo (الأساسي) و Gmail (احتياطي)
// ============================================

const nodemailer = require('nodemailer');

// ============================================
// طريقة 1: Brevo (Sendinblue) SMTP
// ============================================
const brevoTransporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false, // true للـ 465, false للـ 587
  auth: {
    user: 'apikey', // الإيميل الخاص بك في Brevo
    pass: process.env.BREVO_SMTP_KEY   // SMTP Key من Brevo
  },
  tls: {
    rejectUnauthorized: true
  }
});

// ============================================
// طريقة 2: Gmail Fallback
// ============================================
const gmailTransporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  connectionTimeout: 10000
});

// ============================================
// إرسال عبر Brevo
// ============================================
const sendViaBrevo = async (options) => {
  if (!process.env.BREVO_SMTP_USER || !process.env.BREVO_SMTP_KEY) {
    throw new Error('Brevo not configured');
  }

  const mailOptions = {
    from: `${process.env.EMAIL_FROM_NAME || 'Merna App'} <${process.env.BREVO_SMTP_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.html
  };

  return await brevoTransporter.sendMail(mailOptions);
};

// ============================================
// إرسال عبر Gmail
// ============================================
const sendViaGmail = async (options) => {
  const mailOptions = {
    from: `${process.env.EMAIL_FROM_NAME || 'Merna App'} <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.html
  };

  return await gmailTransporter.sendMail(mailOptions);
};

// ============================================
// الدالة الرئيسية مع Fallback
// ============================================
const sendEmail = async (options) => {
  let lastError;

  // المحاولة 1: Brevo (إذا كان مُفعّل)
  if (process.env.BREVO_SMTP_USER && process.env.BREVO_SMTP_KEY) {
    try {
      console.log('📧 Attempting to send via Brevo (Sendinblue)...');
      const info = await sendViaBrevo(options);
      console.log('✅ Email sent successfully via Brevo');
      console.log('📬 To:', options.email);
      console.log('📧 Subject:', options.subject);
      console.log('🆔 Message ID:', info.messageId);
      return info;
    } catch (error) {
      console.error('⚠️ Brevo failed:', error.message);
      lastError = error;
      // Continue to Gmail fallback
    }
  }

  // المحاولة 2: Gmail (Fallback)
  if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    try {
      console.log('📧 Attempting to send via Gmail...');
      const info = await sendViaGmail(options);
      console.log('✅ Email sent successfully via Gmail');
      console.log('📬 To:', options.email);
      console.log('📧 Subject:', options.subject);
      console.log('🆔 Message ID:', info.messageId);
      return info;
    } catch (error) {
      console.error('❌ Gmail also failed:', error.message);
      lastError = error;
    }
  }

  // كل الطرق فشلت
  console.error('❌ All email providers failed');
  throw lastError || new Error('No email provider configured');
};

// ============================================
// Templates (بدون تغيير)
// ============================================
const getVerificationEmailTemplate = (verificationUrl, name) => {
  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .button { display: inline-block; padding: 12px 30px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; }
        .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 مرحباً ${name}!</h1>
        </div>
        <p>شكراً لتسجيلك في تطبيق Merna.</p>
        <p>يرجى تفعيل حسابك بالضغط على الزر أدناه:</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" class="button">تفعيل الحساب</a>
        </p>
        <p style="color: #666; font-size: 14px;">
          أو انسخ هذا الرابط في المتصفح:<br>
          <a href="${verificationUrl}">${verificationUrl}</a>
        </p>
        <p style="color: #d32f2f; font-size: 12px;">
          ⚠️ هذا الرابط صالح لمدة 24 ساعة فقط
        </p>
        <div class="footer">
          <p>إذا لم تقم بالتسجيل، يرجى تجاهل هذا الإيميل.</p>
          <p>&copy; 2024 Merna App. جميع الحقوق محفوظة.</p>
        </div>
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
      <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .button { display: inline-block; padding: 12px 30px; background-color: #f44336; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; }
        .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🔐 إعادة تعيين كلمة المرور</h1>
        <p>مرحباً ${name},</p>
        <p>لقد تلقينا طلباً لإعادة تعيين كلمة المرور لحسابك.</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" class="button">إعادة تعيين كلمة المرور</a>
        </p>
        <p style="color: #666; font-size: 14px;">
          أو انسخ هذا الرابط:<br>
          <a href="${resetUrl}">${resetUrl}</a>
        </p>
        <p style="color: #d32f2f; font-size: 12px;">
          ⚠️ هذا الرابط صالح لمدة 10 دقائق فقط
        </p>
        <div class="footer">
          <p style="color: #d32f2f;">إذا لم تطلب إعادة التعيين، يرجى تجاهل هذا الإيميل.</p>
          <p>&copy; 2024 Merna App.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = {
  sendEmail,
  getVerificationEmailTemplate,
  getResetPasswordEmailTemplate
};
