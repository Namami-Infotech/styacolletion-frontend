import React, { useState } from 'react';
import {
  TextField,
  InputAdornment,
  MenuItem,
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';

import SearchIcon from '@mui/icons-material/Search';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import TableRowsIcon from '@mui/icons-material/TableRows';

import Navbar from '../../components/common/Navbar';
import AttendanceTable from '../../views/attendance/attendance.Table';
import MonthlyAttendanceTable from '../../views/attendance/monthly.Table';
import { useAuth } from '../../contexts/AuthContext';
import { useThemeMode } from '../../contexts/ThemeContext';

export default function AttendancePage() {
  const { user, logout } = useAuth();
  const { isDark } = useThemeMode();
  const location = useLocation();
  const navigate = useNavigate();

  const isMonthlyView = location.pathname.includes('monthly');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');

  return (
    <div
      className={`min-h-screen lg:h-screen lg:max-h-screen overflow-y-auto lg:overflow-hidden flex flex-col transition-colors duration-200 ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
      }`}
    >
      {/* Top Navbar */}
      <Navbar user={user} logout={logout} />

      {/* Main Content */}
      <main className="flex-1 min-h-0 w-full px-3 py-3 sm:px-4 flex flex-col space-y-3 overflow-y-auto lg:overflow-hidden">
        {/* Header Banner & Filter Toolbar */}
        <div
          className={`p-3.5 sm:p-4 rounded-2xl border flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 sm:gap-4 flex-shrink-0 transition-all duration-200 ${
            isDark
              ? 'bg-slate-900/70 border-slate-800/80 backdrop-blur-xl shadow-xl'
              : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          {/* Header Title Banner */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
              {isMonthlyView ? <CalendarMonthIcon fontSize="medium" /> : <FingerprintIcon fontSize="medium" />}
            </div>
            <div>
              <h1
                className={`text-lg sm:text-xl font-extrabold tracking-tight ${
                  isDark ? 'text-white' : 'text-slate-950'
                }`}
              >
                {isMonthlyView ? 'Monthly Attendance Matrix' : 'Attendance Records'}
              </h1>
              <p
                className={`text-xs ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                {isMonthlyView
                  ? 'Monthly day-by-day attendance grid and employee summary metrics.'
                  : 'View employee clock-in/clock-out logs, office geofence locations, and attendance history.'}
              </p>
            </div>
          </div>

          {/* Controls: Search, Status Filter & View Toggle */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 flex-1 min-w-0">
            {/* View Switcher Buttons */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 self-start sm:self-auto">
              <button
                onClick={() => navigate('/attendance/details')}
                className={`flex items-center gap-1.5 px-3 py-1.5 cursor-pointer rounded-lg text-xs font-bold transition-all ${
                  !isMonthlyView
                    ? 'bg-blue-600 text-white shadow-xs'
                    : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <TableRowsIcon sx={{ fontSize: 16 }} />
                <span>Details</span>
              </button>
              <button
                onClick={() => navigate('/attendance/monthly')}
                className={`flex items-center gap-1.5 px-3 py-1.5 cursor-pointer rounded-lg text-xs font-bold transition-all ${
                  isMonthlyView
                    ? 'bg-blue-600 text-white shadow-xs'
                    : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CalendarMonthIcon sx={{ fontSize: 16 }} />
                <span>Monthly</span>
              </button>
            </div>

            {/* Search Input */}
            <TextField
              size="small"
              placeholder="Search employee..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon
                      fontSize="small"
                      sx={{ color: isDark ? '#94a3b8' : '#64748b' }}
                    />
                  </InputAdornment>
                ),
              }}
              sx={{
                minWidth: { xs: '100%', sm: 220 },
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  backgroundColor: isDark ? 'rgba(15, 23, 42, 0.6)' : '#f8fafc',
                  color: isDark ? '#ffffff' : '#0f172a',
                  '& fieldset': {
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : '#cbd5e1',
                  },
                  '&:hover fieldset': {
                    borderColor: isDark ? '#60a5fa' : '#3b82f6',
                  },
                },
              }}
            />

            {/* Status Filter - Only shown in Details View */}
            {!isMonthlyView && (
              <TextField
                select
                size="small"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                sx={{
                  minWidth: { xs: '100%', sm: 150 },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    backgroundColor: isDark ? 'rgba(15, 23, 42, 0.6)' : '#f8fafc',
                    color: isDark ? '#ffffff' : '#0f172a',
                    '& fieldset': {
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : '#cbd5e1',
                    },
                    '&:hover fieldset': {
                      borderColor: isDark ? '#60a5fa' : '#3b82f6',
                    },
                  },
                }}
              >
                <MenuItem value="All">All Statuses</MenuItem>
                <MenuItem value="CLOCKED_IN">Clocked In</MenuItem>
                <MenuItem value="PRESENT">Present</MenuItem>
                <MenuItem value="HALF_DAY">Half Day</MenuItem>
                <MenuItem value="ABSENT">Absent</MenuItem>
                <MenuItem value="CLOCKED_OUT">Clocked Out</MenuItem>
              </TextField>
            )}
          </div>
        </div>

        {/* Dynamic Table Component */}
        <div className="flex-1 min-h-0 w-full flex flex-col">
          {isMonthlyView ? (
            <MonthlyAttendanceTable externalSearchTerm={searchTerm} />
          ) : (
            <AttendanceTable
              searchTerm={searchTerm}
              selectedStatus={selectedStatus}
            />
          )}
        </div>
      </main>
    </div>
  );
}
