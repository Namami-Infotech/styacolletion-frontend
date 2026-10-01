import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

  const handleCustomerView = (customer) => {
    if (onViewClick) {
      onViewClick(customer);
    } else {
      const custIdentifier = customer?.slug || customer?.id || customer?._id || customer?.customer_id;
      if (custIdentifier) {
        navigate(`/customers/details/${custIdentifier}`, {
          state: { customer },
        });
      }
    }
  };

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
    if (st === 'closed') {
      return {
        label: 'Closed',
        style: {
          backgroundColor: isDark ? 'rgba(59, 130, 246, 0.12)' : '#eff6ff',
          color: isDark ? '#60a5fa' : '#1d4ed8',
          border: isDark ? '1px solid rgba(59, 130, 246, 0.25)' : '1px solid #bfdbfe',
          fontWeight: 700,
          borderRadius: '9999px',
          fontSize: '0.72rem',
          height: '22px',
        },
      };
    }
    return {
      label: status || 'Pending',
      style: {
        backgroundColor: isDark ? 'rgba(234, 179, 8, 0.12)' : '#fefce8',
        color: isDark ? '#facc15' : '#a16207',
        border: isDark ? '1px solid rgba(234, 179, 8, 0.25)' : '1px solid #fef08a',
        fontWeight: 700,
        borderRadius: '9999px',
        fontSize: '0.72rem',
        height: '22px',
      },
    };
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        id: 'name',
        header: 'Member Name',
        cell: ({ row }) => {
          const name = formatCellText(row.original.name);
          return (
            <div
              onClick={() => handleCustomerView(row.original)}
              className="flex items-center gap-2.5 min-w-[160px] cursor-pointer group select-none"
              title="Click to view customer details"
            >
              <Avatar
                alt={name !== 'N/A' ? name : 'M'}
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: isDark ? '#3b82f6' : '#2563eb',
                  color: '#ffffff',
                  fontWeight: 'bold',
                  fontSize: '13px',
                }}
              >
                {(name !== 'N/A' ? name : 'M').charAt(0).toUpperCase()}
              </Avatar>
              <div
                className={`font-bold text-xs whitespace-nowrap group-hover:underline ${
                  isDark
                    ? 'text-blue-400 group-hover:text-blue-300'
                    : 'text-blue-600 group-hover:text-blue-800'
                }`}
              >
                {name}
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor('member_no', {
        id: 'member_no',
        header: 'Member No.',
        cell: ({ row }) => (
          <span className={`text-xs font-mono font-semibold whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
            {formatCellText(row.original.member_no||row.original.customer_id)}
          </span>
        ),
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
        header: 'ContactNumber',
        cell: ({ row }) => (
          <span className={`text-xs font-mono font-bold whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
            {formatCellText(row.original.phone)}
          </span>
        ),
      }),
      columnHelper.accessor('spouseName', {
        id: 'spouseName',
        header: 'SpouseName',
        cell: ({ row }) => (
          <span className={`text-xs font-semibold whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
            {formatCellText(row.original.spouseName)}
          </span>
        ),
      }),
      columnHelper.accessor('loanStatus', {
        id: 'loanStatus',
        header: 'Status',
        cell: ({ row }) => {
          const st = row.original.loanStatus;
          return <Chip size="small" {...getStatusChipProps(st)} />;
        },
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
      columnHelper.accessor('purpose', {
        id: 'purpose',
        header: 'Purpose',
        cell: ({ row }) => (
          <span className={`text-xs font-semibold whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
            {formatCellText(row.original.purpose)}
          </span>
        ),
      }),
      columnHelper.accessor('reschedule', {
        id: 'reschedule',
        header: 'Reschedule',
        cell: ({ row }) => (
          <span className={`text-xs font-semibold whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
            {formatCellText(row.original.reschedule)}
          </span>
        ),
      }),
      columnHelper.accessor('loanNo', {
        id: 'loanNo',
        header: 'Loan NO.',
        cell: ({ row }) => (
          <span className={`font-mono text-xs font-semibold whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
            {formatCellText(row.original.loanNo)}
          </span>
        ),
      }),
      columnHelper.accessor('loan_series', {
        id: 'loan_series',
        header: 'LOAN series',
        cell: ({ row }) => (
          <span className={`text-xs font-semibold whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
            {formatCellText(row.original.loan_series)}
          </span>
        ),
      }),
      columnHelper.accessor('oldLoanNo', {
        id: 'oldLoanNo',
        header: 'OldLoanNo',
        cell: ({ row }) => (
          <span className={`font-mono text-xs font-semibold whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
            {formatCellText(row.original.oldLoanNo)}
          </span>
        ),
      }),
      columnHelper.accessor('cycle', {
        id: 'cycle',
        header: 'Cycle',
        cell: ({ row }) => (
          <span className={`text-xs font-semibold whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
            {formatCellText(row.original.cycle)}
          </span>
        ),
      }),
      columnHelper.accessor('loanDisbDate', {
        id: 'loanDisbDate',
        header: 'LoanDisbDate',
        cell: ({ row }) => (
          <span className={`text-xs font-semibold whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
            {formatCellText(row.original.loanDisbDate)}
          </span>
        ),
      }),
      columnHelper.accessor('loanAmount', {
        id: 'loanAmount',
        header: 'LoanAmount',
        cell: ({ row }) => (
          <span className={`text-xs font-bold font-mono whitespace-nowrap ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
            {row.original.loanAmount !== null && row.original.loanAmount !== undefined && row.original.loanAmount !== '' ? `₹${row.original.loanAmount}` : 'N/A'}
          </span>
        ),
      }),
      columnHelper.accessor('os_principal', {
        id: 'os_principal',
        header: 'O/S Prin',
        cell: ({ row }) => (
          <span className={`text-xs font-semibold font-mono whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
            {row.original.os_principal !== null && row.original.os_principal !== undefined && row.original.os_principal !== '' ? `₹${row.original.os_principal}` : 'N/A'}
          </span>
        ),
      }),
      columnHelper.accessor('os_interest', {
        id: 'os_interest',
        header: 'O/S Int',
        cell: ({ row }) => (
          <span className={`text-xs font-semibold font-mono whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
            {row.original.os_interest !== null && row.original.os_interest !== undefined && row.original.os_interest !== '' ? `₹${row.original.os_interest}` : 'N/A'}
          </span>
        ),
      }),
      columnHelper.accessor('par', {
        id: 'par',
        header: 'PAR',
        cell: ({ row }) => (
          <span className={`text-xs font-semibold whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
            {formatCellText(row.original.par)}
          </span>
        ),
      }),
      columnHelper.accessor('od_principal', {
        id: 'od_principal',
        header: 'ODPrin',
        cell: ({ row }) => (
          <span className={`text-xs font-semibold font-mono whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
            {row.original.od_principal !== null && row.original.od_principal !== undefined && row.original.od_principal !== '' ? `₹${row.original.od_principal}` : 'N/A'}
          </span>
        ),
      }),
      columnHelper.accessor('od_interest', {
        id: 'od_interest',
        header: 'ODInt',
        cell: ({ row }) => (
          <span className={`text-xs font-semibold font-mono whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
            {row.original.od_interest !== null && row.original.od_interest !== undefined && row.original.od_interest !== '' ? `₹${row.original.od_interest}` : 'N/A'}
          </span>
        ),
      }),
      columnHelper.accessor('totalDueAmount', {
        id: 'totalDueAmount',
        header: 'TotalDueAmt',
        cell: ({ row }) => (
          <span className={`text-xs font-bold font-mono whitespace-nowrap ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
            {row.original.totalDueAmount !== null && row.original.totalDueAmount !== undefined && row.original.totalDueAmount !== '' ? `₹${row.original.totalDueAmount}` : 'N/A'}
          </span>
        ),
      }),
      columnHelper.accessor('total_principal_collectible', {
        id: 'total_principal_collectible',
        header: 'TotalPrinColl',
        cell: ({ row }) => (
          <span className={`text-xs font-semibold font-mono whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
            {row.original.total_principal_collectible !== null && row.original.total_principal_collectible !== undefined && row.original.total_principal_collectible !== '' ? `₹${row.original.total_principal_collectible}` : 'N/A'}
          </span>
        ),
      }),
      columnHelper.accessor('total_interest_collectible', {
        id: 'total_interest_collectible',
        header: 'TotalIntColl',
        cell: ({ row }) => (
          <span className={`text-xs font-semibold font-mono whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
            {row.original.total_interest_collectible !== null && row.original.total_interest_collectible !== undefined && row.original.total_interest_collectible !== '' ? `₹${row.original.total_interest_collectible}` : 'N/A'}
          </span>
        ),
      }),
      columnHelper.accessor('irrRate', {
        id: 'irrRate',
        header: 'IrrRate',
        cell: ({ row }) => (
          <span className={`text-xs font-semibold whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
            {row.original.irrRate ? `${row.original.irrRate}%` : 'N/A'}
          </span>
        ),
      }),
      columnHelper.accessor('noOfInstallment', {
        id: 'noOfInstallment',
        header: 'NoOfInstallment',
        cell: ({ row }) => (
          <span className={`text-xs font-semibold whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
            {formatCellText(row.original.noOfInstallment)}
          </span>
        ),
      }),
      columnHelper.accessor('installmentAmount', {
        id: 'installmentAmount',
        header: 'InstallmentAmount',
        cell: ({ row }) => (
          <span className={`text-xs font-semibold font-mono whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
            {row.original.installmentAmount !== null && row.original.installmentAmount !== undefined && row.original.installmentAmount !== '' ? `₹${row.original.installmentAmount}` : 'N/A'}
          </span>
        ),
      }),
      columnHelper.accessor('paidInstNo', {
        id: 'paidInstNo',
        header: 'PaidInstNo',
        cell: ({ row }) => (
          <span className={`text-xs font-semibold whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
            {formatCellText(row.original.paidInstNo)}
          </span>
        ),
      }),
      columnHelper.accessor('lastDueDate', {
        id: 'lastDueDate',
        header: 'LastDueDate',
        cell: ({ row }) => (
          <span className={`text-xs font-semibold whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
            {formatCellText(row.original.lastDueDate)}
          </span>
        ),
      }),
      columnHelper.accessor('lastPaidTrxDate', {
        id: 'lastPaidTrxDate',
        header: 'LastPaidTrxDate',
        cell: ({ row }) => (
          <span className={`text-xs font-semibold whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
            {formatCellText(row.original.lastPaidTrxDate)}
          </span>
        ),
      }),
      columnHelper.accessor('lastTrxAmount', {
        id: 'lastTrxAmount',
        header: 'LastTrxAmount',
        cell: ({ row }) => (
          <span className={`text-xs font-semibold font-mono whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
            {row.original.lastTrxAmount !== null && row.original.lastTrxAmount !== undefined && row.original.lastTrxAmount !== '' ? `₹${row.original.lastTrxAmount}` : 'N/A'}
          </span>
        ),
      }),
      columnHelper.accessor('maturityDate', {
        id: 'maturityDate',
        header: 'MaturityDate',
        cell: ({ row }) => (
          <span className={`text-xs font-semibold whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
            {formatCellText(row.original.maturityDate)}
          </span>
        ),
      }),
      columnHelper.accessor('dpd', {
        id: 'dpd',
        header: 'DPD',
        cell: ({ row }) => (
          <span className={`text-xs font-semibold whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
            {formatCellText(row.original.dpd)}
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
      columnHelper.accessor('branch_code', {
        id: 'branch_code',
        header: 'Branch Code',
        cell: ({ row }) => (
          <span className={`text-xs font-semibold whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
            {formatCellText(row.original.branch_code)}
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
      columnHelper.accessor('village_name', {
        id: 'village_name',
        header: 'Village Name',
        cell: ({ row }) => (
          <span className={`text-xs font-semibold whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
            {formatCellText(row.original.village_name)}
          </span>
        ),
      }),
      columnHelper.accessor('center', {
        id: 'center',
        header: 'Center Name',
        cell: ({ row }) => (
          <span className={`text-xs font-semibold whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
            {formatCellText(row.original.center)}
          </span>
        ),
      }),
      columnHelper.accessor('center_code', {
        id: 'center_code',
        header: 'Center Code',
        cell: ({ row }) => (
          <span className={`text-xs font-semibold whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
            {formatCellText(row.original.center_code)}
          </span>
        ),
      }),
      columnHelper.accessor('location', {
        id: 'location',
        header: 'Address',
        cell: ({ row }) => (
          <span className={`text-xs font-semibold whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
            {formatCellText(row.original.location)}
          </span>
        ),
      }),
      columnHelper.accessor('owner', {
        id: 'owner',
        header: 'Mapped Emp name',
        cell: ({ row }) => (
          <span className={`text-xs font-semibold whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
            {formatCellText(row.original.owner?.name ?? row.original.owner)}
          </span>
        ),
      }),
      columnHelper.accessor('remarks', {
        id: 'remarks',
        header: 'Remarks',
        cell: ({ row }) => (
          <span className={`text-xs font-semibold whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
            {formatCellText(row.original.remarks)}
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
            {hasPermission("customer", "view") && (
              <Tooltip title="View Details">
                <IconButton
                  size="small"
                  onClick={() => handleCustomerView(row.original)}
                  sx={{
                    color: isDark ? '#818cf8' : '#0f172a',
                    '&:hover': { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.15)' : '#e2e8f0' },
                  }}
                >
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

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
      className={`flex flex-col rounded-2xl border overflow-hidden w-full transition-all duration-200 ${
        isDark
          ? 'border-slate-800/80 bg-slate-900/70 shadow-2xl backdrop-blur-xl ring-1 ring-white/5'
          : 'border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-900/5'
      }`}
      sx={{ width: '100%', margin: 0, maxHeight: maxHeight || 'calc(100vh - 170px)' }}
    >
      {/* Scrollable Table Container */}
      <TableContainer className="overflow-auto w-full min-h-0 custom-scrollbar" sx={{ maxHeight: maxHeight ? `calc(${maxHeight} - 45px)` : 'calc(100vh - 220px)' }}>
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
                      Loading customers...
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : currentPageRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 8, color: isDark ? '#94a3b8' : '#64748b' }}>
                  <div className="flex flex-col items-center gap-2.5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                      <PeopleIcon style={{ fontSize: 26 }} />
                    </div>
                    <p className={`font-bold text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      No customers found
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

      {/* Pagination Footer */}
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
