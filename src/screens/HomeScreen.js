import { Ionicons } from '@expo/vector-icons';
import {
  Poppins_600SemiBold_Italic,
  Poppins_700Bold,
  Poppins_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/poppins';
import { LinearGradient } from 'expo-linear-gradient';
import { signOut } from 'firebase/auth';
import { collection, doc, getDoc, onSnapshot, query, setDoc, where } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { auth, db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';

const DEFAULT_TARGET = 2000;
const { width } = Dimensions.get('window');
const FOOD_EMOJIS = ['🍚', '🍗', '🥦', '🍜', '🥚', '🐟', '🫘', '🥛', '🍌', '🥑', '🍎', '🥕', '🧆', '🍳', '🥩'];

const DAILY_WATER_TARGET = 2000;
const GLASS_ML = 250;
const MAX_GLASSES = DAILY_WATER_TARGET / GLASS_ML;

// ===================== THEME — MATCHED EXACTLY TO LOGINSCREEN =====================
const COLORS = {
  gradient: ['#0F4C3A', '#1B7A4D', '#5CB85C', '#A8E063'],
  surface: '#FFFFFF',
  ink: '#1B2E1C',
  inkSoft: '#5C6B5C',
  inkFaint: '#8A958A',
  border: '#E5E9E3',
  inputBg: '#FAFBF9',

  accent: '#1B5E20',
  accentSoft: '#E3F1E1',
  accentDeep: '#143F17',
  gold: '#FFE066',

  danger: '#D9534F',
  dangerSoft: '#FBE4E3',
  dangerDeep: '#A33B38',

  warn: '#E0A030',
  warnSoft: '#FBF0DD',

  water: '#3B9AE1',
  waterSoft: '#E3F1FB',
  waterDeep: '#1E5F94',

  carbBlue: '#5C9AE0',
  carbBlueSoft: '#E7F0FB',
  proteinPink: '#D9709A',
  proteinPinkSoft: '#FBE9EF',
  fatAmber: '#E0A030',
  fatAmberSoft: '#FBF0DD',
};

const RADIUS = { sm: 12, md: 16, lg: 20, xl: 24, pill: 999 };
const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);

// ===================== REUSABLE PIECES =====================
function ProgressBar({ animatedValue, height = 9, trackColor, fillColor, style }) {
  return (
    <View style={[{ height, borderRadius: height / 2, backgroundColor: trackColor, overflow: 'hidden' }, style]}>
      <Animated.View
        style={{
          height,
          borderRadius: height / 2,
          backgroundColor: fillColor,
          width: animatedValue.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
        }}
      />
    </View>
  );
}

function InfoChip({ icon, label, tone = 'neutral' }) {
  const toneStyles = {
    neutral: { backgroundColor: COLORS.accentSoft, color: COLORS.accentDeep },
    good: { backgroundColor: COLORS.accentSoft, color: COLORS.accentDeep },
    danger: { backgroundColor: COLORS.dangerSoft, color: COLORS.dangerDeep },
  }[tone];
  return (
    <View style={[wStyles.chip, { backgroundColor: toneStyles.backgroundColor }]}>
      <Text style={wStyles.chipIcon}>{icon}</Text>
      <Text style={[wStyles.chipText, { color: toneStyles.color }]}>{label}</Text>
    </View>
  );
}

function NutrientCard({ emoji, iconBg, value, label, barColor, barBg, ratio }) {
  return (
    <View style={styles.nutrisiCard}>
      <View style={[styles.nutrisiIconBg, { backgroundColor: iconBg }]}>
        <Text style={styles.nutrisiEmoji}>{emoji}</Text>
      </View>
      <Text style={styles.nutrisiVal}>{value}g</Text>
      <Text style={styles.nutrisiLabel}>{label}</Text>
      <View style={[styles.nutrisiBar, { backgroundColor: barBg }]}>
        <View style={[styles.nutrisiBarFill, { backgroundColor: barColor, width: `${Math.min(ratio * 100, 100)}%` }]} />
      </View>
    </View>
  );
}

// ===================== WATER TRACKER =====================
function WaterTracker({ userId }) {
  const [glasses, setGlasses] = useState(0);
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().split('T')[0];

  const scaleAnims = useRef(Array.from({ length: MAX_GLASSES }, () => new Animated.Value(1))).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const popAnim = useRef(new Animated.Value(0)).current;
  const enterAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      try {
        const ref = doc(db, 'waterLogs', `${userId}_${today}`);
        const snap = await getDoc(ref);
        if (snap.exists()) setGlasses(snap.data().glasses || 0);
      } catch (e) {
        console.log('Water load error:', e.message);
      } finally {
        setLoading(false);
        Animated.timing(enterAnim, { toValue: 1, duration: 420, easing: EASE_OUT, useNativeDriver: true }).start();
      }
    };
    load();
  }, [userId]);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: glasses / MAX_GLASSES, duration: 550, easing: EASE_OUT, useNativeDriver: false,
    }).start();
  }, [glasses]);

  const saveGlasses = async (val) => {
    if (!userId) return;
    try {
      const ref = doc(db, 'waterLogs', `${userId}_${today}`);
      await setDoc(ref, { glasses: val, date: today, userId }, { merge: true });
    } catch (e) {
      console.log('Water save error:', e.message);
    }
  };

  const handleAdd = () => {
    if (glasses >= MAX_GLASSES) return;
    const next = glasses + 1;
    setGlasses(next);
    saveGlasses(next);
    const idx = next - 1;
    Animated.sequence([
      Animated.spring(scaleAnims[idx], { toValue: 1.4, friction: 5, tension: 140, useNativeDriver: true }),
      Animated.spring(scaleAnims[idx], { toValue: 1, friction: 6, tension: 140, useNativeDriver: true }),
    ]).start();
    if (next === MAX_GLASSES) {
      Animated.sequence([
        Animated.spring(popAnim, { toValue: 1, friction: 6, tension: 120, useNativeDriver: true }),
        Animated.delay(2200),
        Animated.timing(popAnim, { toValue: 0, duration: 350, easing: EASE_OUT, useNativeDriver: true }),
      ]).start();
    }
  };

  const handleRemove = () => {
    if (glasses <= 0) return;
    const next = glasses - 1;
    setGlasses(next);
    saveGlasses(next);
  };

  if (loading) return null;

  const totalMl = glasses * GLASS_ML;
  const sisaMl = Math.max(DAILY_WATER_TARGET - totalMl, 0);
  const isDone = glasses >= MAX_GLASSES;

  return (
    <Animated.View
      style={[
        wStyles.card,
        { opacity: enterAnim, transform: [{ translateY: enterAnim.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }] },
      ]}
    >
      <View style={wStyles.headerRow}>
        <View style={wStyles.titleGroup}>
          <View style={wStyles.iconBg}><Text style={{ fontSize: 19 }}>💧</Text></View>
          <View>
            <Text style={wStyles.title}>Minum Air</Text>
            <Text style={wStyles.subtitle}>Target {DAILY_WATER_TARGET}ml / hari</Text>
          </View>
        </View>
        <View style={wStyles.mlBadge}><Text style={wStyles.mlText}>{totalMl}ml</Text></View>
      </View>

      <ProgressBar animatedValue={progressAnim} trackColor={COLORS.waterSoft} fillColor={isDone ? COLORS.waterDeep : COLORS.water} style={{ marginBottom: 8 }} />
      <View style={wStyles.progLabelRow}>
        <Text style={wStyles.progLabel}>{glasses}/{MAX_GLASSES} gelas</Text>
        {isDone
          ? <Text style={[wStyles.progLabel, { color: COLORS.waterDeep, fontWeight: '700' }]}>✅ Target tercapai!</Text>
          : <Text style={wStyles.progLabel}>Sisa {sisaMl}ml lagi</Text>}
      </View>

      <View style={wStyles.glassRow}>
        {Array.from({ length: MAX_GLASSES }).map((_, i) => (
          <Animated.View key={i} style={{ transform: [{ scale: scaleAnims[i] }] }}>
            <TouchableOpacity onPress={i < glasses ? handleRemove : handleAdd} activeOpacity={0.7} hitSlop={6}>
              <Text style={[wStyles.glassEmoji, i < glasses ? wStyles.glassFilled : wStyles.glassEmpty]}>
                {i < glasses ? '🥤' : '🫙'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>

      <View style={wStyles.btnRow}>
        <TouchableOpacity style={[wStyles.btn, wStyles.btnMinus, glasses === 0 && wStyles.btnDisabled]} onPress={handleRemove} disabled={glasses === 0} activeOpacity={0.8}>
          <Text style={wStyles.btnMinusText}>−</Text>
        </TouchableOpacity>
        <View style={wStyles.infoCenter}>
          <Text style={wStyles.infoCenterNum}>{glasses}</Text>
          <Text style={wStyles.infoCenterLabel}>gelas diminum</Text>
        </View>
        <TouchableOpacity style={[wStyles.btn, wStyles.btnPlus, isDone && wStyles.btnDisabled]} onPress={handleAdd} disabled={isDone} activeOpacity={0.8}>
          <Text style={wStyles.btnPlusText}>＋</Text>
        </TouchableOpacity>
      </View>

      <Animated.View style={[wStyles.doneBadge, { opacity: popAnim, transform: [{ scale: popAnim.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }] }]}>
        <Text style={wStyles.doneBadgeText}>🎉 Hebat! Target air harian tercapai!</Text>
      </Animated.View>
    </Animated.View>
  );
}

// ===================== MAIN HOME SCREEN =====================
export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [foodLogs, setFoodLogs] = useState([]);
  const [targetKalori, setTargetKalori] = useState(DEFAULT_TARGET);
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [inputTarget, setInputTarget] = useState('');
  const today = new Date().toISOString().split('T')[0];

  let [fontsLoaded] = useFonts({
    Poppins_700Bold,
    Poppins_800ExtraBold,
    Poppins_600SemiBold_Italic,
  });

  const scrollAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.96)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const warningAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const modalAnim = useRef(new Animated.Value(0)).current;

  // floating decorations — same idea as LoginScreen's floating fruit
  const float1 = useRef(new Animated.Value(0)).current;
  const float2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const makeFloat = (anim, duration, delay = 0) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: 1, duration, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration, useNativeDriver: true }),
        ])
      );
    makeFloat(float1, 4500, 0).start();
    makeFloat(float2, 5200, 800).start();
  }, []);

  useEffect(() => {
    if (!user) return;
    const loadTarget = async () => {
      const docRef = doc(db, 'userSettings', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap.data().targetKalori) setTargetKalori(docSnap.data().targetKalori);
    };
    loadTarget();
  }, [user]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 450, easing: EASE_OUT, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 70, friction: 10, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 420, easing: EASE_OUT, useNativeDriver: true }),
    ]).start();
    Animated.loop(
      Animated.timing(scrollAnim, { toValue: -width * 2, duration: 16000, easing: Easing.linear, useNativeDriver: true })
    ).start();
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'foodLogs'), where('userId', '==', user.uid), where('date', '==', today));
    const unsub = onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const sorted = logs.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
      setFoodLogs(sorted);
    }, (error) => console.log('Error:', error.message));
    return unsub;
  }, [user]);

  const totalKalori = foodLogs.reduce((sum, item) => sum + (item.calories || 0), 0);
  const totalKarbo = foodLogs.reduce((sum, item) => sum + (item.carbs || 0), 0);
  const totalProtein = foodLogs.reduce((sum, item) => sum + (item.protein || 0), 0);
  const totalLemak = foodLogs.reduce((sum, item) => sum + (item.fat || 0), 0);
  const progress = Math.min((totalKalori / targetKalori) * 100, 100);
  const sisaKalori = Math.max(targetKalori - totalKalori, 0);
  const kelebihan = Math.round(totalKalori - targetKalori);
  const isOver = totalKalori > targetKalori;

  useEffect(() => {
    if (isOver) Animated.spring(warningAnim, { toValue: 1, tension: 60, friction: 9, useNativeDriver: true }).start();
    else Animated.timing(warningAnim, { toValue: 0, duration: 280, easing: EASE_OUT, useNativeDriver: true }).start();
  }, [totalKalori, targetKalori]);

  useEffect(() => {
    Animated.timing(progressAnim, { toValue: progress / 100, duration: 800, easing: EASE_OUT, useNativeDriver: false }).start();
  }, [totalKalori, targetKalori]);

  useEffect(() => {
    Animated.timing(modalAnim, { toValue: showTargetModal ? 1 : 0, duration: 260, easing: EASE_OUT, useNativeDriver: true }).start();
  }, [showTargetModal]);

  const handleSaveTarget = async () => {
    const val = parseInt(inputTarget);
    if (!val || val < 500 || val > 10000) {
      Alert.alert('Target tidak valid', 'Masukkan angka antara 500 - 10000 kkal');
      return;
    }
    try {
      await setDoc(doc(db, 'userSettings', user.uid), { targetKalori: val }, { merge: true });
      setTargetKalori(val);
      setShowTargetModal(false);
      setInputTarget('');
    } catch (e) {
      Alert.alert('Gagal menyimpan', e.message);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Yakin ingin keluar?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => signOut(auth) }
    ]);
  };

  const getFoodEmoji = (name) => {
    const n = (name || '').toLowerCase();
    if (n.includes('bayam') || n.includes('spinach') || n.includes('kangkung') || n.includes('sawi') || n.includes('brokoli') || n.includes('broccoli') || n.includes('wortel') || n.includes('carrot') || n.includes('selada') || n.includes('lettuce') || n.includes('kubis') || n.includes('cabbage')) return '🥬';
    if (n.includes('apel') || n.includes('apple')) return '🍎';
    if (n.includes('pisang') || n.includes('banana')) return '🍌';
    if (n.includes('semangka') || n.includes('watermelon')) return '🍉';
    if (n.includes('alpukat') || n.includes('avocado')) return '🥑';
    if (n.includes('ayam') || n.includes('chicken')) return '🍗';
    if (n.includes('ikan') || n.includes('fish')) return '🐟';
    if (n.includes('telur') || n.includes('egg')) return '🥚';
    if (n.includes('nasi') || n.includes('rice')) return '🍚';
    if (n.includes('mie') || n.includes('noodle')) return '🍜';
    if (n.includes('tempe')) return '🫘';
    if (n.includes('tahu')) return '🧆';
    if (n.includes('susu')) return '🥛';
    if (n.includes('kopi')) return '☕';
    if (n.includes('teh')) return '🍵';
    if (n.includes('jus')) return '🧃';
    return '🍽️';
  };

  const getProgressColor = () => {
    if (progress >= 100) return COLORS.danger;
    if (progress > 75) return COLORS.warn;
    return COLORS.accent;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return 'Selamat pagi';
    if (hour < 15) return 'Selamat siang';
    if (hour < 18) return 'Selamat sore';
    return 'Selamat malam';
  };

  const getMoodStatus = () => {
    if (progress >= 100) return { emoji: '😅', text: 'Wah, kalori penuh!' };
    if (progress >= 75) return { emoji: '😊', text: 'Hampir tercapai!' };
    if (progress >= 50) return { emoji: '💪', text: 'Setengah jalan!' };
    if (progress >= 25) return { emoji: '🌱', text: 'Baru mulai nih' };
    return { emoji: '✨', text: 'Ayo mulai makan!' };
  };

  const mood = getMoodStatus();

  if (!fontsLoaded) return null;

  return (
    <LinearGradient
      colors={COLORS.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.3, y: 1 }}
      style={styles.gradientBg}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Floating decorations — same visual language as LoginScreen */}
      <Animated.Text
        style={[
          styles.fruitDeco, styles.fruitTop,
          {
            transform: [
              { translateY: float1.interpolate({ inputRange: [0, 1], outputRange: [0, -14] }) },
              { rotate: float1.interpolate({ inputRange: [0, 1], outputRange: ['-4deg', '4deg'] }) },
            ],
          },
        ]}
      >
        🍎
      </Animated.Text>
      <Animated.Text
        style={[
          styles.fruitDeco, styles.fruitBottom,
          {
            transform: [
              { translateY: float2.interpolate({ inputRange: [0, 1], outputRange: [0, 16] }) },
              { rotate: float2.interpolate({ inputRange: [0, 1], outputRange: ['6deg', '-3deg'] }) },
            ],
          },
        ]}
      >
        🍌
      </Animated.Text>

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        {/* Header — text directly on gradient, like LoginScreen */}
        <Animated.View style={[styles.headerOnGradient, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.headerTopRow}>
            <View style={styles.logoCircle}>
              <Ionicons name="nutrition" size={26} color={COLORS.accent} />
            </View>
            <TouchableOpacity onPress={handleLogout} style={styles.avatarBtn} activeOpacity={0.85}>
              <Text style={styles.avatarText}>{user?.email?.charAt(0).toUpperCase() || 'U'}</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.greetingSmall}>{getGreeting()} 👋</Text>
          <Text style={styles.greetingName}>
            {user?.email?.split('@')[0] || 'Pengguna'}<Text style={styles.greetingAccent}> !</Text>
          </Text>
          <Text style={styles.date}>
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
          </Text>
        </Animated.View>

        {/* Main Calorie Card — white card, exactly like LoginScreen's card */}
        <Animated.View style={[styles.mainCard, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.cardTopRow}>
            <View style={styles.moodBadge}>
              <Text style={styles.moodEmoji}>{mood.emoji}</Text>
              <Text style={styles.moodText}>{mood.text}</Text>
            </View>
            <TouchableOpacity onPress={() => { setInputTarget(String(targetKalori)); setShowTargetModal(true); }} style={styles.targetBadge} activeOpacity={0.85}>
              <Text style={styles.targetBadgeText}>🎯 {targetKalori} kkal</Text>
              <Ionicons name="pencil" size={11} color={COLORS.accentDeep} />
            </TouchableOpacity>
          </View>

          <Text style={styles.kaloriLabel}>Kalori Hari Ini</Text>
          <View style={styles.kaloriRow}>
            <Text style={styles.kaloriAngka}>{Math.round(totalKalori)}</Text>
            <Text style={styles.kaloriUnit}>kkal</Text>
          </View>

          <View style={styles.progContainer}>
            <ProgressBar animatedValue={progressAnim} trackColor={COLORS.border} fillColor={getProgressColor()} style={{ flex: 1 }} />
            <Text style={styles.progPercent}>{Math.round(progress)}%</Text>
          </View>

          <View style={styles.infoRow}>
            <InfoChip icon="🔥" label={`${Math.round(progress)}% tercapai`} tone="neutral" />
            {isOver
              ? <InfoChip icon="❌" label={`+${kelebihan} kkal`} tone="danger" />
              : <InfoChip icon="✅" label={`Sisa ${Math.round(sisaKalori)} kkal`} tone="good" />}
          </View>
        </Animated.View>

        {/* Emoji strip */}
        <View style={styles.emojiScroll}>
          <Animated.View style={[styles.emojiRow, { transform: [{ translateX: scrollAnim }] }]}>
            {[...FOOD_EMOJIS, ...FOOD_EMOJIS, ...FOOD_EMOJIS].map((emoji, i) => (
              <Text key={i} style={styles.emojiItem}>{emoji}</Text>
            ))}
          </Animated.View>
        </View>

        {/* Warning Banner */}
        {isOver && (
          <Animated.View style={[styles.warningBox, { opacity: warningAnim, transform: [{ scale: warningAnim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) }] }]}>
            <Text style={styles.warningIcon}>🚨</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.warningTitle}>Kalori Melebihi Target!</Text>
              <Text style={styles.warningDesc}>
                Melebihi <Text style={{ fontWeight: '700' }}>{kelebihan} kkal</Text> hari ini. Coba minum air & gerak ringan ya!
              </Text>
            </View>
          </Animated.View>
        )}

        {/* Nutrisi Cards */}
        <Animated.View style={[styles.nutrisiRow, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <NutrientCard emoji="🌾" iconBg={COLORS.carbBlueSoft} value={Math.round(totalKarbo)} label="Karbo" barColor={COLORS.carbBlue} barBg="#D7E6F8" ratio={totalKarbo / 250} />
          <NutrientCard emoji="💪" iconBg={COLORS.proteinPinkSoft} value={Math.round(totalProtein)} label="Protein" barColor={COLORS.proteinPink} barBg="#F6D8E3" ratio={totalProtein / 100} />
          <NutrientCard emoji="🧈" iconBg={COLORS.fatAmberSoft} value={Math.round(totalLemak)} label="Lemak" barColor={COLORS.fatAmber} barBg="#F7E2B7" ratio={totalLemak / 80} />
        </Animated.View>

        <WaterTracker userId={user?.uid} />

        {/* Add Food Button — same green as LoginScreen's login button */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('AddFood')} activeOpacity={0.88}>
            <Text style={styles.addBtnIcon}>＋</Text>
            <Text style={styles.addBtnText}>Tambah Makanan</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🍽️ Makanan Hari Ini</Text>
          {foodLogs.length > 0 && (
            <View style={styles.countBadge}><Text style={styles.countBadgeText}>{foodLogs.length}</Text></View>
          )}
        </View>

        {foodLogs.length === 0 ? (
          <Animated.View style={[styles.emptyBox, { opacity: fadeAnim }]}>
            <Text style={styles.emptyEmoji}>🍽️</Text>
            <Text style={styles.emptyText}>Belum ada makanan hari ini</Text>
            <Text style={styles.emptySubText}>Tap tombol di atas untuk mulai tracking</Text>
          </Animated.View>
        ) : (
          <View style={styles.foodList}>
            {foodLogs.map((item, idx) => (
              <Animated.View
                key={item.id}
                style={[
                  styles.foodItem,
                  { opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [Math.min(10 + idx * 2, 24), 0] }) }] },
                ]}
              >
                <View style={styles.foodEmojiWrap}><Text style={styles.foodEmoji}>{getFoodEmoji(item.name)}</Text></View>
                <View style={styles.foodInfo}>
                  <Text style={styles.foodName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.foodDetail}>
                    🌾 {Math.round(item.carbs || 0)}g · 💪 {Math.round(item.protein || 0)}g · 🧈 {Math.round(item.fat || 0)}g
                  </Text>
                </View>
                <View style={styles.foodKaloriWrap}>
                  <Text style={styles.foodKalori}>{Math.round(item.calories || 0)}</Text>
                  <Text style={styles.foodKaloriLabel}>kkal</Text>
                </View>
              </Animated.View>
            ))}
          </View>
        )}
      </ScrollView>

      <Modal visible={showTargetModal} transparent animationType="fade" onRequestClose={() => setShowTargetModal(false)}>
        <Animated.View style={[styles.modalOverlay, { opacity: modalAnim }]}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setShowTargetModal(false)} />
          <Animated.View style={[styles.modalBox, { transform: [{ translateY: modalAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }] }]}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={{ fontSize: 34 }}>🎯</Text>
              <Text style={styles.modalTitle}>Target Kalori Harian</Text>
              <Text style={styles.modalSubtitle}>Sesuaikan dengan kebutuhan tubuhmu</Text>
            </View>

            <View style={styles.presetRow}>
              {[{ val: 1500, label: 'Diet' }, { val: 1800, label: 'Ringan' }, { val: 2000, label: 'Normal' }, { val: 2500, label: 'Aktif' }].map(({ val, label }) => (
                <TouchableOpacity key={val} style={[styles.presetBtn, inputTarget === String(val) && styles.presetBtnActive]} onPress={() => setInputTarget(String(val))} activeOpacity={0.85}>
                  <Text style={[styles.presetVal, inputTarget === String(val) && styles.presetValActive]}>{val}</Text>
                  <Text style={[styles.presetLabel, inputTarget === String(val) && styles.presetLabelActive]}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.orText}>atau masukkan manual</Text>
              <View style={styles.divider} />
            </View>

            <View style={styles.inputWrapper}>
              <TextInput style={styles.modalInput} keyboardType="numeric" placeholder="0" placeholderTextColor="#C5CFC4" value={inputTarget} onChangeText={setInputTarget} maxLength={5} />
              <Text style={styles.inputUnit}>kkal</Text>
            </View>

            <View style={styles.infoBar}>
              <Text style={styles.infoBarText}>
                {!inputTarget || parseInt(inputTarget) < 500 ? '💡 Masukkan angka antara 500–10000'
                  : parseInt(inputTarget) < 1500 ? '⚠️ Sangat rendah, hati-hati!'
                  : parseInt(inputTarget) <= 2000 ? '✅ Target yang sehat!'
                  : parseInt(inputTarget) <= 2500 ? '💪 Cocok untuk yang aktif!'
                  : '🔥 Target tinggi, pastikan aktif bergerak!'}
              </Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalBtnCancel} onPress={() => { setShowTargetModal(false); setInputTarget(''); }} activeOpacity={0.85}>
                <Text style={styles.modalBtnCancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnSave} onPress={handleSaveTarget} activeOpacity={0.9}>
                <Text style={styles.modalBtnSaveText}>Simpan</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>
    </LinearGradient>
  );
}

