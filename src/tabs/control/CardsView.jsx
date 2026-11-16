import { useEffect, useMemo, useRef, useState } from 'react';
import { ZoomIn, ZoomOut, Edit3, Eye } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { openElementPrintPreview } from '../../utils/printPreview';
import PhotoBulkUpload from './PhotoBulkUpload';
import { SCHOOL_NAME, cell, classNumericId, useControlClasses, useControlStudents } from './controlPrintShared';
import '../../styles/controlBoardPrint.css';

const CARDS_PER_PAGE = 8; // 2 أعمدة × 4 صفوف

const DEFAULT_EXAM_INSTRUCTIONS = [
  '١. الحضور إلى مقر اللجنة قبل بدء الاختبار بـ ١٥ دقيقة على الأقل.',
  '٢. إحضار هذه البطاقة وإبرازها للملاحظ عند الطلب طوال فترة الاختبارات.',
  '٣. الجلوس في المكان المخصص حسب رقم الجلوس ورقم اللجنة المدونين في البطاقة.',
  '٤. الالتزام بالزي المدرسي الرسمي وإحضار الأدوات القرطاسية اللازمة.',
  '٥. يمنع اصطحاب الهواتف النقالة أو الساعات الذكية أو أي وسيلة غش داخل قاعة الاختبار.',
  '٦. كتابة الاسم ورقم الجلوس والبيانات المطلوبة بوضوح في المكان المخصص على ورقة الإجابة.',
  '٧. الحفاظ على الهدوء والنظام داخل اللجنة وعدم مغادرة القاعة قبل انتهاء نصف الوقت.',
].join('\n');

