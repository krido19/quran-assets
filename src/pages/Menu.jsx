import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function Menu() {
    const { t } = useLanguage();

    const menuItems = [
        { path: '/asmaul-husna', icon: 'fa-solid fa-star-and-crescent', label: t('menu.asmaulHusna'), color: '#FFD700' },
        { path: '/daily-prayers', icon: 'fa-solid fa-hands-praying', label: t('menu.dailyPrayers'), color: '#4CAF50' },
        { path: '/dzikir-pagi-petang', icon: 'fa-solid fa-sun', label: t('menu.dzikir'), color: '#FF9800' },
        { path: '/doa-khatam', icon: 'fa-solid fa-book-quran', label: t('menu.doaKhatam'), color: '#9C27B0' },
        { path: '/profile', icon: 'fa-solid fa-user', label: t('menu.profile'), color: '#9C27B0' },
    ];

    return (
        <div className="view active" style={{ padding: '20px', paddingBottom: '80px' }}>
            <h1 style={{ marginBottom: '20px' }}>{t('menu.others')}</h1>

            <div className="menu-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                {menuItems.map((item, index) => (
                    <Link to={item.path} key={index} style={{
                        textDecoration: 'none',
                        color: 'var(--text-main)',
                        background: 'var(--bg-card)',
                        padding: '20px',
                        borderRadius: '15px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{
                            fontSize: '30px',
                            color: item.color,
                            marginBottom: '5px'
                        }}>
                            <i className={item.icon}></i>
                        </div>
                        <span style={{ fontWeight: '600', textAlign: 'center' }}>{item.label}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
