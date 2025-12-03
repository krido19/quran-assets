import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toBlob } from 'html-to-image';
import { useLanguage } from '../context/LanguageContext';

export default function SurahDetail() {
    const { language, t } = useLanguage();

    // Helper to format text with footnotes
    const formatTranslation = (text) => {
        if (!text) return '';
        // Split by the custom tag pattern
        const parts = text.split(/(<sup foot_note=\d+>\d+<\/sup>)/g);

        return parts.map((part, index) => {
            const match = part.match(/<sup foot_note=(\d+)>(\d+)<\/sup>/);
            if (match) {
                return <sup key={index} style={{ fontSize: '0.6em', verticalAlign: 'super', color: 'var(--primary)' }}>{match[2]}</sup>;
            }
            return part;
        });
    };

    const [shareVerseData, setShareVerseData] = useState(null);
    const shareCardRef = useRef(null);

    const shareVerse = (verse) => {
        // Get translation based on language
        const resourceId = language === 'id' ? 33 : 131;
        const translationObj = verse.translations.find(t => t.resource_id === resourceId) ||
            verse.translations.find(t => t.resource_id === (language === 'id' ? 131 : 33));

        const translation = translationObj ? translationObj.text.replace(/<[^>]*>?/gm, '') : '';

        setShareVerseData({
            surahName: surah.name_simple,
            verseNumber: verse.verse_key.split(':')[1],
            arabic: verse.text_uthmani,
            translation: translation
        });
    };

    const handleShareImage = async () => {
        if (shareCardRef.current) {
            try {
                const blob = await toBlob(shareCardRef.current, { cacheBust: true });
                const file = new File([blob], `verse-${shareVerseData.surahName}-${shareVerseData.verseNumber}.png`, { type: 'image/png' });

                if (navigator.share) {
                    await navigator.share({
                        files: [file],
                        title: t('surah.shareTitle'),
                        text: 'Shared from Islamic App'
                    });
                } else {
                    // Fallback download
                    const link = document.createElement('a');
                    link.download = `verse-${shareVerseData.surahName}-${shareVerseData.verseNumber}.png`;
                    link.href = URL.createObjectURL(blob);
                    link.click();
                }
            } catch (err) {
                console.error('Error sharing image:', err);
                alert('Gagal membuat gambar. Coba lagi.');
            }
        }
    };
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [surah, setSurah] = useState(null);
    const [verses, setVerses] = useState([]);
    const [audioSrc, setAudioSrc] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
    const audioRef = useRef(new Audio());
    const verseRefs = useRef([]);

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const viewRef = useRef(null);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'page'
    const [currentDisplayPage, setCurrentDisplayPage] = useState(null);
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);
    const [scriptType, setScriptType] = useState('plain'); // 'plain' or 'tajweed'
    const [showScriptMenu, setShowScriptMenu] = useState(false);
    const [allChapters, setAllChapters] = useState({});

    // Fetch All Chapters for reference
    useEffect(() => {
        fetch('https://api.quran.com/api/v4/chapters?language=' + language)
            .then(res => res.json())
            .then(data => {
                const chaptersMap = {};
                data.chapters.forEach(c => chaptersMap[c.id] = c);
                setAllChapters(chaptersMap);
            });
    }, [language]);

    // Fetch Surah Info
    // Fetch Surah Info
    useEffect(() => {
        fetch(`https://api.quran.com/api/v4/chapters/${id}?language=${language}`)
            .then(res => res.json())
            .then(data => {
                setSurah(data.chapter);
                // Reset verses when surah changes
                setVerses([]);
                setHasMore(true);

                // If switching surah, set page to surah's first page
                if (viewMode === 'page') {
                    setCurrentDisplayPage(data.chapter.pages[0]);
                } else {
                    setPage(1);
                    fetchVerses(1);
                }
            });
    }, [id, language]);

    // Update currentDisplayPage when viewMode changes to page
    useEffect(() => {
        if (viewMode === 'page' && surah && !currentDisplayPage) {
            setCurrentDisplayPage(surah.pages[0]);
        }
    }, [viewMode, surah]);

    // Auto-scroll to target verse if provided
    useEffect(() => {
        if (location.state?.targetVerse && verses.length > 0) {
            const targetKey = location.state.targetVerse;
            const index = verses.findIndex(v => v.verse_key === targetKey);
            if (index !== -1) {
                // Small delay to ensure rendering
                setTimeout(() => {
                    scrollToVerse(index);
                    // Clear state to prevent re-scrolling
                    window.history.replaceState({}, document.title);
                }, 500);
            }
        }
    }, [verses, location.state]);

    // Fetch Verses with Pagination
    const fetchVerses = (pageNumber) => {
        if (isLoading) return;
        setIsLoading(true);

        fetch(`https://api.quran.com/api/v4/verses/by_chapter/${id}?language=${language}&words=true&translations=131,33,57&audio=1&fields=text_uthmani,text_uthmani_tajweed,text_indopak,page_number,juz_number&per_page=50&page=${pageNumber}`)
            .then(res => res.json())
            .then(data => {
                if (data.verses.length === 0) {
                    setHasMore(false);
                } else {
                    setVerses(prev => {
                        // Avoid duplicates
                        const newVerses = data.verses.filter(v => !prev.some(p => p.id === v.id));
                        return [...prev, ...newVerses];
                    });
                    if (pageNumber === 1 && data.verses.length > 0) {
                        setAudioSrc(data.verses[0].audio.url);
                    }
                }
                setIsLoading(false);
            })
            .catch(() => setIsLoading(false));
    };

    // Fetch Page (Page View)
    const [pageVerses, setPageVerses] = useState([]);

    const fetchPageContent = (pageNum) => {
        if (isLoading) return;
        setIsLoading(true);
        // setPageVerses([]); // Keep previous page content while loading to prevent header flicker

        fetch(`https://api.quran.com/api/v4/verses/by_page/${pageNum}?language=${language}&words=true&translations=131,33,57&audio=1&fields=text_uthmani,text_uthmani_tajweed,text_indopak,page_number,juz_number,chapter_id`)
            .then(res => res.json())
            .then(data => {
                setPageVerses(data.verses);
                setIsLoading(false);
                // Reset verse index for new page
                setCurrentVerseIndex(0);
            })
            .catch(() => setIsLoading(false));
    };

    // Trigger fetch when currentDisplayPage changes in Page View
    useEffect(() => {
        if (viewMode === 'page' && currentDisplayPage) {
            fetchPageContent(currentDisplayPage);
        }
    }, [currentDisplayPage, viewMode]);

    // Infinite Scroll with IntersectionObserver (List View Only)
    const observer = useRef();
    const lastVerseElementRef = (node) => {
        if (isLoading || viewMode === 'page') return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });

        if (node) observer.current.observe(node);
    };

    // Trigger fetch when page changes (List View)
    useEffect(() => {
        if (viewMode === 'list' && page > 1) {
            fetchVerses(page);
        }
    }, [page, viewMode]);

    // Auto-fetch for Page View if current page is empty (REMOVED - handled by fetchPageContent)
    useEffect(() => {
        // Legacy cleanup
    }, []);

    // Determine active verses for playback
    const activeVerses = viewMode === 'page' ? pageVerses : verses;

    // Audio Logic
    useEffect(() => {
        const audio = audioRef.current;

        const handleEnded = () => {
            if (currentVerseIndex < activeVerses.length - 1) {
                playVerse(currentVerseIndex + 1);
            } else {
                setIsPlaying(false);
            }
        };

        audio.addEventListener('ended', handleEnded);
        return () => audio.removeEventListener('ended', handleEnded);
    }, [activeVerses, currentVerseIndex]);

    const playVerse = (index) => {
        if (index >= 0 && index < activeVerses.length) {
            setCurrentVerseIndex(index);
            const url = activeVerses[index].audio.url;
            if (url) {
                audioRef.current.src = `https://verses.quran.com/${url}`;
                audioRef.current.play();
                setIsPlaying(true);
                // Only scroll in List View
                if (viewMode === 'list') {
                    scrollToVerse(index);
                }
            }
        }
    };

    const togglePlay = () => {
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            if (audioRef.current.src) {
                audioRef.current.play();
                setIsPlaying(true);
            } else {
                playVerse(currentVerseIndex);
            }
        }
    };

    const scrollToVerse = (index) => {
        if (verseRefs.current[index]) {
            verseRefs.current[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    // Save Last Read
    useEffect(() => {
        if (surah && verses.length > 0 && verses[currentVerseIndex]) {
            const lastReadData = {
                surahId: surah.id,
                surahName: surah.name_simple,
                verseNumber: verses[currentVerseIndex].verse_key.split(':')[1],
                verseKey: verses[currentVerseIndex].verse_key,
                timestamp: Date.now()
            };
            localStorage.setItem('lastRead', JSON.stringify(lastReadData));
        }
    }, [surah, verses, currentVerseIndex]);

    const [isSurahBookmarked, setIsSurahBookmarked] = useState(false);

    useEffect(() => {
        const bookmarks = JSON.parse(localStorage.getItem('quran_bookmarks') || '[]');
        setIsSurahBookmarked(bookmarks.includes(parseInt(id)));
    }, [id]);

    const toggleBookmark = () => {
        let bookmarks = JSON.parse(localStorage.getItem('quran_bookmarks') || '[]');
        const surahId = parseInt(id);

        // Ensure all are numbers
        bookmarks = bookmarks.map(b => parseInt(b));

        let newBookmarks;

        if (bookmarks.includes(surahId)) {
            newBookmarks = bookmarks.filter(b => b !== surahId);
            setIsSurahBookmarked(false);
            // alert('Bookmark Surah dihapus');
        } else {
            newBookmarks = [...bookmarks, surahId];
            setIsSurahBookmarked(true);
            // alert('Surah berhasil disimpan');
        }
        localStorage.setItem('quran_bookmarks', JSON.stringify(newBookmarks));
    };

    // Verse Bookmark Logic
    const [bookmarkedVerses, setBookmarkedVerses] = useState([]);

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('verse_bookmarks') || '[]');
        setBookmarkedVerses(saved);
    }, []);

    const toggleVerseBookmark = (verse) => {
        const saved = JSON.parse(localStorage.getItem('verse_bookmarks') || '[]');
        const isBookmarked = saved.some(b => b.verse_key === verse.verse_key);
        let newBookmarks;

        if (isBookmarked) {
            newBookmarks = saved.filter(b => b.verse_key !== verse.verse_key);
            // alert('Bookmark Ayat dihapus');
        } else {
            const translation = verse.translations.find(t => t.resource_id === 131)?.text.replace(/<[^>]*>?/gm, '');
            const bookmarkData = {
                verse_key: verse.verse_key,
                text_uthmani: verse.text_uthmani,
                translation: translation,
                surah_name: surah.name_simple,
                surah_id: surah.id
            };
            newBookmarks = [...saved, bookmarkData];
            // alert('Ayat berhasil disimpan');
        }
        setBookmarkedVerses(newBookmarks);
        localStorage.setItem('verse_bookmarks', JSON.stringify(newBookmarks));
    };

    const handleVersePlay = (index) => {
        if (currentVerseIndex === index && isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            playVerse(index);
        }
    };

    // Group verses by page for Page View
    const versesByPage = verses.reduce((acc, verse) => {
        const pageNum = verse.page_number;
        if (!acc[pageNum]) acc[pageNum] = [];
        acc[pageNum].push(verse);
        return acc;
    }, {});

    if (!surah) return <div className="view active">{t('surah.loading')}</div>;

    return (
        <div id="view-surah-detail" className="view active" ref={viewRef} onClick={() => setShowScriptMenu(false)}>
            <div className="detail-header">
                <button className="icon-btn" onClick={() => navigate(-1)}>
                    <i className="fa-solid fa-arrow-left"></i>
                </button>
                <div style={{ textAlign: 'center' }}>
                    <h2 style={{ margin: 0, fontSize: '18px' }}>
                        {viewMode === 'page' && pageVerses.length > 0
                            ? (allChapters[pageVerses[0].chapter_id]?.name_simple || surah.name_simple)
                            : surah.name_simple}
                    </h2>
                    <div style={{ fontSize: '12px', opacity: 0.7 }}>
                        {viewMode === 'page' && pageVerses.length > 0
                            ? `Juz ${pageVerses[0].juz_number} • ${t('surah.page')} ${currentDisplayPage}`
                            : (viewMode === 'list' ? t('surah.verseView') : t('surah.pageView'))}
                    </div>
                </div>
                <div className="detail-actions" style={{ display: 'flex', gap: '10px', alignItems: 'center', position: 'relative' }}>
                    <div style={{ display: 'flex', gap: '5px', marginRight: '10px', borderRight: '1px solid var(--text-muted)', paddingRight: '10px' }}>
                        <button className="icon-btn" onClick={() => playVerse(currentVerseIndex - 1)} style={{ width: '30px', height: '30px', fontSize: '14px' }}>
                            <i className="fa-solid fa-backward-step"></i>
                        </button>
                        <button className="icon-btn" onClick={togglePlay} style={{ width: '30px', height: '30px', fontSize: '14px', color: isPlaying ? 'var(--primary)' : 'inherit' }}>
                            <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
                        </button>
                        <button className="icon-btn" onClick={() => playVerse(currentVerseIndex + 1)} style={{ width: '30px', height: '30px', fontSize: '14px' }}>
                            <i className="fa-solid fa-forward-step"></i>
                        </button>
                    </div>
                    <button
                        className="icon-btn"
                        onClick={(e) => { e.stopPropagation(); setShowScriptMenu(!showScriptMenu); }}
                        title={t('surah.selectScript')}
                        style={{ color: scriptType === 'tajweed' ? 'var(--primary)' : 'inherit' }}
                    >
                        <i className="fa-solid fa-quran"></i>
                    </button>

                    {showScriptMenu && (
                        <div style={{
                            position: 'absolute',
                            top: '100%',
                            right: '0',
                            background: 'var(--bg-card)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            borderRadius: '12px',
                            padding: '8px',
                            zIndex: 100,
                            minWidth: '150px',
                            border: '1px solid rgba(0,0,0,0.05)'
                        }}>
                            <div
                                onClick={() => { setScriptType('plain'); setShowScriptMenu(false); }}
                                style={{
                                    padding: '10px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    background: scriptType === 'plain' ? 'var(--bg-body)' : 'transparent',
                                    color: scriptType === 'plain' ? 'var(--primary)' : 'var(--text-main)',
                                    fontWeight: scriptType === 'plain' ? '600' : 'normal',
                                    fontSize: '14px',
                                    marginBottom: '4px'
                                }}
                            >
                                {t('surah.plain')}
                            </div>
                            <div
                                onClick={() => { setScriptType('tajweed'); setShowScriptMenu(false); }}
                                style={{
                                    padding: '10px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    background: scriptType === 'tajweed' ? 'var(--bg-body)' : 'transparent',
                                    color: scriptType === 'tajweed' ? 'var(--primary)' : 'var(--text-main)',
                                    fontWeight: scriptType === 'tajweed' ? '600' : 'normal',
                                    fontSize: '14px'
                                }}
                            >
                                {t('surah.tajweed')}
                            </div>
                        </div>
                    )}

                    <button className="icon-btn" onClick={() => setViewMode(viewMode === 'list' ? 'page' : 'list')} title="Toggle View">
                        <i className={`fa-solid ${viewMode === 'list' ? 'fa-book-open' : 'fa-list'}`}></i>
                    </button>
                    <button className="icon-btn" onClick={toggleBookmark}>
                        <i className={`fa-${isSurahBookmarked ? 'solid' : 'regular'} fa-bookmark`}></i>
                    </button>
                </div>
            </div>



            <div className="verses-list">
                {viewMode === 'list' ? (
                    // LIST VIEW (Existing)
                    <>
                        {verses.map((verse, index) => {
                            const translationEn = verse.translations.find(t => t.resource_id === 131)?.text;
                            const translationId = verse.translations.find(t => t.resource_id === 33)?.text;
                            const transliteration = verse.translations.find(t => t.resource_id === 57)?.text;
                            const isBookmarked = bookmarkedVerses.some(b => b.verse_key === verse.verse_key);

                            // Determine which translation to show based on language
                            const displayTranslation = language === 'id' ? translationId : translationEn;

                            const verseContent = (
                                <div className={`verse-item ${index === currentVerseIndex ? 'active' : ''}`}>
                                    <div className="verse-header">
                                        <span className="verse-number">{surah.id}:{verse.verse_key.split(':')[1]}</span>
                                        <div className="verse-actions">
                                            <button
                                                className="icon-btn"
                                                onClick={(e) => { e.stopPropagation(); handleVersePlay(index); }}
                                                title={currentVerseIndex === index && isPlaying ? "Pause" : "Play"}
                                            >
                                                <i className={`fa-solid ${currentVerseIndex === index && isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
                                            </button>
                                            <button
                                                className="icon-btn"
                                                onClick={(e) => { e.stopPropagation(); toggleVerseBookmark(verse); }}
                                                title="Bookmark Verse"
                                            >
                                                <i className={`fa-${isBookmarked ? 'solid' : 'regular'} fa-bookmark`}></i>
                                            </button>
                                            <button
                                                className="icon-btn"
                                                onClick={(e) => { e.stopPropagation(); shareVerse(verse); }}
                                                title="Share Verse"
                                            >
                                                <i className="fa-regular fa-share-from-square"></i>
                                            </button>
                                        </div>
                                    </div>
                                    {scriptType === 'tajweed' ? (
                                        <div
                                            className="verse-arabic"
                                            dangerouslySetInnerHTML={{ __html: verse.text_uthmani_tajweed }}
                                        />
                                    ) : (
                                        <div className="verse-arabic">{verse.text_uthmani}</div>
                                    )}
                                    <div className="verse-transliteration">{transliteration}</div>
                                    <div className="verse-translation-group">
                                        <div className="verse-translation-id">{formatTranslation(displayTranslation)}</div>
                                    </div>
                                </div>
                            );

                            if (verses.length === index + 1) {
                                return <div key={verse.id} ref={lastVerseElementRef}>{verseContent}</div>;
                            }
                            return <div key={verse.id} ref={el => verseRefs.current[index] = el}>{verseContent}</div>;
                        })}
                    </>
                ) : (
                    // PAGE VIEW (Mushaf Mode)
                    <div className="mushaf-container">
                        {isLoading ? (
                            <div style={{ textAlign: 'center', padding: '20px' }}>{t('surah.loading')}</div>
                        ) : (
                            <div className="mushaf-page-wrapper">
                                <div
                                    className="mushaf-page"
                                    style={{
                                        background: 'var(--bg-card)',
                                        padding: '20px',
                                        marginBottom: '20px',
                                        borderRadius: '16px',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                        minHeight: '60vh'
                                    }}
                                >
                                    <div style={{
                                        direction: 'rtl',
                                        textAlign: 'justify',
                                        fontFamily: "'Amiri', serif",
                                        fontSize: '24px',
                                        lineHeight: '2.2',
                                        color: 'var(--text-main)'
                                    }}>
                                        {pageVerses.map((verse, idx) => {
                                            const isNewSurah = verse.verse_key.split(':')[1] === '1';
                                            const chapterInfo = allChapters[verse.chapter_id];

                                            return (
                                                <span key={verse.id}>
                                                    {isNewSurah && chapterInfo && (
                                                        <div style={{
                                                            width: '100%',
                                                            textAlign: 'center',
                                                            margin: '20px 0',
                                                            padding: '10px',
                                                            background: 'rgba(var(--primary-rgb), 0.1)',
                                                            borderRadius: '10px',
                                                            border: '1px solid var(--primary)'
                                                        }}>
                                                            <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--primary)' }}>
                                                                {chapterInfo.name_simple}
                                                            </div>
                                                            <div style={{ fontSize: '14px', opacity: 0.7 }}>
                                                                {chapterInfo.translated_name.name}
                                                            </div>
                                                            {verse.chapter_id !== 1 && verse.chapter_id !== 9 && (
                                                                <div style={{ marginTop: '10px', fontFamily: 'Amiri, serif', fontSize: '20px' }}>
                                                                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    <span
                                                        style={{
                                                            cursor: 'pointer',
                                                            borderRadius: '4px',
                                                            transition: 'background 0.2s'
                                                        }}
                                                    >
                                                        {scriptType === 'tajweed' ? (
                                                            <span dangerouslySetInnerHTML={{ __html: verse.text_uthmani_tajweed }} />
                                                        ) : (
                                                            verse.text_uthmani
                                                        )}
                                                        <span style={{
                                                            fontSize: '0.8em',
                                                            color: 'var(--primary)',
                                                            margin: '0 5px',
                                                            border: '1px solid var(--primary)',
                                                            borderRadius: '50%',
                                                            width: '25px',
                                                            height: '25px',
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            verticalAlign: 'middle'
                                                        }}>
                                                            {verse.verse_key.split(':')[1]}
                                                        </span>
                                                    </span>
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Navigation Controls */}
                                <div className="page-navigation" style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginTop: '20px',
                                    padding: '10px',
                                    background: 'var(--bg-card)',
                                    borderRadius: '12px'
                                }}>
                                    <button
                                        onClick={() => setCurrentDisplayPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentDisplayPage <= 1}
                                        style={{
                                            background: 'var(--primary)',
                                            color: 'white',
                                            border: 'none',
                                            padding: '10px 20px',
                                            borderRadius: '8px',
                                            opacity: currentDisplayPage <= 1 ? 0.5 : 1,
                                            cursor: currentDisplayPage <= 1 ? 'default' : 'pointer'
                                        }}
                                    >
                                        <i className="fa-solid fa-chevron-left"></i> {t('surah.prev')}
                                    </button>

                                    <span style={{ fontWeight: 'bold' }}>{t('surah.page')} {currentDisplayPage}</span>

                                    <button
                                        onClick={() => setCurrentDisplayPage(prev => Math.min(prev + 1, 604))}
                                        disabled={currentDisplayPage >= 604}
                                        style={{
                                            background: 'var(--primary)',
                                            color: 'white',
                                            border: 'none',
                                            padding: '10px 20px',
                                            borderRadius: '8px',
                                            opacity: currentDisplayPage >= 604 ? 0.5 : 1,
                                            cursor: currentDisplayPage >= 604 ? 'default' : 'pointer'
                                        }}
                                    >
                                        {t('surah.next')} <i className="fa-solid fa-chevron-right"></i>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {isLoading && <div className="loading-more" style={{ textAlign: 'center', padding: '20px' }}>{t('surah.loading')}</div>}
            </div>
            {shareVerseData && (
                <div className="tasbih-modal" onClick={() => setShareVerseData(null)}>
                    <div className="tasbih-modal-content" onClick={e => e.stopPropagation()} style={{ width: '90%', maxWidth: '400px', padding: '20px' }}>
                        <h3 style={{ marginBottom: '15px' }}>{t('surah.shareTitle')}</h3>

                        {/* Card Preview */}
                        <div
                            ref={shareCardRef}
                            style={{
                                background: 'linear-gradient(135deg, #1e1e1e, #2d3748)',
                                padding: '30px 20px',
                                borderRadius: '15px',
                                color: 'white',
                                textAlign: 'center',
                                marginBottom: '20px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            {/* Decorative Elements */}
                            <div style={{ position: 'absolute', top: '-20px', left: '-20px', width: '100px', height: '100px', background: 'rgba(255,215,0,0.1)', borderRadius: '50%' }}></div>
                            <div style={{ position: 'absolute', bottom: '-20px', right: '-20px', width: '80px', height: '80px', background: 'rgba(76, 175, 80, 0.1)', borderRadius: '50%' }}></div>

                            <div style={{ fontSize: '14px', opacity: 0.8, marginBottom: '20px', letterSpacing: '2px', textTransform: 'uppercase' }}>
                                QS {shareVerseData.surahName} : {shareVerseData.verseNumber}
                            </div>
                            <div style={{ fontSize: '24px', fontFamily: 'Amiri, serif', marginBottom: '20px', lineHeight: '1.8' }}>
                                {shareVerseData.arabic}
                            </div>
                            <div style={{ fontSize: '14px', fontStyle: 'italic', opacity: 0.9, lineHeight: '1.5' }}>
                                "{shareVerseData.translation}"
                            </div>
                            <div style={{ marginTop: '20px', fontSize: '10px', opacity: 0.5 }}>
                                Islamic App
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button className="tasbih-modal-btn secondary" onClick={() => setShareVerseData(null)}>
                                {t('surah.cancel')}
                            </button>
                            <button className="tasbih-modal-btn primary" onClick={handleShareImage}>
                                <i className="fa-solid fa-share-nodes" style={{ marginRight: '8px' }}></i>
                                {t('surah.shareImage')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
