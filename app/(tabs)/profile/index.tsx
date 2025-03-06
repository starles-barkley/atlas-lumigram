import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { auth, db } from "../../../firebaseConfig";

const { width } = Dimensions.get("window");

export default function ProfilePage() {
  const router = useRouter();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [userPosts, setUserPosts] = useState<any[]>([]);

  useEffect(() => {
    if (!auth.currentUser) return;

    // Get user profile info
    const userRef = collection(db, "users");
    const userQuery = query(userRef, where("uid", "==", auth.currentUser.uid));

    const unsubscribeUser = onSnapshot(userQuery, (snapshot) => {
      if (!snapshot.empty) {
        const userData = snapshot.docs[0].data();
        setUsername(userData.username || "No Username");
        setProfileImage(userData.profileImage || null);
      }
    });

    // Get user posts
    const postsRef = collection(db, "posts");
    const postsQuery = query(postsRef, where("userId", "==", auth.currentUser.uid));

    const unsubscribePosts = onSnapshot(postsQuery, (snapshot) => {
      const posts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUserPosts(posts);
    });

    return () => {
      unsubscribeUser();
      unsubscribePosts();
    };
  }, []);

  return (
    <View style={styles.container}>
      {/* Profile Info */}
      <TouchableOpacity onPress={() => router.push("/profile/edit")}>
        <Image
          source={
            profileImage
              ? { uri: profileImage }
              : require("../../../assets/images/default-profile.png")
          }
          style={styles.profileImage}
        />
      </TouchableOpacity>
      <Text style={styles.username}>{username || "Loading..."}</Text>

      {/* User Posts Grid */}
      <FlatList
        data={userPosts}
        keyExtractor={(item) => item.id}
        numColumns={3}
        renderItem={({ item }) => (
          <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
        )}
        contentContainerStyle={styles.gridContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 20,
    backgroundColor: "white",
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
  gridContainer: {
    paddingHorizontal: 5,
  },
  postImage: {
    width: width / 3 - 10,
    height: width / 3 - 10,
    margin: 5,
    borderRadius: 5,
  },
});
