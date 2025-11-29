import { useEffect, useState } from 'react';
import { Coordinates, CalculationMethod, PrayerTimes as AdhanPrayerTimes } from 'adhan';

export default function PrayerTimes() {
    const [prayerTimes, setPrayerTimes] = useState(null);
    const [nextPrayer, setNextPrayer] = useState(null);
    const [countdown, setCountdown] = useState('--:--:--');
    const [locationName, setLocationName] = useState('Locating...');

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(success, error);
        } else {
            fallbackLocation();
        }
    }, []);

    useEffect(() => {
        const timer = setInterval(updateCountdown, 1000);
        return () => clearInterval(timer);
    }, [prayerTimes]);

    const success = (position) => {
        const { latitude, longitude } = position.coords;
        calculateTimes(latitude, longitude);
        fetchLocationName(latitude, longitude);
    };

    const error = () => {
        fallbackLocation();
    };

    const fallbackLocation = () => {
        // Jakarta
        calculateTimes(-6.2088, 106.8456);
        setLocationName('Jakarta (Default)');
    };

    const calculateTimes = (lat, lng) => {
        const coordinates = new Coordinates(lat, lng);
        const params = CalculationMethod.MuslimWorldLeague();
        const date = new Date();
        const times = new AdhanPrayerTimes(coordinates, date, params);

        setPrayerTimes(times);
    };

    const fetchLocationName = async (lat, lng) => {
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await res.json();
            setLocationName(data.address.city || data.address.town || 'Unknown Location');
        } catch (e) {
            setLocationName('Unknown Location');
        }
    };

    const updateCountdown = () => {
        if (!prayerTimes) return;

        const now = new Date();
        const timeNames = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
        let next = null;
        let minDiff = Infinity;

        for (const name of timeNames) {
            const time = prayerTimes[name];
            if (time > now) {
                const diff = time - now;
                if (diff < minDiff) {
                    minDiff = diff;
                    next = { name, time };
                }
            }
        }

        // If no next prayer today, it's Fajr tomorrow (simplified)
        if (!next) {
            next = { name: 'fajr', time: new Date(prayerTimes.fajr.getTime() + 24 * 60 * 60 * 1000) };
        }

        setNextPrayer(next);

        const diff = next.time - now;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setCountdown(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    if (!prayerTimes) return <div className="view active">Loading Prayer Times...</div>;

    const formatTime = (date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div id="view-prayer" className="view active">
            <div className="prayer-card">
                <div className="prayer-header">
                    <div className="location-badge">
                        <i className="fa-solid fa-location-dot"></i>
                        <span>{locationName}</span>
                    </div>
                    <div className="label">Next Prayer</div>
                    <h2>{nextPrayer?.name.charAt(0).toUpperCase() + nextPrayer?.name.slice(1)}</h2>
                    <div className="countdown">{countdown}</div>
                </div>
            </div>
            <div className="prayer-times-list">
                {['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'].map(name => (
                    <div key={name} className={`prayer-row ${nextPrayer?.name === name ? 'active' : ''}`}>
                        <span>{name.charAt(0).toUpperCase() + name.slice(1)}</span>
                        <span>{formatTime(prayerTimes[name])}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
