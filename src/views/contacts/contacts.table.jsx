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
import { EmployeeRoute } from '../../routes/employee/employee.route';

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

export default function ContactsTable({
  searchTerm = '',
  selectedStatus = 'All',
  onViewClick,
  onEditClick,
  onDeleteClick,
  maxHeight,
  columnVisibility = {},
}) {
  const [sorting, setSorting] = useState([]);
  const { isDark } = useThemeMode();
  const [contacts, setContacts] = useState([]);
  const [totalContacts, setTotalContacts] = useState(0);
  const [loading, setLoading] = useState(false);

  // Server-side pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const res = await EmployeeRoute.getEmployeeContactWithCustomer({
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm || undefined,
        status: selectedStatus !== 'All' ? selectedStatus : undefined,
      });

      const empList = res?.data?.employees || res?.employees || [];
      const totalCount = res?.data?.totalItems ?? res?.totalItems ?? empList.length;

      if (Array.isArray(empList) && empList.length > 0) {
        setContacts(empList);
        setTotalContacts(totalCount);
      } else {
        setContacts([]);
        setTotalContacts(0);
      }
    } catch (err) {
      console.error('Failed to fetch contacts:', err);
      setContacts([]);
      setTotalContacts(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [page, rowsPerPage, searchTerm, selectedStatus]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        id: 'name',
        header: 'Contact Name',
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
      columnHelper.accessor('emp_id', {
        id: 'contactLink',
        header: 'Contact Link',
        cell: ({ row }) => {
          const ownedCustomers = row.original.ownedCustomers || [];
          const hasOwned = Array.isArray(ownedCustomers) && ownedCustomers.length > 0;

          const tooltipContent = hasOwned ? (
            <div className="p-1 space-y-1.5 text-xs">
              <div className="font-bold border-b border-slate-700 pb-1 text-slate-200">
                Linked Customers ({ownedCustomers.length})
              </div>
              {ownedCustomers.map((cust, idx) => (
                <div key={cust.id || idx} className="flex flex-col gap-0.5 border-b border-slate-800/60 pb-1 last:border-0 last:pb-0">
                  <div className="font-semibold text-blue-400">
                    {cust.name || 'N/A'} {cust.customer_id ? `(${cust.customer_id})` : ''}
                  </div>
                  {cust.email && <div className="text-[11px] text-slate-300">Email: {cust.email}</div>}
                  {cust.phone && <div className="text-[11px] text-slate-300">Phone: {cust.phone}</div>}
                </div>
              ))}
            </div>
          ) : (
            'No linked customers'
          );

          return (
            <Tooltip
              title={tooltipContent}
              arrow
              placement="top"
              slotProps={{
                tooltip: {
                  sx: {
                    bgcolor: isDark ? '#0f172a' : '#1e293b',
                    color: '#ffffff',
                    border: '1px solid',
                    borderColor: isDark ? 'rgba(51, 65, 85, 0.8)' : '#334155',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
                    borderRadius: '12px',
                    padding: '10px 14px',
                    maxWidth: 340,
                  },
                },
                arrow: {
                  sx: {
                    color: isDark ? '#0f172a' : '#1e293b',
                  },
                },
              }}
            >
              <span
                className={`font-mono text-xs font-bold px-2 py-0.5 rounded border whitespace-nowrap cursor-pointer transition-colors ${
                  isDark
                    ? 'bg-slate-800/80 text-blue-300 border-slate-700/60 hover:bg-slate-700/80'
                    : 'bg-slate-100 text-blue-900 border-blue-200 hover:bg-blue-50'
                }`}
              >
                {formatCellText(row.original.contactLink)}
              </span>
            </Tooltip>
          );
        },
      }),
      columnHelper.accessor('countryCode', {
        id: 'countryCode',
        header: 'Country Code',
        cell: ({ row }) => (
          <span className={`text-xs font-mono font-bold whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
            {formatCellText(row.original.countryCode || row.original.countrycode, '91')}
          </span>
        ),
      }),
      columnHelper.accessor('mobile', {
        id: 'mobile',
        header: 'Mobile Number',
        cell: ({ row }) => (
          <span className={`text-xs font-mono font-bold whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
            {formatCellText(row.original.mobile || row.original.mobileNumber)}
          </span>
        ),
      }),
      columnHelper.accessor('email', {
        id: 'email',
        header: 'Email',
        cell: ({ row }) => (
          <span className={`text-xs font-semibold whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
            {formatCellText(row.original.email)}
          </span>
        ),
      }),
      columnHelper.accessor('designations', {
        id: 'designations',
        header: 'Designations',
        cell: ({ row }) => (
          <span className={`text-xs font-semibold whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
            {formatCellText(row.original.designations)}
          </span>
        ),
      }),
      columnHelper.accessor('clientRelation', {
        id: 'clientRelation',
        header: 'Client Relation',
        cell: ({ row }) => (
          <span className={`text-xs font-semibold whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
            {formatCellText(row.original.clientRelation)}
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
      })
    //   columnHelper.display({
    //     id: 'actions',
    //     header: 'ACTIONS',
    //     cell: ({ row }) => (
    //       <div className="flex items-center justify-end gap-1 min-w-[110px]">
    //         <Tooltip title="View Details">
    //           <IconButton
    //             size="small"
    //             onClick={() => onViewClick && onViewClick(row.original)}
    //             sx={{
    //               color: isDark ? '#818cf8' : '#0f172a',
    //               '&:hover': { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.15)' : '#e2e8f0' },
    //             }}
    //           >
    //             <VisibilityIcon fontSize="small" />
    //           </IconButton>
    //         </Tooltip>

    //         <Tooltip title="Edit Contact">
    //           <IconButton
    //             size="small"
    //             onClick={() => onEditClick && onEditClick(row.original)}
    //             sx={{
    //               color: isDark ? '#fbbf24' : '#d97706',
    //               '&:hover': { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : '#fef3c7' },
    //             }}
    //           >
    //             <EditIcon fontSize="small" />
    //           </IconButton>
    //         </Tooltip>

    //         <Tooltip title="Delete Contact">
    //           <IconButton
    //             size="small"
    //             onClick={() => onDeleteClick && onDeleteClick(row.original)}
    //             sx={{
    //               color: isDark ? '#f87171' : '#dc2626',
    //               '&:hover': { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#fee2e2' },
    //             }}
    //           >
    //             <DeleteIcon fontSize="small" />
    //           </IconButton>
    //         </Tooltip>
    //       </div>
    //     ),
    //   }),
    ],
    [onViewClick, onEditClick, onDeleteClick, isDark]
  );

  const table = useReactTable({
    data: contacts,
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
    pageCount: Math.ceil((totalContacts || 0) / rowsPerPage) || 1,
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
        <Table sx={{ width: 'max-content', minWidth: '100%' }} aria-label="contacts table" stickyHeader>
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
                      Loading contacts...
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
                      No contacts found
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
          totalData={totalContacts}
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
