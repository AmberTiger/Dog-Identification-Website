import { Text, View, StyleSheet } from "react-native";
import { Link } from "expo-router";

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dog Breed Identifier</Text>
      
      {/* Button to identify.tsx */}
      <Link href="/identify" style={[styles.button, { backgroundColor: '#4CAF50', marginBottom: 15 }]}>
        <Text style={{ color: 'white', fontWeight: 'bold' }}>Identify Breed from Photo</Text>
      </Link>

      {/* Button to details.tsx */}
      <Link href="/details" style={styles.button}>
        <Text style={{ color: 'white', fontWeight: 'bold' }}>Go to Breed Details</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 30 },
  button: { 
    paddingHorizontal: 25, 
    paddingVertical: 15, 
    backgroundColor: '#2196F3', 
    borderRadius: 8,
    width: 250,
    textAlign: 'center'
  }
});