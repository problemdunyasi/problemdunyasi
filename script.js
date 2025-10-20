/* =========================
   Problem Dünyası – script.js
   (Veritabanı-only + tükenince devam + PDF başlık)
   ========================= */

/* --- JSON yükleyici (göreli yol; GitHub Pages uyumlu) --- */
async function safeJson(relPath) {
  const url = String(relPath || "").replace(/^\/+/, "");
  try {
    const r = await fetch(url + (url.includes("?") ? "&" : "?") + "t=" + Date.now(), { cache: "no-store" });
    if (!r.ok) throw new Error("HTTP " + r.status + " for " + url);
    return await r.json();
  } catch (e) {
    console.error("[safeJson] HATA:", url, e);
    return null;
  }
}

/* --- Tema, durum --- */
const THEMES = { 1:{name:"1. Sınıf"}, 2:{name:"2. Sınıf"}, 3:{name:"3. Sınıf"}, 4:{name:"4. Sınıf"} };

let STATE = {
  sinif: 1,
  konu: null,
  topics: [],        // [{key,label}]
  questions: [],     // [{soru:"..."}]
  adSoyad: "",
  tarih: "",
  _pool: null,       // aktif havuz (dizi)
  _poolKey: null,    // "sinif:konu"
  _used: {}          // {"sinif:konu" : Set(normalizeEdilmisSoruMetni)}
};

/* --- Yardımcılar --- */
function getParam(n){ try { return new URL(location.href).searchParams.get(n); } catch { return null; } }
function todayISO(){
  const d = new Date();
  const m = String(d.getMonth()+1).padStart(2,"0");
  const day = String(d.getDate()).padStart(2,"0");
  return `${d.getFullYear()}-${m}-${day}`;
}
function $(sel){ return document.querySelector(sel); }
function setText(id, txt){ const el = document.getElementById(id); if (el) el.textContent = txt; }
function normQ(item){
  const txt = (item?.soru ?? String(item ?? "")).trim();
  return txt.toLowerCase().replace(/\s+/g, " ");
}

/* --- Konular (veritabanından) ---
   Beklenen: veritabani/1sinif_konular.json, 2sinif_konular.json, ... */
async function loadTopics(sinif){
  const d = await safeJson(`veritabani/${sinif}sinif_konular.json`);
  return (Array.isArray(d) && d.length) ? d : [];
}

/* --- Havuz yükleme (yalnız veritabanı) ---
   Beklenen: veritabani/<sinif>sinif_<konu>.json  (örn: 1sinif_toplama.json) */
async function loadPool(sinif, konuKey){
  const path = `veritabani/${sinif}sinif_${konuKey}.json`;
  const d = await safeJson(path);
  return (Array.isArray(d) && d.length) ? d : null;
}

/* --- Havuzdan kullanılmayanlardan mümkünse 10 seç, eksik kalırsa havuzdan doldur --- */
function pick10WithContinue(pool, usedSet, lastSetKeys = null) {
  // 1) Kullanılmayanları listele
  const available = [];
  for (const it of pool || []) {
    const key = normQ(it);
    if (!usedSet.has(key)) available.push({ it, key });
  }

  // 2) Karıştır
  for (let i = available.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [available[i], available[j]] = [available[j], available[i]];
  }

  // 3) Önce kullanılmayanlardan al
  const out = [];
  const outKeys = new Set();
  while (out.length < 10 && available.length) {
    const x = available.pop();
    if (!outKeys.has(x.key)) { out.push(x.it); outKeys.add(x.key); }
  }

  // 4) Eksikse: tüm havuzdan (tekrar olabilir) doldur ama 10 içinde tekrarsız olsun
  if (out.length < 10 && Array.isArray(pool) && pool.length) {
    // Havuzu karıştır ve sırayla doldur
    const bag = pool.slice();
    for (let i = bag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [bag[i], bag[j]] = [bag[j], bag[i]];
    }
    for (const it of bag) {
      const key = normQ(it);
      if (!outKeys.has(key)) {
        out.push(it); outKeys.add(key);
        if (out.length >= 10) break;
      }
    }
  }

  // 5) Çok ekstrem durumda hâlâ az kalırsa (havuz çok küçükse) tekrar da olsa doldur
  while (out.length < 10 && Array.isArray(pool) && pool.length) {
    out.push(pool[Math.floor(Math.random() * pool.length)]);
  }

  // 6) Son set ile birebir aynı 10’lu olmasın diye küçük kontrol
  if (lastSetKeys && lastSetKeys.size === 10) {
    const nowKeys = new Set(out.map(normQ));
    let allSame = true;
    for (const k of nowKeys) { if (!lastSetKeys.has(k)) { allSame = false; break; } }
    if (allSame) {
      // Bir daha karıştırıp küçük değişiklik yap
      const bag = pool.slice();
      for (let i = bag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [bag[i], bag[j]] = [bag[j], bag[i]];
      }
      // İlk elemanı değiştir
      for (const it of bag) {
        const key = normQ(it);
        if (!nowKeys.has(key)) {
          out[0] = it;
          break;
        }
      }
    }
  }

  return out;
}

