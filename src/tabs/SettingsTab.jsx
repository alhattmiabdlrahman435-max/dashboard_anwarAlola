import React from 'react';
import { useApp } from '../context/AppContext';

export default function SettingsTab() {
  const {
    lang,
    setLang,
    t,
    darkMode,
    setDarkMode,
    availableGrades,
    availableSections,
    handleAddGrade,
    handleRemoveGrade,
    handleAddSection,
    handleRemoveSection
  } = useApp();

  return (
    <div className="section-card no-print">
      <h3 className="headline-small" style={{ fontSize: '18px', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-sm)' }}>
        {t.settingsTitle}
      </h3>

      <div className="settings-grid">
        
        {/* Language config */}
        <div className="settings-row">
          <div className="settings-info">
            <span className="settings-label">{t.languageLabel}</span>
            <span className="settings-desc">
              {lang === 'ar' ? 'تغيير لغة لوحة التحكم بالكامل' : 'Change dashboard interface language'}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className={`chip ${lang === 'ar' ? 'selected' : ''}`}
              onClick={() => setLang('ar')}
            >
              العربية
            </button>
            <button 
              className={`chip ${lang === 'en' ? 'selected' : ''}`}
              onClick={() => setLang('en')}
            >
              English
            </button>
          </div>
        </div>

        {/* Theme Mode Config */}
        <div className="settings-row">
          <div className="settings-info">
            <span className="settings-label">{t.themeLabel}</span>
            <span className="settings-desc">
              {lang === 'ar' ? 'تفعيل الوضع الداكن لتقليل إجهاد العين' : 'Enable dark theme mode'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="label-medium">{t.lightMode}</span>
            <label className="switch">
              <input 
                type="checkbox" 
                checked={darkMode}
                onChange={(e) => setDarkMode(e.target.checked)}
              />
              <span className="slider"></span>
            </label>
            <span className="label-medium">{t.darkMode}</span>
          </div>
        </div>

        {/* School Profile Setup */}
        <div style={{ marginTop: 'var(--space-sm)' }}>
          <h4 className="settings-section-title">{t.schoolConfig}</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', marginTop: 'var(--space-md)' }}>
            <div className="form-group">
              <label className="form-label">{t.schoolNameLabel}</label>
              <input 
                type="text" 
                className="text-field" 
                value={lang === 'ar' ? 'رياض و مدارس انوار العلى الدولية النموذجية' : 'Riyadh & Anwar Al-Ola International Model Schools'} 
                disabled
              />
            </div>
            <div className="form-group">
              <label className="form-label">{t.schoolType}</label>
              <input 
                type="text" 
                className="text-field" 
                value={lang === 'ar' ? 'تعليم نموذجي دولي' : 'International Model Education'} 
                disabled
              />
            </div>
          </div>
        </div>

        {/* Available Classes & Sections manager */}
        <div style={{ marginTop: 'var(--space-md)', paddingTop: 'var(--space-md)', borderTop: '1px solid var(--color-border)' }}>
          <h4 className="settings-section-title">{lang === 'ar' ? 'إدارة الصفوف والشُّعب الدراسية' : 'Manage Grades & Sections'}</h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)', marginTop: 'var(--space-md)' }}>
            
            {/* Grades Manager */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span className="body-medium" style={{ fontWeight: 'bold', color: 'var(--color-primary-ui)' }}>
                🏫 {lang === 'ar' ? 'الصفوف الدراسية الفعالة' : 'Active Grade Levels'}
              </span>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input 
                  type="text" 
                  id="new-grade-input-box"
                  className="text-field"
                  placeholder={lang === 'ar' ? 'مثال: الصف الرابع' : 'e.g. Grade 4'}
                  style={{ height: '38px', padding: '0 var(--space-md)', fontSize: '13px' }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddGrade(e.target.value);
                      e.target.value = '';
                    }
                  }}
                />
                <button 
                  className="btn-filled"
                  style={{ height: '38px', padding: '0 16px', fontSize: '13px' }}
                  onClick={() => {
                    const inp = document.getElementById('new-grade-input-box');
                    if (inp) {
                      handleAddGrade(inp.value);
                      inp.value = '';
                    }
                  }}
                >
                  {lang === 'ar' ? 'إضافة' : 'Add'}
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '160px', overflowY: 'auto', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-chip)', padding: '8px', backgroundColor: 'var(--color-surface)' }}>
                {availableGrades.map(g => (
                  <div key={g} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', padding: '4px 8px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                    <span>{g}</span>
                    <button 
                      style={{ background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}
                      onClick={() => handleRemoveGrade(g)}
                      title={lang === 'ar' ? 'حذف الصف' : 'Delete grade'}
                    >
                      ✗
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Sections Manager */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span className="body-medium" style={{ fontWeight: 'bold', color: 'var(--color-primary-ui)' }}>
                🗂️ {lang === 'ar' ? 'الشُّعب الدراسية الفعالة' : 'Active Class Sections'}
              </span>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input 
                  type="text" 
                  id="new-section-input-box"
                  className="text-field"
                  placeholder={lang === 'ar' ? 'مثال: د' : 'e.g. D'}
                  style={{ height: '38px', padding: '0 var(--space-md)', fontSize: '13px' }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddSection(e.target.value);
                      e.target.value = '';
                    }
                  }}
                />
                <button 
                  className="btn-filled"
                  style={{ height: '38px', padding: '0 16px', fontSize: '13px' }}
                  onClick={() => {
                    const inp = document.getElementById('new-section-input-box');
                    if (inp) {
                      handleAddSection(inp.value);
                      inp.value = '';
                    }
                  }}
                >
                  {lang === 'ar' ? 'إضافة' : 'Add'}
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '160px', overflowY: 'auto', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-chip)', padding: '8px', backgroundColor: 'var(--color-surface)' }}>
                {availableSections.map(s => (
                  <div key={s} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', padding: '4px 8px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                    <span>{s}</span>
                    <button 
                      style={{ background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}
                      onClick={() => handleRemoveSection(s)}
                      title={lang === 'ar' ? 'حذف الشعبة' : 'Delete section'}
                    >
                      ✗
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
