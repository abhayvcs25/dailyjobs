import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import SplashScreen from "../screens/SplashScreen";
import AuthScreen from "../screens/AuthScreen";
import HomeScreen from "../screens/HomeScreen";
import CustDashboard from "../screens/CustDashboard";
import WorkerLogin from "../screens/WorkerLogin";
import WorkerDashboard from "../screens/WorkerDashboard";
import SearchScreen from "../screens/SearchScreen";

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash">

        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Auth"
          component={AuthScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />

        {/* ✅ ADD THIS */}
        <Stack.Screen
          name="CustDashboard"
          component={CustDashboard}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="WorkerLogin"
          component={WorkerLogin}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="WorkerDashboard"
          component={WorkerDashboard}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Search"
          component={SearchScreen}
          options={{ headerShown: false }}
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;