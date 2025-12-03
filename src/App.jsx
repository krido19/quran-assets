import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { App as CapacitorApp } from '@capacitor/app';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar';
import Header from './components/Header';
import SplashScreen from './components/SplashScreen';
import QuranList from './pages/QuranList';
import SurahDetail from './pages/SurahDetail';
import PrayerTimes from './pages/PrayerTimes';
import QiblaCompass from './pages/QiblaCompass';
import Tasbih from './pages/Tasbih';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AsmaulHusna from './pages/AsmaulHusna';
import DailyPrayers from './pages/DailyPrayers';
import DzikirPagiPetang from './pages/DzikirPagiPetang';
import DoaKhatam from './pages/DoaKhatam';
import Menu from './pages/Menu';

const DeepLinkHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    CapacitorApp.addListener('appUrlOpen', (data) => {
      // console.log('App opened with URL:', data.url);
      if (data.url.includes('login-callback')) {
        // Extract the path/hash from the custom scheme
        // Example: com.krido19.quran://login-callback#access_token=...
        // We want to navigate to /profile#access_token=...
        const slug = data.url.split('login-callback').pop();
        if (slug) {
          navigate('/profile' + slug);
        }
      }
    });
  }, [navigate]);

  return null;
};

function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const requestPermissions = async () => {
      try {
        // Request Location Permission
        const locationStatus = await import('@capacitor/geolocation').then(m => m.Geolocation.checkPermissions());
        if (locationStatus.location !== 'granted') {
          try {
            await import('@capacitor/geolocation').then(m => m.Geolocation.requestPermissions());
          } catch (e) {
            if (e.message !== "Not implemented on web") console.warn("Location permission error:", e);
          }
        }

        // Request Notification Permission
        const notificationStatus = await import('@capacitor/local-notifications').then(m => m.LocalNotifications.checkPermissions());
        if (notificationStatus.display !== 'granted') {
          try {
            await import('@capacitor/local-notifications').then(m => m.LocalNotifications.requestPermissions());
          } catch (e) {
            if (e.message !== "Not implemented on web") console.warn("Notification permission error:", e);
          }
        }
      } catch (e) {
        console.error("Error checking permissions:", e);
      }
    };

    requestPermissions();
  }, []);

  return (
    <>
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      <div style={{ display: showSplash ? 'none' : 'block' }}>
        <AuthProvider>
          <LanguageProvider>
            <Router>
              <DeepLinkHandler />
              <div className="app-container">
                <Header />
                <main id="main-content">
                  <Routes>
                    <Route path="/" element={<QuranList />} />
                    <Route path="/surah/:id" element={<SurahDetail />} />
                    <Route path="/prayer" element={<PrayerTimes />} />
                    <Route path="/qibla" element={<QiblaCompass />} />
                    <Route path="/tasbih" element={<Tasbih />} />
                    <Route path="/profile" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/asmaul-husna" element={<AsmaulHusna />} />
                    <Route path="/daily-prayers" element={<DailyPrayers />} />
                    <Route path="/dzikir-pagi-petang" element={<DzikirPagiPetang />} />
                    <Route path="/doa-khatam" element={<DoaKhatam />} />
                    <Route path="/menu" element={<Menu />} />
                  </Routes>
                </main>
                <Navbar />
              </div>
            </Router>
          </LanguageProvider>
        </AuthProvider>
      </div>
    </>
  );
}

export default App;
