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
  Avatar,
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
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

import TablePaginationComponent from '../../components/common/TablePaginationComponent';
import TableSkeleton from '../../components/common/TableSkeleton';
import LazyAvatar from '../../components/common/LazyAvatar';

import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

const fuzzyFilter = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value);
  addMeta({ itemRank });
  return itemRank.passed;
};

const columnHelper = createColumnHelper();

export default function TaskTable({
  filteredTasks = [],
  totalData,
  page = 0,
  rowsPerPage = 10,
  onPageChange,
  onRowsPerPageChange,
  onViewClick,
  onEditClick,
  onDeleteClick,
  onRestoreClick,
  isDeletedView = false,
  getStatusChipProps,
  getPriorityChipProps,
  maxHeight,
  columnVisibility = {},
  subModuleName,
  loading = false,
}) {
  const [sorting, setSorting] = useState([]);
  const { isDark } = useThemeMode();
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  const totalCount = totalData !== undefined ? totalData : filteredTasks.length;


  console.log("filteredTasks : filteredTasksfilteredTasksfilteredTasks ", filteredTasks)





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
    
        case "under review":
        case "under_review":
          return {
            label: "Under Review",
            style: {
              backgroundColor: "rgba(234, 179, 8, 0.15)",
              color: "#fde047",
              border: "1px solid rgba(234, 179, 8, 0.3)",
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
              color: "#94a3b8",
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
              color: "#14532d",
              border: "1px solid #86efac",
              fontWeight: 700,
            },
          };
      
        case "under review":
        case "under_review":
          return {
            label: "Under Review",
            style: {
              backgroundColor: "#fef9c3",
              color: "#713f12",
              border: "1px solid #fde047",
              fontWeight: 700,
            },
          };
        case "pending":
          return {
            label: "Pending",
            style: {
              backgroundColor: "#fee2e2",
              color: "#7f1d1d",
              border: "1px solid #fca5a5",
              fontWeight: 700,
            },
          };
        default:
          return {
            label: status ?? "null",
            style: {
              backgroundColor: "#f1f5f9",
              color: "#64748b",
              border: "1px solid #cbd5e1",
              fontWeight: 700,
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
          return {
            label: "Urgent",
            style: {
              backgroundColor: "rgba(239, 68, 68, 0.2)",
              color: "#f87171",
              border: "1px solid rgba(239, 68, 68, 0.4)",
              fontWeight: 700,
            },
          };
        case "high":
          return {
            label: "High",
            style: {
              backgroundColor: "rgba(249, 115, 22, 0.2)",
              color: "#fb923c",
              border: "1px solid rgba(249, 115, 22, 0.4)",
              fontWeight: 700,
            },
          };
        case "medium":
          return {
            label: "Medium",
            style: {
              backgroundColor: "rgba(234, 179, 8, 0.2)",
              color: "#facc15",
              border: "1px solid rgba(234, 179, 8, 0.4)",
              fontWeight: 700,
            },
          };
        case "low":
          return {
            label: "Low",
            style: {
              backgroundColor: "rgba(148, 163, 184, 0.2)",
              color: "#cbd5e1",
              border: "1px solid rgba(148, 163, 184, 0.4)",
              fontWeight: 600,
            },
          };
        default:
          return {
            label: priority ?? "null",
            style: {
              backgroundColor: "rgba(148, 163, 184, 0.15)",
              color: "#94a3b8",
              border: "1px solid rgba(148, 163, 184, 0.3)",
              fontWeight: 600,
            },
          };
      }
    } else {
      switch (safePriority) {
        case "urgent":
          return {
            label: "Urgent",
            style: {
              backgroundColor: "#ffe4e6",
              color: "#9f1239",
              border: "1px solid #fecdd3",
              fontWeight: 700,
            },
          };
        case "high":
          return {
            label: "High",
            style: {
              backgroundColor: "#ffedd5",
              color: "#9a3412",
              border: "1px solid #fed7aa",
              fontWeight: 700,
            },
          };
        case "medium":
          return {
            label: "Medium",
            style: {
              backgroundColor: "#fef9c3",
              color: "#854d0e",
              border: "1px solid #fef08a",
              fontWeight: 700,
            },
          };
        case "low":
          return {
            label: "Low",
            style: {
              backgroundColor: "#f1f5f9",
              color: "#334155",
              border: "1px solid #cbd5e1",
              fontWeight: 700,
            },
          };
        default:
          return {
            label: priority ?? "null",
            style: {
              backgroundColor: "#f1f5f9",
              color: "#64748b",
              border: "1px solid #cbd5e1",
              fontWeight: 700,
            },
          };
      }
    }
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor("title", {
        id: "title",
        header: "Title",
        cell: ({ row }) => {
          const slug = row.original?.slug || row.original?.task_id || row.original?.id;
          return (
            <span
              onClick={() => navigate(`/tasks/details/${slug}`, { state: { task: row.original } })}
              className={`font-bold text-xs whitespace-nowrap cursor-pointer hover:underline ${isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-800"
                }`}
            >
              {row.original.title ?? row.original.task_id ?? "null"}
            </span>
          );
        },
      }),
      columnHelper.accessor("taskType", {
        id: "taskType",
        header: "Task Type",
        cell: ({ row }) => {
          const tt = row.original.taskType;
          const label = typeof tt === "object" && tt !== null ? (tt.name ?? "N/A") : (tt ?? "N/A");
          return (
            <span>
              {label}
            </span>
          );
        },
      }),
      columnHelper.accessor("assigneeToEmployeeId", {
        id: "employee",
        header: "Employee",
        cell: ({ row }) => {
          const assignee = row.original?.assigneeToEmployeeId ?? row.original?.assignedTo;
          const assigneeName = assignee?.name ?? (typeof assignee === "string" ? assignee : null) ?? "null";
          return (
            <span className={`font-medium text-xs whitespace-nowrap ${isDark ? "text-slate-200" : "text-slate-800"}`}>
              {assigneeName}
            </span>
          );
        },
      }),
      columnHelper.accessor("customerId", {
        id: "customer",
        header: "Customer",
        cell: ({ row }) => {
          const cust = row.original?.customerId;
          const custName = cust?.name ?? (typeof cust === "string" ? cust : null) ?? "null";
          const customerId = cust?.slug || cust?.id || cust?._id || (typeof cust === "string" ? cust : "details");
          return (
            <span
              onClick={() =>
                navigate(`/customers/details/${customerId}`, {
                  state: { customer: cust, task: row.original },
                })
              }
              className={`font-bold text-xs whitespace-nowrap cursor-pointer hover:underline ${isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-800"
                }`}
            >
              {custName}
            </span>
          );
        },
      }),
   
      columnHelper.accessor("team", {
        id: "team",
        header: "Team",
        cell: ({ row }) => (
          <span className={`text-xs whitespace-nowrap ${isDark ? "text-slate-400" : "text-slate-700"}`}>
            {row.original.team?.name ?? (typeof row.original.team === "string" ? row.original.team : null) ?? "null"}
          </span>
        ),
      }),
      columnHelper.accessor("manager", {
        id: "manager",
        header: "Manager",
        cell: ({ row }) => (
          <span className={`text-xs whitespace-nowrap ${isDark ? "text-slate-400" : "text-slate-700"}`}>
            {row.original.assigneeToEmployeeId?.manager?.name ?? (typeof row.original.manager === "string" ? row.original.manager : null) ?? "null"}
          </span>
        ),
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
      columnHelper.accessor("createdBy", {
        id: "createdBy",
        header: "Created By",
        cell: ({ row }) => {
          const creator = row.original.createdBy;
          const creatorName = creator?.name ?? (typeof creator === "string" ? creator : null) ?? "null";
          return (
            <span className={`text-xs whitespace-nowrap ${isDark ? "text-slate-400" : "text-slate-700"}`}>
              {creatorName}
            </span>
          );
        },
      }),
      columnHelper.accessor("deletedBy", {
        id: "deletedBy",
        header: "Deleted By",
        cell: ({ row }) => {
          const deleter = row.original.deletedBy;
          const deleterName =
            typeof deleter === "object" ? deleter?.name : (deleter ?? "null");
          return (
            <span className={`text-xs whitespace-nowrap ${isDark ? "text-slate-400" : "text-slate-700"}`}>
              {deleterName ?? "null"}
            </span>
          );
        },
      }),
      columnHelper.accessor("deletedAt", {
        id: "deletedAt",
        header: "Deleted At",
        cell: ({ row }) => (
          <span className={`text-xs whitespace-nowrap ${isDark ? "text-slate-400" : "text-slate-700"}`}>
            {row.original.deletedAt ? new Date(row.original.deletedAt).toLocaleString() : "null"}
          </span>
        ),
      }),

      columnHelper.accessor("completedAt", {
        id: "completedAt",
        header: "Completed At",
        cell: ({ row }) => (
          <span className={`text-xs whitespace-nowrap ${isDark ? "text-slate-400" : "text-slate-700"}`}>
            {row.original.completeDateTime ? new Date(row.original.completeDateTime).toLocaleString() : "null"}
          </span>
        ),
      }),
      columnHelper.accessor("createdAt", {
        id: "createdAt",
        header: "Created On",
        cell: ({ row }) => (
          <span className={`text-xs whitespace-nowrap ${isDark ? "text-slate-400" : "text-slate-700"}`}>
            {row.original.createdAt ? new Date(row.original.createdAt).toLocaleString() : "null"}
          </span>
        ),
      }),
  
      columnHelper.accessor("downloads", {
        id: "downloads",
        header: "Downloads",
        cell: ({ row }) => (
          <span className={`text-xs whitespace-nowrap ${isDark ? "text-slate-400" : "text-slate-700"}`}>
            {row.original.downloads ?? "null"}
          </span>
        ),
      }),
      columnHelper.accessor("assigneeToEmployeeId", {
        id: "employeeIden",
        header: "Employee Iden",
        cell: ({ row }) => {
          const assignee = row.original?.assigneeToEmployeeId ?? row.original?.assignedTo;
          return (
            <span className={`font-mono text-xs whitespace-nowrap ${isDark ? "text-slate-400" : "text-slate-700"}`}>
              {assignee?.identity ?? row.original?.employeeIdentity ?? "null"}
            </span>
          );
        },
      }),
      columnHelper.accessor("followUp", {
        id: "followUp",
        header: "Follow Up",
        cell: ({ row }) => (
          <span className={`text-xs whitespace-nowrap ${isDark ? "text-slate-400" : "text-slate-700"}`}>
            {row.original.followUp ?? row.original.follow_up ?? "null"}
          </span>
        ),
      }),
      columnHelper.accessor("customerMobile", {
        id: "customerMobile",
        header: "Customer Mobile",
        cell: ({ row }) => (
          <span className={`text-xs whitespace-nowrap ${isDark ? "text-slate-400" : "text-slate-700"}`}>
            {row.original.customerId?.phone ?? row.original.customerMobile ?? "null"}
          </span>
        ),
      }),
      columnHelper.accessor("ptpdate", {
        id: "promiseToPay",
        header: "Promise To Pay",
        cell: ({ row }) => {
          const ptpDateRaw = row.original.ptpdate || row.original.promiseToPay;
          if (!ptpDateRaw) return <span className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>N/A</span>;
          const d = new Date(ptpDateRaw);
          const dateStr = !isNaN(d.getTime())
            ? d.toLocaleString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })
            : String(ptpDateRaw);

          return (
            <span className={`text-xs font-semibold whitespace-nowrap ${isDark ? "text-indigo-300" : "text-indigo-700"}`}>
              {dateStr}
            </span>
          );
        },
      }),
      columnHelper.accessor("lastComment", {
        id: "lastComment",
        header: "Last Comment",
        cell: ({ row }) => (
          <span className={`text-xs whitespace-nowrap ${isDark ? "text-slate-400" : "text-slate-700"}`}>
            {row.original.lastComment ?? "null"}
          </span>
        ),
      }),
      columnHelper.accessor("followUpComment", {
        id: "followUpComment",
        header: "Follow Up Comment",
        cell: ({ row }) => (
          <span className={`text-xs whitespace-nowrap ${isDark ? "text-slate-400" : "text-slate-700"}`}>
            {row.original.followUpComment ?? "null"}
          </span>
        ),
      }),
      columnHelper.accessor("lastCommentTime", {
        id: "lastCommentTime",
        header: "Last Comment Time",
        cell: ({ row }) => (
          <span className={`text-xs whitespace-nowrap ${isDark ? "text-slate-400" : "text-slate-700"}`}>
            {row.original.lastCommentTime ? new Date(row.original.lastCommentTime).toLocaleString() : "null"}
          </span>
        ),
      }),
      columnHelper.accessor("taskCompletedAddress", {
        id: "taskCompletedAddress",
        header: "Task Completed Address",
        cell: ({ row }) => (
          <span className={`text-xs whitespace-nowrap ${isDark ? "text-slate-400" : "text-slate-700"}`}>
            {row.original.taskCompletedAddress ?? "null"}
          </span>
        ),
      }),
      columnHelper.accessor("taskAccuracy", {
        id: "taskAccuracy",
        header: "Task Accuracy",
        cell: ({ row }) => (
          <span className={`text-xs whitespace-nowrap ${isDark ? "text-slate-400" : "text-slate-700"}`}>
            {row.original.taskAccuracy ?? "null"}
          </span>
        ),
      }),
      columnHelper.accessor("taskAccuracyUnit", {
        id: "taskAccuracyUnit",
        header: "Task Accuracy(metre/km)",
        cell: ({ row }) => (
          <span className={`text-xs whitespace-nowrap ${isDark ? "text-slate-400" : "text-slate-700"}`}>
            {row.original.taskAccuracyUnit ?? "null"}
          </span>
        ),
      }),
      columnHelper.accessor("contact", {
        id: "contact",
        header: "Contact",
        cell: ({ row }) => (
          <span className={`text-xs whitespace-nowrap ${isDark ? "text-slate-400" : "text-slate-700"}`}>
            {row.original.contact ?? "null"}
          </span>
        ),
      }),
      columnHelper.accessor("startLatLng", {
        id: "startLatLng",
        header: "Start Lat/Lng",
        cell: ({ row }) => (
          <span className={`text-xs whitespace-nowrap ${isDark ? "text-slate-400" : "text-slate-700"}`}>
            {row.original.startLatLng ?? "null"}
          </span>
        ),
      }),
 
      columnHelper.display({
        id: "actions",
        header: "ACTIONS",
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1 min-w-[110px]">
            {hasPermission("task", "view", subModuleName) && (
              <Tooltip title="View Task Details">
                <IconButton
                  size="small"
                  onClick={() => onViewClick && onViewClick(row.original)}
                  sx={{
                    color: isDark ? "#818cf8" : "#4f46e5",
                    "&:hover": {
                      backgroundColor: isDark
                        ? "rgba(99, 102, 241, 0.15)"
                        : "rgba(79, 70, 229, 0.1)",
                    },
                  }}
                >
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            {isDeletedView ? (
              (hasPermission("task", "delete", subModuleName) ||
                hasPermission("task", "edit", subModuleName) ||
                hasPermission("task", "delete", "taskAll") ||
                hasPermission("task", "edit", "taskAll") ||
                hasPermission("task", "delete") ||
                hasPermission("task", "edit")) && (
                <Tooltip title="Restore Task">
                  <IconButton
                    size="small"
                    onClick={() => onRestoreClick && onRestoreClick(row.original)}
                    sx={{
                      color: isDark ? "#34d399" : "#059669",
                      "&:hover": {
                        backgroundColor: isDark
                          ? "rgba(52, 211, 153, 0.15)"
                          : "rgba(5, 150, 105, 0.1)",
                      },
                    }}
                  >
                    <RestoreFromTrashIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )
            ) : (
              <>
                {hasPermission("task", "edit", subModuleName) && (
                  <Tooltip title="Edit Task">
                    <IconButton
                      size="small"
                      onClick={() => onEditClick && onEditClick(row.original)}
                      sx={{
                        color: isDark ? "#fbbf24" : "#d97706",
                        "&:hover": {
                          backgroundColor: isDark
                            ? "rgba(245, 158, 11, 0.15)"
                            : "rgba(217, 119, 6, 0.1)",
                        },
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}

                {hasPermission("task", "delete", subModuleName) && (
                  <Tooltip title="Delete Task">
                    <IconButton
                      size="small"
                      onClick={() => onDeleteClick && onDeleteClick(row.original)}
                      sx={{
                        color: isDark ? "#f87171" : "#dc2626",
                        "&:hover": {
                          backgroundColor: isDark
                            ? "rgba(239, 68, 68, 0.15)"
                            : "rgba(220, 38, 38, 0.1)",
                        },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </>
            )}
          </div>
        ),
      }),
    ],
    [
      isDark,
      onViewClick,
      onEditClick,
      onDeleteClick,
      onRestoreClick,
      isDeletedView,
      getStatusChipProps,
      getPriorityChipProps,
      hasPermission,
      subModuleName,
    ],
  );

  const table = useReactTable({
    data: filteredTasks,
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
    pageCount: Math.ceil((totalCount || 0) / rowsPerPage) || 1,
  });

  const currentPageRows = table.getRowModel().rows;

  if (loading) {
    return (
      <TableSkeleton
        columns={columns.length}
        rows={rowsPerPage}
        maxHeight={maxHeight}
        avatarColIndex={2}
      />
    );
  }

  return (
    <Paper
      className={`flex flex-col rounded-2xl border shadow-xl overflow-hidden w-full transition-colors duration-200 ${isDark ? "border-slate-800/80 bg-slate-900/70" : "border-slate-200 bg-white"
        }`}
      sx={{
        width: "100%",
        margin: 0,
        maxHeight: maxHeight || "calc(100vh - 170px)",
      }}
    >
      {/* Scrollable Table Container */}
      <TableContainer className="overflow-auto w-full min-h-0 custom-scrollbar" sx={{ maxHeight: maxHeight ? `calc(${maxHeight} - 45px)` : "calc(100vh - 220px)" }}>
        <Table sx={{ width: "max-content", minWidth: "100%" }} aria-label="task table" stickyHeader>
          <TableHead sx={{ position: "sticky", top: 0, zIndex: 30 }}>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const isSorted = header.column.getIsSorted();

                  return (
                    <TableCell
                      key={header.id}
                      align={header.id === "actions" ? "right" : "left"}
                      sx={{
                        color: isDark ? "#94a3b8" : "#0f172a",
                        fontWeight: 700,
                        px: 1,
                        py: 1,
                        whiteSpace: "nowrap",
                        backgroundColor: isDark ? "#0f172a !important" : "#f1f5f9 !important",
                        cursor: canSort ? "pointer" : "default",
                        userSelect: "none",
                      }}
                      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                    >
                      <div className={`flex items-center gap-1 whitespace-nowrap ${header.id === "actions" ? "justify-end" : ""}`}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {isSorted === "asc" && (
                          <ArrowUpwardIcon sx={{ fontSize: 14, color: isDark ? "#818cf8" : "#0f172a" }} />
                        )}
                        {isSorted === "desc" && (
                          <ArrowDownwardIcon sx={{ fontSize: 14, color: isDark ? "#818cf8" : "#0f172a" }} />
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
                <TableCell colSpan={columns.length} align="center" sx={{ py: 6, color: isDark ? "#94a3b8" : "#64748b" }}>
                  <div className="flex flex-col items-center gap-2">
                    <AssignmentIcon className={isDark ? "text-slate-600" : "text-slate-400"} style={{ fontSize: 48 }} />
                    <p className={`font-semibold text-base ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                      No tasks matching your criteria
                    </p>
                    <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                      Try adjusting your search or status/priority filters.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              currentPageRows.map((row) => (
                <TableRow
                  key={row.id}
                  sx={{
                    "&:hover": {
                      backgroundColor: isDark ? "rgba(255, 255, 255, 0.03)" : "#f8fafc",
                    },
                    transition: "background-color 0.15s ease",
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} align={cell.column.id === "actions" ? "right" : "left"} sx={{ px: 1, py: 1.6, whiteSpace: "nowrap" }}>
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
      <div className={`flex-shrink-0 border-t ${isDark ? "border-slate-800/80 bg-slate-900/90" : "border-slate-200 bg-white"}`}>
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
