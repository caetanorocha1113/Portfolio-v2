/* ---------- enfeites das matérias ----------
   Objetos de cada área desenhados no estilo do cenário (preenchimento escuro, traço de tinta e uma luz de
   destaque), na escala do personagem (~84 de altura). Quem escolhe onde vai cada um é enfeite() em
   js/02b-salas.js. Este arquivo roda na página e no pintor (js/02c-pintor.js): nada de DOM aqui.
   Todas as funções recebem (c, r, x, y, u, T): contexto, sorteio, ponto no chão (ou no teto), escala e o tema da rocha. */
const ENF={
  escuro:T=>mix(T.pedra.dark,T.fundo,.25),
  corpo:T=>mix(T.pedra.base,T.pedra.dark,.3),
  tinta(c,T,w){c.strokeStyle=T.tinta;c.lineWidth=w||3;c.lineJoin='round';c.lineCap='round';c.stroke()},
  luzLinha(c,T,a,w){c.strokeStyle=rgba(T.pedra.light,a);c.lineWidth=w||2;c.lineCap='round';c.stroke()}
};
function caixaTorta(c,x,y,w,h,r,t){t=t||3;c.beginPath();c.moveTo(x+(r()-.5)*t,y+(r()-.5)*t);c.lineTo(x+w+(r()-.5)*t,y+(r()-.5)*t);c.lineTo(x+w+(r()-.5)*t,y+h+(r()-.5)*t);c.lineTo(x+(r()-.5)*t,y+h+(r()-.5)*t);c.closePath()}

/* ===== Humanas: a cidadela das eras ===== */
function coluna(c,r,x,y,h,u,T,quebrada){const w=34*u,cap=46*u;c.fillStyle=ENF.corpo(T);
  caixaTorta(c,x-cap/2,y-14*u,cap,14*u,r);c.fill();ENF.tinta(c,T,3);caixaTorta(c,x-w/2-6*u,y-24*u,w+12*u,10*u,r);c.fill();ENF.tinta(c,T,3);
  const top=y-24*u-h;c.beginPath();c.moveTo(x-w/2,y-24*u);c.lineTo(x-w/2+2*u,top);
  if(quebrada){const n=4;for(let k=0;k<=n;k++)c.lineTo(x-w/2+2*u+(w-4*u)*k/n,top-(k%2?16:4)*u*(.5+r()))}else c.lineTo(x+w/2-2*u,top);
  c.lineTo(x+w/2,y-24*u);c.closePath();c.fill();ENF.tinta(c,T,3);
  c.beginPath();for(let k=1;k<4;k++){const fx=x-w/2+w*k/4;c.moveTo(fx,y-28*u);c.lineTo(fx+(r()-.5)*2,top+(quebrada?18*u:6*u))}ENF.luzLinha(c,T,.28,2);
  if(!quebrada){caixaTorta(c,x-cap/2-4*u,top-12*u,cap+8*u,12*u,r);c.fillStyle=ENF.corpo(T);c.fill();ENF.tinta(c,T,3);
    for(const s of[-1,1]){c.beginPath();c.arc(x+s*(cap/2-2*u),top-6*u,7*u,0,TAU);c.fill();ENF.tinta(c,T,2.5)}}
  else{const dx=(r()<.5?-1:1)*(w+30*u);c.beginPath();c.ellipse(x+dx,y-12*u,w*.55,13*u,(r()-.5)*.3,0,TAU);c.fillStyle=ENF.corpo(T);c.fill();ENF.tinta(c,T,3)}}
function colunata(c,r,x,y,u,T,P){const n=3,esp=110*u,h=(300+r()*80)*u;for(let k=0;k<n;k++)coluna(c,r,x+(k-1)*esp,y,h,u,T,k===2&&r()<.6);
  c.fillStyle=ENF.corpo(T);caixaTorta(c,x-esp-40*u,y-24*u-h-34*u,esp*1.55+40*u,24*u,r);c.fill();ENF.tinta(c,T,3.5);
  c.beginPath();c.moveTo(x-esp-46*u,y-24*u-h-34*u);c.lineTo(x-esp*.1,y-24*u-h-70*u);c.lineTo(x+esp*.55,y-24*u-h-34*u);c.closePath();c.fill();ENF.tinta(c,T,3.5);if(P&&P.win)glow(c,x-esp*.3,y-h*.6,120*u,P.win,.1)}
function busto(c,r,x,y,u,T){c.fillStyle=ENF.corpo(T);caixaTorta(c,x-22*u,y-74*u,44*u,74*u,r);c.fill();ENF.tinta(c,T,3);caixaTorta(c,x-28*u,y-82*u,56*u,10*u,r);c.fill();ENF.tinta(c,T,3);
  c.beginPath();c.moveTo(x-30*u,y-82*u);c.quadraticCurveTo(x-30*u,y-104*u,x-12*u,y-108*u);c.lineTo(x+12*u,y-108*u);c.quadraticCurveTo(x+30*u,y-104*u,x+30*u,y-82*u);c.closePath();c.fillStyle=mix(T.pedra.base,T.pedra.light,.18);c.fill();ENF.tinta(c,T,3);
  c.beginPath();c.ellipse(x+2*u,y-128*u,15*u,20*u,.08,0,TAU);c.fill();ENF.tinta(c,T,3);c.beginPath();c.moveTo(x+14*u,y-132*u);c.lineTo(x+20*u,y-124*u);c.lineTo(x+13*u,y-121*u);ENF.tinta(c,T,2.5);
  c.beginPath();c.arc(x+2*u,y-146*u,13*u,Math.PI*1.05,Math.PI*1.95);ENF.luzLinha(c,T,.35,3)}
function pergaminhos(c,r,x,y,u,T){const cor='#d8cdb3',esc=mix('#d8cdb3',T.pedra.dark,.45);
  for(let k=0;k<5;k++){const px=x+(k-2)*15*u+(r()-.5)*6,py=y-8*u-(k%2)*14*u,L=(46+r()*20)*u,a=(r()-.5)*.25;c.save();c.translate(px,py);c.rotate(a);c.beginPath();c.rect(-L/2,-7*u,L,14*u);c.fillStyle=k%2?cor:esc;c.fill();ENF.tinta(c,T,2.5);
    c.beginPath();c.ellipse(L/2,0,4*u,7*u,0,0,TAU);c.fillStyle=esc;c.fill();ENF.tinta(c,T,2);c.restore()}
  c.beginPath();c.moveTo(x+40*u,y-2);c.quadraticCurveTo(x+70*u,y-6*u,x+96*u,y-2);c.lineTo(x+96*u,y+2);c.lineTo(x+40*u,y+2);c.closePath();c.fillStyle=cor;c.fill();ENF.tinta(c,T,2);
  c.beginPath();for(let k=0;k<3;k++){c.moveTo(x+48*u,y-3*u+k*1.5*u-2*u);c.lineTo(x+86*u,y-3*u+k*1.5*u-2*u)}c.strokeStyle=rgba('#3a3020',.5);c.lineWidth=1;c.stroke()}
