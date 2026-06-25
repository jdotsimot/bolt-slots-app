import React, { useState } from 'react';
import { Settings, Copy, Download, ExternalLink, AlertTriangle, Check, HelpCircle } from 'lucide-react';
import { generateGCode, MACHINES } from './utils/generators';
import Diagram from './components/Diagram';

function App() {
  const [params, setParams] = useState({
    machine: MACHINES.MAZAK,
    slotWidth: 1.0,
    slotLength: 2.0,
    parallelWidth: 3.0,
    parallelLength: 12.0,
    footHeight: 1.5
  });

  const [gcode, setGcode] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  const openFeedbackModal = () => setIsFeedbackModalOpen(true);
  const closeFeedbackModal = () => setIsFeedbackModalOpen(false);

  const copyFeedbackEmail = () => {
    const email = 'jrsimot@gmail.com';
    navigator.clipboard.writeText(email).then(() => {
      const btn = document.getElementById('btn-copy-email');
      if (btn) {
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        btn.style.color = 'var(--success-color, #00e676)';
        btn.style.borderColor = 'var(--success-color, #00e676)';

        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.color = '';
          btn.style.borderColor = '';
        }, 2000);
      }
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setParams(prev => ({
      ...prev,
      [name]: name === 'machine' ? value : parseFloat(value) || 0
    }));
    // Clear G-code when parameters change to encourage re-generation
    setGcode('');
    setError('');
  };

  const handleGenerate = () => {
    if (params.slotWidth <= 0.750) {
      setError("⚠️ Slot width too small. Please contact a CNC programmer with CAM for slots 0.750\" or smaller.");
      setGcode('');
    } else {
      setError('');
      const code = generateGCode(params.machine, params);
      setGcode(code);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(gcode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filename = params.machine === MACHINES.MAZAK ? '1111.eia' : 'O1111';
    const blob = new Blob([gcode], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="app-container">
      <header className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Settings size={32} color="var(--accent-color)" />
          <h1 style={{ margin: 0 }}>Bolt Slot Generator</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <a
            href="./instructions.html"
            target="_blank"
            rel="noopener noreferrer"
            className="instructions-link"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--accent-color)',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: '500'
            }}
          >
            <HelpCircle size={18} />
            User Guide
          </a>
          <button
            className="btn btn-secondary"
            onClick={openFeedbackModal}
            style={{
              height: '32px',
              padding: '0 0.75rem',
              fontSize: '0.875rem',
              justifyContent: 'center'
            }}
            title="Send Feedback"
          >
            Feedback
          </button>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            v1.0.0 | Steelcraft Technologies
          </div>
        </div>
      </header>

      <div className="panel">
        <h2>Input Parameters</h2>

        <div className="input-group">
          <label>Machine Selection</label>
          <select name="machine" value={params.machine} onChange={handleInputChange}>
            <option value={MACHINES.MAZAK}>Mazak (EIA)</option>
            <option value={MACHINES.BIG_MILLS}>Big Mills</option>
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="input-group">
            <label>Slot Width (in)</label>
            <input
              type="number"
              name="slotWidth"
              step="0.001"
              value={params.slotWidth}
              onChange={handleInputChange}
            />
          </div>
          <div className="input-group">
            <label>Slot Length (in)</label>
            <input
              type="number"
              name="slotLength"
              step="0.001"
              value={params.slotLength}
              onChange={handleInputChange}
            />
          </div>
          <div className="input-group">
            <label>Parallel Width (in)</label>
            <input
              type="number"
              name="parallelWidth"
              step="0.001"
              value={params.parallelWidth}
              onChange={handleInputChange}
            />
          </div>
          <div className="input-group">
            <label>Parallel Length (in)</label>
            <input
              type="number"
              name="parallelLength"
              step="0.001"
              value={params.parallelLength}
              onChange={handleInputChange}
            />
          </div>
          <div className="input-group">
            <label>Foot Height (in)</label>
            <input
              type="number"
              name="footHeight"
              step="0.001"
              value={params.footHeight}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <Diagram />

        <div style={{ marginTop: '1.5rem' }}>
          <button
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', gap: '0.5rem' }}
            onClick={handleGenerate}
          >
            <Settings size={20} />
            Generate G-Code
          </button>
        </div>
      </div>

      <div className="panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0 }}>G-Code Preview</h2>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Filename: {params.machine === MACHINES.MAZAK ? '1111.eia' : 'O1111'}
          </div>
        </div>

        {error && (
          <div className="error-message">
            <AlertTriangle size={16} inline style={{ marginRight: '0.5rem' }} />
            {error}
          </div>
        )}

        <div className="gcode-preview">
          {gcode || (error ? '---' : 'Click "Generate G-Code" to create program...')}
        </div>

        <div className="action-bar">
          <button
            className="btn btn-primary"
            onClick={handleCopy}
            disabled={!!error}
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
            {copied ? 'Copied!' : 'Copy to Clipboard'}
          </button>

          <button
            className="btn btn-secondary"
            onClick={handleDownload}
            disabled={!!error}
          >
            <Download size={18} />
            Download
          </button>

          <a
            href="https://ncviewer.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{ textDecoration: 'none' }}
          >
            <ExternalLink size={18} />
            NC Viewer
          </a>
        </div>
      </div>

      {isFeedbackModalOpen && (
        <div
          id="feedback-modal"
          className="modal-overlay"
          onClick={(e) => {
            if (e.target.id === 'feedback-modal') closeFeedbackModal();
          }}
        >
          <div className="modal-card">
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Send Feedback / Bug Report</h3>
              <button
                className="modal-close"
                onClick={closeFeedbackModal}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  lineHeight: 1
                }}
              >
                &times;
              </button>
            </div>
            <p style={{ fontSize: '0.875rem', margin: '0.75rem 0 1.25rem 0', textAlign: 'left', opacity: 0.8 }}>
              Select your preferred way to report issues or suggest improvements for the application:
            </p>
            <div className="modal-actions" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <a
                href="mailto:jrsimot@gmail.com?subject=Application%20Feedback&body=Description%20of%20Feedback%2FIssue%3A%0A%0A%0A%0A"
                className="btn btn-primary"
                style={{ textDecoration: 'none', textAlign: 'center', display: 'block', justifyContent: 'center' }}
                onClick={closeFeedbackModal}
              >
                Open Desktop Mail Client
              </a>
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=jrsimot@gmail.com&su=Application%20Feedback&body=Description%20of%20Feedback%2FIssue%3A%0A%0A%0A%0A"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
                style={{ textDecoration: 'none', textAlign: 'center', display: 'block', justifyContent: 'center' }}
                onClick={closeFeedbackModal}
              >
                Send with Gmail (Web)
              </a>
              <button
                className="btn btn-secondary"
                id="btn-copy-email"
                style={{ justifyContent: 'center' }}
                onClick={copyFeedbackEmail}
              >
                Copy Email to Clipboard
              </button>
            </div>
            <div className="github-issue-section" style={{ marginTop: '1.5rem', paddingTop: '1rem', textAlign: 'center' }}>
              <p style={{ fontSize: '0.75rem', marginBottom: '0.5rem', textAlign: 'center', opacity: 0.7 }}>
                For developers with a GitHub account:
              </p>
              <a
                href="https://github.com/jdotsimot/bolt-slots-app/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
                style={{
                  textDecoration: 'none',
                  fontSize: '0.8rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  justifyContent: 'center',
                  width: '100%'
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                </svg>
                Submit GitHub Issue
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
