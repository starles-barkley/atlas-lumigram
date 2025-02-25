import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Image } from "react-native";
import { useRouter } from "expo-router";

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <View style={styles.container}>
      <Image source={require('@/assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
      <Text style={styles.heading}>Register</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <Pressable style={styles.button} onPress={() => router.replace("/(tabs)")}> 
        <Text style={styles.buttonText}>Create Account</Text>
      </Pressable>
      
      <Pressable onPress={() => router.replace("/login")}>
        <Text style={styles.linkText}>Login to an existing account</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0B0D32",
  },
  logo: {
    width: '100%',
    height: 120,
    marginBottom: 30,

  },
  heading: {
    fontSize: 24,
    fontWeight: "600",
    color: "white",
    marginVertical: 20,
  },
  input: {
    width: "80%",
    color: "white",
    borderColor: "#1ED2AF",
    borderWidth: 1,
    height: 40,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  button: {
    width: "80%",
    backgroundColor: "#1ED2AF",
    padding: 10,
    alignItems: "center",
    borderRadius: 5,
    marginVertical: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  linkText: {
    color: "white",
    fontSize: 16,
    marginTop: 10,
  },
});


