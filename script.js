// Problem Dünyası v10.1 – Animasyonlu Tema (yalnızca veritabanı kullanır)
const THEMES={1:{name:"1. Sınıf"},2:{name:"2. Sınıf"},3:{name:"3. Sınıf"},4:{name:"4. Sınıf"}};
let STATE={sinif:1,konu:null,zorluk:"orta",topics:[],questions:[],adSoyad:"",tarih:"",okul:""};

function getParam(n){try{return new URL(window.location.href).searchParams.get(n)}catch{return null}}
function shuffle(a){const arr=a.slice();for(let i=arr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]]}return arr}
async function safeJson(url){try{const r=await fetch(url+(url.includes('?')?'&':'?')+'v='+Date.now());if(!r.ok)throw 0;return await r.json()}catch(e){return null}}

async function loadTopics(s){return await safeJson(`veritabani/${s}sinif_konular.json`)||[]}
async function tryLoadPool(s,k){return await safeJson(`veritabani/${s}sinif_${k}.json`)||[]}

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
  const canvas=await html2canvas(el,{scale:2}); const img=canvas.toDataURL("image/png");
  const {jsPDF}=window.jspdf; const pdf=new jsPDF("p","mm","a4");
  const w=pdf.internal.pageSize.getWidth(), h=pdf.internal.pageSize.getHeight();
  pdf.addImage(img,"PNG",0,0,w,h);
  const d=new Date().toISOString().slice(0,10);
  pdf.save(`ProblemDunyasi_${STATE.sinif}sinif_${STATE.konu}_${d}.pdf`);
}

// Stats
")}catch(e){s={}};if(!s.toplamPDF)s.toplamPDF=0;if(!s.siniflar)s.siniflar={};if(!s.populerKonu)s.populerKonu="-";return s}
;s.siniflar[sn].indirilenPDF++;if(!s.konular)s.konular={};s.konular[STATE.konu]=(s.konular[STATE.konu]||0)+1;let mk="-",mv=-1;Object.entries(s.konular).forEach(([k,v])=>{if(v>mv){mv=v;mk=k}});s.populerKonu=mk;saveStats(s)}
;by("statTotalPDF",s.toplamPDF||0);by("statPopular",s.populerKonu||"-");by("statS1",s.siniflar?.["1"]?.indirilenPDF||0);by("statS2",s.siniflar?.["2"]?.indirilenPDF||0);by("statS3",s.siniflar?.["3"]?.indirilenPDF||0);by("statS4",s.siniflar?.["4"]?.indirilenPDF||0)}

// Feedback & Add Problem
function openFeedback(){const to="superrhoca@gmail.com";const subject="Problem Dünyası – Geri Bildirim";const body="Merhaba,%0D%0A%0D%0A(Görüşlerinizi yazın)%0D%0A";window.open(`mailto:${to}?subject=${subject}&body=${body}`,"_blank")}
function saveUserProblem(){const ad=document.getElementById("ap_ad")?.value?.trim()||"";const sinif=document.getElementById("ap_sinif")?.value||"1";const konu=(document.getElementById("ap_konu")?.value||"Genel").trim();const metin=(document.getElementById("ap_metin")?.value||"").trim();const out=document.getElementById("ap_sonuc");if(!metin){if(out)out.textContent="Lütfen problem metni yazın.";return}let arr;try{arr=JSON.parse(localStorage.getItem("kullaniciProblemleri")||"[]")}catch(e){arr=[]}arr.push({tarih:Date.now(),ad,sinif,konu,metin});localStorage.setItem("kullaniciProblemleri",JSON.stringify(arr));if(out)out.textContent="Kaydedildi. Teşekkürler!";document.getElementById("ap_metin").value=""}

// Init
async function initSayfa(){
  const s=parseInt(getParam("sinif")||"1",10); STATE.sinif=s;
  const title=document.getElementById("baslik"); if(title) title.textContent=THEMES[s].name;
  const ts=await loadTopics(s); STATE.topics=ts||[]; STATE.konu=STATE.topics[0]?.key||null;
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
function initIndex(){
document.getElementById("ap_kaydet")?.addEventListener("click",saveUserProblem);document.getElementById("feedbackBtn")?.addEventListener("click",openFeedback)}
window.initSayfa=initSayfa; window.initIndex=initIndex;
