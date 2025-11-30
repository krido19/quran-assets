import { useState, useEffect, useRef } from 'react';
import asmaulHusnaData from '../data/asmaul-husna.json';

export default function AsmaulHusna() {
    const [names, setNames] = useState([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        setNames(asmaulHusnaData);
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
            }
        };
    }, []);

    // Audio Player Logic
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [activeId, setActiveId] = useState(null);
    const activeCardRef = useRef(null);

    // Auto-scroll to active card
    useEffect(() => {
        if (activeId && activeCardRef.current) {
            activeCardRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'nearest'
            });
        }
    }, [activeId]);

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play().catch(e => {
                    console.error("Play error:", e);
                    alert("Gagal memutar audio");
                });
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleStop = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setIsPlaying(false);
            setCurrentTime(0);
            setActiveId(null);
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            const time = audioRef.current.currentTime;
            setCurrentTime(time);

            // Find active item based on startTime
            // We look for the item that has the highest startTime that is less than or equal to current time
            let currentActive = null;
            for (let i = 0; i < names.length; i++) {
                if (names[i].startTime && time >= names[i].startTime) {
                    currentActive = names[i].id;
                } else if (names[i].startTime && time < names[i].startTime) {
                    // Since items are sorted by ID/time, we can break early
                    break;
                }
            }
            setActiveId(currentActive);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    const handleSeek = (e) => {
        const time = Number(e.target.value);
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const formatTime = (time) => {
        if (!time) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const filteredNames = names.filter(item =>
        item.latin.toLowerCase().includes(search.toLowerCase()) ||
        item.meaning.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="view active" style={{ padding: 0, paddingBottom: '80px' }}>
            <div className="header-section" style={{ padding: '20px', textAlign: 'center' }}>
                <h1>Asmaul Husna</h1>
                <p style={{ opacity: 0.8 }}>99 Nama Allah yang Indah</p>

                <div className="search-box" style={{ marginTop: '15px' }}>
                    <input
                        type="text"
                        placeholder="Cari nama..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '15px',
                            border: 'none',
                            background: 'var(--bg-card)',
                            color: 'var(--text-main)',
                            fontSize: '16px'
                        }}
                    />
                </div>

            </div>

            <div className="audio-player glass-panel" style={{
                position: 'sticky',
                top: 0,
                zIndex: 100,
                marginBottom: '20px',
                padding: '15px 20px',
                /* Removed borderRadius to make it look like a real header */
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                    <button
                        onClick={togglePlay}
                        style={{
                            width: '50px',
                            height: '50px',
                            borderRadius: '50%',
                            border: 'none',
                            background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                            color: '#000',
                            fontSize: '20px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)'
                        }}
                    >
                        <i className={`fa-solid fa-${isPlaying ? 'pause' : 'play'}`} style={{ marginLeft: isPlaying ? 0 : '4px' }}></i>
                    </button>

                    <button
                        onClick={handleStop}
                        style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '12px',
                            border: 'none',
                            background: 'var(--bg-body)',
                            color: '#FFD700',
                            fontSize: '16px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s'
                        }}
                    >
                        <i className="fa-solid fa-stop"></i>
                    </button>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '4px', color: 'var(--text-main)' }}>
                            Asmaul Husna
                        </div>
                        <div style={{ fontSize: '12px', opacity: 0.7, color: 'var(--text-muted)' }}>
                            Mishary Rashid Alafasy
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '12px', opacity: 0.7, minWidth: '40px', color: 'var(--text-muted)' }}>
                        {formatTime(currentTime)}
                    </span>
                    <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        value={currentTime}
                        onChange={handleSeek}
                        style={{
                            flex: 1,
                            height: '4px',
                            borderRadius: '2px',
                            background: `linear-gradient(to right, #FFD700 ${(currentTime / duration) * 100}%, var(--bg-body) ${(currentTime / duration) * 100}%)`,
                            appearance: 'none',
                            cursor: 'pointer'
                        }}
                    />
                    <span style={{ fontSize: '12px', opacity: 0.7, minWidth: '40px', textAlign: 'right', color: 'var(--text-muted)' }}>
                        {formatTime(duration)}
                    </span>
                </div>

                <audio
                    ref={audioRef}
                    src="https://raw.githubusercontent.com/krido19/quran-assets/main/asmaul-husna.mp3"
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onEnded={() => {
                        setIsPlaying(false);
                        setActiveId(null);
                    }}
                    onError={(e) => {
                        console.error("Audio Error:", e);
                        alert("Gagal memuat audio. Cek koneksi internet Anda.");
                        setIsPlaying(false);
                    }}
                />
            </div>

            <div className="names-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                gap: '15px',
                padding: '0 20px'
            }}>
                {filteredNames.map((item) => {
                    const isActive = activeId === item.id;
                    return (
                        <div
                            key={item.id}
                            ref={isActive ? activeCardRef : null}
                            className="name-card"
                            style={{
                                background: isActive ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 215, 0, 0.1) 100%)' : 'var(--bg-card)',
                                padding: '15px',
                                borderRadius: '15px',
                                textAlign: 'center',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: isActive ? '0 0 20px rgba(255, 215, 0, 0.3)' : '0 4px 6px rgba(0,0,0,0.1)',
                                border: isActive ? '2px solid #FFD700' : '2px solid transparent',
                                transform: isActive ? 'scale(1.05)' : 'scale(1)',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                zIndex: isActive ? 10 : 1
                            }}
                        >
                            <div className="number" style={{
                                fontSize: '12px',
                                opacity: isActive ? 1 : 0.6,
                                marginBottom: '5px',
                                background: isActive ? '#FFD700' : 'rgba(255,255,255,0.1)',
                                color: isActive ? '#000' : 'inherit',
                                padding: '2px 8px',
                                borderRadius: '10px',
                                fontWeight: isActive ? 'bold' : 'normal'
                            }}>
                                {item.id}
                            </div>
                            <div className="arabic" style={{
                                fontSize: '24px',
                                fontWeight: 'bold',
                                marginBottom: '5px',
                                fontFamily: "'Amiri', serif",
                                color: isActive ? '#FFD700' : 'inherit'
                            }}>
                                {item.arabic}
                            </div>
                            <div className="latin" style={{
                                fontSize: '14px',
                                fontWeight: '600',
                                marginBottom: '2px',
                                color: isActive ? '#FFD700' : 'inherit'
                            }}>
                                {item.latin}
                            </div>
                            <div className="meaning" style={{
                                fontSize: '12px',
                                opacity: 0.8
                            }}>
                                {item.meaning}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
