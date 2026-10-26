import { useState } from 'react';
import Searchbar from '../components/Searchbar';
import SearchResult from '../components/SearchResult';
import UploadModal from '../components/UploadModal';
import Loading from '../components/Loading';
import { searchAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

/**
 * Dashboard Component Page - Public Search Engine
 * -----------------------------------------------
 * - Accessible to ALL visitors (guests & authenticated users).
 * - Anyone can type search queries, view AI vector match results, and inspect stats.
 * - ONLY Admins (user.role === 'admin') can view and trigger the Upload Document button.
 */
export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const isAdmin = isAuthenticated && user?.role === 'admin';

  const [searchResults, setSearchResults] = useState([]);
  const [currentQuery, setCurrentQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [aiAnswer, setAiAnswer] = useState(null);
  const [aiSources, setAiSources] = useState([]);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const handleSearch = async (queryText) => {
    if (!queryText.trim()) return;

    try {
      setIsSearching(true);
      setSearchError('');
      setAiAnswer(null);
      setAiSources([]);
      setCurrentQuery(queryText);
      setHasSearched(true);

      const res = await searchAPI.query(queryText);
      const resultsList = res.data?.data || res.data?.results || res.data?.documents || (Array.isArray(res.data) ? res.data : []);
      
      setSearchResults(Array.isArray(resultsList) ? resultsList : []);
      setAiAnswer(res.data?.aiAnswer || null);
      setAiSources(res.data?.aiSources || []);
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

  const handleUploadSuccess = () => {
    setIsUploadModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#faf4ec] text-[#2d2721] p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 font-sans">
      
      {/* Main Search Section */}
      <section className="space-y-6 pt-4 sm:pt-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#2d2721] tracking-tight">
            AI Document Search
          </h1>
          <p className="text-sm text-[#786b5e]">
            Search across indexed PDF, TXT, and DOCX documents with grounded AI answers.
          </p>

          {/* Upload Button - Visible Only to Admins */}
          {isAdmin && (
            <div className="pt-2 flex justify-center">
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="px-5 py-2.5 bg-[#d97757] hover:bg-[#c46445] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                <span>Upload Document</span>
              </button>
            </div>
          )}
        </div>

        <Searchbar onSearch={handleSearch} initialQuery={currentQuery} />
      </section>

      {/* Search Error Alert */}
      {searchError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm text-center">
          {searchError}
        </div>
      )}

      {/* Search Results Feed */}
      <section className="space-y-4">
        {isSearching ? (
          <Loading message={`Querying vector database for "${currentQuery}"...`} />
        ) : hasSearched ? (
          <div>
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="text-lg font-bold text-[#2d2721]">
                Results for <span className="text-[#d97757]">"{currentQuery}"</span>
              </h3>
              <span className="text-xs text-[#786b5e]">
                {searchResults.length} document match{searchResults.length === 1 ? '' : 'es'}
              </span>
            </div>

            {aiAnswer && (
              <div className="bg-[#fcf8f2] border-2 border-[#d97757]/40 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#d97757] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                      ✦
                    </div>
                    <h4 className="font-serif font-extrabold text-lg text-[#2d2721]">VedEngine AI Summary & Synthesis</h4>
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#d97757] bg-[#f4ebd9] px-3 py-1 rounded-full border border-[#ebdcc9]">
                    Grounded RAG Answer
                  </span>
                </div>
                <div className="text-sm text-[#362f27] leading-relaxed whitespace-pre-line font-normal bg-white/70 p-4 rounded-2xl border border-[#ebdcc9]/60">
                  {aiAnswer}
                </div>
                {aiSources.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#ebdcc9]/60 text-xs">
                    <span className="text-[#8c7b6c] font-semibold">Sources:</span>
                    {aiSources.map((s, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-white border border-[#ebdcc9] rounded-lg text-[#2d2721] font-mono text-[11px]">
                        [{s.index || idx + 1}] {s.title || 'Source'}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {searchResults.length > 0 ? (
              <div className="space-y-4">
                {searchResults.map((item, idx) => (
                  <SearchResult key={item.id || item._id || idx} result={item} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white border border-[#ebdcc9] rounded-3xl p-8 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-[#f4ebd9] text-[#d97757] flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-base font-bold text-[#2d2721]">No matching results found</h4>
                <p className="text-xs text-[#786b5e] mt-1">
                  Try rephrasing your search query to find relevant documents.
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Document Section Preview - Visible ONLY to Admin */
          isAdmin && documents.length > 0 && (
            <div className="bg-white border border-[#ebdcc9] rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-extrabold text-[#2d2721] font-serif">Indexed Knowledge Base</h3>
                  <p className="text-xs text-[#786b5e]">Processed documents available for AI search</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents.slice(0, 6).map((doc) => (
                  <div key={doc.id || doc._id} className="p-4 bg-[#fcf8f2] border border-[#ebdcc9] hover:border-[#d97757]/40 rounded-2xl flex items-center gap-3 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-[#f4ebd9] text-[#d97757] flex items-center justify-center font-extrabold text-xs shrink-0">
                      {doc.filename ? doc.filename.split('.').pop().toUpperCase() : 'DOC'}
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="text-sm font-bold text-[#2d2721] truncate">
                        {doc.title || doc.filename || 'Untitled Document'}
                      </h4>
                      <p className="text-xs text-[#8c7b6c]">
                        {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : 'Indexed'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        )}
      </section>

      {/* Upload Modal (For Admins) */}
      {isAdmin && (
        <UploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onSuccess={handleUploadSuccess}
        />
      )}

    </div>
  );
}
