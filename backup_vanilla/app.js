// App State
const state = {
    currentView: 'view-quran',
    location: null,
    prayerTimes: null,
    qiblaOffset: 0
};

// DOM Elements
const views = document.querySelectorAll('.view');
const navItems = document.querySelectorAll('.nav-item');
const pageTitle = document.getElementById('page-title');
const themeToggleBtn = document.getElementById('theme-toggle');

// Theme Logic
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
}

themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    themeToggleBtn.innerHTML = isDark ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
});

// Navigation Logic
navItems.forEach(item => {
    item.addEventListener('click', () => {
        const targetId = item.dataset.target;
        switchView(targetId);
    });
});

function switchView(viewId) {
    // Update State
    state.currentView = viewId;

    // Update UI
    views.forEach(view => view.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');

    navItems.forEach(item => {
        if (item.dataset.target === viewId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Update Title
    switch (viewId) {
        case 'view-quran': pageTitle.textContent = 'Al Quran'; break;
        case 'view-prayer': pageTitle.textContent = 'Prayer Times'; initPrayerTimes(); break;
        case 'view-qibla': pageTitle.textContent = 'Qibla Direction'; initQibla(); break;
        case 'view-login': pageTitle.textContent = 'Profile'; break;
        case 'view-signup': pageTitle.textContent = 'Sign Up'; break;
    }
}

// --- Quran Feature ---
let currentAudio = null;
let currentSurahData = null;
let currentVerseIndex = 0;
let isPlaying = false;
let bookmarks = JSON.parse(localStorage.getItem('quranBookmarks')) || [];
let allSurahsCache = []; // Cache for filtering

async function initQuran() {
    const listContainer = document.getElementById('surah-list');
    const filterAllBtn = document.getElementById('filter-all');
    const filterBookmarksBtn = document.getElementById('filter-bookmarks');

    // Setup Filter Events
    filterAllBtn.onclick = () => {
        filterAllBtn.classList.add('active');
        filterBookmarksBtn.classList.remove('active');
        renderSurahList(allSurahsCache);
    };

    filterBookmarksBtn.onclick = () => {
        filterBookmarksBtn.classList.add('active');
        filterAllBtn.classList.remove('active');
        const bookmarkedSurahs = allSurahsCache.filter(s => bookmarks.some(b => b.type === 'surah' && b.id === s.id));
        renderSurahList(bookmarkedSurahs);
    };

    try {
        const response = await fetch('https://api.quran.com/api/v4/chapters?language=en');
        const data = await response.json();
        allSurahsCache = data.chapters;

        renderSurahList(allSurahsCache);
    } catch (error) {
        listContainer.innerHTML = '<div style="text-align:center; padding:20px; color:red;">Failed to load Quran data. Check internet connection.</div>';
        console.error(error);
    }
}

function renderSurahList(surahs) {
    const listContainer = document.getElementById('surah-list');
    listContainer.innerHTML = '';

    if (surahs.length === 0) {
        listContainer.innerHTML = '<div style="text-align:center; padding:20px; color:var(--text-muted);">No Surahs found.</div>';
        return;
    }

    surahs.forEach(surah => {
        const el = document.createElement('div');
        el.className = 'surah-item';
        el.innerHTML = `
            <div class="surah-number">${surah.id}</div>
            <div class="surah-info">
                <div class="surah-name-en">${surah.name_simple}</div>
                <div class="surah-details">${surah.translated_name.name} • ${surah.verses_count} Verses</div>
            </div>
            <div class="surah-name-ar">${surah.name_arabic}</div>
        `;
        el.addEventListener('click', () => {
            openSurahDetail(surah);
        });
        listContainer.appendChild(el);
    });
}

async function openSurahDetail(surah) {
    switchView('view-surah-detail');
    document.getElementById('detail-surah-name').textContent = surah.name_simple;
    document.getElementById('verses-list').innerHTML = '<div style="text-align:center; padding:20px;">Loading Verses...</div>';

    // Setup Back Button
    document.getElementById('back-btn').onclick = () => {
        stopAudio();
        switchView('view-quran');
    };

    // Setup Bookmark Button
    updateBookmarkButton(surah.id);
    document.getElementById('bookmark-surah-btn').onclick = () => toggleBookmark(surah);

    try {
        // Fetch verses with audio and translation
        // 131: Clear Quran (English)
        // 33: Indonesian Islamic Affairs Ministry (Indonesian)
        // 57: Transliteration
        const response = await fetch(`https://api.quran.com/api/v4/verses/by_chapter/${surah.id}?language=en&words=false&translations=131,33,57&audio=1&fields=text_uthmani,text_indopak&per_page=${surah.verses_count}`);

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        currentSurahData = data.verses;
        currentVerseIndex = 0;

        renderVerses(currentSurahData);
        setupAudioPlayer();

    } catch (error) {
        document.getElementById('verses-list').innerHTML = `<div style="text-align:center; padding:20px; color:red;">Failed to load verses.<br><small>${error.message}</small></div>`;
        console.error(error);
    }
}

function renderVerses(verses) {
    const container = document.getElementById('verses-list');
    container.innerHTML = '';

    verses.forEach((verse, index) => {
        const el = document.createElement('div');
        el.className = 'verse-item';
        el.id = `verse-${index}`;

        // Extract translations
        const getTranslation = (id) => {
            if (!verse.translations) return "";
            const t = verse.translations.find(tr => tr.resource_id === id);
            return t ? t.text : "";
        };

        const textEn = getTranslation(131);
        const textId = getTranslation(33);
        const textTransliteration = getTranslation(57);

        el.innerHTML = `
            <div class="verse-header">
                <span class="verse-number">${verse.verse_key}</span>
                <div class="verse-actions">
                    <button class="icon-btn" onclick="playFromVerse(${index})"><i class="fa-solid fa-play"></i></button>
                    <button class="icon-btn" onclick="toggleVerseBookmark('${verse.verse_key}')"><i class="fa-regular fa-bookmark"></i></button>
                </div>
            </div>
            <div class="verse-arabic">${verse.text_uthmani || verse.text_indopak || "Arabic Text"}</div>
            <div class="verse-transliteration">${textTransliteration}</div>
            <div class="verse-translation-group">
                <div class="verse-translation-id"><b>ID:</b> ${textId}</div>
                <div class="verse-translation-en"><b>EN:</b> ${textEn}</div>
            </div>
        `;
        container.appendChild(el);
    });
}

// --- Audio Player Logic ---
function setupAudioPlayer() {
    const playBtn = document.getElementById('audio-play-btn');
    const prevBtn = document.getElementById('audio-prev-btn');
    const nextBtn = document.getElementById('audio-next-btn');

    playBtn.onclick = togglePlay;
    prevBtn.onclick = playPrev;
    nextBtn.onclick = playNext;

    updateAudioUI();
}

function togglePlay() {
    if (isPlaying) {
        pauseAudio();
    } else {
        playAudio();
    }
}

function playAudio() {
    if (!currentSurahData || currentSurahData.length === 0) return;

    if (!currentAudio) {
        loadAudio(currentVerseIndex);
    }

    currentAudio.play();
    isPlaying = true;
    updateAudioUI();
}

function pauseAudio() {
    if (currentAudio) {
        currentAudio.pause();
    }
    isPlaying = false;
    updateAudioUI();
}

function stopAudio() {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }
    isPlaying = false;
    updateAudioUI();
}

function loadAudio(index) {
    if (currentAudio) {
        currentAudio.pause();
    }

    if (index < 0 || index >= currentSurahData.length) return;

    currentVerseIndex = index;
    const verse = currentSurahData[index];

    const audioUrl = verse.audio?.url || verse.audio_url;
    if (!audioUrl) {
        console.error("No audio URL found for verse", verse);
        return;
    }

    const fullUrl = audioUrl.startsWith('http') ? audioUrl : `https://verses.quran.com/${audioUrl}`;

    currentAudio = new Audio(fullUrl);
    currentAudio.onended = () => {
        playNext();
    };

    highlightVerse(index);
    updateAudioUI();
}

function playFromVerse(index) {
    loadAudio(index);
    playAudio();
}

function playNext() {
    if (currentVerseIndex < currentSurahData.length - 1) {
        loadAudio(currentVerseIndex + 1);
        playAudio();
    } else {
        stopAudio();
    }
}

function playPrev() {
    if (currentVerseIndex > 0) {
        loadAudio(currentVerseIndex - 1);
        playAudio();
    }
}

function highlightVerse(index) {
    // Remove active class from all
    document.querySelectorAll('.verse-item').forEach(el => el.classList.remove('active'));

    // Add to current
    const el = document.getElementById(`verse-${index}`);
    if (el) {
        el.classList.add('active');
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    document.getElementById('audio-current-verse').textContent = `Verse ${currentSurahData[index].verse_key}`;
}

function updateAudioUI() {
    const btn = document.getElementById('audio-play-btn');
    btn.innerHTML = isPlaying ? '<i class="fa-solid fa-pause"></i>' : '<i class="fa-solid fa-play"></i>';
}

// --- Bookmarks Logic ---
function toggleBookmark(surah) {
    const index = bookmarks.findIndex(b => b.type === 'surah' && b.id === surah.id);
    if (index === -1) {
        bookmarks.push({ type: 'surah', id: surah.id, name: surah.name_simple });
        alert('Surah bookmarked!');
    } else {
        bookmarks.splice(index, 1);
        alert('Bookmark removed.');
    }
    localStorage.setItem('quranBookmarks', JSON.stringify(bookmarks));
    updateBookmarkButton(surah.id);
}

function updateBookmarkButton(surahId) {
    const btn = document.getElementById('bookmark-surah-btn');
    const isBookmarked = bookmarks.some(b => b.type === 'surah' && b.id === surahId);
    btn.innerHTML = isBookmarked ? '<i class="fa-solid fa-bookmark"></i>' : '<i class="fa-regular fa-bookmark"></i>';
}

function toggleVerseBookmark(verseKey) {
    // Implementation for verse bookmarking if needed
    alert(`Verse ${verseKey} bookmarking coming soon!`);
}

// --- Prayer Times Feature ---
function initPrayerTimes() {
    if (!state.location) {
        getLocation();
    } else {
        renderPrayerTimes();
    }
}

function getLocation() {
    const listContainer = document.getElementById('prayer-times-list');
    listContainer.innerHTML = '<div style="text-align:center; padding:20px;">Locating...</div>';
    document.getElementById('location-name').textContent = "Locating...";

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                state.location = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                };
                getCityName(state.location.latitude, state.location.longitude);
                renderPrayerTimes();
            },
            error => {
                console.warn("Geolocation failed, using default (Jakarta)", error);
                useDefaultLocation();
            },
            { timeout: 10000 }
        );
    } else {
        useDefaultLocation();
    }
}

