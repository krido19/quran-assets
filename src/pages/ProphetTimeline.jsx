import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import prophetsData from '../data/prophet-stories.json';

export default function ProphetTimeline() {
    const navigate = useNavigate();
    const { language } = useLanguage();
    const [selectedProphet, setSelectedProphet] = useState(null);

    // Sort by era
    const sortedProphets = [...prophetsData].sort((a, b) => a.era - b.era);

    // Era ranges for display
    const getEraLabel = (era) => {
        if (era < 0) return `${Math.abs(era)} ${language === 'id' ? 'SM' : 'BC'}`;
        return `${era} ${language === 'id' ? 'M' : 'AD'}`;
    };

    return (
        <div className="view active" style={{ paddingBottom: '80px' }}>
            {/* Header */}
            <div style={{ padding: '20px', textAlign: 'center', position: 'relative' }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        position: 'absolute', left: '20px', top: '20px',
                        background: 'var(--bg-card)', border: 'none', borderRadius: '12px',
                        width: '40px', height: '40px', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        color: 'var(--primary)', cursor: 'pointer'
                    }}
                >
                    <i className="fa-solid fa-arrow-left"></i>
                </button>

                <h1>
                    <i className="fa-solid fa-timeline" style={{ marginRight: '10px', color: 'var(--primary)' }}></i>
                    {language === 'id' ? 'Timeline Para Nabi' : 'Prophets Timeline'}
                </h1>
                <p style={{ opacity: 0.8 }}>
                    {language === 'id' ? 'Urutan kronologis 25 Nabi' : 'Chronological order of 25 Prophets'}
                </p>
            </div>

            {/* Timeline */}
            <div style={{ padding: '0 20px', position: 'relative' }}>
                {/* Timeline line */}
                <div style={{
                    position: 'absolute', left: '40px', top: '0', bottom: '0',
                    width: '4px', background: 'linear-gradient(180deg, #10b981, #6366f1, #ef4444)',
                    borderRadius: '2px'
                }}></div>

                {sortedProphets.map((prophet, index) => {
                    const name = language === 'id' ? prophet.name_id : prophet.name_en;
                    const miracle = language === 'id' ? prophet.miracle_id : prophet.miracle_en;
                    const isSelected = selectedProphet === prophet.id;

                    return (
                        <div
                            key={prophet.id}
                            onClick={() => setSelectedProphet(isSelected ? null : prophet.id)}
                            style={{
                                display: 'flex', alignItems: 'flex-start', gap: '20px',
                                marginBottom: '20px', cursor: 'pointer',
                                position: 'relative', paddingLeft: '60px'
                            }}
                        >
                            {/* Timeline dot */}
                            <div style={{
                                position: 'absolute', left: '30px',
                                width: '24px', height: '24px', borderRadius: '50%',
                                background: prophet.category.includes('ululAzmi')
                                    ? 'linear-gradient(135deg, #ef4444, #f87171)'
                                    : 'linear-gradient(135deg, #10b981, #34d399)',
                                border: '3px solid var(--bg-body)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                zIndex: 1
                            }}>
                                <span style={{ fontSize: '10px', color: 'white', fontWeight: 'bold' }}>
                                    {prophet.id}
                                </span>
                            </div>

                            {/* Content card */}
                            <div style={{
                                flex: 1, background: 'var(--bg-card)',
                                padding: '15px', borderRadius: '12px',
                                boxShadow: isSelected ? '0 4px 20px rgba(16,185,129,0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
                                border: isSelected ? '2px solid var(--primary)' : 'none',
                                transition: 'all 0.3s ease'
                            }}>
                                {/* Era badge */}
                                <div style={{
                                    display: 'inline-block', background: 'rgba(99, 102, 241, 0.2)',
                                    color: '#6366f1', padding: '4px 10px', borderRadius: '15px',
                                    fontSize: '11px', marginBottom: '8px'
                                }}>
                                    {getEraLabel(prophet.era)}
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '16px' }}>{name}</h3>
                                        <p style={{
                                            margin: '2px 0 0', fontSize: '18px',
                                            fontFamily: 'Amiri, serif', color: 'var(--primary)'
                                        }}>
                                            {prophet.name}
                                        </p>
                                    </div>
                                    {prophet.category.includes('ululAzmi') && (
                                        <span style={{
                                            background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444',
                                            padding: '4px 8px', borderRadius: '10px', fontSize: '10px'
                                        }}>
                                            <i className="fa-solid fa-crown"></i>
                                        </span>
                                    )}
                                </div>

                                <p style={{ margin: '8px 0 0', fontSize: '12px', opacity: 0.7 }}>
                                    <i className="fa-solid fa-location-dot" style={{ marginRight: '5px' }}></i>
                                    {prophet.location}
                                </p>

                                {isSelected && (
                                    <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                        <p style={{
                                            margin: 0, fontSize: '13px',
                                            background: 'rgba(16, 185, 129, 0.1)',
                                            padding: '10px', borderRadius: '8px'
                                        }}>
                                            <i className="fa-solid fa-wand-magic-sparkles" style={{ color: '#10b981', marginRight: '8px' }}></i>
                                            {miracle}
                                        </p>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); navigate('/prophet-stories'); }}
                                            style={{
                                                marginTop: '10px', background: 'var(--primary)',
                                                color: 'white', border: 'none', borderRadius: '8px',
                                                padding: '8px 16px', cursor: 'pointer', fontSize: '13px'
                                            }}
                                        >
                                            {language === 'id' ? 'Baca Selengkapnya' : 'Read More'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
