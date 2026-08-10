import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useThemeMode } from '../../contexts/ThemeContext';
import Navbar from '../../components/common/Navbar';
import { FieldVisitRoute } from '../../routes/field_visit/field_visit.js';
import { TaskRoute } from '../../routes/tasks/task.route.js';
import TaskTable from '../../views/tasks/employeeAllTaskTable.jsx';

// MUI Icons
import {
  IconButton,
  Tooltip,
  Avatar,
  Chip,
  Button,
  Popover,
} from '@mui/material';

import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PhoneIcon from '@mui/icons-material/Phone';
import BusinessIcon from '@mui/icons-material/Business';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SensorsIcon from '@mui/icons-material/Sensors';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import MapIcon from '@mui/icons-material/Map';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import NavigationIcon from '@mui/icons-material/Navigation';
import PersonPinCircleIcon from '@mui/icons-material/PersonPinCircle';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import NorthIcon from '@mui/icons-material/North';
import SouthIcon from '@mui/icons-material/South';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import ReplayIcon from '@mui/icons-material/Replay';
import PaymentIcon from '@mui/icons-material/Payment';
import DescriptionIcon from '@mui/icons-material/Description';
import RssFeedIcon from '@mui/icons-material/RssFeed';
import HistoryIcon from '@mui/icons-material/History';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';

const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const formatTimeHHMMSS = (isoString) => {
  if (!isoString) return '';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return '';
  return d.toTimeString().split(' ')[0];
};

