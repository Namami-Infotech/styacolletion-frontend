import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  IconButton,
  Chip,
} from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';
import SecurityIcon from '@mui/icons-material/Security';
import SaveIcon from '@mui/icons-material/Save';
import AddCircleOutlinedIcon from '@mui/icons-material/AddCircleOutlined';
import EditIcon from '@mui/icons-material/Edit';

import RolePermissionMatrix, { ALL_PROJECT_MODULES, MODULE_TREE, sortPermissionsByModuleTree } from '../../../views/roles/RolePermissionMatrix';
import { useThemeMode } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { roleRoute } from '../../../routes/roles/role.route';
import { toast } from 'react-toastify';

export default function RoleFormModal({
  open = false,
  onClose = () => {},
  roleToEdit = null,
  onSuccess = () => {},
}) {
  const { isDark } = useThemeMode();
  const { fetchPermissions } = useAuth();

  const [roleName, setRoleName] = useState('');
  const [roleStatus, setRoleStatus] = useState('active');
  const [permissions, setPermissions] = useState({});
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // Initialize permissions default structure (all modules present)
  const createDefaultPermissions = () => {
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
    return defaultPerms;
  };

  useEffect(() => {
    if (roleToEdit) {
      setRoleName(roleToEdit.name || '');
      setRoleStatus(roleToEdit.status || 'active');

      // Unpack nested or flat permission object
      let loadedPerms = roleToEdit.permission;
      if (loadedPerms && loadedPerms.permission) {
        loadedPerms = loadedPerms.permission;
      }

      const mergedPerms = createDefaultPermissions();

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
              if (!mergedPerms[parentKey]) mergedPerms[parentKey] = {};
              if (!mergedPerms[parentKey][subKey]) {
                mergedPerms[parentKey][subKey] = { add: false, edit: false, delete: false, allView: false, ownView: false };
              }
              mergeFlags(mergedPerms[parentKey][subKey], node);
            } else if (parts.length === 3) {
              const [parentKey, subKey, nestedKey] = parts;
              if (!mergedPerms[parentKey]) mergedPerms[parentKey] = {};
              if (!mergedPerms[parentKey][subKey] || typeof mergedPerms[parentKey][subKey] !== 'object') {
                mergedPerms[parentKey][subKey] = {};
              }
              if (!mergedPerms[parentKey][subKey][nestedKey]) {
                mergedPerms[parentKey][subKey][nestedKey] = { add: false, edit: false, delete: false, allView: false, ownView: false };
              }
              mergeFlags(mergedPerms[parentKey][subKey][nestedKey], node);
              if (!mergedPerms[parentKey][nestedKey]) {
                mergedPerms[parentKey][nestedKey] = { add: false, edit: false, delete: false, allView: false, ownView: false };
              }
              mergeFlags(mergedPerms[parentKey][nestedKey], node);
            }
          } else if (mergedPerms[key]) {
            const isSubModuleParent =
              typeof mergedPerms[key] === 'object' &&
              !('add' in mergedPerms[key] || 'allView' in mergedPerms[key] || 'ownView' in mergedPerms[key]);

            if (isSubModuleParent) {
              Object.keys(node).forEach((subKey) => {
                const subNode = node[subKey];
                if (subNode && typeof subNode === 'object') {
                  const nestedObjectKeys = Object.keys(subNode).filter(
                    (nk) => subNode[nk] && typeof subNode[nk] === 'object' && !Array.isArray(subNode[nk])
                  );

                  if (nestedObjectKeys.length > 0) {
                    if (!mergedPerms[key][subKey] || typeof mergedPerms[key][subKey] !== 'object') {
                      mergedPerms[key][subKey] = {};
                    }
                    nestedObjectKeys.forEach((nestedKey) => {
                      const nestedNode = subNode[nestedKey];
                      if (!mergedPerms[key][subKey][nestedKey]) {
                        mergedPerms[key][subKey][nestedKey] = { add: false, edit: false, delete: false, allView: false, ownView: false };
                      }
                      mergeFlags(mergedPerms[key][subKey][nestedKey], nestedNode);
                      if (!mergedPerms[key][nestedKey]) {
                        mergedPerms[key][nestedKey] = { add: false, edit: false, delete: false, allView: false, ownView: false };
                      }
                      mergeFlags(mergedPerms[key][nestedKey], nestedNode);
                    });
                  }

                  // If subKey is a nested key inside a group (like leaveType inside leavesettings)
                  MODULE_TREE.forEach((m) => {
                    if (m.key === key && m.subModules) {
                      m.subModules.forEach((s) => {
                        if (s.subModules && s.subModules.some((n) => n.key === subKey)) {
                          if (!mergedPerms[key][s.key]) mergedPerms[key][s.key] = {};
                          if (!mergedPerms[key][s.key][subKey] || typeof mergedPerms[key][s.key][subKey] !== 'object') {
                            mergedPerms[key][s.key][subKey] = { add: false, edit: false, delete: false, allView: false, ownView: false };
                          }
                          mergeFlags(mergedPerms[key][s.key][subKey], subNode);
                        }
                      });
                    }
                  });

                  if (!mergedPerms[key][subKey] || 'add' in mergedPerms[key][subKey] || 'allView' in mergedPerms[key][subKey]) {
                    if (!mergedPerms[key][subKey]) {
                      mergedPerms[key][subKey] = { add: false, edit: false, delete: false, allView: false, ownView: false };
                    }
                    mergeFlags(mergedPerms[key][subKey], subNode);
                  }
                }
              });
            } else {
              mergeFlags(mergedPerms[key], node);
            }
          }
        });
      }
      setPermissions(sortPermissionsByModuleTree(mergedPerms));
    } else {
      setRoleName('');
      setRoleStatus('active');
      setPermissions(createDefaultPermissions());
    }
    setErrors({});
  }, [roleToEdit, open]);

  const validate = () => {
    const errs = {};
    if (!roleName.trim()) {
      errs.name = 'Role name is required';
    } else if (roleName.trim().length < 2) {
      errs.name = 'Role name must be at least 2 characters';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const sortedPayloadPermissions = sortPermissionsByModuleTree(permissions);
      const payload = {
        name: roleName.trim(),
        status: roleStatus,
        permission: sortedPayloadPermissions,
      };

      let res;
      if (roleToEdit) {
        res = await roleRoute.updateRole(roleToEdit.slug || roleToEdit.id, payload);
      } else {
        res = await roleRoute.createRole(payload);
      }

      if (res && (res.statusCode === 200 || res.statusCode === 201 || res.success)) {
        toast.success(roleToEdit ? 'Role updated successfully!' : 'Role created successfully!');
        if (typeof fetchPermissions === 'function') {
          await fetchPermissions(true);
        }
        onSuccess();
        onClose();
      }
    } catch (err) {
      console.error('Save role error:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '1rem',
          backgroundColor: isDark ? '#0f172a' : '#ffffff',
          color: isDark ? '#f8fafc' : '#0f172a',
          maxHeight: '90vh',
        },
      }}
    >
      {/* Dialog Header */}
      <DialogTitle className="flex items-center justify-between border-b px-6 py-4 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-600 flex items-center justify-center">
            {roleToEdit ? <EditIcon /> : <AddCircleOutlinedIcon />}
          </div>
          <div>
            <h2 className="text-base font-extrabold leading-tight">
              {roleToEdit ? `Edit Role: ${roleToEdit.name}` : 'Create New Role'}
            </h2>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Define role details & configure module permissions checkboxes for all project modules.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {roleToEdit && (
            <Chip
              label={`ID: ${roleToEdit.role_custom_id || roleToEdit.id}`}
              size="small"
              className="font-mono text-xs"
              color="primary"
              variant="outlined"
            />
          )}
          <IconButton onClick={onClose} size="small" className={isDark ? 'text-slate-400' : 'text-slate-500'}>
            <CloseIcon />
          </IconButton>
        </div>
      </DialogTitle>

      {/* Dialog Body */}
      <DialogContent className="px-6 py-4 space-y-6 overflow-y-auto">
        {/* Basic Metadata Fields */}
        <div className={`p-4 rounded-xl border grid grid-cols-1 md:grid-cols-2 gap-4 ${
          isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div>
            <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Role Name <span className="text-rose-500">*</span>
            </label>
            <TextField
              placeholder="e.g. Admin, Field Manager, Regional Lead"
              value={roleName}
              onChange={(e) => {
                setRoleName(e.target.value);
                if (errors.name) setErrors({ ...errors, name: null });
              }}
              fullWidth
              size="small"
              error={Boolean(errors.name)}
              helperText={errors.name}
              InputProps={{
                sx: {
                  borderRadius: '0.5rem',
                  backgroundColor: isDark ? '#0f172a' : '#ffffff',
                  color: isDark ? '#f8fafc' : '#0f172a',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  '& fieldset': {
                    borderColor: isDark ? '#334155' : '#cbd5e1',
                  },
                },
              }}
            />
          </div>

          <div>
            <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Status
            </label>
            <FormControl fullWidth size="small">
              <Select
                value={roleStatus}
                onChange={(e) => setRoleStatus(e.target.value)}
                sx={{
                  borderRadius: '0.5rem',
                  backgroundColor: isDark ? '#0f172a' : '#ffffff',
                  color: isDark ? '#f8fafc' : '#0f172a',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  '& fieldset': {
                    borderColor: isDark ? '#334155' : '#cbd5e1',
                  },
                }}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </div>
        </div>

        {/* Permission Matrix Editor */}
        <RolePermissionMatrix
          permissions={permissions}
          onChange={(newPerms) => setPermissions(newPerms)}
        />
      </DialogContent>

      {/* Dialog Footer */}
      <DialogActions className="px-6 py-4 border-t dark:border-slate-800 flex items-center justify-between">
        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Changes will apply to all users assigned to this role.
        </p>

        <div className="flex items-center gap-3">
          <Button
            onClick={onClose}
            disabled={saving}
            variant="outlined"
            size="small"
            sx={{
              borderRadius: '0.5rem',
              borderColor: isDark ? '#334155' : '#cbd5e1',
              color: isDark ? '#94a3b8' : '#475569',
            }}
          >
            Cancel
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={saving}
            variant="contained"
            size="small"
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
            sx={{
              borderRadius: '0.5rem',
              backgroundColor: '#2563eb',
              '&:hover': {
                backgroundColor: '#1d4ed8',
              },
            }}
          >
            {saving ? 'Saving Role...' : roleToEdit ? 'Update Role' : 'Create Role'}
          </Button>
        </div>
      </DialogActions>
    </Dialog>
  );
}
