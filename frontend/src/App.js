import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ContributorDashboard from './pages/contributor/ContributorDashboard';
import SubmissionForm from './pages/contributor/SubmissionForm';
import ReviewerDashboard from './pages/reviewer/ReviewerDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />

          {/* Contributor Routes */}
          <Route
            path='/contributor/dashboard'
            element={
              <PrivateRoute role='CONTRIBUTOR'>
                <ContributorDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path='/contributor/submit'
            element={
              <PrivateRoute role='CONTRIBUTOR'>
                <SubmissionForm />
              </PrivateRoute>
            }
          />
          <Route
            path='/contributor/resubmit/:id'
            element={
              <PrivateRoute role='CONTRIBUTOR'>
                <SubmissionForm />
              </PrivateRoute>
            }
          />

          {/* Reviewer Routes */}
          <Route
            path='/reviewer/dashboard'
            element={
              <PrivateRoute role='REVIEWER'>
                <ReviewerDashboard />
              </PrivateRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path='/admin/dashboard'
            element={
              <PrivateRoute role='ADMIN'>
                <AdminDashboard />
              </PrivateRoute>
            }
          />

          {/* Default Route */}
          <Route path='/' element={<Navigate to='/login' />} />
          <Route path='*' element={<Navigate to='/login' />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;