import { memo } from 'react';
import sloganLogo from '../assets/slogan.jpeg';

const PrintHeader = memo(function PrintHeader({ title, subtitle }) {

  return (
    <div className="printable-only-header" style={{ 
      display: 'none', 
      marginBottom: '24px', 
      borderBottom: '2.5px solid #0f766e', 
      paddingBottom: '16px', 
      direction: 'rtl'
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1.2fr', alignItems: 'center', width: '100%' }}>
        {/* Right Section: Arabic Ministry info */}
        <div style={{ fontSize: '11px', lineHeight: '1.6', textAlign: 'right', color: '#1e293b', fontWeight: 'bold' }}>
          <div>الجمهورية اليمنية</div>
          <div>وزارة التربية و التعليم و البحث العلمي</div>
          <div style={{ fontWeight: '800', fontSize: '12px', color: '#0f766e', marginTop: '2px' }}>رياض و مدارس انوار العلى الدولية النموذجية</div>
        </div>
        
        {/* Center Section: School Logo Slogan */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <img 
            src={sloganLogo} 
            alt="School Logo" 
            style={{ 
              height: '65px', 
              width: '65px', 
              objectFit: 'contain',
              borderRadius: '50%',
              border: '2px solid #0f766e',
              padding: '2px',
              backgroundColor: '#ffffff',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }} 
          />
        </div>

        {/* Left Section: English translation */}
        <div style={{ fontSize: '10px', lineHeight: '1.6', textAlign: 'left', color: '#1e293b', fontWeight: 'bold' }}>
          <div>Republic of Yemen</div>
          <div>Min. of Education & Scientific Research</div>
          <div style={{ fontWeight: '800', fontSize: '11px', color: '#0f766e', marginTop: '2px' }}>Riyadh & Anwar Al-Ola Int. Model Schools</div>
        </div>
      </div>

      {/* Title & Subtitle Banner */}
      <div style={{ textAlign: 'center', marginTop: '14px', borderTop: '1px dashed #cbd5e1', paddingTop: '10px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' }}>
          {title}
        </h2>
        {subtitle && (
          <div style={{ fontSize: '11px', color: '#475569', fontWeight: 'bold' }}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
})

export default PrintHeader;
