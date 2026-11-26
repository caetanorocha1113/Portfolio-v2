/* ---------- salas: pintura do mapa no estilo desenhado à mão ----------
   O mapa (js/00a-mundo.js) diz onde estão as salas; aqui elas viram desenho:
   - contorno orgânico de cada sala (paredes e tetos irregulares; o chão segue a colisão de perto);
   - rocha escura com pedras irregulares embutidas na borda, traço de tinta grosso, sombra dentro das salas;
   - aro claro e mato no chão, estalactites e raízes no teto;
   - enfeites por tema na escala do personagem (~84 unidades de altura);
   - fundo de cada sala em duas camadas (longe e perto) com névoa;
   - silhuetas escuras e desfocadas na frente (desenhadas a cada quadro em js/03-cenario.js).
   Roda na página e dentro do pintor (js/02c-pintor.js, um Web Worker): nada aqui depende do DOM. */

function novoCanvas(w,h){w=Math.max(1,Math.ceil(w));h=Math.max(1,Math.ceil(h));if(typeof OffscreenCanvas!=='undefined')return new OffscreenCanvas(w,h);const c=document.createElement('canvas');c.width=w;c.height=h;return c}

/* ---------- papel e tinta ---------- */
const GRAIN=(()=>{const g=typeof document!=='undefined'?Object.assign(document.createElement('canvas'),{width:256,height:256}):novoCanvas(256,256);const x=g.getContext('2d'),r=rng(99);
  for(let i=0;i<9000;i++){const v=r();x.fillStyle=v<.55?`rgba(0,0,0,${r()*.35})`:`rgba(255,238,215,${r()*.08})`;x.fillRect(r()*256,r()*256,r()*1.8+.4,r()*1.8+.4)}
  for(let i=0;i<46;i++){x.strokeStyle=`rgba(0,0,0,${.05+r()*.14})`;x.lineWidth=.6;x.beginPath();const a=r()*256,b=r()*256;x.moveTo(a,b);x.quadraticCurveTo(a+(r()-.5)*40,b+(r()-.5)*40,a+(r()-.5)*70,b+(r()-.5)*70);x.stroke()}return g})();
const TMP=novoCanvas(4,4),TMPc=TMP.getContext('2d',{willReadFrequently:true});
/* desatura, põe grão e manchas e (no 'meio') um contorno de tinta tremido em volta de tudo o que é opaco */
function postFX(cv,c,d,l,seed,hue){const W=cv.width,H=cv.height;if(W<4)return;TMP.width=W;TMP.height=H;const t=TMPc;t.drawImage(cv,0,0);
  c.save();c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,W,H);c.filter=(l==='back'?'saturate(.6) contrast(1.06) brightness(.88)':'saturate(.78) contrast(1.05) brightness(.96)')+(hue?` hue-rotate(${hue}deg)`:'');c.drawImage(TMP,0,0);c.filter='none';
  const r=rng(313*(seed+1)+l.length*7);
  c.globalCompositeOperation='source-atop';c.fillStyle=c.createPattern(GRAIN,'repeat');c.globalAlpha=l==='back'?.7:.85;c.fillRect(0,0,W,H);c.globalAlpha=1;
  /* manchas só no fundo: nos blocos do meio elas mudariam de um bloco para o outro e deixariam emendas */
  if(l==='back')for(let k=0;k<18;k++){const x=r()*W,y=r()*H,rad=(80+r()*260)*d,g=c.createRadialGradient(x,y,0,x,y,rad);g.addColorStop(0,`rgba(6,4,8,${.08+r()*.14})`);g.addColorStop(1,'rgba(6,4,8,0)');c.fillStyle=g;c.fillRect(x-rad,y-rad,rad*2,rad*2)}
  if(l==='meio'){c.strokeStyle='rgba(6,5,9,.32)';c.lineWidth=1.3*d;for(let k=0;k<90;k++){const x=r()*W,y=r()*H,n=3+(r()*5|0),L=(8+r()*16)*d,a=-1+r()*.35;for(let m=0;m<n;m++){const ox=x+m*3.6*d;c.beginPath();c.moveTo(ox,y);c.lineTo(ox+Math.cos(a)*L,y+Math.sin(a)*L);c.stroke()}}
    t.setTransform(1,0,0,1,0,0);t.clearRect(0,0,W,H);t.drawImage(cv,0,0);const im=t.getImageData(0,0,W,H),px=new Uint32Array(im.data.buffer),ink=(255<<24)|(8<<16)|(5<<8)|6;for(let k=0;k<px.length;k++)px[k]=(px[k]>>>24)>200?ink:0;t.putImageData(im,0,0);
    c.globalCompositeOperation='destination-over';const o=2.6*d;for(let k=0;k<10;k++){const a=k/10*TAU,oo=o*(.75+r()*.55);c.drawImage(TMP,Math.cos(a)*oo,Math.sin(a)*oo)}}
  c.restore()}

/* ---------- paletas de cada tema ---------- */
const ROCHA_TEMA={
 cinzaraiz:{fundo:'#07090f',pedra:{base:'#1d2433',dark:'#0a0d14',light:'#55627c'},aro:'#8d99b2',grama:'#1b2432',ponta:'#45536c',tinta:'#040509',luz:'#9fb0d0',nevoa:'#4a5878'},
 galerias:{fundo:'#0a0705',pedra:{base:'#33271c',dark:'#110b07',light:'#8c6840'},aro:'#c49460',grama:'#33271a',ponta:'#7a5c38',tinta:'#060403',luz:'#f2a145',nevoa:'#5a4632'},
 sendas:{fundo:'#030b09',pedra:{base:'#15312a',dark:'#05110e',light:'#3f7d62'},aro:'#62c48c',grama:'#17463a',ponta:'#4fae74',tinta:'#020605',luz:'#8ff0b8',nevoa:'#1d4a40'},
 brejo:{fundo:'#0a0604',pedra:{base:'#33210f',dark:'#120904',light:'#9c622c'},aro:'#d48c4a',grama:'#3e2812',ponta:'#a8692e',tinta:'#060302',luz:'#ffc074',nevoa:'#4a2c15'},
 cidadela:{fundo:'#040812',pedra:{base:'#18243f',dark:'#060b18',light:'#4a6698'},aro:'#8eaae2',grama:'#172644',ponta:'#3e5a8e',tinta:'#02040a',luz:'#9cc6ff',nevoa:'#1a325e'},
 minas:{fundo:'#0b0611',pedra:{base:'#2c1d40',dark:'#0f0817',light:'#8a5aa0'},aro:'#ec8dc2',grama:'#331f42',ponta:'#8a4f8e',tinta:'#05030a',luz:'#ff9fd4',nevoa:'#43305c'},
 ninho:{fundo:'#030402',pedra:{base:'#191c14',dark:'#060705',light:'#4e543e'},aro:'#80866a',grama:'#1c2016',ponta:'#454b36',tinta:'#010201',luz:'#d8e09a',nevoa:'#181b14'},
 fosso:{fundo:'#04040a',pedra:{base:'#1e1d33',dark:'#08080e',light:'#605e98'},aro:'#c6beff',grama:'#211f3a',ponta:'#5a5690',tinta:'#020206',luz:'#f2efff',nevoa:'#2a2848'}
};
const temaDe=nome=>ROCHA_TEMA[nome]?nome:'cinzaraiz';

