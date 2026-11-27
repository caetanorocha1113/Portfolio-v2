/* ---------- cenário vivo: objetos que reagem ao viajante ----------
   Desenhados aqui a cada quadro (não no pintor), com as mesmas funções de tinta de js/02d-enfeites.js:
     planta    capim, samambaia, flores, cogumelos e velas se dobram quando alguém passa e balançam com o golpe
     pendulo   lanternas, estandartes, cipós, cabos, casulos e bolsas de esporo balançam no fio
     quebra    vasos, ânforas, caixotes, livros, cristais e caixas de metal quebram e soltam fragmentos de luz
     bando     borboletas que fogem quando o viajante chega perto
   Cada sala ganha alguns, sorteados pelo tema. O que quebrou fica quebrado até recarregar a página.
   Globais usados por js/04-jogo.js: atualizarVivos, desenharVivos, golpearVivos. */
const VIVO_TEMA={
  cinzaraiz:{chao:['capim','vaso','capim','vaso','borboletas'],teto:['lanterna']},
  cidadela:{chao:['anfora','capim','anfora','vaso'],teto:['lanterna','estandarte','lanterna']},
  minas:{chao:['cristal','caixaMinerio','cristal'],teto:['lanterna']},
  galerias:{chao:['livros','caixote','vaso','livros'],teto:['lanterna','lanterna']},
  sendas:{chao:['samambaia','capim','flores','borboletas'],teto:['cipo','cipo']},
  brejo:{chao:['cogumelos','capim','cogumelos'],teto:['bolsa','bolsa']},
  ninho:{chao:['caixaMetal','capim','caixaMetal'],teto:['cabo','casulo']},
  fosso:{chao:['flores','vela','borboletas'],teto:['tentaculo']}};
const VIVO_CLASSE={capim:'planta',samambaia:'planta',flores:'planta',cogumelos:'planta',vela:'planta',vaso:'quebra',anfora:'quebra',caixote:'quebra',livros:'quebra',cristal:'quebra',
  caixaMinerio:'quebra',caixaMetal:'quebra',lanterna:'pendulo',estandarte:'pendulo',cipo:'pendulo',bolsa:'pendulo',cabo:'pendulo',casulo:'pendulo',tentaculo:'pendulo',borboletas:'bando'};
const VIVO_MATERIAL={vaso:'barro',anfora:'barro',caixote:'madeira',livros:'papel',cristal:'cristal',caixaMinerio:'madeira',caixaMetal:'metal'};
const VIVO_VIDA={caixote:2,caixaMinerio:2,caixaMetal:2};
const COR_MATERIAL={barro:['#8a5a3c','#b07a52'],madeira:['#6a4a2a','#8c6840'],papel:['#d8cdb3','#efe6cf'],cristal:['#e070b4','#ffe0f2'],metal:['#4a5048','#7a8270']};
const CRISTAL_VIVO={d:'#7a2f69',m:'#e070b4',l:'#ffe0f2',g:'#ff9fd4'};
let VIVOS=null;const VIVOS_QUEBRADOS=new Set();

/* ---------- desenhos que só existem aqui ---------- */
function capimTinta(c,r,x,y,u,T){const cor=mix(T.grama,T.ponta,.45);for(let k=0;k<7;k++){const bx=x+(k-3)*7*u+(r()-.5)*4*u,h=(34+r()*34)*u,b=(r()-.5)*h*.6;
  c.beginPath();c.moveTo(bx-3*u,y+2);c.quadraticCurveTo(bx+b*.3-1*u,y-h*.6,bx+b,y-h);c.quadraticCurveTo(bx+b*.3+2*u,y-h*.6,bx+3*u,y+2);c.closePath();c.fillStyle=k%2?cor:mix(cor,T.pedra.light,.25);c.fill();ENF.tinta(c,T,1.6)}}
