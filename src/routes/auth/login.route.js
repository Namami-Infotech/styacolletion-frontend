import axios from "axios";
import { toast } from "react-toastify";

const baseURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export const EmployeeRoute = {
  login: async (data) => {
    try {
      const result = await axios.post(`${baseURL}/api/v1/employees/login`, data, {
        withCredentials: true,
      });
      return result.data;
    } catch (error) {
      console.log(error);
      const errorData = error.response?.data || {
        statusCode: 500,
        message: error.message || "Login failed",
        success: false,
      };
      toast.error(errorData.message || "Login failed");
      return errorData;
    }
  },
  logout: async () => {
    try {
      const result = await axios.post(`${baseURL}/api/v1/employees/logout`, {}, {
        withCredentials: true,
      });
      return result.data;
    } catch (error) {
      console.log(error);
      const errorData = error.response?.data || {
        statusCode: 500,
        message: error.message || "Logout failed",
        success: false,
      };
      // toast.error(errorData.message || "Logout failed");
      return errorData;
    }
  },
  getPermissions: async () => {
    try {
      const result = await axios.get(`${baseURL}/api/v1/employees/get-permission`, {
        withCredentials: true,
      });
      return result.data;
    } catch (error) {
      console.log(error);
      const errorData = error.response?.data || {
        statusCode: 500,
        message: error.message || "Failed to fetch permissions",
        success: false,
      };
      return errorData;
    }
  },
  refreshToken: async () => {
    try {
      const result = await axios.post(`${baseURL}/api/v1/employees/refresh-token`, {}, {
        withCredentials: true,
      });
      return result.data;
    } catch (error) {
      console.log(error);
      const errorData = error.response?.data || {
        statusCode: 500,
        message: error.message || "Failed to refresh token",
        success: false,
      };
      return errorData;
    }
  }
};
