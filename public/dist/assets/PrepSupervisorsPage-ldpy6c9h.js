import{i as e,n as t,t as n}from"./jsx-runtime-bzQ4Vb5N.js";import{t as r}from"./camera-LNc_8yjb.js";import{n as i,t as a}from"./PaginationBar-DLwMfIOL.js";import{t as o}from"./search-CLW0N3f4.js";import{t as s}from"./upload-DlPGKEe3.js";import{t as ee}from"./user-B-PD2g-n.js";import{L as te,W as ne,Z as re,_ as ie,g as c,i as ae,n as oe,s as l,z as u}from"./index-BQYunDY5.js";var d=e(t(),1),f=n();function p(){let{lang:e,t,renderAvatar:n,setToastMessage:p,triggerConfirm:se,canAction:m}=re(),{supervisors:h,supervisorsPagination:g,handleAddSupervisor:ce,handleEditSupervisor:le,handleDeleteSupervisor:ue,fetchSupervisors:_,loading:de}=te(),{classes:v,fetchClasses:y}=ne(),{page:fe,perPage:pe,search:b,sort:me,direction:he,setPage:ge,setPerPage:_e,setSearch:ve,buildQueryString:ye,goToPrevIfEmpty:be}=i({moduleKey:`supervisors`}),x=ye();(0,d.useEffect)(()=>{_(x)},[_,x]),(0,d.useEffect)(()=>{y()},[y]);let[S,C]=(0,d.useState)(!1),[xe,Se]=(0,d.useState)(b);(0,d.useEffect)(()=>{Se(b)},[b]);let[Ce,w]=(0,d.useState)(!1),[we,T]=(0,d.useState)(!1),[Te,E]=(0,d.useState)(!1),[D,Ee]=(0,d.useState)(`job_id`),[O,De]=(0,d.useState)(!1),[Oe,k]=(0,d.useState)(!1),[A,ke]=(0,d.useState)(`import`),[j,M]=(0,d.useState)(null),[N,Ae]=(0,d.useState)(!1),[P,F]=(0,d.useState)(0),[je,I]=(0,d.useState)(``),[L,R]=(0,d.useState)([]),[Me,z]=(0,d.useState)(!1),[Ne,Pe]=(0,d.useState)(!1),[Fe,Ie]=(0,d.useState)(!1),Le=async()=>{try{Pe(!0);let t=await u.exportSupervisors();if(!t.ok){alert(e===`ar`?`فشل تصدير البيانات`:`Failed to export data`);return}let n=await t.blob(),r=window.URL.createObjectURL(n),i=document.createElement(`a`);i.href=r,i.download=`supervisors_export.csv`,document.body.appendChild(i),i.click(),i.remove()}catch(t){console.error(t),alert(e===`ar`?`حدث خطأ أثناء التصدير`:`Error exporting`)}finally{Pe(!1)}},Re=async()=>{try{Ie(!0);let t=await u.downloadSupervisorTemplate();if(!t.ok){alert(e===`ar`?`فشل تحميل النموذج`:`Failed to download template`);return}let n=await t.blob(),r=window.URL.createObjectURL(n),i=document.createElement(`a`);i.href=r,i.download=`supervisors_template.xlsx`,document.body.appendChild(i),i.click(),i.remove()}catch(t){console.error(t),alert(e===`ar`?`حدث خطأ أثناء تحميل النموذج`:`Error downloading template`)}finally{Ie(!1)}},ze=async t=>{if(t&&t.preventDefault(),!j){alert(e===`ar`?`يرجى اختيار ملف أولاً`:`Please select a file first`);return}Ae(!0),F(10),I(e===`ar`?`جاري رفع الملف...`:`Uploading file...`),R([]),z(!1);let n=new FormData;n.append(`file`,j);let r=setInterval(()=>{F(e=>e>=85?(clearInterval(r),85):e+15)},150);try{let t=await u.importSupervisors(n);clearInterval(r),F(100),t.success?(z(!0),I(t.message),t.errors&&t.errors.length>0&&R(t.errors),p(t.message),_(!0)):(I(e===`ar`?`فشل استيراد البيانات`:`Import failed`),t.errors&&t.errors.length>0?R(t.errors):R([t.message||(e===`ar`?`فشل استيراد البيانات`:`Import failed`)]))}catch(t){clearInterval(r),F(100),I(e===`ar`?`حدث خطأ أثناء الاتصال بالخادم`:`Error communicating with server`),R([t.message||`Error`]),console.error(t)}finally{Ae(!1)}},Be=async()=>{De(!0);try{let t=[];try{let e=await u.getSupervisors(`?per_page=1000`);Array.isArray(e?.supervisors)?t=e.supervisors:Array.isArray(e?.data?.supervisors)?t=e.data.supervisors:Array.isArray(e?.data)?t=e.data:Array.isArray(e)&&(t=e)}catch(e){console.warn(`API supervisors fetch failed, falling back to local state:`,e)}t.length===0&&h.length>0&&(t=[...h]),t=t.map(e=>({id:e.id,jobId:e.jobId||e.job_id||``,name:e.name_ar||e.name||``,phone:e.phone||e.password||``,classes:Array.isArray(e.classes)?e.classes:[]}));let n=e=>e?e.replace(/[\u064B-\u065F\u0670]/g,``).replace(/[إأآٱ]/g,`ا`).replace(/ة/g,`ه`).replace(/ى/g,`ي`).trim():``;t.sort((e,t)=>{let r=n(e.name||``),i=n(t.name||``),a=r.localeCompare(i,`ar`);return a===0?(e.name||``).localeCompare(t.name||``,`ar`):a});let r=new Date().toLocaleDateString(`ar-SA`,{year:`numeric`,month:`long`,day:`numeric`,weekday:`long`}),i=``;i=D===`job_id`?`
          <tr>
            <th style="width: 42px;">م</th>
            <th style="width: 150px; text-align: center;">الرقم الوظيفي</th>
            <th style="text-align: right;">اسم مشرف التحضير</th>
          </tr>
        `:D===`job_id_phone`?`
          <tr>
            <th style="width: 42px;">م</th>
            <th style="width: 150px; text-align: center;">الرقم الوظيفي</th>
            <th style="text-align: right;">اسم مشرف التحضير</th>
            <th style="width: 160px; text-align: center;">رقم التلفون</th>
          </tr>
        `:`
          <tr>
            <th style="width: 38px;">م</th>
            <th style="width: 120px; text-align: center;">الرقم الوظيفي</th>
            <th style="width: 190px; text-align: right;">اسم مشرف التحضير</th>
            <th style="width: 130px; text-align: center;">رقم التلفون</th>
            <th style="text-align: right;">الفصول والشعب المكلف بها</th>
          </tr>
        `;let a=``;a=t.length===0?`
          <tr>
            <td colspan="${{job_id:3,job_id_phone:4,job_id_phone_classes:5}[D]||3}" style="text-align:center;padding:24px;color:#64748b;font-weight:700;">
              لا توجد بيانات مشرفي تحضير مسجلة حالياً
            </td>
          </tr>
        `:t.map((e,t)=>{if(D===`job_id`)return`
              <tr>
                <td class="col-num">${t+1}</td>
                <td class="col-code">${e.jobId}</td>
                <td class="col-name">${e.name}</td>
              </tr>
            `;if(D===`job_id_phone`)return`
              <tr>
                <td class="col-num">${t+1}</td>
                <td class="col-code">${e.jobId}</td>
                <td class="col-name">${e.name}</td>
                <td class="col-phone">${e.phone}</td>
              </tr>
            `;{let n=e.classes&&e.classes.length>0?e.classes.map(e=>`<span class="cls-badge">${e}</span>`).join(` `):`<span style="color:#94a3b8;font-style:italic;">غير مكلف بفصول</span>`;return`
              <tr>
                <td class="col-num">${t+1}</td>
                <td class="col-code">${e.jobId}</td>
                <td class="col-name">${e.name}</td>
                <td class="col-phone">${e.phone}</td>
                <td class="col-classes">${n}</td>
              </tr>
            `}}).join(``);let o=`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8">
<title>كشف مشرفي التحضير</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&family=Almarai:wght@400;700;800&display=swap" rel="stylesheet">
<style>
  @page {
    size: A4 portrait;
    margin: 8mm 10mm;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    direction: rtl;
    font-family: 'Tajawal', 'Almarai', 'Segoe UI', Tahoma, Arial, sans-serif;
    color: #0f172a;
    background: #fff;
    font-size: 11px;
    line-height: 1.4;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .print-page-wrapper {
    width: 100%;
    max-width: 210mm;
    margin: 0 auto;
    padding: 6px;
    display: flex;
    flex-direction: column;
    min-height: 275mm;
  }
  .sr-official-header {
    display: grid;
    grid-template-columns: 1.3fr 1fr 1.3fr;
    align-items: center;
    width: 100%;
    padding-bottom: 8px;
    border-bottom: 2px solid #1e3a8a;
    margin-bottom: 10px;
  }
  .sr-header-ar {
    text-align: right;
    font-size: 11px;
    font-weight: 700;
    color: #1e3a8a;
    line-height: 1.5;
  }
  .sr-header-school-ar {
    font-size: 12.5px;
    font-weight: 800;
    color: #0f2e5a;
  }
  .sr-header-logo {
    text-align: center;
  }
  .sr-header-logo img {
    height: 62px;
    width: auto;
    object-fit: contain;
  }
  .sr-header-en {
    text-align: left;
    direction: ltr;
    font-size: 10px;
    font-weight: 700;
    color: #1e3a8a;
    line-height: 1.5;
  }
  .sr-header-school-en {
    font-size: 11px;
    font-weight: 800;
    color: #0f2e5a;
  }
  .sr-title-bar {
    text-align: center;
    margin: 4px 0 10px;
  }
  .sr-meta-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f1f5f9;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    padding: 6px 14px;
    margin-top: 6px;
    font-size: 11px;
    font-weight: 700;
    color: #1e293b;
  }
  .sr-meta-item strong {
    color: #1e3a8a;
  }
  table.roster-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
    border: 1.5px solid #1e3a8a;
    font-size: 11px;
  }
  table.roster-table thead th {
    background-color: #f1f5f9;
    color: #0f2e5a;
    font-weight: 800;
    padding: 8px 10px;
    border: 1px solid #94a3b8;
    border-bottom: 2px solid #1e3a8a;
  }
  table.roster-table tbody td {
    padding: 7px 10px;
    border: 1px solid #cbd5e1;
    vertical-align: middle;
  }
  table.roster-table tbody tr:nth-child(even) {
    background-color: #f8fafc;
  }
  .col-num {
    width: 38px;
    text-align: center;
    font-weight: 700;
    background-color: #f1f5f9;
  }
  .col-code {
    text-align: center;
    font-family: monospace;
    font-weight: 700;
    font-size: 11.5px;
  }
  .col-name {
    text-align: right;
    font-weight: 700;
    font-size: 11.5px;
  }
  .col-phone {
    text-align: center;
    font-family: monospace;
    font-weight: 700;
    font-size: 11.5px;
    direction: ltr;
  }
  .col-classes {
    text-align: right;
    line-height: 1.6;
  }
  .cls-badge {
    display: inline-block;
    background-color: #f1f5f9;
    border: 1px solid #cbd5e1;
    border-radius: 4px;
    padding: 1px 6px;
    margin: 2px;
    font-size: 10px;
    font-weight: 700;
    color: #1e293b;
  }
  .sr-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid #cbd5e1;
    padding-top: 6px;
    font-size: 9px;
    color: #64748b;
    margin-top: 16px;
    page-break-inside: avoid;
  }
</style>
</head>
<body>
  <div class="print-page-wrapper">
    <div class="sr-official-header">
      <div class="sr-header-ar">
        <div>الجمهورية اليمنية</div>
        <div>وزارة التربية والتعليم والبحث العلمي</div>
        <div class="sr-header-school-ar">رياض ومدارس أنوار العلى الدولية النموذجية</div>
      </div>
      <div class="sr-header-logo">
        <img src="${oe}" alt="Logo" />
      </div>
      <div class="sr-header-en">
        <div>Republic of Yemen</div>
        <div>Min. of Education & Scientific Research</div>
        <div class="sr-header-school-en">Riyadh & Anwar Al-Ola Int. Model Schools</div>
      </div>
    </div>

    <div class="sr-title-bar">
      <div class="sr-meta-bar">
        <div class="sr-meta-item">العام الدراسي: <strong>1447-1448هـ (2025-2026م)</strong></div>
        <div class="sr-meta-item">إجمالي مشرفي التحضير: <strong>${t.length} مشرف</strong></div>
        <div class="sr-meta-item">التاريخ: <strong>${r}</strong></div>
      </div>
    </div>

    <table class="roster-table">
      <thead>
        ${i}
      </thead>
      <tbody>
        ${a}
      </tbody>
    </table>

    <div class="sr-footer">
      <span>تم إصدار الكشف آلياً عبر نظام إدارة رياض ومدارس أنوار العلى الدولية النموذجية</span>
      <span>صفحة 1 من 1</span>
    </div>
  </div>
</body>
</html>`;ae(o,{title:e===`ar`?`معاينة كشف المشرفين`:`Supervisors Roster Print Preview`,landscape:o.includes(`landscape`)}),E(!1)}catch(e){console.error(`Roster generation failed:`,e),alert(`حدث خطأ أثناء إعداد كشف الطباعة`)}finally{De(!1)}},[Ve,He]=(0,d.useState)(null),[B,V]=(0,d.useState)(``),[H,U]=(0,d.useState)(``),[W,G]=(0,d.useState)(``),[K,q]=(0,d.useState)(``),[J,Y]=(0,d.useState)([]),[X,Z]=(0,d.useState)(``),[Q,$]=(0,d.useState)(``),Ue=t=>{if(t.preventDefault(),$(``),!B.trim()||!H.trim()||!W.trim()){$(e===`ar`?`الرجاء تعبئة جميع الحقول المطلوبة`:`Please fill all required fields`);return}if(J.length===0){$(e===`ar`?`الرجاء تكليف المشرف بفصل دراسي واحد على الأقل`:`Please assign the supervisor to at least one class`);return}let n=300+h.length+1,r=B.split(` `).map(e=>e.charAt(0).toUpperCase()+e.slice(1)).join(` `),i={id:n,jobId:H.trim(),password:W.trim(),name:B,nameEn:r,classes:J,photo:K||`👩‍🏫`,phone:W.trim()};C(!0),ce(i).then(t=>{t&&t.success?(w(!1),V(``),U(``),G(``),q(``),Y([]),Z(``),_(x)):$(t?.message||(e===`ar`?`فشلت العملية`:`Operation failed`))}).catch(e=>{$(e.message||`Error occurred`)}).finally(()=>{C(!1)})},We=t=>{if(t.preventDefault(),$(``),!B.trim()||!H.trim()||!W.trim()){$(e===`ar`?`الرجاء تعبئة جميع الحقول المطلوبة`:`Please fill all required fields`);return}if(J.length===0){$(e===`ar`?`الرجاء تكليف المشرف بفصل دراسي واحد على الأقل`:`Please assign the supervisor to at least one class`);return}let n=B.split(` `).map(e=>e.charAt(0).toUpperCase()+e.slice(1)).join(` `),r={id:Ve,jobId:H.trim(),password:W.trim(),name:B,nameEn:n,classes:J,photo:K||`👩‍🏫`,phone:W.trim()};C(!0),le(r,Ve).then(t=>{t&&t.success?(T(!1),V(``),U(``),G(``),q(``),Y([]),Z(``),He(null),_(x)):$(t?.message||(e===`ar`?`فشلت العملية`:`Operation failed`))}).catch(e=>{$(e.message||`Error occurred`)}).finally(()=>{C(!1)})},Ge=()=>{if(!X){p(e===`ar`?`⚠️ يرجى اختيار الفصل الدراسي أولاً!`:`⚠️ Please select a class first!`),setTimeout(()=>p(``),3e3);return}if(J.includes(X)){p(e===`ar`?`⚠️ هذا الفصل الدراسي مضاف بالفعل للمشرف!`:`⚠️ This class is already assigned to this supervisor!`),setTimeout(()=>p(``),3e3);return}Y(e=>[...e,X]),Z(``)},Ke=e=>{Y(t=>t.filter(t=>t!==e))},qe=t=>{se({title:e===`ar`?`حذف مشرف التحضير`:`Delete Prep Supervisor`,message:e===`ar`?`هل أنت متأكد من حذف هذا المشرف نهائياً من النظام؟`:`Are you sure you want to delete this supervisor from the system permanently?`,onConfirm:()=>{ue(t).then(e=>{e&&e.success&&_(be(h.length-1))})}})};return(0,f.jsxs)(f.Fragment,{children:[(0,f.jsxs)(`div`,{className:`section-card`,children:[(0,f.jsxs)(`div`,{className:`section-card-header no-print`,style:{display:`flex`,justifyContent:`space-between`,alignItems:`center`,gap:`var(--space-md)`,flexWrap:`wrap`},children:[(0,f.jsx)(`h3`,{className:`section-card-title headline-small`,style:{fontSize:`18px`,margin:0},children:e===`ar`?`إدارة مشرفي التحضير وفصول التكليف`:`Prep Supervisors Management`}),(0,f.jsxs)(`div`,{style:{display:`flex`,gap:`8px`,alignItems:`center`,flexWrap:`wrap`},children:[(0,f.jsxs)(`button`,{className:`btn-secondary`,onClick:()=>E(!0),style:{display:`flex`,alignItems:`center`,gap:`6px`,padding:`8px 16px`,fontSize:`13px`,fontWeight:`700`,color:`#d97706`,borderColor:`#fcd34d`,backgroundColor:`#fffbeb`},children:[(0,f.jsx)(c,{size:16}),e===`ar`?`طباعة كشف`:`Print Roster`]}),(0,f.jsxs)(`button`,{className:`btn-elevated`,onClick:()=>{M(null),F(0),I(``),R([]),z(!1),k(!0)},style:{display:`flex`,alignItems:`center`,gap:`6px`,backgroundColor:`rgba(49, 133, 156, 0.08)`,borderColor:`rgba(49, 133, 156, 0.25)`,color:`#31859C`},children:[(0,f.jsx)(s,{size:16}),e===`ar`?`الاستيراد والتصدير (Excel)`:`Excel Import & Export`]}),m(`prepSupervisors`,`create`)&&(0,f.jsxs)(`button`,{className:`btn-accent`,onClick:()=>{$(``),V(``),U(``),G(``),q(``),Y([]),Z(``),w(!0)},children:[(0,f.jsx)(ie,{size:18,strokeWidth:2.5,style:{marginInlineEnd:`4px`}}),e===`ar`?`إضافة مشرف تحضير`:`Add Prep Supervisor`]})]})]}),(0,f.jsx)(`div`,{className:`students-controls no-print`,style:{marginBottom:`var(--space-md)`,padding:`0 var(--space-md)`},children:(0,f.jsxs)(`div`,{className:`search-box`,children:[(0,f.jsx)(o,{size:18}),(0,f.jsx)(`input`,{id:`search-prep-supervisors`,name:`search`,type:`text`,className:`text-field`,placeholder:e===`ar`?`البحث باسم المشرف، الرقم الوظيفي، أو الجوال...`:`Search by supervisor name, job ID, or phone...`,value:xe,"aria-label":e===`ar`?`البحث باسم المشرف`:`Search supervisors`,onChange:e=>{Se(e.target.value),ve(e.target.value)}})]})}),(0,f.jsx)(`div`,{className:`students-table-container`,children:(0,f.jsxs)(`table`,{className:`students-table`,children:[(0,f.jsx)(`thead`,{children:(0,f.jsxs)(`tr`,{children:[(0,f.jsx)(`th`,{className:`sticky-col-1`,children:e===`ar`?`الرقم الوظيفي (Job ID)`:`Job ID`}),(0,f.jsx)(`th`,{className:`sticky-col-2`,children:e===`ar`?`اسم المشرف`:`Supervisor Name`}),(0,f.jsx)(`th`,{children:e===`ar`?`الفصول المكلف بها للتحضير`:`Assigned Classes`}),(0,f.jsx)(`th`,{children:e===`ar`?`رقم الجوال`:`Phone Number`}),(m(`prepSupervisors`,`update`)||m(`prepSupervisors`,`delete`))&&(0,f.jsx)(`th`,{className:`no-print`,children:t.action})]})}),(0,f.jsx)(`tbody`,{children:h.map(t=>(0,f.jsxs)(`tr`,{children:[(0,f.jsx)(`td`,{className:`sticky-col-1`,style:{fontFamily:`var(--font-mono)`,fontWeight:`bold`},children:t.jobId}),(0,f.jsxs)(`td`,{className:`sticky-col-2`,style:{fontWeight:`600`},children:[n(t.photo,`👩‍🏫`),e===`ar`?t.name:t.nameEn]}),(0,f.jsx)(`td`,{children:(0,f.jsx)(`div`,{style:{display:`flex`,gap:`4px`,flexWrap:`wrap`,maxHeight:`54px`,overflowY:`auto`},children:t.classes&&t.classes.length>0?(0,f.jsxs)(f.Fragment,{children:[t.classes.slice(0,3).map((e,t)=>(0,f.jsx)(`span`,{className:`chip`,style:{cursor:`default`,fontSize:`11px`,padding:`2px 8px`},children:e},t)),t.classes.length>3&&(0,f.jsxs)(`span`,{title:t.classes.join(`, `),className:`chip`,style:{cursor:`help`,fontSize:`11px`,padding:`2px 8px`,background:`var(--color-primary-ui)`,color:`#fff`,fontWeight:`bold`},children:[`+`,t.classes.length-3,` `,e===`ar`?`فصول أخرى`:`more`]})]}):(0,f.jsx)(`span`,{style:{fontSize:`11px`,color:`var(--color-text-secondary)`},children:`—`})})}),(0,f.jsx)(`td`,{style:{fontFamily:`var(--font-mono)`},children:t.phone||t.password}),(m(`prepSupervisors`,`update`)||m(`prepSupervisors`,`delete`))&&(0,f.jsx)(`td`,{className:`no-print`,children:(0,f.jsxs)(`div`,{style:{display:`flex`,gap:`8px`},children:[m(`prepSupervisors`,`update`)&&(0,f.jsxs)(`button`,{className:`btn-elevated`,style:{padding:`6px 12px`,fontSize:`11px`},onClick:()=>{$(``),He(t.id),V(t.name),U(t.jobId),G(t.phone||t.password),q(t.photo),Y(t.classes||[]),Z(``),T(!0)},children:[`📝 `,e===`ar`?`تعديل`:`Edit`]}),m(`prepSupervisors`,`delete`)&&(0,f.jsxs)(`button`,{className:`btn-elevated`,style:{padding:`6px 12px`,fontSize:`11px`,backgroundColor:`rgba(220, 38, 38, 0.1)`,color:`var(--color-error)`},onClick:()=>qe(t.id),children:[`🗑️ `,e===`ar`?`حذف`:`Delete`]})]})})]},t.jobId))})]})}),(0,f.jsx)(`div`,{className:`no-print`,style:{padding:`0 var(--space-md)`,marginBottom:`var(--space-md)`},children:(0,f.jsx)(a,{page:fe,lastPage:g.lastPage,total:g.total,from:g.from,to:g.to,perPage:pe,onPageChange:ge,onPerPageChange:_e,loading:de,lang:e})})]}),Ce&&(0,f.jsx)(`div`,{className:`modal-overlay no-print`,children:(0,f.jsxs)(`div`,{className:`modal-container`,style:{maxWidth:`500px`},children:[(0,f.jsxs)(`header`,{className:`modal-header`,children:[(0,f.jsxs)(`h3`,{className:`modal-title`,children:[`👩‍🏫 `,e===`ar`?`إضافة مشرف تحضير جديد`:`Add New Prep Supervisor`]}),(0,f.jsx)(`button`,{className:`modal-close-btn`,onClick:()=>{w(!1),$(``)},children:(0,f.jsx)(l,{size:20,strokeWidth:2.5})})]}),(0,f.jsxs)(`form`,{onSubmit:Ue,children:[(0,f.jsxs)(`div`,{className:`modal-body`,children:[Q&&(0,f.jsx)(`div`,{style:{padding:`var(--space-md)`,backgroundColor:`rgba(220, 38, 38, 0.1)`,color:`var(--color-error)`,borderRadius:`var(--radius-chip)`,fontSize:`13px`,fontWeight:`600`,marginBottom:`12px`},children:Q}),(0,f.jsxs)(`div`,{className:`form-group`,children:[(0,f.jsxs)(`label`,{htmlFor:`add-prep-name`,className:`form-label`,children:[e===`ar`?`اسم المشرف ثنائي أو ثلاثي`:`Supervisor Name`,` `,(0,f.jsx)(`span`,{style:{color:`var(--color-error)`},children:`*`})]}),(0,f.jsx)(`input`,{id:`add-prep-name`,name:`name`,type:`text`,className:`text-field`,placeholder:e===`ar`?`مثال: أ. منى الحربي`:`e.g. Ms. Mona Al-Harbi`,value:B,onChange:e=>V(e.target.value),required:!0,autoComplete:`name`})]}),(0,f.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:`1fr 1fr`,gap:`var(--space-md)`},children:[(0,f.jsxs)(`div`,{className:`form-group`,children:[(0,f.jsxs)(`label`,{htmlFor:`add-prep-job-id`,className:`form-label`,children:[e===`ar`?`الرقم الوظيفي (Job ID)`:`Job ID`,` `,(0,f.jsx)(`span`,{style:{color:`var(--color-error)`},children:`*`})]}),(0,f.jsx)(`input`,{id:`add-prep-job-id`,name:`job_id`,type:`text`,className:`text-field`,placeholder:`P102`,value:H,onChange:e=>U(e.target.value),required:!0,autoComplete:`off`})]}),(0,f.jsxs)(`div`,{className:`form-group`,children:[(0,f.jsxs)(`label`,{htmlFor:`add-prep-phone`,className:`form-label`,children:[e===`ar`?`رقم الجوال`:`Phone Number`,` `,(0,f.jsx)(`span`,{style:{color:`var(--color-error)`},children:`*`})]}),(0,f.jsx)(`input`,{id:`add-prep-phone`,name:`phone`,type:`text`,className:`text-field`,placeholder:`7xxxxxxxx`,value:W,onChange:e=>G(e.target.value),required:!0,autoComplete:`tel`})]})]}),(0,f.jsxs)(`div`,{style:{padding:`14px`,background:`rgba(30, 80, 142, 0.03)`,border:`1px solid var(--color-border)`,borderRadius:`16px`,marginBottom:`16px`},children:[(0,f.jsxs)(`h4`,{style:{fontSize:`13px`,fontWeight:`bold`,marginBottom:`8px`,color:`var(--color-primary-ui)`},children:[`🎯 `,e===`ar`?`الفصول المكلف بها للتحضير`:`Assigned Classes for Prep`]}),(0,f.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:`2fr auto`,gap:`8px`,alignItems:`end`,marginBottom:`12px`},children:[(0,f.jsx)(`div`,{className:`form-group`,style:{marginBottom:0},children:(0,f.jsxs)(`select`,{id:`add-prep-assigned-class`,name:`assigned_class`,"aria-label":e===`ar`?`اختر الفصل الدراسي للتكليف`:`Select assigned class`,className:`text-field`,style:{height:`38px`,padding:`6px 12px`},value:X,onChange:e=>Z(e.target.value),children:[(0,f.jsx)(`option`,{value:``,children:e===`ar`?`-- اختر الفصل --`:`-- Select Class --`}),v.map(t=>(0,f.jsx)(`option`,{value:t.name,children:e===`ar`?t.name:t.nameEn},t.id))]})}),(0,f.jsxs)(`button`,{type:`button`,className:`btn-accent`,style:{height:`38px`,padding:`0 14px`,whiteSpace:`nowrap`},onClick:Ge,children:[`➕ `,e===`ar`?`إضافة فصل`:`Add Class`]})]}),(0,f.jsxs)(`div`,{style:{display:`flex`,gap:`6px`,flexWrap:`wrap`,marginTop:`10px`},children:[J.map((e,t)=>(0,f.jsxs)(`span`,{className:`chip`,style:{padding:`4px 10px`,fontSize:`12px`,display:`inline-flex`,alignItems:`center`,gap:`6px`},children:[e,(0,f.jsx)(`button`,{type:`button`,onClick:()=>Ke(e),style:{border:`none`,background:`transparent`,color:`var(--color-error)`,cursor:`pointer`,padding:0,display:`inline-flex`,alignItems:`center`},children:(0,f.jsx)(l,{size:12})})]},t)),J.length===0&&(0,f.jsx)(`span`,{style:{fontSize:`12px`,color:`var(--color-text-secondary)`,fontStyle:`italic`},children:e===`ar`?`لم يتم تكليف المشرف بأي فصول بعد`:`No classes assigned yet`})]})]}),(0,f.jsxs)(`div`,{className:`form-group`,children:[(0,f.jsx)(`label`,{className:`form-label`,children:e===`ar`?`الصورة الشخصية`:`Profile Photo`}),(0,f.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,alignItems:`center`,gap:`8px`,padding:`12px 0`},children:[(0,f.jsx)(`input`,{type:`file`,accept:`image/*`,id:`add-supervisor-photo-input`,onChange:e=>{let t=e.target.files[0];if(t){let e=new FileReader;e.onloadend=()=>q(e.result),e.readAsDataURL(t)}},style:{display:`none`}}),(0,f.jsx)(`div`,{style:{position:`relative`},children:(0,f.jsx)(`label`,{htmlFor:`add-supervisor-photo-input`,style:{display:`flex`,flexDirection:`column`,alignItems:`center`,justifyContent:`center`,width:`120px`,height:`120px`,borderRadius:`50%`,border:K&&K.startsWith(`data:`)?`2px solid var(--color-primary)`:`2px dashed var(--color-border)`,cursor:`pointer`,overflow:`hidden`,backgroundColor:`var(--color-surface)`,transition:`all 0.2s ease`,position:`relative`,boxShadow:`var(--shadow-sm)`},className:`avatar-upload-label`,children:K&&K.startsWith(`data:`)?(0,f.jsxs)(f.Fragment,{children:[(0,f.jsx)(`img`,{src:K,alt:`Preview`,style:{width:`100%`,height:`100%`,objectFit:`cover`}}),(0,f.jsxs)(`div`,{style:{position:`absolute`,top:0,left:0,width:`100%`,height:`100%`,backgroundColor:`rgba(0,0,0,0.5)`,display:`flex`,flexDirection:`column`,alignItems:`center`,justifyContent:`center`,opacity:0,transition:`opacity 0.2s ease`,color:`#ffffff`,fontSize:`11px`},className:`avatar-hover-overlay`,children:[(0,f.jsx)(r,{size:20,style:{marginBottom:`4px`}}),(0,f.jsx)(`span`,{children:e===`ar`?`تغيير الصورة`:`Change`})]})]}):(0,f.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,alignItems:`center`,color:`var(--color-text-secondary)`},children:[(0,f.jsx)(ee,{size:36,style:{strokeWidth:1.5,marginBottom:`4px`,color:`var(--color-text-tertiary)`}}),(0,f.jsx)(`span`,{style:{fontSize:`11px`,fontWeight:`500`},children:e===`ar`?`رفع الصورة`:`Upload`})]})})})]})]})]}),(0,f.jsxs)(`footer`,{className:`modal-footer`,children:[(0,f.jsx)(`button`,{type:`button`,className:`btn-elevated`,onClick:()=>w(!1),style:{height:`48px`},disabled:S,children:t.cancel}),(0,f.jsx)(`button`,{type:`submit`,className:`btn-filled`,style:{height:`48px`,opacity:S?.7:1},disabled:S,children:S?e===`ar`?`جاري الحفظ...`:`Saving...`:t.submit})]})]})]})}),we&&(0,f.jsx)(`div`,{className:`modal-overlay no-print`,children:(0,f.jsxs)(`div`,{className:`modal-container`,style:{maxWidth:`500px`},children:[(0,f.jsxs)(`header`,{className:`modal-header`,children:[(0,f.jsxs)(`h3`,{className:`modal-title`,children:[`👩‍🏫 `,e===`ar`?`تعديل بيانات مشرف التحضير`:`Edit Prep Supervisor`]}),(0,f.jsx)(`button`,{className:`modal-close-btn`,onClick:()=>{T(!1),$(``)},children:(0,f.jsx)(l,{size:20,strokeWidth:2.5})})]}),(0,f.jsxs)(`form`,{onSubmit:We,children:[(0,f.jsxs)(`div`,{className:`modal-body`,children:[Q&&(0,f.jsx)(`div`,{style:{padding:`var(--space-md)`,backgroundColor:`rgba(220, 38, 38, 0.1)`,color:`var(--color-error)`,borderRadius:`var(--radius-chip)`,fontSize:`13px`,fontWeight:`600`,marginBottom:`12px`},children:Q}),(0,f.jsxs)(`div`,{className:`form-group`,children:[(0,f.jsxs)(`label`,{htmlFor:`edit-prep-name`,className:`form-label`,children:[e===`ar`?`اسم المشرف ثنائي أو ثلاثي`:`Supervisor Name`,` `,(0,f.jsx)(`span`,{style:{color:`var(--color-error)`},children:`*`})]}),(0,f.jsx)(`input`,{id:`edit-prep-name`,name:`name`,type:`text`,className:`text-field`,value:B,onChange:e=>V(e.target.value),required:!0,autoComplete:`name`})]}),(0,f.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:`1fr 1fr`,gap:`var(--space-md)`},children:[(0,f.jsxs)(`div`,{className:`form-group`,children:[(0,f.jsxs)(`label`,{htmlFor:`edit-prep-job-id`,className:`form-label`,children:[e===`ar`?`الرقم الوظيفي (Job ID)`:`Job ID`,` `,(0,f.jsx)(`span`,{style:{color:`var(--color-error)`},children:`*`}),(0,f.jsxs)(`span`,{style:{fontSize:`11px`,color:`#64748b`,fontWeight:`600`,marginInlineStart:`6px`},children:[`🔒 `,e===`ar`?`(ثابت لا يمكن تعديله)`:`(Read-Only)`]})]}),(0,f.jsx)(`input`,{id:`edit-prep-job-id`,name:`job_id`,type:`text`,className:`text-field`,value:H,readOnly:!0,disabled:!0,tabIndex:-1,style:{opacity:.7,cursor:`not-allowed`,backgroundColor:`#e2e8f0`,color:`#334155`,fontWeight:`bold`,pointerEvents:`none`,userSelect:`none`,border:`1.5px solid #cbd5e1`},title:e===`ar`?`الرقم الوظيفي للقراءة فقط وغير قابل للتعديل`:`Job ID is read-only`,required:!0,autoComplete:`off`})]}),(0,f.jsxs)(`div`,{className:`form-group`,children:[(0,f.jsxs)(`label`,{htmlFor:`edit-prep-phone`,className:`form-label`,children:[e===`ar`?`رقم الجوال`:`Phone Number`,` `,(0,f.jsx)(`span`,{style:{color:`var(--color-error)`},children:`*`})]}),(0,f.jsx)(`input`,{id:`edit-prep-phone`,name:`phone`,type:`text`,className:`text-field`,value:W,onChange:e=>G(e.target.value),required:!0,autoComplete:`tel`})]})]}),(0,f.jsxs)(`div`,{style:{padding:`14px`,background:`rgba(30, 80, 142, 0.03)`,border:`1px solid var(--color-border)`,borderRadius:`16px`,marginBottom:`16px`},children:[(0,f.jsxs)(`h4`,{style:{fontSize:`13px`,fontWeight:`bold`,marginBottom:`8px`,color:`var(--color-primary-ui)`},children:[`🎯 `,e===`ar`?`الفصول المكلف بها للتحضير`:`Assigned Classes for Prep`]}),(0,f.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:`2fr auto`,gap:`8px`,alignItems:`end`,marginBottom:`12px`},children:[(0,f.jsx)(`div`,{className:`form-group`,style:{marginBottom:0},children:(0,f.jsxs)(`select`,{id:`edit-prep-assigned-class`,name:`assigned_class`,"aria-label":e===`ar`?`اختر الفصل الدراسي للتكليف`:`Select assigned class`,className:`text-field`,style:{height:`38px`,padding:`6px 12px`},value:X,onChange:e=>Z(e.target.value),children:[(0,f.jsx)(`option`,{value:``,children:e===`ar`?`-- اختر الفصل --`:`-- Select Class --`}),v.map(t=>(0,f.jsx)(`option`,{value:t.name,children:e===`ar`?t.name:t.nameEn},t.id))]})}),(0,f.jsxs)(`button`,{type:`button`,className:`btn-accent`,style:{height:`38px`,padding:`0 14px`,whiteSpace:`nowrap`},onClick:Ge,children:[`➕ `,e===`ar`?`إضافة فصل`:`Add Class`]})]}),(0,f.jsxs)(`div`,{style:{display:`flex`,gap:`6px`,flexWrap:`wrap`,marginTop:`10px`},children:[J.map((e,t)=>(0,f.jsxs)(`span`,{className:`chip`,style:{padding:`4px 10px`,fontSize:`12px`,display:`inline-flex`,alignItems:`center`,gap:`6px`},children:[e,(0,f.jsx)(`button`,{type:`button`,onClick:()=>Ke(e),style:{border:`none`,background:`transparent`,color:`var(--color-error)`,cursor:`pointer`,padding:0,display:`inline-flex`,alignItems:`center`},children:(0,f.jsx)(l,{size:12})})]},t)),J.length===0&&(0,f.jsx)(`span`,{style:{fontSize:`12px`,color:`var(--color-text-secondary)`,fontStyle:`italic`},children:e===`ar`?`لم يتم تكليف المشرف بأي فصول بعد`:`No classes assigned yet`})]})]}),(0,f.jsxs)(`div`,{className:`form-group`,children:[(0,f.jsx)(`label`,{className:`form-label`,children:e===`ar`?`الصورة الشخصية`:`Profile Photo`}),(0,f.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,alignItems:`center`,gap:`8px`,padding:`12px 0`},children:[(0,f.jsx)(`input`,{type:`file`,accept:`image/*`,id:`edit-supervisor-photo-input`,onChange:e=>{let t=e.target.files[0];if(t){let e=new FileReader;e.onloadend=()=>q(e.result),e.readAsDataURL(t)}},style:{display:`none`}}),(0,f.jsx)(`div`,{style:{position:`relative`},children:(0,f.jsx)(`label`,{htmlFor:`edit-supervisor-photo-input`,style:{display:`flex`,flexDirection:`column`,alignItems:`center`,justifyContent:`center`,width:`120px`,height:`120px`,borderRadius:`50%`,border:K&&(K.startsWith(`data:`)||K.startsWith(`http`))?`2px solid var(--color-primary)`:`2px dashed var(--color-border)`,cursor:`pointer`,overflow:`hidden`,backgroundColor:`var(--color-surface)`,transition:`all 0.2s ease`,position:`relative`,boxShadow:`var(--shadow-sm)`},className:`avatar-upload-label`,children:K&&(K.startsWith(`data:`)||K.startsWith(`http`))?(0,f.jsxs)(f.Fragment,{children:[(0,f.jsx)(`img`,{src:K,alt:`Preview`,style:{width:`100%`,height:`100%`,objectFit:`cover`}}),(0,f.jsxs)(`div`,{style:{position:`absolute`,top:0,left:0,width:`100%`,height:`100%`,backgroundColor:`rgba(0,0,0,0.5)`,display:`flex`,flexDirection:`column`,alignItems:`center`,justifyContent:`center`,opacity:0,transition:`opacity 0.2s ease`,color:`#ffffff`,fontSize:`11px`},className:`avatar-hover-overlay`,children:[(0,f.jsx)(r,{size:20,style:{marginBottom:`4px`}}),(0,f.jsx)(`span`,{children:e===`ar`?`تغيير الصورة`:`Change`})]})]}):(0,f.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,alignItems:`center`,color:`var(--color-text-secondary)`},children:[(0,f.jsx)(ee,{size:36,style:{strokeWidth:1.5,marginBottom:`4px`,color:`var(--color-text-tertiary)`}}),(0,f.jsx)(`span`,{style:{fontSize:`11px`,fontWeight:`500`},children:e===`ar`?`رفع الصورة`:`Upload`})]})})})]})]})]}),(0,f.jsxs)(`footer`,{className:`modal-footer`,children:[(0,f.jsx)(`button`,{type:`button`,className:`btn-elevated`,onClick:()=>T(!1),style:{height:`48px`},disabled:S,children:t.cancel}),(0,f.jsx)(`button`,{type:`submit`,className:`btn-filled`,style:{height:`48px`,opacity:S?.7:1},disabled:S,children:S?e===`ar`?`جاري الحفظ...`:`Saving...`:t.submit})]})]})]})}),Te&&(0,f.jsx)(`div`,{className:`modal-overlay no-print`,children:(0,f.jsxs)(`div`,{className:`modal-container`,style:{maxWidth:`580px`},children:[(0,f.jsxs)(`header`,{className:`modal-header`,children:[(0,f.jsxs)(`h3`,{className:`modal-title`,style:{display:`flex`,alignItems:`center`,gap:`8px`},children:[(0,f.jsx)(c,{size:20,color:`#d97706`}),(0,f.jsx)(`span`,{children:e===`ar`?`طباعة كشوفات مشرفي التحضير الجاهزة`:`Print Prep Supervisors Rosters`})]}),(0,f.jsx)(`button`,{className:`modal-close-btn`,onClick:()=>E(!1),children:(0,f.jsx)(l,{size:20,strokeWidth:2.5})})]}),(0,f.jsx)(`div`,{className:`modal-body`,style:{display:`flex`,flexDirection:`column`,gap:`16px`},children:(0,f.jsxs)(`div`,{className:`form-group`,style:{marginBottom:0},children:[(0,f.jsx)(`label`,{className:`form-label`,style:{fontWeight:`700`,marginBottom:`10px`,display:`block`},children:e===`ar`?`اختر نوع الكشف المطلوب للطباعة:`:`Select Roster Template:`}),(0,f.jsx)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`10px`},children:[{id:`job_id`,title:`1. كشف بأسماء مشرفي التحضير مع الأرقام الوظيفية`,desc:`يحتوي على: الرقم التسلسلي (م)، الرقم الوظيفي، واسم مشرف التحضير`},{id:`job_id_phone`,title:`2. كشف بأسماء مشرفي التحضير مع الأرقام الوظيفية وأرقام التلفونات`,desc:`يحتوي على: الرقم التسلسلي (م)، الرقم الوظيفي، اسم مشرف التحضير، ورقم التلفون`},{id:`job_id_phone_classes`,title:`3. كشف بأسماء مشرفي التحضير مع الأرقام الوظيفية وأرقام التلفونات والفصول والشعب المكلف بها`,desc:`يحتوي على: الرقم التسلسلي (م)، الرقم الوظيفي، اسم مشرف التحضير، رقم التلفون، والفصول والشعب المكلف بها`}].map(e=>{let t=D===e.id;return(0,f.jsxs)(`label`,{style:{display:`flex`,alignItems:`flex-start`,gap:`12px`,padding:`12px 14px`,borderRadius:`10px`,border:t?`2px solid #d97706`:`1px solid var(--color-border, #cbd5e1)`,backgroundColor:t?`#fffbeb`:`var(--color-bg-secondary, #f8fafc)`,cursor:`pointer`,transition:`all 0.15s ease`},children:[(0,f.jsx)(`input`,{type:`radio`,name:`supervisor_print_roster_type`,value:e.id,checked:t,onChange:e=>Ee(e.target.value),style:{marginTop:`4px`,accentColor:`#d97706`,width:`16px`,height:`16px`}}),(0,f.jsxs)(`div`,{style:{flex:1},children:[(0,f.jsx)(`div`,{style:{fontWeight:`700`,fontSize:`13.5px`,color:t?`#92400e`:`var(--color-text-primary, #0f172a)`},children:e.title}),(0,f.jsx)(`div`,{style:{fontSize:`12px`,color:`var(--color-text-secondary, #64748b)`,marginTop:`4px`},children:e.desc})]})]},e.id)})})]})}),(0,f.jsxs)(`footer`,{className:`modal-footer`,style:{display:`flex`,justifyContent:`flex-start`,gap:`8px`},children:[(0,f.jsxs)(`button`,{type:`button`,className:`btn-filled`,onClick:Be,disabled:O,style:{display:`flex`,alignItems:`center`,gap:`6px`,backgroundColor:`#d97706`,borderColor:`#d97706`,color:`#fff`,padding:`8px 20px`},children:[(0,f.jsx)(c,{size:16}),(0,f.jsx)(`span`,{children:O?e===`ar`?`جاري تجهيز الكشف...`:`Preparing...`:e===`ar`?`طباعة`:`Print`})]}),(0,f.jsx)(`button`,{type:`button`,className:`btn-elevated`,onClick:()=>E(!1),disabled:O,children:t.cancel})]})]})}),Oe&&(0,f.jsx)(`div`,{className:`modal-overlay no-print`,children:(0,f.jsxs)(`div`,{className:`modal-container`,style:{maxWidth:`580px`,width:`90%`},children:[(0,f.jsxs)(`header`,{className:`modal-header`,style:{borderBottom:`1px solid var(--color-border)`},children:[(0,f.jsxs)(`h3`,{className:`modal-title`,style:{display:`flex`,alignItems:`center`,gap:`8px`,color:`#31859C`},children:[(0,f.jsx)(s,{size:22}),e===`ar`?`الاستيراد والتصدير الذكي (Excel)`:`Smart Import & Export (Excel)`]}),(0,f.jsx)(`button`,{className:`modal-close-btn`,onClick:()=>k(!1),"aria-label":`Close Modal`,children:(0,f.jsx)(l,{size:20,strokeWidth:2.5})})]}),(0,f.jsxs)(`div`,{style:{display:`flex`,borderBottom:`1px solid var(--color-border)`,backgroundColor:`rgba(0,0,0,0.02)`},children:[(0,f.jsx)(`button`,{type:`button`,onClick:()=>ke(`import`),style:{flex:1,padding:`14px`,fontWeight:`600`,fontSize:`14px`,cursor:`pointer`,border:`none`,backgroundColor:`transparent`,borderBottom:A===`import`?`3px solid #31859C`:`3px solid transparent`,color:A===`import`?`#31859C`:`var(--color-text-secondary)`,transition:`all 0.2s ease`},children:e===`ar`?`📥 استيراد مشرفي التحضير`:`📥 Import Prep Supervisors`}),(0,f.jsx)(`button`,{type:`button`,onClick:()=>ke(`export`),style:{flex:1,padding:`14px`,fontWeight:`600`,fontSize:`14px`,cursor:`pointer`,border:`none`,backgroundColor:`transparent`,borderBottom:A===`export`?`3px solid #31859C`:`3px solid transparent`,color:A===`export`?`#31859C`:`var(--color-text-secondary)`,transition:`all 0.2s ease`},children:e===`ar`?`📤 التصدير والنموذج`:`📤 Export & Template`})]}),(0,f.jsx)(`div`,{className:`modal-body`,style:{padding:`24px`},children:A===`import`?(0,f.jsxs)(`form`,{onSubmit:ze,style:{display:`flex`,flexDirection:`column`,gap:`20px`},children:[(0,f.jsxs)(`div`,{className:`form-group`,children:[(0,f.jsx)(`label`,{className:`form-label`,style:{fontWeight:`600`},children:e===`ar`?`ملف Excel أو CSV المراد استيراده (.xlsx, .csv)`:`Excel or CSV File to Import (.xlsx, .csv)`}),(0,f.jsxs)(`div`,{style:{border:`2px dashed rgba(49, 133, 156, 0.3)`,borderRadius:`16px`,padding:`30px 20px`,textAlign:`center`,backgroundColor:j?`rgba(49, 133, 156, 0.02)`:`rgba(0,0,0,0.01)`,cursor:`pointer`,transition:`all 0.2s ease`,position:`relative`},onClick:()=>document.getElementById(`supervisor-excel-file-uploader`).click(),onDragOver:e=>{e.preventDefault()},onDrop:t=>{t.preventDefault();let n=t.dataTransfer.files[0];n&&(n.name.endsWith(`.xlsx`)||n.name.endsWith(`.xls`)||n.name.endsWith(`.csv`))?M(n):alert(e===`ar`?`يرجى اختيار ملف Excel أو CSV صالح.`:`Please choose a valid Excel or CSV file.`)},children:[(0,f.jsx)(`input`,{type:`file`,id:`supervisor-excel-file-uploader`,accept:`.xlsx, .xls, .csv`,style:{display:`none`},onChange:e=>{let t=e.target.files[0];t&&M(t)}}),(0,f.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,alignItems:`center`,gap:`8px`},children:[(0,f.jsx)(s,{size:32,style:{color:`#31859C`,opacity:.8}}),j?(0,f.jsxs)(`div`,{children:[(0,f.jsx)(`div`,{style:{fontWeight:`bold`,color:`var(--color-text)`,fontSize:`14px`},children:j.name}),(0,f.jsxs)(`div`,{style:{fontSize:`12px`,color:`var(--color-text-secondary)`},children:[(j.size/1024).toFixed(1),` KB`]})]}):(0,f.jsxs)(`div`,{children:[(0,f.jsx)(`div`,{style:{fontWeight:`600`,fontSize:`14px`},children:e===`ar`?`اسحب وأفلت الملف هنا أو انقر للتصفح`:`Drag & drop file here or click to browse`}),(0,f.jsx)(`div`,{style:{fontSize:`11px`,color:`var(--color-text-secondary)`,marginTop:`4px`},children:e===`ar`?`صيغة الملف المدعومة: Excel (.xlsx) أو CSV`:`Supported extension: Excel (.xlsx) or CSV`})]})]})]})]}),(N||P>0)&&(0,f.jsxs)(`div`,{style:{padding:`16px`,background:`rgba(0,0,0,0.02)`,borderRadius:`16px`,border:`1px solid var(--color-border)`},children:[(0,f.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,alignItems:`center`,marginBottom:`8px`},children:[(0,f.jsx)(`span`,{style:{fontSize:`13px`,fontWeight:`600`,color:`#31859C`},children:je}),(0,f.jsxs)(`span`,{style:{fontSize:`13px`,fontWeight:`bold`,fontFamily:`var(--font-mono)`},children:[P,`%`]})]}),(0,f.jsx)(`div`,{style:{width:`100%`,height:`8px`,backgroundColor:`rgba(0,0,0,0.06)`,borderRadius:`999px`,overflow:`hidden`},children:(0,f.jsx)(`div`,{style:{width:`${P}%`,height:`100%`,backgroundColor:Me?`#10b981`:`#31859C`,borderRadius:`999px`,transition:`width 0.2s ease-out`}})}),L.length>0&&(0,f.jsxs)(`div`,{style:{marginTop:`14px`,borderTop:`1px dashed var(--color-border)`,paddingTop:`12px`},children:[(0,f.jsx)(`div`,{style:{fontSize:`12px`,fontWeight:`bold`,color:`var(--color-error)`,display:`flex`,alignItems:`center`,gap:`4px`,marginBottom:`8px`},children:(0,f.jsxs)(`span`,{children:[`⚠️ `,e===`ar`?`تنبيهات وتفاصيل الأخطاء:`:`Warnings & Error Details:`]})}),(0,f.jsx)(`ul`,{style:{maxHeight:`120px`,overflowY:`auto`,paddingInlineStart:`16px`,margin:0,fontSize:`12px`,color:`var(--color-text-secondary)`,display:`flex`,flexDirection:`column`,gap:`4px`},children:L.map((e,t)=>(0,f.jsx)(`li`,{style:{direction:`rtl`,textAlign:`right`},children:e},t))})]})]}),(0,f.jsxs)(`div`,{style:{display:`flex`,gap:`8px`,justifyContent:`flex-end`,marginTop:`10px`},children:[(0,f.jsx)(`button`,{type:`button`,className:`btn-elevated`,onClick:()=>k(!1),disabled:N,style:{height:`44px`,padding:`0 18px`},children:e===`ar`?`إلغاء`:`Cancel`}),(0,f.jsx)(`button`,{type:`submit`,className:`btn-filled`,disabled:N||!j,style:{height:`44px`,padding:`0 24px`,backgroundColor:`#31859C`,borderColor:`#31859C`,display:`flex`,alignItems:`center`,gap:`6px`},children:N?e===`ar`?`جاري الاستيراد...`:`Importing...`:e===`ar`?`بدء الاستيراد`:`Start Import`})]})]}):(0,f.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`24px`},children:[(0,f.jsxs)(`div`,{style:{padding:`20px`,border:`1px solid var(--color-border)`,borderRadius:`16px`,backgroundColor:`rgba(0,0,0,0.01)`},children:[(0,f.jsx)(`h4`,{style:{margin:`0 0 4px 0`,fontSize:`15px`,color:`var(--color-text)`},children:e===`ar`?`1. تحميل نموذج Excel فارغ`:`1. Download Empty Excel Template`}),(0,f.jsx)(`p`,{style:{fontSize:`12px`,color:`var(--color-text-secondary)`,margin:`0 0 16px 0`},children:e===`ar`?`قم بتحميل القالب لتعبئة بيانات مشرفي التحضير (الرقم الوظيفي، الاسم، رقم الجوال، والفصول المكلف بها).`:`Download template to fill in prep supervisors data.`}),(0,f.jsx)(`button`,{type:`button`,className:`btn-accent`,onClick:Re,disabled:Fe,style:{height:`42px`,padding:`0 20px`,backgroundColor:`#31859C`,borderColor:`#31859C`},children:Fe?e===`ar`?`جاري التحميل...`:`Downloading...`:e===`ar`?`تحميل القالب (.xlsx)`:`Download Template (.xlsx)`})]}),(0,f.jsxs)(`div`,{style:{padding:`20px`,border:`1px solid var(--color-border)`,borderRadius:`16px`,backgroundColor:`rgba(0,0,0,0.01)`},children:[(0,f.jsx)(`h4`,{style:{margin:`0 0 4px 0`,fontSize:`15px`,color:`var(--color-text)`},children:e===`ar`?`2. تصدير بيانات مشرفي التحضير الحالية`:`2. Export Current Prep Supervisors Data`}),(0,f.jsx)(`p`,{style:{fontSize:`12px`,color:`var(--color-text-secondary)`,margin:`0 0 16px 0`},children:e===`ar`?`تصدير كافة مشرفي التحضير المسجلين في النظام مع الفصول المكلفين بها بصيغة CSV تدعم اللغة العربية.`:`Export all registered prep supervisors into an Arabic-friendly CSV file.`}),(0,f.jsx)(`button`,{type:`button`,className:`btn-filled`,onClick:Le,disabled:Ne,style:{height:`42px`,padding:`0 20px`,backgroundColor:`#31859C`,borderColor:`#31859C`},children:Ne?e===`ar`?`جاري التصدير...`:`Exporting...`:e===`ar`?`تصدير البيانات`:`Export Data`})]}),(0,f.jsx)(`div`,{style:{display:`flex`,justifyContent:`flex-end`,marginTop:`10px`},children:(0,f.jsx)(`button`,{type:`button`,className:`btn-elevated`,onClick:()=>k(!1),style:{height:`44px`,padding:`0 18px`},children:e===`ar`?`إغلاق`:`Close`})})]})})]})})]})}function se(){return(0,f.jsx)(p,{})}export{se as default};