
// Helper: get query param
function qp(name){const url=new URL(window.location.href);return url.searchParams.get(name)}
// Slug util must mirror generator
function slugify(s){return s.toLowerCase().replaceAll(" ","_").replaceAll("ç","c").replaceAll("ğ","g").replaceAll("ı","i").replaceAll("ö","o").replaceAll("ş","s").replaceAll("ü","u")}

// Topics mapping (title + slug)
const TOPICS={
  1:[
    "Toplama Problemleri","Çıkarma Problemleri","Toplama ve Çıkarma Problemleri",
    "Deste ve Düzine Problemleri","Kesir Problemleri","Zaman Problemleri",
    "Uzunluk Problemleri","Sıvı Problemleri"
  ],
  2:[
    "Toplama İşlemi Problemleri","Çıkarma İşlemi Problemleri","Toplama ve Çıkarma İşlemi Problemleri",
    "Deste ve Düzine Problemleri","Çarpma İşlemi Problemleri","Bölme İşlemi Problemleri",
    "Kesir İşlemi Problemleri","Paralarımız Problemleri","Zaman Ölçme Problemleri",
    "Uzunluk Ölçme Problemleri","Sıvı Ölçme Problemleri"
  ],
  3:[
    "Toplama İşlemi Problemleri","Çıkarma İşlemi Problemleri","Toplama ve Çıkarma İşlemi Problemleri",
    "Çarpma İşlemi Problemleri","Bölme İşlemi Problemleri","Kesir İşlemi Problemleri",
    "Paralarımız Problemleri","Zaman Ölçme Problemleri","Uzunluk Ölçme Problemleri",
    "Çevre Ölçme Problemleri","Sıvı Ölçme Problemleri"
  ],
  4:[
    "Toplama İşlemi Problemleri","Çıkarma İşlemi Problemleri","Toplama ve Çıkarma İşlemi Problemleri",
    "Çarpma İşlemi Problemleri","Bölme İşlemi Problemleri","Kesir Problemleri",
    "Zaman Ölçme Problemleri","Uzunluk Ölçme Problemleri","Çevre Ölçme Problemleri",
    "Alan Ölçme Problemleri","Sıvı Ölçme Problemleri"
  ]
};

// Render class buttons on index
function renderClasses(){
  const host=document.querySelector("#classes");
  if(!host) return;
  [1,2,3,4].forEach(s=>{
    const el=document.createElement("a");
    el.className="card"; el.href=`konular.html?sinif=${s}`;
    el.innerHTML=`<h3>${s}. Sınıf</h3><p>${TOPICS[s].length} konu <span class="badge">Matematik</span></p>`;
    host.appendChild(el);
  });
}

// Render topics list per class
function renderTopics(){
  const s=parseInt(qp("sinif")||"0",10);
  const titleEl=document.querySelector("#title");
  const list=document.querySelector("#topic-list");
  if(!s||!TOPICS[s]) return;
  titleEl.textContent=`${s}. Sınıf Matematik Konuları`;
  TOPICS[s].forEach(t=>{
    const slug=slugify(t);
    const a=document.createElement("a");
    a.href=`problemler.html?sinif=${s}&konu=${slug}`;
    a.textContent=t;
    list.appendChild(a);
  })
}

// Render problems for a given topic
async function renderProblems(){
  const s=qp("sinif");
  const konu=qp("konu");
  if(!s||!konu) return;
  document.querySelector("#title").textContent=`${s}. Sınıf - ${konu.replaceAll("_"," ").toUpperCase()}`;
  const url=`veritabani/sinif${s}/${konu}.json`;
  try{
    const res=await fetch(url);
    const data=await res.json();
    const host=document.querySelector("#problem-list");
    let items=[...data.problemler];
    // Rastgele 10 seç; az ise hepsini göster
    items=items.sort(()=>Math.random()-.5).slice(0,10);
    items.forEach((p,idx)=>{
      const div=document.createElement("div");
      div.className="problem";
      div.innerHTML=`<strong>${idx+1}.</strong> ${p.soru}`;
      host.appendChild(div);
    });
  }catch(e){
    document.querySelector("#problem-list").innerHTML=`<div class='small'>Veri alınamadı: ${e}</div>`
  }
}

// PDF export with html2canvas + jsPDF (A4 portrait)
async function exportPDF(){
  const node=document.querySelector("#print-area");
  const canvas=await html2canvas(node,{scale:2});
  const imgData=canvas.toDataURL("image/png");
  const pdf=new jspdf.jsPDF("p","mm","a4");
  const pageWidth=210, pageHeight=297;
  const imgWidth=pageWidth-20;
  const imgHeight=canvas.height*imgWidth/canvas.width;
  let y=10;
  if(imgHeight<pageHeight-20){
    pdf.addImage(imgData,"PNG",10,y,imgWidth,imgHeight);
  }else{
    // Slice into multiple pages if needed
    let position=0;
    while(position<canvas.height){
      const pageCanvas=document.createElement("canvas");
      const scale=imgWidth/canvas.width;
      const sliceHeight=(pageHeight-20)/scale;
      pageCanvas.width=canvas.width;
      pageCanvas.height=sliceHeight;
      const ctx=pageCanvas.getContext("2d");
      ctx.drawImage(canvas,0,position,canvas.width,sliceHeight,0,0,canvas.width,sliceHeight);
      const pageData=pageCanvas.toDataURL("image/png");
      if(position>0) pdf.addPage();
      pdf.addImage(pageData,"PNG",10,10,imgWidth,(pageHeight-20));
      position+=sliceHeight;
    }
  }
  pdf.save("problemler.pdf");
}

// Attach listeners
document.addEventListener("DOMContentLoaded",()=>{
  renderClasses(); renderTopics(); renderProblems();
  const btn=document.querySelector("#pdf-btn");
  if(btn) btn.addEventListener("click",exportPDF);
});
