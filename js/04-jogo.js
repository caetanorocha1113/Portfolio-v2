/* ---------- game geometry: everything in world units (the character is ~90 units tall) ---------- */
const SC=1.5,K=1;
const ROUTE=WORLD.rota;
const PLATS=WORLD.salas.flatMap(s=>s.plataformas.map(p=>({...p,sala:s.id})));
const ALT=84,MEIA=13;/* body height and half width */
/* the body fits in the free space of the map (rooms' interiors) */
function corpoLivre(x,y){return WORLD.dentro(x-MEIA,y-22)&&WORLD.dentro(x+MEIA,y-22)&&WORLD.dentro(x-MEIA,y-ALT)&&WORLD.dentro(x+MEIA,y-ALT)&&WORLD.dentro(x,y-50)}
function surfaceAt(on,x,y){if(!on)return null;if(on.t==='g')return WORLD.chaoPerto(x,y,30);const p=on.p;return Math.abs(x-p.x)<=p.w/2+4?p.y-2:null}
function findLanding(x,y0,y1){let best=null;const g=WORLD.chaoAbaixo(x,y0,y1);if(g)best={y:g.y,on:{t:'g'}};
  for(const p of PLATS){if(Math.abs(x-p.x)>p.w/2+6)continue;const py=p.y-2;if(py>=y0-8&&py<=y1+1&&(!best||py<best.y))best={y:py,on:{t:'p',p}}}return best}
/* route helpers (Passeio): the page scroll is a distance along the route */
function noDaDistancia(s){let a=0,b=ROUTE.length-1;while(a<b){const m=(a+b+1)>>1;if(ROUTE[m].s<=s)a=m;else b=m-1}return a}
function topoSecoes(){return secs.map(s=>s.getBoundingClientRect().top+scrollY)}
function distanciaDaRolagem(){const vh=innerHeight,ref=scrollY+vh*.15,tops=topoSecoes(),fim=document.documentElement.scrollHeight-vh*.85;let i=0;for(let k=0;k<tops.length;k++)if(tops[k]<=ref)i=k;
  const a=tops[i],b=i+1<tops.length?tops[i+1]:Math.max(a+1,fim),f=clamp((ref-a)/Math.max(1,b-a),0,1),s0=ROUTE[REGS[i].rota].s,s1=i+1<REGS.length?ROUTE[REGS[i+1].rota].s:ROUTE[ROUTE.length-1].s;
  return{s:s0+(s1-s0)*f,reg:i}}
function rolagemDaDistancia(s){const vh=innerHeight,tops=topoSecoes(),fim=document.documentElement.scrollHeight-vh*.85;let i=0;for(let k=0;k<REGS.length;k++)if(ROUTE[REGS[k].rota].s<=s)i=k;
  const s0=ROUTE[REGS[i].rota].s,s1=i+1<REGS.length?ROUTE[REGS[i+1].rota].s:ROUTE[ROUTE.length-1].s,a=tops[i],b=i+1<tops.length?tops[i+1]:Math.max(a+1,fim);
  return a+(b-a)*clamp((s-s0)/Math.max(1,s1-s0),0,1)-vh*.15}
/* a point spread along the rooms of a region (for enemies), away from doors and holes */
function pontoNaRegiao(reg,f){const ss=REGS[reg].salas.map(i=>WORLD.salas[i]).filter(s=>s.tipo!=='poco'),tot=ss.reduce((a,s)=>a+s.w,0);let acc=clamp(f,0,.999)*tot,sala=ss[ss.length-1],x=sala.x+sala.w/2;
  for(const s of ss){if(acc<=s.w){sala=s;x=s.x+clamp(acc,260,s.w-260);break}acc-=s.w}
  for(let k=0;k<40&&!(MUNDO.chaoEm(sala,x)===MUNDO.chaoEm(sala,x));k++)x+=k%2?-k*24:k*24;
  return{sala,x}}
function spawnPoint(i){const st=REGS[i].rota;for(let k=st;k<ROUTE.length;k++){const n=ROUTE[k];if(WORLD.salas[n.sala].tipo!=='poco'||WORLD.chaoPerto(n.x,n.y,3)!=null)return n}return ROUTE[st]}

/* ---------- custom assets (filled by the recursos/ folder and by the workshop) ---------- */
const ASSETS={player:null,enemy:{},bg:{},sfx:{}};
/* sprite sets: one structure for grid sheets (workshop, enemies) and one-folder-per-animation frames (character) */
const ANIM_KEYS=['parado','correr','pular','cair','golpe','golpe_cima','golpe_baixo','avanco','dano','morte','salto_duplo','pouso','olhar_cima','olhar_baixo',
  'parede','salto_parede','lancar','acender','carregar','disparo','mergulho','clarao','passo_nevoa'];
const FX_KEYS=['efeito_golpe','efeito_golpe_cima','efeito_golpe_baixo','efeito_salto_duplo','efeito_avanco',
  'efeito_faisca','efeito_mergulho','efeito_clarao','efeito_acender','efeito_disparo','efeito_passo_nevoa','efeito_acerto'];
/* folder name (English) of each animation inside recursos/personagem/ */
const FOLDER_NAME={parado:'idle',correr:'run',pular:'jump',cair:'fall',golpe:'attack',golpe_cima:'attack-up',golpe_baixo:'attack-down',avanco:'dash',dano:'hurt',morte:'death',salto_duplo:'double-jump',pouso:'land',olhar_cima:'look-up',olhar_baixo:'look-down',
  parede:'wall-slide',salto_parede:'wall-jump',carregar:'superdash-charge',disparo:'superdash',passo_nevoa:'shadow-dash',lancar:'spell',mergulho:'dive',clarao:'spell-up',acender:'heal',
  efeito_golpe:'fx-attack',efeito_golpe_cima:'fx-attack-up',efeito_golpe_baixo:'fx-attack-down',efeito_salto_duplo:'fx-double-jump',efeito_avanco:'fx-dash',efeito_faisca:'fx-spell',efeito_mergulho:'fx-dive',efeito_clarao:'fx-spell-up',efeito_acender:'fx-heal',efeito_disparo:'fx-superdash',efeito_passo_nevoa:'fx-shadow-dash',efeito_acerto:'fx-hit'};
const KEY_OF_FOLDER=Object.fromEntries(Object.entries(FOLDER_NAME).map(([k,v])=>[v,k]));
const FPS_DEF={parado:6,correr:12,pular:8,cair:8,golpe:18,golpe_cima:18,golpe_baixo:18,avanco:14,dano:8,morte:8,salto_duplo:14,pouso:16,olhar_cima:6,olhar_baixo:6,efeito_golpe:24,efeito_golpe_cima:24,efeito_golpe_baixo:24,efeito_salto_duplo:18,efeito_avanco:20,
  parede:8,salto_parede:14,lancar:16,acender:10,carregar:12,disparo:14,mergulho:12,clarao:16,passo_nevoa:16,efeito_faisca:16,efeito_mergulho:18,efeito_clarao:18,efeito_acender:12,efeito_disparo:16,efeito_passo_nevoa:18,efeito_acerto:20};
