// Problem Dünyası v10.1 – Animasyonlu Tema (yalnızca veritabanı kullanır)
const THEMES={1:{name:"1. Sınıf"},2:{name:"2. Sınıf"},3:{name:"3. Sınıf"},4:{name:"4. Sınıf"}};
let STATE={sinif:1,konu:null,zorluk:"orta",topics:[],questions:[],adSoyad:"",tarih:"",okul:""};


// === Fallback yerleşik veritabanı (dosyalar yüklenmezse devreye girer) ===
const FALLBACK_DB = {"1": {"topics": [{"key": "toplama", "label": "Toplama"}, {"key": "cikarma", "label": "Çıkarma"}], "pools": {"toplama": [{"soru": "1. Sınıf Toplama problem 1.", "cevap": "(Cevap)"}, {"soru": "1. Sınıf Toplama problem 2.", "cevap": "(Cevap)"}, {"soru": "1. Sınıf Toplama problem 3.", "cevap": "(Cevap)"}, {"soru": "1. Sınıf Toplama problem 4.", "cevap": "(Cevap)"}, {"soru": "1. Sınıf Toplama problem 5.", "cevap": "(Cevap)"}, {"soru": "1. Sınıf Toplama problem 6.", "cevap": "(Cevap)"}, {"soru": "1. Sınıf Toplama problem 7.", "cevap": "(Cevap)"}, {"soru": "1. Sınıf Toplama problem 8.", "cevap": "(Cevap)"}, {"soru": "1. Sınıf Toplama problem 9.", "cevap": "(Cevap)"}, {"soru": "1. Sınıf Toplama problem 10.", "cevap": "(Cevap)"}], "cikarma": [{"soru": "1. Sınıf Çıkarma problem 1.", "cevap": "(Cevap)"}, {"soru": "1. Sınıf Çıkarma problem 2.", "cevap": "(Cevap)"}, {"soru": "1. Sınıf Çıkarma problem 3.", "cevap": "(Cevap)"}, {"soru": "1. Sınıf Çıkarma problem 4.", "cevap": "(Cevap)"}, {"soru": "1. Sınıf Çıkarma problem 5.", "cevap": "(Cevap)"}, {"soru": "1. Sınıf Çıkarma problem 6.", "cevap": "(Cevap)"}, {"soru": "1. Sınıf Çıkarma problem 7.", "cevap": "(Cevap)"}, {"soru": "1. Sınıf Çıkarma problem 8.", "cevap": "(Cevap)"}, {"soru": "1. Sınıf Çıkarma problem 9.", "cevap": "(Cevap)"}, {"soru": "1. Sınıf Çıkarma problem 10.", "cevap": "(Cevap)"}]}}, "2": {"topics": [{"key": "carpma", "label": "Çarpma"}, {"key": "bolme", "label": "Bölme"}], "pools": {"carpma": [{"soru": "2. Sınıf Çarpma problem 1.", "cevap": "(Cevap)"}, {"soru": "2. Sınıf Çarpma problem 2.", "cevap": "(Cevap)"}, {"soru": "2. Sınıf Çarpma problem 3.", "cevap": "(Cevap)"}, {"soru": "2. Sınıf Çarpma problem 4.", "cevap": "(Cevap)"}, {"soru": "2. Sınıf Çarpma problem 5.", "cevap": "(Cevap)"}, {"soru": "2. Sınıf Çarpma problem 6.", "cevap": "(Cevap)"}, {"soru": "2. Sınıf Çarpma problem 7.", "cevap": "(Cevap)"}, {"soru": "2. Sınıf Çarpma problem 8.", "cevap": "(Cevap)"}, {"soru": "2. Sınıf Çarpma problem 9.", "cevap": "(Cevap)"}, {"soru": "2. Sınıf Çarpma problem 10.", "cevap": "(Cevap)"}], "bolme": [{"soru": "2. Sınıf Bölme problem 1.", "cevap": "(Cevap)"}, {"soru": "2. Sınıf Bölme problem 2.", "cevap": "(Cevap)"}, {"soru": "2. Sınıf Bölme problem 3.", "cevap": "(Cevap)"}, {"soru": "2. Sınıf Bölme problem 4.", "cevap": "(Cevap)"}, {"soru": "2. Sınıf Bölme problem 5.", "cevap": "(Cevap)"}, {"soru": "2. Sınıf Bölme problem 6.", "cevap": "(Cevap)"}, {"soru": "2. Sınıf Bölme problem 7.", "cevap": "(Cevap)"}, {"soru": "2. Sınıf Bölme problem 8.", "cevap": "(Cevap)"}, {"soru": "2. Sınıf Bölme problem 9.", "cevap": "(Cevap)"}, {"soru": "2. Sınıf Bölme problem 10.", "cevap": "(Cevap)"}]}}, "3": {"topics": [{"key": "kesirler", "label": "Kesirler"}, {"key": "olcme", "label": "Ölçme"}], "pools": {"kesirler": [{"soru": "3. Sınıf Kesirler problem 1.", "cevap": "(Cevap)"}, {"soru": "3. Sınıf Kesirler problem 2.", "cevap": "(Cevap)"}, {"soru": "3. Sınıf Kesirler problem 3.", "cevap": "(Cevap)"}, {"soru": "3. Sınıf Kesirler problem 4.", "cevap": "(Cevap)"}, {"soru": "3. Sınıf Kesirler problem 5.", "cevap": "(Cevap)"}, {"soru": "3. Sınıf Kesirler problem 6.", "cevap": "(Cevap)"}, {"soru": "3. Sınıf Kesirler problem 7.", "cevap": "(Cevap)"}, {"soru": "3. Sınıf Kesirler problem 8.", "cevap": "(Cevap)"}, {"soru": "3. Sınıf Kesirler problem 9.", "cevap": "(Cevap)"}, {"soru": "3. Sınıf Kesirler problem 10.", "cevap": "(Cevap)"}], "olcme": [{"soru": "3. Sınıf Ölçme problem 1.", "cevap": "(Cevap)"}, {"soru": "3. Sınıf Ölçme problem 2.", "cevap": "(Cevap)"}, {"soru": "3. Sınıf Ölçme problem 3.", "cevap": "(Cevap)"}, {"soru": "3. Sınıf Ölçme problem 4.", "cevap": "(Cevap)"}, {"soru": "3. Sınıf Ölçme problem 5.", "cevap": "(Cevap)"}, {"soru": "3. Sınıf Ölçme problem 6.", "cevap": "(Cevap)"}, {"soru": "3. Sınıf Ölçme problem 7.", "cevap": "(Cevap)"}, {"soru": "3. Sınıf Ölçme problem 8.", "cevap": "(Cevap)"}, {"soru": "3. Sınıf Ölçme problem 9.", "cevap": "(Cevap)"}, {"soru": "3. Sınıf Ölçme problem 10.", "cevap": "(Cevap)"}]}}, "4": {"topics": [{"key": "alan", "label": "Alan"}, {"key": "cevre", "label": "Çevre"}], "pools": {"alan": [{"soru": "4. Sınıf Alan problem 1.", "cevap": "(Cevap)"}, {"soru": "4. Sınıf Alan problem 2.", "cevap": "(Cevap)"}, {"soru": "4. Sınıf Alan problem 3.", "cevap": "(Cevap)"}, {"soru": "4. Sınıf Alan problem 4.", "cevap": "(Cevap)"}, {"soru": "4. Sınıf Alan problem 5.", "cevap": "(Cevap)"}, {"soru": "4. Sınıf Alan problem 6.", "cevap": "(Cevap)"}, {"soru": "4. Sınıf Alan problem 7.", "cevap": "(Cevap)"}, {"soru": "4. Sınıf Alan problem 8.", "cevap": "(Cevap)"}, {"soru": "4. Sınıf Alan problem 9.", "cevap": "(Cevap)"}, {"soru": "4. Sınıf Alan problem 10.", "cevap": "(Cevap)"}], "cevre": [{"soru": "4. Sınıf Çevre problem 1.", "cevap": "(Cevap)"}, {"soru": "4. Sınıf Çevre problem 2.", "cevap": "(Cevap)"}, {"soru": "4. Sınıf Çevre problem 3.", "cevap": "(Cevap)"}, {"soru": "4. Sınıf Çevre problem 4.", "cevap": "(Cevap)"}, {"soru": "4. Sınıf Çevre problem 5.", "cevap": "(Cevap)"}, {"soru": "4. Sınıf Çevre problem 6.", "cevap": "(Cevap)"}, {"soru": "4. Sınıf Çevre problem 7.", "cevap": "(Cevap)"}, {"soru": "4. Sınıf Çevre problem 8.", "cevap": "(Cevap)"}, {"soru": "4. Sınıf Çevre problem 9.", "cevap": "(Cevap)"}, {"soru": "4. Sınıf Çevre problem 10.", "cevap": "(Cevap)"}]}}};
function getParam(n){try{return new URL(window.location.href).searchParams.get(n)}catch{return null}}
function shuffle(a){const arr=a.slice();for(let i=arr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]]}return arr}
async function safeJson(url){try{const r=await fetch(url+(url.includes('?')?'&':'?')+'v='+Date.now());if(!r.ok)throw 0;return await r.json()}catch(e){return null}}