/* o mapa que está sendo pintado (o da página ou, no pintor, o mesmo mapa gerado de novo) */
let MAPA_P=null;
function usarMapa(m){MAPA_P=m;CONTORNOS.clear();PEDRAS.clear()}
/* sala secreta ainda fechada: para a pintura ela é rocha (a parede da vizinha fica inteira, com traço de tinta) */
function salaFechada(s){if(!s.secreta||!MAPA_P||!MAPA_P.segredos)return false;for(const g of MAPA_P.segredos)if(g.sala===s.id)return!g.aberto;return false}
/* quando um segredo abre, o contorno da sala e o da vizinha mudam */
function abrirSegredoPintura(id){const g=MAPA_P&&MAPA_P.segredos&&MAPA_P.segredos.find(q=>q.sala===id);if(!g)return;g.aberto=true;for(const k of[g.sala,g.viz]){CONTORNOS.delete(k);PEDRAS.delete(k)}}

/* ---------- contorno orgânico de cada sala ---------- */
const CONTORNOS=new Map(),PEDRAS=new Map();
function dentroDeOutra(s,x,y){for(const o of MAPA_P.salas){if(o===s||x<o.x-.5||x>o.x+o.w+.5||salaFechada(o))continue;const f=MUNDO.chaoEm(o,x),t=MUNDO.tetoEm(o,x),fl=f!==f?o.y+o.h+2:f;if(y>=t-.5&&y<=fl+.5)return true}return false}
function contornoSala(s){let C=CONTORNOS.get(s.id);if(C)return C;
  const P=[],r=rng(s.id*7717+3),n1=noise(r),n2=noise(r),n3=noise(r);
  const topoY=x=>s.ceu?s.y-2600:MUNDO.tetoEm(s,x),abertoT=x=>s.buracosTeto.some(([a,b])=>x>=a-1&&x<=b+1);
  const chaoY=x=>{const f=MUNDO.chaoEm(s,x);return f===f?f:s.y+s.h+70},furoC=x=>{const f=MUNDO.chaoEm(s,x);return f!==f};
  const X0=s.x,X1=s.x+s.w;
  const lado=(x,y0,y1,dir)=>{const st=y1>y0?16:-16;for(let y=y0;st>0?y<y1:y>y1;y+=st)P.push([x,y,dentroDeOutra(s,x+dir*8,y)?'porta':'parede'])};
  for(let x=X0;x<X1;x+=14)P.push([x,topoY(x),s.ceu||abertoT(x)?'porta':'teto']);
  lado(X1,topoY(X1),chaoY(X1),1);
  for(let x=X1;x>X0;x-=14)P.push([x,chaoY(x),furoC(x)?'porta':'chao']);
  lado(X0,chaoY(X0),topoY(X0),-1);
  /* deslocamento pela normal (para fora = para dentro da rocha) com ruído; o chão quase não mexe */
  const N=P.length,D=new Float32Array(N),NX=new Float32Array(N),NY=new Float32Array(N);let arco=0;
  for(let k=0;k<N;k++){const a=P[(k-1+N)%N],b=P[(k+1)%N],[x,y,t]=P[k];let nx=b[1]-a[1],ny=-(b[0]-a[0]);const L=Math.hypot(nx,ny)||1;NX[k]=nx/L;NY[k]=ny/L;
    if(k)arco+=Math.hypot(x-P[k-1][0],y-P[k-1][1]);
    D[k]=t==='chao'?(n1(arco/120)-.5)*4:t==='teto'?-30+46*n1(arco/190)+24*n2(arco/46):t==='parede'?-30+50*n1(arco/170)+20*n3(arco/44):12}
  for(let pass=0;pass<4;pass++){const E=D.slice();for(let k=0;k<N;k++){const t=P[k][2];if(t==='porta'){D[k]=12;continue}const v=.25*E[(k-1+N)%N]+.5*E[k]+.25*E[(k+1)%N];D[k]=t==='chao'?clamp(v,-3,3):v}}
  let pts=P.map(([x,y,t],k)=>[x+NX[k]*D[k],y+NY[k]*D[k],t]);
  /* cantos arredondados (paredes e tetos) */
  for(let pass=0;pass<2;pass++){const Q=pts.map(p=>p.slice());for(let k=0;k<N;k++){const t=Q[k][2];if(t==='chao'||t==='porta')continue;const a=Q[(k-1+N)%N],b=Q[(k+1)%N];pts[k][0]=.5*Q[k][0]+.25*(a[0]+b[0]);pts[k][1]=.5*Q[k][1]+.25*(a[1]+b[1])}}
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const p of pts){x0=Math.min(x0,p[0]);y0=Math.min(y0,p[1]);x1=Math.max(x1,p[0]);y1=Math.max(y1,p[1])}
  C={pts,nx:NX,ny:NY,caixa:[x0,y0,x1,y1]};CONTORNOS.set(s.id,C);return C}
function tracarContorno(c,pts){const n=pts.length;c.moveTo((pts[n-1][0]+pts[0][0])/2,(pts[n-1][1]+pts[0][1])/2);for(let k=0;k<n;k++){const a=pts[k],b=pts[(k+1)%n];c.quadraticCurveTo(a[0],a[1],(a[0]+b[0])/2,(a[1]+b[1])/2)}c.closePath()}
/* trechos da borda que não são passagem (onde vai o traço de tinta) */
function trechosBorda(C,filtro){const out=[];let cur=null;const P=C.pts;for(let k=0;k<=P.length;k++){const p=P[k%P.length];if(p[2]!=='porta'&&(!filtro||filtro(p[2]))){if(!cur){cur=[];out.push(cur)}cur.push(p)}else cur=null}return out}
function tracarTrecho(c,tr){if(tr.length<2)return;c.moveTo(tr[0][0],tr[0][1]);for(let k=1;k<tr.length-1;k++){const a=tr[k],b=tr[k+1];c.quadraticCurveTo(a[0],a[1],(a[0]+b[0])/2,(a[1]+b[1])/2)}const z=tr[tr.length-1];c.lineTo(z[0],z[1])}
/* uma forma orgânica (pedra, folha, nuvem de musgo) */
function bolha(c,r,x,y,rx,ry,ang,n){n=n||7;const pts=[];for(let k=0;k<n;k++){const a=(k+(r()-.5)*.5)/n*TAU,f=.72+r()*.46;pts.push([Math.cos(a)*rx*f,Math.sin(a)*ry*f])}const ca=Math.cos(ang),sa=Math.sin(ang);const P=pts.map(([u,v])=>[x+u*ca-v*sa,y+u*sa+v*ca]);
  c.moveTo((P[n-1][0]+P[0][0])/2,(P[n-1][1]+P[0][1])/2);for(let k=0;k<n;k++){const a=P[k],b=P[(k+1)%n];c.quadraticCurveTo(a[0],a[1],(a[0]+b[0])/2,(a[1]+b[1])/2)}c.closePath()}

