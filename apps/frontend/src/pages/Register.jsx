import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/logo.png';

/**
 * Register Component Page - Claude Warm Beige Theme
 */
export default function Register() {
  const [formdata, setFormdata] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormdata({
      ...formdata,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formdata.name || !formdata.email || !formdata.password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (formdata.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (formdata.password !== formdata.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);

      const result = await register(
        formdata.name.trim(),
        formdata.email.trim(),
        formdata.password
      );

      if (result.success) {
        navigate('/dashboard', { replace: true });
      } else {
        setError(result.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf4ec] text-[#2d2721] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Glow Lights */}
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#f4ebd9] blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-[#ebdcc9]/50 blur-3xl rounded-full pointer-events-none" />

      {/* Main Glass Card */}
      <div className="w-full max-w-md bg-[#ffffff] border border-[#ebdcc9] rounded-3xl p-8 shadow-xl shadow-amber-900/5 z-10 relative">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#f4ebd9] rounded-2xl border border-[#ebdcc9] p-2 shadow-sm mb-4">
            <img
              src={logoImg}
              alt="VedEngine Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-3xl font-extrabold text-[#2d2721] font-serif tracking-tight">
            Create Account
          </h1>
          <p className="text-sm text-[#786b5e] mt-1">Join VedEngine AI Search platform</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm flex items-start gap-3">
            <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6b5c4d] mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formdata.name}
              onChange={handleChange}
              placeholder="Subhojit Roy"
              required
              className="w-full bg-[#fcfaf7] border border-[#ebdcc9] focus:border-[#d97757] focus:ring-2 focus:ring-[#d97757]/20 rounded-xl px-4 py-3 text-[#2d2721] placeholder-[#a89887] outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6b5c4d] mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formdata.email}
              onChange={handleChange}
              placeholder="subho@example.com"
              required
              className="w-full bg-[#fcfaf7] border border-[#ebdcc9] focus:border-[#d97757] focus:ring-2 focus:ring-[#d97757]/20 rounded-xl px-4 py-3 text-[#2d2721] placeholder-[#a89887] outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6b5c4d] mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formdata.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full bg-[#fcfaf7] border border-[#ebdcc9] focus:border-[#d97757] focus:ring-2 focus:ring-[#d97757]/20 rounded-xl px-4 py-3 text-[#2d2721] placeholder-[#a89887] outline-none transition-all pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#d97757] hover:text-[#b5583b] font-bold"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6b5c4d] mb-1.5">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formdata.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className="w-full bg-[#fcfaf7] border border-[#ebdcc9] focus:border-[#d97757] focus:ring-2 focus:ring-[#d97757]/20 rounded-xl px-4 py-3 text-[#2d2721] placeholder-[#a89887] outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-[#d97757] hover:bg-[#c46445] text-white font-bold py-3.5 rounded-xl shadow-md shadow-[#d97757]/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Creating account...</span>
              </div>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-[#786b5e]">
          Already have an account?{' '}
          <Link to="/login" className="text-[#d97757] hover:text-[#b5583b] font-bold transition-colors">
            Login here
          </Link>
        </p>

      </div>
    </div>
  );
}
