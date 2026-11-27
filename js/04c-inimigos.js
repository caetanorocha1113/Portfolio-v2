/* ---------- criaturas: o que cada uma faz ----------
   Cada inimigo do recursos/inimigos/inimigos.json tem um "comportamento". Os estados são simples
   (patrulha → vê o jogador → prepara → ataca → recupera) e cada comportamento escolhe a animação ("papel") de cada momento.
   Comportamentos (descrição do dono):
     andar      rasteja de um lado para o outro e vira nas paredes e beiradas (Crawlid, Durandoo)
     vagar      vagueia devagar; ao ver o jogador, ergue os braços e vai até ele, desajeitado (Husk Dandy)
     investir   patrulha; com o jogador na mesma linha, prepara e dispara correndo (Mosskin; Husk Hornhead com "ate_parede")
     guarda     escudo na frente, estocadas, combos e saltos (Husk Sentry; Great Husk Sentry com "pesado")
     duelista   corre, corta na horizontal, recua e salta para cortar do alto (Mantis Warrior)
     emboscar   escondido no chão; surge perto do jogador e corre em linha reta (Dirtcaver, Moss Charger)
     saltitar   pulinhos; perto do jogador, rola para a frente (Shrumal Warrior)
     perseguir  voa atrás do jogador (Vengefly grita antes; Aspid Hatchling vai direto)
     quicar     voa em diagonal quicando nas paredes, sem ligar para o jogador (Gruzzer)
     mergulhar  paira, trava a mira e dispara contra o ponto onde o jogador estava (Lance Sentry, Squit; Mantis Youth em curva)
     teto       pendurado no teto; despenca e explode ao bater (Belfly)
     aranha     desce do teto por um fio e corre rápido, com saltos curtos (Little Weaver)
     atirar     mantém distância e atira (Aspid Hunter; Husk Miner joga picaretas em arco e recua)
     mae        flutua devagar soltando filhotes; ao morrer, estoura e solta mais dois (Aspid Mother)
     rastejar   anda no chão ou no teto e solta um raio para o lado das costas; só magias ferem (Crystal Crawler)
     laser      anda devagar; ao ver o jogador, para, mira e solta um raio pela cabeça (Crystallised Husk)
     concha     fecha a concha de perto; de longe, abre e cospe filhotes que rolam ou ácido (Elder Baldur)
     ogro       cospe ácido em arco de longe e bate a cabeça no chão de perto (Shrumal Ogre)
     esporo     fixo no chão; solta esporos que flutuam atrás do jogador e estouram (Sporg)
     nuvem      flutua devagar; perto do jogador, infla e solta uma nuvem tóxica (Fungoon)
     flutuar    só flutua para cima e para baixo (Uoma)
   Globais usados por js/04-jogo.js e js/08b-poderes.js: atualizarInimigo, updateEnemies, updateShots, papelInimigo,
   desenharInimigo, desenharTirosSprite, desenharEfeitosInimigos, contatoInimigos, golpearInimigos, ferirInimigo, colocarExtra. */

Object.assign(BEHAVIOURS,{vagar:{ground:1},emboscar:{ground:1},guarda:{ground:1},duelista:{ground:1},saltitar:{ground:1},rastejar:{ground:1},laser:{ground:1},concha:{ground:1},
  ogro:{ground:1},esporo:{ground:1},aranha:{ground:1},quicar:{air:1},mergulhar:{air:1},mae:{air:1},nuvem:{air:1}});
Object.assign(ALCANCE_PADRAO,{vagar:420,emboscar:300,guarda:520,duelista:560,saltitar:420,rastejar:0,laser:640,concha:720,ogro:620,esporo:520,aranha:320,quicar:0,mergulhar:520,mae:560,nuvem:200});
/* quem faz a animação de susto ("alerta") ao ver o jogador, e para onde vai depois */
const DEPOIS_ALERTA={perseguir:'caca',atirar:'mira',guarda:'caca',duelista:'caca',mergulhar:'mira',vagar:'patrulha',investir:'patrulha',laser:'mira'};
/* estados em que a criatura está brigando (a música troca para a de combate) */
const AGRESSIVO={caca:1,preparar:1,atacar:1,mira:1,alerta:1,surgir:1,descer:1,esquivar:1,pulo:1,recuar:1};
/* papel que falta → papel que serve no lugar */
const RECUO={correr:'andar',pular:'preparar',esquivar:'pular',preparar2:'preparar',atacar2:'atacar',recuperar2:'recuperar',preparar_cima:'preparar',atacar_cima:'atacar',recuperar_cima:'recuperar',
  defender_cima:'defender',defender:'parado',surgir:'parado',sumir:'parado',fugir:'morrer',explodir:'morrer',ferido:'parado',dormir:'parado',acordar:'alerta',fechar:'parado',fechado:'parado',
  abrir:'parado',descer:'parado',morrer_ar:'morrer',alerta:'parado',virar:'parado',preparar:'parado',atacar:'andar',recuperar:'parado',parado:'andar',andar:'parado',trabalhar:'parado',escondido:null};
function resolver(e,p){let k=p,g=0;while(k&&!temAnim(e,k)&&g++<8)k=RECUO[k];return k&&temAnim(e,k)?k:roleOf(e,'andar')}
const ir=(e,est)=>{e.estado=est;e.tE=0;e.anim=''};
const olhar=(e,a)=>{if(a)e.face=a.x>e.x?1:-1};
const voz=(e,ev,v)=>{if(typeof vozInimigo==='function')vozInimigo(e,ev,v)};

/* linha livre até o alvo (sem limite de distância): quem fica no teto olha para baixo de longe */
function linhaLivre(e,a){if(!a)return false;const ey=e.air?e.y:e.y-alturaInimigo(e)*.5,dx=a.x-e.x,dy=(a.y-40)-ey;for(let k=1;k<8;k++){const t=k/8;if(!WORLD.dentro(e.x+dx*t,ey+dy*t))return false}return true}
/* ---------- movimento ---------- */
/* anda no chão para onde olha; falso se a parede ou a beirada impedem */
function andarChao(e,dt,vel){const nx=e.x+e.face*vel*dt;if(!podeAndar(e,nx))return false;e.x=nx;e.y=chaoInimigo(e,nx)??e.y;e.andando=true;return true}
/* anda no chão numa direção qualquer (para recuar sem virar as costas) */
function moverChao(e,dt,vx){const nx=e.x+vx*dt;if(!podeAndar(e,nx))return false;e.x=nx;e.y=chaoInimigo(e,nx)??e.y;e.andando=true;return true}
function patrulha(e,dt,vel,raio){
  if(e.estado==='virar'){e.p='virar';if(e.tE>=duracao(e,'virar',.22)){e.face*=-1;ir(e,'patrulha')}return}
  if(e.estado!=='patrulha')ir(e,'patrulha');e.p='andar';
  const nx=e.x+e.face*vel*dt;
  if(!podeAndar(e,nx)||(raio&&Math.abs(nx-e.cx)>e.rg&&Math.sign(nx-e.cx)===e.face)){ir(e,'virar');return}
  e.x=nx;e.y=chaoInimigo(e,nx)??e.y;e.andando=true}
/* patrulha com paradas (para quem vagueia) */
function vaguear(e,dt,vel){
  if(e.estado==='patrulha'&&e.parada>0){e.parada-=dt;e.p='parado';if(e.parada<=0&&Math.random()<.4)ir(e,'virar');return}
  patrulha(e,dt,vel,true);
  if(e.estado==='patrulha'&&e.tE>2.2+(e.bob%2.5)){e.parada=.8+Math.random()*1.5;e.tE=0}}
/* pulo e queda (gravidade); verdadeiro no quadro em que pousa */
function fisicaChao(e,dt){e.vy+=1800*dt;const s=e.sala,nx=e.x+e.vx*dt;
  if(WORLD.dentro(nx+Math.sign(e.vx||e.face)*20,e.y-30)&&nx>s.x+40&&nx<s.x+s.w-40)e.x=nx;else e.vx=0;
  const ny=e.y+e.vy*dt;
  if(e.vy>0){const g=chaoInimigo(e,e.x);if(g!=null&&ny>=g&&e.y<=g+10){e.y=g;e.vy=0;e.noChao=true;return true}}
  if(e.vy<0&&!WORLD.dentro(e.x,ny-alturaInimigo(e)))e.vy=0;
  e.y=ny;e.noChao=false;if(e.y>s.y+s.h+300){colocar(e,e.home)}return false}
function saltar(e,vx,vy){e.vx=vx;e.vy=vy;e.noChao=false}
function tetoInimigo(e,x){const t=MUNDO.tetoEm(e.sala,x);return t===t&&x>e.sala.x+30&&x<e.sala.x+e.sala.w-30?t:null}
function flutuarEmCasa(e,dt,v){const ty=e.cy-(e.hv||170)+Math.sin(T*1.4+e.bob)*18,tx=e.cx+Math.sin(T*.35+e.bob)*90*v;guiar(e,tx,ty,dt,90*v,260);moverAr(e,dt);if(Math.abs(e.vx)>10)e.face=e.vx>0?1:-1}
function voarPatrulha(e,dt,v){if(Math.abs(e.vx)<20){e.vx=e.face*110*v;e.vy=(e.vy>=0?1:-1)*55*v}moverAr(e,dt);const top=e.cy-(e.hv||170)-150,bot=e.cy-70;
  if((e.y<top&&e.vy<0)||(e.y>bot&&e.vy>0))e.vy=-e.vy;if(Math.abs(e.x-e.cx)>e.rg+100&&Math.sign(e.x-e.cx)===Math.sign(e.vx))e.vx=-e.vx;e.face=e.vx>0?1:-1}
