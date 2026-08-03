import axios from "axios";
import { toast } from "react-toastify";

const baseURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export const attendanceRoute = {
    getAllEmployeeAttendance: async ({ page = 1, limit = 10, search = "", status = "" } = {}) => {
        try {
            const result = await axios.get(
                `${baseURL}/api/v1/attendance/all-employee-attendance`,
                {
                    withCredentials: true,
                    params: { page, limit, search, status },
                }
            );
            return result.data;
        } catch (error) {
            console.log("Get all employee attendance error:", error);
            const errorData = error.response?.data || {
                statusCode: 500,
                message: error.message || "Failed to get all employee attendance",
                success: false,
            };
            toast.error(errorData.message || "Failed to get all employee attendance");
            return errorData;
        }
    },

    clockIn: async ({ latitude, longitude, address, remarks } = {}) => {
        try {
            const result = await axios.post(
                `${baseURL}/api/v1/attendance/clock-in`,
                {
                    location: {
                        latitude,
                        longitude,
                        address,
                    },
                    latitude,
                    longitude,
                    address,
                    remarks,
                },
                {
                    withCredentials: true,
                }
            );
            return result.data;
        } catch (error) {
            console.log("Clock in error:", error);
            const errorData = error.response?.data || {
                statusCode: 500,
                message: error.message || "Failed to clock in",
                success: false,
            };
            toast.error(errorData.message || "Failed to clock in");
            return errorData;
        }
    },

    // Clock out - with location
    clockOut: async ({ latitude, longitude, address, remarks } = {}) => {
        try {
            const result = await axios.post(
                `${baseURL}/api/v1/attendance/clock-out`,
                {
                    location: {
                        latitude,
                        longitude,
                        address,
                    },
                    latitude,
                    longitude,
                    address,
                    remarks,
                },
                {
                    withCredentials: true,
                }
            );
            return result.data;
        } catch (error) {
            console.log("Clock out error:", error);
            const errorData = error.response?.data || {
                statusCode: 500,
                message: error.message || "Failed to clock out",
                success: false,
            };
            toast.error(errorData.message || "Failed to clock out");
            return errorData;
        }
    },

    // Create attendance (manual/admin)
    createAttendance: async ({ employee_id, date, clock_in, clock_out, remarks }) => {
        try {
            const result = await axios.post(
                `${baseURL}/api/v1/attendance/create`,
                {
                    employee_id,
                    date,
                    clock_in,
                    clock_out,
                    remarks,
                },
                {
                    withCredentials: true,
                }
            );
            return result.data;
        } catch (error) {
            console.log("Create attendance error:", error);
            const errorData = error.response?.data || {
                statusCode: 500,
                message: error.message || "Failed to create attendance",
                success: false,
            };
            toast.error(errorData.message || "Failed to create attendance");
            return errorData;
        }
    },

    // Get today's attendance status
    getTodayAttendance: async (employeeId = "") => {
        try {
            const result = await axios.get(
                `${baseURL}/api/v1/attendance/today/${employeeId}`,
                {
                    withCredentials: true,
                }
            );
            return result.data;
        } catch (error) {
            console.log("Get today's attendance error:", error);
            const errorData = error.response?.data || {
                statusCode: 500,
                message: error.message || "Failed to fetch today's attendance",
                success: false,
            };
            toast.error(errorData.message || "Failed to fetch today's attendance");
            return errorData;
        }
    },

    // Get attendance summary
    getAttendanceSummary: async ({
        employee_id,
        startDate,
        endDate,
    } = {}) => {
        try {
            const result = await axios.get(`${baseURL}/api/v1/attendance/summary`, {
                withCredentials: true,
                params: { employee_id, startDate, endDate },
            });
            return result.data;
        } catch (error) {
            console.log("Get summary error:", error);
            const errorData = error.response?.data || {
                statusCode: 500,
                message: error.message || "Failed to fetch attendance summary",
                success: false,
            };
            toast.error(errorData.message || "Failed to fetch attendance summary");
            return errorData;
        }
    },

    // Get all attendance records
    getAllAttendance: async ({
        page = 1,
        limit = 10,
        employee_id = "",
        status = "",
        startDate = "",
        endDate = "",
    } = {}) => {
        try {
            const result = await axios.get(`${baseURL}/api/v1/attendance/get-all`, {
                withCredentials: true,
                params: { page, limit, employee_id, status, startDate, endDate },
            });
            return result.data;
        } catch (error) {
            console.log("Get all attendance error:", error);
            const errorData = error.response?.data || {
                statusCode: 500,
                message: error.message || "Failed to fetch attendance records",
                success: false,
            };
            toast.error(errorData.message || "Failed to fetch attendance records");
            return errorData;
        }
    },

    // Get attendance by ID
    getAttendanceById: async (id) => {
        try {
            const result = await axios.get(`${baseURL}/api/v1/attendance/get/${id}`, {
                withCredentials: true,
            });
            return result.data;
        } catch (error) {
            console.log("Get attendance by ID error:", error);
            const errorData = error.response?.data || {
                statusCode: 500,
                message: error.message || "Failed to fetch attendance",
                success: false,
            };
            toast.error(errorData.message || "Failed to fetch attendance");
            return errorData;
        }
    },

    // Update attendance
    updateAttendance: async (id, data) => {
        try {
            const result = await axios.put(
                `${baseURL}/api/v1/attendance/update/${id}`,
                data,
                {
                    withCredentials: true,
                }
            );
            return result.data;
        } catch (error) {
            console.log("Update attendance error:", error);
            const errorData = error.response?.data || {
                statusCode: 500,
                message: error.message || "Failed to update attendance",
                success: false,
            };
            toast.error(errorData.message || "Failed to update attendance");
            return errorData;
        }
    },

    // Delete attendance
    deleteAttendance: async (id) => {
        try {
            const result = await axios.delete(
                `${baseURL}/api/v1/attendance/delete/${id}`,
                {
                    withCredentials: true,
                }
            );
            return result.data;
        } catch (error) {
            console.log("Delete attendance error:", error);
            const errorData = error.response?.data || {
                statusCode: 500,
                message: error.message || "Failed to delete attendance",
                success: false,
            };
            toast.error(errorData.message || "Failed to delete attendance");
            return errorData;
        }
    },
};