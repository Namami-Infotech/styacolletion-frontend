import axios from "axios";
import { toast } from "react-toastify";

const baseURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export const nonWorkingDaysRoute = {
  createNonWorkingDay: async (data) => {
    try {
      const result = await axios.post(`${baseURL}/api/v1/non-working-days/create`, data, {
        withCredentials: true,
      });
      return result.data;
    } catch (error) {
      console.error("Create non-working day error:", error);
      const errorData = error.response?.data || {
        statusCode: 500,
        message: error.message || "Failed to create non-working day",
        success: false,
      };
      toast.error(errorData.message || "Failed to create non-working day");
      return errorData;
    }
  },

  getAllNonWorkingDays: async ({ page, limit, search, status } = {}) => {
    try {
      const result = await axios.get(`${baseURL}/api/v1/non-working-days/get-all`, {
        withCredentials: true,
        params: { page, limit, search, status },
      });
      return result.data;
    } catch (error) {
      console.error("Get all non-working days error:", error);
      const errorData = error.response?.data || {
        statusCode: 500,
        message: error.message || "Failed to fetch non-working days",
        success: false,
      };
      toast.error(errorData.message || "Failed to fetch non-working days");
      return errorData;
    }
  },

  getNonWorkingDayById: async (id) => {
    try {
      const result = await axios.get(`${baseURL}/api/v1/non-working-days/get/${id}`, {
        withCredentials: true,
      });
      return result.data;
    } catch (error) {
      console.error("Get non-working day by ID error:", error);
      const errorData = error.response?.data || {
        statusCode: 500,
        message: error.message || "Failed to fetch non-working day details",
        success: false,
      };
      toast.error(errorData.message || "Failed to fetch non-working day details");
      return errorData;
    }
  },

  updateNonWorkingDay: async (id, data) => {
    try {
      const result = await axios.put(`${baseURL}/api/v1/non-working-days/update/${id}`, data, {
        withCredentials: true,
      });
      return result.data;
    } catch (error) {
      console.error("Update non-working day error:", error);
      const errorData = error.response?.data || {
        statusCode: 500,
        message: error.message || "Failed to update non-working day",
        success: false,
      };
      toast.error(errorData.message || "Failed to update non-working day");
      return errorData;
    }
  },

  deleteNonWorkingDay: async (id) => {
    try {
      const result = await axios.delete(`${baseURL}/api/v1/non-working-days/delete/${id}`, {
        withCredentials: true,
      });
      return result.data;
    } catch (error) {
      console.error("Delete non-working day error:", error);
      const errorData = error.response?.data || {
        statusCode: 500,
        message: error.message || "Failed to delete non-working day",
        success: false,
      };
      toast.error(errorData.message || "Failed to delete non-working day");
      return errorData;
    }
  },
};

export const nonWorkingDayRoute = nonWorkingDaysRoute;