function vasoBarro(c,r,x,y,u,T){const h=(44+r()*16)*u,w=(20+r()*6)*u,cor=mix('#8a5a3c',T.pedra.base,.35);
  c.beginPath();c.moveTo(x-w*.5,y);c.quadraticCurveTo(x-w*1.15,y-h*.45,x-w*.55,y-h*.85);c.lineTo(x-w*.62,y-h);c.lineTo(x+w*.62,y-h);c.lineTo(x+w*.55,y-h*.85);c.quadraticCurveTo(x+w*1.15,y-h*.45,x+w*.5,y);c.closePath();ENF.solido(c,T,cor,2.8,'hachura',.4);
  c.beginPath();c.moveTo(x-w*.95,y-h*.42);c.quadraticCurveTo(x,y-h*.36,x+w*.95,y-h*.42);c.moveTo(x-w*.9,y-h*.52);c.quadraticCurveTo(x,y-h*.46,x+w*.9,y-h*.52);c.strokeStyle=rgba(T.tinta,.7);c.lineWidth=1.6;c.stroke();
  c.beginPath();for(let k=0;k<5;k++){const px=x-w*.7+k*w*.35;c.moveTo(px,y-h*.47);c.lineTo(px+w*.12,y-h*.5)}c.strokeStyle=rgba('#f0d8b0',.5);c.stroke();
  c.beginPath();c.moveTo(x-w*.4,y-h*.2);c.quadraticCurveTo(x-w*.7,y-h*.5,x-w*.35,y-h*.75);ENF.luzLinha(c,T,.35,1.6)}
function caixaMetal(c,r,x,y,u,T){const w=(54+r()*14)*u,h=(40+r()*14)*u,cor=mix('#3e4640',T.pedra.base,.3);c.beginPath();caixaTorta(c,x-w/2,y-h,w,h,r,2);ENF.solido(c,T,cor,3,'cruzado',.4);
  c.beginPath();caixaTorta(c,x-w/2-3*u,y-h-5*u,w+6*u,7*u,r,1);ENF.solido(c,T,mix(cor,'#000000',.2),2.2);
  c.beginPath();for(let k=0;k<4;k++){c.moveTo(x-w*.35,y-h*.75+k*5*u);c.lineTo(x+w*.05,y-h*.75+k*5*u)}c.strokeStyle=rgba(T.tinta,.8);c.lineWidth=1.6;c.stroke();
  for(let k=0;k<3;k++){const on=r()<.6,cx=x+w*.18+k*7*u,cy=y-h*.7;c.beginPath();c.arc(cx,cy,2.2*u,0,TAU);c.fillStyle=on?['#7dffa0','#ffd27a','#ff6a6a'][k]:'#1a1d18';c.fill();ENF.tinta(c,T,1)}
  for(const[px,py]of[[-.42,-.12],[.42,-.12],[-.42,-.86],[.42,-.86]]){c.beginPath();c.arc(x+px*w,y+py*h,1.6*u,0,TAU);c.fillStyle=T.pedra.light;c.fill()}}
function cipoTinta(c,r,x,y,L,u,T){const cor=mix('#1d5a44',T.grama,.3),folha=mix('#3f9a6a',T.ponta,.3);c.beginPath();c.moveTo(x,y);const ph=r()*10;
  for(let t=0;t<=L;t+=6){c.lineTo(x+Math.sin(t*.03+ph)*6*u,y+t)}ENF.duplo(c,T,cor,2.2*u);
  for(let t=10;t<L;t+=9*u+r()*7){const vx=x+Math.sin(t*.03+ph)*6*u,vy=y+t,s=(t|0)%2?1:-1;c.beginPath();c.ellipse(vx+s*5*u,vy,5*u,2.4*u,s*.6,0,TAU);c.fillStyle=folha;c.fill();ENF.tinta(c,T,1.2)}}
function bolsaUnica(c,r,x,y,L,u,T,cor){c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+4*u,y+L*.5,x,y+L);ENF.duplo(c,T,mix(cor,T.tinta,.5),1.8*u);
  c.beginPath();c.ellipse(x,y+L+12*u,9*u,14*u,0,0,TAU);ENF.solido(c,T,cor,2.4,'pontos',.35);c.beginPath();c.arc(x-3*u,y+L+7*u,3*u,0,TAU);c.fillStyle=rgba('#fff4dc',.7);c.fill()}

