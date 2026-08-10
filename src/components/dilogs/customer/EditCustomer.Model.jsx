import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import { CustomerRoute } from "../../../routes/customers/customer.route.js";
import { UploadRoute } from "../../../routes/upload/upload.route.js";
import { toast } from "react-toastify";

export default function EditCustomerModel({
  open,
  onClose,
  onSuccess,
  customer,
  isDark = false,
}) {
  const [formFields, setFormFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [loadingFields, setLoadingFields] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingFields, setUploadingFields] = useState({});

  useEffect(() => {
    if (open && customer) {
      loadCustomerFields();
    } else {
      setFormData({});
      setUploadingFields({});
    }
  }, [open, customer]);

  const loadCustomerFields = async () => {
    setLoadingFields(true);
    try {
      const res = await CustomerRoute.getCustomerField();
      if (res?.success && res.data?.fields) {
        const fields = res.data.fields;
        setFormFields(fields);
        const initial = {};
        fields.forEach((f) => {
          let val = customer ? customer[f.name] : undefined;
          if (val && typeof val === "object") {
            val = val.slug || val.id || val._id || val.name || val.title || "";
          }
          if (val === undefined || val === null) {
            initial[f.name] = f.type === "checkbox" ? false : "";
          } else {
            initial[f.name] = val;
          }
        });
        setFormData(initial);
      }
    } catch (error) {
      console.error("Error fetching customer fields:", error);
    } finally {
      setLoadingFields(false);
    }
  };

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageUpload = async (fieldName, event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    try {
      setUploadingFields((prev) => ({ ...prev, [fieldName]: true }));
      const base64Image = await convertFileToBase64(file);

      // Temporarily set base64 preview while uploading
      handleChange(fieldName, base64Image);

      const res = await UploadRoute.uploadImage(base64Image, "customer");
      if (res?.success && (res?.data?.url || res?.url)) {
        const uploadedUrl = res.data?.url || res.url;
        handleChange(fieldName, uploadedUrl);
        toast.success("Image uploaded successfully!");
      } else {
        toast.error(res?.message || "Failed to upload image.");
        handleChange(fieldName, "");
      }
    } catch (err) {
      console.error("Error uploading image:", err);
      toast.error("Failed to process or upload image.");
      handleChange(fieldName, "");
    } finally {
      setUploadingFields((prev) => ({ ...prev, [fieldName]: false }));
      if (event.target) event.target.value = "";
    }
  };

  const handleSubmit = async () => {
    const requiredField = formFields.find(
      (f) => f.required && !formData[f.name]
    );
    if (requiredField) {
      toast.error(`"${requiredField.label}" is required!`);
      return;
    }

    const slug = customer?.slug || customer?.id || customer?._id;
    if (!slug) {
      toast.error("Customer identifier missing!");
      return;
    }

    setSubmitting(true);
    try {
      const res = await CustomerRoute.updateCustomer(slug, formData);
      if (res?.success) {
        toast.success("Customer updated successfully!");
        const updatedCust = res.data?.customer || res.data;
        if (typeof onSuccess === "function") {
          onSuccess(updatedCust);
        }
        onClose();
      } else {
        toast.error(res?.message || "Failed to update customer");
      }
    } catch (error) {
      console.error("Error updating customer:", error);
      toast.error("An error occurred while updating customer.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
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
      <DialogTitle sx={{ fontWeight: 800 }}>Edit Customer</DialogTitle>

      <DialogContent dividers>
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
            {formFields.map((field, index) => {
              const fieldKey = `edit-cust-f-${field.name || index}`;
              const fieldId = `edit-cust-input-${field.name || index}`;
              const val = formData[field.name] ?? "";

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
                border: `1px solid ${
                  isDark ? "rgba(255,255,255,0.1)" : "#cbd5e1"
                }`,
                backgroundColor: isDark ? "rgba(15,23,42,0.6)" : "#fff",
                color: isDark ? "#fff" : "#0f172a",
                fontSize: "14px",
                outline: "none",
                colorScheme: isDark ? "dark" : "light",
                transition: "border-color 0.2s",
              };

              const isImageField =
                field.name === "image" ||
                field.name === "imageUrl" ||
                field.name === "photo" ||
                field.type === "file" ||
                (field.label && field.label.toLowerCase().includes("image"));

              if (isImageField) {
                const isUploading = !!uploadingFields[field.name];
                const currentImageUrl = val;

                return (
                  <div key={fieldKey} className="flex flex-col">
                    <FieldLabel />
                    <div
                      style={{
                        ...nativeInputStyle,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "8px",
                        minHeight: "40px",
                        padding: currentImageUrl ? "4px 10px" : "6px 12px",
                      }}
                    >
                      {currentImageUrl ? (
                        <div className="flex items-center justify-between w-full gap-2">
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <div className="relative w-7 h-7 flex-shrink-0 flex items-center justify-center">
                              <img
                                src={currentImageUrl}
                                alt="Preview"
                                className={`w-7 h-7 object-cover rounded-md border shadow-xs transition-opacity ${
                                  isUploading ? "opacity-40" : "opacity-100"
                                }`}
                                style={{ borderColor: isDark ? "#334155" : "#cbd5e1" }}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "https://via.placeholder.com/40?text=IMG";
                                }}
                              />
                              {isUploading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-md">
                                  <CircularProgress size={14} sx={{ color: "#ffffff" }} />
                                </div>
                              )}
                            </div>

                            <span
                              className="text-xs truncate font-medium"
                              style={{ color: isDark ? "#e2e8f0" : "#334155" }}
                              title={currentImageUrl}
                            >
                              {isUploading ? (
                                <span className="text-indigo-600 dark:text-indigo-400 font-semibold animate-pulse">
                                  Uploading image...
                                </span>
                              ) : (
                                "Image Attached"
                              )}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            {isUploading ? (
                              <CircularProgress size={16} color="primary" />
                            ) : (
                              <>
                                <label
                                  htmlFor={`file-input-${fieldId}`}
                                  className="text-xs font-semibold cursor-pointer text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
                                >
                                  <RefreshIcon style={{ fontSize: 13 }} />
                                  Change
                                </label>
                                <span className="text-slate-300 dark:text-slate-700">|</span>
                                <button
                                  type="button"
                                  onClick={() => handleChange(field.name, "")}
                                  className="text-xs font-semibold cursor-pointer text-rose-500 hover:underline flex items-center gap-0.5"
                                >
                                  <DeleteIcon style={{ fontSize: 13 }} />
                                  Remove
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ) : isUploading ? (
                        <div className="flex items-center gap-2 text-xs font-medium text-indigo-600 dark:text-indigo-400">
                          <CircularProgress size={18} color="inherit" />
                          <span>Uploading image...</span>
                        </div>
                      ) : (
                        <label
                          htmlFor={`file-input-${fieldId}`}
                          className="flex items-center justify-between w-full cursor-pointer text-xs group"
                          style={{ color: isDark ? "#94a3b8" : "#64748b" }}
                        >
                          <span className="truncate">Upload customer image...</span>
                          <div
                            className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors"
                            style={{
                              backgroundColor: isDark ? "rgba(99,102,241,0.15)" : "#eef2ff",
                              color: isDark ? "#818cf8" : "#4f46e5",
                              border: `1px solid ${isDark ? "rgba(99,102,241,0.3)" : "#c7d2fe"}`,
                            }}
                          >
                            <CloudUploadIcon style={{ fontSize: 16 }} />
                            Browse
                          </div>
                        </label>
                      )}

                      <input
                        id={`file-input-${fieldId}`}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={isUploading}
                        onChange={(e) => handleImageUpload(field.name, e)}
                      />
                    </div>
                  </div>
                );
              }

              if (field.type === "select") {
                return (
                  <div key={fieldKey} className="flex flex-col">
                    <FieldLabel />
                    <select
                      id={fieldId}
                      value={val}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      style={{ ...nativeInputStyle, cursor: "pointer" }}
                    >
                      <option
                        value=""
                        style={{ backgroundColor: isDark ? "#0f172a" : "#fff" }}
                      >
                        — Select —
                      </option>
                      {(field.options || []).map((opt, optIdx) => (
                        <option
                          key={`opt-${opt.value || optIdx}`}
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

              return (
                <div key={fieldKey} className="flex flex-col">
                  <FieldLabel />
                  <input
                    id={fieldId}
                    type={field.type || "text"}
                    placeholder={field.placeholder || ""}
                    value={val}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    style={nativeInputStyle}
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
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={submitting}
        >
          {submitting ? "Saving..." : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