async function loadTopics(s){
  const data = await safeJson(`veritabani/${s}sinif_konular.json`);
  if(data && Array.isArray(data) && data.length) return data;
  return (FALLBACK_DB[s]?.topics)||[];
}
async function tryLoadPool(s,k){
  const data = await safeJson(`veritabani/${s}sinif_${k}.json`);
  if(data && Array.isArray(data) && data.length) return data;
  return (FALLBACK_DB[s]?.pools?.[k])||[];
}

function pickTen(pool){const out=[];if(!pool||pool.length===0)return out;const copy=shuffle(pool.slice());while(out.length<10){out.push(copy[out.length%copy.length]);}return out;}

async function regenerate(){const pool=await tryLoadPool(STATE.sinif,STATE.konu);STATE.questions=pickTen(pool);render();updateHeader();}

function render(){
  const ol=document.getElementById("soruListe"); if(!ol) return; ol.innerHTML="";
  const len=(STATE.questions||[]).length;
  for(let i=0;i<10;i++){
    const li=document.createElement("li"); li.className="qbox";
    const row=document.createElement("div"); row.className="qrow";
    const num=document.createElement("div"); num.className="qnum"; num.textContent=`${i+1})`;
    const text=document.createElement("div"); text.className="qtext";
    text.textContent= len? (STATE.questions[i%len].soru||"") : "Bu konuda henüz soru eklenmemiştir.";
    row.appendChild(num); row.appendChild(text);
    const spacer=document.createElement("div"); spacer.className="qspacer";
    li.appendChild(row); li.appendChild(spacer); ol.appendChild(li);
  }
}

