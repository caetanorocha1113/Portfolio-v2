/* ---------- interface: modes, HUD, player bar, input, workshop, guide ---------- */
const $=id=>document.getElementById(id);
const ICON={play:'<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>',pause:'<svg viewBox="0 0 24 24"><path d="M7 5h4v14H7zm6 0h4v14h-4z"/></svg>',vol:'<svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9zm12.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4z"/></svg>',mute:'<svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9zm16.6 0-1.4-1.4L17 9.8l-2.2-2.2-1.4 1.4 2.2 2.2-2.2 2.2 1.4 1.4 2.2-2.2 2.2 2.2 1.4-1.4-2.2-2.2z"/></svg>'};
function toast(msg,ms=2800){const t=$('toast');t.textContent=msg;t.hidden=false;requestAnimationFrame(()=>t.classList.add('on'));clearTimeout(toast.h);toast.h=setTimeout(()=>{t.classList.remove('on');setTimeout(()=>{if(!t.classList.contains('on'))t.hidden=true},400)},ms)}
function hudGame(){const hp=$('hpbar');if(hp.children.length!==PL.max){hp.innerHTML='';for(let k=0;k<PL.max;k++)hp.appendChild(document.createElement('i'))}[...hp.children].forEach((el,k)=>el.classList.toggle('on',k<PL.hp));$('fragc').textContent=PL.frags}
function updateModeUI(){$('mAuto').setAttribute('aria-pressed',MODE==='auto');$('mPlay').setAttribute('aria-pressed',MODE==='play')}
function showHint(on){$('hint').hidden=!on;clearTimeout(showHint.h);if(on)showHint.h=setTimeout(()=>{$('hint').hidden=true},9000)}
$('hintClose').onclick=()=>showHint(false);
$('mAuto').onclick=()=>setMode('auto');$('mPlay').onclick=e=>{audioWake(e);setMode('play')};
mapEls.forEach((a,i)=>a.addEventListener('click',e=>{if(MODE==='play'){e.preventDefault();teleportTo(i)}}));
document.getElementById('ascend').addEventListener('click',()=>{if(MODE==='play')teleportTo(0)});

