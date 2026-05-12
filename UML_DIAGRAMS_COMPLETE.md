# 📐 COMPLETE UML DIAGRAMS FOR SRMS PROJECT

**All 12 UML Diagrams in One Document**

**Instructions:** Copy each diagram section and paste into ChatGPT with prompt: "Create a UML [diagram type] based on this description:"

---

# TABLE OF CONTENTS
1. [Use Case Diagram](#1-use-case-diagram)
2. [Class Diagram](#2-class-diagram)
3. [Sequence Diagram - Registration](#3-sequence-diagram---user-registration-flow)
4. [Sequence Diagram - Submission](#4-sequence-diagram---submission-creation-flow)
5. [Sequence Diagram - Review](#5-sequence-diagram---review-submission-flow)
6. [State Machine Diagram](#6-state-machine-diagram---submission-lifecycle)
7. [Activity Diagram](#7-activity-diagram---admin-analytics)
8. [Deployment Diagram](#8-deployment-diagram)
9. [Component Diagram](#9-component-diagram)
10. [ER Diagram](#10-er-diagram-entity-relationship)
11. [Data Flow Diagram](#11-data-flow-diagram-dfd)
12. [System Sequence Diagram](#12-system-sequence-diagram---complete-user-journey)

---

# 1. USE CASE DIAGRAM

```
Create a Use Case Diagram for a Submission Review Management System with the following:

Actors:
- Contributor (Student)
- Reviewer (Faculty)
- Administrator
- System

Use Cases:

Contributor Use Cases:
1. Register Account - Actor: Contributor
2. Login - Actor: Contributor
3. Create Submission - Actor: Contributor
   - Precondition: User must be logged in
   - Includes: Upload File, Generate Unique ID, Set Initial Status as PENDING
4. View Own Submissions - Actor: Contributor
   - Precondition: User must be logged in
5. Track Submission Status - Actor: Contributor
   - Precondition: Submission must exist
   - Associated Use Cases: View Own Submissions
6. Resubmit Submission - Actor: Contributor
   - Precondition: Submission must be REJECTED and resubmit count < 2
   - Includes: Upload New File, Reset Status to PENDING
7. View Reviewer Notes - Actor: Contributor
   - Precondition: Submission must have review notes

Reviewer Use Cases:
1. Login - Actor: Reviewer
2. View All Submissions - Actor: Reviewer
   - Precondition: User must be logged in
   - Includes: Filter by Status
3. Filter Submissions by Status - Actor: Reviewer
   - Filters: ALL, PENDING, APPROVED, REJECTED
4. Review Submission - Actor: Reviewer
   - Precondition: Submission status must be PENDING
   - Includes: Make Decision (Approve/Reject)
5. Add Review Notes - Actor: Reviewer
   - Precondition: Must be reviewing a submission
6. Approve Submission - Actor: Reviewer
   - Precondition: Submission exists
   - Extends: Review Submission
7. Reject Submission - Actor: Reviewer
   - Precondition: Submission exists
   - Extends: Review Submission
8. View Contributor Information - Actor: Reviewer
   - Precondition: Submission must exist

Admin Use Cases:
1. Login - Actor: Administrator
2. View Analytics Dashboard - Actor: Administrator
   - Precondition: Must be logged in
   - Includes: View All Statistics
3. View Total Users - Actor: Administrator
   - Extends: View Analytics Dashboard
4. View Total Submissions - Actor: Administrator
   - Extends: View Analytics Dashboard
5. View Approved/Rejected Count - Actor: Administrator
   - Extends: View Analytics Dashboard
6. Manage Users - Actor: Administrator
   - Precondition: Must be logged in
7. View All Users - Actor: Administrator
   - Extends: Manage Users
8. Delete User - Actor: Administrator
   - Precondition: User must exist and not be admin
   - Extends: Manage Users

System Use Cases:
1. Store Submission Files - Triggered by: Create Submission
2. Validate File Format - Triggered by: Upload File
   - Acceptable formats: PDF, DOCX
3. Enforce Resubmission Limit - Triggered by: Resubmit Submission
   - Maximum: 2 resubmissions
4. Generate Unique Submission ID - Triggered by: Create Submission
5. Authenticate User (JWT) - Triggered by: Login
6. Enforce Role-Based Access - Triggered by: Any action
7. Update Submission Status - Triggered by: Review Submission
8. Send Email Notification - Triggered by: Submission Decision (Optional)

Relationships:
- Contributor, Reviewer, Administrator all generalize from User
- All actors can Login and Logout
- Create Submission includes Upload File
- Resubmit Submission extends Create Submission
- Approve/Reject extend Review Submission
- All user actions require Authenticate User
- All actions require Enforce Role-Based Access
```

---

# 2. CLASS DIAGRAM

```
Create a UML Class Diagram for Submission Review Management System with the following classes:

CLASS: User
Attributes:
- _id: ObjectId (PK)
- name: String
- email: String (UNIQUE)
- password: String (hashed)
- role: Enum{CONTRIBUTOR, REVIEWER, ADMIN}
- createdAt: Date

Methods:
+ register(name, email, password, role): User
+ login(email, password): JWT_Token
+ updateProfile(data): void
+ logout(): void
+ getRolePermissions(): Permission[]

CLASS: Contributor (extends User)
Attributes:
- submissionCount: Integer
- approvedCount: Integer
- rejectedCount: Integer

Methods:
+ createSubmission(title, description, file): Submission
+ viewOwnSubmissions(): Submission[]
+ resubmitSubmission(submissionId, file): Submission
+ viewReviewerNotes(submissionId): String
+ trackSubmissionStatus(submissionId): Status

CLASS: Reviewer (extends User)
Attributes:
- submissionsReviewed: Integer

Methods:
+ viewAllSubmissions(): Submission[]
+ filterSubmissions(status): Submission[]
+ reviewSubmission(submissionId, decision, notes): void
+ approveSubmission(submissionId, notes): void
+ rejectSubmission(submissionId, notes): void
+ viewContributorInfo(submissionId): Contributor

CLASS: Administrator (extends User)
Attributes:
- None

Methods:
+ viewAnalytics(): Analytics
+ viewAllUsers(): User[]
+ deleteUser(userId): void
+ managePermissions(userId, role): void
+ viewSystemLogs(): Log[]

CLASS: Submission
Attributes:
- _id: ObjectId (PK)
- uniqueId: String (UNIQUE)
- title: String
- description: String
- fileName: String
- fileUrl: String (Cloudinary URL)
- status: Enum{PENDING, APPROVED, REJECTED}
- contributor: ObjectId (FK -> User)
- reviewedBy: ObjectId (FK -> User)
- reviewNote: String
- resubmissionCount: Integer (Max: 2)
- createdAt: Date
- updatedAt: Date

Methods:
+ createSubmission(title, description, file): Submission
+ updateStatus(newStatus): void
+ addReviewNote(reviewerId, note): void
+ incrementResubmissionCount(): void
+ isResubmissionAllowed(): Boolean
+ getContributorDetails(): Contributor
+ getReviewerDetails(): Reviewer

CLASS: File
Attributes:
- _id: ObjectId (PK)
- fileName: String
- fileUrl: String (Cloudinary)
- fileSize: Integer
- fileFormat: String {PDF, DOCX}
- uploadedAt: Date
- uploadedBy: ObjectId (FK -> User)

Methods:
+ uploadFile(file, userId): File
+ validateFileFormat(): Boolean
+ validateFileSize(maxSize): Boolean
+ deleteFile(): void
+ getFileUrl(): String

CLASS: Review
Attributes:
- _id: ObjectId (PK)
- submissionId: ObjectId (FK -> Submission)
- reviewerId: ObjectId (FK -> User)
- decision: Enum{APPROVED, REJECTED}
- reviewNote: String
- reviewedAt: Date

Methods:
+ submitReview(decision, note): Review
+ updateReview(decision, note): void
+ getReviewHistory(): Review[]

CLASS: Analytics
Attributes:
- totalUsers: Integer
- totalContributors: Integer
- totalReviewers: Integer
- totalSubmissions: Integer
- approvedCount: Integer
- rejectedCount: Integer
- pendingCount: Integer
- averageReviewTime: Integer
- lastUpdated: Date

Methods:
+ calculateTotalUsers(): Integer
+ calculateSubmissionStats(): Stats
+ generateReport(): Report
+ refreshAnalytics(): void

CLASS: Permission
Attributes:
- _id: ObjectId (PK)
- role: String {CONTRIBUTOR, REVIEWER, ADMIN}
- permissions: String[] {CREATE_SUBMISSION, VIEW_ALL, REVIEW, DELETE_USER, etc.}

Methods:
+ checkPermission(role, action): Boolean
+ grantPermission(role, permission): void
+ revokePermission(role, permission): void
+ getPermissionsByRole(role): String[]

CLASS: JWT_Token
Attributes:
- token: String
- userId: ObjectId
- role: String
- issuedAt: Date
- expiresAt: Date

Methods:
+ generateToken(userId, role): String
+ verifyToken(token): Boolean
+ decodeToken(token): Object
+ refreshToken(token): String

Relationships:
- User (parent) <|-- Contributor (child)
- User (parent) <|-- Reviewer (child)
- User (parent) <|-- Administrator (child)
- Submission has-one File (1..1)
- Submission belongs-to User/Contributor (1..*)
- Submission reviewed-by User/Reviewer (0..1)
- Review has-one Submission (1..1)
- Review has-one Reviewer (1..1)
- Permission belongs-to User by role (1..*)
- JWT_Token belongs-to User (1..1)
```

---

# 3. SEQUENCE DIAGRAM - USER REGISTRATION FLOW

```
Create a UML Sequence Diagram for User Registration in SRMS with the following:

Actors and Objects:
- Contributor (Actor)
- Frontend/UI
- Backend API Server
- Auth Service
- User Model (Database)
- JWT Service
- Password Utility

Sequence Flow:

1. Contributor enters registration details (name, email, password)
   Actor Contributor -> Frontend: submitRegistration(name, email, password)

2. Frontend validates inputs
   Frontend -> Frontend: validateInputs() - check email format, password strength

3. Frontend sends registration request to backend
   Frontend -> Backend API: POST /api/auth/register {name, email, password}

4. Backend receives request
   Backend API -> Auth Service: registerUser(name, email, password)

5. Auth Service checks if email exists
   Auth Service -> User Model: findOne({email})
   User Model -> Auth Service: return existing user or null

6. If email not found, hash password
   Auth Service -> Password Utility: hashPassword(password)
   Password Utility -> Auth Service: return hashedPassword

7. Create new user in database
   Auth Service -> User Model: User.create({name, email, hashedPassword, role: CONTRIBUTOR})
   User Model -> Auth Service: return newUser object with _id

8. Generate JWT token
   Auth Service -> JWT Service: generateToken({id: user._id, role: CONTRIBUTOR})
   JWT Service -> Auth Service: return JWT token (7-day expiration)

9. Auth Service returns response
   Auth Service -> Backend API: return {token, user}

10. Backend sends successful response to Frontend
    Backend API -> Frontend: 201 Created {token, user}

11. Frontend stores token in localStorage
    Frontend -> Frontend: localStorage.setItem('token', token)

12. Frontend updates Auth Context
    Frontend -> Frontend: AuthContext.setUser(user)
    Frontend -> Frontend: AuthContext.setIsAuthenticated(true)

13. Frontend redirects to dashboard
    Frontend -> Frontend: navigate('/contributor/dashboard')

14. Frontend displays confirmation
    Frontend -> Contributor: Show success message + dashboard

Alternative Flows:

Alt 1: Email Already Exists
5a. Auth Service receives existing user
5b. Auth Service -> Backend API: throw AppError('Email already registered', 400)
5c. Backend API -> Frontend: 400 Bad Request {error message}
5d. Frontend displays error: "Email already registered"

Alt 2: Password Too Weak
2a. Frontend validates password strength
2b. Frontend -> Contributor: Show error "Password must be at least 8 characters"
2c. Stop process, user must re-enter

Alt 3: Network Error
3a. Network failure occurs
3b. Frontend catches error -> Contributor: Show error "Network connection failed"
```

---

# 4. SEQUENCE DIAGRAM - SUBMISSION CREATION FLOW

```
Create a UML Sequence Diagram for Submission Creation in SRMS with the following:

Actors and Objects:
- Contributor (logged-in user)
- Frontend UI
- Backend API Server
- Auth Middleware
- Submission Service
- File Upload Handler
- Cloudinary Service
- Submission Model (Database)
- Unique ID Generator

Sequence Flow:

1. Contributor navigates to create submission page
   Contributor -> Frontend: Click "Create New Submission"
   Frontend -> Frontend: Display submission form

2. Contributor fills in submission details and selects file
   Contributor -> Frontend: submitForm(title, description, file)

3. Frontend validates inputs
   Frontend -> Frontend: validateForm()
   - Check title not empty
   - Check file size <= 10MB
   - Check file format in {PDF, DOCX}

4. Frontend sends submission with file to backend
   Frontend -> Backend API: POST /api/submissions (multipart form-data)
   - Header: Authorization: Bearer {JWT_token}
   - Body: title, description, file

5. Backend receives request
   Backend API -> Auth Middleware: verifyToken(JWT_token)
   Auth Middleware -> Backend API: return {userId, role}

6. Backend checks user role and permission
   Backend API -> Permission Middleware: checkPermission(role, CREATE_SUBMISSION)
   Permission Middleware -> Backend API: return allowed=true

7. Backend calls Submission Service
   Backend API -> Submission Service: createSubmission(title, description, file, userId)

8. Submission Service uploads file to Cloudinary
   Submission Service -> File Upload Handler: uploadFile(file)
   File Upload Handler -> Cloudinary Service: POST /upload {file}
   Cloudinary Service -> File Upload Handler: return {fileUrl, fileName, fileSize}
   File Upload Handler -> Submission Service: return {fileUrl, fileName}

9. Submission Service generates unique ID
   Submission Service -> Unique ID Generator: generateUniqueId()
   Unique ID Generator -> Submission Service: return "SUB_20260507_001"

10. Submission Service creates submission record in database
    Submission Service -> Submission Model: create({
      uniqueId: "SUB_20260507_001",
      title: title,
      description: description,
      fileName: fileName,
      fileUrl: fileUrl,
      status: "PENDING",
      contributor: userId,
      resubmissionCount: 0,
      createdAt: currentDate
    })
    Submission Model -> Submission Service: return newSubmission object with _id

11. Submission Service returns to Backend API
    Submission Service -> Backend API: return newSubmission

12. Backend API sends response to Frontend
    Backend API -> Frontend: 201 Created {success: true, submission}

13. Frontend receives response and updates state
    Frontend -> Frontend: AuthContext.updateSubmissionCount()
    Frontend -> Frontend: Display confirmation message
    Frontend -> Frontend: Add submission to submissions list

14. Frontend redirects after 2 seconds
    Frontend -> Frontend: setTimeout(() => navigate('/contributor/my-submissions'), 2000)

15. Frontend displays updated submissions list
    Frontend -> Contributor: Show submission in "My Submissions" with PENDING status

Alternative Flows:

Alt 1: File Too Large
3a. Frontend detects file size > 10MB
3b. Frontend -> Contributor: Show error "File size exceeds 10MB limit"
3c. User must select different file

Alt 2: Invalid File Format
3a. Frontend checks file extension
3a. File is not PDF or DOCX
3b. Frontend -> Contributor: Show error "Only PDF and DOCX formats allowed"

Alt 3: Token Expired
5a. Auth Middleware detects expired token
5b. Auth Middleware -> Backend API: throw UnauthorizedError
5c. Backend API -> Frontend: 401 Unauthorized
5d. Frontend clears auth data
5d. Frontend -> Contributor: Redirect to login page

Alt 4: Cloudinary Upload Fails
8a. Cloudinary service returns error
8b. File Upload Handler catches error
8c. File Upload Handler -> Submission Service: throw AppError
8d. Transaction rolled back
8e. Backend -> Frontend: 500 Server Error
```

---

# 5. SEQUENCE DIAGRAM - REVIEW SUBMISSION FLOW

```
Create a UML Sequence Diagram for Review Submission in SRMS with the following:

Actors and Objects:
- Reviewer (logged-in user)
- Frontend UI
- Backend API Server
- Auth Middleware
- Permission Middleware
- Submission Service
- Review Service
- Submission Model (Database)
- Review Model (Database)

Sequence Flow:

1. Reviewer opens submissions list
   Reviewer -> Frontend: Load ReviewerDashboard
   Frontend -> Backend API: GET /api/submissions
   Backend API -> Submission Model: find()
   Submission Model -> Backend API: return all submissions
   Backend API -> Frontend: 200 OK {submissions[]}

2. Reviewer clicks on submission to review
   Reviewer -> Frontend: Click submission {submissionId}
   Frontend -> Frontend: Show submission details with file preview

3. Reviewer makes decision (Approve or Reject)
   Reviewer -> Frontend: Click "Approve" or "Reject" button
   Frontend -> Frontend: Display decision dialog with optional notes

4. Reviewer enters optional review notes
   Reviewer -> Frontend: Type review notes "Great work! Approved."
   Frontend -> Frontend: Capture notes text

5. Reviewer submits review
   Reviewer -> Frontend: Click "Submit Review" button
   Frontend -> Backend API: PUT /api/submissions/{submissionId}/review
   - Header: Authorization: Bearer {JWT_token}
   - Body: {
       status: "APPROVED" or "REJECTED",
       reviewNote: "Great work! Approved."
     }

6. Backend receives review request
   Backend API -> Auth Middleware: verifyToken(JWT_token)
   Auth Middleware -> Backend API: return {userId, role}

7. Backend checks reviewer permission
   Backend API -> Permission Middleware: checkPermission(role, REVIEW_SUBMISSION)
   Permission Middleware -> Backend API: return allowed=true

8. Backend calls Review Service
   Backend API -> Review Service: reviewSubmission(submissionId, decision, reviewNote, reviewerId)

9. Review Service fetches current submission
   Review Service -> Submission Model: findById(submissionId)
   Submission Model -> Review Service: return submission object

10. Review Service validates submission is PENDING
    Review Service -> Review Service: validate(submission.status == "PENDING")

11. Review Service updates submission status
    Review Service -> Submission Model: updateOne(
      {_id: submissionId},
      {
        status: decision,
        reviewNote: reviewNote,
        reviewedBy: reviewerId,
        updatedAt: currentDate
      }
    )
    Submission Model -> Review Service: return updated submission

12. Review Service creates review record
    Review Service -> Review Model: create({
      submissionId: submissionId,
      reviewerId: reviewerId,
      decision: decision,
      reviewNote: reviewNote,
      reviewedAt: currentDate
    })
    Review Model -> Review Service: return review object

13. Review Service returns to Backend API
    Review Service -> Backend API: return {success: true, submission}

14. Backend API sends response to Frontend
    Backend API -> Frontend: 200 OK {success: true, message: "Review submitted"}

15. Frontend updates UI state
    Frontend -> Frontend: Remove submission from PENDING list
    Frontend -> Frontend: Add to APPROVED or REJECTED list
    Frontend -> Frontend: Display success notification

16. Frontend redirects to dashboard
    Frontend -> Frontend: navigate('/reviewer/dashboard')
    Frontend -> Reviewer: Show "Review submitted successfully"

Alternative Flows:

Alt 1: Submission Already Reviewed
10a. Review Service checks submission.status
10a. Status is already "APPROVED" or "REJECTED"
10b. Review Service -> Backend API: throw AppError('Already reviewed', 400)
10c. Backend API -> Frontend: 400 Bad Request
10d. Frontend -> Reviewer: Show error "This submission already reviewed"

Alt 2: Token Expired
6a. Auth Middleware detects token expired
6b. Auth Middleware -> Backend API: throw UnauthorizedError
6c. Backend API -> Frontend: 401 Unauthorized
6d. Frontend -> Reviewer: Redirect to login

Alt 3: Insufficient Permission
7a. Permission Middleware checks role
7a. Role is CONTRIBUTOR (not REVIEWER/ADMIN)
7b. Permission Middleware -> Backend API: throw ForbiddenError
7c. Backend API -> Frontend: 403 Forbidden
7d. Frontend -> Reviewer: Show error "You don't have permission"

Alt 4: Submission Not Found
9a. Submission Model returns null
9b. Review Service -> Backend API: throw AppError('Submission not found', 404)
10c. Backend API -> Frontend: 404 Not Found
```

---

# 6. STATE MACHINE DIAGRAM - SUBMISSION LIFECYCLE

```
Create a UML State Machine Diagram for Submission Lifecycle in SRMS with the following:

Initial State: Start

States:
1. Created
   - Entry: New submission created
   - Activity: Generate unique ID, store to database
   - Exit: Submission ID assigned

2. PENDING
   - Entry: Submission saved as PENDING
   - Activity: Waiting for reviewer assignment
   - Exit: Reviewer picks up

3. UnderReview
   - Entry: Reviewer starts reviewing
   - Activity: Reviewer examining submission
   - Exit: Reviewer makes decision

4. APPROVED
   - Entry: Reviewer approves
   - Activity: Update database status to APPROVED
   - Exit: Submission finalized
   - Final: Yes (Terminal state)

5. REJECTED
   - Entry: Reviewer rejects
   - Activity: Store rejection reason/notes
   - Exit: Ready for resubmission or final rejection

6. RESUBMISSION_PENDING
   - Entry: Contributor resubmits after rejection
   - Activity: New file uploaded, new version created
   - Exit: Status reset to PENDING
   - Precondition: resubmissionCount < 2

7. FINAL_REJECTED
   - Entry: Rejected after max resubmissions (2)
   - Activity: Mark submission as permanently rejected
   - Exit: None - terminal state
   - Final: Yes (Terminal state)

Final State: End

Transitions:

1. Start -> Created
   - Event: contributor creates submission
   - Trigger: POST /api/submissions
   - Guard: File valid AND size <= 10MB AND format in {PDF, DOCX}
   - Action: Generate unique ID

2. Created -> PENDING
   - Event: Submission successfully created
   - Trigger: Automatic after file upload
   - Guard: None
   - Action: Set status = PENDING

3. PENDING -> UnderReview
   - Event: Reviewer opens submission for review
   - Trigger: Reviewer clicks review button
   - Guard: Reviewer authorized
   - Action: None

4. UnderReview -> APPROVED
   - Event: Reviewer approves submission
   - Trigger: Reviewer clicks approve button
   - Guard: Review notes provided
   - Action: status = APPROVED, save review notes, record reviewer ID

5. UnderReview -> REJECTED
   - Event: Reviewer rejects submission
   - Trigger: Reviewer clicks reject button
   - Guard: Review notes provided
   - Action: status = REJECTED, save review notes, record reviewer ID

6. REJECTED -> RESUBMISSION_PENDING
   - Event: Contributor resubmits rejected work
   - Trigger: POST /api/submissions/{id}/resubmit
   - Guard: resubmissionCount < 2 AND status = REJECTED
   - Action: increment resubmissionCount, reset status to PENDING

7. RESUBMISSION_PENDING -> PENDING
   - Event: New submission version stored
   - Trigger: File uploaded successfully
   - Guard: None
   - Action: status = PENDING, new file URL set

8. PENDING -> UnderReview (Again)
   - Event: Reviewer reviews resubmitted work
   - Trigger: Reviewer opens resubmitted submission
   - Guard: Reviewer authorized
   - Action: None

9. UnderReview -> APPROVED (Again)
   - Event: Reviewer approves resubmitted work
   - Trigger: Reviewer clicks approve
   - Guard: Review notes provided
   - Action: status = APPROVED, save review

10. UnderReview -> REJECTED (Again)
    - Event: Reviewer rejects resubmitted work
    - Trigger: Reviewer clicks reject
    - Guard: Review notes provided
    - Action: status = REJECTED

11. REJECTED -> FINAL_REJECTED
    - Event: Max resubmissions reached
    - Trigger: Attempt to resubmit after 2 resubmissions
    - Guard: resubmissionCount >= 2
    - Action: status = FINAL_REJECTED, cannot resubmit

12. APPROVED -> End
    - Event: Submission finalized
    - Trigger: Automatic after approval
    - Guard: None
    - Action: Update completed status

13. FINAL_REJECTED -> End
    - Event: Submission finalized as rejected
    - Trigger: Automatic after final rejection
    - Guard: None
    - Action: No further action allowed

State History:
- Submission can transition: PENDING -> REJECTED -> PENDING (max 2 times)
- Each resubmission resets status to PENDING for new review
- APPROVED and FINAL_REJECTED are terminal states

Concurrent Activities:
- Multiple submissions can be in different states simultaneously
- Each submission state independent from others
- Reviewers can review multiple submissions in parallel
```

---

# 7. ACTIVITY DIAGRAM - ADMIN ANALYTICS

```
Create a UML Activity Diagram for Admin Analytics in SRMS with the following:

Start

Activity 1: Admin Logs In
- Admin opens system
- Enters credentials
- System verifies authentication
- JWT token generated
- Transition: Authenticated

Decision Diamond 1: Is user Admin?
- Yes: Continue to dashboard
- No: Show unauthorized error, go to End

Activity 2: Access Admin Dashboard
- Load AdminDashboard component
- Initialize analytics calculation
- Fetch data from database

Activity 3: Calculate Total Users
- Query User collection
- Filter all users
- Count total
- Result: totalUsers

Activity 4: Calculate Total Submissions
- Query Submission collection
- Filter all submissions
- Count total
- Result: totalSubmissions

Activity 5: Calculate Approved Count
- Query Submission collection
- Filter status = "APPROVED"
- Count approved
- Result: approvedCount

Activity 6: Calculate Rejected Count
- Query Submission collection
- Filter status = "REJECTED"
- Count rejected
- Result: rejectedCount

Activity 7: Calculate Pending Count
- Query Submission collection
- Filter status = "PENDING"
- Count pending
- Result: pendingCount

Activities 3, 4, 5, 6, 7: Run in Parallel

Merge Bar: All calculations complete

Activity 8: Compile Analytics Object
- Combine all counts
- Create analytics object:
  {
    totalUsers: number,
    totalSubmissions: number,
    approvedCount: number,
    rejectedCount: number,
    pendingCount: number,
    timestamp: date
  }

Activity 9: Update UI
- Display analytics dashboard
- Show card: Total Users
- Show card: Total Submissions
- Show card: Approved Count
- Show card: Rejected Count
- Show card: Pending Count

Activity 10: Admin Views Dashboard
- Admin sees all statistics
- Can interact with data
- Can filter or export (optional)

Decision Diamond 2: Refresh Analytics?
- Yes: Go back to Activity 2
- No: Continue

Activity 11: Close Dashboard
- Admin closes analytics view
- Clear state

End

Notes:
- Activities 3-7 execute in parallel for performance
- Database queries are optimized with indexes
- Results are cached for 5 minutes to reduce queries
- Admin can manually refresh to get latest data
- System logs all admin access for audit trail
```

---

# 8. DEPLOYMENT DIAGRAM

```
Create a UML Deployment Diagram for SRMS with the following:

Nodes:

User Device Node:
- Devices: Desktop Browser, Mobile Browser, Tablet
- Contains: React Frontend Application
  - Components: Login, Dashboard, SubmissionForm, etc.
  - Libraries: React 19, Axios, React Router
  - Storage: localStorage (JWT tokens)

Netlify CDN Node:
- Type: Web Server / CDN
- Hosts: Built React Application
- URL: https://srms-frontend.netlify.app
- Services:
  - Static file serving
  - Global CDN distribution
  - HTTPS/SSL encryption
  - Auto-deployment on git push

Render Backend Node:
- Type: Application Server
- Runtime: Node.js
- Hosts: Express.js API Server
- URL: https://srms-backend.render.com
- Environment Variables:
  - PORT: 5000
  - NODE_ENV: production
  - JWT_SECRET: [secured]
  - MONGO_URI: [secured]
  - CLOUDINARY_KEYS: [secured]
- Services:
  - Express server running
  - Routes handler
  - Middleware processing
  - Business logic

Cloudinary Node:
- Type: External Service - File Storage
- Service: Cloud storage for submitted files
- Capabilities:
  - File upload handling
  - Image/document storage
  - CDN serving
  - Automatic optimization
- Integration: REST API calls from Backend

MongoDB Atlas Node:
- Type: Database Server
- Database: submission-review-db
- Collections:
  - Users collection
  - Submissions collection
- Features:
  - Cloud hosted MongoDB
  - Automatic backups
  - Replication enabled
  - Indexes on frequently queried fields
- Connection: Mongoose ODM from Backend

GitHub Repository Node:
- Type: Version Control
- Repository: submission-review-system
- Contains:
  - Backend code
  - Frontend code
  - Configuration files
- Webhooks:
  - Trigger Netlify deploy on main branch push
  - Trigger Render deploy on main branch push

Connections:

1. User Device <-> Netlify (HTTPS)
   - Port: 443
   - Protocol: HTTPS
   - Communication: Browser fetches React app

2. User Device <-> Render Backend (HTTPS)
   - Port: 443
   - Protocol: HTTPS / REST API
   - Communication: API calls with JWT tokens in header

3. Netlify <-> GitHub
   - Connection: Webhook
   - Trigger: On push to main branch
   - Action: Auto-build and deploy

4. Render <-> GitHub
   - Connection: Webhook
   - Trigger: On push to main branch
   - Action: Auto-pull code and restart server

5. Render Backend <-> MongoDB Atlas
   - Port: 27017
   - Protocol: MongoDB connection string
   - Communication: Mongoose driver queries

6. Render Backend <-> Cloudinary
   - Port: 443
   - Protocol: HTTPS REST API
   - Communication: File upload requests

7. Backend <-> JWT Auth
   - Process: Token generation and verification
   - Library: jsonwebtoken

Deployment Process:
1. Developer pushes code to GitHub (main branch)
2. GitHub webhook triggers Netlify and Render
3. Netlify builds React app: npm run build
4. Netlify deploys to CDN
5. Render pulls code and npm install
6. Render starts Node server: npm start
7. Environment variables loaded from Render dashboard
8. Frontend available at: https://srms-frontend.netlify.app
9. Backend API available at: https://srms-backend.render.com/api
```

---

# 9. COMPONENT DIAGRAM

```
Create a UML Component Diagram for SRMS with the following:

Frontend Components:

Component: Login Component
- Provides: User Login Interface
- Requires: AuthService
- Ports:
  - Input: email, password
  - Output: JWT token, user data

Component: Register Component
- Provides: User Registration Interface
- Requires: AuthService
- Ports:
  - Input: name, email, password, role
  - Output: JWT token, new user

Component: Navbar Component
- Provides: Navigation UI
- Requires: AuthContext
- Ports:
  - Input: user data
  - Output: navigation actions, logout

Component: SubmissionForm Component
- Provides: Form to create/edit submission
- Requires: SubmissionService, FileUploadService
- Ports:
  - Input: submission data, file
  - Output: submitted data

Component: ContributorDashboard Component
- Provides: Contributor view
- Requires: SubmissionService, AuthContext
- Ports:
  - Input: user ID
  - Output: user's submissions

Component: ReviewerDashboard Component
- Provides: Reviewer view
- Requires: SubmissionService
- Ports:
  - Input: review data
  - Output: reviewed submissions

Component: AdminDashboard Component
- Provides: Admin view
- Requires: AnalyticsService, AdminService
- Ports:
  - Input: admin queries
  - Output: analytics data, user management

Component: AuthContext
- Provides: Global authentication state
- Exports: user, token, login(), logout()
- Used by: All protected components

Backend Components:

Component: Auth Routes
- Provides: Authentication endpoints
- Requires: Auth Controller
- Endpoints: /register, /login

Component: Auth Controller
- Provides: Request handling for auth
- Requires: Auth Service, Error Middleware
- Methods: registerHandler, loginHandler

Component: Auth Service
- Provides: Authentication business logic
- Requires: User Model, Password Util, JWT Util
- Methods: registerUser, loginUser

Component: Submission Routes
- Provides: Submission endpoints
- Requires: Submission Controller
- Endpoints: /create, /view, /review, /resubmit

Component: Submission Controller
- Provides: Request handling for submissions
- Requires: Submission Service, Auth Middleware
- Methods: createHandler, viewHandler, reviewHandler

Component: Submission Service
- Provides: Submission business logic
- Requires: Submission Model, File Service
- Methods: createSubmission, reviewSubmission, resubmit

Component: Admin Routes
- Provides: Admin endpoints
- Requires: Admin Controller
- Endpoints: /analytics, /users, /delete-user

Component: Admin Controller
- Provides: Request handling for admin
- Requires: Admin Service, Permission Middleware
- Methods: analyticsHandler, usersHandler

Component: Admin Service
- Provides: Admin business logic
- Requires: User Model, Submission Model
- Methods: getAnalytics, getUsers, deleteUser

Component: User Model
- Provides: User schema and queries
- Requires: Database
- Methods: create, findOne, findById, find

Component: Submission Model
- Provides: Submission schema and queries
- Requires: Database
- Methods: create, findById, updateOne, find

Component: Auth Middleware
- Provides: Token verification
- Requires: JWT Util
- Methods: verifyToken

Component: Permission Middleware
- Provides: Role-based access control
- Requires: Permission Matrix
- Methods: checkPermission

Component: Error Middleware
- Provides: Global error handling
- Methods: errorHandler

Component: JWT Util
- Provides: Token operations
- Methods: generateToken, verifyToken

Component: Password Util
- Provides: Password operations
- Methods: hashPassword, comparePassword

Component: File Service
- Provides: File upload operations
- Requires: Cloudinary API
- Methods: uploadFile, deleteFile

Component: Cloudinary API
- Provides: External file storage
- Endpoints: /upload, /delete

Component: Database (MongoDB)
- Provides: Data persistence
- Collections: Users, Submissions

Component Connections:

Frontend Components:
- Login <-> AuthService
- Register <-> AuthService
- Navbar <-> AuthContext
- SubmissionForm <-> SubmissionService
- ContributorDashboard <-> SubmissionService + AuthContext
- ReviewerDashboard <-> SubmissionService
- AdminDashboard <-> AnalyticsService + AdminService

Backend Components:
- Routes -> Controllers (Request routing)
- Controllers -> Services (Business logic delegation)
- Services -> Models (Data access)
- Controllers <- Middleware (Cross-cutting concerns)
- Services -> Util Libraries (Helper functions)
- Services -> External APIs (Cloudinary)
- All -> Database (Data persistence)

Data Flow:
- Frontend API calls -> Backend Routes
- Routes delegate to Controllers
- Controllers call Services
- Services call Models
- Models query Database
- Responses flow back through same chain
```

---

# 10. ER DIAGRAM (ENTITY RELATIONSHIP)

```
Create an ER Diagram for SRMS Database with the following entities:

Entity: USER
Attributes:
- _id (PK): ObjectId
- name: String
- email: String (UNIQUE)
- password: String
- role: Enum{CONTRIBUTOR, REVIEWER, ADMIN}
- createdAt: Date

Entity: SUBMISSION
Attributes:
- _id (PK): ObjectId
- uniqueId: String (UNIQUE)
- title: String
- description: String
- fileName: String
- fileUrl: String
- status: Enum{PENDING, APPROVED, REJECTED}
- contributor_id (FK): ObjectId -> USER
- reviewedBy_id (FK): ObjectId -> USER
- reviewNote: String
- resubmissionCount: Integer
- createdAt: Date
- updatedAt: Date

Entity: REVIEW
Attributes:
- _id (PK): ObjectId
- submission_id (FK): ObjectId -> SUBMISSION
- reviewer_id (FK): ObjectId -> USER
- decision: Enum{APPROVED, REJECTED}
- reviewNote: String
- reviewedAt: Date

Entity: FILE
Attributes:
- _id (PK): ObjectId
- submission_id (FK): ObjectId -> SUBMISSION
- fileName: String
- fileUrl: String (Cloudinary URL)
- fileSize: Integer
- fileFormat: String{PDF, DOCX}
- uploadedAt: Date

Entity: PERMISSION
Attributes:
- _id (PK): ObjectId
- role: String
- permissions: Array of Strings
- createdAt: Date

Relationships:

1. USER creates SUBMISSION (1 : N)
   - User contributor_id -> SUBMISSION
   - Cardinality: One user can have many submissions
   - Participation: Total (Every submission has a contributor)

2. USER reviews SUBMISSION (0 : N)
   - User reviewedBy_id -> SUBMISSION
   - Cardinality: One user can review many submissions
   - Participation: Partial (Not all submissions are reviewed)

3. SUBMISSION has REVIEW (1 : 1 or 0 : 1)
   - SUBMISSION _id -> REVIEW submission_id
   - Cardinality: One submission can have at most one review
   - Participation: Partial (Not all submissions reviewed)

4. USER creates REVIEW (1 : N)
   - USER _id -> REVIEW reviewer_id
   - Cardinality: One user can create many reviews
   - Participation: Total (Every review has a reviewer)

5. SUBMISSION has FILE (1 : 1)
   - SUBMISSION _id -> FILE submission_id
   - Cardinality: One submission has exactly one file
   - Participation: Total (Every submission has a file)

6. USER has PERMISSION (1 : 1)
   - USER role -> PERMISSION role
   - Cardinality: One role has one permission set
   - Participation: Total (Every user has permissions)

Constraints:

Domain Constraints:
- resubmissionCount: Integer >= 0 AND <= 2
- fileSize: Integer <= 10485760 (10 MB)
- fileFormat: Must be in {PDF, DOCX}
- role: Must be in {CONTRIBUTOR, REVIEWER, ADMIN}
- status: Must be in {PENDING, APPROVED, REJECTED}

Referential Integrity:
- SUBMISSION.contributor_id must exist in USER._id
- SUBMISSION.reviewedBy_id must exist in USER._id (nullable)
- REVIEW.submission_id must exist in SUBMISSION._id
- REVIEW.reviewer_id must exist in USER._id
- FILE.submission_id must exist in SUBMISSION._id

Unique Constraints:
- USER.email is unique across all users
- SUBMISSION.uniqueId is unique across all submissions

Indexing:
- USER._id: Primary key index
- SUBMISSION._id: Primary key index
- SUBMISSION.contributor_id: Foreign key index (for queries)
- SUBMISSION.status: Index for filtering
- USER.email: Unique index for login

Normalization:
- All entities in 3NF
- No transitive dependencies
- All non-key attributes functionally dependent on primary key
```

---

# 11. DATA FLOW DIAGRAM (DFD)

```
Create a Data Flow Diagram (Level 0 - Context Diagram) for SRMS with the following:

External Entities:
1. Contributor (Student) - Actor
2. Reviewer (Faculty) - Actor
3. Administrator - Actor
4. Cloudinary Service - External System
5. Email Service - External System (Optional)

Processes (Main System):

Process 1.0: SRMS Core System
- Central process that handles all operations

Data Stores:
1. User Database
2. Submission Database
3. Permission Database

Data Flows - Input:

From Contributor to SRMS:
- Register credentials
- Create submission (title, description, file)
- Resubmit rejected work
- View own submissions
- Track status

From Reviewer to SRMS:
- Request all submissions
- Review decision (approve/reject)
- Add review notes
- Filter submissions by status

From Administrator to SRMS:
- Request analytics data
- Request user list
- Delete user request

From SRMS to Cloudinary:
- File upload request
- File URL retrieval

Data Flows - Output:

From SRMS to Contributor:
- Authentication token
- Own submissions list
- Submission status
- Reviewer feedback/notes

From SRMS to Reviewer:
- All submissions list
- Submission details
- Contributor information
- Filtered submissions

From SRMS to Administrator:
- Analytics dashboard data
- User management data
- System statistics

From Cloudinary to SRMS:
- File URL
- Upload confirmation

Data Stores Details:

User Database:
- Stores: user_id, name, email, password (hashed), role, createdAt
- Used by: Login, Register, Manage users

Submission Database:
- Stores: submission_id, uniqueId, title, description, fileUrl, status, contributor_id, reviewedBy_id, reviewNote, resubmissionCount, createdAt
- Used by: Create submission, View submissions, Review submission

Permission Database:
- Stores: role, permissions array
- Used by: Authorization checks

Level 1 DFD (Decomposition of SRMS):

Process 1.1: Authentication System
- Input: Email, password, name, role
- Output: JWT token, user data
- Data Store: User Database (READ/WRITE)

Process 1.2: Submission Management
- Input: Submission data, file, user ID
- Output: Submission confirmation, unique ID
- Data Store: Submission Database (WRITE)

Process 1.3: Review System
- Input: Submission ID, decision, review notes
- Output: Updated submission, review confirmation
- Data Store: Submission Database (WRITE/READ)

Process 1.4: File Management
- Input: File from user
- Output: File URL from Cloudinary
- External Service: Cloudinary (POST to Cloudinary)

Process 1.5: Analytics
- Input: Query for statistics
- Output: Analytics data
- Data Store: Submission Database (READ), User Database (READ)

Process 1.6: Permission Checking
- Input: User role, required permission
- Output: Allow/Deny decision
- Data Store: Permission Database (READ)

Level 2 DFD - Authentication System (Process 1.1):

Process 1.1.1: Validate Input
- Input: Email, password
- Output: Validated/Invalid flag
- Data Store: None

Process 1.1.2: Check Email Exists
- Input: Email
- Output: User found/Not found
- Data Store: User Database (READ)

Process 1.1.3: Hash Password
- Input: Plain password
- Output: Hashed password
- Data Store: None

Process 1.1.4: Generate Token
- Input: User ID, role
- Output: JWT token
- Data Store: None

Data Flow Connections:

Contributors:
- Input: credentials, submission data, file
- Output: tokens, submissions, feedback

Reviewers:
- Input: review decision, notes
- Output: submissions, reviews

Admin:
- Input: analytics queries
- Output: reports, user data

SRMS:
- Internal flows between processes
- Reads/writes to databases
- Communicates with Cloudinary

Security Considerations:
- JWT tokens validated at each entry point
- Passwords hashed before storage
- Permission checks on each process
- File validation before storage
- Sensitive data encrypted in transit
```

---

# 12. SYSTEM SEQUENCE DIAGRAM - COMPLETE USER JOURNEY

```
Create a System Sequence Diagram showing complete user journey in SRMS:

Actors:
- New User (Contributor)
- Frontend Application
- Backend API
- Database
- Cloudinary

Complete User Journey Sequence:

Phase 1: Registration

1. New User -> Frontend: Open SRMS website
2. Frontend -> Frontend: Load registration page
3. New User -> Frontend: Fill registration form (name, email, password)
4. Frontend -> Frontend: Validate inputs
5. Frontend -> Backend: POST /api/auth/register {data}
6. Backend -> Database: Check if email exists
7. Database -> Backend: Email not found
8. Backend -> Backend: Hash password with bcryptjs
9. Backend -> Database: Create new user
10. Database -> Backend: Return user with _id
11. Backend -> Backend: Generate JWT token (7-day expiry)
12. Backend -> Frontend: 201 Created {token, user}
13. Frontend -> Frontend: localStorage.setItem('token', token)
14. Frontend -> Frontend: AuthContext.setUser(user)
15. Frontend -> New User: Redirect to dashboard
16. Frontend -> New User: Show success message

Phase 2: Create Submission

17. User -> Frontend: Click "New Submission"
18. Frontend -> Frontend: Load submission form
19. User -> Frontend: Fill (title, description, select file)
20. Frontend -> Frontend: Validate file (size, format)
21. User -> Frontend: Click "Submit"
22. Frontend -> Backend: POST /api/submissions (multipart)
23. Backend -> Backend: Verify JWT token
24. Backend -> Backend: Check permissions (CONTRIBUTOR)
25. Backend -> Backend: Generate unique ID (SUB_20260507_001)
26. Backend -> Cloudinary: Upload file
27. Cloudinary -> Backend: Return {fileUrl}
28. Backend -> Database: Create submission record
29. Database -> Backend: Return submission with _id
30. Backend -> Frontend: 201 Created {submission}
31. Frontend -> Frontend: Add to submissions list
32. Frontend -> User: Show success "Submission created"
33. Frontend -> User: Redirect to my submissions

Phase 3: View Submissions as Reviewer

34. Reviewer -> Frontend: Login with reviewer account
35. Frontend -> Backend: POST /api/auth/login
36. Backend -> Database: Find user by email
37. Backend -> Backend: Compare password
38. Backend -> Backend: Generate JWT token
39. Backend -> Frontend: {token, user}
40. Frontend -> Frontend: localStorage.setItem('token', token)
41. Frontend -> Reviewer: Redirect to reviewer dashboard
42. Reviewer -> Frontend: View all submissions
43. Frontend -> Backend: GET /api/submissions
44. Backend -> Backend: Verify JWT
45. Backend -> Backend: Check permissions (REVIEWER)
46. Backend -> Database: Query all submissions
47. Database -> Backend: Return submissions array
48. Backend -> Frontend: 200 OK {submissions}
49. Frontend -> Frontend: Display submissions list
50. Frontend -> Reviewer: Show PENDING submissions

Phase 4: Review Submission

51. Reviewer -> Frontend: Click submission to review
52. Frontend -> Frontend: Show submission details
53. Reviewer -> Frontend: Click "Approve" button
54. Frontend -> Frontend: Show approval dialog
55. Reviewer -> Frontend: Type review notes
56. Reviewer -> Frontend: Click "Submit Review"
57. Frontend -> Backend: PUT /api/submissions/{id}/review
58. Backend -> Backend: Verify JWT
59. Backend -> Backend: Check permissions
60. Backend -> Database: Find submission
61. Database -> Backend: Return submission
62. Backend -> Backend: Validate status == PENDING
63. Backend -> Database: Update status to APPROVED
64. Backend -> Database: Add review notes
65. Backend -> Database: Record reviewer ID
66. Database -> Backend: Confirmation
67. Backend -> Frontend: 200 OK {success}
68. Frontend -> Frontend: Remove from PENDING list
69. Frontend -> Reviewer: Show "Review submitted"

Phase 5: View Review as Contributor

70. Contributor -> Frontend: View my submissions
71. Frontend -> Backend: GET /api/submissions/my
72. Backend -> Backend: Get user ID from token
73. Backend -> Database: Query submissions by contributor
74. Database -> Backend: Return user's submissions
75. Backend -> Frontend: {submissions}
76. Frontend -> Frontend: Display submissions
77. Frontend -> Contributor: Show submission with status APPROVED
78. Contributor -> Frontend: Click to view details
79. Frontend -> Frontend: Display submission details
80. Frontend -> Contributor: Show reviewer notes "Well done!"

Phase 6: Admin Views Analytics

81. Admin -> Frontend: Login as admin
82. Frontend -> Backend: POST /api/auth/login
83. Backend -> Database: Authenticate
84. Backend -> Frontend: {token, user}
85. Frontend -> Admin: Redirect to admin dashboard
86. Admin -> Frontend: View analytics
87. Frontend -> Backend: GET /api/admin/analytics
88. Backend -> Backend: Verify JWT
89. Backend -> Backend: Check role == ADMIN
90. Backend -> Database: Count total users
91. Backend -> Database: Count total submissions
92. Backend -> Database: Count approved submissions
93. Backend -> Database: Count rejected submissions
94. Backend -> Database: Count pending submissions
95. Database -> Backend: Return all counts
96. Backend -> Frontend: {analytics: {...}}
97. Frontend -> Frontend: Display analytics cards
98. Frontend -> Admin: Show all statistics

End of Journey

Summary:
- User completes: Register → Create → Review → View → Analytics
- Database operations: CREATE, READ, UPDATE
- Cloudinary operations: FILE UPLOAD
- Security: JWT validation on each request
- Permissions: Role-based access control enforced
```

---

# ✅ END OF COMPLETE UML DIAGRAMS

All 12 UML diagrams are provided above. Copy any section and paste into ChatGPT with the prompt:

**"Create a UML [diagram-type] based on this description:"**

Then paste the relevant diagram content.

Each diagram is complete and ready to generate! 🎯📐
