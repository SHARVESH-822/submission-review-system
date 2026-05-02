import React from 'react';
import { useAuth } from '../context/AuthContext';

const UserInfoCard = () => {
  const { user } = useAuth();

  if (!user) return null;

  const getRoleConfig = (role) => {
    if (role === 'CONTRIBUTOR') return { color: '#4A4A4A', bg: '#f0f0f0', border: '#e0e0e0', icon: '✍️' };
    if (role === 'REVIEWER') return { color: '#555', bg: '#e8e8e8', border: '#d0d0d0', icon: '🔍' };
    if (role === 'ADMIN') return { color: '#2d2d2d', bg: '#ddd', border: '#bbb', icon: '⚙️' };
    return { color: '#888', bg: '#f5f5f5', border: '#e0e0e0', icon: '👤' };
  };

  const roleConfig = getRoleConfig(user.role);

  return (
    <div style={styles.card}>
      <div style={styles.avatar}>
        {user.name?.charAt(0).toUpperCase()}
      </div>
      <div style={styles.info}>
        <div style={styles.name}>{user.name}</div>
        <div style={styles.roleRow}>
          <span style={{
            ...styles.roleBadge,
            color: roleConfig.color,
            backgroundColor: roleConfig.bg,
            border: `1px solid ${roleConfig.border}`
          }}>
            {roleConfig.icon} {user.role}
          </span>
        </div>
        {user.email && (
          <div style={styles.email}>{user.email}</div>
        )}
      </div>
    </div>
  );
};

const styles = {
  card: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    backgroundColor: 'white',
    padding: '16px 20px',
    borderRadius: '14px',
    boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
    border: '1px solid #e8e8e8',
    marginBottom: '24px',
    background: 'linear-gradient(135deg, #ffffff, #f5f5f5)'
  },
  avatar: {
    width: '52px',
    height: '52px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #4A4A4A, #2d2d2d)',
    color: 'white',
    fontSize: '22px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
  },
  info: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  name: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#2d2d2d'
  },
  roleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  roleBadge: {
    fontSize: '12px',
    fontWeight: '600',
    padding: '3px 10px',
    borderRadius: '20px'
  },
  email: {
    fontSize: '12px',
    color: '#999',
    marginTop: '2px'
  }
};

export default UserInfoCard;