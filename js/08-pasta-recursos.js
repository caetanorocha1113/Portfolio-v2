/* ---------- automatic loading from the recursos/ folder ---------- */
/* Drop files with the names below into recursos/ and they load by themselves. Full list: recursos/LEIA-ME.md */
const RES='recursos/';
const REGION_FILES=secs.map(s=>s.id);
const ENEMY_FILES=[['besouro','crawler'],['mosca','flyer'],['saltador','hopper'],['aranha','spider'],['sentinela','sentinel'],['pendente','dropper'],['agua-viva','jelly']];
const SFX_FILES=[['pulo','pulo'],['salto-duplo','salto_duplo'],['pouso','pouso'],['passo','passo'],['golpe','golpe'],['acerto','acerto'],['dano','dano'],['coleta','coleta'],['avanco','avanco'],['morte','morte'],['inimigo-morre','inimigo_morre']];
const EXT={fonte:['woff2','woff','ttf','otf'],sprite:['png','webp'],fundo:['jpg','png','webp'],som:['ogg','mp3','wav'],musica:['mp3','ogg','m4a']};
const FOLDER=[];
async function grab(path){try{const r=await fetch(RES+path,{cache:'no-cache'});if(!r.ok)return null;if((r.headers.get('content-type')||'').includes('text/html'))return null;const b=await r.blob();return b.size?b:null}catch(e){return null}}
async function probe(base,exts){for(const e of exts){const b=await grab(base+'.'+e);if(b)return{blob:b,file:base+'.'+e}}return null}
/* reads a JSON file; tolerates leftovers from copy-paste (``` fences, text before/after the braces) and reports real errors */
const JSON_ISSUES=[];
function lineCol(txt,pos){const pre=txt.slice(0,pos).split('\n');return`linha ${pre.length}, coluna ${pre[pre.length-1].length+1}`}
async function probeJSON(path){const b=await grab(path);if(!b)return null;const txt=(await b.text()).replace(/^﻿/,'');
  try{return JSON.parse(txt)}catch(e1){const a=txt.indexOf('{'),z=txt.lastIndexOf('}');
    if(a>=0&&z>a){try{const v=JSON.parse(txt.slice(a,z+1));JSON_ISSUES.push({path,ok:true,msg:'havia texto fora das chaves { } (por exemplo ``` de um chat); foi ignorado, mas vale apagar do arquivo'});return v}catch(e2){
      const m=String(e2.message).match(/position (\d+)/),where=m?lineCol(txt,a+ +m[1]):'';JSON_ISSUES.push({path,ok:false,msg:`JSON inválido${where?' ('+where+')':''}: ${e2.message}`});return null}}
    JSON_ISSUES.push({path,ok:false,msg:'JSON inválido: não encontrei { }'});return null}}
/* one frame from a PNG: finds the drawing inside the image and anchors it by the feet,
   so frames cropped tight or with spare transparent space line up the same way */
async function frameFromBlob(blob){const img=await blobImg(blob),W=img.width,H=img.height,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(img,0,0);
  const d=x.getImageData(0,0,W,H).data;let t=H,b=-1,l=W,r=-1;for(let y=0;y<H;y++)for(let xx=0;xx<W;xx++)if(d[(y*W+xx)*4+3]>16){if(y<t)t=y;if(y>b)b=y;if(xx<l)l=xx;if(xx>r)r=xx}
  if(b<0)return null;const yA=b-Math.max(1,Math.round((b-t+1)*.2));let sx=0,n=0;for(let y=yA;y<=b;y++)for(let xx=l;xx<=r;xx++)if(d[(y*W+xx)*4+3]>16){sx+=xx;n++}
  const fx=n?sx/n+.5:(l+r+1)/2;return frameOf({img,sw:W,sh:H,tw:W,th:H,w:W,h:H,px:fx/W,py:(b+1)/H,cx:(l+r+1)/2/W,cy:(t+b+1)/2/H,oh:b-t+1})}