/* ---------- onde ficam ---------- */
function gerarVivos(){VIVOS=[];for(const s of WORLD.salas){if(s.tipo==='poco')continue;const tm=temaDe(s.tema),tab=VIVO_TEMA[tm];if(!tab)continue;const r=rng(s.id*7907+17),pint=s.vagas.map(v=>v.x);
  const livre=(x,d)=>pint.every(px=>Math.abs(px-x)>d),buraco=x=>s.buracosChao.some(([a,b])=>x>a-90&&x<b+90)||(s.abismo&&x>s.abismo[0]-70&&x<s.abismo[1]+70);
  for(let x=s.x+170+r()*200;x<s.x+s.w-170;x+=230+r()*280){if(buraco(x)||!livre(x,55))continue;const c=MUNDO.chaoEm(s,x),c1=MUNDO.chaoEm(s,x-26),c2=MUNDO.chaoEm(s,x+26);
    if(c!==c||!(Math.abs(c1-c2)<16))continue;VIVOS.push(novoVivo(tab.chao[(r()*tab.chao.length)|0],s,x,c,r))}
  if(!s.ceu&&tab.teto.length)for(let x=s.x+240+r()*300;x<s.x+s.w-240;x+=360+r()*420){const t=MUNDO.tetoEm(s,x),c=MUNDO.chaoEm(s,x);if(t!==t||t<s.y||c!==c||c-t<330||!livre(x,45))continue;
    VIVOS.push(novoVivo(tab.teto[(r()*tab.teto.length)|0],s,x,t,r,c))}}}
function novoVivo(tipo,s,x,y,r,chao){const id=s.id+':'+Math.round(x),cls=VIVO_CLASSE[tipo],v={id,tipo,cls,sala:s,x,y,seed:(r()*1e9)|0,u:.95+r()*.35,a:0,w:0,hp:VIVO_VIDA[tipo]||1,tremor:0,brilho:0,dentro:false,cacos:[],quebrado:VIVOS_QUEBRADOS.has(id)};
  /* o pé de quem fica pendurado fica entre 170 e 300 acima do chão: dá para alcançar com um pulo */
  if(cls==='pendulo'){const max=Math.max(70,(chao-y)-170-(tipo==='lanterna'?60:0));v.L=Math.max(70,Math.min(max-r()*130,tipo==='estandarte'?320:520))}
  if(cls==='bando'){v.bichos=[];for(let k=0;k<3+((r()*3)|0);k++)v.bichos.push({ox:(r()-.5)*90,oy:-(40+r()*80),ph:r()*9,x:0,y:0,vx:0,vy:0,a:1});v.fuga=0;v.volta=0}
  return v}

/* ---------- desenho (cada um vira uma figura guardada; as luzes são desenhadas por cima, vivas) ---------- */
const DESENHO_VIVO={
  capim:(c,r,x,y,u,T)=>capimTinta(c,r,x,y,u,T),
  samambaia:(c,r,x,y,u,T)=>samambaia(c,r,x,y,u*1.2,T),
  flores:(c,r,x,y,u,T,P,tm)=>flores(c,r,x,y,u*1.2,tm==='fosso'?{flower:P.lav,flower2:P.light}:P),
  cogumelos:(c,r,x,y,u,T,P)=>{const A={stem:P.stem,cap:'#a9521d',capLight:P.orangeL,gill:'#5a2a10',glow:P.orange},B={stem:'#7fb8ad',cap:'#1f7f74',capLight:P.tealL,gill:'#0d3b36',glow:P.teal};
    for(let q=0;q<3;q++)cogumeloTinta(c,r,x+(q-1)*26*u,y+4,(34+r()*36)*u,(30+r()*26)*u,r()<.5?A:B,T,(r()-.5)*.3,0)},
  vela:(c,r,x,y,u,T,P)=>vela(c,r,x,y,u,T,{amber:P.lav}),
  vaso:(c,r,x,y,u,T)=>vasoBarro(c,r,x,y,u,T),
  anfora:(c,r,x,y,u,T)=>anfora(c,r,x,y,u*1.15,T),
  caixote:(c,r,x,y,u,T)=>caixote(c,r,x,y,u,T),
  livros:(c,r,x,y,u,T)=>pilhaLivros(c,r,x,y,u*1.05,T),
  cristal:(c,r,x,y,u,T)=>cristaisTinta(c,r,x,y+6,(48+r()*26)*u,(r()-.5)*.4,CRISTAL_VIVO,T,4,0),
  caixaMinerio:(c,r,x,y,u,T)=>{caixote(c,r,x,y,u*.9,T);cristaisTinta(c,r,x,y-46*u,(26+r()*12)*u,0,CRISTAL_VIVO,T,3,0)},
  caixaMetal:(c,r,x,y,u,T)=>caixaMetal(c,r,x,y,u,T),
  lanterna:(c,r,x,y,u,T,P,tm,v)=>lanternaPendurada(c,r,x,y,v.L,T,corLuzVivo(tm,P),u*1.4),
  estandarte:(c,r,x,y,u,T,P,tm,v)=>estandarte(c,r,x,y,v.L,u*1.2,T,P.win||T.luz),
  cipo:(c,r,x,y,u,T,P,tm,v)=>{cipoTinta(c,r,x,y,v.L,u,T);cipoTinta(c,r,x+14*u,y,v.L*.7,u,T)},
  bolsa:(c,r,x,y,u,T,P,tm,v)=>bolsaUnica(c,r,x,y,v.L*.5,u*1.2,T,P.orange||T.luz),
  cabo:(c,r,x,y,u,T,P,tm,v)=>fios(c,r,x,y,v.L,u*1.1,T),
  casulo:(c,r,x,y,u,T,P,tm,v)=>casuloTinta(c,r,x,y,v.L*.6,u,T,P.cocoon||T.pedra.base),
  tentaculo:(c,r,x,y,u,T,P,tm,v)=>tendril(c,r,x,y,v.L,Math.PI/2+(r()-.5)*.3,10*u,'#16152c',rgba(P.lav||T.luz,.4))};
