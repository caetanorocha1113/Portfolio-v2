# Atlas · Portfólio de Caetano Rocha de Oliveira

Portfólio escolar apresentado como uma jornada por um mapa. Cada área do mapa é uma matéria, com as atividades, os projetos e os trabalhos dela.

- **Passeio**: o portfólio se lê rolando a página. Ao fundo, atrás do texto, o personagem atravessa as áreas sozinho e a música toca como uma playlist.
- **Jogo**: plataforma com teclado ou toque, pelo mesmo mapa. A história, os Guardiões de cada área e a trilha da jornada estão em construção.
- **Conteúdo**: tudo o que se lê vem de [`conteudo/portfolio.json`](conteudo/portfolio.json). Mudar o arquivo muda o site. Veja [`conteudo/LEIA-ME.md`](conteudo/LEIA-ME.md).
- **Pasta `recursos/`**: personagem, inimigos, fontes, fundos, sons e músicas do jogo. Coloque arquivos com os nomes certos e eles carregam sozinhos. Lista completa em [`recursos/LEIA-ME.md`](recursos/LEIA-ME.md).
- **Abertura**: uma abertura de cinema antes do site, com os textos em `conteudo/portfolio.json` (`abertura`). Dá para pular; o botão "Rever abertura" toca de novo.

## Rodar

```bash
python -m http.server 8000
```

Abra http://localhost:8000. Para ver a abertura de novo, use http://localhost:8000/?abertura.

## Estrutura

| Caminho | Conteúdo |
|---|---|
| `index.html` | esqueleto da página (barra, player, painéis, abertura, detalhe) |
| `css/estilo.css` | estilos do cenário, do jogo e dos painéis |
| `css/portfolio.css` | estilos do portfólio (abertura, início, áreas, cartões, detalhe, sobre) |
| `conteudo/portfolio.json` | o conteúdo do portfólio |
| `conteudo/` | imagens e arquivos das atividades |
| `js/00-conteudo.js` | lê o conteúdo, monta as seções, cartões, detalhe e rotas (`#area/atividade`) e carrega o motor |
| `js/00b-abertura.js` | abertura de cinema |
| `js/01-base.js` | utilitários e kit de pintura (formas, folhagem, cristais, luz) |
| `js/02-regioes.js` | os oito temas pintados (fundo, meio, frente) |
| `js/03-cenario.js` | grão de papel, pintura das seções, painel do canto, partículas, criaturas desenhadas |
| `js/04-jogo.js` | chão, fendas, plataformas, modo Passeio, modo Jogo, combate |
| `js/05-audio.js` | trilha gerada, efeitos sonoros, motor do player |
| `js/06-loop.js` | laço de animação e parallax |
| `js/07-interface.js` | player, modos, controles, Oficina, Guia |
| `js/08-pasta-recursos.js` | carregamento automático da pasta `recursos/` |
| `js/08b-poderes.js` | lista de poderes, estado (liberado/bloqueado) e painel |
| `js/09-inicio.js` | inicialização do motor |
| `recursos/` | arquivos do jogo (fontes, personagem, inimigos, fundos, sons, músicas) |
| `recursos/indice.json` | lista de todos os arquivos de `recursos/`, gerada sozinha pelo GitHub |
| `ferramentas/gerar-indice.py` | gera o índice (o GitHub roda isso a cada envio; também dá para rodar à mão) |
| `.github/workflows/indice.yml` | automação do GitHub que mantém o índice em dia |
| `docs/PROMPT-PORTFOLIO.md` | o plano de reconstrução do site |

Os scripts são clássicos (não módulos) e compartilham o escopo global, na ordem numérica: um nome declarado duas vezes quebra o site. `js/00-conteudo.js` e `js/00b-abertura.js` ficam dentro de funções e só expõem `CONTEUDO` e `ABERTURA`. O conteúdo aparece mesmo se o motor do jogo falhar.

A Oficina é uma ferramenta temporária de produção e sai do site quando ele ficar pronto.
