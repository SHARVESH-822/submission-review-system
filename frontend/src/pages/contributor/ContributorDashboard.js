import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMySubmissions } from '../../services/api';
import Navbar from '../../components/Navbar';
import UserInfoCard from '../../components/UserInfoCard';

const ContributorDashboard = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const res = await getMySubmissions();
      setSubmissions(res.data.data.submissions);
    } catch (err) {
      setError('Failed to fetch submissions.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    if (status === 'APPROVED') return { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', label: '✓ Approved' };
    if (status === 'REJECTED') return { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', label: '✗ Rejected' };
    return { color: '#d97706', bg: '#fffbeb', border: '#fde68a', label: '⏳ Pending' };
  };

  const stats = [
    { label: 'Total', value: submissions.length, color: '#4A4A4A', from: '#f5f5f5', to: '#e8e8e8' },
    { label: 'Approved', value: submissions.filter(s => s.status === 'APPROVED').length, color: '#16a34a', from: '#f0fdf4', to: '#dcfce7' },
    { label: 'Pending', value: submissions.filter(s => s.status === 'PENDING').length, color: '#d97706', from: '#fffbeb', to: '#fef3c7' },
    { label: 'Rejected', value: submissions.filter(s => s.status === 'REJECTED').length, color: '#dc2626', from: '#fef2f2', to: '#fee2e2' }
  ];

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.container}>
        <UserInfoCard />

        <div style={styles.pageHeader}>
          <div>
            <h1 style={styles.pageTitle}>My Submissions</h1>
            <p style={styles.pageSubtitle}>Track and manage all your submitted entries</p>
          </div>
          <button
            style={styles.newButton}
            onClick={() => navigate('/contributor/submit')}
          >
            + New Submission
          </button>
        </div>

        <div style={styles.statsGrid}>
          {stats.map((stat, i) => (
            <div
              key={i}
              style={{
                ...styles.statCard,
                background: `linear-gradient(135deg, ${stat.from}, ${stat.to})`
              }}
            >
              <div style={{ ...styles.statValue, color: stat.color }}>
                {stat.value}
              </div>
              <div style={styles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>

        {error && <div style={styles.error}>{error}</div>}

        {loading ? (
          <div style={styles.loadingBox}>
            <div style={styles.spinner} />
            <p style={styles.loadingText}>Loading submissions...</p>
          </div>
        ) : submissions.length === 0 ? (
          <div style={styles.emptyBox}>
            <div style={styles.emptyIcon}>📬</div>
            <h3 style={styles.emptyTitle}>No submissions yet</h3>
            <p style={styles.emptyText}>Submit your first entry to get started</p>
            <button
              style={styles.emptyButton}
              onClick={() => navigate('/contributor/submit')}
            >
              + Create First Submission
            </button>
          </div>
        ) : (
          <div style={styles.cardGrid}>
            {submissions.map((sub) => {
              const statusConfig = getStatusConfig(sub.status);
              return (
                <div key={sub._id} style={styles.submissionCard}>

                  <div style={styles.cardTop}>
                    <div style={styles.cardTopLeft}>
                      <div style={styles.uniqueIdBadge}>
                        # {sub.uniqueId}
                      </div>
                      <h3 style={styles.cardTitle}>{sub.title}</h3>
                    </div>
                    <span style={{
                      ...styles.statusBadge,
                      color: statusConfig.color,
                      backgroundColor: statusConfig.bg,
                      border: `1px solid ${statusConfig.border}`
                    }}>
                      {statusConfig.label}
                    </span>
                  </div>

                  {sub.description ? (
                    <p style={styles.cardDesc}>{sub.description}</p>
                  ) : (
                    <p style={styles.cardDescEmpty}>No description provided</p>
                  )}

                  <div style={styles.cardMeta}>
                    {sub.fileName && (
                      <div style={styles.metaChip}>
                        📎 {sub.fileName}
                      </div>
                    )}
                    <div style={styles.metaChip}>
                      🔄 Resubmissions: {sub.resubmissionCount}/2
                    </div>
                    <div style={styles.metaChip}>
                      📅 {new Date(sub.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  {sub.reviewNote && (
                    <div style={styles.reviewNote}>
                      <span style={styles.reviewNoteLabel}>Review Note: </span>
                      {sub.reviewNote}
                    </div>
                  )}

                  {sub.resubmissionCount < 2 && sub.status === 'REJECTED' && (
                    <button
                      style={styles.resubmitButton}
                      onClick={() => navigate(`/contributor/resubmit/${sub._id}`)}
                    >
                      🔄 Resubmit Entry
                    </button>
                  )}
                </div>
              );
            })}
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
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '28px'
  },
  pageTitle: {
    fontSize: '26px',
    fontWeight: '700',
    color: '#2d2d2d',
    marginBottom: '4px'
  },
  pageSubtitle: { color: '#999', fontSize: '14px' },
  newButton: {
    background: 'linear-gradient(135deg, #4A4A4A, #2d2d2d)',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
    marginBottom: '28px'
  },
  statCard: {
    padding: '20px 24px',
    borderRadius: '12px',
    border: '1px solid rgba(0,0,0,0.06)'
  },
  statValue: { fontSize: '32px', fontWeight: '700', marginBottom: '4px' },
  statLabel: { fontSize: '13px', color: '#888', fontWeight: '500' },
  error: {
    backgroundColor: '#fff5f5',
    color: '#dc2626',
    padding: '12px 16px',
    borderRadius: '10px',
    marginBottom: '20px',
    borderLeft: '3px solid #dc2626'
  },
  loadingBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '60px',
    gap: '16px'
  },
  spinner: {
    width: '36px',
    height: '36px',
    border: '3px solid #e0e0e0',
    borderTop: '3px solid #4A4A4A',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  loadingText: { color: '#999', fontSize: '14px' },
  emptyBox: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '60px',
    textAlign: 'center',
    boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
    border: '1px solid #e8e8e8'
  },
  emptyIcon: { fontSize: '48px', marginBottom: '16px' },
  emptyTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#2d2d2d',
    marginBottom: '8px'
  },
  emptyText: { color: '#999', fontSize: '14px', marginBottom: '24px' },
  emptyButton: {
    background: 'linear-gradient(135deg, #4A4A4A, #2d2d2d)',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600'
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: '20px'
  },
  submissionCard: {
    backgroundColor: 'white',
    borderRadius: '14px',
    padding: '24px',
    boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
    border: '1px solid #e8e8e8',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '12px'
  },
  cardTopLeft: { flex: 1 },
  uniqueIdBadge: {
    display: 'inline-block',
    fontSize: '11px',
    fontWeight: '700',
    color: '#4A4A4A',
    backgroundColor: '#f0f0f0',
    padding: '3px 10px',
    borderRadius: '20px',
    marginBottom: '8px',
    letterSpacing: '0.5px',
    border: '1px solid #e0e0e0'
  },
  cardTitle: { fontSize: '16px', fontWeight: '600', color: '#2d2d2d' },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    whiteSpace: 'nowrap'
  },
  cardDesc: { fontSize: '14px', color: '#666', lineHeight: '1.6' },
  cardDescEmpty: { fontSize: '13px', color: '#bbb', fontStyle: 'italic' },
  cardMeta: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  metaChip: {
    fontSize: '12px',
    color: '#666',
    background: 'linear-gradient(135deg, #f5f5f5, #ececec)',
    padding: '4px 10px',
    borderRadius: '6px',
    border: '1px solid #e0e0e0'
  },
  reviewNote: {
    background: 'linear-gradient(135deg, #f5f5f5, #ececec)',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#555',
    borderLeft: '3px solid #888'
  },
  reviewNoteLabel: { fontWeight: '600', color: '#4A4A4A' },
  resubmitButton: {
    background: 'linear-gradient(135deg, #4A4A4A, #2d2d2d)',
    color: 'white',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    alignSelf: 'flex-start'
  }
};

export default ContributorDashboard;