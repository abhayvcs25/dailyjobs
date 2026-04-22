import API from "./api";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Log utility function
 */
const log = (message, data = null) => {
  console.log(`[Auth] ${message}`, data || "");
};

const logError = (message, error) => {
  console.error(`[Auth ERROR] ${message}`, error);
};

// 🔐 LOGIN
export const loginUser = async (data) => {
  try {
    log("LOGIN REQUEST:", data);

    const response = await API.post("/users/login", data);

    log("LOGIN RESPONSE:", response.data);

    // Save user data to AsyncStorage
    if (response.data.token && response.data.user) {
      await AsyncStorage.setItem("token", response.data.token);
      await AsyncStorage.setItem("userId", response.data.user._id);
      await AsyncStorage.setItem("userData", JSON.stringify(response.data.user));
      log("User data saved to AsyncStorage");
    }

    return response.data;
  } catch (error) {
    logError("LOGIN ERROR:", error.response?.data || error.message);
    throw error;
  }
};

// 📝 REGISTER (FIXED PAYLOAD)
export const registerUser = async (data) => {
  try {
    log("REGISTER REQUEST:", data);

    const response = await API.post("/users/register", {
      fullName: data.fullName,      // ✅ matches backend
      email: data.email,
      password: data.password,
      companyName: data.companyName,
      phone: data.phone,            // ✅ matches backend
      location: data.location,
    });

    log("REGISTER RESPONSE:", response.data);

    return response.data;
  } catch (error) {
    logError("REGISTER ERROR:", error.response?.data || error.message);
    throw error;
  }
};

// 👤 FETCH CUSTOMER DETAILS
export const fetchCustomerDetails = async (customerId) => {
  try {
    log("FETCHING CUSTOMER DETAILS for ID:", customerId);

    const response = await API.get(`/users/me?id=${customerId}`);

    log("CUSTOMER DETAILS FETCHED:", response.data);

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    logError("FETCH CUSTOMER DETAILS ERROR:", error.response?.data || error.message);

    const errorMessage = 
      error.response?.data?.message || 
      error.message || 
      "Failed to fetch customer details";

    return {
      success: false,
      message: errorMessage,
      error: error,
    };
  }
};

// 📋 GET STORED USER DATA
export const getStoredUserData = async () => {
  try {
    const userId = await AsyncStorage.getItem("userId");
    const userData = await AsyncStorage.getItem("userData");
    const token = await AsyncStorage.getItem("token");

    log("RETRIEVED STORED USER DATA", { userId });

    return {
      userId,
      userData: userData ? JSON.parse(userData) : null,
      token,
    };
  } catch (error) {
    logError("FAILED TO RETRIEVE STORED USER DATA:", error.message);
    return {
      userId: null,
      userData: null,
      token: null,
    };
  }
};

// � FETCH DASHBOARD SUMMARY
export const fetchDashboardSummary = async () => {
  try {
    log("FETCHING DASHBOARD SUMMARY");

    const response = await API.get("/dashboard/summary");

    log("DASHBOARD SUMMARY FETCHED:", response.data);

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    logError("FETCH DASHBOARD SUMMARY ERROR:", error.response?.data || error.message);

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

// 📅 FETCH RECENT BOOKINGS
export const fetchRecentBookings = async () => {
  try {
    log("FETCHING RECENT BOOKINGS");

    const response = await API.get("/dashboard/recent-bookings");

    log("RECENT BOOKINGS FETCHED:", response.data);

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    logError("FETCH RECENT BOOKINGS ERROR:", error.response?.data || error.message);

    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch recent bookings";

    return {
      success: false,
      message: errorMessage,
      error: error,
    };
  }
};

// 💬 FETCH DASHBOARD MESSAGES
export const fetchDashboardMessages = async () => {
  try {
    log("FETCHING DASHBOARD MESSAGES");

    const response = await API.get("/dashboard/messages");

    log("DASHBOARD MESSAGES FETCHED:", response.data);

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    logError("FETCH DASHBOARD MESSAGES ERROR:", error.response?.data || error.message);

    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch dashboard messages";

    return {
      success: false,
      message: errorMessage,
      error: error,
    };
  }
};

// 🚪 LOGOUT
export const logoutUser = async () => {
  try {
    log("LOGGING OUT USER");

    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("userId");
    await AsyncStorage.removeItem("userData");

    log("USER LOGGED OUT SUCCESSFULLY");

    return {
      success: true,
      message: "Logged out successfully",
    };
  } catch (error) {
    logError("LOGOUT ERROR:", error.message);
    return {
      success: false,
      message: "Logout failed",
      error: error,
    };
  }
};

export default {
  loginUser,
  registerUser,
  fetchCustomerDetails,
  fetchDashboardSummary,
  fetchRecentBookings,
  fetchDashboardMessages,
  getStoredUserData,
  logoutUser,
};