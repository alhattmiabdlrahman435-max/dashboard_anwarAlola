import{d as e,l as t,n,o as r}from"./AppContext-CD8AsBQ3.js";import{n as i,t as a}from"./PaginationBar-DTODdKE1.js";import{t as o}from"./circle-alert-T359c4FY.js";import{t as s}from"./clock-DelSlNo-.js";import{t as ee}from"./copy-vUfBMcVa.js";import{t as te}from"./funnel-DUlZ4sQW.js";import{t as ne}from"./plus-D-BEs0sS.js";import{t as re}from"./search-CxhINv86.js";import{t as ie}from"./trash-2-C7uBshQa.js";import{t as c}from"./user-CfWxPEhm.js";import{C as l,O as ae,S as u,b as oe,f as se,i as d,j as ce,r as le,t as ue,u as f,w as de}from"./index-jSvUtwsV.js";var fe=l(`arrow-left-right`,[[`path`,{d:`M8 3 4 7l4 4`,key:`9rb6wj`}],[`path`,{d:`M4 7h16`,key:`6tx8e3`}],[`path`,{d:`m16 21 4-4-4-4`,key:`siv7j2`}],[`path`,{d:`M20 17H4`,key:`h6l3hr`}]]),pe=l(`check-check`,[[`path`,{d:`M18 6 7 17l-5-5`,key:`116fxf`}],[`path`,{d:`m22 10-7.5 7.5L13 16`,key:`ke71qq`}]]),me=l(`check`,[[`path`,{d:`M20 6 9 17l-5-5`,key:`1gmf2c`}]]),he=l(`circle-check`,[[`circle`,{cx:`12`,cy:`12`,r:`10`,key:`1mglay`}],[`path`,{d:`m9 12 2 2 4-4`,key:`dzmm74`}]]),ge=l(`info`,[[`circle`,{cx:`12`,cy:`12`,r:`10`,key:`1mglay`}],[`path`,{d:`M12 16v-4`,key:`1dtifu`}],[`path`,{d:`M12 8h.01`,key:`e9boi3`}]]),p=l(`layers`,[[`path`,{d:`M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z`,key:`zw3jo`}],[`path`,{d:`M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12`,key:`1wduqc`}],[`path`,{d:`M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17`,key:`kqbvx6`}]]),_e=l(`send`,[[`path`,{d:`M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z`,key:`1ffxy3`}],[`path`,{d:`m21.854 2.147-10.94 10.939`,key:`12cjpa`}]]),m=l(`sparkles`,[[`path`,{d:`M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z`,key:`1s2grr`}],[`path`,{d:`M20 2v4`,key:`1rf3ol`}],[`path`,{d:`M22 4h-4`,key:`gwowj6`}],[`circle`,{cx:`4`,cy:`20`,r:`2`,key:`6kqj1y`}]]),ve=l(`volume-2`,[[`path`,{d:`M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z`,key:`uqj9uw`}],[`path`,{d:`M16 9a5 5 0 0 1 0 6`,key:`1q6k2b`}],[`path`,{d:`M19.364 18.364a9 9 0 0 0 0-12.728`,key:`ijwkga`}]]),h=e(t(),1),g=r();function _(){let{lang:e,t,triggerConfirm:r,canAction:l,setToastMessage:_}=n(),{classes:v,availableGrades:y,fetchClasses:ye}=ce(),{notifications:b,notificationsPagination:x,handleSendNotification:be,handleMarkNotificationAsRead:S,handleDeleteNotification:xe,handleDeleteAllNotifications:Se,fetchNotifications:Ce,loading:we}=ae(),{students:C,fetchStudents:Te}=ue(),{teachers:w,fetchTeachers:Ee}=de(),{page:T,perPage:E,search:D,setPage:O,setPerPage:De,setSearch:Oe}=i({moduleKey:`notifications`}),[k,A]=(0,h.useState)(`all`),[ke,j]=(0,h.useState)(!1),[M,Ae]=(0,h.useState)(``),[je,Me]=(0,h.useState)(null),Ne=(0,h.useMemo)(()=>{let e=new URLSearchParams;return e.set(`page`,T),e.set(`per_page`,E),D&&e.set(`search`,D),M&&e.set(`date`,M),k===`parents`?e.set(`target_type`,`all_parents`):k===`teachers`?e.set(`target_type`,`all_teachers`):k===`classes`?e.set(`target_type`,`by_class`):k===`private`&&e.set(`target_type`,`by_student`),`?`+e.toString()},[T,E,D,M,k]);(0,h.useEffect)(()=>{Ce(Ne)},[Ce,Ne]),(0,h.useEffect)(()=>{ye(),Te(`?per_page=1000`),Ee(`?per_page=1000`)},[ye,Te,Ee]);let[N,P]=(0,h.useState)(`parents`),F=(0,h.useMemo)(()=>v&&v.length>0?v.map(e=>e.name||`${e.grade} - ${e.section}`):y||[],[v,y]),[I,L]=(0,h.useState)(``),[R,z]=(0,h.useState)(``),[B,V]=(0,h.useState)(``),[H,U]=(0,h.useState)(``),[W,G]=(0,h.useState)(``),[Pe,Fe]=(0,h.useState)(``),[Ie,Le]=(0,h.useState)(``),Re=F.includes(R)?R:F.length>0?F[0]:``,K=Array.isArray(C)&&C.some(e=>String(e.id)===String(I))?I:C&&C.length>0?C[0].id:``,q=Array.isArray(w)&&w.some(e=>String(e.id)===String(B))?B:w&&w.length>0?w[0].id:``,ze=(t,n)=>{t.stopPropagation(),r({title:e===`ar`?`حذف الإشعار`:`Delete Notification`,message:e===`ar`?`هل أنت متأكد من حذف هذا الإشعار نهائياً؟`:`Are you sure you want to permanently delete this notification?`,onConfirm:()=>{xe(n)}})},Be=()=>{r({title:e===`ar`?`حذف جميع الإشعارات`:`Delete All Notifications`,message:e===`ar`?`هل أنت متأكد من حذف جميع الإشعارات نهائياً؟ هذا الإجراء لا يمكن التراجع عنه!`:`Are you sure you want to delete all notifications permanently? This action cannot be undone!`,onConfirm:()=>{Se()}})},Ve=(t,n)=>{t.stopPropagation();let r=`${n.title}\n${n.content}`;navigator.clipboard.writeText(r),Me(n.id),_&&_(e===`ar`?`تم نسخ نص الإشعار بنجاح`:`Notification content copied`),setTimeout(()=>Me(null),2e3)},J=t=>{t===`absence`?(U(e===`ar`?`تنبيه غياب وتأخر دراسي`:`Absence & Attendance Alert`),G(e===`ar`?`نود إحاطتكم بحضور ومواظبة الطالب/الطالبة، نرجو المتابعة الحثيثة والتواصل مع إدارة المدرسة لضمان التفوق.`:`We would like to inform you regarding student attendance. Please follow up with school administration.`)):t===`exam`?(U(e===`ar`?`إعلان جدول الاختبارات النهائية`:`Final Exam Schedule Announcement`),G(e===`ar`?`تم اعتماد ونشر جدول الاختبارات التقييمية. نرجو الحرص على مراجعة المقررات والالتزام بالحضور في المواعيد المحددة.`:`The evaluation exam schedule has been published. Please ensure thorough revision and timely attendance.`)):t===`parents_meeting`?(U(e===`ar`?`دعوة لاجتماع أولياء الأمور الدوري`:`Parents-Teachers Meeting Invitation`),G(e===`ar`?`يسر إدارة المدرسة دعوتكم لحضور الاجتماع الدوري لمناقشة المستوى الأكاديمي والتربوي لأبنائنا الطلاب يوم الخميس القادم.`:`You are cordially invited to attend the periodic parents meeting next Thursday.`)):t===`general_announcement`&&(U(e===`ar`?`تعميم إداري هام للجميع`:`Important School Announcement`),G(e===`ar`?`تود إدارة رياض ومدارس أنوار العلى الدولية تذكير جميع الطلاب وأولياء الأمور بالتعليمات والأنشطة القادمة.`:`Anwar Al-Ola Int. Model Schools would like to remind all students & parents of upcoming activities.`))},He=t=>{if(t.preventDefault(),!H.trim()||!W.trim())return;let n=new Date().toISOString().replace(`T`,` `).substring(0,16),r={};if(N===`student`){let e=C.find(e=>e.id===Number(K));r={studentId:Number(K),studentName:e?e.name:null,studentNameEn:e?e.nameEn:null,grade:e?e.grade:null}}else if(N===`class`)r={grade:Re};else if(N===`teacher`){let e=w.find(e=>e.id===Number(q));r={teacherId:Number(q),teacherName:e?e.name:null,teacherNameEn:e?e.nameEn:null}}let i={id:Date.now(),title:H,content:W,date:n,type:N,...r},a=[];if(N===`student`){let t=C.find(e=>e.id===Number(K));if(t){let r=e===`ar`?`تنبيه خاص بخصوص ابنكم ${t.name}: ${H} - ${W}. رياض و مدارس انوار العلى.`:`Private alert for ${t.nameEn}: ${H} - ${W}. Riyadh & Anwar Al-Ola.`;a.push({id:Date.now(),studentId:t.id,recipient:t.phone,text:r,time:n.split(` `)[1],type:`present`})}}else N===`class`?C.filter(e=>e.grade===R).forEach((t,r)=>{let i=e===`ar`?`تعميم لصف ${R}: ${H} - ${W}.`:`Class announcement for ${R}: ${H} - ${W}.`;a.push({id:Date.now()+Math.random()+r,studentId:t.id,recipient:t.phone,text:i,time:n.split(` `)[1],type:`present`})}):N===`parents`&&C.forEach((t,r)=>{let i=e===`ar`?`إشعار عام من المدرسة لأولياء الأمور: ${H} - ${W}.`:`Broadcast Announcement to Parents: ${H} - ${W}.`;a.push({id:Date.now()+Math.random()+r,studentId:t.id,recipient:t.phone,text:i,time:n.split(` `)[1],type:`present`})});be(i,a),j(!1),U(``),G(``),Fe(``),Le(``)},Ue=(0,h.useCallback)(t=>t.type===`attendance`?{name:e===`ar`?`مشرف التحضير`:`Prep Supervisor`,key:`supervisor`}:{name:e===`ar`?`إدارة المدرسة`:`School Administration`,key:`admin`},[e]),Y=(0,h.useCallback)(t=>{if(!t)return``;try{let n=new Date(t.replace(` `,`T`));if(isNaN(n.getTime())&&(n=new Date(t)),isNaN(n.getTime()))return t;let r=n.getFullYear(),i=String(n.getMonth()+1).padStart(2,`0`),a=String(n.getDate()).padStart(2,`0`),o=n.getHours(),s=String(n.getMinutes()).padStart(2,`0`),ee=o>=12?e===`ar`?`م`:`PM`:e===`ar`?`ص`:`AM`;return o%=12,o||=12,`${r}-${i}-${a} ${String(o).padStart(2,`0`)}:${s} ${ee}`}catch{return t}},[e]),We=(0,h.useCallback)(t=>{if(!t)return``;try{let n=new Date(t.replace(` `,`T`)),r=new Date-n,i=Math.floor(r/(1e3*60)),a=Math.floor(r/(1e3*60*60)),o=Math.floor(r/(1e3*60*60*24));return i<2?e===`ar`?`الآن`:`Just now`:i<60?e===`ar`?`منذ ${i} دقيقة`:`${i}m ago`:a<24?e===`ar`?`منذ ${a} ساعة`:`${a}h ago`:o===1?e===`ar`?`أمس`:`Yesterday`:o<7?e===`ar`?`منذ ${o} أيام`:`${o}d ago`:Y(t)}catch{return t}},[e,Y]),X=(0,h.useCallback)(t=>{if(!t)return e===`ar`?`الصف الدراسي`:`Class`;let n=t.grade||t.class_name||t.className||t.grade_name||t.gradeName;if(n&&n!==`null`&&n!==`NULL`&&n!==`undefined`)return n;if(t.studentId){let e=C.find(e=>e.id===Number(t.studentId));if(e){let t=e.grade||e.class_name||e.grade_name;if(t&&t!==`null`&&t!==`NULL`&&t!==`undefined`)return t}}let r=`${t.title||``} ${t.content||``}`.match(/(?:للفصل|فصل|الصف)\s+([^\s:,.-]+(?:\s*[-–]\s*[^\s:,.-]+)?)/);return r&&r[1]&&!r[1].includes(`العام`)&&!r[1].includes(`ابنكم`)?r[1].trim():e===`ar`?`الصف الدراسي`:`Class`},[e,C]),Ge=x.total||b.length,Ke=(0,h.useMemo)(()=>b.filter(e=>e.type===`general`||e.type===`all_users`).length,[b]),qe=(0,h.useMemo)(()=>b.filter(e=>e.type===`parents`||e.type===`broadcast_parents`).length,[b]),Je=(0,h.useMemo)(()=>b.filter(e=>e.type===`teachers`||e.type===`broadcast_teachers`).length,[b]),Ye=(0,h.useMemo)(()=>b.filter(e=>e.type===`class`||e.type===`student`||e.type===`private`||e.type===`teacher`).length,[b]),Xe=(0,h.useCallback)(t=>{let n=t.type,r=X(t);if(n===`general`||n===`all_users`)return e===`ar`?`جميع المستخدمين (معلمين وأولياء أمور)`:`All Users (Teachers & Parents)`;if(n===`parents`||n===`broadcast_parents`)return e===`ar`?`جميع أولياء الأمور`:`All Parents`;if(n===`teachers`||n===`broadcast_teachers`)return e===`ar`?`جميع المعلمين`:`All Teachers`;if(n===`class`)return e===`ar`?`الصف: ${r}`:`Class: ${r}`;if(n===`student`||n===`private`){let n=C.find(e=>String(e.id)===String(t.studentId)),r=t.studentName||(n?n.name||n.name_ar||n.name_en:null);return r?e===`ar`?`الطالب: ${r}`:`Student: ${r}`:t.studentId?e===`ar`?`الطالب (رقم #${t.studentId})`:`Student (#${t.studentId})`:e===`ar`?`طالب مخصص`:`Student`}if(n===`teacher`){let n=w.find(e=>String(e.id)===String(t.teacherId)),r=t.teacherName||(n?n.name||n.name_ar||n.name_en:null);return r?e===`ar`?`المعلم: ${r}`:`Teacher: ${r}`:t.teacherId?e===`ar`?`المعلم (رقم #${t.teacherId})`:`Teacher (#${t.teacherId})`:e===`ar`?`معلم مخصص`:`Teacher`}return e===`ar`?`عام`:`General`},[e,X,C,w]),Z=(0,h.useMemo)(()=>b.filter(e=>M&&e.date&&!e.date.substring(0,10).startsWith(M)?!1:k===`all_users`?e.type===`general`||e.type===`all_users`:k===`parents`?e.type===`parents`||e.type===`broadcast_parents`||e.type===`general`||e.type===`broadcast`:k===`teachers`?e.type===`teachers`||e.type===`broadcast_teachers`||e.type===`general`||e.type===`broadcast`:k===`classes`?e.type===`class`:k===`private`?e.type===`student`||e.type===`private`||e.type===`teacher`:!0),[b,M,k]),Ze=(0,h.useMemo)(()=>b.filter(e=>!e.isRead).length,[b]),Qe=(t,n,r,i,a)=>{let o=t.type,s=X(t);if(o===`general`||o===`parents`||o===`broadcast_parents`)return{label:e===`ar`?`تعميم عام لأولياء الأمور`:`All Parents Broadcast`,bgGlow:`rgba(30, 80, 142, 0.08)`,borderColor:`var(--color-primary-ui)`,textColor:`var(--color-primary-ui)`,icon:(0,g.jsx)(d,{size:16})};if(o===`class`||o===`assignment`||o===`homework`)return{label:e===`ar`?`الصف: ${s}`:`Class: ${s}`,bgGlow:`rgba(217, 119, 6, 0.08)`,borderColor:`#d97706`,textColor:`#b45309`,icon:(0,g.jsx)(p,{size:16})};if(o===`student`||o===`private`){let t=e===`ar`?n||`طالب مخصص`:r||n||`Private Student`;return{label:s!==`الصف الدراسي`&&s!==`Class`?e===`ar`?`طالب (${s}): ${t}`:`Student (${s}): ${t}`:e===`ar`?`طالب: ${t}`:`Student: ${t}`,bgGlow:`rgba(225, 29, 72, 0.08)`,borderColor:`#e11d48`,textColor:`#be123c`,icon:(0,g.jsx)(f,{size:16})}}else if(o===`teachers`||o===`broadcast_teachers`)return{label:e===`ar`?`تعميم لجميع المعلمين`:`All Teachers Broadcast`,bgGlow:`rgba(16, 185, 129, 0.08)`,borderColor:`#10b981`,textColor:`#047857`,icon:(0,g.jsx)(d,{size:16})};else if(o===`teacher`){let t=e===`ar`?i||`معلم مخصص`:a||i||`Teacher`;return{label:e===`ar`?`المعلم: ${t}`:`Teacher: ${t}`,bgGlow:`rgba(15, 118, 110, 0.08)`,borderColor:`#0f766e`,textColor:`#0f766e`,icon:(0,g.jsx)(c,{size:16})}}return{label:(t.title&&t.title.includes(`واجب`)||t.content&&t.content.includes(`واجب`),e===`ar`?`الصف: ${s}`:`Class: ${s}`),bgGlow:`rgba(100, 116, 139, 0.08)`,borderColor:`#64748b`,textColor:`#475569`,icon:(0,g.jsx)(u,{size:16})}},Q=(Pe||``).toLowerCase().trim(),$e=Array.isArray(C)?Q?C.filter(e=>{if(!e)return!1;let t=!!(e.name?.toString().toLowerCase().includes(Q)||e.nameEn?.toString().toLowerCase().includes(Q)),n=!!e.id?.toString().includes(Q),r=!!(e.student_number||e.studentNumber||e.academic_number||e.national_id||e.code)?.toString().toLowerCase().includes(Q);return t||n||r}):C:[],$=(Ie||``).toLowerCase().trim(),et=Array.isArray(w)?$?w.filter(e=>{if(!e)return!1;let t=!!(e.name?.toString().toLowerCase().includes($)||e.nameEn?.toString().toLowerCase().includes($)),n=!!e.id?.toString().includes($),r=!!(e.jobId||e.job_number||e.job_no)?.toString().toLowerCase().includes($);return t||n||r}):w:[];return(0,g.jsxs)(`div`,{className:`notif-command-center`,children:[(0,g.jsx)(`style`,{children:`
        .notif-command-center {
          display: flex;
          flex-direction: column;
          gap: 20px;
          animation: notifFadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes notifFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* 1. Header Banner */
        .notif-banner-modern {
          background: linear-gradient(135deg, rgba(30, 80, 142, 0.06) 0%, var(--color-surface-alt) 100%);
          border: 1.5px solid rgba(30, 80, 142, 0.18);
          border-radius: 20px;
          padding: 18px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
        }

        .notif-banner-info-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .notif-banner-icon {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          background: var(--gradient-brand);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6px 16px rgba(30, 80, 142, 0.25);
          flex-shrink: 0;
        }

        .notif-banner-text h3 {
          font-size: 15px;
          font-weight: 800;
          color: var(--color-text-primary);
          margin: 0;
          line-height: 1.3;
        }

        .notif-banner-text p {
          font-size: 12.5px;
          color: var(--color-text-secondary);
          margin-top: 2px;
          margin-bottom: 0;
          font-weight: 500;
        }

        /* 2. KPI Stats Cards Grid */
        .notif-stats-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 14px;
        }

        @media (max-width: 1200px) {
          .notif-stats-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 640px) {
          .notif-stats-grid {
            grid-template-columns: 1fr;
          }
        }

        .notif-stat-card {
          background: var(--color-surface-alt);
          border: 1.5px solid var(--color-border);
          border-radius: 20px;
          padding: 20px 22px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
          position: relative;
          overflow: hidden;
        }

        .notif-stat-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
          border-color: var(--color-primary-ui);
        }

        .notif-stat-content {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .notif-stat-number {
          font-size: 32px;
          font-weight: 900;
          color: var(--color-text-primary);
          line-height: 1;
          letter-spacing: -0.5px;
        }

        .notif-stat-label {
          font-size: 12.5px;
          font-weight: 700;
          color: var(--color-text-secondary);
          margin-top: 4px;
        }

        .notif-stat-icon-wrapper {
          width: 52px;
          height: 52px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
          flex-shrink: 0;
        }

        /* 3. Control Toolbar */
        .notif-toolbar-container {
          background: var(--color-surface-alt);
          border: 1.5px solid var(--color-border);
          border-radius: 20px;
          padding: 14px 18px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .notif-toolbar-top-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .notif-search-box {
          position: relative;
          min-width: 280px;
          flex-grow: 1;
          max-width: 440px;
        }

        .notif-search-box input {
          width: 100%;
          padding: 10px 42px 10px 16px;
          border-radius: 12px;
          border: 1.5px solid var(--color-border);
          background: var(--color-surface);
          color: var(--color-text-primary);
          font-size: 13px;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        body[dir="ltr"] .notif-search-box input {
          padding: 10px 16px 10px 42px;
        }

        .notif-search-box input:focus {
          border-color: var(--color-primary-ui);
          box-shadow: 0 0 0 3px rgba(30, 80, 142, 0.12);
          outline: none;
        }

        .notif-search-icon {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          right: 14px;
          color: var(--color-text-secondary);
        }

        body[dir="ltr"] .notif-search-icon {
          right: auto;
          left: 14px;
        }

        .notif-filter-chips {
          display: flex;
          align-items: center;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 2px;
        }

        .notif-chip-btn {
          border: 1.5px solid var(--color-border);
          background: var(--color-surface);
          color: var(--color-text-secondary);
          padding: 8px 16px;
          border-radius: 14px;
          font-size: 12.5px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s ease;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
        }

        .notif-chip-btn:hover {
          color: var(--color-text-primary);
          border-color: var(--color-primary-ui);
        }

        .notif-chip-btn.active {
          background: var(--color-primary-ui);
          color: white;
          border-color: var(--color-primary-ui);
          box-shadow: 0 4px 14px rgba(30, 80, 142, 0.25);
        }

        .notif-chip-counter {
          font-size: 10.5px;
          padding: 1px 7px;
          border-radius: 10px;
          background: rgba(0, 0, 0, 0.12);
          color: inherit;
        }

        /* 4. Notification Cards Feed */
        .notif-feed-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .notif-card-modern {
          background: var(--color-surface-alt);
          border: 1.5px solid var(--color-border);
          border-radius: 18px;
          padding: 20px 22px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
        }

        .notif-card-modern.unread {
          background: linear-gradient(135deg, rgba(30, 80, 142, 0.04) 0%, var(--color-surface-alt) 100%);
          border-color: rgba(30, 80, 142, 0.35);
          box-shadow: 0 4px 18px rgba(30, 80, 142, 0.07);
        }

        .notif-card-modern:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(0, 0, 0, 0.06);
          border-color: rgba(30, 80, 142, 0.45);
        }

        .notif-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
        }

        .notif-card-title-area {
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }

        .notif-card-avatar {
          width: 46px;
          height: 46px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .notif-card-title {
          font-size: 15.5px;
          font-weight: 800;
          color: var(--color-text-primary);
          line-height: 1.35;
          margin: 0;
        }

        .notif-card-meta {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 4px;
          flex-wrap: wrap;
        }

        .notif-card-body {
          font-size: 13.5px;
          line-height: 1.65;
          color: var(--color-text-secondary);
          font-weight: 500;
          white-space: pre-line;
          margin: 0;
        }

        .notif-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 14px;
          border-top: 1px dashed var(--color-border);
          font-size: 12px;
          color: var(--color-text-secondary);
          font-weight: 600;
        }

        .notif-action-btn-group {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .notif-icon-btn {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          border: 1px solid var(--color-border);
          background: var(--color-surface);
          color: var(--color-text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .notif-icon-btn:hover {
          color: var(--color-primary-ui);
          border-color: var(--color-primary-ui);
          background: rgba(30, 80, 142, 0.08);
        }

        .notif-icon-btn.danger:hover {
          color: #ef4444;
          border-color: #ef4444;
          background: rgba(239, 68, 68, 0.08);
        }

        /* Preset Chips Modal */
        .preset-templates-container {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 4px;
        }

        .preset-template-chip {
          padding: 7px 14px;
          border-radius: 12px;
          border: 1.5px solid var(--color-border);
          background: var(--color-surface);
          color: var(--color-text-primary);
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.15s ease;
        }

        .preset-template-chip:hover {
          background: rgba(30, 80, 142, 0.08);
          border-color: var(--color-primary-ui);
          color: var(--color-primary-ui);
        }
      `}),(0,g.jsxs)(`div`,{className:`notif-banner-modern no-print`,children:[(0,g.jsxs)(`div`,{className:`notif-banner-info-left`,children:[(0,g.jsx)(`div`,{className:`notif-banner-icon`,children:(0,g.jsx)(ge,{size:24})}),(0,g.jsxs)(`div`,{className:`notif-banner-text`,children:[(0,g.jsx)(`h3`,{children:e===`ar`?`منصة الاتصالات والإشعارات الموحدة`:`Unified Communications & Alerts Platform`}),(0,g.jsx)(`p`,{children:e===`ar`?`تتيح لك إرسال التنبيهات الفورية الفعالة والتعاميم المباشرة لفئات مختلفة في المدرسة مع تتبع فوري لحالة التسليم.`:`Send instant broadcast notifications and targeted alerts to students, parents, and teachers with live delivery status.`})]})]}),Ze>0&&(0,g.jsxs)(`button`,{onClick:()=>{b.filter(e=>!e.isRead).forEach(e=>S(e.id))},style:{height:`38px`,padding:`0 14px`,borderRadius:`10px`,fontSize:`12px`,fontWeight:`700`,border:`1px solid var(--color-border)`,background:`var(--color-surface)`,color:`var(--color-primary-ui)`,cursor:`pointer`,display:`flex`,alignItems:`center`,gap:`6px`,whiteSpace:`nowrap`},children:[(0,g.jsx)(pe,{size:16}),(0,g.jsx)(`span`,{children:e===`ar`?`تحديد الكل كمقروء`:`Mark All Read`})]})]}),(0,g.jsxs)(`div`,{className:`notif-stats-grid`,children:[(0,g.jsxs)(`div`,{className:`notif-stat-card`,children:[(0,g.jsxs)(`div`,{className:`notif-stat-content`,children:[(0,g.jsx)(`span`,{className:`notif-stat-number`,children:Ge}),(0,g.jsx)(`span`,{className:`notif-stat-label`,children:e===`ar`?`إجمالي الإشعارات`:`Total Notifications`})]}),(0,g.jsx)(`div`,{className:`notif-stat-icon-wrapper`,style:{background:`linear-gradient(135deg, #1e508e 0%, #103058 100%)`},children:(0,g.jsx)(u,{size:22})})]}),(0,g.jsxs)(`div`,{className:`notif-stat-card`,children:[(0,g.jsxs)(`div`,{className:`notif-stat-content`,children:[(0,g.jsx)(`span`,{className:`notif-stat-number`,children:Ke}),(0,g.jsx)(`span`,{className:`notif-stat-label`,children:e===`ar`?`جميع المستخدمين`:`All Users`})]}),(0,g.jsx)(`div`,{className:`notif-stat-icon-wrapper`,style:{background:`linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)`},children:(0,g.jsx)(m,{size:22})})]}),(0,g.jsxs)(`div`,{className:`notif-stat-card`,children:[(0,g.jsxs)(`div`,{className:`notif-stat-content`,children:[(0,g.jsx)(`span`,{className:`notif-stat-number`,children:qe}),(0,g.jsx)(`span`,{className:`notif-stat-label`,children:e===`ar`?`تعاميم أولياء الأمور`:`Parents Broadcasts`})]}),(0,g.jsx)(`div`,{className:`notif-stat-icon-wrapper`,style:{background:`linear-gradient(135deg, #0284c7 0%, #0369a1 100%)`},children:(0,g.jsx)(d,{size:22})})]}),(0,g.jsxs)(`div`,{className:`notif-stat-card`,children:[(0,g.jsxs)(`div`,{className:`notif-stat-content`,children:[(0,g.jsx)(`span`,{className:`notif-stat-number`,children:Je}),(0,g.jsx)(`span`,{className:`notif-stat-label`,children:e===`ar`?`تعاميم المعلمين`:`Teachers Broadcasts`})]}),(0,g.jsx)(`div`,{className:`notif-stat-icon-wrapper`,style:{background:`linear-gradient(135deg, #10b981 0%, #047857 100%)`},children:(0,g.jsx)(c,{size:22})})]}),(0,g.jsxs)(`div`,{className:`notif-stat-card`,children:[(0,g.jsxs)(`div`,{className:`notif-stat-content`,children:[(0,g.jsx)(`span`,{className:`notif-stat-number`,children:Ye}),(0,g.jsx)(`span`,{className:`notif-stat-label`,children:e===`ar`?`الفصول والتنبيهات الفردية`:`Classes & Private`})]}),(0,g.jsx)(`div`,{className:`notif-stat-icon-wrapper`,style:{background:`linear-gradient(135deg, #d97706 0%, #b45309 100%)`},children:(0,g.jsx)(p,{size:22})})]})]}),(0,g.jsxs)(`div`,{className:`notif-toolbar-container no-print`,children:[(0,g.jsxs)(`div`,{className:`notif-toolbar-top-row`,children:[(0,g.jsxs)(`div`,{className:`notif-search-box`,children:[(0,g.jsx)(re,{size:16,className:`notif-search-icon`}),(0,g.jsx)(`input`,{type:`text`,placeholder:e===`ar`?`البحث في سجل الإشعارات المرسلة...`:`Search notifications history...`,value:D||``,onChange:e=>Oe(e.target.value)})]}),(0,g.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`10px`,flexWrap:`wrap`},children:[(0,g.jsxs)(`div`,{style:{position:`relative`,display:`flex`,alignItems:`center`,gap:`6px`},children:[(0,g.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`6px`,backgroundColor:`var(--color-surface)`,border:`1.5px solid var(--color-border)`,borderRadius:`12px`,padding:`0 10px`,height:`42px`},children:[(0,g.jsx)(te,{size:15,style:{color:`var(--color-primary-ui)`}}),(0,g.jsx)(oe,{size:15,style:{color:`var(--color-text-secondary)`}}),(0,g.jsx)(`input`,{type:`date`,style:{border:`none`,background:`transparent`,color:`var(--color-text-primary)`,fontSize:`12.5px`,fontWeight:`600`,outline:`none`,fontFamily:`inherit`},value:M,onChange:e=>{Ae(e.target.value),O(1)},title:e===`ar`?`تصفية حسب التاريخ`:`Filter by Date`})]}),M&&(0,g.jsx)(`button`,{type:`button`,onClick:()=>{Ae(``),O(1)},style:{position:`absolute`,left:e===`ar`?`8px`:`auto`,right:e===`ar`?`auto`:`8px`,background:`transparent`,border:`none`,color:`var(--color-text-secondary)`,cursor:`pointer`},children:(0,g.jsx)(le,{size:14})})]}),l(`communications`,`delete`)&&b.length>0&&(0,g.jsxs)(`button`,{onClick:Be,style:{height:`42px`,padding:`0 16px`,borderRadius:`12px`,border:`1.5px solid rgba(239, 68, 68, 0.3)`,backgroundColor:`rgba(239, 68, 68, 0.06)`,color:`#ef4444`,fontSize:`12.5px`,fontWeight:`800`,cursor:`pointer`,display:`flex`,alignItems:`center`,gap:`6px`},children:[(0,g.jsx)(ie,{size:15}),(0,g.jsx)(`span`,{children:e===`ar`?`حذف الكل`:`Delete All`})]}),l(`communications`,`create`)&&(0,g.jsxs)(`button`,{onClick:()=>{P(`parents`),U(``),G(``),j(!0)},style:{height:`42px`,padding:`0 20px`,borderRadius:`12px`,fontSize:`13px`,fontWeight:`800`,border:`none`,background:`var(--gradient-brand)`,color:`white`,cursor:`pointer`,display:`flex`,alignItems:`center`,gap:`8px`,boxShadow:`0 6px 18px rgba(30, 80, 142, 0.28)`},children:[(0,g.jsx)(ne,{size:18,strokeWidth:2.5}),(0,g.jsx)(`span`,{children:e===`ar`?`إنشاء إشعار فوري`:`Compose Alert`})]})]})]}),(0,g.jsxs)(`div`,{className:`notif-filter-chips`,children:[(0,g.jsxs)(`button`,{onClick:()=>{A(`all`),O(1)},className:`notif-chip-btn ${k===`all`?`active`:``}`,children:[(0,g.jsx)(`span`,{children:e===`ar`?`الكل`:`All`}),(0,g.jsx)(`span`,{className:`notif-chip-counter`,children:b.length})]}),(0,g.jsxs)(`button`,{onClick:()=>{A(`all_users`),O(1)},className:`notif-chip-btn ${k===`all_users`?`active`:``}`,children:[(0,g.jsx)(m,{size:14}),(0,g.jsx)(`span`,{children:e===`ar`?`جميع المستخدمين`:`All Users`})]}),(0,g.jsxs)(`button`,{onClick:()=>{A(`parents`),O(1)},className:`notif-chip-btn ${k===`parents`?`active`:``}`,children:[(0,g.jsx)(d,{size:14}),(0,g.jsx)(`span`,{children:e===`ar`?`أولياء الأمور`:`Parents`})]}),(0,g.jsxs)(`button`,{onClick:()=>{A(`classes`),O(1)},className:`notif-chip-btn ${k===`classes`?`active`:``}`,children:[(0,g.jsx)(p,{size:14}),(0,g.jsx)(`span`,{children:e===`ar`?`الصفوف`:`Classes`})]}),(0,g.jsxs)(`button`,{onClick:()=>{A(`teachers`),O(1)},className:`notif-chip-btn ${k===`teachers`?`active`:``}`,children:[(0,g.jsx)(c,{size:14}),(0,g.jsx)(`span`,{children:e===`ar`?`المعلمون`:`Teachers`})]}),(0,g.jsxs)(`button`,{onClick:()=>{A(`private`),O(1)},className:`notif-chip-btn ${k===`private`?`active`:``}`,children:[(0,g.jsx)(f,{size:14}),(0,g.jsx)(`span`,{children:e===`ar`?`إشعار خاص`:`Private Alerts`})]})]})]}),(0,g.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,justifyContent:`space-between`,margin:`4px 0 -8px 0`},children:[(0,g.jsxs)(`h4`,{style:{fontSize:`15px`,fontWeight:`800`,color:`var(--color-text-primary)`,margin:0,display:`flex`,alignItems:`center`,gap:`8px`},children:[(0,g.jsx)(ve,{size:18,style:{color:`var(--color-primary-ui)`}}),(0,g.jsx)(`span`,{children:e===`ar`?`سجل الإرسال التاريخي`:`Historical Dispatch Log`})]}),(0,g.jsxs)(`span`,{style:{fontSize:`12px`,fontWeight:`800`,background:`var(--color-surface-alt)`,border:`1px solid var(--color-border)`,padding:`2px 10px`,borderRadius:`12px`,color:`var(--color-text-secondary)`},children:[Z.length,` `,e===`ar`?`إشعار`:`alerts`]})]}),we?(0,g.jsx)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`12px`},children:[1,2,3].map(e=>(0,g.jsx)(`div`,{style:{height:`110px`,borderRadius:`18px`,backgroundColor:`var(--color-surface-alt)`,border:`1.5px solid var(--color-border)`,opacity:.6,animation:`pulse 1.5s infinite ease-in-out`}},e))}):Z.length>0?(0,g.jsxs)(`div`,{className:`notif-feed-list`,children:[Z.map(e=>tt(e)),(0,g.jsx)(`div`,{className:`no-print`,style:{marginTop:`var(--space-md)`},children:(0,g.jsx)(a,{page:T,lastPage:x.lastPage,total:x.total,from:x.from,to:x.to,perPage:E,onPageChange:O,onPerPageChange:De,loading:we,lang:e})})]}):(0,g.jsxs)(`div`,{style:{padding:`60px 24px`,textAlign:`center`,backgroundColor:`var(--color-surface-alt)`,borderRadius:`24px`,border:`1.5px dashed var(--color-border)`,display:`flex`,flexDirection:`column`,alignItems:`center`,justifyContent:`center`,gap:`12px`},children:[(0,g.jsx)(`div`,{style:{width:`64px`,height:`64px`,borderRadius:`20px`,backgroundColor:`rgba(30, 80, 142, 0.08)`,color:`var(--color-primary-ui)`,display:`flex`,alignItems:`center`,justifyContent:`center`},children:(0,g.jsx)(u,{size:32})}),(0,g.jsx)(`h3`,{style:{fontSize:`16px`,fontWeight:`800`,color:`var(--color-text-primary)`,margin:0},children:D?e===`ar`?`لا توجد نتائج تطابق كلمة البحث`:`No notifications match search`:e===`ar`?`لا توجد إشعارات مسجلة في هذا التبويب`:`No notifications found in this tab`}),(0,g.jsx)(`p`,{style:{fontSize:`13px`,color:`var(--color-text-secondary)`,margin:0,maxWidth:`400px`,lineHeight:1.5},children:e===`ar`?`يمكنك التبديل بين التبويبات أو النقر على "إنشاء إشعار فوري" لإرسال تنبيه جديد.`:`Switch tabs or click "Compose Alert" to broadcast a new notification.`}),l(`communications`,`create`)&&(0,g.jsxs)(`button`,{onClick:()=>{let e=`parents`;k===`all_users`?e=`all_users`:k===`parents`?e=`parents`:k===`classes`?e=`class`:k===`teachers`?e=`teachers`:k===`private`&&(e=`student`),P(e),e===`class`&&y.length>0&&!R&&z(y[0]),e===`student`&&C.length>0&&!I&&L(C[0].id),e===`teacher`&&w.length>0&&!B&&V(w[0].id),U(``),G(``),j(!0)},style:{marginTop:`8px`,height:`38px`,padding:`0 18px`,borderRadius:`10px`,fontSize:`12.5px`,fontWeight:`800`,border:`none`,backgroundColor:`var(--color-primary-ui)`,color:`white`,cursor:`pointer`,display:`flex`,alignItems:`center`,gap:`6px`},children:[(0,g.jsx)(ne,{size:16}),(0,g.jsx)(`span`,{children:e===`ar`?`إنشاء إشعار جديد الآن`:`Compose Alert Now`})]})]}),ke&&(0,g.jsx)(`div`,{className:`modal-overlay no-print`,style:{backdropFilter:`blur(8px)`},children:(0,g.jsxs)(`div`,{className:`modal-container`,style:{maxWidth:`640px`,borderRadius:`24px`,overflow:`hidden`},children:[(0,g.jsxs)(`header`,{className:`modal-header`,style:{padding:`20px 24px`,borderBottom:`1px solid var(--color-border)`},children:[(0,g.jsxs)(`h3`,{className:`modal-title`,style:{fontSize:`16px`,fontWeight:`800`,display:`flex`,alignItems:`center`,gap:`8px`},children:[(0,g.jsx)(_e,{size:18,style:{color:`var(--color-primary-ui)`}}),(0,g.jsx)(`span`,{children:e===`ar`?`إرسال ونشر إشعار فوري جديد`:`Compose Instant Announcement`})]}),(0,g.jsx)(`button`,{className:`modal-close-btn`,type:`button`,onClick:()=>j(!1),style:{background:`#ef4444`,color:`white`,width:`32px`,height:`32px`,borderRadius:`50%`,display:`flex`,alignItems:`center`,justifyContent:`center`,border:`none`,cursor:`pointer`,transition:`background 0.2s`},onMouseEnter:e=>e.currentTarget.style.background=`#dc2626`,onMouseLeave:e=>e.currentTarget.style.background=`#ef4444`,children:(0,g.jsx)(le,{size:16})})]}),(0,g.jsxs)(`form`,{onSubmit:He,children:[(0,g.jsxs)(`div`,{className:`modal-body`,style:{padding:`20px 24px`,display:`flex`,flexDirection:`column`,gap:`16px`},children:[(0,g.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`6px`},children:[(0,g.jsxs)(`label`,{style:{fontSize:`12px`,fontWeight:`800`,color:`var(--color-primary-ui)`,display:`flex`,alignItems:`center`,gap:`6px`},children:[(0,g.jsx)(m,{size:14}),(0,g.jsx)(`span`,{children:e===`ar`?`قوالب جاهزة بنقرة واحدة:`:`Quick Presets:`})]}),(0,g.jsxs)(`div`,{className:`preset-templates-container`,children:[(0,g.jsxs)(`button`,{type:`button`,className:`preset-template-chip`,onClick:()=>J(`general_announcement`),children:[(0,g.jsx)(se,{size:13,style:{color:`var(--color-primary-ui)`}}),(0,g.jsx)(`span`,{children:e===`ar`?`تعميم إداري`:`General Notice`})]}),(0,g.jsxs)(`button`,{type:`button`,className:`preset-template-chip`,onClick:()=>J(`exam`),children:[(0,g.jsx)(oe,{size:13,style:{color:`#0284c7`}}),(0,g.jsx)(`span`,{children:e===`ar`?`جدول الاختبارات`:`Exam Schedule`})]}),(0,g.jsxs)(`button`,{type:`button`,className:`preset-template-chip`,onClick:()=>J(`parents_meeting`),children:[(0,g.jsx)(d,{size:13,style:{color:`#8b5cf6`}}),(0,g.jsx)(`span`,{children:e===`ar`?`اجتماع أولياء الأمور`:`Parents Meeting`})]}),(0,g.jsxs)(`button`,{type:`button`,className:`preset-template-chip`,onClick:()=>J(`absence`),children:[(0,g.jsx)(o,{size:13,style:{color:`#d97706`}}),(0,g.jsx)(`span`,{children:e===`ar`?`تنبيه مواظبة`:`Attendance Alert`})]})]})]}),(0,g.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`8px`},children:[(0,g.jsxs)(`label`,{style:{fontSize:`12px`,fontWeight:`800`,color:`var(--color-text-primary)`},children:[`🎯`,` `,e===`ar`?`اختر الفئة المستهدفة:`:`Select Target Audience:`]}),(0,g.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:`repeat(auto-fill, minmax(150px, 1fr))`,gap:`10px`},children:[(0,g.jsxs)(`div`,{onClick:()=>P(`all_users`),style:{padding:`10px 8px`,borderRadius:`12px`,border:N===`all_users`?`2px solid var(--color-primary-ui)`:`1px solid var(--color-border)`,background:N===`all_users`?`rgba(30, 80, 142, 0.08)`:`var(--color-surface)`,color:N===`all_users`?`var(--color-primary-ui)`:`var(--color-text-primary)`,cursor:`pointer`,textAlign:`center`,fontSize:`11.5px`,fontWeight:`700`},children:[(0,g.jsx)(m,{size:18,style:{margin:`0 auto 4px auto`,display:`block`}}),(0,g.jsx)(`span`,{children:e===`ar`?`جميع المستخدمين`:`All Users`})]}),(0,g.jsxs)(`div`,{onClick:()=>P(`parents`),style:{padding:`10px 8px`,borderRadius:`12px`,border:N===`parents`?`2px solid var(--color-primary-ui)`:`1px solid var(--color-border)`,background:N===`parents`?`rgba(30, 80, 142, 0.08)`:`var(--color-surface)`,color:N===`parents`?`var(--color-primary-ui)`:`var(--color-text-primary)`,cursor:`pointer`,textAlign:`center`,fontSize:`11.5px`,fontWeight:`700`},children:[(0,g.jsx)(d,{size:18,style:{margin:`0 auto 4px auto`,display:`block`}}),(0,g.jsx)(`span`,{children:t.targetAllParents})]}),(0,g.jsxs)(`div`,{onClick:()=>{P(`class`),y.length>0&&!R&&z(y[0])},style:{padding:`10px 8px`,borderRadius:`12px`,border:N===`class`?`2px solid var(--color-primary-ui)`:`1px solid var(--color-border)`,background:N===`class`?`rgba(30, 80, 142, 0.08)`:`var(--color-surface)`,color:N===`class`?`var(--color-primary-ui)`:`var(--color-text-primary)`,cursor:`pointer`,textAlign:`center`,fontSize:`11.5px`,fontWeight:`700`},children:[(0,g.jsx)(p,{size:18,style:{margin:`0 auto 4px auto`,display:`block`}}),(0,g.jsx)(`span`,{children:t.targetByClass})]}),(0,g.jsxs)(`div`,{onClick:()=>{P(`student`),C.length>0&&!I&&L(C[0].id)},style:{padding:`10px 8px`,borderRadius:`12px`,border:N===`student`?`2px solid var(--color-primary-ui)`:`1px solid var(--color-border)`,background:N===`student`?`rgba(30, 80, 142, 0.08)`:`var(--color-surface)`,color:N===`student`?`var(--color-primary-ui)`:`var(--color-text-primary)`,cursor:`pointer`,textAlign:`center`,fontSize:`11.5px`,fontWeight:`700`},children:[(0,g.jsx)(f,{size:18,style:{margin:`0 auto 4px auto`,display:`block`}}),(0,g.jsx)(`span`,{children:t.targetByStudent})]}),(0,g.jsxs)(`div`,{onClick:()=>P(`teachers`),style:{padding:`10px 8px`,borderRadius:`12px`,border:N===`teachers`?`2px solid var(--color-primary-ui)`:`1px solid var(--color-border)`,background:N===`teachers`?`rgba(30, 80, 142, 0.08)`:`var(--color-surface)`,color:N===`teachers`?`var(--color-primary-ui)`:`var(--color-text-primary)`,cursor:`pointer`,textAlign:`center`,fontSize:`11.5px`,fontWeight:`700`},children:[(0,g.jsx)(d,{size:18,style:{margin:`0 auto 4px auto`,display:`block`}}),(0,g.jsx)(`span`,{children:t.targetAllTeachers})]}),(0,g.jsxs)(`div`,{onClick:()=>{P(`teacher`),w.length>0&&!B&&V(w[0].id)},style:{padding:`10px 8px`,borderRadius:`12px`,border:N===`teacher`?`2px solid var(--color-primary-ui)`:`1px solid var(--color-border)`,background:N===`teacher`?`rgba(30, 80, 142, 0.08)`:`var(--color-surface)`,color:N===`teacher`?`var(--color-primary-ui)`:`var(--color-text-primary)`,cursor:`pointer`,textAlign:`center`,fontSize:`11.5px`,fontWeight:`700`},children:[(0,g.jsx)(c,{size:18,style:{margin:`0 auto 4px auto`,display:`block`}}),(0,g.jsx)(`span`,{children:e===`ar`?`حسب المعلم`:`By Teacher`})]})]})]}),N===`student`&&(0,g.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`6px`},children:[(0,g.jsxs)(`label`,{style:{fontSize:`11.5px`,fontWeight:`700`},children:[`🔍 `,t.selectStudent]}),(0,g.jsx)(`input`,{type:`text`,placeholder:e===`ar`?`ابحث باسم الطالب أو الرقم الأكاديمي...`:`Search by student name or ID...`,value:Pe,onChange:e=>Fe(e.target.value),className:`text-field`,style:{height:`36px`,fontSize:`12px`,padding:`0 10px`}}),(0,g.jsx)(`select`,{value:K,onChange:e=>L(e.target.value),className:`text-field`,style:{minHeight:`45px`,fontSize:`14px`,padding:`0 12px`,boxSizing:`border-box`,lineHeight:`normal`},children:$e.map(t=>(0,g.jsx)(`option`,{value:t.id,children:e===`ar`?t.name:t.nameEn||t.name},t.id))})]}),N===`class`&&(0,g.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`6px`},children:[(0,g.jsxs)(`label`,{style:{fontSize:`11.5px`,fontWeight:`700`},children:[`🏫 `,t.selectClass]}),(0,g.jsx)(`select`,{value:Re,onChange:e=>z(e.target.value),className:`text-field`,style:{minHeight:`45px`,fontSize:`14px`,padding:`0 12px`,boxSizing:`border-box`,lineHeight:`normal`},children:F.map(e=>(0,g.jsx)(`option`,{value:e,children:e},e))})]}),N===`teacher`&&(0,g.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`6px`},children:[(0,g.jsxs)(`label`,{style:{fontSize:`11.5px`,fontWeight:`700`},children:[`🔍 `,e===`ar`?`إختيار المعلم`:`Select Teacher`]}),(0,g.jsx)(`input`,{type:`text`,placeholder:e===`ar`?`ابحث باسم المعلم أو الرقم الوظيفي...`:`Search by teacher name or Job ID...`,value:Ie,onChange:e=>Le(e.target.value),className:`text-field`,style:{height:`36px`,fontSize:`12px`,padding:`0 10px`}}),(0,g.jsx)(`select`,{value:q,onChange:e=>V(e.target.value),className:`text-field`,style:{minHeight:`45px`,fontSize:`14px`,padding:`0 12px`,boxSizing:`border-box`,lineHeight:`normal`},children:et.map(t=>(0,g.jsx)(`option`,{value:t.id,children:e===`ar`?t.name:t.nameEn||t.name},t.id))})]}),(0,g.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`4px`},children:[(0,g.jsxs)(`label`,{style:{fontSize:`12px`,fontWeight:`800`,color:`var(--color-text-primary)`},children:[`📝 `,t.notificationTitleLabel]}),(0,g.jsx)(`input`,{type:`text`,value:H,onChange:e=>U(e.target.value),placeholder:e===`ar`?`عنوان الإشعار...`:`Notification title...`,className:`text-field`,style:{height:`38px`,fontSize:`12px`,padding:`0 12px`},required:!0})]}),(0,g.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`4px`},children:[(0,g.jsxs)(`label`,{style:{fontSize:`12px`,fontWeight:`800`,color:`var(--color-text-primary)`},children:[`💬 `,t.notificationContentLabel]}),(0,g.jsx)(`textarea`,{value:W,onChange:e=>G(e.target.value),placeholder:e===`ar`?`محتوى وتفاصيل البلاغ...`:`Notification content...`,className:`text-field`,style:{minHeight:`90px`,fontSize:`12px`,padding:`10px 12px`,resize:`vertical`},required:!0})]}),(0,g.jsxs)(`div`,{style:{fontSize:`11px`,color:`var(--color-text-secondary)`,display:`flex`,alignItems:`center`,gap:`8px`,background:`var(--color-surface)`,padding:`8px 12px`,borderRadius:`8px`,border:`1px solid var(--color-border)`},children:[(0,g.jsx)(he,{size:14,style:{color:`var(--color-success)`}}),(0,g.jsx)(`span`,{children:e===`ar`?`سيتم النشر كإشعار فوري للتطبيق وكسجل رسائل SMS كالمعتاد.`:`Will be broadcasted as instant Push Notification & SMS.`})]})]}),(0,g.jsxs)(`footer`,{className:`modal-footer`,style:{padding:`14px 24px`,borderTop:`1px solid var(--color-border)`,display:`flex`,justifyContent:`flex-end`,gap:`10px`},children:[(0,g.jsx)(`button`,{type:`button`,className:`btn-elevated`,onClick:()=>j(!1),style:{height:`36px`,padding:`0 16px`,borderRadius:`8px`,fontSize:`12px`,cursor:`pointer`},children:t.cancel}),(0,g.jsxs)(`button`,{type:`submit`,style:{height:`36px`,padding:`0 20px`,borderRadius:`8px`,fontSize:`12px`,fontWeight:`800`,background:`var(--gradient-brand)`,color:`white`,border:`none`,cursor:`pointer`,display:`flex`,alignItems:`center`,gap:`6px`},children:[(0,g.jsx)(_e,{size:14}),(0,g.jsx)(`span`,{children:e===`ar`?`إرسال ونشر الآن`:`Broadcast Now`})]})]})]})]})})]});function tt(t){let n=t.type===`student`?C.find(e=>e.id===Number(t.studentId)):null,r=Qe(t,n?n.name:t.studentName,n?n.nameEn:t.studentNameEn,t.teacherName,t.teacherNameEn),i=We(t.date),a=Y(t.date);return(0,g.jsxs)(`div`,{className:`notif-card-modern ${t.isRead?``:`unread`}`,onClick:()=>{t.isRead||S(t.id)},children:[(0,g.jsxs)(`div`,{className:`notif-card-header`,children:[(0,g.jsxs)(`div`,{className:`notif-card-title-area`,children:[(0,g.jsx)(`div`,{className:`notif-card-avatar`,style:{backgroundColor:r.bgGlow,color:r.textColor,border:`1px solid ${r.borderColor}`},children:r.icon}),(0,g.jsxs)(`div`,{children:[(0,g.jsxs)(`h4`,{className:`notif-card-title`,children:[t.title,!t.isRead&&(0,g.jsx)(`span`,{style:{fontSize:`10.5px`,fontWeight:`800`,background:`#ef4444`,color:`white`,padding:`1px 8px`,borderRadius:`10px`,marginInlineStart:`8px`,display:`inline-block`,verticalAlign:`middle`},children:e===`ar`?`جديد`:`New`})]}),(0,g.jsxs)(`div`,{className:`notif-card-meta`,children:[(0,g.jsxs)(`span`,{style:{fontSize:`11px`,fontWeight:`700`,color:r.textColor,background:r.bgGlow,padding:`2px 8px`,borderRadius:`8px`,border:`1px solid ${r.borderColor}`,display:`inline-flex`,alignItems:`center`,gap:`4px`},children:[(0,g.jsx)(fe,{size:11,style:{opacity:.8}}),(0,g.jsx)(`span`,{children:r.label})]}),(0,g.jsxs)(`span`,{style:{fontSize:`11.5px`,color:`var(--color-text-secondary)`,fontWeight:`600`,display:`inline-flex`,alignItems:`center`,gap:`4px`},children:[(0,g.jsx)(s,{size:13,style:{color:`var(--color-primary-ui)`,opacity:.8}}),(0,g.jsxs)(`span`,{children:[i,` (`,a,`)`]})]})]})]})]}),(0,g.jsxs)(`div`,{className:`notif-action-btn-group no-print`,onClick:e=>e.stopPropagation(),children:[!t.isRead&&(0,g.jsx)(`button`,{className:`notif-icon-btn`,onClick:()=>S(t.id),title:e===`ar`?`تحديد كمقروء`:`Mark as read`,children:(0,g.jsx)(me,{size:14})}),(0,g.jsx)(`button`,{className:`notif-icon-btn`,onClick:e=>Ve(e,t),title:e===`ar`?`نسخ نص الإشعار`:`Copy notification text`,children:je===t.id?(0,g.jsx)(me,{size:14,style:{color:`var(--color-success)`}}):(0,g.jsx)(ee,{size:14})}),l(`communications`,`delete`)&&(0,g.jsx)(`button`,{className:`notif-icon-btn danger`,onClick:e=>ze(e,t.id),title:e===`ar`?`حذف الإشعار`:`Delete notification`,children:(0,g.jsx)(ie,{size:14})})]})]}),(0,g.jsx)(`p`,{className:`notif-card-body`,children:t.content}),(0,g.jsxs)(`div`,{className:`notif-card-footer`,children:[(0,g.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`16px`,flexWrap:`wrap`},children:[(0,g.jsxs)(`span`,{children:[`✍️ `,e===`ar`?`المرسل: `:`Sender: `,(0,g.jsx)(`strong`,{children:Ue(t).name})]}),(0,g.jsxs)(`span`,{children:[`🎯 `,e===`ar`?`الموجه إليه: `:`Recipient: `,(0,g.jsx)(`strong`,{style:{color:`var(--color-primary-ui)`},children:Xe(t)})]})]}),(0,g.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`5px`,color:`var(--color-success)`},children:[(0,g.jsx)(he,{size:13}),(0,g.jsx)(`span`,{children:e===`ar`?`تم النشر كإشعار فوري وتنبيه SMS`:`Sent via Push & SMS`})]})]})]},t.id)}}function v(){return(0,g.jsx)(_,{})}export{v as default};