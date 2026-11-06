import React, { useState, useMemo } from 'react';
import {
  generateRegressionData,
  fitPolynomial,
  evaluatePolynomial,
  computeMSE,
  groundTruthFn,
  generate2DClassification,
  predict2D,
} from '../utils/mathUtils';
import type { ClassificationPoint } from '../utils/mathUtils';
import { AlertTriangle, CheckCircle, Sliders, Layers, RefreshCw } from 'lucide-react';

export const OverfittingLab: React.FC = () => {
  const [mode, setMode] = useState<'1d-regression' | '2d-classification'>('1d-regression');

  // 1D Regression state
  const [degree, setDegree] = useState<number>(3);
  const [numSamples, setNumSamples] = useState<number>(20);
  const [noise, setNoise] = useState<number>(0.2);
  const [showGroundTruth, setShowGroundTruth] = useState<boolean>(true);
  const [showTestPoints, setShowTestPoints] = useState<boolean>(true);
  const [seed, setSeed] = useState<number>(0);

  // 2D Classification state
  const [datasetType, setDatasetType] = useState<'circles' | 'moons' | 'xor'>('circles');
  const [complexity2D, setComplexity2D] = useState<'linear' | 'moderate' | 'complex'>('moderate');

  // Generate 1D Data and fit polynomial
  const { trainPoints, testPoints } = useMemo(() => {
    void seed;
    return generateRegressionData(numSamples, noise);
  }, [numSamples, noise, seed]);

  const coeffs = useMemo(() => {
    return fitPolynomial(trainPoints, degree, 0);
  }, [trainPoints, degree]);

  const trainMSE = useMemo(() => computeMSE(trainPoints, coeffs), [trainPoints, coeffs]);
  const testMSE = useMemo(() => computeMSE(testPoints, coeffs), [testPoints, coeffs]);
  const generalizationGap = Math.max(0, testMSE - trainMSE);

  // Status diagnostics
  const statusInfo = useMemo(() => {
    if (trainMSE > 0.18) {
      return {
        label: 'UNDERFITTING (HIGH BIAS)',
        color: 'var(--accent-amber)',
        badgeClass: 'badge-underfit',
        message: 'Both training and test error are high. The model capacity is too rigid to capture the true underlying wave.',
        icon: AlertTriangle,
      };
    }
    if (generalizationGap > 0.14 || testMSE > trainMSE * 2.8) {
      return {
        label: 'OVERFITTING (HIGH VARIANCE)',
        color: 'var(--accent-rose)',
        badgeClass: 'badge-overfit',
        message: 'Low training error, but test error is skyrocketing! The model memorized noise outliers instead of the signal.',
        icon: AlertTriangle,
      };
    }
    return {
      label: 'OPTIMAL FIT (SWEET SPOT)',
      color: 'var(--accent-emerald)',
      badgeClass: 'badge-optimal',
      message: 'Excellent generalization! The model captures the underlying physics without fitting random noise.',
      icon: CheckCircle,
    };
  }, [trainMSE, testMSE, generalizationGap]);

  // Presets
  const applyPreset = (preset: 'underfit' | 'optimal' | 'overfit' | 'bigdata') => {
    if (preset === 'underfit') {
      setDegree(1);
      setNumSamples(20);
      setNoise(0.25);
    } else if (preset === 'optimal') {
      setDegree(3);
      setNumSamples(25);
      setNoise(0.2);
    } else if (preset === 'overfit') {
      setDegree(12);
      setNumSamples(14);
      setNoise(0.3);
    } else if (preset === 'bigdata') {
      setDegree(10);
      setNumSamples(60);
      setNoise(0.2);
    }
  };

  // 1D SVG Coordinate mapping: X in [-1.05, 1.05] -> [25, 475], Y in [-1.8, 1.8] -> [335, 25]
  const mapX = (x: number) => 25 + ((x + 1.05) / 2.1) * 450;
  const mapY = (y: number) => {
    const clampedY = Math.max(-1.85, Math.min(1.85, y));
    return 335 - ((clampedY + 1.85) / 3.7) * 310;
  };

  const fittedCurvePath = useMemo(() => {
    const segments: string[] = [];
    const steps = 160;
    for (let i = 0; i <= steps; i++) {
      const x = -1 + (2 * i) / steps;
      const y = evaluatePolynomial(coeffs, x);
      const px = mapX(x);
      const py = mapY(y);
      if (i === 0) segments.push(`M ${px.toFixed(1)},${py.toFixed(1)}`);
      else segments.push(`L ${px.toFixed(1)},${py.toFixed(1)}`);
    }
    return segments.join(' ');
  }, [coeffs]);

  const groundTruthPath = useMemo(() => {
    const segments: string[] = [];
    const steps = 160;
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

  // 2D Classification Points
  const points2D: ClassificationPoint[] = useMemo(() => {
    return generate2DClassification(datasetType, 90, 0.16);
  }, [datasetType]);

  const grid2D = useMemo(() => {
    const cells: { x: number; y: number; prob: number }[] = [];
    const res = 22;
    for (let i = 0; i < res; i++) {
      for (let j = 0; j < res; j++) {
        const x = -1.2 + (2.4 * i) / (res - 1);
        const y = -1.2 + (2.4 * j) / (res - 1);
        const prob = predict2D(x, y, points2D, complexity2D);
        cells.push({ x, y, prob });
      }
    }
    return cells;
  }, [points2D, complexity2D]);

  return (
    <div className="sim-container">
      {/* Simulation Header */}
      <div className="sim-subnav">
        <div className="subnav-left">
          <button
            className={`subnav-pill ${mode === '1d-regression' ? 'active' : ''}`}
            onClick={() => setMode('1d-regression')}
          >
            <Sliders size={15} /> 1D Function Fitting Simulation
          </button>
          <button
            className={`subnav-pill ${mode === '2d-classification' ? 'active' : ''}`}
            onClick={() => setMode('2d-classification')}
          >
            <Layers size={15} /> 2D Decision Boundary Simulation
          </button>
        </div>

        {mode === '1d-regression' && (
          <button className="subnav-action-btn" onClick={() => setSeed((s) => s + 1)} title="Resample noisy dataset">
            <RefreshCw size={13} /> Resample Noise
          </button>
        )}
      </div>

      {/* ===================================================================== */}
      {/* MODE 1: 1D REGRESSION SIMULATOR */}
      {/* ===================================================================== */}
      {mode === '1d-regression' && (
        <div className="sim-grid">
          {/* Main Canvas Viewport */}
          <div className="sim-canvas-card">
            <div className="canvas-header">
              <div className="canvas-title-group">
                <span className="canvas-title">POLYNOMIAL DEGREE d = {degree}</span>
                <span className="canvas-sub">N = {numSamples} points • Noise σ = {noise.toFixed(2)}</span>
              </div>
              <div className={`status-pill ${statusInfo.badgeClass}`}>
                <statusInfo.icon size={14} />
                <span>{statusInfo.label}</span>
              </div>
            </div>

            <div className="svg-stage">
              <svg viewBox="0 0 500 360" className="sim-svg" role="img" aria-label="1D Regression Curve">
                {/* Subtle Grid */}
                <line x1="25" y1="180" x2="475" y2="180" stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
                <line x1="250" y1="25" x2="250" y2="335" stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />

                {/* Ground Truth Function f(x) */}
                {showGroundTruth && (
                  <path
                    d={groundTruthPath}
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.35)"
                    strokeWidth="2.5"
                    strokeDasharray="5 5"
                  />
                )}

                {/* Fitted Hypothesis Curve h(x) */}
                <path
                  d={fittedCurvePath}
                  fill="none"
                  stroke={statusInfo.color}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  style={{
                    filter: `drop-shadow(0 0 8px ${statusInfo.color})`,
                    transition: 'stroke 0.25s',
                  }}
                />

                {/* Unseen Test Points (Gold) */}
                {showTestPoints &&
                  testPoints.map((p, i) => (
                    <circle
                      key={`test-${i}`}
                      cx={mapX(p.x)}
                      cy={mapY(p.y)}
                      r="3.5"
                      fill="var(--accent-amber)"
                      opacity="0.85"
                      stroke="#090c17"
                      strokeWidth="1.2"
                    />
                  ))}

                {/* Training Points (Cyan) with Residual Error Drops */}
                {trainPoints.map((p, i) => {
                  const predY = evaluatePolynomial(coeffs, p.x);
                  return (
                    <g key={`train-${i}`}>
                      <line
                        x1={mapX(p.x)}
                        y1={mapY(p.y)}
                        x2={mapX(p.x)}
                        y2={mapY(predY)}
                        stroke="rgba(94, 217, 208, 0.3)"
                        strokeWidth="1.5"
                      />
                      <circle
                        cx={mapX(p.x)}
                        cy={mapY(p.y)}
                        r="5.5"
                        fill="var(--accent-cyan)"
                        stroke="#090c17"
                        strokeWidth="2"
                        style={{ filter: 'drop-shadow(0 0 5px rgba(94, 217, 208, 0.8))' }}
                      />
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Canvas Legend */}
            <div className="canvas-legend">
              <div className="legend-entry">
                <span className="dot dot-cyan" />
                <span>Training Samples (N = {trainPoints.length})</span>
              </div>
              {showTestPoints && (
                <div className="legend-entry">
                  <span className="dot dot-amber" />
                  <span>Unseen Test Set (N = {testPoints.length})</span>
                </div>
              )}
              {showGroundTruth && (
                <div className="legend-entry">
                  <span className="dash-line" />
                  <span>True Reality f(x)</span>
                </div>
              )}
              <div className="legend-entry">
                <span className="solid-line" style={{ background: statusInfo.color }} />
                <span>Model Fit h(x)</span>
              </div>
            </div>

            {/* Live Metrics Row */}
            <div className="sim-metrics-bar">
              <div className="metric-box">
                <div className="metric-label">TRAIN ERROR (MSE)</div>
                <div className="metric-val text-white">{trainMSE.toFixed(4)}</div>
                <small className="metric-sub">Loss on observed data</small>
              </div>

              <div className="metric-box">
                <div className="metric-label">TEST ERROR (MSE)</div>
                <div className="metric-val" style={{ color: statusInfo.color }}>
                  {testMSE.toFixed(4)}
                </div>
                <small className="metric-sub">Loss on unseen data</small>
              </div>

              <div className="metric-box">
                <div className="metric-label">GENERALIZATION GAP</div>
                <div
                  className="metric-val"
                  style={{
                    color: generalizationGap > 0.12 ? 'var(--accent-rose)' : 'var(--accent-emerald)',
                  }}
                >
                  +{generalizationGap.toFixed(4)}
                </div>
                <small className="metric-sub">|Test - Train|</small>
              </div>

              <div className="metric-box metric-analysis" style={{ borderLeftColor: statusInfo.color }}>
                <b style={{ color: statusInfo.color, fontSize: '0.85rem' }}>{statusInfo.label}</b>
                <p>{statusInfo.message}</p>
              </div>
            </div>
          </div>

          {/* Controls Column */}
          <div className="sim-controls-card">
            <h4 className="controls-title">Quick Preset Scenarios</h4>
            <div className="presets-list">
              <button className="preset-item" onClick={() => applyPreset('underfit')}>
                <div className="preset-name">📉 Severe Underfitting</div>
                <div className="preset-desc">Degree 1 (Line) • High Bias, cannot capture curves</div>
              </button>
              <button className="preset-item" onClick={() => applyPreset('optimal')}>
                <div className="preset-name">🎯 Optimal Fit (Sweet Spot)</div>
                <div className="preset-desc">Degree 3 (Cubic) • Balances bias and variance</div>
              </button>
              <button className="preset-item" onClick={() => applyPreset('overfit')}>
                <div className="preset-name">🎢 Wild Overfitting</div>
                <div className="preset-desc">Degree 12, Few Data • High Variance, memorizes noise</div>
              </button>
              <button className="preset-item" onClick={() => applyPreset('bigdata')}>
                <div className="preset-name">📊 Constrained by More Data</div>
                <div className="preset-desc">Degree 10, N = 60 • Large sample size tames variance</div>
              </button>
            </div>

            <h4 className="controls-title" style={{ marginTop: '1.25rem' }}>Interactive Controls</h4>

            {/* Polynomial Degree Slider */}
            <div className="control-slider-block">
              <div className="slider-row-header">
                <span>MODEL CAPACITY (DEGREE d)</span>
                <span className="slider-num">{degree}</span>
              </div>
              <input
                type="range"
                min="1"
                max="14"
                step="1"
                value={degree}
                onChange={(e) => setDegree(Number(e.target.value))}
                className="sim-range"
              />
              <div className="slider-ticks">
                <span>1 (Linear)</span>
                <span>3 (Cubic)</span>
                <span>8 (High)</span>
                <span>14 (Extreme)</span>
              </div>
            </div>

            {/* Training Samples Slider */}
            <div className="control-slider-block">
              <div className="slider-row-header">
                <span>TRAINING SAMPLES (N)</span>
                <span className="slider-num">{numSamples} pts</span>
              </div>
              <input
                type="range"
                min="8"
                max="60"
                step="2"
                value={numSamples}
                onChange={(e) => setNumSamples(Number(e.target.value))}
                className="sim-range"
              />
              <div className="slider-ticks">
                <span>8 (Sparse)</span>
                <span>30</span>
                <span>60 (Dense)</span>
              </div>
            </div>

            {/* Noise Level Slider */}
            <div className="control-slider-block">
              <div className="slider-row-header">
                <span>NOISE LEVEL (σ)</span>
                <span className="slider-num">{noise.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="0.6"
                step="0.05"
                value={noise}
                onChange={(e) => setNoise(Number(e.target.value))}
                className="sim-range"
              />
              <div className="slider-ticks">
                <span>0.0 (Pure)</span>
                <span>0.3</span>
                <span>0.6 (Heavy)</span>
              </div>
            </div>

            {/* Checkbox Toggles */}
            <div className="toggles-list">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={showGroundTruth}
                  onChange={(e) => setShowGroundTruth(e.target.checked)}
                />
                <span>Show Ground Truth Reality f(x)</span>
              </label>
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={showTestPoints}
                  onChange={(e) => setShowTestPoints(e.target.checked)}
                />
                <span>Show Unseen Test Points</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODE 2: 2D CLASSIFICATION SIMULATOR */}
      {/* ===================================================================== */}
      {mode === '2d-classification' && (
        <div className="sim-grid">
          <div className="sim-canvas-card">
            <div className="canvas-header">
              <div className="canvas-title-group">
                <span className="canvas-title">2D DECISION BOUNDARY: {complexity2D.toUpperCase()}</span>
                <span className="canvas-sub">Dataset: {datasetType} • Shading: P(y=1 | x1, x2)</span>
              </div>
              <div className="status-pill badge-optimal">
                <span>2D CONTOUR SIMULATION</span>
              </div>
            </div>

            <div className="svg-stage" style={{ height: '380px' }}>
              <svg viewBox="0 0 400 400" className="sim-svg" role="img" aria-label="2D Decision Surface">
                {/* Background heat grid */}
                {grid2D.map((c, i) => {
                  const px = ((c.x + 1.2) / 2.4) * 400;
                  const py = 400 - ((c.y + 1.2) / 2.4) * 400;
                  const w = 400 / 21;
                  const h = 400 / 21;
                  const fill =
                    c.prob > 0.5
                      ? `rgba(94, 217, 208, ${((c.prob - 0.5) * 0.45).toFixed(2)})`
                      : `rgba(255, 107, 129, ${((0.5 - c.prob) * 0.45).toFixed(2)})`;
                  return <rect key={i} x={px - w / 2} y={py - h / 2} width={w} height={h} fill={fill} />;
                })}

                {/* 2D Data Points */}
                {points2D.map((p, i) => {
                  const cx = ((p.x + 1.2) / 2.4) * 400;
                  const cy = 400 - ((p.y + 1.2) / 2.4) * 400;
                  const isClassOne = p.label === 1;
                  return (
                    <circle
                      key={i}
                      cx={cx}
                      cy={cy}
                      r="5.5"
                      fill={isClassOne ? 'var(--accent-cyan)' : 'var(--accent-rose)'}
                      stroke="#090c17"
                      strokeWidth="1.5"
                      style={{
                        filter: isClassOne
                          ? 'drop-shadow(0 0 5px rgba(94, 217, 208, 0.8))'
                          : 'drop-shadow(0 0 5px rgba(255, 107, 129, 0.8))',
                      }}
                    />
                  );
                })}
              </svg>
            </div>

            <div className="canvas-legend">
              <div className="legend-entry">
                <span className="dot dot-cyan" />
                <span>Class 1 (Inside Target)</span>
              </div>
              <div className="legend-entry">
                <span className="dot dot-rose" />
                <span>Class 0 (Outside Target)</span>
              </div>
              <div className="legend-entry">
                <span style={{ fontSize: '0.76rem', color: 'var(--text-dim)' }}>
                  Boundary marks threshold P = 0.50
                </span>
              </div>
            </div>
          </div>

          <div className="sim-controls-card">
            <h4 className="controls-title">1. Dataset Geometry</h4>
            <div className="presets-list">
              <button
                className={`preset-item ${datasetType === 'circles' ? 'active' : ''}`}
                onClick={() => setDatasetType('circles')}
              >
                <div className="preset-name">Concentric Rings (Donut)</div>
                <div className="preset-desc">Inner circle vs outer ring</div>
              </button>
              <button
                className={`preset-item ${datasetType === 'moons' ? 'active' : ''}`}
                onClick={() => setDatasetType('moons')}
              >
                <div className="preset-name">Interlocking Moons</div>
                <div className="preset-desc">Two interleaved crescents</div>
              </button>
              <button
                className={`preset-item ${datasetType === 'xor' ? 'active' : ''}`}
                onClick={() => setDatasetType('xor')}
              >
                <div className="preset-name">Noisy XOR Quadrants</div>
                <div className="preset-desc">Four quadrants with parity</div>
              </button>
            </div>

            <h4 className="controls-title" style={{ marginTop: '1.25rem' }}>2. Model Capacity</h4>
            <div className="presets-list">
              <button
                className={`preset-item ${complexity2D === 'linear' ? 'active' : ''}`}
                onClick={() => setComplexity2D('linear')}
              >
                <div className="preset-name" style={{ color: 'var(--accent-amber)' }}>
                  📉 Linear (Underfitting)
                </div>
                <div className="preset-desc">Rigid straight hyper-plane. Completely fails non-linear patterns.</div>
              </button>
              <button
                className={`preset-item ${complexity2D === 'moderate' ? 'active' : ''}`}
                onClick={() => setComplexity2D('moderate')}
              >
                <div className="preset-name" style={{ color: 'var(--accent-emerald)' }}>
                  🎯 Non-Linear Smooth (Optimal)
                </div>
                <div className="preset-desc">Graceful boundary encircling the cluster, ignoring random noise.</div>
              </button>
              <button
                className={`preset-item ${complexity2D === 'complex' ? 'active' : ''}`}
                onClick={() => setComplexity2D('complex')}
              >
                <div className="preset-name" style={{ color: 'var(--accent-rose)' }}>
                  🎢 Hyper-Wiggly (Overfitting)
                </div>
                <div className="preset-desc">Carves out absurd little islands around single isolated noise points.</div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
