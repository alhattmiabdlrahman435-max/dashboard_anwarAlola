import{i as e,n as t,t as n}from"./jsx-runtime-bzQ4Vb5N.js";import{n as r,t as i}from"./PaginationBar-5ayUK4mo.js";import{t as a}from"./file-spreadsheet-VizbEm2c.js";import{t as o}from"./pen-line-Dio8u3_1.js";import{t as ee}from"./search-Bxzu-0JG.js";import{t as s}from"./trash-2-BiF47PZh.js";import{t as c}from"./upload-C1ezUuXr.js";import{B as l,M as u,N as d,R as f,T as p,V as m,g as te,r as h,t as ne,u as g}from"./index-zIQSvOsT.js";import{t as re}from"./useAllowedClasses-Bh-bjqnv.js";import{t as ie}from"./sloganBase64-BF9PhYUx.js";var ae=p(`key-round`,[[`path`,{d:`M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z`,key:`1s6t7t`}],[`circle`,{cx:`16.5`,cy:`7.5`,r:`.5`,fill:`currentColor`,key:`w0ekpg`}]]),_=e(t(),1),v=n();function y(){let{lang:e,t,renderAvatar:n,canAction:p,setToastMessage:y,triggerConfirm:b}=l(),{parentUsers:x,loading:oe,parentsPagination:S,fetchParents:C,handleAddParent:se,handleEditParent:ce,handleDeleteParent:le}=u(),{page:ue,perPage:de,search:fe,setPage:pe,setPerPage:me,setSearch:he,buildQueryString:ge}=r({moduleKey:`parents`}),{students:w,fetchStudents:_e}=ne(),{currentUser:ve}=m(),{classes:ye,fetchClasses:be}=d(),{allowedClasses:T}=re(`parents`),E=T&&T.length>0?T:ye||[],[xe,D]=(0,_.useState)(!1),[O,k]=(0,_.useState)(``),[A,j]=(0,_.useState)(`class_no_id`),[M,N]=(0,_.useState)(!1),P=ge();(0,_.useEffect)(()=>{C(P)},[C,P]),(0,_.useEffect)(()=>{be&&be()},[]),(0,_.useEffect)(()=>{if(E&&E.length>0&&!O){let e=typeof E[0].id==`string`&&E[0].id.startsWith(`cls-`)?E[0].id.replace(`cls-`,``):E[0].numericId||E[0].id;k(String(e))}},[E,O]);let[F,I]=(0,_.useState)(!1),[L,Se]=(0,_.useState)(``),[Ce,R]=(0,_.useState)(!1),[we,z]=(0,_.useState)(!1),[Te,Ee]=(0,_.useState)(``),[B,V]=(0,_.useState)(``),[H,U]=(0,_.useState)(``),[W,G]=(0,_.useState)(``),[K,q]=(0,_.useState)(``),[J,Y]=(0,_.useState)(``),[X,Z]=(0,_.useState)(null),[Q,De]=(0,_.useState)(!1),$=async t=>{if(X){De(!0);try{let n=await f.resetPassword(X.id,t);n.data?.success?(y(n.data.message||(e===`ar`?`تم تصفير كلمة المرور بنجاح`:`Password reset successfully`)),Z(null)):y(n.data?.message||(e===`ar`?`فشل تصفير كلمة المرور`:`Failed to reset password`))}catch(t){y(t.response?.data?.message||t.message||(e===`ar`?`حدث خطأ أثناء تصفير كلمة المرور`:`Error resetting password`))}finally{De(!1)}}},Oe=n=>{if(n.preventDefault(),Y(``),!B.trim()||!W.trim()||!K.trim()){Y(t.emptyError);return}let r=K.trim(),i=W.replace(/\D/g,``);if(i.length!==9||!i.startsWith(`7`)){Y(t.phoneError);return}if(x.some(e=>e.nationalId===r)){Y(e===`ar`?`الرقم الوطني مسجل مسبقاً لولي أمر آخر!`:`National ID already registered!`);return}let a={nationalId:r,name:B,nameEn:H.trim()||B.split(` `).map(e=>e.charAt(0).toUpperCase()+e.slice(1)).join(` `),phone:i,username:r,password:i,photo:`🧔`};I(!0),se(a).then(t=>{t&&t.success?(R(!1),V(``),U(``),G(``),q(``)):Y(t?.message||(e===`ar`?`فشلت العملية`:`Operation failed`))}).catch(e=>{Y(e.message||`Error occurred`)}).finally(()=>{I(!1)})},ke=n=>{if(n.preventDefault(),Y(``),!B.trim()||!W.trim()||!K.trim()){Y(t.emptyError);return}let r=W.replace(/\D/g,``);if(r.length!==9||!r.startsWith(`7`)){Y(t.phoneError);return}let i={nationalId:K,name:B,nameEn:H.trim()||B.split(` `).map(e=>e.charAt(0).toUpperCase()+e.slice(1)).join(` `),phone:r,username:K,password:r,photo:`🧔`};I(!0),ce(i,null,Te).then(t=>{t&&t.success?(z(!1),V(``),U(``),G(``),q(``),Ee(``)):Y(t?.message||(e===`ar`?`فشلت العملية`:`Operation failed`))}).catch(e=>{Y(e.message||`Error occurred`)}).finally(()=>{I(!1)})},Ae=async()=>{try{let t=await f.exportParents();if(!t.ok){alert(e===`ar`?`فشل تصدير البيانات`:`Failed to export data`);return}let n=await t.blob(),r=window.URL.createObjectURL(n),i=document.createElement(`a`);i.href=r,i.download=`parents_export.csv`,document.body.appendChild(i),i.click(),i.remove()}catch(e){console.error(e)}},je=async t=>{let n=t.target.files[0];if(!n)return;let r=new FormData;r.append(`file`,n);try{let t=await f.importParents(r);if(t.success){y(t.message);let e=localStorage.getItem(`auth_token`);C(e),_e(e)}else alert(t.message||(e===`ar`?`حدث خطأ أثناء الاستيراد`:`Error importing`))}catch(e){console.error(e)}},Me=async()=>{N(!0);try{let e=[],t=A===`class_no_id`||A===`class_with_id`,n=O;if(t&&(!n||n===`all`)){let e=E[0];n=e?e.numericId||String(e.id).replace(/\D/g,``):``}let r=n&&n!==`all`?String(n).replace(/\D/g,``):``;if(r)try{let t=await f.getParents(`?class_id=${r}&per_page=1000`);Array.isArray(t?.parents)?e=t.parents:Array.isArray(t?.data?.parents)?e=t.data.parents:Array.isArray(t?.data)?e=t.data:Array.isArray(t)&&(e=t)}catch(e){console.warn(`API class fetch failed, falling back to local state:`,e)}else try{let t=await f.getParents(`?per_page=1000`);Array.isArray(t?.parents)?e=t.parents:Array.isArray(t?.data?.parents)?e=t.data.parents:Array.isArray(t?.data)?e=t.data:Array.isArray(t)&&(e=t)}catch(e){console.warn(`API all fetch failed, falling back to local state:`,e)}if(e.length===0)if(r){let t=w.filter(e=>String(e.class_id||e.classId||``).replace(/\D/g,``)===String(r)),n=new Set(t.map(e=>Number(e.parentId||e.parent_id)).filter(Boolean)),i=new Set(t.map(e=>String(e.parentNationalId||``)).filter(Boolean));if(e=x.filter(e=>n.has(Number(e.id))||e.nationalId&&i.has(String(e.nationalId))),e.length===0&&t.length>0){let n=new Map;t.forEach(e=>{let t=e.parentId||e.parentNationalId||e.parentName;t&&(n.has(t)||n.set(t,{id:e.parentId,nationalId:e.parentNationalId||``,name:e.parentName||``,phone:e.phone||``,children:[]}),n.get(t).children.push({id:e.id,name:e.name,grade:e.grade,section:e.section}))}),e=Array.from(n.values())}}else e=[...x];e=e.map(e=>{let t=e.national_id||e.nationalId||``,n=e.name_ar||e.name||``,r=e.children||[];return(!r||r.length===0)&&(r=w.filter(n=>n.parentId&&e.id&&Number(n.parentId)===Number(e.id)||t&&n.parentNationalId===t)),{id:e.id,nationalId:t,name:n,phone:e.phone||``,children:r.map(e=>({id:e.id,name:e.name_ar||e.name||``,grade:e.grade||(e.schoolClass?e.schoolClass.grade_ar:``)||``,section:e.section||(e.schoolClass?e.schoolClass.section_ar:``)||``}))}});let i=e=>e?e.replace(/[\u064B-\u065F\u0670]/g,``).replace(/[إأآٱ]/g,`ا`).replace(/ة/g,`ه`).replace(/ى/g,`ي`).trim():``;e.sort((e,t)=>{let n=i(e.name||``),r=i(t.name||``),a=n.localeCompare(r,`ar`);return a===0?(e.name||``).localeCompare(t.name||``,`ar`):a});let a=E.find(e=>{let t=typeof e.id==`string`&&e.id.startsWith(`cls-`)?e.id.replace(`cls-`,``):e.numericId||e.id;return String(t)===String(r)||String(e.id)===String(n)}),o=a?`${a.grade||a.name||``} - ${a.section||``}`:r?`الصف ${r}`:`جميع الفصول الدراسية`,ee=new Date().toLocaleDateString(`ar-SA`,{year:`numeric`,month:`long`,day:`numeric`,weekday:`long`}),s=``;s=e.length===0?`
          <tr>
            <td colspan="${{class_no_id:3,class_with_id:4,all_with_id_count:5,all_with_id_children_details:6}[A]||4}" style="text-align:center;padding:24px;color:#64748b;font-weight:700;">
              لا توجد بيانات أولياء أمور مسجلة لهذا النطاق
            </td>
          </tr>
        `:e.map((e,t)=>{if(A===`class_no_id`)return`
              <tr>
                <td class="col-num">${t+1}</td>
                <td class="col-name">${e.name}</td>
                <td class="col-notes">&nbsp;</td>
              </tr>
            `;if(A===`class_with_id`)return`
              <tr>
                <td class="col-num">${t+1}</td>
                <td class="col-code">${e.nationalId}</td>
                <td class="col-name">${e.name}</td>
                <td class="col-notes">&nbsp;</td>
              </tr>
            `;if(A===`all_with_id_count`)return`
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
            `}}).join(``);let c=``;c=A===`class_no_id`?`
          <tr>
            <th style="width: 38px;">م</th>
            <th style="text-align: right;">اسم ولي الأمر</th>
            <th style="width: 240px; text-align: right;">الملاحظات</th>
          </tr>
        `:A===`class_with_id`?`
          <tr>
            <th style="width: 38px;">م</th>
            <th style="width: 130px; text-align: center;">الرقم الوطني</th>
            <th style="text-align: right;">اسم ولي الأمر</th>
            <th style="width: 220px; text-align: right;">الملاحظات</th>
          </tr>
        `:A===`all_with_id_count`?`
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
        `;let l=A===`class_no_id`||A===`class_with_id`||n&&n!==`all`,u=`<!DOCTYPE html>
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
</html>`,d=document.getElementById(`parents-print-frame`);d&&d.remove(),d=document.createElement(`iframe`),d.id=`parents-print-frame`,d.style.position=`fixed`,d.style.right=`0`,d.style.bottom=`0`,d.style.width=`0`,d.style.height=`0`,d.style.border=`0`,document.body.appendChild(d);let p=d.contentWindow||d.contentDocument,m=p.document||p;m.open(),m.write(u),m.close(),setTimeout(()=>{try{d.contentWindow.focus(),d.contentWindow.print()}catch(e){console.error(`Print trigger error:`,e)}},350),D(!1)}catch(e){console.error(`Roster generation failed:`,e),alert(`حدث خطأ أثناء إعداد كشف الطباعة`)}finally{N(!1)}},Ne=async()=>{try{let e=await(await f.downloadTemplate()).blob(),t=window.URL.createObjectURL(e),n=document.createElement(`a`);n.href=t,n.download=`parents_template.xlsx`,document.body.appendChild(n),n.click(),n.remove()}catch(e){console.error(e)}},Pe=x.filter(e=>e.name.toLowerCase().includes(L.toLowerCase())||e.nameEn&&e.nameEn.toLowerCase().includes(L.toLowerCase())||e.nationalId.includes(L));return(0,v.jsxs)(`div`,{className:`section-card`,children:[(0,v.jsxs)(`div`,{className:`section-card-header no-print`,style:{display:`flex`,justifyContent:`space-between`,alignItems:`center`,gap:`var(--space-md)`},children:[(0,v.jsx)(`h3`,{className:`section-card-title headline-small`,style:{fontSize:`18px`,margin:0},children:t.parentsTitle}),(0,v.jsxs)(`div`,{style:{display:`flex`,gap:`8px`,alignItems:`center`,flexWrap:`wrap`},children:[(0,v.jsxs)(`button`,{className:`btn-secondary`,onClick:()=>D(!0),style:{display:`flex`,alignItems:`center`,gap:`6px`,padding:`8px 16px`,fontSize:`13px`,fontWeight:`700`,color:`#d97706`,borderColor:`#fcd34d`,backgroundColor:`#fffbeb`},children:[(0,v.jsx)(g,{size:16}),e===`ar`?`طباعة كشف`:`Print Roster`]}),p(`parents`,`export`)&&(0,v.jsxs)(`button`,{className:`btn-secondary`,onClick:Ae,style:{display:`flex`,alignItems:`center`,gap:`4px`,padding:`8px 16px`,fontSize:`13px`},children:[(0,v.jsx)(te,{size:16}),e===`ar`?`تصدير`:`Export`]}),p(`parents`,`import`)&&(0,v.jsxs)(v.Fragment,{children:[(0,v.jsxs)(`button`,{className:`btn-secondary`,onClick:Ne,style:{display:`flex`,alignItems:`center`,gap:`4px`,padding:`8px 16px`,fontSize:`13px`},title:e===`ar`?`تحميل النموذج الفارغ`:`Download Template`,children:[(0,v.jsx)(a,{size:16}),e===`ar`?`النموذج`:`Template`]}),(0,v.jsxs)(`label`,{className:`btn-secondary`,style:{display:`flex`,alignItems:`center`,gap:`4px`,cursor:`pointer`,margin:0,padding:`8px 16px`,fontSize:`13px`},children:[(0,v.jsx)(c,{size:16}),e===`ar`?`استيراد`:`Import`,(0,v.jsx)(`input`,{type:`file`,accept:`.csv,.xlsx`,onChange:je,style:{display:`none`}})]})]}),p(`parents`,`create`)&&(0,v.jsxs)(`button`,{className:`btn-filled`,onClick:()=>{Y(``),V(``),U(``),G(``),q(``),R(!0)},style:{padding:`8px 16px`,fontSize:`13px`},children:[`👨🏼‍💼 `,e===`ar`?`تسجيل حساب ولي أمر جديد`:`Register New Parent`]})]})]}),(0,v.jsx)(`div`,{className:`students-controls no-print`,style:{marginBottom:`var(--space-md)`},children:(0,v.jsxs)(`div`,{className:`search-box`,children:[(0,v.jsx)(ee,{size:18}),(0,v.jsx)(`input`,{id:`search-parents`,name:`search`,type:`text`,className:`text-field`,placeholder:t.searchParentPlaceholder,value:L,onChange:e=>{Se(e.target.value),he(e.target.value)}})]})}),(0,v.jsx)(`div`,{className:`students-table-container`,children:(0,v.jsxs)(`table`,{className:`students-table`,children:[(0,v.jsx)(`thead`,{children:(0,v.jsxs)(`tr`,{children:[(0,v.jsx)(`th`,{className:`sticky-col-1`,children:t.parentNationalIdShort}),(0,v.jsx)(`th`,{className:`sticky-col-2`,children:t.parentName}),(0,v.jsx)(`th`,{children:t.parentPhone}),(0,v.jsx)(`th`,{children:t.parentSonsCount}),(0,v.jsx)(`th`,{children:t.parentSonsList}),(ve?.role===`admin`||p(`parents`,`update`)||p(`parents`,`delete`))&&(0,v.jsx)(`th`,{className:`no-print`,children:t.action})]})}),(0,v.jsx)(`tbody`,{children:Pe.length>0?Pe.map(t=>{let r=t.children&&t.children.length>0?t.children:w.filter(e=>e.parentNationalId===t.nationalId);return(0,v.jsxs)(`tr`,{children:[(0,v.jsx)(`td`,{className:`sticky-col-1`,style:{fontFamily:`var(--font-mono)`,fontWeight:`bold`},children:t.nationalId}),(0,v.jsxs)(`td`,{className:`sticky-col-2`,style:{fontWeight:`600`},children:[n(t.photo,`🧔`),e===`ar`?t.name:t.nameEn||t.name]}),(0,v.jsx)(`td`,{style:{fontFamily:`var(--font-mono)`},children:t.phone}),(0,v.jsx)(`td`,{style:{fontWeight:`bold`,textAlign:`center`},children:r.length}),(0,v.jsx)(`td`,{children:(0,v.jsxs)(`div`,{style:{display:`flex`,gap:`6px`,flexWrap:`wrap`},children:[r.map(t=>(0,v.jsxs)(`span`,{className:`chip`,style:{cursor:`default`,padding:`4px 10px`,fontSize:`11px`,display:`inline-flex`,alignItems:`center`,gap:`4px`},children:[n(t.photo,`👨‍🎓`),(0,v.jsxs)(`span`,{children:[e===`ar`?t.name:t.nameEn||t.name,` (`,e===`ar`?t.grade||``:t.gradeEn||t.grade||``,`)`]}),(0,v.jsx)(`span`,{style:{marginInlineStart:`6px`,fontSize:`9px`,opacity:.8},children:t.status===`present`||t.status===`late`?`🟢`:`🔴`})]},t.id)),r.length===0&&(0,v.jsx)(`span`,{style:{fontStyle:`italic`,opacity:.5,fontSize:`11px`},children:e===`ar`?`لا يوجد أبناء مرتبطين`:`No linked children`})]})}),(ve?.role===`admin`||p(`parents`,`update`)||p(`parents`,`delete`))&&(0,v.jsx)(`td`,{className:`no-print`,children:(0,v.jsxs)(`div`,{style:{display:`flex`,gap:`6px`},children:[p(`parents`,`update`)&&(0,v.jsx)(`button`,{className:`btn-elevated`,style:{padding:`6px`,borderRadius:`8px`,display:`flex`,alignItems:`center`,justifyContent:`center`,cursor:`pointer`,border:`1px solid rgba(37, 99, 235, 0.15)`,background:`rgba(37, 99, 235, 0.06)`,color:`#2563eb`,width:`32px`,height:`32px`,transition:`all 0.15s ease`},onMouseOver:e=>{e.currentTarget.style.background=`rgba(37, 99, 235, 0.12)`,e.currentTarget.style.borderColor=`#2563eb`},onMouseOut:e=>{e.currentTarget.style.background=`rgba(37, 99, 235, 0.06)`,e.currentTarget.style.borderColor=`rgba(37, 99, 235, 0.15)`},onClick:()=>{Y(``),Ee(t.nationalId),V(t.name),U(t.nameEn||``),G(t.phone),q(t.nationalId),z(!0)},title:e===`ar`?`تعديل`:`Edit`,children:(0,v.jsx)(o,{size:15})}),p(`parents`,`update`)&&(0,v.jsx)(`button`,{onClick:()=>Z(t),title:e===`ar`?`إعادة تعيين كلمة المرور`:`Reset Password`,style:{borderRadius:`8px`,display:`flex`,alignItems:`center`,justifyContent:`center`,cursor:`pointer`,border:`1px solid rgba(245, 158, 11, 0.2)`,background:`rgba(245, 158, 11, 0.08)`,color:`#d97706`,width:`32px`,height:`32px`,transition:`all 0.15s ease`},onMouseOver:e=>{e.currentTarget.style.background=`rgba(245, 158, 11, 0.18)`,e.currentTarget.style.borderColor=`#d97706`},onMouseOut:e=>{e.currentTarget.style.background=`rgba(245, 158, 11, 0.08)`,e.currentTarget.style.borderColor=`rgba(245, 158, 11, 0.2)`},children:(0,v.jsx)(ae,{size:15})}),p(`parents`,`delete`)&&(0,v.jsx)(`button`,{onClick:()=>{b({title:e===`ar`?`حذف حساب ولي الأمر`:`Delete Parent Account`,message:e===`ar`?`هل أنت متأكد من حذف حساب ولي الأمر ${t.name} وحسابه بالكامل؟`:`Are you sure you want to delete parent ${t.name} and their account?`,onConfirm:()=>le(t.id)})},title:e===`ar`?`حذف`:`Delete`,style:{background:`rgba(220, 38, 38, 0.06)`,border:`1px solid rgba(220, 38, 38, 0.15)`,color:`#dc2626`,borderRadius:`8px`,width:`32px`,height:`32px`,display:`flex`,alignItems:`center`,justifyContent:`center`,cursor:`pointer`,transition:`all 0.15s ease`},onMouseOver:e=>{e.currentTarget.style.background=`rgba(220, 38, 38, 0.12)`,e.currentTarget.style.borderColor=`#dc2626`},onMouseOut:e=>{e.currentTarget.style.background=`rgba(220, 38, 38, 0.06)`,e.currentTarget.style.borderColor=`rgba(220, 38, 38, 0.15)`},children:(0,v.jsx)(s,{size:15})})]})})]},t.nationalId)}):(0,v.jsx)(`tr`,{children:(0,v.jsx)(`td`,{colSpan:`8`,style:{padding:`48px 24px`,textAlign:`center`},children:(0,v.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,alignItems:`center`,justifyContent:`center`,gap:`8px`},children:[(0,v.jsx)(`span`,{style:{fontSize:`32px`},children:L?`🔍`:`📂`}),(0,v.jsx)(`span`,{style:{fontWeight:`600`,fontSize:`15px`,color:`var(--color-text-primary)`},children:L?e===`ar`?`لا توجد نتائج تطابق بحثك`:`No matching results found`:e===`ar`?`لا يوجد أولياء أمور مسجلين حالياً`:`No parent accounts registered yet`}),(0,v.jsx)(`span`,{style:{fontSize:`13px`,color:`var(--color-text-secondary)`},children:L?e===`ar`?`جرب البحث بكلمة مفتاحية مختلفة`:`Try searching for a different keyword`:e===`ar`?`لم يتم إضافة أي بيانات بعد`:`No records have been added yet`})]})})})})]})}),(0,v.jsx)(i,{page:S?.currentPage||ue,lastPage:S?.lastPage||1,total:S?.total||x.length,from:S?.from||1,to:S?.to||x.length,perPage:de,onPageChange:pe,onPerPageChange:me,loading:oe,lang:e}),Ce&&(0,v.jsx)(`div`,{className:`modal-overlay no-print`,children:(0,v.jsxs)(`div`,{className:`modal-container`,style:{maxWidth:`500px`},children:[(0,v.jsxs)(`header`,{className:`modal-header`,children:[(0,v.jsxs)(`h3`,{className:`modal-title`,children:[`👨🏼‍💼 `,e===`ar`?`تسجيل حساب ولي أمر جديد`:`Register New Parent`]}),(0,v.jsx)(`button`,{className:`modal-close-btn`,onClick:()=>{R(!1),Y(``)},children:(0,v.jsx)(h,{size:20,strokeWidth:2.5})})]}),(0,v.jsxs)(`form`,{onSubmit:Oe,children:[(0,v.jsxs)(`div`,{className:`modal-body`,children:[J&&(0,v.jsx)(`div`,{style:{padding:`var(--space-md)`,backgroundColor:`rgba(220, 38, 38, 0.1)`,color:`var(--color-error)`,borderRadius:`var(--radius-chip)`,fontSize:`13px`,fontWeight:`600`,marginBottom:`12px`},children:J}),(0,v.jsxs)(`div`,{className:`form-group`,children:[(0,v.jsxs)(`label`,{className:`form-label`,children:[e===`ar`?`اسم ولي الأمر (بالعربية)`:`Parent Name (Arabic)`,` `,(0,v.jsx)(`span`,{style:{color:`var(--color-error)`},children:`*`})]}),(0,v.jsx)(`input`,{id:`parent-name-ar`,name:`name_ar`,type:`text`,className:`text-field`,value:B,onChange:e=>V(e.target.value),required:!0})]}),(0,v.jsxs)(`div`,{className:`form-group`,children:[(0,v.jsx)(`label`,{className:`form-label`,children:e===`ar`?`اسم ولي الأمر (بالانجليزية - اختياري)`:`Parent Name (English - Optional)`}),(0,v.jsx)(`input`,{id:`parent-name-en`,name:`name_en`,type:`text`,className:`text-field`,value:H,onChange:e=>U(e.target.value)})]}),(0,v.jsxs)(`div`,{className:`form-group`,children:[(0,v.jsxs)(`label`,{className:`form-label`,children:[e===`ar`?`الرقم الوطني`:`National ID`,` `,(0,v.jsx)(`span`,{style:{color:`var(--color-error)`},children:`*`})]}),(0,v.jsx)(`input`,{id:`parent-national-id`,name:`national_id`,type:`text`,className:`text-field`,value:K,onChange:e=>q(e.target.value),required:!0})]}),(0,v.jsxs)(`div`,{className:`form-group`,children:[(0,v.jsxs)(`label`,{className:`form-label`,children:[e===`ar`?`رقم الجوال`:`Phone Number`,` `,(0,v.jsx)(`span`,{style:{color:`var(--color-error)`},children:`*`})]}),(0,v.jsx)(`input`,{id:`parent-phone`,name:`phone`,type:`text`,className:`text-field`,value:W,onChange:e=>G(e.target.value),placeholder:`7XXXXXXXX`,required:!0})]})]}),(0,v.jsxs)(`footer`,{className:`modal-footer`,children:[(0,v.jsx)(`button`,{type:`button`,className:`btn-elevated`,onClick:()=>R(!1),style:{height:`48px`},disabled:F,children:t.cancel}),(0,v.jsx)(`button`,{type:`submit`,className:`btn-filled`,style:{height:`48px`,opacity:F?.7:1},disabled:F,children:F?e===`ar`?`جاري الحفظ...`:`Saving...`:t.submit})]})]})]})}),we&&(0,v.jsx)(`div`,{className:`modal-overlay no-print`,children:(0,v.jsxs)(`div`,{className:`modal-container`,style:{maxWidth:`500px`},children:[(0,v.jsxs)(`header`,{className:`modal-header`,children:[(0,v.jsxs)(`h3`,{className:`modal-title`,children:[`👨🏼‍💼 `,e===`ar`?`تعديل حساب ولي الأمر / إعادة تعيين كلمة المرور`:`Edit Parent / Reset Password`]}),(0,v.jsx)(`button`,{className:`modal-close-btn`,onClick:()=>{z(!1),Y(``)},children:(0,v.jsx)(h,{size:20,strokeWidth:2.5})})]}),(0,v.jsxs)(`form`,{onSubmit:ke,children:[(0,v.jsxs)(`div`,{className:`modal-body`,children:[J&&(0,v.jsx)(`div`,{style:{padding:`var(--space-md)`,backgroundColor:`rgba(220, 38, 38, 0.1)`,color:`var(--color-error)`,borderRadius:`var(--radius-chip)`,fontSize:`13px`,fontWeight:`600`,marginBottom:`12px`},children:J}),(0,v.jsxs)(`div`,{className:`form-group`,children:[(0,v.jsxs)(`label`,{className:`form-label`,children:[e===`ar`?`اسم ولي الأمر (بالعربية)`:`Parent Name (Arabic)`,` `,(0,v.jsx)(`span`,{style:{color:`var(--color-error)`},children:`*`})]}),(0,v.jsx)(`input`,{id:`edit-parent-name-ar`,name:`edit_name_ar`,type:`text`,className:`text-field`,value:B,onChange:e=>V(e.target.value),required:!0})]}),(0,v.jsxs)(`div`,{className:`form-group`,children:[(0,v.jsx)(`label`,{className:`form-label`,children:e===`ar`?`اسم ولي الأمر (بالانجليزية)`:`Parent Name (English)`}),(0,v.jsx)(`input`,{id:`edit-parent-name-en`,name:`edit_name_en`,type:`text`,className:`text-field`,value:H,onChange:e=>U(e.target.value)})]}),(0,v.jsxs)(`div`,{className:`form-group`,children:[(0,v.jsxs)(`label`,{className:`form-label`,children:[e===`ar`?`الرقم المدني / الوطني`:`Civil / National ID`,` `,(0,v.jsx)(`span`,{style:{color:`var(--color-error)`},children:`*`})]}),(0,v.jsx)(`input`,{id:`edit-parent-national-id`,name:`edit_national_id`,type:`text`,className:`text-field`,value:K,onChange:e=>q(e.target.value),required:!0})]}),(0,v.jsxs)(`div`,{className:`form-group`,children:[(0,v.jsxs)(`label`,{className:`form-label`,children:[e===`ar`?`رقم الجوال`:`Phone Number`,` `,(0,v.jsx)(`span`,{style:{color:`var(--color-error)`},children:`*`})]}),(0,v.jsx)(`input`,{id:`edit-parent-phone`,name:`edit_phone`,type:`text`,className:`text-field`,value:W,onChange:e=>G(e.target.value),placeholder:`7XXXXXXXX`,required:!0})]})]}),(0,v.jsxs)(`footer`,{className:`modal-footer`,children:[(0,v.jsx)(`button`,{type:`button`,className:`btn-elevated`,onClick:()=>z(!1),style:{height:`48px`},disabled:F,children:t.cancel}),(0,v.jsx)(`button`,{type:`submit`,className:`btn-filled`,style:{height:`48px`,opacity:F?.7:1},disabled:F,children:F?e===`ar`?`جاري الحفظ...`:`Saving...`:t.submit})]})]})]})}),xe&&(0,v.jsx)(`div`,{className:`modal-overlay no-print`,style:{zIndex:9999},children:(0,v.jsxs)(`div`,{className:`modal-container`,style:{maxWidth:`520px`},children:[(0,v.jsxs)(`header`,{className:`modal-header`,children:[(0,v.jsxs)(`h3`,{className:`modal-title`,style:{display:`flex`,alignItems:`center`,gap:`8px`},children:[(0,v.jsx)(g,{size:20,color:`#d97706`}),(0,v.jsx)(`span`,{children:e===`ar`?`طباعة كشوفات أولياء الأمور`:`Print Parents Rosters`})]}),(0,v.jsx)(`button`,{className:`modal-close-btn`,onClick:()=>D(!1),disabled:M,children:(0,v.jsx)(h,{size:20,strokeWidth:2.5})})]}),(0,v.jsxs)(`div`,{className:`modal-body`,style:{display:`flex`,flexDirection:`column`,gap:`16px`},children:[(0,v.jsxs)(`div`,{children:[(0,v.jsx)(`label`,{style:{display:`block`,fontSize:`13px`,fontWeight:`700`,marginBottom:`6px`,color:`var(--color-text-primary)`},children:e===`ar`?`اختر الصف والشعبة`:`Select Class & Section`}),(0,v.jsxs)(`select`,{value:O,onChange:e=>k(e.target.value),className:`text-field`,style:{width:`100%`,padding:`10px 12px`,borderRadius:`8px`,border:`1px solid var(--color-border)`,backgroundColor:`var(--color-surface)`},disabled:M,children:[(A===`all_with_id_count`||A===`all_with_id_children_details`)&&(0,v.jsx)(`option`,{value:`all`,children:e===`ar`?`جميع الصفوف (كامل المدرسة)`:`All Classes (Whole School)`}),E.map(e=>(0,v.jsxs)(`option`,{value:typeof e.id==`string`&&e.id.startsWith(`cls-`)?e.id.replace(`cls-`,``):e.numericId||e.id,children:[e.grade||e.name,` - `,e.section||e.section_ar||``]},e.id))]}),(A===`class_no_id`||A===`class_with_id`)&&O===`all`&&(0,v.jsx)(`span`,{style:{fontSize:`11px`,color:`#dc2626`,marginTop:`4px`,display:`block`},children:`* هذا الكشف يتطلب تحديد صف وشعبة معينة`})]}),(0,v.jsxs)(`div`,{children:[(0,v.jsx)(`label`,{style:{display:`block`,fontSize:`13px`,fontWeight:`700`,marginBottom:`8px`,color:`var(--color-text-primary)`},children:e===`ar`?`نوع الكشف المطلوب`:`Roster Type`}),(0,v.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`8px`},children:[(0,v.jsxs)(`label`,{onClick:()=>{if(j(`class_no_id`),(O===`all`||!O)&&E[0]?.id){let e=typeof E[0].id==`string`&&E[0].id.startsWith(`cls-`)?E[0].id.replace(`cls-`,``):E[0].numericId||E[0].id;k(String(e))}},style:{display:`flex`,alignItems:`center`,gap:`10px`,padding:`12px 14px`,borderRadius:`8px`,border:`1.5px solid ${A===`class_no_id`?`#d97706`:`var(--color-border)`}`,backgroundColor:A===`class_no_id`?`rgba(217, 119, 6, 0.05)`:`var(--color-surface)`,cursor:`pointer`},children:[(0,v.jsx)(`input`,{type:`radio`,name:`rosterType`,value:`class_no_id`,checked:A===`class_no_id`,onChange:()=>{if(j(`class_no_id`),(O===`all`||!O)&&E[0]?.id){let e=typeof E[0].id==`string`&&E[0].id.startsWith(`cls-`)?E[0].id.replace(`cls-`,``):E[0].numericId||E[0].id;k(String(e))}}}),(0,v.jsx)(`span`,{style:{fontSize:`13px`,fontWeight:A===`class_no_id`?`700`:`500`},children:e===`ar`?`كشف بأسماء أولياء الأمور لصف وشعبة محددة بدون الرقم الوطني`:`Class Parents Roster without National ID`})]}),(0,v.jsxs)(`label`,{onClick:()=>{if(j(`class_with_id`),(O===`all`||!O)&&E[0]?.id){let e=typeof E[0].id==`string`&&E[0].id.startsWith(`cls-`)?E[0].id.replace(`cls-`,``):E[0].numericId||E[0].id;k(String(e))}},style:{display:`flex`,alignItems:`center`,gap:`10px`,padding:`12px 14px`,borderRadius:`8px`,border:`1.5px solid ${A===`class_with_id`?`#d97706`:`var(--color-border)`}`,backgroundColor:A===`class_with_id`?`rgba(217, 119, 6, 0.05)`:`var(--color-surface)`,cursor:`pointer`},children:[(0,v.jsx)(`input`,{type:`radio`,name:`rosterType`,value:`class_with_id`,checked:A===`class_with_id`,onChange:()=>{if(j(`class_with_id`),(O===`all`||!O)&&E[0]?.id){let e=typeof E[0].id==`string`&&E[0].id.startsWith(`cls-`)?E[0].id.replace(`cls-`,``):E[0].numericId||E[0].id;k(String(e))}}}),(0,v.jsx)(`span`,{style:{fontSize:`13px`,fontWeight:A===`class_with_id`?`700`:`500`},children:e===`ar`?`كشف بأسماء أولياء الأمور لصف وشعبة محددة مع الرقم الوطني`:`Class Parents Roster with National ID`})]}),(0,v.jsxs)(`label`,{onClick:()=>j(`all_with_id_count`),style:{display:`flex`,alignItems:`center`,gap:`10px`,padding:`12px 14px`,borderRadius:`8px`,border:`1.5px solid ${A===`all_with_id_count`?`#d97706`:`var(--color-border)`}`,backgroundColor:A===`all_with_id_count`?`rgba(217, 119, 6, 0.05)`:`var(--color-surface)`,cursor:`pointer`},children:[(0,v.jsx)(`input`,{type:`radio`,name:`rosterType`,value:`all_with_id_count`,checked:A===`all_with_id_count`,onChange:()=>j(`all_with_id_count`)}),(0,v.jsx)(`span`,{style:{fontSize:`13px`,fontWeight:A===`all_with_id_count`?`700`:`500`},children:e===`ar`?`كشف بأسماء أولياء الأمور مع الرقم الوطني وعدد الأبناء`:`Parents Roster with National ID & Children Count`})]}),(0,v.jsxs)(`label`,{onClick:()=>j(`all_with_id_children_details`),style:{display:`flex`,alignItems:`center`,gap:`10px`,padding:`12px 14px`,borderRadius:`8px`,border:`1.5px solid ${A===`all_with_id_children_details`?`#d97706`:`var(--color-border)`}`,backgroundColor:A===`all_with_id_children_details`?`rgba(217, 119, 6, 0.05)`:`var(--color-surface)`,cursor:`pointer`},children:[(0,v.jsx)(`input`,{type:`radio`,name:`rosterType`,value:`all_with_id_children_details`,checked:A===`all_with_id_children_details`,onChange:()=>j(`all_with_id_children_details`)}),(0,v.jsx)(`span`,{style:{fontSize:`13px`,fontWeight:A===`all_with_id_children_details`?`700`:`500`},children:e===`ar`?`كشف بأسماء أولياء الأمور مع الرقم الوطني وعدد الأبناء وأسمائهم مع الصف والشعبة`:`Parents Roster with ID, Children Names & Classes`})]})]})]})]}),(0,v.jsxs)(`footer`,{className:`modal-footer`,style:{display:`flex`,justifyContent:`flex-start`,gap:`8px`},children:[(0,v.jsxs)(`button`,{type:`button`,className:`btn-filled`,onClick:Me,disabled:M||(A===`class_no_id`||A===`class_with_id`)&&(!O||O===`all`),style:{display:`flex`,alignItems:`center`,gap:`6px`,backgroundColor:`#d97706`,borderColor:`#d97706`,color:`#fff`,padding:`8px 20px`,opacity:(A===`class_no_id`||A===`class_with_id`)&&(!O||O===`all`)?.6:1},children:[(0,v.jsx)(g,{size:16}),(0,v.jsx)(`span`,{children:M?e===`ar`?`جاري تجهيز الكشف...`:`Preparing...`:e===`ar`?`طباعة`:`Print`})]}),(0,v.jsx)(`button`,{type:`button`,className:`btn-elevated`,onClick:()=>D(!1),disabled:M,children:t.cancel})]})]})}),X&&(0,v.jsx)(`div`,{className:`modal-overlay no-print`,children:(0,v.jsxs)(`div`,{className:`modal-container`,style:{maxWidth:`480px`},children:[(0,v.jsxs)(`header`,{className:`modal-header`,children:[(0,v.jsxs)(`h3`,{className:`modal-title`,children:[`🔑 `,e===`ar`?`إعادة تعيين كلمة مرور ولي الأمر`:`Reset Parent Password`]}),(0,v.jsx)(`button`,{className:`modal-close-btn`,onClick:()=>Z(null),children:(0,v.jsx)(h,{size:20,strokeWidth:2.5})})]}),(0,v.jsxs)(`div`,{className:`modal-body`,style:{display:`flex`,flexDirection:`column`,gap:`16px`},children:[(0,v.jsxs)(`div`,{style:{background:`var(--color-bg-secondary, #f8fafc)`,padding:`14px 16px`,borderRadius:`12px`,border:`1px solid rgba(0,0,0,0.06)`},children:[(0,v.jsx)(`div`,{style:{fontWeight:`700`,fontSize:`15px`,color:`var(--color-text-primary)`},children:X.name}),(0,v.jsxs)(`div`,{style:{fontSize:`13px`,color:`var(--color-text-secondary)`,marginTop:`6px`,display:`flex`,gap:`16px`,flexWrap:`wrap`},children:[(0,v.jsxs)(`span`,{children:[`🆔 `,X.nationalId]}),(0,v.jsxs)(`span`,{children:[`📱 `,X.phone||`غير مسجل`]})]})]}),(0,v.jsx)(`p`,{style:{margin:0,fontSize:`13px`,color:`var(--color-text-secondary)`,lineHeight:`1.6`},children:e===`ar`?`اختر خيار إعادة تعيين كلمة المرور المطلوب لحساب ولي الأمر ليتمكن من الدخول إلى التطبيق:`:`Select the reset option for this parent account to enable mobile app login:`}),(0,v.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`10px`},children:[(0,v.jsxs)(`button`,{type:`button`,className:`btn-filled`,style:{display:`flex`,alignItems:`center`,justifyContent:`space-between`,padding:`14px 18px`,borderRadius:`12px`,backgroundColor:`#062A5A`,color:`#ffffff`,cursor:Q?`wait`:`pointer`},disabled:Q,onClick:()=>$(`default`),children:[(0,v.jsxs)(`div`,{style:{textAlign:`start`},children:[(0,v.jsx)(`div`,{style:{fontWeight:`700`,fontSize:`14px`},children:e===`ar`?`تصفير إلى الرمز الافتراضي (12345678)`:`Reset to Default (12345678)`}),(0,v.jsx)(`div`,{style:{fontSize:`11px`,opacity:.85,marginTop:`2px`},children:e===`ar`?`الرمز الموحد الأساسي لجميع أولياء الأمور`:`Standard default code for all parents`})]}),(0,v.jsx)(`span`,{style:{fontSize:`18px`},children:`⚡`})]}),(0,v.jsxs)(`button`,{type:`button`,className:`btn-elevated`,style:{display:`flex`,alignItems:`center`,justifyContent:`space-between`,padding:`14px 18px`,borderRadius:`12px`,border:`1px solid #2563eb`,color:`#2563eb`,background:`rgba(37, 99, 235, 0.05)`,cursor:Q?`wait`:`pointer`,opacity:X.phone?1:.5},disabled:Q||!X.phone,onClick:()=>$(`phone`),children:[(0,v.jsxs)(`div`,{style:{textAlign:`start`},children:[(0,v.jsx)(`div`,{style:{fontWeight:`700`,fontSize:`14px`},children:e===`ar`?`تصفير إلى رقم الجوال (${X.phone||`غير متوفر`})`:`Reset to Phone (${X.phone||`N/A`})`}),(0,v.jsx)(`div`,{style:{fontSize:`11px`,opacity:.85,marginTop:`2px`},children:e===`ar`?`يجعل كلمة المرور مطابقة لرقم هاتف ولي الأمر`:`Sets password to match parent phone number`})]}),(0,v.jsx)(`span`,{style:{fontSize:`18px`},children:`📱`})]})]})]}),(0,v.jsx)(`footer`,{className:`modal-footer`,children:(0,v.jsx)(`button`,{type:`button`,className:`btn-elevated`,onClick:()=>Z(null),disabled:Q,children:t.cancel})})]})})]})}function b(){return(0,v.jsx)(y,{})}export{b as default};