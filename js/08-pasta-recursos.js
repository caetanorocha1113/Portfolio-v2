/* ---------- automatic loading from the recursos/ folder ---------- */
/* Drop files with the names below into recursos/ and they load by themselves. Full list: recursos/LEIA-ME.md */
const RES='recursos/';
const ENEMY_FILES=[['besouro','crawler'],['mosca','flyer'],['saltador','hopper'],['aranha','spider'],['sentinela','sentinel'],['pendente','dropper'],['agua-viva','jelly']];
const SFX_FILES=[['pulo','pulo'],['salto-duplo','salto_duplo'],['pouso','pouso'],['passo','passo'],['golpe','golpe'],['acerto','acerto'],['dano','dano'],['coleta','coleta'],['avanco','avanco'],['morte','morte'],['inimigo-morre','inimigo_morre']];
const EXT={fonte:['woff2','woff','ttf','otf'],sprite:['png','webp'],fundo:['jpg','png','webp'],som:['ogg','mp3','wav'],musica:['mp3','ogg','m4a']};
const FOLDER=[];
async function grab(path){try{const r=await fetch(RES+path.split('/').map(encodeURIComponent).join('/'),{cache:'no-cache'});if(!r.ok)return null;if((r.headers.get('content-type')||'').includes('text/html'))return null;const b=await r.blob();return b.size?b:null}catch(e){return null}}
let INDEX_SET=null;
const noIndice=path=>!INDEX_SET||INDEX_SET.has(path.replace(/^\/+/,''));
async function probe(base,exts){for(const e of exts){const f=base+'.'+e;if(!noIndice(f))continue;const b=await grab(f);if(b)return{blob:b,file:f}}return null}
/* reads a JSON file; tolerates leftovers from copy-paste (``` fences, text before/after the braces) and reports real errors */
const JSON_ISSUES=[];
function lineCol(txt,pos){const pre=txt.slice(0,pos).split('\n');return`linha ${pre.length}, coluna ${pre[pre.length-1].length+1}`}
async function probeJSON(path){if(!noIndice(path))return null;const b=await grab(path);if(!b)return null;const txt=(await b.text()).replace(/^﻿/,'');
  try{return JSON.parse(txt)}catch(e1){const a=txt.indexOf('{'),z=txt.lastIndexOf('}');
    if(a>=0&&z>a){try{const v=JSON.parse(txt.slice(a,z+1));JSON_ISSUES.push({path,ok:true,msg:'havia texto fora das chaves { } (por exemplo ``` de um chat); foi ignorado, mas vale apagar do arquivo'});return v}catch(e2){
      const m=String(e2.message).match(/position (\d+)/),where=m?lineCol(txt,a+ +m[1]):'';JSON_ISSUES.push({path,ok:false,msg:`JSON inválido${where?' ('+where+')':''}: ${e2.message}`});return null}}
    JSON_ISSUES.push({path,ok:false,msg:'JSON inválido: não encontrei { }'});return null}}
/* image files directly inside a folder, from recursos/indice.json (generated on GitHub), in natural order (2 before 10) */
function listDir(dir){if(!INDEX)return null;const pre=dir.replace(/\/+$/,'')+'/';return INDEX.arquivos.filter(f=>f.startsWith(pre)&&!f.slice(pre.length).includes('/')&&/\.(png|webp)$/i.test(f)).sort((a,b)=>a.localeCompare(b,undefined,{numeric:true,sensitivity:'base'}))}
/* frames of one animation folder: every image listed in the index, or 1.png, 2.png… (01.png…) when there is no index */
async function loadFramesFrom(dir,bad){const out=[],files=listDir(dir);
  if(files){for(const f of files){const b=await grab(f);const fr=b&&await frameFromBlob(b);if(fr)out.push(fr);else bad.push(f)}return out}
  let pad=2,f=await probe(dir+'/01',['png']);if(!f){pad=1;f=await probe(dir+'/1',['png'])}
  for(let i=1;f&&i<200;i++){const fr=await frameFromBlob(f.blob);if(fr)out.push(fr);else bad.push(f.file);f=await probe(dir+'/'+String(i+1).padStart(pad,'0'),['png'])}return out}
