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
