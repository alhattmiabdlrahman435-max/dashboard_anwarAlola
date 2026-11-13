import { useEffect, useRef, useState } from 'react';
import { Download, X } from 'lucide-react';

/**
 * زر "تثبيت التطبيق" لتثبيت لوحة التحكم كأيقونة على الجهاز (لابتوب أو جوال).
 * - Chrome / Edge / أندرويد: يفتح نافذة التثبيت الرسمية للمتصفح.
 * - آيفون / آيباد (Safari): يعرض خطوات "إضافة إلى الشاشة الرئيسية".
 * - متصفحات أخرى أو اتصال غير آمن: يعرض طريقة التثبيت من قائمة المتصفح.
 * يختفي تلقائياً إذا كانت اللوحة مثبتة ومفتوحة كتطبيق.
 */

// يُلتقط مبكراً (قبل ظهور الزر) لأن المتصفح يرسل الحدث مرة واحدة عند التحميل
let deferredPrompt = null;
const listeners = new Set();
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    listeners.forEach((fn) => fn());
  });
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    listeners.forEach((fn) => fn());
  });
}

const isStandalone = () =>
  window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true;

const isIos = () =>
  /iphone|ipad|ipod/i.test(window.navigator.userAgent) ||
  (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);

export default function InstallAppButton({ lang = 'ar' }) {
  const ar = lang === 'ar';
  const [, force] = useState(0);
  const [installed, setInstalled] = useState(() => isStandalone());
  const [showHelp, setShowHelp] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    const update = () => {
      setInstalled(isStandalone());
      force((n) => n + 1);
    };
    listeners.add(update);
    return () => listeners.delete(update);
  }, []);

  useEffect(() => {
    if (!showHelp) return undefined;
    const close = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setShowHelp(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [showHelp]);

  if (installed) return null;

  const onClick = async () => {
    if (deferredPrompt) {
      const promptEvent = deferredPrompt;
      deferredPrompt = null;
      promptEvent.prompt();
      const choice = await promptEvent.userChoice.catch(() => null);
      if (choice?.outcome === 'accepted') setInstalled(true);
      force((n) => n + 1);
      return;
    }
    setShowHelp((v) => !v);
  };

  const secure = window.isSecureContext;
  let steps;
  if (isIos()) {
    steps = ar
      ? ['افتح لوحة التحكم في متصفح Safari.', 'اضغط زر المشاركة (المربع والسهم للأعلى).', 'اختر «إضافة إلى الشاشة الرئيسية» ثم «إضافة».']
      : ['Open the dashboard in Safari.', 'Tap the Share button.', 'Choose "Add to Home Screen", then "Add".'];
  } else {
    steps = ar
      ? ['افتح قائمة المتصفح (⋮) أعلى الشاشة.', 'اختر «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية».', 'ستظهر أيقونة لوحة التحكم على سطح المكتب أو الجوال.']
      : ['Open the browser menu (⋮).', 'Choose "Install app" or "Add to Home screen".', 'The dashboard icon appears on your desktop or phone.'];
  }

  return (
    <div ref={boxRef} style={{ position: 'relative' }}>
      <button
        className="lang-btn"
        onClick={onClick}
        aria-label={ar ? 'تثبيت التطبيق على الجهاز' : 'Install the app on this device'}
        title={ar ? 'تثبيت لوحة التحكم كتطبيق على هذا الجهاز' : 'Install the dashboard on this device'}
      >
        <Download size={16} />
        <span>{ar ? 'تثبيت التطبيق' : 'Install app'}</span>
      </button>

      {showHelp && (
        <div
          role="dialog"
          aria-label={ar ? 'طريقة تثبيت التطبيق' : 'How to install'}
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            insetInlineEnd: 0,
            width: '290px',
            background: 'var(--color-surface, #fff)',
            color: 'var(--color-text-primary, #1e293b)',
            border: '1px solid var(--color-border, #e2e8f0)',
            borderRadius: '14px',
            boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
            padding: '14px 16px',
            zIndex: 1000,
            fontSize: '13px',
            lineHeight: 1.7,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <strong>{ar ? 'تثبيت لوحة التحكم' : 'Install the dashboard'}</strong>
            <button
              onClick={() => setShowHelp(false)}
              aria-label={ar ? 'إغلاق' : 'Close'}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0 }}
            >
              <X size={16} />
            </button>
          </div>
          <ol style={{ margin: 0, paddingInlineStart: '18px' }}>
            {steps.map((s) => <li key={s}>{s}</li>)}
          </ol>
          {!secure && (
            <p style={{ margin: '10px 0 0', fontSize: '12px', color: 'var(--color-warning, #b45309)' }}>
              {ar
                ? 'ملاحظة: التثبيت يعمل عندما تُفتح لوحة التحكم عبر رابط آمن (https).'
                : 'Note: installing works when the dashboard is opened over https.'}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
