import React, { useState, useEffect } from 'react';
import { Settings, Copy, Download, ExternalLink, AlertTriangle, Check } from 'lucide-react';
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

  useEffect(() => {
    if (params.slotWidth <= 0.750) {
      setError("⚠️ Slot width too small. Please contact a CNC programmer with CAM for slots 0.750\" or smaller.");
      setGcode('');
    } else {
      setError('');
      const code = generateGCode(params.machine, params);
      setGcode(code);
    }
  }, [params]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setParams(prev => ({
      ...prev,
      [name]: name === 'machine' ? value : parseFloat(value) || 0
    }));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(gcode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filename = params.machine === MACHINES.MAZAK ? '1111.eia' : '1111';
    const blob = new Blob([gcode], { type: 'text/plain' });
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
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          v1.0.0 | Steelcraft Technologies
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
      </div>

      <div className="panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0 }}>G-Code Preview</h2>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Filename: {params.machine === MACHINES.MAZAK ? '1111.eia' : '1111'}
          </div>
        </div>

        {error && (
          <div className="error-message">
            <AlertTriangle size={16} inline style={{ marginRight: '0.5rem' }} />
            {error}
          </div>
        )}

        <div className="gcode-preview">
          {gcode || (error ? '---' : 'Generating...')}
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
    </div>
  );
}

export default App;
