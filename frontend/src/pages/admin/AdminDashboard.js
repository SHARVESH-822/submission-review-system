import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import UserInfoCard from '../../components/UserInfoCard';
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
    if (role === 'CONTRIBUTOR') return { color: '#1d4ed8', bg: '#dbeafe', border: '#bfdbfe' };
    if (role === 'REVIEWER') return { color: '#6d28d9', bg: '#ede9fe', border: '#ddd6fe' };
    if (role === 'ADMIN') return { color: '#0369a1', bg: '#e0f2fe', border: '#bae6fd' };
    return { color: '#475569', bg: '#f1f5f9', border: '#e2e8f0' };
  };

  const analyticsCards = analytics ? [
    { label: 'Total Users', value: analytics.totalUsers, color: '#2563eb', from: '#ffffff', to: '#dbeafe' },
    { label: 'Contributors', value: analytics.totalContributors, color: '#1d4ed8', from: '#eff6ff', to: '#dbeafe' },
    { label: 'Reviewers', value: analytics.totalReviewers, color: '#7c3aed', from: '#faf5ff', to: '#ede9fe' },
    { label: 'Submissions', value: analytics.totalSubmissions, color: '#0ea5e9', from: '#f0f9ff', to: '#e0f2fe' },
    { label: 'Pending', value: analytics.pendingSubmissions, color: '#d97706', from: '#fffbeb', to: '#fef3c7' },
    { label: 'Approved', value: analytics.approvedSubmissions, color: '#16a34a', from: '#f0fdf4', to: '#dcfce7' },
    { label: 'Rejected', value: analytics.rejectedSubmissions, color: '#dc2626', from: '#fef2f2', to: '#fee2e2' }
  ] : [];

  const totalSubmissions = analytics?.totalSubmissions || 0;
  const overviewBars = analytics ? [
    { label: 'Pending', value: analytics.pendingSubmissions, color: '#d97706' },
    { label: 'Approved', value: analytics.approvedSubmissions, color: '#16a34a' },
    { label: 'Rejected', value: analytics.rejectedSubmissions, color: '#dc2626' }
  ] : [];

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.container}>
        <UserInfoCard />

        <div style={styles.pageHeader}>
          <div>
            <div style={styles.eyebrow}>ADMIN CONTROL CENTER</div>
            <h1 style={styles.pageTitle}>Admin Dashboard</h1>
            <p style={styles.pageSubtitle}>Monitor users, submissions, review status, and platform activity.</p>
          </div>
        </div>

        <div style={styles.tabBar}>
          {['analytics', 'users'].map((tab) => (
            <button
              key={tab}
              style={{
                ...styles.tabBtn,
                ...(activeTab === tab ? styles.tabBtnActive : {})
              }}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'analytics' ? 'Analytics' : 'Users'}
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
                  <div style={{ ...styles.analyticsValue, color: card.color }}>
                    {card.value}
                  </div>
                  <div style={styles.analyticsLabel}>{card.label}</div>
                </div>
              ))}
            </div>

            {analytics && (
              <div style={styles.overviewGrid}>
                <div style={styles.chartCard}>
                  <div style={styles.cardHeaderRow}>
                    <h3 style={styles.chartTitle}>Submission Overview</h3>
                    <span style={styles.cardCount}>{totalSubmissions} total</span>
                  </div>
                  <div style={styles.chartBars}>
                    {overviewBars.map((bar, i) => (
                      <div key={i} style={styles.barItem}>
                        <div style={styles.barLabel}>{bar.label}</div>
                        <div style={styles.barTrack}>
                          <div style={{
                            ...styles.barFill,
                            width: totalSubmissions > 0 ? `${(bar.value / totalSubmissions) * 100}%` : '0%',
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

                <div style={styles.activityCard}>
                  <h3 style={styles.chartTitle}>System Snapshot</h3>
                  <div style={styles.snapshotList}>
                    <div style={styles.snapshotRow}>
                      <span>Reviewer coverage</span>
                      <strong>{analytics.totalReviewers}</strong>
                    </div>
                    <div style={styles.snapshotRow}>
                      <span>Contributor base</span>
                      <strong>{analytics.totalContributors}</strong>
                    </div>
                    <div style={styles.snapshotRow}>
                      <span>Decision completion</span>
                      <strong>
                        {totalSubmissions > 0
                          ? Math.round(((analytics.approvedSubmissions + analytics.rejectedSubmissions) / totalSubmissions) * 100)
                          : 0}%
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={styles.usersCard}>
            <div style={styles.usersHeader}>
              <div>
                <h3 style={styles.usersTitle}>All Users</h3>
                <p style={styles.usersSubtitle}>Manage contributor, reviewer, and admin accounts.</p>
              </div>
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
  page: { background: '#eef3f8', minHeight: '100vh' },
  container: { maxWidth: '1280px', margin: '0 auto', padding: '28px 24px' },
  pageHeader: {
    marginBottom: '24px',
    padding: '28px',
    borderRadius: '14px',
    background: 'linear-gradient(135deg, #062033 0%, #075985 54%, #0ea5e9 100%)',
    boxShadow: '0 20px 44px rgba(14,165,233,0.16)',
    border: '1px solid rgba(255,255,255,0.16)'
  },
  eyebrow: { color: '#bae6fd', fontSize: '12px', fontWeight: '800', letterSpacing: '1px', marginBottom: '8px' },
  pageTitle: { fontSize: '32px', fontWeight: '800', color: 'white', marginBottom: '6px', letterSpacing: 0 },
  pageSubtitle: { color: '#e0f2fe', fontSize: '14px', maxWidth: '680px', lineHeight: 1.6 },
  tabBar: {
    display: 'inline-flex',
    gap: '8px',
    marginBottom: '24px',
    padding: '8px',
    backgroundColor: 'white',
    border: '1px solid #dbe5ef',
    borderRadius: '12px',
    boxShadow: '0 10px 24px rgba(15,42,67,0.06)'
  },
  tabBtn: {
    padding: '10px 24px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '800',
    backgroundColor: '#f8fafc',
    color: '#475569',
    border: '1px solid transparent'
  },
  tabBtnActive: {
    backgroundColor: '#075985',
    color: 'white',
    border: '1px solid #075985'
  },
  error: {
    backgroundColor: '#fff5f5',
    color: '#dc2626',
    padding: '12px 16px',
    borderRadius: '10px',
    marginBottom: '20px',
    borderLeft: '3px solid #dc2626'
  },
  loadingBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px', gap: '16px' },
  spinner: { width: '36px', height: '36px', border: '3px solid #dbe5ef', borderTop: '3px solid #0ea5e9', borderRadius: '50%' },
  loadingText: { color: '#64748b', fontSize: '14px' },
  analyticsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
    gap: '16px',
    marginBottom: '24px'
  },
  analyticsCard: {
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid #dbe5ef',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '6px',
    boxShadow: '0 12px 28px rgba(15,42,67,0.07)'
  },
  analyticsValue: { fontSize: '36px', fontWeight: '800' },
  analyticsLabel: { fontSize: '12px', color: '#475569', fontWeight: '800' },
  overviewGrid: { display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(280px, 1fr)', gap: '20px' },
  chartCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 16px 34px rgba(15,42,67,0.08)',
    border: '1px solid #dbe5ef'
  },
  activityCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 16px 34px rgba(15,42,67,0.08)',
    border: '1px solid #dbe5ef'
  },
  cardHeaderRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '14px', marginBottom: '20px' },
  chartTitle: { fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: 0 },
  cardCount: { color: '#0369a1', backgroundColor: '#e0f2fe', border: '1px solid #bae6fd', padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: '800' },
  chartBars: { display: 'flex', flexDirection: 'column', gap: '16px' },
  barItem: { display: 'flex', alignItems: 'center', gap: '16px' },
  barLabel: { width: '90px', fontSize: '13px', color: '#475569', fontWeight: '800' },
  barTrack: { flex: 1, height: '10px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: '999px', transition: 'width 0.5s ease' },
  barValue: { width: '34px', fontSize: '14px', fontWeight: '800', textAlign: 'right' },
  snapshotList: { display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '18px' },
  snapshotRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px', color: '#475569', fontSize: '13px' },
  usersCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 16px 34px rgba(15,42,67,0.08)',
    border: '1px solid #dbe5ef',
    overflow: 'hidden'
  },
  usersHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid #e2e8f0',
    background: 'linear-gradient(135deg, #ffffff, #f8fafc)'
  },
  usersTitle: { fontSize: '17px', fontWeight: '800', color: '#0f172a', margin: 0 },
  usersSubtitle: { color: '#64748b', fontSize: '13px', margin: '5px 0 0' },
  usersCount: { fontSize: '13px', color: '#0369a1', background: '#e0f2fe', padding: '5px 12px', borderRadius: '999px', border: '1px solid #bae6fd', fontWeight: '800' },
  usersList: { display: 'flex', flexDirection: 'column' },
  userRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px 24px',
    borderBottom: '1px solid #f1f5f9'
  },
  userAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #075985, #0ea5e9)',
    color: 'white',
    fontSize: '15px',
    fontWeight: '800',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  userInfo: { flex: 1 },
  userName: { fontSize: '14px', fontWeight: '800', color: '#0f172a' },
  userEmail: { fontSize: '12px', color: '#64748b', marginTop: '2px' },
  roleBadge: { padding: '5px 12px', borderRadius: '999px', fontSize: '11px', fontWeight: '800' },
  userDate: { fontSize: '12px', color: '#64748b', width: '92px', textAlign: 'right' },
  deleteBtn: {
    background: '#fff5f5',
    color: '#dc2626',
    border: '1px solid #fecaca',
    padding: '7px 14px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '800'
  }
};

export default AdminDashboard;
