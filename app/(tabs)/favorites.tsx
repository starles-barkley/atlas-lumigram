import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  Alert,
  StyleSheet,
  Dimensions,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  doc,
  deleteField,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";
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
  imageUrl: string;
  caption: string;
  createdAt?: { seconds: number }; // ✅ Ensure Firestore timestamp compatibility
}

export default function Page() {
  const [visibleCaption, setVisibleCaption] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<ImageItem[]>([]);

  useEffect(() => {
    if (!auth.currentUser) return;

    const userFavoritesRef = doc(db, "favorites", auth.currentUser.uid);
    const unsubscribe = onSnapshot(userFavoritesRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const favoritesData = docSnapshot.data();
        const favoritesList = Object.values(favoritesData) as ImageItem[];

        // ✅ Sort by createdAt (newest first)
        const sortedFavorites = favoritesList.sort(
          (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
        );

        setFavorites(sortedFavorites);
      } else {
        setFavorites([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLongPress = (event: any, id: string) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setVisibleCaption(id);
      setTimeout(() => setVisibleCaption(null), 2000);
    }
  };

  const handleDoubleTap = async (event: any, item: ImageItem) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      if (!auth.currentUser) {
        Alert.alert("Error", "You need to be logged in to remove favorites.");
        return;
      }

      try {
        const userFavoritesRef = doc(db, "favorites", auth.currentUser.uid);
        await updateDoc(userFavoritesRef, {
          [item.id]: deleteField(),
        });

        Alert.alert("Image Removed", "This image has been removed from your favorites.");
      } catch (error) {
        Alert.alert("Error", "Failed to remove the image. Please try again.");
        console.error("Error removing favorite image:", error);
      }
    }
  };

  const renderItem = ({ item }: { item: ImageItem }) => (
    <LongPressGestureHandler
      onHandlerStateChange={(event) => handleLongPress(event, item.id)}
      minDurationMs={500}
    >
      <TapGestureHandler
        onHandlerStateChange={(event) => handleDoubleTap(event, item)}
        numberOfTaps={2}
      >
        <View style={styles.imageContainer}>
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={styles.image} />
          ) : (
            <Text style={styles.errorText}>Image Not Found</Text>
          )}
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
        data={favorites}
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
  errorText: {
    color: "red",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 20,
  },
});
