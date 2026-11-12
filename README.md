<p align="center"><img src="dist/assets/amago-mark.svg" width="88" alt="Ícone do Âmago"></p>
<h1 align="center">Âmago</h1>
<p align="center">Escrita em Markdown, arquivos locais e conhecimento conectado.<br>Aplicativo para Windows e navegador, com uma interface feita para explorar ideias.</p>
<p align="center"><a href="https://github.com/Nixye/amago/releases/latest">Baixar para Windows</a> · <a href="#primeiros-passos">Primeiros passos</a> · <a href="docs/extensions.md">Temas e plugins</a> · <a href="#desenvolvimento">Desenvolvimento</a></p>

## O que é o Âmago

O Âmago reúne um editor Markdown, uma biblioteca pessoal e projetos baseados em pastas reais. Você pode escrever, encontrar referências e explorar conexões sem depender de sincronização em nuvem. O aplicativo é independente e não possui vínculo com o Obsidian.

- **Navegação organizada:** abas Explorar e Coleções, busca em modal, árvore de arquivos e seletor de workspace.
- **Projetos locais:** subpastas, edição de `.md` e `.markdown`, criação de arquivos e prévia de imagens.
- **Busca híbrida:** combine nome, conteúdo, tags, menções e datas; remova filtros individualmente.
- **Mapa interativo:** filtros compartilhados com a busca, vínculos animados, pontos arrastáveis, zoom, cores e ajustes de traçado.
- **Escrita:** até quatro notas editáveis lado a lado, prévia Markdown, wikilinks, tarefas, notas diárias, favoritos, modelos e modo foco.
- **Personalização:** seis temas nativos, tema inspirado em Cyberpunk, paletas da comunidade e plugins com permissões explícitas.
- **Windows:** instalador e versão portátil x64, ícone próprio e acrílico nativo com densidade ajustável.

## Instalação no Windows

