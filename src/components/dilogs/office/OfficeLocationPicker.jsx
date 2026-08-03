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
import { useThemeMode } from '../../../contexts/ThemeContext';

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
  const [showMap, setShowMap] = useState(true);
  const containerRef = useRef(null);

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

  // Real-time Place Search API (Photon Geocoding + Nominatim)
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

        // 1. Try Photon Geocoding API
        try {
          const photonRes = await fetch(
            `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=7&lang=en`
          );
          if (photonRes.ok) {
            const photonData = await photonRes.json();
            if (photonData?.features?.length > 0) {
              list = photonData.features.map((feat) => {
                const props = feat.properties || {};
                const coords = feat.geometry?.coordinates || [];
                const lng = coords[0];
                const lat = coords[1];

                const nameParts = [
                  props.name,
                  props.street,
                  props.district || props.city,
                  props.state,
                  props.country || 'India',
                ].filter(Boolean);
                const fullName = Array.from(new Set(nameParts)).join(', ');

                return {
                  displayName: fullName || query,
                  shortName: props.name || props.city || query,
                  lat: lat,
                  lng: lng,
                };
              });
            }
          }
        } catch (e) {
          console.warn('Photon API fetch error:', e);
        }

        // 2. Nominatim fallback if list is empty
        if (list.length === 0) {
          try {
            const nomRes = await fetch(
              `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                query
              )}&limit=7&addressdetails=1`
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
                    item.display_name.split(',')[0],
                  lat: parseFloat(item.lat),
                  lng: parseFloat(item.lon),
                }));
              }
            }
          } catch (e) {
            console.warn('Nominatim API fetch error:', e);
          }
        }

        setSuggestions(list);
      } catch (err) {
        console.warn('Location search error:', err);
      } finally {
        setLoadingSearch(false);
      }
    }, 300);

    return () => clearTimeout(timer);
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

  const handleSelectPlace = (place) => {
    const selectedAddress = place.displayName || place.shortName;
    const selectedLat = place.lat != null ? Number(place.lat.toFixed(6)) : 0;
    const selectedLng = place.lng != null ? Number(place.lng.toFixed(6)) : 0;

    setSearchQuery(selectedAddress);
    setActiveCoords({
      lat: selectedLat,
      lng: selectedLng,
      address: selectedAddress,
    });
    setShowSuggestions(false);

    if (onLocationSelect) {
      onLocationSelect({
        address: selectedAddress,
        latitude: selectedLat,
        longitude: selectedLng,
      });
    }
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = Number(position.coords.latitude.toFixed(6));
          const lng = Number(position.coords.longitude.toFixed(6));
          let addressText = `Current Location (${lat}, ${lng})`;

          try {
            const nomRes = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            );
            if (nomRes.ok) {
              const data = await nomRes.json();
              if (data?.display_name) {
                addressText = data.display_name;
              }
            }
          } catch (e) {
            console.warn('Reverse geocode error:', e);
          }

          setSearchQuery(addressText);
          setActiveCoords({ lat, lng, address: addressText });
          setShowSuggestions(false);

          if (onLocationSelect) {
            onLocationSelect({
              address: addressText,
              latitude: lat,
              longitude: lng,
            });
          }
        },
        (error) => {
          console.warn('Geolocation failed:', error);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
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

  const mapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

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
      <div className="relative">
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
                  {loadingSearch && <CircularProgress size={16} color="inherit" />}
                  {searchQuery && (
                    <IconButton size="small" onClick={handleClear}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  )}
                  <Tooltip title="Use Current GPS Location">
                    <IconButton size="small" onClick={handleUseCurrentLocation}>
                      <MyLocationIcon fontSize="small" className={isDark ? 'text-indigo-400' : 'text-blue-600'} />
                    </IconButton>
                  </Tooltip>
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
                    '&:hover': { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.2)' : '#e0f2fe' },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <PlaceIcon fontSize="small" className={isDark ? 'text-indigo-400' : 'text-blue-600'} />
                  </ListItemIcon>
                  <ListItemText
                    primary={<Typography variant="body2" className="font-semibold text-xs">{item.shortName}</Typography>}
                    secondary={<Typography variant="caption" className={`block truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{item.displayName}</Typography>}
                  />
                </ListItemButton>
              ))}
            </List>
          </Paper>
        )}
      </div>

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
