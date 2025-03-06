import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  RefreshControl,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { db } from "../../../firebaseConfig";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";

interface PostItem {
  id: string;
  imageUrl: string;
  caption: string;
}

export default function OtherUserProfile() {
  const { id } = useLocalSearchParams();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchUserProfile();
    fetchUserPosts();
  }, [id]);

  const fetchUserProfile = async () => {
    try {
      const userRef = doc(db, "users", id as string);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setProfileImage(userSnap.data().profileImage || null);
        setUsername(userSnap.data().username || "Unknown User");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const postsQuery = query(
        collection(db, "posts"),
        where("userId", "==", id as string)
      );
      const querySnapshot = await getDocs(postsQuery);
      const userPosts = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as PostItem[];
      setPosts(userPosts);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUserProfile();
    fetchUserPosts().then(() => setRefreshing(false));
  }, [id]);

  return (
    <View style={styles.container}>
      <Image
        source={
          profileImage
            ? { uri: profileImage }
            : require("../../../assets/images/default-profile.png")
        }
        style={styles.profileImage}
      />
      <Text style={styles.username}>{username}</Text>

      <FlatList
        data={posts}
        renderItem={({ item }) => (
          <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
        )}
        keyExtractor={(item) => item.id}
        numColumns={3}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    paddingTop: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  username: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  postImage: {
    width: 120,
    height: 120,
    margin: 2,
    borderRadius: 10,
  },
});
