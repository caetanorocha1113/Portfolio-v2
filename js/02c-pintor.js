/* ---------- pintor: Web Worker que pinta os blocos do mundo e os fundos das salas ----------
   A pintura pesada (pedras, tinta, papel, névoa) acontece aqui, fora da página: o jogo continua
   rodando liso e só cola as imagens prontas (js/03-cenario.js). Recebe a mesma lista de regiões e a
   mesma semente e gera exatamente o mesmo mapa de js/00a-mundo.js.
   Mensagens: {tipo:'mundo'|'segredos'|'imagem'|'bloco'|'fundo'} → responde {tipo:'bloco'|'fundo'|'erro'}. */
self.window = self;
importScripts('01-base.js', '02-regioes.js', '00a-mundo.js', '02b-salas.js');
let M = null, VAR = [];
const FUNDOS_DONO = {};
const perto = (X, Y, S, m) => M.salas.filter(s => !salaFechada(s) && s.x - m < X + S && s.x + s.w + m > X && s.y - m < Y + S && s.y + s.h + m > Y);
onmessage = e => {
  const m = e.data;
  try {
    if (m.tipo === 'mundo') {
      M = MUNDO.gerar(m.regioes, m.semente);
      M.salas.forEach(s => { s.tema = m.regioes[s.regiao].tema; });
      VAR = m.regioes.map(g => +g.variante || 0);
      usarMapa(M);
      return;
    }
    /* segredos já abertos (guardados no navegador) e os que o jogador abre agora */
    if (m.tipo === 'segredos') { if (M) for (const id of m.abertos) abrirSegredoPintura(id); return; }
    if (m.tipo === 'imagem') { FUNDOS_DONO[m.regiao] = m.bmp ? { img: m.bmp, cfg: m.cfg || {} } : null; return; }
    if (!M) return;
    if (m.tipo === 'bloco') {
      const { bx, by, S, rs } = m, X = bx * S, Y = by * S, ss = perto(X, Y, S, 420);
      const cv = new OffscreenCanvas(Math.ceil(S * rs), Math.ceil(S * rs)), c = cv.getContext('2d');
      pintarBloco(c, X, Y, S, rs, ss, false);
      postFX(cv, c, rs, 'meio', bx * 73 + by * 131 + 999, ss[0] ? VAR[ss[0].regiao] : 0);
      const bmp = cv.transferToImageBitmap();
      postMessage({ tipo: 'bloco', chave: m.chave, rs, bmp }, [bmp]);
    } else if (m.tipo === 'fundo') {
      const s = M.salas[m.sala], out = { tipo: 'fundo', sala: m.sala, rs: m.rs }, transf = [];
      for (const camada of ['longe', 'perto']) {
        const d = m[camada], cv = new OffscreenCanvas(Math.ceil(d.bw * d.rb), Math.ceil(d.bh * d.rb)), c = cv.getContext('2d');
        if (camada === 'longe') { pintarFundoLonge(c, s, d.bw, d.bh, d.rb, FUNDOS_DONO[s.regiao]); postFX(cv, c, d.rb, 'back', s.id * 7 + 3, VAR[s.regiao]); }
        else pintarFundoPerto(c, s, d.bw, d.bh, d.rb);
        const bmp = cv.transferToImageBitmap();
        out[camada] = { bmp, bw: d.bw, bh: d.bh };
        transf.push(bmp);
      }
      postMessage(out, transf);
    }
  } catch (err) {
    postMessage({ tipo: 'erro', chave: m.chave, sala: m.sala, msg: String((err && err.message) || err) });
  }
};
