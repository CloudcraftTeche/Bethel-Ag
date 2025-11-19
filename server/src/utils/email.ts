import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

interface WelcomeEmailOptions {
  to: string;
  name: string;
  email: string;
  password: string;
}

interface PasswordResetOTPOptions {
  to: string;
  name: string;
  otp: string;
}

const createTransporter = () => {
  const requiredEnvVars = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASSWORD'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error(`❌ Missing email environment variables: ${missingVars.join(', ')}`);
    return null;
  }

  const config: any = {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_PORT === '465',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 30000,
  };

  if (process.env.EMAIL_PORT !== '465') {
    config.tls = {
      rejectUnauthorized: process.env.NODE_ENV === 'production',
      minVersion: 'TLSv1.2'
    };
  }

  config.pool = true;
  config.maxConnections = 5;
  config.maxMessages = 10;

  return nodemailer.createTransport(config);
};

export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      console.error('❌ Email transporter not configured properly');
      return false;
    }

    try {
      await transporter.verify();
      console.log('✅ SMTP connection verified');
    } catch (verifyError) {
      console.error('❌ SMTP verification failed:', verifyError);
      return false;
    }

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Bethel AG Dubai'}" <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    
    transporter.close();
    
    return true;
  } catch (error: any) {
    console.error('❌ Error sending email:', error);
    console.error('Error details:', {
      code: error.code,
      command: error.command,
      message: error.message,
      response: error.response,
    });
    return false;
  }
};

export const sendWelcomeEmail = async (options: WelcomeEmailOptions): Promise<boolean> => {
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; border-radius: 20px;">
      <div style="background: white; padding: 40px; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #333; margin: 0; font-size: 32px; font-weight: 700; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
            Welcome to Bethel AG Dubai! 🎉
          </h1>
        </div>
        
        <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Hi ${options.name},
        </p>
        
        <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
          Your account has been successfully created! Here are your login credentials:
        </p>
        
        <div style="background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); padding: 25px; border-radius: 12px; margin-bottom: 30px;">
          <p style="color: #333; font-size: 14px; margin: 0 0 10px 0;">
            <strong>Email:</strong> ${options.email}
          </p>
          <p style="color: #333; font-size: 14px; margin: 0;">
            <strong>Temporary Password:</strong> <code style="background: white; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${options.password}</code>
          </p>
        </div>
        
        <div style="background: #fff3cd; padding: 20px; border-radius: 12px; margin-bottom: 30px; border-left: 4px solid #ffc107;">
          <p style="color: #856404; font-size: 14px; margin: 0; line-height: 1.6;">
            <strong>Important:</strong> Please change your password after your first login for security purposes.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 40px; padding-top: 30px; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 13px; margin: 0;">
            © ${new Date().getFullYear()} Bethel AG Dubai. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  `;

  return sendEmail({
    to: options.to,
    subject: 'Welcome to Bethel AG Dubai - Your Account Details',
    html,
  });
};

export const sendPasswordResetOTP = async (options: PasswordResetOTPOptions): Promise<boolean> => {
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; border-radius: 20px;">
      <div style="background: white; padding: 40px; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="display: inline-block; background: linear-gradient(135deg, #FF6B6B 0%, #C92A2A 100%); width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
            <span style="font-size: 48px; color: white;">🔒</span>
          </div>
          <h1 style="color: #333; margin: 0; font-size: 28px; font-weight: 700;">Password Reset Request</h1>
        </div>
        
        <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Hi ${options.name},
        </p>
        
        <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
          We received a request to reset your password. Use the verification code below in the app to reset your password:
        </p>
        
        <div style="background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); padding: 25px; border-radius: 12px; margin-bottom: 30px; text-align: center;">
          <p style="color: #333; font-size: 14px; margin: 0 0 10px 0;">
            <strong>Verification Code:</strong>
          </p>
          <p style="color: #333; font-size: 48px; margin: 0; font-family: monospace; letter-spacing: 8px; font-weight: bold;">
            ${options.otp}
          </p>
          <p style="color: #666; font-size: 12px; margin: 10px 0 0 0;">
            Enter this code in the app to reset your password
          </p>
        </div>
        
        <div style="background: #fff3cd; padding: 20px; border-radius: 12px; margin-bottom: 30px; border-left: 4px solid #ffc107;">
          <p style="color: #856404; font-size: 14px; margin: 0 0 10px 0; line-height: 1.6;">
            <strong>Security Notice:</strong>
          </p>
          <ul style="color: #856404; font-size: 14px; margin: 0; padding-left: 20px; line-height: 1.6;">
            <li>This code will expire in 10 minutes</li>
            <li>Never share this code with anyone</li>
            <li>If you didn't request this reset, please ignore this email</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin-top: 40px; padding-top: 30px; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 13px; margin: 0;">
            © ${new Date().getFullYear()} Bethel AG Dubai. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  `;

  return sendEmail({
    to: options.to,
    subject: 'Password Reset OTP - Bethel AG Dubai',
    html,
  });
};