import axios from "axios";
import { toast } from "react-toastify";

const baseURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export const CustomerRoute = {
  getCustomerField: async () => {
    try {
      const result = await axios.get(`${baseURL}/api/v1/customers/options`, {
        withCredentials: true,
      });
      return result.data;
    } catch (error) {
      console.log(error);
      const errorData = error.response?.data || {
        statusCode: 500,
        message: error.message || "Failed to fetch customers",
        success: false,
      };
      toast.error(errorData.message || "Failed to fetch customers");
      return errorData;
    }
  },
  getCustomers: async ({search= '', page = 1, limit = 10, status = 'All'} = {}) => {
    try {
      const result = await axios.get(`${baseURL}/api/v1/customers/get-all`, {
        withCredentials: true,
        params: {search, page, limit, status},
      });
      return result.data;
    } catch (error) {
      console.log(error);
      const errorData = error.response?.data || {
        statusCode: 500,
        message: error.message || "Failed to fetch customers",
        success: false,
      };
      toast.error(errorData.message || "Failed to fetch customers");
      return errorData;
    }
  },
  updateCustomer: async (slug, data) => {
    try {
      const result = await axios.put(`${baseURL}/api/v1/customers/update/${slug}`, data, {
        withCredentials: true,
      });
      return result.data;
    } catch (error) {
      console.log(error);
      const errorData = error.response?.data || {
        statusCode: 500,
        message: error.message || "Failed to update customer",
        success: false,
      };
      toast.error(errorData.message || "Failed to update customer");
      return errorData;
    }
  },
  deleteCustomer:async(slug)=>{
    try {
      const result = await axios.delete(`${baseURL}/api/v1/customers/delete/${slug}`, {
        withCredentials: true,
      });
      return result.data;
    } catch (error) {
      console.log(error);
      const errorData = error.response?.data || {
        statusCode: 500,
        message: error.message || "Failed to delete customer",
        success: false,
      };
      toast.error(errorData.message || "Failed to delete customer");
      return errorData;
    }
  },
  createCustomer: async (data) => {
    try {
      const result = await axios.post(`${baseURL}/api/v1/customers/create`, data, {
        withCredentials: true,
      });
      return result.data;
    } catch (error) {
      console.log(error);
      const errorData = error.response?.data || {
        statusCode: 500,
        message: error.message || "Failed to create customer",
        success: false,
      };
      toast.error(errorData.message || "Failed to create customer");
      return errorData;
    }
  },
};
