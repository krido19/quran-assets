import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toBlob } from 'html-to-image';
import { useLanguage } from '../context/LanguageContext';
import { useSettings } from '../context/SettingsContext';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Virtual } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/virtual';

const MushafSlide = ({ pageNumber, language, scriptType, allChapters, onDataLoaded, isPlaying, currentVerseIndex, playVerse, toggleVerseBookmark, handleVersePlay, formatTranslation, fontSize, fontFamily }) => {
    const [verses, setVerses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadPage = async () => {
            const cacheKey = `quran_page_${pageNumber}_${language}`;
            const cached = localStorage.getItem(cacheKey);

            if (cached) {
                try {
                    const data = JSON.parse(cached);
                    setVerses(data);
                    setLoading(false);
                    onDataLoaded(pageNumber, data);
                    return;
                } catch (e) {
                    console.error('Cache parse error', e);
                }
            }

            setLoading(true);
            try {
                const res = await fetch(`https://api.quran.com/api/v4/verses/by_page/${pageNumber}?language=${language}&words=true&translations=131,33,57&audio=1&fields=text_uthmani,text_uthmani_tajweed,text_indopak,page_number,juz_number,chapter_id`);
                const data = await res.json();
                setVerses(data.verses);
                onDataLoaded(pageNumber, data.verses);
                try {
                    localStorage.setItem(cacheKey, JSON.stringify(data.verses));
                } catch (e) {
                    // Quota exceeded or other error, ignore
                    console.warn('Cache save failed', e);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadPage();
    }, [pageNumber, language]);

    if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Loading Page {pageNumber}...</div>;

    return (
        <div className="mushaf-page-wrapper" style={{ padding: '0 10px', height: '80vh', overflowY: 'auto' }}>
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
                    fontFamily: fontFamily + ', serif',
                    fontSize: fontSize + 'px',
                    lineHeight: '2.2',
                    color: 'var(--text-main)'
                }}>
                    {verses.map((verse, idx) => {
                        const isNewSurah = verse.verse_key.split(':')[1] === '1';
                        // Use a fallback for Chapter Info if allChapters isn't fully loaded yet
                        const chapterInfo = allChapters[verse.chapter_id];

                        return (
                            <span key={verse.id}>
                                {isNewSurah && chapterInfo && (
                                    <div style={{
                                        width: '100%',
                                        textAlign: 'center',
                                        margin: '20px 0',
                                        padding: '10px',
                                        background: 'rgba(16, 185, 129, 0.1)',
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
                                            <div style={{ marginTop: '10px', fontFamily: fontFamily + ', serif', fontSize: fontSize + 'px' }}>
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
                                        fontFamily === 'Indopak' ? verse.text_indopak : verse.text_uthmani
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
            <div style={{ textAlign: 'center', padding: '10px', opacity: 0.5 }}>
                Page {pageNumber}
            </div>
        </div>
    );
};

export default function SurahDetail() {
    const { language, t } = useLanguage();
    const { arabicFontSize, arabicFontFamily } = useSettings();

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
    const [showTagModal, setShowTagModal] = useState(false);
    const [taggingItem, setTaggingItem] = useState(null); // { type: 'surah'|'verse', data: any }
    const [availableTags, setAvailableTags] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);

    // Load available tags
    useEffect(() => {
        const surahNodes = JSON.parse(localStorage.getItem('quran_bookmarks') || '[]');
        const verseNodes = JSON.parse(localStorage.getItem('verse_bookmarks') || '[]');

        const tags = new Set([
            t('bookmarks.tagHafalan'),
            t('bookmarks.tagFavorit'),
            t('bookmarks.tagPenting')
        ]);

        surahNodes.forEach(b => { if (b.tags) b.tags.forEach(t => tags.add(t)) });
        verseNodes.forEach(b => { if (b.tags) b.tags.forEach(t => tags.add(t)) });

        setAvailableTags(Array.from(tags));
    }, [t]);

    // Fetch All Chapters for reference
    useEffect(() => {
        const cached = localStorage.getItem('quran_all_chapters_' + language);
        if (cached) setAllChapters(JSON.parse(cached));

        fetch('https://api.quran.com/api/v4/chapters?language=' + language)
            .then(res => res.json())
            .then(data => {
                const chaptersMap = {};
                data.chapters.forEach(c => chaptersMap[c.id] = c);
                setAllChapters(chaptersMap);
                localStorage.setItem('quran_all_chapters_' + language, JSON.stringify(chaptersMap));
            });
    }, [language]);

    const [isOffline, setIsOffline] = useState(!navigator.onLine);

    // Fetch Surah Info
    useEffect(() => {
        const cachedSurah = localStorage.getItem(`surah_info_${id}_${language}`);
        if (cachedSurah) setSurah(JSON.parse(cachedSurah));

        fetch(`https://api.quran.com/api/v4/chapters/${id}?language=${language}`)
            .then(res => res.json())
            .then(data => {
                setSurah(data.chapter);
                localStorage.setItem(`surah_info_${id}_${language}`, JSON.stringify(data.chapter));
                // Reset verses when surah changes
                setVerses([]);
                setHasMore(true);
                setIsOffline(false);

                // If switching surah, set page to surah's first page
                if (viewMode === 'page') {
                    setCurrentDisplayPage(data.chapter.pages[0]);
                } else {
                    const targetVerseKey = location.state?.targetVerse;
                    let initialLimit = 50;
                    if (targetVerseKey) {
                        const vNum = parseInt(targetVerseKey.split(':')[1]);
                        if (vNum > 50) initialLimit = Math.min(Math.ceil(vNum / 50) * 50, 300);
                    }
                    setPage(initialLimit / 50);
                    fetchVerses(1, initialLimit);
                }
            })
            .catch(() => {
                setIsOffline(true);
                // Fallback to cache even for pagination logic if surah exists
                if (cachedSurah && viewMode === 'list') {
                    fetchVerses(1, 1000); // Load all cached if possible
                }
            });

        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
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
    const fetchVerses = (pageNumber, customPerPage = 50) => {
        if (isLoading) return;

        // Try load from cache first for List View
        if (pageNumber === 1) {
            const cachedVerses = localStorage.getItem(`surah_verses_${id}_${language}`);
            if (cachedVerses) {
                setVerses(JSON.parse(cachedVerses));
            }
        }

        setIsLoading(true);

        fetch(`https://api.quran.com/api/v4/verses/by_chapter/${id}?language=${language}&words=true&translations=131,33,57&audio=1&fields=text_uthmani,text_uthmani_tajweed,text_indopak,page_number,juz_number&per_page=${customPerPage}&page=${pageNumber}`)
            .then(res => res.json())
            .then(data => {
                if (data.verses.length === 0) {
                    setHasMore(false);
                } else {
                    setVerses(prev => {
                        const newVerses = data.verses.filter(v => !prev.some(p => p.id === v.id));
                        const combined = [...prev, ...newVerses];
                        // Cache initial set of verses (e.g., first 100)
                        if (pageNumber === 1 || combined.length <= 100) {
                            try {
                                localStorage.setItem(`surah_verses_${id}_${language}`, JSON.stringify(combined.slice(0, 150)));
                            } catch (e) {
                                console.warn('Verse cache overflow', e);
                            }
                        }
                        return combined;
                    });
                    if (pageNumber === 1 && data.verses.length > 0) {
                        setAudioSrc(data.verses[0].audio.url);
                    }
                }
                setIsLoading(false);
            })
            .catch(() => {
                setIsLoading(false);
                setIsOffline(true);
            });
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
        // if (viewMode === 'page' && currentDisplayPage) {
        //     fetchPageContent(currentDisplayPage);
        // }
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
        const isBookmarked = bookmarks.some(b => {
            if (typeof b === 'number') return b === parseInt(id);
            return b.id === parseInt(id);
        });
        setIsSurahBookmarked(isBookmarked);
    }, [id]);

    const toggleBookmark = () => {
        let bookmarks = JSON.parse(localStorage.getItem('quran_bookmarks') || '[]');
        const surahId = parseInt(id);

        // Normalize old bookmarks (numbers to objects)
        bookmarks = bookmarks.map(b => typeof b === 'number' ? { id: b, tags: [] } : b);

        const index = bookmarks.findIndex(b => b.id === surahId);

        if (index !== -1) {
            const newBookmarks = bookmarks.filter(b => b.id !== surahId);
            localStorage.setItem('quran_bookmarks', JSON.stringify(newBookmarks));
            setIsSurahBookmarked(false);
        } else {
            // Open tag modal first
            setTaggingItem({ type: 'surah', id: surahId });
            setSelectedTags([]);
            setShowTagModal(true);
        }
    };

    const saveSurahBookmark = (tags) => {
        let bookmarks = JSON.parse(localStorage.getItem('quran_bookmarks') || '[]');
        bookmarks = bookmarks.map(b => typeof b === 'number' ? { id: b, tags: [] } : b);

        const surahId = parseInt(id);
        const newBookmarks = [...bookmarks, { id: surahId, tags }];
        localStorage.setItem('quran_bookmarks', JSON.stringify(newBookmarks));
        setIsSurahBookmarked(true);
        setShowTagModal(false);
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

        if (isBookmarked) {
            const newBookmarks = saved.filter(b => b.verse_key !== verse.verse_key);
            setBookmarkedVerses(newBookmarks);
            localStorage.setItem('verse_bookmarks', JSON.stringify(newBookmarks));
        } else {
            setTaggingItem({ type: 'verse', verse });
            setSelectedTags([]);
            setShowTagModal(true);
        }
    };

    const saveVerseBookmark = (tags) => {
        const verse = taggingItem.verse;
        const saved = JSON.parse(localStorage.getItem('verse_bookmarks') || '[]');

        const translation = verse.translations.find(t => t.resource_id === 131)?.text.replace(/<[^>]*>?/gm, '');
        const bookmarkData = {
            verse_key: verse.verse_key,
            text_uthmani: verse.text_uthmani,
            translation: translation,
            surah_name: surah.name_simple,
            surah_id: surah.id,
            tags: tags
        };

        const newBookmarks = [...saved, bookmarkData];
        setBookmarkedVerses(newBookmarks);
        localStorage.setItem('verse_bookmarks', JSON.stringify(newBookmarks));
        setShowTagModal(false);
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
                <button
                    className="icon-btn"
                    onClick={() => navigate(location.state?.fromSearch ? '/search' : -1)}
                    style={{ width: location.state?.fromSearch ? 'auto' : '40px', padding: location.state?.fromSearch ? '0 15px' : '0' }}
                >
                    <i className="fa-solid fa-arrow-left" style={{ marginRight: location.state?.fromSearch ? '8px' : '0' }}></i>
                    {location.state?.fromSearch && <span style={{ fontSize: '14px' }}>{t('search.backToSearch')}</span>}
                </button>
                <div style={{ textAlign: 'center', flex: 1 }}>
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
                {isOffline && (
                    <div style={{
                        margin: '0 20px 15px',
                        padding: '10px 15px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        borderRadius: '12px',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <i className="fa-solid fa-cloud-slash"></i>
                        {t('surah.offlineMode') || 'Mode Offline - Menampilkan ayat dari cache.'}
                    </div>
                )}
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
                                            style={{
                                                fontFamily: arabicFontFamily + ', serif',
                                                fontSize: arabicFontSize + 'px',
                                                lineHeight: '2.2'
                                            }}
                                            dangerouslySetInnerHTML={{ __html: verse.text_uthmani_tajweed }}
                                        />
                                    ) : (
                                        <div className="verse-arabic" style={{
                                            fontFamily: arabicFontFamily + ', serif',
                                            fontSize: arabicFontSize + 'px',
                                            lineHeight: '2.2'
                                        }}>
                                            {arabicFontFamily === 'Indopak' ? verse.text_indopak : verse.text_uthmani}
                                        </div>
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
                    <Swiper
                        modules={[Virtual]}
                        spaceBetween={20}
                        slidesPerView={1}
                        virtual
                        initialSlide={currentDisplayPage - 1}
                        onSlideChange={(swiper) => {
                            const newPage = swiper.activeIndex + 1;
                            setCurrentDisplayPage(newPage);
                        }}
                        style={{ height: '100%' }}
                    >
                        {Array.from({ length: 604 }).map((_, index) => (
                            <SwiperSlide key={index} virtualIndex={index}>
                                <MushafSlide
                                    pageNumber={index + 1}
                                    language={language}
                                    scriptType={scriptType}
                                    allChapters={allChapters}
                                    onDataLoaded={(pNum, verses) => {
                                        if (pNum === currentDisplayPage) {
                                            setPageVerses(verses);
                                        }
                                    }}
                                    isPlaying={isPlaying}
                                    currentVerseIndex={currentVerseIndex}
                                    playVerse={playVerse}
                                    toggleVerseBookmark={toggleVerseBookmark}
                                    handleVersePlay={handleVersePlay}
                                    formatTranslation={formatTranslation}
                                    fontSize={arabicFontSize}
                                    fontFamily={arabicFontFamily}
                                />
                            </SwiperSlide>
                        ))}
                    </Swiper>
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

            {/* Bookmark Tag Modal */}
            {showTagModal && (
                <div className="tasbih-modal" onClick={() => setShowTagModal(false)}>
                    <div className="tasbih-modal-content" onClick={e => e.stopPropagation()} style={{ width: '90%', maxWidth: '400px', padding: '20px' }}>
                        <h3 style={{ marginBottom: '15px' }}>{t('bookmarks.manageTags')}</h3>
                        <p style={{ fontSize: '14px', opacity: 0.7, marginBottom: '20px' }}>
                            {taggingItem?.type === 'surah' ? surah?.name_simple : `QS ${taggingItem?.verse?.verse_key}`}
                        </p>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
                            {availableTags.map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => {
                                        setSelectedTags(prev =>
                                            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
                                        );
                                    }}
                                    style={{
                                        padding: '8px 15px',
                                        borderRadius: '20px',
                                        border: '1px solid',
                                        borderColor: selectedTags.includes(tag) ? 'var(--primary)' : 'var(--text-muted)',
                                        background: selectedTags.includes(tag) ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                                        color: selectedTags.includes(tag) ? 'var(--primary)' : 'var(--text-main)',
                                        cursor: 'pointer',
                                        fontSize: '12px'
                                    }}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
                            <input
                                id="new-tag-input"
                                type="text"
                                placeholder={t('bookmarks.addTag')}
                                style={{
                                    flex: 1,
                                    padding: '10px',
                                    borderRadius: '10px',
                                    border: '1px solid var(--border)',
                                    background: 'var(--bg-body)',
                                    color: 'var(--text-main)'
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && e.target.value.trim()) {
                                        const newTag = e.target.value.trim();
                                        if (!availableTags.includes(newTag)) {
                                            setAvailableTags(prev => [...prev, newTag]);
                                        }
                                        if (!selectedTags.includes(newTag)) {
                                            setSelectedTags(prev => [...prev, newTag]);
                                        }
                                        e.target.value = '';
                                    }
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button className="tasbih-modal-btn secondary" onClick={() => setShowTagModal(false)}>
                                {t('surah.cancel')}
                            </button>
                            <button
                                className="tasbih-modal-btn primary"
                                onClick={() => taggingItem.type === 'surah' ? saveSurahBookmark(selectedTags) : saveVerseBookmark(selectedTags)}
                            >
                                {t('surah.save')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
