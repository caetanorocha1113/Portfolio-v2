const TAU=Math.PI*2;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
function rng(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function hx(h){h=h.replace('#','');return[parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)]}
function rgba(h,a){const[r,g,b]=hx(h);return`rgba(${r},${g},${b},${a})`}
function mix(h1,h2,t){const a=hx(h1),b=hx(h2);return'#'+a.map((v,i)=>Math.round(v+(b[i]-v)*t).toString(16).padStart(2,'0')).join('')}
function noise(r){const v=Array.from({length:512},r);return x=>{const i=Math.floor(x),f=x-i,a=v[((i%512)+512)%512],b=v[(((i+1)%512)+512)%512],t=(1-Math.cos(f*Math.PI))/2;return a+(b-a)*t}}
function edgeFn(r,y,amp,freq){const n=noise(r);return x=>y+(n(x/freq)-.5)*amp*2+(n(x/(freq*.22)+77)-.5)*amp*.5}

/* ---------- painting kit ---------- */
function vfill(c,x,y,w,h,stops){const g=c.createLinearGradient(0,y,0,y+h);stops.forEach(s=>g.addColorStop(s[0],s[1]));c.fillStyle=g;c.fillRect(x,y,w,h)}
function glow(c,x,y,rad,col,a){if(rad<=0)return;const g=c.createRadialGradient(x,y,0,x,y,rad);g.addColorStop(0,rgba(col,a));g.addColorStop(.22,rgba(col,a*.45));g.addColorStop(.6,rgba(col,a*.1));g.addColorStop(1,rgba(col,0));c.save();c.globalCompositeOperation='lighter';c.fillStyle=g;c.fillRect(x-rad,y-rad,rad*2,rad*2);c.restore()}
function fog(c,w,y,bh,col,a){const g=c.createLinearGradient(0,y-bh/2,0,y+bh/2);g.addColorStop(0,rgba(col,0));g.addColorStop(.5,rgba(col,a));g.addColorStop(1,rgba(col,0));c.fillStyle=g;c.fillRect(0,y-bh/2,w,bh)}
function rays(c,r,w,h,n,col,a,o={}){c.save();c.globalCompositeOperation='screen';c.filter='blur(7px)';const len=h*(o.len??.9),top=o.top??0;for(let i=0;i<n;i++){const x=(o.x0??0)*w+r()*w*(o.span??1),bw=w*(.015+r()*.045),sk=(o.skew??.12)*h,aa=a*(.5+r()*.7);const g=c.createLinearGradient(0,top,0,len);g.addColorStop(0,rgba(col,aa));g.addColorStop(.55,rgba(col,aa*.35));g.addColorStop(1,rgba(col,0));c.fillStyle=g;c.beginPath();c.moveTo(x,top);c.lineTo(x+bw,top);c.lineTo(x+bw*2+sk,len);c.lineTo(x-bw*.6+sk,len);c.closePath();c.fill()}c.restore()}
function raysUp(c,r,w,h,n,col,a){c.save();c.globalCompositeOperation='screen';c.filter='blur(10px)';const ox=w*.5,oy=h*1.05;for(let i=0;i<n;i++){const ang=-Math.PI/2+(r()-.5)*1.3,sp=.03+r()*.06,L=h*(.7+r()*.5);const g=c.createRadialGradient(ox,oy,0,ox,oy,L);const aa=a*(.5+r()*.6);g.addColorStop(0,rgba(col,aa));g.addColorStop(1,rgba(col,0));c.fillStyle=g;c.beginPath();c.moveTo(ox,oy);c.lineTo(ox+Math.cos(ang-sp)*L,oy+Math.sin(ang-sp)*L);c.lineTo(ox+Math.cos(ang+sp)*L,oy+Math.sin(ang+sp)*L);c.closePath();c.fill()}c.restore()}
function ridge(c,r,w,h,y,amp,freq,col){const f=edgeFn(r,y,amp,freq);c.fillStyle=col;pathBottom(c,w,h,f);c.fill();return f}
function pathTop(c,w,f){c.beginPath();c.moveTo(-20,-20);c.lineTo(w+20,-20);for(let x=w+20;x>=-20;x-=6)c.lineTo(x,f(x));c.closePath()}
function pathBottom(c,w,h,f){c.beginPath();c.moveTo(-20,h+20);for(let x=-20;x<=w+20;x+=6)c.lineTo(x,f(x));c.lineTo(w+20,h+20);c.closePath()}
function pathSide(c,w,h,f,left){c.beginPath();if(left){c.moveTo(-20,-20);for(let y=-20;y<=h+20;y+=6)c.lineTo(f(y),y);c.lineTo(-20,h+20)}else{c.moveTo(w+20,-20);for(let y=-20;y<=h+20;y+=6)c.lineTo(w-f(y),y);c.lineTo(w+20,h+20)}c.closePath()}
function strokeEdge(c,w,f,col,lw){c.strokeStyle=col;c.lineWidth=lw;c.beginPath();for(let x=-20;x<=w+20;x+=6){x<=-20?c.moveTo(x,f(x)):c.lineTo(x,f(x))}c.stroke()}
function archPath(c,x,y,w,h){const sh=Math.min(h,w*.95);c.moveTo(x,y);c.lineTo(x,y-h+sh);c.quadraticCurveTo(x,y-h+sh*.22,x+w/2,y-h);c.quadraticCurveTo(x+w,y-h+sh*.22,x+w,y-h+sh);c.lineTo(x+w,y);c.closePath()}