function corLuzVivo(tm,P){return{galerias:P.amber,minas:P.pink,cidadela:P.win,fosso:P.lav,cinzaraiz:P.warm}[tm]||'#ffd9a0'}
function spriteVivo(v){if(v.spr)return v.spr;const tm=temaDe(v.sala.tema),t=TEMA_IDS.indexOf(tm),P=REG[t].p,T=ROCHA_TEMA[tm],pend=v.cls==='pendulo';
  const W=pend?220:240,H=pend?v.L+170:230,ax=W/2,ay=pend?12:H-24,esc=clamp(ZOOM*FD,1,2),cv=novoCanvas(W*esc,H*esc),c=cv.getContext('2d');c.setTransform(esc,0,0,esc,0,0);
  const g0=glow;glow=()=>{};/* as luzes não entram na figura (giram e piscam por cima) */
  try{DESENHO_VIVO[v.tipo](c,rng(v.seed),ax,ay,v.u,T,P,tm,v)}catch(e){console.warn('vivo',v.tipo,e)}finally{glow=g0}
  return v.spr={cv,W,H,ax,ay,luz:corLuzVivo(tm,P),T,tm}}

/* ---------- movimento ---------- */
function caixaVivo(v){const u=v.u;if(v.cls==='pendulo'){const L=v.L+(v.tipo==='lanterna'?40*u:0),ex=v.x+Math.sin(v.a)*L,ey=v.y+Math.cos(v.a)*L;return{x:ex,y:ey-20,hw:24*u,hh:40*u}}
  const h=v.tipo==='livros'?44*u:v.tipo==='capim'?44*u:v.tipo==='cristal'?60*u:52*u;return{x:v.x,y:v.y-h/2,hw:30*u,hh:h/2}}
function atualizarVivos(dt){if(!VIVOS)gerarVivos();if(!dt)return;const jog=MODE==='play',px=jog?PL.x:L.x,py=jog?PL.y:L.y,vx=jog?PL.vx:(L.mv?L.face*230:0);
  for(const v of VIVOS){if(Math.abs(v.x-CAM.x)>VW*.9||Math.abs(v.y-CAM.y)>VH*1.3)continue;
    if(v.cls==='planta'){const dentro=Math.abs(px-v.x)<26*v.u+14&&py>v.y-40&&py<v.y+40,alvo=dentro?clamp(vx/320,-1,1)*.5:0;
      if(dentro&&!v.dentro&&Math.abs(vx)>40)somVivo('folhas',v.x,v.y,.5);v.dentro=dentro;v.w+=((alvo-v.a)*75-v.w*8)*dt;v.a+=v.w*dt}
    else if(v.cls==='pendulo'){const b=caixaVivo(v),perto=Math.abs(px-b.x)<b.hw+16&&Math.abs((py-42)-b.y)<b.hh+44;
      if(perto&&Math.abs(vx)>60){v.w+=vx*.03*dt/Math.max(.6,v.L/150);if(!v.dentro)somVivo(v.tipo==='lanterna'||v.tipo==='cabo'?'rangido':'pano',b.x,b.y,.45)}v.dentro=perto;
      const k=3.5+260/v.L;v.w+=(-k*Math.sin(v.a)-.55*v.w)*dt;v.a=clamp(v.a+v.w*dt,-1.2,1.2)}
    else if(v.cls==='quebra'){v.tremor=Math.max(0,v.tremor-dt*2.5);for(const k of v.cacos){if(k.parado)continue;k.vy+=(k.papel?240:1500)*dt;if(k.papel){k.vx*=Math.pow(.4,dt);k.vx+=Math.sin(T*3+k.ph)*60*dt}
        k.x+=k.vx*dt;k.y+=k.vy*dt;k.rot+=k.vr*dt;const g=MUNDO.chaoEm(v.sala,k.x);if(g===g&&k.y>=g-2&&k.vy>0){k.y=g-2;if(k.papel||Math.abs(k.vy)<120){k.parado=true;k.vy=0}else{k.vy*=-.3;k.vx*=.5;k.vr*=.5}}}}
    else if(v.cls==='bando'){const longe=Math.hypot(px-v.x,py-v.y);
      if(v.fuga<=0&&longe<160&&!v.sumiu){v.fuga=.01;somVivo('asas',v.x,v.y-60,.5);for(const b of v.bichos){b.x=v.x+b.ox;b.y=v.y+b.oy;b.vx=(Math.random()-.5)*240+(v.x-px)*.8;b.vy=-(140+Math.random()*120)}}
      if(v.fuga>0){v.fuga+=dt;for(const b of v.bichos){b.vy-=60*dt;b.vx+=Math.sin(T*4+b.ph)*80*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;b.a=clamp(1-(v.fuga-1.2)/1.6,0,1)}if(v.fuga>3){v.fuga=0;v.sumiu=true;v.volta=14}}
      else if(v.sumiu){v.volta-=dt;if(v.volta<=0&&longe>700)v.sumiu=false}}
    v.brilho=Math.max(0,v.brilho-dt*2)}}

