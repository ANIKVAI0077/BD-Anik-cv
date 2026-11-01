(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const fields = ['name','father','mother','dob','gender','religion','nationality','height','blood','marital','phone','email','nid','birthReg','present','permanent','objective','experience','skills','languages','reference'];
  let education = [];
  let photoData = '';
  let toastTimer;
  let currentUid = "";
  let draftKey = "";
  let historyKey = "";
  let draftTimer = null;
  let appStarted = false;

  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const value = id => $(id).value.trim();
  const showToast = message => {
    $('toast').textContent = message;
    $('toast').classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => $('toast').classList.remove('show'), 2400);
  };
  const bnDate = raw => {
    if (!raw) return '';
    const parts = raw.split('-');
    return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : raw;
  };
  const today = () => new Intl.DateTimeFormat('bn-BD',{day:'2-digit',month:'2-digit',year:'numeric'}).format(new Date());

  function renderEducationRows(){
    const body = $('educationRows');
    if (!education.length) {
      body.innerHTML = '<tr class="empty-row"><td colspan="6">এখনো কোনো শিক্ষাগত যোগ্যতা যোগ করা হয়নি</td></tr>';
      return;
    }
    body.innerHTML = education.map((e,i)=>`<tr><td>${escapeHtml(e.level)}</td><td>${escapeHtml(e.group)}</td><td>${escapeHtml(e.board)}</td><td>${escapeHtml(e.result)}</td><td>${escapeHtml(e.year)}</td><td><button class="delete-row" data-remove-edu="${i}" type="button">মুছুন</button></td></tr>`).join('');
  }
  function renderCv(){
    const personal = [
      ['নাম',value('name')],['পিতার নাম',value('father')],['মাতার নাম',value('mother')],
      ['জন্ম তারিখ',bnDate(value('dob'))],['লিঙ্গ',value('gender')],['ধর্ম',value('religion')],
      ['জাতীয়তা',value('nationality')],['উচ্চতা',value('height')],['রক্তের গ্রুপ',value('blood')],
      ['বৈবাহিক অবস্থা',value('marital')],['মোবাইল',value('phone')],['ই-মেইল',value('email')],
      ['জাতীয় পরিচয়পত্র',value('nid')],['জন্ম নিবন্ধন',value('birthReg')],
      ['বর্তমান ঠিকানা',value('present')],['স্থায়ী ঠিকানা',value('permanent')]
    ].filter(row=>row[1]);
    $('personalPreview').innerHTML = personal.map(([k,v])=>`<div class="p-label">${escapeHtml(k)}</div><div class="p-colon">:</div><div class="p-value">${escapeHtml(v)}</div>`).join('');
    $('educationPreview').innerHTML = education.length ? education.map(e=>`<tr><td>${escapeHtml(e.level)}</td><td>${escapeHtml(e.group)}</td><td>${escapeHtml(e.board)}</td><td>${escapeHtml(e.result)}</td><td>${escapeHtml(e.year)}</td></tr>`).join('') : '<tr><td colspan="5">শিক্ষাগত যোগ্যতার তথ্য যোগ করুন</td></tr>';
    const sections = [
      ['objective','objectiveOn','objectivePreviewSection','objectivePreview'],
      ['experience','experienceOn','experiencePreviewSection','experiencePreview'],
      ['skills','skillsOn','skillsPreviewSection','skillsPreview'],
      ['languages','languagesOn','languagesPreviewSection','languagesPreview'],
      ['reference','referenceOn','referencePreviewSection','referencePreview']
    ];
    sections.forEach(([field,toggle,section,output])=>{
      const enabled = $(toggle).checked && value(field);
      $(section).classList.toggle('hidden',!enabled);
      $(output).textContent = value(field);
    });
    $('objectivePreviewSection').classList.toggle('hidden',!$('objectiveOn').checked);
    $('objectivePreview').textContent = value('objective') || 'নিজের কর্মজীবনের লক্ষ্য এখানে লিখুন।';
    $('datePreview').textContent = today();
    $('signatureName').textContent = value('name') || 'আবেদনকারীর স্বাক্ষর';
    $('cvPhoto').src = photoData || '';
    $('cvPhotoBox').classList.toggle('has-photo', !!photoData);
    $('cvPhotoPlaceholder').textContent = 'ছবি';
    const template = document.querySelector('input[name="template"]:checked').value;
    $('cvPreview').className = `cv-paper template-${template}`;
  }
  function readForm(){
    const data = {};
    fields.forEach(id=>data[id]=value(id));
    data.toggles = ['objectiveOn','experienceOn','skillsOn','languagesOn','referenceOn'].reduce((a,id)=>(a[id]=$(id).checked,a),{});
    data.education = education;
    data.photo = photoData;
    data.template = document.querySelector('input[name="template"]:checked').value;
    data.title = value('cvTitle') || value('name') || 'নতুন জীবনবৃত্তান্ত';
    data.savedAt = new Date().toISOString();
    return data;
  }
  function fillForm(data){
    fields.forEach(id=>{ if ($(id)) $(id).value = data[id] || ''; });
    Object.entries(data.toggles || {}).forEach(([id,v])=>{if($(id))$(id).checked=!!v;});
    education = Array.isArray(data.education) ? data.education : [];
    photoData = data.photo || '';
    document.querySelector(`input[name="template"][value="${data.template || 'classic'}"]`).checked = true;
    $('photoPreview').src = photoData || $('photoPreview').src;
    renderEducationRows();
    document.querySelectorAll('[data-optional]').forEach(el=>{
      const key = el.dataset.optional;
      const toggle = key === 'objective' ? 'objectiveOn' : key+'On';
      el.classList.toggle('hidden',!$(toggle).checked);
    });
    renderCv();
  }
  function getHistory(){try{return JSON.parse(localStorage.getItem(historyKey)||'[]')}catch(e){return []}}
  function setHistory(items){localStorage.setItem(historyKey,JSON.stringify(items))}
  function saveDraft(){if(!draftKey)return;try{localStorage.setItem(draftKey,JSON.stringify(readForm()));}catch(e){showToast('স্বয়ংক্রিয় সংরক্ষণে সমস্যা হয়েছে। ছবির আকার কমান।');}}
  function queueDraft(){if(!draftKey)return;clearTimeout(draftTimer);draftTimer=setTimeout(saveDraft,450);}
  function renderHistory(){
    const items=getHistory();
    $('historyList').innerHTML = items.length ? items.map((item,i)=>`<article class="history-card"><div class="history-thumb">${item.thumbnail?`<img src="${item.thumbnail}" alt="সংরক্ষিত সিভির ছবি">`:'<span class="thumb-placeholder">জীবনবৃত্তান্ত</span>'}</div><h3>${escapeHtml(item.title)}</h3><p>সংরক্ষণের তারিখ: ${escapeHtml(new Date(item.savedAt).toLocaleDateString('bn-BD'))}</p><div class="history-actions"><button class="btn btn-outline" data-load="${i}">খুলুন / সম্পাদনা</button><button class="btn btn-primary" data-print="${i}">প্রিন্ট</button><button class="btn btn-outline" data-delete="${i}">মুছুন</button></div></article>`).join('') : '<div class="history-empty">এখনো কোনো সিভি সংরক্ষণ করা হয়নি।</div>';
  }
  async function makeThumbnail(){
    if (typeof window.html2canvas !== 'function') return '';
    try{
      const canvas=await window.html2canvas($('cvPreview'),{scale:1,backgroundColor:'#ffffff',useCORS:true});
      return canvas.toDataURL('image/jpeg',.68);
    }catch(e){return '';}
  }
  async function saveCv(){
    if(!value('name')){showToast('অনুগ্রহ করে পূর্ণ নাম লিখুন।');$('name').focus();return;}
    const data=readForm();
    const thumbnail=await makeThumbnail();
    const items=getHistory();
    try{const record={...data,thumbnail,id:String(Date.now())};items.unshift(record);setHistory(items.slice(0,20));if(window.cvCloud?.uid)await window.cvCloud.save(record);renderHistory();showToast('আপনার জীবনবৃত্তান্ত সংরক্ষণ করা হয়েছে।');}
    catch(e){showToast('ক্লাউডে সংরক্ষণ হয়নি। Firebase সেটিংস পরীক্ষা করুন।');}
  }
  function printCv(data){
    if(data) fillForm(data);
    renderCv();
    window.print();
  }

  $('addEducation').addEventListener('click',()=>{
    const level=$('eduLevel').value==='অন্যান্য' ? value('eduCustom') : $('eduLevel').value;
    if(!level){showToast('পরীক্ষার নাম লিখুন।');return;}
    education.push({level,group:value('eduGroup'),board:value('eduBoard'),result:value('eduResult'),year:value('eduYear')});
    ['eduCustom','eduGroup','eduBoard','eduResult','eduYear'].forEach(id=>$(id).value='');
    renderEducationRows();renderCv();queueDraft();
  });
  $('educationRows').addEventListener('click',e=>{
    const index=e.target.dataset.removeEdu;
    if(index!==undefined){education.splice(Number(index),1);renderEducationRows();renderCv();queueDraft();}
  });
  $('photo').addEventListener('change',e=>{
    const file=e.target.files[0];if(!file)return;
    if(!file.type.startsWith('image/')){showToast('একটি ছবি নির্বাচন করুন।');return;}
    if(file.size>4*1024*1024){showToast('ছবির আকার ৪ মেগাবাইটের কম রাখুন।');return;}
    const reader=new FileReader();
    reader.onload=()=>{const image=new Image();image.onload=()=>{const canvas=document.createElement('canvas');const scale=Math.min(1,700/image.width,900/image.height);canvas.width=Math.round(image.width*scale);canvas.height=Math.round(image.height*scale);canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);photoData=canvas.toDataURL('image/jpeg',.76);$('photoPreview').src=photoData;renderCv();queueDraft();};image.src=reader.result;};
    reader.readAsDataURL(file);
  });
  fields.forEach(id=>$(id).addEventListener('input',()=>{renderCv();queueDraft();}));
  ['objectiveOn','experienceOn','skillsOn','languagesOn','referenceOn'].forEach(id=>{
    $(id).addEventListener('change',()=>{
      const key=id.replace('On','');
      const field=document.querySelector(`[data-optional="${key}"]`);
      if(field)field.classList.toggle('hidden',!$(id).checked);
      renderCv();queueDraft();
    });
  });
  document.querySelectorAll('input[name="template"]').forEach(el=>el.addEventListener('change',()=>{renderCv();queueDraft();}));
  $('cvTitle').addEventListener('input',queueDraft);
  $('saveCv').addEventListener('click',saveCv);
  $('downloadPdf').addEventListener('click',()=>printCv());
  $('clearHistory').addEventListener('click',()=>{
    if(!getHistory().length){showToast('ইতিহাসে কোনো সিভি নেই।');return;}
    if(confirm('এই অ্যাকাউন্টের সব সংরক্ষিত সিভি মুছে ফেলতে চান?')){(async()=>{try{await window.cvCloud.clear();localStorage.removeItem(historyKey);renderHistory();showToast('ইতিহাস মুছে ফেলা হয়েছে।');}catch(e){showToast('ইতিহাস মুছতে সমস্যা হয়েছে।');}})();}
  });
  $('historyList').addEventListener('click',e=>{
    const load=e.target.dataset.load, del=e.target.dataset.delete, print=e.target.dataset.print;
    const items=getHistory();
    if(load!==undefined){fillForm(items[Number(load)]);$('editor').scrollIntoView({behavior:'smooth'});showToast('সংরক্ষিত সিভি খুলেছে।');}
    if(del!==undefined){const item=items[Number(del)];items.splice(Number(del),1);setHistory(items);window.cvCloud.remove(item.id).then(()=>showToast('সিভি মুছে ফেলা হয়েছে।')).catch(()=>showToast('সার্ভার থেকে মুছতে সমস্যা হয়েছে।'));renderHistory();}
    if(print!==undefined)printCv(items[Number(print)]);
  });

  function startUserSession(uid){
    if(!uid || (appStarted && uid===currentUid)) return;
    appStarted=true; currentUid=uid; draftKey=`anikCvDraft_${uid}`; historyKey=`anikCvHistory_${uid}`;
    try{const raw=localStorage.getItem(draftKey);if(raw)fillForm(JSON.parse(raw));}catch(e){}
    renderEducationRows();renderCv();renderHistory();
    window.cvCloud.list().then(items=>{if(items.length){setHistory(items.slice(0,20));renderHistory();}}).catch(()=>showToast('ক্লাউড ইতিহাস লোড হয়নি।'));
    document.querySelectorAll('#appArea input,#appArea textarea,#appArea select').forEach(el=>{if(el.type!=='file' && el.type!=='radio')el.addEventListener('change',queueDraft);});
  }
  document.addEventListener('cv-user-ready',e=>startUserSession(e.detail.uid));
  document.addEventListener('cv-user-logged-out',()=>{appStarted=false;currentUid='';draftKey='';historyKey='';});
  $('resetCv').addEventListener('click',()=>{
    if(!confirm('বর্তমান ফর্মের সব তথ্য মুছে নতুন CV শুরু করবেন? সংরক্ষিত CV ইতিহাস মুছবে না।'))return;
    document.querySelectorAll('#appArea input:not([type=radio]):not([type=checkbox]),#appArea textarea').forEach(el=>{el.value='';});
    document.querySelectorAll('#appArea input[type=checkbox]').forEach(el=>el.checked=el.id==='objectiveOn');
    $('photo').value='';photoData='';$('photoPreview').src='data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="90" height="110"%3E%3Crect width="100%25" height="100%25" fill="%23edf3f8"/%3E%3Ccircle cx="45" cy="37" r="19" fill="%23a9bdd0"/%3E%3Cpath d="M12 105c2-27 17-40 33-40s31 13 33 40" fill="%23a9bdd0"/%3E%3C/svg%3E';education=[];
    document.querySelector('input[name="template"][value="classic"]').checked=true;
    renderEducationRows();document.querySelectorAll('[data-optional]').forEach(el=>el.classList.toggle('hidden',el.dataset.optional!=='objective'));
    renderCv();saveDraft();showToast('নতুন CV তৈরির জন্য ফর্ম খালি করা হয়েছে।');
  });
  $('refreshSite').addEventListener('click',()=>{saveDraft();location.reload();});
  renderEducationRows();renderCv();
})();