function updateHeader(){
  const lbl=STATE.topics.find(t=>t.key===STATE.konu)?.label||STATE.konu||"";
  const set=(id,v)=>{const el=document.getElementById(id); if(el) el.textContent=v||"";}
  set("h_ad",STATE.adSoyad||""); set("h_tarih",STATE.tarih||""); set("h_okul",STATE.okul||"");
  set("h_zorluk",(STATE.zorluk||"orta").toUpperCase());
  const h=document.getElementById("sayfaBaslik"); if(h) h.textContent=`${THEMES[STATE.sinif].name} – ${lbl}`;
}

async function exportPDF(){
  const el=document.getElementById("printArea"); if(!el) return;
  const canvas=await html2canvas(el,{scale:3, backgroundColor:"#ffffff", useCORS:true});
  const img=canvas.toDataURL("image/jpeg",1.0);
  const {jsPDF}=window.jspdf; const pdf=new jsPDF("p","mm","a4");
  const w=pdf.internal.pageSize.getWidth(), h=pdf.internal.pageSize.getHeight();
  pdf.addImage(img,"JPEG",0,0,w,h,undefined,"FAST");
  const d=new Date().toISOString().slice(0,10);
  pdf.save(`ProblemDunyasi_${STATE.sinif}sinif_${STATE.konu}_${d}.pdf`);
  updateStatsAfterPDF();
}); const img=canvas.toDataURL("image/png");
  const {jsPDF}=window.jspdf; const pdf=new jsPDF("p","mm","a4");
  const w=pdf.internal.pageSize.getWidth(), h=pdf.internal.pageSize.getHeight();
  pdf.addImage(img,"PNG",0,0,w,h);
  const d=new Date().toISOString().slice(0,10);
  pdf.save(`ProblemDunyasi_${STATE.sinif}sinif_${STATE.konu}_${d}.pdf`);
  updateStatsAfterPDF();
}

