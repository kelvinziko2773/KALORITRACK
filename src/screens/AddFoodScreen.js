import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useState } from 'react';
import {
    ActivityIndicator, Alert,
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text, TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { auth, db } from '../config/firebase';
import { searchFood } from '../services/nutritionApi';

export default function AddFoodScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) {
      Alert.alert('', 'Masukkan nama makanan dulu');
      return;
    }
    setLoading(true);
    setSearched(true);
    setResults([]);
    try {
      const data = await searchFood(query);
      if (data && data.length > 0) {
        setResults(data);
      } else {
        Alert.alert('Tidak ditemukan', 'Coba kata lain dalam bahasa Inggris\nContoh: rice, chicken, egg');
      }
    } catch (error) {
      Alert.alert('Gagal', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (food) => {
  try {
    const kalori = parseFloat(food.calories) || 0;
    const karbo = parseFloat(food.carbohydrates_total_g) || 0;
    const protein = parseFloat(food.protein_g) || 0;
    const lemak = parseFloat(food.fat_total_g) || 0;

    console.log('Data yang disimpan:', { kalori, karbo, protein, lemak });

    await addDoc(collection(db, 'foodLogs'), {
      userId: auth.currentUser.uid,
      name: food.name,
      calories: kalori,
      carbs: karbo,
      protein: protein,
      fat: lemak,
      date: new Date().toISOString().split('T')[0],
      createdAt: serverTimestamp(),
    });

    Alert.alert('✅ Berhasil', `${food.name} ditambahkan!`, [
      { text: 'Tambah lagi', style: 'cancel' },
      { text: 'Kembali', onPress: () => navigation.goBack() }
    ]);
  } catch (e) {
    Alert.alert('Error', 'Gagal menyimpan: ' + e.message);
  }
};

  return (
    <SafeAreaView style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchBox}>
        <TextInput
          style={styles.input}
          placeholder="Ketik nama makanan (Inggris/Indonesia)"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          placeholderTextColor="#999"
          autoFocus
        />
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
          <Text style={styles.searchBtnText}>Cari</Text>
        </TouchableOpacity>
      </View>

      {/* Contoh pencarian */}
      {!searched && (
        <View style={styles.hintBox}>
          <Text style={styles.hintTitle}>Contoh pencarian:</Text>
          {['nasi goreng', 'ayam goreng', 'tempe', 'telur', 'mie goreng'].map((item) => (
            <TouchableOpacity
              key={item}
              style={styles.hintChip}
              onPress={() => {
                setQuery(item);
              }}
            >
              <Text style={styles.hintText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Loading */}
      {loading && (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={{ color: '#888', marginTop: 10 }}>Mencari makanan...</Text>
        </View>
      )}

      {/* Hasil pencarian */}
      {!loading && searched && results.length === 0 && (
        <View style={styles.centerBox}>
          <Text style={styles.emptyText}>Tidak ada hasil</Text>
          <Text style={styles.emptySubText}>Coba kata lain dalam bahasa Inggris</Text>
        </View>
      )}

      <FlatList
        data={results}
        keyExtractor={(_, i) => i.toString()}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardName}>{item.name}</Text>
            <View style={styles.macroRow}>
              <View style={styles.macroBadge}>
                <Text style={styles.macroLabel}>Kalori</Text>
                <Text style={styles.macroVal}>{Math.round(item.calories)}</Text>
              </View>
              <View style={styles.macroBadge}>
                <Text style={styles.macroLabel}>Karbo</Text>
                <Text style={styles.macroVal}>{Math.round(item.carbohydrates_total_g)}g</Text>
              </View>
              <View style={styles.macroBadge}>
                <Text style={styles.macroLabel}>Protein</Text>
                <Text style={styles.macroVal}>{Math.round(item.protein_g)}g</Text>
              </View>
              <View style={styles.macroBadge}>
                <Text style={styles.macroLabel}>Lemak</Text>
                <Text style={styles.macroVal}>{Math.round(item.fat_total_g)}g</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.addBtn} onPress={() => handleAdd(item)}>
              <Text style={styles.addBtnText}>+ Tambahkan ke Log</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  searchBox: {
    flexDirection: 'row', padding: 12,
    backgroundColor: '#fff', gap: 8,
    borderBottomWidth: 1, borderBottomColor: '#eee'
  },
  input: {
    flex: 1, backgroundColor: '#f5f5f5', borderRadius: 10,
    padding: 12, fontSize: 14, color: '#333'
  },
  searchBtn: {
    backgroundColor: '#4CAF50', borderRadius: 10,
    paddingHorizontal: 16, justifyContent: 'center'
  },
  searchBtnText: { color: '#fff', fontWeight: '600' },
  hintBox: { padding: 16 },
  hintTitle: { fontSize: 13, color: '#888', marginBottom: 10 },
  hintChip: {
    backgroundColor: '#E8F5E9', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 8,
    marginBottom: 8, alignSelf: 'flex-start'
  },
  hintText: { color: '#2E7D32', fontSize: 13 },
  centerBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyText: { fontSize: 16, color: '#666', fontWeight: '600' },
  emptySubText: { fontSize: 13, color: '#aaa', marginTop: 6, textAlign: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16 },
  cardName: {
    fontSize: 15, fontWeight: '600', color: '#222',
    textTransform: 'capitalize', marginBottom: 12
  },
  macroRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  macroBadge: {
    flex: 1, backgroundColor: '#f5f5f5', borderRadius: 8,
    padding: 8, alignItems: 'center'
  },
  macroLabel: { fontSize: 10, color: '#888' },
  macroVal: { fontSize: 14, fontWeight: '600', color: '#222', marginTop: 2 },
  addBtn: { backgroundColor: '#4CAF50', borderRadius: 10, padding: 12, alignItems: 'center' },
  addBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});