function relogioSol(c,r,x,y,u,T){c.fillStyle=ENF.corpo(T);c.beginPath();c.moveTo(x-16*u,y);c.lineTo(x-12*u,y-58*u);c.lineTo(x+12*u,y-58*u);c.lineTo(x+16*u,y);c.closePath();c.fill();ENF.tinta(c,T,3);
  c.beginPath();c.ellipse(x,y-62*u,40*u,11*u,0,0,TAU);c.fillStyle=mix(T.pedra.base,T.pedra.light,.25);c.fill();ENF.tinta(c,T,3);
  c.beginPath();for(let k=0;k<12;k++){const a=Math.PI+k/11*Math.PI;c.moveTo(x+Math.cos(a)*30*u,y-62*u+Math.sin(a)*8*u);c.lineTo(x+Math.cos(a)*36*u,y-62*u+Math.sin(a)*9.6*u)}ENF.luzLinha(c,T,.5,1.6);
  c.beginPath();c.moveTo(x-4*u,y-62*u);c.lineTo(x+4*u,y-96*u);c.lineTo(x+16*u,y-62*u);c.closePath();c.fillStyle=ENF.escuro(T);c.fill();ENF.tinta(c,T,2.5)}
function estandarte(c,r,x,y,L,u,T,cor){c.beginPath();c.moveTo(x,y-6);c.lineTo(x,y+L*.25);ENF.tinta(c,T,2.5);
  const w=(46+r()*16)*u,h=L*.75,top=y+L*.25;c.beginPath();c.moveTo(x-w/2,top);c.lineTo(x+w/2,top);c.lineTo(x+w/2+3*u,top+h);c.lineTo(x,top+h-22*u);c.lineTo(x-w/2-3*u,top+h);c.closePath();
  c.fillStyle=mix(cor,T.pedra.dark,.55);c.fill();ENF.tinta(c,T,3);c.beginPath();c.moveTo(x-w/2-8*u,top);c.lineTo(x+w/2+8*u,top);ENF.tinta(c,T,5);
  c.beginPath();c.arc(x,top+h*.38,w*.22,0,TAU);c.strokeStyle=rgba(cor,.7);c.lineWidth=2.4;c.stroke();c.beginPath();for(let k=0;k<5;k++){const a=-Math.PI/2+k/5*TAU*2;c.lineTo(x+Math.cos(a)*w*.15,top+h*.38+Math.sin(a)*w*.15)}c.closePath();c.fillStyle=rgba(cor,.6);c.fill()}
function estatua(c,r,x,y,u,T,P){const h=(260+r()*60)*u;c.fillStyle=ENF.corpo(T);caixaTorta(c,x-48*u,y-60*u,96*u,60*u,r);c.fill();ENF.tinta(c,T,3.5);caixaTorta(c,x-56*u,y-70*u,112*u,12*u,r);c.fill();ENF.tinta(c,T,3.5);
  const b=y-70*u;c.beginPath();c.moveTo(x-40*u,b);c.quadraticCurveTo(x-34*u,b-h*.5,x-16*u,b-h*.78);c.lineTo(x+16*u,b-h*.78);c.quadraticCurveTo(x+38*u,b-h*.5,x+42*u,b);c.closePath();c.fillStyle=mix(T.pedra.base,T.pedra.light,.12);c.fill();ENF.tinta(c,T,3.5);
  c.beginPath();for(let k=0;k<4;k++){c.moveTo(x-26*u+k*16*u,b-4*u);c.quadraticCurveTo(x-22*u+k*14*u,b-h*.4,x-12*u+k*8*u,b-h*.7)}ENF.luzLinha(c,T,.22,2);
  c.beginPath();c.arc(x,b-h*.86,17*u,0,TAU);c.fill();ENF.tinta(c,T,3);
  c.beginPath();c.moveTo(x+14*u,b-h*.72);c.quadraticCurveTo(x+40*u,b-h*.82,x+44*u,b-h*1.02);ENF.tinta(c,T,9*u);c.beginPath();c.moveTo(x+14*u,b-h*.72);c.quadraticCurveTo(x+40*u,b-h*.82,x+44*u,b-h*1.02);c.strokeStyle=mix(T.pedra.base,T.pedra.light,.12);c.lineWidth=5*u;c.stroke();
  c.beginPath();c.moveTo(x+38*u,b-h*1.02);c.lineTo(x+50*u,b-h*1.02);c.lineTo(x+46*u,b-h*1.12);c.closePath();c.fillStyle=ENF.escuro(T);c.fill();ENF.tinta(c,T,2.5);glow(c,x+44*u,b-h*1.16,70*u,(P&&P.win)||T.luz,.4);glow(c,x+44*u,b-h*1.16,16*u,'#fff4dc',.9)}
function anfora(c,r,x,y,u,T){c.beginPath();c.moveTo(x-6*u,y);c.quadraticCurveTo(x-26*u,y-30*u,x-14*u,y-56*u);c.lineTo(x-8*u,y-66*u);c.lineTo(x-10*u,y-72*u);c.lineTo(x+10*u,y-72*u);c.lineTo(x+8*u,y-66*u);c.lineTo(x+14*u,y-56*u);c.quadraticCurveTo(x+26*u,y-30*u,x+6*u,y);c.closePath();
  c.fillStyle=mix(T.pedra.base,'#6b4a33',.35);c.fill();ENF.tinta(c,T,3);for(const s of[-1,1]){c.beginPath();c.moveTo(x+s*9*u,y-64*u);c.quadraticCurveTo(x+s*24*u,y-64*u,x+s*16*u,y-48*u);ENF.tinta(c,T,2.5)}
  c.beginPath();c.moveTo(x-18*u,y-38*u);c.quadraticCurveTo(x,y-34*u,x+18*u,y-38*u);ENF.luzLinha(c,T,.3,2)}

/* ===== Matemática: as minas do número ===== */
const ICOS=(()=>{const t=(1+Math.sqrt(5))/2,v=[[-1,t,0],[1,t,0],[-1,-t,0],[1,-t,0],[0,-1,t],[0,1,t],[0,-1,-t],[0,1,-t],[t,0,-1],[t,0,1],[-t,0,-1],[-t,0,1]],f=[[0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],[1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],[3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],[4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]];return{v,f}})();
function poliedro(c,r,x,y,R,P,T){const a=r()*6,b=r()*6,ca=Math.cos(a),sa=Math.sin(a),cb=Math.cos(b),sb=Math.sin(b);
  const V=ICOS.v.map(([px,py,pz])=>{let X=px*ca-pz*sa,Z=px*sa+pz*ca,Y=py*cb-Z*sb;Z=py*sb+Z*cb;return[x+X*R*.52,y+Y*R*.52,Z]});
  const F=ICOS.f.map(f=>({f,z:(V[f[0]][2]+V[f[1]][2]+V[f[2]][2])/3})).sort((p,q)=>p.z-q.z);
  glow(c,x,y,R*1.8,P.g,.3);
  for(const{f,z}of F){if(z<0)continue;const k=.45+z*.35;c.beginPath();c.moveTo(V[f[0]][0],V[f[0]][1]);c.lineTo(V[f[1]][0],V[f[1]][1]);c.lineTo(V[f[2]][0],V[f[2]][1]);c.closePath();c.fillStyle=mix(P.d,P.m,Math.min(1,k));c.fill();c.strokeStyle=rgba(P.l,.55);c.lineWidth=1.6;c.stroke()}
  c.lineWidth=3;c.strokeStyle=T.tinta;
  for(const{f,z}of F){if(z<0)continue;for(let e=0;e<3;e++){const A=V[f[e]],B=V[f[(e+1)%3]];c.beginPath();c.moveTo(A[0],A[1]);c.lineTo(B[0],B[1]);c.globalAlpha=.25;c.stroke()}}c.globalAlpha=1}
