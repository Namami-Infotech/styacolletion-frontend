import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Paper,
  Tooltip,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Button,
} from '@mui/material';

import LocationOnIcon from '@mui/icons-material/LocationOn';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import MapIcon from '@mui/icons-material/Map';
import ClearIcon from '@mui/icons-material/Clear';
import PlaceIcon from '@mui/icons-material/Place';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import SearchIcon from '@mui/icons-material/Search';
import { useThemeMode } from '../../../contexts/ThemeContext';
import { toast } from 'react-toastify';
import {
  loadGoogleMapsSDK,
  fetchPlaceSuggestions,
  getGooglePlaceDetails,
  reverseGeocodeCoords,
} from '../../../utils/locationService';

export default function OfficeLocationPicker({
  address = '',
  latitude = '',
  longitude = '',
  onLocationSelect,
}) {
  const { isDark } = useThemeMode();
  const [searchQuery, setSearchQuery] = useState(address || '');
  const [activeCoords, setActiveCoords] = useState({
    lat: latitude !== '' && latitude !== null && !isNaN(latitude) ? parseFloat(latitude) : null,
    lng: longitude !== '' && longitude !== null && !isNaN(longitude) ? parseFloat(longitude) : null,
    address: address || '',
  });

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [showMap, setShowMap] = useState(true);
  const containerRef = useRef(null);

  useEffect(() => {
    loadGoogleMapsSDK();
  }, []);

  useEffect(() => {
    setSearchQuery(address || '');
    if (latitude !== '' && longitude !== '' && latitude != null && longitude != null) {
      setActiveCoords({
        lat: parseFloat(latitude),
        lng: parseFloat(longitude),
        address: address || '',
      });
    }
  }, [address, latitude, longitude]);

  // Real-time Place Search API
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

  // Click outside to hide suggestions
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectPlace = async (place) => {
    setShowSuggestions(false);
    if (!place) return;

    if (place.isGooglePlace && place.placeId) {
      setLoadingSearch(true);
      try {
        const details = await getGooglePlaceDetails(place.placeId);
        if (details) {
          const selectedAddress = details.displayName || place.displayName;
          const selectedLat = details.lat != null ? Number(details.lat.toFixed(6)) : '';
          const selectedLng = details.lng != null ? Number(details.lng.toFixed(6)) : '';

          setSearchQuery(selectedAddress);
          setActiveCoords({
            lat: selectedLat !== '' ? selectedLat : null,
            lng: selectedLng !== '' ? selectedLng : null,
            address: selectedAddress,
          });

          if (onLocationSelect) {
            onLocationSelect({
              address: selectedAddress,
              latitude: selectedLat,
              longitude: selectedLng,
            });
          }
          return;
        }
      } finally {
        setLoadingSearch(false);
      }
    }

    const selectedAddress = place.displayName || place.shortName;
    const selectedLat = place.lat != null ? Number(place.lat.toFixed(6)) : '';
    const selectedLng = place.lng != null ? Number(place.lng.toFixed(6)) : '';

    setSearchQuery(selectedAddress);
    setActiveCoords({
      lat: selectedLat !== '' ? selectedLat : null,
      lng: selectedLng !== '' ? selectedLng : null,
      address: selectedAddress,
    });

    if (onLocationSelect) {
      onLocationSelect({
        address: selectedAddress,
        latitude: selectedLat,
        longitude: selectedLng,
      });
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

    setActiveCoords({
      lat: null,
      lng: null,
      address: targetLoc,
    });
    if (onLocationSelect) {
      onLocationSelect({
        address: targetLoc,
        latitude: '',
        longitude: '',
      });
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
          setActiveCoords({ lat, lng, address: finalAddress });
          setShowSuggestions(false);

          if (onLocationSelect) {
            onLocationSelect({
              address: finalAddress,
              latitude: lat,
              longitude: lng,
            });
          }
          toast.success('Current location detected successfully!');
        } catch (err) {
          console.warn('Reverse geocode error:', err);
          const fallback = `${lat}, ${lng}`;
          setSearchQuery(fallback);
          setActiveCoords({ lat, lng, address: fallback });
          setShowSuggestions(false);
          if (onLocationSelect) {
            onLocationSelect({
              address: fallback,
              latitude: lat,
              longitude: lng,
            });
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
          msg = 'Location permission denied. Please enable location access in browser settings.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'GPS location unavailable.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Location request timed out. Please try again.';
        }
        toast.error(msg);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  const handleClear = () => {
    setSearchQuery('');
    setActiveCoords({ lat: null, lng: null, address: '' });
    setSuggestions([]);
    setShowSuggestions(false);
    if (onLocationSelect) {
      onLocationSelect({ address: '', latitude: '', longitude: '' });
    }
  };

  const mapQuery = activeCoords.lat != null && activeCoords.lng != null
    ? `${activeCoords.lat},${activeCoords.lng}`
    : (searchQuery || 'India');

  const mapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&t=&z=16&ie=UTF8&iwloc=&output=embed`;

  return (
    <Box ref={containerRef} className="w-full space-y-2 relative my-1">
      <Box className="flex items-center justify-between">
        <Typography variant="caption" className={`font-bold text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          Search Google Map Location
        </Typography>

        <Button
          size="small"
          startIcon={<MapIcon fontSize="small" />}
          onClick={() => setShowMap((prev) => !prev)}
          sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 600 }}
        >
          {showMap ? 'Hide Map' : 'Show Map'}
        </Button>
      </Box>

      {/* Location Search Input */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <TextField
          fullWidth
          size="small"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Search location on Google Map (e.g. Connaught Place, Noida)..."
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
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  )}
                  <Tooltip title="Use Current GPS Location">
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
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '10px',
              backgroundColor: isDark ? 'rgba(15, 23, 42, 0.6)' : '#ffffff',
              color: isDark ? '#ffffff' : '#0f172a',
              '& fieldset': { borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : '#cbd5e1' },
            },
          }}
        />

        {/* Live Search Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <Paper
            elevation={8}
            sx={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              mt: 0.5,
              zIndex: 9999,
              maxHeight: 220,
              overflowY: 'auto',
              backgroundColor: isDark ? '#0f172a' : '#ffffff',
              border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
              borderRadius: '10px',
            }}
          >
            <List size="small" disablePadding>
              {suggestions.map((item, index) => (
                <ListItemButton
                  key={index}
                  onClick={() => handleSelectPlace(item)}
                  sx={{
                    py: 1,
                    px: 1.5,
                    borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #f1f5f9',
                    backgroundColor: item.isDirectQuery
                      ? isDark
                        ? 'rgba(99, 102, 241, 0.15)'
                        : '#f0f9ff'
                      : 'transparent',
                    '&:hover': { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.2)' : '#e0f2fe' },
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
                    primary={
                      <Typography
                        variant="body2"
                        className={`font-semibold text-xs ${
                          item.isDirectQuery ? (isDark ? 'text-indigo-300' : 'text-sky-700') : ''
                        }`}
                      >
                        {item.shortName || item.displayName}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" className={`block truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {item.isDirectQuery ? 'Pin & navigate directly on Google Maps' : item.displayName}
                      </Typography>
                    }
                  />
                </ListItemButton>
              ))}
            </List>
          </Paper>
        )}
      </form>

      {/* Embedded Google Map Preview */}
      {showMap && (
        <div className="w-full h-44 rounded-xl overflow-hidden border shadow-sm relative mt-2">
          <iframe
            title="Office Google Map Location"
            width="100%"
            height="100%"
            frameBorder="0"
            scrolling="no"
            src={mapEmbedUrl}
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
          />
        </div>
      )}
    </Box>
  );
}
