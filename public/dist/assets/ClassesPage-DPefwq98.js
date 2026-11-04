import{t as e}from"./plus-B9KZBbfI.js";import{t}from"./search-DhFeX4vl.js";import{t as n}from"./upload-DGX5i7En.js";import{D as r,E as i,J as a,K as o,M as ee,N as te,T as ne,V as s,r as c,t as l,u,z as d}from"./index-c1DpRb1_.js";import{t as re}from"./sloganBase64-BF9PhYUx.js";var f=a(o(),1),p=s();function ie(){let{lang:a,t:o,setToastMessage:s,triggerConfirm:ie,renderAvatar:m,canAction:h}=d(),{subjects:g,fetchSubjects:ae}=te(),{classes:_,setClasses:v,availableGrades:oe,availableSections:se,fetchClasses:y}=ee(),{teachers:b,fetchTeachers:x}=ne(),{students:S,fetchStudents:ce}=l();(0,f.useEffect)(()=>{y(!0),x(`?per_page=1000`),ce(),ae(!0)},[]);let[C,w]=(0,f.useState)(!1),[T,le]=(0,f.useState)(``),[E,D]=(0,f.useState)(``),[ue,O]=(0,f.useState)(!1),[de,k]=(0,f.useState)(!1),[fe,pe]=(0,f.useState)(!1),[A,j]=(0,f.useState)(null),[M,me]=(0,f.useState)(null),[he,ge]=(0,f.useState)(``),[_e,ve]=(0,f.useState)(``),[N,P]=(0,f.useState)(`الصف الأول`),[F,I]=(0,f.useState)(`Grade 1`),[L,R]=(0,f.useState)(`أ`),[z,B]=(0,f.useState)(`A`),[V,H]=(0,f.useState)([]),[ye,U]=(0,f.useState)(!1),[W,be]=(0,f.useState)(`classes_students_count`),[G,xe]=(0,f.useState)(`all`),[K,Se]=(0,f.useState)(!1),[Ce,q]=(0,f.useState)(!1),[J,we]=(0,f.useState)(`import`),[Y,Te]=(0,f.useState)(null),[X,Ee]=(0,f.useState)(!1),[De,Z]=(0,f.useState)(0),[Oe,Q]=(0,f.useState)(``),[ke,$]=(0,f.useState)([]),[Ae,je]=(0,f.useState)(!1),[Me,Ne]=(0,f.useState)(!1),[Pe,Fe]=(0,f.useState)(!1),Ie=async()=>{try{Ne(!0);let e=await i.exportClasses();if(!e.ok){alert(a===`ar`?`فشل تصدير البيانات`:`Failed to export data`);return}let t=await e.blob(),n=window.URL.createObjectURL(t),r=document.createElement(`a`);r.href=n,r.download=`classes_export.csv`,document.body.appendChild(r),r.click(),r.remove()}catch(e){console.error(e),alert(a===`ar`?`حدث خطأ أثناء التصدير`:`Error exporting`)}finally{Ne(!1)}},Le=async()=>{try{Fe(!0);let e=await i.downloadTemplate();if(!e.ok){alert(a===`ar`?`فشل تحميل النموذج`:`Failed to download template`);return}let t=await e.blob(),n=window.URL.createObjectURL(t),r=document.createElement(`a`);r.href=n,r.download=`classes_template.xlsx`,document.body.appendChild(r),r.click(),r.remove()}catch(e){console.error(e),alert(a===`ar`?`حدث خطأ أثناء تحميل النموذج`:`Error downloading template`)}finally{Fe(!1)}},Re=async e=>{if(e&&e.preventDefault(),!Y){alert(a===`ar`?`يرجى اختيار ملف أولاً`:`Please select a file first`);return}Ee(!0),Z(10),Q(a===`ar`?`جاري رفع الملف...`:`Uploading file...`),$([]),je(!1);let t=new FormData;t.append(`file`,Y);let n=setInterval(()=>{Z(e=>e>=85?(clearInterval(n),85):e+15)},150);try{let e=await i.importClasses(t);clearInterval(n),Z(100),e.success?(je(!0),Q(e.message),e.errors&&e.errors.length>0&&$(e.errors),s(e.message),y(!0)):(Q(a===`ar`?`فشل استيراد البيانات`:`Import failed`),e.errors&&e.errors.length>0?$(e.errors):$([e.message||(a===`ar`?`فشل استيراد البيانات`:`Import failed`)]))}catch(e){clearInterval(n),Z(100),Q(a===`ar`?`حدث خطأ أثناء الاتصال بالخادم`:`Error communicating with server`),$([e.message||`Error`]),console.error(e)}finally{Ee(!1)}},ze=async()=>{Se(!0);try{let e=[],t=[...b];try{let t=await i.getClasses();Array.isArray(t?.classes)&&(e=t.classes)}catch(e){console.warn(`API classes fetch failed, falling back to local state:`,e)}if(t.length===0)try{let e=await r.getTeachers(`?per_page=1000`);Array.isArray(e?.teachers)&&(t=e.teachers)}catch(e){console.warn(`API teachers fetch failed:`,e)}let n=e=>e?e.replace(/[\u064B-\u065F\u0670]/g,``).replace(/[إأآٱ]/g,`ا`).replace(/ة/g,`ه`).replace(/ى/g,`ي`).trim():``,a=[];a=e.length>0?e.map(e=>{let t=e.id,n=e.grade_ar||e.grade||``,r=e.section_ar||e.section||``,i=`${n} - ${r}`,a=Array.isArray(e.subjects)?e.subjects.map(e=>typeof e==`string`?e:e.name_ar||e.name||``).filter(Boolean):[];return{numericId:t,grade:n,section:r,name:i,studentsCount:typeof e.students_count==`number`?e.students_count:S.filter(e=>Number(e.class_id)===Number(t)||e.grade===n&&e.section===r).length,subjects:a,subjectTeachers:e.subject_teachers||{}}}):_.map(e=>{let t=e.numericId||parseInt(String(e.id).replace(/\D/g,``),10),n=typeof e.studentsCount==`number`&&e.studentsCount>0?e.studentsCount:S.filter(n=>Number(n.class_id)===Number(t)||n.grade===e.grade&&n.section===e.section).length;return{numericId:t,grade:e.grade||``,section:e.section||``,name:e.name||`${e.grade} - ${e.section}`,studentsCount:n,subjects:Array.isArray(e.subjects)?[...e.subjects]:[],subjectTeachers:e.subjectTeachers||{}}});let o=G&&G!==`all`?String(G).replace(/\D/g,``):``;o&&(a=a.filter(e=>String(e.numericId)===String(o)));let ee=oe||[];a.sort((e,t)=>{let r=ee.indexOf(e.grade),i=ee.indexOf(t.grade);if(r!==-1&&i!==-1&&r!==i)return r-i;let a=n(e.grade).localeCompare(n(t.grade),`ar`);return a===0?n(e.section).localeCompare(n(t.section),`ar`):a});let te=(e,n)=>{if(e.subjectTeachers&&e.subjectTeachers[n])return e.subjectTeachers[n];let r=[];return t.forEach(t=>{let i=t.name_ar||t.name||``;Array.isArray(t.teachingAssignments)?t.teachingAssignments.some(t=>t.subject===n&&(t.class===e.name||t.classId&&Number(t.classId)===Number(e.numericId)))&&i&&!r.includes(i)&&r.push(i):Array.isArray(t.assignments)&&t.assignments.some(t=>{let r=t.subject?t.subject.name_ar||t.subject.name:``,i=t.school_class?t.school_class.id:t.class_id;return r===n&&Number(i)===Number(e.numericId)})&&i&&!r.includes(i)&&r.push(i)}),r.length>0?r.join(`، `):`غير مسند`},ne=a.reduce((e,t)=>e+(Number(t.studentsCount)||0),0),s=new Date().toLocaleDateString(`ar-SA`,{year:`numeric`,month:`long`,day:`numeric`,weekday:`long`}),c=``;c=W===`classes_students_count`?`
          <tr>
            <th style="width: 42px;">م</th>
            <th style="text-align: right;">الصف</th>
            <th style="width: 140px; text-align: center;">الشعبة</th>
            <th style="width: 160px; text-align: center;">عدد الطلاب</th>
          </tr>
        `:`
          <tr>
            <th style="width: 36px;">م</th>
            <th style="width: 135px; text-align: right;">الصف</th>
            <th style="width: 65px; text-align: center;">الشعبة</th>
            <th style="width: 75px; text-align: center;">عدد الطلاب</th>
            <th style="width: 150px; text-align: right;">المادة الدراسية</th>
            <th style="width: 170px; text-align: right;">اسم المعلم</th>
            <th style="text-align: right;">الملاحظات</th>
          </tr>
        `;let l=``;l=a.length===0?`
          <tr>
            <td colspan="${W===`classes_students_count`?4:7}" style="text-align:center;padding:24px;color:#64748b;font-weight:700;">
              لا توجد فصول دراسية مسجلة لهذا النطاق
            </td>
          </tr>
        `:W===`classes_students_count`?a.map((e,t)=>`
          <tr>
            <td class="col-num">${t+1}</td>
            <td class="col-name">${e.grade}</td>
            <td style="text-align:center;font-weight:800;font-size:12px;">${e.section}</td>
            <td style="text-align:center;font-weight:800;font-size:12px;color:#1e3a8a;">${e.studentsCount}</td>
          </tr>
        `).join(``)+`
          <tr style="background-color:#e2e8f0;font-weight:800;">
            <td colspan="3" style="text-align:center;padding:8px 10px;color:#0f2e5a;font-size:12px;">الإجمالي الكلي للطلاب في جميع الشعب</td>
            <td style="text-align:center;padding:8px 10px;color:#0f2e5a;font-size:12.5px;">${ne} طالب</td>
          </tr>
        `:a.map((e,t)=>{let r=[...e.subjects||[]].sort((e,t)=>n(e).localeCompare(n(t),`ar`)),i=r.length>0?r:[`لا توجد مواد مقررة`],a=i.length;return i.map((n,i)=>{let o=r.length>0?te(e,n):`—`;return i===0?`
                <tr>
                  <td class="col-num" rowspan="${a}">${t+1}</td>
                  <td class="col-name" rowspan="${a}">${e.grade}</td>
                  <td style="text-align:center;font-weight:800;font-size:11.5px;" rowspan="${a}">${e.section}</td>
                  <td style="text-align:center;font-weight:800;font-size:11.5px;color:#1e3a8a;" rowspan="${a}">${e.studentsCount}</td>
                  <td style="text-align:right;font-weight:700;font-size:11px;">${n}</td>
                  <td style="text-align:right;font-weight:600;font-size:11px;">${o}</td>
                  <td class="col-notes">&nbsp;</td>
                </tr>
              `:`
                <tr>
                  <td style="text-align:right;font-weight:700;font-size:11px;">${n}</td>
                  <td style="text-align:right;font-weight:600;font-size:11px;">${o}</td>
                  <td class="col-notes">&nbsp;</td>
                </tr>
              `}).join(``)}).join(``);let u=`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8">
<title>كشف الفصول الدراسية والشعب</title>
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
  .col-name {
    text-align: right;
    font-weight: 700;
    font-size: 11.5px;
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
        <img src="${re}" alt="Logo" />
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
        <div class="sr-meta-item">إجمالي الشعب الدراسية: <strong>${a.length} شعبة</strong></div>
        <div class="sr-meta-item">إجمالي الطلاب: <strong>${ne} طالب</strong></div>
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
</html>`,d=document.getElementById(`classes-print-frame`);d&&d.remove(),d=document.createElement(`iframe`),d.id=`classes-print-frame`,d.style.position=`fixed`,d.style.right=`0`,d.style.bottom=`0`,d.style.width=`0`,d.style.height=`0`,d.style.border=`0`,document.body.appendChild(d);let f=d.contentWindow||d.contentDocument,p=f.document||f;p.open(),p.write(u),p.close(),setTimeout(()=>{try{d.contentWindow.focus(),d.contentWindow.print()}catch(e){console.error(`Print trigger error:`,e)}},350),U(!1)}catch(e){console.error(`Roster generation failed:`,e),alert(`حدث خطأ أثناء إعداد كشف الطباعة`)}finally{Se(!1)}},Be=e=>{e.preventDefault(),D(``);let t=`${N} - ${L}`,n=`${F} - ${z}`;if(_.some(e=>e.name===t)){D(a===`ar`?`هذا الفصل مسجل بالفعل!`:`Class name already exists!`);return}let r=localStorage.getItem(`auth_token`);if(w(!0),r)i.createClass({grade_ar:N,grade_en:F,section_ar:L,section_en:z}).then(e=>{if(e.success)return i.syncSubjects(e.class.id,V).then(()=>{let t={id:`cls-${e.class.id}`,name:`${e.class.grade_ar} - ${e.class.section_ar}`,nameEn:`${e.class.grade_en} - ${e.class.section_en}`,grade:e.class.grade_ar,gradeEn:e.class.grade_en,section:e.class.section_ar,sectionEn:e.class.section_en,subjects:V};v(e=>[...e,t]),x(r),O(!1),s(a===`ar`?`تمت إضافة الفصل الدراسي بنجاح!`:`Class created successfully!`),setTimeout(()=>s(``),3e3)}).catch(t=>{console.error(`Error syncing class subjects:`,t);let n={id:`cls-${e.class.id}`,name:`${e.class.grade_ar} - ${e.class.section_ar}`,nameEn:`${e.class.grade_en} - ${e.class.section_en}`,grade:e.class.grade_ar,gradeEn:e.class.grade_en,section:e.class.section_ar,sectionEn:e.class.section_en,subjects:V};v(e=>[...e,n]),O(!1)});D(e.message||`Error`)}).catch(e=>{console.error(`Error creating class:`,e),D(a===`ar`?`حدث خطأ أثناء حفظ الفصل.`:`Error saving class.`)}).finally(()=>{w(!1)});else{let e={id:`cls-`+Date.now(),name:t,nameEn:n,grade:N,gradeEn:F,section:L,sectionEn:z,subjects:V};v(t=>[...t,e]),O(!1),s(a===`ar`?`تمت إضافة الفصل الدراسي بنجاح!`:`Class created successfully!`),setTimeout(()=>s(``),3e3),w(!1)}},Ve=e=>{e.preventDefault(),D(``);let t=`${N} - ${L}`,n=`${F} - ${z}`;if(_.some(e=>e.id!==M&&e.name===t)){D(a===`ar`?`هذا الفصل مسجل بالفعل!`:`Class name already exists!`);return}let r=localStorage.getItem(`auth_token`);if(w(!0),r){let e=Number(String(M).replace(`cls-`,``));i.updateClass(e,{grade_ar:N,grade_en:F,section_ar:L,section_en:z}).then(o=>{if(o.success)return i.syncSubjects(e,V).then(()=>{v(e=>e.map(e=>e.id===M?{...e,name:t,nameEn:n,grade:N,gradeEn:F,section:L,sectionEn:z,subjects:V}:e)),y(!0),x(r),k(!1),s(a===`ar`?`تم تحديث بيانات الفصل بنجاح!`:`Class details updated successfully!`),setTimeout(()=>s(``),3e3)}).catch(e=>{console.error(`Error syncing class subjects during update:`,e),v(e=>e.map(e=>e.id===M?{...e,name:t,nameEn:n,grade:N,gradeEn:F,section:L,sectionEn:z,subjects:V}:e)),k(!1)});D(o.message||`Error`)}).catch(e=>{console.error(`Error updating class:`,e),D(a===`ar`?`حدث خطأ أثناء تحديث بيانات الفصل.`:`Error updating class details.`)}).finally(()=>{w(!1)})}else v(e=>e.map(e=>e.id===M?{...e,name:t,nameEn:n,grade:N,gradeEn:F,section:L,sectionEn:z,subjects:V}:e)),k(!1),s(a===`ar`?`تم تحديث بيانات الفصل بنجاح!`:`Class details updated successfully!`),setTimeout(()=>s(``),3e3),w(!1)},He=e=>{ie({title:a===`ar`?`حذف الفصل الدراسي`:`Delete Class`,message:a===`ar`?`هل أنت متأكد من حذف هذا الفصل؟ سيتم فصل طلابه وتكليفات المعلمين المرتبطة به.`:`Are you sure you want to delete this class? Connected students and teacher assignments will be unlinked.`,onConfirm:()=>{if(localStorage.getItem(`auth_token`)){let t=Number(String(e).replace(`cls-`,``));i.deleteClass(t).then(t=>{t.success&&(v(t=>t.filter(t=>t.id!==e)),s(a===`ar`?`تم حذف الفصل بنجاح`:`Class deleted successfully`),setTimeout(()=>s(``),3e3))}).catch(e=>{console.error(`Error deleting class:`,e),alert(a===`ar`?`فشل حذف الفصل من قاعدة البيانات`:`Failed to delete class from database`)})}else v(t=>t.filter(t=>t.id!==e)),s(a===`ar`?`تم حذف الفصل بنجاح`:`Class deleted successfully`),setTimeout(()=>s(``),3e3)}})};return(0,p.jsxs)(p.Fragment,{children:[(0,p.jsxs)(`div`,{className:`section-card`,children:[(0,p.jsxs)(`div`,{className:`section-card-header no-print`,style:{display:`flex`,justifyContent:`space-between`,alignItems:`center`,gap:`var(--space-md)`,flexWrap:`wrap`},children:[(0,p.jsx)(`h3`,{className:`section-card-title headline-small`,style:{fontSize:`18px`,margin:0},children:a===`ar`?`سجل الفصول الدراسية والشُعب`:`Classes & Sections Registry`}),(0,p.jsxs)(`div`,{style:{display:`flex`,gap:`8px`,alignItems:`center`,flexWrap:`wrap`},children:[(0,p.jsxs)(`button`,{className:`btn-secondary`,onClick:()=>U(!0),style:{display:`flex`,alignItems:`center`,gap:`6px`,padding:`8px 16px`,fontSize:`13px`,fontWeight:`700`,color:`#d97706`,borderColor:`#fcd34d`,backgroundColor:`#fffbeb`},children:[(0,p.jsx)(u,{size:16}),a===`ar`?`طباعة كشف`:`Print Roster`]}),(0,p.jsxs)(`button`,{className:`btn-elevated`,onClick:()=>{Te(null),Z(0),Q(``),$([]),je(!1),q(!0)},style:{display:`flex`,alignItems:`center`,gap:`6px`,backgroundColor:`rgba(49, 133, 156, 0.08)`,borderColor:`rgba(49, 133, 156, 0.25)`,color:`#31859C`},children:[(0,p.jsx)(n,{size:16}),a===`ar`?`الاستيراد والتصدير (Excel)`:`Excel Import & Export`]}),h(`classes`,`create`)&&(0,p.jsxs)(`button`,{className:`btn-accent`,onClick:()=>{D(``),ge(``),ve(``),P(`الصف الأول`),I(`Grade 1`),R(`أ`),B(`A`),H([]),O(!0)},children:[(0,p.jsx)(e,{size:18,strokeWidth:2.5,style:{marginInlineEnd:`4px`}}),a===`ar`?`إضافة فصل جديد`:`Add New Class`]})]})]}),(0,p.jsx)(`div`,{className:`students-controls no-print`,style:{marginBottom:`var(--space-lg)`},children:(0,p.jsxs)(`div`,{className:`search-box`,children:[(0,p.jsx)(t,{size:18}),(0,p.jsx)(`input`,{type:`text`,className:`text-field`,placeholder:a===`ar`?`ابحث عن فصل...`:`Search for a class...`,value:T,onChange:e=>le(e.target.value)})]})}),(0,p.jsx)(`div`,{className:`classes-grid`,children:(()=>{let e=_.filter(e=>{let t=T.toLowerCase();return e.name.toLowerCase().includes(t)||e.nameEn&&e.nameEn.toLowerCase().includes(t)||e.grade.toLowerCase().includes(t)});return e.length===0?(0,p.jsx)(`div`,{style:{gridColumn:`1 / -1`,padding:`48px 24px`,textAlign:`center`,border:`1px dashed var(--color-border)`,borderRadius:`var(--radius-card)`,background:`var(--color-surface)`},children:(0,p.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,alignItems:`center`,justifyContent:`center`,gap:`8px`},children:[(0,p.jsx)(`span`,{style:{fontSize:`32px`},children:T?`🔍`:`📂`}),(0,p.jsx)(`span`,{style:{fontWeight:`600`,fontSize:`15px`,color:`var(--color-text-primary)`},children:T?a===`ar`?`لا توجد فصول تطابق بحثك`:`No matching classes found`:a===`ar`?`لا يوجد فصول دراسية مسجلة حالياً`:`No classes registered yet`}),(0,p.jsx)(`span`,{style:{fontSize:`13px`,color:`var(--color-text-secondary)`},children:T?a===`ar`?`جرب البحث بكلمة مفتاحية مختلفة`:`Try searching for a different keyword`:a===`ar`?`لم يتم إضافة أي بيانات بعد`:`No records have been added yet`})]})}):e.map(e=>{let t=e.numericId||(e.id?parseInt(String(e.id).replace(/\D/g,``),10):null),n=typeof e.studentsCount==`number`&&e.studentsCount>0?e.studentsCount:S.filter(n=>n.class_id&&Number(n.class_id)===Number(t)||n.grade===e.grade&&n.section===e.section).length,r=e.id?parseInt(String(e.id).replace(/\D/g,``),10):null,i=b.filter(t=>t.classes&&t.classes.includes(e.name)||t.classIds&&r&&t.classIds.includes(r));return(0,p.jsxs)(`div`,{className:`class-card`,children:[(0,p.jsx)(`div`,{className:`class-card-icon`,style:{fontSize:`24px`,color:`var(--color-primary-ui)`},children:`🏫`}),(0,p.jsxs)(`div`,{className:`class-card-header-info`,children:[(0,p.jsx)(`h4`,{className:`title-large`,style:{margin:0,fontWeight:`700`},children:a===`ar`?e.name:e.nameEn||e.name}),(0,p.jsx)(`span`,{style:{fontSize:`12px`,color:`var(--color-text-secondary)`},children:a===`ar`?`المرحلة: ${e.grade}`:`Grade: ${e.gradeEn||e.grade}`})]}),(0,p.jsxs)(`div`,{className:`class-card-body`,style:{marginTop:`8px`},children:[(0,p.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,marginBottom:`8px`,fontSize:`13px`},children:[(0,p.jsxs)(`span`,{children:[`👥 `,a===`ar`?`الطلاب:`:`Students:`]}),(0,p.jsxs)(`strong`,{style:{color:`var(--color-text-primary)`},children:[n,` `,a===`ar`?`طالب`:`students`]})]}),(0,p.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,marginBottom:`12px`,fontSize:`13px`},children:[(0,p.jsxs)(`span`,{children:[`👨‍🏫 `,a===`ar`?`المعلمون:`:`Teachers:`]}),(0,p.jsxs)(`strong`,{style:{color:`var(--color-text-primary)`},children:[i.length,` `,a===`ar`?`معلم`:`teachers`]})]}),(0,p.jsxs)(`div`,{style:{marginBottom:`12px`},children:[(0,p.jsxs)(`div`,{style:{fontSize:`12px`,fontWeight:`bold`,marginBottom:`4px`,color:`var(--color-text-secondary)`},children:[`📚 `,a===`ar`?`المواد المقررة:`:`Assigned Subjects:`]}),(0,p.jsx)(`div`,{style:{display:`flex`,gap:`4px`,flexWrap:`wrap`,maxHeight:`55px`,overflowY:`auto`},children:e.subjects&&e.subjects.length>0?e.subjects.map((e,t)=>(0,p.jsx)(`span`,{className:`chip`,style:{fontSize:`10px`,padding:`2px 6px`,background:`rgba(30, 80, 142, 0.05)`,color:`var(--color-primary-ui)`,cursor:`default`,border:`1px solid rgba(30, 80, 142, 0.1)`},children:e},t)):(0,p.jsx)(`span`,{style:{fontSize:`11px`,fontStyle:`italic`,color:`var(--color-text-secondary)`},children:a===`ar`?`لا يوجد مواد`:`No subjects assigned`})})]}),(0,p.jsxs)(`div`,{style:{marginBottom:`12px`},children:[(0,p.jsxs)(`div`,{style:{fontSize:`12px`,fontWeight:`bold`,marginBottom:`4px`,color:`var(--color-text-secondary)`},children:[`🎓 `,a===`ar`?`المدرسون:`:`Instructors:`]}),(0,p.jsx)(`div`,{style:{display:`flex`,gap:`6px`,flexWrap:`wrap`,alignItems:`center`},children:i.length>0?i.map((e,t)=>(0,p.jsxs)(`span`,{style:{fontSize:`11px`,display:`flex`,alignItems:`center`,gap:`4px`,padding:`2px 8px`,background:`rgba(30, 80, 142, 0.04)`,borderRadius:`12px`,border:`1px solid var(--color-border)`},title:a===`ar`?e.subject:e.subjectEn,children:[m(e.photo,`👨‍🏫`,{width:`20px`,height:`20px`,fontSize:`13px`,marginInlineEnd:0}),(0,p.jsx)(`span`,{style:{fontWeight:`500`},children:a===`ar`?e.name:e.nameEn||e.name})]},t)):(0,p.jsx)(`span`,{style:{fontSize:`11px`,fontStyle:`italic`,color:`var(--color-text-secondary)`},children:a===`ar`?`لا يوجد معلمون`:`No teachers assigned`})})]})]}),(0,p.jsxs)(`div`,{className:`class-card-actions`,style:{display:`flex`,gap:`8px`,marginTop:`auto`,paddingTop:`12px`,borderTop:`1px solid var(--color-border)`},children:[(0,p.jsxs)(`button`,{className:`btn-elevated`,style:{flex:1,padding:`8px 4px`,fontSize:`12px`},onClick:()=>{j(e),pe(!0)},children:[`🔍 `,a===`ar`?`عرض التفاصيل`:`Details`]}),h(`classes`,`update`,e.id)&&(0,p.jsx)(`button`,{className:`btn-elevated`,style:{padding:`8px 10px`,fontSize:`12px`},onClick:()=>{D(``),me(e.id),ge(e.name),ve(e.nameEn||``),P(e.grade),I(e.gradeEn||``),R(e.section),B(e.sectionEn||``),H(e.subjects||[]),k(!0)},children:`📝`}),h(`classes`,`delete`,e.id)&&(0,p.jsx)(`button`,{className:`btn-elevated danger`,style:{padding:`8px 10px`,fontSize:`12px`,color:`var(--color-error)`},onClick:()=>He(e.id),children:`🗑️`})]})]},e.id)})})()})]}),ue&&(0,p.jsx)(`div`,{className:`modal-overlay no-print`,children:(0,p.jsxs)(`div`,{className:`modal-container`,style:{maxWidth:`500px`},children:[(0,p.jsxs)(`header`,{className:`modal-header`,children:[(0,p.jsxs)(`h3`,{className:`modal-title`,children:[`🏫 `,a===`ar`?`إنشاء فصل دراسي جديد`:`Create New Class`]}),(0,p.jsx)(`button`,{className:`modal-close-btn`,onClick:()=>O(!1),children:(0,p.jsx)(c,{size:20,strokeWidth:2.5})})]}),(0,p.jsxs)(`form`,{onSubmit:Be,children:[(0,p.jsxs)(`div`,{className:`modal-body`,children:[E&&(0,p.jsx)(`div`,{style:{padding:`var(--space-md)`,backgroundColor:`rgba(220, 38, 38, 0.1)`,color:`var(--color-error)`,borderRadius:`var(--radius-chip)`,fontSize:`13px`,fontWeight:`600`,marginBottom:`12px`},children:E}),(0,p.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:`1fr 1fr`,gap:`var(--space-md)`},children:[(0,p.jsxs)(`div`,{className:`form-group`,children:[(0,p.jsxs)(`label`,{className:`form-label`,children:[a===`ar`?`الصف`:`Grade`,` `,(0,p.jsx)(`span`,{style:{color:`var(--color-error)`},children:`*`})]}),(0,p.jsx)(`select`,{className:`text-field`,value:N,onChange:e=>{P(e.target.value),I({"تمهيدي أول":`KG1`,"تمهيدي ثاني":`KG2`,"الصف الأول":`Grade 1`,"الصف الثاني":`Grade 2`,"الصف الثالث":`Grade 3`,"الصف الرابع":`Grade 4`,"الصف الخامس":`Grade 5`,"الصف السادس":`Grade 6`,"الصف الأول المتوسط":`Grade 7`,"الصف الثاني المتوسط":`Grade 8`,"الصف الثالث المتوسط":`Grade 9`,"الصف الأول الثانوي":`Grade 10`,"الصف الثاني الثانوي":`Grade 11`,"الصف الثالث الثانوي":`Grade 12`}[e.target.value]||`Grade 1`)},children:oe.map((e,t)=>(0,p.jsx)(`option`,{value:e,children:e},t))})]}),(0,p.jsxs)(`div`,{className:`form-group`,children:[(0,p.jsxs)(`label`,{className:`form-label`,children:[a===`ar`?`الشعبة (القسم)`:`Section`,` `,(0,p.jsx)(`span`,{style:{color:`var(--color-error)`},children:`*`})]}),(0,p.jsx)(`select`,{className:`text-field`,value:L,onChange:e=>{R(e.target.value),B({أ:`A`,ب:`B`,ج:`C`,د:`D`,هـ:`E`,و:`F`,ز:`G`}[e.target.value]||`A`)},children:se.map((e,t)=>(0,p.jsx)(`option`,{value:e,children:a===`ar`?e:{أ:`A`,ب:`B`,ج:`C`,د:`D`,هـ:`E`,و:`F`,ز:`G`}[e]||e},t))})]})]}),(0,p.jsxs)(`div`,{className:`form-group`,children:[(0,p.jsx)(`label`,{className:`form-label`,children:a===`ar`?`المواد المقررة للفصل`:`Assigned Subjects`}),(0,p.jsx)(`div`,{style:{display:`grid`,gridTemplateColumns:`1fr 1fr`,gap:`8px`,maxHeight:`150px`,overflowY:`auto`,border:`1px solid var(--color-border)`,padding:`12px`,borderRadius:`var(--radius-input)`},children:g.map(e=>(0,p.jsxs)(`label`,{style:{display:`flex`,alignItems:`center`,gap:`6px`,fontSize:`13px`,cursor:`pointer`},children:[(0,p.jsx)(`input`,{type:`checkbox`,checked:V.includes(e.name),onChange:t=>{t.target.checked?H(t=>[...t,e.name]):H(t=>t.filter(t=>t!==e.name))}}),a===`ar`?e.name:e.nameEn]},e.id))})]})]}),(0,p.jsxs)(`footer`,{className:`modal-footer`,children:[(0,p.jsx)(`button`,{type:`button`,className:`btn-elevated`,onClick:()=>O(!1),style:{height:`48px`},disabled:C,children:o.cancel}),(0,p.jsx)(`button`,{type:`submit`,className:`btn-filled`,style:{height:`48px`,opacity:C?.7:1},disabled:C,children:C?a===`ar`?`جاري الحفظ...`:`Saving...`:o.submit})]})]})]})}),de&&(0,p.jsx)(`div`,{className:`modal-overlay no-print`,children:(0,p.jsxs)(`div`,{className:`modal-container`,style:{maxWidth:`500px`},children:[(0,p.jsxs)(`header`,{className:`modal-header`,children:[(0,p.jsxs)(`h3`,{className:`modal-title`,children:[`🏫 `,a===`ar`?`تعديل مواد وبيانات الفصل: ${N} - ${L}`:`Edit Class & Subjects: ${N} - ${L}`]}),(0,p.jsx)(`button`,{className:`modal-close-btn`,onClick:()=>k(!1),children:(0,p.jsx)(c,{size:20,strokeWidth:2.5})})]}),(0,p.jsxs)(`form`,{onSubmit:Ve,children:[(0,p.jsxs)(`div`,{className:`modal-body`,children:[E&&(0,p.jsx)(`div`,{style:{padding:`var(--space-md)`,backgroundColor:`rgba(220, 38, 38, 0.1)`,color:`var(--color-error)`,borderRadius:`var(--radius-chip)`,fontSize:`13px`,fontWeight:`600`,marginBottom:`12px`},children:E}),(0,p.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:`1fr 1fr`,gap:`var(--space-md)`},children:[(0,p.jsxs)(`div`,{className:`form-group`,children:[(0,p.jsxs)(`label`,{className:`form-label`,children:[a===`ar`?`الصف`:`Grade`,` `,(0,p.jsx)(`span`,{style:{color:`var(--color-error)`},children:`*`})]}),(0,p.jsx)(`select`,{className:`text-field`,value:N,onChange:e=>{P(e.target.value),I({"تمهيدي أول":`KG1`,"تمهيدي ثاني":`KG2`,"الصف الأول":`Grade 1`,"الصف الثاني":`Grade 2`,"الصف الثالث":`Grade 3`,"الصف الرابع":`Grade 4`,"الصف الخامس":`Grade 5`,"الصف السادس":`Grade 6`,"الصف الأول المتوسط":`Grade 7`,"الصف الثاني المتوسط":`Grade 8`,"الصف الثالث المتوسط":`Grade 9`,"الصف الأول الثانوي":`Grade 10`,"الصف الثاني الثانوي":`Grade 11`,"الصف الثالث الثانوي":`Grade 12`}[e.target.value]||`Grade 1`)},children:Array.from(new Set([...oe,N])).filter(Boolean).map((e,t)=>(0,p.jsx)(`option`,{value:e,children:e},t))})]}),(0,p.jsxs)(`div`,{className:`form-group`,children:[(0,p.jsxs)(`label`,{className:`form-label`,children:[a===`ar`?`الشعبة (القسم)`:`Section`,` `,(0,p.jsx)(`span`,{style:{color:`var(--color-error)`},children:`*`})]}),(0,p.jsx)(`select`,{className:`text-field`,value:L,onChange:e=>{R(e.target.value),B({أ:`A`,ب:`B`,ج:`C`,د:`D`,هـ:`E`,و:`F`,ز:`G`}[e.target.value]||`A`)},children:se.map((e,t)=>(0,p.jsx)(`option`,{value:e,children:a===`ar`?e:{أ:`A`,ب:`B`,ج:`C`,د:`D`,هـ:`E`,و:`F`,ز:`G`}[e]||e},t))})]})]}),(0,p.jsxs)(`div`,{className:`form-group`,children:[(0,p.jsx)(`label`,{className:`form-label`,children:a===`ar`?`المواد المقررة للفصل`:`Assigned Subjects`}),(0,p.jsx)(`div`,{style:{display:`grid`,gridTemplateColumns:`1fr 1fr`,gap:`8px`,maxHeight:`150px`,overflowY:`auto`,border:`1px solid var(--color-border)`,padding:`12px`,borderRadius:`var(--radius-input)`},children:g.map(e=>(0,p.jsxs)(`label`,{style:{display:`flex`,alignItems:`center`,gap:`6px`,fontSize:`13px`,cursor:`pointer`},children:[(0,p.jsx)(`input`,{type:`checkbox`,checked:V.includes(e.name),onChange:t=>{t.target.checked?H(t=>[...t,e.name]):H(t=>t.filter(t=>t!==e.name))}}),a===`ar`?e.name:e.nameEn]},e.id))})]})]}),(0,p.jsxs)(`footer`,{className:`modal-footer`,children:[(0,p.jsx)(`button`,{type:`button`,className:`btn-elevated`,onClick:()=>k(!1),style:{height:`48px`},disabled:C,children:o.cancel}),(0,p.jsx)(`button`,{type:`submit`,className:`btn-filled`,style:{height:`48px`,opacity:C?.7:1},disabled:C,children:C?a===`ar`?`جاري الحفظ...`:`Saving...`:o.submit})]})]})]})}),fe&&A&&(0,p.jsx)(`div`,{className:`modal-overlay`,children:(0,p.jsxs)(`div`,{className:`modal-container`,style:{maxWidth:`650px`},children:[(0,p.jsxs)(`header`,{className:`modal-header`,children:[(0,p.jsxs)(`h3`,{className:`modal-title`,children:[`🏫 `,a===`ar`?`تفاصيل الفصل: ${A.name}`:`Class Details: ${A.nameEn||A.name}`]}),(0,p.jsx)(`button`,{className:`modal-close-btn`,onClick:()=>{pe(!1),j(null)},children:(0,p.jsx)(c,{size:20,strokeWidth:2.5})})]}),(0,p.jsxs)(`div`,{className:`modal-body`,children:[(0,p.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:`1fr 1fr 1fr`,gap:`12px`,marginBottom:`16px`},children:[(0,p.jsxs)(`div`,{style:{padding:`12px`,background:`var(--color-surface)`,border:`1px solid var(--color-border)`,borderRadius:`12px`,textAlign:`center`},children:[(0,p.jsx)(`div`,{style:{fontSize:`18px`,fontWeight:`bold`,color:`var(--color-text-primary)`},children:S.filter(e=>e.grade===A.grade&&e.section===A.section).length}),(0,p.jsx)(`div`,{style:{fontSize:`11px`,color:`var(--color-text-secondary)`},children:a===`ar`?`الطلاب المقيدون`:`Enrolled Students`})]}),(0,p.jsxs)(`div`,{style:{padding:`12px`,background:`var(--color-surface)`,border:`1px solid var(--color-border)`,borderRadius:`12px`,textAlign:`center`},children:[(0,p.jsx)(`div`,{style:{fontSize:`18px`,fontWeight:`bold`,color:`var(--color-text-primary)`},children:A.subjects?A.subjects.length:0}),(0,p.jsx)(`div`,{style:{fontSize:`11px`,color:`var(--color-text-secondary)`},children:a===`ar`?`المواد المقررة`:`Assigned Subjects`})]}),(0,p.jsxs)(`div`,{style:{padding:`12px`,background:`var(--color-surface)`,border:`1px solid var(--color-border)`,borderRadius:`12px`,textAlign:`center`},children:[(0,p.jsx)(`div`,{style:{fontSize:`18px`,fontWeight:`bold`,color:`var(--color-text-primary)`},children:b.filter(e=>e.classes.includes(A.name)).length}),(0,p.jsx)(`div`,{style:{fontSize:`11px`,color:`var(--color-text-secondary)`},children:a===`ar`?`المعلمون الفاعلون`:`Active Teachers`})]})]}),(0,p.jsxs)(`h4`,{style:{fontSize:`14px`,fontWeight:`bold`,marginBottom:`8px`},children:[`👥 `,a===`ar`?`قائمة الطلاب المقيدين بالفصل:`:`Enrolled Students List:`]}),(0,p.jsx)(`div`,{style:{maxHeight:`180px`,overflowY:`auto`,border:`1px solid var(--color-border)`,borderRadius:`12px`,marginBottom:`16px`},children:(0,p.jsxs)(`table`,{className:`students-table`,style:{margin:0,width:`100%`},children:[(0,p.jsx)(`thead`,{children:(0,p.jsxs)(`tr`,{children:[(0,p.jsx)(`th`,{style:{padding:`6px 12px`,fontSize:`12px`},children:`ID`}),(0,p.jsx)(`th`,{style:{padding:`6px 12px`,fontSize:`12px`},children:o.studentName}),(0,p.jsx)(`th`,{style:{padding:`6px 12px`,fontSize:`12px`},children:o.status})]})}),(0,p.jsx)(`tbody`,{children:S.filter(e=>e.grade===A.grade&&e.section===A.section).length>0?S.filter(e=>e.grade===A.grade&&e.section===A.section).map(e=>(0,p.jsxs)(`tr`,{children:[(0,p.jsx)(`td`,{style:{padding:`6px 12px`,fontSize:`12px`,fontFamily:`var(--font-mono)`},children:e.id}),(0,p.jsxs)(`td`,{style:{padding:`6px 12px`,fontSize:`12px`,fontWeight:`600`},children:[m(e.photo,`👨‍🎓`),a===`ar`?e.name:e.nameEn]}),(0,p.jsx)(`td`,{style:{padding:`6px 12px`,fontSize:`12px`},children:(0,p.jsx)(`span`,{className:`badge-status ${e.status===`present`?`checked-in`:`absent`}`,style:{padding:`2px 8px`,fontSize:`10px`},children:e.status===`present`?o.present:o.absent})})]},e.id)):(0,p.jsx)(`tr`,{children:(0,p.jsx)(`td`,{colSpan:`3`,style:{textAlign:`center`,padding:`16px`,color:`var(--color-text-secondary)`,fontSize:`12px`},children:a===`ar`?`لا يوجد طلاب مقيدين في هذا الفصل`:`No students enrolled in this class`})})})]})}),(0,p.jsxs)(`h4`,{style:{fontSize:`14px`,fontWeight:`bold`,marginBottom:`8px`},children:[`👨‍🏫 `,a===`ar`?`المعلمون والمواد المقررة:`:`Teachers & Course Schedule:`]}),(0,p.jsx)(`div`,{style:{maxHeight:`180px`,overflowY:`auto`,border:`1px solid var(--color-border)`,borderRadius:`12px`},children:(0,p.jsxs)(`table`,{className:`students-table`,style:{margin:0,width:`100%`},children:[(0,p.jsx)(`thead`,{children:(0,p.jsxs)(`tr`,{children:[(0,p.jsx)(`th`,{style:{padding:`6px 12px`,fontSize:`12px`},children:o.subject}),(0,p.jsx)(`th`,{style:{padding:`6px 12px`,fontSize:`12px`},children:o.teacherName})]})}),(0,p.jsx)(`tbody`,{children:A.subjects&&A.subjects.length>0?A.subjects.map((e,t)=>{let n=g.find(t=>t.name===e),r=n?n.nameEn:e,i=A.id?parseInt(String(A.id).replace(/\D/g,``),10):null,o=b.find(t=>t.teachingAssignments&&t.teachingAssignments.some(t=>(t.subject===e||n&&t.subjectId===n.id)&&(t.class===A.name||i&&t.classId===i)));return(0,p.jsxs)(`tr`,{children:[(0,p.jsx)(`td`,{style:{padding:`6px 12px`,fontSize:`12px`,fontWeight:`bold`},children:a===`ar`?e:r}),(0,p.jsx)(`td`,{style:{padding:`6px 12px`,fontSize:`12px`,fontWeight:`600`},children:o?(0,p.jsxs)(p.Fragment,{children:[m(o.photo,`👨‍🏫`),a===`ar`?o.name:o.nameEn]}):(0,p.jsx)(`span`,{style:{color:`var(--color-text-secondary)`,fontStyle:`italic`},children:a===`ar`?`غير مسند`:`Not Assigned`})})]},t)}):(0,p.jsx)(`tr`,{children:(0,p.jsx)(`td`,{colSpan:`2`,style:{textAlign:`center`,padding:`16px`,color:`var(--color-text-secondary)`,fontSize:`12px`},children:a===`ar`?`لا توجد مواد مقرر في هذا الفصل`:`No subjects assigned to this class`})})})]})})]}),(0,p.jsx)(`footer`,{className:`modal-footer`,children:(0,p.jsx)(`button`,{className:`btn-filled`,onClick:()=>{pe(!1),j(null)},children:a===`ar`?`إغلاق النافذة`:`Close`})})]})}),ye&&(0,p.jsx)(`div`,{className:`modal-overlay no-print`,children:(0,p.jsxs)(`div`,{className:`modal-container`,style:{maxWidth:`600px`,width:`92%`},children:[(0,p.jsxs)(`header`,{className:`modal-header`,children:[(0,p.jsxs)(`h3`,{className:`modal-title`,style:{display:`flex`,alignItems:`center`,gap:`8px`},children:[(0,p.jsx)(u,{size:20,color:`#d97706`}),(0,p.jsx)(`span`,{children:a===`ar`?`طباعة كشوفات الفصول الدراسية الجاهزة`:`Print Classes Rosters`})]}),(0,p.jsx)(`button`,{className:`modal-close-btn`,onClick:()=>U(!1),children:(0,p.jsx)(c,{size:20,strokeWidth:2.5})})]}),(0,p.jsxs)(`div`,{className:`modal-body`,style:{display:`flex`,flexDirection:`column`,gap:`16px`},children:[(0,p.jsxs)(`div`,{className:`form-group`,style:{marginBottom:0},children:[(0,p.jsx)(`label`,{className:`form-label`,style:{fontWeight:`700`,marginBottom:`10px`,display:`block`},children:a===`ar`?`اختر نوع الكشف المطلوب للطباعة:`:`Select Roster Template:`}),(0,p.jsx)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`10px`},children:[{id:`classes_students_count`,title:`1. كشف بالصفوف والشعب وعدد الطلاب في كل شعبة`,desc:`يحتوي على: الرقم التسلسلي (م)، الصف، الشعبة، وعدد الطلاب في كل شعبة مع الإجمالي العام`},{id:`classes_subjects_teachers`,title:`2. كشف بالصفوف والشعب وعدد الطلاب في كل شعبة ويوضح المواد لكل شعبة وأسماء المعلمين أمام كل مادة مع عمود الملاحظات`,desc:`يحتوي على: الرقم التسلسلي (م)، الصف، الشعبة، عدد الطلاب، المادة الدراسية، اسم المعلم أمام كل مادة، وعمود الملاحظات`}].map(e=>{let t=W===e.id;return(0,p.jsxs)(`label`,{style:{display:`flex`,alignItems:`flex-start`,gap:`12px`,padding:`12px 14px`,borderRadius:`10px`,border:t?`2px solid #d97706`:`1px solid var(--color-border, #cbd5e1)`,backgroundColor:t?`#fffbeb`:`var(--color-bg-secondary, #f8fafc)`,cursor:`pointer`,transition:`all 0.15s ease`},children:[(0,p.jsx)(`input`,{type:`radio`,name:`class_print_roster_type`,value:e.id,checked:t,onChange:e=>be(e.target.value),style:{marginTop:`4px`,accentColor:`#d97706`,width:`16px`,height:`16px`}}),(0,p.jsxs)(`div`,{style:{flex:1},children:[(0,p.jsx)(`div`,{style:{fontWeight:`700`,fontSize:`13.5px`,color:t?`#92400e`:`var(--color-text-primary, #0f172a)`},children:e.title}),(0,p.jsx)(`div`,{style:{fontSize:`12px`,color:`var(--color-text-secondary, #64748b)`,marginTop:`4px`},children:e.desc})]})]},e.id)})})]}),(0,p.jsxs)(`div`,{className:`form-group`,style:{marginBottom:0,padding:`12px 14px`,backgroundColor:`#f8fafc`,borderRadius:`10px`,border:`1px solid #cbd5e1`},children:[(0,p.jsx)(`label`,{className:`form-label`,style:{fontWeight:`700`,marginBottom:`6px`,display:`block`},children:a===`ar`?`تحديد الصف والشعبة (اختياري):`:`Filter by Class & Section (Optional):`}),(0,p.jsxs)(`select`,{className:`select-field`,value:G,onChange:e=>xe(e.target.value),style:{width:`100%`},children:[(0,p.jsx)(`option`,{value:`all`,children:a===`ar`?`-- جميع الصفوف والشعب --`:`-- All Classes & Sections --`}),_.map(e=>{let t=typeof e.id==`string`&&e.id.startsWith(`cls-`)?e.id.replace(`cls-`,``):e.numericId||e.id;return(0,p.jsx)(`option`,{value:String(t),children:a===`ar`?e.name:e.nameEn||e.name},e.id)})]})]})]}),(0,p.jsxs)(`footer`,{className:`modal-footer`,style:{display:`flex`,justifyContent:`flex-start`,gap:`8px`},children:[(0,p.jsxs)(`button`,{type:`button`,className:`btn-filled`,onClick:ze,disabled:K,style:{display:`flex`,alignItems:`center`,gap:`6px`,backgroundColor:`#d97706`,borderColor:`#d97706`,color:`#fff`,padding:`8px 20px`},children:[(0,p.jsx)(u,{size:16}),(0,p.jsx)(`span`,{children:K?a===`ar`?`جاري تجهيز الكشف...`:`Preparing...`:a===`ar`?`طباعة`:`Print`})]}),(0,p.jsx)(`button`,{type:`button`,className:`btn-elevated`,onClick:()=>U(!1),disabled:K,children:o.cancel})]})]})}),Ce&&(0,p.jsx)(`div`,{className:`modal-overlay no-print`,children:(0,p.jsxs)(`div`,{className:`modal-container`,style:{maxWidth:`580px`,width:`90%`},children:[(0,p.jsxs)(`header`,{className:`modal-header`,style:{borderBottom:`1px solid var(--color-border)`},children:[(0,p.jsxs)(`h3`,{className:`modal-title`,style:{display:`flex`,alignItems:`center`,gap:`8px`,color:`#31859C`},children:[(0,p.jsx)(n,{size:22}),a===`ar`?`الاستيراد والتصدير الذكي (Excel)`:`Smart Import & Export (Excel)`]}),(0,p.jsx)(`button`,{className:`modal-close-btn`,onClick:()=>q(!1),"aria-label":`Close Modal`,children:(0,p.jsx)(c,{size:20,strokeWidth:2.5})})]}),(0,p.jsxs)(`div`,{style:{display:`flex`,borderBottom:`1px solid var(--color-border)`,backgroundColor:`rgba(0,0,0,0.02)`},children:[(0,p.jsx)(`button`,{type:`button`,onClick:()=>we(`import`),style:{flex:1,padding:`14px`,fontWeight:`600`,fontSize:`14px`,cursor:`pointer`,border:`none`,backgroundColor:`transparent`,borderBottom:J===`import`?`3px solid #31859C`:`3px solid transparent`,color:J===`import`?`#31859C`:`var(--color-text-secondary)`,transition:`all 0.2s ease`},children:a===`ar`?`📥 استيراد الفصول الدراسية`:`📥 Import Classes`}),(0,p.jsx)(`button`,{type:`button`,onClick:()=>we(`export`),style:{flex:1,padding:`14px`,fontWeight:`600`,fontSize:`14px`,cursor:`pointer`,border:`none`,backgroundColor:`transparent`,borderBottom:J===`export`?`3px solid #31859C`:`3px solid transparent`,color:J===`export`?`#31859C`:`var(--color-text-secondary)`,transition:`all 0.2s ease`},children:a===`ar`?`📤 التصدير والنموذج`:`📤 Export & Template`})]}),(0,p.jsx)(`div`,{className:`modal-body`,style:{padding:`24px`},children:J===`import`?(0,p.jsxs)(`form`,{onSubmit:Re,style:{display:`flex`,flexDirection:`column`,gap:`20px`},children:[(0,p.jsxs)(`div`,{className:`form-group`,children:[(0,p.jsx)(`label`,{className:`form-label`,style:{fontWeight:`600`},children:a===`ar`?`ملف Excel أو CSV المراد استيراده (.xlsx, .csv)`:`Excel or CSV File to Import (.xlsx, .csv)`}),(0,p.jsxs)(`div`,{style:{border:`2px dashed rgba(49, 133, 156, 0.3)`,borderRadius:`16px`,padding:`30px 20px`,textAlign:`center`,backgroundColor:Y?`rgba(49, 133, 156, 0.02)`:`rgba(0,0,0,0.01)`,cursor:`pointer`,transition:`all 0.2s ease`,position:`relative`},onClick:()=>document.getElementById(`classes-excel-file-uploader`).click(),onDragOver:e=>{e.preventDefault()},onDrop:e=>{e.preventDefault();let t=e.dataTransfer.files[0];t&&(t.name.endsWith(`.xlsx`)||t.name.endsWith(`.xls`)||t.name.endsWith(`.csv`))?Te(t):alert(a===`ar`?`يرجى اختيار ملف Excel أو CSV صالح.`:`Please choose a valid Excel or CSV file.`)},children:[(0,p.jsx)(`input`,{type:`file`,id:`classes-excel-file-uploader`,accept:`.xlsx, .xls, .csv`,style:{display:`none`},onChange:e=>{let t=e.target.files[0];t&&Te(t)}}),(0,p.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,alignItems:`center`,gap:`8px`},children:[(0,p.jsx)(n,{size:32,style:{color:`#31859C`,opacity:.8}}),Y?(0,p.jsxs)(`div`,{children:[(0,p.jsx)(`div`,{style:{fontWeight:`bold`,color:`var(--color-text)`,fontSize:`14px`},children:Y.name}),(0,p.jsxs)(`div`,{style:{fontSize:`12px`,color:`var(--color-text-secondary)`},children:[(Y.size/1024).toFixed(1),` KB`]})]}):(0,p.jsxs)(`div`,{children:[(0,p.jsx)(`div`,{style:{fontWeight:`600`,fontSize:`14px`},children:a===`ar`?`اسحب وأفلت الملف هنا أو انقر للتصفح`:`Drag & drop file here or click to browse`}),(0,p.jsx)(`div`,{style:{fontSize:`11px`,color:`var(--color-text-secondary)`,marginTop:`4px`},children:a===`ar`?`صيغة الملف المدعومة: Excel (.xlsx) أو CSV`:`Supported extension: Excel (.xlsx) or CSV`})]})]})]})]}),(X||De>0)&&(0,p.jsxs)(`div`,{style:{padding:`16px`,background:`rgba(0,0,0,0.02)`,borderRadius:`16px`,border:`1px solid var(--color-border)`},children:[(0,p.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,alignItems:`center`,marginBottom:`8px`},children:[(0,p.jsx)(`span`,{style:{fontSize:`13px`,fontWeight:`600`,color:`#31859C`},children:Oe}),(0,p.jsxs)(`span`,{style:{fontSize:`13px`,fontWeight:`bold`,fontFamily:`var(--font-mono)`},children:[De,`%`]})]}),(0,p.jsx)(`div`,{style:{width:`100%`,height:`8px`,backgroundColor:`rgba(0,0,0,0.06)`,borderRadius:`999px`,overflow:`hidden`},children:(0,p.jsx)(`div`,{style:{width:`${De}%`,height:`100%`,backgroundColor:Ae?`#10b981`:`#31859C`,borderRadius:`999px`,transition:`width 0.2s ease-out`}})}),ke.length>0&&(0,p.jsxs)(`div`,{style:{marginTop:`14px`,borderTop:`1px dashed var(--color-border)`,paddingTop:`12px`},children:[(0,p.jsx)(`div`,{style:{fontSize:`12px`,fontWeight:`bold`,color:`var(--color-error)`,display:`flex`,alignItems:`center`,gap:`4px`,marginBottom:`8px`},children:(0,p.jsxs)(`span`,{children:[`⚠️ `,a===`ar`?`تنبيهات وتفاصيل الأخطاء:`:`Warnings & Error Details:`]})}),(0,p.jsx)(`ul`,{style:{maxHeight:`120px`,overflowY:`auto`,paddingInlineStart:`16px`,margin:0,fontSize:`12px`,color:`var(--color-text-secondary)`,display:`flex`,flexDirection:`column`,gap:`4px`},children:ke.map((e,t)=>(0,p.jsx)(`li`,{style:{direction:`rtl`,textAlign:`right`},children:e},t))})]})]}),(0,p.jsxs)(`div`,{style:{display:`flex`,gap:`8px`,justifyContent:`flex-end`,marginTop:`10px`},children:[(0,p.jsx)(`button`,{type:`button`,className:`btn-elevated`,onClick:()=>q(!1),disabled:X,style:{height:`44px`,padding:`0 18px`},children:a===`ar`?`إلغاء`:`Cancel`}),(0,p.jsx)(`button`,{type:`submit`,className:`btn-filled`,disabled:X||!Y,style:{height:`44px`,padding:`0 24px`,backgroundColor:`#31859C`,borderColor:`#31859C`,display:`flex`,alignItems:`center`,gap:`6px`},children:X?a===`ar`?`جاري الاستيراد...`:`Importing...`:a===`ar`?`بدء الاستيراد`:`Start Import`})]})]}):(0,p.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`24px`},children:[(0,p.jsxs)(`div`,{style:{padding:`20px`,border:`1px solid var(--color-border)`,borderRadius:`16px`,backgroundColor:`rgba(0,0,0,0.01)`},children:[(0,p.jsx)(`h4`,{style:{margin:`0 0 4px 0`,fontSize:`15px`,color:`var(--color-text)`},children:a===`ar`?`1. تحميل نموذج Excel فارغ`:`1. Download Empty Excel Template`}),(0,p.jsx)(`p`,{style:{fontSize:`12px`,color:`var(--color-text-secondary)`,margin:`0 0 16px 0`},children:a===`ar`?`قم بتحميل القالب لتعبئة بيانات الفصول الدراسية والشعب.`:`Download template to fill in classes and sections data.`}),(0,p.jsx)(`button`,{type:`button`,className:`btn-accent`,onClick:Le,disabled:Pe,style:{height:`42px`,padding:`0 20px`,backgroundColor:`#31859C`,borderColor:`#31859C`},children:Pe?a===`ar`?`جاري التحميل...`:`Downloading...`:a===`ar`?`تحميل القالب (.xlsx)`:`Download Template (.xlsx)`})]}),(0,p.jsxs)(`div`,{style:{padding:`20px`,border:`1px solid var(--color-border)`,borderRadius:`16px`,backgroundColor:`rgba(0,0,0,0.01)`},children:[(0,p.jsx)(`h4`,{style:{margin:`0 0 4px 0`,fontSize:`15px`,color:`var(--color-text)`},children:a===`ar`?`2. تصدير بيانات الفصول الدراسية الحالية`:`2. Export Current Classes Data`}),(0,p.jsx)(`p`,{style:{fontSize:`12px`,color:`var(--color-text-secondary)`,margin:`0 0 16px 0`},children:a===`ar`?`تصدير كافة الفصول والشعب مع عدد الطلاب والمواد المقررة بصيغة CSV تدعم اللغة العربية.`:`Export all registered classes into an Arabic-friendly CSV file.`}),(0,p.jsx)(`button`,{type:`button`,className:`btn-filled`,onClick:Ie,disabled:Me,style:{height:`42px`,padding:`0 20px`,backgroundColor:`#31859C`,borderColor:`#31859C`},children:Me?a===`ar`?`جاري التصدير...`:`Exporting...`:a===`ar`?`تصدير البيانات`:`Export Data`})]}),(0,p.jsx)(`div`,{style:{display:`flex`,justifyContent:`flex-end`,marginTop:`10px`},children:(0,p.jsx)(`button`,{type:`button`,className:`btn-elevated`,onClick:()=>q(!1),style:{height:`44px`,padding:`0 18px`},children:a===`ar`?`إغلاق`:`Close`})})]})})]})})]})}function m(){return(0,p.jsx)(ie,{})}export{m as default};