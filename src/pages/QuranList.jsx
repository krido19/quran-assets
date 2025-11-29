import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function QuranList() {
    const [surahs, setSurahs] = useState([]);
    const [filter, setFilter] = useState('all'); // 'all' or 'bookmarks'
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetch('https://api.quran.com/api/v4/chapters?language=en')
            .then(res => res.json())
            .then(data => setSurahs(data.chapters));
    }, []);

    const getBookmarks = () => {
        return JSON.parse(localStorage.getItem('quran_bookmarks') || '[]');
    };

    const getVerseBookmarks = () => {
        return JSON.parse(localStorage.getItem('verse_bookmarks') || '[]');
    };

    const filteredSurahs = surahs.filter(surah => {
        const matchesSearch = surah.name_simple.toLowerCase().includes(search.toLowerCase()) ||
            surah.name_arabic.includes(search);

        if (filter === 'bookmarks') {
            const bookmarks = getBookmarks().map(b => parseInt(b));
            return matchesSearch && bookmarks.includes(surah.id);
        }
        return matchesSearch;
    });

    const bookmarkedVerses = filter === 'bookmarks' ? getVerseBookmarks() : [];

    return (
        <div id="view-quran" className="view active">
            <div className="search-bar">
                <i className="fa-solid fa-search"></i>
                <input
                    type="text"
                    placeholder="Search Surah..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            <div className="filter-buttons">
                <button
                    className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    All
                </button>
                <button
                    className={`filter-btn ${filter === 'bookmarks' ? 'active' : ''}`}
                    onClick={() => setFilter('bookmarks')}
                >
                    Bookmarks
                </button>
            </div>

            {filter === 'bookmarks' && bookmarkedVerses.length > 0 && (
                <div className="section-title" style={{ padding: '1rem 1rem 0', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                </div>
            )}

            <div className="surah-list">
                {filteredSurahs.map(surah => (
                    <div
                        key={surah.id}
                        className="surah-item"
                        onClick={() => navigate(`/surah/${surah.id}`)}
                    >
                        <div className="surah-number">{surah.id}</div>
                        <div className="surah-info">
                            <div className="surah-name-en">{surah.name_simple}</div>
                            <div className="surah-details">{surah.translated_name.name} • {surah.verses_count} Verses</div>
                        </div>
                        <div className="surah-name-ar">{surah.name_arabic}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
