import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import { useAuth } from '../../contexts/AuthContext';
import { useThemeMode } from '../../contexts/ThemeContext';
import { DashboardRoute } from '../../routes/dashboard/dashboard.route';
import { DateRangePicker } from 'react-date-range';
import { format } from 'date-fns';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file;
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDark } = useThemeMode();

  // Dashboard backend stats state
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  // Animation key for graph refresh
  const [chartKey, setChartKey] = useState(0);

  // Sidebar state
  const [activeSidebar, setActiveSidebar] = useState('Summary');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Filters
  const [customerFilter, setCustomerFilter] = useState('All');
  const [employeeFilter, setEmployeeFilter] = useState('All');

  // Global Date Range state for Stats & Attendance
  const [globalDateRange, setGlobalDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection'
    }
  ]);
  const [pendingDateRange, setPendingDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection'
    }
  ]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = useRef(null);

  // Attendance state with infinite scroll
  const [attendanceMeta, setAttendanceMeta] = useState(null);   // summary counts, isDateRange etc.
  const [attendanceRows, setAttendanceRows] = useState([]);      // accumulated rows
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendancePage, setAttendancePage] = useState(1);
  const [attendanceHasMore, setAttendanceHasMore] = useState(false);
  const [attendanceLoadingMore, setAttendanceLoadingMore] = useState(false);
  const attendanceDateRef = useRef({ startDate: '', endDate: '' });
  const scrollSentinelRef = useRef(null);
  const ATTENDANCE_LIMIT = 50;

  // Fetch stats from backend API
  const fetchDashboardStats = async (startDate, endDate) => {
    setLoading(true);
    const res = await DashboardRoute.getStats({ customer: customerFilter, employee: employeeFilter, startDate, endDate });
    if (res?.success && res?.data) {
      setStats(res.data);
    }
    setLoading(false);
  };

  // Fetch attendance data — page 1 resets list, subsequent pages append
  const fetchAttendance = async (startDate, endDate, page = 1) => {
    if (page === 1) {
      setAttendanceLoading(true);
      setAttendanceRows([]);
    } else {
      setAttendanceLoadingMore(true);
    }
    const res = await DashboardRoute.getAttendance({ startDate, endDate, page, limit: ATTENDANCE_LIMIT });
    if (res?.success && res?.data) {
      const data = res.data;
      setAttendanceMeta({
        isDateRange: data.isDateRange,
        totalEmployees: data.totalEmployees,
        totalRecords: data.totalRecords,
        presentCount: data.presentCount,
        absentCount: data.absentCount,
        halfDayCount: data.halfDayCount,
        currentPage: data.currentPage,
        totalPages: data.totalPages,
      });
      setAttendanceRows(prev => page === 1 ? (data.attendanceList || []) : [...prev, ...(data.attendanceList || [])]);
      setAttendanceHasMore(data.hasMore || false);
      setAttendancePage(data.currentPage || 1);
    }
    if (page === 1) setAttendanceLoading(false);
    else setAttendanceLoadingMore(false);
  };

  // Reset and fetch page 1 when date range / filters change
  useEffect(() => {
    const formattedStart = format(globalDateRange[0].startDate, 'yyyy-MM-dd');
    const formattedEnd = format(globalDateRange[0].endDate, 'yyyy-MM-dd');
    attendanceDateRef.current = { startDate: formattedStart, endDate: formattedEnd };
    fetchDashboardStats(formattedStart, formattedEnd);
    fetchAttendance(formattedStart, formattedEnd, 1);
  }, [customerFilter, employeeFilter, globalDateRange]);

  // IntersectionObserver: load next page when sentinel comes into view
  useEffect(() => {
    const sentinel = scrollSentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && attendanceHasMore && !attendanceLoadingMore) {
          const { startDate, endDate } = attendanceDateRef.current;
          fetchAttendance(startDate, endDate, attendancePage + 1);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [attendanceHasMore, attendanceLoadingMore, attendancePage]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setShowDatePicker(false);
        // Reset pending to global when closed without saving
        setPendingDateRange(globalDateRange);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [globalDateRange]);

  const handleApplyDateRange = () => {
    setGlobalDateRange(pendingDateRange);
    setShowDatePicker(false);
  };

  const handleCancelDateRange = () => {
    setPendingDateRange(globalDateRange);
    setShowDatePicker(false);
  };

  const activeChartData = useMemo(() => {
    return Array.isArray(stats?.chartData) ? stats.chartData : [];
  }, [stats]);

  // Hovered Chart Point for Tooltip (defaults to null)
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Chart SVG Calculations
  const chartWidth = 1000;
  const chartHeight = 180;
  // Dynamic Y-axis max: round up to nearest nice number above actual max
  const maxVal = useMemo(() => {
    if (!activeChartData.length) return 10;
    const rawMax = Math.max(...activeChartData.map((d) => d.val), 0);
    if (rawMax <= 0) return 10;
    const magnitude = rawMax > 1000 ? 1000 : rawMax > 100 ? 100 : rawMax > 10 ? 10 : 1;
    return Math.ceil((rawMax * 1.15) / magnitude) * magnitude;
  }, [activeChartData]);

  const points = useMemo(() => {
    if (!activeChartData.length) return [];
    return activeChartData.map((d, index) => {
      const x = activeChartData.length === 1 ? chartWidth / 2 : (index / (activeChartData.length - 1)) * chartWidth;
      const y = chartHeight - (d.val / maxVal) * chartHeight;
      return { x, y, date: d.date, val: d.val };
    });
  }, [activeChartData, chartWidth, chartHeight, maxVal]);

  const { smoothLinePath, smoothAreaPath } = useMemo(() => {
    if (!points || points.length === 0) return { smoothLinePath: '', smoothAreaPath: '' };

    let d = `M ${points[0].x},${points[0].y}`;
    const tension = 0.2; // Smooth curve radius

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(0, i - 1)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(points.length - 1, i + 2)];

      const cp1x = p1.x + (p2.x - p0.x) * tension;
      const cp1y = p1.y + (p2.y - p0.y) * tension;
      const cp2x = p2.x - (p3.x - p1.x) * tension;
      const cp2y = p2.y - (p3.y - p1.y) * tension;

      d += ` C ${cp1x.toFixed(2)},${cp1y.toFixed(2)} ${cp2x.toFixed(2)},${cp2y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`;
    }

    const areaD = `${d} L ${chartWidth},${chartHeight} L 0,${chartHeight} Z`;

    return { smoothLinePath: d, smoothAreaPath: areaD };
  }, [points, chartWidth, chartHeight]);

  // Status badge helper
  const getStatusBadge = (status) => {
    const statusConfig = {
      PRESENT: { label: 'Present', bg: isDark ? 'bg-emerald-950/60' : 'bg-emerald-50', text: isDark ? 'text-emerald-400' : 'text-emerald-700', border: isDark ? 'border-emerald-800' : 'border-emerald-200' },
      CLOCKED_IN: { label: 'Clocked In', bg: isDark ? 'bg-blue-950/60' : 'bg-blue-50', text: isDark ? 'text-blue-400' : 'text-blue-700', border: isDark ? 'border-blue-800' : 'border-blue-200' },
      CLOCKED_OUT: { label: 'Clocked Out', bg: isDark ? 'bg-indigo-950/60' : 'bg-indigo-50', text: isDark ? 'text-indigo-400' : 'text-indigo-700', border: isDark ? 'border-indigo-800' : 'border-indigo-200' },
      ABSENT: { label: 'Absent', bg: isDark ? 'bg-red-950/60' : 'bg-red-50', text: isDark ? 'text-red-400' : 'text-red-700', border: isDark ? 'border-red-800' : 'border-red-200' },
      HALF_DAY: { label: 'Half Day', bg: isDark ? 'bg-amber-950/60' : 'bg-amber-50', text: isDark ? 'text-amber-400' : 'text-amber-700', border: isDark ? 'border-amber-800' : 'border-amber-200' },
    };
    const cfg = statusConfig[status] || statusConfig.ABSENT;
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
        {cfg.label}
      </span>
    );
  };

  // Format time helper
  const formatTime = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  // Format distance helper (meters if < 1km)
  const formatDistance = (distKm) => {
    if (distKm == null || isNaN(Number(distKm))) return '—';
    const val = Number(distKm);
    if (val < 1) {
      return `${(val * 1000).toFixed(0)} meters`;
    }
    return `${val.toFixed(2)} Km`;
  };

  return (
    <div className={`h-screen flex flex-col font-sans overflow-hidden transition-colors duration-200 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'}`}>
      {/* Top Main Navbar */}
      <Navbar user={user} logout={logout} />

      {/* Sub-header Bar with Title & Filters */}
      <div className={`flex-shrink-0 px-4 py-2.5 border-b flex flex-wrap items-center justify-between gap-3 transition-colors ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300 shadow-2xs'}`}>
        <div>
          <h1 className={`text-sm font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-950'}`}>Dashboards</h1>
          
        </div>

        {/* Filter Controls Right */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          {/* Global Date Range Picker */}
          <div className="flex flex-col relative" ref={datePickerRef}>
            <span className={`text-[10px] font-extrabold ${isDark ? 'text-slate-200' : 'text-slate-950'}`}>Date Range</span>
            <div 
              onClick={() => {
                setPendingDateRange(globalDateRange);
                setShowDatePicker(!showDatePicker);
              }}
              className={`flex items-center gap-2 px-2.5 py-1 rounded-md border text-xs font-bold cursor-pointer transition-colors ${isDark ? 'bg-slate-800 border-slate-700 text-slate-100 hover:border-slate-500' : 'bg-white border-slate-300 text-slate-950 hover:border-slate-400 shadow-2xs'}`}
            >
              <CalendarTodayIcon sx={{ fontSize: 14 }} className={isDark ? 'text-slate-400' : 'text-slate-600'} />
              <span>
                {format(globalDateRange[0].startDate, 'MMM d, yyyy')} - {format(globalDateRange[0].endDate, 'MMM d, yyyy')}
              </span>
            </div>
            
            {showDatePicker && (
              <div className="absolute right-0 top-full mt-2 z-[100] shadow-2xl border border-slate-200 rounded-lg bg-white overflow-hidden text-slate-900 text-base" style={{ width: 'max-content' }}>
                <DateRangePicker
                  onChange={item => setPendingDateRange([item.selection])}
                  showSelectionPreview={true}
                  moveRangeOnFirstSelection={false}
                  months={2}
                  ranges={pendingDateRange}
                  direction="horizontal"
                  maxDate={new Date()}
                />
                <div className="p-3 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
                  <button 
                    onClick={handleCancelDateRange}
                    className="px-4 py-1.5 rounded-md text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleApplyDateRange}
                    className="px-4 py-1.5 rounded-md text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Body Area: Sidebar + Dashboard Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Clean Refined Sidebar for Light & Dark Mode */}
      

        {/* Dashboard Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          
          {/* KPI Metrics Cards (6 Cards) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'Distance',         key: 'distance',         color: isDark ? 'text-amber-400' : 'text-amber-700', bg: isDark ? 'bg-amber-500/10' : 'bg-amber-50' },
              { label: 'Working Hours',    key: 'workingHours',     color: isDark ? 'text-emerald-400' : 'text-emerald-700', bg: isDark ? 'bg-emerald-500/10' : 'bg-emerald-50' },
              { label: 'Task',             key: 'task',             color: isDark ? 'text-pink-400' : 'text-pink-700', bg: isDark ? 'bg-pink-500/10' : 'bg-pink-50' },
              { label: 'Employee Present', key: 'employeePresent',  color: isDark ? 'text-blue-400' : 'text-blue-700', bg: isDark ? 'bg-blue-500/10' : 'bg-blue-50' },
              { label: 'Travel Time',      key: 'travelTime',       color: isDark ? 'text-indigo-400' : 'text-indigo-700', bg: isDark ? 'bg-indigo-500/10' : 'bg-indigo-50' },
              { label: 'Payment Received', key: 'paymentReceived',  color: isDark ? 'text-teal-400' : 'text-teal-700', bg: isDark ? 'bg-teal-500/10' : 'bg-teal-50' },
            ].map(({ label, key, color, bg }) => {
              const kpi = stats?.kpi?.[key];
              return (
                <div 
                  key={key} 
                  className={`p-3.5 rounded-xl border flex flex-col justify-between min-h-[76px] transition-all ${
                    isDark ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 shadow-xs hover:shadow-sm'
                  }`}
                >
                  <span className={`text-[11px] font-bold tracking-tight truncate ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {label}
                  </span>
                  {loading ? (
                    <div className={`h-6 w-20 rounded animate-pulse mt-1.5 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
                  ) : (
                    <p className={`text-base sm:text-lg font-extrabold tracking-tight mt-1 flex items-baseline gap-1 ${color}`}>
                      <span>{kpi?.value ?? '—'}</span>
                      {kpi?.unit && (
                        <span className={`text-[10px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {kpi.unit}
                        </span>
                      )}
                    </p>
                  )}
                </div>
              );
            })}
          </div>


          {/* Area Chart Section - Distance ( Km ) */}
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300 shadow-xs'}`}>
            <h3 className={`text-xs font-extrabold text-center mb-3 tracking-wide ${isDark ? 'text-white' : 'text-slate-950'}`}>
              Distance Statistics
            </h3>

            {/* SVG Interactive Area Chart Container */}
            <div className="relative w-full overflow-x-auto">
              <div className="min-w-[750px] h-[210px] relative">
                {/* Y-Axis Grid Lines & Numbers (dynamic) */}
                <div className={`absolute inset-y-0 left-8 right-0 flex flex-col justify-between text-[10px] font-extrabold pointer-events-none ${isDark ? 'text-slate-200' : 'text-slate-950'}`}>
                  <div className={`border-b w-full flex items-center ${isDark ? 'border-slate-800/80' : 'border-slate-300'}`}>{maxVal.toLocaleString()}</div>
                  <div className={`border-b w-full flex items-center ${isDark ? 'border-slate-800/80' : 'border-slate-300'}`}>{Math.round(maxVal * 0.75).toLocaleString()}</div>
                  <div className={`border-b w-full flex items-center ${isDark ? 'border-slate-800/80' : 'border-slate-300'}`}>{Math.round(maxVal * 0.5).toLocaleString()}</div>
                  <div className={`border-b w-full flex items-center ${isDark ? 'border-slate-800/80' : 'border-slate-300'}`}>{Math.round(maxVal * 0.25).toLocaleString()}</div>
                  <div className="w-full flex items-center">0</div>
                </div>

                {/* Keyframe Animation for Graph Left-to-Right Draw */}
                <style>{`
                  @keyframes drawLeftToRight {
                    0% {
                      clip-path: inset(0 100% 0 0);
                    }
                    100% {
                      clip-path: inset(0 0 0 0);
                    }
                  }
                  .animate-graph-left-right {
                    animation: drawLeftToRight 1.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                  }
                `}</style>

                {/* SVG Area & Line Graph */}
                <svg className="absolute left-8 top-0 right-0 bottom-6 w-[calc(100%-32px)] h-[180px]" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="orangeAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f97316" stopOpacity="0.75" />
                      <stop offset="100%" stopColor="#f97316" stopOpacity="0.15" />
                    </linearGradient>
                  </defs>

                  {/* Animated Left-to-Right Group */}
                  <g key={chartKey} className="animate-graph-left-right">
                    {/* Filled Gradient Area (Smooth Bezier Curve) */}
                    <path d={smoothAreaPath} fill="url(#orangeAreaGrad)" />

                    {/* Smooth Curved Line (No sharp corners) */}
                    <path d={smoothLinePath} fill="none" stroke="#ea580c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                    {/* Interactive Points */}
                    {activeChartData.map((d, index) => {
                      const cx = activeChartData.length === 1 ? chartWidth / 2 : (index / (activeChartData.length - 1)) * chartWidth;
                      const cy = chartHeight - (d.val / maxVal) * chartHeight;
                      return (
                        <circle
                          key={d.date}
                          cx={cx}
                          cy={cy}
                          r={hoveredPoint?.date === d.date ? "5" : "3"}
                          fill="#ea580c"
                          stroke="#ffffff"
                          strokeWidth="1.5"
                          className="cursor-pointer transition-all hover:r-6"
                          onMouseEnter={() => setHoveredPoint({ date: d.date, val: d.val, x: cx, y: cy })}
                          onMouseLeave={() => setHoveredPoint(null)}
                        />
                      );
                    })}
                  </g>
                </svg>

                {/* Hover Tooltip Box */}
                {hoveredPoint && (
                  <div
                    className="absolute bg-slate-900 text-white border border-slate-700 shadow-xl text-[10px] px-2.5 py-1 rounded-md pointer-events-none z-10 font-sans"
                    style={{
                      left: `calc(32px + ${(hoveredPoint.x / chartWidth) * 92}%)`,
                      top: `${Math.max(10, (hoveredPoint.y / chartHeight) * 140)}px`,
                      transform: 'translate(-50%, -100%)',
                    }}
                  >
                    <div className="font-semibold text-slate-300">{hoveredPoint.date}</div>
                    <div className="text-amber-400 font-bold">Distance: {hoveredPoint.val.toLocaleString()} Km</div>
                  </div>
                )}

                {/* X-Axis Dates */}
                <div className={`absolute bottom-0 left-8 right-0 flex justify-between text-[10px] font-semibold pt-1 px-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  {(() => {
                    const total = activeChartData.length;
                    if (total === 0) return null;

                    // Choose step interval so we display at most ~6-8 evenly spaced labels
                    const maxTicks = 7;
                    const step = Math.max(1, Math.ceil(total / maxTicks));
                    
                    const formatChartDate = (dateStr) => {
                      if (!dateStr) return '';
                      try {
                        const parts = dateStr.split('-');
                        if (parts.length === 3) {
                          const dateObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
                          return dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
                        }
                        return dateStr;
                      } catch {
                        return dateStr;
                      }
                    };

                    return activeChartData.map((d, idx) => {
                      const isFirst = idx === 0;
                      const isLast = idx === total - 1;
                      const isStep = idx % step === 0;
                      
                      // Always show first, last, and interval points
                      const shouldShow = isFirst || isLast || (isStep && idx < total - (step / 2));

                      if (!shouldShow) return null;

                      // Position matching SVG cx calculation
                      const leftPercent = total === 1 ? 50 : (idx / (total - 1)) * 100;

                      return (
                        <span
                          key={d.date}
                          className="absolute transform -translate-x-1/2 whitespace-nowrap text-[10px]"
                          style={{ left: `${leftPercent}%` }}
                        >
                          {formatChartDate(d.date)}
                        </span>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>
          </div>

          {/* Attendance Table with Date Picker */}
          <div className={`rounded-xl border overflow-visible transition-colors ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300 shadow-xs'}`}>
            <div className={`p-3 sm:p-4 border-b ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-[#f8fafc] border-slate-200'} flex flex-wrap items-center justify-between gap-3`}>
              <div>
                <h3 className={`text-sm font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>Employee Attendance</h3>
                <p className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {attendanceMeta ? (
                    <span className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-emerald-500 font-bold">{attendanceMeta.presentCount} Present</span>
                      <span className="text-slate-400">·</span>
                      <span className="text-rose-500 font-bold">{attendanceMeta.absentCount} Absent</span>
                      <span className="text-slate-400">·</span>
                      <span className="text-amber-500 font-bold">{attendanceMeta.halfDayCount} Half Day</span>
                      <span className="text-slate-400">—</span>
                      <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Total: {attendanceMeta.totalEmployees}</span>
                      {attendanceMeta.isDateRange && (
                        <span className={`ml-1 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          ({attendanceRows.length} of {attendanceMeta.totalRecords} records)
                        </span>
                      )}
                    </span>
                  ) : (
                    'Loading...'
                  )}
                </p>
              </div>
            </div>

            {/* Attendance Table */}
            <div className="overflow-x-auto" style={{ maxHeight: '420px', overflowY: 'auto' }}>
              <table className="w-full text-xs">
                <thead className={`sticky top-0 z-10 ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                  <tr>
                    {attendanceMeta?.isDateRange && (
                      <th className={`px-4 py-2.5 text-left font-extrabold border-b ${isDark ? 'text-slate-200 border-slate-700' : 'text-slate-900 border-slate-200'}`}>Date</th>
                    )}
                    <th className={`px-4 py-2.5 text-left font-extrabold border-b ${isDark ? 'text-slate-200 border-slate-700' : 'text-slate-900 border-slate-200'}`}>Emp ID</th>
                    <th className={`px-4 py-2.5 text-left font-extrabold border-b ${isDark ? 'text-slate-200 border-slate-700' : 'text-slate-900 border-slate-200'}`}>Name</th>
                    <th className={`px-4 py-2.5 text-left font-extrabold border-b ${isDark ? 'text-slate-200 border-slate-700' : 'text-slate-900 border-slate-200'}`}>Status</th>
                    <th className={`px-4 py-2.5 text-left font-extrabold border-b ${isDark ? 'text-slate-200 border-slate-700' : 'text-slate-900 border-slate-200'}`}>Clock In</th>
                    <th className={`px-4 py-2.5 text-left font-extrabold border-b ${isDark ? 'text-slate-200 border-slate-700' : 'text-slate-900 border-slate-200'}`}>Clock Out</th>
                    <th className={`px-4 py-2.5 text-left font-extrabold border-b ${isDark ? 'text-slate-200 border-slate-700' : 'text-slate-900 border-slate-200'}`}>Total Hours</th>
                    <th className={`px-4 py-2.5 text-left font-extrabold border-b ${isDark ? 'text-slate-200 border-slate-700' : 'text-slate-900 border-slate-200'}`}>Distance (Km)</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceLoading ? (
                    <tr>
                      <td colSpan={attendanceMeta?.isDateRange ? 8 : 7} className={`px-4 py-8 text-center font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Loading attendance...
                      </td>
                    </tr>
                  ) : attendanceRows.length > 0 ? (
                    <>
                      {attendanceRows.map((att, idx) => (
                        <tr
                          key={`${att.employeeId}_${att.date}_${idx}`}
                          className={`transition-colors ${isDark ? 'hover:bg-slate-800/60 border-slate-800' : 'hover:bg-slate-50 border-slate-100'} border-b`}
                        >
                          {attendanceMeta?.isDateRange && (
                            <td className={`px-4 py-2.5 font-semibold whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{att.date}</td>
                          )}
                          <td className={`px-4 py-2.5 font-bold ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>{att.empId}</td>
                          <td className={`px-4 py-2.5 font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{att.name}</td>
                          <td className="px-4 py-2.5">{getStatusBadge(att.status)}</td>
                          <td className={`px-4 py-2.5 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{formatTime(att.clockIn)}</td>
                          <td className={`px-4 py-2.5 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{formatTime(att.clockOut)}</td>
                          <td className={`px-4 py-2.5 font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{att.totalHours != null ? `${Number(att.totalHours).toFixed(1)} hrs` : '—'}</td>
                          <td className={`px-4 py-2.5 font-bold ${isDark ? 'text-sky-400' : 'text-sky-600'}`}>{formatDistance(att.totalDistanceKm)}</td>
                        </tr>
                      ))}
                      {/* Scroll sentinel — triggers next page load */}
                      <tr ref={scrollSentinelRef}>
                        <td colSpan={attendanceMeta?.isDateRange ? 8 : 7} className="py-1" />
                      </tr>
                      {attendanceLoadingMore && (
                        <tr>
                          <td colSpan={attendanceMeta?.isDateRange ? 8 : 7} className={`px-4 py-3 text-center text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            <span className="inline-flex items-center gap-2">
                              <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                              </svg>
                              Loading more...
                            </span>
                          </td>
                        </tr>
                      )}
                      {!attendanceHasMore && attendanceRows.length > 0 && (
                        <tr>
                          <td colSpan={attendanceMeta?.isDateRange ? 8 : 7} className={`px-4 py-2 text-center text-xs ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                            — All {attendanceRows.length} records loaded —
                          </td>
                        </tr>
                      )}
                    </>
                  ) : (
                    <tr>
                      <td colSpan={attendanceMeta?.isDateRange ? 8 : 7} className={`px-4 py-8 text-center font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        No attendance data for this date
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>



        </main>
      </div>

      {/* Footer */}
      <footer className={`flex-shrink-0 px-4 py-2.5 border-t text-[11px] flex items-center justify-between text-slate-700 dark:text-slate-300 font-medium transition-colors ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300'}`}>
        <div>Powered by <strong className="text-slate-950 dark:text-slate-100 font-bold">TrackOlap ®</strong> | 2.6.016</div>
        <div className="flex gap-4 font-bold text-slate-800 dark:text-slate-300">
          <a href="#privacy" className="hover:underline hover:text-blue-600">Privacy</a>
          <a href="#terms" className="hover:underline hover:text-blue-600">Terms &amp; Conditions</a>
        </div>
      </footer>
    </div>
  );
}