// Stats
function getStats(){let s;try{s=JSON.parse(localStorage.getItem("istatistik")||"{}")}catch(e){s={}};if(!s.toplamPDF)s.toplamPDF=0;if(!s.siniflar)s.siniflar={};if(!s.populerKonu)s.populerKonu="-";return s}
function saveStats(s){localStorage.setItem("istatistik",JSON.stringify(s))}
function updateStatsAfterPDF(){const s=getStats();s.toplamPDF++;const sn=String(STATE.sinif);if(!s.siniflar[sn])s.siniflar[sn]={indirilenPDF:0};s.siniflar[sn].indirilenPDF++;if(!s.konular)s.konular={};s.konular[STATE.konu]=(s.konular[STATE.konu]||0)+1;let mk="-",mv=-1;Object.entries(s.konular).forEach(([k,v])=>{if(v>mv){mv=v;mk=k}});s.populerKonu=mk;saveStats(s)}
function renderIndexStats(){const s=getStats();const by=(id,v)=>{const el=document.getElementById(id); if(el) el.textContent=v};by("statTotalPDF",s.toplamPDF||0);by("statPopular",s.populerKonu||"-");by("statS1",s.siniflar?.["1"]?.indirilenPDF||0);by("statS2",s.siniflar?.["2"]?.indirilenPDF||0);by("statS3",s.siniflar?.["3"]?.indirilenPDF||0);by("statS4",s.siniflar?.["4"]?.indirilenPDF||0)}

