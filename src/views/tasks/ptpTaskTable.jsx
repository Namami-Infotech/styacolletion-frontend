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
  getSortedRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table';
import { useThemeMode } from '../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';

import TablePaginationComponent from '../../components/common/TablePaginationComponent';
import TableSkeleton from '../../components/common/TableSkeleton';

import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PhoneIcon from '@mui/icons-material/Phone';
import WhatshotIcon from '@mui/icons-material/Whatshot';

const columnHelper = createColumnHelper();

export default function PtpTaskTable({
  filteredTasks = [],
  totalData,
  page = 0,
  rowsPerPage = 10,
  onPageChange,
  onRowsPerPageChange,
  onViewClick,
  onEditClick,
  onDeleteClick,
  getStatusChipProps,
  getPriorityChipProps,
  maxHeight = 'calc(100vh - 280px)',
  loading = false,
}) {
  const [sorting, setSorting] = useState([]);
  const { isDark } = useThemeMode();
  const navigate = useNavigate();
  const totalCount = totalData !== undefined ? totalData : filteredTasks.length;

  const defaultGetStatusChipProps = (status) => {
    if (getStatusChipProps) {
      return getStatusChipProps(status);
    }
    const safeStatus = status ? String(status).toLowerCase() : "null";
    if (isDark) {
      switch (safeStatus) {
        case "completed":
          return {
            label: "Completed",
            style: {
              backgroundColor: "rgba(34, 197, 94, 0.12)",
              color: "#4ade80",
              border: "1px solid rgba(34, 197, 94, 0.25)",
              fontWeight: 700,
              borderRadius: "9999px",
              fontSize: "0.72rem",
              height: "22px",
            },
          };
     
        case "pending":
          return {
            label: "Pending",
            style: {
              backgroundColor: "rgba(239, 68, 68, 0.12)",
              color: "#f87171",
              border: "1px solid rgba(239, 68, 68, 0.25)",
              fontWeight: 700,
              borderRadius: "9999px",
              fontSize: "0.72rem",
              height: "22px",
            },
          };
        default:
          return {
            label: status ?? "null",
            style: {
              backgroundColor: "rgba(148, 163, 184, 0.12)",
              color: "#94a3b8",
              border: "1px solid rgba(148, 163, 184, 0.25)",
              fontWeight: 700,
              borderRadius: "9999px",
              fontSize: "0.72rem",
              height: "22px",
            },
          };
      }
    } else {
      switch (safeStatus) {
        case "completed":
          return {
            label: "Completed",
            style: {
              backgroundColor: "#ecfdf5",
              color: "#047857",
              border: "1px solid #a7f3d0",
              fontWeight: 700,
              borderRadius: "9999px",
              fontSize: "0.72rem",
              height: "22px",
            },
          };
    
        case "pending":
          return {
            label: "Pending",
            style: {
              backgroundColor: "#fef2f2",
              color: "#b91c1c",
              border: "1px solid #fecaca",
              fontWeight: 700,
              borderRadius: "9999px",
              fontSize: "0.72rem",
              height: "22px",
            },
          };
        default:
          return {
            label: status ?? "null",
            style: {
              backgroundColor: "#f8fafc",
              color: "#64748b",
              border: "1px solid #e2e8f0",
              fontWeight: 700,
              borderRadius: "9999px",
              fontSize: "0.72rem",
              height: "22px",
            },
          };
      }
    }
  };

  const defaultGetPriorityChipProps = (priority) => {
    if (getPriorityChipProps) {
      return getPriorityChipProps(priority);
    }
    const safePriority = priority ? String(priority).toLowerCase() : "null";
    if (isDark) {
      switch (safePriority) {
        case "urgent":
        case "high":
          return {
            label: priority || "High",
            style: {
              backgroundColor: "rgba(239, 68, 68, 0.15)",
              color: "#f87171",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              fontWeight: 700,
              borderRadius: "9999px",
              fontSize: "0.72rem",
              height: "22px",
            },
          };
        case "medium":
          return {
            label: "Medium",
            style: {
              backgroundColor: "rgba(234, 179, 8, 0.15)",
              color: "#facc15",
              border: "1px solid rgba(234, 179, 8, 0.3)",
              fontWeight: 700,
              borderRadius: "9999px",
              fontSize: "0.72rem",
              height: "22px",
            },
          };
        case "low":
          return {
            label: "Low",
            style: {
              backgroundColor: "rgba(148, 163, 184, 0.12)",
              color: "#cbd5e1",
              border: "1px solid rgba(148, 163, 184, 0.25)",
              fontWeight: 600,
              borderRadius: "9999px",
              fontSize: "0.72rem",
              height: "22px",
            },
          };
        default:
          return {
            label: priority ?? "null",
            style: {
              backgroundColor: "rgba(148, 163, 184, 0.12)",
              color: "#94a3b8",
              border: "1px solid rgba(148, 163, 184, 0.25)",
              fontWeight: 600,
              borderRadius: "9999px",
              fontSize: "0.72rem",
              height: "22px",
            },
          };
      }
    } else {
      switch (safePriority) {
        case "urgent":
        case "high":
          return {
            label: priority || "High",
            style: {
              backgroundColor: "#fef2f2",
              color: "#b91c1c",
              border: "1px solid #fecaca",
              fontWeight: 700,
              borderRadius: "9999px",
              fontSize: "0.72rem",
              height: "22px",
            },
          };
        case "medium":
          return {
            label: "Medium",
            style: {
              backgroundColor: "#fefce8",
              color: "#a16207",
              border: "1px solid #fef08a",
              fontWeight: 700,
              borderRadius: "9999px",
              fontSize: "0.72rem",
              height: "22px",
            },
          };
        case "low":
          return {
            label: "Low",
            style: {
              backgroundColor: "#f8fafc",
              color: "#475569",
              border: "1px solid #e2e8f0",
              fontWeight: 600,
              borderRadius: "9999px",
              fontSize: "0.72rem",
              height: "22px",
            },
          };
        default:
          return {
            label: priority ?? "null",
            style: {
              backgroundColor: "#f8fafc",
              color: "#64748b",
              border: "1px solid #e2e8f0",
              fontWeight: 600,
              borderRadius: "9999px",
              fontSize: "0.72rem",
              height: "22px",
            },
          };
      }
    }
  };

  const columns = useMemo(() => {
    return [
      columnHelper.accessor("task_id", {
        id: "task_id",
        header: "Task ID",
        cell: ({ row }) => {
          const taskId = row.original.task_id || row.original.id;
          const slug = row.original.slug || row.original.task_id || row.original.id;
          return (
            <div
              onClick={() => navigate(`/tasks/details/${slug}`, { state: { task: row.original } })}
              className="cursor-pointer group flex items-center gap-1.5"
            >
              <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                isDark ? 'bg-indigo-950/60 text-indigo-300 border border-indigo-800/60 group-hover:border-indigo-500' : 'bg-indigo-50 text-indigo-700 border border-indigo-200 group-hover:border-indigo-400'
              }`}>
                {taskId || "N/A"}
              </span>
            </div>
          );
        },
      }),

      columnHelper.accessor("ptpdate", {
        id: "ptpdate",
        header: "PTP Date",
        cell: ({ row }) => {
          const ptpDateRaw = row.original.ptpdate;
          if (!ptpDateRaw) return <span className="text-xs text-slate-400">N/A</span>;
          const d = new Date(ptpDateRaw);
          const dateStr = d.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });
          const timeStr = d.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          });

          return (
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <CalendarTodayIcon sx={{ fontSize: 14 }} className="text-indigo-500" />
              <div>
                <span className={`text-xs font-bold block ${isDark ? 'text-indigo-300' : 'text-indigo-900'}`}>
                  {dateStr}
                </span>
                <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {timeStr}
                </span>
              </div>
            </div>
          );
        },
      }),

      columnHelper.accessor("customerId", {
        id: "customer",
        header: "Customer / Loan No",
        cell: ({ row }) => {
          const cust = row.original.customerId;
          const custName = cust?.name || "N/A";
          const loanNo = cust?.loanNo || cust?.oldLoanNo || "N/A";
          const custCode = cust?.customer_id || "";

          return (
            <div className="flex flex-col">
              <span className={`text-xs font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                {custName}
              </span>
              <span className={`text-[11px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Loan: {loanNo} {custCode && `(${custCode})`}
              </span>
            </div>
          );
        },
      }),

      columnHelper.accessor("assigneeToEmployeeId", {
        id: "assignee",
        header: "Assignee Employee",
        cell: ({ row }) => {
          const emp = row.original.assigneeToEmployeeId || row.original.assignedTo;
          const name = emp?.name || "Unassigned";
          const empId = emp?.emp_id || "";

          return (
            <div className="flex flex-col">
              <span className={`text-xs font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                {name}
              </span>
              {empId && (
                <span className={`text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {empId}
                </span>
              )}
            </div>
          );
        },
      }),

      columnHelper.accessor("clientPhone", {
        id: "clientPhone",
        header: "Client Phone",
        cell: ({ row }) => {
          const phone = row.original.clientPhone || row.original.customerId?.phone || "N/A";
          return (
            <div className="flex items-center gap-1">
              <PhoneIcon sx={{ fontSize: 13 }} className="text-emerald-500" />
              <span className={`text-xs font-mono font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {phone}
              </span>
            </div>
          );
        },
      }),

      columnHelper.accessor("clientSegment", {
        id: "clientSegment",
        header: "Segment",
        cell: ({ row }) => {
          const seg = row.original.clientSegment;
          if (!seg) return <span className="text-xs text-slate-400">-</span>;
          const isHot = String(seg).toLowerCase() === 'hot';
          return (
            <Chip
              size="small"
              icon={isHot ? <WhatshotIcon sx={{ fontSize: '14px !important' }} /> : undefined}
              label={String(seg).toUpperCase()}
              sx={{
                fontSize: '10px',
                height: '20px',
                fontWeight: 700,
                backgroundColor: isHot ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                color: isHot ? '#f87171' : '#60a5fa',
                border: isHot ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(59, 130, 246, 0.3)',
              }}
            />
          );
        },
      }),

      columnHelper.accessor("reason", {
        id: "reason",
        header: "Reason",
        cell: ({ row }) => {
          const reason = row.original.reason;
          return (
            <span className={`text-xs max-w-[150px] truncate block ${isDark ? 'text-slate-300' : 'text-slate-600'}`} title={reason || ''}>
              {reason || '-'}
            </span>
          );
        },
      }),

      columnHelper.accessor("priority", {
        id: "priority",
        header: "Priority",
        cell: ({ row }) => (
          <Chip
            size="small"
            {...defaultGetPriorityChipProps(row.original.priority)}
          />
        ),
      }),

      columnHelper.accessor("status", {
        id: "status",
        header: "Status",
        cell: ({ row }) => (
          <Chip
            size="small"
            {...defaultGetStatusChipProps(row.original.status)}
          />
        ),
      }),

      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            {onViewClick && (
              <Tooltip title="View Task Details">
                <IconButton
                  size="small"
                  onClick={() => onViewClick(row.original)}
                  sx={{
                    color: isDark ? '#60a5fa' : '#2563eb',
                    '&:hover': { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : '#dbeafe' },
                  }}
                >
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            {onEditClick && (
              <Tooltip title="Edit Task">
                <IconButton
                  size="small"
                  onClick={() => onEditClick(row.original)}
                  sx={{
                    color: isDark ? '#fbbf24' : '#d97706',
                    '&:hover': { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.2)' : '#fef3c7' },
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            {onDeleteClick && (
              <Tooltip title="Delete Task">
                <IconButton
                  size="small"
                  onClick={() => onDeleteClick(row.original)}
                  sx={{
                    color: isDark ? '#f87171' : '#dc2626',
                    '&:hover': { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : '#fee2e2' },
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </div>
        ),
      }),
    ];
  }, [isDark, onViewClick, onEditClick, onDeleteClick, navigate]);

  const paginationState = useMemo(
    () => ({
      pageIndex: page,
      pageSize: rowsPerPage,
    }),
    [page, rowsPerPage],
  );

  const table = useReactTable({
    data: filteredTasks,
    columns,
    state: {
      sorting,
      pagination: paginationState,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    pageCount: Math.ceil((totalCount || 0) / (rowsPerPage || 10)),
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
      className={`flex flex-col flex-1 min-h-0 rounded-2xl border overflow-hidden transition-all duration-200 ${
        isDark
          ? 'border-slate-800/80 bg-slate-900/70 shadow-2xl backdrop-blur-xl ring-1 ring-white/5'
          : 'border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-900/5'
      }`}
      sx={{
        width: '100%',
        margin: 0,
        maxHeight: maxHeight || 'calc(100vh - 170px)',
      }}
    >
      <TableContainer
        className="overflow-auto w-full min-h-0 custom-scrollbar"
        sx={{
          maxHeight: maxHeight ? `calc(${maxHeight} - 45px)` : 'calc(100vh - 220px)',
          backgroundColor: 'transparent',
        }}
      >
        <Table stickyHeader size="small" sx={{ width: 'max-content', minWidth: '100%' }}>
          <TableHead sx={{ position: 'sticky', top: 0, zIndex: 30 }}>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const isSorted = header.column.getIsSorted();

                  return (
                    <TableCell
                      key={header.id}
                      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                      sx={{
                        backgroundColor: isDark ? '#090e1a !important' : '#f8fafc !important',
                        color: isDark ? '#94a3b8' : '#475569',
                        fontWeight: 700,
                        fontSize: '0.72rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
                        cursor: canSort ? 'pointer' : 'default',
                        userSelect: 'none',
                        whiteSpace: 'nowrap',
                        px: 2,
                        py: 1.4,
                        transition: 'background-color 0.15s ease',
                        '&:hover': canSort ? {
                          backgroundColor: isDark ? '#0f172a !important' : '#f1f5f9 !important',
                        } : {},
                      }}
                    >
                      <div className="flex items-center gap-1.5 whitespace-nowrap">
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
                  <div className="flex flex-col items-center justify-center gap-2.5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                      <CalendarTodayIcon sx={{ fontSize: 24 }} />
                    </div>
                    <span className={`text-sm font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      No PTP tasks found
                    </span>
                    <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Try adjusting your search or filters.
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
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
                      sx={{
                        px: 2,
                        py: 1.3,
                        whiteSpace: 'nowrap',
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

      {/* Pagination component */}
      <div className={`flex-shrink-0 border-t ${isDark ? 'border-slate-800/80 bg-slate-900/90' : 'border-slate-200/80 bg-white'}`}>
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
