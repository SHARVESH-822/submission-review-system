import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { forgotPassword, loginUser, resetPassword } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../components/Logo';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [savedEmails, setSavedEmails] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetFormData, setResetFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [resetToken, setResetToken] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const emails = JSON.parse(localStorage.getItem('savedEmails') || '[]');
    setSavedEmails(emails);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === 'email') setShowSuggestions(true);
  };

  const handleEmailSelect = (email) => {
    setFormData({ ...formData, email });
    setShowSuggestions(false);
  };

  const handleResetChange = (e) => {
    setResetFormData({ ...resetFormData, [e.target.name]: e.target.value });
  };

  const openResetForm = () => {
    setShowResetForm(true);
    setResetToken('');
    setResetMessage('');
    setResetError('');
    setResetFormData({
      email: formData.email,
      password: '',
      confirmPassword: ''
    });
  };

  const closeResetForm = () => {
    setShowResetForm(false);
    setResetToken('');
    setResetMessage('');
    setResetError('');
    setResetFormData({ email: '', password: '', confirmPassword: '' });
  };

  const filteredEmails = savedEmails.filter((item) =>
    typeof item === 'object'
      ? item.email.toLowerCase().includes(formData.email.toLowerCase())
      : item.toLowerCase().includes(formData.email.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await loginUser(formData);
      const { token, user } = res.data.data;
      const emails = JSON.parse(localStorage.getItem('savedEmails') || '[]');
      const existing = emails.find((e) =>
        typeof e === 'object' ? e.email === formData.email : e === formData.email
      );
      if (!existing) {
        emails.push({ email: formData.email, name: user.name });
        localStorage.setItem('savedEmails', JSON.stringify(emails));
      }
      login(user, token);
      if (user.role === 'CONTRIBUTOR') navigate('/contributor/dashboard');
      else if (user.role === 'REVIEWER') navigate('/reviewer/dashboard');
      else if (user.role === 'ADMIN') navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setResetLoading(true);
    setResetError('');
    setResetMessage('');
    try {
      const res = await forgotPassword({ email: resetFormData.email });
      setResetToken(res.data.data.resetToken);
      setResetMessage(res.data.message || 'Email verified. Enter a new password.');
    } catch (err) {
      setResetError(err.response?.data?.message || 'Unable to start password reset.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetLoading(true);
    setResetError('');
    setResetMessage('');

    if (resetFormData.password !== resetFormData.confirmPassword) {
      setResetError('Passwords do not match.');
      setResetLoading(false);
      return;
    }

    try {
      const res = await resetPassword({
        token: resetToken,
        password: resetFormData.password
      });
      setFormData({ email: resetFormData.email, password: '' });
      setResetMessage(res.data.message || 'Password updated successfully. Please sign in.');
      setResetToken('');
      setResetFormData({
        email: resetFormData.email,
        password: '',
        confirmPassword: ''
      });
    } catch (err) {
      setResetError(err.response?.data?.message || 'Unable to reset password.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.center}>
        <div style={styles.logoBox}>
          <Logo size="large" />
        </div>
        <div style={styles.card}>
          <h2 style={styles.title}>SIGN IN</h2>
          <br></br>
          <p style={styles.subtitle}>ENTER YOUR CREDENTIALS TO CONTINUE</p>

          {error && <div style={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  style={styles.input}
                  type='email'
                  name='email'
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  required
                  placeholder='Enter your email'
                  autoComplete='off'
                />
                {showSuggestions && filteredEmails.length > 0 && (
                  <div style={styles.suggestions}>
                    {filteredEmails.map((item, i) => {
                      const email = typeof item === 'object' ? item.email : item;
                      const name = typeof item === 'object' ? item.name : '';
                      return (
                        <div
                          key={i}
                          style={styles.suggestionItem}
                          onMouseDown={() => handleEmailSelect(email)}
                        >
                          <div style={styles.suggestionAvatar}>
                            {name ? name.charAt(0).toUpperCase() : '✉'}
                          </div>
                          <div style={styles.suggestionInfo}>
                            {name && <div style={styles.suggestionName}>{name}</div>}
                            <div style={styles.suggestionEmail}>{email}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div style={styles.formGroup}>
              <div style={styles.passwordHeader}>
                <label style={{ ...styles.label, marginBottom: 0 }}>Password</label>
                <button type='button' style={styles.textButton} onClick={openResetForm}>
                  Forgot password?
                </button>
              </div>
              <input
                style={styles.input}
                type='password'
                name='password'
                value={formData.password}
                onChange={handleChange}
                required
                placeholder='Enter your password'
              />
            </div>

            <button style={styles.button} type='submit' disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {showResetForm && (
            <div style={styles.resetPanel}>
              <div style={styles.resetHeader}>
                <h3 style={styles.resetTitle}>
                  {resetToken ? 'SET NEW PASSWORD' : 'RESET PASSWORD'}
                </h3>
                <button type='button' style={styles.closeButton} onClick={closeResetForm}>
                  x
                </button>
              </div>

              {resetError && <div style={styles.resetError}>{resetError}</div>}
              {resetMessage && <div style={styles.resetSuccess}>{resetMessage}</div>}

              {!resetToken ? (
                <form onSubmit={handleForgotPassword}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Email Address</label>
                    <input
                      style={styles.input}
                      type='email'
                      name='email'
                      value={resetFormData.email}
                      onChange={handleResetChange}
                      required
                      placeholder='Enter your email'
                    />
                  </div>
                  <button style={styles.secondaryButton} type='submit' disabled={resetLoading}>
                    {resetLoading ? 'Checking...' : 'Verify Email'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>New Password</label>
                    <input
                      style={styles.input}
                      type='password'
                      name='password'
                      value={resetFormData.password}
                      onChange={handleResetChange}
                      required
                      minLength='6'
                      placeholder='Enter new password'
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Confirm Password</label>
                    <input
                      style={styles.input}
                      type='password'
                      name='confirmPassword'
                      value={resetFormData.confirmPassword}
                      onChange={handleResetChange}
                      required
                      minLength='6'
                      placeholder='Confirm new password'
                    />
                  </div>
                  <button style={styles.secondaryButton} type='submit' disabled={resetLoading}>
                    {resetLoading ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              )}
            </div>
          )}

          <p style={styles.link}>
            Don't have an account?{' '}
            <Link to='/register'>CREATE ACCOUNT</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  center: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '28px',
    width: '100%',
    maxWidth: '440px',
    padding: '24px'
  },
  logoBox: { display: 'flex', justifyContent: 'center' },
  card: {
    backgroundColor: 'white',
    padding: '40px 36px',
    borderRadius: '16px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
    width: '100%',
    border: '1px solid #e8e8e8'
  },
  title: { fontSize: '26px', fontWeight: '700', color: '#2d2d2d', marginBottom: '6px' },
  subtitle: { color: '#999', fontSize: '14px', marginBottom: '28px' },
  formGroup: { marginBottom: '20px' },
  passwordHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    marginBottom: '8px'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    color: '#555',
    fontSize: '13px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  textButton: {
    border: 'none',
    background: 'transparent',
    color: '#4A4A4A',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    padding: 0
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    border: '1.5px solid #e0e0e0',
    borderRadius: '10px',
    fontSize: '14px',
    color: '#2d2d2d',
    outline: 'none',
    boxSizing: 'border-box',
    backgroundColor: '#fafafa'
  },
  suggestions: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    border: '1.5px solid #e0e0e0',
    borderRadius: '10px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
    zIndex: 999,
    overflow: 'hidden',
    marginTop: '4px'
  },
  suggestionItem: {
    padding: '12px 16px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#2d2d2d',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    borderBottom: '1px solid #f5f5f5'
  },
  button: {
    width: '100%',
    padding: '13px',
    backgroundColor: '#4A4A4A',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '8px',
    letterSpacing: '0.3px'
  },
  secondaryButton: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#4A4A4A',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    letterSpacing: '0.3px'
  },
  error: {
    backgroundColor: '#fff5f5',
    color: '#e53e3e',
    padding: '12px 16px',
    borderRadius: '10px',
    marginBottom: '20px',
    fontSize: '14px',
    borderLeft: '3px solid #e53e3e'
  },
  resetPanel: {
    marginTop: '20px',
    padding: '18px',
    border: '1.5px solid #e0e0e0',
    borderRadius: '10px',
    backgroundColor: '#fafafa'
  },
  resetHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px'
  },
  resetTitle: {
    margin: 0,
    color: '#2d2d2d',
    fontSize: '15px',
    fontWeight: '700',
    letterSpacing: '0.5px'
  },
  closeButton: {
    border: 'none',
    background: 'transparent',
    color: '#999',
    cursor: 'pointer',
    fontSize: '18px',
    lineHeight: 1
  },
  resetError: {
    backgroundColor: '#fff5f5',
    color: '#e53e3e',
    padding: '10px 12px',
    borderRadius: '8px',
    marginBottom: '14px',
    fontSize: '13px',
    borderLeft: '3px solid #e53e3e'
  },
  resetSuccess: {
    backgroundColor: '#f0fff4',
    color: '#2f855a',
    padding: '10px 12px',
    borderRadius: '8px',
    marginBottom: '14px',
    fontSize: '13px',
    borderLeft: '3px solid #2f855a'
  },
  link: { textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#999' },
  suggestionAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #4A4A4A, #2d2d2d)',
    color: 'white',
    fontSize: '13px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  suggestionInfo: { display: 'flex', flexDirection: 'column', gap: '2px' },
  suggestionName: { fontSize: '13px', fontWeight: '600', color: '#2d2d2d' },
  suggestionEmail: { fontSize: '12px', color: '#999' }
};

export default Login;