/* ---------- golpe da espada ---------- */
function golpearVivos(box,d,f){if(!VIVOS)return false;let solido=false;
  for(const v of VIVOS){if(v.quebrado||Math.abs(v.x-box.x)>400||salaFechada(v.sala))continue;const b=caixaVivo(v);if(Math.abs(b.x-box.x)>b.hw+box.hw||Math.abs(b.y-box.y)>b.hh+box.hh)continue;
    if(v.cls==='planta'){v.w+=f*9;burst(v.x,v.y-26*v.u,mix(ROCHA_TEMA[temaDe(v.sala.tema)].ponta,'#ffffff',.2),8,170);somVivo('folhas',v.x,v.y,1)}
    else if(v.cls==='pendulo'){v.w+=(d===0?f:Math.sign(b.x-PL.x)||f)*2.4;v.brilho=1;somVivo(v.tipo==='lanterna'?'sino':v.tipo==='cabo'?'faisca':v.tipo==='bolsa'?'esporos':'pano',b.x,b.y,1);
      if(v.tipo==='cabo')burst(b.x,b.y,'#fff4a0',10,240);if(v.tipo==='bolsa')burst(b.x,b.y+20,'#ffc074',12,160)}
    else if(v.cls==='quebra'){solido=true;v.hp--;v.tremor=.35;const mat=VIVO_MATERIAL[v.tipo];
      if(v.hp>0){somVivo('bate_'+mat,v.x,v.y,1);burst(v.x,v.y-24,COR_MATERIAL[mat][1],5,120)}else quebrarVivo(v,f)}}
  return solido}
function quebrarVivo(v,f){const mat=VIVO_MATERIAL[v.tipo],cor=COR_MATERIAL[mat],n=mat==='papel'?10:7,u=v.u;v.quebrado=true;VIVOS_QUEBRADOS.add(v.id);somVivo('quebra_'+mat,v.x,v.y,1);
  for(let k=0;k<n;k++){const pts=[];const m=3+((Math.random()*3)|0),R=(mat==='papel'?9:6+Math.random()*9)*u;for(let q=0;q<m;q++){const a=q/m*TAU+Math.random()*.6;pts.push([Math.cos(a)*R*(.6+Math.random()*.5),Math.sin(a)*R*(mat==='papel'?.7:.6+Math.random()*.5)])}
    v.cacos.push({x:v.x+(Math.random()-.5)*30*u,y:v.y-(10+Math.random()*40)*u,vx:(Math.random()-.5)*280+f*120,vy:-(mat==='papel'?120:260)-Math.random()*240,rot:Math.random()*6,vr:(Math.random()-.5)*12,pts,cor:k%2?cor[0]:cor[1],papel:mat==='papel',ph:Math.random()*9})}
  burst(v.x,v.y-30,cor[1],12,220);if(MODE==='play')dropFrags(v.x,v.y-40,2+((Math.random()*3)|0));shake.t=Math.max(shake.t,.08);shake.a=3}