function abaco(c,r,x,y,u,T,P){const w=120*u,h=90*u,x0=x-w/2,y0=y-h-12*u;c.fillStyle=P.wood||ENF.corpo(T);
  for(const s of[-1,1]){c.beginPath();c.rect(x+s*w/2-5*u,y0-6*u,10*u,h+18*u);c.fill();ENF.tinta(c,T,3)}c.beginPath();c.rect(x0,y0-6*u,w,10*u);c.fill();ENF.tinta(c,T,3);c.beginPath();c.rect(x0,y0+h-4*u,w,10*u);c.fill();ENF.tinta(c,T,3);
  const cores=[P.m||'#e070b4',P.g||'#ff9fd4','#f2d49b','#9a7ae0'];for(let k=0;k<5;k++){const ry=y0+10*u+k*16*u;c.beginPath();c.moveTo(x0+4*u,ry);c.lineTo(x0+w-4*u,ry);c.strokeStyle=rgba(T.pedra.light,.6);c.lineWidth=2;c.stroke();
    const n=2+((r()*6)|0),off=r()*.5;for(let q=0;q<n;q++){c.beginPath();c.ellipse(x0+12*u+(off*w*.4)+q*13*u,ry,6*u,6.5*u,0,0,TAU);c.fillStyle=cores[(k+q)%cores.length];c.fill();ENF.tinta(c,T,1.8)}}}
function quadro(c,r,x,y,u,T,P){const w=(220+r()*40)*u,h=140*u,x0=x-w/2,y0=y-h-70*u;c.fillStyle=P.wood||'#3a2838';
  for(const s of[-1,1]){c.beginPath();c.moveTo(x+s*w*.38,y0+h);c.lineTo(x+s*w*.46,y+4);ENF.tinta(c,T,8*u);c.beginPath();c.moveTo(x+s*w*.38,y0+h);c.lineTo(x+s*w*.46,y+4);c.strokeStyle=P.wood||'#3a2838';c.lineWidth=5*u;c.stroke()}
  c.beginPath();c.rect(x0-8*u,y0-8*u,w+16*u,h+16*u);c.fillStyle=P.wood||'#3a2838';c.fill();ENF.tinta(c,T,3);c.beginPath();c.rect(x0,y0,w,h);c.fillStyle='#16201c';c.fill();ENF.tinta(c,T,2);
  const giz='rgba(236,240,232,.82)',fs=Math.round(20*u);c.fillStyle=giz;c.font=`italic ${fs}px serif`;c.textBaseline='top';
  const L=[['a² + b² = c²','π ≈ 3,1416'],['x = (−b ± √Δ) / 2a','∑ 1/n²'],['f(x) = ax + b','e^{iπ} + 1 = 0'],['sen²θ + cos²θ = 1','√2 ≈ 1,414']][(r()*4)|0];
  c.fillText(L[0],x0+12*u,y0+14*u);c.fillText(L[1],x0+12*u,y0+46*u);
  c.strokeStyle=giz;c.lineWidth=2;c.beginPath();const tx=x0+w-70*u,ty=y0+h-22*u;c.moveTo(tx,ty);c.lineTo(tx+54*u,ty);c.lineTo(tx,ty-50*u);c.closePath();c.stroke();c.beginPath();c.rect(tx,ty-9*u,9*u,9*u);c.stroke();
  c.beginPath();c.arc(x0+40*u,y0+h-30*u,18*u,0,TAU);c.moveTo(x0+40*u,y0+h-30*u);c.lineTo(x0+58*u,y0+h-30*u);c.stroke()}
function compasso(c,r,x,y,u,T){const h=(110+r()*30)*u,a=.32;c.fillStyle='#9aa0b0';
  for(const s of[-1,1]){c.beginPath();c.moveTo(x,y-h);c.lineTo(x+s*Math.tan(a)*h,y);c.lineTo(x+s*Math.tan(a)*h-s*6*u,y-4*u);c.closePath();c.fill();ENF.tinta(c,T,3)}
  c.beginPath();c.arc(x,y-h,9*u,0,TAU);c.fillStyle='#6f7482';c.fill();ENF.tinta(c,T,2.5);c.beginPath();c.moveTo(x,y-h-9*u);c.lineTo(x,y-h-26*u);ENF.tinta(c,T,5*u);
  c.beginPath();c.arc(x,y,Math.tan(a)*h,Math.PI*1.05,Math.PI*1.95);c.strokeStyle=rgba('#ffe0f2',.35);c.lineWidth=2;c.setLineDash([6,6]);c.stroke();c.setLineDash([])}
function transferidor(c,r,x,y,u,T){const R=(44+r()*14)*u;c.beginPath();c.arc(x,y,R,Math.PI,0);c.closePath();c.fillStyle=rgba('#ece2ff',.18);c.fill();ENF.tinta(c,T,3);
  c.beginPath();for(let k=0;k<=18;k++){const a=Math.PI+k/18*Math.PI,l=k%3?6*u:11*u;c.moveTo(x+Math.cos(a)*R,y+Math.sin(a)*R);c.lineTo(x+Math.cos(a)*(R-l),y+Math.sin(a)*(R-l))}c.strokeStyle=rgba('#ece2ff',.75);c.lineWidth=1.5;c.stroke();
  c.beginPath();c.arc(x,y,R*.45,Math.PI,0);c.stroke()}
function vagonete(c,r,x,y,u,T,P,C){const w=110*u,h=56*u;c.beginPath();c.moveTo(x-180*u,y-4);c.lineTo(x+180*u,y-4);ENF.tinta(c,T,6*u);for(let k=-3;k<=3;k++){c.beginPath();c.rect(x+k*52*u-8*u,y-8,16*u,8*u);c.fillStyle=P.wood||'#3a2838';c.fill()}
  cluster(c,r,x,y-h-10*u,40*u,0,C,4,.25);
  c.beginPath();c.moveTo(x-w/2,y-h-12*u);c.lineTo(x+w/2,y-h-12*u);c.lineTo(x+w/2-12*u,y-18*u);c.lineTo(x-w/2+12*u,y-18*u);c.closePath();c.fillStyle=ENF.corpo(T);c.fill();ENF.tinta(c,T,3.5);
  c.beginPath();c.moveTo(x-w/2+8*u,y-h);c.lineTo(x+w/2-8*u,y-h);ENF.luzLinha(c,T,.3,2);for(const s of[-1,1]){c.beginPath();c.arc(x+s*w*.3,y-14*u,13*u,0,TAU);c.fillStyle=ENF.escuro(T);c.fill();ENF.tinta(c,T,3)}}
