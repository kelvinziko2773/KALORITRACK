# 🥗 KaloriTrack

<p align="center">
  <img src="https://images.emojiterra.com/google/noto-emoji/unicode-15/color/512px/1f957.png" width="150" alt="Makanan Sehat"/>
</p>

<p align="center">
  KaloriTrack adalah aplikasi mobile berbasis <b>React Native</b> dan <b>Expo</b>
  untuk mencatat dan memantau asupan kalori harian secara mudah dan akurat.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB"/>
  <img src="https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white"/>
  <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black"/>
</p>

---

## 👥 Anggota Tim dan Pembagian Tugas

| No | Nama | NRP | Tugas Utama | Tanggung Jawab Demo |
|----|------|-----|-------------|---------------------|
| 1 | Ziko Kelvin | 1234567890 | UI/UX, Screens | StatsScreen, HomeScreen |
| 2 | Nama Anggota 2 | 1234567891 | Firebase, Auth | Login, Register |
| 3 | Nama Anggota 3 | 1234567892 | API, Scan Makanan | ScanfoodScreen |

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