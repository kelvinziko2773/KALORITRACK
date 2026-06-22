// ScanFoodScreen.js
// Layar scan makanan dengan AI (Claude Vision)
// Tambahkan ke navigator: <Stack.Screen name="ScanFood" component={ScanFoodScreen} />
// Panggil dari HomeScreen: navigation.navigate('ScanFood')
//
// Install dependencies:
//   npx expo install expo-image-picker expo-camera
//   npm install @anthropic-ai/sdk   (atau gunakan fetch langsung ke API)
//
// PENTING: Simpan API key di .env sebagai EXPO_PUBLIC_ANTHROPIC_KEY
// dan jangan commit ke git!

import * as ImagePicker from 'expo-image-picker';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useRef, useState } from 'react';
import {
    ActivityIndicator, Alert, Animated, Image,
    ScrollView, StyleSheet, Text, TouchableOpacity, View
} from 'react-native';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';

const ANTHROPIC_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_KEY || '';

export default function ScanFoodScreen({ navigation }) {
  const { user } = useAuth();
  const [imageUri, setImageUri] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  const animateIn = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 9, useNativeDriver: true }),
    ]).start();
  };

  const pickFromCamera = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Izin Kamera', 'Izinkan akses kamera di pengaturan HP kamu.');
      return;
    }
    const res = await ImagePicker.launchCameraAsync({
      base64: true, quality: 0.7,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });
    if (!res.canceled) handleImage(res.assets[0]);
  };

  const pickFromGallery = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Izin Galeri', 'Izinkan akses galeri di pengaturan HP kamu.');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      base64: true, quality: 0.7,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });
    if (!res.canceled) handleImage(res.assets[0]);
  };

  const handleImage = (asset) => {
    setImageUri(asset.uri);
    setImageBase64(asset.base64);
    setResult(null);
    setSaved(false);
    fadeAnim.setValue(0);
    slideAnim.setValue(40);
    analyzeFood(asset.base64);
  };

  const analyzeFood = async (base64) => {
    if (!base64) return;
    setLoading(true);
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-opus-4-6',
          max_tokens: 1024,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'image',
                  source: {
                    type: 'base64',
                    media_type: 'image/jpeg',
                    data: base64,
                  },
                },
                {
                  type: 'text',
                  text: `Kamu adalah ahli gizi. Analisis foto makanan ini dan berikan estimasi nilai gizi.
Jawab HANYA dengan JSON valid (tanpa markdown, tanpa penjelasan), format:
{
  "name": "nama makanan dalam bahasa Indonesia",
  "portion": "estimasi porsi (misal: 1 piring, 1 mangkok)",
  "calories": <angka kalori>,
  "carbs": <gram karbohidrat>,
  "protein": <gram protein>,
  "fat": <gram lemak>,
  "confidence": "tinggi/sedang/rendah",
  "notes": "catatan singkat tentang makanan ini (1 kalimat)"
}
Jika tidak terdeteksi makanan, return: {"error": "Tidak ada makanan terdeteksi"}`,
                },
              ],
            },
          ],
        }),
      });

      const data = await response.json();
      const text = data.content?.[0]?.text || '';

      // Parse JSON dari response
      const clean = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);

      if (parsed.error) {
        Alert.alert('Tidak Terdeteksi', parsed.error);
        setImageUri(null);
        setLoading(false);
        return;
      }

      setResult(parsed);
      animateIn();
    } catch (e) {
      Alert.alert('Error', 'Gagal menganalisis foto. Coba lagi ya!\n\n' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!result || !user) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      await addDoc(collection(db, 'foodLogs'), {
        userId: user.uid,
        date: today,
        name: result.name,
        calories: result.calories,
        carbs: result.carbs,
        protein: result.protein,
        fat: result.fat,
        portion: result.portion,
        source: 'scan',
        createdAt: serverTimestamp(),
      });
      setSaved(true);
      setTimeout(() => navigation.goBack(), 1200);
    } catch (e) {
      Alert.alert('Gagal menyimpan', e.message);
    }
  };

  const getConfidenceColor = (c) => {
    if (c === 'tinggi') return '#16A34A';
    if (c === 'sedang') return '#F59E0B';
    return '#EF4444';
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan Makanan</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Image preview or placeholder */}
      {imageUri ? (
        <View style={styles.imageWrap}>
          <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.loadingText}>AI sedang menganalisis...</Text>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderEmoji}>📸</Text>
          <Text style={styles.placeholderTitle}>Foto Makananmu</Text>
          <Text style={styles.placeholderSub}>AI akan menghitung kalori & nutrisi secara otomatis</Text>
        </View>
      )}

      {/* Action Buttons */}
      {!loading && (
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.btnCamera} onPress={pickFromCamera} activeOpacity={0.85}>
            <Text style={styles.btnIcon}>📷</Text>
            <Text style={styles.btnText}>Kamera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnGallery} onPress={pickFromGallery} activeOpacity={0.85}>
            <Text style={styles.btnIcon}>🖼️</Text>
            <Text style={styles.btnText}>Galeri</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Result Card */}
      {result && !loading && (
        <Animated.View style={[styles.resultCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          {/* Food name & portion */}
          <View style={styles.resultHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.resultName}>{result.name}</Text>
              <Text style={styles.resultPortion}>🍽️ {result.portion}</Text>
            </View>
            <View style={[styles.confidenceBadge, { backgroundColor: getConfidenceColor(result.confidence) + '20' }]}>
              <Text style={[styles.confidenceText, { color: getConfidenceColor(result.confidence) }]}>
                {result.confidence === 'tinggi' ? '✅' : result.confidence === 'sedang' ? '⚠️' : '❓'} {result.confidence}
              </Text>
            </View>
          </View>

          {/* Big calorie */}
          <View style={styles.calorieBox}>
            <Text style={styles.calorieNum}>{result.calories}</Text>
            <Text style={styles.calorieLabel}>kkal</Text>
          </View>

          {/* Nutrisi breakdown */}
          <View style={styles.nutrisiGrid}>
            <View style={[styles.nutrisiItem, { backgroundColor: '#EFF6FF' }]}>
              <Text style={styles.nutrisiEmoji}>🌾</Text>
              <Text style={styles.nutrisiVal}>{result.carbs}g</Text>
              <Text style={styles.nutrisiLbl}>Karbo</Text>
            </View>
            <View style={[styles.nutrisiItem, { backgroundColor: '#FFF0F6' }]}>
              <Text style={styles.nutrisiEmoji}>💪</Text>
              <Text style={styles.nutrisiVal}>{result.protein}g</Text>
              <Text style={styles.nutrisiLbl}>Protein</Text>
            </View>
            <View style={[styles.nutrisiItem, { backgroundColor: '#FFFBEB' }]}>
              <Text style={styles.nutrisiEmoji}>🧈</Text>
              <Text style={styles.nutrisiVal}>{result.fat}g</Text>
              <Text style={styles.nutrisiLbl}>Lemak</Text>
            </View>
          </View>

          {/* AI Notes */}
          {result.notes && (
            <View style={styles.notesBox}>
              <Text style={styles.notesIcon}>🤖</Text>
              <Text style={styles.notesText}>{result.notes}</Text>
            </View>
          )}

          {/* Confidence disclaimer */}
          {result.confidence !== 'tinggi' && (
            <View style={styles.disclaimerBox}>
              <Text style={styles.disclaimerText}>
                ⚠️ Estimasi AI mungkin tidak 100% akurat. Kamu bisa edit setelah disimpan.
              </Text>
            </View>
          )}

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveBtn, saved && styles.saveBtnDone]}
            onPress={handleSave}
            disabled={saved}
            activeOpacity={0.85}
          >
            <Text style={styles.saveBtnText}>
              {saved ? '✅ Tersimpan!' : '+ Tambah ke Log Hari Ini'}
            </Text>
          </TouchableOpacity>

          {/* Scan ulang */}
          <TouchableOpacity
            style={styles.rescanBtn}
            onPress={() => { setImageUri(null); setResult(null); setSaved(false); }}
          >
            <Text style={styles.rescanText}>🔄 Scan ulang</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F8FA' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 54, paddingBottom: 16,
    backgroundColor: '#F7F8FA',
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4,
    elevation: 2,
  },
  backIcon: { fontSize: 20, color: '#111827' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },

  imageWrap: {
    marginHorizontal: 16, borderRadius: 20, overflow: 'hidden',
    height: 260, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12,
    elevation: 4,
  },
  image: { width: '100%', height: '100%' },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center', alignItems: 'center', gap: 12,
  },
  loadingText: { color: '#fff', fontSize: 14, fontWeight: '600' },

  placeholder: {
    marginHorizontal: 16, borderRadius: 20, height: 240,
    backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center',
    marginBottom: 16, borderWidth: 2, borderColor: '#E5E7EB', borderStyle: 'dashed',
  },
  placeholderEmoji: { fontSize: 56, marginBottom: 12 },
  placeholderTitle: { fontSize: 16, fontWeight: '700', color: '#374151', marginBottom: 6 },
  placeholderSub: { fontSize: 12, color: '#9CA3AF', textAlign: 'center', paddingHorizontal: 32, lineHeight: 18 },

  actionRow: {
    flexDirection: 'row', marginHorizontal: 16, gap: 10, marginBottom: 16,
  },
  btnCamera: {
    flex: 1, backgroundColor: '#22C55E', borderRadius: 14, paddingVertical: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    shadowColor: '#22C55E', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 3,
  },
  btnGallery: {
    flex: 1, backgroundColor: '#fff', borderRadius: 14, paddingVertical: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    borderWidth: 1.5, borderColor: '#E5E7EB',
  },
  btnIcon: { fontSize: 18 },
  btnText: { fontSize: 14, fontWeight: '600', color: '#111827' },

  resultCard: {
    backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 22, padding: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.07, shadowRadius: 16, elevation: 4,
  },
  resultHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
  resultName: { fontSize: 19, fontWeight: '800', color: '#111827', textTransform: 'capitalize', marginBottom: 4 },
  resultPortion: { fontSize: 12, color: '#9CA3AF' },
  confidenceBadge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  confidenceText: { fontSize: 11, fontWeight: '700' },

  calorieBox: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 4,
    backgroundColor: '#F0FDF4', borderRadius: 16, padding: 16, marginBottom: 14,
  },
  calorieNum: { fontSize: 52, fontWeight: '800', color: '#16A34A', letterSpacing: -2 },
  calorieLabel: { fontSize: 16, color: '#16A34A', fontWeight: '600', marginBottom: 8 },

  nutrisiGrid: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  nutrisiItem: { flex: 1, borderRadius: 14, padding: 12, alignItems: 'center' },
  nutrisiEmoji: { fontSize: 20, marginBottom: 4 },
  nutrisiVal: { fontSize: 16, fontWeight: '700', color: '#111827' },
  nutrisiLbl: { fontSize: 10, color: '#9CA3AF', marginTop: 2 },

  notesBox: {
    flexDirection: 'row', backgroundColor: '#F8FAFC', borderRadius: 12,
    padding: 12, gap: 8, marginBottom: 12, alignItems: 'flex-start',
  },
  notesIcon: { fontSize: 16 },
  notesText: { flex: 1, fontSize: 12, color: '#64748B', lineHeight: 18 },

  disclaimerBox: {
    backgroundColor: '#FFFBEB', borderRadius: 10, padding: 10, marginBottom: 14,
  },
  disclaimerText: { fontSize: 11, color: '#92400E', lineHeight: 17 },

  saveBtn: {
    backgroundColor: '#22C55E', borderRadius: 14, paddingVertical: 15,
    alignItems: 'center', marginBottom: 10,
    shadowColor: '#22C55E', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 3,
  },
  saveBtnDone: { backgroundColor: '#16A34A' },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  rescanBtn: { alignItems: 'center', paddingVertical: 10 },
  rescanText: { fontSize: 13, color: '#9CA3AF', fontWeight: '500' },
});