import{n as e,t}from"./PaginationBar-5aeIlAN4.js";import{n,t as r}from"./file-spreadsheet-DBE5Q3cN.js";import{t as i}from"./pen-line-CbXosuab.js";import{t as a}from"./search-DhFeX4vl.js";import{t as o}from"./trash-2-Bt959aHj.js";import{t as ee}from"./upload-DGX5i7En.js";import{B as s,J as c,K as l,L as u,M as te,V as d,j as f,r as p,t as ne,u as m,w as h,z as re}from"./index-c1DpRb1_.js";import{t as ie}from"./useAllowedClasses-n61QO4Fd.js";import{t as ae}from"./sloganBase64-BF9PhYUx.js";var oe=h(`key-round`,[[`path`,{d:`M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z`,key:`1s6t7t`}],[`circle`,{cx:`16.5`,cy:`7.5`,r:`.5`,fill:`currentColor`,key:`w0ekpg`}]]),g=c(l(),1),_=d();function v(){let{lang:c,t:l,renderAvatar:d,canAction:h,setToastMessage:v,triggerConfirm:y}=re(),{parentUsers:b,loading:se,parentsPagination:x,fetchParents:S,handleAddParent:ce,handleEditParent:le,handleDeleteParent:ue}=f(),{page:de,perPage:fe,search:pe,setPage:me,setPerPage:he,setSearch:ge,buildQueryString:_e}=e({moduleKey:`parents`}),{students:C,fetchStudents:ve}=ne(),{currentUser:ye}=s(),{classes:be,fetchClasses:xe}=te(),{allowedClasses:w}=ie(`parents`),T=w&&w.length>0?w:be||[],[Se,E]=(0,g.useState)(!1),[D,O]=(0,g.useState)(``),[k,A]=(0,g.useState)(`class_no_id`),[j,M]=(0,g.useState)(!1),N=_e();(0,g.useEffect)(()=>{S(N)},[S,N]),(0,g.useEffect)(()=>{xe&&xe()},[]),(0,g.useEffect)(()=>{if(T&&T.length>0&&!D){let e=typeof T[0].id==`string`&&T[0].id.startsWith(`cls-`)?T[0].id.replace(`cls-`,``):T[0].numericId||T[0].id;O(String(e))}},[T,D]);let[P,F]=(0,g.useState)(!1),[I,Ce]=(0,g.useState)(``),[we,L]=(0,g.useState)(!1),[Te,R]=(0,g.useState)(!1),[Ee,De]=(0,g.useState)(``),[z,B]=(0,g.useState)(``),[V,H]=(0,g.useState)(``),[U,W]=(0,g.useState)(``),[G,K]=(0,g.useState)(``),[q,J]=(0,g.useState)(``),[Y,X]=(0,g.useState)(null),[Z,Oe]=(0,g.useState)(!1),Q=async e=>{if(Y){Oe(!0);try{let t=await u.resetPassword(Y.id,e);t.data?.success?(v(t.data.message||(c===`ar`?`تم تصفير كلمة المرور بنجاح`:`Password reset successfully`)),X(null)):v(t.data?.message||(c===`ar`?`فشل تصفير كلمة المرور`:`Failed to reset password`))}catch(e){v(e.response?.data?.message||e.message||(c===`ar`?`حدث خطأ أثناء تصفير كلمة المرور`:`Error resetting password`))}finally{Oe(!1)}}},ke=e=>{if(e.preventDefault(),J(``),!z.trim()||!U.trim()||!G.trim()){J(l.emptyError);return}let t=G.trim(),n=U.replace(/\D/g,``);if(n.length!==9||!n.startsWith(`7`)){J(l.phoneError);return}if(b.some(e=>e.nationalId===t)){J(c===`ar`?`الرقم الوطني مسجل مسبقاً لولي أمر آخر!`:`National ID already registered!`);return}let r={nationalId:t,name:z,nameEn:V.trim()||z.split(` `).map(e=>e.charAt(0).toUpperCase()+e.slice(1)).join(` `),phone:n,username:t,password:n,photo:`🧔`};F(!0),ce(r).then(e=>{e&&e.success?(L(!1),B(``),H(``),W(``),K(``)):J(e?.message||(c===`ar`?`فشلت العملية`:`Operation failed`))}).catch(e=>{J(e.message||`Error occurred`)}).finally(()=>{F(!1)})},Ae=e=>{if(e.preventDefault(),J(``),!z.trim()||!U.trim()||!G.trim()){J(l.emptyError);return}let t=U.replace(/\D/g,``);if(t.length!==9||!t.startsWith(`7`)){J(l.phoneError);return}let n={nationalId:G,name:z,nameEn:V.trim()||z.split(` `).map(e=>e.charAt(0).toUpperCase()+e.slice(1)).join(` `),phone:t,username:G,password:t,photo:`🧔`};F(!0),le(n,null,Ee).then(e=>{e&&e.success?(R(!1),B(``),H(``),W(``),K(``),De(``)):J(e?.message||(c===`ar`?`فشلت العملية`:`Operation failed`))}).catch(e=>{J(e.message||`Error occurred`)}).finally(()=>{F(!1)})},je=async()=>{try{let e=await u.exportParents();if(!e.ok){alert(c===`ar`?`فشل تصدير البيانات`:`Failed to export data`);return}let t=await e.blob(),n=window.URL.createObjectURL(t),r=document.createElement(`a`);r.href=n,r.download=`parents_export.csv`,document.body.appendChild(r),r.click(),r.remove()}catch(e){console.error(e)}},Me=async e=>{let t=e.target.files[0];if(!t)return;let n=new FormData;n.append(`file`,t);try{let e=await u.importParents(n);if(e.success){v(e.message);let t=localStorage.getItem(`auth_token`);S(t),ve(t)}else alert(e.message||(c===`ar`?`حدث خطأ أثناء الاستيراد`:`Error importing`))}catch(e){console.error(e)}},Ne=async()=>{M(!0);try{let e=[],t=k===`class_no_id`||k===`class_with_id`,n=D;if(t&&(!n||n===`all`)){let e=T[0];n=e?e.numericId||String(e.id).replace(/\D/g,``):``}let r=n&&n!==`all`?String(n).replace(/\D/g,``):``;if(r)try{let t=await u.getParents(`?class_id=${r}&per_page=1000`);Array.isArray(t?.parents)?e=t.parents:Array.isArray(t?.data?.parents)?e=t.data.parents:Array.isArray(t?.data)?e=t.data:Array.isArray(t)&&(e=t)}catch(e){console.warn(`API class fetch failed, falling back to local state:`,e)}else try{let t=await u.getParents(`?per_page=1000`);Array.isArray(t?.parents)?e=t.parents:Array.isArray(t?.data?.parents)?e=t.data.parents:Array.isArray(t?.data)?e=t.data:Array.isArray(t)&&(e=t)}catch(e){console.warn(`API all fetch failed, falling back to local state:`,e)}if(e.length===0)if(r){let t=C.filter(e=>String(e.class_id||e.classId||``).replace(/\D/g,``)===String(r)),n=new Set(t.map(e=>Number(e.parentId||e.parent_id)).filter(Boolean)),i=new Set(t.map(e=>String(e.parentNationalId||``)).filter(Boolean));if(e=b.filter(e=>n.has(Number(e.id))||e.nationalId&&i.has(String(e.nationalId))),e.length===0&&t.length>0){let n=new Map;t.forEach(e=>{let t=e.parentId||e.parentNationalId||e.parentName;t&&(n.has(t)||n.set(t,{id:e.parentId,nationalId:e.parentNationalId||``,name:e.parentName||``,phone:e.phone||``,children:[]}),n.get(t).children.push({id:e.id,name:e.name,grade:e.grade,section:e.section}))}),e=Array.from(n.values())}}else e=[...b];e=e.map(e=>{let t=e.national_id||e.nationalId||``,n=e.name_ar||e.name||``,r=e.children||[];return(!r||r.length===0)&&(r=C.filter(n=>n.parentId&&e.id&&Number(n.parentId)===Number(e.id)||t&&n.parentNationalId===t)),{id:e.id,nationalId:t,name:n,phone:e.phone||``,children:r.map(e=>({id:e.id,name:e.name_ar||e.name||``,grade:e.grade||(e.schoolClass?e.schoolClass.grade_ar:``)||``,section:e.section||(e.schoolClass?e.schoolClass.section_ar:``)||``}))}});let i=e=>e?e.replace(/[\u064B-\u065F\u0670]/g,``).replace(/[إأآٱ]/g,`ا`).replace(/ة/g,`ه`).replace(/ى/g,`ي`).trim():``;e.sort((e,t)=>{let n=i(e.name||``),r=i(t.name||``),a=n.localeCompare(r,`ar`);return a===0?(e.name||``).localeCompare(t.name||``,`ar`):a});let a=T.find(e=>{let t=typeof e.id==`string`&&e.id.startsWith(`cls-`)?e.id.replace(`cls-`,``):e.numericId||e.id;return String(t)===String(r)||String(e.id)===String(n)}),o=a?`${a.grade||a.name||``} - ${a.section||``}`:r?`الصف ${r}`:`جميع الفصول الدراسية`,ee=new Date().toLocaleDateString(`ar-SA`,{year:`numeric`,month:`long`,day:`numeric`,weekday:`long`}),s=``;s=e.length===0?`
          <tr>
            <td colspan="${{class_no_id:3,class_with_id:4,all_with_id_count:5,all_with_id_children_details:6}[k]||4}" style="text-align:center;padding:24px;color:#64748b;font-weight:700;">
              لا توجد بيانات أولياء أمور مسجلة لهذا النطاق
            </td>
          </tr>
        `:e.map((e,t)=>{if(k===`class_no_id`)return`
              <tr>
                <td class="col-num">${t+1}</td>
                <td class="col-name">${e.name}</td>
                <td class="col-notes">&nbsp;</td>
              </tr>
            `;if(k===`class_with_id`)return`
              <tr>
                <td class="col-num">${t+1}</td>
                <td class="col-code">${e.nationalId}</td>
                <td class="col-name">${e.name}</td>
                <td class="col-notes">&nbsp;</td>
              </tr>
            `;if(k===`all_with_id_count`)return`
              <tr>
                <td class="col-num">${t+1}</td>
                <td class="col-code">${e.nationalId}</td>
                <td class="col-name">${e.name}</td>
                <td style="text-align:center;font-weight:800;font-size:12px;">${e.children.length}</td>
                <td class="col-notes">&nbsp;</td>
              </tr>
            `;{let n=e.children.length>0?e.children.map(e=>`
              <div style="margin-bottom: 3px; font-size: 10.5px; line-height: 1.35;">
                <span style="font-weight: 700;">• ${e.name}</span>
                ${e.grade||e.section?`<span style="color:#475569; font-size: 10px;"> (${e.grade}${e.section?` - `+e.section:``})</span>`:``}
              </div>
            `).join(``):`<span style="color:#94a3b8; font-size: 10.5px; font-style: italic;">لا يوجد أبناء مسجلين</span>`;return`
              <tr>
                <td class="col-num">${t+1}</td>
                <td class="col-code">${e.nationalId}</td>
                <td class="col-name" style="width: 170px;">${e.name}</td>
                <td style="text-align:center;font-weight:800;font-size:12px;width: 60px;">${e.children.length}</td>
                <td style="text-align:right;vertical-align:top;padding:6px 10px;">${n}</td>
                <td class="col-notes" style="width: 140px;">&nbsp;</td>
              </tr>
            `}}).join(``);let c=``;c=k===`class_no_id`?`
          <tr>
            <th style="width: 38px;">م</th>
            <th style="text-align: right;">اسم ولي الأمر</th>
            <th style="width: 240px; text-align: right;">الملاحظات</th>
          </tr>
        `:k===`class_with_id`?`
          <tr>
            <th style="width: 38px;">م</th>
            <th style="width: 130px; text-align: center;">الرقم الوطني</th>
            <th style="text-align: right;">اسم ولي الأمر</th>
            <th style="width: 220px; text-align: right;">الملاحظات</th>
          </tr>
        `:k===`all_with_id_count`?`
          <tr>
            <th style="width: 38px;">م</th>
            <th style="width: 130px; text-align: center;">الرقم الوطني</th>
            <th style="text-align: right;">اسم ولي الأمر</th>
            <th style="width: 90px; text-align: center;">عدد الأبناء</th>
            <th style="width: 200px; text-align: right;">الملاحظات</th>
          </tr>
        `:`
          <tr>
            <th style="width: 36px;">م</th>
            <th style="width: 120px; text-align: center;">الرقم الوطني</th>
            <th style="width: 170px; text-align: right;">اسم ولي الأمر</th>
            <th style="width: 65px; text-align: center;">عدد الأبناء</th>
            <th style="text-align: right;">بيانات الأبناء (الاسم - الصف والشعبة)</th>
            <th style="width: 150px; text-align: right;">الملاحظات</th>
          </tr>
        `;let l=k===`class_no_id`||k===`class_with_id`||n&&n!==`all`,te=`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8">
<title>كشف أولياء الأمور - ${l?o:`المدرسة`}</title>
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
    line-height: 1.5;
    font-weight: 700;
    color: #0f172a;
  }
  .sr-header-school-ar {
    font-weight: 800;
    font-size: 12.5px;
    color: #1e3a8a;
    margin-top: 2px;
  }
  .sr-header-logo {
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .sr-header-logo img {
    width: 60px;
    height: 60px;
    object-fit: contain;
    border-radius: 50%;
    border: 2px solid #1e3a8a;
    padding: 2px;
    background: #fff;
    box-shadow: 0 2px 4px rgba(0,0,0,0.08);
  }
  .sr-header-en {
    text-align: left;
    font-size: 10px;
    line-height: 1.5;
    font-weight: 700;
    color: #0f172a;
    direction: ltr;
  }
  .sr-header-school-en {
    font-weight: 800;
    font-size: 11px;
    color: #1e3a8a;
    margin-top: 2px;
  }
  .sr-title-bar {
    text-align: center;
    margin-bottom: 8px;
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
    width: 38px;
    text-align: center;
    font-weight: 700;
    background-color: #f1f5f9;
  }
  .col-code {
    width: 120px;
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
        ${l?`<div class="sr-meta-item">الصف والشعبة: <strong>${o}</strong></div>`:`<div class="sr-meta-item">النطاق: <strong>جميع الصفوف الدراسية</strong></div>`}
        <div class="sr-meta-item">العام الدراسي: <strong>1447-1448هـ (2025-2026م)</strong></div>
        <div class="sr-meta-item">إجمالي أولياء الأمور: <strong>${e.length} ولي أمر</strong></div>
        <div class="sr-meta-item">التاريخ: <strong>${ee}</strong></div>
      </div>
    </div>

    <table class="roster-table">
      <thead>
        ${c}
      </thead>
      <tbody>
        ${s}
      </tbody>
    </table>

    <div class="sr-footer">
      <span>تم إصدار الكشف آلياً عبر نظام إدارة رياض ومدارس أنوار العلى الدولية النموذجية</span>
      <span>صفحة 1 من 1</span>
    </div>
  </div>
</body>
</html>`,d=document.getElementById(`parents-print-frame`);d&&d.remove(),d=document.createElement(`iframe`),d.id=`parents-print-frame`,d.style.position=`fixed`,d.style.right=`0`,d.style.bottom=`0`,d.style.width=`0`,d.style.height=`0`,d.style.border=`0`,document.body.appendChild(d);let f=d.contentWindow||d.contentDocument,p=f.document||f;p.open(),p.write(te),p.close(),setTimeout(()=>{try{d.contentWindow.focus(),d.contentWindow.print()}catch(e){console.error(`Print trigger error:`,e)}},350),E(!1)}catch(e){console.error(`Roster generation failed:`,e),alert(`حدث خطأ أثناء إعداد كشف الطباعة`)}finally{M(!1)}},Pe=async()=>{try{let e=await(await u.downloadTemplate()).blob(),t=window.URL.createObjectURL(e),n=document.createElement(`a`);n.href=t,n.download=`parents_template.xlsx`,document.body.appendChild(n),n.click(),n.remove()}catch(e){console.error(e)}},$=b.filter(e=>e.name.toLowerCase().includes(I.toLowerCase())||e.nameEn&&e.nameEn.toLowerCase().includes(I.toLowerCase())||e.nationalId.includes(I));return(0,_.jsxs)(`div`,{className:`section-card`,children:[(0,_.jsxs)(`div`,{className:`section-card-header no-print`,style:{display:`flex`,justifyContent:`space-between`,alignItems:`center`,gap:`var(--space-md)`},children:[(0,_.jsx)(`h3`,{className:`section-card-title headline-small`,style:{fontSize:`18px`,margin:0},children:l.parentsTitle}),(0,_.jsxs)(`div`,{style:{display:`flex`,gap:`8px`,alignItems:`center`,flexWrap:`wrap`},children:[(0,_.jsxs)(`button`,{className:`btn-secondary`,onClick:()=>E(!0),style:{display:`flex`,alignItems:`center`,gap:`6px`,padding:`8px 16px`,fontSize:`13px`,fontWeight:`700`,color:`#d97706`,borderColor:`#fcd34d`,backgroundColor:`#fffbeb`},children:[(0,_.jsx)(m,{size:16}),c===`ar`?`طباعة كشف`:`Print Roster`]}),h(`parents`,`export`)&&(0,_.jsxs)(`button`,{className:`btn-secondary`,onClick:je,style:{display:`flex`,alignItems:`center`,gap:`4px`,padding:`8px 16px`,fontSize:`13px`},children:[(0,_.jsx)(n,{size:16}),c===`ar`?`تصدير`:`Export`]}),h(`parents`,`import`)&&(0,_.jsxs)(_.Fragment,{children:[(0,_.jsxs)(`button`,{className:`btn-secondary`,onClick:Pe,style:{display:`flex`,alignItems:`center`,gap:`4px`,padding:`8px 16px`,fontSize:`13px`},title:c===`ar`?`تحميل النموذج الفارغ`:`Download Template`,children:[(0,_.jsx)(r,{size:16}),c===`ar`?`النموذج`:`Template`]}),(0,_.jsxs)(`label`,{className:`btn-secondary`,style:{display:`flex`,alignItems:`center`,gap:`4px`,cursor:`pointer`,margin:0,padding:`8px 16px`,fontSize:`13px`},children:[(0,_.jsx)(ee,{size:16}),c===`ar`?`استيراد`:`Import`,(0,_.jsx)(`input`,{type:`file`,accept:`.csv,.xlsx`,onChange:Me,style:{display:`none`}})]})]}),h(`parents`,`create`)&&(0,_.jsxs)(`button`,{className:`btn-filled`,onClick:()=>{J(``),B(``),H(``),W(``),K(``),L(!0)},style:{padding:`8px 16px`,fontSize:`13px`},children:[`👨🏼‍💼 `,c===`ar`?`تسجيل حساب ولي أمر جديد`:`Register New Parent`]})]})]}),(0,_.jsx)(`div`,{className:`students-controls no-print`,style:{marginBottom:`var(--space-md)`},children:(0,_.jsxs)(`div`,{className:`search-box`,children:[(0,_.jsx)(a,{size:18}),(0,_.jsx)(`input`,{id:`search-parents`,name:`search`,type:`text`,className:`text-field`,placeholder:l.searchParentPlaceholder,value:I,onChange:e=>{Ce(e.target.value),ge(e.target.value)}})]})}),(0,_.jsx)(`div`,{className:`students-table-container`,children:(0,_.jsxs)(`table`,{className:`students-table`,children:[(0,_.jsx)(`thead`,{children:(0,_.jsxs)(`tr`,{children:[(0,_.jsx)(`th`,{className:`sticky-col-1`,children:l.parentNationalIdShort}),(0,_.jsx)(`th`,{className:`sticky-col-2`,children:l.parentName}),(0,_.jsx)(`th`,{children:l.parentPhone}),(0,_.jsx)(`th`,{children:l.parentSonsCount}),(0,_.jsx)(`th`,{children:l.parentSonsList}),(ye?.role===`admin`||h(`parents`,`update`)||h(`parents`,`delete`))&&(0,_.jsx)(`th`,{className:`no-print`,children:l.action})]})}),(0,_.jsx)(`tbody`,{children:$.length>0?$.map(e=>{let t=e.children&&e.children.length>0?e.children:C.filter(t=>t.parentNationalId===e.nationalId);return(0,_.jsxs)(`tr`,{children:[(0,_.jsx)(`td`,{className:`sticky-col-1`,style:{fontFamily:`var(--font-mono)`,fontWeight:`bold`},children:e.nationalId}),(0,_.jsxs)(`td`,{className:`sticky-col-2`,style:{fontWeight:`600`},children:[d(e.photo,`🧔`),c===`ar`?e.name:e.nameEn||e.name]}),(0,_.jsx)(`td`,{style:{fontFamily:`var(--font-mono)`},children:e.phone}),(0,_.jsx)(`td`,{style:{fontWeight:`bold`,textAlign:`center`},children:t.length}),(0,_.jsx)(`td`,{children:(0,_.jsxs)(`div`,{style:{display:`flex`,gap:`6px`,flexWrap:`wrap`},children:[t.map(e=>(0,_.jsxs)(`span`,{className:`chip`,style:{cursor:`default`,padding:`4px 10px`,fontSize:`11px`,display:`inline-flex`,alignItems:`center`,gap:`4px`},children:[d(e.photo,`👨‍🎓`),(0,_.jsxs)(`span`,{children:[c===`ar`?e.name:e.nameEn||e.name,` (`,c===`ar`?e.grade||``:e.gradeEn||e.grade||``,`)`]}),(0,_.jsx)(`span`,{style:{marginInlineStart:`6px`,fontSize:`9px`,opacity:.8},children:e.status===`present`||e.status===`late`?`🟢`:`🔴`})]},e.id)),t.length===0&&(0,_.jsx)(`span`,{style:{fontStyle:`italic`,opacity:.5,fontSize:`11px`},children:c===`ar`?`لا يوجد أبناء مرتبطين`:`No linked children`})]})}),(ye?.role===`admin`||h(`parents`,`update`)||h(`parents`,`delete`))&&(0,_.jsx)(`td`,{className:`no-print`,children:(0,_.jsxs)(`div`,{style:{display:`flex`,gap:`6px`},children:[h(`parents`,`update`)&&(0,_.jsx)(`button`,{className:`btn-elevated`,style:{padding:`6px`,borderRadius:`8px`,display:`flex`,alignItems:`center`,justifyContent:`center`,cursor:`pointer`,border:`1px solid rgba(37, 99, 235, 0.15)`,background:`rgba(37, 99, 235, 0.06)`,color:`#2563eb`,width:`32px`,height:`32px`,transition:`all 0.15s ease`},onMouseOver:e=>{e.currentTarget.style.background=`rgba(37, 99, 235, 0.12)`,e.currentTarget.style.borderColor=`#2563eb`},onMouseOut:e=>{e.currentTarget.style.background=`rgba(37, 99, 235, 0.06)`,e.currentTarget.style.borderColor=`rgba(37, 99, 235, 0.15)`},onClick:()=>{J(``),De(e.nationalId),B(e.name),H(e.nameEn||``),W(e.phone),K(e.nationalId),R(!0)},title:c===`ar`?`تعديل`:`Edit`,children:(0,_.jsx)(i,{size:15})}),h(`parents`,`update`)&&(0,_.jsx)(`button`,{onClick:()=>X(e),title:c===`ar`?`إعادة تعيين كلمة المرور`:`Reset Password`,style:{borderRadius:`8px`,display:`flex`,alignItems:`center`,justifyContent:`center`,cursor:`pointer`,border:`1px solid rgba(245, 158, 11, 0.2)`,background:`rgba(245, 158, 11, 0.08)`,color:`#d97706`,width:`32px`,height:`32px`,transition:`all 0.15s ease`},onMouseOver:e=>{e.currentTarget.style.background=`rgba(245, 158, 11, 0.18)`,e.currentTarget.style.borderColor=`#d97706`},onMouseOut:e=>{e.currentTarget.style.background=`rgba(245, 158, 11, 0.08)`,e.currentTarget.style.borderColor=`rgba(245, 158, 11, 0.2)`},children:(0,_.jsx)(oe,{size:15})}),h(`parents`,`delete`)&&(0,_.jsx)(`button`,{onClick:()=>{y({title:c===`ar`?`حذف حساب ولي الأمر`:`Delete Parent Account`,message:c===`ar`?`هل أنت متأكد من حذف حساب ولي الأمر ${e.name} وحسابه بالكامل؟`:`Are you sure you want to delete parent ${e.name} and their account?`,onConfirm:()=>ue(e.id)})},title:c===`ar`?`حذف`:`Delete`,style:{background:`rgba(220, 38, 38, 0.06)`,border:`1px solid rgba(220, 38, 38, 0.15)`,color:`#dc2626`,borderRadius:`8px`,width:`32px`,height:`32px`,display:`flex`,alignItems:`center`,justifyContent:`center`,cursor:`pointer`,transition:`all 0.15s ease`},onMouseOver:e=>{e.currentTarget.style.background=`rgba(220, 38, 38, 0.12)`,e.currentTarget.style.borderColor=`#dc2626`},onMouseOut:e=>{e.currentTarget.style.background=`rgba(220, 38, 38, 0.06)`,e.currentTarget.style.borderColor=`rgba(220, 38, 38, 0.15)`},children:(0,_.jsx)(o,{size:15})})]})})]},e.nationalId)}):(0,_.jsx)(`tr`,{children:(0,_.jsx)(`td`,{colSpan:`8`,style:{padding:`48px 24px`,textAlign:`center`},children:(0,_.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,alignItems:`center`,justifyContent:`center`,gap:`8px`},children:[(0,_.jsx)(`span`,{style:{fontSize:`32px`},children:I?`🔍`:`📂`}),(0,_.jsx)(`span`,{style:{fontWeight:`600`,fontSize:`15px`,color:`var(--color-text-primary)`},children:I?c===`ar`?`لا توجد نتائج تطابق بحثك`:`No matching results found`:c===`ar`?`لا يوجد أولياء أمور مسجلين حالياً`:`No parent accounts registered yet`}),(0,_.jsx)(`span`,{style:{fontSize:`13px`,color:`var(--color-text-secondary)`},children:I?c===`ar`?`جرب البحث بكلمة مفتاحية مختلفة`:`Try searching for a different keyword`:c===`ar`?`لم يتم إضافة أي بيانات بعد`:`No records have been added yet`})]})})})})]})}),(0,_.jsx)(t,{page:x?.currentPage||de,lastPage:x?.lastPage||1,total:x?.total||b.length,from:x?.from||1,to:x?.to||b.length,perPage:fe,onPageChange:me,onPerPageChange:he,loading:se,lang:c}),we&&(0,_.jsx)(`div`,{className:`modal-overlay no-print`,children:(0,_.jsxs)(`div`,{className:`modal-container`,style:{maxWidth:`500px`},children:[(0,_.jsxs)(`header`,{className:`modal-header`,children:[(0,_.jsxs)(`h3`,{className:`modal-title`,children:[`👨🏼‍💼 `,c===`ar`?`تسجيل حساب ولي أمر جديد`:`Register New Parent`]}),(0,_.jsx)(`button`,{className:`modal-close-btn`,onClick:()=>{L(!1),J(``)},children:(0,_.jsx)(p,{size:20,strokeWidth:2.5})})]}),(0,_.jsxs)(`form`,{onSubmit:ke,children:[(0,_.jsxs)(`div`,{className:`modal-body`,children:[q&&(0,_.jsx)(`div`,{style:{padding:`var(--space-md)`,backgroundColor:`rgba(220, 38, 38, 0.1)`,color:`var(--color-error)`,borderRadius:`var(--radius-chip)`,fontSize:`13px`,fontWeight:`600`,marginBottom:`12px`},children:q}),(0,_.jsxs)(`div`,{className:`form-group`,children:[(0,_.jsxs)(`label`,{className:`form-label`,children:[c===`ar`?`اسم ولي الأمر (بالعربية)`:`Parent Name (Arabic)`,` `,(0,_.jsx)(`span`,{style:{color:`var(--color-error)`},children:`*`})]}),(0,_.jsx)(`input`,{id:`parent-name-ar`,name:`name_ar`,type:`text`,className:`text-field`,value:z,onChange:e=>B(e.target.value),required:!0})]}),(0,_.jsxs)(`div`,{className:`form-group`,children:[(0,_.jsx)(`label`,{className:`form-label`,children:c===`ar`?`اسم ولي الأمر (بالانجليزية - اختياري)`:`Parent Name (English - Optional)`}),(0,_.jsx)(`input`,{id:`parent-name-en`,name:`name_en`,type:`text`,className:`text-field`,value:V,onChange:e=>H(e.target.value)})]}),(0,_.jsxs)(`div`,{className:`form-group`,children:[(0,_.jsxs)(`label`,{className:`form-label`,children:[c===`ar`?`الرقم الوطني`:`National ID`,` `,(0,_.jsx)(`span`,{style:{color:`var(--color-error)`},children:`*`})]}),(0,_.jsx)(`input`,{id:`parent-national-id`,name:`national_id`,type:`text`,className:`text-field`,value:G,onChange:e=>K(e.target.value),required:!0})]}),(0,_.jsxs)(`div`,{className:`form-group`,children:[(0,_.jsxs)(`label`,{className:`form-label`,children:[c===`ar`?`رقم الجوال`:`Phone Number`,` `,(0,_.jsx)(`span`,{style:{color:`var(--color-error)`},children:`*`})]}),(0,_.jsx)(`input`,{id:`parent-phone`,name:`phone`,type:`text`,className:`text-field`,value:U,onChange:e=>W(e.target.value),placeholder:`7XXXXXXXX`,required:!0})]})]}),(0,_.jsxs)(`footer`,{className:`modal-footer`,children:[(0,_.jsx)(`button`,{type:`button`,className:`btn-elevated`,onClick:()=>L(!1),style:{height:`48px`},disabled:P,children:l.cancel}),(0,_.jsx)(`button`,{type:`submit`,className:`btn-filled`,style:{height:`48px`,opacity:P?.7:1},disabled:P,children:P?c===`ar`?`جاري الحفظ...`:`Saving...`:l.submit})]})]})]})}),Te&&(0,_.jsx)(`div`,{className:`modal-overlay no-print`,children:(0,_.jsxs)(`div`,{className:`modal-container`,style:{maxWidth:`500px`},children:[(0,_.jsxs)(`header`,{className:`modal-header`,children:[(0,_.jsxs)(`h3`,{className:`modal-title`,children:[`👨🏼‍💼 `,c===`ar`?`تعديل حساب ولي الأمر / إعادة تعيين كلمة المرور`:`Edit Parent / Reset Password`]}),(0,_.jsx)(`button`,{className:`modal-close-btn`,onClick:()=>{R(!1),J(``)},children:(0,_.jsx)(p,{size:20,strokeWidth:2.5})})]}),(0,_.jsxs)(`form`,{onSubmit:Ae,children:[(0,_.jsxs)(`div`,{className:`modal-body`,children:[q&&(0,_.jsx)(`div`,{style:{padding:`var(--space-md)`,backgroundColor:`rgba(220, 38, 38, 0.1)`,color:`var(--color-error)`,borderRadius:`var(--radius-chip)`,fontSize:`13px`,fontWeight:`600`,marginBottom:`12px`},children:q}),(0,_.jsxs)(`div`,{className:`form-group`,children:[(0,_.jsxs)(`label`,{className:`form-label`,children:[c===`ar`?`اسم ولي الأمر (بالعربية)`:`Parent Name (Arabic)`,` `,(0,_.jsx)(`span`,{style:{color:`var(--color-error)`},children:`*`})]}),(0,_.jsx)(`input`,{id:`edit-parent-name-ar`,name:`edit_name_ar`,type:`text`,className:`text-field`,value:z,onChange:e=>B(e.target.value),required:!0})]}),(0,_.jsxs)(`div`,{className:`form-group`,children:[(0,_.jsx)(`label`,{className:`form-label`,children:c===`ar`?`اسم ولي الأمر (بالانجليزية)`:`Parent Name (English)`}),(0,_.jsx)(`input`,{id:`edit-parent-name-en`,name:`edit_name_en`,type:`text`,className:`text-field`,value:V,onChange:e=>H(e.target.value)})]}),(0,_.jsxs)(`div`,{className:`form-group`,children:[(0,_.jsxs)(`label`,{className:`form-label`,children:[c===`ar`?`الرقم المدني / الوطني`:`Civil / National ID`,` `,(0,_.jsx)(`span`,{style:{color:`var(--color-error)`},children:`*`})]}),(0,_.jsx)(`input`,{id:`edit-parent-national-id`,name:`edit_national_id`,type:`text`,className:`text-field`,value:G,onChange:e=>K(e.target.value),required:!0})]}),(0,_.jsxs)(`div`,{className:`form-group`,children:[(0,_.jsxs)(`label`,{className:`form-label`,children:[c===`ar`?`رقم الجوال`:`Phone Number`,` `,(0,_.jsx)(`span`,{style:{color:`var(--color-error)`},children:`*`})]}),(0,_.jsx)(`input`,{id:`edit-parent-phone`,name:`edit_phone`,type:`text`,className:`text-field`,value:U,onChange:e=>W(e.target.value),placeholder:`7XXXXXXXX`,required:!0})]})]}),(0,_.jsxs)(`footer`,{className:`modal-footer`,children:[(0,_.jsx)(`button`,{type:`button`,className:`btn-elevated`,onClick:()=>R(!1),style:{height:`48px`},disabled:P,children:l.cancel}),(0,_.jsx)(`button`,{type:`submit`,className:`btn-filled`,style:{height:`48px`,opacity:P?.7:1},disabled:P,children:P?c===`ar`?`جاري الحفظ...`:`Saving...`:l.submit})]})]})]})}),Se&&(0,_.jsx)(`div`,{className:`modal-overlay no-print`,style:{zIndex:9999},children:(0,_.jsxs)(`div`,{className:`modal-container`,style:{maxWidth:`520px`},children:[(0,_.jsxs)(`header`,{className:`modal-header`,children:[(0,_.jsxs)(`h3`,{className:`modal-title`,style:{display:`flex`,alignItems:`center`,gap:`8px`},children:[(0,_.jsx)(m,{size:20,color:`#d97706`}),(0,_.jsx)(`span`,{children:c===`ar`?`طباعة كشوفات أولياء الأمور`:`Print Parents Rosters`})]}),(0,_.jsx)(`button`,{className:`modal-close-btn`,onClick:()=>E(!1),disabled:j,children:(0,_.jsx)(p,{size:20,strokeWidth:2.5})})]}),(0,_.jsxs)(`div`,{className:`modal-body`,style:{display:`flex`,flexDirection:`column`,gap:`16px`},children:[(0,_.jsxs)(`div`,{children:[(0,_.jsx)(`label`,{style:{display:`block`,fontSize:`13px`,fontWeight:`700`,marginBottom:`6px`,color:`var(--color-text-primary)`},children:c===`ar`?`اختر الصف والشعبة`:`Select Class & Section`}),(0,_.jsxs)(`select`,{value:D,onChange:e=>O(e.target.value),className:`text-field`,style:{width:`100%`,padding:`10px 12px`,borderRadius:`8px`,border:`1px solid var(--color-border)`,backgroundColor:`var(--color-surface)`},disabled:j,children:[(k===`all_with_id_count`||k===`all_with_id_children_details`)&&(0,_.jsx)(`option`,{value:`all`,children:c===`ar`?`جميع الصفوف (كامل المدرسة)`:`All Classes (Whole School)`}),T.map(e=>(0,_.jsxs)(`option`,{value:typeof e.id==`string`&&e.id.startsWith(`cls-`)?e.id.replace(`cls-`,``):e.numericId||e.id,children:[e.grade||e.name,` - `,e.section||e.section_ar||``]},e.id))]}),(k===`class_no_id`||k===`class_with_id`)&&D===`all`&&(0,_.jsx)(`span`,{style:{fontSize:`11px`,color:`#dc2626`,marginTop:`4px`,display:`block`},children:`* هذا الكشف يتطلب تحديد صف وشعبة معينة`})]}),(0,_.jsxs)(`div`,{children:[(0,_.jsx)(`label`,{style:{display:`block`,fontSize:`13px`,fontWeight:`700`,marginBottom:`8px`,color:`var(--color-text-primary)`},children:c===`ar`?`نوع الكشف المطلوب`:`Roster Type`}),(0,_.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`8px`},children:[(0,_.jsxs)(`label`,{onClick:()=>{if(A(`class_no_id`),(D===`all`||!D)&&T[0]?.id){let e=typeof T[0].id==`string`&&T[0].id.startsWith(`cls-`)?T[0].id.replace(`cls-`,``):T[0].numericId||T[0].id;O(String(e))}},style:{display:`flex`,alignItems:`center`,gap:`10px`,padding:`12px 14px`,borderRadius:`8px`,border:`1.5px solid ${k===`class_no_id`?`#d97706`:`var(--color-border)`}`,backgroundColor:k===`class_no_id`?`rgba(217, 119, 6, 0.05)`:`var(--color-surface)`,cursor:`pointer`},children:[(0,_.jsx)(`input`,{type:`radio`,name:`rosterType`,value:`class_no_id`,checked:k===`class_no_id`,onChange:()=>{if(A(`class_no_id`),(D===`all`||!D)&&T[0]?.id){let e=typeof T[0].id==`string`&&T[0].id.startsWith(`cls-`)?T[0].id.replace(`cls-`,``):T[0].numericId||T[0].id;O(String(e))}}}),(0,_.jsx)(`span`,{style:{fontSize:`13px`,fontWeight:k===`class_no_id`?`700`:`500`},children:c===`ar`?`كشف بأسماء أولياء الأمور لصف وشعبة محددة بدون الرقم الوطني`:`Class Parents Roster without National ID`})]}),(0,_.jsxs)(`label`,{onClick:()=>{if(A(`class_with_id`),(D===`all`||!D)&&T[0]?.id){let e=typeof T[0].id==`string`&&T[0].id.startsWith(`cls-`)?T[0].id.replace(`cls-`,``):T[0].numericId||T[0].id;O(String(e))}},style:{display:`flex`,alignItems:`center`,gap:`10px`,padding:`12px 14px`,borderRadius:`8px`,border:`1.5px solid ${k===`class_with_id`?`#d97706`:`var(--color-border)`}`,backgroundColor:k===`class_with_id`?`rgba(217, 119, 6, 0.05)`:`var(--color-surface)`,cursor:`pointer`},children:[(0,_.jsx)(`input`,{type:`radio`,name:`rosterType`,value:`class_with_id`,checked:k===`class_with_id`,onChange:()=>{if(A(`class_with_id`),(D===`all`||!D)&&T[0]?.id){let e=typeof T[0].id==`string`&&T[0].id.startsWith(`cls-`)?T[0].id.replace(`cls-`,``):T[0].numericId||T[0].id;O(String(e))}}}),(0,_.jsx)(`span`,{style:{fontSize:`13px`,fontWeight:k===`class_with_id`?`700`:`500`},children:c===`ar`?`كشف بأسماء أولياء الأمور لصف وشعبة محددة مع الرقم الوطني`:`Class Parents Roster with National ID`})]}),(0,_.jsxs)(`label`,{onClick:()=>A(`all_with_id_count`),style:{display:`flex`,alignItems:`center`,gap:`10px`,padding:`12px 14px`,borderRadius:`8px`,border:`1.5px solid ${k===`all_with_id_count`?`#d97706`:`var(--color-border)`}`,backgroundColor:k===`all_with_id_count`?`rgba(217, 119, 6, 0.05)`:`var(--color-surface)`,cursor:`pointer`},children:[(0,_.jsx)(`input`,{type:`radio`,name:`rosterType`,value:`all_with_id_count`,checked:k===`all_with_id_count`,onChange:()=>A(`all_with_id_count`)}),(0,_.jsx)(`span`,{style:{fontSize:`13px`,fontWeight:k===`all_with_id_count`?`700`:`500`},children:c===`ar`?`كشف بأسماء أولياء الأمور مع الرقم الوطني وعدد الأبناء`:`Parents Roster with National ID & Children Count`})]}),(0,_.jsxs)(`label`,{onClick:()=>A(`all_with_id_children_details`),style:{display:`flex`,alignItems:`center`,gap:`10px`,padding:`12px 14px`,borderRadius:`8px`,border:`1.5px solid ${k===`all_with_id_children_details`?`#d97706`:`var(--color-border)`}`,backgroundColor:k===`all_with_id_children_details`?`rgba(217, 119, 6, 0.05)`:`var(--color-surface)`,cursor:`pointer`},children:[(0,_.jsx)(`input`,{type:`radio`,name:`rosterType`,value:`all_with_id_children_details`,checked:k===`all_with_id_children_details`,onChange:()=>A(`all_with_id_children_details`)}),(0,_.jsx)(`span`,{style:{fontSize:`13px`,fontWeight:k===`all_with_id_children_details`?`700`:`500`},children:c===`ar`?`كشف بأسماء أولياء الأمور مع الرقم الوطني وعدد الأبناء وأسمائهم مع الصف والشعبة`:`Parents Roster with ID, Children Names & Classes`})]})]})]})]}),(0,_.jsxs)(`footer`,{className:`modal-footer`,style:{display:`flex`,justifyContent:`flex-start`,gap:`8px`},children:[(0,_.jsxs)(`button`,{type:`button`,className:`btn-filled`,onClick:Ne,disabled:j||(k===`class_no_id`||k===`class_with_id`)&&(!D||D===`all`),style:{display:`flex`,alignItems:`center`,gap:`6px`,backgroundColor:`#d97706`,borderColor:`#d97706`,color:`#fff`,padding:`8px 20px`,opacity:(k===`class_no_id`||k===`class_with_id`)&&(!D||D===`all`)?.6:1},children:[(0,_.jsx)(m,{size:16}),(0,_.jsx)(`span`,{children:j?c===`ar`?`جاري تجهيز الكشف...`:`Preparing...`:c===`ar`?`طباعة`:`Print`})]}),(0,_.jsx)(`button`,{type:`button`,className:`btn-elevated`,onClick:()=>E(!1),disabled:j,children:l.cancel})]})]})}),Y&&(0,_.jsx)(`div`,{className:`modal-overlay no-print`,children:(0,_.jsxs)(`div`,{className:`modal-container`,style:{maxWidth:`480px`},children:[(0,_.jsxs)(`header`,{className:`modal-header`,children:[(0,_.jsxs)(`h3`,{className:`modal-title`,children:[`🔑 `,c===`ar`?`إعادة تعيين كلمة مرور ولي الأمر`:`Reset Parent Password`]}),(0,_.jsx)(`button`,{className:`modal-close-btn`,onClick:()=>X(null),children:(0,_.jsx)(p,{size:20,strokeWidth:2.5})})]}),(0,_.jsxs)(`div`,{className:`modal-body`,style:{display:`flex`,flexDirection:`column`,gap:`16px`},children:[(0,_.jsxs)(`div`,{style:{background:`var(--color-bg-secondary, #f8fafc)`,padding:`14px 16px`,borderRadius:`12px`,border:`1px solid rgba(0,0,0,0.06)`},children:[(0,_.jsx)(`div`,{style:{fontWeight:`700`,fontSize:`15px`,color:`var(--color-text-primary)`},children:Y.name}),(0,_.jsxs)(`div`,{style:{fontSize:`13px`,color:`var(--color-text-secondary)`,marginTop:`6px`,display:`flex`,gap:`16px`,flexWrap:`wrap`},children:[(0,_.jsxs)(`span`,{children:[`🆔 `,Y.nationalId]}),(0,_.jsxs)(`span`,{children:[`📱 `,Y.phone||`غير مسجل`]})]})]}),(0,_.jsx)(`p`,{style:{margin:0,fontSize:`13px`,color:`var(--color-text-secondary)`,lineHeight:`1.6`},children:c===`ar`?`اختر خيار إعادة تعيين كلمة المرور المطلوب لحساب ولي الأمر ليتمكن من الدخول إلى التطبيق:`:`Select the reset option for this parent account to enable mobile app login:`}),(0,_.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`10px`},children:[(0,_.jsxs)(`button`,{type:`button`,className:`btn-filled`,style:{display:`flex`,alignItems:`center`,justifyContent:`space-between`,padding:`14px 18px`,borderRadius:`12px`,backgroundColor:`#062A5A`,color:`#ffffff`,cursor:Z?`wait`:`pointer`},disabled:Z,onClick:()=>Q(`default`),children:[(0,_.jsxs)(`div`,{style:{textAlign:`start`},children:[(0,_.jsx)(`div`,{style:{fontWeight:`700`,fontSize:`14px`},children:c===`ar`?`تصفير إلى الرمز الافتراضي (12345678)`:`Reset to Default (12345678)`}),(0,_.jsx)(`div`,{style:{fontSize:`11px`,opacity:.85,marginTop:`2px`},children:c===`ar`?`الرمز الموحد الأساسي لجميع أولياء الأمور`:`Standard default code for all parents`})]}),(0,_.jsx)(`span`,{style:{fontSize:`18px`},children:`⚡`})]}),(0,_.jsxs)(`button`,{type:`button`,className:`btn-elevated`,style:{display:`flex`,alignItems:`center`,justifyContent:`space-between`,padding:`14px 18px`,borderRadius:`12px`,border:`1px solid #2563eb`,color:`#2563eb`,background:`rgba(37, 99, 235, 0.05)`,cursor:Z?`wait`:`pointer`,opacity:Y.phone?1:.5},disabled:Z||!Y.phone,onClick:()=>Q(`phone`),children:[(0,_.jsxs)(`div`,{style:{textAlign:`start`},children:[(0,_.jsx)(`div`,{style:{fontWeight:`700`,fontSize:`14px`},children:c===`ar`?`تصفير إلى رقم الجوال (${Y.phone||`غير متوفر`})`:`Reset to Phone (${Y.phone||`N/A`})`}),(0,_.jsx)(`div`,{style:{fontSize:`11px`,opacity:.85,marginTop:`2px`},children:c===`ar`?`يجعل كلمة المرور مطابقة لرقم هاتف ولي الأمر`:`Sets password to match parent phone number`})]}),(0,_.jsx)(`span`,{style:{fontSize:`18px`},children:`📱`})]})]})]}),(0,_.jsx)(`footer`,{className:`modal-footer`,children:(0,_.jsx)(`button`,{type:`button`,className:`btn-elevated`,onClick:()=>X(null),disabled:Z,children:l.cancel})})]})})]})}function y(){return(0,_.jsx)(v,{})}export{y as default};