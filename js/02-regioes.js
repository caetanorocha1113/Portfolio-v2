/* ---------- regions (themes) ----------
   Eight painted themes. Each section of the portfolio picks one by name (data-tema), in conteudo/portfolio.json.
   TEMA_IDS gives the name of each entry of REG, in the same order. */
const TEMA_IDS=['cinzaraiz','galerias','sendas','brejo','cidadela','minas','ninho','fosso'];
const REG=[
/* I · Cinzaraiz */ {fx:[['ash',70,'#d9deea'],['drizzle',60,'#c6d2ec']],p:{top:'#090e1d',bot:'#2b3754',far:'#1e2840',far2:'#161e31',mid:'#0f141e',near:'#04060a',light:'#cdd8ee',warm:'#f4c97a',moon:'#e8eefc',wall:'#1a2132',roof:'#0c111b'},
 back(c,w,h,r,u,P){vfill(c,0,0,w,h,[[0,P.top],[.5,'#18213a'],[.78,P.bot],[1,P.bot]]);
  for(let i=0;i<220;i++){const s=r()*1.4+.3;c.fillStyle=rgba(P.light,r()*.6+.1);c.fillRect(r()*w,r()*h*.55,s,s)}
  const mx=w*.77,my=h*.2;glow(c,mx,my,h*.45,P.moon,.2);glow(c,mx,my,110*u,P.moon,.45);
  c.save();c.fillStyle=P.moon;c.beginPath();c.arc(mx,my,38*u,0,TAU);c.fill();c.clip();c.fillStyle=rgba('#93a2c4',.35);for(let i=0;i<6;i++){c.beginPath();c.arc(mx+(r()-.5)*60*u,my+(r()-.5)*60*u,(4+r()*9)*u,0,TAU);c.fill()}c.restore();
  c.save();c.filter='blur(16px)';for(let i=0;i<12;i++){c.fillStyle=rgba('#394766',.3+r()*.3);c.beginPath();c.ellipse(r()*w,h*(.08+r()*.38),(120+r()*300)*u,(12+r()*26)*u,0,0,TAU);c.fill()}c.restore();
  rays(c,r,w,h,4,P.moon,.06,{x0:.55,span:.4,skew:-.2,len:.75});
  ridge(c,r,w,h,h*.55,55*u,360*u,P.far2);fog(c,w,h*.6,h*.12,'#4a5878',.32);
  const f2=edgeFn(r,h*.64,24*u,300*u);c.fillStyle=P.far;pathBottom(c,w,h,f2);c.fill();
  for(let i=0;i<18;i++){const x=r()*w,y=f2(x)+6,hw=(14+r()*24)*u,hh=(16+r()*26)*u;c.fillStyle=P.far;c.fillRect(x,y-hh,hw,hh+6);c.beginPath();c.moveTo(x-3,y-hh);c.lineTo(x+hw/2+(r()-.5)*6,y-hh-hh*(.6+r()*.9));c.lineTo(x+hw+3,y-hh);c.fill();if(r()<.7){c.fillStyle=rgba(P.warm,.85);c.fillRect(x+hw*.38,y-hh*.62,3*u,4*u);glow(c,x+hw*.45,y-hh*.55,16*u,P.warm,.28)}}
  fog(c,w,h*.71,h*.14,'#55658a',.26)},
 mid(c,w,h,r,u,P){const G=edgeFn(r,h*.8,14*u,520*u);this.G=G;
  c.strokeStyle='#0d121b';[[.08,1.15],[.92,1.2],[.3,.7]].forEach(([fx,sc])=>{const x=w*fx;branch(c,r,x,G(x)+6,150*u*sc,-Math.PI/2+(r()-.5)*.25,13*u*sc,7)});
  [[.0,125],[.15,95],[.65,130],[.81,105]].forEach(([fx,ww])=>{const x=w*fx;house(c,r,x,G(x+ww*u/2)+8,ww*u,(90+r()*55)*u,P,u)});
  const g=c.createLinearGradient(0,h*.76,0,h);g.addColorStop(0,'#141a26');g.addColorStop(1,P.near);c.fillStyle=g;pathBottom(c,w,h,G);c.fill();
  strokeEdge(c,w,G,rgba(P.light,.12),1.5*u);
  // well
  const wx=w*.5,wy=G(wx)+4;c.fillStyle=P.wall;c.fillRect(wx-32*u,wy-32*u,64*u,32*u);c.strokeStyle='rgba(0,0,0,.4)';c.lineWidth=1;for(let yy=wy-26*u;yy<wy;yy+=8*u){c.beginPath();c.moveTo(wx-32*u,yy);c.lineTo(wx+32*u,yy);c.stroke()}
  c.fillStyle='#020306';c.beginPath();c.ellipse(wx,wy-32*u,32*u,7*u,0,0,TAU);c.fill();glow(c,wx,wy-36*u,70*u,'#7f9cff',.22);
  c.fillStyle=P.roof;c.fillRect(wx-30*u,wy-92*u,5*u,60*u);c.fillRect(wx+25*u,wy-92*u,5*u,60*u);c.beginPath();c.moveTo(wx-44*u,wy-88*u);c.lineTo(wx,wy-118*u);c.lineTo(wx+44*u,wy-88*u);c.closePath();c.fill();c.strokeStyle='#5a5f6a';c.lineWidth=1;c.beginPath();c.moveTo(wx,wy-88*u);c.lineTo(wx,wy-55*u);c.stroke();c.fillStyle=P.roof;c.fillRect(wx-6*u,wy-56*u,12*u,10*u);
  [.3,.6,.74].forEach(fx=>{const x=w*fx;lamp(c,x,G(x)+4,(70+r()*25)*u,'#0a0d14',P.warm,u,'#fff0c8')});
  for(let i=0;i<5;i++){const x=w*(.86+r()*.12),y=G(x)+4,gh=(16+r()*14)*u;c.fillStyle='#232b3c';c.save();c.translate(x,y);c.rotate((r()-.5)*.3);c.beginPath();c.moveTo(-7*u,0);c.lineTo(-7*u,-gh+7*u);c.arc(0,-gh+7*u,7*u,Math.PI,0);c.lineTo(7*u,0);c.fill();c.restore()}
  c.strokeStyle='#101521';c.lineWidth=3*u;for(let x=w*.2;x<w*.28;x+=12*u){c.beginPath();c.moveTo(x,G(x)+4);c.lineTo(x+(r()-.5)*3,G(x)-24*u);c.stroke()}c.beginPath();c.moveTo(w*.2,G(w*.2)-14*u);c.lineTo(w*.28,G(w*.28)-16*u);c.stroke();
  0;
  grass(c,r,0,w,G,'#1a2232',5*u,18*u,4*u)},
 front(c,w,h,r,u,P){const F=edgeFn(r,h*.94,20*u,240*u);
  c.strokeStyle=P.near;branch(c,r,-60*u,h,h*.26,-Math.PI/2+.12,40*u,6);
  c.save();c.translate(w,0);c.scale(-1,1);branch(c,r,-20*u,h,h*.22,-Math.PI/2+.15,32*u,6);c.restore();
  for(let x=-40*u;x<w+60*u;x+=(70+r()*80)*u)foliage(c,r,x,F(x)-10*u,(40+r()*50)*u,[P.near,'#0a0e16','#111827'],.9);
  c.fillStyle=P.near;pathBottom(c,w,h,F);c.fill();grass(c,r,0,w,F,P.near,20*u,60*u,4*u)}},

/* II · Galerias de Âmbar */ {fx:[['motes',50,'#ffb05a'],['dust',45,'#9fb3c4']],p:{top:'#0a1016',bot:'#1e2a35',far:'#24323f',farD:'#151e27',mid:'#16202a',near:'#06090c',light:'#a8bccd',amber:'#f2a145',wood:'#3b2c22'},
 back(c,w,h,r,u,P){vfill(c,0,0,w,h,[[0,P.top],[1,P.bot]]);
  c.save();c.globalAlpha=.6;cobbles(c,r,0,0,w,h,{base:P.far,dark:P.farD,light:P.light},50*u);c.restore();
  vfill(c,0,0,w,h,[[0,rgba(P.top,.92)],[.3,rgba(P.top,.3)],[.7,rgba(P.top,.3)],[1,rgba(P.top,.92)]]);
  [[.18,.5,150],[.5,.47,210],[.83,.55,135]].forEach(([fx,fy,sz])=>{const x=w*fx,y=h*fy,s=sz*u;c.fillStyle='#04070a';c.beginPath();c.moveTo(x-s*.55,y+s*.6);c.lineTo(x-s*.55,y);c.ellipse(x,y,s*.55,s*.7,0,Math.PI,0);c.lineTo(x+s*.55,y+s*.6);c.closePath();c.fill();glow(c,x,y+s*.35,s*1.1,P.amber,.2);for(let k=0;k<13;k++){const a=Math.PI+k/12*Math.PI;c.fillStyle=mix(P.far,P.light,.2);c.beginPath();c.ellipse(x+Math.cos(a)*s*.62,y+Math.sin(a)*s*.78,s*.09,s*.07,a,0,TAU);c.fill();c.strokeStyle=P.farD;c.lineWidth=2;c.stroke()}});
  fog(c,w,h*.64,h*.22,'#3b4e60',.32);rays(c,r,w,h,5,'#a9c0d4',.07,{x0:.05,span:.9,skew:.06,len:.85})},
 mid(c,w,h,r,u,P){const C=edgeFn(r,h*.16,32*u,220*u),G=edgeFn(r,h*.8,10*u,420*u);this.G=G;this.C=C;
  rockMass(c,r,()=>pathTop(c,w,C),[0,0,w,h*.28],{base:P.mid,dark:'#090d12',light:P.light},34*u);spikes(c,r,w,C,P.mid,26,90*u,true);
  [.14,.4,.7,.9].forEach(fx=>{const x=w*fx,y0=C(x)-6,len=(70+r()*150)*u;chain(c,x,y0,x,y0+len,'#2d3a46',u);hangLantern(c,x,y0+len,u*1.1,P.amber,'#1b140f')});
  scaffold(c,w*.56,G(w*.56)+4,230*u,190*u,P.wood,u);c.fillStyle=P.wood;c.fillRect(w*.56-14*u,G(w*.56)+4-190*u*.5-6*u,258*u,9*u);
  rockMass(c,r,()=>pathBottom(c,w,h,G),[0,h*.74,w,h],{base:'#18222c',dark:'#090d12',light:P.light},30*u);strokeEdge(c,w,G,rgba(P.light,.35),2*u);
  spikes(c,r,w,G,'#18222c',10,40*u,false);
  const sx=w*.26,sy=G(sx)+4;c.fillStyle=P.wood;c.fillRect(sx-3*u,sy-88*u,6*u,88*u);c.beginPath();c.moveTo(sx-4*u,sy-82*u);c.lineTo(sx+46*u,sy-82*u);c.lineTo(sx+56*u,sy-73*u);c.lineTo(sx+46*u,sy-64*u);c.lineTo(sx-4*u,sy-64*u);c.fill();c.beginPath();c.moveTo(sx+4*u,sy-56*u);c.lineTo(sx-42*u,sy-56*u);c.lineTo(sx-52*u,sy-47*u);c.lineTo(sx-42*u,sy-38*u);c.lineTo(sx+4*u,sy-38*u);c.fill();
  c.fillStyle=rgba(P.amber,.55);c.fillRect(sx+8*u,sy-75*u,30*u,2*u);c.fillRect(sx-38*u,sy-49*u,28*u,2*u);
  const bx=w*.8,by=G(bx)+3,bs=u*1.2;c.fillStyle='#0b1015';c.beginPath();c.ellipse(bx,by-22*bs,38*bs,24*bs,0,Math.PI,0);c.fill();c.fillStyle='#1d2833';c.beginPath();c.ellipse(bx-4*bs,by-30*bs,26*bs,10*bs,-.1,Math.PI,0);c.fill();c.fillStyle='#0b1015';c.beginPath();c.ellipse(bx+34*bs,by-16*bs,12*bs,10*bs,0,0,TAU);c.fill();for(let k=0;k<4;k++){c.strokeStyle='#0b1015';c.lineWidth=3*bs;c.beginPath();c.moveTo(bx-24*bs+k*16*bs,by-22*bs);c.lineTo(bx-30*bs+k*16*bs,by);c.stroke()}eyes(c,bx+37*bs,by-18*bs,.7*bs,'#ffe7c0',.9);
  c.fillStyle='#2a2018';c.fillRect(bx-40*bs,by-70*bs,70*bs,26*bs);c.strokeStyle='#14100c';c.lineWidth=2;c.strokeRect(bx-40*bs,by-70*bs,70*bs,26*bs);
  0;
  grass(c,r,0,w,G,'#253240',4*u,14*u,9*u)},
 front(c,w,h,r,u,P){const pal={base:'#0c1117',dark:'#030507',light:'#4a5e70'};rockPile(c,r,-40*u,h*.97,300*u,pal,30);rockPile(c,r,w+40*u,h*.94,330*u,pal,30);
  const F=edgeFn(r,h*.97,10*u,200*u);c.fillStyle=pal.dark;pathBottom(c,w,h,F);c.fill();spikes(c,r,w,F,pal.dark,18,110*u,false);
  for(let i=0;i<9;i++){c.strokeStyle='#05080b';c.lineWidth=(2+r()*5)*u;c.beginPath();const x=r()*w*.3;c.moveTo(x,-10);c.bezierCurveTo(x+(r()-.5)*60*u,h*.06,x+(r()-.5)*80*u,h*.1,x+(r()-.5)*40*u,h*(.08+r()*.1));c.stroke()}}},

/* III · Sendas do Musgo */ {fx:[['leaves',30,'#4fae74'],['fireflies',45,'#d6ff8a']],p:{top:'#03111a',bot:'#0b3436',far:'#0f3a3d',far2:'#0a2a2f',wall:'#103535',wallL:'#1d5650',dark:'#031214',drape:'#1a4a47',glow:'#8ff0b8',flower:'#6f63e0',flower2:'#a9a5ff',light:'#c6f5dc'},
 back(c,w,h,r,u,P){vfill(c,0,0,w,h,[[0,P.top],[.45,'#072528'],[1,P.bot]]);glow(c,w*.5,h*.45,h*.65,'#2fa88a',.16);
  for(let i=0;i<5;i++){const x=w*(i/5)+(r()-.5)*80*u,fw=(180+r()*160)*u,fh=h*(.3+r()*.25),y=h*.85;c.fillStyle=P.far2;c.fillRect(x,y-fh,fw,fh);const n=3;for(let k=0;k<n;k++){c.fillStyle='#061a1e';c.beginPath();archPath(c,x+fw*(k+.2)/n,y-fh*.45,fw/n*.6,fh*.38);c.fill()}c.fillStyle=P.far2;c.fillRect(x-8*u,y-fh-6*u,fw+16*u,8*u)}
  for(let i=0;i<26;i++)foliage(c,r,r()*w,h*(.12+r()*.45),(50+r()*90)*u,['#06201f','#0b302d','#124139'],.9,r()<.5?['#3c3a8a','#5450b0']:null);
  rays(c,r,w,h,6,'#c6f5dc',.13,{x0:.02,span:.9,skew:.07,len:.98});
  fog(c,w,h*.55,h*.25,'#2c7a6c',.22);fog(c,w,h*.82,h*.2,'#1e6058',.3)},
 mid(c,w,h,r,u,P){this.G=()=>h*.78-2*u;this.C=()=>h*.3;const G=h*.78,leaf=['#06201f','#0e3b33','#1d6a4f','#4fae74','#a8e6a0'],fl=[P.flower,P.flower2];
  facade(c,r,w*.06,G,w*.88,h*.48,P,u);
  for(let x=w*.03;x<w*.98;x+=(55+r()*45)*u)foliage(c,r,x,G-h*.48+(r()-.5)*20*u,(38+r()*40)*u,leaf,1,fl);
  for(let x=w*.05;x<w*.95;x+=(70+r()*80)*u)foliage(c,r,x,G-h*.24,(26+r()*24)*u,leaf,.8,r()<.7?fl:null);
  for(let i=0;i<30;i++){const x=w*(.06+r()*.88);vine(c,r,x,G-h*(r()<.5?.48:.24)+6*u,(30+r()*120)*u,'#1d5a44','#3f9a6a',u)}
  rays(c,r,w,h,3,'#d9fff0',.08,{x0:.2,span:.6,skew:.05,len:.9});
  bridge(c,r,-10,w+10,G,h*.26,{stone:'#0a2427',ledge:'#1d4f4a',dark:'#020a0b',rib:'#245a53'},u);
  grass(c,r,0,w,G-2*u,'#14503f',8*u,30*u,4*u);grass(c,r,0,w,G-2*u,'#2c8a5e',6*u,18*u,9*u);
  for(let i=0;i<14;i++){const x=r()*w;foliage(c,r,x,G-8*u,(10+r()*14)*u,['#0a2d26','#1d6a4f','#4fae74'],.6,fl)}
  for(let i=0;i<10;i++){const x=r()*w,y=G-(6+r()*20)*u;glow(c,x,y,18*u,'#9d97ff',.5)}
  0},
 front(c,w,h,r,u,P){const cols=['#010807','#03110f','#061b18'];
  for(let x=-60*u;x<w+80*u;x+=(60+r()*70)*u)foliage(c,r,x,h*(.9+r()*.06),(70+r()*70)*u,cols,1.2);
  c.fillStyle=cols[0];c.fillRect(0,h*.97,w,h*.03);
  for(let i=0;i<12;i++){const x=r()<.5?r()*w*.25:w-r()*w*.25;foliage(c,r,x,h*(.0+r()*.07),(50+r()*60)*u,cols,1)}
  c.strokeStyle=cols[0];c.lineCap='round';for(let i=0;i<60;i++){const x=r()<.5?r()*w*.22:w-r()*w*.22,L=(80+r()*200)*u,b=(r()-.5)*L*.5;c.lineWidth=(2+r()*4)*u;c.beginPath();c.moveTo(x,h);c.quadraticCurveTo(x+b*.2,h-L*.6,x+b,h-L);c.stroke()}}},

/* IV · Brejo dos Esporos */ {fx:[['spores',95,'#ffd27a']],p:{top:'#140b07',bot:'#3f2410',far:'#4a2c15',far2:'#36200f',mid:'#21130a',near:'#0b0603',orange:'#e88a3c',orangeL:'#ffc074',teal:'#3cb3a3',tealL:'#a5f3e2',acid:'#9cff5a',stem:'#d8c3a0'},
 back(c,w,h,r,u,P){vfill(c,0,0,w,h,[[0,P.top],[.5,'#2a170b'],[1,P.bot]]);glow(c,w*.5,h*.6,h*.7,P.orange,.13);
  for(let i=0;i<10;i++){const x=r()*w,hh=h*(.25+r()*.4),cw=(120+r()*240)*u;mushroom(c,r,x,h*.92,hh,cw,{stem:P.far2,cap:P.far,capLight:mix(P.far,P.orange,.3),gill:P.far2,glow:P.orange,spot:P.orangeL},(r()-.5)*.25,.1)}
  for(let i=0;i<40;i++){const x=r()*w,L=(40+r()*200)*u;c.strokeStyle=rgba('#2a170b',.9);c.lineWidth=(1+r()*3)*u;c.beginPath();c.moveTo(x,0);c.quadraticCurveTo(x+(r()-.5)*20*u,L*.5,x+(r()-.5)*10*u,L);c.stroke();glow(c,x,L,8*u,P.orangeL,.4)}
  fog(c,w,h*.65,h*.3,'#a2582a',.2)},
 mid(c,w,h,r,u,P){const C=edgeFn(r,h*.1,26*u,200*u),G=edgeFn(r,h*.81,26*u,300*u);this.G=G;this.C=C;
  c.fillStyle=P.mid;pathTop(c,w,C);c.fill();
  for(let i=0;i<55;i++){const x=r()*w,y=C(x)-4,L=(20+r()*120)*u;c.strokeStyle=P.mid;c.lineWidth=(1.5+r()*3)*u;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+(r()-.5)*16*u,y+L*.5,x+(r()-.5)*8*u,y+L);c.stroke();glow(c,x,y+L,10*u,r()<.5?P.orangeL:P.tealL,.55)}
  const tp={stem:'#7fb8ad',cap:'#1f7f74',capLight:P.tealL,gill:'#0d3b36',glow:P.teal,spot:'#e0fff8'},op={stem:P.stem,cap:'#a9521d',capLight:P.orangeL,gill:'#5a2a10',glow:P.orange,spot:'#fff1d0'};
  mushroom(c,r,w*.86,G(w*.86)+8,h*.4,230*u,tp,-.12,.35);mushroom(c,r,w*.16,G(w*.16)+8,h*.48,310*u,op,.08,.35);
  c.fillStyle=P.mid;pathBottom(c,w,h,G);c.fill();strokeEdge(c,w,G,rgba(P.orangeL,.25),2*u);
  const px=w*.62,py=G(px)+8;c.fillStyle=rgba(P.acid,.75);c.beginPath();c.ellipse(px,py,150*u,16*u,0,0,TAU);c.fill();glow(c,px,py,170*u,P.acid,.28);c.fillStyle=rgba('#e8ffd0',.5);for(let i=0;i<12;i++){c.beginPath();c.arc(px+(r()-.5)*240*u,py+(r()-.5)*14*u,(1.5+r()*4)*u,0,TAU);c.fill()}
  mushroom(c,r,w*.34,G(w*.34)+6,h*.24,150*u,op,-.1,.3);mushroom(c,r,w*.73,G(w*.73)+6,h*.17,105*u,tp,.15,.3);
  for(let i=0;i<26;i++){const x=r()*w,y=G(x)+5,small=r()<.5?op:tp;mushroom(c,r,x,y,(14+r()*40)*u,(16+r()*34)*u,small,(r()-.5)*.4,.25)}
  for(let i=0;i<8;i++){const x=r()*w,y=G(x)-6*u,s=(6+r()*8)*u;glow(c,x,y,s*4,P.orangeL,.4);c.fillStyle='#ffdca0';c.beginPath();c.arc(x,y,s,0,TAU);c.fill()}
  grass(c,r,0,w,G,'#5a3418',4*u,14*u,6*u);
  0},
 front(c,w,h,r,u,P){const dk={stem:'#0a0503',cap:'#120804',capLight:'#2a1408',gill:'#050201',glow:P.orange,spot:'#3a2010'};
  mushroom(c,r,w*1.06,h*1.02,h*.34,400*u,dk,-.3,.12);mushroom(c,r,-30*u,h*1.02,h*.32,300*u,dk,.25,.1);
  const F=edgeFn(r,h*.95,14*u,200*u);c.fillStyle=P.near;pathBottom(c,w,h,F);c.fill();
  for(let i=0;i<16;i++){const x=r()*w,y=F(x)+4;mushroom(c,r,x,y,(20+r()*60)*u,(24+r()*50)*u,dk,(r()-.5)*.4,.15)}
  grass(c,r,0,w,F,P.near,10*u,40*u,5*u)}},