const wStyles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface, marginHorizontal: 16, marginBottom: 14, borderRadius: RADIUS.lg, padding: 18,
    shadowColor: COLORS.ink, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  titleGroup: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBg: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.waterSoft, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 15, fontFamily: 'Poppins_700Bold', color: COLORS.ink },
  subtitle: { fontSize: 11, color: COLORS.inkFaint, marginTop: 1 },
  mlBadge: { backgroundColor: COLORS.waterSoft, borderRadius: RADIUS.pill, paddingHorizontal: 11, paddingVertical: 5 },
  mlText: { fontSize: 13, fontWeight: '700', color: COLORS.waterDeep },
  progLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  progLabel: { fontSize: 11, color: COLORS.inkFaint },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: RADIUS.pill, paddingHorizontal: 10, paddingVertical: 5 },
  chipIcon: { fontSize: 11 },
  chipText: { fontSize: 11, fontWeight: '600' },
  glassRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18, paddingHorizontal: 2 },
  glassEmoji: { fontSize: 26 },
  glassFilled: { opacity: 1 },
  glassEmpty: { opacity: 0.3 },
  btnRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  btn: { width: 48, height: 48, borderRadius: RADIUS.sm, justifyContent: 'center', alignItems: 'center' },
  btnMinus: { backgroundColor: COLORS.inputBg },
  btnPlus: { backgroundColor: COLORS.water },
  btnDisabled: { opacity: 0.3 },
  btnMinusText: { fontSize: 24, color: COLORS.inkSoft, lineHeight: 28 },
  btnPlusText: { fontSize: 20, color: '#fff', lineHeight: 24 },
  infoCenter: { alignItems: 'center' },
  infoCenterNum: { fontSize: 30, fontFamily: 'Poppins_800ExtraBold', color: COLORS.ink },
  infoCenterLabel: { fontSize: 11, color: COLORS.inkFaint },
  doneBadge: { backgroundColor: COLORS.waterSoft, borderRadius: RADIUS.sm, padding: 11, alignItems: 'center', marginTop: 12 },
  doneBadgeText: { fontSize: 13, fontWeight: '600', color: COLORS.waterDeep },
});

