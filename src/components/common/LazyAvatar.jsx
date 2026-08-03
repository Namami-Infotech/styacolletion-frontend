import React, { useState, memo } from 'react';
import { Avatar } from '@mui/material';

/**
 * Optimized LazyAvatar component for Table rows.
 * Features native lazy loading, error fallback to initials, and memoized rendering.
 */
const LazyAvatar = memo(function LazyAvatar({
  src,
  alt = '',
  name = '',
  size = 36,
  className = '',
  sx = {},
}) {
  const [imageError, setImageError] = useState(false);

  const getInitials = (str) => {
    if (!str) return '?';
    const parts = str.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return str.slice(0, 2).toUpperCase();
  };

  // Extract a consistent background color from name string
  const stringToColor = (string) => {
    if (!string) return '#64748b';
    let hash = 0;
    for (let i = 0; i < string.length; i++) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      '#6366f1', '#3b82f6', '#0ea5e9', '#06b6d4',
      '#10b981', '#84cc16', '#f59e0b', '#ec4899', '#8b5cf6'
    ];
    return colors[Math.abs(hash) % colors.length];
  };

  const initials = getInitials(name || alt);
  const bgColor = stringToColor(name || alt);

  if (!src || imageError) {
    return (
      <Avatar
        className={className}
        sx={{
          width: size,
          height: size,
          bgcolor: bgColor,
          fontSize: Math.max(12, Math.floor(size * 0.38)),
          fontWeight: 600,
          color: '#ffffff',
          boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
          ...sx,
        }}
      >
        {initials}
      </Avatar>
    );
  }

  return (
    <Avatar
      src={src}
      alt={alt || name}
      className={className}
      imgProps={{
        loading: 'lazy',
        onError: () => setImageError(true),
      }}
      sx={{
        width: size,
        height: size,
        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
        ...sx,
      }}
    />
  );
});

export default LazyAvatar;