/* input */
const KEYMAP={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down'};
const typing=e=>e.target&&e.target.closest&&e.target.closest('input,textarea,select,[contenteditable]');
addEventListener('keydown',e=>{if(typing(e))return;audioWake(e);
  if(e.code==='Escape'){closePanels();return}
  if(MODE!=='play'||paused)return;
  if(KEYMAP[e.code]){inp[KEYMAP[e.code]]=1;e.preventDefault()}
  if(e.code==='Space'||e.code==='KeyZ'){if(!e.repeat)jumpQ=.13;inp.jump=1;e.preventDefault()}
  if((e.code==='KeyJ'||e.code==='KeyX')&&!e.repeat){atkQ=.12;e.preventDefault()}
  if((e.code==='KeyK'||e.code==='KeyC'||e.code==='ShiftLeft'||e.code==='ShiftRight')&&!e.repeat){dashQ=.1;e.preventDefault()}
  if(['PageDown','PageUp','Home','End'].includes(e.code))e.preventDefault()});
addEventListener('keyup',e=>{if(KEYMAP[e.code])inp[KEYMAP[e.code]]=0;if(e.code==='Space'||e.code==='KeyZ')inp.jump=0});
addEventListener('blur',()=>{for(const k in inp)inp[k]=0});
addEventListener('pointerdown',audioWake);
addEventListener('wheel',e=>{if(MODE==='play'&&!e.target.closest('.panel,.pbar,.modal'))e.preventDefault()},{passive:false});
addEventListener('touchmove',e=>{if(MODE==='play'&&!e.target.closest('.panel,.pbar,.modal'))e.preventDefault()},{passive:false});
document.querySelectorAll('#pad [data-k]').forEach(b=>{const k=b.dataset.k;
  const on=e=>{e.preventDefault();try{b.setPointerCapture(e.pointerId)}catch(_){}audioWake(e);if(k==='jump'){jumpQ=.13;inp.jump=1}else if(k==='atk')atkQ=.12;else if(k==='dash')dashQ=.1;else inp[k]=1;b.classList.add('on')};
  const off=()=>{if(k in inp)inp[k]=0;b.classList.remove('on')};
  b.addEventListener('pointerdown',on);b.addEventListener('pointerup',off);b.addEventListener('pointercancel',off);b.addEventListener('lostpointercapture',off)});

/* music player */
const fmt=s=>{s=Math.max(0,s|0);return(s/60|0)+':'+String(s%60).padStart(2,'0')};
function drawCover(tr){const c=$('pcover').getContext('2d'),W=96,reg=tr.region!=null&&tr.region>=0?REG[tr.region]:null,p=reg?reg.p:{top:'#1a1426',bot:'#3a2c4a'},acc=LC[tr.region]||'#e8e0cf';
  const g=c.createLinearGradient(0,0,0,W);g.addColorStop(0,p.top);g.addColorStop(1,p.bot||p.far||'#222');c.fillStyle=g;c.fillRect(0,0,W,W);
  const rg=c.createRadialGradient(W/2,W*.62,0,W/2,W*.62,W*.5);rg.addColorStop(0,rgba(acc,.7));rg.addColorStop(1,rgba(acc,0));c.fillStyle=rg;c.fillRect(0,0,W,W);
  c.strokeStyle='#e8e0cf';c.lineWidth=2;c.lineCap='round';c.beginPath();c.moveTo(44,44);c.quadraticCurveTo(40,28,28,22);c.moveTo(52,44);c.quadraticCurveTo(56,28,68,22);c.stroke();
  c.fillStyle='#0b0910';c.beginPath();c.arc(48,56,13,0,TAU);c.fill();c.fillStyle='#ffbf5e';c.beginPath();c.arc(43,56,2.4,0,TAU);c.arc(53,56,2.4,0,TAU);c.fill();
  if(!tr.builtin){c.fillStyle='rgba(0,0,0,.5)';c.fillRect(0,W-22,W,22);c.fillStyle='#e8e0cf';c.font='12px serif';c.fillText('sua faixa',8,W-7)}}
function renderTrackList(){const ol=$('ptracks');ol.innerHTML='';MUS.list.forEach((t,k)=>{const li=document.createElement('li'),b=document.createElement('button');b.type='button';if(k===MUS.idx)b.className='on';
  b.innerHTML=`<span class="n">${k===MUS.idx&&MUS.playing?'♪':k+1}</span><span></span><span class="d">${t.builtin?fmt(t.dur):(t.region!=null&&t.region>=0?roman[t.region]:'·')}</span>`;b.children[1].textContent=t.title;b.onclick=()=>musicSelect(k,true);li.appendChild(b);ol.appendChild(li)})}
function uiPlayer(){const tr=curTrack();if(!tr)return;$('ptitle').textContent=tr.title;$('partist').textContent=tr.builtin?`Trilha de Velumbra · ${roman[tr.region]}`:(tr.region!=null&&tr.region>=0?`Sua faixa · Região ${roman[tr.region]}`:'Sua faixa');
  $('pplay').innerHTML=MUS.playing?ICON.pause:ICON.play;$('pplay').setAttribute('aria-label',MUS.playing?'Pausar':'Tocar');$('pmute').innerHTML=SET.muted?ICON.mute:ICON.vol;$('pmute').setAttribute('aria-label',SET.muted?'Ativar som da música':'Silenciar música');
  $('pfollow').setAttribute('aria-pressed',SET.follow);$('pvol').value=Math.round(SET.vol*100);drawCover(tr);renderTrackList()}
let seeking=false;
$('pplay').onclick=()=>musicToggle();$('pnext').onclick=()=>musicNext();$('pprev').onclick=()=>musicPrev();
$('pseek').addEventListener('input',()=>{seeking=true;$('pcur').textContent=fmt($('pseek').value/1000*musicDur())});
$('pseek').addEventListener('change',()=>{seeking=false;musicSeek($('pseek').value/1000*musicDur())});
$('pvol').addEventListener('input',()=>{setMusicVol($('pvol').value/100);if(SET.muted){setMuted(false);uiPlayer()}});
$('pmute').onclick=()=>{setMuted(!SET.muted);uiPlayer()};
$('pfollow').onclick=()=>{SET.follow=!SET.follow;saveSet();uiPlayer();$('setFollow').checked=SET.follow;toast(SET.follow?'A música acompanha a região.':'A música segue a lista.')};
$('plist').onclick=()=>{const b=$('plistbox');b.hidden=!b.hidden;$('plist').setAttribute('aria-expanded',!b.hidden)};
setInterval(()=>{const d=musicDur(),t=musicTime();$('pdur').textContent=fmt(d);if(!seeking){$('pcur').textContent=fmt(t);$('pseek').value=d?Math.round(t/d*1000):0}},250);

/* persistent storage for user files (this browser only) */
const IDB={db:null,
  open(){return new Promise(res=>{try{const rq=indexedDB.open('velumbra',1);rq.onupgradeneeded=()=>rq.result.createObjectStore('a');rq.onsuccess=()=>{IDB.db=rq.result;res(true)};rq.onerror=()=>res(false)}catch(e){res(false)}})},
  req(mode,fn){return new Promise(res=>{if(!IDB.db)return res(null);try{const st=IDB.db.transaction('a',mode).objectStore('a'),r=fn(st);r.onsuccess=()=>res(r.result);r.onerror=()=>res(null)}catch(e){res(null)}})},
  put(k,v){return IDB.req('readwrite',s=>s.put(v,k))},del(k){return IDB.req('readwrite',s=>s.delete(k))},clear(){return IDB.req('readwrite',s=>s.clear())},
  all(){return new Promise(res=>{if(!IDB.db)return res([]);try{const out=[],rq=IDB.db.transaction('a','readonly').objectStore('a').openCursor();rq.onsuccess=()=>{const c=rq.result;if(c){out.push([c.key,c.value]);c.continue()}else res(out)};rq.onerror=()=>res(out)}catch(e){res([])}})}};
async function blobImg(blob){try{return await createImageBitmap(blob)}catch(e){return await new Promise((res,rej)=>{const im=new Image();im.onload=()=>res(im);im.onerror=rej;im.src=URL.createObjectURL(blob)})}}
const FONT_DEF={display:"'Cinzel','Trajan Pro',Georgia,serif",body:"'Cormorant Garamond','Garamond',Georgia,serif"};let fontN=0;
async function applyFont(role,blob,gname){const prop=role==='display'?'--display':'--body',def=FONT_DEF[role];
  if(gname){gname=String(gname).replace(/[^\p{L}\p{N} ]/gu,'').trim();if(!gname)return;let l=$('gf-'+role);if(!l){l=document.createElement('link');l.rel='stylesheet';l.id='gf-'+role;document.head.appendChild(l)}l.href='https://fonts.googleapis.com/css2?family='+gname.replace(/ /g,'+')+'&display=swap';document.documentElement.style.setProperty(prop,`'${gname}',${def}`);return}
  if(!blob){document.documentElement.style.setProperty(prop,def);const l=$('gf-'+role);if(l)l.remove();return}
  const fam='VelumbraUser'+role+(++fontN),ff=new FontFace(fam,await blob.arrayBuffer());await ff.load();document.fonts.add(ff);document.documentElement.style.setProperty(prop,`'${fam}',${def}`)}
async function decodeAudio(blob){const C=audioInit();if(!C)throw new Error('sem áudio');const ab=await blob.arrayBuffer();return await new Promise((res,rej)=>{const p=C.decodeAudioData(ab,res,rej);if(p&&p.then)p.then(res,rej)})}
function addUserTrack(blob,title,region,id){const el=new Audio(URL.createObjectURL(blob));el.preload='metadata';const tr={id,title,region:region==null?-1:+region,builtin:false,el};MUS.list.push(tr);uiPlayer();renderMusicMgr();return tr}
function rerenderSection(i){if(drawn[i])renderSection(i)}

/* workshop */
const ANIMS=[['parado','Parado',0,1,6],['correr','Correr',1,6,12],['pular','Pular',2,2,8],['cair','Cair',3,2,8],['golpe','Golpe',4,4,16],['avanco','Avanço',5,2,12],['dano','Dano',6,1,6]];
const EKINDS=[['crawler','Besouro rastejante'],['flyer','Mosca voadora'],['hopper','Saltador de cogumelo'],['spider','Aranha do ninho'],['sentinel','Sentinela da cidadela'],['dropper','Criatura que desce do teto'],['jelly','Água-viva de luz']];
const SFXN=[['pulo','Pulo'],['salto_duplo','Salto duplo (asas)'],['pouso','Pouso'],['passo','Passo'],['golpe','Golpe da lanterna'],['acerto','Acerto no inimigo'],['dano','Lume leva dano'],['coleta','Coletar fragmento'],['avanco','Avanço'],['morte','Queda ou derrota'],['inimigo_morre','Inimigo derrotado']];
$('pAnims').innerHTML=ANIMS.map(([k,n,r,f,fps])=>`<tr><td>${n}</td><td><input type="number" id="pa-r-${k}" value="${r}" min="0" aria-label="Linha de ${n}"></td><td><input type="number" id="pa-f-${k}" value="${f}" min="1" aria-label="Quadros de ${n}"></td><td><input type="number" id="pa-s-${k}" value="${fps}" min="1" aria-label="FPS de ${n}"></td></tr>`).join('');
$('eKind').innerHTML=EKINDS.map(([k,n])=>`<option value="${k}">${n}</option>`).join('');
$('bReg').innerHTML=secs.map((s,i)=>`<option value="${i}">${roman[i]} · ${s.dataset.name}</option>`).join('');
const pending={};
function playerCfg(){const anims={};ANIMS.forEach(([k])=>anims[k]={row:+$('pa-r-'+k).value||0,frames:+$('pa-f-'+k).value||1,fps:+$('pa-s-'+k).value||8});return{fw:+$('pFw').value||64,fh:+$('pFh').value||64,scale:+$('pSc').value||1,flip:$('pFlip').checked,pixel:$('pPix').checked,ink:$('pInk').checked,glow:$('pGlow').checked,anims}}
function fillPlayerForm(cfg){if(!cfg)return;$('pFw').value=cfg.fw;$('pFh').value=cfg.fh;$('pSc').value=cfg.scale;$('pFlip').checked=!!cfg.flip;$('pPix').checked=!!cfg.pixel;$('pInk').checked=cfg.ink!==false;$('pGlow').checked=cfg.glow!==false;ANIMS.forEach(([k])=>{const a=cfg.anims&&cfg.anims[k];if(a){$('pa-r-'+k).value=a.row;$('pa-f-'+k).value=a.frames;$('pa-s-'+k).value=a.fps}})}
function enemyCfg(){const fr=+$('eFr').value||1,fps=+$('eFps').value||8;return{fw:+$('eFw').value||48,fh:+$('eFh').value||32,scale:+$('eSc').value||1,flip:$('eFlip').checked,pixel:$('ePix').checked,ink:$('eInk').checked,anims:{parado:{row:0,frames:fr,fps}}}}
function fillEnemyForm(k){const e=ASSETS.enemy[k],cfg=e&&e.cfg;if(!cfg)return;$('eFw').value=cfg.fw;$('eFh').value=cfg.fh;$('eSc').value=cfg.scale;$('eFr').value=cfg.anims.parado.frames;$('eFps').value=cfg.anims.parado.fps;$('eFlip').checked=!!cfg.flip;$('ePix').checked=!!cfg.pixel;$('eInk').checked=cfg.ink!==false}
$('pImg').onchange=async e=>{const f=e.target.files[0];if(!f)return;pending.player={blob:f,img:await blobImg(f)};const im=pending.player.img;if(im.width&&+$('pFh').value>im.height)$('pFh').value=im.height;toast('Folha carregada. Ajuste os quadros e aplique.')};
$('pApply').onclick=async()=>{const src=pending.player||(ASSETS.player&&ASSETS.player.kind==='grade'?ASSETS.player:null);if(!src){toast('Escolha uma folha em grade primeiro.');return}const cfg=playerCfg();ASSETS.player={...gridSprite(src.img,cfg),blob:src.blob};await IDB.put('player',{blob:src.blob,cfg});pending.player=null;toast('Personagem aplicado.')};
$('eKind').onchange=()=>fillEnemyForm($('eKind').value);
$('eImg').onchange=async e=>{const f=e.target.files[0];if(!f)return;pending.enemy={blob:f,img:await blobImg(f)};toast('Folha carregada. Ajuste e aplique.')};
$('eApply').onclick=async()=>{const k=$('eKind').value,src=pending.enemy||ASSETS.enemy[k];if(!src){toast('Escolha uma folha para esta criatura.');return}const cfg=enemyCfg();ASSETS.enemy[k]={...gridSprite(src.img,cfg),blob:src.blob};await IDB.put('enemy:'+k,{blob:src.blob,cfg});pending.enemy=null;toast('Criatura aplicada.')};
$('eReset').onclick=async()=>{const k=$('eKind').value;delete ASSETS.enemy[k];await IDB.del('enemy:'+k);toast('Desenho original restaurado.')};
$('bImg').onchange=async e=>{const f=e.target.files[0];if(!f)return;pending.bg={blob:f,img:await blobImg(f)};toast('Imagem carregada. Escolha o modo e aplique.')};
$('bReg').onchange=()=>{const b=ASSETS.bg[$('bReg').value];if(b){$('bFit').value=b.cfg.encaixe;$('bMode').value=b.cfg.modo;$('bOp').value=Math.round(b.cfg.opacidade*100);$('bDirt').checked=b.cfg.sujeira!==false}};
$('bApply').onclick=async()=>{const i=+$('bReg').value,src=pending.bg||ASSETS.bg[i];if(!src){toast('Escolha uma imagem primeiro.');return}const cfg={encaixe:$('bFit').value,modo:$('bMode').value,opacidade:$('bOp').value/100,sujeira:$('bDirt').checked};ASSETS.bg[i]={img:src.img,blob:src.blob,cfg};await IDB.put('bg:'+i,{blob:src.blob,cfg});pending.bg=null;rerenderSection(i);toast('Fundo aplicado em '+secs[i].dataset.name+'.')};
$('bReset').onclick=async()=>{const i=+$('bReg').value;delete ASSETS.bg[i];await IDB.del('bg:'+i);rerenderSection(i);toast('Fundo pintado restaurado.')};
['display','body'].forEach(role=>{const inp2=$(role==='display'?'fDisp':'fBody');inp2.onchange=async e=>{const f=e.target.files[0];if(!f)return;try{await applyFont(role,f);await IDB.put('font:'+role,{blob:f});await IDB.del('gfont:'+role);toast('Fonte aplicada.')}catch(err){toast('Não consegui ler essa fonte. Use .ttf, .otf, .woff ou .woff2.')}}});
document.querySelectorAll('[data-gf]').forEach(b=>b.onclick=async()=>{const role=b.dataset.gf,name=$(role==='display'?'gDisp':'gBody').value;if(!name.trim())return;await applyFont(role,null,name);await IDB.put('gfont:'+role,{name});await IDB.del('font:'+role);toast('Carregando "'+name+'" do Google Fonts.')});
document.querySelectorAll('[data-reset]').forEach(b=>b.onclick=async()=>{const w=b.dataset.reset;if(w==='fonts'){for(const r of['display','body']){await applyFont(r,null);await IDB.del('font:'+r);await IDB.del('gfont:'+r)}toast('Fontes padrão restauradas.')}if(w==='player'){ASSETS.player=null;await IDB.del('player');toast('Lume está de volta.')}});
$('sfxList').innerHTML=SFXN.map(([k,n])=>`<li><span class="nm">${n} <span class="st" id="st-${k}"></span></span><button type="button" class="ghost" data-test="${k}">Ouvir</button><button type="button" class="ghost" data-sfxreset="${k}">Original</button><input type="file" accept="audio/*" data-sfx="${k}" aria-label="Arquivo de som para ${n}"></li>`).join('');
function sfxStatus(){SFXN.forEach(([k])=>{$('st-'+k).textContent=ASSETS.sfx[k]?'· seu arquivo':''})}
$('sfxList').addEventListener('click',async e=>{const t=e.target.closest('[data-test]'),r=e.target.closest('[data-sfxreset]');if(t){audioWake(e);const m=MODE;MODE='play';sfx(t.dataset.test);MODE=m}if(r){delete ASSETS.sfx[r.dataset.sfxreset];await IDB.del('sfx:'+r.dataset.sfxreset);sfxStatus()}});
$('sfxList').addEventListener('change',async e=>{const k=e.target.dataset.sfx,f=e.target.files&&e.target.files[0];if(!k||!f)return;try{ASSETS.sfx[k]=await decodeAudio(f);await IDB.put('sfx:'+k,{blob:f});sfxStatus();toast('Som aplicado.')}catch(err){toast('Não consegui ler esse áudio. Tente .wav, .mp3 ou .ogg.')}});
$('sfxVol').value=Math.round(SET.sfxVol*100);$('sfxVol').oninput=()=>{SET.sfxVol=$('sfxVol').value/100;saveSet();if(AU.sfx)AU.sfx.gain.value=SET.sfxVol};
$('setAuto').checked=SET.autoplay;$('setFollow').checked=SET.follow;$('setAuto').onchange=()=>{SET.autoplay=$('setAuto').checked;saveSet()};$('setFollow').onchange=()=>{SET.follow=$('setFollow').checked;saveSet();uiPlayer()};
function renderMusicMgr(){const ul=$('mList');ul.innerHTML='';MUS.list.forEach((t,k)=>{if(t.builtin)return;const li=document.createElement('li');li.innerHTML=`<span class="t"></span><select aria-label="Região da faixa"><option value="-1">Sem região</option>${secs.map((s,i)=>`<option value="${i}">${roman[i]} · ${s.dataset.name}</option>`).join('')}</select><button type="button" class="ghost">Remover</button>`;li.querySelector('.t').textContent=t.title;const sel=li.querySelector('select');sel.value=String(t.region);
  sel.onchange=async()=>{t.region=+sel.value;const rec=await IDB.req('readonly',s=>s.get(t.id));if(rec){rec.region=t.region;await IDB.put(t.id,rec)}uiPlayer()};
  li.querySelector('button').onclick=async()=>{const cur=curTrack();if(cur===t)musicPause();MUS.list.splice(MUS.list.indexOf(t),1);if(t.id&&t.id.startsWith('music:'))await IDB.del(t.id);MUS.idx=Math.max(0,MUS.list.indexOf(cur));uiPlayer();renderMusicMgr()};ul.appendChild(li)})}
async function addMusicFiles(files){for(const f of files){const id='music:'+Date.now()+Math.random().toString(36).slice(2,6),title=f.name.replace(/\.[^.]+$/,'');addUserTrack(f,title,-1,id);await IDB.put(id,{blob:f,title,region:-1})}toast(files.length+' faixa(s) adicionada(s). Escolha a região na Oficina.')}
$('mAdd').onchange=e=>addMusicFiles([...e.target.files]);$('paddmusic').onchange=e=>addMusicFiles([...e.target.files]);
$('resetAll').onclick=()=>{$('resetConfirm').hidden=false};$('resetNo').onclick=()=>{$('resetConfirm').hidden=true};
$('resetYes').onclick=async()=>{await IDB.clear();ASSETS.player=null;ASSETS.enemy={};ASSETS.sfx={};const bgs=Object.keys(ASSETS.bg);ASSETS.bg={};bgs.forEach(i=>rerenderSection(+i));for(const r of['display','body'])await applyFont(r,null);musicPause();MUS.list=BUILTIN.slice();MUS.idx=0;uiPlayer();renderMusicMgr();sfxStatus();$('resetConfirm').hidden=true;toast('Tudo voltou ao original.')};

/* panels */
function openShop(){$('shop').hidden=false;paused=true;previewLoop()}
function openGuide(tab){$('guide').hidden=false;paused=true;showTab(tab||'comeco');$('guide').querySelector('.x').focus()}
function closePanels(){$('shop').hidden=true;$('guide').hidden=true;$('plistbox').hidden=true;$('plist').setAttribute('aria-expanded','false');paused=false}
$('openShop').onclick=()=>$('shop').hidden?openShop():closePanels();$('openGuide').onclick=()=>openGuide();
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=closePanels);
document.querySelectorAll('[data-guide]').forEach(b=>b.onclick=()=>openGuide(b.dataset.guide));
$('guide').addEventListener('click',e=>{if(e.target===$('guide'))closePanels()});
function previewLoop(){if($('shop').hidden)return;const t=performance.now()/1000;
  const pc=$('pPrev').getContext('2d');pc.clearRect(0,0,360,150);const ps=pending.player?gridSprite(pending.player.img,playerCfg()):ASSETS.player;
  if(ps){const keys=Object.keys(ps.anims),k=keys[Math.floor(t/1.6)%keys.length],fxk=k.startsWith('efeito');drawSprite(pc,ps,k,t%1.6,180,fxk?78:138,1,110,0,fxk);pc.fillStyle='#e8e0cf';pc.font='14px serif';pc.fillText(k.replace(/_/g,' ')+' · '+ps.anims[k].frames.length+' quadro(s)',10,20)}
  else{drawLume(pc,180,140,1.6,1,t*8,true,0,0,t,'#ffd896',1,0);pc.fillStyle='#b4ad9f';pc.font='italic 14px serif';pc.fillText('Lume (original). Carregue uma folha para ver a prévia.',10,20)}
  const ec=$('ePrev').getContext('2d');ec.clearRect(0,0,360,110);const k=$('eKind').value,es=pending.enemy||ASSETS.enemy[k];
  if(es)drawSprite(ec,pending.enemy?gridSprite(es.img,enemyCfg()):es,'parado',t,180,100,1,64,0);else{ec.fillStyle='#b4ad9f';ec.font='italic 14px serif';ec.fillText('Desenho original em uso.',10,20)}
  requestAnimationFrame(previewLoop)}

