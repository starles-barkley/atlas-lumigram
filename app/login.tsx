import { Pressable, Text, View } from "react-native"
import { Link, useRouter } from "expo-router"

export default function Page() {
    const router = useRouter();
  return (
    <View style={{flex: 1, alignItems: "center", justifyContent: "center"}}>
      <Text>Login</Text>
      <Link href="/register" replace>
        <Text>Create a new account</Text>
      </Link>

      <Pressable onPress={() => {router.replace("/(tabs)")}}>
        <Text>Sign In</Text>
      </Pressable>
    </View>
  )
}