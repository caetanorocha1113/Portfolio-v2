/* ---------- tinta: o traço desenhado à mão, usado pela abertura (js/00c-abertura.js) e pelo HUD (js/03b-hud.js) ----------
   Um traço é uma fita de largura variável, fina nas pontas, desenhada até "prog" do comprimento.
   As linhas "fervem" (tremem algumas vezes por segundo), como num desenho feito à mão quadro a quadro.
   Global exposto: TINTA. */
(function () {
  'use strict';
  const rnd = s => { const x = Math.sin(s * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
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
  /* arredonda cantos (Chaikin) */
  function chaikin(P, fechado) {
    const o = [], n = P.length;
    for (let i = 0; i < (fechado ? n : n - 1); i++) {
      const a = P[i], b = P[(i + 1) % n];
      o.push([a[0] * .75 + b[0] * .25, a[1] * .75 + b[1] * .25], [a[0] * .25 + b[0] * .75, a[1] * .25 + b[1] * .75]);
    }
    if (fechado) o.push(o[0]);
    return o;
  }
  /* círculo (ou arco) em pontos */
  function arco(cx, cy, r, a0, a1, n) { const o = []; for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; o.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } return o; }
  /* T: { p: [[x,y]…], w: largura, sd: semente, aberto: sem afinar as pontas, trem: tremor (1 = padrão) }
     ferv: o "quadro" do desenho (muda algumas vezes por segundo); calmo: sem tremor (menos movimento) */
  function traco(ctx, T, prog, a, cor, ferv, calmo) {
    if (prog <= 0 || a <= .01) return;
    const P = T.p, n = P.length;
    if (n < 2) return;
    if (!T.L) { T.L = [0]; for (let i = 1; i < n; i++) T.L.push(T.L[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1])); }
    const tot = T.L[n - 1] || 1, ate = tot * Math.min(1, prog);
    let m = 1; while (m < n - 1 && T.L[m] < ate) m++;
    const f = Math.min(1, (ate - T.L[m - 1]) / Math.max(1e-6, T.L[m] - T.L[m - 1]));
    const pts = P.slice(0, m), us = T.L.slice(0, m).map(l => l / tot);
    pts.push([P[m - 1][0] + (P[m][0] - P[m - 1][0]) * f, P[m - 1][1] + (P[m][1] - P[m - 1][1]) * f]); us.push(ate / tot);
    const k = pts.length, esq = [], dir = [], amp = calmo ? 0 : (T.trem != null ? T.trem : 1), sd = T.sd || 0, fv = ferv || 0;
    const fA = rnd(sd + fv * 1.7) * 6.28, fB = rnd(sd * 1.3 + fv * 2.9) * 6.28;
    for (let i = 0; i < k; i++) {
      const [x, y] = pts[i], A = pts[Math.max(0, i - 1)], B = pts[Math.min(k - 1, i + 1)], u = us[i];
      let nx = -(B[1] - A[1]), ny = B[0] - A[0]; const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
      const ponta = T.aberto ? 1 : Math.pow(Math.sin(Math.PI * Math.min(.985, Math.max(.015, u))), .5);
      const cabeca = prog < 1 ? Math.min(1, .3 + (ate - u * tot) / 14) : 1;
      const ww = T.w * ponta * cabeca * (.82 + .3 * Math.sin(u * 13 + sd));
      const j = amp * (Math.sin(u * 9 + fA) * .65 + Math.sin(u * 23 + fB) * .35);
      esq.push([x + nx * (ww / 2 + j), y + ny * (ww / 2 + j)]); dir.push([x - nx * (ww / 2 - j), y - ny * (ww / 2 - j)]);
    }
    ctx.globalAlpha = Math.min(1, a); ctx.fillStyle = cor || T.cor || '#e8e0cf';
    ctx.beginPath(); ctx.moveTo(esq[0][0], esq[0][1]);
    for (let i = 1; i < k; i++) ctx.lineTo(esq[i][0], esq[i][1]);
    for (let i = k - 1; i >= 0; i--) ctx.lineTo(dir[i][0], dir[i][1]);
    ctx.closePath(); ctx.fill();
  }
  window.TINTA = { rnd, bez, junta, chaikin, arco, traco };
})();
