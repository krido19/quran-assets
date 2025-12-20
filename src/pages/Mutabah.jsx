import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function Mutabah() {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
    const [data, setData] = useState({});

    const categories = [
        {
            id: 'fardhu',
            label: t('mutabah.category.fardhu'),
            items: ['subuh', 'dhuhur', 'ashar', 'maghrib', 'isya']
        },
        {
            id: 'sunnah',
            label: t('mutabah.category.sunnah'),
            items: ['tahajjud', 'duha', 'rawatib']
        },
        {
            id: 'quran',
            label: t('mutabah.category.quran'),
            items: ['tilawah', 'hafalan']
        },
        {
            id: 'others',
            label: t('mutabah.category.others'),
            items: ['dzikirPagi', 'dzikirPetang', 'sedekah']
        }
    ];

    useEffect(() => {
        const savedData = localStorage.getItem(`mutabah_${currentDate}`);
        if (savedData) {
            setData(JSON.parse(savedData));
        } else {
            setData({});
        }
    }, [currentDate]);

    const toggleItem = (itemId) => {
        const newData = { ...data, [itemId]: !data[itemId] };
        setData(newData);
        localStorage.setItem(`mutabah_${currentDate}`, JSON.stringify(newData));
    };

    const changeDate = (days) => {
        const d = new Date(currentDate);
        d.setDate(d.getDate() + days);
        setCurrentDate(d.toISOString().split('T')[0]);
    };

    const calculateProgress = () => {
        const totalItems = categories.reduce((acc, cat) => acc + cat.items.length, 0);
        const completedItems = Object.values(data).filter(v => v).length;
        return Math.round((completedItems / totalItems) * 100);
    };

    const progress = calculateProgress();

    return (
        <div className="view active" style={{ paddingBottom: '90px' }}>
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

                <h1>{t('mutabah.title')}</h1>
                <p style={{ opacity: 0.8 }}>{t('mutabah.subtitle')}</p>

                {/* Date Navigator */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '20px',
                    marginTop: '20px'
                }}>
                    <button className="icon-btn" onClick={() => changeDate(-1)} style={{ background: 'var(--bg-card)', width: '35px', height: '35px' }}>
                        <i className="fa-solid fa-chevron-left"></i>
                    </button>
                    <div style={{ fontWeight: 'bold', fontSize: '16px', minWidth: '120px' }}>
                        {new Date(currentDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    <button className="icon-btn" onClick={() => changeDate(1)} style={{ background: 'var(--bg-card)', width: '35px', height: '35px' }}>
                        <i className="fa-solid fa-chevron-right"></i>
                    </button>
                </div>
            </div>

            <div style={{ padding: '0 20px' }}>
                {/* Progress Card */}
                <div className="glass-panel" style={{
                    marginBottom: '20px',
                    padding: '20px',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '14px', opacity: 0.8, marginBottom: '10px' }}>{t('mutabah.progress')}</div>
                    <div style={{
                        height: '12px',
                        background: 'var(--bg-body)',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        marginBottom: '10px'
                    }}>
                        <div style={{
                            width: `${progress}%`,
                            height: '100%',
                            background: 'linear-gradient(90deg, var(--primary), #4ade80)',
                            transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}></div>
                    </div>
                    <div style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{progress}%</div>
                </div>

                {/* categories */}
                {categories.map(cat => (
                    <div key={cat.id} style={{ marginBottom: '25px' }}>
                        <h3 style={{ margin: '0 0 15px 5px', fontSize: '16px', opacity: 0.9 }}>{cat.label}</h3>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr',
                            gap: '12px'
                        }}>
                            {cat.items.map(item => (
                                <div
                                    key={item}
                                    onClick={() => toggleItem(item)}
                                    className="glass-panel"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '15px 20px',
                                        cursor: 'pointer',
                                        borderLeft: data[item] ? '4px solid var(--primary)' : '4px solid transparent',
                                        transition: 'all 0.2s ease',
                                        background: data[item] ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-card)'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div style={{
                                            width: '24px',
                                            height: '24px',
                                            borderRadius: '6px',
                                            border: '2px solid',
                                            borderColor: data[item] ? 'var(--primary)' : 'var(--text-muted)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: data[item] ? 'var(--primary)' : 'transparent',
                                            color: '#fff',
                                            fontSize: '12px',
                                            transition: 'all 0.2s'
                                        }}>
                                            {data[item] && <i className="fa-solid fa-check"></i>}
                                        </div>
                                        <span style={{
                                            fontWeight: '500',
                                            opacity: data[item] ? 1 : 0.8
                                        }}>
                                            {t(`ibadah.${item}`)}
                                        </span>
                                    </div>
                                    <i className="fa-solid fa-chevron-right" style={{ opacity: 0.3, fontSize: '12px' }}></i>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
