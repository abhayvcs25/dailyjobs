import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { loginUser, registerUser } from "../api/auth";

export default function AuthScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [fullName, setFullName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [location, setLocation] = useState("");

  const [loading, setLoading] = useState(false);

  // 🔐 LOGIN
  const handleLogin = async () => {
  if (!email || !password) {
    Alert.alert("Error", "Email and Password required");
    return;
  }

  try {
    setLoading(true);

    const data = await loginUser({ email, password });

    console.log("✅ Login success:", data);

    // ✅ extract token safely
    const token = data?.token || data?.data?.token;

    if (!token) {
      throw new Error("Token not received from server");
    }

    // ✅ store token
    await AsyncStorage.setItem("token", token);

    Alert.alert("Success", "Login successful");

    // ✅ redirect to dashboard (clean stack)
    navigation.reset({
      index: 0,
      routes: [{ name: "CustDashboard" }],
    });

  } catch (error: any) {
    const message =
      error.response?.data?.message || error.message || "Login failed";

    Alert.alert("Login Failed", message);
  } finally {
    setLoading(false);
  }
};

  // 📝 REGISTER
  const handleRegister = async () => {
  if (!fullName || !registerEmail || !registerPassword) {
    Alert.alert("Error", "Required fields missing");
    return;
  }

  try {
    setLoading(true);

    const data = await registerUser({
      fullName: fullName,
      email: registerEmail,
      password: registerPassword,
      companyName: companyName,
      phone: phoneNumber,
      location: location,
    });

    console.log("✅ Register success:", data);

    Alert.alert(
      "Success",
      "Account created successfully. Please login."
    );

    // Clear register form (important UX)
    setFullName("");
    setRegisterEmail("");
    setRegisterPassword("");
    setCompanyName("");
    setPhoneNumber("");
    setLocation("");

    // Switch to login tab
    setActiveTab("login");

  } catch (error: any) {
    const message =
      error.response?.data?.message || error.message || "Register failed";

    Alert.alert("Register Failed", message);
  } finally {
    setLoading(false);
  }
};

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>DailyJobs</Text>
          <Text style={styles.subtitle}>Customer Portal</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "login" ? styles.activeTab : styles.inactiveTab,
            ]}
            onPress={() => setActiveTab("login")}
          >
            <Text
              style={
                activeTab === "login"
                  ? styles.activeText
                  : styles.inactiveText
              }
            >
              Login
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "register"
                ? styles.activeTab
                : styles.inactiveTab,
            ]}
            onPress={() => setActiveTab("register")}
          >
            <Text
              style={
                activeTab === "register"
                  ? styles.activeText
                  : styles.inactiveText
              }
            >
              Register
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {activeTab === "login" ? (
            <>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="your@email.com"
                value={email}
                onChangeText={setEmail}
              />

              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />

              <TouchableOpacity
                style={styles.button}
                onPress={handleLogin}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? "Logging in..." : "Login"}
                </Text>
              </TouchableOpacity>

              <Text style={styles.switchText}>
                Don't have an account?{" "}
                <Text
                  style={styles.link}
                  onPress={() => setActiveTab("register")}
                >
                  Register
                </Text>
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
              />

              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={registerEmail}
                onChangeText={setRegisterEmail}
              />

              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                secureTextEntry
                value={registerPassword}
                onChangeText={setRegisterPassword}
              />

              <Text style={styles.label}>Company / Individual Name</Text>
              <TextInput
                style={styles.input}
                value={companyName}
                onChangeText={setCompanyName}
              />

              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
              />

              <Text style={styles.label}>Location</Text>
              <TextInput
                style={styles.input}
                value={location}
                onChangeText={setLocation}
              />

              <TouchableOpacity
                style={styles.button}
                onPress={handleRegister}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? "Registering..." : "Register"}
                </Text>
              </TouchableOpacity>

              <Text style={styles.switchText}>
                Already have an account?{" "}
                <Text
                  style={styles.link}
                  onPress={() => setActiveTab("login")}
                >
                  Login
                </Text>
              </Text>
            </>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    padding: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
    elevation: 5,
  },
  header: {
    backgroundColor: "#2563eb",
    padding: 24,
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
  },
  subtitle: {
    color: "#dbeafe",
    marginTop: 4,
  },
  tabs: {
    flexDirection: "row",
    marginTop: 15,
  },
  tab: {
    flex: 1,
    padding: 12,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "#2563eb",
  },
  inactiveTab: {
    backgroundColor: "#e5e7eb",
  },
  activeText: {
    color: "#fff",
    fontWeight: "600",
  },
  inactiveText: {
    color: "#374151",
  },
  form: {
    padding: 16,
  },
  label: {
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 10,
    color: "#1f2937",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    color: "#374151",
  },
  button: {
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  switchText: {
    textAlign: "center",
    marginTop: 12,
    color: "#6b7280",
  },
  link: {
    color: "#2563eb",
    fontWeight: "600",
  },
});