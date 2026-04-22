import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  fetchWorkerDashboardSummary,
  fetchWorkerUpcomingJobs,
  workerLogout,
} from "../api/WorAuth";
import Icon from "react-native-vector-icons/Ionicons";

export default function WorkerDashboard() {
  const { width, height } = useWindowDimensions();
  const navigation = useNavigation<any>();

  // 🔥 Responsive scaling
  const scale = (size: number) => (width / 390) * size;
  const vScale = (size: number) => (height / 844) * size;
  const mod = (size: number) => size + (scale(size) - size) * 0.5;

  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [workerName, setWorkerName] = useState("Worker");
  
  // Dashboard state
  const [dashboardData, setDashboardData] = useState({
    activeJobs: 0,
    completedJobs: 0,
    pendingRequests: 0,
    totalEarnings: 0,
    averageRating: 0,
  });

  // Jobs state
  const [upcomingJobs, setUpcomingJobs] = useState<any[]>([]);

  /**
   * Handle logout
   */
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
              const result = await workerLogout();
              // Clear ALL authentication data (worker + customer to be safe)
              await AsyncStorage.multiRemove([
                "token",
                "workerId",
                "workerEmail",
                "workerData",
                "userId",
                "userEmail",
                "userData",
                "customerData",
                "authToken",
              ]);
              console.log("[WorkerDashboard] Logout successful and storage cleared");
              
              // Navigate to Home with reset to prevent back navigation
              navigation.reset({
                index: 0,
                routes: [{ name: "Home" }],
              });
            } catch (error) {
              console.error("[WorkerDashboard] Logout error:", error);
              // Even if API call fails, clear local storage and navigate
              await AsyncStorage.multiRemove([
                "token",
                "workerId",
                "workerEmail",
                "workerData",
                "userId",
                "userEmail",
                "userData",
                "customerData",
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

  // Static STATS mapped from dashboard data
  const STATS = [
    { icon: "🤝", label: "ACTIVE JOBS", value: dashboardData.activeJobs.toString() },
    { icon: "✅", label: "COMPLETED JOBS", value: dashboardData.completedJobs.toString() },
    { icon: "⏳", label: "PENDING REQUESTS", value: dashboardData.pendingRequests.toString() },
    { icon: "💰", label: "TOTAL EARNINGS", value: `$${dashboardData.totalEarnings}` },
  ];

  // Mapped jobs from API
  const JOBS = upcomingJobs.map((job) => ({
    id: job.id,
    title: job.title || "Service",
    by: `by ${job.customer || "Unknown"}`,
    status: job.status || "pending",
  }));

  const TABS = [
  { key: "dashboard", label: "Home", icon: "home" },
  { key: "messages", label: "Messages", icon: "chatbubble-ellipses" },
  { key: "reviews", label: "Reviews", icon: "star" },
  { key: "profile", label: "Profile", icon: "person" },
  { key: "pending", label: "Pending", icon: "time" },
  { key: "logout", label: "Logout", icon: "log-out" },
];
  /**
   * Load worker dashboard data on component mount
   */
  useEffect(() => {
    const loadDashboardData = async () => {
      console.log("[WorkerDashboard] Loading dashboard data...");
      setLoading(true);
      setError("");

      try {
        // Check authorization
        const token = await AsyncStorage.getItem("token");
        const workerId = await AsyncStorage.getItem("workerId");

        console.log("[WorkerDashboard] Authorization check - Token:", !!token, "WorkerId:", workerId);

        if (!token || !workerId) {
          console.log("[WorkerDashboard] No authorization found, redirecting to Home");
          navigation.reset({
            index: 0,
            routes: [{ name: "Home" }],
          });
          return;
        }

        // Get worker name from AsyncStorage
        const workerDataStr = await AsyncStorage.getItem("workerData");
        if (workerDataStr) {
          const workerData = JSON.parse(workerDataStr);
          setWorkerName(workerData.fullName || "Worker");
          console.log("[WorkerDashboard] Worker name:", workerData.fullName);
        }

        // Fetch dashboard summary
        console.log("[WorkerDashboard] Fetching dashboard summary...");
        const summaryResult: any = await fetchWorkerDashboardSummary();

        if (!summaryResult.success) {
          // If API error is due to auth, redirect to Home
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

        console.log("[WorkerDashboard] Dashboard summary received:", summaryResult.data);
        setDashboardData(summaryResult.data);

        // Fetch upcoming jobs
        console.log("[WorkerDashboard] Fetching upcoming jobs...");
        const jobsResult: any = await fetchWorkerUpcomingJobs();

        if (!jobsResult.success) {
          // If API error is due to auth, redirect to Home
          const statusCode = jobsResult.error?.response?.status;
          if (statusCode === 401) {
            navigation.reset({
              index: 0,
              routes: [{ name: "Home" }],
            });
            return;
          }
          throw new Error(jobsResult.message || "Failed to fetch upcoming jobs");
        }

        console.log("[WorkerDashboard] Upcoming jobs received:", jobsResult.data);
        
        if (jobsResult.data?.jobs) {
          setUpcomingJobs(jobsResult.data.jobs);
        }

      } catch (err) {
        console.error("[WorkerDashboard] Error loading dashboard data:", err);
        // On any error, redirect to Home for re-authentication
        navigation.reset({
          index: 0,
          routes: [{ name: "Home" }],
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [navigation]);

  // Loading screen
  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F5F6FA", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={{ marginTop: vScale(16), color: "#666" }}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={[styles.header, { padding: scale(14) }]}>
        <View style={styles.logoBox}>
          <View style={[styles.logoIcon, { width: scale(36), height: scale(36) }]}>
            <Text style={{ color: "#fff" }}>D</Text>
          </View>
          <Text style={[styles.logoText, { fontSize: mod(18) }]}>
            DailyJobs
          </Text>
        </View>

        <View style={styles.avatar}>
          <Text style={{ color: "#fff" }}>
            {workerName.charAt(0).toUpperCase()}{workerName.split(" ")[1]?.charAt(0).toUpperCase() || "W"}
          </Text>
        </View>
      </View>

      {/* Error Display */}
      {error ? (
        <View
          style={{
            backgroundColor: "#FEE2E2",
            borderRadius: scale(8),
            padding: scale(12),
            marginHorizontal: scale(14),
            marginTop: scale(10),
            borderLeftWidth: 4,
            borderLeftColor: "#DC2626",
          }}
        >
          <Text style={{ color: "#DC2626", fontSize: scale(14), fontWeight: "500" }}>
            {error}
          </Text>
        </View>
      ) : null}

      {/* NAV TABS */}
      {/* <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingHorizontal: scale(10) }}>
        {TABS.map((tab) => {
          const active = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[
                styles.tab,
                {
                  backgroundColor: active ? "#2563EB" : "transparent",
                  borderColor: active ? "#2563EB" : "#E5E7EB",
                },
              ]}
            >
              <Text style={{ color: active ? "#fff" : "#6B7280" }}>
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView> */}

      {/* CONTENT */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: vScale(12), paddingBottom: vScale(120) }}>

        {activeTab === "dashboard" && (
          <View style={{ paddingHorizontal: scale(12), paddingVertical: vScale(8) }}>

            {/* STATS GRID */}
            <View style={styles.grid}>
              {STATS.map((s) => (
                <View key={s.label} style={styles.card}>
                  <Text style={{ fontSize: scale(22) }}>{s.icon}</Text>
                  <Text style={{ fontSize: mod(10), color: "#9CA3AF" }}>
                    {s.label}
                  </Text>
                  <Text style={{ fontSize: mod(20), fontWeight: "700" }}>
                    {s.value}
                  </Text>
                </View>
              ))}
            </View>

            {/* JOB LIST */}
            <View style={styles.jobBox}>
              <Text style={styles.sectionTitle}>
                Upcoming Jobs {JOBS.length > 0 ? `(${JOBS.length})` : ""}
              </Text>

              {JOBS.length > 0 ? (
                JOBS.map((job) => (
                  <View key={job.id} style={styles.jobRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.jobTitle}>{job.title}</Text>
                      <Text style={styles.jobSub}>{job.by}</Text>
                    </View>

                    <View
                      style={[
                        styles.badge,
                        {
                          backgroundColor:
                            job.status === "accepted" ? "#FEF3C7" : "#FEE2E2",
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color:
                            job.status === "accepted" ? "#D97706" : "#DC2626",
                          fontSize: scale(12),
                          fontWeight: "600",
                        }}
                      >
                        {job.status}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={{ color: "#9CA3AF", fontSize: scale(14), textAlign: "center", paddingVertical: vScale(20) }}>
                  No upcoming jobs
                </Text>
              )}
            </View>
          </View>
        )}

        {activeTab !== "dashboard" && (
          <View style={styles.empty}>
            <Text style={{ fontSize: scale(50) }}>🚧</Text>
            <Text style={{ color: "#6B7280" }}>Coming Soon</Text>
          </View>
        )}
      </ScrollView>

      {/* BOTTOM BAR */}
      {/* BOTTOM BAR */}
<View style={[styles.bottomBar, { height: vScale(85), paddingBottom: vScale(8), paddingTop: vScale(8) }]}>
  {TABS.map((tab) => {
    const active = activeTab === tab.key;

    return (
      <TouchableOpacity
        key={tab.key}
        style={styles.bottomTab}
        onPress={() => {
          if (tab.key === "logout") {
            handleLogout();
          } else {
            setActiveTab(tab.key);
          }
        }}
      >
        <Icon
          name={active ? tab.icon : `${tab.icon}-outline`}
          size={mod(26)}
          color={active ? "#2563EB" : "#9CA3AF"}
        />

        <Text style={{
          color: active ? "#2563EB" : "#9CA3AF",
          fontSize: mod(11),
          marginTop: vScale(4),
          fontWeight: active ? "600" : "500",
        }}>
          {tab.label}
        </Text>
      </TouchableOpacity>
    );
  })}
</View>
    </View>
  );
}

// STYLES
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F6FA" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
  },

  logoBox: { flexDirection: "row", alignItems: "center", gap: 8 },

  logoIcon: {
    backgroundColor: "#2563EB",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },

  logoText: { color: "#2563EB", fontWeight: "700" },

  avatar: {
    width: 36,
    height: 36,
    borderRadius: 20,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    color: "#fff",
    fontWeight: "700",
  },

  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 6,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  card: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },

  jobBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginTop: 10,
  },

  sectionTitle: { fontWeight: "600", marginBottom: 10 },

  jobRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  jobTitle: { fontWeight: "600" },
  jobSub: { color: "#9CA3AF" },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },

  empty: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 100,
  },

  bottomBar: {
  flexDirection: "row",
  borderTopWidth: 1,
  borderColor: "#E5E7EB",
  backgroundColor: "#fff",
  elevation: 15,
  shadowColor: "#000",
  shadowOpacity: 0.12,
  shadowOffset: { width: 0, height: -3 },
  shadowRadius: 8,
},

bottomTab: {
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
},
});