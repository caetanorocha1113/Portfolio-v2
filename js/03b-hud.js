/* ---------- HUD: o tinteiro do Atlas (o mesmo traço da abertura: js/00-tinta.js) ----------
   À esquerda, um tinteiro de vidro: a luz líquida (energia das magias) sobe e balança dentro dele,
   uma pena mergulhada balança devagar e a etiqueta mostra o número da área.
   Do tinteiro sai um traço de pena; em cima dele ficam as gotas de vida, embaixo os fragmentos de luz
   e as páginas do Atlas achadas. Atrás de tudo, uma mancha de tinta escura dá contraste.
   Um canvas só (#hudTinta), redesenhado umas 12 vezes por segundo: as linhas "fervem" como na abertura.
   O resto do motor só muda o estado: hudRegiao(i), hudLuz(v) e hudGame() (js/07-interface.js). */
const HUDT={cv:document.getElementById('hudTinta'),c:null,W:420,H:138,D:1,esc:1,reg:-1,nome:'',luz:1,luzV:1,hp:5,max:5,hpAntes:5,frags:0,fragsV:0,pag:[0,0],
  sub:0,dano:[],cura:[],t:0,ult:0,cliques:[],respingo:0,bolhas:[],fonte:'serif',cache:null,modo:''};
const hudCalmo=matchMedia('(prefers-reduced-motion: reduce)').matches;
const HC={osso:'#ece6d8',luz:'#fff8e6',ouro:'#f1d79c',tinta:'#0b0a10',borda:'#1d1611',vermelho:'#ff8a7a'};
const TQ={cx:58,base:126,gotaX:122,gotaY:80,passo:28};
function hudMedidas(){const h=HUDT;if(!h.cv)return;h.D=Math.min(window.devicePixelRatio||1,2);h.esc=innerWidth<=760?.78:1;
  h.cv.style.width=Math.round(h.W*h.esc)+'px';h.cv.style.height=Math.round(h.H*h.esc)+'px';h.cv.width=Math.round(h.W*h.esc*h.D);h.cv.height=Math.round(h.H*h.esc*h.D);
  h.c=h.cv.getContext('2d');h.fonte=(getComputedStyle(document.documentElement).getPropertyValue('--display')||'serif').trim()||'serif';h.cache=null}

/* ---------- formas fixas (calculadas uma vez) ---------- */
function hudFormas(){const{bez,junta}=TINTA,cx=TQ.cx,b=TQ.base;
  /* o vidro: ombros largos, fundo achatado, gargalo curto com a borda virada */
  const corpo=junta(bez([cx-11,b-70],[cx-12,b-62],[cx-34,b-60],[cx-36,b-42],10),bez([cx-36,b-42],[cx-38,b-22],[cx-36,b-6],[cx-24,b-1],10),bez([cx-24,b-1],[cx-8,b+1],[cx+8,b+1],[cx+24,b-1],8),
    bez([cx+24,b-1],[cx+36,b-6],[cx+38,b-22],[cx+36,b-42],10),bez([cx+36,b-42],[cx+34,b-60],[cx+12,b-62],[cx+11,b-70],10));
  const borda=junta(bez([cx+11,b-70],[cx+16,b-72],[cx+17,b-77],[cx+12,b-79],6),bez([cx+12,b-79],[cx+4,b-81],[cx-4,b-81],[cx-12,b-79],6),bez([cx-12,b-79],[cx-17,b-77],[cx-16,b-72],[cx-11,b-70],6));
  const vidro=new Path2D();corpo.forEach(([x,y],i)=>i?vidro.lineTo(x,y):vidro.moveTo(x,y));borda.slice(1).forEach(([x,y])=>vidro.lineTo(x,y));vidro.closePath();
  /* o traço de pena que sai do tinteiro e segura as gotas */
  const fim=TQ.gotaX+(Math.max(5,HUDT.max)-1)*TQ.passo+26,y=TQ.gotaY+14;
  const pena=junta(bez([cx+30,b-30],[cx+46,b-26],[cx+48,y+12],[cx+60,y+2],12),bez([cx+60,y+2],[cx+80,y-6],[fim-60,y+5],[fim,y],18),bez([fim,y],[fim+12,y-3],[fim+16,y+6],[fim+7,y+10],8));
  /* a mancha de tinta atrás (um contorno irregular, sorteado sempre igual) */
  const r=rng(77),mancha=[];for(let k=0;k<26;k++){const a=k/26*Math.PI*2,rx=k<13?(fim+40)/2:(fim+30)/2,ry=56;mancha.push([(fim+30)/2-4+Math.cos(a)*rx*(.92+r()*.14),72+Math.sin(a)*ry*(.86+r()*.2)])}
  return{vidro,corpo:{p:corpo,w:3.4,sd:3,aberto:true},borda:{p:borda,w:3,sd:4,aberto:true},pena:{p:pena,w:3.2,sd:5},fim,mancha:TINTA.chaikin(TINTA.chaikin(mancha,true),true),
    brilho:{p:bez([cx-27,b-50],[cx-31,b-40],[cx-31,b-26],[cx-26,b-16],12),w:2.6,sd:6},maxFeito:HUDT.max}}

