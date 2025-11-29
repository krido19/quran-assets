import { useEffect, useState } from 'react';
import { Geolocation } from '@capacitor/geolocation';
import { Motion } from '@capacitor/motion';

export default function QiblaCompass() {
    const [heading, setHeading] = useState(0);
    const [qiblaDirection, setQiblaDirection] = useState(0);
    const [location, setLocation] = useState(null);
    const [error, setError] = useState(null);

    // Ka'bah Coordinates
    const KAABA_LAT = 21.422487;
    const KAABA_LNG = 39.826206;

    useEffect(() => {
        getLocation();
        startCompass();

        return () => {
            stopCompass();
        };
    }, []);

    const getLocation = async () => {
        try {
            const position = await Geolocation.getCurrentPosition();
            setLocation(position.coords);
            calculateQibla(position.coords.latitude, position.coords.longitude);
        } catch (e) {
            console.error("Error getting location", e);
            setError("Gagal mendapatkan lokasi. Pastikan GPS aktif.");
            // Fallback to Jakarta
            calculateQibla(-6.2088, 106.8456);
        }
    };

    const calculateQibla = (lat, lng) => {
        const phiK = KAABA_LAT * Math.PI / 180.0;
        const lambdaK = KAABA_LNG * Math.PI / 180.0;
        const phi = lat * Math.PI / 180.0;
        const lambda = lng * Math.PI / 180.0;

        const psi = 180.0 / Math.PI * Math.atan2(
            Math.sin(lambdaK - lambda),
            Math.cos(phi) * Math.tan(phiK) - Math.sin(phi) * Math.cos(lambdaK - lambda)
        );

        setQiblaDirection(psi);
    };

    const startCompass = async () => {
        try {
            // Check if Motion plugin is available (Native)
            // Or use DeviceOrientation API (Web)
            if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
                // iOS 13+ requires permission
                const response = await DeviceOrientationEvent.requestPermission();
                if (response === 'granted') {
                    window.addEventListener('deviceorientation', handleOrientation);
                }
            } else {
                window.addEventListener('deviceorientation', handleOrientation);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const stopCompass = () => {
        window.removeEventListener('deviceorientation', handleOrientation);
    };

    const handleOrientation = (event) => {
        let alpha = event.alpha; // Z-axis rotation [0, 360)

        // iOS Webkit Compass Heading
        if (event.webkitCompassHeading) {
            alpha = event.webkitCompassHeading;
        }
        // Android (Chrome) - alpha is counter-clockwise, so we might need to adjust
        // But standard 'alpha' usually works for basic north.
        // Ideally we use 'deviceorientationabsolute' for Android if available.

        // For simplicity in this hybrid app:
        setHeading(alpha);
    };

    // Calculate rotation: We want the arrow to point to Qibla.
    // Arrow points UP (0 deg) by default.
    // If Phone points North (0 deg), Qibla is at `qiblaDirection`.
    // So we rotate arrow by `qiblaDirection`.
    // If Phone points East (90 deg), we need to rotate arrow by `qiblaDirection - 90`.
    // So Rotation = Qibla - Heading.
    const rotation = qiblaDirection - heading;

    return (
        <div id="view-qibla" className="view active" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
            <h2 style={{ marginBottom: '30px' }}>Arah Kiblat</h2>

            <div className="compass-container" style={{ position: 'relative', width: '300px', height: '300px' }}>
                {/* Compass Dial (Background) - Rotates with phone to show North */}
                <div className="compass-dial" style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    border: '5px solid var(--text-main)',
                    position: 'absolute',
                    transform: `rotate(${-heading}deg)`,
                    transition: 'transform 0.1s ease-out',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <div style={{ position: 'absolute', top: '10px', fontWeight: 'bold' }}>N</div>
                    <div style={{ position: 'absolute', bottom: '10px', fontWeight: 'bold' }}>S</div>
                    <div style={{ position: 'absolute', right: '10px', fontWeight: 'bold' }}>E</div>
                    <div style={{ position: 'absolute', left: '10px', fontWeight: 'bold' }}>W</div>
                </div>

                {/* Qibla Arrow - Points to Qibla relative to North */}
                <div className="qibla-arrow" style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: '6px',
                    height: '120px',
                    background: '#FFD700',
                    transformOrigin: 'bottom center',
                    transform: `translate(-50%, -100%) rotate(${rotation}deg)`,
                    transition: 'transform 0.1s ease-out',
                    borderRadius: '3px',
                    zIndex: 10
                }}>
                    <div style={{
                        width: '0',
                        height: '0',
                        borderLeft: '10px solid transparent',
                        borderRight: '10px solid transparent',
                        borderBottom: '20px solid #FFD700',
                        position: 'absolute',
                        top: '-15px',
                        left: '-7px'
                    }}></div>
                </div>

                {/* Center Dot */}
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: '16px',
                    height: '16px',
                    background: 'var(--text-main)',
                    borderRadius: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 11
                }}></div>
            </div>

            <div className="info" style={{ marginTop: '40px', textAlign: 'center' }}>
                <p style={{ fontSize: '18px', marginBottom: '5px' }}>
                    Qibla: <strong>{Math.round(qiblaDirection)}°</strong>
                </p>
                <p style={{ fontSize: '14px', opacity: 0.7 }}>
                    {location ? "Lokasi terdeteksi" : "Mencari lokasi..."}
                </p>
                {error && <p style={{ color: 'red', fontSize: '12px' }}>{error}</p>}
            </div>
        </div>
    );
}
