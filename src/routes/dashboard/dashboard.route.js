import axios from "axios";

const baseURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const DashboardRoute = {
  getStats: async (params = {}) => {
    try {
      const result = await axios.get(`${baseURL}/api/v1/dashboard/stats`, {
        params,
        headers: getAuthHeaders(),
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

  getHomeStats: async (params = {}) => {
    try {
      const result = await axios.get(`${baseURL}/api/v1/dashboard/home-stats`, {
        params,
        headers: getAuthHeaders(),
        withCredentials: true,
      });
      return result.data;
    } catch (error) {
      console.error("Home dashboard stats error:", error);
      const errorData = error.response?.data || {
        statusCode: 500,
        message: error.message || "Failed to fetch home dashboard statistics",
        success: false,
      };
      return errorData;
    }
  },

  getAttendance: async (params = {}) => {
    try {
      const result = await axios.get(`${baseURL}/api/v1/dashboard/attendance`, {
        params,
        headers: getAuthHeaders(),
        withCredentials: true,
      });
      return result.data;
    } catch (error) {
      console.error("Dashboard attendance error:", error);
      const errorData = error.response?.data || {
        statusCode: 500,
        message: error.message || "Failed to fetch dashboard attendance",
        success: false,
      };
      return errorData;
    }
  },
};
