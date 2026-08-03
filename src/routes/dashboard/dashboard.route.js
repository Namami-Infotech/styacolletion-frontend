import axios from "axios";
import { toast } from "react-toastify";

const baseURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export const DashboardRoute = {
  getStats: async (params = {}) => {
    try {
      const result = await axios.get(`${baseURL}/api/v1/dashboard/stats`, {
        params,
        withCredentials: true,
      });
      return result.data;
    } catch (error) {
      console.error("Dashboard stats error:", error);
      const errorData = error.response?.data || {
        statusCode: 500,
        message: error.message || "Failed to fetch dashboard statistics",
        success: false,
      };
      return errorData;
    }
  },
};
