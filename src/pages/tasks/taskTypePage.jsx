import React, { useState, useEffect, useCallback } from 'react';
import {
  TextField,
  InputAdornment,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import AssignmentIcon from '@mui/icons-material/Assignment';

import Navbar from '../../components/common/Navbar';
import TaskTypeTable from '../../views/tasks/taskType.Table';
import { TaskTypeRoute } from '../../routes/tasks/task-type';
import TaskTypeFormModal from '../../components/dilogs/tasks/taskType.modol';
import { useAuth } from '../../contexts/AuthContext';
import { useThemeMode } from '../../contexts/ThemeContext';
import { toast } from 'react-toastify';

export default function TaskTypePage() {
  const { user, logout, hasPermission } = useAuth();
  const { isDark } = useThemeMode();

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [taskTypes, setTaskTypes] = useState([]);
  const [totalData, setTotalData] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);

  // Modals state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [selectedTaskType, setSelectedTaskType] = useState(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [taskTypeToDelete, setTaskTypeToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const canAdd = hasPermission('tasktype', 'add');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchTaskTypes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await TaskTypeRoute.getAllTaskTypes({
        page: page + 1,
        limit: rowsPerPage,
        search: debouncedSearch,
      });

      if (res && (res.success || res.statusCode === 200) && res.data) {
        const dataObj = res.data;
        const list = dataObj.taskTypes || (Array.isArray(dataObj) ? dataObj : []);
        const total = dataObj.totalItems ?? dataObj.totalCount ?? dataObj.count ?? list.length;
        setTaskTypes(list);
        setTotalData(total);
      } else {
        setTaskTypes([]);
        setTotalData(0);
      }
    } catch (err) {
      console.error('Fetch task types error:', err);
      setTaskTypes([]);
      setTotalData(0);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, debouncedSearch]);

  useEffect(() => {
    fetchTaskTypes();
  }, [fetchTaskTypes]);

  useEffect(() => {
    const handleAdminAdd = (e) => {
      if (!e.detail?.section || e.detail.section === 'tasktype') {
        setSelectedTaskType(null);
        setFormModalOpen(true);
      }
    };
    window.addEventListener('admin-open-create-modal', handleAdminAdd);
    return () => window.removeEventListener('admin-open-create-modal', handleAdminAdd);
  }, []);

  const handleOpenCreateModal = () => {
    setSelectedTaskType(null);
    setFormModalOpen(true);
  };

  const handleEditClick = (tt) => {
    setSelectedTaskType(tt);
    setFormModalOpen(true);
  };

  const handleDeleteClick = (tt) => {
    setTaskTypeToDelete(tt);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!taskTypeToDelete) return;
    setDeleteLoading(true);
    try {
      const identifier = taskTypeToDelete.slug || taskTypeToDelete.id;
      const res = await TaskTypeRoute.deleteTaskType(identifier);
      if (res && (res.success || res.statusCode === 200)) {
        toast.success(res.message || 'Task type deleted successfully!');
        fetchTaskTypes();
      }
    } catch (err) {
      console.error('Delete task type error:', err);
    } finally {
      setDeleteLoading(false);
      setDeleteModalOpen(false);
      setTaskTypeToDelete(null);
    }
  };

  return (
    <div
      className={`min-h-screen lg:h-screen lg:max-h-screen overflow-y-auto lg:overflow-hidden flex flex-col transition-colors duration-200 ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
      }`}
    >
      <Navbar user={user} logout={logout} />

      <main className="flex-1 min-h-0 w-full px-3 py-3 sm:px-4 flex flex-col space-y-3 overflow-y-auto lg:overflow-hidden">
        {/* Header Toolbar */}
        <div
          className={`p-3.5 sm:p-4 rounded-2xl border flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 sm:gap-4 flex-shrink-0 transition-all duration-200 ${
            isDark
              ? 'bg-slate-900/70 border-slate-800/80 backdrop-blur-xl shadow-xl'
              : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          {/* Title Banner */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div
              className={`p-2.5 rounded-xl ${
                isDark ? 'bg-indigo-900/40 text-indigo-400' : 'bg-indigo-50 text-indigo-600'
              }`}
            >
              <AssignmentIcon fontSize="medium" />
            </div>
            <div>
              <h1 className={`text-lg sm:text-xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-950'}`}>
                Task Type Management
              </h1>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Manage task category types and settings
              </p>
            </div>
          </div>

          {/* Controls: Search & Create */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 flex-1 min-w-0">
            <TextField
              size="small"
              placeholder="Search task type..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: isDark ? '#64748b' : '#94a3b8' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                width: { xs: '100%', sm: '280px' },
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                  color: isDark ? '#ffffff' : '#0f172a',
                  backgroundColor: isDark ? '#0f172a' : '#f8fafc',
                },
              }}
            />

            {canAdd && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenCreateModal}
                sx={{
                  borderRadius: '10px',
                  padding: '7px 16px',
                  fontWeight: 700,
                  textTransform: 'none',
                  whiteSpace: 'nowrap',
                  background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                  },
                }}
              >
                Add Task Type
              </Button>
            )}
          </div>
        </div>

        {/* Full-Width Table */}
        <div className="flex-1 min-h-0 w-full overflow-hidden flex flex-col">
          <TaskTypeTable
            taskTypes={taskTypes}
            totalData={totalData}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteClick}
            loading={loading}
          />
        </div>
      </main>

      {/* Form Modal (Create / Edit) */}
      <TaskTypeFormModal
        open={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        taskTypeItem={selectedTaskType}
        onSuccess={fetchTaskTypes}
      />

      {/* Delete Confirmation Modal */}
      <Dialog
        open={deleteModalOpen}
        onClose={() => !deleteLoading && setDeleteModalOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            backgroundColor: isDark ? '#0f172a' : '#ffffff',
            color: isDark ? '#ffffff' : '#0f172a',
          },
        }}
      >
        <DialogTitle className="font-bold">Delete Task Type</DialogTitle>
        <DialogContent>
          <p className="text-sm">
            Are you sure you want to delete task type <strong>{taskTypeToDelete?.name}</strong>?
            This action cannot be undone.
          </p>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteModalOpen(false)} disabled={deleteLoading} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={deleteLoading}
            sx={{ borderRadius: '10px', fontWeight: 700 }}
          >
            {deleteLoading ? <CircularProgress size={20} color="inherit" /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