/* paira a uma distância do jogador (quem atira de longe recua quando ele chega perto) */
function pairar(e,dt,a){let tx=e.cx+Math.sin(T*.3+e.bob)*90,ty=e.cy-(e.hv||200)+Math.sin(T*1.6+e.bob)*16;
  if(a){tx=a.x+(e.x<a.x?-1:1)*300;ty=Math.min(ty,a.y-150)}guiar(e,tx,ty,dt,150,320);moverAr(e,dt);if(!a&&Math.abs(e.vx)>10)e.face=e.vx>0?1:-1}
function pairarPerto(e,dt,a){const tx=a.x+(e.x<a.x?-1:1)*230,ty=Math.min(e.cy-(e.hv||200),a.y-210)+Math.sin(T*1.7+e.bob)*14;guiar(e,tx,ty,dt,140,300);moverAr(e,dt)}
function pular(e,dt,a,v){
  if(e.noChao){e.vx=0;if(e.estado==='virar'){e.p='virar';if(e.tE>=duracao(e,'virar',.2)){e.face*=-1;ir(e,'patrulha')}return}
    e.p='parado';
    if(e.tE>(e.pausa??.6)){if(a)e.face=a.x>e.x?1:-1;const alvoX=e.x+e.face*150,ahead=chaoInimigo(e,alvoX);
      if(ahead==null||Math.abs(ahead-e.y)>60||(!a&&Math.abs(alvoX-e.cx)>e.rg+120)){ir(e,'virar');return}
      saltar(e,e.face*(a?240:160)*v,-(a?580:480));e.estado='patrulha';e.tE=0}return}
  e.p='andar';if(fisicaChao(e,dt)){e.tE=0;e.pausa=.25+Math.random()*.6}}

/* ---------- projéteis, raios, nuvens e ondas ---------- */
const COR_TIRO={reto:'#ff9a3c',acido:'#ff9a3c',arco:'#cfe06a',esporo:'#e7d27a',rolante:'#a8956a'};
function disparar(e,a){if(!a)return;const c=e.cfg||{},tipo=c.projetil_tipo||'reto',n=Math.max(1,+c.projeteis||1),sy=e.air?e.y:e.y-alturaInimigo(e)*.6,sx=e.x+e.face*24;
  for(let i=0;i<n;i++){let vx,vy;const lado=(i-(n-1)/2);
    if(tipo==='arco'){const tx=a.x+lado*110,ty=a.y-24,t=clamp(Math.abs(tx-sx)/380,.55,1.15),g=1300;vx=(tx-sx)/t;vy=(ty-sy-.5*g*t*t)/t}
    else{const ang=Math.atan2((a.y-40)-sy,a.x-sx)+lado*.24,v=(tipo==='esporo'?75:330)*(+c.vel_projetil||1);vx=Math.cos(ang)*v;vy=Math.sin(ang)*v}
    shots.push({x:sx,y:sy,vx,vy,t:0,tipo,g:tipo==='arco'?1300:0,spr:e.spr&&e.spr.anims.projetil?e.spr:null,owner:e,esq:!!c.projetil_olha_esquerda,gira:!!c.projetil_gira,jog:a.jog,
      cor:c.cor_projetil||COR_TIRO[tipo]||'#e8e0cf',vida:tipo==='esporo'?5.5:3.2,quebra:tipo==='esporo',r:tipo==='esporo'?18:14,rot:0})}
  voz(e,tipo==='esporo'?'esporo':tipo==='arco'?(c.projetil_gira?'arremesso':'cuspe'):'cuspe')}
/* filhotes que rolam pelo chão atrás do jogador (Elder Baldur) */
function filhoteRolante(e,a){const sx=e.x+e.face*30,sy=e.y-alturaInimigo(e)*.5;shots.push({x:sx,y:sy,vx:e.face*160,vy:-380,t:0,tipo:'rolante',owner:e,jog:a?a.jog:false,cor:COR_TIRO.rolante,vida:5,quebra:true,r:15,rot:0,chao:false});voz(e,'ataque')}
function acabarTiro(b,k,quebrou){const fim=b.spr&&b.spr.anims.projetil_fim;
  if(b.tipo==='esporo'||b.tipo==='rolante'){explosaoArea(b.x,b.y,b.tipo==='esporo'?70:0,b);if(b.owner)voz(b.owner,'estouro',.8)}
  else if(b.owner&&!quebrou)voz(b.owner,'quebra',.6);
  if(fim){b.fim=0;b.fimDur=animLen(b.spr,'projetil_fim');b.vx=b.vy=0}else{shots.splice(k,1);burst(b.x,b.y,b.cor||'#e8e0cf',b.tipo==='esporo'?14:8,b.tipo==='esporo'?180:120)}}
function explosaoArea(x,y,r,src){if(r>0&&MODE==='play'&&PL.dead<=0&&Math.hypot(PL.x-x,(PL.y-40)-y)<r+20)hurtPlayer({x})}
function updateShots(dt){for(let k=shots.length-1;k>=0;k--){const b=shots[k];b.t+=dt;
  if(b.fim!=null){b.fim+=dt;if(b.fim>b.fimDur)shots.splice(k,1);continue}
  if(b.tipo==='rolante'){b.vy+=1500*dt;const nx=b.x+b.vx*dt,ny=b.y+b.vy*dt;
    if(b.vy>0){const g=WORLD.chaoAbaixo(b.x,b.y-4,ny+b.r);if(g){b.y=g.y-b.r;b.vy=0;if(!b.chao)voz(b.owner,'rolar',.5);b.chao=true}else b.y=ny}else b.y=ny;
    if(b.chao){const d=b.jog&&MODE==='play'?(Math.sign(PL.x-b.x)||1):(Math.sign(b.vx)||1);b.vx=clamp(b.vx+d*420*dt,-230,230)}
    if(WORLD.dentro(nx,b.y-b.r*.5))b.x=nx;else b.vx=-b.vx*.7;b.rot+=b.vx*dt/b.r}
  else{if(b.tipo==='esporo'){if(b.jog&&MODE==='play'&&PL.dead<=0){const dx=PL.x-b.x,dy=PL.y-46-b.y,d=Math.hypot(dx,dy)||1;b.vx+=dx/d*60*dt;b.vy+=dy/d*60*dt}
      b.vy+=Math.sin(b.t*3.1+k)*24*dt;const sp=Math.hypot(b.vx,b.vy);if(sp>105){b.vx*=105/sp;b.vy*=105/sp}}
    b.vy+=(b.g||0)*dt;b.x+=b.vx*dt;b.y+=b.vy*dt}
  if(b.t>b.vida||!WORLD.dentro(b.x,b.y)){acabarTiro(b,k);continue}
  if(b.jog&&MODE==='play'&&PL.inv<=0&&PL.dash<=0&&PL.dead<=0&&Math.abs(b.x-PL.x)<(b.r||14)+4&&Math.abs(b.y-(PL.y-32))<(b.r||14)+26){hurtPlayer(b);acabarTiro(b,k,true)}}}

/* raios de cristal: primeiro um fio de aviso, depois o raio que fere */
const RAIOS=[];
function novoRaio(e,o){RAIOS.push({e,ang:o.ang,mira:o.mira,costas:!!o.costas,t:0,aviso:o.aviso||.6,ativo:o.ativo||.55,len:0,cor:(e.cfg&&e.cfg.cor_laser)||'#ff7fc8'});}
function origemRaio(R){const e=R.e,h=alturaInimigo(e);if(R.costas)return e.cabecaBaixo?[e.x,e.y+h*.75]:[e.x,e.y-h*.75];return[e.x+e.face*h*.18,e.y-h*.82]}
function atualizarRaios(dt){for(let k=RAIOS.length-1;k>=0;k--){const R=RAIOS[k],e=R.e;R.t+=dt;
  if(e.dead>0||R.t>R.aviso+R.ativo){RAIOS.splice(k,1);continue}
  const[ox,oy]=origemRaio(R);
  if(R.mira&&R.t<R.aviso-.18){const a=alvoAtual();if(a){let ang=Math.atan2((a.y-42)-oy,a.x-ox);const base=e.face>0?0:Math.PI;let d=Math.atan2(Math.sin(ang-base),Math.cos(ang-base));d=clamp(d,-.75,.75);R.ang=base+d}}
  let L=0;const cx=Math.cos(R.ang),cy=Math.sin(R.ang);while(L<1500&&WORLD.dentro(ox+cx*L,oy+cy*L))L+=14;R.len=L;R.ox=ox;R.oy=oy;
  if(R.t>=R.aviso&&MODE==='play'&&PL.dead<=0&&PL.inv<=0){const px=PL.x-ox,py=(PL.y-42)-oy,u=clamp(px*cx+py*cy,0,L),qx=px-cx*u,qy=py-cy*u;if(qx*qx+qy*qy<34*34)hurtPlayer({x:ox})}}}
