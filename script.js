/* =========================
   Problem Dünyası – script.js
   (Maddeler 1–5 uygulanmış sürüm)
   ========================= */

/* === 1) Tek safeJson: göreli (relative) yol, GitHub Pages uyumlu ===
   NOT: veritabani/ klasörü sayfa.html ile AYNI klasörde olmalı. */
async function safeJson(relPath) {
  const url = String(relPath || "").replace(/^\/+/, ""); // baştaki /'ları kaldır
  try {
    const r = await fetch(url + (url.includes("?") ? "&" : "?") + "t=" + Date.now(), { cache: "no-store" });
    console.log("[safeJson] GET:", r.url, r.status);
    if (!r.ok) throw new Error("HTTP " + r.status + " for " + url);
    return await r.json();
  } catch (e) {
    console.error("[safeJson] HATA:", url, e);
    return null;
  }
}

/* === Tema ve durum === */
const THEMES = { 1:{name:"1. Sınıf"}, 2:{name:"2. Sınıf"}, 3:{name:"3. Sınıf"}, 4:{name:"4. Sınıf"} };

let STATE = {
  sinif: 1,
  konu: null,
  topics: [],        // {key, label}
  questions: [],     // {soru: "..."}
  adSoyad: "",
  tarih: ""
};

/* === Yardımcılar === */
function getParam(n){
  try { return new URL(window.location.href).searchParams.get(n); }
  catch { return null; }
}
function todayISO() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}
function $(sel){ return document.querySelector(sel); }
function setText(id, txt){ const el = document.getElementById(id); if (el) el.textContent = txt; }

/* === Konu listesi (veritabanından) ===
   Beklenen dosya: veritabani/1sinif_konular.json, 2sinif_konular.json, ... */
async function loadTopics(sinif){
  const d = await safeJson(`veritabani/${sinif}sinif_konular.json`);
  if (Array.isArray(d) && d.length) return d;
  return []; // otomatik konu üretimi yok
}

/* === Soru havuzu yükleme (yalnız veritabanı) ===
   Beklenen dosya: veritabani/<sinif>sinif_<konuKey>.json  (ör: 1sinif_toplama.json) */
async function tryLoadPool(sinif, konuKey){
  const path = `veritabani/${sinif}sinif_${konuKey}.json`;
  const d = await safeJson(path);
  return (Array.isArray(d) && d.length) ? d : null;
}

/* === 2) Sadece veritabanından sorular (otomatik üretim YOK) === */
async function regenerate(){
  if (!STATE.sinif || !STATE.konu) {
    alert("Sınıf ve konu seçiniz.");
    return;
  }
  const pool = await tryLoadPool(STATE.sinif, STATE.konu);
  if (!pool) {
    alert(`Veritabanında soru bulunamadı:\nveritabani/${STATE.sinif}sinif_${STATE.konu}.json`);
    STATE.questions = [];
    render();
    updateHeader();
    return;
  }
  STATE.questions = pool.slice(0, 10); // ilk 10
  render();
  updateHeader();
}

/* === 5) 10 kutu (5 sol + 5 sağ düzenine uygun) ===
   CSS tarafı iki sütun ise bu 10 kutu 5/5 olarak yerleşir. */
function render(){
  // Eski DOM yapın: <ol id="soruListe"> ... </ol> ise onu kullanıyoruz
  const ol = document.getElementById("soruListe");
  if (!ol) return;

  ol.innerHTML = "";
  // Daima 10 kutu
  for (let i=0; i<10; i++){
    const qtext = STATE.questions[i]?.soru || "";

    const li = document.createElement("li");
    li.className = "qbox";

    const t = document.createElement("div");
    t.className = "qtitle";
    t.textContent = `${i+1})`;

    const tx = document.createElement("div");
    tx.className = "qtext";
    tx.textContent = qtext;

    const ls = document.createElement("div");
    ls.className = "qlines";
    // Kalemle yazım için 3 çizgi (istersen arttır: 3→4/5)
    for (let k=0; k<3; k++){
      const l = document.createElement("div");
      l.className = "qline";
      ls.appendChild(l);
    }

    li.appendChild(t);
    li.appendChild(tx);
    li.appendChild(ls);
    ol.appendChild(li);
  }
}

/* === 4) Başlık güncelle (okul/zorluk kaldırıldı) === */
function updateHeader(){
  const lbl = STATE.topics.find(t => t.key === STATE.konu)?.label || STATE.konu || "";
  setText("h_sinifKonu", `${THEMES[STATE.sinif].name} / ${lbl}`);

  // İstersen ekranda yazsın diye:
  setText("h_ad", STATE.adSoyad || "");
  setText("h_tarih", STATE.tarih || "");
  // NOT: h_okul ve h_zorluk artık kullanılmıyor (kaldırıldı)
}

