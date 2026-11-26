/* ---------- conteúdo do portfólio ----------
   Lê conteudo/portfolio.json e monta a página: abertura (início), uma seção por área/matéria,
   cartões de atividade, painel de detalhe com endereço próprio (#area/atividade), Sobre e Contato.
   Só depois carrega o motor visual e de jogo (js/01 a js/09), que pinta os cenários atrás do texto.
   Se o motor falhar, o conteúdo continua lá. Tudo aqui fica dentro de uma função: os únicos nomes
   globais são CONTEUDO e (em 00b) ABERTURA, para não colidir com os scripts do motor. */
(function () {
  'use strict';

  const ARQUIVO = 'conteudo/portfolio.json';
  /* mesma ordem de REG em js/02-regioes.js */
  const TEMAS = ['cinzaraiz', 'galerias', 'sendas', 'brejo', 'cidadela', 'minas', 'ninho', 'fosso'];
  const ACENTO = { cinzaraiz: '#f2d49b', galerias: '#f2a145', sendas: '#8ff0b8', brejo: '#ffc074', cidadela: '#9cc6ff', minas: '#ff9fd4', ninho: '#d8e09a', fosso: '#d9d3ff' };
  const TIPOS = { projeto: 'Projeto', trabalho: 'Trabalho', prova: 'Prova', 'apresentação': 'Apresentação', apresentacao: 'Apresentação', outro: 'Outro' };
  const ICONE_TIPO = {
    projeto: 'M12 2l9 5v10l-9 5-9-5V7zM3 7l9 5 9-5M12 12v10',
    trabalho: 'M6 2h9l5 5v15H6zM15 2v5h5M9 12h8M9 16h8',
    prova: 'M12 3a9 9 0 1 0 0 18 9 9 0 1 0 0-18zM8 12l3 3 5-6',
    'apresentação': 'M3 4h18v11H3zM12 15v5M8 20h8M7 11l3-3 3 3 4-4',
    outro: 'M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3z'
  };
  const FLOREIO = '<svg class="flourish" viewBox="0 0 300 18" aria-hidden="true"><path d="M0 9 H122 M178 9 H300" stroke="currentColor" stroke-width="1"/><path d="M150 1 L158 9 L150 17 L142 9 Z" fill="none" stroke="currentColor"/><circle cx="150" cy="9" r="2" fill="currentColor"/><path d="M122 9 q8 -8 14 0 M178 9 q-8 -8 -14 0" fill="none" stroke="currentColor"/></svg>';

  let pronto;
  const promessa = new Promise(r => { pronto = r; });
  let fontesOk;
  const C = window.CONTEUDO = { dados: null, pronto: promessa, areas: [], secoes: [], fontes: {}, fontesProntas: new Promise(r => { fontesOk = r; }) };

  /* ---------- utilidades ---------- */
  function romano(n) {
    const t = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
    let s = ''; for (const [v, r] of t) while (n >= v) { s += r; n -= v; } return s;
  }
  const slug = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const texto = v => (v == null ? '' : String(v));
  const lista = v => (Array.isArray(v) ? v : v ? [v] : []);
  /* cria um elemento; filhos podem ser texto, elementos ou listas */
  function el(tag, attrs, ...filhos) {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k === 'class') e.className = v;
      else if (k === 'html') e.innerHTML = v;
      else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v === true ? '' : v);
    }
    for (const f of filhos.flat(Infinity)) if (f != null && f !== false) e.append(f instanceof Node ? f : document.createTextNode(String(f)));
    return e;
  }
  /* texto com marcadores [ … ] destacados (o que o dono ainda vai preencher) */
  function comMarcadores(s) {
    const frag = document.createDocumentFragment(), str = texto(s);
    let i = 0;
    for (const m of str.matchAll(/\[[^\]]*\]/g)) {
      if (m.index > i) frag.append(str.slice(i, m.index));
      frag.append(el('span', { class: 'marcador' }, m[0]));
      i = m.index + m[0].length;
    }
    if (i < str.length) frag.append(str.slice(i));
    return frag;
  }
  const soMarcador = s => /^\s*\[[^\]]*\]\s*$/.test(texto(s));
  /* parágrafos: linha em branco separa parágrafos; quebra simples vira <br> */
  function paragrafos(s, cls) {
    return texto(s).split(/\n\s*\n/).filter(p => p.trim()).map(p => {
      const e = el('p', { class: cls });
      p.split('\n').forEach((l, k) => { if (k) e.append(el('br')); e.append(comMarcadores(l)); });
      return e;
    });
  }
  function dataBonita(d) {
    const m = texto(d).match(/^(\d{4})(?:-(\d{1,2}))?/);
    if (!m) return texto(d);
    if (!m[2]) return m[1];
    try { return new Date(+m[1], +m[2] - 1, 1).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }); } catch (e) { return d; }
  }
  /* gira a matiz de uma cor (para temas repetidos ficarem diferentes) */
  function girarCor(hex, graus) {
    if (!graus) return hex;
    let [r, g, b] = [1, 3, 5].map(k => parseInt(hex.slice(k, k + 2), 16) / 255);
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
    let h = 0, s = 0;
    if (d) { s = d / (1 - Math.abs(2 * l - 1)); h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; }
    h = (h + graus + 360) % 360;
    const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2;
    const [R, G, B] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
    return '#' + [R, G, B].map(v => Math.round((v + m) * 255).toString(16).padStart(2, '0')).join('');
  }
  const ehExterno = u => /^(https?:)?\/\//i.test(u) || /^mailto:/i.test(u);
  function imagemDe(item) {
    if (!item) return null;
    if (typeof item === 'string') return { src: item, legenda: '' };
    return item.src ? { src: item.src, legenda: texto(item.legenda || item.alt) } : null;
  }

  /* ---------- dados ---------- */
  function normalizar(d) {
    d.site = d.site || {};
    d.perfil = d.perfil || {};
    d.perfil.contato = d.perfil.contato || {};
    d.abertura = d.abertura || {};
    d.historia = d.historia || {};
    const usados = {}, contagem = {};
    const temaInicio = TEMAS.includes(d.site.tema_inicio) ? d.site.tema_inicio : 'cinzaraiz';
    const temaFinal = TEMAS.includes(d.site.tema_final) ? d.site.tema_final : 'fosso';
    const livres = TEMAS.filter(t => t !== temaInicio && t !== temaFinal);
    d.areas = lista(d.areas).map((a, i) => {
      let id = slug(a.id || a.materia) || 'area-' + (i + 1);
      while (usados[id] || id === 'inicio' || id === 'sobre' || id === 'conteudo') id += '-' + (i + 1);
      usados[id] = 1;
      const tema = TEMAS.includes(a.tema) ? a.tema : livres[i % livres.length];
      const vistos = {};
      const atividades = lista(a.atividades).map((t, k) => {
        let tid = slug(t.id || t.titulo) || 'atividade-' + (k + 1);
        while (vistos[tid]) tid += '-' + (k + 1);
        vistos[tid] = 1;
        const tipo = slug(t.tipo) === 'apresentacao' ? 'apresentação' : (TIPOS[t.tipo] ? t.tipo : 'outro');
        return { ...t, id: tid, tipo, imagens: lista(t.imagens).map(imagemDe).filter(Boolean), links: lista(t.links).filter(l => l && (l.rotulo || l.url)), tags: lista(t.tags) };
      });
      /* destaques primeiro, mantendo a ordem do arquivo dentro de cada grupo */
      atividades.sort((x, y) => (y.destaque ? 1 : 0) - (x.destaque ? 1 : 0));
      return { ...a, id, tema, atividades, competencias: lista(a.competencias), jogo: a.jogo || {} };
    });
    /* variação de cor quando um tema se repete */
    const giros = [0, 34, -34, 68, -68, 102];
    const todas = [temaInicio, ...d.areas.map(a => a.tema), temaFinal];
    const variantes = todas.map(t => { const n = contagem[t] = (contagem[t] || 0) + 1; return giros[(n - 1) % giros.length]; });
    d._temas = { inicio: temaInicio, final: temaFinal, variantes };
    return d;
  }

  /* ---------- montagem das seções ---------- */
  /* uma seção por região do mapa; o cenário é desenhado pelo motor atrás de todas (canvas #mundo) */
  function secao(id, tema, nome, variante, classe, profundidade) {
    const acento = girarCor(ACENTO[tema] || '#e8d3a2', variante);
    return el('section', {
      class: 'realm ' + classe, id, 'data-tema': tema, 'data-variante': variante || null, 'data-name': nome,
      'data-depth': profundidade, style: '--accent:' + acento, 'aria-labelledby': 't-' + id
    });
  }

  /* o mapa do mundo desenhado no início: salas com traço de tinta, o caminho e cada região clicável */
  const SVG = 'http://www.w3.org/2000/svg';
  function sv(tag, attrs, ...filhos) {
    const e = document.createElementNS(SVG, tag);
    for (const [k, v] of Object.entries(attrs || {})) if (v != null) e.setAttribute(k, v);
    for (const f of filhos.flat()) if (f != null) e.append(f instanceof Node ? f : document.createTextNode(String(f)));
    return e;
  }
  function caminhoSala(s) {
    const pts = [], P = MUNDO.PASSO, passo = 6;
    const topo = k => s.ceu ? s.y + s.h * .45 : s.teto[k], chao = k => { const f = s.chao[k]; return f === f ? f : s.y + s.h; };
    for (let k = 0; k < s.n; k += passo) pts.push([s.x + Math.min(k * P, s.w), topo(k)]);
    pts.push([s.x + s.w, topo(s.n - 1)], [s.x + s.w, chao(s.n - 1)]);
    for (let k = s.n - 1; k >= 0; k -= passo) pts.push([s.x + Math.min(k * P, s.w), chao(k)]);
    pts.push([s.x, chao(0)]);
    /* cantos arredondados (duas passadas de Chaikin): o mapa fica com cara de desenhado, igual ao da abertura */
    let q = pts;
    for (let r = 0; r < 2; r++) q = q.flatMap((a, i) => { const c = q[(i + 1) % q.length]; return [[a[0] * .75 + c[0] * .25, a[1] * .75 + c[1] * .25], [a[0] * .25 + c[0] * .75, a[1] * .25 + c[1] * .75]]; });
    return 'M' + q.map(([x, y]) => Math.round(x) + ' ' + Math.round(y)).join('L') + 'Z';
  }
  function mapaDoMundo(m, d) {
    const L = m.limites, pad = 700, vb = [L.x0 - pad, L.y0 + 600 - pad, L.x1 - L.x0 + 2 * pad, L.y1 - L.y0 - 600 + 2 * pad];
    const svg = sv('svg', { viewBox: vb.join(' '), class: 'mapa-svg', role: 'group', 'aria-label': 'Mapa do portfólio: cada região é uma matéria' },
      sv('defs', null, sv('filter', { id: 'tinta-mapa', x: '-5%', y: '-5%', width: '110%', height: '110%' },
        sv('feTurbulence', { type: 'fractalNoise', baseFrequency: '.006', numOctaves: '2', seed: '4' }),
        sv('feDisplacementMap', { in: 'SourceGraphic', scale: '38' }))));
    const rota = 'M' + m.rota.map(n => n.x + ' ' + (n.y - 60)).join('L');
    svg.append(sv('path', { d: rota, class: 'mapa-rota' }));
    m.regioes.forEach((g, i) => {
      const acento = girarCor(ACENTO[g.tema] || '#e8d3a2', g.variante), p = m.salas[g.principal];
      const ty = p.ceu ? p.y + p.h * .75 : p.y + p.h * .62;
      const grupo = sv('a', { href: '#' + g.id, class: 'mapa-reg', style: '--accent:' + acento, 'aria-label': romano(i + 1) + ' · ' + g.nome },
        sv('g', { filter: 'url(#tinta-mapa)' }, g.salas.filter(k => !m.salas[k].secreta).map(k => sv('path', { d: caminhoSala(m.salas[k]), class: 'mapa-sala' }))),
        sv('text', { x: p.x + p.w / 2, y: ty, class: 'mapa-n' }, romano(i + 1)),
        sv('text', { x: p.x + p.w / 2, y: ty + 330, class: 'mapa-nome' }, g.nome));
      svg.append(grupo);
    });
    return svg;
  }

  function montarInicio(d, n) {
    const p = d.perfil, s = d.site, primeira = d.areas[0];
    const sec = secao('inicio', d._temas.inicio, 'Início', d._temas.variantes[0], 'hero', 0);
    const foto = p.foto ? el('img', { class: 'hero-foto', src: p.foto, alt: 'Foto de ' + texto(p.nome), width: 160, height: 160, decoding: 'async' }) : null;
    const desenho = C.mundo ? el('figure', { class: 'mapa-mundo' }, mapaDoMundo(C.mundo, d), el('figcaption', null, 'O mapa. Clique numa região para ir até ela.')) : null;
    const mapa = el('nav', { class: 'atlas-mapa', 'aria-label': 'Mapa das matérias' },
      el('ol', null, d.areas.map((a, i) => el('li', null,
        el('a', { href: '#' + a.id, style: '--accent:' + girarCor(ACENTO[a.tema], d._temas.variantes[i + 1]) },
          el('span', { class: 'am-n' }, romano(i + 2)),
          el('span', { class: 'am-m' }, texto(a.materia)),
          el('span', { class: 'am-t' }, texto(a.titulo_area)))))));
    const copy = el('div', { class: 'copy c' },
      el('p', { class: 'eyebrow' }, 'Crônica de uma jornada'),
      el('h1', { id: 't-inicio' }, texto(s.nome || 'Portfólio')),
      el('div', { html: FLOREIO, class: 'floreio' }),
      el('p', { class: 'hero-sub' }, texto(s.subtitulo || ('Portfólio de ' + texto(p.nome)))),
      p.titulo ? el('p', { class: 'hero-titulo' }, comMarcadores(p.titulo)) : null,
      foto,
      p.resumo ? el('p', { class: 'lede' }, comMarcadores(p.resumo)) : null,
      el('div', { class: 'hero-acoes' },
        primeira ? el('a', { class: 'botao', href: '#' + primeira.id }, 'Ver matérias') : null,
        el('button', { type: 'button', class: 'botao fantasma', id: 'btnJogar', onclick: () => { const b = document.getElementById('mPlay'); if (b) b.click(); } }, 'Jogar'),
        el('button', { type: 'button', class: 'botao-texto', id: 'btnAbertura', onclick: () => window.ABERTURA && window.ABERTURA.tocar(true) }, 'Rever abertura')),
      desenho,
      mapa,
      el('div', { class: 'cue', 'aria-hidden': 'true' }, 'Role para começar a jornada', el('i')));
    sec.append(copy);
    return sec;
  }

  function capa(area, atv, num) {
    const img = atv.imagens[0];
    if (img) return el('div', { class: 'capa' }, el('img', { src: img.src, alt: '', loading: 'lazy', decoding: 'async' }));
    const ic = ICONE_TIPO[atv.tipo] || ICONE_TIPO.outro;
    return el('div', { class: 'capa capa-arte', 'data-n': num },
      el('span', { class: 'capa-n', 'aria-hidden': 'true' }, num),
      el('span', { class: 'capa-ic-w', 'aria-hidden': 'true', html: '<svg class="capa-ic" viewBox="0 0 24 24"><path d="' + ic + '"/></svg>' }));
  }
  /* primeira frase de um texto (o resumo que aparece antes de abrir o registro) */
  function primeiraFrase(s, max) {
    const t = texto(s).replace(/\s+/g, ' ').trim();
    if (!t || soMarcador(t)) return t;
    const m = t.match(/^.{24,}?[.!?…](?=\s|$)/);
    let f = m ? m[0] : t;
    if (f.length > (max || 170)) f = f.slice(0, max || 170).replace(/[\s,;:]+\S*$/, '') + '…';
    return f;
  }
  /* uma atividade na trilha da área: linha curta; mostra o resumo ao passar o mouse e tudo quando o registro abre */
  function itemTrilha(area, atv, k, visiveis) {
    const meta = [romano(k + 1), TIPOS[atv.tipo] || 'Outro'];
    if (atv.data) meta.push(dataBonita(atv.data));
    const img = atv.imagens[0], ic = ICONE_TIPO[atv.tipo] || ICONE_TIPO.outro;
    const mini = img ? el('span', { class: 'tr-mini' }, el('img', { src: img.src, alt: '', loading: 'lazy', decoding: 'async' }))
      : el('span', { class: 'tr-mini tr-mini-arte', html: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + ic + '"/></svg>' });
    return el('li', { class: 'tr-item' + (k >= visiveis ? ' alem' : '') + (atv.destaque ? ' destaque' : ''), style: '--i:' + k },
      el('a', { class: 'tr-a', href: '#' + area.id + '/' + atv.id, 'data-area': area.id, 'data-atv': atv.id },
        mini,
        el('span', { class: 'tr-txt' },
          el('span', { class: 'tr-tit' }, comMarcadores(atv.titulo || 'Sem título')),
          el('span', { class: 'tr-meta' }, meta.join(' · '),
            atv.destaque ? el('span', { class: 'selo selo-destaque' }, 'destaque') : null,
            atv.exemplo ? el('span', { class: 'selo' }, 'exemplo') : null),
          atv.resumo ? el('span', { class: 'tr-resumo' }, comMarcadores(atv.resumo)) : null),
        el('span', { class: 'tr-seta', 'aria-hidden': 'true', html: '<svg viewBox="0 0 24 12"><path d="M1 6h20M16 1.5 21.5 6 16 10.5"/></svg>' })));
  }
  const ORNAMENTO = '<svg class="orn-tinta" viewBox="0 0 320 22" aria-hidden="true"><path d="M3 13 C48 6 92 17 138 11 C146 10 150 9 152 8 M168 8 C172 9 178 10 186 11 C232 17 276 6 317 12"/><path class="orn-losango" d="M160 3 L166.5 9.5 L160 16 L153.5 9.5 Z"/></svg>';
  const CHEVRON = '<svg viewBox="0 0 16 10" aria-hidden="true"><path d="M1.5 2 8 8.5 14.5 2"/></svg>';

  function montarArea(d, a, i, sufixo) {
    sufixo = sufixo || '';
    const n = i + 2, lado = i % 2 ? 'r' : 'l';
    const sec = secao(a.id, a.tema, texto(a.materia), d._temas.variantes[i + 1], 'area', Math.round(n === 1 ? 0 : (n - 1) * 380));
    const visiveis = Math.max(1, +d.site.atividades_visiveis || 4);
    const total = a.atividades.length, extra = total - visiveis, destaques = a.atividades.filter(t => t.destaque).length;
    const resumo = primeiraFrase(a.descricao, 170);
    const idMais = 'reg-' + a.id + sufixo;
    const num = (q, um, varios) => el('li', null, el('b', null, String(q)), ' ' + (q === 1 ? um : varios));
    const trilha = total ? el('ol', { class: 'trilha', 'aria-label': 'Atividades de ' + texto(a.materia) },
      a.atividades.map((t, k) => itemTrilha(a, t, k, visiveis)),
      extra > 0 ? el('li', { class: 'tr-mais' }, el('button', { type: 'button', onclick: () => alternar(true) }, `+ ${extra} ${extra === 1 ? 'atividade' : 'atividades'}`)) : null)
      : el('p', { class: 'vazio' }, comMarcadores('[As atividades desta matéria aparecem aqui.]'));
    const mais = el('div', { class: 'area-mais', id: idMais },
      el('div', { class: 'area-mais-in' },
        a.descricao ? el('div', { class: 'area-desc' }, paragrafos(a.descricao, 'lede')) : null,
        a.competencias.length ? el('h3', { class: 'sub' }, 'Competências') : null,
        a.competencias.length ? el('ul', { class: 'comp', 'aria-label': 'Competências' }, a.competencias.map(c => el('li', null, comMarcadores(c)))) : null));
    const botao = el('button', { type: 'button', class: 'abrir-area', 'aria-expanded': 'false', 'aria-controls': idMais, onclick: () => alternar() },
      el('span', { class: 'ab-txt' }, 'Abrir registro'), el('span', { class: 'ab-ic', html: CHEVRON }));
    const partes = [
      el('p', { class: 'eyebrow' }, `Área ${romano(n)}`, a.titulo_area ? ' · ' : '', a.titulo_area ? comMarcadores(a.titulo_area) : null),
      el('h2', { id: 't-' + a.id + sufixo }, texto(a.materia), a.periodo ? el('small', null, comMarcadores(a.periodo)) : null),
      el('div', { class: 'orn', html: ORNAMENTO }),
      resumo ? el('p', { class: 'area-resumo' }, comMarcadores(resumo)) : null,
      el('ul', { class: 'area-num', 'aria-label': 'Resumo da área' }, num(total, 'atividade', 'atividades'),
        a.competencias.length ? num(a.competencias.length, 'competência', 'competências') : null,
        destaques ? num(destaques, 'destaque', 'destaques') : null),
      mais, trilha, botao].filter(Boolean);
    partes.forEach((p, k) => p.style.setProperty('--i', k));
    const copy = el('div', { class: 'copy painel-area ' + lado }, partes);
    mais.inert = true;
    function alternar(forcar) {
      const aberto = forcar != null ? forcar : !copy.classList.contains('aberto');
      copy.classList.toggle('aberto', aberto);
      botao.setAttribute('aria-expanded', String(aberto));
      botao.querySelector('.ab-txt').textContent = aberto ? 'Fechar registro' : 'Abrir registro';
      mais.inert = !aberto;
      if (!aberto) requestAnimationFrame(() => botao.scrollIntoView({ block: 'nearest', behavior: reduzido() ? 'auto' : 'smooth' }));
    }
    sec.append(copy);
    return sec;
  }

  function copiar(textoCopiar, aviso) {
    const ok = () => { aviso.textContent = 'Copiado.'; setTimeout(() => { aviso.textContent = ''; }, 2400); };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(textoCopiar).then(ok, () => { aviso.textContent = textoCopiar; });
    else { aviso.textContent = textoCopiar; }
  }

  /* Sobre: o primeiro parágrafo aparece; o resto abre com "Ler tudo" */
  function sobreResumido(txt) {
    const ps = paragrafos(txt, 'lede');
    if (ps.length < 2) return el('div', { class: 'sobre-txt' }, ps);
    const resto = el('div', { class: 'area-mais sobre-mais', id: 'sobre-mais' }, el('div', { class: 'area-mais-in' }, ps.slice(1)));
    resto.inert = true;
    const caixa = el('div', { class: 'sobre-txt' }, ps[0], resto);
    const botao = el('button', { type: 'button', class: 'abrir-area', 'aria-expanded': 'false', 'aria-controls': 'sobre-mais', onclick: () => {
      const aberto = !caixa.classList.contains('aberto');
      caixa.classList.toggle('aberto', aberto); resto.inert = !aberto;
      botao.setAttribute('aria-expanded', String(aberto)); botao.querySelector('.ab-txt').textContent = aberto ? 'Mostrar menos' : 'Ler tudo';
    } }, el('span', { class: 'ab-txt' }, 'Ler tudo'), el('span', { class: 'ab-ic', html: CHEVRON }));
    caixa.append(botao);
    return caixa;
  }

  function montarFinal(d, total) {
    const p = d.perfil, ct = p.contato, n = total;
    const sec = secao('sobre', d._temas.final, 'Sobre e contato', d._temas.variantes[d._temas.variantes.length - 1], 'final', (n - 1) * 380);
    const aviso = el('span', { class: 'aviso', role: 'status', 'aria-live': 'polite' });
    const email = texto(ct.email);
    const emailReal = email && !soMarcador(email) && email.includes('@');
    const links = lista(p.links).filter(l => l && (l.rotulo || l.url));
    const copy = el('div', { class: 'copy painel-final r' },
      el('p', { class: 'eyebrow' }, 'Fim do mapa'),
      el('h2', { id: 't-sobre' }, 'Sobre', el('small', null, 'Quem atravessou o mapa')),
      sobreResumido(d.sobre || '[Texto sobre você.]'),
      el('h3', { class: 'sub' }, 'Contato'),
      el('dl', { class: 'contato' },
        el('div', null, el('dt', null, 'E-mail'), el('dd', null,
          emailReal ? el('a', { href: 'mailto:' + email }, email) : comMarcadores(email || '[e-mail]'),
          emailReal ? el('button', { type: 'button', class: 'botao-texto', onclick: () => copiar(email, aviso) }, 'Copiar') : null, aviso)),
        ct.cidade ? el('div', null, el('dt', null, 'Cidade'), el('dd', null, comMarcadores(ct.cidade))) : null),
      links.length ? el('ul', { class: 'links' }, links.map(l => el('li', null,
        l.url ? el('a', { href: l.url, target: ehExterno(l.url) ? '_blank' : null, rel: ehExterno(l.url) ? 'noopener' : null }, comMarcadores(l.rotulo || l.url)) : comMarcadores(l.rotulo)))) : null,
      el('button', { class: 'ascend', id: 'ascend', type: 'button', onclick: () => { if (!document.documentElement.classList.contains('playing')) window.scrollTo({ top: 0, behavior: reduzido() ? 'auto' : 'smooth' }); } }, 'Voltar ao início'),
      el('p', { class: 'credit' }, 'Cenários pintados em código. Feito em HTML, CSS e JavaScript.'));
    sec.append(copy);
    return sec;
  }
  const reduzido = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* os painéis aparecem aos poucos quando chegam à tela (sem animação para quem pediu menos movimento) */
  function revelar(secs) {
    if (!('IntersectionObserver' in window) || reduzido()) return;
    document.documentElement.classList.add('revela');
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visto'); io.unobserve(e.target); } }), { threshold: .15 });
    secs.forEach(s => { const c = s.querySelector('.painel-area, .painel-final'); if (c) io.observe(c); });
  }

  function montar(d) {
    const main = document.getElementById('conteudo');
    main.textContent = '';
    /* o mapa 2D (js/00a-mundo.js): uma região por seção, na mesma ordem */
    try {
      const regioes = [{ id: 'inicio', nome: 'Início', tema: d._temas.inicio, variante: d._temas.variantes[0] },
        ...d.areas.map((a, i) => ({ id: a.id, nome: texto(a.materia), tema: a.tema, variante: d._temas.variantes[i + 1] })),
        { id: 'sobre', nome: 'Sobre e contato', tema: d._temas.final, variante: d._temas.variantes[d._temas.variantes.length - 1] }];
      C.mundo = window.MUNDO ? MUNDO.gerar(regioes, 7) : null;
    } catch (e) { console.warn('Portfólio: mapa', e); C.mundo = null; }
    const secs = [montarInicio(d)];
    d.areas.forEach((a, i) => secs.push(montarArea(d, a, i)));
    secs.push(montarFinal(d, d.areas.length + 2));
    secs.forEach(s => main.append(s));
    revelar(secs);
    C.secoes = secs;
    C.areas = d.areas;
    /* mapa fixo à direita: uma entrada por seção, na mesma ordem (o motor usa essa ordem) */
    const mapa = document.getElementById('map');
    mapa.textContent = '';
    secs.forEach((s, i) => mapa.append(el('a', { href: '#' + s.id }, el('span', { class: 'nm' }, romano(i + 1) + ' · ' + s.dataset.name), el('span', { class: 'dot' }))));
    /* título e descrição da aba vindos do conteúdo */
    const s = d.site;
    if (s.nome) document.title = s.nome + (s.subtitulo ? ' · ' + s.subtitulo : '');
    if (s.descricao) { const m = document.querySelector('meta[name="description"]'); if (m) m.setAttribute('content', s.descricao); }
  }

  /* ---------- detalhe da atividade ---------- */
  const det = () => document.getElementById('detalhe');
  let quemAbriu = null, abertoEm = null;
  function acharAtividade(areaId, atvId) {
    const a = C.areas.find(x => x.id === areaId);
    if (!a) return null;
    const k = a.atividades.findIndex(t => t.id === atvId);
    return k < 0 ? null : { area: a, atv: a.atividades[k], k };
  }
  function abrirDetalhe(areaId, atvId) {
    const r = acharAtividade(areaId, atvId);
    if (!r) { fecharDetalhe(false); return; }
    const { area, atv, k } = r, corpo = document.getElementById('detCorpo');
    const meta = [texto(area.materia), TIPOS[atv.tipo] || 'Outro'];
    if (atv.data) meta.push(dataBonita(atv.data));
    const ant = area.atividades[k - 1], prox = area.atividades[k + 1];
    const aviso = el('span', { class: 'aviso', role: 'status', 'aria-live': 'polite' });
    corpo.textContent = '';
    corpo.append(...[
      el('header', { class: 'det-cab' },
        el('p', { class: 'eyebrow' }, meta.join(' · '), atv.exemplo ? el('span', { class: 'selo' }, 'exemplo') : null),
        el('h2', { id: 'detT' }, comMarcadores(atv.titulo || 'Sem título')),
        atv.resumo ? el('p', { class: 'det-resumo' }, comMarcadores(atv.resumo)) : null,
        atv.tags.length ? el('ul', { class: 'tags', 'aria-label': 'Etiquetas' }, atv.tags.map(t => el('li', null, texto(t)))) : null),
      atv.imagens.length ? el('div', { class: 'det-galeria' + (atv.imagens.length === 1 ? ' uma' : '') }, atv.imagens.map((im, j) =>
        el('figure', null,
          el('a', { href: im.src, target: '_blank', rel: 'noopener' }, el('img', { src: im.src, alt: im.legenda || `${texto(atv.titulo)}, imagem ${j + 1}`, loading: 'lazy', decoding: 'async' })),
          im.legenda ? el('figcaption', null, im.legenda) : null))) : null,
      el('div', { class: 'det-texto' }, paragrafos(atv.descricao || atv.resumo || '[Texto completo da atividade.]')),
      atv.links.length ? el('div', { class: 'det-arquivos' }, el('h3', null, 'Arquivos e links'),
        el('ul', null, atv.links.map(l => el('li', null, l.url
          ? el('a', { href: l.url, target: '_blank', rel: 'noopener' }, comMarcadores(l.rotulo || l.url))
          : comMarcadores(l.rotulo))))) : null,
      el('footer', { class: 'det-nav' },
        ant ? el('a', { class: 'botao-texto', href: '#' + area.id + '/' + ant.id }, '← Anterior') : el('span'),
        el('span', { class: 'det-copiar' }, el('button', { type: 'button', class: 'botao-texto', onclick: () => copiar(location.href, aviso) }, 'Copiar link'), aviso),
        prox ? el('a', { class: 'botao-texto', href: '#' + area.id + '/' + prox.id }, 'Próxima →') : el('span'))
    ].filter(Boolean));
    const m = det();
    if (m.hidden) { quemAbriu = document.activeElement; m.hidden = false; document.documentElement.classList.add('detalhe-aberto'); }
    abertoEm = area.id;
    m.querySelector('.detalhe').scrollTop = 0;
    m.querySelector('.detalhe').focus({ preventScroll: true });
  }
  function fecharDetalhe(mudarEndereco) {
    const m = det();
    if (!m || m.hidden) return;
    m.hidden = true;
    document.documentElement.classList.remove('detalhe-aberto');
    if (mudarEndereco && abertoEm) history.replaceState(null, '', location.pathname + location.search + '#' + abertoEm);
    if (quemAbriu && document.contains(quemAbriu)) quemAbriu.focus({ preventScroll: true });
    quemAbriu = null;
  }
  function rota(inicial) {
    const h = decodeURIComponent(location.hash.slice(1));
    const [a, t] = h.split('/');
    if (a && t) {
      if (inicial) { const s = document.getElementById(a); if (s) s.scrollIntoView({ block: 'start' }); }
      abrirDetalhe(a, t);
    } else fecharDetalhe(false);
  }
  function prepararDetalhe() {
    const m = det();
    document.getElementById('detFechar').addEventListener('click', () => fecharDetalhe(true));
    m.addEventListener('click', e => { if (e.target === m) fecharDetalhe(true); });
    m.addEventListener('keydown', e => {
      if (e.key === 'Escape') { e.stopPropagation(); fecharDetalhe(true); return; }
      if (e.key !== 'Tab') return;
      const f = [...m.querySelectorAll('a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])')].filter(x => x.offsetParent !== null);
      if (!f.length) return;
      const pri = f[0], ult = f[f.length - 1];
      if (e.shiftKey && (document.activeElement === pri || document.activeElement === m.querySelector('.detalhe'))) { e.preventDefault(); ult.focus(); }
      else if (!e.shiftKey && document.activeElement === ult) { e.preventDefault(); pri.focus(); }
    });
    addEventListener('hashchange', () => rota(false));
  }

  /* ---------- relayout: quando a altura do conteúdo muda (fontes, imagens, "ver todas"),
     o motor recalcula o chão e as plataformas ---------- */
  function vigiarAltura() {
    if (!('ResizeObserver' in window)) return;
    const main = document.getElementById('conteudo');
    let ultima = main.offsetHeight, t = 0;
    new ResizeObserver(() => {
      const h = main.offsetHeight;
      if (Math.abs(h - ultima) < 2) return;
      ultima = h;
      clearTimeout(t);
      t = setTimeout(() => window.dispatchEvent(new Event('resize')), 260);
    }).observe(main);
  }

  /* ---------- motor (cenários e jogo) ---------- */
  const MOTOR = ['js/01-base.js', 'js/02-regioes.js', 'js/02b-salas.js', 'js/03-cenario.js', 'js/04-jogo.js', 'js/04b-segredos.js', 'js/05-audio.js', 'js/06-loop.js', 'js/07-interface.js', 'js/08-pasta-recursos.js', 'js/08b-poderes.js', 'js/09-inicio.js'];
  function carregarMotor() {
    for (const src of MOTOR) {
      const s = document.createElement('script');
      s.src = src;
      s.async = false; /* mantém a ordem numérica */
      document.body.append(s);
    }
  }

  function mostrarErro(e) {
    const main = document.getElementById('conteudo');
    main.textContent = '';
    main.append(el('div', { class: 'erro-conteudo' },
      el('h1', null, 'Portfólio'),
      el('p', null, 'Não consegui ler ', el('code', null, ARQUIVO), '.'),
      el('p', null, location.protocol === 'file:'
        ? 'Abrindo o arquivo direto do computador, o navegador bloqueia a leitura. Na pasta do projeto, rode python -m http.server 8000 e abra http://localhost:8000.'
        : 'Confira se o arquivo existe e se o JSON está válido (vírgulas e aspas).'),
      el('p', { class: 'erro-det' }, texto(e && e.message))));
    console.warn('Portfólio: conteúdo não carregou', e);
  }

  /* fontes do dono (recursos/fontes/titulo e texto) carregadas logo no início, para a abertura já usá-las.
     O índice recursos/indice.json diz qual extensão existe (assim o navegador não pede arquivos que faltam). */
  async function fontesCedo() {
    try {
      const r = await fetch('recursos/indice.json', { cache: 'no-cache' });
      if (!r.ok) return;
      const tem = new Set((await r.json()).arquivos || []);
      await Promise.all([['titulo', '--display', "'Cinzel','Trajan Pro',Georgia,serif"], ['texto', '--body', "'Cormorant Garamond','Garamond',Georgia,serif"]].map(async ([nome, prop, reserva]) => {
        const ext = ['woff2', 'woff', 'ttf', 'otf'].find(e => tem.has('fontes/' + nome + '.' + e));
        if (!ext) return;
        const fam = 'Dono-' + nome, ff = new FontFace(fam, `url(recursos/fontes/${nome}.${ext})`);
        await ff.load();
        document.fonts.add(ff);
        document.documentElement.style.setProperty(prop, `'${fam}',${reserva}`);
        C.fontes[nome] = 'fontes/' + nome + '.' + ext;
      }));
    } catch (e) { /* sem fontes do dono: ficam as padrão */ }
  }

  async function iniciar() {
    prepararDetalhe();
    fontesCedo().then(fontesOk);
    let dados;
    try {
      const r = await fetch(ARQUIVO, { cache: 'no-cache' });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      dados = normalizar(await r.json());
    } catch (e) {
      mostrarErro(e);
      pronto(null);
      return;
    }
    C.dados = dados;
    /* o resumo de uma matéria montado de novo (o modo Jogo mostra numa janela, js/04b-segredos.js) */
    C.painelArea = j => { const sec = montarArea(dados, dados.areas[j], j, '-jogo'), copy = sec.querySelector('.copy'); copy.style.setProperty('--accent', sec.style.getPropertyValue('--accent')); copy.classList.remove('l', 'r'); copy.classList.add('visto', 'no-jogo'); return copy; };
    montar(dados);
    pronto(dados);
    rota(true);
    vigiarAltura();
    /* o motor carrega já, por trás do escuro inicial; a abertura começa quando ele termina a primeira pintura */
    if (C.mundo) carregarMotor();
  }
  iniciar();
})();
