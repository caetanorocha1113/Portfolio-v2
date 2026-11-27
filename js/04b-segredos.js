/* ---------- o portfólio dentro do jogo: segredos, placas das matérias e páginas das atividades ----------
   Segredos: cada ala termina numa parede falsa (WORLD.segredos, js/00a-mundo.js). Para o pintor a sala
   secreta é rocha até abrir, então a parede parece inteira; só umas trincas finas denunciam. Três golpes
   quebram a parede e a sala aparece, com uma relíquia (um easter egg) no meio.
   Placas: em cada matéria, uma placa de pedra no salão; ▲ (ou E) perto dela abre o resumo da área.
   Páginas: cada atividade vira uma página solta pelas salas da área; encostar pega, ▲ abre o detalhe.
   O que foi achado fica guardado no navegador (localStorage "atlas:achados"). */
const SEGREDOS=WORLD.segredos||[];
const ACH=(()=>{let a={};try{a=JSON.parse(localStorage.getItem('atlas:achados'))||{}}catch(e){}return{segredos:a.segredos||[],paginas:a.paginas||[],ovos:a.ovos||[]}})();
function guardarAchados(){try{localStorage.setItem('atlas:achados',JSON.stringify(ACH))}catch(e){}}
function todosPintores(){return[...new Set([PINTOR,PINTOR_F,...PINTORES].filter(Boolean))]}
for(const g of SEGREDOS){g.aberto=ACH.segredos.includes(g.chave);g.golpes=0;g.tremor=0}
{const ab=SEGREDOS.filter(g=>g.aberto).map(g=>g.sala);for(const id of ab)abrirSegredoPintura(id);if(ab.length)for(const w of todosPintores())w.postMessage({tipo:'segredos',abertos:ab})}
const FONTE_TITULO=()=>(getComputedStyle(document.documentElement).getPropertyValue('--display')||'serif').trim()||'serif';

/* ---------- paredes falsas ---------- */
/* trincas finas na parede (mais trincas a cada golpe), saindo do contorno da sala vizinha para dentro da rocha */
function trincasDe(g){if(g.trincas&&g.trincas.n===g.golpes)return g.trincas;const V=WORLD.salas[g.viz],C=contornoSala(V),r=rng(g.sala*977+g.golpes*13),idx=[];
  C.pts.forEach((p,k)=>{if(p[2]==='parede'&&Math.abs(p[0]-g.x)<90&&p[1]>g.parede.y0-20&&p[1]<g.parede.y1)idx.push(k)});
  const L=[],n=Math.min(idx.length,3+g.golpes*4);
  for(let q=0;q<n;q++){const k=idx[Math.floor(r()*idx.length)];if(k==null)break;let[x,y]=C.pts[k],nx=C.nx[k],ny=C.ny[k];const pts=[[x+nx*5,y+ny*5]],len=24+r()*(30+g.golpes*26);
    for(let d=0;d<len;d+=9){x+=nx*9+(r()-.5)*9;y+=ny*9+(r()-.5)*12;pts.push([x+nx*5,y+ny*5])}L.push(pts)}
  L.n=g.golpes;return g.trincas=L}
function desenharParedesFalsas(Z,W,H){
  for(const g of SEGREDOS){if(g.aberto)continue;const p=g.parede;if(p.x1<CAM.x-VW*.8||p.x0>CAM.x+VW*.8||p.y1<CAM.y-VH*.8||p.y0>CAM.y+VH*.8)continue;
    const V=WORLD.salas[g.viz],T=ROCHA_TEMA[temaDe(V.tema)],tr=g.tremor>0?(Math.random()-.5)*6*g.tremor/.25:0;
    mc.save();mc.setTransform(Z,0,0,Z,W/2-(CAM.x-tr)*Z,H/2-CAM.y*Z);mc.lineCap='round';mc.lineJoin='round';
    for(const L of trincasDe(g)){mc.strokeStyle=rgba(T.pedra.light,.32+g.golpes*.12);mc.lineWidth=1.6+g.golpes*.5;mc.beginPath();L.forEach(([x,y],k)=>k?mc.lineTo(x,y):mc.moveTo(x,y));mc.stroke()}
    mc.restore()}}
