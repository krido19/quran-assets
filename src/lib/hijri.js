export function getHijriDate(date = new Date()) {
    const hijriMonths = [
        'Muharram', 'Shafar', 'Rabiul Awal', 'Rabiul Akhir',
        'Jumadil Awal', 'Jumadil Akhir', 'Rajab', "Sya'ban",
        'Ramadhan', 'Syawal', "Dzulqa'dah", "Dzulhijjah"
    ];

    try {
        const formatter = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric'
        });

        const parts = formatter.formatToParts(date);
        const day = parts.find(p => p.type === 'day').value;
        const monthIndex = parseInt(parts.find(p => p.type === 'month').value) - 1;
        const year = parts.find(p => p.type === 'year').value;

        // Ensure monthIndex is valid
        const monthName = hijriMonths[monthIndex] || '';

        return `${day} ${monthName} ${year} H`;
    } catch (e) {
        console.error("Hijri Date Error:", e);
        return ""; // Fallback or empty string on error
    }
}
