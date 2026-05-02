// src/modules/governance/submission.service.js

const Submission = require('./models/submission.model');

const MAX_RESUBMISSIONS = 2;

const createSubmission = async (userId, data, file) => {
  const existing = await Submission.findOne({ uniqueId: data.uniqueId });
  if (existing) {
    throw new Error('A submission with this Unique ID already exists');
  }

  // ✅ If a file was uploaded, use Cloudinary URL (permanent)
  // ✅ Otherwise fallback to manually provided fileUrl
  const fileUrl = file ? file.path : (data.fileUrl || '');
  const fileName = file ? file.originalname : (data.fileName || '');

  const submission = await Submission.create({
    uniqueId: data.uniqueId,
    title: data.title,
    description: data.description || '',
    fileName,
    fileUrl,   // ✅ This is now the permanent Cloudinary URL
    contributor: userId
  });

  return submission;
};

const getMySubmissions = async (userId) => {
  const submissions = await Submission.find({ contributor: userId })
    .populate('contributor', 'name email role')
    .populate('reviewedBy', 'name email')
    .sort({ createdAt: -1 });
  return submissions;
};

const getAllSubmissions = async () => {
  const submissions = await Submission.find()
    .populate('contributor', 'name email role createdAt')
    .populate('reviewedBy', 'name email')
    .sort({ createdAt: -1 });
  return submissions;
};

const resubmitSubmission = async (submissionId, userId, data, file) => {
  const submission = await Submission.findOne({
    _id: submissionId,
    contributor: userId
  });

  if (!submission) {
    throw new Error('Submission not found');
  }

  if (submission.resubmissionCount >= MAX_RESUBMISSIONS) {
    throw new Error('Maximum resubmissions reached');
  }

  if (submission.status !== 'REJECTED') {
    throw new Error('Only rejected submissions can be resubmitted');
  }

  // ✅ Update file if new one was uploaded
  const fileUrl = file ? file.path : (data.fileUrl || submission.fileUrl);
  const fileName = file ? file.originalname : (data.fileName || submission.fileName);

  submission.title = data.title || submission.title;
  submission.description = data.description || submission.description;
  submission.fileName = fileName;
  submission.fileUrl = fileUrl;
  submission.status = 'PENDING';
  submission.resubmissionCount += 1;

  await submission.save();
  return submission;
};

const reviewSubmission = async (submissionId, reviewerId, data) => {
  const submission = await Submission.findById(submissionId);

  if (!submission) {
    throw new Error('Submission not found');
  }

  submission.status = data.status;
  submission.reviewNote = data.reviewNote || '';
  submission.reviewedBy = reviewerId;

  await submission.save();
  return submission;
};

module.exports = {
  createSubmission,
  getMySubmissions,
  getAllSubmissions,
  resubmitSubmission,
  reviewSubmission
};
