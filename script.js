
function qp(n){const u=new URL(window.location.href);return u.searchParams.get(n)}
function renderTopics(){
 const s=qp('sinif');const list=document.querySelector('#topic-list');const title=document.querySelector('#title');
 const topics={1:['Toplama Problemleri','Çıkarma Problemleri','Zaman Problemleri'],
 2:['Çarpma Problemleri','Bölme Problemleri','Kesir Problemleri'],
 3:['Kesir İşlemleri','Zaman Ölçme','Çevre Ölçme'],
 4:['Alan Ölçme','Zaman Ölçme','Sıvı Ölçme']};
 title.textContent=s+'. Sınıf Konuları';
 topics[s].forEach(t=>{const slug=t.toLowerCase().replace(/ /g,'_');const a=document.createElement('a');
 a.className='card';a.href='problemler.html?sinif='+s+'&konu='+slug;a.textContent=t;list.appendChild(a);});}
function renderProblems(){
 const s=qp('sinif'),k=qp('konu');if(!s||!k)return;
 fetch('veritabani/sinif'+s+'/'+k+'.json').then(r=>r.json()).then(d=>{
 const host=document.querySelector('#problem-list');d.problemler.forEach((p,i)=>{
 const div=document.createElement('div');div.className='problem';div.textContent=(i+1)+'. '+p.soru;host.appendChild(div);});
 document.querySelector('#title').textContent=s+'. Sınıf - '+d.konu;});}
document.addEventListener('DOMContentLoaded',()=>{if(document.querySelector('#topic-list'))renderTopics();if(document.querySelector('#problem-list'))renderProblems();
 const btn=document.querySelector('#pdf-btn');if(btn)btn.addEventListener('click',exportPDF);});