/* nuvem tóxica em volta do Fungoon */
const NUVENS=[];
function soltarNuvem(e){NUVENS.push({x:e.x,y:e.y,t:0,dur:1.5,r:95,e})}
function atualizarNuvens(dt){for(let k=NUVENS.length-1;k>=0;k--){const n=NUVENS[k];n.t+=dt;if(n.t>n.dur){NUVENS.splice(k,1);continue}
  if(n.t<n.dur*.8&&MODE==='play'&&PL.dead<=0&&Math.hypot(PL.x-n.x,(PL.y-40)-n.y)<n.r*.85)hurtPlayer({x:n.x})}}
/* onda no chão quando o Shrumal Ogre bate a cabeça */
const ONDAS=[];
function ondaChao(e){ONDAS.push({x:e.x,y:e.y,t:0});shake.t=Math.max(shake.t,.12);shake.a=5;burst(e.x-e.face*10,e.y,'#cdb48a',8,140);
  if(MODE==='play'&&PL.dead<=0&&PL.on&&Math.abs(PL.x-e.x)<150&&Math.abs(PL.y-e.y)<70)hurtPlayer(e)}

/* filhotes (Aspid Mother): usam o desenho do inimigo do campo "filhote" */
function filhosVivos(m){let n=0;for(const e of ENEMIES[m.sec]||[])if(e.mae===m&&e.dead<=0)n++;return n}
function parir(m,a,lado){const c=m.cfg||{},base=typeof SPR_INIMIGO==='object'&&SPR_INIMIGO[c.filhote];if(!base)return;const d=base.def;
  const f=novoInimigo({k:'custom',sec:m.sec,beh:'perseguir',air:true,spr:base.spr,cfg:d,nome:d.nome||d.pasta,maxHp:1,hp:1,vel:Math.max(.2,+d.velocidade||1),hv:m.hv,alc:900,temp:true,mae:m});
  f.sala=m.sala;f.home=m.home;f.cx=m.cx;f.cy=m.cy;f.x=m.x+(lado||m.face)*20;f.y=m.y+16;f.rg=m.rg;f.estado='caca';f.semVer=0;
  const tx=a?a.x:m.x+(lado||1)*200,ty=a?a.y-50:m.y;const dx=tx-f.x,dy=ty-f.y,dd=Math.hypot(dx,dy)||1;f.vx=dx/dd*200+(lado||0)*120;f.vy=dy/dd*200-(lado?80:0);f.face=f.vx>0?1:-1;
  (ENEMIES[m.sec]||(ENEMIES[m.sec]=[])).push(f);voz(m,'ataque')}

/* ---------- vida e morte ---------- */
/* o.tipo: 'golpe' (espada) ou 'magia'; o.dir: para onde empurra; o.baixo: golpe para baixo; o.x: de onde veio */
function ferirInimigo(e,dano,o){
  if(e.dead>0||e.esconde)return'nada';
  const c=e.cfg||{},golpe=o.tipo==='golpe',ox=o.x??PL.x,frente=Math.sign(ox-e.x)===e.face,atacando=e.estado==='atacar'||e.estado==='preparar'||e.estado==='pulo';
  let bloq=false;
  if(e.fechado)bloq=true;
  else if(golpe&&c.imune==='golpe')bloq=true;
  else if(golpe&&c.escudo&&!atacando&&e.estado!=='esquivar'&&e.estado!=='recuperar'){
    if(o.baixo){if(temAnim(e,'defender_cima')&&(e.estado==='caca'||e.estado==='mira')){bloq=true;e.defCima=true}}
    else if(frente){bloq=true;e.defCima=false}}
  if(bloq){e.defT=.3;e.anim='';e.fl=.35;voz(e,'bloqueio');return'bloqueio'}
  e.hp-=dano;e.fl=1;
  if(temAnim(e,'ferido')&&!atacando)e.feridoT=Math.min(.4,duracao(e,'ferido',.25));
  if(!c.pesado&&!['concha','esporo','ogro'].includes(e.beh)){e.kbv=(o.dir||0)*280;if(e.air){e.vx+=(o.dir||0)*220;e.vy-=60}}
  if(e.estado==='dormir')ir(e,'acordar');
  if(e.hp<=0){matarInimigo(e,o.dir||0);return'morte'}
  voz(e,'dano');
  if((e.estado==='patrulha'||e.estado==='virar')&&!e.air)e.face=Math.sign(ox-e.x)||e.face;
  return'acerto'}
function matarInimigo(e,kd){
  e.dead=e.temp?4:22;e.dying=true;e.dieT=0;e.esconde=false;e.fechado=false;e.chaoMorto=false;e.anim='';e.defT=0;e.feridoT=0;
  voz(e,'morte');
  if(e.beh==='mae'){parir(e,alvoAtual(),-1);parir(e,alvoAtual(),1);if(temAnim(e,'explodir'))e.explodiu=true;voz(e,'estouro')}
  if(temAnim(e,'fugir'))e.fugindo=true;e.fugaDir=kd||e.face;
  e.vx=(kd||0)*170;e.vy=e.air?-40:-300}
function explodir(e){if(e.dead>0)return;e.dead=22;e.dying=true;e.dieT=0;e.explodiu=true;e.anim='';e.vx=e.vy=0;voz(e,'explosao');
  shake.t=Math.max(shake.t,.25);shake.a=7;burst(e.x,e.y,'#ffd9a0',24,320);explosaoArea(e.x,e.y,90,e)}
function mortoUpdate(e,dt){e.dieT+=dt;e.dead-=dt;
  if(e.explodiu){e.vis=noCampo(e,.8)&&e.dieT<duracao(e,'explodir',.6)}
  else if(!temAnim(e,'morrer')&&!temAnim(e,'morrer_ar')){e.vis=noCampo(e,.8)&&e.dieT<.7}/* sem animação de morte: some devagar no lugar */
  else if(e.fugindo&&e.dieT>duracao(e,'morrer',.3)){/* o bichinho de dentro foge (Moss Charger) */
    if(!moverChao(e,dt,e.fugaDir*320))e.fugaDir*=-1;e.face=e.fugaDir;e.vis=noCampo(e,.8)&&e.dieT<2.4}
  else{if(!e.chaoMorto){e.vy+=1500*dt;const nx=e.x+e.vx*dt;if(WORLD.dentro(nx,e.y-20))e.x=nx;else e.vx=0;e.y+=e.vy*dt;
      const g=chaoInimigo(e,e.x);if(e.vy>0&&g!=null&&e.y>=g){e.y=g;e.chaoMorto=true;e.vx=0;if(!e.temp)burst(e.x,e.y,'#cfc6b4',5,60)}
      if(e.y>e.sala.y+e.sala.h+400)e.chaoMorto=true}
    e.vis=noCampo(e,.8)&&e.dieT<7}
  if(e.dead<=0){if(e.temp){e.remover=true;e.vis=false;return}
    /* volta só quando o lugar de nascer está fora da tela */
    if(e.home&&Math.abs(e.home.x-CAM.x)<VW*.7&&Math.abs(e.home.y-CAM.y)<VH*.7){e.dead=1;return}
    e.hp=e.maxHp;e.dying=false;e.explodiu=false;e.fugindo=false;e.chaoMorto=false;colocar(e,e.home)}}

/* ajustes de cada comportamento ao nascer (chamado por colocar em js/04-jogo.js) */
function colocarExtra(e){Object.assign(e,{esconde:false,fechado:false,cabecaBaixo:false,fioSolto:false,acordado:false,explodiu:false,fugindo:false,qv:0,feridoT:0,defT:0,parada:0,anim:''});
  switch(e.beh){
  case'emboscar':e.estado='escondido';e.esconde=true;break;
  case'teto':case'aranha':{/* teto alto: fica pendurada mais baixo, num fio comprido */const t=MUNDO.tetoEm(e.sala,e.x),t0=t===t&&t>=e.sala.y?t:e.sala.y;e.teto0=t0;e.top=Math.max(t0+(e.beh==='aranha'?40:50),e.home.y-(e.beh==='aranha'?470:520));e.y=e.top;if(e.beh==='aranha')e.estado='teto';break}
  case'rastejar':if((e.bob*7)%1<.5){const t=tetoInimigo(e,e.x);if(t!=null&&e.home.y-t>170&&e.home.y-t<520){e.cabecaBaixo=true;e.y=t}}break;
  case'saltitar':case'ogro':case'esporo':if(temAnim(e,'dormir'))e.estado='dormir';break;
  case'flutuar':if(e.yf==null)e.y=e.cy-(e.hv||170);break}}

