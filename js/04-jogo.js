/* ---------- world geometry: grounds with openings, platform shafts, route ---------- */
const SIDE=secs.map(s=>{const cp=s.querySelector('.copy');return cp.classList.contains('r')?'r':cp.classList.contains('l')?'l':'c'});
const PLAT=[null,
 {top:'#4a5d6e',body:'#18222c',dark:'#090d12',deco:'chain',acc:'#f2a145'},
 {top:'#2f8a60',body:'#0e2e2c',dark:'#041414',deco:'moss',acc:'#8ff0b8'},
 {top:'#b8763a',body:'#2a170b',dark:'#120a05',deco:'shroom',acc:'#ffc074'},
 {top:'#4a6aa8',body:'#13244a',dark:'#060d1c',deco:'chain',acc:'#9cc6ff'},
 {top:'#9a6ab0',body:'#2b1d3e',dark:'#140c1f',deco:'crystal',acc:'#ff9fd4'},
 {top:'#4a5040',body:'#0f110c',dark:'#030302',deco:'web',acc:'#d8e09a'},
 {top:'#3a3858',body:'#0a0a12',dark:'#000000',deco:'none',acc:'#b9b0ff'}];
function secGeom(i){const s=secs[i],w=s.clientWidth,H=s.offsetHeight,h=H*1.2;return{w,H,h,u:clamp(w/1280,.5,1.25),top:s.offsetTop-.1*H}}
function GF(i,w,h,u){const r=rng(7919*(i+1)+131);switch(i){case 0:return edgeFn(r,h*.8,14*u,520*u);case 1:edgeFn(r,h*.16,32*u,220*u);return edgeFn(r,h*.8,10*u,420*u);case 2:return()=>h*.78-2*u;case 3:edgeFn(r,h*.1,26*u,200*u);return edgeFn(r,h*.81,26*u,300*u);case 4:return()=>h*.8;case 5:edgeFn(r,h*.15,40*u,200*u);return edgeFn(r,h*.83,14*u,300*u);case 6:edgeFn(r,h*.2,60*u,170*u);return edgeFn(r,h*.8,36*u,200*u);default:return x=>x<w*.37?h*.6-5*u:null}}
let ROUTE=[],PLATS=[],GROUNDS=[],LANDX=[],SC=1,K=1,SPACING=150;
function groundPage(i,x){const g=GROUNDS[i];if(!g)return null;if(g.hole&&x>g.hole.x0&&x<g.hole.x1)return null;const v=g.G(x);return v==null?null:g.top+v}
function gnode(i,x){return{x,y:groundPage(i,x),ground:1,sec:i}}
function pushGround(i,xs,firstJump){const hl=GROUNDS[i].hole;xs.forEach((x,k)=>{if(k&&hl){const a=xs[k-1],lo=Math.min(a,x),hi=Math.max(a,x);if(lo<hl.x0&&hi>hl.x1){const e1=a<hl.cx?hl.x0-10*K:hl.x1+10*K,e2=a<hl.cx?hl.x1+10*K:hl.x0-10*K;ROUTE.push(gnode(i,e1));ROUTE.push({...gnode(i,e2),j:1})}}ROUTE.push({...gnode(i,x),j:k===0&&firstJump?1:0})})}
function buildRoute(){const W=secs[0].clientWidth;SC=clamp(W/1280,.62,1.15)*1.5;K=SC/1.5;SPACING=100*SC;ROUTE=[];PLATS=[];LANDX=[];
  GROUNDS=secs.map((s,i)=>{const g=secGeom(i);return{...g,G:GF(i,g.w,g.h,g.u),hole:null,band:null}});
  const HW=Math.max(30,50*K),N=secs.length;
  for(let i=0;i<N-1;i++){const band=SIDE[i+1]==='r'?[.06,.36]:[.64,.94],cx=W*(band[0]+band[1])/2;GROUNDS[i].band=band;GROUNDS[i].hole={x0:cx-HW,x1:cx+HW,cx}}
  let land=W*.5;
  for(let i=0;i<N;i++){LANDX[i]=land;
    if(i===N-1){pushGround(i,[land,W*.33],i>0);break}
    const gr=GROUNDS[i],hl=gr.hole,far=hl.cx<W/2?W*.68:W*.32,edge=far>hl.cx?hl.x1+12*K:hl.x0-12*K;
    pushGround(i,[land,far,edge],i>0);
    const bx=f=>W*(gr.band[0]+(gr.band[1]-gr.band[0])*f),ng=GROUNDS[i+1];
    let lx=bx(.5);if(ng.hole&&Math.abs(lx-ng.hole.cx)<HW*2.4)lx=ng.hole.cx+(ng.hole.cx<W/2?1:-1)*HW*2.8;
    if(groundPage(i+1,lx)==null)lx=W*.2;
    const y0=gr.top+gr.G(hl.cx),y1=groundPage(i+1,lx),n=Math.max(2,Math.round((y1-y0)/SPACING))-1;
    for(let j=1;j<=n;j++){const x=j===1?hl.cx:bx(j%2?.2:.8),y=y0+(y1-y0)*j/(n+1),p={x,y,pw:(98+(j*37%23))*gr.u,theme:i+1,k:PLATS.length};PLATS.push(p);ROUTE.push({x,y,plat:1,j:1})}
    land=lx}
}
function drawPlatform(c,x,y,pw,u,T,r){const th=13*u;
  if(T.deco==='chain'){c.strokeStyle=rgba(T.top,.6);c.lineWidth=1.4*u;for(const d of[-.36,.36]){const cx=x+pw*d;for(let yy=y;yy>y-700*u;yy-=7*u){c.beginPath();c.ellipse(cx,yy-3*u,(yy/7|0)%2?1.2*u:2.3*u,3*u,0,0,TAU);c.stroke()}}}
  glow(c,x,y+th,pw*.9,T.acc,.1);
  c.fillStyle=T.body;c.beginPath();c.moveTo(x-pw/2,y);c.lineTo(x+pw/2,y);c.lineTo(x+pw*.42,y+th*1.4);c.lineTo(x+pw*.2,y+th*2.4);c.lineTo(x,y+th*2.9);c.lineTo(x-pw*.22,y+th*2.2);c.lineTo(x-pw*.42,y+th*1.3);c.closePath();c.fill();
  for(let k=0;k<7;k++){const ex=x+(r()-.5)*pw*.75,ey=y+th*(.5+r()*1.4),es=(4+r()*6)*u;c.fillStyle=mix(T.body,T.dark,r()*.6);c.beginPath();c.ellipse(ex,ey,es,es*.8,0,0,TAU);c.fill();c.strokeStyle=T.dark;c.lineWidth=1.2;c.stroke()}
  c.fillStyle=T.top;c.beginPath();c.moveTo(x-pw/2-4*u,y+4*u);c.lineTo(x-pw/2,y-3*u);c.lineTo(x+pw/2,y-3*u);c.lineTo(x+pw/2+4*u,y+4*u);c.closePath();c.fill();
  c.strokeStyle=rgba(T.acc,.35);c.lineWidth=1.2*u;c.beginPath();c.moveTo(x-pw/2,y-3*u);c.lineTo(x+pw/2,y-3*u);c.stroke();
  if(T.deco==='moss'){foliage(c,r,x-pw*.38,y-2*u,12*u,['#0b302a','#1d6a4f','#4fae74'],.6,['#6f63e0','#a9a5ff']);foliage(c,r,x+pw*.3,y-2*u,9*u,['#0b302a','#1d6a4f','#4fae74'],.5);for(let k=0;k<4;k++)vine(c,r,x+(r()-.5)*pw*.7,y+th,(20+r()*50)*u,'#1d5a44','#3f9a6a',u)}
  if(T.deco==='shroom'){mushroom(c,r,x+pw*.3,y-1*u,16*u,18*u,{stem:'#d8c3a0',cap:'#a9521d',capLight:'#ffc074',gill:'#5a2a10',glow:'#e88a3c'},.1,.3);mushroom(c,r,x+pw*.38,y-1*u,9*u,11*u,{stem:'#7fb8ad',cap:'#1f7f74',capLight:'#a5f3e2',gill:'#0d3b36',glow:'#3cb3a3'},-.1,.3)}
  if(T.deco==='crystal')cluster(c,r,x-pw*.36,y-1*u,22*u,-.2,{d:'#7a2f69',m:'#e070b4',l:'#ffe0f2',g:'#ff9fd4'},3,.3);
  if(T.deco==='web')web(c,x+pw*.3,y+th,40*u,6,Math.PI*.3,Math.PI*.9,rgba('#cfd2be',.25),1);
  if(T.deco==='none'){c.strokeStyle=rgba(T.acc,.25);c.lineWidth=1;c.beginPath();c.moveTo(x-pw/2,y+2*u);c.lineTo(x+pw/2,y+2*u);c.stroke()}
}
function drawPlatforms(c,i,w,h,u){const top=GROUNDS[i]?GROUNDS[i].top:secGeom(i).top;PLATS.forEach(p=>{const cy=p.y-top;if(cy<-40||cy>h+60)return;drawPlatform(c,p.x,cy,p.pw,u,PLAT[p.theme],rng(4441+p.k*17))})}
function shaftPath(c,x0,x1,y0,y1,u,seed){const r=rng(seed);c.beginPath();c.moveTo(x0,y0);for(let y=y0;y<=y1;y+=12*u)c.lineTo(x0+(r()-.5)*7*u+Math.sin(y*.04)*3*u,y);c.lineTo(x1,y1);for(let y=y1;y>=y0;y-=12*u)c.lineTo(x1+(r()-.5)*7*u+Math.sin(y*.037)*3*u,y);c.closePath()}
function drawHole(c,i,w,h,u){const gr=GROUNDS[i];if(!gr)return;const r=rng(777+i);
  if(gr.hole){const{x0,x1,cx}=gr.hole,gy=Math.min(gr.G(x0),gr.G(x1),gr.G(cx))-5*u,acc=PLAT[i+1].acc;
    shaftPath(c,x0,x1,gy,h+10,u,91+i);const g=c.createLinearGradient(0,gy,0,h);g.addColorStop(0,'rgba(3,2,6,.98)');g.addColorStop(.5,'rgba(3,2,6,.94)');g.addColorStop(1,'rgba(3,2,6,.86)');c.fillStyle=g;c.fill();
    glow(c,cx,h*1.02,(x1-x0)*1.2,acc,.2);
    for(const ex of[x0,x1])for(let k=0;k<6;k++){const yy=gy+4*u+k*10*u,s=(5+r()*6)*u,xx=ex+(ex===x0?-1:1)*s*.3;c.fillStyle=mix('#1c1a22','#000000',r()*.4);c.beginPath();c.ellipse(xx,yy,s,s*.8,0,0,TAU);c.fill();c.strokeStyle='rgba(255,255,255,.1)';c.lineWidth=1;c.beginPath();c.arc(xx,yy,s*.7,Math.PI*1.1,Math.PI*1.6);c.stroke()}
    c.strokeStyle='rgba(20,18,24,.95)';c.lineCap='round';for(let k=0;k<4;k++){const sx=x0+r()*(x1-x0),L=(20+r()*60)*u;c.lineWidth=(1+r()*2)*u;c.beginPath();c.moveTo(sx,gy+2*u);c.quadraticCurveTo(sx+(r()-.5)*14*u,gy+L*.5,sx+(r()-.5)*8*u,gy+L);c.stroke()}
    glow(c,cx,gy-6*u,(x1-x0)*.7,acc,.12)}
  if(i>0&&GROUNDS[i-1]&&GROUNDS[i-1].hole){const{x0,x1,cx}=GROUNDS[i-1].hole,Cy=REG[i].C?REG[i].C(cx):h*.2,y1=Math.max(h*.12,Cy+50*u);shaftPath(c,x0-6*u,x1+6*u,-10,y1,u,191+i);const g=c.createLinearGradient(0,0,0,y1);g.addColorStop(0,'rgba(3,2,6,.92)');g.addColorStop(.7,'rgba(3,2,6,.55)');g.addColorStop(1,'rgba(3,2,6,0)');c.fillStyle=g;c.fill()}
}

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

