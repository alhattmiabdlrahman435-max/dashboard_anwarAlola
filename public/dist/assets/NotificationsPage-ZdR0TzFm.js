import{t as e}from"./check-BAw57PPK.js";import{n as t,t as n}from"./PaginationBar-CP1B12yb.js";import{t as r}from"./circle-alert-C4yNY9du.js";import{n as i,t as a}from"./sparkles-B-kP6Ejg.js";import{t as o}from"./clock-B8VGHOGl.js";import{t as ee}from"./copy-DFwUCyZy.js";import{t as te}from"./funnel-BQuexKa0.js";import{t as s}from"./layers-Ddb4JNKQ.js";import{t as ne}from"./plus-Sx8QtDND.js";import{t as re}from"./search-CxeMemDs.js";import{t as ie}from"./trash-2-CWJQtXBP.js";import{t as c}from"./user-KuyOzj6r.js";import{A as ae,C as oe,D as se,K as l,L as ce,S as u,W as d,b as f,f as le,i as p,r as ue,t as de,u as m,v as fe,z as h}from"./index-C3ZHG8yJ.js";var pe=u(`arrow-left-right`,[[`path`,{d:`M8 3 4 7l4 4`,key:`9rb6wj`}],[`path`,{d:`M4 7h16`,key:`6tx8e3`}],[`path`,{d:`m16 21 4-4-4-4`,key:`siv7j2`}],[`path`,{d:`M20 17H4`,key:`h6l3hr`}]]),me=u(`send`,[[`path`,{d:`M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z`,key:`1ffxy3`}],[`path`,{d:`m21.854 2.147-10.94 10.939`,key:`12cjpa`}]]),he=u(`volume-2`,[[`path`,{d:`M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z`,key:`uqj9uw`}],[`path`,{d:`M16 9a5 5 0 0 1 0 6`,key:`1q6k2b`}],[`path`,{d:`M19.364 18.364a9 9 0 0 0 0-12.728`,key:`ijwkga`}]]),g=l(d(),1),_=h();function v(){let{lang:l,t:u,triggerConfirm:d,canAction:h,setToastMessage:v}=ce(),{classes:y,availableGrades:b,fetchClasses:ge}=ae(),{notifications:x,notificationsPagination:S,handleSendNotification:_e,handleMarkNotificationAsRead:ve,handleDeleteNotification:ye,handleDeleteAllNotifications:be,fetchNotifications:xe,loading:Se}=se(),{students:C,fetchStudents:Ce}=de(),{teachers:w,fetchTeachers:we}=oe(),{page:T,perPage:E,search:D,setPage:O,setPerPage:Te,setSearch:Ee}=t({moduleKey:`notifications`}),[k,A]=(0,g.useState)(`all`),[De,j]=(0,g.useState)(!1),[M,Oe]=(0,g.useState)(``),[ke,Ae]=(0,g.useState)(null),je=(0,g.useMemo)(()=>{let e=new URLSearchParams;return e.set(`page`,T),e.set(`per_page`,E),D&&e.set(`search`,D),M&&e.set(`date`,M),k===`parents`?e.set(`target_type`,`all_parents`):k===`teachers`?e.set(`target_type`,`all_teachers`):k===`classes`?e.set(`target_type`,`by_class`):k===`private`&&e.set(`target_type`,`by_student`),`?`+e.toString()},[T,E,D,M,k]);(0,g.useEffect)(()=>{xe(je)},[xe,je]),(0,g.useEffect)(()=>{ge(),Ce(`?per_page=1000`),we(`?per_page=1000`)},[ge,Ce,we]);let[N,P]=(0,g.useState)(`parents`),F=(0,g.useMemo)(()=>y&&y.length>0?y.map(e=>e.name||`${e.grade} - ${e.section}`):b||[],[y,b]),[I,L]=(0,g.useState)(``),[R,z]=(0,g.useState)(``),[B,V]=(0,g.useState)(``),[H,U]=(0,g.useState)(``),[W,G]=(0,g.useState)(``),[Me,Ne]=(0,g.useState)(``),[Pe,Fe]=(0,g.useState)(``),Ie=F.includes(R)?R:F.length>0?F[0]:``,K=Array.isArray(C)&&C.some(e=>String(e.id)===String(I))?I:C&&C.length>0?C[0].id:``,q=Array.isArray(w)&&w.some(e=>String(e.id)===String(B))?B:w&&w.length>0?w[0].id:``,Le=(e,t)=>{e.stopPropagation(),d({title:l===`ar`?`حذف الإشعار`:`Delete Notification`,message:l===`ar`?`هل أنت متأكد من حذف هذا الإشعار نهائياً؟`:`Are you sure you want to permanently delete this notification?`,onConfirm:()=>{ye(t)}})},Re=()=>{d({title:l===`ar`?`حذف جميع الإشعارات`:`Delete All Notifications`,message:l===`ar`?`هل أنت متأكد من حذف جميع الإشعارات نهائياً؟ هذا الإجراء لا يمكن التراجع عنه!`:`Are you sure you want to delete all notifications permanently? This action cannot be undone!`,onConfirm:()=>{be()}})},ze=(e,t)=>{e.stopPropagation();let n=`${t.title}\n${t.content}`;navigator.clipboard.writeText(n),Ae(t.id),v&&v(l===`ar`?`تم نسخ نص الإشعار بنجاح`:`Notification content copied`),setTimeout(()=>Ae(null),2e3)},J=e=>{e===`absence`?(U(l===`ar`?`تنبيه غياب وتأخر دراسي`:`Absence & Attendance Alert`),G(l===`ar`?`نود إحاطتكم بحضور ومواظبة الطالب/الطالبة، نرجو المتابعة الحثيثة والتواصل مع إدارة المدرسة لضمان التفوق.`:`We would like to inform you regarding student attendance. Please follow up with school administration.`)):e===`exam`?(U(l===`ar`?`إعلان جدول الاختبارات النهائية`:`Final Exam Schedule Announcement`),G(l===`ar`?`تم اعتماد ونشر جدول الاختبارات التقييمية. نرجو الحرص على مراجعة المقررات والالتزام بالحضور في المواعيد المحددة.`:`The evaluation exam schedule has been published. Please ensure thorough revision and timely attendance.`)):e===`parents_meeting`?(U(l===`ar`?`دعوة لاجتماع أولياء الأمور الدوري`:`Parents-Teachers Meeting Invitation`),G(l===`ar`?`يسر إدارة المدرسة دعوتكم لحضور الاجتماع الدوري لمناقشة المستوى الأكاديمي والتربوي لأبنائنا الطلاب يوم الخميس القادم.`:`You are cordially invited to attend the periodic parents meeting next Thursday.`)):e===`general_announcement`&&(U(l===`ar`?`تعميم إداري هام للجميع`:`Important School Announcement`),G(l===`ar`?`تود إدارة رياض ومدارس أنوار العلى الدولية تذكير جميع الطلاب وأولياء الأمور بالتعليمات والأنشطة القادمة.`:`Anwar Al-Ola Int. Model Schools would like to remind all students & parents of upcoming activities.`))},Be=e=>{if(e.preventDefault(),!H.trim()||!W.trim())return;let t=new Date().toISOString().replace(`T`,` `).substring(0,16),n={};if(N===`student`){let e=C.find(e=>e.id===Number(K));n={studentId:Number(K),studentName:e?e.name:null,studentNameEn:e?e.nameEn:null,grade:e?e.grade:null}}else if(N===`class`)n={grade:Ie};else if(N===`teacher`){let e=w.find(e=>e.id===Number(q));n={teacherId:Number(q),teacherName:e?e.name:null,teacherNameEn:e?e.nameEn:null}}let r={id:Date.now(),title:H,content:W,date:t,type:N,...n},i=[];if(N===`student`){let e=C.find(e=>e.id===Number(K));if(e){let n=l===`ar`?`تنبيه خاص بخصوص ابنكم ${e.name}: ${H} - ${W}. رياض و مدارس انوار العلى.`:`Private alert for ${e.nameEn}: ${H} - ${W}. Riyadh & Anwar Al-Ola.`;i.push({id:Date.now(),studentId:e.id,recipient:e.phone,text:n,time:t.split(` `)[1],type:`present`})}}else N===`class`?C.filter(e=>e.grade===R).forEach((e,n)=>{let r=l===`ar`?`تعميم لصف ${R}: ${H} - ${W}.`:`Class announcement for ${R}: ${H} - ${W}.`;i.push({id:Date.now()+Math.random()+n,studentId:e.id,recipient:e.phone,text:r,time:t.split(` `)[1],type:`present`})}):N===`parents`&&C.forEach((e,n)=>{let r=l===`ar`?`إشعار عام من المدرسة لأولياء الأمور: ${H} - ${W}.`:`Broadcast Announcement to Parents: ${H} - ${W}.`;i.push({id:Date.now()+Math.random()+n,studentId:e.id,recipient:e.phone,text:r,time:t.split(` `)[1],type:`present`})});_e(r,i),j(!1),U(``),G(``),Ne(``),Fe(``)},Ve=(0,g.useCallback)(e=>e.type===`attendance`?{name:l===`ar`?`مشرف التحضير`:`Prep Supervisor`,key:`supervisor`}:{name:l===`ar`?`إدارة المدرسة`:`School Administration`,key:`admin`},[l]),Y=(0,g.useCallback)(e=>{if(!e)return``;try{let t=new Date(e.replace(` `,`T`));if(isNaN(t.getTime())&&(t=new Date(e)),isNaN(t.getTime()))return e;let n=t.getFullYear(),r=String(t.getMonth()+1).padStart(2,`0`),i=String(t.getDate()).padStart(2,`0`),a=t.getHours(),o=String(t.getMinutes()).padStart(2,`0`),ee=a>=12?l===`ar`?`م`:`PM`:l===`ar`?`ص`:`AM`;return a%=12,a||=12,`${n}-${r}-${i} ${String(a).padStart(2,`0`)}:${o} ${ee}`}catch{return e}},[l]),He=(0,g.useCallback)(e=>{if(!e)return``;try{let t=new Date(e.replace(` `,`T`)),n=new Date-t,r=Math.floor(n/(1e3*60)),i=Math.floor(n/(1e3*60*60)),a=Math.floor(n/(1e3*60*60*24));return r<2?l===`ar`?`الآن`:`Just now`:r<60?l===`ar`?`منذ ${r} دقيقة`:`${r}m ago`:i<24?l===`ar`?`منذ ${i} ساعة`:`${i}h ago`:a===1?l===`ar`?`أمس`:`Yesterday`:a<7?l===`ar`?`منذ ${a} أيام`:`${a}d ago`:Y(e)}catch{return e}},[l,Y]),X=(0,g.useCallback)(e=>{if(!e)return l===`ar`?`الصف الدراسي`:`Class`;let t=e.grade||e.class_name||e.className||e.grade_name||e.gradeName;if(t&&t!==`null`&&t!==`NULL`&&t!==`undefined`)return t;if(e.studentId){let t=C.find(t=>t.id===Number(e.studentId));if(t){let e=t.grade||t.class_name||t.grade_name;if(e&&e!==`null`&&e!==`NULL`&&e!==`undefined`)return e}}let n=`${e.title||``} ${e.content||``}`.match(/(?:للفصل|فصل|الصف)\s+([^\s:,.-]+(?:\s*[-–]\s*[^\s:,.-]+)?)/);return n&&n[1]&&!n[1].includes(`العام`)&&!n[1].includes(`ابنكم`)?n[1].trim():l===`ar`?`الصف الدراسي`:`Class`},[l,C]),Ue=S.total||x.length,We=(0,g.useMemo)(()=>x.filter(e=>e.type===`general`||e.type===`all_users`).length,[x]),Ge=(0,g.useMemo)(()=>x.filter(e=>e.type===`parents`||e.type===`broadcast_parents`).length,[x]),Ke=(0,g.useMemo)(()=>x.filter(e=>e.type===`teachers`||e.type===`broadcast_teachers`).length,[x]),qe=(0,g.useMemo)(()=>x.filter(e=>e.type===`class`||e.type===`student`||e.type===`private`||e.type===`teacher`).length,[x]),Je=(0,g.useCallback)(e=>{let t=e.type,n=X(e);if(t===`general`||t===`all_users`)return l===`ar`?`جميع المستخدمين (معلمين وأولياء أمور)`:`All Users (Teachers & Parents)`;if(t===`parents`||t===`broadcast_parents`)return l===`ar`?`جميع أولياء الأمور`:`All Parents`;if(t===`teachers`||t===`broadcast_teachers`)return l===`ar`?`جميع المعلمين`:`All Teachers`;if(t===`class`)return l===`ar`?`الصف: ${n}`:`Class: ${n}`;if(t===`student`||t===`private`){let t=C.find(t=>String(t.id)===String(e.studentId)),n=e.studentName||(t?t.name||t.name_ar||t.name_en:null);return n?l===`ar`?`الطالب: ${n}`:`Student: ${n}`:e.studentId?l===`ar`?`الطالب (رقم #${e.studentId})`:`Student (#${e.studentId})`:l===`ar`?`طالب مخصص`:`Student`}if(t===`teacher`){let t=w.find(t=>String(t.id)===String(e.teacherId)),n=e.teacherName||(t?t.name||t.name_ar||t.name_en:null);return n?l===`ar`?`المعلم: ${n}`:`Teacher: ${n}`:e.teacherId?l===`ar`?`المعلم (رقم #${e.teacherId})`:`Teacher (#${e.teacherId})`:l===`ar`?`معلم مخصص`:`Teacher`}return l===`ar`?`عام`:`General`},[l,X,C,w]),Z=(0,g.useMemo)(()=>x.filter(e=>M&&e.date&&!e.date.substring(0,10).startsWith(M)?!1:k===`all_users`?e.type===`general`||e.type===`all_users`:k===`parents`?e.type===`parents`||e.type===`broadcast_parents`||e.type===`general`||e.type===`broadcast`:k===`teachers`?e.type===`teachers`||e.type===`broadcast_teachers`||e.type===`general`||e.type===`broadcast`:k===`classes`?e.type===`class`:k===`private`?e.type===`student`||e.type===`private`||e.type===`teacher`:!0),[x,M,k]);(0,g.useMemo)(()=>x.filter(e=>!e.isRead).length,[x]);let Ye=(e,t,n,r,i)=>{let a=e.type,o=X(e);if(a===`general`||a===`parents`||a===`broadcast_parents`)return{label:l===`ar`?`تعميم عام لأولياء الأمور`:`All Parents Broadcast`,bgGlow:`rgba(30, 80, 142, 0.08)`,borderColor:`var(--color-primary-ui)`,textColor:`var(--color-primary-ui)`,icon:(0,_.jsx)(p,{size:16})};if(a===`class`||a===`assignment`||a===`homework`)return{label:l===`ar`?`الصف: ${o}`:`Class: ${o}`,bgGlow:`rgba(217, 119, 6, 0.08)`,borderColor:`#d97706`,textColor:`#b45309`,icon:(0,_.jsx)(s,{size:16})};if(a===`student`||a===`private`){let e=l===`ar`?t||`طالب مخصص`:n||t||`Private Student`;return{label:o!==`الصف الدراسي`&&o!==`Class`?l===`ar`?`طالب (${o}): ${e}`:`Student (${o}): ${e}`:l===`ar`?`طالب: ${e}`:`Student: ${e}`,bgGlow:`rgba(225, 29, 72, 0.08)`,borderColor:`#e11d48`,textColor:`#be123c`,icon:(0,_.jsx)(m,{size:16})}}else if(a===`teachers`||a===`broadcast_teachers`)return{label:l===`ar`?`تعميم لجميع المعلمين`:`All Teachers Broadcast`,bgGlow:`rgba(16, 185, 129, 0.08)`,borderColor:`#10b981`,textColor:`#047857`,icon:(0,_.jsx)(p,{size:16})};else if(a===`teacher`){let e=l===`ar`?r||`معلم مخصص`:i||r||`Teacher`;return{label:l===`ar`?`المعلم: ${e}`:`Teacher: ${e}`,bgGlow:`rgba(15, 118, 110, 0.08)`,borderColor:`#0f766e`,textColor:`#0f766e`,icon:(0,_.jsx)(c,{size:16})}}return{label:(e.title&&e.title.includes(`واجب`)||e.content&&e.content.includes(`واجب`),l===`ar`?`الصف: ${o}`:`Class: ${o}`),bgGlow:`rgba(100, 116, 139, 0.08)`,borderColor:`#64748b`,textColor:`#475569`,icon:(0,_.jsx)(f,{size:16})}},Q=(Me||``).toLowerCase().trim(),Xe=Array.isArray(C)?Q?C.filter(e=>{if(!e)return!1;let t=!!(e.name?.toString().toLowerCase().includes(Q)||e.nameEn?.toString().toLowerCase().includes(Q)),n=!!e.id?.toString().includes(Q),r=!!(e.student_number||e.studentNumber||e.academic_number||e.national_id||e.code)?.toString().toLowerCase().includes(Q);return t||n||r}):C:[],$=(Pe||``).toLowerCase().trim(),Ze=Array.isArray(w)?$?w.filter(e=>{if(!e)return!1;let t=!!(e.name?.toString().toLowerCase().includes($)||e.nameEn?.toString().toLowerCase().includes($)),n=!!e.id?.toString().includes($),r=!!(e.jobId||e.job_number||e.job_no)?.toString().toLowerCase().includes($);return t||n||r}):w:[];return(0,_.jsxs)(`div`,{className:`notif-command-center`,children:[(0,_.jsx)(`style`,{children:`
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
      `}),(0,_.jsxs)(`div`,{className:`notif-stats-grid`,children:[(0,_.jsxs)(`div`,{className:`notif-stat-card`,children:[(0,_.jsxs)(`div`,{className:`notif-stat-content`,children:[(0,_.jsx)(`span`,{className:`notif-stat-number`,children:Ue}),(0,_.jsx)(`span`,{className:`notif-stat-label`,children:l===`ar`?`إجمالي الإشعارات`:`Total Notifications`})]}),(0,_.jsx)(`div`,{className:`notif-stat-icon-wrapper`,style:{background:`linear-gradient(135deg, #1e508e 0%, #103058 100%)`},children:(0,_.jsx)(f,{size:22})})]}),(0,_.jsxs)(`div`,{className:`notif-stat-card`,children:[(0,_.jsxs)(`div`,{className:`notif-stat-content`,children:[(0,_.jsx)(`span`,{className:`notif-stat-number`,children:We}),(0,_.jsx)(`span`,{className:`notif-stat-label`,children:l===`ar`?`جميع المستخدمين`:`All Users`})]}),(0,_.jsx)(`div`,{className:`notif-stat-icon-wrapper`,style:{background:`linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)`},children:(0,_.jsx)(a,{size:22})})]}),(0,_.jsxs)(`div`,{className:`notif-stat-card`,children:[(0,_.jsxs)(`div`,{className:`notif-stat-content`,children:[(0,_.jsx)(`span`,{className:`notif-stat-number`,children:Ge}),(0,_.jsx)(`span`,{className:`notif-stat-label`,children:l===`ar`?`تعاميم أولياء الأمور`:`Parents Broadcasts`})]}),(0,_.jsx)(`div`,{className:`notif-stat-icon-wrapper`,style:{background:`linear-gradient(135deg, #0284c7 0%, #0369a1 100%)`},children:(0,_.jsx)(p,{size:22})})]}),(0,_.jsxs)(`div`,{className:`notif-stat-card`,children:[(0,_.jsxs)(`div`,{className:`notif-stat-content`,children:[(0,_.jsx)(`span`,{className:`notif-stat-number`,children:Ke}),(0,_.jsx)(`span`,{className:`notif-stat-label`,children:l===`ar`?`تعاميم المعلمين`:`Teachers Broadcasts`})]}),(0,_.jsx)(`div`,{className:`notif-stat-icon-wrapper`,style:{background:`linear-gradient(135deg, #10b981 0%, #047857 100%)`},children:(0,_.jsx)(c,{size:22})})]}),(0,_.jsxs)(`div`,{className:`notif-stat-card`,children:[(0,_.jsxs)(`div`,{className:`notif-stat-content`,children:[(0,_.jsx)(`span`,{className:`notif-stat-number`,children:qe}),(0,_.jsx)(`span`,{className:`notif-stat-label`,children:l===`ar`?`الفصول والتنبيهات الفردية`:`Classes & Private`})]}),(0,_.jsx)(`div`,{className:`notif-stat-icon-wrapper`,style:{background:`linear-gradient(135deg, #d97706 0%, #b45309 100%)`},children:(0,_.jsx)(s,{size:22})})]})]}),(0,_.jsxs)(`div`,{className:`notif-toolbar-container no-print`,children:[(0,_.jsxs)(`div`,{className:`notif-toolbar-top-row`,children:[(0,_.jsxs)(`div`,{className:`notif-search-box`,children:[(0,_.jsx)(re,{size:16,className:`notif-search-icon`}),(0,_.jsx)(`input`,{type:`text`,placeholder:l===`ar`?`البحث في سجل الإشعارات المرسلة...`:`Search notifications history...`,value:D||``,onChange:e=>Ee(e.target.value)})]}),(0,_.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`10px`,flexWrap:`wrap`},children:[(0,_.jsxs)(`div`,{style:{position:`relative`,display:`flex`,alignItems:`center`,gap:`6px`},children:[(0,_.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`6px`,backgroundColor:`var(--color-surface)`,border:`1.5px solid var(--color-border)`,borderRadius:`12px`,padding:`0 10px`,height:`42px`},children:[(0,_.jsx)(te,{size:15,style:{color:`var(--color-primary-ui)`}}),(0,_.jsx)(fe,{size:15,style:{color:`var(--color-text-secondary)`}}),(0,_.jsx)(`input`,{type:`date`,style:{border:`none`,background:`transparent`,color:`var(--color-text-primary)`,fontSize:`12.5px`,fontWeight:`600`,outline:`none`,fontFamily:`inherit`},value:M,onChange:e=>{Oe(e.target.value),O(1)},title:l===`ar`?`تصفية حسب التاريخ`:`Filter by Date`})]}),M&&(0,_.jsx)(`button`,{type:`button`,onClick:()=>{Oe(``),O(1)},style:{position:`absolute`,left:l===`ar`?`8px`:`auto`,right:l===`ar`?`auto`:`8px`,background:`transparent`,border:`none`,color:`var(--color-text-secondary)`,cursor:`pointer`},children:(0,_.jsx)(ue,{size:14})})]}),h(`communications`,`delete`)&&x.length>0&&(0,_.jsxs)(`button`,{onClick:Re,style:{height:`42px`,padding:`0 16px`,borderRadius:`12px`,border:`1.5px solid rgba(239, 68, 68, 0.3)`,backgroundColor:`rgba(239, 68, 68, 0.06)`,color:`#ef4444`,fontSize:`12.5px`,fontWeight:`800`,cursor:`pointer`,display:`flex`,alignItems:`center`,gap:`6px`},children:[(0,_.jsx)(ie,{size:15}),(0,_.jsx)(`span`,{children:l===`ar`?`حذف الكل`:`Delete All`})]}),h(`communications`,`create`)&&(0,_.jsxs)(`button`,{onClick:()=>{P(`parents`),U(``),G(``),j(!0)},style:{height:`42px`,padding:`0 20px`,borderRadius:`12px`,fontSize:`13px`,fontWeight:`800`,border:`none`,background:`var(--gradient-brand)`,color:`white`,cursor:`pointer`,display:`flex`,alignItems:`center`,gap:`8px`,boxShadow:`0 6px 18px rgba(30, 80, 142, 0.28)`},children:[(0,_.jsx)(ne,{size:18,strokeWidth:2.5}),(0,_.jsx)(`span`,{children:l===`ar`?`إنشاء إشعار فوري`:`Compose Alert`})]})]})]}),(0,_.jsxs)(`div`,{className:`notif-filter-chips`,children:[(0,_.jsxs)(`button`,{onClick:()=>{A(`all`),O(1)},className:`notif-chip-btn ${k===`all`?`active`:``}`,children:[(0,_.jsx)(`span`,{children:l===`ar`?`الكل`:`All`}),(0,_.jsx)(`span`,{className:`notif-chip-counter`,children:x.length})]}),(0,_.jsxs)(`button`,{onClick:()=>{A(`all_users`),O(1)},className:`notif-chip-btn ${k===`all_users`?`active`:``}`,children:[(0,_.jsx)(a,{size:14}),(0,_.jsx)(`span`,{children:l===`ar`?`جميع المستخدمين`:`All Users`})]}),(0,_.jsxs)(`button`,{onClick:()=>{A(`parents`),O(1)},className:`notif-chip-btn ${k===`parents`?`active`:``}`,children:[(0,_.jsx)(p,{size:14}),(0,_.jsx)(`span`,{children:l===`ar`?`أولياء الأمور`:`Parents`})]}),(0,_.jsxs)(`button`,{onClick:()=>{A(`classes`),O(1)},className:`notif-chip-btn ${k===`classes`?`active`:``}`,children:[(0,_.jsx)(s,{size:14}),(0,_.jsx)(`span`,{children:l===`ar`?`الصفوف`:`Classes`})]}),(0,_.jsxs)(`button`,{onClick:()=>{A(`teachers`),O(1)},className:`notif-chip-btn ${k===`teachers`?`active`:``}`,children:[(0,_.jsx)(c,{size:14}),(0,_.jsx)(`span`,{children:l===`ar`?`المعلمون`:`Teachers`})]}),(0,_.jsxs)(`button`,{onClick:()=>{A(`private`),O(1)},className:`notif-chip-btn ${k===`private`?`active`:``}`,children:[(0,_.jsx)(m,{size:14}),(0,_.jsx)(`span`,{children:l===`ar`?`إشعار خاص`:`Private Alerts`})]})]})]}),(0,_.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,justifyContent:`space-between`,margin:`4px 0 -8px 0`},children:[(0,_.jsxs)(`h4`,{style:{fontSize:`15px`,fontWeight:`800`,color:`var(--color-text-primary)`,margin:0,display:`flex`,alignItems:`center`,gap:`8px`},children:[(0,_.jsx)(he,{size:18,style:{color:`var(--color-primary-ui)`}}),(0,_.jsx)(`span`,{children:l===`ar`?`سجل الإرسال التاريخي`:`Historical Dispatch Log`})]}),(0,_.jsxs)(`span`,{style:{fontSize:`12px`,fontWeight:`800`,background:`var(--color-surface-alt)`,border:`1px solid var(--color-border)`,padding:`2px 10px`,borderRadius:`12px`,color:`var(--color-text-secondary)`},children:[Z.length,` `,l===`ar`?`إشعار`:`alerts`]})]}),Se?(0,_.jsx)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`12px`},children:[1,2,3].map(e=>(0,_.jsx)(`div`,{style:{height:`110px`,borderRadius:`18px`,backgroundColor:`var(--color-surface-alt)`,border:`1.5px solid var(--color-border)`,opacity:.6,animation:`pulse 1.5s infinite ease-in-out`}},e))}):Z.length>0?(0,_.jsxs)(`div`,{className:`notif-feed-list`,children:[Z.map(e=>Qe(e)),(0,_.jsx)(`div`,{className:`no-print`,style:{marginTop:`var(--space-md)`},children:(0,_.jsx)(n,{page:T,lastPage:S.lastPage,total:S.total,from:S.from,to:S.to,perPage:E,onPageChange:O,onPerPageChange:Te,loading:Se,lang:l})})]}):(0,_.jsxs)(`div`,{style:{padding:`60px 24px`,textAlign:`center`,backgroundColor:`var(--color-surface-alt)`,borderRadius:`24px`,border:`1.5px dashed var(--color-border)`,display:`flex`,flexDirection:`column`,alignItems:`center`,justifyContent:`center`,gap:`12px`},children:[(0,_.jsx)(`div`,{style:{width:`64px`,height:`64px`,borderRadius:`20px`,backgroundColor:`rgba(30, 80, 142, 0.08)`,color:`var(--color-primary-ui)`,display:`flex`,alignItems:`center`,justifyContent:`center`},children:(0,_.jsx)(f,{size:32})}),(0,_.jsx)(`h3`,{style:{fontSize:`16px`,fontWeight:`800`,color:`var(--color-text-primary)`,margin:0},children:D?l===`ar`?`لا توجد نتائج تطابق كلمة البحث`:`No notifications match search`:l===`ar`?`لا توجد إشعارات مسجلة في هذا التبويب`:`No notifications found in this tab`}),(0,_.jsx)(`p`,{style:{fontSize:`13px`,color:`var(--color-text-secondary)`,margin:0,maxWidth:`400px`,lineHeight:1.5},children:l===`ar`?`يمكنك التبديل بين التبويبات أو النقر على "إنشاء إشعار فوري" لإرسال تنبيه جديد.`:`Switch tabs or click "Compose Alert" to broadcast a new notification.`}),h(`communications`,`create`)&&(0,_.jsxs)(`button`,{onClick:()=>{let e=`parents`;k===`all_users`?e=`all_users`:k===`parents`?e=`parents`:k===`classes`?e=`class`:k===`teachers`?e=`teachers`:k===`private`&&(e=`student`),P(e),e===`class`&&b.length>0&&!R&&z(b[0]),e===`student`&&C.length>0&&!I&&L(C[0].id),e===`teacher`&&w.length>0&&!B&&V(w[0].id),U(``),G(``),j(!0)},style:{marginTop:`8px`,height:`38px`,padding:`0 18px`,borderRadius:`10px`,fontSize:`12.5px`,fontWeight:`800`,border:`none`,backgroundColor:`var(--color-primary-ui)`,color:`white`,cursor:`pointer`,display:`flex`,alignItems:`center`,gap:`6px`},children:[(0,_.jsx)(ne,{size:16}),(0,_.jsx)(`span`,{children:l===`ar`?`إنشاء إشعار جديد الآن`:`Compose Alert Now`})]})]}),De&&(0,_.jsx)(`div`,{className:`modal-overlay no-print`,style:{backdropFilter:`blur(8px)`},children:(0,_.jsxs)(`div`,{className:`modal-container`,style:{maxWidth:`640px`,borderRadius:`24px`,overflow:`hidden`},children:[(0,_.jsxs)(`header`,{className:`modal-header`,style:{padding:`20px 24px`,borderBottom:`1px solid var(--color-border)`},children:[(0,_.jsxs)(`h3`,{className:`modal-title`,style:{fontSize:`16px`,fontWeight:`800`,display:`flex`,alignItems:`center`,gap:`8px`},children:[(0,_.jsx)(me,{size:18,style:{color:`var(--color-primary-ui)`}}),(0,_.jsx)(`span`,{children:l===`ar`?`إرسال ونشر إشعار فوري جديد`:`Compose Instant Announcement`})]}),(0,_.jsx)(`button`,{className:`modal-close-btn`,type:`button`,onClick:()=>j(!1),style:{background:`#ef4444`,color:`white`,width:`32px`,height:`32px`,borderRadius:`50%`,display:`flex`,alignItems:`center`,justifyContent:`center`,border:`none`,cursor:`pointer`,transition:`background 0.2s`},onMouseEnter:e=>e.currentTarget.style.background=`#dc2626`,onMouseLeave:e=>e.currentTarget.style.background=`#ef4444`,children:(0,_.jsx)(ue,{size:16})})]}),(0,_.jsxs)(`form`,{onSubmit:Be,children:[(0,_.jsxs)(`div`,{className:`modal-body`,style:{padding:`20px 24px`,display:`flex`,flexDirection:`column`,gap:`16px`},children:[(0,_.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`6px`},children:[(0,_.jsxs)(`label`,{style:{fontSize:`12px`,fontWeight:`800`,color:`var(--color-primary-ui)`,display:`flex`,alignItems:`center`,gap:`6px`},children:[(0,_.jsx)(a,{size:14}),(0,_.jsx)(`span`,{children:l===`ar`?`قوالب جاهزة بنقرة واحدة:`:`Quick Presets:`})]}),(0,_.jsxs)(`div`,{className:`preset-templates-container`,children:[(0,_.jsxs)(`button`,{type:`button`,className:`preset-template-chip`,onClick:()=>J(`general_announcement`),children:[(0,_.jsx)(le,{size:13,style:{color:`var(--color-primary-ui)`}}),(0,_.jsx)(`span`,{children:l===`ar`?`تعميم إداري`:`General Notice`})]}),(0,_.jsxs)(`button`,{type:`button`,className:`preset-template-chip`,onClick:()=>J(`exam`),children:[(0,_.jsx)(fe,{size:13,style:{color:`#0284c7`}}),(0,_.jsx)(`span`,{children:l===`ar`?`جدول الاختبارات`:`Exam Schedule`})]}),(0,_.jsxs)(`button`,{type:`button`,className:`preset-template-chip`,onClick:()=>J(`parents_meeting`),children:[(0,_.jsx)(p,{size:13,style:{color:`#8b5cf6`}}),(0,_.jsx)(`span`,{children:l===`ar`?`اجتماع أولياء الأمور`:`Parents Meeting`})]}),(0,_.jsxs)(`button`,{type:`button`,className:`preset-template-chip`,onClick:()=>J(`absence`),children:[(0,_.jsx)(r,{size:13,style:{color:`#d97706`}}),(0,_.jsx)(`span`,{children:l===`ar`?`تنبيه مواظبة`:`Attendance Alert`})]})]})]}),(0,_.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`8px`},children:[(0,_.jsxs)(`label`,{style:{fontSize:`12px`,fontWeight:`800`,color:`var(--color-text-primary)`},children:[`🎯`,` `,l===`ar`?`اختر الفئة المستهدفة:`:`Select Target Audience:`]}),(0,_.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:`repeat(auto-fill, minmax(150px, 1fr))`,gap:`10px`},children:[(0,_.jsxs)(`div`,{onClick:()=>P(`all_users`),style:{padding:`10px 8px`,borderRadius:`12px`,border:N===`all_users`?`2px solid var(--color-primary-ui)`:`1px solid var(--color-border)`,background:N===`all_users`?`rgba(30, 80, 142, 0.08)`:`var(--color-surface)`,color:N===`all_users`?`var(--color-primary-ui)`:`var(--color-text-primary)`,cursor:`pointer`,textAlign:`center`,fontSize:`11.5px`,fontWeight:`700`},children:[(0,_.jsx)(a,{size:18,style:{margin:`0 auto 4px auto`,display:`block`}}),(0,_.jsx)(`span`,{children:l===`ar`?`جميع المستخدمين`:`All Users`})]}),(0,_.jsxs)(`div`,{onClick:()=>P(`parents`),style:{padding:`10px 8px`,borderRadius:`12px`,border:N===`parents`?`2px solid var(--color-primary-ui)`:`1px solid var(--color-border)`,background:N===`parents`?`rgba(30, 80, 142, 0.08)`:`var(--color-surface)`,color:N===`parents`?`var(--color-primary-ui)`:`var(--color-text-primary)`,cursor:`pointer`,textAlign:`center`,fontSize:`11.5px`,fontWeight:`700`},children:[(0,_.jsx)(p,{size:18,style:{margin:`0 auto 4px auto`,display:`block`}}),(0,_.jsx)(`span`,{children:u.targetAllParents})]}),(0,_.jsxs)(`div`,{onClick:()=>{P(`class`),b.length>0&&!R&&z(b[0])},style:{padding:`10px 8px`,borderRadius:`12px`,border:N===`class`?`2px solid var(--color-primary-ui)`:`1px solid var(--color-border)`,background:N===`class`?`rgba(30, 80, 142, 0.08)`:`var(--color-surface)`,color:N===`class`?`var(--color-primary-ui)`:`var(--color-text-primary)`,cursor:`pointer`,textAlign:`center`,fontSize:`11.5px`,fontWeight:`700`},children:[(0,_.jsx)(s,{size:18,style:{margin:`0 auto 4px auto`,display:`block`}}),(0,_.jsx)(`span`,{children:u.targetByClass})]}),(0,_.jsxs)(`div`,{onClick:()=>{P(`student`),C.length>0&&!I&&L(C[0].id)},style:{padding:`10px 8px`,borderRadius:`12px`,border:N===`student`?`2px solid var(--color-primary-ui)`:`1px solid var(--color-border)`,background:N===`student`?`rgba(30, 80, 142, 0.08)`:`var(--color-surface)`,color:N===`student`?`var(--color-primary-ui)`:`var(--color-text-primary)`,cursor:`pointer`,textAlign:`center`,fontSize:`11.5px`,fontWeight:`700`},children:[(0,_.jsx)(m,{size:18,style:{margin:`0 auto 4px auto`,display:`block`}}),(0,_.jsx)(`span`,{children:u.targetByStudent})]}),(0,_.jsxs)(`div`,{onClick:()=>P(`teachers`),style:{padding:`10px 8px`,borderRadius:`12px`,border:N===`teachers`?`2px solid var(--color-primary-ui)`:`1px solid var(--color-border)`,background:N===`teachers`?`rgba(30, 80, 142, 0.08)`:`var(--color-surface)`,color:N===`teachers`?`var(--color-primary-ui)`:`var(--color-text-primary)`,cursor:`pointer`,textAlign:`center`,fontSize:`11.5px`,fontWeight:`700`},children:[(0,_.jsx)(p,{size:18,style:{margin:`0 auto 4px auto`,display:`block`}}),(0,_.jsx)(`span`,{children:u.targetAllTeachers})]}),(0,_.jsxs)(`div`,{onClick:()=>{P(`teacher`),w.length>0&&!B&&V(w[0].id)},style:{padding:`10px 8px`,borderRadius:`12px`,border:N===`teacher`?`2px solid var(--color-primary-ui)`:`1px solid var(--color-border)`,background:N===`teacher`?`rgba(30, 80, 142, 0.08)`:`var(--color-surface)`,color:N===`teacher`?`var(--color-primary-ui)`:`var(--color-text-primary)`,cursor:`pointer`,textAlign:`center`,fontSize:`11.5px`,fontWeight:`700`},children:[(0,_.jsx)(c,{size:18,style:{margin:`0 auto 4px auto`,display:`block`}}),(0,_.jsx)(`span`,{children:l===`ar`?`حسب المعلم`:`By Teacher`})]})]})]}),N===`student`&&(0,_.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`6px`},children:[(0,_.jsxs)(`label`,{style:{fontSize:`11.5px`,fontWeight:`700`},children:[`🔍 `,u.selectStudent]}),(0,_.jsx)(`input`,{type:`text`,placeholder:l===`ar`?`ابحث باسم الطالب أو الرقم الأكاديمي...`:`Search by student name or ID...`,value:Me,onChange:e=>Ne(e.target.value),className:`text-field`,style:{height:`36px`,fontSize:`12px`,padding:`0 10px`}}),(0,_.jsx)(`select`,{value:K,onChange:e=>L(e.target.value),className:`text-field`,style:{minHeight:`45px`,fontSize:`14px`,padding:`0 12px`,boxSizing:`border-box`,lineHeight:`normal`},children:Xe.map(e=>(0,_.jsx)(`option`,{value:e.id,children:l===`ar`?e.name:e.nameEn||e.name},e.id))})]}),N===`class`&&(0,_.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`6px`},children:[(0,_.jsxs)(`label`,{style:{fontSize:`11.5px`,fontWeight:`700`},children:[`🏫 `,u.selectClass]}),(0,_.jsx)(`select`,{value:Ie,onChange:e=>z(e.target.value),className:`text-field`,style:{minHeight:`45px`,fontSize:`14px`,padding:`0 12px`,boxSizing:`border-box`,lineHeight:`normal`},children:F.map(e=>(0,_.jsx)(`option`,{value:e,children:e},e))})]}),N===`teacher`&&(0,_.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`6px`},children:[(0,_.jsxs)(`label`,{style:{fontSize:`11.5px`,fontWeight:`700`},children:[`🔍 `,l===`ar`?`إختيار المعلم`:`Select Teacher`]}),(0,_.jsx)(`input`,{type:`text`,placeholder:l===`ar`?`ابحث باسم المعلم أو الرقم الوظيفي...`:`Search by teacher name or Job ID...`,value:Pe,onChange:e=>Fe(e.target.value),className:`text-field`,style:{height:`36px`,fontSize:`12px`,padding:`0 10px`}}),(0,_.jsx)(`select`,{value:q,onChange:e=>V(e.target.value),className:`text-field`,style:{minHeight:`45px`,fontSize:`14px`,padding:`0 12px`,boxSizing:`border-box`,lineHeight:`normal`},children:Ze.map(e=>(0,_.jsx)(`option`,{value:e.id,children:l===`ar`?e.name:e.nameEn||e.name},e.id))})]}),(0,_.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`4px`},children:[(0,_.jsxs)(`label`,{style:{fontSize:`12px`,fontWeight:`800`,color:`var(--color-text-primary)`},children:[`📝 `,u.notificationTitleLabel]}),(0,_.jsx)(`input`,{type:`text`,value:H,onChange:e=>U(e.target.value),placeholder:l===`ar`?`عنوان الإشعار...`:`Notification title...`,className:`text-field`,style:{height:`38px`,fontSize:`12px`,padding:`0 12px`},required:!0})]}),(0,_.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`4px`},children:[(0,_.jsxs)(`label`,{style:{fontSize:`12px`,fontWeight:`800`,color:`var(--color-text-primary)`},children:[`💬 `,u.notificationContentLabel]}),(0,_.jsx)(`textarea`,{value:W,onChange:e=>G(e.target.value),placeholder:l===`ar`?`محتوى وتفاصيل البلاغ...`:`Notification content...`,className:`text-field`,style:{minHeight:`90px`,fontSize:`12px`,padding:`10px 12px`,resize:`vertical`},required:!0})]})]}),(0,_.jsxs)(`footer`,{className:`modal-footer`,style:{padding:`14px 24px`,borderTop:`1px solid var(--color-border)`,display:`flex`,justifyContent:`flex-end`,gap:`10px`},children:[(0,_.jsx)(`button`,{type:`button`,className:`btn-elevated`,onClick:()=>j(!1),style:{height:`36px`,padding:`0 16px`,borderRadius:`8px`,fontSize:`12px`,cursor:`pointer`},children:u.cancel}),(0,_.jsxs)(`button`,{type:`submit`,style:{height:`36px`,padding:`0 20px`,borderRadius:`8px`,fontSize:`12px`,fontWeight:`800`,background:`var(--gradient-brand)`,color:`white`,border:`none`,cursor:`pointer`,display:`flex`,alignItems:`center`,gap:`6px`},children:[(0,_.jsx)(me,{size:14}),(0,_.jsx)(`span`,{children:l===`ar`?`إرسال ونشر الآن`:`Broadcast Now`})]})]})]})]})})]});function Qe(t){let n=t.type===`student`?C.find(e=>e.id===Number(t.studentId)):null,r=Ye(t,n?n.name:t.studentName,n?n.nameEn:t.studentNameEn,t.teacherName,t.teacherNameEn),a=He(t.date),te=Y(t.date);return(0,_.jsxs)(`div`,{className:`notif-card-modern ${t.isRead?``:`unread`}`,onClick:()=>{t.isRead||ve(t.id)},children:[(0,_.jsxs)(`div`,{className:`notif-card-header`,children:[(0,_.jsxs)(`div`,{className:`notif-card-title-area`,children:[(0,_.jsx)(`div`,{className:`notif-card-avatar`,style:{backgroundColor:r.bgGlow,color:r.textColor,border:`1px solid ${r.borderColor}`},children:r.icon}),(0,_.jsxs)(`div`,{children:[(0,_.jsxs)(`h4`,{className:`notif-card-title`,children:[t.title,!t.isRead&&(0,_.jsx)(`span`,{style:{fontSize:`10.5px`,fontWeight:`800`,background:`#ef4444`,color:`white`,padding:`1px 8px`,borderRadius:`10px`,marginInlineStart:`8px`,display:`inline-block`,verticalAlign:`middle`},children:l===`ar`?`جديد`:`New`})]}),(0,_.jsxs)(`div`,{className:`notif-card-meta`,children:[(0,_.jsxs)(`span`,{style:{fontSize:`11px`,fontWeight:`700`,color:r.textColor,background:r.bgGlow,padding:`2px 8px`,borderRadius:`8px`,border:`1px solid ${r.borderColor}`,display:`inline-flex`,alignItems:`center`,gap:`4px`},children:[(0,_.jsx)(pe,{size:11,style:{opacity:.8}}),(0,_.jsx)(`span`,{children:r.label})]}),(0,_.jsxs)(`span`,{style:{fontSize:`11.5px`,color:`var(--color-text-secondary)`,fontWeight:`600`,display:`inline-flex`,alignItems:`center`,gap:`4px`},children:[(0,_.jsx)(o,{size:13,style:{color:`var(--color-primary-ui)`,opacity:.8}}),(0,_.jsxs)(`span`,{children:[a,` (`,te,`)`]})]})]})]})]}),(0,_.jsxs)(`div`,{className:`notif-action-btn-group no-print`,onClick:e=>e.stopPropagation(),children:[!t.isRead&&(0,_.jsx)(`button`,{className:`notif-icon-btn`,onClick:()=>ve(t.id),title:l===`ar`?`تحديد كمقروء`:`Mark as read`,children:(0,_.jsx)(e,{size:14})}),(0,_.jsx)(`button`,{className:`notif-icon-btn`,onClick:e=>ze(e,t),title:l===`ar`?`نسخ نص الإشعار`:`Copy notification text`,children:ke===t.id?(0,_.jsx)(e,{size:14,style:{color:`var(--color-success)`}}):(0,_.jsx)(ee,{size:14})}),h(`communications`,`delete`)&&(0,_.jsx)(`button`,{className:`notif-icon-btn danger`,onClick:e=>Le(e,t.id),title:l===`ar`?`حذف الإشعار`:`Delete notification`,children:(0,_.jsx)(ie,{size:14})})]})]}),(0,_.jsx)(`p`,{className:`notif-card-body`,children:t.content}),(0,_.jsxs)(`div`,{className:`notif-card-footer`,children:[(0,_.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`16px`,flexWrap:`wrap`},children:[(0,_.jsxs)(`span`,{children:[`✍️ `,l===`ar`?`المرسل: `:`Sender: `,(0,_.jsx)(`strong`,{children:Ve(t).name})]}),(0,_.jsxs)(`span`,{children:[`🎯 `,l===`ar`?`الموجه إليه: `:`Recipient: `,(0,_.jsx)(`strong`,{style:{color:`var(--color-primary-ui)`},children:Je(t)})]})]}),(0,_.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`5px`,color:`var(--color-success)`},children:[(0,_.jsx)(i,{size:13}),(0,_.jsx)(`span`,{children:l===`ar`?`تم النشر كإشعار فوري وتنبيه SMS`:`Sent via Push & SMS`})]})]})]},t.id)}}function y(){return(0,_.jsx)(v,{})}export{y as default};