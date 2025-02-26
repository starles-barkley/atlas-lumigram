import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  Alert,
  StyleSheet,
  Dimensions,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { homeFeed } from "../../placeholder";
import {
  GestureHandlerRootView,
  TapGestureHandler,
  LongPressGestureHandler,
  State,
} from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";


const { width, height } = Dimensions.get("window");

interface ImageItem {
  id: string;
  image: string;
  caption: string;
}

export default function HomeTab() {
  const [visibleCaption, setVisibleCaption] = useState<string | null>(null);

  const handleLongPress = (event: any, id: string) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      console.log("Long Press Activated for ID:", id);
      setVisibleCaption(id);
      console.log("Updated visibleCaption:", id);
      setTimeout(() => {
        console.log("Caption cleared for ID:", id);
        setVisibleCaption(null);
      }, 2000);
    }
  };  

  const handleDoubleTap = (event: any) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      Alert.alert("Image Favorited", "This image has been added to your favorites.");
    }
  };

  const renderItem = ({ item }: { item: ImageItem }) => (
    <LongPressGestureHandler
      onHandlerStateChange={(event) => handleLongPress(event, item.id)}
      minDurationMs={500}
    >
      <TapGestureHandler
        onHandlerStateChange={handleDoubleTap}
        numberOfTaps={2}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.image }} style={styles.image} />
          {visibleCaption === item.id && (
            <View style={styles.captionContainer}>
              <Text style={styles.caption}>{item.caption}</Text>
            </View>
          )}
        </View>
      </TapGestureHandler>
    </LongPressGestureHandler>
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      <FlashList
        data={homeFeed}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        estimatedItemSize={height * 0.5}
        extraData={visibleCaption}
      />

    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingTop: 20,
    paddingHorizontal: 10,
  },
  imageContainer: {
    marginBottom: 20,
    alignItems: "center",
    position: "relative",
  },
  image: {
    width: width,
    height: height * 0.5,
    resizeMode: "cover",
    borderRadius: 10,
  },
  captionContainer: {
    position: "absolute",
    bottom: 10,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 8,
    borderRadius: 5,
  },
  caption: {
    color: "white",
    fontSize: 14,
    textAlign: "center",
  },
});
