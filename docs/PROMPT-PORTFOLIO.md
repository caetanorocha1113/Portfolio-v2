# Prompt — Portfólio jogável

> Como usar: copie tudo a partir de "Você vai reconstruir…" e cole numa sessão de IA com acesso a este repositório.
> Antes, preencha a seção **Dados do dono** (no fim) ou deixe os marcadores `[ … ]` para a IA perguntar.

---

Você vai reconstruir o site deste repositório para que ele se torne o **portfólio pessoal de [NOME DO DONO]**. O código atual é a **base**: reaproveite o motor visual, o jogo, o áudio e o carregamento de recursos, mas reorganize a estrutura, o conteúdo e a narrativa de acordo com este documento. Leia o `CLAUDE.md`, o `README.md` e o `recursos/LEIA-ME.md` antes de começar.

## 1. O conceito

- O site é um **portfólio** apresentado como uma **jornada por um mapa**. Rolar a página (ou jogar) é atravessar o mapa, área por área.
- **Cada área do mapa corresponde a uma matéria/disciplina** do dono. Dentro dela ficam as atividades, os projetos e os trabalhos daquela matéria.
- O nome antigo do projeto ("Velumbra") **sai de todo o site, dos textos e dos arquivos**. O novo nome é **[NOME DO PORTFÓLIO]**.
- Há duas formas de usar o site, sempre com o conteúdo do portfólio acessível:
  1. **Navegação normal (Passeio):** um portfólio que se lê rolando a página. Ao fundo, o personagem joga sozinho (gameplay de fundo, como já existe). As músicas tocam normalmente, como uma playlist.
  2. **Modo Jogo:** um jogo de plataforma com **história completamente original**. Cada área termina numa **luta contra um chefe**, e a **trilha sonora acompanha a jornada** (exploração, chefe, vitória, final).
- **Prioridade:** quem visita o portfólio (professor, recrutador, colega) precisa encontrar e ler o conteúdo sem jogar. O jogo é uma camada extra, nunca um obstáculo.

## 2. O que já existe e deve ser reaproveitado

- **Tecnologia:** HTML, CSS e JavaScript puros, sem etapa de build. Os scripts são clássicos (não módulos), numerados em `js/` e compartilham o escopo global; um nome declarado duas vezes quebra o site inteiro. Publicação pelo GitHub Pages (`main`, raiz).
- **Visual:** oito "temas" de região já pintados por código, com três camadas em parallax, partículas de clima, iluminação e acabamento de tinta e grão (`js/02-regioes.js`, `js/03-cenario.js`). Eles passam a ser **temas visuais reutilizáveis** que cada matéria escolhe. Os nomes internos atuais (cinzaraiz, galerias, sendas, brejo, cidadela, minas, ninho, fosso) podem virar nomes de tema neutros.
- **Jogo:** chão com fendas, plataformas entre áreas, física de plataforma, golpes em três direções, vida, energia, fragmentos, pontos de retorno (`js/04-jogo.js`). Modo Passeio (personagem automático) e modo Jogar.
- **Poderes:** sistema com estado liberado/bloqueado e ações (`js/08b-poderes.js` e `PODER_ACAO` em `js/08-pasta-recursos.js`).
- **Inimigos:** sistema configurável por `recursos/inimigos/inimigos.json` (comportamentos genéricos, animações por papel, projéteis).
- **Áudio:** motor de trilha gerada por código, efeitos sonoros e player com lista, volume e "acompanhar região" (`js/05-audio.js`, `js/07-interface.js`).
- **Recursos:** a pasta `recursos/` é lida sozinha. O índice `recursos/indice.json` é gerado pelo GitHub Actions a cada envio (`.github/workflows/indice.yml`, `ferramentas/gerar-indice.py`). A Oficina mostra o que carregou.

### Sprites e arquivos do dono (obrigatório)

- **Todos os arquivos que já estão em `recursos/` continuam no repositório e continuam sendo usados.** Não apague, não mova e não renomeie nada ali sem o dono pedir.
- O **personagem** continua vindo de `recursos/personagem/`, configurado pelo dono em `recursos/personagem/settings.json`.
- Os **inimigos** continuam vindo de `recursos/inimigos/`, configurados pelo dono em `recursos/inimigos/inimigos.json`. Onde cada inimigo aparece é escolha do dono, nesse arquivo.
- As **fontes** de `recursos/fontes/` continuam sendo usadas.
- A arte desenhada por código continua existindo como reserva: aparece onde o dono ainda não colocou arquivos.

