import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/logo.png';

/**
 * Navbar Component - Modern, Responsive Navigation Header
 * Features brand favicon, website name, role-based controls,
 * and a collapsible mobile navigation drawer.
 */
export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;
  const isAdmin = user?.role === 'admin';

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    navigate('/login');
  };

  const navLinks = [
    {
      name: 'Documents',
      path: '/documents',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      visible: isAuthenticated && isAdmin,
    },
    {
      name: 'Analytics',
      path: '/analytics',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      visible: isAuthenticated && isAdmin,
    },
  ];

  const visibleLinks = navLinks.filter((link) => link.visible);

  return (
    <header className="sticky top-0 z-50 bg-[#faf4ec]/95 backdrop-blur-md border-b border-[#e8ded2] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Website Title */}
        <Link to="/dashboard" className="flex items-center gap-3 group shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white border border-[#ebdcc9] flex items-center justify-center p-1.5 shadow-sm shadow-[#d97757]/10 group-hover:border-[#d97757]/50 group-hover:shadow-md group-hover:scale-105 transition-all">
            <img
              src={logoImg}
              alt="VedEngine Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl text-[#2d2721] tracking-tight group-hover:text-[#d97757] transition-colors">
              VedEngine
            </span>
            <span className="text-[10px] uppercase tracking-wider text-[#8c7b6c] font-semibold -mt-0.5">
              Enterprise Document Search
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Tabs (Only rendered when tabs are available) */}
        {visibleLinks.length > 0 && (
          <nav className="hidden md:flex items-center gap-1 bg-[#f4ebd9]/70 p-1.5 rounded-2xl border border-[#ebdcc9]">
            {visibleLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
                    active
                      ? 'bg-[#d97757] text-white shadow-sm shadow-[#d97757]/30'
                      : 'text-[#6b5c4d] hover:text-[#2d2721] hover:bg-white/80'
                  }`}
                >
                  {link.icon}
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>
        )}

        {/* Right Actions: Desktop Auth State */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            /* Logged-in User Profile Chip & Logout */
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2.5 bg-white px-3 py-1.5 rounded-xl border border-[#ebdcc9] shadow-sm">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#d97757] to-[#e28c6f] flex items-center justify-center font-extrabold text-xs text-white shadow-xs">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-[#2d2721] max-w-[120px] truncate leading-tight">
                    {user?.name || user?.email || 'User'}
                  </span>
                  <span className="text-[10px] font-extrabold uppercase text-[#d97757] tracking-wider">
                    {user?.role || 'user'}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                title="Sign Out"
                className="p-2 text-[#786b5e] hover:text-red-600 hover:bg-red-500/10 rounded-xl transition-all border border-transparent cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          ) : (
            /* Unauthenticated Visitor Links */
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-bold text-[#2d2721] hover:text-[#d97757] transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-[#d97757] hover:bg-[#c46445] text-white text-sm font-bold rounded-xl shadow-sm shadow-[#d97757]/20 hover:shadow-md hover:shadow-[#d97757]/30 transition-all flex items-center gap-1.5"
              >
                <span>Register</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-[#2d2721] hover:bg-[#f4ebd9] rounded-xl transition-colors cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

      </div>

      {/* Mobile Dropdown Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-[#ebdcc9] bg-[#fcf8f2] px-4 pt-3 pb-5 space-y-3 shadow-lg">
          
          {visibleLinks.length > 0 && (
            <div className="space-y-1">
              {visibleLinks.map((link) => {
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      active
                        ? 'bg-[#d97757] text-white'
                        : 'text-[#6b5c4d] hover:bg-[#f4ebd9] hover:text-[#2d2721]'
                    }`}
                  >
                    {link.icon}
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </div>
          )}

          <div className={`pt-3 ${visibleLinks.length > 0 ? 'border-t border-[#ebdcc9]/80' : ''}`}>
            {isAuthenticated ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#d97757] text-white flex items-center justify-center font-bold text-sm">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#2d2721] leading-tight">
                        {user?.name || user?.email}
                      </p>
                      <p className="text-[10px] font-extrabold uppercase text-[#d97757]">
                        {user?.role || 'user'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-2.5 text-center text-sm font-bold text-[#2d2721] bg-white border border-[#ebdcc9] rounded-xl hover:bg-[#f4ebd9] transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-2.5 text-center text-sm font-bold text-white bg-[#d97757] hover:bg-[#c46445] rounded-xl shadow-sm transition-all"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

        </div>
      )}
    </header>
  );
}
