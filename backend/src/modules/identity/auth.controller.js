const { registerUser, loginUser } = require('./auth.service');
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

module.exports = { register, login };