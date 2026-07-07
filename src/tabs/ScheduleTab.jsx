import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { X } from "lucide-react";

const defaultWeekSchedule = {
  saturday: ["", "", "", "", "", ""],
  sunday: ["", "", "", "", "", ""],
  monday: ["", "", "", "", "", ""],
  tuesday: ["", "", "", "", "", ""],
  wednesday: ["", "", "", "", "", ""],
};

export default function ScheduleTab() {
  const {
    lang,
    t,
    classes,
    setClasses,
    subjects,
    schedules,
    setSchedules,
    handleScheduleChange,
    setToastMessage,
  } = useApp();

  const [selectedScheduleGrade, setSelectedScheduleGrade] = useState(
    classes[0]?.name || "الصف الأول - أ",
  );

  // Local modal state for editing class subjects
  const [showEditSubjectsModal, setShowEditSubjectsModal] = useState(false);
  const [modalClassSubjects, setModalClassSubjects] = useState([]);
  const [selectedClassForEdit, setSelectedClassForEdit] = useState(null);

  React.useEffect(() => {
    if (selectedScheduleGrade && !schedules[selectedScheduleGrade]) {
      setSchedules((prev) => ({
        ...prev,
        [selectedScheduleGrade]: JSON.parse(
          JSON.stringify(defaultWeekSchedule),
        ),
      }));
    }
  }, [selectedScheduleGrade, schedules, setSchedules]);

  const handleOpenEditSubjects = () => {
    const cls = classes.find((c) => c.name === selectedScheduleGrade);
    if (cls) {
      setSelectedClassForEdit(cls);
      setModalClassSubjects(cls.subjects || []);
      setShowEditSubjectsModal(true);
    }
  };

  const handleSaveClassSubjects = (e) => {
    e.preventDefault();
    if (!selectedClassForEdit) return;

    setClasses((prev) =>
      prev.map((c) => {
        if (c.id === selectedClassForEdit.id) {
          return {
            ...c,
            subjects: modalClassSubjects,
          };
        }
        return c;
      }),
    );

    setShowEditSubjectsModal(false);
    setToastMessage(
      lang === "ar"
        ? "تم تحديث مواد الفصل بنجاح!"
        : "Class subjects updated successfully!",
    );
    setTimeout(() => setToastMessage(""), 3000);
  };

  return (
    <div className="section-card">
      <div className="section-card-header no-print">
        <h3
          className="section-card-title headline-small"
          style={{ fontSize: "18px" }}
        >
          {t.scheduleTitle}
        </h3>

        {/* Timetable Class Selector */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          <span className="label-large">
            {lang === "ar" ? "اختر الفصل الدراسي" : "Select Class"}:
          </span>
          <select
            className="text-field"
            style={{
              padding: "8px 32px 8px 16px",
              width: "auto",
              minWidth: "180px",
            }}
            value={selectedScheduleGrade}
            onChange={(e) => setSelectedScheduleGrade(e.target.value)}
          >
            {classes.map((cls) => (
              <option key={cls.id} value={cls.name}>
                {lang === "ar" ? cls.name : cls.nameEn}
              </option>
            ))}
          </select>
          <button
            className="btn-accent"
            style={{
              padding: "8px 12px",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              height: "40px",
              cursor: "pointer",
            }}
            onClick={handleOpenEditSubjects}
          >
            📚 {lang === "ar" ? "تعديل مواد الفصل" : "Edit Class Subjects"}
          </button>
        </div>
      </div>

      <div className="schedule-table-container">
        <table className="schedule-table">
          <thead>
            <tr>
              <th>{t.day}</th>
              <th>
                {t.period} 1 <br />
                <span style={{ fontSize: "11px", fontWeight: "normal" }}>
                  08:00 - 08:45
                </span>
              </th>
              <th>
                {t.period} 2 <br />
                <span style={{ fontSize: "11px", fontWeight: "normal" }}>
                  08:45 - 09:30
                </span>
              </th>
              <th>
                {t.period} 3 <br />
                <span style={{ fontSize: "11px", fontWeight: "normal" }}>
                  09:45 - 10:30
                </span>
              </th>
              <th>
                {t.period} 4 <br />
                <span style={{ fontSize: "11px", fontWeight: "normal" }}>
                  10:30 - 11:15
                </span>
              </th>
              <th>
                {t.period} 5 <br />
                <span style={{ fontSize: "11px", fontWeight: "normal" }}>
                  11:30 - 12:15
                </span>
              </th>
              <th>
                {t.period} 6 <br />
                <span style={{ fontSize: "11px", fontWeight: "normal" }}>
                  12:15 - 01:00
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              // Auto-create schedule for class if it doesn't exist yet
              if (!schedules[selectedScheduleGrade]) {
                return null;
              }
              return [
                "saturday",
                "sunday",
                "monday",
                "tuesday",
                "wednesday",
              ].map((dayKey) => (
                <tr key={dayKey}>
                  <td
                    style={{
                      fontWeight: "700",
                      backgroundColor: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                    }}
                  >
                    {t[dayKey]}
                  </td>
                  {(schedules[selectedScheduleGrade][dayKey] || Array(6).fill("")).map((subject, idx) => {
                      // Find the current class to get its assigned subjects only
                      const currentClassObj = classes.find(
                        (c) => c.name === selectedScheduleGrade,
                      );
                      const classSubjects = currentClassObj
                        ? currentClassObj.subjects || []
                        : [];
                      // Fallback to all subjects if none are assigned to the class yet
                      const subjectsToUse =
                        classSubjects.length > 0
                          ? classSubjects
                          : subjects.map((s) => s.name);
                      const extraOptions = ["نشاط حر", "العلوم"];
                      const allOptionNames = [
                        ...new Set([
                          ...subjectsToUse,
                          ...extraOptions,
                          ...(subject &&
                          !subjectsToUse.includes(subject) &&
                          !extraOptions.includes(subject)
                            ? [subject]
                            : []),
                        ]),
                      ];
                      return (
                        <td key={idx}>
                          <select
                            className="schedule-cell-editor"
                            value={subject}
                            onChange={(e) =>
                              handleScheduleChange(
                                dayKey,
                                idx,
                                e.target.value,
                                selectedScheduleGrade,
                              )
                            }
                            aria-label={`${t[dayKey]} Period ${idx + 1}`}
                          >
                            {allOptionNames.map((optName) => {
                              const subObj = subjects.find(
                                (s) => s.name === optName,
                              );
                              return (
                                <option key={optName} value={optName}>
                                  {lang === "ar"
                                    ? optName
                                    : subObj
                                      ? subObj.nameEn
                                      : optName}
                                </option>
                              );
                            })}
                          </select>
                        </td>
                      );
                    },
                  )}
                </tr>
              ));
            })()}
          </tbody>
        </table>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: "var(--space-md)",
        }}
        className="no-print"
      >
        <button
          className="btn-filled"
          onClick={() => {
            const token = localStorage.getItem("auth_token");
            if (token && schedules[selectedScheduleGrade]) {
              fetch("/api/schedules", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  class_name: selectedScheduleGrade,
                  schedule: schedules[selectedScheduleGrade],
                }),
              })
                .then((res) => res.json())
                .then((data) => {
                  if (data.success) {
                    setToastMessage(
                      lang === "ar"
                        ? "تم حفظ التعديلات على الجدول بنجاح!"
                        : "Timetable changes saved successfully!",
                    );
                  } else {
                    setToastMessage(
                      lang === "ar"
                        ? "فشل حفظ الجدول: " + (data.message || "")
                        : "Failed to save schedule: " + (data.message || ""),
                    );
                  }
                  setTimeout(() => setToastMessage(""), 3000);
                })
                .catch((err) => {
                  console.error("Error saving schedule:", err);
                  setToastMessage(
                    lang === "ar"
                      ? "حدث خطأ أثناء حفظ الجدول"
                      : "Error saving schedule",
                  );
                  setTimeout(() => setToastMessage(""), 3000);
                });
            }
          }}
        >
          💾 {t.saveSchedule}
        </button>
      </div>

      {/* EDIT SUBJECTS MODAL */}
      {showEditSubjectsModal && selectedClassForEdit && (
        <div className="modal-overlay no-print">
          <div className="modal-container" style={{ maxWidth: "500px" }}>
            <header className="modal-header">
              <h3 className="modal-title">
                📚{" "}
                {lang === "ar"
                  ? `تعديل مواد الفصل: ${selectedClassForEdit.name}`
                  : `Edit Subjects for: ${selectedClassForEdit.nameEn || selectedClassForEdit.name}`}
              </h3>
              <button
                className="modal-close-btn"
                onClick={() => setShowEditSubjectsModal(false)}
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </header>
            <form onSubmit={handleSaveClassSubjects}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">
                    {lang === "ar"
                      ? "المواد المقررة للفصل"
                      : "Assigned Subjects"}
                  </label>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "8px",
                      maxHeight: "200px",
                      overflowY: "auto",
                      border: "1px solid var(--color-border)",
                      padding: "12px",
                      borderRadius: "var(--radius-input)",
                    }}
                  >
                    {subjects.map((sub) => (
                      <label
                        key={sub.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "13px",
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={modalClassSubjects.includes(sub.name)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setModalClassSubjects((prev) => [
                                ...prev,
                                sub.name,
                              ]);
                            } else {
                              setModalClassSubjects((prev) =>
                                prev.filter((s) => s !== sub.name),
                              );
                            }
                          }}
                        />
                        {lang === "ar" ? sub.name : sub.nameEn}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <footer className="modal-footer">
                <button
                  type="button"
                  className="btn-elevated"
                  onClick={() => setShowEditSubjectsModal(false)}
                  style={{ height: "48px" }}
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="btn-filled"
                  style={{ height: "48px" }}
                >
                  {t.submit}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
