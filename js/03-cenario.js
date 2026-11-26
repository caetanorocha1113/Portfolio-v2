/* ---------- the world: one map (js/00a-mundo.js), seen through a camera ----------
   The page still scrolls (the portfolio is read normally); the world is a fixed backdrop behind the text.
   Layers: far and near backgrounds of each room (two parallax depths), painted blocks of rock and decoration
   (1024 units each), then particles, characters and blurred foreground silhouettes on the .fx canvas.
   Painting is heavy, so it happens in a Web Worker (js/02c-pintor.js); until a block arrives, a quick
   silhouette of the rock stands in. Without a Worker, blocks are painted here, one per frame. */
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const secs=[...document.querySelectorAll('.realm')];/* one section per region, same order */
const WORLD=CONTEUDO.mundo,REGS=WORLD.regioes;
const TEMA=REGS.map(g=>Math.max(0,TEMA_IDS.indexOf(g.tema)));
const VARIANTE=REGS.map(g=>+g.variante||0);
WORLD.salas.forEach(s=>{s.tema=REGS[s.regiao].tema});
usarMapa(WORLD);
const mcv=document.getElementById('mundo'),mc=mcv.getContext('2d');
const CAM={x:0,y:0,ok:false};let ZOOM=1,VW=1440,VH=820,RS=1;
const PAR_LONGE=.35,PAR_PERTO=.62,PFRENTE=1.22;
function viewSetup(){const old=RS;VH=innerWidth>=innerHeight?820:1000;ZOOM=innerHeight/VH;VW=innerWidth/ZOOM;RS=clamp(ZOOM*FD,.55,1.2);
  mcv.width=Math.round(innerWidth*FD);mcv.height=Math.round(innerHeight*FD);
  if(Math.abs(old-RS)>.04){limparBlocos();limparFundos()}}

/* ---------- the painter (Web Worker) ---------- */
let PINTOR=null,PINTOR_F=null,PINTORES=[],emVoo=0,fundoEmVoo=0,vezPintor=0;
/* blocos guardados: menos em celular (cada bloco pintado ocupa alguns MB) */
const MAX_BLOCOS=matchMedia('(pointer:coarse)').matches?26:44;
function criarPintor(){try{if(typeof Worker==='undefined'||typeof OffscreenCanvas==='undefined'||location.protocol==='file:')return null;
    const w=new Worker('js/02c-pintor.js');w.onmessage=recebePintor;w.onerror=e=>{console.warn('Portfólio: pintor indisponível, pintando na página',e.message||e);PINTOR=PINTOR_F=null;PINTORES=[];emVoo=fundoEmVoo=0;blocos.forEach(b=>{b.pedido=false});fundos.forEach(f=>{f.pedido=false})};
    w.postMessage({tipo:'mundo',regioes:REGS.map(g=>({id:g.id,nome:g.nome,tema:g.tema,variante:g.variante})),semente:7});return w}catch(e){return null}}
function recebePintor(e){const m=e.data;
  if(m.tipo==='bloco'){emVoo=Math.max(0,emVoo-1);const[k,id]=m.chave.split('#'),b=blocos.get(k);if(b&&b.id==id&&Math.abs(m.rs-RS)<.001){b.img=m.bmp;b.pronto=true;b.rapido=null}else if(m.bmp.close)m.bmp.close()}
  else if(m.tipo==='fundo'){fundoEmVoo=Math.max(0,fundoEmVoo-1);const f=fundos.get(m.sala);if(f&&Math.abs(m.rs-RS)<.001){f.longe=m.longe;f.perto=m.perto;f.pronto=true}else{m.longe.bmp.close&&m.longe.bmp.close();m.perto.bmp.close&&m.perto.bmp.close()}}
  else if(m.tipo==='erro'){console.warn('Portfólio: pintor',m.msg);if(m.chave){emVoo=Math.max(0,emVoo-1);const[k,id]=m.chave.split('#'),b=blocos.get(k);if(b&&b.id==id)b.falhou=true}else{fundoEmVoo=Math.max(0,fundoEmVoo-1);const f=fundos.get(m.sala);if(f)f.falhou=true}}}
/* the owner's background images (recursos/fundos) go to the painter too */
function enviarFundoDono(i){const b=ASSETS.bg[i],P=PINTOR_F||PINTOR;if(!P)return;if(!b||!b.img){P.postMessage({tipo:'imagem',regiao:i,bmp:null});return}
  createImageBitmap(b.img).then(bmp=>P.postMessage({tipo:'imagem',regiao:i,bmp,cfg:b.cfg},[bmp])).catch(()=>{})}

/* ---------- painted blocks of the middle layer ---------- */
const BLOCO=1024,blocos=new Map();let usoTick=0;
const salasPerto=(X,Y,S,m)=>WORLD.salas.filter(s=>!salaFechada(s)&&s.x-m<X+S&&s.x+s.w+m>X&&s.y-m<Y+S&&s.y+s.h+m>Y);
/* blocos que mudaram (um segredo abriu): somem e são pintados de novo; respostas antigas do pintor são ignoradas pelo id */
function invalidarBlocos(x0,y0,x1,y1){for(const[k,b]of[...blocos]){const X=b.bx*BLOCO,Y=b.by*BLOCO;if(X+BLOCO<x0||X>x1||Y+BLOCO<y0||Y>y1)continue;if(b.img&&b.img.close)b.img.close();blocos.delete(k)}}
function limparBlocos(){blocos.forEach(b=>{if(b.img&&b.img.close)b.img.close()});blocos.clear();emVoo=0}
let idBloco=0;
function blocoEm(bx,by){const k=bx+','+by;let b=blocos.get(k);
  if(!b){b={k,id:++idBloco,bx,by,img:null,rapido:null,pronto:false,pedido:false,uso:0};blocos.set(k,b);
    if(blocos.size>MAX_BLOCOS){const v=[...blocos.values()].sort((a,c)=>a.uso-c.uso);for(let q=0;q<blocos.size-MAX_BLOCOS;q++){const o=v[q];if(o.img&&o.img.close)o.img.close();blocos.delete(o.k)}}}
  b.uso=usoTick;return b}
