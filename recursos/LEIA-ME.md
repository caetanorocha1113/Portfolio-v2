# Pasta `recursos/`

Coloque aqui os seus arquivos com **exatamente** os nomes abaixo. O site carrega tudo sozinho ao abrir, sem configurar nada.

> Não apague este `LEIA-ME.md`: o site procura por ele para saber que a pasta existe.
> Nomes sempre em minúsculas, sem acento e sem espaço.

Para conferir o que foi encontrado, abra o site, clique em **Guia** e veja a aba **Pasta recursos** (a lista fica no fim):
✓ carregou · ainda não colocado · ✕ arquivo com problema.

---

## 1. Fontes — `recursos/fontes/`

| Arquivo | Onde aparece | Formatos aceitos |
|---|---|---|
| `titulo` | nome do portfólio, nomes das áreas, títulos, painel do canto, abertura | `.woff2` `.woff` `.ttf` `.otf` |
| `texto` | parágrafos, cartões, falas da abertura, lista de faixas | `.woff2` `.woff` `.ttf` `.otf` |

Exemplo: `recursos/fontes/titulo.ttf`. Confira se a fonte tem acentos (Â, ã, ç). As fontes carregam logo no início, para a abertura já usá-las.

## 2. Personagem — `recursos/personagem/`

**Uma pasta por animação** (nomes em inglês), com os quadros numerados na ordem em que tocam. Todas as pastas já estão criadas no repositório (o `.gitkeep` só serve para o Git guardar a pasta vazia).

```
recursos/personagem/
  idle/   1.png 2.png 3.png …
  run/    1.png 2.png …
  jump/   1.png …
  …
  settings.json
```

**Regras dos quadros:**

- PNG com **fundo transparente**.
- Numeração `1.png`, `2.png`, `3.png`… ou `01.png`, `02.png`… A contagem **para no primeiro número que faltar**: não pule números.
- O site encontra o desenho dentro de cada imagem e **alinha todos os quadros pelos pés**. Quadros recortados justos ou com sobra transparente funcionam igual.
- Todos os quadros (personagem e efeitos) precisam olhar para o **mesmo lado**. Se olharem para a esquerda, use `"faces_left": true` no `settings.json` (já está assim).
- Com o seu personagem, o site **não desenha efeitos próprios**: só aparecem os efeitos que você colocar nas pastas `fx-…`. Pasta `fx-…` vazia = nenhum efeito naquela ação.
- A pasta `idle/` é a mais importante. Enquanto ela estiver vazia, o 1º quadro de outra animação fica parado no lugar.

### Animações básicas

| Pasta | Quando toca | Repete? | Se faltar |
|---|---|---|---|
| `idle/` | parado | sim | 1º quadro de `land`, `run`… |
| `run/` | andando | sim | idle |
| `jump/` | subindo no ar | sim | idle |
| `fall/` | descendo no ar | sim | jump |
| `attack/` | ataque para frente | não | idle |
| `attack-up/` | ataque para cima (W + golpe) | não | attack |
| `attack-down/` | ataque para baixo no ar (S + golpe) | não | attack |
| `dash/` | avanço rápido | sim | run |
| `hurt/` | ao ser atingido | não | idle |
| `death/` | ao perder toda a vida | não | hurt |
| `double-jump/` | segundo pulo no ar | não | jump |
| `land/` | ao tocar o chão e ao se preparar para pular | não | idle |
| `look-up/` | parado segurando W | sim | idle |
| `look-down/` | parado segurando S | sim | idle |

### Animações dos poderes

Os poderes são liberados aos poucos (painel **Poderes**, tecla I). As pastas podem ser preenchidas antes.


### Efeitos

| Pasta | Onde aparece |
|---|---|
| `fx-attack/` | golpe para frente, à frente do personagem |
| `fx-attack-up/`, `fx-attack-down/` | golpes para cima e para baixo (se faltarem, o `fx-attack` é girado) |
| `fx-hit/` | no ponto em que o golpe acerta a criatura |
| `fx-double-jump/` | no segundo pulo |
| `fx-dash/` | no início do avanço |
| `fx-spell/` | o projétil da magia para frente |
| `fx-dive/` | o impacto da magia para baixo |
| `fx-spell-up/` | a explosão da magia para cima |
| `fx-heal/` | durante a cura |
| `fx-superdash/` | durante o super avanço |
| `fx-shadow-dash/` | no avanço sombrio |