/* V · Cidadela da Chuva Eterna */ {fx:[['rain',240,'#cfe0ff']],p:{top:'#040918',bot:'#142b57',far:'#1a325e',far2:'#12244a',mid:'#0b1934',near:'#030713',win:'#9cc6ff',winL:'#e3efff',light:'#b9d4ff',iron:'#050b18',stone:'#13244a'},
 back(c,w,h,r,u,P){vfill(c,0,0,w,h,[[0,'#081733'],[.35,P.top],[1,P.bot]]);
  for(let i=0;i<60;i++){c.strokeStyle=rgba(P.light,.04+r()*.1);c.lineWidth=1;const y=r()*h*.12,x=r()*w,L=(60+r()*200)*u;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+L/2,y+(r()-.5)*8,x+L,y);c.stroke()}
  glow(c,w*.5,0,h*.55,P.light,.12);
  for(let i=0;i<30;i++)tower(c,r,r()*w,h*(.74+r()*.06),(18+r()*40)*u,h*(.22+r()*.36),{body:P.far2,win:'#35588f',dark:P.far2,lit:.4},u,false);
  fog(c,w,h*.58,h*.32,'#2a4a86',.33);
  for(let i=0;i<16;i++)tower(c,r,r()*w,h*(.8+r()*.04),(28+r()*44)*u,h*(.25+r()*.3),{body:P.far,win:'#6d95d6',dark:'#0e1d3e',lit:.5,ledge:'#22407a'},u,true);
  fog(c,w,h*.8,h*.2,'#3a5fa0',.28);
  c.strokeStyle=rgba(P.light,.07);c.lineWidth=1;for(let i=0;i<500;i++){const x=r()*w,y=r()*h,L=(10+r()*30)*u;c.beginPath();c.moveTo(x,y);c.lineTo(x+L*.12,y+L);c.stroke()}},
 mid(c,w,h,r,u,P){const G=h*.8;this.G=()=>G;this.C=()=>h*.3;
  [[.03,110,.62],[.16,78,.5],[.85,92,.55],[.97,125,.66]].forEach(([fx,tw,th])=>tower(c,r,w*fx,G,tw*u,h*th,{body:P.mid,win:P.win,dark:'#050c1b',lit:.55,ledge:'#1a2f5a'},u,true));
  const sx=w*.64;c.fillStyle='#132653';c.fillRect(sx-36*u,G-42*u,72*u,42*u);c.fillRect(sx-44*u,G-50*u,88*u,9*u);
  c.beginPath();c.moveTo(sx-30*u,G-50*u);c.quadraticCurveTo(sx-34*u,G-120*u,sx-17*u,G-160*u);c.lineTo(sx+17*u,G-160*u);c.quadraticCurveTo(sx+34*u,G-120*u,sx+30*u,G-50*u);c.closePath();c.fill();
  c.beginPath();c.moveTo(sx-14*u,G-158*u);c.quadraticCurveTo(sx-16*u,G-190*u,sx,G-205*u);c.quadraticCurveTo(sx+16*u,G-190*u,sx+14*u,G-158*u);c.fill();
  c.strokeStyle='#132653';c.lineWidth=8*u;c.lineCap='round';c.beginPath();c.moveTo(sx-14*u,G-150*u);c.quadraticCurveTo(sx-34*u,G-200*u,sx-10*u,G-238*u);c.moveTo(sx+14*u,G-150*u);c.quadraticCurveTo(sx+34*u,G-200*u,sx+10*u,G-238*u);c.stroke();
  glow(c,sx,G-252*u,120*u,P.win,.4);glow(c,sx,G-252*u,30*u,P.winL,.9);c.fillStyle=P.winL;c.beginPath();c.arc(sx,G-252*u,13*u,0,TAU);c.fill();
  c.strokeStyle=rgba(P.light,.25);c.lineWidth=1.2*u;c.beginPath();c.moveTo(sx-14*u,G-150*u);c.quadraticCurveTo(sx-34*u,G-200*u,sx-10*u,G-238*u);c.stroke();
  c.fillStyle=P.stone;c.fillRect(0,G,w,h-G);c.fillStyle='#22407a';c.fillRect(0,G-3*u,w,6*u);
  c.strokeStyle=rgba('#000000',.35);c.lineWidth=1;for(let y=G+18*u;y<h;y+=22*u){c.beginPath();c.moveTo(0,y);c.lineTo(w,y);c.stroke()}
  const x0=w*.22,x1=w*.78,fh=52*u;c.strokeStyle=P.iron;c.fillStyle=P.iron;c.lineWidth=2.4*u;c.beginPath();c.moveTo(x0,G-fh*.12);c.lineTo(x1,G-fh*.12);c.moveTo(x0,G-fh*.85);c.lineTo(x1,G-fh*.85);c.stroke();
  for(let x=x0;x<=x1;x+=10*u){c.lineWidth=1.8*u;c.beginPath();c.moveTo(x,G);c.lineTo(x,G-fh);c.stroke();c.beginPath();c.moveTo(x-3*u,G-fh);c.lineTo(x,G-fh-8*u);c.lineTo(x+3*u,G-fh);c.fill()}
  c.lineWidth=1.4*u;for(let x=x0+20*u;x<x1;x+=40*u){c.beginPath();c.arc(x-5*u,G-fh*.5,6*u,0,TAU);c.stroke();c.beginPath();c.arc(x+5*u,G-fh*.5,6*u,0,TAU);c.stroke()}
  [.2,.48,.8].forEach(fx=>lamp(c,w*fx,G,(92+r()*20)*u,P.iron,P.win,u,P.winL));
  for(let i=0;i<9;i++){const x=r()*w,y=G+(14+r()*(h-G-40*u)),pw=(40+r()*120)*u;c.fillStyle=rgba(P.light,.08);c.beginPath();c.ellipse(x,y,pw,pw*.07,0,0,TAU);c.fill();c.strokeStyle=rgba(P.winL,.2);c.lineWidth=1;c.beginPath();c.moveTo(x-pw*.6,y);c.lineTo(x+pw*.6,y);c.stroke()}
  for(let i=0;i<10;i++){const x=w*(.2+r()*.6),y=h*(.35+r()*.3),s=(.6+r()*.6)*u;glow(c,x,y,40*s,P.win,.3);c.fillStyle=rgba(P.winL,.6);c.beginPath();c.arc(x,y,4*s,0,TAU);c.fill()}
  0},
 front(c,w,h,r,u,P){vfill(c,0,h*.9,w,h*.1,[[0,rgba(P.near,0)],[.3,P.near],[1,P.near]]);
  c.strokeStyle=rgba(P.light,.12);c.lineWidth=1;for(let i=0;i<30;i++){const x=r()*w,y=h*(.93+r()*.06),L=(30+r()*120)*u;c.beginPath();c.moveTo(x,y);c.lineTo(x+L,y);c.stroke()}
  lamp(c,w*.05,h,h*.5,P.near,P.win,u*1.8,P.winL);
  c.fillStyle=P.near;c.fillRect(w*.85,h*.55,w*.2,h*.45);c.beginPath();c.moveTo(w*.85,h*.55);c.lineTo(w*.92,h*.38);c.lineTo(w*1.0,h*.55);c.fill();
  for(let y=h*.6;y<h*.95;y+=34*u){c.fillStyle=rgba(P.win,.5);c.beginPath();archPath(c,w*.88,y+22*u,10*u,22*u);c.fill()}}},