const ANIM_ONCE={golpe:1,golpe_cima:1,golpe_baixo:1,dano:1,morte:1,salto_duplo:1,pouso:1,efeito_golpe:1,efeito_golpe_cima:1,efeito_golpe_baixo:1,efeito_salto_duplo:1,efeito_avanco:1,salto_parede:1,lancar:1,clarao:1,efeito_mergulho:1,efeito_clarao:1,efeito_passo_nevoa:1,efeito_acerto:1};
const ANIM_FALLBACK={golpe_cima:'golpe',golpe_baixo:'golpe',salto_duplo:'pular',pouso:'parado',morte:'dano',olhar_cima:'parado',olhar_baixo:'parado',dano:'parado',golpe:'parado',avanco:'correr',cair:'pular',pular:'parado',correr:'parado',
  parede:'cair',salto_parede:'pular',lancar:'golpe',acender:'parado',carregar:'parado',disparo:'avanco',mergulho:'cair',clarao:'golpe_cima',passo_nevoa:'avanco'};
const normKey=s=>String(s).toLowerCase().replace(/\.[a-z0-9]+$/,'').trim();
const animKey=s=>normKey(s).replace(/[-\s]+/g,'_');
const trailNum=s=>{const m=String(s).match(/(\d+)\D*$/);return m?+m[1]:-1};
const natSort=(a,b)=>trailNum(a)-trailNum(b)||a.localeCompare(b);
function frameOf(o){return Object.assign({img:null,sx:0,sy:0,sw:1,sh:1,tw:1,th:1,ox:0,oy:0,w:1,h:1,px:.5,py:1,pivot:false},o)}
function finishSprite(spr){const A=spr.anims,p=A.parado||Object.values(A)[0];let ref=+spr.cfg.altura_ref;if(!ref&&p&&p.frames.length){const hs=p.frames.map(f=>f.oh||f.h).sort((a,b)=>a-b);ref=hs[hs.length>>1]}spr.refH=ref||64;return spr}
function gridSprite(img,cfg){const fw=+cfg.fw||img.width,fh=+cfg.fh||img.height,anims={};
  for(const[k,a]of Object.entries(cfg.anims||{})){const fr=[];for(let i=0;i<Math.max(1,+a.frames||1);i++)fr.push(frameOf({sx:i*fw,sy:(+a.row||0)*fh,sw:fw,sh:fh,tw:fw,th:fh,w:fw,h:fh}));anims[k]={frames:fr,fps:+a.fps||FPS_DEF[k]||8,loop:a.loop}}
  return finishSprite({kind:'grade',img,cfg,anims})}
/* frames: {animKey:[frame,...]} from one folder per animation (recursos/personagem/<animação>/01.png ...);
   each frame already carries its feet anchor (px, py) and the height of the drawing (oh) */
function framesSprite(lists,cfg){const norm=o=>Object.fromEntries(Object.entries(o||{}).map(([k,v])=>[KEY_OF_FOLDER[k]||animKey(k),v])),fps=norm(cfg.fps),rep=norm(cfg.repetir),anims={};
  for(const k of[...ANIM_KEYS,...FX_KEYS]){const fr=lists[k];if(!fr||!fr.length)continue;anims[k]={frames:fr,fps:+fps[k]||FPS_DEF[k]||10,loop:rep[k]}}
  if(!anims.parado){const src=['pouso','correr','pular','cair','golpe'].map(k=>anims[k]).find(Boolean)||(Object.entries(anims).find(([k])=>!k.startsWith('efeito'))||[])[1];if(src)anims.parado={frames:[src.frames[0]],fps:1,loop:true,stand:true}}
  return finishSprite({kind:'quadros',img:null,cfg,anims})}
function pickAnim(spr,a){let k=a,g=0;while(k&&!spr.anims[k]&&g++<8)k=ANIM_FALLBACK[k];return spr.anims[k]||spr.anims.parado||spr.anims.correr||Object.values(spr.anims)[0]}
function animLen(spr,k){const A=spr.anims[k];return A?A.frames.length/A.fps:0}
/* draws one frame anchored at (x,y): the pivot (default: bottom centre; effects: centre) lands on that point */
function drawSprite(c,spr,anim,t,x,y,face,hRef,flash,center){const A=center?spr.anims[anim]:pickAnim(spr,anim);if(!A||!A.frames.length)return null;
  const n=A.frames.length,once=A.loop===false||(A.loop==null&&ANIM_ONCE[anim]),i=once?Math.min(n-1,Math.floor(t*A.fps)):Math.floor(t*A.fps)%n,f=A.frames[i],cfg=spr.cfg||{},s=hRef*(+cfg.scale||1)/spr.refH,img=f.img||spr.img;
  const px=center&&!f.pivot?(f.cx??.5):f.px,py=center&&!f.pivot?(f.cy??.5):f.py,ox=f.ox-px*f.w,oy=f.oy-py*f.h;
  c.save();c.imageSmoothingEnabled=!cfg.pixel;c.translate(x,y);c.scale(face*(cfg.flip?-1:1)*s,s);if(flash>0)c.filter=`brightness(${1+flash*2.5})`;
  c.drawImage(img,f.sx,f.sy,f.sw,f.sh,ox,oy,f.tw,f.th);
  c.restore();return[x+face*f.w*s*.3,y-f.h*s*.45]}
/* sprite effects (slash, wings, dash) when the player's set has them */
const sfxSprites=[];
const customHero=()=>!!(ASSETS.player&&ASSETS.player.kind==='quadros');
function spawnFx(anim,x,y,face,rot){const spr=ASSETS.player;if(!spr||!spr.anims)return false;let a=anim,r=rot||0;if(!spr.anims[a]){if(anim.startsWith('efeito_golpe_')&&spr.anims.efeito_golpe){a='efeito_golpe'}else return false}else r=0;sfxSprites.push({a,x,y,face,rot:r,t:0,len:animLen(spr,a)});return true}

