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
async function probeJSON(path){const b=await grab(path);if(!b)return null;try{return JSON.parse(await b.text())}catch(e){console.warn('Velumbra: JSON inválido em',RES+path);return null}}
/* counts the non-empty frames in each row of a sprite sheet */
function sheetScan(img,fw,fh){try{const W=img.width,H=img.height,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(img,0,0);
  const d=x.getImageData(0,0,W,H).data,cols=Math.max(1,Math.floor(W/fw)),rows=Math.max(1,Math.floor(H/fh)),out=[];
  for(let r=0;r<rows;r++){let last=-1;for(let k=0;k<cols;k++){let f=false;for(let yy=r*fh;yy<Math.min(H,(r+1)*fh)&&!f;yy+=2)for(let xx=k*fw;xx<Math.min(W,(k+1)*fw);xx+=2)if(d[(yy*W+xx)*4+3]>8){f=true;break}if(f)last=k}out.push(last+1)}return out}catch(e){return null}}
let FOLDER_FOUND=false,SHEET=null;
async function loadFolder(){const note=(grupo,arquivo,ok,nota)=>FOLDER.push({grupo,arquivo,ok,nota}),jobs=[];
  FOLDER_FOUND=!!(await grab('LEIA-ME.md'));if(!FOLDER_FOUND){renderFolderStatus();return}
  for(const[name,role]of[['titulo','display'],['texto','body']])jobs.push((async()=>{const f=await probe('fontes/'+name,EXT.fonte);
    if(!f)return note('Fontes','fontes/'+name+'.woff2 (ou .woff .ttf .otf)',null);
    try{await applyFont(role,f.blob);note('Fontes',f.file,true)}catch(e){note('Fontes',f.file,false,'arquivo de fonte inválido')}})());
  jobs.push((async()=>{const js=await probeJSON('personagem/personagem.json')||{},img0=await probe('personagem/personagem',EXT.sprite),
    opts={scale:+js.tamanho||1,flip:!!js.olha_esquerda,pixel:!!js.pixel,ink:!!js.contorno,glow:js.lanterna!==false,altura_ref:+js.altura_ref||0,fps:js.fps,animacoes:js.animacoes},
    resumo=spr=>Object.entries(spr.anims).map(([k,A])=>k.replace(/_/g,' ')+' '+A.frames.length).join(', ');
    try{
      const img=img0?await blobImg(img0.blob):null;if(img)SHEET={img,file:img0.file,json:js};
      if(js.frames){/* packed atlas: image + coordinates (TexturePacker or Aseprite JSON) */
        if(!img)return note('Personagem','personagem/personagem.png',false,'o personagem.json tem coordenadas, mas a imagem não foi encontrada');
        const spr=atlasSprite(img,js,opts);
        if(!Object.keys(spr.anims).length)return note('Personagem',img0.file,false,`${spr.count} quadros lidos, mas nenhum nome bate com as animações da lista`);
        ASSETS.player=Object.assign(spr,{blob:img0.blob});return note('Personagem',img0.file+' + personagem.json',true,`folha empacotada, ${spr.count} quadros · ${resumo(spr)}`)}
      if(js.modo==='fileiras'){/* irregular sheet in rows: figures found by transparency */
        if(!img)return note('Personagem','personagem/personagem.png',false,'o personagem.json pede o modo fileiras, mas a imagem não foi encontrada');
        const det=detectSprites(img,{limiar:js.limiar,juntar:js.juntar,minimo:js.minimo});SHEET.det=det;const spr=rowsSprite(img,det,opts),cont=det.rows.map((r,i)=>`F${i+1}: ${r.length}`).join(' · ');
        if(!Object.keys(spr.anims).length)return note('Personagem',img0.file+' + personagem.json',false,`${det.rows.length} fileiras encontradas (${cont}), mas nenhuma animação foi indicada em "animacoes". Use "Ver numeração da folha"`);
        ASSETS.player=Object.assign(spr,{blob:img0.blob});return note('Personagem',img0.file+' + personagem.json',true,`fileiras: ${det.rows.length} encontradas · ${resumo(spr)}`)}
      const keys=[...ANIM_KEYS,...FX_KEYS],fname=k=>'personagem/'+k.replace(/_/g,'-')+'-',
        first=await Promise.all(keys.map(async k=>[k,await probe(fname(k)+'01',EXT.sprite)]));
      if(first.some(([,f])=>f)){/* numbered frame files */
        const lists={};await Promise.all(first.map(async([k,f])=>{if(!f)return;const arr=[await blobImg(f.blob)];for(let i=2;i<100;i++){const g=await probe(fname(k)+String(i).padStart(2,'0'),EXT.sprite);if(!g)break;arr.push(await blobImg(g.blob))}lists[k]=arr}));
        const spr=framesSprite(lists,opts);ASSETS.player=spr;return note('Personagem','personagem/<animação>-01.png …',true,`quadros soltos · ${resumo(spr)}`)}
      if(!img)return note('Personagem','personagem/personagem.png',null);
      if(js.quadro&&js.animacoes){/* flexible grid: any rows, any animation */
        const cfg={fw:+js.quadro[0],fh:+js.quadro[1],...opts},spr=gridMapSprite(img,cfg,js.animacoes);
        if(!Object.keys(spr.anims).length)return note('Personagem',img0.file,false,'nenhuma animação válida em "animacoes"');
        ASSETS.player=Object.assign(spr,{blob:img0.blob});return note('Personagem',img0.file+' + personagem.json',true,`grade ${cfg.fw}×${cfg.fh} px · ${resumo(spr)}`)}
      /* default grid: 7 rows of square frames */
      const cell=Math.round(img.height/7),q=js.quadro||[cell,cell];
      if(cell>400||img.width>3000||!gridLooksValid(img,q[0],q[1]))return note('Personagem',img0.file,false,`não é uma grade regular (${img.width}×${img.height} px). Para folhas assim, use o modo fileiras ou coordenadas no personagem.json; enquanto isso Lume continua no lugar`);
      const counts=sheetScan(img,q[0],q[1])||[],anims={};
      ANIMS.forEach(([k],i)=>{const n=counts[i]||0;anims[k]=n?{row:i,frames:n,fps:(js.fps&&+js.fps[k])||FPS_DEF[k]}:{row:0,frames:counts[0]||1,fps:FPS_DEF.parado}});
      const cfg={fw:q[0],fh:q[1],scale:opts.scale,flip:opts.flip,pixel:opts.pixel,ink:opts.ink,glow:opts.glow,anims};ASSETS.player={...gridSprite(img,cfg),blob:img0.blob};fillPlayerForm(cfg);
      note('Personagem',img0.file,true,`grade de 7 linhas, quadro ${q[0]}×${q[1]} px · quadros por linha: ${ANIMS.map(([k],i)=>counts[i]||0).join(', ')}`)}
    catch(e){console.warn(e);note('Personagem',(img0&&img0.file)||'personagem/',false,'não consegui ler os arquivos')}})());
  for(const[file,k]of ENEMY_FILES)jobs.push((async()=>{const f=await probe('inimigos/'+file,EXT.sprite);if(!f)return note('Inimigos','inimigos/'+file+'.png',null);
    try{const img=await blobImg(f.blob),js=await probeJSON('inimigos/'+file+'.json')||{},q=js.quadro||[img.height,img.height],n=+js.quadros||((sheetScan(img,q[0],q[1])||[1])[0])||1;
      ASSETS.enemy[k]={...gridSprite(img,{fw:q[0],fh:q[1],scale:+js.tamanho||1,flip:!!js.olha_esquerda,pixel:!!js.pixel,ink:!!js.contorno,anims:{parado:{row:0,frames:n,fps:+js.fps||8}}}),blob:f.blob};note('Inimigos',f.file,true,`${n} quadro(s) de ${q[0]}×${q[1]} px`)}catch(e){note('Inimigos',f.file,false,'não consegui ler a imagem')}})());
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
