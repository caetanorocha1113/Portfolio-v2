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

| Pasta | Poder | Quando toca | Se faltar |
|---|---|---|---|
| `wall-slide/` | Escalar paredes | agarrado na parede, deslizando | fall |
| `wall-jump/` | Escalar paredes | saltando da parede | jump |
| `superdash-charge/` | Super avanço | carregando | idle |
| `superdash/` | Super avanço | durante a corrida longa | dash |
| `shadow-dash/` | Avanço sombrio | avanço que atravessa criaturas | dash |
| `spell/` | Magia para frente | lançando o projétil | attack |
| `dive/` | Magia para baixo | mergulhando | fall |
| `spell-up/` | Magia para cima | soltando a explosão para cima | attack-up |
| `heal/` | Cura | concentrando para se curar | idle |

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
