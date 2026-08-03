import axios from "axios";
import { toast } from "react-toastify";

const baseURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export const holidaysRoute = {
  createHoliday: async (data) => {
    try {
      const result = await axios.post(`${baseURL}/api/v1/holidays/create`, data, {
        withCredentials: true,
      });
      return result.data;
    } catch (error) {
      console.error("Create holiday error:", error);
      const errorData = error.response?.data || {
        statusCode: 500,
        message: error.message || "Failed to create holiday",
        success: false,
      };
      toast.error(errorData.message || "Failed to create holiday");
      return errorData;
    }
  },

  getAllHolidays: async ({ page, limit, search, status, year } = {}) => {
    try {
      const result = await axios.get(`${baseURL}/api/v1/holidays/get-all`, {
        withCredentials: true,
        params: { page, limit, search, status, year },
      });
      return result.data;
    } catch (error) {
      console.error("Get all holidays error:", error);
      const errorData = error.response?.data || {
        statusCode: 500,
        message: error.message || "Failed to fetch holidays",
        success: false,
      };
      toast.error(errorData.message || "Failed to fetch holidays");
      return errorData;
    }
  },

  getHolidayBySlug: async (slug) => {
    try {
      const result = await axios.get(`${baseURL}/api/v1/holidays/get/${slug}`, {
        withCredentials: true,
      });
      return result.data;
    } catch (error) {
      console.error("Get holiday by slug error:", error);
      const errorData = error.response?.data || {
        statusCode: 500,
        message: error.message || "Failed to fetch holiday details",
        success: false,
      };
      toast.error(errorData.message || "Failed to fetch holiday details");
      return errorData;
    }
  },

  updateHoliday: async (slug, data) => {
    try {
      const result = await axios.put(`${baseURL}/api/v1/holidays/update/${slug}`, data, {
        withCredentials: true,
      });
      return result.data;
    } catch (error) {
      console.error("Update holiday error:", error);
      const errorData = error.response?.data || {
        statusCode: 500,
        message: error.message || "Failed to update holiday",
        success: false,
      };
      toast.error(errorData.message || "Failed to update holiday");
      return errorData;
    }
  },

  deleteHoliday: async (slug) => {
    try {
      const result = await axios.delete(`${baseURL}/api/v1/holidays/delete/${slug}`, {
        withCredentials: true,
      });
      return result.data;
    } catch (error) {
      console.error("Delete holiday error:", error);
      const errorData = error.response?.data || {
        statusCode: 500,
        message: error.message || "Failed to delete holiday",
        success: false,
      };
      toast.error(errorData.message || "Failed to delete holiday");
      return errorData;
    }
  },
};