/* ---------- o quadro de cada criatura ---------- */
function atualizarInimigo(e,dt,a){
  if(e.dead>0){mortoUpdate(e,dt);return}
  e.fl=Math.max(0,e.fl-dt*4);e.tE+=dt;e.cd-=dt;e.cd2=(e.cd2||0)-dt;e.andando=false;e.arma=0;e.feridoT=Math.max(0,(e.feridoT||0)-dt);e.defT=Math.max(0,(e.defT||0)-dt);
  if(e.kbv){if(e.air)e.vx+=e.kbv*.6;else if(e.noChao!==false){const nx=e.x+e.kbv*dt;if(podeAndar(e,nx)){e.x=nx;e.y=chaoInimigo(e,nx)??e.y}}e.kbv*=Math.pow(.004,dt);if(Math.abs(e.kbv)<6)e.kbv=0}
  const ve=!e.esconde&&enxerga(e,a),v=e.vel||1,c=e.cfg||{},dx=a?a.x-e.x:0;
  if(ve&&e.semVer>1.5&&DEPOIS_ALERTA[e.beh]&&(e.estado==='patrulha'||e.estado==='virar')){olhar(e,a);if(temAnim(e,'alerta'))ir(e,'alerta');voz(e,'alerta')}
  if(ve)e.semVer=0;else e.semVer+=dt;
  if(e.estado==='alerta'){e.p='alerta';olhar(e,a);if(e.air){e.vx*=Math.pow(.05,dt);e.vy*=Math.pow(.05,dt);moverAr(e,dt)}if(e.tE>=duracao(e,'alerta',.4))ir(e,DEPOIS_ALERTA[e.beh]||'patrulha');return fimInimigo(e,dt,a)}
  switch(e.beh){

  case'andar':patrulha(e,dt,70*v,false);break;

  case'vagar':
    if(e.estado==='preparar'){e.p='preparar';olhar(e,a);if(e.tE>=duracao(e,'preparar',.4)){ir(e,'caca');voz(e,'ataque')}}
    else if(e.estado==='caca'){e.p='atacar';
      /* vira devagar, desajeitado */
      if(a){const lado=a.x>e.x?1:-1;if(lado!==e.face){e.virarT=(e.virarT||0)+dt;if(e.virarT>.5){e.face=lado;e.virarT=0}}else e.virarT=0}
      andarChao(e,dt,125*v*(1+Math.sin(T*8+e.bob)*.35));
      if(e.tE>3.4||e.semVer>1.4)ir(e,'recuperar')}
    else if(e.estado==='recuperar'){e.p='recuperar';if(e.tE>=duracao(e,'recuperar',.5)){e.cd=1.6;ir(e,'patrulha')}}
    else if(ve&&e.cd<=0&&Math.abs(a.y-e.y)<140){olhar(e,a);ir(e,'preparar')}
    else vaguear(e,dt,42*v);break;

  case'investir':{const ate=!!c.ate_parede,vI=(+c.velocidade_investida||1)*(ate?620:480)*v;
    if(e.estado==='preparar'){e.p='preparar';if(e.tE>=duracao(e,'preparar',ate?.55:.35)){ir(e,'atacar');e.vx=e.face*vI;voz(e,'ataque')}}
    else if(e.estado==='atacar'){e.p='atacar';const ok=andarChao(e,dt,Math.abs(e.vx)),passou=a&&(a.x-e.x)*e.face<-150;
      if(!ok||(!ate&&(e.tE>1.3||passou))||e.tE>2.8){ir(e,'recuperar');if(!ok)shake.t=Math.max(shake.t,ate?.1:0)}}
    else if(e.estado==='recuperar'){e.p='recuperar';if(e.tE>=duracao(e,'recuperar',.55)){e.cd=1.2;ir(e,'patrulha');if(ve)olhar(e,a)}}
    else if(ve&&e.cd<=0&&Math.abs(a.y-e.y)<(ate?90:75)){olhar(e,a);ir(e,'preparar');voz(e,'alerta')}
    else patrulha(e,dt,(ate?48:62)*v,true);break}

  case'guarda':{const pes=!!c.pesado,perto=a?Math.abs(dx):1e9,dy=a?a.y-e.y:0,ideal=pes?150:115;
    switch(e.estado){
    case'preparar':e.p=e.prep||'preparar';
      if(e.tE>=duracao(e,e.p,pes?.5:.38)){ir(e,'atacar');voz(e,'ataque');
        if(e.golpe==='estocada')e.vx=e.face*470*v;
        else if(e.golpe==='salto'&&a){saltar(e,clamp((a.x-e.x)*1.5,-460,460),-660);voz(e,'pulo')}
        else e.vx=e.face*150}break;
    case'atacar':e.p=e.atk||'atacar';e.arma=pes?125:95;
      if(e.golpe==='salto'){if(fisicaChao(e,dt)){voz(e,'pouso');shake.t=Math.max(shake.t,.14);shake.a=5;burst(e.x,e.y,'#cfc6b4',10,140);ir(e,'recuperar')}}
      else{andarChao(e,dt,Math.abs(e.vx)*Math.max(0,1-e.tE/.32));
        if(e.tE>=Math.max(.28,duracao(e,e.p,.3))){
          if(e.golpe==='combo'&&e.atk==='atacar'&&temAnim(e,'atacar2')){e.atk='atacar2';e.rec=temAnim(e,'recuperar2')?'recuperar2':'recuperar';e.tE=0;e.anim='';e.vx=e.face*170;voz(e,'ataque')}
          else ir(e,'recuperar')}}break;
    case'recuperar':e.p=e.rec||'recuperar';
      if(e.tE>=duracao(e,e.p,.45)){e.cd=pes?1.2:.95;
        if(!pes&&a&&perto<150&&Math.random()<.55&&temAnim(e,'esquivar')){ir(e,'esquivar');saltar(e,-e.face*380,-420);voz(e,'pulo')}else ir(e,ve?'caca':'patrulha')}break;
    case'esquivar':e.p='esquivar';if(fisicaChao(e,dt))ir(e,'caca');break;
    case'caca':if(!a||(!ve&&e.semVer>2.5)){ir(e,'patrulha');break}olhar(e,a);
      if(e.cd<=0){
        if(pes&&dy<-80&&perto<140&&temAnim(e,'preparar_cima')){Object.assign(e,{golpe:'cima',prep:'preparar_cima',atk:'atacar_cima',rec:'recuperar_cima'});ir(e,'preparar');break}
        if(pes&&perto>240&&perto<440&&Math.abs(dy)<120){Object.assign(e,{golpe:'salto',prep:'preparar',atk:'atacar',rec:'recuperar'});ir(e,'preparar');break}
        if(perto<ideal+45){Object.assign(e,{golpe:pes?'combo':'estocada',prep:'preparar',atk:'atacar',rec:'recuperar'});ir(e,'preparar');break}}
      if(perto>ideal){const corre=perto>330&&temAnim(e,'correr');e.p=corre?'correr':'andar';andarChao(e,dt,(corre?210:85)*v)}else e.p='parado';break;
    default:if(ve&&Math.abs(dy)<170){olhar(e,a);ir(e,'caca')}else patrulha(e,dt,45*v,true)}
    break}

  case'duelista':{const perto=a?Math.abs(dx):1e9,dy=a?a.y-e.y:0;
    switch(e.estado){
    case'preparar':e.p=e.prep||'preparar';if(e.tE>=duracao(e,e.p,.3)){ir(e,'atacar');voz(e,'ataque');if(e.golpe==='corte')e.vx=e.face*580*v}break;
    case'atacar':e.p=e.atk||'atacar';e.arma=90;
      if(e.golpe==='aereo'){if(fisicaChao(e,dt)){voz(e,'pouso');ir(e,'recuperar')}}
      else{if(e.golpe==='corte')andarChao(e,dt,Math.abs(e.vx)*Math.max(0,1-e.tE/.26));if(e.tE>=Math.max(.24,duracao(e,e.p,.24)))ir(e,'recuperar')}break;
    case'pulo':e.p='pular';fisicaChao(e,dt);if(e.vy>-60){Object.assign(e,{golpe:'aereo',atk:'atacar',rec:'recuperar'});ir(e,'atacar');voz(e,'ataque')}break;
    case'recuperar':e.p=e.rec||'recuperar';if(e.tE>=duracao(e,e.p,.32)){e.cd=.6+Math.random()*.5;ir(e,'caca')}break;
    case'recuar':e.p='andar';moverChao(e,dt,-e.face*210*v);if(e.tE>.45)ir(e,'caca');break;
    case'caca':if(!a||(!ve&&e.semVer>2.5)){ir(e,'patrulha');break}olhar(e,a);
      if(perto<85&&e.cd>0){ir(e,'recuar');break}
      if(e.cd<=0){
        if(dy<-90&&perto<130&&temAnim(e,'preparar_cima')){Object.assign(e,{golpe:'cima',prep:'preparar_cima',atk:'atacar_cima',rec:'recuperar_cima'});ir(e,'preparar');break}
        if(perto>210&&perto<450&&Math.random()<.55){saltar(e,clamp((a.x-e.x)*1.25,-540,540),-780);ir(e,'pulo');voz(e,'pulo');break}
        if(perto<230){Object.assign(e,{golpe:'corte',prep:'preparar',atk:'atacar',rec:'recuperar'});ir(e,'preparar');break}}
      if(perto>170){e.p='andar';andarChao(e,dt,190*v)}else e.p='parado';break;
    default:if(ve){olhar(e,a);ir(e,'caca')}else patrulha(e,dt,60*v,true)}
    break}

  case'emboscar':
    switch(e.estado){
    case'surgir':e.p='surgir';e.esconde=false;if(e.tE>=duracao(e,'surgir',.45)){ir(e,'atacar');voz(e,'ataque')}break;
    case'atacar':{e.p=temAnim(e,'correr')?'correr':'andar';const ok=andarChao(e,dt,(+c.velocidade_investida||1)*430*v);
      if(a&&e.tE>.5&&!e.virou&&(a.x-e.x)*e.face<-170&&Math.abs(a.y-e.y)<120){e.face*=-1;e.virou=true}
      if(!ok||e.tE>2.4){ir(e,'sumir');voz(e,'sumir')}break}
    case'sumir':e.p='sumir';if(e.tE>=duracao(e,'sumir',.5)){ir(e,'escondido');e.esconde=true;e.cd=1.8;e.cx=e.x}break;
    default:if(e.estado!=='escondido')ir(e,'escondido');e.esconde=true;e.p='escondido';
      if(a&&e.cd<=0&&Math.abs(a.x-e.x)<(e.alc||300)&&Math.abs(a.y-e.y)<130){olhar(e,a);e.virou=false;e.esconde=false;ir(e,'surgir');voz(e,'surgir');burst(e.x,e.y,'#8a7a5a',10,160)}}
    break;

  case'saltitar':
    if(e.estado==='dormir'){e.p='dormir';if(ve){ir(e,'acordar');voz(e,'acordar')}break}
    if(e.estado==='acordar'){e.p='acordar';if(e.tE>=duracao(e,'acordar',.4))ir(e,'patrulha');break}
    if(e.estado==='preparar'){e.p='preparar';if(e.tE>=duracao(e,'preparar',.25)){ir(e,'atacar');e.vx=e.face*470*v;voz(e,'ataque')}break}
    if(e.estado==='atacar'){e.p='atacar';const ok=andarChao(e,dt,Math.abs(e.vx));if(!ok||e.tE>=Math.max(.55,duracao(e,'atacar',.6)))ir(e,'recuperar');break}
    if(e.estado==='recuperar'){e.p='recuperar';if(e.tE>=duracao(e,'recuperar',.35)){e.cd=1.4;ir(e,'patrulha')}break}
    e.p='parado';
    if(!e.noChao){if(fisicaChao(e,dt)){e.espera=.25+Math.random()*.45;voz(e,'passo',.5)}break}
    if(ve&&e.cd<=0&&Math.abs(dx)<240&&Math.abs(a.y-e.y)<80){olhar(e,a);ir(e,'preparar');break}
    if((e.espera=(e.espera??.4)-dt)<=0){if(ve)olhar(e,a);else if(Math.abs(e.x-e.cx)>e.rg)e.face=e.cx>e.x?1:-1;else if(Math.random()<.3)e.face*=-1;
      const g=chaoInimigo(e,e.x+e.face*90);if(g==null||Math.abs(g-e.y)>50){e.face*=-1;e.espera=.3;break}saltar(e,e.face*150*v,-340)}
    break;

  case'perseguir':
    if(e.estado==='atacar'){e.p='atacar';moverAr(e,dt);if(e.tE>.5){ir(e,'recuperar');e.vx*=.3;e.vy*=.3}}
    else if(e.estado==='recuperar'){e.p='recuperar';e.vx*=Math.pow(.05,dt);e.vy*=Math.pow(.05,dt);moverAr(e,dt);if(e.tE>.5){e.cd=1.6;ir(e,'caca')}}
    else if(e.estado==='preparar'){if(!a){ir(e,'patrulha');break}e.p='preparar';olhar(e,a);e.vx*=Math.pow(.02,dt);e.vy*=Math.pow(.02,dt);moverAr(e,dt);
      if(e.tE>=duracao(e,'preparar',.3)){const tx=a.x,ty=a.y-52,d=Math.hypot(tx-e.x,ty-e.y)||1;e.vx=(tx-e.x)/d*560;e.vy=(ty-e.y)/d*560;ir(e,'atacar');voz(e,'ataque')}}
    else if(a&&(ve||e.temp||(e.estado==='caca'&&e.semVer<2.5))){if(e.estado!=='caca')ir(e,'caca');e.p='andar';const tx=a.x,ty=a.y-52,dir=!!c.direto||e.temp;
      guiar(e,tx,ty,dt,(dir?250:220)*v,dir?1500:760);moverAr(e,dt);olhar(e,a);
      if(temAnim(e,'atacar')&&e.cd<=0&&Math.hypot(tx-e.x,ty-e.y)<240){if(temAnim(e,'preparar'))ir(e,'preparar');else{const d=Math.hypot(tx-e.x,ty-e.y)||1;e.vx=(tx-e.x)/d*560;e.vy=(ty-e.y)/d*560;ir(e,'atacar')}}}
    else{if(e.estado!=='patrulha')ir(e,'patrulha');e.p=temAnim(e,'parado')?'parado':'andar';flutuarEmCasa(e,dt,v)}
    break;

  case'quicar':{e.p='andar';if(!e.qv){e.vx=e.face*125*v;e.vy=(e.bob%2<1?-1:1)*95*v;e.qv=1}
    const s=e.sala,nx=e.x+e.vx*dt,ny=e.y+e.vy*dt;
    if(!livreAr(nx,e.y)||nx<s.x+40||nx>s.x+s.w-40)e.vx=-e.vx;else e.x=nx;
    if(!livreAr(e.x,ny)||ny<s.y+30||ny>s.y+s.h-20)e.vy=-e.vy;else e.y=ny;
    e.face=e.vx>0?1:-1;break}

  case'mergulhar':{const curva=!!c.curva;
    switch(e.estado){
    case'preparar':e.p='preparar';e.vx*=Math.pow(.02,dt);e.vy*=Math.pow(.02,dt);moverAr(e,dt);if(a&&e.tE<duracao(e,'preparar',.45)-.12){olhar(e,a);e.alvoX=a.x;e.alvoY=a.y-42}
      if(e.tE>=duracao(e,'preparar',.45)){ir(e,'atacar');voz(e,'ataque');e.ox=e.x;e.oy=e.y;const ddx=e.alvoX-e.x,ddy=e.alvoY-e.y,d=Math.hypot(ddx,ddy)||1,sp=(+c.velocidade_investida||1)*740;
        e.dur=Math.min(1.1,(d+180)/sp);e.vx=ddx/d*sp;e.vy=ddy/d*sp;e.face=e.vx>0?1:-1}break;
    case'atacar':e.p='atacar';
      if(curva){/* rasante em curva: desce passando pelo ponto do jogador e sobe do outro lado */
        const u=Math.min(1,e.tE/e.dur),ex=e.ox+(e.alvoX-e.ox)*2,ey=e.oy,qx=e.alvoX,qy=e.alvoY+(e.alvoY-e.oy)*.7,
          nx=(1-u)*(1-u)*e.ox+2*(1-u)*u*qx+u*u*ex,ny=(1-u)*(1-u)*e.oy+2*(1-u)*u*qy+u*u*ey;
        if(livreAr(nx,ny)){e.vx=(nx-e.x)/Math.max(dt,1e-3);e.vy=(ny-e.y)/Math.max(dt,1e-3);e.x=nx;e.y=ny;if(Math.abs(e.vx)>20)e.face=e.vx>0?1:-1}else e.tE=e.dur;
        if(u>=1||e.tE>=e.dur){ir(e,'recuperar');e.vx*=.15;e.vy*=.15}}
      else{const nx=e.x+e.vx*dt,ny=e.y+e.vy*dt;if(!livreAr(nx,ny)||e.tE>=e.dur){ir(e,'recuperar');e.vx*=.15;e.vy*=.15;if(!livreAr(nx,ny))burst(e.x,e.y,'#cfc6b4',6,90)}else{e.x=nx;e.y=ny}}break;
    case'recuperar':e.p='recuperar';e.vx*=Math.pow(.05,dt);e.vy*=Math.pow(.05,dt);moverAr(e,dt);if(e.tE>=Math.max(.35,duracao(e,'recuperar',.35))){e.cd=1.3+Math.random()*1.1;ir(e,'subir')}break;
    case'subir':e.p=temAnim(e,'parado')?'parado':'andar';guiar(e,e.cx+Math.sin(T*.3+e.bob)*60,e.cy-(e.hv||200),dt,210,520);moverAr(e,dt);if(ve)olhar(e,a);
      if(e.tE>1.2||Math.abs(e.y-(e.cy-(e.hv||200)))<30)ir(e,ve?'mira':'patrulha');break;
    default:e.p=temAnim(e,'parado')?'parado':'andar';
      if(ve){if(e.estado!=='mira')ir(e,'mira');olhar(e,a);if(c.fica)flutuarEmCasa(e,dt,.3);else pairarPerto(e,dt,a);
        if(e.cd<=0&&Math.hypot(dx,(a.y-40)-e.y)<e.alc){ir(e,'preparar');if(!temAnim(e,'alerta'))voz(e,'alerta')}}
      else{if(e.estado==='mira'&&e.semVer>1.5)ir(e,'patrulha');flutuarEmCasa(e,dt,(c.fica?.3:.7)*v);if(c.fica||!temAnim(e,'parado'))e.p=temAnim(e,'parado')?'parado':'andar'}}
    break}

  case'teto':
    if(e.estado==='preparar'){e.p='preparar';olhar(e,a);if(e.tE>=duracao(e,'preparar',.4)){ir(e,'atacar');voz(e,'ataque');const tx=a?a.x:e.x,ty=a?a.y-30:e.y+400,ddx=tx-e.x,ddy=ty-e.y,d=Math.hypot(ddx,ddy)||1;e.vx=ddx/d*240;e.vy=ddy/d*240}}
    else if(e.estado==='atacar'){e.p='atacar';
      if(temAnim(e,'explodir')){/* mergulha acelerando e explode ao bater */const sp=Math.hypot(e.vx,e.vy)||1,ns=Math.min(800,sp+950*dt);e.vx*=ns/sp;e.vy*=ns/sp;
        const nx=e.x+e.vx*dt,ny=e.y+e.vy*dt;if(!livreAr(nx,ny)||ny>e.sala.y+e.sala.h-12||e.tE>2.2)explodir(e);else{e.x=nx;e.y=ny;if(Math.abs(e.vx)>20)e.face=e.vx>0?1:-1}}
      else{e.vy=Math.min(e.vy+1500*dt,900);e.y+=e.vy*dt;const g=chaoInimigo(e,e.x);if(g!=null&&e.y>=g-24){e.y=g-24;ir(e,'recuperar')}}}
    else if(e.estado==='recuperar'){e.p='recuperar';if(e.tE>.8){e.y-=170*dt;if(e.y<=e.top){e.y=e.top;ir(e,'patrulha');e.cd=1.4}}}
    else{e.p='parado';e.y=e.top+Math.sin(T*1.1+e.bob)*7;olhar(e,a);
      if(a&&e.cd<=0&&Math.abs(dx)<(e.alc||170)+20&&a.y>e.y&&a.y-e.y<900&&linhaLivre(e,a)){ir(e,temAnim(e,'preparar')?'preparar':'atacar');voz(e,'alerta')}}
    break;

  case'aranha':
    if(e.estado==='descer'){e.p='descer';e.vy=Math.min(e.vy+900*dt,440);e.y+=e.vy*dt;const g=chaoInimigo(e,e.x);if(g!=null&&e.y>=g){e.y=g;e.noChao=true;e.vy=0;e.fioSolto=true;ir(e,'caca');voz(e,'pouso',.6)}}
    else if(e.estado==='caca'){e.p='andar';
      if(!e.noChao){if(fisicaChao(e,dt))e.saltoT=.3+Math.random()*.6;break}
      if(a&&ve){const lado=a.x>e.x?1:-1;if(lado!==e.face&&Math.abs(dx)>40+(e.bob%1)*60)e.face=lado}
      if(!andarChao(e,dt,(ve?340:150)*v))e.face*=-1;
      if((e.saltoT=(e.saltoT??.5)-dt)<=0&&ve){e.saltoT=.4+Math.random()*.9;saltar(e,e.face*(250+Math.random()*130)*v*(Math.random()<.25?-1:1),-(240+Math.random()*170));voz(e,'pulo',.5)}}
    else{e.p='parado';e.y=e.top+Math.sin(T*1.3+e.bob)*5;
      if(a&&Math.abs(dx)<(e.alc||320)&&a.y>e.y+40&&a.y-e.y<900&&linhaLivre(e,a)){ir(e,'descer');e.vy=60;voz(e,'fio');voz(e,'alerta')}}
    break;

  case'atirar':
    if(e.estado==='preparar'){e.p='preparar';olhar(e,a);if(e.air)pairar(e,dt,a);if(e.tE>=duracao(e,'preparar',.4)){e.disparou=false;ir(e,'atacar')}}
    else if(e.estado==='atacar'){e.p='atacar';if(e.air)pairar(e,dt,a);const dur=duracao(e,'atacar',.35);if(!e.disparou&&e.tE>=dur*(+c.disparo||0)){e.disparou=true;disparar(e,a)}if(e.tE>=dur){e.cd=+c.recarga||2.2;ir(e,'mira')}}
    else if(e.estado==='esquivar'){e.p='esquivar';if(fisicaChao(e,dt))ir(e,'mira')}
    else if(ve){if(e.estado!=='mira')ir(e,'mira');olhar(e,a);e.p=temAnim(e,'parado')?'parado':'andar';
      if(e.air)pairar(e,dt,a);
      else if(c.recua&&Math.abs(dx)<170){if(temAnim(e,'esquivar')&&e.cd2<=0){ir(e,'esquivar');saltar(e,-e.face*360,-420);e.cd2=1.6;voz(e,'pulo');break}e.p='andar';moverChao(e,dt,-e.face*110*v)}
      if(e.estado==='mira'&&e.cd<=0){e.disparou=false;ir(e,temAnim(e,'preparar')?'preparar':'atacar');voz(e,'alerta',.6)}}
    else{if(e.estado==='mira'&&e.semVer>1.2)ir(e,'patrulha');
      if(e.air){e.p='andar';pairar(e,dt,null)}else if(e.estado==='mira')e.p='parado';else if(c.trabalha){e.p='trabalhar'}else patrulha(e,dt,55*v,true)}
    break;

  case'mae':
    if(e.estado==='atacar'){e.p='atacar';e.vx*=Math.pow(.2,dt);e.vy*=Math.pow(.2,dt);moverAr(e,dt);const dur=duracao(e,'atacar',.6);if(!e.disparou&&e.tE>=dur*.55){e.disparou=true;parir(e,a)}if(e.tE>=dur){e.cd=3.4;ir(e,'patrulha')}}
    else{e.p='andar';flutuarEmCasa(e,dt,.5*v);if(ve){olhar(e,a);if(e.cd<=0&&filhosVivos(e)<3){e.disparou=false;ir(e,'atacar')}}}
    break;

  case'rastejar':
    if(e.estado==='atacar'){e.p='atacar';if(e.tE>=1.2){e.cd=2.4+Math.random()*1.6;ir(e,'patrulha')}break}
    if(e.cabecaBaixo){/* andando no teto, de cabeça para baixo */
      if(e.estado==='virar'){e.p='virar';if(e.tE>=duracao(e,'virar',.22)){e.face*=-1;ir(e,'patrulha')}}
      else{e.p='andar';const nx=e.x+e.face*50*v*dt,t=tetoInimigo(e,nx);if(t==null||Math.abs(t-e.y)>34||!WORLD.dentro(nx+e.face*22,t+30))ir(e,'virar');else{e.x=nx;e.y=t;e.andando=true}}}
    else patrulha(e,dt,50*v,false);
    if(e.cd<=0&&noCampo(e,.6)&&e.estado==='patrulha'){ir(e,'atacar');voz(e,'carga');novoRaio(e,{ang:e.cabecaBaixo?Math.PI/2:-Math.PI/2,aviso:.5,ativo:.6,costas:true})}
    break;

  case'laser':
    if(e.estado==='preparar'){e.p='preparar';if(e.tE>=.7){ir(e,'atacar');voz(e,'laser')}}
    else if(e.estado==='atacar'){e.p='atacar';if(e.tE>=Math.max(.6,duracao(e,'atacar',.6))){e.cd=+c.recarga||2.6;ir(e,'mira')}}
    else if(e.estado==='esquivar'){e.p='esquivar';if(fisicaChao(e,dt))ir(e,'mira')}
    else if(ve){if(e.estado!=='mira')ir(e,'mira');olhar(e,a);e.p='parado';
      if(Math.abs(dx)<120&&temAnim(e,'esquivar')&&e.cd2<=0){ir(e,'esquivar');saltar(e,-e.face*340,-400);e.cd2=2;break}
      if(e.cd<=0){ir(e,'preparar');voz(e,'carga');novoRaio(e,{ang:e.face>0?0:Math.PI,mira:true,aviso:.7,ativo:.55})}}
    else{if(e.estado==='mira'&&e.semVer>1.4)ir(e,'patrulha');if(e.estado!=='mira')patrulha(e,dt,40*v,true);else e.p='parado'}
    break;

  case'concha':{const perto=a?Math.hypot(dx,a.y-e.y):1e9;
    switch(e.estado){
    case'fechar':e.p='fechar';e.fechado=true;if(e.tE>=duracao(e,'fechar',.3))ir(e,'fechado');break;
    case'fechado':e.p='fechado';e.fechado=true;if(perto>300){e.longe=(e.longe||0)+dt;if(e.longe>1.1){ir(e,'abrir');voz(e,'abrir');e.longe=0}}else e.longe=0;break;
    case'abrir':e.p='abrir';if(e.tE>=duracao(e,'abrir',.3)){e.fechado=false;ir(e,'patrulha');e.cd=Math.max(e.cd,.6)}break;
    case'preparar':e.p='preparar';if(e.tE>=duracao(e,'preparar',.35)){if(Math.random()<.6)filhoteRolante(e,a);else if(a){const t=e.cfg.projetil_tipo;e.cfg.projetil_tipo='arco';disparar(e,a);e.cfg.projetil_tipo=t}ir(e,'recuperar')}break;
    case'recuperar':e.p='recuperar';if(e.tE>=duracao(e,'recuperar',.4)){e.cd=2.2;ir(e,'patrulha')}break;
    default:e.p='parado';e.fechado=false;
      if(a&&perto<230){ir(e,'fechar');voz(e,'fechar');break}
      if(ve){olhar(e,a);if(e.cd<=0){ir(e,'preparar');voz(e,'alerta',.6)}}}
    break}

  case'ogro':{const perto=a?Math.abs(dx):1e9;
    switch(e.estado){
    case'dormir':e.p='dormir';if(ve){ir(e,'acordar');voz(e,'acordar')}break;
    case'acordar':e.p='acordar';if(e.tE>=duracao(e,'acordar',.6))ir(e,'caca');break;
    case'preparar':e.p=e.prep;if(e.tE>=duracao(e,e.prep,.5)){ir(e,'atacar');e.disparou=false;e.batT=.12}break;
    case'atacar':e.p=e.atk;
      if(e.golpe==='pancada'){if((e.batT-=dt)<=0){e.batT=.34;voz(e,'pancada');ondaChao(e)}if(e.tE>=1.3)ir(e,'recuperar')}
      else{const dur=duracao(e,e.atk,.45);if(!e.disparou&&e.tE>=dur*.5){e.disparou=true;disparar(e,a)}if(e.tE>=dur)ir(e,'recuperar')}break;
    case'recuperar':e.p=e.rec;if(e.tE>=duracao(e,e.rec,.3)){e.cd=e.golpe==='pancada'?1.2:2.6;ir(e,'caca')}break;
    case'caca':if(!a||(!ve&&e.semVer>4)){e.p='parado';if(e.semVer>8)ir(e,'patrulha');break}olhar(e,a);
      if(perto<150&&Math.abs(a.y-e.y)<120&&e.cd<=.8){Object.assign(e,{golpe:'pancada',prep:'preparar2',atk:'atacar2',rec:'recuperar2'});ir(e,'preparar');break}
      if(e.cd<=0&&perto<e.alc){Object.assign(e,{golpe:'cuspe',prep:'preparar',atk:'atacar',rec:'recuperar'});ir(e,temAnim(e,'preparar')?'preparar':'atacar');e.disparou=false;break}
      if(perto>330){e.p='andar';andarChao(e,dt,58*v)}else e.p='parado';break;
    default:if(ve)ir(e,'caca');else patrulha(e,dt,38*v,true)}
    break}

  case'esporo':
    switch(e.estado){
    case'dormir':e.p='dormir';if(ve){ir(e,'acordar');voz(e,'acordar')}break;
    case'acordar':e.p='acordar';if(e.tE>=duracao(e,'acordar',.4)){ir(e,'mira');e.cd=.5}break;
    case'atacar':{e.p='atacar';const dur=duracao(e,'atacar',.5);if(!e.disparou&&e.tE>=dur*(+c.disparo||.6)){e.disparou=true;disparar(e,a)}if(e.tE>=dur){e.cd=+c.recarga||2.8;ir(e,'mira')}break}
    default:e.p='parado';if(e.estado==='patrulha')e.estado='mira';olhar(e,a);
      if(ve&&e.cd<=0){e.disparou=false;ir(e,'atacar')}
      else if(!ve&&e.semVer>9&&temAnim(e,'dormir'))ir(e,'dormir')}
    break;

  case'nuvem':{const perto=a?Math.hypot(dx,(a.y-40)-e.y):1e9;
    if(e.estado==='preparar'){e.p='preparar';e.vx*=Math.pow(.1,dt);e.vy*=Math.pow(.1,dt);moverAr(e,dt);if(e.tE>=duracao(e,'preparar',.5)){ir(e,'atacar');soltarNuvem(e);voz(e,'nuvem')}}
    else if(e.estado==='atacar'){e.p='atacar';if(e.tE>=Math.max(.35,duracao(e,'atacar',.35)))ir(e,'recuperar')}
    else if(e.estado==='recuperar'){e.p='recuperar';if(e.tE>=Math.max(.45,duracao(e,'recuperar',.45))){e.cd=2.6;ir(e,'patrulha')}}
    else{e.p='andar';flutuarEmCasa(e,dt,.45*v);if(a&&ve)olhar(e,a);if(a&&e.cd<=0&&perto<(e.alc||200))ir(e,'preparar')}
    break}

  case'voar':e.p='andar';voarPatrulha(e,dt,v);break;
  case'pular':pular(e,dt,ve?a:null,v);break;
  case'flutuar':e.p='andar';
    if(e.yf!=null){e.x=e.cx+Math.sin(T*.12+e.bob*3)*120;e.y=e.sala.y+e.sala.h*e.yf+Math.sin(T*.5+e.bob*2)*26}
    else{e.x=e.cx+Math.sin(T*.13+e.bob*3)*70;e.y=e.cy-(e.hv||170)+Math.sin(T*.55+e.bob*2)*38}break;
  default:/* parado: ataca de perto */
    if(e.estado==='atacar'){e.p='atacar';if(e.tE>=duracao(e,'atacar',.5)){e.cd=1.5;ir(e,'patrulha')}}
    else{e.p='parado';if(ve){olhar(e,a);if(e.cd<=0&&temAnim(e,'atacar')&&Math.abs(dx)<170){ir(e,'atacar');voz(e,'ataque')}}}}
  return fimInimigo(e,dt,a)}
