import { useApp } from '../context/AppContext';

export default function ConfirmModal() {
  const { confirmState, lang } = useApp();
  if (!confirmState || !confirmState.isOpen) return null;

  return (
    <div className="modal-overlay no-print animate-fade-in" style={{ zIndex: 100000 }}>
      <div className="modal-container glass-panel animate-scale-up" style={{ 
        maxWidth: '400px', 
        borderRadius: '24px', 
        padding: '28px 24px', 
        textAlign: 'center', 
        backgroundColor: 'var(--color-surface-alt)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--color-shadow-hover)'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          color: '#ef4444',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '28px',
          marginBottom: '16px',
          marginInline: 'auto'
        }}>
          ⚠️
        </div>
        <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '10px', color: 'var(--color-text)' }}>
          {confirmState.title}
        </h3>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '24px', lineHeight: '1.6' }}>
          {confirmState.message}
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button 
            type="button"
            className="btn-elevated" 
            style={{ flex: 1, height: '44px', borderRadius: '12px', fontWeight: '600' }}
            onClick={confirmState.onCancel}
          >
            {lang === 'ar' ? 'إلغاء' : 'Cancel'}
          </button>
          <button 
            type="button"
            className="btn-filled" 
            style={{ 
              flex: 1, 
              height: '44px', 
              borderRadius: '12px', 
              backgroundColor: '#ef4444', 
              backgroundImage: 'none',
              color: '#ffffff', 
              border: 'none',
              fontWeight: '600'
            }}
            onClick={confirmState.onConfirm}
          >
            {lang === 'ar' ? 'تأكيد' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}
