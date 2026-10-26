
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/logo.png';

/**
 * Navbar Component - Public & Role-Based Navigation
 * --------------------------------------------------
 * - Rendered for all visitors (guests and logged-in users).
 * - Guests see "Login" and "Register" actions on the top right.
 * - Logged-in users see profile badge and logout button.
 * - Admin users see additional "Documents" & "Analytics" navigation tabs.
 */
export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const isActive = (path) => location.pathname === path;
  const isAdmin = user?.role === 'admin';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-[#fcf8f2]/95 backdrop-blur-md border-b border-[#ebdcc9] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Title */}
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <div className="relative">
            <img
              src={logoImg}
              alt="VedEngine Logo"
              className="w-10 h-10 object-contain drop-shadow-sm group-hover:scale-105 transition-transform"
            />
          </div>
          <div>
            <span className="font-extrabold text-xl text-[#2d2721] tracking-tight font-serif">
              VedEngine
            </span>
            <span className="text-[10px] uppercase tracking-widest block text-[#8c7b6c] font-semibold -mt-1">
              AI RAG Search
            </span>
          </div>
        </Link>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-[#f2e6d6]/60 p-1.5 rounded-2xl border border-[#ebdcc9]">
          
          {/* Dashboard Search Tab - Always Visible */}
          <Link
            to="/dashboard"
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
              isActive('/dashboard') || isActive('/')
                ? 'bg-[#d97757] text-white shadow-sm shadow-[#d97757]/30'
                : 'text-[#6b5c4d] hover:text-[#2d2721] hover:bg-[#eadecc]'
            }`}
          >
            Search
          </Link>
          
          {/* Admin-Only Tabs */}
          {isAuthenticated && isAdmin && (
            <>
              <Link
                to="/documents"
                className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
                  isActive('/documents')
                    ? 'bg-[#d97757] text-white shadow-sm shadow-[#d97757]/30'
                    : 'text-[#6b5c4d] hover:text-[#2d2721] hover:bg-[#eadecc]'
                }`}
              >
                Documents
              </Link>

              <Link
                to="/analytics"
                className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
                  isActive('/analytics')
                    ? 'bg-[#d97757] text-white shadow-sm shadow-[#d97757]/30'
                    : 'text-[#6b5c4d] hover:text-[#2d2721] hover:bg-[#eadecc]'
                }`}
              >
                Analytics
              </Link>
            </>
          )}
        </nav>

        {/* Right Actions: Auth Status or Login/Register Links */}
        <div className="flex items-center gap-3">
          
          {isAuthenticated ? (
            /* Logged-in User Profile & Logout */
            <>
              <div className="flex items-center gap-2 bg-[#f4ebd9] px-3 py-1.5 rounded-xl border border-[#ebdcc9]">
                <div className="w-7 h-7 rounded-full bg-[#d97757] flex items-center justify-center font-bold text-xs text-white">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-[#2d2721] max-w-[110px] truncate leading-tight">
                    {user?.name || user?.email || 'User'}
                  </span>
                  <span className="text-[10px] font-extrabold uppercase text-[#d97757] tracking-wider">
                    {user?.role || 'user'}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                title="Logout"
                className="p-2 text-[#786b5e] hover:text-red-600 hover:bg-red-500/10 rounded-xl transition-all border border-transparent cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </>
          ) : (
            /* Unauthenticated Visitor Options: Login / Register */
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-bold text-[#2d2721] hover:text-[#d97757] transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-[#d97757] hover:bg-[#c46445] text-white text-sm font-bold rounded-xl shadow-sm shadow-[#d97757]/20 transition-all"
              >
                Register
              </Link>
            </div>
          )}

        </div>

      </div>
    </header>
  );
}
