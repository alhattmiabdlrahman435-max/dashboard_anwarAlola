import { useState, useEffect, useCallback, useMemo } from 'react';
import { SettingsContext } from './SettingsContext';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../Auth/useAuth';
import { useSubjects } from '../Subjects/useSubjects';
import { settingsService } from '../../services/settings/settings.service';
import { smsBus } from '../../utils/smsBus';

export default function SettingsProvider({ children }) {
  const {
    lang,
    setToastMessage,
    triggerConfirm,
    grades,
    setGrades,
    setDetailedGrades,
    fetchControlGrades,
  } = useApp();
  const { isAuthenticated } = useAuth();
  const { subjects } = useSubjects();

  // Weekly timetables & schedules state
  const [schedules, setSchedules] = useState({});
  // Exam schedules state
  const [examSchedules, setExamSchedules] = useState([]);

  // Digital Control states
  const [isGradesEncrypted, setIsGradesEncrypted] = useState(false);
  const [controlPrefix, setControlPrefix] = useState("SEC-");
  const [controlMultiplier, setControlMultiplier] = useState(3);
  const [controlOffset, setControlOffset] = useState(1000);
  const [controlModulo, setControlModulo] = useState(10000);

  const [loading] = useState(false);

  // Fetch weekly schedules
  const fetchWeeklySchedules = useCallback((token) => {
    const activeToken = token || localStorage.getItem("auth_token");
    if (!activeToken) return;

    settingsService.getSchedules()
      .then((data) => {
        if (data.success && data.schedules && Object.keys(data.schedules).length > 0) {
          setSchedules(data.schedules);
        }
      })
      .catch((err) => console.error("Error fetching weekly schedules:", err));
  }, []);

  // Fetch exam schedules
  const fetchExamSchedules = useCallback((token) => {
    const activeToken = token || localStorage.getItem("auth_token");
    if (!activeToken) return;

    settingsService.getExamSchedules()
      .then((data) => {
        if (data.success) {
          const mapped = data.exam_schedules.map((sch) => {
            const classObj = sch.class || {};
            const subs = (sch.subjects || []).map((sub) => ({
              id: sub.id,
              subjectName: sub.name_ar,
              date: sub.exam_date,
              time: sub.exam_time,
              note: sub.note || "",
            }));

            return {
              id: sch.id,
              grade: classObj.grade_ar || "",
              section: classObj.section_ar || "",
              term: sch.term === "term1" ? "الفصل الأول" : (sch.term === "term2" ? "الفصل الثاني" : sch.term),
              termEn: sch.term === "term1" ? "First Term" : (sch.term === "term2" ? "Second Term" : sch.term),
              period: sch.title,
              periodEn: sch.title,
              subjects: subs,
            };
          });
          setExamSchedules(mapped);
        }
      })
      .catch((err) => console.error("Error fetching exam schedules:", err));
  }, []);

  // Publish exam schedule
  const handlePublishExamSchedule = useCallback((newSchedule, studentsList) => {
    const token = localStorage.getItem("auth_token");

    // Resolve term key (term1 / term2)
    const termKey = (newSchedule.term === "الفصل الثاني" || newSchedule.term === "2") ? "term2" : "term1";

    // Mapped subjects array
    const mappedSubjects = newSchedule.subjects.map((sub) => {
      const foundSub = subjects.find(s => s.name === sub.subjectName || s.id === sub.subjectName);
      const subjectId = foundSub ? Number(String(foundSub.id).replace("sub-", "")) : null;
      
      return {
        subject_id: subjectId || 1,
        exam_date: sub.date,
        exam_time: sub.time,
        note: sub.note || "",
      };
    });

    const classStudents = studentsList.filter(
      (s) => s.grade === newSchedule.grade && s.section === newSchedule.section,
    );
    const smsText =
      lang === "ar"
        ? `تم نشر جدول اختبارات جديد (${newSchedule.period} - ${newSchedule.term}) للصف ${newSchedule.grade}. يرجى مراجعته في تطبيق ولي الأمر.`
        : `New exam schedule published (${newSchedule.periodEn} - ${newSchedule.termEn}) for ${newSchedule.grade}. Please review it in the Parent App.`;

    if (token) {
      settingsService.addExamSchedule({
          title: newSchedule.period,
          term: termKey,
          subjects: mappedSubjects,
        })
        .then((data) => {
          if (data.success) {
            fetchExamSchedules(token);
            setToastMessage(
              lang === "ar"
                ? "تم نشر جدول الاختبارات بنجاح!"
                : "Exam schedule published successfully!",
            );
            setTimeout(() => setToastMessage(""), 4000);
            
            classStudents.forEach((student) => {
              smsBus.emit((logs) => [
                {
                  id: Date.now() + Math.random(),
                  studentId: student.id,
                  recipient: student.phone,
                  text: smsText,
                  time: "15:00",
                  type: "present",
                },
                ...logs,
              ]);
            });
          } else {
            setToastMessage(lang === "ar" ? `فشل النشر: ${data.message}` : `Publish failed: ${data.message}`);
            setTimeout(() => setToastMessage(""), 6000);
          }
        })
        .catch((err) => {
          console.error("Error storing exam schedule:", err);
          setToastMessage(lang === "ar" ? `خطأ: ${err.message}` : `Error: ${err.message}`);
          setTimeout(() => setToastMessage(""), 6000);
        });
    } else {
      setExamSchedules((prev) => [newSchedule, ...prev]);
      setToastMessage(
        lang === "ar"
          ? "تم نشر جدول الاختبارات بنجاح!"
          : "Exam schedule published successfully!",
      );
      setTimeout(() => setToastMessage(""), 3000);
    }
  }, [subjects, lang, setToastMessage, fetchExamSchedules]);

  // Update exam schedule
  const handleUpdateExamSchedule = useCallback((id, updatedSchedule) => {
    const token = localStorage.getItem("auth_token");

    // Resolve term key (term1 / term2)
    const termKey = (updatedSchedule.term === "الفصل الثاني" || updatedSchedule.term === "2") ? "term2" : "term1";

    // Mapped subjects array
    const mappedSubjects = updatedSchedule.subjects.map((sub) => {
      const foundSub = subjects.find(s => s.name === sub.subjectName || s.id === sub.subjectName);
      const subjectId = foundSub ? Number(String(foundSub.id).replace("sub-", "")) : null;
      
      return {
        subject_id: subjectId || 1,
        exam_date: sub.date,
        exam_time: sub.time,
        note: sub.note || "",
      };
    });

    if (token) {
      settingsService.editExamSchedule(id, {
          title: updatedSchedule.period,
          term: termKey,
          subjects: mappedSubjects,
        })
        .then((data) => {
          if (data.success) {
            fetchExamSchedules(token);
            setToastMessage(
              lang === "ar"
                ? "تم تحديث جدول الاختبارات بنجاح!"
                : "Exam schedule updated successfully!",
            );
            setTimeout(() => setToastMessage(""), 4000);
          } else {
            setToastMessage(lang === "ar" ? `فشل التحديث: ${data.message}` : `Update failed: ${data.message}`);
            setTimeout(() => setToastMessage(""), 6000);
          }
        })
        .catch((err) => {
          console.error("Error updating exam schedule:", err);
          setToastMessage(lang === "ar" ? `خطأ: ${err.message}` : `Error: ${err.message}`);
          setTimeout(() => setToastMessage(""), 6000);
        });
    } else {
      setExamSchedules((prev) =>
        prev.map((sch) => (sch.id === id ? { ...sch, ...updatedSchedule } : sch))
      );
      setToastMessage(
        lang === "ar"
          ? "تم تحديث جدول الاختبارات بنجاح!"
          : "Exam schedule updated successfully!",
      );
      setTimeout(() => setToastMessage(""), 3000);
    }
  }, [subjects, lang, setToastMessage, fetchExamSchedules]);

  // Delete exam schedule
  const handleDeleteExamSchedule = useCallback((id) => {
    const token = localStorage.getItem("auth_token");
    triggerConfirm({
      title: lang === 'ar' ? 'حذف جدول الاختبارات' : 'Delete Exam Schedule',
      message: lang === 'ar' ? 'هل أنت متأكد من حذف هذا الجدول نهائياً؟' : 'Are you sure you want to permanently delete this schedule?',
      onConfirm: () => {
        if (token) {
          settingsService.deleteExamSchedule(id)
            .then((data) => {
              if (data.success) {
                setExamSchedules((prev) => prev.filter((sch) => sch.id !== id));
                setToastMessage(
                  lang === "ar"
                    ? "تم حذف جدول الاختبارات بنجاح"
                    : "Exam schedule deleted successfully",
                );
                setTimeout(() => setToastMessage(""), 4000);
              } else {
                setToastMessage(lang === "ar" ? `فشل الحذف: ${data.message}` : `Delete failed: ${data.message}`);
                setTimeout(() => setToastMessage(""), 6000);
              }
            })
            .catch((err) => {
              console.error("Error deleting exam schedule:", err);
              setToastMessage(lang === "ar" ? `خطأ: ${err.message}` : `Error: ${err.message}`);
              setTimeout(() => setToastMessage(""), 6000);
            });
        } else {
          setExamSchedules((prev) => prev.filter((sch) => sch.id !== id));
          setToastMessage(
            lang === "ar"
              ? "تم حذف جدول الاختبارات بنجاح"
              : "Exam schedule deleted successfully",
          );
          setTimeout(() => setToastMessage(""), 3000);
        }
      }
    });
  }, [lang, setToastMessage, triggerConfirm]);

  // Handle weekly schedule changes
  const handleScheduleChange = useCallback((
    dayKey,
    periodIdx,
    val,
    selectedScheduleGrade
  ) => {
    setSchedules((prev) => {
      const gradeSchedule = { ...prev[selectedScheduleGrade] };
      const dayClasses = [...(gradeSchedule[dayKey] || [])];
      dayClasses[periodIdx] = val;
      gradeSchedule[dayKey] = dayClasses;

      const token = localStorage.getItem("auth_token");
      if (token) {
        settingsService.saveSchedules({
            class_name: selectedScheduleGrade,
            schedule: gradeSchedule,
          })
          .then((data) => {
            if (!data.success) {
              console.error("Failed to save schedule to backend:", data.message);
              setToastMessage(
                lang === "ar"
                  ? `فشل حفظ التعديل: ${data.message || ""}`
                  : `Failed to save changes: ${data.message || ""}`
              );
              setTimeout(() => setToastMessage(""), 5000);
            }
          })
          .catch((err) => {
            console.error("Error saving schedule to backend:", err);
            setToastMessage(
              lang === "ar"
                ? `فشل حفظ التعديل: ${err.message || ""}`
                : `Failed to save changes: ${err.message || ""}`
            );
            setTimeout(() => setToastMessage(""), 5000);
          });
      }

      return { ...prev, [selectedScheduleGrade]: gradeSchedule };
    });
  }, [lang, setToastMessage]);

  // Calculate secret codes cryptography
  const handleCalculateSecretCodes = useCallback(() => {
    const token = localStorage.getItem("auth_token");

    if (token) {
      settingsService.generateControlCodes({
          prefix: controlPrefix,
          multiplier: Number(controlMultiplier),
          offset: Number(controlOffset),
          modulo: Number(controlModulo),
        })
        .then((data) => {
          if (data.success) {
            fetchControlGrades(token);
            setIsGradesEncrypted(true);
            setToastMessage(
              lang === "ar"
                ? "تم توليد الأرقام السرية وتشفير الكشف بنجاح!"
                : "Secret codes generated and grading sheet encrypted successfully!"
            );
            setTimeout(() => setToastMessage(""), 4000);
          } else {
            setToastMessage(lang === "ar" ? `فشل توليد الأرقام السرية: ${data.message}` : `Failed to generate secret codes: ${data.message}`);
            setTimeout(() => setToastMessage(""), 6000);
          }
        })
        .catch((err) => {
          console.error("Error generating secret codes:", err);
          setToastMessage(lang === "ar" ? `خطأ: ${err.message}` : `Error: ${err.message}`);
          setTimeout(() => setToastMessage(""), 6000);
        });
    } else {
      setGrades((prev) =>
        prev.map((row) => {
          const calculatedCode =
            row.studentId * Number(controlMultiplier) + Number(controlOffset);
          return { ...row, secretCode: calculatedCode.toString() };
        })
      );
      setIsGradesEncrypted(true);
      setToastMessage(
        lang === "ar"
          ? "تم توليد الأرقام السرية وتشفير الكشف بنجاح!"
          : "Secret codes generated and grading sheet encrypted successfully!"
      );
      setTimeout(() => setToastMessage(""), 3000);
    }
  }, [controlPrefix, controlMultiplier, controlOffset, controlModulo, lang, setToastMessage, fetchControlGrades, setGrades]);

  // Enter grade by secret code
  const handleEnterGradeBySecretCode = useCallback((
    secretCodeInput,
    secretGradeInput,
    secretSubjectInput,
    secretTermInput,
    studentsList
  ) => {
    const token = localStorage.getItem("auth_token");
    const valNum = Math.min(30, Math.max(0, parseFloat(secretGradeInput) || 0));
    const studentGradeRow = grades.find(
      (g) => g.secretCode === secretCodeInput.trim()
    );
    if (!studentGradeRow) {
      setToastMessage(
        lang === "ar"
          ? "عذراً، الرقم السري غير صحيح أو غير موجود!"
          : "Sorry, secret code is incorrect or not found!"
      );
      setTimeout(() => setToastMessage(""), 3000);
      return false;
    }

    const studentId = studentGradeRow.studentId;

    setDetailedGrades((prev) => {
      let studentRecord = prev.find((r) => r.studentId === studentId);
      if (!studentRecord) {
        const student = studentsList.find((s) => s.id === studentId);
        const defaultDetailedGradeObj = (hw, att, beh, oral, wr, exam) => ({
          m1: { homework: hw, attendance: att, behavior: beh, oral: oral, written: wr },
          m2: { homework: hw, attendance: att, behavior: beh, oral: oral, written: wr },
          m3: { homework: hw, attendance: att, behavior: beh, oral: oral, written: wr },
          finalExam: exam
        });
        studentRecord = {
          studentId,
          studentName: student ? student.name : "",
          grades: {
            term1: {
              الرياضيات: defaultDetailedGradeObj(0, 0, 0, 0, 0, 0),
              العلوم: defaultDetailedGradeObj(0, 0, 0, 0, 0, 0),
              "اللغة العربية": defaultDetailedGradeObj(0, 0, 0, 0, 0, 0),
              "اللغة الإنجليزية": defaultDetailedGradeObj(0, 0, 0, 0, 0, 0),
            },
            term2: {
              الرياضيات: defaultDetailedGradeObj(0, 0, 0, 0, 0, 0),
              العلوم: defaultDetailedGradeObj(0, 0, 0, 0, 0, 0),
              "اللغة العربية": defaultDetailedGradeObj(0, 0, 0, 0, 0, 0),
              "اللغة الإنجليزية": defaultDetailedGradeObj(0, 0, 0, 0, 0, 0),
            },
          },
        };
        prev = [...prev, studentRecord];
      }

      const updatedList = prev.map((r) => {
        if (r.studentId === studentId) {
          const updatedGrades = { ...r.grades };
          const termGrades = { ...updatedGrades[secretTermInput] };
          const subjectGrades = { ...termGrades[secretSubjectInput] };

          subjectGrades.finalExam = valNum;

          termGrades[secretSubjectInput] = subjectGrades;
          updatedGrades[secretTermInput] = termGrades;
          return { ...r, grades: updatedGrades };
        }
        return r;
      });

      const record = updatedList.find((r) => r.studentId === studentId);
      const subjectsMap = {
        الرياضيات: "math",
        العلوم: "science",
        "اللغة العربية": "arabic",
        "اللغة الإنجليزية": "english",
      };

      setGrades((prevGrades) =>
        prevGrades.map((row) => {
          if (row.studentId === studentId) {
            const updatedRow = { ...row };
            const defaultDetailedGradeObj = (hw, att, beh, oral, wr, exam) => ({
              m1: { homework: hw, attendance: att, behavior: beh, oral: oral, written: wr },
              m2: { homework: hw, attendance: att, behavior: beh, oral: oral, written: wr },
              m3: { homework: hw, attendance: att, behavior: beh, oral: oral, written: wr },
              finalExam: exam
            });
            Object.keys(subjectsMap).forEach((subName) => {
              const field = subjectsMap[subName];

              const t1 =
                record.grades.term1[subName] ||
                defaultDetailedGradeObj(0, 0, 0, 0, 0, 0);
              const t1_m1 =
                t1.m1.homework +
                t1.m1.attendance +
                t1.m1.behavior +
                t1.m1.oral +
                t1.m1.written;
              const t1_m2 =
                t1.m2.homework +
                t1.m2.attendance +
                t1.m2.behavior +
                t1.m2.oral +
                t1.m2.written;
              const t1_m3 =
                t1.m3.homework +
                t1.m3.attendance +
                t1.m3.behavior +
                t1.m3.oral +
                t1.m3.written;
              const t1_avg = (t1_m1 + t1_m2 + t1_m3) / 15;
              const t1_total = t1_avg + t1.finalExam;

              const t2 =
                record.grades.term2[subName] ||
                defaultDetailedGradeObj(0, 0, 0, 0, 0, 0);
              const t2_m1 =
                t2.m1.homework +
                t2.m1.attendance +
                t2.m1.behavior +
                t2.m1.oral +
                t2.m1.written;
              const t2_m2 =
                t2.m2.homework +
                t2.m2.attendance +
                t2.m2.behavior +
                t2.m2.oral +
                t2.m2.written;
              const t2_m3 =
                t2.m3.homework +
                t2.m3.attendance +
                t2.m3.behavior +
                t2.m3.oral +
                t2.m3.written;
              const t2_avg = (t2_m1 + t2_m2 + t2_m3) / 15;
              const t2_total = t2_avg + t2.finalExam;

              const yearly = Math.round(t1_total + t2_total);
              updatedRow[field] = yearly;
            });
            return updatedRow;
          }
          return row;
        })
      );

      return updatedList;
    });

    if (token) {
      const foundSub = subjects.find(
        (s) => s.name === secretSubjectInput || s.id === secretSubjectInput
      );
      const subjectId = foundSub ? Number(String(foundSub.id).replace("sub-", "")) : null;

      if (subjectId) {
        settingsService.saveDetailedGrade({
            student_id: Number(studentId),
            subject_id: subjectId,
            term: secretTermInput === "term1" ? "1" : "2",
            month: "final",
            final_exam: valNum,
          })
          .catch((err) => console.error("Error saving grade via secret code:", err));
      }
    }

    setToastMessage(
      lang === "ar"
        ? `تم رصد الدرجة (${valNum}/30) لمادة ${secretSubjectInput} بنجاح للطالب ذو الرقم السري: ${secretCodeInput}`
        : `Successfully entered grade (${valNum}/30) for subject ${secretSubjectInput} (Secret Code: ${secretCodeInput})`
    );
    setTimeout(() => setToastMessage(""), 4000);
    return true;
  }, [grades, lang, setToastMessage, subjects, setGrades, setDetailedGrades]);

  useEffect(() => {
    if (isAuthenticated) {
      const token = localStorage.getItem("auth_token");
      fetchWeeklySchedules(token);
      fetchExamSchedules(token);
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSchedules({});
      setExamSchedules([]);
    }
  }, [isAuthenticated, fetchWeeklySchedules, fetchExamSchedules]);

  const settingsContextValue = useMemo(() => ({
    schedules,
    setSchedules,
    examSchedules,
    setExamSchedules,
    isGradesEncrypted,
    setIsGradesEncrypted,
    controlPrefix,
    setControlPrefix,
    controlMultiplier,
    setControlMultiplier,
    controlOffset,
    setControlOffset,
    controlModulo,
    setControlModulo,
    loading,
    fetchWeeklySchedules,
    fetchExamSchedules,
    handlePublishExamSchedule,
    handleUpdateExamSchedule,
    handleDeleteExamSchedule,
    handleScheduleChange,
    handleCalculateSecretCodes,
    handleEnterGradeBySecretCode,
  }), [
    schedules,
    examSchedules,
    isGradesEncrypted,
    controlPrefix,
    controlMultiplier,
    controlOffset,
    controlModulo,
    loading,
    fetchWeeklySchedules,
    fetchExamSchedules,
    handlePublishExamSchedule,
    handleUpdateExamSchedule,
    handleDeleteExamSchedule,
    handleScheduleChange,
    handleCalculateSecretCodes,
    handleEnterGradeBySecretCode,
  ]);

  return (
    <SettingsContext.Provider value={settingsContextValue}>
      {children}
    </SettingsContext.Provider>
  );
}
