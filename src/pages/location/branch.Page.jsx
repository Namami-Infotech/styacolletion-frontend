import React, { useState, useEffect, useCallback } from 'react';
import {
  TextField,
  InputAdornment,
  MenuItem,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import AccountTreeIcon from '@mui/icons-material/AccountTree';

import Navbar from '../../components/common/Navbar';
import BranchTable from '../../views/locations/branch.Table';
import { locationRoute } from '../../routes/location/location.route';
import BranchFormModal from '../../components/dilogs/locations/branch.modol';
import { useAuth } from '../../contexts/AuthContext';
import { useThemeMode } from '../../contexts/ThemeContext';
import { toast } from 'react-toastify';

export default function BranchPage() {
  const { user, logout } = useAuth();
  const { isDark } = useThemeMode();

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');

  const [branches, setBranches] = useState([]);
  const [totalData, setTotalData] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);

  // Modals state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchBranches = useCallback(async () => {
    setLoading(true);
    try {
      const res = await locationRoute.getAllBranches({
        page: page + 1,
        limit: rowsPerPage,
        search: debouncedSearch,
        status: selectedStatus !== 'All' ? selectedStatus.toLowerCase() : '',
      });

      if (res && (res.success || res.statusCode === 200) && res.data) {
        const list = res.data.branches || (Array.isArray(res.data) ? res.data : []);
        setBranches(list);
        setTotalData(res.data.totalItems ?? list.length);
      } else {
        setBranches([]);
        setTotalData(0);
      }
    } catch (err) {
      console.error('Fetch branches error:', err);
      setBranches([]);
      setTotalData(0);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, debouncedSearch, selectedStatus]);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  useEffect(() => {
    const handleAdminAdd = (e) => {
      if (!e.detail?.section || e.detail.section === 'branch') {
        setSelectedBranch(null);
        setFormModalOpen(true);
      }
    };
    window.addEventListener('admin-open-create-modal', handleAdminAdd);
    return () => window.removeEventListener('admin-open-create-modal', handleAdminAdd);
  }, []);

  const handleOpenCreateModal = () => {
    setSelectedBranch(null);
    setFormModalOpen(true);
  };

  const handleEditClick = (br) => {
    setSelectedBranch(br);
    setFormModalOpen(true);
  };

  const handleDeleteClick = (br) => {
    setBranchToDelete(br);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!branchToDelete) return;
    setDeleteLoading(true);
    try {
      const identifier = branchToDelete.slug || branchToDelete.id;
      const res = await locationRoute.deleteBranch(identifier);
      if (res && (res.success || res.statusCode === 200)) {
        toast.success('Branch deleted successfully!');
        fetchBranches();
      }
    } catch (err) {
      console.error('Delete branch error:', err);
    } finally {
      setDeleteLoading(false);
      setDeleteModalOpen(false);
      setBranchToDelete(null);
    }
  };

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
        {/* Header Banner & Toolbar */}
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
              <AccountTreeIcon fontSize="medium" />
            </div>
            <div>
              <h1 className={`text-lg sm:text-xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-950'}`}>
                Branch Management
              </h1>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Manage company branches, state & region mappings, and branch status.
              </p>
            </div>
          </div>

          {/* Controls: Search, Status Filter & Create Action */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 flex-1 min-w-0">
            {/* Search Input */}
            <TextField
              size="small"
              placeholder="Search branch by name..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0);
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" sx={{ color: isDark ? '#94a3b8' : '#64748b' }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                minWidth: { xs: '100%', sm: 240 },
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  backgroundColor: isDark ? 'rgba(15, 23, 42, 0.6)' : '#f8fafc',
                  color: isDark ? '#ffffff' : '#0f172a',
                  '& fieldset': {
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : '#cbd5e1',
                  },
                  '&:hover fieldset': {
                    borderColor: isDark ? '#818cf8' : '#6366f1',
                  },
                },
              }}
            />

            {/* Status Filter */}
            <TextField
              select
              size="small"
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(0);
              }}
              sx={{
                minWidth: { xs: '100%', sm: 140 },
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  backgroundColor: isDark ? 'rgba(15, 23, 42, 0.6)' : '#f8fafc',
                  color: isDark ? '#ffffff' : '#0f172a',
                  '& fieldset': {
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : '#cbd5e1',
                  },
                },
              }}
            >
              <MenuItem value="All">All Statuses</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </TextField>

            {/* Create Branch Button */}
            <Button
              onClick={handleOpenCreateModal}
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              sx={{
                background: isDark
                  ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
                  : '#0f172a',
                color: '#ffffff',
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 700,
                px: 2,
                py: 0.9,
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
              Create Branch
            </Button>
          </div>
        </div>

        {/* Branch Table */}
        <div className="flex-1 min-h-0 flex flex-col relative">
          <BranchTable
            loading={loading}
            branches={branches}
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
          />
        </div>
      </main>

      {/* Form Modal */}
      {formModalOpen && (
        <BranchFormModal
          open={formModalOpen}
          onClose={() => setFormModalOpen(false)}
          branchItem={selectedBranch}
          onSuccess={fetchBranches}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <Dialog
          open={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          PaperProps={{
            sx: {
              borderRadius: '16px',
              backgroundColor: isDark ? '#0f172a' : '#ffffff',
              color: isDark ? '#ffffff' : '#0f172a',
            },
          }}
        >
          <DialogTitle sx={{ fontWeight: 700 }}>Confirm Delete</DialogTitle>
          <DialogContent>
            Are you sure you want to delete branch <strong>{branchToDelete?.name}</strong>? This action cannot be undone.
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setDeleteModalOpen(false)} disabled={deleteLoading} color="inherit">
              Cancel
            </Button>
            <Button onClick={handleConfirmDelete} variant="contained" color="error" disabled={deleteLoading}>
              {deleteLoading ? <CircularProgress size={20} color="inherit" /> : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
}
