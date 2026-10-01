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
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { attendanceRoute } from '../../routes/attendance/attendance.route';

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

const formatTime = (timeStr) => {
  if (!timeStr) return 'N/A';
  try {
    const date = new Date(timeStr);
    if (isNaN(date.getTime())) return timeStr;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch {
    return timeStr;
  }
};

export default function AttendanceTable({
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
  const [attendanceList, setAttendanceList] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await attendanceRoute.getAllEmployeeAttendance({
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm || undefined,
        status: selectedStatus !== 'All' ? selectedStatus : undefined,
      });

      if (res?.success && res?.data) {
        const records = res.data.attendances || (Array.isArray(res.data) ? res.data : []);
        const total = res.data.totalItems ?? records.length;
        setAttendanceList(records);
        setTotalRecords(total);
      } else {
        setAttendanceList([]);
        setTotalRecords(0);
      }
    } catch (err) {
      console.error('Failed to fetch attendance:', err);
      setAttendanceList([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [page, rowsPerPage, searchTerm, selectedStatus]);

  const getStatusChipProps = (status) => {
    const st = String(status || '').toUpperCase();
    if (st === 'CLOCKED_IN') {
      return {
        label: 'Clocked In',
        style: {
          backgroundColor: isDark ? 'rgba(148, 163, 184, 0.12)' : '#f1f5f9',
          color: isDark ? '#cbd5e1' : '#475569',
          border: isDark ? '1px solid rgba(148, 163, 184, 0.25)' : '1px solid #e2e8f0',
          fontWeight: 700,
          borderRadius: '9999px',
          fontSize: '0.72rem',
          height: '22px',
        },
      };
    }
    if (st === 'PRESENT') {
      return {
        label: 'Present',
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
    if (st === 'ABSENT') {
      return {
        label: 'Absent',
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
    }
    if (st === 'HALF_DAY') {
      return {
        label: 'Half Day',
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
    }
    return {
      label: status || 'Clocked Out',
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
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor('employee', {
        id: 'employee',
        header: 'Employee',
        cell: ({ row }) => {
          const emp = row.original.employee;
          const name = emp?.name || 'N/A';
          const empCode = emp?.emp_id || `ID: ${row.original.employee_id}`;
          const dept = emp?.department || '';

          return (
            <div className="flex items-center gap-3 min-w-[180px]">
              <Avatar
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
                {name.charAt(0).toUpperCase()}
              </Avatar>
              <div>
                <div className={`font-bold text-xs whitespace-nowrap ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {name}
                </div>
                <div className={`text-[11px] font-semibold whitespace-nowrap ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {empCode} {dept ? `• ${dept}` : ''}
                </div>
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor('date', {
        id: 'date',
        header: 'Date',
        cell: ({ row }) => (
          <span
            className={`font-mono text-xs font-bold px-2 py-0.5 rounded border whitespace-nowrap ${
              isDark
                ? 'bg-slate-800/80 text-blue-300 border-slate-700/60'
                : 'bg-slate-100 text-blue-900 border-blue-200'
            }`}
          >
            {formatCellText(row.original.date)}
          </span>
        ),
      }),
      columnHelper.accessor('clock_in', {
        id: 'clock_in',
        header: 'Punch In',
        cell: ({ row }) => (
          <span className={`text-xs font-mono font-bold whitespace-nowrap ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
            {formatTime(row.original.clock_in)}
          </span>
        ),
      }),
      columnHelper.accessor('clock_out', {
        id: 'clock_out',
        header: 'Punch Out',
        cell: ({ row }) => (
          <span className={`text-xs font-mono font-bold whitespace-nowrap ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
            {formatTime(row.original.clock_out)}
          </span>
        ),
      }),
      columnHelper.accessor('status', {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const st = row.original.status;
          return <Chip size="small" {...getStatusChipProps(st)} />;
        },
      }),
      columnHelper.accessor('completed_tasks_count', {
        id: 'completed_tasks_count',
        header: 'Tasks (Done / Total)',
        cell: ({ row }) => {
          const completed = Number(row.original.completedTaskToday ?? 0);
          const total = Number(row.original.todaytotaltask ?? 0);
          let badgeStyles = isDark
            ? 'bg-rose-950/60 text-rose-300 border-rose-800'
            : 'bg-rose-100 text-rose-800 border-rose-200';

          if (completed >= 20) {
            badgeStyles = isDark
              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
              : 'bg-emerald-100 text-emerald-800 border-emerald-200';
          } else if (completed >= 5) {
            badgeStyles = isDark
              ? 'bg-amber-950/60 text-amber-300 border-amber-800'
              : 'bg-amber-100 text-amber-800 border-amber-200';
          }

          return (
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border whitespace-nowrap ${badgeStyles}`}
            >
              <span>{completed} / {total}</span>
              <span className="font-semibold">{total === 1 ? 'task' : 'tasks'}</span>
            </span>
          );
        },
      }),
      columnHelper.accessor('punchInOffice', {
        id: 'punchInOffice',
        header: 'Punch-In Office',
        cell: ({ row }) => (
          <span className={`text-xs font-semibold whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
            {formatCellText(row.original.punchInOffice?.name)}
          </span>
        ),
      }),
      columnHelper.accessor('punchOutOffice', {
        id: 'punchOutOffice',
        header: 'Punch-Out Office',
        cell: ({ row }) => (
          <span className={`text-xs font-semibold whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
            {formatCellText(row.original.punchOutOffice?.name)}
          </span>
        ),
      }),
      columnHelper.accessor('total_hours', {
        id: 'total_hours',
        header: 'Total Hours',
        cell: ({ row }) => (
          <span className={`text-xs font-mono font-bold whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
            {row.original.total_hours !== null && row.original.total_hours !== undefined
              ? `${row.original.total_hours} hrs`
              : 'N/A'}
          </span>
        ),
      }),
      columnHelper.accessor('remarks', {
        id: 'remarks',
        header: 'Remarks',
        cell: ({ row }) => (
          <span className={`text-xs font-medium whitespace-nowrap ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {formatCellText(row.original.remarks)}
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

    //         <Tooltip title="Edit Record">
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

    //         <Tooltip title="Delete Record">
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
    data: attendanceList,
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
    pageCount: Math.ceil((totalRecords || 0) / rowsPerPage) || 1,
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
        <Table sx={{ width: 'max-content', minWidth: '100%' }} aria-label="attendance table" stickyHeader>
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
                      Loading attendance records...
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : currentPageRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 8, color: isDark ? '#94a3b8' : '#64748b' }}>
                  <div className="flex flex-col items-center gap-2.5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                      <FingerprintIcon style={{ fontSize: 26 }} />
                    </div>
                    <p className={`font-bold text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      No attendance records found
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
          totalData={totalRecords}
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