/* a pena mergulhada: haste e plumas, balançando em volta da boca do tinteiro */
function hudPena(c,t,ferv){const cx=TQ.cx,b=TQ.base,ang=.72+(hudCalmo?0:Math.sin(t*1.25)*.05+Math.sin(t*.53)*.03);
  c.save();c.translate(cx+2,b-74);c.rotate(ang);const L=66;
  /* plumas dos dois lados (a de cima mais larga) */
  c.beginPath();c.moveTo(0,-8);c.bezierCurveTo(-12,-L*.4,-11,-L*.82,0,-L);c.bezierCurveTo(7,-L*.78,9,-L*.4,2,-12);c.closePath();
  c.fillStyle=HC.osso;c.fill();c.lineWidth=2;c.strokeStyle=HC.tinta;c.lineJoin='round';c.stroke();
  c.beginPath();for(let k=0;k<11;k++){const u=.14+k*.075,y=-L*u;c.moveTo(.6,y);c.lineTo(-9*Math.sin(Math.PI*u)-2,y+5+(k%3));c.moveTo(.8,y-1);c.lineTo(6*Math.sin(Math.PI*u)+1,y+4)}
  c.strokeStyle='rgba(40,32,26,.55)';c.lineWidth=1;c.stroke();
  for(const[a,y]of[[-1,-L*.36],[1,-L*.58]]){c.beginPath();c.moveTo(0,y);c.lineTo(a*10,y+3);c.lineTo(a*7,y+8);c.closePath();c.fillStyle='rgba(11,10,16,.85)';c.fill()}
  TINTA.traco(c,{p:[[1,8],[0.6,-L*.4],[0,-L*.98]],w:2.4,sd:8},1,1,HC.tinta,ferv,hudCalmo);
  c.restore()}

/* uma gota de vida: cheia (osso, com brilho), vazia (tracejada) e o instante do dano ou da cura */
function hudGota(c,x,y,cheia,dano,cura,t){const k=dano>0?dano:0,tre=k?Math.sin(t*70)*2.4*k:0,s=1+(cura>0?Math.sin(cura*Math.PI)*.25:0);
  c.save();c.translate(x+tre,y);c.scale(s,s);
  const forma=()=>{c.beginPath();c.moveTo(0,-15);c.bezierCurveTo(2,-9,9.5,-4,9.5,3);c.arc(0,3,9.5,0,Math.PI);c.bezierCurveTo(-9.5,-4,-2,-9,0,-15);c.closePath()};
  if(cheia){forma();c.fillStyle=k?`rgb(255,${Math.round(230-120*k)},${Math.round(215-140*k)})`:HC.osso;c.shadowColor='rgba(255,244,214,.55)';c.shadowBlur=7;c.fill();c.shadowBlur=0;
    c.lineWidth=2.2;c.strokeStyle=HC.tinta;c.lineJoin='round';c.stroke();
    c.beginPath();c.arc(-3,2,4.2,Math.PI*.95,Math.PI*1.55);c.strokeStyle='#fffdf6';c.lineWidth=2;c.lineCap='round';c.stroke();
    c.beginPath();c.arc(2.5,5,4.5,Math.PI*.05,Math.PI*.7);c.strokeStyle='rgba(120,104,84,.5)';c.lineWidth=1.6;c.stroke()}
  else{forma();c.fillStyle='rgba(11,10,16,.75)';c.fill();c.setLineDash([3,2.4]);c.lineWidth=1.4;c.strokeStyle='rgba(236,230,216,.7)';c.stroke();c.setLineDash([]);
    if(k>0){/* a gota acabou de se partir: dois pedaços caem */const q=1-k;c.fillStyle=`rgba(255,180,160,${k})`;for(const sd of[-1,1]){c.beginPath();c.ellipse(sd*(4+q*10),q*q*26,4.5,6,sd*.6,0,Math.PI*2);c.fill()}}}
  c.restore()}