function dados(c,r,x,y,u,T,P){const cubo=(cx,cy,s)=>{const d=s*.5;c.beginPath();c.moveTo(cx,cy);c.lineTo(cx+s,cy-d*.6);c.lineTo(cx+s,cy-s-d*.6);c.lineTo(cx,cy-s);c.closePath();c.fillStyle=mix(P.d,P.m,.35);c.fill();ENF.tinta(c,T,2.5);
    c.beginPath();c.moveTo(cx,cy);c.lineTo(cx-s,cy-d*.6);c.lineTo(cx-s,cy-s-d*.6);c.lineTo(cx,cy-s);c.closePath();c.fillStyle=mix(P.d,P.m,.6);c.fill();ENF.tinta(c,T,2.5);
    c.beginPath();c.moveTo(cx,cy-s);c.lineTo(cx+s,cy-s-d*.6);c.lineTo(cx,cy-s-d*1.2);c.lineTo(cx-s,cy-s-d*.6);c.closePath();c.fillStyle=mix(P.m,P.l,.3);c.fill();ENF.tinta(c,T,2.5)};
  const s=24*u;cubo(x-s,y,s);cubo(x+s,y,s);cubo(x,y-s-s*.3,s)}

/* ===== Linguagens: as galerias das vozes ===== */
const CORES_LIVRO=['#7a3b2a','#3e5a3a','#2f4a6b','#8a6a2a','#5a2f4f','#6b5038','#344a52'];
function livroLombada(c,r,x,y,w,h,T,inclina){c.save();c.translate(x,y);c.rotate(inclina||0);c.beginPath();c.rect(0,-h,w,h);c.fillStyle=CORES_LIVRO[(r()*CORES_LIVRO.length)|0];c.fill();c.strokeStyle=T.tinta;c.lineWidth=2;c.stroke();
  c.beginPath();c.moveTo(2,-h*.8);c.lineTo(w-2,-h*.8);c.moveTo(2,-h*.2);c.lineTo(w-2,-h*.2);c.strokeStyle='rgba(240,210,150,.45)';c.lineWidth=1.2;c.stroke();c.restore()}
function estante(c,r,x,y,u,T,P){const w=(200+r()*80)*u,h=(330+r()*90)*u,x0=x-w/2,y0=y-h;c.fillStyle=P.wood||'#3b2c22';caixaTorta(c,x0-10*u,y0-14*u,w+20*u,h+14*u,r);c.fill();ENF.tinta(c,T,4);
  c.beginPath();c.rect(x0,y0,w,h-6*u);c.fillStyle=mix(P.wood||'#3b2c22','#000',.55);c.fill();
  const n=4,ph=(h-6*u)/n;for(let k=0;k<n;k++){const by=y0+ph*(k+1);c.beginPath();c.rect(x0-4*u,by-6*u,w+8*u,8*u);c.fillStyle=P.wood||'#3b2c22';c.fill();ENF.tinta(c,T,2.5);
    let bx=x0+4*u;while(bx<x0+w-14*u){const bw=(9+r()*9)*u,bh=ph*(.55+r()*.33);if(r()<.08){bx+=bw*1.6;continue}const inc=r()<.1?-.25:0;livroLombada(c,r,bx,by-6*u,bw,bh,T,inc);bx+=bw+(inc?8*u:1)}}
  c.beginPath();c.moveTo(x0+w*.75,y);c.lineTo(x0+w*.95,y0+h*.12);c.moveTo(x0+w*.75+26*u,y);c.lineTo(x0+w*.95+26*u,y0+h*.12);ENF.tinta(c,T,5*u);for(let k=1;k<8;k++){const f=k/8;c.beginPath();c.moveTo(x0+w*(.75+.2*f),y-(h*.88)*f);c.lineTo(x0+w*(.75+.2*f)+26*u,y-(h*.88)*f);ENF.tinta(c,T,3.5*u)}}
function atril(c,r,x,y,u,T,P){c.beginPath();c.moveTo(x-34*u,y);c.lineTo(x,y-14*u);c.lineTo(x+34*u,y);ENF.tinta(c,T,6*u);c.beginPath();c.moveTo(x,y-10*u);c.lineTo(x,y-86*u);ENF.tinta(c,T,9*u);c.beginPath();c.moveTo(x,y-10*u);c.lineTo(x,y-86*u);c.strokeStyle=P.wood||'#3b2c22';c.lineWidth=5*u;c.stroke();
  const by=y-96*u;glow(c,x,by-20*u,90*u,P.amber||T.luz,.25);
  for(const s of[-1,1]){c.beginPath();c.moveTo(x,by+6*u);c.quadraticCurveTo(x+s*24*u,by-4*u,x+s*52*u,by+2*u);c.lineTo(x+s*50*u,by-30*u);c.quadraticCurveTo(x+s*24*u,by-38*u,x,by-26*u);c.closePath();c.fillStyle='#e6dcc4';c.fill();ENF.tinta(c,T,2.5);
    c.beginPath();for(let k=0;k<4;k++){c.moveTo(x+s*10*u,by-20*u+k*6*u);c.quadraticCurveTo(x+s*26*u,by-24*u+k*6*u,x+s*44*u,by-20*u+k*6*u)}c.strokeStyle='rgba(60,45,30,.55)';c.lineWidth=1.2;c.stroke()}}
function pilhaLivros(c,r,x,y,u,T){let yy=y;const n=3+((r()*4)|0);for(let k=0;k<n;k++){const w=(52+r()*26)*u,h=(10+r()*6)*u,dx=(r()-.5)*12*u;c.beginPath();c.rect(x-w/2+dx,yy-h,w,h);c.fillStyle=CORES_LIVRO[(r()*CORES_LIVRO.length)|0];c.fill();ENF.tinta(c,T,2.2);
    c.beginPath();c.moveTo(x-w/2+dx+4*u,yy-h/2);c.lineTo(x+w/2+dx-4*u,yy-h/2);c.strokeStyle='rgba(240,225,190,.5)';c.lineWidth=1;c.stroke();yy-=h}}