function aliasSecs(r){const k=String(r).toLowerCase().trim(),out=[];secs.forEach((s,i)=>{if(s.id===k||String(i+1)===k||s.dataset.name.toLowerCase()===k||s.dataset.tema===k)out.push(i)});return out}
/* papéis (animações) que um inimigo pode ter; os que tocam uma vez e param no último quadro estão em PAPEL_UMA_VEZ */
const ENEMY_ROLES=['andar','parado','virar','alerta','preparar','atacar','recuperar','morrer','morrer_ar','projetil','projetil_fim','correr','pular','esquivar','defender','defender_cima',
  'preparar2','atacar2','recuperar2','preparar_cima','atacar_cima','recuperar_cima','escondido','surgir','sumir','fugir','explodir','ferido','dormir','acordar','fechar','fechado','abrir','descer','trabalhar','nuvem'];
const PAPEL_UMA_VEZ=new Set(['virar','alerta','preparar','atacar','recuperar','morrer','morrer_ar','projetil_fim','esquivar','defender','defender_cima','preparar2','atacar2','recuperar2',
  'preparar_cima','atacar_cima','recuperar_cima','surgir','sumir','explodir','ferido','acordar','fechar','abrir','descer']);
/* desenho de cada inimigo pelo nome da pasta (a Aspid Mother solta filhotes com o desenho do "filhote") */
const SPR_INIMIGO={};
async function loadCustomEnemies(note){const js=await probeJSON('inimigos/inimigos.json');
  if(!js)return note('Inimigos','inimigos/inimigos.json',null,'arquivo opcional: descreve os seus inimigos (veja o LEIA-ME)');
  const list=Array.isArray(js)?js:js.inimigos;if(!Array.isArray(list))return note('Inimigos','inimigos/inimigos.json',false,'precisa ter uma lista "inimigos": [ … ]');
  await Promise.all(list.map(async(d0,n)=>{const d={...d0,substituir:d0.substituir??js.substituir_originais},nome=d.nome||d.pasta||`inimigo ${n+1}`,erros=[];
    if(!d.pasta)return note('Inimigos','inimigos.json',false,`${nome}: falta "pasta"`);
    if(d.comportamento&&!BEHAVIOURS[d.comportamento])erros.push(`comportamento "${d.comportamento}" não existe (usei andar)`);
    const regions=[];for(const[r,q]of Object.entries(d.regioes||{})){const idx=aliasSecs(r);if(!idx.length)erros.push(`área ou tema "${r}" não existe`);else if(+q>0)idx.forEach(i=>regions.push([i,Math.min(12,+q)]))}
    if(!regions.length)erros.push('nenhuma área com quantidade maior que 0');
    const anims={},bad=[],A=d.animacoes||{};
    for(const k of Object.keys(A))if(!ENEMY_ROLES.includes(k))erros.push(`animação "${k}" não existe (veja a lista de papéis no LEIA-ME)`);
    const rep=d.repetir&&typeof d.repetir==='object'?d.repetir:{};
    for(const role of ENEMY_ROLES){const sub=A[role];if(!sub)continue;let fr=[];for(const p of(Array.isArray(sub)?sub:[sub]))fr=fr.concat(await loadFramesFrom(`inimigos/${d.pasta}/${p}`,bad));
      if(fr.length)anims[role]={frames:fr,fps:+(d.fps&&typeof d.fps==='object'?d.fps[role]:d.fps)||(role.startsWith('projetil')?14:10),loop:rep[role]!=null?!!rep[role]:!PAPEL_UMA_VEZ.has(role)};
      else erros.push(`animação ${role}: nenhuma imagem em "${d.pasta}/${[].concat(sub).join('" + "')}"`)}
    bad.forEach(f=>erros.push(`imagem vazia ou não encontrada: ${f}`));
    if(!anims.andar&&!anims.parado){erros.forEach(m=>note('Inimigos',nome,false,m));return note('Inimigos',nome,false,'precisa de pelo menos a animação "andar" ou "parado"')}
    const base=(anims.andar||anims.parado).frames.map(f=>f.oh).sort((a,b)=>a-b);
    /* olha_esquerda: true/false para todas as animações, ou por papel: { "padrao": true, "atacar": false } (quadros que viram para lados diferentes) */
    const oe=d.olha_esquerda,porPapel=oe&&typeof oe==='object',flip=porPapel?!!oe.padrao:!!oe;
    if(porPapel)for(const[k,v]of Object.entries(oe)){if(k==='padrao')continue;if(!ENEMY_ROLES.includes(k))erros.push(`olha_esquerda: papel "${k}" não existe`);else if(anims[k])anims[k].flip=!!v}
    const spr={kind:'inimigo',img:null,cfg:{scale:1,flip,pixel:!!d.pixel,ink:!!d.contorno},anims,refH:base[base.length>>1]||48};
    SPR_INIMIGO[d.pasta]={spr,def:d};
    if(d.filhote&&!list.some(o=>o.pasta===d.filhote))erros.push(`filhote "${d.filhote}" não é a pasta de nenhum inimigo da lista`);
    const placed=regions.length?addCustomEnemies(d,spr,regions):0;erros.forEach(m=>note('Inimigos',nome,false,m));
    note('Inimigos',nome,placed>0,`${placed} em ${regions.map(([i,q])=>secs[i].id+'×'+q).join(', ')||'—'} · ${d.comportamento||'andar'} · `+Object.entries(anims).map(([k,a])=>k+' '+a.frames.length).join(', '))}))}
