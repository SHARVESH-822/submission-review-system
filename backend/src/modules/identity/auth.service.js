const crypto = require('crypto');
const User = require('./models/user.model');
const { hashPassword, comparePassword } = require('../../utils/password.util');
const { generateToken } = require('../../utils/jwt.util');
const AppError = require('../../utils/appError.util');
const { sendEmail } = require('../../utils/email.util');

const hashValue = (value) => crypto.createHash('sha256').update(value).digest('hex');

const buildOtpEmail = (name, otp) => ({
  subject: 'SRMS password reset OTP',
  text: `Hi ${name}, your SRMS password reset OTP is ${otp}. It expires in 10 minutes.`,
  html: `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937">
      <h2 style="margin:0 0 12px;color:#0f2a43">SRMS password reset</h2>
      <p>Hi ${name},</p>
      <p>Use this OTP to reset your password. It expires in 10 minutes.</p>
      <div style="font-size:28px;font-weight:700;letter-spacing:6px;color:#2563eb;margin:20px 0">${otp}</div>
      <p>If you did not request this, you can ignore this email.</p>
    </div>
  `
});

const buildPasswordChangedEmail = (name) => ({
  subject: 'Your SRMS password was changed',
  text: `Hi ${name}, your SRMS account password has been changed successfully. If this was not you, contact the administrator immediately.`,
  html: `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937">
      <h2 style="margin:0 0 12px;color:#0f2a43">Password changed successfully</h2>
      <p>Hi ${name},</p>
      <p>Your SRMS account password has been changed successfully.</p>
      <p>If this was not you, contact the administrator immediately.</p>
    </div>
  `
});

const registerUser = async ({ name, email, password, role }) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new AppError('Email already registered. Please use a different email.', 400);
  }

  const hashedPassword = await hashPassword(password);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role
  });

  const token = generateToken({ id: user._id, role: user.role });

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  };
};

const loginUser = async ({ email, password }) => {
  if (!email || !password) {
    throw new AppError('Please provide email and password.', 400);
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError('Invalid email or password.', 401);
  }

  const isPasswordCorrect = await comparePassword(password, user.password);

  if (!isPasswordCorrect) {
    throw new AppError('Invalid email or password.', 401);
  }

  const token = generateToken({ id: user._id, role: user.role });

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  };
};

const createPasswordResetOtp = async ({ email }) => {
  if (!email) {
    throw new AppError('Please provide your email address.', 400);
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError('No account found with that email address.', 404);
  }

  const otp = crypto.randomInt(100000, 999999).toString();
  user.passwordResetOtp = hashValue(otp);
  user.passwordResetOtpExpires = Date.now() + 10 * 60 * 1000;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save({ validateBeforeSave: false });

  const otpEmail = buildOtpEmail(user.name, otp);
  await sendEmail({
    to: user.email,
    subject: otpEmail.subject,
    text: otpEmail.text,
    html: otpEmail.html
  });

  return {
    email: user.email
  };
};

const verifyPasswordResetOtp = async ({ email, otp }) => {
  if (!email || !otp) {
    throw new AppError('Please provide email and OTP.', 400);
  }

  const user = await User.findOne({
    email,
    passwordResetOtp: hashValue(otp),
    passwordResetOtpExpires: { $gt: Date.now() }
  });

  if (!user) {
    throw new AppError('OTP is invalid or has expired.', 400);
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = hashValue(resetToken);
  user.passwordResetExpires = Date.now() + 15 * 60 * 1000;
  user.passwordResetOtp = undefined;
  user.passwordResetOtpExpires = undefined;
  await user.save({ validateBeforeSave: false });

  return {
    email: user.email,
    resetToken
  };
};

const resetPassword = async ({ token, password }) => {
  if (!token || !password) {
    throw new AppError('Please provide reset token and new password.', 400);
  }

  if (password.length < 6) {
    throw new AppError('Password must be at least 6 characters long.', 400);
  }

  const hashedToken = hashValue(token);
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) {
    throw new AppError('Reset token is invalid or has expired.', 400);
  }

  user.password = await hashPassword(password);
  user.passwordResetOtp = undefined;
  user.passwordResetOtpExpires = undefined;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  const changedEmail = buildPasswordChangedEmail(user.name);
  await sendEmail({
    to: user.email,
    subject: changedEmail.subject,
    text: changedEmail.text,
    html: changedEmail.html
  });

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  };
};

module.exports = {
  registerUser,
  loginUser,
  createPasswordResetOtp,
  verifyPasswordResetOtp,
  resetPassword
};