/* ---------- enemies (world coordinates, each one lives in a room) ---------- */
const HB={crawler:[22,15,14],flyer:[16,12,0],hopper:[15,20,0],spider:[26,14,14],sentinel:[15,44,40],dropper:[12,13,0]};
const ENEMIES=REGS.map((g,i)=>(ENEMY_DEF[TEMA[i]]||[]).map(d=>{const p=pontoNaRegiao(i,d.x0);return{...d,sec:i,sala:p.sala,cx:p.x,rgu:clamp((d.rg||0)*640,0,Math.max(0,p.sala.w/2-200)),ph:Math.random()*2,kb:0,fl:0,x:p.x,y:p.sala.y+p.sala.h,vis:false,hp:3,dead:0,ox:0,oy:0,lx:null,lg:0,top:0,j:0,face:1}}));
/* ---------- custom enemies from recursos/inimigos/inimigos.json (folders, areas and behaviour written by the owner) ---------- */
const BEHAVIOURS={andar:{ground:1},pular:{ground:1},investir:{ground:1},atirar:{ground:1},parado:{ground:1},voar:{air:1},perseguir:{air:1},flutuar:{air:1},teto:{air:1}};
const ROLE_ONCE={virar:1,atacar:1,morrer:1};
const shots=[];
/* same pixel scale as the custom character (so proportions match), otherwise ~48 units tall */
function enemyPx(e){const P=ASSETS.player;return(P&&P.kind==='quadros'?84*K*(+P.cfg.scale||1)/P.refH:48*K/e.spr.refH)*(e.cfg.tamanho||1)}
function roleOf(e,role){const A=e.spr.anims;return A[role]?role:A.andar?'andar':A.parado?'parado':Object.keys(A)[0]}
function addCustomEnemies(def,spr,regions){let placed=0;
  for(const[i,n]of regions){if(!ENEMIES[i])continue;if(def.substituir)ENEMIES[i]=ENEMIES[i].filter(e=>e.k==='custom');
    for(let k=0;k<n;k++){const v=Math.max(.2,+def.velocidade||1),beh=BEHAVIOURS[def.comportamento]?def.comportamento:'andar',p=pontoNaRegiao(i,.06+.88*(k+.5)/n+(Math.random()-.5)*.05);
      ENEMIES[i].push({k:'custom',sec:i,sala:p.sala,cx:p.x,beh,air:!!BEHAVIOURS[beh].air,spr,cfg:def,nome:def.nome||def.pasta,harmless:def.dano===false,maxHp:Math.max(1,+def.vida||3),hp:Math.max(1,+def.vida||3),
        rgu:beh==='parado'||beh==='teto'||beh==='flutuar'?0:clamp(150*v,70,Math.max(70,p.sala.w/2-220)),sp:.045*v,yf:.35+Math.random()*.3,hv:(+def.altura_voo||170)*K,
        ph:Math.random()*2,kb:0,fl:0,x:p.x,y:p.sala.y+p.sala.h,vis:false,dead:0,dying:false,dieT:0,ox:0,oy:0,lx:null,lg:0,top:0,j:0,face:1,turnT:0,atkT:0,cd:1+Math.random()*2,charge:0,anim:'',animT0:0});placed++}}
  return placed}
function customBox(e){const f=e.spr.anims[roleOf(e,'andar')].frames[0],s=enemyPx(e),hw=(f.ow||f.w)*s*.4,hh=(f.oh||f.h)*s*.42;return{x:e.x,y:e.air?e.y:e.y-(f.oh||f.h)*s*.5-e.j,hw,hh}}
/* ground position inside the enemy's room (stays on the floor, never enters walls or holes) */
function pisoInimigo(e,x){const g=MUNDO.chaoEm(e.sala,x);if(g===g&&x>e.sala.x+40&&x<e.sala.x+e.sala.w-40)return g;return null}
function noCampo(e,m){return Math.abs(e.x-CAM.x)<VW*m&&Math.abs(e.y-CAM.y)<VH*m}
function updateCustom(e,dt){
  if(e.dead>0){if(!e.dying){e.dying=true;e.dieT=0}e.dieT+=dt;e.dead-=dt;if(e.dead<=0){e.hp=e.maxHp;e.dying=false;e.lx=null}
    e.vis=!!e.spr.anims.morrer&&e.dieT<animLen(e.spr,'morrer');return}
  e.kb*=Math.pow(.02,dt);e.fl=Math.max(0,e.fl-dt*4);e.turnT=Math.max(0,e.turnT-dt);e.atkT=Math.max(0,e.atkT-dt);e.cd-=dt;e.charge=Math.max(0,e.charge-dt);
  const play=MODE==='play'&&PL.dead<=0,lastFace=e.face,s=e.sala;
  if(e.beh==='flutuar'){e.x=e.cx+Math.sin(T*.12+e.ph*3)*80;e.y=s.y+s.h*e.yf+Math.sin(T*.5+e.ph*2)*26}
  else if(e.beh==='teto'){e.x=e.cx;const t=MUNDO.tetoEm(s,e.x);if(t!==t)return;e.top=t;e.y=e.top+(50+(1+Math.sin(T*.7+e.ph*3))*90)}
  else{const p=T*e.sp+e.ph;let x=e.cx+e.rgu*(tri(p)-.5)*2;if(e.rgu>0)e.face=tri(p+.002)-tri(p)>=0?1:-1;
    if(e.beh==='investir'&&play){const dx=PL.x-(x+e.ox);if(e.charge<=0&&e.cd<=0&&Math.abs(dx)<280&&Math.abs(PL.y-e.lg)<90){e.charge=.75;e.cd=2.5;e.cdir=Math.sign(dx)||1;e.atkT=animLen(e.spr,roleOf(e,'atacar'))}
      if(e.charge>0){e.ox+=e.cdir*560*(+e.cfg.velocidade||1)*dt;e.face=e.cdir}else e.ox*=Math.pow(.25,dt)}
    if(!e.air)x+=e.ox;x+=e.kb;let g=pisoInimigo(e,x);if(g==null){if(e.lx==null)return;x=e.lx;g=e.lg;e.ox*=.5}e.lx=x;e.lg=g;e.x=x;e.y=g;
    if(e.beh==='pular')e.j=Math.abs(Math.sin(T*2.6+e.ph*5))*34;
    if(e.air){e.y=g-e.hv+Math.sin(T*2.2+e.ph*4)*14;
      if(e.beh==='perseguir'&&play){const dx=PL.x-e.x,dy=PL.y-50-e.y,dd=Math.hypot(dx,dy);if(dd<330){e.ox+=(clamp(dx,-240,240)-e.ox)*Math.min(1,dt*.9);e.oy+=(clamp(dy,-200,200)-e.oy)*Math.min(1,dt*.9);if(Math.abs(dx)>4)e.face=dx>0?1:-1}else{e.ox*=Math.pow(.4,dt);e.oy*=Math.pow(.4,dt)}}
      e.x+=e.ox;e.y+=e.oy}}
  if(e.beh==='atirar'&&play){const dx=PL.x-e.x,dy=(PL.y-30)-(e.air?e.y:e.y-30);if(Math.hypot(dx,dy)<360){e.face=dx>0?1:-1;
    if(e.cd<=0){e.cd=+e.cfg.recarga||2.2;e.atkT=animLen(e.spr,roleOf(e,'atacar'));const d=Math.hypot(dx,dy)||1,v=260,sx=e.x+e.face*14,sy=e.air?e.y:e.y-30;shots.push({x:sx,y:sy,vx:dx/d*v,vy:dy/d*v,t:0,spr:e.spr.anims.projetil?e.spr:null,owner:e})}}}
  if(e.face!==lastFace&&e.spr.anims.virar)e.turnT=animLen(e.spr,'virar');
  e.vis=noCampo(e,.75)}
