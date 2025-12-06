import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import dailyPrayersData from '../data/daily-prayers.json';
import { useLanguage } from '../context/LanguageContext';

export default function DailyPrayers() {
    const navigate = useNavigate();
    const { t, language } = useLanguage();
    const [prayers, setPrayers] = useState([]);
    const [search, setSearch] = useState('');
    const [expandedId, setExpandedId] = useState(null);

    // Audio state
    const audioRef = useRef(null);
    const [playingId, setPlayingId] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        setPrayers(dailyPrayersData);

        // Cleanup on unmount
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    const filteredPrayers = prayers.filter(item => {
        const title = language === 'id' ? item.title : (item.title_en || item.title);
        const translation = language === 'id' ? item.translation : (item.translation_en || item.translation);
        return title.toLowerCase().includes(search.toLowerCase()) ||
            translation.toLowerCase().includes(search.toLowerCase());
    });

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const handlePlay = (id, audioUrl) => {
        if (!audioUrl) {
            alert(t('dailyPrayers.audioUnavailable'));
            return;
        }

        // If clicking the same audio
        if (playingId === id) {
            if (isPlaying) {
                audioRef.current.pause();
                setIsPlaying(false);
            } else {
                audioRef.current.play().catch(e => {
                    console.error("Audio Play Error:", e);
                    alert("Gagal memuat audio. Pastikan internet aktif.");
                });
                setIsPlaying(true);
            }
            return;
        }

        // If clicking a different audio, stop the current one first
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }

        // Start new audio
        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        audio.play().then(() => {
            setPlayingId(id);
            setIsPlaying(true);
        }).catch(e => {
            console.error("Audio Play Error:", e);
            alert("Gagal memuat audio. Pastikan internet aktif.");
            setPlayingId(null);
            setIsPlaying(false);
        });

        // Reset state when audio ends
        audio.onended = () => {
            setPlayingId(null);
            setIsPlaying(false);
        };
    };

    const handleStop = (e) => {
        e.stopPropagation(); // Prevent triggering other click events
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0; // Reset to beginning
        }
        setPlayingId(null);
        setIsPlaying(false);
    };

    return (
        <div className="view active" style={{ paddingBottom: '80px' }}>
            <div className="header-section" style={{ padding: '20px', textAlign: 'center', position: 'relative' }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        position: 'absolute',
                        left: '20px',
                        top: '20px',
                        background: 'var(--bg-card)',
                        border: 'none',
                        borderRadius: '12px',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                        color: 'var(--primary)',
                        cursor: 'pointer',
                        zIndex: 10
                    }}
                >
                    <i className="fa-solid fa-arrow-left"></i>
                </button>

                <h1>{t('menu.dailyPrayers')}</h1>
                <p style={{ opacity: 0.8 }}>{t('dailyPrayers.subtitle')}</p>

                <div className="search-box" style={{ marginTop: '15px' }}>
                    <input
                        type="text"
                        placeholder={t('dailyPrayers.search')}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '15px',
                            border: 'none',
                            background: 'var(--bg-card)',
                            color: 'var(--text-main)',
                            fontSize: '16px',
                            paddingLeft: '45px' // Space for icon if we added one, but standard is fine
                        }}
                    />
                </div>
            </div>

            <div className="prayers-list" style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {filteredPrayers.map((item) => {
                    const title = language === 'id' ? item.title : (item.title_en || item.title);
                    const translation = language === 'id' ? item.translation : (item.translation_en || item.translation);

                    return (
                        <div
                            key={item.id}
                            className="prayer-card"
                            onClick={() => toggleExpand(item.id)}
                            style={{
                                background: 'var(--bg-card)',
                                padding: '20px',
                                borderRadius: '15px',
                                cursor: 'pointer',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                transition: 'all 0.3s ease',
                                color: 'var(--text-main)'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ margin: 0, fontSize: '18px' }}>{title}</h3>
                                <i className={`fa-solid fa-chevron-${expandedId === item.id ? 'up' : 'down'}`} style={{ opacity: 0.5 }}></i>
                            </div>

                            {expandedId === item.id && (
                                <div className="prayer-content" style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px', gap: '10px' }}>
                                        {playingId === item.id ? (
                                            <>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handlePlay(item.id, item.audio);
                                                    }}
                                                    style={{
                                                        background: isPlaying ? 'rgba(255, 215, 0, 0.2)' : 'rgba(0, 255, 0, 0.2)',
                                                        color: isPlaying ? '#FFD700' : '#00FF00',
                                                        border: 'none',
                                                        borderRadius: '20px',
                                                        padding: '5px 15px',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '5px',
                                                        fontSize: '12px'
                                                    }}
                                                >
                                                    <i className={`fa-solid fa-${isPlaying ? 'pause' : 'play'}`}></i>
                                                    {isPlaying ? t('dailyPrayers.pause') : t('dailyPrayers.resume')}
                                                </button>
                                                <button
                                                    onClick={handleStop}
                                                    style={{
                                                        background: 'rgba(255, 0, 0, 0.2)',
                                                        color: '#FF4444',
                                                        border: 'none',
                                                        borderRadius: '20px',
                                                        padding: '5px 15px',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '5px',
                                                        fontSize: '12px'
                                                    }}
                                                >
                                                    <i className="fa-solid fa-stop"></i> {t('dailyPrayers.stop')}
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handlePlay(item.id, item.audio);
                                                }}
                                                style={{
                                                    background: 'rgba(255, 215, 0, 0.2)',
                                                    color: '#FFD700',
                                                    border: 'none',
                                                    borderRadius: '20px',
                                                    padding: '5px 15px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '5px',
                                                    fontSize: '12px'
                                                }}
                                            >
                                                <i className="fa-solid fa-volume-high"></i> {t('dailyPrayers.listen')}
                                            </button>
                                        )}
                                    </div>
                                    <div className="arabic" style={{
                                        fontSize: '24px',
                                        fontWeight: 'bold',
                                        marginBottom: '15px',
                                        textAlign: 'right',
                                        fontFamily: "'Amiri', serif",
                                        lineHeight: '1.6'
                                    }}>
                                        {item.arabic}
                                    </div>
                                    <div className="latin" style={{
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        marginBottom: '10px',
                                        color: '#FFD700',
                                        fontStyle: 'italic'
                                    }}>
                                        {item.latin}
                                    </div>
                                    <div className="translation" style={{
                                        fontSize: '14px',
                                        opacity: 0.9,
                                        lineHeight: '1.5'
                                    }}>
                                        "{translation}"
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
