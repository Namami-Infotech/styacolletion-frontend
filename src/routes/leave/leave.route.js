import axios from "axios";
import { toast } from "react-toastify";

const baseURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export const leaveRoute = {
  applyLeave: async (data) => {
    try {
      const result = await axios.post(`${baseURL}/api/v1/leaves/apply`, data, {
        withCredentials: true,
      });
      return result.data;
    } catch (error) {
      console.error("Apply leave error:", error);
      const errorData = error.response?.data || {
        statusCode: 500,
        message: error.message || "Failed to apply leave",
        success: false,
      };
      toast.error(errorData.message || "Failed to apply leave");
      return errorData;
    }
  },

  getAllLeaves: async ({ page, limit, search, status, employeeId, leaveType, startDate, endDate } = {}) => {
    try {
      const result = await axios.get(`${baseURL}/api/v1/leaves/get-all`, {
        withCredentials: true,
        params: { page, limit, search, status, employeeId, leaveType, startDate, endDate },
      });
      return result.data;
    } catch (error) {
      console.error("Get all leaves error:", error);
      const errorData = error.response?.data || {
        statusCode: 500,
        message: error.message || "Failed to fetch leaves",
        success: false,
      };
      toast.error(errorData.message || "Failed to fetch leaves");
      return errorData;
    }
  },

  getLeaveById: async (id) => {
    try {
      const result = await axios.get(`${baseURL}/api/v1/leaves/get/${id}`, {
        withCredentials: true,
      });
      return result.data;
    } catch (error) {
      console.error("Get leave by ID error:", error);
      const errorData = error.response?.data || {
        statusCode: 500,
        message: error.message || "Failed to fetch leave details",
        success: false,
      };
      toast.error(errorData.message || "Failed to fetch leave details");
      return errorData;
    }
  },

  updateLeave: async (id, data) => {
    try {
      const result = await axios.put(`${baseURL}/api/v1/leaves/update/${id}`, data, {
        withCredentials: true,
      });
      return result.data;
    } catch (error) {
      console.error("Update leave error:", error);
      const errorData = error.response?.data || {
        statusCode: 500,
        message: error.message || "Failed to update leave",
        success: false,
      };
      toast.error(errorData.message || "Failed to update leave");
      return errorData;
    }
  },

  actionOnLeave: async (id, data) => {
    try {
      const result = await axios.patch(`${baseURL}/api/v1/leaves/action/${id}`, data, {
        withCredentials: true,
      });
      return result.data;
    } catch (error) {
      console.error("Action on leave error:", error);
      const errorData = error.response?.data || {
        statusCode: 500,
        message: error.message || "Failed to process action on leave",
        success: false,
      };
      toast.error(errorData.message || "Failed to process action on leave");
      return errorData;
    }
  },

  deleteLeave: async (id) => {
    try {
      const result = await axios.delete(`${baseURL}/api/v1/leaves/delete/${id}`, {
        withCredentials: true,
      });
      return result.data;
    } catch (error) {
      console.error("Delete leave error:", error);
      const errorData = error.response?.data || {
        statusCode: 500,
        message: error.message || "Failed to delete leave",
        success: false,
      };
      toast.error(errorData.message || "Failed to delete leave");
      return errorData;
    }
  },
};
