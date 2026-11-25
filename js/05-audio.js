/* ---------- audio engine: original generated soundtrack + synthesized effects ---------- */
const LS={get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
/* follow=false: in Passeio the music is a normal playlist (no switching by area) */
const SET=Object.assign({autoplay:true,follow:false,sfxVol:.6,vol:.55,muted:false},LS.get('portfolio:set',{}));
function saveSet(){LS.set('portfolio:set',SET)}
const AU={C:null,master:null,music:null,sfx:null,rev:null,noise:null};
function audioInit(){if(AU.C)return AU.C;const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;let C;try{C=new AC()}catch(e){return null}AU.C=C;
  AU.master=C.createGain();AU.master.connect(C.destination);
  AU.music=C.createGain();AU.music.gain.value=SET.muted?0:SET.vol;AU.music.connect(AU.master);
  AU.sfx=C.createGain();AU.sfx.gain.value=SET.sfxVol;AU.sfx.connect(AU.master);
  const ir=C.createBuffer(2,Math.floor(C.sampleRate*3.4),C.sampleRate);for(let ch=0;ch<2;ch++){const d=ir.getChannelData(ch);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,2.6)}
  AU.rev=C.createConvolver();AU.rev.buffer=ir;const rg=C.createGain();rg.gain.value=.9;AU.rev.connect(rg);rg.connect(AU.music);
  const srev=C.createConvolver();srev.buffer=ir;AU.sfxRev=C.createGain();AU.sfxRev.gain.value=.22;AU.sfxRev.connect(srev);srev.connect(AU.sfx);
  const nb=C.createBuffer(1,C.sampleRate*2,C.sampleRate),nd=nb.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=Math.random()*2-1;AU.noise=nb;
  return C}
