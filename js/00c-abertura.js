/* ---------- abertura de cinema ----------
   Versão de testes. Roteiro: um ponto de luz no escuro vira a lombada de um livro (o Atlas);
   o livro se parte em páginas (clarão e onda de choque); as páginas se juntam nas matérias e desenham
   o mapa; o título aparece e pousa no lugar do título do site.
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
  const R = { fala1: 1.2, fenda: 1.3, fala2: 4.7, racha: 5.25, fala3: 7.7, junta: 7.9, rota: 8.5, rotulos: 8.7, titulo: 10.7, sai: 13.7 };
  const DURA = [2.7, 2.3, 2.6];
  const COR = '#e8e0cf';

  let rodando = false, raf = 0, t0 = 0, ult = 0, W = 0, H = 0, D = 1, calmo = false, dados = null, t = 0;
  let poeira = [], cacos = [], ancoras = [], rotulos = [], feitos = {}, flash = 0, tremor = 0, onda = -1;

  const brilho = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,246,225,1)'); g.addColorStop(.2, 'rgba(255,232,190,.6)'); g.addColorStop(.5, 'rgba(255,220,170,.14)'); g.addColorStop(1, 'rgba(255,220,170,0)');
    x.fillStyle = g; x.fillRect(0, 0, 64, 64); return c;
  })();
  function luz(x, y, r, a) { if (a <= .01 || r <= 0) return; ctx.globalAlpha = Math.min(1, a); ctx.drawImage(brilho, x - r, y - r, r * 2, r * 2); }
  const suave = v => v <= 0 ? 0 : v >= 1 ? 1 : v * v * (3 - 2 * v);
  const fase = (a, b) => suave((t - a) / (b - a));
  const romanoCurto = n => ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV'][n] || String(n);

  function medir() {
    D = Math.min(window.devicePixelRatio || 1, 1.5); W = innerWidth; H = innerHeight;
    tela.width = Math.round(W * D); tela.height = Math.round(H * D);
    const n = ancoras.length, estreito = W < 700;
    ancoras.forEach((a, j) => {
      const f = n > 1 ? j / (n - 1) : .5;
      a.x = W * (estreito ? .5 + (j % 2 ? .2 : -.2) : .14 + .72 * f);
      a.y = H * (estreito ? .16 + .46 * f : .3 + .2 * f + (j % 2 ? -.07 : .07));
      if (rotulos[j]) { rotulos[j].style.left = a.x + 'px'; rotulos[j].style.top = a.y + 'px'; }
    });
  }

  function preparar() {
    calmo = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const areas = (dados && dados.areas) || [];
    ancoras = areas.map(() => ({ x: 0, y: 0 }));
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
    medir();
    poeira = Array.from({ length: Math.round(Math.min(150, W * H / 8000)) }, () => ({ x: Math.random() * W, y: Math.random() * H, v: 4 + Math.random() * 12, s: .6 + Math.random() * 1.8, f: Math.random() * 6, a: .15 + Math.random() * .45 }));
    cacos = []; feitos = {}; flash = 0; tremor = 0; onda = -1;
    falasEl.textContent = '';
    tituloEl.classList.remove('on');
    nomeEl.removeAttribute('style');
    const nome = (dados && dados.site && dados.site.nome) || 'Portfólio';
    nomeEl.textContent = '';
    [...nome].forEach((ch, i) => { const s = document.createElement('span'); s.textContent = ch === ' ' ? ' ' : ch; s.style.setProperty('--i', i); nomeEl.append(s); });
    const b = document.createElement('span'); b.className = 'ab-brilho'; b.setAttribute('aria-hidden', 'true'); nomeEl.append(b);
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

  /* páginas rasgadas: polígonos irregulares, alguns grandes, quase todos pequenos */
  function partir(cx, cy, larg) {
    const n = Math.round(Math.min(64, 30 + W / 34));
    for (let k = 0; k < n; k++) {
      const grande = k < 9, x = cx + (Math.random() - .5) * larg, y = cy + (Math.random() - .5) * 10;
      const ang = Math.atan2(y - cy + (Math.random() - .5) * 60, x - cx) + (Math.random() - .5) * 1.1;
      const v = (grande ? 90 : 160) + Math.random() * (grande ? 260 : 560);
      const tam = grande ? 16 + Math.random() * 14 : 4 + Math.random() * 10, lados = 3 + (Math.random() * 3 | 0);
      const pts = Array.from({ length: lados }, (_, q) => { const a = q / lados * Math.PI * 2 + (Math.random() - .5) * .9, r = tam * (.55 + Math.random() * .6); return [Math.cos(a) * r, Math.sin(a) * r * .8]; });
      cacos.push({ x, y, vx: Math.cos(ang) * v, vy: Math.sin(ang) * v - 50, r: Math.random() * 6.3, vr: (Math.random() - .5) * (grande ? 2.4 : 6), pts, tam, alvo: k % Math.max(1, ancoras.length), anel: Math.random() * 6.3, raio: 6 + Math.random() * 24, tom: Math.random() });
    }
    flash = calmo ? .2 : .75; tremor = calmo ? 0 : .55; onda = 0;
  }

  function quadro(agora) {
    if (!rodando) return;
    t = (agora - t0) / 1000;
    const dt = Math.min(.05, (agora - ult) / 1000 || 0);
    ult = agora;
    const cx = W / 2, cy = H * .42;
    const vez = (k, quando, fn) => { if (!feitos[k] && t >= quando) { feitos[k] = 1; fn(); } };
    vez('f1', R.fala1, () => fala(0));
    vez('f2', R.fala2, () => fala(1));
    vez('racha', R.racha, () => partir(cx, cy, Math.min(W * .42, 560)));
    vez('f3', R.fala3, () => fala(2));
    vez('rot', R.rotulos, () => mapaEl.classList.add('on'));
    vez('tit', R.titulo, () => { tituloEl.classList.add('on'); mapaEl.classList.add('apaga'); });
    vez('sai', R.sai, () => encerrar(false));

    ctx.setTransform(D, 0, 0, D, 0, 0);
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    ctx.fillStyle = '#030407'; ctx.fillRect(0, 0, W, H);
    /* câmera: aproxima devagar durante toda a abertura e treme na quebra */
    const zoom = calmo ? 1 : 1 + .05 * Math.min(1, t / R.sai);
    ctx.translate(cx, cy); ctx.scale(zoom, zoom); ctx.translate(-cx, -cy);
    tremor = Math.max(0, tremor - dt);
    if (tremor > 0) ctx.translate((Math.random() - .5) * 16 * tremor, (Math.random() - .5) * 16 * tremor);
    ctx.globalCompositeOperation = 'lighter';

    /* poeira */
    const ap = fase(0, 1.6);
    for (const p of poeira) {
      p.y -= p.v * dt; p.x += Math.sin(t * .6 + p.f) * 6 * dt;
      if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
      ctx.globalAlpha = p.a * ap * (.6 + .4 * Math.sin(t * 1.7 + p.f));
      ctx.fillStyle = COR; ctx.fillRect(p.x, p.y, p.s, p.s);
    }

    /* o ponto de luz vira a lombada do livro, até rachar */
    if (t < R.racha + .1) {
      const resp = 1 + Math.sin(t * 2.4) * .08, abre = fase(R.fenda, R.racha - .5), larg = Math.min(W * .42, 560) * abre, a0 = fase(.2, 1.2);
      luz(cx, cy, (70 + 140 * abre) * resp, .5 * a0);
      luz(cx, cy, 16 * resp, a0);
      if (larg > 2) {
        const g = ctx.createLinearGradient(cx - larg / 2, 0, cx + larg / 2, 0);
        g.addColorStop(0, 'rgba(255,236,200,0)'); g.addColorStop(.5, 'rgba(255,244,222,.95)'); g.addColorStop(1, 'rgba(255,236,200,0)');
        ctx.globalAlpha = a0; ctx.fillStyle = g; ctx.fillRect(cx - larg / 2, cy - 1.2, larg, 2.4);
        for (let k = 1; k <= 6; k++) {
          ctx.globalAlpha = a0 * .18 * (1 - k / 8) * abre;
          const l2 = larg * (1 - k * .055);
          ctx.fillRect(cx - l2 / 2, cy - k * 3.4, l2, 1); ctx.fillRect(cx - l2 / 2, cy + k * 3.4, l2, 1);
        }
        const tens = fase(R.racha - 1, R.racha);
        if (tens > 0 && !calmo) for (let k = 0; k < 8; k++) { ctx.globalAlpha = tens * .55; ctx.fillRect(cx + (Math.random() - .5) * larg, cy - 14 * Math.random(), 1, 28 * Math.random()); }
      }
    }

    /* onda de choque da quebra */
    if (onda >= 0) {
      onda += dt;
      const p = Math.min(1, onda / 1.3), raio = Math.max(W, H) * .75 * (1 - Math.pow(1 - p, 3));
      if (p < 1) {
        ctx.globalAlpha = (1 - p) * .55; ctx.strokeStyle = '#fff1d6'; ctx.lineWidth = 2 + 10 * (1 - p);
        ctx.beginPath(); ctx.ellipse(cx, cy, raio, raio * .62, 0, 0, Math.PI * 2); ctx.stroke();
        luz(cx, cy, 260 * (1 - p) + 40, .9 * (1 - p));
      }
    }

    /* páginas: voam, desaceleram e depois se juntam nas matérias */
    const juntar = fase(R.junta, R.junta + 2), apaga = 1 - fase(R.titulo, R.titulo + 1.2) * .85;
    for (const c of cacos) {
      const A = ancoras[c.alvo];
      if (juntar > 0 && A) {
        const enc = 1 - juntar * .7, tx = A.x + Math.cos(c.anel + t * .8) * c.raio * enc, ty = A.y + Math.sin(c.anel + t * .8) * c.raio * .55 * enc;
        c.vx += (tx - c.x) * 9 * juntar * dt; c.vy += (ty - c.y) * 9 * juntar * dt;
        c.vx *= Math.pow(.02, dt); c.vy *= Math.pow(.02, dt);
      } else { c.vx *= Math.pow(.3, dt); c.vy *= Math.pow(.3, dt); }
      c.x += c.vx * dt; c.y += c.vy * dt; c.r += c.vr * dt * (1 - juntar * .8);
      const esc = 1 - juntar * .6;
      ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(c.r); ctx.scale(esc, esc);
      ctx.globalAlpha = .82 * apaga;
      ctx.fillStyle = c.tom < .35 ? '#ffe0a6' : c.tom < .7 ? '#f6efe0' : '#fff8ec';
      ctx.beginPath(); c.pts.forEach(([x, y], q) => q ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); ctx.fill();
      ctx.restore();
      luz(c.x, c.y, (14 + c.tam * 1.4) * esc, .2 * apaga);
    }

    /* o caminho entre as matérias (o mapa) */
    const rota = fase(R.rota, R.rota + 1.9), some = 1 - fase(R.titulo, R.titulo + 1.2) * .8;
    if (rota > 0 && ancoras.length > 1) {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = 'rgba(232,224,207,.55)'; ctx.lineWidth = 1.2; ctx.setLineDash([2, 7]);
      ctx.globalAlpha = some;
      ctx.beginPath();
      const segs = ancoras.length - 1, ate = rota * segs;
      ctx.moveTo(ancoras[0].x, ancoras[0].y);
      for (let j = 1; j <= segs; j++) {
        const a = ancoras[j - 1], b = ancoras[j], f = Math.max(0, Math.min(1, ate - (j - 1)));
        if (f <= 0) break;
        const mx = (a.x + b.x) / 2, my = Math.min(a.y, b.y) - 40;
        const x1 = a.x + (mx - a.x) * f, y1 = a.y + (my - a.y) * f, x2 = mx + (b.x - mx) * f, y2 = my + (b.y - my) * f;
        ctx.quadraticCurveTo(x1, y1, x1 + (x2 - x1) * f, y1 + (y2 - y1) * f);
      }
      ctx.stroke(); ctx.setLineDash([]);
      ctx.globalCompositeOperation = 'lighter';
    }
    ancoras.forEach((a, j) => {
      const on = fase(R.junta + 1 + j * .18, R.junta + 2 + j * .18);
      luz(a.x, a.y, 64, .5 * on * some); luz(a.x, a.y, 10, on * some);
    });

    /* clarão da quebra (radial, a partir da fenda) */
    if (flash > 0) {
      ctx.globalCompositeOperation = 'lighter';
      luz(cx, cy, Math.max(W, H) * (1.1 - flash * .3), flash);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = flash * flash * .35; ctx.fillStyle = '#fff6e6'; ctx.fillRect(-40, -40, W + 80, H + 80);
      flash = Math.max(0, flash - dt * 2.2);
    }

    /* luz atrás do título */
    const tt = fase(R.titulo, R.titulo + 1.6);
    if (tt > 0) { ctx.globalCompositeOperation = 'lighter'; luz(W / 2, H * .46, Math.max(W, H) * .5, .2 * tt); }

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
      const br = nomeEl.querySelector('.ab-brilho'); if (br) br.remove();
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
