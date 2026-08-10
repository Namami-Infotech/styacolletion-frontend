import axios from "axios";
import { toast } from "react-toastify";

const baseURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export const TaskRoute = {
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
    createTask: async (data) => {
        try {
            const result = await axios.post(`${baseURL}/api/v1/tasks/create`, data, {
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
    getAllTasks: async ({ page, limit, search, status, priority, taskType }) => {
        try {
            const result = await axios.get(`${baseURL}/api/v1/tasks/get-all`, {
                withCredentials: true,
                params: {
                    page,
                    limit,
                    search,
                    status,
                    priority,
                    taskType,
                },
            });
            return result.data;
        } catch (error) {
            console.log(error);
            const errorData = error.response?.data || {
                statusCode: 500,
                message: error.message || "Failed to fetch tasks",
                success: false,
            };
            toast.error(errorData.message || "Failed to fetch tasks");
            return errorData;
        }
    },
    employeeTask: async ({ page, limit, employeeId }) => {
        console.log(employeeId, "employeeIdemployeeIdemployeeId")
        try {
            const result = await axios.get(`${baseURL}/api/v1/tasks/employee/task`, {
                withCredentials: true,
                params: {
                    page,
                    limit,
                    employeeId
                },
            });
            return result.data;
        } catch (error) {
            console.log(error);
            const errorData = error.response?.data || {
                statusCode: 500,
                message: error.message || "Failed to fetch tasks",
                success: false,
            };
            toast.error(errorData.message || "Failed to fetch tasks");
            return errorData;
        }
    },
    getAllCustomerTasks: async ({ page, limit, search, status, priority, taskType }) => {
        try {
            const result = await axios.get(`${baseURL}/api/v1/tasks/customer/task`, {
                withCredentials: true,
                params: {
                    page,
                    limit,
                    search,
                    status,
                    priority,
                    taskType,
                },
            });
            return result.data;
        } catch (error) {
            console.log(error);
            const errorData = error.response?.data || {
                statusCode: 500,
                message: error.message || "Failed to fetch tasks",
                success: false,
            };
            toast.error(errorData.message || "Failed to fetch tasks");
            return errorData;
        }
    },
    updateTask: async (taskId, data) => {
        try {
            const result = await axios.put(`${baseURL}/api/v1/tasks/update/${taskId}`, data, {
                withCredentials: true,
            });
            return result.data;
        } catch (error) {
            console.log(error);
            const errorData = error.response?.data || {
                statusCode: 500,
                message: error.message || "Failed to update task",
                success: false,
            };
            toast.error(errorData.message || "Failed to update task");
            return errorData;
        }
    },
    deleteTask: async (slug) => {
        try {
            const result = await axios.delete(`${baseURL}/api/v1/tasks/delete/${slug}`, {
                withCredentials: true,
            });
            return result.data;
        } catch (error) {
            console.log(error);
            const errorData = error.response?.data || {
                statusCode: 500,
                message: error.message || "Failed to delete task",
                success: false,
            };
            toast.error(errorData.message || "Failed to delete task");
            return errorData;
        }
    },
    getDeletedTask: async (params = {}) => {
        try {
            const result = await axios.get(`${baseURL}/api/v1/tasks/get-deleted`, {
                params,
                withCredentials: true,
            });
            return result.data;
        } catch (error) {
            console.log(error);
            const errorData = error.response?.data || {
                statusCode: 500,
                message: error.message || "Failed to fetch deleted tasks",
                success: false,
            };
            toast.error(errorData.message || "Failed to fetch deleted tasks");
            return errorData;
        }
    },
    restoreTask: async (slug) => {
        try {
            const result = await axios.put(`${baseURL}/api/v1/tasks/restore/${slug}`, {}, {
                withCredentials: true,
            });
            return result.data;
        } catch (error) {
            console.log(error);
            const errorData = error.response?.data || {
                statusCode: 500,
                message: error.message || "Failed to restore task",
                success: false,
            };
            toast.error(errorData.message || "Failed to restore task");
            return errorData;
        }
    },
    getTaskBySlug: async (slugOrId) => {
        try {
            const result = await axios.get(`${baseURL}/api/v1/tasks/get/${slugOrId}`, {
                withCredentials: true,
            });
            return result.data;
        } catch (error) {
            console.log(error);
            const errorData = error.response?.data || {
                statusCode: 500,
                message: error.message || "Failed to fetch task details",
                success: false,
            };
            toast.error(errorData.message || "Failed to fetch task details");
            return errorData;
        }
    },
    completebehalf: async () => {
        try {
            const result = await axios.get(`${baseURL}/api/v1/complete-behalf/fields`, {
                withCredentials: true,
            });
            return result.data;
        } catch (error) {
            console.log(error);
            const errorData = error.response?.data || {
                statusCode: 500,
                message: error.message || "Failed to fetch task details",
                success: false,
            };
            toast.error(errorData.message || "Failed to fetch task details");
            return errorData;
        }
    },
    completeTask: async (taskId, formData) => {
        try {
            const result = await axios.post(
                `${baseURL}/api/v1/complete-behalf/complete`,
                { taskId, ...formData },
                { withCredentials: true }
            );
            return result.data;
        } catch (error) {
            console.log(error);
            const errorData = error.response?.data || {
                statusCode: 500,
                message: error.message || "Failed to complete task",
                success: false,
            };
            toast.error(errorData.message || "Failed to complete task");
            return errorData;
        }
    },
    getTeamTask: async ({ page, limit } = {}) => {
        try {
            const result = await axios.get(`${baseURL}/api/v1/tasks/team/task`, {
                withCredentials: true,
                params: {
                    page,
                    limit,
                },
            });
            return result.data;
        } catch (error) {
            console.log(error);
            const errorData = error.response?.data || {
                statusCode: 500,
                message: error.message || "Failed to fetch tasks",
                success: false,
            };
            toast.error(errorData.message || "Failed to fetch tasks");
            return errorData;
        }
    },
    uploadExcelTasks: async (formData) => {
        try {
            const result = await axios.post(`${baseURL}/api/v1/tasks/upload-excel-task`, formData, {
                withCredentials: true,
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return result.data;
        } catch (error) {
            console.log(error);
            const errorData = error.response?.data || {
                statusCode: 500,
                message: error.message || "Failed to upload excel tasks",
                success: false,
            };
            toast.error(errorData.message || "Failed to upload excel tasks");
            return errorData;
        }
    }
};
