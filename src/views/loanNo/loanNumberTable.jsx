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
  TablePagination,
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
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

const columnHelper = createColumnHelper();

const defaultGetStatusChipProps = (status, isDark = false) => {
  const st = String(status || '').toLowerCase();
  const isActive = st === 'active' || st === 'open';

  if (isActive) {
    return {
      label: 'Active',
      style: {
        backgroundColor: isDark ? 'rgba(34, 197, 94, 0.12)' : '#ecfdf5',
        color: isDark ? '#4ade80' : '#047857',
        border: isDark ? '1px solid rgba(34, 197, 94, 0.25)' : '1px solid #a7f3d0',
        fontWeight: 700,
        borderRadius: '9999px',
        fontSize: '0.72rem',
        height: '22px',
      },
    };
  }

  return {
    label: status ? String(status).charAt(0).toUpperCase() + String(status).slice(1) : 'Inactive',
    style: {
      backgroundColor: isDark ? 'rgba(239, 68, 68, 0.12)' : '#fef2f2',
      color: isDark ? '#f87171' : '#b91c1c',
      border: isDark ? '1px solid rgba(239, 68, 68, 0.25)' : '1px solid #fecaca',
      fontWeight: 700,
      borderRadius: '9999px',
      fontSize: '0.72rem',
      height: '22px',
    },
  };
};

export default function LoanNumberTable({
  loading = false,
  loanNumbers = [],
  totalData = 0,
  page = 0,
  rowsPerPage = 10,
  onPageChange,
  onRowsPerPageChange,
  onEditClick,
  onDeleteClick,
  maxHeight,
}) {
  const [sorting, setSorting] = useState([]);
  const { isDark } = useThemeMode();

  const totalCustomers = totalData;

  const setPage = (newPage) => {
    if (onPageChange) {
      onPageChange(null, newPage);
    }
  };

  const setRowsPerPage = (newSize) => {
    if (onRowsPerPageChange) {
      onRowsPerPageChange({ target: { value: newSize } });
    }
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor((_, idx) => page * rowsPerPage + idx + 1, {
        id: 'sNo',
        header: 'S.No',
        cell: ({ row }) => (
          <span className={`font-semibold text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {page * rowsPerPage + row.index + 1}
          </span>
        ),
      }),
      columnHelper.accessor('loanNo', {
        id: 'loanNo',
        header: 'Loan Number',
        cell: ({ row }) => (
          <span className={`font-extrabold text-xs tracking-wide ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
            {row.original.loanNo || 'N/A'}
          </span>
        ),
      }),
      columnHelper.accessor('status', {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const chipProps = defaultGetStatusChipProps(row.original.status, isDark);
          return <Chip label={chipProps.label} size="small" style={chipProps.style} />;
        },
      }),
      columnHelper.accessor((row) => row.createdBy || row.creator, {
        id: 'createdBy',
        header: 'Created By',
        cell: ({ row }) => {
          const creator = row.original.createdBy || row.original.creator;
          const nameStr = creator?.name
            ? `${creator.name}${creator.identity ? ` (${creator.identity})` : ''}`
            : '-';
          return (
            <span className={`text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {nameStr}
            </span>
          );
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            <Tooltip title="Edit Loan Number">
              <IconButton
                size="small"
                onClick={() => onEditClick && onEditClick(row.original)}
                sx={{
                  color: isDark ? '#818cf8' : '#4f46e5',
                  '&:hover': {
                    backgroundColor: isDark ? 'rgba(99, 102, 241, 0.15)' : '#e0e7ff',
                  },
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Loan Number">
              <IconButton
                size="small"
                onClick={() => onDeleteClick && onDeleteClick(row.original)}
                sx={{
                  color: isDark ? '#f87171' : '#ef4444',
                  '&:hover': {
                    backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#fee2e2',
                  },
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </div>
        ),
      }),
    ],
    [isDark, page, rowsPerPage, onEditClick, onDeleteClick]
  );

  const table = useReactTable({
    data: loanNumbers,
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
    pageCount: Math.ceil(totalData / rowsPerPage) || 1,
  });

  const currentPageRows = table.getRowModel().rows;

  if (loading) {
    return <TableSkeleton columns={5} rows={rowsPerPage} maxHeight={maxHeight} />;
  }

  return (
    <Paper
      elevation={0}
      className={`w-full flex-1 flex flex-col min-h-0 border rounded-2xl overflow-hidden transition-all duration-200 ${
        isDark
          ? 'border-slate-800/80 bg-slate-900/70 shadow-2xl backdrop-blur-xl ring-1 ring-white/5'
          : 'border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-900/5'
      }`}
    >
      <TableContainer className="overflow-auto w-full min-h-0 custom-scrollbar" sx={{ maxHeight: maxHeight ? `calc(${maxHeight} - 45px)` : 'calc(100vh - 220px)' }}>
        <Table sx={{ width: 'max-content', minWidth: '100%' }} aria-label="loan number table" stickyHeader>
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
                        {isSorted === 'asc' && (
                          <ArrowUpwardIcon sx={{ fontSize: 13, color: '#6366f1' }} />
                        )}
                        {isSorted === 'desc' && (
                          <ArrowDownwardIcon sx={{ fontSize: 13, color: '#6366f1' }} />
                        )}
                      </div>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 8 }}>
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <p className={`font-semibold text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Loading loan numbers...
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : currentPageRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 8, color: isDark ? '#94a3b8' : '#64748b' }}>
                  <div className="flex flex-col items-center gap-2.5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                      <FormatListNumberedIcon style={{ fontSize: 26 }} />
                    </div>
                    <p className={`font-bold text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      No loan numbers found
                    </p>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Try adjusting your search query or filters.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              currentPageRows.map((row) => (
                <TableRow
                  key={row.id}
                  sx={{
                    '&:hover': {
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.035)' : 'rgba(248, 250, 252, 0.9)',
                    },
                    transition: 'background-color 0.15s ease',
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      align={cell.column.id === 'actions' ? 'right' : 'left'}
                      sx={{
                        px: 2,
                        py: 1.3,
                        borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid #f1f5f9',
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Standard Table Pagination Footer */}
      <div className={`flex-shrink-0 border-t ${isDark ? 'border-slate-800/80 bg-slate-900/90' : 'border-slate-200/80 bg-white'}`}>
        <TablePaginationComponent
          table={table}
          totalData={totalCustomers}
          page={page}
          setPage={(newPage) => setPage(newPage)}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 20, 25, 50]}
        />
      </div>
    </Paper>
  );
}