/* pedras embutidas na borda de uma sala (sempre as mesmas, em qualquer bloco) */
function pedrasDaSala(s){let L=PEDRAS.get(s.id);if(L)return L;L=[];const C=contornoSala(s),P=C.pts,r=rng(s.id*919+11);
  for(let k=0;k<P.length;k+=2){const[x,y,t]=P[k];if(t==='porta')continue;const nx=C.nx[k],ny=C.ny[k],ang=Math.atan2(ny,nx)+Math.PI/2;
    if(t==='chao'){if(r()<.55)L.push({x:x+nx*(14+r()*12),y:y+ny*(14+r()*12),rx:26+r()*34,ry:10+r()*9,a:ang+(r()-.5)*.25,f:0,s:(r()*1e9)|0});
      if(r()<.35)L.push({x:x+nx*(46+r()*40),y:y+ny*(46+r()*40),rx:22+r()*30,ry:14+r()*14,a:ang+(r()-.5)*.6,f:1,s:(r()*1e9)|0})}
    else{if(r()<.8)L.push({x:x+nx*(10+r()*30),y:y+ny*(10+r()*30),rx:18+r()*30,ry:14+r()*24,a:ang+(r()-.5)*.9,f:0,s:(r()*1e9)|0});
      if(r()<.45)L.push({x:x+nx*(55+r()*60),y:y+ny*(55+r()*60),rx:24+r()*36,ry:18+r()*28,a:r()*TAU,f:1,s:(r()*1e9)|0});
      if(r()<.18)L.push({x:x+nx*(120+r()*90),y:y+ny*(120+r()*90),rx:30+r()*40,ry:20+r()*30,a:r()*TAU,f:2,s:(r()*1e9)|0})}}
  PEDRAS.set(s.id,L);return L}

/* ---------- um bloco do meio: rocha, bordas, enfeites e plataformas ---------- */
function pintarBloco(c,X,Y,S,rs,salas,rapido){
  c.setTransform(rs,0,0,rs,-X*rs,-Y*rs);
  const cx=X+S/2,cy=Y+S/2;let perto=salas[0],pd=1e18;
  for(const s of salas){const dx=Math.max(s.x-cx,0,cx-s.x-s.w),dy=Math.max(s.y-cy,0,cy-s.y-s.h),d=dx*dx+dy*dy;if(d<pd){pd=d;perto=s}}
  const TB=ROCHA_TEMA[perto?temaDe(perto.tema):'cinzaraiz'];
  c.fillStyle=TB.fundo;c.fillRect(X-2,Y-2,S+4,S+4);
  /* versão rápida (enquanto a completa é pintada): pedras, recorte, traço de tinta e aro do chão, sem veios, sombra nem enfeites */
  if(rapido){
    for(const s of salas){const T=ROCHA_TEMA[temaDe(s.tema)],P=T.pedra;
      for(const p of pedrasDaSala(s)){if(p.f>1||p.x<X-p.rx-20||p.x>X+S+p.rx+20||p.y<Y-p.rx-20||p.y>Y+S+p.rx+20)continue;const r=rng(p.s);
        c.beginPath();bolha(c,r,p.x,p.y,p.rx,p.ry,p.a,5+(p.s%2));c.fillStyle=p.f===0?mix(P.base,P.light,.08):mix(P.base,P.dark,.5);c.fill();c.strokeStyle=T.tinta;c.lineWidth=p.f===0?3.2:2.4;c.stroke()}}
    c.globalCompositeOperation='destination-out';c.beginPath();for(const s of salas)tracarContorno(c,contornoSala(s).pts);c.fill();c.globalCompositeOperation='source-over';
    c.lineJoin='round';c.lineCap='round';
    for(const s of salas){const T=ROCHA_TEMA[temaDe(s.tema)],C=contornoSala(s);if(C.caixa[0]>X+S+40||C.caixa[2]<X-40||C.caixa[1]>Y+S+40||C.caixa[3]<Y-40)continue;
      c.strokeStyle=T.tinta;c.lineWidth=6.5;c.beginPath();for(const tr of trechosBorda(C))tracarTrecho(c,tr);c.stroke();
      c.strokeStyle=T.aro;c.lineWidth=3;c.globalAlpha=.85;c.beginPath();for(const tr of trechosBorda(C,t=>t==='chao'))tracarTrecho(c,tr.map(p=>[p[0],p[1]+3.5]));c.stroke();c.globalAlpha=1;
      for(const p of s.plataformas){if(p.x<X-300||p.x>X+S+300||p.y<Y-300||p.y>Y+S+200)continue;pintarPlataforma(c,p,temaDe(s.tema),rng(4441+((p.x*7+p.y)|0)))}}
    return}
  /* veios na rocha funda (sorteados por célula do mundo, para continuarem de um bloco para o outro) */
  {const CEL=512;c.strokeStyle=mix(TB.fundo,TB.pedra.base,.5);c.lineCap='round';c.globalAlpha=.5;
    for(let gy=Math.floor((Y-400)/CEL);gy<=Math.floor((Y+S+400)/CEL);gy++)for(let gx=Math.floor((X-400)/CEL);gx<=Math.floor((X+S+400)/CEL);gx++){const r=rng((gx*73856093)^(gy*19349663)^5);
      for(let k=0;k<2;k++){const x=gx*CEL+r()*CEL,y=gy*CEL+r()*CEL,L=120+r()*260,a=(r()-.5)*.8,mx=(r()-.5)*40,my=(r()-.5)*40;c.lineWidth=2+r()*3;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+Math.cos(a)*L*.5+mx,y+Math.sin(a)*L*.5+my,x+Math.cos(a)*L,y+Math.sin(a)*L);c.stroke()}}
    c.globalAlpha=1}
  /* pedras embutidas */
  for(const s of salas){const T=ROCHA_TEMA[temaDe(s.tema)],P=T.pedra;
    for(const p of pedrasDaSala(s)){if(p.x<X-p.rx-20||p.x>X+S+p.rx+20||p.y<Y-p.rx-20||p.y>Y+S+p.rx+20)continue;const r=rng(p.s);
      c.beginPath();bolha(c,r,p.x,p.y,p.rx,p.ry,p.a,5+(p.s%2));c.fillStyle=p.f===0?mix(P.base,P.light,.04+r()*.1):p.f===1?mix(P.base,P.dark,.4+r()*.2):mix(P.dark,T.fundo,.5);c.fill();
      c.strokeStyle=T.tinta;c.lineWidth=p.f===0?3.2:2.4;c.stroke();
      if(p.f<2){c.strokeStyle=rgba(P.light,p.f===0?.26:.12);c.lineWidth=2.2;c.beginPath();c.ellipse(p.x,p.y,p.rx*.62,p.ry*.55,p.a,Math.PI*1.05,Math.PI*1.7);c.stroke()}}}
  /* recorta o espaço livre */
  c.globalCompositeOperation='destination-out';c.beginPath();for(const s of salas)tracarContorno(c,contornoSala(s).pts);c.fill();c.globalCompositeOperation='source-over';
  /* sombra dentro das salas, junto das paredes e do teto */
  /* (camadas de traço cada vez mais finas: um degradê suave, igual em qualquer bloco) */
  c.save();c.beginPath();for(const s of salas)tracarContorno(c,contornoSala(s).pts);c.clip();c.lineJoin='round';c.lineCap='round';
  for(const s of salas){if(s.ceu)continue;const C=contornoSala(s),tr=trechosBorda(C,t=>t!=='chao');if(!tr.length)continue;
    c.beginPath();for(const t of tr)tracarTrecho(c,t);for(const[w,a]of[[260,.06],[200,.07],[150,.08],[100,.09],[56,.11],[24,.12]]){c.strokeStyle=`rgba(0,0,0,${a})`;c.lineWidth=w;c.stroke()}}
  c.restore();
  /* traço de tinta da borda e aro do chão */
  c.lineJoin='round';c.lineCap='round';
  for(const s of salas){const T=ROCHA_TEMA[temaDe(s.tema)],C=contornoSala(s);if(C.caixa[0]>X+S+40||C.caixa[2]<X-40||C.caixa[1]>Y+S+40||C.caixa[3]<Y-40)continue;
    c.strokeStyle=T.tinta;c.lineWidth=6.5;c.beginPath();for(const tr of trechosBorda(C))tracarTrecho(c,tr);c.stroke();
    c.strokeStyle=T.aro;c.lineWidth=3;c.globalAlpha=.85;c.beginPath();for(const tr of trechosBorda(C,t=>t==='chao'))tracarTrecho(c,tr.map(p=>[p[0],p[1]+3.5]));c.stroke();c.globalAlpha=1}
  /* chão e teto de cada tema, enfeites e plataformas */
  for(const s of salas){const tm=temaDe(s.tema),t=TEMA_IDS.indexOf(tm),C=contornoSala(s);if(C.caixa[0]>X+S+500||C.caixa[2]<X-500||C.caixa[1]>Y+S+700||C.caixa[3]<Y-700)continue;
    vestirBorda(c,s,tm,C,X,Y,S);
    for(const v of s.vagas){if(v.x<X-560||v.x>X+S+560||v.y<Y-900||v.y>Y+S+700)continue;try{enfeite(c,tm,t,v,s)}catch(e){console.warn('enfeite',tm,v.tipo,e)}}
    for(const p of s.plataformas){if(p.x<X-300||p.x>X+S+300||p.y<Y-300||p.y>Y+S+200)continue;pintarPlataforma(c,p,tm,rng(4441+((p.x*7+p.y)|0)))}}
}

