import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function GlobalSearch() {
    const navigate = useNavigate();
    const { language, t } = useLanguage();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalResults, setTotalResults] = useState(0);
    const [page, setPage] = useState(1);
    const [allChapters, setAllChapters] = useState({});
    const [isOffline, setIsOffline] = useState(!navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    useEffect(() => {
        fetch('https://api.quran.com/api/v4/chapters?language=' + language)
            .then(res => res.json())
            .then(data => {
                const chaptersMap = {};
                data.chapters.forEach(c => chaptersMap[c.id] = c);
                setAllChapters(chaptersMap);
            });
    }, [language]);

    const performSearch = async (searchPage = 1) => {
        if (!query.trim()) {
            setResults([]);
            setTotalResults(0);
            localStorage.removeItem('last_search_query');
            localStorage.removeItem('last_search_results');
            return;
        }
        setLoading(true);
        try {
            const apiLang = language === 'id' ? 'id' : 'en';
            // Use specific translation IDs to search in: 33 (ID - Kemenag), 131 (EN - Clear Quran)
            const translationId = language === 'id' ? 33 : 131;
            const response = await fetch(`https://api.quran.com/api/v4/search?q=${encodeURIComponent(query)}&language=${apiLang}&translations=${translationId}&page=${searchPage}`);
            const data = await response.json();

            let newResults;
            if (searchPage === 1) {
                newResults = data.search.results;
            } else {
                newResults = [...results, ...data.search.results];
            }

            setResults(newResults);
            setTotalResults(data.search.total_results);
            setPage(searchPage);

            // Persist search results
            localStorage.setItem('last_search_query', query);
            localStorage.setItem('last_search_results', JSON.stringify(newResults));
            localStorage.setItem('last_search_total', data.search.total_results.toString());
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setLoading(false);
        }
    };

    // Load persisted search
    useEffect(() => {
        const savedQuery = localStorage.getItem('last_search_query');
        const savedResults = JSON.parse(localStorage.getItem('last_search_results') || '[]');
        const savedTotal = parseInt(localStorage.getItem('last_search_total') || '0');

        if (savedQuery && savedResults.length > 0) {
            setQuery(savedQuery);
            setResults(savedResults);
            setTotalResults(savedTotal);
        }
    }, []);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.trim().length >= 3) { // Only search if 3+ chars
                performSearch(1);
            } else if (query.trim().length === 0) {
                setResults([]);
                setTotalResults(0);
            }
        }, 600); // 600ms delay

        return () => clearTimeout(timer);
    }, [query]);

    const handleSearchClick = (e) => {
        e.preventDefault();
        performSearch(1);
    };

    const handleResultClick = (surahId, verseKey) => {
        // Navigate to SurahDetail with targetVerse in state
        navigate(`/surah/${surahId}`, { state: { targetVerse: verseKey, fromSearch: true } });
    };

    return (
        <div className="view active">
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

                <h1>{t('search.title')}</h1>

                <form onSubmit={handleSearchClick} style={{ marginTop: '20px', position: 'relative' }}>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={t('search.placeholder')}
                        className="glass-panel"
                        style={{
                            width: '100%',
                            padding: '15px 50px 15px 20px',
                            border: 'none',
                            borderRadius: '15px',
                            fontSize: '16px',
                            background: 'var(--bg-card)',
                            boxShadow: 'var(--shadow)',
                            outline: 'none'
                        }}
                    />
                    <button
                        type="submit"
                        style={{
                            position: 'absolute',
                            right: '15px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            color: 'var(--primary)',
                            fontSize: '18px',
                            cursor: 'pointer'
                        }}
                    >
                        <i className="fa-solid fa-magnifying-glass"></i>
                    </button>
                </form>
            </div>

            <div style={{ padding: '0 20px' }}>
                {isOffline && (
                    <div style={{
                        marginBottom: '15px',
                        padding: '10px 15px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        borderRadius: '10px',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <i className="fa-solid fa-wifi-slash"></i>
                        {t('search.offlineMessage') || 'Pencarian tidak tersedia saat offline. Hubungkan ke internet untuk mencari ayat.'}
                    </div>
                )}
                {loading && page === 1 ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <div className="loader" style={{ margin: '0 auto 10px' }}></div>
                        <p>{t('search.searching')}</p>
                    </div>
                ) : (
                    <>
                        {totalResults > 0 && (
                            <div style={{ marginBottom: '20px', opacity: 0.7, fontSize: '14px' }}>
                                {t('search.resultsCount').replace('{count}', totalResults)}
                            </div>
                        )}

                        {results.length === 0 && query && !loading && (
                            <div style={{ textAlign: 'center', padding: '40px', opacity: 0.6 }}>
                                <i className="fa-solid fa-face-frown" style={{ fontSize: '40px', marginBottom: '15px' }}></i>
                                <p>{t('search.noResults').replace('{query}', query)}</p>
                            </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {results.map((result, index) => {
                                const [surahId, verseNumber] = result.verse_key.split(':');
                                return (
                                    <div
                                        key={`${result.verse_id}-${index}`}
                                        className="glass-panel"
                                        onClick={() => handleResultClick(surahId, result.verse_key)}
                                        style={{
                                            padding: '15px 20px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '8px',
                                            border: '1px solid var(--border)',
                                            boxShadow: 'none'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            e.currentTarget.style.borderColor = 'var(--primary)';
                                            e.currentTarget.style.background = 'var(--bg-card)';
                                            e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.05)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.borderColor = 'var(--border)';
                                            e.currentTarget.style.background = 'transparent';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontWeight: 'bold', color: 'var(--primary)', fontSize: '15px' }}>
                                                QS. {allChapters[surahId]?.name_simple || surahId}:{verseNumber}
                                            </span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ fontSize: '12px', opacity: 0.6 }}>{t('surah.verse')} {verseNumber}</span>
                                                <i className="fa-solid fa-chevron-right" style={{ opacity: 0.3, fontSize: '12px' }}></i>
                                            </div>
                                        </div>
                                        <div
                                            style={{
                                                fontSize: '14px',
                                                lineHeight: '1.6',
                                                color: 'var(--text-main)',
                                                display: '-webkit-box',
                                                WebkitLineClamp: '3',
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden'
                                            }}
                                            dangerouslySetInnerHTML={{
                                                __html: result.translations && result.translations.length > 0
                                                    ? result.translations[0].text.replace(/<em>/g, '<em style="color: var(--primary); font-weight: bold; font-style: normal; background: rgba(16, 185, 129, 0.1); padding: 0 2px; border-radius: 4px;">')
                                                    : result.text
                                            }}
                                        />
                                    </div>
                                );
                            })}
                        </div>

                        {results.length < totalResults && (
                            <button
                                onClick={() => performSearch(page + 1)}
                                disabled={loading}
                                style={{
                                    width: '100%',
                                    marginTop: '30px',
                                    padding: '16px',
                                    borderRadius: '16px',
                                    border: 'none',
                                    background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                                    color: 'white',
                                    fontWeight: '700',
                                    fontSize: '15px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '10px',
                                    boxShadow: '0 10px 20px rgba(16, 185, 129, 0.2)',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 15px 30px rgba(16, 185, 129, 0.3)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 10px 20px rgba(16, 185, 129, 0.2)';
                                }}
                            >
                                {loading ? (
                                    <>
                                        <div className="loader" style={{ width: '20px', height: '20px', borderSize: '2px' }}></div>
                                        {t('search.searching')}
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-solid fa-plus-circle"></i>
                                        {language === 'id' ? 'Lihat Lebih Banyak Hasil' : 'View More Results'}
                                    </>
                                )}
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
