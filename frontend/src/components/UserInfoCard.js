import React from 'react';
import { useAuth } from '../context/AuthContext';

const UserInfoCard = () => {
  const { user } = useAuth();

  if (!user) return null;

  const getRoleConfig = (role) => {
    if (role === 'CONTRIBUTOR') return { color: '#1d4ed8', bg: '#dbeafe', border: '#bfdbfe', label: 'Contributor' };
    if (role === 'REVIEWER') return { color: '#6d28d9', bg: '#ede9fe', border: '#ddd6fe', label: 'Reviewer' };
    if (role === 'ADMIN') return { color: '#0369a1', bg: '#e0f2fe', border: '#bae6fd', label: 'Admin' };
    return { color: '#475569', bg: '#f1f5f9', border: '#e2e8f0', label: 'User' };
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
            {roleConfig.label}
          </span>
          <span style={styles.statusPill}>Active session</span>
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
    padding: '18px 22px',
    borderRadius: '12px',
    boxShadow: '0 18px 38px rgba(15,42,67,0.08)',
    border: '1px solid #dbe5ef',
    marginBottom: '24px',
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fbff 100%)'
  },
  avatar: {
    width: '52px',
    height: '52px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #0f2a43, #2563eb)',
    color: 'white',
    fontSize: '22px',
    fontWeight: '800',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 10px 22px rgba(37,99,235,0.22)'
  },
  info: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  name: {
    fontSize: '16px',
    fontWeight: '800',
    color: '#0f172a'
  },
  roleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap'
  },
  roleBadge: {
    fontSize: '12px',
    fontWeight: '800',
    padding: '4px 10px',
    borderRadius: '999px'
  },
  statusPill: {
    color: '#16a34a',
    backgroundColor: '#ecfdf5',
    border: '1px solid #bbf7d0',
    borderRadius: '999px',
    padding: '4px 10px',
    fontSize: '12px',
    fontWeight: '700'
  },
  email: {
    fontSize: '12px',
    color: '#64748b',
    marginTop: '2px'
  }
};

export default UserInfoCard;
