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
  const [contacts, setContacts] = useState([{ relation: "", clientPhone: "" }]);
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
    setContacts([{ relation: "", clientPhone: "" }]);
    setErrors({});
  };

  const handleAddContact = () => {
    setContacts((prev) => [...prev, { relation: "", clientPhone: "" }]);
  };

  const handleRemoveContact = (index) => {
    if (contacts.length <= 1) return;
    setContacts((prev) => prev.filter((_, idx) => idx !== index));
    setErrors((prev) => {
      const updated = { ...prev };
      delete updated[`relation_${index}`];
      delete updated[`clientPhone_${index}`];
      return updated;
    });
  };

  const handleContactChange = (index, field, value) => {
    setContacts((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });

    if (errors[`${field}_${index}`]) {
      setErrors((prev) => ({ ...prev, [`${field}_${index}`]: "" }));
    }
  };

  const isFieldVisible = (fieldName, data) => {
    // Default always visible API fields (relation and clientPhone are handled in contacts section)
    if (
      [
        "houseImage",
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

    // Validate houseImage if configured
    if (!formData.houseImage) {
      newErrors.houseImage = "House image is required";
    }

    // Validate dynamic contacts
    contacts.forEach((contact, idx) => {
      if (idx === 0) {
        if (!contact.relation) {
          newErrors[`relation_${idx}`] = "Relation is required";
        }
        if (!contact.clientPhone || !contact.clientPhone.trim()) {
          newErrors[`clientPhone_${idx}`] = "Phone number is required";
        } else if (!/^\d{10}$/.test(contact.clientPhone.trim())) {
          newErrors[`clientPhone_${idx}`] = "Enter a valid 10-digit phone number";
        }
      } else {
        // For additional contact rows, if either field is filled, both are required
        if (contact.relation || (contact.clientPhone && contact.clientPhone.trim())) {
          if (!contact.relation) {
            newErrors[`relation_${idx}`] = "Relation is required";
          }
          if (!contact.clientPhone || !contact.clientPhone.trim()) {
            newErrors[`clientPhone_${idx}`] = "Phone number is required";
          } else if (!/^\d{10}$/.test(contact.clientPhone.trim())) {
            newErrors[`clientPhone_${idx}`] = "Enter a valid 10-digit phone number";
          }
        }
      }
    });

    // Validate other visible fields
    fields.forEach((field) => {
      if (
        !["relation", "clientPhone", "houseImage"].includes(field.name) &&
        isFieldVisible(field.name, formData) &&
        field.required
      ) {
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

      // Filter out any completely empty secondary rows
      const validContacts = contacts.filter((c) => c.relation && c.clientPhone);
      const activeContactsList = validContacts.length > 0 ? validContacts : contacts;

      const payload = {
        ...formData,
        contacts: activeContactsList,
        relation: activeContactsList.map((c) => c.relation).join(", "),
        clientPhone: activeContactsList.map((c) => c.clientPhone).join(", "),
      };

      const res = await TaskRoute.completeTask(taskId, payload);

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
    setContacts([{ relation: "", clientPhone: "" }]);
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
                {/* 1. House Image (Always rendered at the top) */}
                <div className="col-span-1 md:col-span-2 space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    House Image <span className="text-red-500">*</span>
                  </label>
                  {renderFieldInput({ name: "houseImage", label: "House Image" })}
                  {errors.houseImage && (
                    <p className="text-[11px] font-medium text-red-500 mt-0.5">
                      {errors.houseImage}
                    </p>
                  )}
                </div>

                {/* 2. Client Relation & Phone Number Section with Add More */}
                <div className="col-span-1 md:col-span-2 space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Client Relation & Phone Number
                      </h4>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                        {contacts.length} {contacts.length > 1 ? "Numbers" : "Number"}
                      </span>
                    </div>
                    <Button
                      type="button"
                      size="small"
                      startIcon={<AddIcon fontSize="small" />}
                      onClick={handleAddContact}
                      sx={{
                        textTransform: "none",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        color: "#2563eb",
                        backgroundColor: isDark ? "rgba(37, 99, 235, 0.15)" : "rgba(37, 99, 235, 0.08)",
                        borderRadius: "10px",
                        px: 2,
                        py: 0.5,
                        "&:hover": {
                          backgroundColor: isDark ? "rgba(37, 99, 235, 0.25)" : "rgba(37, 99, 235, 0.16)",
                        },
                      }}
                    >
                      Add More
                    </Button>
                  </div>

                  {/* Dynamic Contacts List */}
                  <div className="space-y-3">
                    {contacts.map((contact, idx) => {
                      const relationField = fields.find((f) => f.name === "relation");
                      const defaultOptions = [
                        { label: "Self", value: "self" },
                        { label: "Spouses", value: "spouses" },
                        { label: "Father", value: "father" },
                        { label: "Mother", value: "mother" },
                        { label: "Brother", value: "brother" },
                        { label: "Son", value: "son" },
                        { label: "Daughter", value: "daughter" },
                        { label: "Neighbour", value: "neighbour" },
                        { label: "Relative", value: "relative" },
                      ];
                      const options = (relationField?.options && relationField.options.length > 0)
                        ? relationField.options
                        : defaultOptions;

                      return (
                        <div
                          key={idx}
                          className={`p-3 rounded-xl border transition-all ${
                            isDark ? "bg-slate-800/80 border-slate-700" : "bg-white border-slate-200 shadow-sm"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                              Contact #{idx + 1} {idx === 0 && <span className="text-red-500">*</span>}
                            </span>
                            {contacts.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveContact(idx)}
                                className="text-[11px] text-red-500 hover:text-red-600 dark:hover:text-red-400 flex items-center gap-1 font-medium transition-colors cursor-pointer"
                              >
                                <CloseIcon sx={{ fontSize: 14 }} /> Remove
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {/* Relation dropdown */}
                            <div className="space-y-1">
                              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                Relation {idx === 0 && <span className="text-red-500">*</span>}
                              </label>
                              <select
                                value={contact.relation}
                                onChange={(e) => handleContactChange(idx, "relation", e.target.value)}
                                className={`w-full px-3 py-2.5 text-xs rounded-xl border transition-colors outline-none focus:ring-2 focus:ring-blue-500 ${
                                  isDark
                                    ? "bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500"
                                    : "bg-slate-50 border-slate-300 text-slate-800 placeholder-slate-400"
                                } ${errors[`relation_${idx}`] ? "border-red-500 focus:ring-red-500" : ""}`}
                              >
                                <option value="">Select relation</option>
                                {options.map((opt, optIdx) => (
                                  <option key={optIdx} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                              {errors[`relation_${idx}`] && (
                                <p className="text-[11px] font-medium text-red-500 mt-0.5">
                                  {errors[`relation_${idx}`]}
                                </p>
                              )}
                            </div>

                            {/* Client Phone Number input */}
                            <div className="space-y-1">
                              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                                Client Phone Number {idx === 0 && <span className="text-red-500">*</span>}
                              </label>
                              <input
                                type="tel"
                                maxLength={10}
                                value={contact.clientPhone}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/\D/g, "");
                                  handleContactChange(idx, "clientPhone", val);
                                }}
                                placeholder="Enter client phone number"
                                className={`w-full px-3 py-2.5 text-xs rounded-xl border transition-colors outline-none focus:ring-2 focus:ring-blue-500 ${
                                  isDark
                                    ? "bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500"
                                    : "bg-slate-50 border-slate-300 text-slate-800 placeholder-slate-400"
                                } ${errors[`clientPhone_${idx}`] ? "border-red-500 focus:ring-red-500" : ""}`}
                              />
                              {errors[`clientPhone_${idx}`] && (
                                <p className="text-[11px] font-medium text-red-500 mt-0.5">
                                  {errors[`clientPhone_${idx}`]}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Other Dynamic Fields (Collect Payment, Payment Type, Remarks, etc.) */}
                {fields
                  .filter((field) => !["houseImage", "relation", "clientPhone"].includes(field.name) && isFieldVisible(field.name, formData))
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
