import React, { useState } from 'react';
import {
  Checkbox,
  Tooltip,
  TextField,
  InputAdornment,
  Chip,
  MenuItem,
} from '@mui/material';

import SecurityIcon from '@mui/icons-material/Security';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import SelectAllIcon from '@mui/icons-material/SelectAll';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight';

import { useThemeMode } from '../../contexts/ThemeContext';
import { DEFAULT_ACTIONS, MODULE_TREE, sortPermissionsByModuleTree } from './moduleTree';

export { DEFAULT_ACTIONS, MODULE_TREE, sortPermissionsByModuleTree };


export const getItemAllowedActions = (parentKey, subKey = null, nestedKey = null) => {
  const mod = MODULE_TREE.find((m) => m.key === parentKey);
  if (!mod) return DEFAULT_ACTIONS;
  if (subKey && mod.subModules) {
    const sub = mod.subModules.find((s) => s.key === subKey);
    if (sub) {
      if (nestedKey && sub.subModules) {
        const nested = sub.subModules.find((n) => n.key === nestedKey);
        if (nested) {
          return nested.actions || sub.actions || mod.actions || DEFAULT_ACTIONS;
        }
      }
      return sub.actions || mod.actions || DEFAULT_ACTIONS;
    }
  }
  return mod.actions || DEFAULT_ACTIONS;
};

// Flat export for backwards compatibility
export const ALL_PROJECT_MODULES = MODULE_TREE.flatMap((mod) => {
  if (mod.subModules && mod.subModules.length > 0) {
    return mod.subModules.flatMap((sub) => {
      if (sub.subModules && sub.subModules.length > 0) {
        return sub.subModules.map((nested) => ({
          key: `${mod.key}.${sub.key}.${nested.key}`,
          parentKey: mod.key,
          subKey: sub.key,
          nestedKey: nested.key,
          name: `${mod.name} - ${sub.name} - ${nested.name}`,
          category: mod.category,
          description: nested.description,
          icon: mod.icon,
          accentColor: mod.accentColor,
          actions: nested.actions || sub.actions || mod.actions || DEFAULT_ACTIONS,
        }));
      }
      return [{
        key: `${mod.key}.${sub.key}`,
        parentKey: mod.key,
        subKey: sub.key,
        name: `${mod.name} - ${sub.name}`,
        category: mod.category,
        description: sub.description,
        icon: mod.icon,
        accentColor: mod.accentColor,
        actions: sub.actions || mod.actions || DEFAULT_ACTIONS,
      }];
    });
  }
  return [{
    ...mod,
    actions: mod.actions || DEFAULT_ACTIONS,
  }];
});