function cobbles(c,r,x0,y0,x1,y1,P,size){
  for(let y=y0-size*.5;y<y1+size;y+=size*.78){
    for(let x=x0-size+r()*size;x<x1+size;x+=size*(.75+r()*.5)){
      const rad=size*(.42+r()*.32),cx=x+(r()-.5)*size*.35,cy=y+(r()-.5)*size*.3;
      c.fillStyle=mix(P.base,P.dark,r()*.45);c.beginPath();c.ellipse(cx,cy,rad,rad*(.78+r()*.25),r()*3,0,TAU);c.fill();
      c.strokeStyle=P.dark;c.lineWidth=Math.max(1.5,size*.07);c.stroke();
      c.strokeStyle=rgba(P.light,.16+r()*.12);c.lineWidth=Math.max(1,size*.05);c.beginPath();c.arc(cx,cy,rad*.72,Math.PI*1.08,Math.PI*1.6);c.stroke();
    }
  }
}
function rockMass(c,r,pathFn,bbox,P,size){c.save();pathFn();c.fillStyle=P.base;c.fill();c.clip();cobbles(c,r,bbox[0],bbox[1],bbox[2],bbox[3],P,size);c.restore()}
function rockPile(c,r,x,y,rad,P,n=24){
  c.fillStyle=P.dark;c.beginPath();c.ellipse(x,y+rad*.5,rad*1.3,rad*.75,0,0,TAU);c.fill();
  const st=[];for(let i=0;i<n;i++){const a=Math.PI+r()*Math.PI,d=Math.sqrt(r())*rad;st.push([x+Math.cos(a)*d*1.25,y+Math.sin(a)*d*.95+rad*.25,rad*(.13+r()*.2),r()])}
  st.sort((a,b)=>a[1]-b[1]).forEach(([cx,cy,s,k])=>{c.fillStyle=mix(P.base,P.dark,k*.5);c.beginPath();c.ellipse(cx,cy,s,s*.84,k*3,0,TAU);c.fill();c.strokeStyle=P.dark;c.lineWidth=Math.max(2,s*.08);c.stroke();c.strokeStyle=rgba(P.light,.2);c.lineWidth=Math.max(1,s*.06);c.beginPath();c.arc(cx,cy,s*.72,Math.PI*1.1,Math.PI*1.55);c.stroke()})
}
function spikes(c,r,w,f,col,n,maxL,down){c.fillStyle=col;for(let i=0;i<n;i++){const x=r()*w,y=f(x)+(down?-4:4),L=maxL*(.25+r()*.75),wd=L*(.14+r()*.14),bend=(r()-.5)*L*.15,d=down?1:-1;c.beginPath();c.moveTo(x-wd/2,y);c.quadraticCurveTo(x-wd*.2+bend*.5,y+d*L*.6,x+bend,y+d*L);c.quadraticCurveTo(x+wd*.2+bend*.5,y+d*L*.6,x+wd/2,y);c.closePath();c.fill()}}
function foliage(c,r,x,y,rad,cols,dens=1,fl){
  const n=Math.round(22*dens);
  c.fillStyle=cols[0];for(let i=0;i<n;i++){const a=r()*TAU,d=Math.sqrt(r())*rad;c.beginPath();c.arc(x+Math.cos(a)*d*1.25,y+Math.sin(a)*d*.72,rad*(.2+r()*.24),0,TAU);c.fill()}
  for(let k=1;k<cols.length;k++){const m=Math.round(n*(1.5+k*1.1));c.fillStyle=cols[k];
    for(let i=0;i<m;i++){const a=r()*TAU,d=Math.sqrt(r())*rad*(1.02-k*.13);const px=x+Math.cos(a)*d*1.22-rad*.07*k,py=y+Math.sin(a)*d*.7-rad*.13*k;if(py>y+rad*(.42-k*.12))continue;const s=rad*(.045+r()*.075)*(1-k*.08);c.beginPath();c.ellipse(px,py,s*1.25,s,r()*3,0,TAU);c.fill()}}
  if(fl){for(let i=0;i<n*1.3;i++){const a=r()*TAU,d=Math.sqrt(r())*rad;const px=x+Math.cos(a)*d*1.2,py=y+Math.sin(a)*d*.7-rad*.05;c.fillStyle=r()<.5?fl[0]:fl[1];c.beginPath();c.arc(px,py,Math.max(1,rad*(.018+r()*.03)),0,TAU);c.fill()}}
}
function grass(c,r,x0,x1,yf,col,hmin,hmax,step){const Y=typeof yf==='function'?yf:()=>yf;c.strokeStyle=col;c.lineCap='round';for(let x=x0;x<x1;x+=step*(.4+r())){const y=Y(x)+2,hh=hmin+r()*(hmax-hmin),b=(r()-.5)*hh*.7;c.lineWidth=1+r()*2.2;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+b*.15,y-hh*.6,x+b,y-hh);c.stroke()}}
function branch(c,r,x,y,len,ang,wd,depth){if(depth<=0||len<3)return;const x2=x+Math.cos(ang)*len,y2=y+Math.sin(ang)*len;c.lineWidth=Math.max(.8,wd);c.lineCap='round';c.beginPath();c.moveTo(x,y);c.quadraticCurveTo((x+x2)/2+(r()-.5)*len*.35,(y+y2)/2,x2,y2);c.stroke();const n=r()<.35?3:2;for(let i=0;i<n;i++)branch(c,r,x2,y2,len*(.58+r()*.2),ang+(r()-.5)*1.15,wd*.62,depth-1)}
function vine(c,r,x,y,len,col,leaf,u){c.strokeStyle=col;c.lineWidth=1.3*u;c.beginPath();c.moveTo(x,y);const ph=r()*10;let px=x,py=y;for(let t=0;t<len;t+=6){py=y+t;px=x+Math.sin(t*.03+ph)*5*u;c.lineTo(px,py)}c.stroke();c.fillStyle=leaf;for(let t=6;t<len;t+=7*u+r()*6){const vy=y+t,vx=x+Math.sin(t*.03+ph)*5*u,s=(t%2?1:-1);c.beginPath();c.ellipse(vx+s*3*u,vy,3.4*u,1.7*u,s*.6,0,TAU);c.fill()}}
function lamp(c,x,y,hh,iron,gc,u,orb){c.strokeStyle=iron;c.fillStyle=iron;c.lineWidth=3*u;c.beginPath();c.moveTo(x,y);c.lineTo(x,y-hh);c.stroke();c.fillRect(x-6*u,y-9*u,12*u,9*u);c.lineWidth=1.8*u;c.beginPath();c.arc(x+7*u,y-hh*.72,6*u,Math.PI,Math.PI*2.5);c.stroke();c.beginPath();c.arc(x-7*u,y-hh*.72,6*u,Math.PI*.5,Math.PI*2,true);c.stroke();const oy=y-hh-10*u;glow(c,x,oy,hh*.95,gc,.32);glow(c,x,oy,26*u,gc,.75);c.fillStyle=orb||gc;c.beginPath();c.arc(x,oy,8.5*u,0,TAU);c.fill();c.fillStyle=iron;c.beginPath();c.moveTo(x-10*u,oy-6*u);c.lineTo(x,oy-17*u);c.lineTo(x+10*u,oy-6*u);c.closePath();c.fill()}
function chain(c,x0,y0,x1,y1,col,u){c.strokeStyle=col;c.lineWidth=1.4*u;const L=Math.hypot(x1-x0,y1-y0),n=Math.floor(L/(6*u));for(let i=0;i<n;i++){const t=i/n,x=lerp(x0,x1,t),y=lerp(y0,y1,t);c.beginPath();c.ellipse(x,y+3*u,i%2?1.2*u:2.4*u,3.2*u,0,0,TAU);c.stroke()}}
function hangLantern(c,x,y,u,col,frame){c.fillStyle=frame;c.beginPath();c.moveTo(x-7*u,y);c.lineTo(x+7*u,y);c.lineTo(x+4*u,y-6*u);c.lineTo(x-4*u,y-6*u);c.fill();glow(c,x,y+11*u,150*u,col,.3);glow(c,x,y+11*u,26*u,col,.85);c.fillStyle=mix(col,'#ffffff',.45);c.beginPath();c.moveTo(x-7*u,y);c.lineTo(x+7*u,y);c.lineTo(x+6*u,y+20*u);c.lineTo(x-6*u,y+20*u);c.closePath();c.fill();c.strokeStyle=frame;c.lineWidth=1.6*u;c.beginPath();c.moveTo(x,y);c.lineTo(x,y+20*u);c.stroke();c.fillStyle=frame;c.fillRect(x-8*u,y+20*u,16*u,3*u)}

