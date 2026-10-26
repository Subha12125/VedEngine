import { useState, useEffect, useRef } from 'react';
import { searchAPI } from '../services/api';

/**
 * Searchbar Component - Google Search Style
 * -----------------------------------------
 * Features:
 * - Rounded-full pill search bar
 * - Left '+' quick action & search magnifier
 * - Speech recognition (voice search via Web Speech API)
 * - Lens / Document trigger
 * - '✦ AI Mode' grounded toggle badge
 * - Instant suggestions dropdown
 * - Optional centered Google buttons ("VedEngine Search" & "I'm Feeling Lucky")
 */
export default function Searchbar({
  onSearch,
  initialQuery = '',
  onAddClick,
  onLensClick,
  showGoogleButtons = false,
  onLucky,
  aiMode = true,
  onToggleAiMode,
}) {
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const containerRef = useRef(null);

  // Sync internal query when initialQuery prop updates
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  // Debounced auto-suggestions
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoadingSuggestions(true);
        const res = await searchAPI.getSuggestions(query.trim());
        const list = res.data?.data || res.data?.suggestions || [];
        setSuggestions(Array.isArray(list) ? list : []);
        setShowSuggestions(true);
      } catch {
        // Silently handle suggestion errors
      } finally {
        setLoadingSuggestions(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (query.trim()) {
      setShowSuggestions(false);
      onSearch(query.trim(), aiMode);
    }
  };

  const handleSelectSuggestion = (suggestionText) => {
    setQuery(suggestionText);
    setShowSuggestions(false);
    onSearch(suggestionText, aiMode);
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // Web Speech API Voice Search
  const handleVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice search is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsListening(false);
        onSearch(transcript, aiMode);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  return (
    <div ref={containerRef} className="w-full max-w-2xl mx-auto flex flex-col items-center">
      
      {/* Google-Style Pill Search Container */}
      <form
        onSubmit={handleSubmit}
        className="relative w-full flex items-center bg-white border border-[#ebdcc9] hover:border-[#d97757]/40 focus-within:border-[#d97757] focus-within:ring-4 focus-within:ring-[#d97757]/10 rounded-full px-4 py-2.5 sm:py-3 shadow-sm hover:shadow-md transition-all duration-200"
      >
        {/* Left Action: '+' Quick Add / Upload */}
        <button
          type="button"
          onClick={onAddClick}
          title="Upload or index document"
          className="text-[#8c7b6c] hover:text-[#d97757] p-1.5 rounded-full hover:bg-[#faf4ec] transition-colors cursor-pointer shrink-0"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 4v16m8-8H4" />
          </svg>
        </button>

        {/* Search Magnifier Icon */}
        <div className="text-[#8c7b6c] pl-1 pr-2 pointer-events-none shrink-0">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Main Text Input */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setShowSuggestions(true)}
          placeholder={isListening ? 'Listening... Speak now' : 'Search indexed documents or ask any question...'}
          className="w-full bg-transparent border-none outline-none text-[#2d2721] placeholder-[#a89887] text-sm sm:text-base px-1 selection:bg-[#d97757] selection:text-white"
        />

        {/* Right Action Icons Group */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          
          {/* Clear 'X' Button */}
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-[#8c7b6c] hover:text-[#2d2721] rounded-full hover:bg-[#f4ebd9] transition-colors cursor-pointer"
              title="Clear search"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          {/* Voice Search (Microphone) */}
          <button
            type="button"
            onClick={handleVoiceSearch}
            title="Search by voice"
            className={`p-1.5 rounded-full transition-all cursor-pointer ${
              isListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'text-[#786b5e] hover:text-[#2d2721] hover:bg-[#faf4ec]'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m-4 0h8m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>

          {/* Google Lens / Document Search Icon */}
          <button
            type="button"
            onClick={onLensClick || onAddClick}
            title="Search with document or image"
            className="p-1.5 text-[#786b5e] hover:text-[#2d2721] rounded-full hover:bg-[#faf4ec] transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          {/* '✦ AI Mode' Toggle Badge / Button */}
          <button
            type="button"
            onClick={onToggleAiMode}
            title={aiMode ? 'AI Synthesis Mode: ON (Click to toggle)' : 'AI Synthesis Mode: OFF (Click to toggle)'}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              aiMode
                ? 'bg-[#d97757] text-white shadow-xs'
                : 'bg-[#f4ebd9] text-[#786b5e] hover:text-[#2d2721] border border-[#ebdcc9]'
            }`}
          >
            <span className="text-[11px]">✦</span>
            <span className="hidden sm:inline">AI Mode</span>
          </button>

        </div>
      </form>

      {/* Auto-suggestions Popover */}
      {showSuggestions && (suggestions.length > 0 || loadingSuggestions) && (
        <div className="w-full relative">
          <div className="absolute top-2 left-0 right-0 bg-white border border-[#ebdcc9] rounded-2xl shadow-xl overflow-hidden z-50">
            {loadingSuggestions ? (
              <div className="p-3 text-xs text-[#786b5e] flex items-center gap-2">
                <div className="w-3.5 h-3.5 border-2 border-[#d97757]/30 border-t-[#d97757] rounded-full animate-spin" />
                <span>Searching suggestions...</span>
              </div>
            ) : (
              <ul className="divide-y divide-[#ebdcc9]/50">
                {suggestions.map((item, idx) => {
                  const suggestionText = typeof item === 'string' ? item : item.text || item.title || item.query;
                  return (
                    <li key={idx}>
                      <button
                        type="button"
                        onClick={() => handleSelectSuggestion(suggestionText)}
                        className="w-full px-4 py-2.5 text-left text-sm text-[#2d2721] hover:bg-[#faf4ec] flex items-center gap-3 transition-colors cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5 text-[#8c7b6c] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <span className="truncate font-medium">{suggestionText}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Google-Style Action Buttons (Rendered on Home View) */}
      {showGoogleButtons && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2.5 bg-[#fcf8f2] hover:bg-[#f4ebd9] text-[#2d2721] border border-[#ebdcc9] text-sm font-medium rounded-xl shadow-2xs hover:shadow-xs transition-all cursor-pointer"
          >
            VedEngine Search
          </button>

          <button
            type="button"
            onClick={onLucky}
            className="px-5 py-2.5 bg-[#fcf8f2] hover:bg-[#f4ebd9] text-[#2d2721] border border-[#ebdcc9] text-sm font-medium rounded-xl shadow-2xs hover:shadow-xs transition-all cursor-pointer"
          >
            I'm Feeling Lucky
          </button>
        </div>
      )}

    </div>
  );
}