Na [última release](https://github.com/Nixye/amago/releases/latest), escolha:

| Arquivo | Uso |
| --- | --- |
| `Amago-<versão>-Setup-x64.exe` | Instalação com escolha de diretório e atalhos. |
| `Amago-<versão>-Portable-x64.exe` | Execução sem instalação; os dados continuam no perfil do Windows. |
| `SHA256SUMS.txt` | Resumos SHA-256 dos executáveis publicados. |

Os executáveis são destinados ao Windows x64 e ainda não possuem assinatura digital comercial. O acrílico requer Windows 11 22H2 ou superior; em sistemas sem suporte, o aplicativo usa fundo sólido. O resultado também depende das configurações visuais do Windows. No navegador, a transparência é interna à página e não revela o papel de parede do sistema.

## Primeiros passos

1. Abra o aplicativo e explore **Meu universo**, o espaço pessoal com notas de exemplo.
2. Para trabalhar com arquivos existentes, clique em **Abrir pasta** e selecione um diretório. Ele aparece como um projeto na barra lateral.
3. Expanda as subpastas e abra um Markdown ou uma imagem. Use **Ctrl S** para gravar o Markdown no arquivo original.
4. Use **Buscar** para refinar resultados e **Mapa do projeto** para explorar os wikilinks.
5. Acesse **Configurações → Aparência** ou **Configurações → Plugins** para personalizar a experiência.

O seletor acima das abas alterna entre o espaço pessoal e o projeto aberto. A pasta deve ser selecionada novamente em uma nova sessão. No navegador, a edição de pastas depende da File System Access API, disponível em navegadores compatíveis como Chrome e Edge, em HTTPS ou localhost. A permissão é concedida no seletor do navegador; sem essa API, o espaço pessoal e a importação/exportação continuam disponíveis.

### Espaço pessoal e projetos

| Comportamento | Meu universo | Pasta aberta como projeto |
| --- | --- | --- |
| Armazenamento | Biblioteca local do app/navegador | Arquivos originais da pasta selecionada |
| Salvamento | Automático | Ctrl S; também antes de trocar de arquivo/workspace e ao fechar o desktop |
| Organização | Pastas lógicas, tags e favoritos | Estrutura real de diretórios |
| Histórico e lixeira | Histórico de notas e lixeira recuperável | Não disponíveis para os arquivos do projeto |
| Busca e mapa | Notas da biblioteca | Markdown indexado na pasta aberta |
| Backup automático | Cópia diária anterior no desktop | Não; mantenha seu próprio backup ou versionamento |

Se um arquivo mudar no disco desde a leitura, o Âmago bloqueia a gravação, mantém o rascunho e oferece **Exportar rascunho** e **Recarregar do disco**. O aplicativo não mescla alterações automaticamente. Use **Atualizar arquivos** para reler a árvore e reconstruir o índice após mudanças externas.

## Organização do editor

Em **Coleções**, clique em **Acesso rápido** ou **Tags** para recolher cada grupo. A busca da categoria filtra os nomes das tags; a lista mostra até 12 por página, com contagem de notas e navegação entre páginas. Selecionar uma tag abre a busca híbrida.

Use **Dividir** no topo do editor para escolher outra nota. É possível abrir até quatro colunas do mesmo workspace, trocar a nota pelo título de cada coluna e alternar individualmente entre edição e prévia. **Uma coluna** retorna ao editor normal. No projeto, **Ctrl S** salva todos os rascunhos abertos; conflitos preservam o conteúdo da coluna afetada. Em janelas pequenas, as colunas têm rolagem horizontal.

O botão **Conexões** oculta ou reexibe as referências da nota ativa. O botão de painel na barra superior ou o botão na própria barra lateral alterna entre fixada e recolhida. Quando recolhida, aproxime o mouse da borda esquerda para revelá-la temporariamente; afastar o ponteiro a recolhe. O estado fixado/recolhido, a visibilidade das conexões e os grupos recolhidos são preservados ao reiniciar. A divisão em colunas dura a sessão atual.

**Configurações** reúne as abas **Geral**, **Aparência**, **Dados** e **Plugins** em uma janela ampliada. **Buscar**, ou **Ctrl K**, abre um diálogo com resultados navegáveis pelas setas e Enter.

## Busca híbrida

Todos os critérios são combinados com **E**: um resultado precisa satisfazer cada filtro. A busca ignora diferenças de maiúsculas e acentos. Use aspas para valores com espaços e `-` para excluir um critério.

| Consulta | Encontra |
| --- | --- |
| `pesquisa visual` | Ambos os termos no nome, caminho ou conteúdo |
| `name:Atlas content:"pesquisa visual"` | Nome/caminho contendo Atlas e a frase no conteúdo |
| `#design` ou `tag:design` | Tag exata, nas propriedades ou no corpo |
| `@luna` ou `mention:"Outra nota"` | Menções `@pessoa` ou destinos de `[[wikilinks]]` |
| `date:2026-11` | Notas datadas em novembro de 2026 |
| `after:2026-11-01 before:2026-11-30` | Intervalo de datas inclusivo |
| `projeto #design @luna -tag:arquivado` | Combinação dos quatro critérios |

A data usa a propriedade `date` quando presente; caso contrário, a data de modificação. Tags e menções dentro de blocos de código não entram nesses filtros. O formulário **Refinar por tags, menções e datas** ajuda a adicionar tags, menções e intervalos; os filtros aparecem como botões removíveis. No mapa, **Usar busca atual** copia a consulta atual.

## Mapa e propriedades Markdown

O mapa conecta notas com `[[Nome da nota]]` ou `[[pasta/arquivo]]`. No projeto, destinos da mesma pasta têm prioridade; nomes repetidos devem usar o caminho completo para evitar ambiguidade. Os filtros mostram apenas pontos correspondentes e os vínculos entre eles.

Arraste um ponto para reposicioná-lo; arraste o fundo para navegar; use a roda do mouse ou os controles para ampliar. Os ajustes de posição, tamanho dos pontos e espessura das linhas ficam salvos localmente por workspace. **Reorganizar pontos** restaura a distribuição inicial. A animação respeita a preferência de movimento reduzido do sistema.

A cor pode ser escolhida nas **Propriedades da nota/Markdown**, no seletor de um ponto do mapa ou declarada no começo do arquivo:

```markdown
---
tags: [design, projeto]
color: "#78e2df"
date: 2026-11-12
---

# Atlas de ideias

Pesquisa com @luna, conectada a [[Próximos passos]].
```

O seletor de cor grava a propriedade `color` no Markdown, preservando as demais propriedades. São aceitas cores hexadecimais de seis dígitos. O parser reconhece propriedades simples e listas de tags; não é uma implementação completa de YAML.

## Temas e plugins

Os temas nativos são **Orbital, Cyberpunk, Meia-noite, Floresta, Quartzo e Alvorada**. O tema Cyberpunk é uma interpretação visual com amarelo, magenta e superfícies escuras; não inclui recursos oficiais do jogo.

Temas da comunidade são importados e exportados em JSON. Plugins são instalados por pacote JSON, têm ativação individual e adicionam comandos à paleta. O gerenciador mostra as permissões antes de ativá-los; alterações propostas por um plugin exigem revisão. Não há catálogo online ou atualização automática de extensões nesta versão.

Veja [como criar temas e plugins](docs/extensions.md) e os [pacotes de exemplo](examples/). A API é própria do Âmago; plugins do Obsidian não são compatíveis diretamente.

## Atalhos

| Atalho | Ação |
| --- | --- |
| Ctrl K | Abrir busca híbrida |
| Ctrl N | Nova nota ou novo arquivo Markdown |
| Ctrl S | Salvar os arquivos abertos, incluindo as outras colunas |
| Ctrl Shift D | Adicionar uma nota lado a lado |
| Ctrl E | Alternar edição/leitura |
| Ctrl Shift P | Abrir paleta de comandos |
| Esc | Fechar diálogo ou sair do modo foco |
| Setas, Home e End nas abas laterais | Trocar painel da barra lateral |

## Dados e privacidade

No Windows, a biblioteca fica em `%APPDATA%/amago/vault.json`. **Configurações → Dados → Abrir pasta de dados** mostra o diretório exato. As gravações são serializadas e usam arquivo temporário seguido de renomeação. A primeira gravação de cada dia preserva a cópia anterior em `backups/`. O fechamento da janela aguarda o salvamento e permanece aberto se houver erro.

Na web, a biblioteca usa o armazenamento local do navegador. Limpar os dados do site remove essa biblioteca. Os projetos usam apenas a pasta explicitamente selecionada; seu conteúdo não é importado para o espaço pessoal.

O app não envia o conteúdo das notas para um servidor nem oferece sincronização automática. Fontes externas opcionais podem ser solicitadas pelo navegador; há fontes locais de fallback. Plugins são executados em um iframe isolado, com API restrita e sem conexões de rede permitidas pelo aplicativo.

Para transferir notas, exporte o espaço em JSON e importe no outro dispositivo. A importação adiciona notas ativas; não restaura histórico, lixeira, temas ou plugins. Para recuperação integral no Windows, feche o app, preserve o `vault.json` atual e substitua-o por uma cópia válida do backup.

## Compatibilidade e limites

- Markdown: títulos, parágrafos, listas, tarefas, citações, código, negrito, itálico, links HTTP(S) e wikilinks. HTML é escapado. Tabelas, LaTeX e Canvas não estão implementados.
- Edição de arquivos: UTF-8, até 5 MiB por Markdown. UTF-16, conteúdo binário e UTF-8 inválido são rejeitados. O editor pode normalizar quebras de linha ao editar.
- Imagens: PNG, JPEG, GIF, WebP, BMP e SVG, até 25 MiB. Outros arquivos aparecem na árvore, sem execução ou edição.
- Árvore: até 3.000 itens e 12 níveis. `.git`, `node_modules`, `.svn`, `.hg` e links simbólicos/junções não são percorridos pelo desktop.
- Índice de conteúdo: orçamento aproximado de 40 MiB por projeto; arquivos fora do índice continuam localizáveis pelo nome. A interface informa leituras ignoradas.
- Mapa: até 500 notas por consulta. Refine os filtros para visualizar partes de acervos maiores.
- O app abre um projeto de pasta por vez e não monitora mudanças externas em tempo real.

## Desenvolvimento

Requer Node.js 24 e npm. Para gerar os executáveis, use Windows x64.

```sh
npm ci
npm test
npm run web
```

A web fica disponível em `http://localhost:4173`.

```sh
npm start          # aplicativo Electron
npm run dist:win   # instalador e portátil em release/
```

Caso o ambiente bloqueie scripts de instalação do npm, execute `node node_modules/electron/install.js` para instalar o runtime antes de iniciar o desktop.

| Diretório | Responsabilidade |
| --- | --- |
| `dist/` | Interface estática, busca, mapa, temas e runtime de plugins |
| `desktop/` | Electron, janela nativa, persistência e acesso às pastas |
| `tests/` e `verify.mjs` | Verificação de Markdown, histórico, arquivos, busca e extensões |
| `examples/` | Pacotes de extensões para desenvolvimento |
| `.github/workflows/windows.yml` | Compilação e publicação dos executáveis |

A interface usa JavaScript, HTML, CSS e SVG, sem framework de frontend. O Electron executa com sandbox, isolamento de contexto e Node desativado no renderer. A ponte IPC valida a origem e expõe operações específicas. Referências: [segurança no Electron](https://www.electronjs.org/docs/latest/tutorial/security/) e [isolamento de iframes](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe#sandbox).

### Publicar uma release

1. Atualize `package.json` e `package-lock.json` com `npm version <versão> --no-git-tag-version`.
2. Execute `npm test` e faça commit das alterações.
3. Crie a tag `v<versão>` e envie a branch e a tag ao GitHub.

O GitHub Actions valida a versão, testa, compila os dois executáveis e publica uma release com SHA-256. A execução manual do workflow gera artefatos sem criar release. Apenas o job de publicação recebe `contents: write`; não é necessário um token pessoal no workflow.

## Relatar problemas

Ao abrir uma issue, inclua a versão do Âmago, a versão do Windows ou navegador, os passos para reproduzir e se o problema ocorre no espaço pessoal ou em um projeto. Use um arquivo de exemplo sem conteúdo privado quando necessário. Problemas em extensões devem incluir o nome e a versão do pacote.
