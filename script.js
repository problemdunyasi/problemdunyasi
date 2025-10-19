/* ==== GÖRELİ (RELATIVE) JSON YÜKLEYİCİ — GITHUB PAGES UYUMLU ==== */
/* ÖNEMLİ: veritabani/ klasörü, sayfa.html ile AYNI klasörde olmalı. */
// (Mevcut safeJson'unu bununla değiştir)
async function safeJson(relPath, { silent = false } = {}) {
  const url = String(relPath || "").replace(/^\/+/, "");
  try {
    const r = await fetch(url + (url.includes("?") ? "&" : "?") + "t=" + Date.now(), { cache: "no-store" });
    console.log("[safeJson] GET:", r.url, r.status);
    if (!r.ok) throw new Error("HTTP " + r.status + " for " + url);
    return await r.json();
  } catch (e) {
    console.error("[safeJson] HATA:", url, e);
    if (!silent) alert("Veri yüklenemedi: " + url + "\nLütfen veritabani yolu/isimlerini kontrol edin.");
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

/* ==== Konu listesi (VERİTABANI) ==== */
/* Beklenen dosya: veritabani/1sinif_konular.json, 2sinif_konular.json, ... */
async function loadKonular(sinif) {
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
    opt.value = ""; opt.textContent = "Konu bulunamadı (veritabani/*sinif_konular.json?)";
    sel.appendChild(opt);
  }
}

// Türkçe karakterleri dosya adına uygun dönüştür (ı→i, İ→I, ş→s, ç→c, ğ→g, ö→o, ü→u)
function normalizeTr(text) {
  const map = { 'ı':'i','İ':'I','ş':'s','Ş':'S','ç':'c','Ç':'C','ğ':'g','Ğ':'G','ö':'o','Ö':'O','ü':'u','Ü':'U' };
  return text.replace(/[ıİşŞçÇğĞöÖüÜ]/g, ch => map[ch] || ch);
}

/* ==== Sorular: SADECE veritabanından (çoklu deneme) ==== */
async function getSorularFromDB(sinif, konuText) {
  // 1) Baz adları hazırla
  const original = (konuText || "").trim();
  const noTr     = normalizeTr(original);
  const lower    = original.toLowerCase();
  const lowerNoTr= normalizeTr(lower);

  // Boşluk / ayraç varyasyonları
  const variants = new Set([
    original,
    original.replace(/\s+/g, "_"),
    original.replace(/\s+/g, "-"),

    noTr,
    noTr.replace(/\s+/g, "_"),
    noTr.replace(/\s+/g, "-"),

    lower,
    lower.replace(/\s+/g, "_"),
    lower.replace(/\s+/g, "-"),

    lowerNoTr,
    lowerNoTr.replace(/\s+/g, "_"),
    lowerNoTr.replace(/\s+/g, "-"),

    // Noktalama ve fazla karakterleri temizleyen
    lowerNoTr.replace(/[^\w\-]+/g, "_"),
    lowerNoTr.replace(/[^\w\-]+/g, "-")
  ]);

  // 2) Klasör varyasyonları (senin yapına göre ikisi de denenir)
  const classDirs = [
    `veritabani/${sinif}/`,
    `veritabani/${sinif}sinif/`
  ];

  // 3) Uzantı / büyük-küçük
  const exts = [".json", ".JSON"];

  // 4) Sırayla hepsini dene (sessiz: true — pop-up yağmasın)
  for (const dir of classDirs) {
    // Önce "orijinal metni URL kodlayarak" dene (boşluk varsa %20)
    const encodedTry = await safeJson(`${dir}${encodeURIComponent(original)}.json`, { silent: true });
    if (encodedTry && Array.isArray(encodedTry) && encodedTry.length) return encodedTry;

    for (const base of variants) {
      for (const ext of exts) {
        const path = `${dir}${base}${ext}`;
        const data = await safeJson(path, { silent: true });
        if (data && Array.isArray(data) && data.length) {
          console.log("[DB bulundu] →", path);
          return data;
        }
      }
    }
  }

  // 5) Hâlâ yoksa, en son bir kez net uyarı ver
  alert(
    `Veritabanında soru dosyası bulunamadı.\n` +
    `Sınıf: ${sinif}\nKonu: ${konuText}\n\n` +
    `Denediğimiz örnek yollar:\n` +
    `- veritabani/${sinif}/${encodeURIComponent(original)}.json\n` +
    `- veritabani/${sinif}/${normalizeTr(lower).replace(/[^\w\-]+/g,"_")}.json\n` +
    `- veritabani/${sinif}sinif/${encodeURIComponent(original)}.json\n` +
    `- veritabani/${sinif}sinif/${normalizeTr(lower).replace(/[^\w\-]+/g,"_")}.json\n\n` +
    `Lütfen dosya adını/klasörünü buna uygun düzenleyin.`
  );
  return null;
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

/* ==== PDF: SADECE .paper alanını al ==== */
async function createPDF() {
  const { jsPDF } = window.jspdf;
  const paper = document.getElementById("paper");
  if (!paper) { alert("Yazdırılacak alan bulunamadı (#paper)."); return; }

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

  const sEl = $("#sinif"), kEl = $("#konu");
  const sinifTxt = sEl ? (sEl.options[sEl.selectedIndex]?.text || sEl.value || "Sinif") : "Sinif";
  const konuTxt  = kEl ? (kEl.options[kEl.selectedIndex]?.text  || kEl.value  || "Konu")  : "Konu";
  const tarihISO = $("#tarih")?.value || todayISO();

  const fname = `${sinifTxt.replace(/\s+/g,"")}_${(konuTxt||"Konu").replace(/\s+/g,"")}_${tarihISO}.pdf`;
  doc.save(fname);
}

/* ==== Sayfa init ==== */
async function initSayfa() {
  // Varsayılan tarih
  const t = $("#tarih");
  if (t && !t.value) t.value = todayISO();

  // Konu listesini veritabanından çek
  const sinifSel = $("#sinif");
  await loadKonular(sinifSel.value);

  // Başlık senkron (ekran önizlemesi)
  function syncHeader() {
    const sEl = $("#sinif"), kEl = $("#konu");
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

  // Soruları YÜKLE (yalnız veritabanından)
  $("#btnOlustur").addEventListener("click", async () => {
    const sinif = $("#sinif").value;
    const konuSel = $("#konu");
    const konuText = konuSel.options[konuSel.selectedIndex]?.text || konuSel.value;

    const list = await getSorularFromDB(sinif, konuText);
    if (!list || !list.length) {
      alert(`"${sinif}. sınıf / ${konuText}" için veritabanında soru bulunamadı.
Beklenen yollar:
- veritabani/${sinif}/${konuText}.json
- veritabani/${sinif}/${konuText.toLowerCase().replace(/\s+/g, "_")}.json`);
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