Os efeitos são desenhados **centralizados** no ponto da ação.

### `personagem/settings.json`

```json
{
  "faces_left": true,
  "scale": 1,
  "pixel": false,
  "outline": false,
  "glow": false,
  "fps": { "run": 14, "attack": 20 },
  "loop": { "death": false }
}
```

- `faces_left`: `true` quando os quadros olham para a esquerda.
- `scale`: 1 = o desenho do `idle` com cerca de 84 px de altura numa tela de 1280 px. `ref_height` troca essa referência por uma altura fixa em px.
- `fps`: velocidade de cada animação, pelo nome da pasta.
- `loop`: força uma animação a tocar uma vez (`false`) ou em loop (`true`).
- `pixel`: `true` para pixel art. `outline`: `true` desenha a linha de tinta do site em volta. `glow`: `true` acende um brilho de lanterna perto do personagem.
- O arquivo precisa conter só o JSON. Se estiver quebrado, o Guia → Pasta recursos mostra a linha do erro.

Os arquivos antigos `personagem.png` e `personagem.json` **não são mais lidos**.

## 3. Inimigos — `recursos/inimigos/`

Há dois jeitos, e eles podem ser usados juntos.

### A) Seus inimigos, descritos em `inimigos/inimigos.json`

1. Cada inimigo numa pasta, com uma subpasta por animação, com os nomes que você quiser:

   ```
   recursos/inimigos/
     Minha Criatura/
       Walk/    qualquer-nome-0001.png  qualquer-nome-0002.png …
       Turn/    …
       Death/   …
     inimigos.json
   ```

   Os quadros podem ter **qualquer nome**: o site usa a ordem numérica dos nomes (2 vem antes de 10), lida no índice `recursos/indice.json`, que o GitHub gera sozinho a cada envio.
2. No `inimigos/inimigos.json`, descreva cada inimigo: pasta, áreas em que aparece, comportamento e animações.

```json
{
  "substituir_originais": true,
  "inimigos": [
    {
      "nome": "Minha Criatura",
      "pasta": "Minha Criatura",
      "comportamento": "andar",
      "regioes": { "humanas": 2, "linguagens": 1 },
      "animacoes": { "andar": "Walk", "virar": "Turn", "morrer": "Death" },
      "vida": 3,
      "velocidade": 1,
      "tamanho": 1,
      "olha_esquerda": true,
      "fps": 12
    },
    {
      "nome": "Voador Atirador",
      "pasta": "Outra Pasta",
      "comportamento": "atirar",
      "regioes": { "ninho": 2 },
      "animacoes": { "andar": "Fly", "atacar": "Fire", "morrer": "Death", "projetil": "Bullet" },
      "altura_voo": 200,
      "recarga": 2.5,
      "olha_esquerda": true
    }
  ]
}
```

**Campos de cada inimigo:**

