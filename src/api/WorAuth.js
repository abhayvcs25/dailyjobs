import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "http://192.168.0.104:5000";

/**
 * ============================================================
 * AXIOS INSTANCES
 * ============================================================
 * authAPI: For worker authentication routes (/workers/*)
 *          - Endpoint: /workers/login, /workers/register, /workers/me
 *          - No token needed (public routes)
 * 
 * dashboardAPI: For worker dashboard routes (/api/worker-dashboard/*)
 *               - Endpoint: /api/worker-dashboard/summary, /api/worker-dashboard/upcoming-jobs
 *               - Requires token (auth middleware)
 */

// Create axios instance for auth routes (outside /api)
const authAPI = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Create axios instance for dashboard routes (with token interceptor)
const dashboardAPI = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔑 Attach token automatically to dashboard API requests
dashboardAPI.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      log("Token attached to dashboard API request");
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * ============================================================
 * LOG UTILITIES
 * ============================================================
 */
const log = (message, data = null) => {
  console.log(`[WorAuth] ${message}`, data || "");
};

const logError = (message, error) => {
  console.error(`[WorAuth ERROR] ${message}`, error);
};

/**
 * ============================================================
 * AUTHENTICATION FUNCTIONS
 * ============================================================
 */

/**
 * Register a new worker
 * API: POST /workers/register
 */
export const workerRegister = async (registrationData) => {
  try {
    log("Starting worker registration...", registrationData);

    const response = await authAPI.post("/workers/register", registrationData);

    log("Registration successful", response.data);

    if (response.data.worker && response.data.worker._id) {
      // Worker registered but no token returned from register endpoint
      // User will need to login after registration
      return {
        success: true,
        message: response.data.message,
        worker: response.data.worker,
        requiresLogin: true,
      };
    }

    return {
      success: false,
      message: "Registration failed: No worker data returned",
    };
  } catch (error) {
    logError("Worker registration failed", error.response?.data || error.message);

    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Registration failed. Please try again.";

    return {
      success: false,
      message: errorMessage,
      error: error,
    };
  }
};

/**
 * Login a worker
 * API: POST /workers/login
 * Returns: { token, worker { id, fullName, email, role } }
 */
export const workerLogin = async (email, password) => {
  try {
    log("Starting worker login...", { email });

    const response = await authAPI.post("/workers/login", {
      email,
      password,
    });

    log("Login successful", { email, userId: response.data.worker?.id });

    if (response.data.token && response.data.worker) {
      // Save token to AsyncStorage
      await AsyncStorage.setItem("token", response.data.token);
      await AsyncStorage.setItem("workerId", response.data.worker.id);
      await AsyncStorage.setItem("workerData", JSON.stringify(response.data.worker));

      log("Token and worker data saved to AsyncStorage");

      return {
        success: true,
        message: response.data.message,
        token: response.data.token,
        worker: response.data.worker,
      };
    }

    logError("Login response missing token or worker data", response.data);
    return {
      success: false,
      message: "Login failed: Invalid response from server",
    };
  } catch (error) {
    logError("Worker login failed", error.response?.data || error.message);

    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Login failed. Please check your credentials.";

    return {
      success: false,
      message: errorMessage,
      error: error,
    };
  }
};

/**
 * ============================================================
 * WORKER PROFILE & DASHBOARD DATA FUNCTIONS
 * ============================================================
 */

/**
 * Fetch worker profile details
 * API: GET /workers/me?id={workerId}
 * Returns: { fullName, email, age, gender, skills, experience, location, profile, availability, hourlyRate }
 */
export const fetchWorkerDetails = async (workerId) => {
  try {
    log("Fetching worker details for ID:", workerId);

    const response = await authAPI.get(`/workers/me?id=${workerId}`);

    log("Worker details fetched successfully", response.data);

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    logError("Fetch worker details failed", error.response?.data || error.message);

    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch worker details";

    return {
      success: false,
      message: errorMessage,
      error: error,
    };
  }
};