function updateShots(dt){for(let k=shots.length-1;k>=0;k--){const b=shots[k];b.t+=dt;b.x+=b.vx*dt;b.y+=b.vy*dt;
  if(b.t>3||!WORLD.dentro(b.x,b.y)){shots.splice(k,1);continue}
  if(MODE==='play'&&PL.inv<=0&&PL.dash<=0&&PL.dead<=0&&Math.abs(b.x-PL.x)<14&&Math.abs(b.y-(PL.y-28))<28){shots.splice(k,1);hurtPlayer(b)}}}
function drawShots(){for(const b of shots){if(b.spr)drawSprite(fc,b.spr,'projetil',b.t,b.x,b.y,b.vx>=0?1:-1,enemyPx(b.owner)*b.spr.refH,0,true);
  else{fc.fillStyle='#2a2430';fc.beginPath();fc.arc(b.x,b.y,5,0,TAU);fc.fill();fc.strokeStyle='#e8e0cf';fc.lineWidth=1.2;fc.stroke()}}}
function drawCustom(e,a,late){const role=e.vis&&e.dead>0?roleOf(e,'morrer'):e.atkT>0?roleOf(e,'atacar'):e.turnT>0?roleOf(e,'virar'):e.beh==='parado'?roleOf(e,'parado'):roleOf(e,'andar');
  if(role!==e.anim){e.anim=role;e.animT0=T}const t=ROLE_ONCE[role]?T-e.animT0:T+e.ph,sy=e.y-(e.j||0),h=enemyPx(e)*e.spr.refH;
  const draw=c=>{c.globalAlpha=a;if(e.beh==='teto'){c.strokeStyle='rgba(207,210,190,.35)';c.lineWidth=1;c.beginPath();c.moveTo(e.x,e.top);c.lineTo(e.x,sy);c.stroke()}drawSprite(c,e.spr,role,t,e.x,sy,e.face,h,e.fl,e.air);c.globalAlpha=1};
  if(e.spr.cfg.ink)draw(ac);else late.push(()=>draw(fc))}
function enemyBox(e){if(e.k==='custom')return customBox(e);const ws=SC*.82,[hw,hh,cy]=HB[e.k],c=e.k==='hopper'?(20+e.j)*ws:cy*ws;return{x:e.x,y:e.y-c,hw:hw*ws,hh:hh*ws}}
function updateEnemies(dt){const m=MODE==='play'?1.4:1;
  for(let i=0;i<ENEMIES.length;i++)for(const e of ENEMIES[i]){e.vis=false;const s=e.sala;if(Math.abs(s.x+s.w/2-CAM.x)>s.w/2+VW*m||Math.abs(s.y+s.h/2-CAM.y)>s.h/2+VH*m)continue;
    if(e.k==='custom'){updateCustom(e,dt);continue}
    if(e.dead>0){e.dead-=dt;if(e.dead<=0)e.hp=3;continue}
    e.kb*=Math.pow(.02,dt);e.fl=Math.max(0,e.fl-dt*4);
    if(e.k==='jelly'){e.x=e.cx+Math.sin(T*.12+e.ph*3)*e.rgu*2.4;e.y=s.y+s.h*e.yf+Math.sin(T*.5+e.ph*2)*26}
    else if(e.k==='dropper'){e.x=e.cx;const t=MUNDO.tetoEm(s,e.x);if(t!==t||t<s.y)continue;e.top=t;e.y=e.top+(50+(1+Math.sin(T*.7+e.ph*3))*90)}
    else{const p=T*(e.sp||.05)+e.ph;let x=e.cx+e.rgu*(tri(p)-.5)*2+e.kb;e.face=tri(p+.002)-tri(p)>=0?1:-1;let g=pisoInimigo(e,x);if(g==null){if(e.lx==null)continue;x=e.lx;g=e.lg}e.lx=x;e.lg=g;e.x=x;e.y=g;
      if(e.k==='hopper')e.j=Math.abs(Math.sin(T*2.6+e.ph*5))*34;
      if(e.k==='flyer'){e.y=g-e.hv+Math.sin(T*2.2+e.ph*4)*14;
        if(MODE==='play'&&PL.dead<=0){const dx=PL.x-e.x,dy=PL.y-50-e.y,dd=Math.hypot(dx,dy);if(dd<330){e.ox+=(clamp(dx,-240,240)-e.ox)*Math.min(1,dt*.9);e.oy+=(clamp(dy,-200,200)-e.oy)*Math.min(1,dt*.9);if(Math.abs(dx)>4)e.face=dx>0?1:-1}else{e.ox*=Math.pow(.4,dt);e.oy*=Math.pow(.4,dt)}}
        else{e.ox*=Math.pow(.4,dt);e.oy*=Math.pow(.4,dt)}
        e.x+=e.ox;e.y+=e.oy}}
    e.vis=noCampo(e,.75)}}

/* ---------- shared state ---------- */
let MODE='auto',hitstop=0,paused=false;
const shake={t:0,a:0},frags=[],trails=[],slashes=[],bursts=[];
function burst(x,y,col,n,sp){for(let k=0;k<n;k++){const a=Math.random()*TAU,v=sp*(.3+Math.random());bursts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-sp*.3,life:.5+Math.random()*.4,age:0,col,s:2+Math.random()*2.5})}}

/* ---------- camera: follows the character; inside a room it stops at the walls (shows a little rock) ---------- */
function alvoCamera(x,y,vies){const s=WORLD.salaEm(x,y-40);let tx=x+vies*VW,ty=y-VH*.27;
  if(s){if(s.w+400>VW)tx=clamp(tx,s.x+VW/2-200,s.x+s.w-VW/2+200);else tx=s.x+s.w/2;
    const top=s.y-160,bot=s.y+s.h+300;if(bot-top>VH)ty=clamp(ty,top+VH/2,bot-VH/2);else ty=(top+bot)/2}
  return[tx,ty]}
function moverCamera(x,y,vies,dt,ja){const[tx,ty]=alvoCamera(x,y,vies);if(ja||!CAM.ok){CAM.x=tx;CAM.y=ty;CAM.ok=true;return}const k=Math.min(1,dt*3.4);CAM.x+=(tx-CAM.x)*k;CAM.y+=(ty-CAM.y)*k}
/* side of the text panel of the current section: the character walks on the free side */
function viesDoPainel(i){const cp=secs[i]&&secs[i].querySelector('.copy');if(!cp)return 0;return cp.classList.contains('l')?-.2:cp.classList.contains('r')?.2:0}
let viesAtual=0;

