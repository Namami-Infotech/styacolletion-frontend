import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  MenuItem,
  InputAdornment,
  Grid,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import VerifiedIcon from "@mui/icons-material/Verified";
import PlaceIcon from "@mui/icons-material/Place";
import LaunchIcon from "@mui/icons-material/Launch";
import { toast } from "react-toastify";
import { useThemeMode } from "../../contexts/ThemeContext";
import { OnboardingRoute } from "../../routes/onboarding/onboarding.route";
import Navbar from "../../components/common/Navbar";
import { useAuth } from "../../contexts/AuthContext";

export default function AdminOnboardingListPage() {
  const { isDark } = useThemeMode();
  const { user, logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [onboardings, setOnboardings] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Selected for Review Modal
  const [selectedOnboarding, setSelectedOnboarding] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Approval Form Data
  const [approvalData, setApprovalData] = useState({
    work_shift: "General Shift (9 AM - 6 PM)",
    per_month_salary: 25000,
    password: "Employee@123",
  });

  // Rejection Dialog
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    loadOnboardings();
  }, [statusFilter]);

  const loadOnboardings = async () => {
    setLoading(true);
    const res = await OnboardingRoute.getAllOnboardings({
      status: statusFilter,
      search,
    });
    if (res?.data) {
      setOnboardings(res.data.onboardings || []);
      setTotalCount(res.data.total || 0);
    }
    setLoading(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadOnboardings();
  };

  const copyPublicLink = () => {
    const link = `${window.location.origin}/onboarding`;
    navigator.clipboard.writeText(link);
    toast.success("Public Onboarding Link copied to clipboard!");
  };

  const openReviewModal = (record) => {
    setSelectedOnboarding(record);
    setReviewModalOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedOnboarding) return;
    setActionLoading(true);
    const res = await OnboardingRoute.approveOnboarding(selectedOnboarding.id, approvalData);
    setActionLoading(false);

    if (res?.success) {
      setReviewModalOpen(false);
      loadOnboardings();
    }
  };

  const handleReject = async () => {
    if (!selectedOnboarding) return;
    setActionLoading(true);
    const res = await OnboardingRoute.rejectOnboarding(selectedOnboarding.id, rejectReason);
    setActionLoading(false);

    if (res?.success) {
      setRejectDialogOpen(false);
      setReviewModalOpen(false);
      setRejectReason("");
      loadOnboardings();
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-200 ${
        isDark ? "bg-slate-950 text-slate-100" : "bg-slate-100 text-slate-900"
      }`}
    >
      <Navbar user={user} logout={logout} />

      <main className="flex-1 w-full px-4 py-4 sm:px-6 flex flex-col space-y-4">
        {/* Top Header Banner */}
        <div
          className={`p-4 sm:p-5 rounded-2xl border flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 transition-all duration-200 ${
            isDark
              ? "bg-slate-900/70 border-slate-800/80 backdrop-blur-xl shadow-xl"
              : "bg-white border-slate-200 shadow-sm"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 text-indigo-500 flex items-center justify-center font-bold">
              <HowToRegIcon sx={{ fontSize: 26 }} />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight">
                Employee Onboarding Applications
              </h1>
              <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                Review candidate registrations, verified documents (PAN/Aadhaar), and approve into employees table.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="outlined"
              size="small"
              onClick={copyPublicLink}
              startIcon={<ContentCopyIcon fontSize="small" />}
              sx={{
                borderRadius: "12px",
                textTransform: "none",
                fontWeight: 600,
                borderColor: isDark ? "rgba(99, 102, 241, 0.4)" : "#6366f1",
                color: isDark ? "#818cf8" : "#4f46e5",
                backgroundColor: isDark ? "rgba(99, 102, 241, 0.1)" : "#eef2ff",
              }}
            >
              Copy Public Onboarding Link
            </Button>

            <Tooltip title="Open Public Form in New Tab">
              <IconButton
                size="small"
                onClick={() => window.open("/onboarding", "_blank")}
                sx={{
                  border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #cbd5e1",
                  borderRadius: "12px",
                }}
              >
                <LaunchIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </div>
        </div>

        {/* Toolbar: Search, Status Filter & Refresh */}
        <div
          className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 ${
            isDark
              ? "bg-slate-900/60 border-slate-800/80"
              : "bg-white border-slate-200 shadow-sm"
          }`}
        >
          <form
            onSubmit={handleSearchSubmit}
            className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
          >
            <TextField
              size="small"
              placeholder="Search by candidate name, phone, PAN, Aadhaar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: isDark ? "#94a3b8" : "#64748b" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                width: { xs: "100%", sm: 340 },
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  backgroundColor: isDark ? "rgba(15, 23, 42, 0.6)" : "#f8fafc",
                },
              }}
            />

            <Button
              type="submit"
              variant="contained"
              size="small"
              sx={{
                borderRadius: "12px",
                textTransform: "none",
                fontWeight: 600,
                backgroundColor: isDark ? "#6366f1" : "#4f46e5",
              }}
            >
              Search
            </Button>
          </form>

          <div className="flex items-center gap-2">
            <TextField
              select
              size="small"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{
                minWidth: 140,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  backgroundColor: isDark ? "rgba(15, 23, 42, 0.6)" : "#f8fafc",
                },
              }}
            >
              <MenuItem value="All">All Statuses</MenuItem>
              <MenuItem value="pending">Pending Review</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </TextField>

            <Tooltip title="Refresh List">
              <IconButton
                onClick={loadOnboardings}
                sx={{
                  border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #cbd5e1",
                  borderRadius: "12px",
                }}
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </div>
        </div>

        {/* Data Table */}
        <Paper
          elevation={0}
          className={`flex-1 rounded-2xl border overflow-hidden flex flex-col ${
            isDark
              ? "bg-slate-900/60 border-slate-800"
              : "bg-white border-slate-200 shadow-sm"
          }`}
        >
          <TableContainer className="flex-1">
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow
                  sx={{
                    "& th": {
                      backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                      color: isDark ? "#94a3b8" : "#475569",
                      fontWeight: 700,
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      borderColor: isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0",
                    },
                  }}
                >
                  <TableCell>Ref ID</TableCell>
                  <TableCell>Candidate Name</TableCell>
                  <TableCell>Mobile</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>PAN / Aadhaar</TableCell>
                  <TableCell>Address / Location</TableCell>
                  <TableCell>Submitted On</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                      <CircularProgress size={32} />
                      <div className="text-xs text-slate-400 mt-2 font-medium">
                        Loading onboarding records...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : onboardings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                      <p className="text-sm font-semibold text-slate-400">
                        No onboarding applications found
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Share the public link with candidates to receive applications.
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  onboardings.map((row) => (
                    <TableRow
                      key={row.id}
                      hover
                      sx={{
                        "& td": {
                          borderColor: isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9",
                        },
                      }}
                    >
                      <TableCell className="font-mono text-xs font-bold text-indigo-500">
                        {row.onboarding_id}
                      </TableCell>

                      <TableCell>
                        <div className="font-bold text-sm">{row.name}</div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs font-semibold">
                          <span>+91 {row.mobile}</span>
                          {row.is_phone_verified && (
                            <Tooltip title="Mobile Verified with OTP">
                              <VerifiedIcon sx={{ fontSize: 15, color: "#10b981" }} />
                            </Tooltip>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="text-xs">{row.email}</TableCell>

                      <TableCell>
                        <div className="text-xs space-y-0.5">
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold mr-1">PAN:</span>
                            <span className="font-mono font-semibold">{row.pan_number || "—"}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold mr-1">AADHAAR:</span>
                            <span className="font-mono font-semibold">{row.aadhaar_number || "—"}</span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell sx={{ maxWidth: 220 }}>
                        <div className="text-xs truncate flex items-center gap-1 text-slate-400" title={row.address}>
                          <PlaceIcon sx={{ fontSize: 14 }} className="text-red-500 flex-shrink-0" />
                          <span className="truncate">{row.address || `${row.city || ""} ${row.state || ""}`}</span>
                        </div>
                      </TableCell>

                      <TableCell className="text-xs text-slate-400">
                        {new Date(row.createdAt).toLocaleDateString()}
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={row.status.toUpperCase()}
                          size="small"
                          color={
                            row.status === "approved"
                              ? "success"
                              : row.status === "rejected"
                              ? "error"
                              : "warning"
                          }
                          sx={{
                            fontWeight: 700,
                            fontSize: "0.65rem",
                            borderRadius: "8px",
                          }}
                        />
                      </TableCell>

                      <TableCell align="right">
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<VisibilityIcon fontSize="small" />}
                          onClick={() => openReviewModal(row)}
                          sx={{
                            borderRadius: "10px",
                            textTransform: "none",
                            fontWeight: 600,
                            py: 0.5,
                            fontSize: "0.75rem",
                          }}
                        >
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <div
            className={`p-3 border-t flex justify-between items-center text-xs ${
              isDark ? "border-slate-800 text-slate-400" : "border-slate-200 text-slate-600"
            }`}
          >
            <span>Total: <strong>{totalCount}</strong> applications</span>
          </div>
        </Paper>
      </main>

      {/* Review & Approval Modal */}
      {selectedOnboarding && (
        <Dialog
          open={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: "24px",
              backgroundColor: isDark ? "#0f172a" : "#ffffff",
              color: isDark ? "#ffffff" : "#0f172a",
              border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e2e8f0",
            },
          }}
        >
          <DialogTitle className="flex justify-between items-center border-b pb-3 border-slate-700/50">
            <div>
              <span className="font-extrabold text-lg">Review Candidate Onboarding</span>
              <div className="text-xs text-indigo-400 font-mono mt-0.5">
                Ref ID: {selectedOnboarding.onboarding_id}
              </div>
            </div>
            <Chip
              label={selectedOnboarding.status.toUpperCase()}
              size="small"
              color={
                selectedOnboarding.status === "approved"
                  ? "success"
                  : selectedOnboarding.status === "rejected"
                  ? "error"
                  : "warning"
              }
              sx={{ fontWeight: 700 }}
            />
          </DialogTitle>

          <DialogContent className="pt-4 space-y-6">
            {/* Candidate Summary */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Candidate Name</span>
                <span className="font-bold text-sm">{selectedOnboarding.name}</span>
              </Grid>
              <Grid item xs={12} sm={4}>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Mobile (Verified)</span>
                <span className="font-bold text-sm flex items-center gap-1">
                  +91 {selectedOnboarding.mobile}
                  <VerifiedIcon sx={{ fontSize: 16, color: "#10b981" }} />
                </span>
              </Grid>
              <Grid item xs={12} sm={4}>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Email</span>
                <span className="font-bold text-sm">{selectedOnboarding.email}</span>
              </Grid>
            </Grid>

            {/* Document Cards */}
            <div className="border-t pt-4 border-slate-700/50">
              <Typography variant="subtitle2" className="font-bold mb-3">
                Uploaded Identity Documents
              </Typography>
              <Grid container spacing={3}>
                {/* PAN Card Photo & Number */}
                <Grid item xs={12} sm={6}>
                  <div className={`p-4 rounded-2xl border ${isDark ? "bg-slate-800/40 border-slate-700/50" : "bg-slate-50 border-slate-200"}`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold uppercase text-slate-400">PAN Card</span>
                      <span className="font-mono text-sm font-bold text-indigo-500">
                        {selectedOnboarding.pan_number || "—"}
                      </span>
                    </div>
                    {selectedOnboarding.pan_photo ? (
                      <a href={selectedOnboarding.pan_photo} target="_blank" rel="noreferrer" className="block relative group">
                        <img
                          src={selectedOnboarding.pan_photo}
                          alt="PAN Card"
                          className="w-full h-44 object-cover rounded-xl border border-slate-600/30"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center text-white text-xs font-bold gap-1">
                          <LaunchIcon fontSize="small" /> Open Full Image
                        </div>
                      </a>
                    ) : (
                      <div className="h-32 flex items-center justify-center text-xs text-slate-400">
                        No PAN photo uploaded
                      </div>
                    )}
                  </div>
                </Grid>

                {/* Aadhaar Card Photo & Number */}
                <Grid item xs={12} sm={6}>
                  <div className={`p-4 rounded-2xl border ${isDark ? "bg-slate-800/40 border-slate-700/50" : "bg-slate-50 border-slate-200"}`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold uppercase text-slate-400">Aadhaar Card</span>
                      <span className="font-mono text-sm font-bold text-indigo-500">
                        {selectedOnboarding.aadhaar_number || "—"}
                      </span>
                    </div>
                    {selectedOnboarding.aadhaar_photo ? (
                      <a href={selectedOnboarding.aadhaar_photo} target="_blank" rel="noreferrer" className="block relative group">
                        <img
                          src={selectedOnboarding.aadhaar_photo}
                          alt="Aadhaar Card"
                          className="w-full h-44 object-cover rounded-xl border border-slate-600/30"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center text-white text-xs font-bold gap-1">
                          <LaunchIcon fontSize="small" /> Open Full Image
                        </div>
                      </a>
                    ) : (
                      <div className="h-32 flex items-center justify-center text-xs text-slate-400">
                        No Aadhaar photo uploaded
                      </div>
                    )}
                  </div>
                </Grid>
              </Grid>
            </div>

            {/* Address & Google Maps Details */}
            <div className="border-t pt-4 border-slate-700/50">
              <Typography variant="subtitle2" className="font-bold mb-2">
                Home Address & Google Maps Location
              </Typography>
              <div className={`p-4 rounded-2xl border ${isDark ? "bg-slate-800/40 border-slate-700/50" : "bg-slate-50 border-slate-200"}`}>
                <div className="flex items-start gap-2">
                  <PlaceIcon className="text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-sm block">{selectedOnboarding.address || "No address entered"}</span>
                    <span className="text-xs text-slate-400 block mt-1">
                      City: {selectedOnboarding.city || "—"} | State: {selectedOnboarding.state || "—"} | Pincode: {selectedOnboarding.pincode || "—"}
                    </span>
                    {selectedOnboarding.latitude && selectedOnboarding.longitude && (
                      <a
                        href={`https://maps.google.com/?q=${selectedOnboarding.latitude},${selectedOnboarding.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:underline mt-2 font-medium"
                      >
                        <LaunchIcon sx={{ fontSize: 13 }} /> View Coordinates on Google Maps ({selectedOnboarding.latitude}, {selectedOnboarding.longitude})
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Approval Parameters if Pending */}
            {selectedOnboarding.status === "pending" && (
              <div className="border-t pt-4 border-slate-700/50">
                <Typography variant="subtitle2" className="font-bold mb-3 text-indigo-400">
                  Approval Settings (Generate Official Employee Account)
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={4}>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                      Work Shift
                    </label>
                    <TextField
                      fullWidth
                      size="small"
                      value={approvalData.work_shift}
                      onChange={(e) => setApprovalData((p) => ({ ...p, work_shift: e.target.value }))}
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                      Monthly Salary (₹)
                    </label>
                    <TextField
                      fullWidth
                      type="number"
                      size="small"
                      value={approvalData.per_month_salary}
                      onChange={(e) => setApprovalData((p) => ({ ...p, per_month_salary: e.target.value }))}
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                      Initial Login Password
                    </label>
                    <TextField
                      fullWidth
                      size="small"
                      value={approvalData.password}
                      onChange={(e) => setApprovalData((p) => ({ ...p, password: e.target.value }))}
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
                    />
                  </Grid>
                </Grid>
              </div>
            )}
          </DialogContent>

          <DialogActions className="p-4 border-t border-slate-700/50 flex justify-between">
            <Button
              onClick={() => setReviewModalOpen(false)}
              color="inherit"
              sx={{ borderRadius: "10px", textTransform: "none" }}
            >
              Close
            </Button>

            {selectedOnboarding.status === "pending" && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outlined"
                  color="error"
                  disabled={actionLoading}
                  onClick={() => setRejectDialogOpen(true)}
                  startIcon={<CancelIcon />}
                  sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 700 }}
                >
                  Reject
                </Button>

                <Button
                  variant="contained"
                  color="success"
                  disabled={actionLoading}
                  onClick={handleApprove}
                  startIcon={actionLoading ? <CircularProgress size={16} color="inherit" /> : <CheckCircleIcon />}
                  sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 700, px: 3 }}
                >
                  Approve & Create Employee
                </Button>
              </div>
            )}
          </DialogActions>
        </Dialog>
      )}

      {/* Reject Reason Dialog */}
      <Dialog
        open={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: "18px", p: 1 } }}
      >
        <DialogTitle className="font-bold">Reject Onboarding Application</DialogTitle>
        <DialogContent className="pt-2">
          <p className="text-xs text-slate-500 mb-3">
            Please enter a reason for rejecting this candidate's onboarding.
          </p>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="e.g. Invalid PAN or Aadhaar card photo. Please re-upload clearer copies."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
          />
        </DialogContent>
        <DialogActions className="p-3">
          <Button onClick={() => setRejectDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            disabled={actionLoading}
            onClick={handleReject}
            sx={{ borderRadius: "10px", fontWeight: 700 }}
          >
            Confirm Rejection
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