/* mato e musgo no chão; estalactites, raízes e cristais no teto */
function vestirBorda(c,s,tm,C,X,Y,S){const T=ROCHA_TEMA[tm],P=C.pts;
  for(let k=0;k<P.length;k++){const[x,y,t]=P[k];if(!(x>X-60&&x<X+S+60&&y>Y-160&&y<Y+S+160))continue;
    /* sorteio por ponto: o mesmo desenho em qualquer bloco que o mostre */
    const r=rng(s.id*7919+k*977+17),q=r(),q2=r(),q3=r();
    if(t==='chao'&&k%2===0){
      if(tm==='sendas'||tm==='cinzaraiz'||tm==='galerias'||tm==='brejo'||tm==='cidadela'){const n=tm==='sendas'?5:3;c.lineCap='round';
        for(let j=0;j<n;j++){if(q<.25)break;const gx=x+(r()-.5)*16,h=(tm==='sendas'?18:10)+r()*(tm==='sendas'?34:18),b=(r()-.5)*h*.8;c.strokeStyle=r()<.6?T.grama:T.ponta;c.lineWidth=1.8+r()*2.4;c.beginPath();c.moveTo(gx,y+3);c.quadraticCurveTo(gx+b*.2,y-h*.6,gx+b,y-h);c.stroke()}}
      if(tm==='sendas'&&q2<.18){c.fillStyle=T.grama;c.beginPath();bolha(c,r,x,y-4,18+q3*20,9+q3*8,0);c.fill();c.strokeStyle=T.tinta;c.lineWidth=2;c.stroke()}
      if(tm==='minas'&&q2<.1)cluster(c,r,x,y+4,20+q3*26,(r()-.5)*.6,{d:'#7a2f69',m:'#e070b4',l:'#ffe0f2',g:'#ff9fd4'},3,.2);
      if(tm==='ninho'&&q2<.08){c.strokeStyle=rgba('#cfd2be',.25);c.lineWidth=1;web(c,x,y,40+q3*30,5,Math.PI*1.1,Math.PI*1.9,rgba('#cfd2be',.18),1)}}
    else if(t==='teto'&&k%3===0&&q<.55){
      if(tm==='sendas'||tm==='ninho'||tm==='brejo'){if(q2<.5){c.strokeStyle=tm==='sendas'?'#1d5a44':T.pedra.dark;c.lineWidth=2.5+q3*3;c.lineCap='round';const L=40+r()*140;c.beginPath();c.moveTo(x,y-6);c.bezierCurveTo(x+(r()-.5)*40,y+L*.4,x+(r()-.5)*40,y+L*.7,x+(r()-.5)*20,y+L);c.stroke();if(tm==='sendas')for(let j=12;j<L;j+=18){c.fillStyle='#3f9a6a';c.beginPath();c.ellipse(x+(r()-.5)*16,y+j,6,3,r()*3,0,TAU);c.fill()}continue}}
      if(tm==='minas'&&q2<.3){cluster(c,r,x,y-8,24+q3*36,Math.PI+(r()-.5)*.6,{d:'#4b2f8a',m:'#9a7ae0',l:'#ece2ff',g:'#c39bff'},3,.25);continue}
      const L=(24+q2*80)*(tm==='cidadela'?.8:1),wd=L*(.2+q3*.14),bx=(r()-.5)*8;c.fillStyle=T.pedra.dark;c.beginPath();c.moveTo(x-wd,y-8);c.bezierCurveTo(x-wd*.6,y+L*.35,x-wd*.15+bx,y+L*.8,x+bx,y+L);c.bezierCurveTo(x+wd*.15+bx,y+L*.8,x+wd*.6,y+L*.35,x+wd,y-8);c.closePath();c.fill();c.strokeStyle=T.tinta;c.lineWidth=2.6;c.stroke();
      if(tm==='cidadela'&&q3<.4){c.fillStyle=rgba('#cfe0ff',.7);c.beginPath();c.ellipse(x+bx,y+L+8,2.4,4,0,0,TAU);c.fill()}}}}

