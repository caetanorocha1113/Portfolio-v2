/* ---------- automatic loading from the recursos/ folder ---------- */
/* Drop files with the names below into recursos/ and they load by themselves. Full list: recursos/LEIA-ME.md */
const RES='recursos/';
const REGION_FILES=secs.map(s=>s.id);
const ENEMY_FILES=[['besouro','crawler'],['mosca','flyer'],['saltador','hopper'],['aranha','spider'],['sentinela','sentinel'],['pendente','dropper'],['agua-viva','jelly']];
const SFX_FILES=[['pulo','pulo'],['salto-duplo','salto_duplo'],['pouso','pouso'],['passo','passo'],['golpe','golpe'],['acerto','acerto'],['dano','dano'],['coleta','coleta'],['avanco','avanco'],['morte','morte'],['inimigo-morre','inimigo_morre']];
const EXT={fonte:['woff2','woff','ttf','otf'],sprite:['png','webp'],fundo:['jpg','png','webp'],som:['ogg','mp3','wav'],musica:['mp3','ogg','m4a']};
const FPS_DEF={parado:6,correr:12,pular:8,cair:8,golpe:18,avanco:12,dano:8};
const FOLDER=[];
async function grab(path){try{const r=await fetch(RES+path,{cache:'no-cache'});if(!r.ok)return null;if((r.headers.get('content-type')||'').includes('text/html'))return null;const b=await r.blob();return b.size?b:null}catch(e){return null}}
async function probe(base,exts){for(const e of exts){const b=await grab(base+'.'+e);if(b)return{blob:b,file:base+'.'+e}}return null}
async function probeJSON(path){const b=await grab(path);if(!b)return null;try{return JSON.parse(await b.text())}catch(e){console.warn('Velumbra: JSON inválido em',RES+path);return null}}
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
  jobs.push((async()=>{const f=await probe('personagem/personagem',EXT.sprite);if(!f)return note('Personagem','personagem/personagem.png',null);
    try{const img=await blobImg(f.blob),js=await probeJSON('personagem/personagem.json')||{},cell=Math.round(img.height/7),q=js.quadro||[cell,cell],counts=sheetScan(img,q[0],q[1])||[],A=js.animacoes||{},anims={};
      ANIMS.forEach(([k],i)=>{const o=A[k];if(o){anims[k]={row:+o[0]||0,frames:+o[1]||1,fps:+o[2]||FPS_DEF[k]};return}const n=counts[i]||0;anims[k]=n?{row:i,frames:n,fps:(js.fps&&+js.fps[k])||FPS_DEF[k]}:{row:0,frames:counts[0]||1,fps:FPS_DEF.parado}});
      ASSETS.player={img,blob:f.blob,cfg:{fw:q[0],fh:q[1],scale:+js.tamanho||1,flip:!!js.olha_esquerda,pixel:!!js.pixel,ink:!!js.contorno,glow:js.lanterna!==false,anims}};fillPlayerForm(ASSETS.player.cfg);
      note('Personagem',f.file,true,`quadro ${q[0]}×${q[1]} px · quadros por linha: ${ANIMS.map(([k],i)=>counts[i]||0).join(', ')}`)}catch(e){note('Personagem',f.file,false,'não consegui ler a imagem')}})());
  for(const[file,k]of ENEMY_FILES)jobs.push((async()=>{const f=await probe('inimigos/'+file,EXT.sprite);if(!f)return note('Inimigos','inimigos/'+file+'.png',null);
    try{const img=await blobImg(f.blob),js=await probeJSON('inimigos/'+file+'.json')||{},q=js.quadro||[img.height,img.height],n=+js.quadros||((sheetScan(img,q[0],q[1])||[1])[0])||1;
      ASSETS.enemy[k]={img,blob:f.blob,cfg:{fw:q[0],fh:q[1],scale:+js.tamanho||1,flip:!!js.olha_esquerda,pixel:!!js.pixel,ink:!!js.contorno,anims:{parado:{row:0,frames:n,fps:+js.fps||8}}}};note('Inimigos',f.file,true,`${n} quadro(s) de ${q[0]}×${q[1]} px`)}catch(e){note('Inimigos',f.file,false,'não consegui ler a imagem')}})());
  jobs.push((async()=>{const aj=await probeJSON('fundos/ajustes.json')||{};await Promise.all(REGION_FILES.map(async(name,i)=>{const f=await probe('fundos/'+name,EXT.fundo);if(!f)return note('Fundos','fundos/'+name+'.jpg (ou .png .webp)',null);
    try{const o=aj[name]||{};ASSETS.bg[i]={img:await blobImg(f.blob),blob:f.blob,cfg:{encaixe:o.encaixe||'cobrir',modo:o.modo||'substituir',opacidade:o.opacidade==null?1:+o.opacidade,sujeira:o.sujeira!==false}};rerenderSection(i);note('Fundos',f.file,true)}catch(e){note('Fundos',f.file,false,'não consegui ler a imagem')}}))})());
  for(const[file,k]of SFX_FILES)jobs.push((async()=>{const f=await probe('sons/'+file,EXT.som);if(!f)return note('Sons','sons/'+file+'.ogg (ou .mp3 .wav)',null);
    try{ASSETS.sfx[k]=await decodeAudio(f.blob);note('Sons',f.file,true)}catch(e){note('Sons',f.file,false,'não consegui ler o áudio')}})());
  jobs.push((async()=>{const tit=await probeJSON('musicas/titulos.json')||{},list=[...REGION_FILES.map((n,i)=>[n,i]),...[1,2,3,4,5].map(n=>['extra-'+n,-1])],found=await Promise.all(list.map(async([n,i])=>[n,i,await probe('musicas/'+n,EXT.musica)]));
    for(const[n,i,f]of found){if(!f){if(i>=0)note('Músicas','musicas/'+n+'.mp3 (ou .ogg .m4a)',null);continue}addUserTrack(f.blob,tit[n]||(i>=0?secs[i].dataset.name+' (sua faixa)':n),i,'pasta:'+n);note('Músicas',f.file,true)}})());
  await Promise.all(jobs);renderFolderStatus();sfxStatus();fillEnemyForm($('eKind').value);
  const ok=FOLDER.filter(x=>x.ok).length,bad=FOLDER.filter(x=>x.ok===false).length;console.info('Velumbra · pasta recursos/',FOLDER);
  if(ok||bad)toast(`Pasta recursos: ${ok} arquivo(s) carregado(s)`+(bad?`, ${bad} com problema (veja a Oficina).`:'.'))}
