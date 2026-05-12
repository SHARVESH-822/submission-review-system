import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import UserInfoCard from '../../components/UserInfoCard'
import axios from 'axios';

const AdminDashboard = () => {
  const { token } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('analytics');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [analyticsRes, usersRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/analytics', { headers }),
        axios.get('http://localhost:5000/api/admin/users', { headers })
      ]);
      setAnalytics(analyticsRes.data.data);
      setUsers(usersRes.data.data.users);
    } catch (err) {
      setError('Failed to fetch admin data.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(users.filter((u) => u._id !== userId));
    } catch (err) {
      setError('Failed to delete user.');
    }
  };

  const getRoleConfig = (role) => {
    if (role === 'CONTRIBUTOR') return { color: '#4A4A4A', bg: '#f0f0f0', border: '#e0e0e0' };
    if (role === 'REVIEWER') return { color: '#555', bg: '#e8e8e8', border: '#d0d0d0' };
    if (role === 'ADMIN') return { color: '#2d2d2d', bg: '#ddd', border: '#bbb' };
    return { color: '#888', bg: '#f5f5f5', border: '#e0e0e0' };
  };

  const analyticsCards = analytics ? [
    { label: 'Total Users', value: analytics.totalUsers, color: '#4A4A4A', from: '#f5f5f5', to: '#e8e8e8', icon: '👥' },
    { label: 'Contributors', value: analytics.totalContributors, color: '#555', from: '#efefef', to: '#e2e2e2', icon: '✍️' },
    { label: 'Reviewers', value: analytics.totalReviewers, color: '#666', from: '#eaeaea', to: '#dedede', icon: '🔍' },
    { label: 'Total Submissions', value: analytics.totalSubmissions, color: '#d97706', from: '#fffbeb', to: '#fef3c7', icon: '📄' },
    { label: 'Pending', value: analytics.pendingSubmissions, color: '#d97706', from: '#fffbeb', to: '#fef3c7', icon: '⏳' },
    { label: 'Approved', value: analytics.approvedSubmissions, color: '#16a34a', from: '#f0fdf4', to: '#dcfce7', icon: '✓' },
    { label: 'Rejected', value: analytics.rejectedSubmissions, color: '#dc2626', from: '#fef2f2', to: '#fee2e2', icon: '✗' }
  ] : [];

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.container}>

        <UserInfoCard />

        <div style={styles.pageHeader}>
          <div>
            <h1 style={styles.pageTitle}>Admin Dashboard</h1>
            <p style={styles.pageSubtitle}>Monitor and manage the entire system</p>
          </div>
        </div>

        <div style={styles.tabBar}>
          {['analytics', 'users'].map((tab) => (
            <button
              key={tab}
              style={{
                ...styles.tabBtn,
                background: activeTab === tab
                  ? 'linear-gradient(135deg, #4A4A4A, #2d2d2d)'
                  : 'white',
                color: activeTab === tab ? 'white' : '#666',
                border: activeTab === tab ? 'none' : '1.5px solid #e0e0e0'
              }}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'analytics' ? '📊 Analytics' : '👥 Users'}
            </button>
          ))}
        </div>

        {error && <div style={styles.error}>{error}</div>}

        {loading ? (
          <div style={styles.loadingBox}>
            <div style={styles.spinner} />
            <p style={styles.loadingText}>Loading data...</p>
          </div>
        ) : activeTab === 'analytics' ? (
          <div>
            <div style={styles.analyticsGrid}>
              {analyticsCards.map((card, i) => (
                <div key={i} style={{
                  ...styles.analyticsCard,
                  background: `linear-gradient(135deg, ${card.from}, ${card.to})`
                }}>
                  <div style={styles.analyticsIcon}>{card.icon}</div>
                  <div style={{ ...styles.analyticsValue, color: card.color }}>
                    {card.value}
                  </div>
                  <div style={styles.analyticsLabel}>{card.label}</div>
                </div>
              ))}
            </div>

            {analytics && (
              <div style={styles.chartCard}>
                <h3 style={styles.chartTitle}>Submission Overview</h3>
                <div style={styles.chartBars}>
                  {[
                    { label: 'Pending', value: analytics.pendingSubmissions, color: '#d97706', total: analytics.totalSubmissions },
                    { label: 'Approved', value: analytics.approvedSubmissions, color: '#16a34a', total: analytics.totalSubmissions },
                    { label: 'Rejected', value: analytics.rejectedSubmissions, color: '#dc2626', total: analytics.totalSubmissions }
                  ].map((bar, i) => (
                    <div key={i} style={styles.barItem}>
                      <div style={styles.barLabel}>{bar.label}</div>
                      <div style={styles.barTrack}>
                        <div style={{
                          ...styles.barFill,
                          width: bar.total > 0 ? `${(bar.value / bar.total) * 100}%` : '0%',
                          backgroundColor: bar.color
                        }} />
                      </div>
                      <div style={{ ...styles.barValue, color: bar.color }}>
                        {bar.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={styles.usersCard}>
            <div style={styles.usersHeader}>
              <h3 style={styles.usersTitle}>All Users</h3>
              <span style={styles.usersCount}>{users.length} total</span>
            </div>
            <div style={styles.usersList}>
              {users.map((user) => {
                const roleConfig = getRoleConfig(user.role);
                return (
                  <div key={user._id} style={styles.userRow}>
                    <div style={styles.userAvatar}>
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div style={styles.userInfo}>
                      <div style={styles.userName}>{user.name}</div>
                      <div style={styles.userEmail}>{user.email}</div>
                    </div>
                    <span style={{
                      ...styles.roleBadge,
                      color: roleConfig.color,
                      backgroundColor: roleConfig.bg,
                      border: `1px solid ${roleConfig.border}`
                    }}>
                      {user.role}
                    </span>
                    <div style={styles.userDate}>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                    <button
                      style={styles.deleteBtn}
                      onClick={() => handleDeleteUser(user._id)}
                    >
                      Delete
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  page: {
    background: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 50%, #f0f0f0 100%)',
    minHeight: '100vh'
  },
  container: { maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' },
  pageHeader: { marginBottom: '28px' },
  pageTitle: { fontSize: '26px', fontWeight: '700', color: '#2d2d2d', marginBottom: '4px' },
  pageSubtitle: { color: '#999', fontSize: '14px' },
  tabBar: { display: 'flex', gap: '8px', marginBottom: '24px' },
  tabBtn: {
    padding: '10px 24px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600'
  },
  error: {
    backgroundColor: '#fff5f5',
    color: '#dc2626',
    padding: '12px 16px',
    borderRadius: '10px',
    marginBottom: '20px',
    borderLeft: '3px solid #dc2626'
  },
  loadingBox: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', padding: '60px', gap: '16px'
  },
  spinner: {
    width: '36px', height: '36px',
    border: '3px solid #e0e0e0',
    borderTop: '3px solid #4A4A4A',
    borderRadius: '50%'
  },
  loadingText: { color: '#999', fontSize: '14px' },
  analyticsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: '16px',
    marginBottom: '24px'
  },
  analyticsCard: {
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid rgba(0,0,0,0.06)',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: '8px'
  },
  analyticsIcon: { fontSize: '24px' },
  analyticsValue: { fontSize: '36px', fontWeight: '700' },
  analyticsLabel: { fontSize: '12px', color: '#888', fontWeight: '500', textAlign: 'center' },
  chartCard: {
    backgroundColor: 'white',
    borderRadius: '14px',
    padding: '28px',
    boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
    border: '1px solid #e8e8e8'
  },
  chartTitle: { fontSize: '16px', fontWeight: '600', color: '#2d2d2d', marginBottom: '20px' },
  chartBars: { display: 'flex', flexDirection: 'column', gap: '16px' },
  barItem: { display: 'flex', alignItems: 'center', gap: '16px' },
  barLabel: { width: '80px', fontSize: '13px', color: '#666', fontWeight: '500' },
  barTrack: {
    flex: 1, height: '10px',
    background: 'linear-gradient(135deg, #f0f0f0, #e8e8e8)',
    borderRadius: '5px', overflow: 'hidden'
  },
  barFill: { height: '100%', borderRadius: '5px', transition: 'width 0.5s ease' },
  barValue: { width: '30px', fontSize: '14px', fontWeight: '700', textAlign: 'right' },
  usersCard: {
    backgroundColor: 'white',
    borderRadius: '14px',
    boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
    border: '1px solid #e8e8e8',
    overflow: 'hidden'
  },
  usersHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '2px solid #f5f5f5',
    background: 'linear-gradient(135deg, #f5f5f5, #ececec)'
  },
  usersTitle: { fontSize: '16px', fontWeight: '600', color: '#2d2d2d' },
  usersCount: {
    fontSize: '13px', color: '#666',
    background: 'linear-gradient(135deg, #e8e8e8, #ddd)',
    padding: '4px 12px', borderRadius: '20px',
    border: '1px solid #d0d0d0'
  },
  usersList: { display: 'flex', flexDirection: 'column' },
  userRow: {
    display: 'flex', alignItems: 'center', gap: '16px',
    padding: '16px 24px',
    borderBottom: '1px solid #f5f5f5',
    transition: 'background 0.2s'
  },
  userAvatar: {
    width: '38px', height: '38px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #4A4A4A, #2d2d2d)',
    color: 'white', fontSize: '15px', fontWeight: '700',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0
  },
  userInfo: { flex: 1 },
  userName: { fontSize: '14px', fontWeight: '600', color: '#2d2d2d' },
  userEmail: { fontSize: '12px', color: '#999', marginTop: '2px' },
  roleBadge: {
    padding: '4px 12px', borderRadius: '20px',
    fontSize: '11px', fontWeight: '700'
  },
  userDate: { fontSize: '12px', color: '#999', width: '90px', textAlign: 'right' },
  deleteBtn: {
    background: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
    color: '#dc2626',
    border: '1px solid #fecaca',
    padding: '6px 14px', borderRadius: '6px',
    cursor: 'pointer', fontSize: '12px', fontWeight: '600'
  }
};

export default AdminDashboard;