/* one frame from a PNG: finds the drawing inside the image and anchors it by the feet,
   so frames cropped tight or with spare transparent space line up the same way */
async function frameFromBlob(blob){const img=await blobImg(blob),W=img.width,H=img.height,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(img,0,0);
  const d=x.getImageData(0,0,W,H).data;let t=H,b=-1,l=W,r=-1;for(let y=0;y<H;y++)for(let xx=0;xx<W;xx++)if(d[(y*W+xx)*4+3]>16){if(y<t)t=y;if(y>b)b=y;if(xx<l)l=xx;if(xx>r)r=xx}
  if(b<0)return null;const yA=b-Math.max(1,Math.round((b-t+1)*.2));let sx=0,n=0;for(let y=yA;y<=b;y++)for(let xx=l;xx<=r;xx++)if(d[(y*W+xx)*4+3]>16){sx+=xx;n++}
  const fx=n?sx/n+.5:(l+r+1)/2;return frameOf({img,sw:W,sh:H,tw:W,th:H,w:W,h:H,px:fx/W,py:(b+1)/H,cx:(l+r+1)/2/W,cy:(t+b+1)/2/H,oh:b-t+1,ow:r-l+1})}
/* counts the non-empty frames in each row of a sprite sheet */
function sheetScan(img,fw,fh){try{const W=img.width,H=img.height,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(img,0,0);
  const d=x.getImageData(0,0,W,H).data,cols=Math.max(1,Math.floor(W/fw)),rows=Math.max(1,Math.floor(H/fh)),out=[];
  for(let r=0;r<rows;r++){let last=-1;for(let k=0;k<cols;k++){let f=false;for(let yy=r*fh;yy<Math.min(H,(r+1)*fh)&&!f;yy+=2)for(let xx=k*fw;xx<Math.min(W,(k+1)*fw);xx+=2)if(d[(yy*W+xx)*4+3]>8){f=true;break}if(f)last=k}out.push(last+1)}return out}catch(e){return null}}
