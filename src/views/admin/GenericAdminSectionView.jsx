import React from 'react';
import { useThemeMode } from '../../contexts/ThemeContext';

export default function GenericAdminSectionView({ title, description, icon: IconComponent }) {
  const { isDark } = useThemeMode();

  return (
    <div className={`p-6 rounded-xl border shadow-xs transition-colors ${
      isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
    }`}>
      <div className="flex items-center gap-3 mb-6 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
        {IconComponent && <IconComponent className="text-blue-600 dark:text-blue-400" fontSize="medium" />}
        <div>
          <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</h2>
          {description && <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{description}</p>}
        </div>
      </div>

      <div className="space-y-6 max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Section Name<span className="text-red-500 ml-0.5">*</span>
            </label>
            <input
              type="text"
              defaultValue={title}
              className={`w-full px-3 py-2 text-sm rounded-lg border transition-colors outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500'
                  : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>

          <div>
            <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Configuration Status
            </label>
            <select
              className={`w-full px-3 py-2 text-sm rounded-lg border transition-colors outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-100'
                  : 'bg-white border-slate-300 text-slate-900'
              }`}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div>
          <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            Notes & Details
          </label>
          <textarea
            rows={4}
            placeholder={`Enter details for ${title}...`}
            className={`w-full px-3 py-2 text-sm rounded-lg border transition-colors outline-none focus:ring-2 focus:ring-blue-500 ${
              isDark
                ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500'
                : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
            }`}
          />
        </div>

        <div className="pt-4">
          <button
            type="button"
            className="px-6 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-lg transition-colors cursor-pointer shadow-2xs"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
