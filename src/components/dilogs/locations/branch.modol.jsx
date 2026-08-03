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

export default function BranchFormModal({ open, onClose, branchItem = null, onSuccess }) {
  const { isDark } = useThemeMode();
  const isEdit = Boolean(branchItem);

  const [formData, setFormData] = useState({
    name: '',
    state_id: '',
    region_id: '',
    status: 'active',
  });

  const [states, setStates] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingDropdowns, setFetchingDropdowns] = useState(false);

  useEffect(() => {
    const fetchStatesAndRegions = async () => {
      setFetchingDropdowns(true);
      try {
        const [statesRes, regionsRes] = await Promise.all([
          locationRoute.getAllStates({ page: 1, limit: 200 }),
          locationRoute.getAllRegions({ page: 1, limit: 500 }),
        ]);

        if (statesRes?.data) {
          const list = Array.isArray(statesRes.data) ? statesRes.data : statesRes.data.states || [];
          setStates(list);
        }
        if (regionsRes?.data) {
          const list = Array.isArray(regionsRes.data) ? regionsRes.data : regionsRes.data.regions || [];
          setRegions(list);
        }
      } catch (err) {
        console.error('Failed to fetch states/regions for branch form:', err);
      } finally {
        setFetchingDropdowns(false);
      }
    };

    if (open) {
      fetchStatesAndRegions();
    }
  }, [open]);

  useEffect(() => {
    if (branchItem) {
      setFormData({
        name: branchItem.name || '',
        state_id: branchItem.state_id || branchItem.state?.id || '',
        region_id: branchItem.region_id || branchItem.region?.id || '',
        status: branchItem.status || 'active',
      });
    } else {
      setFormData({
        name: '',
        state_id: '',
        region_id: '',
        status: 'active',
      });
    }
  }, [branchItem, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'state_id') {
      setFormData((prev) => ({ ...prev, state_id: value, region_id: '' }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const filteredRegions = formData.state_id
    ? regions.filter((r) => String(r.state_id) === String(formData.state_id))
    : regions;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Branch name is required');
      return;
    }
    if (!formData.state_id) {
      toast.error('Please select a state');
      return;
    }
    if (!formData.region_id) {
      toast.error('Please select a region');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        state_id: Number(formData.state_id),
        region_id: Number(formData.region_id),
        status: formData.status,
      };

      let res;
      if (isEdit) {
        const identifier = branchItem.slug || branchItem.id;
        res = await locationRoute.updateBranch(identifier, payload);
      } else {
        res = await locationRoute.createBranch(payload);
      }

      if (res && (res.success || res.statusCode === 200 || res.statusCode === 201)) {
        toast.success(res.message || `Branch ${isEdit ? 'updated' : 'created'} successfully!`);
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err) {
      console.error('Submit branch error:', err);
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
        <span className="font-bold text-lg">{isEdit ? 'Edit Branch' : 'Create New Branch'}</span>
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
                label="Branch Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                size="small"
                variant="outlined"
                placeholder="e.g. Lucknow Main Branch"
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
                disabled={fetchingDropdowns}
              >
                <MenuItem value="">
                  {fetchingDropdowns ? 'Loading...' : 'Select State'}
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
                label="Region"
                name="region_id"
                value={formData.region_id}
                onChange={handleChange}
                required
                size="small"
                disabled={fetchingDropdowns || !formData.state_id}
              >
                <MenuItem value="">
                  {!formData.state_id ? 'Select State first' : 'Select Region'}
                </MenuItem>
                {filteredRegions.map((rg) => (
                  <MenuItem key={rg.id} value={rg.id}>
                    {rg.name} (ID: {rg.id})
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
            {loading ? <CircularProgress size={22} color="inherit" /> : isEdit ? 'Save Changes' : 'Create Branch'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
