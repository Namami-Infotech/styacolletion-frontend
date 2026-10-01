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
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table';
import { rankItem } from '@tanstack/match-sorter-utils';
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
import { EmployeeRoute } from '../../routes/employee/employee.route.js';
import { useAuth } from '../../contexts/AuthContext.jsx';

const fuzzyFilter = (row, columnId, value, addMeta) => {
  const cellVal = formatCellText(row.getValue(columnId));
  const itemRank = rankItem(cellVal, value);
  addMeta({ itemRank });
  return itemRank.passed;
};

const columnHelper = createColumnHelper();

const formatCellText = (val, fallback = 'null') => {
  if (val === null || val === undefined) return fallback;
  if (Array.isArray(val)) {
    if (val.length === 0) return fallback;
    return val.map((item) => formatCellText(item, fallback)).join(', ');
  }
  if (typeof val === 'object') {
    return val.name || val.title || val.label || val.slug || val.identity || (val.id ? `ID: ${val.id}` : fallback);
  }
  return String(val);
};

export default function EmployeeTable({
  searchTerm = '',
  selectedDepartment = 'All',
  selectedStatus = 'All',
  onViewClick,
  onEditClick,
  onDeleteClick,
  getStatusChipProps,
  maxHeight,
  columnVisibility = {},
}) {
  const [sorting, setSorting] = useState([]);
  const { isDark } = useThemeMode();
  const [employees, setEmployees] = useState([]);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [loading, setLoading] = useState(false);
  const { hasPermission } = useAuth();
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const getAllEmployee = async () => {
    setLoading(true);
    try {
      const res = await EmployeeRoute.getAllEmployee({
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm || undefined,
        status: selectedStatus !== 'All' ? selectedStatus.toLowerCase() : undefined,
        department: selectedDepartment !== 'All' ? selectedDepartment : undefined,
      });

      if (res?.success && res?.data?.employees) {
        setEmployees(res.data.employees);
        setTotalEmployees(res.data.totalItems ?? res.data.totalEmployees ?? res.data.employees.length);
      } else {
        setEmployees([]);
        setTotalEmployees(0);
      }
    } catch (err) {
      console.error('Failed to fetch employees:', err);
      setEmployees([]);
      setTotalEmployees(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllEmployee();
  }, [page, rowsPerPage, searchTerm, selectedDepartment, selectedStatus]);





  const getChipProps = (status) => {
    if (getStatusChipProps) {
      return getStatusChipProps(status);
    }
    if (isDark) {
      switch (status) {
        case 'Active':
          return {
            label: 'Active',
            style: {
              backgroundColor: 'rgba(34, 197, 94, 0.12)',
              color: '#4ade80',
              border: '1px solid rgba(34, 197, 94, 0.25)',
              fontWeight: 700,
              borderRadius: '9999px',
              fontSize: '0.72rem',
              height: '22px',
            },
          };
        case 'On Leave':
          return {
            label: 'On Leave',
            style: {
              backgroundColor: 'rgba(234, 179, 8, 0.12)',
              color: '#facc15',
              border: '1px solid rgba(234, 179, 8, 0.25)',
              fontWeight: 700,
              borderRadius: '9999px',
              fontSize: '0.72rem',
              height: '22px',
            },
          };
        default:
          return {
            label: 'Inactive',
            style: {
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              color: '#f87171',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              fontWeight: 700,
              borderRadius: '9999px',
              fontSize: '0.72rem',
              height: '22px',
            },
          };
      }
    } else {
      switch (status) {
        case 'Active':
          return {
            label: 'Active',
            style: {
              backgroundColor: '#ecfdf5',
              color: '#047857',
              border: '1px solid #a7f3d0',
              fontWeight: 700,
              borderRadius: '9999px',
              fontSize: '0.72rem',
              height: '22px',
            },
          };
        case 'On Leave':
          return {
            label: 'On Leave',
            style: {
              backgroundColor: '#fefce8',
              color: '#a16207',
              border: '1px solid #fef08a',
              fontWeight: 700,
              borderRadius: '9999px',
              fontSize: '0.72rem',
              height: '22px',
            },
          };
        default:
          return {
            label: 'Inactive',
            style: {
              backgroundColor: '#fef2f2',
              color: '#b91c1c',
              border: '1px solid #fecaca',
              fontWeight: 700,
              borderRadius: '9999px',
              fontSize: '0.72rem',
              height: '22px',
            },
          };
      }
    }
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        id: 'name',
        header: 'Name',
        cell: ({ row }) => {
          const name = formatCellText(row.original.name);
          const email = formatCellText(row.original.email);
          const img = typeof row.original.image === 'string' && row.original.image !== 'default.png' ? row.original.image : row.original.avatar;
          console.log(img, "Sasasasasasasasa")
          return (
            <div className="flex items-center gap-3 min-w-[180px]">
              <LazyAvatar
                src={img}
                name={name !== 'null' ? name : 'E'}
                size={34}
                sx={{
                  border: isDark ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid #cbd5e1',
                }}
              />
              <div>
                <div className={`font-bold text-xs whitespace-nowrap ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {name}
                </div>
                <div className={`text-[11px] font-semibold whitespace-nowrap ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
                  {email}
                </div>
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor('manager_id', {
        id: 'manager_id',
        header: 'Manager',
        cell: ({ row }) => (
          // <>
          //   <span className={`text-xs font-semibold whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
          //     {formatCellText(row.original.manager_id?.name ?? row.original.name ?? (row.original.manager_id ? `ID: ${row.original.manager_id}` : null))}
          //   </span>
          //   <span className={`text-xs font-semibold whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
          //     {formatCellText(row.original.manager_id?.mobile ?? row.original.mobile ?? (row.original.mobile ? `ID: ${row.original.manager_id}` : null))}
          //   </span>
          // </>
          <div>
            <div className={`font-bold text-xs whitespace-nowrap ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {row.original.manager_id?.name}
            </div>
            <div className={`text-[11px] font-semibold whitespace-nowrap ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
              {row.original.manager_id?.email}
            </div>
          </div>
        ),
      }),
      columnHelper.accessor('employee_id', {
        id: 'employee_id',
        header: 'Employee ID',
        cell: ({ row }) => (
          <span
            className={`font-mono text-xs font-bold px-2 py-0.5 rounded border whitespace-nowrap ${isDark
              ? 'bg-slate-800/80 text-indigo-300 border-slate-700/60'
              : 'bg-slate-100 text-slate-900 border-slate-400'
              }`}
          >
            {formatCellText(row.original.emp_id ?? row.original.emp_id ?? row.original.emp_id)}
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
    
      columnHelper.accessor('phone', {
        id: 'phone',
        header: 'Mobile',
        cell: ({ row }) => {
          const cc = row.original.country_code || row.original.mobileCountryCode || '';
          const mob = row.original.mobile ?? row.original.phone ?? '';
          const fullMobile = cc ? `${cc} ${mob}`.trim() : mob;
          return (
            <span className={`text-xs font-semibold whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-900'}`}>
              {formatCellText(fullMobile)}
            </span>
          );
        },
      }),
      columnHelper.accessor('workingShifts', {
        id: 'workingShifts',
        header: 'Working Shifts',
        cell: ({ row }) => (
          <span className={`text-xs font-semibold whitespace-nowrap ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
            {formatCellText(row.original.work_shift ?? row.original.workingShifts ?? row.original.shift)}
          </span>
        ),
      }),
      columnHelper.accessor('salary', {
        id: 'salary',
        header: 'Salary',
        cell: ({ row }) => {
          const sal = row.original.per_month_salary ?? row.original.salary;
          const displaySal = sal !== null && sal !== undefined && !isNaN(Number(sal)) ? `₹${Number(sal).toLocaleString('en-IN')}` : '-';
          return (
            <span className={`text-xs font-semibold whitespace-nowrap ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
              {displaySal}
            </span>
          );
        },
      }),
      columnHelper.accessor('status', {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const st = row.original.status;
          if (!st) return <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>null</span>;
          const formattedStatus = String(st).charAt(0).toUpperCase() + String(st).slice(1);
          return <Chip size="small" {...getChipProps(formattedStatus)} />;
        },
      }),
      columnHelper.accessor('location', {
        id: 'location',
        header: 'Work Location',
        cell: ({ row }) => (
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-lg border whitespace-nowrap ${isDark
              ? 'text-slate-300 bg-slate-800/60 border-slate-700/50'
              : 'text-slate-900 bg-slate-100 border-slate-300'
              }`}
          >
            {formatCellText(row.original.work_location ?? row.original.location)}
          </span>
        ),
      }),
      columnHelper.accessor('type', {
        id: 'type',
        header: 'Role/Type',
        cell: ({ row }) => (
          <span className={`text-xs font-semibold whitespace-nowrap ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
            {formatCellText(row.original.type)}
          </span>
        ),
      }),
      columnHelper.accessor('employment_type', {
        id: 'employment_type',
        header: 'Employee Type',
        cell: ({ row }) => (
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded border whitespace-nowrap ${isDark
              ? 'text-indigo-300 bg-indigo-500/10 border-indigo-500/20'
              : 'text-slate-900 bg-slate-200 border-slate-400'
              }`}
          >
            {formatCellText(row.original.emp_type ?? row.original.employment_type ?? row.original.employeeType)}
          </span>
        ),
      }),
      
      columnHelper.accessor('locationAddress', {
        id: 'locationAddress',
        header: 'Location',
        cell: ({ row }) => (
          <span className={`text-xs font-semibold whitespace-nowrap ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
            {row.original.location ?? row.original.locationAddress ?? 'null'}
          </span>
        ),
      }),
      columnHelper.accessor('address', {
        id: 'address',
        header: 'Address',
        cell: ({ row }) => (
          <span className={`text-xs font-semibold whitespace-nowrap ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
            {row.original.address ?? 'null'}
          </span>
        ),
      }),
      columnHelper.accessor('dateOfBirth', {
        id: 'dateOfBirth',
        header: 'Date of Birth',
        cell: ({ row }) => (
          <span className={`text-xs font-semibold whitespace-nowrap ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
            {row.original.date_of_birth ? new Date(row.original.date_of_birth).toLocaleDateString() : (row.original.dateOfBirth ?? 'null')}
          </span>
        ),
      }),
      columnHelper.accessor('joining_date', {
        id: 'joining_date',
        header: 'Date of Joining',
        cell: ({ row }) => (
          <span className={`text-xs font-semibold whitespace-nowrap ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
            {row.original.date_of_joining ? new Date(row.original.date_of_joining).toLocaleDateString() : (row.original.joining_date ?? row.original.dateOfJoining ?? 'null')}
          </span>
        ),
      }),
      columnHelper.accessor('employeeState', {
        id: 'employeeState',
        header: 'State Name',
        cell: ({ row }) => {
          const st = row.original.state_id ?? row.original.employeeState;
          return (
            <span className={`text-xs font-semibold whitespace-nowrap ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
              {formatCellText(st)}
            </span>
          );
        },
      }),
      columnHelper.accessor('employeeRegion', {
        id: 'employeeRegion',
        header: 'Region Name ',
        cell: ({ row }) => {
          const reg = row.original.region_id ?? row.original.employeeRegion;
          return (
            <span className={`text-xs font-semibold whitespace-nowrap ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
              {formatCellText(reg)}
            </span>
          );
        },
      }),
      columnHelper.accessor('employeeBranch', {
        id: 'employeeBranch',
        header: 'Branch Name',
        cell: ({ row }) => {
          const br = row.original.branch_id ?? row.original.employeeBranch;
          return (
            <span className={`text-xs font-semibold whitespace-nowrap ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
              {formatCellText(br)}
            </span>
          );
        },
      }),
      columnHelper.accessor('team', {
        id: 'team',
        header: 'Team',
        cell: ({ row }) => (
          <span className={`text-xs font-semibold whitespace-nowrap ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
            {formatCellText(row.original.team)}
          </span>
        ),
      }),
     
      columnHelper.accessor('gender', {
        id: 'gender',
        header: 'Gender',
        cell: ({ row }) => (
          <span className={`text-xs font-semibold whitespace-nowrap ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
            {formatCellText(row.original.gender)}
          </span>
        ),
      }),
      columnHelper.accessor('accessState', {
        id: 'accessState',
        header: 'Access State',
        cell: ({ row }) => (
          <span className={`text-xs font-semibold whitespace-nowrap ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
            {formatCellText(row.original.accessState)}
          </span>
        ),
      }),

      columnHelper.accessor('createdBy', {
        id: 'createdBy',
        header: 'Created By',
        cell: ({ row }) => (
          <span className={`text-xs font-semibold whitespace-nowrap ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
            {formatCellText(row.original.createdBy)}
          </span>
        ),
      }),
     
      columnHelper.accessor('punchInGeoFence', {
        id: 'punchInGeoFence',
        header: 'Punch In Geo Fence',
        cell: ({ row }) => {
          const pIn = row.original.punchIn;
          const val = Array.isArray(pIn) && pIn.length > 0 ? pIn.map((p) => p.name).join(', ') : (row.original.punchInGeoFence ?? 'null');
          return (
            <span className={`text-xs font-semibold whitespace-nowrap ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
              {val}
            </span>
          );
        },
      }),
      columnHelper.accessor('punchOutGeoFence', {
        id: 'punchOutGeoFence',
        header: 'Punch Out Geo Fence',
        cell: ({ row }) => {
          const pOut = row.original.punchOut;
          const val = Array.isArray(pOut) && pOut.length > 0 ? pOut.map((p) => p.name).join(', ') : (row.original.punchOutGeoFence ?? 'null');
          return (
            <span className={`text-xs font-semibold whitespace-nowrap ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
              {val}
            </span>
          );
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: 'ACTIONS',
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1 min-w-[110px]">
            {hasPermission('employee', 'edit') && (
              <Tooltip title="Edit Profile">
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
              </Tooltip>)}

           { hasPermission('employee', 'delete') && (<Tooltip title="Delete Employee">
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
            </Tooltip>)}
          </div>
        ),
      }),
    ],
    [onViewClick, onEditClick, onDeleteClick, isDark,hasPermission]
  );

  const table = useReactTable({
    data: employees,
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
    pageCount: Math.ceil((totalEmployees || 0) / rowsPerPage) || 1,
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
      sx={{
        width: '100%',
        margin: 0,
        maxHeight: maxHeight || 'calc(100vh - 170px)',
      }}
    >
      {/* Scrollable Table Container */}
      <TableContainer className="overflow-auto w-full min-h-0 custom-scrollbar" sx={{ maxHeight: maxHeight ? `calc(${maxHeight} - 45px)` : 'calc(100vh - 220px)' }}>
        <Table sx={{ width: "max-content", minWidth: "100%" }} aria-label="employee table" stickyHeader>
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
            {currentPageRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 8, color: isDark ? '#94a3b8' : '#64748b' }}>
                  <div className="flex flex-col items-center gap-2.5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                      <PeopleIcon style={{ fontSize: 26 }} />
                    </div>
                    <p className={`font-bold text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      No employees matching your criteria
                    </p>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Try adjusting your search query or department filters.
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

      {/* Fixed Footer TablePaginationComponent passing TanStack table instance */}
      <div className={`flex-shrink-0 border-t ${isDark ? 'border-slate-800/80 bg-slate-900/90' : 'border-slate-200/80 bg-white'}`}>
        <TablePaginationComponent
          table={table}
          totalData={totalEmployees}
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