const mtof=m=>440*Math.pow(2,(m-69)/12);
function osc(type,f,t,end,dest,det=0){const o=AU.C.createOscillator();o.type=type;o.frequency.setValueAtTime(f,t);o.detune.value=det;o.connect(dest);o.start(t);o.stop(end);return o}
function gnode2(v,dest){const g=AU.C.createGain();g.gain.value=v;g.connect(dest);return g}
function vout(b,t,dur,peak,a,rel,send=.35){const C=AU.C,g=C.createGain(),h=Math.max(a,dur);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(peak,t+a);g.gain.setValueAtTime(peak,t+h);g.gain.exponentialRampToValueAtTime(.0001,t+h+rel);g.connect(b.dry);if(send)g.connect(gnode2(send,b.send));return{g,end:t+h+rel+.05}}
function vdec(b,t,peak,a,dec,send=.35){const C=AU.C,g=C.createGain();g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(peak,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+a+dec);g.connect(b.dry);if(send)g.connect(gnode2(send,b.send));return{g,end:t+a+dec+.05}}
function lfoTo(param,rate,depth,t,end){const l=AU.C.createOscillator();l.frequency.value=rate;const lg=AU.C.createGain();lg.gain.value=depth;l.connect(lg);lg.connect(param);l.start(t);l.stop(end)}
const INST={
 piano(b,t,m,d,v=1){const f=mtof(m),{g,end}=vdec(b,t,.15*v,.004,2.4+Math.max(0,60-m)*.03,.4);[[1,1,'triangle'],[2,.25,'sine'],[3,.08,'sine'],[1.003,.4,'sine']].forEach(([r,a,ty])=>osc(ty,f*r,t,end,gnode2(a,g)))},
 pluck(b,t,m,d,v=1){const C=AU.C,f=mtof(m),{g,end}=vdec(b,t,.12*v,.003,.9,.3);const lp=C.createBiquadFilter();lp.type='lowpass';lp.frequency.setValueAtTime(f*6,t);lp.frequency.exponentialRampToValueAtTime(f*1.2,t+.6);lp.connect(g);osc('triangle',f,t,end,lp);osc('sawtooth',f,t,end,gnode2(.15,lp))},
 harp(b,t,m,d,v=1){const f=mtof(m),{g,end}=vdec(b,t,.1*v,.002,1.8,.5);osc('triangle',f,t,end,g);osc('sine',f*2,t,end,gnode2(.3,g))},
 bell(b,t,m,d,v=1){const C=AU.C,f=mtof(m),{g,end}=vdec(b,t,.07*v,.002,3.6,.6),car=C.createOscillator(),mod=C.createOscillator(),mg=C.createGain();car.frequency.value=f;mod.frequency.value=f*3.47;mg.gain.setValueAtTime(f*2.2,t);mg.gain.exponentialRampToValueAtTime(f*.05,t+2.5);mod.connect(mg);mg.connect(car.frequency);car.connect(g);car.start(t);mod.start(t);car.stop(end);mod.stop(end)},
 mbox(b,t,m,d,v=1){const f=mtof(m),{g,end}=vdec(b,t,.08*v,.002,1.4,.5);osc('sine',f,t,end,g);osc('sine',f*4.01,t,end,gnode2(.25,g))},
 marimba(b,t,m,d,v=1){const C=AU.C,f=mtof(m),{g,end}=vdec(b,t,.14*v,.002,.55,.25),o=C.createOscillator();o.type='sine';o.frequency.setValueAtTime(f*1.02,t);o.frequency.exponentialRampToValueAtTime(f,t+.05);o.connect(g);o.start(t);o.stop(end);const q=C.createGain();q.gain.setValueAtTime(.3,t);q.gain.exponentialRampToValueAtTime(.001,t+.1);q.connect(g);osc('sine',f*3.9,t,end,q)},
 bass(b,t,m,d,v=1){const C=AU.C,f=mtof(m),{g,end}=vout(b,t,d,.15*v,.03,.4,.05),lp=C.createBiquadFilter();lp.type='lowpass';lp.frequency.value=380;lp.connect(g);osc('sine',f,t,end,lp);osc('triangle',f,t,end,gnode2(.35,lp))},
 pad(b,t,m,d,v=1){const C=AU.C,f=mtof(m),{g,end}=vout(b,t,d,.032*v,1.2,1.8,.6),lp=C.createBiquadFilter();lp.type='lowpass';lp.frequency.value=900;lp.connect(g);[-9,0,8].forEach(dt=>osc('sawtooth',f,t,end,lp,dt))},
 strings(b,t,m,d,v=1){const C=AU.C,f=mtof(m),{g,end}=vout(b,t,d,.028*v,.6,1.2,.5),lp=C.createBiquadFilter();lp.type='lowpass';lp.frequency.value=1700;lp.connect(g);[-6,6].forEach(dt=>{const o=osc('sawtooth',f,t,end,lp,dt);lfoTo(o.detune,5.2,6,t,end)})},
 choir(b,t,m,d,v=1){const C=AU.C,f=mtof(m),{g,end}=vout(b,t,d,.05*v,1.6,2.2,.7);[[650,6,1],[1080,8,.6],[2600,10,.25]].forEach(([fr,q,a],k)=>{const bp=C.createBiquadFilter();bp.type='bandpass';bp.frequency.value=fr;bp.Q.value=q;bp.connect(gnode2(a,g));const o=osc('sawtooth',f,t,end,bp,(k-1)*5);lfoTo(o.detune,4.6,7,t,end)})},
 flute(b,t,m,d,v=1){const C=AU.C,f=mtof(m),{g,end}=vout(b,t,d,.065*v,.08,.35,.45),o=osc('sine',f,t,end,g);lfoTo(o.detune,5,8,t,end);osc('triangle',f*2,t,end,gnode2(.1,g))},
 drone(b,t,m,d,v=1){const C=AU.C,f=mtof(m),{g,end}=vout(b,t,d,.045*v,2,3,.5),lp=C.createBiquadFilter();lp.type='lowpass';lp.frequency.value=260;lp.connect(g);osc('sawtooth',f,t,end,lp,-4);osc('sawtooth',f*1.498,t,end,lp,3);osc('sine',f/2,t,end,g)},
 bubble(b,t,m,d,v=1){const C=AU.C,f=mtof(m),{g,end}=vdec(b,t,.05*v,.002,.12,.3),o=C.createOscillator();o.type='sine';o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(f*2.4,t+.1);o.connect(g);o.start(t);o.stop(end)},
 tick(b,t,m,d,v=1){const C=AU.C,{g,end}=vdec(b,t,.04*v,.001,.05,.1),s=C.createBufferSource(),hp=C.createBiquadFilter();s.buffer=AU.noise;hp.type='highpass';hp.frequency.value=5000;s.connect(hp);hp.connect(g);s.start(t,Math.random());s.stop(end)}
};
function bed(b,kind,t){const C=AU.C,src=C.createBufferSource(),f=C.createBiquadFilter(),g=C.createGain();src.buffer=AU.noise;src.loop=true;src.connect(f);f.connect(g);g.connect(b.dry);
  const cfg={wind:['lowpass',420,.05],rain:['highpass',1800,.05],hum:['lowpass',140,.08],leaves:['bandpass',3200,.014],shimmer:['bandpass',7000,.012],rumble:['lowpass',90,.1],air:['bandpass',900,.02],drip:['bandpass',1200,.008]}[kind]||['lowpass',400,.03];
  f.type=cfg[0];f.frequency.value=cfg[1];g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(cfg[2],t+2);
  const l=C.createOscillator(),lg=C.createGain();l.frequency.value=.07+Math.random()*.08;lg.gain.value=cfg[2]*.5;l.connect(lg);lg.connect(g.gain);l.start(t);src.start(t);b.nodes.push(src,l)}
