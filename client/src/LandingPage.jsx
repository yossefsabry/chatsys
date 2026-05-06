import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Terminal, Command, Monitor } from 'lucide-react';

const Logo = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
    <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#3B82F6"/>
    <path d="M2 17L12 22L22 17" stroke="#EAB308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 12L12 17L22 12" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function LandingPage() {
  const [joinId, setJoinId] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleCreateChat = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/chats', { method: 'POST' });
      const data = await res.json();
      if (data.id) {
        navigate(`/chat/${data.id}`);
      }
    } catch (err) {
      setError('Failed to create workspace.');
    }
  };

  const handleJoinChat = async (e) => {
    e.preventDefault();
    if (!joinId.trim()) return;

    try {
      const res = await fetch(`http://localhost:3001/api/chats/${joinId}`);
      if (res.ok) {
        navigate(`/chat/${joinId}`);
      } else {
        setError('Workspace not found.');
      }
    } catch (err) {
      setError('Error connecting to server.');
    }
  };

  return (
    <div className="h-screen overflow-y-auto bg-[#0a0a0a] text-[#e0e0e0] font-sans selection:bg-blue-500/30">
      
      {/* Top Navigation */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <div className="flex items-center font-bold text-lg tracking-tight text-white">
            <Logo />
            NeoChat
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium">
          <button onClick={handleCreateChat} className="btn-primary py-1.5 px-4 text-sm">
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-6 pt-24 pb-32 flex flex-col items-center text-center">
        
        {/* Pills */}
        <div className="flex items-center gap-3 mb-8">
          <span className="px-3 py-1 text-xs font-semibold tracking-wide bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full flex items-center gap-2">
            <Monitor className="w-3 h-3" /> WEB APP
          </span>
          <span className="px-3 py-1 text-xs font-semibold tracking-wide bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div> LIVE
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-6xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-10">
          <div className="flex items-center justify-center gap-3">
            <Logo /> NeoChat.
          </div>
        </h1>



        {error && (
          <div className="mb-8 p-3 w-full max-w-md border border-red-500/30 bg-red-500/10 text-red-400 text-sm rounded-lg">
            {error}
          </div>
        )}

        {/* Action Area */}
        <div className="w-full max-w-3xl grid md:grid-cols-2 gap-6 text-left">
          
          <div className="saas-panel p-6 flex flex-col">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-white mb-1">Create Workspace</h3>
              <p className="text-sm text-gray-400">Start a new secure environment for your team.</p>
            </div>
            <div className="mt-auto pt-4">
              <button onClick={handleCreateChat} className="w-full btn-primary py-3">
                Initialize Workspace
              </button>
            </div>
          </div>

          <div className="saas-panel p-6 flex flex-col">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-white mb-1">Join Workspace</h3>
              <p className="text-sm text-gray-400">Enter a workspace ID to connect.</p>
            </div>
            <form onSubmit={handleJoinChat} className="mt-auto pt-4 space-y-3">
              <div className="relative">
                <Command className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                  type="text" 
                  value={joinId}
                  onChange={(e) => setJoinId(e.target.value)}
                  placeholder="Workspace ID..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all text-sm"
                />
              </div>
              <button type="submit" className="w-full btn-secondary py-2.5">
                Connect
              </button>
            </form>
          </div>

        </div>
      </main>

    </div>
  );
}
