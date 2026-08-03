import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  IconButton,
  Grid,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useThemeMode } from '../../../contexts/ThemeContext';
import { TaskTypeRoute } from '../../../routes/tasks/task-type';
import { toast } from 'react-toastify';

export default function TaskTypeFormModal({ open, onClose, taskTypeItem = null, onSuccess }) {
  const { isDark } = useThemeMode();
  const isEdit = Boolean(taskTypeItem);

  const [formData, setFormData] = useState({
    name: '',
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (taskTypeItem) {
      setFormData({
        name: taskTypeItem.name || '',
      });
    } else {
      setFormData({
        name: '',
      });
    }
  }, [taskTypeItem, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Task type name is required');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
      };

      let res;
      if (isEdit) {
        const identifier = taskTypeItem.slug || taskTypeItem.id;
        res = await TaskTypeRoute.updateTaskType(identifier, payload);
      } else {
        res = await TaskTypeRoute.createTaskType(payload);
      }

      if (res && (res.success || res.statusCode === 200 || res.statusCode === 201)) {
        toast.success(res.message || `Task type ${isEdit ? 'updated' : 'created'} successfully!`);
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err) {
      console.error('Submit task type error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: '16px',
          backgroundColor: isDark ? '#0f172a' : '#ffffff',
          color: isDark ? '#ffffff' : '#0f172a',
          backgroundImage: 'none',
        },
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className="font-bold text-lg">{isEdit ? 'Edit Task Type' : 'Create New Task Type'}</span>
        <IconButton onClick={onClose} size="small" sx={{ color: isDark ? '#94a3b8' : '#64748b' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ borderColor: isDark ? '#334155' : '#e2e8f0' }}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Task Type Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                size="small"
                variant="outlined"
                placeholder="e.g. Site Visit, Phone Call, Audit"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: isDark ? '#ffffff' : '#0f172a',
                  },
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2, borderColor: isDark ? '#334155' : '#e2e8f0' }}>
          <Button onClick={onClose} disabled={loading} color="inherit">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              borderRadius: '10px',
              fontWeight: 700,
              background: isDark
                ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
                : '#0f172a',
            }}
          >
            {loading ? <CircularProgress size={22} color="inherit" /> : isEdit ? 'Save Changes' : 'Create Task Type'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
