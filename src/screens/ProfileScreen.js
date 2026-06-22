import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Alert, TextInput, ScrollView
} from 'react-native';
import { signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen() {
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [targetKalori, setTargetKalori] = useState('2000');
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserData(data);
        setTargetKalori(String(data.targetKalori || 2000));
      }
    } catch (error) {
      console.log('Error:', error.message);
    }
  };

  const handleSaveTarget = async () => {
    const nilai = parseInt(targetKalori);
    if (!nilai || nilai < 500 || nilai > 5000) {
      return Alert.alert('Error', 'Target kalori harus antara 500 - 5000 kkal');
    }
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        targetKalori: nilai,
      });
      setUserData(prev => ({ ...prev, targetKalori: nilai }));
      setEditing(false);
      Alert.alert('✅ Berhasil', `Target kalori diubah ke ${nilai} kkal`);
    } catch (error) {
      Alert.alert('Error', 'Gagal menyimpan');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Yakin ingin keluar?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => signOut(auth) }
    ]);
  };

  // Preset target kalori
  const PRESETS = [
    { label: 'Diet ketat', value: 1200, emoji: '🥗' },
    { label: 'Diet ringan', value: 1500, emoji: '🥙' },
    { label: 'Normal', value: 2000, emoji: '🍱' },
    { label: 'Aktif', value: 2500, emoji: '💪' },
    { label: 'Bulking', value: 3000, emoji: '🏋️' },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header profil */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {userData?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
          </Text>
        </View>
        <Text style={styles.name}>{userData?.name || 'Pengguna'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      {/* Target Kalori */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎯 Target Kalori Harian</Text>

        <View style={styles.targetCard}>
          <Text style={styles.targetLabel}>Target saat ini</Text>
          {editing ? (
            <View style={styles.editRow}>
              <TextInput
                style={styles.targetInput}
                value={targetKalori}
                onChangeText={setTargetKalori}
                keyboardType="numeric"
                maxLength={4}
                autoFocus
              />
              <Text style={styles.kkalLabel}>kkal</Text>
            </View>
          ) : (
            <Text style={styles.targetAngka}>{userData?.targetKalori || 2000} kkal</Text>
          )}

          {editing ? (
            <View style={styles.btnRow}>
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: '#f5f5f5' }]}
                onPress={() => { setEditing(false); setTargetKalori(String(userData?.targetKalori || 2000)); }}
              >
                <Text style={{ color: '#666', fontWeight: '600' }}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: '#4CAF50' }]}
                onPress={handleSaveTarget}
                disabled={loading}
              >
                <Text style={{ color: '#fff', fontWeight: '600' }}>
                  {loading ? 'Menyimpan...' : 'Simpan'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.editBtn} onPress={() => setEditing(true)}>
              <Text style={styles.editBtnText}>✏️ Ubah Target</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Preset */}
        <Text style={styles.presetTitle}>Pilih preset:</Text>
        <View style={styles.presetGrid}>
          {PRESETS.map(preset => (
            <TouchableOpacity
              key={preset.value}
              style={[
                styles.presetCard,
                (userData?.targetKalori || 2000) === preset.value && styles.presetActive
              ]}
              onPress={async () => {
                setTargetKalori(String(preset.value));
                try {
                  await updateDoc(doc(db, 'users', user.uid), { targetKalori: preset.value });
                  setUserData(prev => ({ ...prev, targetKalori: preset.value }));
                  Alert.alert('✅', `Target diubah ke ${preset.label} (${preset.value} kkal)`);
                } catch (e) {
                  Alert.alert('Error', 'Gagal menyimpan');
                }
              }}
            >
              <Text style={styles.presetEmoji}>{preset.emoji}</Text>
              <Text style={[
                styles.presetLabel,
                (userData?.targetKalori || 2000) === preset.value && { color: '#4CAF50' }
              ]}>{preset.label}</Text>
              <Text style={[
                styles.presetVal,
                (userData?.targetKalori || 2000) === preset.value && { color: '#4CAF50' }
              ]}>{preset.value} kkal</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Info akun */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👤 Informasi Akun</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoVal}>{user?.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nama</Text>
            <Text style={styles.infoVal}>{userData?.name || '-'}</Text>
          </View>
          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.infoLabel}>Target Kalori</Text>
            <Text style={[styles.infoVal, { color: '#4CAF50', fontWeight: '600' }]}>
              {userData?.targetKalori || 2000} kkal/hari
            </Text>
          </View>
        </View>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>🚪 Keluar dari Akun</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  profileCard: {
    backgroundColor: '#4CAF50', padding: 30, alignItems: 'center',
    paddingTop: 50,
  },
  avatar: {
    width: 70, height: 70, borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  avatarText: { fontSize: 30, color: '#fff', fontWeight: 'bold' },
  name: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  email: { fontSize: 13, color: 'rgba(255,255,255,0.85)' },

  section: { margin: 16, marginBottom: 0 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: '#222', marginBottom: 10 },

  targetCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 20,
    alignItems: 'center', marginBottom: 12,
  },
  targetLabel: { fontSize: 13, color: '#888', marginBottom: 6 },
  targetAngka: { fontSize: 36, fontWeight: 'bold', color: '#4CAF50', marginBottom: 12 },
  editRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  targetInput: {
    fontSize: 36, fontWeight: 'bold', color: '#4CAF50',
    borderBottomWidth: 2, borderBottomColor: '#4CAF50',
    minWidth: 100, textAlign: 'center', padding: 4,
  },
  kkalLabel: { fontSize: 16, color: '#888' },
  btnRow: { flexDirection: 'row', gap: 10, width: '100%' },
  btn: { flex: 1, padding: 12, borderRadius: 10, alignItems: 'center' },
  editBtn: {
    backgroundColor: '#E8F5E9', borderRadius: 10,
    paddingHorizontal: 20, paddingVertical: 10,
  },
  editBtnText: { color: '#4CAF50', fontWeight: '600', fontSize: 14 },

  presetTitle: { fontSize: 13, color: '#888', marginBottom: 8 },
  presetGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  presetCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: 12,
    alignItems: 'center', minWidth: '18%', flex: 1,
    borderWidth: 1.5, borderColor: '#f0f0f0',
  },
  presetActive: { borderColor: '#4CAF50', backgroundColor: '#E8F5E9' },
  presetEmoji: { fontSize: 22, marginBottom: 4 },
  presetLabel: { fontSize: 10, color: '#666', textAlign: 'center' },
  presetVal: { fontSize: 10, color: '#888', fontWeight: '600' },

  infoCard: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden' },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    padding: 14, borderBottomWidth: 0.5, borderBottomColor: '#f0f0f0',
  },
  infoLabel: { fontSize: 14, color: '#888' },
  infoVal: { fontSize: 14, color: '#222' },

  logoutBtn: {
    margin: 16, backgroundColor: '#fff', borderRadius: 14,
    padding: 16, alignItems: 'center', marginTop: 12,
    borderWidth: 1, borderColor: '#ffebee',
  },
  logoutText: { color: '#f44336', fontSize: 15, fontWeight: '600' },
});