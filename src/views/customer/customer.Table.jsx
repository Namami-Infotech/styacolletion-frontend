import React, { useEffect, useMemo, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
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
import LazyAvatar from '../../components/common/LazyAvatar';

import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PeopleIcon from '@mui/icons-material/People';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { CustomerRoute } from '../../routes/customers/customer.route.js';
import { useAuth } from '../../contexts/AuthContext.jsx';

const columnHelper = createColumnHelper();

const formatCellText = (val, fallback = 'N/A') => {
  if (val === null || val === undefined || val === '') return fallback;
  if (Array.isArray(val)) {
    if (val.length === 0) return fallback;
    return val.map((item) => formatCellText(item, fallback)).join(', ');
  }
  if (typeof val === 'object') {
    return val.name || val.title || val.label || val.identity || (val.id ? `ID: ${val.id}` : fallback);
  }
  return String(val);
};

export default function CustomerTable({
  searchTerm = '',
  selectedStatus = 'All',
  onViewClick,
  onEditClick,
  onDeleteClick,
  maxHeight,
  columnVisibility = {},
  refreshTrigger = 0,
}) {
  const [sorting, setSorting] = useState([]);
  const { isDark } = useThemeMode();
  const [customers, setCustomers] = useState([]);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [loading, setLoading] = useState(false);
  const { hasPermission } = useAuth();
  // Server-side pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await CustomerRoute.getCustomers({
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm || undefined,
        loanStatus: selectedStatus !== 'All' ? selectedStatus : undefined,
      });

      if (res?.success && res?.data?.customers) {
        setCustomers(res.data.customers);
        setTotalCustomers(res.data.totalItems ?? res.data.customers.length);
      } else {
        setCustomers([]);
        setTotalCustomers(0);
      }
    } catch (err) {
      console.error('Failed to fetch customers:', err);
      setCustomers([]);
      setTotalCustomers(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(0);
  }, [searchTerm, selectedStatus]);

  useEffect(() => {
    fetchCustomers();
  }, [page, rowsPerPage, searchTerm, selectedStatus, refreshTrigger]);

  const getStatusChipProps = (status) => {
    const st = String(status || '').toLowerCase();
    if (st === 'open' || st === 'active') {
      return {
        label: 'Open',
        style: {
          backgroundColor: isDark ? 'rgba(34, 197, 94, 0.15)' : '#dcfce7',
          color: isDark ? '#4ade80' : '#14532d',
          border: isDark ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid #86efac',
          fontWeight: 700,
        },
      };
    }
    if (st === 'closed') {
      return {
        label: 'Closed',
        style: {
          backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#dbeafe',
          color: isDark ? '#60a5fa' : '#1e40af',
          border: isDark ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid #93c5fd',
          fontWeight: 700,
        },
      };
    }
    return {
      label: status || 'Pending',
      style: {
        backgroundColor: isDark ? 'rgba(234, 179, 8, 0.15)' : '#fef9c3',
        color: isDark ? '#fde047' : '#713f12',
        border: isDark ? '1px solid rgba(234, 179, 8, 0.3)' : '1px solid #fde047',
        fontWeight: 700,
      },
    };
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        id: 'name',
        header: 'Customer Name',
        cell: ({ row }) => {
          const name = formatCellText(row.original.name);
          const email = formatCellText(row.original.email);
          const img = typeof row.original.image === 'string' && row.original.image.startsWith('http') ? row.original.image : null;
          return (
            <div className="flex items-center gap-3 min-w-[180px]">
              <Avatar
                src={img}
                alt={name !== 'N/A' ? name : 'C'}
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: isDark ? '#3b82f6' : '#2563eb',
                  color: '#ffffff',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  border: isDark ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid #cbd5e1',
                }}
              >
                {(name !== 'N/A' ? name : 'C').charAt(0).toUpperCase()}
              </Avatar>
              <div>
                <div className={`font-bold text-xs whitespace-nowrap ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {name}
                </div>
                <div className={`text-[11px] font-semibold whitespace-nowrap ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {email}
                </div>
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor('customer_id', {
        id: 'customer_id',
        header: 'Customer ID',
        cell: ({ row }) => (
          <span
            className={`font-mono text-xs font-bold px-2 py-0.5 rounded border whitespace-nowrap ${
              isDark
                ? 'bg-slate-800/80 text-blue-300 border-slate-700/60'
                : 'bg-slate-100 text-blue-900 border-blue-200'
            }`}
          >
            {formatCellText(row.original.customer_id)}
          </span>
        ),
      }),
      columnHelper.accessor('phone', {
        id: 'phone',
        header: 'Phone Number',
        cell: ({ row }) => (
          <span className={`text-xs font-mono font-bold whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
            {formatCellText(row.original.phone)}
          </span>
        ),
      }),
      columnHelper.accessor('loanStatus', {
        id: 'loanStatus',
        header: 'Loan Status',
        cell: ({ row }) => {
          const st = row.original.loanStatus;
          return <Chip size="small" {...getStatusChipProps(st)} />;
        },
      }),
      columnHelper.accessor('owner', {
        id: 'owner',
        header: 'Owner',
        cell: ({ row }) => (
          <span className={`text-xs font-semibold whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
            {formatCellText(row.original.owner?.name ?? row.original.owner)}
          </span>
        ),
      }),
      columnHelper.accessor('loanType', {
        id: 'loanType',
        header: 'Loan Type',
        cell: ({ row }) => (
          <span className={`text-xs font-semibold whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
            {formatCellText(row.original.loanType)}
          </span>
        ),
      }),
      columnHelper.accessor('loanNo', {
        id: 'loanNo',
        header: 'Loan No',
        cell: ({ row }) => (
          <span className={`font-mono text-xs font-semibold whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
            {formatCellText(row.original.loanNo)}
          </span>
        ),
      }),
      columnHelper.accessor('loanAmount', {
        id: 'loanAmount',
        header: 'Loan Amount',
        cell: ({ row }) => (
          <span className={`text-xs font-bold font-mono whitespace-nowrap ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
            {row.original.loanAmount ? `₹${row.original.loanAmount}` : 'N/A'}
          </span>
        ),
      }),
      columnHelper.accessor('totalDueAmount', {
        id: 'totalDueAmount',
        header: 'Total Due',
        cell: ({ row }) => (
          <span className={`text-xs font-bold font-mono whitespace-nowrap ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
            {row.original.totalDueAmount ? `₹${row.original.totalDueAmount}` : 'N/A'}
          </span>
        ),
      }),
      columnHelper.accessor('location', {
        id: 'location',
        header: 'Location',
        cell: ({ row }) => (
          <span className={`text-xs font-semibold whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
            {formatCellText(row.original.location)}
          </span>
        ),
      }),
      columnHelper.accessor('district', {
        id: 'district',
        header: 'District',
        cell: ({ row }) => (
          <span className={`text-xs font-semibold whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
            {formatCellText(row.original.district)}
          </span>
        ),
      }),
      columnHelper.accessor('state', {
        id: 'state',
        header: 'State',
        cell: ({ row }) => (
          <span className={`text-xs font-semibold whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
            {formatCellText(row.original.state)}
          </span>
        ),
      }),
      columnHelper.accessor('branch', {
        id: 'branch',
        header: 'Branch',
        cell: ({ row }) => (
          <span className={`text-xs font-semibold whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
            {formatCellText(row.original.branch)}
          </span>
        ),
      }),
      columnHelper.accessor('spouseName', {
        id: 'spouseName',
        header: 'Spouse Name',
        cell: ({ row }) => (
          <span className={`text-xs font-semibold whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
            {formatCellText(row.original.spouseName)}
          </span>
        ),
      }),
      columnHelper.accessor('dpd', {
        id: 'dpd',
        header: 'DPD',
        cell: ({ row }) => (
          <span className={`text-xs font-mono font-bold whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
            {formatCellText(row.original.dpd)}
          </span>
        ),
      }),
      columnHelper.accessor('createdAt', {
        id: 'createdAt',
        header: 'Created On',
        cell: ({ row }) => (
          <span className={`text-xs font-semibold whitespace-nowrap ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {row.original.createdAt ? new Date(row.original.createdAt).toLocaleDateString() : 'N/A'}
          </span>
        ),
      }),
      columnHelper.display({
        id: 'actions',
        header: 'ACTIONS',
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1 min-w-[110px]">
           {/* {hasPermission("customer", "view") && <Tooltip title="View Details">
              <IconButton
                size="small"
                onClick={() => onViewClick && onViewClick(row.original)}
                sx={{
                  color: isDark ? '#818cf8' : '#0f172a',
                  '&:hover': { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.15)' : '#e2e8f0' },
                }}
              >
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>} */}

            {hasPermission("customer", "edit") && <Tooltip title="Edit Customer">
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
            </Tooltip>}

            {hasPermission("customer", "delete") && <Tooltip title="Delete Customer">
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
            </Tooltip>}
          </div>
        ),
      }),
    ],
    [onViewClick, onEditClick, onDeleteClick, isDark,hasPermission]
  );

  const table = useReactTable({
    data: customers,
    columns,
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
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: Math.ceil((totalCustomers || 0) / rowsPerPage) || 1,
  });

  const currentPageRows = table.getRowModel().rows;

  if (loading) {
    return (
      <TableSkeleton
        columns={columns.length}
        rows={rowsPerPage}
        maxHeight={maxHeight}
        avatarColIndex={0}
      />
    );
  }

  return (
    <Paper
      className={`flex flex-col flex-1 min-h-0 rounded-2xl border shadow-xl overflow-hidden w-full transition-colors duration-200 ${
        isDark ? 'border-slate-800/80 bg-slate-900/70' : 'border-slate-200 bg-white'
      }`}
      sx={{ width: '100%', margin: 0 }}
    >
      {/* Scrollable Table Container */}
      <TableContainer className="overflow-auto w-full flex-1 min-h-0" sx={{ maxHeight: maxHeight || 'none' }}>
        <Table sx={{ width: 'max-content', minWidth: '100%' }} aria-label="customer table" stickyHeader>
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
                        backgroundColor: isDark ? '#0f172a !important' : '#f1f5f9 !important',
                        cursor: canSort ? 'pointer' : 'default',
                        userSelect: 'none',
                      }}
                      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                    >
                      <div className={`flex items-center gap-1 ${header.id === 'actions' ? 'justify-end' : ''}`}>
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
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 6 }}>
                  <p className={`font-semibold text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Loading customers...
                  </p>
                </TableCell>
              </TableRow>
            ) : currentPageRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 6, color: isDark ? '#94a3b8' : '#64748b' }}>
                  <div className="flex flex-col items-center gap-2">
                    <PeopleIcon className={isDark ? 'text-slate-600' : 'text-slate-400'} style={{ fontSize: 48 }} />
                    <p className={`font-semibold text-base ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      No customers found
                    </p>
                    <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
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
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc',
                    },
                    transition: 'background-color 0.15s ease',
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} align={cell.column.id === 'actions' ? 'right' : 'left'} sx={{ px: 1.5, py: 1.2 }}>
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
