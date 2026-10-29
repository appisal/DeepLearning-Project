import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Award,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

interface Slide {
  title: string;
  subtitle: string;
  analogy: string;
  bulletPoints: string[];
  keyTakeaway: string;
  visualGraphic: 'flat-line' | 'wobbly-line' | 'archery' | 'superheroes';
}

const slides: Slide[] = [
  {
    title: '1. The Big Picture: What is Generalization?',
    subtitle: 'The fundamental difference between learning patterns and memorizing noise.',
    analogy: 'Imagine recognizing what a "dog" is after seeing pictures of Golden Retrievers.',
    bulletPoints: [
      'If the model assumes only golden furry quadrupeds are dogs, it Underfits (High Bias).',
      'If the model memorizes the exact background grass pixels in every photo, it Overfits (High Variance).',
      'If the model correctly identifies a Bulldog, Husky, and Dalmatian, it has successfully Generalized!',
    ],
    keyTakeaway:
      'Key Insight: High training accuracy achieved through brute-force memorization fails on unseen test distributions. Genuine machine learning requires discovering low-dimensional invariant features.',
    visualGraphic: 'flat-line',
  },
  {
    title: '2. Underfitting (High Bias)',
    subtitle: 'The hypothesis space is too constrained to represent the underlying reality.',
    analogy: 'High Bias: Making rigid, simplistic assumptions and attempting to fit a complex curve with a single flat line.',
    bulletPoints: [
      'Visual Symptom: A flat, rigid line attempting to fit an oscillating rollercoaster wave.',
      'Training Error is HIGH. Testing Error is HIGH.',
      'Root Cause: The model architecture lacks sufficient capacity (e.g., 1 linear layer for non-linear data).',
      'The Solution: Increase model depth, widen hidden layers, or add polynomial interaction features.',
    ],
    keyTakeaway:
      'Key Insight: Underfitting is readily diagnosable by persistently elevated training loss. If the hypothesis space cannot even fit the training points, generalization to unseen data is mathematically impossible.',
    visualGraphic: 'flat-line',
  },
  {
    title: '3. Overfitting (High Variance)',
    subtitle: 'The model memorizes sample-specific idiosyncrasies and random noise.',
    analogy: 'High Variance: Memorizing training samples word-for-word rather than learning the governing principles.',
    bulletPoints: [
      'Visual Symptom: An erratic, wildly oscillating curve passing through every outlier with extreme boundary spikes.',
      'Training Error is ZERO (100% accuracy!). Testing Error is HIGH and divergent.',
      'Root Cause: Model parameter count far exceeds the effective information content in the dataset.',
      'The Solution: Apply L2 Regularization (Weight Decay), insert Dropout, enforce Early Stopping, or expand dataset size.',
    ],
    keyTakeaway:
      'Key Insight: In deep learning on real-world noisy data, near-zero training error accompanied by high test error is the classic signature of Overfitting (Generalization Collapse).',
    visualGraphic: 'wobbly-line',
  },
  {
    title: '4. The Bias-Variance Tradeoff',
    subtitle: 'The fundamental mathematical balance in all supervised learning.',
    analogy: 'Think of an archer shooting multiple arrows at a target bullseye.',
    bulletPoints: [
      'High Bias (Underfit): Arrows land tightly grouped, but 2 feet off to the left (consistent systematic error).',
      'High Variance (Overfit): Arrows hit all four corners of the board, scattered chaotically across the target.',
      'Optimal Generalization: Arrows land tightly centered directly on the bullseye.',
    ],
    keyTakeaway:
      'Key Insight: Total expected error decomposes strictly into Bias² + Variance + Irreducible Noise. Tuning model capacity trades off bias against variance.',
    visualGraphic: 'archery',
  },
  {
    title: '5. The Core Defenses Against Overfitting',
    subtitle: 'Essential regularization and training strategies to ensure robustness.',
    analogy: 'Mathematical constraints that prevent high-capacity models from fitting noise.',
    bulletPoints: [
      '1. Dataset Expansion & Augmentation: More diverse samples prevent the model from memorizing individual examples.',
      '2. L2 Regularization (Weight Decay): Penalizes large weights, enforcing smooth, low-frequency curves.',
      '3. Dropout: Stochastically deactivates neurons during training, preventing co-adapted dependencies.',
      '4. Early Stopping: Halts optimization at the global minimum of the validation loss curve.',
    ],
    keyTakeaway:
      'Key Insight: While regularization penalties bound parameter freedom, expanding training data volume and diversity asymptotically drives variance error directly toward zero.',
    visualGraphic: 'superheroes',
  },
];

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const quizQuestions: QuizQuestion[] = [
  {
    question:
      'Your deep learning vision model gets 99.4% training accuracy, but only 58.2% test accuracy. What is happening?',
    options: [
      'The model is Underfitting (High Bias)',
      'The model is Overfitting (High Variance)',
      'The model has achieved Optimal Generalization',
      'The GPU ran out of CUDA memory',
    ],
    correctIndex: 1,
    explanation:
      'Correct! A huge gap between near-perfect training accuracy and poor test accuracy is the classic signature of Overfitting (High Variance).',
  },
  {
    question: 'Which of the following will help CURE an underfitting model?',
    options: [
      'Adding more layers and hidden neurons to increase capacity',
      'Applying 50% Dropout across all layers',
      'Deleting half of the training dataset',
      'Stopping training after epoch 1',
    ],
    correctIndex: 0,
    explanation:
      'Correct! Underfitting means the model is too simple. Adding layers and neurons gives it the expressive capacity to learn complex patterns.',
  },
  {
    question: 'How does Dropout prevent overfitting during neural network training?',
    options: [
      'It deletes bad training images from the hard drive',
      'It randomly zeroes out a fraction of neurons, preventing co-adaptation',
      'It makes the learning rate zero',
      'It increases the number of epochs to 10,000',
    ],
    correctIndex: 1,
    explanation:
      'Correct! By randomly muting neurons on each step, no neuron can rely on another specific neuron, forcing every feature to be robust and independent.',
  },
  {
    question: 'When should Early Stopping halt the training loop?',
    options: [
      'When training loss reaches exactly 0.000',
      'When the validation loss reaches its lowest point and starts rising',
      'After the first 3 seconds of training',
      'Only when the computer fan starts making loud noise',
    ],
    correctIndex: 1,
    explanation:
      'Correct! Halting at the bottom of the validation loss U-curve guarantees you preserve the model checkpoint with the highest real-world generalization power.',
  },
];

