// Archive Modal — Project Library as overlay modal
import React, { useEffect } from 'react';
import ArchivePage from '../../pages/shared/ArchivePage';
import styles from './ArchiveModal.module.css';

interface ArchiveModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ArchiveModal: React.FC<ArchiveModalProps> = ({ isOpen, onClose }) => {
    // Close on Escape key
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [isOpen, onClose]);

    // Prevent body scroll when open
    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className={styles.backdrop} onClick={onClose}>
            <div
                className={styles.modal}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className={styles.modalHeader}>
                    <div className={styles.modalTitle}>
                        <span className={styles.modalIcon}>📚</span>
                        <div>
                            <h2>Thư viện đồ án</h2>
                            <p>Kho lưu trữ các đồ án đã hoàn thành</p>
                        </div>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose} title="Đóng (Esc)">
                        ✕
                    </button>
                </div>

                {/* Modal Body — reuse ArchivePage content */}
                <div className={styles.modalBody}>
                    <ArchivePage />
                </div>
            </div>
        </div>
    );
};

export default ArchiveModal;
