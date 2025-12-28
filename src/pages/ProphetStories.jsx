import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import prophetsData from '../data/prophet-stories.json';

export default function ProphetStories() {
    const navigate = useNavigate();
    const { t, language } = useLanguage();
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [selectedProphet, setSelectedProphet] = useState(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [bookmarks, setBookmarks] = useState([]);
    const [readProgress, setReadProgress] = useState([]);
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);
    const [slideDirection, setSlideDirection] = useState(null);

    useEffect(() => {
        const savedBookmarks = JSON.parse(localStorage.getItem('prophet_bookmarks') || '[]');
        const savedProgress = JSON.parse(localStorage.getItem('prophet_read_progress') || '[]');
        setBookmarks(savedBookmarks);
        setReadProgress(savedProgress);
    }, []);

    const categories = [
        { id: 'all', label_id: 'Semua', label_en: 'All', icon: 'fa-list' },
        { id: 'ululAzmi', label_id: 'Ulul Azmi', label_en: 'Ulul Azmi', icon: 'fa-crown' },
        { id: 'bookmarks', label_id: 'Tersimpan', label_en: 'Saved', icon: 'fa-bookmark' }
    ];

    const filteredProphets = prophetsData.filter(prophet => {
        const name = language === 'id' ? prophet.name_id : prophet.name_en;
        const matchSearch = name.toLowerCase().includes(search.toLowerCase()) || prophet.name.includes(search);
        if (activeTab === 'all') return matchSearch;
        if (activeTab === 'bookmarks') return matchSearch && bookmarks.includes(prophet.id);
        return matchSearch && prophet.category.includes(activeTab);
    });

    const toggleBookmark = (id, e) => {
        e.stopPropagation();
        const newBookmarks = bookmarks.includes(id) ? bookmarks.filter(b => b !== id) : [...bookmarks, id];
        setBookmarks(newBookmarks);
        localStorage.setItem('prophet_bookmarks', JSON.stringify(newBookmarks));
    };

    const markAsRead = (id) => {
        if (!readProgress.includes(id)) {
            const newProgress = [...readProgress, id];
            setReadProgress(newProgress);
            localStorage.setItem('prophet_read_progress', JSON.stringify(newProgress));
        }
    };

    const openStory = (prophet) => {
        setSelectedProphet(prophet);
        setCurrentSlide(0);
        markAsRead(prophet.id);
    };

    const closeStory = () => {
        setSelectedProphet(null);
        setCurrentSlide(0);
    };

    const nextSlide = () => {
        const sections = language === 'id' ? selectedProphet.sections_id : selectedProphet.sections_en;
        if (currentSlide < sections.length - 1) setCurrentSlide(currentSlide + 1);
    };

    const prevSlide = () => {
        if (currentSlide > 0) setCurrentSlide(currentSlide - 1);
    };

    const goToVerse = (surahId, verseKey) => {
        navigate(`/surah/${surahId}`, { state: { targetVerse: verseKey } });
    };

    const speakText = (text) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = language === 'id' ? 'id-ID' : 'en-US';
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
        }
    };

    const progressPercent = Math.round((readProgress.length / prophetsData.length) * 100);

    // Touch/Swipe handlers
    const minSwipeDistance = 50;

    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe && selectedProphet) {
            const sections = language === 'id' ? selectedProphet.sections_id : selectedProphet.sections_en;
            if (currentSlide < sections.length - 1) {
                setSlideDirection('left');
                setCurrentSlide(currentSlide + 1);
                setTimeout(() => setSlideDirection(null), 300);
            }
        }
        if (isRightSwipe && selectedProphet) {
            if (currentSlide > 0) {
                setSlideDirection('right');
                setCurrentSlide(currentSlide - 1);
                setTimeout(() => setSlideDirection(null), 300);
            }
        }
    };

    // Story Slider Modal
    if (selectedProphet) {
        const sections = language === 'id' ? selectedProphet.sections_id : selectedProphet.sections_en;
        const currentSection = sections[currentSlide];
        const name = language === 'id' ? selectedProphet.name_id : selectedProphet.name_en;
        const isBookmarked = bookmarks.includes(selectedProphet.id);

        return (
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
                zIndex: 1000, overflow: 'hidden'
            }}>
                {/* Background decoration */}
                <div style={{
                    position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%',
                    background: 'radial-gradient(circle at 30% 20%, rgba(16,185,129,0.1) 0%, transparent 50%)',
                    pointerEvents: 'none'
                }}></div>

                {/* Illustration Image */}
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: '220px',
                    overflow: 'hidden', opacity: 0.6,
                    background: 'linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(6,78,59,0.3) 100%)'
                }}>
                    <img
                        loading="lazy"
                        src={`/images/prophets/${selectedProphet.illustration?.split('_')[0] || selectedProphet.name_id?.toLowerCase()}.png`}
                        alt=""
                        style={{
                            width: '100%', height: '100%', objectFit: 'cover'
                        }}
                        onError={(e) => e.target.style.display = 'none'}
                    />
                    <div style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0, height: '150px',
                        background: 'linear-gradient(to top, #0f172a 0%, transparent 100%)'
                    }}></div>
                </div>

                {/* Header */}
                <div style={{
                    padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    position: 'relative', zIndex: 10
                }}>
                    <button onClick={closeStory} style={{
                        background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '12px',
                        width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', cursor: 'pointer'
                    }}>
                        <i className="fa-solid fa-xmark" style={{ fontSize: '20px' }}></i>
                    </button>

                    <div style={{ textAlign: 'center' }}>
                        <p style={{ margin: 0, fontSize: '24px', fontFamily: 'Amiri, serif', color: '#10b981' }}>
                            {selectedProphet.name}
                        </p>
                        <p style={{ margin: 0, fontSize: '16px', color: 'rgba(255,255,255,0.8)' }}>{name}</p>
                    </div>

                    <button onClick={(e) => toggleBookmark(selectedProphet.id, e)} style={{
                        background: isBookmarked ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.1)',
                        border: 'none', borderRadius: '12px', width: '44px', height: '44px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: isBookmarked ? '#ef4444' : 'white', cursor: 'pointer'
                    }}>
                        <i className={`fa-${isBookmarked ? 'solid' : 'regular'} fa-bookmark`} style={{ fontSize: '18px' }}></i>
                    </button>
                </div>

                {/* Progress dots */}
                <div style={{
                    display: 'flex', justifyContent: 'center', gap: '6px', padding: '15px',
                    flexWrap: 'wrap', maxWidth: '350px', margin: '0 auto'
                }}>
                    {sections.map((_, idx) => (
                        <button key={idx} onClick={() => setCurrentSlide(idx)} style={{
                            width: idx === currentSlide ? '24px' : '8px', height: '8px',
                            borderRadius: '4px', border: 'none', cursor: 'pointer',
                            background: idx === currentSlide ? '#10b981' : idx < currentSlide ? 'rgba(16,185,129,0.5)' : 'rgba(255,255,255,0.2)',
                            transition: 'all 0.3s ease'
                        }}></button>
                    ))}
                </div>

                {/* Slide Content */}
                <div
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                    style={{
                        flex: 1, padding: '20px', display: 'flex', flexDirection: 'column',
                        justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 280px)',
                        touchAction: 'pan-y',
                        transform: slideDirection === 'left' ? 'translateX(-10px)' : slideDirection === 'right' ? 'translateX(10px)' : 'translateX(0)',
                        opacity: slideDirection ? 0.8 : 1,
                        transition: 'all 0.15s ease-out'
                    }}>
                    {/* Icon */}
                    <div style={{
                        width: '80px', height: '80px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: '25px', boxShadow: '0 10px 40px rgba(16,185,129,0.3)'
                    }}>
                        <i className={`fa-solid ${currentSection.icon}`} style={{ fontSize: '32px', color: 'white' }}></i>
                    </div>

                    {/* Title */}
                    <h2 style={{
                        margin: '0 0 10px', fontSize: '24px', fontWeight: '700',
                        color: 'white', textAlign: 'center'
                    }}>
                        {currentSection.title}
                    </h2>

                    {/* Slide counter */}
                    <p style={{
                        margin: '0 0 25px', fontSize: '14px', color: 'rgba(255,255,255,0.5)'
                    }}>
                        {currentSlide + 1} / {sections.length}
                    </p>

                    {/* Content Card */}
                    <div style={{
                        background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)',
                        borderRadius: '20px', padding: '25px', maxWidth: '500px', width: '100%',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <p style={{
                            margin: 0, fontSize: '16px', lineHeight: '1.8', color: 'rgba(255,255,255,0.9)',
                            textAlign: 'justify'
                        }}>
                            {currentSection.content}
                        </p>
                    </div>

                    {/* Audio button */}
                    <button onClick={() => speakText(currentSection.content)} style={{
                        marginTop: '20px', background: 'rgba(59,130,246,0.2)', color: '#60a5fa',
                        border: 'none', borderRadius: '25px', padding: '12px 24px',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px'
                    }}>
                        <i className="fa-solid fa-volume-high"></i>
                        {language === 'id' ? 'Dengarkan' : 'Listen'}
                    </button>
                </div>

                {/* Navigation */}
                <div style={{
                    padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    borderTop: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <button onClick={prevSlide} disabled={currentSlide === 0} style={{
                        background: currentSlide === 0 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
                        border: 'none', borderRadius: '12px', padding: '15px 25px',
                        color: currentSlide === 0 ? 'rgba(255,255,255,0.3)' : 'white',
                        cursor: currentSlide === 0 ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px'
                    }}>
                        <i className="fa-solid fa-chevron-left"></i>
                        {language === 'id' ? 'Sebelumnya' : 'Previous'}
                    </button>

                    {currentSlide === sections.length - 1 ? (
                        <button onClick={closeStory} style={{
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            border: 'none', borderRadius: '12px', padding: '15px 25px',
                            color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                            fontSize: '15px', fontWeight: '600'
                        }}>
                            <i className="fa-solid fa-check"></i>
                            {language === 'id' ? 'Selesai' : 'Done'}
                        </button>
                    ) : (
                        <button onClick={nextSlide} style={{
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            border: 'none', borderRadius: '12px', padding: '15px 25px',
                            color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                            fontSize: '15px', fontWeight: '600'
                        }}>
                            {language === 'id' ? 'Selanjutnya' : 'Next'}
                            <i className="fa-solid fa-chevron-right"></i>
                        </button>
                    )}
                </div>

                {/* Quran References at end */}
                {currentSlide === sections.length - 1 && (
                    <div style={{
                        padding: '0 20px 20px', borderTop: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <p style={{ margin: '15px 0 10px', fontSize: '14px', color: 'rgba(255,255,255,0.6)', textAlign: 'center' }}>
                            <i className="fa-solid fa-book-quran" style={{ marginRight: '8px' }}></i>
                            {language === 'id' ? 'Referensi Al-Quran' : 'Quran References'}
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                            {selectedProphet.quranRefs.map((ref, idx) => (
                                <button key={idx} onClick={() => goToVerse(ref.surahId, ref.verseKey)} style={{
                                    background: 'rgba(99,102,241,0.2)', color: '#818cf8',
                                    border: 'none', borderRadius: '10px', padding: '10px 15px',
                                    cursor: 'pointer', fontSize: '13px'
                                }}>
                                    QS {ref.verseKey}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Main List View
    return (
        <div className="view active" style={{ paddingBottom: '100px' }}>
            {/* Header */}
            <div style={{
                padding: '20px', textAlign: 'center', position: 'relative',
                background: 'linear-gradient(180deg, rgba(16,185,129,0.1) 0%, transparent 100%)'
            }}>
                <button onClick={() => navigate(-1)} style={{
                    position: 'absolute', left: '20px', top: '20px',
                    background: 'var(--bg-card)', border: 'none', borderRadius: '12px',
                    width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--primary)', cursor: 'pointer'
                }}>
                    <i className="fa-solid fa-arrow-left"></i>
                </button>

                <h1 style={{ fontSize: '28px', marginBottom: '5px' }}>{t('menu.prophetStories')}</h1>
                <p style={{ opacity: 0.7, marginBottom: '15px' }}>{t('prophetStories.subtitle')}</p>

                {/* Progress */}
                <div style={{
                    maxWidth: '250px', margin: '0 auto 15px', background: 'rgba(255,255,255,0.1)',
                    borderRadius: '10px', height: '6px', overflow: 'hidden'
                }}>
                    <div style={{
                        width: `${progressPercent}%`, height: '100%',
                        background: 'linear-gradient(90deg, #10b981, #34d399)', transition: 'width 0.3s'
                    }}></div>
                </div>
                <p style={{ fontSize: '12px', opacity: 0.5 }}>{readProgress.length}/{prophetsData.length} {language === 'id' ? 'dibaca' : 'read'}</p>

                {/* Quick Actions */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '15px', flexWrap: 'wrap' }}>
                    <button onClick={() => navigate('/prophet-timeline')} style={{
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none',
                        borderRadius: '20px', padding: '10px 18px', color: 'white', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px'
                    }}>
                        <i className="fa-solid fa-timeline"></i> Timeline
                    </button>
                    <button onClick={() => navigate('/prophet-family-tree')} style={{
                        background: 'linear-gradient(135deg, #f59e0b, #fbbf24)', border: 'none',
                        borderRadius: '20px', padding: '10px 18px', color: 'white', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px'
                    }}>
                        <i className="fa-solid fa-sitemap"></i> {language === 'id' ? 'Silsilah' : 'Family'}
                    </button>
                    <button onClick={() => navigate('/prophet-quiz')} style={{
                        background: 'linear-gradient(135deg, #ef4444, #f87171)', border: 'none',
                        borderRadius: '20px', padding: '10px 18px', color: 'white', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px'
                    }}>
                        <i className="fa-solid fa-gamepad"></i> Quiz
                    </button>
                </div>

                {/* Search */}
                <div style={{ position: 'relative', marginTop: '20px' }}>
                    <i className="fa-solid fa-search" style={{
                        position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)',
                        color: 'rgba(255,255,255,0.4)'
                    }}></i>
                    <input type="text" placeholder={t('prophetStories.search')} value={search}
                        onChange={(e) => setSearch(e.target.value)} style={{
                            width: '100%', padding: '14px 14px 14px 45px', borderRadius: '15px',
                            border: 'none', background: 'var(--bg-card)', color: 'var(--text-main)',
                            fontSize: '15px'
                        }}
                    />
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '10px', padding: '0 20px 15px', overflowX: 'auto' }}>
                {categories.map(cat => (
                    <button key={cat.id} onClick={() => setActiveTab(cat.id)} style={{
                        background: activeTab === cat.id ? 'linear-gradient(135deg, #10b981, #059669)' : 'var(--bg-card)',
                        color: activeTab === cat.id ? 'white' : 'var(--text-main)',
                        border: 'none', borderRadius: '20px', padding: '10px 18px',
                        cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px',
                        fontSize: '14px', fontWeight: activeTab === cat.id ? '600' : '400'
                    }}>
                        <i className={`fa-solid ${cat.icon}`}></i>
                        {language === 'id' ? cat.label_id : cat.label_en}
                    </button>
                ))}
            </div>

            {/* Prophet Grid */}
            <div style={{
                padding: '0 20px', display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '15px'
            }}>
                {filteredProphets.map((prophet) => {
                    const name = language === 'id' ? prophet.name_id : prophet.name_en;
                    const isBookmarked = bookmarks.includes(prophet.id);
                    const isRead = readProgress.includes(prophet.id);
                    const sections = language === 'id' ? prophet.sections_id : prophet.sections_en;

                    return (
                        <div key={prophet.id} onClick={() => openStory(prophet)} style={{
                            background: 'var(--bg-card)', borderRadius: '20px', padding: '20px',
                            cursor: 'pointer', textAlign: 'center', position: 'relative',
                            border: isRead ? '2px solid rgba(16,185,129,0.4)' : '2px solid transparent',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                        }}>
                            {/* Read badge */}
                            {isRead && (
                                <div style={{
                                    position: 'absolute', top: '10px', right: '10px',
                                    background: '#10b981', borderRadius: '50%', width: '20px', height: '20px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <i className="fa-solid fa-check" style={{ fontSize: '10px', color: 'white' }}></i>
                                </div>
                            )}

                            {/* Bookmark */}
                            {isBookmarked && (
                                <div style={{
                                    position: 'absolute', top: '10px', left: '10px', color: '#ef4444'
                                }}>
                                    <i className="fa-solid fa-bookmark" style={{ fontSize: '14px' }}></i>
                                </div>
                            )}

                            {/* Number */}
                            <div style={{
                                width: '50px', height: '50px', borderRadius: '50%',
                                background: prophet.category.includes('ululAzmi')
                                    ? 'linear-gradient(135deg, #f59e0b, #fbbf24)'
                                    : 'linear-gradient(135deg, #10b981, #34d399)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 12px', fontSize: '18px', fontWeight: 'bold', color: 'white'
                            }}>
                                {prophet.id}
                            </div>

                            {/* Arabic name */}
                            <p style={{
                                margin: '0 0 5px', fontSize: '24px', fontFamily: 'Amiri, serif',
                                color: 'var(--primary)'
                            }}>
                                {prophet.name}
                            </p>

                            {/* Name */}
                            <p style={{ margin: '0 0 8px', fontSize: '15px', fontWeight: '600' }}>{name}</p>

                            {/* Section count */}
                            <p style={{ margin: 0, fontSize: '12px', opacity: 0.5 }}>
                                <i className="fa-solid fa-layer-group" style={{ marginRight: '5px' }}></i>
                                {sections?.length || 0} {language === 'id' ? 'bagian' : 'parts'}
                            </p>

                            {/* Category badge */}
                            {prophet.category.includes('ululAzmi') && (
                                <span style={{
                                    display: 'inline-block', marginTop: '10px',
                                    background: 'rgba(245,158,11,0.2)', color: '#f59e0b',
                                    padding: '4px 10px', borderRadius: '10px', fontSize: '11px'
                                }}>
                                    <i className="fa-solid fa-crown" style={{ marginRight: '4px' }}></i>
                                    Ulul Azmi
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>

            {filteredProphets.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', opacity: 0.5 }}>
                    <i className="fa-solid fa-search" style={{ fontSize: '40px', marginBottom: '15px' }}></i>
                    <p>{language === 'id' ? 'Tidak ditemukan' : 'Not found'}</p>
                </div>
            )}
        </div>
    );
}
