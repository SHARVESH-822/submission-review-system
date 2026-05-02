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
    if (status === 'APPROVED') return { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', label: '✓ Approved' };
    if (status === 'REJECTED') return { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', label: '✗ Rejected' };
    return { color: '#d97706', bg: '#fffbeb', border: '#fde68a', label: '⏳ Pending' };
  };

  const filteredSubmissions = submissions.filter((s) =>
    filter === 'ALL' ? true : s.status === filter
  );

  const stats = [
    { label: 'Total', value: submissions.length, from: '#f5f5f5', to: '#e8e8e8', color: '#4A4A4A' },
    { label: 'Pending', value: submissions.filter(s => s.status === 'PENDING').length, from: '#fffbeb', to: '#fef3c7', color: '#d97706' },
    { label: 'Approved', value: submissions.filter(s => s.status === 'APPROVED').length, from: '#f0fdf4', to: '#dcfce7', color: '#16a34a' },
    { label: 'Rejected', value: submissions.filter(s => s.status === 'REJECTED').length, from: '#fef2f2', to: '#fee2e2', color: '#dc2626' }
  ];

  return (
    <div style={styles.page}>
      <Navbar />

      {/* Detail Modal */}
      {selectedSubmission && (
        <div style={styles.modalOverlay} onClick={() => setSelectedSubmission(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div>
                <div style={styles.modalUniqueId}># {selectedSubmission.uniqueId}</div>
                <h2 style={styles.modalTitle}>{selectedSubmission.title}</h2>
              </div>
              <button style={styles.modalClose} onClick={() => setSelectedSubmission(null)}>✕</button>
            </div>

            <div style={styles.modalBody}>

              {/* Contributor Info */}
              <div style={styles.modalSection}>
                <h3 style={styles.modalSectionTitle}>👤 Contributor Details</h3>
                <div style={styles.contributorCard}>
                  <div style={styles.avatarLarge}>
                    {selectedSubmission.contributor?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div style={styles.contributorDetails}>
                    <div style={styles.contributorName}>
                      {selectedSubmission.contributor?.name}
                    </div>
                    <div style={styles.contributorEmail}>
                      {selectedSubmission.contributor?.email}
                    </div>
                    <div style={styles.contributorMeta}>
                      <span style={styles.metaChip}>
                        🎭 {selectedSubmission.contributor?.role}
                      </span>
                      <span style={styles.metaChip}>
                        📅 Submitted: {new Date(selectedSubmission.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submission Info */}
              <div style={styles.modalSection}>
                <h3 style={styles.modalSectionTitle}>📄 Submission Details</h3>
                <div style={styles.detailGrid}>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Unique ID</span>
                    <span style={styles.detailValue}>{selectedSubmission.uniqueId}</span>
                  </div>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Status</span>
                    <span style={{
                      ...styles.statusBadge,
                      color: getStatusConfig(selectedSubmission.status).color,
                      backgroundColor: getStatusConfig(selectedSubmission.status).bg,
                      border: `1px solid ${getStatusConfig(selectedSubmission.status).border}`
                    }}>
                      {getStatusConfig(selectedSubmission.status).label}
                    </span>
                  </div>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Resubmissions</span>
                    <span style={styles.detailValue}>{selectedSubmission.resubmissionCount}/2</span>
                  </div>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Submitted On</span>
                    <span style={styles.detailValue}>
                      {new Date(selectedSubmission.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
                {selectedSubmission.description && (
                  <div style={styles.descriptionBox}>
                    <div style={styles.detailLabel}>Description</div>
                    <p style={styles.descriptionText}>{selectedSubmission.description}</p>
                  </div>
                )}
              </div>

              {/* File Preview */}
              {selectedSubmission.fileName && (
                <div style={styles.modalSection}>
                  <h3 style={styles.modalSectionTitle}>📎 Attached File</h3>
                  <div style={styles.filePreviewBox}>
                    <div style={styles.filePreviewIcon}>
                      {selectedSubmission.fileName.endsWith('.pdf') ? '📄' : '📝'}
                    </div>
                    <div style={styles.filePreviewInfo}>
                      <div style={styles.filePreviewName}>{selectedSubmission.fileName}</div>
                      <div style={styles.filePreviewType}>
                        {selectedSubmission.fileName.endsWith('.pdf') ? 'PDF Document' : 'Word Document'}
                      </div>
                    </div>
                    {selectedSubmission.fileUrl && (
                      <a
                        href={selectedSubmission.fileUrl.replace('/raw/upload/', '/image/upload/').replace('.pdf', '.pdf') + '#toolbar=1'}
                        target='_blank'
                        rel='noreferrer'
                        style={styles.previewButton}
                        onClick={(e) => {
                          e.preventDefault();
                          window.open(
                            `https://docs.google.com/viewer?url=${encodeURIComponent(selectedSubmission.fileUrl)}&embedded=false`,
                            '_blank'
                          );
                        }}
                      >
                        👁 Preview
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Previous Review Note */}
              {selectedSubmission.reviewNote && (
                <div style={styles.modalSection}>
                  <h3 style={styles.modalSectionTitle}>💬 Previous Review Note</h3>
                  <div style={styles.prevNoteBox}>{selectedSubmission.reviewNote}</div>
                </div>
              )}

              {/* Review Action */}
              {selectedSubmission.status === 'PENDING' && (
                <div style={styles.modalSection}>
                  <h3 style={styles.modalSectionTitle}>✍️ Add Review</h3>
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
                      {actionLoading === selectedSubmission._id + 'APPROVED' ? 'Processing...' : '✓ Approve Submission'}
                    </button>
                    <button
                      style={styles.rejectButton}
                      disabled={actionLoading === selectedSubmission._id + 'REJECTED'}
                      onClick={() => handleReview(selectedSubmission._id, 'REJECTED')}
                    >
                      {actionLoading === selectedSubmission._id + 'REJECTED' ? 'Processing...' : '✗ Reject Submission'}
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
            <h1 style={styles.pageTitle}>REVIEW DASHBOARD</h1>
            <p style={styles.pageSubtitle}>EVALUATE & MANAGE ALL SUBMITTED ENTRIES</p>
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
                background: filter === f ? 'linear-gradient(135deg, #4A4A4A, #2d2d2d)' : 'white',
                color: filter === f ? 'white' : '#666',
                border: filter === f ? 'none' : '1.5px solid #e0e0e0'
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
            <div style={styles.emptyIcon}>📋</div>
            <h3 style={styles.emptyTitle}>No submissions found</h3>
            <p style={styles.emptyText}>No submissions match the selected filter.</p>
          </div>
        ) : (
          <div style={styles.cardGrid}>
            {filteredSubmissions.map((sub) => {
              const statusConfig = getStatusConfig(sub.status);
              return (
                <div key={sub._id} style={styles.submissionCard}>
                  <div style={styles.cardTop}>
                    <div style={styles.cardTopLeft}>
                      <div style={styles.uniqueIdBadge}># {sub.uniqueId}</div>
                      <h3 style={styles.cardTitle}>{sub.title}</h3>
                      <div style={styles.contributorRow}>
                        <div style={styles.avatarSmall}>
                          {sub.contributor?.name?.charAt(0).toUpperCase()}
                        </div>
                        <span style={styles.contributorName}>{sub.contributor?.name}</span>
                        <span style={styles.contributorEmail}>{sub.contributor?.email}</span>
                      </div>
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

                  <div style={styles.cardMeta}>
                    <div style={styles.metaChip}>📅 {new Date(sub.createdAt).toLocaleDateString()}</div>
                    <div style={styles.metaChip}>🔄 {sub.resubmissionCount}/2</div>
                    {sub.fileName && <div style={styles.metaChip}>📎 {sub.fileName}</div>}
                  </div>

                  <button
                    style={styles.viewButton}
                    onClick={() => setSelectedSubmission(sub)}
                  >
                    👁 View Details & Review
                  </button>
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
  pageHeader: { marginBottom: '28px' },
  pageTitle: { fontSize: '26px', fontWeight: '700', color: '#2d2d2d', marginBottom: '4px' },
  pageSubtitle: { color: '#999', fontSize: '14px' },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
    marginBottom: '24px'
  },
  statCard: {
    padding: '20px 24px',
    borderRadius: '12px',
    border: '1px solid rgba(0,0,0,0.06)'
  },
  statValue: { fontSize: '32px', fontWeight: '700', marginBottom: '4px' },
  statLabel: { fontSize: '13px', color: '#888', fontWeight: '500' },
  filterBar: { display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' },
  filterBtn: {
    padding: '8px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
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
  emptyBox: {
    backgroundColor: 'white', borderRadius: '16px',
    padding: '60px', textAlign: 'center',
    boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
    border: '1px solid #e8e8e8'
  },
  emptyIcon: { fontSize: '48px', marginBottom: '16px' },
  emptyTitle: { fontSize: '20px', fontWeight: '600', color: '#2d2d2d', marginBottom: '8px' },
  emptyText: { color: '#999', fontSize: '14px' },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
    gap: '20px'
  },
  submissionCard: {
    backgroundColor: 'white',
    borderRadius: '14px',
    padding: '24px',
    boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
    border: '1px solid #e8e8e8',
    display: 'flex', flexDirection: 'column', gap: '14px'
  },
  cardTop: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', gap: '12px'
  },
  cardTopLeft: { flex: 1 },
  uniqueIdBadge: {
    display: 'inline-block',
    fontSize: '11px', fontWeight: '700',
    color: '#4A4A4A',
    background: 'linear-gradient(135deg, #f0f0f0, #e8e8e8)',
    padding: '3px 10px', borderRadius: '20px',
    marginBottom: '8px', letterSpacing: '0.5px',
    border: '1px solid #e0e0e0'
  },
  cardTitle: { fontSize: '16px', fontWeight: '600', color: '#2d2d2d', marginBottom: '8px' },
  contributorRow: { display: 'flex', alignItems: 'center', gap: '8px' },
  avatarSmall: {
    width: '24px', height: '24px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #4A4A4A, #2d2d2d)',
    color: 'white', fontSize: '11px', fontWeight: '700',
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  },
  contributorName: { fontSize: '13px', fontWeight: '600', color: '#2d2d2d' },
  contributorEmail: { fontSize: '12px', color: '#999' },
  statusBadge: {
    padding: '4px 12px', borderRadius: '20px',
    fontSize: '12px', fontWeight: '600', whiteSpace: 'nowrap'
  },
  cardMeta: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  metaChip: {
    fontSize: '12px', color: '#666',
    background: 'linear-gradient(135deg, #f5f5f5, #ececec)',
    padding: '4px 10px', borderRadius: '6px',
    border: '1px solid #e0e0e0'
  },
  viewButton: {
    width: '100%',
    padding: '11px',
    background: 'linear-gradient(135deg, #4A4A4A, #2d2d2d)',
    color: 'white', border: 'none',
    borderRadius: '8px', cursor: 'pointer',
    fontSize: '13px', fontWeight: '600'
  },
  // Modal styles
  modalOverlay: {
    position: 'fixed', top: 0, left: 0,
    right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', zIndex: 1000,
    padding: '20px'
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '16px',
    width: '100%', maxWidth: '640px',
    maxHeight: '85vh', overflowY: 'auto',
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
  },
  modalHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '24px 28px',
    borderBottom: '2px solid #f5f5f5',
    position: 'sticky', top: 0,
    backgroundColor: 'white', zIndex: 1
  },
  modalUniqueId: {
    fontSize: '12px', fontWeight: '700',
    color: '#4A4A4A',
    background: 'linear-gradient(135deg, #f0f0f0, #e8e8e8)',
    display: 'inline-block',
    padding: '3px 10px', borderRadius: '20px',
    marginBottom: '8px', border: '1px solid #e0e0e0'
  },
  modalTitle: { fontSize: '20px', fontWeight: '700', color: '#2d2d2d' },
  modalClose: {
    background: 'linear-gradient(135deg, #f5f5f5, #e8e8e8)',
    border: '1px solid #e0e0e0',
    borderRadius: '8px', padding: '8px 12px',
    cursor: 'pointer', fontSize: '14px', color: '#666'
  },
  modalBody: { padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '24px' },
  modalSection: {
    display: 'flex', flexDirection: 'column', gap: '12px'
  },
  modalSectionTitle: {
    fontSize: '14px', fontWeight: '700',
    color: '#4A4A4A', textTransform: 'uppercase',
    letterSpacing: '0.5px',
    paddingBottom: '8px',
    borderBottom: '1px solid #f0f0f0'
  },
  contributorCard: {
    display: 'flex', alignItems: 'center', gap: '16px',
    background: 'linear-gradient(135deg, #f5f5f5, #ececec)',
    padding: '16px', borderRadius: '12px',
    border: '1px solid #e0e0e0'
  },
  avatarLarge: {
    width: '52px', height: '52px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #4A4A4A, #2d2d2d)',
    color: 'white', fontSize: '22px', fontWeight: '700',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0
  },
  contributorDetails: { flex: 1 },
  contributorMeta: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' },
  detailGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr',
    gap: '12px'
  },
  detailItem: {
    background: 'linear-gradient(135deg, #f5f5f5, #ececec)',
    padding: '12px 16px', borderRadius: '10px',
    border: '1px solid #e0e0e0',
    display: 'flex', flexDirection: 'column', gap: '4px'
  },
  detailLabel: {
    fontSize: '11px', fontWeight: '700',
    color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px'
  },
  detailValue: { fontSize: '14px', fontWeight: '600', color: '#2d2d2d' },
  descriptionBox: {
    background: 'linear-gradient(135deg, #f5f5f5, #ececec)',
    padding: '14px 16px', borderRadius: '10px',
    border: '1px solid #e0e0e0'
  },
  descriptionText: { fontSize: '14px', color: '#555', lineHeight: '1.6', marginTop: '6px' },
  filePreviewBox: {
    display: 'flex', alignItems: 'center', gap: '14px',
    background: 'linear-gradient(135deg, #f5f5f5, #ececec)',
    padding: '16px', borderRadius: '12px',
    border: '1px solid #e0e0e0'
  },
  filePreviewIcon: { fontSize: '32px' },
  filePreviewInfo: { flex: 1 },
  filePreviewName: { fontSize: '14px', fontWeight: '600', color: '#2d2d2d' },
  filePreviewType: { fontSize: '12px', color: '#999', marginTop: '2px' },
  previewButton: {
    background: 'linear-gradient(135deg, #4A4A4A, #2d2d2d)',
    color: 'white', padding: '8px 16px',
    borderRadius: '8px', fontSize: '13px',
    fontWeight: '600', textDecoration: 'none'
  },
  prevNoteBox: {
    background: 'linear-gradient(135deg, #f5f5f5, #ececec)',
    padding: '14px 16px', borderRadius: '10px',
    fontSize: '14px', color: '#555',
    borderLeft: '3px solid #888'
  },
  noteInput: {
    width: '100%', padding: '12px 16px',
    border: '1.5px solid #e0e0e0', borderRadius: '10px',
    fontSize: '14px', color: '#2d2d2d', outline: 'none',
    boxSizing: 'border-box', backgroundColor: '#fafafa'
  },
  modalActions: { display: 'flex', gap: '12px', marginTop: '4px' },
  approveButton: {
    flex: 1, padding: '12px',
    backgroundColor: '#16a34a',
    color: 'white', border: 'none',
    borderRadius: '10px', cursor: 'pointer',
    fontSize: '14px', fontWeight: '600'
  },
  rejectButton: {
    flex: 1, padding: '12px',
    backgroundColor: '#dc2626',
    color: 'white', border: 'none',
    borderRadius: '10px', cursor: 'pointer',
    fontSize: '14px', fontWeight: '600'
  }
};

export default ReviewerDashboard;