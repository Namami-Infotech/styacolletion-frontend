import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  CircularProgress,
  IconButton,
  Grid,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useThemeMode } from '../../../contexts/ThemeContext';
import { locationRoute } from '../../../routes/location/location.route';
import { toast } from 'react-toastify';

export default function StateFormModal({ open, onClose, stateItem = null, onSuccess }) {
  const { isDark } = useThemeMode();
  const isEdit = Boolean(stateItem);

  const [formData, setFormData] = useState({
    name: '',
    status: 'active',
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (stateItem) {
      setFormData({
        name: stateItem.name || '',
        status: stateItem.status || 'active',
      });
    } else {
      setFormData({
        name: '',
        status: 'active',
      });
    }
  }, [stateItem, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('State name is required');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        status: formData.status,
      };

      let res;
      if (isEdit) {
        const identifier = stateItem.slug || stateItem.id;
        res = await locationRoute.updateState(identifier, payload);
      } else {
        res = await locationRoute.createState(payload);
      }

      if (res && (res.success || res.statusCode === 200 || res.statusCode === 201)) {
        toast.success(res.message || `State ${isEdit ? 'updated' : 'created'} successfully!`);
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err) {
      console.error('Submit state error:', err);
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
        <span className="font-bold text-lg">{isEdit ? 'Edit State' : 'Create New State'}</span>
        <IconButton onClick={onClose} size="small" sx={{ color: isDark ? '#94a3b8' : '#64748b' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ borderColor: isDark ? '#334155' : '#e2e8f0' }}>
          <Grid container spacing={2}>
            <Grid size={{xs:12,md:6}}>
              <TextField
                fullWidth
                label="State Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                size="small"
                variant="outlined"
                placeholder="e.g. Delhi, Maharashtra"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: isDark ? '#ffffff' : '#0f172a',
                  },
                }}
              />
            </Grid>

            <Grid size={{xs:12,md:6}}>
              <TextField
                select
                fullWidth
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: isDark ? '#ffffff' : '#0f172a',
                  },
                }}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </TextField>
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
            {loading ? <CircularProgress size={22} color="inherit" /> : isEdit ? 'Save Changes' : 'Create State'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
