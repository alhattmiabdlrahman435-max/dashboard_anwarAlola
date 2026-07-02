import { useApp } from '../context/AppContext';

export default function Toast() {
  const { toastMessage } = useApp();

  if (!toastMessage) return null;

  return (
    <div className="animate-slide-up" style={{
      position: 'fixed',
      top: '24px',
      right: '24px',
      background: 'var(--color-success)',
      color: '#ffffff',
      padding: '16px var(--space-xl)',
      borderRadius: 'var(--radius-button)',
      zIndex: 9999,
      boxShadow: '0 10px 25px rgba(22, 163, 74, 0.3)',
      fontWeight: 600,
      fontSize: '14px',
      animation: 'fade-in 0.3s ease-out'
    }}>
      {toastMessage}
    </div>
  );
}