/* counts the non-empty frames in each row of a sprite sheet */
function sheetScan(img,fw,fh){try{const W=img.width,H=img.height,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(img,0,0);
  const d=x.getImageData(0,0,W,H).data,cols=Math.max(1,Math.floor(W/fw)),rows=Math.max(1,Math.floor(H/fh)),out=[];
  for(let r=0;r<rows;r++){let last=-1;for(let k=0;k<cols;k++){let f=false;for(let yy=r*fh;yy<Math.min(H,(r+1)*fh)&&!f;yy+=2)for(let xx=k*fw;xx<Math.min(W,(k+1)*fw);xx+=2)if(d[(yy*W+xx)*4+3]>8){f=true;break}if(f)last=k}out.push(last+1)}return out}catch(e){return null}}
let FOLDER_FOUND=false;
async function loadFolder(){const note=(grupo,arquivo,ok,nota)=>FOLDER.push({grupo,arquivo,ok,nota}),jobs=[];
  FOLDER_FOUND=!!(await grab('LEIA-ME.md'));if(!FOLDER_FOUND){renderFolderStatus();return}
  for(const[name,role]of[['titulo','display'],['texto','body']])jobs.push((async()=>{const f=await probe('fontes/'+name,EXT.fonte);
    if(!f)return note('Fontes','fontes/'+name+'.woff2 (ou .woff .ttf .otf)',null);
    try{await applyFont(role,f.blob);note('Fontes',f.file,true)}catch(e){note('Fontes',f.file,false,'arquivo de fonte inválido')}})());
  jobs.push((async()=>{const js=await probeJSON('personagem/settings.json')||{},
    opts={scale:+js.scale||1,flip:!!js.faces_left,pixel:!!js.pixel,ink:!!js.outline,glow:!!js.glow,altura_ref:+js.ref_height||0,fps:js.fps,repetir:js.loop};
    try{const lists={},vazios=[];
      await Promise.all([...ANIM_KEYS,...FX_KEYS].map(async k=>{const dir='personagem/'+FOLDER_NAME[k]+'/';let pad=2,f=await probe(dir+'01',['png']);if(!f){pad=1;f=await probe(dir+'1',['png'])}
        const arr=[];for(let i=1;f&&i<200;i++){const fr=await frameFromBlob(f.blob);if(fr)arr.push(fr);else vazios.push(f.file);f=await probe(dir+String(i+1).padStart(pad,'0'),['png'])}if(arr.length)lists[k]=arr}));
      if(!Object.keys(lists).length)return note('Personagem','personagem/idle/1.png (uma pasta por animação)',null);
      if(!lists.parado)note('Personagem','personagem/idle/',false,'a pasta idle (parado) está vazia; enquanto isso, o 1º quadro de outra animação fica parado no lugar');
      vazios.forEach(v=>note('Personagem',v,false,'imagem vazia (sem nenhum pixel visível)'));
      const spr=framesSprite(lists,opts);ASSETS.player=spr;
      note('Personagem','personagem/<pasta>/',true,Object.keys(lists).map(k=>FOLDER_NAME[k]+' '+lists[k].length).join(', ')+(js.faces_left?' · virado com faces_left':''))}
    catch(e){console.warn(e);note('Personagem','personagem/',false,'não consegui ler os quadros')}})());
  for(const[file,k]of ENEMY_FILES)jobs.push((async()=>{const f=await probe('inimigos/'+file,EXT.sprite);if(!f)return note('Inimigos','inimigos/'+file+'.png',null);
    try{const img=await blobImg(f.blob),js=await probeJSON('inimigos/'+file+'.json')||{},q=js.quadro||[img.height,img.height],n=+js.quadros||((sheetScan(img,q[0],q[1])||[1])[0])||1;
      ASSETS.enemy[k]={...gridSprite(img,{fw:q[0],fh:q[1],scale:+js.tamanho||1,flip:!!js.olha_esquerda,pixel:!!js.pixel,ink:!!js.contorno,anims:{parado:{row:0,frames:n,fps:+js.fps||8}}}),blob:f.blob};note('Inimigos',f.file,true,`${n} quadro(s) de ${q[0]}×${q[1]} px`)}catch(e){note('Inimigos',f.file,false,'não consegui ler a imagem')}})());
  jobs.push((async()=>{const aj=await probeJSON('fundos/ajustes.json')||{};await Promise.all(REGION_FILES.map(async(name,i)=>{const f=await probe('fundos/'+name,EXT.fundo);if(!f)return note('Fundos','fundos/'+name+'.jpg (ou .png .webp)',null);
    try{const o=aj[name]||{};ASSETS.bg[i]={img:await blobImg(f.blob),blob:f.blob,cfg:{encaixe:o.encaixe||'cobrir',modo:o.modo||'substituir',opacidade:o.opacidade==null?1:+o.opacidade,sujeira:o.sujeira!==false}};rerenderSection(i);note('Fundos',f.file,true)}catch(e){note('Fundos',f.file,false,'não consegui ler a imagem')}}))})());
  for(const[file,k]of SFX_FILES)jobs.push((async()=>{const f=await probe('sons/'+file,EXT.som);if(!f)return note('Sons','sons/'+file+'.ogg (ou .mp3 .wav)',null);
    try{ASSETS.sfx[k]=await decodeAudio(f.blob);note('Sons',f.file,true)}catch(e){note('Sons',f.file,false,'não consegui ler o áudio')}})());
  jobs.push((async()=>{const tit=await probeJSON('musicas/titulos.json')||{},list=[...REGION_FILES.map((n,i)=>[n,i]),...[1,2,3,4,5].map(n=>['extra-'+n,-1])],found=await Promise.all(list.map(async([n,i])=>[n,i,await probe('musicas/'+n,EXT.musica)]));
    for(const[n,i,f]of found){if(!f){if(i>=0)note('Músicas','musicas/'+n+'.mp3 (ou .ogg .m4a)',null);continue}addUserTrack(f.blob,tit[n]||(i>=0?secs[i].dataset.name+' (sua faixa)':n),i,'pasta:'+n);note('Músicas',f.file,true)}})());
  await Promise.all(jobs);
  const grp=p=>p.startsWith('personagem/')?'Personagem':p.startsWith('inimigos/')?'Inimigos':p.startsWith('fundos/')?'Fundos':p.startsWith('musicas/')?'Músicas':'Personagem';
  for(const q of JSON_ISSUES)note(grp(q.path),q.path,q.ok?null:false,q.msg);
  renderFolderStatus();sfxStatus();fillEnemyForm($('eKind').value);
  const ok=FOLDER.filter(x=>x.ok).length,bad=FOLDER.filter(x=>x.ok===false).length;console.info('Velumbra · pasta recursos/',FOLDER);
  if(ok||bad)toast(`Pasta recursos: ${ok} arquivo(s) carregado(s)`+(bad?`, ${bad} com problema (veja a Oficina).`:'.'))}