/* quick stand-in: just the rock silhouette, until the painted block arrives */
function provisorio(b){if(b.rapido)return b.rapido;const rr=Math.min(RS,.5),cv=novoCanvas(BLOCO*rr,BLOCO*rr);try{pintarBloco(cv.getContext('2d'),b.bx*BLOCO,b.by*BLOCO,BLOCO,rr,salasPerto(b.bx*BLOCO,b.by*BLOCO,BLOCO,420),true)}catch(e){console.warn('bloco',e)}return b.rapido=cv}
function detalharAqui(b){const X=b.bx*BLOCO,Y=b.by*BLOCO,ss=salasPerto(X,Y,BLOCO,420),cv=novoCanvas(BLOCO*RS,BLOCO*RS),c=cv.getContext('2d');
  try{pintarBloco(c,X,Y,BLOCO,RS,ss,false);postFX(cv,c,RS,'meio',b.bx*73+b.by*131+999,ss[0]?VARIANTE[ss[0].regiao]:0)}catch(e){console.warn('bloco',e)}
  b.img=cv;b.pronto=true;b.rapido=null}
/* ---------- far and near background of each room (bigger than the room, so parallax never shows an edge) ---------- */
const fundos=new Map();
function limparFundos(){fundos.forEach(f=>{for(const k of['longe','perto'])if(f[k]&&f[k].bmp&&f[k].bmp.close)f[k].bmp.close()});fundos.clear();fundoEmVoo=0}
function medidasFundo(s,par){const PX=Math.max(90,(1-par)*(VW-s.w)/2+120),PY=Math.max(90,(1-par)*(VH-s.h)/2+120);return{bw:s.w+2*PX,bh:s.h+2*PY,rb:RS*.42}}
function fundoDe(s){let f=fundos.get(s.id);if(!f){f={pronto:false,pedido:false,uso:0,longe:null,perto:null};fundos.set(s.id,f);
    if(fundos.size>14){const v=[...fundos.entries()].sort((a,b)=>a[1].uso-b[1].uso);for(let q=0;q<fundos.size-14;q++){const[id,o]=v[q];for(const k of['longe','perto'])if(o[k]&&o[k].bmp&&o[k].bmp.close)o[k].bmp.close();fundos.delete(id)}}}
  f.uso=usoTick;return f}
function pintarFundoAqui(s,f){const out={};for(const camada of['longe','perto']){const d=medidasFundo(s,camada==='longe'?PAR_LONGE:PAR_PERTO),cv=novoCanvas(d.bw*d.rb,d.bh*d.rb),c=cv.getContext('2d');
    try{if(camada==='longe'){pintarFundoLonge(c,s,d.bw,d.bh,d.rb,ASSETS.bg[s.regiao]);postFX(cv,c,d.rb,'back',s.id*7+3,VARIANTE[s.regiao])}else pintarFundoPerto(c,s,d.bw,d.bh,d.rb)}catch(e){console.warn('fundo',e)}
    out[camada]={bmp:cv,bw:d.bw,bh:d.bh}}f.longe=out.longe;f.perto=out.perto;f.pronto=true}
function rerenderRegion(i){for(const s of WORLD.salas)if(s.regiao===i){const f=fundos.get(s.id);if(f){for(const k of['longe','perto'])if(f[k]&&f[k].bmp&&f[k].bmp.close)f[k].bmp.close();fundos.delete(s.id)}}enviarFundoDono(i)}
/* ask for what the camera needs (nearest first); without a Worker, paint one thing per frame here */
function pedirPintura(x0,y0,x1,y1){
  const salasVis=WORLD.salas.filter(s=>!salaFechada(s)&&!(s.x>x1+VW*.5||s.x+s.w<x0-VW*.5||s.y>y1+VH*.5||s.y+s.h<y0-VH*.5)).sort((a,b)=>Math.hypot(a.x+a.w/2-CAM.x,a.y+a.h/2-CAM.y)-Math.hypot(b.x+b.w/2-CAM.x,b.y+b.h/2-CAM.y));
  const faltam=[...blocos.values()].filter(b=>!b.pronto&&!b.pedido&&!b.falhou&&b.uso>=usoTick-1).sort((a,b)=>Math.hypot((a.bx+.5)*BLOCO-CAM.x,(a.by+.5)*BLOCO-CAM.y)-Math.hypot((b.bx+.5)*BLOCO-CAM.x,(b.by+.5)*BLOCO-CAM.y));
  if(PINTOR){const lim=2*Math.max(1,PINTORES.length),manda=b=>{b.pedido=true;emVoo++;const w=PINTORES.length?PINTORES[vezPintor++%PINTORES.length]:PINTOR;w.postMessage({tipo:'bloco',chave:b.k+'#'+b.id,bx:b.bx,by:b.by,S:BLOCO,rs:RS})};
    for(const b of faltam){if(emVoo>=lim)break;manda(b)}
    for(const s of salasVis){if(fundoEmVoo>=1)break;const f=fundoDe(s);if(f.pronto||f.pedido||f.falhou)continue;f.pedido=true;fundoEmVoo++;
      (PINTOR_F||PINTOR).postMessage({tipo:'fundo',sala:s.id,rs:RS,longe:medidasFundo(s,PAR_LONGE),perto:medidasFundo(s,PAR_PERTO)})}
    /* blocks around the view, painted ahead (nearest first): walking into the next room finds it ready */
    if(emVoo<lim){const mx=VW*1.0,my=VH*.9,perto=[];for(let by=Math.floor((y0-my)/BLOCO);by<=Math.floor((y1+my)/BLOCO);by++)for(let bx=Math.floor((x0-mx)/BLOCO);bx<=Math.floor((x1+mx)/BLOCO);bx++){const X=bx*BLOCO,Y=by*BLOCO;if(!salasPerto(X,Y,BLOCO,200).length)continue;const k=bx+','+by,b0=blocos.get(k);if(b0){b0.uso=usoTick;if(b0.pronto||b0.pedido||b0.falhou)continue}perto.push([bx,by,Math.hypot(X+BLOCO/2-CAM.x,Y+BLOCO/2-CAM.y)])}
      perto.sort((a,b)=>a[2]-b[2]);for(const[bx,by]of perto){if(emVoo>=lim)break;manda(blocoEm(bx,by))}}
    return}
  for(const s of salasVis){const f=fundoDe(s);if(!f.pronto){pintarFundoAqui(s,f);return}}
  if(faltam[0])detalharAqui(faltam[0])}
function desenharFundoSala(s,camada,par,W,H,Z){const f=fundos.get(s.id),L=f&&f.pronto?f[camada]:null;if(!L)return false;
  const cx=W/2+(s.x+s.w/2-CAM.x)*Z*par,cy=H/2+(s.y+s.h/2-CAM.y)*Z*par;mc.drawImage(L.bmp,cx-L.bw*Z/2,cy-L.bh*Z/2,L.bw*Z,L.bh*Z);return true}
