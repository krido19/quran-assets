import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import prophetsData from '../data/prophet-stories.json';

export default function ProphetFamilyTree() {
    const navigate = useNavigate();
    const { language } = useLanguage();
    const [selectedLineage, setSelectedLineage] = useState('ibrahim');

    // Key family lineages
    const lineages = [
        { id: 'ibrahim', label_id: 'Keluarga Ibrahim', label_en: 'Abraham\'s Family', color: '#10b981' },
        { id: 'baniIsrail', label_id: 'Bani Israil', label_en: 'Children of Israel', color: '#3b82f6' },
        { id: 'independent', label_id: 'Nabi Mandiri', label_en: 'Independent Prophets', color: '#f59e0b' }
    ];

    // Ibrahim's family tree
    const ibrahimFamily = [
        { id: 6, level: 0 }, // Ibrahim
        { id: 7, level: 1, parent: 6 }, // Luth (nephew)
        { id: 8, level: 1, parent: 6 }, // Ismail
        { id: 9, level: 1, parent: 6 }, // Ishaq
        { id: 10, level: 2, parent: 9 }, // Ya'qub
        { id: 11, level: 3, parent: 10 }, // Yusuf
    ];

    // Bani Israil prophets (after Ya'qub)
    const baniIsrailProphets = prophetsData.filter(p =>
        p.category.includes('baniIsrail') && p.id > 11
    );

    // Independent prophets (not in family lines shown)
    const independentProphets = prophetsData.filter(p =>
        !p.category.includes('baniIsrail') &&
        !p.category.includes('family_ibrahim') &&
        p.id !== 6 // not Ibrahim
    );

    const getProphetById = (id) => prophetsData.find(p => p.id === id);

    const renderProphetNode = (prophet, level = 0, isChild = false) => {
        const name = language === 'id' ? prophet.name_id : prophet.name_en;

        return (
            <div key={prophet.id} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                marginLeft: isChild ? '20px' : '0'
            }}>
                {isChild && (
                    <div style={{
                        width: '2px', height: '20px',
                        background: 'rgba(255,255,255,0.2)'
                    }}></div>
                )}
                <div
                    onClick={() => navigate('/prophet-stories')}
                    style={{
                        background: prophet.category.includes('ululAzmi')
                            ? 'linear-gradient(135deg, #ef4444, #f87171)'
                            : 'linear-gradient(135deg, #10b981, #34d399)',
                        padding: '12px 20px', borderRadius: '12px',
                        cursor: 'pointer', textAlign: 'center',
                        minWidth: '100px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                    }}
                >
                    <p style={{ margin: 0, fontSize: '18px', fontFamily: 'Amiri, serif', color: 'white' }}>
                        {prophet.name}
                    </p>
                    <p style={{ margin: '4px 0 0', fontSize: '14px', color: 'rgba(255,255,255,0.9)' }}>
                        {name}
                    </p>
                </div>
            </div>
        );
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
                    <i className="fa-solid fa-sitemap" style={{ marginRight: '10px', color: 'var(--primary)' }}></i>
                    {language === 'id' ? 'Silsilah Para Nabi' : 'Prophets Family Tree'}
                </h1>
                <p style={{ opacity: 0.8 }}>
                    {language === 'id' ? 'Hubungan keluarga antar nabi' : 'Family relationships between prophets'}
                </p>
            </div>

            {/* Lineage Tabs */}
            <div style={{
                display: 'flex', gap: '10px', padding: '0 20px',
                overflowX: 'auto', marginBottom: '20px'
            }}>
                {lineages.map(lineage => (
                    <button
                        key={lineage.id}
                        onClick={() => setSelectedLineage(lineage.id)}
                        style={{
                            background: selectedLineage === lineage.id
                                ? lineage.color
                                : 'var(--bg-card)',
                            color: selectedLineage === lineage.id ? 'white' : 'var(--text-main)',
                            border: 'none', borderRadius: '20px', padding: '10px 20px',
                            cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '14px'
                        }}
                    >
                        {language === 'id' ? lineage.label_id : lineage.label_en}
                    </button>
                ))}
            </div>

            {/* Family Tree Content */}
            <div style={{ padding: '0 20px' }}>
                {selectedLineage === 'ibrahim' && (
                    <div style={{
                        background: 'var(--bg-card)', borderRadius: '20px',
                        padding: '30px', overflowX: 'auto'
                    }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                            {/* Ibrahim */}
                            {renderProphetNode(getProphetById(6))}

                            {/* Line down */}
                            <div style={{ width: '2px', height: '30px', background: 'rgba(255,255,255,0.3)' }}></div>

                            {/* Children row */}
                            <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start' }}>
                                {/* Luth branch */}
                                <div style={{ textAlign: 'center' }}>
                                    <p style={{ fontSize: '12px', opacity: 0.6, marginBottom: '10px' }}>
                                        {language === 'id' ? 'Keponakan' : 'Nephew'}
                                    </p>
                                    {renderProphetNode(getProphetById(7))}
                                </div>

                                {/* Ismail branch */}
                                <div style={{ textAlign: 'center' }}>
                                    <p style={{ fontSize: '12px', opacity: 0.6, marginBottom: '10px' }}>
                                        {language === 'id' ? 'Putra dari Hajar' : 'Son from Hagar'}
                                    </p>
                                    {renderProphetNode(getProphetById(8))}
                                    <p style={{ fontSize: '11px', opacity: 0.5, marginTop: '10px' }}>
                                        ↓ {language === 'id' ? 'Keturunan' : 'Descendants'} ↓
                                    </p>
                                    <p style={{
                                        fontSize: '13px', color: '#10b981', marginTop: '5px',
                                        background: 'rgba(16,185,129,0.1)', padding: '8px',
                                        borderRadius: '8px'
                                    }}>
                                        {language === 'id' ? 'Nabi Muhammad ﷺ' : 'Prophet Muhammad ﷺ'}
                                    </p>
                                </div>

                                {/* Ishaq branch */}
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <p style={{ fontSize: '12px', opacity: 0.6, marginBottom: '10px' }}>
                                        {language === 'id' ? 'Putra dari Sarah' : 'Son from Sarah'}
                                    </p>
                                    {renderProphetNode(getProphetById(9))}
                                    <div style={{ width: '2px', height: '20px', background: 'rgba(255,255,255,0.3)' }}></div>
                                    {renderProphetNode(getProphetById(10))}
                                    <div style={{ width: '2px', height: '20px', background: 'rgba(255,255,255,0.3)' }}></div>
                                    {renderProphetNode(getProphetById(11))}
                                    <p style={{ fontSize: '11px', opacity: 0.5, marginTop: '10px' }}>
                                        ↓ {language === 'id' ? 'Bani Israil' : 'Children of Israel'} ↓
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {selectedLineage === 'baniIsrail' && (
                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                        gap: '15px'
                    }}>
                        {baniIsrailProphets.map(prophet => {
                            const name = language === 'id' ? prophet.name_id : prophet.name_en;
                            return (
                                <div
                                    key={prophet.id}
                                    onClick={() => navigate('/prophet-stories')}
                                    style={{
                                        background: 'var(--bg-card)', padding: '15px',
                                        borderRadius: '12px', cursor: 'pointer',
                                        textAlign: 'center',
                                        border: prophet.category.includes('ululAzmi')
                                            ? '2px solid #ef4444' : 'none'
                                    }}
                                >
                                    <p style={{ margin: 0, fontSize: '22px', fontFamily: 'Amiri, serif', color: 'var(--primary)' }}>
                                        {prophet.name}
                                    </p>
                                    <p style={{ margin: '5px 0 0', fontSize: '14px' }}>{name}</p>
                                    <p style={{ margin: '5px 0 0', fontSize: '11px', opacity: 0.6 }}>
                                        {prophet.location}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                )}

                {selectedLineage === 'independent' && (
                    <div style={{
                        display: 'flex', flexDirection: 'column', gap: '15px'
                    }}>
                        <p style={{ opacity: 0.7, fontSize: '14px', textAlign: 'center' }}>
                            {language === 'id'
                                ? 'Nabi-nabi yang diutus secara terpisah ke berbagai kaum'
                                : 'Prophets sent independently to various peoples'}
                        </p>
                        {independentProphets.map(prophet => {
                            const name = language === 'id' ? prophet.name_id : prophet.name_en;
                            return (
                                <div
                                    key={prophet.id}
                                    onClick={() => navigate('/prophet-stories')}
                                    style={{
                                        background: 'var(--bg-card)', padding: '15px',
                                        borderRadius: '12px', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: '15px'
                                    }}
                                >
                                    <div style={{
                                        width: '50px', height: '50px', borderRadius: '12px',
                                        background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '18px', fontFamily: 'Amiri, serif', color: 'white'
                                    }}>
                                        {prophet.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>{name}</p>
                                        <p style={{ margin: '2px 0 0', fontSize: '18px', fontFamily: 'Amiri, serif', color: 'var(--primary)' }}>
                                            {prophet.name}
                                        </p>
                                        <p style={{ margin: '4px 0 0', fontSize: '12px', opacity: 0.6 }}>
                                            {prophet.location}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