function useDefaultLocation() {
    // Default to Jakarta, Indonesia
    state.location = {
        latitude: -6.2088,
        longitude: 106.8456
    };
    state.locationName = "Jakarta (Default)";
    document.getElementById('location-name').textContent = state.locationName;
    alert("Location access denied or failed. Using Jakarta as default.");
    renderPrayerTimes();
}

async function getCityName(lat, lng) {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const data = await response.json();
        // Try to get city, town, or village, or fallback to generic
        const city = data.address.city || data.address.town || data.address.village || data.address.county || "Unknown Location";
        state.locationName = city;
        document.getElementById('location-name').textContent = city;
    } catch (error) {
        console.error("Failed to get city name", error);
        // Fallback to coordinates if offline
        state.locationName = `${lat.toFixed(2)}, ${lng.toFixed(2)}`;
        document.getElementById('location-name').textContent = state.locationName;
    }
}

function renderPrayerTimes() {
    if (!state.location) return;

    // Ensure location name is set if not already (e.g. from default)
    if (!state.locationName) {
        document.getElementById('location-name').textContent = "GPS Location";
    } else {
        document.getElementById('location-name').textContent = state.locationName;
    }

    const coordinates = new adhan.Coordinates(state.location.latitude, state.location.longitude);
    const params = adhan.CalculationMethod.MuslimWorldLeague();
    const date = new Date();
    const prayerTimes = new adhan.PrayerTimes(coordinates, date, params);

    const timeFormatter = new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
    });

    const times = [
        { name: 'Fajr', time: prayerTimes.fajr },
        { name: 'Sunrise', time: prayerTimes.sunrise },
        { name: 'Dhuhr', time: prayerTimes.dhuhr },
        { name: 'Asr', time: prayerTimes.asr },
        { name: 'Maghrib', time: prayerTimes.maghrib },
        { name: 'Isha', time: prayerTimes.isha },
    ];

    const listContainer = document.getElementById('prayer-times-list');
    listContainer.innerHTML = '';

    const nextPrayer = prayerTimes.nextPrayer();
    const nextPrayerTime = prayerTimes.timeForPrayer(nextPrayer);

    // Update Header Card
    if (nextPrayer !== adhan.Prayer.None) {
        document.getElementById('next-prayer-name').textContent = capitalize(nextPrayer);
        startCountdown(nextPrayerTime);
    } else {
        document.getElementById('next-prayer-name').textContent = "Fajr (Tomorrow)";
        document.getElementById('countdown').textContent = "--:--:--";
    }

    // Render List
    times.forEach(p => {
        const el = document.createElement('div');
        el.className = `prayer-row ${nextPrayer === p.name.toLowerCase() ? 'active' : ''}`;
        el.innerHTML = `
            <span>${p.name}</span>
            <span>${timeFormatter.format(p.time)}</span>
        `;
        listContainer.appendChild(el);
    });
}

