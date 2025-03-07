import { useState, useEffect } from "react";
import { View, StyleSheet, Image, TextInput, ActivityIndicator, Alert, TouchableOpacity, Text } from "react-native";
import { useImagePicker } from "../../hooks/useImagePicker";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { auth } from "../../firebaseConfig";
import { useRouter } from "expo-router";

const storage = getStorage();
const db = getFirestore();

export default function Page() {
  const [caption, setCaption] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { image, openImagePicker, reset } = useImagePicker();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "This app needs access to your photos to upload images.",
          [
            {
              text: "OK",
              onPress: () => {},
            },
          ]
        );
      }
      setHasPermission(status === "granted");
    })();
  }, []);

  const uploadImage = async (uri: string) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const storageRef = ref(storage, `posts/${auth.currentUser?.uid}/${Date.now()}`);
      await uploadBytes(storageRef, blob);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error("Image upload failed:", error);
      throw error;
    }
  };

  const handleAddPost = async () => {
    if (!image) {
      Alert.alert("Error", "Please select an image before posting.");
      return;
    }
    if (!caption.trim()) {
      Alert.alert("Error", "Please enter a caption before posting.");
      return;
    }
  
    setLoading(true);
    try {
      const imageUrl = await uploadImage(image);
      await addDoc(collection(db, "posts"), {
        imageUrl,
        caption,
        createdAt: serverTimestamp(),
        createdBy: auth.currentUser?.uid,
      });
  
      Alert.alert("Success", "Your post has been added.", [
        {
          text: "OK",
          onPress: () => {
            setLoading(false);
            reset(); // Reset image picker
            setCaption(""); // Clear caption
            router.replace("/(tabs)"); // Navigate to home tab
          },
        },
      ]);
    } catch (error) {
      setLoading(false);
      Alert.alert("Upload Failed", "There was an error uploading your post.");
    }
  };  

  return (
    <View style={styles.container}>
      {image ? (
        <Image source={{ uri: image }} style={styles.image} />
      ) : (
        <View style={styles.placeholderContainer}>
          <View style={styles.placeholderImage}>
            <MaterialIcons name="add-a-photo" size={32} color="#ccc" />
          </View>
          <TouchableOpacity style={styles.choosePhotoButton} onPress={openImagePicker}>
            <MaterialIcons name="photo" size={20} color="white" />
            <Text style={styles.choosePhotoText}> Choose a photo</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {image && (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Add a caption"
            value={caption}
            onChangeText={setCaption}
            placeholderTextColor="#888"
          />
          <TouchableOpacity style={styles.saveButton} onPress={handleAddPost} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? "Uploading..." : "Save Post"}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.resetButton} onPress={reset}>
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {loading && <ActivityIndicator size="large" color="#0000ff" />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F8F8F8",
  },
  placeholderContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  placeholderImage: {
    width: 300,
    height: 200,
    backgroundColor: "#EAEAEA",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  choosePhotoButton: {
    flexDirection: "row",
    backgroundColor: "#1ED2AF",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 15,
  },
  choosePhotoText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  image: {
    width: 300,
    height: 300,
    borderRadius: 10,
    marginBottom: 20,
  },
  inputContainer: {
    width: "100%",
    paddingHorizontal: 20,
    marginTop: 10,
    alignItems: "center",
  },
  input: {
    height: 50,
    borderColor: "#1ED2AF",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    width: "100%",
    backgroundColor: "white",
    fontSize: 16,
    marginBottom: 15,
  },
  saveButton: {
    width: "100%",
    backgroundColor: "#1ED2AF",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  resetButton: {
    alignItems: "center",
    paddingVertical: 10,
  },
  resetText: {
    color: "black",
    fontSize: 16,
  },
});
