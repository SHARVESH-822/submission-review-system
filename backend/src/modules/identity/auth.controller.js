const {
  registerUser,
  loginUser,
  createPasswordResetOtp,
  verifyPasswordResetOtp,
  resetPassword
} = require('./auth.service');
const { successResponse } = require('../../utils/response.util');
const asyncHandler = require('../../utils/asyncHandler.util');

const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  const result = await registerUser({ name, email, password, role });
  return successResponse(res, 201, 'User registered successfully.', result);
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await loginUser({ email, password });
  return successResponse(res, 200, 'Login successful.', result);
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const result = await createPasswordResetOtp({ email });
  return successResponse(res, 200, 'OTP sent to your registered email address.', result);
});

const verifyResetOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const result = await verifyPasswordResetOtp({ email, otp });
  return successResponse(res, 200, 'OTP verified. Please enter a new password.', result);
});

const updatePassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  const result = await resetPassword({ token, password });
  return successResponse(res, 200, 'Password updated successfully. Please sign in.', result);
});

module.exports = { register, login, forgotPassword, verifyResetOtp, updatePassword };
