import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useThemeMode } from "../../contexts/ThemeContext";
import AppLogo from "../../components/common/AppLogo";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import LoginIcon from "@mui/icons-material/Login";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import SecurityIcon from "@mui/icons-material/Security";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import IconButton from "@mui/material/IconButton";

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useThemeMode();

  return (
    <div
      className={`h-screen max-h-screen w-full overflow-hidden flex flex-col justify-between selection:bg-indigo-500 selection:text-white transition-colors duration-300 relative select-none ${
        isDark
          ? "bg-slate-950 text-slate-100"
          : "bg-gradient-to-br from-slate-50 via-indigo-50/20 to-emerald-50/20 text-slate-900"
      }`}
    >
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className={`absolute -top-32 -left-32 w-80 h-80 rounded-full blur-3xl opacity-20 ${
            isDark ? "bg-indigo-600" : "bg-indigo-400"
          }`}
        />
        <div
          className={`absolute top-1/2 -right-32 w-80 h-80 rounded-full blur-3xl opacity-20 ${
            isDark ? "bg-emerald-600" : "bg-emerald-400"
          }`}
        />
      </div>

      {/* Top Header Navigation */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-3 sm:py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <AppLogo size={42} showText={true} />
        </div>

        <div className="flex items-center gap-3">
          <IconButton
            onClick={toggleTheme}
            size="small"
            sx={{
              p: 1,
              borderRadius: "12px",
              backgroundColor: isDark ? "rgba(30, 41, 59, 0.7)" : "#ffffff",
              border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e2e8f0",
              color: isDark ? "#fbbf24" : "#475569",
              boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
            }}
          >
            {isDark ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
          </IconButton>

          {isAuthenticated ? (
            <button
              onClick={() => navigate("/home")}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm tracking-wide shadow-md shadow-indigo-600/30 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>Dashboard</span>
              <ArrowForwardIcon sx={{ fontSize: 15 }} />
            </button>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold tracking-wide transition-all border cursor-pointer ${
                isDark
                  ? "bg-slate-900 border-slate-800 text-white hover:bg-slate-800"
                  : "bg-white border-slate-200 text-slate-800 hover:bg-slate-50 shadow-xs"
              }`}
            >
              Employee Login
            </button>
          )}
        </div>
      </header>

      {/* Main Hero Container - Fits exactly within remaining height without scroll */}
      <main className="relative z-10 w-full max-w-5xl mx-auto px-5 py-2 flex-1 min-h-0 flex flex-col justify-center">
        {/* Title & Headline */}
        <div className="text-center max-w-2xl mx-auto mb-5 sm:mb-6 flex-shrink-0">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide mb-2.5 border bg-indigo-500/10 text-indigo-500 border-indigo-500/20">
            <VerifiedUserIcon sx={{ fontSize: 13 }} />
            <span>Digital Workforce & Self-Service Portal</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-500 bg-clip-text text-transparent">
              Satya Collection
            </span>
          </h1>

          <p
            className={`mt-2 text-xs sm:text-sm max-w-xl mx-auto font-medium ${
              isDark ? "text-slate-400" : "text-slate-600"
            }`}
          >
            New joiners can register directly through Self-Onboarding. Existing employees can sign in to manage tasks, attendance, and operations.
          </p>
        </div>

        {/* Two Primary Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 max-w-3xl mx-auto w-full">
          {/* Card 1: Self Onboarding */}
          <div
            onClick={() => navigate("/onboarding")}
            className={`group relative p-6 sm:p-7 rounded-3xl border transition-all duration-300 cursor-pointer flex flex-col justify-between hover:-translate-y-1 ${
              isDark
                ? "bg-slate-900/80 border-slate-800 hover:border-indigo-500/60 hover:shadow-xl hover:shadow-indigo-500/10"
                : "bg-white border-slate-200 hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-500/15"
            }`}
          >
            <div className="absolute top-5 right-5">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                New Candidates
              </span>
            </div>

            <div>
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/25 mb-4 group-hover:scale-105 transition-transform">
                <HowToRegIcon sx={{ fontSize: 28 }} />
              </div>

              <h2 className="text-xl sm:text-2xl font-black tracking-tight mb-2">
                Employee Self-Onboarding
              </h2>

              <p
                className={`text-xs leading-relaxed mb-4 font-medium ${
                  isDark ? "text-slate-400" : "text-slate-600"
                }`}
              >
                Joining our organization? Verify your mobile via OTP, upload your PAN & Aadhaar documents, and pinpoint your home address on Google Maps.
              </p>

              <div className="space-y-1.5 mb-5">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Instant Mobile OTP Verification</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Digital PAN & Aadhaar Card Upload</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Google Maps Geolocation Pinning</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-extrabold text-xs sm:text-sm tracking-wide shadow-md shadow-indigo-600/30 flex items-center justify-center gap-1.5 group-hover:gap-2.5 transition-all cursor-pointer"
            >
              <span>Start Self-Onboarding</span>
              <ArrowForwardIcon sx={{ fontSize: 16 }} />
            </button>
          </div>

          {/* Card 2: Employee Login */}
          <div
            onClick={() => navigate("/login")}
            className={`group relative p-6 sm:p-7 rounded-3xl border transition-all duration-300 cursor-pointer flex flex-col justify-between hover:-translate-y-1 ${
              isDark
                ? "bg-slate-900/80 border-slate-800 hover:border-emerald-500/60 hover:shadow-xl hover:shadow-emerald-500/10"
                : "bg-white border-slate-200 hover:border-emerald-400 hover:shadow-xl hover:shadow-emerald-500/15"
            }`}
          >
            <div className="absolute top-5 right-5">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Staff & Managers
              </span>
            </div>

            <div>
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/25 mb-4 group-hover:scale-105 transition-transform">
                <LoginIcon sx={{ fontSize: 28 }} />
              </div>

              <h2 className="text-xl sm:text-2xl font-black tracking-tight mb-2">
                Employee & Admin Login
              </h2>

              <p
                className={`text-xs leading-relaxed mb-4 font-medium ${
                  isDark ? "text-slate-400" : "text-slate-600"
                }`}
              >
                Already have an active account? Sign in with your registered email and password to access the dashboard, mark attendance, and manage daily operations.
              </p>

              <div className="space-y-1.5 mb-5">
                <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  <span>Attendance & Daily Shift Tracking</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  <span>Task Allocation & Collections</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  <span>Field Visits & Real-time Reports</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-extrabold text-xs sm:text-sm tracking-wide shadow-md shadow-emerald-600/30 flex items-center justify-center gap-1.5 group-hover:gap-2.5 transition-all cursor-pointer"
            >
              <span>Sign In to Account</span>
              <ArrowForwardIcon sx={{ fontSize: 16 }} />
            </button>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-[11px] font-bold text-slate-400 flex-shrink-0">
          <div className="flex items-center gap-1">
            <SecurityIcon sx={{ fontSize: 14, color: "#10b981" }} />
            <span>Encrypted Submissions</span>
          </div>
          <span className="text-slate-600">•</span>
          <div className="flex items-center gap-1">
            <LocationOnIcon sx={{ fontSize: 14, color: "#ef4444" }} />
            <span>Google Maps Verified</span>
          </div>
          <span className="text-slate-600">•</span>
          <div className="flex items-center gap-1">
            <VerifiedUserIcon sx={{ fontSize: 14, color: "#6366f1" }} />
            <span>Fast HR Approval</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-2.5 text-center text-[11px] text-slate-400 flex-shrink-0">
        © {new Date().getFullYear()} Satya Collection. All rights reserved.
      </footer>
    </div>
  );
}
