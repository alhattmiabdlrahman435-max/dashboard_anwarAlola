import { memo } from 'react';
import sloganLogo from '../assets/slogan.jpeg';

const PrintHeader = memo(function PrintHeader({ title, subtitle, scopeRight, scopeLeft }) {
  return (
    <div className="sr-official-print-header" style={{
      marginBottom: '16px',
      direction: 'rtl'
    }}>
      {/* 3-Column Official Ministry Header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr 1.2fr',
        alignItems: 'center',
        width: '100%',
        paddingBottom: '12px',
        borderBottom: '2px solid #1e3a8a'
      }}>
        {/* Right Section: Arabic Ministry info */}
        <div style={{ fontSize: '11.5px', lineHeight: '1.6', textAlign: 'right', color: '#0f172a', fontWeight: 'bold' }}>
          <div>الجمهورية اليمنية</div>
          <div>وزارة التربية والتعليم و البحث العلمي</div>
          <div style={{ fontWeight: '800', fontSize: '12.5px', color: '#1e3a8a', marginTop: '2px' }}>
            رياض و مدارس انوار العلى الدولية النموذجية
          </div>
        </div>
        
        {/* Center Section: School Logo Slogan */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <img 
            src={sloganLogo} 
            alt="School Logo" 
            style={{ 
              height: '62px', 
              width: '62px', 
              objectFit: 'contain',
              borderRadius: '50%',
              border: '2px solid #1e3a8a',
              padding: '2px',
              backgroundColor: '#ffffff',
              boxShadow: '0 2px 4px rgba(0,0,0,0.08)'
            }} 
          />
        </div>

        {/* Left Section: English translation */}
        <div style={{ fontSize: '10.5px', lineHeight: '1.6', textAlign: 'left', color: '#0f172a', fontWeight: 'bold', direction: 'ltr' }}>
          <div>Republic of Yemen</div>
          <div>Min. of Education & Scientific Research</div>
          <div style={{ fontWeight: '800', fontSize: '11.5px', color: '#1e3a8a', marginTop: '2px' }}>
            Riyadh & Anwar Al-Ola Int. Model Schools
          </div>
        </div>
      </div>

      {/* Main Title & Subtitle Banner */}
      <div style={{ textAlign: 'center', marginTop: '12px', paddingBottom: '10px' }}>
        <h2 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' }}>
          {title}
        </h2>
        {subtitle && (
          <div style={{ fontSize: '12px', color: '#334155', fontWeight: '700' }}>
            {subtitle}
          </div>
        )}
      </div>

      {/* Sub-header Scope Row */}
      {(scopeRight || scopeLeft) && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '11.5px',
          fontWeight: '700',
          color: '#1e293b',
          padding: '6px 4px',
          borderTop: '1px solid #cbd5e1',
          borderBottom: '1px solid #cbd5e1',
          marginTop: '6px',
          backgroundColor: '#f8fafc'
        }}>
          <div>{scopeRight}</div>
          <div>{scopeLeft}</div>
        </div>
      )}
    </div>
  );
});

export default PrintHeader;
