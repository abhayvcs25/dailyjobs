import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { workerLogin, workerRegister } from "../api/WorAuth";

const { width } = Dimensions.get("window");

const scale = (size: number): number => (width / 375) * size;

type RootStackParamList = {
  WorkerDashboard: undefined;
  WorkerLogin: undefined;
};

type WorkerLoginNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "WorkerLogin"
>;

export default function WorkerLoginScreen() {
  const navigation = useNavigation<WorkerLoginNavigationProp>();
  
  const [activeTab, setActiveTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Login form states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form states
  const [fullName, setFullName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [skills, setSkills] = useState("");
  const [city, setCity] = useState("");
  const [stateLoc, setStateLoc] = useState("");
  const [country, setCountry] = useState("");
  const [experience, setExperience] = useState("");

  /**
   * Validate login form
   */
  const validateLoginForm = () => {
    if (!loginEmail.trim()) {
      setErrorMessage("Email is required");
      return false;
    }
    if (!loginPassword.trim()) {
      setErrorMessage("Password is required");
      return false;
    }
    if (loginPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters");
      return false;
    }
    return true;
  };

  /**
   * Validate register form
   */
  const validateRegisterForm = () => {
    if (!fullName.trim()) {
      setErrorMessage("Full name is required");
      return false;
    }
    if (!registerEmail.trim()) {
      setErrorMessage("Email is required");
      return false;
    }
    if (!registerPassword.trim()) {
      setErrorMessage("Password is required");
      return false;
    }
    if (registerPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters");
      return false;
    }
    if (!age.trim()) {
      setErrorMessage("Age is required");
      return false;
    }
    if (!gender.trim()) {
      setErrorMessage("Gender is required");
      return false;
    }
    return true;
  };

  /**
   * Handle worker login
   */
  const handleLogin = async () => {
    console.log("[WorkerLogin] Login attempt started");
    setErrorMessage("");

    if (!validateLoginForm()) {
      console.log("[WorkerLogin] Validation failed");
      return;
    }

    setLoading(true);
    try {
      console.log("[WorkerLogin] Calling workerLogin API...");
      const result = await workerLogin(loginEmail, loginPassword);

      console.log("[WorkerLogin] API response:", result);

      if (result.success) {
        console.log("[WorkerLogin] Login successful, navigating to WorkerDashboard");
        Alert.alert("Success", "Login successful! Redirecting to dashboard...");
        // Reset form
        setLoginEmail("");
        setLoginPassword("");
        // Navigate to WorkerDashboard
        navigation.replace("WorkerDashboard");
      } else {
        console.log("[WorkerLogin] Login failed:", result.message);
        setErrorMessage(result.message);
        Alert.alert("Login Failed", result.message);
      }
    } catch (error) {
      console.error("[WorkerLogin] Unexpected error:", error);
      const errorMsg = "An unexpected error occurred. Please try again.";
      setErrorMessage(errorMsg);
      Alert.alert("Error", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle worker registration
   */
  const handleRegister = async () => {
    console.log("[WorkerLogin] Register attempt started");
    setErrorMessage("");

    if (!validateRegisterForm()) {
      console.log("[WorkerLogin] Registration validation failed");
      return;
    }

    setLoading(true);
    try {
      console.log("[WorkerLogin] Calling workerRegister API...");
      const registrationData = {
        fullName,
        email: registerEmail,
        password: registerPassword,
        age: parseInt(age),
        gender,
        skills: skills.split(",").map((s) => s.trim()),
        experience: experience ? parseInt(experience) : 0,
        city,
        state: stateLoc,
        country,
      };

      console.log("[WorkerLogin] Registration data:", registrationData);
      const result = await workerRegister(registrationData);

      console.log("[WorkerLogin] Register API response:", result);

      if (result.success) {
        console.log("[WorkerLogin] Registration successful");
        Alert.alert(
          "Registration Successful",
          "Your account has been created! Please login with your credentials.",
          [
            {
              text: "OK",
              onPress: () => {
                // Reset form and switch to login tab
                setFullName("");
                setRegisterEmail("");
                setRegisterPassword("");
                setAge("");
                setGender("");
                setSkills("");
                setCity("");
                setStateLoc("");
                setCountry("");
                setExperience("");
                setActiveTab("login");
              },
            },
          ]
        );
      } else {
        console.log("[WorkerLogin] Registration failed:", result.message);
        setErrorMessage(result.message);
        Alert.alert("Registration Failed", result.message);
      }
    } catch (error) {
      console.error("[WorkerLogin] Unexpected error:", error);
      const errorMsg = "An unexpected error occurred. Please try again.";
      setErrorMessage(errorMsg);
      Alert.alert("Error", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Error Message Display */}
        {errorMessage ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity style={styles.tab} onPress={() => {
            setActiveTab("login");
            setErrorMessage("");
          }}>
            <Text style={[styles.tabText, activeTab === "login" ? styles.activeText : styles.inactiveText]}>
              Login
            </Text>
            {activeTab === "login" && <View style={styles.activeLine} />}
          </TouchableOpacity>

          <TouchableOpacity style={styles.tab} onPress={() => {
            setActiveTab("register");
            setErrorMessage("");
          }}>
            <Text style={[styles.tabText, activeTab === "register" ? styles.activeText : styles.inactiveText]}>
              Register
            </Text>
            {activeTab === "register" && <View style={styles.activeLine} />}
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
          {activeTab === "login" ? (
            <>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                placeholder="Enter your email"
                value={loginEmail}
                onChangeText={(text) => {
                  setLoginEmail(text);
                  setErrorMessage("");
                }}
                style={styles.input}
                placeholderTextColor="#9CA3AF"
                editable={!loading}
              />

              <Text style={styles.label}>Password</Text>
              <TextInput
                placeholder="Enter your password"
                value={loginPassword}
                onChangeText={(text) => {
                  setLoginPassword(text);
                  setErrorMessage("");
                }}
                secureTextEntry
                style={styles.input}
                placeholderTextColor="#9CA3AF"
                editable={!loading}
              />

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Login</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                placeholder="Enter your full name"
                value={fullName}
                onChangeText={(text) => {
                  setFullName(text);
                  setErrorMessage("");
                }}
                style={styles.input}
                editable={!loading}
              />

              <Text style={styles.label}>Email Address</Text>
              <TextInput
                placeholder="Enter your email"
                value={registerEmail}
                onChangeText={(text) => {
                  setRegisterEmail(text);
                  setErrorMessage("");
                }}
                style={styles.input}
                editable={!loading}
              />

              <Text style={styles.label}>Password</Text>
              <TextInput
                placeholder="At least 6 characters"
                value={registerPassword}
                onChangeText={(text) => {
                  setRegisterPassword(text);
                  setErrorMessage("");
                }}
                secureTextEntry
                style={styles.input}
                editable={!loading}
              />

              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Age</Text>
                  <TextInput
                    placeholder="18"
                    value={age}
                    onChangeText={(text) => {
                      setAge(text);
                      setErrorMessage("");
                    }}
                    style={styles.input}
                    keyboardType="numeric"
                    editable={!loading}
                  />
                </View>

                <View style={{ flex: 1, marginLeft: scale(10) }}>
                  <Text style={styles.label}>Gender</Text>
                  <TextInput
                    placeholder="Male/Female"
                    value={gender}
                    onChangeText={(text) => {
                      setGender(text);
                      setErrorMessage("");
                    }}
                    style={styles.input}
                    editable={!loading}
                  />
                </View>
              </View>

              <Text style={styles.label}>Skills</Text>
              <TextInput
                placeholder="Plumbing, Electrical..."
                value={skills}
                onChangeText={(text) => {
                  setSkills(text);
                  setErrorMessage("");
                }}
                style={styles.input}
                editable={!loading}
              />

              <Text style={styles.label}>Location</Text>
              <TextInput
                placeholder="City"
                value={city}
                onChangeText={(text) => {
                  setCity(text);
                  setErrorMessage("");
                }}
                style={styles.input}
                editable={!loading}
              />
              <TextInput
                placeholder="State"
                value={stateLoc}
                onChangeText={(text) => {
                  setStateLoc(text);
                  setErrorMessage("");
                }}
                style={styles.input}
                editable={!loading}
              />
              <TextInput
                placeholder="Country"
                value={country}
                onChangeText={(text) => {
                  setCountry(text);
                  setErrorMessage("");
                }}
                style={styles.input}
                editable={!loading}
              />

              <Text style={styles.label}>Experience (years)</Text>
              <TextInput
                placeholder="0"
                value={experience}
                onChangeText={(text) => {
                  setExperience(text);
                  setErrorMessage("");
                }}
                style={styles.input}
                keyboardType="numeric"
                editable={!loading}
              />

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleRegister}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Register</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    padding: scale(16),
  },

  card: {
    width: "100%",
  },

  errorContainer: {
    backgroundColor: "#FEE2E2",
    borderRadius: scale(8),
    padding: scale(12),
    marginBottom: scale(12),
    borderLeftWidth: 4,
    borderLeftColor: "#DC2626",
  },

  errorText: {
    color: "#DC2626",
    fontSize: scale(14),
    fontWeight: "500",
  },

  tabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
  },

  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: scale(16),
  },

  tabText: {
    fontWeight: "600",
    fontSize: scale(14),
  },

  activeText: {
    color: "#007AFF",
  },

  inactiveText: {
    color: "#9CA3AF",
  },

  activeLine: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: scale(3),
    backgroundColor: "#007AFF",
  },

  form: {
    padding: scale(20),
  },

  label: {
    fontSize: scale(14),
    fontWeight: "600",
    marginBottom: scale(6),
    color: "#111827",
  },

  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: scale(10),
    padding: scale(12),
    marginBottom: scale(16),
  },

  row: {
    flexDirection: "row",
  },

  button: {
    backgroundColor: "#007AFF",
    padding: scale(14),
    borderRadius: scale(10),
    alignItems: "center",
    marginTop: scale(10),
  },

  buttonDisabled: {
    backgroundColor: "#B0C4DE",
    opacity: 0.6,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: scale(14),
  },
});