function newBus(){const C=AU.C,dry=C.createGain(),send=C.createGain(),t=C.currentTime;dry.gain.setValueAtTime(0,t);send.gain.setValueAtTime(0,t);dry.gain.linearRampToValueAtTime(1,t+.6);send.gain.linearRampToValueAtTime(1,t+.6);dry.connect(AU.music);send.connect(AU.rev);return{dry,send,nodes:[]}}
function killBus(b,fade=.35){if(!b||!AU.C)return;const t=AU.C.currentTime;[b.dry,b.send].forEach(g=>{g.gain.cancelScheduledValues(t);g.gain.setValueAtTime(g.gain.value,t);g.gain.linearRampToValueAtTime(0,t+fade)});setTimeout(()=>{b.nodes.forEach(n=>{try{n.stop()}catch(e){}});try{b.dry.disconnect();b.send.disconnect()}catch(e){}},fade*1000+150)}

/* original compositions, written as patterns over scales */
const SCL={min:[0,2,3,5,7,8,10],maj:[0,2,4,5,7,9,11],phr:[0,1,3,5,7,8,10],lyd:[0,2,4,6,7,9,11],loc:[0,1,3,5,6,8,10],harm:[0,2,3,5,7,8,11]};
function makeTrack(o){const stepDur=60/o.bpm/4,totalSteps=o.bars*16,sc=SCL[o.scale];const D=d=>o.root+sc[((d%7)+7)%7]+12*Math.floor(d/7);
  return{title:o.title,tema:o.region,region:-1,builtin:true,beds:o.beds,stepDur,totalSteps,dur:totalSteps*stepDur,
    step(k,t,b){if(k>=totalSteps)return;const bar=Math.floor(k/16),s=k%16,ch=o.prog[bar%o.prog.length],r=rng(o.seed*7919+k*31+7),part=Math.floor(bar/8)%4,fade=bar>=o.bars-1?.5:1;
      o.play({k,bar,s,ch,D,r,t,b,part,sd:stepDur,fade,mel:(M,inst,oct=12,v=1,from=0)=>{if(bar<from)return;const ph=k%32;for(const n of M)if(n[0]===ph)INST[inst](b,t,D(ch+n[1])+oct,n[2]*stepDur,v*fade)}})}}}