/* ---------- Passeio: the character follows the route by itself ---------- */
const L={landT:0,i:0,ni:0,x:0,y:0,mode:'idle',jt:0,ct:0,ax:0,ay:0,bx:0,by:0,dur:.5,hh:0,face:1,ph:0,atk:0,cd:0,F:0,sq:1,flut:0,dbl:false,dblDone:false,idle:0,stepT:0,mv:false,ready:false};
let alvoPasseio={s:0,reg:0};
function updateAuto(dt){const s=SC;alvoPasseio=distanciaDaRolagem();const ti=noDaDistancia(alvoPasseio.s);
  if(!L.ready){L.ready=true;L.i=L.ni=ti;L.x=ROUTE[ti].x;L.y=ROUTE[ti].y}
  const longe=Math.abs(ROUTE[ti].s-ROUTE[L.i].s);
  if(L.mode==='idle'&&longe>2600){L.i=L.ni=ti;L.x=ROUTE[ti].x;L.y=ROUTE[ti].y;CAM.ok=false}
  const sp=1+Math.min(4,longe/700);
  if(L.mode==='idle'&&ti!==L.i){const d=ti>L.i?1:-1,a=ROUTE[L.i],b=ROUTE[L.i+d],jmp=d>0?b.j:a.j;L.ni=L.i+d;
    if(!jmp)L.mode='walk';else{L.mode='crouch';L.ct=.1/sp;L.ax=L.x;L.ay=L.y;L.bx=b.x;L.by=b.y;const D=L.ay-L.by;L.dur=.46+Math.abs(D)/1800;L.hh=D>0?D*.32+34*s:26*s;L.face=L.bx>=L.ax?1:-1;L.dbl=D>110;L.dblDone=false}}
  L.mv=false;
  if(L.mode==='walk'){const b=ROUTE[L.ni],dx=b.x-L.x,st=Math.sign(dx)*Math.min(Math.abs(dx),(sp>1.5?230:150)*s*sp*dt);L.x+=st;const yy=WORLD.chaoPerto(L.x,L.y,40);if(yy!=null)L.y=yy;
    if(st){L.face=st>0?1:-1;L.ph+=Math.abs(st)*.12/s*1.5;L.mv=true;L.stepT-=dt;if(L.stepT<=0){L.stepT=sp>1.5?.2:.3;sfx('passo',.5)}}if(Math.abs(b.x-L.x)<.5){L.i=L.ni;L.y=b.y;L.mode='idle'}}
  else if(L.mode==='crouch'){L.ct-=dt;L.sq+=(.74-L.sq)*Math.min(1,dt*30);if(L.ct<=0){L.mode='jump';L.jt=0;L.sq=1.2;sfx('pulo',.6)}}
  else if(L.mode==='jump'){L.jt=Math.min(1,L.jt+dt*sp/L.dur);const f=L.jt;L.x=lerp(L.ax,L.bx,f);L.y=lerp(L.ay,L.by,f)-4*L.hh*f*(1-f);
    if(L.dbl&&!L.dblDone&&f>.42){L.dblDone=true;L.flut=1;heroAnimName='';spawnFx('efeito_salto_duplo',L.x,L.y-30,L.face);sfx('salto_duplo',.6);if(!customHero())burst(L.x,L.y-24,'#d9cfe6',10,140)}
    if(f>=1){L.i=L.ni;L.mode='idle';L.x=L.bx;L.y=L.by;L.sq=.72;L.landT=.16;sfx('pouso',.6);burst(L.x,L.y,'#cfc6b4',7,70)}}
  L.sq+=(1-L.sq)*Math.min(1,dt*9);L.landT=Math.max(0,L.landT-dt);L.flut=Math.max(0,L.flut-dt*2.2);
  L.F+=((L.mode==='jump'?1:0)-L.F)*Math.min(1,dt*14);L.cd-=dt;L.atk=Math.max(0,L.atk-dt*3.2);
  if(L.mode==='idle'){L.idle+=dt;if(L.idle>3.6){L.idle=0;L.face*=-1}}else L.idle=0;
  if((L.mode==='walk'||L.mode==='idle')&&L.cd<=0)for(const list of ENEMIES)for(const e of list){if(!e.vis||e.dead>0||e.air||e.k==='flyer'||e.k==='jelly'||e.k==='dropper')continue;
    if(Math.abs(e.x-L.x)<58&&Math.abs(e.y-L.y)<34){L.atk=1;L.cd=1.2;L.face=e.x>L.x?1:-1;e.kb+=L.face*70;e.fl=1;heroAnimName='';if(!spawnFx('efeito_golpe',L.x+L.face*40,L.y-32,L.face)&&!customHero())slashes.push({x:L.x,y:L.y,f:L.face,d:0,t:0});burst(e.x,e.y-18,lcOf(e.sec),16,220);sfx('golpe',.6);sfx('acerto',.5);break}}
  viesAtual+=(viesDoPainel(alvoPasseio.reg)-viesAtual)*Math.min(1,dt*2);
  moverCamera(L.x,L.y,viesAtual,dt,false)}

/* ---------- Jogo: full platformer on the map ---------- */
const PL={luz:0,landT:0,x:0,y:0,vx:0,vy:0,on:null,face:1,coy:0,jumps:0,dash:0,dashCD:0,atk:0,atkCD:0,atkDir:0,inv:0,hp:5,max:5,frags:0,cp:null,ok:null,dead:0,abyss:0,sq:1,ph:0,flut:0,F:0,stepT:0,trailT:0,spellT:0,spellKind:'',healT:0,sdashCharge:0,sdash:0,wall:0,wallJumpT:0};
const inp={left:0,right:0,up:0,down:0,jump:0};let jumpQ=0,atkQ=0,dashQ=0,poderQ=0,acenderQ=0,corridaQ=0;
function spawnEm(x,y){PL.x=x;PL.y=y;PL.vx=PL.vy=0;PL.on={t:'g'};PL.cp={x,y};PL.ok={x,y};PL.dash=0;PL.abyss=0}
function spawnAt(i){const n=spawnPoint(i);spawnEm(n.x,n.y)}
function teleportTo(i){spawnAt(i);PL.inv=1;moverCamera(PL.x,PL.y,0,0,true)}
function setMode(m){if(m===MODE)return;MODE=m;document.documentElement.classList.toggle('playing',m==='play');
  if(m==='play'){if(L.ready)spawnEm(L.x,L.y);else spawnAt(0);PL.on=null;PL.hp=PL.max;PL.inv=1;PL.dead=0;PL.abyss=0;hudGame();showHint(true)}
  else{let best=0,bd=1e9;ROUTE.forEach((n,k)=>{const d=Math.hypot(n.x-PL.x,(n.y-PL.y)*2);if(d<bd){bd=d;best=k}});L.i=L.ni=best;L.mode='idle';L.x=ROUTE[best].x;L.y=ROUTE[best].y;
    window.scrollTo({top:Math.max(0,rolagemDaDistancia(ROUTE[best].s)),behavior:'instant'});showHint(false)}
  updateModeUI()}
function hurtPlayer(src){if(PL.inv>0||PL.dead>0||PL.dash>0)return;PL.hp--;PL.inv=1.3;const d=src.x>PL.x?-1:1;PL.vx=d*420;PL.vy=-430;PL.on=null;sfx('dano');shake.t=.3;shake.a=7;hitstop=.08;burst(PL.x,PL.y-30,'#ffffff',14,260);hudGame();
  if(PL.hp<=0){PL.dead=1.8;sfx('morte');burst(PL.x,PL.y-30,lcOf(lastIdx),30,320)}}
