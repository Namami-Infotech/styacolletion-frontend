import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import { useThemeMode } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

// Icons
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RefreshIcon from '@mui/icons-material/Refresh';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import BusinessIcon from '@mui/icons-material/Business';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EmailIcon from '@mui/icons-material/Email';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import ExtensionIcon from '@mui/icons-material/Extension';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import DynamicFormIcon from '@mui/icons-material/DynamicForm';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import AltRouteIcon from '@mui/icons-material/AltRoute';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import ChatIcon from '@mui/icons-material/Chat';
import DescriptionIcon from '@mui/icons-material/Description';
import AssignmentIcon from '@mui/icons-material/Assignment';
import MapIcon from '@mui/icons-material/Map';
import ExploreIcon from '@mui/icons-material/Explore';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SecurityIcon from '@mui/icons-material/Security';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import BadgeIcon from '@mui/icons-material/Badge';
import HowToRegIcon from '@mui/icons-material/HowToReg';

// Views
import OrganizationDetailsView from '../../views/admin/OrganizationDetailsView';
import GenericAdminSectionView from '../../views/admin/GenericAdminSectionView';
import TaskTypeTable from '../../views/tasks/taskType.Table';
import StatePage from '../location/state.Page';
import RegionPage from '../location/region.Page';
import BranchPage from '../location/branch.Page';
import RolesPage from '../roles/RolesPage';
import OfficePage from '../office/OfficePage';
import TaskTypePage from '../tasks/taskTypePage';

