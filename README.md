# 🥗 KaloriTrack

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)

KaloriTrack adalah aplikasi mobile berbasis **React Native** dan **Expo**
untuk mencatat dan memantau asupan kalori harian secara mudah dan akurat.
Aplikasi ini dirancang untuk membantu pengguna menjaga pola makan sehat
dengan fitur pencatatan makanan, scan otomatis, dan statistik kalori mingguan
yang ditampilkan secara visual dan interaktif.

Dilengkapi dengan autentikasi Firebase yang aman, database real-time,
serta web dashboard publik yang dapat diakses dari browser kapan saja dan di mana saja.
KaloriTrack hadir sebagai solusi digital untuk gaya hidup sehat masa kini.

---

## 👥 Anggota Tim dan Pembagian Tugas

| No | Nama | NRP | Tugas Utama | Tanggung Jawab Demo |
|----|------|-----|-------------|---------------------|
| 1 | Ziko Kelvin | 0923040090 | UI/UX, Screens | StatsScreen, HomeScreen |
| 2 | Fauzi Eka | 1234567891 | Firebase, Auth | Login, Register |


> Sesuaikan nama, NRP, dan pembagian tugas dengan tim kamu

---

## ✨ Fitur Aplikasi

- 🔐 **Login & Register** — Autentikasi aman dengan Firebase Authentication
- ➕ **Tambah Makanan** — Catat makanan beserta informasi kalori
- 📷 **Scan Makanan** — Identifikasi makanan otomatis via kamera
- 📊 **Statistik Mingguan** — Grafik kalori 7 hari terakhir
- 👤 **Profil Pengguna** — Kelola data dan target kalori harian
- 🌐 **Web Dashboard** — Pantau statistik kalori dari browser

---

## 🛠️ Teknologi yang Digunakan

| Teknologi | Kegunaan |
|-----------|----------|
| React Native (Expo) | Framework utama aplikasi mobile |
| Firebase Authentication | Login & Register pengguna |
| Firebase Firestore | Database real-time |
| GitHub Pages | Web dashboard publik |

---

## 🚀 Cara Menjalankan

### 1. Clone repo

```bash
git clone https://github.com/kelvinziko2773/KALORITRACK.git
cd KALORITRACK
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup Firebase

```bash
cp src/config/firebase.example.js src/config/firebase.js
```

Lalu isi `src/config/firebase.js` dengan config Firebase kamu.

### 4. Jalankan aplikasi

```bash
npx expo start
```

Buka di:
- 📱 **Expo Go** — scan QR code dari terminal
- 🤖 **Android Emulator**
- 🍎 **iOS Simulator**

---

## 🌐 Web Dashboard

Dashboard statistik kalori tersedia secara publik di:

👉 **[https://kelvinziko2773.github.io/KALORITRACK](https://kelvinziko2773.github.io/KALORITRACK)**

---

## 📁 Struktur Project