---
description: Cara deploy live update ke app tanpa ganti APK menggunakan GitHub Releases
---

# Deploy Live Update (GitHub Releases)

## Cara Kerja
1. Push tag versi baru → GitHub Actions build bundle.zip
2. Release dibuat otomatis dengan bundle.zip
3. App buka → cek GitHub API → download & apply update

## Deploy Update Baru

// turbo-all

### 1. Update Versi di updater.js
Edit `src/lib/updater.js` dan update `CURRENT_VERSION`:
```javascript
const CURRENT_VERSION = '1.0.1'; // Ganti ke versi baru
```

### 2. Commit Perubahan
```bash
git add -A
git commit -m "Release v1.0.1 - deskripsi update"
```

### 3. Buat Tag dan Push
```bash
git tag v1.0.1
git push origin main --tags
```

### 4. Tunggu GitHub Actions
- Buka: https://github.com/rido19/Quran/actions
- Workflow "Release Bundle" akan berjalan otomatis
- Setelah selesai, release dengan bundle.zip akan dibuat

## Catatan

- Tag HARUS dimulai dengan `v` (contoh: v1.0.1, v1.0.2)
- Versi di `updater.js` harus sama dengan tag
- Update otomatis diterapkan saat user buka app berikutnya

## Rollback

Jika ada masalah, hapus tag dan release:
```bash
git tag -d v1.0.1
git push origin :refs/tags/v1.0.1
```

Lalu buat ulang dengan versi yang benar.

