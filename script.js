/* === Güvenli yol oluşturucu & güvenli JSON yükleyici === */
function basePath() {
  // Örn: https://kullanici.github.io/problemdunyasi/sayfa.html
  // path: /problemdunyasi/sayfa.html  → root: /problemdunyasi/
  const parts = location.pathname.split("/").filter(Boolean);
  // GitHub Pages repo adı varsa 1. parça root kabul edilir
  if (parts.length >= 1) return "/" + parts[0] + "/";
  return "/"; // düz kök
}
const ROOT = basePath();

function pathJoin(p) {
  // 'veritabani/...' → '/<repo>/veritabani/...'
  return (ROOT + p.replace(/^\/+/, "")).replace(/\/{2,}/g, "/");
}

async function safeJson(url) {
  const full = url.startsWith("http") ? url : pathJoin(url);
  try {
    const r = await fetch(full + (full.includes("?") ? "&" : "?") + "t=" + Date.now());
    if (!r.ok) throw new Error("HTTP " + r.status);
    return await r.json();
  } catch (e) {
    console.error("[safeJson] Yüklenemedi:", full, e);
    return null;
  }
}

// v6 – A4 sabit render: html2canvas + jsPDF
const THEMES={1:{name:"1. Sınıf"},2:{name:"2. Sınıf"},3:{name:"3. Sınıf"},4:{name:"4. Sınıf"}};
let STATE={sinif:1,konu:null,zorluk:"orta",topics:[],questions:[],adSoyad:"",tarih:"",okul:""};
function getParam(n){try{return new URL(window.location.href).searchParams.get(n)}catch{return null}}
function randInt(a,b){return Math.floor(Math.random()*(b-a+1))+a}
function pick(a){return a[Math.floor(Math.random()*a.length)]}
function shuffle(a){const arr=a.slice();for(let i=arr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]]}return arr}
async function safeJson(url){try{const r=await fetch(url+(url.includes('?')?'&':'?')+'v='+Date.now());if(!r.ok)throw 0;return await r.json()}catch(e){return null}}
async function loadTopics(s){const d=await safeJson(`veritabani/${s}sinif_konular.json`);if(Array.isArray(d)&&d.length)return d;return[{key:"toplama",label:"Toplama"},{key:"cikarma",label:"Çıkarma"},{key:"zaman",label:"Zaman"}]}
async function tryLoadPool(s,k){const d=await safeJson(`veritabani/${s}sinif_${k}.json`);return Array.isArray(d)&&d.length?d:null}
function genProblem(topic,lvl){const isim=["Ali","Ayşe","Can","Elif","İpek","Ömer","Deniz","Mira","Yusuf","Duru"];const nesne=["elma","kalem","kitap","balon","defter","bilet","simit","çikolata","silgi","oyuncak"];const n=pick(isim),it=pick(nesne),a=randInt(1,8*lvl),b=randInt(1,8*lvl);switch(topic){case"carpma":return`${n}, her pakette ${a} ${it} olan ${b} paket aldı. Toplam kaç ${it} vardır?`;case"bolme":return`${n}, ${a*b} ${it}i ${b} arkadaşına eşit paylaştırdı. Kişi başı kaç ${it} düşer?`;case"zaman":return`${n}, derse ${a} dk kala çıktı ve ${b} dk yürüdü. Derse yetişti mi?`;case"uzunluk":return`${n}, ${a} cm kurdele ile ${b} cm kurdeleyi birleştirdi. Toplam uzunluk kaç cm olur?`;case"paralarimiz":return`${n}'in ${a} TL'si vardı. ${b} TL harcadı. Kaç TL'si kaldı?`;case"kesirler":return`Bir pastanın ${a}/8'i yenildi, ${b}/8'i kaldı. Kalan ne kadardır?`;default:return`${n}, ${a} ${it} aldı, sonra ${b} tane daha aldı. Toplam kaç ${it} oldu?`;}}
function build(topic,level="orta",count=10){const lvl=level==="kolay"?1:level==="zor"?3:2;const out=[];for(let i=0;i<count;i++)out.push({soru:genProblem(topic,lvl)});return out}
async function regenerate(){let pool=null;if(STATE.sinif&&STATE.konu)pool=await tryLoadPool(STATE.sinif,STATE.konu);STATE.questions=(pool&&pool.length)?shuffle(pool).slice(0,10):build(STATE.konu,STATE.zorluk,10);render();updateHeader()}
function render(){const ol=document.getElementById("soruListe");if(!ol)return;ol.innerHTML="";for(let i=0;i<10;i++){const q=STATE.questions[i]?.soru||"";const li=document.createElement("li");li.className="qbox";const t=document.createElement("div");t.className="qtitle";t.textContent=`${i+1})`;const tx=document.createElement("div");tx.className="qtext";tx.textContent=q;const ls=document.createElement("div");ls.className="qlines";for(let k=0;k<5;k++){const l=document.createElement("div");l.className="qline";ls.appendChild(l)};li.appendChild(t);li.appendChild(tx);li.appendChild(ls);ol.appendChild(li)}}
function updateHeader(){const lbl=STATE.topics.find(t=>t.key===STATE.konu)?.label||STATE.konu||"";document.getElementById("h_ad").textContent=STATE.adSoyad||"";document.getElementById("h_tarih").textContent=STATE.tarih||"";document.getElementById("h_okul").textContent=STATE.okul||"";document.getElementById("h_sinifKonu").textContent=`${THEMES[STATE.sinif].name} / ${lbl}`;document.getElementById("h_zorluk").textContent=(STATE.zorluk||"orta").toUpperCase()}
async function exportPDF(){const el=document.getElementById("printArea");if(!el)return;const canvas=await html2canvas(el,{scale:2});const img=canvas.toDataURL("image/png");const {jsPDF}=window.jspdf;const pdf=new jsPDF("p","mm","a4");const w=pdf.internal.pageSize.getWidth();const h=pdf.internal.pageSize.getHeight();pdf.addImage(img,"PNG",0,0,w,h);pdf.save(`ProblemDünyası_${STATE.sinif}sinif_${STATE.konu||"genel"}.pdf`)}
async function initSayfa(){const s=parseInt(getParam("sinif")||"1",10);STATE.sinif=s;document.getElementById("baslik").textContent=THEMES[s].name;const ts=await loadTopics(s);STATE.topics=ts||[];STATE.konu=STATE.topics[0]?.key||"toplama";const sel=document.getElementById("konuSelect");sel.innerHTML="";STATE.topics.forEach(t=>{const op=document.createElement("option");op.value=t.key;op.textContent=t.label;sel.appendChild(op)});sel.value=STATE.konu;sel.addEventListener("change",e=>{STATE.konu=e.target.value;regenerate()});document.getElementById("zorluk").addEventListener("change",e=>STATE.zorluk=e.target.value);["adSoyad","tarih","okul"].forEach(id=>{document.getElementById(id).addEventListener("input",()=>{STATE.adSoyad=document.getElementById("adSoyad").value||"";STATE.tarih=document.getElementById("tarih").value||"";STATE.okul=document.getElementById("okul").value||"";updateHeader()})});document.getElementById("olusturBtn").addEventListener("click",regenerate);document.getElementById("pdfBtn").addEventListener("click",exportPDF);document.getElementById("printBtn").addEventListener("click",()=>{updateHeader();window.print()});await regenerate()}
window.initSayfa=initSayfa;
