import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  computeGDLoss,
  computeGDGradient,
} from '../utils/mathUtils';
import type { GDTrajectoryPoint } from '../utils/mathUtils';
import { Play, Pause, RotateCcw, StepForward, Zap, TrendingDown } from 'lucide-react';

export const GradientDescentLab: React.FC = () => {
  // Optimization parameters
  const [learningRate, setLearningRate] = useState<number>(0.18);
  const [optimizer, setOptimizer] = useState<'gd' | 'momentum' | 'adam'>('gd');
  const [regularization, setRegularization] = useState<'none' | 'l2' | 'l1'>('none');
  const [lambda, setLambda] = useState<number>(0.2);

  // Initial weights
  const [startPoint, setStartPoint] = useState<{ w1: number; w2: number }>({ w1: -2.2, w2: 1.8 });

  // Optimization simulation state
  const [trajectory, setTrajectory] = useState<GDTrajectoryPoint[]>(() => {
    const initialLoss = computeGDLoss(-2.2, 1.8, 0, 0);
    const initialGrad = computeGDGradient(-2.2, 1.8, 0, 0);
    return [
      {
        w1: -2.2,
        w2: 1.8,
        loss: initialLoss,
        grad1: initialGrad.grad1,
        grad2: initialGrad.grad2,
        step: 0,
      },
    ];
  });
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // Momentum & Adam internal states
  const momentumVel = useRef<{ v1: number; v2: number }>({ v1: 0, v2: 0 });
  const adamState = useRef<{ m1: number; m2: number; v1: number; v2: number; t: number }>({
    m1: 0,
    m2: 0,
    v1: 0,
    v2: 0,
    t: 0,
  });

  // Reset trajectory whenever starting point, optimizer, or regularization changes
  const resetOptimization = useCallback(() => {
    setIsRunning(false);
    momentumVel.current = { v1: 0, v2: 0 };
    adamState.current = { m1: 0, m2: 0, v1: 0, v2: 0, t: 0 };

    const l1Pen = regularization === 'l1' ? lambda : 0;
    const l2Pen = regularization === 'l2' ? lambda : 0;
    const initialLoss = computeGDLoss(startPoint.w1, startPoint.w2, l1Pen, l2Pen);
    const initialGrad = computeGDGradient(startPoint.w1, startPoint.w2, l1Pen, l2Pen);

    setTrajectory([
      {
        w1: startPoint.w1,
        w2: startPoint.w2,
        loss: initialLoss,
        grad1: initialGrad.grad1,
        grad2: initialGrad.grad2,
        step: 0,
      },
    ]);
  }, [startPoint, regularization, lambda]);

  // Execute 1 optimization step
  const stepOptimization = useCallback(() => {
    setTrajectory((prev) => {
      if (prev.length === 0) return prev;
      const current = prev[prev.length - 1];

      // Stop if diverged or max steps
      if (prev.length >= 60 || Math.abs(current.w1) > 8 || Math.abs(current.w2) > 8) {
        setIsRunning(false);
        return prev;
      }

      const l1Pen = regularization === 'l1' ? lambda : 0;
      const l2Pen = regularization === 'l2' ? lambda : 0;
      const { grad1, grad2 } = computeGDGradient(current.w1, current.w2, l1Pen, l2Pen);

      let nextW1 = current.w1;
      let nextW2 = current.w2;

      if (optimizer === 'gd') {
        nextW1 = current.w1 - learningRate * grad1;
        nextW2 = current.w2 - learningRate * grad2;
      } else if (optimizer === 'momentum') {
        const beta = 0.85;
        momentumVel.current.v1 = beta * momentumVel.current.v1 + learningRate * grad1;
        momentumVel.current.v2 = beta * momentumVel.current.v2 + learningRate * grad2;
        nextW1 = current.w1 - momentumVel.current.v1;
        nextW2 = current.w2 - momentumVel.current.v2;
      } else if (optimizer === 'adam') {
        adamState.current.t += 1;
        const t = adamState.current.t;
        const beta1 = 0.9;
        const beta2 = 0.999;
        const eps = 1e-8;

        adamState.current.m1 = beta1 * adamState.current.m1 + (1 - beta1) * grad1;
        adamState.current.m2 = beta1 * adamState.current.m2 + (1 - beta1) * grad2;

        adamState.current.v1 = beta2 * adamState.current.v1 + (1 - beta2) * (grad1 * grad1);
        adamState.current.v2 = beta2 * adamState.current.v2 + (1 - beta2) * (grad2 * grad2);

        const m1Hat = adamState.current.m1 / (1 - Math.pow(beta1, t));
        const m2Hat = adamState.current.m2 / (1 - Math.pow(beta1, t));

        const v1Hat = adamState.current.v1 / (1 - Math.pow(beta2, t));
        const v2Hat = adamState.current.v2 / (1 - Math.pow(beta2, t));

        nextW1 = current.w1 - (learningRate / (Math.sqrt(v1Hat) + eps)) * m1Hat;
        nextW2 = current.w2 - (learningRate / (Math.sqrt(v2Hat) + eps)) * m2Hat;
      }

      const nextLoss = computeGDLoss(nextW1, nextW2, l1Pen, l2Pen);
      const nextGrad = computeGDGradient(nextW1, nextW2, l1Pen, l2Pen);

      return [
        ...prev,
        {
          w1: nextW1,
          w2: nextW2,
          loss: nextLoss,
          grad1: nextGrad.grad1,
          grad2: nextGrad.grad2,
          step: prev.length,
        },
      ];
    });
  }, [learningRate, optimizer, regularization, lambda]);

  // Continuous animation loop
  useEffect(() => {
    let interval: number;
    if (isRunning) {
      interval = window.setInterval(() => {
        stepOptimization();
      }, 90);
    }
    return () => clearInterval(interval);
  }, [isRunning, stepOptimization]);

  // Current state diagnostics
  const currentPoint = trajectory[trajectory.length - 1] || {
    w1: startPoint.w1,
    w2: startPoint.w2,
    loss: 0,
    grad1: 0,
    grad2: 0,
    step: 0,
  };
  const gradNorm = Math.hypot(currentPoint.grad1, currentPoint.grad2);
  const isDiverged = Math.abs(currentPoint.w1) > 4 || Math.abs(currentPoint.w2) > 4 || currentPoint.loss > 60;

  // Presets
  const applyPreset = (preset: 'optimal' | 'oscillate' | 'momentum' | 'diverge' | 'weightdecay') => {
    setIsRunning(false);
    if (preset === 'optimal') {
      setOptimizer('gd');
      setRegularization('none');
      setLearningRate(0.18);
      setStartPoint({ w1: -2.2, w2: 1.8 });
    } else if (preset === 'oscillate') {
      setOptimizer('gd');
      setRegularization('none');
      setLearningRate(0.36); // High LR causes ravine zig-zags
      setStartPoint({ w1: -2.2, w2: 1.8 });
    } else if (preset === 'momentum') {
      setOptimizer('momentum');
      setRegularization('none');
      setLearningRate(0.36); // Momentum rescues the zig-zags
      setStartPoint({ w1: -2.2, w2: 1.8 });
    } else if (preset === 'diverge') {
      setOptimizer('gd');
      setRegularization('none');
      setLearningRate(0.55); // Explodes
      setStartPoint({ w1: -2.2, w2: 1.8 });
    } else if (preset === 'weightdecay') {
      setOptimizer('gd');
      setRegularization('l2');
      setLambda(0.35);
      setLearningRate(0.18);
      setStartPoint({ w1: -2.2, w2: 1.8 });
    }
  };

  // SVG Mapping for 2D Contour: [-3.2, 3.2] -> [25, 375]
  const mapContourX = (w1: number) => 200 + (w1 / 3.0) * 175;
  const mapContourY = (w2: number) => 200 - (w2 / 3.0) * 175;

  // Handle click on canvas to set custom starting coordinates
  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * 400;
    const svgY = ((e.clientY - rect.top) / rect.height) * 400;

    const w1 = Number((((svgX - 200) / 175) * 3.0).toFixed(2));
    const w2 = Number((((200 - svgY) / 175) * 3.0).toFixed(2));

    setStartPoint({ w1, w2 });
  };

  // Contour Ellipses levels
  const contourLevels = [0.2, 0.6, 1.4, 2.8, 5.0, 8.5, 13.5, 20.0];

  return (
    <div className="sim-container">
      {/* Simulation Header */}
      <div className="sim-subnav">
        <div className="subnav-left">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={16} color="var(--accent-amber)" />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: '#fff', fontWeight: 600 }}>
              2D LOSS SURFACE OPTIMIZATION
            </span>
          </div>
        </div>

        {/* Optimizer Selector */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Optimizer:</span>
          <button
            className={`subnav-pill ${optimizer === 'gd' ? 'active' : ''}`}
            onClick={() => {
              setOptimizer('gd');
              resetOptimization();
            }}
          >
            Vanilla GD
          </button>
          <button
            className={`subnav-pill ${optimizer === 'momentum' ? 'active' : ''}`}
            onClick={() => {
              setOptimizer('momentum');
              resetOptimization();
            }}
          >
            Momentum (β = 0.85)
          </button>
          <button
            className={`subnav-pill ${optimizer === 'adam' ? 'active' : ''}`}
            onClick={() => {
              setOptimizer('adam');
              resetOptimization();
            }}
          >
            Adam
          </button>
        </div>
      </div>

      <div className="sim-grid">
        {/* Main 2D Contour View */}
        <div className="sim-canvas-card">
          <div className="canvas-header">
            <div className="canvas-title-group">
              <span className="canvas-title">
                {optimizer.toUpperCase()} OPTIMIZATION • STEP {currentPoint.step} / 60
              </span>
              <span className="canvas-sub">
                Learning Rate α = {learningRate.toFixed(2)} • Click canvas to drop starting point
              </span>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="subnav-action-btn"
                onClick={() => setIsRunning(!isRunning)}
                style={{
                  borderColor: isRunning ? 'var(--accent-rose)' : 'var(--accent-cyan)',
                  color: isRunning ? 'var(--accent-rose)' : 'var(--accent-cyan)',
                }}
              >
                {isRunning ? <Pause size={13} /> : <Play size={13} />}
                <span>{isRunning ? 'Pause' : 'Run Descent'}</span>
              </button>

              <button className="subnav-action-btn" onClick={stepOptimization} disabled={isRunning}>
                <StepForward size={13} /> <span>Step 1x</span>
              </button>

              <button className="subnav-action-btn" onClick={resetOptimization}>
                <RotateCcw size={13} /> <span>Reset</span>
              </button>
            </div>
          </div>

          <div className="svg-stage" style={{ height: '380px' }}>
            <svg
              viewBox="0 0 400 400"
              className="sim-svg"
              role="img"
              aria-label="2D Gradient Descent Surface"
              onClick={handleCanvasClick}
              style={{ cursor: 'crosshair' }}
            >
              {/* Coordinate Axes */}
              <line x1="25" y1="200" x2="375" y2="200" stroke="rgba(255,255,255,0.12)" strokeDasharray="3 3" />
              <line x1="200" y1="25" x2="200" y2="375" stroke="rgba(255,255,255,0.12)" strokeDasharray="3 3" />

              <text x="365" y="195" fill="var(--text-dim)" fontSize="10" fontFamily="var(--font-mono)">w1</text>
              <text x="205" y="38" fill="var(--text-dim)" fontSize="10" fontFamily="var(--font-mono)">w2</text>

              {/* Loss Contour Ellipses */}
              {contourLevels.map((lvl, i) => {
                const rx = Math.sqrt((lvl * 2) / 1.2) * 58;
                const ry = Math.sqrt((lvl * 2) / 5.2) * 58;
                return (
                  <ellipse
                    key={i}
                    cx="200"
                    cy="200"
                    rx={rx}
                    ry={ry}
                    fill="none"
                    stroke={`rgba(94, 217, 208, ${0.1 + (i / contourLevels.length) * 0.25})`}
                    strokeWidth="1.2"
                    transform="rotate(-18, 200, 200)"
                  />
                );
              })}

              {/* Global Minimum Target (0, 0) */}
              <circle cx="200" cy="200" r="4.5" fill="var(--accent-emerald)" />
              <text x="208" y="204" fill="var(--accent-emerald)" fontSize="9" fontFamily="var(--font-mono)">
                Global Min (0,0)
              </text>

              {/* Optimization Trajectory Path */}
              {trajectory.length > 1 && (
                <polyline
                  points={trajectory.map((p) => `${mapContourX(p.w1)},${mapContourY(p.w2)}`).join(' ')}
                  fill="none"
                  stroke={isDiverged ? 'var(--accent-rose)' : 'var(--accent-amber)'}
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />
              )}

              {/* Trajectory Step Markers */}
              {trajectory.map((p, idx) => (
                <circle
                  key={idx}
                  cx={mapContourX(p.w1)}
                  cy={mapContourY(p.w2)}
                  r={idx === trajectory.length - 1 ? 6 : 3}
                  fill={
                    idx === 0
                      ? 'var(--accent-cyan)'
                      : idx === trajectory.length - 1
                      ? isDiverged
                        ? 'var(--accent-rose)'
                        : 'var(--accent-emerald)'
                      : 'var(--accent-amber)'
                  }
                  stroke="#090c17"
                  strokeWidth="1.5"
                  style={
                    idx === trajectory.length - 1
                      ? { filter: `drop-shadow(0 0 6px ${isDiverged ? 'var(--accent-rose)' : 'var(--accent-emerald)'})` }
                      : {}
                  }
                />
              ))}

              {/* Gradient Vector Indicator at current step */}
              {trajectory.length > 0 && !isDiverged && (
                <line
                  x1={mapContourX(currentPoint.w1)}
                  y1={mapContourY(currentPoint.w2)}
                  x2={mapContourX(currentPoint.w1 - currentPoint.grad1 * 0.15)}
                  y2={mapContourY(currentPoint.w2 - currentPoint.grad2 * 0.15)}
                  stroke="var(--accent-rose)"
                  strokeWidth="2"
                  strokeDasharray="2 2"
                />
              )}
            </svg>
          </div>

          {/* Canvas Legend */}
          <div className="canvas-legend">
            <div className="legend-entry">
              <span className="dot dot-cyan" />
              <span>Starting Point ({startPoint.w1}, {startPoint.w2})</span>
            </div>
            <div className="legend-entry">
              <span className="dot dot-amber" />
              <span>Gradient Path ({trajectory.length} steps)</span>
            </div>
            <div className="legend-entry">
              <span className="dot dot-emerald" />
              <span>Minimum Valley (Loss = 0)</span>
            </div>
          </div>

          {/* Metrics bar */}
          <div className="sim-metrics-bar">
            <div className="metric-box">
              <div className="metric-label">CURRENT LOSS J(w)</div>
              <div className="metric-val" style={{ color: isDiverged ? 'var(--accent-rose)' : '#fff' }}>
                {isDiverged ? 'DIVERGED' : currentPoint.loss.toFixed(4)}
              </div>
              <small className="metric-sub">Loss surface height</small>
            </div>

            <div className="metric-box">
              <div className="metric-label">CURRENT WEIGHTS (w1, w2)</div>
              <div className="metric-val text-white" style={{ fontSize: '1.05rem' }}>
                ({currentPoint.w1.toFixed(2)}, {currentPoint.w2.toFixed(2)})
              </div>
              <small className="metric-sub">Parameter location</small>
            </div>

            <div className="metric-box">
              <div className="metric-label">GRADIENT NORM ||∇J||</div>
              <div className="metric-val" style={{ color: 'var(--accent-amber)' }}>
                {gradNorm.toFixed(3)}
              </div>
              <small className="metric-sub">Slope magnitude</small>
            </div>

            <div
              className="metric-box metric-analysis"
              style={{
                borderLeftColor: isDiverged
                  ? 'var(--accent-rose)'
                  : gradNorm < 0.15
                  ? 'var(--accent-emerald)'
                  : 'var(--accent-amber)',
              }}
            >
              <b
                style={{
                  color: isDiverged
                    ? 'var(--accent-rose)'
                    : gradNorm < 0.15
                    ? 'var(--accent-emerald)'
                    : 'var(--accent-amber)',
                  fontSize: '0.85rem',
                }}
              >
                {isDiverged
                  ? 'EXPLOSIVE DIVERGENCE'
                  : gradNorm < 0.15
                  ? 'CONVERGED TO MINIMUM'
                  : 'DESCENDING GRADIENT'}
              </b>
              <p>
                {isDiverged
                  ? 'Learning rate is too large! Overshooting the valley walls causes step sizes to multiply uncontrollably.'
                  : gradNorm < 0.15
                  ? 'Optimal solution reached. Gradients have flattened near zero at the bottom of the loss bowl.'
                  : 'Walking down the steepest slope of the anisotropic loss landscape toward the optimum.'}
              </p>
            </div>
          </div>
        </div>

        {/* Controls Column */}
        <div className="sim-controls-card">
          <h4 className="controls-title">Descent Benchmark Scenarios</h4>
          <div className="presets-list">
            <button className="preset-item" onClick={() => applyPreset('optimal')}>
              <div className="preset-name" style={{ color: 'var(--accent-emerald)' }}>
                🎯 1. Optimal Convergence
              </div>
              <div className="preset-desc">α = 0.18 • Clean, swift path straight down into the minimum.</div>
            </button>

            <button className="preset-item" onClick={() => applyPreset('oscillate')}>
              <div className="preset-name" style={{ color: 'var(--accent-amber)' }}>
                ⚡ 2. Ravine Oscillations
              </div>
              <div className="preset-desc">α = 0.36, GD • Bounces wildly across steep w2 walls while crawling along w1.</div>
            </button>

            <button className="preset-item" onClick={() => applyPreset('momentum')}>
              <div className="preset-name" style={{ color: 'var(--accent-cyan)' }}>
                🚀 3. Tamed by Momentum
              </div>
              <div className="preset-desc">α = 0.36, Momentum • Cancels out cross-wall oscillations, accelerates forward!</div>
            </button>

            <button className="preset-item" onClick={() => applyPreset('diverge')}>
              <div className="preset-name" style={{ color: 'var(--accent-rose)' }}>
                💥 4. Overshoot & Divergence
              </div>
              <div className="preset-desc">α = 0.55 • Step length exceeds curvature tolerance, launching weights to infinity.</div>
            </button>

            <button className="preset-item" onClick={() => applyPreset('weightdecay')}>
              <div className="preset-name" style={{ color: 'var(--accent-violet)' }}>
                🛡️ 5. L2 Weight Decay Pull
              </div>
              <div className="preset-desc">λ = 0.35 • Regularization continuously contracts weights inward towards (0,0).</div>
            </button>
          </div>

          <h4 className="controls-title" style={{ marginTop: '1.25rem' }}>Optimization Controls</h4>

          {/* Learning Rate Slider */}
          <div className="control-slider-block">
            <div className="slider-row-header">
              <span>LEARNING RATE (α)</span>
              <span className="slider-num">{learningRate.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.02"
              max="0.60"
              step="0.02"
              value={learningRate}
              onChange={(e) => setLearningRate(Number(e.target.value))}
              className="sim-range"
            />
            <div className="slider-ticks">
              <span>0.02 (Crawl)</span>
              <span>0.18 (Optimal)</span>
              <span>0.36 (Oscillate)</span>
              <span>0.55 (Explode)</span>
            </div>
          </div>

          {/* Regularization Penalty on Gradient Descent */}
          <h4 className="controls-title" style={{ marginTop: '1.25rem' }}>Regularization Penalty</h4>
          <div className="presets-list">
            <button
              className={`preset-item ${regularization === 'none' ? 'active' : ''}`}
              onClick={() => setRegularization('none')}
            >
              <div className="preset-name">No Regularization</div>
              <div className="preset-desc">Pure objective function gradient ∇J(w)</div>
            </button>

            <button
              className={`preset-item ${regularization === 'l2' ? 'active' : ''}`}
              onClick={() => setRegularization('l2')}
            >
              <div className="preset-name" style={{ color: 'var(--accent-violet)' }}>
                + L2 Weight Decay (-αλw)
              </div>
              <div className="preset-desc">Shrinks weight magnitudes towards origin at each step</div>
            </button>

            <button
              className={`preset-item ${regularization === 'l1' ? 'active' : ''}`}
              onClick={() => setRegularization('l1')}
            >
              <div className="preset-name" style={{ color: 'var(--accent-cyan)' }}>
                + L1 Proximal (-αλ sgn(w))
              </div>
              <div className="preset-desc">Steps toward zero along coordinate axes to promote sparsity</div>
            </button>
          </div>

          {regularization !== 'none' && (
            <div className="control-slider-block" style={{ marginTop: '0.75rem' }}>
              <div className="slider-row-header">
                <span>PENALTY STRENGTH (λ)</span>
                <span className="slider-num">{lambda.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.60"
                step="0.05"
                value={lambda}
                onChange={(e) => setLambda(Number(e.target.value))}
                className="sim-range"
              />
            </div>
          )}

          {/* Loss vs Step Chart */}
          <div style={{ marginTop: '1.25rem', padding: '0.85rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <TrendingDown size={14} color="var(--accent-cyan)" />
              <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                LOSS DECAY OVER ITERATIONS
              </span>
            </div>

            <svg viewBox="0 0 240 70" style={{ width: '100%', height: '70px', overflow: 'visible' }}>
              <line x1="10" y1="60" x2="230" y2="60" stroke="rgba(255,255,255,0.1)" />
              <line x1="10" y1="5" x2="10" y2="60" stroke="rgba(255,255,255,0.1)" />

              {trajectory.length > 1 && (
                <polyline
                  points={trajectory
                    .map((p, idx) => {
                      const px = 10 + (idx / 59) * 220;
                      const py = 60 - Math.min(55, (Math.max(0, p.loss) / 12) * 55);
                      return `${px.toFixed(1)},${py.toFixed(1)}`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke={isDiverged ? 'var(--accent-rose)' : 'var(--accent-cyan)'}
                  strokeWidth="2"
                />
              )}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
