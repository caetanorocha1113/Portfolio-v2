/* ---------- HUD: o medidor de luz e as máscaras de vida ----------
   À esquerda, o medidor de luz (recursos/hud/alma.png): escurecido quando vazio, ele se enche de baixo para
   cima com a luz das magias, com uma onda na superfície e bolhas. Um anel de tinta (o mesmo traço da abertura,
   js/00-tinta.js) contorna o medidor, e dele sai um traço de pena que segura as máscaras de vida.
   As máscaras (recursos/hud/mascara/<estado>/1.png, 2.png…) quebram quando o viajante leva dano, se refazem
   na cura e, de vez em quando, um brilho passa por elas. Embaixo, os fragmentos de luz e as páginas achadas.
   Sem essas imagens, o medidor e as máscaras são desenhados a tinta (gotas de vida).
   Um canvas só (#hudTinta). O resto do motor só muda o estado: hudRegiao(i), hudLuz(v) e hudVida(hp,max);
   as imagens chegam por js/08-pasta-recursos.js (HUD_IMG). */
const HUD_IMG={alma:null,mascara:{}};
const HUDT={cv:document.getElementById('hudTinta'),c:null,W:420,H:138,D:1,esc:1,reg:-1,nome:'',luz:1,luzV:1,hp:5,max:5,hpAntes:5,frags:0,fragsV:0,pag:[0,0],
  sub:0,anim:[],brilho:{t:-1,prox:2.5},t:0,ult:0,cliques:[],respingo:0,bolhas:[],fonte:'serif',cache:null,modo:'',orbe:null,escMasc:0,refMasc:null};
const hudCalmo=matchMedia('(prefers-reduced-motion: reduce)').matches;
const HC={osso:'#ece6d8',luz:'#fff8e6',ouro:'#f1d79c',tinta:'#0b0a10',vermelho:'#ff8a7a'};
/* medidas (em pixels do HUD): centro e raio do medidor, primeira máscara, passo entre elas, altura da máscara e a linha dos contadores */
const HQ={ox:56,oy:60,or:43,mx:126,my:47,passo:34,alt:38,ly:107};
const TEMPO_MASC={quebrar:.5,cura:.32,brilho:.5};
function hudMedidas(){const h=HUDT;if(!h.cv)return;h.D=Math.min(window.devicePixelRatio||1,2);h.esc=innerWidth<=760?.78:1;
  h.cv.style.width=Math.round(h.W*h.esc)+'px';h.cv.style.height=Math.round(h.H*h.esc)+'px';h.cv.width=Math.round(h.W*h.esc*h.D);h.cv.height=Math.round(h.H*h.esc*h.D);
  h.c=h.cv.getContext('2d');h.fonte=(getComputedStyle(document.documentElement).getPropertyValue('--display')||'serif').trim()||'serif';h.cache=null;h.orbe=null}

/* ---------- formas fixas (calculadas de novo só quando o número de máscaras muda) ---------- */
function hudFormas(){const{bez,junta,arco,chaikin}=TINTA,ox=HQ.ox,oy=HQ.oy,R=HQ.or+5,n=Math.max(5,HUDT.max);
  /* o anel de tinta: uma volta inteira e um pouco mais, como um círculo feito à mão; e um arco fino por fora */
  const anel={p:arco(ox,oy,R,-1.95,-1.95+Math.PI*2+.42,64),w:3.2,sd:3};
  const arcoFino={p:arco(ox+1,oy+1,R+5,.25,1.9,22),w:1.6,sd:7};
  /* o traço de pena que sai do medidor e passa por baixo das máscaras */
  const fim=HQ.mx+(n-1)*HQ.passo+24,y=HQ.my+25;
  const pena=junta(bez([ox+R*.72,oy+R*.68],[ox+R+8,oy+R*.86],[ox+R+12,y+3],[HQ.mx-22,y],12),bez([HQ.mx-22,y],[HQ.mx+40,y-6],[fim-60,y+5],[fim,y],18),
    bez([fim,y],[fim+12,y-3],[fim+16,y+6],[fim+7,y+10],8));
  /* a mancha de tinta atrás (um contorno irregular, sorteado sempre igual) */
  const r=rng(77),mancha=[];for(let k=0;k<26;k++){const a=k/26*Math.PI*2,rx=k<13?(fim+40)/2:(fim+30)/2,ry=60;mancha.push([(fim+30)/2-4+Math.cos(a)*rx*(.92+r()*.14),72+Math.sin(a)*ry*(.86+r()*.2)])}
  return{anel,arcoFino,pena:{p:pena,w:3.2,sd:5},fim,mancha:chaikin(chaikin(mancha,true),true),maxFeito:HUDT.max}}

