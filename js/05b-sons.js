/* ---------- sons do jogo: música que troca devagar (área, combate, sala secreta), sons em laço do personagem
   (passos, parede, queda) e as vozes das criaturas, sintetizadas aqui ou lidas da pasta recursos/sons/inimigos/ ----------
   Globais usados pelo resto: musicCross, faixaDesejada, musicaJogo, somLoop, pararLoops, sfxEm, vozInimigo, COMBATE. */

/* ---------- música ---------- */
/* troca de faixa com as duas tocando por um instante (só faixas da pasta; as geradas trocam direto) */
function musicCross(k){
  if(k<0||k===MUS.idx||!MUS.list[k])return;
  const C=AU.C,old=curTrack(),novo=MUS.list[k];
  if(!C||!MUS.playing||!old||old.builtin||novo.builtin||!old.g){musicSelect(k,MUS.playing);return}
  const t=C.currentTime;
  old.g.gain.cancelScheduledValues(t);old.g.gain.setValueAtTime(old.g.gain.value,t);old.g.gain.linearRampToValueAtTime(0,t+1.4);
  /* quem sai guarda onde estava: ao voltar (fim do combate, saída da sala secreta) continua dali */
  old.volta=old.el.currentTime;clearTimeout(old.sai);old.sai=setTimeout(()=>{if(curTrack()!==old)old.el.pause()},1500);
  MUS.idx=k;connectEl(novo);clearTimeout(novo.sai);
  if(novo.g){novo.g.gain.cancelScheduledValues(t);novo.g.gain.setValueAtTime(0,t);novo.g.gain.linearRampToValueAtTime(1,t+1.4)}
  try{novo.el.currentTime=novo.combateDe?0:(novo.volta||0)}catch(e){}
  novo.el.play().catch(()=>{});MUS.pos=0;uiPlayer()}

/* combate: alguma criatura por perto está caçando ou atacando (marcado por js/04c-inimigos.js) */
const COMBATE={ultimo:-99};
const emCombate=()=>T-COMBATE.ultimo<6;
function faixaDesejada(i){
  const L=MUS.list;
  if(MODE==='play'){
    const sala=WORLD.salaEm(PL.x,PL.y-40);
    if(sala&&sala.secreta){const s=L.findIndex(t=>t.segredo);if(s>=0)return s}
    if(emCombate()){const s=L.findIndex(t=>t.combateDe&&t.combateDe.includes(i));if(s>=0)return s}
  }
  return faixaDaArea(i)}
let musT=0;
function musicaJogo(dt){if(MODE!=='play'||!MUS.started||!MUS.playing||MUS.manual)return;if((musT-=dt)>0)return;musT=.4;
  const k=faixaDesejada(Math.max(0,lastIdx));if(k>=0&&k!==MUS.idx)musicCross(k)}

/* ---------- sons em laço (passos correndo, deslizar na parede, queda longa, corrida de cristal) ---------- */
const LOOPS={};
function somLoop(nome,liga,v=1){const C=AU.C;if(!C)return;const L=LOOPS[nome];
  if(liga){if(L&&L.on)return;const buf=ASSETS.sfx[nome];if(!buf||C.state!=='running')return;
    const s=C.createBufferSource(),g=C.createGain(),t=C.currentTime;s.buffer=buf;s.loop=true;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v*(MODE==='auto'?.55:1),t+.05);
    s.connect(g);g.connect(AU.sfx);s.start(t,(buf.duration*.37)%buf.duration);LOOPS[nome]={s,g,on:true}}
  else if(L&&L.on){L.on=false;const t=C.currentTime;L.g.gain.cancelScheduledValues(t);L.g.gain.setValueAtTime(L.g.gain.value,t);L.g.gain.linearRampToValueAtTime(0,t+.1);try{L.s.stop(t+.12)}catch(e){}}}