/* ---------- plataformas: lajes de pedra desenhadas ---------- */
const PLAT_COR={cinzaraiz:'#2a3345',galerias:'#3d2f22',sendas:'#1a3a30',brejo:'#3a2614',cidadela:'#1c2a4a',minas:'#33234a',ninho:'#1c1f16',fosso:'#22213a'};
function pintarPlataforma(c,p,tm,r){const T=ROCHA_TEMA[tm],w=p.w,x=p.x,y=p.y,base=PLAT_COR[tm]||T.pedra.base;
  if(tm==='galerias'||tm==='cidadela'){c.strokeStyle=rgba(T.pedra.light,.45);c.lineWidth=2.2;for(const d of[-.34,.34]){const cx=x+w*d;for(let yy=y;yy>y-420;yy-=8){c.beginPath();c.ellipse(cx,yy-4,((yy/8)|0)%2?1.4:2.8,3.6,0,0,TAU);c.stroke()}}}
  /* laje irregular: topo quase reto (onde se pisa), fundo de pedras penduradas */
  c.beginPath();c.moveTo(x-w/2-6,y+2);const n=6;for(let k=0;k<=n;k++){const t=k/n,px=x-w/2+w*t,dy=Math.sin(t*Math.PI)*(16+r()*16)+6+r()*10;c.lineTo(px+(r()-.5)*10,y+dy+(k%2?10:0))}c.lineTo(x+w/2+6,y+2);c.quadraticCurveTo(x,y-6,x-w/2-6,y+2);c.closePath();
  c.fillStyle=base;c.fill();c.strokeStyle=T.tinta;c.lineWidth=4;c.lineJoin='round';c.stroke();
  for(let k=0;k<4;k++){c.beginPath();bolha(c,r,x+(r()-.5)*w*.7,y+10+r()*12,8+r()*12,5+r()*6,0);c.fillStyle=mix(base,T.pedra.dark,.3+r()*.3);c.fill();c.strokeStyle=T.tinta;c.lineWidth=1.6;c.stroke()}
  c.strokeStyle=T.aro;c.lineWidth=3;c.lineCap='round';c.beginPath();c.moveTo(x-w/2+2,y+1);c.quadraticCurveTo(x,y-3,x+w/2-2,y+1);c.stroke();
  if(tm==='sendas'){foliage(c,r,x-w*.32,y-4,14,['#0b302a','#1d6a4f','#4fae74'],.6,['#6f63e0','#a9a5ff']);for(let k=0;k<3;k++)vine(c,r,x+(r()-.5)*w*.6,y+18,30+r()*60,'#1d5a44','#3f9a6a',1)}
  if(tm==='brejo')mushroom(c,r,x+w*.28,y,26,30,{stem:'#d8c3a0',cap:'#a9521d',capLight:'#ffc074',gill:'#5a2a10',glow:'#e88a3c'},.1,.3);
  if(tm==='minas')cluster(c,r,x-w*.3,y+2,30,-.2,{d:'#7a2f69',m:'#e070b4',l:'#ffe0f2',g:'#ff9fd4'},3,.3);
  if(tm==='ninho')web(c,x+w*.25,y+20,60,6,Math.PI*.3,Math.PI*.9,rgba('#cfd2be',.22),1)}

