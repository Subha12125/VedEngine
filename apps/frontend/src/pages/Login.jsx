import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import logoImg from "../assets/logo.png";

/**
 * Login Component Page - Claude Warm Beige Theme
 * ----------------------------------------------
 * Clean, warm parchment theme for user authentication.
 */
const Login = () => {
    const navigate = useNavigate();
    const [formdata, setFormdata] = useState({
        email: "",
        password: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormdata({
            ...formdata,
            [e.target.name]: e.target.value
        });
    };
    
    const handlesubmit = async (e) => {
        try {
            e.preventDefault();
            setLoading(true);
            setError("");
            
            const response = await api.post("/auth/login", formdata);
            const data = response.data?.data || response.data;

            if (data?.token) {
                localStorage.setItem("token", data.token);
            }
            if (data?.user) {
                localStorage.setItem("user", JSON.stringify(data.user));
            }

            navigate("/dashboard");
        } catch (error) {
            console.error("Login error:", error);
            setError(
                error.response?.data?.message ||
                "Login failed. Please check your credentials."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#faf4ec] text-[#2d2721] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
            
            {/* Soft Ambient Background Glows */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#f4ebd9] blur-3xl rounded-full pointer-events-none" />
            <div className="absolute bottom-10 right-10 w-80 h-80 bg-[#ebdcc9]/50 blur-3xl rounded-full pointer-events-none" />

            {/* Main Form Card */}
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
                        Login to VedEngine
                    </h1>
                    <p className="text-sm text-[#786b5e] mt-1">
                        Access your AI-powered document search engine
                    </p>
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

                {/* Login Form */}
                <form onSubmit={handlesubmit} className="space-y-5">
                    
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#6b5c4d] mb-2">
                            Email Address
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formdata.email}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 bg-[#fcfaf7] border border-[#ebdcc9] focus:border-[#d97757] focus:ring-2 focus:ring-[#d97757]/20 rounded-xl text-[#2d2721] placeholder-[#a89887] outline-none transition-all"
                            placeholder="name@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#6b5c4d] mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formdata.password}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 bg-[#fcfaf7] border border-[#ebdcc9] focus:border-[#d97757] focus:ring-2 focus:ring-[#d97757]/20 rounded-xl text-[#2d2721] placeholder-[#a89887] outline-none transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3.5 px-6 rounded-xl font-bold text-white transition-all duration-200 shadow-md cursor-pointer ${
                            loading
                                ? "bg-[#a89887] cursor-not-allowed opacity-60"
                                : "bg-[#d97757] hover:bg-[#c46445] shadow-[#d97757]/20"
                        }`}
                    >
                        {loading ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>Signing in...</span>
                            </div>
                        ) : (
                            "Login to Dashboard"
                        )}
                    </button>

                </form>

                {/* Footer Link */}
                <p className="mt-8 text-center text-sm text-[#786b5e]">
                    Don't have an account?{" "}
                    <Link
                        to="/register"
                        className="text-[#d97757] hover:text-[#b5583b] font-bold transition-colors"
                    >
                        Register here
                    </Link>
                </p>

            </div>
        </div>
    );
};

export default Login;