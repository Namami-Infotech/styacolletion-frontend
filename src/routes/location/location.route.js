import axios from "axios";
import { toast } from "react-toastify";

const baseURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export const locationRoute = {
  // State API Handlers
  getAllStates: async ({ page = 1, limit = 10, search = "", status = "" } = {}) => {
    try {
      const result = await axios.get(`${baseURL}/api/v1/states/get-all`, {
        withCredentials: true,
        params: { page, limit, search, status },
      });
      return result.data;
    } catch (error) {
      console.error("Get all states error:", error);
      const errorData = error.response?.data || {
        statusCode: 500,
        message: error.message || "Failed to fetch states",
        success: false,
      };
      toast.error(errorData.message || "Failed to fetch states");
      return errorData;
    }
  },

  getStateBySlug: async (slug) => {
    try {
      const result = await axios.get(`${baseURL}/api/v1/states/get/${slug}`, {
        withCredentials: true,
      });
      return result.data;
    } catch (error) {
      console.error("Get state by slug error:", error);
      const errorData = error.response?.data || {
        statusCode: 500,
        message: error.message || "Failed to fetch state details",
        success: false,
      };
      toast.error(errorData.message || "Failed to fetch state details");
      return errorData;
    }
  },

  createState: async (data) => {
    try {
      const result = await axios.post(`${baseURL}/api/v1/states/create`, data, {
        withCredentials: true,
      });
      return result.data;
    } catch (error) {
      console.error("Create state error:", error);
      const errorData = error.response?.data || {
        statusCode: 500,
        message: error.message || "Failed to create state",
        success: false,
      };
      toast.error(errorData.message || "Failed to create state");
      return errorData;
    }
  },

  updateState: async (slug, data) => {
    try {
      const result = await axios.put(`${baseURL}/api/v1/states/update/${slug}`, data, {
        withCredentials: true,
      });
      return result.data;
    } catch (error) {
      console.error("Update state error:", error);
      const errorData = error.response?.data || {
        statusCode: 500,
        message: error.message || "Failed to update state",
        success: false,
      };
      toast.error(errorData.message || "Failed to update state");
      return errorData;
    }
  },

  deleteState: async (slug) => {
    try {
      const result = await axios.delete(`${baseURL}/api/v1/states/delete/${slug}`, {
        withCredentials: true,
      });
      return result.data;
    } catch (error) {
      console.error("Delete state error:", error);
      const errorData = error.response?.data || {
        statusCode: 500,
        message: error.message || "Failed to delete state",
        success: false,
      };
      toast.error(errorData.message || "Failed to delete state");
      return errorData;
    }
  },

  // Region API Handlers
  getAllRegions: async ({ page = 1, limit = 10, search = "", status = "", state_id = "" } = {}) => {
    try {
      const result = await axios.get(`${baseURL}/api/v1/regions/get-all`, {
        withCredentials: true,
        params: { page, limit, search, status, state_id },
      });
      return result.data;
    } catch (error) {
      console.error("Get all regions error:", error);
      const errorData = error.response?.data || {
        statusCode: 500,
        message: error.message || "Failed to fetch regions",
        success: false,
      };
      toast.error(errorData.message || "Failed to fetch regions");
      return errorData;
    }
  },

  getRegionBySlug: async (slug) => {
    try {
      const result = await axios.get(`${baseURL}/api/v1/regions/get/${slug}`, {
        withCredentials: true,
      });
      return result.data;
    } catch (error) {
      console.error("Get region by slug error:", error);
      const errorData = error.response?.data || {
        statusCode: 500,
        message: error.message || "Failed to fetch region details",
        success: false,
      };
      toast.error(errorData.message || "Failed to fetch region details");
      return errorData;
    }
  },

  getRegionByStateId: async (stateId, { page = 1, limit = 100 } = {}) => {
    try {
      const result = await axios.get(`${baseURL}/api/v1/regions/get-by-state-id/${stateId}`, {
        withCredentials: true,
        params: { page, limit },
      });
      return result.data;
    } catch (error) {
      console.error("Get regions by state ID error:", error);
      return { success: false, data: [] };
    }
  },

  createRegion: async (data) => {
    try {
      const result = await axios.post(`${baseURL}/api/v1/regions/create`, data, {
        withCredentials: true,
      });
      return result.data;
    } catch (error) {
      console.error("Create region error:", error);
      const errorData = error.response?.data || {
        statusCode: 500,
        message: error.message || "Failed to create region",
        success: false,
      };
      toast.error(errorData.message || "Failed to create region");
      return errorData;
    }
  },

  updateRegion: async (slug, data) => {
    try {
      const result = await axios.put(`${baseURL}/api/v1/regions/update/${slug}`, data, {
        withCredentials: true,
      });
      return result.data;
    } catch (error) {
      console.error("Update region error:", error);
      const errorData = error.response?.data || {
        statusCode: 500,
        message: error.message || "Failed to update region",
        success: false,
      };
      toast.error(errorData.message || "Failed to update region");
      return errorData;
    }
  },

  deleteRegion: async (slug) => {
    try {
      const result = await axios.delete(`${baseURL}/api/v1/regions/delete/${slug}`, {
        withCredentials: true,
      });
      return result.data;
    } catch (error) {
      console.error("Delete region error:", error);
      const errorData = error.response?.data || {
        statusCode: 500,
        message: error.message || "Failed to delete region",
        success: false,
      };
      toast.error(errorData.message || "Failed to delete region");
      return errorData;
    }
  },

  // Branch API Handlers
  getAllBranches: async ({ page = 1, limit = 10, search = "", status = "", state_id = "", region_id = "" } = {}) => {
    try {
      const result = await axios.get(`${baseURL}/api/v1/branches/get-all`, {
        withCredentials: true,
        params: { page, limit, search, status, state_id, region_id },
      });
      return result.data;
    } catch (error) {
      console.error("Get all branches error:", error);
      const errorData = error.response?.data || {
        statusCode: 500,
        message: error.message || "Failed to fetch branches",
        success: false,
      };
      toast.error(errorData.message || "Failed to fetch branches");
      return errorData;
    }
  },

  getBranchBySlug: async (slug) => {
    try {
      const result = await axios.get(`${baseURL}/api/v1/branches/get/${slug}`, {
        withCredentials: true,
      });
      return result.data;
    } catch (error) {
      console.error("Get branch by slug error:", error);
      const errorData = error.response?.data || {
        statusCode: 500,
        message: error.message || "Failed to fetch branch details",
        success: false,
      };
      toast.error(errorData.message || "Failed to fetch branch details");
      return errorData;
    }
  },

  getBranchByRegionId: async (regionId, { page = 1, limit = 100 } = {}) => {
    try {
      const result = await axios.get(`${baseURL}/api/v1/branches/get-by-region-id/${regionId}`, {
        withCredentials: true,
        params: { page, limit },
      });
      return result.data;
    } catch (error) {
      console.error("Get branches by region ID error:", error);
      return { success: false, data: [] };
    }
  },

  createBranch: async (data) => {
    try {
      const result = await axios.post(`${baseURL}/api/v1/branches/create`, data, {
        withCredentials: true,
      });
      return result.data;
    } catch (error) {
      console.error("Create branch error:", error);
      const errorData = error.response?.data || {
        statusCode: 500,
        message: error.message || "Failed to create branch",
        success: false,
      };
      toast.error(errorData.message || "Failed to create branch");
      return errorData;
    }
  },

  updateBranch: async (slug, data) => {
    try {
      const result = await axios.put(`${baseURL}/api/v1/branches/update/${slug}`, data, {
        withCredentials: true,
      });
      return result.data;
    } catch (error) {
      console.error("Update branch error:", error);
      const errorData = error.response?.data || {
        statusCode: 500,
        message: error.message || "Failed to update branch",
        success: false,
      };
      toast.error(errorData.message || "Failed to update branch");
      return errorData;
    }
  },

  deleteBranch: async (slug) => {
    try {
      const result = await axios.delete(`${baseURL}/api/v1/branches/delete/${slug}`, {
        withCredentials: true,
      });
      return result.data;
    } catch (error) {
      console.error("Delete branch error:", error);
      const errorData = error.response?.data || {
        statusCode: 500,
        message: error.message || "Failed to delete branch",
        success: false,
      };
      toast.error(errorData.message || "Failed to delete branch");
      return errorData;
    }
  },
};

export const stateRoute = {
  getAllStates: locationRoute.getAllStates,
  getStateBySlug: locationRoute.getStateBySlug,
  createState: locationRoute.createState,
  updateState: locationRoute.updateState,
  deleteState: locationRoute.deleteState,
};

export const regionRoute = {
  getAllRegions: locationRoute.getAllRegions,
  getRegionBySlug: locationRoute.getRegionBySlug,
  getRegionByStateId: locationRoute.getRegionByStateId,
  createRegion: locationRoute.createRegion,
  updateRegion: locationRoute.updateRegion,
  deleteRegion: locationRoute.deleteRegion,
};

export const branchRoute = {
  getAllBranches: locationRoute.getAllBranches,
  getBranchBySlug: locationRoute.getBranchBySlug,
  getBranchByRegionId: locationRoute.getBranchByRegionId,
  createBranch: locationRoute.createBranch,
  updateBranch: locationRoute.updateBranch,
  deleteBranch: locationRoute.deleteBranch,
};
