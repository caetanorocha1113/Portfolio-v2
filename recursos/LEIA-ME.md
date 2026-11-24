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

| Arquivo | Formato |
|---|---|
| `personagem.png` (ou `.webp`) | folha de sprites com fundo transparente |

**Como a folha precisa ser montada (sem configuração):**

- **7 linhas**, uma animação por linha, nesta ordem:

  | Linha | Animação | Quadros sugeridos |
  |---|---|---|
  | 1 | parado | 1 a 6 |
  | 2 | correr | 6 a 8 |
  | 3 | pular (subindo) | 2 a 3 |
  | 4 | cair (descendo) | 2 a 3 |
  | 5 | golpe | 3 a 5 |
  | 6 | avanço (dash) | 2 |
  | 7 | dano | 1 a 2 |

- **Quadros quadrados e todos do mesmo tamanho.** O lado do quadro é calculado como `altura da imagem ÷ 7`.
  Ex.: quadros de 128 px → imagem com 896 px de altura; largura = 128 × (maior número de quadros de uma linha).
- Os quadros de cada linha começam na **esquerda** e ficam colados. Quadros vazios no fim da linha são ignorados
  (o site conta sozinho quantos quadros cada linha tem). Uma linha toda vazia usa a animação "parado".
- Personagem olhando para a **direita**.
- **Pés encostados na borda de baixo do quadro, no centro.** É esse ponto que pisa no chão.
- Deixe 2 a 4 px de folga nas laterais de cada quadro.
- GIF animado não serve: precisa ser a grade em PNG.

**Opcional:** `personagem.json`, só se a folha fugir do padrão:

```json
{
  "quadro": [64, 80],
  "tamanho": 1,
  "olha_esquerda": false,
  "pixel": false,
  "contorno": false,
  "lanterna": true,
  "fps": { "parado": 6, "correr": 12, "pular": 8, "cair": 8, "golpe": 18, "avanco": 12, "dano": 8 },
  "animacoes": { "golpe": [4, 5, 20] }
}
```

- `quadro`: largura e altura do quadro em px (para quadros que não são quadrados).
- `tamanho`: 1 = cerca de 84 px de altura numa tela de 1280 px.
- `pixel`: `true` para pixel art (não borra).
- `contorno`: `true` desenha a linha de tinta tremida em volta, como no resto do site.
- `lanterna`: brilho de luz perto do personagem.
- `animacoes`: `[linha, quadros, fps]`, com a linha contando a partir de **0**. Use para reaproveitar linhas.

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
