import React, { useState } from 'react';
import {
  TextField,
  Button,
  Switch,
  Typography,
  Box,
  Paper,
} from '@mui/material';
import { useThemeMode } from '../../contexts/ThemeContext';
import { toast } from 'react-toastify';

export default function OrganizationDetailsView() {
  const { isDark } = useThemeMode();

  const [formData, setFormData] = useState({
    organizationName: 'COGENTO VENTURES PVT LTD',
    companyName: 'COGENTO VENTURES PVT LTD',
    accountManager: 'Niraj (niraj@trackolap.com)',
    supportContact: 'care@trackolap.com',
    supportAccess: true,
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    toast.success('Organization details updated successfully!');
  };

  return (
    <div className={`p-6 rounded-xl border shadow-xs transition-colors ${
      isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
    }`}>
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
        <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Organization Details
        </h2>
      </div>

      <form onSubmit={handleUpdate} className="space-y-6 max-w-4xl">
        {/* Row 1: Organization Name & Company Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Organization Name<span className="text-red-500 ml-0.5">*</span>
            </label>
            <input
              type="text"
              value={formData.organizationName}
              onChange={(e) => handleChange('organizationName', e.target.value)}
              className={`w-full px-3 py-2 text-sm rounded-lg border transition-colors outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500'
                  : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>

          <div>
            <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Company Name<span className="text-red-500 ml-0.5">*</span>
            </label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => handleChange('companyName', e.target.value)}
              className={`w-full px-3 py-2 text-sm rounded-lg border transition-colors outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500'
                  : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>
        </div>

        {/* Row 2: Account Manager */}
        <div>
          <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            Account Manager
          </label>
          <input
            type="text"
            value={formData.accountManager}
            readOnly
            className={`w-full max-w-md px-3 py-2 text-sm rounded-lg border transition-colors outline-none cursor-not-allowed ${
              isDark
                ? 'bg-slate-800/60 border-slate-700 text-slate-400'
                : 'bg-slate-100 border-slate-200 text-slate-600'
            }`}
          />
        </div>

        {/* Row 3: Support Contact */}
        <div>
          <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            Support Contact
          </label>
          <input
            type="text"
            value={formData.supportContact}
            readOnly
            className={`w-full max-w-md px-3 py-2 text-sm rounded-lg border transition-colors outline-none cursor-not-allowed ${
              isDark
                ? 'bg-slate-800/60 border-slate-700 text-slate-400'
                : 'bg-slate-100 border-slate-200 text-slate-600'
            }`}
          />
        </div>

        {/* Row 4: Support Access Switch */}
        <div>
          <label className={`block text-xs font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            Support Access
          </label>
          <div className="flex items-center gap-3">
            <Switch
              checked={formData.supportAccess}
              onChange={(e) => handleChange('supportAccess', e.target.checked)}
              color="primary"
            />
            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {formData.supportAccess ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>

        {/* Row 5: Update Button */}
        <div className="pt-4">
          <button
            type="submit"
            className="px-6 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-lg transition-colors cursor-pointer shadow-2xs"
          >
            Update
          </button>
        </div>
      </form>
    </div>
  );
}
