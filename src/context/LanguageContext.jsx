import { createContext, useState, useContext, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
    id: {
        "app.title": "Al Quran",
        "menu.asmaulHusna": "Asmaul Husna",
        "menu.dailyPrayers": "Doa Harian",
        "menu.dzikir": "Dzikir Pagi & Petang",
        "menu.doaKhatam": "Doa Khatam",
        "menu.profile": "Profil Saya",
        "menu.others": "Menu Lainnya",
        "surah.verseView": "Tampilan Ayat",
        "surah.pageView": "Tampilan Halaman",
        "surah.selectScript": "Pilih Tulisan",
        "surah.plain": "Tanpa Tajwid",
        "surah.tajweed": "Dengan Tajwid",
        "surah.verse": "Ayat",
        "surah.loading": "Memuat...",
        "surah.shareTitle": "Bagikan Ayat",
        "surah.cancel": "Batal",
        "surah.shareImage": "Bagikan Gambar",
        "surah.end": "Akhir Surah",
        "surah.juz": "Juz",
        "surah.page": "Halaman",
        "surah.prev": "Sblm",
        "surah.next": "Lnjt",
        "home.lastRead": "Terakhir Dibaca",
        "home.dailyInspiration": "Inspirasi Harian",
        "home.searchPlaceholder": "Cari Surah...",
        "home.all": "Semua",
        "home.bookmarks": "Penanda",
        "home.verses": "Ayat",
        "tasbih.title": "Tasbih Digital",
        "tasbih.tap": "Tap",
        "tasbih.reset": "Reset",
        "tasbih.target": "Target",
        "tasbih.noTarget": "Tanpa Target",
        "tasbih.history": "Riwayat Dzikir",
        "tasbih.saveInfo": "Cara Menyimpan: Setiap kali Anda menekan tombol Reset, hitungan terakhir akan otomatis tersimpan.",
        "tasbih.noHistory": "Belum ada riwayat.",
        "tasbih.clearAll": "Hapus Semua",
        "tasbih.close": "Tutup",
        "tasbih.targetReached": "Target Tercapai!",
        "tasbih.reachedMsg": "Anda telah mencapai {count} hitungan.",
        "tasbih.continue": "Lanjut",
        "prayer.title": "Jadwal Sholat",
        "prayer.next": "Sholat Berikutnya",
        "prayer.enableLoc": "Aktifkan Lokasi",
        "prayer.refreshLoc": "Refresh Lokasi",
        "prayer.locating": "Mencari Lokasi...",
        "prayer.unknown": "Lokasi Tidak Diketahui",
        "prayer.fajr": "Subuh",
        "prayer.sunrise": "Terbit",
        "prayer.dhuhr": "Dzuhur",
        "prayer.asr": "Ashar",
        "prayer.maghrib": "Maghrib",
        "prayer.isha": "Isya",
        "prayer.testAdzan": "Tes Adzan",
        "prayer.testFajr": "Tes Subuh",
        "prayer.simulation": "Simulasi",
        "prayer.stop": "Stop Adzan",
        "qibla.title": "Arah Kiblat",
        "qibla.findingLoc": "Mencari GPS...",
        "qibla.findingCity": "Mencari nama kota...",
        "qibla.calibrate": "Kalibrasi Kompas",
        "qibla.calibrateInfo": "Gerakkan HP Anda membentuk angka 8 di udara untuk meningkatkan akurasi kompas.",
        "qibla.done": "Selesai",
        "asmaulHusna.subtitle": "99 Nama Allah yang Indah",
        "asmaulHusna.search": "Cari nama...",
        "dailyPrayers.subtitle": "Kumpulan Doa Sehari-hari",
        "dailyPrayers.search": "Cari doa...",
        "dailyPrayers.listen": "Dengarkan",
        "dailyPrayers.stop": "Stop",
        "dailyPrayers.pause": "Pause",
        "dailyPrayers.resume": "Lanjut",
        "dailyPrayers.audioUnavailable": "Audio tidak tersedia untuk doa ini.",
        "dzikir.subtitle": "Dzikir Pagi & Petang",
        "dzikir.search": "Cari dzikir...",
        "doaKhatam.subtitle": "Doa Khatam Al-Qur'an",
        "doaKhatam.search": "Cari doa...",
        "common.loading": "Memuat...",
        "common.error": "Terjadi kesalahan"
    },
    en: {
        "app.title": "Al Quran",
        "menu.asmaulHusna": "Asmaul Husna",
        "menu.dailyPrayers": "Daily Prayers",
        "menu.dzikir": "Morning & Evening Dhikr",
        "menu.doaKhatam": "Khatam Prayer",
        "menu.profile": "My Profile",
        "menu.others": "Other Menu",
        "surah.verseView": "Verse View",
        "surah.pageView": "Page View",
        "surah.selectScript": "Select Script",
        "surah.plain": "Plain Text",
        "surah.tajweed": "Tajweed",
        "surah.verse": "Verse",
        "surah.loading": "Loading...",
        "surah.shareTitle": "Share Verse",
        "surah.cancel": "Cancel",
        "surah.shareImage": "Share Image",
        "surah.end": "End of Surah",
        "surah.juz": "Juz",
        "surah.page": "Page",
        "surah.prev": "Prev",
        "surah.next": "Next",
        "home.lastRead": "Last Read",
        "home.dailyInspiration": "Daily Inspiration",
        "home.searchPlaceholder": "Search Surah...",
        "home.all": "All",
        "home.bookmarks": "Bookmarks",
        "home.verses": "Verses",
        "tasbih.title": "Digital Tasbih",
        "tasbih.tap": "Tap",
        "tasbih.reset": "Reset",
        "tasbih.target": "Target",
        "tasbih.noTarget": "No Target",
        "tasbih.history": "Dhikr History",
        "tasbih.saveInfo": "How to Save: Every time you press Reset, the last count will be automatically saved.",
        "tasbih.noHistory": "No history yet.",
        "tasbih.clearAll": "Clear All",
        "tasbih.close": "Close",
        "tasbih.targetReached": "Target Reached!",
        "tasbih.reachedMsg": "You have reached {count} counts.",
        "tasbih.continue": "Continue",
        "prayer.title": "Prayer Times",
        "prayer.next": "Next Prayer",
        "prayer.enableLoc": "Enable Location",
        "prayer.refreshLoc": "Refresh Location",
        "prayer.locating": "Locating...",
        "prayer.unknown": "Unknown Location",
        "prayer.fajr": "Fajr",
        "prayer.sunrise": "Sunrise",
        "prayer.dhuhr": "Dhuhr",
        "prayer.asr": "Asr",
        "prayer.maghrib": "Maghrib",
        "prayer.isha": "Isha",
        "prayer.testAdzan": "Test Adzan",
        "prayer.testFajr": "Test Fajr",
        "prayer.simulation": "Simulation",
        "prayer.stop": "Stop Adzan",
        "qibla.title": "Qibla Direction",
        "qibla.findingLoc": "Finding GPS...",
        "qibla.findingCity": "Finding city name...",
        "qibla.calibrate": "Calibrate Compass",
        "qibla.calibrateInfo": "Move your phone in a figure 8 pattern to improve compass accuracy.",
        "qibla.done": "Done",
        "asmaulHusna.subtitle": "99 Beautiful Names of Allah",
        "asmaulHusna.search": "Search name...",
        "dailyPrayers.subtitle": "Collection of Daily Prayers",
        "dailyPrayers.search": "Search prayer...",
        "dailyPrayers.listen": "Listen",
        "dailyPrayers.stop": "Stop",
        "dailyPrayers.pause": "Pause",
        "dailyPrayers.resume": "Resume",
        "dailyPrayers.audioUnavailable": "Audio is not available for this prayer.",
        "dzikir.subtitle": "Morning & Evening Dhikr",
        "dzikir.search": "Search dhikr...",
        "doaKhatam.subtitle": "Khatam Al-Quran Prayer",
        "doaKhatam.search": "Search prayer...",
        "common.loading": "Loading...",
        "common.error": "An error occurred"
    }
};