/* ---------- desenho a cada quadro ---------- */
function desenharVivos(Z,TX,TY){if(!VIVOS)return;const x0=CAM.x-VW*.75,x1=CAM.x+VW*.75,y0=CAM.y-VH*.9,y1=CAM.y+VH*.9;
  fc.save();fc.setTransform(Z,0,0,Z,TX,TY);fc.globalCompositeOperation='source-over';fc.globalAlpha=1;
  for(const v of VIVOS){if(v.x<x0-200||v.x>x1+200)continue;const pend=v.cls==='pendulo';if((pend?v.y+v.L:v.y)<y0||v.y-(pend?0:200)>y1)continue;if(salaFechada(v.sala))continue;
    if(v.cls==='bando'){desenharBando(v);continue}
    if(v.cls==='quebra'){for(const k of v.cacos)desenharCaco(k,v);if(v.quebrado)continue}
    const sp=spriteVivo(v);fc.save();fc.translate(v.x,v.y);
    if(v.cls==='planta')fc.transform(1,0,-v.a,1,0,0);
    else if(pend)fc.rotate(-v.a);
    else if(v.tremor>0)fc.translate(Math.sin(T*70)*v.tremor*6,0);
    fc.drawImage(sp.cv,-sp.ax,-sp.ay,sp.W,sp.H);fc.restore();
    /* a luz da lanterna e das bolsas: viva, acompanha o balanço e pisca no golpe */
    if(v.tipo==='lanterna'||v.tipo==='bolsa'){const Lz=v.tipo==='lanterna'?v.L+28*v.u*1.4-12*v.u*1.4:v.L*.5+14*v.u,gx=v.x+Math.sin(v.a)*Lz,gy=v.y+Math.cos(v.a)*Lz,fl=1+(v.brilho>0?Math.sin(T*50)*v.brilho*.6:0)+Math.sin(T*3+v.seed)*.05;
      dotAt(sp.luz,gx,gy,(v.tipo==='lanterna'?150:46)*v.u*fl,(v.tipo==='lanterna'?.26:.32)*fl);dotAt(sp.luz,gx,gy,(v.tipo==='lanterna'?28:12)*v.u,.75*fl)}}
  fc.restore()}
function desenharCaco(k,v){const RT=ROCHA_TEMA[temaDe(v.sala.tema)];fc.save();fc.translate(k.x,k.y);fc.rotate(k.rot);fc.globalAlpha=k.parado?.85:1;fc.beginPath();k.pts.forEach((p,i)=>i?fc.lineTo(p[0],p[1]):fc.moveTo(p[0],p[1]));fc.closePath();
  fc.fillStyle=k.cor;fc.fill();fc.strokeStyle=RT.tinta;fc.lineWidth=1.6;fc.stroke();if(k.papel){fc.beginPath();fc.moveTo(k.pts[0][0]*.5,0);fc.lineTo(-k.pts[0][0]*.4,0);fc.strokeStyle=rgba('#3a3020',.5);fc.lineWidth=1;fc.stroke()}fc.restore()}
function desenharBando(v){if(v.sumiu)return;const tm=temaDe(v.sala.tema),P=REG[TEMA_IDS.indexOf(tm)].p,RT=ROCHA_TEMA[tm],cor=tm==='fosso'?P.lav:P.flower||P.warm||RT.luz;
  for(const b of v.bichos){const x=v.fuga>0?b.x:v.x+b.ox+Math.sin(T*.9+b.ph)*14,y=v.fuga>0?b.y:v.y+b.oy+Math.sin(T*1.7+b.ph)*10,bat=Math.abs(Math.cos(T*(v.fuga>0?26:11)+b.ph)),s=6*v.u;
    if(b.a<=0&&v.fuga>0)continue;fc.globalAlpha=v.fuga>0?b.a:1;
    for(const sd of[-1,1]){fc.beginPath();fc.ellipse(x+sd*s*.7*bat,y-s*.2,s*bat+.5,s*.75,sd*.5,0,TAU);fc.fillStyle=cor;fc.fill();fc.strokeStyle=RT.tinta;fc.lineWidth=1.2;fc.stroke()}
    fc.beginPath();fc.moveTo(x,y-s*.7);fc.lineTo(x,y+s*.5);fc.strokeStyle=RT.tinta;fc.lineWidth=1.6;fc.stroke();dotAt(cor,x,y,s*3,.18)}
  fc.globalAlpha=1}
