import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './LandingPage';
import ChatRoom from './ChatRoom';

function App() {
  useEffect(() => {
    const updateViewportHeight = () => {
      const viewport = window.visualViewport;
      const visibleHeight = viewport?.height || window.innerHeight;
      const offsetTop = viewport?.offsetTop || 0;
      const keyboardOffset = Math.max(0, window.innerHeight - visibleHeight - offsetTop);

      document.documentElement.style.setProperty('--keyboard-offset', `${keyboardOffset}px`);
      document.documentElement.style.setProperty('--visible-height', `${visibleHeight}px`);
      document.documentElement.classList.toggle('keyboard-open', keyboardOffset > 80);
    };

    updateViewportHeight();
    window.visualViewport?.addEventListener('resize', updateViewportHeight);
    window.visualViewport?.addEventListener('scroll', updateViewportHeight);
    window.addEventListener('resize', updateViewportHeight);

    return () => {
      window.visualViewport?.removeEventListener('resize', updateViewportHeight);
      window.visualViewport?.removeEventListener('scroll', updateViewportHeight);
      window.removeEventListener('resize', updateViewportHeight);
      document.documentElement.style.removeProperty('--keyboard-offset');
      document.documentElement.style.removeProperty('--visible-height');
      document.documentElement.classList.remove('keyboard-open');
    };
  }, []);

  return (
    <Router>
      <div className="h-full w-full">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/chat/:chatId" element={<ChatRoom />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
