import { useState } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { WhySection } from './components/WhySection';
import { ConceptGallery } from './components/ConceptGallery';
import { ConceptModal } from './components/ConceptModal';
import { InteractiveLab } from './components/InteractiveLab';
import { ComparisonMatrix } from './components/ComparisonMatrix';
import { DecisionClinic } from './components/DecisionClinic';
import { TeachingMode } from './components/TeachingMode';
import { Takeaways } from './components/Takeaways';
import { FAQSection } from './components/FAQSection';
import { Footer } from './components/Footer';
import type { ConceptInfo } from './data/concepts';

export default function App() {
  const [activeConcept, setActiveConcept] = useState<ConceptInfo | null>(null);
  const [walkthroughMode, setWalkthroughMode] = useState<boolean>(false);
  const [resetKey, setResetKey] = useState<number>(0);

  const handleReset = () => {
    setActiveConcept(null);
    setResetKey((k) => k + 1);
    // Smooth scroll back to top or lab
    document.getElementById('top')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleToggleWalkthroughMode = () => {
    const nextState = !walkthroughMode;
    setWalkthroughMode(nextState);
    if (nextState) {
      document.getElementById('walkthrough')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <Header
        walkthroughMode={walkthroughMode}
        onToggleWalkthroughMode={handleToggleWalkthroughMode}
        onReset={handleReset}
      />

      <main>
        <HeroSection />
        <WhySection />
        <ConceptGallery onSelectConcept={(c) => setActiveConcept(c)} />
        <InteractiveLab resetKey={resetKey} />
        <ComparisonMatrix resetKey={resetKey} />
        <DecisionClinic />
        <TeachingMode />
        <Takeaways />
        <FAQSection />
      </main>

      <Footer />

      {activeConcept && (
        <ConceptModal concept={activeConcept} onClose={() => setActiveConcept(null)} />
      )}
    </>
  );
}
