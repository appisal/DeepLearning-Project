import React, { useState } from 'react';
import { X, Check, Copy, AlertTriangle, ShieldCheck } from 'lucide-react';
import type { ConceptInfo } from '../data/concepts';

interface ConceptModalProps {
  concept: ConceptInfo | null;
  onClose: () => void;
}

export const ConceptModal: React.FC<ConceptModalProps> = ({ concept, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!concept) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(concept.codeSnippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        <div className="card-top" style={{ marginBottom: '0.5rem' }}>
          <span
            className="card-category"
            style={{ color: concept.color, borderColor: concept.color }}
          >
            {concept.category} • {concept.tag}
          </span>
        </div>

        <h2 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '0.4rem' }}>
          {concept.name}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1rem' }}>
          {concept.shortDesc}
        </p>

        {/* Mathematical Equation Box */}
        <div className="modal-equation-box">
          <div style={{ fontSize: '1rem', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>
            {concept.equation}
          </div>
          <small style={{ color: 'var(--text-dim)', fontSize: '0.78rem' }}>
            {concept.equationNote}
          </small>
        </div>

        {/* Regime Diagnostic Indicators */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '10px',
            margin: '1.2rem 0',
          }}
        >
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '6px' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'block' }}>
              BIAS LEVEL
            </span>
            <strong style={{ color: concept.biasLevel === 'High' ? 'var(--accent-amber)' : 'var(--accent-emerald)' }}>
              {concept.biasLevel}
            </strong>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '6px' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'block' }}>
              VARIANCE LEVEL
            </span>
            <strong style={{ color: concept.varianceLevel === 'High' ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>
              {concept.varianceLevel}
            </strong>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '6px' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'block' }}>
              TRAIN LOSS STATE
            </span>
            <strong style={{ fontSize: '0.85rem' }}>{concept.trainLossState}</strong>
          </div>
        </div>

        {/* Student Analogy Highlight */}
        <div
          style={{
            background: 'rgba(159, 140, 255, 0.08)',
            borderLeft: '3px solid var(--accent-violet)',
            padding: '1rem',
            borderRadius: '0 8px 8px 0',
            margin: '1.2rem 0',
          }}
        >
          <b style={{ color: 'var(--accent-violet)', fontSize: '0.78rem', display: 'block', marginBottom: '4px' }}>
            INTUITIVE CONCEPTUAL ANALOGY
          </b>
          <p style={{ color: 'var(--text-main)', fontSize: '0.88rem' }}>
            {concept.studentAnalogy}
          </p>
        </div>

        {/* Symptoms & Diagnostics */}
        <div style={{ margin: '1.2rem 0' }}>
          <h4 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertTriangle size={15} color="var(--accent-amber)" /> Diagnostic Symptoms
          </h4>
          <ul style={{ listStyle: 'none', paddingLeft: '4px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {concept.symptoms.map((symptom, i) => (
              <li key={i} style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', gap: '8px' }}>
                <span style={{ color: 'var(--accent-amber)' }}>•</span> {symptom}
              </li>
            ))}
          </ul>
        </div>

        {/* Remedies & Prescriptions */}
        <div style={{ margin: '1.2rem 0' }}>
          <h4 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={15} color="var(--accent-emerald)" /> Solutions & Remedies
          </h4>
          <ul style={{ listStyle: 'none', paddingLeft: '4px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {concept.remedies.map((remedy, i) => (
              <li key={i} style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', gap: '8px' }}>
                <span style={{ color: 'var(--accent-emerald)' }}>✓</span> {remedy}
              </li>
            ))}
          </ul>
        </div>

        {/* Code Snippet Box */}
        <div className="code-block-wrapper">
          <div className="code-block-header">
            <span>{concept.codeSnippet.title}</span>
            <button
              onClick={handleCopy}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', color: copied ? 'var(--accent-emerald)' : 'var(--text-dim)', fontSize: '0.72rem' }}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <pre>
            <code>{concept.codeSnippet.code}</code>
          </pre>
        </div>

        {/* Deep Dive Paragraph */}
        <p style={{ marginTop: '1.5rem', fontSize: '0.88rem', lineHeight: '1.6', color: 'var(--text-dim)' }}>
          {concept.deepDiveText}
        </p>
      </div>
    </div>
  );
};