function lume(c,x,y,s,lc,face=1){
  c.save();c.translate(x,y);c.scale(s*face,s);
  c.fillStyle='rgba(0,0,0,.5)';c.beginPath();c.ellipse(0,0,17,3.2,0,0,TAU);c.fill();
  c.fillStyle='#14101a';c.fillRect(-5,-3,3,3);c.fillRect(2,-3,3,3);
  c.fillStyle='#2b2236';c.beginPath();c.moveTo(-12,-2);c.bezierCurveTo(-17,-14,-12,-27,-6,-31);c.lineTo(6,-31);c.bezierCurveTo(12,-27,17,-14,12,-2);c.quadraticCurveTo(7,-5,3,-2);c.quadraticCurveTo(0,-4,-3,-2);c.quadraticCurveTo(-7,-5,-12,-2);c.closePath();c.fill();
  c.strokeStyle='#4b3c5a';c.lineWidth=1.2;c.beginPath();c.moveTo(-4,-29);c.quadraticCurveTo(-8,-15,-7,-4);c.stroke();c.beginPath();c.moveTo(3,-29);c.quadraticCurveTo(5,-16,4,-4);c.stroke();
  c.fillStyle='#e9e1cf';for(let i=-3;i<=3;i++){c.beginPath();c.arc(i*3.3,-31+Math.abs(i)*.9,3.9,0,TAU);c.fill()}
  c.fillStyle='#c8bead';for(let i=-2;i<=2;i++){c.beginPath();c.arc(i*3.7,-29+Math.abs(i)*.7,2.1,0,TAU);c.fill()}
  c.fillStyle='#1b1622';c.beginPath();c.ellipse(0,-41,9.6,9.2,0,0,TAU);c.fill();
  c.fillStyle='#e9e1cf';for(let i=-2;i<=2;i++){c.beginPath();c.arc(i*3,-49.5+Math.abs(i)*1.1,2.5,0,TAU);c.fill()}
  c.strokeStyle='#ddd3bf';c.lineWidth=1.3;c.lineCap='round';
  for(const d of[-1,1]){const P0=[d*2.5,-50],P1=[d*7,-62],P2=[d*16,-66];c.beginPath();c.moveTo(...P0);c.quadraticCurveTo(...P1,...P2);c.stroke();c.lineWidth=.8;
    for(let t=.18;t<.98;t+=.11){const mt=1-t,px=mt*mt*P0[0]+2*mt*t*P1[0]+t*t*P2[0],py=mt*mt*P0[1]+2*mt*t*P1[1]+t*t*P2[1],L=2.6*(1-t*.5);c.beginPath();c.moveTo(px,py);c.lineTo(px-d*L*.5,py-L);c.moveTo(px,py);c.lineTo(px+d*L*.9,py+L*.2);c.stroke()}c.lineWidth=1.3}
  c.fillStyle='#ffd27a';c.beginPath();c.ellipse(-3.7,-41,2.1,3.1,-.15,0,TAU);c.fill();c.beginPath();c.ellipse(3.7,-41,2.1,3.1,.15,0,TAU);c.fill();
  c.fillStyle='#fff6dc';c.fillRect(-4.3,-43,1,1.2);c.fillRect(3.1,-43,1,1.2);
  c.strokeStyle='#3b304a';c.lineWidth=2.2;c.beginPath();c.moveTo(8,-19);c.lineTo(19,-35);c.stroke();
  c.strokeStyle='#8f8169';c.lineWidth=.9;c.beginPath();c.moveTo(19,-35);c.lineTo(20,-29);c.stroke();
  c.fillStyle='#3b304a';c.fillRect(17.3,-29.5,5.4,1.6);c.fillRect(17.3,-20.5,5.4,1.6);
  c.fillStyle=mix(lc,'#ffffff',.5);c.beginPath();c.ellipse(20,-24.6,2.9,4,0,0,TAU);c.fill();
  c.restore();
  const lx=x+20*s*face,ly=y-24.6*s;glow(c,lx,ly,120*s,lc,.28);glow(c,lx,ly,22*s,lc,.9);glow(c,x,y-41*s,10*s,'#ffd27a',.35);
}
function house(c,r,x,y,ww,hh,P,u){c.save();c.translate(x+ww/2,y);c.rotate((r()-.5)*.08);
  c.fillStyle=P.wall;c.fillRect(-ww/2,-hh,ww,hh+10);
  c.strokeStyle='rgba(0,0,0,.28)';c.lineWidth=1;for(let yy=-hh+8*u;yy<0;yy+=9*u){c.beginPath();c.moveTo(-ww/2,yy);c.lineTo(ww/2,yy);c.stroke()}
  const rh=hh*(.9+r()*.8),pk=(r()-.5)*ww*.2;c.fillStyle=P.roof;c.beginPath();c.moveTo(-ww/2-9*u,-hh+5);c.quadraticCurveTo(pk-ww*.18,-hh-rh*.45,pk,-hh-rh);c.quadraticCurveTo(pk+ww*.18,-hh-rh*.45,ww/2+9*u,-hh+5);c.closePath();c.fill();
  c.fillRect(pk-1*u,-hh-rh-12*u,2*u,12*u);
  if(r()<.75){c.fillRect(ww*.18,-hh-rh*.62,10*u,rh*.45);}
  const nw=1+Math.floor(r()*2.4);for(let i=0;i<nw;i++){const wx=-ww/2+ww*(i+1)/(nw+1)-7*u,wy=-hh*.78,lit=r()<.8;c.fillStyle=lit?P.warm:'#090c13';c.beginPath();archPath(c,wx,wy+24*u,14*u,24*u);c.fill();if(lit){glow(c,wx+7*u,wy+12*u,60*u,P.warm,.3);c.strokeStyle=P.wall;c.lineWidth=2*u;c.beginPath();c.moveTo(wx+7*u,wy+2*u);c.lineTo(wx+7*u,wy+24*u);c.moveTo(wx,wy+14*u);c.lineTo(wx+14*u,wy+14*u);c.stroke()}}
  c.fillStyle='#06080d';c.beginPath();archPath(c,ww*.12,0,17*u,32*u);c.fill();
  c.restore()}
