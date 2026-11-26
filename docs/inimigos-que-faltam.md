# Inimigos que faltam

Lista do que o mapa ainda precisa, área por área. Cada linha diz o **papel** do inimigo no jogo, o **comportamento** (o valor de `comportamento` em `recursos/inimigos/inimigos.json`) e as **animações** (as subpastas de quadros). Pode usar os sprites que quiser: o site acerta a escala sozinho pelos quadros do personagem.

Depois de pôr a pasta em `recursos/inimigos/`, acrescente uma entrada no `inimigos.json` (o formato está em `recursos/LEIA-ME.md`). A Oficina → Pasta recursos/ mostra se deu certo.

## O que já existe (para comparar)

| Área | Inimigos |
|---|---|
| Início | Crawlid ×2 |
| Humanas | Crawlid ×2, Lance Sentry ×1, Vengefly ×2 |
| Matemática | Crystal Crawler ×2, Crystallised Husk ×1, Husk Miner ×1 |
| Linguagens | Crawlid ×2, Gruzzer ×2, Aspid Hatchling ×2, Dirtcaver ×1, Elder Baldur ×1 |
| Natureza | Mosskin ×2, Moss Charger ×1, Durandoo ×1, Fungoon ×1, Shrumal Ogre ×1, Shrumal Warrior ×1, Belfly ×1 |
| Técnico | Little Weaver ×2, Aspid Hunter ×1, Aspid Mother ×1, Mantis Youth ×1, Mantis Warrior ×1, Great Husk Sentry ×1 |
| Trajetória | Fungoon ×1, Shrumal Warrior ×2, Durandoo ×2 |
| Sobre e contato | só as águas-vivas desenhadas pelo site |

## Para acrescentar

| # | Área | Papel | `comportamento` | Animações (subpastas) | Dificuldade |
|---|---|---|---|---|---|
| 1 | Humanas | andarilho da cidade, o primeiro inimigo "de verdade" depois da vila | `andar` | `andar`, `virar`, `morrer` | fácil (2 golpes) |
| 2 | Humanas | guarda que investe, no lugar do Great Husk Sentry | `investir` | `andar`, `virar`, `alerta`, `preparar`, `atacar`, `recuperar`, `morrer` | média (3 golpes) |
| 3 | Matemática | voador que persegue, para a mina não ser só chão | `perseguir` | `andar` (voo), `virar`, `alerta`, `morrer` | fácil |
| 4 | Matemática | criatura pendurada no teto que cai quando o jogador passa | `teto` | `parado`, `preparar`, `atacar`, `morrer` | fácil |
| 5 | Linguagens | cuspidor no chão, que atira de longe | `atirar` | `parado`, `preparar`, `atacar`, `morrer`, `projetil` | média |
| 6 | Trajetória | inimigo que investe, para variar dos que pulam | `investir` | `andar`, `preparar`, `atacar`, `recuperar`, `morrer` | média |
| 7 | Sobre e contato | criatura calma que só flutua (com `"dano": false`), para o fim ficar tranquilo | `flutuar` | `andar`, `morrer` | nenhuma |

## Depois (precisa de código novo)

Cada matéria tem um **Guardião** no plano (`jogo.chefe` em `conteudo/portfolio.json`). Chefes ainda não existem no motor: quando quiser, mande os sprites (de preferência com duas formas de ataque e uma animação de "cansado") que eu programo a luta.