/* golpe do jogador: três golpes abrem a passagem */
function atacarParedes(box){for(const g of SEGREDOS){if(g.aberto)continue;const p=g.parede;
    if(box.x+box.hw<p.x0-40||box.x-box.hw>p.x1+40||box.y+box.hh<p.y0||box.y-box.hh>p.y1)continue;
    g.golpes++;g.tremor=.25;g.trincas=null;shake.t=.15;shake.a=4;sfx('acerto');burst(g.x,clamp(box.y,p.y0+40,p.y1-20),'#cfc6b4',9,230);
    if(g.golpes>=3)abrirSegredo(g);return true}
  return false}
function abrirSegredo(g){g.aberto=true;if(!ACH.segredos.includes(g.chave)){ACH.segredos.push(g.chave);guardarAchados()}
  abrirSegredoPintura(g.sala);for(const w of todosPintores())w.postMessage({tipo:'segredos',abertos:[g.sala]});
  const S=WORLD.salas[g.sala],V=WORLD.salas[g.viz];
  invalidarBlocos(Math.min(S.x,V.x)-500,Math.min(S.y,V.y)-500,Math.max(S.x+S.w,V.x+V.w)+500,Math.max(S.y+S.h,V.y+V.h)+500);caminhoMini.delete(S.id);caminhoMini.delete(V.id);
  const cy=(g.parede.y0+g.parede.y1)/2;for(let k=0;k<3;k++)burst(g.x,cy-60+k*60,k===1?'#e8e0cf':'#8a8276',14,380);
  hitstop=.12;shake.t=.45;shake.a=9;sfx('inimigo_morre');
  setTimeout(()=>toast('Uma passagem escondida se abriu.'),250)}

/* ---------- coisas do mundo: placas, páginas e relíquias ---------- */
const COISAS=[];
function chaoLivre(s,x){for(const d of[0,60,-60,120,-120,200,-200,300,-300]){const xx=clamp(x+d,s.x+90,s.x+s.w-90),c=MUNDO.chaoEm(s,xx);if(c===c)return xx}return s.x+s.w/2}
function lugaresPagina(salas){const L=[];
  for(const s of salas){if(s.tipo==='poco')continue;
    for(const p of s.plataformas)L.push({x:p.x,y:p.y-70,sala:s.id});
    if(s.tipo==='gruta'||s.tipo==='galeria'||s.tipo==='passagem'||s.tipo==='camara'){const x=chaoLivre(s,s.x+s.w*(.3+.4*((s.id*37)%10)/10));L.push({x,y:MUNDO.chaoEm(s,x)-70,sala:s.id})}}
  return L}
function montarCoisas(){COISAS.length=0;const areas=(window.CONTEUDO&&CONTEUDO.areas)||[];
  areas.forEach((a,j)=>{const i=j+1,g=WORLD.regioes[i];if(!g)return;
    const salas=g.salas.map(k=>WORLD.salas[k]).filter(s=>!s.secreta),H=WORLD.salas[g.principal],dir=g.dir||1;
    const px=chaoLivre(H,H.x+H.w/2-dir*H.w*.3);
    COISAS.push({tipo:'placa',reg:i,area:j,x:px,y:MUNDO.chaoEm(H,px),raio:130,tema:H.tema});
    const cands=lugaresPagina(salas).filter(c=>Math.hypot(c.x-px,c.y-H.y-H.h)>360),r=rng(4242+i*31),usados=[];
    a.atividades.forEach((atv,k)=>{let c=null;
      for(let tent=0;tent<30&&cands.length;tent++){const q=cands.splice(Math.floor(r()*cands.length),1)[0];if(usados.every(u=>Math.hypot(u.x-q.x,u.y-q.y)>300)){c=q;break}}
      if(!c){const x=chaoLivre(H,px+dir*(k+1)*190);c={x,y:MUNDO.chaoEm(H,x)-70}}
      usados.push(c);const id=a.id+'/'+atv.id;
      COISAS.push({tipo:'pagina',reg:i,area:j,areaId:a.id,atv:atv.id,titulo:atv.titulo||'Atividade',n:k,x:c.x,y:c.y,raio:62,achada:ACH.paginas.includes(id),voo:-1})})});
  /* a trajetória (se existir) também tem a sua placa */
  const iT=WORLD.regioes.findIndex(g=>g.id==='trajetoria');if(iT>0&&CONTEUDO.painelTrajetoria){const g=WORLD.regioes[iT],H=WORLD.salas[g.principal],dir=g.dir||1,px=chaoLivre(H,H.x+H.w/2-dir*H.w*.3);COISAS.push({tipo:'placa',reg:iT,trajetoria:true,x:px,y:MUNDO.chaoEm(H,px),raio:130,tema:H.tema})}
  for(const g of SEGREDOS){const S=WORLD.salas[g.sala],x=chaoLivre(S,S.x+S.w/2);COISAS.push({tipo:'reliquia',chave:g.chave,reg:S.regiao,x,y:MUNDO.chaoEm(S,x),raio:120,seg:g,tema:S.tema})}}
