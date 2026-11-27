# Atlas · Portfólio de Caetano Rocha de Oliveira

Portfólio escolar apresentado como uma jornada por um mapa. Cada área do mapa é uma matéria, com as atividades, os projetos e os trabalhos dela.

- **Mapa**: o mundo é um mapa 2D de salas, corredores e poços, como num metroidvania. Cada matéria é uma região; o caminho vai para os lados e para baixo. O início mostra o mapa desenhado, e um minimapa no canto mostra onde o personagem está.
- **Passeio**: o portfólio se lê rolando a página. Ao fundo, atrás do texto, o personagem atravessa o mapa sozinho (a rolagem vira distância no caminho) e a música toca como uma playlist.
- **Jogo**: plataforma com teclado ou toque, explorando livremente o mesmo mapa. A história, os Guardiões de cada área e a trilha da jornada estão em construção.
- **Conteúdo**: tudo o que se lê vem de [`conteudo/portfolio.json`](conteudo/portfolio.json). Mudar o arquivo muda o site. Veja [`conteudo/LEIA-ME.md`](conteudo/LEIA-ME.md).
- **Pasta `recursos/`**: personagem, inimigos, fontes, fundos, sons e músicas do jogo. Coloque arquivos com os nomes certos e eles carregam sozinhos. Lista completa em [`recursos/LEIA-ME.md`](recursos/LEIA-ME.md).
- **Abertura**: uma abertura de cinema desenhada a tinta antes do site (uma gota vira um livro, as páginas voam e viram o mapa do mundo, o título pousa no lugar), com os textos em `conteudo/portfolio.json` (`abertura`). Dá para pular; o botão "Rever abertura" toca de novo.

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
| `css/portfolio.css` | estilos do portfólio (abertura, início, áreas resumidas e registro, detalhe, sobre, HUD, poderes) |
| `conteudo/portfolio.json` | o conteúdo do portfólio |
| `conteudo/` | imagens e arquivos das atividades |
| `js/00-tinta.js` | o traço de tinta desenhado à mão (fita de largura variável que "ferve"), usado pela abertura, pelo HUD e pelo minimapa |
| `js/00a-mundo.js` | gera o mapa 2D (salas, portas, poços, alas, grutas, salas secretas, chão e teto, plataformas, caminho do Passeio) |
| `js/00b-conteudo.js` | lê o conteúdo, monta as seções (área resumida + registro que abre), a lista de atividades, o detalhe e as rotas (`#area/atividade`), o mapa do início, e carrega o motor |
| `js/00c-abertura.js` | abertura de cinema desenhada a tinta (gota, gavinhas, livro, páginas, mapa do mundo, título) |
| `js/01-base.js` | utilitários e kit de pintura (formas, folhagem, cristais, luz) |
| `js/02-regioes.js` | os oito temas: fundos distantes pintados e partículas |
| `js/02b-salas.js` | pintura das salas no estilo desenhado: rocha, aros, estalactites, enfeites por tema, plataformas, frente desfocada |
| `js/02d-enfeites.js` | objetos de cada matéria (colunas, bustos, poliedros, quadro-negro, estantes, livros, árvores, frascos, servidores, robôs…) e de todas as áreas (postes, lanternas, casas, torres, cogumelos, cristais), com contorno de tinta e textura (hachura, veios, pontilhado) |
| `js/02c-pintor.js` | pintor em segundo plano (Web Worker): pinta os blocos do mapa e os fundos sem travar o jogo |
| `js/03-cenario.js` | câmera, blocos pintados do mundo, fundos com parallax, tinta e papel, minimapa, HUD, partículas, criaturas desenhadas |
| `js/03c-vivos.js` | cenário vivo: plantas que se dobram, lanternas e cipós que balançam, vasos, caixas, livros e cristais que quebram e soltam fragmentos de luz, borboletas que fogem |
| `js/03b-hud.js` | HUD desenhado a tinta: medalhão com a luz líquida, nome da área com floreio, páginas de vida, fragmentos e páginas do Atlas |
| `js/04-jogo.js` | colisão com o mapa, modo Passeio (rolagem → caminho), modo Jogo, inimigos (percepção, alerta, preparo, ataque), combate |
| `js/04c-inimigos.js` | o comportamento de cada criatura (patrulha, emboscada, escudo, mergulho, raio, concha, esporos…), projéteis, raios, nuvens e o dano |
| `js/04b-segredos.js` | o portfólio dentro do jogo: placa de cada matéria, páginas das atividades, paredes falsas, salas secretas e easter eggs |
| `js/05-audio.js` | trilha gerada, efeitos sonoros, motor do player |
| `js/05b-sons.js` | música que acompanha a área (com a versão de combate e a das salas secretas), passos e outros sons em laço, vozes sintetizadas das criaturas e sons do cenário |
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

Os scripts são clássicos (não módulos) e compartilham o escopo global, na ordem numérica: um nome declarado duas vezes quebra o site. `js/00-tinta.js`, `js/00a-mundo.js`, `js/00b-conteudo.js` e `js/00c-abertura.js` ficam dentro de funções e só expõem `TINTA`, `MUNDO`, `CONTEUDO` e `ABERTURA`. O conteúdo aparece mesmo se o motor do jogo falhar. A pintura pesada do cenário roda em `js/02c-pintor.js` (Web Worker, que carrega `01-base.js`, `02-regioes.js`, `00a-mundo.js`, `02b-salas.js` e `02d-enfeites.js`); aberto direto do disco (`file://`) ou num navegador sem `OffscreenCanvas`, a pintura volta para a página, um pedaço por quadro.

A Oficina é uma ferramenta temporária de produção e sai do site quando ele ficar pronto.
