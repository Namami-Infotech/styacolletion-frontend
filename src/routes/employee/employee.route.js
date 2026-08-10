import axios from "axios";
import { toast } from "react-toastify";

const baseURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export const EmployeeRoute = {
    getCreateTaskFormFields: async () => {
        try {
            const result = await axios.get(`${baseURL}/api/v1/tasks/create-form`, {
                withCredentials: true,
            });
            return result.data;
        } catch (error) {
            console.log(error);
            const errorData = error.response?.data || {
                statusCode: 500,
                message: error.message || "Failed to fetch task form fields",
                success: false,
            };
            toast.error(errorData.message || "Failed to fetch task form fields");
            return errorData;
        }
    },

    getCreateEmployeeFormFields: async () => {
        try {
            const result = await axios.get(`${baseURL}/api/v1/employees/create-form`, {
                withCredentials: true,
            });
            return result.data;
        } catch (error) {
            console.log(error);
            const errorData = error.response?.data || {
                statusCode: 500,
                message: error.message || "Failed to fetch employee form fields",
                success: false,
            };
            return errorData;
        }
    },

    createTask: async (data) => {
        try {
            const result = await axios.post(`${baseURL}/api/v1/tasks`, data, {
                withCredentials: true,
            });
            return result.data;
        } catch (error) {
            console.log(error);
            const errorData = error.response?.data || {
                statusCode: 500,
                message: error.message || "Failed to create task",
                success: false,
            };
            toast.error(errorData.message || "Failed to create task");
            return errorData;
        }
    },
    getAllEmployee: async ({ page, limit, search, status, department }) => {
        try {
            const result = await axios.get(`${baseURL}/api/v1/employees/get-all`, {
                withCredentials: true,
                params: {
                    page,
                    limit,
                    search,
                    status,
                    department,
                    _t: Date.now(),
                },
            });
            return result.data;
        } catch (error) {
            console.log(error);
            const errorData = error.response?.data || {
                statusCode: 500,
                message: error.message || "Failed to fetch employees",
                success: false,
            };
            toast.error(errorData.message || "Failed to fetch employees");
            return errorData;
        }
    },

    getEmployeeBySlug: async (slug) => {
        try {
            const result = await axios.get(`${baseURL}/api/v1/employees/get/${slug}`, {
                withCredentials: true,
            });
            return result.data;
        } catch (error) {
            console.log(error);
            const errorData = error.response?.data || {
                statusCode: 500,
                message: error.message || "Failed to fetch employee details",
                success: false,
            };
            return errorData;
        }
    },

    updateEmployee: async (data) => {
        try {
            const slug = data.slug || data.id;
            const result = await axios.put(`${baseURL}/api/v1/employees/update/${slug}`, data, {
                withCredentials: true,
            });
            toast.success(result.data.message || "Employee updated successfully");
            return result.data;
        } catch (error) {
            console.log(error);
            const errorData = error.response?.data || {
                statusCode: 500,
                message: error.message || "Failed to update employee",
                success: false,
            };
            toast.error(errorData.message || "Failed to update employee");
            return errorData;
        }
    },

    deleteEmployee: async (slug) => {
        try {
            const result = await axios.delete(`${baseURL}/api/v1/employees/delete/${slug}`, {
                withCredentials: true,
            });
            toast.success(result.data.message || "Employee deleted successfully");
            return result.data;
        } catch (error) {
            console.log(error);
            const errorData = error.response?.data || {
                statusCode: 500,
                message: error.message || "Failed to delete employee",
                success: false,
            };
            toast.error(errorData.message || "Failed to delete employee");
            return errorData;
        }
    },

    getEmployeeContactWithCustomer: async ({ page, limit, search, status, department }) => {
        try {
            const result = await axios.get(`${baseURL}/api/v1/employees/contact-with-customer`, {
                withCredentials: true,
                params: {
                    page,
                    limit,
                    search,
                    status,
                    department,
                    _t: Date.now(),
                },
            });
            return result.data;
        } catch (error) {
            console.log(error);
            const errorData = error.response?.data || {
                statusCode: 500,
                message: error.message || "Failed to fetch employees",
                success: false,
            };
            toast.error(errorData.message || "Failed to fetch employees");
            return errorData;
        }
    },
    getMyTeam: async () => {
        try {
            const result = await axios.get(`${baseURL}/api/v1/employees/my-team`, {
                withCredentials: true,
                params: {
                    _t: Date.now(),
                },
            });
            return result.data;
        } catch (error) {
            console.log(error);
            const errorData = error.response?.data || {
                statusCode: 500,
                message: error.message || "Failed to fetch team hierarchy",
                success: false,
            };
            toast.error(errorData.message || "Failed to fetch team hierarchy");
            return errorData;
        }
    },
    createEmployee: async (data) => {
        try {
            const result = await axios.post(`${baseURL}/api/v1/employees/create`, data, {
                withCredentials: true,
            });
            toast.success("Employee created successfully!");
            return result.data;
        } catch (error) {
            console.log(error);
            const errorData = error.response?.data || {
                statusCode: 500,
                message: error.message || "Failed to create employee",
                success: false,
            };
            toast.error(errorData.message || "Failed to create employee");
            return errorData;
        }
    },
};