const dailyVersesData = [
    {
        id: 1,
        text_id: "Maka sesungguhnya bersama kesulitan ada kemudahan.",
        text_en: "For indeed, with hardship [will be] ease.",
        ref: "QS Al-Insyirah: 5"
    },
    {
        id: 2,
        text_id: "Dan Dia mendapatimu sebagai seorang yang bingung, lalu Dia memberikan petunjuk.",
        text_en: "And He found you lost and guided [you].",
        ref: "QS Ad-Duha: 7"
    },
    {
        id: 3,
        text_id: "Ingatlah, hanya dengan mengingat Allah hati menjadi tenteram.",
        text_en: "Unquestionably, by the remembrance of Allah hearts are assured.",
        ref: "QS Ar-Ra'd: 28"
    },
    {
        id: 4,
        text_id: "Allah tidak membebani seseorang melainkan sesuai dengan kesanggupannya.",
        text_en: "Allah does not charge a soul except [with that within] its capacity.",
        ref: "QS Al-Baqarah: 286"
    },
    {
        id: 5,
        text_id: "Dan bersabarlah, sesungguhnya Allah bersama orang-orang yang sabar.",
        text_en: "And be patient. Indeed, Allah is with the patient.",
        ref: "QS Al-Anfal: 46"
    }
];

export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState(localStorage.getItem('appLanguage') || 'id');

    useEffect(() => {
        localStorage.setItem('appLanguage', language);
    }, [language]);

    const t = (key) => {
        return translations[language][key] || key;
    };

    const getDailyVerse = () => {
        const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
        const verse = dailyVersesData[dayOfYear % dailyVersesData.length];
        return {
            text: language === 'id' ? verse.text_id : verse.text_en,
            ref: verse.ref
        };
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, getDailyVerse }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    return useContext(LanguageContext);
}