/* ---------- enemies (page coordinates) ---------- */
const HB={crawler:[22,15,14],flyer:[16,12,0],hopper:[15,20,0],spider:[26,14,14],sentinel:[15,44,40],dropper:[12,13,0]};
const ENEMIES=ENEMY_DEF.map((l,i)=>l.map(d=>({...d,sec:i,ph:Math.random()*2,kb:0,fl:0,x:0,y:0,vis:false,hp:3,dead:0,ox:0,oy:0,lx:null,lg:0,top:0,j:0,face:1})));
/* ---------- custom enemies from recursos/inimigos/inimigos.json (folders, regions and behaviour written by the owner) ---------- */
const BEHAVIOURS={andar:{ground:1},pular:{ground:1},investir:{ground:1},atirar:{ground:1},parado:{ground:1},voar:{air:1},perseguir:{air:1},flutuar:{air:1},teto:{air:1}};
const ROLE_ONCE={virar:1,atacar:1,morrer:1};
const shots=[];
/* screen size: same pixel scale as the custom character (so proportions match), otherwise ~48 px tall */
function enemyPx(e){const P=ASSETS.player;return(P&&P.kind==='quadros'?84*K*(+P.cfg.scale||1)/P.refH:48*K/e.spr.refH)*(e.cfg.tamanho||1)}
function roleOf(e,role){const A=e.spr.anims;return A[role]?role:A.andar?'andar':A.parado?'parado':Object.keys(A)[0]}
function addCustomEnemies(def,spr,regions){let placed=0;
  for(const[i,n]of regions){const list=ENEMIES[i];if(def.substituir)ENEMIES[i]=list.filter(e=>e.k==='custom');
    for(let k=0;k<n;k++){const v=Math.max(.2,+def.velocidade||1),beh=BEHAVIOURS[def.comportamento]?def.comportamento:'andar';
      ENEMIES[i].push({k:'custom',sec:i,beh,air:!!BEHAVIOURS[beh].air,spr,cfg:def,nome:def.nome||def.pasta,harmless:def.dano===false,maxHp:Math.max(1,+def.vida||3),hp:Math.max(1,+def.vida||3),
        x0:clamp(.12+.76*(k+.5)/n+(Math.random()-.5)*.08,.08,.92),rg:beh==='parado'||beh==='teto'||beh==='flutuar'?0:clamp(.12*v,.05,.32),sp:.045*v,yf:.35+Math.random()*.35,hv:(+def.altura_voo||170)*K,
        ph:Math.random()*2,kb:0,fl:0,x:0,y:0,vis:false,dead:0,dying:false,dieT:0,ox:0,oy:0,lx:null,lg:0,top:0,j:0,face:1,turnT:0,atkT:0,cd:1+Math.random()*2,charge:0,anim:'',animT0:0});placed++}}
  return placed}