function tower(c,r,x,y,tw,th,P,u,det){
  c.fillStyle=P.body;c.fillRect(x-tw/2,y-th,tw,th+6);c.fillRect(x-tw*.62,y-th*.32,tw*1.24,th*.32+6);
  const sh=tw*(1.5+r()*1.8);c.beginPath();c.moveTo(x-tw/2-2,y-th);c.quadraticCurveTo(x-tw*.08,y-th-sh*.55,x,y-th-sh);c.quadraticCurveTo(x+tw*.08,y-th-sh*.55,x+tw/2+2,y-th);c.closePath();c.fill();
  c.fillRect(x-1*u,y-th-sh-16*u,2*u,16*u);c.beginPath();c.arc(x,y-th-sh-16*u,2.5*u,0,TAU);c.fill();
  for(const d of[-1,1]){const sx=x+d*tw/2;c.beginPath();c.moveTo(sx-4*u,y-th+3);c.lineTo(sx,y-th-tw*.75);c.lineTo(sx+4*u,y-th+3);c.fill()}
  const cols=Math.max(1,Math.round(tw/(17*u))),rows=Math.floor((th*.95)/(40*u));
  for(let j=0;j<rows;j++){
    if(det){c.fillStyle=P.ledge||P.body;c.fillRect(x-tw/2-3*u,y-th+j*40*u+4*u,tw+6*u,2.5*u)}
    for(let i=0;i<cols;i++){const ww=tw/cols*.46,wh=24*u,wx=x-tw/2+(i+.5)*tw/cols-ww/2,wy=y-th+12*u+j*40*u,lit=r()<P.lit;c.fillStyle=lit?P.win:P.dark;c.beginPath();archPath(c,wx,wy+wh,ww,wh);c.fill();if(lit&&det){glow(c,wx+ww/2,wy+wh*.6,ww*2.6,P.win,.2)}}}
  c.fillStyle=P.body}
