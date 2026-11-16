import { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';

/**
 * رفع صور الطلاب دفعة واحدة (للبطائق): اسم كل ملف = رقم القيد أو رقم الجلوس أو اسم الطالب بالكامل.
 * يُرفع على دفعات من 25 صورة، ثم تظهر الصور غير المطابقة للمراجعة.
 */
const BATCH = 25;

export default function PhotoBulkUpload({ withoutPhoto, total, onDone }) {
  const { setToastMessage } = useApp();
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [result, setResult] = useState(null);

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    setBusy(true);
    setResult(null);
    let matched = 0;
    const unmatched = [];
    try {
      for (let i = 0; i < files.length; i += BATCH) {
        setProgress(`جاري الرفع ${Math.min(i + BATCH, files.length)} / ${files.length}`);
        const fd = new FormData();
        files.slice(i, i + BATCH).forEach((f) => fd.append('photos[]', f));
        const res = await api.post('/api/students/photos-bulk', fd);
        matched += res?.matched_count || 0;
        (res?.unmatched || []).forEach((u) => unmatched.push(u));
      }
      setResult({ matched, unmatched });
      setToastMessage?.(`تم ربط ${matched} صورة${unmatched.length ? ` وتعذر ${unmatched.length}` : ''}`, matched ? 'success' : 'error');
      setTimeout(() => setToastMessage?.(''), 4000);
      onDone?.();
    } catch (err) {
      setToastMessage?.(err?.message || 'تعذر رفع الصور', 'error');
      setTimeout(() => setToastMessage?.(''), 4000);
    } finally {
      setBusy(false);
      setProgress('');
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="cb-note no-print" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
        <strong>صور الطلاب:</strong>
        <span>{total - withoutPhoto} من {total} لهم صورة{withoutPhoto > 0 ? ` — بدون صورة: ${withoutPhoto}` : ' ✓'}</span>
        <button type="button" className="cb-btn" disabled={busy} onClick={() => inputRef.current?.click()}>
          <Upload size={15} style={{ verticalAlign: 'middle' }} /> {busy ? progress || 'جاري الرفع...' : 'رفع صور الطلاب دفعة واحدة'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
      <small>اسم كل ملف = رقم القيد أو رقم الجلوس أو اسم الطالب بالكامل (مثال: 20263120.jpg أو 3001.png).</small>
      {result && result.unmatched.length > 0 && (
        <details open>
          <summary>صور لم تُربط ({result.unmatched.length})</summary>
          <ul style={{ margin: '6px 0 0', paddingInlineStart: 20 }}>
            {result.unmatched.slice(0, 50).map((u) => <li key={u.file}>{u.file} — {u.reason}</li>)}
          </ul>
        </details>
      )}
    </div>
  );
}
