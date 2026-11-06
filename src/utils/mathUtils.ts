// Numerical & Simulation Utilities for Generalization and Optimization Suite

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
  const trainPoints: Point2D[] = [];
  const testPoints: Point2D[] = [];

  // Generate training points with deterministic spread + noise
  for (let i = 0; i < numPoints; i++) {
    const ratio = (i + 0.5) / numPoints;
    const x = -1 + 2 * ratio;
    const noise = gaussianRandom(0, noiseStd);
    const y = groundTruthFn(x) + noise;
    trainPoints.push({ x: Number(x.toFixed(4)), y: Number(y.toFixed(4)) });
  }

  // Generate 45 fixed test points across the domain
  const testCount = 45;
  for (let i = 0; i < testCount; i++) {
    const x = -0.96 + 1.92 * (i / (testCount - 1));
    const noise = gaussianRandom(0, noiseStd * 0.75);
    const y = groundTruthFn(x) + noise;
    testPoints.push({ x: Number(x.toFixed(4)), y: Number(y.toFixed(4)) });
  }

  return { trainPoints, testPoints };
}

// Solve linear system A * w = b using Gaussian elimination with partial pivoting
export function solveLinearSystem(A: number[][], b: number[]): number[] {
  const n = b.length;
  const M: number[][] = A.map((row) => [...row]);
  const y: number[] = [...b];

  for (let col = 0; col < n; col++) {
    let maxRow = col;
    let maxVal = Math.abs(M[col][col]);
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(M[row][col]) > maxVal) {
        maxVal = Math.abs(M[row][col]);
        maxRow = row;
      }
    }

    if (maxRow !== col) {
      [M[col], M[maxRow]] = [M[maxRow], M[col]];
      [y[col], y[maxRow]] = [y[maxRow], y[col]];
    }

    const pivot = M[col][col];
    if (Math.abs(pivot) < 1e-12) {
      M[col][col] += 1e-7;
    }

    for (let row = col + 1; row < n; row++) {
      const factor = M[row][col] / M[col][col];
      y[row] -= factor * y[col];
      for (let j = col; j < n; j++) {
        M[row][j] -= factor * M[col][j];
      }
    }
  }

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

// Fit polynomial with Ridge (L2) Regularization: (X^T * X + lambda * I) * w = X^T * y
export function fitPolynomial(
  points: Point2D[],
  degree: number,
  regularizationLambda = 0
): number[] {
  const n = degree + 1;
  const N = points.length;
  if (N === 0) return new Array(n).fill(0);

  const XtX: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  const Xty: number[] = new Array(n).fill(0);

  for (let i = 0; i < N; i++) {
    const { x, y } = points[i];
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

  // Add L2 penalty to diagonal (leave bias index 0 unpenalized)
  for (let i = 1; i < n; i++) {
    XtX[i][i] += regularizationLambda * N;
  }

  return solveLinearSystem(XtX, Xty);
}

// Coordinate Descent Solver for Lasso (L1 Regularization):
// Minimizes 1/(2N) * ||y - Xw||^2 + lambda * sum(|w_j|)
export function fitPolynomialLasso(
  points: Point2D[],
  degree: number,
  lambda: number,
  maxIterations = 50
): number[] {
  const n = degree + 1;
  const N = points.length;
  if (N === 0) return new Array(n).fill(0);

  // Precompute design matrix X
  const X: number[][] = Array.from({ length: N }, () => new Array(n).fill(0));
  for (let i = 0; i < N; i++) {
    const x = points[i].x;
    X[i][0] = 1;
    for (let p = 1; p < n; p++) {
      X[i][p] = X[i][p - 1] * x;
    }
  }

  // Precompute squared column norms z_j = sum(X_ij^2)
  const z: number[] = new Array(n).fill(0);
  for (let j = 0; j < n; j++) {
    let sumSq = 0;
    for (let i = 0; i < N; i++) {
      sumSq += X[i][j] * X[i][j];
    }
    z[j] = sumSq || 1e-6;
  }

  // Initialize weights using ridge warm-start
  let w = fitPolynomial(points, degree, 0.001);

  // If lambda is 0, return unregularized fit
  if (lambda <= 1e-6) {
    return w;
  }

  // Coordinate descent iterations
  const threshold = (lambda * N) / 2;
  for (let iter = 0; iter < maxIterations; iter++) {
    for (let j = 0; j < n; j++) {
      // Calculate residual correlation rho_j
      let rho = 0;
      for (let i = 0; i < N; i++) {
        let predExcludingJ = 0;
        for (let k = 0; k < n; k++) {
          if (k !== j) predExcludingJ += X[i][k] * w[k];
        }
        const residual = points[i].y - predExcludingJ;
        rho += X[i][j] * residual;
      }

      // Intercept is not penalized
      if (j === 0) {
        w[0] = rho / z[0];
      } else {
        // Soft thresholding operator
        if (rho > threshold) {
          w[j] = (rho - threshold) / z[j];
        } else if (rho < -threshold) {
          w[j] = (rho + threshold) / z[j];
        } else {
          w[j] = 0; // Exactly 0 (sparsity!)
        }
      }
    }
  }

  return w;
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
    const clampedPred = Math.max(-50, Math.min(50, pred));
    sum += Math.pow(pt.y - clampedPred, 2);
  }
  return sum / points.length;
}