function desenharMundo(trabalhar){const W=mcv.width,H=mcv.height,Z=ZOOM*FD;usoTick++;
  mc.setTransform(1,0,0,1,0,0);mc.globalAlpha=1;mc.globalCompositeOperation='source-over';mc.fillStyle='#030407';mc.fillRect(0,0,W,H);
  const x0=CAM.x-VW/2,y0=CAM.y-VH/2,x1=x0+VW,y1=y0+VH;
  for(const s of WORLD.salas){if(s.x>x1+60||s.x+s.w<x0-60||s.y>y1+60||s.y+s.h<y0-60||salaFechada(s))continue;fundoDe(s);
    const m=60,sx=Math.round((s.x-m-CAM.x)*Z+W/2),sy=Math.round(((s.ceu?s.y-2600:s.y)-m-CAM.y)*Z+H/2),sw=Math.round((s.w+2*m)*Z),sh=Math.round(((s.ceu?s.h+2600:s.h)+2*m)*Z);
    mc.save();mc.beginPath();mc.rect(sx,sy,sw,sh);mc.clip();
    if(!desenharFundoSala(s,'longe',PAR_LONGE,W,H,Z)){const P=REG[TEMA[s.regiao]].p,g=mc.createLinearGradient(0,sy,0,sy+sh);g.addColorStop(0,P.top);g.addColorStop(1,P.bot||P.far);mc.fillStyle=g;mc.fillRect(sx,sy,sw,sh)}
    desenharFundoSala(s,'perto',PAR_PERTO,W,H,Z);
    mc.restore()}
  const bx0=Math.floor(x0/BLOCO),bx1=Math.floor(x1/BLOCO),by0=Math.floor(y0/BLOCO),by1=Math.floor(y1/BLOCO);
  for(let by=by0;by<=by1;by++)for(let bx=bx0;bx<=bx1;bx++){const b=blocoEm(bx,by),img=b.pronto?b.img:provisorio(b);const px=Math.round((bx*BLOCO-CAM.x)*Z+W/2),py=Math.round((by*BLOCO-CAM.y)*Z+H/2),
    pw=Math.round(((bx+1)*BLOCO-CAM.x)*Z+W/2)-px,ph=Math.round(((by+1)*BLOCO-CAM.y)*Z+H/2)-py;mc.drawImage(img,px,py,pw+1,ph+1)}
  if(typeof desenharParedesFalsas==='function')desenharParedesFalsas(Z,W,H);
  if(trabalhar)pedirPintura(x0,y0,x1,y1)}
/* blurred dark silhouettes in front of the characters, and grass in front of their feet (drawn on .fx, after them) */
function desenharFrente(){const x0=CAM.x-VW*.75,x1=CAM.x+VW*.75,y0=CAM.y-VH*.8,y1=CAM.y+VH*.8;
  fc.save();fc.setTransform(FD,0,0,FD,0,0);fc.globalCompositeOperation='source-over';
  for(const s of WORLD.salas){if(s.x>x1||s.x+s.w<x0||s.y>y1||s.y+s.h<y0||salaFechada(s))continue;const tm=temaDe(s.tema);
    for(const f of s.frente){if(f.x<x0-400||f.x>x1+400||f.y<y0-400||f.y>y1+400)continue;const sp=spriteFrente(tm,f),grama=f.tipo==='grama',par=grama?1:PFRENTE,Z=ZOOM*par,k=Z*f.s*(grama?.62:.5),sx=FW/2+(f.x-CAM.x)*Z,sy=FH/2+(f.y-CAM.y)*Z;
      fc.globalAlpha=grama?.95:.82;fc.drawImage(sp.cv,sx-sp.ax*k,sy-sp.ay*k,sp.W*k,sp.H*k)}}
  fc.restore()}
/* first paint of what the camera sees (used at boot, before the opening ends) */
function prepararVista(){const x0=CAM.x-VW/2,y0=CAM.y-VH/2,x1=x0+VW,y1=y0+VH;usoTick++;
  for(let by=Math.floor(y0/BLOCO);by<=Math.floor(y1/BLOCO);by++)for(let bx=Math.floor(x0/BLOCO);bx<=Math.floor(x1/BLOCO);bx++){const b=blocoEm(bx,by);if(!PINTOR&&!b.pronto)detalharAqui(b)}
  if(PINTOR){pedirPintura(x0,y0,x1,y1);pedirPintura(x0,y0,x1,y1)}
  else for(const s of WORLD.salas)if(!(s.x>x1||s.x+s.w<x0||s.y>y1||s.y+s.h<y0)){const f=fundoDe(s);if(!f.pronto)pintarFundoAqui(s,f)}}
PINTOR=criarPintor();if(PINTOR){PINTOR_F=criarPintor();PINTORES=[PINTOR];if((navigator.hardwareConcurrency||2)>=4){const w2=criarPintor();if(w2)PINTORES.push(w2)}}

