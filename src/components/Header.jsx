import { useEffect, useState } from 'react';

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
            <h1 id="page-title">Al Quran</h1>
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
