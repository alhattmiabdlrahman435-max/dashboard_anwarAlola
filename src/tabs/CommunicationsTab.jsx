import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X } from 'lucide-react';

export default function CommunicationsTab() {
  const {
    lang,
    t,
    students,
    teachers,
    notifications,
    availableGrades,
    handleSendNotification
  } = useApp();

  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [modalNotificationType, setModalNotificationType] = useState('parents');
  const [modalNotificationStudentId, setModalNotificationStudentId] = useState(
    students.length > 0 ? students[0].id : ''
  );
  const [modalNotificationGrade, setModalNotificationGrade] = useState(
    availableGrades.length > 0 ? availableGrades[0] : ''
  );
  const [modalNotificationTeacherId, setModalNotificationTeacherId] = useState(
    teachers.length > 0 ? teachers[0].id : ''
  );
  const [modalNotificationTitle, setModalNotificationTitle] = useState('');
  const [modalNotificationContent, setModalNotificationContent] = useState('');

  const onSendNotificationSubmit = (e) => {
    e.preventDefault();
    if (!modalNotificationTitle.trim() || !modalNotificationContent.trim()) {
      return;
    }

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    
    let extraDetails = {};
    if (modalNotificationType === 'student') {
      const targetStudent = students.find(s => s.id === Number(modalNotificationStudentId));
      extraDetails = {
        studentId: Number(modalNotificationStudentId),
        studentName: targetStudent ? targetStudent.name : null,
        studentNameEn: targetStudent ? targetStudent.nameEn : null
      };
    } else if (modalNotificationType === 'class') {
      extraDetails = {
        grade: modalNotificationGrade
      };
    } else if (modalNotificationType === 'teacher') {
      const targetTeacher = teachers.find(t => t.id === Number(modalNotificationTeacherId));
      extraDetails = {
        teacherId: Number(modalNotificationTeacherId),
        teacherName: targetTeacher ? targetTeacher.name : null,
        teacherNameEn: targetTeacher ? targetTeacher.nameEn : null
      };
    }

    const newNotification = {
      id: Date.now(),
      title: modalNotificationTitle,
      content: modalNotificationContent,
      date: nowStr,
      type: modalNotificationType,
      ...extraDetails
    };

    // Calculate extra SMS logs to pass
    const extraLogs = [];
    if (modalNotificationType === 'student') {
      const targetStudent = students.find(s => s.id === Number(modalNotificationStudentId));
      if (targetStudent) {
        const smsText = lang === 'ar'
          ? `تنبيه خاص بخصوص ابنكم ${targetStudent.name}: ${modalNotificationTitle} - ${modalNotificationContent}. رياض و مدارس انوار العلى.`
          : `Private alert for ${targetStudent.nameEn}: ${modalNotificationTitle} - ${modalNotificationContent}. Riyadh & Anwar Al-Ola.`;
        extraLogs.push({
          id: Date.now(),
          studentId: targetStudent.id,
          recipient: targetStudent.phone,
          text: smsText,
          time: nowStr.split(' ')[1],
          type: 'present'
        });
      }
    } else if (modalNotificationType === 'class') {
      const classStudents = students.filter(s => s.grade === modalNotificationGrade);
      classStudents.forEach((student, idx) => {
        const smsText = lang === 'ar'
          ? `تعميم لصف ${modalNotificationGrade}: ${modalNotificationTitle} - ${modalNotificationContent}.`
          : `Class announcement for ${modalNotificationGrade}: ${modalNotificationTitle} - ${modalNotificationContent}.`;
        extraLogs.push({
          id: Date.now() + Math.random() + idx,
          studentId: student.id,
          recipient: student.phone,
          text: smsText,
          time: nowStr.split(' ')[1],
          type: 'present'
        });
      });
    } else if (modalNotificationType === 'parents') {
      students.forEach((student, idx) => {
        const smsText = lang === 'ar'
          ? `إشعار عام من المدرسة لأولياء الأمور: ${modalNotificationTitle} - ${modalNotificationContent}.`
          : `Broadcast Announcement to Parents: ${modalNotificationTitle} - ${modalNotificationContent}.`;
        extraLogs.push({
          id: Date.now() + Math.random() + idx,
          studentId: student.id,
          recipient: student.phone,
          text: smsText,
          time: nowStr.split(' ')[1],
          type: 'present'
        });
      });
    }

    handleSendNotification(newNotification, extraLogs);

    // Reset states
    setShowNotificationModal(false);
    setModalNotificationTitle('');
    setModalNotificationContent('');
  };

  return (
    <div className="section-card">
      <div className="section-card-header no-print">
        <h3 className="section-card-title headline-small" style={{ fontSize: '18px' }}>
          💬 {t.communicationsTitle}
        </h3>
        
        <button 
          className="btn-accent"
          onClick={() => setShowNotificationModal(true)}
        >
          ✉️ {lang === 'ar' ? 'إنشاء وإرسال إشعار' : 'Compose Notification'}
        </button>
      </div>

      {/* Informative Subtitle Banner */}
      <div style={{
        padding: 'var(--space-md) var(--space-lg)',
        backgroundColor: 'rgba(30, 80, 142, 0.05)',
        borderInlineStart: '4px solid var(--color-primary-ui)',
        borderRadius: 'var(--radius-chip)',
        fontSize: '13px',
        color: 'var(--color-text-primary)',
        marginBottom: 'var(--space-lg)',
        lineHeight: '1.6'
      }} className="no-print">
        📢 {lang === 'ar' 
          ? 'هذه المنصة مخصصة لإدارة وإرسال الإشعارات والتعاميم الفورية من إدارة المدرسة مباشرة إلى أولياء الأمور أو المعلمين (عام، حسب الصف الدراسي، أو خاص بطالب محدد).' 
          : 'This platform is dedicated to managing and sending instant notifications and circulars from the school administration directly to parents or teachers (general, by class, or private to a specific student).'}
      </div>

      {/* History log list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        <h4 style={{ fontSize: '15px', fontWeight: 'bold', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
          📤 {t.notificationsHistoryTitle}
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {notifications.length > 0 ? (
            notifications.map(notif => {
              const getBorderColor = () => {
                if (notif.type === 'general' || notif.type === 'parents') return '4px solid var(--color-primary-ui)';
                if (notif.type === 'class') return '4px solid var(--color-warning)';
                if (notif.type === 'student' || notif.type === 'private') return '4px solid var(--color-error)';
                if (notif.type === 'teachers') return '4px solid var(--color-success)';
                if (notif.type === 'teacher') return '4px solid #0f766e';
                return '1.5px solid var(--color-border)';
              };

              return (
                <div 
                  key={notif.id}
                  className="notification-item-card"
                  style={{
                    padding: 'var(--space-lg)',
                    backgroundColor: 'var(--color-surface-alt)',
                    border: '1px solid var(--color-border)',
                    borderInlineStart: getBorderColor(),
                    borderRadius: 'var(--radius-card)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '14px', color: 'var(--color-text-primary)' }}>📢 {notif.title}</strong>
                    {(() => {
                      let badgeClass = 'reached';
                      let badgeLabel = '';
                      let icon = '📢';

                      if (notif.type === 'general' || notif.type === 'parents') {
                        badgeClass = 'reached';
                        badgeLabel = lang === 'ar' ? 'جميع أولياء الأمور' : 'All Parents';
                        icon = '📢';
                      } else if (notif.type === 'class') {
                        badgeClass = 'on-bus';
                        badgeLabel = lang === 'ar' ? `الصف: ${notif.grade}` : `Class: ${notif.grade}`;
                        icon = '🏫';
                      } else if (notif.type === 'student' || notif.type === 'private') {
                        badgeClass = 'absent';
                        badgeLabel = lang === 'ar' ? `طالب: ${notif.studentName}` : `Student: ${notif.studentNameEn || notif.studentName}`;
                        icon = '👨‍🎓';
                      } else if (notif.type === 'teachers') {
                        badgeClass = 'checked-in';
                        badgeLabel = lang === 'ar' ? 'جميع المعلمين' : 'All Teachers';
                        icon = '👨‍🏫';
                      } else if (notif.type === 'teacher') {
                        badgeClass = 'checked-in';
                        badgeLabel = lang === 'ar' ? `المعلم: ${notif.teacherName}` : `Teacher: ${notif.teacherNameEn || notif.teacherName}`;
                        icon = '🧑‍🏫';
                      }

                      return (
                        <span className={`badge-status ${badgeClass}`} style={{ fontSize: '11px', padding: '4px 10px', gap: '4px', display: 'inline-flex', alignItems: 'center' }}>
                          <span>{icon}</span>
                          <span>{badgeLabel}</span>
                        </span>
                      );
                    })()}
                  </div>
                  
                  <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: '4px 0 10px 0', lineHeight: '1.4' }}>
                    {notif.content}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-text-secondary)', borderTop: '1px dashed var(--color-border)', paddingTop: '6px' }}>
                    <span>🕒 {notif.date}</span>
                    <span>✓ {lang === 'ar' ? 'تم الإرسال كإشعار فوري' : 'Sent via Push Notification'}</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-secondary)', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-card)' }}>
              📨 {t.noNotifications}
            </div>
          )}
        </div>
      </div>

      {/* MODAL DIALOG: COMPOSE NOTIFICATION */}
      {showNotificationModal && (
        <div className="modal-overlay no-print">
          <div className="modal-container" style={{ maxWidth: '600px' }}>
            <header className="modal-header">
              <h3 className="modal-title">📨 {lang === 'ar' ? 'إنشاء وإرسال إشعار فوري' : 'Compose Pushed Announcement'}</h3>
              <button 
                className="modal-close-btn" 
                onClick={() => setShowNotificationModal(false)}
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </header>

            <form onSubmit={onSendNotificationSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                
                {/* Target Audience Select */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>{t.targetLabel}</label>
                  <select
                    value={modalNotificationType}
                    onChange={(e) => setModalNotificationType(e.target.value)}
                    className="text-field"
                    style={{ minHeight: '42px' }}
                  >
                    <option value="parents">👨‍👩‍👧‍👦 {t.targetAllParents}</option>
                    <option value="class">🏫 {t.targetByClass}</option>
                    <option value="student">👨‍🎓 {t.targetByStudent}</option>
                    <option value="teachers">👨‍🏫 {t.targetAllTeachers}</option>
                    <option value="teacher">🧑‍🏫 {t.targetSpecificTeacher}</option>
                  </select>
                </div>

                {/* Target Student Selector (if student) */}
                {modalNotificationType === 'student' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 'bold' }}>{t.selectStudent}</label>
                    <select 
                      value={modalNotificationStudentId} 
                      onChange={(e) => setModalNotificationStudentId(Number(e.target.value))}
                      className="text-field"
                      style={{ minHeight: '42px' }}
                    >
                      {students.map(s => (
                        <option key={s.id} value={s.id}>{lang === 'ar' ? s.name : s.nameEn} ({s.id})</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Target Class Selector (if class) */}
                {modalNotificationType === 'class' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 'bold' }}>{t.selectClass}</label>
                    <select 
                      value={modalNotificationGrade} 
                      onChange={(e) => setModalNotificationGrade(e.target.value)}
                      className="text-field"
                      style={{ minHeight: '42px' }}
                    >
                      {availableGrades.map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Target Teacher Selector (if teacher) */}
                {modalNotificationType === 'teacher' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 'bold' }}>{t.selectTeacher}</label>
                    <select 
                      value={modalNotificationTeacherId} 
                      onChange={(e) => setModalNotificationTeacherId(Number(e.target.value))}
                      className="text-field"
                      style={{ minHeight: '42px' }}
                    >
                      {teachers.map(teach => (
                        <option key={teach.id} value={teach.id}>{lang === 'ar' ? teach.name : teach.nameEn}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Title */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>{t.notificationTitleLabel}</label>
                  <input 
                    type="text" 
                    value={modalNotificationTitle} 
                    onChange={(e) => setModalNotificationTitle(e.target.value)}
                    placeholder={lang === 'ar' ? 'اكتب عنوان الإشعار...' : 'Enter notification title...'}
                    className="text-field"
                    required
                  />
                </div>

                {/* Content */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>{t.notificationContentLabel}</label>
                  <textarea 
                    value={modalNotificationContent} 
                    onChange={(e) => setModalNotificationContent(e.target.value)}
                    placeholder={lang === 'ar' ? 'اكتب نص الرسالة بالكامل...' : 'Enter message body...'}
                    className="text-field"
                    style={{ minHeight: '120px', resize: 'vertical' }}
                    required
                  />
                </div>

              </div>

              <footer className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: 'var(--space-lg) var(--space-xl)', borderTop: '1px solid var(--color-border)' }}>
                <button 
                  type="button" 
                  className="btn-elevated"
                  onClick={() => setShowNotificationModal(false)}
                >
                  {t.cancel}
                </button>
                <button 
                  type="submit" 
                  className="btn-filled"
                >
                  🚀 {lang === 'ar' ? 'إرسال الإشعار وتعميمه' : 'Send Push Alert'}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
