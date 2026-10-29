import { useState } from 'react';
import { ArrowDownRight, Compass } from 'lucide-react';

type Regime = 'underfit' | 'optimal' | 'overfit';

export const HeroSection: React.FC = () => {
  const [heroRegime, setHeroRegime] = useState<Regime>('optimal');

  // SVG Data coordinates for 10 noisy points
  const points = [
    { cx: 40, cy: 190 },
    { cx: 80, cy: 155 },
    { cx: 120, cy: 105 },
    { cx: 160, cy: 80 },
    { cx: 200, cy: 95 },
    { cx: 240, cy: 135 },
    { cx: 280, cy: 180 },
    { cx: 320, cy: 195 },
    { cx: 360, cy: 175 },
    { cx: 400, cy: 125 },
    { cx: 440, cy: 75 },
  ];

  // Curve paths for each regime
  const paths: Record<Regime, string> = {
    // Underfit: Straight horizontal-ish line (Degree 1)
    underfit: 'M 20,150 L 460,135',
    // Optimal: Gentle smooth wave (Degree 3)
    optimal: 'M 20,200 C 100,50 180,80 250,150 C 310,210 380,210 460,65',
    // Overfit: Wild roller coaster hitting every dot and oscillating out of bounds
    overfit:
      'M 20,240 Q 30,130 40,190 T 80,155 T 120,105 T 160,80 T 200,95 T 240,135 T 280,180 T 320,195 T 360,175 T 400,125 T 440,75 T 465,220',
  };

  const descriptions: Record<
    Regime,
    { title: string; gap: string; text: string; trainLoss: string; testLoss: string; color: string }
  > = {
    underfit: {
      title: 'Underfitting (Degree 1)',
      gap: 'High Bias',
      text: 'Rigid linear hypothesis fails to capture the natural curve. Fails on both train & test data.',
      trainLoss: '0.428',
      testLoss: '0.442',
      color: 'var(--accent-amber)',
    },
    optimal: {
      title: 'Optimal Fit (Degree 3)',
      gap: 'Goldilocks Zone',
      text: 'Smooth generalization. Captures macro signal while ignoring random noise variations.',
      trainLoss: '0.048',
      testLoss: '0.052',
      color: 'var(--accent-emerald)',
    },
    overfit: {
      title: 'Overfitting (Degree 12)',
      gap: 'High Variance',
      text: 'Memorizes noise spikes and oscillates violently at borders. 100% train accuracy, fails on test.',
      trainLoss: '0.002',
      testLoss: '1.874',
      color: 'var(--accent-rose)',
    },
  };

  const current = descriptions[heroRegime];

  return (
    <section className="hero" id="top">
      <div className="hero-copy">
        <p className="eyebrow">
          <span className="eyebrow-line" /> A FIELD GUIDE TO MACHINE LEARNING{' '}
          <span style={{ opacity: 0.6 }}>// VOL. 01</span>
        </p>

        <h1>
          GENERALIZATION
          <br />
          <span>ATLAS</span>
          <i>.</i>
        </h1>

        <p className="hero-subtitle">
          The delicate boundary between understanding reality and memorizing noise.
        </p>

        <p className="hero-intro">
          An interactive visual laboratory exploring <strong>Underfitting</strong>,{' '}
          <strong>Overfitting</strong>, and the <strong>Bias-Variance Tradeoff</strong> in
          Deep Learning through real-time mathematical simulations.
        </p>

        <div className="hero-actions">
          <a href="#lab" className="primary-link">
            Open Interactive Lab <ArrowDownRight size={16} />
          </a>
          <a href="#walkthrough" className="secondary-link">
            Concept Walkthrough <Compass size={16} />
          </a>
        </div>
      </div>

      <div className="hero-art">
        <div className="hero-art-header">
          <span className="hero-art-title">PREVIEW COMPARATOR</span>
          <div className="hero-art-tabs">
            <button
              className={`hero-art-tab ${heroRegime === 'underfit' ? 'active' : ''}`}
              onClick={() => setHeroRegime('underfit')}
            >
              Underfit
            </button>
            <button
              className={`hero-art-tab ${heroRegime === 'optimal' ? 'active' : ''}`}
              onClick={() => setHeroRegime('optimal')}
            >
              Optimal
            </button>
            <button
              className={`hero-art-tab ${heroRegime === 'overfit' ? 'active' : ''}`}
              onClick={() => setHeroRegime('overfit')}
            >
              Overfit
            </button>
          </div>
        </div>

        <svg
          className="hero-svg-canvas"
          viewBox="0 0 480 260"
          role="img"
          aria-label="Interactive visualization of underfitting, optimal fit, and overfitting"
        >
          {/* Subtle grid lines */}
          <line x1="20" y1="130" x2="460" y2="130" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
          <line x1="240" y1="20" x2="240" y2="240" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />

          {/* Underfit/Optimal/Overfit Curve */}
          <path
            d={paths[heroRegime]}
            fill="none"
            stroke={current.color}
            strokeWidth="3.5"
            strokeLinecap="round"
            style={{
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              filter: `drop-shadow(0 0 10px ${current.color})`,
            }}
          />

          {/* Residual sticks for underfitting and overfitting */}
          {heroRegime === 'underfit' &&
            points.map((p, i) => (
              <line
                key={`res-${i}`}
                x1={p.cx}
                y1={p.cy}
                x2={p.cx}
                y2={150 - (p.cx - 20) * (15 / 440)}
                stroke="rgba(255, 184, 108, 0.4)"
                strokeDasharray="2 2"
              />
            ))}

          {/* Data Points */}
          {points.map((p, i) => (
            <g key={i}>
              <circle
                cx={p.cx}
                cy={p.cy}
                r="6"
                fill="var(--accent-cyan)"
                stroke="#090c17"
                strokeWidth="2"
                style={{ filter: 'drop-shadow(0 0 5px rgba(94, 217, 208, 0.8))' }}
              />
              <circle cx={p.cx} cy={p.cy} r="2" fill="#fff" />
            </g>
          ))}
        </svg>

        <div className="hero-art-desc" style={{ borderLeftColor: current.color }}>
          <div>
            <span>{current.text}</span>
          </div>
          <div style={{ textAlign: 'right', display: 'flex', gap: '12px' }}>
            <div>
              <small style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.68rem' }}>TRAIN MSE</small>
              <b style={{ color: '#fff' }}>{current.trainLoss}</b>
            </div>
            <div>
              <small style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.68rem' }}>TEST MSE</small>
              <b style={{ color: current.color }}>{current.testLoss}</b>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
