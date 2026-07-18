import{d as e,l as t,n,o as r}from"./AppContext-C9gEC9Yl.js";import{t as i}from"./plus-D5Ztrqim.js";import{t as a}from"./search-D4hEFmqd.js";import{t as o}from"./trash-2-BYlUM8dO.js";import{t as s}from"./user-D0V_d2D5.js";import{O as c,T as ee,b as l,i as u,r as d,t as te,u as f,x as ne,y as p}from"./index-BLkoJFTn.js";var re=l(`circle-check`,[[`circle`,{cx:`12`,cy:`12`,r:`10`,key:`1mglay`}],[`path`,{d:`m9 12 2 2 4-4`,key:`dzmm74`}]]),ie=l(`info`,[[`circle`,{cx:`12`,cy:`12`,r:`10`,key:`1mglay`}],[`path`,{d:`M12 16v-4`,key:`1dtifu`}],[`path`,{d:`M12 8h.01`,key:`e9boi3`}]]),m=l(`layers`,[[`path`,{d:`M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z`,key:`zw3jo`}],[`path`,{d:`M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12`,key:`1wduqc`}],[`path`,{d:`M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17`,key:`kqbvx6`}]]),ae=l(`message-square`,[[`path`,{d:`M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z`,key:`18887p`}]]),h=l(`send`,[[`path`,{d:`M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z`,key:`1ffxy3`}],[`path`,{d:`m21.854 2.147-10.94 10.939`,key:`12cjpa`}]]),oe=l(`volume-2`,[[`path`,{d:`M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z`,key:`uqj9uw`}],[`path`,{d:`M16 9a5 5 0 0 1 0 6`,key:`1q6k2b`}],[`path`,{d:`M19.364 18.364a9 9 0 0 0 0-12.728`,key:`ijwkga`}]]),g=e(t(),1),_=r();function v(){let{lang:e,t,triggerConfirm:r,canAction:l}=n(),{availableGrades:v,fetchClasses:y}=c(),{notifications:b,handleSendNotification:se,handleMarkNotificationAsRead:x,handleDeleteNotification:ce,handleDeleteAllNotifications:le}=ee(),{students:S,fetchStudents:C}=te(),{teachers:w,fetchTeachers:T}=ne();(0,g.useEffect)(()=>{y(),C(),T()},[y,C,T]);let[ue,E]=(0,g.useState)(!1),[D,O]=(0,g.useState)(``),[k,A]=(0,g.useState)(`all`),[j,M]=(0,g.useState)(``),[N]=(0,g.useState)(`all`),de=(t,n)=>{t.stopPropagation(),r({title:e===`ar`?`حذف الإشعار`:`Delete Notification`,message:e===`ar`?`هل أنت متأكد من حذف هذا الإشعار نهائياً؟`:`Are you sure you want to permanently delete this notification?`,onConfirm:()=>{ce(n)}})},fe=()=>{r({title:e===`ar`?`حذف جميع الإشعارات`:`Delete All Notifications`,message:e===`ar`?`هل أنت متأكد من حذف جميع الإشعارات نهائياً؟ هذا الإجراء لا يمكن التراجع عنه!`:`Are you sure you want to delete all notifications permanently? This action cannot be undone!`,onConfirm:()=>{le()}})},[P,F]=(0,g.useState)(`parents`),[I,L]=(0,g.useState)(S.length>0?S[0].id:``),[R,z]=(0,g.useState)(v.length>0?v[0]:``),[B,V]=(0,g.useState)(w.length>0?w[0].id:``),[H,U]=(0,g.useState)(``),[W,G]=(0,g.useState)(``),[K,q]=(0,g.useState)(``),[J,Y]=(0,g.useState)(``),pe=t=>{if(t.preventDefault(),!H.trim()||!W.trim())return;let n=new Date().toISOString().replace(`T`,` `).substring(0,16),r={};if(P===`student`){let e=S.find(e=>e.id===Number(I));r={studentId:Number(I),studentName:e?e.name:null,studentNameEn:e?e.nameEn:null}}else if(P===`class`)r={grade:R};else if(P===`teacher`){let e=w.find(e=>e.id===Number(B));r={teacherId:Number(B),teacherName:e?e.name:null,teacherNameEn:e?e.nameEn:null}}let i={id:Date.now(),title:H,content:W,date:n,type:P,...r},a=[];if(P===`student`){let t=S.find(e=>e.id===Number(I));if(t){let r=e===`ar`?`تنبيه خاص بخصوص ابنكم ${t.name}: ${H} - ${W}. رياض و مدارس انوار العلى.`:`Private alert for ${t.nameEn}: ${H} - ${W}. Riyadh & Anwar Al-Ola.`;a.push({id:Date.now(),studentId:t.id,recipient:t.phone,text:r,time:n.split(` `)[1],type:`present`})}}else P===`class`?S.filter(e=>e.grade===R).forEach((t,r)=>{let i=e===`ar`?`تعميم لصف ${R}: ${H} - ${W}.`:`Class announcement for ${R}: ${H} - ${W}.`;a.push({id:Date.now()+Math.random()+r,studentId:t.id,recipient:t.phone,text:i,time:n.split(` `)[1],type:`present`})}):P===`parents`&&S.forEach((t,r)=>{let i=e===`ar`?`إشعار عام من المدرسة لأولياء الأمور: ${H} - ${W}.`:`Broadcast Announcement to Parents: ${H} - ${W}.`;a.push({id:Date.now()+Math.random()+r,studentId:t.id,recipient:t.phone,text:i,time:n.split(` `)[1],type:`present`})});se(i,a),E(!1),U(``),G(``),q(``),Y(``)},X=(0,g.useCallback)(t=>t.type===`attendance`?{name:e===`ar`?`مشرف التحضير`:`Prep Supervisor`,key:`supervisor`}:{name:e===`ar`?`إدارة المدرسة`:`School Administration`,key:`admin`},[e]),Z=(0,g.useMemo)(()=>b.filter(e=>!(e.title.toLowerCase().includes(D.toLowerCase())||e.content.toLowerCase().includes(D.toLowerCase()))||j&&!e.date.startsWith(j)||N!==`all`&&X(e).key!==N?!1:k===`all`?!0:k===`parents`?e.type===`parents`||e.type===`general`:k===`teachers`?e.type===`teachers`||e.type===`teacher`:k===`classes`?e.type===`class`:k===`private`?e.type===`student`||e.type===`private`:!0),[b,D,j,N,k,X]),me=b.length,he=(0,g.useMemo)(()=>b.filter(e=>e.type===`parents`||e.type===`general`).length,[b]),ge=(0,g.useMemo)(()=>b.filter(e=>e.type===`class`).length,[b]),_e=(0,g.useMemo)(()=>b.filter(e=>e.type===`student`||e.type===`private`).length,[b]),Q=(0,g.useMemo)(()=>S.filter(e=>e.name.toLowerCase().includes(K.toLowerCase())||e.id.toString().includes(K)),[S,K]),$=(0,g.useMemo)(()=>w.filter(e=>e.name.toLowerCase().includes(J.toLowerCase())||e.id.toString().includes(J)),[w,J]),ve=(t,n,r,i,a,o)=>{if(t===`general`||t===`parents`)return{label:e===`ar`?`عام لأولياء الأمور`:`All Parents`,colorClass:`badge-parents`,gradientBorder:`var(--gradient-brand)`,icon:(0,_.jsx)(u,{size:15})};if(t===`class`)return{label:e===`ar`?`الصف: ${n}`:`Class: ${n}`,colorClass:`badge-class`,gradientBorder:`var(--gradient-warning)`,icon:(0,_.jsx)(m,{size:15})};if(t===`student`||t===`private`){let t=e===`ar`?r:i||r;return{label:e===`ar`?`طالب: ${t}`:`Student: ${t}`,colorClass:`badge-student`,gradientBorder:`var(--gradient-error)`,icon:(0,_.jsx)(f,{size:15})}}else if(t===`teachers`)return{label:e===`ar`?`جميع المعلمين`:`All Teachers`,colorClass:`badge-teachers`,gradientBorder:`var(--gradient-success)`,icon:(0,_.jsx)(u,{size:15})};else if(t===`teacher`){let t=e===`ar`?a:o||a;return{label:e===`ar`?`المعلم: ${t}`:`Teacher: ${t}`,colorClass:`badge-teacher`,gradientBorder:`linear-gradient(135deg, #0f766e 0%, #115e59 100%)`,icon:(0,_.jsx)(s,{size:15})}}return{label:e===`ar`?`إشعار`:`Alert`,colorClass:`badge-neutral`,gradientBorder:`var(--color-border)`,icon:(0,_.jsx)(p,{size:15})}};return(0,_.jsxs)(`div`,{className:`notifications-dashboard-container`,children:[(0,_.jsx)(`style`,{children:`
        .notifications-dashboard-container {
          display: flex;
          flex-direction: column;
          gap: var(--space-xl);
          animation: fadeIn 0.4s ease-out;
        }

        /* 1. KPI Cards Grid */
        .stats-grid-modern {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: var(--space-lg);
        }
        .stat-card-glass {
          background: var(--color-surface-alt);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-card);
          padding: var(--space-xl);
          display: flex;
          align-items: center;
          gap: var(--space-lg);
          box-shadow: var(--color-shadow);
          transition: var(--transition-normal);
          position: relative;
          overflow: hidden;
        }
        .stat-card-glass:hover {
          transform: translateY(-5px);
          box-shadow: var(--color-shadow-hover);
          border-color: var(--color-primary-ui);
        }
        .stat-icon-wrapper {
          width: 52px;
          height: 52px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.05);
        }
        .stat-content {
          display: flex;
          flex-direction: column;
        }
        .stat-number-value {
          font-size: 26px;
          font-weight: 800;
          color: var(--color-text-primary);
          line-height: 1.1;
          font-family: var(--font-english);
        }
        .stat-label-text {
          font-size: 13px;
          color: var(--color-text-secondary);
          margin-top: 4px;
          font-weight: 600;
        }

        /* 2. Control Toolbar */
        .toolbar-panel-glass {
          background: var(--color-surface-alt);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-card);
          padding: var(--space-lg) var(--space-xl);
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          gap: var(--space-lg);
          box-shadow: var(--color-shadow);
        }
        .search-input-modern-wrapper {
          position: relative;
          min-width: 280px;
          flex-grow: 1;
          max-width: 450px;
        }
        .search-input-modern-wrapper input {
          width: 100%;
          padding: 10px 42px 10px 16px;
          border-radius: 14px;
          border: 1.5px solid var(--color-border);
          background: var(--color-surface);
          color: var(--color-text-primary);
          font-size: 13.5px;
          font-weight: 500;
          transition: var(--transition-fast);
        }
        body[dir="ltr"] .search-input-modern-wrapper input {
          padding: 10px 16px 10px 42px;
        }
        .search-input-modern-wrapper input:focus {
          border-color: var(--color-primary-ui);
          box-shadow: var(--color-focus-glow);
          outline: none;
        }
        .search-input-icon {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          right: 14px;
          color: var(--color-text-secondary);
        }
        body[dir="ltr"] .search-input-icon {
          right: auto;
          left: 14px;
        }

        /* Segmented Pills */
        .filter-pills-modern {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          background: var(--color-surface);
          padding: 5px;
          border-radius: 16px;
          border: 1px solid var(--color-border);
        }
        .pill-btn-modern {
          border: none;
          background: transparent;
          color: var(--color-text-secondary);
          padding: 8px 16px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: var(--transition-fast);
        }
        .pill-btn-modern:hover {
          color: var(--color-text-primary);
          background: rgba(0, 0, 0, 0.03);
        }
        .pill-btn-modern.active-pill {
          background: var(--color-surface-alt);
          color: var(--color-primary-ui);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.04);
        }
        .btn-gradient-compose {
          background: var(--gradient-brand);
          color: white;
          font-weight: 700;
          font-size: 13.5px;
          border: none;
          border-radius: 14px;
          padding: 10px 22px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 14px rgba(30, 80, 142, 0.2);
          transition: var(--transition-fast);
        }
        .btn-gradient-compose:hover {
          transform: scale(1.02);
          box-shadow: 0 6px 20px rgba(30, 80, 142, 0.3);
        }

        /* 3. Notification Feed */
        .feed-container-modern {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }
        .notif-card-modern {
          background: var(--color-surface-alt);
          border: 1.5px solid var(--color-border);
          border-radius: 22px;
          padding: var(--space-xl);
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
          box-shadow: var(--color-shadow);
          transition: var(--transition-normal);
          position: relative;
        }
        .notif-card-modern.unread-notif {
          background: rgba(30, 80, 142, 0.03);
          border-color: var(--color-primary-ui);
        }
        .notif-card-modern::before {
          content: '';
          position: absolute;
          top: 0;
          bottom: 0;
          right: 0;
          width: 6px;
          background: var(--border-grad, var(--gradient-brand));
          border-radius: 0 22px 22px 0;
        }
        body[dir="rtl"] .notif-card-modern::before {
          right: 0;
          left: auto;
          border-radius: 0 22px 22px 0;
        }
        body[dir="ltr"] .notif-card-modern::before {
          right: auto;
          left: 0;
          border-radius: 22px 0 0 22px;
        }
        .notif-card-modern:hover {
          transform: translateY(-3px);
          box-shadow: var(--color-shadow-hover);
          border-color: rgba(30, 80, 142, 0.15);
        }
        .notif-header-modern {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: var(--space-lg);
        }
        .notif-title-section {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .notif-category-icon {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-surface);
          color: var(--color-primary-ui);
          border: 1px solid var(--color-border);
        }
        .notif-title-text {
          font-size: 15px;
          font-weight: 700;
          color: var(--color-text-primary);
        }
        
        /* Badges status style overrides */
        .badge-parents {
          background: rgba(30, 80, 142, 0.08);
          color: var(--color-primary-ui);
        }
        .badge-class {
          background: rgba(230, 150, 15, 0.08);
          color: var(--color-warning);
        }
        .badge-student {
          background: rgba(220, 40, 40, 0.08);
          color: var(--color-error);
        }
        .badge-teachers {
          background: rgba(16, 120, 60, 0.08);
          color: var(--color-success);
        }
        .badge-teacher {
          background: rgba(15, 118, 110, 0.08);
          color: #0f766e;
        }

        .notif-body-text {
          font-size: 13.5px;
          line-height: 1.6;
          color: var(--color-text-secondary);
          font-weight: 500;
          white-space: pre-line;
        }
        .notif-footer-modern {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 11.5px;
          font-weight: 600;
          color: var(--color-text-secondary);
          border-top: 1px dashed var(--color-border);
          padding-top: 12px;
        }
        .notif-footer-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        /* 4. Audience Cards Selection (Inside Modal) */
        .audience-grid-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
          gap: 12px;
          margin-bottom: var(--space-lg);
        }
        .audience-card-item {
          border: 2px solid var(--color-border);
          border-radius: 18px;
          padding: var(--space-lg) var(--space-md);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          cursor: pointer;
          background: var(--color-surface);
          transition: var(--transition-normal);
          text-align: center;
        }
        .audience-card-item:hover {
          border-color: rgba(30, 80, 142, 0.3);
          background: var(--color-surface-alt);
        }
        .audience-card-item.selected-audience-card {
          border-color: var(--color-primary-ui);
          background: rgba(30, 80, 142, 0.04);
          transform: scale(1.02);
          box-shadow: 0 4px 14px rgba(30, 80, 142, 0.06);
        }
        .audience-card-icon-circle {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: var(--color-surface-alt);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-text-secondary);
          border: 1px solid var(--color-border);
          transition: var(--transition-fast);
        }
        .selected-audience-card .audience-card-icon-circle {
          background: var(--color-primary-ui);
          color: white;
          border-color: var(--color-primary-ui);
        }
        .audience-card-label {
          font-size: 12px;
          font-weight: 700;
          color: var(--color-text-primary);
        }

        /* Interactive Select/Search Wrapper */
        .live-search-select-wrapper {
          border: 1.5px solid var(--color-border);
          border-radius: 14px;
          background: var(--color-surface);
          padding: 8px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .live-search-select-results {
          max-height: 150px;
          overflow-y: auto;
          border: 1px solid var(--color-border);
          border-radius: 10px;
          background: var(--color-surface-alt);
        }
        .live-search-select-row {
          padding: 10px 14px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition-fast);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .live-search-select-row:hover {
          background: rgba(30, 80, 142, 0.05);
          color: var(--color-primary-ui);
        }
        .live-search-select-row.selected-row-item {
          background: rgba(30, 80, 142, 0.08);
          color: var(--color-primary-ui);
        }
      `}),(0,_.jsxs)(`div`,{className:`informative-banner-modern no-print`,style:{padding:`var(--space-lg) var(--space-xl)`,background:`var(--color-surface-alt)`,border:`1px solid var(--color-border)`,borderInlineStart:`4px solid var(--color-primary-ui)`,borderRadius:`var(--radius-card)`,boxShadow:`var(--color-shadow)`,display:`flex`,alignItems:`center`,gap:`var(--space-md)`},children:[(0,_.jsx)(`div`,{style:{width:`38px`,height:`38px`,borderRadius:`10px`,background:`rgba(30, 80, 142, 0.06)`,color:`var(--color-primary-ui)`,display:`flex`,alignItems:`center`,justifyContent:`center`},children:(0,_.jsx)(ie,{size:18})}),(0,_.jsx)(`p`,{style:{margin:0,fontSize:`13px`,lineHeight:`1.6`,color:`var(--color-text-secondary)`,fontWeight:`600`},children:e===`ar`?`منصة الاتصالات والإشعارات الموحدة: تتيح لك إرسال التنبيهات الفورية الفعالة والتعاميم المباشرة لفئات مختلفة في المدرسة مع تتبع فوري لحالة التسليم.`:`Unified Communications & Notifications Platform: Allows you to push instant notifications and announcements to various school segments with direct delivery tracking.`})]}),(0,_.jsxs)(`div`,{className:`stats-grid-modern no-print`,children:[(0,_.jsxs)(`div`,{className:`stat-card-glass`,children:[(0,_.jsx)(`div`,{className:`stat-icon-wrapper`,style:{background:`var(--gradient-brand)`},children:(0,_.jsx)(p,{size:24})}),(0,_.jsxs)(`div`,{className:`stat-content`,children:[(0,_.jsx)(`span`,{className:`stat-number-value`,children:me}),(0,_.jsx)(`span`,{className:`stat-label-text`,children:e===`ar`?`إجمالي الإشعارات`:`Total Notifications`})]})]}),(0,_.jsxs)(`div`,{className:`stat-card-glass`,children:[(0,_.jsx)(`div`,{className:`stat-icon-wrapper`,style:{background:`var(--gradient-info)`},children:(0,_.jsx)(u,{size:24})}),(0,_.jsxs)(`div`,{className:`stat-content`,children:[(0,_.jsx)(`span`,{className:`stat-number-value`,children:he}),(0,_.jsx)(`span`,{className:`stat-label-text`,children:e===`ar`?`تعاميم أولياء الأمور`:`Parents Broadcasts`})]})]}),(0,_.jsxs)(`div`,{className:`stat-card-glass`,children:[(0,_.jsx)(`div`,{className:`stat-icon-wrapper`,style:{background:`var(--gradient-warning)`},children:(0,_.jsx)(m,{size:24})}),(0,_.jsxs)(`div`,{className:`stat-content`,children:[(0,_.jsx)(`span`,{className:`stat-number-value`,children:ge}),(0,_.jsx)(`span`,{className:`stat-label-text`,children:e===`ar`?`تعاميم الفصول`:`Class Broadcasts`})]})]}),(0,_.jsxs)(`div`,{className:`stat-card-glass`,children:[(0,_.jsx)(`div`,{className:`stat-icon-wrapper`,style:{background:`var(--gradient-error)`},children:(0,_.jsx)(f,{size:24})}),(0,_.jsxs)(`div`,{className:`stat-content`,children:[(0,_.jsx)(`span`,{className:`stat-number-value`,children:_e}),(0,_.jsx)(`span`,{className:`stat-label-text`,children:e===`ar`?`التنبيهات الفردية`:`Private Alerts`})]})]})]}),(0,_.jsxs)(`div`,{className:`toolbar-panel-glass no-print`,children:[(0,_.jsxs)(`div`,{className:`search-input-modern-wrapper`,children:[(0,_.jsx)(a,{size:18,className:`search-input-icon`}),(0,_.jsx)(`input`,{type:`text`,placeholder:e===`ar`?`البحث في سجل الإشعارات المرسلة...`:`Search sent history...`,value:D,onChange:e=>O(e.target.value)})]}),(0,_.jsx)(`div`,{style:{display:`flex`,gap:`8px`,flexWrap:`wrap`,alignItems:`center`},children:(0,_.jsxs)(`div`,{style:{position:`relative`,display:`flex`,alignItems:`center`},children:[(0,_.jsx)(`input`,{type:`date`,className:`text-field`,style:{height:`42px`,padding:`0 12px`,borderRadius:`14px`,border:`1.5px solid var(--color-border)`,backgroundColor:`var(--color-surface)`,color:`var(--color-text-primary)`,fontSize:`13px`,outline:`none`},value:j,onChange:e=>M(e.target.value),title:e===`ar`?`تصفية حسب التاريخ`:`Filter by Date`}),j&&(0,_.jsx)(`button`,{type:`button`,onClick:()=>M(``),style:{position:`absolute`,left:e===`ar`?`8px`:`auto`,right:e===`ar`?`auto`:`8px`,background:`transparent`,border:`none`,color:`var(--color-text-secondary)`,cursor:`pointer`,fontSize:`12px`,display:`flex`,alignItems:`center`,justifyContent:`center`},children:(0,_.jsx)(d,{size:14})})]})}),(0,_.jsxs)(`div`,{className:`filter-pills-modern`,children:[(0,_.jsx)(`button`,{onClick:()=>A(`all`),className:`pill-btn-modern ${k===`all`?`active-pill`:``}`,children:e===`ar`?`الكل`:`All`}),(0,_.jsx)(`button`,{onClick:()=>A(`parents`),className:`pill-btn-modern ${k===`parents`?`active-pill`:``}`,children:e===`ar`?`أولياء الأمور`:`Parents`}),(0,_.jsx)(`button`,{onClick:()=>A(`classes`),className:`pill-btn-modern ${k===`classes`?`active-pill`:``}`,children:e===`ar`?`الصفوف`:`Classes`}),(0,_.jsx)(`button`,{onClick:()=>A(`teachers`),className:`pill-btn-modern ${k===`teachers`?`active-pill`:``}`,children:e===`ar`?`المعلمون`:`Teachers`}),(0,_.jsx)(`button`,{onClick:()=>A(`private`),className:`pill-btn-modern ${k===`private`?`active-pill`:``}`,children:e===`ar`?`إشعار خاص`:`Private`})]}),(0,_.jsxs)(`div`,{style:{display:`flex`,gap:`8px`,flexWrap:`wrap`},children:[b.length>0&&l(`communications`,`delete`)&&(0,_.jsxs)(`button`,{className:`btn-elevated`,style:{borderRadius:`12px`,borderColor:`rgba(239, 68, 68, 0.3)`,backgroundColor:`rgba(239, 68, 68, 0.05)`,color:`var(--color-error)`,display:`flex`,alignItems:`center`,gap:`6px`,paddingInline:`16px`,fontWeight:`700`,minHeight:`40px`,cursor:`pointer`},onClick:fe,children:[(0,_.jsx)(o,{size:16}),(0,_.jsx)(`span`,{children:e===`ar`?`حذف الكل`:`Delete All`})]}),l(`communications`,`create`)&&(0,_.jsxs)(`button`,{className:`btn-gradient-compose`,onClick:()=>{F(`parents`),U(``),G(``),E(!0)},children:[(0,_.jsx)(i,{size:16,strokeWidth:3}),(0,_.jsx)(`span`,{children:e===`ar`?`إنشاء إشعار فوري`:`Compose Alert`})]})]})]}),(0,_.jsxs)(`div`,{className:`feed-container-modern`,children:[(0,_.jsxs)(`h4`,{style:{fontSize:`15px`,fontWeight:`800`,color:`var(--color-text-primary)`,display:`flex`,alignItems:`center`,gap:`8px`,margin:`var(--space-sm) 0`},children:[(0,_.jsx)(oe,{size:18,style:{color:`var(--color-primary-ui)`}}),(0,_.jsx)(`span`,{children:t.notificationsHistoryTitle}),(0,_.jsx)(`span`,{style:{fontSize:`11px`,background:`var(--color-surface)`,border:`1px solid var(--color-border)`,padding:`2px 8px`,borderRadius:`20px`,color:`var(--color-text-secondary)`,fontFamily:`var(--font-english)`},children:Z.length})]}),Z.length>0?Z.map(t=>{let n=t.type===`student`?S.find(e=>e.id===Number(t.studentId)):null,r=n?n.name:t.studentName,i=n?n.nameEn:t.studentNameEn,a=ve(t.type,t.grade,r,i,t.teacherName,t.teacherNameEn);return(0,_.jsxs)(`div`,{className:`notif-card-modern ${t.isRead?``:`unread-notif`}`,style:{"--border-grad":a.gradientBorder,cursor:t.isRead?`default`:`pointer`},onClick:()=>{t.isRead||x(t.id)},children:[(0,_.jsxs)(`div`,{className:`notif-header-modern`,children:[(0,_.jsxs)(`div`,{className:`notif-title-section`,children:[(0,_.jsx)(`div`,{className:`notif-category-icon`,children:a.icon}),(0,_.jsxs)(`span`,{className:`notif-title-text`,children:[t.title,!t.isRead&&(0,_.jsx)(`span`,{className:`badge-new-notif`,style:{backgroundColor:`var(--color-error)`,color:`white`,padding:`2px 8px`,borderRadius:`10px`,fontSize:`10px`,fontWeight:`bold`,marginInlineStart:`8px`,display:`inline-block`,verticalAlign:`middle`},children:e===`ar`?`جديد`:`New`})]})]}),(0,_.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`8px`},onClick:e=>e.stopPropagation(),children:[(0,_.jsxs)(`span`,{className:`badge-status ${a.colorClass}`,style:{fontSize:`11px`,fontWeight:`700`,padding:`6px 14px`,borderRadius:`12px`,display:`inline-flex`,alignItems:`center`,gap:`6px`},children:[a.icon,(0,_.jsx)(`span`,{children:a.label})]}),l(`communications`,`delete`)&&(0,_.jsx)(`button`,{className:`btn-elevated`,style:{padding:`6px`,borderRadius:`8px`,color:`var(--color-error)`,border:`1px solid rgba(239, 68, 68, 0.2)`,backgroundColor:`rgba(239, 68, 68, 0.05)`,cursor:`pointer`,display:`inline-flex`,alignItems:`center`,justifyContent:`center`,minHeight:`auto`},onClick:e=>de(e,t.id),title:e===`ar`?`حذف الإشعار`:`Delete Notification`,children:(0,_.jsx)(o,{size:14})})]})]}),(0,_.jsx)(`p`,{className:`notif-body-text`,children:t.content}),(0,_.jsxs)(`div`,{className:`notif-footer-modern`,children:[(0,_.jsx)(`div`,{className:`notif-footer-item`,children:(0,_.jsxs)(`span`,{children:[`🕒 `,t.date]})}),(0,_.jsx)(`div`,{className:`notif-footer-item`,style:{fontWeight:`600`,color:`var(--color-primary-ui)`},children:(0,_.jsxs)(`span`,{children:[`✍️ `,e===`ar`?`المرسل: `:`Sender: `,X(t).name]})}),(0,_.jsxs)(`div`,{className:`notif-footer-item`,style:{color:`var(--color-success)`},children:[(0,_.jsx)(re,{size:12}),(0,_.jsx)(`span`,{children:e===`ar`?`تم النشر كإشعار فوري للهاتف والـ SMS`:`Broadcasted via Push Notification & SMS`})]})]})]},t.id)}):(0,_.jsxs)(`div`,{style:{textAlign:`center`,padding:`50px var(--space-xl)`,color:`var(--color-text-secondary)`,background:`var(--color-surface-alt)`,border:`1.5px dashed var(--color-border)`,borderRadius:`var(--radius-card)`,display:`flex`,flexDirection:`column`,alignItems:`center`,gap:`var(--space-md)`},children:[(0,_.jsx)(ae,{size:38,style:{opacity:.35,color:`var(--color-text-secondary)`}}),(0,_.jsx)(`span`,{style:{fontSize:`14.5px`,fontWeight:`600`},children:t.noNotifications})]})]}),ue&&(0,_.jsx)(`div`,{className:`modal-overlay no-print`,style:{backdropFilter:`blur(8px)`},children:(0,_.jsxs)(`div`,{className:`modal-container`,style:{maxWidth:`650px`,borderRadius:`30px`,overflow:`hidden`},children:[(0,_.jsxs)(`header`,{className:`modal-header`,style:{padding:`var(--space-xl) var(--space-xxl)`,borderBottom:`1px solid var(--color-border)`},children:[(0,_.jsxs)(`h3`,{className:`modal-title`,style:{fontSize:`17px`,fontWeight:`800`,display:`flex`,alignItems:`center`,gap:`8px`},children:[(0,_.jsx)(h,{size:18,style:{color:`var(--color-primary-ui)`}}),(0,_.jsx)(`span`,{children:e===`ar`?`إرسال إشعار فوري جديد`:`Send Push Announcement`})]}),(0,_.jsx)(`button`,{className:`modal-close-btn`,type:`button`,onClick:()=>E(!1),style:{background:`var(--color-surface)`,width:`34px`,height:`34px`,borderRadius:`50%`,display:`flex`,alignItems:`center`,justifyContent:`center`,border:`none`,cursor:`pointer`},children:(0,_.jsx)(d,{size:16,strokeWidth:2.5})})]}),(0,_.jsxs)(`form`,{onSubmit:pe,children:[(0,_.jsxs)(`div`,{className:`modal-body`,style:{padding:`var(--space-xl) var(--space-xxl)`,display:`flex`,flexDirection:`column`,gap:`var(--space-lg)`},children:[(0,_.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`8px`},children:[(0,_.jsxs)(`label`,{style:{fontSize:`13px`,fontWeight:`800`,color:`var(--color-text-primary)`},children:[`🎯 `,e===`ar`?`اختر الجمهور المستهدف`:`Select Target Audience`]}),(0,_.jsxs)(`div`,{className:`audience-grid-cards`,children:[(0,_.jsxs)(`div`,{className:`audience-card-item ${P===`parents`?`selected-audience-card`:``}`,onClick:()=>F(`parents`),children:[(0,_.jsx)(`div`,{className:`audience-card-icon-circle`,children:(0,_.jsx)(u,{size:20})}),(0,_.jsx)(`span`,{className:`audience-card-label`,children:t.targetAllParents})]}),(0,_.jsxs)(`div`,{className:`audience-card-item ${P===`class`?`selected-audience-card`:``}`,onClick:()=>{F(`class`),v.length>0&&!R&&z(v[0])},children:[(0,_.jsx)(`div`,{className:`audience-card-icon-circle`,children:(0,_.jsx)(m,{size:20})}),(0,_.jsx)(`span`,{className:`audience-card-label`,children:t.targetByClass})]}),(0,_.jsxs)(`div`,{className:`audience-card-item ${P===`student`?`selected-audience-card`:``}`,onClick:()=>{F(`student`),S.length>0&&!I&&L(S[0].id)},children:[(0,_.jsx)(`div`,{className:`audience-card-icon-circle`,children:(0,_.jsx)(f,{size:20})}),(0,_.jsx)(`span`,{className:`audience-card-label`,children:t.targetByStudent})]}),(0,_.jsxs)(`div`,{className:`audience-card-item ${P===`teachers`?`selected-audience-card`:``}`,onClick:()=>F(`teachers`),children:[(0,_.jsx)(`div`,{className:`audience-card-icon-circle`,children:(0,_.jsx)(u,{size:20})}),(0,_.jsx)(`span`,{className:`audience-card-label`,children:t.targetAllTeachers})]}),(0,_.jsxs)(`div`,{className:`audience-card-item ${P===`teacher`?`selected-audience-card`:``}`,onClick:()=>{F(`teacher`),w.length>0&&!B&&V(w[0].id)},children:[(0,_.jsx)(`div`,{className:`audience-card-icon-circle`,children:(0,_.jsx)(s,{size:20})}),(0,_.jsx)(`span`,{className:`audience-card-label`,children:t.targetSpecificTeacher})]})]})]}),P===`student`&&(0,_.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`8px`},children:[(0,_.jsxs)(`label`,{style:{fontSize:`13px`,fontWeight:`800`,color:`var(--color-text-primary)`},children:[`🔍 `,t.selectStudent]}),(0,_.jsxs)(`div`,{className:`live-search-select-wrapper`,children:[(0,_.jsxs)(`div`,{style:{position:`relative`},children:[(0,_.jsx)(a,{size:16,style:{position:`absolute`,top:`50%`,right:`12px`,transform:`translateY(-50%)`,color:`var(--color-text-secondary)`}}),(0,_.jsx)(`input`,{type:`text`,placeholder:e===`ar`?`ابحث باسم الطالب أو الرقم الأكاديمي...`:`Search student by name or ID...`,value:K,onChange:e=>q(e.target.value),className:`text-field`,style:{paddingRight:`36px`,minHeight:`38px`,borderRadius:`10px`}})]}),(0,_.jsx)(`div`,{className:`live-search-select-results`,children:Q.length>0?Q.map(t=>(0,_.jsxs)(`div`,{className:`live-search-select-row ${I===t.id?`selected-row-item`:``}`,onClick:()=>L(t.id),children:[(0,_.jsx)(`span`,{children:e===`ar`?t.name:t.nameEn||t.name}),(0,_.jsxs)(`span`,{style:{fontSize:`11px`,opacity:.6,fontFamily:`var(--font-mono)`},children:[`#`,t.id]})]},t.id)):(0,_.jsx)(`div`,{style:{padding:`12px`,fontSize:`12px`,color:`var(--color-text-secondary)`,textAlign:`center`},children:e===`ar`?`لا يوجد نتائج مطابقة`:`No matches found`})})]})]}),P===`class`&&(0,_.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`6px`},children:[(0,_.jsxs)(`label`,{style:{fontSize:`13px`,fontWeight:`800`,color:`var(--color-text-primary)`},children:[`🏫 `,t.selectClass]}),(0,_.jsx)(`select`,{value:R,onChange:e=>z(e.target.value),className:`text-field`,style:{minHeight:`42px`,borderRadius:`12px`},children:v.map(e=>(0,_.jsx)(`option`,{value:e,children:e},e))})]}),P===`teacher`&&(0,_.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`8px`},children:[(0,_.jsxs)(`label`,{style:{fontSize:`13px`,fontWeight:`800`,color:`var(--color-text-primary)`},children:[`🔍 `,t.selectTeacher]}),(0,_.jsxs)(`div`,{className:`live-search-select-wrapper`,children:[(0,_.jsxs)(`div`,{style:{position:`relative`},children:[(0,_.jsx)(a,{size:16,style:{position:`absolute`,top:`50%`,right:`12px`,transform:`translateY(-50%)`,color:`var(--color-text-secondary)`}}),(0,_.jsx)(`input`,{type:`text`,placeholder:e===`ar`?`ابحث باسم المعلم أو الرقم الوظيفي...`:`Search teacher by name...`,value:J,onChange:e=>Y(e.target.value),className:`text-field`,style:{paddingRight:`36px`,minHeight:`38px`,borderRadius:`10px`}})]}),(0,_.jsx)(`div`,{className:`live-search-select-results`,children:$.length>0?$.map(t=>(0,_.jsxs)(`div`,{className:`live-search-select-row ${B===t.id?`selected-row-item`:``}`,onClick:()=>V(t.id),children:[(0,_.jsx)(`span`,{children:e===`ar`?t.name:t.nameEn||t.name}),(0,_.jsxs)(`span`,{style:{fontSize:`11px`,opacity:.6},children:[`#`,t.id]})]},t.id)):(0,_.jsx)(`div`,{style:{padding:`12px`,fontSize:`12px`,color:`var(--color-text-secondary)`,textAlign:`center`},children:e===`ar`?`لا يوجد نتائج مطابقة`:`No matches found`})})]})]}),(0,_.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`6px`},children:[(0,_.jsxs)(`label`,{style:{fontSize:`13px`,fontWeight:`800`,color:`var(--color-text-primary)`},children:[`📝 `,t.notificationTitleLabel]}),(0,_.jsx)(`input`,{type:`text`,value:H,onChange:e=>U(e.target.value),placeholder:e===`ar`?`أدخل عنواناً جذاباً ومختصراً...`:`Enter a short and appealing title...`,className:`text-field`,style:{borderRadius:`12px`,minHeight:`42px`},required:!0})]}),(0,_.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`6px`},children:[(0,_.jsxs)(`label`,{style:{fontSize:`13px`,fontWeight:`800`,color:`var(--color-text-primary)`},children:[`💬 `,t.notificationContentLabel]}),(0,_.jsx)(`textarea`,{value:W,onChange:e=>G(e.target.value),placeholder:e===`ar`?`اكتب تفاصيل ومحتوى الإشعار هنا بوضوح...`:`Type fully details and instructions here...`,className:`text-field`,style:{minHeight:`110px`,resize:`vertical`,borderRadius:`14px`,padding:`12px 16px`},required:!0})]})]}),(0,_.jsxs)(`footer`,{className:`modal-footer`,style:{display:`flex`,justifyContent:`flex-end`,gap:`12px`,padding:`var(--space-xl) var(--space-xxl)`,borderTop:`1px solid var(--color-border)`,background:`var(--color-surface)`},children:[(0,_.jsx)(`button`,{type:`button`,className:`btn-elevated`,onClick:()=>E(!1),style:{borderRadius:`12px`,padding:`10px 20px`,border:`none`,cursor:`pointer`},children:t.cancel}),(0,_.jsxs)(`button`,{type:`submit`,className:`btn-gradient-compose`,style:{padding:`10px 24px`,boxShadow:`none`},children:[(0,_.jsx)(h,{size:15}),(0,_.jsx)(`span`,{children:e===`ar`?`إرسال ونشر الآن`:`Broadcast Now`})]})]})]})]})})]})}function y(){return(0,_.jsx)(v,{})}export{y as default};