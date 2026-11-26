/* ---------- salas: pintura do mapa no estilo desenhado à mão ----------
   O mapa (js/00a-mundo.js) diz onde estão as salas; aqui elas viram desenho:
   - rocha: massa escura com uma faixa de pedras ao longo das bordas, aro claro no chão, estalactites no teto;
   - enfeites por tema nas vagas do mapa (casas, lampiões, cristais, cogumelos, teias, cipós…);
   - fundo distante de cada sala (os temas de js/02-regioes.js) com névoa;
   - silhuetas escuras e desfocadas na frente do personagem.
   Tudo é desenhado em coordenadas do mundo e guardado em blocos (js/03-cenario.js), com o tratamento
   de tinta e papel de postFX por cima. */

const ROCHA_TEMA={
 cinzaraiz:{fundo:'#090c13',pedra:{base:'#222a3a',dark:'#0b0f17',light:'#5a6884'},aro:'#7684a2',grama:'#26303f',tinta:'#06080d'},
 galerias:{fundo:'#0c0906',pedra:{base:'#3a2e22',dark:'#130d08',light:'#a87e4c'},aro:'#c3925a',grama:'#4a3a24',tinta:'#080604'},
 sendas:{fundo:'#04100c',pedra:{base:'#173a30',dark:'#061612',light:'#4f9a76'},aro:'#62c48c',grama:'#2f8a5e',tinta:'#020806'},
 brejo:{fundo:'#0d0805',pedra:{base:'#3d2814',dark:'#150b05',light:'#b8763a'},aro:'#d8964e',grama:'#5a3a18',tinta:'#080402'},
 cidadela:{fundo:'#060a16',pedra:{base:'#1c2a4a',dark:'#080e1e',light:'#5a7ab8'},aro:'#86a6e6',grama:'#22345a',tinta:'#03060d'},
 minas:{fundo:'#0e0814',pedra:{base:'#34234b',dark:'#120a1c',light:'#9a6ab0'},aro:'#e88abf',grama:'#4a2a5a',tinta:'#07040b'},
 ninho:{fundo:'#050604',pedra:{base:'#1d2017',dark:'#070806',light:'#5a6048'},aro:'#8e9474',grama:'#2a2e20',tinta:'#020302'},
 fosso:{fundo:'#06060c',pedra:{base:'#23223b',dark:'#09090f',light:'#6e6ca6'},aro:'#c2baff',grama:'#2a2848',tinta:'#030308'}
};
const temaDe=nome=>ROCHA_TEMA[nome]?nome:'cinzaraiz';

/* platform look by theme (same order as REG) */
const PLAT=[
 {top:'#4a5568',body:'#161c28',dark:'#080b12',deco:'chain',acc:'#f2d49b'},
 {top:'#4a5d6e',body:'#18222c',dark:'#090d12',deco:'chain',acc:'#f2a145'},
 {top:'#2f8a60',body:'#0e2e2c',dark:'#041414',deco:'moss',acc:'#8ff0b8'},
 {top:'#b8763a',body:'#2a170b',dark:'#120a05',deco:'shroom',acc:'#ffc074'},
 {top:'#4a6aa8',body:'#13244a',dark:'#060d1c',deco:'chain',acc:'#9cc6ff'},
 {top:'#9a6ab0',body:'#2b1d3e',dark:'#140c1f',deco:'crystal',acc:'#ff9fd4'},
 {top:'#4a5040',body:'#0f110c',dark:'#030302',deco:'web',acc:'#d8e09a'},
 {top:'#3a3858',body:'#0a0a12',dark:'#000000',deco:'none',acc:'#b9b0ff'}];