| Campo | O que é | Padrão |
|---|---|---|
| `nome` | nome que aparece no Guia → Pasta recursos | a pasta |
| `pasta` | pasta dentro de `recursos/inimigos/` | obrigatório |
| `comportamento` | um da tabela abaixo | `andar` |
| `regioes` | área (ou tema) → quantidade (até 12 por área) | obrigatório |
| `animacoes` | papel → subpasta (veja abaixo) | precisa de `andar` ou `parado` |
| `vida` | golpes para derrotar | 3 |
| `velocidade` | 1 = normal; 2 = o dobro | 1 |
| `tamanho` | multiplicador de tamanho | 1 |
| `olha_esquerda` | `true` se os quadros olham para a esquerda. Se algumas animações olham para um lado e outras para o outro, use um objeto por papel: `{ "padrao": true, "atacar": false }` | `false` |
| `fps` | velocidade das animações (número ou `{ "andar": 12, "morrer": 10 }`) | 10 |
| `dano` | `false` = não machuca ao encostar | `true` |
| `altura_voo` | altura em px dos voadores acima do chão | 170 |
| `recarga` | segundos entre tiros (`atirar`) | 2.2 |
| `alcance` | distância (px) em que ele percebe o jogador; precisa também ter linha de visão | depende do comportamento (veja abaixo) |
| `disparo` | em que ponto da animação `atacar` o tiro sai (0 = no começo, 0.5 = no meio) | 0 |
| `vel_projetil` | multiplicador da velocidade do tiro | 1 |
| `projetil_olha_esquerda` | `true` se os quadros do projétil apontam para a esquerda (o projétil voa de ponta, girado na direção do voo) | `false` |
| `projetil_gira` | `true` para projéteis que giram no ar (uma picareta, por exemplo) | `false` |
| `projetil_tipo` | `reto`, `acido` (bola de ácido desenhada), `arco` (cai em arco até o jogador), `esporo` (flutua atrás do jogador e estoura) | `reto` |
| `projeteis` | quantos tiros saem de uma vez, abertos em leque | 1 |
| `cor_projetil` / `cor_laser` | cor da bola de ácido / do raio (ex.: `"#ff9a3c"`) | do tema |
| `repetir` | quais animações repetem em vez de parar no último quadro: `{ "atacar": true }` | só `andar`, `parado`, `correr`, `fugir`, `dormir`, `fechado`, `escondido`, `trabalhar` |
| `escudo` | `true`: golpes de espada pela frente batem no escudo (magia passa) | `false` |
| `pesado` | `true` no `guarda`: combo de dois cortes, salto de ataque, golpe para cima e não é empurrado | `false` |
| `imune` | `"golpe"`: só magia fere (o Crystal Crawler) | — |
| `ate_parede` | `true` no `investir`: corre em linha reta até bater (Husk Hornhead) | `false` |
| `velocidade_investida` | multiplicador da corrida ou do mergulho | 1 |
| `curva` | `true` no `mergulhar`: o rasante é em curva (Mantis Youth) | `false` |
| `fica` | `true` no `mergulhar`: paira no lugar e só dispara quando o jogador entra no alcance (Squit) | `false` |
| `direto` | `true` no `perseguir`: voa reto para o jogador, sem susto (Aspid Hatchling) | `false` |
| `recua` | `true` no `atirar` de chão: se afasta (ou esquiva) quando o jogador chega perto | `false` |
| `trabalha` | `true` no `atirar`: enquanto não vê ninguém, fica na animação `trabalhar` (o minerador cavando) | `false` |
| `filhote` | no `mae`: a pasta do inimigo que ele solta (precisa estar na lista) | — |
| `voz` | voz sintetizada: `inseto`, `casca`, `guarda`, `voador`, `louva`, `musgo`, `terra`, `cogumelo`, `cristal`, `baldur`, `agua` | pelo nome |
| `substituir` | `true` tira as criaturas desenhadas das áreas em que este inimigo aparece | `substituir_originais` |

**Onde aparece (`regioes`):** aceita três jeitos, que podem ser misturados:

- o **id da área** em `conteudo/portfolio.json`: `inicio`, `humanas`, `matematica`, `linguagens`, `natureza`, `tecnico`, `trajetoria`, `sobre`;
- o **nome do tema**: `cinzaraiz`, `galerias`, `sendas`, `brejo`, `cidadela`, `minas`, `ninho`, `fosso` (vale para todas as áreas com esse tema);
- o **número da seção** no mapa (1 = início).

O comportamento `teto` só funciona em temas com teto (todos menos `cinzaraiz`).

**Comportamentos** (escritos a partir da descrição de cada criatura):

