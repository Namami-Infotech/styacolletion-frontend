import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useThemeMode } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { EmployeeRoute } from '../../routes/employee/employee.route.js';
import { UploadRoute } from '../../routes/upload/upload.route.js';

// MUI Components
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  Switch,
  FormControlLabel,
  IconButton,
  Grid,
  Paper,
  InputAdornment,
  CircularProgress,
  Autocomplete,
  Menu,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Chip,
  Checkbox,
  ListItemText,
  Select,
} from '@mui/material';

// MUI Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CloseIcon from '@mui/icons-material/Close';

// Common Components
import Navbar from '../../components/common/Navbar';
import GoogleMap from '../googlemap/goggle_map.jsx';
import countryCodes from 'country-codes-list';

const getCountryFlagEmoji = (countryCode) => {
  if (!countryCode || countryCode.length !== 2) return '';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

const countryCodeListMap = countryCodes.customList('countryCallingCode', '{countryCode} +{countryCallingCode}');
const allCountryCodeOptions = Object.entries(countryCodeListMap).map(([code, label]) => {
  const isoCode = label.split(' ')[0] || '';
  const flagUrl = `https://flagcdn.com/w40/${isoCode.toLowerCase()}.png`;
  return {
    label: `${isoCode} +${code.trim()}`.trim(),
    value: `+${code.trim()}`,
    code: isoCode,
    flag: flagUrl,
  };
});

const CountryCodeSelect = ({ value, onChange, options, isDark, labelColor, textPrimary }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const open = Boolean(anchorEl);

  const currentOpt =
    options.find((opt) => opt.value === value) ||
    options.find((opt) => opt.value === '+91') ||
    options[0] ||
    { label: 'IN +91', value: '+91', code: 'IN', flag: 'https://flagcdn.com/w40/in.png' };

  const filteredOptions = options.filter(
    (opt) =>
      opt.label?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opt.value?.includes(searchQuery) ||
      (opt.code && opt.code.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <>
      <Box
        onClick={(e) => {
          e.stopPropagation();
          setAnchorEl(e.currentTarget);
        }}
        className="flex items-center justify-between gap-1.5 px-3 cursor-pointer select-none h-full shrink-0"
        sx={{
          backgroundColor: 'transparent',
          height: '40px',
          userSelect: 'none',
          '&:hover': {
            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
          },
        }}
      >
        <Box className="flex items-center gap-1.5 shrink-0">
          {currentOpt?.flag && (
            <img
              src={currentOpt.flag}
              alt={currentOpt.code || ''}
              className="w-5 h-3.5 object-cover rounded-xs border border-slate-200 dark:border-slate-700 shrink-0"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          )}
          <Typography variant="body2" className="text-xs font-bold shrink-0" sx={{ color: textPrimary }}>
            {currentOpt?.value || '+91'}
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ color: labelColor, fontSize: '0.65rem', ml: 0.5 }}>▼</Typography>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => { setAnchorEl(null); setSearchQuery(''); }}
        slotProps={{
          paper: {
            sx: {
              maxHeight: 320,
              width: 260,
              backgroundColor: isDark ? '#0f172a' : '#ffffff',
              color: textPrimary,
              border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.15)' : '#cbd5e1'}`,
              mt: 0.5,
            },
          },
        }}
      >
        <Box className="p-2 sticky top-0 bg-inherit z-10 border-b border-slate-200 dark:border-slate-800">
          <TextField
            autoFocus
            fullWidth
            size="small"
            placeholder="Search country or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: textPrimary,
                fontSize: '0.85rem',
                '& fieldset': { borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : '#cbd5e1' },
                '&:hover fieldset': { borderColor: isDark ? '#6366f1' : '#0f172a' },
                '&.Mui-focused fieldset': { borderColor: isDark ? '#6366f1' : '#2563eb' },
              },
            }}
          />
        </Box>
        <Box className="max-h-56 overflow-y-auto py-1">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt, idx) => (
              <MenuItem
                key={`${opt.value}-${idx}`}
                selected={opt.value === value}
                onClick={() => {
                  onChange(opt.value);
                  setAnchorEl(null);
                  setSearchQuery('');
                }}
                className="flex items-center gap-2 px-3 py-1.5 text-sm"
              >
                {opt.flag && (
                  <img
                    src={opt.flag}
                    alt={opt.code || ''}
                    className="w-5 h-3.5 object-cover rounded-xs border border-slate-200 dark:border-slate-700 shrink-0"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                )}
                <Typography variant="body2" className="text-sm">
                  {opt.label}
                </Typography>
              </MenuItem>
            ))
          ) : (
            <Box className="p-3 text-center">
              <Typography variant="body2" sx={{ color: labelColor }}>No country found</Typography>
            </Box>
          )}
        </Box>
      </Menu>
    </>
  );
};

