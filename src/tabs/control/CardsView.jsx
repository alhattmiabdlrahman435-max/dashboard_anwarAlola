import { useEffect, useMemo, useState } from 'react';
import { Printer } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SCHOOL_NAME, cell, classNumericId, useControlClasses, useControlStudents } from './controlPrintShared';
import '../../styles/controlBoardPrint.css';

const CARDS_PER_PAGE = 8; // 2 أعمدة × 4 صفوف

/** البطائق — بطاقة لكل طالب: اسم المدرسة، اسم الطالب، الصف والشعبة، رقم الجلوس، رقم اللجنة */
export default function CardsView() {
  const { setToastMessage } = useApp();
  const classes = useControlClasses();
  const [classId, setClassId] = useState('all');
  const { students, loading, error } = useControlStudents(classId);

  useEffect(() => {
    if (error) setToastMessage?.(error, 'error');
  }, [error, setToastMessage]);

  const pages = useMemo(() => {
    const out = [];
    for (let i = 0; i < students.length; i += CARDS_PER_PAGE) out.push(students.slice(i, i + CARDS_PER_PAGE));
    return out;
  }, [students]);

  return (
    <div className="cb-print-view">
      <div className="cb-controls no-print">
        <label className="cb-field">
          <span>الصف والشعبة</span>
          <select className="text-field" value={classId} onChange={(e) => setClassId(e.target.value)}>
            <option value="all">جميع الشعب</option>
            {classes.map((cls) => (
              <option key={cls.id} value={classNumericId(cls)}>{cls.name}</option>
            ))}
          </select>
        </label>
        <button type="button" className="btn-filled cb-print-btn" onClick={() => window.print()} disabled={loading || students.length === 0}>
          <Printer size={18} />
          <span>طباعة</span>
        </button>
      </div>

      {loading && <div className="cb-status">جاري التحميل...</div>}
      {!loading && students.length === 0 && <div className="cb-status">لا يوجد طلاب</div>}

      {!loading && pages.map((page, pi) => (
        <section key={`page-${pi}-${page[0]?.id}`}className="cb-sheet cb-portrait-page cb-cards-page">
          <div className="cb-cards-grid">
            {page.map((s) => (
              <div key={s.id} className="cb-card">
                <div className="cb-card-school">{SCHOOL_NAME}</div>
                <div className="cb-card-name">{cell(s.name_ar)}</div>
                <div className="cb-card-row">
                  <span className="cb-card-label">الصف والشعبة:</span>
                  <span>{cell(s.class_name)}</span>
                </div>
                <div className="cb-card-seat">
                  <span className="cb-card-label">رقم الجلوس</span>
                  <span className="cb-card-seat-num">{cell(s.seat_number)}</span>
                </div>
                <div className="cb-card-row">
                  <span className="cb-card-label">رقم اللجنة:</span>
                  <span className="cb-card-committee">{cell(s.committee_number)}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
