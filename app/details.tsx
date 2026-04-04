import React, { useEffect, useState, useMemo } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  ScrollView,
  TextInput,
  LayoutAnimation,
  Platform,
  UIManager
} from "react-native";
import { fetchAllBreeds } from "./services/dogService";

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface DogBreed {
  id: string | number;
  name: string;
  breed_group?: string;
  temperament?: string;
  life_span?: string;
  origin?: string;
  history?: string;
  weight: { metric: string; imperial: string };
  height: { metric: string; imperial: string };
  image?: { url: string };
}

const CATEGORIES = ["All", "Toy", "Hound", "Terrier", "Working", "Sporting", "Non-Sporting", "Herding"];

export default function Index() {
  const [breeds, setBreeds] = useState<DogBreed[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchText, setSearchText] = useState("");
  const [expandedId, setExpandedId] = useState<string | number | null>(null);

  useEffect(() => {
    async function loadBreeds() {
      const data = await fetchAllBreeds();
      setBreeds(data);
      setLoading(false);
    }
    loadBreeds();
  }, []);

  const toggleExpand = (id: string | number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  // FIXED FILTER LOGIC
  const filteredBreeds = useMemo(() => {
    return breeds.filter(item => {
      const breedGroup = item.breed_group?.toLowerCase() || "";
      const selected = selectedCategory.toLowerCase();
      
      // Exact check for Sporting vs Non-Sporting
      const matchesCategory = selected === "all" 
        ? true 
        : selected === "sporting" 
          ? breedGroup === "sporting" // Strict equality
          : breedGroup.includes(selected);
      
      const matchesSearch = item.name.toLowerCase().includes(searchText.toLowerCase()) ||
        breedGroup.includes(searchText.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [breeds, selectedCategory, searchText]);

  const renderDetail = (label: string, value?: string) => {
    if (!value) return null;
    return (
      <View style={styles.detailItem}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    );
  };

  if (loading) return <ActivityIndicator size="large" color="#007AFF" style={styles.center} />;

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Dog Breeds</Text>
        <TextInput
          style={styles.searchBar}
          placeholder="Search by breed name..."
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={setSearchText}
          clearButtonMode="while-editing"
        />
      </View>

      <View style={styles.filterWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContainer}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.chip, selectedCategory === cat && styles.chipActive]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[styles.chipText, selectedCategory === cat && styles.chipTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredBreeds}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listPadding}
        renderItem={({ item }) => {
          const isExpanded = expandedId === item.id;
          return (
            <View style={[styles.card, isExpanded && styles.cardExpanded]}>
              <TouchableOpacity style={styles.cardHeader} onPress={() => toggleExpand(item.id)} activeOpacity={0.7}>
                <Image source={{ uri: item.image?.url }} style={styles.thumbnail} />
                <View style={styles.headerText}>
                  <Text style={styles.breedName}>{item.name}</Text>
                  <Text style={styles.breedGroup}>{item.breed_group || "General Breed"}</Text>
                </View>
                <Text style={styles.expandArrow}>{isExpanded ? "▲" : "▼"}</Text>
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.detailsContainer}>
                  <View style={styles.divider} />
                  
                  <View style={styles.infoRow}>
                    <View style={styles.infoBox}>
                      <Text style={styles.infoLabel}>Life Span</Text>
                      <Text style={styles.infoValue}>{item.life_span} yrs</Text>
                    </View>
                    <View style={styles.infoBox}>
                      <Text style={styles.infoLabel}>Weight</Text>
                      <Text style={styles.infoValue}>{item.weight.metric} kg</Text>
                    </View>
                  </View>

                  {renderDetail("Temperament", item.temperament)}
                  {renderDetail("Origin", item.origin)}
                  {renderDetail("History", item.history)}
                </View>
              )}
            </View>
          );
        }}
        ListEmptyComponent={<Text style={styles.emptyText}>No breeds found.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f2f7" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerContainer: { backgroundColor: "#fff", paddingHorizontal: 20, paddingTop: 20, paddingBottom: 15 },
  headerTitle: { fontSize: 32, fontWeight: "800", color: "#1c1c1e", marginBottom: 15 },
  searchBar: { backgroundColor: "#f2f2f7", paddingHorizontal: 15, paddingVertical: 12, borderRadius: 12, fontSize: 16, color: "#000" },
  filterWrapper: { backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#e5e5ea" },
  filterContainer: { padding: 15, paddingBottom: 15 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: "#efeff4", marginRight: 8 },
  chipActive: { backgroundColor: "#007AFF" },
  chipText: { color: "#8e8e93", fontWeight: "600" },
  chipTextActive: { color: "#fff" },
  listPadding: { padding: 15, paddingBottom: 30 },
  card: { backgroundColor: "#fff", marginBottom: 12, borderRadius: 16, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3 },
  cardExpanded: { borderColor: "#007AFF", borderWidth: 1.5 },
  cardHeader: { flexDirection: "row", alignItems: "center", padding: 12 },
  thumbnail: { width: 64, height: 64, borderRadius: 10, backgroundColor: "#eee" },
  headerText: { flex: 1, marginLeft: 15 },
  breedName: { fontSize: 18, fontWeight: "700", color: "#1c1c1e" },
  breedGroup: { fontSize: 14, color: "#8e8e93", marginTop: 2 },
  expandArrow: { fontSize: 12, color: "#c7c7cc", marginRight: 5 },
  detailsContainer: { padding: 16, paddingTop: 0 },
  divider: { height: 1, backgroundColor: "#f2f2f7", marginBottom: 16 },
  infoRow: { flexDirection: "row", marginBottom: 16 },
  infoBox: { flex: 1 },
  detailItem: { marginBottom: 12 },
  infoLabel: { fontSize: 11, fontWeight: "800", color: "#8e8e93", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 },
  infoValue: { fontSize: 15, color: "#3a3a3c", lineHeight: 20 },
  emptyText: { textAlign: "center", marginTop: 40, color: "#8e8e93", fontSize: 16 }
});