function fimInimigo(e,dt,a){e.vis=noCampo(e,.8);
  if(MODE==='play'&&!e.harmless&&e.vis&&AGRESSIVO[e.estado]&&Math.abs(e.x-PL.x)<720&&Math.abs(e.y-PL.y)<460)COMBATE.ultimo=T;
  /* asas: um zumbido baixinho de vez em quando, para quem voa por perto */
  if(e.air&&e.vis&&(e.asaT=(e.asaT??Math.random())-dt)<=0){e.asaT=.45+Math.random()*.4;if(Math.abs(e.x-CAM.x)<520&&typeof vozDe==='function'&&vozDe(e)==='voador')voz(e,'asa',.5)}}
function updateEnemies(dt){const a=alvoAtual(),m=MODE==='play'?1.5:1.1;
  for(let i=0;i<ENEMIES.length;i++)if(ENEMIES[i].some(e=>e.remover))ENEMIES[i]=ENEMIES[i].filter(e=>!e.remover);
  for(const list of ENEMIES)for(const e of list){e.vis=false;const s=e.sala;if(!s)continue;if(Math.abs(s.x+s.w/2-CAM.x)>s.w/2+VW*m||Math.abs(s.y+s.h/2-CAM.y)>s.h/2+VH*m)continue;atualizarInimigo(e,dt,a)}
  atualizarRaios(dt);atualizarNuvens(dt);for(let k=ONDAS.length-1;k>=0;k--){ONDAS[k].t+=dt;if(ONDAS[k].t>.45)ONDAS.splice(k,1)}}