| Nome | Movimento | Exemplo | `alcance` padrão |
|---|---|---|---|
| `andar` | rasteja de um lado para o outro e vira nas paredes e beiradas; não persegue | Crawlid, Durandoo | não reage |
| `vagar` | vagueia devagar, com paradas; ao ver o jogador, ergue os braços (`preparar`) e vai até ele desajeitado (`atacar` em laço) | Husk Dandy | 420 |
| `investir` | patrulha; com o jogador na mesma linha, prepara e dispara correndo (`ate_parede`: só para ao bater) | Mosskin, Husk Hornhead | 440 |
| `guarda` | escudo na frente (`escudo`); estocada rápida e salto para trás (`esquivar`); com `pesado`: combo de dois cortes (`atacar` + `atacar2`), salto de ataque e golpe para cima (`…_cima`); `defender`/`defender_cima` tocam quando o golpe bate no escudo | Husk Sentry, Great Husk Sentry | 520 |
| `duelista` | corre até o jogador, corta na horizontal, recua para manter distância, salta e corta do alto; golpe para cima se ele estiver em cima | Mantis Warrior | 560 |
| `emboscar` | fica escondido no chão (`escondido`, ou o 1º quadro de `surgir`); quando o jogador chega, surge, corre em linha reta e se enterra de novo (`sumir`); com `fugir`, o bichinho de dentro foge ao morrer | Dirtcaver, Moss Charger | 300 |
| `saltitar` | dorme (`dormir`) até ver o jogador (`acordar`); anda em pulinhos e, perto, rola para a frente (`atacar`) | Shrumal Warrior | 420 |
| `perseguir` | voa perto de casa; ao ver o jogador, grita (`alerta`) e persegue sem parar (com `atacar`, dá um bote) | Vengefly, Aspid Hatchling | 540 |
| `quicar` | voa em diagonal e quica nas paredes, no teto e no chão, sem ligar para o jogador | Gruzzer | não reage |
| `mergulhar` | paira, trava a mira (`preparar`) e dispara contra o ponto onde o jogador estava; depois volta a subir | Lance Sentry, Squit, Mantis Youth | 520 |
| `teto` | pendurado no teto (num fio, se o teto for alto); quando o jogador passa embaixo, guincha, despenca e, com `explodir`, explode ao bater | Belfly | 170 |
| `aranha` | pendurada no teto; desce pelo fio (`descer`) e corre muito rápido no chão, com saltos curtos | Little Weaver | 320 |
| `atirar` | mantém distância e atira (no chão; com `altura_voo`, voando) | Aspid Hunter, Husk Miner | 560 |
| `mae` | flutua devagar soltando filhotes (`filhote`); ao morrer, estoura (`explodir`) e solta mais dois | Aspid Mother | 560 |
| `rastejar` | anda no chão ou no teto e solta um raio para o lado das costas | Crystal Crawler | — |
| `laser` | anda devagar; ao ver o jogador, para, mira (um fio de aviso) e solta um raio pela cabeça | Crystallised Husk | 640 |
| `concha` | fecha a concha quando o jogador chega perto (`fechar`, `fechado`: nada fere); de longe, abre (`abrir`) e cospe filhotes que rolam ou ácido | Elder Baldur | 720 |
| `ogro` | dorme até ver o jogador; cospe ácido em arco de longe e bate a cabeça no chão de perto (`preparar2`, `atacar2`, `recuperar2`) | Shrumal Ogre | 620 |
| `esporo` | fixo no chão; acorda e solta esporos que flutuam atrás do jogador e estouram | Sporg | 520 |
| `nuvem` | flutua devagar; perto do jogador, infla e solta uma nuvem tóxica em volta (`nuvem`: a animação da nuvem) | Fungoon | 200 |
| `flutuar` | só flutua para cima e para baixo | Uoma | não reage |
| `pular` | anda pulando; quando vê o jogador, pula na direção dele | — | 340 |
| `parado` | fica no lugar, vira para quem chega perto e, com `atacar`, golpeia | — | 260 |
| `voar` | voa de um lado para o outro, oscilando | — | não reage |

Os inimigos só percebem o jogador com linha de visão (paredes escondem). No modo Passeio eles reagem ao personagem que caminha, mas não machucam.

**Papéis das animações** (`animacoes`):

