import axios from "axios";
import { toast } from "react-toastify";

const baseURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export const roleRoute = {
  getAllRoles: async ({ search = "", status = "" } = {}) => {
    try {
      const result = await axios.get(`${baseURL}/api/v1/roles/get-all`, {
        withCredentials: true,
        params: { search, status },
      });
      return result.data;
    } catch (error) {
      console.error("Get all roles error:", error);
      const errorData = error.response?.data || {
        statusCode: 500,
        message: error.message || "Failed to fetch roles",
        success: false,
      };
      toast.error(errorData.message || "Failed to fetch roles");
      return errorData;
    }
  },

  getRoleBySlug: async (slug) => {
    try {
      const result = await axios.get(`${baseURL}/api/v1/roles/get/${slug}`, {
        withCredentials: true,
      });
      return result.data;
    } catch (error) {
      console.error("Get role by slug error:", error);
      const errorData = error.response?.data || {
        statusCode: 500,
        message: error.message || "Failed to fetch role details",
        success: false,
      };
      toast.error(errorData.message || "Failed to fetch role details");
      return errorData;
    }
  },

  createRole: async (data) => {
    try {
      const result = await axios.post(`${baseURL}/api/v1/roles/create`, data, {
        withCredentials: true,
      });
      return result.data;
    } catch (error) {
      console.error("Create role error:", error);
      const errorData = error.response?.data || {
        statusCode: 500,
        message: error.message || "Failed to create role",
        success: false,
      };
      toast.error(errorData.message || "Failed to create role");
      return errorData;
    }
  },

  updateRole: async (slug, data) => {
    try {
      const result = await axios.put(`${baseURL}/api/v1/roles/update/${slug}`, data, {
        withCredentials: true,
      });
      return result.data;
    } catch (error) {
      console.error("Update role error:", error);
      const errorData = error.response?.data || {
        statusCode: 500,
        message: error.message || "Failed to update role",
        success: false,
      };
      toast.error(errorData.message || "Failed to update role");
      return errorData;
    }
  },

  deleteRole: async (slug) => {
    try {
      const result = await axios.delete(`${baseURL}/api/v1/roles/delete/${slug}`, {
        withCredentials: true,
      });
      return result.data;
    } catch (error) {
      console.error("Delete role error:", error);
      const errorData = error.response?.data || {
        statusCode: 500,
        message: error.message || "Failed to delete role",
        success: false,
      };
      toast.error(errorData.message || "Failed to delete role");
      return errorData;
    }
  },
};
