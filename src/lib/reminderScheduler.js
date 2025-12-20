import { LocalNotifications } from '@capacitor/local-notifications';
import { getPrayerTimesForDate } from './prayerUtils';

const REMINDER_MESSAGES = [
    "Sudah sholat 5 waktu?",
    "Sudah baca Al-Qur'an?",
    "Sudah sholat Dhuha?"
];

export async function scheduleRandomMutabahReminder() {
    const now = new Date();
    const times = getPrayerTimesForDate(now);
    if (!times) return;

    const maghrib = times.maghrib;
    const todayStr = now.toISOString().split('T')[0];
    const lastScheduled = localStorage.getItem('lastMutabahReminderDate');

    // Only skip if already scheduled for TODAY
    if (lastScheduled === todayStr) return;

    // Determine random time between Maghrib and 10 PM (22:00)
    const tenPM = new Date(now);
    tenPM.setHours(22, 0, 0, 0);

    // If it's already past 10 PM today, don't schedule for today
    if (now > tenPM) return;

    // The window starts from Maghrib (or NOW if it's already past Maghrib)
    const start = now > maghrib ? now.getTime() : maghrib.getTime();
    const end = tenPM.getTime();

    if (start >= end) return;

    const randomTime = new Date(start + Math.random() * (end - start));

    // Pick a random message
    const message = REMINDER_MESSAGES[Math.floor(Math.random() * REMINDER_MESSAGES.length)];

    try {
        // Cancel previous if any (id 1000 for Mutaba'ah reminders)
        await LocalNotifications.cancel({ notifications: [{ id: 1000 }] });

        await LocalNotifications.schedule({
            notifications: [{
                title: "Mutaba'ah Yaumiyah",
                body: message,
                id: 1000,
                schedule: { at: randomTime },
                sound: null,
                actionTypeId: "",
                extra: { route: '/mutabah' }
            }]
        });

        console.log(`Scheduled mutabah reminder for: ${randomTime.toLocaleTimeString()} with message: ${message}`);
        localStorage.setItem('lastMutabahReminderDate', todayStr);
    } catch (e) {
        console.warn("Failed to schedule random reminder (web environment?):", e);
    }
}