function startCountdown(targetTime) {
    const el = document.getElementById('countdown');

    const update = () => {
        const now = new Date();
        const diff = targetTime - now;

        if (diff <= 0) {
            el.textContent = "00:00:00";
            return;
        }

        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        el.textContent = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    };

    update();
    setInterval(update, 1000);
}

// --- Qibla Feature ---
function initQibla() {
    if (!state.location) {
        getLocation();
        return;
    }

    // Calculate Qibla Direction
    const coordinates = new adhan.Coordinates(state.location.latitude, state.location.longitude);
    const qiblaDirection = adhan.Qibla(coordinates);
    document.getElementById('qibla-degree').textContent = Math.round(qiblaDirection) + "°";

    // Device Orientation for Compass
    if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', function (event) {
            let compass = event.webkitCompassHeading || Math.abs(event.alpha - 360);

            // Calculate rotation needed to point to Qibla
            // If compass points North (0), and Qibla is at 295 (NW)
            // We need to rotate the arrow: Qibla - Compass

            const arrow = document.getElementById('qibla-arrow');
            arrow.style.transform = `rotate(${qiblaDirection - compass}deg)`;
        }, true);
    } else {
        alert("Device orientation not supported.");
    }
}

// Utils
function capitalize(s) {
    if (typeof s !== 'string') return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
}

function pad(n) {
    return n < 10 ? '0' + n : n;
}

// Init
initQuran();
