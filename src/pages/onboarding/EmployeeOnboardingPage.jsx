import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Chip,
  Alert,
  IconButton,
  InputAdornment,
  Grid,
  Tooltip,
  Autocomplete,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import BadgeIcon from "@mui/icons-material/Badge";
import HomeIcon from "@mui/icons-material/Home";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import DeleteIcon from "@mui/icons-material/Delete";
import SendIcon from "@mui/icons-material/Send";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RefreshIcon from "@mui/icons-material/Refresh";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import SecurityIcon from "@mui/icons-material/Security";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import DescriptionIcon from "@mui/icons-material/Description";
import { toast } from "react-toastify";
import { useThemeMode } from "../../contexts/ThemeContext";
import { OnboardingRoute } from "../../routes/onboarding/onboarding.route";
import { UploadRoute } from "../../routes/upload/upload.route";
import AppLogo from "../../components/common/AppLogo";
import { parseIndianAddress } from "../../utils/locationService";

export default function EmployeeOnboardingPage() {
  const navigate = useNavigate();
  const { isDark } = useThemeMode();

  // Dynamic Fields State
  const [loadingFields, setLoadingFields] = useState(true);
  const [formFields, setFormFields] = useState([]);
  const [formTitle, setFormTitle] = useState("Employee Onboarding");

  // Form Values
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    pan_number: "",
    aadhaar_number: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    latitude: null,
    longitude: null,
  });

  // Dynamic Extra Fields Values
  const [extraValues, setExtraValues] = useState({});

  // File Uploads
  const [panPhoto, setPanPhoto] = useState(null);
  const [panPreview, setPanPreview] = useState(null);
  const [panFileName, setPanFileName] = useState("");
  const [panUrl, setPanUrl] = useState("");
  const [uploadingPan, setUploadingPan] = useState(false);

  const [aadhaarPhoto, setAadhaarPhoto] = useState(null);
  const [aadhaarPreview, setAadhaarPreview] = useState(null);
  const [aadhaarFileName, setAadhaarFileName] = useState("");
  const [aadhaarUrl, setAadhaarUrl] = useState("");
  const [uploadingAadhaar, setUploadingAadhaar] = useState(false);

  // OTP State
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [devOtpHint, setDevOtpHint] = useState(null);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);

  // Load Form Fields on Mount
  useEffect(() => {
    loadFields();
  }, []);

  // OTP Countdown Timer
  useEffect(() => {
    let timer;
    if (otpCountdown > 0) {
      timer = setTimeout(() => setOtpCountdown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpCountdown]);

  const loadFields = async () => {
    setLoadingFields(true);
    const res = await OnboardingRoute.getFields();
    if (res?.data?.fields) {
      setFormFields(res.data.fields);
      if (res.data.title) setFormTitle(res.data.title);
    }
    setLoadingFields(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "mobile") {
      setIsPhoneVerified(false);
      setOtpSent(false);
      setDevOtpHint(null);
      setOtpCountdown(0);
      setOtpCode("");
    }
    if (name === "address") {
      const parsed = parseIndianAddress(value);
      setFormData((prev) => ({
        ...prev,
        address: value,
        city: parsed.city && !prev.city ? parsed.city : prev.city,
        state: parsed.state && !prev.state ? parsed.state : prev.state,
        pincode: parsed.pincode && !prev.pincode ? parsed.pincode : prev.pincode,
      }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleExtraChange = (name, value) => {
    setExtraValues((prev) => ({ ...prev, [name]: value }));
  };

  // OTP Actions
  const handleSendOtp = async () => {
    const mobile = formData.mobile?.trim();
    if (!mobile || !/^[6-9]\d{9}$/.test(mobile)) {
      toast.error("Please enter a valid 10-digit Indian mobile number");
      return;
    }

    setSendingOtp(true);
    const res = await OnboardingRoute.sendOtp(mobile);
    setSendingOtp(false);

    if (res?.success) {
      setOtpSent(true);
      setOtpCountdown(60);
      const generatedOtp = res?.data?.otp || res?.data?.devOtp || res?.devOtp || res?.otp;
      if (generatedOtp) {
        setDevOtpHint(generatedOtp);
        toast.success(`Mobile: ${mobile} | OTP: ${generatedOtp}`, {
          autoClose: 10000,
        });
      } else {
        toast.success(res?.message || `OTP sent to ${mobile}`);
      }
    }
  };

  const handleVerifyOtp = async () => {
    const mobile = formData.mobile?.trim();
    const otp = otpCode.trim();

    if (!otp || otp.length < 4) {
      toast.error("Please enter the 6-digit verification code");
      return;
    }

    setVerifyingOtp(true);
    const res = await OnboardingRoute.verifyOtp(mobile, otp);
    setVerifyingOtp(false);

    if (res?.success) {
      setIsPhoneVerified(true);
      setOtpSent(false);
      setOtpCountdown(0);
      setDevOtpHint(null);
      toast.success("Mobile number verified successfully!");
    }
  };

  // File Handlers - Upload to Empdocument folder via UploadRoute
  const handlePanFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be under 10MB");
      return;
    }
    setPanPhoto(file);
    setPanFileName(file.name);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result;
      setPanPreview(base64);
      setUploadingPan(true);
      try {
        const uploadRes = await UploadRoute.uploadImage(base64, "Empdocument");
        const uploadedUrl = uploadRes?.data?.url || uploadRes?.data?.image || uploadRes?.url;
        if (uploadedUrl) {
          setPanUrl(uploadedUrl);
          toast.success("PAN Card uploaded to Empdocument successfully!");
        }
      } catch (err) {
        console.error("PAN upload failed:", err);
      } finally {
        setUploadingPan(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAadhaarFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be under 10MB");
      return;
    }
    setAadhaarPhoto(file);
    setAadhaarFileName(file.name);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result;
      setAadhaarPreview(base64);
      setUploadingAadhaar(true);
      try {
        const uploadRes = await UploadRoute.uploadImage(base64, "Empdocument");
        const uploadedUrl = uploadRes?.data?.url || uploadRes?.data?.image || uploadRes?.url;
        if (uploadedUrl) {
          setAadhaarUrl(uploadedUrl);
          toast.success("Aadhaar Card uploaded to Empdocument successfully!");
        }
      } catch (err) {
        console.error("Aadhaar upload failed:", err);
      } finally {
        setUploadingAadhaar(false);
      }
    };
    reader.readAsDataURL(file);
  };


  // Reset Form
  const handleResetForm = () => {
    setFormData({
      name: "",
      mobile: "",
      email: "",
      pan_number: "",
      aadhaar_number: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      latitude: null,
      longitude: null,
    });
    setPanPhoto(null);
    setPanPreview(null);
    setPanFileName("");
    setPanUrl("");
    setUploadingPan(false);
    setAadhaarPhoto(null);
    setAadhaarPreview(null);
    setAadhaarFileName("");
    setAadhaarUrl("");
    setUploadingAadhaar(false);
    setIsPhoneVerified(false);
    setOtpSent(false);
    setOtpCode("");
    setOtpCountdown(0);
    setDevOtpHint(null);
    setExtraValues({});
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!formData.name?.trim()) {
      toast.error("Please enter your full name");
      return;
    }

    if (!formData.mobile?.trim()) {
      toast.error("Please enter your mobile number");
      return;
    }

    if (!isPhoneVerified) {
      toast.error("Please verify your mobile number with OTP before submitting");
      return;
    }

    if (!formData.email?.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    if (!formData.pan_number?.trim()) {
      toast.error("Please enter your PAN card number");
      return;
    }

    if (!panPhoto && !panPreview) {
      toast.error("Please upload a photo of your PAN card");
      return;
    }

    if (!formData.aadhaar_number?.trim()) {
      toast.error("Please enter your 12-digit Aadhaar number");
      return;
    }

    if (!aadhaarPhoto && !aadhaarPreview) {
      toast.error("Please upload a photo of your Aadhaar card");
      return;
    }

    if (!formData.address?.trim()) {
      toast.error("Please provide your residential address");
      return;
    }

    // Check dynamic extra fields
    const dynamicFields = formFields.filter(
      (f) =>
        ![
          "name",
          "mobile",
          "email",
          "pan_number",
          "pan_photo",
          "aadhaar_number",
          "aadhaar_photo",
          "address",
          "city",
          "state",
          "pincode",
        ].includes(f.name)
    );

    for (const field of dynamicFields) {
      if (field.required && !extraValues[field.name]) {
        toast.error(`Please provide ${field.label}`);
        return;
      }
    }

    // Ensure images are uploaded to Empdocument and retrieve final URLs
    let finalPanUrl = panUrl;
    if (!finalPanUrl && panPreview) {
      setUploadingPan(true);
      const res = await UploadRoute.uploadImage(panPreview, "Empdocument");
      finalPanUrl = res?.data?.url || res?.data?.image || res?.url;
      setUploadingPan(false);
      if (finalPanUrl) setPanUrl(finalPanUrl);
    }

    let finalAadhaarUrl = aadhaarUrl;
    if (!finalAadhaarUrl && aadhaarPreview) {
      setUploadingAadhaar(true);
      const res = await UploadRoute.uploadImage(aadhaarPreview, "Empdocument");
      finalAadhaarUrl = res?.data?.url || res?.data?.image || res?.url;
      setUploadingAadhaar(false);
      if (finalAadhaarUrl) setAadhaarUrl(finalAadhaarUrl);
    }

    const submission = {
      ...formData,
      pan_photo: finalPanUrl || panPreview,
      aadhaar_photo: finalAadhaarUrl || aadhaarPreview,
      extra_fields: extraValues,
    };

    setIsSubmitting(true);
    const res = await OnboardingRoute.submitOnboarding(submission);
    setIsSubmitting(false);

    if (res?.data) {
      setSubmittedData(res.data);
    }
  };

  // Success Confirmation Screen
  if (submittedData) {
    return (
      <div
        className={`h-screen w-full flex items-center justify-center p-4 ${isDark ? "bg-slate-950 text-slate-100" : "bg-slate-100 text-slate-900"
          }`}
      >
        <Paper
          elevation={0}
          className={`max-w-lg w-full p-8 rounded-3xl border text-center transition-all ${isDark
              ? "bg-slate-900/90 border-slate-800 backdrop-blur-xl shadow-2xl"
              : "bg-white border-slate-200 shadow-xl"
            }`}
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center ring-8 ring-emerald-500/5">
            <CheckCircleIcon sx={{ fontSize: 44 }} />
          </div>
          <Typography variant="h5" className="font-extrabold mb-1">
            Application Submitted!
          </Typography>
          <Typography
            variant="body2"
            className={`mb-5 ${isDark ? "text-slate-400" : "text-slate-600"}`}
          >
            Thank you, <span className="font-semibold text-indigo-500">{submittedData.name}</span>. Your onboarding profile and documents have been submitted to HR.
          </Typography>

          <Box
            className={`p-4 rounded-2xl mb-5 text-left border ${isDark ? "bg-slate-800/60 border-slate-700/60" : "bg-slate-50 border-slate-200"
              }`}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400">
                Application Reference ID
              </span>
              <Chip
                label={submittedData.onboarding_id}
                color="primary"
                size="small"
                className="font-mono font-bold"
              />
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-slate-400">Registered Mobile</span>
              <span className="text-xs font-semibold">{submittedData.mobile}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400">Current Status</span>
              <Chip
                label="Under Review"
                color="warning"
                size="small"
                variant="outlined"
                className="font-semibold"
              />
            </div>
          </Box>

          <div className="flex gap-3 justify-center">
            <Button
              variant="outlined"
              onClick={() => navigate("/")}
              sx={{ borderRadius: "12px", textTransform: "none", fontWeight: 700, px: 3 }}
            >
              Back to Home
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                setSubmittedData(null);
                handleResetForm();
              }}
              sx={{
                borderRadius: "12px",
                textTransform: "none",
                fontWeight: 700,
                px: 3,
                backgroundColor: isDark ? "#6366f1" : "#4f46e5",
              }}
            >
              Submit Another
            </Button>
          </div>
        </Paper>
      </div>
    );
  }

  // Dynamic extra fields
  const standardFields = [
    "name",
    "mobile",
    "email",
    "pan_number",
    "pan_photo",
    "aadhaar_number",
    "aadhaar_photo",
    "address",
    "city",
    "state",
    "pincode",
  ];
  const dynamicExtraFields = formFields.filter(
    (f) => !standardFields.includes(f.name)
  );

  const stateField = formFields.find((f) => f.name === "state" || f.field_name === "state");
  const stateOptions = stateField?.options || [];

  return (
    <div
      className={`w-full min-h-screen flex flex-col transition-colors duration-200 ${
        isDark ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"
      }`}
    >
      {/* TOP HEADER */}
      <header
        className={`sticky top-0 z-30 w-full px-4 sm:px-8 py-3 border-b flex items-center justify-between gap-3 backdrop-blur-xl ${
          isDark
            ? "bg-slate-900/90 border-slate-800 shadow-sm"
            : "bg-white/90 border-slate-200 shadow-xs"
        }`}
      >
        <div className="flex items-center gap-3">
          <Tooltip title="Back to Portal Home">
            <IconButton
              size="small"
              onClick={() => navigate("/")}
              sx={{
                border: isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid #cbd5e1",
                borderRadius: "10px",
                p: 0.8,
              }}
            >
              <ArrowBackIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <div className="flex items-center gap-2.5">
            <AppLogo size={34} showText={false} />
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tight leading-tight">
                {formTitle}
              </h1>
              <p className="text-[11px] text-slate-400">
                Please complete your details and upload required documents
              </p>
            </div>
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outlined"
            size="small"
            onClick={handleResetForm}
            startIcon={<RefreshIcon sx={{ fontSize: 15 }} />}
            sx={{
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.75rem",
              py: 0.6,
              px: 1.6,
              borderColor: isDark ? "rgba(255,255,255,0.15)" : "#cbd5e1",
              color: isDark ? "#94a3b8" : "#64748b",
            }}
          >
            Clear Form
          </Button>

          <Button
            type="button"
            onClick={handleSubmit}
            variant="contained"
            size="small"
            disabled={isSubmitting}
            startIcon={
              isSubmitting ? (
                <CircularProgress size={15} color="inherit" />
              ) : (
                <CheckCircleIcon sx={{ fontSize: 16 }} />
              )
            }
            sx={{
              borderRadius: "10px",
              py: 0.7,
              px: 2.5,
              textTransform: "none",
              fontWeight: 800,
              fontSize: "0.78rem",
              backgroundColor: isDark ? "#6366f1" : "#4f46e5",
              boxShadow: "0 4px 14px rgba(99, 102, 241, 0.35)",
              "&:hover": {
                backgroundColor: isDark ? "#4f46e5" : "#4338ca",
              },
            }}
          >
            {isSubmitting ? "Submitting..." : "Submit Application"}
          </Button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="w-full flex-1  p-2 ">
        {loadingFields ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <CircularProgress size={36} color="primary" />
            <span className="text-sm font-medium text-slate-400">
              Loading onboarding form...
            </span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-2.5">
            {/* 1. PERSONAL INFORMATION */}
            <div
              className={`p-3.5 sm:p-4 rounded-xl border transition-all ${
                isDark
                  ? "bg-slate-900/80 border-slate-800 shadow-sm"
                  : "bg-white border-slate-200 shadow-xs"
              }`}
            >
              <div className="flex items-center gap-2 pb-1.5 mb-2.5 border-b border-slate-100 dark:border-slate-800">
                <div className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <PersonIcon sx={{ fontSize: 16 }} />
                </div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  1. Personal & Contact Information
                </span>
              </div>

                  <Grid container spacing={2}>
                    {/* First Row: Full Name & Email */}
                    <Grid size={{ xs: 12, sm: 3 }}>
                      <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <TextField
                        fullWidth
                        size="small"
                        name="name"
                        placeholder="e.g. Rahul Sharma"
                        value={formData.name}
                        onChange={handleInputChange}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonIcon fontSize="small" sx={{ color: isDark ? "#94a3b8" : "#64748b" }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "10px",
                            backgroundColor: isDark ? "rgba(15, 23, 42, 0.6)" : "#f8fafc",
                          },
                        }}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 3 }}>
                      <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <TextField
                        fullWidth
                        type="email"
                        size="small"
                        name="email"
                        placeholder="e.g. rahul@example.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <EmailIcon fontSize="small" sx={{ color: isDark ? "#94a3b8" : "#64748b" }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "10px",
                            backgroundColor: isDark ? "rgba(15, 23, 42, 0.6)" : "#f8fafc",
                          },
                        }}
                      />
                    </Grid>

                    {/* Second Row: Phone with Send OTP & Enter OTP with Verify OTP */}
                    <Grid size={{ xs: 12, sm: 3}}>
                      <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center gap-1.5">
                        <div className="flex-1">
                          <TextField
                            fullWidth
                            size="small"
                            name="mobile"
                            placeholder="10-digit mobile"
                            value={formData.mobile}
                            disabled={isPhoneVerified}
                            onChange={handleInputChange}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <PhoneIcon fontSize="small" sx={{ color: isDark ? "#94a3b8" : "#64748b" }} />
                                  <span className="text-xs font-bold text-slate-500 ml-1">+91</span>
                                </InputAdornment>
                              ),
                            }}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: "10px",
                                backgroundColor: isDark ? "rgba(15, 23, 42, 0.6)" : "#f8fafc",
                              },
                            }}
                          />
                        </div>

                        {!isPhoneVerified && (
                          <Button
                            variant="contained"
                            size="small"
                            disabled={
                              sendingOtp ||
                              !formData.mobile ||
                              !/^[6-9]\d{9}$/.test(formData.mobile.trim()) ||
                              otpCountdown > 0
                            }
                            onClick={handleSendOtp}
                            startIcon={
                              sendingOtp ? (
                                <CircularProgress size={13} color="inherit" />
                              ) : (
                                <SendIcon sx={{ fontSize: 13 }} />
                              )
                            }
                            sx={{
                              borderRadius: "10px",
                              py: 0.9,
                              px: 1.8,
                              textTransform: "none",
                              fontWeight: 700,
                              fontSize: "0.75rem",
                              whiteSpace: "nowrap",
                              backgroundColor: isDark ? "#6366f1" : "#4f46e5",
                            }}
                          >
                            {otpCountdown > 0 && formData.mobile?.trim()
                              ? `${otpCountdown}s`
                              : otpSent
                                ? "Resend"
                                : "Send OTP"}
                          </Button>
                        )}
                      </div>

                      {/* Dev Test OTP Hint */}
                      {devOtpHint && !isPhoneVerified && (
                        <div className="mt-1 flex items-center justify-between text-[11px] text-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/30 px-2 py-0.5 rounded">
                          <span>Test OTP: <strong>{devOtpHint}</strong></span>
                          <button
                            type="button"
                            onClick={() => setOtpCode(devOtpHint)}
                            className="font-bold underline text-[10px]"
                          >
                            Auto-Fill
                          </button>
                        </div>
                      )}
                    </Grid>

                    <Grid size={{ xs: 12, sm: 3 }}>
                      <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                        Enter OTP Code <span className="text-red-500">*</span>
                      </label>
                      {isPhoneVerified ? (
                        <div className="h-[40px] px-3 rounded-xl border border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/20 flex items-center gap-2">
                          <CheckCircleIcon sx={{ fontSize: 18 }} className="text-emerald-500" />
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                            Mobile Verified Successfully
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <div className="flex-1">
                            <TextField
                              fullWidth
                              size="small"
                              placeholder={otpSent ? "Enter 6-digit OTP" : "Click Send OTP first"}
                              disabled={!otpSent}
                              value={otpCode}
                              onChange={(e) =>
                                setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                              }
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <LockOutlinedIcon
                                      sx={{ fontSize: 16 }}
                                      className={otpSent ? "text-indigo-500" : "text-slate-400"}
                                    />
                                  </InputAdornment>
                                ),
                              }}
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: "10px",
                                  letterSpacing: otpSent ? "2px" : "normal",
                                  fontWeight: otpSent ? 700 : 400,
                                  backgroundColor: isDark ? "rgba(15, 23, 42, 0.6)" : "#f8fafc",
                                },
                              }}
                            />
                          </div>

                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            disabled={!otpSent || verifyingOtp || otpCode.length < 4}
                            onClick={handleVerifyOtp}
                            startIcon={
                              verifyingOtp ? (
                                <CircularProgress size={13} color="inherit" />
                              ) : (
                                <CheckCircleIcon sx={{ fontSize: 14 }} />
                              )
                            }
                            sx={{
                              borderRadius: "10px",
                              py: 0.9,
                              px: 1.8,
                              textTransform: "none",
                              fontWeight: 700,
                              fontSize: "0.75rem",
                              whiteSpace: "nowrap",
                            }}
                          >
                            Verify OTP
                          </Button>
                        </div>
                      )}
                    </Grid>
                  </Grid>
                </div>

                {/* 2. IDENTITY DOCUMENTS: PAN CARD & PHOTO, THEN AADHAAR CARD & PHOTO */}
            <div
              className={`p-3.5 sm:p-4 rounded-xl border transition-all ${
                isDark
                  ? "bg-slate-900/80 border-slate-800 shadow-sm"
                  : "bg-white border-slate-200 shadow-xs"
              }`}
            >
              <div className="flex items-center gap-2 pb-1.5 mb-2.5 border-b border-slate-100 dark:border-slate-800">
                <div className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <BadgeIcon sx={{ fontSize: 16 }} />
                </div>
                <div>
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200 leading-none">
                    2. Identity Documents (PAN & Aadhaar)
                  </h2>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Enter valid document numbers and upload card photos
                  </p>
                </div>
              </div>

              <Grid container spacing={2}>
                {/* PAN Card & Photo */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <div className="p-3 sm:p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <CreditCardIcon sx={{ fontSize: 16 }} className="text-indigo-500" />
                        PAN Card Details
                      </span>
                      <span className="text-[10px] font-bold text-red-500 bg-red-50 dark:bg-red-950/40 px-1.5 py-0.5 rounded">
                        Required
                      </span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                        PAN Card Number
                      </label>
                      <TextField
                        fullWidth
                        size="small"
                        name="pan_number"
                        placeholder="ABCDE1234F"
                        value={formData.pan_number}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            pan_number: e.target.value.toUpperCase().slice(0, 10),
                          }))
                        }
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "8px",
                            backgroundColor: isDark ? "rgba(15, 23, 42, 0.8)" : "#ffffff",
                            fontWeight: 700,
                          },
                        }}
                      />
                    </div>

                    {/* Upload PAN Photo */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                        PAN Card Photo
                      </label>
                      {panPreview ? (
                        <div className="flex items-center gap-2 p-2 rounded-lg border border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20">
                          <img
                            src={panPreview}
                            alt="PAN Preview"
                            className="w-14 h-12 object-cover rounded border"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 truncate flex items-center gap-1">
                              {uploadingPan ? (
                                <>
                                  <CircularProgress size={10} color="inherit" /> Uploading to Empdocument...
                                </>
                              ) : (
                                "✓ PAN Photo Ready"
                              )}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">
                              {panFileName || "pan_card.jpg"}
                            </p>
                          </div>
                          <IconButton
                            size="small"
                            color="error"
                            disabled={uploadingPan}
                            onClick={() => {
                              setPanPhoto(null);
                              setPanPreview(null);
                              setPanFileName("");
                              setPanUrl("");
                            }}
                          >
                            <DeleteIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </div>
                      ) : (
                        <label
                          className={`flex items-center justify-center gap-2 p-3 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
                            isDark
                              ? "border-slate-700 hover:border-indigo-500 bg-slate-800/40"
                              : "border-slate-300 hover:border-indigo-500 bg-white"
                          }`}
                        >
                          <CloudUploadIcon className="text-indigo-500" sx={{ fontSize: 20 }} />
                          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                            Upload PAN Card Photo
                          </span>
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            className="hidden"
                            onChange={handlePanFileChange}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </Grid>

                {/* Aadhaar Card & Photo */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <div className="p-3 sm:p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <FingerprintIcon sx={{ fontSize: 16 }} className="text-indigo-500" />
                        Aadhaar Card Details
                      </span>
                      <span className="text-[10px] font-bold text-red-500 bg-red-50 dark:bg-red-950/40 px-1.5 py-0.5 rounded">
                        Required
                      </span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                        Aadhaar Card Number
                      </label>
                      <TextField
                        fullWidth
                        size="small"
                        name="aadhaar_number"
                        placeholder="12-digit Aadhaar"
                        value={formData.aadhaar_number}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            aadhaar_number: e.target.value.replace(/\D/g, "").slice(0, 12),
                          }))
                        }
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "8px",
                            backgroundColor: isDark ? "rgba(15, 23, 42, 0.8)" : "#ffffff",
                            fontWeight: 700,
                          },
                        }}
                      />
                    </div>

                    {/* Upload Aadhaar Photo */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                        Aadhaar Card Photo
                      </label>
                      {aadhaarPreview ? (
                        <div className="flex items-center gap-2 p-2 rounded-lg border border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20">
                          <img
                            src={aadhaarPreview}
                            alt="Aadhaar Preview"
                            className="w-14 h-12 object-cover rounded border"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 truncate flex items-center gap-1">
                              {uploadingAadhaar ? (
                                <>
                                  <CircularProgress size={10} color="inherit" /> Uploading to Empdocument...
                                </>
                              ) : (
                                "✓ Aadhaar Photo Ready"
                              )}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">
                              {aadhaarFileName || "aadhaar_card.jpg"}
                            </p>
                          </div>
                          <IconButton
                            size="small"
                            color="error"
                            disabled={uploadingAadhaar}
                            onClick={() => {
                              setAadhaarPhoto(null);
                              setAadhaarPreview(null);
                              setAadhaarFileName("");
                              setAadhaarUrl("");
                            }}
                          >
                            <DeleteIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </div>
                      ) : (
                        <label
                          className={`flex items-center justify-center gap-2 p-3 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
                            isDark
                              ? "border-slate-700 hover:border-indigo-500 bg-slate-800/40"
                              : "border-slate-300 hover:border-indigo-500 bg-white"
                          }`}
                        >
                          <CloudUploadIcon className="text-indigo-500" sx={{ fontSize: 20 }} />
                          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                            Upload Aadhaar Card Photo
                          </span>
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            className="hidden"
                            onChange={handleAadhaarFileChange}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </Grid>
              </Grid>
            </div>

            {/* 3. RESIDENTIAL ADDRESS DETAILS */}
            <div
              className={`p-3.5 sm:p-4 rounded-xl border transition-all ${
                isDark
                  ? "bg-slate-900/80 border-slate-800 shadow-sm"
                  : "bg-white border-slate-200 shadow-xs"
              }`}
            >
              <div className="flex items-center gap-2 pb-1.5 mb-2.5 border-b border-slate-100 dark:border-slate-800">
                <div className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <HomeIcon sx={{ fontSize: 16 }} />
                </div>
                <div>
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200 leading-none">
                    3. Residential Address Details
                  </h2>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Enter street address, city, state and postal pincode
                  </p>
                </div>
              </div>

              <Grid container spacing={2}>
                {/* Street Address */}
                <Grid size={{ xs: 12 }}>
                  <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Street Address / Locality / Flat No. <span className="text-red-500">*</span>
                  </label>
                  <TextField
                    fullWidth
                    size="small"
                    name="address"
                    placeholder="House / Flat No., Building Name, Street / Road, Area"
                    value={formData.address}
                    onChange={handleInputChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationOnIcon fontSize="small" sx={{ color: isDark ? "#94a3b8" : "#64748b" }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                        backgroundColor: isDark ? "rgba(15, 23, 42, 0.6)" : "#ffffff",
                      },
                    }}
                  />
                </Grid>

                {/* City */}
                <Grid size={{ xs: 12, sm: 4 }}>
                  <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    City / Town <span className="text-red-500">*</span>
                  </label>
                  <TextField
                    fullWidth
                    size="small"
                    name="city"
                    placeholder="e.g. Mumbai / Delhi / Lucknow"
                    value={formData.city}
                    onChange={handleInputChange}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                        backgroundColor: isDark ? "rgba(15, 23, 42, 0.6)" : "#ffffff",
                      },
                    }}
                  />
                </Grid>

                {/* State (Dropdown from states table) */}
                <Grid size={{ xs: 12, sm: 4 }}>
                  <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    State <span className="text-red-500">*</span>
                  </label>
                  <Autocomplete
                    id="onboarding-state-select"
                    options={stateOptions}
                    getOptionLabel={(option) => {
                      if (typeof option === "string") return option;
                      return option?.label || option?.value || "";
                    }}
                    isOptionEqualToValue={(option, value) => {
                      const optVal = typeof option === "string" ? option : option?.value || option?.label || "";
                      const val = typeof value === "string" ? value : value?.value || value?.label || "";
                      return String(optVal).trim().toLowerCase() === String(val).trim().toLowerCase();
                    }}
                    value={
                      stateOptions.find(
                        (opt) =>
                          String(opt.value || "").trim().toLowerCase() === String(formData.state || "").trim().toLowerCase() ||
                          String(opt.label || "").trim().toLowerCase() === String(formData.state || "").trim().toLowerCase()
                      ) || (formData.state ? { label: formData.state, value: formData.state } : null)
                    }
                    onChange={(e, newValue) => {
                      const val = typeof newValue === "string" ? newValue : newValue ? newValue.value || newValue.label : "";
                      setFormData((prev) => ({ ...prev, state: val }));
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        name="state"
                        placeholder={stateOptions.length > 0 ? "Select State" : "Loading states..."}
                        size="small"
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "10px",
                            backgroundColor: isDark ? "rgba(15, 23, 42, 0.6)" : "#ffffff",
                          },
                        }}
                      />
                    )}
                  />
                </Grid>

                {/* Pincode */}
                <Grid size={{ xs: 12, sm: 4 }}>
                  <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Pincode <span className="text-red-500">*</span>
                  </label>
                  <TextField
                    fullWidth
                    size="small"
                    name="pincode"
                    placeholder="6-digit Pincode"
                    value={formData.pincode}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        pincode: e.target.value.replace(/\D/g, "").slice(0, 6),
                      }))
                    }
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                        backgroundColor: isDark ? "rgba(15, 23, 42, 0.6)" : "#ffffff",
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </div>

            {/* 4. EXTRA DYNAMIC FIELDS (IF CONFIGURED IN DB) */}
            {dynamicExtraFields.length > 0 && (
              <div
                className={`p-3.5 sm:p-4 rounded-xl border transition-all ${
                  isDark
                    ? "bg-slate-900/80 border-slate-800 shadow-sm"
                    : "bg-white border-slate-200 shadow-xs"
                }`}
              >
                <div className="flex items-center gap-2 pb-1.5 mb-2.5 border-b border-slate-100 dark:border-slate-800">
                  <div className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <DescriptionIcon sx={{ fontSize: 16 }} />
                  </div>
                  <div>
                    <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 leading-none">
                      Additional Information
                    </h2>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Extra details configured in the system
                    </p>
                  </div>
                </div>

                <Grid container spacing={2.5}>
                  {dynamicExtraFields.map((field) => (
                    <Grid size={{ xs: 12, sm: 6 }} key={field.id || field.name}>
                      <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </label>
                      <TextField
                        fullWidth
                        size="small"
                        name={field.name}
                        type={field.type || "text"}
                        placeholder={`Enter ${field.label}`}
                        value={extraValues[field.name] || ""}
                        onChange={(e) => handleExtraChange(field.name, e.target.value)}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "10px",
                            backgroundColor: isDark ? "rgba(15, 23, 42, 0.6)" : "#f8fafc",
                          },
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </div>
            )}
          </form>
        )}
      </main>
    </div>
  );
}
