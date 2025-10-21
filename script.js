/* =========================
   Problem Dünyası – script.js
   (Konu menü butonları + veritabanı-only + tükenince devam + Yazdır/PDF başlık)
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

/* --- Yazdır başlığını senkronla --- */
function syncPrintBanner(){
  const sinifName = THEMES[STATE.sinif]?.name || `${STATE.sinif}. Sınıf`;
  const konuLabel = (STATE.topics.find(t => t.key === STATE.konu)?.label || STATE.konu || "Konu") + " Problemleri";
  const el = document.getElementById("pbTitle");
  if (el) el.textContent = `${sinifName} / ${konuLabel}`;
}

/* --- Konular (veritabanından) --- */
async function loadTopics(sinif){
  const d = await safeJson(`veritabani/${sinif}sinif_konular.json`);
  return (Array.isArray(d) && d.length) ? d : [];
}

/* --- Havuz yükleme (yalnız veritabanı) --- */
async function loadPool(sinif, konuKey){
  const path = `veritabani/${sinif}sinif_${konuKey}.json`;
  const d = await safeJson(path);
  return (Array.isArray(d) && d.length) ? d : null;
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

/* --- Başlık (ekran önizleme) --- */
function updateHeader(){
  setText("baslik", THEMES[STATE.sinif].name);
  setText("h_tarih", STATE.tarih || "");
  // Ad soyad için input yok; boş bırakıyoruz (öğrenci baskıda yazar)
  syncPrintBanner();
}

/* --- Konu menüsünü butonlarla çiz --- */
function renderKonuMenu(){
  const nav = document.getElementById("konuMenu");
  if (!nav) return;

  nav.innerHTML = "";
  STATE.topics.forEach(t => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "konu-btn" + (STATE.konu === t.key ? " active" : "");
    btn.textContent = t.label;
    btn.dataset.key = t.key;

    btn.addEventListener("click", async () => {
      STATE.konu = t.key;
      [...nav.querySelectorAll(".konu-btn")].forEach(b => b.classList.toggle("active", b.dataset.key === t.key));
      // havuz/used reset
      STATE._pool = null;
      STATE._poolKey = null;
      STATE.questions = [];
      updateHeader();
      // seçilen konuya ait 10 soru
      await regenerate();
      // buton görünür halde kalsın
      btn.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
    });

    nav.appendChild(btn);
  });
}

/* --- Yeni Kağıt: yalnız veritabanı + tükenince devam --- */
async function regenerate(){
  if (!STATE.sinif || !STATE.konu) { alert("Konu seçiniz."); return; }
  const poolKey = `${STATE.sinif}:${STATE.konu}`;

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

  // Kullanılmayanlar
  const available = [];
  for (const it of STATE._pool) {
    const key = normQ(it);
    if (!used.has(key)) available.push({ it, key });
  }
  // Karıştır
  for (let i = available.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [available[i], available[j]] = [available[j], available[i]];
  }
  // Önce kullanılmayanlardan doldur
  const out = [];
  const outKeys = new Set();
  while (out.length < 10 && available.length) {
    const x = available.pop();
    if (!outKeys.has(x.key)) { out.push(x.it); outKeys.add(x.key); }
  }
  // Eksikse: havuzdan (tekrar olabilir) doldur, 10 içinde tekrarsız
  if (out.length < 10) {
    const bag = STATE._pool.slice();
    for (let i = bag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [bag[i], bag[j]] = [bag[j], bag[i]];
    }
    for (const it of bag) {
      const k = normQ(it);
      if (!outKeys.has(k)) { out.push(it); outKeys.add(k); if (out.length >= 10) break; }
    }
  }
  // Çok küçük havuz ise yine de 10'a tamamla
  while (out.length < 10 && STATE._pool.length) {
    out.push(STATE._pool[Math.floor(Math.random() * STATE._pool.length)]);
  }

  // Son set tamamen aynıysa küçük değişiklik yap
  const nowKeys = new Set(out.map(normQ));
  let allSame = (lastKeys.size === 10);
  if (allSame) for (const k of nowKeys) { if (!lastKeys.has(k)) { allSame = false; break; } }
  if (allSame) {
    const bag = STATE._pool.slice().sort(() => Math.random() - 0.5);
    for (const it of bag) {
      const k = normQ(it);
      if (!nowKeys.has(k)) { out[0] = it; break; }
    }
  }

  // Kullanılmışlara ekle
  for (const it of out) used.add(normQ(it));

  STATE.questions = out;
  render();
  updateHeader();
}

/* --- PDF yardımcıları --- */
async function waitForFonts() {
  // Poppins gibi web fontlarının yüklenmesini bekle
  if (document.fonts && document.fonts.ready) {
    try { await document.fonts.ready; } catch {}
  }
}

