/* ---------- poderes: habilidades originais de Lume, liberadas uma a uma conforme forem construídas ---------- */
/* estado: 'liberado' funciona no modo Jogar; 'bloqueado' ainda está em construção.
   Para liberar um poder: troque o estado para 'liberado' e escreva a ação dele em PODER_ACAO (mais abaixo). */
const PODERES=[
 {id:'avanco',nome:'Rajada de Pó',grupo:'Movimento',tecla:'K, C ou Shift',estado:'liberado',
  desc:'Avanço rápido no chão ou no ar. Durante o avanço, Lume não leva dano.',anims:['avanco','efeito-avanco'],
  icone:'M3 12h12M6 7h9M6 17h9M15 6l6 6-6 6'},
 {id:'salto_duplo',nome:'Asas de Seda',grupo:'Movimento',tecla:'pular de novo no ar',estado:'liberado',
  desc:'Um segundo pulo no ar, batendo as asas de mariposa.',anims:['salto-duplo','efeito-salto-duplo'],
  icone:'M12 21V10M12 10C9 4 3 5 4 11c1 4 5 4 8-1M12 10c3-6 9-5 8 1-1 4-5 4-8-1'},
 {id:'garras',nome:'Garras de Raiz',grupo:'Movimento',tecla:'encostar na parede e pular',estado:'bloqueado',
  desc:'Lume se agarra nas paredes, desliza devagar e salta delas para subir.',anims:['parede','salto-parede'],
  icone:'M5 21c2-6 2-12 0-17M10 21c2-6 2-12 0-17M15 21c2-6 2-12 0-17M20 4v17'},
 {id:'corrida',nome:'Corrida de Âmbar',grupo:'Movimento',tecla:'segurar L e soltar',estado:'bloqueado',
  desc:'Lume carrega a lanterna e dispara numa corrida longa em linha reta, atravessando abismos.',anims:['carregar','disparo','efeito-disparo'],
  icone:'M12 3l5 9-5 9-5-9zM2 12h4M18 12h4'},
 {id:'nevoa',nome:'Passo de Névoa',grupo:'Melhoria',tecla:'avanço',estado:'bloqueado',
  desc:'O avanço passa a atravessar criaturas e deixa um rastro de névoa.',anims:['passo-nevoa','efeito-passo-nevoa'],
  icone:'M4 14c2-3 5-3 7 0s5 3 7 0M6 9c2-3 5-3 7 0s5 3 7 0M4 19c2-3 5-3 7 0'},
 {id:'faisca',nome:'Faísca da Lanterna',grupo:'Luz',custo:33,tecla:'F',estado:'bloqueado',
  desc:'Lança uma faísca de luz para frente, que voa até bater em algo.',anims:['lancar','efeito-faisca'],
  icone:'M12 2l2 8 8 2-8 2-2 8-2-8-8-2 8-2z'},
 {id:'queda',nome:'Queda de Cinza',grupo:'Luz',custo:33,tecla:'S + F no ar',estado:'bloqueado',
  desc:'Mergulha direto para baixo e espalha uma onda de cinza ao tocar o chão.',anims:['mergulho','efeito-mergulho'],
  icone:'M12 3v13M7 11l5 5 5-5M4 21c3-2 13-2 16 0'},
 {id:'clarao',nome:'Clarão',grupo:'Luz',custo:33,tecla:'W + F',estado:'bloqueado',
  desc:'Uma explosão de luz acima da cabeça, que acerta tudo que estiver em cima.',anims:['clarao','efeito-clarao'],
  icone:'M12 21v-6M12 11V3M5 7l3 3M19 7l-3 3M3 15h4M17 15h4'},
 {id:'reacender',nome:'Reacender',grupo:'Luz',custo:33,tecla:'segurar H',estado:'bloqueado',
  desc:'Concentra a luz guardada na lanterna para recuperar uma chama de vida.',anims:['acender','efeito-acender'],
  icone:'M12 22c4 0 6-3 6-6 0-4-4-6-4-10-3 2-4 5-3 7-2-1-3-3-3-3-2 3-2 6-2 6 0 3 2 6 6 6z'},
 {id:'pavio',nome:'Pavio Longo',grupo:'Passivo',tecla:'automático',estado:'bloqueado',
  desc:'A lanterna ilumina o dobro nas regiões mais escuras.',anims:[],
  icone:'M9 22h6M10 22V11h4v11M12 11V7M12 7c-2-2 0-5 0-5s2 3 0 5'}
];
/* ações dos poderes: cada poder liberado ganha aqui a sua função quando for construído */
const PODER_ACAO={};
const LUZ_MAX=99,LUZ_POR_ACERTO=11;
const poderDe=id=>PODERES.find(q=>q.id===id);
const temPoder=id=>{const p=poderDe(id);return!!p&&p.estado==='liberado'};
let lockToastT=0;
function poderBloqueado(id){const p=poderDe(id);if(!p)return;const now=performance.now();if(now-lockToastT<1200)return;lockToastT=now;toast(`Bloqueado: ${p.nome}. Este poder ainda está em construção.`);sfx('trava')}
function usarPoder(id){const p=poderDe(id);if(!p)return;if(p.estado!=='liberado')return poderBloqueado(id);
  const acao=PODER_ACAO[id];if(!acao){toast(`${p.nome} está liberado, mas ainda não tem efeito.`);return}
  if(p.custo&&PL.luz<p.custo){toast('Luz insuficiente. Acerte criaturas para encher a lanterna.');sfx('trava');return}
  if(p.custo)PL.luz-=p.custo;acao(p)}

/* painel de poderes */
function renderPoderes(){const g=$('powGrid');if(!g)return;g.innerHTML='';
  for(const p of PODERES){const ok=p.estado==='liberado',card=document.createElement('article');card.className='pow'+(ok?' on':'');
    card.innerHTML=`<svg class="powic" viewBox="0 0 24 24" aria-hidden="true"><path d="${p.icone}"/></svg><div class="powtx"><p class="powg"></p><h4></h4><p class="powd"></p><dl><div><dt>Controle</dt><dd class="k"></dd></div>${p.custo?`<div><dt>Custo</dt><dd>${p.custo} de luz</dd></div>`:''}<div><dt>Animações no JSON</dt><dd class="an"></dd></div></dl></div><span class="powst">${ok?'Liberado':'Bloqueado · em construção'}</span>`;
    card.querySelector('.powg').textContent=p.grupo;card.querySelector('h4').textContent=p.nome;card.querySelector('.powd').textContent=p.desc;card.querySelector('.k').textContent=p.tecla;card.querySelector('.an').textContent=p.anims.length?p.anims.join(', '):'nenhuma';g.appendChild(card)}
  const n=PODERES.filter(p=>p.estado==='liberado').length;$('powInfo').textContent=`${n} de ${PODERES.length} poderes liberados. Os bloqueados serão liberados aos poucos, conforme forem construídos. A luz da lanterna (o frasco do canto) enche quando Lume acerta criaturas e é gasta pelos poderes de luz.`}
function openPoderes(){renderPoderes();$('powModal').hidden=false;paused=true;$('powModal').querySelector('.x').focus()}
$('openPow').onclick=()=>$('powModal').hidden?openPoderes():closePanels();
$('powModal').addEventListener('click',e=>{if(e.target===$('powModal'))closePanels()});
