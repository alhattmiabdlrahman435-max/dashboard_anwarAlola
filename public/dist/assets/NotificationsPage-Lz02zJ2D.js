import{d as e,l as t,n,o as r}from"./AppContext-YMbpJ_Ut.js";import{n as i,t as a}from"./PaginationBar-CpLW5JNW.js";import{t as o}from"./copy-BwtP6Oss.js";import{t as s}from"./plus-dKk5viKX.js";import{t as c}from"./search-CjpJr6gk.js";import{t as l}from"./trash-2-BYlO5-HH.js";import{t as u}from"./user-CIi7wiHH.js";import{A as ee,C as te,D as ne,S as d,i as f,r as p,t as re,u as m,x as h}from"./index-DdBOvBzK.js";var ie=d(`check-check`,[[`path`,{d:`M18 6 7 17l-5-5`,key:`116fxf`}],[`path`,{d:`m22 10-7.5 7.5L13 16`,key:`ke71qq`}]]),ae=d(`check`,[[`path`,{d:`M20 6 9 17l-5-5`,key:`1gmf2c`}]]),g=d(`circle-check`,[[`circle`,{cx:`12`,cy:`12`,r:`10`,key:`1mglay`}],[`path`,{d:`m9 12 2 2 4-4`,key:`dzmm74`}]]),oe=d(`info`,[[`circle`,{cx:`12`,cy:`12`,r:`10`,key:`1mglay`}],[`path`,{d:`M12 16v-4`,key:`1dtifu`}],[`path`,{d:`M12 8h.01`,key:`e9boi3`}]]),_=d(`layers`,[[`path`,{d:`M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z`,key:`zw3jo`}],[`path`,{d:`M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12`,key:`1wduqc`}],[`path`,{d:`M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17`,key:`kqbvx6`}]]),v=d(`send`,[[`path`,{d:`M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z`,key:`1ffxy3`}],[`path`,{d:`m21.854 2.147-10.94 10.939`,key:`12cjpa`}]]),se=d(`sparkles`,[[`path`,{d:`M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z`,key:`1s2grr`}],[`path`,{d:`M20 2v4`,key:`1rf3ol`}],[`path`,{d:`M22 4h-4`,key:`gwowj6`}],[`circle`,{cx:`4`,cy:`20`,r:`2`,key:`6kqj1y`}]]),ce=d(`volume-2`,[[`path`,{d:`M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z`,key:`uqj9uw`}],[`path`,{d:`M16 9a5 5 0 0 1 0 6`,key:`1q6k2b`}],[`path`,{d:`M19.364 18.364a9 9 0 0 0 0-12.728`,key:`ijwkga`}]]),y=e(t(),1),b=r();function x(){let{lang:e,t,triggerConfirm:r,canAction:d,setToastMessage:x}=n(),{availableGrades:S,fetchClasses:C}=ee(),{notifications:w,notificationsPagination:T,handleSendNotification:le,handleMarkNotificationAsRead:E,handleDeleteNotification:ue,handleDeleteAllNotifications:de,fetchNotifications:fe,loading:pe}=ne(),{students:D,fetchStudents:me}=re(),{teachers:O,fetchTeachers:k}=te(),{page:A,perPage:j,search:M,setPage:he,setPerPage:ge,setSearch:_e}=i({moduleKey:`notifications`}),[N,P]=(0,y.useState)(`all`),[ve,F]=(0,y.useState)(!1),[I,L]=(0,y.useState)(``),[ye,R]=(0,y.useState)(null),z=(0,y.useMemo)(()=>{let e=new URLSearchParams;return e.set(`page`,A),e.set(`per_page`,j),M&&e.set(`search`,M),N===`parents`?e.set(`type`,`broadcast_parents`):N===`teachers`?e.set(`type`,`broadcast_teachers`):(N===`classes`||N===`private`)&&e.set(`type`,`broadcast`),`?`+e.toString()},[A,j,M,N]);(0,y.useEffect)(()=>{fe(z)},[fe,z]),(0,y.useEffect)(()=>{C(),me(),k()},[C,me,k]);let[B,V]=(0,y.useState)(`parents`),[H,U]=(0,y.useState)(D.length>0?D[0].id:``),[W,be]=(0,y.useState)(S.length>0?S[0]:``),[xe,Se]=(0,y.useState)(O.length>0?O[0].id:``),[G,K]=(0,y.useState)(``),[q,J]=(0,y.useState)(``),[Y,Ce]=(0,y.useState)(``),[X,we]=(0,y.useState)(``),Te=(t,n)=>{t.stopPropagation(),r({title:e===`ar`?`حذف الإشعار`:`Delete Notification`,message:e===`ar`?`هل أنت متأكد من حذف هذا الإشعار نهائياً؟`:`Are you sure you want to permanently delete this notification?`,onConfirm:()=>{ue(n)}})},Ee=()=>{r({title:e===`ar`?`حذف جميع الإشعارات`:`Delete All Notifications`,message:e===`ar`?`هل أنت متأكد من حذف جميع الإشعارات نهائياً؟ هذا الإجراء لا يمكن التراجع عنه!`:`Are you sure you want to delete all notifications permanently? This action cannot be undone!`,onConfirm:()=>{de()}})},De=(t,n)=>{t.stopPropagation();let r=`${n.title}\n${n.content}`;navigator.clipboard.writeText(r),R(n.id),x&&x(e===`ar`?`تم نسخ نص الإشعار بنجاح`:`Notification content copied`),setTimeout(()=>R(null),2e3)},Z=t=>{t===`absence`?(K(e===`ar`?`تنبيه غياب وتأخر دراسي`:`Absence & Attendance Alert`),J(e===`ar`?`نود إحاطتكم بحضور ومواظبة الطالب/الطالبة، نرجو المتابعة الحثيثة والتواصل مع إدارة المدرسة لضمان التفوق.`:`We would like to inform you regarding student attendance. Please follow up with school administration.`)):t===`exam`?(K(e===`ar`?`إعلان جدول الاختبارات النهائية`:`Final Exam Schedule Announcement`),J(e===`ar`?`تم اعتماد ونشر جدول الاختبارات التقييمية. نرجو الحرص على مراجعة المقررات والالتزام بالحضور في المواعيد المحددة.`:`The evaluation exam schedule has been published. Please ensure thorough revision and timely attendance.`)):t===`parents_meeting`?(K(e===`ar`?`دعوة لاجتماع أولياء الأمور الدوري`:`Parents-Teachers Meeting Invitation`),J(e===`ar`?`يسر إدارة المدرسة دعوتكم لحضور الاجتماع الدوري لمناقشة المستوى الأكاديمي والتربوي لأبنائنا الطلاب يوم الخميس القادم.`:`You are cordially invited to attend the periodic parents meeting next Thursday.`)):t===`general_announcement`&&(K(e===`ar`?`تعميم إداري هام للجميع`:`Important School Announcement`),J(e===`ar`?`تود إدارة رياض ومدارس أنوار العلى الدولية تذكير جميع الطلاب وأولياء الأمور بالتعليمات والأنشطة القادمة.`:`Anwar Al-Ola Int. Model Schools would like to remind all students & parents of upcoming activities.`))},Oe=t=>{if(t.preventDefault(),!G.trim()||!q.trim())return;let n=new Date().toISOString().replace(`T`,` `).substring(0,16),r={};if(B===`student`){let e=D.find(e=>e.id===Number(H));r={studentId:Number(H),studentName:e?e.name:null,studentNameEn:e?e.nameEn:null,grade:e?e.grade:null}}else if(B===`class`)r={grade:W};else if(B===`teacher`){let e=O.find(e=>e.id===Number(xe));r={teacherId:Number(xe),teacherName:e?e.name:null,teacherNameEn:e?e.nameEn:null}}let i={id:Date.now(),title:G,content:q,date:n,type:B,...r},a=[];if(B===`student`){let t=D.find(e=>e.id===Number(H));if(t){let r=e===`ar`?`تنبيه خاص بخصوص ابنكم ${t.name}: ${G} - ${q}. رياض و مدارس انوار العلى.`:`Private alert for ${t.nameEn}: ${G} - ${q}. Riyadh & Anwar Al-Ola.`;a.push({id:Date.now(),studentId:t.id,recipient:t.phone,text:r,time:n.split(` `)[1],type:`present`})}}else B===`class`?D.filter(e=>e.grade===W).forEach((t,r)=>{let i=e===`ar`?`تعميم لصف ${W}: ${G} - ${q}.`:`Class announcement for ${W}: ${G} - ${q}.`;a.push({id:Date.now()+Math.random()+r,studentId:t.id,recipient:t.phone,text:i,time:n.split(` `)[1],type:`present`})}):B===`parents`&&D.forEach((t,r)=>{let i=e===`ar`?`إشعار عام من المدرسة لأولياء الأمور: ${G} - ${q}.`:`Broadcast Announcement to Parents: ${G} - ${q}.`;a.push({id:Date.now()+Math.random()+r,studentId:t.id,recipient:t.phone,text:i,time:n.split(` `)[1],type:`present`})});le(i,a),F(!1),K(``),J(``),Ce(``),we(``)},ke=(0,y.useCallback)(t=>t.type===`attendance`?{name:e===`ar`?`مشرف التحضير`:`Prep Supervisor`,key:`supervisor`}:{name:e===`ar`?`إدارة المدرسة`:`School Administration`,key:`admin`},[e]),Q=(0,y.useCallback)(t=>{if(!t)return``;try{let n=new Date(t.replace(` `,`T`));if(isNaN(n.getTime())&&(n=new Date(t)),isNaN(n.getTime()))return t;let r=n.getFullYear(),i=String(n.getMonth()+1).padStart(2,`0`),a=String(n.getDate()).padStart(2,`0`),o=n.getHours(),s=String(n.getMinutes()).padStart(2,`0`),c=o>=12?e===`ar`?`م`:`PM`:e===`ar`?`ص`:`AM`;return o%=12,o||=12,`${r}-${i}-${a} ${String(o).padStart(2,`0`)}:${s} ${c}`}catch{return t}},[e]),Ae=(0,y.useCallback)(t=>{if(!t)return``;try{let n=new Date(t.replace(` `,`T`)),r=new Date-n,i=Math.floor(r/(1e3*60)),a=Math.floor(r/(1e3*60*60)),o=Math.floor(r/(1e3*60*60*24));return i<2?e===`ar`?`الآن`:`Just now`:i<60?e===`ar`?`منذ ${i} دقيقة`:`${i}m ago`:a<24?e===`ar`?`منذ ${a} ساعة`:`${a}h ago`:o===1?e===`ar`?`أمس`:`Yesterday`:o<7?e===`ar`?`منذ ${o} أيام`:`${o}d ago`:Q(t)}catch{return t}},[e,Q]),je=T.total||w.length,Me=(0,y.useMemo)(()=>w.filter(e=>e.type===`general`||e.type===`parents`||e.type===`broadcast_parents`).length,[w]),Ne=(0,y.useMemo)(()=>w.filter(e=>e.type===`class`).length,[w]),Pe=(0,y.useMemo)(()=>w.filter(e=>e.type===`student`||e.type===`private`||e.type===`teacher`).length,[w]),$=(0,y.useMemo)(()=>w.filter(e=>I&&!e.date.startsWith(I)?!1:N===`parents`?e.type===`parents`||e.type===`general`||e.type===`broadcast_parents`:N===`classes`?e.type===`class`:N===`teachers`?e.type===`teachers`||e.type===`teacher`||e.type===`broadcast_teachers`:N===`private`?e.type===`student`||e.type===`private`:!0),[w,I,N]);(0,y.useMemo)(()=>{let e=new Date().toISOString().substring(0,10),t=new Date;t.setDate(t.getDate()-1);let n=t.toISOString().substring(0,10),r={today:[],yesterday:[],earlier:[]};return $.forEach(t=>{let i=t.date?t.date.substring(0,10):``;i===e?r.today.push(t):i===n?r.yesterday.push(t):r.earlier.push(t)}),r},[$]);let Fe=(0,y.useMemo)(()=>w.filter(e=>!e.isRead).length,[w]),Ie=(t,n)=>{if(t&&t!==`null`&&t!==`NULL`&&t!==`undefined`)return t;if(n){let e=D.find(e=>e.id===Number(n));if(e&&e.grade&&e.grade!==`null`)return e.grade}return e===`ar`?`العام الدراسي`:`General Grade`},Le=(t,n,r,i,a,o,s)=>{let c=Ie(n,r);if(t===`general`||t===`parents`||t===`broadcast_parents`)return{label:e===`ar`?`تعميم عام لأولياء الأمور`:`All Parents Broadcast`,bgGlow:`rgba(30, 80, 142, 0.08)`,borderColor:`var(--color-primary-ui)`,textColor:`var(--color-primary-ui)`,icon:(0,b.jsx)(f,{size:16})};if(t===`class`)return{label:e===`ar`?`الصف: ${c}`:`Class: ${c}`,bgGlow:`rgba(217, 119, 6, 0.08)`,borderColor:`#d97706`,textColor:`#b45309`,icon:(0,b.jsx)(_,{size:16})};if(t===`student`||t===`private`){let t=e===`ar`?i||`طالب مخصص`:a||i||`Private Student`;return{label:e===`ar`?`طالب (${c}): ${t}`:`Student (${c}): ${t}`,bgGlow:`rgba(225, 29, 72, 0.08)`,borderColor:`#e11d48`,textColor:`#be123c`,icon:(0,b.jsx)(m,{size:16})}}else if(t===`teachers`||t===`broadcast_teachers`)return{label:e===`ar`?`تعميم لجميع المعلمين`:`All Teachers Broadcast`,bgGlow:`rgba(16, 185, 129, 0.08)`,borderColor:`#10b981`,textColor:`#047857`,icon:(0,b.jsx)(f,{size:16})};else if(t===`teacher`){let t=e===`ar`?o||`معلم مخصص`:s||o||`Teacher`;return{label:e===`ar`?`المعلم: ${t}`:`Teacher: ${t}`,bgGlow:`rgba(15, 118, 110, 0.08)`,borderColor:`#0f766e`,textColor:`#0f766e`,icon:(0,b.jsx)(u,{size:16})}}return{label:e===`ar`?`إشعار إداري - الصف: ${c}`:`System Alert - Class: ${c}`,bgGlow:`rgba(100, 116, 139, 0.08)`,borderColor:`#64748b`,textColor:`#475569`,icon:(0,b.jsx)(h,{size:16})}},Re=(0,y.useMemo)(()=>D.filter(e=>e.name.toLowerCase().includes(Y.toLowerCase())||e.id.toString().includes(Y)),[D,Y]);return(0,y.useMemo)(()=>O.filter(e=>e.name.toLowerCase().includes(X.toLowerCase())||e.id.toString().includes(X)),[O,X]),(0,b.jsxs)(`div`,{className:`notif-command-center`,children:[(0,b.jsx)(`style`,{children:`
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
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        @media (max-width: 1024px) {
          .notif-stats-grid {
            grid-template-columns: repeat(2, 1fr);
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
      `}),(0,b.jsxs)(`div`,{className:`notif-banner-modern no-print`,children:[(0,b.jsxs)(`div`,{className:`notif-banner-info-left`,children:[(0,b.jsx)(`div`,{className:`notif-banner-icon`,children:(0,b.jsx)(oe,{size:24})}),(0,b.jsxs)(`div`,{className:`notif-banner-text`,children:[(0,b.jsx)(`h3`,{children:e===`ar`?`منصة الاتصالات والإشعارات الموحدة`:`Unified Communications & Alerts Platform`}),(0,b.jsx)(`p`,{children:e===`ar`?`تتيح لك إرسال التنبيهات الفورية الفعالة والتعاميم المباشرة لفئات مختلفة في المدرسة مع تتبع فوري لحالة التسليم.`:`Send instant broadcast notifications and targeted alerts to students, parents, and teachers with live delivery status.`})]})]}),Fe>0&&(0,b.jsxs)(`button`,{onClick:()=>{w.filter(e=>!e.isRead).forEach(e=>E(e.id))},style:{height:`38px`,padding:`0 14px`,borderRadius:`10px`,fontSize:`12px`,fontWeight:`700`,border:`1px solid var(--color-border)`,background:`var(--color-surface)`,color:`var(--color-primary-ui)`,cursor:`pointer`,display:`flex`,alignItems:`center`,gap:`6px`,whiteSpace:`nowrap`},children:[(0,b.jsx)(ie,{size:16}),(0,b.jsx)(`span`,{children:e===`ar`?`تحديد الكل كمقروء`:`Mark All Read`})]})]}),(0,b.jsxs)(`div`,{className:`notif-stats-grid`,children:[(0,b.jsxs)(`div`,{className:`notif-stat-card`,children:[(0,b.jsxs)(`div`,{className:`notif-stat-content`,children:[(0,b.jsx)(`span`,{className:`notif-stat-number`,children:je}),(0,b.jsx)(`span`,{className:`notif-stat-label`,children:e===`ar`?`إجمالي الإشعارات`:`Total Notifications`})]}),(0,b.jsx)(`div`,{className:`notif-stat-icon-wrapper`,style:{background:`linear-gradient(135deg, #1e508e 0%, #103058 100%)`},children:(0,b.jsx)(h,{size:24})})]}),(0,b.jsxs)(`div`,{className:`notif-stat-card`,children:[(0,b.jsxs)(`div`,{className:`notif-stat-content`,children:[(0,b.jsx)(`span`,{className:`notif-stat-number`,children:Me}),(0,b.jsx)(`span`,{className:`notif-stat-label`,children:e===`ar`?`تعاميم أولياء الأمور`:`Parents Broadcasts`})]}),(0,b.jsx)(`div`,{className:`notif-stat-icon-wrapper`,style:{background:`linear-gradient(135deg, #0284c7 0%, #0369a1 100%)`},children:(0,b.jsx)(f,{size:24})})]}),(0,b.jsxs)(`div`,{className:`notif-stat-card`,children:[(0,b.jsxs)(`div`,{className:`notif-stat-content`,children:[(0,b.jsx)(`span`,{className:`notif-stat-number`,children:Ne}),(0,b.jsx)(`span`,{className:`notif-stat-label`,children:e===`ar`?`تعاميم الفصول`:`Class Broadcasts`})]}),(0,b.jsx)(`div`,{className:`notif-stat-icon-wrapper`,style:{background:`linear-gradient(135deg, #d97706 0%, #b45309 100%)`},children:(0,b.jsx)(_,{size:24})})]}),(0,b.jsxs)(`div`,{className:`notif-stat-card`,children:[(0,b.jsxs)(`div`,{className:`notif-stat-content`,children:[(0,b.jsx)(`span`,{className:`notif-stat-number`,children:Pe}),(0,b.jsx)(`span`,{className:`notif-stat-label`,children:e===`ar`?`التنبيهات الفردية`:`Private Alerts`})]}),(0,b.jsx)(`div`,{className:`notif-stat-icon-wrapper`,style:{background:`linear-gradient(135deg, #e11d48 0%, #be123c 100%)`},children:(0,b.jsx)(m,{size:24})})]})]}),(0,b.jsxs)(`div`,{className:`notif-toolbar-container no-print`,children:[(0,b.jsxs)(`div`,{className:`notif-toolbar-top-row`,children:[(0,b.jsxs)(`div`,{className:`notif-search-box`,children:[(0,b.jsx)(c,{size:16,className:`notif-search-icon`}),(0,b.jsx)(`input`,{type:`text`,placeholder:e===`ar`?`البحث في سجل الإشعارات المرسلة...`:`Search notifications history...`,value:M||``,onChange:e=>_e(e.target.value)})]}),(0,b.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`10px`,flexWrap:`wrap`},children:[(0,b.jsxs)(`div`,{style:{position:`relative`,display:`flex`,alignItems:`center`},children:[(0,b.jsx)(`input`,{type:`date`,className:`text-field`,style:{height:`42px`,padding:`0 12px`,borderRadius:`12px`,border:`1.5px solid var(--color-border)`,backgroundColor:`var(--color-surface)`,color:`var(--color-text-primary)`,fontSize:`12.5px`,fontWeight:`600`,outline:`none`},value:I,onChange:e=>L(e.target.value),title:e===`ar`?`تصفية حسب التاريخ`:`Filter by Date`}),I&&(0,b.jsx)(`button`,{type:`button`,onClick:()=>L(``),style:{position:`absolute`,left:e===`ar`?`8px`:`auto`,right:e===`ar`?`auto`:`8px`,background:`transparent`,border:`none`,color:`var(--color-text-secondary)`,cursor:`pointer`},children:(0,b.jsx)(p,{size:14})})]}),d(`communications`,`delete`)&&w.length>0&&(0,b.jsxs)(`button`,{onClick:Ee,style:{height:`42px`,padding:`0 16px`,borderRadius:`12px`,border:`1.5px solid rgba(239, 68, 68, 0.3)`,backgroundColor:`rgba(239, 68, 68, 0.06)`,color:`#ef4444`,fontSize:`12.5px`,fontWeight:`800`,cursor:`pointer`,display:`flex`,alignItems:`center`,gap:`6px`},children:[(0,b.jsx)(l,{size:15}),(0,b.jsx)(`span`,{children:e===`ar`?`حذف الكل`:`Delete All`})]}),d(`communications`,`create`)&&(0,b.jsxs)(`button`,{onClick:()=>{V(`parents`),K(``),J(``),F(!0)},style:{height:`42px`,padding:`0 20px`,borderRadius:`12px`,fontSize:`13px`,fontWeight:`800`,border:`none`,background:`var(--gradient-brand)`,color:`white`,cursor:`pointer`,display:`flex`,alignItems:`center`,gap:`8px`,boxShadow:`0 6px 18px rgba(30, 80, 142, 0.28)`},children:[(0,b.jsx)(s,{size:18,strokeWidth:2.5}),(0,b.jsx)(`span`,{children:e===`ar`?`إنشاء إشعار فوري`:`Compose Alert`})]})]})]}),(0,b.jsxs)(`div`,{className:`notif-filter-chips`,children:[(0,b.jsxs)(`button`,{onClick:()=>P(`all`),className:`notif-chip-btn ${N===`all`?`active`:``}`,children:[(0,b.jsx)(`span`,{children:e===`ar`?`الكل`:`All`}),(0,b.jsx)(`span`,{className:`notif-chip-counter`,children:w.length})]}),(0,b.jsxs)(`button`,{onClick:()=>P(`parents`),className:`notif-chip-btn ${N===`parents`?`active`:``}`,children:[(0,b.jsx)(f,{size:14}),(0,b.jsx)(`span`,{children:e===`ar`?`أولياء الأمور`:`Parents`})]}),(0,b.jsxs)(`button`,{onClick:()=>P(`classes`),className:`notif-chip-btn ${N===`classes`?`active`:``}`,children:[(0,b.jsx)(_,{size:14}),(0,b.jsx)(`span`,{children:e===`ar`?`الصفوف`:`Classes`})]}),(0,b.jsxs)(`button`,{onClick:()=>P(`teachers`),className:`notif-chip-btn ${N===`teachers`?`active`:``}`,children:[(0,b.jsx)(u,{size:14}),(0,b.jsx)(`span`,{children:e===`ar`?`المعلمون`:`Teachers`})]}),(0,b.jsxs)(`button`,{onClick:()=>P(`private`),className:`notif-chip-btn ${N===`private`?`active`:``}`,children:[(0,b.jsx)(m,{size:14}),(0,b.jsx)(`span`,{children:e===`ar`?`إشعار خاص`:`Private Alerts`})]})]})]}),(0,b.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,justifyContent:`space-between`,margin:`4px 0 -8px 0`},children:[(0,b.jsxs)(`h4`,{style:{fontSize:`15px`,fontWeight:`800`,color:`var(--color-text-primary)`,margin:0,display:`flex`,alignItems:`center`,gap:`8px`},children:[(0,b.jsx)(ce,{size:18,style:{color:`var(--color-primary-ui)`}}),(0,b.jsx)(`span`,{children:e===`ar`?`سجل الإرسال التاريخي`:`Historical Dispatch Log`})]}),(0,b.jsxs)(`span`,{style:{fontSize:`12px`,fontWeight:`800`,background:`var(--color-surface-alt)`,border:`1px solid var(--color-border)`,padding:`2px 10px`,borderRadius:`12px`,color:`var(--color-text-secondary)`},children:[$.length,` `,e===`ar`?`إشعار`:`alerts`]})]}),pe?(0,b.jsx)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`12px`},children:[1,2,3].map(e=>(0,b.jsx)(`div`,{style:{height:`110px`,borderRadius:`18px`,backgroundColor:`var(--color-surface-alt)`,border:`1.5px solid var(--color-border)`,opacity:.6,animation:`pulse 1.5s infinite ease-in-out`}},e))}):$.length>0?(0,b.jsxs)(`div`,{className:`notif-feed-list`,children:[$.map(e=>ze(e)),(0,b.jsx)(`div`,{className:`no-print`,style:{marginTop:`var(--space-md)`},children:(0,b.jsx)(a,{page:A,lastPage:T.lastPage,total:T.total,from:T.from,to:T.to,perPage:j,onPageChange:he,onPerPageChange:ge,loading:pe,lang:e})})]}):(0,b.jsxs)(`div`,{style:{padding:`60px 24px`,textAlign:`center`,backgroundColor:`var(--color-surface-alt)`,borderRadius:`24px`,border:`1.5px dashed var(--color-border)`,display:`flex`,flexDirection:`column`,alignItems:`center`,justifyContent:`center`,gap:`12px`},children:[(0,b.jsx)(`div`,{style:{width:`64px`,height:`64px`,borderRadius:`20px`,backgroundColor:`rgba(30, 80, 142, 0.08)`,color:`var(--color-primary-ui)`,display:`flex`,alignItems:`center`,justifyContent:`center`},children:(0,b.jsx)(h,{size:32})}),(0,b.jsx)(`h3`,{style:{fontSize:`16px`,fontWeight:`800`,color:`var(--color-text-primary)`,margin:0},children:M?e===`ar`?`لا توجد نتائج تطابق كلمة البحث`:`No notifications match search`:e===`ar`?`لا توجد إشعارات مسجلة في هذا التبويب`:`No notifications found in this tab`}),(0,b.jsx)(`p`,{style:{fontSize:`13px`,color:`var(--color-text-secondary)`,margin:0,maxWidth:`400px`,lineHeight:1.5},children:e===`ar`?`يمكنك التبديل بين التبويبات أو النقر على "إنشاء إشعار فوري" لإرسال تنبيه جديد.`:`Switch tabs or click "Compose Alert" to broadcast a new notification.`}),d(`communications`,`create`)&&(0,b.jsxs)(`button`,{onClick:()=>{V(`parents`),K(``),J(``),F(!0)},style:{marginTop:`8px`,height:`38px`,padding:`0 18px`,borderRadius:`10px`,fontSize:`12.5px`,fontWeight:`800`,border:`none`,backgroundColor:`var(--color-primary-ui)`,color:`white`,cursor:`pointer`,display:`flex`,alignItems:`center`,gap:`6px`},children:[(0,b.jsx)(s,{size:16}),(0,b.jsx)(`span`,{children:e===`ar`?`إنشاء إشعار جديد الآن`:`Compose Alert Now`})]})]}),ve&&(0,b.jsx)(`div`,{className:`modal-overlay no-print`,style:{backdropFilter:`blur(8px)`},children:(0,b.jsxs)(`div`,{className:`modal-container`,style:{maxWidth:`640px`,borderRadius:`24px`,overflow:`hidden`},children:[(0,b.jsxs)(`header`,{className:`modal-header`,style:{padding:`20px 24px`,borderBottom:`1px solid var(--color-border)`},children:[(0,b.jsxs)(`h3`,{className:`modal-title`,style:{fontSize:`16px`,fontWeight:`800`,display:`flex`,alignItems:`center`,gap:`8px`},children:[(0,b.jsx)(v,{size:18,style:{color:`var(--color-primary-ui)`}}),(0,b.jsx)(`span`,{children:e===`ar`?`إرسال ونشر إشعار فوري جديد`:`Compose Instant Announcement`})]}),(0,b.jsx)(`button`,{className:`modal-close-btn`,type:`button`,onClick:()=>F(!1),style:{background:`var(--color-surface)`,width:`32px`,height:`32px`,borderRadius:`50%`,display:`flex`,alignItems:`center`,justifyContent:`center`,border:`none`,cursor:`pointer`},children:(0,b.jsx)(p,{size:16})})]}),(0,b.jsxs)(`form`,{onSubmit:Oe,children:[(0,b.jsxs)(`div`,{className:`modal-body`,style:{padding:`20px 24px`,display:`flex`,flexDirection:`column`,gap:`16px`},children:[(0,b.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`6px`},children:[(0,b.jsxs)(`label`,{style:{fontSize:`12px`,fontWeight:`800`,color:`var(--color-primary-ui)`,display:`flex`,alignItems:`center`,gap:`6px`},children:[(0,b.jsx)(se,{size:14}),(0,b.jsx)(`span`,{children:e===`ar`?`قوالب جاهزة بنقرة واحدة:`:`Quick Presets:`})]}),(0,b.jsxs)(`div`,{className:`preset-templates-container`,children:[(0,b.jsx)(`button`,{type:`button`,className:`preset-template-chip`,onClick:()=>Z(`general_announcement`),children:(0,b.jsxs)(`span`,{children:[`📜 `,e===`ar`?`تعميم إداري`:`General Notice`]})}),(0,b.jsx)(`button`,{type:`button`,className:`preset-template-chip`,onClick:()=>Z(`exam`),children:(0,b.jsxs)(`span`,{children:[`📅 `,e===`ar`?`جدول الاختبارات`:`Exam Schedule`]})}),(0,b.jsx)(`button`,{type:`button`,className:`preset-template-chip`,onClick:()=>Z(`parents_meeting`),children:(0,b.jsxs)(`span`,{children:[`👥 `,e===`ar`?`اجتماع أولياء الأمور`:`Parents Meeting`]})}),(0,b.jsx)(`button`,{type:`button`,className:`preset-template-chip`,onClick:()=>Z(`absence`),children:(0,b.jsxs)(`span`,{children:[`⚠️ `,e===`ar`?`تنبيه مواظبة`:`Attendance Alert`]})})]})]}),(0,b.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`8px`},children:[(0,b.jsxs)(`label`,{style:{fontSize:`12px`,fontWeight:`800`,color:`var(--color-text-primary)`},children:[`🎯 `,e===`ar`?`اختر الفئة المستهدفة:`:`Select Target Audience:`]}),(0,b.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:`repeat(auto-fit, minmax(100px, 1fr))`,gap:`8px`},children:[(0,b.jsxs)(`div`,{onClick:()=>V(`parents`),style:{padding:`10px 8px`,borderRadius:`12px`,border:B===`parents`?`2px solid var(--color-primary-ui)`:`1px solid var(--color-border)`,background:B===`parents`?`rgba(30, 80, 142, 0.08)`:`var(--color-surface)`,color:B===`parents`?`var(--color-primary-ui)`:`var(--color-text-primary)`,cursor:`pointer`,textAlign:`center`,fontSize:`11.5px`,fontWeight:`700`},children:[(0,b.jsx)(f,{size:18,style:{margin:`0 auto 4px auto`,display:`block`}}),(0,b.jsx)(`span`,{children:t.targetAllParents})]}),(0,b.jsxs)(`div`,{onClick:()=>{V(`class`),S.length>0&&!W&&be(S[0])},style:{padding:`10px 8px`,borderRadius:`12px`,border:B===`class`?`2px solid var(--color-primary-ui)`:`1px solid var(--color-border)`,background:B===`class`?`rgba(30, 80, 142, 0.08)`:`var(--color-surface)`,color:B===`class`?`var(--color-primary-ui)`:`var(--color-text-primary)`,cursor:`pointer`,textAlign:`center`,fontSize:`11.5px`,fontWeight:`700`},children:[(0,b.jsx)(_,{size:18,style:{margin:`0 auto 4px auto`,display:`block`}}),(0,b.jsx)(`span`,{children:t.targetByClass})]}),(0,b.jsxs)(`div`,{onClick:()=>{V(`student`),D.length>0&&!H&&U(D[0].id)},style:{padding:`10px 8px`,borderRadius:`12px`,border:B===`student`?`2px solid var(--color-primary-ui)`:`1px solid var(--color-border)`,background:B===`student`?`rgba(30, 80, 142, 0.08)`:`var(--color-surface)`,color:B===`student`?`var(--color-primary-ui)`:`var(--color-text-primary)`,cursor:`pointer`,textAlign:`center`,fontSize:`11.5px`,fontWeight:`700`},children:[(0,b.jsx)(m,{size:18,style:{margin:`0 auto 4px auto`,display:`block`}}),(0,b.jsx)(`span`,{children:t.targetByStudent})]}),(0,b.jsxs)(`div`,{onClick:()=>V(`teachers`),style:{padding:`10px 8px`,borderRadius:`12px`,border:B===`teachers`?`2px solid var(--color-primary-ui)`:`1px solid var(--color-border)`,background:B===`teachers`?`rgba(30, 80, 142, 0.08)`:`var(--color-surface)`,color:B===`teachers`?`var(--color-primary-ui)`:`var(--color-text-primary)`,cursor:`pointer`,textAlign:`center`,fontSize:`11.5px`,fontWeight:`700`},children:[(0,b.jsx)(f,{size:18,style:{margin:`0 auto 4px auto`,display:`block`}}),(0,b.jsx)(`span`,{children:t.targetAllTeachers})]})]})]}),B===`student`&&(0,b.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`6px`},children:[(0,b.jsxs)(`label`,{style:{fontSize:`11.5px`,fontWeight:`700`},children:[`🔍 `,t.selectStudent]}),(0,b.jsx)(`input`,{type:`text`,placeholder:e===`ar`?`ابحث باسم الطالب...`:`Search student...`,value:Y,onChange:e=>Ce(e.target.value),className:`text-field`,style:{height:`36px`,fontSize:`12px`,padding:`0 10px`}}),(0,b.jsx)(`select`,{value:H,onChange:e=>U(e.target.value),className:`text-field`,style:{height:`38px`,fontSize:`12px`},children:Re.map(t=>(0,b.jsxs)(`option`,{value:t.id,children:[e===`ar`?t.name:t.nameEn||t.name,` (#`,t.id,`)`]},t.id))})]}),B===`class`&&(0,b.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`6px`},children:[(0,b.jsxs)(`label`,{style:{fontSize:`11.5px`,fontWeight:`700`},children:[`🏫 `,t.selectClass]}),(0,b.jsx)(`select`,{value:W,onChange:e=>be(e.target.value),className:`text-field`,style:{height:`38px`,fontSize:`12px`},children:S.map(e=>(0,b.jsx)(`option`,{value:e,children:e},e))})]}),(0,b.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`4px`},children:[(0,b.jsxs)(`label`,{style:{fontSize:`12px`,fontWeight:`800`,color:`var(--color-text-primary)`},children:[`📝 `,t.notificationTitleLabel]}),(0,b.jsx)(`input`,{type:`text`,value:G,onChange:e=>K(e.target.value),placeholder:e===`ar`?`عنوان الإشعار...`:`Notification title...`,className:`text-field`,style:{height:`38px`,fontSize:`12px`,padding:`0 12px`},required:!0})]}),(0,b.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`4px`},children:[(0,b.jsxs)(`label`,{style:{fontSize:`12px`,fontWeight:`800`,color:`var(--color-text-primary)`},children:[`💬 `,t.notificationContentLabel]}),(0,b.jsx)(`textarea`,{value:q,onChange:e=>J(e.target.value),placeholder:e===`ar`?`محتوى وتفاصيل البلاغ...`:`Notification content...`,className:`text-field`,style:{minHeight:`90px`,fontSize:`12px`,padding:`10px 12px`,resize:`vertical`},required:!0})]}),(0,b.jsxs)(`div`,{style:{fontSize:`11px`,color:`var(--color-text-secondary)`,display:`flex`,alignItems:`center`,gap:`8px`,background:`var(--color-surface)`,padding:`8px 12px`,borderRadius:`8px`,border:`1px solid var(--color-border)`},children:[(0,b.jsx)(g,{size:14,style:{color:`var(--color-success)`}}),(0,b.jsx)(`span`,{children:e===`ar`?`سيتم النشر كإشعار فوري للتطبيق وكسجل رسائل SMS كالمعتاد.`:`Will be broadcasted as instant Push Notification & SMS.`})]})]}),(0,b.jsxs)(`footer`,{className:`modal-footer`,style:{padding:`14px 24px`,borderTop:`1px solid var(--color-border)`,display:`flex`,justifyContent:`flex-end`,gap:`10px`},children:[(0,b.jsx)(`button`,{type:`button`,className:`btn-elevated`,onClick:()=>F(!1),style:{height:`36px`,padding:`0 16px`,borderRadius:`8px`,fontSize:`12px`,cursor:`pointer`},children:t.cancel}),(0,b.jsxs)(`button`,{type:`submit`,style:{height:`36px`,padding:`0 20px`,borderRadius:`8px`,fontSize:`12px`,fontWeight:`800`,background:`var(--gradient-brand)`,color:`white`,border:`none`,cursor:`pointer`,display:`flex`,alignItems:`center`,gap:`6px`},children:[(0,b.jsx)(v,{size:14}),(0,b.jsx)(`span`,{children:e===`ar`?`إرسال ونشر الآن`:`Broadcast Now`})]})]})]})]})})]});function ze(t){let n=t.type===`student`?D.find(e=>e.id===Number(t.studentId)):null,r=n?n.name:t.studentName,i=n?n.nameEn:t.studentNameEn,a=Le(t.type,t.grade,t.studentId,r,i,t.teacherName,t.teacherNameEn),s=Ae(t.date),c=Q(t.date);return(0,b.jsxs)(`div`,{className:`notif-card-modern ${t.isRead?``:`unread`}`,onClick:()=>{t.isRead||E(t.id)},children:[(0,b.jsxs)(`div`,{className:`notif-card-header`,children:[(0,b.jsxs)(`div`,{className:`notif-card-title-area`,children:[(0,b.jsx)(`div`,{className:`notif-card-avatar`,style:{backgroundColor:a.bgGlow,color:a.textColor,border:`1px solid ${a.borderColor}`},children:a.icon}),(0,b.jsxs)(`div`,{children:[(0,b.jsxs)(`h4`,{className:`notif-card-title`,children:[t.title,!t.isRead&&(0,b.jsx)(`span`,{style:{fontSize:`10.5px`,fontWeight:`800`,background:`#ef4444`,color:`white`,padding:`1px 8px`,borderRadius:`10px`,marginInlineStart:`8px`,display:`inline-block`,verticalAlign:`middle`},children:e===`ar`?`جديد`:`New`})]}),(0,b.jsxs)(`div`,{className:`notif-card-meta`,children:[(0,b.jsx)(`span`,{style:{fontSize:`11px`,fontWeight:`700`,color:a.textColor,background:a.bgGlow,padding:`2px 8px`,borderRadius:`8px`,border:`1px solid ${a.borderColor}`},children:a.label}),(0,b.jsxs)(`span`,{style:{fontSize:`11.5px`,color:`var(--color-text-secondary)`,fontWeight:`600`},children:[`🕒 `,s,` (`,c,`)`]})]})]})]}),(0,b.jsxs)(`div`,{className:`notif-action-btn-group no-print`,onClick:e=>e.stopPropagation(),children:[!t.isRead&&(0,b.jsx)(`button`,{className:`notif-icon-btn`,onClick:()=>E(t.id),title:e===`ar`?`تحديد كمقروء`:`Mark as read`,children:(0,b.jsx)(ae,{size:14})}),(0,b.jsx)(`button`,{className:`notif-icon-btn`,onClick:e=>De(e,t),title:e===`ar`?`نسخ نص الإشعار`:`Copy notification text`,children:ye===t.id?(0,b.jsx)(ae,{size:14,style:{color:`var(--color-success)`}}):(0,b.jsx)(o,{size:14})}),d(`communications`,`delete`)&&(0,b.jsx)(`button`,{className:`notif-icon-btn danger`,onClick:e=>Te(e,t.id),title:e===`ar`?`حذف الإشعار`:`Delete notification`,children:(0,b.jsx)(l,{size:14})})]})]}),(0,b.jsx)(`p`,{className:`notif-card-body`,children:t.content}),(0,b.jsxs)(`div`,{className:`notif-card-footer`,children:[(0,b.jsx)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`6px`},children:(0,b.jsxs)(`span`,{children:[`✍️ `,e===`ar`?`المرسل: `:`Sender: `,ke(t).name]})}),(0,b.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`5px`,color:`var(--color-success)`},children:[(0,b.jsx)(g,{size:13}),(0,b.jsx)(`span`,{children:e===`ar`?`تم النشر كإشعار فوري وتنبيه SMS`:`Sent via Push & SMS`})]})]})]},t.id)}}function S(){return(0,b.jsx)(x,{})}export{S as default};