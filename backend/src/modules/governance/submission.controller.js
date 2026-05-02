// src/modules/governance/submission.controller.js

const submissionService = require('./submission.service');
const { successResponse } = require('../../utils/response.util');
const asyncHandler = require('../../utils/asyncHandler.util');

const createSubmission = asyncHandler(async (req, res) => {
  // ✅ req.file is set by multer after Cloudinary upload
  const submission = await submissionService.createSubmission(
    req.user._id,
    req.body,
    req.file   // ✅ pass file here
  );
  return successResponse(res, 201, 'Submission created successfully', {
    submission
  });
});

const getMySubmissions = asyncHandler(async (req, res) => {
  const submissions = await submissionService.getMySubmissions(req.user._id);
  return successResponse(res, 200, 'Submissions fetched successfully', {
    submissions
  });
});

const getAllSubmissions = asyncHandler(async (req, res) => {
  const submissions = await submissionService.getAllSubmissions();
  return successResponse(res, 200, 'All submissions fetched successfully', {
    submissions
  });
});

const resubmitSubmission = asyncHandler(async (req, res) => {
  const submission = await submissionService.resubmitSubmission(
    req.params.id,
    req.user._id,
    req.body,
    req.file   // ✅ pass file here
  );
  return successResponse(res, 200, 'Resubmission successful', { submission });
});

const reviewSubmission = asyncHandler(async (req, res) => {
  const submission = await submissionService.reviewSubmission(
    req.params.id,
    req.user._id,
    req.body
  );
  return successResponse(res, 200, 'Review submitted successfully', {
    submission
  });
});

module.exports = {
  createSubmission,
  getMySubmissions,
  getAllSubmissions,
  resubmitSubmission,
  reviewSubmission
};
