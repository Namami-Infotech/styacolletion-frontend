import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import EmployeeTable from '../../views/employee/EmployeeTable';
import DeleteConfirmationModal from '../../components/common/DeleteConfirmationModal';
import { useAuth } from '../../contexts/AuthContext';
import { useThemeMode } from '../../contexts/ThemeContext';
import { DashboardRoute } from '../../routes/dashboard/dashboard.route';
import { EmployeeRoute } from '../../routes/employee/employee.route';

// MUI Icons
import AssessmentIcon from '@mui/icons-material/Assessment';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PaymentsIcon from '@mui/icons-material/Payments';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

// Area Chart Daily Data Points Default (2026-07-01 to 2026-07-20)
const DEFAULT_CHART_DATA = [
  { date: '2026-07-01', val: 900 },
  { date: '2026-07-02', val: 1200 },
  { date: '2026-07-03', val: 1100 },
  { date: '2026-07-04', val: 1501.71 },
  { date: '2026-07-05', val: 1200 },
  { date: '2026-07-06', val: 1800 },
  { date: '2026-07-07', val: 980 },
  { date: '2026-07-08', val: 10500 },
  { date: '2026-07-09', val: 9000 },
  { date: '2026-07-10', val: 1160 },
  { date: '2026-07-11', val: 1190 },
  { date: '2026-07-12', val: 1500 },
  { date: '2026-07-13', val: 12100 },
  { date: '2026-07-14', val: 11400 },
  { date: '2026-07-15', val: 11800 },
  { date: '2026-07-16', val: 1250 },
  { date: '2026-07-17', val: 12200 },
  { date: '2026-07-18', val: 1300 },
  { date: '2026-07-19', val: 1800 },
  { date: '2026-07-20', val: 1100 },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDark } = useThemeMode();

  // Dashboard backend stats state
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  // Animation key for graph refresh
  const [chartKey, setChartKey] = useState(0);

  // Employee list state
  const [employees, setEmployees] = useState([]);

  // Sidebar state
  const [activeSidebar, setActiveSidebar] = useState('Summary');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Filters
  const [customerFilter, setCustomerFilter] = useState('All');
  const [employeeFilter, setEmployeeFilter] = useState('All');
  const [dateRange, setDateRange] = useState('Month to Date');

  // Fetch stats from backend API
  const fetchDashboardStats = async () => {
    setLoading(true);
    const res = await DashboardRoute.getStats({ customer: customerFilter, employee: employeeFilter, dateRange });
    if (res?.success && res?.data) {
      setStats(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboardStats();
  }, [customerFilter, employeeFilter, dateRange]);

  const activeChartData = useMemo(() => {
    return Array.isArray(stats?.chartData) ? stats.chartData : [];
  }, [stats]);

  // Hovered Chart Point for Tooltip
  const [hoveredPoint, setHoveredPoint] = useState({ date: '2026-07-04', val: 11501.71, x: 210, y: 55 });

  // Employee Table Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Modals state
  const [activeEmployee, setActiveEmployee] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Chart SVG Calculations
  const chartWidth = 1000;
  const chartHeight = 180;
  // Dynamic Y-axis max: round up to nearest nice number above actual max
  const maxVal = useMemo(() => {
    if (!activeChartData.length) return 1;
    const rawMax = Math.max(...activeChartData.map((d) => d.val), 1);
    // Round up to nearest 1000 (or 10 for small datasets)
    const magnitude = rawMax > 100 ? 1000 : rawMax > 10 ? 100 : 10;
    return Math.ceil(rawMax / magnitude) * magnitude;
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

  const handleUpdateEmployee = (updatedEmp) => {
    setEmployees((prev) => prev.map((e) => (e.id === updatedEmp.id ? updatedEmp : e)));
    setEditModalOpen(false);
  };

  const handleDeleteEmployee = async (employeeOrId) => {
    const slug = typeof employeeOrId === 'object' ? (employeeOrId?.slug || employeeOrId?.id) : employeeOrId;
    if (!slug) return;
    try {
      const res = await EmployeeRoute.deleteEmployee(slug);
      if (res?.success) {
        setEmployees((prev) => prev.filter((e) => (e.slug || e.id) !== slug));
      }
    } catch (error) {
      console.error("Failed to delete employee", error);
    } finally {
      setDeleteModalOpen(false);
    }
  };

  return (
    <div className={`h-screen flex flex-col font-sans overflow-hidden transition-colors duration-200 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'}`}>
      {/* Top Main Navbar */}
      <Navbar user={user} logout={logout} />

      {/* Sub-header Bar with Title & Filters */}
      <div className={`flex-shrink-0 px-4 py-2.5 border-b flex flex-wrap items-center justify-between gap-3 transition-colors ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300 shadow-2xs'}`}>
        <div>
          <h1 className={`text-sm font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-950'}`}>Dashboards</h1>
          <p className="text-xs font-bold text-blue-600">Summary</p>
        </div>

        {/* Filter Controls Right */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          {/* Customers Filter */}
          <div className="flex flex-col">
            <span className={`text-[10px] font-extrabold ${isDark ? 'text-slate-200' : 'text-slate-950'}`}>Customers (All)</span>
            <select
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value)}
              className={`px-2.5 py-1 rounded-md border text-xs outline-none cursor-pointer font-bold transition-colors ${isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-950 hover:border-slate-400 shadow-2xs'}`}
            >
              <option value="All" className={isDark ? 'bg-slate-800 text-slate-100' : 'bg-white text-slate-950'}>Please select</option>
              <option value="CustA" className={isDark ? 'bg-slate-800 text-slate-100' : 'bg-white text-slate-950'}>Customer A</option>
              <option value="CustB" className={isDark ? 'bg-slate-800 text-slate-100' : 'bg-white text-slate-950'}>Customer B</option>
            </select>
          </div>

          {/* Employee Filter */}
          <div className="flex flex-col">
            <span className={`text-[10px] font-extrabold ${isDark ? 'text-slate-200' : 'text-slate-950'}`}>Employee (Equal)</span>
            <select
              value={employeeFilter}
              onChange={(e) => setEmployeeFilter(e.target.value)}
              className={`px-2.5 py-1 rounded-md border text-xs outline-none cursor-pointer font-bold transition-colors ${isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-950 hover:border-slate-400 shadow-2xs'}`}
            >
              <option value="All" className={isDark ? 'bg-slate-800 text-slate-100' : 'bg-white text-slate-950'}>Please select</option>
              <option value="Emp1" className={isDark ? 'bg-slate-800 text-slate-100' : 'bg-white text-slate-950'}>Alex Morgan</option>
              <option value="Emp2" className={isDark ? 'bg-slate-800 text-slate-100' : 'bg-white text-slate-950'}>David Chen</option>
            </select>
          </div>

          {/* Date Range Preset */}
          <div className="flex flex-col">
            <span className={`text-[10px] font-extrabold ${isDark ? 'text-slate-200' : 'text-slate-950'}`}>&nbsp;</span>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className={`px-2.5 py-1 rounded-md border text-xs font-bold outline-none cursor-pointer transition-colors ${isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-300 text-slate-950 hover:border-slate-400 shadow-2xs'}`}
            >
              <option value="Month to Date" className={isDark ? 'bg-slate-800 text-slate-100' : 'bg-white text-slate-950'}>Month to Date</option>
              <option value="Last 7 Days" className={isDark ? 'bg-slate-800 text-slate-100' : 'bg-white text-slate-950'}>Last 7 Days</option>
              <option value="Today" className={isDark ? 'bg-slate-800 text-slate-100' : 'bg-white text-slate-950'}>Today</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 mt-3">
            <button className="p-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center cursor-pointer shadow-2xs transition-colors" title="Apply Filter">
              <FilterListIcon sx={{ fontSize: 16 }} />
            </button>
            <button
              onClick={() => setChartKey((prev) => prev + 1)}
              className={`p-1.5 rounded-md border flex items-center justify-center cursor-pointer transition-colors ${isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-300 text-slate-950 hover:bg-slate-100 shadow-2xs'}`}
              title="Refresh / Re-animate Graph"
            >
              <RefreshIcon sx={{ fontSize: 16 }} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Body Area: Sidebar + Dashboard Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Clean Refined Sidebar for Light & Dark Mode */}
        <aside className={`flex-shrink-0 transition-all duration-200 border-r flex flex-col justify-between ${sidebarCollapsed ? 'w-14' : 'w-48'} ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300 shadow-2xs'}`}>
          <div className="py-3 flex flex-col gap-1 px-1.5">
            {/* Summary Tab */}
            <button
              onClick={() => setActiveSidebar('Summary')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                activeSidebar === 'Summary'
                  ? isDark
                    ? 'bg-blue-950/60 text-blue-400 border-l-4 border-blue-500 shadow-2xs'
                    : 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 shadow-2xs'
                  : isDark
                  ? 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                  : 'text-slate-900 hover:bg-slate-100 hover:text-slate-950 font-bold'
              }`}
            >
              <AssessmentIcon sx={{ fontSize: 19 }} />
              {!sidebarCollapsed && <span>Summary</span>}
            </button>

            {/* Task Tab */}
            <button
              onClick={() => setActiveSidebar('Task')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                activeSidebar === 'Task'
                  ? isDark
                    ? 'bg-blue-950/60 text-blue-400 border-l-4 border-blue-500 shadow-2xs'
                    : 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 shadow-2xs'
                  : isDark
                  ? 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                  : 'text-slate-900 hover:bg-slate-100 hover:text-slate-950 font-bold'
              }`}
            >
              <AssignmentIcon sx={{ fontSize: 19 }} />
              {!sidebarCollapsed && <span>Task</span>}
            </button>

            {/* Payment Analysis Tab */}
            <button
              onClick={() => setActiveSidebar('Payment')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                activeSidebar === 'Payment'
                  ? isDark
                    ? 'bg-blue-950/60 text-blue-400 border-l-4 border-blue-500 shadow-2xs'
                    : 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 shadow-2xs'
                  : isDark
                  ? 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                  : 'text-slate-900 hover:bg-slate-100 hover:text-slate-950 font-bold'
              }`}
            >
              <PaymentsIcon sx={{ fontSize: 19 }} />
              {!sidebarCollapsed && <span>Payment Analysis</span>}
            </button>
          </div>

          {/* Sidebar Collapse Button */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={`p-2.5 border-t flex items-center justify-center transition-colors cursor-pointer ${isDark ? 'border-slate-800 text-slate-400 hover:text-slate-200' : 'border-slate-300 text-slate-900 hover:text-slate-950'}`}
          >
            {sidebarCollapsed ? <ChevronRightIcon sx={{ fontSize: 18 }} /> : <ChevronLeftIcon sx={{ fontSize: 18 }} />}
          </button>
        </aside>

        {/* Dashboard Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          
          {/* KPI Metrics Cards (7 Cards) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {/* 1. Distance */}
            <div className={`p-3 rounded-xl border transition-all ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300 shadow-xs hover:shadow-sm'}`}>
              <div className="flex justify-between items-start">
                <span className={`text-[11px] font-extrabold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>Distance</span>
                <span className={`text-[9px] font-extrabold px-1 py-0.5 rounded ${isDark ? 'text-emerald-400 bg-emerald-950/60' : 'text-emerald-800 bg-emerald-100 border border-emerald-300'}`}>{stats?.kpi?.distance?.change || "▲ 11.7%"}</span>
              </div>
              <p className={`text-sm sm:text-base font-extrabold mt-1 tracking-tight ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>{stats?.kpi?.distance?.value || "197,968.49"} <span className={`text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-800'}`}>{stats?.kpi?.distance?.unit || "Km"}</span></p>
            </div>

            {/* 2. Travel Time */}
            <div className={`p-3 rounded-xl border transition-all ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300 shadow-xs hover:shadow-sm'}`}>
              <div className="flex justify-between items-start">
                <span className={`text-[11px] font-extrabold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>Travel Time</span>
                <span className={`text-[9px] font-extrabold px-1 py-0.5 rounded ${isDark ? 'text-emerald-400 bg-emerald-950/60' : 'text-emerald-800 bg-emerald-100 border border-emerald-300'}`}>{stats?.kpi?.travelTime?.change || "▲ 18.98%"}</span>
              </div>
              <p className={`text-sm sm:text-base font-extrabold mt-1 tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-950'}`}>{stats?.kpi?.travelTime?.value || "13113:57"} <span className={`text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-800'}`}>{stats?.kpi?.travelTime?.unit || "hh:mm"}</span></p>
            </div>

            {/* 3. Task */}
            <div className={`p-3 rounded-xl border transition-all ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300 shadow-xs hover:shadow-sm'}`}>
              <div className="flex justify-between items-start">
                <span className={`text-[11px] font-extrabold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>Task</span>
                <span className={`text-[9px] font-extrabold px-1 py-0.5 rounded ${isDark ? 'text-emerald-400 bg-emerald-950/60' : 'text-emerald-800 bg-emerald-100 border border-emerald-300'}`}>{stats?.kpi?.task?.change || "▲ 8.47%"}</span>
              </div>
              <p className={`text-sm sm:text-base font-extrabold mt-1 tracking-tight ${isDark ? 'text-pink-400' : 'text-pink-700'}`}>{stats?.kpi?.task?.value || "42377"} <span className={`text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-800'}`}>{stats?.kpi?.task?.unit || "Count"}</span></p>
            </div>

            {/* 4. Employee Present */}
            <div className={`p-3 rounded-xl border transition-all ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300 shadow-xs hover:shadow-sm'}`}>
              <div className="flex justify-between items-start">
                <span className={`text-[11px] font-extrabold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>Employee Present</span>
                <span className={`text-[9px] font-extrabold px-1 py-0.5 rounded ${isDark ? 'text-emerald-400 bg-emerald-950/60' : 'text-emerald-800 bg-emerald-100 border border-emerald-300'}`}>{stats?.kpi?.employeePresent?.change || "▲ 18.66%"}</span>
              </div>
              <p className={`text-sm sm:text-base font-extrabold mt-1 tracking-tight ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>{stats?.kpi?.employeePresent?.value || "4117"} <span className={`text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-800'}`}>{stats?.kpi?.employeePresent?.unit || "Count"}</span></p>
            </div>

            {/* 5. Working Hours */}
            <div className={`p-3 rounded-xl border transition-all ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300 shadow-xs hover:shadow-sm'}`}>
              <div className="flex justify-between items-start">
                <span className={`text-[11px] font-extrabold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>Working Hours</span>
                <span className={`text-[9px] font-extrabold px-1 py-0.5 rounded ${isDark ? 'text-emerald-400 bg-emerald-950/60' : 'text-emerald-800 bg-emerald-100 border border-emerald-300'}`}>{stats?.kpi?.workingHours?.change || "▲ 5.11%"}</span>
              </div>
              <p className={`text-sm sm:text-base font-extrabold mt-1 tracking-tight ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>{stats?.kpi?.workingHours?.value || "45232:54"} <span className={`text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-800'}`}>{stats?.kpi?.workingHours?.unit || "hh:mm"}</span></p>
            </div>

            {/* 6. Payment Received */}
            <div className={`p-3 rounded-xl border transition-all ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300 shadow-xs hover:shadow-sm'}`}>
              <div className="flex justify-between items-start">
                <span className={`text-[11px] font-extrabold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>Payment Received</span>
                <span className={`text-[9px] font-extrabold px-1 py-0.5 rounded ${isDark ? 'text-emerald-400 bg-emerald-950/60' : 'text-emerald-800 bg-emerald-100 border border-emerald-300'}`}>{stats?.kpi?.paymentReceived?.change || "▲ 5.49%"}</span>
              </div>
              <p className={`text-sm sm:text-base font-extrabold mt-1 tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-950'}`}>{stats?.kpi?.paymentReceived?.value || "10,954,130"} <span className={`text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-800'}`}>{stats?.kpi?.paymentReceived?.unit || "₹"}</span></p>
            </div>

            {/* 7. Payment Submitted */}
            <div className={`p-3 rounded-xl border transition-all ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300 shadow-xs hover:shadow-sm'}`}>
              <div className="flex justify-between items-start">
                <span className={`text-[11px] font-extrabold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>Payment Submitted</span>
                <span className={`text-[9px] font-extrabold ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>{stats?.kpi?.paymentSubmitted?.change || "0%"}</span>
              </div>
              <p className={`text-sm sm:text-base font-extrabold mt-1 tracking-tight ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>{stats?.kpi?.paymentSubmitted?.value || "0"} <span className={`text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-800'}`}>{stats?.kpi?.paymentSubmitted?.unit || "₹"}</span></p>
            </div>
          </div>

          {/* Area Chart Section - Distance ( Km ) */}
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300 shadow-xs'}`}>
            <h3 className={`text-xs font-extrabold text-center mb-3 tracking-wide ${isDark ? 'text-white' : 'text-slate-950'}`}>
              Employee Attendance — {dateRange}
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
                      const cx = (index / (activeChartData.length - 1)) * chartWidth;
                      const cy = chartHeight - (d.val / maxVal) * chartHeight;
                      return (
                        <circle
                          key={d.date}
                          cx={cx}
                          cy={cy}
                          r={hoveredPoint.date === d.date ? "5" : "3"}
                          fill="#ea580c"
                          stroke="#ffffff"
                          strokeWidth="1.5"
                          className="cursor-pointer transition-all hover:r-6"
                          onMouseEnter={() => setHoveredPoint({ date: d.date, val: d.val, x: cx, y: cy })}
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
                    <div className="text-amber-400 font-bold">Value: {hoveredPoint.val}</div>
                  </div>
                )}

                {/* X-Axis Dates */}
                <div className={`absolute bottom-0 left-8 right-0 flex justify-between text-[9px] font-extrabold pt-1 ${isDark ? 'text-slate-200' : 'text-slate-950'}`}>
                  {activeChartData.map((d) => (
                    <span key={d.date}>{d.date}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Full Enterprise Employee Table Component (with dual-axis sticky scroll & pagination) */}
          <div className={`rounded-xl border overflow-hidden transition-colors ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300 shadow-xs'}`}>
            <div className={`p-3 sm:p-4 border-b ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-[#f8fafc] border-slate-200'} flex items-center justify-between`}>
              <div>
                <h3 className={`text-sm font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>Employee Directory</h3>
                <p className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Real-time HR employee list with dual-axis scrollable data grid</p>
              </div>
            </div>

            <EmployeeTable
              filteredEmployees={employees}
              page={page}
              rowsPerPage={rowsPerPage}
              maxHeight="360px"
              onPageChange={(e, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              onViewClick={(emp) => {
                setActiveEmployee(emp);
                setViewModalOpen(true);
              }}
              onEditClick={(emp) => {
                navigate('/create-employee', { state: { employee: emp, isEdit: true } });
              }}
              onDeleteClick={(emp) => {
                setActiveEmployee(emp);
                setDeleteModalOpen(true);
              }}
            />
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



      {/* Delete Employee Modal */}
      {deleteModalOpen && activeEmployee && (
        <DeleteConfirmationModal
          open={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          employee={activeEmployee}
          onConfirmDelete={() => handleDeleteEmployee(activeEmployee.id)}
        />
      )}
    </div>
  );
}
