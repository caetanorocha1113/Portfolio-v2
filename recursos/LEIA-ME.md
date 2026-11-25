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

**Uma pasta por animação**, com os quadros numerados na ordem em que tocam. Todas as pastas já estão criadas no repositório (com um `.gitkeep` para o Git guardar a pasta vazia).

```
recursos/personagem/
  parado/   01.png 02.png 03.png …
  correr/   01.png 02.png …
  pular/    01.png …
  …
```

**Regras dos quadros:**

- PNG com **fundo transparente**.
- Numeração `01.png`, `02.png`, `03.png`… ou `1.png`, `2.png`, `3.png`… A contagem **para no primeiro número que faltar**: não pule números.
- O site encontra o desenho dentro de cada imagem e **alinha todos os quadros pelos pés** (a parte de baixo do desenho). Quadros recortados justos ou com sobra transparente funcionam igual.
- Personagem olhando para a **direita**. Se olhar para a esquerda, use `"olha_esquerda": true` no `ajustes.json`.
- Efeitos (pastas `efeito-…`) são desenhados **centralizados** no ponto do golpe ou do poder e devem apontar para a **direita**.
- Só a pasta `parado` é obrigatória. Pasta vazia ou faltando usa a animação da coluna "se faltar".

### Animações básicas

| Pasta | Quando toca | Repete? | Se faltar |
|---|---|---|---|
| `parado/` | sem andar | sim | — |
| `correr/` | andando | sim | parado |
| `pular/` | subindo no ar | sim | parado |
| `cair/` | descendo no ar | sim | pular |
| `golpe/` | ataque para frente | não | parado |
| `golpe-cima/` | ataque para cima (W + golpe) | não | golpe |
| `golpe-baixo/` | ataque para baixo no ar (S + golpe) | não | golpe |
| `avanco/` | avanço rápido | sim | correr |
| `dano/` | ao ser atingido | não | parado |
| `morte/` | ao perder todas as chamas | não | dano |
| `salto-duplo/` | segundo pulo no ar | não | pular |
| `pouso/` | ao tocar o chão e ao se preparar para pular | não | parado |
| `olhar-cima/` | parado segurando W | sim | parado |
| `olhar-baixo/` | parado segurando S | sim | parado |

### Animações dos poderes

Os poderes são liberados aos poucos (painel **Poderes**, tecla I). As pastas podem ser preenchidas antes.

| Pasta | Poder | Quando toca | Se faltar |
|---|---|---|---|
| `parede/` | Garras de Raiz | agarrado na parede, deslizando | cair |
| `salto-parede/` | Garras de Raiz | saltando da parede | pular |
| `carregar/` | Corrida de Âmbar | carregando a corrida | parado |
| `disparo/` | Corrida de Âmbar | durante a corrida longa | avanco |
| `passo-nevoa/` | Passo de Névoa | avanço que atravessa criaturas | avanco |
| `lancar/` | Faísca da Lanterna | lançando a faísca | golpe |
| `mergulho/` | Queda de Cinza | mergulhando para baixo | cair |
| `clarao/` | Clarão | explosão para cima | golpe-cima |
| `acender/` | Reacender | concentrando luz para se curar | parado |

### Efeitos (opcionais)

Substituem os efeitos de luz desenhados pelo site.

| Pasta | Onde aparece |
|---|---|
| `efeito-golpe/` | arco do golpe, à frente do personagem |
| `efeito-golpe-cima/`, `efeito-golpe-baixo/` | arcos para cima e para baixo (se faltarem, o `efeito-golpe` é girado) |
| `efeito-salto-duplo/` | no segundo pulo |
| `efeito-avanco/` | no início do avanço |
| `efeito-faisca/` | a faísca voando |
| `efeito-mergulho/` | o impacto do mergulho no chão |
| `efeito-clarao/` | a explosão para cima |
| `efeito-acender/` | o brilho da cura |
| `efeito-disparo/` | o rastro da corrida longa |
| `efeito-passo-nevoa/` | o rastro de névoa |

### Ajustes opcionais — `personagem/ajustes.json`

```json
{
  "tamanho": 1,
  "olha_esquerda": false,
  "pixel": false,
  "contorno": false,
  "lanterna": true,
  "fps": { "correr": 14, "golpe": 20 },
  "repetir": { "morte": false }
}
```

- `tamanho`: 1 = o desenho do `parado` com cerca de 84 px de altura numa tela de 1280 px.
- `altura_ref`: troca essa referência por uma altura fixa em px.
- `fps`: velocidade de cada animação, pelo nome da pasta.
- `repetir`: força uma animação a tocar uma vez (`false`) ou em loop (`true`).
- `pixel`: `true` para pixel art. `contorno`: `true` desenha a linha de tinta do site em volta.
- O arquivo precisa conter só o JSON. Se estiver quebrado, a Oficina mostra a linha do erro.

Os arquivos antigos `personagem.png` e `personagem.json`, se existirem, **não são mais lidos**.

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
