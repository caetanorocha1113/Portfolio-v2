/* ---------- mundo: o mapa 2D do portfólio ----------
   Gera, a partir da lista de regiões (início, uma por matéria, fim), um mapa de salas ligadas
   como num metroidvania: cada região é uma fileira de salas (poço de entrada, salão, corredor, câmara,
   às vezes uma gruta embaixo) e as fileiras se alternam para a direita e para a esquerda, descendo.

   Cada sala é um retângulo com um chão e um teto desenhados como curvas (amostradas a cada PASSO).
   O espaço livre do mapa é a união dos interiores das salas; o resto é rocha. As portas nascem sozinhas
   onde duas salas encostam (o teto desce até a altura da porta perto da parede); os poços são buracos
   no chão de uma sala e no teto da sala de baixo.

   Só dados e consultas, sem desenho: usado pelo motor (js/02b, 03, 04) e pelo mapa do início (js/00b).
   Global exposto: MUNDO. */
(function () {
  'use strict';
  const PASSO = 10, PORTA = 330, ROCHA = 300, BURACO = 300;

  function rng(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function ruido(r) { const v = Array.from({ length: 256 }, r); return x => { const i = Math.floor(x), f = x - i, a = v[((i % 256) + 256) % 256], b = v[(((i + 1) % 256) + 256) % 256], t = (1 - Math.cos(f * Math.PI)) / 2; return a + (b - a) * t; }; }
  const suave = v => v <= 0 ? 0 : v >= 1 ? 1 : v * v * (3 - 2 * v);
  const entre = (a, b, r) => a + (b - a) * r();

  function novaSala(tipo, regiao, x, y, w, h) {
    return { id: 0, tipo, regiao, x: Math.round(x), y: Math.round(y), w: Math.round(w), h: Math.round(h), n: 0, chao: null, teto: null,
      ligE: false, ligD: false, buracosChao: [], buracosTeto: [], abismo: null, ceu: false, plataformas: [], vagas: [], frente: [] };
  }

  /* ---------- consultas (rápidas: o motor chama várias vezes por quadro) ---------- */
  function amostra(arr, s, x) {
    const f = (x - s.x) / PASSO;
    if (f < -.01 || f > s.n - 1 + .01) return NaN;
    const k = Math.max(0, Math.min(s.n - 2, Math.floor(f))), t = Math.max(0, Math.min(1, f - k)), a = arr[k], b = arr[k + 1];
    if (a !== a || b !== b) return t < .5 ? a : b;
    return a + (b - a) * t;
  }
  const chaoEm = (s, x) => amostra(s.chao, s, x);
  const tetoEm = (s, x) => amostra(s.teto, s, x);

  /* ---------- montagem ---------- */
  function gerar(regioes, semente) {
    const salas = [], regs = regioes.map((g, i) => ({ ...g, i, salas: [], dir: 1 }));
    const add = s => { s.id = salas.length; salas.push(s); regs[s.regiao].salas.push(s.id); return s; };
    const liga = (a, b, dir) => { if (dir > 0) { a.ligD = true; b.ligE = true; } else { a.ligE = true; b.ligD = true; } };
    const N = regs.length;

    /* região 0: a vila, na superfície, com céu aberto */
    const V = add(novaSala('vila', 0, 0, -1500, 4400, 1500));
    V.ceu = true;
    regs[0].dir = 1;
    let buracoX = V.x + V.w - 560, acima = V, fundoMax = 0, dir = -1;
    V.buracosChao.push([buracoX - BURACO / 2, buracoX + BURACO / 2]);
    const filas = [[V]];

    for (let i = 1; i < N; i++) {
      const r = rng((semente || 7) * 1000 + i * 77), fim = i === N - 1;
      regs[i].dir = dir;
      const Hw = fim ? 2900 : Math.round(entre(3000, 3800, r)), Hh = fim ? 1450 : Math.round(entre(1080, 1300, r));
      const Cw = Math.round(entre(850, 1350, r)), Ch = 400;
      const Aw = Math.round(entre(1500, 2000, r)), Ah = Math.round(entre(900, 1100, r));
      const ordem = fim ? ['fim'] : r() < .5 ? ['salao', 'corredor', 'camara'] : ['corredor', 'salao', 'camara'];
      const maxH = fim ? Hh : Math.max(Hh, Ah, Ch);
      /* poço: do buraco da sala de cima até a base da nova fileira (abaixo de tudo o que já existe) */
      const base = fundoMax + ROCHA + maxH, Sw = 620, Sy = acima.y + acima.h;
      const S = add(novaSala('poco', i, buracoX - Sw / 2, Sy, Sw, base - Sy));
      S.buracosTeto.push([buracoX - BURACO / 2, buracoX + BURACO / 2]);
      let cursor = dir > 0 ? S.x + S.w : S.x, anterior = S;
      const fila = [S];
      for (const t of ordem) {
        const [w, h] = t === 'salao' || t === 'fim' ? [Hw, Hh] : t === 'corredor' ? [Cw, Ch] : [Aw, Ah];
        const x = dir > 0 ? cursor : cursor - w, s = add(novaSala(t, i, x, base - h, w, h));
        cursor = dir > 0 ? x + w : x;
        liga(anterior, s, dir);
        anterior = s; fila.push(s);
      }
      fundoMax = Math.max(fundoMax, base);
      if (fim) {
        const F = anterior;
        F.abismo = dir > 0 ? [F.x + 1050, F.x + F.w + 1] : [F.x - 1, F.x + F.w - 1050];
      } else {
        /* gruta sob o salão, em regiões alternadas: um desvio para explorar no modo Jogo */
        if (i % 2 === 0) {
          const H = fila.find(s => s.tipo === 'salao'), gw = 1200, gh = 680;
          const gx = Math.round(H.x + H.w * .5 - gw / 2 + (r() - .5) * H.w * .25), hx = gx + gw / 2;
          const G = add(novaSala('gruta', i, gx, H.y + H.h, gw, gh));
          H.buracosChao.push([hx - 130, hx + 130]);
          G.buracosTeto.push([hx - 130, hx + 130]);
          fundoMax = Math.max(fundoMax, G.y + G.h);
        }
        /* buraco no fim da câmara: o poço da próxima região começa aqui */
        const A = anterior;
        buracoX = dir > 0 ? A.x + A.w - 430 : A.x + 430;
        A.buracosChao.push([buracoX - BURACO / 2, buracoX + BURACO / 2]);
        acima = A;
      }
      filas.push(fila);
      dir = -dir;
    }

    for (const s of salas) moldar(s, rng(5000 + s.id * 31));
    for (const s of salas) plataformas(s, rng(9000 + s.id * 17));
    for (const s of salas) vagas(s, rng(13000 + s.id * 29));

    const m = { salas, regioes: regs, PASSO, PORTA };
    m.rota = rota(m, filas);
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const s of salas) { x0 = Math.min(x0, s.x); y0 = Math.min(y0, s.y); x1 = Math.max(x1, s.x + s.w); y1 = Math.max(y1, s.y + s.h); }
    m.limites = { x0, y0, x1, y1 };
    for (const g of regs) {
      const ss = g.salas.map(k => salas[k]), principal = ss.find(s => s.tipo === 'salao' || s.tipo === 'vila' || s.tipo === 'fim') || ss[0];
      g.caixa = { x0: Math.min(...ss.map(s => s.x)), y0: Math.min(...ss.map(s => s.y)), x1: Math.max(...ss.map(s => s.x + s.w)), y1: Math.max(...ss.map(s => s.y + s.h)) };
      g.principal = principal.id;
    }
    Object.assign(m, consultas(m));
    return m;
  }

  /* chão e teto de uma sala: curvas suaves, planas perto das portas e dos buracos */
  function moldar(s, r) {
    const n = Math.ceil(s.w / PASSO) + 1, base = s.y + s.h, topo = s.y;
    s.n = n; s.chao = new Float32Array(n); s.teto = new Float32Array(n);
    const amp = { vila: [70, 0], salao: [80, 120], corredor: [16, 34], camara: [55, 90], poco: [0, 40], gruta: [45, 80], fim: [40, 70] }[s.tipo] || [40, 60];
    const nc = ruido(r), nt = ruido(r), nt2 = ruido(r);
    const dist = (x, [a, b]) => x < a ? a - x : x > b ? x - b : 0;
    for (let k = 0; k < n; k++) {
      const lx = Math.min(k * PASSO, s.w), x = s.x + lx;
      const bump = amp[0] * nc(lx / 420), pend = amp[1] * Math.pow(nt(lx / 300), 1.6) + amp[1] * .5 * Math.pow(nt2(lx / 80), 3);
      const wE = s.ligE ? suave((lx - 50) / 300) : 1, wD = s.ligD ? suave((s.w - lx - 50) / 300) : 1, wp = Math.min(wE, wD);
      let wb = 1;
      for (const h of s.buracosChao) wb = Math.min(wb, suave((dist(x, h) - 20) / 170));
      let chao = base - bump * Math.min(wp, wb);
      for (const [a, b] of s.buracosChao) if (x >= a && x <= b) chao = NaN;
      if (s.abismo && x >= s.abismo[0] && x <= s.abismo[1]) chao = NaN;
      let wt = 1;
      for (const h of s.buracosTeto) wt = Math.min(wt, suave((dist(x, h) - 10) / 140));
      let teto = s.ceu ? topo : topo + pend * wt;
      if (s.tipo !== 'poco' && !s.ceu && wp < 1) teto = Math.max(teto, (base - PORTA) * (1 - wp) + teto * wp);
      for (const [a, b] of s.buracosTeto) if (x >= a && x <= b) teto = topo - 1;
      s.chao[k] = chao; s.teto[k] = teto;
    }
  }

  /* plataformas que se atravessam por baixo e se pisa por cima */
  function plataformas(s, r) {
    const P = s.plataformas, longe = (x, folga) => !s.buracosChao.some(([a, b]) => x > a - folga && x < b + folga) && x > s.x + (s.ligE ? 380 : 160) && x < s.x + s.w - (s.ligD ? 380 : 160);
    if (s.tipo === 'poco') {
      const base = s.y + s.h;
      for (let y = s.y + 175, k = 0; y < base - 140; y += 165, k++) P.push({ x: s.x + s.w * (k % 2 ? .7 : .3), y, w: 150 });
    } else if (s.tipo === 'salao' || s.tipo === 'camara' || s.tipo === 'fim') {
      const q = s.tipo === 'salao' ? 4 : 3;
      for (let k = 0; k < q; k++) {
        const x = s.x + s.w * (.15 + .7 * (k + .25 + r() * .5) / q);
        if (!longe(x, 160) || (s.abismo && x > s.abismo[0] - 200 && x < s.abismo[1] + 200)) continue;
        const c = chaoEm(s, x);
        if (c !== c) continue;
        P.push({ x, y: Math.round(c - (190 + r() * 160)), w: Math.round(140 + r() * 90) });
      }
    } else if (s.tipo === 'gruta') {
      const [a, b] = s.buracosTeto[0], cx = (a + b) / 2, base = s.y + s.h;
      P.push({ x: cx - 190, y: base - 170, w: 150 }, { x: cx + 170, y: base - 335, w: 150 }, { x: cx - 40, y: base - 505, w: 170 });
    }
  }

  /* lugares para enfeites (o desenho de cada tema decide o que vai em cada um) e para a frente desfocada */
  function vagas(s, r) {
    const V = s.vagas, perto = x => s.buracosChao.some(([a, b]) => x > a - 70 && x < b + 70) || (s.abismo && x > s.abismo[0] - 40 && x < s.abismo[1] + 40);
    const margem = 90;
    /* um ou dois marcos grandes nos salões e na vila */
    if (s.tipo === 'salao' || s.tipo === 'vila' || s.tipo === 'fim' || s.tipo === 'camara') {
      const q = s.tipo === 'vila' ? 4 : s.tipo === 'salao' ? 2 : 1;
      for (let k = 0; k < q; k++) {
        const x = s.x + s.w * (.12 + .76 * (k + .2 + r() * .6) / q);
        if (perto(x) || x < s.x + (s.ligE ? 420 : 200) || x > s.x + s.w - (s.ligD ? 420 : 200)) continue;
        const c = chaoEm(s, x); if (c !== c) continue;
        V.push({ tipo: 'grande', x, y: c, s: .85 + r() * .35, seed: (r() * 1e9) | 0 });
      }
    }
    for (let x = s.x + margem + r() * 200; x < s.x + s.w - margem; x += 230 + r() * 260) {
      if (perto(x)) continue;
      const c = chaoEm(s, x); if (c !== c) continue;
      V.push({ tipo: 'chao', x, y: c, s: .7 + r() * .6, seed: (r() * 1e9) | 0 });
    }
    if (!s.ceu) for (let x = s.x + margem + r() * 240; x < s.x + s.w - margem; x += 280 + r() * 320) {
      const t = tetoEm(s, x); if (t !== t || t < s.y) continue;
      V.push({ tipo: 'teto', x, y: t, s: .7 + r() * .6, seed: (r() * 1e9) | 0 });
    }
    /* lugares para inimigos: ao longo do chão, longe de portas e buracos, espaçados */
    s.vagasInimigo = [];
    if (s.tipo !== 'poco') for (let x = s.x + (s.ligE ? 360 : 200) + r() * 120; x < s.x + s.w - (s.ligD ? 360 : 200); x += 260 + r() * 160) {
      if (perto(x)) continue;
      const c = chaoEm(s, x); if (c !== c) continue;
      s.vagasInimigo.push({ x, y: c });
    }
    /* frente: silhuetas escuras entre o jogador e a câmera, e mato na frente dos pés */
    for (let x = s.x + 60 + r() * 120; x < s.x + s.w - 40; x += 120 + r() * 170) {
      const c = chaoEm(s, x);
      if (c === c && !perto(x)) s.frente.push({ tipo: 'grama', x, y: c + 4, s: .8 + r() * .5, seed: (r() * 1e9) | 0 });
    }
    for (let x = s.x + r() * 400; x < s.x + s.w; x += 520 + r() * 520) {
      const c = chaoEm(s, x);
      if (c === c) s.frente.push({ tipo: 'baixo', x, y: c + 30, s: .8 + r() * .5, seed: (r() * 1e9) | 0 });
    }
    if (!s.ceu) for (let x = s.x + 200 + r() * 500; x < s.x + s.w; x += 700 + r() * 700) {
      const t = tetoEm(s, x);
      if (t === t && t >= s.y) s.frente.push({ tipo: 'cima', x, y: t - 20, s: .8 + r() * .5, seed: (r() * 1e9) | 0 });
    }
  }

  /* rota do Passeio: o caminho que o personagem faz sozinho, de região em região */
  function rota(m, filas) {
    const R = [], salas = m.salas;
    const no = (x, y, j, s) => R.push({ x: Math.round(x), y: Math.round(y), j: j ? 1 : 0, sala: s.id, reg: s.regiao });
    const chao = (s, x) => chaoEm(s, x);
    const V = filas[0][0], bv = V.buracosChao[0];
    no(V.x + 420, chao(V, V.x + 420), 0, V);
    no(V.x + V.w * .45, chao(V, V.x + V.w * .45), 0, V);
    no(bv[0] - 36, chao(V, bv[0] - 36), 0, V);
    m.regioes[0].rota = 0;
    for (let f = 1; f < filas.length; f++) {
      const fila = filas[f], S = fila[0], dir = m.regioes[S.regiao].dir;
      m.regioes[S.regiao].rota = R.length;
      /* desce o poço pelas plataformas */
      S.plataformas.slice().sort((a, b) => a.y - b.y).forEach(p => no(p.x, p.y, 1, S));
      const pe = dir > 0 ? S.x + S.w - 70 : S.x + 70;
      no(pe, chao(S, pe), 1, S);
      for (let k = 1; k < fila.length; k++) {
        const s = fila[k], ent = dir > 0 ? s.x + 70 : s.x + s.w - 70, sai = dir > 0 ? s.x + s.w - 70 : s.x + 70;
        const em = x => (x - ent) * dir;
        no(ent, chao(s, ent), 0, s);
        /* buracos e plataformas no caminho, na ordem em que aparecem */
        const eventos = [];
        s.buracosChao.forEach(b => eventos.push({ t: 'b', b, x: dir > 0 ? b[0] : b[1] }));
        if (s.tipo === 'salao' && s.plataformas.length) { const p = s.plataformas[(s.id * 7) % s.plataformas.length]; eventos.push({ t: 'p', p, x: p.x - dir * (p.w / 2 + 120) }); }
        eventos.sort((a, b) => em(a.x) - em(b.x));
        let ultimoBuraco = null;
        for (const e of eventos) {
          if (e.t === 'b') {
            const antes = dir > 0 ? e.b[0] - 36 : e.b[1] + 36, depois = dir > 0 ? e.b[1] + 36 : e.b[0] - 36;
            if (k === fila.length - 1 && e.b === s.buracosChao[s.buracosChao.length - 1] && s.tipo === 'camara') { ultimoBuraco = antes; continue; }
            no(antes, chao(s, antes), 0, s); no(depois, chao(s, depois), 1, s);
          } else {
            const a = e.x, b2 = e.p.x + dir * (e.p.w / 2 + 130);
            if (em(a) < 80 || em(b2) > em(sai) - 80) continue;
            const ca = chao(s, a), cb = chao(s, b2);
            if (ca !== ca || cb !== cb) continue;
            no(a, ca, 0, s); no(e.p.x, e.p.y, 1, s); no(b2, cb, 1, s);
          }
        }
        if (ultimoBuraco != null) no(ultimoBuraco, chao(s, ultimoBuraco), 0, s);
        else if (s.tipo === 'fim') { const borda = dir > 0 ? s.abismo[0] - 60 : s.abismo[1] + 60; no(borda, chao(s, borda), 0, s); }
        else no(sai, chao(s, sai), 0, s);
      }
    }
    /* distância acumulada, para ligar a rolagem da página ao caminho */
    let d = 0;
    R.forEach((n, k) => { if (k) d += Math.hypot(n.x - R[k - 1].x, n.y - R[k - 1].y); n.s = d; });
    return R;
  }

  function consultas(m) {
    const S = m.salas;
    const emX = x => S.filter(s => x >= s.x - .5 && x <= s.x + s.w + .5);
    function dentro(x, y) {
      for (const s of S) {
        if (x < s.x - .5 || x > s.x + s.w + .5) continue;
        const f = chaoEm(s, x), t = tetoEm(s, x), fl = f !== f ? s.y + s.h + 2 : f;
        if (y >= t - .5 && y <= fl + .5) return true;
      }
      return false;
    }
    /* chão que se cruza ao descer de y0 até y1 (o mais alto) */
    function chaoAbaixo(x, y0, y1) {
      let best = null, sala = null;
      for (const s of S) {
        if (x < s.x - .5 || x > s.x + s.w + .5) continue;
        const f = chaoEm(s, x);
        if (f === f && f >= y0 - 8 && f <= y1 + 1 && (best == null || f < best)) { best = f; sala = s; }
      }
      return best == null ? null : { y: best, sala };
    }
    /* chão perto de y (para andar acompanhando o relevo) */
    function chaoPerto(x, y, tol) {
      let best = null, bd = tol;
      for (const s of S) {
        if (x < s.x - .5 || x > s.x + s.w + .5) continue;
        const f = chaoEm(s, x);
        if (f === f && Math.abs(f - y) <= bd) { best = f; bd = Math.abs(f - y); }
      }
      return best;
    }
    function salaEm(x, y) {
      let fora = null;
      for (const s of S) {
        if (x < s.x - .5 || x > s.x + s.w + .5 || y < s.y - 2 || y > s.y + s.h + 2) continue;
        const f = chaoEm(s, x), t = tetoEm(s, x), fl = f !== f ? s.y + s.h + 2 : f;
        if (y >= t - 1 && y <= fl + 1) return s;
        fora = fora || s;
      }
      return fora;
    }
    return { emX, dentro, chaoAbaixo, chaoPerto, salaEm };
  }

  window.MUNDO = { gerar, chaoEm, tetoEm, PASSO, PORTA };
})();
