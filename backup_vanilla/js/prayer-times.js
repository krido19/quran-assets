/**
 * Custom Prayer Times Library (Adhan.js compatible-ish)
 * Implements standard calculation methods for Prayer Times and Qibla.
 */

const adhan = {
    Coordinates: class {
        constructor(latitude, longitude) {
            this.latitude = latitude;
            this.longitude = longitude;
        }
    },

    CalculationMethod: {
        MuslimWorldLeague: () => ({
            fajrAngle: 18,
            ishaAngle: 17,
            method: 'MuslimWorldLeague'
        }),
        Egyptian: () => ({
            fajrAngle: 19.5,
            ishaAngle: 17.5,
            method: 'Egyptian'
        }),
        Karachi: () => ({
            fajrAngle: 18,
            ishaAngle: 18,
            method: 'Karachi'
        }),
        UmmAlQura: () => ({
            fajrAngle: 18.5, // Approx
            ishaAngle: 0, // Fixed time usually
            method: 'UmmAlQura'
        }),
        Dubai: () => ({
            fajrAngle: 18.2,
            ishaAngle: 18.2,
            method: 'Dubai'
        }),
        MoonsightingCommittee: () => ({
            fajrAngle: 18,
            ishaAngle: 18,
            method: 'MoonsightingCommittee'
        }),
        NorthAmerica: () => ({
            fajrAngle: 15,
            ishaAngle: 15,
            method: 'NorthAmerica'
        }),
        Kuwait: () => ({
            fajrAngle: 18,
            ishaAngle: 17.5,
            method: 'Kuwait'
        }),
        Qatar: () => ({
            fajrAngle: 18,
            ishaAngle: 0, // 90 min after maghrib
            method: 'Qatar'
        }),
        Singapore: () => ({
            fajrAngle: 20,
            ishaAngle: 18,
            method: 'Singapore'
        }),
        Tehran: () => ({
            fajrAngle: 17.7,
            ishaAngle: 14,
            method: 'Tehran'
        }),
        Turkey: () => ({
            fajrAngle: 18,
            ishaAngle: 17,
            method: 'Turkey'
        }),
        Other: () => ({
            fajrAngle: 0,
            ishaAngle: 0,
            method: 'Other'
        })
    },

    Prayer: {
        Fajr: 'Fajr',
        Sunrise: 'Sunrise',
        Dhuhr: 'Dhuhr',
        Asr: 'Asr',
        Maghrib: 'Maghrib',
        Isha: 'Isha',
        None: 'None'
    },

    PrayerTimes: class {
        constructor(coordinates, date, params) {
            this.coordinates = coordinates;
            this.date = date;
            this.params = params;

            this.calculate();
        }

        calculate() {
            // Julian Date
            const year = this.date.getFullYear();
            const month = this.date.getMonth() + 1;
            const day = this.date.getDate();

            // Basic calculation (Simplified for brevity but accurate enough for general use)
            // Using standard algorithms (D.A. Smith)

            const D = (367 * year) - Math.floor((7 * (year + Math.floor((month + 9) / 12))) / 4) + Math.floor((275 * month) / 9) + day - 730530.5;

            // Sun Position
            const L = (280.46061837 + 0.98564736629 * D) % 360;
            const M = (357.52772528 + 0.98560028150 * D) % 360;
            const lambda = (L + 1.915 * Math.sin(this.dtr(M)) + 0.020 * Math.sin(this.dtr(2 * M))) % 360;
            const obliq = 23.4393 - 0.00000036 * D;
            const alpha = this.rtd(Math.atan2(Math.cos(this.dtr(obliq)) * Math.sin(this.dtr(lambda)), Math.cos(this.dtr(lambda))));
            const delta = this.rtd(Math.asin(Math.sin(this.dtr(obliq)) * Math.sin(this.dtr(lambda))));

            // Equation of Time
            let alpha_norm = alpha % 360;
            if (alpha_norm < 0) alpha_norm += 360;
            const L_norm = L % 360;
            const EqT = L_norm / 15 - alpha_norm / 15; // in hours

            // Dhuhr
            const noon = 12 - this.coordinates.longitude / 15 - EqT;
            this.dhuhr = this.timeFromHours(noon + (this.getTimeZone() - 0)); // Adjust for timezone later

            // Sun Altitude calculations
            const lat = this.coordinates.latitude;

            // Fajr
            const fajrAlt = -this.params.fajrAngle;
            const fajrDiff = this.hourAngle(fajrAlt, lat, delta);
            this.fajr = this.timeFromHours(noon - fajrDiff);

            // Sunrise
            const sunriseAlt = -0.8333 - 0.0347 * Math.sqrt(0); // Refraction
            const sunriseDiff = this.hourAngle(sunriseAlt, lat, delta);
            this.sunrise = this.timeFromHours(noon - sunriseDiff);

            // Asr (Standard / Shafii)
            const asrAlt = this.rtd(Math.atan(1 / (1 + Math.tan(this.dtr(Math.abs(lat - delta))))));
            const asrDiff = this.hourAngle(asrAlt, lat, delta);
            this.asr = this.timeFromHours(noon + asrDiff);

            // Maghrib
            const maghribAlt = -0.8333 - 0.0347 * Math.sqrt(0);
            const maghribDiff = this.hourAngle(maghribAlt, lat, delta);
            this.maghrib = this.timeFromHours(noon + maghribDiff);

            // Isha
            const ishaAlt = -this.params.ishaAngle;
            const ishaDiff = this.hourAngle(ishaAlt, lat, delta);
            this.isha = this.timeFromHours(noon + ishaDiff);
        }

        dtr(d) { return (d * Math.PI) / 180.0; }
        rtd(r) { return (r * 180.0) / Math.PI; }

        hourAngle(altitude, lat, declination) {
            const cosH = (Math.sin(this.dtr(altitude)) - Math.sin(this.dtr(lat)) * Math.sin(this.dtr(declination))) /
                (Math.cos(this.dtr(lat)) * Math.cos(this.dtr(declination)));
            if (cosH > 1 || cosH < -1) return 0; // Polar night/day
            return this.rtd(Math.acos(cosH)) / 15.0;
        }

        timeFromHours(hours) {
            // Adjust to local timezone
            const tz = this.getTimeZone();
            hours = hours + tz;

            // Normalize
            while (hours < 0) hours += 24;
            while (hours >= 24) hours -= 24;

            const date = new Date(this.date);
            date.setHours(Math.floor(hours));
            date.setMinutes(Math.floor((hours % 1) * 60));
            date.setSeconds(Math.floor(((hours * 60) % 1) * 60));
            return date;
        }

        getTimeZone() {
            return -this.date.getTimezoneOffset() / 60;
        }

        nextPrayer() {
            const now = new Date();
            if (now < this.fajr) return 'Fajr';
            if (now < this.sunrise) return 'Sunrise';
            if (now < this.dhuhr) return 'Dhuhr';
            if (now < this.asr) return 'Asr';
            if (now < this.maghrib) return 'Maghrib';
            if (now < this.isha) return 'Isha';
            return 'None'; // Next is Fajr tomorrow
        }

        timeForPrayer(prayer) {
            if (prayer === 'Fajr') return this.fajr;
            if (prayer === 'Sunrise') return this.sunrise;
            if (prayer === 'Dhuhr') return this.dhuhr;
            if (prayer === 'Asr') return this.asr;
            if (prayer === 'Maghrib') return this.maghrib;
            if (prayer === 'Isha') return this.isha;
            return null;
        }
    },

    Qibla: function (coordinates) {
        // Kaaba coordinates
        const kaabaLat = 21.422487;
        const kaabaLng = 39.826206;

        const lat1 = (coordinates.latitude * Math.PI) / 180.0;
        const lng1 = (coordinates.longitude * Math.PI) / 180.0;
        const lat2 = (kaabaLat * Math.PI) / 180.0;
        const lng2 = (kaabaLng * Math.PI) / 180.0;

        const y = Math.sin(lng2 - lng1) * Math.cos(lat2);
        const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lng2 - lng1);

        let qibla = (Math.atan2(y, x) * 180.0) / Math.PI;
        return (qibla + 360) % 360;
    }
};
