import React, { useState, useEffect, useMemo } from 'react';
import {
  Paper,
  Avatar,
  TextField,
  MenuItem,
  CircularProgress,
  Tooltip,
  Autocomplete,
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { useThemeMode } from '../../contexts/ThemeContext';
import { attendanceRoute } from '../../routes/attendance/attendance.route';
import TableSkeleton from '../../components/common/TableSkeleton';
import LazyAvatar from '../../components/common/LazyAvatar';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const SUMMARY_COLS = [
  {
    key: 'p',
    label: 'P',
    colorClass: 'text-emerald-700 dark:text-emerald-400',
    headerColor: 'text-emerald-900 dark:text-emerald-200',
    lightHeaderBg: '#d1fae5',
    darkHeaderBg: '#064e3b',
    lightBodyBg: '#ecfdf5',
    darkBodyBg: '#022c22',
  },
  {
    key: 'a',
    label: 'A',
    colorClass: 'text-rose-700 dark:text-rose-400',
    headerColor: 'text-rose-900 dark:text-rose-200',
    lightHeaderBg: '#ffe4e6',
    darkHeaderBg: '#881337',
    lightBodyBg: '#fff1f2',
    darkBodyBg: '#4c0519',
  },
  {
    key: 'l',
    label: 'L',
    colorClass: 'text-purple-700 dark:text-purple-400',
    headerColor: 'text-purple-900 dark:text-purple-200',
    lightHeaderBg: '#f3e8ff',
    darkHeaderBg: '#581c87',
    lightBodyBg: '#faf5ff',
    darkBodyBg: '#3b0764',
  },
  {
    key: 'hl',
    label: 'HL',
    colorClass: 'text-amber-700 dark:text-amber-400',
    headerColor: 'text-amber-900 dark:text-amber-200',
    lightHeaderBg: '#fef3c7',
    darkHeaderBg: '#78350f',
    lightBodyBg: '#fffbeb',
    darkBodyBg: '#451a03',
  },
  {
    key: 'h',
    label: 'H',
    colorClass: 'text-teal-700 dark:text-teal-400',
    headerColor: 'text-teal-900 dark:text-teal-200',
    lightHeaderBg: '#ccfbf1',
    darkHeaderBg: '#134e4a',
    lightBodyBg: '#f0fdfa',
    darkBodyBg: '#042f2e',
  },
  {
    key: 'pa',
    label: 'PA',
    colorClass: 'text-indigo-700 dark:text-indigo-400',
    headerColor: 'text-indigo-900 dark:text-indigo-200',
    lightHeaderBg: '#e0e7ff',
    darkHeaderBg: '#312e81',
    lightBodyBg: '#eef2ff',
    darkBodyBg: '#1e1b4b',
  },
  {
    key: 'hp',
    label: 'HP',
    colorClass: 'text-blue-700 dark:text-blue-400',
    headerColor: 'text-blue-900 dark:text-blue-200',
    lightHeaderBg: '#dbeafe',
    darkHeaderBg: '#1e3a8a',
    lightBodyBg: '#eff6ff',
    darkBodyBg: '#172554',
  },
  {
    key: 'ah',
    label: 'AH',
    colorClass: 'text-pink-700 dark:text-pink-400',
    headerColor: 'text-pink-900 dark:text-pink-200',
    lightHeaderBg: '#fce7f3',
    darkHeaderBg: '#831843',
    lightBodyBg: '#fdf2f8',
    darkBodyBg: '#500724',
  },
  {
    key: 'ap',
    label: 'AP',
    colorClass: 'text-violet-700 dark:text-violet-400',
    headerColor: 'text-violet-900 dark:text-violet-200',
    lightHeaderBg: '#ede9fe',
    darkHeaderBg: '#4c1d95',
    lightBodyBg: '#f5f3ff',
    darkBodyBg: '#2e1065',
  },
  {
    key: 'd',
    label: 'D',
    colorClass: 'text-cyan-700 dark:text-cyan-400',
    headerColor: 'text-cyan-900 dark:text-cyan-200',
    lightHeaderBg: '#cffafe',
    darkHeaderBg: '#164e63',
    lightBodyBg: '#ecfeff',
    darkBodyBg: '#083344',
  },
  {
    key: 'nw',
    label: 'NW',
    colorClass: 'text-slate-700 dark:text-slate-400',
    headerColor: 'text-slate-900 dark:text-slate-200',
    lightHeaderBg: '#e2e8f0',
    darkHeaderBg: '#334155',
    lightBodyBg: '#f1f5f9',
    darkBodyBg: '#1e293b',
  },
];

export default function MonthlyAttendanceTable({ externalSearchTerm = '' }) {
  const { isDark } = useThemeMode();
  const today = new Date();

  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth()); // 0-indexed
  const [searchTerm, setSearchTerm] = useState(externalSearchTerm);
  const [loading, setLoading] = useState(false);
  const [rawAttendance, setRawAttendance] = useState([]);

  useEffect(() => {
    setSearchTerm(externalSearchTerm);
  }, [externalSearchTerm]);

  // Fetch all attendance records
  const fetchMonthlyData = async () => {
    setLoading(true);
    try {
      const res = await attendanceRoute.getAllEmployeeAttendance({ limit: 2000, page: 1 });
      if (res?.success && res?.data) {
        const records = res.data.attendances || (Array.isArray(res.data) ? res.data : []);
        setRawAttendance(records);
      } else {
        setRawAttendance([]);
      }
    } catch (err) {
      console.error('Error fetching monthly attendance data:', err);
      setRawAttendance([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthlyData();
  }, [selectedYear, selectedMonth]);

  // Generate days array for the selected Month & Year
  const daysInMonthList = useMemo(() => {
    const totalDays = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const days = [];
    for (let dayNum = 1; dayNum <= totalDays; dayNum++) {
      const dateObj = new Date(selectedYear, selectedMonth, dayNum);
      const dayName = DAY_NAMES[dateObj.getDay()];
      const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6; // Sun or Sat
      const formattedDay = String(dayNum).padStart(2, '0');
      const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${formattedDay}`;

      days.push({
        dayNum,
        formattedDay,
        dayName,
        isWeekend,
        dateStr,
      });
    }
    return days;
  }, [selectedYear, selectedMonth]);

  // Group raw attendance records by Employee
  const employeeRows = useMemo(() => {
    const empMap = new Map();

    rawAttendance.forEach((rec) => {
      if (!rec.employee_id) return;

      const empId = rec.employee_id;
      if (!empMap.has(empId)) {
        const empObj = rec.employee || {};
        empMap.set(empId, {
          id: empId,
          emp_id: empObj.emp_id || `EMP${empId}`,
          name: empObj.name || `Employee #${empId}`,
          email: empObj.email || '',
          department: empObj.department || '',
          recordsByDate: {},
        });
      }

      const empData = empMap.get(empId);
      if (rec.date) {
        empData.recordsByDate[rec.date] = rec;
      }
    });

    let result = Array.from(empMap.values());

    // Filter by search term
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (emp) =>
          emp.name.toLowerCase().includes(q) ||
          emp.emp_id.toLowerCase().includes(q) ||
          emp.department.toLowerCase().includes(q)
      );
    }

    return result;
  }, [rawAttendance, searchTerm]);

  // Render Status Badge for a day
  const renderDayCell = (rec, isWeekend, isFutureDate) => {
    if (!rec) {
      if (isWeekend) {
        return (
          <div className={`w-7 h-7 rounded flex items-center justify-center text-[10px] font-bold ${isDark ? 'bg-slate-800/40 text-slate-500' : 'bg-slate-100 text-slate-400'
            }`}>
            -
          </div>
        );
      }
      if (isFutureDate) {
        return <div className="w-7 h-7" />;
      }
      return <div className="w-7 h-7" />;
    }

    const st = (rec.status || '').toUpperCase();

    if (st === 'PRESENT') {
      return (
        <Tooltip title={`Present - ${rec.date}`}>
          <div className="w-7 h-7 rounded-md bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-700/80 text-emerald-800 dark:text-emerald-300 flex items-center justify-center text-[11px] font-extrabold shadow-xs">
            P
          </div>
        </Tooltip>
      );
    }

    if (st === 'CLOCKED_IN') {
      return (
        <Tooltip title={`Clocked In (Check-in) - ${rec.date}`}>
          <div className="w-7 h-7 rounded-md bg-slate-200 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center text-[11px] font-extrabold shadow-xs">
            P
          </div>
        </Tooltip>
      );
    }

    if (st === 'ABSENT') {
      return (
        <Tooltip title={`Absent - ${rec.date}`}>
          <div className="w-7 h-7 rounded-md bg-rose-100 dark:bg-rose-950/70 border border-rose-300 dark:border-rose-700/80 text-rose-800 dark:text-rose-300 flex items-center justify-center text-[10px] font-extrabold shadow-xs">
            AB
          </div>
        </Tooltip>
      );
    }

    if (st === 'HALF_DAY') {
      return (
        <Tooltip title={`Half Day - ${rec.date}`}>
          <div className="w-7 h-7 rounded-md bg-amber-100 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-700/80 text-amber-900 dark:text-amber-300 flex items-center justify-center text-[10px] font-extrabold shadow-xs">
            HD
          </div>
        </Tooltip>
      );
    }

    if (st === 'LEAVE' || st === 'ON_LEAVE') {
      return (
        <Tooltip title={`Leave - ${rec.date}`}>
          <div className="w-7 h-7 rounded-md bg-purple-100 dark:bg-purple-950/70 border border-purple-300 dark:border-purple-700/80 text-purple-900 dark:text-purple-300 flex items-center justify-center text-[11px] font-extrabold shadow-xs">
            L
          </div>
        </Tooltip>
      );
    }

    return (
      <Tooltip title={`${st} - ${rec.date}`}>
        <div className="w-7 h-7 rounded-md bg-blue-100 dark:bg-blue-950/70 border border-blue-300 dark:border-blue-700/80 text-blue-800 dark:text-blue-300 flex items-center justify-center text-[10px] font-extrabold">
          P
        </div>
      </Tooltip>
    );
  };

  // Calculate summary counts for an employee row
  const getEmployeeStats = (emp) => {
    let present = 0;
    let absent = 0;
    let leave = 0;
    let halfDay = 0;
    let weekendCount = 0;

    daysInMonthList.forEach((day) => {
      const rec = emp.recordsByDate[day.dateStr];
      if (day.isWeekend) {
        weekendCount++;
      }
      if (rec) {
        const st = (rec.status || '').toUpperCase();
        if (st === 'PRESENT' || st === 'CLOCKED_IN') present++;
        else if (st === 'ABSENT') absent++;
        else if (st === 'HALF_DAY') halfDay++;
        else if (st === 'LEAVE' || st === 'ON_LEAVE') leave++;
      }
    });

    return {
      p: present.toFixed(1),
      a: absent.toFixed(1),
      l: leave.toFixed(1),
      hl: halfDay,
      h: 0,
      pa: 0,
      hp: 0,
      ah: 0,
      ap: 0.0,
      d: 0.0,
      nw: weekendCount,
    };
  };

  return (
    <Paper
      className={`flex flex-col flex-1 min-h-0 rounded-2xl border shadow-xl overflow-hidden w-full transition-colors duration-200 ${isDark ? 'border-slate-800/80 bg-slate-900/80' : 'border-slate-200 bg-white'
        }`}
    >
      {/* Month & Search Controls Bar */}
      <div className="p-3.5 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/40">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <CalendarMonthIcon sx={{ color: isDark ? '#60a5fa' : '#2563eb', fontSize: 22 }} />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Select Period:
            </span>
          </div>

          {/* Month Selector */}
          <TextField
            select
            size="small"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            sx={{
              minWidth: 130,
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: 700,
                backgroundColor: isDark ? 'rgba(15, 23, 42, 0.6)' : '#ffffff',
                color: isDark ? '#ffffff' : '#0f172a',
              },
            }}
          >
            {MONTH_NAMES.map((name, idx) => (
              <MenuItem key={name} value={idx} sx={{ fontSize: '5px', fontWeight: 600 }}>
                {name}
              </MenuItem>
            ))}
          </TextField>

          {/* Searchable Year Selector (1900 to Current Year) */}
          <Autocomplete
            size="small"
            options={Array.from(
              { length: today.getFullYear() - 1900 + 1 },
              (_, i) => 1900 + i
            ).reverse()}
            getOptionLabel={(option) => String(option)}
            value={selectedYear}
            onChange={(_, newValue) => {
              if (newValue) setSelectedYear(Number(newValue));
            }}
            disableClearable
            sx={{ width: 110 }}
            renderInput={(params) => (
              <TextField
                {...params}
                size="small"
                placeholder="Year"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                    fontSize: '12px',
                    fontWeight: 700,
                    backgroundColor: isDark ? 'rgba(15, 23, 42, 0.6)' : '#ffffff',
                    color: isDark ? '#ffffff' : '#0f172a',
                    '& fieldset': {
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : '#cbd5e1',
                    },
                    '&:hover fieldset': {
                      borderColor: isDark ? '#60a5fa' : '#3b82f6',
                    },
                  },
                }}
              />
            )}
            slotProps={{
              paper: {
                sx: {
                  borderRadius: '5px',
                  backgroundColor: isDark ? '#0f172a' : '#ffffff',
                  color: isDark ? '#ffffff' : '#0f172a',
                  border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.15)' : '#cbd5e1'}`,
                  overflow: 'hidden',
                },
              },
              listbox: {
                sx: {
                  maxHeight: 220,
                  fontSize: '12px',
                  fontWeight: 600,
                  padding: '4px 0',
                  '&::-webkit-scrollbar': {
                    width: '5px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                    borderRadius: '4px',
                  },
                },
              },
            }}
          />
        </div>
      </div>

      {/* Main Matrix Scroll Container */}
      <div className="flex-1 min-h-0 overflow-auto relative w-full">
        {loading ? (
          <TableSkeleton columns={12} rows={8} showPagination={false} avatarColIndex={0} />
        ) : employeeRows.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 gap-2 text-center">
            <CalendarMonthIcon sx={{ fontSize: 44, color: isDark ? '#475569' : '#94a3b8' }} />
            <p className={`text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              No attendance records found for {MONTH_NAMES[selectedMonth]} {selectedYear}
            </p>
            <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
              Try selecting a different month or clearing your search term.
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-separate border-spacing-0 min-w-[1200px]">
            {/* Header Row */}
            <thead>
              <tr className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'} border-b text-[11px] font-extrabold uppercase sticky top-0 z-20`}>
                {/* Left Employee Sticky Header */}
                <th
                  style={{
                    backgroundColor: isDark ? '#0f172a' : '#f8fafc',
                    backgroundClip: 'padding-box',
                  }}
                  className={`p-3 sticky left-0 z-[60] min-w-[220px] max-w-[240px] ${isDark ? 'text-slate-300 border-slate-800' : 'text-slate-700 border-slate-200'
                    } border-r border-b`}
                >
                  Employee
                </th>

                {/* Days Columns (01..31) */}
                {daysInMonthList.map((day) => (
                  <th
                    key={day.dayNum}
                    className={`px-1 py-2 text-center min-w-[36px] border-r border-b ${day.isWeekend
                        ? isDark ? 'bg-slate-800/60 text-slate-400 border-slate-800' : 'bg-slate-100 text-slate-500 border-slate-200'
                        : isDark ? 'text-slate-300 border-slate-800/80' : 'text-slate-700 border-slate-200'
                      }`}
                  >
                    <div className="font-extrabold text-[11px] leading-none">{day.formattedDay}</div>
                    <div className="text-[9px] font-semibold opacity-75 mt-0.5">{day.dayName}</div>
                  </th>
                ))}

                {/* Right Summary Columns Sticky Header */}
                {SUMMARY_COLS.map((col, idx) => {
                  const cellWidth = 40;
                  const rightOffset = (SUMMARY_COLS.length - 1 - idx) * cellWidth;
                  const bgColor = isDark ? col.darkHeaderBg : col.lightHeaderBg;
                  return (
                    <th
                      key={col.key}
                      style={{
                        right: `${rightOffset}px`,
                        width: `${cellWidth}px`,
                        minWidth: `${cellWidth}px`,
                        maxWidth: `${cellWidth}px`,
                        boxSizing: 'border-box',
                        backgroundColor: bgColor,
                        backgroundClip: 'padding-box',
                      }}
                      className={`sticky top-0 z-[60] p-0 text-center text-[10px] font-black border-r border-b ${idx === 0
                          ? 'border-l-2 border-slate-400 dark:border-slate-600 '
                          : ''
                        } ${col.headerColor || 'text-slate-800 dark:text-slate-200'} ${
                          isDark ? 'border-slate-800' : 'border-slate-300'
                        }`}
                    >
                      <div className="w-full h-full flex items-center justify-center py-2.5">
                        {col.label}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* Matrix Body Rows */}
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
              {employeeRows.map((emp) => {
                const stats = getEmployeeStats(emp);

                return (
                  <tr
                    key={emp.id}
                    className={`transition-colors ${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/80'
                      }`}
                  >
                    {/* Sticky Left Column: Employee Profile */}
                    <td
                      style={{
                        backgroundColor: isDark ? '#0f172a' : '#ffffff',
                        backgroundClip: 'padding-box',
                      }}
                      className={`p-2.5 sticky left-0 z-[40] min-w-[220px] max-w-[240px] border-r border-b ${isDark ? 'text-white border-slate-800' : 'text-slate-900 border-slate-200'
                        }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: isDark ? '#3b82f6' : '#2563eb',
                            color: '#ffffff',
                            fontWeight: 'bold',
                            fontSize: '13px',
                          }}
                        >
                          {emp.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-xs truncate text-blue-600 dark:text-blue-400 uppercase tracking-tight">
                            {emp.name}
                          </p>
                          <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate">
                            {emp.emp_id}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Day Matrix Cells (z-index 1) */}
                    {daysInMonthList.map((day) => {
                      const rec = emp.recordsByDate[day.dateStr];
                      const isFuture = new Date(day.dateStr) > today;

                      return (
                        <td
                          key={day.dayNum}
                          className={`px-0.5 py-1.5 text-center border-r border-b align-middle relative z-1 ${day.isWeekend
                              ? isDark
                                ? 'bg-slate-800/20 border-slate-800/80'
                                : 'bg-slate-50/70 border-slate-200/80'
                              : isDark
                                ? 'border-slate-800/50'
                                : 'border-slate-100'
                            }`}
                        >
                          <div className="flex items-center justify-center">
                            {renderDayCell(rec, day.isWeekend, isFuture)}
                          </div>
                        </td>
                      );
                    })}

                    {/* Right Summary Counter Columns Sticky (High z-index z-[40] & solid backgroundClip) */}
                    {SUMMARY_COLS.map((col, idx) => {
                      const cellWidth = 40;
                      const rightOffset = (SUMMARY_COLS.length - 1 - idx) * cellWidth;
                      const bgColor = isDark ? col.darkBodyBg : col.lightBodyBg;
                      return (
                        <td
                          key={col.key}
                          style={{
                            right: `${rightOffset}px`,
                            width: `${cellWidth}px`,
                            minWidth: `${cellWidth}px`,
                            maxWidth: `${cellWidth}px`,
                            boxSizing: 'border-box',
                            backgroundColor: bgColor,
                            backgroundClip: 'padding-box',
                          }}
                          className={`sticky z-[40] p-0 text-center font-mono text-[11px] font-bold border-r border-b ${idx === 0
                              ? 'border-l-2 border-slate-400 dark:border-slate-600 '
                              : ''
                            } ${col.colorClass || 'text-slate-900 dark:text-slate-100'} ${
                              isDark ? 'border-slate-800' : 'border-slate-200'
                            }`}
                        >
                          <div className="w-full h-full flex items-center justify-center py-2 bg-inherit">
                            {stats[col.key]}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </Paper>
  );
}