function renderFolderStatus(){const ul=$('folderList');if(!ul)return;ul.innerHTML='';
  for(const g of['Fontes','Personagem','Inimigos','Fundos','Sons','Músicas']){const items=FOLDER.filter(x=>x.grupo===g);if(!items.length)continue;const li=document.createElement('li'),b=document.createElement('b'),sub=document.createElement('ul');b.textContent=g;li.append(b,sub);
    items.sort((a,c)=>a.arquivo.localeCompare(c.arquivo)).forEach(x=>{const s=document.createElement('li');s.className=x.ok?'ok':x.ok===false?'bad':'off';s.textContent=(x.ok?'✓ ':x.ok===false?'✕ ':'· ')+x.arquivo+(x.nota?' — '+x.nota:'');sub.appendChild(s)});ul.appendChild(li)}
  if(!FOLDER_FOUND||!FOLDER.some(x=>x.ok!==null)){const p=document.createElement('li');p.className='off';p.textContent=FOLDER_FOUND?'A pasta existe, mas ainda não tem arquivos com os nomes da lista.':'Pasta recursos/ não encontrada aqui. Ela funciona no GitHub Pages e no servidor local; na prévia do claude.ai ela não existe.';ul.prepend(p)}}
function preferRegionTrack(){const i=Math.max(0,lastIdx),k=MUS.list.findIndex(t=>!t.builtin&&t.region===i);if(SET.follow&&k>=0&&!MUS.playing&&MUS.idx!==k){MUS.idx=k;MUS.pos=0;uiPlayer()}}