function customBox(e){const f=e.spr.anims[roleOf(e,'andar')].frames[0],s=enemyPx(e),hw=(f.ow||f.w)*s*.4,hh=(f.oh||f.h)*s*.42;return{x:e.x,y:e.air?e.y:e.y-(f.oh||f.h)*s*.5-e.j,hw,hh}}
function updateCustom(e,i,dt,gr,W,vh){
  if(e.dead>0){if(!e.dying){e.dying=true;e.dieT=0}e.dieT+=dt;e.dead-=dt;if(e.dead<=0){e.hp=e.maxHp;e.dying=false;e.lx=null}
    e.vis=!!e.spr.anims.morrer&&e.dieT<animLen(e.spr,'morrer');return}
  e.kb*=Math.pow(.02,dt);e.fl=Math.max(0,e.fl-dt*4);e.turnT=Math.max(0,e.turnT-dt);e.atkT=Math.max(0,e.atkT-dt);e.cd-=dt;e.charge=Math.max(0,e.charge-dt);
  const play=MODE==='play'&&PL.dead<=0,lastFace=e.face;
  if(e.beh==='flutuar'){e.x=W*(e.x0+Math.sin(T*.12+e.ph*3)*.06);e.y=gr.top+gr.h*e.yf+Math.sin(T*.5+e.ph*2)*26*K}
  else if(e.beh==='teto'){if(!REG[i].C)return;e.x=W*e.x0;e.top=gr.top+REG[i].C(e.x);e.y=e.top+(50+(1+Math.sin(T*.7+e.ph*3))*90)*K}
  else{const p=T*e.sp+e.ph;let x=W*(e.x0+e.rg*(tri(p)-.5));if(e.rg>0)e.face=tri(p+.002)-tri(p)>=0?1:-1;
    if(e.beh==='investir'&&play){const dx=PL.x-(x+e.ox);if(e.charge<=0&&e.cd<=0&&Math.abs(dx)<280*K&&Math.abs(PL.y-e.lg)<90*K){e.charge=.75;e.cd=2.5;e.cdir=Math.sign(dx)||1;e.atkT=animLen(e.spr,roleOf(e,'atacar'))}
      if(e.charge>0){e.ox+=e.cdir*560*K*(+e.cfg.velocidade||1)*dt;e.face=e.cdir}else e.ox*=Math.pow(.25,dt)}
    if(!e.air)x+=e.ox;x+=e.kb;let g=groundPage(i,x);if(g==null){if(e.lx==null)return;x=e.lx;g=e.lg;e.ox*=.5}e.lx=x;e.lg=g;e.x=x;e.y=g;
    if(e.beh==='pular')e.j=Math.abs(Math.sin(T*2.6+e.ph*5))*34*K;
    if(e.air){e.y=g-e.hv+Math.sin(T*2.2+e.ph*4)*14*K;
      if(e.beh==='perseguir'&&play){const dx=PL.x-e.x,dy=PL.y-50*K-e.y,dd=Math.hypot(dx,dy);if(dd<330*K){e.ox+=(clamp(dx,-240*K,240*K)-e.ox)*Math.min(1,dt*.9);e.oy+=(clamp(dy,-200*K,200*K)-e.oy)*Math.min(1,dt*.9);if(Math.abs(dx)>4)e.face=dx>0?1:-1}else{e.ox*=Math.pow(.4,dt);e.oy*=Math.pow(.4,dt)}}
      e.x+=e.ox;e.y+=e.oy}}
  if(e.beh==='atirar'&&play){const dx=PL.x-e.x,dy=(PL.y-30*K)-(e.air?e.y:e.y-30*K);if(Math.hypot(dx,dy)<360*K){e.face=dx>0?1:-1;
    if(e.cd<=0){e.cd=+e.cfg.recarga||2.2;e.atkT=animLen(e.spr,roleOf(e,'atacar'));const d=Math.hypot(dx,dy)||1,v=260*K,sx=e.x+e.face*14*K,sy=e.air?e.y:e.y-30*K;shots.push({x:sx,y:sy,vx:dx/d*v,vy:dy/d*v,t:0,spr:e.spr.anims.projetil?e.spr:null,owner:e})}}}
  if(e.face!==lastFace&&e.spr.anims.virar)e.turnT=animLen(e.spr,'virar');
  const sy=e.y-scrollY;e.vis=sy>-200&&sy<vh+200}