/* ---------- HUD, side map and minimap ---------- */
function romanNum(n){let s='';for(const[v,r]of[[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']])while(n>=v){s+=r;n-=v}return s}
const roman=REGS.map((g,i)=>romanNum(i+1));
const map=document.getElementById('map'),mapEls=[...map.querySelectorAll('a')];
const hudRegion=document.getElementById('hudRegion'),vfillEl=document.getElementById('vfill');
let lastIdx=-1,maxIdx=0;
const visitadas=new Set(),caminhoMini=new Map();
const mini=document.getElementById('minimapa'),mic=mini?mini.getContext('2d'):null;
function desenharMinimapa(px,py,reg){if(!mic||!mini.clientWidth)return;const D=Math.min(devicePixelRatio||1,2),W=mini.clientWidth,H=mini.clientHeight;if(mini.width!==Math.round(W*D)){mini.width=Math.round(W*D);mini.height=Math.round(H*D)}
  const L=WORLD.limites,esc=Math.min((W-16)/(L.x1-L.x0),(H-16)/(L.y1-L.y0)),ox=(W-(L.x1-L.x0)*esc)/2-L.x0*esc,oy=(H-(L.y1-L.y0)*esc)/2-L.y0*esc;
  mic.setTransform(D,0,0,D,0,0);mic.clearRect(0,0,W,H);mic.setTransform(D*esc,0,0,D*esc,D*ox,D*oy);mic.lineJoin='round';
  /* the rooms with their drawn outline (simplified), like a map sketched in ink */
  for(const s of WORLD.salas){if(salaFechada(s))continue;const vis=visitadas.has(s.id),cur=s.regiao===reg;let P=caminhoMini.get(s.id);
    if(!P){P=new Path2D();const pts=contornoSala(s).pts.filter((p,k)=>k%5===0).map(([x,y])=>[x,s.ceu?Math.max(y,s.y+s.h*.55):y]);P.moveTo(pts[0][0],pts[0][1]);for(const[x,y]of pts)P.lineTo(x,y);P.closePath();caminhoMini.set(s.id,P)}
    mic.fillStyle=cur?'rgba(232,224,207,.3)':vis?'rgba(232,224,207,.14)':'rgba(232,224,207,.04)';mic.strokeStyle=cur?'rgba(242,212,155,.95)':vis?'rgba(232,224,207,.6)':'rgba(232,224,207,.22)';mic.lineWidth=1.2/esc;mic.fill(P);mic.stroke(P)}
  mic.setTransform(D,0,0,D,0,0);mic.lineWidth=1;
  mic.fillStyle='#fff6dc';mic.beginPath();mic.arc(ox+px*esc,oy+py*esc,2.6,0,TAU);mic.fill();mic.strokeStyle='rgba(255,246,220,.5)';mic.beginPath();mic.arc(ox+px*esc,oy+py*esc,5.5,0,TAU);mic.stroke()}

/* ---------- particles ---------- */
const fx=document.getElementById('fx'),fc=fx.getContext('2d');let FW=0,FH=0,FD=1;
const sprites={};function sprite(col){if(sprites[col])return sprites[col];const s=document.createElement('canvas');s.width=s.height=64;const x=s.getContext('2d'),g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,rgba(col,1));g.addColorStop(.18,rgba(col,.7));g.addColorStop(.45,rgba(col,.18));g.addColorStop(1,rgba(col,0));x.fillStyle=g;x.fillRect(0,0,64,64);return sprites[col]=s}
const R=Math.random;
const FX={
 ash:{init(p){p.vx=6+R()*12;p.vy=8+R()*16;p.s=.8+R()*1.8;p.a=.2+R()*.5;p.ph=R()*TAU},step(p,dt,t){p.x+=(p.vx+Math.sin(t*.7+p.ph)*8)*dt;p.y+=p.vy*dt},draw(c,p,a){c.globalAlpha=p.a*a;c.fillStyle=p.col;c.fillRect(p.x,p.y,p.s,p.s)}},
 drizzle:{init(p){p.vx=-70;p.vy=520+R()*300;p.l=10+R()*16;p.a=.06+R()*.12},step(p,dt){p.x+=p.vx*dt;p.y+=p.vy*dt},draw(c,p,a){c.globalAlpha=p.a*a;c.strokeStyle=p.col;c.lineWidth=1;c.beginPath();c.moveTo(p.x,p.y);c.lineTo(p.x+p.vx*p.l/p.vy,p.y+p.l);c.stroke()}},
 rain:{init(p){p.vx=50;p.vy=1000+R()*500;p.l=16+R()*22;p.a=.12+R()*.3},step(p,dt){p.x+=p.vx*dt;p.y+=p.vy*dt},draw(c,p,a){c.globalAlpha=p.a*a;c.strokeStyle=p.col;c.lineWidth=1;c.beginPath();c.moveTo(p.x,p.y);c.lineTo(p.x+p.vx*p.l/p.vy,p.y+p.l);c.stroke()}},
 motes:{glow:1,init(p){p.vx=(R()-.5)*10;p.vy=(R()-.5)*10;p.s=2+R()*5;p.a=.25+R()*.55;p.ph=R()*TAU},step(p,dt,t){p.vx+=(R()-.5)*14*dt;p.vy+=(R()-.5)*14*dt;p.vx*=.99;p.vy*=.99;p.x+=p.vx*dt;p.y+=(p.vy-3)*dt},draw(c,p,a,t){dot(c,p.col,p.x,p.y,p.s*2.4,p.a*a*(.6+.4*Math.sin(t*1.5+p.ph)))}},
 dust:{init(p){p.vx=(R()-.5)*4;p.vy=4+R()*8;p.s=.8+R()*1.6;p.a=.15+R()*.3;p.ph=R()*TAU},step(p,dt,t){p.x+=(p.vx+Math.sin(t*.4+p.ph)*3)*dt;p.y+=p.vy*dt},draw(c,p,a){c.globalAlpha=p.a*a;c.fillStyle=p.col;c.fillRect(p.x,p.y,p.s,p.s)}},
 leaves:{init(p){p.vy=28+R()*40;p.s=4+R()*6;p.a=.55+R()*.4;p.ph=R()*TAU;p.rot=R()*TAU;p.vr=(R()-.5)*3;p.c2=R()<.5?'#2c8a5e':'#7fd39a'},step(p,dt,t){p.x+=Math.sin(t*1.2+p.ph)*36*dt;p.y+=p.vy*dt;p.rot+=p.vr*dt},draw(c,p,a){c.globalAlpha=p.a*a;c.fillStyle=p.c2;c.save();c.translate(p.x,p.y);c.rotate(p.rot);c.scale(1,Math.abs(Math.cos(p.rot*1.7))*.8+.2);c.beginPath();c.ellipse(0,0,p.s,p.s*.45,0,0,TAU);c.fill();c.restore()}},
 fireflies:{glow:1,init(p){p.vx=(R()-.5)*20;p.vy=(R()-.5)*20;p.s=1.5+R()*2.5;p.ph=R()*TAU;p.f=.8+R()*1.6},step(p,dt){p.vx+=(R()-.5)*40*dt;p.vy+=(R()-.5)*40*dt;p.vx*=.985;p.vy*=.985;p.x+=p.vx*dt;p.y+=p.vy*dt},draw(c,p,a,t){const k=Math.max(0,Math.sin(t*p.f+p.ph));dot(c,p.col,p.x,p.y,p.s*5,k*a*.95);c.globalAlpha=k*a;c.fillStyle='#ffffe0';c.fillRect(p.x-.8,p.y-.8,1.6,1.6)}},
 spores:{glow:1,init(p){p.vy=-(10+R()*28);p.s=1.5+R()*3.5;p.a=.3+R()*.6;p.ph=R()*TAU},step(p,dt,t){p.x+=Math.sin(t*.8+p.ph)*14*dt;p.y+=p.vy*dt},draw(c,p,a,t){dot(c,p.col,p.x,p.y,p.s*3,p.a*a*(.7+.3*Math.sin(t*2+p.ph)))}},
 sparkle:{glow:1,init(p){p.vx=(R()-.5)*6;p.vy=-2-R()*6;p.s=2+R()*5;p.ph=R()*TAU;p.f=1+R()*2.5},step(p,dt){p.x+=p.vx*dt;p.y+=p.vy*dt},draw(c,p,a,t){const k=Math.pow(Math.max(0,Math.sin(t*p.f+p.ph)),3);if(k<.02)return;dot(c,p.col,p.x,p.y,p.s*2.5,k*a*.8);c.globalAlpha=k*a;c.strokeStyle='#fff3fb';c.lineWidth=1;c.beginPath();c.moveTo(p.x-p.s*1.6,p.y);c.lineTo(p.x+p.s*1.6,p.y);c.moveTo(p.x,p.y-p.s*1.6);c.lineTo(p.x,p.y+p.s*1.6);c.stroke()}},
 rise:{glow:1,init(p){p.vy=-(8+R()*26);p.s=1+R()*3;p.a=.2+R()*.7;p.ph=R()*TAU},step(p,dt,t){p.x+=Math.sin(t*.5+p.ph)*6*dt;p.y+=p.vy*dt},draw(c,p,a){dot(c,p.col,p.x,p.y,p.s*3,p.a*a)}},
 eyes:{static:1,init(p){p.life=3+R()*6;p.age=R()*p.life;p.s=.8+R()*1.1;p.ph=R()*5},step(p,dt){p.age+=dt;if(p.age>p.life){p.age=0;p.x=R()*FW;p.y=FH*(.1+R()*.85)}},draw(c,p,a){const k=Math.sin(Math.PI*p.age/p.life),bl=((p.age*1.1+p.ph)%3.4)<.13?.12:1;const al=k*a*.85;if(al<.02)return;dot(c,p.col,p.x,p.y,14*p.s,al*.35);c.globalAlpha=al;c.fillStyle=p.col;for(const d of[-1,1]){c.beginPath();c.moveTo(p.x+d*1.5*p.s,p.y);c.quadraticCurveTo(p.x+d*4*p.s,p.y-2.4*p.s*bl,p.x+d*7*p.s,p.y-1*p.s*bl);c.quadraticCurveTo(p.x+d*4.5*p.s,p.y+1.8*p.s*bl,p.x+d*1.5*p.s,p.y);c.fill()}}}
};
function dot(c,col,x,y,rad,a){if(a<=.01)return;c.globalAlpha=Math.min(1,a);c.drawImage(sprite(col),x-rad,y-rad,rad*2,rad*2)}
let pools=[];
function initFx(){FD=Math.min(window.devicePixelRatio||1,1.5);FW=innerWidth;FH=innerHeight;fx.width=Math.round(FW*FD);fx.height=Math.round(FH*FD);fc.setTransform(FD,0,0,FD,0,0);viewSetup();
  const k=clamp(FW*FH/(1440*900),.35,1.2);
  pools=TEMA.map(t=>REG[t].fx.map(([type,n,col])=>{const arr=[];const m=Math.round(n*k*(reduce?.4:1));for(let j=0;j<m;j++){const p={x:R()*FW,y:R()*FH,col};FX[type].init(p);arr.push(p)}return{type,arr}}))}

/* ---------- actors ---------- */
const LC=['#ffd896','#ffc77a','#d6ffe4','#ffdca8','#dbe9ff','#ffd8f0','#ffe2b0','#f3eeff'];/* by theme */
const lcOf=i=>LC[TEMA[clamp(i|0,0,TEMA.length-1)]]||LC[0];
const tri=p=>1-Math.abs((((p%2)+2)%2)-1);
const WH=(c0,f)=>f>0?mix(c0,'#ffffff',Math.min(1,f)):c0;
function dotAt(col,x,y,rad,a){const o=fc.globalCompositeOperation;fc.globalCompositeOperation='lighter';dot(fc,col,x,y,rad,a);fc.globalAlpha=1;fc.globalCompositeOperation=o}

/* fallback character drawn in code (used only when recursos/personagem/ is empty): hooded moth wanderer, dark face with two amber eyes, feathery antennae through the hood, ragged cloak, lantern */
function drawLume(c,x,y,s,face,ph,mv,F,atk,t,lc,sq=1,flut=0){
  const jr=rng(Math.floor(t*8)*7+3),J=a=>(jr()-.5)*a,INK='#0a080d';
  c.save();c.translate(x,y);c.scale(s*face*(1+(1-sq)*.7),s*sq);c.lineJoin='round';c.lineCap='round';
  const bob=mv?-Math.abs(Math.sin(ph))*2:Math.sin(t*2)*.5,la=mv?Math.sin(ph)*3.5:0,sw=mv?Math.sin(ph)*1.6:Math.sin(t*1.4)*.6;
  c.strokeStyle=INK;c.lineWidth=2.8;
  if(F>.5){c.beginPath();c.moveTo(-3,-9);c.lineTo(-5,-5);c.moveTo(3,-9);c.lineTo(4,-5);c.stroke()}
  else{c.beginPath();c.moveTo(-3,-9);c.lineTo(-4+la,0);c.moveTo(3,-9);c.lineTo(4-la,0);c.stroke()}
  c.translate(0,bob);
  if(flut>.02){c.save();c.globalAlpha=Math.min(1,flut*1.4);const fa=Math.sin(t*38)*.35;for(const d of[-1,1]){c.save();c.translate(-1,-22);c.rotate(d*(.95+fa)-.25);c.fillStyle='#cdbfd8';c.beginPath();c.ellipse(0,-12,7,13,0,0,TAU);c.fill();c.strokeStyle=INK;c.lineWidth=1.4;c.stroke();c.fillStyle='#6b5874';c.beginPath();c.arc(0,-14,2.6,0,TAU);c.fill();c.restore()}c.restore()}
  // ragged cloak
  const hem=[[-12,-6],[-9.5,-1.5],[-7,-5],[-4,-.5],[-1,-4.5],[2,0],[5,-4],[8,-1],[11.5,-5.5]];
  c.fillStyle='#3a4856';c.beginPath();c.moveTo(-7+J(.8),-23);c.quadraticCurveTo(-14+J(1),-15,hem[0][0]-3*F+sw,hem[0][1]-4*F);
  hem.forEach(([hx,hy],k)=>{if(k)c.lineTo(hx*(1+F*.25)+sw+J(1.2),hy-4*F-(k%2?0:F*2)+J(1))});
  c.quadraticCurveTo(14+J(1),-15,7+J(.8),-23);c.closePath();c.fill();c.lineWidth=1.8;c.stroke();
  c.strokeStyle='#1c242d';c.lineWidth=1.3;c.beginPath();c.moveTo(-4+J(.6),-20);c.quadraticCurveTo(-6,-12,-6+sw,-4);c.moveTo(3+J(.6),-20);c.quadraticCurveTo(4,-12,4+sw,-3);c.stroke();
  // antennae through the hood
  c.strokeStyle=INK;c.lineWidth=1.6;
  for(const d of[-1,1]){const bx=1+d*3.5,by=-45,tx=1+d*10+J(1.5)-F*d*-2,ty=-58+F*3+J(1.5);c.beginPath();c.moveTo(bx,by);c.quadraticCurveTo(bx+d*1.5,by-8,tx,ty);c.stroke();c.lineWidth=.9;
    for(let k=.3;k<1;k+=.17){const px=lerp(bx,tx,k)+d*k*1.2,py=lerp(by,ty,k);c.beginPath();c.moveTo(px,py);c.lineTo(px+d*2.6,py+1.2+J(.6));c.moveTo(px,py);c.lineTo(px-d*1.2,py-2.2);c.stroke()}c.lineWidth=1.6}
  // hood
  c.fillStyle='#6b5874';c.beginPath();c.moveTo(-12+J(.8),-24);c.bezierCurveTo(-15+J(1),-36,-9,-47+J(1),0,-47+J(.8));c.bezierCurveTo(8,-47,14+J(1),-40,13,-30);c.quadraticCurveTo(13+J(.6),-25,10,-22);c.quadraticCurveTo(0,-19+J(.8),-12,-24);c.closePath();c.fill();c.strokeStyle=INK;c.lineWidth=2.2;c.stroke();
  c.strokeStyle='#4a3b52';c.lineWidth=1.1;c.beginPath();c.moveTo(-9,-40);c.quadraticCurveTo(-11,-32,-9,-25);c.stroke();
  // face opening
  c.fillStyle='#07060a';c.beginPath();c.ellipse(2.5+J(.4),-33,7.6,7.2,0,0,TAU);c.fill();
  const bl=((t+1.3)%4.2)<.12?.15:1;c.fillStyle='#ffbf5e';c.beginPath();c.ellipse(-.6,-33.5,1.7,2.3*bl,0,0,TAU);c.ellipse(5.2,-33.5,1.7,2.3*bl,0,0,TAU);c.fill();
  // lantern on a crooked stick
  const tx=atk>0?lerp(12,20,atk):12,ty=atk>0?lerp(-24,-20,atk):F>.5?-29:-24;
  c.strokeStyle='#2b2018';c.lineWidth=2.2;c.beginPath();c.moveTo(6,-14);c.quadraticCurveTo(9+J(.6),-18,tx,ty);c.stroke();
  const lx=tx+.5,ly=ty+6.5;c.strokeStyle=INK;c.lineWidth=1;c.beginPath();c.moveTo(tx,ty);c.lineTo(lx,ly-3.6);c.stroke();
  c.fillStyle=mix(lc,'#ffffff',.35);c.beginPath();c.moveTo(lx-2.6,ly-3);c.lineTo(lx+2.6,ly-3);c.lineTo(lx+2.2,ly+3);c.lineTo(lx-2.2,ly+3);c.closePath();c.fill();c.lineWidth=1.3;c.stroke();
  c.restore();return[x+lx*s*face,y+(ly+bob)*s]}
function eCrawler(c,x,y,s,f,ph,P,fl){c.save();c.translate(x,y);c.scale(s*f,s);
  c.fillStyle='rgba(0,0,0,.4)';c.beginPath();c.ellipse(0,0,24,3,0,0,TAU);c.fill();
  c.strokeStyle=WH(P.leg,fl);c.lineWidth=2.4;c.lineCap='round';
  for(let k=0;k<3;k++){const lx=-13+k*11,sw=Math.sin(ph+k*2.1)*4;c.beginPath();c.moveTo(lx,-8);c.lineTo(lx+sw-3,-3-Math.max(0,Math.cos(ph+k*2.1))*2);c.lineTo(lx+sw,0);c.stroke()}
  c.fillStyle=WH(P.shell,fl);c.beginPath();c.moveTo(-24,-6);c.bezierCurveTo(-24,-31,19,-31,19,-6);c.closePath();c.fill();
  c.strokeStyle=WH(mix(P.shell,'#ffffff',.22),fl);c.lineWidth=1.2;for(const k of[-12,-3,6]){c.beginPath();c.moveTo(k,-7);c.quadraticCurveTo(k+2,-17,k+5,-23);c.stroke()}
  if(P.moss){for(let k=0;k<14;k++){c.fillStyle=k%3?P.moss:mix(P.moss,'#ffffff',.3);c.beginPath();c.arc(-18+k*2.6,-22+Math.abs(k-7)*1.1-(k%2)*2,2.6,0,TAU);c.fill()}}
  if(P.cryst){for(const [cx,h,a] of[[-10,16,-.3],[-2,22,0],[7,14,.35]]){c.save();c.translate(cx,-22);c.rotate(a);c.fillStyle=WH(P.cryst,fl);c.beginPath();c.moveTo(-3,4);c.lineTo(-3,-h*.7);c.lineTo(0,-h);c.lineTo(3,-h*.7);c.lineTo(3,4);c.fill();c.fillStyle='rgba(255,255,255,.45)';c.fillRect(-.6,-h*.7,1.2,h*.7);c.restore()}}
  c.fillStyle=WH(P.head,fl);c.beginPath();c.ellipse(21,-9,8,6.5,0,0,TAU);c.fill();
  c.strokeStyle=WH(P.head,fl);c.lineWidth=1.4;c.beginPath();c.moveTo(25,-14);c.quadraticCurveTo(30,-22+Math.sin(ph)*1.5,35,-21);c.stroke();
  c.fillStyle=P.eye;c.beginPath();c.ellipse(24,-10,2,2.4,0,0,TAU);c.fill();
  c.restore();if(P.cryst)dotAt(P.cryst,x-2*s*f,y-40*s,40*s,.5);dotAt(P.eye,x+24*s*f,y-10*s,10*s,.6)}
function eFlyer(c,x,y,s,f,P,fl,t){c.save();c.translate(x,y);c.scale(s*f,s);const fw=Math.abs(Math.sin(t*26));
  c.fillStyle=rgba(P.wing,.3+.25*fw);c.beginPath();c.ellipse(-3,-11-6*fw,14,4+5*fw,-.6,0,TAU);c.fill();c.beginPath();c.ellipse(4,-10-5*fw,11,3+4*fw,-.25,0,TAU);c.fill();
  c.strokeStyle=WH(P.body,fl);c.lineWidth=1.3;for(let k=0;k<3;k++){c.beginPath();c.moveTo(-3+k*4,5);c.quadraticCurveTo(-5+k*4,11,-8+k*4,14+Math.sin(t*3+k)*1.5);c.stroke()}
  c.fillStyle=WH(P.body,fl);c.beginPath();c.ellipse(-12,3,9,5.5,.45,0,TAU);c.fill();c.beginPath();c.moveTo(-19,6);c.lineTo(-27,11);c.lineTo(-17,9);c.fill();
  c.beginPath();c.ellipse(0,0,10,7.5,.1,0,TAU);c.fill();c.beginPath();c.arc(10,-2,6,0,TAU);c.fill();
  if(P.band){c.fillStyle=WH(P.band,fl);c.beginPath();c.ellipse(-12,3,3,5,.45,0,TAU);c.fill()}
  c.fillStyle=P.eye;c.beginPath();c.arc(12.5,-3,2.1,0,TAU);c.fill();
  c.restore();dotAt(P.eye,x+12*s*f,y-3*s,12*s,.7);if(P.glow)dotAt(P.glow,x,y,46*s,.35)}
function eHopper(c,x,y,s,f,P,fl,j){c.save();c.translate(x,y);c.scale(s*f,s);
  c.fillStyle='rgba(0,0,0,.4)';c.beginPath();c.ellipse(0,0,16*(1-j/60),3,0,0,TAU);c.fill();
  const sq=j<4?1.15:1,by=-12-j;c.strokeStyle=WH(P.leg,fl);c.lineWidth=2.6;c.lineCap='round';
  for(const d of[-1,1]){c.beginPath();c.moveTo(d*5,by+4);c.lineTo(d*(9+j*.1),by+10+j*.5);c.lineTo(d*6,j>2?by+16+j*.4:0);c.stroke()}
  c.fillStyle=WH(P.body,fl);c.beginPath();c.ellipse(0,by,11*sq,10/sq,0,0,TAU);c.fill();
  c.fillStyle=WH(P.cap,fl);c.beginPath();c.moveTo(-17*sq,by-5);c.bezierCurveTo(-17*sq,by-28,17*sq,by-28,17*sq,by-5);c.quadraticCurveTo(0,by-9,-17*sq,by-5);c.fill();
  c.fillStyle='rgba(255,240,210,.65)';for(const [a,b,r] of[[-8,-14,2.4],[2,-19,3],[9,-12,2]]){c.beginPath();c.arc(a,by+b+5,r,0,TAU);c.fill()}
  c.fillStyle=P.eye;c.beginPath();c.ellipse(4,by+1,1.8,2.6,0,0,TAU);c.ellipse(8,by+1,1.5,2.2,0,0,TAU);c.fill();
  c.restore();dotAt(P.glow,x,y+(-20-j)*s,50*s,.4)}
function eSpider(c,x,y,s,f,ph,P,fl){c.save();c.translate(x,y);c.scale(s*f,s);
  c.strokeStyle=WH(P.leg,fl);c.lineWidth=1.8;c.lineCap='round';
  for(let k=0;k<8;k++){const bx=-6+k*2.2,kx=-34+k*9.5,fx=-38+k*10.5+Math.sin(ph+k*1.7)*5,ky=-30+(k%2)*5-Math.max(0,Math.sin(ph+k*1.7))*4;c.beginPath();c.moveTo(bx,-13);c.lineTo(kx,ky);c.lineTo(fx,0);c.stroke()}
  c.fillStyle=WH(P.body,fl);c.beginPath();c.ellipse(-12,-16,17,12,-.15,0,TAU);c.fill();c.beginPath();c.ellipse(9,-13,10,7.5,0,0,TAU);c.fill();
  c.strokeStyle=WH(mix(P.body,'#ffffff',.15),fl);c.lineWidth=1;c.beginPath();c.moveTo(-24,-20);c.quadraticCurveTo(-12,-26,0,-20);c.stroke();
  c.fillStyle=P.eye;for(const [a,b,r] of[[15,-15,1.8],[12,-18,1.4],[17,-11,1.3],[10,-14,1.1]]){c.beginPath();c.arc(a,b,r,0,TAU);c.fill()}
  c.restore();dotAt(P.eye,x+14*s*f,y-15*s,14*s,.55)}
function eDropper(c,x,y0,y,s,P,fl,t){c.strokeStyle=rgba('#cfd2be',.35);c.lineWidth=1;c.beginPath();c.moveTo(x,y0);c.lineTo(x,y-10*s);c.stroke();
  c.save();c.translate(x,y);c.scale(s,s);c.strokeStyle=WH(P.leg,fl);c.lineWidth=1.6;
  for(let k=0;k<4;k++)for(const d of[-1,1]){const a=Math.sin(t*3+k)*.2;c.beginPath();c.moveTo(0,-4);c.quadraticCurveTo(d*(12+k*2),-14+k*6+a*10,d*(8+k*2),2+k*4);c.stroke()}
  c.fillStyle=WH(P.body,fl);c.beginPath();c.ellipse(0,-2,10,12,0,0,TAU);c.fill();
  c.fillStyle=P.eye;c.beginPath();c.arc(-3,5,1.6,0,TAU);c.arc(3,5,1.6,0,TAU);c.fill();c.restore();dotAt(P.eye,x,y+5*s,12*s,.6)}
function eSentinel(c,x,y,s,f,ph,P,fl){c.save();c.translate(x,y);c.scale(s*f,s);
  c.fillStyle='rgba(0,0,0,.4)';c.beginPath();c.ellipse(0,0,18,3,0,0,TAU);c.fill();
  c.fillStyle=WH(P.leg,fl);const st=Math.sin(ph)*4;c.fillRect(-8+st,-12,5,12);c.fillRect(3-st,-12,5,12);
  c.fillStyle=WH(P.body,fl);c.beginPath();c.ellipse(0,-38,15,28,0,0,TAU);c.fill();
  c.strokeStyle=WH(P.rim,fl);c.lineWidth=1.3;for(let k=0;k<4;k++){c.beginPath();c.ellipse(0,-30+k*-9,14-k*1.5,4,0,0,Math.PI);c.stroke()}
  c.fillStyle=WH(P.body,fl);c.beginPath();c.moveTo(-11,-62);c.bezierCurveTo(-12,-84,10,-86,12,-64);c.closePath();c.fill();
  c.beginPath();c.moveTo(-4,-80);c.quadraticCurveTo(-14,-96,-24,-100);c.quadraticCurveTo(-10,-90,2,-82);c.fill();
  c.fillStyle=P.eye;c.fillRect(1,-71,10,2.4);
  c.strokeStyle=WH(P.leg,fl);c.lineWidth=2.2;c.beginPath();c.moveTo(10,-20);c.lineTo(30,-96);c.stroke();
  c.fillStyle=WH(P.rim,fl);c.beginPath();c.moveTo(27,-94);c.lineTo(33,-112);c.lineTo(35,-92);c.fill();
  c.restore();dotAt(P.eye,x+6*s*f,y-70*s,16*s,.7)}
function eJelly(c,x,y,s,P,fl,t,ph){const pu=1+Math.sin(t*1.6+ph)*.12;dotAt(P.glow,x,y,70*s,.35);c.save();c.translate(x,y);c.scale(s,s);
  c.fillStyle=rgba(WH(P.body,fl),.55);c.beginPath();c.moveTo(-15*pu,0);c.bezierCurveTo(-15*pu,-22/pu,15*pu,-22/pu,15*pu,0);c.quadraticCurveTo(0,-5,-15*pu,0);c.fill();
  c.strokeStyle=rgba(P.glow,.45);c.lineWidth=1;for(let k=-2;k<=2;k++){c.beginPath();c.moveTo(k*5,0);c.bezierCurveTo(k*5+Math.sin(t*2+k)*7,14,k*5-Math.sin(t*2+k)*7,26,k*5+Math.sin(t*1.3+k)*4,40+Math.abs(k)*-4);c.stroke()}
  c.fillStyle=rgba('#ffffff',.7);c.beginPath();c.arc(-4,-8,1.6,0,TAU);c.arc(4,-8,1.6,0,TAU);c.fill();c.restore()}

const ENEMY_DEF=[
 [{k:'crawler',x0:.66,rg:.36,sp:.05,P:{shell:'#2a3245',head:'#1a2030',leg:'#0d1119',eye:'#f4c97a'}},{k:'flyer',x0:.3,rg:.4,sp:.04,hv:190,P:{body:'#1a2132',wing:'#c9d6ee',eye:'#f4c97a'}}],
 [{k:'crawler',x0:.3,rg:.4,sp:.055,P:{shell:'#3a3024',head:'#241c14',leg:'#120d09',eye:'#ffcf80'}},{k:'crawler',x0:.72,rg:.3,sp:.07,P:{shell:'#2a3644',head:'#18212b',leg:'#0a0f14',eye:'#ffb05a'}},{k:'flyer',x0:.5,rg:.5,sp:.035,hv:230,P:{body:'#241c14',wing:'#ffcf80',eye:'#ffe0a0',glow:'#f2a145'}}],
 [{k:'crawler',x0:.35,rg:.4,sp:.05,P:{shell:'#123a30',head:'#0b2620',leg:'#06140f',eye:'#c6f5dc',moss:'#3f9a6a'}},{k:'flyer',x0:.62,rg:.4,sp:.05,hv:170,P:{body:'#0d3328',wing:'#a8e6a0',eye:'#d6ffe4',band:'#4fae74'}},{k:'flyer',x0:.25,rg:.3,sp:.06,hv:260,P:{body:'#0d3328',wing:'#a9a5ff',eye:'#d6ffe4',band:'#6f63e0'}}],
 [{k:'hopper',x0:.3,rg:.35,sp:.045,P:{body:'#5a3418',cap:'#d0702c',leg:'#2a170b',eye:'#fff1d0',glow:'#e88a3c'}},{k:'hopper',x0:.75,rg:.25,sp:.06,P:{body:'#1d4a44',cap:'#2fa094',leg:'#0d2622',eye:'#e0fff8',glow:'#3cb3a3'}},{k:'flyer',x0:.55,rg:.45,sp:.04,hv:210,P:{body:'#4a2a12',wing:'#ffd27a',eye:'#ffe8b0',glow:'#ffc074',band:'#ffc074'}}],
 [{k:'sentinel',x0:.5,rg:.5,sp:.03,P:{body:'#16294f',leg:'#0a142b',rim:'#9cc6ff',eye:'#e3efff'}},{k:'flyer',x0:.3,rg:.35,sp:.05,hv:240,P:{body:'#0f1f40',wing:'#b9d4ff',eye:'#e3efff',glow:'#9cc6ff'}},{k:'flyer',x0:.7,rg:.3,sp:.06,hv:180,P:{body:'#0f1f40',wing:'#b9d4ff',eye:'#e3efff'}}],
 [{k:'crawler',x0:.3,rg:.3,sp:.05,P:{shell:'#3e2a52',head:'#26193a',leg:'#140c1f',eye:'#ffe0f2',cryst:'#ff9fd4'}},{k:'crawler',x0:.7,rg:.25,sp:.065,P:{shell:'#3e2a52',head:'#26193a',leg:'#140c1f',eye:'#ffe0f2',cryst:'#c39bff'}},{k:'flyer',x0:.5,rg:.45,sp:.04,hv:220,P:{body:'#2a1c3c',wing:'#ffc4e6',eye:'#ffe0f2',glow:'#ff9fd4'}}],
 [{k:'spider',x0:.4,rg:.45,sp:.06,P:{body:'#121410',leg:'#0b0c09',eye:'#eef3c4'}},{k:'spider',x0:.75,rg:.3,sp:.08,P:{body:'#16180f',leg:'#0b0c09',eye:'#e8f0c0'}},{k:'dropper',x0:.58,P:{body:'#1b1d15',leg:'#0e0f0b',eye:'#eef3c4'}},{k:'dropper',x0:.86,P:{body:'#1b1d15',leg:'#0e0f0b',eye:'#eef3c4'}}],
 [{k:'jelly',x0:.55,rg:.06,yf:.45,P:{body:'#d9d3ff',glow:'#b9b0ff'}},{k:'jelly',x0:.75,rg:.05,yf:.6,P:{body:'#d9d3ff',glow:'#b9b0ff'}},{k:'jelly',x0:.65,rg:.07,yf:.78,P:{body:'#f2efff',glow:'#d9d3ff'}}]
];
