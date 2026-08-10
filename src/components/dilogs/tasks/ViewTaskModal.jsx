import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";

export default function ViewTaskModal({ open, onClose, activeTask, isDark }) {
  const getAssigneeName = () => {
    if (activeTask?.assigneeToEmployeeId?.name) return activeTask.assigneeToEmployeeId.name;
    if (typeof activeTask?.assigneeToEmployeeId === "string") return activeTask.assigneeToEmployeeId;
    if (typeof activeTask?.assignedTo === "object") return activeTask.assignedTo?.name;
    if (typeof activeTask?.assignedTo === "string") return activeTask.assignedTo;
    return "null";
  };

  const getCustomerName = () => {
    if (activeTask?.customerId?.name) return activeTask.customerId.name;
    if (typeof activeTask?.customerId === "string") return activeTask.customerId;
    return "null";
  };

  const getTaskTypeName = () => {
    if (typeof activeTask?.taskType === "object") return activeTask.taskType?.name;
    return activeTask?.taskType ?? "null";
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
      <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
        Task Details: {activeTask?.task_id ?? "null"}
      </DialogTitle>
      <DialogContent dividers className="space-y-4">
        <div>
          <p className="text-xs font-semibold text-slate-400">Description</p>
          <p className="text-sm font-medium">{activeTask?.description ?? "null"}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-semibold text-slate-400">Customer</p>
            <p className="text-sm font-semibold">{getCustomerName()}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">Assigned To</p>
            <p className="text-sm font-semibold">{getAssigneeName()}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">Task Type</p>
            <p className="text-sm font-semibold">{getTaskTypeName()}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">Priority</p>
            <p className="text-sm font-semibold">{activeTask?.priority ?? "null"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">Status</p>
            <p className="text-sm font-semibold">{activeTask?.status ?? "null"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">Payment Amount</p>
            <p className="text-sm font-semibold">{activeTask?.payment_type ? `₹${activeTask.payment_type}` : "null"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">Start Date & Time</p>
            <p className="text-sm font-semibold">
              {activeTask?.startDateTime ? new Date(activeTask.startDateTime).toLocaleString() : "null"}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">End Date & Time</p>
            <p className="text-sm font-semibold">
              {activeTask?.endDateTime ? new Date(activeTask.endDateTime).toLocaleString() : "null"}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">Created By</p>
            <p className="text-sm font-semibold">{activeTask?.createdBy?.name ?? "null"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">Updated By</p>
            <p className="text-sm font-semibold">{activeTask?.updatedBy?.name ?? "null"}</p>
          </div>
          {activeTask?.deletedAt && (
            <>
              <div>
                <p className="text-xs font-semibold text-slate-400">Deleted By</p>
                <p className="text-sm font-semibold">
                  {typeof activeTask.deletedBy === "object"
                    ? activeTask.deletedBy?.name
                    : (activeTask.deletedBy ?? "null")}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400">Deleted At</p>
                <p className="text-sm font-semibold">
                  {new Date(activeTask.deletedAt).toLocaleString()}
                </p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
