import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table';
import { rankItem } from '@tanstack/match-sorter-utils';
import { useThemeMode } from '../../contexts/ThemeContext';

import TablePaginationComponent from '../../components/common/TablePaginationComponent';
import TableSkeleton from '../../components/common/TableSkeleton';
import { ALL_PROJECT_MODULES, sortPermissionsByModuleTree } from './RolePermissionMatrix';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CodeIcon from '@mui/icons-material/Code';
import SecurityIcon from '@mui/icons-material/Security';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

const fuzzyFilter = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value);
  addMeta({ itemRank });
  return itemRank.passed;
};

const columnHelper = createColumnHelper();

const defaultGetStatusChipProps = (status, isDark = false) => {
  const st = String(status || '').toLowerCase();
  const isActive = st === 'active' || st === 'open';

  if (isActive) {
    return {
      label: 'Active',
      style: {
        backgroundColor: isDark ? 'rgba(34, 197, 94, 0.15)' : '#dcfce7',
        color: isDark ? '#4ade80' : '#14532d',
        border: isDark ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid #86efac',
        fontWeight: 700,
        borderRadius: '9999px',
        fontSize: '0.75rem',
      },
    };
  }

  return {
    label: status ? String(status).charAt(0).toUpperCase() + String(status).slice(1) : 'Inactive',
    style: {
      backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#fee2e2',
      color: isDark ? '#f87171' : '#991b1b',
      border: isDark ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid #fca5a5',
      fontWeight: 700,
      borderRadius: '9999px',
      fontSize: '0.75rem',
    },
  };
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return String(dateString);
  }
};

