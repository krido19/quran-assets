import { useState, useEffect } from 'react';
import asmaulHusnaData from '../data/asmaul-husna.json';

export default function AsmaulHusna() {
    const [names, setNames] = useState([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        setNames(asmaulHusnaData);
    }, []);

    const filteredNames = names.filter(item =>
        item.latin.toLowerCase().includes(search.toLowerCase()) ||
        item.meaning.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="view active" style={{ paddingBottom: '80px' }}>
            <div className="header-section" style={{ padding: '20px', textAlign: 'center' }}>
                <h1>Asmaul Husna</h1>
                <p style={{ opacity: 0.8 }}>99 Nama Allah yang Indah</p>

                <div className="search-box" style={{ marginTop: '15px' }}>
                    <input
                        type="text"
                        placeholder="Cari nama..."
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

                <div className="audio-player" style={{ marginTop: '20px', background: 'var(--bg-card)', padding: '15px', borderRadius: '15px' }}>
                    <p style={{ marginBottom: '10px', fontSize: '14px', opacity: 0.8 }}>Putar Audio (Mishary Rashid)</p>
                    <audio
                        controls
                        style={{ width: '100%' }}
                        onError={(e) => {
                            console.error("Audio Error:", e);
                            alert("Gagal memuat audio. Cek koneksi internet Anda.");
                        }}
                    >
                        <source src="https://ia801608.us.archive.org/25/items/AsmaulHusna_201608/Asmaul%20Husna.mp3" type="audio/mpeg" />
                        Browser Anda tidak mendukung audio player.
                    </audio>
                </div>
            </div>

            <div className="names-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                gap: '15px',
                padding: '0 20px'
            }}>
                {filteredNames.map((item) => (
                    <div key={item.id} className="name-card" style={{
                        background: 'var(--bg-card)',
                        padding: '15px',
                        borderRadius: '15px',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}>
                        <div className="number" style={{
                            fontSize: '12px',
                            opacity: 0.6,
                            marginBottom: '5px',
                            background: 'rgba(255,255,255,0.1)',
                            padding: '2px 8px',
                            borderRadius: '10px'
                        }}>
                            {item.id}
                        </div>
                        <div className="arabic" style={{
                            fontSize: '24px',
                            fontWeight: 'bold',
                            marginBottom: '5px',
                            fontFamily: "'Amiri', serif"
                        }}>
                            {item.arabic}
                        </div>
                        <div className="latin" style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            marginBottom: '2px'
                        }}>
                            {item.latin}
                        </div>
                        <div className="meaning" style={{
                            fontSize: '12px',
                            opacity: 0.8
                        }}>
                            {item.meaning}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
