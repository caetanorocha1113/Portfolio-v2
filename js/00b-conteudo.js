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

  /* a versão vem do endereço deste script no index.html (js/00b-conteudo.js?v=…) e vai para os scripts do motor:
     depois de uma atualização, o navegador não mistura arquivos novos com antigos guardados no cache */
  const VERSAO = (() => { try { return new URL(document.currentScript.src).searchParams.get('v') || ''; } catch (e) { return ''; } })();
  const comVersao = src => VERSAO ? src + '?v=' + encodeURIComponent(VERSAO) : src;

  let pronto;
  const promessa = new Promise(r => { pronto = r; });
  let fontesOk;
  const C = window.CONTEUDO = { dados: null, pronto: promessa, areas: [], secoes: [], fontes: {}, fontesProntas: new Promise(r => { fontesOk = r; }), versao: VERSAO, comVersao };

  /* ---------- erros do motor ----------
     Os erros de qualquer script ficam guardados; se o motor não começar, ou se uma parte visível dele falhar
     (o cenário, o jogo…), aparece um aviso com o erro, para a tela nunca ficar preta sem explicação. */
  const ERROS = [];
  addEventListener('error', e => {
    if (!e || !e.message) return;
    const arq = (e.filename || '').split('/').pop().split('?')[0];
    ERROS.push(e.message + (arq ? ' · ' + arq + ':' + e.lineno : ''));
  });
  let avisoFeito = false;
  function avisoMotor(motivo) {
    if (avisoFeito) return;
    avisoFeito = true;
    const detalhe = [motivo, ...ERROS.slice(0, 3)].filter(Boolean).join('\n');
    const caixa = el('div', { class: 'aviso-motor', role: 'alert' },
      el('p', null, el('b', null, 'O cenário não carregou direito.'), ' Recarregue a página sem o cache (Ctrl + Shift + R). Se continuar, mande um print deste aviso.'),
      detalhe ? el('pre', null, detalhe) : null,
      el('div', { class: 'aviso-acoes' },
        el('button', { type: 'button', onclick() { location.reload(); } }, 'Recarregar'),
        el('button', { type: 'button', class: 'aviso-x', 'aria-label': 'Fechar o aviso', onclick() { caixa.remove(); } }, '×')));
    document.body.append(caixa);
  }
  /* partes do quadro que, falhando, deixam a tela vazia (js/06-loop.js e js/09-inicio.js chamam aqui) */
  const VISIVEIS = ['jogo', 'vista', 'cenário', 'efeitos', 'personagens', 'motor'];
  C.erroMotor = (parte, e) => {
    ERROS.unshift(parte + ': ' + ((e && e.message) || e));
    if (VISIVEIS.includes(parte)) avisoMotor('');
  };

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
  /* disciplina de uma atividade (no Técnico, a submatéria): um nome ou uma lista */
  const disciplinasDe = t => lista(t.disciplina != null ? t.disciplina : t.submateria).map(texto).filter(s => s.trim());
  const trimestreDe = v => { const n = parseInt(v, 10); return n >= 1 && n <= 4 ? n : 0; };
  const limpas = v => lista(v).map(texto).filter(s => s.trim());
  /* o trabalho embutido na página (aparece só quando a pessoa pede): YouTube, Canva, Google Docs, Padlet ou PDF */
  function embedDe(u) {
    u = texto(u).trim();
    if (!u) return null;
    let m;
    if ((m = u.match(/(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/))) return { tipo: 'video', origem: 'YouTube', id: m[1], src: 'https://www.youtube.com/embed/' + m[1] };
    if ((m = u.match(/canva\.com\/design\/([^/?#]+)\/([^/?#]+)\/(?:view|edit|watch)/))) return { tipo: 'slides', origem: 'Canva', src: `https://www.canva.com/design/${m[1]}/${m[2]}/view?embed` };
    if ((m = u.match(/docs\.google\.com\/(document|presentation|spreadsheets)\/d\/([\w-]+)/))) return { tipo: m[1] === 'presentation' ? 'slides' : 'doc', origem: 'Google Docs', src: `https://docs.google.com/${m[1]}/d/${m[2]}/${m[1] === 'presentation' ? 'embed' : 'preview'}` };
    if (/padlet\.com\//.test(u)) return { tipo: 'mural', origem: 'Padlet', src: u };
    if (/\.pdf($|[?#])/i.test(u)) return { tipo: 'doc', origem: 'PDF', src: u };
    return { tipo: 'outro', origem: (u.match(/^https?:\/\/(?:www\.)?([^/]+)/) || [])[1] || '', src: u };
  }
  /* miniatura: a primeira imagem; sem imagem, a capa do vídeo do YouTube (se houver) */
  function miniaturaDe(atv) {
    if (atv.imagens[0]) return atv.imagens[0].src;
    if (atv.embed && atv.embed.tipo === 'video') return 'https://i.ytimg.com/vi/' + atv.embed.id + '/hqdefault.jpg';
    return '';
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
        return { ...t, id: tid, tipo, disciplinas: disciplinasDe(t), trimestre: trimestreDe(t.trimestre),
          habilidades: limpas(t.habilidades), materiais: limpas(t.materiais), codigo: texto(t.codigo).replace(/\s+$/, ''), embed: embedDe(t.embed),
          imagens: lista(t.imagens).map(imagemDe).filter(Boolean), links: lista(t.links).filter(l => l && (l.rotulo || l.url)), tags: lista(t.tags) };
      });
      /* destaques primeiro, mantendo a ordem do arquivo dentro de cada grupo */
      atividades.sort((x, y) => (y.destaque ? 1 : 0) - (x.destaque ? 1 : 0));
      /* disciplinas da área (no Técnico, "submaterias"): a ordem do arquivo, mais as que só aparecem nas atividades */
      const sub = lista(a.submaterias).length > 0;
      const disciplinas = limpas(sub ? a.submaterias : a.disciplinas);
      for (const t of atividades) for (const n of t.disciplinas) if (!disciplinas.includes(n)) disciplinas.push(n);
      return { ...a, id, tema, atividades, disciplinas, rotuloDisc: sub ? ['submatéria', 'submatérias'] : ['disciplina', 'disciplinas'],
        competencias: lista(a.competencias), jogo: a.jogo || {} };
    });
    /* trajetória (opcional): linha do tempo dos anos, conquistas e habilidades, numa área própria do mapa */
    if (d.trajetoria && typeof d.trajetoria === 'object') {
      const t = d.trajetoria, h = t.habilidades || {};
      const temaT = TEMAS.includes(t.tema) ? t.tema : (TEMAS.includes('brejo') ? 'brejo' : livres[0]);
      d.trajetoria = { ...t, tema: temaT, titulo_area: t.titulo_area || 'A Estrada dos Anos', anos: lista(t.anos).filter(Boolean), conquistas: lista(t.conquistas).filter(c => c && c.titulo),
        habilidades: { tecnicas: lista(h.tecnicas), pessoais: lista(h.pessoais) } };
    } else d.trajetoria = null;
    /* variação de cor quando um tema se repete */
    const giros = [0, 34, -34, 68, -68, 102];
    const todas = [temaInicio, ...d.areas.map(a => a.tema), ...(d.trajetoria ? [d.trajetoria.tema] : []), temaFinal];
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

  /* destaques do mapa: as atividades marcadas com "destaque", de todas as matérias (o submenu Destaques do início) */
  function destaquesDoMapa(d) {
    const L = d.areas.flatMap((a, i) => a.atividades.filter(t => t.destaque).map(t => ({ a, t, i }))).slice(0, 8);
    if (!L.length) return null;
    return el('div', { class: 'destaques' }, el('p', { class: 'eyebrow' }, 'Destaques do mapa'),
      el('ol', { class: 'trilha' }, L.map(({ a, t, i }, k) => {
        const li = itemTrilha(a, t, 0, 9);
        li.style.setProperty('--accent', girarCor(ACENTO[a.tema] || '#e8d3a2', d._temas.variantes[i + 1]));
        const meta = li.querySelector('.tr-meta'); if (meta) meta.firstChild.textContent = romano(i + 2) + ' · ' + texto(a.materia) + ' · ' + (t.disciplinas[0] || TIPOS[t.tipo] || 'Outro');
        return li;
      })));
  }

  /* ---------- o início: um menu, como a tela de título de um jogo ----------
     O título (a abertura pousa nele), e embaixo as regiões do mapa como itens. Ao passar o mouse (ou com o
     foco do teclado), dois traços de pena se desenham dos lados do item e a legenda embaixo diz o que há lá;
     parada, a legenda mostra o resumo do perfil. Destaques e Mapa abrem no lugar do menu, com "Voltar". */
  const PENAS = ['M64 12C52 6 41 18 29 11S10 8 4 13', 'M64 12C53 18 42 6 30 12S11 16 4 11', 'M64 12C51 7 43 17 30 10S12 9 4 12'];
  const pena = (lado, k) => el('span', { class: 'mi-pena mi-pena-' + lado, 'aria-hidden': 'true', html:
    '<svg viewBox="0 0 84 24"><path class="mi-traco" pathLength="1" d="' + PENAS[k % PENAS.length] + '"/><path class="mi-gota" d="M70 12l5-5 5 5-5 5z"/><circle class="mi-ponto" cx="5" cy="12" r="1.7"/></svg>' });
  const comE = l => l.length < 2 ? l.join('') : l.slice(0, -1).join(', ') + ' e ' + l[l.length - 1];
  const qtd = (n, um, varios) => n + ' ' + (n === 1 ? um : varios);
  function montarInicio(d, n) {
    const p = d.perfil, s = d.site;
    const sec = secao('inicio', d._temas.inicio, 'Início', d._temas.variantes[0], 'hero', 0);
    const resumo = texto(p.resumo).trim();
    const legenda = el('p', { class: 'mi-legenda' }, comMarcadores(resumo));
    const mostrar = t => { legenda.textContent = ''; legenda.append(t ? t : comMarcadores(resumo)); legenda.classList.toggle('dica', !!t); };
    /* os itens: as matérias, a Trajetória (se houver) e Sobre e contato, na ordem do mapa */
    const itens = d.areas.map((a, i) => ({ href: '#' + a.id, rotulo: texto(a.materia), cor: girarCor(ACENTO[a.tema] || '#e8d3a2', d._temas.variantes[i + 1]),
      dica: romano(i + 2) + ' · ' + qtd(a.atividades.length, 'atividade', 'atividades') + (a.disciplinas.length ? ' · ' + comE(a.disciplinas) : '') }));
    let k = d.areas.length;
    if (d.trajetoria) { const t = d.trajetoria; itens.push({ href: '#trajetoria', rotulo: 'Trajetória', cor: girarCor(ACENTO[t.tema] || '#e8d3a2', d._temas.variantes[k + 1]), dica: romano(k + 2) + ' · ' + (primeiraFrase(t.descricao, 130) || 'Do 1º ao 3º ano: conquistas e habilidades') }); k++; }
    itens.push({ href: '#sobre', rotulo: 'Sobre e contato', cor: girarCor(ACENTO[d._temas.final] || '#e8d3a2', d._temas.variantes[d._temas.variantes.length - 1]), dica: romano(k + 2) + ' · Quem atravessou o mapa, e como falar com ele' });
    const lista = el('ol', { class: 'mi-lista' }, itens.map((it, j) => el('li', null,
      el('a', { class: 'mi-item', href: it.href, style: '--accent:' + it.cor, 'data-dica': it.dica },
        pena('e', j), el('span', { class: 'mi-rot' }, it.rotulo), el('span', { class: 'sr' }, ' — ' + it.dica), pena('d', j + 1)))));
    /* as vistas: o menu e os dois submenus */
    const raiz = el('div', { class: 'menu-inicio' });
    const vistas = {};
    const abrir = (nome, quem) => {
      for (const [k2, v] of Object.entries(vistas)) v.hidden = k2 !== nome;
      raiz.dataset.vista = nome;
      const alvo = nome === 'menu' ? (quem || lista.querySelector('a')) : vistas[nome].querySelector('.mi-voltar');
      if (alvo) alvo.focus({ preventScroll: true });
    };
    const extra = (rotulo, dica, onclick, cls, id) => el('button', { type: 'button', class: 'mi-extra' + (cls ? ' ' + cls : ''), id: id || null, 'data-dica': dica, onclick }, rotulo);
    const voltar = quem => el('button', { type: 'button', class: 'mi-voltar', onclick: () => abrir('menu', quem) }, el('span', { 'aria-hidden': 'true' }, '←'), ' Voltar ao menu');
    const dest = destaquesDoMapa(d), desenho = C.mundo ? el('figure', { class: 'mapa-mundo' }, mapaDoMundo(C.mundo, d), el('figcaption', null, 'O mapa. Clique numa região para ir até ela.')) : null;
    const bDest = dest ? extra('Destaques', 'As atividades marcadas como destaque, de todas as matérias', () => abrir('destaques')) : null;
    const bMapa = desenho ? extra('Mapa', 'O mapa desenhado das regiões: clique numa delas para ir até lá', () => abrir('mapa'), 'so-largo') : null;
    const extras = el('div', { class: 'mi-extras' },
      [bDest, bMapa,
        extra('Jogar', 'Atravessar o mapa jogando: cada região é uma matéria', () => { const b = document.getElementById('mPlay'); if (b) b.click(); }, 'mi-jogar', 'btnJogar'),
        extra('Rever abertura', 'Ver de novo a abertura do Atlas', () => window.ABERTURA && window.ABERTURA.tocar(true), null, 'btnAbertura')].filter(Boolean));
    vistas.menu = el('nav', { class: 'mi-vista mi-principal', 'aria-label': 'Menu do portfólio' }, lista, legenda, extras);
    if (dest) { vistas.destaques = el('div', { class: 'mi-vista mi-sub', hidden: true }, dest, voltar(bDest)); }
    if (desenho) { vistas.mapa = el('div', { class: 'mi-vista mi-sub mi-mapa', hidden: true }, desenho, voltar(bMapa)); }
    raiz.append(...Object.values(vistas));
    raiz.dataset.vista = 'menu';
    /* a legenda acompanha o mouse e o foco; setas para cima e para baixo andam pelo menu; Esc volta */
    const comDica = '.mi-item, .mi-extra';
    vistas.menu.addEventListener('pointerover', e => { const a = e.target.closest(comDica); if (a) mostrar(a.dataset.dica); });
    vistas.menu.addEventListener('pointerleave', () => { const f = document.activeElement; mostrar(f && vistas.menu.contains(f) && f.matches(comDica) ? f.dataset.dica : ''); });
    vistas.menu.addEventListener('focusin', e => { if (e.target.matches(comDica)) mostrar(e.target.dataset.dica); });
    vistas.menu.addEventListener('focusout', e => { if (!vistas.menu.contains(e.relatedTarget)) mostrar(''); });
    raiz.addEventListener('keydown', e => {
      if (e.key === 'Escape' && raiz.dataset.vista !== 'menu') { e.preventDefault(); abrir('menu', raiz.dataset.vista === 'mapa' ? bMapa : bDest); return; }
      if ((e.key !== 'ArrowDown' && e.key !== 'ArrowUp') || raiz.dataset.vista !== 'menu') return;
      const alvos = [...vistas.menu.querySelectorAll(comDica)].filter(b => b.offsetParent), i = alvos.indexOf(document.activeElement);
      if (i < 0) return;
      e.preventDefault();
      alvos[(i + (e.key === 'ArrowDown' ? 1 : alvos.length - 1)) % alvos.length].focus({ preventScroll: true });
    });
    const copy = el('div', { class: 'copy c' },
      el('p', { class: 'eyebrow' }, 'Crônica de uma jornada'),
      el('h1', { id: 't-inicio' }, texto(s.nome || 'Portfólio')),
      el('div', { html: FLOREIO, class: 'floreio' }),
      el('p', { class: 'hero-sub' }, texto(s.subtitulo || ('Portfólio de ' + texto(p.nome)))),
      p.titulo ? el('p', { class: 'hero-titulo' }, comMarcadores(p.titulo)) : null,
      raiz,
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
    /* na linha: a disciplina (ou o tipo) e o trimestre (ou a data) */
    const d = atv.disciplinas, meta = [romano(k + 1), d.length ? d[0] + (d.length > 1 ? ' +' + (d.length - 1) : '') : (TIPOS[atv.tipo] || 'Outro')];
    if (atv.trimestre) meta.push(atv.trimestre + 'º tri');
    else if (atv.data) meta.push(dataBonita(atv.data));
    const src = miniaturaDe(atv), ic = ICONE_TIPO[atv.tipo] || ICONE_TIPO.outro;
    const arte = () => el('span', { class: 'tr-mini tr-mini-arte', html: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + ic + '"/></svg>' });
    /* se a miniatura não carregar (sem internet, vídeo removido), volta o desenho do tipo */
    const mini = src ? el('span', { class: 'tr-mini' }, el('img', { src, alt: '', loading: 'lazy', decoding: 'async', onerror() { const s = this.parentNode; if (s && s.parentNode) s.replaceWith(arte()); } })) : arte();
    return el('li', { class: 'tr-item' + (k >= visiveis ? ' alem' : '') + (atv.destaque ? ' destaque' : ''), style: '--i:' + k, 'data-disc': d.join('|') || null },
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
    /* filtro por disciplina (no Técnico, por submatéria): um clique mostra só as atividades dela; outro clique volta a todas */
    const discs = a.disciplinas || [], [um, varios] = a.rotuloDisc || ['disciplina', 'disciplinas'];
    let filtroAtual = '';
    const filtro = discs.length > 1 && total ? el('div', { class: 'filtro', role: 'group', 'aria-label': 'Filtrar por ' + um },
      [['', 'Todas', total], ...discs.map(x => [x, x, a.atividades.filter(t => t.disciplinas.includes(x)).length])].map(([v, rot, q]) =>
        el('button', { type: 'button', class: 'filtro-b', 'data-v': v, 'aria-pressed': v ? 'false' : 'true', disabled: q ? null : true, onclick: () => filtrar(v) },
          el('span', null, rot), el('span', { class: 'filtro-n' }, String(q))))) : null;
    function filtrar(v) {
      filtroAtual = v && v !== filtroAtual ? v : '';
      filtro.querySelectorAll('.filtro-b').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === filtroAtual)));
      trilha.classList.toggle('filtrada', !!filtroAtual);
      trilha.querySelectorAll('.tr-item').forEach(li => li.classList.toggle('fora', !!filtroAtual && !(li.dataset.disc || '').split('|').includes(filtroAtual)));
    }
    const partes = [
      el('p', { class: 'eyebrow' }, `Área ${romano(n)}`, a.titulo_area ? ' · ' : '', a.titulo_area ? comMarcadores(a.titulo_area) : null),
      el('h2', { id: 't-' + a.id + sufixo }, texto(a.materia), a.periodo ? el('small', null, comMarcadores(a.periodo)) : null),
      el('div', { class: 'orn', html: ORNAMENTO }),
      resumo ? el('p', { class: 'area-resumo' }, comMarcadores(resumo)) : null,
      el('ul', { class: 'area-num', 'aria-label': 'Resumo da área' }, num(total, 'atividade', 'atividades'),
        discs.length > 1 ? num(discs.length, um, varios) : null,
        a.competencias.length ? num(a.competencias.length, 'competência', 'competências') : null,
        destaques ? num(destaques, 'destaque', 'destaques') : null),
      mais, filtro, trilha, botao].filter(Boolean);
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

  /* Trajetória: resumo, linha do tempo dos anos e, ao abrir o registro, o texto de cada ano, conquistas e habilidades */
  const ICONE_CONQUISTA = { certificado: 'M4 4h16v12H4zM8 20l4-3 4 3M8 8h8M8 11h5', premio: 'M8 3h8v5a4 4 0 0 1-8 0zM5 4h3M16 4h3M12 12v4M8 21h8M10 16h4', olimpiada: 'M12 9a6 6 0 1 0 0 12 6 6 0 1 0 0-12zM7 3l5 6 5-6', curso: 'M2 9l10-5 10 5-10 5zM6 11v5c3 2 9 2 12 0v-5', outro: 'M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3z' };
  function montarTrajetoria(d, sufixo) {
    sufixo = sufixo || '';
    const t = d.trajetoria, idx = d.areas.length, n = idx + 2, lado = idx % 2 ? 'r' : 'l';
    const sec = secao('trajetoria', t.tema, 'Trajetória', d._temas.variantes[idx + 1], 'area', (n - 1) * 380);
    const hab = [...t.habilidades.tecnicas, ...t.habilidades.pessoais], idMais = 'reg-trajetoria' + sufixo;
    const num = (q, um, varios) => el('li', null, el('b', null, String(q)), ' ' + (q === 1 ? um : varios));
    const linha = t.anos.length ? el('ol', { class: 'linha-tempo', 'aria-label': 'Os anos' }, t.anos.map((a, k) => el('li', { style: '--i:' + k },
      el('span', { class: 'lt-no', 'aria-hidden': 'true' }), el('span', { class: 'lt-ano' }, comMarcadores(a.ano || romano(k + 1))), el('span', { class: 'lt-tit' }, comMarcadores(a.titulo || ''))))) : null;
    const mais = el('div', { class: 'area-mais', id: idMais }, el('div', { class: 'area-mais-in' },
      t.descricao ? el('div', { class: 'area-desc' }, paragrafos(t.descricao, 'lede')) : null,
      t.anos.map(a => el('div', { class: 'lt-bloco' }, el('h3', { class: 'sub' }, comMarcadores(a.ano || ''), a.periodo ? el('small', null, ' · ', comMarcadores(a.periodo)) : null), a.texto ? paragrafos(a.texto, 'lt-texto') : null)),
      t.conquistas.length ? el('h3', { class: 'sub' }, 'Conquistas') : null,
      t.conquistas.length ? el('ul', { class: 'conquistas' }, t.conquistas.map(c => el('li', null,
        el('span', { class: 'cq-ic', 'aria-hidden': 'true', html: '<svg viewBox="0 0 24 24"><path d="' + (ICONE_CONQUISTA[c.tipo] || ICONE_CONQUISTA.outro) + '"/></svg>' }),
        el('span', { class: 'cq-txt' }, el('span', { class: 'cq-t' }, comMarcadores(c.titulo)), c.data ? el('span', { class: 'cq-d' }, dataBonita(c.data)) : null, c.descricao ? el('span', { class: 'cq-desc' }, comMarcadores(c.descricao)) : null,
          c.link ? el('a', { href: c.link, target: ehExterno(c.link) ? '_blank' : null, rel: ehExterno(c.link) ? 'noopener' : null }, 'Ver') : null)))) : null,
      t.habilidades.tecnicas.length ? el('h3', { class: 'sub' }, 'Habilidades técnicas') : null,
      t.habilidades.tecnicas.length ? el('ul', { class: 'comp' }, t.habilidades.tecnicas.map(h => el('li', null, comMarcadores(h)))) : null,
      t.habilidades.pessoais.length ? el('h3', { class: 'sub' }, 'Habilidades pessoais') : null,
      t.habilidades.pessoais.length ? el('ul', { class: 'comp' }, t.habilidades.pessoais.map(h => el('li', null, comMarcadores(h)))) : null));
    const botao = el('button', { type: 'button', class: 'abrir-area', 'aria-expanded': 'false', 'aria-controls': idMais, onclick: () => alternar() },
      el('span', { class: 'ab-txt' }, 'Abrir registro'), el('span', { class: 'ab-ic', html: CHEVRON }));
    const resumo = primeiraFrase(t.descricao, 170);
    const partes = [
      el('p', { class: 'eyebrow' }, `Área ${romano(n)} · `, comMarcadores(t.titulo_area)),
      el('h2', { id: 't-trajetoria' + sufixo }, 'Trajetória', t.periodo ? el('small', null, comMarcadores(t.periodo)) : null),
      el('div', { class: 'orn', html: ORNAMENTO }),
      resumo ? el('p', { class: 'area-resumo' }, comMarcadores(resumo)) : null,
      el('ul', { class: 'area-num', 'aria-label': 'Resumo da trajetória' }, num(t.anos.length, 'ano', 'anos'), t.conquistas.length ? num(t.conquistas.length, 'conquista', 'conquistas') : null, hab.length ? num(hab.length, 'habilidade', 'habilidades') : null),
      linha, mais, botao].filter(Boolean);
    partes.forEach((p, k) => p.style.setProperty('--i', k));
    const copy = el('div', { class: 'copy painel-area painel-trajetoria ' + lado }, partes);
    mais.inert = true;
    function alternar() {
      const aberto = !copy.classList.contains('aberto');
      copy.classList.toggle('aberto', aberto); botao.setAttribute('aria-expanded', String(aberto));
      botao.querySelector('.ab-txt').textContent = aberto ? 'Fechar registro' : 'Abrir registro'; mais.inert = !aberto;
      if (!aberto) requestAnimationFrame(() => botao.scrollIntoView({ block: 'nearest', behavior: reduzido() ? 'auto' : 'smooth' }));
    }
    sec.append(copy);
    return sec;
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

  /* formulário de contato (Formspree ou outro serviço que recebe POST): envia sem sair da página;
     sem JavaScript de rede, o envio normal do formulário continua funcionando */
  function formContato(url) {
    const st = el('p', { class: 'fc-status', role: 'status', 'aria-live': 'polite' });
    const campo = (rot, filho, cls) => el('label', { class: 'fc-campo' + (cls ? ' ' + cls : '') }, el('span', null, rot), filho);
    const f = el('form', { class: 'form-contato', action: url, method: 'POST' },
      campo('Seu nome', el('input', { type: 'text', name: 'nome', required: true, autocomplete: 'name', maxlength: '120' })),
      campo('Seu e-mail', el('input', { type: 'email', name: 'email', required: true, autocomplete: 'email', maxlength: '200' })),
      campo('Mensagem', el('textarea', { name: 'mensagem', rows: '4', required: true, maxlength: '4000' }), 'fc-msg'),
      el('input', { type: 'text', name: '_gotcha', tabindex: '-1', autocomplete: 'off', class: 'fc-isca', 'aria-hidden': 'true' }),
      el('div', { class: 'fc-acoes' }, el('button', { type: 'submit', class: 'botao' }, 'Enviar mensagem'), st));
    f.addEventListener('submit', async ev => {
      if (!window.fetch || !window.FormData) return;
      ev.preventDefault();
      const b = f.querySelector('button[type="submit"]');
      b.disabled = true; st.textContent = 'Enviando…'; st.className = 'fc-status';
      try {
        const r = await fetch(url, { method: 'POST', body: new FormData(f), headers: { Accept: 'application/json' } });
        if (!r.ok) throw new Error('HTTP ' + r.status);
        f.reset(); st.textContent = 'Mensagem enviada. Obrigado!'; st.className = 'fc-status ok';
      } catch (e) {
        st.textContent = 'Não consegui enviar agora. Tente de novo daqui a pouco.'; st.className = 'fc-status erro';
      }
      b.disabled = false;
    });
    return f;
  }
  function montarFinal(d, total) {
    const p = d.perfil, ct = p.contato, n = total;
    const sec = secao('sobre', d._temas.final, 'Sobre e contato', d._temas.variantes[d._temas.variantes.length - 1], 'final', (n - 1) * 380);
    const aviso = el('span', { class: 'aviso', role: 'status', 'aria-live': 'polite' });
    const email = texto(ct.email);
    const emailReal = email && !soMarcador(email) && email.includes('@');
    const form = texto(ct.formulario).trim();
    const links = lista(p.links).filter(l => l && (l.rotulo || l.url));
    const copy = el('div', { class: 'copy painel-final r' },
      el('p', { class: 'eyebrow' }, 'Fim do mapa'),
      el('h2', { id: 't-sobre' }, 'Sobre', el('small', null, 'Quem atravessou o mapa')),
      sobreResumido(d.sobre || '[Texto sobre você.]'),
      el('h3', { class: 'sub' }, 'Contato'),
      el('dl', { class: 'contato' },
        /* com formulário, o e-mail só aparece se estiver preenchido */
        emailReal || !form ? el('div', null, el('dt', null, 'E-mail'), el('dd', null,
          emailReal ? el('a', { href: 'mailto:' + email }, email) : comMarcadores(email || '[e-mail]'),
          emailReal ? el('button', { type: 'button', class: 'botao-texto', onclick: () => copiar(email, aviso) }, 'Copiar') : null, aviso)) : null,
        ct.cidade ? el('div', null, el('dt', null, 'Cidade'), el('dd', null, comMarcadores(ct.cidade))) : null),
      form ? formContato(form) : null,
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
        ...(d.trajetoria ? [{ id: 'trajetoria', nome: 'Trajetória', tema: d.trajetoria.tema, variante: d._temas.variantes[d.areas.length + 1] }] : []),
        { id: 'sobre', nome: 'Sobre e contato', tema: d._temas.final, variante: d._temas.variantes[d._temas.variantes.length - 1] }];
      C.mundo = window.MUNDO ? MUNDO.gerar(regioes, 7) : null;
    } catch (e) { console.warn('Portfólio: mapa', e); C.mundo = null; }
    const secs = [montarInicio(d)];
    d.areas.forEach((a, i) => secs.push(montarArea(d, a, i)));
    if (d.trajetoria) secs.push(montarTrajetoria(d));
    secs.push(montarFinal(d, d.areas.length + 2 + (d.trajetoria ? 1 : 0)));
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
  const ROTULO_VER = { video: 'Assistir aqui', slides: 'Ver a apresentação aqui', doc: 'Ler aqui', mural: 'Ver o mural aqui', outro: 'Ver aqui' };
  const ICONE_VER = {
    video: 'M8 5.5v13l11-6.5z',
    slides: 'M3 4h18v12H3zM12 16v4M8 20h8',
    doc: 'M6 2h9l5 5v15H6zM15 2v5h5M9 12h8M9 16h8',
    mural: 'M3 4h8v7H3zM13 4h8v4h-8zM13 10h8v10h-8zM3 13h8v7H3z',
    outro: 'M14 3h7v7M21 3l-9 9M19 14v7H3V5h7'
  };
  /* o trabalho embutido: só carrega quando a pessoa clica (o detalhe abre rápido e nada de fora carrega sem pedir) */
  function visualizador(atv) {
    const e = atv.embed, fundo = miniaturaDe(atv);
    const caixa = el('div', { class: 'det-ver det-ver-' + e.tipo });
    const botao = el('button', { type: 'button', class: 'det-ver-b', onclick: () => {
      const fr = el('iframe', { src: e.src, title: texto(atv.titulo) + (e.origem ? ' (' + e.origem + ')' : ''), allow: 'autoplay; encrypted-media; fullscreen; picture-in-picture; clipboard-write', allowfullscreen: true, referrerpolicy: 'strict-origin-when-cross-origin' });
      caixa.textContent = '';
      caixa.classList.add('carregado');
      caixa.append(fr);
      fr.focus({ preventScroll: true });
    } },
      fundo ? el('img', { class: 'det-ver-fundo', src: fundo, alt: '', loading: 'lazy', decoding: 'async', onerror() { this.remove(); } }) : null,
      el('span', { class: 'det-ver-ic', 'aria-hidden': 'true', html: '<svg viewBox="0 0 24 24"><path d="' + (ICONE_VER[e.tipo] || ICONE_VER.outro) + '"/></svg>' }),
      el('span', { class: 'det-ver-t' }, ROTULO_VER[e.tipo] || ROTULO_VER.outro),
      e.origem ? el('small', null, 'abre o ' + e.origem + ' dentro da página') : null);
    caixa.append(botao);
    return caixa;
  }
  function blocoCodigo(c) {
    const aviso = el('span', { class: 'aviso', role: 'status', 'aria-live': 'polite' });
    return el('div', { class: 'det-bloco det-codigo' },
      el('div', { class: 'det-bloco-cab' }, el('h3', null, 'Código'),
        el('button', { type: 'button', class: 'botao-texto', onclick: () => copiar(c, aviso) }, 'Copiar'), aviso),
      el('pre', { tabindex: '0', 'aria-label': 'Código' }, el('code', null, c)));
  }
  /* habilidades: fechadas, com os códigos (C3 · H15 …) no resumo; abrem com o texto de cada uma */
  const CODIGO_HAB = /^\s*([CH]\s?\d{1,2})\b\s*[–—:-]?\s*/i;
  function blocoHabilidades(hs) {
    const cods = hs.map(h => (h.match(CODIGO_HAB) || [])[1]).filter(Boolean).map(c => c.replace(/\s+/g, '').toUpperCase());
    const resumo = cods.length === hs.length ? cods.join(' · ') : hs.length + (hs.length === 1 ? ' habilidade' : ' habilidades');
    return el('details', { class: 'det-bloco det-hab' },
      el('summary', null, el('span', { class: 'det-hab-t' }, 'Habilidades trabalhadas'), el('span', { class: 'det-hab-c' }, resumo)),
      el('ul', { class: 'det-lista' }, hs.map(h => {
        const m = h.match(CODIGO_HAB);
        return el('li', null, m ? [el('b', null, m[1].replace(/\s+/g, '').toUpperCase()), h.slice(m[0].length) ? ' ' + h.slice(m[0].length) : ''] : comMarcadores(h));
      })));
  }
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
    const meta = [texto(area.materia), ...atv.disciplinas, TIPOS[atv.tipo] || 'Outro'];
    if (atv.trimestre) meta.push(atv.trimestre + 'º trimestre');
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
      atv.embed ? visualizador(atv) : null,
      atv.materiais.length ? el('div', { class: 'det-bloco' }, el('h3', null, 'Montagem'), el('ul', { class: 'det-lista' }, atv.materiais.map(m => el('li', null, comMarcadores(m))))) : null,
      atv.codigo ? blocoCodigo(atv.codigo) : null,
      atv.habilidades.length ? blocoHabilidades(atv.habilidades) : null,
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
    m.scrollTop = 0; /* quem rola é o fundo do painel: ao ir para a próxima atividade, volta ao topo */
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
  const MOTOR = ['js/01-base.js', 'js/02-regioes.js', 'js/02b-salas.js', 'js/02d-enfeites.js', 'js/03-cenario.js', 'js/03b-hud.js', 'js/03c-vivos.js', 'js/04-jogo.js', 'js/04c-inimigos.js', 'js/04b-segredos.js', 'js/05-audio.js', 'js/05b-sons.js', 'js/06-loop.js', 'js/07-interface.js', 'js/08-pasta-recursos.js', 'js/08b-poderes.js', 'js/09-inicio.js'];
  function carregarMotor() {
    for (const src of MOTOR) {
      const s = document.createElement('script');
      s.src = comVersao(src);
      s.async = false; /* mantém a ordem numérica */
      s.onerror = () => { ERROS.unshift('não carregou: ' + src); avisoMotor(''); };
      document.body.append(s);
    }
    vigiarMotor();
  }
  /* vigia: o motor precisa ficar pronto em até 15 s, e o laço precisa andar enquanto a página está à vista */
  function vigiarMotor() {
    const raiz = document.documentElement, inicio = performance.now();
    let antes = -1, parado = 0;
    const id = setInterval(() => {
      if (avisoFeito) { clearInterval(id); return; }
      if (document.hidden || raiz.classList.contains('abertura-cobrindo')) { parado = 0; return; }
      if (!raiz.classList.contains('motor-pronto')) {
        if (performance.now() - inicio > 15000) avisoMotor('o motor não terminou de carregar');
        return;
      }
      const q = typeof QUADROS === 'number' ? QUADROS : -1;
      parado = q === antes ? parado + 1 : 0;
      antes = q;
      if (parado >= 2) avisoMotor('o desenho parou');
    }, 4000);
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
    C.painelTrajetoria = () => { const sec = montarTrajetoria(dados, '-jogo'), copy = sec.querySelector('.copy'); copy.style.setProperty('--accent', sec.style.getPropertyValue('--accent')); copy.classList.remove('l', 'r'); copy.classList.add('visto', 'no-jogo'); return copy; };
    C.painelArea = j => { const sec = montarArea(dados, dados.areas[j], j, '-jogo'), copy = sec.querySelector('.copy'); copy.style.setProperty('--accent', sec.style.getPropertyValue('--accent')); copy.classList.remove('l', 'r'); copy.classList.add('visto', 'no-jogo'); return copy; };
    montar(dados);
    pronto(dados);
    try { rota(true); } catch (e) { console.warn('Portfólio: endereço', e); }
    try { vigiarAltura(); } catch (e) { console.warn('Portfólio: altura', e); }
    /* o motor carrega já, por trás do escuro inicial; a abertura começa quando ele termina a primeira pintura */
    if (C.mundo) carregarMotor();
    else avisoMotor('o mapa do mundo (js/00a-mundo.js) não carregou');
  }
  iniciar();
})();
