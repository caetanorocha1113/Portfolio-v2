/* ---------- poderes: habilidades do personagem, liberadas uma a uma conforme forem construídas ---------- */
/* estado: 'liberado' funciona no modo Jogar; 'bloqueado' ainda está em construção.
   Para liberar um poder: troque o estado para 'liberado'; a ação dele fica em PODER_ACAO (js/08-pasta-recursos.js). */
const PODERES=[
 {id:'avanco',nome:'Avanço',grupo:'Movimento',tecla:'K, C ou Shift',estado:'liberado',
  desc:'Avanço rápido no chão ou no ar. Durante o avanço, o personagem não leva dano.',anims:['dash','fx-dash'],
  icone:'M3 12h12M6 7h9M6 17h9M15 6l6 6-6 6'},
 {id:'salto_duplo',nome:'Salto duplo',grupo:'Movimento',tecla:'pular de novo no ar',estado:'liberado',
  desc:'Um segundo pulo no ar.',anims:['double-jump','fx-double-jump'],
  icone:'M12 21V10M12 10C9 4 3 5 4 11c1 4 5 4 8-1M12 10c3-6 9-5 8 1-1 4-5 4-8-1'},
 {id:'garras',nome:'Escalar paredes',grupo:'Movimento',tecla:'encostar na parede e pular',estado:'bloqueado',
  desc:'Agarra nas paredes, desliza devagar e salta delas para subir.',anims:['wall-slide','wall-jump'],
  icone:'M5 21c2-6 2-12 0-17M10 21c2-6 2-12 0-17M15 21c2-6 2-12 0-17M20 4v17'},
 {id:'corrida',nome:'Super avanço',grupo:'Movimento',tecla:'segurar L e soltar',estado:'bloqueado',
  desc:'Carrega e dispara numa corrida longa em linha reta, atravessando abismos.',anims:['superdash-charge','superdash','fx-superdash'],
  icone:'M12 3l5 9-5 9-5-9zM2 12h4M18 12h4'},
 {id:'nevoa',nome:'Avanço sombrio',grupo:'Melhoria',tecla:'avanço',estado:'bloqueado',
  desc:'O avanço passa a atravessar criaturas.',anims:['shadow-dash','fx-shadow-dash'],
  icone:'M4 14c2-3 5-3 7 0s5 3 7 0M6 9c2-3 5-3 7 0s5 3 7 0M4 19c2-3 5-3 7 0'},
 {id:'faisca',nome:'Magia para frente',grupo:'Magia',custo:33,tecla:'F',estado:'bloqueado',
  desc:'Lança um projétil para frente.',anims:['spell','fx-spell'],
  icone:'M12 2l2 8 8 2-8 2-2 8-2-8-8-2 8-2z'},
 {id:'queda',nome:'Magia para baixo',grupo:'Magia',custo:33,tecla:'S + F no ar',estado:'bloqueado',
  desc:'Mergulha direto para baixo e explode ao tocar o chão.',anims:['dive','fx-dive'],
  icone:'M12 3v13M7 11l5 5 5-5M4 21c3-2 13-2 16 0'},
 {id:'clarao',nome:'Magia para cima',grupo:'Magia',custo:33,tecla:'W + F',estado:'bloqueado',
  desc:'Uma explosão acima da cabeça, que acerta o que estiver em cima.',anims:['spell-up','fx-spell-up'],
  icone:'M12 21v-6M12 11V3M5 7l3 3M19 7l-3 3M3 15h4M17 15h4'},
 {id:'reacender',nome:'Cura',grupo:'Magia',custo:33,tecla:'segurar H',estado:'bloqueado',
  desc:'Concentra energia para recuperar uma máscara de vida.',anims:['heal','fx-heal'],
  icone:'M12 22c4 0 6-3 6-6 0-4-4-6-4-10-3 2-4 5-3 7-2-1-3-3-3-3-2 3-2 6-2 6 0 3 2 6 6 6z'}
];
/* ações dos poderes: ficam em PODER_ACAO, declarado em js/08-pasta-recursos.js (só pode existir uma declaração no site) */
const LUZ_MAX=99,LUZ_POR_ACERTO=11;/* energia: enche ao acertar criaturas, gasta nas magias */
const poderDe=id=>PODERES.find(q=>q.id===id);
const temPoder=id=>{const p=poderDe(id);return!!p&&p.estado==='liberado'};
let lockToastT=0;
function poderBloqueado(id){const p=poderDe(id);if(!p)return;const now=performance.now();if(now-lockToastT<1200)return;lockToastT=now;toast(`Bloqueado: ${p.nome}. Este poder ainda está em construção.`);sfx('trava')}
function usarPoder(id){const p=poderDe(id);if(!p)return;if(p.estado!=='liberado')return poderBloqueado(id);
  const acao=PODER_ACAO[id];if(!acao){toast(`${p.nome} está liberado, mas ainda não tem efeito.`);return}
  if(p.custo&&PL.luz<p.custo){toast('Energia insuficiente. Acerte criaturas para encher o frasco.');sfx('trava');return}
  if(p.custo)PL.luz-=p.custo;acao(p)}