/* --- 10 kutuyu DOM’a bas --- */
function render(){
  const ol = document.getElementById("soruListe");
  if (!ol) return;
  ol.innerHTML = "";

  for (let i = 0; i < 10; i++) {
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
    for (let k = 0; k < 3; k++) {
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

/* --- Başlık (ekrandaki önizleme) --- */
function updateHeader(){
  const lbl = STATE.topics.find(t => t.key === STATE.konu)?.label || STATE.konu || "";
  setText("h_sinifKonu", `${THEMES[STATE.sinif].name} / ${lbl}`);
  setText("h_ad", STATE.adSoyad || "");
  setText("h_tarih", STATE.tarih || "");
}

/* --- Yeni Kağıt: yalnız veritabanı + tükenince devam --- */
async function regenerate(){
  if (!STATE.sinif || !STATE.konu) {
    alert("Sınıf ve konu seçiniz.");
    return;
  }

  const poolKey = `${STATE.sinif}:${STATE.konu}`;

  // Havuzu yükle (konu/sınıf değiştiyse)
  if (!STATE._pool || STATE._poolKey !== poolKey) {
    const pool = await loadPool(STATE.sinif, STATE.konu);
    if (!pool) {
      alert(`Veritabanında soru bulunamadı: veritabani/${STATE.sinif}sinif_${STATE.konu}.json`);
      STATE.questions = [];
      render(); updateHeader();
      return;
    }
    STATE._pool = pool;
    STATE._poolKey = poolKey;
    if (!STATE._used[poolKey]) STATE._used[poolKey] = new Set();
  }

  const used = STATE._used[poolKey];
  const lastKeys = new Set(STATE.questions.map(normQ));

  // Kullanılmayanlardan seç; eksik kalırsa havuzdan doldur
  const next = pick10WithContinue(STATE._pool, used, lastKeys);

  // Kullanılmışlara ekle (yalnız yeni seçtiklerimizi işaretleyelim)
  for (const it of next) used.add(normQ(it));

  STATE.questions = next;
  render();
  updateHeader();
}

/* --- PDF: Orijinal görünümü koru + üst başlık (boş çizgili) --- */
async function exportPDF(){
  const root = document.getElementById("printArea") || document.getElementById("paper") || document.getElementById("questions") || document.querySelector(".questions-grid");
  if (!root){ alert("PDF için içerik bulunamadı (printArea)."); return; }

  const canvas = await html2canvas(root, { scale: 2 });
  const img = canvas.toDataURL("image/png");

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const W = pdf.internal.pageSize.getWidth();
  const H = pdf.internal.pageSize.getHeight();

  // Üst başlık (öğrenci yazsın diye boş çizgiler)
  const sinifName = THEMES[STATE.sinif]?.name || `${STATE.sinif}. Sınıf`;
  const konuLabel = STATE.topics.find(t => t.key === STATE.konu)?.label || STATE.konu || "Konu";

  let y = 14;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.text(`${sinifName} / ${konuLabel} Problemleri`, W/2, y, { align: "center" });
 
  y += 7;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);
  pdf.text(`Ad Soyad:  ..................................................        Tarih:  ......./....../......`, W/2, y, { align: "center" });

  y += 5;
  pdf.setDrawColor(0);
  pdf.setLineWidth(0.2);
  pdf.line(10, y, W-10, y);
  y += 3;

  // Görseli başlığın altına sığdır
  const left = 10, right = 10, bottom = 10;
  const usableW = W - left - right;
  const remainH = H - y - bottom;
  let imgW = usableW;
  let imgH = (canvas.height / canvas.width) * imgW;
  if (imgH > remainH) {
    const scale = remainH / imgH;
    imgW *= scale; imgH *= scale;
  }
  pdf.addImage(img, "PNG", left, y, imgW, imgH, undefined, "FAST");

  const fname = `${sinifName.replace(/\s+/g,"")}_${(STATE.konu||"Konu").toString().replace(/\s+/g,"")}_${(STATE.tarih||todayISO())}.pdf`;
  pdf.save(fname);
}

/* --- Başlat --- */
async function initSayfa(){
  // URL ile sınıf
  const pSinif = parseInt(getParam("sinif") || "1", 10);
  if ([1,2,3,4].includes(pSinif)) STATE.sinif = pSinif;
  setText("baslik", THEMES[STATE.sinif].name);

  // Konular
  STATE.topics = await loadTopics(STATE.sinif);
  STATE.konu = STATE.topics[0]?.key || null;

  // Form kancaları
  const selKonu = document.getElementById("konuSelect");
  if (selKonu) {
    selKonu.innerHTML = "";
    STATE.topics.forEach(t => {
      const op = document.createElement("option");
      op.value = t.key; op.textContent = t.label;
      selKonu.appendChild(op);
    });
    if (STATE.konu) selKonu.value = STATE.konu;
    selKonu.addEventListener("change", e => {
      STATE.konu = e.target.value;
      // Konu değişince havuz/sayaç sıfırlansın
      STATE._pool = null;
      STATE._poolKey = null;
      STATE.questions = [];
      render(); updateHeader();
    });
  }

  const adEl = document.getElementById("adSoyad");
  const trEl = document.getElementById("tarih");
  if (trEl && !trEl.value) trEl.value = todayISO();

  adEl?.addEventListener("input", () => { STATE.adSoyad = adEl.value || ""; updateHeader(); });
  trEl?.addEventListener("input", () => { STATE.tarih   = trEl.value   || ""; updateHeader(); });

  document.getElementById("olusturBtn")?.addEventListener("click", regenerate);
  document.getElementById("pdfBtn")?.addEventListener("click", exportPDF);
  document.getElementById("printBtn")?.addEventListener("click", () => { updateHeader(); window.print(); });

  updateHeader();
  // İlk yüklemede otomatik çekmek istersen aç:
  // await regenerate();
}

/* Global */
window.initSayfa = initSayfa;