// Feedback & Add Problem
function openFeedbackModal(){document.getElementById("feedbackModal")?.classList.remove("hidden");}
function closeFeedbackModal(){document.getElementById("feedbackModal")?.classList.add("hidden");}
function sendFeedback(){
  const ad=document.getElementById("fb_ad")?.value?.trim()||"";
  const metin=document.getElementById("fb_metin")?.value?.trim()||"";
  const out=document.getElementById("fb_sonuc");
  if(!metin){ if(out) out.textContent="Lütfen bir mesaj yazın."; return; }
  // save locally
  let arr=[]; try{arr=JSON.parse(localStorage.getItem("geriBildirimler")||"[]")}catch(e){arr=[]}
  arr.push({tarih:Date.now(),ad,metin}); localStorage.setItem("geriBildirimler",JSON.stringify(arr));
  if(out) out.textContent="Teşekkürler! Mesajınız kaydedildi.";
  // Optional: trigger user's default mail client without opening a blank tab
  const to="superrhoca@gmail.com";
  const subject="Problem Dünyası – Geri Bildirim";
  const body=encodeURIComponent((ad?("Ad: "+ad+"
"):"")+"Mesaj:
"+metin);
  window.location.href=`mailto:${to}?subject=${encodeURIComponent(subject)}&body=${body}`;
}?subject=${subject}&body=${body}`,"_blank")}
function saveUserProblem(){const ad=document.getElementById("ap_ad")?.value?.trim()||"";const sinif=document.getElementById("ap_sinif")?.value||"1";const konu=(document.getElementById("ap_konu")?.value||"Genel").trim();const metin=(document.getElementById("ap_metin")?.value||"").trim();const out=document.getElementById("ap_sonuc");if(!metin){if(out)out.textContent="Lütfen problem metni yazın.";return}let arr;try{arr=JSON.parse(localStorage.getItem("kullaniciProblemleri")||"[]")}catch(e){arr=[]}arr.push({tarih:Date.now(),ad,sinif,konu,metin});localStorage.setItem("kullaniciProblemleri",JSON.stringify(arr));if(out)out.textContent="Kaydedildi. Teşekkürler!";document.getElementById("ap_metin").value=""}

// Init
async function initSayfa(){
  const s=parseInt(getParam("sinif")||"1",10); STATE.sinif=s;
  const title=document.getElementById("baslik"); if(title) title.textContent=THEMES[s].name;
  $1
  if(!STATE.topics.length){
    STATE.konu = (Object.keys(FALLBACK_DB[s].pools||{})[0]) || "genel";
    showDataWarning("Veritabanı bulunamadı. Örnek konular yüklendi.");
  }
  const sel=document.getElementById("konuSelect");
  if(sel){ sel.innerHTML=""; (STATE.topics||[]).forEach(t=>{const op=document.createElement("option");op.value=t.key;op.textContent=t.label;sel.appendChild(op)}); if(STATE.konu) sel.value=STATE.konu; sel.addEventListener("change",e=>{STATE.konu=e.target.value;updateHeader();regenerate()}); }
  document.getElementById("zorluk")?.addEventListener("change",e=>STATE.zorluk=e.target.value);
  ["adSoyad","tarih","okul"].forEach(id=>{document.getElementById(id)?.addEventListener("input",()=>{STATE.adSoyad=document.getElementById("adSoyad")?.value||"";STATE.tarih=document.getElementById("tarih")?.value||"";STATE.okul=document.getElementById("okul")?.value||"";updateHeader()})});
  document.getElementById("olusturBtn")?.addEventListener("click",regenerate);
  document.getElementById("pdfBtn")?.addEventListener("click",exportPDF);
  document.getElementById("printBtn")?.addEventListener("click",()=>{updateHeader();window.print()});
  document.getElementById("cevapBtn")?.addEventListener("click",()=>{
    const ul=document.getElementById("cevapList"); if(!ul) return; ul.innerHTML="";
    const len=(STATE.questions||[]).length;
    for(let i=0;i<10;i++){const li=document.createElement("li");li.textContent=`${i+1}) `+(len?(STATE.questions[i%len].cevap||"(Cevap yok)"):"(Cevap yok)");ul.appendChild(li);}
    document.getElementById("cevapModal")?.classList.remove("hidden");
  });
  document.getElementById("closeModal")?.addEventListener("click",()=>document.getElementById("cevapModal")?.classList.add("hidden"));
  await regenerate();
}
function initIndex(){renderIndexStats();document.getElementById("ap_kaydet")?.addEventListener("click",saveUserProblem);document.getElementById("feedbackBtn")?.addEventListener("click",openFeedbackModal)}
window.initSayfa=initSayfa; window.initIndex=initIndex;
document.addEventListener("DOMContentLoaded",()=>{
  document.getElementById("feedbackBtn")?.addEventListener("click",openFeedbackModal);
  document.getElementById("fb_kapat")?.addEventListener("click",closeFeedbackModal);
  document.getElementById("fb_gonder")?.addEventListener("click",sendFeedback);
});


function showDataWarning(msg){
  const note = document.createElement('div');
  note.style.position='fixed'; note.style.left='50%'; note.style.transform='translateX(-50%)';
  note.style.bottom='16px'; note.style.background='#fff'; note.style.border='1px solid #E5E7EB';
  note.style.padding='10px 14px'; note.style.borderRadius='10px'; note.style.boxShadow='0 8px 24px rgba(0,0,0,.12)';
  note.style.zIndex='9999'; note.style.fontWeight='700';
  note.textContent = msg;
  document.body.appendChild(note);
  setTimeout(()=>note.remove(), 5000);
}