function facade(c,r,x,y,fw,fh,P,u){
  c.fillStyle=P.wall;c.fillRect(x,y-fh,fw,fh);
  const floors=2,flh=fh/floors;
  for(let f=0;f<floors;f++){const by=y-f*flh,n=Math.max(3,Math.round(fw/(115*u))),cw=fw/n;
    for(let i=0;i<n;i++){const wx=x+i*cw+cw*.2,ww=cw*.6,wh=flh*.72,wb=by-flh*.1;
      c.fillStyle=P.dark;c.beginPath();archPath(c,wx,wb,ww,wh);c.fill();
      glow(c,wx+ww/2,wb-wh*.5,ww*.9,P.glow,.07);
      c.strokeStyle=P.drape;for(let k=0;k<7;k++){const dx=wx+ww*(.08+.84*r());c.lineWidth=(1+r()*3.5)*u;c.beginPath();c.moveTo(dx,wb-wh*.86);c.quadraticCurveTo(dx+(r()-.5)*6*u,wb-wh*.5,dx+(r()-.5)*4*u,wb-wh*(.05+r()*.45));c.stroke()}
      c.strokeStyle=rgba(P.wallL,.55);c.lineWidth=2*u;c.beginPath();archPath(c,wx,wb,ww,wh);c.stroke();
      c.beginPath();c.moveTo(wx+ww/2,wb);c.lineTo(wx+ww/2,wb-wh*.66);c.stroke();
      c.fillStyle=P.wallL;c.fillRect(x+i*cw-4*u,by-flh,8*u,flh);c.fillRect(x+i*cw-8*u,by-flh,16*u,6*u)}
    c.fillStyle=P.wallL;c.fillRect(x+fw-4*u,by-flh,8*u,flh);
    c.fillStyle=P.wallL;c.fillRect(x-12*u,by-flh-6*u,fw+24*u,11*u);c.fillStyle=P.dark;c.fillRect(x-12*u,by-flh+5*u,fw+24*u,3*u)}
  c.fillStyle=P.wall;for(let i=0;i<8;i++){const bx=x+r()*fw,bw=(20+r()*60)*u,bh=(10+r()*40)*u;c.fillRect(bx,y-fh-bh,bw,bh)}
}
function bridge(c,r,x0,x1,y,depth,P,u){
  c.fillStyle=P.stone;c.fillRect(x0,y,x1-x0,depth);
  const span=170*u;for(let x=x0+span*.15;x<x1;x+=span){const cx=x+span*.5,ar=span*.42,ay=y+depth*.95;
    c.fillStyle=P.dark;c.beginPath();c.arc(cx,ay,ar,Math.PI,0);c.closePath();c.fill();
    c.strokeStyle=P.rib;c.lineWidth=2*u;for(let k=0;k<=8;k++){const a=Math.PI+k/8*Math.PI;c.beginPath();c.moveTo(cx,ay);c.lineTo(cx+Math.cos(a)*ar*.92,ay+Math.sin(a)*ar*.92);c.stroke()}
    c.lineWidth=3*u;c.beginPath();c.arc(cx,ay,ar*.92,Math.PI,0);c.stroke();c.beginPath();c.arc(cx,ay,ar*.45,Math.PI,0);c.stroke();
    c.lineWidth=5*u;c.strokeStyle=P.ledge;c.beginPath();c.arc(cx,ay,ar+3*u,Math.PI,0);c.stroke()}
  c.fillStyle=P.ledge;c.fillRect(x0,y-3*u,x1-x0,12*u);c.fillStyle=P.dark;c.fillRect(x0,y+9*u,x1-x0,3*u);
  c.strokeStyle=rgba(P.dark,.7);c.lineWidth=1;for(let x=x0;x<x1;x+=26*u){c.beginPath();c.moveTo(x,y-3*u);c.lineTo(x,y+9*u);c.stroke()}
}
function crystal(c,x,y,len,wd,ang,P){c.save();c.translate(x,y);c.rotate(ang);const g=c.createLinearGradient(-wd/2,0,wd/2,0);g.addColorStop(0,P.d);g.addColorStop(.45,P.l);g.addColorStop(.55,P.m);g.addColorStop(1,P.d);c.fillStyle=g;c.beginPath();c.moveTo(-wd/2,4);c.lineTo(-wd/2,-len*.74);c.lineTo(0,-len);c.lineTo(wd/2,-len*.74);c.lineTo(wd/2,4);c.closePath();c.fill();c.strokeStyle=rgba(P.d,.9);c.lineWidth=1.4;c.stroke();c.fillStyle=rgba('#ffffff',.35);c.beginPath();c.moveTo(-wd*.12,0);c.lineTo(-wd*.12,-len*.76);c.lineTo(0,-len*.97);c.lineTo(wd*.05,-len*.76);c.lineTo(wd*.05,0);c.fill();c.restore()}
function cluster(c,r,x,y,size,ang,P,n,ga=.32){glow(c,x+Math.sin(ang)*size*.5,y-Math.cos(ang)*size*.5,size*1.8,P.g,ga);const arr=[];for(let i=0;i<n;i++)arr.push([x+(r()-.5)*size*.5,y+(r()-.5)*size*.15,size*(.35+r()*.75),size*(.12+r()*.1),ang+(r()-.5)*1.15]);arr.sort((a,b)=>a[2]-b[2]).reverse().forEach(a=>crystal(c,a[0],a[1],a[2],a[3],a[4],P))}
function mushroom(c,r,x,y,hh,cw,P,lean,ga=.3){const tx=x+lean*hh,ty=y-hh;
  c.fillStyle=P.stem;c.beginPath();c.moveTo(x-cw*.1,y);c.quadraticCurveTo(x+lean*hh*.3-cw*.07,y-hh*.5,tx-cw*.055,ty);c.lineTo(tx+cw*.055,ty);c.quadraticCurveTo(x+lean*hh*.3+cw*.07,y-hh*.5,x+cw*.1,y);c.closePath();c.fill();
  c.strokeStyle=rgba('#000000',.25);c.lineWidth=1;for(let k=0;k<4;k++){const ox=(r()-.5)*cw*.08;c.beginPath();c.moveTo(x+ox,y);c.quadraticCurveTo(x+lean*hh*.3+ox,y-hh*.5,tx+ox*.6,ty);c.stroke()}
  if(r()<.6){c.fillStyle=P.gill;c.beginPath();c.ellipse(lerp(x,tx,.55),lerp(y,ty,.55),cw*.13,cw*.03,0,0,TAU);c.fill()}
  glow(c,tx,ty+cw*.08,cw*.9,P.glow,ga);
  c.fillStyle=P.gill;c.beginPath();c.ellipse(tx,ty,cw/2,cw*.075,0,0,TAU);c.fill();
  c.strokeStyle=rgba(P.capLight,.35);c.lineWidth=1;for(let k=0;k<14;k++){const gx=tx-cw*.45+cw*.9*k/13;c.beginPath();c.moveTo(tx,ty-2);c.lineTo(gx,ty+cw*.05);c.stroke()}
  const g=c.createLinearGradient(0,ty-cw*.42,0,ty);g.addColorStop(0,P.capLight);g.addColorStop(1,P.cap);c.fillStyle=g;
  c.beginPath();c.moveTo(tx-cw/2,ty);c.bezierCurveTo(tx-cw*.5,ty-cw*.55,tx+cw*.5,ty-cw*.55,tx+cw/2,ty);c.quadraticCurveTo(tx,ty-cw*.07,tx-cw/2,ty);c.fill();
  c.fillStyle=rgba(P.spot||'#ffffff',.5);for(let k=0;k<5;k++){const a=-Math.PI*(.15+r()*.7),d=cw*(.15+r()*.25);c.beginPath();c.ellipse(tx+Math.cos(a)*d*1.5,ty-cw*.12+Math.sin(a)*d*.55,cw*.025*(1+r()),cw*.018*(1+r()),0,0,TAU);c.fill()}
}
function web(c,cx,cy,rad,sp,a0,a1,col,lw){const A=[];for(let i=0;i<=sp;i++)A.push(a0+(a1-a0)*i/sp);c.strokeStyle=col;c.lineWidth=lw;A.forEach(a=>{c.beginPath();c.moveTo(cx,cy);c.lineTo(cx+Math.cos(a)*rad,cy+Math.sin(a)*rad);c.stroke()});
  for(let k=1;k<=11;k++){const rr=rad*Math.pow(k/11,1.1);c.beginPath();A.forEach((a,i)=>{const px=cx+Math.cos(a)*rr,py=cy+Math.sin(a)*rr;if(!i)c.moveTo(px,py);else{const m=(a+A[i-1])/2;c.quadraticCurveTo(cx+Math.cos(m)*rr*.86,cy+Math.sin(m)*rr*.86,px,py)}});c.stroke()}}
