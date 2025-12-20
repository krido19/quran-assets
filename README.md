# âœ¨ Islamic App v1.1 - Perjalanan Spiritual yang Lebih Personal

Selamat datang di versi **1.1**! Kami telah bekerja keras untuk membawa fitur-fitur yang akan membimbing Anda menjadi versi terbaik diri Anda setiap harinya. ðŸŒŸ

---

## ðŸš€ Apa yang Baru di v1.1?

### ðŸŽ¨ Personalitas dalam Membaca (Font Customization)
Kini Al-Qur'an terasa lebih dekat. Atur sendiri gaya membaca Anda:
- **3 Pilihan Font Arabic Premium**: *Amiri (Utsmani)* yang elegan, *Indopak* yang familiar, atau *Lateef* yang tegas.
- **Slider Ukuran Font**: Sesuaikan kenyamanan mata Anda, dari yang mungil hingga yang besar dan jelas.
- **Live Preview**: Lihat perubahan seketika di halaman Profil!

### ðŸ“ˆ Mutaba'ah Yaumiyah (Worship Tracker)
Jadilah hamba yang istiqomah dengan asisten tracker pribadi Anda:
- **Checklist Ibadah Harian**: Catat Sholat Fardhu, Sunnah, Tilawah, hingga Sedekah.
- **Visualisasi Progres**: Lihat persentase pencapaian harian Anda dengan progress bar yang dinamis.
- **Riwayat Kalender**: Pantau konsistensi Anda dari hari ke hari dengan mudah.

### ðŸ”” Pengingat Cerdas (Random Reminders)
Kami hadir untuk mengingatkan dengan penuh kasih sayang:
- **Notifikasi Setelah Maghrib**: Pengingat otomatis muncul di waktu acak setelah Maghrib (saat-saat produktivitas spiritual meningkat).
- **Pesan Menyentuh**: *"Sudah sholat 5 waktu?"*, *"Sudah baca Al-Qur'an?"* â€” pengingat kecil untuk makna yang besar.
- **Integrasi Android/iOS**: Berjalan mulus di perangkat mobile melalui Capacitor.

- **Auto-Scroll Magic**: Ketuk hasil pencarian, dan Anda akan langsung dibawa ke ayat tersebut, bahkan untuk ayat nomor besar sekalipun.
- **Hasil Murni Terjemahan**: Pencarian kini lebih fokus dengan hanya menampilkan arti/terjemahan ayat, tanpa teks Arab yang memenuhi layar.
- **Desain Premium**: Tombol "Lihat Lebih Banyak Hasil" dengan gradasi warna dan hover effect yang modern.

### ðŸŒ Mode Offline-First (PWA & Smart Caching)
Bawa Al-Qur'an kemanapun, bahkan ke tempat tanpa sinyal:
- **Offline Access**: Berkat teknologi PWA, aplikasi tetap bisa dibuka tanpa internet.
- **Smart Data Caching**: Daftar Surah dan ayat yang pernah Anda buka otomatis tersimpan di memori ponsel.
- **Indikator Koneksi**: Pesan cerdas yang memberitahu saat Anda sedang menggunakan data cache karena offline.

### ðŸ·ï¸ Bookmark Berbasis Tag (Enhanced Bookmarks)
Kelola perpustakaan spiritual Anda dengan lebih rapi:
- **Kategorisasi**: Tambahkan tag seperti *Hafalan*, *Favorit*, atau *Penting* pada setiap bookmark.
- **Custom Tags**: Buat tag kustom Anda sendiri sesuai kebutuhan.
- **Filtering Cerdas**: Filter semua bookmark Anda berdasarkan tag di halaman Profil.
- **Migration & Cleanup**: Hapus tag dengan sekali klik dan nikmati migrasi otomatis dari bookmark lama Anda.

---

## ðŸ› ï¸ Catatan Teknis (Developer Guide)

Dokumen ini berisi catatan lengkap proses pengembangan aplikasi Al-Quran & Jadwal Sholat berbasis React + Capacitor.

### A. Teknologi Inti
- **Framework**: React.js dengan Vite sebagai builder.
- **Mobile Foundation**: Capacitor.js untuk akses fitur native (GPS, Notifikasi, Getar).
- **Styling**: Vanilla CSS dengan sistem Glassmorphism & Responsive Design.

### B. Fitur & Penanganan Masalah (v1.1 Update)

#### 1. Lokasi & Waktu Sholat
- **Library**: `adhan` (JavaScript library untuk perhitungan waktu sholat).
- **Caching**: Lokasi disimpan secara otomatis untuk kecepatan akses (Instant Load).

#### 2. Local Notifications (Reminders)
- **Plugin**: `@capacitor/local-notifications`.
- **Logic**: Notifikasi dijadwalkan setiap kali aplikasi dibuka. Logic acak memastikan pengingat terasa lebih manusiawi dan tidak monoton.

#### 3. Global Search & Navigation
- **Quran.com API**: Endpoint `/search` untuk pencarian berbasis linguistik.
- **React Router State**: Navigasi ke ayat spesifik menggunakan `location.state` untuk mentrigger auto-scroll yang lebih stabil.
- **Data Filtering**: Logika ekstraksi terjemahan dari array `translations` untuk memastikan hasil pencarian bebas teks Arab.

#### 4. PWA & Caching Layer
- **Service Worker**: `@vite-plugin-pwa` untuk registrasi service worker otomatis.
- **Persistence Layer**: `localStorage` digunakan sebagai database lokal untuk caching Surah info dan array verses (hingga 150 ayat pertama per surah).

### C. Panduan Build Android
1. `npm run build`
2. `npx cap sync`
3. `cd android && ./gradlew assembleRelease`

---

## ðŸ¤ Kontribusi & Lisensi
Proyek ini menggunakan lisensi **MIT**. Mari bersama membangun aplikasi yang bermanfaat bagi umat.

---
ðŸ“– **Ingin tahu lebih dalam tentang teknis aplikasi ini?**  
Cek [DEVELOPER_GUIDE.md](file:///c:/Antigravity/QURAN/Quran/DEVELOPER_GUIDE.md) untuk panduan lengkap pengembangan, deployment, dan troubleshooting.

*Dibuat dengan â¤ï¸ oleh Antigravity & Sahabat Muslim - 2025*



