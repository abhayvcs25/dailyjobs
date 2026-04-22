import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SplashScreen({ navigation }: any) {

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check for both customer and worker tokens
        const customerToken = await AsyncStorage.getItem("token");
        const workerToken = await AsyncStorage.getItem("token"); // Both use same token key, but we can differentiate by role
        const userId = await AsyncStorage.getItem("userId");
        const workerId = await AsyncStorage.getItem("workerId");

        // If customer token exists, go to CustDashboard
        if (customerToken && userId) {
          navigation.replace("CustDashboard");
        }
        // If worker token exists, go to WorkerDashboard
        else if (customerToken && workerId) {
          navigation.replace("WorkerDashboard");
        }
        // Otherwise go to Home for user to choose
        else {
          navigation.replace("Home");
        }
      } catch (error) {
        console.error("Auth check error:", error);
        navigation.replace("Home");
      }
    };

    // Small delay for UX
    setTimeout(() => {
      checkAuth();
    }, 1000);
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}