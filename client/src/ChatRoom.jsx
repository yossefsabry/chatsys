import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { Image as ImageIcon, Send, Copy, CheckCircle2, Search, X } from 'lucide-react';

const SOCKET_SERVER_URL = 'http://localhost:3001';

const Logo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#3B82F6"/>
    <path d="M2 17L12 22L22 17" stroke="#EAB308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 12L12 17L22 12" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Skeleton loader + error fallback for images received from other users
const ChatImage = ({ src, alt }) => {
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState(false);

  if (error) {
    return (
      <div className="flex items-center gap-2 text-gray-500 text-sm py-2">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Image failed to load
      </div>
    );
  }

  return (
    <div className="relative min-w-[140px]">
      {!loaded && (
        <div className="w-48 h-32 bg-white/5 rounded-xl animate-pulse flex items-center justify-center">
          <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={`max-w-full rounded-xl transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0 absolute inset-0'}`}
        loading="lazy"
      />
    </div>
  );
};

const getUserColor = (userId) => {
  const colors = [
    { text: 'text-purple-400', bg: 'bg-purple-500/10' },
    { text: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { text: 'text-amber-400', bg: 'bg-amber-500/10' },
    { text: 'text-rose-400', bg: 'bg-rose-500/10' },
    { text: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  ];
  if (!userId) return colors[0];
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

export default function ChatRoom() {
  const { chatId } = useParams();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [socket, setSocket] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [highlightedMsgId, setHighlightedMsgId] = useState(null);
  const [jumpingToMsgId, setJumpingToMsgId] = useState(null);

  const [senderId] = useState(() => {
    const stored = localStorage.getItem('neochat_sender_id');
    if (stored) return stored;
    const newId = Math.random().toString(36).substring(2, 10);
    localStorage.setItem('neochat_sender_id', newId);
    return newId;
  });

  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const observerTargetRef = useRef(null);
  const previousScrollHeightRef = useRef(0);

  useEffect(() => {
    const newSocket = io(SOCKET_SERVER_URL);
    setSocket(newSocket);
    newSocket.emit('join_room', chatId);

    newSocket.on('receive_message', (message) => {
      setMessages((prev) => {
        if (prev.some(m => m.id === message.id)) return prev;
        return [...prev, message];
      });
      setTimeout(scrollToBottom, 100);
    });

    return () => newSocket.close();
  }, [chatId]);

  useEffect(() => {
    fetchMessages(0);
  }, [chatId]);

  const fetchMessages = useCallback(async (offset) => {
    setLoadingMore((currentlyLoading) => {
      if (currentlyLoading) return currentlyLoading;
      return currentlyLoading;
    });
    if (loadingMore) return;
    setLoadingMore(true);

    try {
      const res = await fetch(`${SOCKET_SERVER_URL}/api/chats/${chatId}/messages?limit=20&offset=${offset}`);
      const data = await res.json();
      
      if (data.length < 20) setHasMore(false);

      if (data.length > 0) {
        if (scrollContainerRef.current) {
          previousScrollHeightRef.current = scrollContainerRef.current.scrollHeight;
        }

        setMessages((prev) => {
          const existingIds = new Set(prev.map(m => m.id));
          const newMessages = data.filter(m => !existingIds.has(m.id));
          return [...newMessages, ...prev];
        });

        setTimeout(() => {
          if (scrollContainerRef.current && offset > 0) {
            const newScrollHeight = scrollContainerRef.current.scrollHeight;
            scrollContainerRef.current.scrollTop = newScrollHeight - previousScrollHeightRef.current;
          } else if (offset === 0) {
            scrollToBottom();
          }
        }, 50);
      }
    } catch (err) {
      console.error('Failed to fetch messages', err);
    } finally {
      setLoadingMore(false);
    }
  }, [chatId, loadingMore]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`${SOCKET_SERVER_URL}/api/chats/${chatId}/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        setSearchResults(data);
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, chatId]);

  // Load-until-found: when jumpingToMsgId is set, keep loading older messages
  // until the target element appears in the DOM, then scroll to it.
  const jumpingRef = useRef(null);
  useEffect(() => {
    jumpingRef.current = jumpingToMsgId;
  }, [jumpingToMsgId]);

  useEffect(() => {
    if (!jumpingToMsgId) return;

    const el = document.getElementById(`msg-${jumpingToMsgId}`);
    if (el) {
      // Found in DOM — scroll and highlight
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedMsgId(jumpingToMsgId);
      setJumpingToMsgId(null);
      setTimeout(() => setHighlightedMsgId(null), 2500);
    } else if (hasMore && !loadingMore) {
      // Not found yet — load more older messages
      fetchMessages(messages.length);
    } else if (!hasMore) {
      // Ran out of messages, give up
      setJumpingToMsgId(null);
    }
  }, [jumpingToMsgId, messages, hasMore, loadingMore]);

  const handleObserver = useCallback(
    (entries) => {
      const target = entries[0];
      if (target.isIntersecting && hasMore && !loadingMore && messages.length >= 20) {
        fetchMessages(messages.length);
      }
    },
    [hasMore, loadingMore, messages.length]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, { root: scrollContainerRef.current, rootMargin: '20px', threshold: 0 });
    if (observerTargetRef.current) observer.observe(observerTargetRef.current);
    return () => { if (observerTargetRef.current) observer.unobserve(observerTargetRef.current); };
  }, [handleObserver]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !socket) return;
    socket.emit('send_message', { chatId, senderId, type: 'text', content: inputValue });
    setInputValue('');
  };

  const fileInputRef = useRef(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !socket) return;

    setUploading(true);
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    // Optimistic preview: show a local preview bubble immediately
    const localPreviewUrl = URL.createObjectURL(file);
    const previewId = `preview-${Date.now()}`;
    const previewMsg = {
      id: previewId,
      sender_id: senderId,
      type: 'image',
      content: localPreviewUrl,
      created_at: new Date().toISOString(),
      isPreview: true,
    };
    setMessages(prev => [...prev, previewMsg]);
    setTimeout(scrollToBottom, 100);

    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await fetch(`${SOCKET_SERVER_URL}/api/chats/${chatId}/upload`, { method: 'POST', body: formData });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      if (data.url) {
        // Remove optimistic preview — the real message will come back via socket
        setMessages(prev => prev.filter(m => m.id !== previewId));
        URL.revokeObjectURL(localPreviewUrl);
        socket.emit('send_message', { chatId, senderId, type: 'image', content: `${SOCKET_SERVER_URL}${data.url}` });
      }
    } catch (err) {
      console.error('Image upload failed', err);
      // Remove optimistic preview and show error
      setMessages(prev => prev.filter(m => m.id !== previewId));
      URL.revokeObjectURL(localPreviewUrl);
      setUploadError('Upload failed. Please try again.');
      setTimeout(() => setUploadError(null), 4000);
    } finally {
      setUploading(false);
    }
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-screen flex flex-col bg-[#0a0a0a] text-[#e0e0e0] font-sans relative">
      
      {/* Top Navbar */}
      <nav className="flex items-center justify-between px-6 py-3 border-b border-white/5 bg-[#111] z-50">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center font-bold text-md tracking-tight text-white gap-2 hover:opacity-80 transition-opacity cursor-pointer">
            <Logo /> NeoChat
          </Link>
          <div className="h-5 w-px bg-white/10 mx-2"></div>
          <span className="text-sm font-medium text-gray-400 bg-white/5 px-3 py-1 rounded-full border border-white/5">
            {chatId.substring(0, 8)}...
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center">
            {isSearchOpen && (
              <input 
                type="text" 
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search history..."
                className="bg-white/5 border border-white/10 text-sm text-white px-3 py-1.5 rounded-l-lg focus:outline-none focus:border-blue-500/50 w-48 sm:w-64 transition-all"
              />
            )}
            <button 
              onClick={() => { setIsSearchOpen(!isSearchOpen); setSearchQuery(''); }}
              className={`p-2 transition-colors ${isSearchOpen ? 'bg-white/5 border-y border-r border-white/10 rounded-r-lg text-white' : 'rounded-lg text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              {isSearchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
            </button>
          </div>

          <button 
            onClick={copyUrl}
            className="flex items-center gap-2 text-xs font-medium px-4 py-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg transition-all"
          >
            {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied URL' : 'Share Workspace'}
          </button>
        </div>
      </nav>

      {/* Upload Error Toast */}
      {uploadError && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {uploadError}
        </div>
      )}
      {isSearchOpen && searchQuery && (
        <div className="sticky top-0 z-40 mx-auto max-w-6xl w-full"><div className="absolute right-0 w-80 bg-[#111] border border-white/10 rounded-xl shadow-2xl z-[100] max-h-80 overflow-y-auto">
          <div className="p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-white/5">
            Search Results
          </div>
          {isSearching ? (
            <div className="p-4 text-center text-sm text-gray-400 animate-pulse">Searching...</div>
          ) : searchResults.length > 0 ? (
            <div className="flex flex-col">
              {searchResults.map((res) => (
                <div 
                  key={res.id} 
                  className="p-3 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer" 
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery('');
                    const el = document.getElementById(`msg-${res.id}`);
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      setHighlightedMsgId(res.id);
                      setTimeout(() => setHighlightedMsgId(null), 2500);
                    } else {
                      // Not in DOM yet — trigger load-until-found
                      setJumpingToMsgId(res.id);
                    }
                  }}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-blue-400">
                      {res.sender_id === senderId ? 'You' : `User ${res.sender_id.substring(0, 4)}`}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      {new Date(res.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 line-clamp-2">{res.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-gray-400">No results found</div>
          )}
        </div></div>
      )}

      <div className="flex-1 flex max-w-6xl w-full mx-auto overflow-hidden">
        
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col relative border-x border-white/5 bg-[#0e0e0e]">
          
          {/* Message List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6" ref={scrollContainerRef}>
            <div ref={observerTargetRef} className="h-4 w-full" />
            
            {loadingMore && (
              <div className="flex justify-center my-4">
                <span className="text-xs font-medium text-gray-500 bg-white/5 px-3 py-1 rounded-full">
                  Loading history...
                </span>
              </div>
            )}

            {jumpingToMsgId && (
              <div className="flex justify-center my-4">
                <span className="text-xs font-medium text-blue-400 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-full flex items-center gap-2 animate-pulse">
                  <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  Loading message from history...
                </span>
              </div>
            )}


            {messages.map((msg, index) => {
              const isMe = msg.sender_id === senderId;
              const userColor = isMe ? { text: 'text-white', bg: 'bg-blue-600' } : getUserColor(msg.sender_id);
              const showHeader = index === 0 || messages[index - 1].sender_id !== msg.sender_id;

              return (
                <div
                  id={`msg-${msg.id}`}
                  key={msg.id || index}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} message-enter transition-colors duration-500 rounded-xl ${
                    highlightedMsgId === msg.id ? 'bg-yellow-400/10' : ''
                  }`}
                >
                  {showHeader && (
                    <span className={`text-xs font-medium mb-1.5 px-1 ${isMe ? 'text-gray-400' : userColor.text}`}>
                      {isMe ? 'You' : `User ${msg.sender_id.substring(0, 4)}`}
                    </span>
                  )}
                  <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${isMe ? 'rounded-tr-sm bg-blue-600 text-white' : `rounded-tl-sm ${userColor.bg} text-gray-100 border border-white/5`}`}>
                    {msg.type === 'text' ? (
                      <p className="break-all whitespace-pre-wrap leading-relaxed text-[15px]">{msg.content}</p>
                    ) : msg.isPreview ? (
                      // Optimistic preview while upload is in-progress
                      <div className="relative">
                        <img src={msg.content} alt="Uploading..." className="max-w-full rounded-xl opacity-60" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl">
                          <div className="flex flex-col items-center gap-1">
                            <svg className="w-5 h-5 text-white animate-spin" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                            </svg>
                            <span className="text-white text-[10px] font-medium">Uploading...</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <ChatImage src={msg.content} alt="Uploaded image" />
                    )}
                  </div>
                  <span className="text-[10px] text-gray-600 mt-1.5 px-1 font-medium">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-[#111] border-t border-white/5">
            <form onSubmit={handleSendMessage} className="flex items-end gap-2 max-w-4xl mx-auto">
              <label className="cursor-pointer p-3 text-gray-400 hover:text-white transition-colors rounded-xl hover:bg-white/5 group relative flex-shrink-0">
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                <ImageIcon className={`w-5 h-5 ${uploading ? 'animate-bounce' : ''}`} />
              </label>
              
              <div className="flex-1 relative flex items-center bg-white/5 border border-white/10 rounded-xl focus-within:border-blue-500/50 focus-within:bg-white/10 transition-all">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type a message..."
                  className="w-full bg-transparent p-3 text-white placeholder-gray-500 text-[15px] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="p-3 bg-white text-black hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed group flex-shrink-0 font-medium flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:block text-sm">Send</span>
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