/* painel de poderes: grade de medalhões por grupo (resumo) e, ao lado, o detalhe do poder escolhido */
let powSel=null;
function powDetalhe(p){const d=$('powDet');if(!d||!p)return;const ok=p.estado==='liberado';d.classList.toggle('on',ok);
  d.innerHTML=`<div class="pwd-cab"><svg class="pwd-ic" viewBox="0 0 24 24" aria-hidden="true"><path d="${p.icone}"/></svg><div><p class="pwd-g"></p><h4></h4><p class="pwd-st">${ok?'Liberado':'Bloqueado · em construção'}</p></div></div>
    <p class="pwd-d"></p><dl class="pwd-dl"><div><dt>Controle</dt><dd class="k"></dd></div>${p.custo?`<div><dt>Custo</dt><dd>${p.custo} de energia <span class="pwd-nota">(enche ao acertar criaturas)</span></dd></div>`:''}</dl>
    <details class="pwd-tec"><summary>Para quem monta o jogo</summary><p>Pastas de animação em <code>recursos/personagem/</code>: <span class="an"></span>.</p></details>`;
  d.querySelector('.pwd-g').textContent=p.grupo;d.querySelector('h4').textContent=p.nome;d.querySelector('.pwd-d').textContent=p.desc;
  d.querySelector('.k').append(...String(p.tecla).split(/(\b[A-Z]\b|Shift|Espaço)/).filter(Boolean).map(t=>{if(/^([A-Z]|Shift|Espaço)$/.test(t)){const k=document.createElement('kbd');k.textContent=t;return k}return t}));
  d.querySelector('.an').textContent=p.anims.length?p.anims.join(', '):'nenhuma'}
function renderPoderes(){const g=$('powGrid');if(!g)return;g.innerHTML='';
  const grupos=[...new Set(PODERES.map(p=>p.grupo))],wrap=document.createElement('div');wrap.className='pw-grupos';const slots=[];
  for(const gr of grupos){const sec=document.createElement('section');sec.className='pw-grupo';const h=document.createElement('h4');h.textContent=gr;const row=document.createElement('div');row.className='pw-slots';row.setAttribute('role','listbox');row.setAttribute('aria-label',gr);
    for(const p of PODERES.filter(q=>q.grupo===gr)){const ok=p.estado==='liberado',b=document.createElement('button');b.type='button';b.className='pw-slot'+(ok?' on':'');b.setAttribute('role','option');b.dataset.id=p.id;b.setAttribute('aria-label',p.nome+(ok?'':' (bloqueado)'));b.tabIndex=-1;
      b.innerHTML=`<svg viewBox="0 0 64 64" aria-hidden="true"><circle class="pw-aro" cx="32" cy="32" r="27"/><circle class="pw-aro2" cx="32" cy="32" r="22.5"/><g transform="translate(20 20)"><path class="pw-ic" d="${p.icone}"/></g>${ok?'':'<path class="pw-trava" d="M47 45h9v8h-9zM48.6 45v-2.4a2.9 2.9 0 0 1 5.8 0V45"/>'}</svg><span class="pw-nome"></span>`;
      b.querySelector('.pw-nome').textContent=p.nome;
      b.onmouseenter=b.onfocus=()=>powDetalhe(p);b.onmouseleave=()=>powDetalhe(poderDe(powSel)||p);
      b.onclick=()=>{powSel=p.id;slots.forEach(x=>x.setAttribute('aria-selected',String(x===b)));powDetalhe(p)};
      row.appendChild(b);slots.push(b)}
    sec.append(h,row);wrap.appendChild(sec)}
  const det=document.createElement('article');det.className='pw-det';det.id='powDet';det.setAttribute('aria-live','polite');
  g.append(wrap,det);
  /* setas do teclado andam entre os medalhões */
  wrap.onkeydown=e=>{const k=slots.indexOf(document.activeElement);if(k<0)return;const d=e.key==='ArrowRight'||e.key==='ArrowDown'?1:e.key==='ArrowLeft'||e.key==='ArrowUp'?-1:0;if(!d)return;e.preventDefault();const n=slots[(k+d+slots.length)%slots.length];slots.forEach(x=>x.tabIndex=-1);n.tabIndex=0;n.focus()};
  const ini=poderDe(powSel)||PODERES.find(p=>p.estado==='liberado')||PODERES[0];powSel=ini.id;const b0=slots.find(x=>x.dataset.id===ini.id);b0.tabIndex=0;b0.setAttribute('aria-selected','true');powDetalhe(ini);
  const n=PODERES.filter(p=>p.estado==='liberado').length;$('powInfo').innerHTML=`<span class="pw-cont">${PODERES.map(p=>`<i class="${p.estado==='liberado'?'on':''}"></i>`).join('')}</span> ${n} de ${PODERES.length} liberados. Os outros chegam aos poucos.`}
function openPoderes(){renderPoderes();$('powModal').hidden=false;paused=true;$('powModal').querySelector('.x').focus()}
$('openPow').onclick=()=>$('powModal').hidden?openPoderes():closePanels();
$('powModal').addEventListener('click',e=>{if(e.target===$('powModal'))closePanels()});