function drawPlatform(c,x,y,pw,u,T,r){const th=13*u;
  if(T.deco==='chain'){c.strokeStyle=rgba(T.top,.6);c.lineWidth=1.6*u;for(const d of[-.36,.36]){const cx=x+pw*d;for(let yy=y;yy>y-520*u;yy-=7*u){c.beginPath();c.ellipse(cx,yy-3*u,(yy/7|0)%2?1.2*u:2.3*u,3*u,0,0,TAU);c.stroke()}}}
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

/* ---------- textura de pedras sem emenda (repete no mundo inteiro) ---------- */
const TEXTURA={};
function texturaPedras(tema){if(TEXTURA[tema])return TEXTURA[tema];const S=420,cv=document.createElement('canvas');cv.width=cv.height=S;const c=cv.getContext('2d'),R=ROCHA_TEMA[tema],P=R.pedra,r=rng(tema.length*911+7);
  c.fillStyle=P.dark;c.fillRect(0,0,S,S);
  const pedras=[];for(let y=-20;y<S;y+=24)for(let x=-20+r()*24;x<S;x+=22+r()*20)pedras.push([x+(r()-.5)*10,y+(r()-.5)*8,9+r()*11,r(),r()*3]);
  for(const[x,y,rad,k,a]of pedras)for(const dx of[-S,0,S])for(const dy of[-S,0,S]){const cx=x+dx,cy=y+dy;if(cx<-40||cx>S+40||cy<-40||cy>S+40)continue;
    c.fillStyle=mix(P.base,P.dark,.25+k*.45);c.beginPath();c.ellipse(cx,cy,rad,rad*.8,a,0,TAU);c.fill();c.strokeStyle=P.dark;c.lineWidth=2.6;c.stroke();
    c.strokeStyle=rgba(P.light,.08+k*.12);c.lineWidth=1.6;c.beginPath();c.arc(cx,cy,rad*.7,Math.PI*1.08,Math.PI*1.6);c.stroke()}
  return TEXTURA[tema]=cv}

/* ---------- contorno do interior de uma sala (o espaço livre) ---------- */
function tracarInterior(c,s){const P=s.n>1?(s.w/(s.n-1)):10,n=s.n,topo=k=>s.ceu?s.y-3000:s.teto[k],chao=k=>{const f=s.chao[k];return f===f?f:s.y+s.h+3};
  c.moveTo(s.x-2,topo(0));for(let k=0;k<n;k++)c.lineTo(s.x+Math.min(k*MUNDO.PASSO,s.w),topo(k));c.lineTo(s.x+s.w+2,topo(n-1));
  c.lineTo(s.x+s.w+2,chao(n-1));for(let k=n-1;k>=0;k--)c.lineTo(s.x+Math.min(k*MUNDO.PASSO,s.w),chao(k));c.lineTo(s.x-2,chao(0));c.closePath()}
/* trechos contínuos do chão e do teto (sem buracos), como listas de pontos */
function trechos(s,qual){const arr=qual==='chao'?s.chao:s.teto,out=[];let cur=null;for(let k=0;k<s.n;k++){const v=arr[k],x=s.x+Math.min(k*MUNDO.PASSO,s.w),ok=v===v&&(qual==='chao'||v>=s.y);if(ok){if(!cur){cur=[];out.push(cur)}cur.push([x,v])}else cur=null}return out}

/* ---------- um bloco do meio (rocha + enfeites + plataformas) ---------- */
function pintarBloco(c,X,Y,S,rs,salas,rapido){
  c.setTransform(rs,0,0,rs,-X*rs,-Y*rs);
  const cx=X+S/2,cy=Y+S/2;let perto=salas[0],pd=1e18;
  for(const s of salas){const dx=Math.max(s.x-cx,0,cx-s.x-s.w),dy=Math.max(s.y-cy,0,cy-s.y-s.h),d=dx*dx+dy*dy;if(d<pd){pd=d;perto=s}}
  const tBase=perto?ROCHA_TEMA[temaDe(perto.tema)]:ROCHA_TEMA.cinzaraiz;
  c.fillStyle=tBase.fundo;c.fillRect(X-2,Y-2,S+4,S+4);
  if(!rapido)for(const s of salas){const tm=temaDe(s.tema),pat=c.createPattern(texturaPedras(tm),'repeat');c.save();c.beginPath();tracarInterior(c,s);c.lineJoin='round';c.strokeStyle=pat;
    c.globalAlpha=.22;c.lineWidth=340;c.stroke();c.globalAlpha=.5;c.lineWidth=200;c.stroke();c.globalAlpha=.9;c.lineWidth=90;c.stroke();c.restore()}
  c.globalCompositeOperation='destination-out';c.beginPath();for(const s of salas)tracarInterior(c,s);c.fill();c.globalCompositeOperation='source-over';
  if(rapido)return;
  for(const s of salas){const tm=temaDe(s.tema),R=ROCHA_TEMA[tm],t=TEMA_IDS.indexOf(tm),r=rng(s.id*313+7);
    c.save();c.beginPath();tracarInterior(c,s);c.clip();
    /* sombra sob o teto e escuro nas passagens (esconde a emenda entre fundos de salas vizinhas) */
    if(!s.ceu){const g=c.createLinearGradient(0,s.y,0,s.y+340);g.addColorStop(0,'rgba(0,0,0,.55)');g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(s.x-4,s.y-4,s.w+8,344)}
    for(const[lado,x0]of[[s.ligE,s.x],[s.ligD,s.x+s.w]])if(lado){const d=x0===s.x?1:-1,g=c.createLinearGradient(x0,0,x0+d*240,0);g.addColorStop(0,'rgba(0,0,0,.72)');g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(Math.min(x0,x0+d*240),s.y-4,240,s.h+8)}
    for(const[a,b]of s.buracosTeto){const g=c.createLinearGradient(0,s.y,0,s.y+260);g.addColorStop(0,'rgba(0,0,0,.7)');g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(a-40,s.y-4,b-a+80,264)}
    for(const[a,b]of s.buracosChao){const yb=s.y+s.h,g=c.createLinearGradient(0,yb-260,0,yb);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.75)');c.fillStyle=g;c.fillRect(a-30,yb-260,b-a+60,264)}
    c.restore();
    /* aro claro do chão, tufos e estalactites */
    for(const tr of trechos(s,'chao')){if(tr[tr.length-1][0]<X-60||tr[0][0]>X+S+60)continue;
      c.strokeStyle=R.pedra.dark;c.lineWidth=16;c.lineCap='round';c.lineJoin='round';c.beginPath();tr.forEach(([x,y],k)=>k?c.lineTo(x,y+7):c.moveTo(x,y+7));c.stroke();
      c.strokeStyle=R.aro;c.lineWidth=5;c.beginPath();tr.forEach(([x,y],k)=>k?c.lineTo(x,y+1):c.moveTo(x,y+1));c.stroke();
      if(tm!=='fosso'&&tm!=='ninho'){const f=x=>MUNDO.chaoEm(s,x);grass(c,r,Math.max(tr[0][0],X-40),Math.min(tr[tr.length-1][0],X+S+40),x=>{const v=f(x);return v===v?v:-1e6},R.grama,6,tm==='sendas'?30:16,tm==='sendas'?5:9)}}
    if(!s.ceu)for(const tr of trechos(s,'teto')){if(tr[tr.length-1][0]<X-60||tr[0][0]>X+S+60)continue;
      c.fillStyle=R.pedra.dark;for(let k=0;k<tr.length;k+=3){const[x,y]=tr[k];if(r()<.5)continue;const L=(14+r()*46)*(tm==='minas'?.6:1),wd=L*(.18+r()*.14);c.beginPath();c.moveTo(x-wd,y-6);c.quadraticCurveTo(x-wd*.2,y+L*.6,x+(r()-.5)*4,y+L);c.quadraticCurveTo(x+wd*.2,y+L*.6,x+wd,y-6);c.closePath();c.fill()}}
    /* enfeites das vagas que tocam o bloco */
    for(const v of s.vagas){if(v.x<X-500||v.x>X+S+500||v.y<Y-700||v.y>Y+S+700)continue;try{enfeite(c,tm,t,v,s)}catch(e){console.warn('enfeite',tm,v.tipo,e)}}
    for(const p of s.plataformas){if(p.x<X-300||p.x>X+S+300||p.y<Y-600||p.y>Y+S+200)continue;drawPlatform(c,p.x,p.y,p.w,1,PLAT[t]||PLAT[0],rng(4441+((p.x*7+p.y)|0)))}
  }
}

/* ---------- enfeites por tema ---------- */
function enfeite(c,tm,t,v,s){const r=rng(v.seed),u=v.s,P=REG[t].p,x=v.x,y=v.y;
  const lado=r()<.5?-1:1;
  switch(tm){
  case'cinzaraiz':
    if(v.tipo==='grande'){const ww=(120+r()*60)*u,hh=(95+r()*60)*u;house(c,r,x-ww/2,y+8,ww,hh,P,u*1.1);if(r()<.6)lamp(c,x+lado*(ww*.7+20),y+4,(70+r()*30)*u,'#0a0d14',P.warm,u,'#fff0c8')}
    else if(v.tipo==='chao'){const k=r();if(k<.3)lamp(c,x,y+4,(64+r()*26)*u,'#0a0d14',P.warm,u,'#fff0c8');
      else if(k<.6){c.strokeStyle='#0d121b';branch(c,r,x,y+6,(80+r()*70)*u,-Math.PI/2+(r()-.5)*.3,9*u,6)}
      else if(k<.8){c.fillStyle='#161e30';c.fillRect(x-2.5*u,y-26*u,5*u,26*u);c.fillRect(x-9*u,y-19*u,18*u,4.5*u)}
      else{c.fillStyle='#121a28';for(let k2=0;k2<5;k2++){c.fillRect(x+k2*16*u-34*u,y-22*u,4*u,24*u)}c.fillRect(x-36*u,y-16*u,74*u,3*u)}}
    break;
  case'galerias':
    if(v.tipo==='grande'){const sw=(150+r()*90)*u,sh=(150+r()*120)*u;scaffold(c,x-sw/2,y+4,sw,sh,P.wood,u);hangLantern(c,x+lado*sw*.25,y-sh+16*u,u*1.2,P.amber,'#1a120b')}
    else if(v.tipo==='chao'){const k=r();if(k<.45)rockPile(c,r,x,y+4,(24+r()*22)*u,{base:'#3a2e22',dark:'#140e09',light:'#a07a4a'},14);
      else if(k<.75){c.fillStyle=P.wood;const b=(26+r()*14)*u;c.fillRect(x-b/2,y-b,b,b);c.strokeStyle='#140e09';c.lineWidth=2;c.strokeRect(x-b/2,y-b,b,b);c.beginPath();c.moveTo(x-b/2,y-b);c.lineTo(x+b/2,y);c.stroke()}
      else lamp(c,x,y+4,(60+r()*20)*u,'#140e09',P.amber,u,'#ffe3b0')}
    else if(v.tipo==='teto'){const L=(60+r()*120)*u;chain(c,x,y-4,x,y+L,'#2a2018',u);hangLantern(c,x,y+L,u,P.amber,'#1a120b')}
    break;
  case'sendas':
    if(v.tipo==='grande'){const w=(150+r()*80)*u,h=(170+r()*80)*u;c.fillStyle=P.wall;c.beginPath();archPath(c,x-w/2,y+6,w,h);c.fill();c.globalCompositeOperation='destination-out';c.beginPath();archPath(c,x-w*.34,y+8,w*.68,h*.82);c.fill();c.globalCompositeOperation='source-over';
      foliage(c,r,x,y-h*.92,w*.45,['#0b302a','#1d6a4f','#4fae74'],1,[P.flower,P.flower2]);for(let k=0;k<5;k++)vine(c,r,x+(r()-.5)*w,y-h*.85,(40+r()*80)*u,'#1d5a44','#3f9a6a',u)}
    else if(v.tipo==='chao'){foliage(c,r,x,y-6*u,(18+r()*20)*u,['#0b302a','#1d6a4f','#4fae74'],.8,r()<.5?[P.flower,P.flower2]:null)}
    else if(v.tipo==='teto'){for(let k=0;k<3;k++)vine(c,r,x+(k-1)*14*u,y-4,(50+r()*140)*u,'#1d5a44','#3f9a6a',u)}
    break;
  case'brejo':{const cogA={stem:P.stem,cap:'#a9521d',capLight:P.orangeL,gill:'#5a2a10',glow:P.orange},cogB={stem:'#7fb8ad',cap:'#1f7f74',capLight:P.tealL,gill:'#0d3b36',glow:P.teal};
    if(v.tipo==='grande'){mushroom(c,r,x,y+6,(170+r()*110)*u,(130+r()*80)*u,r()<.6?cogA:cogB,(r()-.5)*.25,.35)}
    else if(v.tipo==='chao'){const k=r();if(k<.6){for(let q=0;q<3;q++)mushroom(c,r,x+(q-1)*18*u,y+4,(18+r()*26)*u,(16+r()*18)*u,r()<.5?cogA:cogB,(r()-.5)*.3,.3)}
      else{c.fillStyle=rgba(P.acid,.5);c.beginPath();c.ellipse(x,y+3,(34+r()*30)*u,6*u,0,0,TAU);c.fill();glow(c,x,y,60*u,P.acid,.25)}}
    else if(v.tipo==='teto'){c.fillStyle=P.orange;for(let k=0;k<4;k++){const dx=(r()-.5)*40*u,L=(10+r()*26)*u;c.beginPath();c.ellipse(x+dx,y+L,4*u,6*u,0,0,TAU);c.fill();glow(c,x+dx,y+L,22*u,P.orange,.35)}}
    break}
  case'cidadela':
    if(v.tipo==='grande'){const k=r();if(k<.6)tower(c,r,x,y+6,(60+r()*40)*u,(260+r()*180)*u,{body:'#0f1d3c',win:P.win,dark:'#060c1a',lit:.5,ledge:'#1a2c52'},u,true);
      else{c.fillStyle='#0d1a36';const h=(150+r()*60)*u;c.fillRect(x-24*u,y-30*u,48*u,30*u);c.beginPath();c.ellipse(x,y-30*u-h*.45,20*u,h*.45,0,0,TAU);c.fill();c.beginPath();c.arc(x,y-30*u-h*.95,15*u,0,TAU);c.fill();glow(c,x,y-30*u-h*.95,30*u,P.win,.2)}}
    else if(v.tipo==='chao'){const k=r();if(k<.5)lamp(c,x,y+4,(70+r()*30)*u,P.iron,P.win,u,P.winL);else{c.fillStyle='#0d1a36';c.fillRect(x-12*u,y-(40+r()*40)*u,24*u,(40+r()*40)*u);c.fillStyle=rgba(P.win,.25);c.beginPath();c.ellipse(x,y+3,30*u,3*u,0,0,TAU);c.fill()}}
    else if(v.tipo==='teto'){const L=(50+r()*160)*u;chain(c,x,y-4,x,y+L,'#1a2c52',u);c.fillStyle='#13244a';c.beginPath();c.arc(x,y+L+6*u,7*u,0,TAU);c.fill()}
    break;
  case'minas':{const C1={d:'#7a2f69',m:'#e070b4',l:'#ffe0f2',g:'#ff9fd4'},C2={d:'#4b2f8a',m:'#9a7ae0',l:'#ece2ff',g:'#c39bff'};
    if(v.tipo==='grande'){cluster(c,r,x,y+8,(90+r()*70)*u,(r()-.5)*.4,r()<.6?C1:C2,6,.4);if(r()<.5){scaffold(c,x+lado*90*u,y+4,90*u,120*u,P.wood,u)}}
    else if(v.tipo==='chao'){if(r()<.7)cluster(c,r,x,y+6,(28+r()*30)*u,(r()-.5)*.6,r()<.6?C1:C2,4,.3);else{c.strokeStyle='#2a1c2e';c.lineWidth=3*u;c.beginPath();c.moveTo(x-60*u,y-3);c.lineTo(x+60*u,y-3);c.stroke();for(let k=-2;k<=2;k++){c.fillStyle='#3a2838';c.fillRect(x+k*24*u-5*u,y-5,10*u,6*u)}}}
    else if(v.tipo==='teto'){cluster(c,r,x,y-6,(26+r()*34)*u,Math.PI+(r()-.5)*.5,r()<.6?C1:C2,4,.3)}
    break}
  case'ninho':
    if(v.tipo==='grande'){web(c,x,y-(180+r()*80)*u,(150+r()*90)*u,9,Math.PI*.15,Math.PI*1.85,rgba(P.web,.18),1.1);for(let k=0;k<3;k++)thornVine(c,r,x+(r()-.5)*80*u,y+4,(120+r()*120)*u,-Math.PI/2+(r()-.5)*1.2,'#0d0f0a',u)}
    else if(v.tipo==='chao'){if(r()<.6)thornVine(c,r,x,y+4,(70+r()*90)*u,-Math.PI/2+(r()-.5)*1.4,'#0d0f0a',u);else{eyes(c,x,y-(40+r()*60)*u,u,P.eye,.6)}}
    else if(v.tipo==='teto'){const L=(40+r()*120)*u;c.strokeStyle=rgba(P.web,.3);c.lineWidth=1;c.beginPath();c.moveTo(x,y-4);c.lineTo(x,y+L);c.stroke();c.fillStyle=P.cocoon;c.beginPath();c.ellipse(x,y+L+16*u,9*u,18*u,0,0,TAU);c.fill();c.strokeStyle='#3e3f36';c.lineWidth=1;for(let k=0;k<4;k++){c.beginPath();c.moveTo(x-9*u,y+L+6*u+k*8*u);c.quadraticCurveTo(x,y+L+10*u+k*8*u,x+9*u,y+L+6*u+k*8*u);c.stroke()}}
    break;
  case'fosso':
    if(v.tipo==='grande'){const h=(260+r()*200)*u;c.fillStyle='#14132a';c.beginPath();c.moveTo(x-26*u,y+6);c.lineTo(x-18*u,y-h);c.lineTo(x,y-h-30*u);c.lineTo(x+18*u,y-h);c.lineTo(x+26*u,y+6);c.fill();glow(c,x,y-h,120*u,P.lav,.25);glow(c,x,y-h-20*u,24*u,P.light,.8)}
    else if(v.tipo==='chao'){tendril(c,r,x,y+4,(60+r()*80)*u,-Math.PI/2+(r()-.5)*.8,7*u,'#16152c',rgba(P.lav,.4))}
    else if(v.tipo==='teto'){tendril(c,r,x,y-4,(60+r()*120)*u,Math.PI/2+(r()-.5)*.5,6*u,'#16152c',rgba(P.lav,.35))}
    break}
}

/* ---------- fundo distante de uma sala ---------- */
function pintarFundo(c,s,bw,bh,rb,bgAsset){const tm=temaDe(s.tema),t=TEMA_IDS.indexOf(tm),R=REG[t],r=rng(7919*(s.id+1)+11);
  c.setTransform(rb,0,0,rb,0,0);
  if(bgAsset&&bgAsset.img&&bgAsset.cfg.modo!=='sobrepor')drawBg(c,bgAsset,bw,bh);
  else{try{R.back(c,bw,bh,r,1.1,R.p);DETAIL[t](c,bw,bh,rng(5557*(s.id+1)),1.1,R.p)}catch(e){console.warn('fundo',tm,e)}if(bgAsset&&bgAsset.img)drawBg(c,bgAsset,bw,bh)}
  /* silhuetas próximas (o segundo plano do fundo) e névoa */
  const P=ROCHA_TEMA[tm],cor=mix(P.fundo,R.p.far||P.pedra.base,.45);
  c.fillStyle=cor;for(let k=0;k<7;k++){const x=r()*bw,w=(60+r()*160),h=bh*(.25+r()*.5);c.beginPath();c.moveTo(x-w,bh);c.quadraticCurveTo(x-w*.4,bh-h*.9,x,bh-h);c.quadraticCurveTo(x+w*.4,bh-h*.9,x+w,bh);c.fill()}
  fog(c,bw,bh*.62,bh*.3,R.p.light||'#9aa3b8',.07);fog(c,bw,bh*.85,bh*.25,R.p.far||'#334',.22);
  const g=c.createLinearGradient(0,0,0,bh);g.addColorStop(0,'rgba(2,2,4,.35)');g.addColorStop(.5,'rgba(2,2,4,0)');g.addColorStop(1,'rgba(2,2,4,.4)');c.fillStyle=g;c.fillRect(0,0,bw,bh)}

/* ---------- silhuetas da frente (desfocadas, quase pretas) ---------- */
const FRENTE={};
function spriteFrente(tema,f){const key=tema+':'+f.tipo+':'+(f.seed%23);if(FRENTE[key])return FRENTE[key];const W=560,H=420,sc=.5,cv=document.createElement('canvas');cv.width=W*sc;cv.height=H*sc;const c=cv.getContext('2d'),r=rng(f.seed%23*97+tema.length),P=ROCHA_TEMA[tema],tinta=mix(P.tinta,'#000000',.4);
  c.setTransform(sc,0,0,sc,0,0);c.filter='blur(5px)';c.fillStyle=tinta;c.strokeStyle=tinta;
  if(f.tipo==='baixo'){const bx=W/2,by=H-40;
    c.beginPath();c.ellipse(bx,by+30,200,60,0,0,TAU);c.fill();
    if(tema==='brejo'){for(let k=0;k<3;k++){const x=bx+(k-1)*90,h=120+r()*120,cw=90+r()*60;c.fillRect(x-8,by-h,16,h);c.beginPath();c.ellipse(x,by-h,cw/2,cw*.28,0,Math.PI,0);c.fill()}}
    else if(tema==='minas'){for(let k=0;k<6;k++){const x=bx+(r()-.5)*260,L=80+r()*160,a=(r()-.5)*.7;c.save();c.translate(x,by);c.rotate(a);c.beginPath();c.moveTo(-14,0);c.lineTo(-10,-L);c.lineTo(0,-L-20);c.lineTo(10,-L);c.lineTo(14,0);c.fill();c.restore()}}
    else if(tema==='sendas'){for(let k=0;k<5;k++){c.beginPath();c.arc(bx+(r()-.5)*260,by-40-r()*80,50+r()*40,0,TAU);c.fill()}}
    else{c.lineCap='round';for(let k=0;k<26;k++){const x=bx+(r()-.5)*360,h=60+r()*170,b=(r()-.5)*70;c.lineWidth=4+r()*7;c.beginPath();c.moveTo(x,by+10);c.quadraticCurveTo(x+b*.2,by-h*.6,x+b,by-h);c.stroke()}
      for(let k=0;k<3;k++){c.beginPath();c.ellipse(bx+(r()-.5)*240,by,60+r()*50,40+r()*30,0,0,TAU);c.fill()}}}
  else{const bx=W/2,ty=30;
    if(tema==='galerias'||tema==='cidadela'){c.lineWidth=7;for(let k=0;k<2;k++){const x=bx+(k?-60:60),L=160+r()*180;for(let y=ty;y<ty+L;y+=14){c.beginPath();c.ellipse(x,y,k%2?5:9,8,0,0,TAU);c.stroke()}}}
    else if(tema==='sendas'||tema==='ninho'||tema==='fosso'){c.lineCap='round';for(let k=0;k<7;k++){const x=bx+(r()-.5)*300,L=120+r()*240;c.lineWidth=5+r()*8;c.beginPath();c.moveTo(x,ty-20);c.bezierCurveTo(x+(r()-.5)*60,ty+L*.4,x+(r()-.5)*60,ty+L*.7,x+(r()-.5)*30,ty+L);c.stroke()}}
    else{for(let k=0;k<7;k++){const x=bx+(r()-.5)*320,L=70+r()*190,w=16+r()*26;c.beginPath();c.moveTo(x-w,ty-20);c.quadraticCurveTo(x-w*.3,ty+L*.6,x,ty+L);c.quadraticCurveTo(x+w*.3,ty+L*.6,x+w,ty-20);c.fill()}}}
  return FRENTE[key]={cv,W,H,ax:f.tipo==='baixo'?W/2:W/2,ay:f.tipo==='baixo'?H-40:30}}
