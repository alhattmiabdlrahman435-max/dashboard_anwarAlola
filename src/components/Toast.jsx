import { useApp } from '../context/AppContext';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';

export default function Toast() {
  const { toastMessage, toastType, setToastMessage } = useApp();

  if (!toastMessage) return null;

  const isError = toastType === "error";

  return (
    <div className="animate-slide-up" style={{
      position: 'fixed',
      top: '24px',
      right: '24px',
      background: isError 
        ? 'rgba(254, 242, 242, 0.96)' // Premium soft red
        : 'rgba(240, 253, 250, 0.96)', // Premium soft green
      backdropFilter: 'blur(12px)',
      border: isError 
        ? '1px solid rgba(239, 68, 68, 0.25)' 
        : '1px solid rgba(16, 185, 129, 0.25)',
      color: isError ? '#991b1b' : '#065f46',
      padding: '16px 20px',
      borderRadius: '16px',
      zIndex: 9999,
      boxShadow: isError 
        ? '0 10px 30px rgba(220, 38, 38, 0.08), 0 1px 3px rgba(220, 38, 38, 0.05)' 
        : '0 10px 30px rgba(16, 185, 129, 0.08), 0 1px 3px rgba(16, 185, 129, 0.05)',
      fontSize: '14px',
      animation: 'fade-in 0.3s ease-out',
      maxWidth: '480px',
      direction: 'rtl',
      display: 'flex',
      gap: '12px',
      alignItems: 'flex-start',
    }}>
      {/* Icon */}
      <div style={{ marginTop: '2px', display: 'flex', flexShrink: 0 }}>
        {isError ? (
          <AlertTriangle size={18} color="#dc2626" />
        ) : (
          <CheckCircle size={18} color="#10b981" />
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {toastMessage.split('\n').map((line, idx) => {
          if (line.trim() === '') return <div key={idx} style={{ height: '2px' }} />;
          
          const isHeader = idx === 0;
          const isTeacherHeader = line.trim().startsWith('👤');
          const isBullet = line.trim().startsWith('•') || line.trim().startsWith('*');

          let style = { margin: 0, lineHeight: '1.6' };
          let content = line;

          if (isHeader) {
            style.fontWeight = '700';
            style.fontSize = '14.5px';
            style.color = isError ? '#7f1d1d' : '#047857';
          } else if (isTeacherHeader) {
            style.fontWeight = '600';
            style.color = isError ? '#991b1b' : '#065f46';
            style.marginTop = '4px';
          } else if (isBullet) {
            style.paddingRight = '12px';
            style.fontSize = '13px';
            style.color = isError ? '#b91c1c' : '#0f766e';
          }

          return (
            <p key={idx} style={style}>
              {content}
            </p>
          );
        })}
      </div>

      {/* Close Button */}
      <button 
        onClick={() => setToastMessage('')}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: isError ? '#ef4444' : '#10b981',
          opacity: 0.6,
          transition: 'all 0.2s',
          marginTop: '-2px',
          marginRight: '-4px',
          flexShrink: 0
        }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.backgroundColor = isError ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.6'; e.currentTarget.style.backgroundColor = 'transparent'; }}
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  );
}
