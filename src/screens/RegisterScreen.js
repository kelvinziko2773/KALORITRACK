import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  useFonts,
  Poppins_700Bold,
  Poppins_800ExtraBold,
  Poppins_600SemiBold_Italic,
} from '@expo-google-fonts/poppins';

import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  let [fontsLoaded] = useFonts({
    Poppins_700Bold,
    Poppins_800ExtraBold,
    Poppins_600SemiBold_Italic,
  });

  const float1 = useRef(new Animated.Value(0)).current;
  const float2 = useRef(new Animated.Value(0)).current;
  const float3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const makeFloat = (anim, duration, delay = 0) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration,
            useNativeDriver: true,
          }),
        ])
      );

    makeFloat(float1, 4500, 0).start();
    makeFloat(float2, 5200, 800).start();
    makeFloat(float3, 6000, 400).start();
  }, []);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      return Alert.alert('Error', 'Semua kolom wajib diisi');
    }
    if (password.length < 6) {
      return Alert.alert('Error', 'Password minimal 6 karakter');
    }

    setLoading(true);

    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', userCred.user.uid), {
        name,
        email,
        targetKalori: 2000,
        createdAt: new Date().toISOString(),
      });
      Alert.alert('Berhasil', 'Akun berhasil dibuat!');
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        Alert.alert('Error', 'Email sudah terdaftar');
      } else {
        Alert.alert('Error', 'Gagal membuat akun: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <LinearGradient
      colors={['#0B3D5C', '#15735C', '#3FA796', '#8FD9C4']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.3, y: 1 }}
      style={styles.gradientBg}
    >
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Floating fruit — dekorasi lebih jelas di belakang konten */}
      <Animated.Image
        source={require('../../assets/images/apple.png')}
        resizeMode="contain"
        style={[
          styles.fruitApple,
          {
            opacity: 0.55,
            transform: [
              {
                translateY: float1.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -14],
                }),
              },
              {
                rotate: float1.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['-4deg', '4deg'],
                }),
              },
            ],
          },
        ]}
      />

      <Animated.Image
        source={require('../../assets/images/banana.png')}
        resizeMode="contain"
        style={[
          styles.fruitBanana,
          {
            opacity: 0.5,
            transform: [
              {
                translateY: float2.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 16],
                }),
              },
              {
                rotate: float2.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['6deg', '-3deg'],
                }),
              },
            ],
          },
        ]}
      />

      <Animated.Image
        source={require('../../assets/images/semangka.png')}
        resizeMode="contain"
        style={[
          styles.fruitMelon,
          {
            opacity: 0.45,
            transform: [
              {
                translateY: float3.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -10],
                }),
              },
              {
                rotate: float3.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['-3deg', '5deg'],
                }),
              },
            ],
          },
        ]}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Ionicons name="nutrition" size={36} color="#1B5E20" />
          </View>

          <Text style={styles.appName}>
            Kalori<Text style={styles.appNameAccent}> Track</Text>
          </Text>
          <Text style={styles.tagline}>Mulai tracking kalorimu hari ini</Text>
        </View>

        {/* Register Card */}
        <View style={styles.card}>
          <Text style={styles.loginTitle}>Daftar Akun</Text>
          <Text style={styles.loginSubtitle}>
            Isi data berikut untuk membuat akun baru
          </Text>

          {/* Nama */}
          <Text style={styles.label}>Nama Lengkap</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={20} color="#7A8B7A" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Masukkan nama lengkap"
              placeholderTextColor="#A0A0A0"
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* Email */}
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={20} color="#7A8B7A" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="nama@email.com"
              placeholderTextColor="#A0A0A0"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Password */}
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color="#7A8B7A" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Min. 6 karakter"
              placeholderTextColor="#A0A0A0"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color="#7A8B7A"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.loginButtonText}>
              {loading ? 'Mendaftar...' : 'Daftar'}
            </Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>atau</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.registerText}>
              Sudah punya akun? <Text style={styles.registerHighlight}>Login</Text>
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.version}>Kalori Track v1.0</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBg: {
    flex: 1,
  },

  container: {
    flex: 1,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },

  fruitApple: {
    position: 'absolute',
    width: 150,
    height: 150,
    top: 25,
    right: -25,
  },

  fruitBanana: {
    position: 'absolute',
    width: 170,
    height: 170,
    top: '36%',
    left: -35,
  },

  fruitMelon: {
    position: 'absolute',
    width: 180,
    height: 180,
    bottom: 10,
    right: -40,
  },

  header: {
    alignItems: 'center',
    marginBottom: 32,
  },

  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  appName: {
    fontSize: 34,
    fontFamily: 'Poppins_800ExtraBold',
    color: '#FFFFFF',
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 5,
  },

  appNameAccent: {
    color: '#FFE066',
    fontFamily: 'Poppins_600SemiBold_Italic',
    fontSize: 30,
  },

  tagline: {
    color: '#EAF7E0',
    fontSize: 13.5,
    marginTop: 6,
    textAlign: 'center',
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 28,
    shadowColor: '#1B2E1C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },

  loginTitle: {
    fontSize: 21,
    fontFamily: 'Poppins_700Bold',
    color: '#1B2E1C',
    marginBottom: 4,
  },

  loginSubtitle: {
    fontSize: 13.5,
    color: '#8A958A',
    marginBottom: 22,
  },

  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3D4A3D',
    marginBottom: 6,
    marginTop: 4,
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8E0',
    borderRadius: 12,
    backgroundColor: '#FAFBF9',
    paddingHorizontal: 14,
    marginBottom: 16,
  },

  inputIcon: {
    marginRight: 8,
  },

  input: {
    flex: 1,
    paddingVertical: 13,
    fontSize: 15,
    color: '#1B2E1C',
  },

  loginButton: {
    backgroundColor: '#1B5E20',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
    shadowColor: '#1B5E20',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },

  loginButtonDisabled: {
    opacity: 0.6,
  },

  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
    letterSpacing: 0.3,
  },

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 22,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E9E3',
  },

  dividerText: {
    marginHorizontal: 10,
    color: '#A3AEA1',
    fontSize: 12.5,
  },

  registerButton: {
    alignItems: 'center',
  },

  registerText: {
    color: '#5C6B5C',
    fontSize: 13.5,
  },

  registerHighlight: {
    color: '#1B5E20',
    fontWeight: '700',
  },

  footer: {
    marginTop: 28,
    alignItems: 'center',
  },

  version: {
    color: '#B0B8AF',
    fontSize: 11.5,
  },
});