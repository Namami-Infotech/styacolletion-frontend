import React, { useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useThemeMode } from "../../contexts/ThemeContext";
import Navbar from "../../components/common/Navbar";

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
  const { user, logout } = useAuth();
  const { isDark } = useThemeMode();

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
    name: getStringVal(passedCustomer?.name || (typeof passedCustomer === "string" ? passedCustomer : null), "REENA"),
    phone: getStringVal(passedCustomer?.mobile || passedCustomer?.phone, "7818002298"),
    owner: getStringVal(passedCustomer?.owner, "DHARMENDRA SINGH"),
    loanStatus: getStringVal(passedCustomer?.loanStatus, "Write off"),
    centerName: getStringVal(
      passedCustomer?.centerName,
      "NADEEM 3 TEHRA GWALIOR ROAD AGRATRF 009800980449TRF 05270527000205TRF 001400141672TRF 0098[TRF 0747:"
    ),
    totalDueAmt: getStringVal(passedCustomer?.totalDueAmt, "36558"),
    centerCode: getStringVal(passedCustomer?.centerCode, "98001549"),
    loanNo: getStringVal(passedCustomer?.loanNo, "0098JLG17267"),
    spouseName: getStringVal(passedCustomer?.spouseName, "RAKESH SINGH"),
    subStateName: getStringVal(passedCustomer?.subStateName, "MATHURA"),
    branch: getStringVal(passedCustomer?.branch, "MADHU NAGAR"),
    branchCode: getStringVal(passedCustomer?.branchCode, "98"),
    stateName: getStringVal(passedCustomer?.stateName, "UP-WEST"),
    preClosureAmt: getStringVal(passedCustomer?.preClosureAmt, "36558"),
  });

  // Customer tasks list
  const customerTasks = [
    {
      id: getStringVal(passedTask?.id, "TASK-920004"),
      task_id: getStringVal(passedTask?.task_id, "TASK-920004"),
      type: getStringVal(passedTask?.taskType, "NPA collection"),
      startedAt: "2026-07-27 11:24",
      accuracy: "NA",
      createdAt: "2026-07-27 11:24",
      assignedTo: getStringVal(passedTask?.assignedTo || passedTask?.assigneeToEmployeeId, "DHARMENDRA SINGH"),
      createdBy: getStringVal(passedTask?.createdBy, "DHARMENDRA SINGH"),
      priority: getStringVal(passedTask?.priority, "Medium"),
      status: getStringVal(passedTask?.status, "In Progress"),
    },
    {
      id: "TASK-791407",
      task_id: "TASK-791407",
      type: "NPA collection",
      startedAt: "2026-06-26 09:52",
      accuracy: "NA",
      createdAt: "2026-06-26 09:52",
      assignedTo: "DHARMENDRA SINGH",
      createdBy: "DHARMENDRA SINGH",
      priority: "Medium",
      status: "In Progress",
    },
  ];

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
                    <button
                      type="button"
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <EditIcon sx={{ fontSize: 14 }} />
                      Edit
                    </button>
                    <button
                      type="button"
                      className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                      title="Delete Customer"
                    >
                      <DeleteIcon sx={{ fontSize: 16 }} />
                    </button>
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
                          Sub-State Name
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {customerData.subStateName}
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
                /* Customer Tasks Cards List */
                customerTasks.map((t) => (
                  <div
                    key={t.id}
                    className={`p-4 rounded-2xl border shadow-sm transition-all space-y-3 ${
                      isDark ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200"
                    }`}
                  >
                    {/* Card Header (Task ID Link + Status Indicator) */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800">
                      <span
                        onClick={() => navigate(`/tasks/details/${t.id}`, { state: { task: t } })}
                        className="text-sm font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                      >
                        {t.task_id}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <span>Status -</span>
                        <CircleIcon sx={{ fontSize: 10, color: "#eab308" }} />
                        <span>{t.status}</span>
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
                            {t.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-500 dark:text-slate-400">
                            Started -
                          </span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {t.startedAt}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-500 dark:text-slate-400">
                            Accuracy -
                          </span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {t.accuracy}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-500 dark:text-slate-400">
                            Created -
                          </span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {t.createdAt}
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
                            {t.assignedTo}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-500 dark:text-slate-400">
                            Created By -
                          </span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {t.createdBy}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-500 dark:text-slate-400">
                            Priority -
                          </span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {t.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
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
    </div>
  );
}
