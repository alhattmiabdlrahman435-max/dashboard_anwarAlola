import{d as e,l as t,n,o as r}from"./AppContext-YMbpJ_Ut.js";import{n as i,t as a}from"./PaginationBar-_ia64G_I.js";import{t as o}from"./copy-BYNyMkCH.js";import{t as s}from"./plus-ClGTHQ3M.js";import{t as c}from"./search-D_pqHx5F.js";import{t as l}from"./trash-2-DesCFSrh.js";import{t as u}from"./user-Zb_6OyoK.js";import{A as ee,C as te,D as ne,S as d,i as f,r as p,t as re,u as m,x as h}from"./index-B4qeqCHi.js";var ie=d(`check-check`,[[`path`,{d:`M18 6 7 17l-5-5`,key:`116fxf`}],[`path`,{d:`m22 10-7.5 7.5L13 16`,key:`ke71qq`}]]),ae=d(`check`,[[`path`,{d:`M20 6 9 17l-5-5`,key:`1gmf2c`}]]),oe=d(`circle-check`,[[`circle`,{cx:`12`,cy:`12`,r:`10`,key:`1mglay`}],[`path`,{d:`m9 12 2 2 4-4`,key:`dzmm74`}]]),se=d(`info`,[[`circle`,{cx:`12`,cy:`12`,r:`10`,key:`1mglay`}],[`path`,{d:`M12 16v-4`,key:`1dtifu`}],[`path`,{d:`M12 8h.01`,key:`e9boi3`}]]),g=d(`layers`,[[`path`,{d:`M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z`,key:`zw3jo`}],[`path`,{d:`M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12`,key:`1wduqc`}],[`path`,{d:`M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17`,key:`kqbvx6`}]]),_=d(`send`,[[`path`,{d:`M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z`,key:`1ffxy3`}],[`path`,{d:`m21.854 2.147-10.94 10.939`,key:`12cjpa`}]]),ce=d(`sparkles`,[[`path`,{d:`M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z`,key:`1s2grr`}],[`path`,{d:`M20 2v4`,key:`1rf3ol`}],[`path`,{d:`M22 4h-4`,key:`gwowj6`}],[`circle`,{cx:`4`,cy:`20`,r:`2`,key:`6kqj1y`}]]),le=d(`volume-2`,[[`path`,{d:`M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z`,key:`uqj9uw`}],[`path`,{d:`M16 9a5 5 0 0 1 0 6`,key:`1q6k2b`}],[`path`,{d:`M19.364 18.364a9 9 0 0 0 0-12.728`,key:`ijwkga`}]]),v=e(t(),1),y=r();function b(){let{lang:e,t,triggerConfirm:r,canAction:d,setToastMessage:b}=n(),{availableGrades:x,fetchClasses:S}=ee(),{notifications:C,notificationsPagination:w,handleSendNotification:ue,handleMarkNotificationAsRead:T,handleDeleteNotification:de,handleDeleteAllNotifications:fe,fetchNotifications:pe,loading:me}=ne(),{students:E,fetchStudents:he}=re(),{teachers:D,fetchTeachers:O}=te(),{page:k,perPage:A,search:j,setPage:ge,setPerPage:_e,setSearch:ve}=i({moduleKey:`notifications`}),[M,N]=(0,v.useState)(`all`),[ye,P]=(0,v.useState)(!1),[F,I]=(0,v.useState)(``),[be,L]=(0,v.useState)(null),R=(0,v.useMemo)(()=>{let e=new URLSearchParams;return e.set(`page`,k),e.set(`per_page`,A),j&&e.set(`search`,j),M===`parents`?e.set(`type`,`broadcast_parents`):M===`teachers`?e.set(`type`,`broadcast_teachers`):(M===`classes`||M===`private`)&&e.set(`type`,`broadcast`),`?`+e.toString()},[k,A,j,M]);(0,v.useEffect)(()=>{pe(R)},[pe,R]),(0,v.useEffect)(()=>{S(),he(),O()},[S,he,O]);let[z,B]=(0,v.useState)(`parents`),[V,H]=(0,v.useState)(E.length>0?E[0].id:``),[U,xe]=(0,v.useState)(x.length>0?x[0]:``),[W,Se]=(0,v.useState)(D.length>0?D[0].id:``),[G,K]=(0,v.useState)(``),[q,J]=(0,v.useState)(``),[Y,Ce]=(0,v.useState)(``),[X,we]=(0,v.useState)(``),Te=(t,n)=>{t.stopPropagation(),r({title:e===`ar`?`حذف الإشعار`:`Delete Notification`,message:e===`ar`?`هل أنت متأكد من حذف هذا الإشعار نهائياً؟`:`Are you sure you want to permanently delete this notification?`,onConfirm:()=>{de(n)}})},Ee=()=>{r({title:e===`ar`?`حذف جميع الإشعارات`:`Delete All Notifications`,message:e===`ar`?`هل أنت متأكد من حذف جميع الإشعارات نهائياً؟ هذا الإجراء لا يمكن التراجع عنه!`:`Are you sure you want to delete all notifications permanently? This action cannot be undone!`,onConfirm:()=>{fe()}})},De=(t,n)=>{t.stopPropagation();let r=`${n.title}\n${n.content}`;navigator.clipboard.writeText(r),L(n.id),b&&b(e===`ar`?`تم نسخ نص الإشعار بنجاح`:`Notification content copied`),setTimeout(()=>L(null),2e3)},Z=t=>{t===`absence`?(K(e===`ar`?`تنبيه غياب وتأخر دراسي`:`Absence & Attendance Alert`),J(e===`ar`?`نود إحاطتكم بحضور ومواظبة الطالب/الطالبة، نرجو المتابعة الحثيثة والتواصل مع إدارة المدرسة لضمان التفوق.`:`We would like to inform you regarding student attendance. Please follow up with school administration.`)):t===`exam`?(K(e===`ar`?`إعلان جدول الاختبارات النهائية`:`Final Exam Schedule Announcement`),J(e===`ar`?`تم اعتماد ونشر جدول الاختبارات التقييمية. نرجو الحرص على مراجعة المقررات والالتزام بالحضور في المواعيد المحددة.`:`The evaluation exam schedule has been published. Please ensure thorough revision and timely attendance.`)):t===`parents_meeting`?(K(e===`ar`?`دعوة لاجتماع أولياء الأمور الدوري`:`Parents-Teachers Meeting Invitation`),J(e===`ar`?`يسر إدارة المدرسة دعوتكم لحضور الاجتماع الدوري لمناقشة المستوى الأكاديمي والتربوي لأبنائنا الطلاب يوم الخميس القادم.`:`You are cordially invited to attend the periodic parents meeting next Thursday.`)):t===`general_announcement`&&(K(e===`ar`?`تعميم إداري هام للجميع`:`Important School Announcement`),J(e===`ar`?`تود إدارة رياض ومدارس أنوار العلى الدولية تذكير جميع الطلاب وأولياء الأمور بالتعليمات والأنشطة القادمة.`:`Anwar Al-Ola Int. Model Schools would like to remind all students & parents of upcoming activities.`))},Oe=t=>{if(t.preventDefault(),!G.trim()||!q.trim())return;let n=new Date().toISOString().replace(`T`,` `).substring(0,16),r={};if(z===`student`){let e=E.find(e=>e.id===Number(V));r={studentId:Number(V),studentName:e?e.name:null,studentNameEn:e?e.nameEn:null,grade:e?e.grade:null}}else if(z===`class`)r={grade:U};else if(z===`teacher`){let e=D.find(e=>e.id===Number(W));r={teacherId:Number(W),teacherName:e?e.name:null,teacherNameEn:e?e.nameEn:null}}let i={id:Date.now(),title:G,content:q,date:n,type:z,...r},a=[];if(z===`student`){let t=E.find(e=>e.id===Number(V));if(t){let r=e===`ar`?`تنبيه خاص بخصوص ابنكم ${t.name}: ${G} - ${q}. رياض و مدارس انوار العلى.`:`Private alert for ${t.nameEn}: ${G} - ${q}. Riyadh & Anwar Al-Ola.`;a.push({id:Date.now(),studentId:t.id,recipient:t.phone,text:r,time:n.split(` `)[1],type:`present`})}}else z===`class`?E.filter(e=>e.grade===U).forEach((t,r)=>{let i=e===`ar`?`تعميم لصف ${U}: ${G} - ${q}.`:`Class announcement for ${U}: ${G} - ${q}.`;a.push({id:Date.now()+Math.random()+r,studentId:t.id,recipient:t.phone,text:i,time:n.split(` `)[1],type:`present`})}):z===`parents`&&E.forEach((t,r)=>{let i=e===`ar`?`إشعار عام من المدرسة لأولياء الأمور: ${G} - ${q}.`:`Broadcast Announcement to Parents: ${G} - ${q}.`;a.push({id:Date.now()+Math.random()+r,studentId:t.id,recipient:t.phone,text:i,time:n.split(` `)[1],type:`present`})});ue(i,a),P(!1),K(``),J(``),Ce(``),we(``)},ke=(0,v.useCallback)(t=>t.type===`attendance`?{name:e===`ar`?`مشرف التحضير`:`Prep Supervisor`,key:`supervisor`}:{name:e===`ar`?`إدارة المدرسة`:`School Administration`,key:`admin`},[e]),Q=(0,v.useCallback)(t=>{if(!t)return``;try{let n=new Date(t.replace(` `,`T`));if(isNaN(n.getTime())&&(n=new Date(t)),isNaN(n.getTime()))return t;let r=n.getFullYear(),i=String(n.getMonth()+1).padStart(2,`0`),a=String(n.getDate()).padStart(2,`0`),o=n.getHours(),s=String(n.getMinutes()).padStart(2,`0`),c=o>=12?e===`ar`?`م`:`PM`:e===`ar`?`ص`:`AM`;return o%=12,o||=12,`${r}-${i}-${a} ${String(o).padStart(2,`0`)}:${s} ${c}`}catch{return t}},[e]),Ae=(0,v.useCallback)(t=>{if(!t)return``;try{let n=new Date(t.replace(` `,`T`)),r=new Date-n,i=Math.floor(r/(1e3*60)),a=Math.floor(r/(1e3*60*60)),o=Math.floor(r/(1e3*60*60*24));return i<2?e===`ar`?`الآن`:`Just now`:i<60?e===`ar`?`منذ ${i} دقيقة`:`${i}m ago`:a<24?e===`ar`?`منذ ${a} ساعة`:`${a}h ago`:o===1?e===`ar`?`أمس`:`Yesterday`:o<7?e===`ar`?`منذ ${o} أيام`:`${o}d ago`:Q(t)}catch{return t}},[e,Q]),je=w.total||C.length,Me=(0,v.useMemo)(()=>C.filter(e=>e.type===`general`||e.type===`parents`||e.type===`broadcast_parents`).length,[C]),Ne=(0,v.useMemo)(()=>C.filter(e=>e.type===`class`).length,[C]),Pe=(0,v.useMemo)(()=>C.filter(e=>e.type===`student`||e.type===`private`||e.type===`teacher`).length,[C]),$=(0,v.useMemo)(()=>C.filter(e=>F&&!e.date.startsWith(F)?!1:M===`parents`?e.type===`parents`||e.type===`general`||e.type===`broadcast_parents`:M===`classes`?e.type===`class`:M===`teachers`?e.type===`teachers`||e.type===`teacher`||e.type===`broadcast_teachers`:M===`private`?e.type===`student`||e.type===`private`:!0),[C,F,M]);(0,v.useMemo)(()=>{let e=new Date().toISOString().substring(0,10),t=new Date;t.setDate(t.getDate()-1);let n=t.toISOString().substring(0,10),r={today:[],yesterday:[],earlier:[]};return $.forEach(t=>{let i=t.date?t.date.substring(0,10):``;i===e?r.today.push(t):i===n?r.yesterday.push(t):r.earlier.push(t)}),r},[$]);let Fe=(0,v.useMemo)(()=>C.filter(e=>!e.isRead).length,[C]),Ie=t=>{if(!t)return e===`ar`?`الصف الدراسي`:`Class`;let n=t.grade||t.class_name||t.className||t.grade_name||t.gradeName;if(n&&n!==`null`&&n!==`NULL`&&n!==`undefined`)return n;if(t.studentId){let e=E.find(e=>e.id===Number(t.studentId));if(e){let t=e.grade||e.class_name||e.grade_name;if(t&&t!==`null`&&t!==`NULL`&&t!==`undefined`)return t}}let r=`${t.title||``} ${t.content||``}`.match(/(?:للفصل|فصل|الصف)\s+([^\s\:\,\.\-]+(?:\s*[\-\–]\s*[^\s\:\,\.\-]+)?)/);return r&&r[1]&&!r[1].includes(`العام`)&&!r[1].includes(`ابنكم`)?r[1].trim():e===`ar`?`الصف الدراسي`:`Class`},Le=(t,n,r,i,a)=>{let o=t.type,s=Ie(t);if(o===`general`||o===`parents`||o===`broadcast_parents`)return{label:e===`ar`?`تعميم عام لأولياء الأمور`:`All Parents Broadcast`,bgGlow:`rgba(30, 80, 142, 0.08)`,borderColor:`var(--color-primary-ui)`,textColor:`var(--color-primary-ui)`,icon:(0,y.jsx)(f,{size:16})};if(o===`class`||o===`assignment`||o===`homework`)return{label:e===`ar`?`الصف: ${s}`:`Class: ${s}`,bgGlow:`rgba(217, 119, 6, 0.08)`,borderColor:`#d97706`,textColor:`#b45309`,icon:(0,y.jsx)(g,{size:16})};if(o===`student`||o===`private`){let t=e===`ar`?n||`طالب مخصص`:r||n||`Private Student`;return{label:s!==`الصف الدراسي`&&s!==`Class`?e===`ar`?`طالب (${s}): ${t}`:`Student (${s}): ${t}`:e===`ar`?`طالب: ${t}`:`Student: ${t}`,bgGlow:`rgba(225, 29, 72, 0.08)`,borderColor:`#e11d48`,textColor:`#be123c`,icon:(0,y.jsx)(m,{size:16})}}else if(o===`teachers`||o===`broadcast_teachers`)return{label:e===`ar`?`تعميم لجميع المعلمين`:`All Teachers Broadcast`,bgGlow:`rgba(16, 185, 129, 0.08)`,borderColor:`#10b981`,textColor:`#047857`,icon:(0,y.jsx)(f,{size:16})};else if(o===`teacher`){let t=e===`ar`?i||`معلم مخصص`:a||i||`Teacher`;return{label:e===`ar`?`المعلم: ${t}`:`Teacher: ${t}`,bgGlow:`rgba(15, 118, 110, 0.08)`,borderColor:`#0f766e`,textColor:`#0f766e`,icon:(0,y.jsx)(u,{size:16})}}return{label:(t.title&&t.title.includes(`واجب`)||t.content&&t.content.includes(`واجب`),e===`ar`?`الصف: ${s}`:`Class: ${s}`),bgGlow:`rgba(100, 116, 139, 0.08)`,borderColor:`#64748b`,textColor:`#475569`,icon:(0,y.jsx)(h,{size:16})}},Re=(0,v.useMemo)(()=>E.filter(e=>e.name.toLowerCase().includes(Y.toLowerCase())||e.id.toString().includes(Y)),[E,Y]),ze=(0,v.useMemo)(()=>D.filter(e=>e.name.toLowerCase().includes(X.toLowerCase())||e.id.toString().includes(X)),[D,X]);return(0,y.jsxs)(`div`,{className:`notif-command-center`,children:[(0,y.jsx)(`style`,{children:`
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
      `}),(0,y.jsxs)(`div`,{className:`notif-banner-modern no-print`,children:[(0,y.jsxs)(`div`,{className:`notif-banner-info-left`,children:[(0,y.jsx)(`div`,{className:`notif-banner-icon`,children:(0,y.jsx)(se,{size:24})}),(0,y.jsxs)(`div`,{className:`notif-banner-text`,children:[(0,y.jsx)(`h3`,{children:e===`ar`?`منصة الاتصالات والإشعارات الموحدة`:`Unified Communications & Alerts Platform`}),(0,y.jsx)(`p`,{children:e===`ar`?`تتيح لك إرسال التنبيهات الفورية الفعالة والتعاميم المباشرة لفئات مختلفة في المدرسة مع تتبع فوري لحالة التسليم.`:`Send instant broadcast notifications and targeted alerts to students, parents, and teachers with live delivery status.`})]})]}),Fe>0&&(0,y.jsxs)(`button`,{onClick:()=>{C.filter(e=>!e.isRead).forEach(e=>T(e.id))},style:{height:`38px`,padding:`0 14px`,borderRadius:`10px`,fontSize:`12px`,fontWeight:`700`,border:`1px solid var(--color-border)`,background:`var(--color-surface)`,color:`var(--color-primary-ui)`,cursor:`pointer`,display:`flex`,alignItems:`center`,gap:`6px`,whiteSpace:`nowrap`},children:[(0,y.jsx)(ie,{size:16}),(0,y.jsx)(`span`,{children:e===`ar`?`تحديد الكل كمقروء`:`Mark All Read`})]})]}),(0,y.jsxs)(`div`,{className:`notif-stats-grid`,children:[(0,y.jsxs)(`div`,{className:`notif-stat-card`,children:[(0,y.jsxs)(`div`,{className:`notif-stat-content`,children:[(0,y.jsx)(`span`,{className:`notif-stat-number`,children:je}),(0,y.jsx)(`span`,{className:`notif-stat-label`,children:e===`ar`?`إجمالي الإشعارات`:`Total Notifications`})]}),(0,y.jsx)(`div`,{className:`notif-stat-icon-wrapper`,style:{background:`linear-gradient(135deg, #1e508e 0%, #103058 100%)`},children:(0,y.jsx)(h,{size:24})})]}),(0,y.jsxs)(`div`,{className:`notif-stat-card`,children:[(0,y.jsxs)(`div`,{className:`notif-stat-content`,children:[(0,y.jsx)(`span`,{className:`notif-stat-number`,children:Me}),(0,y.jsx)(`span`,{className:`notif-stat-label`,children:e===`ar`?`تعاميم أولياء الأمور`:`Parents Broadcasts`})]}),(0,y.jsx)(`div`,{className:`notif-stat-icon-wrapper`,style:{background:`linear-gradient(135deg, #0284c7 0%, #0369a1 100%)`},children:(0,y.jsx)(f,{size:24})})]}),(0,y.jsxs)(`div`,{className:`notif-stat-card`,children:[(0,y.jsxs)(`div`,{className:`notif-stat-content`,children:[(0,y.jsx)(`span`,{className:`notif-stat-number`,children:Ne}),(0,y.jsx)(`span`,{className:`notif-stat-label`,children:e===`ar`?`تعاميم الفصول`:`Class Broadcasts`})]}),(0,y.jsx)(`div`,{className:`notif-stat-icon-wrapper`,style:{background:`linear-gradient(135deg, #d97706 0%, #b45309 100%)`},children:(0,y.jsx)(g,{size:24})})]}),(0,y.jsxs)(`div`,{className:`notif-stat-card`,children:[(0,y.jsxs)(`div`,{className:`notif-stat-content`,children:[(0,y.jsx)(`span`,{className:`notif-stat-number`,children:Pe}),(0,y.jsx)(`span`,{className:`notif-stat-label`,children:e===`ar`?`التنبيهات الفردية`:`Private Alerts`})]}),(0,y.jsx)(`div`,{className:`notif-stat-icon-wrapper`,style:{background:`linear-gradient(135deg, #e11d48 0%, #be123c 100%)`},children:(0,y.jsx)(m,{size:24})})]})]}),(0,y.jsxs)(`div`,{className:`notif-toolbar-container no-print`,children:[(0,y.jsxs)(`div`,{className:`notif-toolbar-top-row`,children:[(0,y.jsxs)(`div`,{className:`notif-search-box`,children:[(0,y.jsx)(c,{size:16,className:`notif-search-icon`}),(0,y.jsx)(`input`,{type:`text`,placeholder:e===`ar`?`البحث في سجل الإشعارات المرسلة...`:`Search notifications history...`,value:j||``,onChange:e=>ve(e.target.value)})]}),(0,y.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`10px`,flexWrap:`wrap`},children:[(0,y.jsxs)(`div`,{style:{position:`relative`,display:`flex`,alignItems:`center`},children:[(0,y.jsx)(`input`,{type:`date`,className:`text-field`,style:{height:`42px`,padding:`0 12px`,borderRadius:`12px`,border:`1.5px solid var(--color-border)`,backgroundColor:`var(--color-surface)`,color:`var(--color-text-primary)`,fontSize:`12.5px`,fontWeight:`600`,outline:`none`},value:F,onChange:e=>I(e.target.value),title:e===`ar`?`تصفية حسب التاريخ`:`Filter by Date`}),F&&(0,y.jsx)(`button`,{type:`button`,onClick:()=>I(``),style:{position:`absolute`,left:e===`ar`?`8px`:`auto`,right:e===`ar`?`auto`:`8px`,background:`transparent`,border:`none`,color:`var(--color-text-secondary)`,cursor:`pointer`},children:(0,y.jsx)(p,{size:14})})]}),d(`communications`,`delete`)&&C.length>0&&(0,y.jsxs)(`button`,{onClick:Ee,style:{height:`42px`,padding:`0 16px`,borderRadius:`12px`,border:`1.5px solid rgba(239, 68, 68, 0.3)`,backgroundColor:`rgba(239, 68, 68, 0.06)`,color:`#ef4444`,fontSize:`12.5px`,fontWeight:`800`,cursor:`pointer`,display:`flex`,alignItems:`center`,gap:`6px`},children:[(0,y.jsx)(l,{size:15}),(0,y.jsx)(`span`,{children:e===`ar`?`حذف الكل`:`Delete All`})]}),d(`communications`,`create`)&&(0,y.jsxs)(`button`,{onClick:()=>{B(`parents`),K(``),J(``),P(!0)},style:{height:`42px`,padding:`0 20px`,borderRadius:`12px`,fontSize:`13px`,fontWeight:`800`,border:`none`,background:`var(--gradient-brand)`,color:`white`,cursor:`pointer`,display:`flex`,alignItems:`center`,gap:`8px`,boxShadow:`0 6px 18px rgba(30, 80, 142, 0.28)`},children:[(0,y.jsx)(s,{size:18,strokeWidth:2.5}),(0,y.jsx)(`span`,{children:e===`ar`?`إنشاء إشعار فوري`:`Compose Alert`})]})]})]}),(0,y.jsxs)(`div`,{className:`notif-filter-chips`,children:[(0,y.jsxs)(`button`,{onClick:()=>N(`all`),className:`notif-chip-btn ${M===`all`?`active`:``}`,children:[(0,y.jsx)(`span`,{children:e===`ar`?`الكل`:`All`}),(0,y.jsx)(`span`,{className:`notif-chip-counter`,children:C.length})]}),(0,y.jsxs)(`button`,{onClick:()=>N(`parents`),className:`notif-chip-btn ${M===`parents`?`active`:``}`,children:[(0,y.jsx)(f,{size:14}),(0,y.jsx)(`span`,{children:e===`ar`?`أولياء الأمور`:`Parents`})]}),(0,y.jsxs)(`button`,{onClick:()=>N(`classes`),className:`notif-chip-btn ${M===`classes`?`active`:``}`,children:[(0,y.jsx)(g,{size:14}),(0,y.jsx)(`span`,{children:e===`ar`?`الصفوف`:`Classes`})]}),(0,y.jsxs)(`button`,{onClick:()=>N(`teachers`),className:`notif-chip-btn ${M===`teachers`?`active`:``}`,children:[(0,y.jsx)(u,{size:14}),(0,y.jsx)(`span`,{children:e===`ar`?`المعلمون`:`Teachers`})]}),(0,y.jsxs)(`button`,{onClick:()=>N(`private`),className:`notif-chip-btn ${M===`private`?`active`:``}`,children:[(0,y.jsx)(m,{size:14}),(0,y.jsx)(`span`,{children:e===`ar`?`إشعار خاص`:`Private Alerts`})]})]})]}),(0,y.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,justifyContent:`space-between`,margin:`4px 0 -8px 0`},children:[(0,y.jsxs)(`h4`,{style:{fontSize:`15px`,fontWeight:`800`,color:`var(--color-text-primary)`,margin:0,display:`flex`,alignItems:`center`,gap:`8px`},children:[(0,y.jsx)(le,{size:18,style:{color:`var(--color-primary-ui)`}}),(0,y.jsx)(`span`,{children:e===`ar`?`سجل الإرسال التاريخي`:`Historical Dispatch Log`})]}),(0,y.jsxs)(`span`,{style:{fontSize:`12px`,fontWeight:`800`,background:`var(--color-surface-alt)`,border:`1px solid var(--color-border)`,padding:`2px 10px`,borderRadius:`12px`,color:`var(--color-text-secondary)`},children:[$.length,` `,e===`ar`?`إشعار`:`alerts`]})]}),me?(0,y.jsx)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`12px`},children:[1,2,3].map(e=>(0,y.jsx)(`div`,{style:{height:`110px`,borderRadius:`18px`,backgroundColor:`var(--color-surface-alt)`,border:`1.5px solid var(--color-border)`,opacity:.6,animation:`pulse 1.5s infinite ease-in-out`}},e))}):$.length>0?(0,y.jsxs)(`div`,{className:`notif-feed-list`,children:[$.map(e=>Be(e)),(0,y.jsx)(`div`,{className:`no-print`,style:{marginTop:`var(--space-md)`},children:(0,y.jsx)(a,{page:k,lastPage:w.lastPage,total:w.total,from:w.from,to:w.to,perPage:A,onPageChange:ge,onPerPageChange:_e,loading:me,lang:e})})]}):(0,y.jsxs)(`div`,{style:{padding:`60px 24px`,textAlign:`center`,backgroundColor:`var(--color-surface-alt)`,borderRadius:`24px`,border:`1.5px dashed var(--color-border)`,display:`flex`,flexDirection:`column`,alignItems:`center`,justifyContent:`center`,gap:`12px`},children:[(0,y.jsx)(`div`,{style:{width:`64px`,height:`64px`,borderRadius:`20px`,backgroundColor:`rgba(30, 80, 142, 0.08)`,color:`var(--color-primary-ui)`,display:`flex`,alignItems:`center`,justifyContent:`center`},children:(0,y.jsx)(h,{size:32})}),(0,y.jsx)(`h3`,{style:{fontSize:`16px`,fontWeight:`800`,color:`var(--color-text-primary)`,margin:0},children:j?e===`ar`?`لا توجد نتائج تطابق كلمة البحث`:`No notifications match search`:e===`ar`?`لا توجد إشعارات مسجلة في هذا التبويب`:`No notifications found in this tab`}),(0,y.jsx)(`p`,{style:{fontSize:`13px`,color:`var(--color-text-secondary)`,margin:0,maxWidth:`400px`,lineHeight:1.5},children:e===`ar`?`يمكنك التبديل بين التبويبات أو النقر على "إنشاء إشعار فوري" لإرسال تنبيه جديد.`:`Switch tabs or click "Compose Alert" to broadcast a new notification.`}),d(`communications`,`create`)&&(0,y.jsxs)(`button`,{onClick:()=>{B(`parents`),K(``),J(``),P(!0)},style:{marginTop:`8px`,height:`38px`,padding:`0 18px`,borderRadius:`10px`,fontSize:`12.5px`,fontWeight:`800`,border:`none`,backgroundColor:`var(--color-primary-ui)`,color:`white`,cursor:`pointer`,display:`flex`,alignItems:`center`,gap:`6px`},children:[(0,y.jsx)(s,{size:16}),(0,y.jsx)(`span`,{children:e===`ar`?`إنشاء إشعار جديد الآن`:`Compose Alert Now`})]})]}),ye&&(0,y.jsx)(`div`,{className:`modal-overlay no-print`,style:{backdropFilter:`blur(8px)`},children:(0,y.jsxs)(`div`,{className:`modal-container`,style:{maxWidth:`640px`,borderRadius:`24px`,overflow:`hidden`},children:[(0,y.jsxs)(`header`,{className:`modal-header`,style:{padding:`20px 24px`,borderBottom:`1px solid var(--color-border)`},children:[(0,y.jsxs)(`h3`,{className:`modal-title`,style:{fontSize:`16px`,fontWeight:`800`,display:`flex`,alignItems:`center`,gap:`8px`},children:[(0,y.jsx)(_,{size:18,style:{color:`var(--color-primary-ui)`}}),(0,y.jsx)(`span`,{children:e===`ar`?`إرسال ونشر إشعار فوري جديد`:`Compose Instant Announcement`})]}),(0,y.jsx)(`button`,{className:`modal-close-btn`,type:`button`,onClick:()=>P(!1),style:{background:`var(--color-surface)`,width:`32px`,height:`32px`,borderRadius:`50%`,display:`flex`,alignItems:`center`,justifyContent:`center`,border:`none`,cursor:`pointer`},children:(0,y.jsx)(p,{size:16})})]}),(0,y.jsxs)(`form`,{onSubmit:Oe,children:[(0,y.jsxs)(`div`,{className:`modal-body`,style:{padding:`20px 24px`,display:`flex`,flexDirection:`column`,gap:`16px`},children:[(0,y.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`6px`},children:[(0,y.jsxs)(`label`,{style:{fontSize:`12px`,fontWeight:`800`,color:`var(--color-primary-ui)`,display:`flex`,alignItems:`center`,gap:`6px`},children:[(0,y.jsx)(ce,{size:14}),(0,y.jsx)(`span`,{children:e===`ar`?`قوالب جاهزة بنقرة واحدة:`:`Quick Presets:`})]}),(0,y.jsxs)(`div`,{className:`preset-templates-container`,children:[(0,y.jsx)(`button`,{type:`button`,className:`preset-template-chip`,onClick:()=>Z(`general_announcement`),children:(0,y.jsxs)(`span`,{children:[`📜 `,e===`ar`?`تعميم إداري`:`General Notice`]})}),(0,y.jsx)(`button`,{type:`button`,className:`preset-template-chip`,onClick:()=>Z(`exam`),children:(0,y.jsxs)(`span`,{children:[`📅 `,e===`ar`?`جدول الاختبارات`:`Exam Schedule`]})}),(0,y.jsx)(`button`,{type:`button`,className:`preset-template-chip`,onClick:()=>Z(`parents_meeting`),children:(0,y.jsxs)(`span`,{children:[`👥 `,e===`ar`?`اجتماع أولياء الأمور`:`Parents Meeting`]})}),(0,y.jsx)(`button`,{type:`button`,className:`preset-template-chip`,onClick:()=>Z(`absence`),children:(0,y.jsxs)(`span`,{children:[`⚠️ `,e===`ar`?`تنبيه مواظبة`:`Attendance Alert`]})})]})]}),(0,y.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`8px`},children:[(0,y.jsxs)(`label`,{style:{fontSize:`12px`,fontWeight:`800`,color:`var(--color-text-primary)`},children:[`🎯 `,e===`ar`?`اختر الفئة المستهدفة:`:`Select Target Audience:`]}),(0,y.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:`repeat(auto-fit, minmax(100px, 1fr))`,gap:`8px`},children:[(0,y.jsxs)(`div`,{onClick:()=>B(`parents`),style:{padding:`10px 8px`,borderRadius:`12px`,border:z===`parents`?`2px solid var(--color-primary-ui)`:`1px solid var(--color-border)`,background:z===`parents`?`rgba(30, 80, 142, 0.08)`:`var(--color-surface)`,color:z===`parents`?`var(--color-primary-ui)`:`var(--color-text-primary)`,cursor:`pointer`,textAlign:`center`,fontSize:`11.5px`,fontWeight:`700`},children:[(0,y.jsx)(f,{size:18,style:{margin:`0 auto 4px auto`,display:`block`}}),(0,y.jsx)(`span`,{children:t.targetAllParents})]}),(0,y.jsxs)(`div`,{onClick:()=>{B(`class`),x.length>0&&!U&&xe(x[0])},style:{padding:`10px 8px`,borderRadius:`12px`,border:z===`class`?`2px solid var(--color-primary-ui)`:`1px solid var(--color-border)`,background:z===`class`?`rgba(30, 80, 142, 0.08)`:`var(--color-surface)`,color:z===`class`?`var(--color-primary-ui)`:`var(--color-text-primary)`,cursor:`pointer`,textAlign:`center`,fontSize:`11.5px`,fontWeight:`700`},children:[(0,y.jsx)(g,{size:18,style:{margin:`0 auto 4px auto`,display:`block`}}),(0,y.jsx)(`span`,{children:t.targetByClass})]}),(0,y.jsxs)(`div`,{onClick:()=>{B(`student`),E.length>0&&!V&&H(E[0].id)},style:{padding:`10px 8px`,borderRadius:`12px`,border:z===`student`?`2px solid var(--color-primary-ui)`:`1px solid var(--color-border)`,background:z===`student`?`rgba(30, 80, 142, 0.08)`:`var(--color-surface)`,color:z===`student`?`var(--color-primary-ui)`:`var(--color-text-primary)`,cursor:`pointer`,textAlign:`center`,fontSize:`11.5px`,fontWeight:`700`},children:[(0,y.jsx)(m,{size:18,style:{margin:`0 auto 4px auto`,display:`block`}}),(0,y.jsx)(`span`,{children:t.targetByStudent})]}),(0,y.jsxs)(`div`,{onClick:()=>B(`teachers`),style:{padding:`10px 8px`,borderRadius:`12px`,border:z===`teachers`?`2px solid var(--color-primary-ui)`:`1px solid var(--color-border)`,background:z===`teachers`?`rgba(30, 80, 142, 0.08)`:`var(--color-surface)`,color:z===`teachers`?`var(--color-primary-ui)`:`var(--color-text-primary)`,cursor:`pointer`,textAlign:`center`,fontSize:`11.5px`,fontWeight:`700`},children:[(0,y.jsx)(f,{size:18,style:{margin:`0 auto 4px auto`,display:`block`}}),(0,y.jsx)(`span`,{children:t.targetAllTeachers})]}),(0,y.jsxs)(`div`,{onClick:()=>{B(`teacher`),D.length>0&&!W&&Se(D[0].id)},style:{padding:`10px 8px`,borderRadius:`12px`,border:z===`teacher`?`2px solid var(--color-primary-ui)`:`1px solid var(--color-border)`,background:z===`teacher`?`rgba(30, 80, 142, 0.08)`:`var(--color-surface)`,color:z===`teacher`?`var(--color-primary-ui)`:`var(--color-text-primary)`,cursor:`pointer`,textAlign:`center`,fontSize:`11.5px`,fontWeight:`700`},children:[(0,y.jsx)(u,{size:18,style:{margin:`0 auto 4px auto`,display:`block`}}),(0,y.jsx)(`span`,{children:e===`ar`?`حسب المعلم`:`By Teacher`})]})]})]}),z===`student`&&(0,y.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`6px`},children:[(0,y.jsxs)(`label`,{style:{fontSize:`11.5px`,fontWeight:`700`},children:[`🔍 `,t.selectStudent]}),(0,y.jsx)(`input`,{type:`text`,placeholder:e===`ar`?`ابحث باسم الطالب...`:`Search student...`,value:Y,onChange:e=>Ce(e.target.value),className:`text-field`,style:{height:`36px`,fontSize:`12px`,padding:`0 10px`}}),(0,y.jsx)(`select`,{value:V,onChange:e=>H(e.target.value),className:`text-field`,style:{height:`38px`,fontSize:`12px`},children:Re.map(t=>(0,y.jsxs)(`option`,{value:t.id,children:[e===`ar`?t.name:t.nameEn||t.name,` (#`,t.id,`)`]},t.id))})]}),z===`class`&&(0,y.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`6px`},children:[(0,y.jsxs)(`label`,{style:{fontSize:`11.5px`,fontWeight:`700`},children:[`🏫 `,t.selectClass]}),(0,y.jsx)(`select`,{value:U,onChange:e=>xe(e.target.value),className:`text-field`,style:{height:`38px`,fontSize:`12px`},children:x.map(e=>(0,y.jsx)(`option`,{value:e,children:e},e))})]}),z===`teacher`&&(0,y.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`6px`},children:[(0,y.jsxs)(`label`,{style:{fontSize:`11.5px`,fontWeight:`700`},children:[`🔍 `,e===`ar`?`اختر المعلم`:`Select Teacher`]}),(0,y.jsx)(`input`,{type:`text`,placeholder:e===`ar`?`ابحث باسم المعلم...`:`Search teacher...`,value:X,onChange:e=>we(e.target.value),className:`text-field`,style:{height:`36px`,fontSize:`12px`,padding:`0 10px`}}),(0,y.jsx)(`select`,{value:W,onChange:e=>Se(e.target.value),className:`text-field`,style:{height:`38px`,fontSize:`12px`},children:ze.map(t=>(0,y.jsxs)(`option`,{value:t.id,children:[e===`ar`?t.name:t.nameEn||t.name,` (#`,t.id,`)`]},t.id))})]}),(0,y.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`4px`},children:[(0,y.jsxs)(`label`,{style:{fontSize:`12px`,fontWeight:`800`,color:`var(--color-text-primary)`},children:[`📝 `,t.notificationTitleLabel]}),(0,y.jsx)(`input`,{type:`text`,value:G,onChange:e=>K(e.target.value),placeholder:e===`ar`?`عنوان الإشعار...`:`Notification title...`,className:`text-field`,style:{height:`38px`,fontSize:`12px`,padding:`0 12px`},required:!0})]}),(0,y.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`4px`},children:[(0,y.jsxs)(`label`,{style:{fontSize:`12px`,fontWeight:`800`,color:`var(--color-text-primary)`},children:[`💬 `,t.notificationContentLabel]}),(0,y.jsx)(`textarea`,{value:q,onChange:e=>J(e.target.value),placeholder:e===`ar`?`محتوى وتفاصيل البلاغ...`:`Notification content...`,className:`text-field`,style:{minHeight:`90px`,fontSize:`12px`,padding:`10px 12px`,resize:`vertical`},required:!0})]}),(0,y.jsxs)(`div`,{style:{fontSize:`11px`,color:`var(--color-text-secondary)`,display:`flex`,alignItems:`center`,gap:`8px`,background:`var(--color-surface)`,padding:`8px 12px`,borderRadius:`8px`,border:`1px solid var(--color-border)`},children:[(0,y.jsx)(oe,{size:14,style:{color:`var(--color-success)`}}),(0,y.jsx)(`span`,{children:e===`ar`?`سيتم النشر كإشعار فوري للتطبيق وكسجل رسائل SMS كالمعتاد.`:`Will be broadcasted as instant Push Notification & SMS.`})]})]}),(0,y.jsxs)(`footer`,{className:`modal-footer`,style:{padding:`14px 24px`,borderTop:`1px solid var(--color-border)`,display:`flex`,justifyContent:`flex-end`,gap:`10px`},children:[(0,y.jsx)(`button`,{type:`button`,className:`btn-elevated`,onClick:()=>P(!1),style:{height:`36px`,padding:`0 16px`,borderRadius:`8px`,fontSize:`12px`,cursor:`pointer`},children:t.cancel}),(0,y.jsxs)(`button`,{type:`submit`,style:{height:`36px`,padding:`0 20px`,borderRadius:`8px`,fontSize:`12px`,fontWeight:`800`,background:`var(--gradient-brand)`,color:`white`,border:`none`,cursor:`pointer`,display:`flex`,alignItems:`center`,gap:`6px`},children:[(0,y.jsx)(_,{size:14}),(0,y.jsx)(`span`,{children:e===`ar`?`إرسال ونشر الآن`:`Broadcast Now`})]})]})]})]})})]});function Be(t){let n=t.type===`student`?E.find(e=>e.id===Number(t.studentId)):null,r=Le(t,n?n.name:t.studentName,n?n.nameEn:t.studentNameEn,t.teacherName,t.teacherNameEn),i=Ae(t.date),a=Q(t.date);return(0,y.jsxs)(`div`,{className:`notif-card-modern ${t.isRead?``:`unread`}`,onClick:()=>{t.isRead||T(t.id)},children:[(0,y.jsxs)(`div`,{className:`notif-card-header`,children:[(0,y.jsxs)(`div`,{className:`notif-card-title-area`,children:[(0,y.jsx)(`div`,{className:`notif-card-avatar`,style:{backgroundColor:r.bgGlow,color:r.textColor,border:`1px solid ${r.borderColor}`},children:r.icon}),(0,y.jsxs)(`div`,{children:[(0,y.jsxs)(`h4`,{className:`notif-card-title`,children:[t.title,!t.isRead&&(0,y.jsx)(`span`,{style:{fontSize:`10.5px`,fontWeight:`800`,background:`#ef4444`,color:`white`,padding:`1px 8px`,borderRadius:`10px`,marginInlineStart:`8px`,display:`inline-block`,verticalAlign:`middle`},children:e===`ar`?`جديد`:`New`})]}),(0,y.jsxs)(`div`,{className:`notif-card-meta`,children:[(0,y.jsx)(`span`,{style:{fontSize:`11px`,fontWeight:`700`,color:r.textColor,background:r.bgGlow,padding:`2px 8px`,borderRadius:`8px`,border:`1px solid ${r.borderColor}`},children:r.label}),(0,y.jsxs)(`span`,{style:{fontSize:`11.5px`,color:`var(--color-text-secondary)`,fontWeight:`600`},children:[`🕒 `,i,` (`,a,`)`]})]})]})]}),(0,y.jsxs)(`div`,{className:`notif-action-btn-group no-print`,onClick:e=>e.stopPropagation(),children:[!t.isRead&&(0,y.jsx)(`button`,{className:`notif-icon-btn`,onClick:()=>T(t.id),title:e===`ar`?`تحديد كمقروء`:`Mark as read`,children:(0,y.jsx)(ae,{size:14})}),(0,y.jsx)(`button`,{className:`notif-icon-btn`,onClick:e=>De(e,t),title:e===`ar`?`نسخ نص الإشعار`:`Copy notification text`,children:be===t.id?(0,y.jsx)(ae,{size:14,style:{color:`var(--color-success)`}}):(0,y.jsx)(o,{size:14})}),d(`communications`,`delete`)&&(0,y.jsx)(`button`,{className:`notif-icon-btn danger`,onClick:e=>Te(e,t.id),title:e===`ar`?`حذف الإشعار`:`Delete notification`,children:(0,y.jsx)(l,{size:14})})]})]}),(0,y.jsx)(`p`,{className:`notif-card-body`,children:t.content}),(0,y.jsxs)(`div`,{className:`notif-card-footer`,children:[(0,y.jsx)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`6px`},children:(0,y.jsxs)(`span`,{children:[`✍️ `,e===`ar`?`المرسل: `:`Sender: `,ke(t).name]})}),(0,y.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`5px`,color:`var(--color-success)`},children:[(0,y.jsx)(oe,{size:13}),(0,y.jsx)(`span`,{children:e===`ar`?`تم النشر كإشعار فوري وتنبيه SMS`:`Sent via Push & SMS`})]})]})]},t.id)}}function x(){return(0,y.jsx)(b,{})}export{x as default};