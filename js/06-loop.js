/* ---------- loop: update the game and the camera, then paint world, particles, characters and minimap ---------- */
const regPeso=REGS.map(()=>0);
let last=performance.now(),T=0,miniT=0;
function frame(now){
  /* while the opening covers the screen, the world waits (the opening stays smooth) */
  if(document.documentElement.classList.contains('abertura-cobrindo')){last=now;requestAnimationFrame(frame);return}
  const dt=Math.min(.05,(now-last)/1000);last=now;T+=dt;
  const cur=clamp(game(dt)|0,0,REGS.length-1);
  if(cur!==lastIdx){const antes=lastIdx;lastIdx=cur;musicRegion(cur);maxIdx=Math.max(maxIdx,cur);hudRegiao(cur);mapEls.forEach((a,i)=>{a.classList.toggle('on',i===cur);a.classList.toggle('visto',i<=maxIdx)});
    if(MODE==='play'&&antes>=0)mostrarTituloArea(cur)}
  const hy=MODE==='play'?PL.y:L.y,prof=Math.max(0,hy)/10;
  const light=MODE==='play'?PL.luz/LUZ_MAX:1-clamp(prof/1100,0,1)*.82;hudLuz(light);
  desenharMundo(true);
  /* weather of the current region (screen space), cross-faded between regions */
  fc.setTransform(FD,0,0,FD,0,0);fc.globalCompositeOperation='source-over';fc.globalAlpha=1;fc.clearRect(0,0,FW,FH);
  for(let i=0;i<regPeso.length;i++)regPeso[i]+=((i===cur?1:0)-regPeso[i])*Math.min(1,dt*1.2);
  pools.forEach((list,i)=>{const a=regPeso[i];if(a<.01)return;list.forEach(({type,arr})=>{const D=FX[type];fc.globalCompositeOperation=D.glow?'lighter':'source-over';
    for(const p of arr){if(!reduce){D.step(p,dt,T);if(!D.static){if(p.y>FH+30){p.y=-30;p.x=R()*FW}else if(p.y<-30){p.y=FH+30;p.x=R()*FW}if(p.x>FW+30)p.x=-30;else if(p.x<-30)p.x=FW+30}}D.draw(fc,p,a,T)}})});
  fc.globalAlpha=1;fc.globalCompositeOperation='source-over';
  drawGame();fc.globalAlpha=1;fc.globalCompositeOperation='source-over';
  hudDesenhar(dt);
  musicaJogo(dt);sonsDoPersonagem();
  if((miniT+=dt)>.12){miniT=0;desenharMinimapa(MODE==='play'?PL.x:L.x,hy,cur)}
  requestAnimationFrame(frame)}

let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>{initFx();CAM.ok=false},180)});
