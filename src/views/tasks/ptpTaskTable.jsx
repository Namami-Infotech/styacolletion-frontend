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
              backgroundColor: "rgba(34, 197, 94, 0.15)",
              color: "#4ade80",
              border: "1px solid rgba(34, 197, 94, 0.3)",
              fontWeight: 600,
            },
          };
     
        case "pending":
          return {
            label: "Pending",
            style: {
              backgroundColor: "rgba(239, 68, 68, 0.15)",
              color: "#fca5a5",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              fontWeight: 600,
            },
          };
        default:
          return {
            label: status ?? "null",
            style: {
              backgroundColor: "rgba(148, 163, 184, 0.15)",
              color: "#cbd5e1",
              border: "1px solid rgba(148, 163, 184, 0.3)",
              fontWeight: 600,
            },
          };
      }
    } else {
      switch (safeStatus) {
        case "completed":
          return {
            label: "Completed",
            style: {
              backgroundColor: "#dcfce7",
              color: "#15803d",
              border: "1px solid #bbf7d0",
              fontWeight: 600,
            },
          };
    
        case "pending":
          return {
            label: "Pending",
            style: {
              backgroundColor: "#fee2e2",
              color: "#b91c1c",
              border: "1px solid #fca5a5",
              fontWeight: 600,
            },
          };
        default:
          return {
            label: status ?? "null",
            style: {
              backgroundColor: "#f1f5f9",
              color: "#475569",
              border: "1px solid #cbd5e1",
              fontWeight: 600,
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
              backgroundColor: "rgba(239, 68, 68, 0.2)",
              color: "#f87171",
              border: "1px solid rgba(239, 68, 68, 0.4)",
              fontWeight: 700,
            },
          };
        case "medium":
          return {
            label: "Medium",
            style: {
              backgroundColor: "rgba(245, 158, 11, 0.2)",
              color: "#fbbf24",
              border: "1px solid rgba(245, 158, 11, 0.4)",
              fontWeight: 700,
            },
          };
        case "low":
          return {
            label: "Low",
            style: {
              backgroundColor: "rgba(59, 130, 246, 0.2)",
              color: "#60a5fa",
              border: "1px solid rgba(59, 130, 246, 0.4)",
              fontWeight: 700,
            },
          };
        default:
          return {
            label: priority ?? "null",
            style: {
              backgroundColor: "rgba(148, 163, 184, 0.2)",
              color: "#94a3b8",
              border: "1px solid rgba(148, 163, 184, 0.4)",
              fontWeight: 700,
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
              backgroundColor: "#fee2e2",
              color: "#dc2626",
              border: "1px solid #fca5a5",
              fontWeight: 700,
            },
          };
        case "medium":
          return {
            label: "Medium",
            style: {
              backgroundColor: "#fef3c7",
              color: "#d97706",
              border: "1px solid #fde68a",
              fontWeight: 700,
            },
          };
        case "low":
          return {
            label: "Low",
            style: {
              backgroundColor: "#e0f2fe",
              color: "#0369a1",
              border: "1px solid #bae6fd",
              fontWeight: 700,
            },
          };
        default:
          return {
            label: priority ?? "null",
            style: {
              backgroundColor: "#f1f5f9",
              color: "#64748b",
              border: "1px solid #e2e8f0",
              fontWeight: 700,
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
    <div className={`flex flex-col flex-1 min-h-0 rounded-2xl border overflow-hidden transition-all duration-200 ${
      isDark ? 'bg-slate-900/80 border-slate-800 shadow-xl' : 'bg-white border-slate-200 shadow-sm'
    }`}>
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          maxHeight: maxHeight,
          backgroundColor: 'transparent',
          overflowY: 'auto',
          '&::-webkit-scrollbar': { width: '6px', height: '6px' },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
            borderRadius: '3px',
          },
        }}
      >
        <Table stickyHeader size="small">
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableCell
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    sx={{
                      backgroundColor: isDark ? '#0f172a' : '#f8fafc',
                      color: isDark ? '#94a3b8' : '#475569',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      borderBottom: isDark ? '1px solid #1e293b' : '1px solid #e2e8f0',
                      cursor: header.column.getCanSort() ? 'pointer' : 'default',
                      userSelect: 'none',
                      whiteSpace: 'nowrap',
                      py: 1.2,
                    }}
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() === 'asc' && <ArrowUpwardIcon sx={{ fontSize: 14 }} />}
                      {header.column.getIsSorted() === 'desc' && <ArrowDownwardIcon sx={{ fontSize: 14 }} />}
                    </div>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>

          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 6 }}>
                  <div className="flex flex-col items-center justify-center gap-2">
                    <CalendarTodayIcon sx={{ fontSize: 40 }} className={isDark ? 'text-slate-700' : 'text-slate-300'} />
                    <span className={`text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      No PTP tasks found
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  hover
                  sx={{
                    '&:hover': {
                      backgroundColor: isDark ? 'rgba(30, 41, 59, 0.5) !important' : '#f8fafc !important',
                    },
                    borderBottom: isDark ? '1px solid #1e293b' : '1px solid #f1f5f9',
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      sx={{
                        py: 1.2,
                        fontSize: '0.8125rem',
                        color: isDark ? '#e2e8f0' : '#1e293b',
                        borderBottom: 'none',
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
  );
}
