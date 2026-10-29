import React from 'react';


export const WhySection: React.FC = () => {
  return (
    <section className="section why-section" id="why">
      <div className="section-heading">
        <div>
          <p className="eyebrow">
            <span className="eyebrow-line" /> 01 / THE CORE PHENOMENON
          </p>
          <h2>
            Without generalization,<br />
            learning is just <em>memorization.</em>
          </h2>
        </div>
        <p>
          A model’s true intelligence is not measured by how well it recites data it has
          already seen, but by how accurately it predicts what it has never encountered.
        </p>
      </div>

      {/* The 3 Students Analogy */}
      <div className="analogy-grid">
        <div className="analogy-card" style={{ borderColor: 'rgba(255, 184, 108, 0.3)' }}>
          <span
            className="analogy-badge"
            style={{ background: 'rgba(255, 184, 108, 0.15)', color: 'var(--accent-amber)' }}
          >
            HIGH BIAS • TOO SIMPLE
          </span>
          <h3>1. The Slacker</h3>
          <span className="analogy-alias">UNDERFITTING</span>
          <p className="analogy-story">
            Only glanced at the chapter summaries and ignored the formulas. Has strong,
            simplistic assumptions about the subject and fails both the practice homework
            and the actual exam.
          </p>
          <div className="analogy-metric">
            <span>HOMEWORK SCORE</span>
            <strong style={{ color: 'var(--accent-amber)' }}>38% (High Error)</strong>
          </div>
          <div className="analogy-metric" style={{ marginTop: '6px' }}>
            <span>FINAL EXAM SCORE</span>
            <strong style={{ color: 'var(--accent-amber)' }}>35% (High Error)</strong>
          </div>
        </div>

        <div className="analogy-card" style={{ borderColor: 'rgba(52, 211, 153, 0.4)' }}>
          <span
            className="analogy-badge"
            style={{ background: 'rgba(52, 211, 153, 0.15)', color: 'var(--accent-emerald)' }}
          >
            SWEET SPOT • BALANCED
          </span>
          <h3>2. The Thinker</h3>
          <span className="analogy-alias">OPTIMAL GENERALIZATION</span>
          <p className="analogy-story">
            Understood the foundational concepts and problem-solving rules. Tolerates small
            variations and noise, and consistently excels on both past homework and unseen
            final exams.
          </p>
          <div className="analogy-metric">
            <span>HOMEWORK SCORE</span>
            <strong style={{ color: 'var(--accent-emerald)' }}>92% (Low Error)</strong>
          </div>
          <div className="analogy-metric" style={{ marginTop: '6px' }}>
            <span>FINAL EXAM SCORE</span>
            <strong style={{ color: 'var(--accent-emerald)' }}>89% (Low Error)</strong>
          </div>
        </div>

        <div className="analogy-card" style={{ borderColor: 'rgba(255, 107, 129, 0.4)' }}>
          <span
            className="analogy-badge"
            style={{ background: 'rgba(255, 107, 129, 0.15)', color: 'var(--accent-rose)' }}
          >
            HIGH VARIANCE • TOO RIGID
          </span>
          <h3>3. The Crammer</h3>
          <span className="analogy-alias">OVERFITTING</span>
          <p className="analogy-story">
            Memorized the past 5 years of exam papers by heart, including exact numbers and
            printing typos! Scores 100% on the exact homework, but completely flunks the final
            exam when questions change.
          </p>
          <div className="analogy-metric">
            <span>HOMEWORK SCORE</span>
            <strong style={{ color: 'var(--accent-emerald)' }}>100% (Zero Error)</strong>
          </div>
          <div className="analogy-metric" style={{ marginTop: '6px' }}>
            <span>FINAL EXAM SCORE</span>
            <strong style={{ color: 'var(--accent-rose)' }}>42% (Disaster Gap)</strong>
          </div>
        </div>
      </div>

      {/* Visual Pipeline Flow */}
      <div className="flow-container">
        <span className="flow-title">HOW GENERALIZATION HAPPENS IN A DEEP NETWORK</span>
        <div className="flow-steps">
          <div className="flow-node">
            <span>INPUT STAGE</span>
            <b>Training Samples (X, y)</b>
            <small>Data points + real-world noise</small>
          </div>
          <span className="flow-arrow">→</span>

          <div className="flow-node" style={{ borderColor: 'var(--accent-cyan)' }}>
            <span style={{ color: 'var(--accent-cyan)' }}>LEARNING STAGE</span>
            <b>Model Hypothesis f(x; θ)</b>
            <small>Adjusting weights via backprop</small>
          </div>
          <span className="flow-arrow">→</span>

          <div className="flow-node" style={{ borderColor: 'var(--accent-violet)' }}>
            <span style={{ color: 'var(--accent-violet)' }}>TESTING STAGE</span>
            <b>Unseen Evaluation (X_val)</b>
            <small>The true test of generalization</small>
          </div>
        </div>
      </div>
    </section>
  );
};
