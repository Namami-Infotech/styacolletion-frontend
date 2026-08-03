import axios from "axios";
import { toast } from "react-toastify";

const baseURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export const leaveTypeRoute = {
  createLeaveType: async (data) => {
    try {
      const result = await axios.post(`${baseURL}/api/v1/leave-types/create`, data, {
        withCredentials: true,
      });
      return result.data;
    } catch (error) {
      console.error("Create leave type error:", error);
      const errorData = error.response?.data || {
        statusCode: 500,
        message: error.message || "Failed to create leave type",
        success: false,
      };
      toast.error(errorData.message || "Failed to create leave type");
      return errorData;
    }
  },

  getAllLeaveTypes: async ({ page, limit, search, status } = {}) => {
    try {
      const result = await axios.get(`${baseURL}/api/v1/leave-types/get-all`, {
        withCredentials: true,
        params: { page, limit, search, status },
      });
      return result.data;
    } catch (error) {
      console.error("Get all leave types error:", error);
      const errorData = error.response?.data || {
        statusCode: 500,
        message: error.message || "Failed to fetch leave types",
        success: false,
      };
      toast.error(errorData.message || "Failed to fetch leave types");
      return errorData;
    }
  },

  getLeaveTypeBySlug: async (slug) => {
    try {
      const result = await axios.get(`${baseURL}/api/v1/leave-types/get/${slug}`, {
        withCredentials: true,
      });
      return result.data;
    } catch (error) {
      console.error("Get leave type by slug error:", error);
      const errorData = error.response?.data || {
        statusCode: 500,
        message: error.message || "Failed to fetch leave type details",
        success: false,
      };
      toast.error(errorData.message || "Failed to fetch leave type details");
      return errorData;
    }
  },

  updateLeaveType: async (slug, data) => {
    try {
      const result = await axios.put(`${baseURL}/api/v1/leave-types/update/${slug}`, data, {
        withCredentials: true,
      });
      return result.data;
    } catch (error) {
      console.error("Update leave type error:", error);
      const errorData = error.response?.data || {
        statusCode: 500,
        message: error.message || "Failed to update leave type",
        success: false,
      };
      toast.error(errorData.message || "Failed to update leave type");
      return errorData;
    }
  },

  deleteLeaveType: async (slug) => {
    try {
      const result = await axios.delete(`${baseURL}/api/v1/leave-types/delete/${slug}`, {
        withCredentials: true,
      });
      return result.data;
    } catch (error) {
      console.error("Delete leave type error:", error);
      const errorData = error.response?.data || {
        statusCode: 500,
        message: error.message || "Failed to delete leave type",
        success: false,
      };
      toast.error(errorData.message || "Failed to delete leave type");
      return errorData;
    }
  },
};
