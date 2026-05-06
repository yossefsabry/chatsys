import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Image as ImageIcon, Send, Copy, CheckCircle2, Search, X, Smile } from 'lucide-react';
import { supabase } from './lib/supabase';

const GIF_PAGE_SIZE = 10;
const mainGifModules = import.meta.glob('../../gifs/main_gifs/*.{webp,webm,gif,mp4}', {
  eager: true,
  query: '?url',
  import: 'default',
});
const adultGifModules = import.meta.glob('../../gifs/+18/*.{webp,webm,gif,mp4}', {
  eager: true,
  query: '?url',
  import: 'default',
});

const toGifList = (modules) => Object.entries(modules)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([filePath, url]) => {
    const name = filePath.split('/').pop();
    const isVideo = /\.(webm|mp4)$/i.test(name);
    return { id: name, url, isVideo };
  });

const GIF_CATEGORIES = {
  main: { label: 'Main GIFs', items: toGifList(mainGifModules) },
  adult: { label: '+18', items: toGifList(adultGifModules) },
};

const Logo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#3B82F6"/>
    <path d="M2 17L12 22L22 17" stroke="#EAB308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 12L12 17L22 12" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Skeleton loader + error fallback for images/videos
const ChatImage = ({ src, alt }) => {
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState(false);
  const isVideo = /\.(webm|mp4)(\?|$)/i.test(src);

  if (error) {
    return (
      <div className="flex items-center gap-2 text-gray-500 text-sm py-2">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Media failed to load
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
      {isVideo ? (
        <video src={src} aria-label={alt} onLoadedData={() => setLoaded(true)} onError={() => setError(true)}
          className={`chat-media rounded-xl transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0 absolute inset-0'}`}
          autoPlay loop muted playsInline preload="metadata" />
      ) : (
        <img src={src} alt={alt} onLoad={() => setLoaded(true)} onError={() => setError(true)}
          className={`chat-media rounded-xl transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0 absolute inset-0'}`}
          loading="lazy" />
      )}
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
  return colors[Math.abs(hash) % colors.length];
};

export default function ChatRoom() {
  const { chatId } = useParams();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [highlightedMsgId, setHighlightedMsgId] = useState(null);
  const [jumpingToMsgId, setJumpingToMsgId] = useState(null);
  const [isGifOpen, setIsGifOpen] = useState(false);
  const [gifCategory, setGifCategory] = useState('main');
  const [visibleGifCount, setVisibleGifCount] = useState(GIF_PAGE_SIZE);
  const [isGifLoading, setIsGifLoading] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);

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
  const fileInputRef = useRef(null);
  const messageInputRef = useRef(null);
  const gifCacheRef = useRef(new Map());
  const gifMessageCounterRef = useRef(0);

  const gifItems = GIF_CATEGORIES[gifCategory].items;
  const visibleGifs = gifItems.slice(0, visibleGifCount);
  const hasMoreGifs = visibleGifCount < gifItems.length;

  const checkNearBottom = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 120;
  }, []);

  const updateNearBottom = useCallback(() => {
    const nearBottom = checkNearBottom();
    setIsNearBottom(nearBottom);
    if (nearBottom) setHasUnreadMessages(false);
    return nearBottom;
  }, [checkNearBottom]);

  const preloadGif = useCallback((gif) => {
    if (!gif || gifCacheRef.current.has(gif.url)) return Promise.resolve();

    return new Promise((resolve) => {
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        resolve();
      };
      setTimeout(finish, 1500);

      if (gif.isVideo) {
        const video = document.createElement('video');
        video.muted = true;
        video.playsInline = true;
        video.preload = 'auto';
        video.src = gif.url;
        video.onloadeddata = finish;
        video.onerror = finish;
        gifCacheRef.current.set(gif.url, video);
        video.load();
      } else {
        const img = new Image();
        img.onload = finish;
        img.onerror = finish;
        img.src = gif.url;
        gifCacheRef.current.set(gif.url, img);
      }
    });
  }, []);

  // Subscribe to real-time messages via Supabase Realtime
  useEffect(() => {
    const channel = supabase
      .channel(`chat:${chatId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${chatId}`,
      }, (payload) => {
        const shouldStickToBottom = checkNearBottom() || payload.new.sender_id === senderId;
        setMessages((prev) => {
          if (prev.some(m => m.id === payload.new.id)) return prev;
          const pendingIndex = prev.findIndex(m =>
            m.status === 'sending' &&
            m.sender_id === payload.new.sender_id &&
            m.type === payload.new.type &&
            m.content === payload.new.content
          );
          if (pendingIndex !== -1) {
            const next = [...prev];
            next[pendingIndex] = payload.new;
            return next;
          }
          return [...prev, payload.new];
        });
        if (shouldStickToBottom) {
          requestAnimationFrame(() => scrollToBottom('auto'));
        } else {
          setHasUnreadMessages(true);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [chatId, checkNearBottom, senderId]);

  useEffect(() => {
    if (!isGifOpen) return;
    let cancelled = false;
    const currentBatch = gifItems.slice(0, visibleGifCount);
    const nextBatch = gifItems.slice(visibleGifCount, visibleGifCount + GIF_PAGE_SIZE);

    Promise.all(currentBatch.map(preloadGif)).then(() => {
      if (!cancelled) setIsGifLoading(false);
      nextBatch.forEach(preloadGif);
    });

    return () => { cancelled = true; };
  }, [isGifOpen, gifItems, visibleGifCount, preloadGif]);

  // Initial message load
  useEffect(() => {
    setMessages([]);
    setHasMore(true);
    setHasUnreadMessages(false);
    setIsNearBottom(true);
    fetchMessages(0, true);
  }, [chatId]);

  const fetchMessages = useCallback(async (offset, isInitial = false) => {
    if (loadingMore) return;
    setLoadingMore(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('id', { ascending: false })
        .range(offset, offset + 19);

      if (error) throw error;
      const fetched = data?.reverse() || [];

      if (fetched.length < 20) setHasMore(false);

      if (fetched.length > 0) {
        if (scrollContainerRef.current && !isInitial) {
          previousScrollHeightRef.current = scrollContainerRef.current.scrollHeight;
        }
        setMessages((prev) => {
          const existingIds = new Set(prev.map(m => m.id));
          const newMsgs = fetched.filter(m => !existingIds.has(m.id));
          return [...newMsgs, ...prev];
        });
        setTimeout(() => {
          if (scrollContainerRef.current && offset > 0) {
            const newH = scrollContainerRef.current.scrollHeight;
            scrollContainerRef.current.scrollTop = newH - previousScrollHeightRef.current;
          } else if (isInitial) {
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

  // Debounced search via Supabase
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const t = setTimeout(async () => {
      setIsSearching(true);
      try {
        const { data } = await supabase
          .from('messages')
          .select('*')
          .eq('chat_id', chatId)
          .eq('type', 'text')
          .ilike('content', `%${searchQuery}%`)
          .order('id', { ascending: false })
          .limit(50);
        setSearchResults(data || []);
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setIsSearching(false);
      }
    }, 500);
    return () => clearTimeout(t);
  }, [searchQuery, chatId]);

  // Load-until-found for jump to message
  useEffect(() => {
    if (!jumpingToMsgId) return;
    const el = document.getElementById(`msg-${jumpingToMsgId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedMsgId(jumpingToMsgId);
      setJumpingToMsgId(null);
      setTimeout(() => setHighlightedMsgId(null), 2500);
    } else if (hasMore && !loadingMore) {
      fetchMessages(messages.length);
    } else if (!hasMore) {
      setJumpingToMsgId(null);
    }
  }, [jumpingToMsgId, messages, hasMore, loadingMore]);

  // Infinite scroll observer
  const handleObserver = useCallback((entries) => {
    const target = entries[0];
    if (target.isIntersecting && hasMore && !loadingMore && messages.length >= 20) {
      fetchMessages(messages.length);
    }
  }, [hasMore, loadingMore, messages.length]);

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      root: scrollContainerRef.current, rootMargin: '20px', threshold: 0
    });
    if (observerTargetRef.current) observer.observe(observerTargetRef.current);
    return () => { if (observerTargetRef.current) observer.unobserve(observerTargetRef.current); };
  }, [handleObserver]);

  const scrollToBottom = (behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior, block: 'end' });
    setIsNearBottom(true);
    setHasUnreadMessages(false);
  };

  const keepInputVisible = () => {
    setIsGifOpen(false);
    setTimeout(() => {
      messageInputRef.current?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      if (checkNearBottom()) scrollToBottom('auto');
    }, 180);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    const content = inputValue;
    const tempId = `pending-${Date.now()}`;
    setInputValue('');
    setMessages(prev => [...prev, {
      id: tempId,
      chat_id: chatId,
      sender_id: senderId,
      type: 'text',
      content,
      created_at: new Date().toISOString(),
      status: 'sending',
    }]);
    requestAnimationFrame(() => scrollToBottom('smooth'));

    const { data, error } = await supabase.from('messages').insert({
      chat_id: chatId, sender_id: senderId, type: 'text', content
    }).select().single();

    if (error) {
      console.error('Failed to send message', error);
      setMessages(prev => prev.map(m => m.id === tempId ? { ...m, status: 'failed' } : m));
      return;
    }

    setMessages(prev => prev.map(m => m.id === tempId ? data : m));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    // Optimistic preview
    const localUrl = URL.createObjectURL(file);
    const previewId = `preview-${Date.now()}`;
    setMessages(prev => [...prev, {
      id: previewId, sender_id: senderId, type: 'image',
      content: localUrl, created_at: new Date().toISOString(), isPreview: true,
    }]);
    requestAnimationFrame(() => scrollToBottom('smooth'));

    try {
      const ext = file.name.split('.').pop();
      const path = `${chatId}/${Date.now()}.${ext}`;
      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from('chat-images').upload(path, file, { cacheControl: '3600', upsert: false });
      if (uploadErr) throw uploadErr;

      const { data: { publicUrl } } = supabase.storage
        .from('chat-images').getPublicUrl(uploadData.path);

      // Remove preview, insert real message
      setMessages(prev => prev.filter(m => m.id !== previewId));
      URL.revokeObjectURL(localUrl);

      await supabase.from('messages').insert({
        chat_id: chatId, sender_id: senderId, type: 'image', content: publicUrl
      });
    } catch (err) {
      console.error('Image upload failed', err);
      setMessages(prev => prev.filter(m => m.id !== previewId));
      URL.revokeObjectURL(localUrl);
      setUploadError('Upload failed. Please try again.');
      setTimeout(() => setUploadError(null), 4000);
    } finally {
      setUploading(false);
    }
  };

  const handleGifCategoryChange = (category) => {
    setGifCategory(category);
    setVisibleGifCount(GIF_PAGE_SIZE);
    setIsGifLoading(true);
  };

  const toggleGifPanel = () => {
    messageInputRef.current?.blur();
    if (!isGifOpen) setIsGifLoading(true);
    setIsGifOpen(open => !open);
  };

  const loadMoreGifs = useCallback(() => {
    if (!hasMoreGifs || isGifLoading) return;
    setIsGifLoading(true);
    setVisibleGifCount(count => count + GIF_PAGE_SIZE);
  }, [hasMoreGifs, isGifLoading]);

  const handleGifScroll = (e) => {
    const el = e.currentTarget;
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 80;
    if (nearBottom) loadMoreGifs();
  };

  const handleGifSelect = async (gif) => {
    setIsGifOpen(false);
    gifMessageCounterRef.current += 1;
    const tempId = `gif-${gifMessageCounterRef.current}`;
    setMessages(prev => [...prev, {
      id: tempId,
      chat_id: chatId,
      sender_id: senderId,
      type: 'image',
      content: gif.url,
      created_at: new Date().toISOString(),
      status: 'sending',
    }]);
    requestAnimationFrame(() => scrollToBottom('smooth'));

    const { data, error } = await supabase.from('messages').insert({
      chat_id: chatId, sender_id: senderId, type: 'image', content: gif.url
    }).select().single();

    if (error) {
      console.error('Failed to send GIF', error);
      setMessages(prev => prev.map(m => m.id === tempId ? { ...m, status: 'failed' } : m));
      return;
    }

    setMessages(prev => prev.map(m => m.id === tempId ? data : m));
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="app-screen flex flex-col overflow-hidden bg-[#0a0a0a] text-[#e0e0e0] font-sans relative">

      {/* Top Navbar */}
      <nav className="flex shrink-0 items-center justify-between gap-2 px-3 py-2 sm:px-6 sm:py-3 border-b border-white/5 bg-[#111] z-50">
        <div className="flex min-w-0 items-center gap-2 sm:gap-4">
          <Link to="/" className="flex shrink-0 items-center font-bold text-sm sm:text-md tracking-tight text-white gap-2 hover:opacity-80 transition-opacity cursor-pointer">
            <Logo /> NeoChat
          </Link>
          <div className="hidden h-5 w-px bg-white/10 mx-2 sm:block"></div>
          <span className="truncate text-xs sm:text-sm font-medium text-gray-400 bg-white/5 px-2 sm:px-3 py-1 rounded-full border border-white/5">
            {chatId.substring(0, 8)}...
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-3">
          <div className="flex items-center">
            {isSearchOpen && (
              <input type="text" autoFocus value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search history..."
                className="bg-white/5 border border-white/10 text-sm text-white px-3 py-1.5 rounded-l-lg focus:outline-none focus:border-blue-500/50 w-36 sm:w-64 transition-all"
              />
            )}
            <button onClick={() => { setIsSearchOpen(!isSearchOpen); setSearchQuery(''); }}
              className={`p-2 transition-colors ${isSearchOpen ? 'bg-white/5 border-y border-r border-white/10 rounded-r-lg text-white' : 'rounded-lg text-gray-400 hover:text-white hover:bg-white/5'}`}>
              {isSearchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
            </button>
          </div>
          <button onClick={copyUrl}
            className="flex cursor-pointer items-center gap-2 text-xs font-medium px-2 sm:px-4 py-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg transition-all">
            {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span className="hidden sm:inline">{copied ? 'Copied URL' : 'Share Workspace'}</span>
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

      {/* Search Dropdown */}
      {isSearchOpen && searchQuery && (
        <div className="sticky top-0 z-40 mx-auto max-w-6xl w-full">
          <div className="absolute right-0 w-80 bg-[#111] border border-white/10 rounded-xl shadow-2xl z-[100] max-h-80 overflow-y-auto">
            <div className="p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-white/5">
              Search Results
            </div>
            {isSearching ? (
              <div className="p-4 text-center text-sm text-gray-400 animate-pulse">Searching...</div>
            ) : searchResults.length > 0 ? (
              <div className="flex flex-col">
                {searchResults.map((res) => (
                  <div key={res.id}
                    className="p-3 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => {
                      setIsSearchOpen(false); setSearchQuery('');
                      const el = document.getElementById(`msg-${res.id}`);
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        setHighlightedMsgId(res.id);
                        setTimeout(() => setHighlightedMsgId(null), 2500);
                      } else {
                        setJumpingToMsgId(res.id);
                      }
                    }}>
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
          </div>
        </div>
      )}

      <div className="flex-1 flex w-full max-w-6xl mx-auto overflow-hidden">
        <div className="flex-1 flex min-h-0 flex-col relative border-white/5 bg-[#0e0e0e] sm:border-x">

          {/* Message List */}
          <div className="keyboard-compact flex-1 min-h-0 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6" ref={scrollContainerRef} onScroll={updateNearBottom}>
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

            {messages.length === 0 && !loadingMore && !jumpingToMsgId && (
              <div className="flex justify-center pt-3 sm:pt-6 message-enter">
                <div className="w-full max-w-xl rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 via-white/[0.03] to-yellow-500/10 p-4 text-center shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:p-6">
                  <div className="keyboard-hide mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                    <Logo />
                  </div>
                  <h2 className="text-xl font-bold tracking-tight text-white">Welcome to NeoChat</h2>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-400">
                    This workspace is ready. Share the link or send the first message.
                  </p>
                  <div className="mt-5 inline-flex items-center rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-medium text-gray-400">
                    Workspace {chatId.substring(0, 8)}...
                  </div>
                </div>
              </div>
            )}

            {messages.map((msg, index) => {
              const isMe = msg.sender_id === senderId;
              const userColor = isMe ? { text: 'text-white', bg: 'bg-blue-600' } : getUserColor(msg.sender_id);
              const bubbleClass = msg.status === 'sending'
                ? 'rounded-tr-sm bg-blue-400/40 text-white border border-blue-300/20'
                : msg.status === 'failed'
                  ? 'rounded-tr-sm bg-red-500/20 text-red-100 border border-red-500/30'
                  : isMe
                    ? 'rounded-tr-sm bg-blue-600 text-white'
                    : `rounded-tl-sm ${userColor.bg} text-gray-100 border border-white/5`;
              const showHeader = index === 0 || messages[index - 1].sender_id !== msg.sender_id;
              return (
                <div id={`msg-${msg.id}`} key={msg.id || index}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} message-enter transition-colors duration-500 rounded-xl ${highlightedMsgId === msg.id ? 'bg-yellow-400/10' : ''}`}>
                  {showHeader && (
                    <span className={`text-xs font-medium mb-1.5 px-1 ${isMe ? 'text-gray-400' : userColor.text}`}>
                      {isMe ? 'You' : `User ${msg.sender_id.substring(0, 4)}`}
                    </span>
                  )}
                  <div className={`max-w-[88%] sm:max-w-[75%] px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl ${bubbleClass}`}>
                    {msg.type === 'text' ? (
                      <p className="break-all whitespace-pre-wrap leading-relaxed text-[15px]">{msg.content}</p>
                    ) : msg.isPreview ? (
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
                    {msg.status === 'sending'
                      ? 'Sending...'
                      : msg.status === 'failed'
                        ? 'Not sent'
                        : new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })}
            {hasUnreadMessages && !isNearBottom && (
              <button type="button" onClick={() => scrollToBottom('smooth')}
                className="sticky bottom-2 left-1/2 z-30 mx-auto flex -translate-x-1/2 cursor-pointer items-center rounded-full border border-blue-500/30 bg-blue-500/20 px-4 py-2 text-xs font-semibold text-blue-100 shadow-lg backdrop-blur transition-colors hover:bg-blue-500/30">
                New message
              </button>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="safe-bottom relative shrink-0 px-2 pt-2 sm:p-4 bg-[#111] border-t border-white/5">
            {isGifOpen && (
              <div className="absolute bottom-full left-2 z-50 mb-2 w-[calc(100vw-1rem)] max-w-[560px] overflow-hidden rounded-2xl border border-white/10 bg-[#111] shadow-2xl sm:left-16 sm:mb-3 sm:w-[min(560px,calc(100vw-2rem))]">
                <div className="flex items-center justify-between border-b border-white/5 p-3">
                  <div className="flex gap-2">
                    {Object.entries(GIF_CATEGORIES).map(([key, category]) => (
                      <button key={key} type="button" onClick={() => handleGifCategoryChange(key)}
                        className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${gifCategory === key ? 'bg-blue-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}>
                        {category.label}
                      </button>
                    ))}
                  </div>
                  <button type="button" onClick={() => setIsGifOpen(false)}
                    className="cursor-pointer rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-white/5 hover:text-white">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="max-h-[45dvh] overflow-y-auto p-2 sm:max-h-[340px] sm:p-3" onScroll={handleGifScroll}>
                  {isGifLoading && visibleGifCount <= GIF_PAGE_SIZE ? (
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3">
                      {Array.from({ length: GIF_PAGE_SIZE }).map((_, index) => (
                        <div key={index} className="aspect-square animate-pulse rounded-xl bg-white/5" />
                      ))}
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3">
                        {visibleGifs.map((gif) => (
                          <button key={gif.url} type="button" onClick={() => handleGifSelect(gif)}
                            className="group aspect-square cursor-pointer overflow-hidden rounded-xl border border-white/5 bg-black/30 transition-transform hover:scale-[1.03] hover:border-blue-400/40">
                            {gif.isVideo ? (
                              <video src={gif.url} className="h-full w-full object-cover" autoPlay loop muted playsInline preload="metadata" />
                            ) : (
                              <img src={gif.url} alt="GIF option" className="h-full w-full object-cover" loading="lazy" />
                            )}
                          </button>
                        ))}
                      </div>

                      {isGifLoading && visibleGifCount > GIF_PAGE_SIZE && (
                        <div className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-gray-400">
                          <span className="h-3 w-3 animate-spin rounded-full border border-blue-400/20 border-t-blue-400" />
                          Loading more GIFs...
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleSendMessage} className="flex items-end gap-1.5 sm:gap-2 max-w-4xl mx-auto">
              <label className="cursor-pointer p-2.5 sm:p-3 text-gray-400 hover:text-white transition-colors rounded-xl hover:bg-white/5 relative flex-shrink-0">
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                <ImageIcon className={`w-5 h-5 ${uploading ? 'animate-bounce' : ''}`} />
              </label>
              <button type="button" onClick={toggleGifPanel}
                className={`cursor-pointer p-2.5 sm:p-3 transition-colors rounded-xl hover:bg-white/5 relative flex-shrink-0 ${isGifOpen ? 'text-blue-400 bg-blue-500/10' : 'text-gray-400 hover:text-white'}`}>
                <Smile className="w-5 h-5" />
              </button>
              <div className="flex-1 flex items-center bg-white/5 border border-white/10 rounded-xl focus-within:border-blue-500/50 focus-within:bg-white/10 transition-all">
                <input ref={messageInputRef} type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onFocus={keepInputVisible}
                  placeholder="Type a message..."
                  className="w-full min-w-0 bg-transparent p-2.5 sm:p-3 text-white placeholder-gray-500 text-[15px] focus:outline-none" />
              </div>
              <button type="submit" disabled={!inputValue.trim()}
                className="cursor-pointer p-2.5 sm:p-3 bg-white text-black hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 font-medium flex items-center gap-2">
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
