import React, { useState, useMemo, useEffect } from 'react';
import {
  generateBiasVarianceTradeoff,
  generateEpochCurves,
} from '../utils/mathUtils';
import { Scale, Play, Pause, RotateCcw, AlertTriangle } from 'lucide-react';

export const TradeoffLab: React.FC = () => {
  const [tradeoffTab, setTradeoffTab] = useState<'bias-variance' | 'epochs'>('bias-variance');

  // Bias-Variance state
  const [complexity, setComplexity] = useState<number>(3); // 1 to 12

  // Epochs state
  const [epochIndex, setEpochIndex] = useState<number>(22);
  const [isPlayingEpochs, setIsPlayingEpochs] = useState<boolean>(false);
  const [modelType, setModelType] = useState<'overfit' | 'optimal' | 'underfit'>('overfit');

  // Generate data
  const bvData = useMemo(() => generateBiasVarianceTradeoff(12), []);
  const epochData = useMemo(() => generateEpochCurves(60), []);

  // Current Bias-Variance point
  const currentBV = bvData[complexity - 1] || bvData[2];

  // Regime status for Bias-Variance
  const bvRegime = useMemo(() => {
    if (complexity <= 2) {
      return {
        label: 'UNDERFITTING REGIME (HIGH BIAS)',
        color: 'var(--accent-amber)',
        badgeClass: 'badge-underfit',
        desc: 'Model capacity is too small. The model under-represents the pattern, causing large systematic errors.',
      };
    }
    if (complexity >= 6) {
      return {
        label: 'OVERFITTING REGIME (HIGH VARIANCE)',
        color: 'var(--accent-rose)',
        badgeClass: 'badge-overfit',
        desc: 'Model capacity is excessively high. Small fluctuations in training data create massive swings in predictions.',
      };
    }
    return {
      label: 'OPTIMAL TRADEOFF (SWEET SPOT)',
      color: 'var(--accent-emerald)',
      badgeClass: 'badge-optimal',
      desc: 'The optimal complexity where Total Expected Error is minimized. Bias and Variance are harmoniously balanced.',
    };
  }, [complexity]);

  // Epoch animation timer
  useEffect(() => {
    let timer: number;
    if (isPlayingEpochs) {
      timer = window.setInterval(() => {
        setEpochIndex((prev) => (prev >= 60 ? 1 : prev + 1));
      }, 130);
    }
    return () => clearInterval(timer);
  }, [isPlayingEpochs]);

  // SVG coordinate mapping for Bias-Variance plot:
  // Complexity: 1 to 12 -> X: 45 to 455
  // Error: 0 to 1.35 -> Y: 300 to 30
  const mapBVX = (c: number) => 45 + ((c - 1) / 11) * 410;
  const mapBVY = (err: number) => {
    const clamped = Math.max(0, Math.min(1.35, err));
    return 300 - (clamped / 1.35) * 270;
  };

  // SVG polyline strings
  const biasSqPoints = bvData.map((d) => `${mapBVX(d.complexity)},${mapBVY(d.biasSq)}`).join(' ');
  const variancePoints = bvData.map((d) => `${mapBVX(d.complexity)},${mapBVY(d.variance)}`).join(' ');
  const totalErrorPoints = bvData.map((d) => `${mapBVX(d.complexity)},${mapBVY(d.totalError)}`).join(' ');
  const noiseY = mapBVY(0.08);

  // SVG coordinate mapping for Epochs plot:
  // Epoch: 1 to 60 -> X: 45 to 455
  // Loss: 0 to 1.0 -> Y: 290 to 25
  const mapEpochX = (e: number) => 45 + ((e - 1) / 59) * 410;
  const mapEpochY = (loss: number) => 290 - loss * 265;

  return (
    <div className="sim-container">
      {/* Simulation Header */}
      <div className="sim-subnav">
        <div className="subnav-left">
          <button
            className={`subnav-pill ${tradeoffTab === 'bias-variance' ? 'active' : ''}`}
            onClick={() => setTradeoffTab('bias-variance')}
          >
            <Scale size={15} /> 1. Bias-Variance Tradeoff vs Capacity
          </button>
          <button
            className={`subnav-pill ${tradeoffTab === 'epochs' ? 'active' : ''}`}
            onClick={() => setTradeoffTab('epochs')}
          >
            <AlertTriangle size={15} /> 2. Training Epochs & Early Stopping Tradeoff
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.76rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
            FUNDAMENTAL TRADEOFF DYNAMICS
          </span>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: BIAS-VARIANCE TRADEOFF VS MODEL CAPACITY */}
      {/* ===================================================================== */}
      {tradeoffTab === 'bias-variance' && (
        <div className="sim-grid">
          {/* Main Visualizer */}
          <div className="sim-canvas-card">
            <div className="canvas-header">
              <div className="canvas-title-group">
                <span className="canvas-title">BIAS-VARIANCE DECOMPOSITION U-CURVE</span>
                <span className="canvas-sub">
                  Capacity Level {complexity} / 12 • Total Error = Bias² + Variance + σ²
                </span>
              </div>
              <div className={`status-pill ${bvRegime.badgeClass}`}>
                <span>{bvRegime.label}</span>
              </div>
            </div>

            <div className="svg-stage" style={{ height: '360px' }}>
              <svg viewBox="0 0 500 340" className="sim-svg" role="img" aria-label="Bias-Variance Tradeoff curves">
                {/* Axes and Grid */}
                <line x1="45" y1="300" x2="475" y2="300" stroke="rgba(255,255,255,0.12)" />
                <line x1="45" y1="30" x2="45" y2="300" stroke="rgba(255,255,255,0.12)" />

                {/* Optimal Complexity Sweet Spot Marker Band (Complexity 3 to 4) */}
                <rect
                  x={mapBVX(3) - 15}
                  y="30"
                  width={mapBVX(4) - mapBVX(3) + 30}
                  height="270"
                  fill="rgba(52, 211, 153, 0.06)"
                />
                <text
                  x={mapBVX(3.5)}
                  y="26"
                  fill="var(--accent-emerald)"
                  fontSize="9.5"
                  textAnchor="middle"
                  fontFamily="var(--font-mono)"
                >
                  OPTIMAL GENERALIZATION ZONE
                </text>

                {/* Irreducible Noise Floor (σ²) */}
                <line x1="45" y1={noiseY} x2="475" y2={noiseY} stroke="rgba(255,255,255,0.35)" strokeDasharray="4 4" strokeWidth="1.5" />
                <text x="470" y={noiseY - 6} fill="var(--text-dim)" fontSize="9" textAnchor="end" fontFamily="var(--font-mono)">
                  Noise Floor (σ² = 0.08)
                </text>

                {/* Bias Squared Curve (Green/Emerald: drops monotonically) */}
                <polyline points={biasSqPoints} fill="none" stroke="var(--accent-cyan)" strokeWidth="3" />

                {/* Variance Curve (Red/Rose: grows exponentially) */}
                <polyline points={variancePoints} fill="none" stroke="var(--accent-rose)" strokeWidth="3" />

                {/* Total Test Error Curve (Violet/Purple: classic U-curve) */}
                <polyline points={totalErrorPoints} fill="none" stroke="var(--accent-violet)" strokeWidth="4" />

                {/* Current Complexity Cursor Line */}
                <line
                  x1={mapBVX(complexity)}
                  y1="30"
                  x2={mapBVX(complexity)}
                  y2="300"
                  stroke="rgba(255,255,255,0.7)"
                  strokeWidth="2"
                  strokeDasharray="3 3"
                />

                {/* Intersection dots on the curves at current complexity */}
                <circle cx={mapBVX(complexity)} cy={mapBVY(currentBV.biasSq)} r="5" fill="var(--accent-cyan)" />
                <circle cx={mapBVX(complexity)} cy={mapBVY(currentBV.variance)} r="5" fill="var(--accent-rose)" />
                <circle
                  cx={mapBVX(complexity)}
                  cy={mapBVY(currentBV.totalError)}
                  r="7"
                  fill="var(--accent-violet)"
                  stroke="#fff"
                  strokeWidth="2"
                  style={{ filter: 'drop-shadow(0 0 6px var(--accent-violet))' }}
                />

                {/* X Axis Ticks */}
                {bvData.map((d) => (
                  <text
                    key={d.complexity}
                    x={mapBVX(d.complexity)}
                    y="318"
                    fill={d.complexity === complexity ? '#fff' : 'var(--text-dim)'}
                    fontSize="9.5"
                    textAnchor="middle"
                    fontFamily="var(--font-mono)"
                    fontWeight={d.complexity === complexity ? 'bold' : 'normal'}
                  >
                    c{d.complexity}
                  </text>
                ))}
              </svg>
            </div>

            {/* Canvas Legend */}
            <div className="canvas-legend">
              <div className="legend-entry">
                <span className="solid-line" style={{ background: 'var(--accent-cyan)' }} />
                <span>Bias² (Model Inflexibility)</span>
              </div>
              <div className="legend-entry">
                <span className="solid-line" style={{ background: 'var(--accent-rose)' }} />
                <span>Variance (Sensitivity to Noise)</span>
              </div>
              <div className="legend-entry">
                <span className="dash-line" />
                <span>Irreducible Noise (σ²)</span>
              </div>
              <div className="legend-entry">
                <span className="solid-line" style={{ background: 'var(--accent-violet)', height: '4px' }} />
                <span>Total Expected Error (U-Curve)</span>
              </div>
            </div>

            {/* Metrics Bar */}
            <div className="sim-metrics-bar">
              <div className="metric-box">
                <div className="metric-label">BIAS SQUARED</div>
                <div className="metric-val" style={{ color: 'var(--accent-cyan)' }}>
                  {currentBV.biasSq.toFixed(4)}
                </div>
                <small className="metric-sub">
                  {((currentBV.biasSq / currentBV.totalError) * 100).toFixed(0)}% of total error
                </small>
              </div>

              <div className="metric-box">
                <div className="metric-label">VARIANCE</div>
                <div className="metric-val" style={{ color: 'var(--accent-rose)' }}>
                  {currentBV.variance.toFixed(4)}
                </div>
                <small className="metric-sub">
                  {((currentBV.variance / currentBV.totalError) * 100).toFixed(0)}% of total error
                </small>
              </div>

              <div className="metric-box">
                <div className="metric-label">TOTAL EXPECTED ERROR</div>
                <div className="metric-val" style={{ color: 'var(--accent-violet)' }}>
                  {currentBV.totalError.toFixed(4)}
                </div>
                <small className="metric-sub">Bias² + Var + σ²</small>
              </div>

              <div className="metric-box metric-analysis" style={{ borderLeftColor: bvRegime.color }}>
                <b style={{ color: bvRegime.color, fontSize: '0.85rem' }}>{bvRegime.label}</b>
                <p>{bvRegime.desc}</p>
              </div>
            </div>
          </div>

          {/* Controls Column */}
          <div className="sim-controls-card">
            <h4 className="controls-title">Tradeoff Complexity Scenarios</h4>
            <div className="presets-list">
              <button className="preset-item" onClick={() => setComplexity(1)}>
                <div className="preset-name" style={{ color: 'var(--accent-amber)' }}>
                  📉 1. Extreme High Bias (Underfit)
                </div>
                <div className="preset-desc">Complexity 1 • Bias² = 0.97, Variance = 0.00. Model is completely blind.</div>
              </button>

              <button className="preset-item" onClick={() => setComplexity(3)}>
                <div className="preset-name" style={{ color: 'var(--accent-emerald)' }}>
                  🎯 2. The Golden Minimum (Sweet Spot)
                </div>
                <div className="preset-desc">Complexity 3 • Bias² = 0.38, Variance = 0.02. Total error hits lowest valley.</div>
              </button>

              <button className="preset-item" onClick={() => setComplexity(7)}>
                <div className="preset-name" style={{ color: 'var(--accent-rose)' }}>
                  ⚡ 3. Entering Overfit Territory
                </div>
                <div className="preset-desc">Complexity 7 • Variance begins to dominate, doubling the total test loss.</div>
              </button>

              <button className="preset-item" onClick={() => setComplexity(12)}>
                <div className="preset-name" style={{ color: 'var(--accent-rose)' }}>
                  🎢 4. Catastrophic Variance (Overfit)
                </div>
                <div className="preset-desc">Complexity 12 • Bias² = 0.02, but Variance explodes to 1.50+!</div>
              </button>
            </div>

            <h4 className="controls-title" style={{ marginTop: '1.25rem' }}>Scrub Model Complexity</h4>

            <div className="control-slider-block">
              <div className="slider-row-header">
                <span>CAPACITY / COMPLEXITY</span>
                <span className="slider-num">c = {complexity}</span>
              </div>
              <input
                type="range"
                min="1"
                max="12"
                step="1"
                value={complexity}
                onChange={(e) => setComplexity(Number(e.target.value))}
                className="sim-range"
              />
              <div className="slider-ticks">
                <span>1 (Underfit)</span>
                <span>3 (Sweet Spot)</span>
                <span>7</span>
                <span>12 (Overfit)</span>
              </div>
            </div>

            {/* Error Composition Visual Stack */}
            <div style={{ marginTop: '1.25rem', padding: '0.85rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.76rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                  ERROR FRACTION DECOMPOSITION
                </span>
                <span style={{ fontSize: '0.76rem', fontFamily: 'var(--font-mono)', color: '#fff' }}>
                  100%
                </span>
              </div>

              <div style={{ display: 'flex', height: '18px', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${(currentBV.biasSq / currentBV.totalError) * 100}%`,
                    backgroundColor: 'var(--accent-cyan)',
                    transition: 'width 0.2s',
                  }}
                  title={`Bias²: ${((currentBV.biasSq / currentBV.totalError) * 100).toFixed(1)}%`}
                />
                <div
                  style={{
                    width: `${(currentBV.variance / currentBV.totalError) * 100}%`,
                    backgroundColor: 'var(--accent-rose)',
                    transition: 'width 0.2s',
                  }}
                  title={`Variance: ${((currentBV.variance / currentBV.totalError) * 100).toFixed(1)}%`}
                />
                <div
                  style={{
                    width: `${(currentBV.irreducibleNoise / currentBV.totalError) * 100}%`,
                    backgroundColor: 'rgba(255,255,255,0.3)',
                    transition: 'width 0.2s',
                  }}
                  title={`Noise: ${((currentBV.irreducibleNoise / currentBV.totalError) * 100).toFixed(1)}%`}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.72rem', fontFamily: 'var(--font-mono)' }}>
                <span style={{ color: 'var(--accent-cyan)' }}>Bias² {((currentBV.biasSq / currentBV.totalError) * 100).toFixed(0)}%</span>
                <span style={{ color: 'var(--accent-rose)' }}>Var {((currentBV.variance / currentBV.totalError) * 100).toFixed(0)}%</span>
                <span style={{ color: 'var(--text-dim)' }}>σ² {((currentBV.irreducibleNoise / currentBV.totalError) * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: TRAINING EPOCHS & EARLY STOPPING TRADEOFF */}
      {/* ===================================================================== */}
      {tradeoffTab === 'epochs' && (
        <div className="sim-grid">
          <div className="sim-canvas-card">
            <div className="canvas-header">
              <div className="canvas-title-group">
                <span className="canvas-title">
                  TRAINING DYNAMICS • EPOCH {epochIndex} / 60
                </span>
                <span className="canvas-sub">
                  Architecture: {modelType === 'overfit' ? 'Unregularized Deep Network (U-Curve)' : modelType === 'optimal' ? 'Regularized Network' : 'Underfitting Linear'}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="subnav-action-btn"
                  onClick={() => setIsPlayingEpochs(!isPlayingEpochs)}
                  style={{
                    borderColor: isPlayingEpochs ? 'var(--accent-rose)' : 'var(--accent-cyan)',
                    color: isPlayingEpochs ? 'var(--accent-rose)' : 'var(--accent-cyan)',
                  }}
                >
                  {isPlayingEpochs ? <Pause size={13} /> : <Play size={13} />}
                  <span>{isPlayingEpochs ? 'Pause' : 'Train'}</span>
                </button>

                <button
                  className="subnav-action-btn"
                  onClick={() => {
                    setIsPlayingEpochs(false);
                    setEpochIndex(1);
                  }}
                >
                  <RotateCcw size={13} /> <span>Reset</span>
                </button>
              </div>
            </div>

            <div className="svg-stage" style={{ height: '360px' }}>
              <svg viewBox="0 0 500 320" className="sim-svg" role="img" aria-label="Epochs Learning Curves">
                {/* Axes and Grid */}
                <line x1="45" y1="290" x2="475" y2="290" stroke="rgba(255,255,255,0.12)" />
                <line x1="45" y1="25" x2="45" y2="290" stroke="rgba(255,255,255,0.12)" />

                {/* Early Stopping Point (Epoch 22) */}
                {modelType === 'overfit' && (
                  <g>
                    <line
                      x1={mapEpochX(22)}
                      y1="25"
                      x2={mapEpochX(22)}
                      y2="290"
                      stroke="var(--accent-emerald)"
                      strokeDasharray="4 4"
                      strokeWidth="2"
                    />
                    <text
                      x={mapEpochX(22) + 6}
                      y="42"
                      fill="var(--accent-emerald)"
                      fontFamily="var(--font-mono)"
                      fontSize="9.5"
                    >
                      EARLY STOPPING SWEET SPOT (EPOCH 22)
                    </text>
                  </g>
                )}

                {/* Scrubber Cursor Line */}
                <line
                  x1={mapEpochX(epochIndex)}
                  y1="25"
                  x2={mapEpochX(epochIndex)}
                  y2="290"
                  stroke="rgba(255,255,255,0.5)"
                  strokeWidth="2"
                />

                {/* Training Loss Curve (Cyan) */}
                {(() => {
                  const pts = epochData[modelType].train
                    .slice(0, epochIndex)
                    .map((val, i) => `${mapEpochX(i + 1)},${mapEpochY(val)}`)
                    .join(' ');
                  return <polyline points={pts} fill="none" stroke="var(--accent-cyan)" strokeWidth="3" />;
                })()}

                {/* Validation Loss Curve (Amber / Rose) */}
                {(() => {
                  const pts = epochData[modelType].val
                    .slice(0, epochIndex)
                    .map((val, i) => `${mapEpochX(i + 1)},${mapEpochY(val)}`)
                    .join(' ');
                  const valColor =
                    modelType === 'overfit' && epochIndex > 22 ? 'var(--accent-rose)' : 'var(--accent-amber)';
                  return <polyline points={pts} fill="none" stroke={valColor} strokeWidth="3" />;
                })()}

                {/* Markers at head of curves */}
                <circle
                  cx={mapEpochX(epochIndex)}
                  cy={mapEpochY(epochData[modelType].train[epochIndex - 1])}
                  r="5"
                  fill="var(--accent-cyan)"
                />
                <circle
                  cx={mapEpochX(epochIndex)}
                  cy={mapEpochY(epochData[modelType].val[epochIndex - 1])}
                  r="5"
                  fill={modelType === 'overfit' && epochIndex > 22 ? 'var(--accent-rose)' : 'var(--accent-amber)'}
                />
              </svg>
            </div>

            <div className="canvas-legend">
              <div className="legend-entry">
                <span className="solid-line" style={{ background: 'var(--accent-cyan)' }} />
                <span>Training Loss: {epochData[modelType].train[epochIndex - 1]}</span>
              </div>
              <div className="legend-entry">
                <span
                  className="solid-line"
                  style={{
                    background: modelType === 'overfit' && epochIndex > 22 ? 'var(--accent-rose)' : 'var(--accent-amber)',
                  }}
                />
                <span>Validation Loss: {epochData[modelType].val[epochIndex - 1]}</span>
              </div>
            </div>

            <div className="sim-metrics-bar">
              <div className="metric-box">
                <div className="metric-label">CURRENT EPOCH</div>
                <div className="metric-val text-white">{epochIndex} / 60</div>
                <small className="metric-sub">Training duration</small>
              </div>

              <div className="metric-box">
                <div className="metric-label">GENERALIZATION GAP</div>
                <div
                  className="metric-val"
                  style={{
                    color:
                      epochData[modelType].val[epochIndex - 1] - epochData[modelType].train[epochIndex - 1] > 0.15
                        ? 'var(--accent-rose)'
                        : 'var(--accent-emerald)',
                  }}
                >
                  +
                  {(
                    epochData[modelType].val[epochIndex - 1] - epochData[modelType].train[epochIndex - 1]
                  ).toFixed(3)}
                </div>
                <small className="metric-sub">Val Loss - Train Loss</small>
              </div>

              <div
                className="metric-box metric-analysis"
                style={{
                  borderLeftColor:
                    epochIndex < 22
                      ? 'var(--accent-cyan)'
                      : epochIndex === 22
                      ? 'var(--accent-emerald)'
                      : 'var(--accent-rose)',
                }}
              >
                <b
                  style={{
                    color:
                      epochIndex < 22
                        ? 'var(--accent-cyan)'
                        : epochIndex === 22
                        ? 'var(--accent-emerald)'
                        : 'var(--accent-rose)',
                    fontSize: '0.85rem',
                  }}
                >
                  {epochIndex < 22
                    ? 'LEARNING REPRESENTATIONS'
                    : epochIndex === 22
                    ? 'OPTIMAL CHECKPOINT REACHED'
                    : 'MEMORIZING NOISE (OVERFITTING)'}
                </b>
                <p>
                  {epochIndex < 22
                    ? 'Both training and validation loss drop rapidly as features are extracted.'
                    : epochIndex === 22
                    ? 'Early Stopping triggered: validation loss hits minimum. Model weights are saved here.'
                    : 'Train loss drops to 0, but validation loss diverges upward! Overfitting to sample quirks.'}
                </p>
              </div>
            </div>
          </div>

          <div className="sim-controls-card">
            <h4 className="controls-title">Architecture Regime</h4>
            <div className="presets-list">
              <button
                className={`preset-item ${modelType === 'underfit' ? 'active' : ''}`}
                onClick={() => setModelType('underfit')}
              >
                <div className="preset-name" style={{ color: 'var(--accent-amber)' }}>
                  📉 Underfitting Model
                </div>
                <div className="preset-desc">Both training and validation losses plateau early at high values.</div>
              </button>

              <button
                className={`preset-item ${modelType === 'optimal' ? 'active' : ''}`}
                onClick={() => setModelType('optimal')}
              >
                <div className="preset-name" style={{ color: 'var(--accent-emerald)' }}>
                  🎯 Regularized Sweet Spot
                </div>
                <div className="preset-desc">With L2 decay / Dropout: losses drop and stabilize together smoothly.</div>
              </button>

              <button
                className={`preset-item ${modelType === 'overfit' ? 'active' : ''}`}
                onClick={() => setModelType('overfit')}
              >
                <div className="preset-name" style={{ color: 'var(--accent-rose)' }}>
                  🎢 Unconstrained Deep Net
                </div>
                <div className="preset-desc">Classic U-curve: validation error turns back up after epoch 22!</div>
              </button>
            </div>

            <h4 className="controls-title" style={{ marginTop: '1.25rem' }}>Scrub Training Progress</h4>

            <div className="control-slider-block">
              <div className="slider-row-header">
                <span>EPOCH SCRUBBER</span>
                <span className="slider-num">{epochIndex} / 60</span>
              </div>
              <input
                type="range"
                min="1"
                max="60"
                step="1"
                value={epochIndex}
                onChange={(e) => setEpochIndex(Number(e.target.value))}
                className="sim-range"
              />
              <div className="slider-ticks">
                <span>1 (Start)</span>
                <span>22 (Early Stop)</span>
                <span>40</span>
                <span>60 (End)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