montarCoisas();
const totalPaginas=()=>COISAS.filter(o=>o.tipo==='pagina').length;
const paginasAchadas=()=>COISAS.filter(o=>o.tipo==='pagina'&&o.achada).length;

/* ---------- desenho (tinta, igual ao cenário) ---------- */
function desenharPlaca(c,o,perto){const T=ROCHA_TEMA[temaDe(o.tema)],x=o.x,y=o.y,lc=lcOf(o.reg);
  dotAt(lc,x,y-92,110,.16+.22*perto);
  c.beginPath();c.moveTo(x-50,y+4);c.lineTo(x-46,y-98);c.quadraticCurveTo(x-45,y-146,x,y-150);c.quadraticCurveTo(x+45,y-146,x+46,y-98);c.lineTo(x+50,y+4);c.closePath();
  c.fillStyle=mix(T.pedra.base,T.pedra.light,.18);c.fill();c.strokeStyle=T.tinta;c.lineWidth=4.5;c.lineJoin='round';c.stroke();
  c.beginPath();c.moveTo(x-36,y-96);c.quadraticCurveTo(x-35,y-134,x,y-137);c.quadraticCurveTo(x+35,y-134,x+36,y-96);c.lineTo(x+37,y-8);c.lineTo(x-37,y-8);c.closePath();c.strokeStyle=rgba(T.pedra.dark,.8);c.lineWidth=2;c.stroke();
  c.fillStyle=rgba(lc,.55+.4*perto);c.font=`600 30px ${FONTE_TITULO()}`;c.textAlign='center';c.textBaseline='middle';c.fillText(roman[o.reg],x,y-104);
  c.strokeStyle=rgba(T.tinta,.75);c.lineWidth=2;c.lineCap='round';
  for(let k=0;k<4;k++){const yy=y-72+k*15,w=26-(k===3?12:0);c.beginPath();c.moveTo(x-w,yy);c.quadraticCurveTo(x,yy+(k%2?2:-2),x+w,yy);c.stroke()}
  c.fillStyle=mix(T.pedra.dark,T.fundo,.4);c.beginPath();c.ellipse(x,y+5,62,10,0,0,TAU);c.fill();c.strokeStyle=T.tinta;c.lineWidth=3;c.stroke()}
function desenharPagina(c,o){let x=o.x,y=o.y+Math.sin(T*2.1+o.n*1.7)*8,a=Math.sin(T*1.3+o.n)*.16,al=1,esc=1;
  if(o.voo>=0){const v=o.voo/0.9;y-=v*120;al=1-v;esc=1+v*.4;a+=v*2}
  dotAt('#fff3d6',x,y,74*esc,.32*al);
  c.save();c.translate(x,y);c.rotate(a);c.scale(esc,esc);c.globalAlpha=al;
  c.beginPath();c.moveTo(-20,-28);c.quadraticCurveTo(0,-32,20,-27);c.lineTo(22,24);c.quadraticCurveTo(0,29,-21,25);c.closePath();
  c.fillStyle='#ece6d8';c.fill();c.strokeStyle='#1d1611';c.lineWidth=2.2;c.lineJoin='round';c.stroke();
  c.beginPath();c.moveTo(12,-28);c.lineTo(20,-19);c.lineTo(11,-19);c.closePath();c.fillStyle='#c9bfa9';c.fill();c.stroke();
  c.strokeStyle='rgba(29,22,17,.55)';c.lineWidth=1.4;c.lineCap='round';for(let k=0;k<4;k++){c.beginPath();c.moveTo(-13,-12+k*9);c.lineTo(k===3?4:13,-12+k*9+(k%2));c.stroke()}
  c.restore()}
