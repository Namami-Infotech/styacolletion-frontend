import axios from "axios";
import { toast } from "react-toastify";

const baseURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export const OnboardingRoute = {
  // Check candidate status (already onboarded, under review, rejected with reason)
  checkStatus: async ({ mobile, email }) => {
    try {
      const response = await axios.post(
        `${baseURL}/api/v1/onboarding/check-status`,
        { mobile, email },
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error("Error checking candidate status:", error);
      const errorData = error.response?.data || {
        statusCode: error.response?.status || 500,
        message: error.response?.data?.message || error.message || "Failed to check candidate status",
        success: false,
      };
      return errorData;
    }
  },

  // Fetch dynamic form fields configured in DB
  getFields: async () => {
    try {
      const response = await axios.get(`${baseURL}/api/v1/onboarding/fields`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching onboarding fields:", error);
      const errorData = error.response?.data || {
        statusCode: 500,
        message: error.message || "Failed to load onboarding form fields",
        success: false,
      };
      return errorData;
    }
  },

  // Send OTP to candidate mobile
  sendOtp: async (mobile) => {
    try {
      const response = await axios.post(
        `${baseURL}/api/v1/onboarding/send-otp`,
        { mobile },
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error("Error sending OTP:", error);
      const errorData = error.response?.data || {
        statusCode: error.response?.status || 500,
        message: error.response?.data?.message || error.message || "Failed to send OTP",
        errors: error.response?.data?.errors || [],
        success: false,
      };
      // For 409 status/duplicate, the page opens a dedicated status modal instead of toast
      if (errorData.statusCode !== 409) {
        toast.error(errorData.message || "Failed to send OTP");
      }
      return errorData;
    }
  },

  // Verify OTP
  verifyOtp: async (mobile, otp) => {
    try {
      const response = await axios.post(
        `${baseURL}/api/v1/onboarding/verify-otp`,
        { mobile, otp },
        { withCredentials: true }
      );
      toast.success(response.data?.message || "Mobile verified successfully!");
      return response.data;
    } catch (error) {
      console.error("Error verifying OTP:", error);
      const errorData = error.response?.data || {
        statusCode: 400,
        message: error.message || "Invalid OTP code",
        success: false,
      };
      toast.error(errorData.message || "Invalid OTP code");
      return errorData;
    }
  },

  // Submit candidate onboarding details
  submitOnboarding: async (formData) => {
    try {
      const isFormData = formData instanceof FormData;
      const response = await axios.post(`${baseURL}/api/v1/onboarding/submit`, formData, {
        headers: isFormData ? { "Content-Type": "multipart/form-data" } : {},
        withCredentials: true,
      });
      toast.success(response.data?.message || "Onboarding application submitted!");
      return response.data;
    } catch (error) {
      console.error("Error submitting onboarding:", error);
      const errorData = error.response?.data || {
        statusCode: error.response?.status || 500,
        message: error.response?.data?.message || error.message || "Failed to submit onboarding application",
        errors: error.response?.data?.errors || [],
        success: false,
      };
      // For 409 status/duplicate, the page opens a dedicated status modal instead of toast
      if (errorData.statusCode !== 409) {
        toast.error(errorData.message || "Submission failed");
      }
      return errorData;
    }
  },

  // Admin: Get all onboarding applications
  getAllOnboardings: async (params = {}) => {
    try {
      const response = await axios.get(`${baseURL}/api/v1/onboarding`, {
        params,
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching onboardings list:", error);
      const errorData = error.response?.data || {
        statusCode: 500,
        message: error.message || "Failed to fetch onboardings",
        success: false,
      };
      return errorData;
    }
  },

  // Admin: Get single onboarding details
  getOnboardingById: async (id) => {
    try {
      const response = await axios.get(`${baseURL}/api/v1/onboarding/${id}`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching onboarding detail:", error);
      const errorData = error.response?.data || {
        statusCode: 500,
        message: error.message || "Failed to fetch onboarding detail",
        success: false,
      };
      return errorData;
    }
  },

  // Admin: Approve onboarding & create employee
  approveOnboarding: async (id, data = {}) => {
    try {
      const response = await axios.patch(
        `${baseURL}/api/v1/onboarding/${id}/approve`,
        data,
        { withCredentials: true }
      );
      toast.success(response.data?.message || "Onboarding approved successfully!");
      return response.data;
    } catch (error) {
      console.error("Error approving onboarding:", error);
      const errorData = error.response?.data || {
        statusCode: 500,
        message: error.message || "Failed to approve onboarding",
        success: false,
      };
      toast.error(errorData.message || "Approval failed");
      return errorData;
    }
  },

  // Admin: Reject onboarding
  rejectOnboarding: async (id, reason) => {
    try {
      const response = await axios.patch(
        `${baseURL}/api/v1/onboarding/${id}/reject`,
        { reason },
        { withCredentials: true }
      );
      toast.info(response.data?.message || "Onboarding rejected");
      return response.data;
    } catch (error) {
      console.error("Error rejecting onboarding:", error);
      const errorData = error.response?.data || {
        statusCode: 500,
        message: error.message || "Failed to reject onboarding",
        success: false,
      };
      toast.error(errorData.message || "Rejection failed");
      return errorData;
    }
  },
};
