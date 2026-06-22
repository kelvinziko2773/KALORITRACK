import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyACABaBtdAgT6momcF9Q7fYyLf9-1L8DgA",
  authDomain: "kaloritrack-33f43.firebaseapp.com",
  projectId: "kaloritrack-33f43",
  storageBucket: "kaloritrack-33f43.firebasestorage.app",
  messagingSenderId: "680640087028",
  appId: "1:680640087028:web:5f0f38aa3d0915c4ca6fa1"
};

const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApp();

let auth;

try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e) {
  auth = getAuth(app);
}

const db = getFirestore(app);

export { auth, db };
