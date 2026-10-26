import { useState, useRef } from 'react';
import { uploadAPI, documentAPI } from '../services/api';

/**
 * UploadModal Component - Dual Mode Indexer (Website URLs & File Documents)
 * =========================================================================
 * Allows admins to index new content into the VedEngine search database:
 * 1. Mode "url": Add Website Links (works like indexing pages for Google Search).
 * 2. Mode "file": Upload PDF, TXT, or DOCX documents to the vector database.
 *
 * @param {object} props
 * @param {boolean} props.isOpen - Controls modal visibility
 * @param {function} props.onClose - Callback to close modal
 * @param {function} props.onSuccess - Callback triggered after successful indexing
 */
export default function UploadModal({ isOpen, onClose, onSuccess }) {
  // Tab switch state: 'url' (Website link) or 'file' (File upload)
  const [activeTab, setActiveTab] = useState('url');

  // --------------------------------------------------------------------------------
  // 1. File Upload State Variables
  // --------------------------------------------------------------------------------
  const [file, setFile] = useState(null);
  const [fileTitle, setFileTitle] = useState('');
  const [fileDescription, setFileDescription] = useState('');

  // --------------------------------------------------------------------------------
  // 2. Web Link (Google Index) State Variables
  // --------------------------------------------------------------------------------
  const [webUrl, setWebUrl] = useState('');
  const [webTitle, setWebTitle] = useState('');
  const [webContent, setWebContent] = useState('');

  // General Status & Drag-and-Drop state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef(null);

  // If modal is closed, return null (render nothing)
  if (!isOpen) return null;

  // --------------------------------------------------------------------------------
  // Drag-and-Drop Handlers for File Uploads
  // --------------------------------------------------------------------------------
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  // Validates file format (.pdf, .txt, .docx) and file size (< 10MB)
  const validateAndSetFile = (selectedFile) => {
    setError('');
    const validExtensions = ['.txt', '.pdf', '.docx'];
    const fileName = selectedFile.name.toLowerCase();
    const isValid = validExtensions.some((ext) => fileName.endsWith(ext));

    if (!isValid) {
      setError('Invalid format. Only PDF, TXT, and DOCX files are allowed.');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size exceeds the 10 MB limit.');
      return;
    }

    setFile(selectedFile);
    if (!fileTitle) {
      setFileTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  // --------------------------------------------------------------------------------
  // Submit Handler: Upload Local File Document
  // --------------------------------------------------------------------------------
  const handleFileSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a document file to upload.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const formData = new FormData();
      formData.append('file', file);
      if (fileTitle.trim()) formData.append('title', fileTitle.trim());
      if (fileDescription.trim()) formData.append('description', fileDescription.trim());

      const res = await uploadAPI.uploadDocument(formData);

      // Reset form
      setFile(null);
      setFileTitle('');
      setFileDescription('');

      if (onSuccess) onSuccess(res.data);
      onClose();
    } catch (err) {
      console.error('Document upload failed:', err);
      setError(err.response?.data?.message || err.message || 'Failed to upload document.');
    } finally {
      setSubmitting(false);
    }
  };

  // --------------------------------------------------------------------------------
  // Submit Handler: Index Website URL (Google Search Style)
  // --------------------------------------------------------------------------------
  const handleUrlSubmit = async (e) => {
    e.preventDefault();
    if (!webUrl.trim() || !webTitle.trim()) {
      setError('Please provide a valid Website URL and Page Title.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      // Auto-prefix URL with https:// if omitted by user
      let formattedUrl = webUrl.trim();
      if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
        formattedUrl = `https://${formattedUrl}`;
      }

      // Payload object sent to Prisma DB & Vector Search Index
      const payload = {
        title: webTitle.trim(),
        content: webContent.trim() || webTitle.trim(),
        description: webContent.trim(),
        url: formattedUrl,
        fileType: 'WEB',
      };

      const res = await documentAPI.createDocument(payload);

      // Reset form fields
      setWebUrl('');
      setWebTitle('');
      setWebContent('');

      if (onSuccess) onSuccess(res.data);
      onClose();
    } catch (err) {
      console.error('Failed to index web link:', err);
      setError(err.response?.data?.message || err.message || 'Failed to index web link.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2d2721]/40 backdrop-blur-sm">
      
      {/* Modal Card Container */}
      <div className="relative w-full max-w-lg bg-white border border-[#ebdcc9] rounded-3xl p-8 shadow-2xl overflow-hidden">
        
        {/* Header Title & Close Button */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#f4ebd9] border border-[#ebdcc9] flex items-center justify-center text-[#d97757]">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#2d2721] font-serif">Add to Search Index</h2>
              <p className="text-xs text-[#786b5e]">Index website links or upload files into VedEngine</p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={submitting}
            className="p-2 text-[#786b5e] hover:text-[#2d2721] hover:bg-[#f4ebd9] rounded-xl transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab Switcher: "Add Web Link" vs "Upload File" */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-[#fcf8f2] border border-[#ebdcc9] rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => { setActiveTab('url'); setError(''); }}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'url'
                ? 'bg-[#d97757] text-white shadow-sm'
                : 'text-[#786b5e] hover:text-[#2d2721]'
            }`}
          >
            🌐 Add Web Link (Google Index)
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('file'); setError(''); }}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'file'
                ? 'bg-[#d97757] text-white shadow-sm'
                : 'text-[#786b5e] hover:text-[#2d2721]'
            }`}
          >
            📄 Upload File
          </button>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs flex items-start gap-2.5">
            <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Form 1: Website Link Indexing */}
        {activeTab === 'url' ? (
          <form onSubmit={handleUrlSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#6b5c4d] mb-1.5">
                Website URL *
              </label>
              <input
                type="url"
                required
                value={webUrl}
                onChange={(e) => setWebUrl(e.target.value)}
                placeholder="https://example.com/article"
                className="w-full px-4 py-3 bg-[#fcfaf7] border border-[#ebdcc9] focus:border-[#d97757] focus:ring-2 focus:ring-[#d97757]/20 rounded-xl text-[#2d2721] text-sm outline-none transition-all placeholder-[#a89887]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#6b5c4d] mb-1.5">
                Website / Page Title *
              </label>
              <input
                type="text"
                required
                value={webTitle}
                onChange={(e) => setWebTitle(e.target.value)}
                placeholder="e.g. OpenAI - Artificial Intelligence Research"
                className="w-full px-4 py-3 bg-[#fcfaf7] border border-[#ebdcc9] focus:border-[#d97757] focus:ring-2 focus:ring-[#d97757]/20 rounded-xl text-[#2d2721] text-sm outline-none transition-all placeholder-[#a89887]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#6b5c4d] mb-1.5">
                Page Summary / Snippet
              </label>
              <textarea
                rows={3}
                value={webContent}
                onChange={(e) => setWebContent(e.target.value)}
                placeholder="Key details or text snippet to enable AI vector search..."
                className="w-full px-4 py-3 bg-[#fcfaf7] border border-[#ebdcc9] focus:border-[#d97757] focus:ring-2 focus:ring-[#d97757]/20 rounded-xl text-[#2d2721] text-sm outline-none transition-all placeholder-[#a89887] resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-5 py-2.5 text-[#786b5e] hover:text-[#2d2721] text-sm font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting || !webUrl.trim() || !webTitle.trim()}
                className="px-6 py-2.5 bg-[#d97757] hover:bg-[#c46445] text-white text-sm font-bold rounded-xl shadow-md shadow-[#d97757]/20 transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Indexing Website...</span>
                  </>
                ) : (
                  <span>Index Web Link</span>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* Form 2: File Upload (PDF, TXT, DOCX) */
          <form onSubmit={handleFileSubmit} className="space-y-4">
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-[#d97757] bg-[#f4ebd9]/60 scale-[0.99]'
                  : file
                  ? 'border-[#d97757] bg-[#f4ebd9]/30'
                  : 'border-[#ebdcc9] hover:border-[#d97757] hover:bg-[#fcf8f2]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,.docx"
                onChange={handleFileChange}
                className="hidden"
              />

              {file ? (
                <div className="flex items-center justify-between p-2">
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-10 h-10 rounded-lg bg-[#f4ebd9] text-[#d97757] flex items-center justify-center font-bold text-xs uppercase">
                      {file.name.split('.').pop()}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-bold text-[#2d2721] truncate max-w-[200px]">
                        {file.name}
                      </p>
                      <p className="text-xs text-[#786b5e]">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                    className="text-xs text-red-600 hover:underline cursor-pointer font-semibold"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div>
                  <div className="w-12 h-12 rounded-full bg-[#f4ebd9] text-[#d97757] flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-[#2d2721]">
                    Drag & drop file here, or <span className="text-[#d97757]">browse</span>
                  </p>
                  <p className="text-xs text-[#786b5e] mt-1">
                    Supports PDF, TXT, or DOCX up to 10 MB
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#6b5c4d] mb-1.5">
                Document Title (Optional)
              </label>
              <input
                type="text"
                value={fileTitle}
                onChange={(e) => setFileTitle(e.target.value)}
                placeholder="e.g. Technical Specification 2026"
                className="w-full px-4 py-3 bg-[#fcfaf7] border border-[#ebdcc9] focus:border-[#d97757] focus:ring-2 focus:ring-[#d97757]/20 rounded-xl text-[#2d2721] text-sm outline-none transition-all placeholder-[#a89887]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#6b5c4d] mb-1.5">
                Description (Optional)
              </label>
              <textarea
                rows={2}
                value={fileDescription}
                onChange={(e) => setFileDescription(e.target.value)}
                placeholder="Brief summary of document content..."
                className="w-full px-4 py-3 bg-[#fcfaf7] border border-[#ebdcc9] focus:border-[#d97757] focus:ring-2 focus:ring-[#d97757]/20 rounded-xl text-[#2d2721] text-sm outline-none transition-all placeholder-[#a89887] resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-5 py-2.5 text-[#786b5e] hover:text-[#2d2721] text-sm font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting || !file}
                className="px-6 py-2.5 bg-[#d97757] hover:bg-[#c46445] text-white text-sm font-bold rounded-xl shadow-md shadow-[#d97757]/20 transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Uploading & Indexing...</span>
                  </>
                ) : (
                  <span>Upload Document</span>
                )}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
