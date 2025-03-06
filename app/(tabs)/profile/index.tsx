import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { auth, db } from "../../../firebaseConfig";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";

const { width } = Dimensions.get("window");

export default function ProfilePage() {
  const router = useRouter();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [newUsername, setNewUsername] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userPosts, setUserPosts] = useState<any[]>([]);

  useEffect(() => {
    async function fetchUserProfile() {
      if (!auth.currentUser) return;

      const userRef = doc(db, "users", auth.currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        setUsername(userData.username || "");
        setProfileImage(userData.profileImage || null);
      }
      setLoading(false);
    }

    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (!auth.currentUser) return;

    const postsRef = collection(db, "posts");
    const postsQuery = query(postsRef, where("createdBy", "==", auth.currentUser.uid));

    const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
      const posts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUserPosts(posts);
    });

    return () => unsubscribe();
  }, []);

  const handleSaveUsername = async () => {
    if (!auth.currentUser || newUsername.trim() === "") return;

    setSaving(true);
    const userRef = doc(db, "users", auth.currentUser.uid);
    await setDoc(userRef, { username: newUsername }, { merge: true });

    setUsername(newUsername);
    setIsEditing(false);
    setSaving(false);
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#1ED2AF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Profile Image (Clickable for Edit) */}
      <TouchableOpacity onPress={handlePickImage}>
        <Image
          source={
            profileImage
              ? { uri: profileImage }
              : require("../../../assets/images/default-profile.png")
          }
          style={styles.profileImage}
        />
      </TouchableOpacity>

      {/* Username Display & Edit */}
      {isEditing ? (
        <View style={styles.usernameContainer}>
          <TextInput
            style={styles.usernameInput}
            value={newUsername}
            onChangeText={setNewUsername}
            placeholder="Enter username"
            autoFocus
          />
          <TouchableOpacity onPress={handleSaveUsername} style={styles.saveButton}>
            {saving ? <ActivityIndicator size="small" color="white" /> : <Text style={styles.saveButtonText}>Save</Text>}
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity onPress={() => setIsEditing(true)}>
          <Text style={styles.username}>{username || "Set Username"}</Text>
        </TouchableOpacity>
      )}

      {/* User Posts Grid - Ensure FlashList Parent has flex: 1 */}
      <View style={styles.postsContainer}>
        <FlashList
          data={userPosts}
          renderItem={({ item }) => (
            <View style={styles.postContainer}>
              <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
            </View>
          )}
          keyExtractor={(item) => item.id}
          estimatedItemSize={width / 3} // Ensures correct layout estimation
          numColumns={3} // Enforce three columns
          contentContainerStyle={{ paddingBottom: 20 }} // Ensure padding at bottom
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // ✅ FIX: Ensures parent container has height
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
  usernameContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  usernameInput: {
    borderBottomWidth: 1,
    borderBottomColor: "#1ED2AF",
    padding: 5,
    width: 150,
    fontSize: 16,
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: "#1ED2AF",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  saveButtonText: {
    color: "white",
    fontSize: 14,
  },
  username: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  postsContainer: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 5,
  },
  postContainer: {
    width: width / 3 - 6,
    height: width / 3 - 6,
    margin: 3,
    overflow: "hidden",
  },
  postImage: {
    width: "100%",
    height: "100%",
    borderRadius: 5,
    resizeMode: "cover",
  },
});