/* VI · Minas de Quartzo-Rosa */ {fx:[['sparkle',70,'#ffc4e6'],['motes',40,'#ff9fd4']],p:{top:'#110a1c',bot:'#36244b',far:'#43305c',farD:'#2a1d3c',mid:'#2b1d3e',near:'#0e0817',light:'#f3c6e8',pink:'#ff9fd4',wood:'#3a2838'},
 back(c,w,h,r,u,P){vfill(c,0,0,w,h,[[0,P.top],[1,P.bot]]);
  c.save();c.globalAlpha=.6;cobbles(c,r,0,0,w,h,{base:P.far,dark:P.farD,light:P.light},52*u);c.restore();
  vfill(c,0,0,w,h,[[0,rgba(P.top,.9)],[.35,rgba(P.top,.25)],[.7,rgba(P.top,.2)],[1,rgba(P.top,.85)]]);
  const cp={d:'#5a2c58',m:'#a45a94',l:'#e3a6d4',g:'#ff8fd0'};c.save();c.globalAlpha=.65;for(let i=0;i<12;i++)cluster(c,r,r()*w,h*(.3+r()*.55),(30+r()*60)*u,(r()-.5)*1.2,cp,5,.22);c.restore();
  rays(c,r,w,h,4,'#ffb8e4',.09,{x0:.1,span:.8,skew:.1,len:.9});fog(c,w,h*.6,h*.3,'#9a5d9a',.2)},
 mid(c,w,h,r,u,P){const C=edgeFn(r,h*.15,40*u,200*u),G=edgeFn(r,h*.83,14*u,300*u),Lw=edgeFn(r,w*.1,34*u,110*u),Rw=edgeFn(r,w*.09,34*u,110*u);this.G=G;this.C=C;const pal={base:P.mid,dark:'#140c1f',light:P.light};
  const cp={d:'#7a2f69',m:'#e070b4',l:'#ffe0f2',g:P.pink};
  rockMass(c,r,()=>pathTop(c,w,C),[0,0,w,h*.25],pal,36*u);rockMass(c,r,()=>pathSide(c,w,h,Lw,true),[0,0,w*.2,h],pal,36*u);rockMass(c,r,()=>pathSide(c,w,h,Rw,false),[w*.78,0,w,h],pal,36*u);
  spikes(c,r,w,C,P.mid,16,80*u,true);
  for(let i=0;i<6;i++){const x=w*(.15+r()*.7);cluster(c,r,x,C(x)-4,(40+r()*50)*u,Math.PI+(r()-.5)*.6,cp,5)}
  for(let i=0;i<4;i++){const y=h*(.3+r()*.4);cluster(c,r,Lw(y)-6,y,(40+r()*40)*u,Math.PI/2+(r()-.5)*.5,cp,4);const y2=h*(.3+r()*.4);cluster(c,r,w-Rw(y2)+6,y2,(40+r()*40)*u,-Math.PI/2+(r()-.5)*.5,cp,4)}
  const sx=w*.56,sy=G(sx)+4,sw=260*u,sh=230*u;glow(c,sx+sw/2,sy-sh/2,sw*.9,P.pink,.35);c.fillStyle=rgba('#ffd6ee',.12);c.fillRect(sx,sy-sh,sw,sh);
  scaffold(c,sx,sy,sw,sh,P.wood,u);c.fillStyle=P.wood;c.fillRect(sx-16*u,sy-sh/2-7*u,sw+32*u,10*u);
  rockMass(c,r,()=>pathBottom(c,w,h,G),[0,h*.78,w,h],pal,30*u);strokeEdge(c,w,G,rgba(P.light,.3),2*u);
  c.strokeStyle='#5a4a5e';c.lineWidth=3*u;for(const off of[-2,6]){c.beginPath();for(let x=0;x<=w;x+=8){const y=G(x)+off*u;x?c.lineTo(x,y):c.moveTo(x,y)}c.stroke()}
  c.strokeStyle='#2a1c2a';c.lineWidth=4*u;for(let x=10;x<w;x+=26*u){c.beginPath();c.moveTo(x-3*u,G(x)-4*u);c.lineTo(x+3*u,G(x)+10*u);c.stroke()}
  const mx=w*.84,my=G(mx)-2*u;c.fillStyle='#231828';c.beginPath();c.moveTo(mx-40*u,my-46*u);c.lineTo(mx+40*u,my-46*u);c.lineTo(mx+32*u,my-8*u);c.lineTo(mx-32*u,my-8*u);c.closePath();c.fill();c.strokeStyle='#4a3a4e';c.lineWidth=3*u;c.stroke();
  cluster(c,r,mx,my-44*u,30*u,0,cp,5,.4);c.fillStyle='#120b16';c.beginPath();c.arc(mx-20*u,my-6*u,7*u,0,TAU);c.arc(mx+20*u,my-6*u,7*u,0,TAU);c.fill();
  for(let i=0;i<7;i++){const x=w*(.12+r()*.76);if(Math.abs(x-sx-sw/2)<sw*.6)continue;cluster(c,r,x,G(x)+4,(26+r()*40)*u,(r()-.5)*.6,cp,4)}
  const hx=w*.36,hy=C(hx);chain(c,hx,hy,hx,hy+120*u,'#3a2c42',u);hangLantern(c,hx,hy+120*u,u,P.pink,'#24182a');
  0},
 front(c,w,h,r,u,P){const dp={d:'#2a0f26',m:'#6a2a5c',l:'#c47bb0',g:'#ff7fc6'};
  cluster(c,r,w*.06,h*1.0,200*u,.35,dp,7,.25);cluster(c,r,w*.97,h*1.0,170*u,-.4,dp,6,.25);
  const F=edgeFn(r,h*.975,8*u,200*u);c.fillStyle=P.near;pathBottom(c,w,h,F);c.fill();spikes(c,r,w,F,'#07040b',36,130*u,false)}},

