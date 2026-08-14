import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  debounce,
} from "@mui/material";
import { CustomerRoute } from "../../../routes/customers/customer.route.js";
import { EmployeeRoute } from "../../../routes/employee/employee.route.js";
import { TaskRoute } from "../../../routes/tasks/task.route.js";
import { toast } from "react-toastify";
import { TaskTypeRoute } from "../../../routes/tasks/task-type.js";
import CreateCustomerModel from "../customer/CreateCustomer.Model";
import { useAuth } from "../../../contexts/AuthContext.jsx";
import UploadFileIcon from "@mui/icons-material/UploadFile";

const getCurrentDateTimeLocal = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export default function TaskFormModal({
  open,
  onClose,
  addModalOpen,
  activeTask,
  formFields: propFormFields = [],
  isDark,
  onSuccess,
  onAddCustomer,
  onOpenImport,
}) {
  // Form definitions & values state
  const [internalFormFields, setInternalFormFields] = useState([]);
  const [taskForm, setTaskForm] = useState({});
  const [loadingFields, setLoadingFields] = useState(false);
  const [createCustomerModalOpen, setCreateCustomerModalOpen] = useState(false);
  const {hasPermission} =useAuth()

  const activeFormFields = useMemo(() => {
    const rawFields =
      propFormFields && propFormFields.length > 0
        ? propFormFields
        : internalFormFields;

    const seenNames = new Set();
    const seenLabels = new Set();

    return rawFields.filter((f) => {
      if (!f || (!f.name && !f.label)) return false;
      const nameKey = (f.name || "").toLowerCase();
      const labelKey = (f.label || "").toLowerCase();

      if (nameKey && seenNames.has(nameKey)) return false;
      if (labelKey && seenLabels.has(labelKey)) return false;

      if (nameKey) seenNames.add(nameKey);
      if (labelKey) seenLabels.add(labelKey);

      return true;
    });
  }, [propFormFields, internalFormFields]);

  // Customer dropdown state & backend search
  const [customersList, setCustomersList] = useState([]);
  const [customerOpen, setCustomerOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const customerDropdownRef = useRef(null);

  // Task Type dropdown state & backend search
  const [taskTypeList, setTaskTypeList] = useState([]);
  const [taskTypeOpen, setTaskTypeOpen] = useState(false);
  const [taskTypeSearch, setTaskTypeSearch] = useState("");
  const [loadingTaskType, setLoadingTaskType] = useState(false);
  const taskTypeDropdownRef = useRef(null);

  // Employee dropdown state & backend search
  const [employeesList, setEmployeesList] = useState([]);
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [employeeOpen, setEmployeeOpen] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const employeeDropdownRef = useRef(null);

  // Submit button loading state
  const [submitting, setSubmitting] = useState(false);

  const initTaskForm = (fields) => {
    if (addModalOpen) {
      const blankForm = {};
      fields.forEach((f) => {
        blankForm[f.name] = f.type === "checkbox" ? false : "";
      });
      setTaskForm(blankForm);
    } else if (activeTask) {
      const editForm = {};
      fields.forEach((f) => {
        let val = activeTask[f.name];

        // Check field aliases if value is missing on activeTask
        if (
          (val === undefined || val === null || val === "") &&
          (f.name === "assigneeToEmployeeId" ||
            f.name === "assignedTo" ||
            f.name === "employeeId" ||
            f.name === "employee" ||
            f.name === "employeeIden")
        ) {
          val =
            activeTask.assigneeToEmployeeId ??
            activeTask.assignedTo ??
            activeTask.employeeId ??
            activeTask.employee ??
            activeTask.employeeIden;
        }

        if (
          (val === undefined || val === null || val === "") &&
          (f.name === "customerId" || f.name === "customer")
        ) {
          val = activeTask.customerId ?? activeTask.customer;
        }

        if (
          (val === undefined || val === null || val === "") &&
          (f.name === "taskType" || f.name === "type")
        ) {
          val = activeTask.taskType ?? activeTask.type ?? activeTask.typeDetails;
        }

        let finalVal = val;
        if (val && typeof val === "object") {
          finalVal =
            val.id !== undefined
              ? val.id
              : val._id !== undefined
              ? val._id
              : val.emp_id !== undefined
              ? val.emp_id
              : val;
        }
        editForm[f.name] =
          finalVal !== undefined && finalVal !== null
            ? finalVal
            : f.type === "checkbox"
              ? false
              : "";
      });
      setTaskForm(editForm);
    }
  };

  // Fetch form field definitions from backend if not passed via props
  const loadFormFields = async () => {
    setLoadingFields(true);
    try {
      const res = await TaskRoute.getCreateTaskFormFields();
      if (res?.success && res.data?.fields) {
        const fields = res.data.fields;
        setInternalFormFields(fields);
        initTaskForm(fields);
      }
    } catch (err) {
      console.error("Error loading form fields:", err);
    } finally {
      setLoadingFields(false);
    }
  };

  const fetchTaskType = async (query = "") => {
    setLoadingTaskType(true);
    try {
      const res = await TaskTypeRoute.getAllTaskTypes({ search: query });
      if (res?.success) {
        const list =
          res.data?.taskTypes ||
          res.data?.taskType ||
          (Array.isArray(res.data) ? res.data : []);
        setTaskTypeList(list);
      }
    } catch (error) {
      console.error("Error fetching task types:", error);
    } finally {
      setLoadingTaskType(false);
    }
  };

  // Fetch customers from backend with search query
  const fetchCustomers = async (query = "") => {
    setLoadingCustomers(true);
    try {
      const res = await CustomerRoute.getCustomers({ search: query });
      if (res?.success) {
        const list =
          res.data?.customers ||
          res.data?.customer ||
          (Array.isArray(res.data) ? res.data : []);
        setCustomersList(list);
      }
    } catch (err) {
      console.error("Error fetching customers:", err);
    } finally {
      setLoadingCustomers(false);
    }
  };

  const handleCustomerCreated = async (newCustomer) => {
    await fetchCustomers("");
    if (newCustomer) {
      const newId = newCustomer.id || newCustomer._id;
      const ownerVal =
        typeof newCustomer.owner === "object" && newCustomer.owner !== null
          ? newCustomer.owner.id || newCustomer.owner._id || newCustomer.owner.emp_id || newCustomer.owner.identity
          : newCustomer.owner || newCustomer.ownerId || newCustomer.owner_id;

      setTaskForm((prev) => ({
        ...prev,
        customerId: newId,
        customer: newId,
        ...(ownerVal !== undefined && ownerVal !== null && ownerVal !== ""
          ? {
              assigneeToEmployeeId: ownerVal,
              assignedTo: ownerVal,
              employeeId: ownerVal,
              employee: ownerVal,
            }
          : {}),
      }));
    }
  };

  // Fetch employees from backend with search query
  const fetchEmployees = async (query = "") => {
    setLoadingEmployees(true);
    try {
      const res = await EmployeeRoute.getAllEmployee({ search: query });
      if (res?.success) {
        let list =
          res.data?.employees ||
          res.data?.employee ||
          (Array.isArray(res.data) ? res.data : []);

        if (activeTask) {
          const empFromTask =
            typeof activeTask.assigneeToEmployeeId === "object" && activeTask.assigneeToEmployeeId
              ? activeTask.assigneeToEmployeeId
              : typeof activeTask.assignedTo === "object" && activeTask.assignedTo
              ? activeTask.assignedTo
              : typeof activeTask.employee === "object" && activeTask.employee
              ? activeTask.employee
              : null;

          if (empFromTask) {
            const empId = empFromTask.id || empFromTask._id || empFromTask.emp_id || empFromTask.identity;
            const exists = list.some(
              (e) =>
                String(e.id || "") === String(empId) ||
                String(e._id || "") === String(empId) ||
                String(e.emp_id || "") === String(empId) ||
                String(e.identity || "") === String(empId)
            );
            if (!exists) {
              list = [empFromTask, ...list];
            }
          }
        }
        setEmployeesList(list);
      }
    } catch (err) {
      console.error("Error fetching employees:", err);
    } finally {
      setLoadingEmployees(false);
    }
  };

  // On modal open: populate form fields, reset search & load initial dropdowns
  useEffect(() => {
    if (open) {
      setCustomerSearch("");
      setTaskTypeSearch("");
      setEmployeeSearch("");
      fetchCustomers("");
      fetchTaskType("");
      fetchEmployees("");

      if (propFormFields && propFormFields.length > 0) {
        initTaskForm(propFormFields);
      } else {
        loadFormFields();
      }
    }
  }, [open, addModalOpen, activeTask, propFormFields]);



  // MUI debounced search handlers (400ms delay)
  const debouncedFetchTaskType = useMemo(
    () => debounce((query) => fetchTaskType(query), 400),
    []
  );

  const debouncedFetchCustomers = useMemo(
    () => debounce((query) => fetchCustomers(query), 400),
    []
  );

  const debouncedFetchEmployees = useMemo(
    () => debounce((query) => fetchEmployees(query), 400),
    []
  );

  // Clear pending debounced requests on unmount
  useEffect(() => {
    return () => {
      debouncedFetchTaskType.clear?.();
      debouncedFetchCustomers.clear?.();
      debouncedFetchEmployees.clear?.();
    };
  }, [debouncedFetchTaskType, debouncedFetchCustomers, debouncedFetchEmployees]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (
        customerDropdownRef.current &&
        !customerDropdownRef.current.contains(e.target)
      ) {
        setCustomerOpen(false);
      }
      if (
        taskTypeDropdownRef.current &&
        !taskTypeDropdownRef.current.contains(e.target)
      ) {
        setTaskTypeOpen(false);
      }
      if (
        employeeDropdownRef.current &&
        !employeeDropdownRef.current.contains(e.target)
      ) {
        setEmployeeOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Handle form submission (Create or Update Task API call)
  const handleSubmitForm = async () => {
    const requiredField = activeFormFields.find(
      (f) => f.required && !taskForm[f.name]
    );
    if (requiredField) {
      toast.error(`"${requiredField.label}" is required!`);
      return;
    }

    setSubmitting(true);
    try {
      if (addModalOpen) {
        const res = await TaskRoute.createTask(taskForm);
        if (res?.success) {
          toast.success("Task created successfully!");
          if (typeof onSuccess === "function") {
            onSuccess();
          }
          onClose();
        } else {
          toast.error(res?.message || "Failed to create task");
        }
      } else {
        // Update Task logic
        const taskId = activeTask?.id || activeTask?.task_id || activeTask?.slug;
        const res = await TaskRoute.updateTask(taskId, taskForm);
        if (res?.success) {
          toast.success("Task updated successfully!");
          if (typeof onSuccess === "function") {
            onSuccess();
          }
          onClose();
        } else {
          toast.error(res?.message || "Failed to update task");
        }
      }
    } catch (error) {
      console.error("Error submitting task form:", error);
      toast.error("An error occurred while saving the task.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "16px",
            backgroundColor: isDark ? "#0f172a" : "#ffffff",
            color: isDark ? "#ffffff" : "#0f172a",
            border: isDark ? "1px solid #1e293b" : "1px solid #e2e8f0",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          {addModalOpen
            ? "Create New Task"
            : `Edit Task: ${activeTask?.task_id ?? ""}`}
        </DialogTitle>

        <DialogContent dividers>
          {addModalOpen && onOpenImport && (
            <div
              className={`p-3 rounded-xl border flex items-center justify-between gap-2 mb-3 ${
                isDark
                  ? "bg-indigo-950/40 border-indigo-800/50 text-indigo-200"
                  : "bg-indigo-50/80 border-indigo-100 text-indigo-900"
              }`}
            >
              <div className="flex items-center gap-2">
                <UploadFileIcon
                  className={isDark ? "text-indigo-400" : "text-indigo-600"}
                  fontSize="small"
                />
                <span className="text-xs font-semibold">
                  Want to import tasks in bulk via Excel file?
                </span>
              </div>
              <Button
                size="small"
                variant="outlined"
                onClick={() => {
                  onClose();
                  onOpenImport();
                }}
                sx={{
                  textTransform: "none",
                  borderRadius: "8px",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                }}
              >
                Upload Excel
              </Button>
            </div>
          )}

          {loadingFields ? (
            <div
              style={{
                padding: "40px 0",
                textAlign: "center",
                fontSize: "14px",
                color: isDark ? "#94a3b8" : "#64748b",
              }}
            >
              Loading form fields...
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 pt-1">
              {activeFormFields.map((field, index) => {
                const fieldKey = `${field.name || "field"}-${index}`;
                const fieldId = `field-${field.name || "field"}-${index}`;
                const value =
                  taskForm[field.name] ?? (field.type === "checkbox" ? false : "");
                const onChange = (val) =>
                  setTaskForm((prev) => {
                    const updated = { ...prev, [field.name]: val };
                    if (
                      (field.name === "startDateTime" || field.name === "startDate") &&
                      val
                    ) {
                      if (updated.endDateTime && new Date(updated.endDateTime) < new Date(val)) {
                        updated.endDateTime = "";
                      }
                      if (updated.endDate && new Date(updated.endDate) < new Date(val)) {
                        updated.endDate = "";
                      }
                    }
                    return updated;
                  });

                const FieldLabel = () => (
                  <label
                    htmlFor={fieldId}
                    className="block text-xs font-semibold mb-1"
                    style={{ color: isDark ? "#94a3b8" : "#475569" }}
                  >
                    {field.label}
                    {field.required && (
                      <span className="text-rose-400 ml-1">*</span>
                    )}
                  </label>
                );

                const nativeInputStyle = {
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "10px",
                  border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "#cbd5e1"
                    }`,
                  backgroundColor: isDark ? "rgba(15,23,42,0.6)" : "#fff",
                  color: isDark ? "#fff" : "#0f172a",
                  fontSize: "14px",
                  outline: "none",
                  colorScheme: isDark ? "dark" : "light",
                  transition: "border-color 0.2s",
                };

                // ── taskType / tasktype / task_type / taskTypeId — searchable task type picker ────────
                if (
                  field.name === "taskType" ||
                  field.name === "tasktype" ||
                  field.name === "task_type" ||
                  field.name === "taskTypeId"
                ) {
                  const selectedTaskType = taskTypeList.find(
                    (t) =>
                      String(t.id || t._id) ===
                      String(
                        typeof value === "object" && value !== null
                          ? value.id || value._id
                          : value
                      )
                  );

                  const displayTaskTypeName = selectedTaskType
                    ? selectedTaskType.name ||
                    selectedTaskType.task_type_id ||
                    selectedTaskType.slug
                    : typeof value === "object" && value !== null
                      ? value.name || value.slug
                      : value || "";

                  return (
                    <div
                      key={fieldKey}
                      className="flex flex-col"
                      style={{ position: "relative" }}
                      ref={taskTypeDropdownRef}
                    >
                      <FieldLabel />
                      {/* Trigger Button */}
                      <button
                        type="button"
                        onClick={() => setTaskTypeOpen((o) => !o)}
                        style={{
                          ...nativeInputStyle,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          cursor: "pointer",
                          textAlign: "left",
                          borderColor: taskTypeOpen
                            ? isDark
                              ? "#6366f1"
                              : "#0f172a"
                            : isDark
                              ? "rgba(255,255,255,0.1)"
                              : "#cbd5e1",
                        }}
                      >
                        <span
                          style={{
                            color: displayTaskTypeName
                              ? isDark
                                ? "#fff"
                                : "#0f172a"
                              : isDark
                                ? "#64748b"
                                : "#94a3b8",
                          }}
                        >
                          {displayTaskTypeName || "Select Task Type"}
                        </span>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          style={{
                            color: isDark ? "#94a3b8" : "#475569",
                            flexShrink: 0,
                          }}
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </button>

                      {/* Task Type Dropdown */}
                      {taskTypeOpen && (
                        <div
                          style={{
                            position: "absolute",
                            zIndex: 9999,
                            top: "100%",
                            marginTop: "4px",
                            width: "100%",
                            backgroundColor: isDark ? "#0f172a" : "#ffffff",
                            border: `1px solid ${isDark ? "#1e293b" : "#e2e8f0"}`,
                            borderRadius: "10px",
                            boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
                            maxHeight: "240px",
                            display: "flex",
                            flexDirection: "column",
                            overflow: "hidden",
                          }}
                        >
                          {/* Search Input */}
                          <div
                            style={{
                              padding: "8px",
                              borderBottom: `1px solid ${isDark ? "#1e293b" : "#e2e8f0"
                                }`,
                            }}
                          >
                            <input
                              autoFocus
                              type="text"
                              placeholder="Search task type..."
                              value={taskTypeSearch}
                              onChange={(e) => {
                                const val = e.target.value;
                                setTaskTypeSearch(val);
                                debouncedFetchTaskType(val);
                              }}
                              style={{
                                width: "100%",
                                padding: "6px 10px",
                                borderRadius: "8px",
                                border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "#cbd5e1"
                                  }`,
                                backgroundColor: isDark
                                  ? "rgba(15,23,42,0.6)"
                                  : "#f8fafc",
                                color: isDark ? "#fff" : "#0f172a",
                                fontSize: "13px",
                                outline: "none",
                              }}
                            />
                          </div>

                          {/* Task Type List */}
                          <div style={{ overflowY: "auto", flex: 1 }}>
                            {loadingTaskType ? (
                              <div
                                style={{
                                  padding: "12px",
                                  textAlign: "center",
                                  fontSize: "13px",
                                  color: isDark ? "#94a3b8" : "#64748b",
                                }}
                              >
                                Searching backend...
                              </div>
                            ) : taskTypeList.length === 0 ? (
                              <div
                                style={{
                                  padding: "16px",
                                  textAlign: "center",
                                  color: "#ef4444",
                                  fontSize: "13px",
                                  fontWeight: 500,
                                }}
                              >
                                No Records Found!
                              </div>
                            ) : (
                              taskTypeList.map((tt, ttIdx) => {
                                const ttId = tt.id || tt._id || ttIdx;
                                const ttName =
                                  tt.name ||
                                  tt.task_type_id ||
                                  tt.slug ||
                                  String(ttId);
                                const isSelected =
                                  String(tt.id || tt._id) ===
                                  String(
                                    typeof value === "object" && value !== null
                                      ? value.id || value._id
                                      : value
                                  );
                                return (
                                  <button
                                    key={`tt-${ttId}-${ttIdx}`}
                                    type="button"
                                    onClick={() => {
                                      onChange(tt.id || tt._id);
                                      setTaskTypeOpen(false);
                                    }}
                                    style={{
                                      display: "block",
                                      width: "100%",
                                      padding: "9px 14px",
                                      textAlign: "left",
                                      backgroundColor: isSelected
                                        ? isDark
                                          ? "rgba(99,102,241,0.15)"
                                          : "#eef2ff"
                                        : "transparent",
                                      color: isDark ? "#e2e8f0" : "#1e293b",
                                      fontSize: "13px",
                                      cursor: "pointer",
                                      border: "none",
                                      outline: "none",
                                      transition: "background 0.15s",
                                    }}
                                    onMouseEnter={(e) =>
                                    (e.currentTarget.style.backgroundColor = isDark
                                      ? "rgba(255,255,255,0.06)"
                                      : "#f1f5f9")
                                    }
                                    onMouseLeave={(e) =>
                                    (e.currentTarget.style.backgroundColor = isSelected
                                      ? isDark
                                        ? "rgba(99,102,241,0.15)"
                                        : "#eef2ff"
                                      : "transparent")
                                    }
                                  >
                                    {ttName}
                                  </button>
                                );
                              })
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                // ── customerId / customer — searchable customer picker ────────
                if (field.name === "customerId" || field.name === "customer") {
                  const getCustLabel = (c) => {
                    if (!c) return "";
                    const name =
                      c.name ||
                      c.customer_name ||
                      c.companyName ||
                      c.email ||
                      "";
                    const code = c.customer_id || c.id || c._id || "";
                    return code ? `${name} (${code})` : name;
                  };

                  const selectedCustomer = customersList.find(
                    (c) => String(c.id || c._id) === String(value)
                  );

                  const displayCustomerText = selectedCustomer
                    ? getCustLabel(selectedCustomer)
                    : typeof value === "object" && value !== null
                    ? getCustLabel(value)
                    : value
                    ? `Customer #${value}`
                    : "Select Customer";

                  return (
                    <div
                      key={fieldKey}
                      className="flex flex-col"
                      style={{ position: "relative" }}
                      ref={customerDropdownRef}
                    >
                      <FieldLabel />
                      {/* Trigger Button */}
                      <button
                        type="button"
                        onClick={() => setCustomerOpen((o) => !o)}
                        style={{
                          ...nativeInputStyle,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          cursor: "pointer",
                          textAlign: "left",
                          borderColor: customerOpen
                            ? isDark
                              ? "#6366f1"
                              : "#0f172a"
                            : isDark
                              ? "rgba(255,255,255,0.1)"
                              : "#cbd5e1",
                        }}
                      >
                        <span
                          style={{
                            color: selectedCustomer || (typeof value === "object" && value !== null)
                              ? isDark
                                ? "#fff"
                                : "#0f172a"
                              : isDark
                                ? "#64748b"
                                : "#94a3b8",
                          }}
                        >
                          {displayCustomerText}
                        </span>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          style={{
                            color: isDark ? "#94a3b8" : "#475569",
                            flexShrink: 0,
                          }}
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </button>

                      {/* Customer Dropdown */}
                      {customerOpen && (
                        <div
                          style={{
                            position: "absolute",
                            zIndex: 9999,
                            top: "100%",
                            marginTop: "4px",
                            width: "100%",
                            backgroundColor: isDark ? "#0f172a" : "#ffffff",
                            border: `1px solid ${isDark ? "#1e293b" : "#e2e8f0"}`,
                            borderRadius: "10px",
                            boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
                            maxHeight: "240px",
                            display: "flex",
                            flexDirection: "column",
                            overflow: "hidden",
                          }}
                        >
                          {/* Search Input & Add New Button */}
                          <div
                            style={{
                              padding: "8px",
                              display: "flex",
                              gap: "6px",
                              alignItems: "center",
                              borderBottom: `1px solid ${isDark ? "#1e293b" : "#e2e8f0"
                                }`,
                            }}
                          >
                            <input
                              autoFocus
                              type="text"
                              placeholder="Search customer..."
                              value={customerSearch}
                              onChange={(e) => {
                                const val = e.target.value;
                                setCustomerSearch(val);
                                debouncedFetchCustomers(val);
                              }}
                              style={{
                                flex: 1,
                                minWidth: 0,
                                padding: "6px 10px",
                                borderRadius: "8px",
                                border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "#cbd5e1"
                                  }`,
                                backgroundColor: isDark
                                  ? "rgba(15,23,42,0.6)"
                                  : "#f8fafc",
                                color: isDark ? "#fff" : "#0f172a",
                                fontSize: "13px",
                                outline: "none",
                              }}
                            />
                            {hasPermission("customer", "add") && <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCustomerOpen(false);
                                if (typeof onAddCustomer === "function") {
                                  onAddCustomer();
                                } else {
                                  setCreateCustomerModalOpen(true);
                                }
                              }}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                padding: "6px 10px",
                                borderRadius: "8px",
                                backgroundColor: "#6366f1",
                                color: "#ffffff",
                                fontSize: "12px",
                                fontWeight: 600,
                                border: "none",
                                cursor: "pointer",
                                whiteSpace: "nowrap",
                                flexShrink: 0,
                                transition: "background-color 0.15s",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.backgroundColor = "#4f46e5")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor = "#6366f1")
                              }
                              title="Add New Customer"
                            >
                              + Add New
                            </button>}
                          </div>

                          {/* Customer List */}
                          <div style={{ overflowY: "auto", flex: 1 }}>
                            {loadingCustomers ? (
                              <div
                                style={{
                                  padding: "12px",
                                  textAlign: "center",
                                  fontSize: "13px",
                                  color: isDark ? "#94a3b8" : "#64748b",
                                }}
                              >
                                Searching backend...
                              </div>
                            ) : customersList.length === 0 ? (
                              <div
                                style={{
                                  padding: "16px",
                                  textAlign: "center",
                                  color: "#ef4444",
                                  fontSize: "13px",
                                  fontWeight: 500,
                                }}
                              >
                                No Records Found!
                              </div>
                            ) : (
                              customersList.map((c, cIdx) => {
                                const cId = c.id || c._id || cIdx;
                                const cLabel = getCustLabel(c) || String(cId);
                                return (
                                  <button
                                    key={`cust-${cId}-${cIdx}`}
                                    type="button"
                                    onClick={() => {
                                      const custVal = c.id || c._id;
                                      onChange(custVal);
                                      setCustomerOpen(false);

                                      const ownerVal =
                                        typeof c.owner === "object" && c.owner !== null
                                          ? c.owner.id || c.owner._id || c.owner.emp_id || c.owner.identity
                                          : c.owner || c.ownerId || c.owner_id;

                                      if (ownerVal !== undefined && ownerVal !== null && ownerVal !== "") {
                                        setTaskForm((prev) => ({
                                          ...prev,
                                          [field.name]: custVal,
                                          customerId: custVal,
                                          customer: custVal,
                                          assigneeToEmployeeId: ownerVal,
                                          assignedTo: ownerVal,
                                          employeeId: ownerVal,
                                          employee: ownerVal,
                                        }));
                                      }
                                    }}
                                    style={{
                                      display: "block",
                                      width: "100%",
                                      padding: "9px 14px",
                                      textAlign: "left",
                                      backgroundColor:
                                        String(c.id || c._id) === String(value)
                                          ? isDark
                                            ? "rgba(99,102,241,0.15)"
                                            : "#eef2ff"
                                          : "transparent",
                                      color: isDark ? "#e2e8f0" : "#1e293b",
                                      fontSize: "13px",
                                      cursor: "pointer",
                                      border: "none",
                                      outline: "none",
                                      transition: "background 0.15s",
                                    }}
                                    onMouseEnter={(e) =>
                                    (e.currentTarget.style.backgroundColor = isDark
                                      ? "rgba(255,255,255,0.06)"
                                      : "#f1f5f9")
                                    }
                                    onMouseLeave={(e) =>
                                    (e.currentTarget.style.backgroundColor =
                                      String(c.id || c._id) === String(value)
                                        ? isDark
                                          ? "rgba(99,102,241,0.15)"
                                          : "#eef2ff"
                                        : "transparent")
                                    }
                                  >
                                    {cLabel}
                                  </button>
                                );
                              })
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                // ── employeeId / assigneeToEmployeeId / employee — searchable employee picker ────────
                if (
                  field.name === "assigneeToEmployeeId" ||
                  field.name === "assignedTo" ||
                  field.name === "employeeId" ||
                  field.name === "employee" ||
                  field.name === "employeeIden"
                ) {
                  const getEmpLabel = (emp) => {
                    if (!emp) return "";
                    if (typeof emp === "string") return emp;
                    const name =
                      emp.name ||
                      (emp.first_name
                        ? `${emp.first_name} ${emp.last_name || ""}`.trim()
                        : emp.email || emp.username || (emp.emp_id ? `Employee #${emp.emp_id}` : String(emp.id || emp._id || "")));
                    const code = emp.emp_id || emp.identity || (emp.id !== undefined && String(emp.id) !== String(name) ? emp.id : "");
                    return code && String(code) !== String(name) ? `${name} (${code})` : name;
                  };

                  const selectedEmployee = employeesList.find(
                    (e) =>
                      String(e.id || "") === String(value) ||
                      String(e._id || "") === String(value) ||
                      String(e.emp_id || "") === String(value) ||
                      String(e.identity || "") === String(value)
                  );

                  const activeEmpObj =
                    typeof activeTask === "object" && activeTask
                      ? (typeof activeTask.assigneeToEmployeeId === "object" && activeTask.assigneeToEmployeeId) ||
                        (typeof activeTask.assignedTo === "object" && activeTask.assignedTo) ||
                        (typeof activeTask.employee === "object" && activeTask.employee)
                      : null;

                  const isEmpSelected = Boolean(
                    selectedEmployee ||
                      (typeof value === "object" && value !== null) ||
                      (activeEmpObj &&
                        (String(activeEmpObj.id || "") === String(value) ||
                          String(activeEmpObj._id || "") === String(value) ||
                          String(activeEmpObj.emp_id || "") === String(value) ||
                          String(activeEmpObj.identity || "") === String(value))) ||
                      (typeof activeTask?.assignedTo === "string" && activeTask.assignedTo)
                  );

                  const displayEmployeeText = selectedEmployee
                    ? getEmpLabel(selectedEmployee)
                    : typeof value === "object" && value !== null
                    ? getEmpLabel(value)
                    : activeEmpObj &&
                      (String(activeEmpObj.id || "") === String(value) ||
                        String(activeEmpObj._id || "") === String(value) ||
                        String(activeEmpObj.emp_id || "") === String(value) ||
                        String(activeEmpObj.identity || "") === String(value))
                    ? getEmpLabel(activeEmpObj)
                    : value
                    ? (typeof activeTask?.assignedTo === "string" ? activeTask.assignedTo : `Employee #${value}`)
                    : "Select Employee";

                  return (
                    <div
                      key={fieldKey}
                      className="flex flex-col"
                      style={{ position: "relative" }}
                      ref={employeeDropdownRef}
                    >
                      <FieldLabel />
                      {/* Trigger Button */}
                      <button
                        type="button"
                        onClick={() => setEmployeeOpen((o) => !o)}
                        style={{
                          ...nativeInputStyle,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          cursor: "pointer",
                          textAlign: "left",
                          borderColor: employeeOpen
                            ? isDark
                              ? "#6366f1"
                              : "#0f172a"
                            : isDark
                              ? "rgba(255,255,255,0.1)"
                              : "#cbd5e1",
                        }}
                      >
                        <span
                          style={{
                            color: isEmpSelected
                              ? isDark
                                ? "#fff"
                                : "#0f172a"
                              : isDark
                                ? "#64748b"
                                : "#94a3b8",
                          }}
                        >
                          {displayEmployeeText}
                        </span>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          style={{
                            color: isDark ? "#94a3b8" : "#475569",
                            flexShrink: 0,
                          }}
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </button>

                      {/* Employee Dropdown */}
                      {employeeOpen && (
                        <div
                          style={{
                            position: "absolute",
                            zIndex: 9999,
                            top: "100%",
                            marginTop: "4px",
                            width: "100%",
                            backgroundColor: isDark ? "#0f172a" : "#ffffff",
                            border: `1px solid ${isDark ? "#1e293b" : "#e2e8f0"}`,
                            borderRadius: "10px",
                            boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
                            maxHeight: "240px",
                            display: "flex",
                            flexDirection: "column",
                            overflow: "hidden",
                          }}
                        >
                          {/* Search Input */}
                          <div
                            style={{
                              padding: "8px",
                              borderBottom: `1px solid ${isDark ? "#1e293b" : "#e2e8f0"
                                }`,
                            }}
                          >
                            <input
                              autoFocus
                              type="text"
                              placeholder="Search employee by name or emp_id..."
                              value={employeeSearch}
                              onChange={(e) => {
                                const val = e.target.value;
                                setEmployeeSearch(val);
                                debouncedFetchEmployees(val);
                              }}
                              style={{
                                width: "100%",
                                padding: "6px 10px",
                                borderRadius: "8px",
                                border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "#cbd5e1"
                                  }`,
                                backgroundColor: isDark
                                  ? "rgba(15,23,42,0.6)"
                                  : "#f8fafc",
                                color: isDark ? "#fff" : "#0f172a",
                                fontSize: "13px",
                                outline: "none",
                              }}
                            />
                          </div>

                          {/* Employee List */}
                          <div style={{ overflowY: "auto", flex: 1 }}>
                            {loadingEmployees ? (
                              <div
                                style={{
                                  padding: "12px",
                                  textAlign: "center",
                                  fontSize: "13px",
                                  color: isDark ? "#94a3b8" : "#64748b",
                                }}
                              >
                                Searching backend...
                              </div>
                            ) : employeesList.length === 0 ? (
                              <div
                                style={{
                                  padding: "16px",
                                  textAlign: "center",
                                  color: "#ef4444",
                                  fontSize: "13px",
                                  fontWeight: 500,
                                }}
                              >
                                No Records Found!
                              </div>
                            ) : (
                              employeesList.map((emp, empIdx) => {
                                const empId = emp.id || emp._id || emp.emp_id || empIdx;
                                const empLabel = getEmpLabel(emp) || String(empId);
                                const isSelected =
                                  String(emp.id || "") === String(value) ||
                                  String(emp._id || "") === String(value) ||
                                  String(emp.emp_id || "") === String(value) ||
                                  String(emp.identity || "") === String(value);

                                return (
                                  <button
                                    key={`emp-${empId}-${empIdx}`}
                                    type="button"
                                    onClick={() => {
                                      onChange(emp.id || emp._id || emp.emp_id || empId);
                                      setEmployeeOpen(false);
                                    }}
                                    style={{
                                      display: "block",
                                      width: "100%",
                                      padding: "9px 14px",
                                      textAlign: "left",
                                      backgroundColor: isSelected
                                        ? isDark
                                          ? "rgba(99,102,241,0.15)"
                                          : "#eef2ff"
                                        : "transparent",
                                      color: isDark ? "#e2e8f0" : "#1e293b",
                                      fontSize: "13px",
                                      cursor: "pointer",
                                      border: "none",
                                      outline: "none",
                                      transition: "background 0.15s",
                                    }}
                                    onMouseEnter={(e) =>
                                    (e.currentTarget.style.backgroundColor = isDark
                                      ? "rgba(255,255,255,0.06)"
                                      : "#f1f5f9")
                                    }
                                    onMouseLeave={(e) =>
                                    (e.currentTarget.style.backgroundColor = isSelected
                                      ? isDark
                                        ? "rgba(99,102,241,0.15)"
                                        : "#eef2ff"
                                      : "transparent")
                                    }
                                  >
                                    {empLabel}
                                  </button>
                                );
                              })
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                // ── checkbox ──────────────────────────────────────
                if (field.type === "checkbox") {
                  return (
                    <div
                      key={fieldKey}
                      className="col-span-2 flex items-center gap-3 py-1"
                    >
                      <input
                        id={fieldId}
                        type="checkbox"
                        checked={!!value}
                        onChange={(e) => onChange(e.target.checked)}
                        className="w-4 h-4 accent-indigo-500 cursor-pointer"
                      />
                      <label
                        htmlFor={fieldId}
                        className="text-sm font-medium cursor-pointer select-none"
                        style={{ color: isDark ? "#cbd5e1" : "#334155" }}
                      >
                        {field.label}
                        {field.required && (
                          <span className="text-rose-400 ml-1">*</span>
                        )}
                      </label>
                    </div>
                  );
                }

                // ── textarea ──────────────────────────────────────
                if (field.type === "textarea") {
                  return (
                    <div key={fieldKey} className="col-span-2 flex flex-col">
                      <FieldLabel />
                      <textarea
                        id={fieldId}
                        rows={3}
                        placeholder={field.placeholder || ""}
                        value={value}
                        required={field.required}
                        onChange={(e) => onChange(e.target.value)}
                        style={{
                          ...nativeInputStyle,
                          resize: "vertical",
                          lineHeight: "1.5",
                        }}
                        onFocus={(e) =>
                        (e.target.style.borderColor = isDark
                          ? "#6366f1"
                          : "#0f172a")
                        }
                        onBlur={(e) =>
                        (e.target.style.borderColor = isDark
                          ? "rgba(255,255,255,0.1)"
                          : "#cbd5e1")
                        }
                      />
                    </div>
                  );
                }

                // ── select ────────────────────────────────────────
                if (field.type === "select") {
                  return (
                    <div key={fieldKey} className="flex flex-col">
                      <FieldLabel />
                      <select
                        id={fieldId}
                        value={value}
                        required={field.required}
                        onChange={(e) => onChange(e.target.value)}
                        style={{ ...nativeInputStyle, cursor: "pointer" }}
                        onFocus={(e) =>
                        (e.target.style.borderColor = isDark
                          ? "#6366f1"
                          : "#0f172a")
                        }
                        onBlur={(e) =>
                        (e.target.style.borderColor = isDark
                          ? "rgba(255,255,255,0.1)"
                          : "#cbd5e1")
                        }
                      >
                        <option
                          value=""
                          style={{ backgroundColor: isDark ? "#0f172a" : "#fff" }}
                        >
                          — Select —
                        </option>
                        {(field.options || []).map((opt, optIdx) => (
                          <option
                            key={`opt-${opt.value || optIdx}-${optIdx}`}
                            value={opt.value}
                            style={{ backgroundColor: isDark ? "#0f172a" : "#fff" }}
                          >
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                }

                // ── datetime-local | time | date | text | number ──
                let minVal = undefined;
                if (field.name === "startDateTime" || field.name === "startDate") {
                  if (addModalOpen) {
                    minVal = getCurrentDateTimeLocal();
                  }
                } else if (field.name === "endDateTime" || field.name === "endDate") {
                  minVal =
                    taskForm.startDateTime ||
                    taskForm.startDate ||
                    (addModalOpen ? getCurrentDateTimeLocal() : undefined);
                }

                return (
                  <div key={fieldKey} className="flex flex-col">
                    <FieldLabel />
                    <input
                      id={fieldId}
                      type={field.type}
                      placeholder={field.placeholder || ""}
                      value={value}
                      required={field.required}
                      min={minVal}
                      onChange={(e) => onChange(e.target.value)}
                      style={nativeInputStyle}
                      onFocus={(e) =>
                      (e.target.style.borderColor = isDark
                        ? "#6366f1"
                        : "#0f172a")
                      }
                      onBlur={(e) =>
                      (e.target.style.borderColor = isDark
                        ? "rgba(255,255,255,0.1)"
                        : "#cbd5e1")
                      }
                    />
                  </div>
                );
              })}
            </div>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} variant="outlined" disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmitForm}
            variant="contained"
            color="primary"
            disabled={submitting}
          >
            {submitting ? "Saving..." : addModalOpen ? "Create Task" : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>
      <CreateCustomerModel
        open={createCustomerModalOpen}
        onClose={() => setCreateCustomerModalOpen(false)}
        onSuccess={handleCustomerCreated}
        isDark={isDark}
      />
    </>
  );
}