const BUILTIN=[
 makeTrack({title:'Sino de Cinzaraiz',region:0,seed:11,root:50,scale:'min',bpm:64,bars:36,prog:[0,5,3,4],beds:['wind'],play(x){const{s,ch,D,r,t,b,part,sd,bar,k,mel}=x;
   if(s===0){[0,2,4].forEach(o=>INST.pad(b,t,D(ch+o),16*sd,.9));INST.bass(b,t,D(ch)-12,15*sd,.8)}
   if(part>0&&s%4===2&&r()<.7)INST.harp(b,t,D(ch+[0,2,4,7][(k>>2)%4])+12,2*sd,.5);
   mel((Math.floor(k/32)+part)%3===2?[[0,7,4],[4,6,2],[6,4,2],[8,2,8],[18,3,2],[20,4,6],[28,2,4]]:[[0,4,6],[6,3,2],[8,2,6],[14,1,2],[16,0,8],[24,2,4],[28,4,4]],'piano',12,.9,4);
   if(s===0&&bar%4===0&&r()<.8)INST.bell(b,t+2*sd,D(ch+4)+24,1,.6)}}),
 makeTrack({title:'Âmbar Velho',region:1,seed:23,root:57,scale:'min',bpm:76,bars:40,prog:[0,0,5,6],beds:['hum','drip'],play(x){const{s,ch,D,r,t,b,part,sd,bar,mel}=x;
   if(s===0&&bar%4===0)INST.drone(b,t,D(0)-12,62*sd,.8);
   if(s===0||s===10)INST.bass(b,t,D(ch)-12,5*sd,.7);
   if(s%2===0&&bar>=2)INST.pluck(b,t,D(ch+[0,2,4,7,4,2,0,2][s/2])+12,2*sd,.65);
   mel([[0,4,4],[4,5,2],[6,4,2],[8,2,8],[16,3,4],[20,2,4],[24,0,8]],'harp',12,.8,part>0?0:99);
   if(s===8&&r()<.25)INST.bell(b,t,D(ch+2)+24,1,.5)}}),
 makeTrack({title:'Folhas que Respiram',region:2,seed:37,root:53,scale:'maj',bpm:84,bars:44,prog:[0,4,5,3],beds:['leaves','air'],play(x){const{s,ch,D,r,t,b,part,sd,mel}=x;
   if(s===0){[0,2,4].forEach(o=>INST.pad(b,t,D(ch+o),16*sd,.7));}
   if(s===0||s===8)INST.bass(b,t,D(ch)-12,7*sd,.6);
   INST.harp(b,t,D(ch+[0,2,4,7,4,2,4,7][s%8])+12+(s>=8?12:0),sd,.4);
   mel([[0,4,6],[6,5,2],[8,4,4],[12,2,4],[16,7,8],[24,6,2],[26,4,6]],'flute',12,.9,part===0?4:0);
   if(r()<.03)INST.bell(b,t,D(ch+4)+24,1,.4)}}),
 makeTrack({title:'Esporos Dourados',region:3,seed:41,root:52,scale:'phr',bpm:96,bars:48,prog:[0,1,0,6],beds:['drip'],play(x){const{s,ch,D,r,t,b,part,sd,mel}=x;
   const ost={0:0,3:4,6:2,8:7,11:4,14:2};if(s in ost)INST.marimba(b,t,D(ch+ost[s])+12,sd,.8);
   if(s===0||s===6||s===8)INST.bass(b,t,D(ch)-12,2*sd,.75);
   if(s%4===2)INST.tick(b,t,0,sd,.8);
   if(r()<.1)INST.bubble(b,t,D(ch+(r()*7|0))+24,sd,.7);
   mel([[0,7,2],[2,8,2],[4,7,4],[8,4,4],[12,5,2],[14,4,2],[16,1,8],[24,0,4]],'harp',12,.8,part>=1?0:99)}}),
 makeTrack({title:'Chuva sem Céu',region:4,seed:53,root:48,scale:'min',bpm:58,bars:30,prog:[0,5,2,6],beds:['rain'],play(x){const{s,ch,D,r,t,b,sd,bar,mel}=x;
   if(s===0){[0,2,4].forEach(o=>INST.strings(b,t,D(ch+o)+12,16*sd,.8));INST.bass(b,t,D(ch)-12,15*sd,.7)}
   if(s%4===0)INST.piano(b,t,D(ch+[0,4,7,4][s/4]),3*sd,.45);
   mel([[0,4,4],[4,3,2],[6,2,2],[8,4,8],[16,5,4],[20,4,2],[22,2,2],[24,1,8]],'piano',12,.85,2);
   if(s===0&&bar%8===0)INST.bell(b,t,D(ch+4)+24,1,.5)}}),
 makeTrack({title:'Quartzo Cantante',region:5,seed:67,root:59,scale:'harm',bpm:80,bars:40,prog:[0,3,4,0],beds:['shimmer'],play(x){const{s,ch,D,t,b,part,sd,mel}=x;
   INST.mbox(b,t,D(ch+[0,2,4,7,9,7,4,2][s%8])+12,sd,.5);
   if(s===0){[0,2,4].forEach(o=>INST.pad(b,t,D(ch+o)-12,16*sd,.5));INST.bass(b,t,D(ch)-24,15*sd,.6)}
   mel([[0,7,8],[8,9,4],[12,8,4],[16,6,8],[24,4,8]],'bell',12,.9,part===0?4:0)}}),
 makeTrack({title:'Mil Patas',region:6,seed:79,root:49,scale:'loc',bpm:54,bars:28,prog:[0,1,0,4],beds:['rumble','drip'],play(x){const{s,ch,D,r,t,b,sd,bar}=x;
   if(s===0&&bar%2===0)INST.drone(b,t,D(0)-12,30*sd,1);
   if(s%2===0&&r()<.3)INST.pluck(b,t,D(ch+[0,1,3,4][r()*4|0]),sd,.5);
   if(s===0&&bar%4===0){INST.strings(b,t,D(ch)+12,14*sd,.7);INST.strings(b,t,D(ch+1)+12,14*sd,.5)}
   if(r()<.04)INST.bell(b,t,D(ch+1)+24,1,.4)}}),
 makeTrack({title:'Luz que Não Aquece',region:7,seed:97,root:55,scale:'lyd',bpm:48,bars:26,prog:[0,1,4,0],beds:['air'],play(x){const{s,ch,D,r,t,b,sd,mel}=x;
   if(s===0){[0,2,4].forEach(o=>INST.choir(b,t,D(ch+o),16*sd,.8));INST.choir(b,t,D(ch+4)+12,16*sd,.5);INST.bass(b,t,D(ch)-24,15*sd,.6)}
   mel([[0,4,8],[8,6,4],[12,7,4],[16,11,16]],'bell',24,.8);
   if(r()<.12)INST.harp(b,t,D(ch+(r()*7|0))+24,sd,.35)}})
];
const MUS={list:BUILTIN.slice(),idx:0,playing:false,pos:0,startCtx:0,startPos:0,step:0,bus:null,timer:null,started:false};
const curTrack=()=>MUS.list[MUS.idx];
function musicTime(){const tr=curTrack();if(!tr)return 0;if(!MUS.playing)return MUS.pos;if(tr.builtin)return Math.max(0,MUS.startPos+(AU.C.currentTime-MUS.startCtx));return tr.el?tr.el.currentTime:0}
function musicDur(tr=curTrack()){return tr?(tr.builtin?tr.dur:(tr.el&&isFinite(tr.el.duration)?tr.el.duration:0)):0}
function stopEngine(){if(MUS.timer){clearInterval(MUS.timer);MUS.timer=null}if(MUS.bus){killBus(MUS.bus);MUS.bus=null}MUS.list.forEach(t=>{if(t.el&&!t.el.paused)t.el.pause()})}
function connectEl(tr){if(tr.src||!AU.C)return;try{tr.src=AU.C.createMediaElementSource(tr.el);tr.src.connect(AU.music)}catch(e){}tr.el.onended=()=>{if(curTrack()!==tr)return;if(SET.follow&&(tr.region>=0||tr.tema!=null))musicSeek(0,true);else musicNext()}}
function musicPlay(){const C=audioInit();if(!C)return;if(C.state==='suspended')C.resume();const tr=curTrack();if(!tr)return;stopEngine();MUS.playing=true;MUS.started=true;
  if(tr.builtin){MUS.bus=newBus();MUS.startCtx=C.currentTime+.05;MUS.startPos=MUS.pos;MUS.step=Math.ceil(MUS.pos/tr.stepDur);(tr.beds||[]).forEach(k=>bed(MUS.bus,k,C.currentTime));MUS.timer=setInterval(musicTick,40);musicTick()}
  else{connectEl(tr);try{tr.el.currentTime=MUS.pos}catch(e){}tr.el.play().catch(()=>{})}
  uiPlayer()}