let FOLDER_FOUND=false,INDEX=null;
async function loadFolder(){const note=(grupo,arquivo,ok,nota)=>FOLDER.push({grupo,arquivo,ok,nota}),jobs=[];
  FOLDER_FOUND=!!(await grab('LEIA-ME.md'));if(!FOLDER_FOUND){renderFolderStatus();return}
  INDEX=await probeJSON('indice.json');if(INDEX&&Array.isArray(INDEX.arquivos)){INDEX_SET=new Set(INDEX.arquivos);note('Índice','indice.json',true,INDEX.arquivos.length+' arquivos listados')}else{INDEX=null;note('Índice','indice.json',null,'sem índice: o site procura só arquivos numerados (1.png, 2.png…)')}
  for(const[name,role]of[['titulo','display'],['texto','body']])jobs.push((async()=>{const cedo=window.CONTEUDO&&CONTEUDO.fontes&&CONTEUDO.fontes[name];if(cedo)return note('Fontes',cedo,true,'carregada no início');const f=await probe('fontes/'+name,EXT.fonte);
    if(!f)return note('Fontes','fontes/'+name+'.woff2 (ou .woff .ttf .otf)',null);
    try{await applyFont(role,f.blob);note('Fontes',f.file,true)}catch(e){note('Fontes',f.file,false,'arquivo de fonte inválido')}})());
  jobs.push((async()=>{const js=await probeJSON('personagem/settings.json')||{},
    opts={scale:+js.scale||1,flip:!!js.faces_left,pixel:!!js.pixel,ink:!!js.outline,glow:!!js.glow,altura_ref:+js.ref_height||0,fps:js.fps,repetir:js.loop};
    try{const lists={},vazios=[],customDirs=js.folders||{},customFiles=js.files||{};
      await Promise.all([...ANIM_KEYS,...FX_KEYS].map(async k=>{
        const fname=FOLDER_NAME[k];
        if(Array.isArray(customFiles[fname])&&customFiles[fname].length){
          const arr=[];
          for(const rel0 of customFiles[fname]){
            const rel=String(rel0).trim();
            if(!noIndice('personagem/'+rel)){vazios.push('personagem/'+rel);continue}
            const b=await grab('personagem/'+rel);
            if(!b){vazios.push('personagem/'+rel);continue}
            const fr=await frameFromBlob(b);
            if(fr)arr.push(fr);else vazios.push('personagem/'+rel);
          }
          if(arr.length)lists[k]=arr;
          return;
        }
        const sub=customDirs[fname]||fname;
        const dir='personagem/'+sub.replace(/^\/+|\/+$/g,'')+'/';
        let pad=2,f=await probe(dir+'01',['png']);if(!f){pad=1;f=await probe(dir+'1',['png'])}
        const arr=[];for(let i=1;f&&i<200;i++){const fr=await frameFromBlob(f.blob);if(fr)arr.push(fr);else vazios.push(f.file);f=await probe(dir+String(i+1).padStart(pad,'0'),['png'])}
        if(arr.length)lists[k]=arr;
      }));
      if(!Object.keys(lists).length)return note('Personagem','personagem/idle/1.png (ou configure files em settings.json)',null);
      if(!lists.parado)note('Personagem','personagem/idle/',false,'a pasta idle (parado) está vazia; enquanto isso, o 1º quadro de outra animação fica parado no lugar');
      vazios.forEach(v=>note('Personagem',v,false,'imagem vazia ou não encontrada'));
      const spr=framesSprite(lists,opts);ASSETS.player=spr;
      note('Personagem','personagem/settings.json',true,Object.keys(lists).map(k=>FOLDER_NAME[k]+' '+lists[k].length).join(', ')+(js.faces_left?' · virado com faces_left':''))}
    catch(e){console.warn(e);note('Personagem','personagem/',false,'não consegui ler os quadros')}})());
  for(const[file,k]of ENEMY_FILES)jobs.push((async()=>{const f=await probe('inimigos/'+file,EXT.sprite);if(!f)return note('Inimigos','inimigos/'+file+'.png',null);
    try{const img=await blobImg(f.blob),js=await probeJSON('inimigos/'+file+'.json')||{},q=js.quadro||[img.height,img.height],n=+js.quadros||((sheetScan(img,q[0],q[1])||[1])[0])||1;
      ASSETS.enemy[k]={...gridSprite(img,{fw:q[0],fh:q[1],scale:+js.tamanho||1,flip:!!js.olha_esquerda,pixel:!!js.pixel,ink:!!js.contorno,anims:{parado:{row:0,frames:n,fps:+js.fps||8}}}),blob:f.blob};note('Inimigos',f.file,true,`${n} quadro(s) de ${q[0]}×${q[1]} px`)}catch(e){note('Inimigos',f.file,false,'não consegui ler a imagem')}})());
  jobs.push(loadCustomEnemies(note));
  jobs.push((async()=>{const aj=await probeJSON('fundos/ajustes.json')||{};await Promise.all(secs.map(async(s,i)=>{const name=s.id,tema=s.dataset.tema,f=await probe('fundos/'+name,EXT.fundo)||await probe('fundos/'+tema,EXT.fundo);if(!f)return note('Fundos','fundos/'+name+' ou fundos/'+tema+' (.jpg .png .webp)',null);
    try{const o=aj[name]||aj[tema]||{};ASSETS.bg[i]={img:await blobImg(f.blob),blob:f.blob,cfg:{encaixe:o.encaixe||'cobrir',modo:o.modo||'substituir',opacidade:o.opacidade==null?1:+o.opacidade,sujeira:o.sujeira!==false}};rerenderSection(i);note('Fundos',f.file,true)}catch(e){note('Fundos',f.file,false,'não consegui ler a imagem')}}))})());
  for(const[file,k]of SFX_FILES)jobs.push((async()=>{const f=await probe('sons/'+file,EXT.som);if(!f)return SOM_PADRAO[k]&&INDEX?null:note('Sons','sons/'+file+'.ogg (ou .mp3 .wav)',null);
    try{ASSETS.sfx[k]=await decodeAudio(f.blob);note('Sons',f.file,true)}catch(e){note('Sons',f.file,false,'não consegui ler o áudio')}})());
  jobs.push(carregarMusicas(note));
  await Promise.all(jobs);
  carregarSonsPasta(note).then(()=>{renderFolderStatus();sfxStatus()});
  redistribuirInimigos();
  const grp=p=>p.startsWith('personagem/')?'Personagem':p.startsWith('inimigos/')?'Inimigos':p.startsWith('fundos/')?'Fundos':p.startsWith('musicas/')?'Músicas':p.startsWith('sons/')?'Sons':'Personagem';
  for(const q of JSON_ISSUES)note(grp(q.path),q.path,q.ok?null:false,q.msg);
  renderFolderStatus();sfxStatus();fillEnemyForm($('eKind').value);
  const ok=FOLDER.filter(x=>x.ok).length,bad=FOLDER.filter(x=>x.ok===false).length;console.info('Portfólio · pasta recursos/',FOLDER);
  if(bad)toast(`Pasta recursos: ${bad} arquivo(s) com problema (veja a Oficina).`)}
