import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import doaData from '../data/doa-khatam.json';
import { useLanguage } from '../context/LanguageContext';

export default function DoaKhatam() {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [items, setItems] = useState([]);
    const [search, setSearch] = useState('');
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        setItems(doaData);
    }, []);

    const filteredItems = items.filter(item =>
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.translation.toLowerCase().includes(search.toLowerCase())
    );

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

                <h1 style={{ margin: 0, fontSize: '24px' }}>{t('menu.doaKhatam')}</h1>
                <p style={{ opacity: 0.8 }}>Doa Khatam Al-Qur'an</p>

                <div className="search-box" style={{ marginTop: '15px' }}>
                    <input
                        type="text"
                        placeholder="Cari doa..."
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
                {filteredItems.map((item) => (
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
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, fontSize: '18px' }}>{item.title}</h3>
                            <i className={`fa-solid fa-chevron-${expandedId === item.id ? 'up' : 'down'}`} style={{ opacity: 0.5 }}></i>
                        </div>

                        {expandedId === item.id && (
                            <div className="prayer-content" style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px' }}>
                                <div className="arabic" style={{
                                    fontSize: '24px',
                                    fontWeight: 'bold',
                                    marginBottom: '15px',
                                    textAlign: 'right',
                                    fontFamily: "'Amiri', serif",
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
                                    "{item.translation}"
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
