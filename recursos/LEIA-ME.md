# Pasta `recursos/`

Coloque aqui os seus arquivos com **exatamente** os nomes abaixo. O site carrega tudo sozinho ao abrir, sem configurar nada.
O que não estiver aqui continua com a versão original (arte, sons e músicas gerados pelo código).

> Não apague este `LEIA-ME.md`: o site procura por ele para saber que a pasta existe.
> Nomes sempre em minúsculas, sem acento e sem espaço.

Para conferir o que foi encontrado, abra o site, clique em **Oficina** e veja a seção **Pasta recursos/**:
✓ carregou · ainda não colocado · ✕ arquivo com problema.

---

## 1. Fontes — `recursos/fontes/`

| Arquivo | Onde aparece | Formatos aceitos |
|---|---|---|
| `titulo` | nome do reino, nomes das regiões, painel do canto, título da música | `.woff2` `.woff` `.ttf` `.otf` |
| `texto` | parágrafos, legendas, lista de faixas | `.woff2` `.woff` `.ttf` `.otf` |

Exemplo: `recursos/fontes/titulo.ttf`. Confira se a fonte tem acentos (Â, ã, ç).

## 2. Personagem — `recursos/personagem/`

O site aceita **quatro formatos**. Use só um deles.

### Formato A · Folha empacotada + coordenadas (o da sua folha atual)

| Arquivo | O que é |
|---|---|
| `personagem.png` (ou `.webp`) | a folha empacotada, do jeito que está (quadros de tamanhos diferentes, alguns girados) |
| `personagem.json` | as coordenadas de cada quadro, no formato **JSON do TexturePacker** (Hash ou Array) ou **JSON do Aseprite** |

- O site lê `frame`, `rotated` (quadro girado 90°), `trimmed` / `spriteSourceSize` / `sourceSize` (quadro recortado) e `pivot` (ponto que pisa no chão).
- **Sem `personagem.json`, uma folha empacotada não é usada** (a Oficina mostra ✕ e a Lume continua no lugar).
- O `personagem.json` não vem pronto: ele é gerado por um programa de atlas (TexturePacker, Free Texture Packer, Aseprite…). Para uma folha que já está empacotada, primeiro separe os quadros com uma ferramenta de "sprite unpacker / extract sprites" e depois reempacote, ou use o Formato C.

**Como o site sabe qual quadro é de qual animação** (escolha um):

1. **Pelo nome do quadro.** Nomeie os quadros com o nome da animação + número: `parado-01`, `correr-03`, `golpe-cima-02`, `efeito-golpe-01`… (hífen, sublinhado ou nada antes do número; extensão é ignorada).
2. **Pelas tags do Aseprite** (`meta.frameTags`), com os nomes da tabela abaixo.
3. **Por uma lista no próprio `personagem.json`**, quando os nomes não seguem o padrão:

```json
{
  "frames": { "...": "gerado pelo programa de atlas" },
  "meta":   { "...": "gerado pelo programa de atlas" },

  "animacoes": {
    "parado": ["idle_0", "idle_1", "idle_2"],
    "correr": "run_",
    "golpe":  { "quadros": ["slash_0", "slash_1", "slash_2"], "fps": 20 },
    "pouso":  { "prefixo": "land", "repetir": false }
  },
  "tamanho": 1,
  "altura_ref": 128,
  "fps": { "correr": 14 },
  "olha_esquerda": false,
  "pixel": false,
  "contorno": false,
  "lanterna": true
}
```

- Lista de nomes → esses quadros, nessa ordem. Texto → todos os quadros que começam com ele, em ordem numérica.
- `altura_ref`: altura (px) que corresponde a `tamanho` 1 (~84 px numa tela de 1280). Padrão: altura do 1º quadro de `parado`.

### Formato B · Grade (qualquer número de linhas)

Para folhas com **células de tamanho fixo** (cada quadro dentro da sua célula, sem invadir a vizinha).

- **Sem `personagem.json`:** 7 linhas na ordem parado, correr, pular, cair, golpe, avanço, dano, quadros quadrados (lado = altura ÷ 7).
- **Com `personagem.json`:** quantas linhas quiser, em qualquer ordem, e todas as animações da tabela abaixo:

```json
{
  "quadro": [96, 96],
  "animacoes": {
    "parado":      [1, 9],
    "correr":      [2, 12, 14],
    "golpe":       [5, 6, 20, 1],
    "golpe-cima":  [5, 5, 20, 7]
  }
}
```

Cada animação é `[linha, quadros, fps, coluna]`, **contando a partir de 1**; `fps` e `coluna` são opcionais.
No exemplo, `golpe` usa os quadros 1–6 da linha 5 e `golpe-cima` usa os quadros 7–11 da mesma linha.

Se alguma figura atravessar a borda das células, o site recusa a grade (✕ na Oficina) e sugere o Formato D.

### Formato C · Quadros soltos numerados (o mais simples)

Um PNG por quadro, com o nome da animação + número de 2 dígitos, começando em `01`:

```
personagem/parado-01.png  parado-02.png  parado-03.png
personagem/correr-01.png  …  correr-08.png
personagem/golpe-cima-01.png …
personagem/efeito-golpe-01.png …
```

Salve todos os quadros com o **mesmo tamanho de tela** e o personagem **com os pés na borda de baixo, no centro**.
Opcional `personagem.json` com `tamanho`, `altura_ref`, `fps`, `olha_esquerda`, `pixel`, `contorno`, `lanterna`.

### Formato D · Fileiras (folha organizada em fileiras, espaçamento livre)

Para folhas em que os quadros estão **em fileiras, mas com espaçamentos e tamanhos diferentes**. O site encontra cada figura sozinho pelo fundo transparente e numera: fileiras de cima para baixo, quadros da esquerda para a direita.

1. Coloque a folha em `personagem/personagem.png` (fundo **transparente**).
2. Crie `personagem/personagem.json` com `"modo": "fileiras"`. O botão **Copiar modelo do JSON** (Oficina → Pasta recursos/) copia um modelo com todas as animações.
3. Abra **Oficina → Pasta recursos/ → Ver numeração da folha**. Cada figura aparece com a etiqueta `fileira·quadro`.
4. Preencha no JSON qual fileira e quais quadros formam cada animação:

```json
{
  "modo": "fileiras",
  "tamanho": 1,
  "juntar": 4,
  "animacoes": {
    "parado":       { "fileira": 1, "de": 1, "quantidade": 9 },
    "correr":       { "fileira": 2, "de": 1, "quantidade": 12, "fps": 14 },
    "golpe":        [4, 1, 5],
    "salto-duplo":  { "quadros": [[6, 3], [6, 4], [7, 1]] },
    "pouso":        { "fileira": 3, "de": 8, "quantidade": 4, "inverter": true }
  }
}
```

- O arquivo precisa conter **só o JSON**: sem ``` nem textos copiados de chat. Se sobrar algo, o site ignora e avisa na Oficina; se o JSON estiver quebrado, a Oficina mostra a linha do erro.
- `fileira`, `de` (primeiro quadro) e `quantidade` contam **a partir de 1**. A forma curta é `[fileira, de, quantidade, fps]`.
- `quadros`: lista de `[fileira, quadro]` para montar uma animação com quadros de fileiras diferentes.
- `inverter: true` toca os quadros de trás para frente. `repetir: false/true` força tocar uma vez ou em loop.
- Animações com `fileira: 0` ou `quantidade: 0` são ignoradas (é assim que o modelo vem).
- Quadros que não aparecem em nenhuma animação (ícones, objetos soltos) são simplesmente ignorados.
- O ponto que pisa no chão é calculado sozinho: o centro da parte de baixo de cada figura.

**Se a numeração sair errada:**

| Problema | Ajuste no JSON |
|---|---|
| Uma figura se partiu em duas (ex.: uma espada separada do corpo) | aumente `"juntar"` (padrão 4 px) |
| Duas figuras vizinhas viraram uma só | diminua `"juntar"` (pode ser 0) |
| Poeira ou pontinhos viraram "quadros" | aumente `"minimo"` (padrão 40 pixels) |
| Bordas semitransparentes somem ou sobram | ajuste `"limiar"` (padrão 16, de 0 a 255) |
| Personagem grande ou pequeno demais | `"tamanho"` ou `"altura_ref"` |

### Animações que o site usa

Só `parado` é obrigatória. As que faltarem usam a da coluna "se faltar".

| Nome | Quando toca | Repete? | Se faltar |
|---|---|---|---|
| `parado` | sem andar | sim | — |
| `correr` | andando | sim | parado |
| `pular` | subindo no ar | sim | parado |
| `cair` | descendo no ar | sim | pular |
| `golpe` | ataque para frente | não | parado |
| `golpe-cima` | ataque para cima (W + golpe) | não | golpe |
| `golpe-baixo` | ataque para baixo no ar (S + golpe) | não | golpe |
| `avanco` | avanço rápido | sim | correr |
| `dano` | ao ser atingido | não | parado |
| `morte` | ao perder todas as chamas | não | dano |
| `salto-duplo` | segundo pulo no ar | não | pular |
| `pouso` | ao tocar o chão e ao se preparar para pular | não | parado |
| `olhar-cima` | parado segurando W | sim | parado |
| `olhar-baixo` | parado segurando S | sim | parado |

**Efeitos (opcionais, desenhados centralizados):** substituem os efeitos de luz do site.

| Nome | Onde aparece |
|---|---|
| `efeito-golpe` | arco do golpe, à frente do personagem |
| `efeito-golpe-cima` / `efeito-golpe-baixo` | arcos para cima e para baixo (se faltarem, o `efeito-golpe` é girado) |
| `efeito-salto-duplo` | no segundo pulo |
| `efeito-avanco` | no início do avanço |

Regras de desenho para qualquer formato: personagem olhando para a **direita**; pés na base do quadro (ou use `pivot`); efeitos apontando para a **direita**.

## 3. Inimigos — `recursos/inimigos/`

| Arquivo | Criatura | Onde aparece |
|---|---|---|
| `besouro.png` | rastejante que patrulha o chão | Cinzaraiz, Galerias, Sendas, Minas |
| `mosca.png` | voadora que persegue no modo Jogar | quase todas as regiões |
| `saltador.png` | pula enquanto anda | Brejo dos Esporos |
| `aranha.png` | patrulha rápida | Ninho das Mil Patas |
| `sentinela.png` | alta, anda devagar | Cidadela da Chuva |
| `pendente.png` | desce do teto por um fio | Ninho das Mil Patas |
| `agua-viva.png` | flutua, não causa dano | O Fosso Sem Luz |

**Como cada folha precisa ser (sem configuração):**

- **Uma linha só** com a animação de andar/voar.
- **Quadros quadrados**: o lado do quadro é a **altura da imagem**. Ex.: 4 quadros de 64 px → imagem 256 × 64.
- Olhando para a **direita**. Quem anda: pés na base do quadro. Quem voa: centralizado.
- Tamanho 1 = cerca de 48 px de altura numa tela de 1280 px.

**Opcional:** `nome.json` ao lado (ex.: `mosca.json`):

```json
{ "quadro": [40, 40], "quadros": 2, "fps": 14, "tamanho": 0.9, "olha_esquerda": false, "pixel": false, "contorno": false }
```

## 4. Fundos das regiões — `recursos/fundos/`

| Arquivo | Região |
|---|---|
| `cinzaraiz` | I · a vila da superfície |
| `galerias` | II · Galerias de Âmbar |
| `sendas` | III · Sendas do Musgo |
| `brejo` | IV · Brejo dos Esporos |
| `cidadela` | V · Cidadela da Chuva Eterna |
| `minas` | VI · Minas de Quartzo-Rosa |
| `ninho` | VII · Ninho das Mil Patas |
| `fosso` | VIII · O Fosso Sem Luz |

- Formatos: `.jpg` `.png` `.webp`.
- Tamanho sugerido: **2400 × 2200 px** (a camada é um pouco mais alta que larga).
- Vai para a camada de **fundo** (a mais distante). O chão, as fendas e as plataformas continuam no lugar.
- O chão da região fica a cerca de **80% da altura** da imagem. Se a sua imagem tiver chão desenhado, ponha nessa altura.

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
| `cinzaraiz` `galerias` `sendas` `brejo` `cidadela` `minas` `ninho` `fosso` | na região de mesmo nome (troca sozinha ao descer) |
| `extra-1` … `extra-5` | só na lista do player |

- Formatos: `.mp3` `.ogg` `.m4a`.
- Para repetir sem emenda, exporte cortado no ponto de loop.

**Opcional:** `titulos.json` para os nomes que aparecem no player:

```json
{ "cinzaraiz": "Tema da vila", "extra-1": "Créditos" }
```

---

## Testar no computador

O navegador só lê esta pasta com o site num servidor. Na pasta do projeto:

```bash
python -m http.server 8000
```

Depois abra http://localhost:8000. No GitHub Pages funciona direto.