/* --- PDF: Üstte BAŞLIK (HTML görüntüsüyle, Türkçe karakter sorunsuz), altında içerik görüntüsü
   NOT: PDF çekerken .paper-header geçici gizlenir (çift görünmeyi önler) --- */
async function exportPDF(){
  const root =
    document.getElementById("printArea") ||
    document.getElementById("paper") ||
    document.getElementById("questions") ||
    document.querySelector(".questions-grid");

  if (!root){ alert("PDF için içerik bulunamadı (printArea)."); return; }

  // Güncel metinler
  const sinifName = THEMES[STATE.sinif]?.name || `${STATE.sinif}. Sınıf`;
  const konuLabel = (STATE.topics.find(t => t.key === STATE.konu)?.label || STATE.konu || "Konu") + " Problemleri";

  // 1) Başlığı HTML olarak off-screen üret (Poppins ile), sonra görsel al
  await waitForFonts();

  const banner = document.createElement("div");
  banner.style.position = "fixed";
  banner.style.left = "-9999px";
  banner.style.top = "0";
  banner.style.width = "1000px";            // geniş tuval
  banner.style.background = "#fff";
  banner.style.color = "#000";
  banner.style.textAlign = "center";
  banner.style.padding = "6px 0 4px";
  banner.style.fontFamily = "'Poppins', Arial, sans-serif";
  banner.innerHTML = `
    <div style="font-weight:800;font-size:22px;line-height:1.2;">
      ${sinifName} / ${konuLabel}
    </div>
    <div style="font-size:13px;margin-top:6px;">
      Ad Soyad:  .................................................. &nbsp;&nbsp;&nbsp;&nbsp;
      Tarih:  ......./....../......
    </div>
    <div style="border-top:1px solid #000;margin:8px 40px 0;"></div>
  `;
  document.body.appendChild(banner);

  const bannerCanvas = await html2canvas(banner, { scale: 3, backgroundColor: "#ffffff" });
  const bannerImg = bannerCanvas.toDataURL("image/png");
  document.body.removeChild(banner);

  // 2) PDF alanını görüntüye çevirirken .paper-header'ı gizle (çift bilgi olmasın)
  const ph = root.querySelector(".paper-header");
  const prevDisp = ph ? ph.style.display : null;
  if (ph) ph.style.display = "none";

  // DOM boyansın
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

  const canvas = await html2canvas(root, { scale: 2 });
  const img = canvas.toDataURL("image/png");

  // Gizlemeyi geri al
  if (ph) ph.style.display = prevDisp ?? "";

  // 3) PDF oluştur ve resimleri yerleştir
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const W = pdf.internal.pageSize.getWidth();
  const H = pdf.internal.pageSize.getHeight();

  const left = 10, right = 10, bottom = 10;
  const topMargin = 10;     // sayfa üst boşluğu
  const gap = 3;            // başlık ile içerik arası

  // Başlık görselini yerleştir (sayfanın üstünde, Türkçe tam destek)
  const usableW = W - left - right;
  let bannerW = usableW;
  let bannerH = (bannerCanvas.height / bannerCanvas.width) * bannerW;
  pdf.addImage(bannerImg, "PNG", left, topMargin, bannerW, bannerH, undefined, "FAST");

  // İçerik görselini başlığın altına
  const remainH = H - (topMargin + bannerH + gap) - bottom;
  let imgW = usableW;
  let imgH = (canvas.height / canvas.width) * imgW;
  if (imgH > remainH) {
    const scale = remainH / imgH;
    imgW *= scale; imgH *= scale;
  }
  pdf.addImage(img, "PNG", left, topMargin + bannerH + gap, imgW, imgH, undefined, "FAST");

  const fname = `${sinifName.replace(/\s+/g,"")}_${(STATE.konu||"Konu").toString().replace(/\s+/g,"")}_${(STATE.tarih||todayISO())}.pdf`;
  pdf.save(fname);
}

/* --- Başlat --- */
async function initSayfa(){
  // URL ile sınıf
  const pSinif = parseInt(getParam("sinif") || "1", 10);
  if ([1,2,3,4].includes(pSinif)) STATE.sinif = pSinif;
  setText("baslik", THEMES[STATE.sinif].name);

  // Tarih default
  const trEl = document.getElementById("tarih");
  if (trEl && !trEl.value) trEl.value = todayISO();
  trEl?.addEventListener("input", () => { STATE.tarih = trEl.value || ""; updateHeader(); });

  // Konuları yükle ve menüyü çiz
  STATE.topics = await loadTopics(STATE.sinif);
  STATE.konu = STATE.topics[0]?.key || null;
  renderKonuMenu();

  // Butonlar
  document.getElementById("olusturBtn")?.addEventListener("click", regenerate);
  document.getElementById("pdfBtn")?.addEventListener("click", exportPDF);
  document.getElementById("printBtn")?.addEventListener("click", () => { updateHeader(); window.print(); });

  updateHeader();
}

/* Global */
window.initSayfa = initSayfa;