/* ---------- enfeites por tema (o personagem tem ~84 de altura) ---------- */
function enfeite(c,tm,t,v,s){const r=rng(v.seed),u=v.s,P=REG[t].p,x=v.x,y=v.y,T=ROCHA_TEMA[tm];const lado=r()<.5?-1:1;
  switch(tm){
  case'cinzaraiz':
    if(v.tipo==='grande'){const ww=(220+r()*80)*u,hh=(150+r()*60)*u;house(c,r,x-ww/2,y+10,ww,hh,P,u*2.1);if(r()<.7)lamp(c,x+lado*(ww*.62+40),y+6,(230+r()*50)*u,'#0a0d14',P.warm,u*2.1,'#fff0c8')}
    else if(v.tipo==='chao'){const k=r();if(k<.3)lamp(c,x,y+6,(220+r()*50)*u,'#0a0d14',P.warm,u*2,'#fff0c8');
      else if(k<.62){c.strokeStyle='#0b1019';branch(c,r,x,y+8,(170+r()*110)*u,-Math.PI/2+(r()-.5)*.25,18*u,7)}
      else if(k<.82){c.fillStyle='#151c2b';c.beginPath();c.moveTo(x-6*u,y+6);c.lineTo(x-5*u,y-62*u);c.lineTo(x+5*u,y-62*u);c.lineTo(x+6*u,y+6);c.fill();c.beginPath();c.moveTo(x-24*u,y-46*u);c.lineTo(x+24*u,y-48*u);c.lineTo(x+24*u,y-38*u);c.lineTo(x-24*u,y-36*u);c.fill()}
      else{c.strokeStyle='#121a28';c.lineWidth=7*u;c.lineCap='round';for(let k2=0;k2<5;k2++){const fx=x+(k2-2)*34*u;c.beginPath();c.moveTo(fx,y+6);c.lineTo(fx+(r()-.5)*6,y-(50+r()*14)*u);c.stroke()}c.lineWidth=6*u;c.beginPath();c.moveTo(x-76*u,y-30*u);c.quadraticCurveTo(x,y-38*u,x+76*u,y-28*u);c.stroke()}}
    break;
  case'galerias':{const k=r();
    if(v.tipo==='grande'){if(k<.45)estante(c,r,x,y+6,u*1.1,T,P);else if(k<.7)atril(c,r,x,y+6,u*1.5,T,P);else if(k<.85)corneta(c,r,x,y+6,u*1.3,T,P);else{const sw=(280+r()*120)*u,sh=(280+r()*150)*u;scaffold(c,x-sw/2,y+6,sw,sh,P.wood,u*2);hangLantern(c,x+lado*sw*.22,y-sh+30*u,u*2.2,P.amber,'#1a120b')}}
    else if(v.tipo==='chao'){if(k<.18)pilhaLivros(c,r,x,y+6,u*1.2,T);else if(k<.32)tinteiro(c,r,x,y+6,u*1.1,T);else if(k<.46)letras(c,r,x,y+6,u,T);else if(k<.58)vela(c,r,x,y+6,u*1.1,T,P);else if(k<.68)atril(c,r,x,y+6,u,T,P);
      else if(k<.78)lamp(c,x,y+6,(200+r()*40)*u,'#140e09',P.amber,u*2,'#ffe3b0');else if(k<.88)rockPile(c,r,x,y+6,(50+r()*40)*u,{base:'#3a2e22',dark:'#140e09',light:'#a07a4a'},16);
      else{const b=(56+r()*30)*u;c.fillStyle=P.wood;c.beginPath();c.moveTo(x-b/2,y+4);c.lineTo(x-b/2+3,y-b);c.lineTo(x+b/2-2,y-b+3);c.lineTo(x+b/2,y+4);c.closePath();c.fill();c.strokeStyle='#140e09';c.lineWidth=3;c.stroke();c.beginPath();c.moveTo(x-b/2+4,y-b+4);c.lineTo(x+b/2-4,y);c.stroke()}}
    else if(v.tipo==='teto'){if(k<.45)varal(c,r,x,y+4,u,T,P);else{const L=(90+r()*200)*u;chain(c,x,y-6,x,y+L,'#2a2018',u*1.6);hangLantern(c,x,y+L,u*2,P.amber,'#1a120b')}}
    break}
  case'sendas':{const k=r();
    if(v.tipo==='grande'){if(k<.45)arvore(c,r,x,y+6,u,T,P);else if(k<.78){const w=(320+r()*120)*u,h=(380+r()*140)*u;c.fillStyle=P.wall;c.beginPath();archPath(c,x-w/2,y+8,w,h);c.fill();c.globalCompositeOperation='destination-out';c.beginPath();archPath(c,x-w*.33,y+12,w*.66,h*.8);c.fill();c.globalCompositeOperation='source-over';
      foliage(c,r,x,y-h*.9,w*.42,['#0b302a','#1d6a4f','#4fae74'],1.1,[P.flower,P.flower2]);for(let q=0;q<6;q++)vine(c,r,x+(r()-.5)*w,y-h*.82,(80+r()*180)*u,'#1d5a44','#3f9a6a',u*1.6)}else{fossil(c,r,x,y+6,u*2.2,T);flores(c,r,x+lado*90*u,y+6,u*1.2,P)}}
    else if(v.tipo==='chao'){if(k<.3)foliage(c,r,x,y-10*u,(40+r()*42)*u,['#0b302a','#1d6a4f','#4fae74'],.9,r()<.5?[P.flower,P.flower2]:null);else if(k<.45)samambaia(c,r,x,y+6,u*1.3,T);else if(k<.58)flores(c,r,x,y+6,u*1.2,P);
      else if(k<.68)frascos(c,r,x,y+6,u*1.1,T);else if(k<.76)microscopio(c,r,x,y+6,u*1.1,T);else if(k<.86)fossil(c,r,x,y+6,u,T);else{foliage(c,r,x,y-10*u,(34+r()*30)*u,['#0b302a','#1d6a4f','#4fae74'],.8,null);borboletas(c,r,x,y,u*1.2,P)}}
    else if(v.tipo==='teto'){if(k<.6)for(let q=0;q<3;q++)vine(c,r,x+(q-1)*22*u,y-6,(90+r()*220)*u,'#1d5a44','#3f9a6a',u*1.6);else sementes(c,r,x,y,(80+r()*160)*u,u*1.2,P)}
    break}
  case'brejo':{const cogA={stem:P.stem,cap:'#a9521d',capLight:P.orangeL,gill:'#5a2a10',glow:P.orange},cogB={stem:'#7fb8ad',cap:'#1f7f74',capLight:P.tealL,gill:'#0d3b36',glow:P.teal};
    if(v.tipo==='grande'){mushroom(c,r,x,y+8,(320+r()*200)*u,(240+r()*140)*u,r()<.6?cogA:cogB,(r()-.5)*.22,.35)}
    else if(v.tipo==='chao'){const k=r();if(k<.6){for(let q=0;q<3;q++)mushroom(c,r,x+(q-1)*34*u,y+6,(40+r()*50)*u,(34+r()*34)*u,r()<.5?cogA:cogB,(r()-.5)*.3,.3)}
      else{c.fillStyle=rgba(P.acid,.5);c.beginPath();c.ellipse(x,y+4,(70+r()*50)*u,10*u,0,0,TAU);c.fill();glow(c,x,y,110*u,P.acid,.22)}}
    else if(v.tipo==='teto'){c.fillStyle=P.orange;for(let k=0;k<4;k++){const dx=(r()-.5)*70*u,L=(20+r()*50)*u;c.beginPath();c.ellipse(x+dx,y+L,7*u,11*u,0,0,TAU);c.fill();glow(c,x+dx,y+L,40*u,P.orange,.32)}}
    break}
  case'cidadela':{const k=r();
    if(v.tipo==='grande'){if(k<.3)tower(c,r,x,y+8,(120+r()*60)*u,(480+r()*260)*u,{body:'#0f1d3c',win:P.win,dark:'#060c1a',lit:.5,ledge:'#1a2c52'},u*2,true);else if(k<.62)colunata(c,r,x,y+6,u,T,P);else estatua(c,r,x,y+6,u*1.1,T,P)}
    else if(v.tipo==='chao'){if(k<.22)lamp(c,x,y+6,(240+r()*60)*u,P.iron,P.win,u*2.1,P.winL);else if(k<.36)coluna(c,r,x,y+6,(110+r()*90)*u,u,T,true);else if(k<.5)busto(c,r,x,y+6,u,T);else if(k<.62)pergaminhos(c,r,x,y+6,u*1.1,T);
      else if(k<.72)anfora(c,r,x,y+6,u*1.2,T);else if(k<.82)relogioSol(c,r,x,y+6,u*1.1,T);else coluna(c,r,x,y+6,(150+r()*60)*u,u*.9,T,false)}
    else if(v.tipo==='teto'){if(k<.45)estandarte(c,r,x,y,(160+r()*120)*u,u*1.2,T,P.win);else{const L=(120+r()*260)*u;chain(c,x,y-6,x,y+L,'#1a2c52',u*1.6);c.fillStyle='#13244a';c.beginPath();c.arc(x,y+L+12*u,12*u,0,TAU);c.fill()}}
    break}
  case'minas':{const C1={d:'#7a2f69',m:'#e070b4',l:'#ffe0f2',g:'#ff9fd4'},C2={d:'#4b2f8a',m:'#9a7ae0',l:'#ece2ff',g:'#c39bff'},k=r(),Cx=r()<.6?C1:C2;
    if(v.tipo==='grande'){if(k<.32){cluster(c,r,x,y+12,(200+r()*120)*u,(r()-.5)*.4,Cx,7,.4);if(r()<.5)scaffold(c,x+lado*200*u,y+6,180*u,240*u,P.wood,u*2)}else if(k<.58)quadro(c,r,x,y+6,u*1.1,T,P);
      else if(k<.8){c.fillStyle=ENF.corpo(T);caixaTorta(c,x-40*u,y-50*u,80*u,56*u,r);c.fill();ENF.tinta(c,T,3);poliedro(c,r,x,y-150*u,90*u,Cx,T)}else vagonete(c,r,x,y+6,u*1.2,T,P,Cx)}
    else if(v.tipo==='chao'){if(k<.34)cluster(c,r,x,y+8,(60+r()*60)*u,(r()-.5)*.6,Cx,4,.3);else if(k<.46)poliedro(c,r,x,y-34*u,34*u,Cx,T);else if(k<.56)abaco(c,r,x,y+6,u,T,P);else if(k<.66)compasso(c,r,x,y+6,u,T);
      else if(k<.75)transferidor(c,r,x,y+6,u*1.2,T);else if(k<.86)dados(c,r,x,y+6,u,T,Cx);else{c.strokeStyle='#2a1c2e';c.lineWidth=6*u;c.beginPath();c.moveTo(x-120*u,y-6);c.lineTo(x+120*u,y-6);c.stroke();for(let q=-2;q<=2;q++){c.fillStyle='#3a2838';c.fillRect(x+q*48*u-9*u,y-10,18*u,12*u)}}}
    else if(v.tipo==='teto'){if(k<.6)cluster(c,r,x,y-8,(60+r()*70)*u,Math.PI+(r()-.5)*.5,Cx,4,.3);else{const L=(80+r()*180)*u;chain(c,x,y-6,x,y+L,'#2a1c2e',u*1.6);hangLantern(c,x,y+L,u*2,P.pink,'#1a1020')}}
    break}
  case'ninho':{const k=r();
    if(v.tipo==='grande'){if(k<.35)rack(c,r,x,y+6,u*1.1,T);else if(k<.6)antena(c,r,x,y+6,u,T);else if(k<.85)rede(c,r,x,y-(320+r()*120)*u,(240+r()*120)*u,u,T);else{web(c,x,y-(340+r()*140)*u,(280+r()*140)*u,10,Math.PI*.12,Math.PI*1.88,rgba(P.web,.16),1.4);for(let q=0;q<4;q++)thornVine(c,r,x+(r()-.5)*140*u,y+6,(220+r()*220)*u,-Math.PI/2+(r()-.5)*1.2,'#0d0f0a',u*2)}}
    else if(v.tipo==='chao'){if(k<.2)monitor(c,r,x,y+6,u*1.1,T);else if(k<.38)cabos(c,r,x,y+6,u,T);else if(k<.52)robo(c,r,x,y+6,u*1.1,T);else if(k<.64)engrenagens(c,r,x,y+6,u,T);else if(k<.74)disquetes(c,r,x,y+6,u*1.1,T);
      else if(k<.88)thornVine(c,r,x,y+6,(140+r()*160)*u,-Math.PI/2+(r()-.5)*1.4,'#0d0f0a',u*2);else eyes(c,x,y-(80+r()*120)*u,u*2,P.eye,.6)}
    else if(v.tipo==='teto'){if(k<.55)fios(c,r,x,y,(100+r()*200)*u,u*1.1,T);else{const L=(70+r()*220)*u;c.strokeStyle=rgba(P.web,.3);c.lineWidth=1.4;c.beginPath();c.moveTo(x,y-6);c.lineTo(x,y+L);c.stroke();c.fillStyle=P.cocoon;c.beginPath();c.ellipse(x,y+L+30*u,17*u,34*u,0,0,TAU);c.fill();c.strokeStyle='#3e3f36';c.lineWidth=1.6;for(let q=0;q<5;q++){c.beginPath();c.moveTo(x-17*u,y+L+10*u+q*13*u);c.quadraticCurveTo(x,y+L+17*u+q*13*u,x+17*u,y+L+10*u+q*13*u);c.stroke()}}}
    break}
  case'fosso':{const k=r(),FL={flower:P.lav,flower2:P.light};
    if(v.tipo==='grande'){if(k<.55){const h=(480+r()*300)*u;c.fillStyle='#14132a';c.beginPath();c.moveTo(x-50*u,y+8);c.quadraticCurveTo(x-42*u,y-h*.5,x-30*u,y-h);c.lineTo(x,y-h-60*u);c.lineTo(x+30*u,y-h);c.quadraticCurveTo(x+42*u,y-h*.5,x+50*u,y+8);c.fill();glow(c,x,y-h,220*u,P.lav,.22);glow(c,x,y-h-36*u,40*u,P.light,.8)}
      else if(k<.8){banco(c,r,x,y+6,u*1.2,T);vela(c,r,x+lado*110*u,y+6,u,T,{amber:P.lav})}else placaSetas(c,r,x,y+6,u*1.3,T)}
    else if(v.tipo==='chao'){if(k<.4)tendril(c,r,x,y+6,(120+r()*160)*u,-Math.PI/2+(r()-.5)*.8,12*u,'#16152c',rgba(P.lav,.4));else if(k<.6)vela(c,r,x,y+6,u,T,{amber:P.lav});else if(k<.75)caixaCorreio(c,r,x,y+6,u*1.1,T);else if(k<.88)placaSetas(c,r,x,y+6,u,T);else flores(c,r,x,y+6,u,FL)}
    else if(v.tipo==='teto'){tendril(c,r,x,y-6,(120+r()*220)*u,Math.PI/2+(r()-.5)*.5,10*u,'#16152c',rgba(P.lav,.35))}
    break}
  }
}

