import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "react-native-vector-icons/Ionicons";
import {
  fetchCustomerDetails,
  fetchDashboardSummary,
  fetchRecentBookings,
  logoutUser,
} from "../api/auth";

// ─── Responsive Scaling Hook (RN FIXED) ────────────────────────────────────
function useScale() {
  const { width, height } = useWindowDimensions();

  const BASE_W = 390;
  const BASE_H = 844;

  const scale = (size: number) => (width / BASE_W) * size;
  const vScale = (size: number) => (height / BASE_H) * size;

  const mod = (size: number, factor = 0.5) =>
    size + (scale(size) - size) * factor;

  return { scale, vScale, mod };
}

// ─── DATA ─────────────────────────────────────────────────────────────────
// Data is now fetched from API, hardcoded data removed

// ─── STATUS BADGE ─────────────────────────────────────────────────────────
function StatusBadge({ status, scale, vScale, mod }: any) {
  const isAccepted = status === "accepted";

  return (
    <View
      style={{
        paddingHorizontal: scale(10),
        paddingVertical: vScale(4),
        borderRadius: scale(20),
        backgroundColor: isAccepted ? "#DCFCE7" : "#FEF3C7",
      }}
    >
      <Text
        style={{
          color: isAccepted ? "#16A34A" : "#D97706",
          fontSize: mod(11),
          fontWeight: "600",
          textTransform: "capitalize",
        }}
      >
        {status}
      </Text>
    </View>
  );
}

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────
export default function CustDashboardScreen() {
  const { scale, vScale, mod } = useScale();
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState("home");
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [customerData, setCustomerData] = useState<any>(null);
  const [dashboardSummary, setDashboardSummary] = useState<any>(null);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [error, setError] = useState("");

  const TABS = [
  { key: "home", label: "Home", icon: "home" },
  { key: "favorites", label: "Fav", icon: "heart" },
  { key: "profile", label: "Profile", icon: "person" },
  { key: "support", label: "Support", icon: "help-circle" },
  { key: "logout", label: "Logout", icon: "log-out" },
];
const handleLogout = async () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", onPress: () => {}, style: "cancel" },
        {
          text: "Logout",
          onPress: async () => {
            try {
              const result = await logoutUser();
              // Clear ALL authentication data (customer + worker to be safe)
              await AsyncStorage.multiRemove([
                "token",
                "userId",
                "userEmail",
                "userData",
                "customerData",
                "workerId",
                "workerEmail", 
                "workerData",
                "authToken",
              ]);
              console.log("[CustDashboard] Logout successful and storage cleared");
              
              // Navigate to Home with reset to prevent back navigation
              navigation.reset({
                index: 0,
                routes: [{ name: "Home" }],
              });
            } catch (error) {
              console.error("[CustDashboard] Logout error:", error);
              // Even if API call fails, clear local storage and navigate
              await AsyncStorage.multiRemove([
                "token",
                "userId",
                "userEmail",
                "userData",
                "customerData",
                "workerId",
                "workerEmail",
                "workerData",
                "authToken",
              ]);
              navigation.reset({
                index: 0,
                routes: [{ name: "Home" }],
              });
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  // Fetch customer details on component mount
  useEffect(() => {
    const loadDashboardData = async () => {
      console.log("[CustDashboard] Loading dashboard data...");
      setLoading(true);
      setError("");

      try {
        // Get user ID from AsyncStorage
        const userId = await AsyncStorage.getItem("userId");
        const token = await AsyncStorage.getItem("token");

        console.log("[CustDashboard] Retrieved userId:", userId);

        // Authorization check
        if (!userId || !token) {
          console.log("[CustDashboard] No authorization found, redirecting to Home");
          navigation.reset({
            index: 0,
            routes: [{ name: "Home" }],
          });
          return;
        }

        // Fetch customer details from API
        console.log("[CustDashboard] Fetching customer details from API...");
        const customerResult = await fetchCustomerDetails(userId);

        console.log("[CustDashboard] Customer result:", customerResult);

        if (!customerResult.success) {
          throw new Error(customerResult.message || "Failed to fetch customer details");
        }

        setCustomerData(customerResult.data);
        console.log("[CustDashboard] Customer data loaded:", customerResult.data);

        // Fetch dashboard summary
        console.log("[CustDashboard] Fetching dashboard summary...");
        const summaryResult: any = await fetchDashboardSummary();

        if (!summaryResult.success) {
          const statusCode = summaryResult.error?.response?.status;
          if (statusCode === 401) {
            navigation.reset({
              index: 0,
              routes: [{ name: "Home" }],
            });
            return;
          }
          throw new Error(summaryResult.message || "Failed to fetch dashboard summary");
        }

        console.log("[CustDashboard] Dashboard summary:", summaryResult.data);
        setDashboardSummary(summaryResult.data);

        // Fetch recent bookings
        console.log("[CustDashboard] Fetching recent bookings...");
        const bookingsResult: any = await fetchRecentBookings();

        if (!bookingsResult.success) {
          const statusCode = bookingsResult.error?.response?.status;
          if (statusCode === 401) {
            navigation.reset({
              index: 0,
              routes: [{ name: "Home" }],
            });
            return;
          }
          throw new Error(bookingsResult.message || "Failed to fetch recent bookings");
        }

        console.log("[CustDashboard] Recent bookings:", bookingsResult.data);

        if (bookingsResult.data?.bookings) {
          setRecentBookings(bookingsResult.data.bookings);
        }
      } catch (err) {
        console.error("[CustDashboard] Error loading dashboard data:", err);
        const statusCode = (err as any)?.response?.status;
        
        // Check if it's an auth error
        if (statusCode === 401 || statusCode === 403) {
          console.log("[CustDashboard] Auth error detected, clearing storage and redirecting to Auth");
          // Clear invalid tokens from storage
          await AsyncStorage.multiRemove([
            "token",
            "userId",
            "userData",
            "userEmail",
            "customerData",
            "authToken",
          ]);
          
          // Redirect to Auth screen
          navigation.reset({
            index: 0,
            routes: [{ name: "Auth" }],
          });
          return;
        }
        
        setError("Failed to load dashboard. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [navigation]);

  // Extract first name from fullName
  const getFirstName = (fullName: string | undefined) => {
    if (!fullName) return "User";
    return fullName.split(" ")[0];
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#EFF3FB", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={{ marginTop: vScale(16), color: "#666" }}>Loading dashboard...</Text>
      </View>
    );
  }

  // Display bookings: show limited if not expanded
  const displayedBookings = showAll ? recentBookings : recentBookings.slice(0, 2);

  const handleSearchPress = () => {
    console.log("[CustDashboard] Search pressed, redirecting to SearchScreen");
    navigation.navigate("Search");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#EFF3FB" }}>
      <ScrollView contentContainerStyle={{ paddingBottom: vScale(120), paddingTop: vScale(10) }}>
        
        {/* HEADER */}
        <View style={{ backgroundColor: "#fff", padding: scale(16), marginHorizontal: scale(12), borderRadius: scale(8), marginBottom: vScale(12) }}>
          <Text style={{ fontSize: mod(18), fontWeight: "700", color: "#2563EB" }}>
            DailyJobs
          </Text>
        </View>

        {/* SEARCH BAR - Redirect to SearchScreen */}
        <TouchableOpacity
          onPress={handleSearchPress}
          style={{ marginHorizontal: scale(12), marginBottom: vScale(12) }}
        >
          <View style={{ flexDirection: "row", backgroundColor: "#fff", borderRadius: scale(8), paddingHorizontal: scale(12), paddingVertical: scale(12), alignItems: "center", elevation: 2 }}>
            <Text style={{ fontSize: scale(18), marginRight: scale(8) }}>🔍</Text>
            <Text style={{ flex: 1, fontSize: mod(14), color: "#9CA3AF" }}>Search for workers...</Text>
          </View>
        </TouchableOpacity>

        {/* Error Message Display */}
        {error ? (
          <View
            style={{
              backgroundColor: "#FEE2E2",
              borderRadius: scale(8),
              padding: scale(12),
              marginHorizontal: scale(12),
              marginBottom: vScale(12),
              borderLeftWidth: 4,
              borderLeftColor: "#DC2626",
            }}
          >
            <Text style={{ color: "#DC2626", fontSize: scale(14), fontWeight: "500" }}>
              {error}
            </Text>
          </View>
        ) : null}

        {/* WELCOME */}
        <View
          style={{
            margin: scale(12),
            backgroundColor: "#2563EB",
            borderRadius: scale(14),
            padding: scale(16),
          }}
        >
          <Text style={{ fontSize: scale(22) }}>👋</Text>
          <Text style={{ color: "#fff", fontSize: mod(16), fontWeight: "700" }}>
            Welcome back, {getFirstName(customerData?.fullName)}!
          </Text>
          {customerData?.email && (
            <Text style={{ color: "#E0E7FF", fontSize: mod(12), marginTop: vScale(4) }}>
              {customerData.email}
            </Text>
          )}
        </View>

        {/* STATS - Dynamic from API */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginHorizontal: scale(12),
            marginBottom: vScale(12),
          }}
        >
          <View
            style={{
              flex: 1,
              marginHorizontal: scale(4),
              backgroundColor: "#fff",
              borderRadius: scale(12),
              padding: scale(12),
            }}
          >
            <Text>📅</Text>
            <Text style={{ color: "#2563EB", fontSize: mod(18), fontWeight: "700" }}>
              {dashboardSummary?.totalBookings || 0}
            </Text>
            <Text style={{ fontSize: mod(9), color: "#9CA3AF" }}>
              TOTAL BOOKINGS
            </Text>
          </View>

          <View
            style={{
              flex: 1,
              marginHorizontal: scale(4),
              backgroundColor: "#fff",
              borderRadius: scale(12),
              padding: scale(12),
            }}
          >
            <Text>⏳</Text>
            <Text style={{ color: "#F59E0B", fontSize: mod(18), fontWeight: "700" }}>
              {dashboardSummary?.totalRequests || 0}
            </Text>
            <Text style={{ fontSize: mod(9), color: "#9CA3AF" }}>
              PENDING REQUESTS
            </Text>
          </View>

          <View
            style={{
              flex: 1,
              marginHorizontal: scale(4),
              backgroundColor: "#fff",
              borderRadius: scale(12),
              padding: scale(12),
            }}
          >
            <Text>❤️</Text>
            <Text style={{ color: "#EF4444", fontSize: mod(18), fontWeight: "700" }}>
              {dashboardSummary?.totalFavorites || 0}
            </Text>
            <Text style={{ fontSize: mod(9), color: "#9CA3AF" }}>
              SAVED FAVORITES
            </Text>
          </View>
        </View>

        {/* CUSTOMER INFO */}
        {customerData && (
          <View
            style={{
              backgroundColor: "#fff",
              margin: scale(12),
              borderRadius: scale(14),
              padding: scale(12),
            }}
          >
            <Text style={{ fontSize: mod(14), fontWeight: "700", marginBottom: vScale(8) }}>
              Your Information
            </Text>
            
            {customerData.companyName && (
              <View style={{ marginBottom: vScale(8) }}>
                <Text style={{ fontSize: mod(10), color: "#9CA3AF" }}>Company</Text>
                <Text style={{ fontSize: mod(12), fontWeight: "600", color: "#111827" }}>
                  {customerData.companyName}
                </Text>
              </View>
            )}

            {customerData.phone && (
              <View style={{ marginBottom: vScale(8) }}>
                <Text style={{ fontSize: mod(10), color: "#9CA3AF" }}>Phone</Text>
                <Text style={{ fontSize: mod(12), fontWeight: "600", color: "#111827" }}>
                  {customerData.phone}
                </Text>
              </View>
            )}

            {customerData.location && (
              <View style={{ marginBottom: vScale(8) }}>
                <Text style={{ fontSize: mod(10), color: "#9CA3AF" }}>Location</Text>
                <Text style={{ fontSize: mod(12), fontWeight: "600", color: "#111827" }}>
                  {customerData.location}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* BOOKINGS - Dynamic from API */}
        <View
          style={{
            backgroundColor: "#fff",
            margin: scale(12),
            borderRadius: scale(14),
            padding: scale(12),
          }}
        >
          <Text style={{ fontSize: mod(14), fontWeight: "700" }}>
            Recent Bookings {recentBookings.length > 0 ? `(${recentBookings.length})` : ""}
          </Text>

          {displayedBookings.length > 0 ? (
            displayedBookings.map((b: any, idx: number) => (
              <View
                key={idx}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginTop: vScale(10),
                  alignItems: "center",
                }}
              >
                <View>
                  <Text style={{ fontSize: mod(12), fontWeight: "600" }}>
                    {b.workerName}
                  </Text>
                  <Text style={{ fontSize: mod(10), color: "#9CA3AF" }}>
                    {b.serviceName}
                  </Text>
                  <Text style={{ fontSize: mod(9), color: "#D1D5DB", marginTop: vScale(2) }}>
                    {b.bookingDate}
                  </Text>
                </View>

                <StatusBadge
                  status={b.status}
                  scale={scale}
                  vScale={vScale}
                  mod={mod}
                />
              </View>
            ))
          ) : (
            <Text style={{ textAlign: "center", marginTop: vScale(10), color: "#9CA3AF", fontSize: mod(12) }}>
              No bookings yet
            </Text>
          )}

          {recentBookings.length > 2 && (
            <TouchableOpacity onPress={() => setShowAll(!showAll)}>
              <Text
                style={{
                  textAlign: "center",
                  marginTop: vScale(10),
                  color: "#2563EB",
                  fontWeight: "600",
                }}
              >
                {showAll ? "Show Less" : "View All Bookings"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

     {/* BOTTOM TABS */}
<View
  style={{
    position: "absolute",
    bottom: 0,
    flexDirection: "row",
    width: "100%",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#E5E7EB",
    height: vScale(85),
    paddingBottom: vScale(8),
    paddingTop: vScale(8),
    elevation: 15,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: -3 },
    shadowRadius: 8,
  }}
>
  {TABS.map((tab) => {
    const active = activeTab === tab.key;

    return (
      <TouchableOpacity
        key={tab.key}
        onPress={() => {
          if (tab.key === "logout") {
            handleLogout();
          } else {
            setActiveTab(tab.key);
          }
        }}
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: vScale(6),
        }}
      >
        <Ionicons
          name={active ? tab.icon : `${tab.icon}-outline`}
          size={mod(26)}
          color={active ? "#2563EB" : "#9CA3AF"}
        />

        <Text
          style={{
            color: active ? "#2563EB" : "#9CA3AF",
            fontSize: mod(11),
            marginTop: vScale(4),
            fontWeight: active ? "600" : "500",
          }}
        >
          {tab.label}
        </Text>
      </TouchableOpacity>
    );
  })}
</View>
    </View>
  );
}