/* que animação mostrar agora */
function papelInimigo(e){
  if(e.dead>0){if(e.explodiu&&temAnim(e,'explodir'))return'explodir';if(e.fugindo&&e.dieT>duracao(e,'morrer',.3)&&temAnim(e,'fugir'))return'fugir';if(!e.chaoMorto&&temAnim(e,'morrer_ar'))return'morrer_ar';return roleOf(e,'morrer')}
  if(e.defT>0)return resolver(e,e.defCima?'defender_cima':'defender');
  if(e.feridoT>0)return'ferido';
  if(e.esconde&&!temAnim(e,'escondido'))return temAnim(e,'surgir')?'surgir':roleOf(e,'parado');
  let p=e.p||'andar';if(p==='andar'&&!e.air&&!e.andando&&e.beh!=='pular'&&e.estado==='patrulha'&&temAnim(e,'parado'))p='parado';
  return resolver(e,p)}

/* ---------- desenho ---------- */
const PARADO_EM_LACO={andar:1,parado:1,dormir:1,fechado:1,escondido:1,trabalhar:1,correr:1,fugir:1};
function desenharInimigo(e){
  const role=papelInimigo(e);if(role!==e.anim){e.anim=role;e.animT0=T}
  const ah=alturaInimigo(e),h=enemyPx(e)*e.spr.refH;
  let t=PARADO_EM_LACO[role]?T+e.bob:T-e.animT0;
  if(e.esconde&&role==='surgir')t=0;/* escondido: o primeiro quadro de surgir (o montinho) */
  /* fio de teia do teto */
  if(e.dead<=0&&((e.beh==='teto'&&e.estado!=='atacar')||(e.beh==='aranha'&&!e.fioSolto))){const topo=e.teto0??e.top-80;
    ac2.strokeStyle='rgba(214,214,196,.42)';ac2.lineWidth=1.5;ac2.beginPath();ac2.moveTo(e.x,topo);ac2.quadraticCurveTo(e.x+Math.sin(T*1.3+e.bob)*3,(topo+e.y)/2,e.x,e.y-ah*.35);ac2.stroke()}
  const semMorte=!temAnim(e,'morrer')&&!temAnim(e,'morrer_ar'),alfa=e.dead>0&&!e.explodiu?(semMorte?clamp(1-e.dieT/.7,0,1):clamp(7-e.dieT,0,1)):1;if(alfa<=0)return null;
  ac2.globalAlpha=alfa;
  const centro=(e.air&&!(e.dead>0&&e.chaoMorto))||(e.dead>0&&e.explodiu);
  if(e.cabecaBaixo&&e.dead<=0){ac2.save();ac2.translate(e.x,e.y);ac2.scale(1,-1);drawSprite(ac2,e.spr,role,t,0,0,e.face,h,e.fl,false);ac2.restore()}
  else drawSprite(ac2,e.spr,role,t,e.x,e.y,e.face,h,e.fl,centro);
  ac2.globalAlpha=1;
  const cy=e.cabecaBaixo?e.y+ah/2:centro?e.y:e.y-ah/2;return[e.x,cy,ah*(e.explodiu?3:1.6),ah*(e.explodiu?3:1.3)]}
