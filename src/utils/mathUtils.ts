// Numerical & Simulation Utilities for Generalization Atlas

export interface Point2D {
  x: number;
  y: number;
}

export interface ClassificationPoint {
  x: number;
  y: number;
  label: 0 | 1;
}

// Pseudo-random Gaussian generator with Box-Muller transform
export function gaussianRandom(mean = 0, stdDev = 1): number {
  const u1 = Math.max(1e-12, Math.random());
  const u2 = Math.random();
  const randStdNormal = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return mean + stdDev * randStdNormal;
}

// Ground truth function for 1D regression
export function groundTruthFn(x: number): number {
  return Math.sin(1.25 * Math.PI * x) + 0.15 * Math.cos(3 * Math.PI * x);
}

// Generate 1D regression dataset
export function generateRegressionData(
  numPoints: number,
  noiseStd: number
): { trainPoints: Point2D[]; testPoints: Point2D[] } {
  // Deterministic spread with noise
  const trainPoints: Point2D[] = [];
  const testPoints: Point2D[] = [];

  // Generate training points
  for (let i = 0; i < numPoints; i++) {
    // Non-uniform spacing to simulate real-world cluster sampling
    const ratio = (i + 0.5) / numPoints;
    const x = -1 + 2 * ratio;
    const noise = gaussianRandom(0, noiseStd);
    const y = groundTruthFn(x) + noise;
    trainPoints.push({ x: Number(x.toFixed(4)), y: Number(y.toFixed(4)) });
  }

  // Generate 40 fixed test points across the domain to measure generalization
  const testCount = 40;
  for (let i = 0; i < testCount; i++) {
    const x = -0.95 + 1.9 * (i / (testCount - 1));
    const noise = gaussianRandom(0, noiseStd * 0.75);
    const y = groundTruthFn(x) + noise;
    testPoints.push({ x: Number(x.toFixed(4)), y: Number(y.toFixed(4)) });
  }

  return { trainPoints, testPoints };
}

// Solve linear system A * w = b using Gaussian elimination with partial pivoting
function solveLinearSystem(A: number[][], b: number[]): number[] {
  const n = b.length;
  // Deep copy A and b
  const M: number[][] = A.map((row) => [...row]);
  const y: number[] = [...b];

  for (let col = 0; col < n; col++) {
    // Find pivot
    let maxRow = col;
    let maxVal = Math.abs(M[col][col]);
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(M[row][col]) > maxVal) {
        maxVal = Math.abs(M[row][col]);
        maxRow = row;
      }
    }

    // Swap rows
    if (maxRow !== col) {
      [M[col], M[maxRow]] = [M[maxRow], M[col]];
      [y[col], y[maxRow]] = [y[maxRow], y[col]];
    }

    const pivot = M[col][col];
    if (Math.abs(pivot) < 1e-12) {
      // Degenerate or singular; add tiny jitter
      M[col][col] += 1e-7;
    }

    // Eliminate column
    for (let row = col + 1; row < n; row++) {
      const factor = M[row][col] / M[col][col];
      y[row] -= factor * y[col];
      for (let j = col; j < n; j++) {
        M[row][j] -= factor * M[col][j];
      }
    }
  }

  // Back substitution
  const w = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let sum = y[i];
    for (let j = i + 1; j < n; j++) {
      sum -= M[i][j] * w[j];
    }
    w[i] = sum / (M[i][i] || 1e-7);
  }

  return w;
}

// Fit polynomial with Ridge Regularization: (X^T * X + lambda * I) * w = X^T * y
export function fitPolynomial(
  points: Point2D[],
  degree: number,
  regularizationLambda = 0
): number[] {
  const n = degree + 1;
  const N = points.length;

  if (N === 0) return new Array(n).fill(0);

  // Normal equations: (X^T X + lambda I) w = X^T y
  const XtX: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  const Xty: number[] = new Array(n).fill(0);

  for (let i = 0; i < N; i++) {
    const { x, y } = points[i];
    // Powers of x: x^0, x^1, ..., x^degree
    const powers = new Array(n);
    powers[0] = 1;
    for (let p = 1; p < n; p++) {
      powers[p] = powers[p - 1] * x;
    }

    for (let r = 0; r < n; r++) {
      Xty[r] += powers[r] * y;
      for (let c = 0; c < n; c++) {
        XtX[r][c] += powers[r] * powers[c];
      }
    }
  }

  // Add L2 Ridge penalty to diagonal (excluding bias term at index 0)
  for (let i = 1; i < n; i++) {
    XtX[i][i] += regularizationLambda * N;
  }

  return solveLinearSystem(XtX, Xty);
}

// Evaluate polynomial at x: w0 + w1*x + w2*x^2 + ...
export function evaluatePolynomial(coeffs: number[], x: number): number {
  let val = 0;
  let power = 1;
  for (let i = 0; i < coeffs.length; i++) {
    val += coeffs[i] * power;
    power *= x;
  }
  return val;
}

// Calculate Mean Squared Error
export function computeMSE(points: Point2D[], coeffs: number[]): number {
  if (points.length === 0) return 0;
  let sum = 0;
  for (const pt of points) {
    const pred = evaluatePolynomial(coeffs, pt.x);
    // Clamp extreme divergence for numerical display stability
    const clampedPred = Math.max(-50, Math.min(50, pred));
    sum += Math.pow(pt.y - clampedPred, 2);
  }
  return sum / points.length;
}

