import React, { useMemo, useState } from 'react';
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
} from '@mui/material';

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
} from '@tanstack/react-table';
import { useThemeMode } from '../../contexts/ThemeContext';
import TablePaginationComponent from '../../components/common/TablePaginationComponent';
import TableSkeleton from '../../components/common/TableSkeleton';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

const columnHelper = createColumnHelper();

export default function BranchTable({
  branches = [],
  totalData = 0,
  page = 0,
  rowsPerPage = 10,
  onPageChange,
  onRowsPerPageChange,
  onEditClick,
  onDeleteClick,
  maxHeight,
  loading = false,
}) {
  const [sorting, setSorting] = useState([]);
  const { isDark } = useThemeMode();

  const getChipProps = (status) => {
    const isAct = String(status || '').toLowerCase() === 'active';
    if (isDark) {
      return isAct
        ? {
            label: 'Active',
            style: {
              backgroundColor: 'rgba(34, 197, 94, 0.12)',
              color: '#4ade80',
              border: '1px solid rgba(34, 197, 94, 0.25)',
              fontWeight: 700,
              borderRadius: '9999px',
              fontSize: '0.72rem',
              height: '22px',
            },
          }
        : {
            label: 'Inactive',
            style: {
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              color: '#f87171',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              fontWeight: 700,
              borderRadius: '9999px',
              fontSize: '0.72rem',
              height: '22px',
            },
          };
    } else {
      return isAct
        ? {
            label: 'Active',
            style: {
              backgroundColor: '#ecfdf5',
              color: '#047857',
              border: '1px solid #a7f3d0',
              fontWeight: 700,
              borderRadius: '9999px',
              fontSize: '0.72rem',
              height: '22px',
            },
          }
        : {
            label: 'Inactive',
            style: {
              backgroundColor: '#fef2f2',
              color: '#b91c1c',
              border: '1px solid #fecaca',
              fontWeight: 700,
              borderRadius: '9999px',
              fontSize: '0.72rem',
              height: '22px',
            },
          };
    }
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        id: 'name',
        header: 'Branch Name',
        cell: ({ row }) => (
          <div className="font-bold text-xs sm:text-sm whitespace-nowrap">
            {row.original.name || '-'}
          </div>
        ),
      }),
      columnHelper.accessor('state', {
        id: 'state',
        header: 'State',
        cell: ({ row }) => {
          const stateName = row.original.state?.name || row.original.state_name || (row.original.state_id ? `State #${row.original.state_id}` : '-');
          return (
            <span className={`text-xs font-semibold px-2 py-1 rounded border whitespace-nowrap ${
              isDark ? 'bg-slate-800/60 text-slate-200 border-slate-700' : 'bg-slate-100 text-slate-800 border-slate-200'
            }`}>
              {stateName}
            </span>
          );
        },
      }),
      columnHelper.accessor('region', {
        id: 'region',
        header: 'Region',
        cell: ({ row }) => {
          const regionName = row.original.region?.name || row.original.region_name || (row.original.region_id ? `Region #${row.original.region_id}` : '-');
          return (
            <span className={`text-xs font-semibold px-2 py-1 rounded border whitespace-nowrap ${
              isDark ? 'bg-slate-800/60 text-slate-200 border-slate-700' : 'bg-slate-100 text-slate-800 border-slate-200'
            }`}>
              {regionName}
            </span>
          );
        },
      }),
      columnHelper.accessor('slug', {
        id: 'slug',
        header: 'Slug',
        cell: ({ row }) => (
          <span className={`font-mono text-xs whitespace-nowrap ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {row.original.slug || '-'}
          </span>
        ),
      }),
      columnHelper.accessor('status', {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => <Chip size="small" {...getChipProps(row.original.status)} />,
      }),
      columnHelper.accessor('createdAt', {
        id: 'createdAt',
        header: 'Created At',
        cell: ({ row }) => {
          const dateVal = row.original.createdAt || row.original.created_at;
          return (
            <span className={`text-xs whitespace-nowrap ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {dateVal ? new Date(dateVal).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}
            </span>
          );
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: 'ACTIONS',
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            <Tooltip title="Edit Branch">
              <IconButton
                size="small"
                onClick={() => onEditClick && onEditClick(row.original)}
                sx={{
                  color: isDark ? '#fbbf24' : '#d97706',
                  '&:hover': { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : '#fef3c7' },
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Delete Branch">
              <IconButton
                size="small"
                onClick={() => onDeleteClick && onDeleteClick(row.original)}
                sx={{
                  color: isDark ? '#f87171' : '#dc2626',
                  '&:hover': { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#fee2e2' },
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </div>
        ),
      }),
    ],
    [onEditClick, onDeleteClick, isDark]
  );

  const table = useReactTable({
    data: branches,
    columns,
    state: {
      sorting,
      pagination: {
        pageIndex: page,
        pageSize: rowsPerPage,
      },
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: Math.ceil((totalData || 0) / rowsPerPage) || 1,
  });

  if (loading) {
    return (
      <TableSkeleton
        columns={columns.length}
        rows={rowsPerPage}
        maxHeight={maxHeight}
      />
    );
  }

  return (
    <Paper
      className={`flex flex-col rounded-2xl border overflow-hidden w-full transition-all duration-200 ${
        isDark
          ? 'border-slate-800/80 bg-slate-900/70 shadow-2xl backdrop-blur-xl ring-1 ring-white/5'
          : 'border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-900/5'
      }`}
      sx={{ width: '100%', margin: 0, maxHeight: maxHeight || 'calc(100vh - 170px)' }}
    >
      <TableContainer
        className="overflow-auto w-full min-h-0 custom-scrollbar"
        sx={{ maxHeight: maxHeight ? `calc(${maxHeight} - 45px)` : 'calc(100vh - 220px)' }}
      >
        <Table sx={{ minWidth: 700 }} aria-label="branch table" stickyHeader>
          <TableHead sx={{ position: 'sticky', top: 0, zIndex: 30 }}>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const isSorted = header.column.getIsSorted();

                  return (
                    <TableCell
                      key={header.id}
                      align={header.id === 'actions' ? 'right' : 'left'}
                      sx={{
                        color: isDark ? '#94a3b8' : '#475569',
                        fontWeight: 700,
                        fontSize: '0.72rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        px: 2,
                        py: 1.4,
                        backgroundColor: isDark ? '#090e1a !important' : '#f8fafc !important',
                        borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
                        cursor: canSort ? 'pointer' : 'default',
                        userSelect: 'none',
                        transition: 'background-color 0.15s ease',
                        '&:hover': canSort ? {
                          backgroundColor: isDark ? '#0f172a !important' : '#f1f5f9 !important',
                        } : {},
                      }}
                      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                    >
                      <div className={`flex items-center gap-1.5 ${header.id === 'actions' ? 'justify-end' : ''}`}>
                        <span>{flexRender(header.column.columnDef.header, header.getContext())}</span>
                        {isSorted === 'asc' && <ArrowUpwardIcon sx={{ fontSize: 13, color: '#6366f1' }} />}
                        {isSorted === 'desc' && <ArrowDownwardIcon sx={{ fontSize: 13, color: '#6366f1' }} />}
                      </div>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableHead>

          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 8, color: isDark ? '#94a3b8' : '#64748b' }}>
                  <p className={`font-bold text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    No branches found.
                  </p>
                  <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    Try adjusting your search query or filters.
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  hover
                  sx={{
                    '&:hover': {
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.035) !important' : 'rgba(248, 250, 252, 0.9) !important',
                    },
                    '& td': {
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9',
                      color: isDark ? '#e2e8f0' : '#1e293b',
                      px: 2,
                      py: 1.3,
                    },
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} align={cell.column.id === 'actions' ? 'right' : 'left'}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination Footer */}
      <div className={`flex-shrink-0 border-t ${isDark ? 'border-slate-800/80 bg-slate-900/90' : 'border-slate-200/80 bg-white'}`}>
        <TablePaginationComponent
          table={table}
          totalData={totalData}
          count={totalData}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
        />
      </div>
    </Paper>
  );
}