/* ---------- o medidor: a imagem do dono em duas versões (cheia e apagada), no tamanho em que é desenhada ---------- */
function hudOrbe(h){const im=HUD_IMG.alma;if(!im)return null;const D=h.D*h.esc;if(h.orbe&&h.orbe.im===im&&h.orbe.D===D)return h.orbe;
  let o=null;
  try{const w=im.width,hh=im.height,cv=document.createElement('canvas');cv.width=w;cv.height=hh;const x=cv.getContext('2d',{willReadFrequently:true});x.drawImage(im,0,0);
    const d=x.getImageData(0,0,w,hh).data;let l=w,r=-1,t=hh,b=-1;
    for(let y=0;y<hh;y++)for(let xx=0;xx<w;xx++)if(d[(y*w+xx)*4+3]>128){if(xx<l)l=xx;if(xx>r)r=xx;if(y<t)t=y;if(y>b)b=y}
    if(r<0)return null;
    const diam=Math.max(r-l+1,b-t+1),s=HQ.or*2/diam,W2=Math.max(1,Math.ceil(w*s*D)),H2=Math.max(1,Math.ceil(hh*s*D));
    const cheio=document.createElement('canvas');cheio.width=W2;cheio.height=H2;const xc=cheio.getContext('2d');xc.imageSmoothingQuality='high';xc.drawImage(im,0,0,W2,H2);
    /* apagado: a mesma imagem quase no escuro, um pouco azulada (os olhos continuam lá) */
    const vazio=document.createElement('canvas');vazio.width=W2;vazio.height=H2;const xv=vazio.getContext('2d');xv.drawImage(cheio,0,0);xv.globalCompositeOperation='source-atop';xv.fillStyle='rgba(9,11,22,.8)';xv.fillRect(0,0,W2,H2);
    o={im,D,dw:w*s,dh:hh*s,x0:HQ.ox-(l+r+1)/2*s,y0:HQ.oy-(t+b+1)/2*s,raio:diam*s/2,cheio,vazio}}catch(e){o=null}
  return h.orbe=o}

/* ---------- máscaras ---------- */
/* a escala das máscaras sai da altura do quadro de referência (cheia, ou o 1º do brilho, ou a vazia):
   todos os quadros usam a mesma escala, com a máscara no meio da imagem */
function hudRefMasc(h){const M=HUD_IMG.mascara,ref=(M.cheia||[])[0]||(M.brilho||[])[0]||(M.vazia||[])[0]||null;
  if(ref!==h.refMasc){h.refMasc=ref;h.escMasc=ref?HQ.alt/ref.height:0}return ref}
function hudQuadroMasc(h,k){const M=HUD_IMG.mascara,an=h.anim[k],cheia=k<h.hp;
  const de=(lista,u)=>lista&&lista.length?lista[Math.min(lista.length-1,Math.max(0,Math.floor(u*lista.length)))]:null;
  if(an&&an.t>=0){const q=de(M[an.tipo],an.t/an.dur);if(q)return q}
  /* antes de a animação começar (as máscaras de uma cura grande se refazem uma depois da outra), vale o estado de antes */
  const estado=an&&an.t<0?(an.tipo==='cura'?false:true):cheia;
  if(!estado)return(M.vazia||[])[0]||null;
  const g=h.brilho,B=M.brilho;
  if(g.t>=0&&B&&B.length>1){const u=(g.t-k*.08)/TEMPO_MASC.brilho;if(u>=0&&u<1)return de(B,u)}
  return(M.cheia||[])[0]||(B||[])[0]||null}

