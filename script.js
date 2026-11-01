import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getAuth, onAuthStateChanged, createUserWithEmailAndPassword,
  signInWithEmailAndPassword, sendPasswordResetEmail, signOut, updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  getFirestore, collection, doc, setDoc, getDoc, getDocs, deleteDoc,
  query, orderBy, limit
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const fields = ['name','father','mother','dob','gender','religion','nationality','height','blood','marital','phone','email','nid','birthReg','present','permanent','objective','experience','skills','languages','reference'];
  let education = [], photoData = '', toastTimer, draftTimer, currentUser = null, authMode = 'login';
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const value = id => $(id).value.trim();
  const showToast = message => { $('toast').textContent=message; $('toast').classList.add('show'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>$('toast').classList.remove('show'),2600); };
  const authMessage = message => { $('authMessage').textContent=message; };
  const bnDate = raw => { if(!raw)return ''; const p=raw.split('-'); return p.length===3?`${p[2]}/${p[1]}/${p[0]}`:raw; };
  const today = () => new Intl.DateTimeFormat('bn-BD',{day:'2-digit',month:'2-digit',year:'numeric'}).format(new Date());
  const userCollection = name => collection(db,'users',currentUser.uid,name);
  const userDoc = (name,id) => doc(db,'users',currentUser.uid,name,id);

  function setAuthMode(mode){
    authMode=mode; const register=mode==='register';
    $('authTitle').textContent=register?'নতুন অ্যাকাউন্ট তৈরি করুন':'আপনার অ্যাকাউন্টে লগইন করুন';
    $('authNameWrap').classList.toggle('hidden',!register);
    $('authName').required=register;
    $('authSubmit').textContent=register?'অ্যাকাউন্ট তৈরি করুন':'লগইন করুন';
    $('authSwitchText').textContent=register?'আগে থেকেই অ্যাকাউন্ট আছে?':'নতুন ব্যবহারকারী?';
    $('authSwitch').textContent=register?'লগইন করুন':'নতুন অ্যাকাউন্ট তৈরি করুন';
    $('forgotPassword').classList.toggle('hidden',register);
    $('authPassword').autocomplete=register?'new-password':'current-password';
    authMessage('');
  }
  $('authSwitch').addEventListener('click',()=>setAuthMode(authMode==='login'?'register':'login'));
  $('authForm').addEventListener('submit',async e=>{
    e.preventDefault(); const email=value('authEmail'), password=$('authPassword').value;
    $('authSubmit').disabled=true; authMessage('অনুগ্রহ করে অপেক্ষা করুন…');
    try{
      if(authMode==='register'){
        const name=value('authName');
        const cred=await createUserWithEmailAndPassword(auth,email,password);
        await updateProfile(cred.user,{displayName:name});
        await setDoc(doc(db,'users',cred.user.uid,'profile','main'),{name,email,createdAt:new Date().toISOString()});
      } else await signInWithEmailAndPassword(auth,email,password);
    }catch(err){ authMessage(authError(err)); }
    finally{$('authSubmit').disabled=false;}
  });
  $('forgotPassword').addEventListener('click',async()=>{
    const email=value('authEmail'); if(!email){authMessage('আগে আপনার ই-মেইল লিখুন।');$('authEmail').focus();return;}
    try{await sendPasswordResetEmail(auth,email);authMessage('পাসওয়ার্ড পরিবর্তনের লিংক আপনার ই-মেইলে পাঠানো হয়েছে।');}
    catch(err){authMessage(authError(err));}
  });
  $('logoutBtn').addEventListener('click',async()=>{try{await signOut(auth);}catch(e){showToast('লগআউট করা যায়নি। আবার চেষ্টা করুন।');}});
  function authError(err){
    const map={'auth/email-already-in-use':'এই ই-মেইল দিয়ে আগে থেকেই অ্যাকাউন্ট আছে।','auth/invalid-email':'সঠিক ই-মেইল ঠিকানা লিখুন।','auth/weak-password':'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।','auth/invalid-credential':'ই-মেইল অথবা পাসওয়ার্ড সঠিক নয়।','auth/user-not-found':'এই ই-মেইলে কোনো অ্যাকাউন্ট পাওয়া যায়নি।','auth/too-many-requests':'অনেকবার চেষ্টা হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।','auth/network-request-failed':'ইন্টারনেট সংযোগ পরীক্ষা করুন।'};
    return map[err.code] || `সমস্যা হয়েছে: ${err.message||'আবার চেষ্টা করুন।'}`;
  }

  function renderEducationRows(){
    const body=$('educationRows');
    if(!education.length){body.innerHTML='<tr class="empty-row"><td colspan="6">এখনো কোনো শিক্ষাগত যোগ্যতা যোগ করা হয়নি</td></tr>';return;}
    body.innerHTML=education.map((e,i)=>`<tr><td>${escapeHtml(e.level)}</td><td>${escapeHtml(e.group)}</td><td>${escapeHtml(e.board)}</td><td>${escapeHtml(e.result)}</td><td>${escapeHtml(e.year)}</td><td><button class="delete-row" data-remove-edu="${i}" type="button">মুছুন</button></td></tr>`).join('');
  }
  function renderCv(){
    const personal=[['নাম',value('name')],['পিতার নাম',value('father')],['মাতার নাম',value('mother')],['জন্ম তারিখ',bnDate(value('dob'))],['লিঙ্গ',value('gender')],['ধর্ম',value('religion')],['জাতীয়তা',value('nationality')],['উচ্চতা',value('height')],['রক্তের গ্রুপ',value('blood')],['বৈবাহিক অবস্থা',value('marital')],['মোবাইল',value('phone')],['ই-মেইল',value('email')],['জাতীয় পরিচয়পত্র',value('nid')],['জন্ম নিবন্ধন',value('birthReg')],['বর্তমান ঠিকানা',value('present')],['স্থায়ী ঠিকানা',value('permanent')]].filter(r=>r[1]);
    $('personalPreview').innerHTML=personal.map(([k,v])=>`<div class="p-label">${escapeHtml(k)}</div><div class="p-colon">:</div><div class="p-value">${escapeHtml(v)}</div>`).join('');
    $('educationPreview').innerHTML=education.length?education.map(e=>`<tr><td>${escapeHtml(e.level)}</td><td>${escapeHtml(e.group)}</td><td>${escapeHtml(e.board)}</td><td>${escapeHtml(e.result)}</td><td>${escapeHtml(e.year)}</td></tr>`).join(''):'<tr><td colspan="5">শিক্ষাগত যোগ্যতার তথ্য যোগ করুন</td></tr>';
    const sections=[['objective','objectiveOn','objectivePreviewSection','objectivePreview'],['experience','experienceOn','experiencePreviewSection','experiencePreview'],['skills','skillsOn','skillsPreviewSection','skillsPreview'],['languages','languagesOn','languagesPreviewSection','languagesPreview'],['reference','referenceOn','referencePreviewSection','referencePreview']];
    sections.forEach(([field,toggle,section,out])=>{$(section).classList.toggle('hidden',!$(toggle).checked||(!value(field)&&field!=='objective'));$(out).textContent=value(field);});
    $('objectivePreviewSection').classList.toggle('hidden',!$('objectiveOn').checked); $('objectivePreview').textContent=value('objective')||'নিজের কর্মজীবনের লক্ষ্য এখানে লিখুন।';
    $('datePreview').textContent=today(); $('signatureName').textContent=value('name')||'আবেদনকারীর স্বাক্ষর';
    $('cvPhoto').src=photoData||''; $('cvPhotoBox').classList.toggle('has-photo',!!photoData); $('cvPhotoPlaceholder').textContent='ছবি';
    const template=document.querySelector('input[name="template"]:checked').value; $('cvPreview').className=`cv-paper template-${template}`;
  }
  function readForm(){
    const data={}; fields.forEach(id=>data[id]=value(id));
    data.toggles=['objectiveOn','experienceOn','skillsOn','languagesOn','referenceOn'].reduce((a,id)=>(a[id]=$(id).checked,a),{});
    data.education=education; data.photo=photoData; data.template=document.querySelector('input[name="template"]:checked').value;
    data.title=value('cvTitle')||value('name')||'নতুন জীবনবৃত্তান্ত'; data.savedAt=new Date().toISOString(); return data;
  }
  function fillForm(data){
    fields.forEach(id=>{if($(id))$(id).value=data[id]||'';});
    Object.entries(data.toggles||{}).forEach(([id,v])=>{if($(id))$(id).checked=!!v;});
    education=Array.isArray(data.education)?data.education:[]; photoData=data.photo||'';
    const radio=document.querySelector(`input[name="template"][value="${data.template||'classic'}"]`); if(radio)radio.checked=true;
    $('photoPreview').src=photoData||$('photoPreview').dataset.placeholder||$('photoPreview').src;
    renderEducationRows(); document.querySelectorAll('[data-optional]').forEach(el=>{const k=el.dataset.optional,t=k==='objective'?'objectiveOn':k+'On';el.classList.toggle('hidden',!$(t).checked);});
    renderCv();
  }
  async function makeThumbnail(){
    if(typeof window.html2canvas!=='function')return '';
    try{const canvas=await window.html2canvas($('cvPreview'),{scale:.45,backgroundColor:'#fff',useCORS:true});return canvas.toDataURL('image/jpeg',.38);}catch(e){return '';}
  }
  function scheduleDraftSave(){
    if(!currentUser)return; clearTimeout(draftTimer);
    draftTimer=setTimeout(async()=>{try{await setDoc(userDoc('drafts','current'),readForm());}catch(err){console.warn('Draft save failed',err);showToast('স্বয়ংক্রিয় সংরক্ষণ হয়নি। ইন্টারনেট পরীক্ষা করুন।');}},1300);
  }
  async function loadDraft(){
    try{const snap=await getDoc(userDoc('drafts','current'));if(snap.exists()){fillForm(snap.data());showToast('আগের অসমাপ্ত কাজ ফিরিয়ে আনা হয়েছে।');}else{renderCv();}}
    catch(err){console.error(err);showToast('আগের খসড়া লোড করা যায়নি।');}
  }
  async function renderHistory(){
    const box=$('historyList'); box.innerHTML='<div class="history-empty">সংরক্ষিত সিভি লোড হচ্ছে…</div>';
    try{
      const q=query(userCollection('cvs'),orderBy('savedAt','desc'),limit(30)); const snap=await getDocs(q);
      const items=snap.docs.map(d=>({id:d.id,...d.data()}));
      box.innerHTML=items.length?items.map(item=>`<article class="history-card"><div class="history-thumb">${item.thumbnail?`<img src="${item.thumbnail}" alt="সংরক্ষিত সিভির নমুনা">`:'<span class="thumb-placeholder">জীবনবৃত্তান্ত</span>'}</div><h3>${escapeHtml(item.title||'জীবনবৃত্তান্ত')}</h3><p>সংরক্ষণের তারিখ: ${escapeHtml(item.savedAt?new Date(item.savedAt).toLocaleDateString('bn-BD'):'')}</p><div class="history-actions"><button class="btn btn-outline" data-load="${item.id}">খুলুন / সম্পাদনা</button><button class="btn btn-primary" data-print="${item.id}">প্রিন্ট</button><button class="btn btn-outline" data-delete="${item.id}">মুছুন</button></div></article>`).join(''):'<div class="history-empty">এখনো কোনো সিভি সংরক্ষণ করা হয়নি।</div>';
    }catch(err){console.error(err);box.innerHTML='<div class="history-empty">সিভির ইতিহাস লোড করা যায়নি। Firestore Rules পরীক্ষা করুন।</div>';}
  }
  async function saveCv(){
    if(!value('name')){showToast('অনুগ্রহ করে পূর্ণ নাম লিখুন।');$('name').focus();return;}
    const btn=$('saveCv');btn.disabled=true;
    try{const data=readForm();data.thumbnail=await makeThumbnail();const ref=doc(userCollection('cvs'));await setDoc(ref,data);await renderHistory();showToast('আপনার সিভি অ্যাকাউন্টে সংরক্ষণ করা হয়েছে।');}
    catch(err){console.error(err);showToast('সিভি সংরক্ষণ হয়নি। Firestore Rules ও ইন্টারনেট পরীক্ষা করুন।');}
    finally{btn.disabled=false;}
  }
  function printCv(data){if(data)fillForm(data);renderCv();window.print();}
  async function compressImage(file){
    const dataUrl=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(file);});
    const img=await new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=reject;image.src=dataUrl;});
    const scale=Math.min(1,700/Math.max(img.width,img.height));const canvas=document.createElement('canvas');canvas.width=Math.round(img.width*scale);canvas.height=Math.round(img.height*scale);
    canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);return canvas.toDataURL('image/jpeg',.72);
  }

  $('addEducation').addEventListener('click',()=>{const level=$('eduLevel').value==='অন্যান্য'?value('eduCustom'):$('eduLevel').value;if(!level){showToast('পরীক্ষার নাম লিখুন।');return;}education.push({level,group:value('eduGroup'),board:value('eduBoard'),result:value('eduResult'),year:value('eduYear')});['eduCustom','eduGroup','eduBoard','eduResult','eduYear'].forEach(id=>$(id).value='');renderEducationRows();renderCv();scheduleDraftSave();});
  $('educationRows').addEventListener('click',e=>{const i=e.target.dataset.removeEdu;if(i!==undefined){education.splice(Number(i),1);renderEducationRows();renderCv();scheduleDraftSave();}});
  $('photo').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;if(!file.type.startsWith('image/')){showToast('একটি ছবি নির্বাচন করুন।');return;}if(file.size>8*1024*1024){showToast('ছবির আকার ৮ মেগাবাইটের কম রাখুন।');return;}try{photoData=await compressImage(file);$('photoPreview').src=photoData;renderCv();scheduleDraftSave();}catch(err){showToast('ছবিটি পড়া যায়নি। অন্য ছবি দিন।');}});
  fields.forEach(id=>$(id).addEventListener('input',()=>{renderCv();scheduleDraftSave();}));
  ['objectiveOn','experienceOn','skillsOn','languagesOn','referenceOn'].forEach(id=>$(id).addEventListener('change',()=>{const key=id.replace('On','');const field=document.querySelector(`[data-optional="${key}"]`);if(field)field.classList.toggle('hidden',!$(id).checked);renderCv();scheduleDraftSave();}));
  document.querySelectorAll('input[name="template"]').forEach(el=>el.addEventListener('change',()=>{renderCv();scheduleDraftSave();}));
  $('cvTitle').addEventListener('input',scheduleDraftSave); $('saveCv').addEventListener('click',saveCv); $('downloadPdf').addEventListener('click',()=>printCv());
  $('clearHistory').addEventListener('click',async()=>{if(!confirm('আপনার অ্যাকাউন্টের সব সংরক্ষিত সিভি মুছে ফেলতে চান?'))return;try{const snap=await getDocs(userCollection('cvs'));await Promise.all(snap.docs.map(d=>deleteDoc(d.ref)));await renderHistory();showToast('আপনার সিভির ইতিহাস মুছে ফেলা হয়েছে।');}catch(e){showToast('ইতিহাস মুছতে সমস্যা হয়েছে।');}});
  $('historyList').addEventListener('click',async e=>{
    const load=e.target.dataset.load,del=e.target.dataset.delete,print=e.target.dataset.print;
    try{
      if(load){const snap=await getDoc(userDoc('cvs',load));if(snap.exists()){fillForm(snap.data());scheduleDraftSave();$('editor').scrollIntoView({behavior:'smooth'});showToast('সংরক্ষিত সিভি খোলা হয়েছে।');}}
      if(del){await deleteDoc(userDoc('cvs',del));await renderHistory();showToast('সিভি মুছে ফেলা হয়েছে।');}
      if(print){const snap=await getDoc(userDoc('cvs',print));if(snap.exists())printCv(snap.data());}
    }catch(err){showToast('কাজটি সম্পন্ন করা যায়নি।');}
  });
  onAuthStateChanged(auth,async user=>{
    currentUser=user;
    $('authGate').classList.toggle('hidden',!!user); $('appShell').classList.toggle('hidden',!user);
    if(user){$('accountLabel').textContent=user.displayName||user.email;$('authPassword').value='';await loadDraft();await renderHistory();}
    else{clearTimeout(draftTimer);setAuthMode('login');$('historyList').innerHTML='<div class="history-empty">লগইন করলে আপনার সংরক্ষিত সিভি দেখা যাবে।</div>';}
  });
})();
