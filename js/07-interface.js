/* ---------- interface: modos, HUD, player de música, controles e guia ---------- */
const $=id=>document.getElementById(id);
const ICON={play:'<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>',pause:'<svg viewBox="0 0 24 24"><path d="M7 5h4v14H7zm6 0h4v14h-4z"/></svg>',vol:'<svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9zm12.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4z"/></svg>',mute:'<svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9zm16.6 0-1.4-1.4L17 9.8l-2.2-2.2-1.4 1.4 2.2 2.2-2.2 2.2 1.4 1.4 2.2-2.2 2.2 2.2 1.4-1.4-2.2-2.2z"/></svg>'};
function toast(msg,ms=2800){const t=$('toast');t.textContent=msg;t.hidden=false;requestAnimationFrame(()=>t.classList.add('on'));clearTimeout(toast.h);toast.h=setTimeout(()=>{t.classList.remove('on');setTimeout(()=>{if(!t.classList.contains('on'))t.hidden=true},400)},ms)}
function hudGame(){hudVida(PL.hp,PL.max);HUDT.frags=PL.frags;if(typeof paginasAchadas==='function')HUDT.pag=[paginasAchadas(),totalPaginas()]}
function updateModeUI(){$('mAuto').setAttribute('aria-pressed',MODE==='auto');$('mPlay').setAttribute('aria-pressed',MODE==='play')}
/* the name of the area, big and ornamented, when the player enters it (Jogo) */
function mostrarTituloArea(i){const el=$('tituloArea');if(!el)return;const g=REGS[i],a=CONTEUDO.dados&&CONTEUDO.dados.areas.find(x=>x.id===g.id);
  $('taN').textContent=(i===0||i===REGS.length-1?'':'Área ')+roman[i];$('taNome').textContent=g.nome;$('taSub').textContent=a&&a.titulo_area&&!/^\[/.test(a.titulo_area)?a.titulo_area:'';
  el.classList.remove('on');void el.offsetWidth;el.classList.add('on');clearTimeout(mostrarTituloArea.t);mostrarTituloArea.t=setTimeout(()=>el.classList.remove('on'),3600)}
/* hand-drawn lines tremble a little, like drawn animation (about 8 times a second) */
{const tr=document.getElementById('tremorRuido');if(tr&&!reduce){let k=0;setInterval(()=>{if(document.hidden)return;k=(k+1)%4;tr.setAttribute('seed',String(k+1))},125)}}
function showHint(on){$('hint').hidden=!on;clearTimeout(showHint.h);if(on)showHint.h=setTimeout(()=>{$('hint').hidden=true},9000)}
$('hintClose').onclick=()=>showHint(false);
$('mAuto').onclick=()=>setMode('auto');$('mPlay').onclick=e=>{audioWake(e);setMode('play')};
mapEls.forEach((a,i)=>a.addEventListener('click',e=>{if(MODE==='play'){e.preventDefault();teleportTo(i)}}));
{const asc=document.getElementById('ascend');if(asc)asc.addEventListener('click',()=>{if(MODE==='play')teleportTo(0)})}
const NOME_SITE=(window.CONTEUDO&&CONTEUDO.dados&&CONTEUDO.dados.site&&CONTEUDO.dados.site.nome)||'Portfólio';

/* input */
const KEYMAP={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down'};
const typing=e=>e.target&&e.target.closest&&e.target.closest('input,textarea,select,[contenteditable]');
const detalheAberto=()=>{const d=document.getElementById('detalhe');return!!d&&!d.hidden};
addEventListener('keydown',e=>{if(typing(e)||detalheAberto())return;audioWake(e);
  if(e.code==='Escape'){closePanels();return}
  if((e.code==='KeyI'||(e.code==='Tab'&&MODE==='play'))&&!e.repeat){e.preventDefault();$('powModal').hidden?openPoderes():closePanels();return}
  if(MODE!=='play'||paused)return;
  if(KEYMAP[e.code]){inp[KEYMAP[e.code]]=1;e.preventDefault()}
  if(e.code==='Space'||e.code==='KeyZ'){if(!e.repeat)jumpQ=.13;inp.jump=1;e.preventDefault()}
  if((e.code==='KeyJ'||e.code==='KeyX')&&!e.repeat){atkQ=.12;e.preventDefault()}
  if((e.code==='KeyK'||e.code==='KeyC'||e.code==='ShiftLeft'||e.code==='ShiftRight')&&!e.repeat){dashQ=.1;e.preventDefault()}
  if(e.code==='KeyF'&&!e.repeat){poderQ=.12;e.preventDefault()}
  if(e.code==='KeyH'&&!e.repeat){acenderQ=.12;e.preventDefault()}
  if(e.code==='KeyL'&&!e.repeat){corridaQ=.12;e.preventDefault()}
  if(['PageDown','PageUp','Home','End'].includes(e.code))e.preventDefault()});
addEventListener('keyup',e=>{if(KEYMAP[e.code])inp[KEYMAP[e.code]]=0;if(e.code==='Space'||e.code==='KeyZ')inp.jump=0});
addEventListener('blur',()=>{for(const k in inp)inp[k]=0});
addEventListener('pointerdown',audioWake);
addEventListener('wheel',e=>{if(MODE==='play'&&!e.target.closest('.panel,#musica,.modal'))e.preventDefault()},{passive:false});
addEventListener('touchmove',e=>{if(MODE==='play'&&!e.target.closest('.panel,#musica,.modal'))e.preventDefault()},{passive:false});
document.querySelectorAll('#pad [data-k]').forEach(b=>{const k=b.dataset.k;
  const on=e=>{e.preventDefault();try{b.setPointerCapture(e.pointerId)}catch(_){}audioWake(e);if(k==='jump'){jumpQ=.13;inp.jump=1}else if(k==='atk')atkQ=.12;else if(k==='dash')dashQ=.1;else if(k==='pod')poderQ=.12;else if(k==='acd')acenderQ=.12;else inp[k]=1;b.classList.add('on')};
  const off=()=>{if(k in inp)inp[k]=0;b.classList.remove('on')};
  b.addEventListener('pointerdown',on);b.addEventListener('pointerup',off);b.addEventListener('pointercancel',off);b.addEventListener('lostpointercapture',off)});

/* música: um disco no canto (a capa da faixa, com o anel de progresso) que abre o player */
const fmt=s=>{s=Math.max(0,s|0);return(s/60|0)+':'+String(s%60).padStart(2,'0')};
/* capa desenhada para as faixas sem capa (as geradas pelo site) */
function capaGerada(tr){if(tr.capaGerada)return tr.capaGerada;const cv=document.createElement('canvas');cv.width=cv.height=192;const c=cv.getContext('2d'),W=192,t=tr.tema!=null?tr.tema:tr.region>=0?TEMA[tr.region]:null,reg=t!=null?REG[t]:null,p=reg?reg.p:{top:'#1a1426',bot:'#3a2c4a'},acc=(t!=null&&LC[t])||'#e8e0cf';
  const g=c.createLinearGradient(0,0,0,W);g.addColorStop(0,p.top);g.addColorStop(1,p.bot||p.far||'#222');c.fillStyle=g;c.fillRect(0,0,W,W);
  const rg=c.createRadialGradient(W/2,W*.62,0,W/2,W*.62,W*.5);rg.addColorStop(0,rgba(acc,.7));rg.addColorStop(1,rgba(acc,0));c.fillStyle=rg;c.fillRect(0,0,W,W);
  c.scale(2,2);c.strokeStyle='#e8e0cf';c.lineWidth=2;c.lineCap='round';c.beginPath();c.moveTo(44,44);c.quadraticCurveTo(40,28,28,22);c.moveTo(52,44);c.quadraticCurveTo(56,28,68,22);c.stroke();
  c.fillStyle='#0b0910';c.beginPath();c.arc(48,56,13,0,TAU);c.fill();c.fillStyle='#ffbf5e';c.beginPath();c.arc(43,56,2.4,0,TAU);c.arc(53,56,2.4,0,TAU);c.fill();
  return tr.capaGerada=cv.toDataURL('image/png')}
const capaDe=tr=>tr.capa||capaGerada(tr);
function legendaFaixa(tr){const a=tr.areas&&tr.areas.length?tr.areas:tr.region>=0?[tr.region]:[];
  if(tr.combateDe)return'Combate · '+tr.combateDe.map(i=>secs[i].dataset.name).join(', ');if(tr.segredo)return'Salas secretas';
  if(a.length)return a.map(i=>secs[i].dataset.name).join(', ');return tr.builtin?`Trilha original · ${NOME_SITE}`:'Só na lista'}
function renderTrackList(){const ol=$('ptracks');if(!ol)return;$('mQtd').textContent=`(${MUS.list.length})`;
  if($('mLista').open||!ol.children.length||ol.dataset.n!==String(MUS.list.length)){ol.innerHTML='';ol.dataset.n=MUS.list.length;MUS.list.forEach((t,k)=>{const li=document.createElement('li'),b=document.createElement('button');b.type='button';
    b.innerHTML='<span class="n"></span><span class="t"></span><span class="d"></span>';b.children[1].textContent=t.title;b.children[2].textContent=t.combateDe?'⚔':t.segredo?'✧':(t.areas&&t.areas.length?roman[t.areas[0]]:t.region>=0?roman[t.region]:'');
    b.title=legendaFaixa(t);b.onclick=()=>{MUS.manual=true;musicSelect(k,true)};li.appendChild(b);ol.appendChild(li)})}
  [...ol.children].forEach((li,k)=>{const b=li.firstChild,on=k===MUS.idx;b.classList.toggle('on',on);b.setAttribute('aria-current',on?'true':'false');b.children[0].textContent=on&&MUS.playing?'♪':String(k+1)})}
function uiPlayer(){const tr=curTrack();if(!tr)return;$('ptitle').textContent=tr.title;$('partist').textContent=legendaFaixa(tr);
  const capa=capaDe(tr);for(const id of['mCapa','mCapaMini'])if($(id).getAttribute('src')!==capa)$(id).src=capa;
  $('pplay').innerHTML=MUS.playing?ICON.pause:ICON.play;$('pplay').setAttribute('aria-label',MUS.playing?'Pausar':'Tocar');$('pmute').innerHTML=SET.muted?ICON.mute:ICON.vol;$('pmute').setAttribute('aria-label',SET.muted?'Ativar som da música':'Silenciar música');
  $('pfollow').setAttribute('aria-pressed',SET.follow);$('pvol').value=Math.round(SET.vol*100);$('musica').classList.toggle('tocando',MUS.playing);
  $('mDisco').setAttribute('aria-label',(MUS.playing?'Tocando: ':'Música: ')+tr.title+'. Abrir o player');renderTrackList();
  if('mediaSession'in navigator&&typeof MediaMetadata==='function'){try{navigator.mediaSession.metadata=new MediaMetadata({title:tr.title,artist:legendaFaixa(tr),album:NOME_SITE,artwork:[{src:new URL(capa,location.href).href,sizes:'512x512'}]});navigator.mediaSession.playbackState=MUS.playing?'playing':'paused'}catch(e){}}}
if('mediaSession'in navigator){try{const ms=navigator.mediaSession;ms.setActionHandler('play',()=>musicPlay());ms.setActionHandler('pause',()=>musicPause());ms.setActionHandler('nexttrack',()=>{MUS.manual=true;musicNext()});ms.setActionHandler('previoustrack',()=>{MUS.manual=true;musicPrev()})}catch(e){}}
function abrirMusica(abre){const p=$('mPainel');abre=abre??p.hidden;p.hidden=!abre;$('mDisco').setAttribute('aria-expanded',abre);$('musica').classList.toggle('aberto',abre);
  if(MODE==='play'){if(abre)paused=true;else if($('guide').hidden&&$('powModal').hidden)paused=false}if(abre){renderTrackList();$('pplay').focus({preventScroll:true})}}
$('mDisco').onclick=e=>{audioWake(e);abrirMusica()};$('mFechar').onclick=()=>abrirMusica(false);
$('mLista').addEventListener('toggle',()=>{if($('mLista').open){renderTrackList();const on=$('ptracks').querySelector('.on');if(on)on.scrollIntoView({block:'nearest'})}});
document.addEventListener('pointerdown',e=>{if(!$('mPainel').hidden&&!e.target.closest('#musica'))abrirMusica(false)});
let seeking=false;
$('pplay').onclick=()=>musicToggle();$('pnext').onclick=()=>{MUS.manual=true;musicNext()};$('pprev').onclick=()=>{MUS.manual=true;musicPrev()};
$('pseek').addEventListener('input',()=>{seeking=true;$('pcur').textContent=fmt($('pseek').value/1000*musicDur())});
$('pseek').addEventListener('change',()=>{seeking=false;musicSeek($('pseek').value/1000*musicDur())});
$('pvol').addEventListener('input',()=>{setMusicVol($('pvol').value/100);if(SET.muted){setMuted(false);uiPlayer()}});
$('pmute').onclick=()=>{setMuted(!SET.muted);uiPlayer()};
$('pfollow').onclick=()=>{SET.follow=!SET.follow;saveSet();uiPlayer();toast(SET.follow?'A música acompanha a área.':'No Passeio, a música segue a lista.')};
{const anel=$('mFeito'),C=2*Math.PI*29.5;anel.style.strokeDasharray=C;
  setInterval(()=>{const d=musicDur(),t=musicTime();anel.style.strokeDashoffset=C*(1-(d?Math.min(1,t/d):0));if($('mPainel').hidden)return;$('pdur').textContent=fmt(d);if(!seeking){$('pcur').textContent=fmt(t);$('pseek').value=d?Math.round(t/d*1000):0}},250)}

async function blobImg(blob){try{return await createImageBitmap(blob)}catch(e){return await new Promise((res,rej)=>{const im=new Image();im.onload=()=>res(im);im.onerror=rej;im.src=URL.createObjectURL(blob)})}}
const FONT_DEF={display:"'Cinzel','Trajan Pro',Georgia,serif",body:"'Cormorant Garamond','Garamond',Georgia,serif"};let fontN=0;
async function applyFont(role,blob,gname){const prop=role==='display'?'--display':'--body',def=FONT_DEF[role];
  if(gname){gname=String(gname).replace(/[^\p{L}\p{N} ]/gu,'').trim();if(!gname)return;let l=$('gf-'+role);if(!l){l=document.createElement('link');l.rel='stylesheet';l.id='gf-'+role;document.head.appendChild(l)}l.href='https://fonts.googleapis.com/css2?family='+gname.replace(/ /g,'+')+'&display=swap';document.documentElement.style.setProperty(prop,`'${gname}',${def}`);return}
  if(!blob){document.documentElement.style.setProperty(prop,def);const l=$('gf-'+role);if(l)l.remove();return}
  const fam='FonteAtlas'+role+(++fontN),ff=new FontFace(fam,await blob.arrayBuffer());await ff.load();document.fonts.add(ff);document.documentElement.style.setProperty(prop,`'${fam}',${def}`)}
async function decodeAudio(blob){const C=audioInit();if(!C)throw new Error('sem áudio');const ab=await blob.arrayBuffer();return await new Promise((res,rej)=>{const p=C.decodeAudioData(ab,res,rej);if(p&&p.then)p.then(res,rej)})}
function addUserTrack(blob,title,region,id,tema){const el=new Audio(URL.createObjectURL(blob));el.preload='metadata';const tr={id,title,region:region==null?-1:+region,tema:tema==null?null:+tema,builtin:false,el};MUS.list.push(tr);uiPlayer();return tr}
function rerenderSection(i){rerenderRegion(i)}

/* panels */
function openGuide(tab){$('guide').hidden=false;paused=true;showTab(tab||'comeco');$('guide').querySelector('.x').focus()}
function closePanels(){$('guide').hidden=true;$('powModal').hidden=true;for(const id of['painelJogo','ovoModal']){const m=$(id);if(m)m.hidden=true}abrirMusica(false);paused=false}
$('openGuide').onclick=()=>openGuide();
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=closePanels);
document.querySelectorAll('[data-guide]').forEach(b=>b.onclick=()=>openGuide(b.dataset.guide));
$('guide').addEventListener('click',e=>{if(e.target===$('guide'))closePanels()});

/* guide */
const GUIDE={
comeco:['Começo',`<h4>O que é este site</h4>
<p>Um portfólio escolar em forma de mapa. Cada área do mapa é uma matéria, com as atividades, os projetos e os trabalhos dela. Quem visita lê tudo rolando a página; o jogo é uma camada extra.</p>
<ul><li><b>Conteúdo</b>: vem de <code>conteudo/portfolio.json</code>. Mudar o arquivo muda o site (veja a aba "Conteúdo").</li>
<li><b>Cenários</b>: um mapa 2D de salas, corredores e poços, como num metroidvania. Cada área é uma região do mapa e escolhe um dos oito temas pintados em código. O minimapa do canto mostra onde o personagem está.</li>
<li><b>Personagem, inimigos, fontes, sons e músicas</b>: vêm da pasta <code>recursos/</code> (veja a aba "Pasta recursos").</li></ul>
<h4>Dois modos</h4>
<ul><li><b>Passeio</b>: o site rola normalmente e o personagem atravessa o mapa sozinho ao fundo, atrás do texto (para os lados e para baixo). A música toca como uma playlist.</li>
<li><b>Jogo</b>: você controla o personagem pelo mapa (teclado ou toque). O texto some para a fase aparecer; volte ao Passeio para ler.</li></ul>
<h4>Onde trocar cada peça</h4>
<div class="tw"><table><tr><th>Peça</th><th>Onde trocar</th></tr>
<tr><td>Textos, matérias, atividades, imagens</td><td><code>conteudo/portfolio.json</code> e <code>conteudo/</code></td></tr>
<tr><td>Fontes dos títulos e do texto</td><td><code>recursos/fontes/</code></td></tr>
<tr><td>Personagem</td><td><code>recursos/personagem/</code></td></tr>
<tr><td>Inimigos</td><td><code>recursos/inimigos/inimigos.json</code></td></tr>
<tr><td>Fundo de cada área</td><td><code>recursos/fundos/</code></td></tr>
<tr><td>HUD (medidor de luz e máscaras de vida)</td><td><code>recursos/hud/</code></td></tr>
<tr><td>Efeitos sonoros e músicas</td><td><code>recursos/sons/</code> e <code>recursos/musicas/</code></td></tr></table></div>`],
conteudo:['Conteúdo',`<h4>O arquivo <code>conteudo/portfolio.json</code></h4>
<p>Tudo o que se lê no site sai dele: nome, apresentação, matérias, atividades, sobre e contato. A quantidade de áreas é a quantidade de matérias.</p>
<pre>{
  "site":   { "nome": "…", "subtitulo": "Portfólio de …" },
  "perfil": { "nome": "…", "titulo": "…", "resumo": "…", "foto": "conteudo/imagens/foto.jpg",
              "links": [{ "rotulo": "GitHub", "url": "https://…" }],
              "contato": { "email": "…", "cidade": "…", "formulario": "https://formspree.io/f/…" } },
  "areas": [ { "id": "humanas", "materia": "Humanas", "titulo_area": "…",
               "periodo": "…", "descricao": "…", "competencias": ["…"],
               "disciplinas": ["História", "Geografia"],
               "tema": "cidadela", "atividades": [ … ], "jogo": { … } } ],
  "sobre": "…"
}</pre>
<h4>Cada atividade</h4>
<pre>{ "id": "projeto-1", "titulo": "…", "disciplina": "História",
  "trimestre": 1, "tipo": "projeto", "resumo": "uma frase", "descricao": "texto completo",
  "imagens": ["conteudo/atividades/projeto-1/capa.webp"],
  "embed": "https://www.youtube.com/watch?v=…",
  "links": [{ "rotulo": "Ver arquivo", "url": "conteudo/atividades/projeto-1/arquivo.pdf" }],
  "habilidades": ["C3", "H15 – …"], "tags": ["…"], "destaque": true }</pre>
<ul><li><code>disciplina</code>: a matéria dentro da área; no Técnico, a submatéria (a área usa <code>submaterias</code> no lugar de <code>disciplinas</code>). Acima da lista, um botão por disciplina filtra as atividades.</li>
<li><code>trimestre</code>: 1, 2 ou 3 (sem ele, aparece a <code>data</code>, como <code>"2025-03"</code>).</li>
<li><code>tipo</code>: projeto, trabalho, prova, apresentação ou outro.</li>
<li><code>destaque</code>: aparece primeiro, com selo.</li>
<li><code>embed</code>: o trabalho dentro do site (YouTube, Canva, Google Docs, Padlet ou PDF). Só carrega quando a pessoa clica em "Ver aqui".</li>
<li><code>habilidades</code>: fechadas, mostram só os códigos (C3 · H15); o texto abre com um clique. Para Arduino e parecidos, <code>materiais</code> e <code>codigo</code> viram Montagem e Código.</li>
<li>A 1ª imagem vira a miniatura da atividade na lista da área. Sem imagem, a miniatura usa a capa do vídeo (se houver) ou o desenho do tipo.</li>
<li>Com <code>contato.formulario</code> (Formspree ou parecido), Sobre e contato mostra um formulário que envia sem sair da página.</li><li>Cada área aparece resumida (primeira frase da descrição, contagens e lista curta); <b>Abrir registro</b> mostra tudo. <code>site.atividades_visiveis</code> diz quantas atividades aparecem antes do "+ N".</li>
<li>Na <code>descricao</code>, uma linha em branco (<code>\\n\\n</code>) separa parágrafos.</li>
<li>Cada atividade tem endereço próprio: <code>#humanas/projeto-1</code>. Dá para mandar o link direto.</li>
<li>Texto entre colchetes, como <code>[e-mail]</code>, aparece destacado: é o que ainda falta preencher.</li></ul>
<h4>Temas</h4>
<p><code>cinzaraiz</code>, <code>galerias</code>, <code>sendas</code>, <code>brejo</code>, <code>cidadela</code>, <code>minas</code>, <code>ninho</code>, <code>fosso</code>. Dois ou mais matérias podem usar o mesmo tema: o site muda a cor automaticamente. O início e o fim usam <code>tema_inicio</code> e <code>tema_final</code> em <code>site</code>.</p>
<h4>Abertura</h4>
<p>Em <code>abertura</code>, <code>falas</code> são os textos que aparecem e <code>mostrar</code> pode ser <code>sempre</code>, <code>uma_vez_por_sessao</code> ou <code>nunca</code>. O botão "Rever abertura" no início toca de novo.</p>`],
pasta:['Pasta recursos',`<h4>Colocar arquivos sem configurar nada</h4>
<p>Publicado (GitHub Pages) ou rodando no seu computador, o site procura arquivos com nomes fixos dentro de <code>recursos/</code>. O índice <code>recursos/indice.json</code>, gerado sozinho pelo GitHub, diz o que existe; a lista no fim desta aba mostra o que foi encontrado e o que falta.</p>
<div class="tw"><table><tr><th>Pasta</th><th>Nomes dos arquivos</th><th>Formatos</th></tr>
<tr><td>fontes/</td><td>titulo, texto</td><td>.woff2 .woff .ttf .otf</td></tr>
<tr><td>personagem/</td><td>uma pasta por animação (idle/, run/…) ou a lista <code>files</code> do <code>settings.json</code></td><td>.png</td></tr>
<tr><td>inimigos/</td><td><code>inimigos.json</code> + uma pasta por inimigo; ou besouro, mosca, saltador, aranha, sentinela, pendente, agua-viva</td><td>.png .webp</td></tr>
<tr><td>fundos/</td><td>o id da área (humanas, matematica…) ou o nome do tema (cinzaraiz…fosso)</td><td>.jpg .png .webp</td></tr>
<tr><td>hud/</td><td><code>alma.png</code> (o medidor de luz) e <code>mascara/</code> com uma pasta de quadros por estado: cheia, brilho, cura, vazia, quebrar (a máscara no meio de cada imagem)</td><td>.png .webp</td></tr>
<tr><td>sons/</td><td>pulo, salto-duplo, pouso, passo, golpe, acerto, dano, coleta, avanco, morte, inimigo-morre; ou os nomes do pacote do personagem (<code>hero_jump.wav</code>…) em qualquer subpasta; vozes das criaturas em <code>sons/inimigos/&lt;pasta&gt;/&lt;evento&gt;.wav</code></td><td>.ogg .mp3 .wav</td></tr>
<tr><td>musicas/</td><td>qualquer nome (todas entram no player); cada área pega a faixa de nome parecido (Dirtmouth, City of Tears…) ou o que estiver em <code>musicas.json</code>; o id da área ou o tema também valem; as imagens da pasta viram as capas</td><td>.mp3 .ogg .m4a · capas .jpg .png .webp</td></tr></table></div>
<h4>Inimigos: onde aparecem</h4>
<p>Em <code>inimigos.json</code>, o campo <code>regioes</code> aceita o id da área (<code>"humanas": 2</code>), o nome do tema (<code>"cidadela": 1</code>, vale para todas as áreas com esse tema) ou o número da seção no mapa (1 = início).</p>
<h4>Personagem</h4>
<ul><li>Quadros em PNG com fundo transparente, numerados na ordem em que tocam. O site alinha todos pelos pés.</li>
<li>Se os quadros olham para a esquerda, use <code>"faces_left": true</code> em <code>personagem/settings.json</code>.</li>
<li>Só aparecem os efeitos das pastas <code>fx-…</code>.</li></ul>
<h4>Rodar no computador</h4>
<p>O navegador só lê as pastas com o site num servidor. Na pasta do projeto, rode <code>python -m http.server 8000</code> e abra <code>http://localhost:8000</code>. A lista completa está em <code>recursos/LEIA-ME.md</code>.</p>
<h4>O que o site encontrou</h4>
<p class="note">✓ encontrado · ainda não colocado · ✕ com problema</p>
<ul class="flist" id="folderList"><li class="off">Procurando arquivos…</li></ul>`],
personagem:['Personagem',`<h4>As pastas do personagem</h4>
<p>Cada animação é uma pasta dentro de <code>recursos/personagem/</code>, com os quadros em PNG transparente, numerados na ordem em que tocam. O site alinha todos pelos pés e acerta a escala sozinho.</p>
<div class="tw"><table><tr><th>Animação</th><th>Pasta</th><th>Sugestão</th></tr>
<tr><td>Parado</td><td>idle</td><td>6 a 9 quadros, 8 fps</td></tr><tr><td>Correr</td><td>run</td><td>6 a 8 quadros, 12 a 14 fps</td></tr>
<tr><td>Pular / cair</td><td>jump / fall</td><td>2 a 6 quadros</td></tr><tr><td>Golpe</td><td>attack, attack-up, attack-down</td><td>3 a 5 quadros (o golpe dura 0,22 s)</td></tr>
<tr><td>Avanço</td><td>dash</td><td>2 a 6 quadros</td></tr><tr><td>Dano / morte</td><td>hurt / death</td><td>1 a 10 quadros</td></tr></table></div>
<ul><li>Se os quadros olham para a esquerda, use <code>"faces_left": true</code> em <code>personagem/settings.json</code>. Lá também ficam o <code>fps</code> e o <code>loop</code> de cada animação.</li>
<li>A lista completa (poderes, efeitos <code>fx-…</code>) está em <code>recursos/LEIA-ME.md</code>.</li></ul>`],
inimigos:['Inimigos',`<h4>Os inimigos do dono</h4>
<p>Ficam em <code>recursos/inimigos/inimigos.json</code>: pasta, áreas, comportamento e as animações por papel. Comportamentos: andar, vagar, investir, guarda, duelista, emboscar, saltitar, perseguir, quicar, mergulhar, teto, aranha, atirar, mae, rastejar, laser, concha, ogro, esporo, nuvem, flutuar (e os antigos pular, parado, voar). Papéis: andar, parado, correr, virar, alerta, preparar, atacar, recuperar, esquivar, pular, defender, defender_cima, preparar2, atacar2, recuperar2, preparar_cima, atacar_cima, recuperar_cima, escondido, surgir, sumir, fugir, explodir, ferido, dormir, acordar, fechar, fechado, abrir, descer, trabalhar, nuvem, morrer, morrer_ar, projetil, projetil_fim. Um papel pode juntar duas pastas: <code>"atacar": ["Attack (Part 1)", "Attack (Part 2)"]</code>. Se as animações olham para lados diferentes, <code>olha_esquerda</code> pode ser por papel: <code>{ "padrao": true, "atacar": false }</code>. Eles percebem o jogador dentro do <code>alcance</code> e com linha de visão, viram para ele antes de atacar e, no Passeio, reagem sem machucar. A lista completa está em <code>recursos/LEIA-ME.md</code>.</p>
<h4>As criaturas desenhadas em código</h4>
<p>Aparecem onde ainda não há inimigos do dono (com <code>"substituir_originais": true</code>, somem das áreas que já têm).</p>
<div class="tw"><table><tr><th>Tipo</th><th>Tema</th><th>Comportamento</th></tr>
<tr><td>Besouro rastejante</td><td>cinzaraiz, galerias, sendas, minas</td><td>patrulha o chão</td></tr>
<tr><td>Mosca voadora</td><td>quase todos</td><td>paira e persegue no modo Jogo</td></tr>
<tr><td>Saltador de cogumelo</td><td>brejo</td><td>pula enquanto anda</td></tr>
<tr><td>Aranha</td><td>ninho</td><td>patrulha rápido</td></tr>
<tr><td>Sentinela</td><td>cidadela</td><td>alta, anda devagar</td></tr>
<tr><td>Criatura do teto</td><td>ninho</td><td>sobe e desce por um fio</td></tr>
<tr><td>Água-viva de luz</td><td>fosso</td><td>flutua, não causa dano</td></tr></table></div>`],
fundos:['Fundos',`<h4>Como os fundos se encaixam</h4>
<p>O mundo é um mapa de salas ligadas (salões, corredores, poços), desenhado em três planos: o <b>fundo</b> de cada sala (mais distante, anda devagar), a <b>rocha</b> com o chão, as plataformas e os enfeites, e a <b>frente</b> desfocada. A imagem vai para o <b>fundo</b> de todas as salas da área; a rocha e o chão continuam no lugar.</p>
<ul><li>Tamanho sugerido: perto de <b>2400 × 1400 px</b> (paisagem). Ela aparece pelas aberturas das salas, por trás da rocha.</li>
<li><b>Cobrir</b> preenche tudo e corta as sobras. <b>Conter</b> mostra a imagem inteira.</li>
<li><b>Substituir</b> troca o fundo pintado. <b>Sobrepor</b> mistura por cima, com a opacidade escolhida.</li></ul>`],
sons:['Sons',`<h4>Os eventos</h4>
<p>Sem arquivos com esses nomes, o site usa os do pacote do personagem que estiverem em <code>recursos/sons/</code> (<code>hero_jump.wav</code>, <code>hero_dash.wav</code>, <code>hero_run_footsteps_stone.wav</code>…) e sintetiza o resto, inclusive as vozes das criaturas e os sons do cenário (vasos, lanternas, folhas). A tabela completa está em <code>recursos/LEIA-ME.md</code>.</p>
<div class="tw"><table><tr><th>Evento</th><th>Quando toca</th></tr>
<tr><td>Pulo</td><td>ao sair do chão</td></tr><tr><td>Salto duplo</td><td>no segundo pulo</td></tr><tr><td>Pouso</td><td>ao tocar o chão</td></tr><tr><td>Passo</td><td>a cada passo correndo</td></tr>
<tr><td>Golpe</td><td>ao atacar</td></tr><tr><td>Acerto</td><td>quando o golpe acerta</td></tr><tr><td>Dano</td><td>quando o personagem é atingido</td></tr><tr><td>Coleta</td><td>ao pegar um fragmento de luz</td></tr>
<tr><td>Avanço</td><td>no avanço rápido</td></tr><tr><td>Morte</td><td>ao perder ou cair no fundo do mapa</td></tr><tr><td>Inimigo derrotado</td><td>quando uma criatura cai</td></tr></table></div>
<ul><li>Corte o silêncio do começo. Passo e golpe tocam muito: deixe-os com menos de 0,3 s.</li>
</ul>`],
musica:['Música',`<h4>O player</h4>
<ul><li>Tocar, pausar, voltar, avançar, barra de posição, volume, silenciar e lista de faixas.</li>
<li>No Passeio, a música é uma playlist: toca em sequência e não troca sozinha.</li>
<li>O ícone de alfinete liga "acompanhar área": cada área toca a sua faixa.</li>
<li>No modo Jogo a música sempre acompanha a área e troca devagar. Perto de uma briga entra a versão de combate da faixa ("… (Action)", se existir); nas salas secretas, a faixa "Dream".</li></ul>
<p>Os navegadores só permitem som depois de um clique ou tecla, por isso a música começa no seu primeiro toque na página.</p>
<h4>Suas músicas</h4>
<p>Coloque em <code>recursos/musicas/</code> com qualquer nome: todas entram no player. A faixa de cada área vem do nome do arquivo (<code>humanas.mp3</code>), de <code>musicas/musicas.json</code> ou da tabela de nomes parecidos do LEIA-ME. As imagens da pasta viram as capas (veja <code>capas.json</code> no LEIA-ME).</p>`],
controles:['Controles',`<h4>Passeio</h4>
<p>O site rola normalmente. O personagem anda, pula entre as plataformas, desce pelas fendas e golpeia criaturas sozinho, acompanhando a rolagem. O mapa à direita leva a cada área.</p>
<h4>Jogo</h4>
<div class="tw"><table><tr><th>Ação</th><th>Teclado</th><th>Toque</th></tr>
<tr><td>Andar</td><td>A D ou ← →</td><td>◀ ▶</td></tr><tr><td>Pular</td><td>Espaço ou Z (segure para pular mais alto)</td><td>⤒</td></tr>
<tr><td>Salto duplo</td><td>pular de novo no ar</td><td>⤒ no ar</td></tr><tr><td>Golpe</td><td>J ou X</td><td>✦</td></tr>
<tr><td>Golpe para cima</td><td>W ou ↑ + golpe</td><td>▲ + ✦</td></tr><tr><td>Golpe para baixo (quica)</td><td>S ou ↓ + golpe no ar</td><td>▼ + ✦</td></tr>
<tr><td>Avanço</td><td>K, C ou Shift</td><td>»</td></tr><tr><td>Ler uma placa, examinar uma relíquia, abrir a página que acabou de pegar</td><td>W, ↑ ou E</td><td>▲</td></tr><tr><td>Poderes</td><td>I (ou Tab, só no Jogo)</td><td>botão Poderes</td></tr><tr><td>Ir para uma área</td><td>clique no mapa à direita</td><td>Passeio, rolar, Jogo</td></tr></table></div>
<ul><li>Cada matéria tem uma <b>placa de pedra</b> no salão (o resumo da área) e as atividades viram <b>páginas soltas</b> pelas salas: encoste para pegar.</li>
<li>Depois da câmara de cada área, uma ala segue para os lados. No fim dela há uma <b>parede com trincas</b>: golpeie três vezes. O que você acha fica guardado neste navegador.</li>
<li>Você tem 5 máscaras de vida. Ao perder todas, volta ao último chão firme.</li>
<li>Criaturas derrotadas soltam fragmentos de luz, contados no painel.</li>
<li>Para descer, procure a fenda brilhante no chão de cada área.</li>
<li>Com o Guia, os Poderes ou o player de música abertos, o jogo pausa.</li></ul>`]};
const gt=$('gtabs');Object.entries(GUIDE).forEach(([k,[n]])=>{const b=document.createElement('button');b.type='button';b.role='tab';b.dataset.tab=k;b.textContent=n;b.onclick=()=>showTab(k);gt.appendChild(b)});
function showTab(k){if(!GUIDE[k])k='comeco';$('gbody').innerHTML=GUIDE[k][1];if(k==='pasta'&&typeof renderFolderStatus==='function')renderFolderStatus();$('gbody').scrollTop=0;gt.querySelectorAll('button').forEach(b=>b.setAttribute('aria-selected',b.dataset.tab===k))}


