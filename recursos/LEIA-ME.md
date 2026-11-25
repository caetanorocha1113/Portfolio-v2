# Pasta `recursos/`

Coloque aqui os seus arquivos com **exatamente** os nomes abaixo. O site carrega tudo sozinho ao abrir, sem configurar nada.

> Não apague este `LEIA-ME.md`: o site procura por ele para saber que a pasta existe.
> Nomes sempre em minúsculas, sem acento e sem espaço.

Para conferir o que foi encontrado, abra o site, clique em **Oficina** e veja a seção **Pasta recursos/**:
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
- O arquivo precisa conter só o JSON. Se estiver quebrado, a Oficina mostra a linha do erro.

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
| `nome` | nome que aparece na Oficina | a pasta |
| `pasta` | pasta dentro de `recursos/inimigos/` | obrigatório |
| `comportamento` | um da tabela abaixo | `andar` |
| `regioes` | área (ou tema) → quantidade (até 12 por área) | obrigatório |
| `animacoes` | papel → subpasta (veja abaixo) | precisa de `andar` ou `parado` |
| `vida` | golpes para derrotar | 3 |
| `velocidade` | 1 = normal; 2 = o dobro | 1 |
| `tamanho` | multiplicador de tamanho | 1 |
| `olha_esquerda` | `true` se os quadros olham para a esquerda | `false` |
| `fps` | velocidade das animações (número ou `{ "andar": 12, "morrer": 10 }`) | 10 |
| `dano` | `false` = não machuca ao encostar | `true` |
| `altura_voo` | altura em px dos voadores acima do chão | 170 |
| `recarga` | segundos entre tiros (`atirar`) | 2.2 |
| `substituir` | `true` tira as criaturas desenhadas das áreas em que este inimigo aparece | `substituir_originais` |

**Onde aparece (`regioes`):** aceita três jeitos, que podem ser misturados:

- o **id da área** em `conteudo/portfolio.json`: `inicio`, `humanas`, `matematica`, `linguagens`, `natureza`, `tecnico`, `sobre`;
- o **nome do tema**: `cinzaraiz`, `galerias`, `sendas`, `brejo`, `cidadela`, `minas`, `ninho`, `fosso` (vale para todas as áreas com esse tema);
- o **número da seção** no mapa (1 = início).

O comportamento `teto` só funciona em temas com teto (todos menos `cinzaraiz`).

**Comportamentos:**

| Nome | Movimento |
|---|---|
| `andar` | anda no chão de um lado para o outro e vira nas pontas |
| `pular` | anda pulando |
| `investir` | anda e, quando o jogador chega perto, avança rápido na direção dele |
| `atirar` | fica de olho no jogador e atira projéteis na direção dele (no chão; com `altura_voo`, voando) |
| `parado` | fica no lugar, só animando |
| `voar` | voa de um lado para o outro, oscilando |
| `perseguir` | voa e persegue o jogador quando ele chega perto |
| `flutuar` | flutua devagar no meio da área |
| `teto` | desce e sobe do teto por um fio |

**Papéis das animações** (`animacoes`):

| Papel | Quando toca |
|---|---|
| `andar` | movimento normal (para voadores, o voo) |
| `parado` | comportamento `parado`, ou no lugar de `andar` se ela faltar |
| `virar` | uma vez, quando muda de direção |
| `atacar` | uma vez, ao investir ou atirar |
| `morrer` | uma vez, ao ser derrotado (depois some e volta em 22 s) |
| `projetil` | o tiro do comportamento `atirar` (sem ela, uma bolinha simples) |

- O tamanho na tela usa a **mesma escala de pixels do seu personagem**: se os quadros vieram do mesmo jogo, as proporções entre personagem e inimigos ficam certas. Use `tamanho` só para ajustar.
- Os quadros são alinhados pelos pés (voadores: pelo centro).
- A Oficina → Pasta recursos/ mostra cada inimigo com ✓ (onde foi colocado e quantos quadros cada animação tem) ou ✕ (pasta, subpasta, área ou comportamento errados).

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
- Tamanho sugerido: **2400 × 2200 px** (a camada é um pouco mais alta que larga).
- Vai para a camada de **fundo** (a mais distante) da faixa de cenário na parte de baixo da área. O chão, as fendas e as plataformas continuam no lugar.
- O chão da área fica a cerca de **80% da altura** da imagem. Se a sua imagem tiver chão desenhado, ponha nessa altura.

**Opcional:** `ajustes.json`:

```json
{ "cidadela": { "modo": "sobrepor", "opacidade": 0.6, "encaixe": "cobrir", "sujeira": true } }
```

- `modo`: `substituir` (padrão) troca o fundo pintado; `sobrepor` mistura por cima.
- `encaixe`: `cobrir` (padrão) ou `conter`.
- `sujeira`: `false` tira o grão de papel velho por cima.

## 5. Efeitos sonoros — `recursos/sons/`

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

- Formatos: `.ogg` `.mp3` `.wav`.
- Corte o silêncio do começo. `passo` e `golpe` tocam muito: deixe-os com menos de 0,3 s.

## 6. Músicas — `recursos/musicas/`

| Arquivo | Toca em |
|---|---|
| id da área (`humanas`, `matematica`…) | naquela área |
| nome do tema (`cinzaraiz` … `fosso`) | nas áreas com aquele tema |
| `extra-1` … `extra-5` | só na lista do player |

No Passeio, a música é uma playlist: toca em sequência e não troca sozinha (a não ser que o alfinete "acompanhar área" do player esteja ligado). No modo Jogo, as músicas de cada área serão as do bloco `jogo` de `conteudo/portfolio.json`.

- Formatos: `.mp3` `.ogg` `.m4a`.
- Para repetir sem emenda, exporte cortado no ponto de loop.

**Opcional:** `titulos.json` para os nomes que aparecem no player:

```json
{ "humanas": "Tema da Cidadela", "extra-1": "Créditos" }
```

---

## Testar no computador

O navegador só lê esta pasta com o site num servidor. Na pasta do projeto:

```bash
python -m http.server 8000
```

Depois abra http://localhost:8000. No GitHub Pages funciona direto.
