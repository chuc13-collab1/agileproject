import { useRegisterSW } from 'virtual:pwa-register/react';

const RELOAD_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

export default function PwaUpdatePrompt() {
    const {
        needRefresh: [needRefresh, setNeedRefresh],
        offlineReady: [offlineReady, setOfflineReady],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(registration: ServiceWorkerRegistration | undefined) {
            if (registration) {
                setInterval(() => registration.update(), RELOAD_INTERVAL_MS);
            }
        },
    });

    const close = () => {
        setOfflineReady(false);
        setNeedRefresh(false);
    };

    if (!needRefresh && !offlineReady) return null;

    return (
        <div style={styles.overlay}>
            <div style={styles.toast}>
                <div style={styles.icon}>{needRefresh ? '🔄' : '✅'}</div>
                <div style={styles.content}>
                    <p style={styles.title}>
                        {needRefresh ? 'Có bản cập nhật mới!' : 'Sẵn sàng dùng offline'}
                    </p>
                    <p style={styles.desc}>
                        {needRefresh
                            ? 'Ứng dụng có phiên bản mới. Reload để cập nhật?'
                            : 'Ứng dụng đã được cache, có thể dùng khi mất mạng.'}
                    </p>
                </div>
                <div style={styles.actions}>
                    {needRefresh && (
                        <button style={styles.btnPrimary} onClick={() => updateServiceWorker(true)}>
                            Reload
                        </button>
                    )}
                    <button style={styles.btnSecondary} onClick={close}>
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    overlay: {
        position: 'fixed',
        bottom: '1.5rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        width: '100%',
        maxWidth: '480px',
        padding: '0 1rem',
    },
    toast: {
        background: '#1e293b',
        color: 'white',
        borderRadius: '16px',
        padding: '1rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.875rem',
        boxShadow: '0 20px 40px rgba(0,0,0,0.35)',
        border: '1px solid rgba(255,255,255,0.08)',
        animation: 'slideUp 0.3s ease',
    },
    icon: { fontSize: '1.75rem', flexShrink: 0 },
    content: { flex: 1, minWidth: 0 },
    title: { fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.2rem' },
    desc: { fontSize: '0.8rem', opacity: 0.75, lineHeight: 1.4 },
    actions: { display: 'flex', flexDirection: 'column', gap: '0.4rem', flexShrink: 0 },
    btnPrimary: {
        background: '#4f46e5',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        padding: '0.45rem 1rem',
        fontSize: '0.8rem',
        fontWeight: 600,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
    },
    btnSecondary: {
        background: 'rgba(255,255,255,0.1)',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        padding: '0.45rem 1rem',
        fontSize: '0.8rem',
        fontWeight: 500,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
    },
};