export default function AdminPage() {
  const { isDark } = useThemeMode();
  const { permissions } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchTerm, setSearchTerm] = useState('');
  const [expandedGroups, setExpandedGroups] = useState({});

  // Helper function to check if user has access to a module from API permissions
  const checkModuleAccess = useCallback(
    (itemKey, parentKey = null) => {
      if (!permissions) return true;

      let actualPerms = permissions;
      while (actualPerms && actualPerms.permission && typeof actualPerms.permission === 'object') {
        actualPerms = actualPerms.permission;
      }

      if (!actualPerms || typeof actualPerms !== 'object') return true;

      if (itemKey === 'organizationDetails') return true; // Always visible as main overview

      const adminPerms = actualPerms.admin || actualPerms;

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

      if (parentKey === 'leavesettings' || ['leaveType', 'leaveprofile', 'leave', 'nonworking', 'holidays'].includes(itemKey)) {
        const nestedNode = adminPerms.leavesettings?.[itemKey] || adminPerms[itemKey] || actualPerms[itemKey];
        return hasAccess(nestedNode);
      }

      if (itemKey === 'leavesettings') {
        const groupNode = adminPerms.leavesettings || actualPerms.leavesettings;
        return hasAccess(groupNode);
      }

      const node = adminPerms[itemKey] || actualPerms[itemKey];
      return hasAccess(node);
    },
    [permissions]
  );

  // Sidebar Menu Items Definition
  const ADMIN_SIDEBAR_MENU = useMemo(
    () => [
      { key: 'role', name: 'Roles & Permissions', icon: SecurityIcon, description: 'Manage role access rights, permissions, and security matrices' },
      { key: 'tasktype', name: 'Task Types', icon: AssignmentIcon, description: 'Manage task category types and settings' },
      { key: 'state', name: 'State', icon: MapIcon, description: 'Manage state regions, status configurations, and coverage details' },
      { key: 'region', name: 'Region', icon: ExploreIcon, description: 'Manage geographical regions and territory boundaries' },
      { key: 'branch', name: 'Branch', icon: LocationOnIcon, description: 'Manage office branches and location details' },
      { key: 'department', name: 'Department Settings', icon: BusinessCenterIcon, description: 'Manage department settings and organizational structure' },
      { key: 'designation', name: 'Designation', icon: BadgeIcon, description: 'Manage employee designations and job titles' },
      {
        key: 'leavesettings',
        name: 'Leave Settings',
        icon: EventBusyIcon,
        description: 'Manage leave types, profiles, settings, and holiday calendar',
        subItems: [
          { key: 'leaveType', name: 'Leave Types', icon: HowToRegIcon, description: 'Manage leave category types and rules' },
          { key: 'leaveprofile', name: 'Leave Profiles', icon: HowToRegIcon, description: 'Manage leave profiles and allocations' },
          { key: 'leave', name: 'Leave Settings', icon: HowToRegIcon, description: 'Manage general leave settings and configurations' },
          { key: 'nonworking', name: 'Non Working', icon: EventBusyIcon, description: 'Manage non-working days and weekend settings' },
          { key: 'holidays', name: 'Holidays', icon: EventBusyIcon, description: 'Manage company holiday calendar and dates' },
        ],
      },
      {
        key: 'employeeSetup',
        name: "Employee's Setup",
        icon: GroupAddIcon,
        description: "Manage employee setup, roles, and custom field configurations",
        subItems: [
          { key: 'employeeRoles', name: 'Employee Roles', icon: SecurityIcon, description: 'Manage employee roles and permissions' },
          { key: 'employeeFields', name: 'Custom Fields', icon: DescriptionIcon, description: 'Manage custom employee profile fields' },
        ],
      },
      { key: 'shifts', name: 'Working Shifts', icon: AccessTimeIcon, description: 'Manage working shift schedules and timings' },
      { key: 'emailTemplates', name: 'Email templates', icon: EmailIcon, description: 'Manage and customize automated email templates' },
      { key: 'emailAudit', name: 'Email Audit', icon: MarkEmailReadIcon, description: 'Audit and track system email logs' },
      { key: 'integrations', name: 'Integrations', icon: ExtensionIcon, description: 'Configure third-party application integrations' },
      { key: 'exports', name: 'Exports', icon: FileUploadIcon, description: 'Manage system data exports and downloads' },
      { key: 'forms', name: 'Forms', icon: DynamicFormIcon, description: 'Configure dynamic forms and survey templates' },
      { key: 'tags', name: 'Tags', icon: LocalOfferIcon, description: 'Manage system tags and category labels' },
      { key: 'process', name: 'Process', icon: AccountTreeIcon, description: 'Configure business processes and operational flows' },
      { key: 'workflows', name: 'Workflows', icon: AltRouteIcon, description: 'Manage automated system workflows' },
      { key: 'notifications', name: 'Notifications', icon: NotificationsIcon, description: 'Configure notification alerts and settings' },
      { key: 'attendancePolicies', name: 'Attendance Policies', icon: AssignmentTurnedInIcon, description: 'Manage attendance rules and policy settings' },
      { key: 'communication', name: 'Communication Channel', icon: ChatIcon, description: 'Configure communication channels and notifications' },
      { key: 'documents', name: 'Document Types', icon: DescriptionIcon, description: 'Manage document categories and guidelines' },
    ],
    []
  );

  // Active section state
  const [activeSectionKey, setActiveSectionKey] = useState('');

  // Filter sidebar items dynamically based on API permissions and search term
  const filteredSidebarMenu = useMemo(() => {
    // 1. Filter by permissions first
    const permittedMenu = ADMIN_SIDEBAR_MENU.map((item) => {
      if (item.subItems) {
        const allowedSubs = item.subItems.filter((sub) => checkModuleAccess(sub.key, item.key));
        if (allowedSubs.length > 0) {
          return { ...item, subItems: allowedSubs };
        }
        return null;
      }
      if (checkModuleAccess(item.key)) {
        return item;
      }
      return null;
    }).filter(Boolean);

    // 2. Filter by search term if typed
    if (!searchTerm.trim()) return permittedMenu;
    const lower = searchTerm.toLowerCase();

    return permittedMenu.map((item) => {
      const matchParent = item.name.toLowerCase().includes(lower);
      const matchedSubs = item.subItems?.filter((s) => s.name.toLowerCase().includes(lower));

      if (matchParent || (matchedSubs && matchedSubs.length > 0)) {
        return {
          ...item,
          subItems: matchParent ? item.subItems : matchedSubs,
        };
      }
      return null;
    }).filter(Boolean);
  }, [searchTerm, ADMIN_SIDEBAR_MENU, checkModuleAccess]);

  // Sync active section from URL query or path
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam) {
      setActiveSectionKey(tabParam);
    } else {
      const path = location.pathname.toLowerCase();
      if (path.includes('task-types')) setActiveSectionKey('tasktype');
      else if (path.includes('states')) setActiveSectionKey('state');
      else if (path.includes('regions')) setActiveSectionKey('region');
      else if (path.includes('branches')) setActiveSectionKey('branch');
      else if (path.includes('roles')) setActiveSectionKey('role');
      else if (path.includes('office')) setActiveSectionKey('department');
      else if (path.includes('leave-types')) setActiveSectionKey('leaveType');
      else if (path.includes('leave-profiles')) setActiveSectionKey('leaveprofile');
      else if (path.includes('leaves')) setActiveSectionKey('leave');
      else if (path.includes('non-working-days')) setActiveSectionKey('nonworking');
      else if (path.includes('holidays')) setActiveSectionKey('holidays');
      else if (filteredSidebarMenu.length > 0) {
        const firstItem = filteredSidebarMenu[0];
        const firstKey = firstItem.subItems && firstItem.subItems.length > 0 ? firstItem.subItems[0].key : firstItem.key;
        setActiveSectionKey(firstKey);
      }
    }
  }, [location, filteredSidebarMenu]);

  // Find active item metadata
  const activeItem = useMemo(() => {
    for (const item of filteredSidebarMenu) {
      if (item.key === activeSectionKey) return item;
      if (item.subItems) {
        const sub = item.subItems.find((s) => s.key === activeSectionKey);
        if (sub) return sub;
      }
    }
    return filteredSidebarMenu[0] || ADMIN_SIDEBAR_MENU[0];
  }, [activeSectionKey, filteredSidebarMenu, ADMIN_SIDEBAR_MENU]);

  const toggleGroup = (key) => {
    setExpandedGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelectSection = (key) => {
    setActiveSectionKey(key);
    navigate(`/admin?tab=${key}`);
  };

  const getAddButtonLabel = useCallback((key, item) => {
    switch (key) {
      case 'tasktype':
        return 'Add Task Type';
      case 'state':
        return 'Add State';
      case 'region':
        return 'Add Region';
      case 'branch':
        return 'Add Branch';
      case 'role':
        return 'Add Role';
      case 'department':
        return 'Add Department';
      case 'designation':
        return 'Add Designation';
      case 'leaveType':
        return 'Add Leave Type';
      case 'leaveprofile':
        return 'Add Leave Profile';
      case 'holidays':
        return 'Add Holiday';
      default:
        if (item?.name) {
          const singular = item.name.replace(/s$/, '').replace(/Settings|Management/, '').trim();
          return `Add ${singular || item.name}`;
        }
        return 'Add';
    }
  }, []);

  const handleAdminAddClick = () => {
    window.dispatchEvent(new CustomEvent('admin-open-create-modal', { detail: { section: activeSectionKey } }));
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'}`}>
      <Navbar />

      {/* Admin Outer Container */}
      <div className="flex-1 px-4 md:px-6 py-4 md:py-5 flex flex-col w-full">
        {/* Top Header Card */}
        <div
          className={`p-4 rounded-xl border shadow-xs mb-4 flex items-center justify-between transition-colors ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/10 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-500/20">
              {React.createElement(activeItem?.icon || AdminPanelSettingsIcon, { fontSize: 'medium' })}
            </div>
            <div>
              <h1 className={`text-base sm:text-lg font-extrabold leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {activeItem?.name ? (activeItem.name.toLowerCase().includes('management') || activeItem.name.toLowerCase().includes('details') || activeItem.name.toLowerCase().includes('settings') || activeItem.name.toLowerCase().includes('setup') ? activeItem.name : `${activeItem.name} Management`) : 'Admin Management'}
              </h1>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} font-medium`}>
                {activeItem?.description || `Manage and configure ${activeItem?.name || 'settings'} configurations, status, and details`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAdminAddClick}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white cursor-pointer shadow-sm transition-all duration-150 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95"
            >
              <AddIcon sx={{ fontSize: 16 }} />
              <span>{getAddButtonLabel(activeSectionKey, activeItem)}</span>
            </button>

            <button
              onClick={() => navigate(-1)}
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
              title="Go Back"
            >
              <ArrowBackIcon fontSize="small" />
            </button>
            <button
              onClick={() => window.location.reload()}
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
              title="Refresh"
            >
              <RefreshIcon fontSize="small" />
            </button>
          </div>
        </div>

        {/* Sidebar + Main Content Grid Layout */}
        <div className="flex-1 flex flex-col md:flex-row gap-4 items-start min-h-0">
          {/* Left Sidebar Menu */}
          <div
            className={`w-full md:w-64 shrink-0 rounded-xl border shadow-xs p-3 flex flex-col transition-colors ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            {/* Search Input Box */}
            <div className="relative mb-3">
              <input
                type="text"
                placeholder="Search here..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border transition-colors outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-400'
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                }`}
              />
              <SearchIcon
                className="absolute left-2.5 top-2 text-slate-400"
                sx={{ fontSize: 16 }}
              />
            </div>

            {/* Sidebar Navigation Items List */}
            <div className="flex-1 overflow-y-auto max-h-[70vh] space-y-0.5 pr-1">
              {filteredSidebarMenu.map((item) => {
                const IconComponent = item.icon;
                const hasSub = item.subItems && item.subItems.length > 0;
                const isGroupExpanded = expandedGroups[item.key] ?? false;
                const isItemActive = activeSectionKey === item.key;

                return (
                  <div key={item.key} className="flex flex-col">
                    <button
                      onClick={() => {
                        if (hasSub) {
                          toggleGroup(item.key);
                        } else {
                          handleSelectSection(item.key);
                        }
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-all cursor-pointer font-medium relative ${
                        isItemActive
                          ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold border-r-4 border-blue-600'
                          : isDark
                          ? 'text-slate-300 hover:bg-slate-800/60'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {IconComponent && (
                          <IconComponent
                            className={
                              isItemActive
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-slate-400 dark:text-slate-500'
                            }
                            sx={{ fontSize: 16 }}
                          />
                        )}
                        <span className="truncate">{item.name}</span>
                      </div>

                      {hasSub && (
                        <div className="text-slate-400">
                          {isGroupExpanded ? (
                            <KeyboardArrowDownIcon sx={{ fontSize: 16 }} />
                          ) : (
                            <KeyboardArrowRightIcon sx={{ fontSize: 16 }} />
                          )}
                        </div>
                      )}
                    </button>

                    {/* Sub Items */}
                    {hasSub && isGroupExpanded && (
                      <div className="pl-6 space-y-0.5 mt-0.5">
                        {item.subItems.map((sub) => {
                          const SubIcon = sub.icon;
                          const isSubActive = activeSectionKey === sub.key;

                          return (
                            <button
                              key={sub.key}
                              onClick={() => handleSelectSection(sub.key)}
                              className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-md transition-all cursor-pointer ${
                                isSubActive
                                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold'
                                  : isDark
                                  ? 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                              }`}
                            >
                              {SubIcon && (
                                <SubIcon
                                  className={isSubActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}
                                  sx={{ fontSize: 14 }}
                                />
                              )}
                              <span className="truncate">{sub.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Main Content Area */}
          <div className="flex-1 min-w-0 w-full [&_header]:!hidden [&_nav]:!hidden [&_main>div:first-child]:!hidden">
            {activeSectionKey === 'organizationDetails' && <OrganizationDetailsView />}
            {activeSectionKey === 'tasktype' && (
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <TaskTypePage />
              </div>
            )}
            {activeSectionKey === 'state' && <StatePage />}
            {activeSectionKey === 'region' && <RegionPage />}
            {activeSectionKey === 'branch' && <BranchPage />}
            {activeSectionKey === 'role' && <RolesPage />}
            {(activeSectionKey === 'department' || activeSectionKey === 'designation') && <OfficePage />}
            {activeSectionKey !== 'organizationDetails' &&
              activeSectionKey !== 'tasktype' &&
              activeSectionKey !== 'state' &&
              activeSectionKey !== 'region' &&
              activeSectionKey !== 'branch' &&
              activeSectionKey !== 'role' &&
              activeSectionKey !== 'department' &&
              activeSectionKey !== 'designation' && (
                <GenericAdminSectionView
                  title={activeItem?.name || 'Admin Settings'}
                  description={`Manage and configure ${activeItem?.name || 'settings'}`}
                  icon={activeItem?.icon}
                />
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