// 2D Classification Dataset Generators
export function generate2DClassification(
  datasetType: 'circles' | 'moons' | 'xor',
  numSamples = 90,
  noise = 0.15
): ClassificationPoint[] {
  const points: ClassificationPoint[] = [];

  if (datasetType === 'circles') {
    const half = Math.floor(numSamples / 2);
    for (let i = 0; i < half; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const r = 0.35 + gaussianRandom(0, noise * 0.4);
      points.push({ x: r * Math.cos(angle), y: r * Math.sin(angle), label: 1 });
    }
    for (let i = 0; i < half; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const r = 0.8 + gaussianRandom(0, noise * 0.4);
      points.push({ x: r * Math.cos(angle), y: r * Math.sin(angle), label: 0 });
    }
  } else if (datasetType === 'moons') {
    const half = Math.floor(numSamples / 2);
    for (let i = 0; i < half; i++) {
      const theta = Math.PI * Math.random();
      points.push({
        x: Math.cos(theta) * 0.7 - 0.35 + gaussianRandom(0, noise * 0.3),
        y: Math.sin(theta) * 0.7 - 0.2 + gaussianRandom(0, noise * 0.3),
        label: 0,
      });
    }
    for (let i = 0; i < half; i++) {
      const theta = Math.PI * Math.random();
      points.push({
        x: 0.35 - Math.cos(theta) * 0.7 + gaussianRandom(0, noise * 0.3),
        y: 0.2 - Math.sin(theta) * 0.7 + gaussianRandom(0, noise * 0.3),
        label: 1,
      });
    }
  } else {
    for (let i = 0; i < numSamples; i++) {
      const x = (Math.random() - 0.5) * 1.8;
      const y = (Math.random() - 0.5) * 1.8;
      let label: 0 | 1 = (x > 0 && y > 0) || (x < 0 && y < 0) ? 1 : 0;
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
    const z = 1.6 * x - 1.2 * y;
    return 1 / (1 + Math.exp(-z));
  }

  if (complexity === 'moderate') {
    let score = 0;
    const gamma = 2.5;
    for (const pt of points) {
      const distSq = (x - pt.x) ** 2 + (y - pt.y) ** 2;
      const weight = Math.exp(-gamma * distSq);
      score += (pt.label === 1 ? 1 : -1) * weight;
    }
    return 1 / (1 + Math.exp(-score * 1.4));
  }

  let score = 0;
  const gamma = 18.0;
  for (const pt of points) {
    const distSq = (x - pt.x) ** 2 + (y - pt.y) ** 2;
    const weight = Math.exp(-gamma * distSq);
    score += (pt.label === 1 ? 2.5 : -2.5) * weight;
  }
  return 1 / (1 + Math.exp(-score * 2.5));
}

// ============================================================================
// GRADIENT DESCENT OPTIMIZATION MATH & UTILS
// ============================================================================

export interface GDTrajectoryPoint {
  w1: number;
  w2: number;
  loss: number;
  grad1: number;
  grad2: number;
  step: number;
}

// Loss function surface: Anisotropic quadratic valley with cross term
// J(w1, w2) = 0.5 * (a*w1^2 + b*w2^2) + c*w1*w2
export const GD_CONSTANTS = {
  a: 1.2,
  b: 5.2,
  c: 0.8,
};

export function computeGDLoss(w1: number, w2: number, l1Lambda = 0, l2Lambda = 0): number {
  const { a, b, c } = GD_CONSTANTS;
  const baseLoss = 0.5 * (a * w1 * w1 + b * w2 * w2) + c * w1 * w2;
  const l2Penalty = 0.5 * l2Lambda * (w1 * w1 + w2 * w2);
  const l1Penalty = l1Lambda * (Math.abs(w1) + Math.abs(w2));
  return baseLoss + l2Penalty + l1Penalty;
}

export function computeGDGradient(
  w1: number,
  w2: number,
  l1Lambda = 0,
  l2Lambda = 0
): { grad1: number; grad2: number } {
  const { a, b, c } = GD_CONSTANTS;
  let g1 = a * w1 + c * w2;
  let g2 = b * w2 + c * w1;

  // L2 Regularization gradient
  if (l2Lambda > 0) {
    g1 += l2Lambda * w1;
    g2 += l2Lambda * w2;
  }

  // L1 Subgradient
  if (l1Lambda > 0) {
    g1 += l1Lambda * Math.sign(w1);
    g2 += l1Lambda * Math.sign(w2);
  }

  return { grad1: g1, grad2: g2 };
}

// ============================================================================
// BIAS-VARIANCE TRADEOFF CURVE DATA GENERATOR
// ============================================================================

export interface BiasVarianceDataPoint {
  complexity: number;
  biasSq: number;
  variance: number;
  irreducibleNoise: number;
  totalError: number;
}

export function generateBiasVarianceTradeoff(maxComplexity = 12): BiasVarianceDataPoint[] {
  const points: BiasVarianceDataPoint[] = [];
  const irreducibleNoise = 0.08;

  for (let c = 1; c <= maxComplexity; c++) {
    // Bias squared decays exponentially with model complexity
    const biasSq = 0.95 * Math.exp(-0.48 * (c - 1)) + 0.02;

    // Variance grows rapidly / exponentially with model complexity
    const variance = 0.015 * (Math.pow(1.52, c - 1) - 1);

    const totalError = biasSq + variance + irreducibleNoise;

    points.push({
      complexity: c,
      biasSq: Number(biasSq.toFixed(4)),
      variance: Number(variance.toFixed(4)),
      irreducibleNoise: Number(irreducibleNoise.toFixed(4)),
      totalError: Number(totalError.toFixed(4)),
    });
  }

  return points;
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

    // Overfit: Train loss collapses to ~0, Val loss bottoms around epoch 22 and climbs
    const ofT = 0.01 + 0.89 * Math.exp(-e / 8);
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
