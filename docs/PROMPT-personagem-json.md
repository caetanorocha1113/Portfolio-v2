# Prompt: montar o `personagem.json` do Velumbra

Este arquivo tem duas partes:

1. **Antes de usar o prompt**: o que preparar no site.
2. **O prompt**: copie tudo o que está entre as linhas `---` e cole numa IA que aceite imagens, junto com a imagem numerada da sua folha.

## Antes de usar o prompt

1. Coloque a folha que você quer usar em `recursos/personagem/personagem.png` (fundo transparente).
2. Crie `recursos/personagem/personagem.json` só com isto e salve:

   ```json
   { "modo": "figuras", "juntar": 4, "animacoes": {} }
   ```

3. Rode o site (`python -m http.server 8000`) e abra **Oficina → Pasta recursos/ → Ver numeração da folha → Numerar figuras**.
4. Confira a numeração **antes** de montar as animações:
   - uma figura partida em duas (ex.: uma lâmina separada do corpo) → aumente `"juntar"`;
   - duas figuras vizinhas com um número só → diminua `"juntar"` (pode ser 0);
   - pontinhos soltos ganhando número → acrescente `"minimo": 80`.

   Os números mudam quando esses valores mudam. Defina `juntar` e `minimo` primeiro e só depois monte as animações.
5. Tire capturas da tela de numeração. Em folhas grandes, mande em pedaços com zoom, para os números ficarem legíveis.

---

Você vai me ajudar a montar o arquivo `personagem.json` de um site chamado **Velumbra**.

## O conceito

- Velumbra é um site-conceito com visual desenhado à mão: rolar a página é descer por oito regiões de um reino subterrâneo.
- O site tem dois modos: **Passeio**, em que o personagem anda sozinho pelo cenário, e **Jogar**, um jogo de plataforma 2D controlado pelo teclado ou por toque.
- O personagem é desenhado a partir de uma folha de sprites (`personagem.png`). O site encontra sozinho cada figura da folha pelo fundo transparente e dá **um número a cada uma**, em ordem de leitura: de cima para baixo e, na mesma altura, da esquerda para a direita.
- O `personagem.json` diz ao site **quais números formam cada animação, e em que ordem**.
- O jogo tem **poderes que são liberados aos poucos**, conforme forem construídos. Os bloqueados ainda não funcionam, mas as animações deles **já podem** ser listadas no JSON, para ficarem prontas.

## O que estou te enviando

Capturas da tela "Numeração da folha": cada figura da folha aparece dentro de uma caixa com um número.

## Sua tarefa

1. Olhe as figuras numeradas e identifique, pelo desenho, quais formam cada animação da lista abaixo.
2. Para cada animação, escreva os números **na ordem em que os quadros devem tocar**.
3. Se não houver figuras para uma animação, deixe a lista vazia (`[]`). Só `parado` é obrigatória; as outras usam uma animação parecida quando faltam.
4. Se uma figura estiver **deitada** na folha, indique o giro:
   - `"horario"`: a figura foi girada no sentido horário (a cabeça aponta para a **direita** na folha);
   - `"anti-horario"`: girada no sentido anti-horário (a cabeça aponta para a **esquerda**).
5. Ignore figuras que não são quadros de animação (ícones, objetos soltos, partes da interface).
6. Se não tiver certeza de algum número, diga numa linha **depois** do JSON, em vez de inventar.

## Animações básicas

| Nome no JSON | Quando toca |
|---|---|
| `parado` | sem andar (em loop) |
| `correr` | andando (em loop) |
| `pular` | subindo no ar |
| `cair` | descendo no ar |
| `golpe` | ataque para frente (toca uma vez) |
| `golpe-cima` | ataque para cima |
| `golpe-baixo` | ataque para baixo, no ar |
| `avanco` | avanço rápido |
| `dano` | ao ser atingido |
| `morte` | ao perder toda a vida |
| `salto-duplo` | segundo pulo no ar |
| `pouso` | ao tocar o chão |
| `olhar-cima` | parado olhando para cima |
| `olhar-baixo` | parado olhando para baixo |

## Animações dos poderes (alguns ainda bloqueados no jogo)

| Nome no JSON | Poder | Quando toca |
|---|---|---|
| `parede` | Garras de Raiz | agarrado na parede, deslizando |
| `salto-parede` | Garras de Raiz | saltando da parede |
| `carregar` | Corrida de Âmbar | carregando antes de disparar (em loop) |
| `disparo` | Corrida de Âmbar | durante a corrida longa (em loop) |
| `passo-nevoa` | Passo de Névoa | avanço que atravessa criaturas |
| `lancar` | Faísca da Lanterna | lançando a faísca para frente |
| `mergulho` | Queda de Cinza | mergulhando para baixo |
| `clarao` | Clarão | soltando a explosão para cima |
| `acender` | Reacender | concentrando luz para se curar (em loop) |