/* VII · Ninho das Mil Patas */ {fx:[['dust',55,'#9a9f88'],['eyes',12,'#eef3c4']],p:{top:'#040504',bot:'#10120d',far:'#181b14',mid:'#0b0c09',near:'#020202',web:'#cfd2be',eye:'#eef3c4',root:'#1a1d15',cocoon:'#83857a'},
 back(c,w,h,r,u,P){vfill(c,0,0,w,h,[[0,P.top],[.5,'#0b0d09'],[1,P.bot]]);
  for(let i=0;i<40;i++){c.strokeStyle=rgba('#1c2017',.8);c.lineWidth=(2+r()*9)*u;c.beginPath();const x=r()*w,y=r()*h;c.moveTo(x,y);c.bezierCurveTo(x+(r()-.5)*400*u,y+(r()-.5)*300*u,x+(r()-.5)*400*u,y+(r()-.5)*300*u,x+(r()-.5)*600*u,y+(r()-.5)*400*u);c.stroke()}
  for(let i=0;i<5;i++)web(c,r()*w,r()*h*.6,(100+r()*160)*u,12,0,TAU,rgba(P.web,.05),1);
  for(let i=0;i<14;i++)eyes(c,r()*w,h*(.2+r()*.6),.5*u,P.eye,.3);
  fog(c,w,h*.55,h*.4,'#252a1e',.25)},
 mid(c,w,h,r,u,P){const C=edgeFn(r,h*.2,60*u,170*u),G=edgeFn(r,h*.8,36*u,200*u);this.G=G;this.C=C;
  c.fillStyle=P.mid;pathTop(c,w,C);c.fill();pathBottom(c,w,h,G);c.fill();
  for(let i=0;i<160;i++){const top=r()<.5,x=r()*w,y=top?C(x)-r()*60*u:G(x)+r()*60*u,s=(8+r()*22)*u;c.fillStyle=mix('#0b0c09','#20241a',r()*.6);c.beginPath();c.ellipse(x,y,s,s*.7,r()*3,0,TAU);c.fill()}
  strokeEdge(c,w,C,rgba('#4a5040',.4),1.5*u);strokeEdge(c,w,G,rgba('#4a5040',.4),1.5*u);
  for(let i=0;i<14;i++){const x=r()*w;thornVine(c,r,x,C(x)-4,(80+r()*180)*u,Math.PI/2+(r()-.5)*1.2,'#14170f',u)}
  for(let i=0;i<10;i++){const x=r()*w;thornVine(c,r,x,G(x)+4,(60+r()*140)*u,-Math.PI/2+(r()-.5)*1.2,'#14170f',u)}
  web(c,w*.86,C(w*.86)+4,300*u,14,Math.PI*.42,Math.PI*1.0,rgba(P.web,.25),1*u);web(c,w*.05,C(w*.05)+4,220*u,10,0,Math.PI*.55,rgba(P.web,.2),1*u);
  [.52,.6,.68,.74].forEach(fx=>{const x=w*fx,y=C(x)-4,L=(40+r()*80)*u,cl=(36+r()*20)*u;c.strokeStyle=rgba(P.web,.4);c.lineWidth=1;c.beginPath();c.moveTo(x,y);c.lineTo(x,y+L);c.stroke();c.fillStyle=P.cocoon;c.beginPath();c.ellipse(x,y+L+cl/2,cl*.32,cl/2,0,0,TAU);c.fill();c.strokeStyle=rgba('#2a2c24',.7);for(let k=0;k<7;k++){c.beginPath();c.moveTo(x-cl*.32,y+L+cl*(.15+k*.11));c.quadraticCurveTo(x,y+L+cl*(.2+k*.11),x+cl*.32,y+L+cl*(.1+k*.11));c.stroke()}});
  for(let i=0;i<10;i++){const top=r()<.5,x=r()*w,y=top?C(x)+(10+r()*30)*u:G(x)-(10+r()*40)*u;eyes(c,x,y,(.8+r()*.6)*u,P.eye,.85)}
  0},
 front(c,w,h,r,u,P){const F=edgeFn(r,h*.96,16*u,160*u);c.fillStyle=P.near;pathBottom(c,w,h,F);c.fill();spikes(c,r,w,F,P.near,40,150*u,false);
  web(c,0,0,320*u,9,0,Math.PI/2,rgba(P.web,.16),1.2*u);
  for(let i=0;i<8;i++)thornVine(c,r,w*(r()<.5?r()*.15:.85+r()*.15),h,(200+r()*200)*u,-Math.PI/2+(r()-.5)*.8,P.near,u*1.6)}},