/* ---------- músicas da pasta ----------
   Com o índice, toda faixa de recursos/musicas/ entra na lista do player (cada uma só baixa quando toca).
   Cada área ganha uma faixa: o arquivo com o id da área (humanas.mp3…), o que estiver em musicas.json,
   ou a faixa de nome parecido na tabela abaixo. Se existir "<faixa> (Action)", ela toca durante os combates. */
const MUSICA_PADRAO={inicio:'dirtmouth',humanas:'city of tears',matematica:'crystal peak',linguagens:'forgotten crossroads',natureza:'greenpath',tecnico:'deepnest',trajetoria:'fungal wastes',sobre:'fog canyon'};
const MUSICA_SEGREDO='dream';
const urlRecurso=f=>RES+f.split('/').map(encodeURIComponent).join('/');
function addTrackUrl(url,title,region,id,tema){const el=new Audio();el.preload='none';el.src=url;const tr={id,title,region:region==null?-1:+region,tema:tema==null?null:+tema,builtin:false,el};MUS.list.push(tr);return tr}
async function carregarMusicas(note){const tit=await probeJSON('musicas/titulos.json')||{},cfg=await probeJSON('musicas/musicas.json')||{},ids=secs.map(s=>s.id),pasta=[];
  if(INDEX){const vistos=new Set(),arqs=INDEX.arquivos.filter(f=>/^musicas\/[^/]+\.(mp3|ogg|m4a)$/i.test(f)).sort((a,b)=>a.localeCompare(b,undefined,{numeric:true,sensitivity:'base'}));
    for(const f of arqs){const base=f.slice(8).replace(/\.[^.]+$/,'');if(vistos.has(base.toLowerCase()))continue;vistos.add(base.toLowerCase());
      const titulo=tit[base]||base.replace(/^\d+\s*[-.]?\s*/,''),reg=ids.indexOf(base.toLowerCase()),tema=TEMA_IDS.indexOf(base.toLowerCase());
      const tr=addTrackUrl(urlRecurso(f),titulo,reg,'pasta:'+base,tema>=0?tema:null);tr.base=base.toLowerCase();tr.nome=titulo.toLowerCase();pasta.push(tr)}}
  else{/* sem índice: só os nomes de área e de tema */
    const list=[...secs.map((s,i)=>[s.id,i,null]),...TEMA_IDS.map((n,t)=>[n,-1,t]),...[1,2,3,4,5].map(n=>['extra-'+n,-1,null])];
    const found=await Promise.all(list.map(async([n,i,t])=>[n,i,t,await probe('musicas/'+n,EXT.musica)]));
    for(const[n,i,t,f]of found){if(!f)continue;const tr=addUserTrack(f.blob,tit[n]||(i>=0?secs[i].dataset.name+' (sua faixa)':n),i,'pasta:'+n,t);tr.base=n;tr.nome=String(tr.title).toLowerCase();pasta.push(tr)}}
  if(!pasta.length){note('Músicas','musicas/<área ou tema>.mp3 (ou .ogg .m4a)',null,'sem faixas próprias: tocam as trilhas geradas');return}
  const acha=(q,exato)=>{if(!q)return null;q=String(q).toLowerCase().replace(/\.(mp3|ogg|m4a)$/,'').trim();return pasta.find(t=>t.base===q)||pasta.find(t=>t.nome===q)||(exato?null:pasta.find(t=>t.nome.startsWith(q))||pasta.find(t=>t.nome.includes(q)))};
  const areas=cfg.areas||{},comb=cfg.combate||{};
  ids.forEach((id,i)=>{let tr=pasta.find(t=>t.region===i);
    if(!tr){tr=acha(areas[id]||MUSICA_PADRAO[id]);if(tr&&!/\((action|bass|alt|sub)\)/i.test(tr.nome)||tr&&areas[id]){(tr.areas=tr.areas||[]).push(i)}else tr=null}
    if(tr){const tc=acha(comb[id]||tr.nome+' (action)',true);if(tc&&tc!==tr)(tc.combateDe=tc.combateDe||[]).push(i)}});
  const sg=acha(cfg.segredo||MUSICA_SEGREDO,true);if(sg)sg.segredo=true;
  /* as faixas geradas saem da lista quando a pasta tem as suas */
  const tocava=MUS.playing;if(tocava)musicPause();MUS.list=MUS.list.filter(t=>!t.builtin);MUS.idx=0;MUS.pos=0;
  const k=musicaSegue()?faixaDaArea(Math.max(0,lastIdx)):0;if(k>=0)MUS.idx=k;if(tocava)musicPlay();uiPlayer();renderMusicMgr();
  const porArea=ids.map((id,i)=>{const t=pasta.find(t=>t.region===i||(t.areas&&t.areas.includes(i)));return t?`${secs[i].dataset.name}: ${t.title}`:null}).filter(Boolean);
  note('Músicas','musicas/',true,`${pasta.length} faixa(s) na lista`);
  if(porArea.length)note('Músicas','áreas',true,porArea.join(' · '));
  const cb=pasta.filter(t=>t.combateDe);if(cb.length)note('Músicas','combate',true,cb.map(t=>t.title).join(' · '));
  if(sg)note('Músicas','salas secretas',true,sg.title)}