function desenharReliquia(c,o,perto){const T=ROCHA_TEMA[temaDe(o.tema)],x=o.x,y=o.y,lc=lcOf(o.reg),k=o.chave,bob=Math.sin(T_rel()*2)*5;
  c.beginPath();c.moveTo(x-34,y+4);c.lineTo(x-28,y-58);c.lineTo(x-38,y-66);c.lineTo(x+38,y-66);c.lineTo(x+28,y-58);c.lineTo(x+34,y+4);c.closePath();
  c.fillStyle=mix(T.pedra.base,T.pedra.light,.12);c.fill();c.strokeStyle=T.tinta;c.lineWidth=4;c.lineJoin='round';c.stroke();
  const oy=y-100+bob;dotAt(lc,x,oy,90,.3+.3*perto);c.lineWidth=3;c.strokeStyle='#1d1611';c.fillStyle='#ece6d8';
  if(k==='vila'){c.beginPath();c.rect(x-22,oy-15,44,30);c.fill();c.stroke();c.beginPath();c.moveTo(x-22,oy-15);c.lineTo(x,oy+3);c.lineTo(x+22,oy-15);c.stroke()}
  else if(k==='humanas'){c.beginPath();c.moveTo(x-16,oy-24);c.lineTo(x+16,oy-24);c.lineTo(x,oy);c.lineTo(x+16,oy+24);c.lineTo(x-16,oy+24);c.lineTo(x,oy);c.closePath();c.fill();c.stroke();c.fillStyle=lc;c.beginPath();c.moveTo(x-8,oy+20);c.lineTo(x+8,oy+20);c.lineTo(x,oy+10);c.fill()}
  else if(k==='matematica'){c.font=`700 52px ${FONTE_TITULO()}`;c.textAlign='center';c.textBaseline='middle';c.lineWidth=5;c.strokeText('π',x,oy);c.fillText('π',x,oy)}
  else if(k==='linguagens'){c.beginPath();c.moveTo(x-10,oy+18);c.quadraticCurveTo(x+18,oy-2,x+22,oy-30);c.quadraticCurveTo(x+4,oy-16,x-10,oy+18);c.fill();c.stroke();c.fillStyle='#1d1611';c.beginPath();c.ellipse(x-12,oy+22,12,6,0,0,TAU);c.fill()}
  else if(k==='natureza'){c.strokeStyle='#1d5a44';c.beginPath();c.moveTo(x,oy+22);c.quadraticCurveTo(x-4,oy,x,oy-10);c.stroke();for(let q=0;q<6;q++){const a=q/6*TAU+T_rel();c.fillStyle=q%2?'#ffd1e8':'#fff3d6';c.beginPath();c.ellipse(x+Math.cos(a)*10,oy-16+Math.sin(a)*10,7,4,a,0,TAU);c.fill()}}
  else if(k==='trajetoria'){c.beginPath();c.rect(x-18,oy-22,36,44);c.fill();c.stroke();c.beginPath();c.moveTo(x-12,oy-22);c.lineTo(x-12,oy+22);c.stroke();c.strokeStyle='rgba(29,22,17,.5)';c.lineWidth=1.4;for(let q=0;q<4;q++){c.beginPath();c.moveTo(x-6,oy-12+q*8);c.lineTo(x+12,oy-12+q*8);c.stroke()}c.fillStyle=lc;c.fillRect(x+8,oy-26,5,14)}
  else if(k==='tecnico'){c.beginPath();c.rect(x-24,oy-20,48,36);c.fill();c.stroke();c.fillStyle='#0b1a10';c.fillRect(x-17,oy-13,34,22);c.fillStyle=(Math.floor(T_rel()*2)%2)?'#7dffa0':'#0b1a10';c.fillRect(x-12,oy+1,8,4);c.fillStyle='#ece6d8';c.beginPath();c.rect(x-8,oy+16,16,6);c.fill();c.stroke()}
  else{c.beginPath();for(let q=0;q<10;q++){const a=q/10*TAU-Math.PI/2,rr=q%2?9:22;q?c.lineTo(x+Math.cos(a)*rr,oy+Math.sin(a)*rr):c.moveTo(x+Math.cos(a)*rr,oy+Math.sin(a)*rr)}c.closePath();c.fill();c.stroke()}}
