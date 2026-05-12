import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createSubmission, resubmitEntry, getMySubmissions } from '../../services/api';
import Navbar from '../../components/Navbar';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];
const ALLOWED_EXTENSIONS = ['pdf', 'docx'];

const SubmissionForm = () => {
  const [formData, setFormData] = useState({
    uniqueId: '',
    title: '',
    description: ''
  });
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const isResubmit = Boolean(id);

  const fetchSubmission = async () => {
    try {
      const res = await getMySubmissions();
      const submission = res.data.data.submissions.find((s) => s._id === id);
      if (submission) {
        setFormData({
          uniqueId: submission.uniqueId,
          title: submission.title,
          description: submission.description || ''
        });
      }
    } catch (err) {
      setError('Failed to load submission.');
    }
  };

  useEffect(() => {
    if (isResubmit) fetchSubmission();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFileError('');
    setFile(null);
    if (!selected) return;
    const ext = selected.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setFileError('❌ Only PDF and DOCX files are allowed.');
      return;
    }
    if (!ALLOWED_TYPES.includes(selected.type)) {
      setFileError('❌ Invalid file type. Please upload PDF or DOCX only.');
      return;
    }
    if (selected.size > MAX_FILE_SIZE) {
      setFileError('❌ File size exceeds 10MB limit.');
      return;
    }
    setFile(selected);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFileChange({ target: { files: [dropped] } });
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.uniqueId.trim()) {
      setError('Unique ID is required.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const payload = new FormData();
      payload.append('uniqueId', formData.uniqueId);
      payload.append('title', formData.title);
      payload.append('description', formData.description);
      if (file) {
        payload.append('file', file);
      }
      if (isResubmit) {
        await resubmitEntry(id, payload);
        setSuccess('Resubmission successful!');
      } else {
        await createSubmission(payload);
        setSuccess('Submission created successfully!');
      }
      setTimeout(() => navigate('/contributor/dashboard'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.breadcrumb}>
          <span
            style={styles.breadcrumbLink}
            onClick={() => navigate('/contributor/dashboard')}
          >
            My Submissions
          </span>
          <span style={styles.breadcrumbSep}>›</span>
          <span style={styles.breadcrumbCurrent}>
            {isResubmit ? 'Resubmit Entry' : 'New Submission'}
          </span>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.cardIconBox}>
              {isResubmit ? '🔄' : '📝'}
            </div>
            <div>
              <h2 style={styles.cardTitle}>
                {isResubmit ? 'Resubmit Entry' : 'New Submission'}
              </h2>
              <p style={styles.cardSubtitle}>
                {isResubmit
                  ? 'Update your entry and resubmit for review'
                  : 'Fill in the details to submit your entry'}
              </p>
            </div>
          </div>

          {error && <div style={styles.error}>{error}</div>}
          {success && <div style={styles.success}>✓ {success}</div>}

          <form onSubmit={handleSubmit}>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Unique ID <span style={styles.required}>*</span>
              </label>
              <input
                style={styles.input}
                type='text'
                name='uniqueId'
                value={formData.uniqueId}
                onChange={handleChange}
                required
                placeholder='Enter a unique ID (e.g. PROJ-001)'
                disabled={isResubmit}
              />
              <div style={styles.fieldHint}>
                This ID must be unique across all submissions
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Title <span style={styles.required}>*</span>
              </label>
              <input
                style={styles.input}
                type='text'
                name='title'
                value={formData.title}
                onChange={handleChange}
                required
                placeholder='Enter a clear and descriptive title'
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Description{' '}
                <span style={styles.optional}>(Optional)</span>
              </label>
              <textarea
                style={styles.textarea}
                name='description'
                value={formData.description}
                onChange={handleChange}
                placeholder='Provide additional details about your submission (optional)...'
                rows={4}
              />
              <div style={styles.charCount}>
                {formData.description.length} characters
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Attach File{' '}
                <span style={styles.optional}>(Optional)</span>
              </label>
              <div style={styles.constraintBox}>
                <span style={styles.constraintItem}>📎 PDF or DOCX only</span>
                <span style={styles.constraintDot}>•</span>
                <span style={styles.constraintItem}>📦 Max size: 10MB</span>
              </div>
              <div
                style={{
                  ...styles.dropZone,
                  borderColor: file ? '#4A4A4A' : fileError ? '#e53e3e' : '#d0d0d0',
                  backgroundColor: file ? '#f5f5f5' : '#fafafa'
                }}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
              >
                {file ? (
                  <div style={styles.filePreview}>
                    <div style={styles.fileIcon}>
                      {file.name.endsWith('.pdf') ? '📄' : '📝'}
                    </div>
                    <div style={styles.fileDetails}>
                      <div style={styles.fileName}>{file.name}</div>
                      <div style={styles.fileSize}>{formatFileSize(file.size)}</div>
                    </div>
                    <button
                      type='button'
                      style={styles.removeFile}
                      onClick={() => { setFile(null); setFileError(''); }}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div style={styles.dropContent}>
                    <div style={styles.dropIcon}>☁️</div>
                    <p style={styles.dropText}>
                      Drag & drop your file here or{' '}
                      <label style={styles.browseLabel}>
                        browse
                        <input
                          type='file'
                          accept='.pdf,.docx'
                          style={{ display: 'none' }}
                          onChange={handleFileChange}
                        />
                      </label>
                    </p>
                    <p style={styles.dropHint}>PDF or DOCX • Max 10MB</p>
                  </div>
                )}
              </div>
              {fileError && <div style={styles.fileErrorMsg}>{fileError}</div>}
            </div>

            {isResubmit && (
              <div style={styles.infoBox}>
                ⚠️ You can resubmit a maximum of 2 times per entry. Make
                sure your changes address the reviewer's feedback.
              </div>
            )}

            <div style={styles.buttons}>
              <button
                type='button'
                style={styles.cancelButton}
                onClick={() => navigate('/contributor/dashboard')}
              >
                Cancel
              </button>
              <button
                type='submit'
                style={styles.submitButton}
                disabled={loading}
              >
                {loading ? 'Submitting...' : isResubmit ? 'Resubmit Entry' : 'Submit Entry'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    background: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 50%, #f0f0f0 100%)',
    minHeight: '100vh'
  },
  container: { maxWidth: '760px', margin: '0 auto', padding: '32px 24px' },
  breadcrumb: {
    display: 'flex', alignItems: 'center', gap: '8px',
    marginBottom: '24px', fontSize: '14px'
  },
  breadcrumbLink: { color: '#4A4A4A', cursor: 'pointer', fontWeight: '600' },
  breadcrumbSep: { color: '#bbb' },
  breadcrumbCurrent: { color: '#999' },
  card: {
    backgroundColor: 'white', borderRadius: '16px', padding: '36px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.07)', border: '1px solid #e8e8e8'
  },
  cardHeader: {
    display: 'flex', alignItems: 'center', gap: '16px',
    marginBottom: '32px', paddingBottom: '24px', borderBottom: '2px solid #f5f5f5'
  },
  cardIconBox: {
    fontSize: '28px', width: '52px', height: '52px',
    background: 'linear-gradient(135deg, #f5f5f5, #e8e8e8)',
    borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center'
  },
  cardTitle: { fontSize: '22px', fontWeight: '700', color: '#2d2d2d', marginBottom: '4px' },
  cardSubtitle: { color: '#999', fontSize: '14px' },
  formGroup: { marginBottom: '24px' },
  label: {
    display: 'block', marginBottom: '8px', color: '#555',
    fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px'
  },
  required: { color: '#e53e3e' },
  optional: { color: '#aaa', fontSize: '11px', fontWeight: '400', textTransform: 'none', letterSpacing: '0' },
  fieldHint: { fontSize: '12px', color: '#aaa', marginTop: '6px' },
  input: {
    width: '100%', padding: '12px 16px', border: '1.5px solid #e0e0e0',
    borderRadius: '10px', fontSize: '14px', color: '#2d2d2d',
    outline: 'none', boxSizing: 'border-box', backgroundColor: '#fafafa'
  },
  textarea: {
    width: '100%', padding: '12px 16px', border: '1.5px solid #e0e0e0',
    borderRadius: '10px', fontSize: '14px', color: '#2d2d2d', outline: 'none',
    boxSizing: 'border-box', backgroundColor: '#fafafa', resize: 'vertical',
    lineHeight: '1.6', fontFamily: 'inherit'
  },
  charCount: { textAlign: 'right', fontSize: '12px', color: '#bbb', marginTop: '6px' },
  constraintBox: {
    display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px',
    background: 'linear-gradient(135deg, #f5f5f5, #ececec)',
    padding: '8px 14px', borderRadius: '8px', border: '1px solid #e0e0e0'
  },
  constraintItem: { fontSize: '12px', color: '#666', fontWeight: '500' },
  constraintDot: { color: '#ccc', fontSize: '10px' },
  dropZone: {
    border: '2px dashed', borderRadius: '12px', padding: '28px 20px',
    textAlign: 'center', transition: 'all 0.2s', cursor: 'pointer'
  },
  dropContent: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' },
  dropIcon: { fontSize: '32px' },
  dropText: { fontSize: '14px', color: '#666' },
  browseLabel: { color: '#4A4A4A', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' },
  dropHint: { fontSize: '12px', color: '#bbb' },
  filePreview: { display: 'flex', alignItems: 'center', gap: '14px', padding: '4px 8px' },
  fileIcon: { fontSize: '28px' },
  fileDetails: { flex: 1, textAlign: 'left' },
  fileName: { fontSize: '14px', fontWeight: '600', color: '#2d2d2d' },
  fileSize: { fontSize: '12px', color: '#999', marginTop: '2px' },
  removeFile: {
    backgroundColor: '#f5f5f5', border: '1px solid #e0e0e0', borderRadius: '6px',
    padding: '4px 10px', cursor: 'pointer', color: '#888', fontSize: '12px'
  },
  fileErrorMsg: {
    marginTop: '8px', fontSize: '13px', color: '#e53e3e',
    backgroundColor: '#fff5f5', padding: '8px 12px',
    borderRadius: '8px', borderLeft: '3px solid #e53e3e'
  },
  infoBox: {
    backgroundColor: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '10px',
    padding: '14px 16px', fontSize: '13px', color: '#92400e',
    marginBottom: '24px', lineHeight: '1.6'
  },
  buttons: { display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' },
  cancelButton: {
    padding: '12px 28px', background: 'linear-gradient(135deg, #f5f5f5, #e8e8e8)',
    color: '#666', border: '1.5px solid #e0e0e0', borderRadius: '10px',
    cursor: 'pointer', fontSize: '14px', fontWeight: '600'
  },
  submitButton: {
    padding: '12px 28px', background: 'linear-gradient(135deg, #4A4A4A, #2d2d2d)',
    color: 'white', border: 'none', borderRadius: '10px',
    cursor: 'pointer', fontSize: '14px', fontWeight: '600'
  },
  error: {
    backgroundColor: '#fff5f5', color: '#e53e3e', padding: '12px 16px',
    borderRadius: '10px', marginBottom: '20px', fontSize: '14px', borderLeft: '3px solid #e53e3e'
  },
  success: {
    backgroundColor: '#f0fdf4', color: '#16a34a', padding: '12px 16px',
    borderRadius: '10px', marginBottom: '20px', fontSize: '14px', borderLeft: '3px solid #16a34a'
  }
};

export default SubmissionForm;