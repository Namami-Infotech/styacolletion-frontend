import React from 'react';
import { IconButton, MenuItem, Select, FormControl } from '@mui/material';
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
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 px-3.5 py-1.5 border-t text-xs font-medium transition-colors duration-200 ${
        isDark
          ? 'border-slate-800/80 bg-slate-900/90 text-slate-300'
          : 'border-slate-200 bg-white text-slate-700'
      }`}
    >
      {/* Left side: Rows per page selector & range info */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className={isDark ? 'text-slate-400' : 'text-slate-700 font-semibold'}>Rows per page:</span>
          <FormControl size="small">
            <Select
              value={pageSize}
              onChange={handleRowsPerPageChange}
              sx={{
                color: isDark ? '#ffffff' : '#0f172a',
                fontSize: '0.75rem',
                fontWeight: 700,
                backgroundColor: isDark ? 'rgba(15, 23, 42, 0.8)' : '#f8fafc',
                borderRadius: '8px',
                height: '32px',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#cbd5e1',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: isDark ? '#6366f1' : '#0f172a',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: isDark ? '#6366f1' : '#0f172a',
                },
                '& .MuiSelect-select': {
                  padding: '4px 24px 4px 10px',
                },
                '& .MuiSvgIcon-root': {
                  color: isDark ? '#94a3b8' : '#0f172a',
                },
              }}
            >
              {rowsPerPageOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        <span className={isDark ? 'text-slate-400' : 'text-slate-700 font-semibold'}>
          Showing <span className={`font-extrabold ${isDark ? 'text-slate-200' : 'text-slate-950'}`}>{startItem}</span> to{' '}
          <span className={`font-extrabold ${isDark ? 'text-slate-200' : 'text-slate-950'}`}>{endItem}</span> of{' '}
          <span className={`font-extrabold ${isDark ? 'text-slate-200' : 'text-slate-950'}`}>{totalItems}</span> entries
        </span>
      </div>

      {/* Right side: Navigation icons & direct jump buttons << < [1] [2] ... [10] > >> */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* First Page (<<) */}
        <IconButton
          onClick={(e) => handlePageClick(e, 0)}
          disabled={currentPage === 0}
          size="small"
          sx={{
            color: currentPage === 0 ? (isDark ? 'rgba(148, 163, 184, 0.3)' : '#cbd5e1') : isDark ? '#94a3b8' : '#475569',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #cbd5e1',
            borderRadius: '8px',
            padding: '4px',
            '&:hover': {
              backgroundColor: isDark ? 'rgba(99, 102, 241, 0.15)' : '#f1f5f9',
              color: isDark ? '#818cf8' : '#0f172a',
              borderColor: isDark ? 'rgba(99, 102, 241, 0.4)' : '#0f172a',
            },
            '&.Mui-disabled': {
              borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#e2e8f0',
            },
          }}
        >
          <FirstPageIcon fontSize="small" />
        </IconButton>

        {/* Previous Page (<) */}
        <IconButton
          onClick={(e) => handlePageClick(e, currentPage - 1)}
          disabled={currentPage === 0}
          size="small"
          sx={{
            color: currentPage === 0 ? (isDark ? 'rgba(148, 163, 184, 0.3)' : '#cbd5e1') : isDark ? '#94a3b8' : '#475569',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #cbd5e1',
            borderRadius: '8px',
            padding: '4px',
            '&:hover': {
              backgroundColor: isDark ? 'rgba(99, 102, 241, 0.15)' : '#f1f5f9',
              color: isDark ? '#818cf8' : '#0f172a',
              borderColor: isDark ? 'rgba(99, 102, 241, 0.4)' : '#0f172a',
            },
            '&.Mui-disabled': {
              borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#e2e8f0',
            },
          }}
        >
          <KeyboardArrowLeft fontSize="small" />
        </IconButton>

        {/* Numbered Page Buttons */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((pageItem, index) => {
            if (pageItem === 'DOTS_LEFT' || pageItem === 'DOTS_RIGHT') {
              return (
                <span key={`dots-${index}`} className={`px-1.5 font-bold select-none ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  ...
                </span>
              );
            }

            const isSelected = pageItem === currentPage;

            return (
              <button
                key={pageItem}
                onClick={(e) => handlePageClick(e, pageItem)}
                className={`min-w-[30px] h-[30px] px-2 rounded-lg text-xs font-semibold transition-all duration-150 flex items-center justify-center cursor-pointer ${
                  isSelected
                    ? isDark
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/30 border border-indigo-400/50'
                      : 'bg-slate-900 text-white shadow-sm border border-slate-900'
                    : isDark
                      ? 'bg-slate-800/60 text-slate-300 border border-slate-700/50 hover:bg-slate-700/80 hover:text-white'
                      : 'bg-slate-100 text-slate-800 border border-slate-300 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {pageItem + 1}
              </button>
            );
          })}
        </div>

        {/* Next Page (>) */}
        <IconButton
          onClick={(e) => handlePageClick(e, currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
          size="small"
          sx={{
            color: currentPage >= totalPages - 1 ? (isDark ? 'rgba(148, 163, 184, 0.3)' : '#cbd5e1') : isDark ? '#94a3b8' : '#475569',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #cbd5e1',
            borderRadius: '8px',
            padding: '4px',
            '&:hover': {
              backgroundColor: isDark ? 'rgba(99, 102, 241, 0.15)' : '#f1f5f9',
              color: isDark ? '#818cf8' : '#0f172a',
              borderColor: isDark ? 'rgba(99, 102, 241, 0.4)' : '#0f172a',
            },
            '&.Mui-disabled': {
              borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#e2e8f0',
            },
          }}
        >
          <KeyboardArrowRight fontSize="small" />
        </IconButton>

        {/* Last Page (>>) */}
        <IconButton
          onClick={(e) => handlePageClick(e, totalPages - 1)}
          disabled={currentPage >= totalPages - 1}
          size="small"
          sx={{
            color: currentPage >= totalPages - 1 ? (isDark ? 'rgba(148, 163, 184, 0.3)' : '#cbd5e1') : isDark ? '#94a3b8' : '#475569',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #cbd5e1',
            borderRadius: '8px',
            padding: '4px',
            '&:hover': {
              backgroundColor: isDark ? 'rgba(99, 102, 241, 0.15)' : '#f1f5f9',
              color: isDark ? '#818cf8' : '#0f172a',
              borderColor: isDark ? 'rgba(99, 102, 241, 0.4)' : '#0f172a',
            },
            '&.Mui-disabled': {
              borderColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#e2e8f0',
            },
          }}
        >
          <LastPageIcon fontSize="small" />
        </IconButton>
      </div>
    </div>
  );
}
