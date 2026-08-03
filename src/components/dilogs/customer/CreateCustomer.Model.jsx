import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { CustomerRoute } from "../../../routes/customers/customer.route.js";
import { toast } from "react-toastify";

export default function CreateCustomerModel({
  open,
  onClose,
  onSuccess,
  isDark = false,
}) {
  const [formFields, setFormFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [loadingFields, setLoadingFields] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      loadCustomerFields();
    } else {
      setFormData({});
    }
  }, [open]);

  const loadCustomerFields = async () => {
    setLoadingFields(true);
    try {
      const res = await CustomerRoute.getCustomerField();
      if (res?.success && res.data?.fields) {
        const fields = res.data.fields;
        setFormFields(fields);
        const blank = {};
        fields.forEach((f) => {
          blank[f.name] = f.type === "checkbox" ? false : "";
        });
        setFormData(blank);
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

  const handleSubmit = async () => {
    const requiredField = formFields.find(
      (f) => f.required && !formData[f.name]
    );
    if (requiredField) {
      toast.error(`"${requiredField.label}" is required!`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await CustomerRoute.createCustomer(formData);
      if (res?.success) {
        toast.success("Customer created successfully!");
        const newCust = res.data?.customer || res.data;
        if (typeof onSuccess === "function") {
          onSuccess(newCust);
        }
        onClose();
      } else {
        toast.error(res?.message || "Failed to create customer");
      }
    } catch (error) {
      console.error("Error creating customer:", error);
      toast.error("An error occurred while creating customer.");
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
      <DialogTitle sx={{ fontWeight: 800 }}>Create New Customer</DialogTitle>

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
              const fieldKey = `cust-f-${field.name || index}`;
              const fieldId = `cust-input-${field.name || index}`;
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
                border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "#cbd5e1"
                  }`,
                backgroundColor: isDark ? "rgba(15,23,42,0.6)" : "#fff",
                color: isDark ? "#fff" : "#0f172a",
                fontSize: "14px",
                outline: "none",
                colorScheme: isDark ? "dark" : "light",
                transition: "border-color 0.2s",
              };

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
          {submitting ? "Creating..." : "Create Customer"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
