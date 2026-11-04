import{t as e}from"./camera-DghhbObi.js";import{n as t,t as n}from"./PaginationBar-5aeIlAN4.js";import{t as r}from"./plus-B9KZBbfI.js";import{t as i}from"./search-DhFeX4vl.js";import{t as a}from"./upload-DGX5i7En.js";import{t as o}from"./user-D56cNANf.js";import{D as s,J as c,K as l,M as ee,T as te,V as ne,r as u,u as d,z as re}from"./index-c1DpRb1_.js";import{t as ie}from"./sloganBase64-BF9PhYUx.js";var f=c(l(),1),p=ne();function m(){let{lang:c,t:l,renderAvatar:ne,setToastMessage:m,triggerConfirm:ae,canAction:h}=re(),{supervisors:g,supervisorsPagination:_,handleAddSupervisor:oe,handleEditSupervisor:se,handleDeleteSupervisor:ce,fetchSupervisors:v,loading:le}=te(),{classes:ue,fetchClasses:de}=ee(),{page:fe,perPage:pe,search:y,sort:me,direction:he,setPage:ge,setPerPage:_e,setSearch:ve,buildQueryString:ye,goToPrevIfEmpty:be}=t({moduleKey:`supervisors`}),b=ye();(0,f.useEffect)(()=>{v(b)},[v,b]),(0,f.useEffect)(()=>{de()},[de]);let[x,S]=(0,f.useState)(!1),[xe,Se]=(0,f.useState)(y);(0,f.useEffect)(()=>{Se(y)},[y]);let[Ce,C]=(0,f.useState)(!1),[we,w]=(0,f.useState)(!1),[Te,T]=(0,f.useState)(!1),[E,Ee]=(0,f.useState)(`job_id`),[D,De]=(0,f.useState)(!1),[Oe,O]=(0,f.useState)(!1),[k,ke]=(0,f.useState)(`import`),[A,j]=(0,f.useState)(null),[M,Ae]=(0,f.useState)(!1),[N,P]=(0,f.useState)(0),[je,F]=(0,f.useState)(``),[Me,I]=(0,f.useState)([]),[Ne,L]=(0,f.useState)(!1),[R,Pe]=(0,f.useState)(!1),[Fe,Ie]=(0,f.useState)(!1),Le=async()=>{try{Pe(!0);let e=await s.exportSupervisors();if(!e.ok){alert(c===`ar`?`فشل تصدير البيانات`:`Failed to export data`);return}let t=await e.blob(),n=window.URL.createObjectURL(t),r=document.createElement(`a`);r.href=n,r.download=`supervisors_export.csv`,document.body.appendChild(r),r.click(),r.remove()}catch(e){console.error(e),alert(c===`ar`?`حدث خطأ أثناء التصدير`:`Error exporting`)}finally{Pe(!1)}},Re=async()=>{try{Ie(!0);let e=await s.downloadSupervisorTemplate();if(!e.ok){alert(c===`ar`?`فشل تحميل النموذج`:`Failed to download template`);return}let t=await e.blob(),n=window.URL.createObjectURL(t),r=document.createElement(`a`);r.href=n,r.download=`supervisors_template.xlsx`,document.body.appendChild(r),r.click(),r.remove()}catch(e){console.error(e),alert(c===`ar`?`حدث خطأ أثناء تحميل النموذج`:`Error downloading template`)}finally{Ie(!1)}},ze=async e=>{if(e&&e.preventDefault(),!A){alert(c===`ar`?`يرجى اختيار ملف أولاً`:`Please select a file first`);return}Ae(!0),P(10),F(c===`ar`?`جاري رفع الملف...`:`Uploading file...`),I([]),L(!1);let t=new FormData;t.append(`file`,A);let n=setInterval(()=>{P(e=>e>=85?(clearInterval(n),85):e+15)},150);try{let e=await s.importSupervisors(t);clearInterval(n),P(100),e.success?(L(!0),F(e.message),e.errors&&e.errors.length>0&&I(e.errors),m(e.message),v(!0)):(F(c===`ar`?`فشل استيراد البيانات`:`Import failed`),e.errors&&e.errors.length>0?I(e.errors):I([e.message||(c===`ar`?`فشل استيراد البيانات`:`Import failed`)]))}catch(e){clearInterval(n),P(100),F(c===`ar`?`حدث خطأ أثناء الاتصال بالخادم`:`Error communicating with server`),I([e.message||`Error`]),console.error(e)}finally{Ae(!1)}},Be=async()=>{De(!0);try{let e=[];try{let t=await s.getSupervisors(`?per_page=1000`);Array.isArray(t?.supervisors)?e=t.supervisors:Array.isArray(t?.data?.supervisors)?e=t.data.supervisors:Array.isArray(t?.data)?e=t.data:Array.isArray(t)&&(e=t)}catch(e){console.warn(`API supervisors fetch failed, falling back to local state:`,e)}e.length===0&&g.length>0&&(e=[...g]),e=e.map(e=>({id:e.id,jobId:e.jobId||e.job_id||``,name:e.name_ar||e.name||``,phone:e.phone||e.password||``,classes:Array.isArray(e.classes)?e.classes:[]}));let t=e=>e?e.replace(/[\u064B-\u065F\u0670]/g,``).replace(/[إأآٱ]/g,`ا`).replace(/ة/g,`ه`).replace(/ى/g,`ي`).trim():``;e.sort((e,n)=>{let r=t(e.name||``),i=t(n.name||``),a=r.localeCompare(i,`ar`);return a===0?(e.name||``).localeCompare(n.name||``,`ar`):a});let n=new Date().toLocaleDateString(`ar-SA`,{year:`numeric`,month:`long`,day:`numeric`,weekday:`long`}),r=``;r=E===`job_id`?`
          <tr>
            <th style="width: 42px;">م</th>
            <th style="width: 150px; text-align: center;">الرقم الوظيفي</th>
            <th style="text-align: right;">اسم مشرف التحضير</th>
          </tr>
        `:E===`job_id_phone`?`
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
        `;let i=``;i=e.length===0?`
          <tr>
            <td colspan="${{job_id:3,job_id_phone:4,job_id_phone_classes:5}[E]||3}" style="text-align:center;padding:24px;color:#64748b;font-weight:700;">
              لا توجد بيانات مشرفي تحضير مسجلة حالياً
            </td>
          </tr>
        `:e.map((e,t)=>{if(E===`job_id`)return`
              <tr>
                <td class="col-num">${t+1}</td>
                <td class="col-code">${e.jobId}</td>
                <td class="col-name">${e.name}</td>
              </tr>
            `;if(E===`job_id_phone`)return`
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
            `}}).join(``);let a=`<!DOCTYPE html>
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
        <img src="${ie}" alt="Logo" />
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
        <div class="sr-meta-item">إجمالي مشرفي التحضير: <strong>${e.length} مشرف</strong></div>
        <div class="sr-meta-item">التاريخ: <strong>${n}</strong></div>
      </div>
    </div>

    <table class="roster-table">
      <thead>
        ${r}
      </thead>
      <tbody>
        ${i}
      </tbody>
    </table>

    <div class="sr-footer">
      <span>تم إصدار الكشف آلياً عبر نظام إدارة رياض ومدارس أنوار العلى الدولية النموذجية</span>
      <span>صفحة 1 من 1</span>
    </div>
  </div>
</body>
</html>`,o=document.getElementById(`supervisors-print-frame`);o&&o.remove(),o=document.createElement(`iframe`),o.id=`supervisors-print-frame`,o.style.position=`fixed`,o.style.right=`0`,o.style.bottom=`0`,o.style.width=`0`,o.style.height=`0`,o.style.border=`0`,document.body.appendChild(o);let c=o.contentWindow||o.contentDocument,l=c.document||c;l.open(),l.write(a),l.close(),setTimeout(()=>{try{o.contentWindow.focus(),o.contentWindow.print()}catch(e){console.error(`Print trigger error:`,e)}},350),T(!1)}catch(e){console.error(`Roster generation failed:`,e),alert(`حدث خطأ أثناء إعداد كشف الطباعة`)}finally{De(!1)}},[Ve,He]=(0,f.useState)(null),[z,B]=(0,f.useState)(``),[V,H]=(0,f.useState)(``),[U,W]=(0,f.useState)(``),[G,K]=(0,f.useState)(``),[q,J]=(0,f.useState)([]),[Y,X]=(0,f.useState)(``),[Z,Q]=(0,f.useState)(``),Ue=e=>{if(e.preventDefault(),Q(``),!z.trim()||!V.trim()||!U.trim()){Q(c===`ar`?`الرجاء تعبئة جميع الحقول المطلوبة`:`Please fill all required fields`);return}if(q.length===0){Q(c===`ar`?`الرجاء تكليف المشرف بفصل دراسي واحد على الأقل`:`Please assign the supervisor to at least one class`);return}let t=300+g.length+1,n=z.split(` `).map(e=>e.charAt(0).toUpperCase()+e.slice(1)).join(` `),r={id:t,jobId:V.trim(),password:U.trim(),name:z,nameEn:n,classes:q,photo:G||`👩‍🏫`,phone:U.trim()};S(!0),oe(r).then(e=>{e&&e.success?(C(!1),B(``),H(``),W(``),K(``),J([]),X(``),v(b)):Q(e?.message||(c===`ar`?`فشلت العملية`:`Operation failed`))}).catch(e=>{Q(e.message||`Error occurred`)}).finally(()=>{S(!1)})},We=e=>{if(e.preventDefault(),Q(``),!z.trim()||!V.trim()||!U.trim()){Q(c===`ar`?`الرجاء تعبئة جميع الحقول المطلوبة`:`Please fill all required fields`);return}if(q.length===0){Q(c===`ar`?`الرجاء تكليف المشرف بفصل دراسي واحد على الأقل`:`Please assign the supervisor to at least one class`);return}let t=z.split(` `).map(e=>e.charAt(0).toUpperCase()+e.slice(1)).join(` `),n={id:Ve,jobId:V.trim(),password:U.trim(),name:z,nameEn:t,classes:q,photo:G||`👩‍🏫`,phone:U.trim()};S(!0),se(n,Ve).then(e=>{e&&e.success?(w(!1),B(``),H(``),W(``),K(``),J([]),X(``),He(null),v(b)):Q(e?.message||(c===`ar`?`فشلت العملية`:`Operation failed`))}).catch(e=>{Q(e.message||`Error occurred`)}).finally(()=>{S(!1)})},Ge=()=>{if(!Y){m(c===`ar`?`⚠️ يرجى اختيار الفصل الدراسي أولاً!`:`⚠️ Please select a class first!`),setTimeout(()=>m(``),3e3);return}if(q.includes(Y)){m(c===`ar`?`⚠️ هذا الفصل الدراسي مضاف بالفعل للمشرف!`:`⚠️ This class is already assigned to this supervisor!`),setTimeout(()=>m(``),3e3);return}J(e=>[...e,Y]),X(``)},$=e=>{J(t=>t.filter(t=>t!==e))},Ke=e=>{ae({title:c===`ar`?`حذف مشرف التحضير`:`Delete Prep Supervisor`,message:c===`ar`?`هل أنت متأكد من حذف هذا المشرف نهائياً من النظام؟`:`Are you sure you want to delete this supervisor from the system permanently?`,onConfirm:()=>{ce(e).then(e=>{e&&e.success&&v(be(g.length-1))})}})};return(0,p.jsxs)(p.Fragment,{children:[(0,p.jsxs)(`div`,{className:`section-card`,children:[(0,p.jsxs)(`div`,{className:`section-card-header no-print`,style:{display:`flex`,justifyContent:`space-between`,alignItems:`center`,gap:`var(--space-md)`,flexWrap:`wrap`},children:[(0,p.jsx)(`h3`,{className:`section-card-title headline-small`,style:{fontSize:`18px`,margin:0},children:c===`ar`?`إدارة مشرفي التحضير وفصول التكليف`:`Prep Supervisors Management`}),(0,p.jsxs)(`div`,{style:{display:`flex`,gap:`8px`,alignItems:`center`,flexWrap:`wrap`},children:[(0,p.jsxs)(`button`,{className:`btn-secondary`,onClick:()=>T(!0),style:{display:`flex`,alignItems:`center`,gap:`6px`,padding:`8px 16px`,fontSize:`13px`,fontWeight:`700`,color:`#d97706`,borderColor:`#fcd34d`,backgroundColor:`#fffbeb`},children:[(0,p.jsx)(d,{size:16}),c===`ar`?`طباعة كشف`:`Print Roster`]}),(0,p.jsxs)(`button`,{className:`btn-elevated`,onClick:()=>{j(null),P(0),F(``),I([]),L(!1),O(!0)},style:{display:`flex`,alignItems:`center`,gap:`6px`,backgroundColor:`rgba(49, 133, 156, 0.08)`,borderColor:`rgba(49, 133, 156, 0.25)`,color:`#31859C`},children:[(0,p.jsx)(a,{size:16}),c===`ar`?`الاستيراد والتصدير (Excel)`:`Excel Import & Export`]}),h(`prepSupervisors`,`create`)&&(0,p.jsxs)(`button`,{className:`btn-accent`,onClick:()=>{Q(``),B(``),H(``),W(``),K(``),J([]),X(``),C(!0)},children:[(0,p.jsx)(r,{size:18,strokeWidth:2.5,style:{marginInlineEnd:`4px`}}),c===`ar`?`إضافة مشرف تحضير`:`Add Prep Supervisor`]})]})]}),(0,p.jsx)(`div`,{className:`students-controls no-print`,style:{marginBottom:`var(--space-md)`,padding:`0 var(--space-md)`},children:(0,p.jsxs)(`div`,{className:`search-box`,children:[(0,p.jsx)(i,{size:18}),(0,p.jsx)(`input`,{id:`search-prep-supervisors`,name:`search`,type:`text`,className:`text-field`,placeholder:c===`ar`?`البحث باسم المشرف، الرقم الوظيفي، أو الجوال...`:`Search by supervisor name, job ID, or phone...`,value:xe,"aria-label":c===`ar`?`البحث باسم المشرف`:`Search supervisors`,onChange:e=>{Se(e.target.value),ve(e.target.value)}})]})}),(0,p.jsx)(`div`,{className:`students-table-container`,children:(0,p.jsxs)(`table`,{className:`students-table`,children:[(0,p.jsx)(`thead`,{children:(0,p.jsxs)(`tr`,{children:[(0,p.jsx)(`th`,{className:`sticky-col-1`,children:c===`ar`?`الرقم الوظيفي (Job ID)`:`Job ID`}),(0,p.jsx)(`th`,{className:`sticky-col-2`,children:c===`ar`?`اسم المشرف`:`Supervisor Name`}),(0,p.jsx)(`th`,{children:c===`ar`?`الفصول المكلف بها للتحضير`:`Assigned Classes`}),(0,p.jsx)(`th`,{children:c===`ar`?`رقم الجوال`:`Phone Number`}),(h(`prepSupervisors`,`update`)||h(`prepSupervisors`,`delete`))&&(0,p.jsx)(`th`,{className:`no-print`,children:l.action})]})}),(0,p.jsx)(`tbody`,{children:g.map(e=>(0,p.jsxs)(`tr`,{children:[(0,p.jsx)(`td`,{className:`sticky-col-1`,style:{fontFamily:`var(--font-mono)`,fontWeight:`bold`},children:e.jobId}),(0,p.jsxs)(`td`,{className:`sticky-col-2`,style:{fontWeight:`600`},children:[ne(e.photo,`👩‍🏫`),c===`ar`?e.name:e.nameEn]}),(0,p.jsx)(`td`,{children:(0,p.jsx)(`div`,{style:{display:`flex`,gap:`4px`,flexWrap:`wrap`,maxHeight:`54px`,overflowY:`auto`},children:e.classes&&e.classes.length>0?(0,p.jsxs)(p.Fragment,{children:[e.classes.slice(0,3).map((e,t)=>(0,p.jsx)(`span`,{className:`chip`,style:{cursor:`default`,fontSize:`11px`,padding:`2px 8px`},children:e},t)),e.classes.length>3&&(0,p.jsxs)(`span`,{title:e.classes.join(`, `),className:`chip`,style:{cursor:`help`,fontSize:`11px`,padding:`2px 8px`,background:`var(--color-primary-ui)`,color:`#fff`,fontWeight:`bold`},children:[`+`,e.classes.length-3,` `,c===`ar`?`فصول أخرى`:`more`]})]}):(0,p.jsx)(`span`,{style:{fontSize:`11px`,color:`var(--color-text-secondary)`},children:`—`})})}),(0,p.jsx)(`td`,{style:{fontFamily:`var(--font-mono)`},children:e.phone||e.password}),(h(`prepSupervisors`,`update`)||h(`prepSupervisors`,`delete`))&&(0,p.jsx)(`td`,{className:`no-print`,children:(0,p.jsxs)(`div`,{style:{display:`flex`,gap:`8px`},children:[h(`prepSupervisors`,`update`)&&(0,p.jsxs)(`button`,{className:`btn-elevated`,style:{padding:`6px 12px`,fontSize:`11px`},onClick:()=>{Q(``),He(e.id),B(e.name),H(e.jobId),W(e.phone||e.password),K(e.photo),J(e.classes||[]),X(``),w(!0)},children:[`📝 `,c===`ar`?`تعديل`:`Edit`]}),h(`prepSupervisors`,`delete`)&&(0,p.jsxs)(`button`,{className:`btn-elevated`,style:{padding:`6px 12px`,fontSize:`11px`,backgroundColor:`rgba(220, 38, 38, 0.1)`,color:`var(--color-error)`},onClick:()=>Ke(e.id),children:[`🗑️ `,c===`ar`?`حذف`:`Delete`]})]})})]},e.jobId))})]})}),(0,p.jsx)(`div`,{className:`no-print`,style:{padding:`0 var(--space-md)`,marginBottom:`var(--space-md)`},children:(0,p.jsx)(n,{page:fe,lastPage:_.lastPage,total:_.total,from:_.from,to:_.to,perPage:pe,onPageChange:ge,onPerPageChange:_e,loading:le,lang:c})})]}),Ce&&(0,p.jsx)(`div`,{className:`modal-overlay no-print`,children:(0,p.jsxs)(`div`,{className:`modal-container`,style:{maxWidth:`500px`},children:[(0,p.jsxs)(`header`,{className:`modal-header`,children:[(0,p.jsxs)(`h3`,{className:`modal-title`,children:[`👩‍🏫 `,c===`ar`?`إضافة مشرف تحضير جديد`:`Add New Prep Supervisor`]}),(0,p.jsx)(`button`,{className:`modal-close-btn`,onClick:()=>{C(!1),Q(``)},children:(0,p.jsx)(u,{size:20,strokeWidth:2.5})})]}),(0,p.jsxs)(`form`,{onSubmit:Ue,children:[(0,p.jsxs)(`div`,{className:`modal-body`,children:[Z&&(0,p.jsx)(`div`,{style:{padding:`var(--space-md)`,backgroundColor:`rgba(220, 38, 38, 0.1)`,color:`var(--color-error)`,borderRadius:`var(--radius-chip)`,fontSize:`13px`,fontWeight:`600`,marginBottom:`12px`},children:Z}),(0,p.jsxs)(`div`,{className:`form-group`,children:[(0,p.jsxs)(`label`,{htmlFor:`add-prep-name`,className:`form-label`,children:[c===`ar`?`اسم المشرف ثنائي أو ثلاثي`:`Supervisor Name`,` `,(0,p.jsx)(`span`,{style:{color:`var(--color-error)`},children:`*`})]}),(0,p.jsx)(`input`,{id:`add-prep-name`,name:`name`,type:`text`,className:`text-field`,placeholder:c===`ar`?`مثال: أ. منى الحربي`:`e.g. Ms. Mona Al-Harbi`,value:z,onChange:e=>B(e.target.value),required:!0,autoComplete:`name`})]}),(0,p.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:`1fr 1fr`,gap:`var(--space-md)`},children:[(0,p.jsxs)(`div`,{className:`form-group`,children:[(0,p.jsxs)(`label`,{htmlFor:`add-prep-job-id`,className:`form-label`,children:[c===`ar`?`الرقم الوظيفي (Job ID)`:`Job ID`,` `,(0,p.jsx)(`span`,{style:{color:`var(--color-error)`},children:`*`})]}),(0,p.jsx)(`input`,{id:`add-prep-job-id`,name:`job_id`,type:`text`,className:`text-field`,placeholder:`P102`,value:V,onChange:e=>H(e.target.value),required:!0,autoComplete:`off`})]}),(0,p.jsxs)(`div`,{className:`form-group`,children:[(0,p.jsxs)(`label`,{htmlFor:`add-prep-phone`,className:`form-label`,children:[c===`ar`?`رقم الجوال`:`Phone Number`,` `,(0,p.jsx)(`span`,{style:{color:`var(--color-error)`},children:`*`})]}),(0,p.jsx)(`input`,{id:`add-prep-phone`,name:`phone`,type:`text`,className:`text-field`,placeholder:`7xxxxxxxx`,value:U,onChange:e=>W(e.target.value),required:!0,autoComplete:`tel`})]})]}),(0,p.jsxs)(`div`,{style:{padding:`14px`,background:`rgba(30, 80, 142, 0.03)`,border:`1px solid var(--color-border)`,borderRadius:`16px`,marginBottom:`16px`},children:[(0,p.jsxs)(`h4`,{style:{fontSize:`13px`,fontWeight:`bold`,marginBottom:`8px`,color:`var(--color-primary-ui)`},children:[`🎯 `,c===`ar`?`الفصول المكلف بها للتحضير`:`Assigned Classes for Prep`]}),(0,p.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:`2fr auto`,gap:`8px`,alignItems:`end`,marginBottom:`12px`},children:[(0,p.jsx)(`div`,{className:`form-group`,style:{marginBottom:0},children:(0,p.jsxs)(`select`,{id:`add-prep-assigned-class`,name:`assigned_class`,"aria-label":c===`ar`?`اختر الفصل الدراسي للتكليف`:`Select assigned class`,className:`text-field`,style:{height:`38px`,padding:`6px 12px`},value:Y,onChange:e=>X(e.target.value),children:[(0,p.jsx)(`option`,{value:``,children:c===`ar`?`-- اختر الفصل --`:`-- Select Class --`}),ue.map(e=>(0,p.jsx)(`option`,{value:e.name,children:c===`ar`?e.name:e.nameEn},e.id))]})}),(0,p.jsxs)(`button`,{type:`button`,className:`btn-accent`,style:{height:`38px`,padding:`0 14px`,whiteSpace:`nowrap`},onClick:Ge,children:[`➕ `,c===`ar`?`إضافة فصل`:`Add Class`]})]}),(0,p.jsxs)(`div`,{style:{display:`flex`,gap:`6px`,flexWrap:`wrap`,marginTop:`10px`},children:[q.map((e,t)=>(0,p.jsxs)(`span`,{className:`chip`,style:{padding:`4px 10px`,fontSize:`12px`,display:`inline-flex`,alignItems:`center`,gap:`6px`},children:[e,(0,p.jsx)(`button`,{type:`button`,onClick:()=>$(e),style:{border:`none`,background:`transparent`,color:`var(--color-error)`,cursor:`pointer`,padding:0,display:`inline-flex`,alignItems:`center`},children:(0,p.jsx)(u,{size:12})})]},t)),q.length===0&&(0,p.jsx)(`span`,{style:{fontSize:`12px`,color:`var(--color-text-secondary)`,fontStyle:`italic`},children:c===`ar`?`لم يتم تكليف المشرف بأي فصول بعد`:`No classes assigned yet`})]})]}),(0,p.jsxs)(`div`,{className:`form-group`,children:[(0,p.jsx)(`label`,{className:`form-label`,children:c===`ar`?`الصورة الشخصية`:`Profile Photo`}),(0,p.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,alignItems:`center`,gap:`8px`,padding:`12px 0`},children:[(0,p.jsx)(`input`,{type:`file`,accept:`image/*`,id:`add-supervisor-photo-input`,onChange:e=>{let t=e.target.files[0];if(t){let e=new FileReader;e.onloadend=()=>K(e.result),e.readAsDataURL(t)}},style:{display:`none`}}),(0,p.jsx)(`div`,{style:{position:`relative`},children:(0,p.jsx)(`label`,{htmlFor:`add-supervisor-photo-input`,style:{display:`flex`,flexDirection:`column`,alignItems:`center`,justifyContent:`center`,width:`120px`,height:`120px`,borderRadius:`50%`,border:G&&G.startsWith(`data:`)?`2px solid var(--color-primary)`:`2px dashed var(--color-border)`,cursor:`pointer`,overflow:`hidden`,backgroundColor:`var(--color-surface)`,transition:`all 0.2s ease`,position:`relative`,boxShadow:`var(--shadow-sm)`},className:`avatar-upload-label`,children:G&&G.startsWith(`data:`)?(0,p.jsxs)(p.Fragment,{children:[(0,p.jsx)(`img`,{src:G,alt:`Preview`,style:{width:`100%`,height:`100%`,objectFit:`cover`}}),(0,p.jsxs)(`div`,{style:{position:`absolute`,top:0,left:0,width:`100%`,height:`100%`,backgroundColor:`rgba(0,0,0,0.5)`,display:`flex`,flexDirection:`column`,alignItems:`center`,justifyContent:`center`,opacity:0,transition:`opacity 0.2s ease`,color:`#ffffff`,fontSize:`11px`},className:`avatar-hover-overlay`,children:[(0,p.jsx)(e,{size:20,style:{marginBottom:`4px`}}),(0,p.jsx)(`span`,{children:c===`ar`?`تغيير الصورة`:`Change`})]})]}):(0,p.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,alignItems:`center`,color:`var(--color-text-secondary)`},children:[(0,p.jsx)(o,{size:36,style:{strokeWidth:1.5,marginBottom:`4px`,color:`var(--color-text-tertiary)`}}),(0,p.jsx)(`span`,{style:{fontSize:`11px`,fontWeight:`500`},children:c===`ar`?`رفع الصورة`:`Upload`})]})})})]})]})]}),(0,p.jsxs)(`footer`,{className:`modal-footer`,children:[(0,p.jsx)(`button`,{type:`button`,className:`btn-elevated`,onClick:()=>C(!1),style:{height:`48px`},disabled:x,children:l.cancel}),(0,p.jsx)(`button`,{type:`submit`,className:`btn-filled`,style:{height:`48px`,opacity:x?.7:1},disabled:x,children:x?c===`ar`?`جاري الحفظ...`:`Saving...`:l.submit})]})]})]})}),we&&(0,p.jsx)(`div`,{className:`modal-overlay no-print`,children:(0,p.jsxs)(`div`,{className:`modal-container`,style:{maxWidth:`500px`},children:[(0,p.jsxs)(`header`,{className:`modal-header`,children:[(0,p.jsxs)(`h3`,{className:`modal-title`,children:[`👩‍🏫 `,c===`ar`?`تعديل بيانات مشرف التحضير`:`Edit Prep Supervisor`]}),(0,p.jsx)(`button`,{className:`modal-close-btn`,onClick:()=>{w(!1),Q(``)},children:(0,p.jsx)(u,{size:20,strokeWidth:2.5})})]}),(0,p.jsxs)(`form`,{onSubmit:We,children:[(0,p.jsxs)(`div`,{className:`modal-body`,children:[Z&&(0,p.jsx)(`div`,{style:{padding:`var(--space-md)`,backgroundColor:`rgba(220, 38, 38, 0.1)`,color:`var(--color-error)`,borderRadius:`var(--radius-chip)`,fontSize:`13px`,fontWeight:`600`,marginBottom:`12px`},children:Z}),(0,p.jsxs)(`div`,{className:`form-group`,children:[(0,p.jsxs)(`label`,{htmlFor:`edit-prep-name`,className:`form-label`,children:[c===`ar`?`اسم المشرف ثنائي أو ثلاثي`:`Supervisor Name`,` `,(0,p.jsx)(`span`,{style:{color:`var(--color-error)`},children:`*`})]}),(0,p.jsx)(`input`,{id:`edit-prep-name`,name:`name`,type:`text`,className:`text-field`,value:z,onChange:e=>B(e.target.value),required:!0,autoComplete:`name`})]}),(0,p.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:`1fr 1fr`,gap:`var(--space-md)`},children:[(0,p.jsxs)(`div`,{className:`form-group`,children:[(0,p.jsxs)(`label`,{htmlFor:`edit-prep-job-id`,className:`form-label`,children:[c===`ar`?`الرقم الوظيفي (Job ID)`:`Job ID`,` `,(0,p.jsx)(`span`,{style:{color:`var(--color-error)`},children:`*`}),(0,p.jsxs)(`span`,{style:{fontSize:`11px`,color:`#64748b`,fontWeight:`600`,marginInlineStart:`6px`},children:[`🔒 `,c===`ar`?`(ثابت لا يمكن تعديله)`:`(Read-Only)`]})]}),(0,p.jsx)(`input`,{id:`edit-prep-job-id`,name:`job_id`,type:`text`,className:`text-field`,value:V,readOnly:!0,disabled:!0,tabIndex:-1,style:{opacity:.7,cursor:`not-allowed`,backgroundColor:`#e2e8f0`,color:`#334155`,fontWeight:`bold`,pointerEvents:`none`,userSelect:`none`,border:`1.5px solid #cbd5e1`},title:c===`ar`?`الرقم الوظيفي للقراءة فقط وغير قابل للتعديل`:`Job ID is read-only`,required:!0,autoComplete:`off`})]}),(0,p.jsxs)(`div`,{className:`form-group`,children:[(0,p.jsxs)(`label`,{htmlFor:`edit-prep-phone`,className:`form-label`,children:[c===`ar`?`رقم الجوال`:`Phone Number`,` `,(0,p.jsx)(`span`,{style:{color:`var(--color-error)`},children:`*`})]}),(0,p.jsx)(`input`,{id:`edit-prep-phone`,name:`phone`,type:`text`,className:`text-field`,value:U,onChange:e=>W(e.target.value),required:!0,autoComplete:`tel`})]})]}),(0,p.jsxs)(`div`,{style:{padding:`14px`,background:`rgba(30, 80, 142, 0.03)`,border:`1px solid var(--color-border)`,borderRadius:`16px`,marginBottom:`16px`},children:[(0,p.jsxs)(`h4`,{style:{fontSize:`13px`,fontWeight:`bold`,marginBottom:`8px`,color:`var(--color-primary-ui)`},children:[`🎯 `,c===`ar`?`الفصول المكلف بها للتحضير`:`Assigned Classes for Prep`]}),(0,p.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:`2fr auto`,gap:`8px`,alignItems:`end`,marginBottom:`12px`},children:[(0,p.jsx)(`div`,{className:`form-group`,style:{marginBottom:0},children:(0,p.jsxs)(`select`,{id:`edit-prep-assigned-class`,name:`assigned_class`,"aria-label":c===`ar`?`اختر الفصل الدراسي للتكليف`:`Select assigned class`,className:`text-field`,style:{height:`38px`,padding:`6px 12px`},value:Y,onChange:e=>X(e.target.value),children:[(0,p.jsx)(`option`,{value:``,children:c===`ar`?`-- اختر الفصل --`:`-- Select Class --`}),ue.map(e=>(0,p.jsx)(`option`,{value:e.name,children:c===`ar`?e.name:e.nameEn},e.id))]})}),(0,p.jsxs)(`button`,{type:`button`,className:`btn-accent`,style:{height:`38px`,padding:`0 14px`,whiteSpace:`nowrap`},onClick:Ge,children:[`➕ `,c===`ar`?`إضافة فصل`:`Add Class`]})]}),(0,p.jsxs)(`div`,{style:{display:`flex`,gap:`6px`,flexWrap:`wrap`,marginTop:`10px`},children:[q.map((e,t)=>(0,p.jsxs)(`span`,{className:`chip`,style:{padding:`4px 10px`,fontSize:`12px`,display:`inline-flex`,alignItems:`center`,gap:`6px`},children:[e,(0,p.jsx)(`button`,{type:`button`,onClick:()=>$(e),style:{border:`none`,background:`transparent`,color:`var(--color-error)`,cursor:`pointer`,padding:0,display:`inline-flex`,alignItems:`center`},children:(0,p.jsx)(u,{size:12})})]},t)),q.length===0&&(0,p.jsx)(`span`,{style:{fontSize:`12px`,color:`var(--color-text-secondary)`,fontStyle:`italic`},children:c===`ar`?`لم يتم تكليف المشرف بأي فصول بعد`:`No classes assigned yet`})]})]}),(0,p.jsxs)(`div`,{className:`form-group`,children:[(0,p.jsx)(`label`,{className:`form-label`,children:c===`ar`?`الصورة الشخصية`:`Profile Photo`}),(0,p.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,alignItems:`center`,gap:`8px`,padding:`12px 0`},children:[(0,p.jsx)(`input`,{type:`file`,accept:`image/*`,id:`edit-supervisor-photo-input`,onChange:e=>{let t=e.target.files[0];if(t){let e=new FileReader;e.onloadend=()=>K(e.result),e.readAsDataURL(t)}},style:{display:`none`}}),(0,p.jsx)(`div`,{style:{position:`relative`},children:(0,p.jsx)(`label`,{htmlFor:`edit-supervisor-photo-input`,style:{display:`flex`,flexDirection:`column`,alignItems:`center`,justifyContent:`center`,width:`120px`,height:`120px`,borderRadius:`50%`,border:G&&(G.startsWith(`data:`)||G.startsWith(`http`))?`2px solid var(--color-primary)`:`2px dashed var(--color-border)`,cursor:`pointer`,overflow:`hidden`,backgroundColor:`var(--color-surface)`,transition:`all 0.2s ease`,position:`relative`,boxShadow:`var(--shadow-sm)`},className:`avatar-upload-label`,children:G&&(G.startsWith(`data:`)||G.startsWith(`http`))?(0,p.jsxs)(p.Fragment,{children:[(0,p.jsx)(`img`,{src:G,alt:`Preview`,style:{width:`100%`,height:`100%`,objectFit:`cover`}}),(0,p.jsxs)(`div`,{style:{position:`absolute`,top:0,left:0,width:`100%`,height:`100%`,backgroundColor:`rgba(0,0,0,0.5)`,display:`flex`,flexDirection:`column`,alignItems:`center`,justifyContent:`center`,opacity:0,transition:`opacity 0.2s ease`,color:`#ffffff`,fontSize:`11px`},className:`avatar-hover-overlay`,children:[(0,p.jsx)(e,{size:20,style:{marginBottom:`4px`}}),(0,p.jsx)(`span`,{children:c===`ar`?`تغيير الصورة`:`Change`})]})]}):(0,p.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,alignItems:`center`,color:`var(--color-text-secondary)`},children:[(0,p.jsx)(o,{size:36,style:{strokeWidth:1.5,marginBottom:`4px`,color:`var(--color-text-tertiary)`}}),(0,p.jsx)(`span`,{style:{fontSize:`11px`,fontWeight:`500`},children:c===`ar`?`رفع الصورة`:`Upload`})]})})})]})]})]}),(0,p.jsxs)(`footer`,{className:`modal-footer`,children:[(0,p.jsx)(`button`,{type:`button`,className:`btn-elevated`,onClick:()=>w(!1),style:{height:`48px`},disabled:x,children:l.cancel}),(0,p.jsx)(`button`,{type:`submit`,className:`btn-filled`,style:{height:`48px`,opacity:x?.7:1},disabled:x,children:x?c===`ar`?`جاري الحفظ...`:`Saving...`:l.submit})]})]})]})}),Te&&(0,p.jsx)(`div`,{className:`modal-overlay no-print`,children:(0,p.jsxs)(`div`,{className:`modal-container`,style:{maxWidth:`580px`},children:[(0,p.jsxs)(`header`,{className:`modal-header`,children:[(0,p.jsxs)(`h3`,{className:`modal-title`,style:{display:`flex`,alignItems:`center`,gap:`8px`},children:[(0,p.jsx)(d,{size:20,color:`#d97706`}),(0,p.jsx)(`span`,{children:c===`ar`?`طباعة كشوفات مشرفي التحضير الجاهزة`:`Print Prep Supervisors Rosters`})]}),(0,p.jsx)(`button`,{className:`modal-close-btn`,onClick:()=>T(!1),children:(0,p.jsx)(u,{size:20,strokeWidth:2.5})})]}),(0,p.jsx)(`div`,{className:`modal-body`,style:{display:`flex`,flexDirection:`column`,gap:`16px`},children:(0,p.jsxs)(`div`,{className:`form-group`,style:{marginBottom:0},children:[(0,p.jsx)(`label`,{className:`form-label`,style:{fontWeight:`700`,marginBottom:`10px`,display:`block`},children:c===`ar`?`اختر نوع الكشف المطلوب للطباعة:`:`Select Roster Template:`}),(0,p.jsx)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`10px`},children:[{id:`job_id`,title:`1. كشف بأسماء مشرفي التحضير مع الأرقام الوظيفية`,desc:`يحتوي على: الرقم التسلسلي (م)، الرقم الوظيفي، واسم مشرف التحضير`},{id:`job_id_phone`,title:`2. كشف بأسماء مشرفي التحضير مع الأرقام الوظيفية وأرقام التلفونات`,desc:`يحتوي على: الرقم التسلسلي (م)، الرقم الوظيفي، اسم مشرف التحضير، ورقم التلفون`},{id:`job_id_phone_classes`,title:`3. كشف بأسماء مشرفي التحضير مع الأرقام الوظيفية وأرقام التلفونات والفصول والشعب المكلف بها`,desc:`يحتوي على: الرقم التسلسلي (م)، الرقم الوظيفي، اسم مشرف التحضير، رقم التلفون، والفصول والشعب المكلف بها`}].map(e=>{let t=E===e.id;return(0,p.jsxs)(`label`,{style:{display:`flex`,alignItems:`flex-start`,gap:`12px`,padding:`12px 14px`,borderRadius:`10px`,border:t?`2px solid #d97706`:`1px solid var(--color-border, #cbd5e1)`,backgroundColor:t?`#fffbeb`:`var(--color-bg-secondary, #f8fafc)`,cursor:`pointer`,transition:`all 0.15s ease`},children:[(0,p.jsx)(`input`,{type:`radio`,name:`supervisor_print_roster_type`,value:e.id,checked:t,onChange:e=>Ee(e.target.value),style:{marginTop:`4px`,accentColor:`#d97706`,width:`16px`,height:`16px`}}),(0,p.jsxs)(`div`,{style:{flex:1},children:[(0,p.jsx)(`div`,{style:{fontWeight:`700`,fontSize:`13.5px`,color:t?`#92400e`:`var(--color-text-primary, #0f172a)`},children:e.title}),(0,p.jsx)(`div`,{style:{fontSize:`12px`,color:`var(--color-text-secondary, #64748b)`,marginTop:`4px`},children:e.desc})]})]},e.id)})})]})}),(0,p.jsxs)(`footer`,{className:`modal-footer`,style:{display:`flex`,justifyContent:`flex-start`,gap:`8px`},children:[(0,p.jsxs)(`button`,{type:`button`,className:`btn-filled`,onClick:Be,disabled:D,style:{display:`flex`,alignItems:`center`,gap:`6px`,backgroundColor:`#d97706`,borderColor:`#d97706`,color:`#fff`,padding:`8px 20px`},children:[(0,p.jsx)(d,{size:16}),(0,p.jsx)(`span`,{children:D?c===`ar`?`جاري تجهيز الكشف...`:`Preparing...`:c===`ar`?`طباعة`:`Print`})]}),(0,p.jsx)(`button`,{type:`button`,className:`btn-elevated`,onClick:()=>T(!1),disabled:D,children:l.cancel})]})]})}),Oe&&(0,p.jsx)(`div`,{className:`modal-overlay no-print`,children:(0,p.jsxs)(`div`,{className:`modal-container`,style:{maxWidth:`580px`,width:`90%`},children:[(0,p.jsxs)(`header`,{className:`modal-header`,style:{borderBottom:`1px solid var(--color-border)`},children:[(0,p.jsxs)(`h3`,{className:`modal-title`,style:{display:`flex`,alignItems:`center`,gap:`8px`,color:`#31859C`},children:[(0,p.jsx)(a,{size:22}),c===`ar`?`الاستيراد والتصدير الذكي (Excel)`:`Smart Import & Export (Excel)`]}),(0,p.jsx)(`button`,{className:`modal-close-btn`,onClick:()=>O(!1),"aria-label":`Close Modal`,children:(0,p.jsx)(u,{size:20,strokeWidth:2.5})})]}),(0,p.jsxs)(`div`,{style:{display:`flex`,borderBottom:`1px solid var(--color-border)`,backgroundColor:`rgba(0,0,0,0.02)`},children:[(0,p.jsx)(`button`,{type:`button`,onClick:()=>ke(`import`),style:{flex:1,padding:`14px`,fontWeight:`600`,fontSize:`14px`,cursor:`pointer`,border:`none`,backgroundColor:`transparent`,borderBottom:k===`import`?`3px solid #31859C`:`3px solid transparent`,color:k===`import`?`#31859C`:`var(--color-text-secondary)`,transition:`all 0.2s ease`},children:c===`ar`?`📥 استيراد مشرفي التحضير`:`📥 Import Prep Supervisors`}),(0,p.jsx)(`button`,{type:`button`,onClick:()=>ke(`export`),style:{flex:1,padding:`14px`,fontWeight:`600`,fontSize:`14px`,cursor:`pointer`,border:`none`,backgroundColor:`transparent`,borderBottom:k===`export`?`3px solid #31859C`:`3px solid transparent`,color:k===`export`?`#31859C`:`var(--color-text-secondary)`,transition:`all 0.2s ease`},children:c===`ar`?`📤 التصدير والنموذج`:`📤 Export & Template`})]}),(0,p.jsx)(`div`,{className:`modal-body`,style:{padding:`24px`},children:k===`import`?(0,p.jsxs)(`form`,{onSubmit:ze,style:{display:`flex`,flexDirection:`column`,gap:`20px`},children:[(0,p.jsxs)(`div`,{className:`form-group`,children:[(0,p.jsx)(`label`,{className:`form-label`,style:{fontWeight:`600`},children:c===`ar`?`ملف Excel أو CSV المراد استيراده (.xlsx, .csv)`:`Excel or CSV File to Import (.xlsx, .csv)`}),(0,p.jsxs)(`div`,{style:{border:`2px dashed rgba(49, 133, 156, 0.3)`,borderRadius:`16px`,padding:`30px 20px`,textAlign:`center`,backgroundColor:A?`rgba(49, 133, 156, 0.02)`:`rgba(0,0,0,0.01)`,cursor:`pointer`,transition:`all 0.2s ease`,position:`relative`},onClick:()=>document.getElementById(`supervisor-excel-file-uploader`).click(),onDragOver:e=>{e.preventDefault()},onDrop:e=>{e.preventDefault();let t=e.dataTransfer.files[0];t&&(t.name.endsWith(`.xlsx`)||t.name.endsWith(`.xls`)||t.name.endsWith(`.csv`))?j(t):alert(c===`ar`?`يرجى اختيار ملف Excel أو CSV صالح.`:`Please choose a valid Excel or CSV file.`)},children:[(0,p.jsx)(`input`,{type:`file`,id:`supervisor-excel-file-uploader`,accept:`.xlsx, .xls, .csv`,style:{display:`none`},onChange:e=>{let t=e.target.files[0];t&&j(t)}}),(0,p.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,alignItems:`center`,gap:`8px`},children:[(0,p.jsx)(a,{size:32,style:{color:`#31859C`,opacity:.8}}),A?(0,p.jsxs)(`div`,{children:[(0,p.jsx)(`div`,{style:{fontWeight:`bold`,color:`var(--color-text)`,fontSize:`14px`},children:A.name}),(0,p.jsxs)(`div`,{style:{fontSize:`12px`,color:`var(--color-text-secondary)`},children:[(A.size/1024).toFixed(1),` KB`]})]}):(0,p.jsxs)(`div`,{children:[(0,p.jsx)(`div`,{style:{fontWeight:`600`,fontSize:`14px`},children:c===`ar`?`اسحب وأفلت الملف هنا أو انقر للتصفح`:`Drag & drop file here or click to browse`}),(0,p.jsx)(`div`,{style:{fontSize:`11px`,color:`var(--color-text-secondary)`,marginTop:`4px`},children:c===`ar`?`صيغة الملف المدعومة: Excel (.xlsx) أو CSV`:`Supported extension: Excel (.xlsx) or CSV`})]})]})]})]}),(M||N>0)&&(0,p.jsxs)(`div`,{style:{padding:`16px`,background:`rgba(0,0,0,0.02)`,borderRadius:`16px`,border:`1px solid var(--color-border)`},children:[(0,p.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,alignItems:`center`,marginBottom:`8px`},children:[(0,p.jsx)(`span`,{style:{fontSize:`13px`,fontWeight:`600`,color:`#31859C`},children:je}),(0,p.jsxs)(`span`,{style:{fontSize:`13px`,fontWeight:`bold`,fontFamily:`var(--font-mono)`},children:[N,`%`]})]}),(0,p.jsx)(`div`,{style:{width:`100%`,height:`8px`,backgroundColor:`rgba(0,0,0,0.06)`,borderRadius:`999px`,overflow:`hidden`},children:(0,p.jsx)(`div`,{style:{width:`${N}%`,height:`100%`,backgroundColor:Ne?`#10b981`:`#31859C`,borderRadius:`999px`,transition:`width 0.2s ease-out`}})}),Me.length>0&&(0,p.jsxs)(`div`,{style:{marginTop:`14px`,borderTop:`1px dashed var(--color-border)`,paddingTop:`12px`},children:[(0,p.jsx)(`div`,{style:{fontSize:`12px`,fontWeight:`bold`,color:`var(--color-error)`,display:`flex`,alignItems:`center`,gap:`4px`,marginBottom:`8px`},children:(0,p.jsxs)(`span`,{children:[`⚠️ `,c===`ar`?`تنبيهات وتفاصيل الأخطاء:`:`Warnings & Error Details:`]})}),(0,p.jsx)(`ul`,{style:{maxHeight:`120px`,overflowY:`auto`,paddingInlineStart:`16px`,margin:0,fontSize:`12px`,color:`var(--color-text-secondary)`,display:`flex`,flexDirection:`column`,gap:`4px`},children:Me.map((e,t)=>(0,p.jsx)(`li`,{style:{direction:`rtl`,textAlign:`right`},children:e},t))})]})]}),(0,p.jsxs)(`div`,{style:{display:`flex`,gap:`8px`,justifyContent:`flex-end`,marginTop:`10px`},children:[(0,p.jsx)(`button`,{type:`button`,className:`btn-elevated`,onClick:()=>O(!1),disabled:M,style:{height:`44px`,padding:`0 18px`},children:c===`ar`?`إلغاء`:`Cancel`}),(0,p.jsx)(`button`,{type:`submit`,className:`btn-filled`,disabled:M||!A,style:{height:`44px`,padding:`0 24px`,backgroundColor:`#31859C`,borderColor:`#31859C`,display:`flex`,alignItems:`center`,gap:`6px`},children:M?c===`ar`?`جاري الاستيراد...`:`Importing...`:c===`ar`?`بدء الاستيراد`:`Start Import`})]})]}):(0,p.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`24px`},children:[(0,p.jsxs)(`div`,{style:{padding:`20px`,border:`1px solid var(--color-border)`,borderRadius:`16px`,backgroundColor:`rgba(0,0,0,0.01)`},children:[(0,p.jsx)(`h4`,{style:{margin:`0 0 4px 0`,fontSize:`15px`,color:`var(--color-text)`},children:c===`ar`?`1. تحميل نموذج Excel فارغ`:`1. Download Empty Excel Template`}),(0,p.jsx)(`p`,{style:{fontSize:`12px`,color:`var(--color-text-secondary)`,margin:`0 0 16px 0`},children:c===`ar`?`قم بتحميل القالب لتعبئة بيانات مشرفي التحضير (الرقم الوظيفي، الاسم، رقم الجوال، والفصول المكلف بها).`:`Download template to fill in prep supervisors data.`}),(0,p.jsx)(`button`,{type:`button`,className:`btn-accent`,onClick:Re,disabled:Fe,style:{height:`42px`,padding:`0 20px`,backgroundColor:`#31859C`,borderColor:`#31859C`},children:Fe?c===`ar`?`جاري التحميل...`:`Downloading...`:c===`ar`?`تحميل القالب (.xlsx)`:`Download Template (.xlsx)`})]}),(0,p.jsxs)(`div`,{style:{padding:`20px`,border:`1px solid var(--color-border)`,borderRadius:`16px`,backgroundColor:`rgba(0,0,0,0.01)`},children:[(0,p.jsx)(`h4`,{style:{margin:`0 0 4px 0`,fontSize:`15px`,color:`var(--color-text)`},children:c===`ar`?`2. تصدير بيانات مشرفي التحضير الحالية`:`2. Export Current Prep Supervisors Data`}),(0,p.jsx)(`p`,{style:{fontSize:`12px`,color:`var(--color-text-secondary)`,margin:`0 0 16px 0`},children:c===`ar`?`تصدير كافة مشرفي التحضير المسجلين في النظام مع الفصول المكلفين بها بصيغة CSV تدعم اللغة العربية.`:`Export all registered prep supervisors into an Arabic-friendly CSV file.`}),(0,p.jsx)(`button`,{type:`button`,className:`btn-filled`,onClick:Le,disabled:R,style:{height:`42px`,padding:`0 20px`,backgroundColor:`#31859C`,borderColor:`#31859C`},children:R?c===`ar`?`جاري التصدير...`:`Exporting...`:c===`ar`?`تصدير البيانات`:`Export Data`})]}),(0,p.jsx)(`div`,{style:{display:`flex`,justifyContent:`flex-end`,marginTop:`10px`},children:(0,p.jsx)(`button`,{type:`button`,className:`btn-elevated`,onClick:()=>O(!1),style:{height:`44px`,padding:`0 18px`},children:c===`ar`?`إغلاق`:`Close`})})]})})]})})]})}function ae(){return(0,p.jsx)(m,{})}export{ae as default};