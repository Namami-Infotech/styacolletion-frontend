import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import * as XLSX from "xlsx";
import { TaskRoute } from "../../../routes/tasks/task.route.js";
import { CustomerRoute } from "../../../routes/customers/customer.route.js";
import { EmployeeRoute } from "../../../routes/employee/employee.route.js";
import { toast } from "react-toastify";

/**
 * Utility to generate and download Demo Excel Template matching Task Form Fields with custom column widths & sample rows
 */
export const downloadTaskDemoExcel = async (formFields = []) => {
  let sampleCustId = "101";
  let sampleEmpId = "5";

  try {
    const custRes = await CustomerRoute.getCustomers({ page: 1, limit: 1 });
    if (custRes?.success && custRes.data?.customers && custRes.data.customers.length > 0) {
      const c = custRes.data.customers[0];
      sampleCustId = c.customer_id || c.id;
    }

    const empRes = await EmployeeRoute.getEmployees({ page: 1, limit: 1 });
    if (empRes?.success && empRes.data?.employees && empRes.data.employees.length > 0) {
      const e = empRes.data.employees[0];
      sampleEmpId = e.identity || e.emp_id || e.id;
    }
  } catch (err) {
    console.log("Pre-fetching customer/employee for template fallback:", err);
  }

  const sampleRow1 = {
    "Task Type": "Custom",
    "Customer ID": sampleCustId,
    "Description": "Follow up with customer regarding documentation",
    "Payment Amount": 1500,
    "Priority": "high",
    "Assignee Employee ID": sampleEmpId,
    "Start Date & Time": "2026-08-10 10:00:00",
    "End Date & Time": "2026-08-15 18:00:00",
    "Repeat Task": "false",
    "Frequency": "day",
    "Interval": 1,
    "Time": "10:00",
  };

  const sampleRow2 = {
    "Task Type": "Onboarding",
    "Customer ID": sampleCustId,
    "Description": "Complete customer KYC verification and onboarding",
    "Payment Amount": 2500,
    "Priority": "medium",
    "Assignee Employee ID": sampleEmpId,
    "Start Date & Time": "2026-08-12 09:00:00",
    "End Date & Time": "2026-08-18 17:00:00",
    "Repeat Task": "true",
    "Frequency": "month",
    "Interval": 1,
    "Time": "09:00",
  };

  const ws = XLSX.utils.json_to_sheet([sampleRow1, sampleRow2]);

  // Set explicit column widths for neat Excel layout
  ws["!cols"] = [
    { wch: 16 }, // Task Type
    { wch: 20 }, // Customer ID
    { wch: 48 }, // Description
    { wch: 16 }, // Payment Amount
    { wch: 12 }, // Priority
    { wch: 22 }, // Assignee Employee ID
    { wch: 22 }, // Start Date & Time
    { wch: 22 }, // End Date & Time
    { wch: 14 }, // Repeat Task
    { wch: 14 }, // Frequency
    { wch: 10 }, // Interval
    { wch: 10 }, // Time
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Task_Import_Template");
  XLSX.writeFile(wb, "Task_Import_Demo.xlsx");
};

/**
 * Utility to export tasks list to formatted Excel
 */
export const exportTasksToExcel = (tasks = [], filename = "Tasks_Export.xlsx") => {
  if (!tasks || tasks.length === 0) {
    toast.error("No task data available to export.");
    return;
  }

  const exportData = tasks.map((t, idx) => {
    const cust = t.customerId;
    const emp = t.assigneeToEmployeeId;
    const creator = t.createdBy;

    return {
      "S.No": idx + 1,
      "Task ID": t.task_id || t.id || "",
      "Task Type": t.taskType?.name || (typeof t.taskType === "string" || typeof t.taskType === "number" ? t.taskType : ""),
      "Description": t.description || "",
      "Priority": t.priority ? String(t.priority).toUpperCase() : "MEDIUM",
      "Status": t.status ? String(t.status).toUpperCase() : "PENDING",
      "Customer Name": cust?.name || "",
      "Customer ID": cust?.customer_id || cust?.id || "",
      "Customer Phone": cust?.phone || "",
      "Customer Location": cust?.location || cust?.district || "",
      "Assignee Employee": emp?.name || "",
      "Employee Identity": emp?.identity || "",
      "Department": emp?.department || "",
      "Designations": emp?.designations || "",
      "Manager Name": emp?.manager?.name || "",
      "Manager Email": emp?.manager?.email || "",
      "Start Time": t.startDateTime ? new Date(t.startDateTime).toLocaleString() : "",
      "End Time": t.endDateTime ? new Date(t.endDateTime).toLocaleString() : "",
      "Repeat": t.repeat ? "Yes" : "No",
      "Frequency": t.frequency || "-",
      "Interval": t.interval || "-",
      "Payment Amount": t.payment_type ? `₹${t.payment_type}` : "₹0",
      "Created By": creator?.name || "",
      "Created At": t.createdAt ? new Date(t.createdAt).toLocaleString() : "",
    };
  });

  const ws = XLSX.utils.json_to_sheet(exportData);

  // Auto calculate column widths
  const colWidths = Object.keys(exportData[0] || {}).map((key) => {
    let maxLen = key.length;
    exportData.forEach((row) => {
      const val = row[key] ? String(row[key]) : "";
      if (val.length > maxLen) maxLen = val.length;
    });
    return { wch: Math.min(Math.max(maxLen + 3, 12), 50) };
  });

  ws["!cols"] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Tasks");
  XLSX.writeFile(wb, filename);
  toast.success(`Exported ${tasks.length} tasks to Excel successfully!`);
};

export default function TaskImportModal({
  open,
  onClose,
  formFields = [],
  isDark,
  onSuccess,
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setErrorMsg("");

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { defval: "" });

        if (data.length > 0) {
          setColumns(Object.keys(data[0]));
          setPreviewData(data);
        } else {
          setErrorMsg("The selected file is empty.");
          setPreviewData([]);
          setColumns([]);
        }
      } catch (err) {
        console.error("Error reading excel file:", err);
        setErrorMsg("Failed to parse Excel file. Please ensure it is a valid .xlsx or .xls file.");
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewData([]);
    setColumns([]);
    setErrorMsg("");
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast.error("Please select an Excel file to import.");
      return;
    }

    setUploading(true);
    setErrorMsg("");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await TaskRoute.uploadExcelTasks(formData);

      if (res?.success) {
        toast.success(res.message || `${res.data?.total || previewData.length} tasks imported successfully!`);
        if (typeof onSuccess === "function") {
          onSuccess();
        }
        handleReset();
        onClose();
      } else {
        const msg = res?.message || "Failed to import excel tasks.";
        setErrorMsg(msg);
        toast.error(msg);
      }
    } catch (err) {
      console.error("Error uploading excel:", err);
      setErrorMsg(err.message || "An unexpected error occurred during import.");
      toast.error("Import failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => {
        handleReset();
        onClose();
      }}
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
      <DialogTitle
        sx={{
          fontWeight: 800,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 1,
        }}
      >
        <div className="flex items-center gap-2">
          <UploadFileIcon className={isDark ? "text-indigo-400" : "text-indigo-600"} />
          <span>Import Tasks from Excel</span>
        </div>
        <IconButton
          onClick={() => {
            handleReset();
            onClose();
          }}
          size="small"
          sx={{ color: isDark ? "#94a3b8" : "#64748b" }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers className="space-y-4">
        {/* Banner with Format Instructions & Download Demo Excel Button */}
        <div
          className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
            isDark
              ? "bg-slate-900/90 border-slate-800 text-slate-200"
              : "bg-indigo-50/70 border-indigo-100 text-slate-800"
          }`}
        >
          <div className="space-y-1">
            <Typography variant="subtitle2" className="font-bold">
              Need sample format?
            </Typography>
            <Typography variant="caption" className={isDark ? "text-slate-400" : "text-slate-600"}>
              Download the demo Excel file containing all required & optional fields of the Task modal form.
            </Typography>
          </div>

          <Button
            onClick={() => downloadTaskDemoExcel(formFields)}
            variant="outlined"
            size="small"
            startIcon={<FileDownloadIcon />}
            sx={{
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 700,
              borderColor: isDark ? "#6366f1" : "#4f46e5",
              color: isDark ? "#818cf8" : "#4f46e5",
              whiteSpace: "nowrap",
              "&:hover": {
                borderColor: isDark ? "#818cf8" : "#3730a3",
                backgroundColor: isDark ? "rgba(99,102,241,0.1)" : "rgba(79,70,229,0.05)",
              },
            }}
          >
            Download Demo Excel
          </Button>
        </div>

        {/* File Input Selector */}
        <div className="flex flex-col space-y-2">
          <label className={`text-xs font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>
            Select Excel File (.xlsx, .xls, .csv)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileChange}
              style={{ display: "none" }}
              id="excel-task-file-input"
            />
            <label htmlFor="excel-task-file-input">
              <Button
                component="span"
                variant="contained"
                size="medium"
                startIcon={<UploadFileIcon />}
                sx={{
                  borderRadius: "10px",
                  textTransform: "none",
                  fontWeight: 600,
                  backgroundColor: isDark ? "#334155" : "#0f172a",
                  color: "#ffffff",
                  "&:hover": {
                    backgroundColor: isDark ? "#475569" : "#1e293b",
                  },
                }}
              >
                Choose File
              </Button>
            </label>
            <span className={`text-sm truncate max-w-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              {selectedFile ? selectedFile.name : "No file selected"}
            </span>
          </div>
        </div>

        {/* Error Alert if any */}
        {errorMsg && (
          <Alert severity="error" sx={{ borderRadius: "10px" }}>
            {errorMsg}
          </Alert>
        )}

        {/* File Preview Section */}
        {previewData.length > 0 && (
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <Typography variant="subtitle2" className="font-bold flex items-center gap-1">
                <CheckCircleIcon color="success" fontSize="small" />
                Previewing File ({previewData.length} total rows detected)
              </Typography>
              <Typography variant="caption" className={isDark ? "text-slate-400" : "text-slate-500"}>
                Showing first 5 rows
              </Typography>
            </div>

            <Paper
              variant="outlined"
              sx={{
                maxHeight: 250,
                overflow: "auto",
                borderRadius: "10px",
                borderColor: isDark ? "#1e293b" : "#e2e8f0",
                backgroundColor: isDark ? "rgba(15,23,42,0.5)" : "#f8fafc",
              }}
            >
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    {columns.map((col) => (
                      <TableCell
                        key={col}
                        sx={{
                          fontWeight: 700,
                          fontSize: "0.75rem",
                          backgroundColor: isDark ? "#1e293b" : "#e2e8f0",
                          color: isDark ? "#e2e8f0" : "#334155",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {col}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {previewData.slice(0, 5).map((row, idx) => (
                    <TableRow key={`preview-${idx}`}>
                      {columns.map((col) => (
                        <TableCell
                          key={`cell-${idx}-${col}`}
                          sx={{
                            fontSize: "0.75rem",
                            color: isDark ? "#cbd5e1" : "#475569",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {row[col] !== undefined && row[col] !== null ? String(row[col]) : ""}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </div>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={() => {
            handleReset();
            onClose();
          }}
          variant="outlined"
          disabled={uploading}
          sx={{ borderRadius: "10px", textTransform: "none" }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleImport}
          variant="contained"
          color="primary"
          disabled={!selectedFile || uploading || previewData.length === 0}
          startIcon={<UploadFileIcon />}
          sx={{
            borderRadius: "10px",
            textTransform: "none",
            fontWeight: 700,
            background: isDark
              ? "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)"
              : "#0f172a",
          }}
        >
          {uploading ? "Importing..." : `Import ${previewData.length} Tasks`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