/* ícones pequenos: fragmento de luz e livro aberto */
function hudFragmento(c,x,y,t){c.save();c.translate(x,y);c.rotate(hudCalmo?0:Math.sin(t*1.7)*.12);c.beginPath();c.moveTo(0,-9);c.lineTo(6,-2);c.lineTo(2.4,9);c.lineTo(-5.4,1);c.closePath();
  c.fillStyle='#fffaf0';c.shadowColor='rgba(255,244,214,.9)';c.shadowBlur=9;c.fill();c.shadowBlur=0;c.lineWidth=1.6;c.strokeStyle=HC.tinta;c.stroke();
  c.beginPath();c.moveTo(0,-9);c.lineTo(.6,1);c.lineTo(2.4,9);c.moveTo(.6,1);c.lineTo(-5.4,1);c.moveTo(.6,1);c.lineTo(6,-2);c.strokeStyle='rgba(120,104,84,.6)';c.lineWidth=1;c.stroke();c.restore()}
function hudLivro(c,x,y){c.save();c.translate(x,y);c.beginPath();c.moveTo(0,-6);c.quadraticCurveTo(-6,-9,-12,-6.5);c.lineTo(-12,7);c.quadraticCurveTo(-6,4.5,0,7);c.quadraticCurveTo(6,4.5,12,7);c.lineTo(12,-6.5);c.quadraticCurveTo(6,-9,0,-6);c.closePath();
  c.fillStyle=HC.osso;c.fill();c.strokeStyle=HC.tinta;c.lineWidth=1.6;c.lineJoin='round';c.stroke();c.beginPath();c.moveTo(0,-6);c.lineTo(0,7);c.stroke();
  c.beginPath();for(const s of[-1,1])for(let q=0;q<3;q++){c.moveTo(s*3,-2.5+q*3);c.lineTo(s*9,-3+q*3)}c.strokeStyle='rgba(60,50,40,.5)';c.lineWidth=1;c.stroke();c.restore()}
/* texto com contorno de tinta (lê bem em cima de qualquer fundo) */
function hudTexto(c,txt,x,y,tam,cor,peso){c.font=`${peso||600} ${tam}px ${HUDT.fonte}`;c.textBaseline='alphabetic';c.lineJoin='round';c.lineWidth=4;c.strokeStyle='rgba(8,7,12,.92)';c.strokeText(txt,x,y);c.fillStyle=cor||HC.osso;c.fillText(txt,x,y);return c.measureText(txt).width}