## 3. Modelo de conteúdo (tudo vem de dados, não de HTML fixo)

Hoje as oito seções estão escritas à mão no `index.html`. Troque isso por um arquivo de conteúdo, `conteudo/portfolio.json`, e gere as seções a partir dele. A quantidade de áreas é a quantidade de matérias, não fixa em oito. Se houver mais matérias que temas, reutilize os temas com variações de paleta.

```json
{
  "perfil": {
    "nome": "[NOME DO DONO]",
    "titulo": "[curso / área / objetivo]",
    "resumo": "[2 a 3 frases de apresentação]",
    "foto": "conteudo/imagens/foto.jpg",
    "links": [{ "rotulo": "GitHub", "url": "https://github.com/…" }],
    "contato": { "email": "[e-mail]", "cidade": "[cidade]" }
  },
  "areas": [
    {
      "id": "matematica",
      "materia": "[Nome da matéria]",
      "titulo_area": "[nome da área no mapa]",
      "periodo": "[ano / semestre]",
      "descricao": "[o que foi estudado, em 2 a 4 frases]",
      "competencias": ["[competência 1]", "[competência 2]"],
      "tema": "galerias",
      "atividades": [
        {
          "id": "projeto-1",
          "titulo": "[título]",
          "tipo": "projeto | trabalho | prova | apresentação | outro",
          "data": "AAAA-MM",
          "resumo": "[1 frase]",
          "descricao": "[texto completo]",
          "imagens": ["conteudo/atividades/projeto-1/capa.jpg"],
          "links": [{ "rotulo": "Ver arquivo", "url": "conteudo/atividades/projeto-1/arquivo.pdf" }],
          "tags": ["[tag]"],
          "destaque": true
        }
      ],
      "jogo": {
        "intro": "[texto que abre a área no modo Jogo]",
        "chefe": "guardiao-matematica",
        "poder_recompensa": "salto_duplo",
        "musica_exploracao": "musicas/matematica.ogg",
        "musica_chefe": "musicas/chefe-matematica.ogg"
      }
    }
  ],
  "sobre": "[texto livre]",
  "historia": { "prologo": "[…]", "final": "[…]" }
}
```

- **Não invente atividades, notas, datas nem experiências reais do dono.** Até ele enviar o portfólio atual, use marcadores visíveis (`[ … ]`) e conteúdo de exemplo claramente identificado como exemplo.
- Quando o dono enviar o portfólio atual, extraia dele as matérias, atividades, textos e links e preencha o JSON. Confirme com ele a ordem das matérias e quais atividades ficam em destaque.
- Imagens e arquivos das atividades ficam em `conteudo/` (separado de `recursos/`, que é do jogo).

## 4. Estrutura do portfólio (navegação normal)

1. **Abertura:** nome, título, resumo curto, foto opcional, botões "Ver matérias" e "Jogar", e um **mapa** com todas as áreas (índice clicável).
2. **Uma seção por área/matéria,** na ordem do mapa, com:
   - cabeçalho: matéria, período, descrição e competências;
   - grade de **cartões de atividade** (capa, título, tipo, data, resumo; os destaques primeiro);
   - **detalhe da atividade** ao clicar (painel ou página), com texto completo, galeria de imagens, arquivos e links, e endereço próprio (`#area-atividade`) para poder ser compartilhado.
3. **Sobre** e **Contato** no fim, com links e um e-mail copiável.
4. **Navegação fixa:** o mapa lateral das áreas (já existe), o botão de modo (Passeio/Jogo), o player de música e o acesso aos poderes e às configurações.

**Leitura em primeiro lugar:**
- textos sobre painéis com contraste suficiente sobre a arte;
- o conteúdo funciona mesmo se o jogo falhar;
- teclado e leitores de tela;
- `prefers-reduced-motion` respeitado;
- celular sem rolagem horizontal;
- título, descrição e imagem de compartilhamento no `<head>`.

