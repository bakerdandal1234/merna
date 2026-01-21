const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '*****' : 'غير موجود');

  // إنشاء transporter
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
  });

  // Email options
  const mailOptions = {
    from: `Merna App <${process.env.EMAIL_FROM}>`,
    to: options.email,
    subject: options.subject,
    html: options.html
  };

  // إرسال الإيميل
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    console.log('📬 To:', options.email);
    console.log('📧 Subject:', options.subject);
    return info;
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    throw error;
  }
};

// Template للتحقق من الإيميل
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

// Template لإعادة تعيين كلمة المرور
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