/* ---------- sons da pasta ----------
   Os nomes curtos (sons/pulo.ogg…) continuam valendo. Sem eles, o site reconhece os nomes do pacote do personagem
   (hero_jump.wav…) em qualquer subpasta de sons/; sons/sons.json troca qualquer um: { "pulo": "personagem/hero_jump.wav" }.
   Os que terminam em _loop… tocam em laço (passos correndo, deslizar na parede, queda longa). */
const SOM_PADRAO={pulo:['hero_jump'],salto_duplo:['hero_wings'],pouso:['hero_land_soft'],pouso_forte:['hero_land_hard'],avanco:['hero_dash'],nevoa:['hero_shade_dash_1','hero_shade_dash_2'],
  dano:['hero_damage'],morte:['hero_death_v2','hero_death_extra_details'],salto_parede:['hero_wall_jump'],faisca:['hero_fireball'],clarao:['hero_scream_spell'],queda:['hero_quake_spell_dash'],
  queda_impacto:['hero_quake_spell_impact'],corrida_carga:['hero_super_dash_charge'],corrida_disparo:['hero_super_dash_burst'],bloqueio:['hero_parry'],espada:['hero_unsheath'],
  loop_passos:['hero_run_footsteps_stone'],loop_passos_grama:['hero_run_footsteps_grass'],loop_passos_metal:['hero_run_footsteps_metal'],loop_parede:['hero_wall_slide'],loop_queda:['hero_falling'],loop_corrida:['hero_super_dash_loop']};
