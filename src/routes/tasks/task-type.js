import axios from "axios";
import { toast } from "react-toastify";

const baseURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export const TaskTypeRoute = {
    getAllTaskTypes: async ({ page, limit, search } = {}) => {
        try {
            const result = await axios.get(`${baseURL}/api/v1/task-types/get-all`, {
                withCredentials: true,
                params: {
                    page,
                    limit,
                    search
                },
            });
            return result.data;
        } catch (error) {
            console.error(error);
            const errorData = error.response?.data || {
                statusCode: 500,
                message: error.message || "Failed to fetch task types",
                success: false,
            };
            toast.error(errorData.message || "Failed to fetch task types");
            return errorData;
        }
    },

    createTaskType: async (data) => {
        try {
            const result = await axios.post(`${baseURL}/api/v1/task-types/create`, data, {
                withCredentials: true,
            });
            return result.data;
        } catch (error) {
            console.error(error);
            const errorData = error.response?.data || {
                statusCode: 500,
                message: error.message || "Failed to create task type",
                success: false,
            };
            toast.error(errorData.message || "Failed to create task type");
            return errorData;
        }
    },

    getTaskTypeBySlug: async (slug) => {
        try {
            const result = await axios.get(`${baseURL}/api/v1/task-types/get/${slug}`, {
                withCredentials: true,
            });
            return result.data;
        } catch (error) {
            console.error(error);
            const errorData = error.response?.data || {
                statusCode: 500,
                message: error.message || "Failed to fetch task type details",
                success: false,
            };
            toast.error(errorData.message || "Failed to fetch task type details");
            return errorData;
        }
    },

    updateTaskType: async (slug, data) => {
        try {
            const result = await axios.put(`${baseURL}/api/v1/task-types/update/${slug}`, data, {
                withCredentials: true,
            });
            return result.data;
        } catch (error) {
            console.error(error);
            const errorData = error.response?.data || {
                statusCode: 500,
                message: error.message || "Failed to update task type",
                success: false,
            };
            toast.error(errorData.message || "Failed to update task type");
            return errorData;
        }
    },

    deleteTaskType: async (slug) => {
        try {
            const result = await axios.delete(`${baseURL}/api/v1/task-types/delete/${slug}`, {
                withCredentials: true,
            });
            return result.data;
        } catch (error) {
            console.error(error);
            const errorData = error.response?.data || {
                statusCode: 500,
                message: error.message || "Failed to delete task type",
                success: false,
            };
            toast.error(errorData.message || "Failed to delete task type");
            return errorData;
        }
    },
};