function tinteiro(c,r,x,y,u,T){c.beginPath();c.moveTo(x-14*u,y);c.lineTo(x-16*u,y-16*u);c.quadraticCurveTo(x,y-24*u,x+16*u,y-16*u);c.lineTo(x+14*u,y);c.closePath();c.fillStyle='#14161c';c.fill();ENF.tinta(c,T,2.5);
  c.beginPath();c.moveTo(x+2*u,y-20*u);c.quadraticCurveTo(x+16*u,y-60*u,x+34*u,y-92*u);c.quadraticCurveTo(x+18*u,y-66*u,x+2*u,y-20*u);c.fillStyle='#e8e0cf';c.fill();ENF.tinta(c,T,2);
  c.beginPath();for(let k=1;k<6;k++){const f=k/6;c.moveTo(x+2*u+32*u*f,y-20*u-72*u*f);c.lineTo(x+2*u+32*u*f-9*u,y-20*u-72*u*f+5*u)}c.strokeStyle='rgba(60,50,40,.45)';c.lineWidth=1;c.stroke()}
function letras(c,r,x,y,u,T){const L=['A','Ω','Ç','ß','Ñ','Ã','Θ','Я','あ','字'];for(let k=0;k<3;k++){const s=(34+r()*12)*u,px=x+(k-1)*44*u+(r()-.5)*8,py=y-(k===1&&r()<.5?s:0);
    c.save();c.translate(px,py);c.rotate((r()-.5)*.25);c.beginPath();c.rect(-s/2,-s,s,s);c.fillStyle=ENF.corpo(T);c.fill();ENF.tinta(c,T,3);c.fillStyle=rgba(T.aro,.9);c.font=`bold ${Math.round(s*.66)}px serif`;c.textAlign='center';c.textBaseline='middle';c.fillText(L[(r()*L.length)|0],0,-s/2+1);c.restore()}}
function varal(c,r,x,y,u,T,P){const w=(200+r()*80)*u,cai=(40+r()*30)*u;c.beginPath();c.moveTo(x-w/2,y);c.quadraticCurveTo(x,y+cai*2,x+w/2,y);ENF.tinta(c,T,2);
  const L='ABCDEFGHIJLMNOPRSTUVXZ';for(let k=1;k<6;k++){const f=k/6,px=x-w/2+w*f,py=y+cai*2*2*f*(1-f);c.save();c.translate(px,py);c.rotate((r()-.5)*.2);c.beginPath();c.rect(-10*u,0,20*u,26*u);c.fillStyle='#e6dcc4';c.fill();ENF.tinta(c,T,1.6);
    c.fillStyle='#3a2a1c';c.font=`${Math.round(16*u)}px serif`;c.textAlign='center';c.textBaseline='middle';c.fillText(L[(r()*L.length)|0],0,13*u);c.restore()}}
function corneta(c,r,x,y,u,T,P){c.beginPath();c.rect(x-34*u,y-40*u,68*u,40*u);c.fillStyle=P.wood||'#3b2c22';c.fill();ENF.tinta(c,T,3);c.beginPath();c.moveTo(x,y-40*u);c.lineTo(x+6*u,y-70*u);ENF.tinta(c,T,5*u);
  c.beginPath();c.moveTo(x+4*u,y-68*u);c.quadraticCurveTo(x+40*u,y-80*u,x+64*u,y-130*u);c.lineTo(x+96*u,y-104*u);c.quadraticCurveTo(x+50*u,y-84*u,x+12*u,y-62*u);c.closePath();c.fillStyle='#b8893a';c.fill();ENF.tinta(c,T,3);
  c.beginPath();c.ellipse(x+80*u,y-117*u,22*u,10*u,-.68,0,TAU);c.fillStyle='#2a1d10';c.fill();ENF.tinta(c,T,2.5);c.beginPath();for(let k=0;k<3;k++){c.moveTo(x+104*u+k*10*u,y-130*u-k*6*u);c.quadraticCurveTo(x+112*u+k*10*u,y-118*u-k*6*u,x+106*u+k*10*u,y-104*u-k*6*u)}c.strokeStyle=rgba(T.luz,.5);c.lineWidth=2;c.stroke()}
function vela(c,r,x,y,u,T,P){for(let k=0;k<3;k++){const h=(22+r()*30)*u,px=x+(k-1)*16*u;c.beginPath();c.rect(px-5*u,y-h,10*u,h);c.fillStyle='#e8dcc0';c.fill();ENF.tinta(c,T,2);
    c.beginPath();c.ellipse(px,y-h-7*u,3.5*u,7*u,0,0,TAU);c.fillStyle='#ffd27a';c.fill();glow(c,px,y-h-8*u,38*u,(P&&P.amber)||'#ffc074',.5)}}

/* ===== Natureza: as sendas vivas ===== */
function arvore(c,r,x,y,u,T,P){const h=(360+r()*120)*u;c.fillStyle=mix(T.pedra.dark,'#0b1f18',.5);
  c.beginPath();c.moveTo(x-30*u,y+4);c.quadraticCurveTo(x-20*u,y-h*.5,x-12*u,y-h*.8);c.lineTo(x+12*u,y-h*.8);c.quadraticCurveTo(x+22*u,y-h*.5,x+34*u,y+4);c.closePath();c.fill();ENF.tinta(c,T,4);
  for(const s of[-1,1]){c.beginPath();c.moveTo(x+s*20*u,y);c.quadraticCurveTo(x+s*50*u,y-6*u,x+s*80*u,y+6*u);ENF.tinta(c,T,8*u)}
  c.strokeStyle=mix(T.pedra.dark,'#0b1f18',.5);for(let k=0;k<5;k++)branch(c,r,x+(r()-.5)*10*u,y-h*(.45+r()*.35),(90+r()*90)*u,-Math.PI/2+(r()-.5)*1.8,9*u,4);
  for(let k=0;k<5;k++)foliage(c,r,x+(r()-.5)*180*u,y-h*(.8+r()*.3),(60+r()*50)*u,['#0b302a','#1d6a4f','#4fae74'],1,r()<.4?[P.flower,P.flower2]:null)}
function samambaia(c,r,x,y,u,T){for(let k=0;k<5;k++){const a=-Math.PI/2+(k-2)*.38+(r()-.5)*.2,L=(50+r()*40)*u;let px=x,py=y,ang=a;c.beginPath();c.moveTo(px,py);const pts=[];
    for(let d=0;d<L;d+=6*u){ang+=.03*(k<2?-1:1);px+=Math.cos(ang)*6*u;py+=Math.sin(ang)*6*u;c.lineTo(px,py);pts.push([px,py,ang])}c.strokeStyle='#1d5a44';c.lineWidth=2.2;c.stroke();
    pts.forEach(([qx,qy,qa],i)=>{if(i%2)return;const l=(1-i/pts.length)*12*u+3*u;for(const s of[-1,1]){c.beginPath();c.ellipse(qx+Math.cos(qa+s*1.3)*l*.6,qy+Math.sin(qa+s*1.3)*l*.6,l*.6,l*.22,qa+s*1.3,0,TAU);c.fillStyle=i%4?'#2f7d58':'#4fae74';c.fill()}})}}