function dropFrags(x,y,n){for(let k=0;k<n;k++)frags.push({x,y,vx:(Math.random()-.5)*300,vy:-(250+Math.random()*350),t:0})}
function playerAttack(){const f=PL.face,d=PL.atkDir;let box;
  if(d<0)box={x:PL.x,y:PL.y-88,hw:36,hh:44};else if(d>0)box={x:PL.x,y:PL.y+28,hw:32,hh:40};else box={x:PL.x+f*40,y:PL.y-32,hw:36,hh:32};
  heroAnimName='';if(!spawnFx(d<0?'efeito_golpe_cima':d>0?'efeito_golpe_baixo':'efeito_golpe',PL.x+(d===0?f*40:0),PL.y-32+(d<0?-50:d>0?44:0),f,d<0?-Math.PI/2*f:d>0?Math.PI/2*f:0)&&!customHero())slashes.push({x:PL.x,y:PL.y,f,d,t:0});let hit=false;
  for(const list of ENEMIES)for(const e of list){if(!e.vis||e.dead>0||e.k==='jelly')continue;const b=enemyBox(e);if(Math.abs(b.x-box.x)<b.hw+box.hw&&Math.abs(b.y-box.y)<b.hh+box.hh){hit=true;e.hp--;e.fl=1;PL.luz=Math.min(LUZ_MAX,PL.luz+LUZ_POR_ACERTO);const kd=d===0?f:(e.x>PL.x?1:-1);e.kb+=kd*70;if(e.k==='flyer')e.ox+=kd*90;if(!spawnFx('efeito_acerto',b.x,b.y,f))burst(b.x,b.y,lcOf(e.sec),14,240);sfx('acerto');
    if(e.hp<=0){e.dead=22;e.lx=null;e.ox=e.oy=0;burst(b.x,b.y,'#ffffff',26,340);sfx('inimigo_morre');dropFrags(b.x,b.y,3+(Math.random()*3|0))}}}
  if(hit){hitstop=.06;shake.t=.14;shake.a=4;if(d>0){PL.vy=-760;PL.jumps=0}else if(d===0)PL.vx-=f*160}}
function updatePlay(dt){const k=K;
  PL.inv=Math.max(0,PL.inv-dt);PL.landT=Math.max(0,PL.landT-dt);PL.dashCD-=dt;PL.atkCD-=dt;PL.atk=Math.max(0,PL.atk-dt);PL.coy-=dt;jumpQ-=dt;atkQ-=dt;dashQ-=dt;poderQ-=dt;acenderQ-=dt;corridaQ-=dt;PL.flut=Math.max(0,PL.flut-dt*2.5);PL.sq+=(1-PL.sq)*Math.min(1,dt*12);PL.spellT=Math.max(0,PL.spellT-dt);PL.healT=Math.max(0,PL.healT-dt);PL.wallJumpT=Math.max(0,PL.wallJumpT-dt);
  if(PL.dead>0){PL.dead-=dt;if(PL.dead<=0){spawnEm(PL.cp.x,PL.cp.y);PL.hp=PL.max;PL.inv=1.5;hudGame();toast('O pequeno viajante desperta no último chão firme.')}return}
  if(PL.abyss>0){PL.abyss-=dt;PL.y+=50*dt;if(PL.abyss<=0){spawnEm(PL.cp.x,PL.cp.y);PL.inv=1}return}
  const dir=(inp.right?1:0)-(inp.left?1:0);
  if(dashQ>0&&!temPoder('avanco')){dashQ=0;poderBloqueado('avanco')}
  if(dashQ>0&&PL.dashCD<=0){PL.dash=.17;PL.dashCD=.55;dashQ=0;if(dir)PL.face=dir;sfx('avanco');spawnFx(temPoder('nevoa')?'efeito_passo_nevoa':'efeito_avanco',PL.x,PL.y-30,PL.face)}
  if(PL.dash>0){PL.dash-=dt;PL.vx=PL.face*780*k;PL.vy=0;PL.trailT-=dt;if(PL.trailT<=0&&!customHero()){PL.trailT=.025;trails.push({x:PL.x,y:PL.y,a:.7})}}
  else{const tgt=dir*320*k,acc=(PL.on?3000:2000)*k;PL.vx=PL.vx<tgt?Math.min(tgt,PL.vx+acc*dt):Math.max(tgt,PL.vx-acc*dt);if(dir&&PL.atk<=0)PL.face=dir;PL.vy=Math.min(PL.vy+2300*k*(PL.vy<0&&!inp.jump?2.1:1)*dt,1250*k)}
  if(jumpQ>0){if(PL.on||PL.coy>0){PL.vy=-980*k;PL.on=null;PL.coy=0;jumpQ=0;PL.sq=1.25;sfx('pulo');burst(PL.x,PL.y,'#cfc6b4',6,60)}
    else if(PL.jumps<1&&PL.dash<=0&&temPoder('salto_duplo')){PL.vy=-840*k;PL.jumps=1;jumpQ=0;PL.flut=1;heroAnimName='';spawnFx('efeito_salto_duplo',PL.x,PL.y-30,PL.face);PL.sq=1.15;sfx('salto_duplo');if(!customHero())burst(PL.x,PL.y-24,'#d9cfe6',12,160)}}
  if(jumpQ>.11&&!PL.on&&PL.coy<=0&&PL.jumps<1&&!temPoder('salto_duplo')){jumpQ=0;poderBloqueado('salto_duplo')}
  if(poderQ>0){poderQ=0;usarPoder(inp.down&&!PL.on?'queda':inp.up?'clarao':'faisca')}
  if(acenderQ>0){acenderQ=0;usarPoder('reacender')}
  if(corridaQ>0){corridaQ=0;usarPoder('corrida')}
  if(atkQ>0&&PL.atkCD<=0){atkQ=0;PL.atk=.22;PL.atkCD=.32;PL.atkDir=inp.up?-1:(inp.down&&!PL.on?1:0);sfx('golpe');playerAttack()}
  /* horizontal: walls stop the body; small steps of the floor are climbed */
  let nx=PL.x+PL.vx*dt;PL.wall=0;
  if(nx!==PL.x&&!corpoLivre(nx,PL.y)){let ok=false;if(PL.on)for(const up of[6,12,18,24])if(corpoLivre(nx,PL.y-up)){PL.y-=up;ok=true;break}if(!ok){PL.wall=Math.sign(PL.vx);nx=PL.x;PL.vx=0;if(PL.dash>0)PL.dash=0}}
  PL.x=nx;const py=PL.y;let ny=PL.y+PL.vy*dt;
  if(PL.on){const s=surfaceAt(PL.on,PL.x,PL.y);if(s!=null&&Math.abs(s-PL.y)<28&&PL.vy>=0){ny=s;PL.vy=0}else{PL.on=null;PL.coy=.1}}
  if(!PL.on&&PL.vy>=0){const hit=findLanding(PL.x,py,ny);if(hit){ny=hit.y;const hard=PL.vy>700;PL.on=hit.on;PL.vy=0;PL.jumps=0;PL.sq=hard?.68:.82;PL.landT=hard?.2:.12;sfx('pouso',hard?1:.6);burst(PL.x,ny,'#cfc6b4',hard?10:5,hard?110:60);if(hit.on.t==='g')PL.cp={x:PL.x,y:ny}}}
  /* ceiling: the head bumps */
  if(PL.vy<0&&!(WORLD.dentro(PL.x-MEIA+3,ny-ALT)&&WORLD.dentro(PL.x+MEIA-3,ny-ALT))){ny=py;PL.vy=0}
  PL.y=ny;
  if(WORLD.dentro(PL.x,PL.y-40))PL.ok={x:PL.x,y:PL.y};else if(PL.y<WORLD.limites.y1&&PL.ok){PL.x=PL.ok.x;PL.y=PL.ok.y;PL.vx=PL.vy=0}
  if(PL.on&&Math.abs(PL.vx)>40){PL.ph+=Math.abs(PL.vx)*dt*.12/SC*1.5;PL.stepT-=dt;if(PL.stepT<=0){PL.stepT=.26;sfx('passo')}}
  if(PL.y>WORLD.limites.y1+120){PL.abyss=2.2;sfx('morte',.6);toast('O viajante tocou a luz do fundo. A jornada recomeça na borda.')}
  if(PL.inv<=0&&PL.dash<=0)outer:for(const list of ENEMIES)for(const e of list){if(!e.vis||e.dead>0||e.k==='jelly'||e.harmless)continue;const b=enemyBox(e);if(Math.abs(b.x-PL.x)<b.hw+11&&Math.abs(b.y-(PL.y-24))<b.hh+24){hurtPlayer(e);break outer}}
  PL.F+=((PL.on?0:1)-PL.F)*Math.min(1,dt*14);
  moverCamera(PL.x,PL.y,0,dt,false)}
