import React from 'react';
import { ArrowUp } from 'lucide-react';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="site-footer">
      <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="brand-symbol" style={{ width: '28px', height: '28px', fontSize: '0.9rem' }}>
            Ω
          </div>
          <strong style={{ color: '#fff', fontSize: '0.95rem' }}>GENERALIZATION ATLAS</strong>
        </div>

        <p style={{ maxWidth: '500px', fontSize: '0.85rem', color: 'var(--text-dim)', textAlign: 'center' }}>
          <em>&ldquo;All models are wrong, but some are useful.&rdquo;</em> — George E. P. Box
          <br />
          An interactive deep learning micro project exploring generalization, bias-variance
          tradeoffs, and neural regularization.
        </p>

        <button
          onClick={scrollToTop}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--accent-cyan)',
            fontSize: '0.8rem',
            fontFamily: 'var(--font-mono)',
            marginTop: '0.5rem',
          }}
        >
          <ArrowUp size={14} /> Back to top
        </button>
      </div>
    </footer>
  );
};
