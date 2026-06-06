import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api'
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Auth
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const forgotPassword = (data) => API.post('/auth/forgot-password', data);
export const verifyResetOtp = (data) => API.post('/auth/verify-reset-otp', data);
export const resetPassword = (data) => API.post('/auth/reset-password', data);

// Submissions
export const createSubmission = (data) => API.post('/submissions', data);
export const resubmitEntry = (id, data) => API.put(`/submissions/${id}/resubmit`, data);
export const getMySubmissions = () => API.get('/submissions/my');
export const getAllSubmissions = () => API.get('/submissions');
export const reviewSubmission = (id, data) => API.put(`/submissions/${id}/review`, data);