function updateFrags(dt){for(let k=frags.length-1;k>=0;k--){const f=frags[k];f.t+=dt;const dx=PL.x-f.x,dy=PL.y-26-f.y,d=Math.hypot(dx,dy)||1;
  if(f.t>.4&&d<160&&PL.dead<=0){f.vx+=dx/d*2400*dt;f.vy+=dy/d*2400*dt;f.vx*=.9;f.vy*=.9}else{f.vy+=1500*dt;f.vx*=Math.pow(.6,dt)}
  const py=f.y;f.x+=f.vx*dt;f.y+=f.vy*dt;if(f.vy>0){const hit=findLanding(f.x,py,f.y);if(hit){f.y=hit.y-3;f.vy*=-.35;f.vx*=.7}}
  if(d<26&&f.t>.3){frags.splice(k,1);PL.frags++;sfx('coleta',.7);hudGame();continue}if(f.t>40)frags.splice(k,1)}}

/* ---------- drawing (world coordinates through the camera) ---------- */
const acv=document.createElement('canvas'),ac=acv.getContext('2d'),scv=document.createElement('canvas'),sc=scv.getContext('2d');
function inkComposite(){sc.setTransform(1,0,0,1,0,0);sc.globalCompositeOperation='source-over';sc.clearRect(0,0,scv.width,scv.height);sc.drawImage(acv,0,0);sc.globalCompositeOperation='source-in';sc.fillStyle='#09060c';sc.fillRect(0,0,scv.width,scv.height);
  fc.save();fc.setTransform(1,0,0,1,0,0);fc.globalAlpha=1;fc.globalCompositeOperation='source-over';const b=Math.floor(T*8),o=1.7*FD;for(let k=0;k<8;k++){const a=k/8*TAU+b*.7,oo=o*(.85+((b*13+k*7)%5)*.09);fc.drawImage(scv,Math.cos(a)*oo,Math.sin(a)*oo)}fc.drawImage(acv,0,0);fc.restore()}
let heroAnimName='',heroAnimT0=0,HERO_PRONTO=false;
function heroAnim(){
  if(MODE==='play'){
    if(PL.dead>0)return'morte';
    if(PL.inv>1.05)return'dano';
    if(PL.sdash>0)return'disparo';
    if(PL.sdashCharge>0)return'carregar';
    if(PL.healT>0)return'acender';
    if(PL.spellT>0)return PL.spellKind||'lancar';
    if(PL.dash>0)return temPoder('nevoa')?'passo_nevoa':'avanco';
    if(PL.atk>0)return PL.atkDir<0?'golpe_cima':PL.atkDir>0?'golpe_baixo':'golpe';
    if(!PL.on){
      if(PL.wall!==0&&temPoder('garras'))return'parede';
      if(PL.wallJumpT>0)return'salto_parede';
      return PL.flut>.55?'salto_duplo':PL.vy<0?'pular':'cair';
    }
    if(PL.landT>0)return'pouso';
    if(Math.abs(PL.vx)>40*K)return'correr';
    return inp.up?'olhar_cima':inp.down?'olhar_baixo':'parado';
  }
  if(L.atk>.4)return'golpe';
  if(L.mode==='jump')return L.flut>.55?'salto_duplo':L.jt<.5?'pular':'cair';
  if(L.mode==='crouch'||L.landT>0)return'pouso';
  return L.mv?'correr':'parado';
}
function drawSlash(s,lc){const a=1-s.t/.18;if(a<=0)return;const y=s.y;fc.save();fc.globalCompositeOperation='lighter';fc.translate(s.x+(s.d===0?s.f*18*K:0),y-32*K+(s.d<0?-34*K:s.d>0?40*K:0));
  fc.rotate(s.d<0?-Math.PI/2:s.d>0?Math.PI/2:(s.f>0?0:Math.PI));fc.fillStyle=rgba(lc,a*.85);fc.beginPath();fc.arc(0,0,46*K,-1.2,1.2);fc.arc(-14*K,0,40*K,1.1,-1.1,true);fc.closePath();fc.fill();
  fc.strokeStyle=rgba('#ffffff',a*.6);fc.lineWidth=1.5;fc.beginPath();fc.arc(0,0,46*K,-1.1,1.1);fc.stroke();fc.restore();dotAt(lc,s.x+(s.d===0?s.f*40*K:0),y-32*K+(s.d<0?-40*K:s.d>0?44*K:0),60*K,a*.5)}