const T_rel=()=>T;
/* aviso "▲ Ler" escrito à mão em cima da coisa */
function desenharAviso(o,Z,TX,TY){const sx=(o.x*Z+TX)/FD,sy=((o.y-(o.tipo==='placa'?186:150))*Z+TY)/FD,txt=o.tipo==='placa'?'Ler a placa':'Examinar';
  fc.save();fc.setTransform(FD,0,0,FD,0,0);fc.globalAlpha=.94;fc.font=`600 15px ${FONTE_TITULO()}`;fc.textAlign='center';fc.textBaseline='middle';
  const w=fc.measureText('▲  '+txt).width+26;fc.fillStyle='rgba(6,5,10,.72)';fc.beginPath();fc.ellipse(sx,sy,w/2,17,0,0,TAU);fc.fill();
  fc.strokeStyle='rgba(232,224,207,.75)';fc.lineWidth=1.4;fc.beginPath();fc.moveTo(sx-w/2+8,sy+12);fc.quadraticCurveTo(sx,sy+16+Math.sin(T*3)*1.5,sx+w/2-8,sy+11);fc.stroke();
  fc.fillStyle='#ece6d8';fc.fillText('▲  '+txt,sx,sy);fc.restore()}
function desenharCoisas(Z,TX,TY){const jogo=MODE==='play',x0=CAM.x-VW*.75,x1=CAM.x+VW*.75,y0=CAM.y-VH*.8,y1=CAM.y+VH*.8;
  fc.save();fc.setTransform(Z,0,0,Z,TX,TY);fc.globalCompositeOperation='source-over';fc.globalAlpha=1;
  for(const o of COISAS){if(o.x<x0||o.x>x1||o.y<y0||o.y>y1)continue;
    if(o.tipo==='placa')desenharPlaca(fc,o,o===pertoCoisa?1:0);
    else if(!jogo)continue;
    else if(o.tipo==='pagina'){if(!o.achada||o.voo>=0)desenharPagina(fc,o)}
    else if(o.tipo==='reliquia'&&o.seg.aberto)desenharReliquia(fc,o,o===pertoCoisa?1:0)}
  fc.restore();
  if(jogo&&pertoCoisa)desenharAviso(pertoCoisa,Z,TX,TY)}

/* ---------- interação ---------- */
let pertoCoisa=null,upAntes=false,ultimoAchado=null,achadoAte=0,cimaAte=0;
/* um toque rápido em ▲ (tecla ou botão da tela) vale mesmo se soltar antes do próximo quadro */
addEventListener('keydown',e=>{if((e.code==='ArrowUp'||e.code==='KeyW')&&!e.repeat&&MODE==='play')cimaAte=performance.now()+220},true);
document.querySelectorAll('#pad [data-k="up"]').forEach(b=>b.addEventListener('pointerdown',()=>{cimaAte=performance.now()+220}));
function atualizarCoisas(dt){for(const g of SEGREDOS)g.tremor=Math.max(0,g.tremor-dt);
  for(const o of COISAS)if(o.voo>=0){o.voo+=dt;if(o.voo>.9)o.voo=-1}
  if(MODE!=='play'||PL.dead>0){pertoCoisa=null;upAntes=!!inp.up;return}
  pertoCoisa=null;let bd=1e9;
  for(const o of COISAS){if(Math.abs(o.x-PL.x)>400||Math.abs(o.y-PL.y)>400)continue;const d=Math.hypot(o.x-PL.x,(o.y-(o.tipo==='pagina'?0:40))-(PL.y-40));
    if(o.tipo==='pagina'){if(!o.achada&&d<o.raio)pegarPagina(o);continue}
    if(o.tipo==='reliquia'&&!o.seg.aberto)continue;
    if(d<o.raio&&d<bd){bd=d;pertoCoisa=o}}
  const up=!!inp.up,agora=performance.now();
  if(((up&&!upAntes)||agora<cimaAte)&&!paused){if(pertoCoisa&&(PL.on||Math.abs(PL.vy)<80)){cimaAte=0;interagir(pertoCoisa)}else if(ultimoAchado&&agora<achadoAte){cimaAte=0;lerAchado()}}
  upAntes=up}
