import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Home" }} />
      <Stack.Screen name="identify" options={{ title: "Identify Breed" }} />
      <Stack.Screen name="details" options={{ title: "Breed Info" }} />
    </Stack>
  );
}