/** البطائق — الوجه الأمامي (بيانات الطالب + الصورة + الشعار) + خلفية البطاقة (تعليمات الاختبارات) */
export default function CardsView() {
  const { setToastMessage } = useApp();
  const classes = useControlClasses();
  const [classId, setClassId] = useState('all');
  const [printMode, setPrintMode] = useState('both'); // 'front' | 'back' | 'both'
  const [showInstructionsEditor, setShowInstructionsEditor] = useState(false);
  const [instructionsText, setInstructionsText] = useState(() => {
    try {
      return localStorage.getItem('cb_card_exam_instructions') || DEFAULT_EXAM_INSTRUCTIONS;
    } catch {
      return DEFAULT_EXAM_INSTRUCTIONS;
    }
  });
  const [isZoomed, setIsZoomed] = useState(false);
  const printAreaRef = useRef(null);

  const [photoTick, setPhotoTick] = useState(0);
  const { students, loading, error } = useControlStudents(classId, photoTick);
  const withoutPhoto = students.filter((s) => !s.photo_url || !/^(https?:)?\//.test(String(s.photo_url))).length;

  useEffect(() => {
    if (error) setToastMessage?.(error, 'error');
  }, [error, setToastMessage]);

  const handleInstructionsChange = (val) => {
    setInstructionsText(val);
    try {
      localStorage.setItem('cb_card_exam_instructions', val);
    } catch {
      // ignore storage errors
    }
  };

  const instructionLines = useMemo(
    () =>
      instructionsText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
    [instructionsText]
  );

  const pages = useMemo(() => {
    const out = [];
    for (let i = 0; i < students.length; i += CARDS_PER_PAGE) {
      out.push(students.slice(i, i + CARDS_PER_PAGE));
    }
    return out;
  }, [students]);

  return (
    <div ref={printAreaRef} className={`cb-print-view${isZoomed ? ' cb-zoomed' : ''}`}>
      <div className="cb-controls no-print">
        <label className="cb-field">
          <span>الصف والشعبة</span>
          <select className="text-field" value={classId} onChange={(e) => setClassId(e.target.value)}>
            <option value="all">جميع الشعب</option>
            {classes.map((cls) => (
              <option key={cls.id} value={classNumericId(cls)}>
                {cls.name}
              </option>
            ))}
          </select>
        </label>

        <label className="cb-field">
          <span>وضع الطباعة</span>
          <select className="text-field" value={printMode} onChange={(e) => setPrintMode(e.target.value)}>
            <option value="both">الوجه الأمامي + الخلفية (تعليمات الاختبارات)</option>
            <option value="front">الوجه الأمامي فقط (البطاقة والبيانات)</option>
            <option value="back">خلفية البطاقة فقط (تعليمات الاختبارات)</option>
          </select>
        </label>

        <button
          type="button"
          className="btn-outlined"
          onClick={() => setShowInstructionsEditor((v) => !v)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <Edit3 size={16} />
          <span>{showInstructionsEditor ? 'إخفاء تعديل التعليمات' : 'تعديل تعليمات خلفية البطاقة'}</span>
        </button>

        <button
          type="button"
          className="btn-outlined"
          onClick={() => setIsZoomed((z) => !z)}
          title="يمكنك أيضاً النقر المزدوج على البطاقة للتكبير والتصغير"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          {isZoomed ? <ZoomOut size={16} /> : <ZoomIn size={16} />}
          <span>{isZoomed ? 'تصغير العرض' : 'تكبير العرض'}</span>
        </button>

        <button
          type="button"
          className="btn-filled cb-print-btn"
          onClick={() => openElementPrintPreview(printAreaRef.current, { title: 'معاينة طباعة البطائق', landscape: false })}
          disabled={loading || students.length === 0}
        >
          <Eye size={18} />
          <span>معاينة وطباعة</span>
        </button>
      </div>

      {showInstructionsEditor && (
        <div
          className="no-print"
          style={{
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: '10px',
            padding: '12px 16px',
            marginBottom: '16px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <strong style={{ fontSize: '13.5px', color: '#0f172a' }}>
              تعليمات الاختبارات (تظهر في خلفية البطاقة — كل سطر يمثل بنداً):
            </strong>
            <button
              type="button"
              className="btn-outlined"
              onClick={() => handleInstructionsChange(DEFAULT_EXAM_INSTRUCTIONS)}
              style={{ fontSize: '12px', padding: '4px 10px' }}
            >
              استعادة النص الافتراضي
            </button>
          </div>
          <textarea
            rows={6}
            value={instructionsText}
            onChange={(e) => handleInstructionsChange(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid #94a3b8',
              fontFamily: 'inherit',
              fontSize: '13px',
              lineHeight: 1.6,
            }}
          />
        </div>
      )}

      <PhotoBulkUpload withoutPhoto={withoutPhoto} total={students.length} onDone={() => setPhotoTick((t) => t + 1)} />

      {loading && <div className="cb-status">جاري التحميل...</div>}
      {!loading && students.length === 0 && <div className="cb-status">لا يوجد طلاب</div>}

      {!loading &&
        pages.map((page, pi) => (
          <div key={`page-group-${pi}-${page[0]?.id}`}>
            {/* الوجه الأمامي للبطائق */}
            {(printMode === 'front' || printMode === 'both') && (
              <section
                className="cb-sheet cb-portrait-page cb-cards-page"
                onDoubleClick={() => setIsZoomed((z) => !z)}
                title="انقر نقراً مزدوجاً للتكبير أو التصغير"
              >
                <div className="cb-cards-grid">
                  {page.map((s) => (
                    <div key={`front-${s.id}`} className="cb-card">
                      <div className="cb-card-header">
                        <img
                          src="/slogan.jpeg"
                          alt="شعار المدرسة"
                          className="cb-card-logo"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <div className="cb-card-header-titles">
                          <div className="cb-card-school">{SCHOOL_NAME}</div>
                          <div className="cb-card-subtitle">بطاقة دخول الاختبارات</div>
                        </div>
                      </div>

                      <div className="cb-card-body">
                        <div className="cb-card-info">
                          <div className="cb-card-name">{cell(s.name_ar)}</div>
                          <div className="cb-card-row">
                            <span className="cb-card-label">الصف والشعبة:</span>
                            <span className="cb-card-val">{cell(s.class_name)}</span>
                          </div>
                          <div className="cb-card-numbers-row">
                            <div className="cb-card-num-box">
                              <span className="cb-card-label">رقم الجلوس</span>
                              <span className="cb-card-seat-num">{cell(s.seat_number)}</span>
                            </div>
                            <div className="cb-card-num-box">
                              <span className="cb-card-label">رقم اللجنة</span>
                              <span className="cb-card-committee">{cell(s.committee_number)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="cb-card-photo-box">
                          {s.photo_url ? (
                            <img
                              src={s.photo_url}
                              alt={s.name_ar || 'صورة الطالب'}
                              className="cb-card-photo-img"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                if (e.currentTarget.nextElementSibling) {
                                  e.currentTarget.nextElementSibling.style.display = 'flex';
                                }
                              }}
                            />
                          ) : null}
                          <div
                            className="cb-card-photo-placeholder"
                            style={{ display: s.photo_url ? 'none' : 'flex' }}
                          >
                            <span>صورة الطالب</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* خلفية البطائق: تعليمات الاختبارات */}
            {(printMode === 'back' || printMode === 'both') && (
              <section
                className="cb-sheet cb-portrait-page cb-cards-page"
                onDoubleClick={() => setIsZoomed((z) => !z)}
                title="انقر نقراً مزدوجاً للتكبير أو التصغير"
              >
                <div className="cb-cards-grid">
                  {page.map((s) => (
                    <div key={`back-${s.id}`} className="cb-card cb-card-back">
                      <div className="cb-card-back-header">
                        <img
                          src="/slogan.jpeg"
                          alt="شعار المدرسة"
                          className="cb-card-back-logo"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <span className="cb-card-back-title">تعليمات الاختبارات</span>
                      </div>
                      <ul className="cb-card-instructions-list">
                        {instructionLines.map((line, idx) => (
                          <li key={idx}>{line}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        ))}
    </div>
  );
}