addEventListener('keydown',e=>{if(e.code!=='KeyE'||e.repeat||MODE!=='play'||paused||typing(e)||detalheAberto())return;
  if(pertoCoisa){interagir(pertoCoisa);e.preventDefault()}else if(ultimoAchado&&performance.now()<achadoAte){lerAchado();e.preventDefault()}});
function interagir(o){if(o.tipo==='placa')abrirPainelArea(o.trajetoria?'trajetoria':o.area);else if(o.tipo==='reliquia')abrirOvo(o)}
function pegarPagina(o){o.achada=true;o.voo=0;const id=o.areaId+'/'+o.atv;if(!ACH.paginas.includes(id)){ACH.paginas.push(id);guardarAchados()}
  sfx('coleta');burst(o.x,o.y,'#fff3d6',16,220);mostrarAchado(o);hudGame()}
function mostrarAchado(o){const el=document.getElementById('achado');if(!el)return;ultimoAchado=o;achadoAte=performance.now()+7000;
  el.querySelector('.ac-n').textContent=`Página ${paginasAchadas()} de ${totalPaginas()} · ${roman[o.reg]} · ${REGS[o.reg].nome}`;
  el.querySelector('.ac-t').textContent=o.titulo;el.hidden=false;requestAnimationFrame(()=>el.classList.add('on'));
  clearTimeout(mostrarAchado.h);mostrarAchado.h=setTimeout(fecharAchado,7000)}
function fecharAchado(){const el=document.getElementById('achado');if(!el)return;el.classList.remove('on');setTimeout(()=>{if(!el.classList.contains('on'))el.hidden=true},450)}
function lerAchado(){const o=ultimoAchado;if(!o)return;fecharAchado();ultimoAchado=null;location.hash='#'+o.areaId+'/'+o.atv}
{const el=document.getElementById('achado');if(el){el.querySelector('.ac-ler').onclick=lerAchado;el.querySelector('.ac-x').onclick=fecharAchado}}

/* resumo da matéria dentro do jogo (o mesmo painel do Passeio) */
function abrirPainelArea(j){const m=document.getElementById('painelJogo');if(!m||!CONTEUDO.painelArea)return;const corpo=m.querySelector('.pj-corpo');corpo.textContent='';
  corpo.append(j==='trajetoria'?CONTEUDO.painelTrajetoria():CONTEUDO.painelArea(j));m.hidden=false;paused=true;sfx('coleta',.6);m.querySelector('.x').focus()}
{const m=document.getElementById('painelJogo');if(m){m.querySelector('.x').onclick=()=>closePanels();m.addEventListener('click',e=>{if(e.target===m)closePanels()})}}
/* o detalhe de uma atividade pausa o jogo enquanto está aberto */
new MutationObserver(()=>{const ab=document.documentElement.classList.contains('detalhe-aberto');if(MODE!=='play')return;
  if(ab)paused=true;else if([document.getElementById('painelJogo'),document.getElementById('ovoModal'),document.getElementById('powModal'),document.getElementById('guide'),document.getElementById('mPainel')].every(m=>!m||m.hidden))paused=false}).observe(document.documentElement,{attributes:true,attributeFilter:['class']});