export const TeachingMode: React.FC = () => {
  const [slideIndex, setSlideIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<{ [key: number]: number }>({});

  const currentSlide = slides[slideIndex];

  const handleSelectQuiz = (questionIdx: number, optionIdx: number) => {
    setQuizAnswers((prev) => ({ ...prev, [questionIdx]: optionIdx }));
  };

  const score = Object.entries(quizAnswers).filter(
    ([qIdx, optIdx]) => quizQuestions[Number(qIdx)].correctIndex === optIdx
  ).length;

  return (
    <section className="section classroom-section" id="walkthrough">
      <div className="section-heading">
        <div>
          <p className="eyebrow" style={{ color: 'var(--accent-violet)' }}>
            <span className="eyebrow-line" style={{ background: 'var(--accent-violet)' }} />
            06 / CONCEPTUAL WALKTHROUGH MODULES
          </p>
          <h2>Step-by-step deep learning foundations.</h2>
        </div>
        <p>
          A structured visual walkthrough exploring generalization theory, bias-variance
          tradeoffs, and defense mechanisms, accompanied by an interactive knowledge check.
        </p>
      </div>

      <div className="classroom-container">
        {/* Slide Controls Top Bar */}
        <div className="slide-controls">
          <span className="slide-counter">
            MODULE SLIDE 0{slideIndex + 1} OF 0{slides.length}
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="slide-btn"
              disabled={slideIndex === 0}
              onClick={() => setSlideIndex((i) => Math.max(0, i - 1))}
            >
              <ChevronLeft size={16} /> Previous
            </button>
            <button
              className="slide-btn"
              disabled={slideIndex === slides.length - 1}
              onClick={() => setSlideIndex((i) => Math.min(slides.length - 1, i + 1))}
              style={{ background: 'rgba(159, 140, 255, 0.2)', borderColor: 'var(--accent-violet)' }}
            >
              Next Slide <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Slide Content */}
        <div className="slide-content">
          <h3>{currentSlide.title}</h3>
          <p style={{ color: 'var(--accent-cyan)', fontSize: '1.05rem', fontWeight: 500 }}>
            {currentSlide.subtitle}
          </p>

          <div
            style={{
              background: 'rgba(0, 0, 0, 0.35)',
              padding: '1.2rem 1.5rem',
              borderRadius: '8px',
              margin: '1.2rem 0',
              borderLeft: '3px solid var(--accent-cyan)',
            }}
          >
            <b style={{ color: 'var(--accent-cyan)', fontSize: '0.78rem', display: 'block', marginBottom: '4px' }}>
              INTUITIVE ANALOGY:
            </b>
            <p style={{ color: '#fff', fontSize: '0.98rem' }}>{currentSlide.analogy}</p>
          </div>

          <ul style={{ listStyle: 'none', paddingLeft: '4px', margin: '1.5rem 0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {currentSlide.bulletPoints.map((pt, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.95rem' }}>
                <span style={{ color: 'var(--accent-emerald)', marginTop: '2px' }}>✦</span>
                <span>{pt}</span>
              </li>
            ))}
          </ul>

          {/* Theoretical Takeaway Box */}
          <div className="takeaway-box">
            <b>CORE THEORETICAL TAKEAWAY:</b>
            <p style={{ color: '#e2e8f0', fontSize: '0.88rem', lineHeight: '1.55' }}>
              {currentSlide.keyTakeaway}
            </p>
          </div>
        </div>

        {/* Interactive Knowledge & Concept Check */}
        <div className="quiz-box">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <span className="hero-art-title" style={{ color: 'var(--accent-emerald)' }}>
                KNOWLEDGE & CONCEPT CHECK
              </span>
              <h4 style={{ fontSize: '1.25rem', color: '#fff', marginTop: '4px' }}>
                Test Your Understanding (4 Questions)
              </h4>
            </div>
            {Object.keys(quizAnswers).length === quizQuestions.length && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={20} color="var(--accent-emerald)" />
                <strong style={{ color: '#fff', fontFamily: 'var(--font-mono)' }}>
                  Score: {score} / 4
                </strong>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {quizQuestions.map((q, qIndex) => {
              const selectedOpt = quizAnswers[qIndex];
              const isAnswered = selectedOpt !== undefined;
              const isCorrect = selectedOpt === q.correctIndex;

              return (
                <div key={qIndex} style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '1.5rem' }}>
                  <p className="quiz-question">
                    <strong>Q{qIndex + 1}:</strong> {q.question}
                  </p>

                  <div className="quiz-answers">
                    {q.options.map((opt, optIndex) => {
                      let btnClass = 'quiz-answer-btn';
                      if (isAnswered) {
                        if (optIndex === q.correctIndex) btnClass += ' correct';
                        else if (selectedOpt === optIndex) btnClass += ' incorrect';
                      }

                      return (
                        <button
                          key={optIndex}
                          className={btnClass}
                          onClick={() => handleSelectQuiz(qIndex, optIndex)}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', opacity: 0.6 }}>
                              [{String.fromCharCode(65 + optIndex)}]
                            </span>
                            <span>{opt}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {isAnswered && (
                    <div
                      className="quiz-feedback"
                      style={{
                        background: isCorrect ? 'rgba(52, 211, 153, 0.1)' : 'rgba(255, 107, 129, 0.1)',
                        borderLeft: `3px solid ${isCorrect ? 'var(--accent-emerald)' : 'var(--accent-rose)'}`,
                        color: isCorrect ? 'var(--accent-emerald)' : 'var(--accent-rose)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                        {isCorrect ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                        <span>{isCorrect ? 'Well Done!' : 'Take Another Look:'}</span>
                      </div>
                      <p style={{ marginTop: '4px', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                        {q.explanation}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
