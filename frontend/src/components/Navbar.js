import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadgeColor = (role) => {
    if (role === 'CONTRIBUTOR') return '#4A4A4A';
    if (role === 'REVIEWER') return '#888888';
    if (role === 'ADMIN') return '#2d2d2d';
    return '#999';
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.left}>
        <Logo size="small" />
      </div>
      {user && (
        <div style={styles.right}>
          <div style={styles.userInfo}>
            <span style={styles.userName}>{user.name}</span>
            <span
              style={{
                ...styles.roleBadge,
                backgroundColor: getRoleBadgeColor(user.role)
              }}
            >
              {user.role}
            </span>
          </div>
          <button style={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

const styles = {
  nav: {
    backgroundColor: '#2d2d2d',
    padding: '12px 32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
    position: 'sticky',
    top: 0,
    zIndex: 100
  },
  left: {
    display: 'flex',
    alignItems: 'center'
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  userName: {
    color: '#e2e8f0',
    fontSize: '14px',
    fontWeight: '500'
  },
  roleBadge: {
    padding: '3px 10px',
    borderRadius: '20px',
    color: 'white',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.5px'
  },
  logoutBtn: {
    backgroundColor: 'transparent',
    color: '#e2e8f0',
    border: '1px solid #555',
    padding: '7px 18px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500'
  }
};

export default Navbar;