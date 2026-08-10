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
import { useNavigate } from 'react-router-dom';

import TablePaginationComponent from '../../components/common/TablePaginationComponent';
import TableSkeleton from '../../components/common/TableSkeleton';

import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

const fuzzyFilter = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value);
  addMeta({ itemRank });
  return itemRank.passed;
};

const columnHelper = createColumnHelper();

const formatNameOrVal = (val, fallbackVal) => {
  if (val && typeof val === 'object') {
    return val.name || val.title || val.slug || (val.id != null ? String(val.id) : 'N/A');
  }
  if (val != null && typeof val !== 'object') {
    return String(val);
  }
  if (fallbackVal && typeof fallbackVal === 'object') {
    return fallbackVal.name || fallbackVal.title || fallbackVal.slug || (fallbackVal.id != null ? String(fallbackVal.id) : 'N/A');
  }
  if (fallbackVal != null && typeof fallbackVal !== 'object') {
    return String(fallbackVal);
  }
  return 'N/A';
};

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
    label: status ? (String(status).charAt(0).toUpperCase() + String(status).slice(1)) : 'Inactive',
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

export default function OfficeTable({
  filteredTasks,
  offices = [],
  totalData,
  page = 0,
  rowsPerPage = 10,
  onPageChange,
  onRowsPerPageChange,
  onViewClick,
  onEditClick,
  onDeleteClick,
  getStatusChipProps,
  maxHeight,
  columnVisibility = {},
  loading = false,
}) {
  const [sorting, setSorting] = useState([]);
  const { isDark } = useThemeMode();
  const navigate = useNavigate();

  const dataList = offices.length > 0 ? offices : (filteredTasks || []);
  const totalCount = totalData !== undefined ? totalData : dataList.length;

  const columns = useMemo(
    () => {
      const cols = [
        columnHelper.accessor('name', {
          id: 'name',
          header: 'Office Name',
          cell: ({ row }) => (
            <div className="flex flex-col">
              <span
                className={`font-bold text-xs whitespace-nowrap ${
                  isDark ? 'text-slate-100' : 'text-slate-900'
                }`}
              >
                {row.original.name ?? 'N/A'}
              </span>
              {row.original.office_id && (
                <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {row.original.office_id}
                </span>
              )}
            </div>
          ),
        }),
        columnHelper.accessor('address', {
          id: 'address',
          header: 'Address',
          cell: ({ row }) => (
            <span
              className={`font-medium text-xs whitespace-nowrap max-w-xs truncate block ${
                isDark ? 'text-slate-200' : 'text-slate-800'
              }`}
              title={row.original.address || ''}
            >
              {row.original.address ?? 'N/A'}
            </span>
          ),
        }),
        columnHelper.accessor('state', {
          id: 'state',
          header: 'State',
          cell: ({ row }) => (
            <span className={`text-xs whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {formatNameOrVal(row.original?.state, row.original?.state_id || row.original?.state_name)}
            </span>
          ),
        }),
        columnHelper.accessor('region', {
          id: 'region',
          header: 'Region',
          cell: ({ row }) => (
            <span className={`text-xs whitespace-nowrap ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
              {formatNameOrVal(row.original?.region, row.original?.region_id || row.original?.region_name)}
            </span>
          ),
        }),
        columnHelper.accessor('branch', {
          id: 'branch',
          header: 'Branch',
          cell: ({ row }) => (
            <span className={`text-xs whitespace-nowrap ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
              {formatNameOrVal(row.original?.branch, row.original?.branch_id || row.original?.branch_name)}
            </span>
          ),
        }),
        columnHelper.accessor('radius', {
          id: 'radius',
          header: 'Punchin Radius',
          cell: ({ row }) => (
            <span className={`text-xs font-semibold whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {row.original.radius != null ? `${row.original.radius} m` : 'N/A'}
            </span>
          ),
        }),
        columnHelper.accessor('status', {
          id: 'status',
          header: 'Status',
          cell: ({ row }) => {
            const chipProps = getStatusChipProps
              ? getStatusChipProps(row.original.status)
              : defaultGetStatusChipProps(row.original.status, isDark);
            return <Chip size="small" {...chipProps} />;
          },
        }),
      ];

      if (onViewClick || onEditClick || onDeleteClick) {
        cols.push(
          columnHelper.accessor('actions', {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
              <div className="flex items-center justify-end gap-1">
                {/* {onViewClick && (
                  <Tooltip title="View Details">
                    <IconButton size="small" onClick={() => onViewClick(row.original)} color="info">
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )} */}
                {onEditClick && (
                  <Tooltip title="Edit Office">
                    <IconButton size="small" onClick={() => onEditClick(row.original)} color="primary">
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
                {onDeleteClick && (
                  <Tooltip title="Delete Office">
                    <IconButton size="small" onClick={() => onDeleteClick(row.original)} color="error">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </div>
            ),
          })
        );
      }

      return cols;
    },
    [isDark, onViewClick, onEditClick, onDeleteClick, getStatusChipProps]
  );

  const table = useReactTable({
    data: dataList,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    state: {
      sorting,
      columnVisibility,
      pagination: {
        pageIndex: page,
        pageSize: rowsPerPage,
      },
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: Math.ceil((totalData || 0) / rowsPerPage) || 1,
  });

  const currentPageRows = table.getRowModel().rows;

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
      sx={{
        width: '100%',
        margin: 0,
        maxHeight: maxHeight || 'calc(100vh - 170px)',
      }}
    >
      {/* Scrollable Table Container */}
      <TableContainer className="overflow-auto w-full min-h-0 custom-scrollbar" sx={{ maxHeight: maxHeight ? `calc(${maxHeight} - 45px)` : 'calc(100vh - 220px)' }}>
        <Table sx={{ width: 'max-content', minWidth: '100%' }} aria-label="office table" stickyHeader>
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
                        px: 1.5,
                        py: 1.2,
                        whiteSpace: 'nowrap',
                        backgroundColor: isDark ? '#0f172a !important' : '#f1f5f9 !important',
                        cursor: canSort ? 'pointer' : 'default',
                        userSelect: 'none',
                      }}
                      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                    >
                      <div className={`flex items-center gap-1 whitespace-nowrap ${header.id === 'actions' ? 'justify-end' : ''}`}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {isSorted === 'asc' && (
                          <ArrowUpwardIcon sx={{ fontSize: 14, color: isDark ? '#818cf8' : '#0f172a' }} />
                        )}
                        {isSorted === 'desc' && (
                          <ArrowDownwardIcon sx={{ fontSize: 14, color: isDark ? '#818cf8' : '#0f172a' }} />
                        )}
                      </div>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableHead>

          <TableBody>
            {currentPageRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 6, color: isDark ? '#94a3b8' : '#64748b' }}>
                  <div className="flex flex-col items-center gap-2">
                    <LocationCityIcon className={isDark ? 'text-slate-600' : 'text-slate-400'} style={{ fontSize: 48 }} />
                    <p className={`font-semibold text-base ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      No offices matching your criteria
                    </p>
                    <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                      Try adjusting your search or status filter.
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
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc',
                    },
                    transition: 'background-color 0.15s ease',
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} align={cell.column.id === 'actions' ? 'right' : 'left'} sx={{ px: 1.5, py: 1.5, whiteSpace: 'nowrap' }}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Fixed Footer TablePaginationComponent passing TanStack table instance */}
      <div className={`flex-shrink-0 border-t ${isDark ? 'border-slate-800/80 bg-slate-900/90' : 'border-slate-200 bg-white'}`}>
        <TablePaginationComponent
          table={table}
          totalData={totalCount}
          page={page}
          setPage={(newPage) => onPageChange && onPageChange(null, newPage)}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
          rowsPerPageOptions={[10, 20, 25, 50]}
        />
      </div>
    </Paper>
  );
}