## Efeitos (desenhados separados do corpo, centralizados)

| Nome no JSON | Onde aparece |
|---|---|
| `efeito-golpe`, `efeito-golpe-cima`, `efeito-golpe-baixo` | arco do golpe em cada direção |
| `efeito-salto-duplo` | no segundo pulo |
| `efeito-avanco` | no início do avanço |
| `efeito-faisca` | a faísca voando |
| `efeito-mergulho` | o impacto do mergulho no chão |
| `efeito-clarao` | a explosão para cima |
| `efeito-acender` | o brilho da cura |
| `efeito-disparo` | o rastro da corrida longa |
| `efeito-passo-nevoa` | o rastro de névoa |

## Formato do arquivo (regras obrigatórias)

- Responda com **JSON puro**: nada antes do `{` e nada depois do `}`. Sem blocos de código com crases, sem comentários, sem marcações de citação.
- Os números são inteiros e contam a partir de 1, exatamente como na imagem.
- Mantenha no topo `"modo": "figuras"` e os mesmos valores de `"juntar"` (e `"minimo"`, se houver) que eu usei para gerar a numeração.
- Cada animação pode ser escrita de quatro jeitos:
  - lista simples: `"parado": [12, 13, 14, 15]`;
  - objeto com opções: `"correr": { "quadros": [20, 21, 22, 23], "fps": 14 }`;
  - faixa contínua: `"pular": { "de": 30, "ate": 33 }`;
  - giro por figura: `"golpe": { "quadros": [[40, "horario"], [41, "horario"], 42] }`.
- Opções de cada animação: `fps` (velocidade), `girada` (`"horario"` ou `"anti-horario"` para todas as figuras dela), `inverter` (`true` toca de trás para frente), `repetir` (`true` ou `false` força loop ou uma vez só).
- Opções gerais no topo: `"tamanho"` (1 = cerca de 84 px de altura numa tela de 1280 px), `"olha_esquerda"` (`true` se o personagem olha para a esquerda na folha), `"pixel"` (`true` para pixel art), `"contorno"` (`true` desenha uma linha de tinta em volta).

## Exemplo

Os números abaixo são só ilustrativos. Use os números da imagem que te enviei.

```json
{
  "modo": "figuras",
  "juntar": 4,
  "tamanho": 1,
  "olha_esquerda": false,
  "animacoes": {
    "parado": [1, 2, 3, 4, 5, 6],
    "correr": { "quadros": [7, 8, 9, 10, 11, 12, 13, 14], "fps": 14 },
    "pular": { "de": 15, "ate": 17 },
    "cair": [18, 19, 20],
    "golpe": { "quadros": [21, 22, 23, 24], "fps": 20 },
    "golpe-cima": { "quadros": [[25, "horario"], [26, "horario"], [27, "horario"]] },
    "golpe-baixo": [],
    "avanco": [28, 29, 30],
    "dano": [31],
    "morte": { "quadros": [32, 33, 34, 35, 36], "repetir": false },
    "salto-duplo": [37, 38, 39],
    "pouso": [40, 41],
    "olhar-cima": [42],
    "olhar-baixo": [43],
    "parede": [44, 45],
    "salto-parede": [46, 47],
    "carregar": [],
    "disparo": [],
    "passo-nevoa": [],
    "lancar": [48, 49, 50],
    "mergulho": [51, 52],
    "clarao": [53, 54, 55],
    "acender": { "quadros": [56, 57, 58, 59], "fps": 10 },
    "efeito-golpe": [60, 61, 62],
    "efeito-golpe-cima": [],
    "efeito-golpe-baixo": [],
    "efeito-salto-duplo": [63, 64],
    "efeito-avanco": [],
    "efeito-faisca": { "quadros": [65, 66, 67, 68], "fps": 16 },
    "efeito-mergulho": [],
    "efeito-clarao": [],
    "efeito-acender": [],
    "efeito-disparo": [],
    "efeito-passo-nevoa": []
  }
}
```

---

## Depois de receber o JSON

1. Salve a resposta como `recursos/personagem/personagem.json`. Confira se o arquivo começa em `{` e termina em `}`.
2. Recarregue o site e abra **Oficina → Pasta recursos/**:
   - ✓ mostra quantas figuras foram encontradas e quantos quadros entraram em cada animação;
   - ✕ aponta figuras que não existem ou erros no JSON, com a linha do erro.
3. Teste no modo **Jogar**. Se uma animação ficar na ordem errada, de cabeça para baixo ou grande ou pequena demais, ajuste a lista, o `girada` ou o `tamanho`.
4. O painel **Poderes** (tecla I) mostra quais poderes já estão liberados.
