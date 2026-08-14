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
import { loanNumberRoute } from "../../../routes/loanNumber/loanNumber.route";
import { toast } from "react-toastify";

export const downloadLoanNumberDemoExcel = () => {
  const sampleData = [
    { "Loan No": "LN-1001", Status: "active" },
    { "Loan No": "LN-1002", Status: "active" },
    { "Loan No": "LN-1003", Status: "inactive" },
  ];

  const ws = XLSX.utils.json_to_sheet(sampleData);
  ws["!cols"] = [{ wch: 18 }, { wch: 14 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Loan_Numbers_Template");
  XLSX.writeFile(wb, "Loan_Numbers_Import_Demo.xlsx");
};

export const exportLoanNumbersToExcel = async (providedData = [], filename = null) => {
  try {
    let dataToExport = providedData;

    if (!dataToExport || dataToExport.length === 0) {
      toast.info("Fetching loan numbers data for export...");
      const res = await loanNumberRoute.getAllLoanNumbers({ limit: "all" });
      if (res?.success && res?.data?.loanNumbers && res.data.loanNumbers.length > 0) {
        dataToExport = res.data.loanNumbers;
      } else {
        toast.error("No loan number records found to export.");
        return;
      }
    }

    const exportRows = dataToExport.map((item, idx) => {
      const creatorObj = item.createdBy || item.creator;
      return {
        "S.No": idx + 1,
        "Loan No": item.loanNo || "",
        Status: item.status || "active",
        "Created By": creatorObj?.name ? `${creatorObj.name} (${creatorObj.identity || ""})` : "N/A",
        "Created At": item.createdAt ? new Date(item.createdAt).toLocaleString() : "",
      };
    });

    const ws = XLSX.utils.json_to_sheet(exportRows);
    ws["!cols"] = [
      { wch: 8 },
      { wch: 20 },
      { wch: 12 },
      { wch: 25 },
      { wch: 22 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "LoanNumbers");
    const exportFileName = filename || `Loan_Numbers_Export_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, exportFileName);
    toast.success(`Exported ${dataToExport.length} loan numbers to Excel successfully!`);
  } catch (error) {
    console.error("Error exporting loan numbers to Excel:", error);
    toast.error("Failed to export loan numbers to Excel.");
  }
};

export default function LoanNumberImportModal({
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

      const res = await loanNumberRoute.uploadExcelLoanNumbers(formData);

      if (res?.success) {
        toast.success(res.message || `${res.data?.total || previewData.length} Loan Numbers imported successfully!`);
        if (typeof onSuccess === "function") {
          onSuccess();
        }
        handleReset();
        onClose();
      } else {
        const msg = res?.message || "Failed to import excel loan numbers.";
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
          <span>Import Loan Numbers from Excel</span>
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
              Download demo Excel file containing "Loan No" and "Status" headers.
            </Typography>
          </div>

          <Button
            onClick={downloadLoanNumberDemoExcel}
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
            Download Excel Format (Sample)
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
              id="excel-loanno-file-input"
            />
            <label htmlFor="excel-loanno-file-input">
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
          {uploading ? "Importing..." : `Import ${previewData.length} Loan Numbers`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
