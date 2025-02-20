import LottieView from "lottie-react-native";
import React, { useRef } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export default function Loading() {
  const animation = useRef<LottieView>(null);
  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        {
          backgroundColor: "#00003C",
          zIndex: 1,
          justifyContent: "center",
        },
      ]}
    >
      <LottieView
        autoPlay
        ref={animation}
        style={{
          width: 400,
          height: 400,
          backgroundColor: "transparent",
        }}
        source={require("../assets/lumi.json")}
      />
    </View>
  );
}
