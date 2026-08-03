import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useThemeMode } from '../../contexts/ThemeContext';

// MUI Components
import {
  TextField,
  InputAdornment,
  MenuItem,
  Button,
  Snackbar,
  Alert,
  IconButton,
  Tooltip,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';

// MUI Icons
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';
import GroupsIcon from '@mui/icons-material/Groups';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import TableChartIcon from '@mui/icons-material/TableChart';

// Common Components & Views
import Navbar from '../../components/common/Navbar';
import DeleteEmployeeModal from '../../components/common/DeleteEmployeeModal';
import MyTeamTable, { OrgTreeChart } from '../../views/employee/myteam';
import ColumnSettingsDrawer from '../../components/dilogs/tasks/ColumnSettingsDrawer';
import { ALL_EMPLOYEE_COLUMNS } from './EmployeePage';

export default function MyTeamPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDark } = useThemeMode();

  // View Mode: 'tree' for Hierarchy Chart, 'table' for Tabular List
  const [viewMode, setViewMode] = useState('tree');

  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // KPI Team Stats state
  const [teamStats, setTeamStats] = useState({
    totalMembers: 0,
    directReports: 0,
    activeCount: 0,
    departmentsCount: 0,
  });

  // Column Visibility & Settings Drawer state
  const [settingsDrawerOpen, setSettingsDrawerOpen] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState({
    team: false,
    leaveProfiles: false,
    gender: false,
    reportingManager2: false,
    functionalManager: false,
    dateOfExit: false,
    dateOfRejoining: false,
    accessState: false,
    gpsStatus: false,
    createdBy: false,
    lastPunchIn: false,
    punchInGeoFence: false,
    punchOutGeoFence: false,
    entryAlertGeoFence: false,
    exitAlertGeoFence: false,
  });

  // Modal open states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [activeEmployee, setActiveEmployee] = useState(null);

  // Toast notification state
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const showToast = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleDeleteEmployee = (id) => {
    const empToDelete = employees.find((e) => e.id === id);
    setEmployees((prev) => prev.filter((e) => e.id !== id));
    showToast(`Team member "${empToDelete?.name || 'record'}" removed.`, 'info');
  };

  return (
    <div
      className={`min-h-screen lg:h-screen lg:max-h-screen overflow-y-auto lg:overflow-hidden flex flex-col transition-colors duration-200 ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
      }`}
    >
      {/* Header Navigation */}
      <Navbar user={user} logout={logout} />

      {/* Main Container */}
      <main className="flex-1 min-h-0 w-full px-3 py-3 sm:px-4 flex flex-col space-y-3 overflow-y-auto lg:overflow-hidden">
        {/* KPI Summary Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 flex-shrink-0">
          {/* Total Team Members */}
          <div className={`p-3 sm:p-3.5 rounded-2xl border flex items-center gap-3 transition-all duration-200 ${
            isDark ? 'bg-slate-900/70 border-slate-800/80' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex-shrink-0">
              <GroupsIcon fontSize="small" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block truncate">Total Team</span>
              <span className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white leading-none">{teamStats.totalMembers}</span>
            </div>
          </div>

          {/* Direct Reports */}
          <div className={`p-3 sm:p-3.5 rounded-2xl border flex items-center gap-3 transition-all duration-200 ${
            isDark ? 'bg-slate-900/70 border-slate-800/80' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex-shrink-0">
              <AccountTreeIcon fontSize="small" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block truncate">Direct Reports</span>
              <span className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white leading-none">{teamStats.directReports}</span>
            </div>
          </div>

          {/* Active Members */}
          <div className={`p-3 sm:p-3.5 rounded-2xl border flex items-center gap-3 transition-all duration-200 ${
            isDark ? 'bg-slate-900/70 border-slate-800/80' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex-shrink-0">
              <GroupsIcon fontSize="small" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block truncate">Active Members</span>
              <span className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white leading-none">{teamStats.activeCount}</span>
            </div>
          </div>

          {/* Departments */}
          <div className={`p-3 sm:p-3.5 rounded-2xl border flex items-center gap-3 transition-all duration-200 ${
            isDark ? 'bg-slate-900/70 border-slate-800/80' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex-shrink-0">
              <GroupsIcon fontSize="small" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block truncate">Departments</span>
              <span className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white leading-none">{teamStats.departmentsCount}</span>
            </div>
          </div>
        </div>

        {/* Action & Filter Toolbar */}
        <div
          className={`p-3.5 sm:p-4 rounded-2xl border flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 sm:gap-4 flex-shrink-0 transition-all duration-200 ${
            isDark
              ? 'bg-slate-900/70 border-slate-800/80 backdrop-blur-xl shadow-xl'
              : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          {/* Header Title Banner */}
          <div className="flex items-center justify-between gap-3 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div
                className={`p-2.5 rounded-xl ${
                  isDark ? 'bg-indigo-900/40 text-indigo-400' : 'bg-indigo-50 text-indigo-600'
                }`}
              >
                <GroupsIcon fontSize="medium" />
              </div>
              <div>
                <h1
                  className={`text-lg sm:text-xl font-extrabold tracking-tight ${
                    isDark ? 'text-white' : 'text-slate-950'
                  }`}
                >
                  My Team Hierarchy
                </h1>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Visualize organizational structure tree and manage team reporting lines.
                </p>
              </div>
            </div>

            {/* Mobile View Toggle & Action Button */}
            <div className="xl:hidden flex items-center gap-2 flex-shrink-0">
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(e, val) => val && setViewMode(val)}
                size="small"
                sx={{
                  backgroundColor: isDark ? 'rgba(15, 23, 42, 0.8)' : '#f1f5f9',
                  borderRadius: '10px',
                  p: 0.5,
                  '& .MuiToggleButton-root': {
                    border: 'none',
                    borderRadius: '8px',
                    px: 1.2,
                    py: 0.4,
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    color: isDark ? '#94a3b8' : '#64748b',
                    '&.Mui-selected': {
                      backgroundColor: isDark ? '#3b82f6' : '#ffffff',
                      color: isDark ? '#ffffff' : '#0f172a',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                    },
                  },
                }}
              >
                <ToggleButton value="tree">
                  <AccountTreeIcon sx={{ fontSize: 16, mr: 0.5 }} />
                  Tree
                </ToggleButton>
                <ToggleButton value="table">
                  <TableChartIcon sx={{ fontSize: 16, mr: 0.5 }} />
                  Table
                </ToggleButton>
              </ToggleButtonGroup>

              <Button
                onClick={() => navigate('/create-employee')}
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                sx={{
                  background: isDark
                    ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
                    : '#0f172a',
                  color: '#ffffff',
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 700,
                  px: 1.5,
                  py: 0.75,
                }}
              >
                Add
              </Button>
            </div>
          </div>

          {/* Controls: View Switch, Search & Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 flex-1 min-w-0">
            {/* Desktop View Switcher: Tree View vs Table View */}
            <div className="hidden xl:block flex-shrink-0">
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(e, val) => val && setViewMode(val)}
                size="small"
                sx={{
                  backgroundColor: isDark ? 'rgba(15, 23, 42, 0.8)' : '#f1f5f9',
                  borderRadius: '12px',
                  p: 0.5,
                  border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #cbd5e1',
                  '& .MuiToggleButton-root': {
                    border: 'none',
                    borderRadius: '8px',
                    px: 2,
                    py: 0.6,
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '0.825rem',
                    color: isDark ? '#94a3b8' : '#64748b',
                    '&.Mui-selected': {
                      backgroundColor: isDark ? '#2563eb' : '#ffffff',
                      color: isDark ? '#ffffff' : '#0f172a',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                    },
                  },
                }}
              >
                <ToggleButton value="tree">
                  <AccountTreeIcon sx={{ fontSize: 18, mr: 1 }} />
                  Org Tree Chart
                </ToggleButton>
                <ToggleButton value="table">
                  <TableChartIcon sx={{ fontSize: 18, mr: 1 }} />
                  Table View
                </ToggleButton>
              </ToggleButtonGroup>
            </div>

            {/* Search Bar */}
            {viewMode === 'table' && (
              <div className="flex-1 min-w-0 sm:max-w-xs md:max-w-sm">
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search team member..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon className={isDark ? 'text-slate-400' : 'text-slate-500'} fontSize="small" />
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: isDark ? '#ffffff' : '#0f172a',
                      backgroundColor: isDark ? 'rgba(15, 23, 42, 0.8)' : '#ffffff',
                      borderRadius: '12px',
                      '& fieldset': { borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#cbd5e1' },
                    },
                  }}
                />
              </div>
            )}

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {viewMode === 'table' && (
                <>
                  <TextField
                    select
                    size="small"
                    label="Status"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    sx={{
                      minWidth: { xs: 110, sm: 125 },
                      '& .MuiOutlinedInput-root': {
                        color: isDark ? '#ffffff' : '#0f172a',
                        backgroundColor: isDark ? 'rgba(15, 23, 42, 0.8)' : '#ffffff',
                        borderRadius: '8px',
                        '& fieldset': { borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#cbd5e1' },
                      },
                      '& .MuiInputLabel-root': { color: isDark ? '#94a3b8' : '#475569', fontSize: '0.85rem' },
                    }}
                  >
                    <MenuItem value="All">All Statuses</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="on_leave">On Leave</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </TextField>

                  <Tooltip title="Configure Table Columns">
                    <IconButton
                      onClick={() => setSettingsDrawerOpen(true)}
                      sx={{
                        color: isDark ? '#94a3b8' : '#475569',
                        backgroundColor: isDark ? 'rgba(15, 23, 42, 0.8)' : '#ffffff',
                        border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #cbd5e1',
                        borderRadius: '12px',
                        padding: '8px',
                      }}
                    >
                      <SettingsIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </>
              )}
            </div>
          </div>
        </div>

        {/* View Mode Switching Body */}
        {viewMode === 'tree' ? (
          <OrgTreeChart onStatsCalculated={(stats) => setTeamStats(stats)} />
        ) : (
          <MyTeamTable
            searchTerm={searchTerm}
            selectedDepartment={selectedDepartment}
            selectedStatus={selectedStatus}
            columnVisibility={columnVisibility}
            onViewClick={(emp) => {
              setActiveEmployee(emp);
            }}
            onEditClick={(emp) => {
              setActiveEmployee(emp);
            }}
            onDeleteClick={(emp) => {
              setActiveEmployee(emp);
              setDeleteModalOpen(true);
            }}
          />
        )}
      </main>

      {/* Column Settings Drawer */}
      <ColumnSettingsDrawer
        open={settingsDrawerOpen}
        onClose={() => setSettingsDrawerOpen(false)}
        columns={ALL_EMPLOYEE_COLUMNS}
        columnVisibility={columnVisibility}
        setColumnVisibility={setColumnVisibility}
        isDark={isDark}
      />

      <DeleteEmployeeModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        employee={activeEmployee}
        onDelete={handleDeleteEmployee}
      />

      {/* Snackbar Alert */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
            fontWeight: 600,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
