/* ---------- HUD desenhado a tinta (o mesmo traço da abertura: js/00-tinta.js) ----------
   Medalhão com a luz líquida dentro, nome da área com um floreio que se desenha quando a área muda,
   páginas de vida desenhadas à mão (modo Jogo), fragmentos de luz e páginas do Atlas achadas.
   Tudo num canvas só (#hudTinta), redesenhado umas 12 vezes por segundo: as linhas "fervem" como na abertura.
   O resto do motor só muda o estado: hudRegiao(i), hudLuz(v) e hudGame() (js/07-interface.js). */
const HUDT={cv:document.getElementById('hudTinta'),c:null,W:400,H:112,D:1,reg:-1,nome:'',luz:1,luzV:1,hp:5,max:5,hpAntes:5,frags:0,pag:[0,0],
  sub:0,dano:[],t:0,ult:0,ferv:0,giro:0,cliques:[],tr:null,sublinhado:null,fonte:'serif'};
const hudCalmo=matchMedia('(prefers-reduced-motion: reduce)').matches;
const HC={tinta:'#e8e0cf',escuro:'#0b0a10',ouro:'#f2d49b',borda:'#1d1611'};
function hudMedidas(){const h=HUDT;if(!h.cv)return;h.D=Math.min(window.devicePixelRatio||1,2);const pequeno=innerWidth<=760;h.esc=pequeno?.8:1;
  h.cv.style.width=Math.round(h.W*h.esc)+'px';h.cv.style.height=Math.round(h.H*h.esc)+'px';h.cv.width=Math.round(h.W*h.esc*h.D);h.cv.height=Math.round(h.H*h.esc*h.D);
  h.c=h.cv.getContext('2d');h.fonte=(getComputedStyle(document.documentElement).getPropertyValue('--display')||'serif').trim()||'serif';h.tr=null;h.sublinhado=null}
/* traços fixos do medalhão (pontos em px do HUD) */
function hudTracos(){const{bez,arco}=TINTA,cx=58,cy=56,T=[];
  T.push({p:arco(cx,cy,40,-1.95,-1.95+Math.PI*2.06,72),w:3.4,sd:1});
  T.push({p:arco(cx,cy,33.5,0,Math.PI*2,64),w:1.1,sd:2,aberto:true,a:.5});
  for(const s of[-1,1]){const X=v=>cx+s*v;
    T.push({p:bez([X(38),cy+6],[X(54),cy+2],[X(62),cy-18],[X(52),cy-32],18).concat(bez([X(52),cy-32],[X(46),cy-40],[X(40),cy-30],[X(46),cy-25],8).slice(1)),w:2.6,sd:3+s});
    T.push({p:bez([X(36),cy+14],[X(48),cy+22],[X(50),cy+34],[X(44),cy+42],12),w:2,sd:5+s});
    T.push({p:bez([X(46),cy-6],[X(54),cy-10],[X(57),cy-6],[X(56),cy],8),w:1.6,sd:7+s})}
  return T}
function hudSublinhado(x0,x1,y){const{bez}=TINTA,mid=(x0+x1)/2;return[{p:bez([x0,y],[x0+(mid-x0)*.35,y-4],[x0+(mid-x0)*.7,y+4],[mid-9,y],16),w:1.8,sd:11},{p:bez([x1,y],[x1-(x1-mid)*.35,y-4],[x1-(x1-mid)*.7,y+4],[mid+9,y],16),w:1.8,sd:12}]}
/* uma página de vida: folha rasgada com o canto dobrado */
function hudPagina(c,x,y,cheia,dano,t){const k=dano>0?dano:0,tre=k?Math.sin(t*60)*2*k:0,a=cheia?1:.55;c.save();c.translate(x+tre,y);c.rotate(((Math.round(x)%2)?-.06:.05)+(cheia?0:-.16));
  const P=[[-8,-11],[3,-11.5],[9,-6],[8.6,10],[6,11.6],[3.6,10],[1,11.8],[-1.6,10],[-4,11.8],[-6.6,10.2],[-9,11.5]];
  c.beginPath();P.forEach(([px,py],i)=>i?c.lineTo(px,py):c.moveTo(px,py));c.closePath();
  if(cheia){c.fillStyle=k?`rgba(255,${200-120*k},${180-140*k},1)`:'#ece6d8';c.fill();c.lineWidth=1.5;c.strokeStyle=HC.escuro;c.lineJoin='round';c.stroke();
    c.beginPath();c.moveTo(3,-11.5);c.lineTo(3.4,-6.2);c.lineTo(9,-6);c.closePath();c.fillStyle='#c9bfa9';c.fill();c.stroke();
    c.beginPath();for(let q=0;q<3;q++){c.moveTo(-5,-3+q*4.4);c.lineTo(q===2?2:5,-3+q*4.4)}c.strokeStyle='rgba(60,50,40,.55)';c.lineWidth=1;c.stroke()}
  else{c.globalAlpha=a;c.setLineDash([2.2,2]);c.lineWidth=1.1;c.strokeStyle=HC.tinta;c.stroke();c.setLineDash([]);c.globalAlpha=1}
  c.restore()}
