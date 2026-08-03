import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";

export default function DeleteTaskModal({
  open,
  onClose,
  activeTask,
  handleDeleteTask,
  isDark,
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "16px",
          backgroundColor: isDark ? "#0f172a" : "#ffffff",
          color: isDark ? "#ffffff" : "#0f172a",
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 800, color: "#ef4444" }}>
        Delete Task?
      </DialogTitle>
      <DialogContent>
        <p className="text-sm">
          Are you sure you want to delete{" "}
          <strong>{activeTask?.task_id}</strong> ({activeTask?.title})? This
          action cannot be undone.
        </p>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button onClick={handleDeleteTask} variant="contained" color="error">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}