const styles = StyleSheet.create({
  gradientBg: { flex: 1 },
  container: { flex: 1, backgroundColor: 'transparent' },

  fruitDeco: { position: 'absolute', fontSize: 90, opacity: 0.16 },
  fruitTop: { top: 30, right: -10 },
  fruitBottom: { top: '42%', left: -15 },

  headerOnGradient: { paddingHorizontal: 22, paddingTop: 56, paddingBottom: 8 },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  logoCircle: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarBtn: {
    width: 46, height: 46, borderRadius: 23, backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { color: COLORS.accent, fontSize: 17, fontFamily: 'Poppins_700Bold' },
  greetingSmall: { fontSize: 13, color: '#EAF7E0', fontWeight: '500', marginBottom: 2 },
  greetingName: {
    fontSize: 26, fontFamily: 'Poppins_800ExtraBold', color: '#FFFFFF', textTransform: 'capitalize',
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0,0,0,0.25)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 5,
  },
  greetingAccent: { color: COLORS.gold, fontFamily: 'Poppins_600SemiBold_Italic' },
  date: { fontSize: 13.5, color: '#EAF7E0', marginTop: 6, marginBottom: 20 },

  mainCard: {
    backgroundColor: COLORS.surface, marginHorizontal: 16, marginBottom: 14, borderRadius: RADIUS.xl, padding: 22,
    shadowColor: COLORS.ink, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4,
  },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  moodBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.accentSoft, borderRadius: RADIUS.pill, paddingHorizontal: 10, paddingVertical: 5, gap: 5 },
  moodEmoji: { fontSize: 14 },
  moodText: { fontSize: 11, color: COLORS.accentDeep, fontWeight: '600' },
  targetBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: COLORS.accentSoft, borderRadius: RADIUS.pill, paddingHorizontal: 10, paddingVertical: 5 },
  targetBadgeText: { fontSize: 11, color: COLORS.accentDeep, fontWeight: '600' },
  kaloriLabel: { color: COLORS.inkFaint, fontSize: 13.5, fontWeight: '500', marginBottom: 5 },
  kaloriRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, marginBottom: 18 },
  kaloriAngka: { color: COLORS.ink, fontSize: 52, fontFamily: 'Poppins_800ExtraBold', letterSpacing: -1, lineHeight: 56 },
  kaloriUnit: { color: COLORS.inkFaint, fontSize: 16, fontWeight: '600', marginBottom: 8 },
  progContainer: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  progPercent: { color: COLORS.ink, fontSize: 12, fontWeight: '700', minWidth: 32, textAlign: 'right' },
  infoRow: { flexDirection: 'row', gap: 8 },

  emojiScroll: { backgroundColor: 'rgba(255,255,255,0.18)', height: 44, overflow: 'hidden', justifyContent: 'center', marginBottom: 14, marginHorizontal: 16, borderRadius: RADIUS.sm },
  emojiRow: { flexDirection: 'row', alignItems: 'center' },
  emojiItem: { fontSize: 22, marginHorizontal: 10 },

  warningBox: {
    backgroundColor: COLORS.warnSoft, marginHorizontal: 16, marginBottom: 10, borderRadius: RADIUS.md, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 12, borderLeftWidth: 3, borderLeftColor: COLORS.warn,
  },
  warningIcon: { fontSize: 28 },
  warningTitle: { fontSize: 13, fontWeight: '700', color: '#8A5A1E', marginBottom: 3 },
  warningDesc: { fontSize: 12, color: '#A3701F', lineHeight: 18 },

  nutrisiRow: { flexDirection: 'row', marginHorizontal: 16, gap: 10, marginBottom: 14 },
  nutrisiCard: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: 14, alignItems: 'center',
    shadowColor: COLORS.ink, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  nutrisiIconBg: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 7 },
  nutrisiEmoji: { fontSize: 20 },
  nutrisiVal: { fontSize: 18, fontFamily: 'Poppins_700Bold', color: COLORS.ink },
  nutrisiLabel: { fontSize: 10, color: COLORS.inkFaint, marginTop: 2, marginBottom: 7 },
  nutrisiBar: { width: '100%', height: 4, borderRadius: 2, overflow: 'hidden' },
  nutrisiBarFill: { height: 4, borderRadius: 2 },

  actionRow: { marginHorizontal: 16, marginBottom: 18 },
  addBtn: {
    backgroundColor: COLORS.accent, borderRadius: RADIUS.md, paddingVertical: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: COLORS.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 3,
  },
  addBtnIcon: { color: '#fff', fontSize: 20, fontWeight: '300', lineHeight: 22 },
  addBtnText: { color: '#fff', fontSize: 15, fontFamily: 'Poppins_700Bold', letterSpacing: 0.2 },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 10, gap: 8 },
  sectionTitle: { fontSize: 15, fontFamily: 'Poppins_700Bold', color: '#FFFFFF' },
  countBadge: { backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  countBadgeText: { fontSize: 11, fontWeight: '700', color: COLORS.accentDeep },

  emptyBox: {
    backgroundColor: COLORS.surface, marginHorizontal: 16, borderRadius: RADIUS.lg, padding: 36, alignItems: 'center',
    shadowColor: COLORS.ink, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 1,
  },
  emptyEmoji: { fontSize: 52, marginBottom: 12 },
  emptyText: { fontSize: 15, fontWeight: '600', color: COLORS.ink },
  emptySubText: { fontSize: 12, color: COLORS.inkFaint, marginTop: 6, textAlign: 'center', lineHeight: 18 },

  foodList: { marginHorizontal: 16, gap: 8 },
  foodItem: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    shadowColor: COLORS.ink, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 1,
  },
  foodEmojiWrap: { width: 46, height: 46, borderRadius: 14, backgroundColor: COLORS.accentSoft, justifyContent: 'center', alignItems: 'center' },
  foodEmoji: { fontSize: 24 },
  foodInfo: { flex: 1 },
  foodName: { fontSize: 14, fontWeight: '600', color: COLORS.ink, textTransform: 'capitalize', marginBottom: 3 },
  foodDetail: { fontSize: 11, color: COLORS.inkFaint, lineHeight: 16 },
  foodKaloriWrap: { alignItems: 'flex-end' },
  foodKalori: { fontSize: 17, fontFamily: 'Poppins_700Bold', color: COLORS.accentDeep },
  foodKaloriLabel: { fontSize: 10, color: COLORS.inkFaint },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,40,25,0.55)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: COLORS.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40 },
  modalHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: COLORS.border, alignSelf: 'center', marginBottom: 20 },
  modalHeader: { alignItems: 'center', marginBottom: 22, gap: 4 },
  modalTitle: { fontSize: 18, fontFamily: 'Poppins_700Bold', color: COLORS.ink, marginTop: 8 },
  modalSubtitle: { fontSize: 12, color: COLORS.inkFaint, textAlign: 'center' },
  presetRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  presetBtn: { flex: 1, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.sm, paddingVertical: 11, alignItems: 'center', backgroundColor: COLORS.inputBg },
  presetBtnActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accentSoft },
  presetVal: { fontSize: 14, fontWeight: '700', color: COLORS.inkFaint },
  presetValActive: { color: COLORS.accentDeep },
  presetLabel: { fontSize: 10, color: '#B7C2B6', marginTop: 2 },
  presetLabelActive: { color: COLORS.accent },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  divider: { flex: 1, height: 1, backgroundColor: COLORS.border },
  orText: { fontSize: 12, color: COLORS.inkFaint },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.inputBg, borderRadius: RADIUS.md, paddingHorizontal: 20, marginBottom: 12 },
  modalInput: { flex: 1, fontSize: 32, fontFamily: 'Poppins_700Bold', color: COLORS.ink, paddingVertical: 14, textAlign: 'center' },
  inputUnit: { fontSize: 15, color: COLORS.accent, fontWeight: '700' },
  infoBar: { backgroundColor: COLORS.accentSoft, borderRadius: RADIUS.sm, padding: 12, marginBottom: 22 },
  infoBarText: { fontSize: 12, color: COLORS.accentDeep, textAlign: 'center', fontWeight: '500' },
  modalButtons: { flexDirection: 'row', gap: 12 },
  modalBtnCancel: { flex: 1, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.sm, paddingVertical: 15, alignItems: 'center' },
  modalBtnCancelText: { color: COLORS.inkSoft, fontWeight: '600', fontSize: 14 },
  modalBtnSave: {
    flex: 2, backgroundColor: COLORS.accent, borderRadius: RADIUS.sm, paddingVertical: 15, alignItems: 'center',
    shadowColor: COLORS.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 3,
  },
  modalBtnSaveText: { color: '#fff', fontFamily: 'Poppins_700Bold', fontSize: 15 },
});