const formatDurationBadge = (startIso, endIso) => {
  if (!startIso || !endIso) return '(00:00)';
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  if (isNaN(start) || isNaN(end)) return '(00:00)';

  const diffSec = Math.max(0, Math.floor((end - start) / 1000));
  const mins = Math.floor(diffSec / 60);
  const secs = diffSec % 60;

  if (mins >= 60) {
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `(${hrs} Hr ${remMins} Mins)`;
  } else if (mins > 0) {
    if (secs > 0) {
      return `(${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')})`;
    }
    return `(${mins} Minute${mins > 1 ? 's' : ''})`;
  } else {
    return `(00:${String(secs).padStart(2, '0')})`;
  }
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const formatDateDDMMYYYY = (date) => {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}-${m}-${y}`;
};

const filterUniquePoints = (points) => {
  if (!points || points.length === 0) return [];
  if (points.length <= 2) return points;

  const result = [];
  let anchor = points[0];
  result.push(anchor);

  // Stoppage Cluster Radius: 0.15 km (150 meters)
  // Collapses all GPS drift pings while stopped at the same location into a single point
  const CLUSTER_RADIUS_KM = 0.15;

  for (let i = 1; i < points.length; i++) {
    const curr = points[i];
    const distFromAnchor = calculateDistanceKm(anchor.lat, anchor.lng, curr.lat, curr.lng);

    // Only accept new point when employee has actually traveled > 150 meters away from previous anchor
    if (distFromAnchor >= CLUSTER_RADIUS_KM) {
      result.push(curr);
      anchor = curr;
    }
  }

  const lastPt = points[points.length - 1];
  const lastResultPt = result[result.length - 1];
  if (
    lastPt &&
    (Math.abs(lastResultPt.lat - lastPt.lat) > 0.0001 || Math.abs(lastResultPt.lng - lastPt.lng) > 0.0001)
  ) {
    result.push(lastPt);
  }

  return result;
};

const fetchRoadMatchedRoute = async (points) => {
  const uniquePoints = filterUniquePoints(points);
  if (!uniquePoints || uniquePoints.length < 2) {
    return points ? points.map((p) => [p.lat, p.lng]) : [];
  }

  try {
    // Chunk waypoints (max 35 per batch) to prevent OSRM URL truncation & ensure turn-by-turn road snapping
    const chunkSize = 35;
    const allRoadCoords = [];

    for (let i = 0; i < uniquePoints.length - 1; i += chunkSize - 1) {
      const chunk = uniquePoints.slice(i, i + chunkSize);
      if (chunk.length < 2) continue;

      const coordsString = chunk.map((p) => `${p.lng},${p.lat}`).join(';');

      // 1. OSRM Map Matching API (HMM map matching eliminates opposite-lane pings & double-line U-turns on divided highways)
      let res = await fetch(
        `https://router.project-osrm.org/match/v1/driving/${coordsString}?overview=full&geometries=geojson&gaps=ignore&tidy=true`
      );

      let data = await res.json();
      let coords = null;

      if (data?.code === 'Ok' && data?.matchings && data.matchings.length > 0) {
        coords = data.matchings.flatMap((m) => m.geometry?.coordinates || []);
      }

      // 2. Fallback to OSRM Route API if map matching is unavailable
      if (!coords || coords.length === 0) {
        res = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson&continue_straight=true`
        );
        data = await res.json();
        coords = data?.routes?.[0]?.geometry?.coordinates;
      }

      if (coords && coords.length > 0) {
        const latLngs = coords.map(([lng, lat]) => [lat, lng]);
        if (allRoadCoords.length > 0) {
          allRoadCoords.push(...latLngs.slice(1));
        } else {
          allRoadCoords.push(...latLngs);
        }
      } else {
        const directChunk = chunk.map((p) => [p.lat, p.lng]);
        if (allRoadCoords.length > 0) {
          allRoadCoords.push(...directChunk.slice(1));
        } else {
          allRoadCoords.push(...directChunk);
        }
      }
    }

    if (allRoadCoords.length > 0) {
      return allRoadCoords;
    }
  } catch (e) {
    console.warn('OSRM road route fetch error:', e);
  }

  return uniquePoints.map((p) => [p.lat, p.lng]);
};

const calculateBearing = (startLat, startLng, endLat, endLng) => {
  if (!startLat || !startLng || !endLat || !endLng) return 0;
  const dLng = ((endLng - startLng) * Math.PI) / 180;
  const lat1 = (startLat * Math.PI) / 180;
  const lat2 = (endLat * Math.PI) / 180;

  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  let brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
};

const createVehicleIcon = (L, heading = 0) => {
  return L.divIcon({
    className: 'custom-vehicle-pin',
    html: `<div style="position: relative; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 38px; height: 38px; background: rgba(2, 132, 199, 0.3); border-radius: 50%;"></div>
            <div style="width: 32px; height: 32px; background-color: #0284c7; border-radius: 50%; border: 2.5px solid #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; transform: rotate(${heading}deg); transition: transform 0.15s ease-out;">
              <svg style="width: 18px; height: 18px; fill: white;" viewBox="0 0 24 24">
                <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
              </svg>
            </div>
          </div>`,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
  });
};

function PlaybackView({ locationPoints, isDark, calendarDateLabel, totalDistanceKm, attendance }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const fullPolylineRef = useRef(null);
  const activePolylineRef = useRef(null);
  const playbackMarkerRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackIndex, setPlaybackIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [mapTileType, setMapTileType] = useState('street');
  const [dateMode, setDateMode] = useState('DateRange');
  const [speedLimit, setSpeedLimit] = useState(100);
  const [stoppageTime, setStoppageTime] = useState(30);

  const [progress, setProgress] = useState(0);
  const [roadMatchedPath, setRoadMatchedPath] = useState([]);
  const activeCasingRef = useRef(null);

  // Smooth 33 FPS playback animation timer advancing progress continuously
  useEffect(() => {
    if (!isPlaying || locationPoints.length <= 1) return;

    const maxProgress = Math.max(1, locationPoints.length - 1);
    const totalDurationSec = Math.max(12, locationPoints.length * 1.5);
    const intervalMs = 30; // ~33 FPS continuous animation
    const step = (maxProgress / (totalDurationSec * (1000 / intervalMs))) * playbackSpeed;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + step;
        if (next >= maxProgress) {
          return maxProgress;
        }
        return next;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed, locationPoints.length]);

  // Stop playback when progress reaches maximum
  useEffect(() => {
    const maxProgress = Math.max(1, locationPoints.length - 1);
    if (isPlaying && progress >= maxProgress) {
      setIsPlaying(false);
    }
  }, [progress, isPlaying, locationPoints.length]);

  // Leaflet map initialization for Playback View
  useEffect(() => {
    if (!mapContainerRef.current || !window.L) return;
    const L = window.L;

    activeCasingRef.current = null;
    activePolylineRef.current = null;
    playbackMarkerRef.current = null;
    fullPolylineRef.current = null;
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const defaultCenter = locationPoints.length > 0
      ? [locationPoints[0].lat, locationPoints[0].lng]
      : [28.5188453, 77.2833705];

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView(defaultCenter, 14);

    let tileUrl = 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';
    if (mapTileType === 'satellite') {
      tileUrl = 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}';
    }

    tileLayerRef.current = L.tileLayer(tileUrl, { maxZoom: 20 }).addTo(map);
    mapInstanceRef.current = map;

    if (locationPoints.length > 0) {
      const latLngs = locationPoints.map((p) => [p.lat, p.lng]);
      const firstLat = latLngs[0][0];
      const firstLng = latLngs[0][1];
      const allSame = latLngs.every(
        ([lat, lng]) => Math.abs(lat - firstLat) < 0.000001 && Math.abs(lng - firstLng) < 0.000001
      );

      if (!allSame) {
        // Faint background dashed trajectory line (unvisited path ahead)
        fullPolylineRef.current = L.polyline(latLngs, {
          color: '#94a3b8',
          weight: 2.5,
          opacity: 0.5,
          dashArray: '5, 6',
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(map);

        fetchRoadMatchedRoute(locationPoints).then((roadPath) => {
          if (roadPath && roadPath.length > 0) {
            setRoadMatchedPath(roadPath);
            if (fullPolylineRef.current && mapInstanceRef.current === map) {
              fullPolylineRef.current.setLatLngs(roadPath);
            }
          }
        });
      }

      // Green Start Pin A
      const startIcon = L.divIcon({
        className: 'custom-start-pin-a',
        html: `<div style="background-color: #10b981; color: white; width: 28px; height: 28px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 3px 8px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: bold;">A</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });
      L.marker(latLngs[0], { icon: startIcon }).bindPopup('<b>Start Point (A)</b>').addTo(map);

      // Red End Pin B (only if coordinates differ)
      if (latLngs.length > 1 && !allSame) {
        const endIcon = L.divIcon({
          className: 'custom-end-pin-b',
          html: `<div style="background-color: #ef4444; color: white; width: 28px; height: 28px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 3px 8px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: bold;">B</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });
        L.marker(latLngs[latLngs.length - 1], { icon: endIcon }).bindPopup('<b>End Point (B)</b>').addTo(map);
      }

      // Render Punch-In Office / Location Marker if available
      if (attendance?.clock_in_location || attendance?.punchInOffice) {
        const clockInCoords = parseLocationCoords(attendance.clock_in_location) ||
          parseLocationCoords(attendance.punchInOffice);
        if (clockInCoords) {
          const officeName = attendance.punchInOffice?.name || 'Punch In Office';
          const clockInTimeStr = attendance.clock_in
            ? new Date(attendance.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
            : '';
          const punchInIcon = L.divIcon({
            className: 'custom-punchin-pin',
            html: `<div style="background-color: #059669; color: white; padding: 4px 10px; border-radius: 14px; border: 2px solid #ffffff; box-shadow: 0 3px 8px rgba(0,0,0,0.4); font-size: 11px; font-weight: bold; white-space: nowrap; display: flex; align-items: center; gap: 4px;">
                     <span>🟢 Punch In: ${officeName}</span>
                   </div>`,
            iconAnchor: [40, 20],
          });
          L.marker([clockInCoords.lat, clockInCoords.lng], { icon: punchInIcon })
            .bindPopup(`<b>Punch In</b><br/>Office: ${officeName}<br/>Address: ${attendance.punchInOffice?.address || 'N/A'}<br/>Time: ${clockInTimeStr}`)
            .addTo(map);
        }
      }

      // Render Punch-Out Office / Location Marker if available
      if (attendance?.clock_out_location || attendance?.punchOutOffice) {
        const clockOutCoords = parseLocationCoords(attendance.clock_out_location) ||
          parseLocationCoords(attendance.punchOutOffice);
        if (clockOutCoords) {
          const officeName = attendance.punchOutOffice?.name || 'Punch Out Office';
          const clockOutTimeStr = attendance.clock_out
            ? new Date(attendance.clock_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
            : '';
          const punchOutIcon = L.divIcon({
            className: 'custom-punchout-pin',
            html: `<div style="background-color: #dc2626; color: white; padding: 4px 10px; border-radius: 14px; border: 2px solid #ffffff; box-shadow: 0 3px 8px rgba(0,0,0,0.4); font-size: 11px; font-weight: bold; white-space: nowrap; display: flex; align-items: center; gap: 4px;">
                     <span>🔴 Punch Out: ${officeName}</span>
                   </div>`,
            iconAnchor: [40, 20],
          });
          L.marker([clockOutCoords.lat, clockOutCoords.lng], { icon: punchOutIcon })
            .bindPopup(`<b>Punch Out</b><br/>Office: ${officeName}<br/>Address: ${attendance.punchOutOffice?.address || 'N/A'}<br/>Time: ${clockOutTimeStr}`)
            .addTo(map);
        }
      }

      // Render numbered stop markers along route (matching Trackwick design)
      if (locationPoints.length > 2) {
        const step = Math.max(1, Math.floor(locationPoints.length / 5));
        locationPoints.forEach((pt, i) => {
          if (i > 0 && i < locationPoints.length - 1 && i % step === 0) {
            const stopNum = Math.floor(i / step);
            const stopIcon = L.divIcon({
              className: 'custom-stop-pin',
              html: `<div style="background-color: #0284c7; color: white; width: 26px; height: 26px; border-radius: 50%; border: 2px solid #ffffff; box-shadow: 0 3px 6px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold;">${stopNum}</div>`,
              iconSize: [26, 26],
              iconAnchor: [13, 13],
            });
            L.marker([pt.lat, pt.lng], { icon: stopIcon })
              .bindPopup(`<b>Stop #${stopNum}</b><br/>Time: ${pt.time || 'N/A'}`)
              .addTo(map);
          }
        });
      }

      if (latLngs.length > 1) {
        const bounds = L.latLngBounds(latLngs);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16, animate: false });
      } else {
        map.setView(latLngs[0], 15, { animate: false });
      }
    }

    return () => {
      activeCasingRef.current = null;
      activePolylineRef.current = null;
      playbackMarkerRef.current = null;
      fullPolylineRef.current = null;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [locationPoints, mapTileType, attendance]);

  // Continuously render interpolated polyline & move vehicle icon smoothly on top of line tip
  useEffect(() => {
    if (!mapInstanceRef.current || locationPoints.length === 0) return;
    const L = window.L;
    if (!L) return;

    const map = mapInstanceRef.current;
    const coords = (roadMatchedPath && roadMatchedPath.length > 0)
      ? roadMatchedPath
      : locationPoints.map((p) => [p.lat, p.lng]);

    if (!coords || coords.length === 0) return;

    let currentLat = coords[0][0];
    let currentLng = coords[0][1];
    let activePts = [];
    let heading = 0;

    const maxProgress = Math.max(1, locationPoints.length - 1);
    const ratio = Math.max(0, Math.min(progress / maxProgress, 1));

    if (coords.length > 1) {
      const floatIndex = ratio * (coords.length - 1);
      const k = Math.min(coords.length - 2, Math.floor(floatIndex));
      const subRatio = floatIndex - k;

      const p1 = coords[k];
      const p2 = coords[k + 1];

      currentLat = p1[0] + subRatio * (p2[0] - p1[0]);
      currentLng = p1[1] + subRatio * (p2[1] - p1[1]);

      activePts = [...coords.slice(0, k + 1), [currentLat, currentLng]];
      heading = calculateBearing(p1[0], p1[1], p2[0], p2[1]);

      const locIdx = Math.min(locationPoints.length - 1, Math.floor(progress));
      if (locIdx !== playbackIndex) {
        setPlaybackIndex(locIdx);
      }
    } else {
      activePts = [[currentLat, currentLng]];
    }

    // 1. Draw/Update the active royal blue polyline (permanently & smoothly growing)
    if (activePts.length > 1) {
      if (!activeCasingRef.current || !map.hasLayer(activeCasingRef.current)) {
        activeCasingRef.current = L.polyline(activePts, {
          color: '#ffffff',
          weight: 6,
          opacity: 0.95,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(map);
      } else {
        activeCasingRef.current.setLatLngs(activePts);
      }

      if (!activePolylineRef.current || !map.hasLayer(activePolylineRef.current)) {
        activePolylineRef.current = L.polyline(activePts, {
          color: '#1d4ed8',
          weight: 3.5,
          opacity: 1,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(map);
      } else {
        activePolylineRef.current.setLatLngs(activePts);
      }
    } else {
      if (activeCasingRef.current) {
        try { map.removeLayer(activeCasingRef.current); } catch (e) {}
        activeCasingRef.current = null;
      }
      if (activePolylineRef.current) {
        try { map.removeLayer(activePolylineRef.current); } catch (e) {}
        activePolylineRef.current = null;
      }
    }

    // 2. Position marker directly on the tip of the line
    const latLng = [currentLat, currentLng];
    const vehicleIcon = createVehicleIcon(L, heading);

    if (!playbackMarkerRef.current || !map.hasLayer(playbackMarkerRef.current)) {
      playbackMarkerRef.current = L.marker(latLng, { icon: vehicleIcon, zIndexOffset: 1000 }).addTo(map);
    } else {
      playbackMarkerRef.current.setLatLng(latLng);
      playbackMarkerRef.current.setIcon(vehicleIcon);
    }

    if (playbackMarkerRef.current && playbackMarkerRef.current._icon) {
      playbackMarkerRef.current._icon.style.transition = 'none';
    }

    // 3. Auto-scroll / Pan map to follow vehicle marker so it never hides off-screen
    if (isPlaying && map) {
      const bounds = map.getBounds();
      const innerBounds = bounds.pad(-0.15); // 15% inner viewport safety margin
      if (!innerBounds.contains(latLng)) {
        map.panTo(latLng, { animate: true, duration: 0.25 });
      }
    }
  }, [progress, isPlaying, locationPoints, roadMatchedPath]);

  const currentSpeedKmH = useMemo(() => {
    if (!locationPoints || locationPoints.length < 2 || playbackIndex === 0) return 0;
    const p1 = locationPoints[playbackIndex - 1];
    const p2 = locationPoints[playbackIndex];
    if (!p1 || !p2) return 0;
    const distKm = calculateDistanceKm(p1.lat, p1.lng, p2.lat, p2.lng);
    if (!p1.addedAt || !p2.addedAt) return Math.min(60, +(distKm * 30).toFixed(2));
    const timeHours = (new Date(p2.addedAt) - new Date(p1.addedAt)) / (1000 * 3600);
    if (timeHours <= 0) return 0;
    const spd = distKm / timeHours;
    return isNaN(spd) ? 0 : Math.min(120, +spd.toFixed(2));
  }, [playbackIndex, locationPoints]);

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative h-full">
      {/* Map Area (Full Screen) */}
      <div className="flex-1 relative bg-slate-200 dark:bg-slate-900 h-full">
        {/* Leaflet Map Canvas */}
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Floating Speed & Timestamp Gauge (Matching Trackwick live screenshot) */}
        <div className="absolute bottom-20 right-4 z-[1000] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl font-mono text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 pointer-events-auto">
          <span className="text-sky-500 animate-pulse">⏱</span>
          <span>{currentSpeedKmH.toFixed(2)} KM/H</span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="text-slate-600 dark:text-slate-400">
            {locationPoints[playbackIndex]?.time || calendarDateLabel}
          </span>
        </div>

        {/* Floating Attendance Badge on Top Left of Map */}
        {attendance && (
          <div className="absolute top-4 left-4 z-[1000] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col gap-1.5 pointer-events-auto">
            <div className="flex items-center justify-between gap-3 text-xs font-bold text-slate-800 dark:text-slate-200">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Attendance Info</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-bold">
                {attendance.status || 'N/A'}
              </span>
            </div>

            <div className="flex flex-col gap-1 text-[11px]">
              <div className="flex items-center justify-between gap-4">
                <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                  🟢 Punch In:
                  <span className="font-mono text-slate-900 dark:text-white">
                    {attendance.clock_in ? new Date(attendance.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : '--:--'}
                  </span>
                </span>
                {attendance.punchInOffice?.name && (
                  <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[150px]" title={attendance.punchInOffice.name}>
                    🏢 {attendance.punchInOffice.name}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-rose-700 dark:text-rose-400 font-bold flex items-center gap-1">
                  🔴 Punch Out:
                  <span className="font-mono text-slate-900 dark:text-white">
                    {attendance.clock_out ? new Date(attendance.clock_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : '--:--'}
                  </span>
                </span>
                {attendance.punchOutOffice?.name && (
                  <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[150px]" title={attendance.punchOutOffice.name}>
                    🏢 {attendance.punchOutOffice.name}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Video Controls Overlay Bar at Bottom of Map (exact match to user screenshot) */}
        <div className="absolute bottom-4 left-4 right-4 z-[1000] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col gap-2 pointer-events-auto">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  const maxProgress = Math.max(1, locationPoints.length - 1);
                  if (!isPlaying && progress >= maxProgress) {
                    setProgress(0);
                    setPlaybackIndex(0);
                  }
                  setIsPlaying(!isPlaying);
                }}
                className="w-10 h-10 rounded-full bg-sky-600 hover:bg-sky-700 text-white flex items-center justify-center shadow-md font-bold cursor-pointer transition-transform active:scale-95 shrink-0"
              >
                {isPlaying ? <PauseIcon sx={{ fontSize: 22 }} /> : <PlayArrowIcon sx={{ fontSize: 22 }} />}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsPlaying(false);
                  setPlaybackIndex(0);
                  setProgress(0);
                  if (locationPoints.length > 0 && mapInstanceRef.current) {
                    mapInstanceRef.current.panTo([locationPoints[0].lat, locationPoints[0].lng]);
                  }
                }}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 cursor-pointer transition-colors"
                title="Restart Playback"
              >
                <ReplayIcon sx={{ fontSize: 20 }} />
              </button>

              <div className="flex flex-col">
                <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                  <span>GPS Video Playback</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-bold">
                    {playbackIndex + 1} / {locationPoints.length || 1}
                  </span>
                </span>
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 font-medium">
                  {locationPoints[playbackIndex]?.time || calendarDateLabel}
                  {locationPoints[playbackIndex] &&
                    ` • Lat: ${locationPoints[playbackIndex].lat.toFixed(5)}, Lng: ${locationPoints[playbackIndex].lng.toFixed(5)}`}
                </span>
              </div>
            </div>

            {/* Playback Speed Switcher */}
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-slate-400 font-medium mr-1 hidden sm:inline">Speed:</span>
              {[0.5, 1, 2, 5].map((spd) => (
                <button
                  key={spd}
                  type="button"
                  onClick={() => setPlaybackSpeed(spd)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                    playbackSpeed === spd
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>

          {/* Video Scrubber Range Slider */}
          {locationPoints.length > 0 && (
            <div className="flex items-center gap-3 pt-1">
              <span className="text-[10px] font-mono font-semibold text-slate-500 dark:text-slate-400">
                {locationPoints[0]?.time?.split(' ')[0] || 'Start'}
              </span>
              <input
                type="range"
                min={0}
                max={locationPoints.length - 1}
                value={playbackIndex}
                onChange={(e) => {
                  setIsPlaying(false);
                  const idx = Number(e.target.value);
                  setPlaybackIndex(idx);
                  setProgress(idx);
                  if (locationPoints[idx] && mapInstanceRef.current) {
                    mapInstanceRef.current.panTo([locationPoints[idx].lat, locationPoints[idx].lng]);
                  }
                }}
                className="flex-1 h-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-600 focus:outline-none"
              />
              <span className="text-[10px] font-mono font-semibold text-slate-500 dark:text-slate-400">
                {locationPoints[locationPoints.length - 1]?.time?.split(' ')[0] || 'End'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar Panel - Playback Filters & Stats (exact match to user screenshot) */}
      <div className={`w-full md:w-80 border-l ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} p-4 flex flex-col gap-4 overflow-y-auto shrink-0 shadow-lg z-10`}>
        {/* Card 1: Start-End Date Selection */}
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
            <span>Start-End Date*</span>
            <span className="text-[11px] text-slate-400 hover:underline cursor-pointer">Hide ▲</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-slate-700 dark:text-slate-300">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="dateMode"
                checked={dateMode === 'DateRange'}
                onChange={() => setDateMode('DateRange')}
                className="accent-sky-600"
              />
              <span>DateRange</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="dateMode"
                checked={dateMode === 'DateRangeTime'}
                onChange={() => setDateMode('DateRangeTime')}
                className="accent-sky-600"
              />
              <span>DateRangeTime</span>
            </label>
          </div>

          <input
            type="text"
            readOnly
            value={calendarDateLabel}
            className="w-full px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
          />

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="block text-[11px] text-slate-500 font-medium mb-1">Speed Limit*</label>
              <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-900">
                <input
                  type="number"
                  value={speedLimit}
                  onChange={(e) => setSpeedLimit(e.target.value)}
                  className="w-full px-2 py-1 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
                />
                <span className="px-2 text-[10px] text-slate-400 font-bold bg-slate-100 dark:bg-slate-800">Km</span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-slate-500 font-medium mb-1">Stoppage Time*</label>
              <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-900">
                <input
                  type="number"
                  value={stoppageTime}
                  onChange={(e) => setStoppageTime(e.target.value)}
                  className="w-full px-2 py-1 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
                />
                <span className="px-2 text-[10px] text-slate-400 font-bold bg-slate-100 dark:bg-slate-800">Min</span>
              </div>
            </div>
          </div>

          <Button
            variant="contained"
            fullWidth
            size="small"
            sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 'bold', backgroundColor: '#0284c7' }}
          >
            Apply
          </Button>
        </div>

        {/* Attendance Summary Card (Clock In / Clock Out) */}
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
            <span className="flex items-center gap-1.5">
              <span>⏰</span> Attendance Summary
            </span>
            {attendance?.status && (
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                attendance.status === 'CLOCKED_IN' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                attendance.status === 'PRESENT' || attendance.status === 'CLOCKED_OUT' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
              }`}>
                {attendance.status}
              </span>
            )}
          </div>

          {attendance ? (
            <div className="grid grid-cols-2 gap-2 text-xs">
              {/* Clock In */}
              <div className="p-2.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40">
                <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1">
                  Clock In
                </div>
                <div className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                  {attendance.clock_in ? new Date(attendance.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : '--:--'}
                </div>
                {attendance.punchInOffice?.name && (
                  <div className="text-[10px] text-emerald-800 dark:text-emerald-300 font-semibold truncate mt-0.5" title={attendance.punchInOffice.name}>
                    🏢 {attendance.punchInOffice.name}
                  </div>
                )}
                {attendance.clock_in_location && (
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-1 flex items-center gap-1">
                    <LocationOnIcon sx={{ fontSize: 12, color: '#10b981' }} />
                    <span className="truncate">
                      {typeof attendance.clock_in_location === 'object'
                        ? `${Number(attendance.clock_in_location.latitude || attendance.clock_in_location.lat).toFixed(4)}, ${Number(attendance.clock_in_location.longitude || attendance.clock_in_location.lng).toFixed(4)}`
                        : String(attendance.clock_in_location).slice(0, 20)}
                    </span>
                  </div>
                )}
              </div>

              {/* Clock Out */}
              <div className="p-2.5 rounded-lg bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-800/40">
                <div className="text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider mb-1">
                  Clock Out
                </div>
                <div className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                  {attendance.clock_out ? new Date(attendance.clock_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : '--:--'}
                </div>
                {attendance.punchOutOffice?.name && (
                  <div className="text-[10px] text-rose-800 dark:text-rose-300 font-semibold truncate mt-0.5" title={attendance.punchOutOffice.name}>
                    🏢 {attendance.punchOutOffice.name}
                  </div>
                )}
                {attendance.clock_out_location && (
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-1 flex items-center gap-1">
                    <LocationOnIcon sx={{ fontSize: 12, color: '#ef4444' }} />
                    <span className="truncate">
                      {typeof attendance.clock_out_location === 'object'
                        ? `${Number(attendance.clock_out_location.latitude || attendance.clock_out_location.lat).toFixed(4)}, ${Number(attendance.clock_out_location.longitude || attendance.clock_out_location.lng).toFixed(4)}`
                        : String(attendance.clock_out_location).slice(0, 20)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-[11px] text-slate-400 italic">No attendance record found for this date.</div>
          )}
        </div>

        {/* Card 2: Battery Statistics Accordion */}
        <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-sky-50/50 dark:bg-sky-950/20 text-xs font-bold text-sky-700 dark:text-sky-300 flex items-center justify-between cursor-pointer">
          <div className="flex items-center gap-2">
            <span>🔋</span>
            <span>Battery Statistics</span>
          </div>
          <span>&gt;</span>
        </div>

        {/* Card 3: Stats You Are Viewing In The Map */}
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 space-y-3">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Stats you are viewing in the map
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                📍
              </div>
              <div>
                <div className="text-[11px] text-slate-500 font-medium">Km</div>
                <div className="font-bold text-slate-900 dark:text-white">{totalDistanceKm} Km</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
                ⚠️
              </div>
              <div>
                <div className="text-[11px] text-slate-500 font-medium">Speed Violations</div>
                <div className="font-bold text-slate-900 dark:text-white">0</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                🛑
              </div>
              <div>
                <div className="text-[11px] text-slate-500 font-medium">Stoppage</div>
                <div className="font-bold text-slate-900 dark:text-white">2</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                ✅
              </div>
              <div>
                <div className="text-[11px] text-slate-500 font-medium">Tasks Completed</div>
                <div className="font-bold text-slate-900 dark:text-white">8</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const generateCalendarGrid = (month, year) => {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevDaysInMonth = new Date(year, month, 0).getDate();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const grid = [];

  // Previous month trailing days
  for (let i = firstDay - 1; i >= 0; i--) {
    const dayNum = prevDaysInMonth - i;
    const cellDate = new Date(year, month - 1, dayNum);
    cellDate.setHours(0, 0, 0, 0);
    const isFuture = cellDate > today;

    grid.push({
      day: dayNum,
      monthOffset: -1,
      isCurrentMonth: false,
      isPrevMonth: true,
      isFuture,
      dateObj: cellDate,
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const cellDate = new Date(year, month, d);
    cellDate.setHours(0, 0, 0, 0);
    const isFuture = cellDate > today;

    grid.push({
      day: d,
      monthOffset: 0,
      isCurrentMonth: true,
      isFuture,
      dateObj: cellDate,
    });
  }

  // Next month leading days
  const targetTotal = grid.length > 35 ? 42 : 35;
  const fillCount = targetTotal - grid.length;
  for (let n = 1; n <= fillCount; n++) {
    const cellDate = new Date(year, month + 1, n);
    cellDate.setHours(0, 0, 0, 0);
    const isFuture = cellDate > today;

    grid.push({
      day: n,
      monthOffset: 1,
      isCurrentMonth: false,
      isNextMonth: true,
      isFuture,
      dateObj: cellDate,
    });
  }

  return grid;
};

const parseLocationCoords = (loc) => {
  if (!loc) return null;
  let parsed = loc;
  if (typeof loc === "string") {
    try {
      parsed = JSON.parse(loc);
    } catch (e) {
      return null;
    }
  }
  const lat = Number(parsed?.latitude ?? parsed?.lat);
  const lng = Number(parsed?.longitude ?? parsed?.lng);
  if (!isNaN(lat) && !isNaN(lng) && (lat !== 0 || lng !== 0)) {
    return { lat, lng };
  }
  return null;
};

export default function EmployeeFieldVisitPage() {
  const { isDark } = useThemeMode();
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve state passed from TaskDetails or navigation
  const passedEmployeeName = location.state?.employeeName || 'KAMAL KUMAR';
  const passedRole = location.state?.role || 'Employee';
  const passedEmpId = location.state?.empId || 'CV2060';
  const passedPhoneNumber = location.state?.phoneNumber || location.state?.phone || location.state?.mobile || '+91 98765 43210';

  const [activeTab, setActiveTab] = useState('Live');
  const [selectedDate, setSelectedDate] = useState('03 Nov 2025');

  // Employee Task State
  const [employeeTasks, setEmployeeTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [taskPage, setTaskPage] = useState(0);
  const [taskRowsPerPage, setTaskRowsPerPage] = useState(10);
  const [totalTasks, setTotalTasks] = useState(0);

  useEffect(() => {
    if (activeTab === 'Task') {
      const fetchTasks = async () => {
        setLoadingTasks(true);
        try {
          //console.log(passedEmpId, "passedEmpIdpassedEmpId-----------------------------")
          const res = await TaskRoute.employeeTask({
            employeeId: passedEmpId,
            page: taskPage + 1,
            limit: taskRowsPerPage,
          });
          // console.log(res, "resresresres-----------------------------")
          if (res?.data?.tasks) {
            setEmployeeTasks(res.data.tasks);
            setTotalTasks(res.data.totalItems || res.data.tasks.length);
          } else if (Array.isArray(res?.data)) {
            setEmployeeTasks(res.data);
            setTotalTasks(res.data.length);
          } else {
            setEmployeeTasks([]);
            setTotalTasks(0);
          }
        } catch (err) {
          console.error('Failed to fetch employee tasks:', err);
        } finally {
          setLoadingTasks(false);
        }
      };
      fetchTasks();
    }
  }, [activeTab, passedEmpId, taskPage, taskRowsPerPage]);

  // Month & Date Calendar Popover State
  const dateBoxRef = useRef(null);
  const todayObj = new Date();
  const [calendarAnchorEl, setCalendarAnchorEl] = useState(null);
  const [calendarDateLabel, setCalendarDateLabel] = useState(formatDateDDMMYYYY(todayObj));
  const [calendarMonth, setCalendarMonth] = useState(todayObj.getMonth());
  const [calendarYear, setCalendarYear] = useState(todayObj.getFullYear());
  const [selectedDay, setSelectedDay] = useState(todayObj.getDate());

  // API Field Visits & Attendance State
  const [apiVisits, setApiVisits] = useState([]);
  const [attendance, setAttendance] = useState(null);
  const [loadingVisits, setLoadingVisits] = useState(false);

  // Fetch Field Visits by Date and Employee ID
  const fetchFieldVisits = async () => {
    setLoadingVisits(true);
    try {
      const formattedQueryDate =
        selectedDay && calendarMonth !== undefined && calendarYear
          ? `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`
          : new Date().toISOString().split('T')[0];

      const res = await FieldVisitRoute.getfieldVisitByDate({
        date: formattedQueryDate,
        id: passedEmpId,
      });
      if ((res?.success || res?.statusCode === 200) && res?.data) {
        const visitsData = Array.isArray(res.data) ? res.data : (res.data.visits ? res.data.visits : [res.data]);
        setApiVisits(visitsData);
        if (res.data?.attendance) {
          setAttendance(res.data.attendance);
        } else {
          setAttendance(null);
        }
      } else {
        setApiVisits([]);
        setAttendance(null);
      }
    } catch (err) {
      console.error('Failed to fetch field visits by date:', err);
      setApiVisits([]);
      setAttendance(null);
    } finally {
      setLoadingVisits(false);
    }
  };

  useEffect(() => {
    fetchFieldVisits();
  }, [calendarDateLabel, selectedDay, calendarMonth, calendarYear, passedEmpId]);

  // Leaflet Map state & refs
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [leafletLoaded, setLeafletLoaded] = useState(Boolean(window.L));

  useEffect(() => {
    if (window.L) {
      setLeafletLoaded(true);
      return;
    }
    const cssId = 'leaflet-css';
    if (!document.getElementById(cssId)) {
      const link = document.createElement('link');
      link.id = cssId;
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    const scriptId = 'leaflet-js';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => setLeafletLoaded(true);
      document.head.appendChild(script);
    } else {
      const interval = setInterval(() => {
        if (window.L) {
          setLeafletLoaded(true);
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, []);

  const locationPoints = useMemo(() => {
    const points = [];

    if (apiVisits && apiVisits.length > 0) {
      apiVisits.forEach((visit) => {
        const locations = Array.isArray(visit.locations) ? visit.locations : [];
        locations.forEach((loc, idx) => {
          const lat = Number(loc.latitude ?? loc.lat);
          const lng = Number(loc.longitude ?? loc.lng);
          if (!isNaN(lat) && !isNaN(lng) && (lat !== 0 || lng !== 0)) {
            points.push({
              lat,
              lng,
              time: loc.addedAt
                ? new Date(loc.addedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
                : (loc.time !== undefined ? `Time: ${loc.time}` : ''),
              addedAt: loc.addedAt,
              raw: loc,
              index: idx,
            });
          }
        });
      });
    }

    // Sort points in chronological order by timestamp/time
    points.sort((a, b) => {
      const tA = a.addedAt ? new Date(a.addedAt).getTime() : 0;
      const tB = b.addedAt ? new Date(b.addedAt).getTime() : 0;
      return tA - tB;
    });

    return points;
  }, [apiVisits]);

  const fullPolylineRef = useRef(null);
  const activePolylineRef = useRef(null);
  const tileLayerRef = useRef(null);
  const [mapTileType, setMapTileType] = useState('voyager');

  // Handle Dynamic Tile Switching (Voyager vs Satellite vs OSM)
  useEffect(() => {
    if (!mapInstanceRef.current || !window.L) return;
    const L = window.L;

    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }

    let url = 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';
    let attrib = '&copy; Google Maps';

    if (mapTileType === 'satellite') {
      url = 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}';
      attrib = '&copy; Google Maps Satellite';
    } else if (mapTileType === 'osm') {
      url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      attrib = '&copy; OpenStreetMap contributors';
    }

    tileLayerRef.current = L.tileLayer(url, { maxZoom: 20, attribution: attrib }).addTo(mapInstanceRef.current);
  }, [mapTileType, leafletLoaded]);

  const liveLayersGroupRef = useRef(null);

  // Live Map Effect: Initializes Leaflet map & renders static route polyline & markers when activeTab is 'Live'
  useEffect(() => {
    if (!leafletLoaded || !mapContainerRef.current || activeTab !== 'Live') return;
    const L = window.L;
    if (!L) return;

    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove();
      } catch (e) {}
      mapInstanceRef.current = null;
    }

    const defaultCenter = locationPoints.length > 0
      ? [locationPoints[0].lat, locationPoints[0].lng]
      : [28.5188453, 77.2833705];

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView(defaultCenter, 15);

    tileLayerRef.current = L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
    }).addTo(map);

    mapInstanceRef.current = map;

    const resizeTimer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 150);

    // Clear and render route layers on liveLayersGroupRef
    liveLayersGroupRef.current = L.layerGroup().addTo(map);
    const group = liveLayersGroupRef.current;

    if (locationPoints.length > 0) {
      const latLngs = locationPoints.map((p) => [p.lat, p.lng]);

      // White outline casing
      const casingPolyline = L.polyline(latLngs, {
        color: '#ffffff',
        weight: 6,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(group);

      // Dark Royal Blue route line
      const mainPolyline = L.polyline(latLngs, {
        color: '#1d4ed8',
        weight: 3.5,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(group);

      // OSRM road snapping
      fetchRoadMatchedRoute(locationPoints).then((roadPath) => {
        if (roadPath && roadPath.length > 0 && mapInstanceRef.current === map) {
          casingPolyline.setLatLngs(roadPath);
          mainPolyline.setLatLngs(roadPath);
        }
      });

      // Start Pin (S)
      const startIcon = L.divIcon({
        className: 'custom-start-pin',
        html: `<div style="background-color: #10b981; color: white; width: 26px; height: 26px; border-radius: 50%; border: 2.5px solid #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold;">S</div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });
      L.marker(latLngs[0], { icon: startIcon }).bindPopup('<b>Route Start Point</b>').addTo(group);

      // End Pin (E)
      if (latLngs.length > 1) {
        const endIcon = L.divIcon({
          className: 'custom-end-pin',
          html: `<div style="background-color: #ef4444; color: white; width: 26px; height: 26px; border-radius: 50%; border: 2.5px solid #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold;">E</div>`,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });
        L.marker(latLngs[latLngs.length - 1], { icon: endIcon }).bindPopup('<b>Route End Point</b>').addTo(group);
      }

      // Waypoint Dots
      locationPoints.forEach((pt, idx) => {
        if (idx === 0 || idx === locationPoints.length - 1) return;
        const dotIcon = L.divIcon({
          className: 'custom-route-dot',
          html: `<div style="background-color: #1e40af; width: 9px; height: 9px; border-radius: 50%; border: 2.5px solid #ffffff; box-shadow: 0 1px 4px rgba(0,0,0,0.55);"></div>`,
          iconSize: [9, 9],
          iconAnchor: [4.5, 4.5],
        });
        L.marker([pt.lat, pt.lng], { icon: dotIcon })
          .bindPopup(`<b>Point ${idx + 1}</b><br/>Time: ${pt.time || '-'}`)
          .addTo(group);
      });

      if (latLngs.length > 1) {
        const bounds = L.latLngBounds(latLngs);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
      } else {
        map.setView(latLngs[0], 15);
      }
    }

    return () => {
      clearTimeout(resizeTimer);
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {}
        mapInstanceRef.current = null;
      }
      liveLayersGroupRef.current = null;
    };
  }, [leafletLoaded, activeTab, locationPoints, passedEmployeeName]);

  // Route Playback & Time Animation State
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackIndex, setPlaybackIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const playbackMarkerRef = useRef(null);

  // Map Height Resize State: 'compact' (380px), 'normal' (520px), 'full' (flex-1 full container)
  const [mapHeightMode, setMapHeightMode] = useState('normal');

  useEffect(() => {
    if (mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current.invalidateSize();
      }, 100);
    }
  }, [mapHeightMode]);

  // Auto animation playback timer
  useEffect(() => {
    if (!isPlaying) return;
    if (locationPoints.length === 0) return;

    const intervalTime = Math.max(100, 1000 / playbackSpeed);

    const timer = setInterval(() => {
      setPlaybackIndex((prev) => {
        if (prev >= locationPoints.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed, locationPoints.length]);

  // Update active playback marker and active dark blue path segment on Leaflet map
  useEffect(() => {
    if (!mapInstanceRef.current || locationPoints.length === 0 || !locationPoints[playbackIndex]) return;
    const L = window.L;
    if (!L) return;

    const pt = locationPoints[playbackIndex];
    const latLng = [pt.lat, pt.lng];

    // Render/update dark blue traversed route line up to current playback index
    if (mapInstanceRef.current && locationPoints.length > 1) {
      if (activePolylineRef.current) {
        mapInstanceRef.current.removeLayer(activePolylineRef.current);
      }
      const activePts = locationPoints.slice(0, playbackIndex + 1).map((p) => [p.lat, p.lng]);
      if (activePts.length > 1) {
        activePolylineRef.current = L.polyline(activePts, {
          color: '#1e3a8a',
          weight: 6,
          opacity: 1,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(mapInstanceRef.current);
      }
    }

    if (!playbackMarkerRef.current) {
      const personPinIcon = L.divIcon({
        className: 'custom-person-pin',
        html: `<div style="position: relative; display: flex; align-items: center; justify-content: center;">
                <div style="background-color: #0284c7; width: 34px; height: 34px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; color: white;">
                  <svg style="width: 20px; height: 20px; fill: white;" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
              </div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      playbackMarkerRef.current = L.marker(latLng, { icon: personPinIcon, zIndexOffset: 1000 }).addTo(mapInstanceRef.current);
    } else {
      playbackMarkerRef.current.setLatLng(latLng);
    }

    playbackMarkerRef.current.bindPopup(
      `<b>${passedEmployeeName}</b><br/>Time: ${pt.time || '-'}<br/>Lat: ${pt.lat.toFixed(5)}<br/>Lng: ${pt.lng.toFixed(5)}`
    );
  }, [playbackIndex, locationPoints, leafletLoaded, passedEmployeeName]);

  const totalDistanceKm = useMemo(() => {
    if (!locationPoints || locationPoints.length < 2) return '0.00';
    let total = 0;
    for (let i = 1; i < locationPoints.length; i++) {
      total += calculateDistanceKm(
        locationPoints[i - 1].lat,
        locationPoints[i - 1].lng,
        locationPoints[i].lat,
        locationPoints[i].lng
      );
    }
    return total.toFixed(2);
  }, [locationPoints]);

  const handleOpenCalendar = () => {
    if (dateBoxRef.current) {
      setCalendarAnchorEl(dateBoxRef.current);
    }
  };

  const handleCloseCalendar = () => {
    setCalendarAnchorEl(null);
  };

  const handlePrevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear((prev) => prev - 1);
    } else {
      setCalendarMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    const today = new Date();
    if (calendarYear > today.getFullYear() || (calendarYear === today.getFullYear() && calendarMonth >= today.getMonth())) {
      return;
    }
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear((prev) => prev + 1);
    } else {
      setCalendarMonth((prev) => prev + 1);
    }
  };

  const handleSelectDay = (item) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dayNum = typeof item === 'object' ? item.day : item;
    const monthOff = typeof item === 'object' && item.monthOffset !== undefined ? item.monthOffset : 0;

    const dateObj = typeof item === 'object' && item.dateObj
      ? new Date(item.dateObj)
      : new Date(calendarYear, calendarMonth + monthOff, dayNum);
    dateObj.setHours(0, 0, 0, 0);

    if (dateObj > today) return;

    if (monthOff !== 0) {
      setCalendarMonth(dateObj.getMonth());
      setCalendarYear(dateObj.getFullYear());
    }

    setSelectedDay(dateObj.getDate());
    const formattedLabel = formatDateDDMMYYYY(dateObj);

    setCalendarDateLabel(formattedLabel);
    setSelectedDate(formattedLabel);
    handleCloseCalendar();
  };

  const handleClear = () => {
    setSelectedDay(null);
    const formatted = formatDateDDMMYYYY(todayObj);
    setCalendarDateLabel(formatted);
    setSelectedDate(formatted);
    handleCloseCalendar();
  };

  const handleTodayClick = () => {
    setCalendarMonth(todayObj.getMonth());
    setCalendarYear(todayObj.getFullYear());
    setSelectedDay(todayObj.getDate());
    const formatted = formatDateDDMMYYYY(todayObj);
    setCalendarDateLabel(formatted);
    setSelectedDate(formatted);
    handleCloseCalendar();
  };

  const tabList = [
    { label: 'Live', icon: <SensorsIcon sx={{ fontSize: 16 }} /> },
    { label: 'Playback', icon: <MapIcon sx={{ fontSize: 16 }} /> },
    { label: 'Task', icon: <AssignmentOutlinedIcon sx={{ fontSize: 16 }} /> },
    { label: 'All Attendance', icon: null, hasDropdown: true },
    { label: 'All Leave', icon: null, hasDropdown: true },
    { label: 'Payment', icon: <PaymentIcon sx={{ fontSize: 16 }} /> },
    { label: 'Details', icon: <InfoOutlinedIcon sx={{ fontSize: 16 }} /> },
    { label: 'Managers', icon: <PersonPinCircleIcon sx={{ fontSize: 16 }} /> },
    { label: 'Documents', icon: <DescriptionIcon sx={{ fontSize: 16 }} /> },
    { label: 'Feeds', icon: <RssFeedIcon sx={{ fontSize: 16 }} /> },
    { label: 'Audit History', icon: <HistoryIcon sx={{ fontSize: 16 }} /> },
  ];

  const activeTimelineEvents = useMemo(() => {
    const mapped = [];

    if (apiVisits && apiVisits.length > 0) {
      apiVisits.forEach((visit, vIdx) => {
        const locations = Array.isArray(visit.locations) ? visit.locations : [];
        if (locations.length === 0) return;

        // Group consecutive location pings by `loc.time` index
        const groups = [];
        let currentGroup = null;

        locations.forEach((loc, lIdx) => {
          const groupKey = loc.time !== undefined ? loc.time : Math.floor(lIdx / 15);
          if (!currentGroup || currentGroup.key !== groupKey) {
            currentGroup = {
              key: groupKey,
              startIndex: lIdx,
              endIndex: lIdx,
              firstLoc: loc,
              lastLoc: loc,
            };
            groups.push(currentGroup);
          } else {
            currentGroup.endIndex = lIdx;
            currentGroup.lastLoc = loc;
          }
        });

        // Map grouped segments to timeline cards
        groups.forEach((g, gIdx) => {
          const startTimeStr = formatTimeHHMMSS(g.firstLoc.addedAt);
          const endTimeStr = formatTimeHHMMSS(g.lastLoc.addedAt);

          const timeRangeStr = startTimeStr === endTimeStr ? startTimeStr : `${startTimeStr}-${endTimeStr}`;

          const durationVal = Number(g.key);
          const durationBadgeStr = !isNaN(durationVal) && durationVal > 0
            ? `(${durationVal} Minute${durationVal > 1 ? 's' : ''})`
            : '(00:00)';

          const dist = calculateDistanceKm(
            Number(g.firstLoc.latitude),
            Number(g.firstLoc.longitude),
            Number(g.lastLoc.latitude),
            Number(g.lastLoc.longitude)
          ).toFixed(1);

          const isPunchIn = gIdx === 0;

          mapped.push({
            id: `api-${vIdx}-g-${gIdx}`,
            pointIndex: g.startIndex,
            type: isPunchIn ? 'punch_in' : 'travel',
            title: isPunchIn ? 'Punch In' : `Travelled (${dist})`,
            officeName: isPunchIn ? attendance?.punchInOffice?.name : null,
            timeRange: isPunchIn && attendance?.clock_in ? formatTimeHHMMSS(attendance.clock_in) : timeRangeStr,
            duration: durationBadgeStr,
            address: isPunchIn && attendance?.punchInOffice?.address
              ? attendance.punchInOffice.address
              : (g.firstLoc.address || `Lat: ${Number(g.firstLoc.latitude)?.toFixed(5)}, Lng: ${Number(g.firstLoc.longitude)?.toFixed(5)}`),
            iconBg: isPunchIn ? 'bg-emerald-500' : 'bg-sky-500',
            latitude: Number(g.firstLoc.latitude),
            longitude: Number(g.firstLoc.longitude),
          });
        });

        if (visit.purpose || visit.remark || visit.taskCode) {
          const firstLoc = locations[0];
          const lastLoc = locations[locations.length - 1];
          const startTimeStr = firstLoc ? formatTimeHHMMSS(firstLoc.addedAt) : '';
          const endTimeStr = lastLoc ? formatTimeHHMMSS(lastLoc.addedAt) : '';
          const taskTimeRange = startTimeStr && endTimeStr && startTimeStr !== endTimeStr ? `${startTimeStr}-${endTimeStr}` : startTimeStr;
          const taskDuration = firstLoc && lastLoc ? formatDurationBadge(firstLoc.addedAt, lastLoc.addedAt) : '(1 Minute)';

          mapped.push({
            id: `api-visit-${vIdx}`,
            type: 'task',
            title: visit.taskCode || visit.purpose || 'Field Visit',
            assignee: passedEmployeeName,
            taskType: visit.status || 'In Progress',
            timeRange: taskTimeRange,
            duration: taskDuration,
            address: visit.remark || (firstLoc ? `Lat: ${Number(firstLoc.latitude)?.toFixed(5)}, Lng: ${Number(firstLoc.longitude)?.toFixed(5)}` : 'Field visit logged'),
            iconBg: 'bg-amber-500',
          });
        }
      });
    }

    // Append Punch Out Event if available from attendance
    if (attendance?.clock_out || attendance?.punchOutOffice) {
      const clockOutTimeStr = attendance.clock_out ? formatTimeHHMMSS(attendance.clock_out) : '';
      const clockOutCoords = parseLocationCoords(attendance.clock_out_location) ||
        parseLocationCoords(attendance.punchOutOffice);

      mapped.push({
        id: 'attendance-punch-out-card',
        type: 'punch_out',
        title: 'Punch Out',
        officeName: attendance.punchOutOffice?.name || null,
        timeRange: clockOutTimeStr,
        duration: '(00:00)',
        address: attendance.punchOutOffice?.address ||
          (clockOutCoords ? `Lat: ${clockOutCoords.lat.toFixed(5)}, Lng: ${clockOutCoords.lng.toFixed(5)}` : 'Punch out logged'),
        iconBg: 'bg-rose-500',
        latitude: clockOutCoords?.lat,
        longitude: clockOutCoords?.lng,
      });
    }

    return mapped;
  }, [apiVisits, attendance, passedEmployeeName]);

  return (
    <div className={`h-screen max-h-screen overflow-hidden flex flex-col ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* App Navbar */}
      <Navbar />

      {/* Employee Details Header Header */}
      <div className={`border-b ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} px-4 py-2.5 shadow-sm shrink-0`}>
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Employee Left Info */}
          <div className="flex items-center gap-3">
            <Avatar
              alt={passedEmployeeName}
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
              sx={{ width: 44, height: 44, border: '2px solid #0284c7' }}
            />
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-tight">
                  {passedEmployeeName}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {passedRole}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-600 dark:text-slate-400 flex-wrap">
                <span className="flex items-center gap-1 font-mono font-medium">
                  <span className="text-slate-400">ID:</span> {passedEmpId}
                </span>
                <span className="flex items-center gap-1">
                  <PhoneIcon sx={{ fontSize: 13 }} className="text-sky-500" />
                  {passedPhoneNumber}
                </span>
                <span className="flex items-center gap-1">
                  <BusinessIcon sx={{ fontSize: 13 }} className="text-amber-500" />
                  {passedRole}
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-slate-400">Project:</span> Credit Mitra
                </span>
                <span className="flex items-center gap-1 bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 px-2 py-0.5 rounded border border-sky-200 dark:border-sky-800">
                  <CalendarMonthIcon sx={{ fontSize: 12 }} />
                  {selectedDate}
                </span>
              </div>
            </div>
          </div>

          {/* Employee Right Action Controls */}
          <div className="flex items-center gap-2">
            <Tooltip title="Live Status">
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-200 dark:border-emerald-800">
                <SensorsIcon sx={{ fontSize: 14 }} className="animate-pulse" />
                <span>Live</span>
              </div>
            </Tooltip>

            <IconButton size="small" onClick={() => window.location.reload()} className="text-slate-600 dark:text-slate-400">
              <RefreshIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" className="text-slate-600 dark:text-slate-400">
              <ArrowBackIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" className="text-slate-600 dark:text-slate-400">
              <ArrowForwardIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" className="text-slate-600 dark:text-slate-400">
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </div>
        </div>
      </div>

      {/* Page Tabs Navigation Bar (matching Trackwick UI screenshot) */}
      <div className={`border-b ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'} px-4 overflow-x-auto scrollbar-none shrink-0`}>
        <div className="flex items-center gap-1 min-w-max">
          {tabList.map((t) => {
            const isActive = activeTab === t.label;
            return (
              <button
                key={t.label}
                type="button"
                onClick={() => setActiveTab(t.label)}
                className={`px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'border-sky-600 text-sky-600 dark:border-sky-400 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50 font-bold'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {t.icon && <span className={isActive ? 'text-sky-600 dark:text-sky-400' : 'text-sky-500/80 dark:text-sky-400/80'}>{t.icon}</span>}
                <span>{t.label}</span>
                {t.hasDropdown && <ArrowDropDownIcon sx={{ fontSize: 16 }} className="text-slate-400 ml-0.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Body - Split Layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative min-h-0 h-full">
        {activeTab === 'Playback' ? (
          <PlaybackView
            locationPoints={locationPoints}
            isDark={isDark}
            calendarDateLabel={calendarDateLabel}
            totalDistanceKm={totalDistanceKm}
            attendance={attendance}
          />
        ) : activeTab === 'Task' ? (
          <div className="flex-1 p-4 overflow-y-auto bg-slate-50 dark:bg-slate-950">
            {loadingTasks ? (
              <div className="p-8 text-center text-sm font-semibold text-slate-500">
                Loading employee tasks...
              </div>
            ) : (
              <TaskTable
                filteredTasks={employeeTasks}
                totalData={totalTasks}
                page={taskPage}
                rowsPerPage={taskRowsPerPage}
                onPageChange={(e, newPage) => setTaskPage(newPage)}
                onRowsPerPageChange={(e) => {
                  setTaskRowsPerPage(parseInt(e.target.value, 10));
                  setTaskPage(0);
                }}
              />
            )}
          </div>
        ) : (
          <>
            {/* Left Sidebar (360° View & Timeline - Independent Scroll) */}
            <div className={`w-full md:w-80 lg:w-96 border-r flex flex-col ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'} shrink-0 z-10 h-full max-h-full min-h-0`}>
              {/* Sidebar Top Header */}
              <div className="p-3 border-b flex items-center justify-between border-slate-200 dark:border-slate-800 shrink-0">
                <div className="flex items-center gap-2 font-bold text-xs text-sky-600 dark:text-sky-400">
                  <div className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-ping" />
                  <span>360° View</span>
                </div>
                <IconButton size="small">
                  <RefreshIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </div>

              {/* Sidebar Stats Bar */}
              <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-950/40 space-y-2 shrink-0">
                <div className="flex items-center justify-between text-xs">
                  <div
                    ref={dateBoxRef}
                    onClick={handleOpenCalendar}
                    className="flex items-center cursor-pointer border border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-800 hover:border-sky-500 transition-colors select-none shadow-xs"
                  >
                    <span className="px-2.5 py-1 text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                      {calendarDateLabel}
                    </span>
                    <div className="px-2 py-1 bg-slate-100 dark:bg-slate-700/60 border-l border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300">
                      <CalendarMonthIcon sx={{ fontSize: 15 }} className="text-sky-600 dark:text-sky-400" />
                    </div>
                  </div>

                  {/* Month / Date Calendar Popover */}
                  <Popover
                    open={Boolean(calendarAnchorEl)}
                    anchorEl={calendarAnchorEl}
                    onClose={handleCloseCalendar}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'left',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'left',
                    }}
                    marginThreshold={8}
                    PaperProps={{
                      sx: {
                        p: 1.5,
                        borderRadius: 2,
                        width: 260,
                        backgroundColor: isDark ? '#0f172a' : '#ffffff',
                        color: isDark ? '#f8fafc' : '#0f172a',
                        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
                        border: isDark ? '1px solid #1e293b' : '1px solid #e2e8f0',
                      },
                    }}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold pb-1 border-b border-slate-100 dark:border-slate-800">
                        <span>{MONTH_NAMES[calendarMonth]} {calendarYear}</span>
                        <div className="flex items-center gap-0.5">
                          <IconButton size="small" onClick={handlePrevMonth} className="text-slate-600 dark:text-slate-400">
                            <NorthIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                          <IconButton size="small" onClick={handleNextMonth} className="text-slate-600 dark:text-slate-400">
                            <SouthIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </div>
                      </div>

                      {/* Weekday Headers */}
                      <div className="grid grid-cols-7 text-center text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {WEEKDAY_NAMES.map((wd) => (
                          <div key={wd}>{wd}</div>
                        ))}
                      </div>

                      {/* Days Grid */}
                      <div className="grid grid-cols-7 text-center text-xs gap-y-1">
                        {generateCalendarGrid(calendarMonth, calendarYear).map((item, idx) => {
                          const isSelected =
                            !item.isFuture &&
                            item.isCurrentMonth &&
                            selectedDay === item.day;

                          const isDisabled = item.isFuture;

                          return (
                            <button
                              key={idx}
                              type="button"
                              disabled={isDisabled}
                              onClick={() => !isDisabled && handleSelectDay(item)}
                              className={`w-7 h-7 mx-auto flex items-center justify-center text-xs transition-all ${
                                isDisabled
                                  ? 'text-slate-300 dark:text-slate-700 opacity-40 cursor-not-allowed select-none'
                                  : isSelected
                                  ? 'bg-blue-600 text-white font-bold rounded-xs border-2 border-slate-900 shadow-sm'
                                  : !item.isCurrentMonth
                                  ? 'text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded font-medium cursor-pointer'
                                  : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded font-medium cursor-pointer'
                              }`}
                            >
                              {item.day}
                            </button>
                          );
                        })}
                      </div>

                      {/* Footer Actions: Clear & Today */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                        <button
                          type="button"
                          onClick={handleClear}
                          className="text-sky-600 dark:text-sky-400 hover:underline font-medium cursor-pointer"
                        >
                          Clear
                        </button>
                        <button
                          type="button"
                          onClick={handleTodayClick}
                          className="text-sky-600 dark:text-sky-400 hover:underline font-medium cursor-pointer"
                        >
                          Today
                        </button>
                      </div>
                    </div>
                  </Popover>

                  <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-3">
                    <div>Completed <span className="font-bold text-slate-900 dark:text-white">8</span></div>
                    <div>Distance <span className="font-bold text-sky-600 dark:text-sky-400">{totalDistanceKm}Km</span></div>
                  </div>
                </div>
              </div>

              {/* Timeline Event List - Independent Scroll */}
              <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-3 custom-scrollbar">
                {loadingVisits && (
                  <div className="text-center py-4 text-xs text-sky-600 dark:text-sky-400 font-semibold animate-pulse">
                    Loading field visits...
                  </div>
                )}

                {!loadingVisits && activeTimelineEvents.length === 0 && (
                  <div className="text-center py-10 px-4 text-xs text-slate-500 dark:text-slate-400 space-y-1.5 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 my-4">
                    <div className="font-bold text-slate-700 dark:text-slate-300 text-sm">No Field Visits Found</div>
                    <div>No location pings logged for {calendarDateLabel}</div>
                  </div>
                )}
                {activeTimelineEvents.map((evt) => {
                  const isSelected = evt.pointIndex !== undefined && evt.pointIndex === playbackIndex;
                  return (
                    <div
                      key={evt.id}
                      onClick={() => {
                        if (evt.pointIndex !== undefined) {
                          setPlaybackIndex(evt.pointIndex);
                          setIsPlaying(false);
                          if (mapInstanceRef.current && evt.latitude && evt.longitude) {
                            mapInstanceRef.current.panTo([evt.latitude, evt.longitude]);
                          }
                        }
                      }}
                      className={`relative pl-6 p-2.5 rounded-xl transition-all cursor-pointer group ${
                        isSelected
                          ? 'bg-sky-50 dark:bg-sky-950/70 border-2 border-sky-500 dark:border-sky-500 shadow-md scale-[1.01]'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent'
                      }`}
                    >
                      {/* Vertical connecting line */}
                      <div className="absolute left-2.5 top-6 bottom-0 w-0.5 bg-slate-300 dark:bg-slate-700 group-last:hidden" />

                      {/* Event Dot Icon */}
                      <div
                        className={`absolute left-1 top-3 w-5 h-5 rounded-full ${evt.iconBg} text-white flex items-center justify-center text-[10px] font-bold shadow`}
                      >
                        {(evt.type === 'punch_in' || evt.type === 'punch_out') && <CheckCircleOutlinedIcon sx={{ fontSize: 13 }} />}
                        {evt.type === 'travel' && <DirectionsCarIcon sx={{ fontSize: 12 }} />}
                        {evt.type === 'stoppage' && <LocationOnIcon sx={{ fontSize: 12 }} />}
                        {evt.type === 'task' && <TaskAltIcon sx={{ fontSize: 12 }} />}
                      </div>

                      {/* Event Content */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs gap-1">
                          <span className="font-bold text-slate-800 dark:text-slate-200">{evt.title}</span>
                          {evt.duration && (
                            <span className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 shrink-0">
                              {evt.duration}
                            </span>
                          )}
                        </div>

                        {evt.officeName && (
                          <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mt-0.5">
                            <span>🏢</span>
                            <span className="text-emerald-700 dark:text-emerald-400">{evt.officeName}</span>
                          </div>
                        )}

                        {evt.timeRange && (
                          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                            {evt.timeRange}
                          </div>
                        )}

                        {evt.assignee && (
                          <div className="text-xs font-semibold text-sky-600 dark:text-sky-400 flex items-center gap-1">
                            <PersonPinCircleIcon sx={{ fontSize: 14 }} />
                            <span>{evt.assignee}</span>
                          </div>
                        )}

                        {evt.taskType && (
                          <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                            Type: <span className="text-slate-900 dark:text-slate-200">{evt.taskType}</span>
                          </div>
                        )}

                        {evt.address && (
                          <div className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug flex items-start gap-1">
                            <LocationOnIcon sx={{ fontSize: 12 }} className="text-slate-400 shrink-0 mt-0.5" />
                            <span>{evt.address}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Links at bottom of sidebar */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-xs space-y-2">
                  <button className="w-full text-left font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1.5">
                    <LocationOnIcon sx={{ fontSize: 14 }} />
                    <span>Nearest Location</span>
                  </button>
                  <button className="w-full text-left font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1.5">
                    <MapIcon sx={{ fontSize: 14 }} />
                    <span>See location on map</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Main Map Container */}
            <div className="flex-1 flex flex-col relative bg-slate-200 dark:bg-slate-900">
              {/* Interactive Leaflet Map Rendering Route Polyline */}
              <div
                className={`w-full relative transition-all duration-300 overflow-hidden ${
                  mapHeightMode === 'compact'
                    ? 'h-[380px]'
                    : mapHeightMode === 'normal'
                    ? 'h-[520px]'
                    : 'flex-1 min-h-[600px]'
                }`}
              >
                {/* Top Left Live Location Banner (matching user screenshot) */}
                <div className="absolute top-3 left-3 z-[1000] bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 shadow-md text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2 pointer-events-auto">
                  <InfoOutlinedIcon sx={{ fontSize: 16 }} className="text-sky-500 shrink-0" />
                  <span>Map displays the employee's live location in real time</span>
                </div>

                {/* Top Right Floating Map Controls (matching user screenshot) */}
                <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-lg pointer-events-auto">
                  <Tooltip title={mapTileType === 'voyager' ? "Switch to Satellite" : "Switch to Street Map"} placement="left">
                    <button
                      type="button"
                      onClick={() => setMapTileType((prev) => (prev === 'voyager' ? 'satellite' : 'voyager'))}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold transition-colors cursor-pointer"
                    >
                      <MapIcon sx={{ fontSize: 18 }} />
                    </button>
                  </Tooltip>

                  <Tooltip title="Recenter Route" placement="left">
                    <button
                      type="button"
                      onClick={() => {
                        if (mapInstanceRef.current && locationPoints.length > 0 && window.L) {
                          const bounds = window.L.latLngBounds(locationPoints.map((p) => [p.lat, p.lng]));
                          mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
                        }
                      }}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <NavigationIcon sx={{ fontSize: 18 }} />
                    </button>
                  </Tooltip>

                  <div className="h-px bg-slate-200 dark:bg-slate-800 my-0.5" />

                  <Tooltip title="Zoom In" placement="left">
                    <button
                      type="button"
                      onClick={() => mapInstanceRef.current?.zoomIn()}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <AddIcon sx={{ fontSize: 18 }} />
                    </button>
                  </Tooltip>

                  <Tooltip title="Zoom Out" placement="left">
                    <button
                      type="button"
                      onClick={() => mapInstanceRef.current?.zoomOut()}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <RemoveIcon sx={{ fontSize: 18 }} />
                    </button>
                  </Tooltip>
                </div>

                {/* Bottom Left Footer Attribution */}
                <div className="absolute bottom-2 left-3 z-[1000] text-[10px] text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-slate-900/80 backdrop-blur px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-2 pointer-events-auto">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Powered by TrackOlap</span>
                  <span>|</span>
                  <span>2.6.616</span>
                  <span>|</span>
                  <span className="hover:underline cursor-pointer">Privacy Terms & Conditions</span>
                </div>

                <div ref={mapContainerRef} className="w-full h-full z-0" />

                {!leafletLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs text-white font-semibold text-xs z-10">
                    Loading Interactive Map...
                  </div>
                )}
              </div>

              {/* Footer Branding Bar */}
              <div className={`px-4 py-1.5 text-[11px] border-t flex items-center justify-between ${isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500'}`}>
                <div>
                  Powered by <span className="font-semibold text-slate-700 dark:text-slate-300">TrackOlap</span> | 2.5.616
                </div>
                <div className="flex items-center gap-3">
                  <button className="hover:underline">Privacy</button>
                  <button className="hover:underline">Terms & Conditions</button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
