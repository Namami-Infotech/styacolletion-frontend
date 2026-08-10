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
import LocationCityIcon from '@mui/icons-material/LocationCity';

import Navbar from '../../components/common/Navbar';
import OfficeTable from '../../views/office/officeTable';
import { officeRoute } from '../../routes/office/office.route';
import OfficeFormModal from '../../components/dilogs/office/OfficeFormModal';
import { useAuth } from '../../contexts/AuthContext';
import { useThemeMode } from '../../contexts/ThemeContext';
import { toast } from 'react-toastify';

export default function OfficePage() {
  const { user, logout, permissions } = useAuth();
  const { isDark } = useThemeMode();

  const canAdd = React.useMemo(() => {
    if (!permissions) return true;
    let actualPerms = permissions;
    while (actualPerms && actualPerms.permission && typeof actualPerms.permission === 'object') {
      actualPerms = actualPerms.permission;
    }
    const adminPerms = actualPerms?.admin || actualPerms;
    const node = adminPerms?.office || actualPerms?.office;
    if (node && typeof node.add === 'boolean') return node.add;
    return true;
  }, [permissions]);

  const canEdit = React.useMemo(() => {
    if (!permissions) return true;
    let actualPerms = permissions;
    while (actualPerms && actualPerms.permission && typeof actualPerms.permission === 'object') {
      actualPerms = actualPerms.permission;
    }
    const adminPerms = actualPerms?.admin || actualPerms;
    const node = adminPerms?.office || actualPerms?.office;
    if (node && typeof node.edit === 'boolean') return node.edit;
    return true;
  }, [permissions]);

  const canDelete = React.useMemo(() => {
    if (!permissions) return true;
    let actualPerms = permissions;
    while (actualPerms && actualPerms.permission && typeof actualPerms.permission === 'object') {
      actualPerms = actualPerms.permission;
    }
    const adminPerms = actualPerms?.admin || actualPerms;
    const node = adminPerms?.office || actualPerms?.office;
    if (node && typeof node.delete === 'boolean') return node.delete;
    return true;
  }, [permissions]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');

  const [offices, setOffices] = useState([]);
  const [totalData, setTotalData] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);

  // Modals state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [selectedOffice, setSelectedOffice] = useState(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [officeToDelete, setOfficeToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchOffices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await officeRoute.getAllOffices({
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm,
      });

      if (res && (res.success || res.statusCode === 200) && res.data) {
        const list = res.data.offices || (Array.isArray(res.data) ? res.data : []);
        setOffices(list);
        setTotalData(res.data.totalItems ?? list.length);
      } else {
        setOffices([]);
        setTotalData(0);
      }
    } catch (err) {
      console.error('Fetch offices error:', err);
      setOffices([]);
      setTotalData(0);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchTerm]);

  useEffect(() => {
    fetchOffices();
  }, [fetchOffices]);

  // Filter local status if status filter is selected
  const displayedOffices = offices.filter((off) => {
    if (selectedStatus === 'All') return true;
    return String(off.status || '').toLowerCase() === selectedStatus.toLowerCase();
  });

  useEffect(() => {
    const handleAdminAdd = (e) => {
      if (
        !e.detail?.section ||
        e.detail.section === 'office' ||
        e.detail.section === 'department' ||
        e.detail.section === 'designation'
      ) {
        setSelectedOffice(null);
        setFormModalOpen(true);
      }
    };
    window.addEventListener('admin-open-create-modal', handleAdminAdd);
    return () => window.removeEventListener('admin-open-create-modal', handleAdminAdd);
  }, []);

  const handleOpenCreateModal = () => {
    setSelectedOffice(null);
    setFormModalOpen(true);
  };

  const handleEditClick = (office) => {
    setSelectedOffice(office);
    setFormModalOpen(true);
  };

  const handleDeleteClick = (office) => {
    setOfficeToDelete(office);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!officeToDelete) return;
    setDeleteLoading(true);
    try {
      const slug = officeToDelete.slug || officeToDelete.id;
      const res = await officeRoute.deleteOffice(slug);
      if (res && (res.success || res.statusCode === 200)) {
        toast.success('Office deleted successfully!');
        fetchOffices();
      }
    } catch (err) {
      console.error('Delete office error:', err);
    } finally {
      setDeleteLoading(false);
      setDeleteModalOpen(false);
      setOfficeToDelete(null);
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
        {/* Header Banner & Filter Toolbar */}
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
                isDark ? 'bg-blue-900/40 text-blue-400' : 'bg-blue-50 text-blue-600'
              }`}
            >
              <LocationCityIcon fontSize="medium" />
            </div>
            <div>
              <h1 className={`text-lg sm:text-xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-950'}`}>
                Office Directory
              </h1>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Manage office locations, geofencing radiuses, and branch assignments.
              </p>
            </div>
          </div>

          {/* Controls: Search, Status Filter & Create Action */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 flex-1 min-w-0">
            {/* Search Input */}
            <TextField
              size="small"
              placeholder="Search office by name, address..."
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
                    borderColor: isDark ? '#60a5fa' : '#3b82f6',
                  },
                },
              }}
            />

            {/* Status Filter */}
            <TextField
              select
              size="small"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
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

            {/* Create Office Button */}
            {canAdd && (
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
                Create Office
              </Button>
            )}
          </div>
        </div>

        {/* Office Table */}
        <div className="flex-1 min-h-0 flex flex-col relative">
          <OfficeTable
            loading={loading}
            offices={displayedOffices}
            totalData={totalData}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            onEditClick={canEdit ? handleEditClick : undefined}
            onDeleteClick={canDelete ? handleDeleteClick : undefined}
          />
        </div>
      </main>

      {/* Form Modal for Creating/Editing Office */}
      {formModalOpen && (
        <OfficeFormModal
          open={formModalOpen}
          onClose={() => setFormModalOpen(false)}
          office={selectedOffice}
          onSuccess={fetchOffices}
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
            Are you sure you want to delete the office <strong>{officeToDelete?.name}</strong>? This action cannot be undone.
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
