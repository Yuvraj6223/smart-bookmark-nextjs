'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: number;
    message: string;
    type: ToastType;
    exiting?: boolean;
}

interface ToastContextValue {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let toastId = 0;

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within ToastProvider');
    return ctx;
}

const icons: Record<ToastType, ReactNode> = {
    success: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
    ),
    error: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
    ),
    info: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
    ),
};

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: number) => {
        setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 300);
    }, []);

    const showToast = useCallback(
        (message: string, type: ToastType = 'info') => {
            const id = ++toastId;
            setToasts((prev) => [...prev, { id, message, type }]);
            setTimeout(() => removeToast(id), 4000);
        },
        [removeToast]
    );

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="toast-container" role="status" aria-live="polite">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`toast toast-${toast.type} ${toast.exiting ? 'toast-exiting' : ''}`}
                    >
                        <span style={{ flexShrink: 0, marginTop: 1 }}>{icons[toast.type]}</span>
                        <span>{toast.message}</span>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}
