# Pasta `conteudo/`

Aqui fica o portfólio em si. O site lê [`portfolio.json`](portfolio.json) e monta tudo a partir dele: a abertura, o início, uma área por matéria (resumida, com o registro completo ao abrir), a lista das atividades, o detalhe de cada atividade, Sobre e Contato.

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
  "resumo": "Uma frase: aparece na lista da área ao passar o mouse e inteira com o registro aberto.",
  "descricao": "Texto completo.\n\nUma linha em branco separa parágrafos.",
  "imagens": ["conteudo/atividades/projeto-1/capa.jpg"],
  "links": [{ "rotulo": "Ver arquivo", "url": "conteudo/atividades/projeto-1/arquivo.pdf" }],
  "tags": ["grupo", "pesquisa"],
  "destaque": true
}
```

- `tipo`: `projeto`, `trabalho`, `prova`, `apresentação` ou `outro`.
- `destaque`: aparece primeiro na área, com selo.
- A primeira imagem vira a miniatura da atividade na lista da área (e aparece no detalhe). Sem imagem, a miniatura ganha o desenho do tipo.
- Imagens também podem ter legenda: `{ "src": "conteudo/…/foto.jpg", "legenda": "…" }`.
- Cada atividade tem endereço próprio, por exemplo `#humanas/projeto-1`. Dá para mandar o link direto.
- Sugestão de pastas: `conteudo/imagens/` (foto) e `conteudo/atividades/<id>/` (imagens e arquivos de cada atividade).

## Áreas (matérias)

Cada área tem `id`, `materia`, `titulo_area` (o nome no mapa), `periodo`, `descricao`, `competencias`, `tema` e `atividades`. A ordem do arquivo é a ordem do mapa.

Cada área aparece **resumida**: o nome, a primeira frase de `descricao`, a contagem de atividades, competências e destaques, e a lista curta das atividades (até `site.atividades_visiveis`; as outras aparecem como "+ N atividades"). O botão **Abrir registro** mostra a descrição inteira, as competências e o resumo e a miniatura de cada atividade. Clicar numa atividade abre o detalhe completo. Em Sobre, o primeiro parágrafo aparece e o resto abre com **Ler tudo**. O bloco `jogo` guarda o que o modo Jogo usa (texto de abertura da área, chefe, poder, músicas).

Temas disponíveis: `cinzaraiz`, `galerias`, `sendas`, `brejo`, `cidadela`, `minas`, `ninho`, `fosso`. Duas matérias podem usar o mesmo tema: a cor muda sozinha.

## Trajetória (opcional)

O bloco `trajetoria` cria uma área a mais no mapa, depois das matérias: a estrada dos anos. Tem uma linha do tempo (`anos`), `conquistas` (certificados, prêmios, olimpíadas, cursos) e `habilidades` (técnicas e pessoais). Ela aparece resumida, como as matérias, e o registro completo abre com um clique. Sem o bloco, a área não aparece.

```json
"trajetoria": {
  "titulo_area": "A Estrada dos Anos",
  "tema": "brejo",
  "descricao": "Como foi a caminhada do 1º ao 3º ano.",
  "anos": [{ "ano": "1º ano", "periodo": "2024", "titulo": "O que marcou", "texto": "…" }],
  "conquistas": [{ "titulo": "Olimpíada de Matemática", "tipo": "olimpiada", "data": "2025-08", "descricao": "…", "link": "" }],
  "habilidades": { "tecnicas": ["Python", "Git"], "pessoais": ["Trabalho em equipe"] }
}
```

- `tipo` da conquista: `certificado`, `premio`, `olimpiada`, `curso` ou `outro` (muda o desenho).
- As atividades com `"destaque": true` também aparecem em **Destaques do mapa**, no início.

## Segredos (opcional)

No modo Jogo, cada matéria esconde uma sala secreta atrás de uma parede falsa, com uma relíquia. Para deixar um recado seu em alguma delas, acrescente um bloco `segredos` com a chave da área (`vila` para o porão do início, ou o `id` da matéria):

```json
"segredos": {
  "vila": "Uma curiosidade sobre mim que pouca gente sabe.",
  "tecnico": "O primeiro programa que eu escrevi foi…"
}
```

## Abertura

`abertura.falas` são os três textos da abertura de cinema (desenhada a tinta: a gota, o livro, as páginas que viram o mapa e o título). `abertura.mostrar` pode ser `sempre`, `uma_vez_por_sessao` ou `nunca`.

## Compartilhamento

O título, a descrição e a imagem que aparecem quando alguém compartilha o link (WhatsApp, redes) estão no `<head>` do `index.html`, porque esses serviços não rodam JavaScript. Se mudar o nome do portfólio aqui, mude lá também. A imagem é [`compartilhar.png`](compartilhar.png) (1200 × 630).
