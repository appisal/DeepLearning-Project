import React, { useState, useMemo } from 'react';
import {
  generateRegressionData,
  fitPolynomial,
  fitPolynomialLasso,
  evaluatePolynomial,
  computeMSE,
  groundTruthFn,
} from '../utils/mathUtils';
import { Shield, Sparkles, SlidersHorizontal, CheckCircle2 } from 'lucide-react';

const W_STAR = { w1: 1.6, w2: 1.3 };

export const RegularizationLab: React.FC = () => {
  const [viewTab, setViewTab] = useState<'weights-curve' | 'geometric-contour'>('weights-curve');
  const [regType, setRegType] = useState<'l1' | 'l2'>('l1');
  const [lambda, setLambda] = useState<number>(0.04);
  const [degree] = useState<number>(8); // Fixed high capacity to showcase weight decay & sparsity
  const [numSamples] = useState<number>(18);
  const [noise] = useState<number>(0.25);

  // Geometric 2D constraint radius
  const [constraintBudget, setConstraintBudget] = useState<number>(1.2);

  // Generate noisy dataset
  const { trainPoints, testPoints } = useMemo(() => {
    return generateRegressionData(numSamples, noise);
  }, [numSamples, noise]);

  // Unregularized baseline (lambda = 0)
  const unregCoeffs = useMemo(() => {
    return fitPolynomial(trainPoints, degree, 0);
  }, [trainPoints, degree]);

  // Regularized weights
  const regCoeffs = useMemo(() => {
    if (regType === 'l1') {
      return fitPolynomialLasso(trainPoints, degree, lambda);
    }
    return fitPolynomial(trainPoints, degree, lambda);
  }, [trainPoints, degree, regType, lambda]);

  // Metrics
  const unregTrainMSE = useMemo(() => computeMSE(trainPoints, unregCoeffs), [trainPoints, unregCoeffs]);
  const unregTestMSE = useMemo(() => computeMSE(testPoints, unregCoeffs), [testPoints, unregCoeffs]);

  const regTrainMSE = useMemo(() => computeMSE(trainPoints, regCoeffs), [trainPoints, regCoeffs]);
  const regTestMSE = useMemo(() => computeMSE(testPoints, regCoeffs), [testPoints, regCoeffs]);

  // Sparsity stats
  const activeFeaturesCount = useMemo(() => {
    return regCoeffs.filter((w, idx) => idx === 0 || Math.abs(w) > 0.001).length;
  }, [regCoeffs]);

  const zeroedFeaturesCount = (degree + 1) - activeFeaturesCount;

  const l1Norm = useMemo(() => regCoeffs.reduce((sum, w) => sum + Math.abs(w), 0), [regCoeffs]);
  const l2Norm = useMemo(() => Math.sqrt(regCoeffs.reduce((sum, w) => sum + w * w, 0)), [regCoeffs]);

  // SVG Mapping for 1D curve: X in [-1.05, 1.05] -> [25, 475], Y in [-1.9, 1.9] -> [335, 25]
  const mapX = (x: number) => 25 + ((x + 1.05) / 2.1) * 450;
  const mapY = (y: number) => {
    const clampedY = Math.max(-1.9, Math.min(1.9, y));
    return 335 - ((clampedY + 1.9) / 3.8) * 310;
  };

  const regCurvePath = useMemo(() => {
    const segments: string[] = [];
    const steps = 150;
    for (let i = 0; i <= steps; i++) {
      const x = -1 + (2 * i) / steps;
      const y = evaluatePolynomial(regCoeffs, x);
      const px = mapX(x);
      const py = mapY(y);
      if (i === 0) segments.push(`M ${px.toFixed(1)},${py.toFixed(1)}`);
      else segments.push(`L ${px.toFixed(1)},${py.toFixed(1)}`);
    }
    return segments.join(' ');
  }, [regCoeffs]);

  const unregCurvePath = useMemo(() => {
    const segments: string[] = [];
    const steps = 150;
    for (let i = 0; i <= steps; i++) {
      const x = -1 + (2 * i) / steps;
      const y = evaluatePolynomial(unregCoeffs, x);
      const px = mapX(x);
      const py = mapY(y);
      if (i === 0) segments.push(`M ${px.toFixed(1)},${py.toFixed(1)}`);
      else segments.push(`L ${px.toFixed(1)},${py.toFixed(1)}`);
    }
    return segments.join(' ');
  }, [unregCoeffs]);

  const groundTruthPath = useMemo(() => {
    const segments: string[] = [];
    const steps = 150;
    for (let i = 0; i <= steps; i++) {
      const x = -1 + (2 * i) / steps;
      const y = groundTruthFn(x);
      const px = mapX(x);
      const py = mapY(y);
      if (i === 0) segments.push(`M ${px.toFixed(1)},${py.toFixed(1)}`);
      else segments.push(`L ${px.toFixed(1)},${py.toFixed(1)}`);
    }
    return segments.join(' ');
  }, []);

  // 2D Geometric Simulation calculations
  // Calculate tangency point depending on L1 diamond vs L2 circle constraint
  const geomSolution = useMemo(() => {
    const C = constraintBudget;
    if (regType === 'l1') {
      if (C < 0.2) return { w1: 0, w2: 0, isCorner: true };
      if (W_STAR.w1 >= W_STAR.w2) {
        // Hits the corner on the w1 axis! (w2 becomes strictly 0.0)
        return { w1: C, w2: 0.0, isCorner: true };
      }
      return { w1: 0.0, w2: C, isCorner: true };
    } else {
      // For L2 circle: tangency occurs along normalized gradient direction towards W_STAR
      const norm = Math.hypot(W_STAR.w1, W_STAR.w2);
      const factor = Math.min(1.0, C / (norm || 1));
      return {
        w1: Number((W_STAR.w1 * factor).toFixed(2)),
        w2: Number((W_STAR.w2 * factor).toFixed(2)),
        isCorner: false,
      };
    }
  }, [constraintBudget, regType]);

  // Geometric 2D coordinate mapping: [-0.5, 2.2] -> [30, 370]
  const mapGeomX = (w1: number) => 40 + ((w1 + 0.6) / 2.7) * 320;
  const mapGeomY = (w2: number) => 360 - ((w2 + 0.6) / 2.7) * 320;

  return (
    <div className="sim-container">
      {/* Sub Navigation */}
      <div className="sim-subnav">
        <div className="subnav-left">
          <button
            className={`subnav-pill ${viewTab === 'weights-curve' ? 'active' : ''}`}
            onClick={() => setViewTab('weights-curve')}
          >
            <SlidersHorizontal size={15} /> Weight Sparsity & Curve Fitting
          </button>
          <button
            className={`subnav-pill ${viewTab === 'geometric-contour' ? 'active' : ''}`}
            onClick={() => setViewTab('geometric-contour')}
          >
            <Sparkles size={15} /> 2D Geometric Constraint (Diamond vs Circle)
          </button>
        </div>

        {/* Regularization Type Selector */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Penalty:</span>
          <button
            className={`subnav-pill ${regType === 'l1' ? 'active' : ''}`}
            style={{
              borderColor: regType === 'l1' ? 'var(--accent-cyan)' : 'var(--border-light)',
              color: regType === 'l1' ? 'var(--accent-cyan)' : 'var(--text-muted)',
            }}
            onClick={() => setRegType('l1')}
          >
            L1 Lasso (|w|)
          </button>
          <button
            className={`subnav-pill ${regType === 'l2' ? 'active' : ''}`}
            style={{
              borderColor: regType === 'l2' ? 'var(--accent-violet)' : 'var(--border-light)',
              color: regType === 'l2' ? 'var(--accent-violet)' : 'var(--text-muted)',
            }}
            onClick={() => setRegType('l2')}
          >
            L2 Ridge (w²)
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* VIEW 1: WEIGHT SPARSITY & CURVE FITTING */}
      {/* ===================================================================== */}
      {viewTab === 'weights-curve' && (
        <div className="sim-grid">
          {/* Main Visualizer */}
          <div className="sim-canvas-card">
            <div className="canvas-header">
              <div className="canvas-title-group">
                <span className="canvas-title">
                  {regType === 'l1' ? 'L1 LASSO REGULARIZATION' : 'L2 RIDGE REGULARIZATION'} • λ = {lambda.toFixed(3)}
                </span>
                <span className="canvas-sub">
                  Degree {degree} Polynomial • {activeFeaturesCount} of {degree + 1} features active
                </span>
              </div>
              <div className="status-pill badge-optimal">
                <Shield size={14} />
                <span>
                  {regType === 'l1'
                    ? zeroedFeaturesCount > 0
                      ? `${zeroedFeaturesCount} WEIGHTS PRUNED TO EXACT ZERO`
                      : 'ALL WEIGHTS ACTIVE'
                    : 'SMOOTH WEIGHT DECAY'}
                </span>
              </div>
            </div>

            {/* Regression Curve Stage */}
            <div className="svg-stage" style={{ height: '300px' }}>
              <svg viewBox="0 0 500 360" className="sim-svg" role="img" aria-label="Regularized Regression Plot">
                <line x1="25" y1="180" x2="475" y2="180" stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
                <line x1="250" y1="25" x2="250" y2="335" stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />

                {/* Ground Truth */}
                <path
                  d={groundTruthPath}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.3)"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />

                {/* Unregularized Overfitted Ghost Curve (Dim Red/Pink) */}
                <path
                  d={unregCurvePath}
                  fill="none"
                  stroke="rgba(255, 107, 129, 0.4)"
                  strokeWidth="2"
                  strokeDasharray="3 3"
                />

                {/* Regularized Curve */}
                <path
                  d={regCurvePath}
                  fill="none"
                  stroke={regType === 'l1' ? 'var(--accent-cyan)' : 'var(--accent-violet)'}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  style={{
                    filter:
                      regType === 'l1'
                        ? 'drop-shadow(0 0 8px rgba(94, 217, 208, 0.8))'
                        : 'drop-shadow(0 0 8px rgba(159, 140, 255, 0.8))',
                  }}
                />

                {/* Test Points */}
                {testPoints.map((p, i) => (
                  <circle
                    key={`test-${i}`}
                    cx={mapX(p.x)}
                    cy={mapY(p.y)}
                    r="3.5"
                    fill="var(--accent-amber)"
                    opacity="0.8"
                    stroke="#090c17"
                    strokeWidth="1.2"
                  />
                ))}

                {/* Train Points */}
                {trainPoints.map((p, i) => (
                  <circle
                    key={`train-${i}`}
                    cx={mapX(p.x)}
                    cy={mapY(p.y)}
                    r="5"
                    fill="var(--text-main)"
                    stroke="#090c17"
                    strokeWidth="1.8"
                  />
                ))}
              </svg>
            </div>

            {/* Weights Spectrum Bar Chart */}
            <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.35)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                  WEIGHT COEFFICIENT SPECTRUM |w_i| (Degree 0 to 8)
                </span>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontFamily: 'var(--font-mono)',
                    color: regType === 'l1' ? 'var(--accent-cyan)' : 'var(--accent-violet)',
                  }}
                >
                  {regType === 'l1' ? 'L1 Sparse Feature Selection' : 'L2 Continuous Weight Decay'}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gap: '6px', alignItems: 'end', height: '90px' }}>
                {regCoeffs.map((w, idx) => {
                  const mag = Math.min(2.5, Math.abs(w));
                  const heightPercent = Math.max(4, (mag / 2.5) * 100);
                  const isZero = idx > 0 && Math.abs(w) < 0.001;

                  return (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                      <div
                        style={{
                          width: '100%',
                          height: `${heightPercent}%`,
                          backgroundColor: isZero
                            ? 'rgba(255,255,255,0.06)'
                            : regType === 'l1'
                            ? 'var(--accent-cyan)'
                            : 'var(--accent-violet)',
                          borderRadius: '3px 3px 0 0',
                          transition: 'height 0.25s, background-color 0.25s',
                          border: isZero ? '1px dashed rgba(255,255,255,0.2)' : 'none',
                        }}
                        title={`w_${idx} = ${w.toFixed(4)}`}
                      />
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontFamily: 'var(--font-mono)',
                          color: isZero ? 'var(--text-dim)' : '#fff',
                          marginTop: '4px',
                        }}
                      >
                        w{idx}
                      </span>
                      <small
                        style={{
                          fontSize: '0.62rem',
                          fontFamily: 'var(--font-mono)',
                          color: isZero ? 'var(--accent-rose)' : 'var(--text-muted)',
                        }}
                      >
                        {isZero ? '0.00' : Math.abs(w).toFixed(2)}
                      </small>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Metrics Comparison Row */}
            <div className="sim-metrics-bar" style={{ marginTop: '1rem' }}>
              <div className="metric-box">
                <div className="metric-label">ACTIVE / TOTAL WEIGHTS</div>
                <div className="metric-val" style={{ color: regType === 'l1' ? 'var(--accent-cyan)' : 'var(--accent-violet)' }}>
                  {activeFeaturesCount} / {degree + 1}
                </div>
                <small className="metric-sub">{zeroedFeaturesCount} set to exact 0</small>
              </div>

              <div className="metric-box">
                <div className="metric-label">L1 NORM (∑|w|)</div>
                <div className="metric-val text-white">{l1Norm.toFixed(2)}</div>
                <small className="metric-sub">L2 Norm: {l2Norm.toFixed(2)}</small>
              </div>

              <div className="metric-box">
                <div className="metric-label">UNREGULARIZED TEST MSE</div>
                <div className="metric-val" style={{ color: 'var(--accent-rose)' }}>
                  {unregTestMSE.toFixed(3)}
                </div>
                <small className="metric-sub">Train: {unregTrainMSE.toFixed(3)}</small>
              </div>

              <div className="metric-box">
                <div className="metric-label">REGULARIZED TEST MSE</div>
                <div className="metric-val" style={{ color: 'var(--accent-emerald)' }}>
                  {regTestMSE.toFixed(3)}
                </div>
                <small className="metric-sub">Train: {regTrainMSE.toFixed(3)}</small>
              </div>
            </div>
          </div>

          {/* Controls Column */}
          <div className="sim-controls-card">
            <h4 className="controls-title">Regularization Preset Tests</h4>
            <div className="presets-list">
              <button
                className="preset-item"
                onClick={() => {
                  setRegType('l1');
                  setLambda(0.0);
                }}
              >
                <div className="preset-name">1. Zero Penalty (λ = 0)</div>
                <div className="preset-desc">Pure unconstrained fit. High variance, wild wiggles.</div>
              </button>

              <button
                className="preset-item"
                onClick={() => {
                  setRegType('l1');
                  setLambda(0.05);
                }}
              >
                <div className="preset-name" style={{ color: 'var(--accent-cyan)' }}>
                  2. L1 Sparse Lasso (λ = 0.05)
                </div>
                <div className="preset-desc">Drives high-degree coefficients to exact 0. Feature selection!</div>
              </button>

              <button
                className="preset-item"
                onClick={() => {
                  setRegType('l2');
                  setLambda(0.05);
                }}
              >
                <div className="preset-name" style={{ color: 'var(--accent-violet)' }}>
                  3. L2 Smooth Ridge (λ = 0.05)
                </div>
                <div className="preset-desc">Shrinks all weights proportionally. No exact zeros, smooth curve.</div>
              </button>

              <button
                className="preset-item"
                onClick={() => {
                  setRegType('l1');
                  setLambda(0.2);
                }}
              >
                <div className="preset-name">4. Heavy L1 Sparsity (λ = 0.20)</div>
                <div className="preset-desc">Aggressive pruning: keeps only the lowest essential order terms.</div>
              </button>
            </div>

            <h4 className="controls-title" style={{ marginTop: '1.25rem' }}>Penalty Strength</h4>

            <div className="control-slider-block">
              <div className="slider-row-header">
                <span>REGULARIZATION STRENGTH (λ)</span>
                <span className="slider-num">{lambda.toFixed(3)}</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="0.30"
                step="0.005"
                value={lambda}
                onChange={(e) => setLambda(Number(e.target.value))}
                className="sim-range"
              />
              <div className="slider-ticks">
                <span>0.0 (None)</span>
                <span>0.10</span>
                <span>0.30 (Heavy)</span>
              </div>
            </div>

            {/* Theory Breakdown Box */}
            <div
              style={{
                marginTop: '1.25rem',
                padding: '1rem',
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '8px',
                borderLeft: `3px solid ${regType === 'l1' ? 'var(--accent-cyan)' : 'var(--accent-violet)'}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <CheckCircle2 size={14} color={regType === 'l1' ? 'var(--accent-cyan)' : 'var(--accent-violet)'} />
                <b
                  style={{
                    fontSize: '0.8rem',
                    color: regType === 'l1' ? 'var(--accent-cyan)' : 'var(--accent-violet)',
                  }}
                >
                  {regType === 'l1' ? 'L1 LASSO MECHANISM' : 'L2 RIDGE MECHANISM'}
                </b>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {regType === 'l1'
                  ? 'The L1 penalty λ∑|w_i| has a constant gradient magnitude. It drives redundant coefficients to absolute zero, performing automatic feature selection.'
                  : 'The L2 penalty ½λ∑w_i² has a gradient proportional to w. It penalizes large weights severely but decays softly as weights approach zero, preventing explosion without pruning.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* VIEW 2: 2D GEOMETRIC CONSTRAINT (DIAMOND VS CIRCLE) */}
      {/* ===================================================================== */}
      {viewTab === 'geometric-contour' && (
        <div className="sim-grid">
          <div className="sim-canvas-card">
            <div className="canvas-header">
              <div className="canvas-title-group">
                <span className="canvas-title">
                  GEOMETRIC CONSTRAINT SPACE: {regType === 'l1' ? 'L1 DIAMOND (|w1| + |w2| ≤ C)' : 'L2 CIRCLE (w1² + w2² ≤ C²)'}
                </span>
                <span className="canvas-sub">
                  Budget C = {constraintBudget.toFixed(2)} • Optimum: ({geomSolution.w1.toFixed(2)}, {geomSolution.w2.toFixed(2)})
                </span>
              </div>
              <div className="status-pill badge-optimal">
                <span>{geomSolution.isCorner ? 'CORNER TANGENCY (w2 = 0)' : 'SMOOTH TANGENCY (w1 > 0, w2 > 0)'}</span>
              </div>
            </div>

            <div className="svg-stage" style={{ height: '380px' }}>
              <svg viewBox="0 0 400 400" className="sim-svg" role="img" aria-label="Geometric contour tangency">
                {/* Axes w1 and w2 */}
                <line x1={mapGeomX(-0.5)} y1={mapGeomY(0)} x2={mapGeomX(2.2)} y2={mapGeomY(0)} stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
                <line x1={mapGeomX(0)} y1={mapGeomY(-0.5)} x2={mapGeomX(0)} y2={mapGeomY(2.2)} stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />

                {/* Axis Labels */}
                <text x={mapGeomX(2.1)} y={mapGeomY(0) - 8} fill="var(--text-muted)" fontSize="11" fontFamily="var(--font-mono)">w1</text>
                <text x={mapGeomX(0) + 8} y={mapGeomY(2.1)} fill="var(--text-muted)" fontSize="11" fontFamily="var(--font-mono)">w2</text>

                {/* Unconstrained Optimum w* (1.6, 1.3) */}
                <circle cx={mapGeomX(W_STAR.w1)} cy={mapGeomY(W_STAR.w2)} r="5" fill="var(--accent-amber)" />
                <text x={mapGeomX(W_STAR.w1) + 8} y={mapGeomY(W_STAR.w2) + 4} fill="var(--accent-amber)" fontSize="10" fontFamily="var(--font-mono)">
                  w* (Unconstrained)
                </text>

                {/* Loss Ellipses expanding from w* */}
                {[0.3, 0.6, 0.9, 1.3, 1.8].map((r, i) => (
                  <ellipse
                    key={i}
                    cx={mapGeomX(W_STAR.w1)}
                    cy={mapGeomY(W_STAR.w2)}
                    rx={r * 45}
                    ry={r * 28}
                    fill="none"
                    stroke="rgba(255, 184, 108, 0.25)"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                    transform={`rotate(-25, ${mapGeomX(W_STAR.w1)}, ${mapGeomY(W_STAR.w2)})`}
                  />
                ))}

                {/* L1 Diamond Constraint Boundary: |w1| + |w2| <= C */}
                {regType === 'l1' && (
                  <polygon
                    points={`
                      ${mapGeomX(constraintBudget)},${mapGeomY(0)}
                      ${mapGeomX(0)},${mapGeomY(constraintBudget)}
                      ${mapGeomX(-constraintBudget)},${mapGeomY(0)}
                      ${mapGeomX(0)},${mapGeomY(-constraintBudget)}
                    `}
                    fill="rgba(94, 217, 208, 0.12)"
                    stroke="var(--accent-cyan)"
                    strokeWidth="2.5"
                  />
                )}

                {/* L2 Circle Constraint Boundary: w1^2 + w2^2 <= C^2 */}
                {regType === 'l2' && (
                  <circle
                    cx={mapGeomX(0)}
                    cy={mapGeomY(0)}
                    r={constraintBudget * (320 / 2.7)}
                    fill="rgba(159, 140, 255, 0.12)"
                    stroke="var(--accent-violet)"
                    strokeWidth="2.5"
                  />
                )}

                {/* Tangency / Constrained Solution Point */}
                <circle
                  cx={mapGeomX(geomSolution.w1)}
                  cy={mapGeomY(geomSolution.w2)}
                  r="7"
                  fill={regType === 'l1' ? 'var(--accent-cyan)' : 'var(--accent-violet)'}
                  stroke="#090c17"
                  strokeWidth="2.5"
                  style={{
                    filter:
                      regType === 'l1'
                        ? 'drop-shadow(0 0 8px var(--accent-cyan))'
                        : 'drop-shadow(0 0 8px var(--accent-violet))',
                  }}
                />

                <text
                  x={mapGeomX(geomSolution.w1) + 10}
                  y={mapGeomY(geomSolution.w2) - 8}
                  fill={regType === 'l1' ? 'var(--accent-cyan)' : 'var(--accent-violet)'}
                  fontSize="11"
                  fontFamily="var(--font-mono)"
                  fontWeight="600"
                >
                  w_reg ({geomSolution.w1.toFixed(2)}, {geomSolution.w2.toFixed(2)})
                </text>
              </svg>
            </div>

            <div className="canvas-legend">
              <div className="legend-entry">
                <span className="dot dot-amber" />
                <span>Loss Contours J(w1, w2) centered at w*</span>
              </div>
              <div className="legend-entry">
                <span className="dot" style={{ background: regType === 'l1' ? 'var(--accent-cyan)' : 'var(--accent-violet)' }} />
                <span>{regType === 'l1' ? 'L1 Diamond Constraint Region' : 'L2 Spherical Constraint Region'}</span>
              </div>
              <div className="legend-entry">
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Notice: L1 contacts the corner on the axis (setting w2 = 0), producing sparsity!
                </span>
              </div>
            </div>
          </div>

          <div className="sim-controls-card">
            <h4 className="controls-title">Constraint Budget & Geometry</h4>

            <div className="control-slider-block">
              <div className="slider-row-header">
                <span>CONSTRAINT RADIUS (C)</span>
                <span className="slider-num">{constraintBudget.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.3"
                max="1.9"
                step="0.05"
                value={constraintBudget}
                onChange={(e) => setConstraintBudget(Number(e.target.value))}
                className="sim-range"
              />
              <div className="slider-ticks">
                <span>0.3 (Strict)</span>
                <span>1.1</span>
                <span>1.9 (Loose)</span>
              </div>
            </div>

            <div
              style={{
                marginTop: '1.5rem',
                padding: '1.1rem',
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '8px',
                borderLeft: `3px solid ${regType === 'l1' ? 'var(--accent-cyan)' : 'var(--accent-violet)'}`,
              }}
            >
              <b
                style={{
                  display: 'block',
                  color: regType === 'l1' ? 'var(--accent-cyan)' : 'var(--accent-violet)',
                  fontSize: '0.82rem',
                  marginBottom: '6px',
                }}
              >
                WHY DOES L1 CAUSE SPARSITY?
              </b>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                {regType === 'l1'
                  ? 'The L1 norm has sharp pointy corners situated directly along the coordinate axes. As the elliptical loss contours expand from w*, they almost always touch one of these sharp corners first. At any corner, the other coordinates are exactly 0.000!'
                  : 'The L2 circle has smooth, curved surfaces everywhere. The expanding loss contours make contact tangentially at a point that lies somewhere in the interior quadrant. Both w1 and w2 are shrunk towards zero, but neither is forced exactly to 0.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