/**
 * Fetch worker dashboard summary
 * API: GET /api/worker-dashboard/summary (requires auth)
 * Returns: { activeJobs, completedJobs, pendingRequests, totalEarnings, averageRating }
 */
export const fetchWorkerDashboardSummary = async () => {
  try {
    log("Fetching worker dashboard summary...");

    const response = await dashboardAPI.get("/worker-dashboard/summary");

    log("Dashboard summary fetched successfully", response.data);

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    logError("Fetch dashboard summary failed", error.response?.data || error.message);

    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch dashboard summary";

    return {
      success: false,
      message: errorMessage,
      error: error,
    };
  }
};

/**
 * Fetch worker upcoming jobs
 * API: GET /api/worker-dashboard/upcoming-jobs (requires auth)
 * Returns: { jobs: [ { id, title, customer, status, date } ] }
 */
export const fetchWorkerUpcomingJobs = async () => {
  try {
    log("Fetching worker upcoming jobs...");

    const response = await dashboardAPI.get("/worker-dashboard/upcoming-jobs");

    log("Upcoming jobs fetched successfully", response.data);

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    logError("Fetch upcoming jobs failed", error.response?.data || error.message);

    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch upcoming jobs";

    return {
      success: false,
      message: errorMessage,
      error: error,
    };
  }
};

/**
 * Fetch worker recent messages
 * API: GET /api/worker-dashboard/recent-messages (requires auth)
 * Returns: { messages: [ { id, from, message, time } ] }
 */
export const fetchWorkerRecentMessages = async () => {
  try {
    log("Fetching worker recent messages...");

    const response = await dashboardAPI.get("/worker-dashboard/recent-messages");

    log("Recent messages fetched successfully", response.data);

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    logError("Fetch recent messages failed", error.response?.data || error.message);

    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch recent messages";

    return {
      success: false,
      message: errorMessage,
      error: error,
    };
  }
};

/**
 * Fetch worker reviews
 * API: GET /api/worker-dashboard/reviews (requires auth)
 * Returns: { reviews: [ { id, author, rating, comment } ] }
 */
export const fetchWorkerReviews = async () => {
  try {
    log("Fetching worker reviews...");

    const response = await dashboardAPI.get("/worker-dashboard/reviews");

    log("Reviews fetched successfully", response.data);

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    logError("Fetch reviews failed", error.response?.data || error.message);

    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch reviews";

    return {
      success: false,
      message: errorMessage,
      error: error,
    };
  }
};

/**
 * Logout a worker
 */
export const workerLogout = async () => {
  try {
    log("Logging out worker...");

    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("workerId");
    await AsyncStorage.removeItem("workerData");

    log("Worker logout successful");

    return {
      success: true,
      message: "Logged out successfully",
    };
  } catch (error) {
    logError("Logout failed", error.message);
    return {
      success: false,
      message: "Logout failed",
      error: error,
    };
  }
};

/**
 * Get stored worker data from AsyncStorage
 */
export const getStoredWorkerData = async () => {
  try {
    const workerId = await AsyncStorage.getItem("workerId");
    const workerData = await AsyncStorage.getItem("workerData");
    const token = await AsyncStorage.getItem("token");

    log("Retrieved stored worker data", { workerId });

    return {
      workerId,
      workerData: workerData ? JSON.parse(workerData) : null,
      token,
    };
  } catch (error) {
    logError("Failed to retrieve stored worker data", error.message);
    return {
      workerId: null,
      workerData: null,
      token: null,
    };
  }
};

export default {
  workerRegister,
  workerLogin,
  fetchWorkerDetails,
  fetchWorkerDashboardSummary,
  fetchWorkerUpcomingJobs,
  fetchWorkerRecentMessages,
  fetchWorkerReviews,
  workerLogout,
  getStoredWorkerData,
};
