/* ==== ROOT & güvenli JSON (GitHub Pages alt dizin desteği) ==== */
function basePath() {
  const parts = location.pathname.split("/").filter(Boolean);
  // Örn: /problemdunyasi/sayfa.html -> /problemdunyasi/
  if (parts.length >= 1) return "/" + parts[0] + "/";
  return "/";
}
const ROOT = basePath();

function pathJoin(p) {
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

/* ==== Yardımcılar ==== */
function todayISO() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}
function $(sel) { return document.querySelector(sel); }
function setText(id, txt) { const el = document.getElementById(id); if (el) el.textContent = txt; }

/* ==== Konu listesi (veritabanından) ==== */
async function loadKonular(sinif) {
  // veritabani/1sinif_konular.json
  const list = await safeJson(`veritabani/${sinif}sinif_konular.json`);
  const sel = $("#konu");
  sel.innerHTML = "";

  if (list && Array.isArray(list) && list.length) {
    for (const k of list) {
      const opt = document.createElement("option");
      opt.value = (k.deger || k.value || k).toString();
      opt.textContent = (k.baslik || k.label || k).toString();
      sel.appendChild(opt);
    }
  } else {
    const opt = document.createElement("option");
    opt.value = ""; opt.textContent = "Konu bulunamadı";
    sel.appendChild(opt);
  }
}

/* ==== Sorular: sadece veritabanından ==== */
async function getSorularFromDB(sinif, konuText) {
  // 1) veritabani/1/Toplama.json
  let db = await safeJson(`veritabani/${sinif}/${encodeURIComponent(konuText)}.json`);
  if (db && Array.isArray(db) && db.length) return db;

  // 2) veritabani/1/toplama.json
  const alt = konuText.toLowerCase().replace(/\s+/g, "_");
  db = await safeJson(`veritabani/${sinif}/${alt}.json`);
  if (db && Array.isArray(db) && db.length) return db;

  return null; // yoksa otomatik üretim YOK
}

/* ==== 10 kutu (5 sol + 5 sağ) ==== */
function render10Questions(list) {
  const wrap = $("#questions");
  wrap.innerHTML = "";

  const arr = (list || []).slice(0, 10);

  if (arr.length < 10) {
    alert("Bu konu için veritabanında yeterli (10) soru yok. Lütfen veritabanını kontrol edin.");
  }

  for (let i = 0; i < 10; i++) {
    const item = arr[i];
    const text = item ? (item.soru || item.text || String(item)) : "";

    const q = document.createElement("div");
    q.className = "qbox";

    const qText = document.createElement("div");
    qText.className = "qtext";
    qText.textContent = text;

    const lines = document.createElement("div");
    lines.className = "answer-lines";
    for (let k = 0; k < 3; k++) {
      const line = document.createElement("div");
      line.className = "line";
      lines.appendChild(line);
    }

    q.appendChild(qText);
    q.appendChild(lines);
    wrap.appendChild(q);
  }
}

/* ==== PDF: sadece .paper alanını al ==== */
async function createPDF() {
  const { jsPDF } = window.jspdf;
  const paper = document.getElementById("paper");
  if (!paper) { alert("Yazdırılacak alan bulunamadı."); return; }

  const canvas = await html2canvas(paper, { scale: 2 });
  const img = canvas.toDataURL("image/png");

  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  let imgW = W;
  let imgH = (canvas.height / canvas.width) * imgW;

  if (imgH > H) {
    const scale = H / imgH;
    imgW = imgW * scale;
    imgH = imgH * scale;
  }
  doc.addImage(img, "PNG", 0, 0, imgW, imgH, undefined, "FAST");

  const sinifSel = $("#sinif");
  const konuSel  = $("#konu");
  const sinifTxt = sinifSel ? (sinifSel.options[sinifSel.selectedIndex]?.text || sinifSel.value || "Sinif") : "Sinif";
  const konuTxt  = konuSel  ? (konuSel.options[konuSel.selectedIndex]?.text  || konuSel.value  || "Konu")  : "Konu";
  const tarihISO = $("#tarih")?.value || todayISO();

  const fname = `${sinifTxt.replace(/\s+/g,"")}_${(konuTxt||"Konu").replace(/\s+/g,"")}_${tarihISO}.pdf`;
  doc.save(fname);
}

/* ==== Sayfa init ==== */
async function initSayfa() {
  // Varsayılan tarih
  const t = $("#tarih");
  if (t && !t.value) t.value = todayISO();

  // Konu listesi
  const sinifSel = $("#sinif");
  await loadKonular(sinifSel.value);

  // Başlık senkron
  function syncHeader() {
    const sEl = $("#sinif");
    const kEl = $("#konu");
    const sTxt = sEl ? (sEl.options[sEl.selectedIndex]?.text || sEl.value || "Sınıf") : "Sınıf";
    const kTxt = kEl ? (kEl.options[kEl.selectedIndex]?.text || kEl.value || "Konu") : "Konu";
    const ad   = $("#adsoyad")?.value.trim() || "Ad Soyad";
    const dt   = ($("#tarih")?.value || todayISO()).split("-").reverse().join(".");
    setText("hdrTitle", `${sTxt} – ${kTxt}`);
    setText("hdrName", ad);
    setText("hdrDate", dt);
  }

  ["change","input"].forEach(evt => {
    $("#sinif").addEventListener(evt, async e => {
      await loadKonular(e.target.value);
      syncHeader();
    });
    $("#konu").addEventListener(evt, syncHeader);
    $("#adsoyad").addEventListener(evt, syncHeader);
    $("#tarih").addEventListener(evt, syncHeader);
  });
  syncHeader();

  // Soruları yükle (veritabanından, otomatik üretim yok)
  $("#btnOlustur").addEventListener("click", async () => {
    const s = $("#sinif").value;
    const kSel = $("#konu");
    const kText = kSel.options[kSel.selectedIndex]?.text || kSel.value;

    const list = await getSorularFromDB(s, kText);
    if (!list || !list.length) {
      alert(`"${s}. sınıf / ${kText}" için veritabanında soru bulunamadı.`);
      $("#questions").innerHTML = "";
      return;
    }
    render10Questions(list);
    syncHeader();
  });

  // PDF / Yazdır
  $("#btnPDF").addEventListener("click", createPDF);
  $("#btnYazdir").addEventListener("click", () => window.print());
}

/* Global */
window.initSayfa = initSayfa;
