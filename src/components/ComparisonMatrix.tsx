import React, { useState, useEffect } from 'react';

type ColumnId = 'underfit' | 'optimal' | 'overfit' | 'l2' | 'dropout';

interface ColumnDef {
  id: ColumnId;
  name: string;
  color: string;
  definition: string;
  trainError: string;
  valError: string;
  gap: string;
  bias: string;
  variance: string;
  capacity: string;
  shape: string;
  analogy: string;
  remedy: string;
}

const columns: ColumnDef[] = [
  {
    id: 'underfit',
    name: 'Underfitting',
    color: '#ffb86c',
    definition: 'Model is too simplistic to capture genuine trends.',
    trainError: 'High (Plateaus early)',
    valError: 'High (Tracks train error)',
    gap: 'Small, but both are poor',
    bias: 'High (Strong false assumptions)',
    variance: 'Low (Rigid and stubborn)',
    capacity: 'Insufficient (Too few parameters)',
    shape: 'Flat line or rigid plane across curved points',
    analogy: 'The Slacker (Only read chapter headlines)',
    remedy: 'Increase layers/neurons, reduce regularization, add features',
  },
  {
    id: 'optimal',
    name: 'Optimal Generalization',
    color: '#34d399',
    definition: 'Captures genuine signal while tolerating stochastic noise.',
    trainError: 'Low and stable',
    valError: 'Low (Tightly bounds train error)',
    gap: 'Minimal and steady',
    bias: 'Low / Balanced',
    variance: 'Low / Balanced',
    capacity: 'Matched to true problem complexity',
    shape: 'Smooth, graceful curve capturing macro wave',
    analogy: 'The Critical Thinker (Understood fundamental logic)',
    remedy: 'Checkpoint best weights, monitor test drift in production',
  },
  {
    id: 'overfit',
    name: 'Overfitting',
    color: '#ff6b81',
    definition: 'Memorizes noise and sample-specific idiosyncrasies.',
    trainError: 'Near Zero (Near 100% accuracy)',
    valError: 'Very High / Divergent',
    gap: 'Huge disaster gap',
    bias: 'Very Low (Fits training points exactly)',
    variance: 'Extremely High (Wildly fluctuates on new data)',
    capacity: 'Excessive (Parameters >> Information content)',
    shape: 'Wild oscillations, tentacles, isolated island clusters',
    analogy: 'The Crammer (Memorized past questions + typos)',
    remedy: 'Add L2 weight decay, Dropout, Early Stopping, more data',
  },
  {
    id: 'l2',
    name: 'L2 Regularized',
    color: '#5ed9d0',
    definition: 'Penalty on squared weights forces curve smoothness.',
    trainError: 'Slightly higher than unconstrained',
    valError: 'Dramatically lower than overfit',
    gap: 'Compressed to healthy range',
    bias: 'Slightly increased (Intentional trade)',
    variance: 'Dramatically reduced',
    capacity: 'Constrained effectively by λ penalty',
    shape: 'Smooth curve; suppresses runaway high-frequency wiggles',
    analogy: 'Speed Governor (Prevents high-speed rollover)',
    remedy: 'Tune weight decay λ via logarithmic hyperparameter sweep',
  },
  {
    id: 'dropout',
    name: 'Dropout Network',
    color: '#38bdf8',
    definition: 'Random neuron deactivation prevents brittle co-adaptation.',
    trainError: 'Moderate during training (all neurons on at test)',
    valError: 'Low and resilient to perturbation',
    gap: 'Tightly controlled',
    bias: 'Slightly higher',
    variance: 'Low (Acts as ensemble of thinned networks)',
    capacity: 'High expressivity without brittle specialization',
    shape: 'Balanced boundaries without single-neuron dominance',
    analogy: 'Surprise quizzes with rotating study group members',
    remedy: 'Use p = 0.2 to 0.5 in hidden dense layers',
  },
];

const rows: { label: string; field: keyof Omit<ColumnDef, 'id' | 'name' | 'color'> }[] = [
  { label: 'Core Definition', field: 'definition' },
  { label: 'Training Error (E_train)', field: 'trainError' },
  { label: 'Validation Error (E_val)', field: 'valError' },
  { label: 'Generalization Gap (ΔE)', field: 'gap' },
  { label: 'Bias Level', field: 'bias' },
  { label: 'Variance Level', field: 'variance' },
  { label: 'Effective Capacity', field: 'capacity' },
  { label: 'Visual Geometric Shape', field: 'shape' },
  { label: 'Intuitive Analogy', field: 'analogy' },
  { label: 'First-Line Prescription', field: 'remedy' },
];

interface ComparisonMatrixProps {
  resetKey: number;
}

export const ComparisonMatrix: React.FC<ComparisonMatrixProps> = ({ resetKey }) => {
  const [selectedIds, setSelectedIds] = useState<ColumnId[]>([
    'underfit',
    'optimal',
    'overfit',
    'l2',
  ]);

  useEffect(() => {
    setSelectedIds(['underfit', 'optimal', 'overfit', 'l2']);
  }, [resetKey]);

  const toggle = (id: ColumnId) => {
    setSelectedIds((curr) =>
      curr.includes(id)
        ? curr.length > 2
          ? curr.filter((c) => c !== id)
          : curr
        : [...curr, id]
    );
  };

  const activeColumns = columns.filter((c) => selectedIds.includes(c.id));

  return (
    <section className="section comparison-section" id="matrix">
      <div className="section-heading">
        <div>
          <p className="eyebrow">
            <span className="eyebrow-line" /> 04 / QUICK REFERENCE
          </p>
          <h2>Compare the regimes side by side.</h2>
        </div>
        <p>
          Toggle regimes to customize your side-by-side comparative matrix for deep learning
          reference and analysis.
        </p>
      </div>

      {/* Filter Chips */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', marginRight: '6px' }}>
          SHOW REGIMES:
        </span>
        {columns.map((c) => (
          <button
            key={c.id}
            onClick={() => toggle(c.id)}
            style={{
              padding: '5px 12px',
              borderRadius: '20px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              border: '1px solid',
              borderColor: selectedIds.includes(c.id) ? c.color : 'var(--border-light)',
              background: selectedIds.includes(c.id) ? `${c.color}22` : 'rgba(255, 255, 255, 0.03)',
              color: selectedIds.includes(c.id) ? '#fff' : 'var(--text-muted)',
              transition: 'all 0.2s',
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: c.color }} />
            {c.name}
          </button>
        ))}
      </div>

      <div className="matrix-wrap">
        <table className="matrix">
          <thead>
            <tr>
              <th style={{ width: '180px' }}>ATTRIBUTE</th>
              {activeColumns.map((col) => (
                <th key={col.id} style={{ color: col.color }}>
                  <span
                    style={{
                      display: 'inline-block',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: col.color,
                      marginRight: '6px',
                    }}
                  />
                  {col.name.toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <th scope="row">{row.label}</th>
                {activeColumns.map((col) => (
                  <td key={col.id}>{col[row.field]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