function musicPause(){if(!MUS.playing)return;MUS.pos=musicTime();MUS.playing=false;stopEngine();uiPlayer()}
function musicToggle(){MUS.playing?musicPause():musicPlay()}
function musicSelect(i,play=MUS.playing){if(!MUS.list.length)return;if(MUS.playing){MUS.playing=false;stopEngine()}MUS.idx=((i%MUS.list.length)+MUS.list.length)%MUS.list.length;MUS.pos=0;if(play)musicPlay();uiPlayer()}
function musicNext(){musicSelect(MUS.idx+1,true)}
function musicPrev(){if(musicTime()>3)musicSeek(0);else musicSelect(MUS.idx-1,true)}
function musicSeek(p,forcePlay){const was=MUS.playing||forcePlay;if(MUS.playing){MUS.playing=false;stopEngine()}MUS.pos=clamp(p,0,Math.max(0,musicDur()-.25));if(was)musicPlay();uiPlayer()}
function musicTick(){const tr=curTrack();if(!tr||!tr.builtin||!MUS.playing)return;const C=AU.C,now=musicTime();
  if(now>=tr.dur){if(SET.follow)musicSeek(0,true);else musicNext();return}
  while(MUS.step*tr.stepDur<now+.35&&MUS.step<tr.totalSteps){const when=MUS.startCtx+(MUS.step*tr.stepDur-MUS.startPos);if(when>=C.currentTime-.02){try{tr.step(MUS.step,Math.max(when,C.currentTime),MUS.bus)}catch(e){}}MUS.step++}}
