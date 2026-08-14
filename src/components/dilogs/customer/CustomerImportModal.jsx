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
import { CustomerRoute } from "../../../routes/customers/customer.route.js";
import { toast } from "react-toastify";

/**
 * Utility to generate and download Demo Excel Template matching Customer fields
 */
export const downloadCustomerDemoExcel = () => {
  const sampleRow1 = {
    "Customer Name": "Rahul Sharma",
    "Email Address": "rahul.sharma@example.com",
    "Phone Number": "9876543210",
    "Owner Employee": "EMP101",
    "Location": "Connaught Place, New Delhi",
    "District": "Central Delhi",
    "State": "Delhi",
    "Sub State": "North Delhi",
    "Pincode": "110001",
    "Branch": "Delhi Central",
    "Branch Code": "BR001",
    "Center": "CP Center",
    "Center Code": "CNT01",
    "Loan Type": "IL",
    "Loan No": "LN-1001",
    "Old Loan No": "OLD-LN-801",
    "Old Customer No": "OLD-CUST-101",
    "Cycle": 1,
    "Loan Disb Date": "2024-01-15",
    "Loan Amount": 50000,
    "O/S Principal": 40000,
    "O/S Interest": 2000,
    "PAR": 0,
    "O/D Principal": 0,
    "O/D Interest": 0,
    "Total Due Amount": 12000,
    "Total Principal Collectible": 5000,
    "Total Interest Collectible": 1000,
    "IRR Rate": 12.5,
    "No Of Installments": 12,
    "Last Due Date": "2024-12-15",
    "Last Paid Trx Date": "2024-11-10",
    "DPD": 0,
    "Paid Inst No": "10",
    "Loan Status": "Open",
    "Spouse Name": "Anita Sharma",
    "Installment Amount": 5000,
    "Maturity Date": "2025-01-15",
    "Pre Closure Amt": 42000,
    "Closed Date": "",
  };

  const sampleRow2 = {
    "Customer Name": "Priya Patel",
    "Email Address": "priya.patel@example.com",
    "Phone Number": "9812345678",
    "Owner Employee": "EMP102",
    "Location": "MG Road, Bengaluru",
    "District": "Bengaluru Urban",
    "State": "Karnataka",
    "Sub State": "South Bengaluru",
    "Pincode": "560001",
    "Branch": "Bengaluru Main",
    "Branch Code": "BR002",
    "Center": "MG Center",
    "Center Code": "CNT02",
    "Loan Type": "GL",
    "Loan No": "LN-1002",
    "Old Loan No": "OLD-LN-802",
    "Old Customer No": "OLD-CUST-102",
    "Cycle": 2,
    "Loan Disb Date": "2023-06-10",
    "Loan Amount": 100000,
    "O/S Principal": 0,
    "O/S Interest": 0,
    "PAR": 0,
    "O/D Principal": 0,
    "O/D Interest": 0,
    "Total Due Amount": 0,
    "Total Principal Collectible": 0,
    "Total Interest Collectible": 0,
    "IRR Rate": 14.0,
    "No Of Installments": 24,
    "Last Due Date": "2024-06-10",
    "Last Paid Trx Date": "2024-06-05",
    "DPD": 0,
    "Paid Inst No": "24",
    "Loan Status": "Closed",
    "Spouse Name": "Rohan Patel",
    "Installment Amount": 5000,
    "Maturity Date": "2024-06-10",
    "Pre Closure Amt": 0,
    "Closed Date": "2024-06-05",
  };

  const rows = [sampleRow1, sampleRow2];
  const ws = XLSX.utils.json_to_sheet(rows);

  // Auto-calculate column widths for clean Excel presentation
  const colWidths = Object.keys(rows[0]).map((key) => {
    let maxLen = key.length;
    rows.forEach((row) => {
      const val = row[key] !== undefined && row[key] !== null ? String(row[key]) : "";
      if (val.length > maxLen) maxLen = val.length;
    });
    return { wch: Math.min(Math.max(maxLen + 3, 14), 45) };
  });

  ws["!cols"] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Customer_Import_Template");
  XLSX.writeFile(wb, "Customer_Import_Demo.xlsx");
};

/**
 * Utility to export customer list to formatted Excel file
 */