function eyes(c,x,y,s,col,a){glow(c,x,y,22*s,col,a*.35);c.fillStyle=rgba(col,a);for(const d of[-1,1]){c.beginPath();c.moveTo(x+d*1.5*s,y);c.quadraticCurveTo(x+d*4*s,y-2.4*s,x+d*7*s,y-1*s);c.quadraticCurveTo(x+d*4.5*s,y+1.8*s,x+d*1.5*s,y);c.fill()}}
function tendril(c,r,x,y,len,ang,wd,col,rim){const pts=[];let px=x,py=y,a=ang;const ph=r()*10;for(let t=0;t<=1;t+=.04){pts.push([px,py,wd*(1-t)]);a+=Math.sin(t*6+ph)*.08;px+=Math.cos(a)*len*.04;py+=Math.sin(a)*len*.04}
  c.fillStyle=col;for(const p of pts){c.beginPath();c.arc(p[0],p[1],Math.max(.6,p[2]/2),0,TAU);c.fill()}
  if(rim){c.strokeStyle=rim;c.lineWidth=1;c.beginPath();pts.forEach((p,i)=>{const X=p[0]-p[2]/2,Y=p[1];i?c.lineTo(X,Y):c.moveTo(X,Y)});c.stroke()}}
function thornVine(c,r,x,y,len,ang,col,u){c.strokeStyle=col;c.fillStyle=col;let px=x,py=y,a=ang;const ph=r()*9;c.lineWidth=3*u;for(let t=0;t<len;t+=8*u){const nx=px+Math.cos(a)*8*u,ny=py+Math.sin(a)*8*u;c.lineWidth=Math.max(1,4*u*(1-t/len));c.beginPath();c.moveTo(px,py);c.lineTo(nx,ny);c.stroke();if(r()<.45){const s=r()<.5?1:-1,ta=a+s*1.2,tl=(5+r()*7)*u*(1-t/len*.6);c.beginPath();c.moveTo(nx+Math.cos(a)*2*u,ny+Math.sin(a)*2*u);c.lineTo(nx+Math.cos(ta)*tl,ny+Math.sin(ta)*tl);c.lineTo(nx-Math.cos(a)*2*u,ny-Math.sin(a)*2*u);c.fill()}a+=Math.sin(t*.02+ph)*.12;px=nx;py=ny}}
function scaffold(c,x,y,sw,sh,col,u){c.strokeStyle=col;c.lineCap='butt';c.lineWidth=8*u;[0,.5,1].forEach(f=>{c.beginPath();c.moveTo(x+sw*f,y+10*u);c.lineTo(x+sw*f,y-sh);c.stroke()});c.lineWidth=7*u;[0,.5,1].forEach(f=>{c.beginPath();c.moveTo(x-12*u,y-sh*f);c.lineTo(x+sw+12*u,y-sh*f);c.stroke()});c.lineWidth=5*u;c.beginPath();c.moveTo(x,y);c.lineTo(x+sw*.5,y-sh*.5);c.moveTo(x+sw*.5,y-sh*.5);c.lineTo(x+sw,y-sh);c.moveTo(x+sw,y);c.lineTo(x+sw*.5,y-sh*.5);c.stroke();c.fillStyle=rgba('#000000',.4);for(const fy of[0,.5,1])for(const fx of[0,.5,1]){c.beginPath();c.arc(x+sw*fx,y-sh*fy,2*u,0,TAU);c.fill()}}
