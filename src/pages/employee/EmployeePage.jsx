import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useThemeMode } from '../../contexts/ThemeContext';
import { EmployeeRoute } from '../../routes/employee/employee.route.js';

// MUI Components
import {
  Avatar,
  TextField,
  InputAdornment,
  MenuItem,
  Button,
  Snackbar,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';

// MUI Icons
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';

// Common Components
import Navbar from '../../components/common/Navbar';
import DeleteConfirmationModal from '../../components/common/DeleteConfirmationModal';

// Views & Table Components
import EmployeeTable from '../../views/employee/EmployeeTable';

// Dialog Modals
import ColumnSettingsDrawer from '../../components/dilogs/tasks/ColumnSettingsDrawer';

export const ALL_EMPLOYEE_COLUMNS = [
  { id: "name", label: "Name" },
  { id: "manager", label: "Manager" },
  { id: "employee_id", label: "Id" },
  { id: "department", label: "Department" },
  { id: "email", label: "Email" },
  { id: "role", label: "Designations" },
  { id: "phone", label: "Mobile" },
  { id: "workingShifts", label: "Working Shifts" },
  { id: "status", label: "Status" },
  { id: "location", label: "Work Location" },
  { id: "type", label: "Type" },
  { id: "employment_type", label: "Employee Type" },
  { id: "businessUnit", label: "Business Unit" },
  { id: "roles", label: "Roles" },
  { id: "lastLocation", label: "Last Location" },
  { id: "locationAddress", label: "Location" },
  { id: "address", label: "Address" },
  { id: "dateOfBirth", label: "Date of Birth" },
  { id: "joining_date", label: "Date of Joining" },
  { id: "employeeState", label: "State Name" },
  { id: "employeeRegion", label: "Region Name" },
  { id: "employeeBranch", label: "Branch Name" },
  { id: "team", label: "Team" },
  { id: "gender", label: "Gender" },
  { id: "createdBy", label: "Created By" },
  { id: "salary", label: "Salary" },
  { id: "punchInGeoFence", label: "Punch In Geo Fence" },
  { id: "punchOutGeoFence", label: "Punch Out Geo Fence" },
];

export default function EmployeePage() {
  const navigate = useNavigate();
  const { user, logout, hasPermission } = useAuth();

  const { isDark } = useThemeMode();

  console.log("Permission", hasPermission('employee', 'add'));

  const [employees, setEmployees] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

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

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Modal open states
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Selected employee for actions
  const [activeEmployee, setActiveEmployee] = useState(null);

  // Toast notification state
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const showToast = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // Fetch employees from Backend API
  const fetchEmployees = async () => {
    try {
      const res = await EmployeeRoute.getAllEmployee({
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm || undefined,
        status: selectedStatus !== 'All' ? selectedStatus.toLowerCase() : undefined,
        department: selectedDepartment !== 'All' ? selectedDepartment : undefined,
      });

      if (res?.success && res?.data?.employees) {
        setEmployees(res.data.employees);
        setTotalItems(res.data.totalItems !== undefined ? res.data.totalItems : res.data.employees.length);
      } else {
        setEmployees([]);
        setTotalItems(0);
      }
    } catch (error) {
      console.error(error);
      setEmployees([]);
      setTotalItems(0);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [page, rowsPerPage, searchTerm, selectedDepartment, selectedStatus]);

  // Employees list for table (client filtering fallback if needed)
  const filteredEmployees = useMemo(() => {
    if (!employees || !Array.isArray(employees)) return [];
    return employees;
  }, [employees]);

  // Handlers for Employee CRUD
  const handleAddEmployee = (newEmp) => {
    setEmployees((prev) => [newEmp, ...prev]);
    showToast(`Employee "${newEmp.name}" added successfully!`);
  };

  const handleUpdateEmployee = (updatedEmp) => {
    setEmployees((prev) => prev.map((e) => (e.id === updatedEmp.id ? updatedEmp : e)));
    showToast(`Employee "${updatedEmp.name}" details updated.`);
  };

  const handleDeleteEmployee = async (employeeOrId) => {
    const slug = typeof employeeOrId === 'object' ? (employeeOrId?.slug || employeeOrId?.id) : employeeOrId;
    if (!slug) return;
    try {
      const res = await EmployeeRoute.deleteEmployee(slug);
      if (res?.success) {
        fetchEmployees();
      }
    } catch (error) {
      console.error("Failed to delete employee", error);
    }
  };

  // Status Chip Style Helper
  const getStatusChipProps = (status) => {
    if (isDark) {
      switch (status) {
        case 'Active':
          return {
            label: 'Active',
            style: {
              backgroundColor: 'rgba(34, 197, 94, 0.15)',
              color: '#4ade80',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              fontWeight: 600,
            },
          };
        case 'On Leave':
          return {
            label: 'On Leave',
            style: {
              backgroundColor: 'rgba(234, 179, 8, 0.15)',
              color: '#fde047',
              border: '1px solid rgba(234, 179, 8, 0.3)',
              fontWeight: 600,
            },
          };
        default:
          return {
            label: 'Inactive',
            style: {
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              color: '#fca5a5',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              fontWeight: 600,
            },
          };
      }
    } else {
      // Light Mode (Black & White High Contrast Theme)
      switch (status) {
        case 'Active':
          return {
            label: 'Active',
            style: {
              backgroundColor: '#f0fdf4',
              color: '#166534',
              border: '1px solid #bbf7d0',
              fontWeight: 700,
            },
          };
        case 'On Leave':
          return {
            label: 'On Leave',
            style: {
              backgroundColor: '#fefce8',
              color: '#854d0e',
              border: '1px solid #fef08a',
              fontWeight: 700,
            },
          };
        default:
          return {
            label: 'Inactive',
            style: {
              backgroundColor: '#fef2f2',
              color: '#991b1b',
              border: '1px solid #fecdd3',
              fontWeight: 700,
            },
          };
      }
    }
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
        
        {/* Action & Filter Toolbar with Header Title */}
        <div
          className={`p-3.5 sm:p-4 rounded-2xl border flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 sm:gap-4 flex-shrink-0 transition-all duration-200 ${
            isDark
              ? 'bg-slate-900/70 border-slate-800/80 backdrop-blur-xl shadow-xl'
              : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          {/* Header Title & Mobile CTA */}
          <div className="flex items-center justify-between gap-3 flex-shrink-0">
            <div>
              <h1
                className={`text-lg sm:text-xl font-extrabold tracking-tight ${isDark ? "text-white" : "text-slate-950"}`}
              >
                All Employees
              </h1>
              <p
                className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}
              >
                Manage and track all workplace employees with real-time updates.
              </p>
            </div>

            {/* Mobile / Tablet Primary Action Button (Shown when screen < xl) */}
            {hasPermission('employee', 'add') && (
              <div className="xl:hidden flex-shrink-0">
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
                    boxShadow: isDark
                      ? '0 6px 16px -4px rgba(99, 102, 241, 0.5)'
                      : '0 4px 10px rgba(15, 23, 42, 0.2)',
                    '&:hover': {
                      background: isDark
                        ? 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)'
                        : '#1e293b',
                    },
                  }}
                >
                  Add
                </Button>
              </div>
            )}
          </div>

          {/* Controls: Search & Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 flex-1 min-w-0">
            {/* Search bar */}
            <div className="flex-1 min-w-0 sm:max-w-xs md:max-w-sm">
              <TextField
                fullWidth
                size="small"
                placeholder="Search by name, email, ID or designation..."
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
                    '&:hover fieldset': { borderColor: isDark ? '#6366f1' : '#0f172a' },
                    '&.Mui-focused fieldset': { borderColor: isDark ? '#6366f1' : '#0f172a' },
                  },
                }}
              />
            </div>

            {/* Filters and Desktop Action Button */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {/* Status Filter */}
              <TextField
                select
                size="small"
                label="Status"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                sx={{
                  minWidth: { xs: 110, sm: 125 },
                  flex: { xs: 1, sm: 'initial' },
                  '& .MuiOutlinedInput-root': {
                    color: isDark ? '#ffffff' : '#0f172a',
                    backgroundColor: isDark ? 'rgba(15, 23, 42, 0.8)' : '#ffffff',
                    borderRadius: '8px',
                    '& fieldset': { borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#cbd5e1' },
                    '&:hover fieldset': { borderColor: isDark ? '#6366f1' : '#0f172a' },
                    '&.Mui-focused fieldset': { borderColor: isDark ? '#6366f1' : '#0f172a' },
                  },
                  '& .MuiInputLabel-root': { color: isDark ? '#94a3b8' : '#475569', fontSize: '0.85rem' },
                  '& .MuiSvgIcon-root': { color: isDark ? '#94a3b8' : '#475569' },
                }}
              >
                <MenuItem value="All">All Statuses</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="on_leave">On Leave</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="terminated">Terminated</MenuItem>
              </TextField>

              {/* Column Settings Toggle Button */}
              <Tooltip title="Configure Table Columns">
                <IconButton
                  onClick={() => setSettingsDrawerOpen(true)}
                  sx={{
                    color: isDark ? '#94a3b8' : '#475569',
                    backgroundColor: isDark ? 'rgba(15, 23, 42, 0.8)' : '#ffffff',
                    border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #cbd5e1',
                    borderRadius: '12px',
                    padding: '8px',
                    '&:hover': {
                      backgroundColor: isDark ? 'rgba(30, 41, 59, 0.8)' : '#f1f5f9',
                      color: isDark ? '#38bdf8' : '#0284c7',
                    },
                  }}
                >
                  <SettingsIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              {/* Desktop Add Employee Button (Shown when screen >= xl) */}
              {hasPermission('employee', 'add') && (
                <div className="hidden xl:block flex-shrink-0">
                  <Button
                    onClick={() => navigate('/create-employee')}
                    variant="contained"
                    startIcon={<AddIcon />}
                    sx={{
                      background: isDark
                        ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
                        : '#0f172a',
                      color: '#ffffff',
                      borderRadius: '12px',
                      textTransform: 'none',
                      fontWeight: 700,
                      padding: '8px 20px',
                      boxShadow: isDark
                        ? '0 8px 20px -4px rgba(99, 102, 241, 0.5)'
                        : '0 4px 12px rgba(15, 23, 42, 0.2)',
                      '&:hover': {
                        background: isDark
                          ? 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)'
                          : '#1e293b',
                      },
                    }}
                  >
                    Add Employee
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Employee Table View */}
        <EmployeeTable
          searchTerm={searchTerm}
          selectedDepartment={selectedDepartment}
          selectedStatus={selectedStatus}
          columnVisibility={columnVisibility}
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
          getStatusChipProps={getStatusChipProps}
        />
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



      <DeleteConfirmationModal
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
