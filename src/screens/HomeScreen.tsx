import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const HomeScreen = ({ navigation }: any) => {

  const handleFindWorkers = async () => {
    try {
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
      // Navigate to Auth as fallback
      navigation.navigate("Auth");
    }
  };

  const handleRegisterWorker = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const workerId = await AsyncStorage.getItem("workerId");

      if (token && workerId) {
        // ✅ user already logged in → go to dashboard
        navigation.reset({
          index: 0,
          routes: [{ name: "WorkerDashboard" }],
        });
      } else {
        // ❌ not logged in → go to worker auth
        navigation.navigate("WorkerLogin");
      }
    } catch (error) {
      console.error("Error checking token:", error);
      Alert.alert("Error", "Failed to check authentication status");
      navigation.navigate("WorkerLogin");
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