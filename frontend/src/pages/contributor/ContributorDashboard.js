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
    if (status === 'APPROVED') return { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', label: 'Approved' };
    if (status === 'REJECTED') return { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', label: 'Rejected' };
    return { color: '#d97706', bg: '#fffbeb', border: '#fde68a', label: 'Pending' };
  };

  const stats = [
    { label: 'Total Submissions', value: submissions.length, color: '#2563eb', from: '#ffffff', to: '#dbeafe' },
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
            <div style={styles.eyebrow}>CONTRIBUTOR WORKSPACE</div>
            <h1 style={styles.pageTitle}>My Submissions</h1>
            <p style={styles.pageSubtitle}>
              Track submissions, review notes, and resubmission limits from one dashboard.
            </p>
          </div>
          <button
            style={styles.newButton}
            onClick={() => navigate('/contributor/submit')}
          >
            New Submission
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
            <div style={styles.emptyIcon}>SUB</div>
            <h3 style={styles.emptyTitle}>No submissions yet</h3>
            <p style={styles.emptyText}>Submit your first entry to get started.</p>
            <button
              style={styles.emptyButton}
              onClick={() => navigate('/contributor/submit')}
            >
              Create First Submission
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
                        File: {sub.fileName}
                      </div>
                    )}
                    <div style={styles.metaChip}>
                      Resubmissions: {sub.resubmissionCount}/2
                    </div>
                    <div style={styles.metaChip}>
                      Submitted: {new Date(sub.createdAt).toLocaleDateString()}
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
                      Resubmit Entry
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
    background: '#eef3f8',
    minHeight: '100vh'
  },
  container: { maxWidth: '1280px', margin: '0 auto', padding: '28px 24px' },
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '24px',
    marginBottom: '24px',
    padding: '28px',
    borderRadius: '14px',
    background: 'linear-gradient(135deg, #0f2a43 0%, #164e8b 60%, #2563eb 100%)',
    boxShadow: '0 20px 44px rgba(15,42,67,0.18)',
    border: '1px solid rgba(255,255,255,0.16)'
  },
  eyebrow: {
    color: '#bfdbfe',
    fontSize: '12px',
    fontWeight: '800',
    letterSpacing: '1px',
    marginBottom: '8px'
  },
  pageTitle: {
    fontSize: '32px',
    fontWeight: '800',
    color: 'white',
    marginBottom: '6px',
    letterSpacing: 0
  },
  pageSubtitle: { color: '#dbeafe', fontSize: '14px', maxWidth: '620px', lineHeight: 1.6 },
  newButton: {
    background: '#ffffff',
    color: '#1d4ed8',
    border: 'none',
    padding: '13px 22px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '800',
    boxShadow: '0 12px 24px rgba(15,42,67,0.18)'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
    gap: '16px',
    marginBottom: '24px'
  },
  statCard: {
    padding: '20px 22px',
    borderRadius: '12px',
    border: '1px solid #dbe5ef',
    boxShadow: '0 12px 28px rgba(15,42,67,0.07)'
  },
  statValue: { fontSize: '34px', fontWeight: '800', marginBottom: '4px' },
  statLabel: { fontSize: '13px', color: '#475569', fontWeight: '800' },
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
    border: '3px solid #dbe5ef',
    borderTop: '3px solid #2563eb',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  loadingText: { color: '#64748b', fontSize: '14px' },
  emptyBox: {
    backgroundColor: 'white',
    borderRadius: '14px',
    padding: '60px',
    textAlign: 'center',
    boxShadow: '0 18px 38px rgba(15,42,67,0.08)',
    border: '1px solid #dbe5ef'
  },
  emptyIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '58px',
    height: '58px',
    borderRadius: '16px',
    backgroundColor: '#dbeafe',
    color: '#1d4ed8',
    fontSize: '16px',
    fontWeight: '900',
    marginBottom: '16px'
  },
  emptyTitle: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: '8px'
  },
  emptyText: { color: '#64748b', fontSize: '14px', marginBottom: '24px' },
  emptyButton: {
    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '800'
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '20px'
  },
  submissionCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 16px 34px rgba(15,42,67,0.08)',
    border: '1px solid #dbe5ef',
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
    fontWeight: '800',
    color: '#1d4ed8',
    backgroundColor: '#dbeafe',
    padding: '3px 10px',
    borderRadius: '20px',
    marginBottom: '8px',
    letterSpacing: '0.5px',
    border: '1px solid #bfdbfe'
  },
  cardTitle: { fontSize: '17px', fontWeight: '800', color: '#0f172a' },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '800',
    whiteSpace: 'nowrap'
  },
  cardDesc: { fontSize: '14px', color: '#475569', lineHeight: '1.6' },
  cardDescEmpty: { fontSize: '13px', color: '#94a3b8', fontStyle: 'italic' },
  cardMeta: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  metaChip: {
    fontSize: '12px',
    color: '#475569',
    background: '#f8fafc',
    padding: '5px 10px',
    borderRadius: '6px',
    border: '1px solid #e2e8f0'
  },
  reviewNote: {
    background: '#f8fafc',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#475569',
    borderLeft: '3px solid #2563eb'
  },
  reviewNoteLabel: { fontWeight: '800', color: '#0f2a43' },
  resubmitButton: {
    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
    color: 'white',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '800',
    alignSelf: 'flex-start'
  }
};

export default ContributorDashboard;
