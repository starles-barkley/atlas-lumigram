import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Image,
  Alert,
  StyleSheet,
  Dimensions,
  RefreshControl,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  onSnapshot,
  doc,
  setDoc,
  QueryDocumentSnapshot,
  DocumentData,
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
const PAGE_SIZE = 5;

interface ImageItem {
  id: string;
  imageUrl: string;
  caption: string;
}

export default function Page() {
  const [visibleCaption, setVisibleCaption] = useState<string | null>(null);
  const [posts, setPosts] = useState<ImageItem[]>([]);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPosts = async (loadMore = false) => {
    if (loading) return;
    setLoading(true);

    try {
      let q = query(
        collection(db, "posts"),
        orderBy("createdAt", "desc"),
        limit(PAGE_SIZE)
      );
      
      if (loadMore && lastVisible) {
        q = query(
          collection(db, "posts"),
          orderBy("createdAt", "desc"),
          startAfter(lastVisible),
          limit(PAGE_SIZE)
        );
      }

      const snapshot = await getDocs(q);
      const newPosts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ImageItem[];

      setPosts((prevPosts) => loadMore ? [...prevPosts, ...newPosts] : newPosts);
      setLastVisible(snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPosts().then(() => setRefreshing(false));
  }, []);

  const handleLoadMore = () => {
    if (lastVisible) {
      fetchPosts(true);
    }
  };

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
        Alert.alert("Error", "You need to be logged in to favorite images.");
        return;
      }

      try {
        const userFavoritesRef = doc(db, "favorites", auth.currentUser.uid);
        await setDoc(userFavoritesRef, {
          [item.id]: item,
        }, { merge: true });

        Alert.alert("Image Favorited", "This image has been added to your favorites.");
      } catch (error) {
        Alert.alert("Error", "Failed to favorite the image. Please try again.");
        console.error("Error favoriting image:", error);
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
          <Image source={{ uri: item.imageUrl }} style={styles.image} />
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
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        estimatedItemSize={height * 0.5}
        extraData={visibleCaption}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
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