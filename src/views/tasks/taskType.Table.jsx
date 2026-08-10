import React, { useMemo, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
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
import { useAuth } from '../../contexts/AuthContext';
import TablePaginationComponent from '../../components/common/TablePaginationComponent';
import TableSkeleton from '../../components/common/TableSkeleton';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

const columnHelper = createColumnHelper();

export default function TaskTypeTable({
  taskTypes = [],
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
  const { hasPermission } = useAuth();

  const canEdit = hasPermission('tasktype', 'edit');
  const canDelete = hasPermission('tasktype', 'delete');

  const columns = useMemo(
    () => [
      columnHelper.accessor('task_type_id', {
        id: 'task_type_id',
        header: 'ID',
        cell: ({ row }) => (
          <span className={`text-xs font-mono font-semibold px-2.5 py-1 rounded-lg border whitespace-nowrap ${
            isDark ? 'bg-slate-800/80 text-indigo-400 border-slate-700' : 'bg-slate-100 text-indigo-600 border-slate-200'
          }`}>
            {row.original.task_type_id || `#${row.original.id}`}
          </span>
        ),
      }),
      columnHelper.accessor('name', {
        id: 'name',
        header: 'Task Type Name',
        cell: ({ row }) => (
          <div className="font-bold text-xs sm:text-sm whitespace-nowrap">
            {row.original.name || '-'}
          </div>
        ),
      }),
      columnHelper.accessor('createdBy', {
        id: 'createdBy',
        header: 'Created By',
        cell: ({ row }) => {
          const creator = row.original.createdBy;
          const creatorName = creator?.name ?? (typeof creator === 'string' ? creator : null) ?? '-';
          return (
            <span className={`text-xs whitespace-nowrap ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {creatorName}
            </span>
          );
        },
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
            {canEdit && (
              <Tooltip title="Edit Task Type">
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
            )}

            {canDelete && (
              <Tooltip title="Delete Task Type">
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
            )}
          </div>
        ),
      }),
    ],
    [onEditClick, onDeleteClick, isDark, canEdit, canDelete]
  );

  const table = useReactTable({
    data: taskTypes,
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
      elevation={0}
      className={`flex flex-col rounded-2xl border shadow-xl overflow-hidden w-full transition-colors duration-200 ${
        isDark ? 'border-slate-800/80 bg-slate-900/70' : 'border-slate-200 bg-white'
      }`}
      sx={{ width: '100%', margin: 0, maxHeight: maxHeight || 'calc(100vh - 170px)' }}
    >
      <TableContainer
        className="overflow-auto w-full min-h-0 custom-scrollbar"
        sx={{ maxHeight: maxHeight ? `calc(${maxHeight} - 45px)` : 'calc(100vh - 220px)' }}
      >
        <Table stickyHeader size="small" sx={{ width: '100%' }}>
          <TableHead sx={{ position: 'sticky', top: 0, zIndex: 30 }}>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const isActionCol = header.id === 'actions';
                  return (
                    <TableCell
                      key={header.id}
                      align={isActionCol ? 'right' : 'left'}
                      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                      sx={{
                        backgroundColor: isDark ? '#0f172a !important' : '#f8fafc !important',
                        color: isDark ? '#94a3b8' : '#475569',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        borderBottom: isDark ? '1px solid #1e293b' : '1px solid #e2e8f0',
                        cursor: canSort ? 'pointer' : 'default',
                        userSelect: 'none',
                        py: 1.5,
                      }}
                    >
                      <div className={`flex items-center gap-1 ${isActionCol ? 'justify-end' : 'justify-start'}`}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {canSort && (
                          <span className="ml-1">
                            {{
                              asc: <ArrowUpwardIcon sx={{ fontSize: 14 }} />,
                              desc: <ArrowDownwardIcon sx={{ fontSize: 14 }} />,
                            }[header.column.getIsSorted()] ?? null}
                          </span>
                        )}
                      </div>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableHead>

          <TableBody>
            {taskTypes.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  align="center"
                  sx={{ py: 8, color: isDark ? '#64748b' : '#94a3b8' }}
                >
                  <p className="text-sm font-semibold">No Task Types found</p>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  hover
                  sx={{
                    '&:hover': {
                      backgroundColor: isDark ? 'rgba(30, 41, 59, 0.5)' : '#f8fafc',
                    },
                    '& .MuiTableCell-root': {
                      borderBottom: isDark ? '1px solid #1e293b' : '1px solid #f1f5f9',
                      py: 1.5,
                    },
                  }}
                >
                  {row.getVisibleCells().map((cell) => {
                    const isActionCol = cell.column.id === 'actions';
                    return (
                      <TableCell key={cell.id} align={isActionCol ? 'right' : 'left'}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <div className={`flex-shrink-0 border-t ${isDark ? 'border-slate-800/80 bg-slate-900/90' : 'border-slate-200 bg-white'}`}>
        <TablePaginationComponent
          totalCount={totalData}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
        />
      </div>
    </Paper>
  );
}