/* uma gota de vida desenhada (quando não há imagens de máscara): cheia, vazia e o instante do dano ou da cura */
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
  const jogo=MODE==='play';
  h.luzV+=(h.luz-h.luzV)*Math.min(1,dt*3);if(h.sub<1)h.sub=Math.min(1,h.sub+dt/.9);h.respingo=Math.max(0,h.respingo-dt);
  /* animações das máscaras (quebrar, cura) e o brilho que passa por elas de tempos em tempos */
  let animando=false;
  for(let k=0;k<h.anim.length;k++){const an=h.anim[k];if(!an)continue;an.t+=dt;if(an.t>=an.dur)h.anim[k]=null;else animando=true}
  const g=h.brilho;
  if(g.t>=0){g.t+=dt;animando=true;if(g.t>TEMPO_MASC.brilho+h.max*.08)g.t=-1}
  else if(jogo&&!hudCalmo&&h.hp>0){g.prox-=dt;if(g.prox<=0){g.t=0;g.prox=5+Math.random()*4}}
  h.fragsV+=(h.frags-h.fragsV)*Math.min(1,dt*8);if(Math.abs(h.frags-h.fragsV)<.5)h.fragsV=h.frags;
  const L=Math.max(0,Math.min(1,h.luzV)),ox=HQ.ox,oy=HQ.oy,R=HQ.or;
  if(!hudCalmo&&L>.05&&Math.random()<dt*3)h.bolhas.push({x:ox+(Math.random()-.5)*R*1.3,y:oy+R-4,v:12+Math.random()*16,r:1+Math.random()*1.6});
  for(let k=h.bolhas.length-1;k>=0;k--){const o=h.bolhas[k];o.y-=o.v*dt;o.x+=Math.sin(h.t*3+k)*4*dt;if(o.y<oy+R-2*R*L+4)h.bolhas.splice(k,1)}
  /* o desenho é refeito umas 12 vezes por segundo (25 durante as animações das máscaras): as linhas "fervem" como na abertura */
  const agora=performance.now();if(agora-h.ult<(hudCalmo?250:animando?40:80))return;h.ult=agora;
  const ferv=hudCalmo?0:Math.floor(h.t*8),c=h.c,D=h.D*h.esc,tr=(T,p,a,cor)=>TINTA.traco(c,T,p,a,cor,ferv,hudCalmo);
  if(!h.cache||h.cache.maxFeito!==h.max||h.modo!==(jogo?'j':'p')){h.cache=hudFormas();h.modo=jogo?'j':'p';h.sub=hudCalmo?1:0}
  const F=h.cache;
  c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,h.cv.width,h.cv.height);c.setTransform(D,0,0,D,0,0);
  /* mancha de tinta atrás */
  c.save();c.beginPath();F.mancha.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.filter='blur(10px)';c.fillStyle='rgba(5,4,8,.62)';c.fill();c.restore();
  /* o medidor de luz */
  const O=hudOrbe(h),nivel=oy+R-2*R*L,onda=[];
  for(let x=ox-R-6;x<=ox+R+6;x+=3)onda.push([x,nivel+(L<.99&&!hudCalmo?Math.sin(x*.17+h.t*2.4)*2+Math.sin(x*.29-h.t*1.5)*1:0)]);
  const liquido=()=>{c.beginPath();c.moveTo(ox-R-8,oy+R+8);onda.forEach(([x,y])=>c.lineTo(x,y));c.lineTo(ox+R+8,oy+R+8);c.closePath()};
  if(jogo&&L>.32){c.save();c.globalCompositeOperation='lighter';const pul=.5+.5*Math.sin(h.t*3),g2=c.createRadialGradient(ox,oy,0,ox,oy,R+24);g2.addColorStop(0,`rgba(255,240,215,${.12+.1*pul})`);g2.addColorStop(1,'rgba(255,240,215,0)');c.fillStyle=g2;c.beginPath();c.arc(ox,oy,R+24,0,Math.PI*2);c.fill();c.restore()}
  if(O){c.drawImage(O.vazio,O.x0,O.y0,O.dw,O.dh);
    if(L>.01){c.save();liquido();c.clip();c.drawImage(O.cheio,O.x0,O.y0,O.dw,O.dh);c.restore()}}
  else{/* sem a imagem: um vidro redondo com a luz líquida */
    c.beginPath();c.arc(ox,oy,R,0,Math.PI*2);c.fillStyle='rgba(12,11,18,.94)';c.fill();
    if(L>.01){c.save();c.beginPath();c.arc(ox,oy,R,0,Math.PI*2);c.clip();const gl=c.createLinearGradient(0,nivel-4,0,oy+R);gl.addColorStop(0,HC.luz);gl.addColorStop(.45,HC.ouro);gl.addColorStop(1,'#a87c3c');c.fillStyle=gl;liquido();c.fill();c.restore()}}
  if(L>.01){c.save();c.beginPath();c.arc(ox,oy,R-3,0,Math.PI*2);c.clip();
    /* bolhas: pontos claros na luz desenhada; na imagem do dono (clara), anéis finos e discretos */
    if(O){c.strokeStyle='rgba(150,140,178,.4)';c.lineWidth=.8;for(const o of h.bolhas){c.beginPath();c.arc(o.x,o.y,o.r+.6,0,Math.PI*2);c.stroke()}}
    else{c.fillStyle='rgba(255,252,240,.85)';for(const o of h.bolhas){c.beginPath();c.arc(o.x,o.y,o.r,0,Math.PI*2);c.fill()}}
    if(L<.99)tr({p:onda,w:1.6,sd:21,aberto:true},1,.75,'#fffaf0');c.restore()}
  tr(F.anel,1,1,HC.osso);tr(F.arcoFino,1,.55,HC.osso);
  if(h.respingo>0){const q=1-h.respingo;c.fillStyle=`rgba(255,246,226,${h.respingo})`;for(let k=0;k<7;k++){const a=-Math.PI/2+(k-3)*.35;c.beginPath();c.arc(ox+Math.cos(a)*(R*.6+q*40),oy-R*.5+Math.sin(a)*(10+q*34)+q*q*30,2.4,0,Math.PI*2);c.fill()}}
  /* nome da área */
  const nome=h.reg>=0?(REGS[h.reg]?REGS[h.reg].nome:h.nome):'';
  if(jogo){if(nome){try{c.letterSpacing='2.5px'}catch(e){}hudTexto(c,(roman[h.reg]?roman[h.reg]+' · ':'')+nome.toUpperCase(),HQ.mx-14,16,11.5,'rgba(236,230,216,.82)');try{c.letterSpacing='0px'}catch(e){}}}
  else{try{c.letterSpacing='2px'}catch(e){}const w=hudTexto(c,nome,ox+R+18,oy+8,19,HC.osso);try{c.letterSpacing='0px'}catch(e){}
    tr({p:TINTA.bez([ox+R+16,oy+20],[ox+R+16+w*.3,oy+15],[ox+R+16+w*.7,oy+25],[ox+R+18+w,oy+18],16),w:2.2,sd:31},h.sub,.85,HC.osso)}
  if(!jogo){c.globalAlpha=1;return}
  /* traço de pena e as máscaras de vida em cima dele */
  tr(F.pena,h.sub,1,HC.osso);
  const temImg=!!hudRefMasc(h);
  for(let k=0;k<h.max;k++){const x=HQ.mx+k*HQ.passo,a=Math.min(1,Math.max(0,h.sub*1.6-k*.12));if(a<=0)continue;c.globalAlpha=a;
    const q=temImg?hudQuadroMasc(h,k):null;
    if(q){const s=h.escMasc,w=q.width*s,hh=q.height*s;c.drawImage(q,x-w/2,HQ.my-hh/2,w,hh)}
    else{const an=h.anim[k],u=an&&an.t>=0?1-an.t/an.dur:0;hudGota(c,x,HQ.my+4,an&&an.t<0?an.tipo!=='cura':k<h.hp,an&&an.tipo==='quebrar'?u:0,an&&an.tipo==='cura'?u:0,h.t)}
    c.globalAlpha=1}
  /* fragmentos de luz e páginas do Atlas, embaixo do traço */
  const y2=HQ.ly;let x=HQ.mx-4;hudFragmento(c,x,y2-5,h.t);const w1=hudTexto(c,String(Math.round(h.fragsV)),x+12,y2,16);
  if(h.pag[1]){x+=w1+36;hudLivro(c,x,y2-5);hudTexto(c,h.pag[0]+'/'+h.pag[1],x+17,y2,16)}
  c.globalAlpha=1}
