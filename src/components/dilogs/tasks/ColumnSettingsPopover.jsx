import React, { useState, useEffect } from "react";
import {
  Popover,
  Box,
  Typography,
  Checkbox,
  Button,
} from "@mui/material";

export default function ColumnSettingsPopover({
  anchorEl,
  onClose,
  columns = [],
  columnVisibility = {},
  setColumnVisibility,
  isDark,
}) {
  const [tempVisibility, setTempVisibility] = useState({});

  useEffect(() => {
    if (Boolean(anchorEl)) {
      setTempVisibility({ ...columnVisibility });
    }
  }, [anchorEl, columnVisibility]);

  const open = Boolean(anchorEl);

  const handleToggleColumn = (colId) => {
    setTempVisibility((prev) => ({
      ...prev,
      [colId]: prev[colId] === false ? true : false,
    }));
  };

  const isAllSelected = columns.every(
    (col) => tempVisibility[col.id] !== false
  );

  const handleSelectAllToggle = () => {
    const newVis = {};
    const targetVal = !isAllSelected;
    columns.forEach((col) => {
      newVis[col.id] = targetVal;
    });
    setTempVisibility(newVis);
  };

  const handleApply = () => {
    setColumnVisibility(tempVisibility);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      PaperProps={{
        sx: {
          width: 360,
          maxHeight: 480,
          borderRadius: "16px",
          backgroundColor: isDark ? "#0f172a" : "#ffffff",
          color: isDark ? "#f8fafc" : "#0f172a",
          border: isDark ? "1px solid #1e293b" : "1px solid #e2e8f0",
          boxShadow: isDark
            ? "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)"
            : "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
          marginTop: "165px !important",
          overflow: "hidden",
        },
      }}
    >
      <Box className="flex flex-col h-full max-h-[480px]">
        {/* Header matching exact user screenshot */}
        <Box
          className={`flex items-center justify-between px-4 py-3 border-b sticky top-0 z-10 ${
            isDark ? "border-slate-800 bg-slate-900" : "border-slate-100 bg-white"
          }`}
        >
          <Box
            className="flex items-center gap-2 cursor-pointer select-none"
            onClick={handleSelectAllToggle}
          >
            <Checkbox
              size="small"
              checked={isAllSelected}
              onChange={handleSelectAllToggle}
              sx={{
                p: 0.5,
                color: isDark ? "#64748b" : "#94a3b8",
                "&.Mui-checked": {
                  color: isDark ? "#38bdf8" : "#0284c7",
                },
              }}
            />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: "1.05rem",
                color: isDark ? "#ffffff" : "#0f172a",
              }}
            >
              Columns
            </Typography>
          </Box>

          <Box className="flex items-center gap-2">
            <Button
              size="small"
              onClick={handleCancel}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.875rem",
                color: isDark ? "#38bdf8" : "#0284c7",
                minWidth: "auto",
                px: 1.5,
                "&:hover": {
                  backgroundColor: isDark ? "rgba(56, 189, 248, 0.1)" : "rgba(2, 132, 199, 0.08)",
                },
              }}
            >
              Cancel
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={handleApply}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                fontSize: "0.875rem",
                borderRadius: "8px",
                px: 2.5,
                py: 0.6,
                backgroundColor: isDark ? "#0284c7" : "#0284c7",
                boxShadow: "none",
                "&:hover": {
                  backgroundColor: isDark ? "#0369a1" : "#0369a1",
                  boxShadow: "none",
                },
              }}
            >
              Apply
            </Button>
          </Box>
        </Box>

        {/* Scrollable Column List with Checkbox on Left matching screenshot */}
        <Box className="flex-1 overflow-y-auto p-3 space-y-1.5 max-h-[410px]">
          {columns.map((col) => {
            const isChecked = tempVisibility[col.id] !== false;
            return (
              <Box
                key={col.id}
                onClick={() => handleToggleColumn(col.id)}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer border transition-colors duration-150 ${
                  isChecked
                    ? isDark
                      ? "bg-slate-800/60 border-slate-700/60 text-slate-100"
                      : "bg-slate-50 border-slate-200/80 text-slate-900"
                    : isDark
                      ? "bg-slate-900/30 border-slate-800/40 text-slate-500"
                      : "bg-white border-slate-100 text-slate-400"
                }`}
              >
                <Checkbox
                  size="small"
                  checked={isChecked}
                  onChange={() => handleToggleColumn(col.id)}
                  onClick={(e) => e.stopPropagation()}
                  sx={{
                    p: 0,
                    color: isDark ? "#64748b" : "#cbd5e1",
                    "&.Mui-checked": {
                      color: isDark ? "#38bdf8" : "#0284c7",
                    },
                  }}
                />
                <Typography
                  sx={{
                    fontSize: "0.875rem",
                    fontWeight: isChecked ? 600 : 400,
                    color: isChecked
                      ? isDark
                        ? "#f8fafc"
                        : "#1e293b"
                      : isDark
                        ? "#64748b"
                        : "#94a3b8",
                  }}
                >
                  {col.label}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Popover>
  );
}
