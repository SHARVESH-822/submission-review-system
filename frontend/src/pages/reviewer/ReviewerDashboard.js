import React, { useState, useEffect } from 'react';
import { getAllSubmissions, reviewSubmission } from '../../services/api';
import Navbar from '../../components/Navbar';
import UserInfoCard from '../../components/UserInfoCard';

const ReviewerDashboard = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewNote, setReviewNote] = useState({});
  const [actionLoading, setActionLoading] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const res = await getAllSubmissions();
      setSubmissions(res.data.data.submissions);
    } catch (err) {
      setError('Failed to fetch submissions.');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id, status) => {
    setActionLoading(id + status);
    try {
      await reviewSubmission(id, {
        status,
        reviewNote: reviewNote[id] || ''
      });
      await fetchSubmissions();
      setReviewNote((prev) => ({ ...prev, [id]: '' }));
      setSelectedSubmission(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Review action failed.');
    } finally {
      setActionLoading('');
    }
  };

  const getStatusConfig = (status) => {
    if (status === 'APPROVED') return { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', label: 'Approved' };
    if (status === 'REJECTED') return { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', label: 'Rejected' };
    return { color: '#d97706', bg: '#fffbeb', border: '#fde68a', label: 'Pending' };
  };

  const filteredSubmissions = submissions.filter((s) =>
    filter === 'ALL' ? true : s.status === filter
  );

  const stats = [
    { label: 'Total Queue', value: submissions.length, from: '#ffffff', to: '#e0f2fe', color: '#0ea5e9' },
    { label: 'Pending Reviews', value: submissions.filter(s => s.status === 'PENDING').length, from: '#fffbeb', to: '#fef3c7', color: '#d97706' },
    { label: 'Approved', value: submissions.filter(s => s.status === 'APPROVED').length, from: '#f0fdf4', to: '#dcfce7', color: '#16a34a' },
    { label: 'Rejected', value: submissions.filter(s => s.status === 'REJECTED').length, from: '#fef2f2', to: '#fee2e2', color: '#dc2626' }
  ];

  const renderStatusBadge = (status) => {
    const statusConfig = getStatusConfig(status);
    return (
      <span style={{
        ...styles.statusBadge,
        color: statusConfig.color,
        backgroundColor: statusConfig.bg,
        border: `1px solid ${statusConfig.border}`
      }}>
        {statusConfig.label}
      </span>
    );
  };

  return (
    <div style={styles.page}>
      <Navbar />

      {selectedSubmission && (
        <div style={styles.modalOverlay} onClick={() => setSelectedSubmission(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div>
                <div style={styles.modalUniqueId}># {selectedSubmission.uniqueId}</div>
                <h2 style={styles.modalTitle}>{selectedSubmission.title}</h2>
                <p style={styles.modalSubtitle}>
                  Submitted by {selectedSubmission.contributor?.name || 'Contributor'}
                </p>
              </div>
              <button style={styles.modalClose} onClick={() => setSelectedSubmission(null)}>x</button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.detailGrid}>
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Status</span>
                  {renderStatusBadge(selectedSubmission.status)}
                </div>
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Resubmissions</span>
                  <span style={styles.detailValue}>{selectedSubmission.resubmissionCount}/2</span>
                </div>
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Submitted On</span>
                  <span style={styles.detailValue}>
                    {new Date(selectedSubmission.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </span>
                </div>
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Contributor Email</span>
                  <span style={styles.detailValue}>{selectedSubmission.contributor?.email}</span>
                </div>
              </div>

              {selectedSubmission.description && (
                <div style={styles.modalSection}>
                  <h3 style={styles.modalSectionTitle}>Submission Details</h3>
                  <p style={styles.descriptionText}>{selectedSubmission.description}</p>
                </div>
              )}

              {selectedSubmission.fileName && (
                <div style={styles.filePreviewBox}>
                  <div>
                    <div style={styles.filePreviewName}>{selectedSubmission.fileName}</div>
                    <div style={styles.filePreviewType}>
                      {selectedSubmission.fileName.endsWith('.pdf') ? 'PDF document' : 'Word document'}
                    </div>
                  </div>
                  {selectedSubmission.fileUrl && (
                    <button
                      style={styles.previewButton}
                      onClick={() => window.open(
                        `https://docs.google.com/viewer?url=${encodeURIComponent(selectedSubmission.fileUrl)}&embedded=false`,
                        '_blank'
                      )}
                    >
                      Preview File
                    </button>
                  )}
                </div>
              )}

              {selectedSubmission.reviewNote && (
                <div style={styles.prevNoteBox}>
                  <span style={styles.reviewNoteLabel}>Previous Review Note: </span>
                  {selectedSubmission.reviewNote}
                </div>
              )}

              {selectedSubmission.status === 'PENDING' && (
                <div style={styles.modalSection}>
                  <h3 style={styles.modalSectionTitle}>Review Decision</h3>
                  <input
                    style={styles.noteInput}
                    type='text'
                    placeholder='Add review note (optional)...'
                    value={reviewNote[selectedSubmission._id] || ''}
                    onChange={(e) =>
                      setReviewNote((prev) => ({
                        ...prev,
                        [selectedSubmission._id]: e.target.value
                      }))
                    }
                  />
                  <div style={styles.modalActions}>
                    <button
                      style={styles.approveButton}
                      disabled={actionLoading === selectedSubmission._id + 'APPROVED'}
                      onClick={() => handleReview(selectedSubmission._id, 'APPROVED')}
                    >
                      {actionLoading === selectedSubmission._id + 'APPROVED' ? 'Processing...' : 'Approve Submission'}
                    </button>
                    <button
                      style={styles.rejectButton}
                      disabled={actionLoading === selectedSubmission._id + 'REJECTED'}
                      onClick={() => handleReview(selectedSubmission._id, 'REJECTED')}
                    >
                      {actionLoading === selectedSubmission._id + 'REJECTED' ? 'Processing...' : 'Reject Submission'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div style={styles.container}>
        <UserInfoCard />
        <div style={styles.pageHeader}>
          <div>
            <div style={styles.eyebrow}>REVIEWER WORKSPACE</div>
            <h1 style={styles.pageTitle}>Review Dashboard</h1>
            <p style={styles.pageSubtitle}>
              Evaluate pending entries, inspect files, and record review decisions.
            </p>
          </div>
        </div>

        <div style={styles.statsGrid}>
          {stats.map((stat, i) => (
            <div key={i} style={{
              ...styles.statCard,
              background: `linear-gradient(135deg, ${stat.from}, ${stat.to})`
            }}>
              <div style={{ ...styles.statValue, color: stat.color }}>{stat.value}</div>
              <div style={styles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>

        <div style={styles.filterBar}>
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((f) => (
            <button
              key={f}
              style={{
                ...styles.filterBtn,
                ...(filter === f ? styles.filterBtnActive : {})
              }}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        {error && <div style={styles.error}>{error}</div>}

        {loading ? (
          <div style={styles.loadingBox}>
            <div style={styles.spinner} />
            <p style={styles.loadingText}>Loading submissions...</p>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div style={styles.emptyBox}>
            <div style={styles.emptyIcon}>REV</div>
            <h3 style={styles.emptyTitle}>No submissions found</h3>
            <p style={styles.emptyText}>No submissions match the selected filter.</p>
          </div>
        ) : (
          <div style={styles.cardGrid}>
            {filteredSubmissions.map((sub) => (
              <div key={sub._id} style={styles.submissionCard}>
                <div style={styles.cardTop}>
                  <div style={styles.cardTopLeft}>
                    <div style={styles.uniqueIdBadge}># {sub.uniqueId}</div>
                    <h3 style={styles.cardTitle}>{sub.title}</h3>
                    <div style={styles.contributorRow}>
                      <div style={styles.avatarSmall}>
                        {sub.contributor?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={styles.contributorName}>{sub.contributor?.name}</div>
                        <div style={styles.contributorEmail}>{sub.contributor?.email}</div>
                      </div>
                    </div>
                  </div>
                  {renderStatusBadge(sub.status)}
                </div>

                <div style={styles.cardMeta}>
                  <div style={styles.metaChip}>Submitted: {new Date(sub.createdAt).toLocaleDateString()}</div>
                  <div style={styles.metaChip}>Resubmissions: {sub.resubmissionCount}/2</div>
                  {sub.fileName && <div style={styles.metaChip}>File: {sub.fileName}</div>}
                </div>

                <button
                  style={styles.viewButton}
                  onClick={() => setSelectedSubmission(sub)}
                >
                  View Details & Review
                </button>
              </div>
            ))}
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
    background: 'linear-gradient(135deg, #24115f 0%, #4c1d95 56%, #7c3aed 100%)',
    boxShadow: '0 20px 44px rgba(76,29,149,0.16)',
    border: '1px solid rgba(255,255,255,0.16)'
  },
  eyebrow: { color: '#ddd6fe', fontSize: '12px', fontWeight: '800', letterSpacing: '1px', marginBottom: '8px' },
  pageTitle: { fontSize: '32px', fontWeight: '800', color: 'white', marginBottom: '6px', letterSpacing: 0 },
  pageSubtitle: { color: '#ede9fe', fontSize: '14px', maxWidth: '640px', lineHeight: 1.6 },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
    gap: '16px',
    marginBottom: '20px'
  },
  statCard: {
    padding: '20px 22px',
    borderRadius: '12px',
    border: '1px solid #dbe5ef',
    boxShadow: '0 12px 28px rgba(15,42,67,0.07)'
  },
  statValue: { fontSize: '34px', fontWeight: '800', marginBottom: '4px' },
  statLabel: { fontSize: '13px', color: '#475569', fontWeight: '800' },
  filterBar: {
    display: 'flex',
    gap: '8px',
    marginBottom: '24px',
    flexWrap: 'wrap',
    padding: '8px',
    backgroundColor: 'white',
    border: '1px solid #dbe5ef',
    borderRadius: '12px',
    boxShadow: '0 10px 24px rgba(15,42,67,0.06)'
  },
  filterBtn: {
    padding: '9px 18px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '800',
    border: '1px solid transparent',
    color: '#475569',
    backgroundColor: '#f8fafc'
  },
  filterBtnActive: {
    backgroundColor: '#4c1d95',
    color: 'white',
    border: '1px solid #4c1d95'
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
  spinner: { width: '36px', height: '36px', border: '3px solid #dbe5ef', borderTop: '3px solid #7c3aed', borderRadius: '50%' },
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
    backgroundColor: '#ede9fe',
    color: '#6d28d9',
    fontSize: '16px',
    fontWeight: '900',
    marginBottom: '16px'
  },
  emptyTitle: { fontSize: '20px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' },
  emptyText: { color: '#64748b', fontSize: '14px' },
  cardGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: '20px' },
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
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' },
  cardTopLeft: { flex: 1 },
  uniqueIdBadge: {
    display: 'inline-block',
    fontSize: '11px',
    fontWeight: '800',
    color: '#6d28d9',
    backgroundColor: '#ede9fe',
    padding: '3px 10px',
    borderRadius: '20px',
    marginBottom: '8px',
    letterSpacing: '0.5px',
    border: '1px solid #ddd6fe'
  },
  cardTitle: { fontSize: '17px', fontWeight: '800', color: '#0f172a', marginBottom: '10px' },
  contributorRow: { display: 'flex', alignItems: 'center', gap: '10px' },
  avatarSmall: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #4c1d95, #7c3aed)',
    color: 'white',
    fontSize: '13px',
    fontWeight: '800',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  contributorName: { fontSize: '13px', fontWeight: '800', color: '#0f172a' },
  contributorEmail: { fontSize: '12px', color: '#64748b', marginTop: '2px' },
  statusBadge: { padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '800', whiteSpace: 'nowrap' },
  cardMeta: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  metaChip: { fontSize: '12px', color: '#475569', background: '#f8fafc', padding: '5px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' },
  viewButton: {
    width: '100%',
    padding: '12px',
    background: 'linear-gradient(135deg, #4c1d95, #7c3aed)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '800'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15,23,42,0.56)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px'
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '680px',
    maxHeight: '86vh',
    overflowY: 'auto',
    boxShadow: '0 24px 70px rgba(15,23,42,0.24)',
    border: '1px solid #dbe5ef'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '24px 28px',
    borderBottom: '1px solid #e2e8f0',
    background: 'linear-gradient(135deg, #ffffff, #f8fafc)'
  },
  modalUniqueId: { display: 'inline-block', fontSize: '11px', fontWeight: '800', color: '#6d28d9', backgroundColor: '#ede9fe', padding: '4px 10px', borderRadius: '999px', marginBottom: '8px' },
  modalTitle: { fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: 0 },
  modalSubtitle: { margin: '6px 0 0', color: '#64748b', fontSize: '13px' },
  modalClose: {
    background: '#f1f5f9',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    width: '34px',
    height: '34px',
    cursor: 'pointer',
    fontSize: '16px',
    color: '#64748b'
  },
  modalBody: { padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '20px' },
  detailGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '12px' },
  detailItem: { background: '#f8fafc', padding: '14px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '6px' },
  detailLabel: { fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' },
  detailValue: { fontSize: '14px', fontWeight: '700', color: '#0f172a' },
  modalSection: { display: 'flex', flexDirection: 'column', gap: '12px' },
  modalSectionTitle: { fontSize: '14px', fontWeight: '800', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px' },
  descriptionText: { fontSize: '14px', color: '#475569', lineHeight: '1.7', backgroundColor: '#f8fafc', padding: '14px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' },
  filePreviewBox: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' },
  filePreviewName: { fontSize: '14px', fontWeight: '800', color: '#0f172a' },
  filePreviewType: { fontSize: '12px', color: '#64748b', marginTop: '2px' },
  previewButton: { background: '#4c1d95', color: 'white', border: 'none', padding: '9px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '800' },
  prevNoteBox: { background: '#f8fafc', padding: '14px 16px', borderRadius: '10px', fontSize: '14px', color: '#475569', borderLeft: '3px solid #7c3aed' },
  reviewNoteLabel: { fontWeight: '800', color: '#4c1d95' },
  noteInput: { width: '100%', padding: '12px 16px', border: '1.5px solid #dbe5ef', borderRadius: '8px', fontSize: '14px', color: '#0f172a', outline: 'none', boxSizing: 'border-box', backgroundColor: '#f8fafc' },
  modalActions: { display: 'flex', gap: '12px', marginTop: '4px' },
  approveButton: { flex: 1, padding: '12px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '800' },
  rejectButton: { flex: 1, padding: '12px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '800' }
};

export default ReviewerDashboard;
