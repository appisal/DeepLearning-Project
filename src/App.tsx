import { useState } from 'react';
import { Header, type SimTab } from './components/Header';
import { OverfittingLab } from './components/OverfittingLab';
import { RegularizationLab } from './components/RegularizationLab';
import { GradientDescentLab } from './components/GradientDescentLab';
import { TradeoffLab } from './components/TradeoffLab';
import { Activity, Shield, Zap, Scale } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<SimTab>('overfitting');
  const [resetKey, setResetKey] = useState<number>(0);

  const handleReset = () => {
    setResetKey((k) => k + 1);
  };

  return (
    <div className="app-shell">
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onReset={handleReset}
      />

      <main className="main-content">
        {/* Focused Hero Sub-bar */}
        <section className="sim-intro-bar">
          <div className="intro-container">
            <div className="intro-badge">
              <span className="pulse-indicator" />
              <span>INTERACTIVE SIMULATION LAB</span>
            </div>
            <h2>
              {activeTab === 'overfitting' && 'Overfitting & Underfitting Simulation'}
              {activeTab === 'regularization' && 'L1 (Lasso) vs L2 (Ridge) Regularization Simulation'}
              {activeTab === 'gradient-descent' && 'Gradient Descent Optimization Simulation'}
              {activeTab === 'tradeoff' && 'Bias-Variance & Epochs Tradeoff Simulation'}
            </h2>
            <p>
              {activeTab === 'overfitting' &&
                'Explore model capacity, training vs unseen test loss, residual error, and the boundary between high bias and high variance.'}
              {activeTab === 'regularization' &&
                'Examine why L1 norm creates exact zero weight sparsity (feature selection) while L2 norm enforces smooth weight decay.'}
              {activeTab === 'gradient-descent' &&
                'Simulate 2D loss surface descent, learning rates (slow crawl, sweet spot, ravine oscillations, divergence), and optimizer momentum.'}
              {activeTab === 'tradeoff' &&
                'Explore the fundamental Bias-Variance decomposition U-curve and training epoch dynamics with early stopping.'}
            </p>

            {/* Quick Segment Switcher */}
            <div className="quick-tab-selector">
              <button
                className={`quick-tab-btn ${activeTab === 'overfitting' ? 'active' : ''}`}
                onClick={() => setActiveTab('overfitting')}
              >
                <Activity size={15} />
                <span>1. Overfitting & Underfitting</span>
              </button>
              <button
                className={`quick-tab-btn ${activeTab === 'regularization' ? 'active' : ''}`}
                onClick={() => setActiveTab('regularization')}
              >
                <Shield size={15} />
                <span>2. L1 / L2 Regularization</span>
              </button>
              <button
                className={`quick-tab-btn ${activeTab === 'gradient-descent' ? 'active' : ''}`}
                onClick={() => setActiveTab('gradient-descent')}
              >
                <Zap size={15} />
                <span>3. Gradient Descent</span>
              </button>
              <button
                className={`quick-tab-btn ${activeTab === 'tradeoff' ? 'active' : ''}`}
                onClick={() => setActiveTab('tradeoff')}
              >
                <Scale size={15} />
                <span>4. Tradeoff Analysis</span>
              </button>
            </div>
          </div>
        </section>

        {/* Active Simulation View */}
        <section className="sim-stage-section">
          {activeTab === 'overfitting' && <OverfittingLab key={resetKey} />}
          {activeTab === 'regularization' && <RegularizationLab key={resetKey} />}
          {activeTab === 'gradient-descent' && <GradientDescentLab key={resetKey} />}
          {activeTab === 'tradeoff' && <TradeoffLab key={resetKey} />}
        </section>
      </main>

      <footer className="sim-footer">
        <div className="footer-content">
          <span>Deep Learning Core Simulation Suite • Focus on Generalization, Regularization & Optimization</span>
          <span className="mono-sub">Zero Fluff • Pure Real-time Math</span>
        </div>
      </footer>
    </div>
  );
}