/* projéteis com desenho do dono (lança, picareta, esporo…) */
function desenharTirosSprite(caixa){for(const b of shots){if(!b.spr)continue;const cfg=b.spr.cfg||{},h=enemyPx(b.owner)*b.spr.refH;
  if(b.fim!=null){drawSprite(ac2,b.spr,'projetil_fim',b.fim,b.x,b.y,b.vx>=0?1:-1,h,0,true);somaCaixa(caixa,b.x,b.y,240,240);continue}
  const ang=b.gira?b.t*14*Math.sign(b.vx||1):(b.tipo==='esporo'||b.tipo==='arco')?0:Math.atan2(b.vy,b.vx)+(b.esq?Math.PI:0);
  ac2.save();ac2.translate(b.x,b.y);ac2.rotate(ang);drawSprite(ac2,b.spr,'projetil',b.t,0,0,cfg.flip?-1:1,h,0,true);ac2.restore();somaCaixa(caixa,b.x,b.y,260,260)}}
/* o resto, desenhado aqui em tinta: bolas de ácido, filhotes rolando, raios, nuvens e ondas */
function desenharEfeitosInimigos(){
  for(const b of shots){if(b.spr)continue;
    if(b.tipo==='rolante'){fc.save();fc.translate(b.x,b.y);fc.rotate(b.rot);fc.fillStyle='#3a3226';fc.beginPath();fc.arc(0,0,b.r,0,TAU);fc.fill();fc.strokeStyle='#0b0907';fc.lineWidth=2.4;fc.stroke();
      fc.strokeStyle='#7a6a4c';fc.lineWidth=1.6;for(let k=0;k<4;k++){fc.beginPath();fc.arc(0,0,b.r*.72,k*1.57,k*1.57+1.1);fc.stroke()}fc.restore();
      fc.fillStyle='#f4ead0';fc.beginPath();fc.arc(b.x+(b.vx>0?4:-4),b.y-3,2.2,0,TAU);fc.fill();continue}
    const r=b.tipo==='esporo'?11:7;dotAt(b.cor,b.x,b.y,r*4.5,.35);fc.fillStyle=b.cor;fc.beginPath();
    if(b.tipo==='esporo'){for(let k=0;k<9;k++){const a=k/9*TAU+b.t*2,rr=r*(1+.25*Math.sin(k*3+b.t*6));fc.lineTo(b.x+Math.cos(a)*rr,b.y+Math.sin(a)*rr)}fc.closePath()}
    else fc.ellipse(b.x,b.y,r*1.15,r*.9,Math.atan2(b.vy,b.vx),0,TAU);
    fc.fill();fc.strokeStyle='#120d0a';fc.lineWidth=1.8;fc.stroke();fc.fillStyle='rgba(255,250,230,.8)';fc.beginPath();fc.arc(b.x-r*.3,b.y-r*.35,r*.28,0,TAU);fc.fill()}
  for(const R of RAIOS){if(R.ox==null)continue;const x1=R.ox+Math.cos(R.ang)*R.len,y1=R.oy+Math.sin(R.ang)*R.len;fc.save();fc.lineCap='round';
    if(R.t<R.aviso){const q=R.t/R.aviso;fc.strokeStyle=rgba(R.cor,.25+.45*q*(Math.floor(T*20)%2?1:.6));fc.lineWidth=1.2+q*1.6;fc.setLineDash([10,7]);fc.lineDashOffset=-T*60;fc.beginPath();fc.moveTo(R.ox,R.oy);fc.lineTo(x1,y1);fc.stroke();fc.setLineDash([]);dotAt(R.cor,R.ox,R.oy,30+q*30,.4+q*.4)}
    else{const q=1-clamp((R.t-R.aviso)/R.ativo,0,1),w=(18+Math.sin(T*40)*3)*Math.min(1,q*3);fc.globalCompositeOperation='lighter';
      fc.strokeStyle=rgba(R.cor,.28);fc.lineWidth=w*2.2;fc.beginPath();fc.moveTo(R.ox,R.oy);fc.lineTo(x1,y1);fc.stroke();
      fc.strokeStyle=rgba(R.cor,.85);fc.lineWidth=w;fc.stroke();fc.strokeStyle='rgba(255,246,252,.95)';fc.lineWidth=w*.32;fc.stroke();
      fc.globalCompositeOperation='source-over';dotAt(R.cor,x1,y1,60,.6);dotAt(R.cor,R.ox,R.oy,50,.7)}
    fc.restore()}
  for(const n of NUVENS){const q=n.t/n.dur,a=q<.15?q/.15:Math.max(0,1-(q-.15)/.85),e=n.e;
    if(e.spr&&e.spr.anims.nuvem){fc.globalAlpha=a;drawSprite(fc,e.spr,'nuvem',n.t,n.x,n.y,1,enemyPx(e)*e.spr.refH,0,true);fc.globalAlpha=1}
    else{const R=n.r*(.6+.4*Math.min(1,q*3));for(let k=0;k<9;k++){const ang=k/9*TAU+n.t*.6,x=n.x+Math.cos(ang)*R*.55,y=n.y+Math.sin(ang)*R*.4,rr=R*(.32+.08*Math.sin(k*5+n.t*3));
      fc.fillStyle=`rgba(190,170,110,${a*.38})`;fc.beginPath();fc.arc(x,y,rr,0,TAU);fc.fill();fc.strokeStyle=`rgba(40,30,15,${a*.5})`;fc.lineWidth=1.4;fc.stroke()}}}
  for(const o of ONDAS){const q=o.t/.45;fc.strokeStyle=`rgba(230,215,180,${(1-q)*.6})`;fc.lineWidth=3;for(const s of[-1,1]){fc.beginPath();fc.ellipse(o.x+s*q*130,o.y,22+q*20,8,0,Math.PI,0);fc.stroke()}}}