function hudDesenhar(dt){const h=HUDT;if(!h.cv)return;if(!h.c)hudMedidas();h.t+=dt;
  h.luzV+=(h.luz-h.luzV)*Math.min(1,dt*3);if(h.sub<1)h.sub=Math.min(1,h.sub+dt/.9);h.giro=Math.max(0,h.giro-dt);
  for(let k=0;k<h.dano.length;k++)if(h.dano[k]>0)h.dano[k]=Math.max(0,h.dano[k]-dt/.6);
  const agora=performance.now();if(agora-h.ult<(hudCalmo?250:80))return;h.ult=agora;const ferv=hudCalmo?0:Math.floor(h.t*8);
  const c=h.c,D=h.D*h.esc,jogo=MODE==='play';c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,h.cv.width,h.cv.height);c.setTransform(D,0,0,D,0,0);
  const tr=TINTA.traco,cx=58,cy=56;if(!h.tr)h.tr=hudTracos();
  /* medalhão: escuro por dentro, luz líquida com a superfície em onda */
  c.save();if(h.giro>0){c.translate(cx,cy);c.rotate((1-h.giro)*Math.PI*2*(1-(1-h.giro)*.0));c.translate(-cx,-cy)}
  c.globalAlpha=1;c.fillStyle='rgba(6,5,10,.55)';c.beginPath();c.arc(cx,cy,44,0,Math.PI*2);c.fill();
  c.beginPath();c.arc(cx,cy,31.5,0,Math.PI*2);c.fillStyle=HC.escuro;c.fill();
  const L=Math.max(0,Math.min(1,h.luzV)),nivel=cy+31.5-63*L;
  if(L>.01){c.save();c.beginPath();c.arc(cx,cy,31,0,Math.PI*2);c.clip();const onda=[];for(let x=cx-34;x<=cx+34;x+=3)onda.push([x,nivel+(L<.99?Math.sin(x*.16+h.t*2.2)*2.2+Math.sin(x*.31-h.t*1.4)*1.1:0)]);
    const g=c.createLinearGradient(0,nivel-4,0,cy+32);g.addColorStop(0,'#fff8e6');g.addColorStop(.45,'#f1d79c');g.addColorStop(1,'#b48a46');c.fillStyle=g;c.beginPath();c.moveTo(cx-34,cy+40);onda.forEach(([x,y])=>c.lineTo(x,y));c.lineTo(cx+34,cy+40);c.closePath();c.fill();
    if(L<.99)tr(c,{p:onda,w:1.6,sd:21,aberto:true},1,.75,'#fffaf0',ferv,hudCalmo);c.restore()}
  /* a rosa dos ventos gravada no vidro */
  c.globalAlpha=.5;c.strokeStyle=HC.borda;c.lineWidth=1.2;c.beginPath();c.moveTo(cx,cy-22);c.lineTo(cx+3.4,cy-3.4);c.lineTo(cx+22,cy);c.lineTo(cx+3.4,cy+3.4);c.lineTo(cx,cy+22);c.lineTo(cx-3.4,cy+3.4);c.lineTo(cx-22,cy);c.lineTo(cx-3.4,cy-3.4);c.closePath();c.stroke();c.globalAlpha=1;
  for(const T of h.tr)tr(c,T,1,T.a||1,HC.tinta,ferv,hudCalmo);
  for(const s of[-1,1]){c.beginPath();c.moveTo(cx,cy+s*48);c.lineTo(cx+4,cy+s*41);c.lineTo(cx,cy+s*43.5);c.lineTo(cx-4,cy+s*41);c.closePath();c.fillStyle=HC.tinta;c.fill()}
  if(L>.32&&jogo){const pulso=.5+.5*Math.sin(h.t*3);c.globalCompositeOperation='lighter';const g2=c.createRadialGradient(cx,cy,0,cx,cy,46);g2.addColorStop(0,`rgba(255,236,190,${.12+.1*pulso})`);g2.addColorStop(1,'rgba(255,236,190,0)');c.fillStyle=g2;c.beginPath();c.arc(cx,cy,46,0,Math.PI*2);c.fill();c.globalCompositeOperation='source-over'}
  c.restore();
  /* nome da área e o floreio embaixo */
  const tx=124,nome=h.reg>=0?roman[h.reg]+' · '+h.nome:'';c.font=`600 17px ${h.fonte}`;try{c.letterSpacing='2px'}catch(e){}c.textBaseline='alphabetic';c.textAlign='left';
  const tw=Math.max(120,c.measureText(nome).width);c.shadowColor='rgba(0,0,0,.9)';c.shadowBlur=6;c.fillStyle='#ece6d8';c.globalAlpha=1;c.fillText(nome,tx,34);c.shadowBlur=0;try{c.letterSpacing='0px'}catch(e){}
  if(!h.sublinhado||h.sublinhado.tw!==tw){h.sublinhado=hudSublinhado(tx,tx+tw,45);h.sublinhado.tw=tw}
  for(const T of h.sublinhado)tr(c,T,h.sub,.8,HC.tinta,ferv,hudCalmo);
  if(h.sub>.6){const m=tx+tw/2,a=Math.min(1,(h.sub-.6)/.4);c.globalAlpha=a;c.beginPath();c.moveTo(m,40.5);c.lineTo(m+4.5,45);c.lineTo(m,49.5);c.lineTo(m-4.5,45);c.closePath();c.fillStyle=HC.tinta;c.fill();c.globalAlpha=1}
  /* modo Jogo: vida, fragmentos e páginas do Atlas */
  if(jogo){let x=tx+10;for(let k=0;k<h.max;k++){hudPagina(c,x,70,k<h.hp,h.dano[k]||0,h.t);x+=24}
    x+=10;c.beginPath();c.moveTo(x,64);c.lineTo(x+5.5,70.5);c.lineTo(x+1,80);c.lineTo(x-4.5,71);c.closePath();c.fillStyle='#fffaf0';c.shadowColor='rgba(255,244,214,.8)';c.shadowBlur=8;c.fill();c.shadowBlur=0;c.lineWidth=1.1;c.strokeStyle=HC.escuro;c.stroke();
    c.font=`600 15px ${h.fonte}`;c.fillStyle='#ece6d8';c.shadowColor='rgba(0,0,0,.9)';c.shadowBlur=5;c.fillText(String(h.frags),x+11,77);let w2=c.measureText(String(h.frags)).width;c.shadowBlur=0;
    if(h.pag[1]){x+=40+w2;c.save();c.translate(x,71);c.beginPath();c.moveTo(0,-7);c.quadraticCurveTo(-6,-9,-11,-7);c.lineTo(-11,7);c.quadraticCurveTo(-6,5,0,7);c.quadraticCurveTo(6,5,11,7);c.lineTo(11,-7);c.quadraticCurveTo(6,-9,0,-7);c.closePath();
      c.fillStyle='#ece6d8';c.fill();c.strokeStyle=HC.escuro;c.lineWidth=1.2;c.stroke();c.beginPath();c.moveTo(0,-7);c.lineTo(0,7);c.stroke();c.restore();
      c.fillStyle='#ece6d8';c.shadowBlur=5;c.fillText(h.pag[0]+'/'+h.pag[1],x+16,77);c.shadowBlur=0}}
  c.globalAlpha=1}
