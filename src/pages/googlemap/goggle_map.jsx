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
  CircularProgress,
  Stack,
  Chip,
} from '@mui/material';

import LocationOnIcon from '@mui/icons-material/LocationOn';
import SearchIcon from '@mui/icons-material/Search';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import MapIcon from '@mui/icons-material/Map';
import ClearIcon from '@mui/icons-material/Clear';
import NavigationIcon from '@mui/icons-material/Navigation';
import { useThemeMode } from '../../contexts/ThemeContext';
import { toast } from 'react-toastify';
import {
  loadGoogleMapsSDK,
  reverseGeocodeDetails,
  initInteractiveGoogleMap,
} from '../../utils/locationService';

export default function GoogleMap({
  value = '',
  onChange,
  label = 'Search & Pin Location on Google Maps',
  mapHeight = '380px',
  isMapHidden = false,
  userData,
  setUserData,
}) {
  const { isDark } = useThemeMode();

  // Support both prop patterns: (value, onChange) or (userData, setUserData)
  const initialAddress = userData?.name || userData?.address || value || '';
  const initialLat = userData?.latitude != null ? parseFloat(userData.latitude) : null;
  const initialLng = userData?.longitude != null ? parseFloat(userData.longitude) : null;

  const [searchQuery, setSearchQuery] = useState(initialAddress);
  const [activeLocation, setActiveLocation] = useState(initialAddress || 'India');
  const [activeCoords, setActiveCoords] = useState({
    lat: initialLat,
    lng: initialLng,
  });

  const [isMapExpanded, setIsMapExpanded] = useState(!isMapHidden);
  const [isLocating, setIsLocating] = useState(false);
  const [isGoogleSDKReady, setIsGoogleSDKReady] = useState(false);

  const containerRef = useRef(null);
  const mapCanvasRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const prevValueRef = useRef(value);

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

  // 1. Load Google Maps SDK
  useEffect(() => {
    let isMounted = true;
    loadGoogleMapsSDK().then((ready) => {
      if (isMounted) {
        setIsGoogleSDKReady(Boolean(ready && window.google?.maps));
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Synchronize external prop changes (userData or value)
  useEffect(() => {
    if (userData) {
      const uName = userData.name || userData.address || '';
      const uLat = userData.latitude != null ? parseFloat(userData.latitude) : null;
      const uLng = userData.longitude != null ? parseFloat(userData.longitude) : null;

      setSearchQuery(uName);
      if (uName) setActiveLocation(uName);
      if (uLat != null && uLng != null && !isNaN(uLat) && !isNaN(uLng)) {
        setActiveCoords({ lat: uLat, lng: uLng });
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setPosition(uLat, uLng, true);
        }
      }
      return;
    }

    if (value !== prevValueRef.current) {
      prevValueRef.current = value;
      setSearchQuery(value || '');
      setActiveLocation(value && value.trim() ? value : 'India');
      const parsedCoords = extractCoords(value);
      setActiveCoords(parsedCoords);
      if (parsedCoords.lat != null && parsedCoords.lng != null && mapInstanceRef.current) {
        mapInstanceRef.current.setPosition(parsedCoords.lat, parsedCoords.lng, true);
      }
    }
  }, [value, userData]);

  // Dispatch change updates to parent form (supporting both setUserData and onChange)
  const emitLocationUpdate = useCallback(
    (addressStr, details = null) => {
      const latVal = details?.lat != null ? Number(Number(details.lat).toFixed(6)) : activeCoords.lat;
      const lngVal = details?.lng != null ? Number(Number(details.lng).toFixed(6)) : activeCoords.lng;
      const fullName = addressStr || details?.formatted_address || details?.displayName || '';
      const shortName = details?.shortName || details?.name || fullName;

      if (typeof setUserData === 'function') {
        setUserData((prev) => ({
          ...prev,
          name: fullName,
          address: fullName,
          shortName: shortName,
          latitude: latVal != null ? latVal : prev?.latitude,
          longitude: lngVal != null ? lngVal : prev?.longitude,
          ...(details?.city ? { city: details.city } : {}),
          ...(details?.state ? { state: details.state } : {}),
          ...(details?.pincode ? { pincode: details.pincode } : {}),
        }));
      }

      if (typeof onChange === 'function') {
        onChange(fullName, {
          ...(details || {}),
          lat: latVal,
          lng: lngVal,
          latitude: latVal,
          longitude: lngVal,
          address: fullName,
          displayName: fullName,
          shortName,
        });
      }
    },
    [activeCoords.lat, activeCoords.lng, onChange, setUserData]
  );

  // 3. Mount Interactive Google Map Canvas
  useEffect(() => {
    if (!isGoogleSDKReady || !mapCanvasRef.current || !isMapExpanded) return;

    const lat = activeCoords.lat || (userData?.latitude ? parseFloat(userData.latitude) : 28.6139);
    const lng = activeCoords.lng || (userData?.longitude ? parseFloat(userData.longitude) : 77.2090);

    const instance = initInteractiveGoogleMap({
      container: mapCanvasRef.current,
      initialLat: lat,
      initialLng: lng,
      zoom: 14,
      draggableMarker: true,
      onLocationChange: (details) => {
        const newAddress = details.formatted_address || `${details.lat}, ${details.lng}`;
        setSearchQuery(newAddress);
        setActiveLocation(newAddress);
        setActiveCoords({ lat: details.lat, lng: details.lng });
        prevValueRef.current = newAddress;
        emitLocationUpdate(newAddress, details);
      },
    });

    mapInstanceRef.current = instance;

    return () => {
      if (instance) {
        instance.destroy();
      }
      mapInstanceRef.current = null;
    };
  }, [isGoogleSDKReady, isMapExpanded]);

  // 4. Attach Google Places Autocomplete (renders native .pac-container dropdown with "powered by Google")
  const setupGoogleAutocomplete = useCallback(
    (inputEl) => {
      if (!inputEl || typeof window === 'undefined' || !window.google?.maps?.places?.Autocomplete) {
        return;
      }
      if (autocompleteRef.current) return;

      try {
        const autocomplete = new window.google.maps.places.Autocomplete(inputEl, {
          fields: ['geometry', 'formatted_address', 'name', 'address_components'],
          componentRestrictions: { country: 'in' },
        });

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (!place || !place.geometry?.location) return;

          const lat = Number(place.geometry.location.lat().toFixed(6));
          const lng = Number(place.geometry.location.lng().toFixed(6));
          const fullName = place.formatted_address || place.name || '';
          let shortName = place.name || '';
          if (place.address_components?.length) {
            shortName = place.address_components[0]?.short_name || shortName;
          }

          setSearchQuery(fullName);
          setActiveLocation(fullName);
          setActiveCoords({ lat, lng });
          prevValueRef.current = fullName;

          if (mapInstanceRef.current) {
            mapInstanceRef.current.setPosition(lat, lng, true);
          }

          emitLocationUpdate(fullName, {
            ...place,
            lat,
            lng,
            latitude: lat,
            longitude: lng,
            address: fullName,
            formatted_address: fullName,
            shortName,
            name: fullName,
          });
        });

        autocompleteRef.current = autocomplete;
      } catch (err) {
        console.warn('Google Places Autocomplete initialization error:', err);
      }
    },
    [emitLocationUpdate]
  );

  useEffect(() => {
    if (isGoogleSDKReady && inputRef.current) {
      setupGoogleAutocomplete(inputRef.current);
    }
  }, [isGoogleSDKReady, setupGoogleAutocomplete]);

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      // Prevent form submit if navigating Google autocomplete items
      const pacSelected = document.querySelector('.pac-item-selected');
      const pacVisible = document.querySelector('.pac-container:not([style*="display: none"])');
      if (pacSelected || pacVisible) {
        e.preventDefault();
      }
    }
  };

  const handleSearchSubmit = async (e) => {
    if (e) e.preventDefault();
    const targetLoc = searchQuery.trim();
    if (!targetLoc) {
      handleClear();
      return;
    }

    const coords = extractCoords(targetLoc);
    if (coords.lat != null && coords.lng != null) {
      setActiveCoords(coords);
      setActiveLocation(targetLoc);
      prevValueRef.current = targetLoc;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setPosition(coords.lat, coords.lng, true);
      }
      const rev = await reverseGeocodeDetails(coords.lat, coords.lng);
      emitLocationUpdate(rev?.formatted_address || targetLoc, rev || coords);
      return;
    }

    setActiveLocation(targetLoc);
    prevValueRef.current = targetLoc;
    emitLocationUpdate(targetLoc);
  };

  const handleClear = () => {
    setSearchQuery('');
    setActiveLocation('India');
    setActiveCoords({ lat: null, lng: null });
    prevValueRef.current = '';
    emitLocationUpdate('', { lat: null, lng: null });
  };

  // GPS Current Location Detection
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
          const details = await reverseGeocodeDetails(lat, lng);
          const finalAddress = details?.formatted_address || `${lat}, ${lng}`;

          setSearchQuery(finalAddress);
          setActiveLocation(finalAddress);
          setActiveCoords({ lat, lng });
          prevValueRef.current = finalAddress;

          if (mapInstanceRef.current) {
            mapInstanceRef.current.setPosition(lat, lng, true);
          }

          emitLocationUpdate(finalAddress, details || { lat, lng });
          toast.success('Current location detected successfully!');
        } catch (err) {
          console.warn('Geolocation reverse error:', err);
          const fallback = `${lat}, ${lng}`;
          setSearchQuery(fallback);
          setActiveLocation(fallback);
          setActiveCoords({ lat, lng });
          prevValueRef.current = fallback;
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setPosition(lat, lng, true);
          }
          emitLocationUpdate(fallback, { lat, lng });
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

  return (
    <Box ref={containerRef} className="w-full space-y-3 relative">
      {/* Header & Map Toggle */}
      <Box className="flex items-center justify-between">
        <Typography variant="body2" className={`font-semibold ${labelColor}`}>
          {label}
        </Typography>

        <Box className="flex items-center gap-2">
          {activeCoords.lat != null && activeCoords.lng != null && (
            <Chip
              size="small"
              icon={<NavigationIcon sx={{ fontSize: '0.85rem !important' }} />}
              label={`${activeCoords.lat.toFixed(4)}, ${activeCoords.lng.toFixed(4)}`}
              variant="outlined"
              sx={{
                fontSize: '0.7rem',
                fontWeight: 600,
                color: isDark ? '#818cf8' : '#2563eb',
                borderColor: isDark ? 'rgba(129, 140, 248, 0.3)' : 'rgba(37, 99, 235, 0.3)',
              }}
            />
          )}

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
            {isMapExpanded ? 'Hide Map' : 'Show Map'}
          </Button>
        </Box>
      </Box>

      {/* Google Maps Location Search Field (Attached to Google Places Autocomplete) */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <TextField
          inputRef={(el) => {
            inputRef.current = el;
            if (isGoogleSDKReady && el) {
              setupGoogleAutocomplete(el);
            }
          }}
          fullWidth
          size="small"
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Search location on Google Maps (e.g. Kerala, Connaught Place)..."
          inputProps={{
            autoComplete: 'off',
            spellCheck: false,
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <LocationOnIcon className={isDark ? 'text-indigo-400' : 'text-blue-600'} fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end" className="flex items-center gap-1">
                  {isLocating && <CircularProgress size={16} color="inherit" />}
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
            {/* Interactive Canvas when Google Maps JS API is available */}
            {isGoogleSDKReady ? (
              <Box ref={mapCanvasRef} sx={{ width: '100%', height: '100%' }} />
            ) : (
              <iframe
                key={getMapEmbedUrl()}
                title="Google Map Location Search Preview"
                width="100%"
                height="100%"
                style={{ border: 0, filter: isDark ? 'invert(90%) hue-rotate(180deg)' : 'none' }}
                loading="lazy"
                allowFullScreen
                src={getMapEmbedUrl()}
              />
            )}

            {/* Draggable pin hint overlay */}
            {isGoogleSDKReady && (
              <Box
                className={`absolute top-2 right-2 px-2.5 py-1 rounded-md text-[11px] font-medium border backdrop-blur-md z-10 pointer-events-none ${
                  isDark
                    ? 'bg-slate-900/85 border-slate-700 text-slate-300'
                    : 'bg-white/85 border-slate-200 text-slate-700 shadow-xs'
                }`}
              >
                📍 Drag marker or click map to pinpoint location
              </Box>
            )}

            {/* Active Location Overlay Badge */}
            <Box
              className={`absolute bottom-3 left-3 px-3 py-1.5 rounded-lg border flex items-center gap-2 max-w-[90%] backdrop-blur-md z-10 ${
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

      {/* Latitude & Longitude inputs / readouts */}
      {userData && (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} className="pt-1">
          <TextField
            label="Latitude"
            size="small"
            disabled
            value={userData.latitude ?? activeCoords.lat ?? ''}
            fullWidth
            sx={inputStyle}
          />
          <TextField
            label="Longitude"
            size="small"
            disabled
            value={userData.longitude ?? activeCoords.lng ?? ''}
            fullWidth
            sx={inputStyle}
          />
        </Stack>
      )}
    </Box>
  );
}

// Named alias matching user snippet
export { GoogleMap as GoogleMapLocation };