/* guide */
const GUIDE={
comeco:['Começo',`<h4>Como este conceito funciona</h4>
<p>Tudo o que você vê e ouve aqui é original e gerado por código: a arte das regiões, Lume, as criaturas, as oito músicas e os efeitos sonoros. Qualquer peça pode ser trocada por arquivos seus, sem mexer no código.</p>
<p>Este site não contém arquivos de nenhum jogo. Ele carrega só os arquivos que você escolher, então use material que você tenha direito de usar.</p>
<h4>Dois caminhos</h4>
<ol><li><b>Oficina (dentro do site).</b> Abra a Oficina, escolha o arquivo, ajuste e aplique. Fica salvo só neste navegador, neste aparelho.</li>
<li><b>Pasta <code>recursos/</code> (automático).</b> Coloque arquivos com os nomes certos na pasta <code>recursos/</code> do projeto e eles carregam sozinhos para todo mundo que abrir o site. Veja a aba "Pasta recursos".</li></ol>
<p>O que for aplicado pela Oficina vale por cima do que estiver na pasta.</p>
<h4>O que pode ser trocado</h4>
<div class="tw"><table><tr><th>Peça</th><th>Formato</th><th>Aba</th></tr>
<tr><td>Fonte dos títulos e do texto</td><td>.ttf .otf .woff .woff2 ou nome do Google Fonts</td><td>Fontes</td></tr>
<tr><td>Personagem principal</td><td>Folha de sprites PNG, 7 animações</td><td>Personagem</td></tr>
<tr><td>7 criaturas</td><td>Folha de sprites PNG, 1 animação</td><td>Inimigos</td></tr>
<tr><td>Fundo de cada região</td><td>PNG, JPG ou WebP</td><td>Fundos</td></tr>
<tr><td>11 efeitos sonoros</td><td>.wav .mp3 .ogg</td><td>Sons</td></tr>
<tr><td>Músicas</td><td>.mp3 .ogg .wav .m4a</td><td>Música</td></tr></table></div>`],
fontes:['Fontes',`<h4>Onde cada fonte aparece</h4>
<p><b>Títulos</b>: o nome do reino, os nomes das regiões, o painel do canto e o título da música. <b>Texto</b>: os parágrafos, as legendas e a lista de faixas. Rótulos pequenos usam uma terceira fonte fixa.</p>
<h4>Arquivo próprio</h4>
<ol><li>Abra a Oficina, seção Fontes.</li><li>Em "Títulos" ou "Texto", escolha o arquivo <code>.ttf</code>, <code>.otf</code>, <code>.woff</code> ou <code>.woff2</code>.</li><li>A troca é imediata e fica salva.</li></ol>
<h4>Google Fonts</h4>
<p>Digite o nome exatamente como aparece no site do Google Fonts (por exemplo <code>Cinzel Decorative</code> ou <code>IM Fell English</code>) e clique em Aplicar.</p>
<h4>Dicas</h4>
<ul><li>Confira se a fonte tem acentos: teste com "Âmbar", "Cidadela" e "Não".</li><li>Fontes decorativas ficam melhores só nos títulos. No texto, prefira uma serifada fácil de ler.</li></ul>`],
personagem:['Personagem',`<h4>A folha de sprites</h4>
<p>Uma única imagem PNG com fundo transparente, dividida numa grade de quadros do mesmo tamanho. Cada <b>linha</b> é uma animação e cada <b>coluna</b> é um quadro dela, da esquerda para a direita.</p>
<div class="sheet" aria-hidden="true"><b>0 parado</b><span>1</span><span></span><span></span><span></span><span></span><span></span><b>1 correr</b><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><b>2 pular</b><span>1</span><span>2</span><span></span><span></span><span></span><span></span><b>3 cair</b><span>1</span><span>2</span><span></span><span></span><span></span><span></span><b>4 golpe</b><span>1</span><span>2</span><span>3</span><span>4</span><span></span><span></span><b>5 avanço</b><span>1</span><span>2</span><span></span><span></span><span></span><span></span><b>6 dano</b><span>1</span><span></span><span></span><span></span><span></span><span></span></div>
<div class="tw"><table><tr><th>Animação</th><th>Quando toca</th><th>Sugestão</th></tr>
<tr><td>Parado</td><td>sem andar</td><td>1 a 6 quadros, 6 fps</td></tr><tr><td>Correr</td><td>andando no chão</td><td>6 a 8 quadros, 12 fps</td></tr>
<tr><td>Pular</td><td>subindo no ar</td><td>2 a 3 quadros, 8 fps</td></tr><tr><td>Cair</td><td>descendo no ar</td><td>2 a 3 quadros, 8 fps</td></tr>
<tr><td>Golpe</td><td>durante o ataque (0,22 s)</td><td>3 a 5 quadros, 16 a 20 fps</td></tr><tr><td>Avanço</td><td>durante o avanço</td><td>2 quadros, 12 fps</td></tr><tr><td>Dano</td><td>ao ser atingido</td><td>1 a 2 quadros</td></tr></table></div>
<h4>Regras para encaixar certo</h4>
<ul><li>O personagem deve olhar para a <b>direita</b>. Se olhar para a esquerda, marque a opção.</li>
<li>Os <b>pés</b> ficam encostados na borda de baixo do quadro, no centro. É esse ponto que pisa no chão.</li>
<li>Deixe 2 a 4 pixels de folga nas laterais para os quadros não "sangrarem" uns nos outros.</li>
<li>Tamanho 1 deixa o quadro com cerca de 84 px de altura numa tela de 1280 px de largura. Ajuste o campo Tamanho.</li>
<li>Se a folha tiver menos linhas, aponte várias animações para a mesma linha.</li>
<li>GIF animado não funciona como folha: só o primeiro quadro aparece. Converta para PNG em grade.</li>
<li>Para arte em pixel, marque "Pixel art" para não borrar.</li>
<li>"Contorno de tinta" desenha a linha preta tremida em volta, igual ao resto do site. Desligue se a sua arte já tiver contorno.</li></ul>
<p>A caixa de colisão continua a mesma de Lume. Personagens com proporções parecidas ficam mais justos.</p>`],
inimigos:['Inimigos',`<h4>As sete criaturas</h4>
<div class="tw"><table><tr><th>Tipo</th><th>Onde vive</th><th>Comportamento</th></tr>
<tr><td>Besouro rastejante</td><td>Cinzaraiz, Galerias, Sendas, Minas</td><td>patrulha o chão</td></tr>
<tr><td>Mosca voadora</td><td>quase todas as regiões</td><td>paira e persegue você no modo Jogar</td></tr>
<tr><td>Saltador de cogumelo</td><td>Brejo</td><td>pula enquanto anda</td></tr>
<tr><td>Aranha do ninho</td><td>Ninho</td><td>patrulha rápido</td></tr>
<tr><td>Sentinela</td><td>Cidadela</td><td>anda devagar, é alta</td></tr>
<tr><td>Criatura que desce do teto</td><td>Ninho</td><td>sobe e desce por um fio</td></tr>
<tr><td>Água-viva de luz</td><td>Fosso</td><td>flutua, não causa dano</td></tr></table></div>
<h4>Formato</h4>
<ul><li>Uma linha só, com a animação de andar ou voar. Informe largura e altura do quadro, número de quadros e FPS.</li>
<li>Olhando para a direita, pés na borda de baixo do quadro. Voadores ficam centralizados.</li>
<li>Tamanho 1 deixa o quadro com cerca de 48 px de altura numa tela de 1280 px.</li>
<li>As criaturas levam 3 golpes e voltam depois de 22 segundos.</li></ul>`],
fundos:['Fundos',`<h4>Como os fundos se encaixam</h4>
<p>Cada região tem três camadas: <b>fundo</b> (mais distante, se move devagar), <b>meio</b> (o chão onde Lume pisa) e <b>frente</b>. A imagem da Oficina vai para a camada de <b>fundo</b>. O chão, as fendas e as plataformas continuam no lugar, então a jogabilidade não quebra.</p>
<h4>Tamanho recomendado</h4>
<ul><li>A camada de fundo é um pouco mais alta que larga. Para telas comuns, use algo perto de <b>2400 × 2200 px</b>.</li>
<li>O chão da região fica a cerca de <b>80%</b> da altura da camada. Se a sua imagem tiver um chão desenhado, coloque-o nessa altura.</li>
<li><b>Cobrir</b> preenche tudo e corta as sobras. <b>Conter</b> mostra a imagem inteira.</li></ul>
<h4>Modos</h4>
<ul><li><b>Substituir</b>: troca o fundo pintado pela sua imagem.</li><li><b>Sobrepor</b>: põe a sua imagem por cima do fundo pintado, com a opacidade escolhida. Bom para misturar.</li>
<li>"Manter grão e sujeira" aplica o mesmo tratamento de papel velho do resto do site.</li></ul>`],
sons:['Sons',`<h4>Os onze eventos</h4>
<div class="tw"><table><tr><th>Evento</th><th>Quando toca</th></tr>
<tr><td>Pulo</td><td>ao sair do chão</td></tr><tr><td>Salto duplo</td><td>ao bater as asas no ar</td></tr><tr><td>Pouso</td><td>ao tocar o chão</td></tr><tr><td>Passo</td><td>a cada passo correndo</td></tr>
<tr><td>Golpe da lanterna</td><td>ao atacar</td></tr><tr><td>Acerto no inimigo</td><td>quando o golpe acerta</td></tr><tr><td>Lume leva dano</td><td>ao ser atingido</td></tr><tr><td>Coletar fragmento</td><td>ao pegar luz</td></tr>
<tr><td>Avanço</td><td>no avanço rápido</td></tr><tr><td>Queda ou derrota</td><td>ao perder ou cair no Fosso</td></tr><tr><td>Inimigo derrotado</td><td>quando uma criatura cai</td></tr></table></div>
<h4>Dicas de arquivo</h4>
<ul><li><code>.wav</code> ou <code>.ogg</code> curtos funcionam melhor. <code>.mp3</code> também serve.</li>
<li>Corte o silêncio do começo, senão o som atrasa.</li>
<li>Passo e golpe tocam muitas vezes: deixe-os curtos (menos de 0,3 s) e mais baixos.</li>
<li>Use "Ouvir" para testar e "Original" para voltar ao som gerado.</li></ul>`],
musica:['Música',`<h4>O player</h4>
<ul><li>Botões para voltar, tocar ou pausar e avançar. Arraste a barra para pular para outro ponto da faixa.</li>
<li>Controle de volume e botão de silenciar. O volume dos efeitos fica separado, na Oficina.</li>
<li>O ícone de alfinete liga "acompanhar região": cada região toca a sua faixa e troca sozinha quando você desce.</li>
<li>O ícone de lista mostra todas as faixas. Clique em uma para tocar.</li></ul>
<p>Os navegadores só permitem som depois de um clique ou tecla. Por isso a música começa no seu primeiro toque na página. Dá para desligar isso na Oficina.</p>
<h4>Suas músicas</h4>
<ol><li>Clique em "Adicionar músicas" (no player ou na Oficina). Pode escolher vários arquivos.</li>
<li>Na Oficina, seção Música, escolha a região de cada faixa.</li>
<li>Com "acompanhar região" ligado, a sua faixa toca no lugar da faixa original daquela região. Sem região, ela entra só na lista.</li></ul>
<p>Para músicas que repetem sem emenda, exporte o arquivo cortado exatamente no ponto de loop. <code>.ogg</code> costuma emendar melhor que <code>.mp3</code>.</p>`],
pasta:['Pasta recursos',`<h4>Colocar arquivos sem configurar nada</h4>
<p>Publicado (GitHub Pages) ou rodando no seu computador, o site procura arquivos com nomes fixos dentro da pasta <code>recursos/</code>. Coloque o arquivo com o nome certo e recarregue a página. A seção "Pasta recursos/" da Oficina mostra o que foi encontrado e o que falta.</p>
<div class="tw"><table><tr><th>Pasta</th><th>Nomes dos arquivos</th><th>Formatos</th></tr>
<tr><td>fontes/</td><td>titulo, texto</td><td>.woff2 .woff .ttf .otf</td></tr>
<tr><td>personagem/</td><td>personagem (+ personagem.json) ou parado-01, correr-01…</td><td>.png .webp</td></tr>
<tr><td>inimigos/</td><td>besouro, mosca, saltador, aranha, sentinela, pendente, agua-viva</td><td>.png .webp (1 linha)</td></tr>
<tr><td>fundos/</td><td>cinzaraiz, galerias, sendas, brejo, cidadela, minas, ninho, fosso</td><td>.jpg .png .webp</td></tr>
<tr><td>sons/</td><td>pulo, salto-duplo, pouso, passo, golpe, acerto, dano, coleta, avanco, morte, inimigo-morre</td><td>.ogg .mp3 .wav</td></tr>
<tr><td>musicas/</td><td>cinzaraiz até fosso (uma por região), extra-1 até extra-5</td><td>.mp3 .ogg .m4a</td></tr></table></div>
<h4>Personagem: três formatos</h4>
<ul><li><b>Folha empacotada + coordenadas:</b> <code>personagem.png</code> com <code>personagem.json</code> no formato JSON do TexturePacker ou do Aseprite. Quadros girados, recortados e com pivô são lidos. Sem o JSON, uma folha empacotada não é usada.</li>
<li><b>Grade:</b> <code>personagem.png</code> com 7 linhas (parado, correr, pular, cair, golpe, avanço, dano), quadros quadrados.</li>
<li><b>Quadros soltos:</b> <code>parado-01.png</code>, <code>parado-02.png</code>, <code>correr-01.png</code>… todos com o mesmo tamanho de tela.</li></ul>
<p>Nomes de animação: parado, correr, pular, cair, golpe, golpe-cima, golpe-baixo, avanco, dano, morte, salto-duplo, pouso, olhar-cima, olhar-baixo. Efeitos opcionais: efeito-golpe, efeito-golpe-cima, efeito-golpe-baixo, efeito-salto-duplo, efeito-avanco. Só <b>parado</b> é obrigatória; as outras usam uma parecida se faltarem. Detalhes em <code>recursos/LEIA-ME.md</code>.</p>
<h4>Inimigos, sem configuração</h4>
<ul><li>Uma linha só, quadros quadrados: o lado do quadro é a altura da imagem. O número de quadros também é detectado.</li></ul>
<h4>Ajustes opcionais</h4>
<p>Só para fugir do padrão. Crie um JSON ao lado do arquivo:</p>
<pre>personagem/personagem.json
{ "quadro": [64, 80], "tamanho": 1.2, "contorno": false, "pixel": false,
  "olha_esquerda": false, "lanterna": true,
  "fps": { "correr": 14 },
  "animacoes": { "golpe": [4, 5, 20] } }

inimigos/mosca.json
{ "quadro": [40, 40], "quadros": 2, "fps": 14, "tamanho": 0.9 }

fundos/ajustes.json
{ "cidadela": { "modo": "sobrepor", "opacidade": 0.6, "encaixe": "cobrir", "sujeira": true } }

musicas/titulos.json
{ "cinzaraiz": "Tema da vila", "extra-1": "Créditos" }</pre>
<h4>Rodar no computador</h4>
<p>O navegador só lê a pasta quando o site está num servidor. Na pasta do projeto, rode <code>python -m http.server 8000</code> e abra <code>http://localhost:8000</code>. No GitHub Pages funciona direto. A lista completa, com tamanhos sugeridos, está em <code>recursos/LEIA-ME.md</code>.</p>`],
controles:['Controles',`<h4>Passeio</h4>
<p>O site rola normalmente. Lume anda, pula entre as plataformas, desce pelas fendas e golpeia criaturas sozinha, acompanhando a sua rolagem. Role para cima e ela sobe de volta.</p>
<h4>Jogar</h4>
<div class="tw"><table><tr><th>Ação</th><th>Teclado</th><th>Toque</th></tr>
<tr><td>Andar</td><td>A D ou ← →</td><td>◀ ▶</td></tr><tr><td>Pular</td><td>Espaço ou Z (segure para pular mais alto)</td><td>⤒</td></tr>
<tr><td>Salto duplo</td><td>pular de novo no ar</td><td>⤒ no ar</td></tr><tr><td>Golpe</td><td>J ou X</td><td>✦</td></tr>
<tr><td>Golpe para cima</td><td>W ou ↑ + golpe</td><td>▲ + ✦</td></tr><tr><td>Golpe para baixo (quica)</td><td>S ou ↓ + golpe no ar</td><td>▼ + ✦</td></tr>
<tr><td>Avanço</td><td>K, C ou Shift</td><td>»</td></tr><tr><td>Ir para uma região</td><td>clique no mapa à direita</td><td>botão Passeio, rolar, Jogar</td></tr></table></div>
<ul><li>Você tem 5 chamas de vida. Ao perder todas, Lume volta ao último chão firme onde pisou.</li>
<li>Criaturas derrotadas soltam fragmentos de luz, contados no painel.</li>
<li>Para descer, procure a fenda brilhante no chão de cada região.</li>
<li>Pular no fim do Fosso leva Lume até a luz e a traz de volta para a borda.</li>
<li>Com a Oficina ou o Guia abertos, o jogo pausa.</li></ul>`]};
const gt=$('gtabs');Object.entries(GUIDE).forEach(([k,[n]])=>{const b=document.createElement('button');b.type='button';b.role='tab';b.dataset.tab=k;b.textContent=n;b.onclick=()=>showTab(k);gt.appendChild(b)});
function showTab(k){if(!GUIDE[k])k='comeco';$('gbody').innerHTML=GUIDE[k][1];$('gbody').scrollTop=0;gt.querySelectorAll('button').forEach(b=>b.setAttribute('aria-selected',b.dataset.tab===k))}

/* files saved by the workshop (this browser only) */
async function loadSaved(){if(!await IDB.open())return;const all=await IDB.all();
  for(const[k,v]of all){try{
    if(k==='font:display'||k==='font:body')await applyFont(k.slice(5),v.blob);
    else if(k==='gfont:display'||k==='gfont:body')await applyFont(k.slice(6),null,v.name);
    else if(k==='player'){ASSETS.player={...gridSprite(await blobImg(v.blob),v.cfg),blob:v.blob};fillPlayerForm(v.cfg)}
    else if(k.startsWith('enemy:'))ASSETS.enemy[k.slice(6)]={...gridSprite(await blobImg(v.blob),v.cfg),blob:v.blob};
    else if(k.startsWith('bg:')){const i=+k.slice(3);ASSETS.bg[i]={img:await blobImg(v.blob),blob:v.blob,cfg:v.cfg};rerenderSection(i)}
    else if(k.startsWith('sfx:'))ASSETS.sfx[k.slice(4)]=await decodeAudio(v.blob);
    else if(k.startsWith('music:'))addUserTrack(v.blob,v.title,v.region,k)}catch(e){console.warn('Velumbra: não carreguei',k,e)}}
  fillEnemyForm($('eKind').value);sfxStatus()}
