import{d as e,l as t,n,o as r}from"./AppContext-YMbpJ_Ut.js";import{n as i,t as a}from"./PaginationBar-mAKXvvlB.js";import{t as o}from"./clock-o0rQzb14.js";import{t as ee}from"./copy-9l3XHjbK.js";import{t as te}from"./plus-DO198Cwp.js";import{t as ne}from"./search-Cr4Tc5YW.js";import{t as re}from"./trash-2-If3X8tMh.js";import{t as ie}from"./user-OUBWD1K1.js";import{C as s,O as ae,S as c,b as oe,f as se,i as l,j as ce,r as u,t as le,u as d,w as ue}from"./index-BKPI9oD2.js";var de=s(`check-check`,[[`path`,{d:`M18 6 7 17l-5-5`,key:`116fxf`}],[`path`,{d:`m22 10-7.5 7.5L13 16`,key:`ke71qq`}]]),fe=s(`check`,[[`path`,{d:`M20 6 9 17l-5-5`,key:`1gmf2c`}]]),f=s(`circle-check`,[[`circle`,{cx:`12`,cy:`12`,r:`10`,key:`1mglay`}],[`path`,{d:`m9 12 2 2 4-4`,key:`dzmm74`}]]),p=s(`layers`,[[`path`,{d:`M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z`,key:`zw3jo`}],[`path`,{d:`M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12`,key:`1wduqc`}],[`path`,{d:`M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17`,key:`kqbvx6`}]]),pe=s(`send`,[[`path`,{d:`M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z`,key:`1ffxy3`}],[`path`,{d:`m21.854 2.147-10.94 10.939`,key:`12cjpa`}]]),me=s(`sparkles`,[[`path`,{d:`M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z`,key:`1s2grr`}],[`path`,{d:`M20 2v4`,key:`1rf3ol`}],[`path`,{d:`M22 4h-4`,key:`gwowj6`}],[`circle`,{cx:`4`,cy:`20`,r:`2`,key:`6kqj1y`}]]),m=e(t(),1),h=r();function g(){let{lang:e,t,triggerConfirm:r,canAction:s,setToastMessage:g}=n(),{availableGrades:_,fetchClasses:he}=ce(),{notifications:v,notificationsPagination:y,handleSendNotification:ge,handleMarkNotificationAsRead:b,handleDeleteNotification:_e,handleDeleteAllNotifications:ve,fetchNotifications:x,loading:S}=ae(),{students:C,fetchStudents:w}=le(),{teachers:T,fetchTeachers:ye}=ue(),{page:E,perPage:D,search:O,setPage:be,setPerPage:xe,setSearch:Se}=i({moduleKey:`notifications`}),[k,A]=(0,m.useState)(`all`),[Ce,j]=(0,m.useState)(!1),[we,Te]=(0,m.useState)(O),[M,N]=(0,m.useState)(``),[Ee,P]=(0,m.useState)(null);(0,m.useEffect)(()=>{Te(O)},[O]);let F=(0,m.useMemo)(()=>{let e=new URLSearchParams;return e.set(`page`,E),e.set(`per_page`,D),O&&e.set(`search`,O),k===`parents`?e.set(`type`,`broadcast_parents`):k===`teachers`?e.set(`type`,`broadcast_teachers`):(k===`classes`||k===`private`)&&e.set(`type`,`broadcast`),`?`+e.toString()},[E,D,O,k]);(0,m.useEffect)(()=>{x(F)},[x,F]),(0,m.useEffect)(()=>{he(),w(),ye()},[he,w,ye]);let[I,L]=(0,m.useState)(`parents`),[R,z]=(0,m.useState)(C.length>0?C[0].id:``),[B,V]=(0,m.useState)(_.length>0?_[0]:``),[H,De]=(0,m.useState)(T.length>0?T[0].id:``),[U,W]=(0,m.useState)(``),[G,K]=(0,m.useState)(``),[q,Oe]=(0,m.useState)(``),[J,ke]=(0,m.useState)(``),Ae=(t,n)=>{t.stopPropagation(),r({title:e===`ar`?`حذف الإشعار`:`Delete Notification`,message:e===`ar`?`هل أنت متأكد من حذف هذا الإشعار نهائياً؟`:`Are you sure you want to permanently delete this notification?`,onConfirm:()=>{_e(n)}})},je=()=>{r({title:e===`ar`?`حذف جميع الإشعارات`:`Delete All Notifications`,message:e===`ar`?`هل أنت متأكد من حذف جميع الإشعارات نهائياً؟ هذا الإجراء لا يمكن التراجع عنه!`:`Are you sure you want to delete all notifications permanently? This action cannot be undone!`,onConfirm:()=>{ve()}})},Me=(t,n)=>{t.stopPropagation();let r=`${n.title}\n${n.content}`;navigator.clipboard.writeText(r),P(n.id),g&&g(e===`ar`?`تم نسخ نص الإشعار بنجاح`:`Notification content copied`),setTimeout(()=>P(null),2e3)},Y=t=>{t===`absence`?(W(e===`ar`?`تنبيه غياب وتأخر دراسي`:`Absence & Attendance Alert`),K(e===`ar`?`نود إحاطتكم بحضور ومواظبة الطالب/الطالبة، نرجو المتابعة الحثيثة والتواصل مع إدارة المدرسة لضمان التفوق.`:`We would like to inform you regarding student attendance. Please follow up with school administration.`)):t===`exam`?(W(e===`ar`?`إعلان جدول الاختبارات النهائية`:`Final Exam Schedule Announcement`),K(e===`ar`?`تم اعتماد ونشر جدول الاختبارات التقييمية. نرجو الحرص على مراجعة المقررات والالتزام بالحضور في المواعيد المحددة.`:`The evaluation exam schedule has been published. Please ensure thorough revision and timely attendance.`)):t===`parents_meeting`?(W(e===`ar`?`دعوة لاجتماع أولياء الأمور الدوري`:`Parents-Teachers Meeting Invitation`),K(e===`ar`?`يسر إدارة المدرسة دعوتكم لحضور الاجتماع الدوري لمناقشة المستوى الأكاديمي والتربوي لأبنائنا الطلاب يوم الخميس القادم.`:`You are cordially invited to attend the periodic parents meeting next Thursday.`)):t===`general_announcement`&&(W(e===`ar`?`تعميم إداري هام للجميع`:`Important School Announcement`),K(e===`ar`?`تود إدارة رياض ومدارس أنوار العلى الدولية تذكير جميع الطلاب وأولياء الأمور بالتعليمات والأنشطة القادمة.`:`Anwar Al-Ola Int. Model Schools would like to remind all students & parents of upcoming activities.`))},Ne=t=>{if(t.preventDefault(),!U.trim()||!G.trim())return;let n=new Date().toISOString().replace(`T`,` `).substring(0,16),r={};if(I===`student`){let e=C.find(e=>e.id===Number(R));r={studentId:Number(R),studentName:e?e.name:null,studentNameEn:e?e.nameEn:null}}else if(I===`class`)r={grade:B};else if(I===`teacher`){let e=T.find(e=>e.id===Number(H));r={teacherId:Number(H),teacherName:e?e.name:null,teacherNameEn:e?e.nameEn:null}}let i={id:Date.now(),title:U,content:G,date:n,type:I,...r},a=[];if(I===`student`){let t=C.find(e=>e.id===Number(R));if(t){let r=e===`ar`?`تنبيه خاص بخصوص ابنكم ${t.name}: ${U} - ${G}. رياض و مدارس انوار العلى.`:`Private alert for ${t.nameEn}: ${U} - ${G}. Riyadh & Anwar Al-Ola.`;a.push({id:Date.now(),studentId:t.id,recipient:t.phone,text:r,time:n.split(` `)[1],type:`present`})}}else I===`class`?C.filter(e=>e.grade===B).forEach((t,r)=>{let i=e===`ar`?`تعميم لصف ${B}: ${U} - ${G}.`:`Class announcement for ${B}: ${U} - ${G}.`;a.push({id:Date.now()+Math.random()+r,studentId:t.id,recipient:t.phone,text:i,time:n.split(` `)[1],type:`present`})}):I===`parents`&&C.forEach((t,r)=>{let i=e===`ar`?`إشعار عام من المدرسة لأولياء الأمور: ${U} - ${G}.`:`Broadcast Announcement to Parents: ${U} - ${G}.`;a.push({id:Date.now()+Math.random()+r,studentId:t.id,recipient:t.phone,text:i,time:n.split(` `)[1],type:`present`})});ge(i,a),j(!1),W(``),K(``),Oe(``),ke(``)},Pe=(0,m.useCallback)(t=>t.type===`attendance`?{name:e===`ar`?`مشرف التحضير`:`Prep Supervisor`,key:`supervisor`}:{name:e===`ar`?`إدارة المدرسة`:`School Administration`,key:`admin`},[e]),Fe=(0,m.useCallback)(t=>{if(!t)return``;try{let n=new Date(t.replace(` `,`T`)),r=new Date-n,i=Math.floor(r/(1e3*60)),a=Math.floor(r/(1e3*60*60)),o=Math.floor(r/(1e3*60*60*24));return i<2?e===`ar`?`الآن`:`Just now`:i<60?e===`ar`?`منذ ${i} دقيقة`:`${i}m ago`:a<24?e===`ar`?`منذ ${a} ساعة`:`${a}h ago`:o===1?e===`ar`?`أمس`:`Yesterday`:o<7?e===`ar`?`منذ ${o} أيام`:`${o}d ago`:t.substring(0,10)}catch{return t}},[e]),X=(0,m.useMemo)(()=>v.filter(e=>M&&!e.date.startsWith(M)?!1:k===`classes`?e.type===`class`:k===`private`?e.type===`student`||e.type===`private`||e.type===`teacher`:!0),[v,M,k]),Z=(0,m.useMemo)(()=>{let e=new Date().toISOString().substring(0,10),t=new Date;t.setDate(t.getDate()-1);let n=t.toISOString().substring(0,10),r={today:[],yesterday:[],earlier:[]};return X.forEach(t=>{let i=t.date?t.date.substring(0,10):``;i===e?r.today.push(t):i===n?r.yesterday.push(t):r.earlier.push(t)}),r},[X]),Q=(0,m.useMemo)(()=>v.filter(e=>!e.isRead).length,[v]),Ie=(t,n,r,i,a,o)=>{if(t===`general`||t===`parents`)return{label:e===`ar`?`تعميم عام لأولياء الأمور`:`All Parents Broadcast`,bgGlow:`rgba(30, 80, 142, 0.08)`,borderColor:`var(--color-primary-ui)`,textColor:`var(--color-primary-ui)`,icon:(0,h.jsx)(l,{size:16})};if(t===`class`)return{label:e===`ar`?`الصف الدراسي: ${n}`:`Class: ${n}`,bgGlow:`rgba(217, 119, 6, 0.08)`,borderColor:`#d97706`,textColor:`#b45309`,icon:(0,h.jsx)(p,{size:16})};if(t===`student`||t===`private`){let t=e===`ar`?r:i||r;return{label:e===`ar`?`طالب: ${t}`:`Student: ${t}`,bgGlow:`rgba(225, 29, 72, 0.08)`,borderColor:`#e11d48`,textColor:`#be123c`,icon:(0,h.jsx)(d,{size:16})}}else if(t===`teachers`)return{label:e===`ar`?`تعميم لجميع المعلمين`:`All Teachers Broadcast`,bgGlow:`rgba(16, 185, 129, 0.08)`,borderColor:`#10b981`,textColor:`#047857`,icon:(0,h.jsx)(l,{size:16})};else if(t===`teacher`){let t=e===`ar`?a:o||a;return{label:e===`ar`?`المعلم: ${t}`:`Teacher: ${t}`,bgGlow:`rgba(15, 118, 110, 0.08)`,borderColor:`#0f766e`,textColor:`#0f766e`,icon:(0,h.jsx)(ie,{size:16})}}return{label:e===`ar`?`إشعار إداري`:`System Alert`,bgGlow:`rgba(100, 116, 139, 0.08)`,borderColor:`#64748b`,textColor:`#475569`,icon:(0,h.jsx)(c,{size:16})}},Le=(0,m.useMemo)(()=>C.filter(e=>e.name.toLowerCase().includes(q.toLowerCase())||e.id.toString().includes(q)),[C,q]);return(0,m.useMemo)(()=>T.filter(e=>e.name.toLowerCase().includes(J.toLowerCase())||e.id.toString().includes(J)),[T,J]),(0,h.jsxs)(`div`,{className:`notif-command-center`,children:[(0,h.jsx)(`style`,{children:`
        .notif-command-center {
          display: flex;
          flex-direction: column;
          gap: var(--space-xl);
          animation: notifFadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes notifFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* 1. Header Banner & Executive Actions */
        .notif-header-banner {
          background: linear-gradient(135deg, var(--color-surface-alt) 0%, var(--color-surface) 100%);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-card);
          padding: var(--space-xl);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: var(--space-lg);
          position: relative;
          overflow: hidden;
        }

        .notif-header-title-box {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .notif-header-icon-badge {
          width: 52px;
          height: 52px;
          border-radius: 16px;
          background: var(--gradient-brand);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 20px rgba(30, 80, 142, 0.25);
          position: relative;
        }

        .notif-unread-glow-dot {
          position: absolute;
          top: -3px;
          right: -3px;
          width: 14px;
          height: 14px;
          background: #ef4444;
          border: 2.5px solid var(--color-surface);
          border-radius: 50%;
          animation: pulseDot 2s infinite;
        }

        @keyframes pulseDot {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }

        .notif-header-title {
          font-size: 20px;
          font-weight: 800;
          color: var(--color-text-primary);
          margin: 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .notif-header-subtitle {
          font-size: 13px;
          color: var(--color-text-secondary);
          margin-top: 4px;
          font-weight: 500;
        }

        /* 2. Control Toolbar */
        .notif-toolbar-container {
          background: var(--color-surface-alt);
          border: 1px solid var(--color-border);
          border-radius: 18px;
          padding: 12px 16px;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .notif-search-box {
          position: relative;
          min-width: 260px;
          flex-grow: 1;
          max-width: 420px;
        }

        .notif-search-box input {
          width: 100%;
          padding: 10px 40px 10px 16px;
          border-radius: 12px;
          border: 1.5px solid var(--color-border);
          background: var(--color-surface);
          color: var(--color-text-primary);
          font-size: 13px;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        body[dir="ltr"] .notif-search-box input {
          padding: 10px 16px 10px 40px;
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
          right: 12px;
          color: var(--color-text-secondary);
        }

        body[dir="ltr"] .notif-search-icon {
          right: auto;
          left: 12px;
        }

        .notif-filter-chips {
          display: flex;
          align-items: center;
          gap: 6px;
          overflow-x: auto;
          padding-bottom: 2px;
        }

        .notif-chip-btn {
          border: 1px solid var(--color-border);
          background: var(--color-surface);
          color: var(--color-text-secondary);
          padding: 7px 14px;
          border-radius: 20px;
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
          box-shadow: 0 4px 12px rgba(30, 80, 142, 0.25);
        }

        .notif-chip-counter {
          font-size: 10px;
          padding: 1px 6px;
          border-radius: 10px;
          background: rgba(0, 0, 0, 0.1);
          color: inherit;
        }

        /* 3. Chronological Feed Cards */
        .notif-timeline-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .notif-timeline-header {
          font-size: 12.5px;
          font-weight: 800;
          color: var(--color-text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 8px;
        }

        .notif-timeline-header::after {
          content: '';
          flex-grow: 1;
          height: 1px;
          background: var(--color-border);
          opacity: 0.6;
        }

        .notif-card-linear {
          background: var(--color-surface-alt);
          border: 1px solid var(--color-border);
          border-radius: 16px;
          padding: 18px 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
        }

        .notif-card-linear.unread {
          background: linear-gradient(135deg, rgba(30, 80, 142, 0.04) 0%, var(--color-surface-alt) 100%);
          border-color: rgba(30, 80, 142, 0.3);
          box-shadow: 0 4px 16px rgba(30, 80, 142, 0.06);
        }

        .notif-card-linear:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
          border-color: rgba(30, 80, 142, 0.4);
        }

        .notif-card-top-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
        }

        .notif-card-title-group {
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }

        .notif-avatar-box {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-weight: bold;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.04);
        }

        .notif-card-title {
          font-size: 15px;
          font-weight: 800;
          color: var(--color-text-primary);
          line-height: 1.3;
          margin: 0;
        }

        .notif-card-meta-row {
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
          padding-top: 12px;
          border-top: 1px dashed var(--color-border);
          font-size: 11.5px;
          color: var(--color-text-secondary);
          font-weight: 600;
        }

        .notif-action-btn-group {
          display: flex;
          align-items: center;
          gap: 6px;
          opacity: 0.85;
          transition: opacity 0.2s ease;
        }

        .notif-card-linear:hover .notif-action-btn-group {
          opacity: 1;
        }

        .notif-icon-action {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: 1px solid var(--color-border);
          background: var(--color-surface);
          color: var(--color-text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .notif-icon-action:hover {
          color: var(--color-primary-ui);
          border-color: var(--color-primary-ui);
          background: rgba(30, 80, 142, 0.08);
        }

        .notif-icon-action.danger:hover {
          color: #ef4444;
          border-color: #ef4444;
          background: rgba(239, 68, 68, 0.08);
        }

        /* Modal Quick Templates Chips */
        .preset-templates-container {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 4px;
        }

        .preset-template-chip {
          padding: 6px 12px;
          border-radius: 12px;
          border: 1px solid var(--color-border);
          background: var(--color-surface);
          color: var(--color-text-primary);
          font-size: 11.5px;
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
      `}),(0,h.jsxs)(`div`,{className:`notif-header-banner no-print`,children:[(0,h.jsxs)(`div`,{className:`notif-header-title-box`,children:[(0,h.jsxs)(`div`,{className:`notif-header-icon-badge`,children:[(0,h.jsx)(c,{size:26}),Q>0&&(0,h.jsx)(`span`,{className:`notif-unread-glow-dot`})]}),(0,h.jsxs)(`div`,{children:[(0,h.jsxs)(`h2`,{className:`notif-header-title`,children:[(0,h.jsx)(`span`,{children:e===`ar`?`مركز الاتصالات والإشعارات الفورية`:`Notification Command Center`}),Q>0&&(0,h.jsxs)(`span`,{style:{fontSize:`11px`,fontWeight:`800`,background:`#ef4444`,color:`white`,padding:`2px 9px`,borderRadius:`12px`,boxShadow:`0 2px 8px rgba(239, 68, 68, 0.3)`},children:[Q,` `,e===`ar`?`جديد`:`Unread`]})]}),(0,h.jsx)(`p`,{className:`notif-header-subtitle`,children:e===`ar`?`إدارة البلاغات الجماعية، والتعاميم الفورية، والتنبيهات المخصصة للطلاب وأولياء الأمور والمعلمين`:`Manage general broadcasts, urgent announcements, and targeted student & parent notifications`})]})]}),(0,h.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`10px`,flexWrap:`wrap`},children:[Q>0&&(0,h.jsxs)(`button`,{className:`btn-elevated`,onClick:()=>{v.filter(e=>!e.isRead).forEach(e=>b(e.id))},style:{height:`42px`,padding:`0 16px`,borderRadius:`12px`,fontSize:`12.5px`,fontWeight:`700`,border:`1px solid var(--color-border)`,background:`var(--color-surface)`,color:`var(--color-primary-ui)`,cursor:`pointer`,display:`flex`,alignItems:`center`,gap:`8px`},children:[(0,h.jsx)(de,{size:16}),(0,h.jsx)(`span`,{children:e===`ar`?`تحديد الكل كمقروء`:`Mark All as Read`})]}),s(`communications`,`create`)&&(0,h.jsxs)(`button`,{onClick:()=>{L(`parents`),W(``),K(``),j(!0)},style:{height:`42px`,padding:`0 20px`,borderRadius:`12px`,fontSize:`13px`,fontWeight:`800`,border:`none`,background:`var(--gradient-brand)`,color:`white`,cursor:`pointer`,display:`flex`,alignItems:`center`,gap:`8px`,boxShadow:`0 6px 18px rgba(30, 80, 142, 0.28)`},children:[(0,h.jsx)(te,{size:18,strokeWidth:2.5}),(0,h.jsx)(`span`,{children:e===`ar`?`إنشاء إشعار فوري`:`Compose Alert`})]})]})]}),(0,h.jsxs)(`div`,{className:`notif-toolbar-container no-print`,children:[(0,h.jsxs)(`div`,{className:`notif-search-box`,children:[(0,h.jsx)(ne,{size:16,className:`notif-search-icon`}),(0,h.jsx)(`input`,{type:`text`,placeholder:e===`ar`?`البحث بالاسم، العنوان، أو المحتوى...`:`Search title, content, or recipient...`,value:we||``,onChange:e=>{Te(e.target.value),Se(e.target.value)}})]}),(0,h.jsxs)(`div`,{className:`notif-filter-chips`,children:[(0,h.jsxs)(`button`,{onClick:()=>A(`all`),className:`notif-chip-btn ${k===`all`?`active`:``}`,children:[(0,h.jsx)(`span`,{children:e===`ar`?`جميع الإشعارات`:`All Alerts`}),(0,h.jsx)(`span`,{className:`notif-chip-counter`,children:v.length})]}),(0,h.jsxs)(`button`,{onClick:()=>A(`parents`),className:`notif-chip-btn ${k===`parents`?`active`:``}`,children:[(0,h.jsx)(l,{size:14}),(0,h.jsx)(`span`,{children:e===`ar`?`أولياء الأمور`:`Parents`})]}),(0,h.jsxs)(`button`,{onClick:()=>A(`classes`),className:`notif-chip-btn ${k===`classes`?`active`:``}`,children:[(0,h.jsx)(p,{size:14}),(0,h.jsx)(`span`,{children:e===`ar`?`الصفوف الدراسية`:`Classes`})]}),(0,h.jsxs)(`button`,{onClick:()=>A(`teachers`),className:`notif-chip-btn ${k===`teachers`?`active`:``}`,children:[(0,h.jsx)(ie,{size:14}),(0,h.jsx)(`span`,{children:e===`ar`?`المعلمون`:`Teachers`})]}),(0,h.jsxs)(`button`,{onClick:()=>A(`private`),className:`notif-chip-btn ${k===`private`?`active`:``}`,children:[(0,h.jsx)(d,{size:14}),(0,h.jsx)(`span`,{children:e===`ar`?`إشعارات خاصة`:`Private`})]})]}),(0,h.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`8px`},children:[(0,h.jsxs)(`div`,{style:{position:`relative`,display:`flex`,alignItems:`center`},children:[(0,h.jsx)(`input`,{type:`date`,className:`text-field`,style:{height:`36px`,padding:`0 10px`,borderRadius:`10px`,border:`1px solid var(--color-border)`,backgroundColor:`var(--color-surface)`,color:`var(--color-text-primary)`,fontSize:`12px`,outline:`none`},value:M,onChange:e=>N(e.target.value),title:e===`ar`?`تصفية حسب التاريخ`:`Filter by Date`}),M&&(0,h.jsx)(`button`,{type:`button`,onClick:()=>N(``),style:{position:`absolute`,left:e===`ar`?`6px`:`auto`,right:e===`ar`?`auto`:`6px`,background:`transparent`,border:`none`,color:`var(--color-text-secondary)`,cursor:`pointer`,fontSize:`12px`},children:(0,h.jsx)(u,{size:12})})]}),v.length>0&&s(`communications`,`delete`)&&(0,h.jsxs)(`button`,{onClick:je,title:e===`ar`?`حذف سجل الإشعارات بالكامل`:`Delete all history`,style:{height:`36px`,padding:`0 12px`,borderRadius:`10px`,border:`1px solid rgba(239, 68, 68, 0.3)`,backgroundColor:`rgba(239, 68, 68, 0.05)`,color:`#ef4444`,fontSize:`12px`,fontWeight:`700`,cursor:`pointer`,display:`flex`,alignItems:`center`,gap:`5px`},children:[(0,h.jsx)(re,{size:14}),(0,h.jsx)(`span`,{children:e===`ar`?`مسح الكل`:`Clear All`})]})]})]}),S?(0,h.jsx)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`12px`},children:[1,2,3].map(e=>(0,h.jsx)(`div`,{style:{height:`110px`,borderRadius:`16px`,backgroundColor:`var(--color-surface-alt)`,border:`1px solid var(--color-border)`,opacity:.6,animation:`pulse 1.5s infinite ease-in-out`}},e))}):X.length>0?(0,h.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`24px`},children:[Z.today.length>0&&(0,h.jsxs)(`div`,{className:`notif-timeline-group`,children:[(0,h.jsxs)(`div`,{className:`notif-timeline-header`,children:[(0,h.jsx)(o,{size:14}),(0,h.jsx)(`span`,{children:e===`ar`?`اليوم`:`Today`}),(0,h.jsxs)(`span`,{style:{opacity:.7},children:[`(`,Z.today.length,`)`]})]}),Z.today.map(e=>$(e))]}),Z.yesterday.length>0&&(0,h.jsxs)(`div`,{className:`notif-timeline-group`,children:[(0,h.jsxs)(`div`,{className:`notif-timeline-header`,children:[(0,h.jsx)(oe,{size:14}),(0,h.jsx)(`span`,{children:e===`ar`?`أمس`:`Yesterday`}),(0,h.jsxs)(`span`,{style:{opacity:.7},children:[`(`,Z.yesterday.length,`)`]})]}),Z.yesterday.map(e=>$(e))]}),Z.earlier.length>0&&(0,h.jsxs)(`div`,{className:`notif-timeline-group`,children:[(0,h.jsxs)(`div`,{className:`notif-timeline-header`,children:[(0,h.jsx)(se,{size:14}),(0,h.jsx)(`span`,{children:e===`ar`?`سجلات أقدم`:`Earlier Notifications`}),(0,h.jsxs)(`span`,{style:{opacity:.7},children:[`(`,Z.earlier.length,`)`]})]}),Z.earlier.map(e=>$(e))]}),(0,h.jsx)(`div`,{className:`no-print`,style:{marginTop:`var(--space-md)`},children:(0,h.jsx)(a,{page:E,lastPage:y.lastPage,total:y.total,from:y.from,to:y.to,perPage:D,onPageChange:be,onPerPageChange:xe,loading:S,lang:e})})]}):(0,h.jsxs)(`div`,{style:{padding:`60px 24px`,textAlign:`center`,backgroundColor:`var(--color-surface-alt)`,borderRadius:`24px`,border:`1px dashed var(--color-border)`,display:`flex`,flexDirection:`column`,alignItems:`center`,justifyContent:`center`,gap:`12px`},children:[(0,h.jsx)(`div`,{style:{width:`64px`,height:`64px`,borderRadius:`20px`,backgroundColor:`rgba(30, 80, 142, 0.08)`,color:`var(--color-primary-ui)`,display:`flex`,alignItems:`center`,justifyContent:`center`},children:(0,h.jsx)(c,{size:32})}),(0,h.jsx)(`h3`,{style:{fontSize:`16px`,fontWeight:`800`,color:`var(--color-text-primary)`,margin:0},children:O?e===`ar`?`لا توجد نتائج تطابق كلمة البحث`:`No notifications match search`:e===`ar`?`لا توجد إشعارات مسجلة في هذا التبويب`:`No notifications found in this tab`}),(0,h.jsx)(`p`,{style:{fontSize:`13px`,color:`var(--color-text-secondary)`,margin:0,maxWidth:`400px`,lineHeight:1.5},children:e===`ar`?`يمكنك التبديل بين التبويبات أو النقر على "إنشاء إشعار فوري" لإرسال تنبيه جديد.`:`Switch tabs or click "Compose Alert" to broadcast a new notification.`}),s(`communications`,`create`)&&(0,h.jsxs)(`button`,{onClick:()=>{L(`parents`),W(``),K(``),j(!0)},style:{marginTop:`8px`,height:`38px`,padding:`0 18px`,borderRadius:`10px`,fontSize:`12.5px`,fontWeight:`800`,border:`none`,backgroundColor:`var(--color-primary-ui)`,color:`white`,cursor:`pointer`,display:`flex`,alignItems:`center`,gap:`6px`},children:[(0,h.jsx)(te,{size:16}),(0,h.jsx)(`span`,{children:e===`ar`?`إنشاء إشعار جديد الآن`:`Compose Alert Now`})]})]}),Ce&&(0,h.jsx)(`div`,{className:`modal-overlay no-print`,style:{backdropFilter:`blur(8px)`},children:(0,h.jsxs)(`div`,{className:`modal-container`,style:{maxWidth:`640px`,borderRadius:`24px`,overflow:`hidden`},children:[(0,h.jsxs)(`header`,{className:`modal-header`,style:{padding:`20px 24px`,borderBottom:`1px solid var(--color-border)`},children:[(0,h.jsxs)(`h3`,{className:`modal-title`,style:{fontSize:`16px`,fontWeight:`800`,display:`flex`,alignItems:`center`,gap:`8px`},children:[(0,h.jsx)(pe,{size:18,style:{color:`var(--color-primary-ui)`}}),(0,h.jsx)(`span`,{children:e===`ar`?`إرسال ونشر إشعار فوري جديد`:`Compose Instant Announcement`})]}),(0,h.jsx)(`button`,{className:`modal-close-btn`,type:`button`,onClick:()=>j(!1),style:{background:`var(--color-surface)`,width:`32px`,height:`32px`,borderRadius:`50%`,display:`flex`,alignItems:`center`,justifyContent:`center`,border:`none`,cursor:`pointer`},children:(0,h.jsx)(u,{size:16})})]}),(0,h.jsxs)(`form`,{onSubmit:Ne,children:[(0,h.jsxs)(`div`,{className:`modal-body`,style:{padding:`20px 24px`,display:`flex`,flexDirection:`column`,gap:`16px`},children:[(0,h.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`6px`},children:[(0,h.jsxs)(`label`,{style:{fontSize:`12px`,fontWeight:`800`,color:`var(--color-primary-ui)`,display:`flex`,alignItems:`center`,gap:`6px`},children:[(0,h.jsx)(me,{size:14}),(0,h.jsx)(`span`,{children:e===`ar`?`قوالب جاهزة بنقرة واحدة:`:`Quick Presets:`})]}),(0,h.jsxs)(`div`,{className:`preset-templates-container`,children:[(0,h.jsx)(`button`,{type:`button`,className:`preset-template-chip`,onClick:()=>Y(`general_announcement`),children:(0,h.jsxs)(`span`,{children:[`📜 `,e===`ar`?`تعميم إداري`:`General Notice`]})}),(0,h.jsx)(`button`,{type:`button`,className:`preset-template-chip`,onClick:()=>Y(`exam`),children:(0,h.jsxs)(`span`,{children:[`📅 `,e===`ar`?`جدول الاختبارات`:`Exam Schedule`]})}),(0,h.jsx)(`button`,{type:`button`,className:`preset-template-chip`,onClick:()=>Y(`parents_meeting`),children:(0,h.jsxs)(`span`,{children:[`👥 `,e===`ar`?`اجتماع أولياء الأمور`:`Parents Meeting`]})}),(0,h.jsx)(`button`,{type:`button`,className:`preset-template-chip`,onClick:()=>Y(`absence`),children:(0,h.jsxs)(`span`,{children:[`⚠️ `,e===`ar`?`تنبيه مواظبة`:`Attendance Alert`]})})]})]}),(0,h.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`8px`},children:[(0,h.jsxs)(`label`,{style:{fontSize:`12px`,fontWeight:`800`,color:`var(--color-text-primary)`},children:[`🎯 `,e===`ar`?`اختر الفئة المستهدفة:`:`Select Target Audience:`]}),(0,h.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:`repeat(auto-fit, minmax(100px, 1fr))`,gap:`8px`},children:[(0,h.jsxs)(`div`,{onClick:()=>L(`parents`),style:{padding:`10px 8px`,borderRadius:`12px`,border:I===`parents`?`2px solid var(--color-primary-ui)`:`1px solid var(--color-border)`,background:I===`parents`?`rgba(30, 80, 142, 0.08)`:`var(--color-surface)`,color:I===`parents`?`var(--color-primary-ui)`:`var(--color-text-primary)`,cursor:`pointer`,textAlign:`center`,fontSize:`11.5px`,fontWeight:`700`},children:[(0,h.jsx)(l,{size:18,style:{margin:`0 auto 4px auto`,display:`block`}}),(0,h.jsx)(`span`,{children:t.targetAllParents})]}),(0,h.jsxs)(`div`,{onClick:()=>{L(`class`),_.length>0&&!B&&V(_[0])},style:{padding:`10px 8px`,borderRadius:`12px`,border:I===`class`?`2px solid var(--color-primary-ui)`:`1px solid var(--color-border)`,background:I===`class`?`rgba(30, 80, 142, 0.08)`:`var(--color-surface)`,color:I===`class`?`var(--color-primary-ui)`:`var(--color-text-primary)`,cursor:`pointer`,textAlign:`center`,fontSize:`11.5px`,fontWeight:`700`},children:[(0,h.jsx)(p,{size:18,style:{margin:`0 auto 4px auto`,display:`block`}}),(0,h.jsx)(`span`,{children:t.targetByClass})]}),(0,h.jsxs)(`div`,{onClick:()=>{L(`student`),C.length>0&&!R&&z(C[0].id)},style:{padding:`10px 8px`,borderRadius:`12px`,border:I===`student`?`2px solid var(--color-primary-ui)`:`1px solid var(--color-border)`,background:I===`student`?`rgba(30, 80, 142, 0.08)`:`var(--color-surface)`,color:I===`student`?`var(--color-primary-ui)`:`var(--color-text-primary)`,cursor:`pointer`,textAlign:`center`,fontSize:`11.5px`,fontWeight:`700`},children:[(0,h.jsx)(d,{size:18,style:{margin:`0 auto 4px auto`,display:`block`}}),(0,h.jsx)(`span`,{children:t.targetByStudent})]}),(0,h.jsxs)(`div`,{onClick:()=>L(`teachers`),style:{padding:`10px 8px`,borderRadius:`12px`,border:I===`teachers`?`2px solid var(--color-primary-ui)`:`1px solid var(--color-border)`,background:I===`teachers`?`rgba(30, 80, 142, 0.08)`:`var(--color-surface)`,color:I===`teachers`?`var(--color-primary-ui)`:`var(--color-text-primary)`,cursor:`pointer`,textAlign:`center`,fontSize:`11.5px`,fontWeight:`700`},children:[(0,h.jsx)(l,{size:18,style:{margin:`0 auto 4px auto`,display:`block`}}),(0,h.jsx)(`span`,{children:t.targetAllTeachers})]})]})]}),I===`student`&&(0,h.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`6px`},children:[(0,h.jsxs)(`label`,{style:{fontSize:`11.5px`,fontWeight:`700`},children:[`🔍 `,t.selectStudent]}),(0,h.jsx)(`input`,{type:`text`,placeholder:e===`ar`?`ابحث باسم الطالب...`:`Search student...`,value:q,onChange:e=>Oe(e.target.value),className:`text-field`,style:{height:`36px`,fontSize:`12px`,padding:`0 10px`}}),(0,h.jsx)(`select`,{value:R,onChange:e=>z(e.target.value),className:`text-field`,style:{height:`38px`,fontSize:`12px`},children:Le.map(t=>(0,h.jsxs)(`option`,{value:t.id,children:[e===`ar`?t.name:t.nameEn||t.name,` (#`,t.id,`)`]},t.id))})]}),I===`class`&&(0,h.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`6px`},children:[(0,h.jsxs)(`label`,{style:{fontSize:`11.5px`,fontWeight:`700`},children:[`🏫 `,t.selectClass]}),(0,h.jsx)(`select`,{value:B,onChange:e=>V(e.target.value),className:`text-field`,style:{height:`38px`,fontSize:`12px`},children:_.map(e=>(0,h.jsx)(`option`,{value:e,children:e},e))})]}),(0,h.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`4px`},children:[(0,h.jsxs)(`label`,{style:{fontSize:`12px`,fontWeight:`800`,color:`var(--color-text-primary)`},children:[`📝 `,t.notificationTitleLabel]}),(0,h.jsx)(`input`,{type:`text`,value:U,onChange:e=>W(e.target.value),placeholder:e===`ar`?`عنوان الإشعار...`:`Notification title...`,className:`text-field`,style:{height:`38px`,fontSize:`12px`,padding:`0 12px`},required:!0})]}),(0,h.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`4px`},children:[(0,h.jsxs)(`label`,{style:{fontSize:`12px`,fontWeight:`800`,color:`var(--color-text-primary)`},children:[`💬 `,t.notificationContentLabel]}),(0,h.jsx)(`textarea`,{value:G,onChange:e=>K(e.target.value),placeholder:e===`ar`?`محتوى وتفاصيل البلاغ...`:`Notification content...`,className:`text-field`,style:{minHeight:`90px`,fontSize:`12px`,padding:`10px 12px`,resize:`vertical`},required:!0})]}),(0,h.jsxs)(`div`,{style:{fontSize:`11px`,color:`var(--color-text-secondary)`,display:`flex`,alignItems:`center`,gap:`8px`,background:`var(--color-surface)`,padding:`8px 12px`,borderRadius:`8px`,border:`1px solid var(--color-border)`},children:[(0,h.jsx)(f,{size:14,style:{color:`var(--color-success)`}}),(0,h.jsx)(`span`,{children:e===`ar`?`سيتم النشر كإشعار فوري للتطبيق وكسجل رسائل SMS كالمعتاد.`:`Will be broadcasted as instant Push Notification & SMS.`})]})]}),(0,h.jsxs)(`footer`,{className:`modal-footer`,style:{padding:`14px 24px`,borderTop:`1px solid var(--color-border)`,display:`flex`,justifyContent:`flex-end`,gap:`10px`},children:[(0,h.jsx)(`button`,{type:`button`,className:`btn-elevated`,onClick:()=>j(!1),style:{height:`36px`,padding:`0 16px`,borderRadius:`8px`,fontSize:`12px`,cursor:`pointer`},children:t.cancel}),(0,h.jsxs)(`button`,{type:`submit`,style:{height:`36px`,padding:`0 20px`,borderRadius:`8px`,fontSize:`12px`,fontWeight:`800`,background:`var(--gradient-brand)`,color:`white`,border:`none`,cursor:`pointer`,display:`flex`,alignItems:`center`,gap:`6px`},children:[(0,h.jsx)(pe,{size:14}),(0,h.jsx)(`span`,{children:e===`ar`?`إرسال ونشر الآن`:`Broadcast Now`})]})]})]})]})})]});function $(t){let n=t.type===`student`?C.find(e=>e.id===Number(t.studentId)):null,r=n?n.name:t.studentName,i=n?n.nameEn:t.studentNameEn,a=Ie(t.type,t.grade,r,i,t.teacherName,t.teacherNameEn),o=Fe(t.date);return(0,h.jsxs)(`div`,{className:`notif-card-linear ${t.isRead?``:`unread`}`,onClick:()=>{t.isRead||b(t.id)},children:[(0,h.jsxs)(`div`,{className:`notif-card-top-row`,children:[(0,h.jsxs)(`div`,{className:`notif-card-title-group`,children:[(0,h.jsx)(`div`,{className:`notif-avatar-box`,style:{backgroundColor:a.bgGlow,color:a.textColor,border:`1px solid ${a.borderColor}`},children:a.icon}),(0,h.jsxs)(`div`,{children:[(0,h.jsxs)(`h4`,{className:`notif-card-title`,children:[t.title,!t.isRead&&(0,h.jsx)(`span`,{style:{fontSize:`10px`,fontWeight:`800`,background:`#ef4444`,color:`white`,padding:`1px 7px`,borderRadius:`10px`,marginInlineStart:`8px`,display:`inline-block`,verticalAlign:`middle`},children:e===`ar`?`جديد`:`New`})]}),(0,h.jsxs)(`div`,{className:`notif-card-meta-row`,children:[(0,h.jsx)(`span`,{style:{fontSize:`11px`,fontWeight:`700`,color:a.textColor,background:a.bgGlow,padding:`2px 8px`,borderRadius:`6px`,border:`1px solid ${a.borderColor}`},children:a.label}),(0,h.jsxs)(`span`,{style:{fontSize:`11px`,color:`var(--color-text-secondary)`},children:[`🕒 `,o,` (`,t.date,`)`]})]})]})]}),(0,h.jsxs)(`div`,{className:`notif-action-btn-group no-print`,onClick:e=>e.stopPropagation(),children:[!t.isRead&&(0,h.jsx)(`button`,{className:`notif-icon-action`,onClick:()=>b(t.id),title:e===`ar`?`تحديد كمقروء`:`Mark as read`,children:(0,h.jsx)(fe,{size:14})}),(0,h.jsx)(`button`,{className:`notif-icon-action`,onClick:e=>Me(e,t),title:e===`ar`?`نسخ نص الإشعار`:`Copy notification text`,children:Ee===t.id?(0,h.jsx)(fe,{size:14,style:{color:`var(--color-success)`}}):(0,h.jsx)(ee,{size:14})}),s(`communications`,`delete`)&&(0,h.jsx)(`button`,{className:`notif-icon-action danger`,onClick:e=>Ae(e,t.id),title:e===`ar`?`حذف الإشعار`:`Delete notification`,children:(0,h.jsx)(re,{size:14})})]})]}),(0,h.jsx)(`p`,{className:`notif-card-body`,children:t.content}),(0,h.jsxs)(`div`,{className:`notif-card-footer`,children:[(0,h.jsx)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`6px`},children:(0,h.jsxs)(`span`,{children:[`✍️ `,e===`ar`?`المرسل: `:`Sender: `,Pe(t).name]})}),(0,h.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`5px`,color:`var(--color-success)`},children:[(0,h.jsx)(f,{size:13}),(0,h.jsx)(`span`,{children:e===`ar`?`تم النشر كإشعار فوري وتنبيه SMS`:`Sent via Push & SMS`})]})]})]},t.id)}}function _(){return(0,h.jsx)(g,{})}export{_ as default};