/* chamadas do resto do motor */
function hudRegiao(i){const h=HUDT;if(i===h.reg)return;h.reg=i;h.nome=REGS[i]?REGS[i].nome:'';h.sub=hudCalmo?1:0;h.sublinhado=null}
function hudLuz(v){HUDT.luz=Math.max(0,Math.min(1,v))}
function hudVida(hp,max){const h=HUDT;if(hp<h.hpAntes)for(let k=hp;k<h.hpAntes;k++)h.dano[k]=1;h.hpAntes=hp;h.hp=hp;h.max=max}
addEventListener('resize',()=>{HUDT.c=null});
/* easter egg: sete toques no medalhão */
if(HUDT.cv)HUDT.cv.addEventListener('pointerdown',e=>{const r=HUDT.cv.getBoundingClientRect(),s=HUDT.esc||1,x=(e.clientX-r.left)/s,y=(e.clientY-r.top)/s;if(Math.hypot(x-58,y-56)>46)return;
  const t=performance.now();HUDT.cliques=HUDT.cliques.filter(q=>t-q<2500);HUDT.cliques.push(t);
  if(HUDT.cliques.length>=7){HUDT.cliques=[];HUDT.giro=1;if(typeof toast==='function')toast('O medalhão gira e a luz não derrama.');if(typeof ganharOvo==='function')ganharOvo('medalhao')}});
