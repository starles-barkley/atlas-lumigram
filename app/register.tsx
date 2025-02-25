import { Text, View, } from "react-native"
import { Link } from "expo-router"

export default function Page() {
  return (
    <View style={{flex: 1, alignItems: "center", justifyContent: "center"}}>
      <Text>Register</Text>
      <Link href="/login" replace>
        <Text>Log into existing account</Text>
      </Link>
    </View>
  )
}