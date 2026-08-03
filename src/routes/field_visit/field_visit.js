import axios from "axios";
import { toast } from "react-toastify";

const baseURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export const FieldVisitRoute = {
    getfieldVisitByDate: async ({ date, id }) => {
        try {
            const result = await axios.get(`${baseURL}/api/v1/field-visits/get-by-date`, {
                withCredentials: true,
                params: {
                    date,
                    id
                },
            });
            console.log(result.data);
            return result.data;
        } catch (error) {
            console.log(error);
            const errorData = error.response?.data || {
                statusCode: 500,
                message: error.message || "Failed to fetch field visits",
                success: false,
            };
            toast.error(errorData.message || "Failed to fetch field visits");
            return errorData;
        }
    },
};

export const TaskTypeRoute = FieldVisitRoute;