function renderFolderStatus(){const ul=$('folderList');if(!ul)return;ul.innerHTML='';
  for(const g of['Fontes','Personagem','Inimigos','Fundos','Sons','Músicas']){const items=FOLDER.filter(x=>x.grupo===g);if(!items.length)continue;const li=document.createElement('li'),b=document.createElement('b'),sub=document.createElement('ul');b.textContent=g;li.append(b,sub);
    items.sort((a,c)=>a.arquivo.localeCompare(c.arquivo)).forEach(x=>{const s=document.createElement('li');s.className=x.ok?'ok':x.ok===false?'bad':'off';s.textContent=(x.ok?'✓ ':x.ok===false?'✕ ':'· ')+x.arquivo+(x.nota?' — '+x.nota:'');sub.appendChild(s)});ul.appendChild(li)}
  if(!FOLDER_FOUND||!FOLDER.some(x=>x.ok!==null)){const p=document.createElement('li');p.className='off';p.textContent=FOLDER_FOUND?'A pasta existe, mas ainda não tem arquivos com os nomes da lista.':'Pasta recursos/ não encontrada aqui. Ela funciona no GitHub Pages e no servidor local; na prévia do claude.ai ela não existe.';ul.prepend(p)}}
function preferRegionTrack(){const i=Math.max(0,lastIdx),k=MUS.list.findIndex(t=>!t.builtin&&t.region===i);if(SET.follow&&k>=0&&!MUS.playing&&MUS.idx!==k){MUS.idx=k;MUS.pos=0;uiPlayer()}}
