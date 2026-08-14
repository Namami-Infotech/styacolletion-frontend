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
import UploadFileIcon from '@mui/icons-material/UploadFile';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';

import Navbar from '../../components/common/Navbar';
import LoanNumberTable from '../../views/loanNo/loanNumberTable';
import { loanNumberRoute } from '../../routes/loanNumber/loanNumber.route';
import LoanNumberFormModal from '../../components/dilogs/loanNo/LoanNumberFormModal';
import LoanNumberImportModal, { exportLoanNumbersToExcel } from '../../components/dilogs/loanNo/LoanNumberImportModal';
import { useAuth } from '../../contexts/AuthContext';
import { useThemeMode } from '../../contexts/ThemeContext';
import { toast } from 'react-toastify';

export default function LoanNumberPage() {
  const { user, logout } = useAuth();
  const { isDark } = useThemeMode();

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');

  const [loanNumbers, setLoanNumbers] = useState([]);
  const [totalData, setTotalData] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);

  // Modals state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [selectedLoanItem, setSelectedLoanItem] = useState(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchLoanNumbers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await loanNumberRoute.getAllLoanNumbers({
        page: page + 1,
        limit: rowsPerPage,
        search: debouncedSearch,
        status: selectedStatus !== 'All' ? selectedStatus.toLowerCase() : '',
      });

      if (res && (res.success || res.statusCode === 200) && res.data) {
        const list = res.data.loanNumbers || (Array.isArray(res.data) ? res.data : []);
        setLoanNumbers(list);
        setTotalData(res.data.totalItems ?? list.length);
      } else {
        setLoanNumbers([]);
        setTotalData(0);
      }
    } catch (err) {
      console.error('Fetch loan numbers error:', err);
      setLoanNumbers([]);
      setTotalData(0);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, debouncedSearch, selectedStatus]);

  useEffect(() => {
    fetchLoanNumbers();
  }, [fetchLoanNumbers]);

  useEffect(() => {
    const handleAdminAdd = (e) => {
      if (!e.detail?.section || e.detail.section === 'loanNos') {
        setSelectedLoanItem(null);
        setFormModalOpen(true);
      }
    };
    window.addEventListener('admin-open-create-modal', handleAdminAdd);
    return () => window.removeEventListener('admin-open-create-modal', handleAdminAdd);
  }, []);

  const handleOpenCreateModal = () => {
    setSelectedLoanItem(null);
    setFormModalOpen(true);
  };

  const handleEditClick = (item) => {
    setSelectedLoanItem(item);
    setFormModalOpen(true);
  };

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setDeleteLoading(true);
    try {
      const identifier = itemToDelete.slug || itemToDelete.id;
      const res = await loanNumberRoute.deleteLoanNumber(identifier);
      if (res && (res.success || res.statusCode === 200)) {
        toast.success('Loan Number deleted successfully!');
        fetchLoanNumbers();
      }
    } catch (err) {
      console.error('Delete loan number error:', err);
    } finally {
      setDeleteLoading(false);
      setDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  const handleExportExcel = () => {
    exportLoanNumbersToExcel(loanNumbers);
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
              <FormatListNumberedIcon fontSize="medium" />
            </div>
            <div>
              <h1 className={`text-lg sm:text-xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-950'}`}>
                Loan Numbers Management
              </h1>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Create, update, manage and bulk upload loan numbers using Excel files.
              </p>
            </div>
          </div>

          {/* Controls: Search, Status Filter, Import & Create Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 flex-1 min-w-0">
            {/* Search Input */}
            <TextField
              size="small"
              placeholder="Search by loan number..."
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
                minWidth: { xs: '100%', sm: 220 },
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
                minWidth: { xs: '100%', sm: 130 },
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

            {/* Bulk Upload Excel Button */}
            <Button
              onClick={() => setImportModalOpen(true)}
              variant="outlined"
              size="small"
              startIcon={<UploadFileIcon />}
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 700,
                px: 2,
                py: 0.9,
                borderColor: isDark ? '#818cf8' : '#4f46e5',
                color: isDark ? '#818cf8' : '#4f46e5',
                '&:hover': {
                  borderColor: isDark ? '#a5b4fc' : '#3730a3',
                  backgroundColor: isDark ? 'rgba(99, 102, 241, 0.1)' : 'rgba(79, 70, 229, 0.05)',
                },
              }}
            >
              Excel Upload
            </Button>

            {/* Export Excel Button */}
            <Button
              onClick={handleExportExcel}
              variant="outlined"
              size="small"
              startIcon={<FileDownloadIcon />}
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 700,
                px: 2,
                py: 0.9,
                borderColor: isDark ? '#34d399' : '#059669',
                color: isDark ? '#34d399' : '#059669',
                '&:hover': {
                  borderColor: isDark ? '#6ee7b7' : '#047857',
                  backgroundColor: isDark ? 'rgba(52, 211, 153, 0.1)' : 'rgba(5, 150, 105, 0.05)',
                },
              }}
            >
              Export
            </Button>

            {/* Create Loan Number Button */}
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
              Create Loan No
            </Button>
          </div>
        </div>

        {/* Loan Number Table */}
        <div className="flex-1 min-h-0 flex flex-col relative">
          <LoanNumberTable
            loading={loading}
            loanNumbers={loanNumbers}
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

      {/* Form Modal (Create / Edit) */}
      {formModalOpen && (
        <LoanNumberFormModal
          open={formModalOpen}
          onClose={() => setFormModalOpen(false)}
          loanItem={selectedLoanItem}
          onSuccess={fetchLoanNumbers}
          onOpenImport={() => setImportModalOpen(true)}
        />
      )}

      {/* Bulk Upload Import Modal */}
      {importModalOpen && (
        <LoanNumberImportModal
          open={importModalOpen}
          onClose={() => setImportModalOpen(false)}
          isDark={isDark}
          onSuccess={fetchLoanNumbers}
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
            Are you sure you want to delete loan number <strong>{itemToDelete?.loanNo}</strong>? This action cannot be undone.
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