/* ---------- fundo de uma sala, em duas camadas ---------- */
/* longe: o tema pintado (js/02-regioes.js) com névoa */
function pintarFundoLonge(c,s,bw,bh,rb,bgAsset){const tm=temaDe(s.tema),t=TEMA_IDS.indexOf(tm),R=REG[t],T=ROCHA_TEMA[tm];
  c.setTransform(rb,0,0,rb,0,0);
  if(bgAsset&&bgAsset.img&&bgAsset.cfg.modo!=='sobrepor')drawBg(c,bgAsset,bw,bh);
  else{try{R.back(c,bw,bh,rng(7919*(s.id+1)+11),1.15,R.p);DETAIL[t](c,bw,bh,rng(5557*(s.id+1)),1.15,R.p)}catch(e){console.warn('fundo',tm,e)}if(bgAsset&&bgAsset.img)drawBg(c,bgAsset,bw,bh)}
  fog(c,bw,bh*.55,bh*.5,T.nevoa,.18);fog(c,bw,bh*.9,bh*.3,T.nevoa,.22);
  const g=c.createLinearGradient(0,0,0,bh);g.addColorStop(0,'rgba(2,2,4,.45)');g.addColorStop(.45,'rgba(2,2,4,.05)');g.addColorStop(1,'rgba(2,2,4,.35)');c.fillStyle=g;c.fillRect(0,0,bw,bh)}
/* perto: silhuetas orgânicas do tema (colunas de pedra, arcos, árvores, cogumelos, cristais), mais escuras */
function pintarFundoPerto(c,s,bw,bh,rb){const tm=temaDe(s.tema),t=TEMA_IDS.indexOf(tm),P=REG[t].p,T=ROCHA_TEMA[tm],r=rng(s.id*4243+9);
  c.setTransform(rb,0,0,rb,0,0);const cor=mix(T.fundo,T.nevoa,.42),cor2=mix(T.fundo,T.nevoa,.26),chao=bh*.86;
  /* colunas e formações de rocha */
  for(let k=0;k<5;k++){const x=r()*bw,w=60+r()*140,h=bh*(.3+r()*.55),topo=r()<.5;c.fillStyle=k%2?cor:cor2;c.beginPath();
    if(topo){c.moveTo(x-w,-10);c.bezierCurveTo(x-w*.6,h*.4,x-w*.25,h*.8,x,h);c.bezierCurveTo(x+w*.25,h*.8,x+w*.6,h*.4,x+w,-10);c.closePath()}
    else{c.moveTo(x-w,bh+10);c.bezierCurveTo(x-w*.6,bh-h*.4,x-w*.25,bh-h*.85,x,bh-h);c.bezierCurveTo(x+w*.25,bh-h*.85,x+w*.6,bh-h*.4,x+w,bh+10);c.closePath()}c.fill()}
  c.fillStyle=cor2;c.beginPath();c.moveTo(-20,bh+20);for(let x=-20;x<=bw+40;x+=40)c.lineTo(x,chao-20-Math.abs(Math.sin(x*.004+s.id))*90-r()*30);c.lineTo(bw+40,bh+20);c.closePath();c.fill();
  switch(tm){
  case'cinzaraiz':c.fillStyle=cor;for(let k=0;k<5;k++){const x=r()*bw,w=120+r()*140,h=90+r()*90,y=chao-40;c.fillRect(x-w/2,y-h,w,h+40);c.beginPath();c.moveTo(x-w/2-14,y-h);c.lineTo(x,y-h-h*(.7+r()*.6));c.lineTo(x+w/2+14,y-h);c.fill();c.fillStyle=rgba(P.warm,.6);if(r()<.6){c.fillRect(x-8,y-h*.6,10,14);glow(c,x-3,y-h*.55,40,P.warm,.25)}c.fillStyle=cor}
    c.strokeStyle=cor;for(let k=0;k<3;k++){const x=r()*bw;branch(c,r,x,chao-30,180+r()*120,-Math.PI/2,14,6)}break;
  case'galerias':c.strokeStyle=cor;c.lineWidth=22;for(let k=0;k<3;k++){const x=r()*bw,w=260+r()*200,h=280+r()*200;c.beginPath();c.moveTo(x-w/2,chao);c.lineTo(x-w/2,chao-h*.6);c.quadraticCurveTo(x-w/2,chao-h,x,chao-h);c.quadraticCurveTo(x+w/2,chao-h,x+w/2,chao-h*.6);c.lineTo(x+w/2,chao);c.stroke();glow(c,x,chao-h*.7,80,P.amber,.18)}break;
  case'sendas':for(let k=0;k<4;k++){const x=r()*bw;c.fillStyle=cor;c.beginPath();c.moveTo(x-30,bh);c.quadraticCurveTo(x-20,bh*.45,x+(r()-.5)*60,bh*.2);c.quadraticCurveTo(x+20,bh*.45,x+30,bh);c.fill();foliage(c,r,x,bh*.25,130+r()*90,[cor2,cor,mix(cor,'#3f9a6a',.25)],.7)}break;
  case'brejo':for(let k=0;k<4;k++){const x=r()*bw,h=320+r()*360,cw=220+r()*240;c.fillStyle=cor;c.fillRect(x-18,chao-h,36,h+40);c.beginPath();c.ellipse(x,chao-h,cw/2,cw*.22,0,Math.PI,0);c.fill();glow(c,x,chao-h+10,cw*.6,P.orange,.12)}break;
  case'cidadela':for(let k=0;k<6;k++){const x=r()*bw,tw=80+r()*90,th=300+r()*380;tower(c,r,x,chao,tw,th,{body:cor,win:P.win,dark:cor2,lit:.35,ledge:cor},1.6,false)}break;
  case'minas':for(let k=0;k<5;k++){const x=r()*bw,L=200+r()*320;c.fillStyle=cor;c.beginPath();c.moveTo(x-40,chao);c.lineTo(x-14,chao-L);c.lineTo(x,chao-L-50);c.lineTo(x+14,chao-L);c.lineTo(x+40,chao);c.fill();glow(c,x,chao-L*.8,90,P.pink,.12)}break;
  case'ninho':c.strokeStyle=rgba(P.web,.07);c.lineWidth=2;for(let k=0;k<3;k++)web(c,r()*bw,r()*bh*.5,260+r()*200,9,0,TAU,rgba(P.web,.07),2);for(let k=0;k<4;k++)eyes(c,r()*bw,chao-r()*bh*.5,1.6,P.eye,.35);break;
  case'fosso':for(let k=0;k<4;k++){const x=r()*bw,h=bh*(.4+r()*.4);c.fillStyle=cor;c.beginPath();c.moveTo(x-30,bh);c.lineTo(x-20,bh-h);c.lineTo(x,bh-h-40);c.lineTo(x+20,bh-h);c.lineTo(x+30,bh);c.fill()}raysUp(c,r,bw,bh,7,P.lav,.1);break}
  fog(c,bw,chao,bh*.35,T.nevoa,.3)}