function updateShots(dt){for(let k=shots.length-1;k>=0;k--){const b=shots[k];b.t+=dt;const py=b.y;b.x+=b.vx*dt;b.y+=b.vy*dt;
  if(b.t>3||(b.vy>0&&findLanding(b.x,py,b.y))){shots.splice(k,1);continue}
  if(MODE==='play'&&PL.inv<=0&&PL.dash<=0&&PL.dead<=0&&Math.abs(b.x-PL.x)<14*K&&Math.abs(b.y-(PL.y-28*K))<28*K){shots.splice(k,1);hurtPlayer(b)}}}
function drawShots(ox,oy){for(const b of shots){const y=b.y-scrollY;if(b.spr){fc.save();fc.translate(ox,oy);drawSprite(fc,b.spr,'projetil',b.t,b.x,y,b.vx>=0?1:-1,enemyPx(b.owner)*b.spr.refH,0,true);fc.restore()}
  else{fc.fillStyle='#2a2430';fc.beginPath();fc.arc(b.x+ox,y+oy,5*K,0,TAU);fc.fill();fc.strokeStyle='#e8e0cf';fc.lineWidth=1.2;fc.stroke()}}}
function drawCustom(e,a,late,ox,oy){const role=e.vis&&e.dead>0?roleOf(e,'morrer'):e.atkT>0?roleOf(e,'atacar'):e.turnT>0?roleOf(e,'virar'):e.beh==='parado'?roleOf(e,'parado'):roleOf(e,'andar');
  if(role!==e.anim){e.anim=role;e.animT0=T}const t=ROLE_ONCE[role]?T-e.animT0:T+e.ph,sy=e.y-scrollY-(e.j||0),h=enemyPx(e)*e.spr.refH;
  const draw=c=>{c.globalAlpha=a;if(e.beh==='teto'){c.strokeStyle='rgba(207,210,190,.35)';c.lineWidth=1;c.beginPath();c.moveTo(e.x,e.top-scrollY);c.lineTo(e.x,sy);c.stroke()}drawSprite(c,e.spr,role,t,e.x,sy,e.face,h,e.fl,e.air);c.globalAlpha=1};
  if(e.spr.cfg.ink)draw(ac);else late.push(()=>{fc.save();fc.translate(ox,oy);draw(fc);fc.restore()})}
function enemyBox(e){if(e.k==='custom')return customBox(e);const ws=SC*.82,[hw,hh,cy]=HB[e.k],c=e.k==='hopper'?(20+e.j)*ws:cy*ws;return{x:e.x,y:e.y-c,hw:hw*ws,hh:hh*ws}}
function updateEnemies(dt){const W=FW,vh=FH;
  for(let i=0;i<ENEMIES.length;i++){const gr=GROUNDS[i];if(!gr)continue;const near=weights[i]>.01||(MODE==='play'&&Math.abs(gr.top+gr.h*.5-(scrollY+vh/2))<vh*1.6);
    for(const e of ENEMIES[i]){e.vis=false;if(!near)continue;
      if(e.k==='custom'){updateCustom(e,i,dt,gr,W,vh);continue}
      if(e.dead>0){e.dead-=dt;if(e.dead<=0)e.hp=3;continue}
      e.kb*=Math.pow(.02,dt);e.fl=Math.max(0,e.fl-dt*4);
      if(e.k==='jelly'){e.x=W*(e.x0+Math.sin(T*.12+e.ph*3)*e.rg);e.y=gr.top+gr.h*e.yf+Math.sin(T*.5+e.ph*2)*26}
      else if(e.k==='dropper'){if(!REG[i].C)continue;e.x=W*e.x0;e.top=gr.top+REG[i].C(e.x);e.y=e.top+(50+(1+Math.sin(T*.7+e.ph*3))*90)*K}
      else{const p=T*(e.sp||.05)+e.ph;let x=W*(e.x0+e.rg*(tri(p)-.5))+e.kb;e.face=tri(p+.002)-tri(p)>=0?1:-1;let g=groundPage(i,x);if(g==null){if(e.lx==null)continue;x=e.lx;g=e.lg}e.lx=x;e.lg=g;e.x=x;e.y=g;
        if(e.k==='hopper')e.j=Math.abs(Math.sin(T*2.6+e.ph*5))*34;
        if(e.k==='flyer'){e.y=g-e.hv*K+Math.sin(T*2.2+e.ph*4)*14*K;
          if(MODE==='play'&&PL.dead<=0){const dx=PL.x-e.x,dy=PL.y-50*K-e.y,dd=Math.hypot(dx,dy);if(dd<330*K){e.ox+=(clamp(dx,-240*K,240*K)-e.ox)*Math.min(1,dt*.9);e.oy+=(clamp(dy,-200*K,200*K)-e.oy)*Math.min(1,dt*.9);if(Math.abs(dx)>4)e.face=dx>0?1:-1}else{e.ox*=Math.pow(.4,dt);e.oy*=Math.pow(.4,dt)}}
          else{e.ox*=Math.pow(.4,dt);e.oy*=Math.pow(.4,dt)}
          e.x+=e.ox;e.y+=e.oy}}
      const sy=e.y-scrollY;e.vis=sy>-160&&sy<vh+160}}}

/* ---------- shared state ---------- */
let MODE='auto',hitstop=0,camY=0,paused=false;
const shake={t:0,a:0},frags=[],trails=[],slashes=[],bursts=[];
function burst(x,y,col,n,sp){for(let k=0;k<n;k++){const a=Math.random()*TAU,v=sp*(.3+Math.random());bursts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-sp*.3,life:.5+Math.random()*.4,age:0,col,s:2+Math.random()*2.5})}}
function surfaceAt(on,x){if(!on)return null;if(on.t==='g')return groundPage(on.i,x);const p=on.p;return Math.abs(x-p.x)<=p.pw/2+4*K?p.y-2:null}
function findLanding(x,y0,y1){let best=null;for(let i=0;i<GROUNDS.length;i++){const gy=groundPage(i,x);if(gy!=null&&gy>=y0-8*K&&gy<=y1+1&&(!best||gy<best.y))best={y:gy,on:{t:'g',i}}}
  for(const p of PLATS){if(Math.abs(x-p.x)>p.pw/2+6*K)continue;const py=p.y-2;if(py>=y0-8*K&&py<=y1+1&&(!best||py<best.y))best={y:py,on:{t:'p',p}}}return best}

