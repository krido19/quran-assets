import { useState, useEffect } from 'react';
import packageJson from '../../package.json';
import { supabaseUpdate } from '../lib/supabaseUpdate';

export default function SplashScreen({ onFinish }) {
    const [status, setStatus] = useState('loading'); // loading, update-available, error, done
    const [remoteVersion, setRemoteVersion] = useState(null);
    const [downloadUrl, setDownloadUrl] = useState('');
    const [forceUpdate, setForceUpdate] = useState(false);
    const [releaseNotes, setReleaseNotes] = useState('');

    useEffect(() => {
        const checkUpdate = async () => {
            try {
                // Minimum splash duration of 2 seconds for branding
                const minSplashTime = new Promise(resolve => setTimeout(resolve, 2000));

                // Fetch remote version from Supabase (Web Admin Database)
                const versionCheck = supabaseUpdate
                    .from('app_versions')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .maybeSingle()
                    .then(({ data, error }) => {
                        if (error) throw error;
                        return data;
                    })
                    .catch(err => {
                        console.warn('Update check failed:', err);
                        return null;
                    });

                const [_, remoteData] = await Promise.all([minSplashTime, versionCheck]);

                if (remoteData && isUpdateAvailable(packageJson.version, remoteData.version)) {
                    setRemoteVersion(remoteData.version);
                    setDownloadUrl(remoteData.download_url);
                    setForceUpdate(remoteData.force_update || false);
                    setReleaseNotes(remoteData.release_notes || '');
                    setStatus('update-available');
                } else {
                    handleFinish();
                }
            } catch (error) {
                console.error('Splash screen error:', error);
                handleFinish();
            }
        };

        checkUpdate();
    }, []);

    const isUpdateAvailable = (current, remote) => {
        if (!remote) return false;
        const currentParts = current.split('.').map(Number);
        const remoteParts = remote.split('.').map(Number);

        for (let i = 0; i < 3; i++) {
            if (remoteParts[i] > currentParts[i]) return true;
            if (remoteParts[i] < currentParts[i]) return false;
        }
        return false;
    };

    const handleFinish = () => {
        setStatus('done');
        setTimeout(() => {
            onFinish();
        }, 500); // Fade out animation time
    };

    const handleUpdate = () => {
        window.open(downloadUrl || 'https://krido-bahtiar.vercel.app/apps', '_system');
    };

    const handleSkip = () => {
        if (!forceUpdate) {
            handleFinish();
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
            opacity: status === 'done' ? 0 : 1,
            transition: 'opacity 0.5s ease',
            pointerEvents: status === 'done' ? 'none' : 'auto'
        }}>
            <div style={{ textAlign: 'center', padding: '20px' }}>
                {/* Logo or App Name */}
                <div style={{
                    fontSize: '48px',
                    color: '#FFD700',
                    marginBottom: '20px',
                    fontFamily: "'Amiri', serif"
                }}>
                    <i className="fa-solid fa-quran"></i>
                </div>
                <h1 style={{
                    color: '#fff',
                    fontSize: '24px',
                    marginBottom: '10px',
                    fontWeight: 'bold'
                }}>
                    Quran App
                </h1>

                {status === 'loading' && (
                    <div style={{ marginTop: '30px' }}>
                        <div className="loading-spinner" style={{
                            width: '40px',
                            height: '40px',
                            border: '3px solid rgba(255,255,255,0.1)',
                            borderTop: '3px solid #FFD700',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                            margin: '0 auto'
                        }}></div>
                        <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '15px', fontSize: '14px' }}>
                            Memuat aplikasi...
                        </p>
                    </div>
                )}

                {status === 'update-available' && (
                    <div style={{
                        background: 'rgba(255,255,255,0.1)',
                        padding: '25px',
                        borderRadius: '20px',
                        backdropFilter: 'blur(10px)',
                        maxWidth: '300px',
                        animation: 'fadeIn 0.3s ease'
                    }}>
                        <i className="fa-solid fa-rocket" style={{ fontSize: '32px', color: '#FFD700', marginBottom: '15px' }}></i>
                        <h2 style={{ color: '#fff', fontSize: '18px', marginBottom: '10px' }}>Update Tersedia!</h2>
                        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', marginBottom: '20px', lineHeight: '1.5' }}>
                            {releaseNotes || "Versi baru tersedia. Silakan update untuk mendapatkan fitur terbaru."}
                        </p>

                        <button
                            onClick={handleUpdate}
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: '#FFD700',
                                color: '#000',
                                border: 'none',
                                borderRadius: '12px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                marginBottom: '10px'
                            }}
                        >
                            Update Sekarang
                        </button>

                        {!forceUpdate && (
                            <button
                                onClick={handleSkip}
                                style={{
                                    background: 'transparent',
                                    color: 'rgba(255,255,255,0.6)',
                                    border: 'none',
                                    padding: '10px',
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }}
                            >
                                Nanti Saja
                            </button>
                        )}
                    </div>
                )}
            </div>

            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
