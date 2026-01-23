// ============================================
// Email Service - Centralized Email Operations
// ============================================
const { sendEmail, getVerificationEmailTemplate, getResetPasswordEmailTemplate } = require('../utils/sendEmail');
const { Logger } = require('../utils/logger');
const config = require('../config/config');

class EmailService {
  /**
   * Send verification email
   */
  static async sendVerificationEmail(user, verificationToken) {
    const verificationUrl = `${config.frontend.url}/verify-email/${verificationToken}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'تفعيل حساب Merna',
        html: getVerificationEmailTemplate(verificationUrl, user.name)
      });

      Logger.info('Verification email sent', {
        userId: user._id,
        email: user.email
      });

      return { success: true };
    } catch (error) {
      Logger.error('Failed to send verification email', error, {
        userId: user._id,
        email: user.email
      });

      throw new Error('فشل إرسال إيميل التفعيل');
    }
  }

  /**
   * Send password reset email
   */
  static async sendPasswordResetEmail(user, resetToken) {
    const resetUrl = `${config.frontend.url}/reset-password/${resetToken}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'إعادة تعيين كلمة المرور - Merna',
        html: getResetPasswordEmailTemplate(resetUrl, user.name)
      });

      Logger.info('Password reset email sent', {
        userId: user._id,
        email: user.email
      });

      return { success: true };
    } catch (error) {
      Logger.error('Failed to send password reset email', error, {
        userId: user._id,
        email: user.email
      });

      throw new Error('فشل إرسال إيميل إعادة التعيين');
    }
  }

  /**
   * Send welcome email after verification
   */
  static async sendWelcomeEmail(user) {
    try {
      const welcomeTemplate = `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
        </head>
        <body style="font-family: Arial; background:#f4f4f4; padding:20px">
          <div style="max-width:600px;margin:auto;background:#fff;padding:30px;border-radius:10px">
            <h1>🎉 مرحباً ${user.name}!</h1>
            <p>نحن سعداء بانضمامك إلى Merna لتعلم اللغة الألمانية.</p>
            <p>يمكنك الآن البدء بإضافة الجمل والبطاقات التعليمية.</p>
            <p>نتمنى لك رحلة تعليمية ممتعة! 📚</p>
          </div>
        </body>
        </html>
      `;

      await sendEmail({
        email: user.email,
        subject: 'مرحباً بك في Merna!',
        html: welcomeTemplate
      });

      Logger.info('Welcome email sent', {
        userId: user._id,
        email: user.email
      });

      return { success: true };
    } catch (error) {
      // Don't throw - welcome email is not critical
      Logger.warn('Failed to send welcome email', {
        userId: user._id,
        email: user.email,
        error: error.message
      });

      return { success: false };
    }
  }
}

module.exports = EmailService;
