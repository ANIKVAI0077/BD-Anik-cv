
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const fields = ['name','father','mother','dob','gender','religion','nationality','height','blood','marital','phone','email','nid','birthReg','present','permanent','objective','experience','skills','languages','reference'];
  let education = [], photoData = '', toastTimer, draftTimer;
  const DRAFT_KEY = 'anikcv_draft_v1';
  const HISTORY_KEY = 'anikcv_history_v1';
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const value = id => $(id).value.trim();
  const showToast = message => { $('toast').textContent=message; $('toast').classList.add('show'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>$('toast').classList.remove('show'),2600); };
  const bnDate = raw => { if(!raw)return ''; const p=raw.split('-'); return p.length===3?`${p[2]}/${p[1]}/${p[0]}`:raw; };
  const today = () => new Intl.DateTimeFormat('bn-BD',{day:'2-digit',month:'2-digit',year:'numeric'}).format(new Date());
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
  function readStored(key, fallback){
    try { const raw=localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
    catch(err){ console.warn('Local storage read failed',err); return fallback; }
  }
  function writeStored(key, data){
    try { localStorage.setItem(key, JSON.stringify(data)); return true; }
    catch(err){ console.warn('Local storage write failed',err); showToast('ব্রাউজারের জায়গা পূর্ণ। কিছু পুরোনো সিভি মুছে আবার চেষ্টা করুন।'); return false; }
  }
  function scheduleDraftSave(){
    clearTimeout(draftTimer);
    draftTimer=setTimeout(()=>{
      const data=readForm();
      if(writeStored(DRAFT_KEY,data)) showToast('আপনার কাজ স্বয়ংক্রিয়ভাবে সংরক্ষিত হয়েছে।');
    },900);
  }
  function loadDraft(){
    const data=readStored(DRAFT_KEY,null);
    if(data){ fillForm(data); showToast('আগের অসমাপ্ত কাজ ফিরিয়ে আনা হয়েছে।'); }
    else renderCv();
  }
  function renderHistory(){
    const box=$('historyList');
    const items=readStored(HISTORY_KEY,[]).sort((a,b)=>String(b.savedAt||'').localeCompare(String(a.savedAt||'')));
    box.innerHTML=items.length?items.map(item=>`<article class="history-card"><div class="history-thumb">${item.thumbnail?`<img src="${item.thumbnail}" alt="সংরক্ষিত সিভির নমুনা">`:'<span class="thumb-placeholder">জীবনবৃত্তান্ত</span>'}</div><h3>${escapeHtml(item.title||'জীবনবৃত্তান্ত')}</h3><p>সংরক্ষণের তারিখ: ${escapeHtml(item.savedAt?new Date(item.savedAt).toLocaleDateString('bn-BD'):'')}</p><div class="history-actions"><button class="btn btn-outline" data-load="${escapeHtml(item.id)}">খুলুন / সম্পাদনা</button><button class="btn btn-primary" data-print="${escapeHtml(item.id)}">প্রিন্ট</button><button class="btn btn-outline" data-delete="${escapeHtml(item.id)}">মুছুন</button></div></article>`).join(''):'<div class="history-empty">এখনো কোনো সিভি সংরক্ষণ করা হয়নি।</div>';
  }
  async function saveCv(){
    if(!value('name')){showToast('অনুগ্রহ করে পূর্ণ নাম লিখুন।');$('name').focus();return;}
    const btn=$('saveCv');btn.disabled=true;
    try{
      const data=readForm(); data.thumbnail=await makeThumbnail();
      data.id=(window.crypto&&crypto.randomUUID)?crypto.randomUUID():String(Date.now());
      const items=readStored(HISTORY_KEY,[]);
      items.unshift(data);
      if(writeStored(HISTORY_KEY,items.slice(0,30))){renderHistory();showToast('আপনার সিভি এই ব্রাউজারে সংরক্ষণ করা হয়েছে।');}
    }catch(err){console.error(err);showToast('সিভি সংরক্ষণ করা যায়নি। ব্রাউজারের জায়গা পরীক্ষা করুন।');}
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
  $('resetCv').addEventListener('click',()=>{
    if(!confirm('বর্তমান CV-এর সব তথ্য ও ছবি খালি করে নতুন CV তৈরি করতে চান? সংরক্ষিত CV-এর ইতিহাস মুছবে না।')) return;
    clearTimeout(draftTimer);
    localStorage.removeItem(DRAFT_KEY);
    window.location.reload();
  });
  $('clearHistory').addEventListener('click',()=>{if(!confirm('এই ব্রাউজারে সংরক্ষিত সব সিভি মুছে ফেলতে চান?'))return;localStorage.removeItem(HISTORY_KEY);renderHistory();showToast('সিভির ইতিহাস মুছে ফেলা হয়েছে।');});
  $('historyList').addEventListener('click',e=>{
    const load=e.target.dataset.load,del=e.target.dataset.delete,print=e.target.dataset.print;
    const items=readStored(HISTORY_KEY,[]);
    const id=load||del||print;
    if(!id)return;
    const item=items.find(x=>x.id===id);
    if(!item)return;
    if(load){fillForm(item);scheduleDraftSave();$('editor').scrollIntoView({behavior:'smooth'});showToast('সংরক্ষিত সিভি খোলা হয়েছে।');}
    if(del){const next=items.filter(x=>x.id!==id);writeStored(HISTORY_KEY,next);renderHistory();showToast('সিভি মুছে ফেলা হয়েছে।');}
    if(print)printCv(item);
  });
  loadDraft();
  renderHistory();

})();
