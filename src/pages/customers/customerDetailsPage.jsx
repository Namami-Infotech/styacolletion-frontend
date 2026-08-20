import React, { useState, useEffect, useMemo } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useThemeMode } from "../../contexts/ThemeContext";
import Navbar from "../../components/common/Navbar";
import EditCustomerModel from "../../components/dilogs/customer/EditCustomer.Model";
import DeleteConfirmationModal from "../../components/common/DeleteConfirmationModal";
import CompleteBehalfEmployeeModal from "../../components/dilogs/tasks/Complete.Behalf.Employee.model.jsx";
import { CustomerRoute } from "../../routes/customers/customer.route";
import { TaskRoute } from "../../routes/tasks/task.route";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";

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
import LaunchIcon from "@mui/icons-material/Launch";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import EventIcon from "@mui/icons-material/Event";
import CallIcon from "@mui/icons-material/Call";
import HomeIcon from "@mui/icons-material/Home";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PaymentsIcon from "@mui/icons-material/Payments";

export default function CustomerDetailsPage() {
  const { customerId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, hasPermission } = useAuth();
  const { isDark } = useThemeMode();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [selectedTaskForComplete, setSelectedTaskForComplete] = useState(null);

  // Image Lightbox Modal State
  const [previewImage, setPreviewImage] = useState({ open: false, url: "", title: "" });

  const passedCustomer = location.state?.customer;
  const passedTask = location.state?.task;

  // Active right side tab
  const [activeTab, setActiveTab] = useState("tasks");

  // Filter & Search states in Tasks tab
  const [taskSearch, setTaskSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'completed' | 'pending'
  const [paymentFilter, setPaymentFilter] = useState("all"); // 'all' | 'collected' | 'ptp' | 'no_collection'

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

  // Helper to format currency
  const formatCurrency = (val) => {
    if (val === undefined || val === null || val === "" || val === "-") return "₹0";
    const num = Number(val);
    if (isNaN(num)) return `₹${val}`;
    return `₹${num.toLocaleString("en-IN")}`;
  };

  // Helper to format dates
  const formatDateTime = (val) => {
    if (!val || val === "-") return "-";
    const d = new Date(val);
    return isNaN(d.getTime()) ? String(val) : d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Customer state initialization
  const [customerData, setCustomerData] = useState({
    name: getStringVal(passedCustomer?.name || (typeof passedCustomer === "string" ? passedCustomer : null), "-"),
    code: getStringVal(passedCustomer?.customer_id || passedCustomer?.code, "-"),
    phone: getStringVal(passedCustomer?.mobile || passedCustomer?.phone, "-"),
    owner: getStringVal(passedCustomer?.owner, "-"),
    loanStatus: getStringVal(passedCustomer?.loanStatus, "-"),
    centerName: getStringVal(passedCustomer?.centerName || passedCustomer?.center, "-"),
    centerCode: getStringVal(passedCustomer?.centerCode || passedCustomer?.center_code, "-"),
    totalDueAmt: getStringVal(passedCustomer?.totalDueAmt || passedCustomer?.totalDueAmount, "-"),
    loanNo: getStringVal(passedCustomer?.loanNo, "-"),
    oldLoanNo: getStringVal(passedCustomer?.oldLoanNo, "-"),
    loanType: getStringVal(passedCustomer?.loanType, "-"),
    cycle: getStringVal(passedCustomer?.cycle, "-"),
    loanAmount: getStringVal(passedCustomer?.loanAmount, "-"),
    osPrin: getStringVal(passedCustomer?.osPrin || passedCustomer?.os_principal, "-"),
    osInt: getStringVal(passedCustomer?.osInt || passedCustomer?.os_interest, "-"),
    par: getStringVal(passedCustomer?.par, "-"),
    odPrin: getStringVal(passedCustomer?.odPrin || passedCustomer?.od_principal, "-"),
    odInt: getStringVal(passedCustomer?.odInt || passedCustomer?.od_interest, "-"),
    totalPrinColl: getStringVal(passedCustomer?.totalPrinColl || passedCustomer?.total_principal_collectible, "-"),
    totalIntColl: getStringVal(passedCustomer?.totalIntColl || passedCustomer?.total_interest_collectible, "-"),
    irrRate: getStringVal(passedCustomer?.irrRate, "-"),
    noOfInstallment: getStringVal(passedCustomer?.noOfInstallment, "-"),
    paidInstNo: getStringVal(passedCustomer?.paidInstNo, "-"),
    dpd: getStringVal(passedCustomer?.dpd, "-"),
    spouseName: getStringVal(passedCustomer?.spouseName, "-"),
    installmentAmount: getStringVal(passedCustomer?.installmentAmount, "-"),
    pincode: getStringVal(passedCustomer?.pincode, "-"),
    address: getStringVal(passedCustomer?.address || passedCustomer?.location, "-"),
    subStateName: getStringVal(passedCustomer?.subStateName || passedCustomer?.sub_state, "-"),
    branch: getStringVal(passedCustomer?.branch, "-"),
    branchCode: getStringVal(passedCustomer?.branchCode || passedCustomer?.branch_code, "-"),
    stateName: getStringVal(passedCustomer?.stateName || passedCustomer?.state, "-"),
    preClosureAmt: getStringVal(passedCustomer?.preClosureAmt, "-"),
  });

  // Dynamic Customer tasks state
  const [customerTasks, setCustomerTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [loadingCustomer, setLoadingCustomer] = useState(false);

  // Helper to extract full task completion and payment data
  const getTaskInfo = (t) => {
    const cd = t?.completionData || {};
    return {
      id: t?.id,
      slug: t?.slug || t?.task_id || t?.id,
      taskId: t?.task_id || t?.slug || t?.id || "-",
      taskType: typeof t?.taskType === "object" ? t.taskType?.name : (t?.taskType || t?.type || "Field Visit"),
      status: String(t?.status || "pending").toLowerCase(),
      priority: t?.priority || "Medium",
      description: t?.description || "",
      assigneeName: t?.assignee?.name || t?.assigneeToEmployeeId?.name || t?.assignedTo?.name || (typeof t?.assigneeToEmployeeId === "string" ? t.assigneeToEmployeeId : typeof t?.assignedTo === "string" ? t.assignedTo : "-"),
      creatorName: t?.creator?.name || (typeof t?.createdBy === "object" ? t.createdBy?.name : t?.createdBy) || "Admin",
      createdAt: t?.createdAt,
      startDateTime: cd.startDateTime || t?.startDateTime,
      completeDateTime: cd.completeDateTime || t?.completeDateTime || t?.endDateTime || t?.updatedAt,
      // Payment details
      paymentAmount: cd.paymentAmount || t?.paymentAmount || "",
      paymentType: cd.paymentType || t?.paymentType || t?.payment_type || "",
      collectPayment: cd.collectPayment || t?.collectPayment || "",
      paymentProfImage: cd.paymentProfImage || t?.paymentProfImage || "",
      ptpdate: cd.ptpdate || t?.ptpdate || "",
      reason: cd.reason || t?.reason || "",
      clientSegment: cd.clientSegment || t?.clientSegment || "",
      remark: cd.remark || t?.remark || "",
      location: cd.location || t?.location || "",
      houseImage: cd.houseImage || t?.houseImage || "",
      relation: cd.relation || t?.relation || "",
      clientPhone: cd.clientPhone || t?.clientPhone || "",
      previousTaskId: cd.previousTaskId || t?.previousTaskId || "",
      contacts: (Array.isArray(t?.additionalFields?.contacts) && t.additionalFields.contacts.length > 0)
        ? t.additionalFields.contacts
        : (Array.isArray(t?.contacts) && t.contacts.length > 0)
          ? t.contacts
          : [],
      raw: t,
    };
  };

  const fetchCustomerAndTasks = async () => {
    let resolvedCustId = passedCustomer?.id;
    const custIdentifier = passedCustomer?.slug || passedCustomer?.id || customerId;

    if (customerId) {
      setLoadingCustomer(true);
      try {
        const res = await CustomerRoute.getCustomerBySlug(customerId);
        if (res?.success && res.data) {
          const c = res.data;
          resolvedCustId = c.id || resolvedCustId;
          setCustomerData({
            name: getStringVal(c.name, "-"),
            code: getStringVal(c.customer_id || c.code, "-"),
            phone: getStringVal(c.mobile || c.phone, "-"),
            owner: getStringVal(c.owner, "-"),
            loanStatus: getStringVal(c.loanStatus, "-"),
            centerName: getStringVal(c.center || c.centerName, "-"),
            centerCode: getStringVal(c.center_code || c.centerCode, "-"),
            totalDueAmt: getStringVal(c.totalDueAmount || c.totalDueAmt, "-"),
            loanNo: getStringVal(c.loanNo, "-"),
            oldLoanNo: getStringVal(c.oldLoanNo, "-"),
            loanType: getStringVal(c.loanType, "-"),
            cycle: getStringVal(c.cycle, "-"),
            loanAmount: getStringVal(c.loanAmount, "-"),
            osPrin: getStringVal(c.os_principal || c.osPrin, "-"),
            osInt: getStringVal(c.os_interest || c.osInt, "-"),
            par: getStringVal(c.par, "-"),
            odPrin: getStringVal(c.od_principal || c.odPrin, "-"),
            odInt: getStringVal(c.od_interest || c.odInt, "-"),
            totalPrinColl: getStringVal(c.total_principal_collectible || c.totalPrinColl, "-"),
            totalIntColl: getStringVal(c.total_interest_collectible || c.totalIntColl, "-"),
            irrRate: getStringVal(c.irrRate, "-"),
            noOfInstallment: getStringVal(c.noOfInstallment, "-"),
            paidInstNo: getStringVal(c.paidInstNo, "-"),
            dpd: getStringVal(c.dpd, "-"),
            spouseName: getStringVal(c.spouseName, "-"),
            installmentAmount: getStringVal(c.installmentAmount, "-"),
            pincode: getStringVal(c.pincode, "-"),
            address: getStringVal(c.location || c.address, "-"),
            subStateName: getStringVal(c.sub_state || c.subStateName, "-"),
            branch: getStringVal(c.branch, "-"),
            branchCode: getStringVal(c.branch_code || c.branchCode, "-"),
            stateName: getStringVal(c.state || c.stateName, "-"),
            preClosureAmt: getStringVal(c.preClosureAmt, "-"),
          });
        }
      } catch (err) {
        console.error("Error fetching customer:", err);
      } finally {
        setLoadingCustomer(false);
      }
    }

    const queryTargetId = resolvedCustId || custIdentifier;
    if (queryTargetId) {
      setLoadingTasks(true);
      try {
        const res = await TaskRoute.getAllTasks({ customerId: queryTargetId, limit: 500 });
        if (res?.success && res.data) {
          const list = Array.isArray(res.data) ? res.data : (res.data.tasks || []);
          // Merge passedTask if not present in list
          if (passedTask && !list.some((item) => item.id === passedTask.id || item.task_id === passedTask.task_id)) {
            setCustomerTasks([passedTask, ...list]);
          } else {
            setCustomerTasks(list);
          }
        } else if (passedTask) {
          setCustomerTasks([passedTask]);
        } else {
          setCustomerTasks([]);
        }
      } catch (err) {
        if (passedTask) setCustomerTasks([passedTask]);
        else setCustomerTasks([]);
      } finally {
        setLoadingTasks(false);
      }
    } else if (passedTask) {
      setCustomerTasks([passedTask]);
    }
  };

  useEffect(() => {
    fetchCustomerAndTasks();
  }, [customerId]);

  // Derived Task Metrics
  const taskMetrics = useMemo(() => {
    const total = customerTasks.length;
    let completedCount = 0;
    let pendingCount = 0;
    let totalPaymentCollected = 0;
    let ptpCount = 0;

    customerTasks.forEach((t) => {
      const info = getTaskInfo(t);
      if (info.status === "completed") {
        completedCount += 1;
      } else {
        pendingCount += 1;
      }
      if (info.paymentAmount && !isNaN(Number(info.paymentAmount))) {
        totalPaymentCollected += Number(info.paymentAmount);
      }
      if (info.ptpdate) {
        ptpCount += 1;
      }
    });

    return {
      total,
      completed: completedCount,
      pending: pendingCount,
      totalCollected: totalPaymentCollected,
      ptpCount,
    };
  }, [customerTasks]);

  // Filtered Tasks list
  const filteredTasks = useMemo(() => {
    return customerTasks.filter((t) => {
      const info = getTaskInfo(t);

      // Status filter
      if (statusFilter !== "all" && info.status !== statusFilter) return false;

      // Payment filter
      if (paymentFilter === "collected") {
        if (!info.paymentAmount || Number(info.paymentAmount) <= 0) return false;
      } else if (paymentFilter === "ptp") {
        if (!info.ptpdate) return false;
      } else if (paymentFilter === "no_collection") {
        const cp = (info.collectPayment || "").toLowerCase();
        if (cp !== "no" && cp !== "no collection" && Number(info.paymentAmount || 0) > 0) return false;
      }

      // Search query
      if (taskSearch.trim()) {
        const query = taskSearch.toLowerCase();
        const matchesId = String(info.taskId).toLowerCase().includes(query);
        const matchesType = String(info.taskType).toLowerCase().includes(query);
        const matchesAssignee = String(info.assigneeName).toLowerCase().includes(query);
        const matchesReason = String(info.reason).toLowerCase().includes(query);
        const matchesRemark = String(info.remark).toLowerCase().includes(query);
        const matchesPayType = String(info.paymentType).toLowerCase().includes(query);
        return matchesId || matchesType || matchesAssignee || matchesReason || matchesRemark || matchesPayType;
      }

      return true;
    });
  }, [customerTasks, statusFilter, paymentFilter, taskSearch]);

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
          {/* Left Sidebar Panel (Customer Details) */}
          <div className="lg:col-span-3 flex flex-col h-full min-h-0 overflow-hidden pr-1">
            <div
              className={`p-4 rounded-2xl border shadow-sm flex flex-col h-full min-h-0 space-y-4 transition-all ${
                isDark ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200"
              }`}
            >
              {/* Fixed Top Section (Profile, Actions, Quick Due Card) */}
              <div className="flex-shrink-0 space-y-3">
                {/* Profile Avatar & Actions Header */}
                <div className="flex items-start justify-between pb-3 border-b border-slate-200/70 dark:border-slate-800">
                  <div className="flex flex-col items-center flex-1">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
                      <PersonIcon sx={{ fontSize: 32 }} />
                    </div>
                    <h2 className="text-base font-extrabold mt-2 text-slate-900 dark:text-white text-center">
                      {customerData.name}
                    </h2>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      ID: {customerData.code}
                    </span>
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

                {/* Quick Financial Snapshot Card */}
                <div
                  className={`p-3 rounded-xl border flex flex-col gap-2 ${
                    isDark
                      ? "bg-slate-800/60 border-slate-700/70"
                      : "bg-gradient-to-r from-blue-50/70 to-indigo-50/70 border-blue-100"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      Total Due Amount
                    </span>
                    <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400">
                      {formatCurrency(customerData.totalDueAmt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">Loan Status:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md bg-emerald-500/10 text-[11px]">
                      {customerData.loanStatus}
                    </span>
                  </div>
                </div>

                {/* Owner Info */}
                <div className="flex items-center justify-between text-xs py-1 border-b border-slate-200/70 dark:border-slate-800">
                  <span className="font-semibold text-slate-600 dark:text-slate-400">Owner:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    <span className="text-blue-500">👤</span>
                    {customerData.owner}
                  </span>
                </div>
              </div>

              {/* Scrollable Customer Details Sections */}
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
                    <div className="mt-2 space-y-2.5 text-xs">
                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                          Phone Number
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {customerData.phone}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                          Address
                        </span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {customerData.address}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                            State
                          </span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {customerData.stateName}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                            Sub-State
                          </span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {customerData.subStateName}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                            Branch ({customerData.branchCode})
                          </span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {customerData.branch}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                            Center ({customerData.centerCode})
                          </span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {customerData.centerName}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Additional / Loan Financial Details Accordion */}
                <div>
                  <button
                    type="button"
                    onClick={() => setAdditionalDetailsOpen(!additionalDetailsOpen)}
                    className="w-full flex items-center justify-between py-1 text-xs font-bold text-sky-600 dark:text-sky-400 cursor-pointer"
                  >
                    <span>Loan & Financial Details</span>
                    {additionalDetailsOpen ? (
                      <KeyboardArrowUpIcon fontSize="small" />
                    ) : (
                      <KeyboardArrowDownIcon fontSize="small" />
                    )}
                  </button>

                  {additionalDetailsOpen && (
                    <div className="mt-2 space-y-2.5 text-xs">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                            Loan No.
                          </span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {customerData.loanNo}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                            Loan Type
                          </span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {customerData.loanType}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                            Loan Amount
                          </span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {formatCurrency(customerData.loanAmount)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                            Pre-Closure
                          </span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {formatCurrency(customerData.preClosureAmt)}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                            O/S Prin
                          </span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {formatCurrency(customerData.osPrin)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                            O/S Int
                          </span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {formatCurrency(customerData.osInt)}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                            OD Prin
                          </span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {formatCurrency(customerData.odPrin)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                            OD Int
                          </span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {formatCurrency(customerData.odInt)}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                            DPD
                          </span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {customerData.dpd}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                            PAR
                          </span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {customerData.par}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                            Installment Amt
                          </span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {formatCurrency(customerData.installmentAmount)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                            Spouse Name
                          </span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {customerData.spouseName}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Main Panel (Tasks & Comprehensive Payment Details View) */}
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
                    className={`px-5 py-2.5 text-xs font-bold transition-all relative cursor-pointer capitalize flex items-center gap-1.5 ${
                      activeTab === tab
                        ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 bg-white dark:bg-slate-900"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    {tab === "tasks" && <AssignmentIcon sx={{ fontSize: 16 }} />}
                    {tab === "notes" && <NoteIcon sx={{ fontSize: 16 }} />}
                    {tab === "contacts" && <ContactsIcon sx={{ fontSize: 16 }} />}
                    <span>{tab === "tasks" ? "Tasks & Payments" : tab}</span>
                    {tab === "tasks" && (
                      <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold">
                        {customerTasks.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Task Summary Metrics Banner (Only in Tasks tab) */}
              {activeTab === "tasks" && (
                <div className="p-4 bg-gradient-to-r from-slate-50 to-blue-50/40 dark:from-slate-900 dark:to-slate-800/40 border-b border-slate-200/60 dark:border-slate-800">
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {/* Total Tasks */}
                    <div
                      className={`p-3 rounded-xl border flex flex-col justify-between ${
                        isDark ? "bg-slate-800/60 border-slate-700" : "bg-white border-slate-200 shadow-xs"
                      }`}
                    >
                      <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                        <span className="text-[11px] font-semibold">Total Tasks</span>
                        <AssignmentIcon sx={{ fontSize: 16, color: "#3b82f6" }} />
                      </div>
                      <span className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
                        {taskMetrics.total}
                      </span>
                    </div>

                    {/* Completed Tasks */}
                    <div
                      className={`p-3 rounded-xl border flex flex-col justify-between ${
                        isDark ? "bg-slate-800/60 border-slate-700" : "bg-white border-slate-200 shadow-xs"
                      }`}
                    >
                      <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                        <span className="text-[11px] font-semibold">Completed</span>
                        <CheckCircleIcon sx={{ fontSize: 16, color: "#22c55e" }} />
                      </div>
                      <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                        {taskMetrics.completed}
                      </span>
                    </div>

                    {/* Pending Tasks */}
                    <div
                      className={`p-3 rounded-xl border flex flex-col justify-between ${
                        isDark ? "bg-slate-800/60 border-slate-700" : "bg-white border-slate-200 shadow-xs"
                      }`}
                    >
                      <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                        <span className="text-[11px] font-semibold">Pending</span>
                        <AccessTimeIcon sx={{ fontSize: 16, color: "#eab308" }} />
                      </div>
                      <span className="text-lg font-extrabold text-amber-600 dark:text-amber-400 mt-1">
                        {taskMetrics.pending}
                      </span>
                    </div>

                    {/* Total Payment Collected */}
                    <div
                      className={`p-3 rounded-xl border flex flex-col justify-between sm:col-span-1 col-span-2 ${
                        isDark
                          ? "bg-emerald-950/30 border-emerald-800/60"
                          : "bg-emerald-50/80 border-emerald-200 shadow-xs"
                      }`}
                    >
                      <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-300">
                        <span className="text-[11px] font-bold">Total Collected</span>
                        <PaymentsIcon sx={{ fontSize: 18, color: "#10b981" }} />
                      </div>
                      <span className="text-lg font-extrabold text-emerald-700 dark:text-emerald-300 mt-1">
                        {formatCurrency(taskMetrics.totalCollected)}
                      </span>
                    </div>

                    {/* PTP Count */}
                    <div
                      className={`p-3 rounded-xl border flex flex-col justify-between ${
                        isDark ? "bg-slate-800/60 border-slate-700" : "bg-white border-slate-200 shadow-xs"
                      }`}
                    >
                      <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                        <span className="text-[11px] font-semibold">PTP Commitments</span>
                        <EventIcon sx={{ fontSize: 16, color: "#8b5cf6" }} />
                      </div>
                      <span className="text-lg font-extrabold text-purple-600 dark:text-purple-400 mt-1">
                        {taskMetrics.ptpCount}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Filter & Search Toolbar */}
              {activeTab === "tasks" && (
                <div className="p-3 border-b border-slate-200/60 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
                  {/* Search Input */}
                  <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <SearchIcon
                      sx={{ fontSize: 18 }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      placeholder="Search tasks, payment mode, remarks..."
                      value={taskSearch}
                      onChange={(e) => setTaskSearch(e.target.value)}
                      className={`w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border outline-none transition-all ${
                        isDark
                          ? "bg-slate-800/80 border-slate-700 text-slate-100 placeholder-slate-500 focus:border-blue-500"
                          : "bg-slate-50 border-slate-300 text-slate-800 placeholder-slate-400 focus:border-blue-500"
                      }`}
                    />
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Status Filter */}
                    <div className="flex items-center rounded-lg border border-slate-300 dark:border-slate-700 p-0.5 text-xs font-semibold">
                      {[
                        { key: "all", label: "All", count: taskMetrics.total },
                        { key: "completed", label: "Completed", count: taskMetrics.completed },
                        { key: "pending", label: "Pending", count: taskMetrics.pending },
                      ].map((item) => (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => setStatusFilter(item.key)}
                          className={`px-2.5 py-1 rounded-md capitalize transition-all cursor-pointer flex items-center gap-1.5 ${
                            statusFilter === item.key
                              ? "bg-blue-600 text-white shadow-xs"
                              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                          }`}
                        >
                          <span>{item.label}</span>
                          <span
                            className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                              statusFilter === item.key
                                ? "bg-white/20 text-white"
                                : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            {item.count}
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Payment Status Filter */}
                    <select
                      value={paymentFilter}
                      onChange={(e) => setPaymentFilter(e.target.value)}
                      className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border outline-none cursor-pointer ${
                        isDark
                          ? "bg-slate-800 border-slate-700 text-slate-200"
                          : "bg-white border-slate-300 text-slate-700"
                      }`}
                    >
                      <option value="all">All Payments</option>
                      <option value="collected">Collected Amount (₹ &gt; 0)</option>
                      <option value="ptp">PTP Promise</option>
                      <option value="no_collection">No Collection</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Tab Content Container */}
            <div className="flex-1 min-h-0 space-y-4">
              {activeTab === "tasks" ? (
                loadingTasks ? (
                  <div className="p-12 flex flex-col items-center justify-center gap-3 text-slate-500">
                    <CircularProgress size={32} />
                    <span className="text-xs font-semibold">Loading customer tasks & payment details...</span>
                  </div>
                ) : filteredTasks.length === 0 ? (
                  <div
                    className={`p-10 rounded-2xl border text-center space-y-2 ${
                      isDark
                        ? "bg-slate-900/90 border-slate-800 text-slate-400"
                        : "bg-white border-slate-200 text-slate-600"
                    }`}
                  >
                    <AssignmentIcon sx={{ fontSize: 36, color: "#94a3b8" }} />
                    <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      No tasks match your criteria
                    </div>
                    <div className="text-xs text-slate-500">
                      Try resetting your search or filter options.
                    </div>
                  </div>
                ) : (
                  /* Customer Tasks List with Rich Payment Details */
                  filteredTasks.map((t) => {
                    const task = getTaskInfo(t);
                    const isCompleted = task.status === "completed";
                    const statusColor = isCompleted ? "#22c55e" : "#eab308";
                    const hasPayment = Boolean(task.paymentAmount && Number(task.paymentAmount) > 0);

                    return (
                      <div
                        key={task.id || task.taskId}
                        className={`rounded-2xl border shadow-sm transition-all overflow-hidden ${
                          isDark ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200"
                        }`}
                      >
                        {/* Task Card Header */}
                        <div
                          className={`p-4 border-b flex flex-wrap items-center justify-between gap-2 ${
                            isDark ? "bg-slate-800/40 border-slate-800" : "bg-slate-50/70 border-slate-200"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span
                              onClick={() =>
                                navigate(`/tasks/details/${task.slug || task.taskId}`, {
                                  state: { task: task.raw },
                                })
                              }
                              className="text-sm font-extrabold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1"
                              title="Click to view full single task page"
                            >
                              <span>{task.taskId}</span>
                              <LaunchIcon sx={{ fontSize: 14 }} />
                            </span>

                            {/* Task Type Badge */}
                            <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                              {task.taskType}
                            </span>

                            {/* Priority Badge */}
                            <span
                              className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                                String(task.priority).toLowerCase() === "high"
                                  ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                                  : String(task.priority).toLowerCase() === "low"
                                  ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                                  : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                              }`}
                            >
                              {task.priority}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            {/* Status Indicator */}
                            <div className="flex items-center gap-1.5 text-xs font-bold">
                              <CircleIcon sx={{ fontSize: 10, color: statusColor }} />
                              <span className={isCompleted ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}>
                                {isCompleted ? "Completed" : "Pending"}
                              </span>
                            </div>

                            {/* Created Date */}
                            <span className="text-[11px] text-slate-400">
                              {formatDateTime(task.createdAt)}
                            </span>
                          </div>
                        </div>

                        {/* Task Content Body */}
                        <div className="p-4 space-y-4">
                          {/* 1. Basic Assignment & Visit Timestamps Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                            <div className="space-y-0.5">
                              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                                Assigned Employee
                              </span>
                              <span className="font-bold text-slate-800 dark:text-slate-200">
                                {task.assigneeName}
                              </span>
                            </div>

                            <div className="space-y-0.5">
                              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                                Created By
                              </span>
                              <span className="font-bold text-slate-800 dark:text-slate-200">
                                {task.creatorName}
                              </span>
                            </div>

                            <div className="space-y-0.5">
                              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                                Started At
                              </span>
                              <span className="font-medium text-slate-700 dark:text-slate-300">
                                {formatDateTime(task.startDateTime)}
                              </span>
                            </div>

                            <div className="space-y-0.5">
                              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                                Completed At
                              </span>
                              <span className="font-medium text-slate-700 dark:text-slate-300">
                                {formatDateTime(task.completeDateTime)}
                              </span>
                            </div>
                          </div>

                          {/* Location / Geo info if present */}
                          {task.location && (
                            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                              <LocationOnIcon sx={{ fontSize: 16, color: "#3b82f6" }} />
                              <span className="font-semibold text-slate-500 dark:text-slate-400">Visit Location:</span>
                              <span className="font-medium break-all">{task.location}</span>
                            </div>
                          )}

                          {/* 2. PURE TASK PAYMENT DETAILS & VISIT OUTCOMES SECTION */}
                          <div
                            className={`p-4 rounded-xl border space-y-3.5 ${
                              isDark
                                ? "bg-slate-800/50 border-slate-700/80"
                                : "bg-gradient-to-r from-blue-50/40 to-slate-50 border-blue-100"
                            }`}
                          >
                            {/* Section Header */}
                            <div className="flex items-center justify-between pb-2 border-b border-slate-200/70 dark:border-slate-700/70">
                              <div className="flex items-center gap-2">
                                <div className="p-1 rounded-md bg-emerald-500 text-white flex items-center justify-center">
                                  <PaymentsIcon sx={{ fontSize: 15 }} />
                                </div>
                                <h4 className="text-xs font-extrabold tracking-wide uppercase text-slate-900 dark:text-white">
                                  Task Payment & Collection Details
                                </h4>
                              </div>

                              {/* Prominent Payment Amount Badge */}
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                                  Collected Payment:
                                </span>
                                <span
                                  className={`px-3 py-1 text-sm font-extrabold rounded-xl border ${
                                    hasPayment
                                      ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                                      : "bg-slate-200/70 border-slate-300 dark:bg-slate-800 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                                  }`}
                                >
                                  {formatCurrency(task.paymentAmount)}
                                </span>
                              </div>
                            </div>

                            {/* Payment Key Metrics Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                              {/* Collect Payment Status */}
                              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                                <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">
                                  Collection Status
                                </span>
                                <span className="font-bold text-slate-800 dark:text-slate-200 capitalize">
                                  {task.collectPayment || "-"}
                                </span>
                              </div>

                              {/* Payment Mode / Type */}
                              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                                <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">
                                  Payment Mode
                                </span>
                                <span className="font-bold text-blue-600 dark:text-blue-400 uppercase">
                                  {task.paymentType || "-"}
                                </span>
                              </div>

                              {/* PTP Date */}
                              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                                <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">
                                  PTP (Promise to Pay)
                                </span>
                                <span
                                  className={`font-bold ${
                                    task.ptpdate
                                      ? "text-purple-600 dark:text-purple-400"
                                      : "text-slate-500 dark:text-slate-400"
                                  }`}
                                >
                                  {task.ptpdate ? formatDateTime(task.ptpdate) : "No PTP"}
                                </span>
                              </div>

                              {/* Client Segment */}
                              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                                <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">
                                  Client Segment
                                </span>
                                <span className="font-bold text-slate-800 dark:text-slate-200">
                                  {task.clientSegment || "-"}
                                </span>
                              </div>
                            </div>

                            {/* Additional Remarks, Reason, and Relations */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                              {/* Reason */}
                              {task.reason && (
                                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                                  <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">
                                    Visit / Non-Collection Reason:
                                  </span>
                                  <span className="font-medium text-slate-700 dark:text-slate-300">
                                    {task.reason}
                                  </span>
                                </div>
                              )}

                              {/* Remarks */}
                              {task.remark && (
                                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                                  <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">
                                    Field Officer Remark:
                                  </span>
                                  <span className="font-medium text-slate-700 dark:text-slate-300">
                                    {task.remark}
                                  </span>
                                </div>
                              )}

                              {/* Client Contacts / Relation */}
                              {(task.relation || task.clientPhone || task.contacts.length > 0) && (
                                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 md:col-span-2">
                                  <span className="text-[10px] font-semibold text-slate-400 block mb-1">
                                    Contacted Person / Relation at Visit:
                                  </span>
                                  {task.contacts.length > 0 ? (
                                    <div className="flex flex-wrap gap-3">
                                      {task.contacts.map((c, idx) => (
                                        <div
                                          key={idx}
                                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
                                        >
                                          <CallIcon sx={{ fontSize: 13, color: "#3b82f6" }} />
                                          <span>{c.relation || "Contact"}:</span>
                                          <span className="text-blue-600 dark:text-blue-400">{c.clientPhone || "-"}</span>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300">
                                      <span className="capitalize">{task.relation || "Self"}</span>
                                      {task.clientPhone && <span>- {task.clientPhone}</span>}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* House Image & Payment Proof Image Thumbnails with Zoom */}
                            {(task.houseImage || task.paymentProfImage) && (
                              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-2">
                                  Visit & Payment Proof Photos:
                                </span>
                                <div className="flex flex-wrap items-center gap-4">
                                  {/* House Image */}
                                  {task.houseImage && (
                                    <div className="space-y-1">
                                      <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                                        <HomeIcon sx={{ fontSize: 13 }} />
                                        House Photo
                                      </span>
                                      <div
                                        onClick={() =>
                                          setPreviewImage({
                                            open: true,
                                            url: task.houseImage,
                                            title: `House Image - Task ${task.taskId}`,
                                          })
                                        }
                                        className="group relative w-24 h-24 rounded-xl border border-slate-300 dark:border-slate-700 overflow-hidden cursor-pointer shadow-sm hover:border-blue-500 transition-all"
                                      >
                                        <img
                                          src={task.houseImage}
                                          alt="House Proof"
                                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                                          <VisibilityIcon sx={{ fontSize: 20 }} />
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Payment Proof Receipt Image */}
                                  {task.paymentProfImage && (
                                    <div className="space-y-1">
                                      <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                                        <ReceiptLongIcon sx={{ fontSize: 13 }} />
                                        Payment Proof
                                      </span>
                                      <div
                                        onClick={() =>
                                          setPreviewImage({
                                            open: true,
                                            url: task.paymentProfImage,
                                            title: `Payment Proof - Task ${task.taskId}`,
                                          })
                                        }
                                        className="group relative w-24 h-24 rounded-xl border border-emerald-300 dark:border-emerald-700 overflow-hidden cursor-pointer shadow-sm hover:border-emerald-500 transition-all"
                                      >
                                        <img
                                          src={task.paymentProfImage}
                                          alt="Payment Proof"
                                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                                          <VisibilityIcon sx={{ fontSize: 20 }} />
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Task Card Footer Actions */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800">
                            <button
                              type="button"
                              onClick={() =>
                                navigate(`/tasks/details/${task.slug || task.taskId}`, {
                                  state: { task: task.raw },
                                })
                              }
                              className="px-3 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                              <LaunchIcon sx={{ fontSize: 14 }} />
                              <span>View Complete Task Page</span>
                            </button>

                            {!isCompleted && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedTaskForComplete(task.raw);
                                  setCompleteModalOpen(true);
                                }}
                                className="px-3 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm cursor-pointer"
                              >
                                Complete on Behalf of Employee
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )
              ) : (
                /* Other Tab Placeholder */
                <div
                  className={`p-10 rounded-2xl border text-center text-xs font-semibold ${
                    isDark
                      ? "bg-slate-900/90 border-slate-800 text-slate-400"
                      : "bg-white border-slate-200 text-slate-600"
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

      {/* Complete Behalf of Employee Modal for Pending Tasks */}
      {completeModalOpen && selectedTaskForComplete && (
        <CompleteBehalfEmployeeModal
          open={completeModalOpen}
          onClose={() => {
            setCompleteModalOpen(false);
            setSelectedTaskForComplete(null);
          }}
          activeTask={selectedTaskForComplete}
          isDark={isDark}
          onSuccess={() => fetchCustomerAndTasks()}
        />
      )}

      {/* Image Lightbox Modal */}
      <Dialog
        open={previewImage.open}
        onClose={() => setPreviewImage({ open: false, url: "", title: "" })}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: isDark ? "#0f172a" : "#ffffff",
            color: isDark ? "#f8fafc" : "#0f172a",
            borderRadius: "1rem",
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 text-sm font-bold">
          <span>{previewImage.title || "Photo Preview"}</span>
          <IconButton
            size="small"
            onClick={() => setPreviewImage({ open: false, url: "", title: "" })}
            sx={{ color: isDark ? "#94a3b8" : "#64748b" }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent className="p-4 flex flex-col items-center justify-center bg-slate-950/10 dark:bg-slate-950/40">
          {previewImage.url && (
            <img
              src={previewImage.url}
              alt="Preview"
              className="max-h-[70vh] max-w-full rounded-xl object-contain shadow-md"
            />
          )}
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={() => window.open(previewImage.url, "_blank")}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-1 cursor-pointer"
            >
              <LaunchIcon sx={{ fontSize: 13 }} />
              Open Original in New Tab
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
