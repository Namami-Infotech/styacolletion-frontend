import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useThemeMode } from '../../contexts/ThemeContext';
import { getCancelButtonStyle, getPrimaryButtonStyle } from './modalStyles';

export default function DeleteConfirmationModal({
  open,
  onClose,
  onConfirm,
  onDelete,
  handleDelete,
  handleDeleteTask,
  title,
  item,
  employee,
  customer,
  activeTask,
  itemName,
  itemCode,
  description,
  warningMessage,
  deleteButtonText = 'Delete',
  isDark: isDarkProp,
}) {
  const { isDark: contextIsDark } = useThemeMode();
  const isDark = isDarkProp !== undefined ? isDarkProp : contextIsDark;
  const [loading, setLoading] = useState(false);

  // Normalize target object
  const targetItem = item || employee || customer || activeTask;

  if (!open) return null;

  // Infer entity fields intelligently
  const displayName =
    itemName ||
    targetItem?.name ||
    targetItem?.title ||
    targetItem?.label ||
    targetItem?.customer_name ||
    'this record';

  const displayCode =
    itemCode ||
    targetItem?.employee_id ||
    targetItem?.customer_id ||
    targetItem?.task_id ||
    targetItem?.code ||
    (typeof targetItem?.id === 'string' && targetItem.id.startsWith('TASK') ? targetItem.id : null);

  const modalTitle =
    title ||
    (employee || targetItem?.employee_id
      ? 'Delete Employee'
      : customer || targetItem?.customer_id
      ? 'Delete Customer'
      : activeTask || targetItem?.task_id
      ? 'Delete Task'
      : 'Confirm Delete');

  const warningText =
    warningMessage ||
    description ||
    '⚠️ This action cannot be undone and will permanently remove this record.';

  const handleExecuteDelete = async () => {
    setLoading(true);
    try {
      const deleteFn = onConfirm || onDelete || handleDelete || handleDeleteTask;
      if (deleteFn) {
        await deleteFn(targetItem);
      }
    } catch (err) {
      console.error('Error in DeleteConfirmationModal:', err);
    } finally {
      setLoading(false);
      if (onClose) {
        onClose();
      }
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        style: {
          backgroundColor: isDark ? '#0f172a' : '#ffffff',
          border: isDark ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid #fecdd3',
          borderRadius: '20px',
          boxShadow: isDark
            ? '0 25px 50px -12px rgba(239, 68, 68, 0.25)'
            : '0 20px 25px -5px rgba(239, 68, 68, 0.15)',
        },
      }}
    >
      <DialogTitle sx={{ m: 0, p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="flex items-center gap-3">
          <div
            className={`p-3 rounded-xl border ${
              isDark
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}
          >
            <WarningAmberIcon fontSize="medium" />
          </div>
          <Typography variant="h6" className={`font-bold tracking-wide ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {modalTitle}
          </Typography>
        </div>
        <IconButton
          onClick={onClose}
          sx={{
            color: isDark ? '#94a3b8' : '#64748b',
            '&:hover': {
              color: isDark ? '#ffffff' : '#0f172a',
              backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#f1f5f9',
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 1 }}>
        <p className={`text-sm leading-relaxed mb-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          Are you sure you want to delete{' '}
          <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{displayName}</span>
          {displayCode ? (
            <>
              {' '}
              (
              <span className={`font-mono ${isDark ? 'text-indigo-400' : 'text-indigo-600 font-semibold'}`}>
                {displayCode}
              </span>
              )
            </>
          ) : null}
          ?
        </p>
        <p
          className={`text-xs p-3 rounded-xl border ${
            isDark
              ? 'text-rose-400/90 bg-rose-950/40 border-rose-900/50'
              : 'text-rose-800 bg-rose-50 border-rose-200 font-medium'
          }`}
        >
          {warningText}
        </p>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1.5 }}>
        <Button onClick={onClose} variant="outlined" disabled={loading} sx={getCancelButtonStyle(isDark)}>
          Cancel
        </Button>
        <Button
          onClick={handleExecuteDelete}
          variant="contained"
          disabled={loading}
          sx={getPrimaryButtonStyle(
            isDark,
            'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
            '0 6px 12px -2px rgba(239, 68, 68, 0.4)'
          )}
        >
          {loading ? <CircularProgress size={18} color="inherit" /> : deleteButtonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