/* ---------- Passeio: Lume follows the route by itself ---------- */
const L={landT:0,i:0,ni:0,x:0,y:0,mode:'idle',jt:0,ct:0,ax:0,ay:0,bx:0,by:0,dur:.5,hh:0,face:1,ph:0,atk:0,cd:0,F:0,sq:1,flut:0,dbl:false,dblDone:false,idle:0,stepT:0,mv:false,ready:false};
function updateAuto(dt){const vh=FH,s=SC;
  if(!L.ready){L.ready=true;L.i=L.ni=0;L.x=ROUTE[0].x;L.y=ROUTE[0].y}
  const ty=scrollY+vh*.72;let ti=0;for(let k=0;k<ROUTE.length;k++)if(ROUTE[k].y<=ty)ti=k;
  const sy=L.y-scrollY;if(L.mode==='idle'&&(sy<-vh*.5||sy>vh*1.5)&&Math.abs(ti-L.i)>1){L.i=ti;L.x=ROUTE[ti].x;L.y=ROUTE[ti].y}
  const sp=1+Math.min(3,Math.abs(ti-L.i)*.45);
  if(L.mode==='idle'&&ti!==L.i){const d=ti>L.i?1:-1,a=ROUTE[L.i],b=ROUTE[L.i+d],jmp=d>0?b.j:a.j;L.ni=L.i+d;
    if(!jmp)L.mode='walk';else{L.mode='crouch';L.ct=.1/sp;L.ax=L.x;L.ay=L.y;L.bx=b.x;L.by=b.y;const D=L.ay-L.by;L.dur=.46+Math.abs(D)/1800;L.hh=D>0?D*.32+34*s:26*s;L.face=L.bx>=L.ax?1:-1;L.dbl=D>SPACING*.75;L.dblDone=false}}
  L.mv=false;
  if(L.mode==='walk'){const b=ROUTE[L.ni],dx=b.x-L.x,st=Math.sign(dx)*Math.min(Math.abs(dx),(sp>1.5?230:150)*s*sp*dt);L.x+=st;const yy=groundPage(b.sec,L.x);if(yy!=null)L.y=yy;
    if(st){L.face=st>0?1:-1;L.ph+=Math.abs(st)*.12/s*1.5;L.mv=true;L.stepT-=dt;if(L.stepT<=0){L.stepT=sp>1.5?.2:.3;sfx('passo',.5)}}if(Math.abs(b.x-L.x)<.5){L.i=L.ni;L.mode='idle'}}
  else if(L.mode==='crouch'){L.ct-=dt;L.sq+=(.74-L.sq)*Math.min(1,dt*30);if(L.ct<=0){L.mode='jump';L.jt=0;L.sq=1.2;sfx('pulo',.6)}}
  else if(L.mode==='jump'){L.jt=Math.min(1,L.jt+dt*sp/L.dur);const f=L.jt;L.x=lerp(L.ax,L.bx,f);L.y=lerp(L.ay,L.by,f)-4*L.hh*f*(1-f);
    if(L.dbl&&!L.dblDone&&f>.42){L.dblDone=true;L.flut=1;heroAnimName='';spawnFx('efeito_salto_duplo',L.x,L.y-30*K,L.face);sfx('salto_duplo',.6);if(!customHero())burst(L.x,L.y-24*K,'#d9cfe6',10,140)}
    if(f>=1){L.i=L.ni;L.mode='idle';L.x=L.bx;L.y=L.by;L.sq=.72;L.landT=.16;sfx('pouso',.6);burst(L.x,L.y,'#cfc6b4',7,70)}}
  L.sq+=(1-L.sq)*Math.min(1,dt*9);L.landT=Math.max(0,L.landT-dt);L.flut=Math.max(0,L.flut-dt*2.2);
  L.F+=((L.mode==='jump'?1:0)-L.F)*Math.min(1,dt*14);L.cd-=dt;L.atk=Math.max(0,L.atk-dt*3.2);
  if(L.mode==='idle'){L.idle+=dt;if(L.idle>3.6){L.idle=0;L.face*=-1}}else L.idle=0;
  if((L.mode==='walk'||L.mode==='idle')&&L.cd<=0)for(const list of ENEMIES)for(const e of list){if(!e.vis||e.dead>0||e.air||e.k==='flyer'||e.k==='jelly'||e.k==='dropper')continue;
    if(Math.abs(e.x-L.x)<58*K&&Math.abs(e.y-L.y)<34*K){L.atk=1;L.cd=1.2;L.face=e.x>L.x?1:-1;e.kb+=L.face*70*K;e.fl=1;heroAnimName='';if(!spawnFx('efeito_golpe',L.x+L.face*40*K,L.y-32*K,L.face)&&!customHero())slashes.push({x:L.x,y:L.y,f:L.face,d:0,t:0});burst(e.x,e.y-18*K,LC[e.sec],16,220);sfx('golpe',.6);sfx('acerto',.5);break}}
}

/* ---------- Jogar: full platformer ---------- */
const PL={luz:0,landT:0,x:0,y:0,vx:0,vy:0,on:null,face:1,coy:0,jumps:0,dash:0,dashCD:0,atk:0,atkCD:0,atkDir:0,inv:0,hp:5,max:5,frags:0,cp:0,dead:0,abyss:0,sq:1,ph:0,flut:0,F:0,stepT:0,trailT:0,spellT:0,spellKind:'',healT:0,sdashCharge:0,sdash:0,wall:0,wallJumpT:0};
const inp={left:0,right:0,up:0,down:0,jump:0};let jumpQ=0,atkQ=0,dashQ=0,poderQ=0,acenderQ=0,corridaQ=0;
function spawnAt(i){const x=LANDX[i];PL.x=x;PL.y=groundPage(i,x)??(GROUNDS[i].top+GROUNDS[i].h*.8);PL.vx=PL.vy=0;PL.on={t:'g',i};PL.cp=i;PL.dash=0;PL.abyss=0}
function teleportTo(i){spawnAt(i);PL.inv=1;camY=PL.y-FH*.62;window.scrollTo({top:Math.max(0,camY),behavior:'instant'})}
function setMode(m){if(m===MODE)return;MODE=m;document.documentElement.classList.toggle('playing',m==='play');
  if(m==='play'){if(L.ready){PL.x=L.x;PL.y=L.y;PL.on=null;PL.vx=PL.vy=0}else spawnAt(0);PL.hp=PL.max;PL.inv=1;PL.dead=0;PL.abyss=0;camY=scrollY;hudGame();showHint(true)}
  else{let best=0,bd=1e9;ROUTE.forEach((n,k)=>{const d=Math.hypot(n.x-PL.x,(n.y-PL.y)*2);if(d<bd){bd=d;best=k}});L.i=L.ni=best;L.mode='idle';L.x=ROUTE[best].x;L.y=ROUTE[best].y;window.scrollTo({top:Math.max(0,L.y-FH*.72),behavior:'instant'});showHint(false)}
  updateModeUI()}
