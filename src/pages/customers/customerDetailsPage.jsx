import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useThemeMode } from "../../contexts/ThemeContext";
import Navbar from "../../components/common/Navbar";
import EditCustomerModel from "../../components/dilogs/customer/EditCustomer.Model";
import DeleteConfirmationModal from "../../components/common/DeleteConfirmationModal";
import { CustomerRoute } from "../../routes/customers/customer.route";
import { TaskRoute } from "../../routes/tasks/task.route";
import CircularProgress from "@mui/material/CircularProgress";

// MUI Icons
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonIcon from "@mui/icons-material/Person";
import AssignmentIcon from "@mui/icons-material/Assignment";
import NoteIcon from "@mui/icons-material/Note";
import ContactsIcon from "@mui/icons-material/Contacts";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import AddIcon from "@mui/icons-material/Add";
import CircleIcon from "@mui/icons-material/Circle";

export default function CustomerDetailsPage() {
  const { customerId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, hasPermission } = useAuth();
  const { isDark } = useThemeMode();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const passedCustomer = location.state?.customer;
  const passedTask = location.state?.task;

  // Active right side tab
  const [activeTab, setActiveTab] = useState("tasks");

  // Collapsible sections state
  const [basicDetailsOpen, setBasicDetailsOpen] = useState(true);
  const [additionalDetailsOpen, setAdditionalDetailsOpen] = useState(true);

  // Safe string unwrapper helper
  const getStringVal = (val, fallback = "") => {
    if (val === undefined || val === null || val === "") return fallback;
    if (typeof val === "object") {
      return val.name || val.title || val.slug || fallback;
    }
    return String(val);
  };

  // Customer state
  const [customerData, setCustomerData] = useState({
    name: getStringVal(passedCustomer?.name || (typeof passedCustomer === "string" ? passedCustomer : null), ""),
    phone: getStringVal(passedCustomer?.mobile || passedCustomer?.phone, ""),
    owner: getStringVal(passedCustomer?.owner, ""),
    loanStatus: getStringVal(passedCustomer?.loanStatus, ""),
    centerName: getStringVal(passedCustomer?.centerName, ""),
    totalDueAmt: getStringVal(passedCustomer?.totalDueAmt, ""),
    centerCode: getStringVal(passedCustomer?.centerCode, ""),
    loanNo: getStringVal(passedCustomer?.loanNo, ""),
    spouseName: getStringVal(passedCustomer?.spouseName, ""),
    subStateName: getStringVal(passedCustomer?.subStateName, ""),
    branch: getStringVal(passedCustomer?.branch, ""),
    branchCode: getStringVal(passedCustomer?.branchCode, ""),
    stateName: getStringVal(passedCustomer?.stateName, ""),
    preClosureAmt: getStringVal(passedCustomer?.preClosureAmt, ""),
  });

  // Dynamic Customer tasks state
  const [customerTasks, setCustomerTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [loadingCustomer, setLoadingCustomer] = useState(false);

  useEffect(() => {
    const custIdentifier = passedCustomer?.id || passedCustomer?.slug || customerId;
    if (!passedCustomer && customerId) {
      setLoadingCustomer(true);
      CustomerRoute.getCustomerBySlug(customerId)
        .then((res) => {
          if (res?.success && res.data) {
            const c = res.data;
            setCustomerData({
              name: getStringVal(c.name, ""),
              phone: getStringVal(c.mobile || c.phone, ""),
              owner: getStringVal(c.owner, ""),
              loanStatus: getStringVal(c.loanStatus, ""),
              centerName: getStringVal(c.centerName, ""),
              totalDueAmt: getStringVal(c.totalDueAmt, ""),
              centerCode: getStringVal(c.centerCode, ""),
              loanNo: getStringVal(c.loanNo, ""),
              spouseName: getStringVal(c.spouseName, ""),
              subStateName: getStringVal(c.subStateName, ""),
              branch: getStringVal(c.branch, ""),
              branchCode: getStringVal(c.branchCode, ""),
              stateName: getStringVal(c.stateName, ""),
              preClosureAmt: getStringVal(c.preClosureAmt, ""),
            });
          }
        })
        .finally(() => setLoadingCustomer(false));
    }

    if (custIdentifier) {
      setLoadingTasks(true);
      TaskRoute.getAllTasks({ customerId: custIdentifier, limit: 100 })
        .then((res) => {
          if (res?.success && res.data) {
            const list = Array.isArray(res.data) ? res.data : (res.data.tasks || []);
            setCustomerTasks(list);
          } else if (passedTask) {
            setCustomerTasks([passedTask]);
          } else {
            setCustomerTasks([]);
          }
        })
        .catch(() => {
          if (passedTask) setCustomerTasks([passedTask]);
          else setCustomerTasks([]);
        })
        .finally(() => {
          setLoadingTasks(false);
        });
    } else if (passedTask) {
      setCustomerTasks([passedTask]);
    }
  }, [customerId, passedCustomer]);

  return (
    <div
      className={`h-screen max-h-screen flex flex-col overflow-hidden transition-colors duration-200 ${
        isDark ? "bg-slate-950 text-slate-100" : "bg-slate-100 text-slate-900"
      }`}
    >
      {/* Top Navbar */}
      <Navbar user={user} logout={logout} />

      {/* Main Container */}
      <main className="flex-1 min-h-0 w-full px-3 py-3 sm:px-6 flex flex-col overflow-hidden">
        {/* Top Back Navigation Bar */}
        <div className="flex-shrink-0 flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors cursor-pointer"
          >
            <ArrowBackIcon fontSize="small" />
            <span>Back to Tasks / Customers</span>
          </button>
        </div>

        {/* Layout Grid */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-5 pt-3 overflow-hidden">
          {/* Left Sidebar Panel (3 cols on lg - smaller left sidebar) */}
          <div className="lg:col-span-3 flex flex-col h-full min-h-0 overflow-hidden pr-1">
            <div
              className={`p-4 rounded-2xl border shadow-sm flex flex-col h-full min-h-0 space-y-4 transition-all ${
                isDark ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200"
              }`}
            >
              {/* Fixed Top Section (Profile, Actions, Owner) */}
              <div className="flex-shrink-0 space-y-4">
                {/* Profile Avatar & Actions Header */}
                <div className="flex items-start justify-between pb-3 border-b border-slate-200/70 dark:border-slate-800">
                  <div className="flex flex-col items-center flex-1">
                    <div className="w-14 h-14 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-xl shadow">
                      <PersonIcon sx={{ fontSize: 32 }} />
                    </div>
                    <h2 className="text-base font-extrabold mt-2 text-slate-900 dark:text-white">
                      {customerData.name}
                    </h2>
                  </div>

                  {/* Edit & Delete Action Buttons */}
                  <div className="flex items-center gap-1">
                    {hasPermission("customer", "edit") && (
                      <button
                        type="button"
                        onClick={() => setEditModalOpen(true)}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <EditIcon sx={{ fontSize: 14 }} />
                        Edit
                      </button>
                    )}
                    {hasPermission("customer", "delete") && (
                      <button
                        type="button"
                        onClick={() => setDeleteModalOpen(true)}
                        className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                        title="Delete Customer"
                      >
                        <DeleteIcon sx={{ fontSize: 16 }} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Quick Action Buttons Row (Task, Note, Contact) */}
                <div className="flex items-center justify-around py-1 border-b border-slate-200/70 dark:border-slate-800">
                  <div className="flex flex-col items-center cursor-pointer group">
                    <div className="w-9 h-9 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-200 dark:border-sky-800 group-hover:scale-105 transition-transform">
                      <AssignmentIcon sx={{ fontSize: 18 }} />
                    </div>
                    <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400 mt-1">
                      Task
                    </span>
                  </div>

                  <div className="flex flex-col items-center cursor-pointer group">
                    <div className="w-9 h-9 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-200 dark:border-sky-800 group-hover:scale-105 transition-transform">
                      <NoteIcon sx={{ fontSize: 18 }} />
                    </div>
                    <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400 mt-1">
                      Note
                    </span>
                  </div>

                  <div className="flex flex-col items-center cursor-pointer group">
                    <div className="w-9 h-9 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-200 dark:border-sky-800 group-hover:scale-105 transition-transform">
                      <ContactsIcon sx={{ fontSize: 18 }} />
                    </div>
                    <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400 mt-1">
                      Contact
                    </span>
                  </div>
                </div>

                {/* Owner Info */}
                <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-200/70 dark:border-slate-800">
                  <span className="font-semibold text-slate-600 dark:text-slate-400">Owner -</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    <span className="text-red-500 font-bold">👤</span>
                    {customerData.owner}
                    <EditIcon sx={{ fontSize: 13, cursor: "pointer" }} />
                  </span>
                </div>
              </div>

              {/* Scrollable Bottom Details Section (Basic & Additional Details) */}
              <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-4">
                {/* Basic Details Accordion */}
                <div className="border-b border-slate-200/70 dark:border-slate-800 pb-3">
                  <button
                    type="button"
                    onClick={() => setBasicDetailsOpen(!basicDetailsOpen)}
                    className="w-full flex items-center justify-between py-1 text-xs font-bold text-sky-600 dark:text-sky-400 cursor-pointer"
                  >
                    <span>Basic Details</span>
                    {basicDetailsOpen ? (
                      <KeyboardArrowUpIcon fontSize="small" />
                    ) : (
                      <KeyboardArrowDownIcon fontSize="small" />
                    )}
                  </button>

                  {basicDetailsOpen && (
                    <div className="mt-2 space-y-2 text-xs">
                      <div>
                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
                          Phone Number
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {customerData.phone}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Additional Details Accordion */}
                <div>
                  <button
                    type="button"
                    onClick={() => setAdditionalDetailsOpen(!additionalDetailsOpen)}
                    className="w-full flex items-center justify-between py-1 text-xs font-bold text-sky-600 dark:text-sky-400 cursor-pointer"
                  >
                    <span>Additional Details</span>
                    {additionalDetailsOpen ? (
                      <KeyboardArrowUpIcon fontSize="small" />
                    ) : (
                      <KeyboardArrowDownIcon fontSize="small" />
                    )}
                  </button>

                  {additionalDetailsOpen && (
                    <div className="mt-2 space-y-2 text-xs">
                      <div>
                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
                          LoanStatus
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {customerData.loanStatus}
                        </span>
                      </div>

                      <div>
                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
                          Center Name
                        </span>
                        <span className="font-medium text-slate-800 dark:text-slate-200 break-words">
                          {customerData.centerName}
                        </span>
                      </div>

                      <div>
                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
                          TotalDueAmt
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {customerData.totalDueAmt}
                        </span>
                      </div>

                      <div>
                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
                          Center Code
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {customerData.centerCode}
                        </span>
                      </div>

                      <div>
                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
                          Loan NO.
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {customerData.loanNo}
                        </span>
                      </div>

                      <div>
                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
                          SpouseName
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {customerData.spouseName}
                        </span>
                      </div>

                      

                      <div>
                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
                          Branch
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {customerData.branch}
                        </span>
                      </div>

                      <div>
                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
                          Branch Code
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {customerData.branchCode}
                        </span>
                      </div>

                      <div>
                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
                          State Name
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {customerData.stateName}
                        </span>
                      </div>

                      <div>
                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
                          PreClosure Amt
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {customerData.preClosureAmt}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Main Panel (9 cols on lg - larger right main section with independent scrolling) */}
          <div className="lg:col-span-9 flex flex-col h-full min-h-0 overflow-y-auto pl-1 space-y-4">
            {/* Header Navigation Tabs Bar */}
            <div
              className={`rounded-2xl border shadow-sm transition-all overflow-hidden flex-shrink-0 ${
                isDark ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200"
              }`}
            >
              <div className="flex items-center border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 px-2">
                {["tasks", "notes", "contacts", "audit"].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`px-5 py-2.5 text-xs font-bold transition-all relative cursor-pointer capitalize ${
                      activeTab === tab
                        ? "text-sky-600 dark:text-sky-400 border-b-2 border-sky-600 bg-white dark:bg-slate-900"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Toolbar with Filter Button */}
              <div className="p-3 border-b border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                  <span>Filter By :</span>
                  <button
                    type="button"
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium border border-dashed border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <AddIcon sx={{ fontSize: 14 }} />
                    Add Filter
                  </button>
                </div>
              </div>
            </div>

            {/* Tab Content Container */}
            <div className="flex-1 min-h-0 space-y-4">
              {activeTab === "tasks" ? (
                loadingTasks ? (
                  <div className="p-8 flex flex-col items-center justify-center gap-2 text-slate-500">
                    <CircularProgress size={26} />
                    <span className="text-xs font-semibold">Loading tasks...</span>
                  </div>
                ) : customerTasks.length === 0 ? (
                  <div
                    className={`p-8 rounded-2xl border text-center text-xs font-semibold ${
                      isDark ? "bg-slate-900/90 border-slate-800 text-slate-400" : "bg-white border-slate-200 text-slate-600"
                    }`}
                  >
                    No tasks found for this customer.
                  </div>
                ) : (
                  /* Customer Tasks Cards List */
                  customerTasks.map((t) => {
                    const taskId = t.task_id || t.slug || t.id;
                    const taskType = typeof t.taskType === "object" ? t.taskType?.name : (t.taskType || t.type || "Task");
                    const rawStatus = String(t.status || "pending").toLowerCase();
                    const isCompleted = rawStatus === "completed";
                    const statusLabel = isCompleted ? "Completed" : "Pending";
                    const statusColor = isCompleted ? "#22c55e" : "#eab308";
                    const startedAt = t.startedAt || t.startDateTime || (t.createdAt ? new Date(t.createdAt).toLocaleString() : "NA");
                    const accuracy = t.accuracy || t.taskAccuracy || "NA";
                    const createdAt = t.createdAt ? new Date(t.createdAt).toLocaleString() : "NA";
                    const assignedTo = typeof t.assignee === "object" ? t.assignee?.name : (t.assignedTo || t.assigneeToEmployeeId || t.assignee || "Unassigned");
                    const createdBy = typeof t.creator === "object" ? t.creator?.name : (t.createdBy || t.creator || "Admin");
                    const priority = t.priority || "Medium";

                    return (
                      <div
                        key={t.id || taskId}
                        className={`p-4 rounded-2xl border shadow-sm transition-all space-y-3 ${
                          isDark ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200"
                        }`}
                      >
                        {/* Card Header (Task ID Link + Status Indicator) */}
                        <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800">
                          <span
                            onClick={() => navigate(`/tasks/details/${t.slug || taskId}`, { state: { task: t } })}
                            className="text-sm font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                          >
                            {taskId}
                          </span>
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                            <span>Status -</span>
                            <CircleIcon sx={{ fontSize: 10, color: statusColor }} />
                            <span>{statusLabel}</span>
                          </div>
                        </div>

                        {/* Task Details 2-Column Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-6 text-xs">
                          {/* Left Side */}
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-500 dark:text-slate-400">
                                Type -
                              </span>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {taskType}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-500 dark:text-slate-400">
                                Started -
                              </span>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {startedAt}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-500 dark:text-slate-400">
                                Accuracy -
                              </span>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {accuracy}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-500 dark:text-slate-400">
                                Created -
                              </span>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {createdAt}
                              </span>
                            </div>
                          </div>

                          {/* Right Side */}
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-500 dark:text-slate-400">
                                Assigned To -
                              </span>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {assignedTo}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-500 dark:text-slate-400">
                                Created By -
                              </span>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {createdBy}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-500 dark:text-slate-400">
                                Priority -
                              </span>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {priority}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )
              ) : (
                /* Other Tab Placeholder */
                <div
                  className={`p-8 rounded-2xl border text-center text-xs font-semibold ${
                    isDark ? "bg-slate-900/90 border-slate-800 text-slate-400" : "bg-white border-slate-200 text-slate-600"
                  }`}
                >
                  No {activeTab} records found for this customer.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Edit Customer Modal */}
      {editModalOpen && (
        <EditCustomerModel
          open={editModalOpen}
          customer={passedCustomer || customerData}
          onClose={() => setEditModalOpen(false)}
          onSuccess={(updated) => {
            if (updated) {
              setCustomerData((prev) => ({
                ...prev,
                name: getStringVal(updated.name, prev.name),
                phone: getStringVal(updated.mobile || updated.phone, prev.phone),
                owner: getStringVal(updated.owner, prev.owner),
                loanStatus: getStringVal(updated.loanStatus, prev.loanStatus),
              }));
            }
          }}
          isDark={isDark}
        />
      )}

      {/* Delete Customer Modal */}
      {deleteModalOpen && (
        <DeleteConfirmationModal
          open={deleteModalOpen}
          customer={passedCustomer || customerData}
          title="Delete Customer"
          onClose={() => setDeleteModalOpen(false)}
          onSuccess={() => navigate(-1)}
          isDark={isDark}
        />
      )}
    </div>
  );
}