function hudDesenhar(dt){const h=HUDT;if(!h.cv)return;if(!h.c)hudMedidas();h.t+=dt;
  h.luzV+=(h.luz-h.luzV)*Math.min(1,dt*3);if(h.sub<1)h.sub=Math.min(1,h.sub+dt/.9);h.respingo=Math.max(0,h.respingo-dt);
  for(let k=0;k<h.max;k++){if(h.dano[k]>0)h.dano[k]=Math.max(0,h.dano[k]-dt/.7);if(h.cura[k]>0)h.cura[k]=Math.max(0,h.cura[k]-dt/.5)}
  h.fragsV+=(h.frags-h.fragsV)*Math.min(1,dt*8);if(Math.abs(h.frags-h.fragsV)<.5)h.fragsV=h.frags;
  const L=Math.max(0,Math.min(1,h.luzV));
  if(!hudCalmo&&L>.05&&Math.random()<dt*3)h.bolhas.push({x:TQ.cx+(Math.random()-.5)*44,y:TQ.base-6,v:12+Math.random()*16,r:1+Math.random()*1.6});
  for(let k=h.bolhas.length-1;k>=0;k--){const o=h.bolhas[k];o.y-=o.v*dt;o.x+=Math.sin(h.t*3+k)*4*dt;if(o.y<TQ.base-8-56*L)h.bolhas.splice(k,1)}
  const agora=performance.now();if(agora-h.ult<(hudCalmo?250:80))return;h.ult=agora;
  const ferv=hudCalmo?0:Math.floor(h.t*8),c=h.c,D=h.D*h.esc,jogo=MODE==='play',tr=(T,p,a,cor)=>TINTA.traco(c,T,p,a,cor,ferv,hudCalmo);
  if(!h.cache||h.cache.maxFeito!==h.max||h.modo!==(jogo?'j':'p')){h.cache=hudFormas();h.modo=jogo?'j':'p';h.sub=hudCalmo?1:0}
  const F=h.cache,cx=TQ.cx,b=TQ.base;
  c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,h.cv.width,h.cv.height);c.setTransform(D,0,0,D,0,0);
  /* mancha de tinta atrás */
  c.save();c.beginPath();F.mancha.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.restore();
  c.save();c.filter='blur(10px)';c.fillStyle='rgba(5,4,8,.62)';c.fill();c.restore();
  /* o vidro: escuro, a luz líquida dentro e as bolhas */
  c.fillStyle='rgba(12,11,18,.94)';c.fill(F.vidro);
  if(L>.01){c.save();c.clip(F.vidro);const nivel=b-4-60*L,onda=[];for(let x=cx-40;x<=cx+40;x+=3)onda.push([x,nivel+(L<.99&&!hudCalmo?Math.sin(x*.17+h.t*2.4)*2+Math.sin(x*.29-h.t*1.5)*1:0)]);
    const g=c.createLinearGradient(0,nivel-4,0,b);g.addColorStop(0,HC.luz);g.addColorStop(.45,HC.ouro);g.addColorStop(1,'#a87c3c');c.fillStyle=g;c.beginPath();c.moveTo(cx-42,b+4);onda.forEach(([x,y])=>c.lineTo(x,y));c.lineTo(cx+42,b+4);c.closePath();c.fill();
    c.fillStyle='rgba(255,252,240,.85)';for(const o of h.bolhas){c.beginPath();c.arc(o.x,o.y,o.r,0,Math.PI*2);c.fill()}
    if(L<.99)tr({p:onda,w:1.6,sd:21,aberto:true},1,.8,'#fffaf0');c.restore();
    if(jogo&&L>.32){c.save();c.globalCompositeOperation='lighter';const pul=.5+.5*Math.sin(h.t*3),g2=c.createRadialGradient(cx,b-34,0,cx,b-34,58);g2.addColorStop(0,`rgba(255,236,190,${.14+.1*pul})`);g2.addColorStop(1,'rgba(255,236,190,0)');c.fillStyle=g2;c.beginPath();c.arc(cx,b-34,58,0,Math.PI*2);c.fill();c.restore()}}
  /* a pena entra por trás da borda; o vidro, o brilho e a borda vêm por cima */
  hudPena(c,h.t,ferv);
  tr(F.corpo,1,1,HC.osso);tr(F.borda,1,1,HC.osso);tr(F.brilho,1,.6,'#fffdf6');
  /* etiqueta de papel com o número da área */
  if(h.reg>=0){c.save();c.translate(cx,b-28);c.rotate(-.04);c.beginPath();c.moveTo(-15,-9);c.lineTo(15,-10);c.lineTo(16,9);c.lineTo(-15,10);c.closePath();c.fillStyle='rgba(236,230,216,.92)';c.fill();c.lineWidth=1.6;c.strokeStyle=HC.tinta;c.stroke();
    c.font=`700 12px ${h.fonte}`;c.textAlign='center';c.textBaseline='middle';c.fillStyle=HC.tinta;c.fillText(roman[h.reg]||'',0,1);c.restore();c.textAlign='left'}
  if(h.respingo>0){const q=1-h.respingo;c.fillStyle=`rgba(241,215,156,${h.respingo})`;for(let k=0;k<7;k++){const a=-Math.PI/2+(k-3)*.35;c.beginPath();c.arc(cx+Math.cos(a)*(14+q*40),b-80+Math.sin(a)*(10+q*34)+q*q*30,2.4,0,Math.PI*2);c.fill()}}
  /* nome da área */
  const nome=h.reg>=0?(REGS[h.reg]?REGS[h.reg].nome:h.nome):'';
  if(jogo){try{c.letterSpacing='2.5px'}catch(e){}hudTexto(c,nome.toUpperCase(),TQ.gotaX-6,36,12.5,'rgba(236,230,216,.92)');try{c.letterSpacing='0px'}catch(e){}}
  else{try{c.letterSpacing='2px'}catch(e){}const w=hudTexto(c,nome,112,72,19,HC.osso);try{c.letterSpacing='0px'}catch(e){}
    tr({p:TINTA.bez([110,84],[110+w*.3,79],[110+w*.7,89],[112+w,82],16),w:2.2,sd:31},h.sub,.85,HC.osso)}
  if(!jogo){c.globalAlpha=1;return}
  /* traço de pena com as gotas de vida em cima */
  tr(F.pena,h.sub,1,HC.osso);
  for(let k=0;k<h.max;k++){const x=TQ.gotaX+k*TQ.passo,a=Math.min(1,Math.max(0,h.sub*1.6-k*.12));if(a<=0)continue;c.globalAlpha=a;hudGota(c,x,TQ.gotaY,k<h.hp,h.dano[k]||0,h.cura[k]||0,h.t);c.globalAlpha=1}
  /* fragmentos de luz e páginas do Atlas, embaixo do traço */
  const y2=TQ.gotaY+42;let x=TQ.gotaX-2;hudFragmento(c,x,y2-5,h.t);const w1=hudTexto(c,String(Math.round(h.fragsV)),x+12,y2,16);
  if(h.pag[1]){x+=w1+36;hudLivro(c,x,y2-5);hudTexto(c,h.pag[0]+'/'+h.pag[1],x+17,y2,16)}
  c.globalAlpha=1}
