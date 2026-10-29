import React, { useState, useMemo, useEffect } from 'react';
import {
  generateRegressionData,
  fitPolynomial,
  evaluatePolynomial,
  computeMSE,
  groundTruthFn,
  generate2DClassification,
  predict2D,
  generateEpochCurves,
} from '../utils/mathUtils';
import type { ClassificationPoint } from '../utils/mathUtils';
import { Play, Pause, RotateCcw, AlertTriangle, CheckCircle, Sliders, Layers, Activity } from 'lucide-react';

interface InteractiveLabProps {
  resetKey: number;
}

export const InteractiveLab: React.FC<InteractiveLabProps> = ({ resetKey }) => {
  const [activeTab, setActiveTab] = useState<'regression' | 'classification' | 'epochs'>('regression');

  // 1D Regression state
  const [degree, setDegree] = useState<number>(3);
  const [numSamples, setNumSamples] = useState<number>(20);
  const [noise, setNoise] = useState<number>(0.2);
  const [lambda, setLambda] = useState<number>(0.0);
  const [showGroundTruth, setShowGroundTruth] = useState<boolean>(true);
  const [showTestPoints, setShowTestPoints] = useState<boolean>(true);

  // 2D Classification state
  const [datasetType, setDatasetType] = useState<'circles' | 'moons' | 'xor'>('circles');
  const [complexity2D, setComplexity2D] = useState<'linear' | 'moderate' | 'complex'>('moderate');

  // Epoch simulation state
  const [epochIndex, setEpochIndex] = useState<number>(25);
  const [isPlayingEpochs, setIsPlayingEpochs] = useState<boolean>(false);
  const [epochRegime, setEpochRegime] = useState<'underfit' | 'optimal' | 'overfit'>('overfit');

  // Reset to defaults when parent reset button is clicked
  useEffect(() => {
    setDegree(3);
    setNumSamples(20);
    setNoise(0.2);
    setLambda(0.0);
    setShowGroundTruth(true);
    setShowTestPoints(true);
    setDatasetType('circles');
    setComplexity2D('moderate');
    setEpochIndex(25);
    setIsPlayingEpochs(false);
  }, [resetKey]);

  // Generate 1D Data and fit polynomial
  const { trainPoints, testPoints } = useMemo(() => {
    return generateRegressionData(numSamples, noise);
  }, [numSamples, noise]);

  const coeffs = useMemo(() => {
    return fitPolynomial(trainPoints, degree, lambda);
  }, [trainPoints, degree, lambda]);

  const trainMSE = useMemo(() => computeMSE(trainPoints, coeffs), [trainPoints, coeffs]);
  const testMSE = useMemo(() => computeMSE(testPoints, coeffs), [testPoints, coeffs]);
  const generalizationGap = Math.max(0, testMSE - trainMSE);

  // Status diagnostics
  const statusInfo = useMemo(() => {
    if (trainMSE > 0.18) {
      return {
        label: 'UNDERFITTING (HIGH BIAS)',
        color: 'var(--accent-amber)',
        message: 'Both training and test errors are high. The model is too simple to capture the underlying wave.',
        icon: AlertTriangle,
      };
    }
    if (generalizationGap > 0.15 || testMSE > trainMSE * 3) {
      return {
        label: 'OVERFITTING (HIGH VARIANCE)',
        color: 'var(--accent-rose)',
        message: 'The model has memorized noise. Low training error, but test error is skyrocketing!',
        icon: AlertTriangle,
      };
    }
    return {
      label: 'OPTIMAL FIT (SWEET SPOT)',
      color: 'var(--accent-emerald)',
      message: 'Great generalization! The model captures the signal without overreacting to noise.',
      icon: CheckCircle,
    };
  }, [trainMSE, testMSE, generalizationGap]);

  // Preset Scenario Handlers
  const applyPreset = (preset: 'underfit' | 'optimal' | 'overfit' | 'regularized' | 'bigdata') => {
    if (preset === 'underfit') {
      setDegree(1);
      setLambda(0);
      setNumSamples(20);
      setNoise(0.25);
    } else if (preset === 'optimal') {
      setDegree(3);
      setLambda(0.001);
      setNumSamples(25);
      setNoise(0.2);
    } else if (preset === 'overfit') {
      setDegree(12);
      setLambda(0);
      setNumSamples(14);
      setNoise(0.3);
    } else if (preset === 'regularized') {
      setDegree(12);
      setLambda(0.08); // High lambda rescues high degree
      setNumSamples(14);
      setNoise(0.3);
    } else if (preset === 'bigdata') {
      setDegree(10);
      setLambda(0);
      setNumSamples(60); // High sample count constrains overfit
      setNoise(0.2);
    }
  };

  // 1D SVG Coordinate mapping: X in [-1.05, 1.05] -> [20, 480], Y in [-1.8, 1.8] -> [320, 20]
  const mapX = (x: number) => 20 + ((x + 1.05) / 2.1) * 460;
  const mapY = (y: number) => {
    const clampedY = Math.max(-1.8, Math.min(1.8, y));
    return 340 - ((clampedY + 1.8) / 3.6) * 320;
  };

  // Generate SVG path strings
  const fittedCurvePath = useMemo(() => {
    const segments: string[] = [];
    const steps = 150;
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

  // 2D Classification Points
  const points2D: ClassificationPoint[] = useMemo(() => {
    return generate2DClassification(datasetType, 90, 0.15);
  }, [datasetType]);

  // 2D Classification Grid Map
  const grid2D = useMemo(() => {
    const cells: { x: number; y: number; prob: number }[] = [];
    const res = 20;
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

  // Epoch curves
  const epochData = useMemo(() => generateEpochCurves(60), []);

  // Epoch playback animation timer
  useEffect(() => {
    let timer: number;
    if (isPlayingEpochs) {
      timer = window.setInterval(() => {
        setEpochIndex((prev) => (prev >= 60 ? 1 : prev + 1));
      }, 140);
    }
    return () => clearInterval(timer);
  }, [isPlayingEpochs]);

  return (
    <section className="section lab-section" id="lab">
      <div className="section-heading">
        <div>
          <p className="eyebrow">
            <span className="eyebrow-line" /> 03 / THE SIGNAL STUDIO
          </p>
          <h2>Feel the math in motion.</h2>
        </div>
        <p>
          Adjust model capacity, sample size, and regularization in real time. Watch how
          overfitting and underfitting physically manifest on curves and decision boundaries.
        </p>
      </div>

      {/* Lab Tabs */}
      <div className="lab-tabs">
        <button
          className={`lab-tab-btn ${activeTab === 'regression' ? 'active' : ''}`}
          onClick={() => setActiveTab('regression')}
        >
          <Sliders size={16} /> 1. Polynomial Curve Fitting Lab
        </button>
        <button
          className={`lab-tab-btn ${activeTab === 'classification' ? 'active' : ''}`}
          onClick={() => setActiveTab('classification')}
        >
          <Layers size={16} /> 2. 2D Decision Boundary Lab
        </button>
        <button
          className={`lab-tab-btn ${activeTab === 'epochs' ? 'active' : ''}`}
          onClick={() => setActiveTab('epochs')}
        >
          <Activity size={16} /> 3. Epochs & Early Stopping Simulator
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: 1D POLYNOMIAL REGRESSION LAB */}
      {/* ========================================================================= */}
      {activeTab === 'regression' && (
        <div className="lab-grid">
          <div className="lab-visualizer">
            <div className="visualizer-topline">
              <span className="hero-art-title">POLYNOMIAL DEGREE {degree} • REGULARIZATION λ = {lambda.toFixed(3)}</span>
              <span className="live-badge">
                <span className="pulse-indicator" /> LIVE SOLVER
              </span>
            </div>

            <div className="svg-plot-container">
              <svg viewBox="0 0 500 360" role="img" aria-label="Polynomial curve fitting canvas">
                {/* Axis lines */}
                <line x1="20" y1="180" x2="480" y2="180" stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
                <line x1="250" y1="20" x2="250" y2="340" stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />

                {/* Ground Truth True Signal (dashed) */}
                {showGroundTruth && (
                  <path
                    d={groundTruthPath}
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.3)"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                  />
                )}

                {/* Fitted Model Curve */}
                <path
                  d={fittedCurvePath}
                  fill="none"
                  stroke={statusInfo.color}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  style={{
                    transition: 'stroke 0.3s',
                    filter: `drop-shadow(0 0 8px ${statusInfo.color})`,
                  }}
                />

                {/* Unseen Test Points (Gold/Amber) */}
                {showTestPoints &&
                  testPoints.map((p, i) => (
                    <circle
                      key={`test-${i}`}
                      cx={mapX(p.x)}
                      cy={mapY(p.y)}
                      r="4"
                      fill="var(--accent-amber)"
                      opacity="0.8"
                      stroke="#090c17"
                      strokeWidth="1.5"
                    />
                  ))}

                {/* Training Points (Cyan) */}
                {trainPoints.map((p, i) => {
                  const predY = evaluatePolynomial(coeffs, p.x);
                  return (
                    <g key={`train-${i}`}>
                      {/* Residual Error Line */}
                      <line
                        x1={mapX(p.x)}
                        y1={mapY(p.y)}
                        x2={mapX(p.x)}
                        y2={mapY(predY)}
                        stroke="rgba(94, 217, 208, 0.25)"
                        strokeWidth="1.5"
                      />
                      <circle
                        cx={mapX(p.x)}
                        cy={mapY(p.y)}
                        r="5.5"
                        fill="var(--accent-cyan)"
                        stroke="#090c17"
                        strokeWidth="2"
                        style={{ filter: 'drop-shadow(0 0 4px rgba(94, 217, 208, 0.9))' }}
                      />
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Plot Legend */}
            <div className="plot-legend">
              <div className="legend-item">
                <span className="legend-dot" style={{ background: 'var(--accent-cyan)' }} />
                <span>Training Samples (N = {trainPoints.length})</span>
              </div>
              {showTestPoints && (
                <div className="legend-item">
                  <span className="legend-dot" style={{ background: 'var(--accent-amber)' }} />
                  <span>Unseen Test Data (N = {testPoints.length})</span>
                </div>
              )}
              {showGroundTruth && (
                <div className="legend-item">
                  <span className="legend-line" style={{ background: 'rgba(255,255,255,0.4)' }} />
                  <span>True Underlying Reality f(x)</span>
                </div>
              )}
              <div className="legend-item">
                <span className="legend-line" style={{ background: statusInfo.color }} />
                <span>Model Prediction Curve</span>
              </div>
            </div>

            {/* Live Metrics Dashboard */}
            <div className="metrics-row">
              <div className="metric-card">
                <span>TRAINING ERROR (MSE)</span>
                <strong style={{ color: '#fff' }}>{trainMSE.toFixed(4)}</strong>
              </div>
              <div className="metric-card">
                <span>TEST ERROR (GENERALIZATION)</span>
                <strong style={{ color: statusInfo.color }}>{testMSE.toFixed(4)}</strong>
              </div>
              <div className="metric-card">
                <span>GENERALIZATION GAP</span>
                <strong
                  style={{
                    color: generalizationGap > 0.1 ? 'var(--accent-rose)' : 'var(--accent-emerald)',
                  }}
                >
                  +{generalizationGap.toFixed(4)}
                </strong>
              </div>

              {/* Status Alert */}
              <div
                className="metric-status"
                style={{ borderColor: statusInfo.color, background: 'rgba(0,0,0,0.4)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <statusInfo.icon size={18} color={statusInfo.color} />
                  <div>
                    <b style={{ color: statusInfo.color, fontSize: '0.85rem', display: 'block' }}>
                      {statusInfo.label}
                    </b>
                    <small style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                      {statusInfo.message}
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Controls Aside */}
          <aside className="lab-controls">
            <h3 className="controls-heading">Benchmark Scenarios</h3>
            <div className="preset-strip">
              <button className="preset-btn" onClick={() => applyPreset('underfit')}>
                <span>📉 1. Severe Underfit</span>
                <small style={{ color: 'var(--accent-amber)' }}>Degree 1</small>
              </button>
              <button className="preset-btn" onClick={() => applyPreset('optimal')}>
                <span>🎯 2. Optimal Sweet Spot</span>
                <small style={{ color: 'var(--accent-emerald)' }}>Degree 3</small>
              </button>
              <button className="preset-btn" onClick={() => applyPreset('overfit')}>
                <span>🎢 3. Wild Overfitting</span>
                <small style={{ color: 'var(--accent-rose)' }}>Degree 12</small>
              </button>
              <button className="preset-btn" onClick={() => applyPreset('regularized')}>
                <span>🛡️ 4. Tamed by L2 Ridge</span>
                <small style={{ color: 'var(--accent-cyan)' }}>λ = 0.08</small>
              </button>
              <button className="preset-btn" onClick={() => applyPreset('bigdata')}>
                <span>📊 5. Tamed by More Data</span>
                <small style={{ color: 'var(--accent-violet)' }}>N = 60</small>
              </button>
            </div>

            <h3 className="controls-heading">Manual Hyperparameters</h3>

            {/* Slider 1: Polynomial Degree */}
            <div className="slider-group">
              <div className="slider-label">
                <span>POLYNOMIAL DEGREE</span>
                <strong>d = {degree}</strong>
              </div>
              <input
                className="range-input"
                type="range"
                min="1"
                max="14"
                step="1"
                value={degree}
                onChange={(e) => setDegree(Number(e.target.value))}
              />
              <div className="range-ticks">
                <span>1 (Line)</span>
                <span>3 (Cubic)</span>
                <span>8 (Complex)</span>
                <span>14 (Wild)</span>
              </div>
            </div>

            {/* Slider 2: Regularization Lambda */}
            <div className="slider-group">
              <div className="slider-label">
                <span>L2 REGULARIZATION (λ)</span>
                <strong>{lambda.toFixed(3)}</strong>
              </div>
              <input
                className="range-input"
                type="range"
                min="0"
                max="0.3"
                step="0.005"
                value={lambda}
                onChange={(e) => setLambda(Number(e.target.value))}
              />
              <div className="range-ticks">
                <span>0.0 (Unconstrained)</span>
                <span>0.05</span>
                <span>0.30 (Rigid)</span>
              </div>
            </div>

            {/* Slider 3: Dataset Size */}
            <div className="slider-group">
              <div className="slider-label">
                <span>TRAINING SAMPLES (N)</span>
                <strong>{numSamples} points</strong>
              </div>
              <input
                className="range-input"
                type="range"
                min="8"
                max="60"
                step="2"
                value={numSamples}
                onChange={(e) => setNumSamples(Number(e.target.value))}
              />
              <div className="range-ticks">
                <span>8 (Data Sparse)</span>
                <span>30</span>
                <span>60 (Dense)</span>
              </div>
            </div>

            {/* Slider 4: Noise Level */}
            <div className="slider-group">
              <div className="slider-label">
                <span>NOISE LEVEL (σ)</span>
                <strong>{noise.toFixed(2)}</strong>
              </div>
              <input
                className="range-input"
                type="range"
                min="0.0"
                max="0.6"
                step="0.05"
                value={noise}
                onChange={(e) => setNoise(Number(e.target.value))}
              />
              <div className="range-ticks">
                <span>0.0 (Pure Signal)</span>
                <span>0.3</span>
                <span>0.6 (High Noise)</span>
              </div>
            </div>

            {/* Toggles */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={showGroundTruth}
                  onChange={(e) => setShowGroundTruth(e.target.checked)}
                />
                <span>Show Ground Truth Reality f(x)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={showTestPoints}
                  onChange={(e) => setShowTestPoints(e.target.checked)}
                />
                <span>Show Unseen Test Points</span>
              </label>
            </div>
          </aside>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: 2D CLASSIFICATION DECISION BOUNDARY LAB */}
      {/* ========================================================================= */}
      {activeTab === 'classification' && (
        <div className="lab-grid">
          <div className="lab-visualizer">
            <div className="visualizer-topline">
              <span className="hero-art-title">
                2D CLASSIFICATION • {complexity2D.toUpperCase()} DECISION BOUNDARY
              </span>
              <span className="live-badge">CONTOUR LAB</span>
            </div>

            <div className="svg-plot-container" style={{ height: '400px' }}>
              <svg viewBox="0 0 400 400" role="img" aria-label="2D classification boundary">
                {/* Background heat grid */}
                {grid2D.map((c, i) => {
                  const px = ((c.x + 1.2) / 2.4) * 400;
                  const py = 400 - ((c.y + 1.2) / 2.4) * 400;
                  const w = 400 / 19;
                  const h = 400 / 19;
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

            <div className="plot-legend">
              <div className="legend-item">
                <span className="legend-dot" style={{ background: 'var(--accent-cyan)' }} />
                <span>Class 1 (Inside Target)</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ background: 'var(--accent-rose)' }} />
                <span>Class 0 (Outside Target)</span>
              </div>
              <div className="legend-item">
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  Shading indicates confidence probability P(y=1)
                </span>
              </div>
            </div>
          </div>

          <aside className="lab-controls">
            <h3 className="controls-heading">Select Dataset Pattern</h3>
            <div className="preset-strip">
              <button
                className={`preset-btn ${datasetType === 'circles' ? 'active' : ''}`}
                onClick={() => setDatasetType('circles')}
              >
                <span>Concentric Rings (Donut)</span>
              </button>
              <button
                className={`preset-btn ${datasetType === 'moons' ? 'active' : ''}`}
                onClick={() => setDatasetType('moons')}
              >
                <span>Interlocking Moons</span>
              </button>
              <button
                className={`preset-btn ${datasetType === 'xor' ? 'active' : ''}`}
                onClick={() => setDatasetType('xor')}
              >
                <span>Noisy XOR Quadrants</span>
              </button>
            </div>

            <h3 className="controls-heading">Model Decision Capacity</h3>
            <div className="preset-strip">
              <button
                className={`preset-btn ${complexity2D === 'linear' ? 'active' : ''}`}
                onClick={() => setComplexity2D('linear')}
                style={{ borderColor: complexity2D === 'linear' ? 'var(--accent-amber)' : '' }}
              >
                <div>
                  <b>1. Linear Boundary (Underfit)</b>
                  <small style={{ display: 'block', color: 'var(--text-dim)' }}>
                    Single straight hyper-plane. Completely fails on non-linear donut.
                  </small>
                </div>
              </button>

              <button
                className={`preset-btn ${complexity2D === 'moderate' ? 'active' : ''}`}
                onClick={() => setComplexity2D('moderate')}
                style={{ borderColor: complexity2D === 'moderate' ? 'var(--accent-emerald)' : '' }}
              >
                <div>
                  <b>2. Smooth Non-Linear (Optimal)</b>
                  <small style={{ display: 'block', color: 'var(--text-dim)' }}>
                    Graceful boundary enveloping the cluster, ignoring random noise.
                  </small>
                </div>
              </button>

              <button
                className={`preset-btn ${complexity2D === 'complex' ? 'active' : ''}`}
                onClick={() => setComplexity2D('complex')}
                style={{ borderColor: complexity2D === 'complex' ? 'var(--accent-rose)' : '' }}
              >
                <div>
                  <b>3. Hyper-Complex Islands (Overfit)</b>
                  <small style={{ display: 'block', color: 'var(--text-dim)' }}>
                    Creates bizarre little islands around single isolated noise points!
                  </small>
                </div>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: LIVE EPOCHS & EARLY STOPPING SIMULATOR */}
      {/* ========================================================================= */}
      {activeTab === 'epochs' && (
        <div className="lab-grid">
          <div className="lab-visualizer">
            <div className="visualizer-topline">
              <span className="hero-art-title">TRAINING PROGRESSION • EPOCH {epochIndex} / 60</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="reset-button"
                  onClick={() => setIsPlayingEpochs(!isPlayingEpochs)}
                  style={{ color: '#fff', borderColor: 'var(--accent-cyan)' }}
                >
                  {isPlayingEpochs ? <Pause size={13} /> : <Play size={13} />}
                  <span>{isPlayingEpochs ? 'Pause Training' : 'Run Training'}</span>
                </button>
                <button
                  className="reset-button"
                  onClick={() => {
                    setIsPlayingEpochs(false);
                    setEpochIndex(1);
                  }}
                >
                  <RotateCcw size={13} /> <span>Reset</span>
                </button>
              </div>
            </div>

            {/* Learning Curve Chart */}
            <div className="svg-plot-container" style={{ height: '360px' }}>
              <svg viewBox="0 0 500 320" role="img" aria-label="Loss curves over epochs">
                {/* Axes and grid */}
                <line x1="40" y1="280" x2="480" y2="280" stroke="rgba(255,255,255,0.1)" />
                <line x1="40" y1="20" x2="40" y2="280" stroke="rgba(255,255,255,0.1)" />

                {/* Optimal Early Stopping Marker (Epoch 22) */}
                {epochRegime === 'overfit' && (
                  <g>
                    <line
                      x1={40 + (22 / 60) * 440}
                      y1="20"
                      x2={40 + (22 / 60) * 440}
                      y2="280"
                      stroke="var(--accent-emerald)"
                      strokeDasharray="4 4"
                      strokeWidth="1.5"
                    />
                    <text
                      x={40 + (22 / 60) * 440 + 6}
                      y="40"
                      fill="var(--accent-emerald)"
                      fontFamily="var(--font-mono)"
                      fontSize="10"
                    >
                      EARLY STOPPING POINT (EPOCH 22)
                    </text>
                  </g>
                )}

                {/* Current Epoch Scrubber Line */}
                <line
                  x1={40 + (epochIndex / 60) * 440}
                  y1="20"
                  x2={40 + (epochIndex / 60) * 440}
                  y2="280"
                  stroke="rgba(255,255,255,0.4)"
                  strokeWidth="2"
                />

                {/* Training Loss Curve (Cyan) */}
                {(() => {
                  const points = epochData[epochRegime].train
                    .slice(0, epochIndex)
                    .map((val, i) => `${40 + ((i + 1) / 60) * 440},${280 - val * 260}`)
                    .join(' ');
                  return (
                    <polyline
                      points={points}
                      fill="none"
                      stroke="var(--accent-cyan)"
                      strokeWidth="3"
                    />
                  );
                })()}

                {/* Validation Loss Curve (Orange / Amber / Rose) */}
                {(() => {
                  const points = epochData[epochRegime].val
                    .slice(0, epochIndex)
                    .map((val, i) => `${40 + ((i + 1) / 60) * 440},${280 - val * 260}`)
                    .join(' ');
                  const valColor =
                    epochRegime === 'overfit' && epochIndex > 22
                      ? 'var(--accent-rose)'
                      : 'var(--accent-amber)';
                  return (
                    <polyline
                      points={points}
                      fill="none"
                      stroke={valColor}
                      strokeWidth="3"
                    />
                  );
                })()}
              </svg>
            </div>

            <div className="plot-legend">
              <div className="legend-item">
                <span className="legend-line" style={{ background: 'var(--accent-cyan)' }} />
                <span>Training Loss: {epochData[epochRegime].train[epochIndex - 1]}</span>
              </div>
              <div className="legend-item">
                <span className="legend-line" style={{ background: 'var(--accent-rose)' }} />
                <span>Validation Loss: {epochData[epochRegime].val[epochIndex - 1]}</span>
              </div>
            </div>

            {/* Slider to scrub epochs */}
            <div style={{ marginTop: '1.5rem' }}>
              <div className="slider-label">
                <span>SCRUB TRAINING EPOCH</span>
                <strong>Epoch {epochIndex} / 60</strong>
              </div>
              <input
                className="range-input"
                type="range"
                min="1"
                max="60"
                value={epochIndex}
                onChange={(e) => setEpochIndex(Number(e.target.value))}
              />
            </div>
          </div>

          <aside className="lab-controls">
            <h3 className="controls-heading">Select Model Architecture</h3>
            <div className="preset-strip">
              <button
                className={`preset-btn ${epochRegime === 'underfit' ? 'active' : ''}`}
                onClick={() => setEpochRegime('underfit')}
              >
                <div>
                  <b>1. Underfitting Architecture</b>
                  <small style={{ color: 'var(--accent-amber)', display: 'block' }}>
                    Both losses plateau high from early epochs.
                  </small>
                </div>
              </button>

              <button
                className={`preset-btn ${epochRegime === 'optimal' ? 'active' : ''}`}
                onClick={() => setEpochRegime('optimal')}
              >
                <div>
                  <b>2. Balanced with Dropout & L2</b>
                  <small style={{ color: 'var(--accent-emerald)', display: 'block' }}>
                    Both curves drop steadily and plateau together.
                  </small>
                </div>
              </button>

              <button
                className={`preset-btn ${epochRegime === 'overfit' ? 'active' : ''}`}
                onClick={() => setEpochRegime('overfit')}
              >
                <div>
                  <b>3. Unregularized Deep Network (Classic U-Curve)</b>
                  <small style={{ color: 'var(--accent-rose)', display: 'block' }}>
                    Train loss approaches 0, while Validation loss bounces back up!
                  </small>
                </div>
              </button>
            </div>

            <div
              style={{
                marginTop: '1.5rem',
                padding: '1.2rem',
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '8px',
                borderLeft: '3px solid var(--accent-cyan)',
              }}
            >
              <b style={{ color: 'var(--accent-cyan)', fontSize: '0.78rem', display: 'block', marginBottom: '4px' }}>
                KEY THEORETICAL TAKEAWAY:
              </b>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                {epochIndex < 22
                  ? 'Early Stage: The network is rapidly learning useful representations. Both train and validation losses drop.'
                  : epochIndex === 22
                  ? 'Optimal Checkpoint: Validation error hits the minimum. This is where Early Stopping saves the best model weights.'
                  : 'Overfitting Danger Zone: Train loss continues dropping, but the network is now memorizing sample-specific noise. Generalization error is degrading!'}
              </p>
            </div>
          </aside>
        </div>
      )}
    </section>
  );
};
