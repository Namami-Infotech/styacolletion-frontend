import React, { useState, useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useThemeMode } from "../../contexts/ThemeContext";

// MUI Components
import {
  TextField,
  InputAdornment,
  MenuItem,
  Button,
  Snackbar,
  Alert,
  IconButton,
  Tooltip,
} from "@mui/material";

// MUI Icons
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import SettingsIcon from "@mui/icons-material/Settings";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

// Common & View Components
import Navbar from "../../components/common/Navbar";
import TaskTable from "../../views/tasks/TaskTable";
import { TaskRoute } from "../../routes/tasks/task.route.js";
import { TaskTypeRoute } from "../../routes/tasks/task-type.js";

// Task Dialog Modals
import ViewTaskModal from "../../components/dilogs/tasks/ViewTaskModal";
import TaskFormModal from "../../components/dilogs/tasks/TaskFormModal";
import DeleteTaskModal from "../../components/dilogs/tasks/DeleteTaskModal";
import ColumnSettingsDrawer from "../../components/dilogs/tasks/ColumnSettingsDrawer";
import TaskDetails from "./TaskDetails";

const ALL_TASK_COLUMNS = [
  { id: "title", label: "Title" },
  { id: "employee", label: "Employee" },
  { id: "customer", label: "Customer" },
  { id: "workLocation", label: "Work Location" },
  { id: "team", label: "Team" },
  { id: "manager", label: "Manager" },
  { id: "designations", label: "Designations" },
  { id: "department", label: "Department" },
  { id: "priority", label: "Priority" },
  { id: "status", label: "Status" },
  { id: "taskType", label: "Type" },
  { id: "createdBy", label: "Creator" },
  { id: "startedAt", label: "Started" },
  { id: "completedAt", label: "Completed" },
  { id: "startDateTime", label: "Start" },
  { id: "endDateTime", label: "Expire" },
  { id: "address", label: "Address" },
  { id: "repeat", label: "Repeat" },
  { id: "downloads", label: "Downloads" },
  { id: "createdAt", label: "Created on" },
  { id: "id", label: "DBID" },
  { id: "employeeIden", label: "Employee Iden" },
  { id: "followUp", label: "Follow Up" },
  { id: "customerMobile", label: "Customer Mobile" },
  { id: "lastComment", label: "Last Comment" },
  { id: "followUpComment", label: "Follow Up Comment" },
  { id: "lastCommentTime", label: "Last Comment Time" },
  { id: "taskCompletedAddress", label: "Task Completed Address" },
  { id: "taskAccuracy", label: "Task Accuracy" },
  { id: "taskAccuracyUnit", label: "Task Accuracy(metre/km)" },
  { id: "contact", label: "Contact" },
  { id: "startLatLng", label: "Start Lat/Lng" },
  { id: "taskWorkLocation", label: "Task Work Location" },
  { id: "totalTimeTaken", label: "Total Time Taken" },
  { id: "processIden", label: "Process Iden" },
  { id: "employeeState", label: "State Name & Id - Employee tag" },
  { id: "employeeRegion", label: "Region Name & Id - Employee tag" },
  { id: "employeeBranch", label: "Branch Name & Id - Employee tag" },
];

