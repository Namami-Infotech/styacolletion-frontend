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
import { officeRoute } from '../../../routes/office/office.route';
import OfficeLocationPicker from './OfficeLocationPicker';
import { toast } from 'react-toastify';

export default function OfficeFormModal({ open, onClose, office = null, onSuccess }) {
  const { isDark } = useThemeMode();
  const isEdit = Boolean(office);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    state_id: '',
    region_id: '',
    branch_id: '',
    latitude: '',
    longitude: '',
    radius: 100,
    status: 'active',
  });

  const [states, setStates] = useState([]);
  const [regions, setRegions] = useState([]);
  const [branches, setBranches] = useState([]);

  const [loading, setLoading] = useState(false);
  const [fetchingDropdowns, setFetchingDropdowns] = useState(false);

  useEffect(() => {
    const loadDropdownData = async () => {
      setFetchingDropdowns(true);
      try {
        const [statesRes, regionsRes, branchesRes] = await Promise.all([
          officeRoute.getStates(),
          officeRoute.getRegions(),
          officeRoute.getBranches(),
        ]);

        if (statesRes?.data) {
          const list = Array.isArray(statesRes.data) ? statesRes.data : statesRes.data.states || [];
          setStates(list);
        }
        if (regionsRes?.data) {
          const list = Array.isArray(regionsRes.data) ? regionsRes.data : regionsRes.data.regions || [];
          setRegions(list);
        }
        if (branchesRes?.data) {
          const list = Array.isArray(branchesRes.data) ? branchesRes.data : branchesRes.data.branches || [];
          setBranches(list);
        }
      } catch (err) {
        console.error('Error fetching dropdown data for office form:', err);
      } finally {
        setFetchingDropdowns(false);
      }
    };

    if (open) {
      loadDropdownData();
    }
  }, [open]);

  useEffect(() => {
    if (office) {
      setFormData({
        name: office.name || '',
        address: office.address || '',
        state_id: office.state_id || office.state?.id || '',
        region_id: office.region_id || office.region?.id || '',
        branch_id: office.branch_id || office.branch?.id || '',
        latitude: office.latitude != null ? office.latitude : '',
        longitude: office.longitude != null ? office.longitude : '',
        radius: office.radius != null ? office.radius : 100,
        status: office.status || 'active',
      });
    } else {
      setFormData({
        name: '',
        address: '',
        state_id: '',
        region_id: '',
        branch_id: '',
        latitude: '',
        longitude: '',
        radius: 100,
        status: 'active',
      });
    }
  }, [office, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocationSelect = ({ address, latitude, longitude }) => {
    setFormData((prev) => ({
      ...prev,
      address: address || prev.address,
      latitude: latitude !== '' && latitude !== null && latitude !== undefined ? latitude : prev.latitude,
      longitude: longitude !== '' && longitude !== null && longitude !== undefined ? longitude : prev.longitude,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.address) {
      toast.error('Office name and address are required');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        address: formData.address,
        state_id: formData.state_id || 1,
        region_id: formData.region_id || 1,
        branch_id: formData.branch_id || 1,
        latitude: parseFloat(formData.latitude) || 0,
        longitude: parseFloat(formData.longitude) || 0,
        radius: parseFloat(formData.radius) || 100,
        status: formData.status,
      };

      let res;
      if (isEdit) {
        const slug = office.slug || office.id;
        res = await officeRoute.updateOffice(slug, payload);
      } else {
        res = await officeRoute.createOffice(payload);
      }

      if (res && (res.success || res.statusCode === 200 || res.statusCode === 201)) {
        toast.success(res.message || `Office ${isEdit ? 'updated' : 'created'} successfully!`);
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err) {
      console.error('Submit office error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
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
        <span className="font-bold text-lg">{isEdit ? 'Edit Office' : 'Create New Office'}</span>
        <IconButton onClick={onClose} size="small" sx={{ color: isDark ? '#94a3b8' : '#64748b' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ borderColor: isDark ? '#334155' : '#e2e8f0' }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Office Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                size="small"
                variant="outlined"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
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

            {/* Google Map Location Picker */}
            <Grid size={{ xs: 12, md: 12 }}>
              <OfficeLocationPicker
                address={formData.address}
                latitude={formData.latitude}
                longitude={formData.longitude}
                onLocationSelect={handleLocationSelect}
              />
            </Grid>

            {/* Office Address Textarea */}
            <Grid size={{ xs: 12, md: 12 }}>
              <TextField
                fullWidth
                label="Office Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                multiline
                rows={2}
                size="small"
                variant="outlined"
                helperText="Auto-populated from Google Map location search or editable"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                select
                fullWidth
                label="State"
                name="state_id"
                value={formData.state_id}
                onChange={handleChange}
                size="small"
              >
                <MenuItem value="">Select State</MenuItem>
                {states.map((st) => (
                  <MenuItem key={st.id || st._id} value={st.id || st._id}>
                    {st.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                select
                fullWidth
                label="Region"
                name="region_id"
                value={formData.region_id}
                onChange={handleChange}
                size="small"
              >
                <MenuItem value="">Select Region</MenuItem>
                {regions.map((rg) => (
                  <MenuItem key={rg.id || rg._id} value={rg.id || rg._id}>
                    {rg.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                select
                fullWidth
                label="Branch"
                name="branch_id"
                value={formData.branch_id}
                onChange={handleChange}
                size="small"
              >
                <MenuItem value="">Select Branch</MenuItem>
                {branches.map((br) => (
                  <MenuItem key={br.id || br._id} value={br.id || br._id}>
                    {br.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Radius (meters)"
                name="radius"
                type="number"
                value={formData.radius}
                onChange={handleChange}
                size="small"
                helperText="Allowed geofence radius for clock-in (e.g. 100m)"
              />
            </Grid>

            {/* Latitude & Longitude (Disabled, Auto-set from Map) */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Latitude"
                name="latitude"
                type="number"
                disabled
                value={formData.latitude}
                size="small"
                helperText="Disabled - Auto-filled from Google Map location search"
                slotProps={{
                  input: {
                    readOnly: true,
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Longitude"
                name="longitude"
                type="number"
                disabled
                value={formData.longitude}
                size="small"
                helperText="Disabled - Auto-filled from Google Map location search"
                slotProps={{
                  input: {
                    readOnly: true,
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
            {loading ? <CircularProgress size={22} color="inherit" /> : isEdit ? 'Save Changes' : 'Create Office'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
