import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Paper,
  Tooltip,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CircularProgress,
} from '@mui/material';

import LocationOnIcon from '@mui/icons-material/LocationOn';
import SearchIcon from '@mui/icons-material/Search';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import MapIcon from '@mui/icons-material/Map';
import ClearIcon from '@mui/icons-material/Clear';
import PlaceIcon from '@mui/icons-material/Place';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import { useThemeMode } from '../../contexts/ThemeContext';

export default function GoogleMap({ value = '', onChange, label = 'Home Location', mapHeight = '380px' }) {
  const { isDark } = useThemeMode();
  const [searchQuery, setSearchQuery] = useState(value || '');
  const [activeLocation, setActiveLocation] = useState(value || 'India');
  const [isMapExpanded, setIsMapExpanded] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const containerRef = useRef(null);
  const prevValueRef = useRef(value);

  // Sync internal state ONLY when prop `value` changes from parent (e.g. modal open or external reset)
  useEffect(() => {
    if (value !== prevValueRef.current) {
      prevValueRef.current = value;
      setSearchQuery(value || '');
      setActiveLocation(value && value.trim() ? value : 'India');
    }
  }, [value]);

  // Real-time Place Search API (Photon Geocoding + Nominatim fallback + Guaranteed Custom search option)
  useEffect(() => {
    const query = searchQuery.trim();
    if (!query || query.length < 2) {
      setSuggestions([]);
      setLoadingSearch(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoadingSearch(true);
      try {
        let list = [];

        // 1. Try Photon Geocoding API (Fast, CORS-enabled, great for Indian places & villages)
        try {
          const photonRes = await fetch(
            `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=8&lang=en`
          );
          if (photonRes.ok) {
            const photonData = await photonRes.json();
            if (photonData?.features && photonData.features.length > 0) {
              list = photonData.features.map((feat) => {
                const props = feat.properties || {};
                const nameParts = [
                  props.name,
                  props.street,
                  props.district || props.city,
                  props.state,
                  props.country || 'India',
                ].filter(Boolean);
                const uniqueParts = Array.from(new Set(nameParts));
                const fullName = uniqueParts.join(', ');
                return {
                  displayName: fullName || query,
                  shortName: props.name || props.city || props.district || query,
                };
              });
            }
          }
        } catch (e) {
          console.warn('Photon API fetch error:', e);
        }

        // 2. Fallback to OpenStreetMap / Nominatim if Photon returned no items
        if (list.length === 0) {
          try {
            const nomRes = await fetch(
              `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                query
              )}&limit=8&addressdetails=1`
            );
            if (nomRes.ok) {
              const nomData = await nomRes.json();
              if (Array.isArray(nomData) && nomData.length > 0) {
                list = nomData.map((item) => ({
                  displayName: item.display_name,
                  shortName:
                    item.name ||
                    item.address?.city ||
                    item.address?.town ||
                    item.address?.suburb ||
                    item.display_name.split(',')[0],
                }));
              }
            }
          } catch (e) {
            console.warn('Nominatim API fetch error:', e);
          }
        }

        // 3. Guaranteed custom search item so dropdown is NEVER empty when user types!
        const exactMatchItem = {
          displayName: `Search "${query}" on Map`,
          shortName: query,
          isExactCustom: true,
        };

        setSuggestions([exactMatchItem, ...list]);
      } catch (err) {
        console.warn('Location search error:', err);
        setSuggestions([
          { displayName: `Search "${query}" on Map`, shortName: query, isExactCustom: true },
        ]);
      } finally {
        setLoadingSearch(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    setShowSuggestions(true);
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setShowSuggestions(false);
    const targetLoc = searchQuery.trim();
    if (targetLoc) {
      setActiveLocation(targetLoc);
      prevValueRef.current = targetLoc;
      if (onChange) {
        onChange(targetLoc);
      }
    } else {
      setActiveLocation('India');
      prevValueRef.current = '';
      if (onChange) {
        onChange('');
      }
    }
  };

  const handleSelectPlace = (place) => {
    const isCustom = typeof place === 'object' && place.isExactCustom;
    const finalVal = isCustom
      ? place.shortName
      : (typeof place === 'object' ? (place.displayName || place.shortName) : place);

    setSearchQuery(finalVal);
    setActiveLocation(finalVal);
    setShowSuggestions(false);
    prevValueRef.current = finalVal;
    if (onChange) {
      onChange(finalVal);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    setActiveLocation('India');
    setSuggestions([]);
    setShowSuggestions(false);
    prevValueRef.current = '';
    if (onChange) {
      onChange('');
    }
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latLngStr = `${position.coords.latitude.toFixed(5)}, ${position.coords.longitude.toFixed(5)}`;
          const locText = `Current Location (${latLngStr})`;
          setSearchQuery(locText);
          setActiveLocation(latLngStr);
          setShowSuggestions(false);
          prevValueRef.current = locText;
          if (onChange) {
            onChange(locText);
          }
        },
        (error) => {
          console.warn('Geolocation failed:', error);
          const fallback = 'New Delhi, India';
          setSearchQuery(fallback);
          setActiveLocation(fallback);
          setShowSuggestions(false);
          prevValueRef.current = fallback;
          if (onChange) {
            onChange(fallback);
          }
        }
      );
    }
  };

  const labelColor = isDark ? '#94a3b8' : '#475569';
  const cardBg = isDark ? '#0f172a' : '#ffffff';
  const cardBorder = isDark ? 'rgba(255, 255, 255, 0.15)' : '#cbd5e1';
  const inputBg = isDark ? 'rgba(15, 23, 42, 0.8)' : '#ffffff';
  const textPrimary = isDark ? '#f8fafc' : '#0f172a';

  const inputStyle = {
    '& .MuiOutlinedInput-root': {
      color: textPrimary,
      backgroundColor: inputBg,
      borderRadius: '8px',
      fontSize: '0.9rem',
      '& fieldset': { borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : '#cbd5e1' },
      '&:hover fieldset': { borderColor: isDark ? '#6366f1' : '#0f172a' },
      '&.Mui-focused fieldset': { borderColor: isDark ? '#6366f1' : '#2563eb' },
    },
  };

  // Google Maps Embed URL centered on searched location or coordinates
  const isDefaultIndia = !activeLocation || activeLocation.trim().toLowerCase() === 'india';
  const mapZoom = isDefaultIndia ? 5 : 14;
  const mapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
    isDefaultIndia ? 'India' : activeLocation
  )}&t=&z=${mapZoom}&ie=UTF8&iwloc=&output=embed`;

  return (
    <Box ref={containerRef} className="w-full space-y-3 relative">
      {/* Header & Map Toggle */}
      <Box className="flex items-center justify-between">
        <Typography variant="body2" className={`font-semibold ${labelColor}`}>
          {label}
        </Typography>

        <Button
          size="small"
          startIcon={<MapIcon fontSize="small" />}
          onClick={() => setIsMapExpanded((prev) => !prev)}
          sx={{
            textTransform: 'none',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: isDark ? '#818cf8' : '#2563eb',
          }}
        >
          {isMapExpanded ? 'Hide Map Preview' : 'Show Map Preview'}
        </Button>
      </Box>

      {/* Google Maps Location Search Field */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <TextField
          fullWidth
          size="small"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Search Google Maps places (e.g. sapaha kasia kushinagar, Connaught Place)..."
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <LocationOnIcon className={isDark ? 'text-indigo-400' : 'text-blue-600'} fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end" className="flex items-center gap-1">
                  {loadingSearch && <CircularProgress size={16} color="inherit" />}
                  {searchQuery && (
                    <IconButton size="small" onClick={handleClear}>
                      <ClearIcon fontSize="small" className={isDark ? 'text-slate-400' : 'text-slate-500'} />
                    </IconButton>
                  )}
                  <Tooltip title="Detect Current GPS Location">
                    <IconButton size="small" onClick={handleUseCurrentLocation}>
                      <MyLocationIcon fontSize="small" className={isDark ? 'text-indigo-400' : 'text-blue-600'} />
                    </IconButton>
                  </Tooltip>
                  <IconButton size="small" type="submit">
                    <SearchIcon fontSize="small" className={isDark ? 'text-slate-300' : 'text-slate-700'} />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
          sx={inputStyle}
        />

        {/* Live Real-Time Places Dropdown Suggestions */}
        {showSuggestions && searchQuery.trim().length >= 2 && suggestions.length > 0 && (
          <Paper
            elevation={8}
            sx={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              mt: 0.5,
              zIndex: 99999,
              maxHeight: 260,
              overflowY: 'auto',
              backgroundColor: cardBg,
              border: `1px solid ${cardBorder}`,
              borderRadius: '8px',
              boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.8)' : '0 8px 25px rgba(0,0,0,0.2)',
            }}
          >
            <List size="small" disablePadding>
              {suggestions.map((item, index) => (
                <ListItemButton
                  key={index}
                  onClick={() => handleSelectPlace(item)}
                  sx={{
                    py: 1.2,
                    px: 2,
                    borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #f1f5f9',
                    backgroundColor: item.isExactCustom
                      ? (isDark ? 'rgba(99, 102, 241, 0.12)' : '#f0f9ff')
                      : 'transparent',
                    '&:hover': {
                      backgroundColor: isDark ? 'rgba(99, 102, 241, 0.25)' : '#e0f2fe',
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    {item.isExactCustom ? (
                      <TravelExploreIcon fontSize="small" className={isDark ? 'text-indigo-400' : 'text-blue-600'} />
                    ) : (
                      <PlaceIcon fontSize="small" className={isDark ? 'text-indigo-400' : 'text-blue-600'} />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.isExactCustom ? item.displayName : (item.shortName || item.displayName)}
                    secondary={item.isExactCustom ? 'Click or press Enter to load on Google Map' : item.displayName}
                    primaryTypographyProps={{
                      fontSize: '0.85rem',
                      fontWeight: item.isExactCustom ? 700 : 600,
                      color: item.isExactCustom ? (isDark ? '#818cf8' : '#0284c7') : textPrimary,
                    }}
                    secondaryTypographyProps={{
                      fontSize: '0.75rem',
                      color: labelColor,
                      noWrap: true,
                    }}
                  />
                </ListItemButton>
              ))}
            </List>
          </Paper>
        )}
      </form>

      {/* Interactive Google Map Display */}
      {isMapExpanded && (
        <Paper
          elevation={0}
          sx={{
            overflow: 'hidden',
            borderRadius: '12px',
            border: `1px solid ${cardBorder}`,
            backgroundColor: cardBg,
            boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.4)' : '0 2px 10px rgba(0,0,0,0.05)',
          }}
        >
          <Box className="relative w-full" sx={{ height: mapHeight }}>
            <iframe
              key={activeLocation}
              title="Google Map Location Search Preview"
              width="100%"
              height="100%"
              style={{ border: 0, filter: isDark ? 'invert(90%) hue-rotate(180deg)' : 'none' }}
              loading="lazy"
              allowFullScreen
              src={mapEmbedUrl}
            />

            {/* Active Location Overlay Badge */}
            <Box
              className={`absolute bottom-3 left-3 px-3 py-1.5 rounded-lg border flex items-center gap-2 max-w-[90%] backdrop-blur-md ${
                isDark
                  ? 'bg-slate-900/90 border-slate-700 text-white'
                  : 'bg-white/90 border-slate-200 text-slate-900 shadow-md'
              }`}
            >
              <LocationOnIcon className="text-red-500 flex-shrink-0" fontSize="small" />
              <Typography variant="caption" className="font-bold truncate">
                {searchQuery || activeLocation}
              </Typography>
            </Box>
          </Box>
        </Paper>
      )}
    </Box>
  );
}