/* ---------- dano: o corpo, a arma e os golpes do jogador ---------- */
function contatoInimigos(){for(const list of ENEMIES)for(const e of list){if(!e.vis||e.dead>0||e.k==='jelly'||e.harmless||e.esconde)continue;const b=enemyBox(e);
  if(Math.abs(b.x-PL.x)<b.hw+11&&Math.abs(b.y-(PL.y-24))<b.hh+24){if(e.beh==='teto'&&e.estado==='atacar'&&temAnim(e,'explodir')){explodir(e);return}hurtPlayer(e);return}
  if(e.arma){const r=e.arma,wx=e.x+e.face*(b.hw+r*.45);if(Math.abs(wx-PL.x)<r*.5+11&&Math.abs(b.y-(PL.y-30))<b.hh+30){hurtPlayer(e);return}}}}
/* golpe da espada: fere, bate no escudo ou quebra esporos e filhotes rolando */
function golpearInimigos(box,d,f){let hit=false,bloq=false;
  for(const list of ENEMIES)for(const e of list){if(!e.vis||e.dead>0||e.k==='jelly'||e.esconde)continue;const b=enemyBox(e);
    if(Math.abs(b.x-box.x)<b.hw+box.hw&&Math.abs(b.y-box.y)<b.hh+box.hh){const kd=d===0?f:(e.x>PL.x?1:-1),r=ferirInimigo(e,1,{tipo:'golpe',dir:kd,baixo:d>0,x:PL.x});
      if(r==='nada')continue;hit=true;
      if(r==='bloqueio'){bloq=true;burst((b.x+PL.x)/2,b.y,'#fff4d6',10,260);continue}
      PL.luz=Math.min(LUZ_MAX,PL.luz+LUZ_POR_ACERTO);if(!spawnFx('efeito_acerto',b.x,b.y,f))burst(b.x,b.y,lcOf(e.sec),14,240);sfx('acerto');
      if(r==='morte'){burst(b.x,b.y,'#ffffff',26,340);sfx('inimigo_morre');if(!e.temp)dropFrags(b.x,b.y,3+(Math.random()*3|0))}}}
  for(let k=shots.length-1;k>=0;k--){const s=shots[k];if(!s.quebra||s.fim!=null)continue;if(Math.abs(s.x-box.x)<box.hw+s.r&&Math.abs(s.y-box.y)<box.hh+s.r){hit=true;acabarTiro(s,k,true)}}
  if(bloq){sfx('bloqueio');hitstop=.09;if(d===0)PL.vx=-f*460}
  return hit}
