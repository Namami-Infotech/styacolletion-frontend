import React from 'react';
import { IconButton, MenuItem, Select, FormControl, Tooltip } from '@mui/material';
import { useThemeMode } from '../../contexts/ThemeContext';

import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LastPageIcon from '@mui/icons-material/LastPage';

export default function TablePaginationComponent({
  table,
  totalData,
  count,
  page,
  setPage,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = [10, 20, 25, 50],
}) {
  const { isDark } = useThemeMode();

  // If table instance is provided, extract state and handlers from TanStack Table
  const tableState = table ? table.getState().pagination : null;
  const pageIndex = tableState ? tableState.pageIndex : (page ?? 0);
  const pageSize = tableState ? tableState.pageSize : 5;
  const totalItems = totalData ?? count ?? (table ? table.getFilteredRowModel().rows.length : 0);

  const totalPages = table
    ? Math.ceil(totalItems / pageSize) || 1
    : Math.ceil(totalItems / pageSize) || 1;

  const currentPage = Math.min(Math.max(0, pageIndex), totalPages - 1);

  const startItem = totalItems === 0 ? 0 : currentPage * pageSize + 1;
  const endItem = Math.min(totalItems, (currentPage + 1) * pageSize);

  const handlePageClick = (e, newPage) => {
    if (newPage >= 0 && newPage < totalPages && newPage !== currentPage) {
      if (setPage) {
        setPage(newPage);
      } else if (onPageChange) {
        onPageChange(e, newPage);
      }
      if (table) {
        table.setPageIndex(newPage);
      }
    }
  };

  const handleRowsPerPageChange = (e) => {
    const newSize = Number(e.target.value);
    if (onRowsPerPageChange) {
      onRowsPerPageChange(e);
    }
    if (table) {
      table.setPageSize(newSize);
    }
  };

  // Generate page numbers with ellipses: [1] [2] ... [99] [100]
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages + 2) {
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(0);

      let start = Math.max(1, currentPage - 1);
      let end = Math.min(totalPages - 2, currentPage + 1);

      if (currentPage <= 2) {
        start = 1;
        end = 3;
      } else if (currentPage >= totalPages - 3) {
        start = totalPages - 4;
        end = totalPages - 2;
      }

      if (start > 1) {
        pages.push('DOTS_LEFT');
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 2) {
        pages.push('DOTS_RIGHT');
      }

      pages.push(totalPages - 1);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-2.5 border-t text-xs font-medium transition-all duration-200 select-none ${
        isDark
          ? 'border-slate-800/80 bg-slate-900/60 backdrop-blur-md text-slate-300'
          : 'border-slate-200/80 bg-slate-50/70 backdrop-blur-md text-slate-700'
      }`}
    >
      {/* Left side: Rows per page selector & range info */}
      <div className="flex items-center gap-3.5 flex-wrap">
        <div className="flex items-center gap-2">
          <span className={`text-[12px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Rows per page:
          </span>
          <FormControl size="small">
            <Select
              value={pageSize}
              onChange={handleRowsPerPageChange}
              sx={{
                color: isDark ? '#f1f5f9' : '#0f172a',
                fontSize: '0.75rem',
                fontWeight: 600,
                backgroundColor: isDark ? 'rgba(15, 23, 42, 0.6)' : '#ffffff',
                borderRadius: '10px',
                height: '32px',
                boxShadow: isDark ? 'none' : '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#e2e8f0',
                  transition: 'border-color 0.15s ease',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: isDark ? '#818cf8' : '#6366f1',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#6366f1',
                  borderWidth: '1.5px',
                },
                '& .MuiSelect-select': {
                  padding: '4px 24px 4px 10px',
                },
                '& .MuiSvgIcon-root': {
                  color: isDark ? '#94a3b8' : '#64748b',
                  fontSize: '18px',
                },
              }}
            >
              {rowsPerPageOptions.map((option) => (
                <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        <div className={`h-4 w-px ${isDark ? 'bg-slate-800' : 'bg-slate-200'} hidden sm:block`} />

        <span className={`text-[12px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Showing{' '}
          <span className={`font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{startItem}</span>
          {' '}–{' '}
          <span className={`font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{endItem}</span>
          {' '}of{' '}
          <span className={`font-bold ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>{totalItems}</span>
          {' '}entries
        </span>
      </div>

      {/* Right side: Navigation icons & direct jump buttons << < [1] [2] ... [10] > >> */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* First Page (<<) */}
        <Tooltip title="First page" arrow>
          <span>
            <IconButton
              onClick={(e) => handlePageClick(e, 0)}
              disabled={currentPage === 0}
              size="small"
              sx={{
                color: currentPage === 0 ? (isDark ? 'rgba(148, 163, 184, 0.25)' : '#cbd5e1') : isDark ? '#94a3b8' : '#475569',
                backgroundColor: isDark ? 'rgba(15, 23, 42, 0.6)' : '#ffffff',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
                borderRadius: '8px',
                width: 32,
                height: 32,
                padding: 0,
                boxShadow: isDark ? 'none' : '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
                '&:hover': {
                  backgroundColor: isDark ? 'rgba(99, 102, 241, 0.15)' : '#f1f5f9',
                  color: isDark ? '#818cf8' : '#4f46e5',
                  borderColor: isDark ? 'rgba(99, 102, 241, 0.4)' : '#c7d2fe',
                },
                '&.Mui-disabled': {
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#f1f5f9',
                  backgroundColor: 'transparent',
                },
              }}
            >
              <FirstPageIcon fontSize="small" sx={{ fontSize: '18px' }} />
            </IconButton>
          </span>
        </Tooltip>

        {/* Previous Page (<) */}
        <Tooltip title="Previous page" arrow>
          <span>
            <IconButton
              onClick={(e) => handlePageClick(e, currentPage - 1)}
              disabled={currentPage === 0}
              size="small"
              sx={{
                color: currentPage === 0 ? (isDark ? 'rgba(148, 163, 184, 0.25)' : '#cbd5e1') : isDark ? '#94a3b8' : '#475569',
                backgroundColor: isDark ? 'rgba(15, 23, 42, 0.6)' : '#ffffff',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
                borderRadius: '8px',
                width: 32,
                height: 32,
                padding: 0,
                boxShadow: isDark ? 'none' : '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
                '&:hover': {
                  backgroundColor: isDark ? 'rgba(99, 102, 241, 0.15)' : '#f1f5f9',
                  color: isDark ? '#818cf8' : '#4f46e5',
                  borderColor: isDark ? 'rgba(99, 102, 241, 0.4)' : '#c7d2fe',
                },
                '&.Mui-disabled': {
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#f1f5f9',
                  backgroundColor: 'transparent',
                },
              }}
            >
              <KeyboardArrowLeft fontSize="small" sx={{ fontSize: '18px' }} />
            </IconButton>
          </span>
        </Tooltip>

        {/* Numbered Page Buttons */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((pageItem, index) => {
            if (pageItem === 'DOTS_LEFT' || pageItem === 'DOTS_RIGHT') {
              return (
                <span key={`dots-${index}`} className={`px-1.5 font-bold select-none ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                  •••
                </span>
              );
            }

            const isSelected = pageItem === currentPage;

            return (
              <button
                key={pageItem}
                onClick={(e) => handlePageClick(e, pageItem)}
                className={`min-w-[32px] h-[32px] px-2 rounded-lg text-xs font-bold transition-all duration-150 flex items-center justify-center cursor-pointer ${
                  isSelected
                    ? isDark
                      ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-sm shadow-indigo-500/40 border border-indigo-400/30'
                      : 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20 border border-indigo-600'
                    : isDark
                      ? 'bg-slate-900/60 text-slate-300 border border-slate-800 hover:bg-slate-800 hover:text-white hover:border-slate-700'
                      : 'bg-white text-slate-700 border border-slate-200/90 shadow-xs hover:bg-slate-100 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                {pageItem + 1}
              </button>
            );
          })}
        </div>

        {/* Next Page (>) */}
        <Tooltip title="Next page" arrow>
          <span>
            <IconButton
              onClick={(e) => handlePageClick(e, currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
              size="small"
              sx={{
                color: currentPage >= totalPages - 1 ? (isDark ? 'rgba(148, 163, 184, 0.25)' : '#cbd5e1') : isDark ? '#94a3b8' : '#475569',
                backgroundColor: isDark ? 'rgba(15, 23, 42, 0.6)' : '#ffffff',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
                borderRadius: '8px',
                width: 32,
                height: 32,
                padding: 0,
                boxShadow: isDark ? 'none' : '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
                '&:hover': {
                  backgroundColor: isDark ? 'rgba(99, 102, 241, 0.15)' : '#f1f5f9',
                  color: isDark ? '#818cf8' : '#4f46e5',
                  borderColor: isDark ? 'rgba(99, 102, 241, 0.4)' : '#c7d2fe',
                },
                '&.Mui-disabled': {
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#f1f5f9',
                  backgroundColor: 'transparent',
                },
              }}
            >
              <KeyboardArrowRight fontSize="small" sx={{ fontSize: '18px' }} />
            </IconButton>
          </span>
        </Tooltip>

        {/* Last Page (>>) */}
        <Tooltip title="Last page" arrow>
          <span>
            <IconButton
              onClick={(e) => handlePageClick(e, totalPages - 1)}
              disabled={currentPage >= totalPages - 1}
              size="small"
              sx={{
                color: currentPage >= totalPages - 1 ? (isDark ? 'rgba(148, 163, 184, 0.25)' : '#cbd5e1') : isDark ? '#94a3b8' : '#475569',
                backgroundColor: isDark ? 'rgba(15, 23, 42, 0.6)' : '#ffffff',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
                borderRadius: '8px',
                width: 32,
                height: 32,
                padding: 0,
                boxShadow: isDark ? 'none' : '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
                '&:hover': {
                  backgroundColor: isDark ? 'rgba(99, 102, 241, 0.15)' : '#f1f5f9',
                  color: isDark ? '#818cf8' : '#4f46e5',
                  borderColor: isDark ? 'rgba(99, 102, 241, 0.4)' : '#c7d2fe',
                },
                '&.Mui-disabled': {
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#f1f5f9',
                  backgroundColor: 'transparent',
                },
              }}
            >
              <LastPageIcon fontSize="small" sx={{ fontSize: '18px' }} />
            </IconButton>
          </span>
        </Tooltip>
      </div>
    </div>
  );
}
