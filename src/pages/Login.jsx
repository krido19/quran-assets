import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useSettings } from '../context/SettingsContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { signIn, user, signOut } = useAuth();
    const { t } = useLanguage();
    const { arabicFontSize, setArabicFontSize, arabicFontFamily, setArabicFontFamily } = useSettings();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { error } = await signIn(email, password);
        if (error) {
            alert(error.message);
        } else {
            navigate('/');
        }
    };

    const renderSettings = () => (
        <div className="settings-section" style={{ marginTop: '30px', textAlign: 'left', width: '100%', background: 'var(--bg-card)', padding: '20px', borderRadius: '15px', border: '1px solid var(--border)', boxSizing: 'border-box' }}>
            <h3 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <i className="fa-solid fa-gear" style={{ color: 'var(--primary)' }}></i>
                {t('settings.title')}
            </h3>

            <div className="setting-item" style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '10px', fontWeight: 'bold' }}>
                    {t('settings.arabicFontSize')} ({arabicFontSize}px)
                </label>
                <input
                    type="range"
                    min="20"
                    max="60"
                    value={arabicFontSize}
                    onChange={(e) => setArabicFontSize(parseInt(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
                />
            </div>

            <div className="setting-item">
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '10px', fontWeight: 'bold' }}>
                    {t('settings.arabicFontFamily')}
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {[
                        { id: 'Amiri', label: t('settings.fontStyleAmiri') },
                        { id: 'Indopak', label: t('settings.fontStyleIndopak') },
                        { id: 'Lateef', label: t('settings.fontStyleLateef') }
                    ].map(font => (
                        <button
                            key={font.id}
                            onClick={() => setArabicFontFamily(font.id)}
                            style={{
                                flex: '1',
                                minWidth: '100px',
                                padding: '8px',
                                borderRadius: '10px',
                                border: '2px solid',
                                borderColor: arabicFontFamily === font.id ? 'var(--primary)' : 'transparent',
                                background: arabicFontFamily === font.id ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-body)',
                                color: 'var(--text-main)',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: arabicFontFamily === font.id ? 'bold' : 'normal',
                                transition: 'all 0.2s'
                            }}
                        >
                            {font.label}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ marginTop: '20px', padding: '15px', background: 'var(--bg-body)', borderRadius: '10px', textAlign: 'center' }}>
                <div style={{
                    fontFamily: arabicFontFamily + ', serif',
                    fontSize: `${arabicFontSize}px`,
                    marginBottom: '5px',
                    lineHeight: '1.8'
                }}>
                    بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
                </div>
                <div style={{ fontSize: '12px', opacity: 0.6 }}>Preview</div>
            </div>
        </div>
    );

    if (user) {
        return (
            <div id="view-login" className="view active">
                <div className="auth-container" style={{ maxWidth: '100%', padding: '20px', boxSizing: 'border-box' }}>
                    <h2>{t('profile.title')}</h2>
                    <p style={{ marginBottom: '15px', fontSize: '14px', opacity: 0.8 }}>{user.email}</p>

                    <button
                        className="btn-primary"
                        onClick={() => signOut()}
                        style={{ background: 'var(--text-muted)', marginTop: '0', padding: '10px 20px', width: 'auto', fontSize: '14px', boxShadow: 'none' }}
                    >
                        {t('profile.signOut')}
                    </button>

                    {renderSettings()}

                    <div className="bookmarks-section" style={{ marginTop: '30px', textAlign: 'left', width: '100%' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                            <i className="fa-solid fa-bookmark" style={{ color: 'var(--primary)' }}></i>
                            {t('profile.savedBookmarks')}
                        </h3>
                        <BookmarksList t={t} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div id="view-login" className="view active">
            <div className="auth-container">
                <h2>{t('auth.welcomeBack')}</h2>
                <p>{t('auth.signInSubtitle')}</p>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>{t('auth.email')}</label>
                        <input
                            type="email"
                            required
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>{t('auth.password')}</label>
                        <input
                            type="password"
                            required
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button type="submit" className="btn-primary">{t('auth.signIn')}</button>
                </form>

                {renderSettings()}

                <p className="auth-footer" style={{ marginTop: '20px' }}>
                    {t('auth.noAccount')} <Link to="/signup">{t('auth.signUp')}</Link>
                </p>
            </div>
        </div >
    );
}

function BookmarksList({ t }) {
    const [surahBookmarks, setSurahBookmarks] = useState([]);
    const [verseBookmarks, setVerseBookmarks] = useState([]);
    const [selectedTag, setSelectedTag] = useState('All');
    const [availableTags, setAvailableTags] = useState([]);
    const navigate = useNavigate();

    const loadBookmarks = () => {
        const surahs = JSON.parse(localStorage.getItem('quran_bookmarks') || '[]');
        const verses = JSON.parse(localStorage.getItem('verse_bookmarks') || '[]');

        // Normalize surahs
        const normalizedSurahs = surahs.map(b => typeof b === 'number' ? { id: b, tags: [] } : b);

        setSurahBookmarks(normalizedSurahs);
        setVerseBookmarks(verses);

        // Extract all unique tags
        const tags = new Set(['All']);
        normalizedSurahs.forEach(b => b.tags?.forEach(tag => tags.add(tag)));
        verses.forEach(b => b.tags?.forEach(tag => tags.add(tag)));
        setAvailableTags(Array.from(tags));
    };

    useEffect(() => {
        loadBookmarks();
    }, []);

    const filteredSurahs = selectedTag === 'All'
        ? surahBookmarks
        : surahBookmarks.filter(b => b.tags?.includes(selectedTag));

    const filteredVerses = selectedTag === 'All'
        ? verseBookmarks
        : verseBookmarks.filter(b => b.tags?.includes(selectedTag));

    const removeTag = (type, id, tagToRemove) => {
        const key = type === 'surah' ? 'quran_bookmarks' : 'verse_bookmarks';
        const current = JSON.parse(localStorage.getItem(key) || '[]');
        const updated = current.map(item => {
            if (type === 'surah') {
                const isLegacy = typeof item === 'number';
                const itemId = isLegacy ? item : item.id;
                if (itemId === id) {
                    const tags = isLegacy ? [] : (item.tags || []);
                    return { id: itemId, tags: tags.filter(t => t !== tagToRemove) };
                }
            } else {
                if (item.verse_key === id) {
                    const tags = item.tags || [];
                    return { ...item, tags: tags.filter(t => t !== tagToRemove) };
                }
            }
            return item;
        });
        localStorage.setItem(key, JSON.stringify(updated));
        loadBookmarks();
    };

    if (surahBookmarks.length === 0 && verseBookmarks.length === 0) {
        return <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>{t('profile.noBookmarks')}</p>;
    }

    return (
        <div className="bookmarks-list">
            {/* Tag Filter Chips */}
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '15px', marginBottom: '10px' }}>
                {availableTags.map(tag => (
                    <button
                        key={tag}
                        onClick={() => setSelectedTag(tag)}
                        style={{
                            padding: '6px 15px',
                            borderRadius: '15px',
                            border: '1px solid',
                            borderColor: selectedTag === tag ? 'var(--primary)' : 'var(--border)',
                            background: selectedTag === tag ? 'var(--primary)' : 'var(--bg-card)',
                            color: selectedTag === tag ? 'white' : 'var(--text-main)',
                            fontSize: '12px',
                            whiteSpace: 'nowrap',
                            cursor: 'pointer'
                        }}
                    >
                        {tag === 'All' ? t('bookmarks.filterAll') : tag}
                    </button>
                ))}
            </div>

            {filteredSurahs.length > 0 && (
                <div className="bookmark-group">
                    <h4>{t('profile.surahs')}</h4>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {filteredSurahs.map(b => (
                            <div key={b.id} style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                <button
                                    onClick={() => navigate(`/surah/${b.id}`)}
                                    style={{
                                        background: 'var(--bg-body)',
                                        border: '1px solid var(--text-muted)',
                                        padding: '8px 15px',
                                        borderRadius: '20px',
                                        color: 'var(--text-main)',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Surah {b.id}
                                </button>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                    {b.tags?.map(tag => (
                                        <span key={tag} style={{ fontSize: '10px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--primary)', padding: '2px 6px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            {tag}
                                            <i className="fa-solid fa-xmark" onClick={(e) => { e.stopPropagation(); removeTag('surah', b.id, tag); }} style={{ cursor: 'pointer' }}></i>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {filteredVerses.length > 0 && (
                <div className="bookmark-group" style={{ marginTop: '20px' }}>
                    <h4>{t('profile.verses')}</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {filteredVerses.map((b, i) => (
                            <div
                                key={i}
                                style={{
                                    background: 'var(--bg-body)',
                                    padding: '12px',
                                    borderRadius: '12px',
                                    borderLeft: '3px solid var(--primary)',
                                    position: 'relative'
                                }}
                            >
                                <div onClick={() => navigate(`/surah/${b.surah_id}`, { state: { targetVerse: b.verse_key } })} style={{ cursor: 'pointer' }}>
                                    <div style={{ fontWeight: 'bold', marginBottom: '5px', fontSize: '14px' }}>QS {b.surah_name} {b.verse_key.split(':')[1]}</div>
                                    <div style={{ fontSize: '0.9em', color: 'var(--text-muted)', marginBottom: '8px' }}>{b.translation?.substring(0, 80)}...</div>
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                    {b.tags?.map(tag => (
                                        <span key={tag} style={{ fontSize: '10px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '5px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            {tag}
                                            <i className="fa-solid fa-xmark" onClick={() => removeTag('verse', b.verse_key, tag)} style={{ cursor: 'pointer' }}></i>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
