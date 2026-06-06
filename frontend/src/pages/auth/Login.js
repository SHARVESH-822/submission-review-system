import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { forgotPassword, loginUser, resetPassword, verifyResetOtp } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../components/Logo';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [savedEmails, setSavedEmails] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetStep, setResetStep] = useState('email');
  const [resetFormData, setResetFormData] = useState({
    email: '',
    otp: '',
    password: '',
    confirmPassword: ''
  });
  const [resetToken, setResetToken] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');
  const [isCompact, setIsCompact] = useState(window.innerWidth < 820);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const emails = JSON.parse(localStorage.getItem('savedEmails') || '[]');
    setSavedEmails(emails);
  }, []);

  useEffect(() => {
    const handleResize = () => setIsCompact(window.innerWidth < 820);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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
    setResetStep('email');
    setResetToken('');
    setResetMessage('');
    setResetError('');
    setResetFormData({
      email: formData.email,
      otp: '',
      password: '',
      confirmPassword: ''
    });
  };

  const closeResetForm = () => {
    setShowResetForm(false);
    setResetStep('email');
    setResetToken('');
    setResetMessage('');
    setResetError('');
    setResetFormData({ email: '', otp: '', password: '', confirmPassword: '' });
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
      setResetStep('otp');
      setResetMessage(res.data.message || 'OTP sent to your registered email address.');
    } catch (err) {
      setResetError(err.response?.data?.message || 'Unable to send OTP.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setResetLoading(true);
    setResetError('');
    setResetMessage('');
    try {
      const res = await verifyResetOtp({
        email: resetFormData.email,
        otp: resetFormData.otp
      });
      setResetToken(res.data.data.resetToken);
      setResetStep('password');
      setResetMessage(res.data.message || 'OTP verified. Please enter a new password.');
    } catch (err) {
      setResetError(err.response?.data?.message || 'Invalid OTP.');
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
      setResetToken('');
      setResetStep('done');
      setResetMessage(res.data.message || 'Password updated successfully. Please sign in.');
      setResetFormData({
        email: resetFormData.email,
        otp: '',
        password: '',
        confirmPassword: ''
      });
    } catch (err) {
      setResetError(err.response?.data?.message || 'Unable to reset password.');
    } finally {
      setResetLoading(false);
    }
  };

  const shellStyle = {
    ...styles.shell,
    flexDirection: isCompact ? 'column' : 'row',
    maxWidth: isCompact ? '430px' : '980px'
  };

  const sidePanelStyle = {
    ...styles.sidePanel,
    width: isCompact ? '100%' : '38%',
    minHeight: isCompact ? 'auto' : '640px'
  };

  const cardStyle = {
    ...styles.card,
    width: isCompact ? '100%' : '62%',
    padding: isCompact ? '28px' : '44px'
  };

  const resetTitle =
    resetStep === 'otp'
      ? 'Verify email OTP'
      : resetStep === 'password'
        ? 'Create new password'
        : resetStep === 'done'
          ? 'Password updated'
          : 'Reset password';

  return (
    <div style={styles.page}>
      <div style={shellStyle}>
        <aside style={sidePanelStyle}>
          <div style={styles.brandBlock}>
            <Logo size={isCompact ? 'small' : 'large'} />
            <div style={styles.brandDivider}></div>
            <h1 style={styles.heroTitle}>Secure submission review starts here.</h1>
            <p style={styles.heroText}>
              Sign in to manage submissions, reviews, resubmissions, and approvals from one SRMS workspace.
            </p>
          </div>

          <div style={styles.roleGrid}>
            <div style={styles.roleChip}>Contributor</div>
            <div style={styles.roleChip}>Reviewer</div>
            <div style={styles.roleChip}>Admin</div>
          </div>

          <div style={styles.sideStats}>
            <div>
              <div style={styles.statNumber}>3</div>
              <div style={styles.statLabel}>profile access</div>
            </div>
            <div>
              <div style={styles.statNumber}>JWT</div>
              <div style={styles.statLabel}>secured login</div>
            </div>
          </div>
        </aside>

        <main style={cardStyle}>
          <div style={styles.cardHeader}>
            <div>
              <div style={styles.eyebrow}>SRMS ACCOUNT ACCESS</div>
              <h2 style={styles.title}>Welcome back</h2>
              <p style={styles.subtitle}>Enter your credentials to continue.</p>
            </div>
          </div>

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
                            {name ? name.charAt(0).toUpperCase() : '@'}
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
            <section style={styles.resetPanel}>
              <div style={styles.resetHeader}>
                <div>
                  <div style={styles.resetEyebrow}>ACCOUNT RECOVERY</div>
                  <h3 style={styles.resetTitle}>{resetTitle}</h3>
                </div>
                <button type='button' style={styles.closeButton} onClick={closeResetForm}>
                  x
                </button>
              </div>

              <div style={styles.steps}>
                {['email', 'otp', 'password'].map((step, index) => (
                  <div
                    key={step}
                    style={{
                      ...styles.stepPill,
                      ...(resetStep === step || (resetStep === 'done' && step === 'password')
                        ? styles.stepPillActive
                        : {})
                    }}
                  >
                    {index + 1}. {step === 'email' ? 'Email' : step === 'otp' ? 'OTP' : 'Password'}
                  </div>
                ))}
              </div>

              {resetError && <div style={styles.resetError}>{resetError}</div>}
              {resetMessage && <div style={styles.resetSuccess}>{resetMessage}</div>}

              {resetStep === 'email' && (
                <form onSubmit={handleForgotPassword}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Registered Email</label>
                    <input
                      style={styles.input}
                      type='email'
                      name='email'
                      value={resetFormData.email}
                      onChange={handleResetChange}
                      required
                      placeholder='Enter your account email'
                    />
                  </div>
                  <button style={styles.secondaryButton} type='submit' disabled={resetLoading}>
                    {resetLoading ? 'Sending OTP...' : 'Send OTP'}
                  </button>
                </form>
              )}

              {resetStep === 'otp' && (
                <form onSubmit={handleVerifyOtp}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Email OTP</label>
                    <input
                      style={{ ...styles.input, ...styles.otpInput }}
                      type='text'
                      name='otp'
                      value={resetFormData.otp}
                      onChange={handleResetChange}
                      required
                      maxLength='6'
                      placeholder='000000'
                      autoComplete='one-time-code'
                    />
                  </div>
                  <button style={styles.secondaryButton} type='submit' disabled={resetLoading}>
                    {resetLoading ? 'Verifying...' : 'Verify OTP'}
                  </button>
                </form>
              )}

              {resetStep === 'password' && (
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

              {resetStep === 'done' && (
                <button style={styles.secondaryButton} type='button' onClick={closeResetForm}>
                  Back to Sign In
                </button>
              )}
            </section>
          )}

          <p style={styles.link}>
            Don't have an account?{' '}
            <Link to='/register' style={styles.linkAccent}>CREATE ACCOUNT</Link>
          </p>
        </main>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#eef3f8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '26px',
    boxSizing: 'border-box',
    fontFamily: 'Arial, sans-serif'
  },
  shell: {
    display: 'flex',
    width: '100%',
    borderRadius: '18px',
    overflow: 'hidden',
    backgroundColor: 'white',
    boxShadow: '0 24px 70px rgba(15, 42, 67, 0.18)',
    border: '1px solid #dce6f0'
  },
  sidePanel: {
    boxSizing: 'border-box',
    padding: '34px',
    background: 'linear-gradient(160deg, #061b33 0%, #0b315c 58%, #1261c3 100%)',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: '28px'
  },
  brandBlock: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '22px'
  },
  brandDivider: {
    width: '54px',
    height: '3px',
    borderRadius: '99px',
    backgroundColor: '#35c2ff'
  },
  heroTitle: {
    margin: 0,
    fontSize: '30px',
    lineHeight: 1.18,
    fontWeight: '800',
    letterSpacing: 0
  },
  heroText: {
    margin: 0,
    color: '#dbeafe',
    fontSize: '14px',
    lineHeight: 1.7
  },
  roleGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px'
  },
  roleChip: {
    padding: '10px 13px',
    borderRadius: '8px',
    backgroundColor: 'rgba(255,255,255,0.12)',
    border: '1px solid rgba(255,255,255,0.18)',
    color: '#f8fafc',
    fontSize: '13px',
    fontWeight: '700'
  },
  sideStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '12px'
  },
  statNumber: {
    fontSize: '24px',
    fontWeight: '800'
  },
  statLabel: {
    marginTop: '4px',
    color: '#bfdbfe',
    fontSize: '12px',
    textTransform: 'uppercase'
  },
  card: {
    boxSizing: 'border-box',
    backgroundColor: '#ffffff'
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '28px'
  },
  eyebrow: {
    color: '#2563eb',
    fontSize: '12px',
    fontWeight: '800',
    letterSpacing: '1px',
    marginBottom: '10px'
  },
  title: {
    fontSize: '32px',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0,
    letterSpacing: 0
  },
  subtitle: {
    color: '#64748b',
    fontSize: '14px',
    margin: '10px 0 0'
  },
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
    color: '#334155',
    fontSize: '12px',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: '0.6px'
  },
  textButton: {
    border: 'none',
    background: 'transparent',
    color: '#2563eb',
    fontSize: '13px',
    fontWeight: '800',
    cursor: 'pointer',
    padding: 0
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    border: '1.5px solid #d7e0ea',
    borderRadius: '8px',
    fontSize: '15px',
    color: '#0f172a',
    outline: 'none',
    boxSizing: 'border-box',
    backgroundColor: '#f8fafc'
  },
  otpInput: {
    textAlign: 'center',
    fontSize: '22px',
    fontWeight: '800',
    letterSpacing: '8px'
  },
  suggestions: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    border: '1.5px solid #d7e0ea',
    borderRadius: '8px',
    boxShadow: '0 14px 34px rgba(15, 42, 67, 0.12)',
    zIndex: 999,
    overflow: 'hidden',
    marginTop: '6px'
  },
  suggestionItem: {
    padding: '12px 16px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#0f172a',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    borderBottom: '1px solid #eef2f7'
  },
  button: {
    width: '100%',
    padding: '15px',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '800',
    cursor: 'pointer',
    marginTop: '8px',
    boxShadow: '0 12px 24px rgba(37, 99, 235, 0.24)'
  },
  secondaryButton: {
    width: '100%',
    padding: '13px',
    backgroundColor: '#0f2a43',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '800',
    cursor: 'pointer'
  },
  error: {
    backgroundColor: '#fff5f5',
    color: '#dc2626',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px',
    borderLeft: '4px solid #dc2626'
  },
  resetPanel: {
    marginTop: '24px',
    padding: '22px',
    border: '1.5px solid #d7e0ea',
    borderRadius: '12px',
    backgroundColor: '#ffffff',
    boxShadow: '0 12px 28px rgba(15, 42, 67, 0.08)'
  },
  resetHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '16px',
    marginBottom: '16px'
  },
  resetEyebrow: {
    color: '#2563eb',
    fontSize: '11px',
    fontWeight: '800',
    letterSpacing: '0.8px',
    marginBottom: '6px'
  },
  resetTitle: {
    margin: 0,
    color: '#0f172a',
    fontSize: '20px',
    fontWeight: '800',
    letterSpacing: 0
  },
  closeButton: {
    border: 'none',
    background: '#eef2f7',
    color: '#64748b',
    cursor: 'pointer',
    fontSize: '16px',
    lineHeight: 1,
    borderRadius: '8px',
    width: '32px',
    height: '32px'
  },
  steps: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '8px',
    marginBottom: '16px'
  },
  stepPill: {
    padding: '9px 8px',
    borderRadius: '8px',
    backgroundColor: '#f1f5f9',
    color: '#64748b',
    fontSize: '12px',
    fontWeight: '800',
    textAlign: 'center'
  },
  stepPillActive: {
    backgroundColor: '#dbeafe',
    color: '#1d4ed8'
  },
  resetError: {
    backgroundColor: '#fff5f5',
    color: '#dc2626',
    padding: '11px 13px',
    borderRadius: '8px',
    marginBottom: '14px',
    fontSize: '13px',
    borderLeft: '4px solid #dc2626'
  },
  resetSuccess: {
    backgroundColor: '#ecfdf5',
    color: '#047857',
    padding: '11px 13px',
    borderRadius: '8px',
    marginBottom: '14px',
    fontSize: '13px',
    borderLeft: '4px solid #10b981'
  },
  link: {
    textAlign: 'center',
    marginTop: '26px',
    fontSize: '14px',
    color: '#64748b'
  },
  linkAccent: {
    color: '#2563eb',
    fontWeight: '700',
    textDecoration: 'none'
  },
  suggestionAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #0f2a43, #2563eb)',
    color: 'white',
    fontSize: '13px',
    fontWeight: '800',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  suggestionInfo: { display: 'flex', flexDirection: 'column', gap: '2px' },
  suggestionName: { fontSize: '13px', fontWeight: '800', color: '#0f172a' },
  suggestionEmail: { fontSize: '12px', color: '#64748b' }
};

export default Login;
