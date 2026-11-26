/* ---------- abertura de cinema ----------
   Tudo desenhado a tinta clara sobre papel escuro, com as linhas tremendo como desenho animado.
   Roteiro: uma gota de tinta cai no escuro e se espalha em gavinhas; um livro aberto (o Atlas) se desenha
   traço a traço; as páginas se soltam e voam como mariposas até as matérias; o mapa de verdade do mundo
   (js/00a-mundo.js) se desenha região por região, com o caminho e uma luz que o percorre; o título aparece
   entre floreios e pousa no lugar do título do site.
   Os textos vêm de conteudo/portfolio.json ("abertura"). Dá para pular com o botão, Esc, Enter,
   Espaço, clique ou rolagem. "mostrar": "sempre" | "uma_vez_por_sessao" | "nunca".
   Ela começa depois da primeira pintura do motor (no máximo 2,5 s de escuro, como o começo de um filme),
   e o laço do jogo fica parado enquanto ela cobre a tela (classe abertura-cobrindo). Vem depois de js/00b-conteudo.js.
   Global exposto: ABERTURA.tocar() (botão "Rever abertura"). */
(function () {
  'use strict';
  const raiz = document.documentElement, ov = document.getElementById('abertura');
  if (!ov) { window.ABERTURA = { tocar() {} }; return; }
  const tela = document.getElementById('abTela'), ctx = tela.getContext('2d');
  const falasEl = document.getElementById('abFalas'), mapaEl = document.getElementById('abMapa'), tituloEl = document.getElementById('abTitulo');
  const nomeEl = document.getElementById('abNome');
  const CHAVE = 'portfolio:abertura-vista';
  /* roteiro, em segundos */
  const R = { gota: .55, fala1: 1.1, gavinhas: 1.2, livro: 2.2, fala2: 4.5, abre: 5.9, mapa: 7.0, fala3: 7.6, rota: 8.5, rotulos: 8.8, titulo: 10.6, sai: 13.7 };
  const DURA = [2.8, 2.6, 2.6];
  const COR = '#e8e0cf', OURO = '#f2d49b';

  let rodando = false, raf = 0, t0 = 0, ult = 0, W = 0, H = 0, D = 1, calmo = false, dados = null, t = 0, ferv = 0;
  let feitos = {}, poeira = [], respingos = [], gavinhas = [], livro = [], folhas = [], mapa = null, ancoras = [], rotulos = [], papel = null, orn = null;

  const brilho = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,246,225,1)'); g.addColorStop(.2, 'rgba(255,232,190,.6)'); g.addColorStop(.5, 'rgba(255,220,170,.14)'); g.addColorStop(1, 'rgba(255,220,170,0)');
    x.fillStyle = g; x.fillRect(0, 0, 64, 64); return c;
  })();
  function luz(x, y, r, a) { if (a <= .01 || r <= 0) return; ctx.globalAlpha = Math.min(1, a); ctx.drawImage(brilho, x - r, y - r, r * 2, r * 2); }
  const suave = v => v <= 0 ? 0 : v >= 1 ? 1 : v * v * (3 - 2 * v);
  const fase = (a, b) => suave((t - a) / (b - a));
  const lin = (a, b) => Math.max(0, Math.min(1, (t - a) / (b - a)));
  const rnd = s => { const x = Math.sin(s * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const romanoCurto = n => ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV'][n] || String(n);

  /* curva de Bézier cúbica amostrada em pontos */
  function bez(p0, p1, p2, p3, n) {
    const o = [];
    for (let i = 0; i <= n; i++) {
      const u = i / n, v = 1 - u;
      o.push([v * v * v * p0[0] + 3 * v * v * u * p1[0] + 3 * v * u * u * p2[0] + u * u * u * p3[0], v * v * v * p0[1] + 3 * v * v * u * p1[1] + 3 * v * u * u * p2[1] + u * u * u * p3[1]]);
    }
    return o;
  }
  const junta = (...ls) => ls.reduce((a, l) => a.concat(a.length ? l.slice(1) : l), []);
  /* arredonda cantos (Chaikin): o contorno das salas fica com cara de desenho */
  function chaikin(P, fechado) {
    const o = [], n = P.length;
    for (let i = 0; i < (fechado ? n : n - 1); i++) {
      const a = P[i], b = P[(i + 1) % n];
      o.push([a[0] * .75 + b[0] * .25, a[1] * .75 + b[1] * .25], [a[0] * .25 + b[0] * .75, a[1] * .25 + b[1] * .75]);
    }
    if (fechado) o.push(o[0]);
    return o;
  }

  /* traço de tinta: uma fita de largura variável, fina nas pontas, desenhada até "prog" do comprimento.
     As linhas "fervem" (tremem 8 vezes por segundo), como num desenho feito à mão quadro a quadro. */
  function traco(T, prog, a, cor) {
    if (prog <= 0 || a <= .01) return;
    const P = T.p, n = P.length;
    if (n < 2) return;
    if (!T.L) { T.L = [0]; for (let i = 1; i < n; i++) T.L.push(T.L[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1])); }
    const tot = T.L[n - 1] || 1, ate = tot * Math.min(1, prog);
    let m = 1; while (m < n - 1 && T.L[m] < ate) m++;
    const f = Math.min(1, (ate - T.L[m - 1]) / Math.max(1e-6, T.L[m] - T.L[m - 1]));
    const pts = P.slice(0, m), us = T.L.slice(0, m).map(l => l / tot);
    pts.push([P[m - 1][0] + (P[m][0] - P[m - 1][0]) * f, P[m - 1][1] + (P[m][1] - P[m - 1][1]) * f]); us.push(ate / tot);
    const k = pts.length, esq = [], dir = [], amp = calmo ? 0 : (T.trem != null ? T.trem : 1), sd = T.sd || 0;
    const fA = rnd(sd + ferv * 1.7) * 6.28, fB = rnd(sd * 1.3 + ferv * 2.9) * 6.28;
    for (let i = 0; i < k; i++) {
      const [x, y] = pts[i], A = pts[Math.max(0, i - 1)], B = pts[Math.min(k - 1, i + 1)], u = us[i];
      let nx = -(B[1] - A[1]), ny = B[0] - A[0]; const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
      const ponta = T.aberto ? 1 : Math.pow(Math.sin(Math.PI * Math.min(.985, Math.max(.015, u))), .5);
      const cabeca = prog < 1 ? Math.min(1, .3 + (ate - u * tot) / 14) : 1;
      const ww = T.w * ponta * cabeca * (.82 + .3 * Math.sin(u * 13 + sd));
      const j = amp * (Math.sin(u * 9 + fA) * .65 + Math.sin(u * 23 + fB) * .35);
      esq.push([x + nx * (ww / 2 + j), y + ny * (ww / 2 + j)]); dir.push([x - nx * (ww / 2 - j), y - ny * (ww / 2 - j)]);
    }
    ctx.globalAlpha = Math.min(1, a); ctx.fillStyle = cor || T.cor || COR;
    ctx.beginPath(); ctx.moveTo(esq[0][0], esq[0][1]);
    for (let i = 1; i < k; i++) ctx.lineTo(esq[i][0], esq[i][1]);
    for (let i = k - 1; i >= 0; i--) ctx.lineTo(dir[i][0], dir[i][1]);
    ctx.closePath(); ctx.fill();
  }
  /* progresso e opacidade de um traço que começa em "ini" e dura "dur" (sem animação para quem pediu menos movimento) */
  const pr = (ini, dur) => calmo ? [t >= ini ? 1 : 0, fase(ini, ini + .7)] : [lin(ini, ini + dur), t >= ini ? 1 : 0];

  /* papel escuro com fibras e cantos mais escuros (pintado uma vez por tamanho de tela) */
  function fazerPapel() {
    const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(W * D / 2)); c.height = Math.max(1, Math.round(H * D / 2));
    const x = c.getContext('2d');
    x.fillStyle = '#05050a'; x.fillRect(0, 0, c.width, c.height);
    x.lineWidth = 1;
    for (let i = 0; i < 420; i++) {
      const px = Math.random() * c.width, py = Math.random() * c.height, l = 6 + Math.random() * 30, an = Math.random() * 6.28;
      x.strokeStyle = `rgba(232,224,207,${.012 + Math.random() * .025})`;
      x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + Math.cos(an + .7) * l * .5, py + Math.sin(an + .7) * l * .5, px + Math.cos(an) * l, py + Math.sin(an) * l); x.stroke();
    }
    for (let i = 0; i < 1100; i++) { x.fillStyle = `rgba(232,224,207,${Math.random() * .05})`; x.fillRect(Math.random() * c.width, Math.random() * c.height, 1, 1); }
    const g = x.createRadialGradient(c.width / 2, c.height * .45, Math.min(c.width, c.height) * .18, c.width / 2, c.height * .45, Math.max(c.width, c.height) * .78);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.8)'); x.fillStyle = g; x.fillRect(0, 0, c.width, c.height);
    return c;
  }

  /* gavinhas que brotam da mancha de tinta e se enrolam nas pontas */
  function gerarGavinhas(cx, cy, esc) {
    const out = [], n = W < 700 ? 8 : 11;
    const brota = (x, y, an, len, w, ini, lado) => {
      let curv = (Math.random() - .5) * .02;
      const pts = [[x, y]], passo = 4;
      for (let d = 0; d < len; d += passo) {
        const f = d / len; curv += (Math.random() - .5) * .008;
        an += curv + lado * Math.pow(f, 2.6) * .2;
        x += Math.cos(an) * passo; y += Math.sin(an) * passo * .78; pts.push([x, y]);
      }
      out.push({ p: pts, w, sd: Math.random() * 100, ini, dur: .8 + len / 260 });
      return pts;
    };
    for (let k = 0; k < n; k++) {
      const an = (k / n) * Math.PI * 2 + (Math.random() - .5) * .5, len = (110 + Math.random() * 170) * esc, lado = Math.random() < .5 ? -1 : 1, ini = R.gavinhas + Math.random() * .45;
      const pts = brota(cx + Math.cos(an) * 14 * esc, cy + Math.sin(an) * 9 * esc, an, len, (3 + Math.random() * 1.8) * esc, ini, lado);
      /* um galho menor sai do meio */
      const q = pts[Math.floor(pts.length * (.35 + Math.random() * .3))], a2 = an + lado * (.6 + Math.random() * .5);
      brota(q[0], q[1], a2, len * (.3 + Math.random() * .2), 1.8 * esc, ini + .35 + Math.random() * .3, -lado);
    }
    return out;
  }

  /* o livro aberto, traço por traço */
  function gerarLivro(cx, cy, bw) {
    const bh = bw * .46, L = [], e = Math.max(.6, Math.min(1.25, bw / 560)), t1 = R.livro;
    const S = (p, w, ini, dur, extra) => L.push(Object.assign({ p, w: w * e, ini, dur, sd: Math.random() * 100 }, extra || {}));
    for (const s of [-1, 1]) {
      const X = v => cx + s * v;
      /* capa por trás das páginas */
      S(junta(bez([cx, cy + bh * .56], [X(bw * .2), cy + bh * .63], [X(bw * .42), cy + bh * .57], [X(bw * .545), cy + bh * .51], 26),
        bez([X(bw * .545), cy + bh * .51], [X(bw * .556), cy + bh * .12], [X(bw * .55), cy - bh * .24], [X(bw * .53), cy - bh * .5], 22)), 3.6, t1, 1.1);
      /* página: borda de cima (curva perto da lombada), lado de fora e borda de baixo */
      S(junta(bez([cx, cy - bh * .4], [X(bw * .12), cy - bh * .53], [X(bw * .32), cy - bh * .57], [X(bw * .5), cy - bh * .47], 26),
        bez([X(bw * .5), cy - bh * .47], [X(bw * .512), cy - bh * .15], [X(bw * .503), cy + bh * .2], [X(bw * .49), cy + bh * .44], 20),
        bez([X(bw * .49), cy + bh * .44], [X(bw * .3), cy + bh * .5], [X(bw * .12), cy + bh * .47], [cx, cy + bh * .52], 26)), 2.6, t1 + .3, 1.3);
      /* espessura do maço de folhas */
      for (let q = 1; q <= 3; q++) S(bez([X(bw * (.49 + q * .006)), cy + bh * (.44 + q * .022)], [X(bw * .4), cy + bh * (.5 + q * .022)], [X(bw * .3), cy + bh * (.505 + q * .02)], [X(bw * .2), cy + bh * (.5 + q * .018)], 14), 1.1, t1 + 1.1 + q * .1, .5);
    }
    /* lombada */
    S(bez([cx, cy - bh * .4], [cx + 3, cy - bh * .1], [cx - 3, cy + bh * .2], [cx, cy + bh * .52], 20), 2.8, t1 + .15, .8);
    /* linhas escritas à mão na página da esquerda */
    for (let r = 0; r < 7; r++) {
      const y = cy - bh * .3 + r * bh * .095, x0 = cx - bw * .44, x1 = cx - bw * (.07 + (r === 6 ? .18 : Math.random() * .05)), pts = [];
      for (let x = x0; x <= x1; x += 4) { const u = (x - x0) / (x1 - x0); pts.push([x, y - Math.pow(u, 3) * bh * .06 + Math.sin(x * .21 + r) * 1.6 + Math.sin(x * .07 + r * 2) * 1.2]); }
      S(pts, 1.25, t1 + 1.4 + r * .16, .34, { trem: .5 });
    }
    /* rosa dos ventos na página da direita */
    const rx = cx + bw * .25, ry = cy - bh * .02, rr = bh * .2, circ = [];
    for (let i = 0; i <= 48; i++) { const a = i / 48 * Math.PI * 2 - Math.PI / 2; circ.push([rx + Math.cos(a) * rr, ry + Math.sin(a) * rr]); }
    S(circ, 1.6, t1 + 1.6, .7, { aberto: true });
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * Math.PI * 2 - Math.PI / 2, lg = i % 2 ? rr * .72 : rr * 1.32, b1 = a + .2, b2 = a - .2;
      S([[rx + Math.cos(b1) * rr * .16, ry + Math.sin(b1) * rr * .16], [rx + Math.cos(a) * lg, ry + Math.sin(a) * lg], [rx + Math.cos(b2) * rr * .16, ry + Math.sin(b2) * rr * .16]], i % 2 ? 1.1 : 1.5, t1 + 2 + i * .07, .3, { aberto: true, trem: .4 });
    }
    /* fita marcadora pendurada na lombada */
    S(bez([cx + 4, cy + bh * .5], [cx + 14, cy + bh * .68], [cx - 10, cy + bh * .8], [cx + 6, cy + bh * .98], 18), 2.4, t1 + 2.2, .6);
    S(bez([cx + 11, cy + bh * .5], [cx + 21, cy + bh * .68], [cx - 3, cy + bh * .8], [cx + 13, cy + bh * .97], 18), 1.4, t1 + 2.3, .6);
    return { tracos: L, bw, bh, cx, cy };
  }

  /* contorno de uma sala do mapa (mesma regra do mapa do início em js/00b-conteudo.js) */
  function contorno(s) {
    const pts = [], PS = (window.MUNDO && MUNDO.PASSO) || 10, passo = 10;
    const topo = k => s.ceu ? s.y + s.h * .45 : s.teto[k], chao = k => { const f = s.chao[k]; return f === f ? f : s.y + s.h; };
    for (let k = 0; k < s.n; k += passo) pts.push([s.x + Math.min(k * PS, s.w), topo(k)]);
    pts.push([s.x + s.w, topo(s.n - 1)], [s.x + s.w, chao(s.n - 1)]);
    for (let k = s.n - 1; k >= 0; k -= passo) pts.push([s.x + Math.min(k * PS, s.w), chao(k)]);
    pts.push([s.x, chao(0)]);
    return pts;
  }
  function gerarMapa() {
    const m = window.CONTEUDO && window.CONTEUDO.mundo;
    if (!m || !m.salas || !m.regioes) return null;
    const Lm = m.limites, x0 = Lm.x0, y0 = Lm.y0 + 600, x1 = Lm.x1, y1 = Lm.y1, estreito = W < 700;
    const esc = Math.min(W * (estreito ? .9 : .78) / (x1 - x0), H * (estreito ? .58 : .56) / (y1 - y0));
    const ox = W / 2 - (x0 + x1) / 2 * esc, oy = H * .43 - (y0 + y1) / 2 * esc, P = ([x, y]) => [ox + x * esc, oy + y * esc];
    const torto = (pts, sd) => pts.map(([x, y]) => [x + Math.sin(y * .045 + sd) * 1.6 + Math.sin(y * .11 + sd * 2) * .7, y + Math.sin(x * .05 + sd * 3) * 1.4]);
    const salas = m.salas.map((s, k) => s.secreta ? null : ({ p: torto(chaikin(chaikin(contorno(s).map(P), true), true), k * 1.7), w: 1.7, sd: Math.random() * 100, aberto: true }));
    const regs = m.regioes.map((g, i) => {
      const p = m.salas[g.principal];
      return { salas: g.salas, centro: P([p.x + p.w / 2, p.ceu ? p.y + p.h * .72 : p.y + p.h * .58]), ini: R.mapa + i * .27 };
    });
    const rota = { p: m.rota.map(n => P([n.x, n.y - 60])) };
    const [bx0, by0] = P([x0, y0]), [bx1, by1] = P([x1, y1]);
    return { salas, regs, rota, caixa: { x0: bx0, y0: by0, x1: bx1, y1: by1 } };
  }

  /* páginas que se soltam do livro e voam até as matérias */
  function gerarFolhas() {
    const n = W < 700 ? 6 : 9, out = [];
    for (let k = 0; k < n; k++) out.push({ ini: R.abre + k * .12, alvo: k, sd: Math.random() * 100, giro: (Math.random() - .5) * 1.4, curva: (Math.random() - .5) * 260 - 80, tam: .5 + Math.random() * .35 });
    return out;
  }

  /* floreios do título, feitos na hora em que ele aparece (para pegar o tamanho real do nome) */
  function gerarOrnamento() {
    const r = nomeEl.getBoundingClientRect(), cy = r.top + r.height * .55, cx = r.left + r.width / 2, e = Math.max(.55, Math.min(1.2, r.height / 150)), L = [];
    const S = (p, w, ini, dur, extra) => L.push(Object.assign({ p, w: w * e, ini, dur, sd: Math.random() * 100 }, extra || {}));
    for (const s of [-1, 1]) {
      const X = v => s * v, xa = s < 0 ? r.left - 14 * e : r.right + 14 * e, lg = Math.min(W * .2, 230 * e);
      const ramo = bez([xa, cy], [xa + X(lg * .35), cy - 26 * e], [xa + X(lg * .7), cy + 22 * e], [xa + X(lg), cy - 4 * e], 30);
      /* a ponta se enrola */
      const [ex, ey] = ramo[ramo.length - 1], caracol = [];
      for (let i = 0; i <= 26; i++) { const d = i / 26 * Math.PI * 1.6, rad = 13 * e * (1 - i / 34); caracol.push([ex + X(Math.sin(d) * rad), ey + 13 * e - Math.cos(d) * rad]); }
      S(junta(ramo, caracol), 2.6, R.titulo + .55, 1.3);
      /* folhinhas ao longo do ramo */
      for (const f of [.3, .55]) {
        const q = ramo[Math.round(f * (ramo.length - 1))], a = s < 0 ? Math.PI + .9 : -.9;
        S(bez(q, [q[0] + Math.cos(a) * 16 * e, q[1] + Math.sin(a) * 16 * e - 8 * e], [q[0] + Math.cos(a) * 24 * e, q[1] + Math.sin(a) * 6 * e], [q[0] + Math.cos(a) * 30 * e, q[1] + Math.sin(a) * 30 * e], 12), 1.6, R.titulo + .9 + f, .5);
      }
    }
    /* filete com losango embaixo do nome */
    const yb = r.bottom + 6 * e, lb = Math.min(r.width * .42, W * .36);
    S(bez([cx - lb, yb], [cx - lb * .6, yb - 5 * e], [cx - lb * .3, yb + 5 * e], [cx - 12 * e, yb], 20), 1.5, R.titulo + 1, 1);
    S(bez([cx + lb, yb], [cx + lb * .6, yb - 5 * e], [cx + lb * .3, yb + 5 * e], [cx + 12 * e, yb], 20), 1.5, R.titulo + 1, 1);
    S([[cx, yb - 7 * e], [cx + 7 * e, yb], [cx, yb + 7 * e], [cx - 7 * e, yb], [cx, yb - 7 * e]], 1.5, R.titulo + 1.6, .5, { aberto: true, trem: .4 });
    return L;
  }

  function medir() {
    D = Math.min(window.devicePixelRatio || 1, 1.5); W = innerWidth; H = innerHeight;
    tela.width = Math.round(W * D); tela.height = Math.round(H * D);
    papel = fazerPapel();
    const cx = W / 2, cy = H * .42, bw = Math.min(W * (W < 700 ? .8 : .5), 620), esc = Math.max(.65, Math.min(1.2, bw / 560));
    gavinhas = gerarGavinhas(cx, cy, esc);
    livro = gerarLivro(cx, cy, bw);
    respingos = Array.from({ length: 14 }, () => ({ a: Math.random() * 6.28, d: (30 + Math.random() * 70) * esc, r: (1 + Math.random() * 3.4) * esc }));
    mapa = gerarMapa();
    const n = (dados && dados.areas || []).length, estreito = W < 700;
    ancoras = Array.from({ length: n }, (_, j) => {
      const g = mapa && mapa.regs[j + 1];
      if (g) return { x: g.centro[0], y: g.centro[1] };
      const f = n > 1 ? j / (n - 1) : .5;
      return { x: W * (estreito ? .5 + (j % 2 ? .2 : -.2) : .14 + .72 * f), y: H * (estreito ? .16 + .46 * f : .3 + .2 * f + (j % 2 ? -.07 : .07)) };
    });
    /* com espaço dos lados, os nomes vão para fora do mapa, ligados por um fio de tinta (como a legenda de um atlas antigo) */
    const cx2 = mapa && mapa.caixa, lados = cx2 && (cx2.x0 > 190 && W - cx2.x1 > 190);
    ancoras.forEach((A, j) => {
      A.lado = lados ? (j % 2 ? 'd' : 'e') : '';
      A.rx = lados ? (A.lado === 'e' ? cx2.x0 - 26 : cx2.x1 + 26) : A.x; A.ry = A.y;
      A.fio = lados ? { p: bez([A.x + (A.lado === 'e' ? -8 : 8), A.y], [A.x + (A.lado === 'e' ? -40 : 40), A.y - 14], [A.rx + (A.lado === 'e' ? 50 : -50), A.y + 10], [A.rx + (A.lado === 'e' ? 6 : -6), A.y], 24), w: 1.2, sd: j * 3.1, aberto: true, trem: .5 } : null;
      const r = rotulos[j]; if (r) { r.classList.toggle('e', A.lado === 'e'); r.classList.toggle('d', A.lado === 'd'); }
    });
    if (orn) orn = gerarOrnamento();
  }

  function preparar() {
    calmo = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const areas = (dados && dados.areas) || [];
    mapaEl.textContent = '';
    rotulos = areas.map((a, j) => {
      const r = document.createElement('div');
      r.className = 'ab-rotulo';
      r.style.setProperty('--i', j);
      const n = document.createElement('span'); n.className = 'ab-rn'; n.textContent = romanoCurto(j + 2);
      const m = document.createElement('span'); m.className = 'ab-rm'; m.textContent = a.materia || '';
      r.append(n, m);
      mapaEl.append(r);
      return r;
    });
    orn = null;
    medir();
    poeira = Array.from({ length: Math.round(Math.min(120, W * H / 9000)) }, () => ({ x: Math.random() * W, y: Math.random() * H, v: 3 + Math.random() * 9, s: .6 + Math.random() * 1.6, f: Math.random() * 6, a: .12 + Math.random() * .4 }));
    folhas = gerarFolhas();
    feitos = {};
    falasEl.textContent = '';
    tituloEl.classList.remove('on');
    nomeEl.removeAttribute('style');
    const nome = (dados && dados.site && dados.site.nome) || 'Portfólio';
    nomeEl.textContent = '';
    [...nome].forEach((ch, i) => { const s = document.createElement('span'); s.textContent = ch === ' ' ? ' ' : ch; s.style.setProperty('--i', i); nomeEl.append(s); });
    document.getElementById('abSub').textContent = (dados && dados.site && dados.site.subtitulo) || '';
  }

  function fala(i) {
    const txt = ((dados && dados.abertura && dados.abertura.falas) || [])[i];
    if (!txt) return;
    const p = document.createElement('p');
    p.className = 'ab-fala';
    p.textContent = txt;
    falasEl.append(p);
    requestAnimationFrame(() => requestAnimationFrame(() => p.classList.add('on')));
    setTimeout(() => { p.classList.add('sai'); setTimeout(() => p.remove(), 900); }, DURA[i] * 1000);
  }

  /* uma página em voo: folha de bordas curvas que bate como asa (o bater encolhe só a largura dos pontos) */
  function pagina(x, y, w, h, ang, bate, a) {
    const k = Math.max(.08, Math.abs(bate)), X = v => v * k, cv = h * .12;
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
    ctx.beginPath();
    ctx.moveTo(0, -h / 2); ctx.quadraticCurveTo(X(w * .5), -h / 2 - cv, X(w), -h / 2 + cv * .4);
    ctx.quadraticCurveTo(X(w + cv * .5), 0, X(w * .96), h / 2); ctx.quadraticCurveTo(X(w * .5), h / 2 - cv, 0, h / 2);
    ctx.quadraticCurveTo(X(-cv * .15), 0, 0, -h / 2);
    ctx.globalAlpha = a * .1; ctx.fillStyle = COR; ctx.fill();
    ctx.globalAlpha = a * .9; ctx.strokeStyle = COR; ctx.lineWidth = 1.5; ctx.lineJoin = 'round'; ctx.stroke();
    ctx.globalAlpha = a * .35; ctx.lineWidth = 1;
    ctx.beginPath();
    for (let r = 1; r <= 3; r++) { const yy = -h / 2 + r * h / 4.2; ctx.moveTo(X(w * .15), yy); ctx.quadraticCurveTo(X(w * .45), yy - 2, X(w * .78), yy + 1); }
    ctx.stroke();
    ctx.restore();
  }

  function quadro(agora) {
    if (!rodando) return;
    t = (agora - t0) / 1000;
    const dt = Math.min(.05, (agora - ult) / 1000 || 0);
    ult = agora;
    ferv = Math.floor(t * 8);
    const cx = W / 2, cy = H * .42;
    const vez = (k, quando, fn) => { if (!feitos[k] && t >= quando) { feitos[k] = 1; fn(); } };
    vez('f1', R.fala1, () => fala(0));
    vez('f2', R.fala2, () => fala(1));
    vez('f3', R.fala3, () => fala(2));
    vez('rot', R.rotulos, () => mapaEl.classList.add('on'));
    vez('tit', R.titulo, () => { tituloEl.classList.add('on'); mapaEl.classList.add('apaga'); orn = gerarOrnamento(); });
    vez('sai', R.sai, () => encerrar(false));

    ctx.setTransform(D, 0, 0, D, 0, 0);
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    ctx.drawImage(papel, 0, 0, W, H);
    /* câmera: aproxima devagar durante toda a abertura */
    const zoom = calmo ? 1 : 1 + .045 * Math.min(1, t / R.sai);
    ctx.translate(cx, cy); ctx.scale(zoom, zoom); ctx.translate(-cx, -cy);

    /* poeira de cinza */
    const ap = fase(0, 1.6);
    ctx.fillStyle = COR;
    for (const p of poeira) {
      p.y -= p.v * dt; p.x += Math.sin(t * .6 + p.f) * 6 * dt;
      if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
      ctx.globalAlpha = p.a * ap * (.6 + .4 * Math.sin(t * 1.7 + p.f));
      ctx.beginPath(); ctx.arc(p.x, p.y, p.s * .6, 0, 6.283); ctx.fill();
    }

    /* a gota cai, bate e vira uma mancha com respingos */
    const someLivro = 1 - fase(R.abre + .2, R.abre + 1.3);
    if (!calmo && t < R.gota) {
      const u = t / R.gota, y = -30 + (cy + 30) * u * u;
      ctx.globalAlpha = .95; ctx.fillStyle = COR;
      ctx.beginPath(); ctx.moveTo(cx, y - 22); ctx.quadraticCurveTo(cx + 8, y - 2, cx, y + 6); ctx.quadraticCurveTo(cx - 8, y - 2, cx, y - 22); ctx.fill();
    } else if (t >= R.gota) {
      const u = Math.min(1, (t - R.gota) / .3), cresce = 1 - Math.pow(1 - u, 3), esmaece = 1 - fase(R.livro + .5, R.livro + 2.2);
      if (esmaece > 0) {
        const r = (10 + 24 * cresce) * Math.max(.7, Math.min(1.2, livro.bw / 560));
        ctx.fillStyle = COR; ctx.globalAlpha = .92 * esmaece;
        ctx.beginPath();
        for (let i = 0; i <= 44; i++) { const a = i / 44 * 6.283, rr = r * (1 + .2 * Math.sin(a * 5 + 1.3) + .08 * Math.sin(a * 11 + ferv * .9)); const px = cx + Math.cos(a) * rr, py = cy + Math.sin(a) * rr * .6; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
        ctx.fill();
        for (const s of respingos) { const d = s.d * cresce; ctx.beginPath(); ctx.ellipse(cx + Math.cos(s.a) * d, cy + Math.sin(s.a) * d * .6, s.r, s.r * .75, s.a, 0, 6.283); ctx.fill(); }
      }
      /* anel que se espalha na batida */
      const o = (t - R.gota) / 1.4;
      if (o < 1 && !calmo) {
        ctx.globalAlpha = (1 - o) * .5; ctx.strokeStyle = COR; ctx.lineWidth = 1.4 + 2 * (1 - o);
        ctx.beginPath(); ctx.ellipse(cx, cy, 30 + o * Math.min(W, 900) * .32, (30 + o * Math.min(W, 900) * .32) * .55, 0, 0, 6.283); ctx.stroke();
      }
    }
    ctx.globalCompositeOperation = 'lighter';
    luz(cx, cy, 120 + 120 * fase(R.livro, R.abre), .28 * fase(R.gota, R.gota + .6) * someLivro);
    ctx.globalCompositeOperation = 'source-over';

    /* gavinhas e livro */
    if (someLivro > 0) {
      const someGav = 1 - fase(R.livro + .9, R.livro + 2);
      if (someGav > 0) for (const g of gavinhas) { const [p, a] = pr(g.ini, g.dur); traco(g, p, a * someLivro * someGav * .9); }
      for (const s of livro.tracos) { const [p, a] = pr(s.ini, s.dur); traco(s, p, a * someLivro); }
    }

    /* as páginas se soltam e voam até as matérias */
    if (!calmo && t >= R.abre) {
      const { bw, bh } = livro;
      for (const f of folhas) {
        const u = (t - f.ini) / 1.9;
        if (u < 0 || u > 1) continue;
        const A = ancoras.length ? ancoras[f.alvo % ancoras.length] : { x: cx + (f.alvo % 2 ? 1 : -1) * W * .3, y: cy - H * .2 };
        if (u < .22) {
          /* vira em torno da lombada */
          const v = u / .22, fi = v * Math.PI * .62, w = bw * .5 * Math.cos(fi), lev = Math.sin(fi) * bh * .22;
          ctx.globalAlpha = .85; ctx.strokeStyle = COR; ctx.lineWidth = 1.6; ctx.fillStyle = 'rgba(232,224,207,.08)';
          ctx.beginPath(); ctx.moveTo(cx, cy - bh * .4);
          ctx.quadraticCurveTo(cx + w * .5, cy - bh * .5 - lev * 1.4, cx + w, cy - bh * .47 - lev);
          ctx.quadraticCurveTo(cx + w * 1.02, cy, cx + w * .98, cy + bh * .44 - lev);
          ctx.quadraticCurveTo(cx + w * .5, cy + bh * .5 - lev * .6, cx, cy + bh * .52); ctx.closePath(); ctx.fill(); ctx.stroke();
        } else {
          const v = suave((u - .22) / .78), sx = cx + bw * .12, sy = cy - bh * .3;
          const qx = (sx + A.x) / 2 + f.curva, qy = Math.min(sy, A.y) - 120 - Math.abs(f.curva) * .4;
          const x = (1 - v) * (1 - v) * sx + 2 * (1 - v) * v * qx + v * v * A.x, y = (1 - v) * (1 - v) * sy + 2 * (1 - v) * v * qy + v * v * A.y;
          const tam = (1 - v * .7) * f.tam, bate = Math.sin(t * 13 + f.sd) * .8 + .2, al = 1 - suave((v - .7) / .3);
          pagina(x, y, bw * .2 * tam, bh * .62 * tam, f.giro * (1 - v) + Math.sin(t * 3 + f.sd) * .25, bate, al);
        }
      }
      ctx.globalCompositeOperation = 'lighter'; luz(cx, cy, Math.max(W, H) * .45, .22 * (1 - lin(R.abre, R.abre + 1.2)) * (t < R.abre + 1.2 ? 1 : 0)); ctx.globalCompositeOperation = 'source-over';
    }

    /* o mapa do mundo se desenha, região por região */
    const dimMapa = 1 - fase(R.titulo, R.titulo + 1.2) * .82;
    if (mapa) {
      mapa.regs.forEach(g => {
        const [p, a] = pr(g.ini, 1.1);
        if (a <= 0) return;
        for (const k of g.salas) {
          const s = mapa.salas[k];
          if (!s) continue;
          ctx.globalAlpha = .07 * p * dimMapa; ctx.fillStyle = COR;
          if (p > .98) { ctx.beginPath(); s.p.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.fill(); }
          traco(s, p, a * .9 * dimMapa);
        }
      });
      /* o caminho, em tracinhos, e a luz do viajante que o percorre */
      const [pr2] = pr(R.rota, 1.8), P = mapa.rota.p;
      if (pr2 > 0 && P.length > 1) {
        if (!mapa.rota.L) { mapa.rota.L = [0]; for (let i = 1; i < P.length; i++) mapa.rota.L.push(mapa.rota.L[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1])); }
        const Lr = mapa.rota.L, tot = Lr[Lr.length - 1], ate = tot * pr2;
        const em = s => { let i = 1; while (i < Lr.length - 1 && Lr[i] < s) i++; const f = (s - Lr[i - 1]) / Math.max(1e-6, Lr[i] - Lr[i - 1]); return [P[i - 1][0] + (P[i][0] - P[i - 1][0]) * Math.min(1, f), P[i - 1][1] + (P[i][1] - P[i - 1][1]) * Math.min(1, f)]; };
        ctx.globalAlpha = .75 * dimMapa; ctx.strokeStyle = OURO; ctx.lineWidth = 1.7; ctx.lineCap = 'round';
        ctx.beginPath();
        for (let s = 0; s < ate; s += 11) { const a = em(s), b = em(Math.min(ate, s + 5)); ctx.moveTo(a[0], a[1] + Math.sin(s * .3 + ferv) * .5); ctx.lineTo(b[0], b[1]); }
        ctx.stroke();
        const [hx, hy] = em(ate);
        ctx.globalCompositeOperation = 'lighter';
        luz(hx, hy, 34, .8 * dimMapa); luz(hx, hy, 8, dimMapa);
        ctx.globalCompositeOperation = 'source-over';
      }
    }
    ancoras.forEach((A, j) => {
      const on = fase(R.rotulos + j * .12, R.rotulos + .8 + j * .12);
      if (on <= 0) return;
      ctx.globalCompositeOperation = 'lighter'; luz(A.x, A.y, 46, .35 * on * dimMapa); ctx.globalCompositeOperation = 'source-over';
      if (A.fio) traco(A.fio, pr(R.rotulos + j * .12, .7)[0], .6 * dimMapa, OURO);
      ctx.globalAlpha = on * dimMapa; ctx.fillStyle = '#05050a'; ctx.strokeStyle = OURO; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(A.x, A.y - 6); ctx.lineTo(A.x + 6, A.y); ctx.lineTo(A.x, A.y + 6); ctx.lineTo(A.x - 6, A.y); ctx.closePath(); ctx.fill(); ctx.stroke();
    });

    /* os rótulos acompanham a aproximação da câmera */
    if (t >= R.rotulos - .1) ancoras.forEach((A, j) => { if (rotulos[j]) { rotulos[j].style.left = (cx + (A.rx - cx) * zoom).toFixed(1) + 'px'; rotulos[j].style.top = (cy + (A.ry - cy) * zoom).toFixed(1) + 'px'; } });
    /* floreios do título (fora da câmera: ficam presos ao nome) */
    ctx.setTransform(D, 0, 0, D, 0, 0);
    if (orn) for (const s of orn) { const [p, a] = pr(s.ini, s.dur); traco(s, p, a); }
    const tt = fase(R.titulo, R.titulo + 1.6);
    if (tt > 0) { ctx.globalCompositeOperation = 'lighter'; luz(W / 2, H * .46, Math.max(W, H) * .42, .16 * tt); }

    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    raf = requestAnimationFrame(quadro);
  }

  function travar(e) {
    if (!rodando) return;
    if (e.type === 'keydown') {
      if (!['Escape', 'Enter', ' ', 'Spacebar', 'ArrowDown', 'PageDown'].includes(e.key)) return;
      e.preventDefault();
    }
    e.stopPropagation();
    encerrar(false);
  }

  function tocar(forcado) {
    if (rodando) return;
    if (!dados) dados = window.CONTEUDO && window.CONTEUDO.dados;
    if (forcado) window.scrollTo({ top: 0, behavior: 'instant' });
    raiz.classList.add('com-abertura', 'abertura-cobrindo');
    ov.classList.remove('saindo', 'pousando', 'fora');
    mapaEl.classList.remove('on', 'apaga');
    preparar();
    rodando = true;
    t = 0; t0 = ult = performance.now();
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(quadro);
    document.getElementById('abPular').focus({ preventScroll: true });
  }

  function encerrar(imediato) {
    const naturalmente = rodando && t >= R.sai - .05;
    rodando = false;
    raiz.classList.remove('abertura-cobrindo');
    try { sessionStorage.setItem(CHAVE, '1'); } catch (e) { /* sem armazenamento: tudo bem */ }
    const acabar = () => {
      cancelAnimationFrame(raf);
      ov.classList.add('fora');
      ov.classList.remove('saindo', 'pousando');
      raiz.classList.remove('com-abertura', 'abertura-pousando');
      falasEl.textContent = '';
      const alvo = document.activeElement;
      if (!alvo || alvo === document.body || ov.contains(alvo)) { const m = document.getElementById('conteudo'); if (m) m.focus({ preventScroll: true }); }
    };
    if (imediato) { acabar(); return; }
    /* fim natural: o título pousa exatamente sobre o título do site enquanto o escuro se desfaz */
    const h1 = document.querySelector('.hero h1');
    if (naturalmente && h1 && scrollY < 40) {
      const a = nomeEl.getBoundingClientRect(), b = h1.getBoundingClientRect();
      ov.classList.add('pousando');
      raiz.classList.add('abertura-pousando');
      nomeEl.style.transformOrigin = '0 0';
      nomeEl.style.transition = 'transform 1.25s cubic-bezier(.65,0,.25,1)';
      requestAnimationFrame(() => { nomeEl.style.transform = `translate(${b.left - a.left}px,${b.top - a.top}px) scale(${b.width / a.width})`; });
      cancelAnimationFrame(raf);
      setTimeout(acabar, 1350);
      return;
    }
    ov.classList.add('saindo');
    setTimeout(acabar, 1150);
  }

  document.getElementById('abPular').addEventListener('click', e => { e.stopPropagation(); encerrar(false); });
  ov.addEventListener('click', () => { if (rodando) encerrar(false); });
  addEventListener('keydown', travar, true);
  addEventListener('wheel', travar, { capture: true, passive: true });
  addEventListener('touchmove', travar, { capture: true, passive: true });
  addEventListener('resize', () => { if (rodando) medir(); });

  window.ABERTURA = { tocar };

  const C = window.CONTEUDO;
  (C ? C.pronto : Promise.resolve(null)).then(d => {
    dados = d;
    if (!raiz.classList.contains('com-abertura')) { ov.classList.add('fora'); return; }
    const modo = (d && d.abertura && d.abertura.mostrar) || 'sempre';
    let vista = false;
    try { vista = !!sessionStorage.getItem(CHAVE); } catch (e) { /* ignora */ }
    const forcado = /[?&]abertura\b/.test(location.search);
    if (!d || (!forcado && (modo === 'nunca' || (modo === 'uma_vez_por_sessao' && vista)))) { encerrar(true); return; }
    /* espera as fontes do dono (no máximo 1,5 s) e a primeira pintura do motor (no máximo 2,5 s) */
    const ate = ms => new Promise(r => setTimeout(r, ms));
    const motor = new Promise(r => { if (raiz.classList.contains('motor-pronto')) r(); else addEventListener('motor-pronto', r, { once: true }); });
    Promise.all([Promise.race([C.fontesProntas || Promise.resolve(), ate(1500)]), Promise.race([motor, ate(2500)])]).then(() => { if (!rodando && raiz.classList.contains('com-abertura')) tocar(false); });
  });
})();
