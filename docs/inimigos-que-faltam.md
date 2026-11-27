# Inimigos que faltam

Lista do que o mapa ainda precisa, área por área. Cada linha diz o **papel** do inimigo no jogo, o **comportamento** (o valor de `comportamento` em `recursos/inimigos/inimigos.json`) e as **animações** (as subpastas de quadros). Pode usar os sprites que quiser: o site acerta a escala sozinho pelos quadros do personagem.

Depois de pôr a pasta em `recursos/inimigos/`, acrescente uma entrada no `inimigos.json` (o formato e a lista de comportamentos estão em `recursos/LEIA-ME.md`). A Oficina → Pasta recursos/ mostra se deu certo.

## O que já existe

| Área | Inimigos |
|---|---|
| Início | Crawlid ×2 |
| Humanas | Husk Dandy ×2, Crawlid ×1, Husk Sentry ×1, Lance Sentry ×1, Vengefly ×1 |
| Matemática | Crystal Crawler ×2, Squit ×2, Crystallised Husk ×1, Husk Miner ×1 |
| Linguagens | Crawlid ×2, Gruzzer ×2, Aspid Hatchling ×2, Dirtcaver ×1, Elder Baldur ×1, Sporg ×1 |
| Natureza | Mosskin ×2, Moss Charger ×1, Durandoo ×1, Fungoon ×1, Shrumal Ogre ×1, Shrumal Warrior ×1, Belfly ×1 |
| Técnico | Little Weaver ×2, Aspid Hunter ×1, Aspid Mother ×1, Mantis Youth ×1, Mantis Warrior ×1, Great Husk Sentry ×1 |
| Trajetória | Husk Hornhead ×2, Durandoo ×2, Shrumal Warrior ×2, Fungoon ×1, Sporg ×1 |
| Sobre e contato | Uoma ×4 (não machucam) |

Da lista anterior, já entraram: o andarilho da cidade (Husk Dandy), o guarda de Humanas (Husk Sentry), o voador de Matemática (Squit), o cuspidor de Linguagens (Sporg), o inimigo que investe na Trajetória (Husk Hornhead) e a criatura calma do fim (Uoma).

## Para acrescentar

| # | Área | Papel | `comportamento` | Animações (subpastas) | Dificuldade |
|---|---|---|---|---|---|
| 1 | Matemática | criatura pendurada no teto que cai quando o jogador passa | `teto` | `parado`, `preparar`, `atacar`, `morrer` (e `explodir`, se explodir ao bater) | fácil |
| 2 | Início | uma segunda criatura fácil, para a vila não ter só Crawlids | `andar` ou `vagar` | `andar`, `virar`, `morrer` | fácil |
| 3 | Sobre e contato | um segundo tipo calmo, que só voa (com `"dano": false`) | `flutuar` ou `quicar` | `andar` | nenhuma |

## Depois (precisa de código novo)

Cada matéria tem um **Guardião** no plano (`jogo.chefe` em `conteudo/portfolio.json`). Chefes ainda não existem no motor: quando quiser, mande os sprites (de preferência com duas formas de ataque e uma animação de "cansado") que eu programo a luta.