/* chamadas do resto do motor */
function hudRegiao(i){const h=HUDT;if(i===h.reg)return;h.reg=i;h.nome=REGS[i]?REGS[i].nome:'';h.sub=hudCalmo?1:0}
function hudLuz(v){HUDT.luz=Math.max(0,Math.min(1,v))}
function hudVida(hp,max){const h=HUDT;if(hp<h.hpAntes)for(let k=hp;k<h.hpAntes;k++)h.dano[k]=1;else if(hp>h.hpAntes)for(let k=h.hpAntes;k<hp;k++)h.cura[k]=1;h.hpAntes=hp;h.hp=hp;if(max!==h.max){h.max=max;h.cache=null}}
addEventListener('resize',()=>{HUDT.c=null});
/* easter egg: sete toques no tinteiro */
if(HUDT.cv)HUDT.cv.addEventListener('pointerdown',e=>{const r=HUDT.cv.getBoundingClientRect(),s=HUDT.esc||1,x=(e.clientX-r.left)/s,y=(e.clientY-r.top)/s;if(Math.hypot(x-TQ.cx,y-(TQ.base-40))>48)return;
  const t=performance.now();HUDT.cliques=HUDT.cliques.filter(q=>t-q<2500);HUDT.cliques.push(t);HUDT.respingo=.6;
  if(HUDT.cliques.length>=7){HUDT.cliques=[];HUDT.respingo=1;if(typeof toast==='function')toast('A tinta respinga, mas o tinteiro não derrama.');if(typeof ganharOvo==='function')ganharOvo('medalhao')}});
