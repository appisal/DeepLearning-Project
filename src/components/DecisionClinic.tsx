import { useState } from 'react';
import { Stethoscope, CheckCircle2, Wrench } from 'lucide-react';

export const DecisionClinic: React.FC = () => {
  const [trainStatus, setTrainStatus] = useState<'high' | 'good' | 'zero'>('zero');
  const [valStatus, setValStatus] = useState<'high' | 'good' | 'diverging'>('diverging');
  const [dataRatio, setDataRatio] = useState<'small' | 'balanced' | 'huge'>('small');

  const getDiagnosis = () => {
    if (trainStatus === 'high') {
      return {
        condition: 'UNDERFITTING (HIGH BIAS)',
        severity: 'Critical Deficiency',
        color: 'var(--accent-amber)',
        summary:
          'Your model does not have sufficient capacity or expressive power to learn the underlying patterns in your dataset.',
        checklist: [
          'Increase neural network depth (add 1 or 2 hidden layers)',
          'Increase hidden layer width (e.g. from 16 to 64 or 128 neurons)',
          'Decrease regularization penalties (lower weight_decay or reduce dropout rate)',
          'Verify that features are properly normalized and learning rate is not too small',
          'If working with tabular data, add non-linear polynomial interaction features',
        ],
      };
    }

    if (valStatus === 'diverging' || (trainStatus === 'zero' && valStatus !== 'good')) {
      return {
        condition: 'OVERFITTING (HIGH VARIANCE)',
        severity: 'Generalization Failure',
        color: 'var(--accent-rose)',
        summary:
          'Your model has memorized the training set specifics and noise. It is failing to generalize to unseen test cases.',
        checklist: [
          'Add L2 Regularization (Weight Decay: try 1e-4, 1e-3, or 1e-2 in optimizer)',
          'Insert Dropout layers (p = 0.3 - 0.5) between fully connected layers',
          'Implement Early Stopping using validation loss with patience = 5 to 10 epochs',
          'Collect more training data or apply Data Augmentation techniques',
          'Reduce model capacity (prune unnecessary layers or reduce degree)',
        ],
      };
    }

    return {
      condition: 'OPTIMAL GENERALIZATION',
      severity: 'Healthy Model State',
      color: 'var(--accent-emerald)',
      summary:
        'Your model is in the balanced sweet spot! Training loss and validation loss descend together with minimal gap.',
      checklist: [
        'Save model weights checkpoint (torch.save or model.save)',
        'Evaluate on an external holdout test set to ensure robustness',
        'Check for data leakage between train and test splits',
        'Prepare deployment and monitor for production distribution drift',
      ],
    };
  };

  const diagnosis = getDiagnosis();

  return (
    <section className="section clinic-section" id="clinic">
      <div className="section-heading">
        <div>
          <p className="eyebrow">
            <span className="eyebrow-line" /> 05 / THE DIAGNOSTIC CLINIC
          </p>
          <h2>Diagnose your deep learning model.</h2>
        </div>
        <p>
          Answer three quick questions about your training observations to receive an instant
          diagnosis, root cause analysis, and prioritized action plan.
        </p>
      </div>

      <div className="clinic-card">
        {/* Step 1 */}
        <div className="clinic-step">
          <div className="clinic-step-title">
            <Stethoscope size={18} color="var(--accent-cyan)" />
            <span>1. What does your Training Loss look like?</span>
          </div>
          <div className="step-options">
            <button
              className={`step-option-btn ${trainStatus === 'high' ? 'selected' : ''}`}
              onClick={() => setTrainStatus('high')}
            >
              <b>High & Stubborn</b>
              <small style={{ display: 'block', color: 'var(--text-dim)', marginTop: '4px' }}>
                Plateaus early; refuses to converge to a low error.
              </small>
            </button>
            <button
              className={`step-option-btn ${trainStatus === 'good' ? 'selected' : ''}`}
              onClick={() => setTrainStatus('good')}
            >
              <b>Moderate & Descending</b>
              <small style={{ display: 'block', color: 'var(--text-dim)', marginTop: '4px' }}>
                Smoothly drops and settles at a reasonable low value.
              </small>
            </button>
            <button
              className={`step-option-btn ${trainStatus === 'zero' ? 'selected' : ''}`}
              onClick={() => setTrainStatus('zero')}
            >
              <b>Near Zero / 100% Accuracy</b>
              <small style={{ display: 'block', color: 'var(--text-dim)', marginTop: '4px' }}>
                Virtually zero training error; almost perfect fit.
              </small>
            </button>
          </div>
        </div>

        {/* Step 2 */}
        <div className="clinic-step">
          <div className="clinic-step-title">
            <Stethoscope size={18} color="var(--accent-cyan)" />
            <span>2. What does your Validation / Test Loss look like?</span>
          </div>
          <div className="step-options">
            <button
              className={`step-option-btn ${valStatus === 'high' ? 'selected' : ''}`}
              onClick={() => setValStatus('high')}
            >
              <b>High & Tracks Train Loss</b>
              <small style={{ display: 'block', color: 'var(--text-dim)', marginTop: '4px' }}>
                Both training and validation stay equally bad.
              </small>
            </button>
            <button
              className={`step-option-btn ${valStatus === 'good' ? 'selected' : ''}`}
              onClick={() => setValStatus('good')}
            >
              <b>Low & Stable</b>
              <small style={{ display: 'block', color: 'var(--text-dim)', marginTop: '4px' }}>
                Tracks training loss closely with a small healthy gap.
              </small>
            </button>
            <button
              className={`step-option-btn ${valStatus === 'diverging' ? 'selected' : ''}`}
              onClick={() => setValStatus('diverging')}
            >
              <b>Diverging / U-Curve</b>
              <small style={{ display: 'block', color: 'var(--text-dim)', marginTop: '4px' }}>
                Bottomed out early and is now climbing higher and higher!
              </small>
            </button>
          </div>
        </div>

        {/* Step 3 */}
        <div className="clinic-step">
          <div className="clinic-step-title">
            <Stethoscope size={18} color="var(--accent-cyan)" />
            <span>3. How large is your dataset relative to parameter count?</span>
          </div>
          <div className="step-options">
            <button
              className={`step-option-btn ${dataRatio === 'small' ? 'selected' : ''}`}
              onClick={() => setDataRatio('small')}
            >
              <b>Small Data, Big Model</b>
              <small style={{ display: 'block', color: 'var(--text-dim)', marginTop: '4px' }}>
                Hundreds of samples with thousands/millions of parameters.
              </small>
            </button>
            <button
              className={`step-option-btn ${dataRatio === 'balanced' ? 'selected' : ''}`}
              onClick={() => setDataRatio('balanced')}
            >
              <b>Balanced Proportion</b>
              <small style={{ display: 'block', color: 'var(--text-dim)', marginTop: '4px' }}>
                Sufficient diverse samples for model capacity.
              </small>
            </button>
            <button
              className={`step-option-btn ${dataRatio === 'huge' ? 'selected' : ''}`}
              onClick={() => setDataRatio('huge')}
            >
              <b>Huge Data, Tiny Model</b>
              <small style={{ display: 'block', color: 'var(--text-dim)', marginTop: '4px' }}>
                Massive complex dataset, but using a very simple linear model.
              </small>
            </button>
          </div>
        </div>

        {/* Diagnostic Output */}
        <div className="clinic-result" style={{ borderLeft: `4px solid ${diagnosis.color}` }}>
          <div className="result-header">
            <div>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                  color: diagnosis.color,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                DIAGNOSTIC VERDICT • {diagnosis.severity}
              </span>
              <h3 style={{ fontSize: '1.4rem', color: '#fff', marginTop: '4px' }}>
                {diagnosis.condition}
              </h3>
            </div>
            <span
              style={{
                background: `${diagnosis.color}22`,
                color: diagnosis.color,
                padding: '6px 14px',
                borderRadius: '20px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
            >
              RECOMMENDED ACTION
            </span>
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '1.2rem' }}>
            {diagnosis.summary}
          </p>

          <h4 style={{ fontSize: '0.9rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Wrench size={15} color="var(--accent-cyan)" /> Step-by-Step Prescription Checklist:
          </h4>

          <ul className="checklist">
            {diagnosis.checklist.map((item, index) => (
              <li key={index}>
                <CheckCircle2 size={16} color={diagnosis.color} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};
