# Regras de trabalho neste repositório

Este projeto é feito a quatro mãos com o dono do repositório, que também faz commits direto no GitHub.

1. **Antes de qualquer mudança**, rode `git fetch` e compare com `origin/main`. Se houver commits novos do dono,
   faça `git pull --rebase` e diga em poucas linhas o que ele mudou antes de continuar.
2. **Nunca apague, mova ou esvazie a pasta `recursos/`** nem arquivos que o dono colocou nela.
   Não apague `recursos/LEIA-ME.md`: o site usa esse arquivo para detectar a pasta.
3. Não sobrescreva mudanças do dono. Em caso de conflito, preserve a versão dele e pergunte.
4. Ao terminar uma mudança, faça commit e push para `main` e avise o que mudou.
5. Se mudar nomes ou formatos esperados em `recursos/`, atualize `js/08-pasta-recursos.js`,
   `recursos/LEIA-ME.md` e a aba "Pasta recursos" do Guia (`js/07-interface.js`) juntos.
6. Personagem, criaturas, arte e músicas do código são originais. Não desenhar personagens de outros jogos;
   material de terceiros entra só pelos arquivos que o dono coloca em `recursos/`.
