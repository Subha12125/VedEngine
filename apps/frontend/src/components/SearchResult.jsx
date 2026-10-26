

/**
 * SearchResult Component - Google Web Search Engine Style
 * =========================================================
 * Formats vector search results like Google Search:
 * 1. Displays the website's favicon using Google's Favicon API.
 * 2. Renders domain breadcrumbs (e.g. "wikipedia.org › page").
 * 3. Wraps the main title in a clickable link that opens the website directly in a new tab.
 * 4. Displays extracted text snippets and a "Visit Website" button.
 *
 * @param {object} props
 * @param {object} props.result - Individual search result record returned by the backend RAG API
 */
export default function SearchResult({ result }) {
  // If no result object is passed, render nothing
  if (!result) return null;

  // --------------------------------------------------------------------------------
  // 1. Extract Result Properties with Safe Fallbacks
  // --------------------------------------------------------------------------------
  const title = result.title || result.documentTitle || result.filename || result.fileName || 'Untitled Web Page';
  const content = result.content || result.text || result.snippet || result.chunk || 'No preview content available.';
  const score = result.score || result.similarity || result.relevanceScore;
  const createdAt = result.createdAt || result.timestamp;
  const documentId = result.documentId || result.id;
  const fileName = result.fileName || result.filename;

  // Base backend URL for fallback uploaded file links
  const backendBase = import.meta.env.VITE_API_URL 
    ? import.meta.env.VITE_API_URL.replace('/api/v1', '') 
    : 'http://localhost:3000';

  // --------------------------------------------------------------------------------
  // 2. Determine Target Web Link (Google Search Style Redirect)
  // --------------------------------------------------------------------------------
  // If result is a website link (URL), use it directly. Otherwise, fall back to uploaded file URL.
  const targetUrl =
    result.url ||
    result.link ||
    result.fileUrl ||
    (fileName ? `${backendBase}/uploads/${fileName}` : `${backendBase}/api/v1/documents/${documentId}`);

  // --------------------------------------------------------------------------------
  // 3. Extract Website Domain for Favicon & Google Breadcrumbs
  // --------------------------------------------------------------------------------
  let domain = 'vedengine.com';
  try {
    if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
      const parsedUrl = new URL(targetUrl);
      domain = parsedUrl.hostname; // e.g. "wikipedia.org"
    }
  } catch {
    domain = 'vedengine.com';
  }

  // Google Favicon API service URL
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;

  // Calculate percentage score (e.g. 0.95 -> 95%)
  const scorePercentage = typeof score === 'number' ? Math.round(score * 100) : null;

  return (
    <div className="bg-white hover:bg-[#fdfbf7] border border-[#ebdcc9] hover:border-[#d97757]/50 rounded-2xl p-5 sm:p-6 transition-all duration-200 shadow-sm shadow-amber-900/5 group">
      
      {/* ========================================================================= */}
      {/* Header: Google-Style Favicon, Domain Breadcrumb & Match Score             */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between gap-4 mb-1.5">
        <a
          href={targetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 max-w-xl group/link"
          title={`Open ${targetUrl}`}
        >
          {/* Website Favicon */}
          <div className="w-5 h-5 rounded-full bg-[#f4ebd9] flex items-center justify-center overflow-hidden shrink-0 border border-[#ebdcc9]">
            <img
              src={faviconUrl}
              alt=""
              onError={(e) => { e.target.style.display = 'none'; }}
              className="w-4 h-4 object-contain"
            />
          </div>

          {/* Domain & URL Breadcrumb */}
          <div className="flex flex-col text-left overflow-hidden">
            <span className="text-xs font-semibold text-[#2d2721] truncate leading-tight group-hover/link:underline">
              {domain}
            </span>
            <span className="text-[11px] font-mono text-emerald-700 truncate leading-tight">
              {targetUrl}
            </span>
          </div>
        </a>

        {/* Vector Match Score Badge */}
        {scorePercentage !== null && (
          <div className="shrink-0 px-3 py-1 bg-[#f4ebd9] border border-[#ebdcc9] text-[#b5583b] rounded-full text-xs font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#d97757] animate-pulse" />
            <span>{scorePercentage}% Match</span>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* Main Clickable Title: Redirects directly to external website on click      */}
      {/* ========================================================================= */}
      <div className="mb-2">
        <a
          href={targetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#1a0dab] hover:text-[#d97757] font-bold text-xl font-serif hover:underline transition-colors inline-flex items-center gap-2"
        >
          <span className="line-clamp-1">{title}</span>
          <svg className="w-4 h-4 text-[#d97757] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>

      {/* ========================================================================= */}
      {/* Text Snippet Preview                                                      */}
      {/* ========================================================================= */}
      <p 
        className="text-[#362f27] text-sm leading-relaxed mb-4 font-normal whitespace-pre-line line-clamp-3 bg-[#fcf8f2] p-3.5 rounded-xl border border-[#ebdcc9]/60"
        dangerouslySetInnerHTML={{ __html: content }}
      />

      {/* ========================================================================= */}
      {/* Footer Tags & Direct "Visit Website" Button                               */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between text-xs text-[#786b5e] border-t border-[#ebdcc9]/60 pt-3">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-md bg-[#f4ebd9] text-[#d97757] font-bold border border-[#ebdcc9]">
            {result.url ? 'Web Link' : 'Vector RAG'}
          </span>
          {result.fileType && (
            <span className="px-2.5 py-0.5 rounded-md bg-[#f0e4d0] text-[#786b5e] font-semibold uppercase">
              {result.fileType}
            </span>
          )}
          {createdAt && (
            <span className="hidden sm:inline text-[#8c7b6c]">
              Indexed {new Date(createdAt).toLocaleDateString()}
            </span>
          )}
        </div>

        {/* Action Button: Opens target website in new browser tab */}
        <a
          href={targetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3.5 py-1.5 bg-[#d97757] hover:bg-[#c46445] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shadow-[#d97757]/20 group/btn"
        >
          <span>Visit Website</span>
          <svg className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </a>
      </div>

    </div>
  );
}