function pararLoops(){for(const k in LOOPS)somLoop(k,false)}
/* chão de cada tema para os passos: pedra, grama, metal (só quando a pasta tem os arquivos) */
const PISO_TEMA={sendas:'grama',brejo:'grama',ninho:'metal'};
function loopPassos(){const tm=REGS[clamp(lastIdx,0,REGS.length-1)].tema,p=PISO_TEMA[tm],k=p&&ASSETS.sfx['loop_passos_'+p]?'loop_passos_'+p:'loop_passos';return ASSETS.sfx[k]?k:null}
/* chamado a cada quadro pelo laço: decide quais laços tocam agora */
let passosAtual=null;
function sonsDoPersonagem(){
  if(!AU.C||AU.C.state!=='running')return;
  const jogo=MODE==='play'&&!paused&&PL.dead<=0&&PL.abyss<=0;
  const correndo=jogo?(!!PL.on&&Math.abs(PL.vx)>40&&PL.dash<=0):(MODE==='auto'&&L.mv&&L.mode==='walk');
  const p=correndo?loopPassos():null;
  if(passosAtual&&passosAtual!==p)somLoop(passosAtual,false);
  if(p)somLoop(p,true,.75);passosAtual=p;
  somLoop('loop_parede',jogo&&!PL.on&&PL.wall!==0&&PL.vy>60&&typeof temPoder==='function'&&temPoder('garras'),.7);
  somLoop('loop_queda',jogo&&!PL.on&&PL.vy>1100,.6);
  somLoop('loop_corrida',jogo&&PL.sdash>0,.8)}
/* com os passos em laço, o passo avulso (sintetizado) não toca */
const passoEmLaco=()=>!!loopPassos();

/* ---------- sons com lugar: mais baixos de longe e do lado em que acontecem ---------- */
function saidaEm(x,y,v){const C=AU.C,dx=x-CAM.x,dy=y-CAM.y,d=Math.hypot(dx,dy*1.3),q=clamp(1-(d-VW*.35)/(VW*1.1),0,1);if(q<=0)return null;
  const g=C.createGain();g.gain.value=v*q*(MODE==='auto'?.5:1);let alvo=g;
  if(C.createStereoPanner){const p=C.createStereoPanner();p.pan.value=clamp(dx/(VW*.6),-.85,.85);g.connect(p);p.connect(AU.sfx);if(q>.2){const r=C.createGain();r.gain.value=.25;g.connect(r);r.connect(AU.sfxRev)}}else g.connect(AU.sfx);
  return alvo}
/* um som do jogo num lugar do mapa: arquivo da pasta (se houver) ou síntese */
function sfxEm(nome,x,y,v=1){const C=AU.C;if(!C||C.state!=='running')return;const out=saidaEm(x,y,v);if(!out)return;
  const buf=ASSETS.sfx[nome];if(buf){const s=C.createBufferSource();s.buffer=buf;s.playbackRate.value=.94+Math.random()*.12;s.connect(out);s.start();return}
  const f=SYN[nome];if(f)try{f(C.currentTime,1,out)}catch(e){}}

