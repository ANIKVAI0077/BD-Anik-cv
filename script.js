(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const fields = ['name','father','mother','dob','gender','religion','nationality','height','blood','marital','phone','email','nid','birthReg','present','permanent','objective','experience','skills','languages','reference'];
  let education = [];
  let photoData = '';
  let toastTimer;

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
    $('cvPhoto').style.display = photoData ? 'block' : 'none';
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
  function getHistory(){try{return JSON.parse(localStorage.getItem('banglaCvHistory')||'[]')}catch(e){return []}}
  function setHistory(items){localStorage.setItem('banglaCvHistory',JSON.stringify(items))}
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
    items.unshift({...data,thumbnail,id:Date.now()});
    try{setHistory(items.slice(0,20));renderHistory();showToast('আপনার জীবনবৃত্তান্ত সংরক্ষণ করা হয়েছে।');}
    catch(e){showToast('সংরক্ষণ করা যায়নি। ছবির আকার কমিয়ে আবার চেষ্টা করুন।');}
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
    renderEducationRows();renderCv();
  });
  $('educationRows').addEventListener('click',e=>{
    const index=e.target.dataset.removeEdu;
    if(index!==undefined){education.splice(Number(index),1);renderEducationRows();renderCv();}
  });
  $('photo').addEventListener('change',e=>{
    const file=e.target.files[0];if(!file)return;
    if(!file.type.startsWith('image/')){showToast('একটি ছবি নির্বাচন করুন।');return;}
    if(file.size>4*1024*1024){showToast('ছবির আকার ৪ মেগাবাইটের কম রাখুন।');return;}
    const reader=new FileReader();
    reader.onload=()=>{photoData=reader.result;$('photoPreview').src=photoData;renderCv();};
    reader.readAsDataURL(file);
  });
  fields.forEach(id=>$(id).addEventListener('input',renderCv));
  ['objectiveOn','experienceOn','skillsOn','languagesOn','referenceOn'].forEach(id=>{
    $(id).addEventListener('change',()=>{
      const key=id.replace('On','');
      const field=document.querySelector(`[data-optional="${key}"]`);
      if(field)field.classList.toggle('hidden',!$(id).checked);
      renderCv();
    });
  });
  document.querySelectorAll('input[name="template"]').forEach(el=>el.addEventListener('change',renderCv));
  $('saveCv').addEventListener('click',saveCv);
  $('downloadPdf').addEventListener('click',()=>printCv());
  $('clearHistory').addEventListener('click',()=>{
    if(!getHistory().length){showToast('ইতিহাসে কোনো সিভি নেই।');return;}
    if(confirm('সব সংরক্ষিত সিভি মুছে ফেলতে চান?')){localStorage.removeItem('banglaCvHistory');renderHistory();showToast('ইতিহাস মুছে ফেলা হয়েছে।');}
  });
  $('historyList').addEventListener('click',e=>{
    const load=e.target.dataset.load, del=e.target.dataset.delete, print=e.target.dataset.print;
    const items=getHistory();
    if(load!==undefined){fillForm(items[Number(load)]);$('editor').scrollIntoView({behavior:'smooth'});showToast('সংরক্ষিত সিভি খুলেছে।');}
    if(del!==undefined){items.splice(Number(del),1);setHistory(items);renderHistory();showToast('সিভি মুছে ফেলা হয়েছে।');}
    if(print!==undefined)printCv(items[Number(print)]);
  });

  renderEducationRows();
  renderCv();
  renderHistory();
})();