export default function TaskPage() {
  const location = useLocation();
  const { user, logout, hasPermission } = useAuth();
  const { isDark } = useThemeMode();

  if (location.pathname.includes("/details")) {
    return <TaskDetails />;
  }

  // Determine view mode from URL path
  const isCustomerView = location.pathname.includes("/task-customer");
  const isCustomView = location.pathname.includes("/custom");
  const isTeamView = location.pathname.includes("/team");
  const isOnboardingView = location.pathname.includes("/task-on-boarding");
  const isDeletedView = location.pathname.includes("/deleted");

  const currentSubModule = useMemo(() => {
    if (isCustomerView) return "taskCustomer";
    if (isOnboardingView) return "onboardingTask";
    if (isTeamView) return "teamTask";
    if (isDeletedView) return "deletedTasks";
    return "taskAll";
  }, [isCustomerView, isOnboardingView, isTeamView, isDeletedView]);

  const getPageHeaderTitle = () => {
    if (isCustomerView) return "Customer Tasks";
    if (isOnboardingView) return "Onboarding Tasks";
    if (isTeamView) return "Tasks";
    if (isDeletedView) return "Deleted Tasks";
    if (isCustomView) return "Custom Team Tasks";
    return "All Team Tasks";
  };

  const getPageHeaderDescription = () => {
    if (isCustomerView) return "Manage and track all tasks created for or by customers with real-time updates.";
    if (isOnboardingView) return "Manage customer onboarding and setup workflows.";
    if (isTeamView) return "View tasks assigned to your team members.";
    if (isDeletedView) return "View archived and deleted task records.";
    if (isCustomView) return "Manage custom project tasks.";
    return "Manage and track all workplace assignments with real-time updates.";
  };

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedPriority, setSelectedPriority] = useState("All");
  const [selectedTaskType, setSelectedTaskType] = useState(
    isCustomView ? "Custom" : "All",
  );

  // Task Types (dynamic from API)
  const [taskTypes, setTaskTypes] = useState([]);

  useEffect(() => {
    TaskTypeRoute.getAllTaskTypes({ limit: 100 }).then((res) => {
      if (res?.success && Array.isArray(res?.data?.taskTypes)) {
        setTaskTypes(res.data.taskTypes);
      }
    });
  }, []);

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Modals state
  const [activeTask, setActiveTask] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [settingsDrawerOpen, setSettingsDrawerOpen] = useState(false);

  // Column Visibility State
  const [columnVisibility, setColumnVisibility] = useState({
    startDateTime: false,
    endDateTime: false,
    address: false,
    repeat: false,
    downloads: false,
    id: false,
    employeeIden: false,
    followUp: false,
    customerMobile: false,
    lastComment: false,
    followUpComment: false,
    lastCommentTime: false,
    taskCompletedAddress: false,
    taskAccuracy: false,
    taskAccuracyUnit: false,
    contact: false,
    startLatLng: false,
    taskWorkLocation: false,
    totalTimeTaken: false,
    processIden: false,
    employeeState: false,
    employeeRegion: false,
    employeeBranch: false,
  });

  // Snackbar Toast
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showToast = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  // Total tasks count from API
  const [totalItems, setTotalItems] = useState(0);

  // KPI summary counters
  const totalCount = tasks.length;
  const completedCount = useMemo(
    () => tasks.filter((t) => t.status === "Completed").length,
    [tasks],
  );
  const inProgressCount = useMemo(
    () => tasks.filter((t) => t.status === "In Progress").length,
    [tasks],
  );
  const urgentCount = useMemo(
    () =>
      tasks.filter((t) => t.priority === "Urgent" || t.status === "Pending")
        .length,
    [tasks],
  );

  const handleOpenAddModal = () => {
    setActiveTask(null);
    setAddModalOpen(true);
  };

  const handleOpenEditModal = (task) => {
    setActiveTask(task);
    setEditModalOpen(true);
  };

  const handleDeleteTask = () => {
    if (!activeTask) return;
    setTasks((prev) => prev.filter((t) => t.id !== activeTask.id));
    setDeleteModalOpen(false);
    showToast(`Task "${activeTask.task_id}" removed.`, "info");
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm || undefined,
        status:
          selectedStatus !== "All" ? selectedStatus.toLowerCase() : undefined,
        priority:
          selectedPriority !== "All" ? selectedPriority.toLowerCase() : undefined,
        taskType: selectedTaskType !== "All" ? selectedTaskType : undefined,
      };

      let res;
      if (isCustomerView) {
        res = await TaskRoute.getAllCustomerTasks(params);
      } else if (isTeamView) {
        res = await TaskRoute.getTeamTask(params);
      } else {
        res = await TaskRoute.getAllTasks(params);
      }

      if (res?.success && res.data) {
        const taskList = Array.isArray(res.data) ? res.data : (res.data.tasks || []);
        setTasks(taskList);
        setTotalItems(
          res.data.totalItems !== undefined
            ? res.data.totalItems
            : taskList.length,
        );
      } else {
        setTasks([]);
        setTotalItems(0);
      }
    } catch (err) {
      console.error("Fetch tasks error:", err);
      setTasks([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  // Dynamic form fields from API
  const [formFields, setFormFields] = useState([]);

  const getTaskFields = async () => {
    const res = await TaskRoute.getCreateTaskFormFields();
    if (res?.success && res.data?.fields) {
      setFormFields(res.data.fields);
    }
  };

  useEffect(() => {
    getTaskFields();
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [
    page,
    rowsPerPage,
    searchTerm,
    selectedStatus,
    selectedPriority,
    selectedTaskType,
    location.pathname,
  ]);

  return (
    <div
      className={`min-h-screen lg:h-screen lg:max-h-screen overflow-y-auto lg:overflow-hidden flex flex-col transition-colors duration-200 ${isDark ? "bg-slate-950 text-slate-100" : "bg-slate-100 text-slate-900"
        }`}
    >
      {/* Header Navigation */}
      <Navbar user={user} logout={logout} />

      {/* Main Content Area */}
      <main className="flex-1 min-h-0 w-full px-3 py-3 sm:px-4 flex flex-col space-y-3 overflow-y-auto lg:overflow-hidden">
        {/* Toolbar & Filter Bar with Header Title */}
        <div
          className={`p-3.5 sm:p-4 rounded-2xl border flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 sm:gap-4 flex-shrink-0 transition-all duration-200 ${isDark
              ? "bg-slate-900/70 border-slate-800/80 backdrop-blur-xl shadow-xl"
              : "bg-white border-slate-200 shadow-sm"
            }`}
        >
          {/* Header Title Banner & Mobile Action Button */}
          <div className="flex items-center justify-between gap-3 flex-shrink-0">
            <div>
              <h1
                className={`text-lg sm:text-xl font-extrabold tracking-tight ${isDark ? "text-white" : "text-slate-950"}`}
              >
                {getPageHeaderTitle()}
              </h1>
              <p
                className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}
              >
                {getPageHeaderDescription()}
              </p>
            </div>

            {/* Mobile / Tablet Primary Action Button (Shown when screen < xl) */}
            {hasPermission("task", "add", currentSubModule) && (
              <div className="xl:hidden flex-shrink-0">
                <Button
                  onClick={handleOpenAddModal}
                  variant="contained"
                  size="small"
                  startIcon={<AddIcon />}
                  sx={{
                    background: isDark
                      ? "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)"
                      : "#0f172a",
                    color: "#ffffff",
                    borderRadius: "10px",
                    textTransform: "none",
                    fontWeight: 700,
                    px: 1.5,
                    py: 0.75,
                    boxShadow: isDark
                      ? "0 6px 16px -4px rgba(99, 102, 241, 0.5)"
                      : "0 4px 10px rgba(15, 23, 42, 0.2)",
                    "&:hover": {
                      background: isDark
                        ? "linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)"
                        : "#1e293b",
                    },
                  }}
                >
                  Create
                </Button>
              </div>
            )}
          </div>

          {/* Controls: Search, Filters & Desktop Action Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 flex-1 min-w-0">
            {/* Search bar */}
            <div className="flex-1 min-w-0 sm:max-w-xs md:max-w-sm">
              <TextField
                fullWidth
                size="small"
                placeholder="Search tasks by ID, title, or assignee..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon
                          className={isDark ? "text-slate-400" : "text-slate-500"}
                          fontSize="small"
                        />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: isDark ? "#ffffff" : "#0f172a",
                    backgroundColor: isDark ? "rgba(15, 23, 42, 0.8)" : "#ffffff",
                    borderRadius: "12px",
                    "& fieldset": {
                      borderColor: isDark
                        ? "rgba(255, 255, 255, 0.1)"
                        : "#cbd5e1",
                    },
                    "&:hover fieldset": {
                      borderColor: isDark ? "#6366f1" : "#0f172a",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: isDark ? "#6366f1" : "#0f172a",
                    },
                  },
                }}
              />
            </div>

            {/* Filters and Action Trigger */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {/* Task Type Filter */}
              <TextField
                select
                size="small"
                label="Task Type"
                value={selectedTaskType}
                onChange={(e) => setSelectedTaskType(e.target.value)}
                sx={{
                  minWidth: { xs: 105, sm: 120 },
                  flex: { xs: 1, sm: "initial" },
                  "& .MuiOutlinedInput-root": {
                    color: isDark ? "#ffffff" : "#0f172a",
                    backgroundColor: isDark ? "rgba(15, 23, 42, 0.8)" : "#ffffff",
                    borderRadius: "8px",
                    "& fieldset": {
                      borderColor: isDark
                        ? "rgba(255, 255, 255, 0.1)"
                        : "#cbd5e1",
                    },
                    "&:hover fieldset": {
                      borderColor: isDark ? "#6366f1" : "#0f172a",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: isDark ? "#6366f1" : "#0f172a",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: isDark ? "#94a3b8" : "#475569",
                    fontSize: "0.85rem",
                  },
                  "& .MuiSvgIcon-root": { color: isDark ? "#94a3b8" : "#475569" },
                }}
              >
                <MenuItem value="All">All Types</MenuItem>
                {taskTypes.map((tt) => (
                  <MenuItem key={tt.id} value={tt.id}>
                    {tt.name}
                  </MenuItem>
                ))}
              </TextField>

              {/* Status Filter */}
              <TextField
                select
                size="small"
                label="Status"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                sx={{
                  minWidth: { xs: 110, sm: 130 },
                  flex: { xs: 1, sm: "initial" },
                  "& .MuiOutlinedInput-root": {
                    color: isDark ? "#ffffff" : "#0f172a",
                    backgroundColor: isDark ? "rgba(15, 23, 42, 0.8)" : "#ffffff",
                    borderRadius: "8px",
                    "& fieldset": {
                      borderColor: isDark
                        ? "rgba(255, 255, 255, 0.1)"
                        : "#cbd5e1",
                    },
                    "&:hover fieldset": {
                      borderColor: isDark ? "#6366f1" : "#0f172a",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: isDark ? "#6366f1" : "#0f172a",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: isDark ? "#94a3b8" : "#475569",
                    fontSize: "0.85rem",
                  },
                  "& .MuiSvgIcon-root": { color: isDark ? "#94a3b8" : "#475569" },
                }}
              >
                <MenuItem value="All">All Statuses</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="Under Review">Under Review</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
              </TextField>

              {/* Priority Filter */}
              <TextField
                select
                size="small"
                label="Priority"
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                sx={{
                  minWidth: { xs: 105, sm: 120 },
                  flex: { xs: 1, sm: "initial" },
                  "& .MuiOutlinedInput-root": {
                    color: isDark ? "#ffffff" : "#0f172a",
                    backgroundColor: isDark ? "rgba(15, 23, 42, 0.8)" : "#ffffff",
                    borderRadius: "8px",
                    "& fieldset": {
                      borderColor: isDark
                        ? "rgba(255, 255, 255, 0.1)"
                        : "#cbd5e1",
                    },
                    "&:hover fieldset": {
                      borderColor: isDark ? "#6366f1" : "#0f172a",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: isDark ? "#6366f1" : "#0f172a",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: isDark ? "#94a3b8" : "#475569",
                    fontSize: "0.85rem",
                  },
                  "& .MuiSvgIcon-root": { color: isDark ? "#94a3b8" : "#475569" },
                }}
              >
                <MenuItem value="All">All Priorities</MenuItem>
                <MenuItem value="Urgent">Urgent</MenuItem>
                <MenuItem value="High">High</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="Low">Low</MenuItem>
              </TextField>

              {/* Column Settings Icon Button */}
              <Tooltip title="Column Settings">
                <IconButton
                  onClick={() => setSettingsDrawerOpen(true)}
                  sx={{
                    backgroundColor: isDark ? "rgba(30, 41, 59, 0.8)" : "#ffffff",
                    color: isDark ? "#818cf8" : "#4f46e5",
                    border: isDark ? "1px solid #334155" : "1px solid #cbd5e1",
                    borderRadius: "12px",
                    padding: "8px",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                    "&:hover": {
                      backgroundColor: isDark
                        ? "rgba(51, 65, 85, 0.8)"
                        : "#f8fafc",
                    },
                  }}
                >
                  <SettingsIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              {/* Desktop Create Task Button (Shown when screen >= xl) */}
              {hasPermission("task", "add", currentSubModule) && (
                <div className="hidden xl:block flex-shrink-0">
                  <Button
                    onClick={handleOpenAddModal}
                    variant="contained"
                    startIcon={<AddIcon />}
                    sx={{
                      background: isDark
                        ? "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)"
                        : "#0f172a",
                      color: "#ffffff",
                      borderRadius: "12px",
                      textTransform: "none",
                      fontWeight: 700,
                      padding: "8px 20px",
                      boxShadow: isDark
                        ? "0 8px 20px -4px rgba(99, 102, 241, 0.5)"
                        : "0 4px 12px rgba(15, 23, 42, 0.2)",
                      "&:hover": {
                        background: isDark
                          ? "linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)"
                          : "#1e293b",
                      },
                    }}
                  >
                    Create Task
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Task Data Table */}
        <TaskTable
          loading={loading}
          filteredTasks={tasks}
          totalData={totalItems}
          page={page}
          rowsPerPage={rowsPerPage}
          columnVisibility={columnVisibility}
          subModuleName={currentSubModule}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          onViewClick={(task) => {
            setActiveTask(task);
            setViewModalOpen(true);
          }}
          onEditClick={(task) => handleOpenEditModal(task)}
          onDeleteClick={(task) => {
            setActiveTask(task);
            setDeleteModalOpen(true);
          }}
        />
      </main>

      {/* View Task Modal */}
      <ViewTaskModal
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        activeTask={activeTask}
        isDark={isDark}
      />

      {/* Add / Edit Task Modal */}
      <TaskFormModal
        open={addModalOpen || editModalOpen}
        onClose={() => {
          setAddModalOpen(false);
          setEditModalOpen(false);
        }}
        addModalOpen={addModalOpen}
        activeTask={activeTask}
        formFields={formFields}
        isDark={isDark}
        onSuccess={fetchTasks}
      />

      {/* Delete Task Confirmation Modal */}
      <DeleteTaskModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        activeTask={activeTask}
        handleDeleteTask={handleDeleteTask}
        isDark={isDark}
      />

      {/* Column Settings Right Drawer */}
      <ColumnSettingsDrawer
        open={settingsDrawerOpen}
        onClose={() => setSettingsDrawerOpen(false)}
        columns={ALL_TASK_COLUMNS}
        columnVisibility={columnVisibility}
        setColumnVisibility={setColumnVisibility}
        isDark={isDark}
      />

      {/* Snackbar Toast */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ borderRadius: "12px", fontWeight: 600 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
