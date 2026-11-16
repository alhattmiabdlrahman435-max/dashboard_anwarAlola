import{i as e,n as t,t as n}from"./jsx-runtime-bzQ4Vb5N.js";import{n as r,t as i}from"./PaginationBar-D3ztVdRg.js";import{t as a}from"./pen-line-BTv-GvVA.js";import{t as o}from"./search-CgwN9s8c.js";import{t as s}from"./trash-2-B7QZ1jlB.js";import{t as c}from"./upload-7M0Aaw44.js";import{G as l,L as u,W as ee,Z as te,_ as ne,g as re,i as ie,n as ae,s as d,z as f}from"./index-Bg_G4Hlo.js";var p=e(t(),1),m=n();function h(){let{lang:e,t,renderAvatar:n,setToastMessage:h,canAction:g,triggerConfirm:oe}=te(),{classes:_,fetchClasses:se}=ee(),{subjects:ce,fetchSubjects:le}=l(),{teachers:v,loading:ue,teachersPagination:y,fetchTeachers:b,handleAddTeacher:de,handleEditTeacher:fe,handleDeleteTeacher:pe}=u(),{page:me,perPage:he,search:ge,setPage:_e,setPerPage:ve,setSearch:ye,buildQueryString:be,goToPrevIfEmpty:xe}=r({moduleKey:`teachers`}),Se=be(),Ce=t=>{oe({title:e===`ar`?`حذف المعلم`:`Delete Teacher`,message:e===`ar`?`هل أنت متأكد من حذف المعلم "${t.name}" نهائياً من النظام؟`:`Are you sure you want to permanently delete teacher "${t.name}"?`,type:`danger`,onConfirm:()=>{pe(t.id).then(e=>{e&&e.success&&b(xe(v.length-1))})}})};(0,p.useEffect)(()=>{b(Se)},[b,Se]),(0,p.useEffect)(()=>{se(),le()},[]);let[x,S]=(0,p.useState)(!1),[we,C]=(0,p.useState)(!1),[Te,w]=(0,p.useState)(!1),[Ee,De]=(0,p.useState)(null),[T,E]=(0,p.useState)(``),[D,O]=(0,p.useState)(``),[k,A]=(0,p.useState)(``),[j,M]=(0,p.useState)(``),[N,P]=(0,p.useState)(``),[F,I]=(0,p.useState)([]),[L,R]=(0,p.useState)(``),[z,B]=(0,p.useState)(``),[V,H]=(0,p.useState)(``),[Oe,U]=(0,p.useState)(!1),[W,ke]=(0,p.useState)(`import`),[G,Ae]=(0,p.useState)(null),[K,je]=(0,p.useState)(!1),[Me,q]=(0,p.useState)(0),[Ne,J]=(0,p.useState)(``),[Pe,Y]=(0,p.useState)([]),[Fe,Ie]=(0,p.useState)(!1),[Le,Re]=(0,p.useState)(!1),[ze,X]=(0,p.useState)(!1),[Be,Z]=(0,p.useState)(!1),[Q,Ve]=(0,p.useState)(`with_job_id`),[$,He]=(0,p.useState)(`all`),[Ue,We]=(0,p.useState)(!1),Ge=async()=>{We(!0);try{let t=[],n=Q===`with_full_assignments`&&$&&$!==`all`,r=n?String($).replace(/\D/g,``):``;try{let e=r?`?class_id=${r}&per_page=1000`:`?per_page=1000`,n=await f.getTeachers(e);Array.isArray(n?.teachers)?t=n.teachers:Array.isArray(n?.data?.teachers)?t=n.data.teachers:Array.isArray(n?.data)?t=n.data:Array.isArray(n)&&(t=n)}catch(e){console.warn(`API teachers fetch failed, falling back to local state:`,e)}if(t.length===0&&v.length>0&&(t=[...v]),t=t.map(e=>{let t=e.job_id||e.jobId||``,n=e.name_ar||e.name||e.name_en||``,i=e.phone||``,a=new Map;Array.isArray(e.assignments)?e.assignments.forEach(e=>{let t=e.school_class,n=t?String(t.id):e.class_id?String(e.class_id):``;if(r&&n&&n!==String(r))return;let i=t?t.name_ar||t.name||`${t.grade_ar||``} - ${t.section_ar||``}`.trim():``,o=e.subject,s=o&&(o.name_ar||o.name)||``;i&&(a.has(i)||a.set(i,[]),s&&!a.get(i).includes(s)&&a.get(i).push(s))}):Array.isArray(e.teachingAssignments)&&e.teachingAssignments.forEach(e=>{let t=e.classId?String(e.classId).replace(/\D/g,``):``;if(r&&t&&t!==String(r))return;let n=e.class||``,i=e.subject||``;n&&(a.has(n)||a.set(n,[]),i&&!a.get(n).includes(i)&&a.get(n).push(i))});let o=Array.from(a.entries()).map(([e,t])=>({className:e,subjects:t}));return{id:e.id,jobId:t,name:n,phone:i,classGroups:o}}),r){let e=_.find(e=>{let t=typeof e.id==`string`&&e.id.startsWith(`cls-`)?e.id.replace(`cls-`,``):e.numericId||e.id;return String(t)===String(r)}),n=e?e.name:``;n&&(t=t.map(e=>({...e,classGroups:e.classGroups.filter(e=>e.className===n)})).filter(e=>e.classGroups.length>0))}let i=e=>e?e.replace(/[\u064B-\u065F\u0670]/g,``).replace(/[إأآٱ]/g,`ا`).replace(/ة/g,`ه`).replace(/ى/g,`ي`).trim():``;t.sort((e,t)=>{let n=i(e.name||``),r=i(t.name||``),a=n.localeCompare(r,`ar`);return a===0?(e.name||``).localeCompare(t.name||``,`ar`):a});let a=_.find(e=>{let t=typeof e.id==`string`&&e.id.startsWith(`cls-`)?e.id.replace(`cls-`,``):e.numericId||e.id;return String(t)===String(r)}),o=a?a.name:`جميع الفصول والشعب`,s=new Date().toLocaleDateString(`ar-SA`,{year:`numeric`,month:`long`,day:`numeric`,weekday:`long`}),c=``;c=Q===`with_job_id`?`
          <tr>
            <th style="width: 38px;">م</th>
            <th style="width: 135px; text-align: center;">الرقم الوظيفي</th>
            <th style="text-align: right;">اسم المعلم</th>
            <th style="width: 220px; text-align: right;">الملاحظات</th>
          </tr>
        `:Q===`with_phone`?`
          <tr>
            <th style="width: 38px;">م</th>
            <th style="text-align: right;">اسم المعلم</th>
            <th style="width: 145px; text-align: center;">رقم التلفون</th>
            <th style="width: 220px; text-align: right;">الملاحظات</th>
          </tr>
        `:Q===`with_job_id_phone`?`
          <tr>
            <th style="width: 38px;">م</th>
            <th style="width: 130px; text-align: center;">الرقم الوظيفي</th>
            <th style="text-align: right;">اسم المعلم</th>
            <th style="width: 135px; text-align: center;">رقم التلفون</th>
            <th style="width: 195px; text-align: right;">الملاحظات</th>
          </tr>
        `:`
          <tr>
            <th style="width: 34px;">م</th>
            <th style="width: 105px; text-align: center;">الرقم الوظيفي</th>
            <th style="width: 165px; text-align: right;">اسم المعلم</th>
            <th style="width: 110px; text-align: center;">رقم التلفون</th>
            <th style="width: 130px; text-align: center;">الصف والشعبة</th>
            <th style="text-align: right;">المواد المسندة</th>
            <th style="width: 135px; text-align: right;">الملاحظات</th>
          </tr>
        `;let l=``;l=t.length===0?`
          <tr>
            <td colspan="${{with_job_id:4,with_phone:4,with_job_id_phone:5,with_full_assignments:7}[Q]||4}" style="text-align:center;padding:24px;color:#64748b;font-weight:700;">
              لا توجد بيانات معلمين مسجلة لهذا النطاق
            </td>
          </tr>
        `:t.map((e,t)=>{if(Q===`with_job_id`)return`
              <tr>
                <td class="col-num">${t+1}</td>
                <td class="col-code">${e.jobId}</td>
                <td class="col-name">${e.name}</td>
                <td class="col-notes">&nbsp;</td>
              </tr>
            `;if(Q===`with_phone`)return`
              <tr>
                <td class="col-num">${t+1}</td>
                <td class="col-name">${e.name}</td>
                <td class="col-phone">${e.phone}</td>
                <td class="col-notes">&nbsp;</td>
              </tr>
            `;if(Q===`with_job_id_phone`)return`
              <tr>
                <td class="col-num">${t+1}</td>
                <td class="col-code">${e.jobId}</td>
                <td class="col-name">${e.name}</td>
                <td class="col-phone">${e.phone}</td>
                <td class="col-notes">&nbsp;</td>
              </tr>
            `;{let n=e.classGroups&&e.classGroups.length>0?e.classGroups:[{className:`غير مكلف بفصول`,subjects:[]}],r=n.length;return n.map((n,i)=>{let a=n.subjects&&n.subjects.length>0?n.subjects.join(`، `):`—`;return i===0?`
                  <tr>
                    <td class="col-num" rowspan="${r}">${t+1}</td>
                    <td class="col-code" rowspan="${r}">${e.jobId}</td>
                    <td class="col-name" rowspan="${r}">${e.name}</td>
                    <td class="col-phone" rowspan="${r}">${e.phone}</td>
                    <td style="text-align:center;font-weight:700;font-size:11px;">${n.className}</td>
                    <td style="text-align:right;font-weight:600;font-size:11px;">${a}</td>
                    <td class="col-notes">&nbsp;</td>
                  </tr>
                `:`
                  <tr>
                    <td style="text-align:center;font-weight:700;font-size:11px;">${n.className}</td>
                    <td style="text-align:right;font-weight:600;font-size:11px;">${a}</td>
                    <td class="col-notes">&nbsp;</td>
                  </tr>
                `}).join(``)}}).join(``);let u=`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8">
<title>كشف المعلمين</title>
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
    padding: 6px 10px;
    border: 1px solid #cbd5e1;
    vertical-align: middle;
  }
  table.roster-table tbody tr:nth-child(even) {
    background-color: #f8fafc;
  }
  .col-num {
    width: 36px;
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
  .col-notes {
    text-align: right;
    background-color: #ffffff;
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
        <img src="${ae}" alt="Logo" />
      </div>
      <div class="sr-header-en">
        <div>Republic of Yemen</div>
        <div>Min. of Education & Scientific Research</div>
        <div class="sr-header-school-en">Riyadh & Anwar Al-Ola Int. Model Schools</div>
      </div>
    </div>

    <div class="sr-title-bar">
      <div class="sr-meta-bar">
        ${n?`<div class="sr-meta-item">الصف والشعبة: <strong>${o}</strong></div>`:``}
        <div class="sr-meta-item">العام الدراسي: <strong>1447-1448هـ (2025-2026م)</strong></div>
        <div class="sr-meta-item">إجمالي المعلمين: <strong>${t.length} معلم</strong></div>
        <div class="sr-meta-item">التاريخ: <strong>${s}</strong></div>
      </div>
    </div>

    <table class="roster-table">
      <thead>
        ${c}
      </thead>
      <tbody>
        ${l}
      </tbody>
    </table>

    <div class="sr-footer">
      <span>تم إصدار الكشف آلياً عبر نظام إدارة رياض ومدارس أنوار العلى الدولية النموذجية</span>
      <span>صفحة 1 من 1</span>
    </div>
  </div>
</body>
</html>`;ie(u,{title:e===`ar`?`معاينة كشف المعلمين`:`Teachers Roster Print Preview`,landscape:u.includes(`landscape`)}),Z(!1)}catch(e){console.error(`Roster generation failed:`,e),alert(`حدث خطأ أثناء إعداد كشف الطباعة`)}finally{We(!1)}},Ke=t=>{if(t.preventDefault(),H(``),!T.trim()||!D.trim()||!k.trim()){H(e===`ar`?`الرجاء تعبئة جميع الحقول المطلوبة (الاسم، الرقم الوظيفي، رقم الجوال)`:`Please fill all required fields (name, job ID, phone)`);return}let n=k.replace(/\D/g,``);if(n.length!==9||!n.startsWith(`7`)){H(e===`ar`?`رقم الجوال يجب أن يكون 9 أرقام ويبدأ بـ 7`:`Phone must be 9 digits starting with 7`);return}let r=F.length>0?[...new Set(F.map(e=>e.subject))]:[],i=F.length>0?[...new Set(F.map(e=>e.class))]:[],a=100+v.length+1,o=T.split(` `).map(e=>e.charAt(0).toUpperCase()+e.slice(1)).join(` `),s={id:a,jobId:D.trim(),phone:n,address:j.trim(),name:T,nameEn:o,subject:r[0],subjectEn:r[0],subjects:r,classes:i,teachingAssignments:F,gradesEntered:0,assignments:0,photo:N||`👨‍🏫`};S(!0),de(s).then(t=>{t&&t.success?(C(!1),E(``),I([]),P(``),O(``),A(``),M(``),R(``),B(``)):H(t?.message||(e===`ar`?`فشلت العملية`:`Operation failed`))}).catch(e=>{H(e.message||`Error occurred`)}).finally(()=>{S(!1)})},qe=t=>{if(t.preventDefault(),H(``),!T.trim()||!D.trim()||!k.trim()){H(e===`ar`?`الرجاء تعبئة جميع الحقول المطلوبة (الاسم، الرقم الوظيفي، رقم الجوال)`:`Please fill all required fields (name, job ID, phone)`);return}let n=k.replace(/\D/g,``);if(n.length!==9||!n.startsWith(`7`)){H(e===`ar`?`رقم الجوال يجب أن يكون 9 أرقام ويبدأ بـ 7`:`Phone must be 9 digits starting with 7`);return}let r=F.length>0?[...new Set(F.map(e=>e.subject))]:[],i=F.length>0?[...new Set(F.map(e=>e.class))]:[],a={id:Ee,name:T,nameEn:T.split(` `).map(e=>e.charAt(0).toUpperCase()+e.slice(1)).join(` `),jobId:D.trim(),phone:n,address:j.trim(),subject:r[0],subjectEn:r[0],subjects:r,classes:i,teachingAssignments:F,photo:N};S(!0),fe(a,Ee).then(t=>{t&&t.success?(w(!1),E(``),I([]),P(``),O(``),A(``),M(``),P(``),R(``),B(``),De(null)):H(t?.message||(e===`ar`?`فشلت العملية`:`Operation failed`))}).catch(e=>{H(e.message||`Error occurred`)}).finally(()=>{S(!1)})},Je=()=>{if(!L||!z){h(e===`ar`?`⚠️ يرجى اختيار المادة والفصل معاً!`:`⚠️ Please select both subject and class!`),setTimeout(()=>h(``),3e3);return}if(F.some(e=>e.subject===L&&e.class===z)){h(e===`ar`?`⚠️ هذا التكليف مضاف بالفعل!`:`⚠️ This assignment is already added!`),setTimeout(()=>h(``),3e3);return}let t={subject:L,class:z};I(e=>[...e,t]),R(``),B(``)},Ye=e=>{I(t=>t.filter((t,n)=>n!==e))};return(0,m.jsxs)(`div`,{className:`section-card`,children:[(0,m.jsxs)(`div`,{className:`section-card-header no-print`,children:[(0,m.jsx)(`h3`,{className:`section-card-title headline-small`,style:{fontSize:`18px`},children:t.teachersTitle}),(0,m.jsxs)(`div`,{style:{display:`flex`,gap:`8px`,alignItems:`center`,flexWrap:`wrap`},children:[(0,m.jsxs)(`div`,{className:`search-box`,style:{position:`relative`,width:`280px`},children:[(0,m.jsx)(o,{size:16,style:{position:`absolute`,right:e===`ar`?`12px`:`auto`,left:e===`ar`?`auto`:`12px`,top:`50%`,transform:`translateY(-50%)`,color:`var(--color-text-secondary)`}}),(0,m.jsx)(`input`,{id:`search-teachers`,name:`search`,type:`text`,className:`text-field`,style:{paddingRight:e===`ar`?`36px`:`12px`,paddingLeft:e===`ar`?`12px`:`36px`,height:`40px`,fontSize:`13px`},placeholder:e===`ar`?`البحث عن معلم بالاسم أو الرقم الوظيفي...`:`Search teacher by name or job ID...`,value:ge,"aria-label":e===`ar`?`البحث عن معلمين`:`Search teachers`,onChange:e=>ye(e.target.value)})]}),(0,m.jsxs)(`button`,{className:`btn-secondary`,onClick:()=>Z(!0),style:{display:`flex`,alignItems:`center`,gap:`6px`,padding:`8px 16px`,fontSize:`13px`,fontWeight:`700`,color:`#d97706`,borderColor:`#fcd34d`,backgroundColor:`#fffbeb`},children:[(0,m.jsx)(re,{size:16}),e===`ar`?`طباعة كشف`:`Print Roster`]}),(g(`teachers`,`export`)||g(`teachers`,`import`))&&(0,m.jsxs)(`button`,{className:`btn-elevated`,onClick:()=>{Ae(null),q(0),J(``),Y([]),Ie(!1),U(!0)},style:{display:`flex`,alignItems:`center`,gap:`6px`,backgroundColor:`rgba(49, 133, 156, 0.08)`,borderColor:`rgba(49, 133, 156, 0.25)`,color:`#31859C`},children:[(0,m.jsx)(c,{size:16}),e===`ar`?`الاستيراد والتصدير (Excel)`:`Excel Import & Export`]}),g(`teachers`,`create`)&&(0,m.jsxs)(`button`,{className:`btn-accent`,onClick:()=>{H(``),E(``),I([]),P(``),O(``),A(``),M(``),R(``),B(``),C(!0)},children:[(0,m.jsx)(ne,{size:18,strokeWidth:2.5,style:{marginInlineEnd:`4px`}}),t.addTeacherBtn]})]})]}),(0,m.jsx)(`div`,{className:`students-table-container responsive-hide-on-mobile`,style:{width:`100%`,overflowX:`auto`},children:(0,m.jsxs)(`table`,{className:`students-table`,style:{width:`100%`,minWidth:`100%`},children:[(0,m.jsx)(`thead`,{children:(0,m.jsxs)(`tr`,{children:[(0,m.jsx)(`th`,{className:`sticky-col-1`,style:{width:`95px`,whiteSpace:`nowrap`},children:e===`ar`?`الرقم الوظيفي`:`Job ID`}),(0,m.jsx)(`th`,{className:`sticky-col-2`,style:{minWidth:`140px`},children:t.teacherName}),(0,m.jsx)(`th`,{style:{maxWidth:`170px`},children:t.subject}),(0,m.jsx)(`th`,{style:{maxWidth:`160px`},children:t.assignedClasses}),(0,m.jsx)(`th`,{style:{width:`100px`},children:e===`ar`?`رقم الجوال`:`Phone Number`}),(0,m.jsx)(`th`,{style:{maxWidth:`100px`},children:e===`ar`?`عنوان السكن`:`Home Address`}),(0,m.jsx)(`th`,{style:{width:`75px`,textAlign:`center`},children:t.gradesEntered}),(0,m.jsx)(`th`,{style:{width:`75px`,textAlign:`center`},children:t.assignmentsPublished}),(0,m.jsx)(`th`,{className:`no-print`,style:{width:`85px`,textAlign:`center`},children:t.action})]})}),(0,m.jsx)(`tbody`,{children:v.length>0?v.map(r=>(0,m.jsxs)(`tr`,{children:[(0,m.jsx)(`td`,{className:`sticky-col-1`,style:{fontFamily:`var(--font-mono)`,fontWeight:`bold`,fontSize:`12px`},children:r.jobId||`T${r.id}`}),(0,m.jsxs)(`td`,{className:`sticky-col-2`,style:{fontWeight:`600`,fontSize:`13px`},children:[n(r.photo,`👨‍🏫`),e===`ar`?r.name:r.nameEn]}),(0,m.jsx)(`td`,{style:{whiteSpace:`normal`,maxWidth:`170px`},children:r.subjects&&r.subjects.length>0?(0,m.jsxs)(`div`,{style:{display:`flex`,gap:`3px`,flexWrap:`wrap`,maxHeight:`54px`,overflowY:`auto`},children:[r.subjects.slice(0,3).map((e,t)=>(0,m.jsx)(`span`,{style:{padding:`2px 7px`,background:`rgba(30, 80, 142, 0.08)`,color:`var(--color-primary-ui)`,borderRadius:`6px`,fontSize:`11px`,fontWeight:`600`,lineHeight:`1.3`},children:e},t)),r.subjects.length>3&&(0,m.jsxs)(`span`,{title:r.subjects.join(`, `),style:{padding:`2px 7px`,background:`rgba(30, 80, 142, 0.15)`,color:`var(--color-primary-ui)`,borderRadius:`6px`,fontSize:`10px`,fontWeight:`700`,cursor:`help`},children:[`+`,r.subjects.length-3,` `,e===`ar`?`أخرى`:`more`]})]}):(0,m.jsx)(`span`,{style:{padding:`2px 7px`,background:`rgba(30, 80, 142, 0.08)`,color:`var(--color-primary-ui)`,borderRadius:`6px`,fontSize:`11px`,fontWeight:`600`},children:e===`ar`?r.subject:r.subjectEn})}),(0,m.jsx)(`td`,{style:{whiteSpace:`normal`,maxWidth:`180px`},children:(0,m.jsx)(`div`,{style:{display:`flex`,gap:`3px`,flexWrap:`wrap`,maxHeight:`54px`,overflowY:`auto`},children:r.classes&&r.classes.length>0?(0,m.jsxs)(m.Fragment,{children:[r.classes.slice(0,3).map((e,t)=>(0,m.jsx)(`span`,{className:`chip`,style:{cursor:`default`,fontSize:`10px`,padding:`1px 6px`,lineHeight:`1.3`},children:e},t)),r.classes.length>3&&(0,m.jsxs)(`span`,{title:r.classes.join(`, `),className:`chip`,style:{cursor:`help`,fontSize:`10px`,padding:`1px 6px`,lineHeight:`1.3`,background:`var(--color-primary-ui)`,color:`#fff`,fontWeight:`bold`},children:[`+`,r.classes.length-3,` `,e===`ar`?`فصول أخرى`:`more`]})]}):(0,m.jsx)(`span`,{style:{fontSize:`11px`,color:`var(--color-text-secondary)`},children:`—`})})}),(0,m.jsx)(`td`,{style:{fontFamily:`var(--font-mono)`,fontSize:`12px`},children:r.phone||`—`}),(0,m.jsx)(`td`,{style:{fontSize:`12px`,maxWidth:`100px`,overflow:`hidden`,textOverflow:`ellipsis`,whiteSpace:`nowrap`},children:r.address||`—`}),(0,m.jsxs)(`td`,{style:{fontFamily:`var(--font-mono)`,fontWeight:`bold`,textAlign:`center`,fontSize:`12px`},children:[r.gradesEntered,` %`]}),(0,m.jsx)(`td`,{style:{fontFamily:`var(--font-mono)`,textAlign:`center`,fontSize:`12px`},children:r.assignments}),(0,m.jsx)(`td`,{className:`no-print`,style:{textAlign:`center`,whiteSpace:`nowrap`},children:(0,m.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,justifyContent:`center`,gap:`6px`},children:[g(`teachers`,`update`)&&(0,m.jsxs)(`button`,{className:`btn-filled`,style:{padding:`6px 14px`,fontSize:`13px`,fontWeight:`600`,display:`inline-flex`,alignItems:`center`,gap:`6px`,cursor:`pointer`,borderRadius:`8px`,minHeight:`34px`,boxShadow:`var(--shadow-sm)`},onClick:()=>{H(``),De(r.id),E(r.name),I(r.teachingAssignments||[{subject:r.subject,class:r.classes[0]||`الصف الأول - أ`}]),O(r.jobId||`T${r.id}`),A(r.phone||``),M(r.address||``),P(r.photo||``),w(!0),R(``),B(``)},title:t.editBtn,children:[(0,m.jsx)(a,{size:15}),(0,m.jsx)(`span`,{children:t.editBtn})]}),g(`teachers`,`delete`)&&(0,m.jsx)(`button`,{type:`button`,style:{padding:`6px 10px`,fontSize:`13px`,fontWeight:`600`,display:`inline-flex`,alignItems:`center`,justifyContent:`center`,borderRadius:`8px`,minHeight:`34px`,border:`1px solid rgba(220, 38, 38, 0.25)`,background:`rgba(220, 38, 38, 0.08)`,color:`#dc2626`,cursor:`pointer`,transition:`all 0.15s ease`},onMouseOver:e=>{e.currentTarget.style.background=`rgba(220, 38, 38, 0.16)`,e.currentTarget.style.borderColor=`#dc2626`},onMouseOut:e=>{e.currentTarget.style.background=`rgba(220, 38, 38, 0.08)`,e.currentTarget.style.borderColor=`rgba(220, 38, 38, 0.25)`},onClick:()=>Ce(r),title:e===`ar`?`حذف المعلم`:`Delete Teacher`,children:(0,m.jsx)(s,{size:15})})]})})]},r.id)):(0,m.jsx)(`tr`,{children:(0,m.jsx)(`td`,{colSpan:`9`,style:{padding:`48px 24px`,textAlign:`center`},children:(0,m.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,alignItems:`center`,justifyContent:`center`,gap:`8px`},children:[(0,m.jsx)(`span`,{style:{fontSize:`32px`},children:`📂`}),(0,m.jsx)(`span`,{style:{fontWeight:`600`,fontSize:`15px`,color:`var(--color-text-primary)`},children:e===`ar`?`لا يوجد معلمون مسجلون حالياً`:`No teachers registered yet`}),(0,m.jsx)(`span`,{style:{fontSize:`13px`,color:`var(--color-text-secondary)`},children:e===`ar`?`لم يتم إضافة أي بيانات بعد`:`No records have been added yet`})]})})})})]})}),(0,m.jsx)(`div`,{className:`teacher-mobile-cards-grid no-print`,children:v.length>0?v.map(r=>(0,m.jsxs)(`div`,{className:`teacher-mobile-card`,children:[(0,m.jsxs)(`div`,{className:`teacher-card-top`,children:[(0,m.jsx)(`div`,{className:`teacher-card-avatar`,children:n(r.photo,`👨‍🏫`)}),(0,m.jsxs)(`div`,{className:`teacher-card-identity`,children:[(0,m.jsx)(`h4`,{className:`teacher-card-name`,children:e===`ar`?r.name:r.nameEn||r.name}),(0,m.jsxs)(`div`,{className:`teacher-card-badges`,children:[(0,m.jsx)(`span`,{className:`teacher-job-badge`,children:r.jobId||`T${r.id}`}),(0,m.jsx)(`span`,{className:`teacher-subject-badge`,children:e===`ar`?r.subject||`معلم`:r.subjectEn||`Teacher`})]})]})]}),(0,m.jsxs)(`div`,{className:`teacher-card-body`,children:[(0,m.jsxs)(`div`,{className:`teacher-card-info-row`,children:[(0,m.jsxs)(`span`,{className:`info-label`,children:[`📱 `,e===`ar`?`رقم الجوال:`:`Phone:`]}),r.phone?(0,m.jsx)(`a`,{href:`tel:${r.phone}`,className:`info-value-phone`,children:r.phone}):(0,m.jsx)(`span`,{className:`info-value-phone`,style:{opacity:.5},children:`—`})]}),(0,m.jsxs)(`div`,{className:`teacher-card-info-row`,children:[(0,m.jsxs)(`span`,{className:`info-label`,children:[`🏠 `,e===`ar`?`العنوان:`:`Address:`]}),(0,m.jsx)(`span`,{style:{fontSize:`13px`,fontWeight:`500`},children:r.address||`—`})]}),(0,m.jsxs)(`div`,{className:`teacher-card-info-row`,children:[(0,m.jsxs)(`span`,{className:`info-label`,children:[`📊 `,e===`ar`?`نسبة رصد الدرجات:`:`Grades:`]}),(0,m.jsxs)(`span`,{className:`info-value-grade`,children:[r.gradesEntered,`%`]})]}),(0,m.jsxs)(`div`,{className:`teacher-card-classes-section`,children:[(0,m.jsxs)(`span`,{className:`classes-title`,children:[`🎯 `,e===`ar`?`الفصول المكلف بها:`:`Assigned Classes:`]}),(0,m.jsx)(`div`,{className:`classes-chips-wrapper`,children:r.classes&&r.classes.length>0?r.classes.map((e,t)=>(0,m.jsx)(`span`,{className:`teacher-class-pill`,children:e},t)):(0,m.jsx)(`span`,{style:{fontSize:`11px`,color:`var(--color-text-secondary)`},children:`—`})})]})]}),(g(`teachers`,`update`)||g(`teachers`,`delete`))&&(0,m.jsxs)(`div`,{className:`teacher-card-actions`,children:[g(`teachers`,`update`)&&(0,m.jsxs)(`button`,{type:`button`,className:`teacher-action-btn edit-btn`,onClick:()=>{H(``),De(r.id),E(r.name),I(r.teachingAssignments||[{subject:r.subject,class:r.classes[0]||`الصف الأول - أ`}]),O(r.jobId||`T${r.id}`),A(r.phone||``),M(r.address||``),P(r.photo||``),w(!0)},children:[(0,m.jsx)(a,{size:16}),(0,m.jsx)(`span`,{children:t.editBtn})]}),g(`teachers`,`delete`)&&(0,m.jsxs)(`button`,{type:`button`,className:`teacher-action-btn delete-btn`,onClick:()=>Ce(r),children:[(0,m.jsx)(s,{size:16}),(0,m.jsx)(`span`,{children:e===`ar`?`حذف`:`Delete`})]})]})]},r.id)):(0,m.jsxs)(`div`,{style:{padding:`32px 16px`,textAlign:`center`,background:`var(--color-surface)`,borderRadius:`16px`,border:`1px dashed var(--color-border)`},children:[(0,m.jsx)(`span`,{style:{fontSize:`28px`,display:`block`,marginBottom:`8px`},children:`📂`}),(0,m.jsx)(`span`,{style:{fontWeight:`600`,fontSize:`14px`},children:e===`ar`?`لا يوجد معلمون مسجلون حالياً`:`No teachers registered yet`})]})}),(0,m.jsx)(i,{page:y.currentPage||me,lastPage:y.lastPage||1,total:y.total||v.length,from:y.from||1,to:y.to||v.length,perPage:he,onPageChange:_e,onPerPageChange:ve,loading:ue,lang:e}),we&&(0,m.jsx)(`div`,{className:`modal-overlay no-print`,children:(0,m.jsxs)(`div`,{className:`modal-container`,children:[(0,m.jsxs)(`header`,{className:`modal-header`,children:[(0,m.jsxs)(`h3`,{className:`modal-title`,children:[`👨‍🏫 `,t.addTeacherTitle]}),(0,m.jsx)(`button`,{className:`modal-close-btn`,onClick:()=>{C(!1),H(``)},"aria-label":`Close Teacher Registration Dialog`,children:(0,m.jsx)(d,{size:20,strokeWidth:2.5})})]}),(0,m.jsxs)(`form`,{onSubmit:Ke,children:[(0,m.jsxs)(`div`,{className:`modal-body`,children:[V&&(0,m.jsx)(`div`,{style:{padding:`var(--space-md)`,backgroundColor:`rgba(220, 38, 38, 0.1)`,color:`var(--color-error)`,borderRadius:`var(--radius-chip)`,fontSize:`13px`,fontWeight:`600`,marginBottom:`12px`},children:V}),(0,m.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,alignItems:`center`,gap:`8px`,marginBottom:`20px`},children:[(0,m.jsxs)(`div`,{style:{position:`relative`,width:`90px`,height:`90px`,borderRadius:`50%`,border:`2px dashed var(--color-primary-ui)`,padding:`4px`,cursor:`pointer`,overflow:`hidden`,display:`flex`,justifyContent:`center`,alignItems:`center`,background:`rgba(30, 80, 142, 0.02)`,transition:`all 0.2s ease`},onMouseOver:e=>e.currentTarget.style.borderColor=`var(--color-accent)`,onMouseOut:e=>e.currentTarget.style.borderColor=`var(--color-primary-ui)`,onClick:()=>document.getElementById(`add-teacher-photo-input`).click(),children:[N&&N!==`👨‍🏫`?(0,m.jsx)(`img`,{src:N.includes(`/uploads/avatars/`)?N.substring(N.indexOf(`/uploads/avatars/`)):N,alt:`Preview`,style:{width:`100%`,height:`100%`,borderRadius:`50%`,objectFit:`cover`}}):(0,m.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,alignItems:`center`,color:`var(--color-text-secondary)`,userSelect:`none`},children:[(0,m.jsx)(`span`,{style:{fontSize:`24px`},children:`📷`}),(0,m.jsx)(`span`,{style:{fontSize:`10px`,marginTop:`4px`,fontWeight:`bold`},children:e===`ar`?`رفع صورة`:`Upload`})]}),(0,m.jsx)(`input`,{type:`file`,accept:`image/*`,id:`add-teacher-photo-input`,onChange:e=>{let t=e.target.files[0];if(t){let e=new FileReader;e.onloadend=()=>P(e.result),e.readAsDataURL(t)}},style:{display:`none`}})]}),(0,m.jsx)(`span`,{style:{fontSize:`12px`,color:`var(--color-text-secondary)`,fontWeight:`600`},children:e===`ar`?`الصورة الشخصية للمعلم`:`Teacher Profile Photo`})]}),(0,m.jsxs)(`div`,{className:`form-group`,children:[(0,m.jsxs)(`label`,{htmlFor:`add-teacher-name`,className:`form-label`,children:[t.formTeacherName,` `,(0,m.jsx)(`span`,{style:{color:`var(--color-error)`},children:`*`})]}),(0,m.jsx)(`input`,{id:`add-teacher-name`,name:`name`,type:`text`,className:`text-field`,placeholder:e===`ar`?`مثال: أحمد الحربي`:`e.g. Ahmad Al-Harbi`,value:T,onChange:e=>E(e.target.value),required:!0})]}),(0,m.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:`1fr 1fr`,gap:`var(--space-md)`},children:[(0,m.jsxs)(`div`,{className:`form-group`,children:[(0,m.jsxs)(`label`,{htmlFor:`add-teacher-job-id`,className:`form-label`,children:[e===`ar`?`الرقم الوظيفي (Job ID)`:`Job ID`,` `,(0,m.jsx)(`span`,{style:{color:`var(--color-error)`},children:`*`})]}),(0,m.jsx)(`input`,{id:`add-teacher-job-id`,name:`job_id`,type:`text`,className:`text-field`,placeholder:e===`ar`?`مثال: T101 أو 101111`:`e.g. T101 or 101111`,value:D,onChange:e=>O(e.target.value),required:!0})]}),(0,m.jsxs)(`div`,{className:`form-group`,children:[(0,m.jsxs)(`label`,{htmlFor:`add-teacher-phone`,className:`form-label`,children:[e===`ar`?`رقم الجوال`:`Phone Number`,` `,(0,m.jsx)(`span`,{style:{color:`var(--color-error)`},children:`*`})]}),(0,m.jsx)(`input`,{id:`add-teacher-phone`,name:`phone`,type:`text`,className:`text-field`,placeholder:`7XXXXXXXX`,value:k,onChange:e=>A(e.target.value),required:!0})]})]}),(0,m.jsxs)(`div`,{className:`form-group`,children:[(0,m.jsx)(`label`,{htmlFor:`add-teacher-address`,className:`form-label`,children:e===`ar`?`عنوان السكن`:`Home Address`}),(0,m.jsx)(`input`,{id:`add-teacher-address`,name:`address`,type:`text`,className:`text-field`,placeholder:e===`ar`?`مثال: حي النزهة، الرياض`:`e.g. Al-Nuzha, Riyadh`,value:j,onChange:e=>M(e.target.value)})]}),(0,m.jsxs)(`div`,{style:{padding:`14px`,background:`rgba(30, 80, 142, 0.03)`,border:`1px solid var(--color-border)`,borderRadius:`16px`,marginBottom:`16px`},children:[(0,m.jsxs)(`h4`,{style:{fontSize:`13px`,fontWeight:`bold`,marginBottom:`8px`,color:`var(--color-primary-ui)`},children:[`🎯 `,e===`ar`?`تكليفات تدريس المناهج بالفصول`:`Class-Subject Teaching Assignments`]}),(0,m.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:`1.2fr 1.2fr auto`,gap:`8px`,alignItems:`end`,marginBottom:`12px`},children:[(0,m.jsxs)(`div`,{className:`form-group`,style:{marginBottom:0},children:[(0,m.jsx)(`label`,{htmlFor:`edit-teacher-subject`,className:`form-label`,style:{fontSize:`11px`},children:e===`ar`?`المادة الدراسية`:`Subject`}),(0,m.jsxs)(`select`,{id:`edit-teacher-subject`,name:`subject`,className:`text-field`,style:{height:`38px`,padding:`6px 12px`},value:L,onChange:e=>R(e.target.value),children:[(0,m.jsx)(`option`,{value:``,children:e===`ar`?`-- اختر المادة --`:`-- Select Subject --`}),ce.map(t=>(0,m.jsx)(`option`,{value:t.name,children:e===`ar`?t.name:t.nameEn},t.id))]})]}),(0,m.jsxs)(`div`,{className:`form-group`,style:{marginBottom:0},children:[(0,m.jsx)(`label`,{htmlFor:`edit-teacher-class`,className:`form-label`,style:{fontSize:`11px`},children:e===`ar`?`الفصل الدراسي`:`Class`}),(0,m.jsxs)(`select`,{id:`edit-teacher-class`,name:`class`,className:`text-field`,style:{height:`38px`,padding:`6px 12px`},value:z,onChange:e=>B(e.target.value),children:[(0,m.jsx)(`option`,{value:``,children:e===`ar`?`-- اختر الفصل --`:`-- Select Class --`}),_.map(t=>(0,m.jsx)(`option`,{value:t.name,children:e===`ar`?t.name:t.nameEn},t.id))]})]}),(0,m.jsx)(`button`,{type:`button`,className:`btn-accent`,style:{height:`38px`,padding:`0 14px`,whiteSpace:`nowrap`},onClick:Je,children:`➕`})]}),(0,m.jsxs)(`table`,{style:{width:`100%`,borderCollapse:`collapse`,fontSize:`12px`},children:[(0,m.jsx)(`thead`,{children:(0,m.jsxs)(`tr`,{style:{borderBottom:`1px solid var(--color-border)`,textAlign:`start`},children:[(0,m.jsx)(`th`,{style:{padding:`6px 0`,textAlign:`start`},children:e===`ar`?`المادة الدراسية`:`Subject`}),(0,m.jsx)(`th`,{style:{padding:`6px 0`,textAlign:`start`},children:e===`ar`?`الفصل الدراسي`:`Class`}),(0,m.jsx)(`th`,{style:{padding:`6px 0`,width:`40px`}})]})}),(0,m.jsxs)(`tbody`,{children:[F.map((e,t)=>(0,m.jsxs)(`tr`,{style:{borderBottom:`1px solid var(--color-border)`},children:[(0,m.jsx)(`td`,{style:{padding:`6px 0`},children:e.subject}),(0,m.jsx)(`td`,{style:{padding:`6px 0`},children:e.class}),(0,m.jsx)(`td`,{style:{padding:`6px 0`,textAlign:`center`},children:(0,m.jsx)(`button`,{type:`button`,onClick:()=>Ye(t),style:{border:`none`,background:`transparent`,color:`var(--color-error)`,cursor:`pointer`},children:(0,m.jsx)(s,{size:14})})})]},t)),F.length===0&&(0,m.jsx)(`tr`,{children:(0,m.jsx)(`td`,{colSpan:`3`,style:{textAlign:`center`,padding:`12px`,color:`var(--color-text-secondary)`,fontStyle:`italic`},children:e===`ar`?`لا يوجد تكليفات مضافة بعد`:`No assignments added yet`})})]})]})]})]}),(0,m.jsxs)(`footer`,{className:`modal-footer`,children:[(0,m.jsx)(`button`,{type:`button`,className:`btn-elevated`,onClick:()=>C(!1),style:{height:`48px`},disabled:x,children:t.cancel}),(0,m.jsx)(`button`,{type:`submit`,className:`btn-filled`,style:{height:`48px`,opacity:x?.7:1},disabled:x,children:x?e===`ar`?`جاري الحفظ...`:`Saving...`:t.submit})]})]})]})}),Te&&(0,m.jsx)(`div`,{className:`modal-overlay no-print`,children:(0,m.jsxs)(`div`,{className:`modal-container`,style:{maxWidth:`500px`},children:[(0,m.jsxs)(`header`,{className:`modal-header`,children:[(0,m.jsxs)(`h3`,{className:`modal-title`,children:[`👨‍🏫 `,e===`ar`?`تعديل بيانات المعلم ورصد الصلاحيات`:`Edit Teacher`]}),(0,m.jsx)(`button`,{className:`modal-close-btn`,onClick:()=>{w(!1),H(``)},children:(0,m.jsx)(d,{size:20,strokeWidth:2.5})})]}),(0,m.jsxs)(`form`,{onSubmit:qe,children:[(0,m.jsxs)(`div`,{className:`modal-body`,children:[V&&(0,m.jsx)(`div`,{style:{padding:`var(--space-md)`,backgroundColor:`rgba(220, 38, 38, 0.1)`,color:`var(--color-error)`,borderRadius:`var(--radius-chip)`,fontSize:`13px`,fontWeight:`600`,marginBottom:`12px`},children:V}),(0,m.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,alignItems:`center`,gap:`8px`,marginBottom:`20px`},children:[(0,m.jsxs)(`div`,{style:{position:`relative`,width:`90px`,height:`90px`,borderRadius:`50%`,border:`2px dashed var(--color-primary-ui)`,padding:`4px`,cursor:`pointer`,overflow:`hidden`,display:`flex`,justifyContent:`center`,alignItems:`center`,background:`rgba(30, 80, 142, 0.02)`,transition:`all 0.2s ease`},onMouseOver:e=>e.currentTarget.style.borderColor=`var(--color-accent)`,onMouseOut:e=>e.currentTarget.style.borderColor=`var(--color-primary-ui)`,onClick:()=>document.getElementById(`edit-teacher-photo-input`).click(),children:[N&&N!==`👨‍🏫`?(0,m.jsx)(`img`,{src:N.includes(`/uploads/avatars/`)?N.substring(N.indexOf(`/uploads/avatars/`)):N,alt:`Preview`,style:{width:`100%`,height:`100%`,borderRadius:`50%`,objectFit:`cover`}}):(0,m.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,alignItems:`center`,color:`var(--color-text-secondary)`,userSelect:`none`},children:[(0,m.jsx)(`span`,{style:{fontSize:`24px`},children:`📷`}),(0,m.jsx)(`span`,{style:{fontSize:`10px`,marginTop:`4px`,fontWeight:`bold`},children:e===`ar`?`رفع صورة`:`Upload`})]}),(0,m.jsx)(`input`,{type:`file`,accept:`image/*`,id:`edit-teacher-photo-input`,onChange:e=>{let t=e.target.files[0];if(t){let e=new FileReader;e.onloadend=()=>P(e.result),e.readAsDataURL(t)}},style:{display:`none`}})]}),(0,m.jsx)(`span`,{style:{fontSize:`12px`,color:`var(--color-text-secondary)`,fontWeight:`600`},children:e===`ar`?`الصورة الشخصية للمعلم`:`Teacher Profile Photo`})]}),(0,m.jsxs)(`div`,{className:`form-group`,children:[(0,m.jsxs)(`label`,{htmlFor:`edit-teacher-name`,className:`form-label`,children:[t.formTeacherName,` `,(0,m.jsx)(`span`,{style:{color:`var(--color-error)`},children:`*`})]}),(0,m.jsx)(`input`,{id:`edit-teacher-name`,name:`name`,type:`text`,className:`text-field`,value:T,onChange:e=>E(e.target.value),required:!0})]}),(0,m.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:`1fr 1fr`,gap:`var(--space-md)`},children:[(0,m.jsxs)(`div`,{className:`form-group`,children:[(0,m.jsxs)(`label`,{htmlFor:`edit-teacher-job-id`,className:`form-label`,children:[e===`ar`?`الرقم الوظيفي (Job ID)`:`Job ID`,` `,(0,m.jsx)(`span`,{style:{color:`var(--color-error)`},children:`*`}),(0,m.jsxs)(`span`,{style:{fontSize:`11px`,color:`#64748b`,fontWeight:`600`,marginInlineStart:`6px`},children:[`🔒 `,e===`ar`?`(ثابت لا يمكن تعديله)`:`(Read-Only)`]})]}),(0,m.jsx)(`input`,{id:`edit-teacher-job-id`,name:`job_id`,type:`text`,className:`text-field`,value:D,readOnly:!0,disabled:!0,tabIndex:-1,style:{opacity:.75,cursor:`not-allowed`,backgroundColor:`#e2e8f0`,color:`#334155`,fontWeight:`bold`,pointerEvents:`none`,userSelect:`none`,border:`1.5px solid #cbd5e1`},title:e===`ar`?`الرقم الوظيفي للقراءة فقط وغير قابل للتعديل`:`Job ID is read-only`})]}),(0,m.jsxs)(`div`,{className:`form-group`,children:[(0,m.jsxs)(`label`,{htmlFor:`edit-teacher-phone`,className:`form-label`,children:[e===`ar`?`رقم الجوال`:`Phone Number`,` `,(0,m.jsx)(`span`,{style:{color:`var(--color-error)`},children:`*`})]}),(0,m.jsx)(`input`,{id:`edit-teacher-phone`,name:`phone`,type:`text`,className:`text-field`,value:k,onChange:e=>A(e.target.value),placeholder:`7XXXXXXXX`,required:!0})]})]}),(0,m.jsxs)(`div`,{className:`form-group`,children:[(0,m.jsx)(`label`,{htmlFor:`edit-teacher-address`,className:`form-label`,children:e===`ar`?`عنوان السكن`:`Home Address`}),(0,m.jsx)(`input`,{id:`edit-teacher-address`,name:`address`,type:`text`,className:`text-field`,value:j,onChange:e=>M(e.target.value),placeholder:e===`ar`?`مثال: صنعاء، شارع حدة`:`e.g. Sanaa, Hadda St`})]}),(0,m.jsxs)(`div`,{style:{padding:`14px`,background:`rgba(30, 80, 142, 0.03)`,border:`1px solid var(--color-border)`,borderRadius:`16px`,marginBottom:`16px`},children:[(0,m.jsxs)(`h4`,{style:{fontSize:`13px`,fontWeight:`bold`,marginBottom:`8px`,color:`var(--color-primary-ui)`},children:[`🎯 `,e===`ar`?`تكليفات تدريس المناهج بالفصول`:`Class-Subject Teaching Assignments`]}),(0,m.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:`1.2fr 1.2fr auto`,gap:`8px`,alignItems:`end`,marginBottom:`12px`},children:[(0,m.jsxs)(`div`,{className:`form-group`,style:{marginBottom:0},children:[(0,m.jsx)(`label`,{htmlFor:`add-teacher-subject`,className:`form-label`,style:{fontSize:`11px`},children:e===`ar`?`المادة الدراسية`:`Subject`}),(0,m.jsxs)(`select`,{id:`add-teacher-subject`,name:`subject`,className:`text-field`,style:{height:`38px`,padding:`6px 12px`},value:L,onChange:e=>R(e.target.value),children:[(0,m.jsx)(`option`,{value:``,children:e===`ar`?`-- اختر المادة --`:`-- Select Subject --`}),ce.map(t=>(0,m.jsx)(`option`,{value:t.name,children:e===`ar`?t.name:t.nameEn},t.id))]})]}),(0,m.jsxs)(`div`,{className:`form-group`,style:{marginBottom:0},children:[(0,m.jsx)(`label`,{htmlFor:`add-teacher-class`,className:`form-label`,style:{fontSize:`11px`},children:e===`ar`?`الفصل الدراسي`:`Class`}),(0,m.jsxs)(`select`,{id:`add-teacher-class`,name:`class`,className:`text-field`,style:{height:`38px`,padding:`6px 12px`},value:z,onChange:e=>B(e.target.value),children:[(0,m.jsx)(`option`,{value:``,children:e===`ar`?`-- اختر الفصل --`:`-- Select Class --`}),_.map(t=>(0,m.jsx)(`option`,{value:t.name,children:e===`ar`?t.name:t.nameEn},t.id))]})]}),(0,m.jsx)(`button`,{type:`button`,className:`btn-accent`,style:{height:`38px`,padding:`0 14px`,whiteSpace:`nowrap`},onClick:Je,children:`➕`})]}),(0,m.jsxs)(`table`,{style:{width:`100%`,borderCollapse:`collapse`,fontSize:`12px`},children:[(0,m.jsx)(`thead`,{children:(0,m.jsxs)(`tr`,{style:{borderBottom:`1px solid var(--color-border)`,textAlign:`start`},children:[(0,m.jsx)(`th`,{style:{padding:`6px 0`,textAlign:`start`},children:e===`ar`?`المادة الدراسية`:`Subject`}),(0,m.jsx)(`th`,{style:{padding:`6px 0`,textAlign:`start`},children:e===`ar`?`الفصل الدراسي`:`Class`}),(0,m.jsx)(`th`,{style:{padding:`6px 0`,width:`40px`}})]})}),(0,m.jsxs)(`tbody`,{children:[F.map((e,t)=>(0,m.jsxs)(`tr`,{style:{borderBottom:`1px solid var(--color-border)`},children:[(0,m.jsx)(`td`,{style:{padding:`6px 0`},children:e.subject}),(0,m.jsx)(`td`,{style:{padding:`6px 0`},children:e.class}),(0,m.jsx)(`td`,{style:{padding:`6px 0`,textAlign:`center`},children:(0,m.jsx)(`button`,{type:`button`,onClick:()=>Ye(t),style:{border:`none`,background:`transparent`,color:`var(--color-error)`,cursor:`pointer`},children:(0,m.jsx)(s,{size:14})})})]},t)),F.length===0&&(0,m.jsx)(`tr`,{children:(0,m.jsx)(`td`,{colSpan:`3`,style:{textAlign:`center`,padding:`12px`,color:`var(--color-text-secondary)`,fontStyle:`italic`},children:e===`ar`?`لا يوجد تكليفات مضافة بعد`:`No assignments added yet`})})]})]})]})]}),(0,m.jsxs)(`footer`,{className:`modal-footer`,children:[(0,m.jsx)(`button`,{type:`button`,className:`btn-elevated`,onClick:()=>w(!1),style:{height:`48px`},disabled:x,children:t.cancel}),(0,m.jsx)(`button`,{type:`submit`,className:`btn-filled`,style:{height:`48px`,opacity:x?.7:1},disabled:x,children:x?e===`ar`?`جاري الحفظ...`:`Saving...`:t.submit})]})]})]})}),Oe&&(0,m.jsx)(`div`,{className:`modal-overlay no-print`,children:(0,m.jsxs)(`div`,{className:`modal-container`,style:{maxWidth:`580px`,width:`90%`},children:[(0,m.jsxs)(`header`,{className:`modal-header`,style:{borderBottom:`1px solid var(--color-border)`},children:[(0,m.jsxs)(`h3`,{className:`modal-title`,style:{display:`flex`,alignItems:`center`,gap:`8px`,color:`#31859C`},children:[(0,m.jsx)(c,{size:22}),e===`ar`?`الاستيراد والتصدير الذكي (Excel)`:`Smart Import & Export (Excel)`]}),(0,m.jsx)(`button`,{className:`modal-close-btn`,onClick:()=>U(!1),"aria-label":`Close Modal`,children:(0,m.jsx)(d,{size:20,strokeWidth:2.5})})]}),(0,m.jsxs)(`div`,{style:{display:`flex`,borderBottom:`1px solid var(--color-border)`,backgroundColor:`rgba(0,0,0,0.02)`},children:[(0,m.jsx)(`button`,{type:`button`,onClick:()=>ke(`import`),style:{flex:1,padding:`14px`,fontWeight:`600`,fontSize:`14px`,cursor:`pointer`,border:`none`,backgroundColor:`transparent`,borderBottom:W===`import`?`3px solid #31859C`:`3px solid transparent`,color:W===`import`?`#31859C`:`var(--color-text-secondary)`,transition:`all 0.2s ease`},children:e===`ar`?`📥 استيراد المعلمين`:`📥 Import Teachers`}),(0,m.jsx)(`button`,{type:`button`,onClick:()=>ke(`export`),style:{flex:1,padding:`14px`,fontWeight:`600`,fontSize:`14px`,cursor:`pointer`,border:`none`,backgroundColor:`transparent`,borderBottom:W===`export`?`3px solid #31859C`:`3px solid transparent`,color:W===`export`?`#31859C`:`var(--color-text-secondary)`,transition:`all 0.2s ease`},children:e===`ar`?`📤 التصدير والنموذج`:`📤 Export & Template`})]}),(0,m.jsx)(`div`,{className:`modal-body`,style:{padding:`24px`},children:W===`import`?(0,m.jsxs)(`form`,{onSubmit:async t=>{if(t&&t.preventDefault(),!G){alert(e===`ar`?`يرجى اختيار ملف أولاً`:`Please select a file first`);return}je(!0),q(10),J(e===`ar`?`جاري رفع الملف...`:`Uploading file...`),Y([]),Ie(!1);let n=new FormData;n.append(`file`,G);let r=setInterval(()=>{q(e=>e>=85?(clearInterval(r),85):e+15)},150);try{let t=await f.importTeachers(n);clearInterval(r),q(100),t.success?(Ie(!0),J(t.message),t.errors&&t.errors.length>0&&Y(t.errors),h(t.message),b(localStorage.getItem(`auth_token`),!0)):(J(e===`ar`?`فشل استيراد البيانات`:`Import failed`),t.errors&&t.errors.length>0?Y(t.errors):Y([t.message||(e===`ar`?`فشل استيراد البيانات`:`Import failed`)]))}catch(t){clearInterval(r),q(100),J(e===`ar`?`حدث خطأ أثناء الاتصال بالخادم`:`Error communicating with server`),Y([t.message||`Error`]),console.error(t)}finally{je(!1)}},style:{display:`flex`,flexDirection:`column`,gap:`20px`},children:[(0,m.jsxs)(`div`,{className:`form-group`,children:[(0,m.jsx)(`label`,{className:`form-label`,style:{fontWeight:`600`},children:e===`ar`?`ملف Excel أو CSV المراد استيراده (.xlsx, .csv)`:`Excel or CSV File to Import (.xlsx, .csv)`}),(0,m.jsxs)(`div`,{style:{border:`2px dashed rgba(49, 133, 156, 0.3)`,borderRadius:`16px`,padding:`30px 20px`,textAlign:`center`,backgroundColor:G?`rgba(49, 133, 156, 0.02)`:`rgba(0,0,0,0.01)`,cursor:`pointer`,transition:`all 0.2s ease`,position:`relative`},onClick:()=>document.getElementById(`excel-file-uploader`).click(),onDragOver:e=>{e.preventDefault()},onDrop:t=>{t.preventDefault();let n=t.dataTransfer.files[0];n&&(n.name.endsWith(`.xlsx`)||n.name.endsWith(`.xls`)||n.name.endsWith(`.csv`))?Ae(n):alert(e===`ar`?`يرجى اختيار ملف Excel أو CSV صالح.`:`Please choose a valid Excel or CSV file.`)},children:[(0,m.jsx)(`input`,{type:`file`,id:`excel-file-uploader`,accept:`.xlsx, .xls, .csv`,style:{display:`none`},onChange:e=>{let t=e.target.files[0];t&&Ae(t)}}),(0,m.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,alignItems:`center`,gap:`8px`},children:[(0,m.jsx)(c,{size:32,style:{color:`#31859C`,opacity:.8}}),G?(0,m.jsxs)(`div`,{children:[(0,m.jsx)(`div`,{style:{fontWeight:`bold`,color:`var(--color-text)`,fontSize:`14px`},children:G.name}),(0,m.jsxs)(`div`,{style:{fontSize:`12px`,color:`var(--color-text-secondary)`},children:[(G.size/1024).toFixed(1),` KB`]})]}):(0,m.jsxs)(`div`,{children:[(0,m.jsx)(`div`,{style:{fontWeight:`600`,fontSize:`14px`},children:e===`ar`?`اسحب وأفلت الملف هنا أو انقر للتصفح`:`Drag & drop file here or click to browse`}),(0,m.jsx)(`div`,{style:{fontSize:`11px`,color:`var(--color-text-secondary)`,marginTop:`4px`},children:e===`ar`?`صيغة الملف المدعومة: Excel (.xlsx) أو CSV`:`Supported extension: Excel (.xlsx) or CSV`})]})]})]})]}),(K||Me>0)&&(0,m.jsxs)(`div`,{style:{padding:`16px`,background:`rgba(0,0,0,0.02)`,borderRadius:`16px`,border:`1px solid var(--color-border)`},children:[(0,m.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,alignItems:`center`,marginBottom:`8px`},children:[(0,m.jsx)(`span`,{style:{fontSize:`13px`,fontWeight:`600`,color:`#31859C`},children:Ne}),(0,m.jsxs)(`span`,{style:{fontSize:`13px`,fontWeight:`bold`,fontFamily:`var(--font-mono)`},children:[Me,`%`]})]}),(0,m.jsx)(`div`,{style:{width:`100%`,height:`8px`,backgroundColor:`rgba(0,0,0,0.06)`,borderRadius:`999px`,overflow:`hidden`},children:(0,m.jsx)(`div`,{style:{width:`${Me}%`,height:`100%`,backgroundColor:Fe?`#10b981`:`#31859C`,borderRadius:`999px`,transition:`width 0.2s ease-out`}})}),Pe.length>0&&(0,m.jsxs)(`div`,{style:{marginTop:`14px`,borderTop:`1px dashed var(--color-border)`,paddingTop:`12px`},children:[(0,m.jsx)(`div`,{style:{fontSize:`12px`,fontWeight:`bold`,color:`var(--color-error)`,display:`flex`,alignItems:`center`,gap:`4px`,marginBottom:`8px`},children:(0,m.jsxs)(`span`,{children:[`⚠️ `,e===`ar`?`تنبيهات وتفاصيل الأخطاء:`:`Warnings & Error Details:`]})}),(0,m.jsx)(`ul`,{style:{maxHeight:`120px`,overflowY:`auto`,paddingInlineStart:`16px`,margin:0,fontSize:`12px`,color:`var(--color-text-secondary)`,display:`flex`,flexDirection:`column`,gap:`4px`},children:Pe.map((e,t)=>(0,m.jsx)(`li`,{style:{direction:`rtl`,textAlign:`right`},children:e},t))})]})]}),(0,m.jsxs)(`div`,{style:{display:`flex`,gap:`8px`,justifyContent:`flex-end`,marginTop:`10px`},children:[(0,m.jsx)(`button`,{type:`button`,className:`btn-elevated`,onClick:()=>U(!1),disabled:K,style:{height:`44px`,padding:`0 18px`},children:e===`ar`?`إلغاء`:`Cancel`}),(0,m.jsx)(`button`,{type:`submit`,className:`btn-filled`,disabled:K||!G,style:{height:`44px`,padding:`0 24px`,backgroundColor:`#31859C`,borderColor:`#31859C`,display:`flex`,alignItems:`center`,gap:`6px`},children:K?(0,m.jsx)(m.Fragment,{children:e===`ar`?`جاري الاستيراد...`:`Importing...`}):e===`ar`?`بدء الاستيراد`:`Start Import`})]})]}):(0,m.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`24px`},children:[(0,m.jsxs)(`div`,{style:{padding:`20px`,border:`1px solid var(--color-border)`,borderRadius:`16px`,backgroundColor:`rgba(0,0,0,0.01)`},children:[(0,m.jsx)(`h4`,{style:{margin:`0 0 4px 0`,fontSize:`15px`,color:`var(--color-text)`},children:e===`ar`?`1. تحميل نموذج Excel فارغ`:`1. Download Empty Excel Template`}),(0,m.jsx)(`p`,{style:{fontSize:`12px`,color:`var(--color-text-secondary)`,margin:`0 0 16px 0`},children:e===`ar`?`قم بتحميل القالب لتعبئة بيانات المعلمين مع حقل الرقم الوطني الاختياري.`:`Download template to fill in teachers' data with optional national ID.`}),(0,m.jsx)(`button`,{type:`button`,className:`btn-accent`,onClick:async()=>{try{X(!0);let t=await f.downloadTemplate();if(!t.ok){alert(e===`ar`?`فشل تحميل النموذج`:`Failed to download template`),X(!1);return}let n=await t.blob(),r=window.URL.createObjectURL(n),i=document.createElement(`a`);i.href=r,i.download=`teachers_template.xlsx`,document.body.appendChild(i),i.click(),i.remove()}catch(t){console.error(t),alert(e===`ar`?`حدث خطأ أثناء تحميل النموذج`:`Error downloading template`)}finally{X(!1)}},disabled:ze,style:{height:`42px`,padding:`0 20px`,backgroundColor:`#31859C`,borderColor:`#31859C`},children:ze?e===`ar`?`جاري التحميل...`:`Downloading...`:e===`ar`?`تحميل القالب (.xlsx)`:`Download Template (.xlsx)`})]}),(0,m.jsxs)(`div`,{style:{padding:`20px`,border:`1px solid var(--color-border)`,borderRadius:`16px`,backgroundColor:`rgba(0,0,0,0.01)`},children:[(0,m.jsx)(`h4`,{style:{margin:`0 0 4px 0`,fontSize:`15px`,color:`var(--color-text)`},children:e===`ar`?`2. تصدير بيانات المعلمين الحالية`:`2. Export Current Teachers Data`}),(0,m.jsx)(`p`,{style:{fontSize:`12px`,color:`var(--color-text-secondary)`,margin:`0 0 16px 0`},children:e===`ar`?`تصدير كافة المعلمين المسجلين في النظام بصيغة CSV تدعم اللغة العربية.`:`Export all registered teachers into an Arabic-friendly CSV file.`}),(0,m.jsx)(`button`,{type:`button`,className:`btn-filled`,onClick:async()=>{try{Re(!0);let t=await f.exportTeachers();if(!t.ok){alert(e===`ar`?`فشل تصدير البيانات`:`Failed to export data`),Re(!1);return}let n=await t.blob(),r=window.URL.createObjectURL(n),i=document.createElement(`a`);i.href=r,i.download=`teachers_export.csv`,document.body.appendChild(i),i.click(),i.remove()}catch(t){console.error(t),alert(e===`ar`?`حدث خطأ أثناء التصدير`:`Error exporting`)}finally{Re(!1)}},disabled:Le,style:{height:`42px`,padding:`0 20px`,backgroundColor:`#31859C`,borderColor:`#31859C`},children:Le?e===`ar`?`جاري التصدير...`:`Exporting...`:e===`ar`?`تصدير البيانات`:`Export Data`})]}),(0,m.jsx)(`div`,{style:{display:`flex`,justifyContent:`flex-end`,marginTop:`10px`},children:(0,m.jsx)(`button`,{type:`button`,className:`btn-elevated`,onClick:()=>U(!1),style:{height:`44px`,padding:`0 18px`},children:e===`ar`?`إغلاق`:`Close`})})]})})]})}),Be&&(0,m.jsx)(`div`,{className:`modal-overlay no-print`,children:(0,m.jsxs)(`div`,{className:`modal-container`,style:{maxWidth:`600px`,width:`92%`},children:[(0,m.jsxs)(`header`,{className:`modal-header`,children:[(0,m.jsxs)(`h3`,{className:`modal-title`,style:{display:`flex`,alignItems:`center`,gap:`8px`},children:[(0,m.jsx)(re,{size:20,color:`#d97706`}),(0,m.jsx)(`span`,{children:e===`ar`?`طباعة كشوفات المعلمين الجاهزة`:`Print Teachers Rosters`})]}),(0,m.jsx)(`button`,{className:`modal-close-btn`,onClick:()=>Z(!1),children:(0,m.jsx)(d,{size:20,strokeWidth:2.5})})]}),(0,m.jsxs)(`div`,{className:`modal-body`,style:{display:`flex`,flexDirection:`column`,gap:`16px`},children:[(0,m.jsxs)(`div`,{className:`form-group`,style:{marginBottom:0},children:[(0,m.jsx)(`label`,{className:`form-label`,style:{fontWeight:`700`,marginBottom:`10px`,display:`block`},children:e===`ar`?`اختر نوع الكشف المطلوب للطباعة:`:`Select Roster Template:`}),(0,m.jsx)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`10px`},children:[{id:`with_job_id`,title:`1. كشف بأسماء المعلمين مع الأرقام الوظيفية وعمود الملاحظات`,desc:`يحتوي على: الرقم التسلسلي (م)، الرقم الوظيفي، اسم المعلم، وعمود الملاحظات`},{id:`with_phone`,title:`2. كشف بأسماء المعلمين مع أرقام التلفونات وعمود الملاحظات`,desc:`يحتوي على: الرقم التسلسلي (م)، اسم المعلم، رقم التلفون، وعمود الملاحظات`},{id:`with_job_id_phone`,title:`3. كشف بأسماء المعلمين مع أرقام التلفونات والأرقام الوظيفية مع عمود الملاحظات`,desc:`يحتوي على: الرقم التسلسلي (م)، الرقم الوظيفي، اسم المعلم، رقم التلفون، وعمود الملاحظات`},{id:`with_full_assignments`,title:`4. كشف بأسماء المعلمين مع أرقام التلفونات والأرقام الوظيفية والفصول والشعب المكلفون بها مع المواد وعمود الملاحظات لكل صف وشعبة`,desc:`يحتوي على: الرقم التسلسلي (م)، الرقم الوظيفي، اسم المعلم، رقم التلفون، الصف والشعبة، المواد المسندة، وعمود الملاحظات لكل صف وشعبة`}].map(e=>{let t=Q===e.id;return(0,m.jsxs)(`label`,{style:{display:`flex`,alignItems:`flex-start`,gap:`12px`,padding:`12px 14px`,borderRadius:`10px`,border:t?`2px solid #d97706`:`1px solid var(--color-border, #cbd5e1)`,backgroundColor:t?`#fffbeb`:`var(--color-bg-secondary, #f8fafc)`,cursor:`pointer`,transition:`all 0.15s ease`},children:[(0,m.jsx)(`input`,{type:`radio`,name:`teacher_print_roster_type`,value:e.id,checked:t,onChange:e=>Ve(e.target.value),style:{marginTop:`4px`,accentColor:`#d97706`,width:`16px`,height:`16px`}}),(0,m.jsxs)(`div`,{style:{flex:1},children:[(0,m.jsx)(`div`,{style:{fontWeight:`700`,fontSize:`13.5px`,color:t?`#92400e`:`var(--color-text-primary, #0f172a)`},children:e.title}),(0,m.jsx)(`div`,{style:{fontSize:`12px`,color:`var(--color-text-secondary, #64748b)`,marginTop:`4px`},children:e.desc})]})]},e.id)})})]}),Q===`with_full_assignments`&&(0,m.jsxs)(`div`,{className:`form-group`,style:{marginBottom:0,padding:`12px 14px`,backgroundColor:`#f8fafc`,borderRadius:`10px`,border:`1px solid #cbd5e1`},children:[(0,m.jsx)(`label`,{className:`form-label`,style:{fontWeight:`700`,marginBottom:`6px`,display:`block`},children:e===`ar`?`تحديد الصف والشعبة (اختياري):`:`Filter by Class & Section (Optional):`}),(0,m.jsxs)(`select`,{className:`select-field`,value:$,onChange:e=>He(e.target.value),style:{width:`100%`},children:[(0,m.jsx)(`option`,{value:`all`,children:e===`ar`?`-- جميع الصفوف والشعب --`:`-- All Classes & Sections --`}),_.map(t=>{let n=typeof t.id==`string`&&t.id.startsWith(`cls-`)?t.id.replace(`cls-`,``):t.numericId||t.id;return(0,m.jsx)(`option`,{value:String(n),children:e===`ar`?t.name:t.nameEn||t.name},t.id)})]})]})]}),(0,m.jsxs)(`footer`,{className:`modal-footer`,style:{display:`flex`,justifyContent:`flex-start`,gap:`8px`},children:[(0,m.jsxs)(`button`,{type:`button`,className:`btn-filled`,onClick:Ge,disabled:Ue,style:{display:`flex`,alignItems:`center`,gap:`6px`,backgroundColor:`#d97706`,borderColor:`#d97706`,color:`#fff`,padding:`8px 20px`},children:[(0,m.jsx)(re,{size:16}),(0,m.jsx)(`span`,{children:Ue?e===`ar`?`جاري تجهيز الكشف...`:`Preparing...`:e===`ar`?`طباعة`:`Print`})]}),(0,m.jsx)(`button`,{type:`button`,className:`btn-elevated`,onClick:()=>Z(!1),disabled:Ue,children:t.cancel})]})]})})]})}function g(){return(0,m.jsx)(h,{})}export{g as default};