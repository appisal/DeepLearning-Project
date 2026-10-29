import React from 'react';
import { RotateCcw, BookOpen } from 'lucide-react';

interface HeaderProps {
  walkthroughMode: boolean;
  onToggleWalkthroughMode: () => void;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  walkthroughMode,
  onToggleWalkthroughMode,
  onReset,
}) => {
  return (
    <header className="site-header">
      <div className="header-container">
        <a href="#top" className="brand-link">
          <div className="brand-symbol">Ω</div>
          <div className="brand-text">
            <h1>GENERALIZATION ATLAS</h1>
            <span>DEEP LEARNING FOUNDATIONS • VOL. 01</span>
          </div>
        </a>

        <nav className="nav-links">
          <a href="#why" className="nav-link">
            <span>01</span> Concept
          </a>
          <a href="#gallery" className="nav-link">
            <span>02</span> Gallery
          </a>
          <a href="#lab" className="nav-link">
            <span>03</span> Live Lab
          </a>
          <a href="#matrix" className="nav-link">
            <span>04</span> Matrix
          </a>
          <a href="#clinic" className="nav-link">
            <span>05</span> Clinic
          </a>
          <a href="#walkthrough" className="nav-link">
            <span>06</span> Walkthrough
          </a>
        </nav>

        <div className="header-actions">
          <button
            className={`mode-toggle ${walkthroughMode ? 'active' : ''}`}
            onClick={onToggleWalkthroughMode}
            title="Jump to the step-by-step conceptual walkthrough module"
          >
            <BookOpen size={15} />
            <span>{walkthroughMode ? 'Walkthrough Mode' : 'Guided Tour'}</span>
          </button>

          <button
            className="reset-button"
            onClick={onReset}
            title="Reset all interactive labs and filters"
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </header>
  );
};
