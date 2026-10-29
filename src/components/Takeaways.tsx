import React from 'react';

export const Takeaways: React.FC = () => {
  return (
    <section className="section" style={{ paddingTop: '2rem' }}>
      <p className="eyebrow">
        <span className="eyebrow-line" /> 07 / BACK-POCKET PRINCIPLES
      </p>
      <h2>The golden rules of generalization.</h2>

      <div className="takeaways-grid">
        <div className="takeaway-card">
          <b>RULE 01</b>
          <h4>100% Accuracy is a Warning Sign</h4>
          <p>
            In deep learning with real-world noisy data, 100% training accuracy almost always means
            the model has memorized sample IDs and outliers instead of true generative laws.
          </p>
        </div>

        <div className="takeaway-card">
          <b>RULE 02</b>
          <h4>More Data Beats Smarter Regularization</h4>
          <p>
            While Dropout and L2 weight decay are essential safety nets, collecting more diverse,
            clean data mathematically compresses the variance error directly toward zero.
          </p>
        </div>

        <div className="takeaway-card">
          <b>RULE 03</b>
          <h4>Test on Tomorrow’s Data</h4>
          <p>
            Always evaluate on data held out strictly from your feature engineering, training, and
            hyperparameter tuning loops to guarantee genuine out-of-distribution robustness.
          </p>
        </div>
      </div>
    </section>
  );
};
