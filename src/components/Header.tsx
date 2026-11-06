import React from 'react';
import { RotateCcw, Activity, Shield, Zap, Scale } from 'lucide-react';

export type SimTab = 'overfitting' | 'regularization' | 'gradient-descent' | 'tradeoff';

interface HeaderProps {
  activeTab: SimTab;
  onSelectTab: (tab: SimTab) => void;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onReset,
}) => {
  return (
    <header className="site-header">
      <div className="header-container">
        <div className="brand-link">
          <div className="brand-symbol">Ω</div>
          <div className="brand-text">
            <h1>DEEP LEARNING SIMULATION LAB</h1>
            <span>INTERACTIVE FOUNDATIONS • CORE SUITE</span>
          </div>
        </div>

        <nav className="nav-links">
          <button
            className={`nav-link-btn ${activeTab === 'overfitting' ? 'active' : ''}`}
            onClick={() => onSelectTab('overfitting')}
          >
            <Activity size={14} />
            <span>Overfitting & Underfitting</span>
          </button>

          <button
            className={`nav-link-btn ${activeTab === 'regularization' ? 'active' : ''}`}
            onClick={() => onSelectTab('regularization')}
          >
            <Shield size={14} />
            <span>L1 / L2 Regularization</span>
          </button>

          <button
            className={`nav-link-btn ${activeTab === 'gradient-descent' ? 'active' : ''}`}
            onClick={() => onSelectTab('gradient-descent')}
          >
            <Zap size={14} />
            <span>Gradient Descent</span>
          </button>

          <button
            className={`nav-link-btn ${activeTab === 'tradeoff' ? 'active' : ''}`}
            onClick={() => onSelectTab('tradeoff')}
          >
            <Scale size={14} />
            <span>Tradeoff Analysis</span>
          </button>
        </nav>

        <div className="header-actions">
          <button
            className="reset-button"
            onClick={onReset}
            title="Reset parameters to initial defaults"
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </header>
  );
};