/* chamadas do resto do motor */
function hudRegiao(i){const h=HUDT;if(i===h.reg)return;h.reg=i;h.nome=REGS[i]?REGS[i].nome:'';h.sub=hudCalmo?1:0}
function hudLuz(v){HUDT.luz=Math.max(0,Math.min(1,v))}
/* dano: as máscaras perdidas quebram; cura: as recuperadas se refazem, uma depois da outra */
function hudVida(hp,max){const h=HUDT;
  if(hp<h.hpAntes)for(let k=hp;k<h.hpAntes;k++)h.anim[k]={tipo:'quebrar',t:-(k-hp)*.06,dur:TEMPO_MASC.quebrar};
  else if(hp>h.hpAntes)for(let k=h.hpAntes;k<hp;k++)h.anim[k]={tipo:'cura',t:-(k-h.hpAntes)*.09,dur:TEMPO_MASC.cura};
  h.hpAntes=hp;h.hp=hp;if(max!==h.max){h.max=max;h.cache=null}}
addEventListener('resize',()=>{HUDT.c=null});
/* easter egg: sete toques no medidor de luz */
if(HUDT.cv)HUDT.cv.addEventListener('pointerdown',e=>{const r=HUDT.cv.getBoundingClientRect(),s=HUDT.esc||1,x=(e.clientX-r.left)/s,y=(e.clientY-r.top)/s;if(Math.hypot(x-HQ.ox,y-HQ.oy)>HQ.or+6)return;
  const t=performance.now();HUDT.cliques=HUDT.cliques.filter(q=>t-q<2500);HUDT.cliques.push(t);HUDT.respingo=.6;
  if(HUDT.cliques.length>=7){HUDT.cliques=[];HUDT.respingo=1;if(typeof toast==='function')toast('A luz tremula, mas não se apaga.');if(typeof ganharOvo==='function')ganharOvo('medalhao')}});
