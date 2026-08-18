import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import { toast } from 'react-toastify';
import {
  loadGoogleMapsSDK,
  fetchPlaceSuggestions,
  getGooglePlaceDetails,
  reverseGeocodeCoords,
} from '../../utils/locationService';

export default function GoogleMap({ value = '', onChange, label = 'Home Location', mapHeight = '380px' }) {
  const { isDark } = useThemeMode();
  const [searchQuery, setSearchQuery] = useState(value || '');
  const [activeLocation, setActiveLocation] = useState(value || 'India');
  const [activeCoords, setActiveCoords] = useState({ lat: null, lng: null });
  const [isMapExpanded, setIsMapExpanded] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const containerRef = useRef(null);
  const prevValueRef = useRef(value);

  // Initialize Google SDK if API key available
  useEffect(() => {
    loadGoogleMapsSDK();
  }, []);

  // Parse coordinates from string if present
  const extractCoords = (str) => {
    if (!str) return { lat: null, lng: null };
    const match = str.match(/(-?\d+(\.\d+)?)\s*,\s*(-?\d+(\.\d+)?)/);
    if (match) {
      const lat = parseFloat(match[1]);
      const lng = parseFloat(match[3]);
      if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        return { lat, lng };
      }
    }
    return { lat: null, lng: null };
  };

  // Sync internal state when prop `value` changes
  useEffect(() => {
    if (value !== prevValueRef.current) {
      prevValueRef.current = value;
      setSearchQuery(value || '');
      setActiveLocation(value && value.trim() ? value : 'India');
      setActiveCoords(extractCoords(value));
    }
  }, [value]);

  // Real-time Place Search Suggestions
  useEffect(() => {
    const query = searchQuery.trim();
    if (!query || query.length < 2) {
      setSuggestions([]);
      setLoadingSearch(false);
      return;
    }

    let isMounted = true;
    const timer = setTimeout(async () => {
      setLoadingSearch(true);
      try {
        const list = await fetchPlaceSuggestions(query, activeCoords.lat ? activeCoords : null);
        if (isMounted) {
          setSuggestions(list);
        }
      } catch (err) {
        console.warn('Location search error:', err);
        if (isMounted) {
          setSuggestions([]);
        }
      } finally {
        if (isMounted) {
          setLoadingSearch(false);
        }
      }
    }, 250);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
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

  const handleSelectPlace = async (place) => {
    setShowSuggestions(false);
    if (!place) return;

    if (place.isGooglePlace && place.placeId) {
      setLoadingSearch(true);
      try {
        const details = await getGooglePlaceDetails(place.placeId);
        if (details) {
          const finalVal = details.displayName || place.displayName;
          setSearchQuery(finalVal);
          setActiveLocation(finalVal);
          setActiveCoords({ lat: details.lat, lng: details.lng });
          prevValueRef.current = finalVal;
          if (onChange) onChange(finalVal);
          return;
        }
      } finally {
        setLoadingSearch(false);
      }
    }

    const finalVal = typeof place === 'object' ? (place.displayName || place.shortName) : place;
    const lat = place && place.lat != null ? place.lat : null;
    const lng = place && place.lng != null ? place.lng : null;

    setSearchQuery(finalVal);
    setActiveLocation(finalVal);
    setActiveCoords({ lat, lng });
    prevValueRef.current = finalVal;
    if (onChange) {
      onChange(finalVal);
    }
  };

  const handleSearchSubmit = async (e) => {
    if (e) e.preventDefault();
    setShowSuggestions(false);
    const targetLoc = searchQuery.trim();
    if (!targetLoc) {
      handleClear();
      return;
    }

    // Check if coordinates were typed
    const coords = extractCoords(targetLoc);
    if (coords.lat != null && coords.lng != null) {
      setActiveCoords(coords);
      setActiveLocation(targetLoc);
      prevValueRef.current = targetLoc;
      if (onChange) onChange(targetLoc);
      return;
    }

    // Directly set user's typed search query to Google Maps iframe embed
    setActiveCoords({ lat: null, lng: null });
    setActiveLocation(targetLoc);
    prevValueRef.current = targetLoc;
    if (onChange) {
      onChange(targetLoc);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    setActiveLocation('India');
    setActiveCoords({ lat: null, lng: null });
    setSuggestions([]);
    setShowSuggestions(false);
    prevValueRef.current = '';
    if (onChange) {
      onChange('');
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = Number(position.coords.latitude.toFixed(6));
        const lng = Number(position.coords.longitude.toFixed(6));

        try {
          const resolvedAddress = await reverseGeocodeCoords(lat, lng);
          const finalAddress = resolvedAddress || `${lat}, ${lng}`;

          setSearchQuery(finalAddress);
          setActiveLocation(finalAddress);
          setActiveCoords({ lat, lng });
          setShowSuggestions(false);
          prevValueRef.current = finalAddress;

          if (onChange) {
            onChange(finalAddress);
          }
          toast.success('Current location detected successfully!');
        } catch (err) {
          console.warn('Geolocation reverse error:', err);
          const fallback = `${lat}, ${lng}`;
          setSearchQuery(fallback);
          setActiveLocation(fallback);
          setActiveCoords({ lat, lng });
          setShowSuggestions(false);
          prevValueRef.current = fallback;
          if (onChange) {
            onChange(fallback);
          }
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.warn('Geolocation failed:', error);
        setIsLocating(false);
        let msg = 'Unable to retrieve current location.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location permission denied. Please allow location access in your browser settings.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'GPS location is unavailable.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Location request timed out. Please try again.';
        }
        toast.error(msg);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
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

  // Google Maps Embed URL centered on precise coordinates or searched location
  const getMapEmbedUrl = () => {
    if (activeCoords.lat != null && activeCoords.lng != null) {
      return `https://maps.google.com/maps?q=${activeCoords.lat},${activeCoords.lng}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
    }

    const coordsFromText = extractCoords(activeLocation);
    if (coordsFromText.lat != null && coordsFromText.lng != null) {
      return `https://maps.google.com/maps?q=${coordsFromText.lat},${coordsFromText.lng}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
    }

    const isDefaultIndia = !activeLocation || activeLocation.trim().toLowerCase() === 'india';
    const mapZoom = isDefaultIndia ? 5 : 15;
    return `https://maps.google.com/maps?q=${encodeURIComponent(
      isDefaultIndia ? 'India' : activeLocation
    )}&t=&z=${mapZoom}&ie=UTF8&iwloc=&output=embed`;
  };

  const mapEmbedUrl = getMapEmbedUrl();

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
          placeholder="Search Google Maps places (e.g. kasia kushinagar, Connaught Place)..."
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <LocationOnIcon className={isDark ? 'text-indigo-400' : 'text-blue-600'} fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end" className="flex items-center gap-1">
                  {(loadingSearch || isLocating) && <CircularProgress size={16} color="inherit" />}
                  {searchQuery && (
                    <IconButton size="small" onClick={handleClear}>
                      <ClearIcon fontSize="small" className={isDark ? 'text-slate-400' : 'text-slate-500'} />
                    </IconButton>
                  )}
                  <Tooltip title="Detect Current GPS Location">
                    <span>
                      <IconButton size="small" onClick={handleUseCurrentLocation} disabled={isLocating}>
                        <MyLocationIcon fontSize="small" className={isDark ? 'text-indigo-400' : 'text-blue-600'} />
                      </IconButton>
                    </span>
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
                    backgroundColor: item.isDirectQuery
                      ? isDark
                        ? 'rgba(99, 102, 241, 0.15)'
                        : '#f0f9ff'
                      : 'transparent',
                    '&:hover': {
                      backgroundColor: isDark ? 'rgba(99, 102, 241, 0.25)' : '#e0f2fe',
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    {item.isDirectQuery ? (
                      <SearchIcon fontSize="small" sx={{ color: isDark ? '#818cf8' : '#0284c7' }} />
                    ) : (
                      <PlaceIcon fontSize="small" className={isDark ? 'text-indigo-400' : 'text-blue-600'} />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.shortName || item.displayName}
                    secondary={item.isDirectQuery ? 'Pin & navigate directly on Google Maps' : item.displayName}
                    primaryTypographyProps={{
                      fontSize: '0.85rem',
                      fontWeight: item.isDirectQuery ? 700 : 600,
                      color: item.isDirectQuery ? (isDark ? '#a5b4fc' : '#0369a1') : textPrimary,
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
              key={mapEmbedUrl}
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
