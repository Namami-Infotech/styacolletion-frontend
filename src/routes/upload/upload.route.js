import axios from "axios";
import { toast } from "react-toastify";

const baseURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export const UploadRoute = {
    /**
     * Uploads an image to the backend upload endpoint under a specific folder (e.g., 'employee', 'customer')
     * @param {string} base64Image - base64 image data
     * @param {string} [folder='general'] - target subfolder name
     */
    uploadImage: async (base64Image, folder = "general") => {
        try {
            const result = await axios.post(
                `${baseURL}/api/v1/upload/image`,
                { image: base64Image, folder },
                { withCredentials: true }
            );
            return result.data;
        } catch (error) {
            console.log(error);
            const errorData = error.response?.data || {
                statusCode: 500,
                message: error.message || "Failed to upload image",
                success: false,
            };
            toast.error(errorData.message || "Failed to upload image");
            return errorData;
        }
    },
};
