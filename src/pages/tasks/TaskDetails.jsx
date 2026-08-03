import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useThemeMode } from "../../contexts/ThemeContext";
import Navbar from "../../components/common/Navbar";
import { TaskRoute } from "../../routes/tasks/task.route.js";
import CompleteBehalfEmployeeModal from "../../components/dilogs/tasks/Complete.Behalf.Employee.model.jsx";

// MUI Components
import {
  CircularProgress,
} from "@mui/material";

// MUI Icons
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LaunchIcon from "@mui/icons-material/Launch";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PersonIcon from "@mui/icons-material/Person";
import KeyIcon from "@mui/icons-material/Key";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import SearchIcon from "@mui/icons-material/Search";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

export default function TaskDetails() {
  const { slug: urlSlug } = useParams();
  const slug = urlSlug || passedTask?.slug || passedTask?.task_id || passedTask?.id;
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDark } = useThemeMode();

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("customer"); // 'task' or 'customer'
  const [isCompleteBehalfOpen, setIsCompleteBehalfOpen] = useState(false);

  // Task state initialization from location.state or fetch
  const passedTask = location.state?.task;
  console.log(passedTask,"passedTaskpassedTaskpassedTask")

  const extractEmpId = (emp) => {
    if (!emp) return undefined;
    if (typeof emp === "string") return emp;
    return emp.employeeCode || emp.employeeId || emp.id || emp._id || emp.identity || emp.code;
  };

  const getCompletionInfo = (t) => {
    const cd = t?.completionData || {};
    return {
      houseImage: cd.houseImage || t?.houseImage || "",
      relation: cd.relation || t?.relation || "",
      clientPhone: cd.clientPhone || t?.clientPhone || "",
      collectPayment: cd.collectPayment || t?.collectPayment || "",
      paymentType: cd.paymentType || t?.paymentType || t?.payment_type || "",
      paymentAmount: cd.paymentAmount || t?.paymentAmount || "",
      paymentProfImage: cd.paymentProfImage || t?.paymentProfImage || "",
      reason: cd.reason || t?.reason || "",
      clientSegment: cd.clientSegment || t?.clientSegment || "",
      ptpdate: cd.ptpdate || t?.ptpdate || "",
      remark: cd.remark || t?.remark || "",
      location: cd.location || t?.location || "",
      startDateTime: cd.startDateTime || t?.startDateTime || "",
      completeDateTime: cd.completeDateTime || t?.completeDateTime || t?.endDateTime || t?.updatedAt || "",
      previousTaskId: cd.previousTaskId || t?.previousTaskId || "",
    };
  };

  const [completionDetails, setCompletionDetails] = useState(getCompletionInfo(passedTask));

  const [taskData, setTaskData] = useState({
    title: passedTask?.task_id || passedTask?.task_id || "-",
    task_id: passedTask?.task_id || "-",
    taskType: passedTask?.taskType?.name || passedTask?.taskType || "-",
    status: passedTask?.status || "-",
    priority: passedTask?.priority || "-",
    createdBy: typeof passedTask?.createdBy === "object" ? passedTask?.createdBy?.name : passedTask?.createdBy || "-",
    creatorId: extractEmpId(passedTask?.createdBy),
    assignedTo: passedTask?.assigneeToEmployeeId?.name || passedTask?.assignedTo?.name || (typeof passedTask?.assigneeToEmployeeId === "string" ? passedTask?.assigneeToEmployeeId : typeof passedTask?.assignedTo === "string" ? passedTask?.assignedTo : "-"),
    assigneeId: extractEmpId(passedTask?.assigneeToEmployeeId || passedTask?.assignedTo),
    empId: passedTask?.createdBy?.employeeCode || "-",
    createdAt: passedTask?.createdAt ? new Date(passedTask.createdAt).toLocaleString() : "-",
    startedAt: passedTask?.startDateTime ? new Date(passedTask.startDateTime).toLocaleString() : (passedTask?.completionData?.startDateTime ? new Date(passedTask.completionData.startDateTime).toLocaleString() : "-"),
    completedAt: passedTask?.endDateTime ? new Date(passedTask.endDateTime).toLocaleString() : (passedTask?.completionData?.completeDateTime ? new Date(passedTask.completionData.completeDateTime).toLocaleString() : "-"),
  });

  // Customer details state
  const customerInfo = passedTask?.customerId || {};
  const [customerDetails, setCustomerDetails] = useState({
    name: customerInfo.name || "-",
    code: customerInfo.customer_id || "-",
    mobile: customerInfo.mobile || customerInfo.phone || "-",
    stateName: customerInfo.stateName || "-",
    subStateName: customerInfo.subStateName || "-",
    branchCode: customerInfo.branchCode || "-",
    branch: customerInfo.branch || "-",
    centerName: customerInfo.centerName || "-",
    centerCode: customerInfo.centerCode || "-",
    loanType: customerInfo.loanType || "-",
    loanNo: customerInfo.loanNo || "-",
    oldLoanNo: customerInfo.oldLoanNo || "-",
    cycle: customerInfo.cycle || "-",
    loanAmount: customerInfo.loanAmount || "-",
    osInt: customerInfo.osInt || "-",
    osPrin: customerInfo.osPrin || "-",
    par: customerInfo.par || "-",
    odPrin: customerInfo.odPrin || "-",
    odInt: customerInfo.odInt || "-",
    totalDueAmt: customerInfo.totalDueAmt || "-",
    totalPrinColl: customerInfo.totalPrinColl || "-",
    totalIntColl: customerInfo.totalIntColl || "-",
    irrRate: customerInfo.irrRate || "-",
    noOfInstallment: customerInfo.noOfInstallment || "-",
    dpd: customerInfo.dpd || "-",
    paidInstNo: customerInfo.paidInstNo || "-",
    loanStatus: customerInfo.loanStatus || "-",
    spouseName: customerInfo.spouseName || "-",
    installmentAmount: customerInfo.installmentAmount || "-",
    pincode: customerInfo.pincode || "-",
    address:
      customerInfo.address ||
      "Upper Primary Middle School Kalyanpur Madhubani, Barauli, Gopalganj, Bihar, 841405, India",
  });

  // Dynamic NPA / Form Fields State
  const [houseImage, setHouseImage] = useState(null);
  const [houseImagePreview, setHouseImagePreview] = useState(null);
  const [clientRelations, setClientRelations] = useState({
    rel1: "", mob1: "",
    rel2: "", mob2: "",
    rel3: "", mob3: "",
    rel4: "", mob4: "",
    rel5: "", mob5: "",
    rel6: "", mob6: "",
  });
  const [paymentType, setPaymentType] = useState("Collection Amount");
  const [collectPayment, setCollectPayment] = useState("");
  const [geoInput, setGeoInput] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setHouseImage(file);
      setHouseImagePreview(URL.createObjectURL(file));
    }
  };

  const taskDetails = async (taskSlug) => {
    const slugToFetch = taskSlug || slug;
    if (!slugToFetch || slugToFetch === "details") return;
    setLoading(true);
    const result = await TaskRoute.getTaskBySlug(slugToFetch);
    console.log(result, "asasasasasasasasaasasasasasasadewfevegreger");
    if (result?.success && result.data) {
      const t = result.data;
      setTaskData({
        empId: extractEmpId(t.assigneeToEmployeeId || t.assignedTo || t.createdBy) || "-",
        title: t.title || t.task_id || "-",
        task_id: t.task_id || "-",
        taskType: typeof t.taskType === "object" ? t.taskType?.name : t.taskType || "-",
        status: t.status || "-",
        priority: t.priority || "-",
        createdBy: typeof t.createdBy === "object" ? t.createdBy?.name : t.createdBy || "-",
        creatorId: extractEmpId(t.createdBy),
        assignedTo: t.assigneeToEmployeeId?.name || t.assignedTo?.name || (typeof t.assigneeToEmployeeId === "string" ? t.assigneeToEmployeeId : typeof t.assignedTo === "string" ? t.assignedTo : "-"),
        assigneeId: extractEmpId(t.assigneeToEmployeeId || t.assignedTo),
        createdAt: t.createdAt ? new Date(t.createdAt).toLocaleString() : "-",
        startedAt: t.startDateTime ? new Date(t.startDateTime).toLocaleString() : (t.completionData?.startDateTime ? new Date(t.completionData.startDateTime).toLocaleString() : "-"),
        completedAt: t.endDateTime ? new Date(t.endDateTime).toLocaleString() : (t.completionData?.completeDateTime ? new Date(t.completionData.completeDateTime).toLocaleString() : "-"),
      });
      setCompletionDetails(getCompletionInfo(t));
      if (t.customerId && typeof t.customerId === "object") {
        const c = t.customerId;
        setCustomerDetails({
          name: c.name || "-",
          code: c.customer_id || c.code || "-",
          mobile: c.phone || c.mobile || "-",
          stateName: c.state || c.stateName || "-",
          subStateName: c.sub_state || c.subStateName || "-",
          branchCode: c.branch_code || c.branchCode || "-",
          branch: c.branch || "-",
          centerName: c.center || c.centerName || "-",
          centerCode: c.center_code || c.centerCode || "-",
          loanType: c.loanType || "-",
          loanNo: c.loanNo || "-",
          oldLoanNo: c.oldLoanNo || "-",
          cycle: c.cycle !== undefined && c.cycle !== null ? String(c.cycle) : "-",
          loanAmount: c.loanAmount || "-",
          osInt: c.os_interest || c.osInt || "-",
          osPrin: c.os_principal || c.osPrin || "-",
          par: c.par ? `PAR ${c.par}` : "-",
          odPrin: c.od_principal || c.odPrin || "-",
          odInt: c.od_interest || c.odInt || "-",
          totalDueAmt: c.totalDueAmount || c.totalDueAmt || "-",
          totalPrinColl: c.total_principal_collectible || c.totalPrinColl || "-",
          totalIntColl: c.total_interest_collectible || c.totalIntColl || "-",
          irrRate: c.irrRate || "-",
          noOfInstallment: c.noOfInstallment || "-",
          dpd: c.dpd || "-",
          paidInstNo: c.paidInstNo || "-",
          loanStatus: c.loanStatus || "-",
          spouseName: c.spouseName || "-",
          installmentAmount: c.installmentAmount || "-",
          pincode: c.pincode || "-",
          address: c.location || c.address || "-",
        });
      }
    }
    setLoading(false);
  };

  // Fetch single task details if slug provided
  useEffect(() => {
    taskDetails(slug);
  }, [slug]);

  return (
    <div
      className={`h-screen max-h-screen flex flex-col overflow-hidden transition-colors duration-200 ${isDark ? "bg-slate-950 text-slate-100" : "bg-slate-100 text-slate-900"
        }`}
    >
      {/* Navbar Header */}
      <Navbar user={user} logout={logout} />

      {/* Main Content Area */}
      <main className="flex-1 min-h-0 w-full px-3 py-3 sm:px-6 flex flex-col overflow-hidden">
        {/* Top Back Navigation Bar */}
        <div className="flex-shrink-0 flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            <ArrowBackIcon fontSize="small" />
            <span>Back to Tasks</span>
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <CircularProgress size={40} />
          </div>
        ) : (
          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-5 pt-3 overflow-hidden">
            {/* Major Container (8 cols on lg - now on Left) */}
            <div className="lg:col-span-8 flex flex-col h-full min-h-0 overflow-hidden relative pr-1 sm:pr-2">
              {/* Main Scrollable Content Area */}
              <div className="flex-1 min-h-0 overflow-y-auto pr-1 sm:pr-2 space-y-5">
                {/* Task Details Card */}
                <div
                  className={`p-4 sm:p-5 rounded-2xl border shadow-sm transition-all ${isDark ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200"
                    }`}
                >
                  {/* Card Title & Status Banner */}
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200/70 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-6 bg-blue-600 rounded-full" />
                      <h2 className="text-lg font-extrabold tracking-tight">Task Details</h2>
                    </div>
                    <div className="text-sm font-bold text-sky-600 dark:text-sky-400">
                      Status :- <span className="underline">{taskData.status}</span>
                    </div>
                  </div>

                  {/* Task Form Inputs (Title, Task Type, Customer Select) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Title */}
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-400">
                        Title*
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={taskData.title}
                        className={`w-full px-3 py-2 text-xs font-bold rounded-lg border outline-none ${isDark
                            ? "bg-slate-800/80 border-slate-700 text-slate-200"
                            : "bg-slate-100 border-slate-300 text-slate-800"
                          }`}
                      />
                    </div>

                    {/* Task Type */}
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-400">
                        Task Type
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={taskData.taskType}
                        className={`w-full px-3 py-2 text-xs font-bold rounded-lg border outline-none ${isDark
                            ? "bg-slate-800/80 border-slate-700 text-slate-200"
                            : "bg-slate-100 border-slate-300 text-slate-800"
                          }`}
                      />
                    </div>

                    {/* Customer Field with Profile Button */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-400">
                        Customer
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={`${customerDetails.name} - ${customerDetails.code}`}
                          className={`flex-1 px-3 py-2 text-xs font-bold rounded-lg border outline-none ${isDark
                              ? "bg-slate-800/80 border-slate-700 text-slate-200"
                              : "bg-slate-100 border-slate-300 text-slate-800"
                            }`}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const custSlug = customerDetails.slug || customerDetails.id || customerDetails.code;
                            if (custSlug && custSlug !== "-") {
                              navigate(`/customers/details/${custSlug}`);
                            }
                          }}
                          className="p-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors flex items-center justify-center shadow-sm cursor-pointer"
                          title="Customer Profile"
                        >
                          <PersonIcon fontSize="small" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customer Details Card */}
                <div
                  className={`p-4 sm:p-5 rounded-2xl border shadow-sm transition-all ${isDark ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200"
                    }`}
                >
                  {/* Section Header */}
                  <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-200/70 dark:border-slate-800">
                    <div className="w-1 h-6 bg-blue-600 rounded-full" />
                    <h2 className="text-lg font-extrabold tracking-tight">Customer Details</h2>
                  </div>

                  {/* Key-Value Fields Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                        Mobile
                      </label>
                      <div
                        className={`px-3 py-2 rounded-lg text-xs font-semibold border ${isDark
                            ? "bg-slate-800/60 border-slate-700/70 text-slate-200"
                            : "bg-slate-100/90 border-slate-200 text-slate-800"
                          }`}
                      >
                        {customerDetails.mobile}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                        State Name
                      </label>
                      <div
                        className={`px-3 py-2 rounded-lg text-xs font-semibold border ${isDark
                            ? "bg-slate-800/60 border-slate-700/70 text-slate-200"
                            : "bg-slate-100/90 border-slate-200 text-slate-800"
                          }`}
                      >
                        {customerDetails.stateName}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                        Sub-State Name
                      </label>
                      <div
                        className={`px-3 py-2 rounded-lg text-xs font-semibold border ${isDark
                            ? "bg-slate-800/60 border-slate-700/70 text-slate-200"
                            : "bg-slate-100/90 border-slate-200 text-slate-800"
                          }`}
                      >
                        {customerDetails.subStateName}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                        Branch Code
                      </label>
                      <div
                        className={`px-3 py-2 rounded-lg text-xs font-semibold border ${isDark
                            ? "bg-slate-800/60 border-slate-700/70 text-slate-200"
                            : "bg-slate-100/90 border-slate-200 text-slate-800"
                          }`}
                      >
                        {customerDetails.branchCode}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                        Branch
                      </label>
                      <div
                        className={`px-3 py-2 rounded-lg text-xs font-semibold border ${isDark
                            ? "bg-slate-800/60 border-slate-700/70 text-slate-200"
                            : "bg-slate-100/90 border-slate-200 text-slate-800"
                          }`}
                      >
                        {customerDetails.branch}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                        Center Name
                      </label>
                      <div
                        className={`px-3 py-2 rounded-lg text-xs font-semibold border ${isDark
                            ? "bg-slate-800/60 border-slate-700/70 text-slate-200"
                            : "bg-slate-100/90 border-slate-200 text-slate-800"
                          }`}
                      >
                        {customerDetails.centerName}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                        Center Code
                      </label>
                      <div
                        className={`px-3 py-2 rounded-lg text-xs font-semibold border ${isDark
                            ? "bg-slate-800/60 border-slate-700/70 text-slate-200"
                            : "bg-slate-100/90 border-slate-200 text-slate-800"
                          }`}
                      >
                        {customerDetails.centerCode}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                        Loan Type
                      </label>
                      <div
                        className={`px-3 py-2 rounded-lg text-xs font-semibold border ${isDark
                            ? "bg-slate-800/60 border-slate-700/70 text-slate-200"
                            : "bg-slate-100/90 border-slate-200 text-slate-800"
                          }`}
                      >
                        {customerDetails.loanType}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                        Loan NO.
                      </label>
                      <div
                        className={`px-3 py-2 rounded-lg text-xs font-semibold border ${isDark
                            ? "bg-slate-800/60 border-slate-700/70 text-slate-200"
                            : "bg-slate-100/90 border-slate-200 text-slate-800"
                          }`}
                      >
                        {customerDetails.loanNo}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                        Old Loan No. With Loan Series
                      </label>
                      <div
                        className={`px-3 py-2 rounded-lg text-xs font-semibold border ${isDark
                            ? "bg-slate-800/60 border-slate-700/70 text-slate-200"
                            : "bg-slate-100/90 border-slate-200 text-slate-800"
                          }`}
                      >
                        {customerDetails.oldLoanNo}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                        Cycle
                      </label>
                      <div
                        className={`px-3 py-2 rounded-lg text-xs font-semibold border ${isDark
                            ? "bg-slate-800/60 border-slate-700/70 text-slate-200"
                            : "bg-slate-100/90 border-slate-200 text-slate-800"
                          }`}
                      >
                        {customerDetails.cycle}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                        LoanAmount
                      </label>
                      <div
                        className={`px-3 py-2 rounded-lg text-xs font-semibold border ${isDark
                            ? "bg-slate-800/60 border-slate-700/70 text-slate-200"
                            : "bg-slate-100/90 border-slate-200 text-slate-800"
                          }`}
                      >
                        {customerDetails.loanAmount}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                        O/S Int
                      </label>
                      <div
                        className={`px-3 py-2 rounded-lg text-xs font-semibold border ${isDark
                            ? "bg-slate-800/60 border-slate-700/70 text-slate-200"
                            : "bg-slate-100/90 border-slate-200 text-slate-800"
                          }`}
                      >
                        {customerDetails.osInt}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                        O/S Prin
                      </label>
                      <div
                        className={`px-3 py-2 rounded-lg text-xs font-semibold border ${isDark
                            ? "bg-slate-800/60 border-slate-700/70 text-slate-200"
                            : "bg-slate-100/90 border-slate-200 text-slate-800"
                          }`}
                      >
                        {customerDetails.osPrin}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                        PAR
                      </label>
                      <div
                        className={`px-3 py-2 rounded-lg text-xs font-semibold border ${isDark
                            ? "bg-slate-800/60 border-slate-700/70 text-slate-200"
                            : "bg-slate-100/90 border-slate-200 text-slate-800"
                          }`}
                      >
                        {customerDetails.par}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                        ODPrin
                      </label>
                      <div
                        className={`px-3 py-2 rounded-lg text-xs font-semibold border ${isDark
                            ? "bg-slate-800/60 border-slate-700/70 text-slate-200"
                            : "bg-slate-100/90 border-slate-200 text-slate-800"
                          }`}
                      >
                        {customerDetails.odPrin}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                        ODInt
                      </label>
                      <div
                        className={`px-3 py-2 rounded-lg text-xs font-semibold border ${isDark
                            ? "bg-slate-800/60 border-slate-700/70 text-slate-200"
                            : "bg-slate-100/90 border-slate-200 text-slate-800"
                          }`}
                      >
                        {customerDetails.odInt}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                        TotalDueAmt
                      </label>
                      <div
                        className={`px-3 py-2 rounded-lg text-xs font-semibold border ${isDark
                            ? "bg-slate-800/60 border-slate-700/70 text-slate-200"
                            : "bg-slate-100/90 border-slate-200 text-slate-800"
                          }`}
                      >
                        {customerDetails.totalDueAmt}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                        TotalPrinColl
                      </label>
                      <div
                        className={`px-3 py-2 rounded-lg text-xs font-semibold border ${isDark
                            ? "bg-slate-800/60 border-slate-700/70 text-slate-200"
                            : "bg-slate-100/90 border-slate-200 text-slate-800"
                          }`}
                      >
                        {customerDetails.totalPrinColl}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                        TotalIntColl
                      </label>
                      <div
                        className={`px-3 py-2 rounded-lg text-xs font-semibold border ${isDark
                            ? "bg-slate-800/60 border-slate-700/70 text-slate-200"
                            : "bg-slate-100/90 border-slate-200 text-slate-800"
                          }`}
                      >
                        {customerDetails.totalIntColl}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                        IrrRate
                      </label>
                      <div
                        className={`px-3 py-2 rounded-lg text-xs font-semibold border ${isDark
                            ? "bg-slate-800/60 border-slate-700/70 text-slate-200"
                            : "bg-slate-100/90 border-slate-200 text-slate-800"
                          }`}
                      >
                        {customerDetails.irrRate}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                        NoOfInstallment
                      </label>
                      <div
                        className={`px-3 py-2 rounded-lg text-xs font-semibold border ${isDark
                            ? "bg-slate-800/60 border-slate-700/70 text-slate-200"
                            : "bg-slate-100/90 border-slate-200 text-slate-800"
                          }`}
                      >
                        {customerDetails.noOfInstallment}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                        DPD
                      </label>
                      <div
                        className={`px-3 py-2 rounded-lg text-xs font-semibold border ${isDark
                            ? "bg-slate-800/60 border-slate-700/70 text-slate-200"
                            : "bg-slate-100/90 border-slate-200 text-slate-800"
                          }`}
                      >
                        {customerDetails.dpd}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                        PaidInstNo
                      </label>
                      <div
                        className={`px-3 py-2 rounded-lg text-xs font-semibold border ${isDark
                            ? "bg-slate-800/60 border-slate-700/70 text-slate-200"
                            : "bg-slate-100/90 border-slate-200 text-slate-800"
                          }`}
                      >
                        {customerDetails.paidInstNo}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                        LoanStatus
                      </label>
                      <div
                        className={`px-3 py-2 rounded-lg text-xs font-semibold border ${isDark
                            ? "bg-slate-800/60 border-slate-700/70 text-slate-200"
                            : "bg-slate-100/90 border-slate-200 text-slate-800"
                          }`}
                      >
                        {customerDetails.loanStatus}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                        SpouseName
                      </label>
                      <div
                        className={`px-3 py-2 rounded-lg text-xs font-semibold border ${isDark
                            ? "bg-slate-800/60 border-slate-700/70 text-slate-200"
                            : "bg-slate-100/90 border-slate-200 text-slate-800"
                          }`}
                      >
                        {customerDetails.spouseName}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                        Installment Amount
                      </label>
                      <div
                        className={`px-3 py-2 rounded-lg text-xs font-semibold border ${isDark
                            ? "bg-slate-800/60 border-slate-700/70 text-slate-200"
                            : "bg-slate-100/90 border-slate-200 text-slate-800"
                          }`}
                      >
                        {customerDetails.installmentAmount}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                        Pincode
                      </label>
                      <div
                        className={`px-3 py-2 rounded-lg text-xs font-semibold border ${isDark
                            ? "bg-slate-800/60 border-slate-700/70 text-slate-200"
                            : "bg-slate-100/90 border-slate-200 text-slate-800"
                          }`}
                      >
                        {customerDetails.pincode}
                      </div>
                    </div>

                    {/* Full width Address row */}
                    <div className="sm:col-span-2 md:col-span-3">
                      <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                        Address
                      </label>
                      <div
                        className={`px-3 py-2 rounded-lg text-xs font-semibold border ${isDark
                            ? "bg-slate-800/60 border-slate-700/70 text-slate-200"
                            : "bg-slate-100/90 border-slate-200 text-slate-800"
                          }`}
                      >
                        {customerDetails.address}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dynamic NPA Collection Workflow Form Section */}
                <div
                  className={`p-4 sm:p-5 rounded-2xl border shadow-sm transition-all space-y-4 ${isDark ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200"
                    }`}
                >
                  {/* Map Pin Header Location Info */}
                  <div className="flex items-start gap-3 p-3 bg-blue-500/10 dark:bg-blue-500/20 border border-blue-200 dark:border-blue-800/50 rounded-xl">
                    <div className="p-2 bg-blue-600 text-white rounded-full flex-shrink-0">
                      <LocationOnIcon fontSize="small" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        Started
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-300">
                        {completionDetails.location || customerDetails.address || "-"}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {completionDetails.startDateTime
                          ? (isNaN(new Date(completionDetails.startDateTime).getTime())
                            ? completionDetails.startDateTime
                            : new Date(completionDetails.startDateTime).toLocaleString())
                          : taskData.startedAt}
                      </div>
                    </div>
                  </div>

                  {/* Section Header */}
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-200/70 dark:border-slate-800">
                    <div className="w-1 h-6 bg-blue-600 rounded-full" />
                    <h2 className="text-lg font-extrabold tracking-tight">{taskData.taskType}</h2>
                  </div>

                  {/* Client's House Image Box */}
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-400">
                      Client's House Image.
                    </label>
                    <div
                      className={`w-32 h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all overflow-hidden ${isDark
                          ? "border-slate-700 bg-slate-800/50"
                          : "border-slate-300 bg-slate-50"
                        }`}
                    >
                      {(completionDetails.houseImage || houseImagePreview) ? (
                        <img
                          src={completionDetails.houseImage || houseImagePreview}
                          alt="House Preview"
                          className="w-full h-full object-cover rounded-xl cursor-pointer"
                          onClick={() => window.open(completionDetails.houseImage || houseImagePreview, "_blank")}
                        />
                      ) : (
                        <div className="flex flex-col items-center text-slate-400">
                          <CloudUploadIcon />
                          <span className="text-[10px] mt-1">No Image</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Client Relation & Mobile */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Client Relation Dropdown */}
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-400">
                        Client Relation 1*
                      </label>
                      <select
                        disabled
                        value={completionDetails.relation || clientRelations.rel1 || ""}
                        className={`w-full px-3 py-2 text-xs font-medium rounded-lg border outline-none cursor-not-allowed opacity-80 capitalize ${isDark
                            ? "bg-slate-800/80 border-slate-700 text-slate-200"
                            : "bg-slate-200 border-slate-300 text-slate-800"
                          }`}
                      >
                        <option value="">Please select list</option>
                        <option value="self">Self</option>
                        <option value="Self">Self</option>
                        <option value="spouse">Spouse</option>
                        <option value="spouses">Spouses</option>
                        <option value="Spouse">Spouse</option>
                        <option value="father">Father</option>
                        <option value="Father">Father</option>
                        <option value="mother">Mother</option>
                        <option value="Mother">Mother</option>
                        <option value="brother">Brother</option>
                        <option value="Brother">Brother</option>
                        <option value="son">Son</option>
                        <option value="Son">Son</option>
                        <option value="daughter">Daughter</option>
                        <option value="Daughter">Daughter</option>
                        <option value="neighbour">Neighbour</option>
                        <option value="Neighbor">Neighbor</option>
                        <option value="relative">Relative</option>
                        <option value="Relative">Relative</option>
                      </select>
                    </div>

                    {/* Client Mobile No Input */}
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-400">
                        Client Mobile No. 1*
                      </label>
                      <input
                        type="text"
                        disabled
                        placeholder="Please enter Mobile"
                        value={completionDetails.clientPhone || clientRelations.mob1 || ""}
                        className={`w-full px-3 py-2 text-xs font-medium rounded-lg border outline-none cursor-not-allowed opacity-80 ${isDark
                            ? "bg-slate-800/80 border-slate-700 text-slate-200"
                            : "bg-slate-200 border-slate-300 text-slate-800"
                          }`}
                      />
                    </div>
                  </div>

                  {/* Payment type & Collect Payment */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-400">
                        Payment type*
                      </label>
                      <select
                        disabled
                        value={completionDetails.paymentType || paymentType || ""}
                        className={`w-full px-3 py-2 text-xs font-medium rounded-lg border outline-none cursor-not-allowed opacity-80 capitalize ${isDark
                            ? "bg-slate-800/80 border-slate-700 text-slate-200"
                            : "bg-slate-200 border-slate-300 text-slate-800"
                          }`}
                      >
                        <option value="">Select Payment Type</option>
                        <option value="cash">Cash</option>
                        <option value="Cash">Cash</option>
                        <option value="online">ONLINE</option>
                        <option value="UPI">UPI / Online</option>
                        <option value="digitalmode">Digital Mode</option>
                        <option value="Collection Amount">Collection Amount</option>
                        <option value="Cheque">Cheque</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-400">
                        Collect Payment*
                      </label>
                      <select
                        disabled
                        value={completionDetails.collectPayment || collectPayment || ""}
                        className={`w-full px-3 py-2 text-xs font-medium rounded-lg border outline-none cursor-not-allowed opacity-80 ${isDark
                            ? "bg-slate-800/80 border-slate-700 text-slate-200"
                            : "bg-slate-200 border-slate-300 text-slate-800"
                          }`}
                      >
                        <option value="">Select collect Payment</option>
                        <option value="yes_collect">Yes Collect</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                        <option value="Full Amount">Full Amount</option>
                        <option value="Partial Amount">Partial Amount</option>
                        <option value="No Collection">No Collection</option>
                      </select>
                    </div>
                  </div>

                  {/* Completion Fields (Client Segment, PTP Date, Reason, Payment Amount, Remark, Previous Task ID) */}
                  {(completionDetails.clientSegment ||
                    completionDetails.ptpdate ||
                    completionDetails.reason ||
                    completionDetails.paymentAmount ||
                    completionDetails.remark ||
                    completionDetails.previousTaskId) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-200/50 dark:border-slate-800">
                      {completionDetails.clientSegment && (
                        <div>
                          <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-400">
                            Client Segment
                          </label>
                          <input
                            type="text"
                            disabled
                            value={completionDetails.clientSegment}
                            className={`w-full px-3 py-2 text-xs font-medium rounded-lg border outline-none cursor-not-allowed opacity-80 capitalize ${isDark
                                ? "bg-slate-800/80 border-slate-700 text-slate-200"
                                : "bg-slate-200 border-slate-300 text-slate-800"
                              }`}
                          />
                        </div>
                      )}

                      {completionDetails.ptpdate && (
                        <div>
                          <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-400">
                            PTP Date
                          </label>
                          <input
                            type="text"
                            disabled
                            value={
                              isNaN(new Date(completionDetails.ptpdate).getTime())
                                ? completionDetails.ptpdate
                                : new Date(completionDetails.ptpdate).toLocaleString()
                            }
                            className={`w-full px-3 py-2 text-xs font-medium rounded-lg border outline-none cursor-not-allowed opacity-80 ${isDark
                                ? "bg-slate-800/80 border-slate-700 text-slate-200"
                                : "bg-slate-200 border-slate-300 text-slate-800"
                              }`}
                          />
                        </div>
                      )}

                      {completionDetails.reason && (
                        <div className="md:col-span-2">
                          <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-400">
                            Reason
                          </label>
                          <input
                            type="text"
                            disabled
                            value={completionDetails.reason}
                            className={`w-full px-3 py-2 text-xs font-medium rounded-lg border outline-none cursor-not-allowed opacity-80 ${isDark
                                ? "bg-slate-800/80 border-slate-700 text-slate-200"
                                : "bg-slate-200 border-slate-300 text-slate-800"
                              }`}
                          />
                        </div>
                      )}

                      {completionDetails.paymentAmount && (
                        <div>
                          <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-400">
                            Payment Amount
                          </label>
                          <input
                            type="text"
                            disabled
                            value={completionDetails.paymentAmount}
                            className={`w-full px-3 py-2 text-xs font-medium rounded-lg border outline-none cursor-not-allowed opacity-80 ${isDark
                                ? "bg-slate-800/80 border-slate-700 text-slate-200"
                                : "bg-slate-200 border-slate-300 text-slate-800"
                              }`}
                          />
                        </div>
                      )}

                      {completionDetails.remark && (
                        <div>
                          <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-400">
                            Remark
                          </label>
                          <input
                            type="text"
                            disabled
                            value={completionDetails.remark}
                            className={`w-full px-3 py-2 text-xs font-medium rounded-lg border outline-none cursor-not-allowed opacity-80 ${isDark
                                ? "bg-slate-800/80 border-slate-700 text-slate-200"
                                : "bg-slate-200 border-slate-300 text-slate-800"
                              }`}
                          />
                        </div>
                      )}

                      {completionDetails.previousTaskId && (
                        <div>
                          <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-400">
                            Previous Task ID
                          </label>
                          <input
                            type="text"
                            disabled
                            value={completionDetails.previousTaskId}
                            className={`w-full px-3 py-2 text-xs font-medium rounded-lg border outline-none cursor-not-allowed opacity-80 ${isDark
                                ? "bg-slate-800/80 border-slate-700 text-slate-200"
                                : "bg-slate-200 border-slate-300 text-slate-800"
                              }`}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Payment Proof Image Box if available */}
                  {completionDetails.paymentProfImage && (
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-400">
                        Payment Proof Image
                      </label>
                      <div
                        className={`w-32 h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all overflow-hidden ${isDark ? "border-slate-700 bg-slate-800/50" : "border-slate-300 bg-slate-50"
                          }`}
                      >
                        <img
                          src={completionDetails.paymentProfImage}
                          alt="Payment Proof"
                          className="w-full h-full object-cover rounded-xl cursor-pointer"
                          onClick={() => window.open(completionDetails.paymentProfImage, "_blank")}
                        />
                      </div>
                    </div>
                  )}

                  {/* Geo Field */}
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-400">
                      Geo*
                    </label>
                    <textarea
                      disabled
                      rows={3}
                      placeholder="Enter Geo location details..."
                      value={completionDetails.location || geoInput || ""}
                      className={`w-full px-3 py-2 text-xs font-medium rounded-xl border outline-none resize-none cursor-not-allowed opacity-80 ${isDark
                          ? "bg-slate-800/80 border-slate-700 text-slate-200"
                          : "bg-slate-200 border-slate-300 text-slate-500"
                        }`}
                    />
                  </div>
                </div>
              </div>

              {/* Primary Action Button Container - Fixed at bottom */}
              {String(taskData.status).toLowerCase() !== "completed" && (
                <div
                  className={`flex-shrink-0 pt-3 pb-2.5 px-1 border-t backdrop-blur-md z-20 transition-colors ${isDark
                      ? "bg-slate-950/90 border-slate-800/80"
                      : "bg-slate-100/90 border-slate-200/80"
                    }`}
                >
                  <button
                    type="button"
                    onClick={() => setIsCompleteBehalfOpen(true)}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer"
                  >
                    Complete Behalf of Employee
                  </button>
                </div>
              )}
            </div>

            {/* Sidebar Container: Timeline & Customer Sidebar (4 cols on lg - now on Right) */}
            <div className="lg:col-span-4 h-full min-h-0 overflow-y-auto pl-1 sm:pl-2 space-y-5">
              {/* Top Creator/Assignee Metadata & Timeline Panel */}
              <div
                className={`p-4 sm:p-5 rounded-2xl border shadow-sm transition-all space-y-4 ${isDark ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200"
                  }`}
              >
                {/* Priority, Creator, Assignee Header */}
                <div className="space-y-2 text-xs pb-3 border-b border-slate-200/70 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-600 dark:text-slate-400">
                      Priority -
                    </span>
                    <span className="inline-flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      {taskData.priority}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-600 dark:text-slate-400">
                      Creator -
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        navigate('/employees/field-visit', {
                          state: {
                            employeeName: taskData.createdBy,
                            empId: taskData.creatorId || taskData.empId,
                            role: 'Creator',
                          },
                        })
                      }
                      className="font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1 hover:underline cursor-pointer focus:outline-none"
                    >
                      {taskData.createdBy}
                      <LaunchIcon sx={{ fontSize: 13 }} />
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-600 dark:text-slate-400">
                      Assign to -
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        navigate('/employees/field-visit', {
                          state: {
                            employeeName: taskData.assignedTo,
                            empId: taskData.assigneeId,
                            role: 'Assignee',
                          },
                        })
                      }
                      className="font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1 hover:underline cursor-pointer focus:outline-none"
                    >
                      {taskData.assignedTo}
                      <LaunchIcon sx={{ fontSize: 13 }} />
                    </button>
                  </div>
                </div>

                {/* Timeline Section */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold tracking-tight">Timeline</h3>
                  <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-300 dark:before:bg-slate-700">
                    {/* Started / Status Step (On Top) */}
                    <div className="relative flex flex-col">
                      <div className="absolute -left-6 top-0 w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center shadow-sm">
                        <CheckCircleIcon sx={{ fontSize: 14 }} />
                      </div>
                      <span className="text-xs font-bold capitalize text-slate-900 dark:text-white">
                        Started
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {completionDetails.startDateTime
                          ? (isNaN(new Date(completionDetails.startDateTime).getTime())
                            ? completionDetails.startDateTime
                            : new Date(completionDetails.startDateTime).toLocaleString())
                          : taskData.startedAt}
                      </span>
                    </div>

                    {/* Completed Step (Below Started) */}
                    {(taskData.status?.toLowerCase() === "completed" || completionDetails.completeDateTime) && (
                      <div className="relative flex flex-col">
                        <div className="absolute -left-6 top-0 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                          <CheckCircleIcon sx={{ fontSize: 14 }} />
                        </div>
                        <span className="text-xs font-bold capitalize text-slate-900 dark:text-white">
                          Completed
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {completionDetails.completeDateTime
                            ? (isNaN(new Date(completionDetails.completeDateTime).getTime())
                              ? completionDetails.completeDateTime
                              : new Date(completionDetails.completeDateTime).toLocaleString())
                            : taskData.completedAt}
                        </span>
                      </div>
                    )}

                    {/* Created Step (Shown only if not completed) */}
                    {taskData.status?.toLowerCase() !== "completed" && !completionDetails.completeDateTime && (
                      <div className="relative flex flex-col">
                        <div className="absolute -left-6 top-0 w-5 h-5 rounded-full border-2 border-slate-400 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-bold text-[10px] flex items-center justify-center">
                          •
                        </div>
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          Created: {taskData.createdAt}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar Tabs (Task\ & Customer) Card */}
              <div
                className={`rounded-2xl border shadow-sm transition-all overflow-hidden ${isDark ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200"
                  }`}
              >
                {/* Sidebar Header: Static Task\ breadcrumb + Customer tab */}
                <div className="flex items-center border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                  <span className="px-4 py-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400 select-none">
                    Task\
                  </span>
                  <span className="px-4 py-2.5 text-xs font-bold text-sky-600 dark:text-sky-400 border-b-2 border-sky-600 bg-white dark:bg-slate-900 select-none">
                    Customer
                  </span>
                </div>

                {/* Card Content: Customer Details */}
                <div className="p-4 sm:p-5 space-y-4">
                  {/* Customer Profile Banner */}
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-200/70 dark:border-slate-800">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center font-bold">
                        <PersonIcon />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center text-[10px]">
                        <KeyIcon sx={{ fontSize: 10, color: "#78350f" }} />
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-extrabold text-blue-700 dark:text-blue-400">
                        {customerDetails.name}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        Code: {customerDetails.code}
                      </div>
                    </div>
                  </div>

                  {/* Basic Details */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Basic Details
                    </h4>
                    <div>
                      <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        Phone Number
                      </div>
                      <div className="text-xs font-semibold">{customerDetails.mobile}</div>
                    </div>
                    <div>
                      <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        Address
                      </div>
                      <div className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        {customerDetails.address}
                      </div>
                    </div>
                  </div>

                  {/* Additional Details */}
                  <div className="space-y-2 pt-2 border-t border-slate-200/70 dark:border-slate-800">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Additional Details
                    </h4>
                    <div className="grid grid-cols-1 gap-2 text-xs">
                      <div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                          LoanStatus
                        </span>
                        <span className="font-semibold">{customerDetails.loanStatus}</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                          DPD
                        </span>
                        <span className="font-semibold">{customerDetails.dpd}</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                          InstallmentAmount
                        </span>
                        <span className="font-semibold">{customerDetails.installmentAmount}</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                          SpouseName
                        </span>
                        <span className="font-semibold">{customerDetails.spouseName}</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                          Sub-State Name
                        </span>
                        <span className="font-semibold">{customerDetails.subStateName}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <CompleteBehalfEmployeeModal
        open={isCompleteBehalfOpen}
        onClose={() => setIsCompleteBehalfOpen(false)}
        activeTask={passedTask || taskData}
        isDark={isDark}
        onSuccess={() => taskDetails(slug)}
      />
    </div>
  );
}
