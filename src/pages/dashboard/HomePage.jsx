import React, { useState, useEffect, useMemo } from 'react';
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
  const { user, logout } = useAuth();
  const { isDark } = useThemeMode();

  const [selectedDashboard, setSelectedDashboard] = useState('Default');
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
    const res = await DashboardRoute.getHomeStats({ dashboard: selectedDashboard, month: selectedMonth });
    if (res?.success && res?.data) {
      setHomeData(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHomeStats();
  }, [selectedDashboard, selectedMonth, refreshKey]);

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
  const inProgressPercent = homeData?.taskMetrics?.inProgressPercentage ?? 0;
  const pendingPercent = homeData?.taskMetrics?.pendingPercentage ?? 0;

  return (
    <div className={`h-screen flex flex-col font-sans overflow-hidden transition-colors duration-200 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-[#f4f6f9] text-slate-900'}`}>
      {/* Top Navigation Bar */}
      <Navbar user={user} logout={logout} />

      {/* Sub-header Bar (TrackOlap Layout) */}
      <div className={`flex-shrink-0 px-4 py-2.5 border-b flex flex-wrap items-center justify-between gap-3 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'}`}>
        {/* Left Title & Icon */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center text-white shadow-xs">
            <HomeIcon sx={{ fontSize: 20 }} />
          </div>
          <div>
            <h1 className={`text-sm font-extrabold leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Home</h1>
            <p className={`text-xs font-semibold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>Summary</p>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 text-xs">
          {/* Select Dashboard Field */}
          <div className="relative flex items-center">
            <fieldset className={`border rounded px-2 py-0.5 flex items-center gap-1 ${isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-300 bg-white'}`}>
              <legend className={`text-[9px] px-1 font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Select Dashboard</legend>
              <select
                value={selectedDashboard}
                onChange={(e) => setSelectedDashboard(e.target.value)}
                className={`text-xs bg-transparent outline-none cursor-pointer pr-1 font-bold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}
              >
                {(homeData?.dashboards || ["Default", "Custom Dashboard 1", "Custom Dashboard 2"]).map((db) => (
                  <option key={db} value={db} className={isDark ? 'bg-slate-800 text-slate-100' : 'bg-white text-slate-900'}>
                    {db}
                  </option>
                ))}
              </select>
            </fieldset>
          </div>

          {/* Fullscreen Toggle Button */}
          <button
            onClick={toggleFullscreen}
            className={`p-1.5 rounded border flex items-center justify-center cursor-pointer transition-colors ${
              isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
            }`}
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <FullscreenExitIcon sx={{ fontSize: 18 }} /> : <FullscreenIcon sx={{ fontSize: 18 }} />}
          </button>

          {/* Refresh Button */}
          <button
            onClick={() => setRefreshKey((prev) => prev + 1)}
            className={`p-1.5 rounded border flex items-center justify-center cursor-pointer transition-colors ${
              isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
            }`}
            title="Refresh Data"
          >
            <RefreshIcon sx={{ fontSize: 18 }} />
          </button>
        </div>
      </div>

      {/* Main Body Content Container */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4 max-w-[1600px] w-full mx-auto">
        
        {/* Loading Indicator Header if Refetching */}
        {loading && (
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-500 px-1">
            <CircularProgress size={14} color="inherit" />
            <span>Fetching live database stats for {selectedMonth}...</span>
          </div>
        )}

        {/* Task-Form Field Metrics Green Bar Chart Card (Real Database Data) */}
        <div className={`rounded-md border overflow-hidden transition-all ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90 shadow-2xs'}`}>
          {/* Card Header: Title Left, Month Selector & 3 Dots Right */}
          <div className={`px-4 py-2.5 border-b flex items-center justify-between text-xs font-bold ${isDark ? 'bg-slate-800/80 text-slate-100 border-slate-800' : 'bg-slate-50/80 text-slate-800 border-slate-200'}`}>
            <span>Task-Form Field Metrics</span>

            <div className="flex items-center gap-2">
              {/* Dynamic Month Selector Pill */}
              <div className={`flex items-center gap-1 px-2 py-1 rounded border text-xs font-semibold ${isDark ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-700'}`}>
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
              <button className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <MoreVertIcon sx={{ fontSize: 18 }} />
              </button>
            </div>
          </div>

          {/* Bar Chart Canvas Area */}
          <div className="p-4 overflow-x-auto relative">
            <div className="min-w-[950px] h-[250px] relative pt-2">
              
              {/* Y-Axis Grid Lines & Dynamic Labels */}
              <div className={`absolute inset-y-0 left-8 right-2 flex flex-col justify-between text-[10px] font-bold pointer-events-none pb-9 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {yLabels.map((lbl, idx) => (
                  <div key={`${lbl}-${idx}`} className={`border-b w-full flex items-center justify-start ${idx === yLabels.length - 1 ? 'border-none' : isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                    <span className="w-10 text-right pr-2">{lbl}</span>
                  </div>
                ))}
              </div>

              {/* Green Bars Container (Rendered from Real DB Query Array) */}
              <div className="absolute left-20 top-2 right-4 bottom-10 flex items-end justify-between px-1">
                {monthDates.map((dateStr, idx) => {
                  const val = barValues[idx] || 0;
                  // Height percentage relative to maxYValue calculated from DB
                  const heightPercent = maxYValue > 0 ? Math.min(100, Math.max(val > 0 ? 4 : 0, (val / maxYValue) * 100)) : 0;

                  return (
                    <div
                      key={dateStr}
                      className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer px-[2px]"
                      onMouseEnter={() => setHoveredBar({ date: dateStr, val })}
                      onMouseLeave={() => setHoveredBar(null)}
                    >
                      {/* Hover Tooltip Box */}
                      {hoveredBar?.date === dateStr && (
                        <div className="absolute bottom-full mb-1 z-20 bg-slate-900 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap pointer-events-none font-sans border border-slate-700">
                          <div className="font-bold">{dateStr}</div>
                          <div className="text-emerald-400">Count: {val.toLocaleString()}</div>
                        </div>
                      )}

                      {/* Slim Thin Solid Green Vertical Bar */}
                      <div
                        className={`w-[7px] sm:w-[9px] max-w-[10px] mx-auto ${val > 0 ? 'bg-[#15803d] hover:bg-[#16a34a]' : 'bg-transparent'} rounded-t-[2px] transition-all duration-300`}
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

        {/* Bottom Card: Task Summary Metrics */}
        <div className={`rounded-md border overflow-hidden w-full max-w-5xl transition-all ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90 shadow-2xs'}`}>
          <div className={`px-4 py-2.5 border-b text-xs font-bold ${isDark ? 'bg-slate-800/80 text-slate-100 border-slate-800' : 'bg-slate-50/80 text-slate-800 border-slate-200'}`}>
            Task
          </div>

          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Metric 1: All Tasks */}
            <div className={`p-3 rounded-md border flex items-center justify-between gap-2 ${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-slate-200'}`}>
              <div>
                <h4 className={`text-xs font-bold whitespace-nowrap ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>All Tasks</h4>
                <p className={`text-xs font-extrabold mt-1 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                  {allTasks.toLocaleString()}
                </p>
              </div>

              {/* Circular Progress Ring (100% for Total) */}
              <div className="relative w-11 h-11 flex-shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className={isDark ? 'text-slate-800' : 'text-blue-100'}
                    strokeWidth="3.2"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={isDark ? 'text-blue-400' : 'text-blue-600'}
                    strokeDasharray="100, 100"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className={`absolute text-[11px] font-extrabold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>100%</span>
              </div>
            </div>

            {/* Metric 2: Pending Tasks */}
            <div className={`p-3 rounded-md border flex items-center justify-between gap-2 ${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-slate-200'}`}>
              <div>
                <h4 className={`text-xs font-bold whitespace-nowrap ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>Pending Tasks</h4>
                <p className={`text-xs font-extrabold mt-1 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                  {pendingTask.toLocaleString()}
                </p>
              </div>

              {/* Circular Progress Ring */}
              <div className="relative w-11 h-11 flex-shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className={isDark ? 'text-slate-800' : 'text-amber-100'}
                    strokeWidth="3.2"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={isDark ? 'text-amber-400' : 'text-amber-500'}
                    strokeDasharray={`${pendingPercent}, 100`}
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className={`absolute text-[11px] font-extrabold ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>{pendingPercent}%</span>
              </div>
            </div>

           
            {/* Metric 4: In Progress */}
            <div className={`p-3 rounded-md border flex items-center justify-between gap-2 ${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-slate-200'}`}>
              <div>
                <h4 className={`text-xs font-bold whitespace-nowrap ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>In Progress</h4>
                <p className={`text-xs font-extrabold mt-1 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                  {inProgressCount.toLocaleString()} <span className={`text-[11px] font-semibold whitespace-nowrap ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>out of {totalTasks.toLocaleString()}</span>
                </p>
              </div>

              {/* Circular Progress Ring */}
              <div className="relative w-11 h-11 flex-shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className={isDark ? 'text-slate-800' : 'text-blue-100'}
                    strokeWidth="3.2"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={isDark ? 'text-blue-400' : 'text-blue-600'}
                    strokeDasharray={`${inProgressPercent}, 100`}
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className={`absolute text-[11px] font-extrabold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{inProgressPercent}%</span>
              </div>
            </div>

             {/* Metric 3: Completed */}
            <div className={`p-3 rounded-md border flex items-center justify-between gap-2 ${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-slate-200'}`}>
              <div>
                <h4 className={`text-xs font-bold whitespace-nowrap ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>Completed</h4>
                <p className={`text-xs font-extrabold mt-1 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                  {completedCount.toLocaleString()} <span className={`text-[11px] font-semibold whitespace-nowrap ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>out of {totalTasks.toLocaleString()}</span>
                </p>
              </div>

              {/* Circular Progress Ring */}
              <div className="relative w-11 h-11 flex-shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className={isDark ? 'text-slate-800' : 'text-red-100'}
                    strokeWidth="3.2"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={isDark ? 'text-red-400' : 'text-red-500'}
                    strokeDasharray={`${completedPercent}, 100`}
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className={`absolute text-[11px] font-extrabold ${isDark ? 'text-red-400' : 'text-red-600'}`}>{completedPercent}%</span>
              </div>
            </div>

          </div>
        </div>

      </main>

      {/* TrackOlap Footer */}
      <footer className={`flex-shrink-0 px-4 py-2 border-t text-[11px] flex items-center justify-between transition-colors ${isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-[#fff] border-slate-200 text-slate-500'}`}>
        <div>Powered by <strong className={isDark ? 'text-slate-200' : 'text-slate-700'}>TrackOlap ®</strong> | 2.6.616</div>
        <div className="flex gap-4 font-medium">
          <a href="#privacy" className="hover:underline hover:text-blue-500">Privacy</a>
          <a href="#terms" className="hover:underline hover:text-blue-500">Terms &amp; Conditions</a>
        </div>
      </footer>
    </div>
  );
}