/* ---------- vozes das criaturas (sintetizadas, originais) ---------- */
/* blocos: cada um escreve num nó de saída "o" */
function oscT(o,t,type,f0,f1,dur,peak,att=.006){const C=AU.C,s=C.createOscillator(),g=C.createGain();s.type=type;s.frequency.setValueAtTime(f0,t);s.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur);
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(peak,t+att);g.gain.exponentialRampToValueAtTime(.0001,t+dur);s.connect(g);g.connect(o);s.start(t);s.stop(t+dur+.03);return s}
function ruido(o,t,dur,tipo,f0,f1,peak,q=1.2,att=.004){const C=AU.C,s=C.createBufferSource(),fl=C.createBiquadFilter(),g=C.createGain();s.buffer=AU.noise;fl.type=tipo;fl.frequency.setValueAtTime(f0,t);if(f1)fl.frequency.exponentialRampToValueAtTime(f1,t+dur);fl.Q.value=q;
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(peak,t+att);g.gain.exponentialRampToValueAtTime(.0001,t+dur);s.connect(fl);fl.connect(g);g.connect(o);s.start(t,Math.random()*1.5);s.stop(t+dur+.03)}
/* guincho: serra filtrada com vibrato rápido */
function guincho(o,t,f,dur,peak,vib=38){const C=AU.C,s=C.createOscillator(),bp=C.createBiquadFilter(),g=C.createGain(),l=C.createOscillator(),lg=C.createGain();s.type='sawtooth';s.frequency.setValueAtTime(f,t);s.frequency.exponentialRampToValueAtTime(f*.72,t+dur);
  l.frequency.value=vib;lg.gain.value=f*.06;l.connect(lg);lg.connect(s.frequency);bp.type='bandpass';bp.frequency.value=f*2.2;bp.Q.value=3;g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(peak,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  s.connect(bp);bp.connect(g);g.connect(o);s.start(t);l.start(t);s.stop(t+dur+.03);l.stop(t+dur+.03)}
/* resmungo: serra grave com formante (as cascas) */
function resmungo(o,t,f,dur,peak){const C=AU.C,s=C.createOscillator(),bp=C.createBiquadFilter(),g=C.createGain();s.type='sawtooth';s.frequency.setValueAtTime(f,t);s.frequency.linearRampToValueAtTime(f*.8,t+dur);bp.type='bandpass';bp.frequency.setValueAtTime(520,t);bp.frequency.linearRampToValueAtTime(380,t+dur);bp.Q.value=4;
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(peak,t+.03);g.gain.exponentialRampToValueAtTime(.0001,t+dur);s.connect(bp);bp.connect(g);g.connect(o);s.start(t);s.stop(t+dur+.03)}
/* zumbido de asas */
function zumbido(o,t,f,dur,peak){const C=AU.C,s=C.createOscillator(),g=C.createGain(),am=C.createOscillator(),ag=C.createGain(),lp=C.createBiquadFilter();s.type='sawtooth';s.frequency.value=f;am.frequency.value=f*.5;ag.gain.value=peak*.5;am.connect(ag);ag.connect(g.gain);lp.type='lowpass';lp.frequency.value=f*6;
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(peak*.5,t+.03);g.gain.linearRampToValueAtTime(.0001,t+dur);s.connect(lp);lp.connect(g);g.connect(o);s.start(t);am.start(t);s.stop(t+dur+.03);am.stop(t+dur+.03)}
/* metal: parciais desafinados que somem devagar */
function metal(o,t,f,peak,dur=.5){[1,2.76,5.4,8.93].forEach((r,k)=>oscT(o,t,'sine',f*r,f*r*.995,dur/(1+k*.6),peak/(1+k),.002));ruido(o,t,.04,'highpass',3000,0,peak*.8)}
/* estalos de inseto */
function estalos(o,t,n,f,peak,gap=.035){for(let k=0;k<n;k++)ruido(o,t+k*gap*(.8+Math.random()*.4),.02,'bandpass',f*(.85+Math.random()*.3),0,peak,6)}
/* bolha que sobe */
function bolhaS(o,t,f,peak){oscT(o,t,'sine',f,f*2.6,.12,peak)}

/* o que cada voz faz em cada momento */
const VOZ={
  inseto:{alerta:(o,t)=>estalos(o,t,5,2400,.18),ataque:(o,t)=>estalos(o,t,3,1800,.2),dano:(o,t)=>{ruido(o,t,.09,'bandpass',1400,700,.22,2);estalos(o,t+.02,2,2600,.12)},
    morte:(o,t)=>{ruido(o,t,.22,'lowpass',1800,300,.25);estalos(o,t+.05,4,2000,.12,.05)},passo:(o,t)=>estalos(o,t,1,3200,.05)},
  casca:{alerta:(o,t)=>resmungo(o,t,150,.32,.22),ataque:(o,t)=>{resmungo(o,t,120,.25,.2);ruido(o,t+.05,.18,'bandpass',900,2600,.14)},dano:(o,t)=>{resmungo(o,t,180,.14,.16);ruido(o,t,.06,'bandpass',1300,0,.2)},
    morte:(o,t)=>{resmungo(o,t,140,.5,.22);ruido(o,t+.1,.3,'lowpass',900,150,.22)},passo:(o,t)=>ruido(o,t,.05,'lowpass',500,0,.12)},
  guarda:{alerta:(o,t)=>{resmungo(o,t,110,.4,.24);metal(o,t+.05,420,.06)},ataque:(o,t)=>{ruido(o,t,.22,'bandpass',700,3200,.2);resmungo(o,t,100,.2,.16)},dano:(o,t)=>{metal(o,t,520,.1,.3);resmungo(o,t,150,.14,.12)},
    morte:(o,t)=>{resmungo(o,t,95,.6,.24);metal(o,t+.2,300,.12,.8);ruido(o,t+.25,.3,'lowpass',700,120,.22)},passo:(o,t)=>{ruido(o,t,.06,'lowpass',380,0,.18);metal(o,t,240,.025,.15)},pulo:(o,t)=>ruido(o,t,.2,'bandpass',500,1600,.14),pouso:(o,t)=>{oscT(o,t,'sine',90,40,.25,.3);ruido(o,t,.12,'lowpass',500,0,.25)}},
  voador:{alerta:(o,t)=>guincho(o,t,880,.3,.16),ataque:(o,t)=>{zumbido(o,t,150,.3,.18);ruido(o,t,.25,'bandpass',2000,600,.12)},dano:(o,t)=>{guincho(o,t,1100,.12,.12);ruido(o,t,.06,'bandpass',1600,0,.18)},
    morte:(o,t)=>{guincho(o,t,700,.35,.14);ruido(o,t+.05,.2,'lowpass',1500,300,.2)},asa:(o,t)=>zumbido(o,t,95+Math.random()*30,.18,.06)},
  louva:{alerta:(o,t)=>guincho(o,t,1250,.22,.16,60),ataque:(o,t)=>{ruido(o,t,.14,'bandpass',1500,5200,.24);guincho(o,t,1500,.1,.1,70)},dano:(o,t)=>{guincho(o,t,1400,.1,.12,60);ruido(o,t,.06,'bandpass',2000,0,.18)},
    morte:(o,t)=>{guincho(o,t,1000,.4,.16,50);ruido(o,t+.1,.25,'lowpass',1600,300,.18)},pulo:(o,t)=>ruido(o,t,.15,'bandpass',1200,3000,.12)},
  musgo:{alerta:(o,t)=>{ruido(o,t,.25,'bandpass',600,1400,.18,1);estalos(o,t+.05,3,1500,.1)},ataque:(o,t)=>ruido(o,t,.3,'bandpass',500,1800,.2,.8),dano:(o,t)=>ruido(o,t,.12,'lowpass',1200,400,.22),
    morte:(o,t)=>{ruido(o,t,.35,'lowpass',1000,200,.24);estalos(o,t+.1,4,2200,.1,.06)},surgir:(o,t)=>{ruido(o,t,.4,'bandpass',300,1500,.22,.8);estalos(o,t,6,1800,.08,.05)},sumir:(o,t)=>ruido(o,t,.45,'bandpass',1400,300,.18,.8)},
  terra:{alerta:(o,t)=>estalos(o,t,4,1900,.14),surgir:(o,t)=>{ruido(o,t,.35,'lowpass',400,1400,.3,.8);oscT(o,t,'sine',70,45,.3,.25)},sumir:(o,t)=>{ruido(o,t,.4,'lowpass',1200,300,.26,.8);oscT(o,t,'sine',60,40,.3,.2)},
    ataque:(o,t)=>estalos(o,t,6,2200,.12,.03),dano:(o,t)=>ruido(o,t,.1,'bandpass',1200,500,.22,2),morte:(o,t)=>{ruido(o,t,.3,'lowpass',1200,200,.25);estalos(o,t,3,2400,.1)}},
  cogumelo:{alerta:(o,t)=>{oscT(o,t,'sine',180,90,.3,.2);bolhaS(o,t+.1,300,.08)},ataque:(o,t)=>{oscT(o,t,'sine',220,70,.22,.24);ruido(o,t,.2,'lowpass',900,200,.14)},dano:(o,t)=>{oscT(o,t,'sine',260,120,.12,.2);ruido(o,t,.08,'lowpass',1400,0,.14)},
    morte:(o,t)=>{oscT(o,t,'sine',200,50,.45,.25);ruido(o,t,.4,'lowpass',1200,150,.2);bolhaS(o,t+.2,240,.08)},nuvem:(o,t)=>{ruido(o,t,.8,'bandpass',900,300,.16,.6,.1);oscT(o,t,'sine',120,60,.4,.12)},esporo:(o,t)=>{ruido(o,t,.12,'bandpass',1800,600,.14);bolhaS(o,t,420,.05)},
    pancada:(o,t)=>{oscT(o,t,'sine',80,35,.35,.4);ruido(o,t,.18,'lowpass',600,0,.3)},acordar:(o,t)=>{oscT(o,t,'sine',90,200,.5,.16);ruido(o,t,.4,'lowpass',500,1200,.1)}},
  cristal:{alerta:(o,t)=>{oscT(o,t,'sine',1800,1820,.4,.06);oscT(o,t,'sine',2700,2710,.35,.04)},ataque:(o,t)=>oscT(o,t,'sine',900,1400,.5,.08),dano:(o,t)=>metal(o,t,1300,.08,.4),
    morte:(o,t)=>{metal(o,t,1500,.1,.9);ruido(o,t,.4,'highpass',2500,6000,.12)},laser:(o,t)=>{oscT(o,t,'sawtooth',220,180,.65,.08,.03);oscT(o,t,'sine',1760,1600,.6,.06,.02);ruido(o,t,.6,'bandpass',4200,3000,.06,3,.03)},
    carga:(o,t)=>oscT(o,t,'sine',400,1600,.5,.07,.2),passo:(o,t)=>oscT(o,t,'sine',2600+Math.random()*600,2600,.06,.02)},
  baldur:{alerta:(o,t)=>resmungo(o,t,80,.5,.2),fechar:(o,t)=>{oscT(o,t,'sine',110,60,.25,.25);ruido(o,t,.12,'lowpass',700,0,.2)},abrir:(o,t)=>{oscT(o,t,'sine',60,110,.3,.18);ruido(o,t,.25,'bandpass',400,900,.08)},
    ataque:(o,t)=>{oscT(o,t,'sine',160,60,.2,.24);ruido(o,t,.15,'lowpass',800,0,.16)},dano:(o,t)=>{oscT(o,t,'sine',140,80,.15,.2);ruido(o,t,.08,'lowpass',900,0,.14)},morte:(o,t)=>{resmungo(o,t,70,.8,.24);ruido(o,t+.2,.6,'lowpass',600,100,.24)}},
  agua:{alerta:(o,t)=>bolhaS(o,t,500,.06),dano:(o,t)=>{bolhaS(o,t,700,.1);ruido(o,t,.12,'highpass',2000,0,.06)},morte:(o,t)=>{for(let k=0;k<4;k++)bolhaS(o,t+k*.05,400+k*160,.07)}},
  geral:{alerta:(o,t)=>guincho(o,t,700,.25,.12),ataque:(o,t)=>ruido(o,t,.2,'bandpass',900,2600,.16),dano:(o,t)=>ruido(o,t,.08,'bandpass',1200,0,.2),morte:(o,t)=>ruido(o,t,.3,'lowpass',1400,200,.24)}};
/* sons que não dependem da voz */
const VOZ_COMUM={
  explosao:(o,t)=>{oscT(o,t,'sine',95,30,.6,.5,.004);ruido(o,t,.9,'lowpass',2600,120,.45,.7);ruido(o,t,.25,'highpass',3000,0,.15)},
  bloqueio:(o,t)=>{metal(o,t,660,.16,.6);ruido(o,t,.05,'highpass',4000,0,.3)},
  laser:(o,t)=>VOZ.cristal.laser(o,t),carga:(o,t)=>VOZ.cristal.carga(o,t),
  tiro:(o,t)=>{oscT(o,t,'sine',420,160,.16,.16);ruido(o,t,.12,'bandpass',1500,500,.14)},
  cuspe:(o,t)=>{ruido(o,t,.16,'bandpass',900,2200,.2,1.5);bolhaS(o,t+.03,300,.08)},
  arremesso:(o,t)=>{ruido(o,t,.22,'bandpass',600,2400,.18);resmungo(o,t,130,.18,.12)},
  quebra:(o,t)=>{ruido(o,t,.14,'highpass',1500,0,.2);metal(o,t,900,.04,.2)},
  estouro:(o,t)=>{ruido(o,t,.25,'lowpass',2200,300,.28);oscT(o,t,'sine',160,60,.18,.2)},
  rolar:(o,t)=>ruido(o,t,.3,'lowpass',300,200,.12),
  fio:(o,t)=>oscT(o,t,'sine',1200,700,.35,.03,.05)};
/* voz de cada criatura: o campo "voz" do inimigos.json, ou pelo nome */
const VOZ_NOME=[[/sentry|guarda/i,'guarda'],[/husk|casca|miner|dandy|hornhead/i,'casca'],[/crystal|cristal/i,'cristal'],[/mantis youth/i,'voador'],[/mantis|louva/i,'louva'],[/moss/i,'musgo'],[/dirt/i,'terra'],
  [/shrumal|fungoon|sporg|cogum/i,'cogumelo'],[/baldur/i,'baldur'],[/uoma|jelly|água|agua/i,'agua'],[/vengefly|gruzzer|aspid|belfly|squit|lance|fly|mosca/i,'voador'],[/crawlid|weaver|durandoo|crawler|aranha|besouro/i,'inseto']];
function vozDe(e){if(e._voz)return e._voz;const c=e.cfg||{};let v=c.voz;if(!v||!VOZ[v]){const n=String(c.nome||c.pasta||e.nome||'');v=(VOZ_NOME.find(([re])=>re.test(n))||[])[1]||(e.air?'voador':'inseto')}return e._voz=v}
/* toca a voz de uma criatura num evento; o dono pode trocar por arquivos: recursos/sons/inimigos/<pasta>/<evento>.wav */
function vozInimigo(e,ev,v=1){const C=AU.C;if(!C||C.state!=='running'||!e)return;const x=e.x,y=e.air?e.y:e.y-30;
  const pasta=e.cfg&&e.cfg.pasta,buf=pasta&&ASSETS.sfx['ini:'+pasta+':'+ev];
  const out=saidaEm(x,y,v);if(!out)return;
  if(buf){const s=C.createBufferSource();s.buffer=buf;s.playbackRate.value=.95+Math.random()*.1;s.connect(out);s.start();return}
  const voz=VOZ[vozDe(e)]||VOZ.geral,f=voz[ev]||VOZ_COMUM[ev]||VOZ.geral[ev];if(f)try{f(out,C.currentTime)}catch(err){}}

/* sons novos do personagem, enquanto a pasta não tem o arquivo (o arquivo do dono sempre vem primeiro) */
Object.assign(SYN,{
  pouso_forte:(t,v)=>{SYN.pouso(t,v*1.2);tone(t,'sine',90,38,.3,.18*v)},
  nevoa:(t,v)=>{SYN.avanco(t,v);nz(t,.3,500,'lowpass',.1*v,200)},
  faisca:(t,v)=>{tone(t,'sawtooth',220,90,.35,.08*v,true);nz(t,.3,1600,'bandpass',.16*v,600)},
  clarao:(t,v)=>{tone(t,'sawtooth',180,520,.5,.06*v,true);nz(t,.5,900,'bandpass',.14*v,4000)},
  queda:(t,v)=>SYN.avanco(t,v),
  queda_impacto:(t,v)=>{tone(t,'sine',120,36,.45,.35*v);nz(t,.35,900,'lowpass',.28*v,120)},
  corrida_carga:(t,v)=>tone(t,'sine',300,1200,.35,.05*v,true),
  corrida_disparo:(t,v)=>{SYN.avanco(t,v);tone(t,'triangle',600,200,.3,.06*v)},
  bloqueio:(t,v)=>{tone(t,'sine',1320,1310,.45,.1*v,true);tone(t,'sine',2650,2600,.3,.05*v,true);nz(t,.05,4000,'highpass',.22*v)},
  espada:(t,v)=>{nz(t,.3,2500,'highpass',.05*v,7000);tone(t,'sine',2400,2380,.6,.025*v,true)},
  salto_parede:(t,v)=>SYN.pulo(t,v)});

/* ---------- sons do cenário vivo (js/03c-vivos.js) ---------- */
const SOM_VIVO={
  folhas:(o,t)=>{ruido(o,t,.22,'bandpass',2600,1600,.1,.8,.02);ruido(o,t+.05,.15,'bandpass',3600,0,.05,1)},
  pano:(o,t)=>ruido(o,t,.35,'bandpass',500,1400,.1,.7,.05),
  rangido:(o,t)=>{const C=AU.C,s=C.createOscillator(),g=C.createGain(),l=C.createOscillator(),lg=C.createGain();s.type='triangle';s.frequency.setValueAtTime(380,t);s.frequency.linearRampToValueAtTime(300,t+.4);l.frequency.value=18;lg.gain.value=30;l.connect(lg);lg.connect(s.frequency);
    g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.035,t+.05);g.gain.exponentialRampToValueAtTime(.0001,t+.45);s.connect(g);g.connect(o);s.start(t);l.start(t);s.stop(t+.5);l.stop(t+.5)},
  sino:(o,t)=>{metal(o,t,880,.07,1.2);VOZ_COMUM.bloqueio&&ruido(o,t,.04,'highpass',4000,0,.08)},
  faisca:(o,t)=>{ruido(o,t,.16,'highpass',3500,0,.22,1);oscT(o,t,'square',1400,300,.12,.04);ruido(o,t+.08,.1,'highpass',5000,0,.1)},
  esporos:(o,t)=>{ruido(o,t,.4,'bandpass',1500,500,.14,.6,.02);bolhaS(o,t,380,.06)},
  asas:(o,t)=>{for(let k=0;k<4;k++)ruido(o,t+k*.05,.05,'bandpass',1800+k*200,0,.05,2)},
  bate_barro:(o,t)=>{oscT(o,t,'sine',260,140,.12,.2);ruido(o,t,.06,'bandpass',1400,0,.16,2)},
  bate_madeira:(o,t)=>{oscT(o,t,'sine',180,110,.12,.25);ruido(o,t,.08,'bandpass',900,0,.18,3)},
  bate_metal:(o,t)=>metal(o,t,420,.1,.4),
  bate_cristal:(o,t)=>metal(o,t,1500,.06,.6),
  bate_papel:(o,t)=>ruido(o,t,.12,'bandpass',2000,800,.12,.8),
  quebra_barro:(o,t)=>{oscT(o,t,'sine',220,90,.2,.25);for(let k=0;k<6;k++)ruido(o,t+k*.03+Math.random()*.03,.06,'bandpass',1800+Math.random()*1800,0,.14,3)},
  quebra_madeira:(o,t)=>{oscT(o,t,'sine',150,70,.25,.3);ruido(o,t,.25,'bandpass',700,300,.22,1.5);for(let k=0;k<4;k++)ruido(o,t+.05+k*.04,.05,'bandpass',1200,0,.1,3)},
  quebra_papel:(o,t)=>{oscT(o,t,'sine',160,90,.15,.18);for(let k=0;k<6;k++)ruido(o,t+k*.05,.12,'bandpass',2500+Math.random()*1500,1200,.06,.8)},
  quebra_cristal:(o,t)=>{for(let k=0;k<5;k++)metal(o,t+k*.04,1200+Math.random()*1400,.05,.9);ruido(o,t,.3,'highpass',3000,7000,.1)},
  quebra_metal:(o,t)=>{metal(o,t,300,.14,.8);metal(o,t+.07,520,.08,.5);ruido(o,t,.2,'bandpass',1500,500,.16,1.5)}};
function somVivo(ev,x,y,v=1){const C=AU.C;if(!C||C.state!=='running')return;const f=SOM_VIVO[ev];if(!f)return;const out=saidaEm(x,y,v);if(!out)return;try{f(out,C.currentTime)}catch(e){}}
