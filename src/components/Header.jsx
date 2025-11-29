import { useEffect, useState } from 'react';
import { getHijriDate } from '../lib/hijri';

export default function Header() {
    const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');

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
                <h1 id="page-title" style={{ margin: 0, lineHeight: '1.2' }}>Al Quran</h1>
                <span style={{ fontSize: '12px', opacity: 0.8, fontWeight: 'normal' }}>{getHijriDate()}</span>
            </div>
            <div className="header-actions">
                <button
                    id="theme-toggle"
                    className="icon-btn"
                    onClick={() => setDarkMode(!darkMode)}
                >
                    <i className={`fa-solid ${darkMode ? 'fa-sun' : 'fa-moon'}`}></i>
                </button>
            </div>
        </header>
    );
}
