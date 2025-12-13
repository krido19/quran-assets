import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { signIn, user, signOut } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { error } = await signIn(email, password);
        if (error) {
            alert(error.message); // Replace with Toast later
        } else {
            navigate('/');
        }
    };

    if (user) {
        return (
            <div id="view-login" className="view active">
                <div className="auth-container">
                    <h2>{t('profile.title')}</h2>
                    <p>{user.email}</p>

                    <div className="bookmarks-section" style={{ marginTop: '30px', textAlign: 'left', width: '100%' }}>
                        <h3>{t('profile.savedBookmarks')}</h3>
                        <BookmarksList t={t} />
                    </div>

                    <button
                        className="btn-primary"
                        onClick={() => signOut()}
                        style={{ background: 'var(--text-muted)', marginTop: '20px' }}
                    >
                        {t('profile.signOut')}
                    </button>
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
                <p className="auth-footer">
                    {t('auth.noAccount')} <Link to="/signup">{t('auth.signUp')}</Link>
                </p>
            </div >
        </div >
    );
}

function BookmarksList({ t }) {
    const [surahBookmarks, setSurahBookmarks] = useState([]);
    const [verseBookmarks, setVerseBookmarks] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const surahs = JSON.parse(localStorage.getItem('quran_bookmarks') || '[]');
        const verses = JSON.parse(localStorage.getItem('verse_bookmarks') || '[]');
        setSurahBookmarks(surahs);
        setVerseBookmarks(verses);
    }, []);

    if (surahBookmarks.length === 0 && verseBookmarks.length === 0) {
        return <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>{t('profile.noBookmarks')}</p>;
    }

    return (
        <div className="bookmarks-list">
            {surahBookmarks.length > 0 && (
                <div className="bookmark-group">
                    <h4>{t('profile.surahs')}</h4>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {surahBookmarks.map(id => (
                            <button
                                key={id}
                                onClick={() => navigate(`/surah/${id}`)}
                                style={{
                                    background: 'var(--bg-body)',
                                    border: '1px solid var(--text-muted)',
                                    padding: '8px 15px',
                                    borderRadius: '20px',
                                    color: 'var(--text-main)',
                                    cursor: 'pointer'
                                }}
                            >
                                Surah {id}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {verseBookmarks.length > 0 && (
                <div className="bookmark-group" style={{ marginTop: '20px' }}>
                    <h4>{t('profile.verses')}</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {verseBookmarks.map((b, i) => (
                            <div
                                key={i}
                                onClick={() => navigate(`/surah/${b.surah_id}`, { state: { targetVerse: b.verse_key } })}
                                style={{
                                    background: 'var(--bg-body)',
                                    padding: '10px',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    borderLeft: '3px solid var(--primary)'
                                }}
                            >
                                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>QS {b.surah_name} {b.verse_key.split(':')[1]}</div>
                                <div style={{ fontSize: '0.9em', color: 'var(--text-muted)' }}>{b.translation?.substring(0, 50)}...</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
