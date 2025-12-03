import { useEffect, useState } from 'react';
import { getHijriDate } from '../lib/hijri';
import { useLanguage } from '../context/LanguageContext';

export default function Header() {
    const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
    const { language, setLanguage, t } = useLanguage();

    useEffect(() => {
        if (darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        localStorage.setItem('darkMode', darkMode);
    }, [darkMode]);

    return (
        <header className="app-header">
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <h1 id="page-title" style={{ margin: 0, lineHeight: '1.2' }}>{t('app.title')}</h1>
                <span style={{ fontSize: '12px', opacity: 0.8, fontWeight: 'normal' }}>{getHijriDate()}</span>
            </div>
            <div className="header-actions" style={{ display: 'flex', gap: '10px' }}>
                <button
                    className="icon-btn"
                    onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
                    style={{
                        background: 'var(--bg-card)',
                        boxShadow: 'var(--shadow)',
                        width: '40px',
                        height: '40px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-main)',
                        fontWeight: 'bold',
                        fontSize: '14px'
                    }}
                >
                    {language.toUpperCase()}
                </button>
                <button
                    id="theme-toggle"
                    className="icon-btn"
                    onClick={() => setDarkMode(!darkMode)}
                    style={{
                        background: 'var(--bg-card)',
                        boxShadow: 'var(--shadow)',
                        width: '40px',
                        height: '40px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-main)'
                    }}
                >
                    <i className={`fa-solid ${darkMode ? 'fa-sun' : 'fa-moon'}`}></i>
                </button>
            </div>
        </header>
    );
}