## 5. Modo Passeio (navegação normal)

- Mantém a gameplay de fundo: o personagem atravessa as áreas sozinho, com plataformas, fendas e inimigos, acompanhando a rolagem.
- A camada de jogo fica **atrás** do conteúdo e nunca cobre texto nem botões.
- **Música:** playlist normal. Toca em sequência, sem trocar por área nem por evento do jogo; o visitante controla pelo player.
- Pausar animação e som quando a aba estiver em segundo plano.

## 6. Modo Jogo (história)

### História

- **Completamente original.** Não use enredo, nomes, lugares, falas, criaturas, chefes nem músicas de nenhum jogo existente.
- O protagonista é o personagem carregado de `recursos/personagem/`. Na história ele tem nome, passado e falas originais, definidos com o dono.
- A história amarra as matérias: cada área é um capítulo, e o chefe da área representa o desafio daquela matéria.
- Proposta inicial (original, para o dono aprovar ou trocar): um **Atlas** que reunia todo o conhecimento do mundo se partiu, e cada página virou uma região isolada, guardada por um **Guardião** que transformou o saber daquela região num enigma vivo. O protagonista atravessa o mapa para recuperar as páginas. Vencer um Guardião devolve a página da área, que abre os destaques do portfólio daquela matéria, e concede uma habilidade necessária para seguir. No fim, o Atlas restaurado revela o mapa inteiro: o próprio portfólio.

### Estrutura de cada área no modo Jogo

1. Texto de abertura (`jogo.intro`) numa caixa de diálogo.
2. Exploração com os inimigos configurados pelo dono e plataformas até a arena.
3. **Arena do chefe:** a câmera trava e paredes fecham a arena.
4. Luta contra o chefe.
5. Vitória:
   - libera o poder da área (`poder_recompensa`);
   - mostra as atividades em destaque da matéria;
   - abre a passagem para a próxima área;
   - salva o progresso.
6. Final do jogo depois do último chefe, com créditos e um atalho para o portfólio completo.

### Chefes

- **Um chefe por área, com design original.** Não recrie chefes de jogos existentes.
- **Motor genérico** de chefes (por exemplo `js/12-chefes.js`) com:
  - barra de vida;
  - de 2 a 4 padrões de ataque com aviso visual antes de cada um;
  - mudança de fase a 50% da vida;
  - invulnerabilidade curta depois de levar golpe;
  - animação de derrota;
  - tentar de novo a partir da entrada da arena.
- **Configuração** em `recursos/chefes/chefes.json`, no mesmo estilo do `inimigos.json`: pasta de sprites, animações por papel (ocioso, ataque A/B/C, dano, derrota), vida, padrões e tamanho.
- Enquanto um chefe não tiver sprites, ele é **desenhado por código** com arte original no estilo do site.
- Dificuldade crescente ao longo das áreas, com uma opção de dificuldade fácil (mais vida, ataques mais lentos) para quem só quer ver o portfólio.

### Progressão, diálogos e salvamento

- **Poderes:** os poderes existentes (avanço, salto duplo, escalar paredes, super avanço, avanço sombrio, magias e cura) são liberados pelos chefes, na ordem definida em `poder_recompensa`. Antes de liberar cada poder, termine a mecânica dele no motor; o super avanço e o escalar paredes ainda estão incompletos.
- **Diálogos:** caixa com texto em português, efeito de digitação que pode ser pulado, retrato opcional, avanço por tecla, clique ou toque.
- **Salvamento:** progresso em `localStorage` (áreas vencidas, poderes, ponto de retorno), com um botão "Recomeçar jornada" que pede confirmação na própria página.

## 7. Trilha sonora

- **Modo Jogo:** a música acompanha a jornada, com transições suaves:
  - **exploração:** tema da área (`musica_exploracao`);
  - **chefe:** tema do chefe ao entrar na arena (`musica_chefe`);
  - **vitória:** um trecho curto e a volta ao tema da área;
  - **diálogos:** volume reduzido;
  - **final:** tema próprio;
  - **derrota:** a música do chefe recomeça na nova tentativa.
