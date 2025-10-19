/* === Güvenli yol & JSON yükleyici (GitHub Pages alt dizini desteği) === */
function basePath() {
  const parts = location.pathname.split("/").filter(Boolean);
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

/* === Basit yardımcılar === */
function todayISO() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}
function $(sel) { return document.querySelector(sel); }
function setText(id, txt) { const el = document.getElementById(id); if (el) el.textContent = txt; }

/* === Konu listesi yükleme === */
async function loadKonular(sinif) {
  // Örn: veritabani/1sinif_konular.json
  const list = await safeJson(`veritabani/${sinif}sinif_konular.json`);
  const sel = $("#konu");
  sel.innerHTML = "";
  if (list && Array.isArray(list) && list.length) {
    for (const k of list) {
      const opt = document.createElement("option");
      opt.value = k.deger || k.value || k; // farklı şema destek
      opt.textContent = k.baslik || k.label || k.toString();
      sel.appendChild(opt);
    }
  } else {
    // Yedek konular
    ["Toplama","Çıkarma","Karışık İşlemler"].forEach(k=>{
      const opt = document.createElement("option");
      opt.value = k; opt.textContent = k; sel.appendChild(opt);
    });
  }
}

/* === Soru kaynağı ===
   Eğer veritabanında konuya özel soru dosyası varsa onu kullan,
   yoksa basit bir jeneratör doldursun. */
async function getSorular(sinif, konu) {
  // Örn: veritabani/1/Toplama.json (senin şemana göre gerekirse değiştir)
  // Önce düz isim: "veritabani/1/Toplama.json"
  let db = await safeJson(`veritabani/${sinif}/${encodeURIComponent(konu)}.json`);
  if (db && Array.isArray(db) && db.length) return db;

  // Alternatif adlar (küçük harf, alt çizgi)
  const alt = konu.toLowerCase().replace(/\s+/g, "_");
  db = await safeJson(`veritabani/${sinif}/${alt}.json`);
  if (db && Array.isArray(db) && db.length) return db;

  // Yedek üretici (4 işlemden toplama/çıkarma ağırlıklı basit sorular)
  const arr = [];
  const N = 20; // 2 sütun * 10 satır gibi
  for (let i=0;i<N;i++){
    const a = Math.floor(Math.random()*20)+1;
    const b = Math.floor(Math.random()*20)+1;
    const op = /top|add/i.test(konu) ? "+" : /çıkar|cikar|eksilt|minus/i.test(konu) ? "-" :
               Math.random()<0.5 ? "+" : "-";
    arr.push({soru: `${a} ${op} ${b} = ______`});
  }
  return arr;
}

/* === Soruları DOM'a bas === */
function renderSorular(list) {
  const wrap = $("#questions");
  wrap.innerHTML = "";
  list.forEach((item, idx) => {
    const d = document.createElement("div");
    d.className = "q";
    d.textContent = item.soru || item.text || String(item);
    wrap.appendChild(d);
  });
}

/* === PDF oluşturma (üstte büyük başlık + alt başlık) === */
async function createPDF() {
  const { jsPDF } = window.jspdf;

  const sinif = $("#sinif").value;
  const konuSel = $("#konu");
  const konu = konuSel.options[konuSel.selectedIndex]?.text || konuSel.value || "Konu";
  const adsoyad = $("#adsoyad").value.trim() || "Ad Soyad";
  const tarih = $("#tarih").value || todayISO();

  // Sayfa boyutu: A4 dikey (mm)
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const W = doc.internal.pageSize.getWidth();

  // --- ÜST BAŞLIK ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  const title = `${sinif}. Sınıf – ${konu}`;
  doc.text(title, W/2, 18, { align: "center" });

  // Ad Soyad & Tarih
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  const sub = `${adsoyad}   •   ${tarih.split("-").reverse().join(".")}`;
  doc.text(sub, W/2, 26, { align: "center" });

  // --- Sorular bölümünü görüntü olarak ekle ---
  // Sorular kapsayıcısını canvas'a çevir
  const qEl = document.getElementById("questions");
  if (!qEl || !qEl.children.length) {
    alert("Önce soruları oluştur.");
    return;
  }
  const canvas = await html2canvas(qEl, { scale: 2 });
  const img = canvas.toDataURL("image/png");

  // Görseli sayfaya en üste yakın (başlığın altına) yerleştir
  // Başlıklar toplam ~30mm kullanıyor, 32mm'den başlayalım
  const yStart = 32;
  const usableW = W - 20; // sağ-sol 10mm boşluk
  const imgW = usableW;
  const imgH = (canvas.height / canvas.width) * imgW;

  doc.addImage(img, "PNG", 10, yStart, imgW, imgH, undefined, "FAST");

  // Dosya adı örn: 1sinif_Toplama_2025-10-19.pdf
  const fname = `${sinif}sinif_${(konu||"Konu").replace(/\s+/g,"")}_${tarih}.pdf`;
  doc.save(fname);
}

/* === Sayfa init === */
async function initSayfa() {
  // Varsayılan tarih
  const tarih = $("#tarih");
  if (tarih && !tarih.value) tarih.value = todayISO();

  // Konu listesi ilk yükleme
  const sinifSel = $("#sinif");
  await loadKonular(sinifSel.value);

  // Önizleme başlıklarını senkron tut
  function syncHeader() {
    const s = $("#sinif").value;
    const konuSel = $("#konu");
    const k = konuSel.options[konuSel.selectedIndex]?.text || konuSel.value || "Konu";
    const ad = $("#adsoyad").value.trim() || "Ad Soyad";
    const t = ($("#tarih").value || todayISO()).split("-").reverse().join(".");
    setText("hdrTitle", `${s}. Sınıf – ${k}`);
    setText("hdrName", ad);
    setText("hdrDate", t);
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

  // Butonlar
  $("#btnOlustur").addEventListener("click", async () => {
    const s = $("#sinif").value;
    const konuSel = $("#konu");
    const k = konuSel.options[konuSel.selectedIndex]?.text || konuSel.value || "Konu";
    const list = await getSorular(s, k);
    renderSorular(list);
    // başlık önizlemesini güncel tut
    const ad = $("#adsoyad").value.trim() || "Ad Soyad";
    const t = ($("#tarih").value || todayISO()).split("-").reverse().join(".");
    setText("hdrTitle", `${s}. Sınıf – ${k}`);
    setText("hdrName", ad);
    setText("hdrDate", t);
  });

  $("#btnPDF").addEventListener("click", createPDF);
  $("#btnYazdir").addEventListener("click", () => window.print());
}

/* Global'e aç */
window.initSayfa = initSayfa;
