import axios from "axios";
import { toast } from "react-toastify";

const baseURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export const loanNumberRoute = {
  getAllLoanNumbers: async ({ page = 1, limit = 10, search = "", status = "" } = {}) => {
    try {
      const result = await axios.get(`${baseURL}/api/v1/loan-numbers/get-all`, {
        withCredentials: true,
        params: { page, limit, search, status },
      });
      return result.data;
    } catch (error) {
      console.error("Get all loan numbers error:", error);
      const errorData = error.response?.data || {
        statusCode: 500,
        message: error.message || "Failed to fetch loan numbers",
        success: false,
      };
      toast.error(errorData.message || "Failed to fetch loan numbers");
      return errorData;
    }
  },

  getLoanNumberBySlug: async (slug) => {
    try {
      const result = await axios.get(`${baseURL}/api/v1/loan-numbers/get/${slug}`, {
        withCredentials: true,
      });
      return result.data;
    } catch (error) {
      console.error("Get loan number by slug error:", error);
      const errorData = error.response?.data || {
        statusCode: 500,
        message: error.message || "Failed to fetch loan number details",
        success: false,
      };
      toast.error(errorData.message || "Failed to fetch loan number details");
      return errorData;
    }
  },

  createLoanNumber: async (data) => {
    try {
      const result = await axios.post(`${baseURL}/api/v1/loan-numbers/create`, data, {
        withCredentials: true,
      });
      return result.data;
    } catch (error) {
      console.error("Create loan number error:", error);
      const errorData = error.response?.data || {
        statusCode: 500,
        message: error.message || "Failed to create loan number",
        success: false,
      };
      toast.error(errorData.message || "Failed to create loan number");
      return errorData;
    }
  },

  uploadExcelLoanNumbers: async (formData) => {
    try {
      const result = await axios.post(`${baseURL}/api/v1/loan-numbers/upload-excel`, formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return result.data;
    } catch (error) {
      console.error("Upload excel loan numbers error:", error);
      const errorData = error.response?.data || {
        statusCode: 500,
        message: error.message || "Failed to import excel loan numbers",
        success: false,
      };
      toast.error(errorData.message || "Failed to import excel loan numbers");
      return errorData;
    }
  },

  updateLoanNumber: async (slug, data) => {
    try {
      const result = await axios.put(`${baseURL}/api/v1/loan-numbers/update/${slug}`, data, {
        withCredentials: true,
      });
      return result.data;
    } catch (error) {
      console.error("Update loan number error:", error);
      const errorData = error.response?.data || {
        statusCode: 500,
        message: error.message || "Failed to update loan number",
        success: false,
      };
      toast.error(errorData.message || "Failed to update loan number");
      return errorData;
    }
  },

  deleteLoanNumber: async (slug) => {
    try {
      const result = await axios.delete(`${baseURL}/api/v1/loan-numbers/delete/${slug}`, {
        withCredentials: true,
      });
      return result.data;
    } catch (error) {
      console.error("Delete loan number error:", error);
      const errorData = error.response?.data || {
        statusCode: 500,
        message: error.message || "Failed to delete loan number",
        success: false,
      };
      toast.error(errorData.message || "Failed to delete loan number");
      return errorData;
    }
  },
};