function drawWorld(dt,ox,oy){const lc=lcOf(lastIdx),ws=SC*.82,late=[],Z=ZOOM*FD,TX=FW*FD/2-CAM.x*Z+ox*FD,TY=FH*FD/2-CAM.y*Z+oy*FD;
  ac.setTransform(1,0,0,1,0,0);ac.clearRect(0,0,acv.width,acv.height);ac.setTransform(Z,0,0,Z,TX,TY);
  for(let i=0;i<ENEMIES.length;i++)for(const e of ENEMIES[i]){if(!e.vis)continue;if(e.k==='custom'){drawCustom(e,1,late);continue}const sy=e.y,ph=T*6+e.ph*9,spr=ASSETS.enemy[e.k];
    if(spr&&spr.anims){const draw=c=>{const yy=e.k==='hopper'?sy-e.j*ws:e.k==='flyer'||e.k==='dropper'||e.k==='jelly'?sy+24*ws:sy;drawSprite(c,spr,'parado',T+e.ph,e.x,yy,e.face,48*K,e.fl);if(e.k==='dropper'){c.strokeStyle='rgba(207,210,190,.35)';c.beginPath();c.moveTo(e.x,e.top);c.lineTo(e.x,sy-10*ws);c.stroke()}};
      if(spr.cfg.ink===false)late.push(()=>draw(fc));else draw(ac);continue}
    if(e.k==='crawler')eCrawler(ac,e.x,sy,ws,e.face,ph,e.P,e.fl);else if(e.k==='flyer')eFlyer(ac,e.x,sy,ws,e.face,e.P,e.fl,T+e.ph);
    else if(e.k==='hopper')eHopper(ac,e.x,sy,ws,e.face,e.P,e.fl,e.j);else if(e.k==='spider')eSpider(ac,e.x,sy,ws,e.face,ph*1.4,e.P,e.fl);
    else if(e.k==='sentinel')eSentinel(ac,e.x,sy,ws*1.05,e.face,T*3+e.ph,e.P,e.fl);else if(e.k==='dropper')eDropper(ac,e.x,e.top,sy,ws,e.P,e.fl,T+e.ph);
    else if(e.k==='jelly')eJelly(ac,e.x,sy,ws*1.2,e.P,e.fl,T,e.ph)}
  const H=MODE==='play'?{x:PL.x,y:PL.y,face:PL.face,ph:PL.ph,mv:!!PL.on&&Math.abs(PL.vx)>40,F:PL.F,atk:PL.atk>0?PL.atk/.22:0,sq:PL.sq,flut:PL.flut,hide:(PL.inv>0&&Math.floor(T*18)%2===0)||PL.abyss>0}
    :{x:L.x,y:L.y,face:L.face,ph:L.ph,mv:L.mv,F:L.F,atk:L.atk,sq:L.sq,flut:L.flut,hide:false};
  const onScreen=Math.abs(H.x-CAM.x)<VW*.7&&Math.abs(H.y-CAM.y)<VH*.75,mostra=onScreen&&!H.hide&&HERO_PRONTO;let lx=H.x,ly=H.y-40,glowOn=true;
  const an=heroAnim();if(an!==heroAnimName){heroAnimName=an;heroAnimT0=T}
  if(mostra){const spr=ASSETS.player;
    if(spr&&spr.anims){glowOn=!!spr.cfg.glow;const draw=c=>{const p=drawSprite(c,spr,an,T-heroAnimT0,H.x,H.y,H.face,84*K,0);if(p)[lx,ly]=p};if(spr.cfg.ink===false)late.push(()=>draw(fc));else draw(ac)}
    else[lx,ly]=drawLume(ac,H.x,H.y,SC,H.face,H.ph,H.mv,H.F,H.atk,T,lc,H.sq,H.flut)}
  inkComposite();
  fc.save();fc.setTransform(Z,0,0,Z,TX,TY);
  late.forEach(f=>f());drawShots();
  if(mostra&&glowOn){const dark=TEMA[clamp(lastIdx,0,TEMA.length-1)]===6?1:0;dotAt(lc,lx,ly,(120+dark*260)*K,.35+dark*.15);dotAt(lc,lx,ly,14*SC,.9);if(!ASSETS.player)dotAt('#ffbf5e',H.x+H.face*2.3*SC,H.y-33.5*SC,9*SC,.5)}
  for(let k=sfxSprites.length-1;k>=0;k--){const e=sfxSprites[k];e.t+=dt;if(!ASSETS.player||e.t>e.len+.02){sfxSprites.splice(k,1);continue}fc.save();fc.translate(e.x,e.y);fc.rotate(e.rot);drawSprite(fc,ASSETS.player,e.a,e.t,0,0,e.face,84*K,0,true);fc.restore()}
  for(let k=slashes.length-1;k>=0;k--){const s=slashes[k];s.t+=dt;if(s.t>.18){slashes.splice(k,1);continue}drawSlash(s,lc)}
  for(let k=trails.length-1;k>=0;k--){const t=trails[k];t.a-=dt*3;if(t.a<=0){trails.splice(k,1);continue}dotAt('#cdbfd8',t.x,t.y-28*K,34*K,t.a*.5)}
  for(let k=bursts.length-1;k>=0;k--){const b=bursts[k];b.age+=dt;if(b.age>b.life){bursts.splice(k,1);continue}b.vy+=180*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;dotAt(b.col,b.x,b.y,b.s*3,1-b.age/b.life)}
  for(const f of frags){const x=f.x,y=f.y;dotAt('#fff4d6',x,y,16*K,.55+Math.sin(T*6+x)*.2);fc.save();fc.translate(x,y);fc.rotate(T*2+x);fc.fillStyle='#fffaf0';fc.fillRect(-2.5*K,-2.5*K,5*K,5*K);fc.restore()}
  fc.restore();
  desenharFrente();
  fc.save();fc.setTransform(FD,0,0,FD,0,0);
  if(MODE==='play'&&PL.dead>0){fc.fillStyle=`rgba(3,2,6,${clamp(1-PL.dead/1.8,0,1)*.9})`;fc.fillRect(0,0,FW,FH)}
  if(MODE==='play'&&PL.abyss>0){fc.fillStyle=`rgba(245,242,255,${clamp(1-PL.abyss/2.2,0,1)*.85})`;fc.fillRect(0,0,FW,FH)}
  fc.restore()}
/* update (characters, enemies, camera); returns the current region */
function game(dt){if(!ROUTE.length)return 0;
  if(acv.width!==fx.width||acv.height!==fx.height){acv.width=scv.width=fx.width;acv.height=scv.height=fx.height}
  const gdt=(paused&&MODE==='play')||hitstop>0?0:dt;hitstop=Math.max(0,hitstop-dt);
  if(MODE==='play')updatePlay(gdt);else updateAuto(gdt);
  updateEnemies(gdt);updateShots(gdt);
  if(MODE==='play')updateFrags(gdt);
  const hx=MODE==='play'?PL.x:L.x,hy=MODE==='play'?PL.y:L.y,sala=WORLD.salaEm(hx,hy-40);if(sala)visitadas.add(sala.id);
  game.dt=gdt;
  return MODE==='play'?(sala?sala.regiao:Math.max(0,lastIdx)):alvoPasseio.reg}
function drawGame(){let ox=0,oy=0;if(shake.t>0){shake.t-=game.dt||0;ox=(Math.random()-.5)*shake.a*2;oy=(Math.random()-.5)*shake.a*2}drawWorld(game.dt||0,ox,oy)}
/* first frame: the walker where the page is, the camera on it */
function iniciarJogo(){const a=distanciaDaRolagem(),ti=noDaDistancia(a.s);L.ready=true;L.i=L.ni=ti;L.x=ROUTE[ti].x;L.y=ROUTE[ti].y;alvoPasseio=a;viesAtual=viesDoPainel(a.reg);moverCamera(L.x,L.y,viesAtual,0,true)}