- **Navegação normal:** playlist normal, sem troca automática.
- Use as faixas geradas por código como padrão. Use os arquivos do dono em `recursos/musicas/` quando existirem. **Toda música precisa ser original ou ter licença de uso.**
- O player continua com tocar, pausar, avançar, voltar, volume, lista e silenciar; no modo Jogo, a lista mostra a faixa atual da jornada.

## 8. Arquitetura sugerida

- `conteudo/portfolio.json` + `js/10-conteudo.js`: carrega o conteúdo e monta as seções, os cartões, o detalhe e as rotas `#…`.
- `js/11-historia.js`: diálogos, capítulos, salvamento e roteiro de cada área.
- `js/12-chefes.js`: motor de chefes e arenas.
- Ajustar `js/02/03` para que as áreas venham do conteúdo (cada uma com um `tema`), e não de oito seções fixas.
- Ajustar `js/05-audio.js` para ter dois modos: playlist (Passeio) e máquina de estados da jornada (Jogo).
- Manter `recursos/`, o índice automático, a Oficina e o Guia. Atualizar o Guia e o `recursos/LEIA-ME.md` com as pastas novas (`chefes/`).
- **Desempenho:**
  - carregar os sprites da área atual e da próxima, não tudo de uma vez;
  - avaliar juntar cada animação numa folha só na mesma automação do índice;
  - meta de abertura rápida no celular.

## 9. Ordem de trabalho

1. Trocar o nome, criar `conteudo/portfolio.json` com marcadores e gerar as seções a partir dele, mantendo o visual atual.
2. Interface do portfólio: abertura, mapa, cartões, detalhe de atividade, Sobre, Contato, rotas.
3. Passeio sobre o novo layout, e música em modo playlist.
4. Sistema de história: diálogos, capítulos, salvamento.
5. Motor de chefes e o primeiro chefe completo (arte por código), depois os demais.
6. Trilha da jornada no modo Jogo.
7. Mecânicas dos poderes restantes, liberadas pelos chefes.
8. Acessibilidade, celular, desempenho, documentação.
9. Preencher com o portfólio atual do dono quando ele enviar.

Depois de cada etapa: testar no navegador (sem erros no console, celular e computador), fazer commit, enviar e resumir o que mudou.

## 10. Regras e limites

- Siga o `CLAUDE.md`. Antes de qualquer mudança, `git fetch` e `git pull --rebase`, e diga o que o dono mudou. Nunca apague nem mova nada em `recursos/`. Não sobrescreva código do dono sem perguntar.
- Não invente dados reais do dono (atividades, notas, datas, cursos, contatos).
- Não reproduza história, personagens, chefes, nomes, falas ou músicas de jogos ou obras existentes. Tudo que o código criar deve ser original.
- Não decida pelo dono o que fica em cada área nem quais arquivos de `recursos/` vão em cada lugar. Ofereça o sistema e pergunte.
- Mantenha os scripts clássicos e sem build; nenhum nome global pode ser declarado duas vezes.

## 11. Critérios de aceite

- O nome antigo não aparece em lugar nenhum.
- As áreas, matérias e atividades vêm de `conteudo/portfolio.json`; mudar o JSON muda o site.
- Todo o conteúdo pode ser lido sem jogar, no celular e no computador, com teclado.
- O modo Passeio mostra a gameplay de fundo com a playlist tocando normalmente.
- O modo Jogo tem prólogo, um capítulo por área com chefe, progressão de poderes, salvamento e final; a música troca entre exploração, chefe e vitória.
- O personagem, os inimigos e as fontes de `recursos/` continuam carregando como antes.
- Nenhum erro no console. A Oficina mostra o que carregou.

## Dados do dono (preencher)

- Nome do portfólio: `[ … ]`
- Nome do dono, curso ou área e instituição: `[ … ]`
- Matérias, na ordem do mapa: `[ … ]`
- Tom dos textos (formal, descontraído…): `[ … ]`
- Premissa da história aprovada ou outra: `[ … ]`
- Nome e personalidade do protagonista na história: `[ … ]`
- Qual poder cada chefe libera: `[ … ]`
- Links e contato: `[ … ]`
- Portfólio atual (arquivo ou link): `[ … ]`
