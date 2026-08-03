import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Skeleton,
  Box,
} from '@mui/material';
import { useThemeMode } from '../../contexts/ThemeContext';

/**
 * Reusable TableSkeleton component.
 * Provides a sleek, uniform skeleton loading state across all table views in the app.
 *
 * @param {number} [columns=6] - Number of columns or array of column widths/alignments
 * @param {number} [rows=8] - Number of skeleton rows to render
 * @param {boolean} [showHeader=true] - Whether to render table header skeleton
 * @param {boolean} [showPagination=true] - Whether to render table pagination skeleton
 * @param {string|number} [maxHeight] - Optional max height for container
 * @param {number} [avatarColIndex=-1] - Optional column index containing avatars/icons
 */
export default function TableSkeleton({
  columns = 6,
  rows = 8,
  showHeader = true,
  showPagination = true,
  maxHeight,
  avatarColIndex = -1,
}) {
  const { isDark } = useThemeMode();

  const columnCount = typeof columns === 'number' ? columns : columns.length;
  const colArray = Array.from({ length: columnCount });
  const rowArray = Array.from({ length: rows });

  // Custom skeleton colors for dark/light themes
  const skeletonSx = {
    bgcolor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.08)',
  };

  return (
    <Box
      className={`w-full h-full flex flex-col rounded-2xl border transition-colors duration-200 overflow-hidden ${
        isDark ? 'bg-slate-900 border-slate-800/80 shadow-slate-950/20' : 'bg-white border-slate-200/80 shadow-sm'
      }`}
    >
      <TableContainer className="overflow-auto w-full flex-1 min-h-0" sx={{ maxHeight: maxHeight || 'none' }}>
        <Table sx={{ width: '100%', minWidth: '100%' }}>
          {showHeader && (
            <TableHead>
              <TableRow>
                {colArray.map((_, colIdx) => (
                  <TableCell
                    key={`skel-head-${colIdx}`}
                    sx={{
                      py: 1.5,
                      px: 2,
                      backgroundColor: isDark ? '#0f172a !important' : '#f8fafc !important',
                      borderBottom: isDark ? '1px solid #1e293b' : '1px solid #e2e8f0',
                    }}
                  >
                    <Skeleton
                      animation="wave"
                      variant="text"
                      width={colIdx === 0 ? '60%' : colIdx === columnCount - 1 ? '40%' : '75%'}
                      height={20}
                      sx={skeletonSx}
                    />
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
          )}

          <TableBody>
            {rowArray.map((_, rowIdx) => (
              <TableRow
                key={`skel-row-${rowIdx}`}
                sx={{
                  borderBottom: isDark ? '1px solid rgba(30, 41, 59, 0.6)' : '1px solid #f1f5f9',
                }}
              >
                {colArray.map((_, colIdx) => {
                  const isAvatar = colIdx === avatarColIndex || (avatarColIndex === -1 && colIdx === 0 && rowIdx % 2 === 0);
                  const isAction = colIdx === columnCount - 1;

                  return (
                    <TableCell key={`skel-cell-${rowIdx}-${colIdx}`} sx={{ px: 2, py: 1.8 }}>
                      {isAvatar ? (
                        <div className="flex items-center gap-3">
                          <Skeleton animation="wave" variant="circular" width={34} height={34} sx={skeletonSx} />
                          <div className="flex-1">
                            <Skeleton animation="wave" variant="text" width="70%" height={18} sx={skeletonSx} />
                            <Skeleton animation="wave" variant="text" width="40%" height={14} sx={skeletonSx} />
                          </div>
                        </div>
                      ) : isAction ? (
                        <div className="flex items-center justify-end gap-2">
                          <Skeleton animation="wave" variant="circular" width={28} height={28} sx={skeletonSx} />
                          <Skeleton animation="wave" variant="circular" width={28} height={28} sx={skeletonSx} />
                        </div>
                      ) : (
                        <Skeleton
                          animation="wave"
                          variant="rounded"
                          width={colIdx % 2 === 0 ? '80%' : '60%'}
                          height={16}
                          sx={{ ...skeletonSx, borderRadius: '6px' }}
                        />
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {showPagination && (
        <div
          className={`flex items-center justify-between px-4 py-3 border-t ${
            isDark ? 'border-slate-800/80 bg-slate-900/90' : 'border-slate-200 bg-white'
          }`}
        >
          <Skeleton animation="wave" variant="text" width={140} height={20} sx={skeletonSx} />
          <div className="flex items-center gap-2">
            <Skeleton animation="wave" variant="rounded" width={80} height={28} sx={{ ...skeletonSx, borderRadius: '8px' }} />
            <Skeleton animation="wave" variant="rounded" width={100} height={28} sx={{ ...skeletonSx, borderRadius: '8px' }} />
          </div>
        </div>
      )}
    </Box>
  );
}