/* ---------- easter eggs ---------- */
function ganharOvo(id,frags,x,y){if(ACH.ovos.includes(id))return false;ACH.ovos.push(id);guardarAchados();if(frags&&x!=null)dropFrags(x,y,frags);return true}
function curiosidade(k){const s=CONTEUDO.dados&&CONTEUDO.dados.segredos;const t=s&&s[k];return t?`<p class="ovo-nota">${String(t).replace(/[<>&]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;'})[c])}</p>`:''}
const OVOS={
  vila:{t:'Bilhete atrás da parede',h:()=>`<p>Preso na pedra, com letra apressada:</p><blockquote>Quem procura atrás das paredes encontra o que o mapa não mostra.</blockquote><p>Cada matéria esconde uma sala no fim da sua ala. Você já abriu <b>${ACH.segredos.length}</b> de <b>${SEGREDOS.length}</b>.</p>`+curiosidade('vila')},
  humanas:{t:'O arquivo das eras',h:()=>'<p>Uma linha do tempo rabiscada na parede, de um lado a outro da sala. No fim, alguém escreveu:</p><blockquote>Toda história começa com alguém perguntando por quê.</blockquote>'+curiosidade('humanas')},
  matematica:{t:'A câmara do π',h:()=>'<p class="ovo-pi" aria-label="Os primeiros dígitos de pi">3,14159 26535 89793 23846 26433 83279 50288 41971 69399 37510 58209 74944 59230 78164…</p><p>Os dígitos continuam para sempre, sem se repetir. Alguém começou a gravá-los na pedra e desistiu na septuagésima casa.</p>'+curiosidade('matematica')},
  linguagens:{t:'O gabinete das vozes',h:()=>'<p class="ovo-ola">Olá · Hello · Hola · Bonjour · Ciao · Hallo · Salve · Привет · こんにちは · 你好 · مرحبا · Γειά σου · שלום</p><p>A mesma palavra em treze vozes, sussurrada pelas paredes.</p>'+curiosidade('linguagens')},
  natureza:{t:'A estufa esquecida',h:()=>{florescer();return'<p>Uma flor guardada num pote de vidro. Você chega perto e a sala inteira floresce.</p>'+curiosidade('natureza')}},
  trajetoria:{t:'O diário de bordo',h:()=>'<p>Um caderno gasto, uma linha por dia. As primeiras falam de medo de errar; as do meio, de projetos que não davam certo até darem. A última diz só:</p><blockquote>Amanhã continua.</blockquote>'+curiosidade('trajetoria')},
  tecnico:{t:'O terminal esquecido',terminal:true,h:()=>'<p>Um terminal antigo, ainda ligado. O cursor pisca esperando alguém. (Digite <code>ajuda</code>.)</p>'+curiosidade('tecnico')}};
