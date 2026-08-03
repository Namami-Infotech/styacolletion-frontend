import React, { useState } from 'react';
import Navbar from '../components/common/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { useThemeMode } from '../contexts/ThemeContext';

// MUI Icons
import HomeIcon from '@mui/icons-material/Home';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import RefreshIcon from '@mui/icons-material/Refresh';

// 30 Days Dates for Jun (1 Jun to 30 Jun)
const JUN_DATES = Array.from({ length: 30 }, (_, i) => `${i + 1} Jun`);

// Task-Form Field Metrics Sample Line Points (0 to 4 scale)
const METRIC_POINTS = [
  0.5, 1.2, 0.8, 2.1, 1.5, 3.0, 2.4, 1.8, 2.9, 3.5,
  1.1, 2.0, 3.8, 2.5, 1.9, 0.7, 2.2, 3.1, 1.4, 2.8,
  3.6, 2.1, 1.7, 3.2, 2.6, 1.3, 0.9, 2.4, 3.7, 1.6
];

export default function HomePage() {
  const { user, logout } = useAuth();
  const { isDark } = useThemeMode();

  const [selectedDashboard, setSelectedDashboard] = useState('Default');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    }
  };

  // SVG Chart Geometry
  const chartWidth = 900;
  const chartHeight = 160;
  const maxVal = 4;

  const pointsString = METRIC_POINTS.map((val, index) => {
    const x = 40 + (index / (METRIC_POINTS.length - 1)) * (chartWidth - 60);
    const y = chartHeight - (val / maxVal) * (chartHeight - 20) - 10;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  const areaString = `40,${chartHeight - 10} ${pointsString} ${chartWidth - 20},${chartHeight - 10}`;

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-[#f4f6f9] text-slate-900'}`}>
      {/* Top Navigation Bar */}
      <Navbar user={user} logout={logout} />

      {/* Sub-header Bar (Matching Exact TrackOlap Screenshot Layout) */}
      <div className={`px-4 py-2.5 border-b flex flex-wrap items-center justify-between gap-3 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'}`}>
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
                <option value="Default" className={isDark ? 'bg-slate-800 text-slate-100' : 'bg-white text-slate-900'}>Default</option>
                <option value="Custom 1" className={isDark ? 'bg-slate-800 text-slate-100' : 'bg-white text-slate-900'}>Custom Dashboard 1</option>
                <option value="Custom 2" className={isDark ? 'bg-slate-800 text-slate-100' : 'bg-white text-slate-900'}>Custom Dashboard 2</option>
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
        
        {/* Top Card: Task-Form Field Metrics Graph Container */}
        <div className={`rounded-md border overflow-hidden transition-all ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90 shadow-2xs'}`}>
          <div className={`px-4 py-2.5 border-b text-xs font-bold ${isDark ? 'bg-slate-800/80 text-slate-100 border-slate-800' : 'bg-slate-50/80 text-slate-800 border-slate-200'}`}>
            Task-Form Field Metrics
          </div>

          <div className="p-4 overflow-x-auto">
            <div className="min-w-[900px] h-[240px] relative">
              {/* Y-Axis Grid Lines & Labels (0, 1, 2, 3, 4) */}
              <div className={`absolute inset-y-0 left-6 right-2 flex flex-col justify-between text-[11px] font-bold pointer-events-none pb-8 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                <div className={`border-b w-full flex items-center ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>4</div>
                <div className={`border-b w-full flex items-center ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>3</div>
                <div className={`border-b w-full flex items-center ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>2</div>
                <div className={`border-b w-full flex items-center ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>1</div>
                <div className="w-full flex items-center">0</div>
              </div>

              {/* High-Contrast SVG Line Graph */}
              <svg key={refreshKey} className="absolute left-6 top-0 right-2 w-[calc(100%-32px)] h-[170px]" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
                <defs>
                  <linearGradient id="blueMetricGradHome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity={isDark ? "0.4" : "0.25"} />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <polygon points={areaString} fill="url(#blueMetricGradHome)" />
                <polyline points={pointsString} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>

              {/* X-Axis Rotated Date Labels (1 Jun to 30 Jun) */}
              <div className={`absolute bottom-0 left-6 right-2 flex justify-between items-end text-[10px] font-bold pt-2 pointer-events-none ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {JUN_DATES.map((dateStr) => (
                  <div key={dateStr} className="w-0 flex justify-center">
                    <span className="transform -rotate-45 origin-top-left whitespace-nowrap block text-[9.5px]">
                      {dateStr}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Card: Task Metrics Summary */}
        <div className={`rounded-md border overflow-hidden max-w-xl transition-all ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90 shadow-2xs'}`}>
          <div className={`px-4 py-2.5 border-b text-xs font-bold ${isDark ? 'bg-slate-800/80 text-slate-100 border-slate-800' : 'bg-slate-50/80 text-slate-800 border-slate-200'}`}>
            Task
          </div>

          <div className="p-4 flex flex-wrap sm:flex-nowrap items-center gap-4">
            {/* Metric 1: Completed (55%) */}
            <div className={`flex-1 p-3 rounded-md border flex items-center justify-between gap-3 ${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-slate-200'}`}>
              <div>
                <h4 className={`text-xs font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>Completed</h4>
                <p className={`text-xs font-extrabold mt-1 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                  44861 <span className={`text-[11px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>out of 81553</span>
                </p>
              </div>

              {/* Circular Progress Ring (55% Orange/Red) */}
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
                    strokeDasharray="55, 100"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className={`absolute text-[11px] font-extrabold ${isDark ? 'text-red-400' : 'text-red-600'}`}>55%</span>
              </div>
            </div>

            {/* Metric 2: In Progress (7%) */}
            <div className={`flex-1 p-3 rounded-md border flex items-center justify-between gap-3 ${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-slate-200'}`}>
              <div>
                <h4 className={`text-xs font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>In Progress</h4>
                <p className={`text-xs font-extrabold mt-1 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                  5947 <span className={`text-[11px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>out of 81553</span>
                </p>
              </div>

              {/* Circular Progress Ring (7% Blue) */}
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
                    strokeDasharray="7, 100"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className={`absolute text-[11px] font-extrabold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>7%</span>
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* TrackOlap Footer */}
      <footer className={`px-4 py-2 border-t text-[11px] flex items-center justify-between transition-colors ${isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500'}`}>
        <div>Powered by <strong className={isDark ? 'text-slate-200' : 'text-slate-700'}>TrackOlap ®</strong> | 2.6.616</div>
        <div className="flex gap-4 font-medium">
          <a href="#privacy" className="hover:underline hover:text-blue-500">Privacy</a>
          <a href="#terms" className="hover:underline hover:text-blue-500">Terms &amp; Conditions</a>
        </div>
      </footer>
    </div>
  );
}