/* VIII · O Fosso Sem Luz */ {fx:[['rise',85,'#f2efff']],p:{top:'#000000',bot:'#0b0a16',far:'#09090f',mid:'#040407',near:'#000000',light:'#f5f2ff',lav:'#b9b0ff'},
 back(c,w,h,r,u,P){vfill(c,0,0,w,h,[[0,'#000000'],[.6,'#04040a'],[1,P.bot]]);
  glow(c,w*.5,h*1.04,h*.75,P.lav,.22);glow(c,w*.5,h*1.0,h*.32,P.light,.32);raysUp(c,r,w,h,9,P.light,.1);
  const tx=w*.5,ty=h*.98,th=h*.24;c.fillStyle='#0a0a14';c.beginPath();c.moveTo(tx-26*u,ty);c.lineTo(tx-10*u,ty-th);c.lineTo(tx+10*u,ty-th);c.lineTo(tx+26*u,ty);c.fill();c.beginPath();c.moveTo(tx-16*u,ty-th);c.lineTo(tx,ty-th-40*u);c.lineTo(tx+16*u,ty-th);c.fill();glow(c,tx,ty-th+10*u,90*u,P.light,.6);
  const L=edgeFn(r,w*.2,40*u,120*u),R=edgeFn(r,w*.2,40*u,120*u);c.fillStyle=P.far;pathSide(c,w,h,L,true);c.fill();pathSide(c,w,h,R,false);c.fill();
  c.strokeStyle=rgba(P.lav,.14);c.lineWidth=1.5;c.beginPath();for(let y=0;y<h;y+=6)y?c.lineTo(L(y),y):c.moveTo(L(y),y);c.stroke();c.beginPath();for(let y=0;y<h;y+=6)y?c.lineTo(w-R(y),y):c.moveTo(w-R(y),y);c.stroke();
  for(let i=0;i<120;i++){c.fillStyle=rgba(P.light,r()*.4);c.fillRect(w*(.25+r()*.5),r()*h,1.2,1.2)}},
 mid(c,w,h,r,u,P){const L=edgeFn(r,w*.1,30*u,100*u),R=edgeFn(r,w*.09,30*u,100*u);c.fillStyle=P.mid;pathSide(c,w,h,L,true);c.fill();pathSide(c,w,h,R,false);c.fill();
  const G=h*.6,lx1=w*.4;this.G=x=>x<w*.37?G-5*u:null;this.C=()=>0;c.beginPath();c.moveTo(-10,G-6*u);c.lineTo(lx1*.7,G-4*u);c.lineTo(lx1,G);c.lineTo(lx1-20*u,G+18*u);for(let x=lx1-20*u;x>-10;x-=24*u)c.lineTo(x,G+(30+r()*90)*u*(1-x/lx1*.5));c.lineTo(-10,G+200*u);c.closePath();c.fill();
  c.strokeStyle=rgba(P.lav,.35);c.lineWidth=1.5*u;c.beginPath();c.moveTo(0,G-6*u);c.lineTo(lx1*.7,G-4*u);c.lineTo(lx1,G);c.stroke();
  for(let i=0;i<4;i++){const x=w*(.55+r()*.35),len=h*(.15+r()*.4);chain(c,x,-10,x+(r()-.5)*20*u,len,'#15151f',u*1.2)}
  for(let i=0;i<7;i++){const x=w*(.45+r()*.45),y=h*(.4+r()*.45),s=(.6+r()*.9)*u;glow(c,x,y,70*s,P.lav,.3);c.fillStyle=rgba(P.light,.5);c.beginPath();c.moveTo(x-14*s,y);c.bezierCurveTo(x-14*s,y-20*s,x+14*s,y-20*s,x+14*s,y);c.quadraticCurveTo(x,y-4*s,x-14*s,y);c.fill();c.strokeStyle=rgba(P.lav,.4);c.lineWidth=1;for(let k=-2;k<=2;k++){c.beginPath();c.moveTo(x+k*5*s,y);c.bezierCurveTo(x+k*5*s+6*s,y+14*s,x+k*5*s-6*s,y+26*s,x+k*5*s,y+(36+r()*14)*s);c.stroke()}}
  for(let i=0;i<14;i++){const x=w*(.3+r()*.7);tendril(c,r,x,h+10,(140+r()*260)*u,-Math.PI/2+(r()-.5)*.6,(12+r()*16)*u,'#020204',rgba(P.lav,.18))}
  0},
 front(c,w,h,r,u,P){for(let i=0;i<10;i++){const left=r()<.5,x=left?r()*w*.2:w-r()*w*.2;tendril(c,r,x,h+20,(240+r()*320)*u,-Math.PI/2+(left?.3:-.3)+(r()-.5)*.5,(26+r()*24)*u,'#000000',null)}
  vfill(c,0,h*.85,w,h*.15,[[0,'rgba(0,0,0,0)'],[1,'#000000']])}}
];