export default function RolePermissionTable({
  roles = [],
  totalData,
  page = 0,
  rowsPerPage = 10,
  onPageChange,
  onRowsPerPageChange,
  onEditClick,
  onDeleteClick,
  loading = false,
  maxHeight,
}) {
  const [sorting, setSorting] = useState([]);
  const { isDark } = useThemeMode();

  const [jsonModalOpen, setJsonModalOpen] = useState(false);
  const [selectedRoleJson, setSelectedRoleJson] = useState(null);

  const handleOpenJsonModal = (role) => {
    if (role && role.permission) {
      const sortedPerms = sortPermissionsByModuleTree(role.permission);
      setSelectedRoleJson({
        ...role,
        permission: sortedPerms,
      });
    } else {
      setSelectedRoleJson(role);
    }
    setJsonModalOpen(true);
  };

  const getPermissionSummary = (role) => {
    let permObj = role?.permission;
    if (permObj && permObj.permission) {
      permObj = permObj.permission;
    }

    if (!permObj || typeof permObj !== 'object') {
      return { grantedCount: 0, moduleCount: 0 };
    }

    let grantedCount = 0;
    let moduleCount = 0;

    const countGrantedInNode = (node) => {
      if (!node || typeof node !== 'object') return 0;
      let count = 0;
      Object.keys(node).forEach((k) => {
        const val = node[k];
        if (typeof val === 'boolean' && val === true) {
          count++;
        } else if (typeof val === 'object' && val !== null) {
          count += countGrantedInNode(val);
        }
      });
      return count;
    };

    Object.keys(permObj).forEach((modKey) => {
      const mPerm = permObj[modKey];
      if (mPerm && typeof mPerm === 'object') {
        const grants = countGrantedInNode(mPerm);
        if (grants > 0) {
          moduleCount++;
          grantedCount += grants;
        }
      }
    });

    return { grantedCount, moduleCount };
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        id: 'name',
        header: 'Role Name',
        cell: ({ row }) => {
          const role = row.original;
          const isActive = role.status === 'active';
          return (
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs shadow-2xs ${
                  isActive
                    ? 'bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                    : 'bg-slate-500/10 text-slate-500 border border-slate-500/20'
                }`}
              >
                {role.name ? role.name.substring(0, 2).toUpperCase() : 'RL'}
              </div>
              <div>
                <p className="font-extrabold text-sm text-blue-600 dark:text-blue-400">{role.name}</p>
                <p className={`text-[11px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  slug: {role.slug}
                </p>
              </div>
            </div>
          );
        },
      }),

      columnHelper.accessor('role_custom_id', {
        id: 'role_custom_id',
        header: 'Role Custom ID',
        cell: ({ row }) => {
          const customId = row.original.role_custom_id || `ROL-${row.original.id}`;
          return (
            <span
              className={`px-2 py-1 rounded font-mono font-bold text-xs border ${
                isDark ? 'bg-slate-800 border-slate-700 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}
            >
              {customId}
            </span>
          );
        },
      }),

      columnHelper.accessor('status', {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const props = defaultGetStatusChipProps(row.original.status, isDark);
          return <Chip size="small" label={props.label} style={props.style} />;
        },
      }),

      columnHelper.accessor('permission', {
        id: 'permission',
        header: 'Permissions Overview',
        cell: ({ row }) => {
          const { grantedCount, moduleCount } = getPermissionSummary(row.original);
          const maxPerms = ALL_PROJECT_MODULES.reduce((sum, m) => sum + (m.actions ? m.actions.length : 5), 0);
          const percent = Math.min(100, Math.round((grantedCount / (maxPerms || 1)) * 100));

          let barBg = 'bg-rose-500';
          let textColor = 'text-rose-600 dark:text-rose-400';
          let badgeStyle = isDark
            ? 'bg-rose-950/40 text-rose-300 border-rose-800'
            : 'bg-rose-50 text-rose-700 border-rose-200';

          if (percent >= 75) {
            barBg = 'bg-emerald-500';
            textColor = 'text-emerald-600 dark:text-emerald-400';
            badgeStyle = isDark
              ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200';
          } else if (percent >= 40) {
            barBg = 'bg-blue-600';
            textColor = 'text-blue-600 dark:text-blue-400';
            badgeStyle = isDark
              ? 'bg-blue-950/40 text-blue-300 border-blue-800'
              : 'bg-blue-50 text-blue-700 border-blue-200';
          } else if (percent >= 15) {
            barBg = 'bg-amber-500';
            textColor = 'text-amber-600 dark:text-amber-400';
            badgeStyle = isDark
              ? 'bg-amber-950/40 text-amber-300 border-amber-800'
              : 'bg-amber-50 text-amber-700 border-amber-200';
          }

          return (
            <div className="flex flex-col gap-1 min-w-[160px]">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-bold">
                  <span className={textColor}>{grantedCount} Perms</span>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${badgeStyle}`}>
                    {percent}%
                  </span>
                </div>
                <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  ({moduleCount}/{ALL_PROJECT_MODULES.length} Mods)
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-full ${barBg} rounded-full transition-all duration-300`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        },
      }),

      columnHelper.accessor('createdBy', {
        id: 'createdBy',
        header: 'Created By',
        cell: ({ row }) => {
          const cb = row.original.createdBy;
          const name = typeof cb === 'object' && cb !== null ? cb.name || cb.identity : cb || 'System';
          return <span className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{name}</span>;
        },
      }),

      columnHelper.accessor('createdAt', {
        id: 'createdAt',
        header: 'Created At',
        cell: ({ row }) => (
          <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {formatDate(row.original.createdAt)}
          </span>
        ),
      }),

      columnHelper.display({
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
        const role = row.original;
          return (
            <div className="flex items-center justify-end gap-1">
              <Tooltip title="View Full JSON">
                <IconButton
                  size="small"
                  onClick={() => handleOpenJsonModal(role)}
                  className={isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'}
                >
                  <CodeIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>

              <Tooltip title="Edit Permissions">
                <IconButton
                  size="small"
                  onClick={() => onEditClick && onEditClick(role)}
                  className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                >
                  <EditIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>

              <Tooltip title="Delete Role">
                <IconButton
                  size="small"
                  onClick={() => onDeleteClick && onDeleteClick(role)}
                  className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                >
                  <DeleteIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            </div>
          );
        },
      }),
    ],
    [isDark, onEditClick, onDeleteClick]
  );

  const table = useReactTable({
    data: roles,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (loading) {
    return (
      <TableSkeleton
        columns={columns.length}
        rows={rowsPerPage}
      />
    );
  }

  return (
    <>
      <Paper
        className={`flex flex-col rounded-2xl border shadow-xl overflow-hidden w-full transition-colors duration-200 ${
          isDark ? 'border-slate-800/80 bg-slate-900/70' : 'border-slate-200 bg-white'
        }`}
        sx={{ width: '100%', margin: 0, maxHeight: maxHeight || 'calc(100vh - 310px)' }}
      >
      <TableContainer
        className="overflow-auto overflow-y-auto w-full flex-1 min-h-0 custom-scrollbar"
        sx={{ maxHeight: maxHeight ? `calc(${maxHeight} - 45px)` : 'calc(100vh - 360px)' }}
      >
        <Table sx={{ minWidth: 700 }} size="small" stickyHeader>
          <TableHead sx={{ position: 'sticky', top: 0, zIndex: 30 }}>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                sx={{
                  backgroundColor: isDark ? 'rgba(15, 23, 42, 0.8)' : '#f8fafc',
                  '& th': {
                    borderColor: isDark ? '#1e293b' : '#e2e8f0',
                    color: isDark ? '#94a3b8' : '#475569',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    padding: '12px 16px',
                    backgroundColor: isDark ? '#0f172a !important' : '#f8fafc !important',
                  },
                }}
              >
                {headerGroup.headers.map((header) => (
                  <TableCell
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    sx={{
                      cursor: header.column.getCanSort() ? 'pointer' : 'default',
                      userSelect: 'none',
                    }}
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() === 'asc' ? (
                        <ArrowUpwardIcon sx={{ fontSize: 14 }} />
                      ) : header.column.getIsSorted() === 'desc' ? (
                        <ArrowDownwardIcon sx={{ fontSize: 14 }} />
                      ) : null}
                    </div>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 6 }}>
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-7 h-7 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Loading roles...
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 8 }}>
                  <div className="flex flex-col items-center justify-center gap-2">
                    <SecurityIcon className="text-slate-400" sx={{ fontSize: 36 }} />
                    <p className={`font-bold text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      No roles found
                    </p>
                    <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      Click "Add New Role" to define new roles and permissions.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  hover
                  sx={{
                    '&:hover': {
                      backgroundColor: isDark ? 'rgba(30, 41, 59, 0.4)' : '#f8fafc',
                    },
                    '& td': {
                      borderColor: isDark ? 'rgba(30, 41, 59, 0.6)' : '#f1f5f9',
                      padding: '12px 16px',
                    },
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Standard Project Table Pagination Component */}
      <div className={`flex-shrink-0 border-t ${isDark ? 'border-slate-800/80 bg-slate-900/90' : 'border-slate-200 bg-white'}`}>
        <TablePaginationComponent
          table={table}
          totalData={totalData ?? roles.length}
          count={totalData ?? roles.length}
          page={page}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
          rowsPerPageOptions={[10, 20, 25, 50]}
        />
      </div>
    </Paper>

      {/* JSON Viewer Modal */}
      <Dialog
        open={jsonModalOpen}
        onClose={() => setJsonModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '1rem',
            backgroundColor: isDark ? '#0f172a' : '#ffffff',
            color: isDark ? '#f8fafc' : '#0f172a',
          },
        }}
      >
        <DialogTitle className="flex items-center justify-between font-bold border-b dark:border-slate-800">
          <div className="flex items-center gap-2">
            <CodeIcon className="text-blue-500" />
            <span>Role Data JSON structure ({selectedRoleJson?.name})</span>
          </div>
          <Chip label={selectedRoleJson?.role_custom_id || 'JSON'} size="small" color="primary" />
        </DialogTitle>
        <DialogContent className="pt-4">
          <pre
            className={`p-4 rounded-xl font-mono text-xs overflow-x-auto border ${
              isDark ? 'bg-slate-950 border-slate-800 text-emerald-400' : 'bg-slate-900 border-slate-800 text-emerald-300'
            }`}
          >
            {JSON.stringify(selectedRoleJson, null, 2)}
          </pre>
        </DialogContent>
        <DialogActions className="p-4 border-t dark:border-slate-800">
          <Button onClick={() => setJsonModalOpen(false)} variant="contained" size="small">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
