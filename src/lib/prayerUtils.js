import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan';

export function getPrayerTimesForDate(date = new Date()) {
    const savedLocation = localStorage.getItem('savedLocation');
    if (!savedLocation) return null;

    try {
        const { latitude, longitude } = JSON.parse(savedLocation);
        const coordinates = new Coordinates(latitude, longitude);
        const params = CalculationMethod.MuslimWorldLeague();
        return new PrayerTimes(coordinates, date, params);
    } catch (e) {
        console.error("Error calculating prayer times in utils:", e);
        return null;
    }
}
