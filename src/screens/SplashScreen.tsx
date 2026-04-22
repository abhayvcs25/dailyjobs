import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SplashScreen({ navigation }: any) {

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check for tokens and role identifiers
        const token = await AsyncStorage.getItem("token");
        const userId = await AsyncStorage.getItem("userId");
        const workerId = await AsyncStorage.getItem("workerId");

        // If worker ID exists (worker logged in), go to WorkerDashboard
        // Worker login stores workerId in AsyncStorage
        if (token && workerId) {
          navigation.replace("WorkerDashboard");
        }
        // If customer userId exists (customer logged in), go to CustDashboard
        // Customer login stores userId in AsyncStorage
        else if (token && userId) {
          navigation.replace("CustDashboard");
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