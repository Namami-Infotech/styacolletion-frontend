import React, { useState, useEffect, useMemo } from 'react';
import {
  Avatar,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Drawer,
  Collapse,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';

// MUI Icons
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EngineeringIcon from '@mui/icons-material/Engineering';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import HomeIcon from '@mui/icons-material/Home';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SettingsIcon from '@mui/icons-material/Settings';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import BadgeIcon from '@mui/icons-material/Badge';
import SecurityIcon from '@mui/icons-material/Security';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import BusinessIcon from '@mui/icons-material/Business';
import ContactsIcon from '@mui/icons-material/Contacts';
import RssFeedIcon from '@mui/icons-material/RssFeed';

import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useThemeMode } from '../../contexts/ThemeContext';
import { attendanceRoute } from '../../routes/attendance/attendance.route';
import { toast } from 'react-toastify';
import { sortPermissionsByModuleTree } from '../../views/roles/moduleTree';
import AppLogo from './AppLogo';

export default function Navbar({
  user: propUser,
  logout: propLogout,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();
  const { isDark, toggleTheme } = useThemeMode();
  const user = propUser || auth?.user;
  const logout = propLogout || auth?.logout;

  // Determine active tab based on current path
  const getCurrentTab = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard';
    if (path.startsWith('/employees/my-team')) return 'My Team';
    if (path.startsWith('/employees') || path.includes('employee')) return 'All Employee';
    if (path.startsWith('/tasks/all')) return 'Task All';
    if (path.startsWith('/tasks/team')) return 'Task';
    if (path.startsWith('/tasks/task-customer')) return 'Task Customer';
    if (path.startsWith('/tasks/deleted')) return 'Deleted Tasks';
    if (path.startsWith('/tasks')) return 'Team Task';
    if (path.startsWith('/customers')) return 'Customer';
    if (path.startsWith('/attendance/details')) return 'Attendance Details';
    if (path.startsWith('/attendance/monthly')) return 'Monthly Attendance';
    if (path.startsWith('/attendance')) return 'Attendance Details';
    if (path.startsWith('/states')) return 'State';
    if (path.startsWith('/regions')) return 'Region';
    if (path.startsWith('/branches')) return 'Branch';
    if (path.startsWith('/office')) return 'Office Settings';
    if (path.startsWith('/roles')) return 'Role & Permission Settings';
    if (path.startsWith('/holiday')) return 'Holiday Settings';
    if (path.startsWith('/department-settings') || path.startsWith('/department')) return 'Department Settings';
    if (path.startsWith('/designation')) return 'Designation';
    if (path.startsWith('/task-types') || path.startsWith('/tasktype')) return 'Task Type';
    if (path === '/home') return 'Home';
    return 'Home';
  };
  const [activeTab, setActiveTab] = useState(getCurrentTab());

  useEffect(() => {
    setActiveTab(getCurrentTab());
  }, [location.pathname]);

  // Mobile Drawer state
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [mobileExpandedItems, setMobileExpandedItems] = useState({});

  // Nav items dropdown anchor state
  const [navDropdownAnchorEl, setNavDropdownAnchorEl] = useState(null);
  const [activeDropdownNav, setActiveDropdownNav] = useState(null);
  const [moreMenuAnchorEl, setMoreMenuAnchorEl] = useState(null);

  const handleTabClick = (event, item) => {
    if (item.hasDropdown && item.dropdownItems && item.dropdownItems.length > 0) {
      setNavDropdownAnchorEl(event.currentTarget);
      setActiveDropdownNav(item);
      return;
    }

    setActiveTab(item.label);
    if (item.path) {
      navigate(item.path);
    } else if (item.label === 'Home') {
      navigate('/home');
    } else if (item.label === 'Dashboard') {
      navigate('/dashboard');
    } else if (item.label === 'Customer' || item.label === 'Customers') {
      navigate('/customers');
    } else if (item.label === 'Employee') {
      navigate('/employees');
    } else if (item.label === 'Team Task') {
      navigate('/tasks/all');
    }
  };

  const handleMobileToggleExpand = (itemLabel) => {
    setMobileExpandedItems((prev) => ({
      ...prev,
      [itemLabel]: !prev[itemLabel],
    }));
  };

  // Punch in/out state & backend integration
  const [isPunchedIn, setIsPunchedIn] = useState(false);
  const [isPunchedOutToday, setIsPunchedOutToday] = useState(false);
  const [punchSeconds, setPunchSeconds] = useState(0);
  const [punchLoading, setPunchLoading] = useState(false);

  // User menu anchor element
  const [anchorEl, setAnchorEl] = useState(null);
  const isMenuOpen = Boolean(anchorEl);

  // Role menu anchor element
  const [roleAnchorEl, setRoleAnchorEl] = useState(null);
  const isRoleMenuOpen = Boolean(roleAnchorEl);

  // Profile Dialog state
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [avatarImgError, setAvatarImgError] = useState(false);

  useEffect(() => {
    setAvatarImgError(false);
  }, [user?.thumbnail, user?.image]);



  const fetchTodayAttendance = async () => {
    try {
      const response = await attendanceRoute.getTodayAttendance(user?.id || '');
      if (response && (response.success || response.statusCode === 200) && response.data) {
        const { isClockedIn, isClockedOut, attendance } = response.data;
        setIsPunchedIn(Boolean(isClockedIn));
        setIsPunchedOutToday(Boolean(isClockedOut));

        if (isClockedIn && attendance?.clock_in) {
          const clockInTime = new Date(attendance.clock_in).getTime();
          const now = Date.now();
          const diffInSeconds = Math.max(0, Math.floor((now - clockInTime) / 1000));
          setPunchSeconds(diffInSeconds);
        } else if (isClockedOut && attendance?.clock_out) {
          const clockOutTime = new Date(attendance.clock_out).getTime();
          const now = Date.now();
          const diffInSeconds = Math.max(0, Math.floor((now - clockOutTime) / 1000));
          setPunchSeconds(diffInSeconds);
        } else {
          setPunchSeconds(0);
        }
      }
    } catch (err) {
      console.error("Error fetching today's attendance in Navbar:", err);
    }
  };

  useEffect(() => {
    fetchTodayAttendance();
  }, [user]);

  useEffect(() => {
    const timer = setInterval(() => {
      setPunchSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatPunchTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    if (mins >= 60) {
      const hrs = Math.floor(mins / 60);
      const remMins = mins % 60;
      return `${hrs}h ${remMins}m ago`;
    }
    return `${mins}m ${secs}s ago`;
  };

  const getUserLocation = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({ latitude: null, longitude: null });
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.warn("Geolocation positioning error:", error);
          resolve({ latitude: null, longitude: null });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  };

  const handlePunchToggle = async () => {
    if (punchLoading) return;
    setPunchLoading(true);

    try {
      const locationCoords = await getUserLocation();

      if (!isPunchedIn) {
        const res = await attendanceRoute.clockIn({
          latitude: locationCoords.latitude,
          longitude: locationCoords.longitude,
        });

        if (res && (res.success || res.statusCode === 201 || res.statusCode === 200)) {
          toast.success(res.message || "Clocked in successfully!");
          setIsPunchedIn(true);
          setIsPunchedOutToday(false);
          setPunchSeconds(0);
          await fetchTodayAttendance();
        }
      } else {
        const res = await attendanceRoute.clockOut({
          latitude: locationCoords.latitude,
          longitude: locationCoords.longitude,
        });

        if (res && (res.success || res.statusCode === 201 || res.statusCode === 200)) {
          toast.success(res.message || "Clocked out successfully!");
          setIsPunchedIn(false);
          setIsPunchedOutToday(true);
          setPunchSeconds(0);
          await fetchTodayAttendance();
        }
      }
    } catch (err) {
      console.error("Error during punch action:", err);
    } finally {
      setPunchLoading(false);
    }
  };

  const permissions = auth?.permissions;
  const roleInfo = auth?.roleInfo;

  // Check if user has permission for a specific module
  // Check if user has permission for a specific module or sub-module
  const checkPermission = (itemKey) => {
    if (!permissions) return true;
    if (!itemKey) return true;

    let actualPerms = permissions;
    while (actualPerms && actualPerms.permission && typeof actualPerms.permission === 'object') {
      actualPerms = actualPerms.permission;
    }

    const lowerKey = itemKey.toLowerCase();

    // Helper to evaluate if a permission node has any granted access
    const hasAnyAccess = (targetNode) => {
      if (!targetNode) return false;
      if (typeof targetNode === 'boolean') return targetNode;
      if (typeof targetNode === 'object') {
        return Object.values(targetNode).some((val) => {
          if (typeof val === 'boolean') return val;
          if (typeof val === 'object' && val !== null) return hasAnyAccess(val);
          return false;
        });
      }
      return false;
    };

    // 1. Direct top-level match (e.g. 'dashboard', 'task', 'employee', 'role', 'roles')
    const topMatchKey = Object.keys(actualPerms).find((k) => {
      const lk = k.toLowerCase();
      return (
        lk === lowerKey ||
        (lowerKey === 'roles' && lk === 'role') ||
        (lowerKey === 'role' && lk === 'roles') ||
        (lowerKey === 'office' && lk === 'branch') ||
        (lowerKey === 'branch' && lk === 'office') ||
        (lowerKey === 'department-settings' && lk === 'department') ||
        (lowerKey === 'holiday-settings' && lk === 'holiday')
      );
    });
    if (topMatchKey) {
      return hasAnyAccess(actualPerms[topMatchKey]);
    }

    // 2. Search in sub-modules (e.g. 'taskAll', 'teamTask', 'allEmployee', 'myTeam', 'attendanceDetails')
    for (const parentKey of Object.keys(actualPerms)) {
      const parentVal = actualPerms[parentKey];
      if (parentVal && typeof parentVal === 'object') {
        const subMatchKey = Object.keys(parentVal).find((k) => k.toLowerCase() === lowerKey);
        if (subMatchKey) {
          return hasAnyAccess(parentVal[subMatchKey]);
        }
      }
    }

    return false;
  };

  // Metadata mapping API permission keys to Routes, Icons, and Labels
  const MODULE_METADATA = {
    dashboard: { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon fontSize="small" /> },
    customer: { label: 'Customer', path: '/customers', icon: <BadgeIcon fontSize="small" /> },
    customers: { label: 'Customer', path: '/customers', icon: <BadgeIcon fontSize="small" /> },
    task: {
      label: 'Tasks',
      path: '/tasks/all',
      icon: <AssignmentIcon fontSize="small" />,
      subModules: {
        taskAll: { label: 'All Tasks', path: '/tasks/all' },
        teamTask: { label: 'Team Tasks', path: '/tasks/team' },
        taskCustomer: { label: 'Task Customer', path: '/tasks/task-customer' },
        deletedTasks: { label: 'Deleted Tasks', path: '/tasks/deleted' },
      },
    },
    employee: {
      label: 'Employee',
      path: '/employees',
      icon: <PeopleIcon fontSize="small" />,
      subModules: {
        allEmployee: { label: 'All Employee', path: '/employees' },
        myTeam: { label: 'My Team', path: '/employees/my-team' },
      },
    },
    location: {
      label: 'Location',
      path: '/states',
      icon: <LocationOnIcon fontSize="small" />,
      subModules: {
        state: { label: 'State', path: '/states' },
        region: { label: 'Region', path: '/regions' },
        branch: { label: 'Branch', path: '/branches' },
      },
    },
    attendance: {
      label: 'Attendance',
      path: '/attendance/details',
      icon: <HowToRegIcon fontSize="small" />,
      subModules: {
        attendanceDetails: { label: 'Attendance Details', path: '/attendance/details' },
        monthlyAttendance: { label: 'Monthly Attendance', path: '/attendance/monthly' },
      },
    },
    role: { label: 'Role & Permission Settings', path: '/roles', icon: <SecurityIcon fontSize="small" /> },
    roles: { label: 'Role & Permission Settings', path: '/roles', icon: <SecurityIcon fontSize="small" /> },
    admin: {
      label: 'Admin Panel',
      path: '/admin',
      disableDropdown: true,
      icon: <AdminPanelSettingsIcon fontSize="small" />,
      subModules: {
        role: { label: 'Role & Permission Settings', path: '/admin?tab=role' },
        tasktype: { label: 'Task Type', path: '/admin?tab=tasktype' },
        state: { label: 'State', path: '/admin?tab=state' },
        region: { label: 'Region', path: '/admin?tab=region' },
        branch: { label: 'Branch', path: '/admin?tab=branch' },
        office: { label: 'Office', path: '/admin?tab=office' },
        contacts: { label: 'Contacts', path: '/admin?tab=contacts' },
        department: { label: 'Department Settings', path: '/admin?tab=department' },
        designation: { label: 'Designation', path: '/admin?tab=designation' },
        reports: { label: 'Reports', path: '/reports' },
        leaveType: { label: 'Leave Types', path: '/admin?tab=leaveType' },
        leaveprofile: { label: 'Leave Profiles', path: '/admin?tab=leaveprofile' },
        leave: { label: 'Leave Settings', path: '/admin?tab=leave' },
        nonworking: { label: 'Non Working', path: '/admin?tab=nonworking' },
        holidays: { label: 'Holidays', path: '/admin?tab=holidays' },
        loanNos: { label: 'Loan Numbers', path: '/admin?tab=loanNos' },
      },
    },
    department: { label: 'Department Settings', path: '/office', icon: <BusinessIcon fontSize="small" /> },
    designation: { label: 'Designation', path: '/office', icon: <BusinessIcon fontSize="small" /> },
    branch: { label: 'Office Settings', path: '/branches', icon: <BusinessIcon fontSize="small" /> },
    office: { label: 'Office Settings', path: '/office', icon: <BusinessIcon fontSize="small" /> },
    leave: {
      label: 'Leave Management',
      path: '/leaves',
      icon: <HowToRegIcon fontSize="small" />,
      subModules: {
        leaveType: { label: 'Leave Types', path: '/leave-types' },
        leaveprofile: { label: 'Leave Profiles', path: '/leave-profiles' },
        leave: { label: 'Leave Settings', path: '/leaves' },
        nonworking: { label: 'Non Working', path: '/non-working-days' },
        holidays: { label: 'Holidays', path: '/holidays' },
      },
    },
    holiday: { label: 'Holiday Settings', path: '/holiday', icon: <HowToRegIcon fontSize="small" /> },
    feeds: { label: 'Feeds', path: '/feeds', icon: <RssFeedIcon fontSize="small" /> },
    reports: { label: 'Reports', path: '/reports', icon: <RssFeedIcon fontSize="small" /> },
    settings: { label: 'Settings', path: '/settings', icon: <AdminPanelSettingsIcon fontSize="small" /> },
    tasktype: { label: 'Task Type', path: '/task-types', icon: <AssignmentIcon fontSize="small" /> },
    tasktypesettings: { label: 'Task Type', path: '/task-types', icon: <AssignmentIcon fontSize="small" /> },
    contacts: { label: 'Contacts', path: '/contacts', icon: <ContactsIcon fontSize="small" /> },
    contact: { label: 'Contacts', path: '/contacts', icon: <ContactsIcon fontSize="small" /> },
  };

  // Dynamically build nav items directly from API permissions
  const navItems = useMemo(() => {
    const items = [
      { label: 'Home', path: '/home', hasDropdown: false, permissionKey: null, icon: <HomeIcon fontSize="small" /> },
    ];

    if (!permissions) return items;

    let actualPerms = permissions;
    while (actualPerms && actualPerms.permission && typeof actualPerms.permission === 'object') {
      actualPerms = actualPerms.permission;
    }

    if (actualPerms && typeof actualPerms === 'object') {
      actualPerms = sortPermissionsByModuleTree(actualPerms);
    }

    const formatLabel = (key) =>
      key
        .replace(/([A-Z])/g, ' $1')
        .replace(/[_-]/g, ' ')
        .replace(/^./, (str) => str.toUpperCase())
        .trim();

    const hasAccess = (node) => {
      if (!node) return false;
      if (typeof node === 'boolean') return node;
      if (typeof node === 'object') {
        return Object.values(node).some((v) => {
          if (typeof v === 'boolean') return v;
          if (typeof v === 'object' && v !== null) return hasAccess(v);
          return false;
        });
      }
      return false;
    };

    const addedPaths = new Set();

    Object.keys(actualPerms).forEach((apiKey) => {
      const nodePerm = actualPerms[apiKey];
      if (!hasAccess(nodePerm)) return;

      const lowerKey = apiKey.toLowerCase();
      const metaKey = Object.keys(MODULE_METADATA).find((k) => k.toLowerCase() === lowerKey);
      const meta = metaKey ? MODULE_METADATA[metaKey] : null;

      const itemPath = meta?.path || `/modules/${apiKey}`;
      if (addedPaths.has(itemPath)) return;
      addedPaths.add(itemPath);

      // Check if node contains sub-modules
      const isParentNode =
        nodePerm &&
        typeof nodePerm === 'object' &&
        !('add' in nodePerm || 'allView' in nodePerm || 'ownView' in nodePerm) &&
        !meta?.disableDropdown;

      if (isParentNode) {
        const activeSubItems = [];
        Object.keys(nodePerm).forEach((subKey) => {
          if (hasAccess(nodePerm[subKey])) {
            const subMeta =
              meta?.subModules?.[subKey] ||
              MODULE_METADATA[subKey] ||
              MODULE_METADATA[subKey.toLowerCase()];
            activeSubItems.push({
              label: subMeta?.label || formatLabel(subKey),
              path: subMeta?.path || `/modules/${apiKey}/${subKey}`,
              permissionKey: subKey,
            });
          }
        });

        if (activeSubItems.length > 0) {
          items.push({
            label: meta?.label || formatLabel(apiKey),
            path: meta?.path || activeSubItems[0]?.path || `/modules/${apiKey}`,
            hasDropdown: true,
            permissionKey: apiKey,
            icon: meta?.icon || null,
            dropdownItems: activeSubItems,
          });
        }
      } else {
        items.push({
          label: meta?.label || formatLabel(apiKey),
          path: itemPath,
          hasDropdown: false,
          permissionKey: apiKey,
          icon: meta?.icon || null,
        });
      }
    });

    return items;
  }, [permissions]);

  const [maxVisibleCount, setMaxVisibleCount] = useState(() => {
    if (typeof window === 'undefined') return 10;
    const w = window.innerWidth;
    if (w >= 1600) return 12;
    if (w >= 1400) return 10;
    if (w >= 1200) return 8;
    if (w >= 1024) return 7;
    if (w >= 768) return 5;
    return 4;
  });

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w >= 1600) setMaxVisibleCount(12);
      else if (w >= 1400) setMaxVisibleCount(10);
      else if (w >= 1200) setMaxVisibleCount(8);
      else if (w >= 1024) setMaxVisibleCount(7);
      else if (w >= 768) setMaxVisibleCount(5);
      else setMaxVisibleCount(4);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const visibleNavItems = useMemo(() => {
    if (!navItems || navItems.length === 0) return [];

    const activeIndex = navItems.findIndex((item) => {
      if (item.label === activeTab) return true;
      if (item.path === location.pathname) return true;
      if (item.dropdownItems?.some((sub) => sub.label === activeTab || sub.path === location.pathname || (sub.path !== '/home' && location.pathname.startsWith(sub.path)))) return true;
      return false;
    });

    if (activeIndex < 0 || activeIndex < maxVisibleCount) {
      return navItems;
    }

    const reordered = [...navItems];
    const [activeItem] = reordered.splice(activeIndex, 1);
    reordered.splice(1, 0, activeItem);
    return reordered;
  }, [navItems, activeTab, location.pathname, maxVisibleCount]);

  const primaryNavItems = visibleNavItems.slice(0, maxVisibleCount);
  const extraNavItems = visibleNavItems.slice(maxVisibleCount);

  const userInitial = user?.name ? user.name.trim().charAt(0).toUpperCase() : 'U';
  const userAvatarSrc = (!avatarImgError && (user?.thumbnail || user?.image)) ? (user?.thumbnail || user?.image) : null;

  return (
    <>
      {/* Pinned Sticky Header */}
      <header
        className={`sticky top-0 z-50 w-full px-3 sm:px-5 py-2 flex items-center justify-between transition-colors duration-200 border-b backdrop-blur-md ${
          isDark
            ? 'bg-slate-900/95 border-slate-800 text-white shadow-md'
            : 'bg-white/95 border-slate-200 text-slate-800 shadow-sm'
        }`}
      >
        {/* Left side: Brand Logo & Hamburger Menu */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Brand Logo Icon */}
          <div
            onClick={() => navigate('/home')}
            className="relative flex items-center justify-center cursor-pointer group transition-transform hover:scale-105"
          >
            <img src="/favicon.svg" alt="Logo" className="w-11 h-11 object-contain" />
          </div>

          {/* Hamburger menu icon */}
          <IconButton
            size="small"
            aria-label="open drawer"
            onClick={() => setMobileDrawerOpen(true)}
            sx={{
              color: isDark ? '#cbd5e1' : '#334155',
              '&:hover': { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)' },
            }}
          >
            <MenuIcon sx={{ fontSize: 24 }} />
          </IconButton>
        </div>

        {/* Navigation menu list - Desktop Horizontal Bar */}
        <nav
          className="flex items-center gap-1 sm:gap-2 lg:gap-3 mx-2 py-1 flex-1 min-w-0 flex-nowrap overflow-hidden no-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {primaryNavItems.map((item) => {
            const activeSubItem = item.dropdownItems?.find(
              (sub) =>
                sub.label === activeTab ||
                sub.path === location.pathname ||
                (sub.path !== '/home' && location.pathname.startsWith(sub.path))
            );
            const isActive =
              activeTab === item.label ||
              Boolean(activeSubItem) ||
              (item.path !== '/home' && location.pathname.startsWith(item.path));
            const displayLabel = activeSubItem ? activeSubItem.label : item.label;

            return (
              <div key={item.label} className="relative flex-shrink-0">
                <button
                  onClick={(e) => handleTabClick(e, item)}
                  className={`flex items-center gap-0.5 px-2.5 py-1.5 text-xs font-medium transition-all duration-150 cursor-pointer select-none whitespace-nowrap rounded-md ${
                    isActive
                      ? isDark
                        ? 'text-blue-400 font-bold bg-blue-950/40'
                        : 'text-blue-600 font-bold bg-blue-50/80'
                      : isDark
                      ? 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/60'
                  }`}
                >
                  <span>{displayLabel}</span>
                  {item.hasDropdown && (
                    <KeyboardArrowDownIcon
                      sx={{
                        fontSize: 16,
                        color: isActive
                          ? isDark
                            ? '#60a5fa'
                            : '#2563eb'
                          : isDark
                          ? '#94a3b8'
                          : '#64748b',
                      }}
                    />
                  )}
                </button>
                {/* Active Tab Blue Underline */}
                {isActive && (
                  <div
                    className={`absolute bottom-0 left-1 right-1 h-[2.5px] rounded-t-sm ${
                      isDark ? 'bg-blue-400' : 'bg-blue-600'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </nav>

        {/* Right side controls: 3-dots menu, Punch status, Manager role badge & User avatar */}
        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
          {/* 3 Dots Extra Nav Items Menu Button */}
          {extraNavItems.length > 0 && (
            <div className="relative">
              <Tooltip title="More Modules">
                <IconButton
                  onClick={(e) => setMoreMenuAnchorEl(e.currentTarget)}
                  size="small"
                  sx={{
                    color: extraNavItems.some((i) => i.label === activeTab)
                      ? (isDark ? '#60a5fa' : '#2563eb')
                      : (isDark ? '#cbd5e1' : '#475569'),
                    backgroundColor: extraNavItems.some((i) => i.label === activeTab)
                      ? (isDark ? 'rgba(96, 165, 250, 0.15)' : 'rgba(37, 99, 235, 0.08)')
                      : (isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'),
                    border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #cbd5e1',
                    borderRadius: '8px',
                    p: 0.8,
                    '&:hover': {
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.06)',
                    },
                  }}
                >
                  <MoreHorizIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              {/* Extra Nav Items Dropdown Menu */}
              <Menu
                anchorEl={moreMenuAnchorEl}
                open={Boolean(moreMenuAnchorEl)}
                onClose={() => setMoreMenuAnchorEl(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                slotProps={{
                  paper: {
                    sx: {
                      borderRadius: '12px',
                      mt: 1,
                      minWidth: 190,
                      backgroundColor: isDark ? '#1e293b' : '#ffffff',
                      color: isDark ? '#f8fafc' : '#0f172a',
                      border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
                      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
                    },
                  },
                  list: {
                    sx: {
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      padding: '6px',
                    },
                  },
                }}
              >
                {extraNavItems.map((item) => {
                  const isActive = activeTab === item.label;
                  if (item.hasDropdown && item.dropdownItems && item.dropdownItems.length > 0) {
                    return (
                      <React.Fragment key={item.label}>
                        <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-t first:border-t-0 border-slate-200 dark:border-slate-800 mt-1 first:mt-0">
                          {item.label}
                        </div>
                        {item.dropdownItems.map((sub) => {
                          const isSubActive = location.pathname === sub.path;
                          return (
                            <MenuItem
                              key={sub.label}
                              selected={isSubActive}
                              onClick={() => {
                                setMoreMenuAnchorEl(null);
                                setActiveTab(item.label);
                                if (sub.path) navigate(sub.path);
                              }}
                              sx={{
                                fontSize: '0.825rem',
                                pl: 3,
                                borderRadius: '8px',
                                fontWeight: isSubActive ? 700 : 500,
                                color: isSubActive ? (isDark ? '#60a5fa' : '#2563eb') : 'inherit',
                                py: 0.75,
                                '&.Mui-selected': {
                                  backgroundColor: isDark ? 'rgba(59, 130, 246, 0.25)' : 'rgba(37, 99, 235, 0.12)',
                                  '&:hover': {
                                    backgroundColor: isDark ? 'rgba(59, 130, 246, 0.35)' : 'rgba(37, 99, 235, 0.18)',
                                  },
                                },
                              }}
                            >
                              <ListItemText
                                primary={sub.label}
                                primaryTypographyProps={{ fontSize: '0.825rem', fontWeight: isSubActive ? 700 : 500 }}
                              />
                              {isSubActive && <CheckCircleIcon sx={{ fontSize: 14, ml: 1, color: isDark ? '#60a5fa' : '#2563eb' }} />}
                            </MenuItem>
                          );
                        })}
                      </React.Fragment>
                    );
                  }

                  return (
                    <MenuItem
                      key={item.label}
                      selected={isActive}
                      onClick={() => {
                        setMoreMenuAnchorEl(null);
                        setActiveTab(item.label);
                        if (item.path) navigate(item.path);
                      }}
                      sx={{
                        fontSize: '0.825rem',
                        borderRadius: '8px',
                        fontWeight: isActive ? 700 : 500,
                        color: isActive ? (isDark ? '#60a5fa' : '#2563eb') : 'inherit',
                        py: 1,
                        px: 2,
                        '&.Mui-selected': {
                          backgroundColor: isDark ? 'rgba(59, 130, 246, 0.25)' : 'rgba(37, 99, 235, 0.12)',
                          '&:hover': {
                            backgroundColor: isDark ? 'rgba(59, 130, 246, 0.35)' : 'rgba(37, 99, 235, 0.18)',
                          },
                        },
                      }}
                    >
                      <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: '0.825rem', fontWeight: isActive ? 700 : 500 }} />
                    </MenuItem>
                  );
                })}
              </Menu>
            </div>
          )}

          {/* Disabled Punch In / Punched Out Attendance Status Badge */}
          <Tooltip title="Punch action is disabled">
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border select-none opacity-60 cursor-not-allowed ${
                isPunchedIn
                  ? isDark
                    ? 'bg-emerald-950/50 border-emerald-800/80 text-emerald-300'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : isDark
                    ? 'bg-slate-800/80 border-slate-700 text-slate-300'
                    : 'bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              <div className="relative flex items-center justify-center shrink-0">
                <FingerprintIcon
                  sx={{
                    fontSize: 22,
                    color: isPunchedIn ? '#10b981' : isDark ? '#cbd5e1' : '#475569',
                  }}
                />
                <div className="absolute -top-0.5 -right-0.5 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center p-[0.5px]">
                  {isPunchedIn ? (
                    <CheckCircleIcon sx={{ fontSize: 11, color: '#10b981' }} />
                  ) : (
                    <CancelIcon sx={{ fontSize: 11, color: '#ef4444' }} />
                  )}
                </div>
              </div>
              <div className="text-left leading-tight hidden sm:block">
                <p className="text-[11px] font-bold tracking-tight">
                  {isPunchedIn ? 'Punched In' : 'Punched Out'}
                </p>
                <p className="text-[10px] opacity-75 font-mono">
                  {formatPunchTime(punchSeconds)}
                </p>
              </div>
            </div>
          </Tooltip>
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border select-none ${
              isDark
                ? 'bg-blue-950/40 border-blue-800/80 text-blue-300'
                : 'bg-blue-50 border-blue-200 text-blue-700'
            }`}
          >
            <EngineeringIcon sx={{ fontSize: 18, color: isDark ? '#60a5fa' : '#2563eb' }} />
            <span className="text-xs font-bold whitespace-nowrap">
              {roleInfo?.name || 'Admin'}
            </span>
          </div>
       
          
          {/* User Initial Avatar Circle */}
          <Tooltip title={user?.name || 'User Profile'}>
            <button
              onClick={(e) => setAnchorEl(e.currentTarget)}
              className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center shadow-xs cursor-pointer transition-transform active:scale-95 focus:outline-none shrink-0 overflow-hidden"
            >
              {userAvatarSrc ? (
                <img
                  src={userAvatarSrc}
                  alt={user?.name || 'User'}
                  className="w-full h-full object-cover"
                  onError={() => setAvatarImgError(true)}
                />
              ) : (
                userInitial
              )}
            </button>
          </Tooltip>

          {/* User Profile & Settings Menu Dropdown */}
          <Menu
            anchorEl={anchorEl}
            open={isMenuOpen}
            onClose={() => setAnchorEl(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            slotProps={{
              paper: {
                elevation: 4,
                sx: {
                  borderRadius: '14px',
                  mt: 1.5,
                  minWidth: 280,
                  maxWidth: 320,
                  padding: '6px',
                  backgroundColor: isDark ? '#1e293b' : '#ffffff',
                  color: isDark ? '#ffffff' : '#0f172a',
                  border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                },
              },
              list: {
                sx: {
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  padding: '6px',
                },
              },
            }}
          >
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 mb-1.5 border border-slate-100 dark:border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  {userAvatarSrc ? (
                    <img
                      src={userAvatarSrc}
                      alt={user?.name || 'User'}
                      className="w-12 h-12 rounded-full object-cover border-2 border-blue-500/40 shadow-xs"
                      onError={() => setAvatarImgError(true)}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-bold text-lg flex items-center justify-center shadow-xs">
                      {userInitial}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {user?.name || 'Administrator'}
                  </p>
                  <p className={`text-xs truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {user?.email || 'admin@company.com'}
                  </p>
                  {user?.emp_id && (
                    <span className="inline-block mt-0.5 px-1.5 py-0.2 text-[10px] font-semibold rounded bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                      {user.emp_id}
                    </span>
                  )}
                </div>
              </div>

              {/* User Profile Summary Card */}
              <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-700/60 text-xs space-y-1">
                {(user?.designations || user?.designation) && (
                  <div className="flex justify-between items-center gap-2">
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Designation:</span>
                    <span className={`font-semibold truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      {user.designations || user.designation}
                    </span>
                  </div>
                )}
                {user?.department && (
                  <div className="flex justify-between items-center gap-2">
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Department:</span>
                    <span className={`font-semibold truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      {user.department}
                    </span>
                  </div>
                )}
                {user?.work_shift && (
                  <div className="flex justify-between items-center gap-2">
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Shift:</span>
                    <span className={`font-semibold truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      {user.work_shift}
                    </span>
                  </div>
                )}
                {user?.mobile && (
                  <div className="flex justify-between items-center gap-2">
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Mobile:</span>
                    <span className={`font-semibold truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      {(user?.mobileCountryCode || user?.country_code || '') + ' ' + user.mobile}
                    </span>
                  </div>
                )}
                {user?.gender && (
                  <div className="flex justify-between items-center gap-2">
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Gender:</span>
                    <span className={`font-semibold capitalize truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      {user.gender}
                    </span>
                  </div>
                )}
                {user?.date_of_joining && (
                  <div className="flex justify-between items-center gap-2">
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Joined:</span>
                    <span className={`font-semibold truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      {new Date(user.date_of_joining).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                )}
                {user?.address && (
                  <div className="flex justify-between items-start gap-2 pt-0.5">
                    <span className={`shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Address:</span>
                    <span className={`font-semibold text-right line-clamp-2 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      {user.address}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <Divider sx={{ my: 0.5, borderColor: isDark ? '#334155' : '#f1f5f9' }} />

            <MenuItem
              onClick={() => {
                toggleTheme();
                setAnchorEl(null);
              }}
              sx={{ borderRadius: '8px', py: 1 }}
            >
              <ListItemIcon sx={{ color: isDark ? '#f59e0b' : '#0f172a' }}>
                {isDark ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
              </ListItemIcon>
              <ListItemText primary={isDark ? 'Light Mode' : 'Dark Mode'} />
            </MenuItem>


            {logout && (
              <MenuItem
                onClick={() => {
                  setAnchorEl(null);
                  logout();
                }}
                sx={{
                  borderRadius: '8px',
                  py: 1,
                  color: isDark ? '#f87171' : '#dc2626',
                  '&:hover': {
                    backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(220, 38, 38, 0.08)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'inherit' }}>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </MenuItem>
            )}
          </Menu>

          {/* Nav Items Submenu Dropdown - Positioned directly beneath anchor */}
          <Menu
            anchorEl={navDropdownAnchorEl}
            open={Boolean(navDropdownAnchorEl)}
            onClose={() => setNavDropdownAnchorEl(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            slotProps={{
              paper: {
                elevation: 4,
                sx: {
                  borderRadius: '12px',
                  mt: 1,
                  minWidth: 180,
                  padding: '6px',
                  backgroundColor: isDark ? '#1e293b' : '#ffffff',
                  color: isDark ? '#ffffff' : '#0f172a',
                  border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                  boxShadow: isDark
                    ? '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
                    : '0 10px 25px -5px rgba(0, 0, 0, 0.12)',
                },
              },
              list: {
                sx: {
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  padding: '4px',
                },
              },
            }}
          >
            {activeDropdownNav?.dropdownItems?.map((subItem) => {
              const isSubActive =
                activeTab === subItem.label ||
                location.pathname === subItem.path ||
                (subItem.path !== '/home' && location.pathname.startsWith(subItem.path));
              return (
                <MenuItem
                  key={subItem.label}
                  selected={isSubActive}
                  onClick={() => {
                    setNavDropdownAnchorEl(null);
                    setActiveTab(subItem.label);
                    if (subItem.path) {
                      navigate(subItem.path);
                    }
                  }}
                  sx={{
                    borderRadius: '8px',
                    py: 1,
                    px: 2,
                    fontWeight: isSubActive ? 700 : 500,
                    backgroundColor: isSubActive
                      ? isDark ? 'rgba(59, 130, 246, 0.25)' : 'rgba(37, 99, 235, 0.12)'
                      : 'transparent',
                    color: isSubActive
                      ? isDark ? '#60a5fa' : '#2563eb'
                      : isDark ? '#e2e8f0' : '#334155',
                    '&.Mui-selected': {
                      backgroundColor: isDark ? 'rgba(59, 130, 246, 0.25)' : 'rgba(37, 99, 235, 0.12)',
                      '&:hover': {
                        backgroundColor: isDark ? 'rgba(59, 130, 246, 0.35)' : 'rgba(37, 99, 235, 0.18)',
                      },
                    },
                    '&:hover': {
                      backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(37, 99, 235, 0.08)',
                    },
                  }}
                >
                  <ListItemText
                    primary={subItem.label}
                    primaryTypographyProps={{
                      fontSize: '13px',
                      fontWeight: isSubActive ? 700 : 500,
                      color: 'inherit',
                    }}
                  />
                  {isSubActive && <CheckCircleIcon sx={{ fontSize: 14, ml: 1, color: isDark ? '#60a5fa' : '#2563eb' }} />}
                </MenuItem>
              );
            })}
          </Menu>
        </div>
      </header>

      {/* Mobile Drawer Navigation Sidebar */}
      <Drawer
        anchor="left"
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        slotProps={{
          paper: {
            sx: {
              width: 290,
              backgroundColor: isDark ? '#0f172a' : '#ffffff',
              color: isDark ? '#f8fafc' : '#0f172a',
              borderRight: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
              display: 'flex',
              flexDirection: 'column',
            },
          },
        }}
      >
        {/* Drawer Header Banner */}
        <div className="p-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <img src="/favicon.svg" alt="Logo" className="w-9 h-9 object-contain" />
            <div>
              <h2 className="text-sm font-extrabold leading-tight">Employee Portal</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Navigation Menu</p>
            </div>
          </div>
          <IconButton onClick={() => setMobileDrawerOpen(false)} size="small">
            <CloseIcon fontSize="small" sx={{ color: isDark ? '#cbd5e1' : '#475569' }} />
          </IconButton>
        </div>

        {/* User Card inside Drawer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <Avatar sx={{ bgcolor: '#2563eb', width: 38, height: 38, fontWeight: 'bold' }}>
            {userInitial}
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold truncate">{user?.name || 'Administrator'}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user?.email || 'admin@company.com'}</p>
          </div>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {visibleNavItems.map((item) => {
            const isActive = activeTab === item.label;
            const hasSub = item.hasDropdown && item.dropdownItems && item.dropdownItems.length > 0;
            const isExpanded = Boolean(mobileExpandedItems[item.label]);

            return (
              <div key={item.label} className="w-full">
                <button
                  onClick={(e) => {
                    if (hasSub) {
                      handleMobileToggleExpand(item.label);
                    } else {
                      setMobileDrawerOpen(false);
                      handleTabClick(e, item);
                    }
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                    isActive
                      ? isDark
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                        : 'bg-blue-50 text-blue-600 border border-blue-200'
                      : isDark
                        ? 'text-slate-300 hover:bg-slate-800/60'
                        : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon ? (
                      <span className={isActive ? 'text-blue-500' : 'text-slate-400'}>{item.icon}</span>
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    )}
                    <span>{item.label}</span>
                  </div>
                  {hasSub && (
                    <span>
                      {isExpanded ? (
                        <ExpandLessIcon sx={{ fontSize: 18, opacity: 0.7 }} />
                      ) : (
                        <ExpandMoreIcon sx={{ fontSize: 18, opacity: 0.7 }} />
                      )}
                    </span>
                  )}
                </button>

                {/* Submenu Accordion for Mobile */}
                {hasSub && (
                  <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                    <div className="pl-6 pr-2 py-1 space-y-1">
                      {item.dropdownItems.map((subItem) => (
                        <button
                          key={subItem.label}
                          onClick={() => {
                            setMobileDrawerOpen(false);
                            setActiveTab(item.label);
                            if (subItem.path) {
                              navigate(subItem.path);
                            }
                          }}
                          className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            isDark
                              ? 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                          }`}
                        >
                          {subItem.label}
                        </button>
                      ))}
                    </div>
                  </Collapse>
                )}
              </div>
            );
          })}
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <button
            onClick={() => {
              toggleTheme();
              setMobileDrawerOpen(false);
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200"
          >
            <span>{isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</span>
            {isDark ? <LightModeIcon fontSize="small" sx={{ color: '#f59e0b' }} /> : <DarkModeIcon fontSize="small" />}
          </button>

          {logout && (
            <button
              onClick={() => {
                setMobileDrawerOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
            >
              <LogoutIcon fontSize="small" />
              <span>Logout</span>
            </button>
          )}
        </div>
      </Drawer>

      {/* Account Profile Details Dialog */}
      <Dialog
        open={profileDialogOpen}
        onClose={() => setProfileDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            backgroundColor: isDark ? '#1e293b' : '#ffffff',
            color: isDark ? '#ffffff' : '#0f172a',
          },
        }}
      >
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${isDark ? '#334155' : '#e2e8f0'}` }}>
          <div className="flex items-center gap-2 font-bold text-lg">
            <PersonIcon sx={{ color: '#3b82f6' }} />
            <span>Account Profile</span>
          </div>
          <IconButton onClick={() => setProfileDialogOpen(false)} size="small" sx={{ color: isDark ? '#94a3b8' : '#64748b' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: isDark ? '#334155' : '#e2e8f0', p: 3 }}>
          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 mb-6 border border-slate-200 dark:border-slate-700">
            {userAvatarSrc ? (
              <img
                src={userAvatarSrc}
                alt={user?.name || 'User'}
                className="w-20 h-20 rounded-full object-cover border-4 border-blue-500/20 shadow-md"
                onError={() => setAvatarImgError(true)}
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-2xl flex items-center justify-center shadow-md">
                {userInitial}
              </div>
            )}
            <div className="text-center sm:text-left flex-1">
              <h3 className="text-xl font-bold">{user?.name || 'Administrator'}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email || 'admin@company.com'}</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                {user?.emp_id && (
                  <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                    ID: {user.emp_id}
                  </span>
                )}
                {(user?.designations || user?.designation) && (
                  <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
                    {user.designations || user.designation}
                  </span>
                )}
                {user?.department && (
                  <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                    {user.department}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Full Name</p>
              <p className="font-semibold text-sm">{user?.name || 'N/A'}</p>
            </div>
            <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Email Address</p>
              <p className="font-semibold text-sm truncate">{user?.email || 'N/A'}</p>
            </div>
            <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Designation</p>
              <p className="font-semibold text-sm">{user?.designations || user?.designation || 'N/A'}</p>
            </div>
            <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Department</p>
              <p className="font-semibold text-sm">{user?.department || 'N/A'}</p>
            </div>
            <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Mobile Number</p>
              <p className="font-semibold text-sm">
                {user?.mobile ? `${user?.mobileCountryCode || user?.country_code || ''} ${user.mobile}` : 'N/A'}
              </p>
            </div>
            <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Gender</p>
              <p className="font-semibold text-sm capitalize">{user?.gender || 'N/A'}</p>
            </div>
            <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Work Shift</p>
              <p className="font-semibold text-sm">{user?.work_shift || 'N/A'}</p>
            </div>
            <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Date of Joining</p>
              <p className="font-semibold text-sm">
                {user?.date_of_joining
                  ? new Date(user.date_of_joining).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                  : 'N/A'}
              </p>
            </div>
            <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 sm:col-span-2">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Address</p>
              <p className="font-semibold text-sm">{user?.address || 'N/A'}</p>
            </div>
          </div>
        </DialogContent>
        <DialogActions sx={{ borderTop: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, p: 2 }}>
          <Button onClick={() => setProfileDialogOpen(false)} variant="contained" color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

