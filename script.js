/* ==== GÜVENLİ YOL & JSON YÜKLEYİCİ (GitHub Pages alt dizini desteği) ==== */
function basePath() {
  const parts = location.pathname.split("/").filter(Boolean);
  // Örn: /problemdunyasi/sayfa.html → /problemdunyasi/
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

/* ==== Konu listesi yükleme (veritabanından) ==== */
async function loadKonular(sinif) {
  // Örn: veritabani/1sinif_konular.json  (Senin mevcut şeman)
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
    // Konu dosyası yoksa asla uydurma üretme
    const opt = document.createElement("option");
    opt.value = ""; opt.textContent = "Konu bulunamadı";
    sel.appendChild(opt);
  }
}

/* ==== Soruları veritabanından al (ASLA otomatik üretme) ==== */
async function getSorularFromDB(sinif, konuText) {
  // En çok kullanılan iki isim varyantını dene:
  // 1) veritabani/1/Toplama.json
  let db = await safeJson(`veritabani/${sinif}/${encodeURIComponent(konuText)}.json`);
  if (db && Array.isArray(db) && db.length) return db;

  // 2) veritabani/1/toplama.json (küçük harf/alt çizgi)
  const alt = konuText.toLowerCase().replace(/\s+/g, "_");
  db = await safeJson(`veritabani/${sinif}/${alt}.json`);
  if (db && Array.isArray(db) && db.length) return db;

  return null; // bulunamadı
}

/* ==== Soruları DOM'a yerleştir (tam 10 kutu, 5 sol + 5 sağ) ==== */
function render10Questions(list) {
  const wrap = $("#questions");
  wrap.innerHTML = "";

  // İlk 10’u al; 10’dan azsa uyar ve doldurma
  const arr = (list || []).slice(0, 10);

  if (arr.length < 10) {
    alert("Bu konu için veritabanında yeterli (10) soru yok. Lütfen veritabanını kontrol edin.");
  }

  // 10 kutuyu sabit oluştur (elde yoksa boş kutu bırak)
  for (let i = 0; i < 10; i++) {
    const item = arr[i];
    const text = item ? (item.soru || item.text || String(item)) : "";

    const q = document.createElement("div");
    q.className = "qbox";

    const qText = document.createElement("div");
    qText.className = "qtext";
    qText.textContent = text;

    // Cevap yazma çizgileri (3 satır)
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

/* ==== PDF oluşturma: yalnızca beyaz alan (paper) ==== */
async function createPDF() {
  const { jsPDF } = window.jspdf;
  const paper = document.getElementById("paper");
  if (!paper) { alert("Yazdırılacak alan bulunamadı."); return; }

  const canvas = await html2canvas(paper, { scale: 2 });
  const img = canvas.toDataURL("image/png");

  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  // Kenarlardan 0 taşırmadan sığdır
  const imgW = W;
  const imgH = (canvas.height / canvas.width) * imgW;
  let y = 0;
  if (imgH > H) {
    // Aşarsa eşit oranda küçült
    const scale = H / imgH;
    doc.addImage(img, "PNG", 0, 0, imgW * scale, H, undefined, "FAST");
  } else {
    // Ortala (isteğe bağlı): üstten başlayalım
    doc.addImage(img, "PNG", 0, y, imgW, imgH, undefined, "FAST");
  }

  // Dosya adı: 1Sinif_Toplama_YYYY-MM-DD.pdf
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

  // Konu listesi ilklendirme
  const sinifSel = $("#sinif");
  await loadKonular(sinifSel.value);

  // Başlık senkron
  function syncHeader() {
    const sTxt = $("#sinif").options[$("#sinif").selectedIndex]?.text || $("#sinif").value || "Sınıf";
    const kTxt = $("#konu").options[$("#konu").selectedIndex]?.text || $("#konu").value || "Konu";
    const ad   = $("#adsoyad").value.trim() || "Ad Soyad";
    const dt   = ($("#tarih").value || todayISO()).split("-").reverse().join(".");
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
      alert(`"${sinif}. sınıf / ${konuText}" için veritabanında soru bulunamadı.`);
      $("#questions").innerHTML = "";
      return;
    }
    render10Questions(list);
    // Başlık güncelle
    syncHeader();
  });

  // PDF / Yazdır
  $("#btnPDF").addEventListener("click", createPDF);
  $("#btnYazdir").addEventListener("click", () => window.print());
}

/* Global */
window.initSayfa = initSayfa;
