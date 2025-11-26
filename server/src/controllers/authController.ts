import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { validationResult } from 'express-validator';
import User from '../models/User';
import { sendEmail, sendWelcomeEmail, sendPasswordResetOTP } from '../utils/email';

const generatePassword = (length: number = 10): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  
  return password;
};

const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const register = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, nickname, role, mobile, alternateMobile, address, spouse, children, nativePlace, church } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const generatedPassword = generatePassword(10);
    

    user = new User({
      name,
      email,
      nickname,
      role: role || 'user',
      mobile,
      alternateMobile,
      address,
      spouse,
      children,
      nativePlace,
      church,
      password: generatedPassword,
    });

    await user.save();

    await sendWelcomeEmail({
      to: user.email,
      name: user.name,
      email: user.email,
      password: generatedPassword,
    });

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      message: 'User created. Password sent to email.',
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password.trim());
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '30d' }
    );

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        nickname: user.nickname,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email }).select('+resetPasswordAttempts +resetPasswordLastAttempt');
    if (!user) {
      return res.json({ 
        success: true,
        message: 'If an account exists with this email, you will receive a password reset code.',
      });
    }

    const now = new Date();
    const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);
    
    if (user.resetPasswordLastAttempt && user.resetPasswordLastAttempt > fifteenMinutesAgo) {
      if ((user.resetPasswordAttempts || 0) >= 3) {
        return res.status(429).json({ 
          message: 'Too many password reset attempts. Please try again after 15 minutes.',
          retryAfter: Math.ceil((user.resetPasswordLastAttempt.getTime() + 15 * 60 * 1000 - now.getTime()) / 1000)
        });
      }
    } else {
      user.resetPasswordAttempts = 0;
    }

    const otp = generateOTP();
    
    console.log('========== PASSWORD RESET OTP ==========');
    console.log('📧 Email:', email);
    console.log('🔢 OTP:', otp);
    console.log('⏰ Expires in: 10 minutes');
    console.log('========================================');
    
    user.resetPasswordOTP = crypto.createHash('sha256').update(otp).digest('hex');
    user.resetPasswordOTPExpire = new Date(Date.now() + 10 * 60 * 1000);
    user.resetPasswordAttempts = (user.resetPasswordAttempts || 0) + 1;
    user.resetPasswordLastAttempt = now;
    
    await user.save();

    const emailSent = await sendPasswordResetOTP({
      to: user.email,
      name: user.name,
      otp: otp,
    });

    if (!emailSent) {
      console.warn(`⚠️ Failed to send OTP email to ${user.email}`);
      
      return res.json({ 
        success: true,
        message: 'Email service unavailable. Please use the verification code below or contact support.',
        ...(process.env.NODE_ENV === 'development' && { otp: otp }), 
        expiresIn: 600 
      });
    }

    console.log('✅ Password reset OTP sent to:', email);

    res.json({
      success: true,
      message: 'Password reset code sent to your email. Valid for 10 minutes.',
      expiresIn: 600
    });
  } catch (error) {
    console.error('❌ Forgot password error:', error);
    res.status(500).json({ message: 'Error processing request' });
  }
};

export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

    const user = await User.findOne({
      email,
      resetPasswordOTP: hashedOTP,
      resetPasswordOTPExpire: { $gt: Date.now() },
    }).select('+resetPasswordOTP +resetPasswordOTPExpire');

    if (!user) {
      console.log('❌ Invalid or expired OTP for:', email);
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const resetToken = jwt.sign(
      { userId: user._id, type: 'password-reset' },
      process.env.JWT_SECRET as string,
      { expiresIn: '15m' }
    );

    console.log('✅ OTP verified successfully for:', email);

    res.json({ 
      success: true, 
      message: 'OTP verified successfully',
      resetToken 
    });
  } catch (error) {
    console.error('❌ Verify OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { resetToken, password } = req.body;

    if (!resetToken || !password) {
      return res.status(400).json({ message: 'Reset token and password are required' });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET as string);
      if (decoded.type !== 'password-reset') {
        throw new Error('Invalid token type');
      }
    } catch (error) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const user = await User.findById(decoded.userId).select('+resetPasswordOTP +resetPasswordOTPExpire +password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('========== PASSWORD RESET ==========');
    console.log('📧 Email:', user.email);
    console.log('🔑 New Password:', password);
    console.log('====================================');

    // Set new password - will be hashed by pre-save hook
    user.password = password;
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpire = undefined;
    user.resetPasswordAttempts = 0;
    user.resetPasswordLastAttempt = undefined;
    await user.save();

    // Verify the new password works
    const testUser = await User.findById(user._id).select('+password');
    if (testUser) {
      const testMatch = await bcrypt.compare(password, testUser.password);
      console.log('🧪 New Password Test (should be true):', testMatch);
    }

    console.log('✅ Password reset successful for:', user.email);

    await sendEmail({
      to: user.email,
      subject: 'Password Reset Successful - Bethel AG Dubai',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; border-radius: 20px;">
          <div style="background: white; padding: 40px; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="display: inline-block; background: linear-gradient(135deg, #30D158 0%, #28A745 100%); width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                <span style="font-size: 48px; color: white;">✓</span>
              </div>
              <h1 style="color: #333; margin: 0; font-size: 28px; font-weight: 700;">Password Reset Successful!</h1>
            </div>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Hi ${user.name},
            </p>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
              Your password has been successfully reset. You can now log in to your account using your new password.
            </p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; margin-bottom: 30px; border-left: 4px solid #30D158;">
              <p style="color: #333; font-size: 14px; margin: 0; line-height: 1.6;">
                <strong>Security Tip:</strong> If you didn't make this change or if you believe an unauthorized person has accessed your account, please contact us immediately.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 40px; padding-top: 30px; border-top: 1px solid #eee;">
              <p style="color: #999; font-size: 13px; margin: 0;">
                © ${new Date().getFullYear()} Bethel AG Dubai. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      `,
    });

    res.json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    console.error('❌ Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = (req as any).user.userId;

    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('========== CHANGE PASSWORD ==========');
    console.log('📧 Email:', user.email);
    console.log('====================================');

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      console.log('❌ Old password incorrect');
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    // Verify the new password works
    const testUser = await User.findById(user._id).select('+password');
    if (testUser) {
      const testMatch = await bcrypt.compare(newPassword, testUser.password);
      console.log('🧪 New Password Test (should be true):', testMatch);
    }

    console.log('✅ Password changed successfully for:', user.email);

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('❌ Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};