function hurtPlayer(src){if(PL.inv>0||PL.dead>0||PL.dash>0)return;PL.hp--;PL.inv=1.3;const d=src.x>PL.x?-1:1;PL.vx=d*420*K;PL.vy=-430*K;PL.on=null;sfx('dano');shake.t=.3;shake.a=7;hitstop=.08;burst(PL.x,PL.y-30*K,'#ffffff',14,260);hudGame();
  if(PL.hp<=0){PL.dead=1.8;sfx('morte');burst(PL.x,PL.y-30*K,LC[Math.max(0,lastIdx)],30,320)}}
function dropFrags(x,y,n){for(let k=0;k<n;k++)frags.push({x,y,vx:(Math.random()-.5)*300*K,vy:-(250+Math.random()*350)*K,t:0})}
function playerAttack(){const f=PL.face,d=PL.atkDir;let box;
  if(d<0)box={x:PL.x,y:PL.y-88*K,hw:36*K,hh:44*K};else if(d>0)box={x:PL.x,y:PL.y+28*K,hw:32*K,hh:40*K};else box={x:PL.x+f*40*K,y:PL.y-32*K,hw:36*K,hh:32*K};
  heroAnimName='';if(!spawnFx(d<0?'efeito_golpe_cima':d>0?'efeito_golpe_baixo':'efeito_golpe',PL.x+(d===0?f*40*K:0),PL.y-32*K+(d<0?-50*K:d>0?44*K:0),f,d<0?-Math.PI/2*f:d>0?Math.PI/2*f:0)&&!customHero())slashes.push({x:PL.x,y:PL.y,f,d,t:0});let hit=false;
  for(const list of ENEMIES)for(const e of list){if(!e.vis||e.dead>0||e.k==='jelly')continue;const b=enemyBox(e);if(Math.abs(b.x-box.x)<b.hw+box.hw&&Math.abs(b.y-box.y)<b.hh+box.hh){hit=true;e.hp--;e.fl=1;PL.luz=Math.min(LUZ_MAX,PL.luz+LUZ_POR_ACERTO);const kd=d===0?f:(e.x>PL.x?1:-1);e.kb+=kd*70*K;if(e.k==='flyer')e.ox+=kd*90*K;if(!spawnFx('efeito_acerto',b.x,b.y,f))burst(b.x,b.y,LC[e.sec],14,240);sfx('acerto');
    if(e.hp<=0){e.dead=22;e.lx=null;e.ox=e.oy=0;burst(b.x,b.y,'#ffffff',26,340);sfx('inimigo_morre');dropFrags(b.x,b.y,3+(Math.random()*3|0))}}}
  if(hit){hitstop=.06;shake.t=.14;shake.a=4;if(d>0){PL.vy=-760*K;PL.jumps=0}else if(d===0)PL.vx-=f*160*K}}