function abrirOvo(o){const m=document.getElementById('ovoModal');if(!m)return;const d=OVOS[o.chave]||{t:'Uma relíquia',h:()=>'<p>Um objeto antigo, guardado com cuidado.</p>'+curiosidade(o.chave)};
  m.querySelector('.ovo-t').textContent=d.t;m.querySelector('.ovo-corpo').innerHTML=d.h();const term=m.querySelector('.ovo-term');term.hidden=!d.terminal;if(d.terminal)iniciarTerminal(term);
  m.hidden=false;paused=true;sfx('coleta');if(ganharOvo('reliquia-'+o.chave,8,o.x,o.y-110))setTimeout(()=>toast('Relíquia encontrada.'),300);
  (d.terminal?term.querySelector('input'):m.querySelector('.x')).focus()}
{const m=document.getElementById('ovoModal');if(m){m.querySelector('.x').onclick=()=>closePanels();m.addEventListener('click',e=>{if(e.target===m)closePanels()})}}
/* estufa: pétalas por toda a sala */
function florescer(){const s=WORLD.salaEm(PL.x,PL.y-40);if(!s)return;for(let k=0;k<70;k++){const x=s.x+Math.random()*s.w,y=s.y+Math.random()*s.h*.8;setTimeout(()=>burst(x,y,Math.random()<.5?'#ffd1e8':'#fff3d6',3,60),k*25)}}
/* terminal de mentira do Técnico */
function iniciarTerminal(t){const out=t.querySelector('.term-saida'),inp2=t.querySelector('input');out.textContent='';
  const nome=(CONTEUDO.dados&&CONTEUDO.dados.perfil&&CONTEUDO.dados.perfil.nome)||'viajante';
  const diz=(txt,cls)=>{const p=document.createElement('div');if(cls)p.className=cls;p.textContent=txt;out.append(p);out.scrollTop=out.scrollHeight};
  diz('ATLAS-OS 1.0 — digite "ajuda"','term-dim');
  const CMD={ajuda:()=>'comandos: ls, cat leia-me.txt, whoami, segredos, data, ola, sudo, konami, limpar, sair',help:()=>CMD.ajuda(),
    ls:()=>'leia-me.txt   segredos/   atlas.exe   trilha.mid',dir:()=>CMD.ls(),
    'cat leia-me.txt':()=>'Este portfólio foi feito em HTML, CSS e JavaScript, sem bibliotecas.\nO cenário é pintado em código, o mapa é gerado e o jogo roda no navegador.',
    whoami:()=>nome,segredos:()=>SEGREDOS.map(g=>(g.aberto?'[x] ':'[ ] ')+g.chave).join('\n'),'ls segredos':()=>CMD.segredos(),
    data:()=>new Date().toLocaleString('pt-BR'),ola:()=>'Olá, mundo!','olá':()=>'Olá, mundo!',hello:()=>'Hello, world!',
    konami:()=>'↑ ↑ ↓ ↓ ← → ← → B A (fora do terminal)','./atlas.exe':()=>'O Atlas já está aberto. Você está dentro dele.',
    'atlas.exe':()=>'Tente ./atlas.exe',limpar:()=>{out.textContent='';return''},clear:()=>CMD.limpar(),sair:()=>{closePanels();return''},exit:()=>CMD.sair()};
  inp2.value='';inp2.onkeydown=e=>{e.stopPropagation();if(e.key==='Escape'){closePanels();return}if(e.key!=='Enter')return;const c=inp2.value.trim();inp2.value='';if(!c)return;diz('> '+c,'term-cmd');
    const k=c.toLowerCase();let r;if(k.startsWith('sudo'))r='Permissão negada. Boa tentativa.';else r=CMD[k]?CMD[k]():`comando não encontrado: ${c} (digite ajuda)`;if(r)diz(r)}}
/* ↑↑↓↓←→←→BA: modo papel antigo (tinta escura sobre papel) */
{const SEQ=['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','KeyB','KeyA'];let pos=0,digitado='';
  addEventListener('keydown',e=>{if(typing(e))return;pos=e.code===SEQ[pos]?pos+1:(e.code===SEQ[0]?1:0);
    if(pos===SEQ.length){pos=0;const on=document.documentElement.classList.toggle('modo-papel');toast(on?'Modo papel antigo. (De novo para voltar.)':'De volta à tinta clara.');ganharOvo('konami')}
    if(/^Key[A-Z]$/.test(e.code)&&MODE!=='play'){digitado=(digitado+e.code.slice(3).toLowerCase()).slice(-5);
      if(digitado==='atlas'){digitado='';const x=MODE==='play'?PL.x:L.x,y=MODE==='play'?PL.y:L.y;for(let k=0;k<5;k++)setTimeout(()=>burst(x+(Math.random()-.5)*160,y-120-Math.random()*80,'#fff3d6',10,240),k*120);toast('O Atlas lembra de você.');ganharOvo('atlas')}}},true)}
console.log('%cATLAS%c\nOlá, pessoa curiosa. Há salas escondidas no fim de cada ala: procure paredes com trincas e bata nelas.\nDigite segredos() aqui para ver o que você já achou.','font:700 28px serif;letter-spacing:.2em;color:#e8d3a2','color:#b4ad9f');
window.segredos=()=>{console.table(SEGREDOS.map(g=>({sala:g.chave,aberta:g.aberto})));return`${ACH.segredos.length} de ${SEGREDOS.length} salas secretas · ${paginasAchadas()} de ${totalPaginas()} páginas · ${ACH.ovos.length} curiosidades`};
