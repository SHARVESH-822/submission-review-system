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
    if (role === 'CONTRIBUTOR') return '#2563eb';
    if (role === 'REVIEWER') return '#7c3aed';
    if (role === 'ADMIN') return '#0ea5e9';
    return '#64748b';
  };

  const getRoleLabel = (role) => {
    if (role === 'CONTRIBUTOR') return 'Contributor Workspace';
    if (role === 'REVIEWER') return 'Review Queue';
    if (role === 'ADMIN') return 'Admin Control';
    return 'Workspace';
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.left}>
        <Logo size="small" />
        <div style={styles.brandText}>
          <span style={styles.brandTitle}>SRMS</span>
          <span style={styles.brandSub}>Submission Review Management</span>
        </div>
      </div>
      {user && (
        <div style={styles.right}>
          <div style={styles.workspacePill}>{getRoleLabel(user.role)}</div>
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
    background: 'linear-gradient(135deg, #061b33 0%, #0f2a43 48%, #164e8b 100%)',
    padding: '12px 28px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 16px 34px rgba(15,42,67,0.18)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    borderBottom: '1px solid rgba(255,255,255,0.12)'
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px'
  },
  brandText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  brandTitle: {
    color: 'white',
    fontSize: '15px',
    fontWeight: '800',
    letterSpacing: '0.5px'
  },
  brandSub: {
    color: '#bfdbfe',
    fontSize: '11px',
    fontWeight: '600'
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    flexWrap: 'wrap',
    justifyContent: 'flex-end'
  },
  workspacePill: {
    color: '#dbeafe',
    backgroundColor: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.18)',
    borderRadius: '999px',
    padding: '7px 12px',
    fontSize: '12px',
    fontWeight: '700'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  userName: {
    color: '#f8fafc',
    fontSize: '14px',
    fontWeight: '700'
  },
  roleBadge: {
    padding: '5px 10px',
    borderRadius: '20px',
    color: 'white',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.5px'
  },
  logoutBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: '#f8fafc',
    border: '1px solid rgba(255,255,255,0.2)',
    padding: '8px 18px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '700'
  }
};

export default Navbar;
