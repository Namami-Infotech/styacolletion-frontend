import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  CircularProgress,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { loanNumberRoute } from "../../../routes/loanNumber/loanNumber.route";
import { useThemeMode } from "../../../contexts/ThemeContext";
import { toast } from "react-toastify";

export default function LoanNumberFormModal({ open, onClose, loanItem, onSuccess, onOpenImport }) {
  const { isDark } = useThemeMode();
  const [formData, setFormData] = useState({
    loanNo: "",
    status: "active",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (loanItem) {
      setFormData({
        loanNo: loanItem.loanNo || "",
        status: loanItem.status || "active",
      });
    } else {
      setFormData({
        loanNo: "",
        status: "active",
      });
    }
  }, [loanItem, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.loanNo.trim()) {
      toast.error("Loan Number is required");
      return;
    }

    setLoading(true);
    try {
      let res;
      if (loanItem) {
        const identifier = loanItem.slug || loanItem.id;
        res = await loanNumberRoute.updateLoanNumber(identifier, formData);
      } else {
        res = await loanNumberRoute.createLoanNumber(formData);
      }

      if (res && (res.success || res.statusCode === 200 || res.statusCode === 201)) {
        toast.success(
          res.message ||
            (loanItem ? "Loan Number updated successfully!" : "Loan Number created successfully!")
        );
        if (typeof onSuccess === "function") {
          onSuccess();
        }
        onClose();
      }
    } catch (err) {
      console.error("Save loan number error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
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
        <span>{loanItem ? "Edit Loan Number" : "Create Loan Number"}</span>
        <IconButton onClick={onClose} size="small" sx={{ color: isDark ? "#94a3b8" : "#64748b" }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent
          dividers
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2.5,
            py: 2.5,
          }}
        >
          {!loanItem && onOpenImport && (
            <div
              className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${
                isDark
                  ? "bg-indigo-950/40 border-indigo-800/50"
                  : "bg-indigo-50/80 border-indigo-100"
              }`}
            >
              <div className="flex items-center gap-2">
                <UploadFileIcon
                  className={isDark ? "text-indigo-400" : "text-indigo-600"}
                  fontSize="small"
                />
                <span
                  className={`text-xs font-semibold ${
                    isDark ? "text-indigo-200" : "text-indigo-900"
                  }`}
                >
                  Have multiple loan numbers in Excel?
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

          <TextField
            fullWidth
            required
            size="small"
            label="Loan Number"
            name="loanNo"
            value={formData.loanNo}
            onChange={handleChange}
            placeholder="e.g. LN-1001"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px",
                backgroundColor: isDark ? "rgba(15, 23, 42, 0.6)" : "#f8fafc",
                color: isDark ? "#ffffff" : "#0f172a",
              },
              "& .MuiInputLabel-root": {
                color: isDark ? "#94a3b8" : "#64748b",
              },
            }}
          />

          <TextField
            select
            fullWidth
            size="small"
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px",
                backgroundColor: isDark ? "rgba(15, 23, 42, 0.6)" : "#f8fafc",
                color: isDark ? "#ffffff" : "#0f172a",
              },
              "& .MuiInputLabel-root": {
                color: isDark ? "#94a3b8" : "#64748b",
              },
            }}
          >
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </TextField>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} variant="outlined" disabled={loading} sx={{ borderRadius: "10px", textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 700,
              background: isDark
                ? "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)"
                : "#0f172a",
            }}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : loanItem ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
