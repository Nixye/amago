# Âmago

Aplicação web pessoal de notas, inspirada no fluxo de conhecimento conectado do Obsidian. HTML, CSS e JavaScript, sem etapa de compilação.

## Executar

Com Node.js instalado, execute `node serve.mjs` e abra http://localhost:4173.

## Recursos

- Notas Markdown com leitura, edição e visualização lado a lado
- Pastas, tags, favoritos, busca e notas diárias
- Links `[[entre notas]]`, backlinks e mapa de conexões
- Salvamento no localStorage deste navegador
- Importação de Markdown e backups JSON; exportação individual em Markdown ou de todo o espaço em JSON
- Tema claro e escuro, atalhos e layout responsivo

## Dados

Esta primeira versão usa armazenamento local do navegador. Não há conta interna, sincronização entre dispositivos, colaboração ou backend de notas. Limpar os dados do site remove as notas locais. Use a exportação nas configurações para fazer cópias e transferir o espaço.

O leitor implementa um subconjunto de Markdown: títulos, parágrafos, listas, tarefas, citações, blocos de código, negrito, itálico, links HTTP(S) e wikilinks. HTML escrito nas notas é exibido como texto. Importar um backup adiciona as notas com novos IDs, preservando as notas já existentes.

## Estrutura

- `dist/index.html`: estrutura da aplicação
- `dist/style.css`: interface e temas
- `dist/app.js`: dados, editor e interações
- `.openai/hosting.json`: configuração de publicação

Fontes DM Sans e Manrope são carregadas do Google Fonts, com alternativas locais. O aplicativo não envia o conteúdo das notas a um servidor.
