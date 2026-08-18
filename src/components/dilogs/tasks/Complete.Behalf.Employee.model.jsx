import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import QrCodeIcon from "@mui/icons-material/QrCode";
import AddIcon from "@mui/icons-material/Add";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { TaskRoute } from "../../../routes/tasks/task.route.js";
import { UploadRoute } from "../../../routes/upload/upload.route.js";
import { toast } from "react-toastify";
import GoogleMap from "../../../pages/googlemap/goggle_map.jsx";

const getCurrentDateTimeLocal = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export default function CompleteBehalfEmployeeModal({
  open,
  onClose,
  activeTask,
  isDark,
  onSuccess,
}) {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingFields, setUploadingFields] = useState({});
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  useEffect(() => {
    if (open) {
      fetchFormFields();
    }
  }, [open]);

  const fetchFormFields = async () => {
    setLoading(true);
    try {
      const response = await TaskRoute.completebehalf();
      const apiFields = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
          ? response
          : [];

      setFields(apiFields);
      initFormData(apiFields);
    } catch (err) {
      console.error("Error fetching complete behalf fields:", err);
      setFields([]);
      initFormData([]);
    } finally {
      setLoading(false);
    }
  };

  const initFormData = (fieldList) => {
    const initialData = {};
    fieldList.forEach((field) => {
      initialData[field.name] = "";
    });
    setFormData(initialData);
    setErrors({});
  };

  const isFieldVisible = (fieldName, data) => {
    // Default always visible API fields
    if (
      [
        "houseImage",
        "relation",
        "clientPhone",
        "collectPayment",
      ].includes(fieldName)
    ) {
      return true;
    }

    const collectPayment = data.collectPayment;
    const paymentType = data.paymentType;

    if (collectPayment === "yes_collect") {
      if (fieldName === "paymentType") {
        return true;
      }
      if (paymentType === "cash" || paymentType === "digitalmode") {
        return ["paymentAmount", "remark", "paymentProfImage"].includes(fieldName);
      }
      if (paymentType === "online") {
        return ["remark"].includes(fieldName);
      }
      return false;
    } else if (collectPayment === "no") {
      return ["reason", "clientSegment", "ptpdate"].includes(fieldName);
    }

    return false;
  };

  const handleChange = (name, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      // Clear irrelevant values when options change
      if (name === "collectPayment") {
        if (value === "no") {
          updated.paymentType = "";
          updated.paymentAmount = "";
          updated.paymentProfImage = "";
        } else if (value === "yes_collect" || value === "yes") {
          updated.reason = "";
          updated.ptpdate = "";
        }
      }
      if (name === "paymentType") {
        if (value === "cash") {
          updated.paymentProfImage = "";
        } else if (value === "online") {
          updated.paymentAmount = "";
        }
      }
      return updated;
    });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    fields.forEach((field) => {
      if (isFieldVisible(field.name, formData) && field.required) {
        const val = formData[field.name];
        if (!val || val.toString().trim() === "") {
          newErrors[field.name] = `${field.label || field.name} is required`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      const taskId = activeTask?.task_id || activeTask?._id || activeTask?.id;

      const res = await TaskRoute.completeTask(taskId, formData);

      if (res?.success) {
        const msg =
          formData.collectPayment === "no"
            ? "Task completed and new task has been created!"
            : "Task completed successfully!";
        toast.success(res?.message || msg);
        if (onSuccess) onSuccess(res?.data);
        handleClose();
      } else {
        toast.error(res?.message || "Failed to complete task.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("An error occurred while completing task.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({});
    setErrors({});
    setUploadingFields({});
    onClose();
  };

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageUpload = async (fieldName, file) => {
    try {
      setUploadingFields((prev) => ({ ...prev, [fieldName]: true }));
      const base64Image = await convertFileToBase64(file);
      const res = await UploadRoute.uploadImage(
        base64Image,
        fieldName === "houseImage" ? "house" : "payment"
      );
      if (res?.success && (res?.data?.url || res?.url)) {
        const imageUrl = res.data?.url || res.url;
        handleChange(fieldName, imageUrl);
        toast.success(
          `${fieldName === "houseImage" ? "House image" : "Payment proof image"} uploaded successfully!`
        );
      } else {
        toast.error(res?.message || "Failed to upload image.");
      }
    } catch (err) {
      console.error("Error uploading image:", err);
      toast.error("Failed to process or upload image.");
    } finally {
      setUploadingFields((prev) => ({ ...prev, [fieldName]: false }));
    }
  };

  const renderFieldInput = (field) => {
    const value = formData[field.name] || "";
    const hasError = !!errors[field.name];

    const commonInputClasses = `w-full px-3 py-2.5 text-xs rounded-xl border transition-colors outline-none focus:ring-2 focus:ring-blue-500 ${isDark
      ? "bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500"
      : "bg-slate-50 border-slate-300 text-slate-800 placeholder-slate-400"
      } ${hasError ? "border-red-500 focus:ring-red-500" : ""}`;

    if (field.type === "select") {
      return (
        <select
          value={value}
          onChange={(e) => handleChange(field.name, e.target.value)}
          className={commonInputClasses}
        >
          <option value="">{field.placeholder || `Select ${field.label}`}</option>
          {field.options &&
            field.options.map((opt, idx) => (
              <option key={idx} value={opt.value}>
                {opt.label}
              </option>
            ))}
        </select>
      );
    }

    if (field.name === "remark" || field.name === "reason") {
      return (
        <textarea
          rows={3}
          value={value}
          onChange={(e) => handleChange(field.name, e.target.value)}
          placeholder={field.placeholder || `Enter ${field.label}`}
          className={commonInputClasses}
        />
      );
    }

    if (field.name === "houseImage" || field.name === "paymentProfImage") {
      const isUploading = uploadingFields[field.name];
      return (
        <div
          className={`border-2 border-dashed rounded-xl p-3 flex flex-col items-center justify-center text-center cursor-pointer h-[130px] transition-colors relative ${isDark ? "border-slate-700 bg-slate-900/60" : "border-slate-300 bg-slate-50"
            } ${hasError ? "border-red-500" : ""}`}
        >
          <input
            type="file"
            accept="image/*"
            disabled={isUploading}
            onChange={(e) => {
              const file = e.target.files && e.target.files[0];
              if (file) {
                handleImageUpload(field.name, file);
              }
            }}
            className="hidden"
            id={`upload-${field.name}`}
          />
          <label
            htmlFor={isUploading ? undefined : `upload-${field.name}`}
            className={`flex flex-col items-center w-full h-full justify-center ${isUploading ? "cursor-not-allowed" : "cursor-pointer"
              }`}
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <CircularProgress size={24} />
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Uploading image...</span>
              </div>
            ) : value ? (
              <div className="relative flex flex-col items-center">
                <img src={value} alt={field.label} className="h-20 object-contain rounded-lg shadow-sm" />
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold mt-1">Change Image</span>
              </div>
            ) : (
              <>
                <CloudUploadIcon sx={{ fontSize: 36, color: "#94a3b8", mb: 0.5 }} />
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mb-1.5">Click or drag file here ⓘ</span>
                <span className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[11px] rounded-md shadow-sm">
                  Choose File
                </span>
              </>
            )}
          </label>
        </div>
      );
    }

    let minVal = undefined;
    if (field.type === "datetime-local") {
      minVal = getCurrentDateTimeLocal();
    }

    return (
      <input
        type={field.type || "text"}
        value={value}
        min={minVal}
        onChange={(e) => handleChange(field.name, e.target.value)}
        placeholder={field.placeholder || `Enter ${field.label}`}
        className={commonInputClasses}
      />
    );
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "20px",
            backgroundColor: isDark ? "#0f172a" : "#ffffff",
            color: isDark ? "#ffffff" : "#0f172a",
            border: isDark ? "1px solid #1e293b" : "1px solid #e2e8f0",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          },
        }}
      >
        {/* Dialog Header */}
        <DialogTitle
          sx={{
            m: 0,
            p: 2.5,
            display: "flex",
            alignItems: "center",
            justify: "space-between",
            borderBottom: isDark ? "1px solid #1e293b" : "1px solid #f1f5f9",
          }}
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
              <CheckCircleIcon fontSize="small" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Complete Behalf of Employee
              </h3>
              {activeTask?.task_id && (
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Task ID: <span className="font-semibold text-blue-600 dark:text-blue-400">{activeTask.task_id}</span>
                </p>
              )}
            </div>
          </div>
          <IconButton
            onClick={handleClose}
            sx={{
              color: (theme) => theme.palette.grey[500],
              ml: "auto",
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        {/* Dialog Content */}
        <DialogContent sx={{ p: 3 }}>
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <CircularProgress size={32} />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Loading form configuration...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fields
                  .filter((field) => isFieldVisible(field.name, formData))
                  .map((field) => {
                    if (field.name === "location") {
                      return (
                        <div key={field.name} className="col-span-1 md:col-span-2 space-y-1">
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {field.label} {field.required && <span className="text-red-500">*</span>}
                          </label>
                          <div className="relative flex items-center">
                            <input
                              type="text"
                              readOnly
                              value={formData.location || ""}
                              onClick={() => setIsMapModalOpen(true)}
                              placeholder={field.placeholder || "Click + button to select location on map"}
                              className={`w-full pl-3 pr-10 py-2.5 text-xs rounded-xl border transition-colors outline-none cursor-pointer ${isDark
                                ? "bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500"
                                : "bg-slate-50 border-slate-300 text-slate-800 placeholder-slate-400"
                                } ${errors[field.name] ? "border-red-500" : ""}`}
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsMapModalOpen(true);
                              }}
                              title="Open Map to Select Location"
                              className="absolute right-1.5 p-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-sm active:scale-95 cursor-pointer flex items-center justify-center"
                            >
                              <AddIcon fontSize="small" />
                            </button>
                          </div>
                          {errors[field.name] && (
                            <p className="text-[11px] font-medium text-red-500 mt-0.5">
                              {errors[field.name]}
                            </p>
                          )}
                        </div>
                      );
                    }

                    return (
                      <React.Fragment key={field.name}>
                        <div key={field.name} className="space-y-1">
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {field.label} {field.required && <span className="text-red-500">*</span>}
                          </label>
                          {renderFieldInput(field)}
                          {errors[field.name] && (
                            <p className="text-[11px] font-medium text-red-500 mt-0.5">
                              {errors[field.name]}
                            </p>
                          )}
                        </div>

                        {/* TrackWick Online QR Banner Notice */}
                        {field.name === "paymentType" &&
                          formData.collectPayment === "yes_collect" &&
                          formData.paymentType === "online" && (
                            <div className="col-span-1 md:col-span-2 p-3.5 rounded-xl bg-orange-50 dark:bg-amber-950/40 border border-orange-200 dark:border-amber-800/60 flex items-start gap-3">
                              <div className="p-1 rounded-lg bg-orange-100 dark:bg-amber-900/50 text-orange-600 dark:text-amber-400 mt-0.5">
                                <QrCodeIcon fontSize="small" />
                              </div>
                              <div className="text-xs">
                                <p className="font-bold text-orange-950 dark:text-amber-100">
                                  Payment QR code can only be generated from the mobile app, not from the web.
                                </p>
                                <p className="text-orange-800 dark:text-amber-300/80 text-[11px] mt-0.5">
                                  Open this task in the TrackWick mobile app to generate and manage the Payment QR. It will sync automatically.
                                </p>
                              </div>
                            </div>
                          )}
                      </React.Fragment>
                    );
                  })}
              </div>
            </form>
          )}
        </DialogContent>

        {/* Dialog Actions */}
        <DialogActions
          sx={{
            px: 3,
            py: 2,
            borderTop: isDark ? "1px solid #1e293b" : "1px solid #f1f5f9",
            gap: 1,
          }}
        >
          <Button
            onClick={handleClose}
            variant="outlined"
            disabled={submitting}
            sx={{
              borderRadius: "12px",
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.75rem",
              px: 3,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={submitting || loading || Object.values(uploadingFields).some(Boolean)}
            sx={{
              borderRadius: "12px",
              textTransform: "none",
              fontWeight: 700,
              fontSize: "0.75rem",
              px: 4,
              backgroundColor: "#2563eb",
              "&:hover": { backgroundColor: "#1d4ed8" },
            }}
          >
            {submitting ? (
              <div className="flex items-center gap-2">
                <CircularProgress size={16} color="inherit" />
                <span>Submitting...</span>
              </div>
            ) : (
              "Complete Task"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Google Map Location Selection Dialog Modal */}
      <Dialog
        open={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: "20px",
            backgroundColor: isDark ? "#0f172a" : "#ffffff",
            color: isDark ? "#ffffff" : "#0f172a",
            border: isDark ? "1px solid #1e293b" : "1px solid #e2e8f0",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          },
        }}
      >
        <DialogTitle
          sx={{
            m: 0,
            p: 2.5,
            display: "flex",
            alignItems: "center",
            justify: "space-between",
            borderBottom: isDark ? "1px solid #1e293b" : "1px solid #f1f5f9",
          }}
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
              <LocationOnIcon fontSize="small" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Select Location on Map
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Search, pin, or pick location
              </p>
            </div>
          </div>
          <IconButton
            onClick={() => setIsMapModalOpen(false)}
            sx={{ color: (theme) => theme.palette.grey[500] }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 2.5 }}>
          <GoogleMap
            value={formData.location || ""}
            onChange={(loc) => handleChange("location", loc)}
            label="Search & Pin Location"
            mapHeight="380px"
          />
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 2,
            borderTop: isDark ? "1px solid #1e293b" : "1px solid #f1f5f9",
          }}
        >
          <Button
            variant="contained"
            onClick={() => setIsMapModalOpen(false)}
            sx={{
              borderRadius: "12px",
              textTransform: "none",
              fontWeight: 700,
              fontSize: "0.75rem",
              px: 4,
              backgroundColor: "#2563eb",
              "&:hover": { backgroundColor: "#1d4ed8" },
            }}
          >
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
