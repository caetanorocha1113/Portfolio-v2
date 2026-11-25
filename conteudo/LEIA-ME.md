# Pasta `conteudo/`

Aqui fica o portfólio em si. O site lê [`portfolio.json`](portfolio.json) e monta tudo a partir dele: a abertura, o início, uma área por matéria, os cartões das atividades, o detalhe de cada atividade, Sobre e Contato.

> Os arquivos do jogo (personagem, inimigos, fontes, sons) ficam em `recursos/`. Os do portfólio (fotos, imagens e arquivos das atividades) ficam aqui.

## O que preencher

Tudo o que está entre colchetes, como `[e-mail]` ou `[ano / semestre]`, aparece destacado no site: é o que ainda falta. As atividades marcadas com `"exemplo": true` são só exemplos de formato e devem ser trocadas pelas reais.

## Uma atividade

```json
{
  "id": "projeto-1",
  "titulo": "Nome da atividade",
  "tipo": "projeto",
  "data": "2025-03",
  "resumo": "Uma frase que aparece no cartão.",
  "descricao": "Texto completo.\n\nUma linha em branco separa parágrafos.",
  "imagens": ["conteudo/atividades/projeto-1/capa.jpg"],
  "links": [{ "rotulo": "Ver arquivo", "url": "conteudo/atividades/projeto-1/arquivo.pdf" }],
  "tags": ["grupo", "pesquisa"],
  "destaque": true
}
```

- `tipo`: `projeto`, `trabalho`, `prova`, `apresentação` ou `outro`.
- `destaque`: aparece primeiro na área, com selo.
- A primeira imagem vira a capa do cartão. Sem imagem, o cartão ganha uma capa desenhada.
- Imagens também podem ter legenda: `{ "src": "conteudo/…/foto.jpg", "legenda": "…" }`.
- Cada atividade tem endereço próprio, por exemplo `#humanas/projeto-1`. Dá para mandar o link direto.
- Sugestão de pastas: `conteudo/imagens/` (foto) e `conteudo/atividades/<id>/` (imagens e arquivos de cada atividade).

## Áreas (matérias)

Cada área tem `id`, `materia`, `titulo_area` (o nome no mapa), `periodo`, `descricao`, `competencias`, `tema` e `atividades`. A ordem do arquivo é a ordem do mapa. O bloco `jogo` guarda o que o modo Jogo usa (texto de abertura da área, chefe, poder, músicas).

Temas disponíveis: `cinzaraiz`, `galerias`, `sendas`, `brejo`, `cidadela`, `minas`, `ninho`, `fosso`. Duas matérias podem usar o mesmo tema: a cor muda sozinha.

## Abertura

`abertura.falas` são os textos da abertura de cinema. `abertura.mostrar` pode ser `sempre`, `uma_vez_por_sessao` ou `nunca`.

## Compartilhamento

O título, a descrição e a imagem que aparecem quando alguém compartilha o link (WhatsApp, redes) estão no `<head>` do `index.html`, porque esses serviços não rodam JavaScript. Se mudar o nome do portfólio aqui, mude lá também. A imagem é [`compartilhar.png`](compartilhar.png) (1200 × 630).
