import { useState, useEffect } from 'react';
import { documentAPI } from '../services/api';
import UploadModal from '../components/UploadModal';
import Loading from '../components/Loading';
import { useAuth } from '../context/AuthContext';

/**
 * Documents Component Page - Role-Based Document Management with Direct Web Links
 * -------------------------------------------------------------------------------
 * - All users can view and filter indexed document list and open document web links.
 * - ONLY Admins (user.role === 'admin') can upload or delete documents.
 */
export default function Documents() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchDocuments = async () => {
    try {
      setError('');
      const res = await documentAPI.getAllDocuments();
      const docsList = res.data?.documents || res.data || [];
      setDocuments(Array.isArray(docsList) ? docsList : []);
    } catch (err) {
      console.error('Failed to fetch documents list:', err);
      setError('Failed to load documents. Please ensure backend service is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleDeleteDocument = async (id) => {
    if (!isAdmin) return;

    if (!window.confirm('Are you sure you want to delete this document from the vector index?')) {
      return;
    }

    try {
      setDeletingId(id);
      await documentAPI.deleteDocument(id);
      setDocuments((prev) => prev.filter((doc) => doc.id !== id && doc._id !== id));
    } catch (err) {
      console.error('Failed to delete document:', err);
      alert(err.response?.data?.message || 'Failed to delete document.');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    const title = (doc.title || doc.filename || '').toLowerCase();
    const query = searchTerm.toLowerCase();
    return title.includes(query);
  });

  const backendBase = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api/v1', '') : 'http://localhost:3000';

  return (
    <div className="min-h-screen bg-[#faf4ec] text-[#2d2721] p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#fcf8f2] border border-[#ebdcc9] rounded-3xl p-6 sm:p-8 shadow-sm">
        <div>
          <h1 className="text-3xl font-extrabold text-[#2d2721] font-serif">Indexed Documents</h1>
          <p className="text-[#786b5e] text-sm mt-1">
            Browse knowledge base files indexed for RAG vector retrieval
          </p>
        </div>

        {/* Upload Document Button - Visible ONLY to Admins */}
        {isAdmin && (
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-6 py-3.5 bg-[#d97757] hover:bg-[#c46445] text-white font-bold text-sm rounded-2xl shadow-sm shadow-[#d97757]/20 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            <span>Upload Document</span>
          </button>
        )}
      </div>

      {/* Filter Control Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <svg className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#d97757]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter documents by title..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#ebdcc9] focus:border-[#d97757] focus:ring-2 focus:ring-[#d97757]/20 rounded-xl text-[#2d2721] text-sm outline-none transition-all placeholder-[#a89887]"
          />
        </div>

        <div className="text-xs text-[#786b5e]">
          Showing <span className="text-[#d97757] font-bold">{filteredDocuments.length}</span> of <span className="text-[#2d2721] font-bold">{documents.length}</span> documents
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <Loading message="Loading document repository..." />
      ) : filteredDocuments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((doc) => {
            const docId = doc.id || doc._id;
            const ext = doc.filename ? doc.filename.split('.').pop().toUpperCase() : 'DOC';
            const fileName = doc.filename || doc.fileName;

            const docUrl =
              doc.url ||
              doc.link ||
              doc.fileUrl ||
              (fileName ? `${backendBase}/uploads/${fileName}` : `${backendBase}/api/v1/documents/${docId}`);

            return (
              <div key={docId} className="bg-white border border-[#ebdcc9] hover:border-[#d97757]/40 rounded-2xl p-6 transition-all shadow-sm flex flex-col justify-between group">
                
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-[#f4ebd9] border border-[#ebdcc9] text-[#d97757] font-extrabold text-sm flex items-center justify-center shrink-0">
                      {ext}
                    </div>
                    <span className="px-3 py-1 bg-[#f4ebd9] border border-[#ebdcc9] text-[#b5583b] text-xs font-bold rounded-full flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#d97757] animate-pulse" />
                      Vectorized
                    </span>
                  </div>

                  <a
                    href={docUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-[#2d2721] text-base mb-1 line-clamp-1 group-hover:text-[#d97757] hover:underline transition-colors font-serif flex items-center gap-1.5"
                    title={`Open ${doc.title || doc.filename}`}
                  >
                    <span>{doc.title || doc.filename || 'Untitled Document'}</span>
                    <svg className="w-4 h-4 text-[#d97757] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>

                  {doc.description && (
                    <p className="text-xs text-[#786b5e] line-clamp-2 mb-3">
                      {doc.description}
                    </p>
                  )}
                </div>

                <div className="border-t border-[#ebdcc9]/60 pt-4 mt-4 flex items-center justify-between text-xs text-[#8c7b6c]">
                  <a
                    href={docUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#d97757] font-bold hover:underline flex items-center gap-1"
                  >
                    <span>Open Web Link</span>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </a>

                  {/* Delete Button - Visible ONLY to Admins */}
                  {isAdmin && (
                    <button
                      onClick={() => handleDeleteDocument(docId)}
                      disabled={deletingId === docId}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer disabled:opacity-50 font-bold"
                    >
                      {deletingId === docId ? 'Deleting...' : 'Delete'}
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white border border-[#ebdcc9] rounded-3xl p-8 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-[#f4ebd9] text-[#d97757] flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-[#2d2721]">No documents found</h3>
          <p className="text-xs text-[#786b5e] mt-1">
            {searchTerm ? `No documents match "${searchTerm}".` : 'No documents indexed in repository yet.'}
          </p>
        </div>
      )}

      {/* Upload Modal (For Admins) */}
      {isAdmin && (
        <UploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onSuccess={fetchDocuments}
        />
      )}

    </div>
  );
}