export const PERMISSION_COLUMNS = [
  { key: 'add', label: 'Add', badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  { key: 'edit', label: 'Edit', badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' },
  { key: 'delete', label: 'Delete', badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' },
  { key: 'allView', label: 'All View', badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
  { key: 'ownView', label: 'Own View', badge: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' },
];

export default function RolePermissionMatrix({
  permissions = {},
  onChange = () => { },
  isReadOnly = false,
  roles = [],
  selectedRoleId,
  onRoleChange,
  getRoleGrantedCount,
}) {
  const { isDark } = useThemeMode();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Track expanded parent modules (collapsed by default)
  const [expanded, setExpanded] = useState(() => {
    const initial = {};
    MODULE_TREE.forEach((mod) => {
      if (mod.subModules && mod.subModules.length > 0) {
        initial[mod.key] = false; // collapsed by default
        mod.subModules.forEach((sub) => {
          if (sub.subModules && sub.subModules.length > 0) {
            initial[`${mod.key}.${sub.key}`] = true;
          }
        });
      }
    });
    return initial;
  });

  const toggleExpand = (parentKey) => {
    setExpanded((prev) => ({
      ...prev,
      [parentKey]: !prev[parentKey],
    }));
  };

  const handleExpandAll = (shouldExpand) => {
    const next = {};
    MODULE_TREE.forEach((mod) => {
      if (mod.subModules && mod.subModules.length > 0) {
        next[mod.key] = shouldExpand;
        mod.subModules.forEach((sub) => {
          if (sub.subModules && sub.subModules.length > 0) {
            next[`${mod.key}.${sub.key}`] = shouldExpand;
          }
        });
      }
    });
    setExpanded(next);
  };

  // Helper to read safe permission object for a flat module or sub-module
  const getPermObj = (parentKey, subKey = null, nestedKey = null) => {
    const allowed = getItemAllowedActions(parentKey, subKey, nestedKey);
    let raw = { add: false, edit: false, delete: false, allView: false, ownView: false };

    if (nestedKey) {
      const deepPerm = permissions[parentKey]?.[subKey]?.[nestedKey]
        || permissions[parentKey]?.[nestedKey]
        || permissions[`${parentKey}.${subKey}.${nestedKey}`]
        || permissions[`${parentKey}.${nestedKey}`]
        || permissions[`${subKey}.${nestedKey}`]
        || permissions[nestedKey];

      if (deepPerm && typeof deepPerm === 'object') {
        raw = {
          add: Boolean(deepPerm.add),
          edit: Boolean(deepPerm.edit),
          delete: Boolean(deepPerm.delete),
          allView: Boolean(deepPerm.allView),
          ownView: Boolean(deepPerm.ownView),
        };
      }
    } else if (subKey) {
      const nestedSub = permissions[parentKey]?.[subKey];
      const flatDotSub = permissions[`${parentKey}.${subKey}`];
      const directSub = permissions[subKey];

      if (nestedSub || flatDotSub || directSub) {
        raw = {
          add: Boolean(nestedSub?.add || flatDotSub?.add || directSub?.add),
          edit: Boolean(nestedSub?.edit || flatDotSub?.edit || directSub?.edit),
          delete: Boolean(nestedSub?.delete || flatDotSub?.delete || directSub?.delete),
          allView: Boolean(nestedSub?.allView || flatDotSub?.allView || directSub?.allView),
          ownView: Boolean(nestedSub?.ownView || flatDotSub?.ownView || directSub?.ownView),
        };
      } else {
        const parentPerm = permissions[parentKey];
        if (
          parentPerm &&
          typeof parentPerm === 'object' &&
          ('add' in parentPerm || 'allView' in parentPerm || 'ownView' in parentPerm)
        ) {
          raw = {
            add: Boolean(parentPerm.add),
            edit: Boolean(parentPerm.edit),
            delete: Boolean(parentPerm.delete),
            allView: Boolean(parentPerm.allView),
            ownView: Boolean(parentPerm.ownView),
          };
        }
      }
    } else {
      const target = permissions[parentKey];
      if (target && typeof target === 'object') {
        raw = {
          add: Boolean(target.add),
          edit: Boolean(target.edit),
          delete: Boolean(target.delete),
          allView: Boolean(target.allView),
          ownView: Boolean(target.ownView),
        };
      }
    }

    // Only keep allowed actions as boolean, others remain false
    const result = { add: false, edit: false, delete: false, allView: false, ownView: false };
    allowed.forEach((actKey) => {
      result[actKey] = raw[actKey];
    });
    return result;
  };

  // Toggle single permission checkbox
  const handleToggleSingle = (parentKey, subKey, nestedKeyOrPermKey, permKeyParam = null) => {
    if (isReadOnly) return;
    let nestedKey = null;
    let permKey = nestedKeyOrPermKey;

    if (permKeyParam) {
      nestedKey = nestedKeyOrPermKey;
      permKey = permKeyParam;
    }

    const allowed = getItemAllowedActions(parentKey, subKey, nestedKey);
    if (!allowed.includes(permKey)) return;

    const current = getPermObj(parentKey, subKey, nestedKey);
    const newValue = !current[permKey];

    const updatedNode = {
      ...current,
      [permKey]: newValue,
    };

    if (permKey === 'allView' && allowed.includes('ownView')) {
      if (newValue) updatedNode.ownView = true;
    } else if (permKey === 'ownView' && allowed.includes('allView')) {
      if (!newValue) updatedNode.allView = false;
    }

    const updatedPermissions = { ...permissions };

    if (nestedKey) {
      const parentObj =
        typeof updatedPermissions[parentKey] === 'object' && updatedPermissions[parentKey] !== null
          ? { ...updatedPermissions[parentKey] }
          : {};
      const subObj =
        typeof parentObj[subKey] === 'object' && parentObj[subKey] !== null
          ? { ...parentObj[subKey] }
          : {};

      subObj[nestedKey] = updatedNode;
      parentObj[subKey] = subObj;
      parentObj[nestedKey] = updatedNode;
      updatedPermissions[parentKey] = parentObj;
    } else if (subKey) {
      delete updatedPermissions[`${parentKey}.${subKey}`];
      delete updatedPermissions[subKey];

      const parentObj =
        typeof updatedPermissions[parentKey] === 'object' && updatedPermissions[parentKey] !== null
          ? { ...updatedPermissions[parentKey] }
          : {};

      parentObj[subKey] = updatedNode;
      updatedPermissions[parentKey] = parentObj;
    } else {
      updatedPermissions[parentKey] = updatedNode;
    }

    onChange(updatedPermissions);
  };

  // Toggle column for parent module (applies action to ALL its sub-modules that allow this action)
  const handleToggleParentColumn = (parentMod, permKey) => {
    if (isReadOnly) return;
    const subMods = parentMod.subModules || [];
    if (subMods.length === 0) return;

    let isAllChecked = true;
    let applicableCount = 0;

    subMods.forEach((sub) => {
      if (sub.subModules && sub.subModules.length > 0) {
        sub.subModules.forEach((nested) => {
          if (getItemAllowedActions(parentMod.key, sub.key, nested.key).includes(permKey)) {
            applicableCount++;
            if (!getPermObj(parentMod.key, sub.key, nested.key)[permKey]) isAllChecked = false;
          }
        });
      } else {
        if (getItemAllowedActions(parentMod.key, sub.key).includes(permKey)) {
          applicableCount++;
          if (!getPermObj(parentMod.key, sub.key)[permKey]) isAllChecked = false;
        }
      }
    });

    if (applicableCount === 0) return;
    const targetValue = !isAllChecked;

    const updatedPermissions = { ...permissions };
    const parentObj =
      typeof updatedPermissions[parentMod.key] === 'object' && updatedPermissions[parentMod.key] !== null
        ? { ...updatedPermissions[parentMod.key] }
        : {};

    subMods.forEach((sub) => {
      delete updatedPermissions[`${parentMod.key}.${sub.key}`];
      delete updatedPermissions[sub.key];

      if (sub.subModules && sub.subModules.length > 0) {
        const subObj = typeof parentObj[sub.key] === 'object' && parentObj[sub.key] !== null ? { ...parentObj[sub.key] } : {};
        sub.subModules.forEach((nested) => {
          const allowed = getItemAllowedActions(parentMod.key, sub.key, nested.key);
          const cur = getPermObj(parentMod.key, sub.key, nested.key);
          if (allowed.includes(permKey)) {
            const updatedNested = { ...cur, [permKey]: targetValue };
            if (permKey === 'allView' && targetValue && allowed.includes('ownView')) updatedNested.ownView = true;
            else if (permKey === 'ownView' && !targetValue && allowed.includes('allView')) updatedNested.allView = false;
            subObj[nested.key] = updatedNested;
            parentObj[nested.key] = updatedNested;
          } else {
            subObj[nested.key] = cur;
          }
        });
        parentObj[sub.key] = subObj;
      } else {
        const allowed = getItemAllowedActions(parentMod.key, sub.key);
        const cur = getPermObj(parentMod.key, sub.key);
        if (allowed.includes(permKey)) {
          const updatedSub = { ...cur, [permKey]: targetValue };
          if (permKey === 'allView' && targetValue && allowed.includes('ownView')) updatedSub.ownView = true;
          else if (permKey === 'ownView' && !targetValue && allowed.includes('allView')) updatedSub.allView = false;
          parentObj[sub.key] = updatedSub;
        } else {
          parentObj[sub.key] = cur;
        }
      }
    });

    updatedPermissions[parentMod.key] = parentObj;
    onChange(updatedPermissions);
  };

  // Toggle ALL permissions for a parent module row (applies all allowed actions across ALL sub-modules)
  const handleToggleParentRow = (parentMod) => {
    if (isReadOnly) return;
    const subMods = parentMod.subModules || [];

    let isAllMasterChecked = true;
    subMods.forEach((sub) => {
      if (sub.subModules && sub.subModules.length > 0) {
        sub.subModules.forEach((nested) => {
          const allowed = getItemAllowedActions(parentMod.key, sub.key, nested.key);
          const cur = getPermObj(parentMod.key, sub.key, nested.key);
          if (!allowed.every((actKey) => cur[actKey])) isAllMasterChecked = false;
        });
      } else {
        const allowed = getItemAllowedActions(parentMod.key, sub.key);
        const cur = getPermObj(parentMod.key, sub.key);
        if (!allowed.every((actKey) => cur[actKey])) isAllMasterChecked = false;
      }
    });

    const targetValue = !isAllMasterChecked;

    const updatedPermissions = { ...permissions };
    const parentObj =
      typeof updatedPermissions[parentMod.key] === 'object' && updatedPermissions[parentMod.key] !== null
        ? { ...updatedPermissions[parentMod.key] }
        : {};

    subMods.forEach((sub) => {
      delete updatedPermissions[`${parentMod.key}.${sub.key}`];
      delete updatedPermissions[sub.key];

      if (sub.subModules && sub.subModules.length > 0) {
        const subObj = typeof parentObj[sub.key] === 'object' && parentObj[sub.key] !== null ? { ...parentObj[sub.key] } : {};
        sub.subModules.forEach((nested) => {
          const allowed = getItemAllowedActions(parentMod.key, sub.key, nested.key);
          const targetState = { add: false, edit: false, delete: false, allView: false, ownView: false };
          allowed.forEach((actKey) => { targetState[actKey] = targetValue; });
          subObj[nested.key] = targetState;
          parentObj[nested.key] = targetState;
        });
        parentObj[sub.key] = subObj;
      } else {
        const allowed = getItemAllowedActions(parentMod.key, sub.key);
        const subState = { add: false, edit: false, delete: false, allView: false, ownView: false };
        allowed.forEach((actKey) => {
          subState[actKey] = targetValue;
        });
        parentObj[sub.key] = subState;
      }
    });

    updatedPermissions[parentMod.key] = parentObj;
    onChange(updatedPermissions);
  };

  // Toggle row for flat single module
  const handleToggleFlatRow = (modKey) => {
    if (isReadOnly) return;
    const allowed = getItemAllowedActions(modKey);
    const current = getPermObj(modKey);
    const isAllChecked = allowed.every((actKey) => current[actKey]);
    const targetValue = !isAllChecked;

    const targetState = { add: false, edit: false, delete: false, allView: false, ownView: false };
    allowed.forEach((actKey) => {
      targetState[actKey] = targetValue;
    });

    onChange({
      ...permissions,
      [modKey]: targetState,
    });
  };

  // Toggle global column across ALL modules and sub-modules where action is allowed
  const handleToggleGlobalColumn = (permKey) => {
    if (isReadOnly) return;
    let isAllGlobalChecked = true;
    let applicableCount = 0;

    MODULE_TREE.forEach((mod) => {
      if (mod.subModules && mod.subModules.length > 0) {
        mod.subModules.forEach((sub) => {
          if (sub.subModules && sub.subModules.length > 0) {
            sub.subModules.forEach((nested) => {
              if (getItemAllowedActions(mod.key, sub.key, nested.key).includes(permKey)) {
                applicableCount++;
                if (!getPermObj(mod.key, sub.key, nested.key)[permKey]) isAllGlobalChecked = false;
              }
            });
          } else {
            if (getItemAllowedActions(mod.key, sub.key).includes(permKey)) {
              applicableCount++;
              if (!getPermObj(mod.key, sub.key)[permKey]) isAllGlobalChecked = false;
            }
          }
        });
      } else {
        if (getItemAllowedActions(mod.key).includes(permKey)) {
          applicableCount++;
          if (!getPermObj(mod.key)[permKey]) isAllGlobalChecked = false;
        }
      }
    });

    if (applicableCount === 0) return;

    const targetValue = !isAllGlobalChecked;
    const nextPermissions = { ...permissions };

    MODULE_TREE.forEach((mod) => {
      if (mod.subModules && mod.subModules.length > 0) {
        const parentObj =
          typeof nextPermissions[mod.key] === 'object' && nextPermissions[mod.key] !== null
            ? { ...nextPermissions[mod.key] }
            : {};

        mod.subModules.forEach((sub) => {
          delete nextPermissions[`${mod.key}.${sub.key}`];
          delete nextPermissions[sub.key];

          if (sub.subModules && sub.subModules.length > 0) {
            const subObj = typeof parentObj[sub.key] === 'object' && parentObj[sub.key] !== null ? { ...parentObj[sub.key] } : {};
            sub.subModules.forEach((nested) => {
              const allowed = getItemAllowedActions(mod.key, sub.key, nested.key);
              const cur = getPermObj(mod.key, sub.key, nested.key);
              if (allowed.includes(permKey)) {
                const updatedNested = { ...cur, [permKey]: targetValue };
                if (permKey === 'allView' && targetValue && allowed.includes('ownView')) updatedNested.ownView = true;
                else if (permKey === 'ownView' && !targetValue && allowed.includes('allView')) updatedNested.allView = false;
                subObj[nested.key] = updatedNested;
                parentObj[nested.key] = updatedNested;
              } else {
                subObj[nested.key] = cur;
              }
            });
            parentObj[sub.key] = subObj;
          } else {
            const allowed = getItemAllowedActions(mod.key, sub.key);
            const cur = getPermObj(mod.key, sub.key);
            if (allowed.includes(permKey)) {
              const updatedSub = { ...cur, [permKey]: targetValue };
              if (permKey === 'allView' && targetValue && allowed.includes('ownView')) updatedSub.ownView = true;
              else if (permKey === 'ownView' && !targetValue && allowed.includes('allView')) updatedSub.allView = false;
              parentObj[sub.key] = updatedSub;
            } else {
              parentObj[sub.key] = cur;
            }
          }
        });
        nextPermissions[mod.key] = parentObj;
      } else {
        const allowed = getItemAllowedActions(mod.key);
        const cur = getPermObj(mod.key);
        if (allowed.includes(permKey)) {
          const updatedMod = { ...cur, [permKey]: targetValue };
          if (permKey === 'allView' && targetValue && allowed.includes('ownView')) updatedMod.ownView = true;
          else if (permKey === 'ownView' && !targetValue && allowed.includes('allView')) updatedMod.allView = false;
          nextPermissions[mod.key] = updatedMod;
        } else {
          nextPermissions[mod.key] = cur;
        }
      }
    });

    onChange(nextPermissions);
  };

  // Quick Preset Actions
  const handleApplyPreset = (presetType) => {
    if (isReadOnly) return;
    const nextPermissions = {};

    const buildState = (parentKey, subKey, nestedKey, modCategory) => {
      const allowed = getItemAllowedActions(parentKey, subKey, nestedKey);
      const state = { add: false, edit: false, delete: false, allView: false, ownView: false };

      if (presetType === 'full') {
        allowed.forEach((actKey) => { state[actKey] = true; });
      } else if (presetType === 'viewOnly') {
        if (allowed.includes('allView')) state.allView = true;
        if (allowed.includes('ownView')) state.ownView = true;
      } else if (presetType === 'standard') {
        const isSystem = modCategory === 'System';
        if (!isSystem && allowed.includes('add')) state.add = true;
        if (!isSystem && allowed.includes('edit')) state.edit = true;
        if (allowed.includes('allView')) state.allView = true;
        if (allowed.includes('ownView')) state.ownView = true;
      }
      return state;
    };

    MODULE_TREE.forEach((mod) => {
      if (mod.subModules && mod.subModules.length > 0) {
        const parentObj = {};
        mod.subModules.forEach((sub) => {
          if (sub.subModules && sub.subModules.length > 0) {
            const subObj = {};
            sub.subModules.forEach((nested) => {
              const state = buildState(mod.key, sub.key, nested.key, mod.category);
              subObj[nested.key] = state;
              parentObj[nested.key] = state;
            });
            parentObj[sub.key] = subObj;
          } else {
            parentObj[sub.key] = buildState(mod.key, sub.key, null, mod.category);
          }
        });
        nextPermissions[mod.key] = parentObj;
      } else {
        nextPermissions[mod.key] = buildState(mod.key, null, null, mod.category);
      }
    });

    onChange(nextPermissions);
  };

  // Calculate if ALL permissions across ALL modules/sub-modules are checked
  let isAllGlobalMasterChecked = true;
  let isSomeGlobalMasterChecked = false;

  MODULE_TREE.forEach((mod) => {
    if (mod.subModules && mod.subModules.length > 0) {
      mod.subModules.forEach((sub) => {
        if (sub.subModules && sub.subModules.length > 0) {
          sub.subModules.forEach((nested) => {
            const allowed = getItemAllowedActions(mod.key, sub.key, nested.key);
            const p = getPermObj(mod.key, sub.key, nested.key);
            const allChecked = allowed.every((actKey) => p[actKey]);
            const someChecked = allowed.some((actKey) => p[actKey]);
            if (!allChecked) isAllGlobalMasterChecked = false;
            if (someChecked) isSomeGlobalMasterChecked = true;
          });
        } else {
          const allowed = getItemAllowedActions(mod.key, sub.key);
          const p = getPermObj(mod.key, sub.key);
          const allChecked = allowed.every((actKey) => p[actKey]);
          const someChecked = allowed.some((actKey) => p[actKey]);
          if (!allChecked) isAllGlobalMasterChecked = false;
          if (someChecked) isSomeGlobalMasterChecked = true;
        }
      });
    } else {
      const allowed = getItemAllowedActions(mod.key);
      const p = getPermObj(mod.key);
      const allChecked = allowed.every((actKey) => p[actKey]);
      const someChecked = allowed.some((actKey) => p[actKey]);
      if (!allChecked) isAllGlobalMasterChecked = false;
      if (someChecked) isSomeGlobalMasterChecked = true;
    }
  });

  const handleToggleGlobalMaster = () => {
    if (isReadOnly) return;
    const targetValue = !isAllGlobalMasterChecked;

    const nextPermissions = {};
    MODULE_TREE.forEach((mod) => {
      if (mod.subModules && mod.subModules.length > 0) {
        const parentObj = {};
        mod.subModules.forEach((sub) => {
          if (sub.subModules && sub.subModules.length > 0) {
            const subObj = {};
            sub.subModules.forEach((nested) => {
              const allowed = getItemAllowedActions(mod.key, sub.key, nested.key);
              const state = { add: false, edit: false, delete: false, allView: false, ownView: false };
              allowed.forEach((actKey) => { state[actKey] = targetValue; });
              subObj[nested.key] = state;
              parentObj[nested.key] = state;
            });
            parentObj[sub.key] = subObj;
          } else {
            const allowed = getItemAllowedActions(mod.key, sub.key);
            const state = { add: false, edit: false, delete: false, allView: false, ownView: false };
            allowed.forEach((actKey) => { state[actKey] = targetValue; });
            parentObj[sub.key] = state;
          }
        });
        nextPermissions[mod.key] = parentObj;
      } else {
        const allowed = getItemAllowedActions(mod.key);
        const state = { add: false, edit: false, delete: false, allView: false, ownView: false };
        allowed.forEach((actKey) => { state[actKey] = targetValue; });
        nextPermissions[mod.key] = state;
      }
    });

    onChange(nextPermissions);
  };

  // Categories list
  const categories = ['All', ...new Set(MODULE_TREE.map((m) => m.category))];

  // Filter modules
  const filteredModules = MODULE_TREE.filter((mod) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesParent =
      mod.name.toLowerCase().includes(searchLower) ||
      mod.key.toLowerCase().includes(searchLower) ||
      mod.description.toLowerCase().includes(searchLower);

    const matchesSub = mod.subModules?.some(
      (s) =>
        s.name.toLowerCase().includes(searchLower) ||
        s.key.toLowerCase().includes(searchLower) ||
        s.description.toLowerCase().includes(searchLower) ||
        s.subModules?.some(
          (n) =>
            n.name.toLowerCase().includes(searchLower) ||
            n.key.toLowerCase().includes(searchLower) ||
            n.description.toLowerCase().includes(searchLower)
        )
    );

    const matchesCat = selectedCategory === 'All' || mod.category === selectedCategory;
    return (matchesParent || matchesSub) && matchesCat;
  });

  // Calculate total checked permissions and action breakdown
  let totalChecked = 0;
  let maxPossible = 0;
  const actionCounts = { add: 0, edit: 0, delete: 0, allView: 0, ownView: 0 };

  MODULE_TREE.forEach((mod) => {
    if (mod.subModules && mod.subModules.length > 0) {
      mod.subModules.forEach((sub) => {
        if (sub.subModules && sub.subModules.length > 0) {
          sub.subModules.forEach((nested) => {
            const allowed = getItemAllowedActions(mod.key, sub.key, nested.key);
            maxPossible += allowed.length;
            const p = getPermObj(mod.key, sub.key, nested.key);
            allowed.forEach((actKey) => {
              if (p[actKey]) {
                totalChecked++;
                actionCounts[actKey]++;
              }
            });
          });
        } else {
          const allowed = getItemAllowedActions(mod.key, sub.key);
          maxPossible += allowed.length;
          const p = getPermObj(mod.key, sub.key);
          allowed.forEach((actKey) => {
            if (p[actKey]) {
              totalChecked++;
              actionCounts[actKey]++;
            }
          });
        }
      });
    } else {
      const allowed = getItemAllowedActions(mod.key);
      maxPossible += allowed.length;
      const p = getPermObj(mod.key);
      allowed.forEach((actKey) => {
        if (p[actKey]) {
          totalChecked++;
          actionCounts[actKey]++;
        }
      });
    }
  });

  const percentageGranted = Math.round((totalChecked / (maxPossible || 1)) * 100);
  const isAllExpanded = MODULE_TREE.filter((m) => m.subModules).every((m) => expanded[m.key]);

  return (
    <div className={`space-y-4 font-sans pb-12 sm:pb-16 ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
      {/* Consolidated Top Header & Filters Panel */}
      <div
        className={`p-3.5 sm:p-4 rounded-xl border flex flex-col gap-3 shadow-2xs ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        {/* Row 1: Title, Role Selector & Preset Buttons */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <SecurityIcon sx={{ fontSize: 20 }} />
            </div>
            <h2 className="text-sm sm:text-base font-extrabold tracking-tight">Module Permission Matrix</h2>

            {/* Inline Selected Role Dropdown */}
            {roles && roles.length > 0 && (
              <div className="min-w-[200px] sm:min-w-[240px]">
                <TextField
                  select
                  size="small"
                  value={selectedRoleId || (roles[0]?.id ?? '')}
                  onChange={(e) => onRoleChange && onRoleChange(e.target.value)}
                  fullWidth
                  slotProps={{
                    input: {
                      sx: {
                        borderRadius: '0.5rem',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        backgroundColor: isDark ? '#0f172a' : '#f8fafc',
                        color: isDark ? '#f8fafc' : '#0f172a',
                        '& fieldset': {
                          borderColor: isDark ? '#334155' : '#cbd5e1',
                        },
                      },
                    },
                  }}
                >
                  {roles.map((r) => {
                    const stats = getRoleGrantedCount ? getRoleGrantedCount(r) : { granted: 0, total: 70, percent: 0 };
                    return (
                      <MenuItem key={r.id} value={r.id}>
                        <div className="flex items-center justify-between w-full font-semibold text-xs py-0.5 gap-3">
                          <span className="font-extrabold">{r.name}</span>
                          <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono text-[10px] font-bold border border-blue-500/20 whitespace-nowrap">
                            {stats.granted}/{stats.total} ({stats.percent}%)
                          </span>
                        </div>
                      </MenuItem>
                    );
                  })}
                </TextField>
              </div>
            )}

            <Chip
              label={`${totalChecked} / ${maxPossible} True (${percentageGranted}%)`}
              size="small"
              color={totalChecked === maxPossible ? 'success' : totalChecked > 0 ? 'primary' : 'default'}
              variant="outlined"
              className="font-extrabold text-xs"
            />
          </div>

          {/* Quick Action Presets */}
          {!isReadOnly && (
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <button
                onClick={() => handleExpandAll(!isAllExpanded)}
                className={`px-2.5 py-1.5 rounded-lg border font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                  isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {isAllExpanded ? <UnfoldLessIcon sx={{ fontSize: 15 }} /> : <UnfoldMoreIcon sx={{ fontSize: 15 }} />}
                {isAllExpanded ? 'Collapse All' : 'Expand All'}
              </button>
              <button
                onClick={() => handleApplyPreset('full')}
                className="px-2.5 py-1.5 rounded-lg border font-semibold flex items-center gap-1 transition-all bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-500 shadow-2xs cursor-pointer"
              >
                <SelectAllIcon sx={{ fontSize: 15 }} />
                Full Access
              </button>
              <button
                onClick={() => handleApplyPreset('viewOnly')}
                className="px-2.5 py-1.5 rounded-lg border font-semibold flex items-center gap-1 transition-all bg-blue-600 text-white hover:bg-blue-700 border-blue-500 shadow-2xs cursor-pointer"
              >
                <VisibilityIcon sx={{ fontSize: 15 }} />
                View Only
              </button>
              <button
                onClick={() => handleApplyPreset('standard')}
                className="px-2.5 py-1.5 rounded-lg border font-semibold flex items-center gap-1 transition-all bg-amber-600 text-white hover:bg-amber-700 border-amber-500 shadow-2xs cursor-pointer"
              >
                <CheckCircleOutlinedIcon sx={{ fontSize: 15 }} />
                Standard
              </button>
              <button
                onClick={() => handleApplyPreset('clear')}
                className={`px-2.5 py-1.5 rounded-lg border font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                  isDark ? 'bg-slate-800 border-slate-700 text-rose-400 hover:bg-slate-700' : 'bg-slate-100 border-slate-300 text-rose-600 hover:bg-slate-200'
                }`}
              >
                <ClearAllIcon sx={{ fontSize: 15 }} />
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* Row 2: Search, Breakdown Badges & Category Filter Pills */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="w-full lg:w-60">
            <TextField
              placeholder="Search module..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              fullWidth
              slotProps={{
                input: {
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
                },
              }}
            />
          </div>

          {/* Action Breakdown Badges */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-0.5">Actions:</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Add: {actionCounts.add}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              Edit: {actionCounts.edit}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              Delete: {actionCounts.delete}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              All View: {actionCounts.allView}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              Own View: {actionCounts.ownView}
            </span>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 text-[11px] rounded-full border transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-blue-600 border-blue-600 text-white font-bold shadow-2xs'
                    : isDark
                    ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Collapsible Permission Table */}
      <div
        className={`overflow-x-auto rounded-xl border shadow-xs mb-10 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
      >
        <table className="w-full text-left border-collapse text-xs">
          <thead className="sticky top-0 z-20">
            <tr
              className={`border-b shadow-2xs ${isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                }`}
            >
              <th className="py-3 px-4 font-bold min-w-[280px]">
                <div className="flex items-center justify-between">
                  <span>Module & Sub-module Structure</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-600'}`}>
                    {filteredModules.length} Parent Modules
                  </span>
                </div>
              </th>
              <th className="py-3 px-3 text-center font-bold min-w-[100px]">
                <div className="flex flex-col items-center justify-center gap-0.5">
                  <span>Row All</span>
                  {!isReadOnly && (
                    <Tooltip title="Toggle ALL permissions across ALL modules & sub-modules">
                      <Checkbox
                        checked={isAllGlobalMasterChecked}
                        indeterminate={isSomeGlobalMasterChecked && !isAllGlobalMasterChecked}
                        onChange={handleToggleGlobalMaster}
                        size="small"
                        sx={{
                          color: isDark ? '#475569' : '#94a3b8',
                          '&.Mui-checked': { color: '#2563eb' },
                          padding: 0,
                        }}
                      />
                    </Tooltip>
                  )}
                </div>
              </th>
              {PERMISSION_COLUMNS.map((col) => {
                return (
                  <th key={col.key} className="py-3 px-3 text-center font-bold min-w-[100px]">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <span className={`px-2 py-0.5 rounded border text-[11px] font-bold ${col.badge}`}>
                        {col.label}
                      </span>
                      {!isReadOnly && (
                        <button
                          onClick={() => handleToggleGlobalColumn(col.key)}
                          className={`text-[10px] font-medium underline cursor-pointer hover:opacity-80 ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                            }`}
                          title={`Toggle ${col.label} across all modules`}
                        >
                          Select All
                        </button>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className={`divide-y ${isDark ? 'divide-slate-800/60' : 'divide-slate-200/80'}`}>
            {filteredModules.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-10">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <HighlightOffIcon className="text-slate-400" sx={{ fontSize: 32 }} />
                    <p className={`font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      No matching modules found
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredModules.map((mod) => {
                const IconComponent = mod.icon;
                const hasSub = mod.subModules && mod.subModules.length > 0;
                const isExpanded = expanded[mod.key];

                if (hasSub) {
                  const subMods = mod.subModules;
                  const isAllMasterChecked = subMods.every((sub) => {
                    if (sub.subModules && sub.subModules.length > 0) {
                      return sub.subModules.every((nested) => {
                        const allowed = getItemAllowedActions(mod.key, sub.key, nested.key);
                        const p = getPermObj(mod.key, sub.key, nested.key);
                        return allowed.every((actKey) => p[actKey]);
                      });
                    }
                    const allowed = getItemAllowedActions(mod.key, sub.key);
                    const p = getPermObj(mod.key, sub.key);
                    return allowed.every((actKey) => p[actKey]);
                  });
                  const isSomeMasterChecked = subMods.some((sub) => {
                    if (sub.subModules && sub.subModules.length > 0) {
                      return sub.subModules.some((nested) => {
                        const allowed = getItemAllowedActions(mod.key, sub.key, nested.key);
                        const p = getPermObj(mod.key, sub.key, nested.key);
                        return allowed.some((actKey) => p[actKey]);
                      });
                    }
                    const allowed = getItemAllowedActions(mod.key, sub.key);
                    const p = getPermObj(mod.key, sub.key);
                    return allowed.some((actKey) => p[actKey]);
                  });

                  return (
                    <React.Fragment key={mod.key}>
                      {/* Parent Group Header Row */}
                      <tr
                        className={`transition-colors border-t border-slate-300 dark:border-slate-800 ${isDark ? 'bg-slate-950/70 hover:bg-slate-950' : 'bg-slate-100/90 hover:bg-slate-200/60'
                          }`}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {/* Expand/Collapse Toggle Arrow Button */}
                            <button
                              onClick={() => toggleExpand(mod.key)}
                              className={`p-1 rounded-md transition-colors cursor-pointer ${isDark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-200 text-slate-700'
                                }`}
                            >
                              {isExpanded ? (
                                <KeyboardArrowDownIcon sx={{ fontSize: 20 }} />
                              ) : (
                                <KeyboardArrowRightIcon sx={{ fontSize: 20 }} />
                              )}
                            </button>

                            <div className={`p-1.5 rounded-md border shadow-2xs ${mod.accentColor}`}>
                              <IconComponent sx={{ fontSize: 18 }} />
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-sm">{mod.name}</span>
                                <Chip
                                  label={`${subMods.length} Sub-modules`}
                                  size="small"
                                  className="font-bold text-[10px] h-4"
                                  color="primary"
                                  variant="outlined"
                                />
                              </div>
                              <p className={`text-[11px] mt-0.5 line-clamp-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                {mod.description}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Master Row Checkbox for Parent Module */}
                        <td className="py-3 px-3 text-center align-middle">
                          <Tooltip title={`Toggle ALL allowed permissions for ${mod.name} and its sub-modules`}>
                            <Checkbox
                              checked={isAllMasterChecked}
                              indeterminate={isSomeMasterChecked && !isAllMasterChecked}
                              onChange={() => handleToggleParentRow(mod)}
                              disabled={isReadOnly}
                              size="small"
                              sx={{
                                color: isDark ? '#475569' : '#94a3b8',
                                '&.Mui-checked': { color: '#2563eb' },
                              }}
                            />
                          </Tooltip>
                        </td>

                        {/* Parent Column Master Checkboxes */}
                        {PERMISSION_COLUMNS.map((col) => {
                          const applicableSubs = subMods.filter((sub) =>
                            getItemAllowedActions(mod.key, sub.key).includes(col.key)
                          );
                          const hasApplicable = applicableSubs.length > 0;
                          const isAllColChecked =
                            hasApplicable && applicableSubs.every((sub) => getPermObj(mod.key, sub.key)[col.key]);
                          const isSomeColChecked =
                            hasApplicable && applicableSubs.some((sub) => getPermObj(mod.key, sub.key)[col.key]);

                          if (!hasApplicable) {
                            return (
                              <td key={col.key} className="py-3 px-3 text-center align-middle">
                                <span className={`text-xs font-bold select-none px-2 py-0.5 rounded ${isDark ? 'text-slate-600 bg-slate-900/60' : 'text-slate-300 bg-slate-100'}`}>
                                  —
                                </span>
                              </td>
                            );
                          }

                          return (
                            <td key={col.key} className="py-3 px-3 text-center align-middle">
                              <Tooltip title={`Toggle ${col.label} for sub-modules supporting it`}>
                                <Checkbox
                                  checked={isAllColChecked}
                                  indeterminate={isSomeColChecked && !isAllColChecked}
                                  onChange={() => handleToggleParentColumn(mod, col.key)}
                                  disabled={isReadOnly}
                                  size="small"
                                  sx={{
                                    color: isDark ? '#334155' : '#cbd5e1',
                                    '&.Mui-checked': {
                                      color:
                                        col.key === 'add'
                                          ? '#10b981'
                                          : col.key === 'edit'
                                            ? '#3b82f6'
                                            : col.key === 'delete'
                                              ? '#ef4444'
                                              : col.key === 'allView'
                                                ? '#f59e0b'
                                                : '#a855f7',
                                    },
                                  }}
                                />
                              </Tooltip>
                            </td>
                          );
                        })}
                      </tr>

                      {/* Sub-Module Rows (Collapsible) */}
                      {isExpanded &&
                        subMods.map((sub) => {
                          const hasNested = sub.subModules && sub.subModules.length > 0;
                          if (hasNested) {
                            const isSubExpanded = expanded[`${mod.key}.${sub.key}`] ?? true;
                            const nestedSubs = sub.subModules;
                            const isSubGroupAllChecked = nestedSubs.every((nested) => {
                              const allowed = getItemAllowedActions(mod.key, sub.key, nested.key);
                              const p = getPermObj(mod.key, sub.key, nested.key);
                              return allowed.every((actKey) => p[actKey]);
                            });
                            const isSubGroupSomeChecked = nestedSubs.some((nested) => {
                              const allowed = getItemAllowedActions(mod.key, sub.key, nested.key);
                              const p = getPermObj(mod.key, sub.key, nested.key);
                              return allowed.some((actKey) => p[actKey]);
                            });

                            return (
                              <React.Fragment key={`${mod.key}.${sub.key}`}>
                                {/* Sub-Group Header Row */}
                                <tr className={`transition-colors border-t border-dashed ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-100/70 border-slate-300'}`}>
                                  <td className="py-2.5 pl-8 pr-4">
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => toggleExpand(`${mod.key}.${sub.key}`)}
                                        className={`p-1 rounded-md transition-colors cursor-pointer ${isDark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-200 text-slate-700'}`}
                                      >
                                        {isSubExpanded ? (
                                          <KeyboardArrowDownIcon sx={{ fontSize: 18 }} />
                                        ) : (
                                          <KeyboardArrowRightIcon sx={{ fontSize: 18 }} />
                                        )}
                                      </button>
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <span className="font-extrabold text-xs text-blue-600 dark:text-blue-400">{sub.name}</span>
                                          <Chip
                                            label={`${nestedSubs.length} Sub-settings`}
                                            size="small"
                                            className="font-bold text-[9px] h-3.5"
                                            color="secondary"
                                            variant="outlined"
                                          />
                                        </div>
                                        <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                          {sub.description}
                                        </p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-2.5 px-3 text-center align-middle">
                                    <Tooltip title={`Toggle allowed permissions for ${sub.name}`}>
                                      <Checkbox
                                        checked={isSubGroupAllChecked}
                                        indeterminate={isSubGroupSomeChecked && !isSubGroupAllChecked}
                                        onChange={() => {
                                          if (isReadOnly) return;
                                          const targetValue = !isSubGroupAllChecked;
                                          const updatedPermissions = { ...permissions };
                                          const parentObj = typeof updatedPermissions[mod.key] === 'object' && updatedPermissions[mod.key] !== null
                                            ? { ...updatedPermissions[mod.key] }
                                            : {};
                                          const subObj = typeof parentObj[sub.key] === 'object' && parentObj[sub.key] !== null
                                            ? { ...parentObj[sub.key] }
                                            : {};
                                          nestedSubs.forEach((nested) => {
                                            const allowed = getItemAllowedActions(mod.key, sub.key, nested.key);
                                            const targetState = { add: false, edit: false, delete: false, allView: false, ownView: false };
                                            allowed.forEach((actKey) => { targetState[actKey] = targetValue; });
                                            subObj[nested.key] = targetState;
                                            parentObj[nested.key] = targetState;
                                          });
                                          parentObj[sub.key] = subObj;
                                          updatedPermissions[mod.key] = parentObj;
                                          onChange(updatedPermissions);
                                        }}
                                        disabled={isReadOnly}
                                        size="small"
                                        sx={{
                                          color: isDark ? '#475569' : '#94a3b8',
                                          '&.Mui-checked': { color: '#2563eb' },
                                        }}
                                      />
                                    </Tooltip>
                                  </td>
                                  {PERMISSION_COLUMNS.map((col) => {
                                    const applicable = nestedSubs.filter((nested) =>
                                      getItemAllowedActions(mod.key, sub.key, nested.key).includes(col.key)
                                    );
                                    if (applicable.length === 0) {
                                      return (
                                        <td key={col.key} className="py-2.5 px-3 text-center align-middle">
                                          <span className={`text-xs font-bold select-none px-2 py-0.5 rounded ${isDark ? 'text-slate-600 bg-slate-900/60' : 'text-slate-300 bg-slate-100'}`}>—</span>
                                        </td>
                                      );
                                    }
                                    const isAllCol = applicable.every((nested) => getPermObj(mod.key, sub.key, nested.key)[col.key]);
                                    const isSomeCol = applicable.some((nested) => getPermObj(mod.key, sub.key, nested.key)[col.key]);
                                    return (
                                      <td key={col.key} className="py-2.5 px-3 text-center align-middle">
                                        <Checkbox
                                          checked={isAllCol}
                                          indeterminate={isSomeCol && !isAllCol}
                                          onChange={() => {
                                            if (isReadOnly) return;
                                            const targetValue = !isAllCol;
                                            const updatedPermissions = { ...permissions };
                                            const parentObj = typeof updatedPermissions[mod.key] === 'object' && updatedPermissions[mod.key] !== null
                                              ? { ...updatedPermissions[mod.key] }
                                              : {};
                                            const subObj = typeof parentObj[sub.key] === 'object' && parentObj[sub.key] !== null
                                              ? { ...parentObj[sub.key] }
                                              : {};
                                            applicable.forEach((nested) => {
                                              const cur = getPermObj(mod.key, sub.key, nested.key);
                                              const updated = { ...cur, [col.key]: targetValue };
                                              subObj[nested.key] = updated;
                                              parentObj[nested.key] = updated;
                                            });
                                            parentObj[sub.key] = subObj;
                                            updatedPermissions[mod.key] = parentObj;
                                            onChange(updatedPermissions);
                                          }}
                                          disabled={isReadOnly}
                                          size="small"
                                        />
                                      </td>
                                    );
                                  })}
                                </tr>
                                {/* Nested Sub-Module Rows */}
                                {isSubExpanded && nestedSubs.map((nested) => {
                                  const allowedActions = getItemAllowedActions(mod.key, sub.key, nested.key);
                                  const currentPerm = getPermObj(mod.key, sub.key, nested.key);
                                  const isRowAllChecked = allowedActions.every((actKey) => currentPerm[actKey]);
                                  const isRowSomeChecked = allowedActions.some((actKey) => currentPerm[actKey]);

                                  return (
                                    <tr key={`${mod.key}.${sub.key}.${nested.key}`} className={`transition-colors ${isRowAllChecked ? (isDark ? 'bg-blue-950/20' : 'bg-blue-50/40') : (isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50')}`}>
                                      <td className="py-2 pl-14 pr-4">
                                        <div className="flex items-center gap-2">
                                          <SubdirectoryArrowRightIcon className="text-slate-400" sx={{ fontSize: 16 }} />
                                          <div>
                                            <div className="flex items-center gap-2">
                                              <span className="font-bold text-xs">{nested.name}</span>
                                              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
                                                key: {nested.key}
                                              </span>
                                            </div>
                                            <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{nested.description}</p>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="py-2 px-3 text-center align-middle">
                                        <Checkbox
                                          checked={isRowAllChecked}
                                          indeterminate={isRowSomeChecked && !isRowAllChecked}
                                          onChange={() => {
                                            if (isReadOnly) return;
                                            const targetValue = !isRowAllChecked;
                                            const targetState = { add: false, edit: false, delete: false, allView: false, ownView: false };
                                            allowedActions.forEach((actKey) => { targetState[actKey] = targetValue; });
                                            const updatedPermissions = { ...permissions };
                                            const parentObj = typeof updatedPermissions[mod.key] === 'object' && updatedPermissions[mod.key] !== null
                                              ? { ...updatedPermissions[mod.key] }
                                              : {};
                                            const subObj = typeof parentObj[sub.key] === 'object' && parentObj[sub.key] !== null
                                              ? { ...parentObj[sub.key] }
                                              : {};
                                            subObj[nested.key] = targetState;
                                            parentObj[sub.key] = subObj;
                                            parentObj[nested.key] = targetState;
                                            updatedPermissions[mod.key] = parentObj;
                                            onChange(updatedPermissions);
                                          }}
                                          disabled={isReadOnly}
                                          size="small"
                                        />
                                      </td>
                                      {PERMISSION_COLUMNS.map((col) => {
                                        const isAllowed = allowedActions.includes(col.key);
                                        if (!isAllowed) {
                                          return (
                                            <td key={col.key} className="py-2 px-3 text-center align-middle">
                                              <span className={`text-xs font-bold select-none px-2 py-0.5 rounded ${isDark ? 'text-slate-600 bg-slate-900/60' : 'text-slate-300 bg-slate-100'}`}>—</span>
                                            </td>
                                          );
                                        }
                                        const isChecked = Boolean(currentPerm[col.key]);
                                        return (
                                          <td key={col.key} className="py-2 px-3 text-center align-middle">
                                            <Checkbox
                                              checked={isChecked}
                                              onChange={() => handleToggleSingle(mod.key, sub.key, nested.key, col.key)}
                                              disabled={isReadOnly}
                                              size="small"
                                            />
                                          </td>
                                        );
                                      })}
                                    </tr>
                                  );
                                })}
                              </React.Fragment>
                            );
                          }

                          const allowedActions = getItemAllowedActions(mod.key, sub.key);
                          const currentPerm = getPermObj(mod.key, sub.key);
                          const isRowAllChecked = allowedActions.every((actKey) => currentPerm[actKey]);
                          const isRowSomeChecked = allowedActions.some((actKey) => currentPerm[actKey]);

                          return (
                            <tr
                              key={`${mod.key}.${sub.key}`}
                              className={`transition-colors ${isRowAllChecked
                                ? isDark
                                  ? 'bg-blue-950/20 hover:bg-blue-950/30'
                                  : 'bg-blue-50/40 hover:bg-blue-50/70'
                                : isDark
                                  ? 'hover:bg-slate-800/40'
                                  : 'hover:bg-slate-50'
                                }`}
                            >
                              {/* Sub Module Info */}
                              <td className="py-2.5 pl-10 pr-4">
                                <div className="flex items-center gap-2">
                                  <SubdirectoryArrowRightIcon className="text-slate-400" sx={{ fontSize: 18 }} />
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-xs">{sub.name}</span>
                                      <span
                                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${isDark
                                          ? 'bg-slate-800 border-slate-700 text-slate-300'
                                          : 'bg-slate-100 border-slate-200 text-slate-600'
                                          }`}
                                      >
                                        key: {sub.key}
                                      </span>
                                    </div>
                                    <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                      {sub.description}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              {/* Row Select All Checkbox */}
                              <td className="py-2.5 px-3 text-center align-middle">
                                <Tooltip title={`Toggle allowed permissions for ${sub.name}`}>
                                  <Checkbox
                                    checked={isRowAllChecked}
                                    indeterminate={isRowSomeChecked && !isRowAllChecked}
                                    onChange={() => {
                                      if (isReadOnly) return;
                                      const targetValue = !isRowAllChecked;
                                      const targetState = { add: false, edit: false, delete: false, allView: false, ownView: false };
                                      allowedActions.forEach((actKey) => { targetState[actKey] = targetValue; });
                                      const updatedPermissions = { ...permissions };
                                      updatedPermissions[mod.key] = {
                                        ...(updatedPermissions[mod.key] || {}),
                                        [sub.key]: targetState,
                                      };
                                      onChange(updatedPermissions);
                                    }}
                                    disabled={isReadOnly}
                                    size="small"
                                    sx={{
                                      color: isDark ? '#475569' : '#94a3b8',
                                      '&.Mui-checked': { color: '#2563eb' },
                                    }}
                                  />
                                </Tooltip>
                              </td>

                              {/* Permission Action Checkboxes */}
                              {PERMISSION_COLUMNS.map((col) => {
                                const isAllowed = allowedActions.includes(col.key);
                                if (!isAllowed) {
                                  return (
                                    <td key={col.key} className="py-2.5 px-3 text-center align-middle">
                                      <span className={`text-xs font-bold select-none px-2 py-0.5 rounded ${isDark ? 'text-slate-600 bg-slate-900/60' : 'text-slate-300 bg-slate-100'}`}>
                                        —
                                      </span>
                                    </td>
                                  );
                                }

                                const isChecked = Boolean(currentPerm[col.key]);
                                return (
                                  <td key={col.key} className="py-2.5 px-3 text-center align-middle">
                                    <Tooltip title={`${isChecked ? 'Revoke' : 'Grant'} ${col.label} for ${sub.name}`}>
                                      <label className="inline-flex items-center justify-center p-1 rounded-md cursor-pointer hover:bg-slate-500/10 transition-colors">
                                        <Checkbox
                                          checked={isChecked}
                                          onChange={() => handleToggleSingle(mod.key, sub.key, col.key)}
                                          disabled={isReadOnly}
                                          size="small"
                                          sx={{
                                            color: isDark ? '#334155' : '#cbd5e1',
                                            '&.Mui-checked': {
                                              color:
                                                col.key === 'add'
                                                  ? '#10b981'
                                                  : col.key === 'edit'
                                                    ? '#3b82f6'
                                                    : col.key === 'delete'
                                                      ? '#ef4444'
                                                      : col.key === 'allView'
                                                        ? '#f59e0b'
                                                        : '#a855f7',
                                            },
                                          }}
                                        />
                                      </label>
                                    </Tooltip>
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                    </React.Fragment>
                  );
                }

                // Flat Single Module Row
                const allowedActions = getItemAllowedActions(mod.key);
                const currentPerm = getPermObj(mod.key);
                const isRowAllChecked = allowedActions.every((actKey) => currentPerm[actKey]);
                const isRowSomeChecked = allowedActions.some((actKey) => currentPerm[actKey]);

                return (
                  <tr
                    key={mod.key}
                    className={`transition-colors ${isRowAllChecked
                      ? isDark
                        ? 'bg-blue-950/20 hover:bg-blue-950/30'
                        : 'bg-blue-50/40 hover:bg-blue-50/70'
                      : isDark
                        ? 'hover:bg-slate-800/40'
                        : 'hover:bg-slate-50'
                      }`}
                  >
                    {/* Module Info */}
                    <td className="py-3 px-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg border mt-0.5 shadow-2xs ${mod.accentColor}`}>
                          <IconComponent sx={{ fontSize: 20 }} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm">{mod.name}</span>
                            <span
                              className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${isDark
                                ? 'bg-slate-800 border-slate-700 text-slate-300'
                                : 'bg-slate-100 border-slate-200 text-slate-600'
                                }`}
                            >
                              key: {mod.key}
                            </span>
                          </div>
                          <p className={`text-[11px] mt-0.5 line-clamp-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {mod.description}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Row Select All Checkbox */}
                    <td className="py-3 px-3 text-center align-middle">
                      <Tooltip title={`Toggle allowed permissions for ${mod.name}`}>
                        <Checkbox
                          checked={isRowAllChecked}
                          indeterminate={isRowSomeChecked && !isRowAllChecked}
                          onChange={() => handleToggleFlatRow(mod.key)}
                          disabled={isReadOnly}
                          size="small"
                          sx={{
                            color: isDark ? '#475569' : '#94a3b8',
                            '&.Mui-checked': { color: '#2563eb' },
                          }}
                        />
                      </Tooltip>
                    </td>

                    {/* Permission Action Checkboxes */}
                    {PERMISSION_COLUMNS.map((col) => {
                      const isAllowed = allowedActions.includes(col.key);
                      if (!isAllowed) {
                        return (
                          <td key={col.key} className="py-3 px-3 text-center align-middle">
                            <span className={`text-xs font-bold select-none px-2 py-0.5 rounded ${isDark ? 'text-slate-600 bg-slate-900/60' : 'text-slate-300 bg-slate-100'}`}>
                              —
                            </span>
                          </td>
                        );
                      }

                      const isChecked = Boolean(currentPerm[col.key]);
                      return (
                        <td key={col.key} className="py-3 px-3 text-center align-middle">
                          <Tooltip title={`${isChecked ? 'Revoke' : 'Grant'} ${col.label} for ${mod.name}`}>
                            <label className="inline-flex items-center justify-center p-1 rounded-md cursor-pointer hover:bg-slate-500/10 transition-colors">
                              <Checkbox
                                checked={isChecked}
                                onChange={() => handleToggleSingle(mod.key, null, col.key)}
                                disabled={isReadOnly}
                                size="small"
                                sx={{
                                  color: isDark ? '#334155' : '#cbd5e1',
                                  '&.Mui-checked': {
                                    color:
                                      col.key === 'add'
                                        ? '#10b981'
                                        : col.key === 'edit'
                                          ? '#3b82f6'
                                          : col.key === 'delete'
                                            ? '#ef4444'
                                            : col.key === 'allView'
                                              ? '#f59e0b'
                                              : '#a855f7',
                                  },
                                }}
                              />
                            </label>
                          </Tooltip>
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div
        className={`p-3 rounded-xl border flex flex-col sm:flex-row items-center justify-between text-xs gap-2 ${isDark ? 'bg-slate-900/60 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}
      >
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Collapsible Module & Sub-module Tree Matrix</span>
        </div>
        <div className="font-mono text-[11px]">
          API JSON format: <code>&#123; "task": &#123; "taskAll": &#123; "add": true &#125; &#125; &#125;</code>
        </div>
      </div>
    </div>
  );
}
