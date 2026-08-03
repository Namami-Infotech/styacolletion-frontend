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

export default function RegionFormModal({ open, onClose, regionItem = null, onSuccess }) {
  const { isDark } = useThemeMode();
  const isEdit = Boolean(regionItem);

  const [formData, setFormData] = useState({
    name: '',
    state_id: '',
    status: 'active',
  });

  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingStates, setFetchingStates] = useState(false);

  useEffect(() => {
    const fetchStatesData = async () => {
      setFetchingStates(true);
      try {
        const res = await locationRoute.getAllStates({ page: 1, limit: 200 });
        if (res?.data) {
          const list = Array.isArray(res.data) ? res.data : res.data.states || [];
          setStates(list);
        }
      } catch (err) {
        console.error('Failed to fetch states for region form:', err);
      } finally {
        setFetchingStates(false);
      }
    };

    if (open) {
      fetchStatesData();
    }
  }, [open]);

  useEffect(() => {
    if (regionItem) {
      setFormData({
        name: regionItem.name || '',
        state_id: regionItem.state_id || regionItem.state?.id || '',
        status: regionItem.status || 'active',
      });
    } else {
      setFormData({
        name: '',
        state_id: '',
        status: 'active',
      });
    }
  }, [regionItem, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Region name is required');
      return;
    }
    if (!formData.state_id) {
      toast.error('Please select a state');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        state_id: Number(formData.state_id),
        status: formData.status,
      };

      let res;
      if (isEdit) {
        const identifier = regionItem.slug || regionItem.id;
        res = await locationRoute.updateRegion(identifier, payload);
      } else {
        res = await locationRoute.createRegion(payload);
      }

      if (res && (res.success || res.statusCode === 200 || res.statusCode === 201)) {
        toast.success(res.message || `Region ${isEdit ? 'updated' : 'created'} successfully!`);
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err) {
      console.error('Submit region error:', err);
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
        <span className="font-bold text-lg">{isEdit ? 'Edit Region' : 'Create New Region'}</span>
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
                label="Region Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                size="small"
                variant="outlined"
                placeholder="e.g. Lucknow, North Region"
              />
            </Grid>

            <Grid size={{xs:12,md:6}}>
              <TextField
                select
                fullWidth
                label="State"
                name="state_id"
                value={formData.state_id}
                onChange={handleChange}
                required
                size="small"
                disabled={fetchingStates}
              >
                <MenuItem value="">
                  {fetchingStates ? 'Loading states...' : 'Select State'}
                </MenuItem>
                {states.map((st) => (
                  <MenuItem key={st.id} value={st.id}>
                    {st.name} (ID: {st.id})
                  </MenuItem>
                ))}
              </TextField>
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
            {loading ? <CircularProgress size={22} color="inherit" /> : isEdit ? 'Save Changes' : 'Create Region'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