function flores(c,r,x,y,u,P){for(let k=0;k<4;k++){const px=x+(k-1.5)*16*u,h=(24+r()*34)*u,cor=r()<.5?P.flower:P.flower2;c.beginPath();c.moveTo(px,y);c.quadraticCurveTo(px+(r()-.5)*12,y-h*.5,px,y-h);c.strokeStyle='#1d5a44';c.lineWidth=2;c.stroke();
    for(let q=0;q<5;q++){const a=q/5*TAU;c.beginPath();c.ellipse(px+Math.cos(a)*5*u,y-h+Math.sin(a)*5*u,5*u,2.6*u,a,0,TAU);c.fillStyle=cor;c.fill()}glow(c,px,y-h,22*u,cor,.35)}}
function frascos(c,r,x,y,u,T){const liq=['#7dffa0','#5ae0d0','#c6ff6a','#ffd27a'];c.beginPath();c.rect(x-60*u,y-8*u,120*u,8*u);c.fillStyle=ENF.corpo(T);c.fill();ENF.tinta(c,T,2.5);
  const erl=(px)=>{const l=liq[(r()*liq.length)|0];c.beginPath();c.moveTo(px-6*u,y-58*u);c.lineTo(px-6*u,y-40*u);c.lineTo(px-22*u,y-8*u);c.lineTo(px+22*u,y-8*u);c.lineTo(px+6*u,y-40*u);c.lineTo(px+6*u,y-58*u);c.fillStyle=rgba('#e8f4ff',.12);c.fill();ENF.tinta(c,T,2.5);
    c.beginPath();c.moveTo(px-14*u,y-24*u);c.lineTo(px-22*u,y-9*u);c.lineTo(px+22*u,y-9*u);c.lineTo(px+14*u,y-24*u);c.closePath();c.fillStyle=rgba(l,.7);c.fill();glow(c,px,y-18*u,40*u,l,.35)};
  const bal=(px)=>{const l=liq[(r()*liq.length)|0];c.beginPath();c.arc(px,y-24*u,16*u,0,TAU);c.fillStyle=rgba('#e8f4ff',.12);c.fill();c.beginPath();c.arc(px,y-24*u,16*u,Math.PI*.15,Math.PI*.85);c.closePath();c.fillStyle=rgba(l,.7);c.fill();
    c.beginPath();c.arc(px,y-24*u,16*u,0,TAU);c.moveTo(px-4*u,y-40*u);c.lineTo(px-4*u,y-62*u);c.moveTo(px+4*u,y-40*u);c.lineTo(px+4*u,y-62*u);ENF.tinta(c,T,2.5);glow(c,px,y-24*u,36*u,l,.3)};
  erl(x-30*u);bal(x+18*u);for(let k=0;k<3;k++){const px=x+40*u+k*9*u,l=liq[k%liq.length];c.beginPath();c.rect(px-3*u,y-44*u,6*u,36*u);c.fillStyle=rgba('#e8f4ff',.1);c.fill();ENF.tinta(c,T,1.8);c.beginPath();c.rect(px-3*u,y-24*u,6*u,16*u);c.fillStyle=rgba(l,.75);c.fill()}}
function microscopio(c,r,x,y,u,T){c.fillStyle=ENF.corpo(T);c.beginPath();c.ellipse(x,y-6*u,34*u,8*u,0,0,TAU);c.fill();ENF.tinta(c,T,3);c.beginPath();c.moveTo(x-6*u,y-8*u);c.quadraticCurveTo(x+30*u,y-40*u,x+4*u,y-90*u);ENF.tinta(c,T,10*u);c.beginPath();c.moveTo(x-6*u,y-8*u);c.quadraticCurveTo(x+30*u,y-40*u,x+4*u,y-90*u);c.strokeStyle=ENF.corpo(T);c.lineWidth=6*u;c.stroke();
  c.save();c.translate(x-8*u,y-80*u);c.rotate(-.45);c.beginPath();c.rect(-8*u,-38*u,16*u,62*u);c.fillStyle=mix(T.pedra.base,T.pedra.light,.2);c.fill();ENF.tinta(c,T,3);c.beginPath();c.rect(-11*u,-46*u,22*u,10*u);c.fill();ENF.tinta(c,T,2.5);c.restore();
  c.beginPath();c.rect(x-26*u,y-44*u,40*u,6*u);c.fillStyle=ENF.escuro(T);c.fill();ENF.tinta(c,T,2.5);glow(c,x-10*u,y-44*u,26*u,'#8ff0b8',.4)}
function fossil(c,r,x,y,u,T){const R=(30+r()*12)*u,cx=x,cy=y-R-4*u;c.beginPath();bolha(c,r,cx,cy,R*1.4,R*1.15,0,7);c.fillStyle=ENF.corpo(T);c.fill();ENF.tinta(c,T,3);
  c.beginPath();let a=0,rr=R*.95;c.moveTo(cx+rr,cy);for(let k=0;k<70;k++){a+=.18;rr*=.975;c.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr)}ENF.luzLinha(c,T,.55,2.4);
  c.beginPath();a=0;rr=R*.95;for(let k=0;k<70;k+=4){a=k*.18;const r2=R*.95*Math.pow(.975,k);c.moveTo(cx+Math.cos(a)*r2,cy+Math.sin(a)*r2);c.lineTo(cx+Math.cos(a)*r2*.82,cy+Math.sin(a)*r2*.82)}ENF.luzLinha(c,T,.35,1.4)}
function borboletas(c,r,x,y,u,P){for(let k=0;k<3;k++){const px=x+(r()-.5)*140*u,py=y-(60+r()*120)*u,s=(6+r()*4)*u,cor=r()<.5?P.flower2:'#ffe9a8',a=(r()-.5)*.6;c.save();c.translate(px,py);c.rotate(a);
    for(const sd of[-1,1]){c.beginPath();c.ellipse(sd*s,-s*.4,s,s*.75,sd*.5,0,TAU);c.fillStyle=rgba(cor,.85);c.fill();c.beginPath();c.ellipse(sd*s*.8,s*.6,s*.6,s*.45,sd*.3,0,TAU);c.fill()}
    c.restore();glow(c,px,py,26*u,cor,.35)}}
function sementes(c,r,x,y,L,u,P){c.beginPath();c.moveTo(x,y-6);c.quadraticCurveTo(x+(r()-.5)*30,y+L*.5,x,y+L);c.strokeStyle='#1d5a44';c.lineWidth=2.4;c.stroke();
  for(let k=0;k<3;k++){const py=y+L-k*16*u,px=x+(k%2?7:-7)*u;c.beginPath();c.ellipse(px,py,7*u,11*u,0,0,TAU);c.fillStyle='#d6ff8a';c.fill();glow(c,px,py,30*u,'#d6ff8a',.45)}}

