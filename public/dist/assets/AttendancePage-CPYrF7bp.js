import{t as e}from"./clock-BeTsR9dR.js";import{t}from"./search-DhFeX4vl.js";import{A as n,B as r,J as i,K as a,M as o,V as s,b as c,r as l,t as u,u as d,y as f,z as p}from"./index-c1DpRb1_.js";import{t as ee}from"./useAllowedClasses-n61QO4Fd.js";import{t as te}from"./PrintHeader-CCaUhRBK.js";import{t as ne}from"./sloganBase64-BF9PhYUx.js";var m=i(a(),1),h=s();function g(){let{lang:i,t:a,renderAvatar:s,canAction:g}=p(),{currentUser:_}=r(),{classes:re,availableGrades:ie,availableSections:ae,fetchClasses:oe}=o(),{attendanceRecords:v,handleCellAttendanceChange:y,selectedAttendanceMonth:b,setSelectedAttendanceMonth:x,setAttendanceRosterDate:S,fetchAttendance:C}=n(),{students:w,calculateStudentStats:T,setPrintStudentObject:se,fetchStudents:E}=u(),ce=e=>{if(!e)return;let t=T(e.id),n=(i===`ar`?e.name:e.nameEn)||e.name||`-`,r=e.grade||A||`-`,a=e.section||M||`-`,o=e.nationalId||e.idNumber||e.id||`-`,s=new Date().toLocaleDateString(`ar-EG`,{year:`numeric`,month:`long`,day:`numeric`}),c=(v||[]).filter(t=>String(t.studentId)===String(e.id)&&t.date&&t.date.startsWith(b)).sort((e,t)=>e.date.localeCompare(t.date)),l=[`الأحد`,`الإثنين`,`الثلاثاء`,`الأربعاء`,`الخميس`,`الجمعة`,`السبت`],u=c.length>0?c.map((e,t)=>{let n=new Date(e.date+`T00:00:00`),r=isNaN(n.getTime())?`-`:l[n.getDay()],i=e.status===`present`,a=i?`حاضر`:e.status===`absent`?`غائب`:e.status||`-`,o=i?`color:#15803d;font-weight:800;background:#dcfce7;padding:2px 10px;border-radius:12px;display:inline-block;`:`color:#b91c1c;font-weight:800;background:#fee2e2;padding:2px 10px;border-radius:12px;display:inline-block;`;return`
            <tr>
              <td style="text-align:center;font-weight:700;">${t+1}</td>
              <td style="text-align:center;font-weight:700;">${r}</td>
              <td style="text-align:center;font-family:monospace;font-size:13px;" dir="ltr">${e.date}</td>
              <td style="text-align:center;"><span style="${o}">${a}</span></td>
              <td style="text-align:center;font-family:monospace;" dir="ltr">${e.arrivalTime&&e.arrivalTime!==`-`?e.arrivalTime:`—`}</td>
              <td>${e.excuseReason||``}</td>
            </tr>
          `}).join(``):`<tr><td colspan="6" style="text-align:center;padding:18px;color:#64748b;font-weight:700;">لا توجد سجلات حضور أو غياب مرصودة لهذا الطالب في الشهر المحدد</td></tr>`,d=`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8" />
  <title>تقرير حضور وغياب الطالب - ${n}</title>
  <style>
    @page { size: A4 portrait; margin: 10mm; }
    * { box-sizing: border-box; }
    body {
      font-family: 'Cairo', 'Tajawal', 'Segoe UI', Tahoma, Arial, sans-serif;
      direction: rtl;
      margin: 0;
      padding: 0;
      color: #0f172a;
      background: #fff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .sr-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 3px double #1e3a8a;
      padding-bottom: 10px;
      margin-bottom: 12px;
    }
    .sr-header-col {
      width: 33%;
      font-size: 12px;
      line-height: 1.6;
      font-weight: 700;
      color: #1e293b;
    }
    .sr-header-right { text-align: right; }
    .sr-header-center { text-align: center; display: flex; flex-direction: column; align-items: center; }
    .sr-header-left { text-align: left; direction: ltr; }
    .sr-logo { width: 72px; height: 72px; object-fit: contain; }
    .sr-meta {
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 8px;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 8px 14px;
      margin-bottom: 12px;
      font-size: 12.5px;
      font-weight: 700;
    }
    .sr-kpis {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-bottom: 14px;
    }
    .sr-kpi-card {
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 8px 10px;
      text-align: center;
      background: #f8fafc;
    }
    .sr-kpi-title { font-size: 11.5px; color: #475569; font-weight: 700; margin-bottom: 4px; }
    .sr-kpi-val { font-size: 18px; font-weight: 800; }
    table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
    th, td { border: 1px solid #334155; padding: 6px 8px; text-align: right; vertical-align: middle; }
    th { background-color: #e2e8f0 !important; color: #0f172a; font-weight: 800; text-align: center; }
    tr:nth-child(even) td { background-color: #f8fafc; }
    tr { page-break-inside: avoid; }
    .sr-footer {
      margin-top: 24px;
      display: flex;
      justify-content: space-between;
      font-size: 12.5px;
      font-weight: 700;
      padding: 0 20px;
      page-break-inside: avoid;
    }
  </style>
</head>
<body>
  <div class="sr-header">
    <div class="sr-header-col sr-header-right">
      <div>الجمهورية اليمنية</div>
      <div>وزارة التربية والتعليم</div>
      <div>رياض ومدارس أنوار العلى الدولية النموذجية</div>
    </div>
    <div class="sr-header-col sr-header-center">
      <img src="${ne}" alt="شعار المدرسة" class="sr-logo" />
    </div>
    <div class="sr-header-col sr-header-left">
      <div>Republic of Yemen</div>
      <div>Ministry of Education</div>
      <div>Anwar Al-Ola International Model Schools</div>
    </div>
  </div>

  <div class="sr-meta">
    <div>اسم الطالب: <strong>${n}</strong></div>
    <div>الصف والشعبة: <strong>${r} (${a})</strong></div>
    <div>رقم الهوية / الأكاديمي: <strong dir="ltr">${o}</strong></div>
    <div>الشهر: <strong dir="ltr">${b}</strong></div>
    <div>تاريخ الإصدار: <strong>${s}</strong></div>
  </div>

  <div class="sr-kpis">
    <div class="sr-kpi-card">
      <div class="sr-kpi-title">أيام الحضور</div>
      <div class="sr-kpi-val" style="color:#15803d;">${t.present}</div>
    </div>
    <div class="sr-kpi-card">
      <div class="sr-kpi-title">أيام الغياب</div>
      <div class="sr-kpi-val" style="color:#b91c1c;">${t.absent}</div>
    </div>
    <div class="sr-kpi-card">
      <div class="sr-kpi-title">إجمالي الأيام المرصودة</div>
      <div class="sr-kpi-val" style="color:#1e3a8a;">${t.total??t.totalDays??0}</div>
    </div>
    <div class="sr-kpi-card">
      <div class="sr-kpi-title">نسبة الانضباط</div>
      <div class="sr-kpi-val" style="color:${t.rate>=90?`#15803d`:t.rate>=75?`#d97706`:`#b91c1c`};">${t.rate}%</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:45px;">م</th>
        <th style="width:95px;">اليوم</th>
        <th style="width:120px;">التاريخ</th>
        <th style="width:110px;">حالة الحضور</th>
        <th style="width:110px;">وقت الوصول</th>
        <th>ملاحظات / سبب الغياب</th>
      </tr>
    </thead>
    <tbody>
      ${u}
    </tbody>
  </table>

  <div class="sr-footer">
    <div>مشرف التحضير / شؤون الطلاب: ............................</div>
    <div>اعتماد إدارة المدرسة: ............................</div>
  </div>
</body>
</html>`,f=document.getElementById(`student-attendance-print-frame`);f&&document.body.removeChild(f),f=document.createElement(`iframe`),f.id=`student-attendance-print-frame`,f.style.position=`fixed`,f.style.right=`0`,f.style.bottom=`0`,f.style.width=`0`,f.style.height=`0`,f.style.border=`0`,document.body.appendChild(f);let p=f.contentWindow.document;p.open(),p.write(d),p.close(),setTimeout(()=>{f.contentWindow.focus(),f.contentWindow.print()},350)},D=()=>{let e=new Date,t=e.getFullYear(),n=String(e.getMonth()+1).padStart(2,`0`);return{fullDate:`${t}-${n}-${String(e.getDate()).padStart(2,`0`)}`,yearMonth:`${t}-${n}`,dayNum:e.getDate()}},[O,k]=(0,m.useState)(`monthlySheet`),[A,j]=(0,m.useState)(`الصف الأول`),[M,N]=(0,m.useState)(`أ`),[P,le]=(0,m.useState)(``),[F,I]=(0,m.useState)(()=>D().fullDate),{allowedClasses:L,allowedGrades:R,allowedSections:z}=ee(`scanner`),B=L.find(e=>e.grade===A&&e.section===M)||(L.length>0?L[0]:null);(0,m.useEffect)(()=>{let e=D();I(e.fullDate),x(e.yearMonth),S&&S(e.fullDate),X(e.fullDate),oe()},[]),(0,m.useEffect)(()=>{L.length>0&&(L.find(e=>e.grade===A&&e.section===M)||(j(L[0].grade),N(L[0].section)))},[L]),(0,m.useEffect)(()=>{if(B){let e=B.numericId||String(B.id).replace(/\D/g,``);E(`?class_id=${e}&per_page=500`),C(`?class_id=${e}&per_page=1000`)}else E(`?per_page=500`),C(`?per_page=1000`)},[B,E,C]);let[V,H]=(0,m.useState)(!1),[U,W]=(0,m.useState)(`الصف الأول`),[G,K]=(0,m.useState)(`أ`),[q,J]=(0,m.useState)(``),[Y,X]=(0,m.useState)(()=>D().fullDate),[Z,Q]=(0,m.useState)(`present`);(0,m.useEffect)(()=>{if(V&&w){let e=L.find(e=>e.grade===U&&e.section===G),t=e?e.numericId||String(e.id).replace(/\D/g,``):null,n=w.filter(e=>{let n=t&&e.class_id&&Number(e.class_id)===Number(t),r=e.grade===U&&e.section===G;return n||r}),r=n.length>0?n:w;r.length>0?(!q||!r.some(e=>String(e.id)===String(q)))&&J(r[0].id):J(``)}},[V,w,U,G,L]);let $=e=>{if(_?.role===`admin`||(_?.role===`vice_principal`||_?.role===`supervisor`)&&(g(`scanner`,`update`)||g(`scanner`,`create`)||_?.permissions?.full_access))return!1;let t=new Date(`${e}T23:59:59`);return new Date>new Date(t.getTime()+1440*60*1e3)},ue=(e,t)=>{let n=`${b}-${String(t).padStart(2,`0`)}`;if($(n)){alert(i===`ar`?`عفواً، لا يمكن تحضير أو تعديل الحضور والغياب لمرور أكثر من 24 ساعة على هذا التاريخ.`:`Attendance for this date is locked (> 24 hours passed).`);return}let r=v.find(t=>t.studentId===e&&t.date===n),a=`present`;r&&(r.status===`present`||r.status===`late`?a=`absent`:r.status===`absent`&&(a=null)),y(e,n,a)};return(0,h.jsxs)(`div`,{className:`section-card`,children:[(0,h.jsxs)(`div`,{className:`section-card-header no-print`,style:{display:`flex`,justifyContent:`space-between`,alignItems:`center`,flexWrap:`wrap`,gap:`var(--space-md)`},children:[(0,h.jsxs)(`h3`,{className:`section-card-title headline-small`,style:{fontSize:`18px`},children:[`📋 `,i===`ar`?`سجل الحضور والغياب الموحد`:`Unified Attendance Log`]}),(0,h.jsxs)(`div`,{className:`segment-control`,children:[(0,h.jsxs)(`button`,{type:`button`,className:`segment-btn ${O===`monthlySheet`?`active`:``}`,onClick:()=>k(`monthlySheet`),children:[(0,h.jsx)(c,{size:16}),i===`ar`?`كشف الحضور الشهري`:`Monthly Registry`]}),(0,h.jsxs)(`button`,{type:`button`,className:`segment-btn ${O===`statsSummary`?`active`:``}`,onClick:()=>k(`statsSummary`),children:[(0,h.jsx)(f,{size:16}),i===`ar`?`إحصائيات الحضور والغياب`:`Attendance Stats`]})]})]}),O===`monthlySheet`&&(0,h.jsxs)(`div`,{className:`printable-area`,style:{display:`flex`,flexDirection:`column`,gap:`var(--space-lg)`},children:[(0,h.jsx)(`style`,{dangerouslySetInnerHTML:{__html:`
            @media print {
              @page {
                size: landscape;
                margin: 1cm;
              }
            }
          `}}),(0,h.jsx)(te,{title:`كشف حضور وغياب الطلاب الشهري`,subtitle:i===`ar`?`الصف الدراسي: ${A} | الشعبة: ${M} | التاريخ: ${F}`:`Grade: ${A} | Section: ${M} | Date: ${F}`}),(0,h.jsxs)(`div`,{className:`students-controls no-print`,style:{display:`flex`,flexWrap:`wrap`,gap:`12px`,alignItems:`center`,justifyContent:`space-between`,padding:`var(--space-md)`,backgroundColor:`var(--color-surface)`,borderRadius:`var(--radius-card)`,border:`1px solid var(--color-border)`},children:[(0,h.jsxs)(`div`,{style:{display:`flex`,flexWrap:`wrap`,gap:`12px`,alignItems:`center`},children:[(0,h.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`2px`},children:[(0,h.jsx)(`label`,{style:{fontSize:`11px`,fontWeight:`bold`,color:`var(--color-text-secondary)`},children:i===`ar`?`الفصل الدراسي`:`Class`}),(0,h.jsx)(`select`,{value:`${A} - ${M}`,onChange:e=>{let t=e.target.value.split(` - `);t.length>=2&&(j(t[0]),N(t[1]))},className:`text-field`,style:{height:`36px`,padding:`0 8px`,fontSize:`12px`,minWidth:`180px`},children:(L||[]).map(e=>(0,h.jsx)(`option`,{value:e.name,children:i===`ar`?e.name:e.nameEn},e.id))})]}),(0,h.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`2px`},children:[(0,h.jsx)(`label`,{style:{fontSize:`11px`,fontWeight:`bold`},children:i===`ar`?`التاريخ (اليوم / الشهر / السنة)`:`Date (Day / Month / Year)`}),(0,h.jsx)(`input`,{type:`date`,value:F,onChange:e=>{let t=e.target.value;t&&(I(t),x(t.substring(0,7)),S&&S(t),X(t))},className:`text-field`,style:{height:`36px`,padding:`0 8px`,fontSize:`12px`}})]}),(0,h.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`2px`},children:[(0,h.jsx)(`label`,{style:{fontSize:`11px`,fontWeight:`bold`},children:i===`ar`?`الشهر والسنة`:`Month & Year`}),(0,h.jsx)(`input`,{type:`month`,value:b,onChange:e=>{let t=e.target.value;if(t){x(t);let e=D(),n=t===e.yearMonth?e.fullDate:`${t}-01`;I(n),S&&S(n)}},className:`text-field`,style:{height:`36px`,padding:`0 8px`,fontSize:`12px`}})]}),(0,h.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`2px`},children:[(0,h.jsx)(`label`,{style:{fontSize:`11px`,fontWeight:`bold`,color:`var(--color-text-secondary)`},children:i===`ar`?`البحث عن طالب`:`Search Student`}),(0,h.jsxs)(`div`,{className:`search-box`,style:{margin:0,minWidth:`200px`},children:[(0,h.jsx)(t,{size:16}),(0,h.jsx)(`input`,{type:`text`,placeholder:i===`ar`?`اسم الطالب...`:`Search student...`,value:P,onChange:e=>le(e.target.value),className:`text-field`,style:{height:`36px`,fontSize:`12px`}})]})]})]}),(0,h.jsxs)(`div`,{style:{display:`flex`,gap:`8px`,alignItems:`center`},children:[(0,h.jsxs)(`button`,{type:`button`,className:`btn-filled`,onClick:()=>window.print(),style:{minHeight:`36px`,height:`36px`,padding:`0 16px`,fontSize:`13px`,display:`inline-flex`,alignItems:`center`,gap:`6px`,cursor:`pointer`},children:[(0,h.jsx)(d,{size:16}),i===`ar`?`طباعة كشف الفصل`:`Print Class Sheet`]}),g(`scanner`,`create`)&&(0,h.jsxs)(`button`,{type:`button`,className:`btn-accent`,onClick:()=>{let e=L.find(e=>e.grade===A&&e.section===M)||(L.length>0?L[0]:null),t=e?e.grade:R.length>0?R[0]:`الصف الأول`,n=e?e.section:z.length>0?z[0]:`أ`,r=e?e.numericId||String(e.id).replace(/\D/g,``):null,i=w.filter(e=>{let i=r&&e.class_id&&Number(e.class_id)===Number(r),a=e.grade===t&&e.section===n;return i||a});W(t),K(n),J(i.length>0?i[0].id:``),X(F||D().fullDate),Q(`present`),H(!0)},style:{minHeight:`36px`,height:`36px`,padding:`0 16px`,fontSize:`13px`,display:`inline-flex`,alignItems:`center`,gap:`6px`,cursor:`pointer`},children:[(0,h.jsx)(e,{size:16}),i===`ar`?`تحضير سريع (منفرد)`:`Quick Attendance`]})]})]}),(()=>{let e=Number(b.split(`-`)[0])||2026,t=Number(b.split(`-`)[1])||6,n=new Date(e,t,0).getDate(),r=Array.from({length:n},(e,t)=>t+1),a=n=>new Date(e,t-1,n).getDay(),o=e=>{let t=a(e);return t===4||t===5},s=e=>{let t=a(e);return i===`ar`?[`ح`,`ن`,`ث`,`ر`,`خ`,`ج`,`س`][t]:[`S`,`M`,`T`,`W`,`T`,`F`,`S`][t]},c=w.filter(e=>{let t=B?B.numericId||String(B.id).replace(/\D/g,``):null,n=t&&e.class_id&&Number(e.class_id)===Number(t),r=e.grade===A&&e.section===M,i=e.grade+` - `+e.section==A+` - `+M,a=n||r||i||!B,o=!P||e.name&&e.name.toLowerCase().includes(P.toLowerCase())||e.nameEn&&e.nameEn.toLowerCase().includes(P.toLowerCase());return a&&o});if(w.length===0)return(0,h.jsx)(`div`,{style:{padding:`48px 24px`,textAlign:`center`,border:`1px dashed var(--color-border)`,borderRadius:`var(--radius-card)`},children:(0,h.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,alignItems:`center`,justifyContent:`center`,gap:`8px`},children:[(0,h.jsx)(`span`,{style:{fontSize:`32px`},children:`📂`}),(0,h.jsx)(`span`,{style:{fontWeight:`600`,fontSize:`15px`,color:`var(--color-text-primary)`},children:i===`ar`?`لا يوجد طلاب مسجلين حالياً`:`No students registered yet`}),(0,h.jsx)(`span`,{style:{fontSize:`13px`,color:`var(--color-text-secondary)`},children:i===`ar`?`يرجى تسجيل الطلاب في النظام أولاً لبدء رصد الغياب.`:`Please register students in the system first to begin tracking attendance.`})]})});if(c.length===0){let e=P!==``;return(0,h.jsx)(`div`,{style:{padding:`48px 24px`,textAlign:`center`,border:`1px dashed var(--color-border)`,borderRadius:`var(--radius-card)`},children:(0,h.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,alignItems:`center`,justifyContent:`center`,gap:`8px`},children:[(0,h.jsx)(`span`,{style:{fontSize:`32px`},children:e?`🔍`:`ℹ️`}),(0,h.jsx)(`span`,{style:{fontWeight:`600`,fontSize:`15px`,color:`var(--color-text-primary)`},children:e?i===`ar`?`لا توجد نتائج تطابق بحثك`:`No matching search results found`:i===`ar`?`لا توجد نتائج تطابق التصفية المحددة`:`No matching filter results found`}),(0,h.jsx)(`span`,{style:{fontSize:`13px`,color:`var(--color-text-secondary)`},children:e?i===`ar`?`جرب البحث بكلمة مفتاحية مختلفة`:`Try searching for a different keyword`:i===`ar`?`جرب تغيير خيارات التصفية`:`Try changing your filter selections`})]})})}return(0,h.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`12px`},children:[(0,h.jsx)(`div`,{style:{overflowX:`auto`,WebkitOverflowScrolling:`touch`,border:`1px solid var(--color-border)`,borderRadius:`var(--radius-card)`,backgroundColor:`var(--color-surface-alt)`},children:(0,h.jsxs)(`table`,{className:`schedule-table monthly-attendance-table`,style:{width:`100%`,minWidth:`1000px`,fontSize:`11px`},children:[(0,h.jsx)(`thead`,{children:(0,h.jsxs)(`tr`,{children:[(0,h.jsx)(`th`,{className:`sticky-student-name`,style:{textAlign:`start`,padding:`10px var(--space-md)`,borderBottom:`1px solid var(--color-border)`},children:i===`ar`?`اسم الطالب`:`Student Name`}),r.filter(e=>!o(e)).map(e=>{let t=`${b}-${String(e).padStart(2,`0`)}`===F;return(0,h.jsxs)(`th`,{style:{padding:`8px 2px`,background:t?`rgba(30, 80, 142, 0.14)`:`var(--color-surface)`,color:t?`var(--color-primary-ui)`:`var(--color-text-primary)`,minWidth:`28px`,borderBottom:t?`2px solid var(--color-primary-ui)`:`1px solid var(--color-border)`,borderLeft:`1px solid var(--color-border)`},children:[(0,h.jsx)(`div`,{style:{fontSize:`9px`,opacity:.7,marginBottom:`2px`,fontWeight:`normal`},children:s(e)}),(0,h.jsx)(`div`,{style:{fontWeight:t?`800`:`700`},children:e})]},e)})]})}),(0,h.jsx)(`tbody`,{children:c.map(e=>(0,h.jsxs)(`tr`,{children:[(0,h.jsx)(`td`,{className:`sticky-student-name`,style:{textAlign:`start`,fontWeight:`bold`,padding:`8px var(--space-md)`,borderRight:`1px solid var(--color-border)`,borderBottom:`1px solid var(--color-border)`},children:(0,h.jsx)(`span`,{style:{fontSize:`12px`},children:i===`ar`?e.name:e.nameEn})}),r.filter(e=>!o(e)).map(t=>{let n=`${b}-${String(t).padStart(2,`0`)}`,r=n===F,a=v.find(t=>t.studentId===e.id&&t.date===n),o=$(n),s=(0,h.jsx)(`span`,{style:{color:`#cbd5e1`,fontSize:`11px`},children:`⚪`}),c=i===`ar`?`غير مرصود`:`No record`;return a&&(a.status===`present`||a.status===`late`?(s=(0,h.jsx)(`span`,{style:{color:`#16a34a`,fontWeight:`bold`,fontSize:`14px`},children:`✓`}),c=i===`ar`?`حاضر`:`Present`):a.status===`absent`&&(s=(0,h.jsx)(`span`,{style:{color:`#dc2626`,fontWeight:`bold`,fontSize:`14px`},children:`✗`}),c=i===`ar`?`غائب`:`Absent`)),o&&(c+=i===`ar`?` - [مغلق: مضى أكثر من 24 ساعة]`:` - [Locked: >24h]`),(0,h.jsx)(`td`,{title:`${e.name}: ${c} (${n})`,style:{padding:`6px 2px`,backgroundColor:o?`rgba(0,0,0,0.02)`:r?`rgba(30, 80, 142, 0.06)`:`transparent`,opacity:o?.65:1,cursor:o?`not-allowed`:g(`scanner`,`update`)?`pointer`:`default`,fontSize:`12px`,userSelect:`none`,borderLeft:`1px solid var(--color-border)`,borderBottom:`1px solid var(--color-border)`,textAlign:`center`},onClick:()=>g(`scanner`,`update`)&&ue(e.id,t),children:s},t)})]},e.id))})]})}),(0,h.jsxs)(`div`,{className:`printable-only-footer`,style:{display:`none`,gridTemplateColumns:`1fr 1fr 1fr`,gap:`24px`,marginTop:`40px`,fontSize:`12px`,fontWeight:`600`,direction:`rtl`},children:[(0,h.jsxs)(`div`,{style:{textAlign:`center`},children:[(0,h.jsx)(`div`,{children:`مربي الفصل`}),(0,h.jsx)(`div`,{style:{marginTop:`35px`,borderTop:`1px dotted #000000`,width:`80%`,marginInline:`auto`,paddingTop:`4px`},children:`التوقيع:`})]}),(0,h.jsxs)(`div`,{style:{textAlign:`center`},children:[(0,h.jsx)(`div`,{children:`مراقب الحضور والغياب`}),(0,h.jsx)(`div`,{style:{marginTop:`35px`,borderTop:`1px dotted #000000`,width:`80%`,marginInline:`auto`,paddingTop:`4px`},children:`التوقيع:`})]}),(0,h.jsxs)(`div`,{style:{textAlign:`center`},children:[(0,h.jsx)(`div`,{children:`مدير المدرسة`}),(0,h.jsx)(`div`,{style:{marginTop:`35px`,borderTop:`1px dotted #000000`,width:`80%`,marginInline:`auto`,paddingTop:`4px`},children:`التوقيع والختم:`})]})]}),(0,h.jsxs)(`div`,{className:`no-print`,style:{display:`flex`,gap:`16px`,flexWrap:`wrap`,padding:`12px`,border:`1px solid var(--color-border)`,borderRadius:`8px`,backgroundColor:`var(--color-surface)`,fontSize:`11px`,justifyContent:`center`,marginTop:`4px`},children:[(0,h.jsx)(`span`,{children:(0,h.jsx)(`strong`,{children:i===`ar`?`دليل الرموز:`:`Legend:`})}),(0,h.jsxs)(`span`,{children:[(0,h.jsx)(`span`,{style:{color:`#16a34a`,fontWeight:`bold`,marginInlineEnd:`4px`,fontSize:`14px`},children:`✓`}),i===`ar`?`حاضر`:`Present`]}),(0,h.jsxs)(`span`,{children:[(0,h.jsx)(`span`,{style:{color:`#dc2626`,fontWeight:`bold`,marginInlineEnd:`4px`,fontSize:`14px`},children:`✗`}),i===`ar`?`غائب`:`Absent`]}),(0,h.jsxs)(`span`,{children:[(0,h.jsx)(`span`,{style:{color:`#cbd5e1`,marginInlineEnd:`4px`,fontSize:`11px`},children:`⚪`}),i===`ar`?`غير مرصود (انقر للتعديل)`:`Unrecorded (click to set)`]})]})]})})()]}),O===`statsSummary`&&(0,h.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`var(--space-lg)`},children:[(0,h.jsxs)(`div`,{className:`students-controls no-print`,style:{display:`flex`,flexWrap:`wrap`,gap:`12px`,alignItems:`center`,padding:`var(--space-md)`,backgroundColor:`var(--color-surface)`,borderRadius:`var(--radius-card)`,border:`1px solid var(--color-border)`},children:[(0,h.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`2px`},children:[(0,h.jsx)(`label`,{style:{fontSize:`11px`,fontWeight:`bold`,color:`var(--color-text-secondary)`},children:i===`ar`?`الفصل الدراسي`:`Class`}),(0,h.jsx)(`select`,{value:`${A} - ${M}`,onChange:e=>{let t=e.target.value.split(` - `);t.length>=2&&(j(t[0]),N(t[1]))},className:`text-field`,style:{height:`36px`,padding:`0 8px`,fontSize:`12px`,minWidth:`180px`},children:(L||[]).map(e=>(0,h.jsx)(`option`,{value:e.name,children:i===`ar`?e.name:e.nameEn},e.id))})]}),(0,h.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`2px`},children:[(0,h.jsx)(`label`,{style:{fontSize:`11px`,fontWeight:`bold`},children:i===`ar`?`التاريخ (اليوم / الشهر / السنة)`:`Date (Day / Month / Year)`}),(0,h.jsx)(`input`,{type:`date`,value:F,onChange:e=>{let t=e.target.value;t&&(I(t),x(t.substring(0,7)),S&&S(t))},className:`text-field`,style:{height:`36px`,padding:`0 8px`,fontSize:`12px`}})]}),(0,h.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`2px`},children:[(0,h.jsx)(`label`,{style:{fontSize:`11px`,fontWeight:`bold`},children:i===`ar`?`الشهر والسنة`:`Month & Year`}),(0,h.jsx)(`input`,{type:`month`,value:b,onChange:e=>{let t=e.target.value;if(t){x(t);let e=D();I(t===e.yearMonth?e.fullDate:`${t}-01`)}},className:`text-field`,style:{height:`36px`,padding:`0 8px`,fontSize:`12px`}})]})]}),(()=>{let e=w.filter(e=>e.grade===A&&e.section===M),t=v.filter(e=>{let t=w.find(t=>String(t.id)===String(e.studentId));return t&&t.grade===A&&t.section===M&&e.date&&e.date.startsWith(b)});t.length;let n=t.filter(e=>e.status===`present`||e.status===`late`).length,r=t.filter(e=>e.status===`absent`).length,o=n+r>0?Math.round(n/(n+r)*100):0,c=n+r>0?Math.round(r/(n+r)*100):0;return e.length===0?(0,h.jsx)(`div`,{style:{padding:`48px 24px`,textAlign:`center`,border:`1px dashed var(--color-border)`,borderRadius:`var(--radius-card)`},children:(0,h.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,alignItems:`center`,justifyContent:`center`,gap:`8px`},children:[(0,h.jsx)(`span`,{style:{fontSize:`32px`},children:`📂`}),(0,h.jsx)(`span`,{style:{fontWeight:`600`,fontSize:`15px`,color:`var(--color-text-primary)`},children:i===`ar`?`لا يوجد طلاب بهذه الشعبة`:`No students in this class section`}),(0,h.jsx)(`span`,{style:{fontSize:`13px`,color:`var(--color-text-secondary)`},children:i===`ar`?`يرجى تسجيل طلاب وتعيينهم لهذه الشعبة في صفحة الطلاب.`:`Please register students and assign them to this class section.`})]})}):(0,h.jsxs)(h.Fragment,{children:[(0,h.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:`repeat(auto-fit, minmax(180px, 1fr))`,gap:`16px`},children:[(0,h.jsxs)(`div`,{className:`card-kpi`,style:{padding:`16px`,borderRadius:`12px`,border:`1px solid var(--color-border)`,backgroundColor:`var(--color-surface-alt)`},children:[(0,h.jsx)(`div`,{style:{fontSize:`12px`,color:`var(--color-text-secondary)`},children:i===`ar`?`متوسط نسبة الحضور للشعبة`:`Average Attendance Rate`}),(0,h.jsxs)(`div`,{style:{fontSize:`24px`,fontWeight:`bold`,color:`var(--color-success)`,marginTop:`4px`},children:[`🟢 `,o,`%`]})]}),(0,h.jsxs)(`div`,{className:`card-kpi`,style:{padding:`16px`,borderRadius:`12px`,border:`1px solid var(--color-border)`,backgroundColor:`var(--color-surface-alt)`},children:[(0,h.jsx)(`div`,{style:{fontSize:`12px`,color:`var(--color-text-secondary)`},children:i===`ar`?`متوسط نسبة الغياب للشعبة`:`Average Absence Rate`}),(0,h.jsxs)(`div`,{style:{fontSize:`24px`,fontWeight:`bold`,color:`var(--color-error)`,marginTop:`4px`},children:[`🔴 `,c,`%`]})]}),(0,h.jsxs)(`div`,{className:`card-kpi`,style:{padding:`16px`,borderRadius:`12px`,border:`1px solid var(--color-border)`,backgroundColor:`var(--color-surface-alt)`},children:[(0,h.jsx)(`div`,{style:{fontSize:`12px`,color:`var(--color-text-secondary)`},children:i===`ar`?`إجمالي أيام الحضور للشعبة`:`Total Present Days`}),(0,h.jsxs)(`div`,{style:{fontSize:`24px`,fontWeight:`bold`,color:`var(--color-success)`,marginTop:`4px`},children:[`🟢 `,n,` `,i===`ar`?`يوم`:`Days`]})]}),(0,h.jsxs)(`div`,{className:`card-kpi`,style:{padding:`16px`,borderRadius:`12px`,border:`1px solid var(--color-border)`,backgroundColor:`var(--color-surface-alt)`},children:[(0,h.jsx)(`div`,{style:{fontSize:`12px`,color:`var(--color-text-secondary)`},children:i===`ar`?`إجمالي أيام الغياب للشعبة`:`Total Absent Days`}),(0,h.jsxs)(`div`,{style:{fontSize:`24px`,fontWeight:`bold`,color:`var(--color-error)`,marginTop:`4px`},children:[`🔴 `,r,` `,i===`ar`?`يوم`:`Days`]})]}),(0,h.jsxs)(`div`,{className:`card-kpi`,style:{padding:`16px`,borderRadius:`12px`,border:`1px solid var(--color-border)`,backgroundColor:`var(--color-surface-alt)`},children:[(0,h.jsx)(`div`,{style:{fontSize:`12px`,color:`var(--color-text-secondary)`},children:i===`ar`?`الطلاب المقيدين بالشعبة`:`Registered Students`}),(0,h.jsxs)(`div`,{style:{fontSize:`24px`,fontWeight:`bold`,color:`var(--color-primary-ui)`,marginTop:`4px`},children:[`👨‍🎓 `,e.length]})]})]}),(0,h.jsx)(`div`,{className:`students-table-container`,children:(0,h.jsxs)(`table`,{className:`students-table`,children:[(0,h.jsx)(`thead`,{children:(0,h.jsxs)(`tr`,{children:[(0,h.jsx)(`th`,{className:`sticky-col-name`,children:a.studentName}),(0,h.jsx)(`th`,{style:{textAlign:`center`},children:i===`ar`?`أيام الحضور (🟢)`:`Days Present (🟢)`}),(0,h.jsx)(`th`,{style:{textAlign:`center`},children:i===`ar`?`أيام الغياب (🔴)`:`Days Absent (🔴)`}),(0,h.jsx)(`th`,{style:{textAlign:`center`},children:i===`ar`?`نسبة الانضباط`:`Discipline Rate`}),(0,h.jsx)(`th`,{className:`no-print`,style:{textAlign:`center`},children:a.action})]})}),(0,h.jsx)(`tbody`,{children:e.map(e=>{let t=T(e.id);return(0,h.jsxs)(`tr`,{children:[(0,h.jsxs)(`td`,{className:`sticky-col-name`,style:{fontWeight:`600`},children:[s(e.photo,`👨‍🎓`),(0,h.jsx)(`span`,{children:i===`ar`?e.name:e.nameEn})]}),(0,h.jsx)(`td`,{style:{textAlign:`center`,fontWeight:`bold`,color:`var(--color-success)`},children:t.present}),(0,h.jsx)(`td`,{style:{textAlign:`center`,fontWeight:`bold`,color:`var(--color-error)`},children:t.absent}),(0,h.jsx)(`td`,{style:{textAlign:`center`},children:(0,h.jsxs)(`span`,{className:`badge-status ${t.rate>=90?`checked-in`:t.rate>=75?`on-bus`:`absent`}`,children:[t.rate,`%`]})}),(0,h.jsx)(`td`,{className:`no-print`,style:{textAlign:`center`},children:(0,h.jsxs)(`button`,{type:`button`,className:`btn-elevated`,style:{fontSize:`11px`,height:`28px`,padding:`0 8px`},onClick:()=>ce(e),children:[`🖨️ `,i===`ar`?`طباعة التقرير الفردي`:`Print Report`]})})]},e.id)})})]})})]})})()]}),V&&(0,h.jsx)(`div`,{className:`modal-overlay no-print`,children:(0,h.jsxs)(`div`,{className:`modal-container`,style:{maxWidth:`450px`},children:[(0,h.jsxs)(`header`,{className:`modal-header`,children:[(0,h.jsxs)(`h3`,{className:`modal-title`,children:[`⏱️ `,i===`ar`?`تسجيل حضور سريع`:`Quick Attendance Entry`]}),(0,h.jsx)(`button`,{className:`modal-close-btn`,onClick:()=>H(!1),"aria-label":`Close Quick Attendance Dialog`,children:(0,h.jsx)(l,{size:20,strokeWidth:2.5})})]}),(0,h.jsxs)(`form`,{onSubmit:e=>{e.preventDefault(),q&&(y(Number(q),Y,Z),H(!1))},children:[(0,h.jsxs)(`div`,{className:`modal-body`,style:{display:`flex`,flexDirection:`column`,gap:`16px`},children:[(0,h.jsxs)(`div`,{className:`form-group`,style:{marginBottom:0},children:[(0,h.jsx)(`label`,{className:`form-label`,style:{fontSize:`11px`,fontWeight:`bold`},children:i===`ar`?`الفصل الدراسي والشعبة المصرحة`:`Allowed Class & Section`}),(0,h.jsx)(`select`,{className:`text-field`,value:`${U} - ${G}`,onChange:e=>{let t=e.target.value.split(` - `);if(t.length>=2){let e=t[0],n=t[1];W(e),K(n),j(e),N(n)}},style:{height:`36px`,padding:`0 8px`,fontSize:`12px`},children:(L||[]).map(e=>(0,h.jsx)(`option`,{value:`${e.grade} - ${e.section}`,children:i===`ar`?`${e.grade} - شعبة (${e.section})`:`${e.grade} - Section (${e.section})`},e.id))})]}),(0,h.jsxs)(`div`,{className:`form-group`,style:{marginBottom:0},children:[(0,h.jsx)(`label`,{className:`form-label`,style:{fontSize:`11px`,fontWeight:`bold`},children:i===`ar`?`اسم الطالب`:`Student Name`}),(0,h.jsxs)(`select`,{className:`text-field`,value:q,onChange:e=>J(e.target.value),required:!0,style:{height:`36px`,padding:`0 8px`,fontSize:`12px`},children:[(0,h.jsx)(`option`,{value:``,children:i===`ar`?`-- اختر الطالب --`:`-- Select Student --`}),(()=>{let e=L.find(e=>e.grade===U&&e.section===G),t=e?e.numericId||String(e.id).replace(/\D/g,``):null;return w.filter(e=>{let n=t&&e.class_id&&Number(e.class_id)===Number(t),r=e.grade===U&&e.section===G;return n||r}).map(e=>(0,h.jsx)(`option`,{value:e.id,children:i===`ar`?e.name:e.nameEn},e.id))})()]})]}),(0,h.jsxs)(`div`,{className:`form-group`,style:{marginBottom:0},children:[(0,h.jsx)(`label`,{className:`form-label`,style:{fontSize:`11px`,fontWeight:`bold`},children:i===`ar`?`تاريخ التحضير`:`Attendance Date`}),(0,h.jsx)(`input`,{type:`date`,className:`text-field`,value:Y,onChange:e=>X(e.target.value),required:!0,style:{height:`36px`,padding:`0 12px`,fontSize:`12px`}})]}),(0,h.jsxs)(`div`,{className:`form-group`,style:{marginBottom:0},children:[(0,h.jsx)(`label`,{className:`form-label`,style:{fontSize:`11px`,fontWeight:`bold`},children:i===`ar`?`الحالة`:`Status`}),(0,h.jsxs)(`div`,{style:{display:`flex`,gap:`20px`,marginTop:`8px`},children:[(0,h.jsxs)(`label`,{style:{display:`flex`,alignItems:`center`,gap:`8px`,cursor:`pointer`,fontSize:`13px`},children:[(0,h.jsx)(`input`,{type:`radio`,name:`quickStatus`,value:`present`,checked:Z===`present`,onChange:()=>Q(`present`)}),(0,h.jsxs)(`span`,{children:[`🟢 `,i===`ar`?`حاضر`:`Present`]})]}),(0,h.jsxs)(`label`,{style:{display:`flex`,alignItems:`center`,gap:`8px`,cursor:`pointer`,fontSize:`13px`},children:[(0,h.jsx)(`input`,{type:`radio`,name:`quickStatus`,value:`absent`,checked:Z===`absent`,onChange:()=>Q(`absent`)}),(0,h.jsxs)(`span`,{children:[`🔴 `,i===`ar`?`غائب`:`Absent`]})]})]})]})]}),(0,h.jsxs)(`footer`,{className:`modal-footer`,style:{marginTop:`20px`,display:`flex`,justifyContent:`flex-end`,gap:`10px`},children:[(0,h.jsx)(`button`,{type:`button`,className:`btn-elevated`,onClick:()=>H(!1),style:{height:`38px`,fontSize:`12px`},children:a.cancel}),(0,h.jsx)(`button`,{type:`submit`,className:`btn-filled`,style:{height:`38px`,fontSize:`12px`},children:a.submit})]})]})]})})]})}function _(){return(0,h.jsx)(g,{})}export{_ as default};