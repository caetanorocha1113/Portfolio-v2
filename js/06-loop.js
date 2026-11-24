/* ---------- loop ---------- */
const weights=new Array(secs.length).fill(0);
let last=performance.now(),T=0,dirty=true;
function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;T+=dt;const vh=innerHeight;let rendered=false,cur=0,curF=0;
  secs.forEach((s,i)=>{const b=s.getBoundingClientRect();rects[i]=b;weights[i]=clamp((Math.min(b.bottom,vh)-Math.max(b.top,0))/vh,0,1);
    const near=b.bottom>-vh*1.2&&b.top<vh*2.2;if(near&&!drawn[i]&&!rendered){renderSection(i);rendered=true}
    else if(drawn[i]&&!(b.bottom>-vh*4&&b.top<vh*5))release(i);
    if(b.top<=vh*.5){cur=i;curF=clamp((vh*.5-b.top)/b.height,0,1)}
    if(weights[i]>0&&!reduce){const t=clamp(((b.top+b.height/2)-vh/2)/((vh+b.height)/2),-1,1),H=b.height,L=layers[i];
      L.back.style.transform=`translate3d(0,${(-t*.075*H).toFixed(1)}px,0)`;L.front.style.transform=`translate3d(0,${(t*.045*H).toFixed(1)}px,0)`;midOff[i]=0}});
  // HUD
  const d=cur<depths.length-1?lerp(depths[cur],depths[cur+1],curF):depths[cur]+curF*420;
  hudDepth.textContent=(d<1?'0':'−'+Math.round(d).toLocaleString('pt-BR'))+' m';
  if(cur!==lastIdx){lastIdx=cur;musicRegion(cur);maxIdx=Math.max(maxIdx,cur);hudRegion.textContent=roman[cur]+' · '+secs[cur].dataset.name;mapEls.forEach((a,i)=>a.classList.toggle('on',i===cur));pipEls.forEach((p,i)=>p.classList.toggle('on',i<=maxIdx))}
  const light=1-clamp(d/3260,0,1)*.82;vfillEl.setAttribute('y',(17+(1-light)*30).toFixed(1));
  // particles
  fc.setTransform(FD,0,0,FD,0,0);fc.globalCompositeOperation='source-over';fc.globalAlpha=1;fc.clearRect(0,0,FW,FH);
  pools.forEach((list,i)=>{const a=weights[i];if(a<.01)return;list.forEach(({type,arr})=>{const D=FX[type];fc.globalCompositeOperation=D.glow?'lighter':'source-over';
    for(const p of arr){if(!reduce){D.step(p,dt,T);if(!D.static){if(p.y>FH+30){p.y=-30;p.x=R()*FW}else if(p.y<-30){p.y=FH+30;p.x=R()*FW}if(p.x>FW+30)p.x=-30;else if(p.x<-30)p.x=FW+30}}D.draw(fc,p,a,T)}})});
  fc.globalAlpha=1;fc.globalCompositeOperation='source-over';
  game(dt);fc.globalAlpha=1;fc.globalCompositeOperation='source-over';
  requestAnimationFrame(frame)}

let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>{buildRoute();secs.forEach((s,i)=>{if(drawn[i])renderSection(i)});initFx()},180)});