/* ===== Técnico: a grande teia (a rede) ===== */
function rack(c,r,x,y,u,T){const w=(90+r()*20)*u,h=(260+r()*60)*u,x0=x-w/2,y0=y-h;glow(c,x,y-h*.5,h*.7,'#7dffa0',.07);c.beginPath();c.rect(x0,y0,w,h);c.fillStyle='#1e271e';c.fill();ENF.tinta(c,T,4);c.beginPath();c.moveTo(x0+3*u,y-4*u);c.lineTo(x0+3*u,y0+4*u);c.lineTo(x0+w-3*u,y0+4*u);ENF.luzLinha(c,T,.45,2.4);
  const n=Math.floor(h/(26*u));for(let k=0;k<n;k++){const by=y0+8*u+k*26*u;c.beginPath();c.rect(x0+8*u,by,w-16*u,18*u);c.fillStyle='#283328';c.fill();c.strokeStyle='#020302';c.lineWidth=2;c.stroke();
    for(let q=0;q<3;q++){const on=r()<.6,cor=r()<.75?'#7dffa0':'#ffcf5a';c.beginPath();c.arc(x0+16*u+q*9*u,by+9*u,2.6*u,0,TAU);c.fillStyle=on?cor:'#203020';c.fill();if(on)glow(c,x0+16*u+q*9*u,by+9*u,18*u,cor,.6)}
    c.beginPath();for(let q=0;q<4;q++){c.moveTo(x0+w*.5+q*6*u,by+4*u);c.lineTo(x0+w*.5+q*6*u,by+14*u)}c.strokeStyle='#2a342a';c.lineWidth=1.5;c.stroke()}
  for(let k=0;k<3;k++){c.beginPath();c.moveTo(x0+w*(.25+k*.25),y0);c.bezierCurveTo(x0+w*(.25+k*.25),y0-60*u,x0+w*(.25+k*.25)+(r()-.5)*160*u,y0-120*u,x0+w*(.25+k*.25)+(r()-.5)*220*u,y0-200*u-r()*100*u);ENF.tinta(c,T,4*u)}}
function monitor(c,r,x,y,u,T){c.beginPath();c.rect(x-60*u,y-36*u,120*u,8*u);c.fillStyle=ENF.corpo(T);c.fill();ENF.tinta(c,T,2.5);for(const s of[-1,1]){c.beginPath();c.moveTo(x+s*50*u,y-28*u);c.lineTo(x+s*52*u,y);ENF.tinta(c,T,5*u)}
  c.beginPath();c.moveTo(x-40*u,y-38*u);c.lineTo(x-46*u,y-104*u);c.lineTo(x+46*u,y-104*u);c.lineTo(x+40*u,y-38*u);c.closePath();c.fillStyle='#c9c2ad';c.fill();ENF.tinta(c,T,3);
  c.beginPath();c.rect(x-36*u,y-98*u,72*u,50*u);c.fillStyle='#071209';c.fill();ENF.tinta(c,T,2);glow(c,x,y-73*u,70*u,'#7dffa0',.22);
  c.fillStyle='#7dffa0';for(let k=0;k<5;k++){const lw=(18+r()*40)*u,ind=(k%3)*6*u;c.fillRect(x-30*u+ind,y-92*u+k*9*u,Math.min(lw,60*u-ind),3*u)}
  c.beginPath();c.rect(x-34*u,y-48*u,68*u,10*u);c.fillStyle='#d8d1bc';c.fill();ENF.tinta(c,T,2)}
function cabos(c,r,x,y,u,T){const cores=['#1a1f1a','#2a1a1a','#1a1f2a'];for(let k=0;k<4;k++){const L=(140+r()*120)*u,dx=(r()-.5)*40*u;c.beginPath();c.moveTo(x-L/2+dx,y-2);c.bezierCurveTo(x-L/4,y-30*u*r(),x+L/4,y+6,x+L/2+dx,y-4-r()*20*u);
    c.strokeStyle=T.tinta;c.lineWidth=8*u;c.stroke();c.strokeStyle=cores[k%cores.length];c.lineWidth=5*u;c.stroke()}
  c.beginPath();c.rect(x-10*u,y-16*u,20*u,14*u);c.fillStyle='#2a302a';c.fill();ENF.tinta(c,T,2);c.beginPath();c.arc(x+5*u,y-9*u,2.4*u,0,TAU);c.fillStyle='#ffcf5a';c.fill();glow(c,x+5*u,y-9*u,12*u,'#ffcf5a',.5)}
function robo(c,r,x,y,u,T){const cor=mix('#c9c2ad',T.pedra.base,.25);c.beginPath();c.rect(x-26*u,y-14*u,52*u,14*u);c.fillStyle='#1a1f1a';c.fill();ENF.tinta(c,T,3);for(let k=0;k<4;k++){c.beginPath();c.arc(x-19*u+k*12.6*u,y-7*u,4*u,0,TAU);c.fillStyle='#2e352e';c.fill()}
  c.beginPath();c.rect(x-20*u,y-52*u,40*u,38*u);c.fillStyle=cor;c.fill();ENF.tinta(c,T,3);c.beginPath();c.rect(x-10*u,y-42*u,20*u,12*u);c.fillStyle='#071209';c.fill();c.fillStyle='#7dffa0';c.fillRect(x-7*u,y-38*u,6*u,3*u);c.fillRect(x+2*u,y-38*u,4*u,3*u);
  c.beginPath();c.rect(x-16*u,y-80*u,32*u,24*u);c.fillStyle=cor;c.fill();ENF.tinta(c,T,3);for(const s of[-1,1]){c.beginPath();c.arc(x+s*7*u,y-68*u,5*u,0,TAU);c.fillStyle='#071209';c.fill();ENF.tinta(c,T,1.8);c.beginPath();c.arc(x+s*7*u,y-68*u,2*u,0,TAU);c.fillStyle='#7dffa0';c.fill()}
  c.beginPath();c.moveTo(x,y-80*u);c.lineTo(x+4*u,y-98*u);ENF.tinta(c,T,2.5);c.beginPath();c.arc(x+4*u,y-100*u,4*u,0,TAU);c.fillStyle='#ffcf5a';c.fill();glow(c,x+4*u,y-100*u,18*u,'#ffcf5a',.6);
  for(const s of[-1,1]){c.beginPath();c.moveTo(x+s*20*u,y-46*u);c.quadraticCurveTo(x+s*34*u,y-40*u,x+s*30*u,y-26*u);ENF.tinta(c,T,5*u)}}
function engrenagem(c,cx,cy,R,n,T,cor,giro){c.beginPath();for(let k=0;k<n*2;k++){const a=giro+k/(n*2)*TAU,rr=k%2?R:R*1.18,a2=a+TAU/(n*4);c.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr);c.lineTo(cx+Math.cos(a2)*rr,cy+Math.sin(a2)*rr)}c.closePath();c.fillStyle=cor;c.fill();ENF.tinta(c,T,2.5);
  c.beginPath();c.arc(cx,cy,R*.32,0,TAU);c.fillStyle=T.fundo;c.fill();ENF.tinta(c,T,2)}
