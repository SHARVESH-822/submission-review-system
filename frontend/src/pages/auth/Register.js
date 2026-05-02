import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../components/Logo';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'CONTRIBUTOR'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await registerUser(formData);
      const { token, user } = res.data.data;
      login(user, token);
      if (user.role === 'CONTRIBUTOR') navigate('/contributor/dashboard');
      else if (user.role === 'REVIEWER') navigate('/reviewer/dashboard');
      else if (user.role === 'ADMIN') navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { value: 'CONTRIBUTOR', label: 'Contributor', color: '#4A4A4A' },
    { value: 'REVIEWER', label: 'Reviewer', color: '#888888' },
    { value: 'ADMIN', label: 'Admin', color: '#2d2d2d' }
  ];

  return (
    <div style={styles.page}>
      <div style={styles.center}>
        <div style={styles.logoBox}>
          <Logo size="large" />
        </div>

        <div style={styles.card}>
          <h2 style={styles.title}>CREATE ACCOUNT</h2>
          <p style={styles.subtitle}>FILL THE DETAILS TO GET STARTED</p>

          {error && <div style={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Full Name</label>
              <input
                style={styles.input}
                type='text'
                name='name'
                value={formData.name}
                onChange={handleChange}
                required
                placeholder='Enter your full name'
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                style={styles.input}
                type='email'
                name='email'
                value={formData.email}
                onChange={handleChange}
                required
                placeholder='Enter your email'
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Password</label>
              <input
                style={styles.input}
                type='password'
                name='password'
                value={formData.password}
                onChange={handleChange}
                required
                placeholder='Min 6 characters'
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Select Role</label>
              <div style={styles.roleSelector}>
                {roles.map((role) => (
                  <div
                    key={role.value}
                    style={{
                      ...styles.roleOption,
                      borderColor:
                        formData.role === role.value ? role.color : '#e0e0e0',
                      backgroundColor:
                        formData.role === role.value ? '#f5f5f5' : 'white'
                    }}
                    onClick={() =>
                      setFormData({ ...formData, role: role.value })
                    }
                  >
                    <div
                      style={{
                        ...styles.roleDot,
                        backgroundColor: role.color
                      }}
                    />
                    <span
                      style={{
                        ...styles.roleLabel,
                        color:
                          formData.role === role.value ? role.color : '#888'
                      }}
                    >
                      {role.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              style={styles.button}
              type='submit'
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p style={styles.link}>
            Already have an account?{' '}
            <Link to='/login'>SIGN IN</Link>
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
  logoBox: {
    display: 'flex',
    justifyContent: 'center'
  },
  card: {
    backgroundColor: 'white',
    padding: '40px 36px',
    borderRadius: '16px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
    width: '100%',
    border: '1px solid #e8e8e8'
  },
  title: {
    fontSize: '26px',
    fontWeight: '700',
    color: '#2d2d2d',
    marginBottom: '6px'
  },
  subtitle: {
    color: '#999',
    fontSize: '14px',
    marginBottom: '28px'
  },
  formGroup: { marginBottom: '18px' },
  label: {
    display: 'block',
    marginBottom: '8px',
    color: '#555',
    fontSize: '13px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
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
  roleSelector: {
    display: 'flex',
    gap: '8px'
  },
  roleOption: {
    flex: 1,
    padding: '10px 8px',
    borderRadius: '10px',
    border: '1.5px solid #e0e0e0',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px'
  },
  roleDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    flexShrink: 0
  },
  roleLabel: {
    fontSize: '12px',
    fontWeight: '600'
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
  error: {
    backgroundColor: '#fff5f5',
    color: '#e53e3e',
    padding: '12px 16px',
    borderRadius: '10px',
    marginBottom: '20px',
    fontSize: '14px',
    borderLeft: '3px solid #e53e3e'
  },
  link: {
    textAlign: 'center',
    marginTop: '24px',
    fontSize: '14px',
    color: '#999'
  }
};

export default Register;