/* === 3) PDF: Orijinal görünümü korur + en üste başlık ekler
   Başlık ikinci satırda "Ad Soyad: .........   Tarih: ..../..../......"
   (öğrenci çıktı alınca kalemle doldurur) === */
async function exportPDF(){
  const root = document.getElementById("printArea") || document.getElementById("paper") || document.getElementById("questions") || document.querySelector(".questions-grid");
  if (!root){
    alert("PDF için içerik bulunamadı. (printArea/paper/questions)");
    return;
  }

  // Ekrandaki içerik görüntüsü
  const canvas = await html2canvas(root, { scale: 2 });
  const img = canvas.toDataURL("image/png");

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const W = pdf.internal.pageSize.getWidth();
  const H = pdf.internal.pageSize.getHeight();

  // Üst başlık
  const sinifName = THEMES[STATE.sinif]?.name || `${STATE.sinif}. Sınıf`;
  const konuLabel = STATE.topics.find(t => t.key === STATE.konu)?.label || STATE.konu || "Konu";

  let y = 14; // üst kenar
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.text(`${sinifName} – ${konuLabel}`, W/2, y, { align: "center" });

  y += 7;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);
  // Boş alanlı satır (öğrenci dolduracak)
  pdf.text(`Ad Soyad:  ..................................................        Tarih:  ......./....../......`, W/2, y, { align: "center" });

  y += 5;
  pdf.setDrawColor(0);
  pdf.setLineWidth(0.2);
  pdf.line(10, y, W-10, y); // ince ayıraç
  y += 3;

  // Görseli başlığın altına sığdır
  const leftMargin = 10, rightMargin = 10, bottomMargin = 10;
  const usableW = W - leftMargin - rightMargin;
  const remainH = H - y - bottomMargin;

  let imgW = usableW;
  let imgH = (canvas.height / canvas.width) * imgW;

  if (imgH > remainH){
    const scale = remainH / imgH;
    imgW *= scale;
    imgH *= scale;
  }
  pdf.addImage(img, "PNG", leftMargin, y, imgW, imgH, undefined, "FAST");

  const fname = `${sinifName.replace(/\s+/g,"")}_${(STATE.konu||"Konu").toString().replace(/\s+/g,"")}_${(STATE.tarih||todayISO())}.pdf`;
  pdf.save(fname);
}

/* === Sayfa başlatma === */
async function initSayfa(){
  // URL ile sınıf ön seçimi (sayfa.html?sinif=2)
  const pSinif = parseInt(getParam("sinif") || "1", 10);
  if ([1,2,3,4].includes(pSinif)) STATE.sinif = pSinif;

  // Konuları yükle
  STATE.topics = await loadTopics(STATE.sinif);
  // Varsayılan konu: listenin ilki
  STATE.konu = STATE.topics[0]?.key || null;

  // Form kancaları (varsa bağla)
  const selKonu = document.getElementById("konuSelect") || document.getElementById("konu");
  if (selKonu && STATE.topics.length){
    selKonu.innerHTML = "";
    STATE.topics.forEach(t => {
      const op = document.createElement("option");
      op.value = t.key;
      op.textContent = t.label;
      selKonu.appendChild(op);
    });
    selKonu.value = STATE.konu;
    selKonu.addEventListener("change", e => { STATE.konu = e.target.value; updateHeader(); });
  }

  // Ad Soyad / Tarih alanları (ekranda görünebilir, baskıda şart değil)
  const adEl = document.getElementById("adSoyad");
  const trEl = document.getElementById("tarih");
  if (trEl && !trEl.value) trEl.value = todayISO();

  adEl?.addEventListener("input", () => { STATE.adSoyad = adEl.value || ""; updateHeader(); });
  trEl?.addEventListener("input", () => { STATE.tarih   = trEl.value   || ""; updateHeader(); });

  // Butonlar
  const olusturBtn = document.getElementById("olusturBtn") || document.getElementById("btnOlustur");
  const pdfBtn     = document.getElementById("pdfBtn")     || document.getElementById("btnPDF");
  const printBtn   = document.getElementById("printBtn")   || document.getElementById("btnYazdir");

  olusturBtn?.addEventListener("click", regenerate);
  pdfBtn?.addEventListener("click", exportPDF);
  printBtn?.addEventListener("click", () => { updateHeader(); window.print(); });

  // İlk başlık ve (istersen) ilk yükleme
  updateHeader();
  // İlk anda otomatik soru çekmek istemezsen bu satırı kapat:
  // await regenerate();
}

/* Global */
window.initSayfa = initSayfa;
