import axios from "axios";
import { toast } from "react-toastify";

const baseURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export const leaveProfileRoute = {
  createLeaveProfile: async (data) => {
    try {
      const result = await axios.post(`${baseURL}/api/v1/leave-profiles/create`, data, {
        withCredentials: true,
      });
      return result.data;
    } catch (error) {
      console.error("Create leave profile error:", error);
      const errorData = error.response?.data || {
        statusCode: 500,
        message: error.message || "Failed to create leave profile",
        success: false,
      };
      toast.error(errorData.message || "Failed to create leave profile");
      return errorData;
    }
  },

  getAllLeaveProfiles: async ({ page, limit, search, status } = {}) => {
    try {
      const result = await axios.get(`${baseURL}/api/v1/leave-profiles/get-all`, {
        withCredentials: true,
        params: { page, limit, search, status },
      });
      return result.data;
    } catch (error) {
      console.error("Get all leave profiles error:", error);
      const errorData = error.response?.data || {
        statusCode: 500,
        message: error.message || "Failed to fetch leave profiles",
        success: false,
      };
      toast.error(errorData.message || "Failed to fetch leave profiles");
      return errorData;
    }
  },

  getLeaveProfileBySlug: async (slug) => {
    try {
      const result = await axios.get(`${baseURL}/api/v1/leave-profiles/get/${slug}`, {
        withCredentials: true,
      });
      return result.data;
    } catch (error) {
      console.error("Get leave profile by slug error:", error);
      const errorData = error.response?.data || {
        statusCode: 500,
        message: error.message || "Failed to fetch leave profile details",
        success: false,
      };
      toast.error(errorData.message || "Failed to fetch leave profile details");
      return errorData;
    }
  },

  updateLeaveProfile: async (slug, data) => {
    try {
      const result = await axios.put(`${baseURL}/api/v1/leave-profiles/update/${slug}`, data, {
        withCredentials: true,
      });
      return result.data;
    } catch (error) {
      console.error("Update leave profile error:", error);
      const errorData = error.response?.data || {
        statusCode: 500,
        message: error.message || "Failed to update leave profile",
        success: false,
      };
      toast.error(errorData.message || "Failed to update leave profile");
      return errorData;
    }
  },

  deleteLeaveProfile: async (slug) => {
    try {
      const result = await axios.delete(`${baseURL}/api/v1/leave-profiles/delete/${slug}`, {
        withCredentials: true,
      });
      return result.data;
    } catch (error) {
      console.error("Delete leave profile error:", error);
      const errorData = error.response?.data || {
        statusCode: 500,
        message: error.message || "Failed to delete leave profile",
        success: false,
      };
      toast.error(errorData.message || "Failed to delete leave profile");
      return errorData;
    }
  },
};