| Papel | Quando toca |
|---|---|
| `andar` | movimento normal (para voadores, o voo) |
| `parado` | comportamento `parado`, mirando, ou no lugar de `andar` se ela faltar |
| `virar` | uma vez, quando muda de direção |
| `alerta` | uma vez, quando percebe o jogador pela primeira vez (opcional) |
| `preparar` | uma vez, antes do ataque: o "aviso" de que vai atacar (opcional) |
| `atacar` | no ataque: investida, tiro ou bote |
| `recuperar` | uma vez, depois do ataque (opcional) |
| `morrer` | uma vez, ao ser derrotado; o corpo cai e fica no chão alguns segundos (volta em 22 s, fora da tela) |
| `morrer_ar` | enquanto o corpo ainda está no ar (depois toca `morrer`, já no chão) |
| `projetil` / `projetil_fim` | o tiro e o fim do tiro (quebrar, estourar, cair) |
| `correr`, `pular`, `esquivar` | correr longe do jogador, saltar, pular para trás |
| `defender`, `defender_cima` | o golpe bateu no escudo (na frente / em cima) |
| `preparar2`, `atacar2`, `recuperar2` | o segundo ataque (combo, cabeçada no chão) |
| `preparar_cima`, `atacar_cima`, `recuperar_cima` | o ataque para cima |
| `escondido`, `surgir`, `sumir`, `fugir` | emboscada: enterrado, saindo da terra, voltando para a terra, fugindo ao morrer |
| `dormir`, `acordar`, `trabalhar` | antes de ver o jogador |
| `fechar`, `fechado`, `abrir` | a concha do `concha` |
| `descer` | a aranha descendo pelo fio |
| `explodir` | a explosão (Belfly) ou o estouro (Aspid Mother) |
| `ferido` | um instante, quando leva um golpe |
| `nuvem` | a nuvem do `nuvem` |

Um papel pode juntar duas pastas em sequência: `"atacar": ["Attack (Part 1)", "Attack (Part 2)"]`.

- O tamanho na tela usa a **mesma escala de pixels do seu personagem**: se os quadros vieram do mesmo jogo, as proporções entre personagem e inimigos ficam certas. Use `tamanho` só para ajustar.
- Os quadros são alinhados pelos pés (voadores: pelo centro).
- O Guia → Pasta recursos mostra cada inimigo com ✓ (onde foi colocado e quantos quadros cada animação tem) ou ✕ (pasta, subpasta, área ou comportamento errados).

### B) Trocar o desenho das criaturas originais do site

Uma imagem por criatura, com uma linha só de quadros quadrados (o lado do quadro é a altura da imagem):

| Arquivo | Criatura original |
|---|---|
| `besouro.png` | rastejante que patrulha o chão |
| `mosca.png` | voadora que persegue |
| `saltador.png` | pula enquanto anda (tema brejo) |
| `aranha.png` | patrulha rápida (tema ninho) |
| `sentinela.png` | alta, anda devagar (tema cidadela) |
| `pendente.png` | desce do teto (tema ninho) |
| `agua-viva.png` | flutua (tema fosso) |

Opcional: `nome.json` ao lado (ex.: `mosca.json`) com `{ "quadro": [40, 40], "quadros": 2, "fps": 14, "tamanho": 0.9, "olha_esquerda": false }`.

### O índice `recursos/indice.json`

- É **gerado sozinho pelo GitHub** a cada envio que muda algo em `recursos/` (aba **Actions** → "Índice de recursos"). Ele cria um commit "Atualiza recursos/indice.json": antes do próximo envio, faça `git pull`.
- Para gerar no seu computador: `python ferramentas/gerar-indice.py`.
- Não edite à mão. Sem o índice, o site só encontra quadros numerados `1.png`, `2.png`…

## 4. Fundos das áreas — `recursos/fundos/`

O site procura primeiro pelo **id da área** e depois pelo **nome do tema** dela:

| Arquivo | Vale para |
|---|---|
| `inicio`, `humanas`, `matematica`, `linguagens`, `natureza`, `tecnico`, `sobre` | só aquela área (ids de `conteudo/portfolio.json`) |
| `cinzaraiz`, `galerias`, `sendas`, `brejo`, `cidadela`, `minas`, `ninho`, `fosso` | todas as áreas com aquele tema |

- Formatos: `.jpg` `.png` `.webp`.
- Tamanho sugerido: **2400 × 1400 px** (paisagem).
- Vai para o **fundo** (o plano mais distante) de todas as salas da área, visto pelas aberturas da rocha. A rocha, o chão e as plataformas continuam no lugar.