export const exportCustomersToExcel = async (providedCustomers = [], filename = null) => {
  try {
    let dataToExport = providedCustomers;

    if (!dataToExport || dataToExport.length === 0) {
      toast.info("Fetching customer data for export...");
      const res = await CustomerRoute.getCustomers({ limit: "all" });
      if (res?.success && res?.data?.customers && res.data.customers.length > 0) {
        dataToExport = res.data.customers;
      } else {
        toast.error("No customer records found to export.");
        return;
      }
    }

    const exportRows = dataToExport.map((c, idx) => {
      const ownerObj = c.owner || c.ownerDetails;
      return {
        "S.No": idx + 1,
        "Customer ID": c.customer_id || c.id || "",
        "Customer Name": c.name || "",
        "Phone Number": c.phone || "",
        "Email Address": c.email || "",
        "Loan Status": c.loanStatus || "Open",
        "Owner": ownerObj?.name ? `${ownerObj.name} (${ownerObj.identity || ownerObj.emp_id || ownerObj.email || ""})` : (c.owner || "N/A"),
        "Loan Type": c.loanType || "",
        "Loan No": c.loanNo || "",
        "Old Loan No": c.oldLoanNo || "",
        "Old Customer No": c.oldCustomerNo || "",
        "Cycle": c.cycle !== null && c.cycle !== undefined ? c.cycle : "",
        "Loan Disb Date": c.loanDisbDate || "",
        "Loan Amount": c.loanAmount ? `₹${c.loanAmount}` : "₹0",
        "O/S Principal": c.os_principal ? `₹${c.os_principal}` : "₹0",
        "O/S Interest": c.os_interest ? `₹${c.os_interest}` : "₹0",
        "PAR": c.par !== null && c.par !== undefined ? c.par : 0,
        "O/D Principal": c.od_principal ? `₹${c.od_principal}` : "₹0",
        "O/D Interest": c.od_interest ? `₹${c.od_interest}` : "₹0",
        "Total Due Amount": c.totalDueAmount ? `₹${c.totalDueAmount}` : "₹0",
        "Total Principal Collectible": c.total_principal_collectible ? `₹${c.total_principal_collectible}` : "₹0",
        "Total Interest Collectible": c.total_interest_collectible ? `₹${c.total_interest_collectible}` : "₹0",
        "IRR Rate": c.irrRate ? `${c.irrRate}%` : "",
        "No Of Installments": c.noOfInstallment || "",
        "Last Due Date": c.lastDueDate || "",
        "Last Paid Trx Date": c.lastPaidTrxDate || "",
        "DPD": c.dpd !== null && c.dpd !== undefined ? c.dpd : 0,
        "Paid Inst No": c.paidInstNo || "0",
        "Spouse Name": c.spouseName || "",
        "Installment Amount": c.installmentAmount ? `₹${c.installmentAmount}` : "₹0",
        "Maturity Date": c.maturityDate || "",
        "Location": c.location || "",
        "District": c.district || "",
        "State": c.state || "",
        "Sub State": c.sub_state || "",
        "Pincode": c.pincode || "",
        "Branch": c.branch || "",
        "Branch Code": c.branch_code || "",
        "Center": c.center || "",
        "Center Code": c.center_code || "",
        "Pre Closure Amt": c.preClosureAmt ? `₹${c.preClosureAmt}` : "₹0",
        "Closed Date": c.closedDate || "",
        "Created At": c.createdAt ? new Date(c.createdAt).toLocaleString() : "",
      };
    });

    const ws = XLSX.utils.json_to_sheet(exportRows);

    // Auto-calculate column widths
    const colWidths = Object.keys(exportRows[0] || {}).map((key) => {
      let maxLen = key.length;
      exportRows.forEach((row) => {
        const val = row[key] ? String(row[key]) : "";
        if (val.length > maxLen) maxLen = val.length;
      });
      return { wch: Math.min(Math.max(maxLen + 3, 12), 45) };
    });

    ws["!cols"] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Customers");
    const exportFileName = filename || `Customers_Export_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, exportFileName);
    toast.success(`Exported ${dataToExport.length} customers to Excel successfully!`);
  } catch (error) {
    console.error("Error exporting customers to Excel:", error);
    toast.error("Failed to export customers to Excel.");
  }
};

export default function CustomerImportModal({
  open,
  onClose,
  isDark = false,
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
          setErrorMsg("The selected Excel file is empty.");
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

      const res = await CustomerRoute.uploadExcelCustomers(formData);

      if (res?.success) {
        toast.success(res.message || `${res.data?.total || previewData.length} customers imported successfully!`);
        if (typeof onSuccess === "function") {
          onSuccess();
        }
        handleReset();
        onClose();
      } else {
        const msg = res?.message || "Failed to import excel customers.";
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
          <span>Import Customers from Excel</span>
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
              Need sample Excel format?
            </Typography>
            <Typography variant="caption" className={isDark ? "text-slate-400" : "text-slate-600"}>
              Download the demo Excel file containing all supported customer headers and sample rows.
            </Typography>
          </div>

          <Button
            onClick={downloadCustomerDemoExcel}
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
            Download Format Excel
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
              id="excel-customer-file-input"
            />
            <label htmlFor="excel-customer-file-input">
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
          <Alert severity="error" sx={{ borderRadius: "10px", whitespace: "pre-line" }}>
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
          {uploading ? "Importing..." : `Import ${previewData.length} Customers`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
