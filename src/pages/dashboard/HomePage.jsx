import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import { useAuth } from '../../contexts/AuthContext';
import { useThemeMode } from '../../contexts/ThemeContext';
import { DashboardRoute } from '../../routes/dashboard/dashboard.route';

// MUI Icons
import HomeIcon from '@mui/icons-material/Home';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import RefreshIcon from '@mui/icons-material/Refresh';
import CircularProgress from '@mui/material/CircularProgress';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import PaymentsIcon from '@mui/icons-material/Payments';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Helper to get current month formatted as "MMM-YYYY" (e.g., "Aug-2026")
const getCurrentMonthString = () => {
  const now = new Date();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[now.getMonth()]}-${now.getFullYear()}`;
};

// Helper to generate available month options (last 12 months)
const getAvailableMonths = () => {
  const list = [];
  const now = new Date();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    list.push(`${months[d.getMonth()]}-${d.getFullYear()}`);
  }
  return list;
};

export default function HomePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDark } = useThemeMode();

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthString());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [homeData, setHomeData] = useState(null);

  // Hover state for Bar Tooltip
  const [hoveredBar, setHoveredBar] = useState(null);

  const monthOptions = useMemo(() => getAvailableMonths(), []);

  // Fetch Home Dashboard stats from backend API for selected month
  const fetchHomeStats = async () => {
    setLoading(true);
    const res = await DashboardRoute.getHomeStats({ month: selectedMonth });
    if (res?.success && res?.data) {
      setHomeData(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHomeStats();
  }, [selectedMonth, refreshKey]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    }
  };

  // Real Data Bindings from Backend API
  const monthDates = useMemo(() => homeData?.fieldMetrics?.dates || [], [homeData]);
  const barValues = useMemo(() => homeData?.fieldMetrics?.values || [], [homeData]);
  const maxYValue = homeData?.fieldMetrics?.maxYValue || 5;
  const yLabels = useMemo(() => homeData?.fieldMetrics?.yLabels || ["5", "4", "3", "2", "0"], [homeData]);

  const allTasks = homeData?.taskMetrics?.total ?? 0;
  const completedCount = homeData?.taskMetrics?.completed ?? 0;
  const inProgressCount = homeData?.taskMetrics?.inProgress ?? 0;
  const pendingTask = homeData?.taskMetrics?.pending ?? (allTasks - completedCount - inProgressCount);
  const totalTasks = homeData?.taskMetrics?.total ?? 0;

  const completedPercent = homeData?.taskMetrics?.completedPercentage ?? 0;
  const pendingPercent = homeData?.taskMetrics?.pendingPercentage ?? 0;

  const ptpTasksCount = homeData?.taskMetrics?.ptpTasks ?? homeData?.taskMetrics?.totalPTP ?? 0;
  const ptpPercent = homeData?.taskMetrics?.ptpPercentage ?? 0;
  const ptpTotalPayment = homeData?.taskMetrics?.totalPayment ?? homeData?.paymentMetrics?.totalPayment ?? 0;
  const ptpCollectedPayment = homeData?.taskMetrics?.collectedPayment ?? homeData?.paymentMetrics?.collectedPayment ?? 0;
  const ptpPendingPayment = homeData?.taskMetrics?.pendingPayment ?? homeData?.paymentMetrics?.pendingPayment ?? 0;

  const monthlyTotal = homeData?.paymentMetrics?.monthly?.totalAmount ?? homeData?.paymentMetrics?.totalPayment ?? 0;
  const monthlyCollected = homeData?.paymentMetrics?.monthly?.collectedAmount ?? homeData?.paymentMetrics?.collectedPayment ?? 0;
  const monthlyPending = homeData?.paymentMetrics?.monthly?.pendingAmount ?? homeData?.paymentMetrics?.pendingPayment ?? 0;

  const todayTotal = homeData?.paymentMetrics?.today?.totalAmount ?? 0;
  const todayCollected = homeData?.paymentMetrics?.today?.collectedAmount ?? 0;
  const todayPending = homeData?.paymentMetrics?.today?.pendingAmount ?? 0;

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* Top Navigation Bar */}
      <Navbar user={user} logout={logout} />

      {/* Sub-header Bar (TrackOlap Layout) */}
      <div className={`flex-shrink-0 px-4 py-2.5 border-b flex flex-wrap items-center justify-between gap-3 ${isDark ? 'bg-slate-900/90 border-slate-800 backdrop-blur-md' : 'bg-white border-slate-200/80 shadow-xs'}`}>
        {/* Left Title & Icon */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
            <HomeIcon sx={{ fontSize: 20 }} />
          </div>
          <div>
            <h1 className={`text-sm font-extrabold leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Home Dashboard
            </h1>
            <p className={`text-xs font-semibold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
              Executive Performance &amp; Collection Summary
            </p>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 text-xs">
          {/* Fullscreen Toggle Button */}
          <button
            onClick={toggleFullscreen}
            className={`p-1.5 rounded-lg border flex items-center justify-center cursor-pointer transition-all ${
              isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100 shadow-xs'
            }`}
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <FullscreenExitIcon sx={{ fontSize: 18 }} /> : <FullscreenIcon sx={{ fontSize: 18 }} />}
          </button>

          {/* Refresh Data Button */}
          <button
            onClick={() => setRefreshKey((prev) => prev + 1)}
            disabled={loading}
            className={`p-1.5 rounded-lg border flex items-center justify-center cursor-pointer transition-all ${
              isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 disabled:opacity-50' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-50 shadow-xs'
            }`}
            title="Refresh Data"
          >
            <RefreshIcon sx={{ fontSize: 18, animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          </button>
        </div>
      </div>

      {/* Main Body Content Container */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 max-w-[1600px] w-full mx-auto">
        
        {/* Loading Indicator Header if Refetching */}
        {loading && (
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-500 px-1 animate-pulse">
            <CircularProgress size={14} color="inherit" />
            <span>Fetching live database stats for {selectedMonth}...</span>
          </div>
        )}

        {/* PTP Tasks & Payment Summary Widget (Highlight Card) */}
        <div className={`rounded-2xl border p-4 sm:p-5 relative overflow-hidden ${
          isDark ? 'bg-slate-900/90 border-slate-800 shadow-md' : 'bg-white border-slate-200/90 shadow-sm'
        }`}>
          {/* Accent top border gradient strip */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

          {/* Widget Header */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-black text-sm shadow-md shadow-indigo-500/20">
                PTP
              </div>
              <div>
                <h3 className={`text-sm font-extrabold tracking-tight flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  <span>Promise To Pay (PTP) &amp; Payment Metrics</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                    Live
                  </span>
                </h3>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Collection target metrics &amp; commitment task details
                </p>
              </div>
            </div>
          </div>

          {/* 4 Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Metric 1: PTP Tasks Count (ONLY THIS CARD IS CLICKABLE) */}
            <div
              onClick={() => navigate('/tasks/ptp')}
              className={`p-4 rounded-xl border flex items-center justify-between gap-3 cursor-pointer hover:border-indigo-400 transition-all ${
                isDark ? 'bg-slate-800/50 border-indigo-500/30' : 'bg-indigo-50/60 border-indigo-200'
              }`}
            >
              <div>
                <span className={`text-xs font-bold uppercase tracking-wider block ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                  PTP TASKS
                </span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {ptpTasksCount.toLocaleString()}
                  </span>
                  <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    tasks
                  </span>
                </div>
                <span className="text-[10px] font-bold text-indigo-500 mt-1 block">
                  Click to open PTP Table &rarr;
                </span>
              </div>

              {/* Progress Circle */}
              <div className="relative w-12 h-12 flex-shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className={isDark ? 'text-slate-800' : 'text-indigo-100'}
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={isDark ? 'text-indigo-400' : 'text-indigo-600'}
                    strokeDasharray={`${ptpPercent}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className={`absolute text-[11px] font-black ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>
                  {ptpPercent}%
                </span>
              </div>
            </div>

            {/* Metric 2: Total Amount */}
            <div className={`p-4 rounded-xl border flex flex-col justify-between ${
              isDark ? 'bg-slate-800/50 border-slate-700/80' : 'bg-slate-50/80 border-slate-200/80'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                  Total Amount
                </span>
                <div className="w-6 h-6 rounded-md bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <AccountBalanceWalletIcon sx={{ fontSize: 15 }} />
                </div>
              </div>
              <p className={`text-2xl font-black mt-2 ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                &#8377;{ptpTotalPayment.toLocaleString('en-IN')}
              </p>
            </div>

            {/* Metric 3: Collected Amount */}
            <div className={`p-4 rounded-xl border flex flex-col justify-between ${
              isDark ? 'bg-slate-800/50 border-slate-700/80' : 'bg-slate-50/80 border-slate-200/80'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                  Collected Amount
                </span>
                <div className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <TrendingUpIcon sx={{ fontSize: 15 }} />
                </div>
              </div>
              <p className={`text-2xl font-black mt-2 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                &#8377;{ptpCollectedPayment.toLocaleString('en-IN')}
              </p>
            </div>

            {/* Metric 4: Pending Amount */}
            <div className={`p-4 rounded-xl border flex flex-col justify-between ${
              isDark ? 'bg-slate-800/50 border-slate-700/80' : 'bg-slate-50/80 border-slate-200/80'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                  Pending Amount
                </span>
                <div className="w-6 h-6 rounded-md bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <PendingActionsIcon sx={{ fontSize: 15 }} />
                </div>
              </div>
              <p className={`text-2xl font-black mt-2 ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
                &#8377;{ptpPendingPayment.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          {/* Detailed Payment Metrics Breakdown (Monthly & Today) */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Monthly Payment */}
            <div className={`p-3 rounded-xl border flex items-center justify-between gap-2 text-xs ${
              isDark ? 'bg-slate-800/40 border-slate-700/60' : 'bg-slate-50 border-slate-200/60'
            }`}>
              <span className={`font-extrabold ${isDark ? 'text-indigo-300' : 'text-indigo-900'}`}>Monthly Payment:</span>
              <div className="flex items-center gap-3 font-medium">
                <span>Total: <strong className="font-bold">&#8377;{monthlyTotal.toLocaleString('en-IN')}</strong></span>
                <span className="text-emerald-600 dark:text-emerald-400">Collected: <strong className="font-bold">&#8377;{monthlyCollected.toLocaleString('en-IN')}</strong></span>
                <span className="text-amber-600 dark:text-amber-400">Pending: <strong className="font-bold">&#8377;{monthlyPending.toLocaleString('en-IN')}</strong></span>
              </div>
            </div>

            {/* Today Payment */}
            <div className={`p-3 rounded-xl border flex items-center justify-between gap-2 text-xs ${
              isDark ? 'bg-slate-800/40 border-slate-700/60' : 'bg-slate-50 border-slate-200/60'
            }`}>
              <span className={`font-extrabold ${isDark ? 'text-indigo-300' : 'text-indigo-900'}`}>Today Payment:</span>
              <div className="flex items-center gap-3 font-medium">
                <span>Total: <strong className="font-bold">&#8377;{todayTotal.toLocaleString('en-IN')}</strong></span>
                <span className="text-emerald-600 dark:text-emerald-400">Collected: <strong className="font-bold">&#8377;{todayCollected.toLocaleString('en-IN')}</strong></span>
                <span className="text-amber-600 dark:text-amber-400">Pending: <strong className="font-bold">&#8377;{todayPending.toLocaleString('en-IN')}</strong></span>
              </div>
            </div>
          </div>

        </div>

        {/* Task-Form Field Metrics Green Bar Chart Card */}
        <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-slate-900/90 border-slate-800 shadow-md' : 'bg-white border-slate-200/90 shadow-sm'}`}>
          {/* Card Header */}
          <div className={`px-4 py-3 border-b flex items-center justify-between text-xs font-bold ${isDark ? 'bg-slate-800/70 text-slate-100 border-slate-800' : 'bg-slate-50/90 text-slate-800 border-slate-200'}`}>
            <span className="text-sm font-extrabold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Task-Form Field Metrics
            </span>

            <div className="flex items-center gap-2">
              {/* Dynamic Month Selector Pill */}
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold ${isDark ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-700 shadow-2xs'}`}>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-transparent outline-none cursor-pointer pr-1 font-bold"
                >
                  {monthOptions.map((m) => (
                    <option key={m} value={m} className={isDark ? 'bg-slate-800 text-slate-100' : 'bg-white text-slate-900'}>
                      {m}
                    </option>
                  ))}
                </select>
                <CalendarMonthIcon sx={{ fontSize: 15, color: '#3b82f6' }} />
              </div>

              {/* 3-Dots Menu Icon */}
              <button className="text-slate-400 hover:text-slate-600 cursor-pointer p-1">
                <MoreVertIcon sx={{ fontSize: 18 }} />
              </button>
            </div>
          </div>

          {/* Bar Chart Canvas Area */}
          <div className="p-4 sm:p-5 overflow-x-auto relative">
            <div className="min-w-[950px] h-[250px] relative pt-2">
              
              {/* Y-Axis Grid Lines & Dynamic Labels */}
              <div className={`absolute inset-y-0 left-8 right-2 flex flex-col justify-between text-[10px] font-bold pointer-events-none pb-9 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {yLabels.map((lbl, idx) => (
                  <div key={`${lbl}-${idx}`} className={`border-b w-full flex items-center justify-start ${idx === yLabels.length - 1 ? 'border-none' : isDark ? 'border-slate-800/80' : 'border-slate-100'}`}>
                    <span className="w-10 text-right pr-2">{lbl}</span>
                  </div>
                ))}
              </div>

              {/* Green Bars Container */}
              <div className="absolute left-20 top-2 right-4 bottom-10 flex items-end justify-between px-1">
                {monthDates.map((dateStr, idx) => {
                  const val = barValues[idx] || 0;
                  const heightPercent = maxYValue > 0 ? Math.min(100, Math.max(val > 0 ? 4 : 0, (val / maxYValue) * 100)) : 0;

                  return (
                    <div
                      key={dateStr}
                      className="flex-1 flex flex-col items-center justify-end h-full relative cursor-pointer px-[2px]"
                      onMouseEnter={() => setHoveredBar({ date: dateStr, val })}
                      onMouseLeave={() => setHoveredBar(null)}
                    >
                      {/* Hover Tooltip Box */}
                      {hoveredBar?.date === dateStr && (
                        <div className="absolute bottom-full mb-1 z-20 bg-slate-900 text-white text-[10px] px-2.5 py-1.5 rounded-lg shadow-xl whitespace-nowrap pointer-events-none font-sans border border-slate-700">
                          <div className="font-extrabold">{dateStr}</div>
                          <div className="text-emerald-400 font-bold">Visits / Count: {val.toLocaleString()}</div>
                        </div>
                      )}

                      {/* Solid Green Vertical Bar */}
                      <div
                        className={`w-[7px] sm:w-[9px] max-w-[10px] mx-auto ${val > 0 ? 'bg-emerald-600' : 'bg-transparent'} rounded-t-sm`}
                        style={{ height: `${heightPercent}%` }}
                      />

                    </div>
                  );
                })}
              </div>

              {/* X-Axis Rotated Date Labels */}
              <div className={`absolute bottom-0 left-20 right-4 flex justify-between items-end text-[10px] font-bold pointer-events-none ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {monthDates.map((dateStr) => (
                  <div key={dateStr} className="flex-1 flex justify-center">
                    <span className="transform -rotate-45 origin-top-left whitespace-nowrap block text-[9px] -ml-2">
                      {dateStr}
                    </span>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>

        {/* Task Summary Overview Grid Cards */}
        <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-slate-900/90 border-slate-800 shadow-md' : 'bg-white border-slate-200/90 shadow-sm'}`}>
          <div className={`px-4 py-3 border-b text-xs font-bold flex items-center justify-between ${isDark ? 'bg-slate-800/70 text-slate-100 border-slate-800' : 'bg-slate-50/90 text-slate-800 border-slate-200'}`}>
            <span className="text-sm font-extrabold">Overall Task Summary</span>
            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Month: {selectedMonth}</span>
          </div>

          <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* Metric 1: All Tasks */}
            <div
              onClick={() => navigate('/tasks/all?status=all', { state: { status: 'All' } })}
              className={`p-4 rounded-xl border flex items-center justify-between gap-3 cursor-pointer ${
                isDark ? 'bg-slate-800/50 border-slate-700/80 hover:border-blue-500/50 hover:bg-slate-800/80 transition-all' : 'bg-slate-50/80 border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/30 transition-all'
              }`}
            >
              <div>
                <h4 className={`text-xs font-extrabold uppercase tracking-wider ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                  All Tasks
                </h4>
                <p className={`text-2xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {allTasks.toLocaleString()}
                </p>
                <span className={`text-[11px] font-semibold block mt-0.5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                  Total Assignments &rarr;
                </span>
              </div>

              {/* Progress Ring */}
              <div className="relative w-12 h-12 flex-shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className={isDark ? 'text-slate-800' : 'text-blue-100'}
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={isDark ? 'text-blue-400' : 'text-blue-600'}
                    strokeDasharray="100, 100"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className={`absolute text-[11px] font-black ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>100%</span>
              </div>
            </div>

            {/* Metric 2: Pending Tasks */}
            <div
              onClick={() => navigate('/tasks/all?status=pending', { state: { status: 'Pending' } })}
              className={`p-4 rounded-xl border flex items-center justify-between gap-3 cursor-pointer ${
                isDark ? 'bg-slate-800/50 border-slate-700/80 hover:border-amber-500/50 hover:bg-slate-800/80 transition-all' : 'bg-slate-50/80 border-slate-200/80 hover:border-amber-300 hover:bg-amber-50/30 transition-all'
              }`}
            >
              <div>
                <h4 className={`text-xs font-extrabold uppercase tracking-wider ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                  Pending Tasks
                </h4>
                <p className={`text-2xl font-black mt-1 ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                  {pendingTask.toLocaleString()}
                </p>
                <span className={`text-[11px] font-semibold block mt-0.5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                  Awaiting completion &rarr;
                </span>
              </div>

              {/* Progress Ring */}
              <div className="relative w-12 h-12 flex-shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className={isDark ? 'text-slate-800' : 'text-amber-100'}
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={isDark ? 'text-amber-400' : 'text-amber-500'}
                    strokeDasharray={`${pendingPercent}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className={`absolute text-[11px] font-black ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>{pendingPercent}%</span>
              </div>
            </div>

            {/* Metric 3: Completed Tasks */}
            <div
              onClick={() => navigate('/tasks/all?status=completed', { state: { status: 'Completed' } })}
              className={`p-4 rounded-xl border flex items-center justify-between gap-3 cursor-pointer ${
                isDark ? 'bg-slate-800/50 border-slate-700/80 hover:border-emerald-500/50 hover:bg-slate-800/80 transition-all' : 'bg-slate-50/80 border-slate-200/80 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all'
              }`}
            >
              <div>
                <h4 className={`text-xs font-extrabold uppercase tracking-wider ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                  Completed Tasks
                </h4>
                <p className={`text-2xl font-black mt-1 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                  {completedCount.toLocaleString()}
                </p>
                <span className={`text-[11px] font-semibold block mt-0.5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                  out of {totalTasks.toLocaleString()} tasks &rarr;
                </span>
              </div>

              {/* Progress Ring */}
              <div className="relative w-12 h-12 flex-shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className={isDark ? 'text-slate-800' : 'text-emerald-100'}
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={isDark ? 'text-emerald-400' : 'text-emerald-500'}
                    strokeDasharray={`${completedPercent}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className={`absolute text-[11px] font-black ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>{completedPercent}%</span>
              </div>
            </div>

          </div>
        </div>

      </main>

      {/* TrackOlap Footer */}
      <footer className={`flex-shrink-0 px-4 py-2.5 border-t text-[11px] flex items-center justify-between transition-colors ${isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500'}`}>
        <div>Powered by <strong className={isDark ? 'text-slate-200' : 'text-slate-700'}>TrackOlap ®</strong> | 2.6.616</div>
        <div className="flex gap-4 font-medium">
          <a href="#privacy" className="hover:underline hover:text-blue-500">Privacy</a>
          <a href="#terms" className="hover:underline hover:text-blue-500">Terms &amp; Conditions</a>
        </div>
      </footer>
    </div>
  );
}
