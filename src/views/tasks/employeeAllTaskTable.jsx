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
import { useNavigate } from 'react-router-dom';

import TablePaginationComponent from '../../components/common/TablePaginationComponent';
import TableSkeleton from '../../components/common/TableSkeleton';
import LazyAvatar from '../../components/common/LazyAvatar';

import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
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
  getStatusChipProps,
  getPriorityChipProps,
  maxHeight,
  columnVisibility = {},
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
        case "in progress":
        case "in_progress":
          return {
            label: "In Progress",
            style: {
              backgroundColor: "rgba(59, 130, 246, 0.15)",
              color: "#60a5fa",
              border: "1px solid rgba(59, 130, 246, 0.3)",
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
        case "in progress":
        case "in_progress":
          return {
            label: "In Progress",
            style: {
              backgroundColor: "#dbeafe",
              color: "#1e40af",
              border: "1px solid #93c5fd",
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
              className={`font-bold text-xs whitespace-nowrap cursor-pointer hover:underline ${
                isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-800"
              }`}
            >
              {row.original.title ?? row.original.task_id ?? "null"}
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
      columnHelper.accessor("manager", {
        id: "manager",
        header: "Manager",
        cell: ({ row }) => (
          <span className={`text-xs whitespace-nowrap ${isDark ? "text-slate-400" : "text-slate-700"}`}>
            {row.original.manager?.name ?? (typeof row.original.manager === "string" ? row.original.manager : null) ?? "null"}
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
      columnHelper.accessor("taskType", {
        id: "taskType",
        header: "Type",
        cell: ({ row }) => {
          const typeVal =
            typeof row.original.taskType === "object"
              ? row.original.taskType?.name
              : row.original.taskType;

          return (
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded border whitespace-nowrap ${
                typeVal === "Custom"
                  ? isDark
                    ? "text-purple-300 bg-purple-500/15 border-purple-500/30"
                    : "text-purple-900 bg-purple-100 border-purple-300"
                  : isDark
                    ? "text-slate-300 bg-slate-800/60 border-slate-700/50"
                    : "text-slate-900 bg-slate-100 border-slate-300"
              }`}
            >
              {typeVal ?? "null"}
            </span>
          );
        },
      }),
      columnHelper.accessor("createdBy", {
        id: "createdBy",
        header: "Creator",
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
      columnHelper.accessor("startedAt", {
        id: "startedAt",
        header: "Started",
        cell: ({ row }) => (
          <span className={`text-xs whitespace-nowrap ${isDark ? "text-slate-400" : "text-slate-700"}`}>
            {row.original.startedAt ? new Date(row.original.startedAt).toLocaleString() : "null"}
          </span>
        ),
      }),
      columnHelper.accessor("completedAt", {
        id: "completedAt",
        header: "Completed",
        cell: ({ row }) => (
          <span className={`text-xs whitespace-nowrap ${isDark ? "text-slate-400" : "text-slate-700"}`}>
            {row.original.completedAt ? new Date(row.original.completedAt).toLocaleString() : "null"}
          </span>
        ),
      }),
      columnHelper.accessor("startDateTime", {
        id: "startDateTime",
        header: "Start",
        cell: ({ row }) => (
          <span className={`text-xs whitespace-nowrap ${isDark ? "text-slate-400" : "text-slate-700"}`}>
            {row.original.startDateTime ? new Date(row.original.startDateTime).toLocaleString() : "null"}
          </span>
        ),
      }),
      columnHelper.accessor("endDateTime", {
        id: "endDateTime",
        header: "Expire",
        cell: ({ row }) => (
          <span className={`text-xs whitespace-nowrap ${isDark ? "text-slate-400" : "text-slate-700"}`}>
            {row.original.endDateTime ? new Date(row.original.endDateTime).toLocaleString() : "null"}
          </span>
        ),
      }),
      columnHelper.accessor("address", {
        id: "address",
        header: "Address",
        cell: ({ row }) => (
          <span className={`text-xs whitespace-nowrap ${isDark ? "text-slate-400" : "text-slate-700"}`}>
            {row.original.address ?? "null"}
          </span>
        ),
      }),
      columnHelper.accessor("createdAt", {
        id: "createdAt",
        header: "Created on",
        cell: ({ row }) => (
          <span className={`text-xs whitespace-nowrap ${isDark ? "text-slate-400" : "text-slate-700"}`}>
            {row.original.createdAt ? new Date(row.original.createdAt).toLocaleString() : "null"}
          </span>
        ),
      }),

  
      // columnHelper.display({
      //   id: "actions",
      //   header: "ACTIONS",
      //   cell: ({ row }) => (
      //     <div className="flex items-center justify-end gap-1 min-w-[110px]">
      //       <Tooltip title="View Task Details">
      //         <IconButton
      //           size="small"
      //           onClick={() => onViewClick && onViewClick(row.original)}
      //           sx={{
      //             color: isDark ? "#818cf8" : "#4f46e5",
      //             "&:hover": {
      //               backgroundColor: isDark
      //                 ? "rgba(99, 102, 241, 0.15)"
      //                 : "rgba(79, 70, 229, 0.1)",
      //             },
      //           }}
      //         >
      //           <VisibilityIcon fontSize="small" />
      //         </IconButton>
      //       </Tooltip>

      //       <Tooltip title="Edit Task">
      //         <IconButton
      //           size="small"
      //           onClick={() => onEditClick && onEditClick(row.original)}
      //           sx={{
      //             color: isDark ? "#fb923c" : "#ea580c",
      //             "&:hover": {
      //               backgroundColor: isDark
      //                 ? "rgba(249, 115, 22, 0.15)"
      //                 : "rgba(234, 88, 12, 0.1)",
      //             },
      //           }}
      //         >
      //           <EditIcon fontSize="small" />
      //         </IconButton>
      //       </Tooltip>

      //       <Tooltip title="Delete Task">
      //         <IconButton
      //           size="small"
      //           onClick={() => onDeleteClick && onDeleteClick(row.original)}
      //           sx={{
      //             color: isDark ? "#f87171" : "#dc2626",
      //             "&:hover": {
      //               backgroundColor: isDark
      //                 ? "rgba(239, 68, 68, 0.15)"
      //                 : "rgba(220, 38, 38, 0.1)",
      //             },
      //           }}
      //         >
      //           <DeleteIcon fontSize="small" />
      //         </IconButton>
      //       </Tooltip>
      //     </div>
      //   ),
      // }),
    ],
    [
      isDark,
      onViewClick,
      onEditClick,
      onDeleteClick,
      getStatusChipProps,
      getPriorityChipProps,
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
      className={`flex flex-col rounded-2xl border shadow-xl overflow-hidden w-full transition-colors duration-200 ${
        isDark ? "border-slate-800/80 bg-slate-900/70" : "border-slate-200 bg-white"
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