function updatePlay(dt){const k=K,W=FW;
  PL.inv=Math.max(0,PL.inv-dt);PL.landT=Math.max(0,PL.landT-dt);PL.dashCD-=dt;PL.atkCD-=dt;PL.atk=Math.max(0,PL.atk-dt);PL.coy-=dt;jumpQ-=dt;atkQ-=dt;dashQ-=dt;poderQ-=dt;acenderQ-=dt;corridaQ-=dt;PL.flut=Math.max(0,PL.flut-dt*2.5);PL.sq+=(1-PL.sq)*Math.min(1,dt*12); PL.spellT=Math.max(0,PL.spellT-dt);PL.healT=Math.max(0,PL.healT-dt);PL.wallJumpT=Math.max(0,PL.wallJumpT-dt);
  if(PL.dead>0){PL.dead-=dt;if(PL.dead<=0){spawnAt(PL.cp);PL.hp=PL.max;PL.inv=1.5;hudGame();toast('Lume desperta no último chão firme.')}return}
  if(PL.abyss>0){PL.abyss-=dt;PL.y+=50*k*dt;if(PL.abyss<=0){spawnAt(GROUNDS.length-1);PL.inv=1}return}
  const dir=(inp.right?1:0)-(inp.left?1:0);
  if(dashQ>0&&!temPoder('avanco')){dashQ=0;poderBloqueado('avanco')}
  if(dashQ>0&&PL.dashCD<=0){PL.dash=.17;PL.dashCD=.55;dashQ=0;if(dir)PL.face=dir;sfx('avanco');spawnFx(temPoder('nevoa')?'efeito_passo_nevoa':'efeito_avanco',PL.x,PL.y-30*K,PL.face);}
  if(PL.dash>0){PL.dash-=dt;PL.vx=PL.face*780*k;PL.vy=0;PL.trailT-=dt;if(PL.trailT<=0&&!customHero()){PL.trailT=.025;trails.push({x:PL.x,y:PL.y,a:.7})}}
  else{const tgt=dir*320*k,acc=(PL.on?3000:2000)*k;PL.vx=PL.vx<tgt?Math.min(tgt,PL.vx+acc*dt):Math.max(tgt,PL.vx-acc*dt);if(dir&&PL.atk<=0)PL.face=dir;PL.vy=Math.min(PL.vy+2300*k*(PL.vy<0&&!inp.jump?2.1:1)*dt,1250*k)}
  if(jumpQ>0){if(PL.on||PL.coy>0){PL.vy=-980*k;PL.on=null;PL.coy=0;jumpQ=0;PL.sq=1.25;sfx('pulo');burst(PL.x,PL.y,'#cfc6b4',6,60)}
    else if(PL.jumps<1&&PL.dash<=0&&temPoder('salto_duplo')){PL.vy=-840*k;PL.jumps=1;jumpQ=0;PL.flut=1;heroAnimName='';spawnFx('efeito_salto_duplo',PL.x,PL.y-30*k,PL.face);PL.sq=1.15;sfx('salto_duplo');if(!customHero())burst(PL.x,PL.y-24*k,'#d9cfe6',12,160)}}
  if(jumpQ>.11&&!PL.on&&PL.coy<=0&&PL.jumps<1&&!temPoder('salto_duplo')){jumpQ=0;poderBloqueado('salto_duplo')}
  if(poderQ>0){poderQ=0;usarPoder(inp.down&&!PL.on?'queda':inp.up?'clarao':'faisca')}
  if(acenderQ>0){acenderQ=0;usarPoder('reacender')}
  if(corridaQ>0){corridaQ=0;usarPoder('corrida')}
  if(atkQ>0&&PL.atkCD<=0){atkQ=0;PL.atk=.22;PL.atkCD=.32;PL.atkDir=inp.up?-1:(inp.down&&!PL.on?1:0);sfx('golpe');playerAttack()}
  let nx=clamp(PL.x+PL.vx*dt,10,W-10);
  for(const gr of GROUNDS){const hl=gr.hole;if(!hl||PL.x<hl.x0||PL.x>hl.x1)continue;const ey=gr.top+Math.min(gr.G(hl.x0),gr.G(hl.x1));if(PL.y>ey+6&&PL.y<ey+SPACING*.85)nx=clamp(nx,hl.x0+9*k,hl.x1-9*k)}
  PL.x=nx;const py=PL.y;let ny=PL.y+PL.vy*dt;
  if(PL.on){const s=surfaceAt(PL.on,PL.x);if(s!=null&&Math.abs(s-PL.y)<28*k&&PL.vy>=0){ny=s;PL.vy=0}else{PL.on=null;PL.coy=.1}}
  if(!PL.on&&PL.vy>=0){const hit=findLanding(PL.x,py,ny);if(hit){ny=hit.y;const hard=PL.vy>700*k;PL.on=hit.on;PL.vy=0;PL.jumps=0;PL.sq=hard?.68:.82;PL.landT=hard?.2:.12;sfx('pouso',hard?1:.6);burst(PL.x,ny,'#cfc6b4',hard?10:5,hard?110:60);if(hit.on.t==='g')PL.cp=hit.on.i}}
  PL.y=ny;
  if(PL.on&&Math.abs(PL.vx)>40*k){PL.ph+=Math.abs(PL.vx)*dt*.12/SC*1.5;PL.stepT-=dt;if(PL.stepT<=0){PL.stepT=.26;sfx('passo')}}
  const last=GROUNDS[GROUNDS.length-1];if(PL.y>last.top+last.h*.93){PL.abyss=2.2;sfx('morte',.6);toast('Lume tocou a luz do fundo. A descida recomeça na borda.')}
  if(PL.inv<=0&&PL.dash<=0)outer:for(const list of ENEMIES)for(const e of list){if(!e.vis||e.dead>0||e.k==='jelly'||e.harmless)continue;const b=enemyBox(e);if(Math.abs(b.x-PL.x)<b.hw+11*k&&Math.abs(b.y-(PL.y-24*k))<b.hh+24*k){hurtPlayer(e);break outer}}
  PL.F+=((PL.on?0:1)-PL.F)*Math.min(1,dt*14);
}
function updateFrags(dt){for(let k=frags.length-1;k>=0;k--){const f=frags[k];f.t+=dt;const dx=PL.x-f.x,dy=PL.y-26*K-f.y,d=Math.hypot(dx,dy)||1;
  if(f.t>.4&&d<160*K&&PL.dead<=0){f.vx+=dx/d*2400*K*dt;f.vy+=dy/d*2400*K*dt;f.vx*=.9;f.vy*=.9}else{f.vy+=1500*K*dt;f.vx*=Math.pow(.6,dt)}
  const py=f.y;f.x+=f.vx*dt;f.y+=f.vy*dt;if(f.vy>0){const hit=findLanding(f.x,py,f.y);if(hit){f.y=hit.y-3;f.vy*=-.35;f.vx*=.7}}
  if(d<26*K&&f.t>.3){frags.splice(k,1);PL.frags++;sfx('coleta',.7);hudGame();continue}if(f.t>40)frags.splice(k,1)}}
function camera(dt){const max=document.documentElement.scrollHeight-FH;camY+=(PL.y-FH*.62-camY)*Math.min(1,dt*6);camY=clamp(camY,0,max);if(Math.abs(scrollY-camY)>.5)window.scrollTo({top:camY,behavior:'instant'})}

/* ---------- drawing ---------- */
const acv=document.createElement('canvas'),ac=acv.getContext('2d'),scv=document.createElement('canvas'),sc=scv.getContext('2d');
function inkComposite(){sc.setTransform(1,0,0,1,0,0);sc.globalCompositeOperation='source-over';sc.clearRect(0,0,scv.width,scv.height);sc.drawImage(acv,0,0);sc.globalCompositeOperation='source-in';sc.fillStyle='#09060c';sc.fillRect(0,0,scv.width,scv.height);
  fc.save();fc.setTransform(1,0,0,1,0,0);fc.globalAlpha=1;fc.globalCompositeOperation='source-over';const b=Math.floor(T*8),o=1.7*FD;for(let k=0;k<8;k++){const a=k/8*TAU+b*.7,oo=o*(.85+((b*13+k*7)%5)*.09);fc.drawImage(scv,Math.cos(a)*oo,Math.sin(a)*oo)}fc.drawImage(acv,0,0);fc.restore()}
let heroAnimName='',heroAnimT0=0;
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
function drawSlash(s,lc){const a=1-s.t/.18;if(a<=0)return;const y=s.y-scrollY;fc.save();fc.globalCompositeOperation='lighter';fc.translate(s.x+(s.d===0?s.f*18*K:0),y-32*K+(s.d<0?-34*K:s.d>0?40*K:0));
  fc.rotate(s.d<0?-Math.PI/2:s.d>0?Math.PI/2:(s.f>0?0:Math.PI));fc.fillStyle=rgba(lc,a*.85);fc.beginPath();fc.arc(0,0,46*K,-1.2,1.2);fc.arc(-14*K,0,40*K,1.1,-1.1,true);fc.closePath();fc.fill();
  fc.strokeStyle=rgba('#ffffff',a*.6);fc.lineWidth=1.5;fc.beginPath();fc.arc(0,0,46*K,-1.1,1.1);fc.stroke();fc.restore();dotAt(lc,s.x+(s.d===0?s.f*40*K:0),y-32*K+(s.d<0?-40*K:s.d>0?44*K:0),60*K,a*.5)}
