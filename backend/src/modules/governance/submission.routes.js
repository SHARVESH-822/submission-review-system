// src/modules/governance/submission.routes.js

const express = require('express');
const router = express.Router();
const { protect } = require('../../middlewares/auth.middleware');
const { checkPermission } = require('../../middlewares/permission.middleware');
const { upload } = require('../../config/cloudinary.config'); // ✅ NEW
const {
  createSubmission,
  getMySubmissions,
  getAllSubmissions,
  resubmitSubmission,
  reviewSubmission
} = require('./submission.controller');

// Contributor routes
// ✅ upload.single('file') handles the PDF upload to Cloudinary
router.post('/', protect, checkPermission('CREATE_SUBMISSION'), upload.single('file'), createSubmission);
router.get('/my', protect, checkPermission('VIEW_OWN_SUBMISSIONS'), getMySubmissions);
router.put('/:id/resubmit', protect, checkPermission('RESUBMIT_SUBMISSION'), upload.single('file'), resubmitSubmission);

// Reviewer & Admin routes
router.get('/', protect, checkPermission('VIEW_ALL_SUBMISSIONS'), getAllSubmissions);
router.put('/:id/review', protect, checkPermission('REVIEW_SUBMISSION'), reviewSubmission);

module.exports = router;
