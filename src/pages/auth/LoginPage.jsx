import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import AppLogo from "../../components/common/AppLogo";
import { EmployeeRoute } from "../../routes/auth/login.route.js";
import { toast } from "react-toastify";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("superadmin@gmail.com");
  const [password, setPassword] = useState("123456");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await EmployeeRoute.login({ email, password });
    setLoading(false);

    if (!result || result.statusCode !== 200 || !result.success) {
      const errorMsg = result?.message || "Login failed";
      setError(errorMsg);
      return;
    }

    if (result.data?.user) {
      login(result.data.user, result.data.accessToken);
    }

    toast.success(result.message || "Employee logged in successfully");
    navigate("/dashboard");
  };

  return (
    <div className="w-full h-screen max-h-screen bg-white flex flex-col md:flex-row overflow-hidden font-sans select-none relative">
      {/* DESKTOP FULL-SCREEN DIAGONAL SPLIT BANNER (>= 768px) - FRESH VIBRANT GREEN TO ORANGE GRADIENT */}
      <div 
        className="hidden md:block absolute inset-0 w-full h-full bg-gradient-to-br from-green-600 via-emerald-500 to-amber-500 z-0 pointer-events-none"
        style={{ clipPath: "polygon(24% 0, 100% 0, 100% 100%)" }}
      />

      {/* MOBILE DIAGONAL TOP BANNER (< 768px) */}
      <div 
        className="md:hidden w-full bg-gradient-to-br from-green-600 via-emerald-500 to-amber-500 pt-6 pb-12 px-6 text-white text-center flex flex-col items-center justify-center relative overflow-hidden shadow-md shrink-0"
        style={{ clipPath: "polygon(0 0, 100% 0, 100% 85%, 0 100%)" }}
      >
        <div className="relative z-10 flex flex-col items-center gap-1.5">
          <AppLogo size={48} showText={true} lightText={true} />
          <h2 className="text-xl font-black mt-1 text-white tracking-tight">Welcome Back</h2>
          <p className="text-[11px] text-green-50 max-w-xs font-medium">
            Workforce & Attendance Management Portal
          </p>
        </div>
      </div>

      {/* LEFT FORM SECTION (Positioned in White Area) */}
      <div className="w-full md:w-1/2 h-full max-h-screen flex flex-col justify-between p-4 sm:p-8 lg:p-12 z-10 bg-transparent overflow-hidden">
        <div className="w-full max-w-md mx-auto md:ml-4 lg:ml-8 md:mr-auto my-auto py-1">
          {/* Desktop Brand Logo Header */}
          <div className="hidden md:block mb-6 relative z-20">
            <AppLogo size={60} showText={true} />
          </div>

          {/* Title Header */}
          <div className="mb-5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Login
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
              Please enter your credentials to access your account.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs sm:text-sm font-medium">
              {error}
            </div>
          )}

          {/* Form Inputs */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all bg-white shadow-xs"
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all bg-white shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
                >
                  {showPassword ? (
                    <VisibilityOff sx={{ fontSize: 20 }} />
                  ) : (
                    <Visibility sx={{ fontSize: 20 }} />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password Row */}
            <div className="flex items-center justify-between text-xs text-slate-600 pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-green-600 focus:ring-green-600 accent-green-600 cursor-pointer"
                />
                <span className="font-medium text-slate-700">Remember Me</span>
              </label>

              <a
                href="#forgot"
                onClick={(e) => e.preventDefault()}
                className="font-semibold text-green-600 hover:text-green-700 hover:underline transition-colors"
              >
                Forgot password?
              </a>
            </div>

            {/* Right Aligned Pill LOGIN Button */}
            <div className="pt-1 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-10 py-3 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold text-xs sm:text-sm tracking-wider uppercase shadow-lg shadow-green-600/30 transition-all active:scale-98 cursor-pointer disabled:opacity-70"
              >
                {loading ? "LOGIN..." : "LOGIN"}
              </button>
            </div>
          </form>

          {/* Social Login Footer */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between gap-4">
            <span className="text-xs font-semibold text-slate-500">
              Or login with
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate("#")}
                className="w-12 h-8.5 rounded-full bg-[#3b5998] hover:opacity-90 text-white flex items-center justify-center shadow-xs transition-transform active:scale-95 cursor-pointer"
                aria-label="Login with Facebook"
              >
                <FacebookIcon sx={{ fontSize: 18 }} />
              </button>
              <button
                type="button"
                onClick={() => navigate("#")}
                className="w-12 h-8.5 rounded-full bg-[#00acee] hover:opacity-90 text-white flex items-center justify-center shadow-xs transition-transform active:scale-95 cursor-pointer"
                aria-label="Login with Twitter"
              >
                <TwitterIcon sx={{ fontSize: 18 }} />
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center md:text-left text-[11px] text-slate-400 py-1">
          © {new Date().getFullYear()} Workforce Management Portal. All rights reserved.
        </div>
      </div>

      {/* RIGHT HERO SECTION (Positioned in Top-Right Gradient Triangle area, >= 768px) */}
      <div className="hidden md:flex md:w-1/2 h-full max-h-screen z-10 flex-col justify-between p-6 md:p-10 lg:p-12 text-white text-right ml-auto pointer-events-none overflow-hidden">
        {/* Top Right Logo Badge */}
        <div className="relative z-10 flex justify-end pt-1 pr-1 pointer-events-auto">
          <AppLogo size={90} showText={true} lightText={true} />
        </div>

        {/* Hero Text */}
        <div className="relative z-10 my-auto max-w-[290px] lg:max-w-sm ml-auto pr-1 pointer-events-auto">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white drop-shadow-lg mb-3">
            Welcome <br /> Back.
          </h2>
          <p className="text-xs lg:text-sm text-green-50 font-semibold leading-relaxed drop-shadow-md">
            Empower your organization with seamless attendance tracking, workforce management, and real-time operational insights.
          </p>
        </div>

        {/* Bottom stats/badge */}
        <div className="relative z-10 flex items-center justify-end gap-3 pb-1 pr-1 text-xs font-bold pointer-events-auto">
          <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-slate-800 border border-slate-300 shadow-xs">
            ✓ Secure Portal
          </span>
          <span className="px-3 py-1 rounded-full bg-emerald-950/40 backdrop-blur-sm text-white border border-emerald-300/40 shadow-xs">
            ✓ Real-time Analytics
          </span>
        </div>
      </div>
    </div>
  );
}