/* ---------- silhuetas da frente (desfocadas, quase pretas) — desenhadas na página, a cada quadro ---------- */
const FRENTE={};
function spriteFrente(tema,f){const key=tema+':'+f.tipo+':'+(f.seed%29);if(FRENTE[key])return FRENTE[key];
  const grama=f.tipo==='grama',W=grama?220:720,H=grama?120:560,sc=grama?.7:.45,cv=novoCanvas(W*sc,H*sc),c=cv.getContext('2d'),r=rng(f.seed%29*97+tema.length),T=ROCHA_TEMA[tema],tinta=mix(T.tinta,'#000000',.3);
  c.setTransform(sc,0,0,sc,0,0);c.fillStyle=tinta;c.strokeStyle=tinta;c.lineCap='round';
  if(grama){/* mato na frente dos pés: integra os personagens ao chão */c.filter='blur(1.2px)';for(let k=0;k<16;k++){const x=W/2+(r()-.5)*170,h=18+r()*58,b=(r()-.5)*42;c.lineWidth=3+r()*4;c.beginPath();c.moveTo(x,H-10);c.quadraticCurveTo(x+b*.2,H-10-h*.6,x+b,H-10-h);c.stroke()}
    c.beginPath();c.ellipse(W/2,H-6,96,12,0,0,TAU);c.fill();return FRENTE[key]={cv,W,H,ax:W/2,ay:H-14}}
  c.filter='blur(6px)';
  if(f.tipo==='baixo'){const bx=W/2,by=H-50;c.beginPath();c.ellipse(bx,by+40,280,80,0,0,TAU);c.fill();
    if(tema==='brejo'){for(let k=0;k<3;k++){const x=bx+(k-1)*130,h=170+r()*170,cw=130+r()*90;c.fillRect(x-12,by-h,24,h);c.beginPath();c.ellipse(x,by-h,cw/2,cw*.3,0,Math.PI,0);c.fill()}}
    else if(tema==='minas'){for(let k=0;k<7;k++){const x=bx+(r()-.5)*360,L=110+r()*220,a=(r()-.5)*.7;c.save();c.translate(x,by);c.rotate(a);c.beginPath();c.moveTo(-20,0);c.lineTo(-14,-L);c.lineTo(0,-L-28);c.lineTo(14,-L);c.lineTo(20,0);c.fill();c.restore()}}
    else if(tema==='sendas'){for(let k=0;k<7;k++){c.beginPath();bolha(c,r,bx+(r()-.5)*420,by-20-r()*60,50+r()*40,36+r()*26,r()*.6);c.fill()}for(let k=0;k<14;k++){const x=bx+(r()-.5)*460,h=80+r()*140;c.lineWidth=7+r()*8;c.beginPath();c.moveTo(x,by+10);c.quadraticCurveTo(x+(r()-.5)*40,by-h*.6,x+(r()-.5)*70,by-h);c.stroke()}}
    else{for(let k=0;k<34;k++){const x=bx+(r()-.5)*520,h=90+r()*240,b=(r()-.5)*100;c.lineWidth=6+r()*10;c.beginPath();c.moveTo(x,by+14);c.quadraticCurveTo(x+b*.2,by-h*.6,x+b,by-h);c.stroke()}
      for(let k=0;k<3;k++){c.beginPath();bolha(c,r,bx+(r()-.5)*340,by+6,80+r()*70,56+r()*40,0);c.fill()}}}
  else{const bx=W/2,ty=40;
    if(tema==='galerias'||tema==='cidadela'){c.lineWidth=10;for(let k=0;k<2;k++){const x=bx+(k?-90:90),L=220+r()*240;for(let y=ty;y<ty+L;y+=20){c.beginPath();c.ellipse(x,y,k%2?7:13,11,0,0,TAU);c.stroke()}}}
    else if(tema==='sendas'||tema==='ninho'||tema==='fosso'){for(let k=0;k<8;k++){const x=bx+(r()-.5)*420,L=180+r()*320;c.lineWidth=7+r()*12;c.beginPath();c.moveTo(x,ty-30);c.bezierCurveTo(x+(r()-.5)*90,ty+L*.4,x+(r()-.5)*90,ty+L*.7,x+(r()-.5)*40,ty+L);c.stroke()}}
    else{for(let k=0;k<8;k++){const x=bx+(r()-.5)*460,L=100+r()*260,w=24+r()*36;c.beginPath();c.moveTo(x-w,ty-30);c.quadraticCurveTo(x-w*.3,ty+L*.6,x,ty+L);c.quadraticCurveTo(x+w*.3,ty+L*.6,x+w,ty-30);c.fill()}}}
  return FRENTE[key]={cv,W,H,ax:W/2,ay:f.tipo==='baixo'?H-50:40}}
