# Velumbra

Conceito de site com identidade visual forte: uma descida por oito regiões de um reino subterrâneo desenhado à mão.
Cada seção é uma região, com paleta, clima e iluminação próprios.

- **Passeio**: o site rola normalmente e Lume, a mariposa da lanterna, joga sozinha.
- **Jogar**: plataforma completa, com teclado ou toque.
- Trilha sonora original gerada por código, com player (tocar, pausar, avançar, voltar, volume, lista).
- **Oficina**: troca fontes, sprites, fundos, sons e músicas pelo navegador.
- **Pasta `recursos/`**: coloque arquivos com os nomes certos e eles carregam sozinhos. Lista completa em [`recursos/LEIA-ME.md`](recursos/LEIA-ME.md).

## Rodar

```bash
python -m http.server 8000
```

Abra http://localhost:8000.

## Estrutura

| Caminho | Conteúdo |
|---|---|
| `index.html` | marcação da página |
| `css/estilo.css` | estilos |
| `js/01-base.js` | utilitários e kit de pintura (formas, folhagem, cristais, luz) |
| `js/02-regioes.js` | as oito regiões (fundo, meio, frente) e os detalhes extras |
| `js/03-cenario.js` | sujeira/tinta, renderização das seções, painel, partículas, criaturas |
| `js/04-jogo.js` | chão, fendas, plataformas, modo Passeio, modo Jogar, combate |
| `js/05-audio.js` | trilha gerada, efeitos sonoros, motor do player |
| `js/06-loop.js` | laço de animação e parallax |
| `js/07-interface.js` | player, modos, controles, Oficina, Guia |
| `js/08-pasta-recursos.js` | carregamento automático da pasta `recursos/` |
| `js/09-inicio.js` | inicialização |
| `recursos/` | seus arquivos (fontes, sprites, fundos, sons, músicas) |

Os scripts são clássicos (não módulos) e compartilham o escopo global, na ordem numérica.
