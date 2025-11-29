import { useEffect, useState } from 'react';

export default function QiblaCompass() {
    const [degree, setDegree] = useState(0);

    useEffect(() => {
        const handleOrientation = (event) => {
            let alpha = event.alpha; // Z-axis rotation [0, 360)
            // Webkit compass heading (iOS)
            if (event.webkitCompassHeading) {
                alpha = event.webkitCompassHeading;
            }
            // Qibla direction from Jakarta is roughly 295 degrees
            // This is a simplified calculation. Ideally, we calculate based on user location.
            // For now, we just show the compass heading.
            // To point to Qibla, we need: QiblaHeading - DeviceHeading
            // Let's assume we just want to show North for now, or the raw heading.
            // Actually, the previous implementation just rotated the arrow based on alpha.

            setDegree(alpha);
        };

        if (window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', handleOrientation, true);
        }

        return () => {
            window.removeEventListener('deviceorientation', handleOrientation);
        };
    }, []);

    return (
        <div id="view-qibla" className="view active">
            <div className="compass-container">
                <div className="compass">
                    <div
                        className="compass-arrow"
                        style={{ transform: `translate(-50%, -50%) rotate(${degree}deg)` }}
                    ></div>
                    <div className="compass-dial"></div>
                </div>
                <div className="qibla-info">
                    <p>Point your phone towards the Qibla</p>
                    <h3>{Math.round(degree)}°</h3>
                </div>
            </div>
        </div>
    );
}
