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

export default function RegionTable({
  regions = [],
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
              backgroundColor: 'rgba(34, 197, 94, 0.15)',
              color: '#4ade80',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              fontWeight: 600,
            },
          }
        : {
            label: 'Inactive',
            style: {
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              color: '#fca5a5',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              fontWeight: 600,
            },
          };
    } else {
      return isAct
        ? {
            label: 'Active',
            style: {
              backgroundColor: '#dcfce7',
              color: '#14532d',
              border: '1px solid #86efac',
              fontWeight: 700,
            },
          }
        : {
            label: 'Inactive',
            style: {
              backgroundColor: '#fee2e2',
              color: '#7f1d1d',
              border: '1px solid #fca5a5',
              fontWeight: 700,
            },
          };
    }
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        id: 'name',
        header: 'Region Name',
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
            <Tooltip title="Edit Region">
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

            <Tooltip title="Delete Region">
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
    data: regions,
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
      className={`flex flex-col rounded-2xl border shadow-xl overflow-hidden w-full transition-colors duration-200 ${
        isDark ? 'border-slate-800/80 bg-slate-900/70' : 'border-slate-200 bg-white'
      }`}
      sx={{ width: '100%', margin: 0, maxHeight: maxHeight || 'calc(100vh - 170px)' }}
    >
      <TableContainer
        className="overflow-auto w-full min-h-0 custom-scrollbar"
        sx={{ maxHeight: maxHeight ? `calc(${maxHeight} - 45px)` : 'calc(100vh - 220px)' }}
      >
        <Table sx={{ minWidth: 650 }} aria-label="region table" stickyHeader>
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
                        color: isDark ? '#94a3b8' : '#0f172a',
                        fontWeight: 700,
                        px: 2,
                        py: 1.5,
                        backgroundColor: isDark ? '#0f172a !important' : '#f1f5f9 !important',
                        cursor: canSort ? 'pointer' : 'default',
                        userSelect: 'none',
                      }}
                      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                    >
                      <div className={`flex items-center gap-1 ${header.id === 'actions' ? 'justify-end' : ''}`}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {isSorted === 'asc' && <ArrowUpwardIcon sx={{ fontSize: 14, color: isDark ? '#818cf8' : '#0f172a' }} />}
                        {isSorted === 'desc' && <ArrowDownwardIcon sx={{ fontSize: 14, color: isDark ? '#818cf8' : '#0f172a' }} />}
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
                <TableCell colSpan={columns.length} align="center" sx={{ py: 6, color: isDark ? '#94a3b8' : '#64748b' }}>
                  No regions found.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  hover
                  sx={{
                    '&:hover': {
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03) !important' : 'rgba(0, 0, 0, 0.02) !important',
                    },
                    '& td': {
                      borderColor: isDark ? '#1e293b' : '#f1f5f9',
                      color: isDark ? '#e2e8f0' : '#0f172a',
                      px: 2,
                      py: 1.2,
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
      <div className={`flex-shrink-0 border-t ${isDark ? 'border-slate-800/80 bg-slate-900/90' : 'border-slate-200 bg-white'}`}>
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