/* ---------- extra background detail per region (drawn into the back layer) ---------- */
const DETAIL=[
/* I · Cinzaraiz */ (c,w,h,r,u,P)=>{
  c.save();c.filter='blur(10px)';for(let i=0;i<16;i++){c.fillStyle=rgba('#7d8db0',.05+r()*.06);c.beginPath();c.ellipse(r()*w,h*(.42+r()*.28),(160+r()*320)*u,(5+r()*10)*u,0,0,TAU);c.fill()}c.restore();
  const cx=w*.13,cy=h*.6,col='#121a2b';c.fillStyle=col;c.fillRect(cx-70*u,cy-90*u,140*u,96*u);
  for(let k=-3;k<=3;k++){if(r()<.25)continue;c.fillRect(cx+k*20*u-6*u,cy-102*u,12*u,14*u)}
  [[-58,170,16],[0,240,22],[52,150,14],[92,110,12]].forEach(([dx,th,tw])=>{const tx=cx+dx*u;c.fillStyle=col;c.fillRect(tx-tw*u/2,cy-th*u,tw*u,th*u);c.beginPath();c.moveTo(tx-tw*u*.75,cy-th*u);c.lineTo(tx,cy-th*u-tw*u*2.4);c.lineTo(tx+tw*u*.75,cy-th*u);c.fill();
    for(let j=0;j<4;j++)if(r()<.45){c.fillStyle=rgba(P.warm,.7);c.fillRect(tx-1.5*u,cy-th*u+(18+j*26)*u,3*u,5*u);glow(c,tx,cy-th*u+(20+j*26)*u,10*u,P.warm,.25)}});
  const mx=w*.58,my=h*.585;c.fillStyle='#141c2e';c.beginPath();c.moveTo(mx-16*u,my);c.lineTo(mx-9*u,my-70*u);c.lineTo(mx+9*u,my-70*u);c.lineTo(mx+16*u,my);c.fill();
  c.strokeStyle='#141c2e';for(let k=0;k<4;k++){const a=.4+k*Math.PI/2,L=(k===2?28:58)*u;c.lineWidth=3*u;c.beginPath();c.moveTo(mx,my-66*u);c.lineTo(mx+Math.cos(a)*L,my-66*u+Math.sin(a)*L);c.stroke();c.lineWidth=7*u;c.beginPath();c.moveTo(mx+Math.cos(a)*L*.35,my-66*u+Math.sin(a)*L*.35);c.lineTo(mx+Math.cos(a)*L,my-66*u+Math.sin(a)*L);c.stroke()}
  for(let k=0;k<16;k++){const gx=w*(.3+r()*.24),gy=h*(.6+r()*.02);c.fillStyle='#161e30';c.fillRect(gx-1.5*u,gy-14*u,3*u,14*u);c.fillRect(gx-5*u,gy-10*u,10*u,2.5*u)}
  c.strokeStyle=rgba('#0b0f18',.85);c.lineWidth=1.4*u;for(let k=0;k<12;k++){const bx=w*(.32+r()*.42),by=h*(.1+r()*.2),s=(4+r()*5)*u;c.beginPath();c.moveTo(bx-s,by-s*.4);c.quadraticCurveTo(bx-s*.4,by-s*.5,bx,by);c.quadraticCurveTo(bx+s*.4,by-s*.5,bx+s,by-s*.4);c.stroke()}
  for(let k=0;k<8;k++){const lx=w*(.2+r()*.6),ly=h*(.18+r()*.3);glow(c,lx,ly,(18+r()*16)*u,P.warm,.25);c.fillStyle=rgba('#ffe2b0',.8);c.fillRect(lx-1.5*u,ly-2*u,3*u,4*u)}
},
/* II · Galerias */ (c,w,h,r,u,P)=>{
  const ay=h*.34;c.fillStyle='#1a2530';c.fillRect(0,ay-26*u,w,30*u);
  for(let x=-40*u;x<w+60*u;x+=70*u){c.fillStyle='#1a2530';c.fillRect(x,ay,12*u,h*.2);c.fillStyle='#0d1319';c.beginPath();archPath(c,x+12*u,ay+h*.2,58*u,h*.17);c.fill()}
  for(let k=0;k<5;k++){const x=r()*w,g=c.createLinearGradient(0,ay,0,ay+h*.32);g.addColorStop(0,rgba(P.light,.2));g.addColorStop(1,rgba(P.light,0));c.fillStyle=g;c.fillRect(x,ay,2*u,h*.32)}
  c.strokeStyle='#2a3542';c.lineWidth=9*u;c.beginPath();c.moveTo(0,h*.62);c.lineTo(w*.3,h*.62);c.quadraticCurveTo(w*.34,h*.62,w*.34,h*.66);c.lineTo(w*.34,h*.8);c.stroke();
  c.lineWidth=2*u;c.strokeStyle='#141b22';for(let x=20*u;x<w*.3;x+=60*u){c.beginPath();c.moveTo(x,h*.62-6*u);c.lineTo(x,h*.62+6*u);c.stroke()}
  for(let k=0;k<5;k++){const x=w*(.06+r()*.88),len=h*(.12+r()*.2);chain(c,x,0,x,len,'#1d2731',u);c.strokeStyle='#26323e';c.lineWidth=1.5*u;c.beginPath();c.ellipse(x,len+2*u,14*u,5*u,0,0,TAU);c.stroke();for(let j=-2;j<=2;j++){c.beginPath();c.moveTo(x+j*6*u,len+2*u);c.quadraticCurveTo(x+j*7.5*u,len+18*u,x+j*6*u,len+34*u);c.stroke()}c.beginPath();c.ellipse(x,len+34*u,12*u,4*u,0,0,TAU);c.stroke();if(r()<.5)glow(c,x,len+20*u,34*u,P.amber,.22)}
  for(let k=0;k<4;k++){const x=w*(.12+r()*.76),y=h*.36,bw=26*u,bh=(60+r()*50)*u;c.fillStyle=rgba('#5a3a20',.6);c.beginPath();c.moveTo(x,y);c.lineTo(x+bw,y);c.lineTo(x+bw,y+bh);c.lineTo(x+bw*.7,y+bh*.85);c.lineTo(x+bw*.45,y+bh);c.lineTo(x+bw*.2,y+bh*.8);c.lineTo(x,y+bh*.95);c.closePath();c.fill();c.fillStyle=rgba(P.amber,.25);c.beginPath();c.arc(x+bw/2,y+bh*.35,6*u,0,TAU);c.fill()}
  const ty=h*.58;c.strokeStyle='#1e2934';c.lineWidth=3*u;c.beginPath();c.moveTo(w*.55,ty);c.lineTo(w*.98,ty-20*u);c.stroke();for(let x=w*.56;x<w*.98;x+=34*u){const yy=ty-(x-w*.55)/(w*.43)*20*u;c.beginPath();c.moveTo(x,yy);c.lineTo(x-10*u,h*.75);c.moveTo(x,yy);c.lineTo(x+10*u,h*.75);c.stroke()}
  c.fillStyle='#1e2934';c.fillRect(w*.8-16*u,ty-46*u,32*u,20*u);
  for(let k=0;k<12;k++)glow(c,r()*w,h*(.3+r()*.4),(10+r()*20)*u,P.amber,.1+r()*.1);
},
/* III · Sendas */ (c,w,h,r,u,P)=>{
  const fx=w*.8,fy=h*.42,R0=150*u;c.fillStyle='#0d3033';c.beginPath();c.ellipse(fx,fy,R0*.8,R0,0,0,TAU);c.fill();
  c.strokeStyle='#071d1f';c.lineWidth=5*u;for(const d of[-1,1]){c.beginPath();c.arc(fx+d*R0*.3,fy-R0*.05,R0*.18,.2,Math.PI-.2);c.stroke()}
  c.beginPath();c.moveTo(fx-R0*.15,fy+R0*.45);c.quadraticCurveTo(fx,fy+R0*.5,fx+R0*.15,fy+R0*.45);c.stroke();
  c.lineWidth=2*u;c.beginPath();c.moveTo(fx+R0*.1,fy-R0);c.lineTo(fx+R0*.05,fy-R0*.6);c.lineTo(fx+R0*.18,fy-R0*.35);c.lineTo(fx+R0*.1,fy-R0*.1);c.stroke();
  for(let k=0;k<8;k++)foliage(c,r,fx+(r()-.5)*R0*1.4,fy-R0*(.72+r()*.25),(30+r()*30)*u,['#06201f','#0e3b33','#1a5a46'],.8,['#3c3a8a','#5450b0']);
  for(let k=0;k<6;k++)foliage(c,r,fx+(r()-.5)*R0*1.6,fy+R0*(.5+r()*.4),(24+r()*24)*u,['#06201f','#0e3b33','#174e40'],.7);
  for(let k=0;k<80;k++)vine(c,r,r()*w,-5,(40+r()*h*.32),'#0c2f2a','#1a5a46',u);
  const leaf=(x,y,L,a,col)=>{c.save();c.translate(x,y);c.rotate(a);c.fillStyle=col;c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(L*.4,-L*.35,L,0);c.quadraticCurveTo(L*.4,L*.35,0,0);c.fill();c.strokeStyle='rgba(0,0,0,.3)';c.lineWidth=1.2*u;c.beginPath();c.moveTo(0,0);c.lineTo(L*.95,0);c.stroke();c.restore()};
  for(let k=0;k<18;k++){const left=r()<.5;leaf(left?-10:w+10,h*(.28+r()*.52),(80+r()*130)*u,(left?0:Math.PI)+(r()-.5)*1.2,'#071d1d')}
  for(let k=0;k<34;k++)glow(c,r()*w,h*(.2+r()*.6),(4+r()*8)*u,'#bff5d8',.22+r()*.2);
},
/* IV · Brejo */ (c,w,h,r,u,P)=>{
  for(let k=0;k<16;k++){const x=r()*w,top=h*(.3+r()*.25);c.fillStyle=rgba('#3a2210',.8);c.fillRect(x-4*u,top,8*u,h-top);c.beginPath();c.ellipse(x,top,(30+r()*40)*u,(8+r()*8)*u,0,Math.PI,0);c.fill()}
  for(let k=0;k<14;k++){const x=r()*w,L=(30+r()*170)*u;c.strokeStyle=rgba('#2a170b',.9);c.lineWidth=2*u;c.beginPath();c.moveTo(x,0);c.quadraticCurveTo(x+(r()-.5)*20*u,L/2,x,L);c.stroke();const s=(8+r()*14)*u,col=r()<.5?P.orangeL:P.tealL;glow(c,x,L+s,s*4,col,.3);c.fillStyle=rgba(col,.7);c.beginPath();c.ellipse(x,L+s,s*.8,s,0,0,TAU);c.fill();c.fillStyle='rgba(255,255,255,.3)';c.beginPath();c.arc(x-s*.25,L+s*.6,s*.25,0,TAU);c.fill()}
  for(let k=0;k<24;k++){const x=r()*w,y=h*(.35+r()*.4),s=(10+r()*22)*u;c.fillStyle=rgba(mix(P.far,P.orange,.35),.7);c.beginPath();c.ellipse(x,y,s,s*.35,0,Math.PI,0);c.fill();c.fillStyle=rgba(P.orangeL,.2);c.fillRect(x-s,y-1,s*2,1.5*u)}
  c.save();c.filter='blur(12px)';for(let k=0;k<6;k++){const x=r()*w,g=c.createLinearGradient(0,h*.4,0,h*.9);g.addColorStop(0,'rgba(255,217,168,0)');g.addColorStop(1,'rgba(255,217,168,.16)');c.fillStyle=g;c.beginPath();c.moveTo(x-10*u,h*.9);c.quadraticCurveTo(x+30*u,h*.65,x-20*u,h*.4);c.lineTo(x+40*u,h*.4);c.quadraticCurveTo(x+50*u,h*.65,x+10*u,h*.9);c.fill()}c.restore();
},
/* V · Cidadela */ (c,w,h,r,u,P)=>{
  const dx=w*.5,dy=h*.62;c.strokeStyle=rgba(P.light,.18);c.lineWidth=2*u;c.beginPath();c.ellipse(dx,dy,w*.22,h*.22,0,Math.PI,0);c.stroke();
  for(let k=1;k<8;k++){const a=Math.PI+k/8*Math.PI;c.beginPath();c.moveTo(dx,dy-h*.22);c.quadraticCurveTo(dx+Math.cos(a)*w*.12,dy-h*.15,dx+Math.cos(a)*w*.22,dy);c.stroke()}glow(c,dx,dy-h*.1,w*.18,P.win,.08);
  for(let k=0;k<7;k++){const x0=r()*w*.8,bw=(80+r()*200)*u,y=h*(.33+r()*.32);c.fillStyle=rgba('#12244a',.95);c.fillRect(x0,y,bw,6*u);c.beginPath();c.moveTo(x0,y+6*u);c.quadraticCurveTo(x0+bw/2,y+40*u,x0+bw,y+6*u);c.lineTo(x0+bw,y+12*u);c.quadraticCurveTo(x0+bw/2,y+30*u,x0,y+12*u);c.fill();for(let x=x0+8*u;x<x0+bw;x+=10*u)c.fillRect(x,y-8*u,1.5*u,8*u);if(r()<.6){glow(c,x0+bw/2,y-12*u,26*u,P.win,.35);c.fillStyle=P.winL;c.beginPath();c.arc(x0+bw/2,y-12*u,3*u,0,TAU);c.fill()}}
  for(let k=0;k<6;k++){const x=r()*w,ww=(4+r()*14)*u,L=h*(.4+r()*.5),g=c.createLinearGradient(0,0,0,L);g.addColorStop(0,rgba(P.light,.35));g.addColorStop(.8,rgba(P.light,.12));g.addColorStop(1,rgba(P.light,0));c.fillStyle=g;c.fillRect(x,0,ww,L);c.fillStyle=rgba(P.winL,.15);for(let y=0;y<L;y+=12*u)c.fillRect(x+r()*ww,y,1.2*u,8*u);c.save();c.filter='blur(8px)';c.fillStyle=rgba(P.light,.18);c.beginPath();c.ellipse(x+ww/2,L,ww*3,10*u,0,0,TAU);c.fill();c.restore()}
  for(let k=0;k<7;k++){const x=r()*w,y=h*(.25+r()*.3),bh=(50+r()*40)*u;c.fillStyle=rgba('#2a1d4a',.85);c.beginPath();c.moveTo(x,y);c.lineTo(x+16*u,y);c.lineTo(x+16*u,y+bh);c.lineTo(x+8*u,y+bh-10*u);c.lineTo(x,y+bh);c.fill();c.fillStyle=rgba(P.winL,.35);c.beginPath();c.arc(x+8*u,y+bh*.35,4*u,0,TAU);c.fill()}
},
/* VI · Minas */ (c,w,h,r,u,P)=>{
  c.save();c.globalAlpha=.35;for(let k=0;k<7;k++)crystal(c,r()*w,h,h*(.4+r()*.4),(40+r()*50)*u,(r()-.5)*.35,{d:'#3a1f48',m:'#7a4a8a',l:'#c08ac8'});c.restore();
  for(let k=0;k<7;k++)glow(c,r()*w,h*(.4+r()*.4),(60+r()*80)*u,P.pink,.08);
  for(let k=0;k<5;k++){const x=w*(.08+r()*.84),y1=h*(.28+r()*.4);c.strokeStyle=rgba('#5a4a5e',.7);c.lineWidth=1.4*u;c.beginPath();c.moveTo(x,0);c.lineTo(x,y1);c.moveTo(x+14*u,0);c.lineTo(x+14*u,y1*.7);c.stroke();c.strokeStyle='#3a2838';c.lineWidth=3*u;c.beginPath();c.arc(x+7*u,10*u,9*u,0,TAU);c.stroke();c.fillStyle='#2e2036';c.fillRect(x-8*u,y1,16*u,14*u);if(r()<.6)cluster(c,r,x,y1+2*u,12*u,0,{d:'#7a2f69',m:'#e070b4',l:'#ffe0f2',g:'#ff9fd4'},3,.25)}
  const ty=h*.5;c.strokeStyle=rgba('#3a2838',.9);c.lineWidth=3*u;c.beginPath();c.moveTo(0,ty+30*u);c.quadraticCurveTo(w*.5,ty-30*u,w,ty+10*u);c.stroke();
  for(let x=10*u;x<w;x+=40*u){const t=x/w,yy=(1-t)*(1-t)*(ty+30*u)+2*(1-t)*t*(ty-30*u)+t*t*(ty+10*u);c.beginPath();c.moveTo(x,yy);c.lineTo(x-12*u,h*.72);c.moveTo(x,yy);c.lineTo(x+12*u,h*.72);c.stroke()}
  for(let k=0;k<2;k++){const y0=h*(.22+k*.1);c.strokeStyle=rgba('#2a1d34',.9);c.lineWidth=1*u;c.beginPath();c.moveTo(0,y0);c.quadraticCurveTo(w/2,y0+60*u,w,y0);c.stroke();for(let x=30*u;x<w;x+=70*u){const t=x/w,yy=(1-t)*(1-t)*y0+2*(1-t)*t*(y0+60*u)+t*t*y0;glow(c,x,yy+6*u,16*u,P.pink,.35);c.fillStyle='#ffd6ee';c.beginPath();c.arc(x,yy+6*u,2.5*u,0,TAU);c.fill()}}
},
/* VII · Ninho */ (c,w,h,r,u,P)=>{
  const rx=w*.6,ry=h*.55;c.strokeStyle=rgba('#22261c',.9);c.lineCap='round';c.lineWidth=14*u;c.beginPath();c.moveTo(rx-w*.3,ry);c.quadraticCurveTo(rx,ry-40*u,rx+w*.3,ry+10*u);c.stroke();
  for(let k=0;k<11;k++){const t=k/10,x=rx-w*.28+t*w*.56,y=ry-Math.sin(t*Math.PI)*30*u;c.lineWidth=(9-Math.abs(t-.5)*6)*u;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+40*u,y+90*u,x+10*u,y+(150+Math.sin(t*Math.PI)*60)*u);c.stroke()}
  c.fillStyle=rgba('#22261c',.9);c.beginPath();c.ellipse(rx+w*.33,ry+20*u,60*u,40*u,.3,0,TAU);c.fill();c.fillStyle='#0a0b08';c.beginPath();c.ellipse(rx+w*.34,ry+10*u,12*u,9*u,0,0,TAU);c.fill();eyes(c,rx+w*.34,ry+10*u,.8*u,P.eye,.25);
  for(let k=0;k<7;k++){const x=r()*w;c.strokeStyle=rgba('#161a12',.95);c.lineWidth=(14+r()*20)*u;c.beginPath();c.moveTo(x,0);c.bezierCurveTo(x+(r()-.5)*120*u,h*.3,x+(r()-.5)*120*u,h*.6,x+(r()-.5)*60*u,h);c.stroke()}
  for(let k=0;k<4;k++)web(c,r()*w,h*(.2+r()*.3),(160+r()*160)*u,16,0,TAU,rgba(P.web,.08),1.2);
  for(let k=0;k<6;k++){const x=r()*w,y=h*(.3+r()*.4);for(let j=0;j<7;j++){c.fillStyle=rgba('#3a3d30',.8);c.beginPath();c.arc(x+(r()-.5)*30*u,y+(r()-.5)*20*u,(5+r()*5)*u,0,TAU);c.fill()}glow(c,x,y,40*u,'#c8d06a',.07)}
},
/* VIII · Fosso */ (c,w,h,r,u,P)=>{
  for(let k=0;k<3;k++){const x=w*(.3+r()*.4),L=h*(.3+r()*.4);c.strokeStyle=rgba('#14131f',.95);c.lineWidth=7*u;for(let y=0;y<L;y+=36*u){c.beginPath();if((y/(36*u)|0)%2)c.ellipse(x,y+18*u,8*u,20*u,0,0,TAU);else c.ellipse(x,y+18*u,18*u,22*u,0,0,TAU);c.stroke()}}
  for(let k=0;k<10;k++){const x=w*(.22+r()*.56),y=h*(.15+r()*.6),s=(14+r()*40)*u;c.fillStyle='#0c0b14';c.beginPath();c.moveTo(x-s,y);c.lineTo(x+s,y);c.lineTo(x+s*.6,y+s*.7);c.lineTo(x-s*.2,y+s);c.lineTo(x-s*.7,y+s*.5);c.closePath();c.fill();c.strokeStyle=rgba(P.lav,.2);c.lineWidth=1;c.beginPath();c.moveTo(x-s,y);c.lineTo(x+s,y);c.stroke();if(r()<.4){c.fillRect(x-s*.5,y-s*.9,s*.25,s*.9);c.fillRect(x+s*.3,y-s*.6,s*.2,s*.6)}}
  c.save();c.globalAlpha=.07;c.fillStyle=P.lav;for(const d of[-1,1]){c.beginPath();c.moveTo(w*.5,h*.92);c.bezierCurveTo(w*(.5+d*.15),h*.55,w*(.5+d*.45),h*.5,w*(.5+d*.48),h*.72);c.bezierCurveTo(w*(.5+d*.35),h*.8,w*(.5+d*.2),h*.85,w*.5,h*.95);c.fill()}c.restore();
  for(const sx of[w*.24,w*.76]){c.fillStyle='#0a0a12';c.fillRect(sx-14*u,h*.35,28*u,h*.7);c.fillRect(sx-20*u,h*.35,40*u,10*u);c.strokeStyle=rgba(P.lav,.12);c.beginPath();c.moveTo(sx-14*u,h*.36);c.lineTo(sx-14*u,h);c.stroke()}
}
];
function drawBg(c,b,w,h){const img=b.img,cfg=b.cfg||{},iw=img.width,ih=img.height;if(!iw||!ih)return;const s=cfg.encaixe==='conter'?Math.min(w/iw,h/ih):Math.max(w/iw,h/ih);c.save();c.globalAlpha=cfg.opacidade==null?1:+cfg.opacidade;c.drawImage(img,(w-iw*s)/2,(h-ih*s)/2,iw*s,ih*s);c.restore()}
