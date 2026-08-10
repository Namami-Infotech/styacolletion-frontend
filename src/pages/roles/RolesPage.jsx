import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Chip,
} from '@mui/material';

import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import SecurityIcon from '@mui/icons-material/Security';
import TableChartIcon from '@mui/icons-material/TableChart';
import GridViewIcon from '@mui/icons-material/GridView';
import RefreshIcon from '@mui/icons-material/Refresh';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ExtensionIcon from '@mui/icons-material/Extension';

import Navbar from '../../components/common/Navbar';
import RolePermissionTable from '../../views/roles/RolePermissionTable';
import RolePermissionMatrix, { ALL_PROJECT_MODULES, MODULE_TREE } from '../../views/roles/RolePermissionMatrix';
import RoleFormModal from '../../components/dilogs/roles/RoleFormModal';
import { roleRoute } from '../../routes/roles/role.route';
import { useAuth } from '../../contexts/AuthContext';
import { useThemeMode } from '../../contexts/ThemeContext';
import { toast } from 'react-toastify';

export default function RolesPage() {
  const { user, logout, fetchPermissions } = useAuth();
  const { isDark } = useThemeMode();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [activeTab, setActiveTab] = useState('rolesList'); // 'rolesList' | 'matrixPreview'

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPreviewRoleId, setSelectedPreviewRoleId] = useState('');

  // Modals state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Default initial permission matrix state for live preview
  const [sampleMatrixPermissions, setSampleMatrixPermissions] = useState({});

  // Helper to unpack role permissions for preview
  const unpackRolePermissions = useCallback((role) => {
    if (!role) return {};
    let loadedPerms = role?.permission;
    if (loadedPerms && loadedPerms.permission) {
      loadedPerms = loadedPerms.permission;
    }

    const defaultPerms = {};
    MODULE_TREE.forEach((mod) => {
      if (mod.subModules && mod.subModules.length > 0) {
        defaultPerms[mod.key] = {};
        mod.subModules.forEach((sub) => {
          if (sub.subModules && sub.subModules.length > 0) {
            defaultPerms[mod.key][sub.key] = {};
            sub.subModules.forEach((nested) => {
              const emptyFlags = { add: false, edit: false, delete: false, allView: false, ownView: false };
              defaultPerms[mod.key][sub.key][nested.key] = { ...emptyFlags };
              defaultPerms[mod.key][nested.key] = { ...emptyFlags };
            });
          } else {
            defaultPerms[mod.key][sub.key] = {
              add: false,
              edit: false,
              delete: false,
              allView: false,
              ownView: false,
            };
          }
        });
      } else {
        defaultPerms[mod.key] = {
          add: false,
          edit: false,
          delete: false,
          allView: false,
          ownView: false,
        };
      }
    });

    if (loadedPerms && typeof loadedPerms === 'object') {
      const mergeFlags = (targetObj, sourceObj) => {
        if (!sourceObj || typeof sourceObj !== 'object') return;
        ['add', 'edit', 'delete', 'allView', 'ownView'].forEach((actionKey) => {
          if (actionKey in sourceObj) {
            targetObj[actionKey] = Boolean(targetObj[actionKey] || sourceObj[actionKey]);
          }
        });
      };

      Object.keys(loadedPerms).forEach((key) => {
        const node = loadedPerms[key];
        if (!node || typeof node !== 'object') return;

        if (key.includes('.')) {
          const parts = key.split('.');
          if (parts.length === 2) {
            const [parentKey, subKey] = parts;
            if (!defaultPerms[parentKey]) defaultPerms[parentKey] = {};
            if (!defaultPerms[parentKey][subKey]) {
              defaultPerms[parentKey][subKey] = { add: false, edit: false, delete: false, allView: false, ownView: false };
            }
            mergeFlags(defaultPerms[parentKey][subKey], node);
          } else if (parts.length === 3) {
            const [parentKey, subKey, nestedKey] = parts;
            if (!defaultPerms[parentKey]) defaultPerms[parentKey] = {};
            if (!defaultPerms[parentKey][subKey] || typeof defaultPerms[parentKey][subKey] !== 'object') {
              defaultPerms[parentKey][subKey] = {};
            }
            if (!defaultPerms[parentKey][subKey][nestedKey]) {
              defaultPerms[parentKey][subKey][nestedKey] = { add: false, edit: false, delete: false, allView: false, ownView: false };
            }
            mergeFlags(defaultPerms[parentKey][subKey][nestedKey], node);
            if (!defaultPerms[parentKey][nestedKey]) {
              defaultPerms[parentKey][nestedKey] = { add: false, edit: false, delete: false, allView: false, ownView: false };
            }
            mergeFlags(defaultPerms[parentKey][nestedKey], node);
          }
        } else if (defaultPerms[key]) {
          const isSubModuleParent =
            typeof defaultPerms[key] === 'object' &&
            !('add' in defaultPerms[key] || 'allView' in defaultPerms[key] || 'ownView' in defaultPerms[key]);

          if (isSubModuleParent) {
            Object.keys(node).forEach((subKey) => {
              const subNode = node[subKey];
              if (subNode && typeof subNode === 'object') {
                const nestedObjectKeys = Object.keys(subNode).filter(
                  (nk) => subNode[nk] && typeof subNode[nk] === 'object' && !Array.isArray(subNode[nk])
                );

                if (nestedObjectKeys.length > 0) {
                  if (!defaultPerms[key][subKey] || typeof defaultPerms[key][subKey] !== 'object') {
                    defaultPerms[key][subKey] = {};
                  }
                  nestedObjectKeys.forEach((nestedKey) => {
                    const nestedNode = subNode[nestedKey];
                    if (!defaultPerms[key][subKey][nestedKey]) {
                      defaultPerms[key][subKey][nestedKey] = { add: false, edit: false, delete: false, allView: false, ownView: false };
                    }
                    mergeFlags(defaultPerms[key][subKey][nestedKey], nestedNode);
                    if (!defaultPerms[key][nestedKey]) {
                      defaultPerms[key][nestedKey] = { add: false, edit: false, delete: false, allView: false, ownView: false };
                    }
                    mergeFlags(defaultPerms[key][nestedKey], nestedNode);
                  });
                }

                MODULE_TREE.forEach((m) => {
                  if (m.key === key && m.subModules) {
                    m.subModules.forEach((s) => {
                      if (s.subModules && s.subModules.some((n) => n.key === subKey)) {
                        if (!defaultPerms[key][s.key]) defaultPerms[key][s.key] = {};
                        if (!defaultPerms[key][s.key][subKey] || typeof defaultPerms[key][s.key][subKey] !== 'object') {
                          defaultPerms[key][s.key][subKey] = { add: false, edit: false, delete: false, allView: false, ownView: false };
                        }
                        mergeFlags(defaultPerms[key][s.key][subKey], subNode);
                      }
                    });
                  }
                });

                if (!defaultPerms[key][subKey] || 'add' in defaultPerms[key][subKey] || 'allView' in defaultPerms[key][subKey]) {
                  if (!defaultPerms[key][subKey]) {
                    defaultPerms[key][subKey] = { add: false, edit: false, delete: false, allView: false, ownView: false };
                  }
                  mergeFlags(defaultPerms[key][subKey], subNode);
                }
              }
            });
          } else {
            mergeFlags(defaultPerms[key], node);
          }
        }
      });
    }

    return defaultPerms;
  }, []);

  // Helper to compute granted permissions count for a role
  const getRoleGrantedCount = useCallback((role) => {
    if (!role) return { granted: 0, total: 70, percent: 0 };
    const perms = unpackRolePermissions(role);
    let granted = 0;
    let total = 0;
    MODULE_TREE.forEach((mod) => {
      if (mod.subModules && mod.subModules.length > 0) {
        mod.subModules.forEach((sub) => {
          const allowed = sub.actions || mod.actions || ['add', 'edit', 'delete', 'allView', 'ownView'];
          total += allowed.length;
          const p = perms[mod.key]?.[sub.key] || {};
          allowed.forEach((k) => {
            if (p[k]) granted++;
          });
        });
      } else {
        const allowed = mod.actions || ['add', 'edit', 'delete', 'allView', 'ownView'];
        total += allowed.length;
        const p = perms[mod.key] || {};
        allowed.forEach((k) => {
          if (p[k]) granted++;
        });
      }
    });
    return {
      granted,
      total,
      percent: Math.round((granted / (total || 1)) * 100),
    };
  }, [unpackRolePermissions]);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await roleRoute.getAllRoles({
        search: searchTerm,
        status: selectedStatus === 'All' ? '' : selectedStatus.toLowerCase(),
      });

      if (res && (res.success || res.statusCode === 200) && res.data) {
        const list = res.data.roles || (Array.isArray(res.data) ? res.data : []);
        setRoles(list);
      } else {
        setRoles([]);
      }
    } catch (err) {
      console.error('Fetch roles error:', err);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedStatus]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  // Sync selected role permissions when roles or selectedPreviewRoleId change
  useEffect(() => {
    if (roles.length > 0) {
      const activeRole = roles.find((r) => String(r.id) === String(selectedPreviewRoleId)) || roles[0];
      if (activeRole) {
        if (selectedPreviewRoleId !== activeRole.id) {
          setSelectedPreviewRoleId(activeRole.id);
        }
        setSampleMatrixPermissions(unpackRolePermissions(activeRole));
      }
    }
  }, [roles, selectedPreviewRoleId, unpackRolePermissions]);

  useEffect(() => {
    const handleAdminAdd = (e) => {
      if (!e.detail?.section || e.detail.section === 'role') {
        setSelectedRole(null);
        setFormModalOpen(true);
      }
    };
    window.addEventListener('admin-open-create-modal', handleAdminAdd);
    return () => window.removeEventListener('admin-open-create-modal', handleAdminAdd);
  }, []);

  const handleOpenCreateModal = () => {
    setSelectedRole(null);
    setFormModalOpen(true);
  };

  const handleEditClick = (role) => {
    setSelectedRole(role);
    setFormModalOpen(true);
  };

  const handleDeleteClick = (role) => {
    setRoleToDelete(role);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!roleToDelete) return;
    setDeleteLoading(true);
    try {
      const res = await roleRoute.deleteRole(roleToDelete.slug || roleToDelete.id);
      if (res && (res.success || res.statusCode === 200)) {
        toast.success(`Role '${roleToDelete.name}' deleted successfully!`);
        if (typeof fetchPermissions === 'function') {
          fetchPermissions(true);
        }
        fetchRoles();
        setDeleteModalOpen(false);
        setRoleToDelete(null);
      }
    } catch (err) {
      console.error('Delete role error:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Filtered roles based on search and status filter
  const filteredRoles = useMemo(() => {
    return roles.filter((role) => {
      const matchSearch =
        !searchTerm ||
        role.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.slug?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.role_custom_id?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus =
        selectedStatus === 'All' ||
        (selectedStatus === 'Active' && role.status === 'active') ||
        (selectedStatus === 'Inactive' && role.status !== 'active');

      return matchSearch && matchStatus;
    });
  }, [roles, searchTerm, selectedStatus]);

  // Stats calculation
  const totalRoles = roles.length;
  const activeRolesCount = roles.filter((r) => r.status === 'active').length;
  const totalModulesCount = ALL_PROJECT_MODULES.length;

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-[#f4f6f9] text-slate-900'
    }`}>
      {/* Top Navbar */}
      <Navbar user={user} logout={logout} />

      {/* Main Container */}
      <main className="flex-1 flex flex-col min-h-0 w-full">
        {/* Sub-header Title & Navigation */}
        <div className={`px-3 sm:px-4 py-2 border-b flex flex-wrap items-center justify-between gap-2.5 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
              <SecurityIcon sx={{ fontSize: 18 }} />
            </div>
            <div>
              <h1 className={`text-sm sm:text-base font-extrabold leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Roles & Permissions
              </h1>
              <p className={`text-[11px] font-semibold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                Access Control & Module Permission Matrix
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Refresh Button */}
            <Button
              onClick={fetchRoles}
              variant="outlined"
              size="small"
              startIcon={<RefreshIcon />}
              sx={{
                borderRadius: '0.5rem',
                borderColor: isDark ? '#334155' : '#cbd5e1',
                color: isDark ? '#cbd5e1' : '#475569',
                textTransform: 'none',
                fontSize: '0.75rem',
              }}
            >
              Refresh
            </Button>

            {/* Add Role Button */}
            <Button
              onClick={handleOpenCreateModal}
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              sx={{
                borderRadius: '0.5rem',
                backgroundColor: '#2563eb',
                '&:hover': { backgroundColor: '#1d4ed8' },
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.75rem',
              }}
            >
              Add New Role
            </Button>
          </div>
        </div>

        <div className="p-3 sm:p-4 space-y-3.5 w-full">
        {/* KPI Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Card 1: Total Roles */}
          <div className={`p-3 sm:p-3.5 rounded-xl border flex items-center justify-between shadow-2xs ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div>
              <p className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total Roles Defined</p>
              <h3 className="text-xl sm:text-2xl font-black mt-0.5 text-blue-600 dark:text-blue-400">{totalRoles}</h3>
              <span className={`text-[10px] font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>System & Custom Roles</span>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <AdminPanelSettingsIcon sx={{ fontSize: 24 }} />
            </div>
          </div>

          {/* Card 2: Active Roles */}
          <div className={`p-3 sm:p-3.5 rounded-xl border flex items-center justify-between shadow-2xs ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div>
              <p className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Active Roles</p>
              <h3 className="text-xl sm:text-2xl font-black mt-0.5 text-emerald-600 dark:text-emerald-400">{activeRolesCount}</h3>
              <span className={`text-[10px] font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Operational Access Rules</span>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <CheckCircleIcon sx={{ fontSize: 24 }} />
            </div>
          </div>

          {/* Card 3: Project Modules */}
          <div className={`p-3 sm:p-3.5 rounded-xl border flex items-center justify-between shadow-2xs ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div>
              <p className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Project Modules</p>
              <h3 className="text-xl sm:text-2xl font-black mt-0.5 text-purple-600 dark:text-purple-400">{totalModulesCount}</h3>
              <span className={`text-[10px] font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Feeds, Tasks, Office, etc.</span>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              <ExtensionIcon sx={{ fontSize: 24 }} />
            </div>
          </div>

          {/* Card 4: Permission Matrix Checkboxes */}
          <div className={`p-3 sm:p-3.5 rounded-xl border flex items-center justify-between shadow-2xs ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div>
              <p className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Checkboxes per Module</p>
              <h3 className="text-xl sm:text-2xl font-black mt-0.5 text-amber-600 dark:text-amber-400">5 Options</h3>
              <span className={`text-[10px] font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Add, Edit, Delete, All/Own View</span>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <SecurityIcon sx={{ fontSize: 24 }} />
            </div>
          </div>
        </div>

        {/* View Toggle Tabs & Search Controls */}
        <div className={`p-3 rounded-xl border flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          {/* Tab Switcher */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border dark:border-slate-700/60 w-full md:w-auto">
            <button
              onClick={() => setActiveTab('rolesList')}
              className={`flex-1 md:flex-initial px-4 py-2 text-xs font-extrabold rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'rolesList'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : isDark
                  ? 'text-slate-400 hover:text-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableChartIcon sx={{ fontSize: 16 }} />
              All Saved Roles List
            </button>
            <button
              onClick={() => setActiveTab('matrixPreview')}
              className={`flex-1 md:flex-initial px-4 py-2 text-xs font-extrabold rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'matrixPreview'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : isDark
                  ? 'text-slate-400 hover:text-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GridViewIcon sx={{ fontSize: 16 }} />
              Live Module Permission Matrix
            </button>
          </div>

          {/* Search & Filters */}
          {activeTab === 'rolesList' && (
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="w-full sm:w-60">
                <TextField
                  placeholder="Search role name or custom ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  size="small"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon className={isDark ? 'text-slate-400' : 'text-slate-500'} sx={{ fontSize: 18 }} />
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: '0.5rem',
                      fontSize: '0.8rem',
                      backgroundColor: isDark ? '#0f172a' : '#ffffff',
                      color: isDark ? '#f8fafc' : '#0f172a',
                      '& fieldset': {
                        borderColor: isDark ? '#334155' : '#cbd5e1',
                      },
                    },
                  }}
                />
              </div>

              <div className="w-full sm:w-36">
                <TextField
                  select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  size="small"
                  fullWidth
                  InputProps={{
                    sx: {
                      borderRadius: '0.5rem',
                      fontSize: '0.8rem',
                      backgroundColor: isDark ? '#0f172a' : '#ffffff',
                      color: isDark ? '#f8fafc' : '#0f172a',
                      '& fieldset': {
                        borderColor: isDark ? '#334155' : '#cbd5e1',
                      },
                    },
                  }}
                >
                  <MenuItem value="All">All Status</MenuItem>
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                </TextField>
              </div>
            </div>
          )}
        </div>

        {/* Tab 1: Roles List Table */}
        {activeTab === 'rolesList' && (
          <RolePermissionTable
            roles={filteredRoles}
            loading={loading}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteClick}
            onEditRole={handleEditClick}
            onDeleteRole={handleDeleteClick}
          />
        )}

        {/* Tab 2: Live Interactive Permission Matrix Sandbox */}
        {activeTab === 'matrixPreview' && (
          <div className="space-y-4">
            {/* Live Role Selector Bar */}
            <div
              className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <AdminPanelSettingsIcon sx={{ fontSize: 22 }} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold leading-tight">Select Saved Role to Inspect Matrix</h3>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Choose any system or custom role to view its exact module & sub-module permissions live.
                  </p>
                </div>
              </div>

              <div className="w-full sm:w-72">
                <TextField
                  select
                  label="Selected Role"
                  value={selectedPreviewRoleId}
                  onChange={(e) => {
                    const rId = e.target.value;
                    setSelectedPreviewRoleId(rId);
                    const found = roles.find((r) => String(r.id) === String(rId));
                    if (found) {
                      setSampleMatrixPermissions(unpackRolePermissions(found));
                    }
                  }}
                  size="small"
                  fullWidth
                  InputProps={{
                    sx: {
                      borderRadius: '0.5rem',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      backgroundColor: isDark ? '#0f172a' : '#ffffff',
                      color: isDark ? '#f8fafc' : '#0f172a',
                      '& fieldset': {
                        borderColor: isDark ? '#334155' : '#cbd5e1',
                      },
                    },
                  }}
                >
                  {roles.map((r) => {
                    const stats = getRoleGrantedCount(r);
                    return (
                      <MenuItem key={r.id} value={r.id}>
                        <div className="flex items-center justify-between w-full font-semibold text-xs py-0.5 gap-4">
                          <span className="font-extrabold">{r.name}</span>
                          <div className="flex items-center gap-1.5 font-mono text-[10px]">
                            <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold border border-blue-500/20">
                              {stats.granted} / {stats.total} True ({stats.percent}%)
                            </span>
                          </div>
                        </div>
                      </MenuItem>
                    );
                  })}
                </TextField>
              </div>
            </div>

            <RolePermissionMatrix
              permissions={sampleMatrixPermissions}
              onChange={(updated) => setSampleMatrixPermissions(updated)}
            />
          </div>
        )}
        </div>
      </main>

      {/* Role Create / Edit Modal */}
      <RoleFormModal
        open={formModalOpen}
        onClose={() => {
          setFormModalOpen(false);
          setSelectedRole(null);
        }}
        roleToEdit={selectedRole}
        onSuccess={() => {
          fetchRoles();
          setSelectedRole(null);
        }}
      />

      {/* Delete Confirmation Modal */}
      <Dialog
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '1rem',
            backgroundColor: isDark ? '#0f172a' : '#ffffff',
            color: isDark ? '#f8fafc' : '#0f172a',
          },
        }}
      >
        <DialogTitle className="font-bold border-b dark:border-slate-800">
          Confirm Delete Role
        </DialogTitle>
        <DialogContent className="pt-4">
          <p className="text-sm">
            Are you sure you want to delete role{' '}
            <strong className="text-rose-500">{roleToDelete?.name}</strong>?
            This action cannot be undone and will revoke access for all associated users.
          </p>
        </DialogContent>
        <DialogActions className="p-4 border-t dark:border-slate-800 flex items-center justify-end gap-2">
          <Button onClick={() => setDeleteModalOpen(false)} disabled={deleteLoading} size="small">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            disabled={deleteLoading}
            color="error"
            variant="contained"
            size="small"
            startIcon={deleteLoading && <CircularProgress size={14} color="inherit" />}
          >
            {deleteLoading ? 'Deleting...' : 'Delete Role'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
