import { Ionicons } from "@expo/vector-icons";
import { Pressable, Alert } from "react-native";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { auth } from "../firebaseConfig"; // Ensure correct import path

export function LogoutComponent() {
  const router = useRouter();

  async function logout() {
    try {
      await signOut(auth);
      router.replace("/login");
    } catch (error: any) {
      Alert.alert("Logout Failed", error.message);
    }
  }

  return (
    <Pressable onPress={logout}>
      <Ionicons name="log-out-outline" size={24} style={{ marginRight: 16 }} />
    </Pressable>
  );
}
