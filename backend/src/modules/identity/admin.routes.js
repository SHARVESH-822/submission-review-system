const express = require('express');
const router = express.Router();
const asyncHandler = require('../../utils/asyncHandler.util');
const { protect } = require('../../middlewares/auth.middleware');
const { checkPermission } = require('../../middlewares/permission.middleware');
const User = require('./models/user.model');
const Submission = require('../governance/models/submission.model');
const { successResponse } = require('../../utils/response.util');

// GET /api/admin/users
router.get(
  '/users',
  protect,
  checkPermission('MANAGE_USERS'),
  asyncHandler(async (req, res) => {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    return successResponse(res, 200, 'Users fetched successfully', { users });
  })
);

// GET /api/admin/analytics
router.get(
  '/analytics',
  protect,
  checkPermission('VIEW_ANALYTICS'),
  asyncHandler(async (req, res) => {
    const totalUsers = await User.countDocuments();
    const totalContributors = await User.countDocuments({ role: 'CONTRIBUTOR' });
    const totalReviewers = await User.countDocuments({ role: 'REVIEWER' });
    const totalSubmissions = await Submission.countDocuments();
    const pendingSubmissions = await Submission.countDocuments({ status: 'PENDING' });
    const approvedSubmissions = await Submission.countDocuments({ status: 'APPROVED' });
    const rejectedSubmissions = await Submission.countDocuments({ status: 'REJECTED' });

    return successResponse(res, 200, 'Analytics fetched successfully', {
      totalUsers,
      totalContributors,
      totalReviewers,
      totalSubmissions,
      pendingSubmissions,
      approvedSubmissions,
      rejectedSubmissions
    });
  })
);

// DELETE /api/admin/users/:id
router.delete(
  '/users/:id',
  protect,
  checkPermission('DELETE_USER'),
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.role === 'ADMIN') {
      return res.status(403).json({ message: 'Cannot delete an Admin user' });
    }
    await User.findByIdAndDelete(req.params.id);
    return successResponse(res, 200, 'User deleted successfully', {});
  })
);

module.exports = router;