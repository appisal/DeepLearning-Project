import { ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'What is the difference between Bias and Variance in simple words?',
    answer:
      'Bias is under-thinking: The model makes oversimplified assumptions (like assuming all curves are straight lines), failing to learn real patterns. Variance is over-thinking: The model is overly sensitive to the specific training points, memorizing random noise and fluctuating wildly when given new data.',
  },
  {
    question: 'Why does high-degree polynomial regression create wild wiggles at the edges?',
    answer:
      'This is known as Runge’s phenomenon. To force a high-degree polynomial to pass exactly through noisy points, adjacent polynomial coefficients blow up to huge opposite values (e.g. +10,000 and -10,000). Between the training points and near the boundaries, these terms no longer cancel out, causing violent oscillations.',
  },
  {
    question: 'Why must Dropout be disabled during model testing and evaluation?',
    answer:
      'During training, Dropout deliberately turns off random neurons (e.g. 30%) so the remaining neurons learn to be self-reliant. However, during testing or production deployment, we want the full neural network working at 100% capacity with all its collective wisdom. In PyTorch, calling `model.eval()` automatically disables Dropout.',
  },
  {
    question: 'How is L1 Regularization (Lasso) different from L2 Regularization (Ridge)?',
    answer:
      'L2 Regularization adds a squared penalty (w²), driving all weights down smoothly towards small values near zero—perfect for smoothing wiggles. L1 Regularization adds an absolute value penalty (|w|), driving irrelevant weights to exactly zero—performing automatic feature selection and creating sparse models.',
  },
  {
    question: 'If my model is underfitting, will training for more epochs fix it?',
    answer:
      'Usually NOT. If the model capacity is too small (e.g., trying to separate complex image classes with a 1-layer perceptron), no amount of additional training epochs will give it the mathematical power to bend around the data. You must increase model depth, add neurons, or introduce non-linear activation functions.',
  },
];

export const FAQSection: React.FC = () => {
  return (
    <section className="section faq-section" id="faq">
      <div className="section-heading">
        <div>
          <p className="eyebrow">
            <span className="eyebrow-line" /> 08 / FREQUENTLY ASKED QUESTIONS
          </p>
          <h2>Deep Learning Q&A & Common Traps.</h2>
        </div>
        <p>
          Critical questions and practical nuances clarified for deep learning practitioners
          and researchers.
        </p>
      </div>

      <div className="faq-list">
        {faqs.map((faq, index) => (
          <details key={index} className="faq-item">
            <summary>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>
                  0{index + 1}
                </span>
                <span>{faq.question}</span>
              </div>
              <ChevronDown size={18} style={{ color: 'var(--text-dim)', flexShrink: 0 }} />
            </summary>
            <div className="faq-content">
              <p>{faq.answer}</p>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
};
