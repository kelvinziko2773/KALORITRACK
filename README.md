# 🥗 KaloriTrack

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
| 1 | Ziko Kelvin | 0923040090 | Merancang seluruh sistem UI/UX aplikasi Kalori Track, merancang seluruh konsep dan tampilan pada Aplikasi termasuk integrasi dan jalannya Axios untuk komunikasi API eksternal| Menjelaskan seluruh konsep Aplikasi, dan seluruh sistem yang digunakan, dan menjelaskan fungsi dari aplikasi tersebut untuk mengontrol kalori|
| 2 | Fauzi Eka | 0923040106 | Merancang Firebase, Auth untuk integrasi layanan Firebase | Menjelaskan manajemen data lokal aplikasi dan arsitektur Firebase|

## ✨ Fitur Aplikasi

- 🔐 **Login & Register** — Autentikasi aman dengan Firebase Authentication
- ➕ **Tambah Makanan** — Catat makanan beserta informasi kalori
- 📊 **Statistik Mingguan** — Grafik kalori 7 hari terakhir
- 👤 **Profil Pengguna** — Kelola data dan target kalori harian
- 🌐 **Web Dashboard** — Pantau statistik kalori dari browser

## Penjelasan Singkat / Fungsi Aplikasi Kalori Track
Aplikasi ini dibuat untuk membantu pengguna dalam mencatat dan memantau asupan kalori harian secara mudah, cepat, dan akurat. Dengan antarmuka yang sederhana dan intuitif, pengguna dapat dengan mudah mencatat setiap makanan yang dikonsumsi beserta informasi kalorinya, baik secara manual maupun melalui fitur scan makanan menggunakan kamera. Aplikasi ini dirancang untuk mendukung gaya hidup sehat dengan memberikan gambaran yang jelas tentang pola makan pengguna setiap harinya.

Selain pencatatan makanan, KaloriTrack juga menyediakan fitur statistik kalori mingguan yang ditampilkan dalam bentuk grafik batang interaktif, sehingga pengguna dapat dengan mudah melihat tren konsumsi kalori mereka selama 7 hari terakhir. Pengguna juga dapat mengetahui rata-rata kalori per hari, jumlah hari aktif, dan total kalori dalam satu minggu, sehingga mereka dapat mengambil keputusan yang lebih baik dalam mengatur pola makan dan mencapai target kesehatan yang diinginkan.

KaloriTrack dilengkapi dengan sistem autentikasi yang aman sehingga setiap pengguna memiliki akun pribadi dan data yang tersimpan bersifat privat. Pengguna yang sudah login dapat mengakses seluruh fitur aplikasi termasuk riwayat kalori harian, statistik mingguan, dan profil pengguna. Selain itu, tersedia juga web dashboard publik yang dapat diakses langsung dari browser tanpa perlu menginstal aplikasi, sehingga memudahkan pengguna untuk memantau data kalori mereka dari perangkat apa pun.

Teknologi utama yang digunakan:
- **Expo** untuk membangun aplikasi mobile berbasis React Native secara cepat, efisien, dan dapat dijalankan di berbagai platform.
- **React Native** sebagai framework utama untuk membangun tampilan aplikasi yang responsif dan berjalan lancar di Android maupun iOS.
- **Firebase Authentication** untuk fitur login, register, dan manajemen sesi pengguna secara aman sehingga data setiap pengguna terlindungi.
- **Cloud Firestore** sebagai database realtime untuk menyimpan dan mengambil data log makanan setiap pengguna secara cepat dan sinkron.
- **Nutrition API** untuk mengambil data kalori dan informasi nutrisi makanan secara otomatis dari sumber eksternal sehingga pengguna tidak perlu memasukkan data kalori secara manual.
- **GitHub Pages** untuk menampilkan web dashboard statistik kalori yang dapat diakses publik dari browser kapan saja dan di mana saja tanpa perlu menginstal aplikasi.


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