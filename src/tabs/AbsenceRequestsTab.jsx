import { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useStudents } from '../contexts/Students/useStudents';
import { useClasses } from '../contexts/Classes/useClasses';
import { useAttendance } from '../contexts/Attendance/useAttendance';
import { useAllowedClasses } from '../hooks/useAllowedClasses';
import { usePagination } from '../hooks/usePagination';
import PaginationBar from '../components/PaginationBar';
import { X, ArrowUp, ArrowDown, Search } from 'lucide-react';

export default function AbsenceRequestsTab() {
  const {
    lang,
    t,
    renderAvatar,
    setToastMessage,
    canAction
  } = useApp();

  const {
    classes,
    availableGrades,
    availableSections,
    fetchClasses,
  } = useClasses();

  const { allowedClasses, allowedGrades, allowedSections } = useAllowedClasses('absenceRequests');

  const {
    absenceRequests,
    absenceRequestsPagination,
    handleAbsenceDecision,
    attendanceRosterDate,
    setAttendanceRosterDate,
    handleManualAttendanceChange,
    fetchAbsenceRequests,
    loading
  } = useAttendance();

  const { students, handleManualAttendanceNoteChange, fetchStudents } = useStudents();

  const {
    page,
    perPage,
    search,
    sort,
    direction,
    filters,
    setPage,
    setPerPage,
    setSort,
    setSearch,
    setFilters,
    buildQueryString,
    goToPrevIfEmpty,
  } = usePagination({
    moduleKey: 'absence_requests',
    defaultFilters: { status: 'pending', date: new Date().toISOString().split('T')[0], class_id: '' }
  });

  // Local tab/filters states
  const [absenceSubTab, setAbsenceSubTab] = useState('requests');
  const [attendanceRosterGrade, setAttendanceRosterGrade] = useState('الصف الأول');
  const [attendanceRosterSection, setAttendanceRosterSection] = useState('أ');

  const activeClass = allowedClasses.find(c => c.grade === attendanceRosterGrade && c.section === attendanceRosterSection) || (allowedClasses.length > 0 ? allowedClasses[0] : null);

  useEffect(() => {
    if (allowedClasses.length > 0) {
      const match = allowedClasses.find(c => c.grade === attendanceRosterGrade && c.section === attendanceRosterSection);
      if (!match) {
        setAttendanceRosterGrade(allowedClasses[0].grade);
        setAttendanceRosterSection(allowedClasses[0].section);
      }
    }
  }, [allowedClasses]);

  // Dynamic loaders
  const qs = buildQueryString();
  useEffect(() => {
    if (absenceSubTab === 'requests') {
      fetchAbsenceRequests(qs);
    }
  }, [fetchAbsenceRequests, qs, absenceSubTab]);

  useEffect(() => {
    if (absenceSubTab === 'roster' && activeClass) {
      // Load all students for the class roster
      fetchStudents(`?class_id=${activeClass.id}&per_page=100`);
    }
  }, [absenceSubTab, activeClass, fetchStudents]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);
  const absenceFilter = filters.status || 'pending';
  const filterDate = filters.date || '';
  const filterClassId = filters.class_id || 'all';
  const dateSortOrder = direction || 'desc';

  const toggleDateSort = () => {
    const nextDir = direction === 'desc' ? 'asc' : 'desc';
    setSort('start_date', nextDir);
  };

  const shiftDate = (days) => {
    const base = filterDate ? new Date(filterDate) : new Date();
    base.setDate(base.getDate() + days);
    const yyyy = base.getFullYear();
    const mm = String(base.getMonth() + 1).padStart(2, '0');
    const dd = String(base.getDate()).padStart(2, '0');
    setFilters({ ...filters, date: `${yyyy}-${mm}-${dd}` });
  };

  const setQuickDate = (type) => {
    if (type === 'today') {
      const today = new Date().toISOString().split('T')[0];
      setFilters({ ...filters, date: today });
    } else if (type === 'yesterday') {
      const yest = new Date();
      yest.setDate(yest.getDate() - 1);
      const yyyy = yest.getFullYear();
      const mm = String(yest.getMonth() + 1).padStart(2, '0');
      const dd = String(yest.getDate()).padStart(2, '0');
      setFilters({ ...filters, date: `${yyyy}-${mm}-${dd}` });
    } else if (type === 'all') {
      setFilters({ ...filters, date: '' });
    }
  };

  // Decision Modal state
  const [decisionModalOpen, setDecisionModalOpen] = useState(false);
  const [activeRequest, setActiveRequest] = useState(null);
  const [decisionType, setDecisionType] = useState(''); // 'approved' or 'rejected'
  const [decisionNote, setDecisionNote] = useState('');

  const filteredRequests = absenceRequests;

  const pendingRequestsCount = absenceRequestsPagination.total;

  const rosterStudents = useMemo(() => {
    return students.filter(s => s.grade === attendanceRosterGrade && s.section === attendanceRosterSection);
  }, [students, attendanceRosterGrade, attendanceRosterSection]);

  const openDecisionModal = (req, type) => {
    setActiveRequest(req);
    setDecisionType(type);
    setDecisionNote('');
    setDecisionModalOpen(true);
  };

  const handleActionClick = (reqOrId, type) => {
    const req = typeof reqOrId === 'object' ? reqOrId : absenceRequests.find(r => String(r.id) === String(reqOrId));
    if (req) {
      openDecisionModal(req, type);
    }
  };

  const handleModalSubmit = (e) => {
    e.preventDefault();
    if (decisionType === 'rejected' && !decisionNote.trim()) {
      setToastMessage(lang === 'ar' ? 'يجب إدخال سبب الرفض' : 'Rejection reason is required');
      setTimeout(() => setToastMessage(''), 3000);
      return;
    }
    handleAbsenceDecision(activeRequest.id, decisionType, decisionNote, students)
      .then((res) => {
        if (res && res.success) {
          fetchAbsenceRequests(buildQueryString());
        }
      });
    setDecisionModalOpen(false);
    setActiveRequest(null);
    setDecisionNote('');
  };


  return (
    <div className="section-card">
      <div className="section-card-header no-print" style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <h3 className="section-card-title headline-small" style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            💼 {lang === 'ar' ? 'الحضور والغياب وطلبات الإذن' : 'Attendance & Absence Manager'}
          </h3>
          
          {/* Switch between requests list and daily roster */}
          <div className="tab-menu" style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--color-surface)', padding: '4px', borderRadius: 'var(--radius-chip)' }}>
            <button 
              className={`chip ${absenceSubTab === 'requests' ? 'selected' : ''}`}
              onClick={() => setAbsenceSubTab('requests')}
              style={{ border: 'none', margin: 0 }}
            >
              ✉️ {lang === 'ar' ? 'طلبات الاستئذان' : 'Absence Requests'}
            </button>
            <button 
              className={`chip ${absenceSubTab === 'roster' ? 'selected' : ''}`}
              onClick={() => setAbsenceSubTab('roster')}
              style={{ border: 'none', margin: 0 }}
            >
              📋 {lang === 'ar' ? 'رصد الحضور اليومي' : 'Daily Roster Sheet'}
            </button>
          </div>
        </div>
      </div>      {absenceSubTab === 'requests' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {/* Main Date & Class Archiving Workspace Bar */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            padding: '16px',
            backgroundColor: 'var(--color-surface)',
            borderRadius: '16px',
            border: '1px solid var(--color-border)',
            marginBottom: '16px'
          }} className="no-print">
            {/* Row 1: Date Navigation Hub & Class Filter */}
            <div style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px dashed var(--color-border)',
              paddingBottom: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  📅 {lang === 'ar' ? 'تاريخ طلبات الغياب:' : 'Absence Date:'}
                </span>

                {/* Shift Previous Day */}
                <button
                  type="button"
                  className="chip"
                  onClick={() => shiftDate(-1)}
                  title={lang === 'ar' ? 'اليوم السابق' : 'Previous Day'}
                  style={{ margin: 0, padding: '6px 10px', fontSize: '12px', cursor: 'pointer' }}
                >
                   ▶ {lang === 'ar' ? 'السابق' : 'Prev'}
                </button>

                {/* Date Input */}
                <input
                  type="date"
                  className="text-field"
                  value={filterDate}
                  onChange={e => setFilters({ ...filters, date: e.target.value })}
                  style={{
                    minHeight: '38px',
                    fontSize: '13px',
                    padding: '4px 10px',
                    borderRadius: '10px',
                    width: '145px',
                    fontWeight: '600',
                    backgroundColor: filterDate ? 'rgba(30, 80, 142, 0.08)' : 'var(--color-surface-alt)',
                    borderColor: filterDate ? 'var(--color-primary)' : 'var(--color-border)'
                  }}
                />

                {/* Shift Next Day */}
                <button
                  type="button"
                  className="chip"
                  onClick={() => shiftDate(1)}
                  title={lang === 'ar' ? 'اليوم التالي' : 'Next Day'}
                  style={{ margin: 0, padding: '6px 10px', fontSize: '12px', cursor: 'pointer' }}
                >
                  {lang === 'ar' ? 'التالي' : 'Next'} ◀
                </button>

                {/* Quick Date Pills */}
                <div style={{ display: 'flex', gap: '4px', marginInlineStart: '4px' }}>
                  <button
                    type="button"
                    className={`chip ${filterDate === new Date().toISOString().split('T')[0] ? 'selected' : ''}`}
                    onClick={() => setQuickDate('today')}
                    style={{ margin: 0, padding: '4px 10px', fontSize: '11px', border: 'none' }}
                  >
                    {lang === 'ar' ? 'اليوم' : 'Today'}
                  </button>
                  <button
                    type="button"
                    className="chip"
                    onClick={() => setQuickDate('yesterday')}
                    style={{ margin: 0, padding: '4px 10px', fontSize: '11px', border: 'none' }}
                  >
                    {lang === 'ar' ? 'أمس' : 'Yesterday'}
                  </button>
                  <button
                    type="button"
                    className={`chip ${!filterDate ? 'selected' : ''}`}
                    onClick={() => setQuickDate('all')}
                    style={{ margin: 0, padding: '4px 10px', fontSize: '11px', border: 'none' }}
                  >
                    {lang === 'ar' ? 'الكل' : 'All'}
                  </button>
                </div>
              </div>

              {/* Class Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>
                  🏫 {lang === 'ar' ? 'الفصل:' : 'Class:'}
                </span>
                <select
                  className="text-field"
                  value={filterClassId}
                  onChange={e => setFilters({ ...filters, class_id: e.target.value === 'all' ? '' : e.target.value })}
                  style={{
                    minHeight: '38px',
                    fontSize: '12px',
                    padding: '4px 12px',
                    borderRadius: '10px',
                    minWidth: '160px',
                    backgroundColor: filterClassId !== 'all' ? 'rgba(30, 80, 142, 0.08)' : 'var(--color-surface-alt)',
                    borderColor: filterClassId !== 'all' ? 'var(--color-primary)' : 'var(--color-border)'
                  }}
                >
                  <option value="all">{lang === 'ar' ? '🏢 جميع الفصول' : 'All Classes'}</option>
                  {allowedClasses.map(cls => {
                    const cleanId = String(cls.id).replace('cls-', '');
                    return (
                      <option key={cls.id} value={cleanId}>
                        {cls.grade_ar || cls.grade} - {cls.section_ar || cls.section}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Row 2: Status, Search, and Sorting */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <button 
                  className={`chip ${absenceFilter === 'pending' ? 'selected' : ''}`}
                  onClick={() => setFilters({ ...filters, status: 'pending' })}
                >
                  ⏳ {t.pendingStatus} ({pendingRequestsCount})
                </button>
                <button 
                  className={`chip ${absenceFilter === 'all' ? 'selected' : ''}`}
                  onClick={() => setFilters({ ...filters, status: 'all' })}
                >
                  🗂️ {t.filterAll} ({absenceRequestsPagination.total})
                </button>

                {/* Search Box */}
                <div className="search-box" style={{ width: '220px', minHeight: '36px', margin: 0 }}>
                  <Search size={15} />
                  <input 
                    type="text"
                    className="text-field"
                    style={{ minHeight: '34px', fontSize: '12px' }}
                    placeholder={lang === 'ar' ? 'البحث باسم الطالب أو السبب...' : 'Search student or reason...'}
                    value={search || ''}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <button 
                className="chip"
                onClick={toggleDateSort}
                style={{ 
                  border: '1px solid var(--color-border)', 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '6px',
                  cursor: 'pointer',
                  backgroundColor: 'var(--color-surface-alt)',
                  color: 'var(--color-text-primary)',
                  margin: 0
                }}
              >
                📅 {lang === 'ar' ? 'فرز بالتاريخ:' : 'Sort Date:'} 
                <span style={{ fontWeight: 'bold', color: 'var(--color-primary-ui)' }}>
                  {dateSortOrder === 'desc' ? (lang === 'ar' ? 'الأحدث أولاً' : 'Newest First') : (lang === 'ar' ? 'الأقدم أولاً' : 'Oldest First')}
                </span>
                {dateSortOrder === 'desc' ? <ArrowDown size={14} /> : <ArrowUp size={14} />}
              </button>
            </div>
          </div>

              {filteredRequests.length > 0 ? (
                <>
                  <div className="students-table-container">
                    <table className="students-table">
                      <thead>
                        <tr>
                          <th>{t.studentName}</th>
                          <th 
                            onClick={toggleDateSort}
                            style={{ cursor: 'pointer', userSelect: 'none' }}
                            title={lang === 'ar' ? 'اضغط للفرز بالتاريخ' : 'Click to sort by date'}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span>{t.requestedDate}</span>
                              {dateSortOrder === 'desc' ? <ArrowDown size={12} /> : <ArrowUp size={12} />}
                            </div>
                          </th>
                          <th>{t.absenceReason}</th>
                          <th>{t.status}</th>
                          <th className="no-print">{t.actions}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRequests.map((req) => {
                          const student = students.find(s => s.id === req.studentId);
                          return (
                            <tr key={req.id}>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  {renderAvatar(student?.photo, "👨‍🎓")}
                                  <div>
                                    <div style={{ fontWeight: 'bold', fontSize: '13px' }}>
                                      {lang === 'ar' ? (student?.name || req.studentName) : (student?.nameEn || req.studentNameEn || req.studentName)}
                                    </div>
                                    <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>ID: {req.studentId}</div>
                                  </div>
                                </div>
                              </td>
                              <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{req.date}</td>
                              <td style={{ fontSize: '13px', fontWeight: '500' }}>{req.reason}</td>
                              <td>
                                <span className={`badge-status ${req.status === 'pending' ? 'on-bus' : req.status === 'approved' ? 'checked-in' : 'absent'}`}>
                                  {req.status === 'pending' ? (lang === 'ar' ? 'قيد الانتظار' : 'Pending') : req.status === 'approved' ? (lang === 'ar' ? 'مقبول' : 'Approved') : (lang === 'ar' ? 'مرفوض' : 'Rejected')}
                                </span>
                              </td>
                              <td className="no-print">
                                {req.status === 'pending' ? (
                                  <div style={{ display: 'flex', gap: '6px' }}>
                                    {canAction('absenceRequests', 'approve', req.student?.class_id) && (
                                      <button 
                                        className="btn-filled"
                                        style={{ background: 'var(--gradient-success)', border: 'none', color: 'white', padding: '2px 8px', fontSize: '11px', borderRadius: '6px' }}
                                        onClick={() => handleActionClick(req, 'approved')}
                                      >
                                        ✓ {t.approveBtn || 'قبول'}
                                      </button>
                                    )}
                                    {canAction('absenceRequests', 'reject', req.student?.class_id) && (
                                      <button 
                                        className="btn-filled"
                                        style={{ background: 'var(--gradient-error)', border: 'none', color: 'white', padding: '2px 8px', fontSize: '11px', borderRadius: '6px' }}
                                        onClick={() => handleActionClick(req, 'rejected')}
                                      >
                                        ✗ {t.rejectBtn || 'رفض'}
                                      </button>
                                    )}
                                  </div>
                                ) : (
                                  <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
                                    {req.status === 'approved' ? (
                                      <span style={{ color: 'var(--color-success)' }}>✓ {lang === 'ar' ? 'تمت الموافقة' : 'Approved'}</span>
                                    ) : (
                                      <span style={{ color: 'var(--color-error)' }}>✗ {lang === 'ar' ? 'تم الرفض' : 'Rejected'}</span>
                                    )}
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="no-print" style={{ marginTop: 'var(--space-md)' }}>
                    <PaginationBar
                      page={page}
                      lastPage={absenceRequestsPagination.lastPage}
                      total={absenceRequestsPagination.total}
                      from={absenceRequestsPagination.from}
                      to={absenceRequestsPagination.to}
                      perPage={perPage}
                      onPageChange={setPage}
                      onPerPageChange={setPerPage}
                      loading={loading}
                      lang={lang}
                    />
                  </div>
                </>
              ) : (
                <div style={{ padding: '48px 24px', textAlign: 'center', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-card)', border: '1px dashed var(--color-border)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '32px' }}>
                      {search ? "🔍" : (filters.status || filters.date) ? "ℹ️" : "📂"}
                    </span>
                    <span style={{ fontWeight: '600', fontSize: '15px', color: 'var(--color-text-primary)' }}>
                      {search 
                        ? (lang === 'ar' ? 'لا توجد طلبات تطابق بحثك' : 'No matching requests found')
                        : (filters.status || filters.date)
                          ? (lang === 'ar' ? 'لا توجد طلبات تطابق التصفية المحددة' : 'No requests match the selected filters')
                          : (lang === 'ar' ? 'لا توجد طلبات غياب حالياً' : 'No absence requests found')
                      }
                    </span>
                    <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                      {search 
                        ? (lang === 'ar' ? 'جرب البحث بكلمة مفتاحية مختلفة' : 'Try searching for a different keyword')
                        : (filters.status || filters.date)
                          ? (lang === 'ar' ? 'جرب تغيير خيارات التصفية' : 'Try changing your filter selections')
                          : (lang === 'ar' ? 'لم يتم إضافة أي بيانات بعد' : 'No records have been added yet')
                      }
                    </span>
                  </div>
                </div>
              )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          
          {/* Roster Filters Header */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', padding: 'var(--space-md)', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-card)', border: '1px solid var(--color-border)' }} className="no-print">
            <div className="form-group" style={{ margin: 0, minWidth: '160px' }}>
              <label className="form-label" style={{ fontSize: '12px', marginBottom: '6px' }}>{t.formGrade}</label>
              <select 
                className="text-field"
                style={{ height: '40px', padding: '0 var(--space-md)' }}
                value={attendanceRosterGrade}
                onChange={(e) => setAttendanceRosterGrade(e.target.value)}
              >
                {allowedGrades.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group" style={{ margin: 0, minWidth: '100px' }}>
              <label className="form-label" style={{ fontSize: '12px', marginBottom: '6px' }}>{t.formSection}</label>
              <select 
                className="text-field"
                style={{ height: '40px', padding: '0 var(--space-md)' }}
                value={attendanceRosterSection}
                onChange={(e) => setAttendanceRosterSection(e.target.value)}
              >
                {allowedSections.map(s => {
                  const secMap = { 'أ': 'A', 'ب': 'B', 'ج': 'C', 'د': 'D', 'هـ': 'E', 'و': 'F', 'ز': 'G' };
                  return (
                    <option key={s} value={s}>{lang === 'ar' ? s : (secMap[s] || s)}</option>
                  );
                })}
              </select>
            </div>

            <div className="form-group" style={{ margin: 0, minWidth: '160px' }}>
              <label className="form-label" style={{ fontSize: '12px', marginBottom: '6px' }}>{lang === 'ar' ? 'تاريخ التحضير' : 'Attendance Date'}</label>
              <input 
                type="date"
                className="text-field"
                style={{ height: '40px', padding: '0 var(--space-md)' }}
                value={attendanceRosterDate}
                onChange={(e) => setAttendanceRosterDate(e.target.value)}
              />
            </div>
          </div>

          {/* Roster Table Grid */}
          {rosterStudents.length > 0 ? (
            <div className="students-table-container">
                  <table className="students-table">
                    <thead>
                      <tr>
                        <th>{t.studentId}</th>
                        <th>{t.studentName}</th>
                        <th>{lang === 'ar' ? 'الحالة الحالية' : 'Current Status'}</th>
                        <th>{lang === 'ar' ? 'ملاحظة المعلم' : 'Teacher Note'}</th>
                        <th className="no-print" style={{ textAlign: 'center' }}>{lang === 'ar' ? 'رصد وتحديث الحضور' : 'Mark Attendance'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rosterStudents.map(student => {
                        // Check if there is an approved excuse for this student today
                        const hasExcuse = absenceRequests.some(r => r.studentId === student.id && r.requestedDate === attendanceRosterDate && r.status === 'approved');
                        return (
                          <tr key={student.id}>
                            <td style={{ fontFamily: 'var(--font-mono)' }}>{student.id}</td>
                            <td style={{ fontWeight: '600' }}>
                              {renderAvatar(student.photo, '👨‍🎓')}
                              {lang === 'ar' ? student.name : student.nameEn}
                            </td>
                            <td>
                              {student.status === 'absent' && hasExcuse ? (
                                <span className="badge-status" style={{ backgroundColor: 'rgba(37, 99, 235, 0.1)', color: 'var(--color-primary-ui)', border: '1px solid rgba(37, 99, 235, 0.3)' }}>
                                  🔵 {lang === 'ar' ? 'غائب بعذر مقبول' : 'Absent (Excused)'}
                                </span>
                              ) : (
                                <span className={`badge-status ${
                                  student.status === 'present' ? 'checked-in' : 'absent'
                                }`}>
                                  {student.status === 'present' ? t.present : t.absent}
                                </span>
                              )}
                            </td>
                            <td>
                              <input 
                                type="text" 
                                className="text-field"
                                style={{ height: '34px', padding: '4px 10px', fontSize: '12px', minWidth: '150px' }}
                                placeholder={lang === 'ar' ? 'ملاحظة المعلم (مثال: عذر طبي)...' : 'Teacher note...'}
                                value={student.attendanceNote || ''}
                                onChange={(e) => handleManualAttendanceNoteChange(student.id, e.target.value)}
                              />
                            </td>
                            <td className="no-print">
                              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                <button
                                  className={`chip ${student.status === 'present' ? 'selected' : ''}`}
                                  style={{
                                    border: '1px solid rgba(22, 163, 74, 0.2)',
                                    color: student.status === 'present' ? '#ffffff' : 'var(--color-success)',
                                    backgroundColor: student.status === 'present' ? 'var(--color-success)' : 'transparent',
                                    cursor: 'pointer',
                                    margin: 0
                                  }}
                                  onClick={() => handleManualAttendanceChange(student.id, 'present', attendanceRosterDate, students)}
                                >
                                  🟢 {t.present}
                                </button>

                                <button
                                  className={`chip ${student.status === 'absent' ? 'selected' : ''}`}
                                  style={{
                                    border: '1px solid rgba(220, 38, 38, 0.2)',
                                    color: student.status === 'absent' ? '#ffffff' : 'var(--color-error)',
                                    backgroundColor: student.status === 'absent' ? 'var(--color-error)' : 'transparent',
                                    cursor: 'pointer',
                                    margin: 0
                                  }}
                                  onClick={() => handleManualAttendanceChange(student.id, 'absent', attendanceRosterDate, students)}
                                >
                                  🔴 {t.absent}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-card)' }}>
              ℹ️ {lang === 'ar' ? 'لا يوجد طلاب مسجلين في هذا الصف والشعبة حالياً.' : 'No registered students in this grade and section currently.'}
            </div>
          )}
        </div>
      )}

      {/* DECISION POPUP MODAL */}
      {decisionModalOpen && activeRequest && (
        <div className="modal-overlay no-print" style={{ zIndex: 1100 }}>
          <div className="modal-container" style={{ maxWidth: '500px' }}>
            <header className="modal-header">
              <h3 className="modal-title">
                {decisionType === 'approved' 
                  ? (lang === 'ar' ? '✅ قبول طلب الاستئذان' : '✅ Approve Absence Request') 
                  : (lang === 'ar' ? '❌ رفض طلب الاستئذان' : '❌ Reject Absence Request')
                }
              </h3>
              <button 
                className="modal-close-btn" 
                onClick={() => {
                  setDecisionModalOpen(false);
                  setActiveRequest(null);
                }}
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </header>

            <form onSubmit={handleModalSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                {/* Student Info */}
                <div style={{ backgroundColor: 'var(--color-surface-alt)', padding: '12px', borderRadius: '12px', border: '1px solid var(--color-border)', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <strong>{lang === 'ar' ? 'اسم الطالب:' : 'Student Name:'}</strong>
                    <span>{activeRequest.studentName}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <strong>{lang === 'ar' ? 'تاريخ الغياب المطلوب:' : 'Requested Date:'}</strong>
                    <span>{activeRequest.requestedDate}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <strong>{lang === 'ar' ? 'السبب:' : 'Reason:'}</strong>
                    <div style={{ padding: '6px 10px', backgroundColor: 'var(--color-surface)', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '12px' }}>
                      {lang === 'ar' ? activeRequest.reason : (activeRequest.reasonEn || activeRequest.reason)}
                    </div>
                  </div>
                </div>

                {/* Input Decision Note */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 'bold' }}>
                    {decisionType === 'rejected' 
                      ? (lang === 'ar' ? 'سبب الرفض (مطلوب):' : 'Rejection Reason (Required):') 
                      : (lang === 'ar' ? 'ملاحظات إضافية (اختياري):' : 'Additional Notes (Optional):')
                    }
                  </label>
                  <textarea
                    className="text-field"
                    value={decisionNote}
                    onChange={(e) => setDecisionNote(e.target.value)}
                    placeholder={decisionType === 'rejected' 
                      ? (lang === 'ar' ? 'يرجى كتابة سبب رفض طلب الاستئذان بالتفصيل لتوضيحه لولي الأمر...' : 'Write reason for rejecting this leave request...') 
                      : (lang === 'ar' ? 'اكتب ملاحظات القبول (مثال: تمت الموافقة بعذر طبي)...' : 'Write approval note (e.g. Approved with medical note)...')
                    }
                    style={{ minHeight: '100px', resize: 'vertical', fontSize: '13px', padding: '10px' }}
                    required={decisionType === 'rejected'}
                  />
                </div>
              </div>

              <footer className="modal-footer" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button
                  type="button"
                  className="btn-elevated"
                  onClick={() => {
                    setDecisionModalOpen(false);
                    setActiveRequest(null);
                  }}
                  style={{ minHeight: '40px', padding: '0 16px' }}
                >
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="btn-filled"
                  style={{
                    minHeight: '40px',
                    padding: '0 16px',
                    backgroundColor: decisionType === 'approved' ? 'var(--color-success, #16a34a)' : 'var(--color-error, #dc2626)',
                    borderColor: 'transparent',
                    color: 'white',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  {decisionType === 'approved' 
                    ? (lang === 'ar' ? '✓ تأكيد القبول والموافقة' : '✓ Confirm & Approve') 
                    : (lang === 'ar' ? '✗ تأكيد الرفض' : '✗ Confirm Rejection')
                  }
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
