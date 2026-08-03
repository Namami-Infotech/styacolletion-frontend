import React, { useEffect, useMemo, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getSortedRowModel,
} from '@tanstack/react-table';
import { rankItem } from '@tanstack/match-sorter-utils';
import { useThemeMode } from '../../contexts/ThemeContext';

import TablePaginationComponent from '../../components/common/TablePaginationComponent';
import TableSkeleton from '../../components/common/TableSkeleton';
import LazyAvatar from '../../components/common/LazyAvatar';

import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import GroupsIcon from '@mui/icons-material/Groups';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CloseIcon from '@mui/icons-material/Close';

import { EmployeeRoute } from '../../routes/employee/employee.route.js';

// ==========================================
// 1. ORGANIZATIONAL HIERARCHY TREE CHART
// ==========================================

const TreeNode = ({ node, level = 0, isDark, onNodeClick, expandedNodes, toggleExpand }) => {
  if (!node) return null;

  const getChildrenList = (n) => {
    if (!n) return [];
    if (Array.isArray(n.team) && n.team.length > 0) return n.team;
    if (Array.isArray(n.children) && n.children.length > 0) return n.children;
    if (Array.isArray(n.employees) && n.employees.length > 0) return n.employees;
    if (Array.isArray(n.subordinates) && n.subordinates.length > 0) return n.subordinates;
    return [];
  };

  const children = getChildrenList(node);
  const hasChildren = Array.isArray(children) && children.length > 0;
  const isExpanded = expandedNodes[node.id] !== false; // default expanded unless explicitly collapsed

  // Role Level Styles & Theme Palette
  const getLevelStyles = (lvl) => {
    switch (lvl) {
      case 0:
        return {
          nodeBg: isDark ? '#4f46e5' : '#4338ca',
          borderColor: isDark ? '#818cf8' : '#4f46e5',
          ringClass: 'ring-4 ring-indigo-500/20 dark:ring-indigo-400/30',
          badgeBg: 'bg-indigo-600 text-white',
          tag: 'Manager',
        };
      case 1:
        return {
          nodeBg: isDark ? '#2563eb' : '#1d4ed8',
          borderColor: isDark ? '#60a5fa' : '#2563eb',
          ringClass: 'ring-4 ring-blue-500/20 dark:ring-blue-400/30',
          badgeBg: 'bg-blue-600 text-white',
          tag: 'Lead',
        };
      case 2:
        return {
          nodeBg: isDark ? '#059669' : '#047857',
          borderColor: isDark ? '#34d399' : '#059669',
          ringClass: 'ring-4 ring-emerald-500/20 dark:ring-emerald-400/30',
          badgeBg: 'bg-emerald-600 text-white',
          tag: 'Employee',
        };
      default:
        return {
          nodeBg: isDark ? '#d97706' : '#b45309',
          borderColor: isDark ? '#fbbf24' : '#d97706',
          ringClass: 'ring-4 ring-amber-500/20 dark:ring-amber-400/30',
          badgeBg: 'bg-amber-600 text-white',
          tag: 'Associate',
        };
    }
  };

  const styles = getLevelStyles(level);

  return (
    <div className="flex flex-col items-center select-none relative">
      {/* Sleek Pyramid Circular Node */}
      <div
        onClick={() => onNodeClick && onNodeClick(node)}
        className="flex flex-col items-center group cursor-pointer transition-all duration-200 hover:scale-105"
      >
        {/* Role Pill Badge above Node */}
        <span className={`text-[8px] font-extrabold px-1.5 py-0.2 rounded-full uppercase tracking-wider mb-1 shadow-xs ${styles.badgeBg}`}>
          {node.role || node.designations || styles.tag}
        </span>

        {/* Round Node Circle Container */}
        <div className="relative">
          <Avatar
            src={node.image || node.avatar}
            alt={node.name}
            className={`${styles.ringClass} border-2`}
            sx={{
              width: level === 0 ? 52 : 44,
              height: level === 0 ? 52 : 44,
              bgcolor: styles.nodeBg,
              color: '#ffffff',
              fontWeight: 800,
              fontSize: level === 0 ? '1.1rem' : '0.95rem',
              borderColor: styles.borderColor,
              boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
            }}
          >
            {node.name ? node.name.charAt(0).toUpperCase() : 'E'}
          </Avatar>

          {/* Active Status Indicator Dot */}
          <span
            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ${
              isDark ? 'ring-slate-900' : 'ring-white'
            } ${
              (node.status || '').toLowerCase() === 'inactive'
                ? 'bg-rose-500'
                : (node.status || '').toLowerCase() === 'on leave'
                ? 'bg-amber-400'
                : 'bg-emerald-500'
            }`}
          />

          {/* Reports Expand/Collapse Badge on Node */}
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(node.id);
              }}
              className="absolute -bottom-1 -left-1 w-5 h-5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[9px] font-extrabold flex items-center justify-center shadow-md hover:scale-110 transition-transform cursor-pointer"
              title={`${children.length} direct reports`}
            >
              {children.length}
            </button>
          )}
        </div>

        {/* Employee Info Labels below Node Circle */}
        <div className="flex flex-col items-center text-center mt-1.5 max-w-[100px] sm:max-w-[110px]">
          <span className="font-extrabold text-xs text-slate-900 dark:text-slate-100 truncate w-full group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {node.name || 'Employee'}
          </span>
          {node.department && (
            <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-400 truncate w-full">
              {node.department}
            </span>
          )}
          {(node.emp_id || node.employee_id) && (
            <span className="text-[8px] font-mono text-slate-400 dark:text-slate-500 truncate w-full">
              #{node.emp_id || node.employee_id}
            </span>
          )}
        </div>
      </div>

      {/* 100% Connected Balanced Tree Connectors */}
      {hasChildren && isExpanded && (
        <div className="flex flex-col items-center w-full">
          {/* Vertical stem coming straight down from parent node */}
          <div className={`w-0.5 h-3 ${isDark ? 'bg-indigo-500' : 'bg-indigo-600'}`} />

          {/* Single clean row of children with continuous horizontal bar */}
          <div className="flex flex-nowrap items-start justify-center relative">
            {children.map((child, idx) => {
              const isFirst = idx === 0;
              const isLast = idx === children.length - 1;
              const isSingle = children.length === 1;

              return (
                <div key={child.id || idx} className="flex flex-col items-center relative px-2.5 sm:px-3.5 min-w-[90px]">
                  {/* Top Horizontal Bar linking siblings */}
                  {!isSingle && (
                    <>
                      {/* Left line segment */}
                      {!isFirst && (
                        <div className={`absolute top-0 left-0 right-1/2 h-0.5 ${isDark ? 'bg-indigo-500' : 'bg-indigo-600'}`} />
                      )}
                      {/* Right line segment */}
                      {!isLast && (
                        <div className={`absolute top-0 left-1/2 right-0 h-0.5 ${isDark ? 'bg-indigo-500' : 'bg-indigo-600'}`} />
                      )}
                    </>
                  )}

                  {/* Vertical stem connecting horizontal bar directly into child top */}
                  <div className={`w-0.5 h-3 ${isDark ? 'bg-indigo-500' : 'bg-indigo-600'}`} />

                  <TreeNode
                    node={child}
                    level={level + 1}
                    isDark={isDark}
                    onNodeClick={onNodeClick}
                    expandedNodes={expandedNodes}
                    toggleExpand={toggleExpand}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export function OrgTreeChart({ onStatsCalculated }) {
  const { isDark } = useThemeMode();
  const [treeData, setTreeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(0.6);
  const [expandedNodes, setExpandedNodes] = useState({});
  const [selectedNode, setSelectedNode] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const fetchTeamHierarchy = async () => {
    setLoading(true);
    try {
      const res = await EmployeeRoute.getMyTeam();
      const nodeData = res?.data?.data || res?.data || res;
      if (nodeData && typeof nodeData === 'object' && (nodeData.id || nodeData.name || nodeData.team || nodeData.children)) {
        setTreeData(nodeData);

        // Calculate stats if callback passed
        if (onStatsCalculated) {
          const allNodes = flattenHierarchy(nodeData);
          const directReports = getDirectReportsCount(nodeData);
          const activeCount = allNodes.filter((e) => (e.status || '').toLowerCase() !== 'inactive').length;
          const departments = new Set(allNodes.map((e) => e.department).filter(Boolean)).size;

          onStatsCalculated({
            totalMembers: allNodes.length,
            directReports,
            activeCount,
            departmentsCount: departments,
          });
        }
      } else {
        setTreeData(null);
      }
    } catch (err) {
      console.error('Fetch my team hierarchy error:', err);
      setTreeData(null);
    } finally {
      setLoading(false);
    }
  };

  const getDirectReportsCount = (node) => {
    if (!node) return 0;
    const children = node.children || node.team || node.employees || node.subordinates || [];
    return children.length;
  };

  useEffect(() => {
    fetchTeamHierarchy();
  }, []);

  const toggleExpand = (id) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [id]: prev[id] === false ? true : false,
    }));
  };

  const expandAllNodes = () => {
    setExpandedNodes({});
  };

  const collapseAllNodes = () => {
    if (!treeData) return;
    const collapsedMap = {};
    const traverse = (n) => {
      if (!n) return;
      collapsedMap[n.id] = false;
      const children = n.children || n.team || n.employees || n.subordinates || [];
      children.forEach(traverse);
    };
    traverse(treeData);
    // Keep root node visible
    collapsedMap[treeData.id] = true;
    setExpandedNodes(collapsedMap);
  };

  const handleNodeClick = (node) => {
    setSelectedNode(node);
    setDetailModalOpen(true);
  };

  const rootData = treeData;

  return (
    <Paper
      elevation={0}
      className={`w-full flex-1 flex flex-col min-h-0 rounded-2xl border overflow-hidden transition-colors duration-200 ${
        isDark ? 'bg-slate-950 border-slate-800/80' : 'bg-slate-50 border-slate-200 shadow-sm'
      }`}
    >
      {/* Chart Control Toolbar */}
      <div className={`p-3 border-b flex flex-wrap items-center justify-between gap-3 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center gap-2">
          <Chip
            icon={<GroupsIcon style={{ fontSize: 16 }} />}
            label="Organizational Hierarchy Chart"
            color="primary"
            size="small"
            sx={{ fontWeight: 700, borderRadius: '8px' }}
          />
          <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} hidden sm:inline`}>
            Interactive dynamic tree chart visualization
          </span>
        </div>

        {/* Canvas Controls: Expand All, Collapse All & Zoom */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 mr-2 border-r pr-2 border-slate-200 dark:border-slate-800">
            <Button
              size="small"
              onClick={expandAllNodes}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.75rem',
                color: isDark ? '#94a3b8' : '#475569',
                px: 1,
                py: 0.2,
                borderRadius: '6px',
                '&:hover': { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9' },
              }}
            >
              Expand All
            </Button>
            <Button
              size="small"
              onClick={collapseAllNodes}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.75rem',
                color: isDark ? '#94a3b8' : '#475569',
                px: 1,
                py: 0.2,
                borderRadius: '6px',
                '&:hover': { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9' },
              }}
            >
              Collapse All
            </Button>
          </div>

          <Tooltip title="Zoom In">
            <IconButton
              size="small"
              onClick={() => setZoomLevel((prev) => Math.min(prev + 0.15, 1.6))}
              sx={{ color: isDark ? '#cbd5e1' : '#475569' }}
            >
              <ZoomInIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <span className={`text-xs font-mono font-bold px-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            {Math.round(zoomLevel * 100)}%
          </span>
          <Tooltip title="Zoom Out">
            <IconButton
              size="small"
              onClick={() => setZoomLevel((prev) => Math.max(prev - 0.15, 0.5))}
              sx={{ color: isDark ? '#cbd5e1' : '#475569' }}
            >
              <ZoomOutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Reset Zoom">
            <IconButton
              size="small"
              onClick={() => setZoomLevel(1)}
              sx={{ color: isDark ? '#cbd5e1' : '#475569' }}
            >
              <RestartAltIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>
      </div>

      {/* Canvas Area with Dot Grid Pattern */}
      <div className={`flex-1 min-h-0 overflow-auto p-6 sm:p-12 flex justify-center items-start no-scrollbar relative ${
        isDark
          ? 'bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]'
          : 'bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px]'
      }`}>
        {loading ? (
          <div className="flex flex-col items-center justify-center my-auto gap-3 py-16">
            <CircularProgress size={40} color="primary" />
            <span className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Building organizational hierarchy tree...
            </span>
          </div>
        ) : !rootData ? (
          <div className="flex flex-col items-center justify-center my-auto gap-3 py-16">
            <GroupsIcon className={isDark ? 'text-slate-600' : 'text-slate-400'} style={{ fontSize: 48 }} />
            <span className={`text-base font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              No team hierarchy found
            </span>
            <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
              Ensure team members have reporting managers assigned.
            </span>
          </div>
        ) : (
          <div
            className="transition-transform duration-200 origin-top flex justify-center min-w-max pb-12"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            <TreeNode
              node={rootData}
              level={0}
              isDark={isDark}
              onNodeClick={handleNodeClick}
              expandedNodes={expandedNodes}
              toggleExpand={toggleExpand}
            />
          </div>
        )}
      </div>

      {/* Node Detail Popup Dialog */}
      {selectedNode && (
        <Dialog
          open={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          PaperProps={{
            sx: {
              borderRadius: '24px',
              backgroundColor: isDark ? '#0f172a' : '#ffffff',
              color: isDark ? '#ffffff' : '#0f172a',
              minWidth: 340,
              maxWidth: 460,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
            },
          }}
        >
          <DialogTitle sx={{ p: 2.5, pb: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="flex items-center gap-3">
              <Avatar
                src={selectedNode.image || selectedNode.avatar}
                alt={selectedNode.name}
                sx={{ width: 50, height: 50, bgcolor: '#4f46e5', fontWeight: 700, fontSize: '1.2rem' }}
              >
                {selectedNode.name ? selectedNode.name.charAt(0).toUpperCase() : 'E'}
              </Avatar>
              <div>
                <h3 className="text-base font-extrabold leading-tight">{selectedNode.name}</h3>
                <p className={`text-xs ${isDark ? 'text-indigo-400' : 'text-indigo-600'} font-semibold`}>
                  {selectedNode.role || selectedNode.designations || 'Employee'}
                </p>
              </div>
            </div>
            <IconButton onClick={() => setDetailModalOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers sx={{ p: 2.5, borderColor: isDark ? '#1e293b' : '#f1f5f9' }}>
            <div className="flex flex-col gap-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-dashed border-slate-200 dark:border-slate-800">
                <span className="font-semibold text-slate-500">Employee ID:</span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">#{selectedNode.employee_id || selectedNode.emp_id || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-dashed border-slate-200 dark:border-slate-800">
                <span className="font-semibold text-slate-500">Department:</span>
                <span className="font-medium">{selectedNode.department || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-dashed border-slate-200 dark:border-slate-800">
                <span className="font-semibold text-slate-500">Email:</span>
                <span className="font-medium">{selectedNode.email || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-dashed border-slate-200 dark:border-slate-800">
                <span className="font-semibold text-slate-500">Mobile:</span>
                <span className="font-mono">{selectedNode.mobile || selectedNode.phone || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-dashed border-slate-200 dark:border-slate-800">
                <span className="font-semibold text-slate-500">Reporting Manager:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {selectedNode.manager_name || (selectedNode.manager ? selectedNode.manager.name : 'N/A')}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-dashed border-slate-200 dark:border-slate-800">
                <span className="font-semibold text-slate-500">Status:</span>
                <Chip
                  label={selectedNode.status || 'Active'}
                  size="small"
                  color={(selectedNode.status || '').toLowerCase() === 'inactive' ? 'error' : 'success'}
                  sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }}
                />
              </div>
              <div className="flex justify-between py-1">
                <span className="font-semibold text-slate-500">Direct Reports:</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  {getDirectReportsCount(selectedNode)} members
                </span>
              </div>
            </div>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setDetailModalOpen(false)} variant="contained" fullWidth sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700, background: '#4f46e5' }}>
              Close Profile
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Paper>
  );
}

// ==========================================
// 2. TABULAR MY TEAM TABLE VIEW
// ==========================================

const fuzzyFilter = (row, columnId, value, addMeta) => {
  const cellVal = formatCellText(row.getValue(columnId));
  const itemRank = rankItem(cellVal, value);
  addMeta({ itemRank });
  return itemRank.passed;
};

const columnHelper = createColumnHelper();

const formatCellText = (val, fallback = 'null') => {
  if (val === null || val === undefined) return fallback;
  if (Array.isArray(val)) {
    if (val.length === 0) return fallback;
    return val.map((item) => formatCellText(item, fallback)).join(', ');
  }
  if (typeof val === 'object') {
    return val.name || val.title || val.label || val.slug || val.identity || (val.id ? `ID: ${val.id}` : fallback);
  }
  return String(val);
};

const flattenHierarchy = (rootNode) => {
  if (!rootNode) return [];
  const result = [];
  const visited = new Set();

  const traverse = (node) => {
    if (!node || visited.has(node.id)) return;
    visited.add(node.id);

    const { children, team, employees, subordinates, ...rest } = node;
    result.push(rest);

    const subList = (Array.isArray(children) && children.length > 0) ? children
      : (Array.isArray(team) && team.length > 0) ? team
      : (Array.isArray(employees) && employees.length > 0) ? employees
      : (Array.isArray(subordinates) && subordinates.length > 0) ? subordinates : [];

    subList.forEach(traverse);
  };

  traverse(rootNode);
  return result;
};

export default function MyTeamTable({
  searchTerm = '',
  selectedDepartment = 'All',
  selectedStatus = 'All',
  onViewClick,
  onEditClick,
  onDeleteClick,
  getStatusChipProps,
  maxHeight,
  columnVisibility = {},
}) {
  const [sorting, setSorting] = useState([]);
  const { isDark } = useThemeMode();
  const [employees, setEmployees] = useState([]);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [loading, setLoading] = useState(false);

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const getTeamEmployees = async () => {
    setLoading(true);
    try {
      const res = await EmployeeRoute.getMyTeam();
      const nodeData = res?.data?.data || res?.data || res;

      if (nodeData && typeof nodeData === 'object' && (nodeData.id || nodeData.name || nodeData.team || nodeData.children)) {
        const flatList = flattenHierarchy(nodeData);
        setEmployees(flatList);
        setTotalEmployees(flatList.length);
      } else {
        const fallbackRes = await EmployeeRoute.getAllEmployee({
          page: page + 1,
          limit: rowsPerPage,
          search: searchTerm || undefined,
          status: selectedStatus !== 'All' ? selectedStatus.toLowerCase() : undefined,
          department: selectedDepartment !== 'All' ? selectedDepartment : undefined,
        });

        if (fallbackRes?.success && fallbackRes?.data?.employees) {
          setEmployees(fallbackRes.data.employees);
          setTotalEmployees(fallbackRes.data.totalItems ?? fallbackRes.data.employees.length);
        } else {
          setEmployees([]);
          setTotalEmployees(0);
        }
      }
    } catch (err) {
      console.error('Failed to fetch team employees:', err);
      setEmployees([]);
      setTotalEmployees(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTeamEmployees();
  }, [page, rowsPerPage, searchTerm, selectedDepartment, selectedStatus]);

  const getChipProps = (status) => {
    if (getStatusChipProps) {
      return getStatusChipProps(status);
    }
    if (isDark) {
      switch (status) {
        case 'Active':
          return {
            label: 'Active',
            style: {
              backgroundColor: 'rgba(34, 197, 94, 0.15)',
              color: '#4ade80',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              fontWeight: 600,
            },
          };
        case 'On Leave':
          return {
            label: 'On Leave',
            style: {
              backgroundColor: 'rgba(234, 179, 8, 0.15)',
              color: '#fde047',
              border: '1px solid rgba(234, 179, 8, 0.3)',
              fontWeight: 600,
            },
          };
        default:
          return {
            label: 'Inactive',
            style: {
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              color: '#fca5a5',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              fontWeight: 600,
            },
          };
      }
    } else {
      switch (status) {
        case 'Active':
          return {
            label: 'Active',
            style: {
              backgroundColor: '#dcfce7',
              color: '#14532d',
              border: '1px solid #86efac',
              fontWeight: 700,
            },
          };
        case 'On Leave':
          return {
            label: 'On Leave',
            style: {
              backgroundColor: '#fef9c3',
              color: '#713f12',
              border: '1px solid #fde047',
              fontWeight: 700,
            },
          };
        default:
          return {
            label: 'Inactive',
            style: {
              backgroundColor: '#fee2e2',
              color: '#7f1d1d',
              border: '1px solid #fca5a5',
              fontWeight: 700,
            },
          };
      }
    }
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        id: 'name',
        header: 'Name',
        cell: ({ row }) => {
          const name = formatCellText(row.original.name);
          const email = formatCellText(row.original.email);
          const img = typeof row.original.image === 'string' && row.original.image !== 'default.png' ? row.original.image : row.original.avatar;
          return (
            <div className="flex items-center gap-3 min-w-[180px]">
              <Avatar
                src={img}
                alt={name}
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: isDark ? '#3b82f6' : '#2563eb',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                }}
              >
                {name.charAt(0).toUpperCase()}
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className={`font-semibold text-sm truncate ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                  {name}
                </span>
                <span className={`text-xs truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {email}
                </span>
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor('manager', {
        id: 'manager',
        header: 'Manager',
        cell: ({ row }) => {
          const mgr = row.original.manager || row.original.manager_id;
          let mgrName = 'N/A';
          if (typeof mgr === 'object' && mgr !== null && mgr.name) {
            mgrName = mgr.name;
          } else if (typeof mgr === 'string') {
            mgrName = mgr;
          } else if (row.original.manager_name) {
            mgrName = row.original.manager_name;
          }
          return (
            <span className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {mgrName}
            </span>
          );
        },
      }),
      columnHelper.accessor('emp_id', {
        id: 'emp_id',
        header: 'Id',
        cell: ({ row }) => {
          const empId = row.original.emp_id || row.original.employee_id || row.original.identity || 'N/A';
          return (
            <span className={`text-xs font-mono font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
              {empId}
            </span>
          );
        },
      }),
      columnHelper.accessor('department', {
        id: 'department',
        header: 'Department',
        cell: ({ getValue }) => (
          <span className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            {formatCellText(getValue(), 'N/A')}
          </span>
        ),
      }),
      columnHelper.accessor('designations', {
        id: 'designations',
        header: 'Designations',
        cell: ({ row }) => {
          const desig = row.original.designations || row.original.role || 'Employee';
          return (
            <span className={`text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {desig}
            </span>
          );
        },
      }),
      columnHelper.accessor('mobile', {
        id: 'mobile',
        header: 'Mobile',
        cell: ({ row }) => {
          const mob = row.original.mobile || row.original.phone || 'N/A';
          return (
            <span className={`text-xs font-mono ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {mob}
            </span>
          );
        },
      }),
      columnHelper.accessor('status', {
        id: 'status',
        header: 'Status',
        cell: ({ getValue }) => {
          const rawStatus = formatCellText(getValue(), 'Active');
          const formattedStatus = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase();
          const chipProps = getChipProps(formattedStatus);
          return (
            <Chip
              label={chipProps.label}
              size="small"
              style={{
                ...chipProps.style,
                fontSize: '0.72rem',
                height: '22px',
                borderRadius: '6px',
              }}
            />
          );
        },
      }),
      columnHelper.accessor('location', {
        id: 'location',
        header: 'Work Location',
        cell: ({ getValue }) => (
          <span className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            {formatCellText(getValue())}
          </span>
        ),
      }),
      columnHelper.display({
        id: 'actions',
        header: () => <div className="text-right w-full pr-2">Actions</div>,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            {/* {onViewClick && (
              <Tooltip title="View Details">
                <IconButton
                  size="small"
                  onClick={() => onViewClick(row.original)}
                  sx={{
                    color: isDark ? '#94a3b8' : '#64748b',
                    '&:hover': { color: isDark ? '#60a5fa' : '#2563eb', backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(37, 99, 235, 0.08)' },
                  }}
                >
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )} */}
            {onEditClick && (
              <Tooltip title="Edit Member">
                <IconButton
                  size="small"
                  onClick={() => onEditClick(row.original)}
                  sx={{
                    color: isDark ? '#94a3b8' : '#64748b',
                    '&:hover': { color: isDark ? '#34d399' : '#059669', backgroundColor: isDark ? 'rgba(52, 211, 153, 0.1)' : 'rgba(5, 150, 105, 0.08)' },
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {onDeleteClick && (
              <Tooltip title="Delete Member">
                <IconButton
                  size="small"
                  onClick={() => onDeleteClick(row.original)}
                  sx={{
                    color: isDark ? '#f87171' : '#dc2626',
                    '&:hover': { color: isDark ? '#ef4444' : '#b91c1c', backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(220, 38, 38, 0.08)' },
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </div>
        ),
      }),
    ],
    [isDark, onViewClick, onEditClick, onDeleteClick]
  );

  const table = useReactTable({
    data: employees,
    columns,
    state: {
      sorting,
      columnVisibility,
      globalFilter: searchTerm,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: fuzzyFilter,
  });

  const currentPageRows = table.getRowModel().rows;

  if (loading) {
    return (
      <TableSkeleton
        columns={columns.length}
        rows={rowsPerPage}
        maxHeight={maxHeight}
        avatarColIndex={0}
      />
    );
  }

  return (
    <Paper
      elevation={0}
      className={`w-full flex-1 flex flex-col min-h-0 rounded-2xl border overflow-hidden transition-colors duration-200 ${
        isDark ? 'bg-slate-900/80 border-slate-800/80' : 'bg-white border-slate-200 shadow-sm'
      }`}
    >
      <TableContainer
        className="flex-1 overflow-auto no-scrollbar"
        style={{ maxHeight: maxHeight || 'calc(100vh - 220px)' }}
      >
        <Table stickyHeader size="small">
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const isSortable = header.column.getCanSort();
                  const sortDir = header.column.getIsSorted();
                  return (
                    <TableCell
                      key={header.id}
                      onClick={isSortable ? header.column.getToggleSortingHandler() : undefined}
                      sx={{
                        backgroundColor: isDark ? '#0f172a' : '#f8fafc',
                        color: isDark ? '#94a3b8' : '#475569',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        py: 1.5,
                        px: 1.5,
                        borderBottom: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
                        cursor: isSortable ? 'pointer' : 'default',
                        userSelect: 'none',
                        '&:hover': isSortable
                          ? { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }
                          : {},
                      }}
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {isSortable && (
                          <span className="inline-flex items-center">
                            {sortDir === 'asc' && <ArrowUpwardIcon sx={{ fontSize: 14 }} />}
                            {sortDir === 'desc' && <ArrowDownwardIcon sx={{ fontSize: 14 }} />}
                          </span>
                        )}
                      </div>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 6 }}>
                  <div className="flex flex-col items-center gap-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Loading team data...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : currentPageRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 6 }}>
                  <div className="flex flex-col items-center gap-2">
                    <GroupsIcon className={isDark ? 'text-slate-600' : 'text-slate-400'} style={{ fontSize: 48 }} />
                    <p className={`font-semibold text-base ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      No team members matching your criteria
                    </p>
                    <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                      Try adjusting your search query or status filters.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              currentPageRows.map((row) => (
                <TableRow
                  key={row.id}
                  sx={{
                    '&:hover': {
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc',
                    },
                    transition: 'background-color 0.15s ease',
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} align={cell.column.id === 'actions' ? 'right' : 'left'} sx={{ px: 1.5, py: 1.5 }}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination Footer */}
      <div className={`flex-shrink-0 border-t ${isDark ? 'border-slate-800/80 bg-slate-900/90' : 'border-slate-200 bg-white'}`}>
        <TablePaginationComponent
          table={table}
          totalData={totalEmployees}
          page={page}
          setPage={(newPage) => setPage(newPage)}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 20, 25, 50]}
        />
      </div>
    </Paper>
  );
}