function engrenagens(c,r,x,y,u,T){const cor=mix(T.pedra.base,'#8a7a4a',.35);engrenagem(c,x-20*u,y-40*u,34*u,10,T,cor,r()*2);engrenagem(c,x+34*u,y-24*u,22*u,7,T,mix(cor,'#000',.2),r()*2);engrenagem(c,x+18*u,y-76*u,16*u,6,T,cor,r()*2)}
function antena(c,r,x,y,u,T){const h=(380+r()*120)*u,w=70*u;c.strokeStyle=T.tinta;c.lineWidth=5*u;c.beginPath();c.moveTo(x-w/2,y);c.lineTo(x,y-h);c.lineTo(x+w/2,y);c.stroke();
  c.lineWidth=2.5*u;c.beginPath();for(let k=1;k<9;k++){const f=k/9,hy=y-h*f,hw=w/2*(1-f);c.moveTo(x-hw,hy);c.lineTo(x+hw,hy);if(k<8){const f2=(k+1)/9;c.moveTo(x-hw,hy);c.lineTo(x+w/2*(1-f2),y-h*f2)}}c.stroke();
  c.beginPath();c.ellipse(x+26*u,y-h*.7,26*u,34*u,-.5,-1.2,1.9);c.fillStyle=ENF.corpo(T);c.fill();ENF.tinta(c,T,3);
  const piscando='#ff5a4a';c.beginPath();c.arc(x,y-h-6*u,6*u,0,TAU);c.fillStyle=piscando;c.fill();glow(c,x,y-h-6*u,50*u,piscando,.5);
  for(let k=0;k<3;k++){c.beginPath();c.arc(x,y-h-6*u,(22+k*16)*u,-Math.PI*.8,-Math.PI*.2);c.strokeStyle=rgba('#ffcf5a',.35-k*.09);c.lineWidth=2;c.stroke()}}
function disquetes(c,r,x,y,u,T){let yy=y;const cores=['#2a3a5a','#5a2a2a','#2a4a2a','#3a3a3a'];for(let k=0;k<4;k++){const s=34*u,dx=(r()-.5)*14*u;c.save();c.translate(x+dx,yy-3*u);c.rotate((r()-.5)*.3);c.beginPath();c.rect(-s/2,-5*u,s,5*u);c.fillStyle=cores[k%cores.length];c.fill();ENF.tinta(c,T,1.6);c.restore();yy-=5*u}
  const s=38*u;c.beginPath();c.rect(x+30*u-s/2,y-s,s,s);c.fillStyle='#2a3a5a';c.fill();ENF.tinta(c,T,2.5);c.beginPath();c.rect(x+30*u-s*.3,y-s,s*.6,s*.32);c.fillStyle='#9aa0b0';c.fill();c.beginPath();c.rect(x+30*u-s*.36,y-s*.5,s*.72,s*.46);c.fillStyle='#e8e0cf';c.fill();ENF.tinta(c,T,1.4)}
function fios(c,r,x,y,L,u,T){for(let k=0;k<3;k++){const dx=(k-1)*30*u,len=L*(.5+r()*.5);c.beginPath();c.moveTo(x+dx,y-4);c.bezierCurveTo(x+dx+(r()-.5)*40*u,y+len*.3,x+dx+(r()-.5)*60*u,y+len*.7,x+dx+(r()-.5)*30*u,y+len);c.strokeStyle=T.tinta;c.lineWidth=4*u;c.stroke();
    if(k===1){c.beginPath();c.arc(x+dx,y+len+10*u,8*u,0,TAU);c.fillStyle='#ffe8a8';c.fill();ENF.tinta(c,T,1.6);glow(c,x+dx,y+len+10*u,60*u,'#ffd27a',.45)}}}
/* a teia vira rede: nós acesos nos cruzamentos */
function rede(c,r,x,y,R,u,T){web(c,x,y,R,9,Math.PI*.1,Math.PI*1.9,rgba('#cfd2be',.18),1.4);for(let k=0;k<9;k++){const a=Math.PI*.1+k/8*Math.PI*1.8,rr=R*(.35+r()*.6);const px=x+Math.cos(a)*rr,py=y+Math.sin(a)*rr;c.beginPath();c.arc(px,py,4*u,0,TAU);c.fillStyle=r()<.6?'#7dffa0':'#ffcf5a';c.fill();glow(c,px,py,20*u,'#7dffa0',.4)}}

/* ===== Sobre: o fim do mapa ===== */
function banco(c,r,x,y,u,T){c.fillStyle=ENF.corpo(T);c.beginPath();c.rect(x-70*u,y-34*u,140*u,10*u);c.fill();ENF.tinta(c,T,3);c.beginPath();c.rect(x-66*u,y-70*u,132*u,8*u);c.fill();ENF.tinta(c,T,3);
  for(const s of[-1,1]){c.beginPath();c.moveTo(x+s*58*u,y-24*u);c.lineTo(x+s*62*u,y);c.moveTo(x+s*60*u,y-62*u);c.lineTo(x+s*58*u,y-34*u);ENF.tinta(c,T,6*u)}}
function caixaCorreio(c,r,x,y,u,T){c.beginPath();c.moveTo(x,y);c.lineTo(x,y-64*u);ENF.tinta(c,T,8*u);c.beginPath();c.moveTo(x-24*u,y-64*u);c.lineTo(x-24*u,y-92*u);c.quadraticCurveTo(x,y-112*u,x+24*u,y-92*u);c.lineTo(x+24*u,y-64*u);c.closePath();
  c.fillStyle='#3a4a7a';c.fill();ENF.tinta(c,T,3);c.beginPath();c.moveTo(x+24*u,y-84*u);c.lineTo(x+30*u,y-84*u);c.lineTo(x+30*u,y-110*u);c.lineTo(x+46*u,y-104*u);c.lineTo(x+30*u,y-98*u);c.fillStyle='#e05a4a';c.fill();ENF.tinta(c,T,2);
  c.beginPath();c.rect(x-12*u,y-86*u,22*u,14*u);c.fillStyle='#ece6d8';c.fill();ENF.tinta(c,T,1.6);c.beginPath();c.moveTo(x-12*u,y-86*u);c.lineTo(x-1*u,y-78*u);c.lineTo(x+10*u,y-86*u);ENF.tinta(c,T,1.4)}
function placaSetas(c,r,x,y,u,T){c.beginPath();c.moveTo(x,y);c.lineTo(x,y-130*u);ENF.tinta(c,T,8*u);c.beginPath();c.moveTo(x,y);c.lineTo(x,y-130*u);c.strokeStyle=ENF.corpo(T);c.lineWidth=5*u;c.stroke();
  for(let k=0;k<3;k++){const s=k%2?-1:1,py=y-118*u+k*28*u,w=(66+r()*20)*u;c.beginPath();c.moveTo(x,py-10*u);c.lineTo(x+s*w,py-10*u);c.lineTo(x+s*(w+14*u),py);c.lineTo(x+s*w,py+10*u);c.lineTo(x,py+10*u);c.closePath();c.fillStyle=mix(T.pedra.base,'#6b5038',.4);c.fill();ENF.tinta(c,T,2.5);
    c.beginPath();c.moveTo(x+s*10*u,py);c.lineTo(x+s*(w-12*u),py);c.strokeStyle=rgba(T.aro,.55);c.lineWidth=2;c.setLineDash([5,4]);c.stroke();c.setLineDash([])}}