function drawWorld(dt,ox,oy){const lc=LC[Math.max(0,lastIdx)],ws=SC*.82,late=[];
  ac.setTransform(FD,0,0,FD,ox*FD,oy*FD);ac.clearRect(-60,-60,FW+120,FH+120);
  for(let i=0;i<ENEMIES.length;i++){const a=MODE==='play'?1:Math.min(1,weights[i]*2.5);for(const e of ENEMIES[i]){if(!e.vis)continue;if(e.k==='custom'){drawCustom(e,a,late,ox,oy);continue}const sy=e.y-scrollY,ph=T*6+e.ph*9,spr=ASSETS.enemy[e.k];
    if(spr&&spr.anims){const draw=c=>{c.globalAlpha=a;const yy=e.k==='hopper'?sy-e.j*ws:e.k==='flyer'||e.k==='dropper'||e.k==='jelly'?sy+24*ws:sy;drawSprite(c,spr,'parado',T+e.ph,e.x,yy,e.face,48*K,e.fl);c.globalAlpha=1;if(e.k==='dropper'){c.strokeStyle='rgba(207,210,190,.35)';c.beginPath();c.moveTo(e.x,e.top-scrollY);c.lineTo(e.x,sy-10*ws);c.stroke()}};
      if(spr.cfg.ink===false)late.push(()=>{fc.save();fc.translate(ox,oy);draw(fc);fc.restore()});else draw(ac);continue}
    ac.globalAlpha=a;
    if(e.k==='crawler')eCrawler(ac,e.x,sy,ws,e.face,ph,e.P,e.fl);else if(e.k==='flyer')eFlyer(ac,e.x,sy,ws,e.face,e.P,e.fl,T+e.ph);
    else if(e.k==='hopper')eHopper(ac,e.x,sy,ws,e.face,e.P,e.fl,e.j);else if(e.k==='spider')eSpider(ac,e.x,sy,ws,e.face,ph*1.4,e.P,e.fl);
    else if(e.k==='sentinel')eSentinel(ac,e.x,sy,ws*1.05,e.face,T*3+e.ph,e.P,e.fl);else if(e.k==='dropper')eDropper(ac,e.x,e.top-scrollY,sy,ws,e.P,e.fl,T+e.ph);
    else if(e.k==='jelly')eJelly(ac,e.x,sy,ws*1.2,e.P,e.fl,T,e.ph);ac.globalAlpha=1}}
  const H=MODE==='play'?{x:PL.x,y:PL.y,face:PL.face,ph:PL.ph,mv:!!PL.on&&Math.abs(PL.vx)>40*K,F:PL.F,atk:PL.atk>0?PL.atk/.22:0,sq:PL.sq,flut:PL.flut,hide:(PL.inv>0&&Math.floor(T*18)%2===0)||PL.abyss>0}
    :{x:L.x,y:L.y,face:L.face,ph:L.ph,mv:L.mv,F:L.F,atk:L.atk,sq:L.sq,flut:L.flut,hide:false};
  const Y=H.y-scrollY,onScreen=Y>-140&&Y<FH+140;let lx=H.x,ly=Y-40*K,glowOn=true;
  const an=heroAnim();if(an!==heroAnimName){heroAnimName=an;heroAnimT0=T}
  if(onScreen&&!H.hide){const spr=ASSETS.player;
    if(spr&&spr.anims){glowOn=!!spr.cfg.glow;const draw=c=>{const p=drawSprite(c,spr,an,T-heroAnimT0,H.x,Y,H.face,84*K,0);if(p)[lx,ly]=p};if(spr.cfg.ink===false)late.push(()=>{fc.save();fc.translate(ox,oy);draw(fc);fc.restore()});else draw(ac)}
    else[lx,ly]=drawLume(ac,H.x,Y,SC,H.face,H.ph,H.mv,H.F,H.atk,T,lc,H.sq,H.flut)}
  inkComposite();
  fc.save();fc.translate(ox,oy);late.forEach(f=>f());fc.restore();drawShots(ox,oy);
  if(onScreen&&!H.hide&&glowOn){const dark=weights[6]||0;dotAt(lc,lx,ly,(120+dark*260)*K,.35+dark*.15);dotAt(lc,lx,ly,14*SC,.9);if(!ASSETS.player)dotAt('#ffbf5e',H.x+H.face*2.3*SC,Y-33.5*SC,9*SC,.5)}
  for(let k=sfxSprites.length-1;k>=0;k--){const e=sfxSprites[k];e.t+=dt;if(!ASSETS.player||e.t>e.len+.02){sfxSprites.splice(k,1);continue}fc.save();fc.translate(ox+e.x,oy+e.y-scrollY);fc.rotate(e.rot);drawSprite(fc,ASSETS.player,e.a,e.t,0,0,e.face,84*K,0,true);fc.restore()}
  for(let k=slashes.length-1;k>=0;k--){const s=slashes[k];s.t+=dt;if(s.t>.18){slashes.splice(k,1);continue}drawSlash(s,lc)}
  for(let k=trails.length-1;k>=0;k--){const t=trails[k];t.a-=dt*3;if(t.a<=0){trails.splice(k,1);continue}dotAt('#cdbfd8',t.x,t.y-scrollY-28*K,34*K,t.a*.5)}
  for(let k=bursts.length-1;k>=0;k--){const b=bursts[k];b.age+=dt;if(b.age>b.life){bursts.splice(k,1);continue}b.vy+=180*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;dotAt(b.col,b.x,b.y-scrollY,b.s*3,1-b.age/b.life)}
  for(const f of frags){const x=f.x,y=f.y-scrollY;dotAt('#fff4d6',x,y,16*K,.55+Math.sin(T*6+x)*.2);fc.save();fc.translate(x,y);fc.rotate(T*2+x);fc.fillStyle='#fffaf0';fc.fillRect(-2.5*K,-2.5*K,5*K,5*K);fc.restore()}
  if(MODE==='play'&&PL.dead>0){fc.fillStyle=`rgba(3,2,6,${clamp(1-PL.dead/1.8,0,1)*.9})`;fc.fillRect(0,0,FW,FH)}
  if(MODE==='play'&&PL.abyss>0){fc.fillStyle=`rgba(245,242,255,${clamp(1-PL.abyss/2.2,0,1)*.85})`;fc.fillRect(0,0,FW,FH)}
}
function game(dt){if(!ROUTE.length)return;
  if(acv.width!==fx.width||acv.height!==fx.height){acv.width=scv.width=fx.width;acv.height=scv.height=fx.height}
  const gdt=(paused&&MODE==='play')||hitstop>0?0:dt;hitstop=Math.max(0,hitstop-dt);
  if(MODE==='play')updatePlay(gdt);else updateAuto(gdt);
  updateEnemies(gdt);updateShots(gdt);
  if(MODE==='play'){updateFrags(gdt);camera(dt)}
  let ox=0,oy=0;if(shake.t>0){shake.t-=dt;ox=(Math.random()-.5)*shake.a*2;oy=(Math.random()-.5)*shake.a*2}
  drawWorld(gdt,ox,oy)}
