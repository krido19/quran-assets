import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import dzikirData from '../data/dzikir-pagi-petang.json';
import { useLanguage } from '../context/LanguageContext';
import { useSettings } from '../context/SettingsContext';

export default function DzikirPagiPetang() {
    const navigate = useNavigate();
    const { t, language } = useLanguage();
    const { arabicFontSize, arabicFontFamily } = useSettings();
    const [items, setItems] = useState([]);
    const [search, setSearch] = useState('');
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        setItems(dzikirData);
    }, []);

    const filteredItems = items.filter(item => {
        const title = language === 'id' ? item.title : (item.title_en || item.title);
        const translation = language === 'id' ? item.translation : (item.translation_en || item.translation);
        return title.toLowerCase().includes(search.toLowerCase()) ||
            translation.toLowerCase().includes(search.toLowerCase());
    });

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <div className="view active" style={{ paddingBottom: '80px' }}>
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

                <h1 style={{ margin: 0, fontSize: '24px' }}>{t('menu.dzikir')}</h1>
                <p style={{ opacity: 0.8 }}>{t('dzikir.subtitle')}</p>

                <div className="search-box" style={{ marginTop: '15px' }}>
                    <input
                        type="text"
                        placeholder={t('dzikir.search')}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '15px',
                            border: 'none',
                            background: 'var(--bg-card)',
                            color: 'var(--text-main)',
                            fontSize: '16px'
                        }}
                    />
                </div>
            </div>

            <div className="prayers-list" style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {filteredItems.map((item) => {
                    const title = language === 'id' ? item.title : (item.title_en || item.title);
                    const translation = language === 'id' ? item.translation : (item.translation_en || item.translation);

                    return (
                        <div
                            key={item.id}
                            className="prayer-card"
                            onClick={() => toggleExpand(item.id)}
                            style={{
                                background: 'var(--bg-card)',
                                padding: '20px',
                                borderRadius: '15px',
                                cursor: 'pointer',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                transition: 'all 0.3s ease',
                                color: 'var(--text-main)'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ margin: 0, fontSize: '18px' }}>{title}</h3>
                                <i className={`fa-solid fa-chevron-${expandedId === item.id ? 'up' : 'down'}`} style={{ opacity: 0.5 }}></i>
                            </div>

                            {expandedId === item.id && (
                                <div className="prayer-content" style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px' }}>
                                    <div className="arabic" style={{
                                        fontSize: `${arabicFontSize}px`,
                                        fontWeight: 'bold',
                                        marginBottom: '15px',
                                        textAlign: 'right',
                                        fontFamily: `${arabicFontFamily}, serif`,
                                        lineHeight: '1.6'
                                    }}>
                                        {item.arabic}
                                    </div>
                                    <div className="latin" style={{
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        marginBottom: '10px',
                                        color: '#FFD700',
                                        fontStyle: 'italic'
                                    }}>
                                        {item.latin}
                                    </div>
                                    <div className="translation" style={{
                                        fontSize: '14px',
                                        opacity: 0.9,
                                        lineHeight: '1.5'
                                    }}>
                                        "{translation}"
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
