import { useState } from 'react';
import { supabase } from '../lib/supabase';

// Only show backup feature for admin
const ADMIN_EMAIL = 'kidtoiba7@gmail.com';

export default function BackupRestore({ user }) {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');
    const [showGuide, setShowGuide] = useState(false);

    // Only render for admin user
    if (!user || user.email !== ADMIN_EMAIL) {
        return null;
    }

    // Get all localStorage keys related to the app
    const getLocalStorageData = () => {
        const keys = [
            'quran_bookmarks',
            'verse_bookmarks',
            'lastReading',
            'prayerSettings',
            'tasbihCount',
            'mutabah_data',
            'dzikir_progress',
            'prophet_bookmarks',
            'prophet_progress'
        ];

        const data = {};
        keys.forEach(key => {
            const value = localStorage.getItem(key);
            if (value) {
                try {
                    data[key] = JSON.parse(value);
                } catch {
                    data[key] = value;
                }
            }
        });
        return data;
    };

    // Detect SQL type from value
    const getSqlType = (val) => {
        if (val === null || val === undefined) return 'TEXT';
        if (typeof val === 'boolean') return 'BOOLEAN';
        if (typeof val === 'number') return Number.isInteger(val) ? 'INTEGER' : 'NUMERIC';
        if (typeof val === 'object') return 'JSONB';
        if (val.match?.(/^\d{4}-\d{2}-\d{2}/)) return 'TIMESTAMPTZ';
        return 'TEXT';
    };

    // Convert data to SQL CREATE TABLE + INSERT statements
    const convertToSQL = (tableName, rows) => {
        if (!rows || rows.length === 0) return '';

        const columns = Object.keys(rows[0]);

        // Generate CREATE TABLE statement
        const columnDefs = columns.map(col => {
            const sampleVal = rows.find(r => r[col] !== null)?.[col];
            const sqlType = getSqlType(sampleVal);
            const isPrimary = col === 'id' ? ' PRIMARY KEY' : '';
            return `    ${col} ${sqlType}${isPrimary}`;
        });

        let sql = `-- ================================================
-- Table: ${tableName}
-- ================================================
CREATE TABLE IF NOT EXISTS ${tableName} (
${columnDefs.join(',\n')}
);

`;
        // Generate INSERT statements
        const lines = rows.map(row => {
            const values = columns.map(col => {
                const val = row[col];
                if (val === null || val === undefined) return 'NULL';
                if (typeof val === 'number') return val;
                if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
                if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
                return `'${String(val).replace(/'/g, "''")}'`;
            });
            return `(${values.join(', ')})`;
        });

        sql += `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES\n${lines.join(',\n')}\nON CONFLICT (id) DO NOTHING;\n\n`;

        return sql;
    };

    // Export all data to SQL file
    const handleExport = async () => {
        setLoading(true);
        setStatus('Mengambil data...');

        try {
            let sqlContent = `-- Al-Quran App Database Backup
-- Generated: ${new Date().toISOString()}
-- User: ${user?.email || 'Anonymous'}
-- ================================================

`;
            // Add localStorage data as comments (for reference)
            const localData = getLocalStorageData();
            sqlContent += `-- LOCAL STORAGE DATA (copy to browser console to restore)
-- localStorage data is saved separately in the JSON section below
/*
LOCALSTORAGE_JSON_START
${JSON.stringify(localData, null, 2)}
LOCALSTORAGE_JSON_END
*/

`;

            // Try to get data from Supabase tables (only if they exist)
            // We check common table names - errors are expected and silently ignored
            const tables = ['profiles', 'bookmarks'];

            for (const table of tables) {
                try {
                    const { data, error } = await supabase
                        .from(table)
                        .select('*')
                        .limit(1000);

                    // Only add if no error and data exists
                    if (!error && data && data.length > 0) {
                        sqlContent += convertToSQL(table, data);
                    }
                } catch {
                    // Table doesn't exist or other error, skip silently
                }
            }

            // If no Supabase tables found, add note
            if (!sqlContent.includes('INSERT INTO')) {
                sqlContent += `-- No Supabase tables with data found
-- Your app data is stored in localStorage (see JSON above)
`;
            }

            // Download as SQL file
            const blob = new Blob([sqlContent], { type: 'text/sql' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `alquran-backup-${new Date().toISOString().split('T')[0]}.sql`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            setStatus('✅ Backup SQL berhasil didownload!');
        } catch (error) {
            setStatus('❌ Error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Import localStorage from SQL file
    const handleImport = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setStatus('Membaca file...');

        try {
            const text = await file.text();

            // Extract localStorage JSON from SQL file
            const match = text.match(/LOCALSTORAGE_JSON_START\n([\s\S]*?)\nLOCALSTORAGE_JSON_END/);
            if (match) {
                const localData = JSON.parse(match[1]);
                Object.entries(localData).forEach(([key, value]) => {
                    localStorage.setItem(key, JSON.stringify(value));
                });
                setStatus('✅ Data lokal berhasil di-restore! Refresh halaman untuk melihat perubahan.');
            } else {
                setStatus('⚠️ File SQL tidak mengandung data localStorage. Untuk import tabel, gunakan SQL Editor di Supabase.');
            }
        } catch (error) {
            setStatus('❌ Error: ' + error.message);
        } finally {
            setLoading(false);
            event.target.value = '';
        }
    };

    return (
        <div style={{
            marginTop: '30px',
            background: 'var(--bg-card)',
            padding: '20px',
            borderRadius: '15px',
            border: '1px solid var(--border)'
        }}>
            <h3 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <i className="fa-solid fa-database" style={{ color: 'var(--primary)' }}></i>
                Backup & Restore
            </h3>

            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                Backup data untuk migrasi ke Supabase project baru
            </p>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '15px' }}>
                {/* Export Button */}
                <button
                    onClick={handleExport}
                    disabled={loading}
                    style={{
                        flex: '1',
                        minWidth: '140px',
                        padding: '12px 20px',
                        borderRadius: '10px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        color: 'white',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        fontSize: '14px',
                        fontWeight: '500',
                        opacity: loading ? 0.7 : 1
                    }}
                >
                    <i className={loading ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-download'}></i>
                    Export SQL
                </button>
            </div>

            {/* Guide Button */}
            <button
                onClick={() => setShowGuide(!showGuide)}
                style={{
                    width: '100%',
                    padding: '12px 20px',
                    borderRadius: '10px',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-body)',
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontSize: '13px'
                }}
            >
                <i className={`fa-solid fa-${showGuide ? 'chevron-up' : 'book'}`}></i>
                {showGuide ? 'Tutup Panduan' : 'Panduan Migrasi'}
            </button>

            {/* Status Message */}
            {status && (
                <div style={{
                    marginTop: '15px',
                    padding: '10px 15px',
                    borderRadius: '8px',
                    background: status.includes('✅') ? 'rgba(16,185,129,0.1)' :
                        status.includes('❌') ? 'rgba(239,68,68,0.1)' :
                            'rgba(59,130,246,0.1)',
                    color: status.includes('✅') ? '#10b981' :
                        status.includes('❌') ? '#ef4444' :
                            '#3b82f6',
                    fontSize: '13px'
                }}>
                    {status}
                </div>
            )}

            {/* Guide Section */}
            {showGuide && (
                <div style={{
                    marginTop: '20px',
                    padding: '20px',
                    background: 'var(--bg-body)',
                    borderRadius: '12px',
                    fontSize: '13px',
                    lineHeight: '1.8'
                }}>
                    <h4 style={{ marginBottom: '15px', color: 'var(--primary)' }}>
                        <i className="fa-solid fa-circle-info" style={{ marginRight: '8px' }}></i>
                        Cara Migrasi ke Supabase Baru
                    </h4>

                    <div style={{ marginBottom: '20px' }}>
                        <strong>Langkah 1: Export Backup</strong>
                        <p style={{ color: 'var(--text-muted)', marginTop: '5px' }}>
                            Klik tombol "Export SQL" di atas. File .sql akan terdownload.
                        </p>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <strong>Langkah 2: Buat Project Supabase Baru</strong>
                        <p style={{ color: 'var(--text-muted)', marginTop: '5px' }}>
                            Buka <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>supabase.com/dashboard</a> → New Project
                        </p>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <strong>Langkah 3: Buat Tabel (Jika Ada)</strong>
                        <p style={{ color: 'var(--text-muted)', marginTop: '5px' }}>
                            Buka SQL Editor di Supabase baru → Jalankan CREATE TABLE sesuai struktur lama
                        </p>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <strong>Langkah 4: Import Data SQL</strong>
                        <p style={{ color: 'var(--text-muted)', marginTop: '5px' }}>
                            Buka SQL Editor → Copy-paste isi file .sql → Klik "Run"
                        </p>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <strong>Langkah 5: Update Konfigurasi App</strong>
                        <p style={{ color: 'var(--text-muted)', marginTop: '5px' }}>
                            Ubah SUPABASE_URL dan SUPABASE_KEY di file <code style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px' }}>src/lib/supabase.js</code>
                        </p>
                    </div>

                    <div style={{ marginBottom: '10px' }}>
                        <strong>Langkah 6: Restore localStorage</strong>
                        <p style={{ color: 'var(--text-muted)', marginTop: '5px' }}>
                            Klik "Import SQL" dan pilih file backup untuk restore data browser (bookmarks, dll)
                        </p>
                    </div>

                    <div style={{
                        marginTop: '20px',
                        padding: '12px',
                        background: 'rgba(251,191,36,0.1)',
                        borderRadius: '8px',
                        border: '1px solid rgba(251,191,36,0.3)'
                    }}>
                        <p style={{ color: '#f59e0b', margin: 0, fontSize: '12px' }}>
                            <i className="fa-solid fa-lightbulb" style={{ marginRight: '8px' }}></i>
                            <strong>Tips:</strong> Sebelum import SQL, pastikan tabel sudah dibuat dengan struktur yang sama di Supabase baru!
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
