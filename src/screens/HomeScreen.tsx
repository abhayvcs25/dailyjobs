import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const HomeScreen = ({ navigation }: any) => {
  const [checkingAuth, setCheckingAuth] = useState(false);

  // Check auth status on mount and when screen comes into focus
  useEffect(() => {
    // Initial check on mount
    checkAuthStatus();
  }, []);

  // Also check when screen gains focus (handles case when returning from logout)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Small delay to ensure any logout operations have completed
      setTimeout(() => {
        checkAuthStatus();
      }, 100);
    });

    return unsubscribe;
  }, [navigation]);

  const checkAuthStatus = async () => {
    try {
      // Get both customer and worker identifiers
      const token = await AsyncStorage.getItem("token");
      const userId = await AsyncStorage.getItem("userId");
      const workerId = await AsyncStorage.getItem("workerId");

      console.log("[HomeScreen] Auth check - token:", !!token, "userId:", !!userId, "workerId:", !!workerId);

      // If worker is logged in, redirect to worker dashboard
      if (token && workerId) {
        console.log("[HomeScreen] Worker logged in, navigating to WorkerDashboard");
        navigation.reset({
          index: 0,
          routes: [{ name: "WorkerDashboard" }],
        });
        return;
      }

      // If customer is logged in, redirect to customer dashboard
      if (token && userId) {
        console.log("[HomeScreen] Customer logged in, navigating to CustDashboard");
        navigation.reset({
          index: 0,
          routes: [{ name: "CustDashboard" }],
        });
        return;
      }

      // No valid token - stay on Home (user needs to login)
      console.log("[HomeScreen] No valid session, staying on Home");
    } catch (error) {
      console.error("[HomeScreen] Error checking token:", error);
      // Stay on Home on error
    }
  };

  const handleFindWorkers = async () => {
    if (checkingAuth) return;
    
    setCheckingAuth(true);
    try {
      // Double-check before navigation (defensive)
      const token = await AsyncStorage.getItem("token");
      const userId = await AsyncStorage.getItem("userId");

      if (token && userId) {
        // ✅ user already logged in → go to dashboard
        console.log("[HomeScreen] Token and userId found, navigating to CustDashboard");
        navigation.reset({
          index: 0,
          routes: [{ name: "CustDashboard" }],
        });
      } else {
        // ❌ not logged in → go to auth
        console.log("[HomeScreen] No token/userId found, navigating to Auth");
        navigation.navigate("Auth");
      }
    } catch (error) {
      console.error("[HomeScreen] Error checking token:", error);
      Alert.alert("Error", "Failed to check authentication status. Please try again.");
      navigation.navigate("Auth");
    } finally {
      setCheckingAuth(false);
    }
  };

  const handleRegisterWorker = async () => {
    if (checkingAuth) return;

    setCheckingAuth(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const workerId = await AsyncStorage.getItem("workerId");

      if (token && workerId) {
        // ✅ user already logged in → go to dashboard
        console.log("[HomeScreen] Worker logged in, navigating to WorkerDashboard");
        navigation.reset({
          index: 0,
          routes: [{ name: "WorkerDashboard" }],
        });
      } else {
        // ❌ not logged in → go to worker auth
        console.log("[HomeScreen] No worker session, navigating to WorkerLogin");
        navigation.navigate("WorkerLogin");
      }
    } catch (error) {
      console.error("Error checking token:", error);
      Alert.alert("Error", "Failed to check authentication status");
      navigation.navigate("WorkerLogin");
    } finally {
      setCheckingAuth(false);
    }
  };

  return (
    <View style={styles.container}>

      {/* Heading */}
      <Text style={styles.heading}>
        Hire Skilled Daily Wage Workers Instantly
      </Text>

      {/* Subheading */}
      <Text style={styles.subheading}>
        Find verified and available workers near you.
      </Text>

      <View style={styles.buttonRow}>
        
        {/* Find Workers */}
        <TouchableOpacity
          style={[styles.button, styles.findButton]}
          onPress={handleFindWorkers}
        >
          <Text style={styles.buttonText}>Find Workers</Text>
        </TouchableOpacity>

        {/* Register as Worker */}
        <TouchableOpacity
          style={[styles.button, styles.registerButton]}
          onPress={handleRegisterWorker}
        >
          <Text style={styles.buttonText}>Register as Worker</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },

  heading: {
  fontSize: 24,
  fontWeight: "bold",
  textAlign: "center",
  marginBottom: 8,
  },

  subheading: {
    fontSize: 14,
    color: "gray",
    textAlign: "center",
    marginBottom: 20,
  },

  buttonRow: {
    flexDirection: "row",
    gap: 10,
  },

  button: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
  },

  findButton: {
    backgroundColor: "#007BFF",
  },

  registerButton: {
    backgroundColor: "#FFC107",
  },

  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});