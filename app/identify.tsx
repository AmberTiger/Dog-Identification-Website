import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator, 
  FlatList 
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { identifyDogFromImage } from "./services/imageService";

export default function IdentifyScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const pickImage = async (useCamera: boolean) => {
    const permissionResult = useCamera 
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("Permission required!");
      return;
    }

    const pickerResult = useCamera 
      ? await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.7 })
      : await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, quality: 0.7 });

    if (!pickerResult.canceled) {
      const uri = pickerResult.assets[0].uri;
      setImage(uri);
      handleIdentify(uri);
    }
  };

  const handleIdentify = async (uri: string) => {
    setLoading(true);
    setResult(null);
    try {
      const data = await identifyDogFromImage(uri);
      setResult(data);
    } catch (error) {
      alert("Identification failed.");
    } finally {
      setLoading(false);
    }
  };

  const renderDetail = (label: string, value: string | undefined) => {
    if (!value) return null;
    return (
      <View style={styles.detailItem}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    );
  };

  const ListHeader = () => (
    <>
      <View style={styles.imagePreviewContainer}>
  {image ? (
    <Image 
      source={{ uri: image }} 
      style={styles.previewImage} 
      resizeMode="contain" // This is the key change
    />
  ) : (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderText}>NO IMAGE SELECTED</Text>
    </View>
  )}
</View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.actionButton} onPress={() => pickImage(true)}>
          <Text style={styles.buttonText}>USE CAMERA</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => pickImage(false)}>
          <Text style={styles.buttonText}>GALLERY</Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#000" size="large" />
          <Text style={styles.loadingText}>ANALYZING BREED...</Text>
        </View>
      )}
      
      {result && result.breeds?.length > 0 && (
        <Text style={styles.resultHeader}>ANALYSIS RESULTS</Text>
      )}
    </>
  );

  return (
    <FlatList
      data={result?.breeds || []}
      keyExtractor={(item, index) => index.toString()}
      contentContainerStyle={styles.container}
      ListHeaderComponent={ListHeader}
      renderItem={({ item }) => (
        <View style={styles.card}>
          {/* Header Info - Image circle removed */}
          <View style={styles.cardHeader}>
            <View style={styles.headerText}>
              <Text style={styles.breedName}>{item.name.toUpperCase()}</Text>
              <Text style={styles.breedGroup}>{item.breed_group || "GENERAL BREED"}</Text>
            </View>
          </View>

          <View style={styles.detailsContainer}>
            <View style={styles.divider} />
            
            <View style={styles.infoRow}>
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Life Span</Text>
                <Text style={styles.infoValue}>{item.life_span}</Text>
              </View>
              {item.weight?.metric && (
                <View style={styles.infoBox}>
                  <Text style={styles.infoLabel}>Weight</Text>
                  <Text style={styles.infoValue}>{item.weight.metric} kg</Text>
                </View>
              )}
            </View>

            {renderDetail("Temperament", item.temperament)}
            {renderDetail("Origin", item.origin)}
            {renderDetail("History", item.history)}
          </View>
        </View>
      )}
      ListEmptyComponent={() => 
        result && result.breeds?.length === 0 ? (
          <Text style={styles.noMatchText}>NO BREED DETECTED. TRY AGAIN.</Text>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#FFF", flexGrow: 1 },
  imagePreviewContainer: { width: "100%", height: 500, backgroundColor: "#F2F2F7", borderRadius: 8, marginBottom: 20, overflow: 'hidden' },
  previewImage: { width: "100%", height: "100%" },
  placeholder: { flex: 1, justifyContent: "center", alignItems: "center" },
  placeholderText: { color: "#A1A1A1", fontWeight: "800", fontSize: 12 },
  buttonRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  actionButton: { flex: 1, backgroundColor: "#000", padding: 15, borderRadius: 8, alignItems: "center" },
  buttonText: { color: "#FFF", fontWeight: "800", fontSize: 12 },
  loadingContainer: { alignItems: "center", marginVertical: 20 },
  loadingText: { marginTop: 10, fontWeight: "700" },
  resultHeader: { fontWeight: "900", fontSize: 14, marginBottom: 15, letterSpacing: 1 },
  
  card: { 
    backgroundColor: "#F2F2F7", 
    borderRadius: 8, 
    marginBottom: 15, 
    padding: 20,
    borderLeftWidth: 6,
    borderLeftColor: "#000"
  },
  cardHeader: { marginBottom: 5 },
  headerText: { width: "100%" },
  breedName: { fontSize: 20, fontWeight: "900", letterSpacing: 0.5 },
  breedGroup: { fontSize: 12, color: "#666", fontWeight: "700", marginTop: 2 },
  
  detailsContainer: { marginTop: 5 },
  divider: { height: 1, backgroundColor: "#E5E5EA", marginVertical: 15 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 15 },
  infoBox: { flex: 1 },
  infoLabel: { fontSize: 10, fontWeight: "800", color: "#A1A1A1", textTransform: 'uppercase', marginBottom: 2 },
  infoValue: { fontSize: 14, fontWeight: "700", color: "#333" },
  detailItem: { marginBottom: 12 },
  detailValue: { fontSize: 14, color: "#444", lineHeight: 20 },
  noMatchText: { textAlign: "center", color: "#666", marginTop: 20, fontWeight: "600" }
});