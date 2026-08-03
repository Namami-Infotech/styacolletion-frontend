/**
 * Centralized modal styles for MUI dialog forms, inputs, and action buttons.
 */

export const getModalFieldStyle = (isDark) => ({
  '& .MuiOutlinedInput-root': {
    height: '40px',
    color: isDark ? '#fff' : '#0f172a',
    backgroundColor: isDark ? 'rgba(30, 41, 59, 0.6)' : '#ffffff',
    borderRadius: '10px',
    fontSize: '0.875rem',
    '& fieldset': { borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#cbd5e1' },
    '&:hover fieldset': { borderColor: isDark ? '#6366f1' : '#0f172a' },
    '&.Mui-focused fieldset': { borderColor: isDark ? '#6366f1' : '#0f172a' },
  },
  '& .MuiOutlinedInput-input': {
    padding: '8.5px 14px',
    fontSize: '0.875rem',
  },
  '& .MuiSelect-select': {
    padding: '8.5px 14px !important',
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.875rem',
  },
  '& .MuiInputLabel-root': {
    color: isDark ? '#94a3b8' : '#475569',
    fontSize: '0.875rem',
    top: '-4px',
  },
  '& .MuiInputLabel-shrink': {
    top: '0px',
  },
  '& .MuiInputLabel-root.Mui-focused': { color: isDark ? '#818cf8' : '#0f172a' },
  '& .MuiSvgIcon-root': { color: isDark ? '#94a3b8' : '#475569' },
  '& .MuiFormLabel-asterisk': { color: '#ef4444 !important' },
  '& .MuiInputLabel-asterisk': { color: '#ef4444 !important' },
});

export const getCancelButtonStyle = (isDark) => ({
  color: isDark ? '#94a3b8' : '#475569',
  borderColor: isDark ? 'rgba(255,255,255,0.15)' : '#cbd5e1',
  borderRadius: '8px',
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.8125rem',
  height: '36px',
  padding: '0 16px',
  '&:hover': {
    borderColor: isDark ? 'rgba(255,255,255,0.3)' : '#0f172a',
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
  },
});

export const getPrimaryButtonStyle = (isDark, gradientDark = 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', hoverDark = 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)', boxShadowDark = '0 6px 12px -2px rgba(99, 102, 241, 0.3)') => ({
  background: isDark ? gradientDark : '#0f172a',
  color: '#ffffff',
  borderRadius: '8px',
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.8125rem',
  height: '36px',
  padding: '0 20px',
  boxShadow: isDark ? boxShadowDark : '0 4px 10px rgba(15, 23, 42, 0.15)',
  '&:hover': {
    background: isDark ? hoverDark : '#1e293b',
  },
});
