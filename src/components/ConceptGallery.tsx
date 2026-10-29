import React, { useState } from 'react';
import { CONCEPTS } from '../data/concepts';
import type { ConceptInfo } from '../data/concepts';
import { ArrowUpRight } from 'lucide-react';

interface ConceptGalleryProps {
  onSelectConcept: (concept: ConceptInfo) => void;
}

export const ConceptGallery: React.FC<ConceptGalleryProps> = ({ onSelectConcept }) => {
  const [filter, setFilter] = useState<'ALL' | 'REGIME' | 'DEFENSE' | 'DIAGNOSTIC'>('ALL');

  const filteredConcepts = CONCEPTS.filter((c) =>
    filter === 'ALL' ? true : c.category === filter
  );

  return (
    <section className="section gallery-section" id="gallery">
      <div className="section-heading">
        <div>
          <p className="eyebrow">
            <span className="eyebrow-line" /> 02 / THE CONCEPT GALLERY
          </p>
          <h2>Seven ways models succeed or fail.</h2>
        </div>
        <p>
          Select any concept card to unlock deep mathematical field notes, diagnostic
          symptoms, conceptual analogies, and PyTorch implementations.
        </p>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {(['ALL', 'REGIME', 'DEFENSE', 'DIAGNOSTIC'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              border: '1px solid var(--border-light)',
              background: filter === tab ? 'rgba(94, 217, 208, 0.15)' : 'rgba(255, 255, 255, 0.03)',
              color: filter === tab ? 'var(--accent-cyan)' : 'var(--text-muted)',
              borderColor: filter === tab ? 'var(--accent-cyan)' : 'var(--border-light)',
              transition: 'all 0.2s',
            }}
          >
            {tab === 'ALL' ? 'ALL CONCEPTS' : `${tab}S`}
          </button>
        ))}
      </div>

      <div className="gallery-grid">
        {filteredConcepts.map((concept, index) => (
          <div
            key={concept.id}
            className="concept-card"
            onClick={() => onSelectConcept(concept)}
            role="button"
            tabIndex={0}
            aria-label={`View field notes for ${concept.name}`}
            style={{ borderTop: `3px solid ${concept.color}` }}
          >
            <div className="card-top">
              <span className="card-index">0{index + 1}</span>
              <span
                className="card-category"
                style={{ color: concept.color, borderColor: concept.color }}
              >
                {concept.tag}
              </span>
              <ArrowUpRight className="card-open-icon" size={16} />
            </div>

            <h3>{concept.name}</h3>
            <div className="concept-equation">{concept.equation}</div>
            <p className="concept-desc">{concept.shortDesc}</p>

            <div className="card-footer">
              <span className="card-tag">BIAS: {concept.biasLevel.toUpperCase()}</span>
              <span className="card-action">VIEW FIELD NOTES ↗</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