/* track for section i: the owner's track for that area first, then any track of its theme */
function faixaDaArea(i){const c=MUS.list.map((t,k)=>[t,k]),a=c.find(([t])=>t.region===i)||c.find(([t])=>!t.builtin&&t.tema===TEMA[i])||c.find(([t])=>t.tema===TEMA[i]);return a?a[1]:-1}
function musicRegion(i){if(!SET.follow||!MUS.started)return;const k=faixaDaArea(i);if(k>=0&&k!==MUS.idx)musicSelect(k,MUS.playing)}
function setMusicVol(v){SET.vol=v;saveSet();if(AU.music)AU.music.gain.setTargetAtTime(SET.muted?0:v,AU.C.currentTime,.05)}
function setMuted(m){SET.muted=m;saveSet();if(AU.music)AU.music.gain.setTargetAtTime(m?0:SET.vol,AU.C.currentTime,.05)}
function audioWake(e){const C=audioInit();if(!C)return;if(C.state==='suspended')C.resume();if(!MUS.started&&SET.autoplay&&!(e&&e.target&&e.target.closest&&e.target.closest('.pbar,.panel'))){MUS.started=true;if(SET.follow){const k=faixaDaArea(Math.max(0,lastIdx));if(k>=0){MUS.idx=k;MUS.pos=0}}musicPlay();toast('Tocando: '+curTrack().title)}}

/* synthesized sound effects (original) */
function sfxOut(v,rev){const g=AU.C.createGain();g.gain.value=v;g.connect(AU.sfx);if(rev)g.connect(AU.sfxRev);return g}
function tone(t,type,f0,f1,dur,peak,rev){const C=AU.C,o=C.createOscillator(),g=sfxOut(1,rev);o.type=type;o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(peak,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);o.start(t);o.stop(t+dur+.02)}
function nz(t,dur,f,type,peak,f1){const C=AU.C,s=C.createBufferSource(),fl=C.createBiquadFilter(),g=sfxOut(1);s.buffer=AU.noise;fl.type=type;fl.frequency.setValueAtTime(f,t);if(f1)fl.frequency.exponentialRampToValueAtTime(f1,t+dur);fl.Q.value=1.2;g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(peak,t+.006);g.gain.exponentialRampToValueAtTime(.0001,t+dur);s.connect(fl);fl.connect(g);s.start(t,Math.random());s.stop(t+dur+.02)}
const SYN={
 pulo:(t,v)=>{tone(t,'triangle',260,640,.16,.16*v);nz(t,.12,1800,'bandpass',.08*v)},
 salto_duplo:(t,v)=>{for(let k=0;k<3;k++)nz(t+k*.045,.06,2400+k*600,'bandpass',.12*v)},
 pouso:(t,v)=>{tone(t,'sine',140,55,.14,.24*v);nz(t,.08,600,'lowpass',.14*v)},
 passo:(t,v)=>nz(t,.03,2000+Math.random()*900,'bandpass',.05*v),
 golpe:(t,v)=>nz(t,.16,900,'bandpass',.18*v,3400),
 acerto:(t,v)=>{tone(t,'square',190,80,.09,.1*v);nz(t,.06,1200,'bandpass',.18*v)},
 dano:(t,v)=>{tone(t,'sawtooth',420,120,.3,.1*v);tone(t,'sawtooth',446,128,.3,.07*v);nz(t,.15,900,'lowpass',.18*v)},
 coleta:(t,v)=>{tone(t,'sine',1320,1330,.25,.07*v,true);tone(t+.06,'sine',1980,1990,.3,.05*v,true)},
 avanco:(t,v)=>nz(t,.22,3000,'bandpass',.16*v,500),
 morte:(t,v)=>{tone(t,'triangle',500,60,1.1,.15*v,true);nz(t,.6,400,'lowpass',.14*v)},
 trava:(t,v)=>{tone(t,'square',140,95,.14,.05*v)},
 inimigo_morre:(t,v)=>{tone(t,'square',320,40,.25,.09*v);nz(t,.18,1500,'bandpass',.2*v)}
};
function sfx(name,v=1){const C=AU.C;if(!C||C.state!=='running')return;if(MODE==='auto')v*=.55;const buf=ASSETS.sfx[name];
  if(buf){const s=C.createBufferSource();s.buffer=buf;s.connect(sfxOut(v));s.start();return}const f=SYN[name];if(f)try{f(C.currentTime,v)}catch(e){}}
