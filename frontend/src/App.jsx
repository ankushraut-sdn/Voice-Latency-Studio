import React, { useState, useRef } from 'react';
import './index.css';

function App() {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [interrupted, setInterrupted] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);
    setInterrupted(false);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch('/api/v1/audit/run', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setResult(data);
    } catch (e) {
      setResult({ success: false, error: e.message });
    } finally {
      setLoading(false);
    }
  };

  const triggerBargeIn = () => {
    setInterrupted(true);
    const audio = document.getElementById('tts-audio');
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  };

  // Calculate percentages for the gauge bars (max turnaround standard = 1000ms)
  const getPercentage = (val) => Math.min((val / 600) * 100, 100);

  return (
    <div className="box">
      <div className="header">
        <h1 className="title">Voice Latency Studio</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
          Vocal turnaround auditing, speech-to-text response times, and real-time dialogue barge-in interruption profiling.
        </p>
      </div>

      <div className="panel">
        <div 
          className={`file-drop ${dragActive ? 'drag-active' : ''}`} 
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={onButtonClick}
        >
          <input 
            ref={fileInputRef}
            type="file" 
            accept="audio/*" 
            onChange={handleFileChange} 
            style={{ display: 'none' }} 
          />
          <svg style={{ width: '48px', height: '48px', marginBottom: '15px', fill: 'var(--accent-cyan)' }} viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
          </svg>
          {file ? (
            <p style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Selected: {file.name}</p>
          ) : (
            <p style={{ color: 'var(--text-secondary)' }}>Drag and drop your audio clip here, or click to browse</p>
          )}
        </div>

        <button 
          className="btn" 
          onClick={handleUpload} 
          disabled={loading || !file}
          style={{ opacity: loading || !file ? 0.6 : 1 }}
        >
          {loading ? 'Synthesizing voice dialog...' : 'Test Voice Speech Turn →'}
        </button>

        {loading && <div className="spinner"></div>}

        {result && (
          <div className="report-pre" style={{ background: 'rgba(255,255,255,0.01)', color: 'var(--text-primary)', fontFamily: 'inherit' }}>
            <h3 style={{ color: 'var(--accent-purple)', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📊</span> Voice Pipeline & Latency Audits
            </h3>
            
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '8px', marginBottom: '20px', borderLeft: '3px solid var(--accent-cyan)' }}>
              <div style={{ marginBottom: '10px' }}><span style={{ color: 'var(--text-secondary)' }}>STT Transcript:</span> <strong style={{ fontStyle: 'italic' }}>"{result.transcript}"</strong></div>
              <div><span style={{ color: 'var(--text-secondary)' }}>AI Vocal Response:</span> <strong style={{ color: '#cba6f7' }}>"{result.response}"</strong></div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px', marginBottom: '25px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '0.9rem' }}>
                  <span>STT Transcription Latency</span>
                  <strong>{result.metrics.stt_ms} ms</strong>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${getPercentage(result.metrics.stt_ms)}%`, height: '100%', background: 'var(--accent-cyan)', borderRadius: '4px' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '0.9rem' }}>
                  <span>LLM Response Generation Latency</span>
                  <strong>{result.metrics.llm_ms} ms</strong>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${getPercentage(result.metrics.llm_ms)}%`, height: '100%', background: 'var(--accent-purple)', borderRadius: '4px' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '0.9rem' }}>
                  <span>TTS Synthesis Latency</span>
                  <strong>{result.metrics.tts_ms} ms</strong>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${getPercentage(result.metrics.tts_ms)}%`, height: '100%', background: '#f5c2e7', borderRadius: '4px' }}></div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '15px', marginTop: '5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '1rem', fontWeight: 'bold' }}>
                  <span>Total Turnaround Latency</span>
                  <span style={{ color: '#a6e3a1' }}>{result.metrics.total_turnaround_ms} ms</span>
                </div>
                <div style={{ width: '100%', height: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{ width: `${getPercentage(result.metrics.total_turnaround_ms)}%`, height: '100%', background: 'linear-gradient(90deg, var(--accent-cyan), var(--accent-purple))', borderRadius: '6px' }}></div>
                </div>
              </div>
            </div>

            {result.audio_name && (
              <div style={{ textAlign: 'center', marginTop: '20px', background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '12px' }}>
                <h4 style={{ marginBottom: '15px', color: 'var(--text-secondary)', fontSize: '0.9rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Vocal Output Stream</h4>
                <audio id="tts-audio" src={`/api/v1/audit/tts/${result.audio_name}`} controls autoPlay style={{ width: '100%', marginBottom: '20px' }} />
                
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                  <button 
                    className="btn" 
                    onClick={triggerBargeIn} 
                    style={{ background: 'linear-gradient(135deg, #f38ba8, #e64553)', color: 'white', maxWidth: '240px', boxShadow: '0 4px 15px rgba(243, 139, 168, 0.3)' }}
                  >
                    🛑 Simulate Barge-In!
                  </button>
                  {interrupted && (
                    <div style={{ color: '#f38ba8', marginTop: '10px', fontWeight: 'bold', animation: 'pulse 1.5s infinite', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>⚡</span> Barge-In interruption event triggered! TTS muted instantly.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

