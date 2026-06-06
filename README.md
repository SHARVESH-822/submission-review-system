<div align="center">

# 🗂️ SRMS
### SUBMISSION REVIEW MANAGEMENT SYSTEM

![MERN Stack](https://img.shields.io/badge/Stack-MERN-green?style=for-the-badge)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

> A full-stack web application for managing academic submissions with role-based access control, resubmission enforcement, and real-time status tracking.

[Live Demo](#) • [Backend API](#) • [Report Bug](#) • [Request Feature](#)

</div>

---

## 📌 TABLE OF CONTENTS

- [About the Project](#about-the-project)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [User Roles](#user-roles)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Screenshots](#screenshots)

---

## 📖 ABOUT THE PROJECT

SRMS (Submission Review Management System) is a full-stack MERN application built for **FSD-11 Assignment**. It provides a structured digital workflow for contributors to submit entries and reviewers to evaluate them — with enforced resubmission limits, JWT-based authentication, and role-based access control.

---

## ✨ FEATURES

### 👤 CONTRIBUTOR
- ✅ Register & Login with JWT authentication
- ✅ Create submissions with **Unique ID**, title, description & file (PDF/DOCX, max 10MB)
- ✅ Track submission status in real-time (PENDING / APPROVED / REJECTED)
- ✅ Resubmit rejected entries — **maximum 2 times** enforced
- ✅ View reviewer notes on rejected submissions

### 🔍 REVIEWER
- ✅ View all submissions with contributor details
- ✅ Filter submissions by status (ALL / PENDING / APPROVED / REJECTED)
- ✅ Preview submitted files & view full contributor info via modal
- ✅ Approve or Reject with optional review notes

### ⚙️ ADMIN
- ✅ View system-wide analytics dashboard
- ✅ Monitor total users, submissions, approval/rejection stats
- ✅ Manage all users — view roles and delete non-admin users

---

## 🛠️ TECH STACK

| LAYER | TECHNOLOGY |
|---|---|
| Frontend | React.js 18, React Router DOM v6, Axios, Context API |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas (Mongoose ODM) |
| Authentication | JSON Web Tokens (JWT) |
| Password Security | bcryptjs |
| Deployment | Netlify (Frontend) + Render (Backend) |

---

## 👥 USER ROLES & PERMISSIONS

| PERMISSION | CONTRIBUTOR | REVIEWER | ADMIN |
|---|:---:|:---:|:---:|
| Create Submission | ✅ | ❌ | ❌ |
| View Own Submissions | ✅ | ❌ | ❌ |
| Resubmit Entry (max 2) | ✅ | ❌ | ❌ |
| View All Submissions | ❌ | ✅ | ✅ |
| Review Submission | ❌ | ✅ | ✅ |
| View Analytics | ❌ | ❌ | ✅ |
| Manage Users | ❌ | ❌ | ✅ |
| Delete User | ❌ | ❌ | ✅ |

---

## 🔗 API ENDPOINTS

### AUTH ROUTES
| METHOD | ENDPOINT | ACCESS | DESCRIPTION |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login & get JWT token |
| POST | `/api/auth/forgot-password` | Public | Send password reset OTP by email |
| POST | `/api/auth/verify-reset-otp` | Public | Verify OTP and create reset session |
| POST | `/api/auth/reset-password` | Public | Update password after OTP verification |

### SUBMISSION ROUTES
| METHOD | ENDPOINT | ACCESS | DESCRIPTION |
|---|---|---|---|
| POST | `/api/submissions` | Contributor | Create new submission |
| GET | `/api/submissions/my` | Contributor | Get own submissions |
| PUT | `/api/submissions/:id/resubmit` | Contributor | Resubmit entry (max 2) |
| GET | `/api/submissions` | Reviewer/Admin | Get all submissions |
| PUT | `/api/submissions/:id/review` | Reviewer | Approve or reject |

### ADMIN ROUTES
| METHOD | ENDPOINT | ACCESS | DESCRIPTION |
|---|---|---|---|
| GET | `/api/admin/analytics` | Admin | System analytics |
| GET | `/api/admin/users` | Admin | All users list |
| DELETE | `/api/admin/users/:id` | Admin | Delete a user |

---

## 🗄️ DATABASE SCHEMA

### USERS COLLECTION
```json
{
  "name": "String (required)",
  "email": "String (required, unique)",
  "password": "String (bcrypt hashed)",
  "role": "CONTRIBUTOR | REVIEWER | ADMIN",
  "createdAt": "Date"
}
```

### SUBMISSIONS COLLECTION
```json
{
  "uniqueId": "String (required, unique)",
  "title": "String (required)",
  "description": "String (optional)",
  "fileName": "String (optional)",
  "status": "PENDING | APPROVED | REJECTED",
  "contributor": "ObjectId → User",
  "reviewedBy": "ObjectId → User",
  "reviewNote": "String (optional)",
  "resubmissionCount": "Number (max 2)",
  "createdAt": "Date"
}
```

---

## 🚀 GETTING STARTED

### Prerequisites
- Node.js v18+
- MongoDB (local) or MongoDB Atlas account
- Git

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/sharvesh-22/submission-review-system.git
cd submission-review-system
```

**2. Setup Backend**
```bash
cd backend
npm install
```

**3. Setup Frontend**
```bash
cd ../frontend
npm install
```

**4. Create `.env` file in `backend/` folder**
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/submission-review-db
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
NODE_ENV=development

# Mail settings for forgot-password OTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=SRMS <your_email@gmail.com>
```

**5. Run the application**

Backend (Terminal 1):
```bash
cd backend
npm run dev
```

Frontend (Terminal 2):
```bash
cd frontend
npm start
```

**6. Open browser**