export default function CreateEmployeePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const editEmployee = location.state?.employee;
  const isEditMode = Boolean(location.state?.isEdit || editEmployee);

  const { user, logout } = useAuth();
  const { isDark } = useThemeMode();

  const [loading, setLoading] = useState(false);
  const [uploadingFields, setUploadingFields] = useState({});

  const [formFields, setFormFields] = useState([]);
  const [formTitle, setFormTitle] = useState(isEditMode ? 'Edit Employee' : 'Create Employee');

  // Switch states
  const [enableAdvanceSettings, setEnableAdvanceSettings] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [isMobileFocused, setIsMobileFocused] = useState(false);

  const maxDobDate = React.useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    return d.toISOString().split('T')[0];
  }, []);

  // Form field states
  const [formData, setFormData] = useState({
    // Basic Details
    name: '',
    identity: '',
    loginId: '',
    mobileCountryCode: '+91',
    mobile: '',
    type: '',
    manager_id: '',
    license: '',
    password: '',
    thumbnail: null,
    image: null,

    // Tag Details
    state: '',
    region: '',
    branchTag: '',

    // Personal Details (Advance)
    enableAdvanceSettings: isEditMode,
    branch: '',
    gender: '',
    bloodGroup: '',
    label: '#6366f1',
    dateOfBirth: '',
    dateOfJoining: '',
    address: '',

    // Geo Fence Restriction (Advance)
    punchInGeoFence: [],
    punchOutGeoFence: [],
    entryAlertGeoFence: [],
    exitAlertGeoFence: [],
    // Additional Details (Advance)
    homeLocation: '',
  });

  // Customer Filters (Advance)
  const [customerFilters, setCustomerFilters] = useState([
    { tag: '', condition: '', tagValue: '' },
  ]);

  const populateEmployeeData = React.useCallback((emp) => {
    if (!emp) return;
    setEnableAdvanceSettings(true);
    setFormTitle('Edit Employee');

    const formattedDob = emp.dateOfBirth
      ? String(emp.dateOfBirth).split('T')[0]
      : (emp.date_of_birth ? String(emp.date_of_birth).split('T')[0] : '');

    const formattedDoj = emp.dateOfJoining
      ? String(emp.dateOfJoining).split('T')[0]
      : (emp.date_of_joining ? String(emp.date_of_joining).split('T')[0] : (emp.joining_date ? String(emp.joining_date).split('T')[0] : ''));

    const extractArray = (val) => {
      if (Array.isArray(val)) return val.map((x) => typeof x === 'object' ? (x.value ?? x.id ?? x.name) : x);
      if (val) return [val];
      return [];
    };

    const extractPrimitive = (val, altVal1, altVal2) => {
      const target = (val !== undefined && val !== null && val !== '') ? val : ((altVal1 !== undefined && altVal1 !== null && altVal1 !== '') ? altVal1 : altVal2);
      if (target === undefined || target === null) return '';
      if (typeof target === 'object') return target.value ?? target.id ?? target.name ?? target.title ?? '';
      return target;
    };

    const maxTime = emp.maxPunchInTime || emp.max_punch_in_time || emp.maxPunchIn || '09:30';
    const pwd = emp.password || '';
    if (pwd) {
      setEnablePassword(true);
    }

    setFormData((prev) => ({
      ...prev,
      name: emp.name || emp.employee_name || prev.name,
      identity: emp.identity || emp.employee_id || emp.id || prev.identity,
      loginId: emp.loginId || emp.login_id || emp.email || prev.loginId,
      mobileCountryCode: emp.mobileCountryCode || emp.country_code || emp.mobile_country_code || '+91',
      mobile: emp.mobile || emp.phone || emp.mobile_number || prev.mobile,
      type: extractPrimitive(emp.type, emp.role_id, emp.role),
      manager_id: extractPrimitive(emp.manager_id, emp.reportingManager, emp.reporting_manager),
      license: extractPrimitive(emp.license) || 'Full Access License',
      state: extractPrimitive(emp.state, emp.state_id, emp.employeeState),
      region: extractPrimitive(emp.region, emp.region_id, emp.employeeRegion),
      branchTag: extractPrimitive(emp.branchTag, emp.branch_id, emp.employeeBranch),
      branch: extractPrimitive(emp.branch, emp.branch_id),
      gender: extractPrimitive(emp.gender) || 'Male',
      bloodGroup: extractPrimitive(emp.bloodGroup, emp.blood_group) || 'O+',
      label: emp.label || emp.label_color || prev.label || '#6366f1',
      dateOfBirth: formattedDob || '1995-01-01',
      dateOfJoining: formattedDoj || new Date().toISOString().split('T')[0],
      address: emp.address || emp.locationAddress || emp.location || prev.address,
      punchInGeoFence: extractArray(emp.punchInGeoFence || emp.punchIn || emp.punch_in),
      punchOutGeoFence: extractArray(emp.punchOutGeoFence || emp.punchOut || emp.punch_out),
      entryAlertGeoFence: extractArray(emp.entryAlertGeoFence || emp.entryAlerts || emp.entry_alerts),
      exitAlertGeoFence: extractArray(emp.exitAlertGeoFence || emp.exitAlerts || emp.exit_alerts),
      homeLocation: extractPrimitive(emp.homeLocation, emp.work_location, emp.location),
      workingShift: extractPrimitive(emp.workingShift, emp.work_shift, emp.workingShifts) || 'General Shift (7 AM - 7 PM)',
      leaveProfile: extractPrimitive(emp.leaveProfile, emp.leave_profile, emp.leaveProfiles) || 'Standard Policy',
      thumbnail: emp.thumbnail || emp.image || prev.thumbnail,
      image: emp.image || emp.thumbnail || prev.image,
      password: pwd,
      enableAdvanceSettings: true,
      tracker: emp.tracker !== undefined ? Boolean(emp.tracker) : true,
      trackerWebsite: emp.trackerWebsite !== undefined ? Boolean(emp.trackerWebsite) : true,
      disableAutoPunchOut: emp.disableAutoPunchOut !== undefined ? Boolean(emp.disableAutoPunchOut) : false,
      maxPunchInTime: maxTime,
    }));

    if (Array.isArray(emp.customerFilters) && emp.customerFilters.length > 0) {
      setCustomerFilters(emp.customerFilters);
    } else if (Array.isArray(emp.customer_filters) && emp.customer_filters.length > 0) {
      setCustomerFilters(emp.customer_filters);
    } else if (Array.isArray(emp.filters) && emp.filters.length > 0) {
      setCustomerFilters(emp.filters);
    } else {
      const regName = extractPrimitive(emp.region, emp.region_id, emp.employeeRegion);
      setCustomerFilters([
        { tag: 'Region', condition: 'Equals', tagValue: regName ? String(regName) : 'Region 1' }
      ]);
    }
  }, []);

  useEffect(() => {
    const fetchFormFields = async () => {
      try {
        const res = await EmployeeRoute.getCreateEmployeeFormFields();
        if (res?.success && res?.data) {
          const data = res.data;
          if (data.fields && Array.isArray(data.fields)) {
            setFormFields(data.fields);
            setFormData((prev) => {
              const updated = { ...prev };
              data.fields.forEach((field) => {
                if (field.name && updated[field.name] === undefined) {
                  if (field.type === 'switch') {
                    updated[field.name] = false;
                  } else if (field.type === 'multiselect' || field.type === 'multi-select' || field.multiple || (field.name && field.name.endsWith('GeoFence'))) {
                    updated[field.name] = Array.isArray(prev[field.name]) ? prev[field.name] : [];
                  } else if (field.name === 'mobileCountryCode') {
                    updated[field.name] = '+91';
                  } else if (field.name === 'type') {
                    const roleOpts = field.options || [];
                    const defaultRole = roleOpts.find((r) => String(r.label || r.name).toLowerCase() === 'employee') || roleOpts[0];
                    updated[field.name] = defaultRole ? (defaultRole.value ?? defaultRole.id ?? 1) : 1;
                  } else {
                    updated[field.name] = '';
                  }
                }
              });
              return updated;
            });
          }
          if (data.title && !isEditMode) {
            setFormTitle(typeof data.title === 'object' ? (data.title.name || data.title.title || 'Create Employee') : data.title);
          }
        }
      } catch (err) {
        console.error('Failed to fetch employee form options', err);
      }
    };
    fetchFormFields();
  }, [isEditMode]);

  useEffect(() => {
    if (isEditMode) {
      setEnableAdvanceSettings(true);
      if (editEmployee) {
        populateEmployeeData(editEmployee);
      }
      const slug = editEmployee?.slug || editEmployee?.id;
      if (slug) {
        EmployeeRoute.getEmployeeBySlug(slug).then((res) => {
          if (res?.success && res?.data) {
            populateEmployeeData(res.data);
          }
        }).catch((err) => console.error("Error fetching employee details:", err));
      }
    }
  }, [isEditMode, editEmployee, populateEmployeeData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === 'checkbox' ? checked : value;

    if (name === 'mobile' && typeof newValue === 'string') {
      newValue = newValue.replace(/\D/g, '').slice(0, 15);
    }

    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: newValue,
      };
      if (name === 'state' && !value) {
        updated.region = '';
        updated.branchTag = '';
      }
      if (name === 'region' && !value) {
        updated.branchTag = '';
      }
      return updated;
    });
  };

  const handleFilterChange = (index, field, value) => {
    setCustomerFilters((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
      if (field === 'tag') {
        updated[index].tagValue = '';
      }
      return updated;
    });
  };

  const handleAddFilter = () => {
    const lastFilter = customerFilters[customerFilters.length - 1];
    if (lastFilter && (!lastFilter.tag?.trim() || !lastFilter.condition?.trim() || !lastFilter.tagValue?.trim())) {
      return;
    }
    setCustomerFilters((prev) => [...prev, { tag: '', condition: '', tagValue: '' }]);
  };

  const handleRemoveFilter = (index) => {
    setCustomerFilters((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.dateOfBirth) {
      const selectedDob = new Date(formData.dateOfBirth);
      const minAgeDob = new Date();
      minAgeDob.setFullYear(minAgeDob.getFullYear() - 18);
      if (selectedDob > minAgeDob) {
        alert('Date of Birth must be at least 18 years ago (Age 18+).');
        return;
      }
    }

    setLoading(true);

    const typeField = formFields.find((f) => f.name === 'type');
    const selectedTypeOpt = typeField?.options?.find(
      (o) => String(o.value ?? o.id) === String(formData.type) || String(o.label ?? o.name).toLowerCase() === String(formData.type).toLowerCase()
    );
    const resolvedTypeId = selectedTypeOpt
      ? Number(selectedTypeOpt.value ?? selectedTypeOpt.id)
      : (!isNaN(Number(formData.type)) && formData.type !== '' ? Number(formData.type) : 1);
    const resolvedDesignation = selectedTypeOpt
      ? String(selectedTypeOpt.label ?? selectedTypeOpt.name)
      : (typeof formData.type === 'string' && formData.type ? formData.type : 'Employee');

    let generatedEmail = (formData.email || formData.loginId || '').trim();
    if (generatedEmail.includes('@')) {
      generatedEmail = generatedEmail.replace(/\s+/g, '');
    } else if (generatedEmail) {
      const cleanLogin = generatedEmail.toLowerCase().replace(/[^a-z0-9._-]/g, '');
      generatedEmail = `${cleanLogin || 'emp' + Date.now()}@company.com`;
    } else {
      generatedEmail = `emp${Date.now()}@company.com`;
    }

    const rawMobile = (formData.mobile || '').replace(/[^\d+]/g, '');
    let validMobile = rawMobile.slice(0, 15);
    if (validMobile.length < 10) {
      validMobile = '9999999999';
    }

    const validPassword = (formData.password && formData.password.trim().length >= 6)
      ? formData.password.trim()
      : (isEditMode ? undefined : '123456');

    const mapGeofenceToIds = (fieldName, rawVal) => {
      if (!rawVal) return [];
      const list = Array.isArray(rawVal) ? rawVal : [rawVal];
      const targetField = formFields.find((f) => f.name === fieldName);
      const opts = targetField?.options || [];

      return list
        .map((item) => {
          if (item === null || item === undefined || item === '') return null;
          if (typeof item === 'object') {
            const val = item.value ?? item.id;
            return !isNaN(Number(val)) ? Number(val) : null;
          }
          const num = Number(item);
          if (!isNaN(num) && String(item).trim() !== '') {
            return num;
          }
          const matchedOpt = opts.find((o) => {
            const labelStr = typeof o === 'object' ? (o.label ?? o.name) : o;
            return String(labelStr).trim().toLowerCase() === String(item).trim().toLowerCase();
          });
          if (matchedOpt) {
            const matchedVal = typeof matchedOpt === 'object' ? (matchedOpt.value ?? matchedOpt.id) : matchedOpt;
            return !isNaN(Number(matchedVal)) ? Number(matchedVal) : null;
          }
          return null;
        })
        .filter((val) => val !== null && val !== undefined && !isNaN(val));
    };

    const payload = {
      name: formData.name,
      identity: formData.identity || `EMP-${Date.now().toString().slice(-4)}`,
      email: generatedEmail,
      loginId: generatedEmail,
      mobile: validMobile,
      mobileCountryCode: formData.mobileCountryCode || '+91',
      country_code: formData.mobileCountryCode || '+91',
      image: formData.thumbnail || formData.image || null,
      thumbnail: formData.thumbnail || formData.image || null,
      type: resolvedTypeId,
      role_id: resolvedTypeId,
      manager_id: (formData.manager_id !== '' && formData.manager_id !== null && formData.manager_id !== undefined && !isNaN(Number(formData.manager_id)))
        ? Number(formData.manager_id)
        : (formData.reportingManager && !isNaN(Number(formData.reportingManager)) ? Number(formData.reportingManager) : undefined),
      license: formData.license || 'Full Access License',
      password: validPassword,
      work_shift: formData.workingShift,
      status: 'Active',
      work_location: formData.homeLocation,
      emp_type: 'Full Time',
      location: formData.homeLocation,
      address: formData.address,
      date_of_birth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : new Date('1995-01-01'),
      date_of_joining: formData.dateOfJoining ? new Date(formData.dateOfJoining) : new Date(),
      gender: formData.gender || null,
      blood_group: formData.bloodGroup || null,
      label_color: formData.label || null,
      punchIn: mapGeofenceToIds('punchInGeoFence', formData.punchInGeoFence?.length ? formData.punchInGeoFence : formData.punchIn),
      punchOut: mapGeofenceToIds('punchOutGeoFence', formData.punchOutGeoFence?.length ? formData.punchOutGeoFence : formData.punchOut),
      entryAlerts: mapGeofenceToIds('entryAlertGeoFence', formData.entryAlertGeoFence?.length ? formData.entryAlertGeoFence : formData.entryAlerts),
      exitAlerts: mapGeofenceToIds('exitAlertGeoFence', formData.exitAlertGeoFence?.length ? formData.exitAlertGeoFence : formData.exitAlerts),
      state_id: formData.state && !isNaN(Number(formData.state)) ? Number(formData.state) : 1,
      region_id: formData.region && !isNaN(Number(formData.region)) ? Number(formData.region) : 1,
      branch_id: formData.branchTag && !isNaN(Number(formData.branchTag)) ? Number(formData.branchTag) : 1,
      tracker: Boolean(formData.tracker),
      trackerWebsite: Boolean(formData.trackerWebsite),
      disableAutoPunchOut: Boolean(formData.disableAutoPunchOut),
      maxPunchInTime: formData.maxPunchInTime || undefined,
      customerFilters: customerFilters,
    };

    try {
      let res;
      if (isEditMode) {
        const slug = editEmployee?.slug || editEmployee?.id;
        res = await EmployeeRoute.updateEmployee({
          ...payload,
          slug,
        });
      } else {
        res = await EmployeeRoute.createEmployee(payload);
      }
      if (res?.success) {
        navigate('/employees');
      }
    } catch (err) {
      console.error(isEditMode ? 'Failed to update employee' : 'Failed to create employee', err);
    } finally {
      setLoading(false);
    }
  };

  // Common styling tokens
  const cardBg = isDark ? '#0f172a' : '#ffffff';
  const cardBorder = isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0';
  const labelColor = isDark ? '#94a3b8' : '#475569';
  const inputBg = isDark ? 'rgba(15, 23, 42, 0.6)' : '#ffffff';
  const textPrimary = isDark ? '#f8fafc' : '#0f172a';

  const inputStyle = {
    '& .MuiOutlinedInput-root': {
      color: textPrimary,
      backgroundColor: inputBg,
      borderRadius: '8px',
      fontSize: '0.9rem',
      '& fieldset': { borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : '#cbd5e1' },
      '&:hover fieldset': { borderColor: isDark ? '#6366f1' : '#0f172a' },
      '&.Mui-focused fieldset': { borderColor: isDark ? '#6366f1' : '#2563eb' },
    },
    '& .MuiInputLabel-root': { color: labelColor, fontSize: '0.85rem' },
    '& .MuiFormLabel-asterisk': { color: '#ef4444 !important' },
    '& .MuiInputLabel-asterisk': { color: '#ef4444 !important' },
  };

  // Section Header Component
  const SectionHeader = ({ title }) => (
    <Box className="flex items-center gap-2 mb-4">
      <Box className="w-1 h-5 bg-blue-600 rounded-full" />
      <Typography variant="subtitle1" className={`font-bold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
        {title}
      </Typography>
    </Box>
  );

  // Dynamic Field Renderer Function
  const renderDynamicField = (field) => {
    // Visibility checks based on switches and parent fields
    if (field.dependsOnSwitch === 'enableAdvanceSettings' && !enableAdvanceSettings) return null;
    if (field.dependsOnSwitch && field.dependsOnSwitch !== 'enableAdvanceSettings' && !formData[field.dependsOnSwitch]) return null;

    if (field.dependsOnField && !formData[field.dependsOnField]) return null;

    // Mobile combined input
    if (field.name === 'mobileCountryCode') {
      const opts = field.options && field.options.length > 0 ? field.options : allCountryCodeOptions;
      const isMobileRequired = field.required || formFields.find((f) => f.name === 'mobile')?.required;
      return (
        <Grid size={{ xs: 12, md: 4 }} key="mobile_combined">
          <Typography variant="body2" className={`mb-1 font-semibold ${labelColor}`}>
            Mobile{isMobileRequired && <span className="text-red-500 ml-0.5">*</span>}
          </Typography>
          <Box
            className="flex items-center w-full rounded-lg border transition-all overflow-hidden"
            sx={{
              height: '40px',
              backgroundColor: inputBg,
              borderColor: isMobileFocused
                ? (isDark ? '#6366f1' : '#2563eb')
                : (isDark ? 'rgba(255, 255, 255, 0.15)' : '#cbd5e1'),
              boxShadow: isMobileFocused
                ? `0 0 0 1px ${isDark ? '#6366f1' : '#2563eb'}`
                : 'none',
              '&:hover': {
                borderColor: isMobileFocused
                  ? (isDark ? '#6366f1' : '#2563eb')
                  : (isDark ? '#6366f1' : '#0f172a'),
              },
            }}
          >
            <CountryCodeSelect
              value={formData.mobileCountryCode || '+91'}
              onChange={(val) => setFormData((prev) => ({ ...prev, mobileCountryCode: val }))}
              options={opts}
              isDark={isDark}
              labelColor={labelColor}
              textPrimary={textPrimary}
            />
            <Box
              sx={{
                width: '1px',
                height: '22px',
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.2)' : '#cbd5e1',
                flexShrink: 0,
              }}
            />
            <TextField
              fullWidth
              size="small"
              name="mobile"
              value={formData.mobile || ''}
              onChange={handleChange}
              onFocus={() => setIsMobileFocused(true)}
              onBlur={() => setIsMobileFocused(false)}
              placeholder="Enter Mobile Number"
              slotProps={{
                htmlInput: {
                  maxLength: 15,
                  inputMode: 'numeric',
                  pattern: '[0-9]*',
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: textPrimary,
                  backgroundColor: 'transparent',
                  fontSize: '0.9rem',
                  '& fieldset': {
                    border: 'none',
                  },
                },
                '& .MuiInputBase-input': {
                  padding: '8.5px 12px',
                },
              }}
            />
          </Box>
        </Grid>
      );
    }

    if (field.name === 'mobile') {
      return null;
    }

    // Password input field
    if (field.name === 'password' || field.type === 'password') {
      return (
        <Grid size={{ xs: 12, md: 4 }} key={field.name}>
          <Typography variant="body2" className={`mb-1 font-semibold ${labelColor}`}>
            {field.label || 'Password'}{field.required && <span className="text-red-500 ml-0.5">*</span>}
          </Typography>
          <TextField
            fullWidth
            size="small"
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password || ''}
            onChange={handleChange}
            placeholder={field.placeholder || "Enter Password"}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((prev) => !prev)}
                      edge="end"
                      size="small"
                      sx={{ color: labelColor }}
                    >
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
            sx={inputStyle}
          />
        </Grid>
      );
    }

    // enableAdvanceSettings switch
    if (field.name === 'enableAdvanceSettings') {
      return (
        <Grid size={{ xs: 12 }} key={field.name}>
          <Box className="flex items-center gap-3">
            <Typography variant="body2" className={`font-semibold ${labelColor}`}>{field.label}</Typography>
            <Switch
              checked={enableAdvanceSettings}
              onChange={(e) => {
                const checked = e.target.checked;
                setEnableAdvanceSettings(checked);
                setFormData((prev) => ({ ...prev, enableAdvanceSettings: checked }));
              }}
              color="primary"
            />
          </Box>
        </Grid>
      );
    }

    // label color field
    if (field.name === 'label') {
      const colorValue = formData.label || '#6366f1';
      return (
        <Grid size={{ xs: 12, md: 4 }} key={field.name}>
          <Typography variant="body2" className={`mb-1 font-semibold ${labelColor}`}>
            {field.label}{field.required && <span className="text-red-500 ml-0.5">*</span>}
          </Typography>
          <Box
            className="flex items-center gap-2 rounded-lg border px-2"
            sx={{
              height: '40px',
              backgroundColor: inputBg,
              borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : '#cbd5e1',
              '&:hover': { borderColor: isDark ? '#6366f1' : '#0f172a' },
            }}
          >
            <Box sx={{ position: 'relative', width: 28, height: 28, flexShrink: 0 }}>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '6px',
                  backgroundColor: colorValue,
                  border: '2px solid rgba(255,255,255,0.3)',
                  boxShadow: `0 0 0 1px ${isDark ? 'rgba(255,255,255,0.2)' : '#cbd5e1'}, 0 2px 6px rgba(0,0,0,0.2)`,
                }}
              />
              <input
                type="color"
                value={colorValue}
                onChange={(e) => setFormData((prev) => ({ ...prev, label: e.target.value }))}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  opacity: 0,
                  cursor: 'pointer',
                  border: 'none',
                  padding: 0,
                }}
              />
            </Box>

            <input
              type="text"
              value={colorValue.toUpperCase()}
              onChange={(e) => {
                const v = e.target.value;
                if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) {
                  setFormData((prev) => ({ ...prev, label: v }));
                }
              }}
              style={{
                width: '80px',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: textPrimary,
                fontSize: '0.8rem',
                fontFamily: 'monospace',
                fontWeight: 600,
              }}
            />

            <Box sx={{ width: '1px', height: '22px', backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : '#e2e8f0', flexShrink: 0 }} />

            <Box className="flex items-center gap-1">
              {['#6366f1', '#ef4444', '#22c55e', '#f59e0b', '#3b82f6', '#ec4899', '#14b8a6', '#8b5cf6'].map((c) => (
                <Box
                  key={c}
                  onClick={() => setFormData((prev) => ({ ...prev, label: c }))}
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    backgroundColor: c,
                    cursor: 'pointer',
                    border: colorValue.toLowerCase() === c ? '2px solid white' : '1.5px solid rgba(0,0,0,0.1)',
                    boxShadow: colorValue.toLowerCase() === c ? `0 0 0 1.5px ${c}` : 'none',
                    transition: 'transform 0.12s, box-shadow 0.12s',
                    flexShrink: 0,
                    '&:hover': { transform: 'scale(1.25)' },
                  }}
                />
              ))}
            </Box>
          </Box>
        </Grid>
      );
    }

    // Generic switch field
    if (field.type === 'switch') {
      const isSwitchChecked = field.name === 'enableAdvanceSettings'
        ? enableAdvanceSettings
        : (field.name === 'enablePassword' ? enablePassword : Boolean(formData[field.name]));

      return (
        <Grid size={{ xs: 12, md: 4 }} key={field.name}>
          <Box className="flex items-center justify-between p-2 rounded-lg border border-slate-200 dark:border-slate-800" sx={{ height: '40px' }}>
            <Typography variant="body2" className={`font-semibold ${labelColor}`}>{field.label}</Typography>
            <Switch
              checked={isSwitchChecked}
              onChange={(e) => {
                const checked = e.target.checked;
                setFormData((prev) => ({ ...prev, [field.name]: checked }));
                if (field.name === 'enableAdvanceSettings') {
                  setEnableAdvanceSettings(checked);
                }
                if (field.name === 'enablePassword') {
                  setEnablePassword(checked);
                }
              }}
              color="primary"
            />
          </Box>
        </Grid>
      );
    }

    // multiselect field
    if (field.type === 'multiselect' || field.type === 'multi-select' || field.multiple || (field.name && field.name.endsWith('GeoFence'))) {
      const fieldLabelText = typeof field.label === 'object' ? (field.label.name || field.label.title || 'Options') : field.label;
      const opts = field.options || [];
      const rawVal = formData[field.name];
      const currentValues = Array.isArray(rawVal)
        ? rawVal.map((item) => (typeof item === 'object' && item !== null ? (item.value ?? item.id ?? item.name) : item))
        : (rawVal ? [typeof rawVal === 'object' ? (rawVal.value ?? rawVal.id ?? rawVal.name) : rawVal] : []);

      const handleMultiChange = (event) => {
        const { target: { value } } = event;
        const newValues = typeof value === 'string' ? value.split(',') : value;
        setFormData((prev) => ({
          ...prev,
          [field.name]: newValues,
        }));
      };

      return (
        <Grid size={{ xs: 12, md: 4 }} key={field.name}>
          <Typography variant="body2" className={`mb-1 font-semibold ${labelColor}`}>
            {fieldLabelText}{field.required && <span className="text-red-500 ml-0.5">*</span>}
          </Typography>
          <Select
            fullWidth
            multiple
            size="small"
            name={field.name}
            value={currentValues}
            onChange={handleMultiChange}
            displayEmpty
            renderValue={(selected) => {
              if (!selected || selected.length === 0) {
                return <em style={{ fontStyle: 'normal', opacity: 0.6 }}>Select {fieldLabelText}</em>;
              }
              return (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((rawItem, sIdx) => {
                    const val = typeof rawItem === 'object' && rawItem !== null ? (rawItem.value ?? rawItem.id ?? rawItem.name) : rawItem;
                    const matchedOpt = opts.find((o) => {
                      const v = typeof o === 'object' ? (o.value ?? o.id) : o;
                      const l = typeof o === 'object' ? (o.label ?? o.name) : o;
                      return String(v) === String(val) || String(l).toLowerCase() === String(val).toLowerCase();
                    });
                    const displayLabel = matchedOpt
                      ? (typeof matchedOpt === 'object' ? (matchedOpt.label ?? matchedOpt.name) : matchedOpt)
                      : (typeof rawItem === 'object' ? (rawItem.name ?? rawItem.label ?? val) : val);
                    return (
                      <Chip
                        key={String(val) || sIdx}
                        label={displayLabel}
                        size="small"
                        sx={{
                          height: '24px',
                          fontSize: '0.75rem',
                          backgroundColor: isDark ? 'rgba(99, 102, 241, 0.2)' : '#e0e7ff',
                          color: isDark ? '#818cf8' : '#3730a3',
                          borderColor: isDark ? 'rgba(99, 102, 241, 0.4)' : '#c7d2fe',
                        }}
                      />
                    );
                  })}
                </Box>
              );
            }}
            sx={{
              ...inputStyle,
              minHeight: '40px',
              '& .MuiSelect-select': {
                padding: '7px 12px',
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '4px',
              },
            }}
          >
            {opts.map((opt, optIdx) => {
              const optValue = typeof opt === 'object' ? (opt.value ?? opt.id ?? opt.name) : opt;
              const optLabel = typeof opt === 'object' ? (opt.label ?? opt.name) : opt;
              const isChecked = currentValues.some((v) => {
                const itemVal = typeof v === 'object' && v !== null ? (v.value ?? v.id ?? v.name) : v;
                return String(itemVal) === String(optValue) || String(itemVal) === String(optLabel);
              });
              return (
                <MenuItem key={typeof optValue === 'object' ? optIdx : optValue} value={optValue}>
                  <Checkbox checked={isChecked} size="small" />
                  <ListItemText primary={typeof optLabel === 'object' ? (optLabel.name || optLabel.label || String(optValue)) : optLabel} primaryTypographyProps={{ fontSize: '0.85rem' }} />
                </MenuItem>
              );
            })}
          </Select>
        </Grid>
      );
    }

    // single select field
    if (field.type === 'select') {
      const fieldLabelText = typeof field.label === 'object' ? (field.label.name || field.label.title || 'Option') : field.label;
      const opts = field.options || [];
      const rawVal = formData[field.name];

      let targetVal = rawVal;
      if (rawVal !== null && rawVal !== undefined && typeof rawVal === 'object') {
        targetVal = rawVal.value ?? rawVal.id ?? rawVal.name ?? rawVal.label;
      }

      const matchingOpt = opts.find((o) => {
        const val = typeof o === 'object' ? (o.value ?? o.id ?? o.slug ?? o.name) : o;
        const lbl = typeof o === 'object' ? (o.label ?? o.name ?? o.title ?? o.slug) : o;
        if (val === undefined || val === null) return false;
        if (targetVal === undefined || targetVal === null) return false;

        return (
          String(val) === String(targetVal) ||
          String(lbl).toLowerCase() === String(targetVal).toLowerCase()
        );
      });

      const selectedValue = matchingOpt
        ? (typeof matchingOpt === 'object' ? (matchingOpt.value ?? matchingOpt.id ?? matchingOpt.slug ?? matchingOpt.name) : matchingOpt)
        : (targetVal !== undefined && targetVal !== null ? targetVal : '');

      const isHalfWidth = field.name === 'workingShift' || field.name === 'leaveProfile';
      const gridColSize = isHalfWidth ? { xs: 12, md: 6 } : { xs: 12, md: 4 };

      return (
        <Grid size={gridColSize} key={field.name}>
          <Typography variant="body2" className={`mb-1 font-semibold ${labelColor}`}>
            {fieldLabelText}{field.required && <span className="text-red-500 ml-0.5">*</span>}
          </Typography>
          <TextField
            fullWidth
            select
            size="small"
            name={field.name}
            value={selectedValue ?? ''}
            onChange={handleChange}
            slotProps={{ select: { displayEmpty: true } }}
            required={field.required}
            sx={inputStyle}
          >
            <MenuItem value="">
              <em style={{ fontStyle: 'normal', opacity: 0.6 }}>Select {fieldLabelText}</em>
            </MenuItem>
            {opts.map((opt, optIdx) => {
              const optValue = typeof opt === 'object' ? (opt.value ?? opt.id ?? opt.slug ?? opt.name) : opt;
              const optLabel = typeof opt === 'object' ? (opt.label ?? opt.name ?? opt.title ?? opt.slug) : opt;
              return (
                <MenuItem
                  key={typeof optValue === 'object' ? optIdx : optValue}
                  value={optValue}
                >
                  {typeof optLabel === 'object' ? (optLabel.name || optLabel.label || String(optValue)) : optLabel}
                </MenuItem>
              );
            })}
          </TextField>
        </Grid>
      );
    }

    // google_map location field
    if (field.type === 'google_map' || field.name === 'homeLocation' || field.label === 'Home Location') {
      const locationVal = formData[field.name] || formData.homeLocation || '';
      return (
        <Grid size={{ xs: 12 }} key={field.name}>
          <Box className="flex items-center justify-between mb-1">
            <Typography variant="body2" className={`font-semibold ${labelColor}`}>
              {field.label}{field.required && <span className="text-red-500 ml-0.5">*</span>}
            </Typography>
          </Box>
          <TextField
            fullWidth
            multiline
            rows={3}
            size="small"
            name={field.name}
            value={locationVal}
            placeholder={field.placeholder || `Click + button to select location on map`}
            onClick={() => setMapModalOpen(true)}
            slotProps={{
              input: {
                readOnly: true,
                endAdornment: (
                  <InputAdornment position="end" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                    <Tooltip title="Open Map to Select Location">
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          setMapModalOpen(true);
                        }}
                        size="small"
                        sx={{
                          backgroundColor: isDark ? '#6366f1' : '#2563eb',
                          color: '#ffffff',
                          p: 1,
                          '&:hover': {
                            backgroundColor: isDark ? '#4f46e5' : '#1d4ed8',
                          },
                          boxShadow: '0 2px 6px rgba(37, 99, 235, 0.3)',
                        }}
                      >
                        <AddIcon fontSize="small" sx={{ color: '#ffffff', fontWeight: 'bold' }} />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              ...inputStyle,
              cursor: 'pointer',
              '& .MuiInputBase-root': {
                cursor: 'pointer',
              },
              '& .MuiInputBase-input': {
                cursor: 'pointer',
                color: textPrimary,
              },
            }}
          />
        </Grid>
      );
    }

    // file field
    if (field.type === 'file') {
      const filePreview = formData[field.name] || formData.image || formData.thumbnail;
      const isUploading = Boolean(uploadingFields[field.name] || uploadingFields.image || uploadingFields.thumbnail);

      const compressImageToMax50KB = (file, maxSizeBytes = 50 * 1024) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onerror = (err) => reject(err);
          reader.onload = (event) => {
            const img = new Image();
            img.onerror = (err) => reject(err);
            img.onload = () => {
              const canvas = document.createElement('canvas');
              let width = img.width;
              let height = img.height;

              const maxDimension = 800;
              if (width > maxDimension || height > maxDimension) {
                if (width > height) {
                  height = Math.round((height * maxDimension) / width);
                  width = maxDimension;
                } else {
                  width = Math.round((width * maxDimension) / height);
                  height = maxDimension;
                }
              }

              canvas.width = width;
              canvas.height = height;

              const ctx = canvas.getContext('2d');
              ctx.fillStyle = '#FFFFFF';
              ctx.fillRect(0, 0, width, height);
              ctx.drawImage(img, 0, 0, width, height);

              let quality = 0.8;
              let dataUrl = canvas.toDataURL('image/jpeg', quality);

              while (dataUrl.length * 0.75 > maxSizeBytes && quality > 0.1) {
                quality -= 0.08;
                dataUrl = canvas.toDataURL('image/jpeg', quality);
              }

              while (dataUrl.length * 0.75 > maxSizeBytes && width > 120 && height > 120) {
                width = Math.round(width * 0.8);
                height = Math.round(height * 0.8);
                canvas.width = width;
                canvas.height = height;
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, width, height);
                ctx.drawImage(img, 0, 0, width, height);
                dataUrl = canvas.toDataURL('image/jpeg', 0.5);
              }

              resolve(dataUrl);
            };
            img.src = event.target.result;
          };
          reader.readAsDataURL(file);
        });
      };

      const handleFileChange = async (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
          try {
            setUploadingFields((prev) => ({
              ...prev,
              [field.name]: true,
              image: true,
              thumbnail: true,
            }));

            const compressedBase64 = await compressImageToMax50KB(file, 50 * 1024);

            setFormData((prev) => ({
              ...prev,
              [field.name]: compressedBase64,
              image: compressedBase64,
              thumbnail: compressedBase64,
            }));

            const res = await UploadRoute.uploadImage(compressedBase64, "employee");
            if (res?.success && res?.data?.url) {
              const fullUrl = res.data.url;
              setFormData((prev) => ({
                ...prev,
                [field.name]: fullUrl,
                image: fullUrl,
                thumbnail: fullUrl,
              }));
            }
          } catch (err) {
            console.error("Failed to compress or upload image:", err);
          } finally {
            setUploadingFields((prev) => ({
              ...prev,
              [field.name]: false,
              image: false,
              thumbnail: false,
            }));
            if (e.target) e.target.value = '';
          }
        }
      };

      const handleRemoveFile = (e) => {
        e.stopPropagation();
        e.preventDefault();
        setFormData((prev) => ({
          ...prev,
          [field.name]: null,
          image: null,
          thumbnail: null,
        }));
      };

      return (
        <Grid size={{ xs: 12, lg: 3, xl: 2 }} key={field.name || 'image_field'}>
          <Typography variant="body2" className={`mb-1 font-semibold ${labelColor}`}>{field.label}</Typography>
          <Box
            component="label"
            className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer h-[180px] transition-colors relative overflow-hidden ${isDark ? 'border-slate-700 bg-slate-900/50 hover:border-indigo-500' : 'border-slate-300 bg-slate-50 hover:border-blue-500'
              }`}
          >
            <input
              type="file"
              hidden
              disabled={isUploading}
              accept="image/*"
              onChange={handleFileChange}
            />
            {filePreview ? (
              <Box className="relative w-full h-full flex flex-col items-center justify-center">
                <img
                  src={filePreview}
                  alt="Preview"
                  className="max-h-[120px] max-w-full object-contain rounded-lg shadow-sm"
                />
                {!isUploading && (
                  <IconButton
                    size="small"
                    onClick={handleRemoveFile}
                    sx={{
                      position: 'absolute',
                      top: 2,
                      right: 2,
                      backgroundColor: 'rgba(239, 68, 68, 0.9)',
                      color: '#ffffff',
                      '&:hover': { backgroundColor: '#dc2626' },
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                )}
                <Typography variant="caption" className={`mt-1 font-semibold ${isDark ? 'text-indigo-400' : 'text-blue-600'}`}>
                  {isUploading ? 'Uploading image...' : 'Change Image'}
                </Typography>
              </Box>
            ) : (
              <>
                <CloudUploadIcon sx={{ fontSize: 40, color: isDark ? '#818cf8' : '#3b82f6', mb: 1 }} />
                <Typography variant="caption" className={isDark ? 'text-slate-400 mb-2' : 'text-slate-600 mb-2'}>
                  Click or drag file here
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  component="span"
                  sx={{
                    backgroundColor: isDark ? '#3b82f6' : '#2563eb',
                    borderRadius: '6px',
                    textTransform: 'none',
                    fontSize: '0.75rem',
                    pointerEvents: 'none',
                  }}
                >
                  Choose File
                </Button>
              </>
            )}

            {isUploading && (
              <Box
                className="absolute inset-0 flex flex-col items-center justify-center rounded-xl z-30"
                sx={{
                  backgroundColor: isDark ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.85)',
                  backdropFilter: 'blur(3px)',
                }}
              >
                <CircularProgress size={36} thickness={4} sx={{ color: isDark ? '#818cf8' : '#2563eb', mb: 1 }} />
                <Typography variant="caption" className="font-bold text-xs" sx={{ color: isDark ? '#e2e8f0' : '#1e293b' }}>
                  Uploading image...
                </Typography>
              </Box>
            )}
          </Box>
        </Grid>
      );
    }

    // textarea field
    if (field.type === 'textarea') {
      return (
        <Grid size={{ xs: 12 }} key={field.name}>
          <Typography variant="body2" className={`mb-1 font-semibold ${labelColor}`}>
            {field.label}{field.required && <span className="text-red-500 ml-0.5">*</span>}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            size="small"
            name={field.name}
            value={formData[field.name] || ''}
            onChange={handleChange}
            placeholder={field.placeholder || `Enter ${field.label}`}
            required={field.required}
            sx={inputStyle}
          />
        </Grid>
      );
    }



    // default field renderer (text, date, time, number, email)
    return (
      <Grid size={{ xs: 12, md: 4 }} key={field.name}>
        <Typography variant="body2" className={`mb-1 font-semibold ${labelColor}`}>
          {field.label}{field.required && <span className="text-red-500 ml-0.5">*</span>}
        </Typography>
        <TextField
          fullWidth
          size="small"
          type={field.type === 'date' ? 'date' : field.type === 'time' ? 'time' : field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : 'text'}
          name={field.name}
          value={formData[field.name] || ''}
          onChange={handleChange}
          placeholder={field.placeholder || `Enter ${field.label}`}
          required={field.required}
          slotProps={{
            htmlInput: {
              ...(field.type === 'date' && (field.name === 'dateOfBirth' || field.name === 'date_of_birth') ? { max: maxDobDate } : {}),
            },
          }}
          sx={inputStyle}
        />
      </Grid>
    );
  };

  const sectionsList = React.useMemo(() => {
    if (formFields && formFields.length > 0) {
      const extracted = Array.from(new Set(formFields.map((f) => f.section).filter(Boolean)));
      if (extracted.length > 0) {
        return extracted;
      }
    }
    return [
      'Create Employee',
      'Tag Details',
      'Advance Settings',
      'Personal Details',
      'Geo Fence Restriction',
      'Additional Details',
    ];
  }, [formFields]);

  return (
    <Box className={`min-h-screen flex flex-col transition-colors duration-200 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* Top Navbar */}
      <Navbar user={user} logout={logout} />

      {/* Main Page Container - Full Width */}
      <Box className="flex-1 w-full px-4 sm:px-6 py-4">

        {/* Page Title Bar */}
        <Box className="flex items-center justify-between mb-6">
          <Box className="flex items-center gap-3">
            <IconButton
              onClick={() => navigate('/employees')}
              sx={{
                color: isDark ? '#94a3b8' : '#475569',
                backgroundColor: isDark ? 'rgba(30, 41, 59, 0.6)' : '#ffffff',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #cbd5e1',
                '&:hover': {
                  backgroundColor: isDark ? 'rgba(51, 65, 85, 0.8)' : '#f1f5f9',
                },
              }}
            >
              <ArrowBackIcon fontSize="small" />
            </IconButton>
            <Typography variant="h5" className={`font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-950'}`}>
              {typeof formTitle === 'object' ? (formTitle.name || formTitle.title || 'Create Employee') : formTitle}
            </Typography>
          </Box>

          <Box className="flex items-center gap-3">
            <Button
              variant="outlined"
              onClick={() => navigate('/employees')}
              sx={{
                borderColor: isDark ? 'rgba(255,255,255,0.2)' : '#cbd5e1',
                color: isDark ? '#cbd5e1' : '#475569',
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                '&:hover': {
                  borderColor: isDark ? '#ffffff' : '#0f172a',
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
                },
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
              sx={{
                background: isDark ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : '#0f172a',
                color: '#ffffff',
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 700,
                px: 3,
                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)',
                '&:hover': {
                  background: isDark ? 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)' : '#1e293b',
                },
              }}
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : 'Save Employee'}
            </Button>
          </Box>
        </Box>

        {/* Form Container */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            backgroundColor: cardBg,
            border: `1px solid ${cardBorder}`,
            borderRadius: '16px',
            boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.5)' : '0 4px 20px rgba(0,0,0,0.03)',
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {sectionsList.map((secName, idx) => {
              const secFields = formFields.filter((f) => f.section === secName);
              const isAdvanceSec = [
                'Personal Details',
                'Geo Fence Restriction',
                'Additional Details'
              ].includes(secName) || (secFields.length > 0 && secFields.every((f) => f.dependsOnSwitch === 'enableAdvanceSettings'));

              if (isAdvanceSec && !enableAdvanceSettings) return null;

              const isCustomerFiltersSection =
                secName === 'Filters' ||
                secName === 'Customer Filters' ||
                secFields.some((f) => f.type === 'customer_filters' || f.name === 'customerFilters');

              return (
                <React.Fragment key={secName}>
                  {idx > 0 && <hr className={`border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`} />}
                  <Box>
                    <SectionHeader title={secName} />
                    {isCustomerFiltersSection ? (() => {
                      const customerFilterField = formFields.find((f) => f.name === 'customerFilters' || f.type === 'customer_filters');
                      const tagOpts = customerFilterField?.options?.tags || [
                        { label: 'Region', value: 'Region' },
                        { label: 'Tier', value: 'Tier' },
                      ];
                      const conditionOpts = customerFilterField?.options?.conditions || [
                        { label: 'Equals', value: 'Equals' },
                        { label: 'Contains', value: 'Contains' },
                      ];

                      return (
                        <Box className="space-y-3">
                          {customerFilters.map((filter, fIdx) => (
                            <Grid container spacing={2} key={fIdx} sx={{ alignItems: 'center' }}>
                              <Grid size={{ xs: 12, md: 3.5 }}>
                                <Typography variant="body2" className={`mb-1 font-semibold ${labelColor}`}>Tag</Typography>
                                <TextField
                                  fullWidth
                                  select
                                  size="small"
                                  value={filter.tag}
                                  onChange={(e) => handleFilterChange(fIdx, 'tag', e.target.value)}
                                  slotProps={{ select: { displayEmpty: true } }}
                                  sx={inputStyle}
                                >
                                  <MenuItem value="">
                                    <em style={{ fontStyle: 'normal', opacity: 0.6 }}>Select Filter</em>
                                  </MenuItem>
                                  {tagOpts.map((tOpt, tIdx) => {
                                    const val = typeof tOpt === 'object' ? tOpt.value : tOpt;
                                    const lbl = typeof tOpt === 'object' ? tOpt.label : tOpt;
                                    return (
                                      <MenuItem key={val || tIdx} value={val}>
                                        {lbl}
                                      </MenuItem>
                                    );
                                  })}
                                </TextField>
                              </Grid>
                              <Grid size={{ xs: 12, md: 3.5 }}>
                                <Typography variant="body2" className={`mb-1 font-semibold ${labelColor}`}>Condition</Typography>
                                <TextField
                                  fullWidth
                                  select
                                  size="small"
                                  value={filter.condition}
                                  onChange={(e) => handleFilterChange(fIdx, 'condition', e.target.value)}
                                  slotProps={{ select: { displayEmpty: true } }}
                                  sx={inputStyle}
                                >
                                  <MenuItem value="">
                                    <em style={{ fontStyle: 'normal', opacity: 0.6 }}>Select Condition</em>
                                  </MenuItem>
                                  {conditionOpts.map((cOpt, cIdx) => {
                                    const val = typeof cOpt === 'object' ? cOpt.value : cOpt;
                                    const lbl = typeof cOpt === 'object' ? cOpt.label : cOpt;
                                    return (
                                      <MenuItem key={val || cIdx} value={val}>
                                        {lbl}
                                      </MenuItem>
                                    );
                                  })}
                                </TextField>
                              </Grid>
                              <Grid size={{ xs: 12, md: 3.5 }}>
                                <Typography variant="body2" className={`mb-1 font-semibold ${labelColor}`}>Tag Value</Typography>
                                {(() => {
                                  const tagValuesMap = customerFilterField?.options?.values || {};
                                  const tagValueOptions = filter.tag ? (tagValuesMap[filter.tag] || []) : [];

                                  if (tagValueOptions.length > 0) {
                                    return (
                                      <TextField
                                        fullWidth
                                        select
                                        size="small"
                                        value={filter.tagValue || ''}
                                        onChange={(e) => handleFilterChange(fIdx, 'tagValue', e.target.value)}
                                        slotProps={{ select: { displayEmpty: true } }}
                                        sx={inputStyle}
                                      >
                                        <MenuItem value="">
                                          <em style={{ fontStyle: 'normal', opacity: 0.6 }}>Select Value</em>
                                        </MenuItem>
                                        {tagValueOptions.map((vOpt, vIdx) => {
                                          const val = typeof vOpt === 'object' ? (vOpt.value ?? vOpt.name) : vOpt;
                                          const lbl = typeof vOpt === 'object' ? (vOpt.label ?? vOpt.name) : vOpt;
                                          return (
                                            <MenuItem key={val || vIdx} value={val}>
                                              {lbl}
                                            </MenuItem>
                                          );
                                        })}
                                      </TextField>
                                    );
                                  }

                                  return (
                                    <TextField
                                      fullWidth
                                      size="small"
                                      value={filter.tagValue || ''}
                                      onChange={(e) => handleFilterChange(fIdx, 'tagValue', e.target.value)}
                                      placeholder="Enter Tag Value"
                                      sx={inputStyle}
                                    />
                                  );
                                })()}
                              </Grid>
                              <Grid size={{ xs: 12, md: 1 }} className="pt-6 flex items-center">
                                {customerFilters.length > 1 && (
                                  <IconButton
                                    onClick={() => handleRemoveFilter(fIdx)}
                                    size="small"
                                    sx={{ color: '#ef4444' }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                )}
                              </Grid>
                            </Grid>
                          ))}
                          {(() => {
                            const lastFilter = customerFilters[customerFilters.length - 1];
                            const isAddMoreDisabled =
                              !lastFilter ||
                              !lastFilter.tag?.trim() ||
                              !lastFilter.condition?.trim() ||
                              !lastFilter.tagValue?.trim();
                            return (
                              <Button
                                startIcon={<AddIcon />}
                                onClick={handleAddFilter}
                                disabled={isAddMoreDisabled}
                                size="small"
                                sx={{
                                  textTransform: 'none',
                                  color: isDark ? '#818cf8' : '#2563eb',
                                  fontWeight: 600,
                                  mt: 1,
                                  '&.Mui-disabled': {
                                    color: isDark ? '#475569' : '#cbd5e1',
                                  },
                                }}
                              >
                                Add More
                              </Button>
                            );
                          })()}
                        </Box>
                      );
                    })() : (
                      <Grid container spacing={2.5}>
                        {secFields.map((field) => renderDynamicField(field))}
                      </Grid>
                    )}
                  </Box>
                </React.Fragment>
              );
            })}

            {/* Bottom Actions */}
            <Box className="flex justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
              <Button
                variant="outlined"
                onClick={() => navigate('/employees')}
                sx={{
                  borderColor: isDark ? 'rgba(255,255,255,0.2)' : '#cbd5e1',
                  color: isDark ? '#cbd5e1' : '#475569',
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 4,
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{
                  background: isDark ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : '#0f172a',
                  color: '#ffffff',
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 700,
                  px: 4,
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.2)',
                }}
              >
                {loading ? <CircularProgress size={20} color="inherit" /> : 'Save Employee'}
              </Button>
            </Box>

          </form>
        </Paper>
      </Box>

      {/* Google Map Location Selection Dialog Modal */}
      <Dialog
        open={mapModalOpen}
        onClose={() => setMapModalOpen(false)}
        fullWidth
        maxWidth="md"
        slotProps={{
          paper: {
            sx: {
              width: { xs: '95vw', sm: '850px', md: '880px' },
              maxWidth: '90vw',
              backgroundColor: isDark ? '#0f172a' : '#ffffff',
              color: textPrimary,
              borderRadius: '12px',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid #cbd5e1',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25)',
            },
          },
        }}
      >
        <DialogTitle sx={{ m: 0, p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box className="flex items-center gap-2">
            <LocationOnIcon className={isDark ? 'text-indigo-400' : 'text-blue-600'} sx={{ fontSize: 24 }} />
            <Typography variant="h6" component="div" className="font-bold">
              Select Home Location on Map
            </Typography>
          </Box>
          <IconButton
            onClick={() => setMapModalOpen(false)}
            sx={{
              color: isDark ? '#94a3b8' : '#64748b',
              '&:hover': { color: isDark ? '#f8fafc' : '#0f172a' },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0', p: 2.5 }}>
          <GoogleMap
            value={formData.homeLocation || ''}
            onChange={(loc) => setFormData((prev) => ({ ...prev, homeLocation: loc }))}
            label="Search & Pin Location"
            mapHeight="380px"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0' }}>
          <Button
            variant="contained"
            onClick={() => setMapModalOpen(false)}
            sx={{
              backgroundColor: isDark ? '#6366f1' : '#2563eb',
              '&:hover': { backgroundColor: isDark ? '#4f46e5' : '#1d4ed8' },
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              px: 4,
            }}
          >
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
