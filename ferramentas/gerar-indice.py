#!/usr/bin/env python3
"""Gera recursos/indice.json com a lista de todos os arquivos da pasta recursos/.

O site publicado não consegue listar o conteúdo de uma pasta sozinho; com este
índice ele lê qualquer pasta, com qualquer nome de arquivo, em ordem numérica.
No GitHub o índice é gerado automaticamente a cada envio
(.github/workflows/indice.yml). Para rodar no seu computador:

    python ferramentas/gerar-indice.py
"""
import json
import os
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent / "recursos"
SAIDA = RAIZ / "indice.json"


def main() -> None:
    arquivos = []
    for pasta, subpastas, nomes in os.walk(RAIZ):
        subpastas[:] = sorted(d for d in subpastas if not d.startswith("."))
        for nome in nomes:
            if nome.startswith(".") or (Path(pasta) / nome) == SAIDA:
                continue
            arquivos.append((Path(pasta) / nome).relative_to(RAIZ).as_posix())
    arquivos.sort()
    texto = json.dumps({"versao": 1, "arquivos": arquivos}, ensure_ascii=False, indent=1) + "\n"
    if not SAIDA.exists() or SAIDA.read_text(encoding="utf-8") != texto:
        SAIDA.write_text(texto, encoding="utf-8")
        print(f"recursos/indice.json atualizado: {len(arquivos)} arquivos")
    else:
        print(f"recursos/indice.json já estava em dia: {len(arquivos)} arquivos")


if __name__ == "__main__":
    main()
