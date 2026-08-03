import axios from "axios";
import { toast } from "react-toastify";

const baseURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export const officeRoute = {
  getAllOffices: async ({ page = 1, limit = 10, search = "" } = {}) => {
    try {
      const result = await axios.get(`${baseURL}/api/v1/offices/get-all`, {
        withCredentials: true,
        params: { page, limit, search },
      });
      return result.data;
    } catch (error) {
      console.error("Get all offices error:", error);
      const errorData = error.response?.data || {
        statusCode: 500,
        message: error.message || "Failed to fetch offices",
        success: false,
      };
      toast.error(errorData.message || "Failed to fetch offices");
      return errorData;
    }
  },

  getOfficeBySlug: async (slug) => {
    try {
      const result = await axios.get(`${baseURL}/api/v1/offices/get/${slug}`, {
        withCredentials: true,
      });
      return result.data;
    } catch (error) {
      console.error("Get office by slug error:", error);
      const errorData = error.response?.data || {
        statusCode: 500,
        message: error.message || "Failed to fetch office details",
        success: false,
      };
      toast.error(errorData.message || "Failed to fetch office details");
      return errorData;
    }
  },

  createOffice: async (data) => {
    try {
      const result = await axios.post(`${baseURL}/api/v1/offices/create`, data, {
        withCredentials: true,
      });
      return result.data;
    } catch (error) {
      console.error("Create office error:", error);
      const errorData = error.response?.data || {
        statusCode: 500,
        message: error.message || "Failed to create office",
        success: false,
      };
      toast.error(errorData.message || "Failed to create office");
      return errorData;
    }
  },

  updateOffice: async (slug, data) => {
    try {
      const result = await axios.put(`${baseURL}/api/v1/offices/update/${slug}`, data, {
        withCredentials: true,
      });
      return result.data;
    } catch (error) {
      console.error("Update office error:", error);
      const errorData = error.response?.data || {
        statusCode: 500,
        message: error.message || "Failed to update office",
        success: false,
      };
      toast.error(errorData.message || "Failed to update office");
      return errorData;
    }
  },

  deleteOffice: async (slug) => {
    try {
      const result = await axios.delete(`${baseURL}/api/v1/offices/delete/${slug}`, {
        withCredentials: true,
      });
      return result.data;
    } catch (error) {
      console.error("Delete office error:", error);
      const errorData = error.response?.data || {
        statusCode: 500,
        message: error.message || "Failed to delete office",
        success: false,
      };
      toast.error(errorData.message || "Failed to delete office");
      return errorData;
    }
  },

  getStates: async () => {
    try {
      const result = await axios.get(`${baseURL}/api/v1/states/get-all`, {
        withCredentials: true,
      });
      return result.data;
    } catch (error) {
      console.error("Get states error:", error);
      return { success: false, data: [] };
    }
  },

  getRegions: async () => {
    try {
      const result = await axios.get(`${baseURL}/api/v1/regions/get-all`, {
        withCredentials: true,
      });
      return result.data;
    } catch (error) {
      console.error("Get regions error:", error);
      return { success: false, data: [] };
    }
  },

  getBranches: async () => {
    try {
      const result = await axios.get(`${baseURL}/api/v1/branches/get-all`, {
        withCredentials: true,
      });
      return result.data;
    } catch (error) {
      console.error("Get branches error:", error);
      return { success: false, data: [] };
    }
  },
};
