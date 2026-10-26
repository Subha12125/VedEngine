import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Searchbar from '../components/Searchbar';
import SearchResult from '../components/SearchResult';
import UploadModal from '../components/UploadModal';
import Loading from '../components/Loading';
import { searchAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

/**
 * Dashboard Component - Google Search Engine Style
 * ------------------------------------------------
 * Matches Google's minimalist search UI layout:
 * - Centered hero brand logo & pill search bar on initial state
 * - '+' quick action, microphone, lens, and '✦ AI Mode' badge
 * - "VedEngine Search" & "I'm Feeling Lucky" action buttons
 * - Popular search pills & Google bottom footer
 * - Seamless transition to Google-style search results & AI Overview
 * - Claude warm beige color palette (#faf4ec, #2d2721, #d97757)
 */
const LUCKY_QUERIES = [
  "What is India's national animal?",
  "How does hybrid vector search work?",
  "PostgreSQL pgvector indexing performance",
  "Groq Qwen 2.5 RAG pipeline",
  "Architecture of VedEngine AI",
  "Document semantic embeddings",
];

const POPULAR_TOPICS = [
  "India's National Animal",
  "Vector Search",
  "pgvector Indexing",
  "RAG Pipeline",
  "System Architecture",
];

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const isAdmin = isAuthenticated && user?.role === 'admin';

  const [searchParams, setSearchParams] = useSearchParams();
  const urlQuery = searchParams.get('q') || '';

  const [searchResults, setSearchResults] = useState([]);
  const [currentQuery, setCurrentQuery] = useState(urlQuery);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(Boolean(urlQuery));
  const [searchError, setSearchError] = useState('');
  const [aiAnswer, setAiAnswer] = useState(null);
  const [aiSources, setAiSources] = useState([]);
  const [aiMode, setAiMode] = useState(true);
  const [searchLatency, setSearchLatency] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'documents', 'ai'
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [copiedAnswer, setCopiedAnswer] = useState(false);

  // Execute search
  const executeSearch = async (queryText, useAi = aiMode) => {
    if (!queryText || !queryText.trim()) return;

    const trimmed = queryText.trim();
    setCurrentQuery(trimmed);
    setSearchParams({ q: trimmed });
    setIsSearching(true);
    setSearchError('');
    setAiAnswer(null);
    setAiSources([]);
    setHasSearched(true);

    const startTime = performance.now();

    try {
      const res = await searchAPI.query(trimmed, 1, 10, useAi);
      const resultsList =
        res.data?.data ||
        res.data?.results ||
        res.data?.documents ||
        (Array.isArray(res.data) ? res.data : []);

      setSearchResults(Array.isArray(resultsList) ? resultsList : []);
      setAiAnswer(res.data?.aiAnswer || null);
      setAiSources(res.data?.aiSources || []);

      const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
      setSearchLatency(elapsed);
    } catch (err) {
      console.error('Search query execution failed:', err);
      setSearchError(err.response?.data?.message || 'Search failed. Please check backend connection.');
      setSearchResults([]);
      setAiAnswer(null);
      setAiSources([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Run search when URL query param changes
  useEffect(() => {
    if (urlQuery && urlQuery !== currentQuery) {
      executeSearch(urlQuery);
    } else if (!urlQuery && hasSearched) {
      setHasSearched(false);
      setCurrentQuery('');
      setSearchResults([]);
      setAiAnswer(null);
      setAiSources([]);
    }
  }, [urlQuery]);

  // "I'm Feeling Lucky" random picker
  const handleLucky = () => {
    const randomQuery = LUCKY_QUERIES[Math.floor(Math.random() * LUCKY_QUERIES.length)];
    executeSearch(randomQuery);
  };

  // Reset to Google Home
  const handleResetHome = () => {
    setSearchParams({});
    setHasSearched(false);
    setCurrentQuery('');
    setSearchResults([]);
    setAiAnswer(null);
    setAiSources([]);
    setSearchError('');
  };

  // Copy AI Answer to clipboard
  const handleCopyAnswer = () => {
    if (!aiAnswer) return;
    navigator.clipboard.writeText(aiAnswer);
    setCopiedAnswer(true);
    setTimeout(() => setCopiedAnswer(false), 2000);
  };

  // =========================================================================
  // VIEW 1: GOOGLE SEARCH RESULTS VIEW (When query is active)
  // =========================================================================
  if (hasSearched || isSearching) {
    return (
      <div className="min-h-screen bg-[#faf4ec] text-[#2d2721] flex flex-col font-sans">
        
        {/* Results Page Sub-Header with Filter Tabs */}
        <div className="bg-[#faf4ec] border-b border-[#ebdcc9] px-4 sm:px-6 lg:px-8 py-3 sticky top-16 z-40 backdrop-blur-md bg-[#faf4ec]/95">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Search Pill in Results View */}
            <div className="w-full md:max-w-xl">
              <Searchbar
                onSearch={executeSearch}
                initialQuery={currentQuery}
                onAddClick={() => setIsUploadModalOpen(true)}
                onLensClick={() => setIsUploadModalOpen(true)}
                aiMode={aiMode}
                onToggleAiMode={() => setAiMode(!aiMode)}
              />
            </div>

            {/* Filter Tabs: All, Documents, AI Overview */}
            <div className="flex items-center gap-1 self-start md:self-auto border-b md:border-b-0 border-[#ebdcc9] pb-1 md:pb-0">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'all'
                    ? 'text-[#d97757] border-b-2 border-[#d97757]'
                    : 'text-[#786b5e] hover:text-[#2d2721]'
                }`}
              >
                All Results
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('documents')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'documents'
                    ? 'text-[#d97757] border-b-2 border-[#d97757]'
                    : 'text-[#786b5e] hover:text-[#2d2721]'
                }`}
              >
                Documents ({searchResults.length})
              </button>
              {aiAnswer && (
                <button
                  type="button"
                  onClick={() => setActiveTab('ai')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                    activeTab === 'ai'
                      ? 'text-[#d97757] border-b-2 border-[#d97757]'
                      : 'text-[#786b5e] hover:text-[#2d2721]'
                  }`}
                >
                  <span>✦ AI Overview</span>
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Results Container */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 w-full flex-1 space-y-6">
          
          {/* Results Metadata & Search Latency */}
          <div className="flex items-center justify-between text-xs text-[#786b5e] px-1">
            <span>
              About {searchResults.length} result{searchResults.length === 1 ? '' : 's'}
              {searchLatency ? ` (${searchLatency} seconds)` : ''}
            </span>
            <button
              onClick={handleResetHome}
              className="hover:text-[#d97757] transition-colors cursor-pointer"
            >
              Clear & return home
            </button>
          </div>

          {/* Search Error Alert */}
          {searchError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm text-center">
              {searchError}
            </div>
          )}

          {/* Loading Indicator */}
          {isSearching ? (
            <div className="py-12">
              <Loading message={`Querying vector database for "${currentQuery}"...`} />
            </div>
          ) : (
            <>
              {/* Google-Style AI Overview Card (Groq / Qwen Grounded RAG) */}
              {aiAnswer && (activeTab === 'all' || activeTab === 'ai') && (
                <div className="bg-[#fcf8f2] border-2 border-[#d97757]/30 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#d97757] to-[#e28c6f] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                        ✦
                      </div>
                      <h3 className="font-extrabold text-base sm:text-lg text-[#2d2721]">
                        AI Overview
                      </h3>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#d97757] bg-[#f4ebd9] px-2.5 py-0.5 rounded-full border border-[#ebdcc9]">
                        Grounded Synthesis
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyAnswer}
                      className="p-1.5 text-[#786b5e] hover:text-[#2d2721] hover:bg-[#f4ebd9] rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Copy AI summary"
                    >
                      {copiedAnswer ? (
                        <>
                          <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-emerald-700">Copied</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* AI Generated Text */}
                  <div className="text-sm sm:text-[15px] text-[#2d2721] leading-relaxed whitespace-pre-line bg-white/70 p-4 sm:p-5 rounded-2xl border border-[#ebdcc9]/70">
                    {aiAnswer}
                  </div>

                  {/* Citations & Sources */}
                  {aiSources.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#ebdcc9]/60 text-xs">
                      <span className="text-[#8c7b6c] font-semibold">Sources:</span>
                      {aiSources.map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 bg-white border border-[#ebdcc9] rounded-lg text-[#2d2721] font-mono text-[11px] shadow-2xs"
                        >
                          [{s.index || idx + 1}] {s.title || 'Source'}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Document Vector Results */}
              {(activeTab === 'all' || activeTab === 'documents') && (
                <>
                  {searchResults.length > 0 ? (
                    <div className="space-y-4">
                      {searchResults.map((item, idx) => (
                        <SearchResult key={item.id || item._id || idx} result={item} />
                      ))}
                    </div>
                  ) : (
                    /* Google-Style Empty Results State */
                    <div className="bg-white border border-[#ebdcc9] rounded-3xl p-8 sm:p-10 text-left space-y-4 shadow-sm">
                      <h4 className="text-base font-bold text-[#2d2721]">
                        Your search - <span className="font-extrabold text-[#d97757]">"{currentQuery}"</span> - did not match any indexed documents.
                      </h4>
                      <div className="text-xs sm:text-sm text-[#786b5e] space-y-2">
                        <p className="font-semibold text-[#2d2721]">Suggestions:</p>
                        <ul className="list-disc list-inside space-y-1 pl-2">
                          <li>Make sure that all words are spelled correctly.</li>
                          <li>Try different keywords or broader search phrases.</li>
                          <li>Try fewer keywords to expand vector semantic matching.</li>
                          {isAdmin && (
                            <li>
                              Upload additional documents or websites into the knowledge database.
                            </li>
                          )}
                        </ul>
                      </div>

                      {isAdmin && (
                        <div className="pt-2">
                          <button
                            onClick={() => setIsUploadModalOpen(true)}
                            className="px-5 py-2.5 bg-[#d97757] hover:bg-[#c46445] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                          >
                            + Upload New Document
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </>
          )}

        </main>

        {/* Upload Modal (Admins) */}
        {isAdmin && (
          <UploadModal
            isOpen={isUploadModalOpen}
            onClose={() => setIsUploadModalOpen(false)}
            onSuccess={() => setIsUploadModalOpen(false)}
          />
        )}

      </div>
    );
  }

  // =========================================================================
  // VIEW 2: GOOGLE HOMEPAGE VIEW (Centered Hero, Clean & Simple)
  // =========================================================================
  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#faf4ec] text-[#2d2721] flex flex-col justify-between font-sans">
      
      {/* Invisible spacer to balance vertical center */}
      <div className="h-6 sm:h-12" />

      {/* Main Center Block: Logo, Searchbar & Google Action Buttons */}
      <div className="w-full max-w-3xl mx-auto px-4 flex flex-col items-center text-center space-y-7">
        
        {/* Centered VedEngine Hero Logo */}
        <div className="flex flex-col items-center select-none group cursor-pointer" onClick={handleResetHome}>
          <img
            src="/logo.png"
            alt="VedEngine"
            className="h-16 sm:h-20 md:h-24 w-auto object-contain transition-transform duration-200 group-hover:scale-[1.02]"
          />
        </div>

        {/* Google-Style Pill Searchbar */}
        <Searchbar
          onSearch={executeSearch}
          initialQuery={currentQuery}
          onAddClick={() => setIsUploadModalOpen(true)}
          onLensClick={() => setIsUploadModalOpen(true)}
          showGoogleButtons={true}
          onLucky={handleLucky}
          aiMode={aiMode}
          onToggleAiMode={() => setAiMode(!aiMode)}
        />

        {/* Popular / Trending Topics (Google "Offered In" Style) */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-xs text-[#786b5e] pt-2 max-w-xl">
          <span className="font-medium text-[#8c7b6c]">Explore topics:</span>
          {POPULAR_TOPICS.map((topic, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => executeSearch(topic)}
              className="px-3 py-1 bg-white hover:bg-[#f4ebd9] text-[#2d2721] border border-[#ebdcc9] hover:border-[#d97757]/40 rounded-full text-xs font-medium transition-all shadow-2xs hover:shadow-xs cursor-pointer"
            >
              {topic}
            </button>
          ))}
        </div>

      </div>

      {/* Google-Style Bottom Footer */}
      <footer className="w-full bg-[#f6eee3] border-t border-[#ebdcc9] text-xs text-[#786b5e] mt-12">
        {/* Top Location / Engine Line */}
        <div className="px-6 sm:px-8 py-3 border-b border-[#ebdcc9]/70 flex items-center justify-between">
          <span className="font-semibold text-[#2d2721]">India</span>
          <span className="text-[11px] text-[#8c7b6c]">
            VedEngine AI • Hybrid Vector & Full-Text Retrieval
          </span>
        </div>

        {/* Bottom Navigation Links */}
        <div className="px-6 sm:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-5">
            <Link to="/about" className="hover:text-[#2d2721] transition-colors">
              About
            </Link>
            <a
              href="https://github.com/Subha12125/VedEngine"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#2d2721] transition-colors"
            >
              How Search Works
            </a>
            <span className="hover:text-[#2d2721] transition-colors cursor-default">
              PostgreSQL pgvector
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-5">
            <span className="hover:text-[#2d2721] transition-colors cursor-default">
              Privacy
            </span>
            <span className="hover:text-[#2d2721] transition-colors cursor-default">
              Terms
            </span>
            {isAdmin && (
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="text-[#d97757] font-bold hover:underline cursor-pointer"
              >
                + Upload Document
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* Upload Modal (Admins) */}
      {isAdmin && (
        <UploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onSuccess={() => setIsUploadModalOpen(false)}
        />
      )}

    </div>
  );
}
