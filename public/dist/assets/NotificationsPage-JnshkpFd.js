import{i as e,n as t,t as n}from"./jsx-runtime-bzQ4Vb5N.js";import{n as r,t as i}from"./PaginationBar-DUIbaRMa.js";import{t as a}from"./circle-alert-BU0F7_ha.js";import{t as o}from"./clock-Ujfsrhaf.js";import{t as s}from"./copy-KR1Koa3W.js";import{t as ee}from"./funnel-ufTx0-tO.js";import{t as c}from"./layers-D3eepCs_.js";import{t as te}from"./search-D8fWmKlp.js";import{t as ne}from"./send-BgSwc98d.js";import{t as l}from"./sparkles-BnF5Dmyt.js";import{t as re}from"./trash-2-BDr7pLVk.js";import{t as u}from"./user-CnmKc_XE.js";import{A as d,E as ie,I as f,L as ae,M as oe,P as se,S as ce,V as le,W as ue,Z as de,_ as fe,b as p,l as m,s as pe,t as me}from"./index-RCN43kMN.js";import{t as he}from"./useReverbChannel-CHh5phzg.js";var ge=f(`arrow-left-right`,[[`path`,{d:`M8 3 4 7l4 4`,key:`9rb6wj`}],[`path`,{d:`M4 7h16`,key:`6tx8e3`}],[`path`,{d:`m16 21 4-4-4-4`,key:`siv7j2`}],[`path`,{d:`M20 17H4`,key:`h6l3hr`}]]),_e=f(`pencil`,[[`path`,{d:`M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z`,key:`1a8usu`}],[`path`,{d:`m15 5 4 4`,key:`1mk7zo`}]]),ve=f(`volume-2`,[[`path`,{d:`M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z`,key:`uqj9uw`}],[`path`,{d:`M16 9a5 5 0 0 1 0 6`,key:`1q6k2b`}],[`path`,{d:`M19.364 18.364a9 9 0 0 0 0-12.728`,key:`ijwkga`}]]),h=e(t(),1),g=n();function _(){let{lang:e,t,triggerConfirm:n,canAction:f,setToastMessage:_}=de(),{classes:v,availableGrades:y,fetchClasses:ye}=ue(),{notifications:b,notificationsPagination:x,handleSendNotification:be,handleMarkNotificationAsRead:xe,handleDeleteNotification:Se,handleUpdateNotification:Ce,handleDeleteAllNotifications:we,fetchNotifications:Te,loading:Ee}=le(),[S,C]=(0,h.useState)(null),[w,De]=(0,h.useState)(!1),{students:T,fetchStudents:Oe}=me(),{teachers:E,fetchTeachers:ke}=ae(),{page:Ae,perPage:je,search:D,setPage:O,setPerPage:Me,setSearch:Ne}=r({moduleKey:`notifications`}),Pe=()=>{let e=new Date;return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,`0`)}-${String(e.getDate()).padStart(2,`0`)}`},[k,A]=(0,h.useState)(`all`),[Fe,j]=(0,h.useState)(!1),[M,Ie]=(0,h.useState)(()=>Pe()),[Le,Re]=(0,h.useState)(null),N=(0,h.useMemo)(()=>{let e=new URLSearchParams;return e.set(`page`,Ae),e.set(`per_page`,je),D&&e.set(`search`,D),M&&e.set(`date`,M),k===`parents`?e.set(`target_type`,`all_parents`):k===`teachers`?e.set(`target_type`,`all_teachers`):k===`classes`?e.set(`target_type`,`by_class`):k===`private`&&e.set(`target_type`,`by_student`),`?`+e.toString()},[Ae,je,D,M,k]);(0,h.useEffect)(()=>{Te(N)},[Te,N]),he(`public-notifications`,`notifications_changed`,()=>Te(N)),(0,h.useEffect)(()=>{ye(),Oe(`?per_page=1000`),ke(`?per_page=1000`)},[ye,Oe,ke]);let[P,F]=(0,h.useState)(`parents`),I=(0,h.useMemo)(()=>v&&v.length>0?v.map(e=>e.name||`${e.grade} - ${e.section}`):y||[],[v,y]),[L,R]=(0,h.useState)(``),[z,ze]=(0,h.useState)(``),[B,V]=(0,h.useState)(``),[H,Be]=(0,h.useState)(``),[Ve,He]=(0,h.useState)(``),[U,W]=(0,h.useState)(``),[G,K]=(0,h.useState)(``),[Ue,q]=(0,h.useState)(``),[We,Ge]=(0,h.useState)(``),Ke=I.includes(H)?H:I.length>0?I[0]:``,qe=Array.isArray(T)&&T.some(e=>String(e.id)===String(L)),Je=qe?L:``,J=Array.isArray(E)&&E.some(e=>String(e.id)===String(Ve))?Ve:``,Ye=(0,h.useMemo)(()=>{let e=new Set;return(v||[]).forEach(t=>t.grade&&e.add(t.grade)),(T||[]).forEach(t=>t.grade&&e.add(t.grade)),Array.from(e)},[v,T]),Xe=(0,h.useMemo)(()=>{if(!z)return[];let e=new Set;return(v||[]).forEach(t=>{t.grade===z&&t.section&&e.add(t.section)}),(T||[]).forEach(t=>{t.grade===z&&t.section&&e.add(t.section)}),Array.from(e)},[v,T,z]),Y=(0,h.useMemo)(()=>qe?T.find(e=>String(e.id)===String(L)):null,[qe,T,L]),Ze=(e=`parents`)=>{F(e),W(``),K(``),R(``),He(``),ze(``),V(``),q(``),Ge(``),j(!0)},Qe=(t,r)=>{t.stopPropagation(),n({title:e===`ar`?`حذف الإشعار`:`Delete Notification`,message:e===`ar`?`هل أنت متأكد من حذف هذا الإشعار نهائياً؟`:`Are you sure you want to permanently delete this notification?`,onConfirm:()=>{Se(r)}})},$e=()=>{n({title:e===`ar`?`حذف جميع الإشعارات`:`Delete All Notifications`,message:e===`ar`?`هل أنت متأكد من حذف جميع الإشعارات نهائياً؟ هذا الإجراء لا يمكن التراجع عنه!`:`Are you sure you want to delete all notifications permanently? This action cannot be undone!`,onConfirm:()=>{we()}})},et=(e,t)=>{e.stopPropagation(),C({id:t.id,title:t.title,content:t.content})},tt=async e=>{if(e.preventDefault(),!S||w)return;let t=S.title.trim(),n=S.content.trim();if(!t||!n)return;De(!0);let r=await Ce(S.id,{title:t,content:n});De(!1),r&&C(null)},nt=(t,n)=>{t.stopPropagation();let r=`${n.title}\n${n.content}`;navigator.clipboard.writeText(r),Re(n.id),_&&_(e===`ar`?`تم نسخ نص الإشعار بنجاح`:`Notification content copied`),setTimeout(()=>Re(null),2e3)},X=t=>{t===`absence`?(W(e===`ar`?`تنبيه غياب وتأخر دراسي`:`Absence & Attendance Alert`),K(e===`ar`?`نود إحاطتكم بحضور ومواظبة الطالب/الطالبة، نرجو المتابعة الحثيثة والتواصل مع إدارة المدرسة لضمان التفوق.`:`We would like to inform you regarding student attendance. Please follow up with school administration.`)):t===`exam`?(W(e===`ar`?`إعلان جدول الاختبارات النهائية`:`Final Exam Schedule Announcement`),K(e===`ar`?`تم اعتماد ونشر جدول الاختبارات التقييمية. نرجو الحرص على مراجعة المقررات والالتزام بالحضور في المواعيد المحددة.`:`The evaluation exam schedule has been published. Please ensure thorough revision and timely attendance.`)):t===`parents_meeting`?(W(e===`ar`?`دعوة لاجتماع أولياء الأمور الدوري`:`Parents-Teachers Meeting Invitation`),K(e===`ar`?`يسر إدارة المدرسة دعوتكم لحضور الاجتماع الدوري لمناقشة المستوى الأكاديمي والتربوي لأبنائنا الطلاب يوم الخميس القادم.`:`You are cordially invited to attend the periodic parents meeting next Thursday.`)):t===`general_announcement`&&(W(e===`ar`?`تعميم إداري هام للجميع`:`Important School Announcement`),K(e===`ar`?`تود إدارة رياض ومدارس أنوار العلى الدولية تذكير جميع الطلاب وأولياء الأمور بالتعليمات والأنشطة القادمة.`:`Anwar Al-Ola Int. Model Schools would like to remind all students & parents of upcoming activities.`))},rt=t=>{if(t.preventDefault(),!U.trim()||!G.trim())return;if(P===`student`&&(!z||!B||!Y)){_&&(_(e===`ar`?`يرجى تحديد الصف ثم الشعبة ثم اسم الطالب قبل الإرسال`:`Please select grade, section and student before sending`),setTimeout(()=>_(``),4e3));return}if(P===`teacher`&&!J){_&&(_(e===`ar`?`يرجى اختيار المعلم قبل الإرسال`:`Please select a teacher before sending`),setTimeout(()=>_(``),4e3));return}let n=new Date().toISOString().replace(`T`,` `).substring(0,16),r={};if(P===`student`){let e=Y;r={studentId:Number(e.id),studentName:e.name,studentNameEn:e.nameEn,grade:`${e.grade||z} - ${e.section||B}`}}else if(P===`class`){let e=(v||[]).find(e=>(e.name||`${e.grade} - ${e.section}`)===Ke);r={grade:Ke,classId:e?Number(e.numericId||String(e.id).replace(/\D/g,``)):null}}else if(P===`teacher`){let e=E.find(e=>String(e.id)===String(J));r={teacherId:Number(J),teacherName:e?e.name:null,teacherNameEn:e?e.nameEn:null}}let i={id:Date.now(),title:U,content:G,date:n,type:P,...r},a=[];if(P===`student`){let t=Y;if(t){let r=e===`ar`?`تنبيه خاص بخصوص ابنكم ${t.name}: ${U} - ${G}. رياض و مدارس انوار العلى.`:`Private alert for ${t.nameEn}: ${U} - ${G}. Riyadh & Anwar Al-Ola.`;a.push({id:Date.now(),studentId:t.id,recipient:t.phone,text:r,time:n.split(` `)[1],type:`present`})}}else P===`class`?T.filter(e=>e.grade===H).forEach((t,r)=>{let i=e===`ar`?`تعميم لصف ${H}: ${U} - ${G}.`:`Class announcement for ${H}: ${U} - ${G}.`;a.push({id:Date.now()+Math.random()+r,studentId:t.id,recipient:t.phone,text:i,time:n.split(` `)[1],type:`present`})}):P===`parents`&&T.forEach((t,r)=>{let i=e===`ar`?`إشعار عام من المدرسة لأولياء الأمور: ${U} - ${G}.`:`Broadcast Announcement to Parents: ${U} - ${G}.`;a.push({id:Date.now()+Math.random()+r,studentId:t.id,recipient:t.phone,text:i,time:n.split(` `)[1],type:`present`})});be(i,a),j(!1),W(``),K(``),R(``),He(``),ze(``),V(``),q(``),Ge(``)},it=(0,h.useCallback)(t=>t.type===`attendance`?{name:e===`ar`?`مشرف التحضير`:`Prep Supervisor`,key:`supervisor`}:{name:e===`ar`?`إدارة المدرسة`:`School Administration`,key:`admin`},[e]),Z=(0,h.useCallback)(t=>{if(!t)return``;try{let n=new Date(t.replace(` `,`T`));if(isNaN(n.getTime())&&(n=new Date(t)),isNaN(n.getTime()))return t;let r=n.getFullYear(),i=String(n.getMonth()+1).padStart(2,`0`),a=String(n.getDate()).padStart(2,`0`),o=n.getHours(),s=String(n.getMinutes()).padStart(2,`0`),ee=o>=12?e===`ar`?`م`:`PM`:e===`ar`?`ص`:`AM`;return o%=12,o||=12,`${r}-${i}-${a} ${String(o).padStart(2,`0`)}:${s} ${ee}`}catch{return t}},[e]),at=(0,h.useCallback)(t=>{if(!t)return``;try{let n=new Date(t.replace(` `,`T`)),r=new Date-n,i=Math.floor(r/(1e3*60)),a=Math.floor(r/(1e3*60*60)),o=Math.floor(r/(1e3*60*60*24));return i<2?e===`ar`?`الآن`:`Just now`:i<60?e===`ar`?`منذ ${i} دقيقة`:`${i}m ago`:a<24?e===`ar`?`منذ ${a} ساعة`:`${a}h ago`:o===1?e===`ar`?`أمس`:`Yesterday`:o<7?e===`ar`?`منذ ${o} أيام`:`${o}d ago`:Z(t)}catch{return t}},[e,Z]),ot=(0,h.useCallback)(t=>{if(!t)return e===`ar`?`الصف الدراسي`:`Class`;let n=t.grade||t.class_name||t.className||t.grade_name||t.gradeName;if(n&&n!==`null`&&n!==`NULL`&&n!==`undefined`)return n;if(t.studentId){let e=T.find(e=>e.id===Number(t.studentId));if(e){let t=e.grade||e.class_name||e.grade_name;if(t&&t!==`null`&&t!==`NULL`&&t!==`undefined`)return t}}let r=`${t.title||``} ${t.content||``}`.match(/(?:للفصل|فصل|الصف)\s+([^\s:,.-]+(?:\s*[-–]\s*[^\s:,.-]+)?)/);return r&&r[1]&&!r[1].includes(`العام`)&&!r[1].includes(`ابنكم`)?r[1].trim():e===`ar`?`الصف الدراسي`:`Class`},[e,T]),st=x.total||b.length,ct=(0,h.useMemo)(()=>b.filter(e=>e.type===`general`||e.type===`all_users`).length,[b]),lt=(0,h.useMemo)(()=>b.filter(e=>e.type===`parents`||e.type===`broadcast_parents`).length,[b]),ut=(0,h.useMemo)(()=>b.filter(e=>e.type===`teachers`||e.type===`broadcast_teachers`).length,[b]),dt=(0,h.useMemo)(()=>b.filter(e=>e.type===`class`||e.type===`student`||e.type===`private`||e.type===`teacher`).length,[b]),ft=(0,h.useCallback)(t=>{let n=t.type,r=ot(t);if(n===`general`||n===`all_users`)return e===`ar`?`جميع المستخدمين (معلمين وأولياء أمور)`:`All Users (Teachers & Parents)`;if(n===`parents`||n===`broadcast_parents`)return e===`ar`?`جميع أولياء الأمور`:`All Parents`;if(n===`teachers`||n===`broadcast_teachers`)return e===`ar`?`جميع المعلمين`:`All Teachers`;if(n===`class`)return e===`ar`?`الصف: ${r}`:`Class: ${r}`;if(n===`student`||n===`private`){let n=T.find(e=>String(e.id)===String(t.studentId)),r=t.studentName||(n?n.name||n.name_ar||n.name_en:null);return r?e===`ar`?`الطالب: ${r}`:`Student: ${r}`:t.studentId?e===`ar`?`الطالب (رقم #${t.studentId})`:`Student (#${t.studentId})`:e===`ar`?`طالب مخصص`:`Student`}if(n===`teacher`){let n=E.find(e=>String(e.id)===String(t.teacherId)),r=t.teacherName||(n?n.name||n.name_ar||n.name_en:null);return r?e===`ar`?`المعلم: ${r}`:`Teacher: ${r}`:t.teacherId?e===`ar`?`المعلم (رقم #${t.teacherId})`:`Teacher (#${t.teacherId})`:e===`ar`?`معلم مخصص`:`Teacher`}return e===`ar`?`عام`:`General`},[e,ot,T,E]),pt=(0,h.useMemo)(()=>b.filter(e=>M&&e.date&&!e.date.substring(0,10).startsWith(M)?!1:k===`all_users`?e.type===`general`||e.type===`all_users`:k===`parents`?e.type===`parents`||e.type===`broadcast_parents`||e.type===`general`||e.type===`broadcast`:k===`teachers`?e.type===`teachers`||e.type===`broadcast_teachers`||e.type===`general`||e.type===`broadcast`:k===`classes`?e.type===`class`:k===`private`?e.type===`student`||e.type===`private`||e.type===`teacher`:!0),[b,M,k]);(0,h.useMemo)(()=>b.filter(e=>!e.isRead).length,[b]);let mt=(t,n,r,i,a)=>{let o=t.type,s=ot(t);if(o===`general`||o===`parents`||o===`broadcast_parents`)return{label:e===`ar`?`تعميم عام لأولياء الأمور`:`All Parents Broadcast`,bgGlow:`rgba(30, 80, 142, 0.08)`,borderColor:`var(--color-primary-ui)`,textColor:`var(--color-primary-ui)`,icon:(0,g.jsx)(m,{size:16})};if(o===`class`||o===`assignment`||o===`homework`)return{label:e===`ar`?`الصف: ${s}`:`Class: ${s}`,bgGlow:`rgba(217, 119, 6, 0.08)`,borderColor:`#d97706`,textColor:`#b45309`,icon:(0,g.jsx)(c,{size:16})};if(o===`student`||o===`private`){let t=e===`ar`?n||`طالب مخصص`:r||n||`Private Student`;return{label:s!==`الصف الدراسي`&&s!==`Class`?e===`ar`?`طالب (${s}): ${t}`:`Student (${s}): ${t}`:e===`ar`?`طالب: ${t}`:`Student: ${t}`,bgGlow:`rgba(225, 29, 72, 0.08)`,borderColor:`#e11d48`,textColor:`#be123c`,icon:(0,g.jsx)(p,{size:16})}}else if(o===`teachers`||o===`broadcast_teachers`)return{label:e===`ar`?`تعميم لجميع المعلمين`:`All Teachers Broadcast`,bgGlow:`rgba(16, 185, 129, 0.08)`,borderColor:`#10b981`,textColor:`#047857`,icon:(0,g.jsx)(m,{size:16})};else if(o===`teacher`){let t=e===`ar`?i||`معلم مخصص`:a||i||`Teacher`;return{label:e===`ar`?`المعلم: ${t}`:`Teacher: ${t}`,bgGlow:`rgba(15, 118, 110, 0.08)`,borderColor:`#0f766e`,textColor:`#0f766e`,icon:(0,g.jsx)(u,{size:16})}}return{label:(t.title&&t.title.includes(`واجب`)||t.content&&t.content.includes(`واجب`),e===`ar`?`الصف: ${s}`:`Class: ${s}`),bgGlow:`rgba(100, 116, 139, 0.08)`,borderColor:`#64748b`,textColor:`#475569`,icon:(0,g.jsx)(se,{size:16})}},Q=(Ue||``).toLowerCase().trim(),ht=Array.isArray(T)?T.filter(e=>{if(!e||!z||!B||e.grade!==z||e.section!==B)return!1;if(!Q)return!0;let t=!!(e.name?.toString().toLowerCase().includes(Q)||e.nameEn?.toString().toLowerCase().includes(Q)),n=!!e.id?.toString().includes(Q),r=!!(e.student_number||e.studentNumber||e.academic_number||e.national_id||e.code||e.student_code||e.qrCode)?.toString().toLowerCase().includes(Q);return t||n||r}):[],$=(We||``).toLowerCase().trim(),gt=Array.isArray(E)?$?E.filter(e=>{if(!e)return!1;let t=!!(e.name?.toString().toLowerCase().includes($)||e.nameEn?.toString().toLowerCase().includes($)),n=!!e.id?.toString().includes($),r=!!(e.jobId||e.job_number||e.job_no)?.toString().toLowerCase().includes($);return t||n||r}):E:[];return(0,g.jsxs)(`div`,{className:`notif-command-center`,children:[(0,g.jsx)(`style`,{children:`
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
      `}),(0,g.jsxs)(`div`,{className:`notif-stats-grid`,children:[(0,g.jsxs)(`div`,{className:`notif-stat-card`,children:[(0,g.jsxs)(`div`,{className:`notif-stat-content`,children:[(0,g.jsx)(`span`,{className:`notif-stat-number`,children:st}),(0,g.jsx)(`span`,{className:`notif-stat-label`,children:e===`ar`?`إجمالي الإشعارات`:`Total Notifications`})]}),(0,g.jsx)(`div`,{className:`notif-stat-icon-wrapper`,style:{background:`linear-gradient(135deg, #1e508e 0%, #103058 100%)`},children:(0,g.jsx)(se,{size:22})})]}),(0,g.jsxs)(`div`,{className:`notif-stat-card`,children:[(0,g.jsxs)(`div`,{className:`notif-stat-content`,children:[(0,g.jsx)(`span`,{className:`notif-stat-number`,children:ct}),(0,g.jsx)(`span`,{className:`notif-stat-label`,children:e===`ar`?`جميع المستخدمين`:`All Users`})]}),(0,g.jsx)(`div`,{className:`notif-stat-icon-wrapper`,style:{background:`linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)`},children:(0,g.jsx)(l,{size:22})})]}),(0,g.jsxs)(`div`,{className:`notif-stat-card`,children:[(0,g.jsxs)(`div`,{className:`notif-stat-content`,children:[(0,g.jsx)(`span`,{className:`notif-stat-number`,children:lt}),(0,g.jsx)(`span`,{className:`notif-stat-label`,children:e===`ar`?`تعاميم أولياء الأمور`:`Parents Broadcasts`})]}),(0,g.jsx)(`div`,{className:`notif-stat-icon-wrapper`,style:{background:`linear-gradient(135deg, #0284c7 0%, #0369a1 100%)`},children:(0,g.jsx)(m,{size:22})})]}),(0,g.jsxs)(`div`,{className:`notif-stat-card`,children:[(0,g.jsxs)(`div`,{className:`notif-stat-content`,children:[(0,g.jsx)(`span`,{className:`notif-stat-number`,children:ut}),(0,g.jsx)(`span`,{className:`notif-stat-label`,children:e===`ar`?`تعاميم المعلمين`:`Teachers Broadcasts`})]}),(0,g.jsx)(`div`,{className:`notif-stat-icon-wrapper`,style:{background:`linear-gradient(135deg, #10b981 0%, #047857 100%)`},children:(0,g.jsx)(u,{size:22})})]}),(0,g.jsxs)(`div`,{className:`notif-stat-card`,children:[(0,g.jsxs)(`div`,{className:`notif-stat-content`,children:[(0,g.jsx)(`span`,{className:`notif-stat-number`,children:dt}),(0,g.jsx)(`span`,{className:`notif-stat-label`,children:e===`ar`?`الفصول والتنبيهات الفردية`:`Classes & Private`})]}),(0,g.jsx)(`div`,{className:`notif-stat-icon-wrapper`,style:{background:`linear-gradient(135deg, #d97706 0%, #b45309 100%)`},children:(0,g.jsx)(c,{size:22})})]})]}),(0,g.jsxs)(`div`,{className:`notif-toolbar-container no-print`,children:[(0,g.jsxs)(`div`,{className:`notif-toolbar-top-row`,children:[(0,g.jsxs)(`div`,{className:`notif-search-box`,children:[(0,g.jsx)(te,{size:16,className:`notif-search-icon`}),(0,g.jsx)(`input`,{type:`text`,placeholder:e===`ar`?`البحث في سجل الإشعارات المرسلة...`:`Search notifications history...`,value:D||``,onChange:e=>Ne(e.target.value)})]}),(0,g.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`10px`,flexWrap:`wrap`},children:[(0,g.jsxs)(`div`,{style:{position:`relative`,display:`flex`,alignItems:`center`,gap:`6px`},children:[(0,g.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`6px`,backgroundColor:`var(--color-surface)`,border:`1.5px solid var(--color-border)`,borderRadius:`12px`,padding:`0 10px`,height:`42px`},children:[(0,g.jsx)(ee,{size:15,style:{color:`var(--color-primary-ui)`}}),(0,g.jsx)(oe,{size:15,style:{color:`var(--color-text-secondary)`}}),(0,g.jsx)(`input`,{type:`date`,style:{border:`none`,background:`transparent`,color:`var(--color-text-primary)`,fontSize:`12.5px`,fontWeight:`600`,outline:`none`,fontFamily:`inherit`},value:M,onChange:e=>{Ie(e.target.value),O(1)},title:e===`ar`?`تصفية حسب التاريخ`:`Filter by Date`})]}),[{key:`today`,label:e===`ar`?`اليوم`:`Today`,title:e===`ar`?`إشعارات اليوم فقط`:`Today's notifications only`,active:M===Pe(),value:Pe()},{key:`all-days`,label:e===`ar`?`كل الأيام`:`All days`,title:e===`ar`?`الإشعارات المرسلة في كل الأيام`:`Notifications from all days`,active:M===``,value:``}].map(e=>(0,g.jsx)(`button`,{type:`button`,"aria-pressed":e.active,onClick:()=>{Ie(e.value),O(1)},title:e.title,style:{height:`42px`,padding:`0 14px`,borderRadius:`12px`,border:e.active?`1.5px solid var(--color-primary-ui)`:`1.5px solid var(--color-border)`,background:e.active?`var(--color-primary-ui)`:`var(--color-surface)`,color:e.active?`#fff`:`var(--color-text-secondary)`,fontSize:`12px`,fontWeight:`800`,cursor:`pointer`,whiteSpace:`nowrap`},children:e.label},e.key))]}),f(`communications`,`delete`)&&b.length>0&&(0,g.jsxs)(`button`,{onClick:$e,style:{height:`42px`,padding:`0 16px`,borderRadius:`12px`,border:`1.5px solid rgba(239, 68, 68, 0.3)`,backgroundColor:`rgba(239, 68, 68, 0.06)`,color:`#ef4444`,fontSize:`12.5px`,fontWeight:`800`,cursor:`pointer`,display:`flex`,alignItems:`center`,gap:`6px`},children:[(0,g.jsx)(re,{size:15}),(0,g.jsx)(`span`,{children:e===`ar`?`حذف الكل`:`Delete All`})]}),f(`communications`,`create`)&&(0,g.jsxs)(`button`,{onClick:()=>Ze(`parents`),style:{height:`42px`,padding:`0 20px`,borderRadius:`12px`,fontSize:`13px`,fontWeight:`800`,border:`none`,background:`var(--gradient-brand)`,color:`white`,cursor:`pointer`,display:`flex`,alignItems:`center`,gap:`8px`,boxShadow:`0 6px 18px rgba(30, 80, 142, 0.28)`},children:[(0,g.jsx)(fe,{size:18,strokeWidth:2.5}),(0,g.jsx)(`span`,{children:e===`ar`?`إنشاء إشعار فوري`:`Compose Alert`})]})]})]}),(0,g.jsxs)(`div`,{className:`notif-filter-chips`,children:[(0,g.jsxs)(`button`,{onClick:()=>{A(`all`),O(1)},className:`notif-chip-btn ${k===`all`?`active`:``}`,children:[(0,g.jsx)(`span`,{children:e===`ar`?`الكل`:`All`}),(0,g.jsx)(`span`,{className:`notif-chip-counter`,children:b.length})]}),(0,g.jsxs)(`button`,{onClick:()=>{A(`all_users`),O(1)},className:`notif-chip-btn ${k===`all_users`?`active`:``}`,children:[(0,g.jsx)(l,{size:14}),(0,g.jsx)(`span`,{children:e===`ar`?`جميع المستخدمين`:`All Users`})]}),(0,g.jsxs)(`button`,{onClick:()=>{A(`parents`),O(1)},className:`notif-chip-btn ${k===`parents`?`active`:``}`,children:[(0,g.jsx)(m,{size:14}),(0,g.jsx)(`span`,{children:e===`ar`?`أولياء الأمور`:`Parents`})]}),(0,g.jsxs)(`button`,{onClick:()=>{A(`classes`),O(1)},className:`notif-chip-btn ${k===`classes`?`active`:``}`,children:[(0,g.jsx)(c,{size:14}),(0,g.jsx)(`span`,{children:e===`ar`?`الصفوف`:`Classes`})]}),(0,g.jsxs)(`button`,{onClick:()=>{A(`teachers`),O(1)},className:`notif-chip-btn ${k===`teachers`?`active`:``}`,children:[(0,g.jsx)(u,{size:14}),(0,g.jsx)(`span`,{children:e===`ar`?`المعلمون`:`Teachers`})]}),(0,g.jsxs)(`button`,{onClick:()=>{A(`private`),O(1)},className:`notif-chip-btn ${k===`private`?`active`:``}`,children:[(0,g.jsx)(p,{size:14}),(0,g.jsx)(`span`,{children:e===`ar`?`إشعار خاص`:`Private Alerts`})]})]})]}),(0,g.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,justifyContent:`space-between`,margin:`4px 0 -8px 0`},children:[(0,g.jsxs)(`h4`,{style:{fontSize:`15px`,fontWeight:`800`,color:`var(--color-text-primary)`,margin:0,display:`flex`,alignItems:`center`,gap:`8px`},children:[(0,g.jsx)(ve,{size:18,style:{color:`var(--color-primary-ui)`}}),(0,g.jsx)(`span`,{children:e===`ar`?`سجل الإرسال التاريخي`:`Historical Dispatch Log`})]}),(0,g.jsxs)(`span`,{style:{fontSize:`12px`,fontWeight:`800`,background:`var(--color-surface-alt)`,border:`1px solid var(--color-border)`,padding:`2px 10px`,borderRadius:`12px`,color:`var(--color-text-secondary)`},children:[pt.length,` `,e===`ar`?`إشعار`:`alerts`]})]}),Ee?(0,g.jsx)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`12px`},children:[1,2,3].map(e=>(0,g.jsx)(`div`,{style:{height:`110px`,borderRadius:`18px`,backgroundColor:`var(--color-surface-alt)`,border:`1.5px solid var(--color-border)`,opacity:.6,animation:`pulse 1.5s infinite ease-in-out`}},e))}):pt.length>0?(0,g.jsxs)(`div`,{className:`notif-feed-list`,children:[pt.map(e=>_t(e)),(0,g.jsx)(`div`,{className:`no-print`,style:{marginTop:`var(--space-md)`},children:(0,g.jsx)(i,{page:Ae,lastPage:x.lastPage,total:x.total,from:x.from,to:x.to,perPage:je,onPageChange:O,onPerPageChange:Me,loading:Ee,lang:e})})]}):(0,g.jsxs)(`div`,{style:{padding:`60px 24px`,textAlign:`center`,backgroundColor:`var(--color-surface-alt)`,borderRadius:`24px`,border:`1.5px dashed var(--color-border)`,display:`flex`,flexDirection:`column`,alignItems:`center`,justifyContent:`center`,gap:`12px`},children:[(0,g.jsx)(`div`,{style:{width:`64px`,height:`64px`,borderRadius:`20px`,backgroundColor:`rgba(30, 80, 142, 0.08)`,color:`var(--color-primary-ui)`,display:`flex`,alignItems:`center`,justifyContent:`center`},children:(0,g.jsx)(se,{size:32})}),(0,g.jsx)(`h3`,{style:{fontSize:`16px`,fontWeight:`800`,color:`var(--color-text-primary)`,margin:0},children:D?e===`ar`?`لا توجد نتائج تطابق كلمة البحث`:`No notifications match search`:e===`ar`?`لا توجد إشعارات مسجلة في هذا التبويب`:`No notifications found in this tab`}),(0,g.jsx)(`p`,{style:{fontSize:`13px`,color:`var(--color-text-secondary)`,margin:0,maxWidth:`400px`,lineHeight:1.5},children:e===`ar`?`يمكنك التبديل بين التبويبات أو النقر على "إنشاء إشعار فوري" لإرسال تنبيه جديد.`:`Switch tabs or click "Compose Alert" to broadcast a new notification.`}),f(`communications`,`create`)&&(0,g.jsxs)(`button`,{onClick:()=>{let e=`parents`;k===`all_users`?e=`all_users`:k===`parents`?e=`parents`:k===`classes`?e=`class`:k===`teachers`?e=`teachers`:k===`private`&&(e=`student`),Ze(e),e===`class`&&y.length>0&&!H&&Be(y[0])},style:{marginTop:`8px`,height:`38px`,padding:`0 18px`,borderRadius:`10px`,fontSize:`12.5px`,fontWeight:`800`,border:`none`,backgroundColor:`var(--color-primary-ui)`,color:`white`,cursor:`pointer`,display:`flex`,alignItems:`center`,gap:`6px`},children:[(0,g.jsx)(fe,{size:16}),(0,g.jsx)(`span`,{children:e===`ar`?`إنشاء إشعار جديد الآن`:`Compose Alert Now`})]})]}),Fe&&(0,g.jsx)(`div`,{className:`modal-overlay no-print`,style:{backdropFilter:`blur(8px)`},children:(0,g.jsxs)(`div`,{className:`modal-container`,style:{maxWidth:`640px`,borderRadius:`24px`,overflow:`hidden`},children:[(0,g.jsxs)(`header`,{className:`modal-header`,style:{padding:`20px 24px`,borderBottom:`1px solid var(--color-border)`},children:[(0,g.jsxs)(`h3`,{className:`modal-title`,style:{fontSize:`16px`,fontWeight:`800`,display:`flex`,alignItems:`center`,gap:`8px`},children:[(0,g.jsx)(ne,{size:18,style:{color:`var(--color-primary-ui)`}}),(0,g.jsx)(`span`,{children:e===`ar`?`إرسال ونشر إشعار فوري جديد`:`Compose Instant Announcement`})]}),(0,g.jsx)(`button`,{className:`modal-close-btn`,type:`button`,onClick:()=>j(!1),style:{background:`#ef4444`,color:`white`,width:`32px`,height:`32px`,borderRadius:`50%`,display:`flex`,alignItems:`center`,justifyContent:`center`,border:`none`,cursor:`pointer`,transition:`background 0.2s`},onMouseEnter:e=>e.currentTarget.style.background=`#dc2626`,onMouseLeave:e=>e.currentTarget.style.background=`#ef4444`,children:(0,g.jsx)(pe,{size:16})})]}),(0,g.jsxs)(`form`,{onSubmit:rt,children:[(0,g.jsxs)(`div`,{className:`modal-body`,style:{padding:`20px 24px`,display:`flex`,flexDirection:`column`,gap:`16px`},children:[(0,g.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`6px`},children:[(0,g.jsxs)(`label`,{style:{fontSize:`12px`,fontWeight:`800`,color:`var(--color-primary-ui)`,display:`flex`,alignItems:`center`,gap:`6px`},children:[(0,g.jsx)(l,{size:14}),(0,g.jsx)(`span`,{children:e===`ar`?`قوالب جاهزة بنقرة واحدة:`:`Quick Presets:`})]}),(0,g.jsxs)(`div`,{className:`preset-templates-container`,children:[(0,g.jsxs)(`button`,{type:`button`,className:`preset-template-chip`,onClick:()=>X(`general_announcement`),children:[(0,g.jsx)(ce,{size:13,style:{color:`var(--color-primary-ui)`}}),(0,g.jsx)(`span`,{children:e===`ar`?`تعميم إداري`:`General Notice`})]}),(0,g.jsxs)(`button`,{type:`button`,className:`preset-template-chip`,onClick:()=>X(`exam`),children:[(0,g.jsx)(oe,{size:13,style:{color:`#0284c7`}}),(0,g.jsx)(`span`,{children:e===`ar`?`جدول الاختبارات`:`Exam Schedule`})]}),(0,g.jsxs)(`button`,{type:`button`,className:`preset-template-chip`,onClick:()=>X(`parents_meeting`),children:[(0,g.jsx)(m,{size:13,style:{color:`#8b5cf6`}}),(0,g.jsx)(`span`,{children:e===`ar`?`اجتماع أولياء الأمور`:`Parents Meeting`})]}),(0,g.jsxs)(`button`,{type:`button`,className:`preset-template-chip`,onClick:()=>X(`absence`),children:[(0,g.jsx)(a,{size:13,style:{color:`#d97706`}}),(0,g.jsx)(`span`,{children:e===`ar`?`تنبيه مواظبة`:`Attendance Alert`})]})]})]}),(0,g.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`8px`},children:[(0,g.jsxs)(`label`,{style:{fontSize:`12px`,fontWeight:`800`,color:`var(--color-text-primary)`},children:[`🎯`,` `,e===`ar`?`اختر الفئة المستهدفة:`:`Select Target Audience:`]}),(0,g.jsxs)(`div`,{style:{display:`grid`,gridTemplateColumns:`repeat(auto-fill, minmax(150px, 1fr))`,gap:`10px`},children:[(0,g.jsxs)(`div`,{onClick:()=>F(`all_users`),style:{padding:`10px 8px`,borderRadius:`12px`,border:P===`all_users`?`2px solid var(--color-primary-ui)`:`1px solid var(--color-border)`,background:P===`all_users`?`rgba(30, 80, 142, 0.08)`:`var(--color-surface)`,color:P===`all_users`?`var(--color-primary-ui)`:`var(--color-text-primary)`,cursor:`pointer`,textAlign:`center`,fontSize:`11.5px`,fontWeight:`700`},children:[(0,g.jsx)(l,{size:18,style:{margin:`0 auto 4px auto`,display:`block`}}),(0,g.jsx)(`span`,{children:e===`ar`?`جميع المستخدمين`:`All Users`})]}),(0,g.jsxs)(`div`,{onClick:()=>F(`parents`),style:{padding:`10px 8px`,borderRadius:`12px`,border:P===`parents`?`2px solid var(--color-primary-ui)`:`1px solid var(--color-border)`,background:P===`parents`?`rgba(30, 80, 142, 0.08)`:`var(--color-surface)`,color:P===`parents`?`var(--color-primary-ui)`:`var(--color-text-primary)`,cursor:`pointer`,textAlign:`center`,fontSize:`11.5px`,fontWeight:`700`},children:[(0,g.jsx)(m,{size:18,style:{margin:`0 auto 4px auto`,display:`block`}}),(0,g.jsx)(`span`,{children:t.targetAllParents})]}),(0,g.jsxs)(`div`,{onClick:()=>{F(`class`),y.length>0&&!H&&Be(y[0])},style:{padding:`10px 8px`,borderRadius:`12px`,border:P===`class`?`2px solid var(--color-primary-ui)`:`1px solid var(--color-border)`,background:P===`class`?`rgba(30, 80, 142, 0.08)`:`var(--color-surface)`,color:P===`class`?`var(--color-primary-ui)`:`var(--color-text-primary)`,cursor:`pointer`,textAlign:`center`,fontSize:`11.5px`,fontWeight:`700`},children:[(0,g.jsx)(c,{size:18,style:{margin:`0 auto 4px auto`,display:`block`}}),(0,g.jsx)(`span`,{children:t.targetByClass})]}),(0,g.jsxs)(`div`,{onClick:()=>{F(`student`)},style:{padding:`10px 8px`,borderRadius:`12px`,border:P===`student`?`2px solid var(--color-primary-ui)`:`1px solid var(--color-border)`,background:P===`student`?`rgba(30, 80, 142, 0.08)`:`var(--color-surface)`,color:P===`student`?`var(--color-primary-ui)`:`var(--color-text-primary)`,cursor:`pointer`,textAlign:`center`,fontSize:`11.5px`,fontWeight:`700`},children:[(0,g.jsx)(p,{size:18,style:{margin:`0 auto 4px auto`,display:`block`}}),(0,g.jsx)(`span`,{children:t.targetByStudent})]}),(0,g.jsxs)(`div`,{onClick:()=>F(`teachers`),style:{padding:`10px 8px`,borderRadius:`12px`,border:P===`teachers`?`2px solid var(--color-primary-ui)`:`1px solid var(--color-border)`,background:P===`teachers`?`rgba(30, 80, 142, 0.08)`:`var(--color-surface)`,color:P===`teachers`?`var(--color-primary-ui)`:`var(--color-text-primary)`,cursor:`pointer`,textAlign:`center`,fontSize:`11.5px`,fontWeight:`700`},children:[(0,g.jsx)(m,{size:18,style:{margin:`0 auto 4px auto`,display:`block`}}),(0,g.jsx)(`span`,{children:t.targetAllTeachers})]}),(0,g.jsxs)(`div`,{onClick:()=>{F(`teacher`)},style:{padding:`10px 8px`,borderRadius:`12px`,border:P===`teacher`?`2px solid var(--color-primary-ui)`:`1px solid var(--color-border)`,background:P===`teacher`?`rgba(30, 80, 142, 0.08)`:`var(--color-surface)`,color:P===`teacher`?`var(--color-primary-ui)`:`var(--color-text-primary)`,cursor:`pointer`,textAlign:`center`,fontSize:`11.5px`,fontWeight:`700`},children:[(0,g.jsx)(u,{size:18,style:{margin:`0 auto 4px auto`,display:`block`}}),(0,g.jsx)(`span`,{children:e===`ar`?`حسب المعلم`:`By Teacher`})]})]})]}),P===`student`&&(0,g.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`10px`,padding:`14px`,borderRadius:`14px`,border:`1.5px solid var(--color-border)`,background:`var(--color-surface-alt)`},children:[(0,g.jsxs)(`label`,{style:{fontSize:`12px`,fontWeight:`800`},children:[`🎯`,` `,e===`ar`?`تحديد الطالب بدقة (الصف ← الشعبة ← الاسم):`:`Pick the exact student (Grade → Section → Name):`]}),(0,g.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`4px`},children:[(0,g.jsxs)(`label`,{style:{fontSize:`11.5px`,fontWeight:`700`},children:[`1️⃣ `,e===`ar`?`الصف الدراسي`:`Grade`]}),(0,g.jsxs)(`select`,{value:z,onChange:e=>{ze(e.target.value),V(``),R(``),q(``)},className:`text-field`,required:!0,style:{minHeight:`42px`,fontSize:`13.5px`,padding:`0 12px`,boxSizing:`border-box`,lineHeight:`normal`},children:[(0,g.jsx)(`option`,{value:``,children:e===`ar`?`-- اختر الصف --`:`-- Select grade --`}),Ye.map(e=>(0,g.jsx)(`option`,{value:e,children:e},e))]})]}),(0,g.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`4px`},children:[(0,g.jsxs)(`label`,{style:{fontSize:`11.5px`,fontWeight:`700`},children:[`2️⃣ `,e===`ar`?`الشعبة`:`Section`]}),(0,g.jsxs)(`select`,{value:B,onChange:e=>{V(e.target.value),R(``),q(``)},disabled:!z,className:`text-field`,required:!0,style:{minHeight:`42px`,fontSize:`13.5px`,padding:`0 12px`,boxSizing:`border-box`,lineHeight:`normal`},children:[(0,g.jsx)(`option`,{value:``,children:e===`ar`?`-- اختر الشعبة --`:`-- Select section --`}),Xe.map(e=>(0,g.jsx)(`option`,{value:e,children:e},e))]})]}),(0,g.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`4px`},children:[(0,g.jsxs)(`label`,{style:{fontSize:`11.5px`,fontWeight:`700`},children:[`3️⃣ 🔍 `,t.selectStudent]}),(0,g.jsx)(`input`,{type:`text`,placeholder:e===`ar`?`ابحث باسم الطالب أو الرقم الأكاديمي داخل الشعبة المحددة...`:`Search by student name or ID inside the selected section...`,value:Ue,onChange:e=>q(e.target.value),disabled:!z||!B,className:`text-field`,style:{height:`36px`,fontSize:`12px`,padding:`0 10px`}}),(0,g.jsxs)(`select`,{value:Je,onChange:e=>R(e.target.value),disabled:!z||!B,className:`text-field`,required:!0,style:{minHeight:`45px`,fontSize:`14px`,padding:`0 12px`,boxSizing:`border-box`,lineHeight:`normal`},children:[(0,g.jsx)(`option`,{value:``,children:!z||!B?e===`ar`?`-- حدد الصف والشعبة أولاً --`:`-- Select grade & section first --`:ht.length===0?e===`ar`?`-- لا يوجد طلاب مطابقون --`:`-- No matching students --`:e===`ar`?`-- اختر الطالب --`:`-- Select student --`}),ht.map(t=>(0,g.jsxs)(`option`,{value:t.id,children:[e===`ar`?t.name:t.nameEn||t.name,` — `,t.grade,` -`,` `,t.section]},t.id))]})]}),Y?(0,g.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`8px`,padding:`10px 12px`,borderRadius:`10px`,background:`rgba(16, 185, 129, 0.08)`,border:`1.5px solid rgba(16, 185, 129, 0.35)`,fontSize:`12.5px`,fontWeight:`700`,color:`#047857`,flexWrap:`wrap`},children:[(0,g.jsx)(ie,{size:16}),(0,g.jsx)(`span`,{children:e===`ar`?`سيصل الإشعار إلى ولي أمر الطالب:`:`The notification will be sent to the parent of:`}),(0,g.jsx)(`strong`,{children:e===`ar`?Y.name:Y.nameEn||Y.name}),(0,g.jsxs)(`span`,{children:[`(`,Y.grade,` - `,Y.section,`)`]})]}):(0,g.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`8px`,padding:`10px 12px`,borderRadius:`10px`,background:`rgba(217, 119, 6, 0.08)`,border:`1.5px solid rgba(217, 119, 6, 0.35)`,fontSize:`12px`,fontWeight:`700`,color:`#b45309`},children:[(0,g.jsx)(a,{size:16}),(0,g.jsx)(`span`,{children:e===`ar`?`لم يتم تحديد الطالب بعد — اختر الصف ثم الشعبة ثم الاسم قبل كتابة الإشعار.`:`No student selected yet — choose grade, section, then name before composing.`})]})]}),P===`class`&&(0,g.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`6px`},children:[(0,g.jsxs)(`label`,{style:{fontSize:`11.5px`,fontWeight:`700`},children:[`🏫 `,t.selectClass]}),(0,g.jsx)(`select`,{value:Ke,onChange:e=>Be(e.target.value),className:`text-field`,style:{minHeight:`45px`,fontSize:`14px`,padding:`0 12px`,boxSizing:`border-box`,lineHeight:`normal`},children:I.map(e=>(0,g.jsx)(`option`,{value:e,children:e},e))})]}),P===`teacher`&&(0,g.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`6px`},children:[(0,g.jsxs)(`label`,{style:{fontSize:`11.5px`,fontWeight:`700`},children:[`🔍 `,e===`ar`?`إختيار المعلم`:`Select Teacher`]}),(0,g.jsx)(`input`,{type:`text`,placeholder:e===`ar`?`ابحث باسم المعلم أو الرقم الوظيفي...`:`Search by teacher name or Job ID...`,value:We,onChange:e=>Ge(e.target.value),className:`text-field`,style:{height:`36px`,fontSize:`12px`,padding:`0 10px`}}),(0,g.jsxs)(`select`,{value:J,onChange:e=>He(e.target.value),required:!0,className:`text-field`,style:{minHeight:`45px`,fontSize:`14px`,padding:`0 12px`,boxSizing:`border-box`,lineHeight:`normal`},children:[(0,g.jsx)(`option`,{value:``,children:e===`ar`?`-- اختر المعلم --`:`-- Select teacher --`}),gt.map(t=>(0,g.jsx)(`option`,{value:t.id,children:e===`ar`?t.name:t.nameEn||t.name},t.id))]})]}),(0,g.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`4px`},children:[(0,g.jsxs)(`label`,{style:{fontSize:`12px`,fontWeight:`800`,color:`var(--color-text-primary)`},children:[`📝 `,t.notificationTitleLabel]}),(0,g.jsx)(`input`,{type:`text`,value:U,onChange:e=>W(e.target.value),placeholder:e===`ar`?`عنوان الإشعار...`:`Notification title...`,className:`text-field`,style:{height:`38px`,fontSize:`12px`,padding:`0 12px`},required:!0})]}),(0,g.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`4px`},children:[(0,g.jsxs)(`label`,{style:{fontSize:`12px`,fontWeight:`800`,color:`var(--color-text-primary)`},children:[`💬 `,t.notificationContentLabel]}),(0,g.jsx)(`textarea`,{value:G,onChange:e=>K(e.target.value),placeholder:e===`ar`?`محتوى وتفاصيل البلاغ...`:`Notification content...`,className:`text-field`,style:{minHeight:`90px`,fontSize:`12px`,padding:`10px 12px`,resize:`vertical`},required:!0})]})]}),(0,g.jsxs)(`footer`,{className:`modal-footer`,style:{padding:`14px 24px`,borderTop:`1px solid var(--color-border)`,display:`flex`,justifyContent:`flex-end`,gap:`10px`},children:[(0,g.jsx)(`button`,{type:`button`,className:`btn-elevated`,onClick:()=>j(!1),style:{height:`36px`,padding:`0 16px`,borderRadius:`8px`,fontSize:`12px`,cursor:`pointer`},children:t.cancel}),(0,g.jsxs)(`button`,{type:`submit`,style:{height:`36px`,padding:`0 20px`,borderRadius:`8px`,fontSize:`12px`,fontWeight:`800`,background:`var(--gradient-brand)`,color:`white`,border:`none`,cursor:`pointer`,display:`flex`,alignItems:`center`,gap:`6px`},children:[(0,g.jsx)(ne,{size:14}),(0,g.jsx)(`span`,{children:e===`ar`?`إرسال ونشر الآن`:`Broadcast Now`})]})]})]})]})}),S&&(0,g.jsx)(`div`,{className:`modal-overlay no-print`,style:{backdropFilter:`blur(8px)`},children:(0,g.jsxs)(`div`,{className:`modal-container`,style:{maxWidth:`560px`,borderRadius:`24px`,overflow:`hidden`},children:[(0,g.jsx)(`header`,{className:`modal-header`,style:{padding:`20px 24px`,borderBottom:`1px solid var(--color-border)`},children:(0,g.jsxs)(`h3`,{className:`modal-title`,style:{fontSize:`16px`,fontWeight:`800`,display:`flex`,alignItems:`center`,gap:`8px`},children:[(0,g.jsx)(_e,{size:18,style:{color:`var(--color-primary-ui)`}}),(0,g.jsx)(`span`,{children:e===`ar`?`تعديل الإشعار`:`Edit notification`})]})}),(0,g.jsxs)(`form`,{onSubmit:tt,children:[(0,g.jsxs)(`div`,{style:{padding:`18px 24px`,display:`flex`,flexDirection:`column`,gap:`12px`},children:[(0,g.jsx)(`p`,{style:{fontSize:`12px`,color:`var(--color-text-secondary)`,margin:0},children:e===`ar`?`سيصل التعديل لنفس الجهة التي أُرسل إليها الإشعار، مع تنبيه على الجوال.`:`The change goes to the same recipients, with a phone alert.`}),(0,g.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`4px`},children:[(0,g.jsxs)(`label`,{style:{fontSize:`12px`,fontWeight:`800`,color:`var(--color-text-primary)`},children:[`📝 `,t.notificationTitleLabel]}),(0,g.jsx)(`input`,{type:`text`,value:S.title,onChange:e=>C(t=>({...t,title:e.target.value})),className:`text-field`,style:{height:`38px`,fontSize:`12px`,padding:`0 12px`},required:!0})]}),(0,g.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`4px`},children:[(0,g.jsxs)(`label`,{style:{fontSize:`12px`,fontWeight:`800`,color:`var(--color-text-primary)`},children:[`💬 `,t.notificationContentLabel]}),(0,g.jsx)(`textarea`,{value:S.content,onChange:e=>C(t=>({...t,content:e.target.value})),className:`text-field`,style:{minHeight:`110px`,fontSize:`12px`,padding:`10px 12px`,resize:`vertical`},required:!0})]})]}),(0,g.jsxs)(`footer`,{className:`modal-footer`,style:{padding:`14px 24px`,borderTop:`1px solid var(--color-border)`,display:`flex`,justifyContent:`flex-end`,gap:`10px`},children:[(0,g.jsx)(`button`,{type:`button`,className:`btn-elevated`,onClick:()=>C(null),style:{height:`36px`,padding:`0 16px`,borderRadius:`8px`,fontSize:`12px`,cursor:`pointer`},children:t.cancel}),(0,g.jsxs)(`button`,{type:`submit`,disabled:w,style:{height:`36px`,padding:`0 20px`,borderRadius:`8px`,fontSize:`12px`,fontWeight:`800`,background:`var(--gradient-brand)`,color:`white`,border:`none`,cursor:w?`wait`:`pointer`,display:`flex`,alignItems:`center`,gap:`6px`,opacity:w?.7:1},children:[(0,g.jsx)(d,{size:14}),(0,g.jsx)(`span`,{children:w?e===`ar`?`جارٍ الحفظ...`:`Saving...`:e===`ar`?`حفظ التعديل وإرساله`:`Save and resend`})]})]})]})]})})]});function _t(t){let n=t.type===`student`?T.find(e=>e.id===Number(t.studentId)):null,r=mt(t,n?n.name:t.studentName,n?n.nameEn:t.studentNameEn,t.teacherName,t.teacherNameEn),i=at(t.date),a=Z(t.date);return(0,g.jsxs)(`div`,{className:`notif-card-modern`,children:[(0,g.jsxs)(`div`,{className:`notif-card-header`,children:[(0,g.jsxs)(`div`,{className:`notif-card-title-area`,children:[(0,g.jsx)(`div`,{className:`notif-card-avatar`,style:{backgroundColor:r.bgGlow,color:r.textColor,border:`1px solid ${r.borderColor}`},children:r.icon}),(0,g.jsxs)(`div`,{children:[(0,g.jsxs)(`h4`,{className:`notif-card-title`,children:[t.title,(0,g.jsxs)(`span`,{style:{fontSize:`10.5px`,fontWeight:`700`,background:`rgba(16, 185, 129, 0.12)`,color:`#059669`,border:`1px solid rgba(16, 185, 129, 0.25)`,padding:`2px 8px`,borderRadius:`10px`,marginInlineStart:`8px`,display:`inline-flex`,alignItems:`center`,gap:`3px`,verticalAlign:`middle`},children:[(0,g.jsx)(d,{size:11,strokeWidth:2.5}),(0,g.jsx)(`span`,{children:e===`ar`?`تم الإرسال`:`Sent`})]})]}),(0,g.jsxs)(`div`,{className:`notif-card-meta`,children:[(0,g.jsxs)(`span`,{style:{fontSize:`11px`,fontWeight:`700`,color:r.textColor,background:r.bgGlow,padding:`2px 8px`,borderRadius:`8px`,border:`1px solid ${r.borderColor}`,display:`inline-flex`,alignItems:`center`,gap:`4px`},children:[(0,g.jsx)(ge,{size:11,style:{opacity:.8}}),(0,g.jsx)(`span`,{children:r.label})]}),(0,g.jsxs)(`span`,{style:{fontSize:`11.5px`,color:`var(--color-text-secondary)`,fontWeight:`600`,display:`inline-flex`,alignItems:`center`,gap:`4px`},children:[(0,g.jsx)(o,{size:13,style:{color:`var(--color-primary-ui)`,opacity:.8}}),(0,g.jsxs)(`span`,{children:[i,` (`,a,`)`]}),t.editedAt&&(0,g.jsxs)(`span`,{style:{color:`var(--color-warning, #d97706)`,fontWeight:700},children:[`· `,e===`ar`?`معدَّل`:`Edited`]})]})]})]})]}),(0,g.jsxs)(`div`,{className:`notif-action-btn-group no-print`,onClick:e=>e.stopPropagation(),children:[(0,g.jsx)(`button`,{className:`notif-icon-btn`,onClick:e=>nt(e,t),title:e===`ar`?`نسخ نص الإشعار`:`Copy notification text`,children:Le===t.id?(0,g.jsx)(d,{size:14,style:{color:`var(--color-success)`}}):(0,g.jsx)(s,{size:14})}),f(`communications`,`update`)&&(0,g.jsx)(`button`,{className:`notif-icon-btn`,onClick:e=>et(e,t),title:e===`ar`?`تعديل الإشعار`:`Edit notification`,children:(0,g.jsx)(_e,{size:14})}),f(`communications`,`delete`)&&(0,g.jsx)(`button`,{className:`notif-icon-btn danger`,onClick:e=>Qe(e,t.id),title:e===`ar`?`حذف الإشعار`:`Delete notification`,children:(0,g.jsx)(re,{size:14})})]})]}),(0,g.jsx)(`p`,{className:`notif-card-body`,children:t.content}),(0,g.jsxs)(`div`,{className:`notif-card-footer`,children:[(0,g.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`16px`,flexWrap:`wrap`},children:[(0,g.jsxs)(`span`,{children:[`✍️ `,e===`ar`?`المرسل: `:`Sender: `,(0,g.jsx)(`strong`,{children:it(t).name})]}),(0,g.jsxs)(`span`,{children:[`🎯 `,e===`ar`?`الموجه إليه: `:`Recipient: `,(0,g.jsx)(`strong`,{style:{color:`var(--color-primary-ui)`},children:ft(t)})]})]}),(0,g.jsxs)(`div`,{style:{display:`flex`,alignItems:`center`,gap:`5px`,color:`var(--color-success)`},children:[(0,g.jsx)(ie,{size:13}),(0,g.jsx)(`span`,{children:e===`ar`?`تم النشر كإشعار فوري`:`Sent as push notification`})]})]})]},t.id)}}function v(){return(0,g.jsx)(_,{})}export{v as default};