// 2D Classification Dataset Generators
export function generate2DClassification(
  datasetType: 'circles' | 'moons' | 'xor',
  numSamples = 100,
  noise = 0.15
): ClassificationPoint[] {
  const points: ClassificationPoint[] = [];

  if (datasetType === 'circles') {
    const half = Math.floor(numSamples / 2);
    // Inner circle (Label 1)
    for (let i = 0; i < half; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const r = 0.35 + gaussianRandom(0, noise * 0.4);
      points.push({
        x: r * Math.cos(angle),
        y: r * Math.sin(angle),
        label: 1,
      });
    }
    // Outer ring (Label 0)
    for (let i = 0; i < half; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const r = 0.8 + gaussianRandom(0, noise * 0.4);
      points.push({
        x: r * Math.cos(angle),
        y: r * Math.sin(angle),
        label: 0,
      });
    }
  } else if (datasetType === 'moons') {
    const half = Math.floor(numSamples / 2);
    // Upper moon (Label 0)
    for (let i = 0; i < half; i++) {
      const theta = Math.PI * Math.random();
      points.push({
        x: Math.cos(theta) * 0.7 - 0.35 + gaussianRandom(0, noise * 0.3),
        y: Math.sin(theta) * 0.7 - 0.2 + gaussianRandom(0, noise * 0.3),
        label: 0,
      });
    }
    // Lower moon (Label 1)
    for (let i = 0; i < half; i++) {
      const theta = Math.PI * Math.random();
      points.push({
        x: 0.35 - Math.cos(theta) * 0.7 + gaussianRandom(0, noise * 0.3),
        y: 0.2 - Math.sin(theta) * 0.7 + gaussianRandom(0, noise * 0.3),
        label: 1,
      });
    }
  } else {
    // Noisy XOR
    for (let i = 0; i < numSamples; i++) {
      const x = (Math.random() - 0.5) * 1.8;
      const y = (Math.random() - 0.5) * 1.8;
      let label: 0 | 1 = (x > 0 && y > 0) || (x < 0 && y < 0) ? 1 : 0;
      // Inject random label noise
      if (Math.random() < noise) {
        label = label === 1 ? 0 : 1;
      }
      points.push({ x, y, label });
    }
  }

  return points;
}

// Predict probability P(y=1 | x1, x2) for 2D classification
export function predict2D(
  x: number,
  y: number,
  points: ClassificationPoint[],
  complexity: 'linear' | 'moderate' | 'complex'
): number {
  if (complexity === 'linear') {
    // Linear decision boundary
    const z = 1.6 * x - 1.2 * y;
    return 1 / (1 + Math.exp(-z));
  }

  if (complexity === 'moderate') {
    // Smooth nonlinear RBF with appropriate bandwidth
    let score = 0;
    const gamma = 2.5;
    for (const pt of points) {
      const distSq = (x - pt.x) ** 2 + (y - pt.y) ** 2;
      const weight = Math.exp(-gamma * distSq);
      score += (pt.label === 1 ? 1 : -1) * weight;
    }
    return 1 / (1 + Math.exp(-score * 1.4));
  }

  // Complex / Overfitted: high gamma, wraps around individual noise outliers creating ragged boundaries
  let score = 0;
  const gamma = 18.0;
  for (const pt of points) {
    const distSq = (x - pt.x) ** 2 + (y - pt.y) ** 2;
    const weight = Math.exp(-gamma * distSq);
    score += (pt.label === 1 ? 2.5 : -2.5) * weight;
  }
  return 1 / (1 + Math.exp(-score * 2.5));
}

// Generate training history curves for Epoch Simulation
export function generateEpochCurves(totalEpochs = 60) {
  const epochs: number[] = [];
  const underfitTrain: number[] = [];
  const underfitVal: number[] = [];

  const optimalTrain: number[] = [];
  const optimalVal: number[] = [];

  const overfitTrain: number[] = [];
  const overfitVal: number[] = [];

  for (let e = 1; e <= totalEpochs; e++) {
    epochs.push(e);

    // Underfit: Stays high from the start
    const ufT = 0.55 + 0.35 * Math.exp(-e / 6) + 0.02 * Math.sin(e * 0.8);
    const ufV = ufT + 0.05 + 0.015 * Math.cos(e * 0.5);
    underfitTrain.push(Number(ufT.toFixed(3)));
    underfitVal.push(Number(ufV.toFixed(3)));

    // Optimal: Drops smoothly and plateaus gracefully together
    const opT = 0.08 + 0.82 * Math.exp(-e / 12) + 0.01 * Math.sin(e * 0.4);
    const opV = 0.11 + 0.84 * Math.exp(-e / 14) + 0.012 * Math.cos(e * 0.4);
    optimalTrain.push(Number(opT.toFixed(3)));
    optimalVal.push(Number(opV.toFixed(3)));

    // Overfit: Train loss collapses to ~0, Val loss bottoms around epoch 22 and then climbs steeply!
    const ofT = 0.01 + 0.89 * Math.exp(-e / 8);
    // U-shaped validation curve
    const bestEpoch = 22;
    const uCurve = Math.pow((e - bestEpoch) / 28, 2);
    const ofV = 0.09 + 0.82 * Math.exp(-e / 10) + (e > bestEpoch ? uCurve * 0.35 : 0) + 0.02 * Math.sin(e * 0.7);
    overfitTrain.push(Number(ofT.toFixed(3)));
    overfitVal.push(Number(ofV.toFixed(3)));
  }

  return {
    epochs,
    underfit: { train: underfitTrain, val: underfitVal },
    optimal: { train: optimalTrain, val: optimalVal },
    overfit: { train: overfitTrain, val: overfitVal, bestEpoch: 22 },
  };
}
