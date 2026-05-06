import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './LandingPage';
import ChatRoom from './ChatRoom';

function App() {
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