const SOM_NOME={pulo:'pulo',salto_duplo:'salto duplo',pouso:'pouso',pouso_forte:'pouso de longe',avanco:'avanço',nevoa:'passo de névoa',dano:'dano',morte:'morte',salto_parede:'salto na parede',faisca:'faísca',clarao:'clarão',queda:'queda',
  queda_impacto:'impacto da queda',corrida_carga:'carga da corrida',corrida_disparo:'disparo da corrida',bloqueio:'golpe no escudo',espada:'entrar no modo Jogo',loop_passos:'passos (pedra)',loop_passos_grama:'passos (grama)',loop_passos_metal:'passos (metal)',
  loop_parede:'deslizar na parede',loop_queda:'queda longa',loop_corrida:'corrida de cristal'};
const EVENTOS_INIMIGO=['alerta','ataque','tiro','laser','dano','bloqueio','morte','explosao','surgir','sumir','pulo','pouso','passo','asa','nuvem','esporo','pancada'];
async function carregarSonsPasta(note){if(!INDEX)return;
  const cfg=await probeJSON('sons/sons.json')||{},arqs=INDEX.arquivos.filter(f=>/^sons\/.+\.(wav|ogg|mp3)$/i.test(f)),porNome={};
  for(const f of arqs){const b=f.split('/').pop().replace(/\.[^.]+$/,'').toLowerCase();if(!porNome[b])porNome[b]=f}
  const fila=[];
  for(const[k,cands]of Object.entries(SOM_PADRAO)){if(ASSETS.sfx[k])continue;let f=cfg[k]?'sons/'+String(cfg[k]).replace(/^\/+|^sons\//g,''):null;if(f&&!INDEX_SET.has(f)){note('Sons',f,false,`sons.json: "${k}" aponta para um arquivo que não existe`);f=null}
    if(!f)for(const c of cands){if(porNome[c]){f=porNome[c];break}}if(f)fila.push([k,f,SOM_NOME[k]||k])}
  /* vozes próprias das criaturas: sons/inimigos/<pasta>/<evento>.wav */
  for(const f of arqs){const m=f.match(/^sons\/inimigos\/([^/]+)\/([^/]+)\.(wav|ogg|mp3)$/i);if(m&&EVENTOS_INIMIGO.includes(m[2].toLowerCase()))fila.push(['ini:'+m[1]+':'+m[2].toLowerCase(),f,m[1]+' · '+m[2]])}
  for(const[k,f,rot]of fila){const b=await grab(f);if(!b){note('Sons',f,false,'não encontrei o arquivo');continue}
    try{ASSETS.sfx[k]=await decodeAudio(b);note('Sons',f,true,rot)}catch(e){note('Sons',f,false,'não consegui ler o áudio')}}}
function renderFolderStatus(){const ul=$('folderList');if(!ul)return;ul.innerHTML='';
  for(const g of['Índice','Fontes','Personagem','Inimigos','Fundos','Sons','Músicas']){const items=FOLDER.filter(x=>x.grupo===g);if(!items.length)continue;const li=document.createElement('li'),b=document.createElement('b'),sub=document.createElement('ul');b.textContent=g;li.append(b,sub);
    items.sort((a,c)=>a.arquivo.localeCompare(c.arquivo)).forEach(x=>{const s=document.createElement('li');s.className=x.ok?'ok':x.ok===false?'bad':'off';s.textContent=(x.ok?'✓ ':x.ok===false?'✕ ':'· ')+x.arquivo+(x.nota?' — '+x.nota:'');sub.appendChild(s)});ul.appendChild(li)}
  if(!FOLDER_FOUND||!FOLDER.some(x=>x.ok!==null)){const p=document.createElement('li');p.className='off';p.textContent=FOLDER_FOUND?'A pasta existe, mas ainda não tem arquivos com os nomes da lista.':'Pasta recursos/ não encontrada aqui. Ela funciona no GitHub Pages e no servidor local; na prévia do claude.ai ela não existe.';ul.prepend(p)}}
function preferRegionTrack(){const k=faixaDaArea(Math.max(0,lastIdx));if(SET.follow&&k>=0&&!MUS.playing&&MUS.idx!==k){MUS.idx=k;MUS.pos=0;uiPlayer()}}


/* magia: fere as criaturas dentro da área (o escudo não segura; a concha fechada e quem está escondido, sim) */
function magiaEm(dentro){for(const list of ENEMIES)for(const e of list){if(!e.vis||e.dead>0||e.k==='jelly'||e.esconde)continue;const b=enemyBox(e);if(!dentro(b))continue;
  const r=ferirInimigo(e,2,{tipo:'magia',dir:PL.face,x:PL.x});if(r==='nada')continue;if(r==='bloqueio'){sfx('bloqueio',.7);continue}
  spawnFx('efeito_acerto',b.x,b.y,PL.face);if(r==='morte'){sfx('inimigo_morre');if(!e.temp)dropFrags(b.x,b.y,4)}}}
const PODER_ACAO={
  faisca(){
    PL.spellKind='lancar';PL.spellT=.45;heroAnimName='';
    spawnFx('efeito_faisca',PL.x+PL.face*44*K,PL.y-34*K,PL.face);
    sfx(ASSETS.sfx.faisca?'faisca':'golpe');
    magiaEm(b=>Math.sign(b.x-PL.x)===PL.face&&Math.abs(b.x-PL.x)<260*K&&Math.abs(b.y-(PL.y-32*K))<54*K);
  },
  queda(){
    PL.spellKind='mergulho';PL.spellT=.55;PL.vy=1100*K;PL.inv=.6;heroAnimName='';
    spawnFx('efeito_mergulho',PL.x,PL.y-16*K,PL.face);
    sfx(ASSETS.sfx.queda?'queda':'avanco');PL.quedaSom=true;
  },
  clarao(){
    PL.spellKind='clarao';PL.spellT=.45;heroAnimName='';
    spawnFx('efeito_clarao',PL.x,PL.y-76*K,PL.face);
    sfx(ASSETS.sfx.clarao?'clarao':'golpe');
    magiaEm(b=>Math.abs(b.x-PL.x)<95*K&&b.y<PL.y&&PL.y-b.y<190*K);
  },
  reacender(){
    if(PL.hp>=PL.max){toast('Vida já está cheia.');PL.luz+=33;return}
    PL.healT=.8;heroAnimName='';
    spawnFx('efeito_acender',PL.x,PL.y-36*K,PL.face);
    PL.hp=Math.min(PL.max,PL.hp+1);hudGame();sfx('coleta');
  },
  corrida(){
    PL.sdashCharge=.35;heroAnimName='';
    sfx('corrida_carga',.8);
    setTimeout(()=>{if(MODE==='play'&&PL.dead<=0){PL.sdash=.45;PL.sdashCharge=0;PL.vx=PL.face*980*K;PL.vy=0;spawnFx('efeito_disparo',PL.x,PL.y-32*K,PL.face);sfx(ASSETS.sfx.corrida_disparo?'corrida_disparo':'avanco')}},350);
  }
};