**Opcional:** `ajustes.json`:

```json
{ "cidadela": { "modo": "sobrepor", "opacidade": 0.6, "encaixe": "cobrir", "sujeira": true } }
```

- `modo`: `substituir` (padrão) troca o fundo pintado; `sobrepor` mistura por cima.
- `encaixe`: `cobrir` (padrão) ou `conter`.
- `sujeira`: `false` tira o grão de papel velho por cima.

## 5. Efeitos sonoros — `recursos/sons/`

**Nomes curtos** (valem primeiro, se existirem):

| Arquivo | Quando toca |
|---|---|
| `pulo` | ao sair do chão |
| `salto-duplo` | ao bater as asas no ar |
| `pouso` | ao tocar o chão |
| `passo` | a cada passo correndo |
| `golpe` | ao atacar |
| `acerto` | quando o golpe acerta |
| `dano` | quando o personagem é atingido |
| `coleta` | ao pegar um fragmento de luz |
| `avanco` | no avanço rápido |
| `morte` | ao perder ou cair no Fosso |
| `inimigo-morre` | quando uma criatura é derrotada |

**Pacote do personagem:** sem os nomes curtos, o site reconhece estes arquivos em qualquer subpasta de `sons/` (por exemplo `sons/personagem/`):

| Arquivo | Quando toca |
|---|---|
| `hero_jump` | pulo |
| `hero_wings` | salto duplo |
| `hero_land_soft` / `hero_land_hard` | pouso / pouso depois de uma queda longa |
| `hero_dash` / `hero_shade_dash_1` | avanço / avanço com o passo de névoa |
| `hero_damage` | dano |
| `hero_death_v2` | morte |
| `hero_wall_jump` | salto na parede |
| `hero_fireball`, `hero_scream_spell` | faísca, clarão |
| `hero_quake_spell_dash`, `hero_quake_spell_impact` | queda e o impacto dela |
| `hero_super_dash_charge`, `hero_super_dash_burst`, `hero_super_dash_loop` | corrida de cristal |
| `hero_parry` | golpe que bate num escudo, numa concha ou num cristal |
| `hero_unsheath` | ao entrar no modo Jogo |
| `hero_run_footsteps_stone` / `_grass` / `_metal` | passos correndo, em laço (grama em Natureza e Trajetória, metal no Técnico) |
| `hero_wall_slide`, `hero_falling` | deslizar na parede, queda longa (em laço) |

Para usar outro arquivo num evento, crie `sons/sons.json`: `{ "pulo": "personagem/hero_jump.wav", "loop_passos": "personagem/hero_walk_footsteps_stone.wav" }`. Os nomes dos eventos estão na tabela acima e no Guia → Pasta recursos.

**Vozes das criaturas:** são sintetizadas (susto, ataque, tiro, raio, dano, morte, explosão…), com a voz escolhida pelo nome do inimigo ou pelo campo `voz`. Para trocar por arquivos: `sons/inimigos/<pasta do inimigo>/<evento>.wav`, com o evento entre `alerta`, `ataque`, `tiro`, `laser`, `dano`, `bloqueio`, `morte`, `explosao`, `surgir`, `sumir`, `pulo`, `pouso`, `passo`, `asa`, `nuvem`, `esporo`, `pancada`.

Os sons do cenário (vasos e caixas quebrando, lanternas, folhas, borboletas) também são sintetizados.

- Formatos: `.ogg` `.mp3` `.wav`.
- Corte o silêncio do começo. `passo` e `golpe` tocam muito: deixe-os com menos de 0,3 s.

## 6. Músicas — `recursos/musicas/`

Com o índice, **toda faixa da pasta entra na lista do player**, com qualquer nome (o número do começo do nome sai do título). Cada uma só baixa quando vai tocar.

Cada área toca uma faixa, escolhida nesta ordem:

1. o arquivo com o id da área (`humanas.mp3`) ou com o nome do tema (`cidadela.mp3`);
2. o que estiver em `musicas/musicas.json`;
3. a faixa de nome parecido com esta tabela:

| Área | Faixa |
|---|---|
| `inicio` | Dirtmouth |
| `humanas` | City of Tears |
| `matematica` | Crystal Peak |
| `linguagens` | Forgotten Crossroads |
| `natureza` | Greenpath |
| `tecnico` | Deepnest |
| `trajetoria` | Fungal Wastes |
| `sobre` | Fog Canyon |

No modo Jogo, a música sempre acompanha a área e troca devagar. Se existir a mesma faixa com "(Action)" no nome (`City of Tears (Action)`), ela entra durante os combates e a faixa normal volta de onde parou alguns segundos depois. Nas salas secretas toca "Dream". No Passeio, a música é uma playlist: toca em sequência e não troca sozinha (a não ser que o alfinete "acompanhar área" do player esteja ligado).

**Opcional:** `musicas.json` para escolher as faixas (pelo nome do arquivo, sem extensão, ou pelo título):

```json
{
  "areas": { "humanas": "16 City of Tears", "sobre": "43 Dream" },
  "combate": { "humanas": "18 City of Tears (Action)", "natureza": "10 Greenpath (Action)" },
  "segredo": "44 Dream (Cello)"
}
```

**Capas:** as imagens de `musicas/` (`.jpg`, `.png` ou `.webp`) viram as capas do player. Uma imagem com o mesmo nome da faixa (`09 Greenpath.jpg`) vai para ela. O arquivo opcional `capas.json` escolhe à mão: a chave é o começo do nome da faixa (vale para todas que começam assim) e `padrao` lista as imagens que se revezam nas outras faixas (sem ele, todas as imagens se revezam):

```json
{ "padrao": ["1.jpg", "2.jpg", "3.jpg", "4.jpg"], "Greenpath": "5.jpg" }
```

Tamanho bom para capa: quadrada, entre 300 e 800 px (imagens maiores também funcionam, só demoram mais para carregar).

**Opcional:** `titulos.json` para os nomes que aparecem no player:

```json
{ "humanas": "Tema da Cidadela", "03 Dirtmouth": "A vila" }
```

- Formatos: `.mp3` `.ogg` `.m4a`.
- Para repetir sem emenda, exporte cortado no ponto de loop.

## 7. HUD — `recursos/hud/`

O medidor de luz e as máscaras de vida do modo Jogo. Tudo opcional: sem estes arquivos, o HUD desenha o medidor e as gotas de vida a tinta.

| Arquivo | O que é |
|---|---|
| `hud/alma.png` | o medidor de luz das magias: escurecido quando vazio, ele se enche de baixo para cima com a luz. Uma imagem redonda com fundo transparente (o site acha o círculo sozinho) |
| `hud/mascara/cheia/1.png` | a máscara cheia, parada (sem ela, vale o 1º quadro de `brilho`) |
| `hud/mascara/brilho/1.png, 2.png…` | o brilho que passa pelas máscaras de vez em quando |
| `hud/mascara/cura/1.png, 2.png…` | a máscara se refazendo na cura |
| `hud/mascara/vazia/1.png` | a máscara vazia |
| `hud/mascara/quebrar/1.png, 2.png…` | a máscara quebrando quando o viajante leva dano (termina vazia) |

- Formatos: `.png` `.webp`, com fundo transparente.
- Todos os quadros na **mesma escala**, com a máscara **no meio da imagem**: o site desenha cada quadro centrado no lugar da máscara. Quadros maiores (como os de `quebrar`, com os cacos caindo) só precisam de mais espaço transparente em volta.
- O tamanho na tela sai da altura do quadro de referência (`cheia`, ou o 1º de `brilho`, ou `vazia`).
- Os quadros que estão aqui foram recortados da folha `fundos/PC _ Computer - Hollow Knight - UI - Masks.png`, e `alma.png` é uma cópia de `fundos/Soul_Meter.png`. As imagens originais continuam em `fundos/`.

---

## Testar no computador

O navegador só lê esta pasta com o site num servidor. Na pasta do projeto:

```bash
python -m http.server 8000
```

Depois abra http://localhost:8000. No GitHub Pages funciona direto.
