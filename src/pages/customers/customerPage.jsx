import React, { useState } from 'react';
import {
  TextField,
  InputAdornment,
  MenuItem,
  Button,
} from '@mui/material';

import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';

import { useLocation } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import CustomerTable from '../../views/customer/customer.Table';
import { useAuth } from '../../contexts/AuthContext';
import { useThemeMode } from '../../contexts/ThemeContext';
import CreateCustomerModal from '../../components/dilogs/customer/CreateCustomer.Model';
import EditCustomerModel from '../../components/dilogs/customer/EditCustomer.Model';
import DeleteConfirmationModal from '../../components/common/DeleteConfirmationModal';
import CustomerDetailsPage from './customerDetailsPage';

export default function CustomerPage() {
  const location = useLocation();
  const { user, logout, hasPermission } = useAuth();
  const { isDark } = useThemeMode();

  if (location.pathname.includes('/details')) {
    return <CustomerDetailsPage />;
  }

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedCustomerForEdit, setSelectedCustomerForEdit] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCustomerForDelete, setSelectedCustomerForDelete] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div
      className={`min-h-screen lg:h-screen lg:max-h-screen overflow-y-auto lg:overflow-hidden flex flex-col transition-colors duration-200 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
        }`}
    >
      {/* Top Navbar */}
      <Navbar user={user} logout={logout} />

      {/* Main Content */}
      <main className="flex-1 min-h-0 w-full px-3 py-3 sm:px-4 flex flex-col space-y-3 overflow-y-auto lg:overflow-hidden">
        {/* Header Banner & Filter Toolbar */}
        <div
          className={`p-3.5 sm:p-4 rounded-2xl border flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 sm:gap-4 flex-shrink-0 transition-all duration-200 ${isDark
            ? 'bg-slate-900/70 border-slate-800/80 backdrop-blur-xl shadow-xl'
            : 'bg-white border-slate-200 shadow-sm'
            }`}
        >
          {/* Header Title Banner */}
          <div className="flex items-center justify-between gap-3 flex-shrink-0">
            <div>
              <h1
                className={`text-lg sm:text-xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-950'
                  }`}
              >
                Customers Directory
              </h1>
              <p
                className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}
              >
                Manage customer loan profiles, repayment status, and contact information.
              </p>
            </div>
          </div>

          {/* Controls: Search, Status Filter & Create Action */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 flex-1 min-w-0">
            {/* Search Input */}
            <TextField
              size="small"
              placeholder="Search by name, ID, mobile..."
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
              <MenuItem value="Open">Open</MenuItem>
              <MenuItem value="Closed">Closed</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
            </TextField>

            {/* Create Customer Button */}
            {hasPermission("customer", "add") && <Button
              onClick={() => setCreateModalOpen(true)}
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
              Create Customer
            </Button>}
          </div>
        </div>

        {/* Customer Table */}
        <div className="flex-1 min-h-0 flex flex-col">
          <CustomerTable
            searchTerm={searchTerm}
            selectedStatus={selectedStatus}
            refreshTrigger={refreshTrigger}
            onEditClick={(customer) => {
              setSelectedCustomerForEdit(customer);
              setEditModalOpen(true);
            }}
            onDeleteClick={(customer) => {
              setSelectedCustomerForDelete(customer);
              setDeleteModalOpen(true);
            }}
          />
        </div>
      </main>

      {/* Modal Dialog for Customer Creation */}
      {createModalOpen && (
        <CreateCustomerModal
          open={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onSuccess={handleRefresh}
          isDark={isDark}
        />
      )}

      {/* Modal Dialog for Customer Edit */}
      {editModalOpen && (
        <EditCustomerModel
          open={editModalOpen}
          customer={selectedCustomerForEdit}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedCustomerForEdit(null);
          }}
          onSuccess={handleRefresh}
          isDark={isDark}
        />
      )}

      {/* Modal Dialog for Customer Delete */}
      {deleteModalOpen && (
        <DeleteConfirmationModal
          open={deleteModalOpen}
          customer={selectedCustomerForDelete}
          title="Delete Customer"
          onClose={() => {
            setDeleteModalOpen(false);
            setSelectedCustomerForDelete(null);
          }}
          onSuccess={handleRefresh}
          isDark={isDark}
        />
      )}
    </div>
  );
}
