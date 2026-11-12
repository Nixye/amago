# Âmago 2.0

Aplicativo web e Windows para conhecimento conectado. Interface orbital em azul profundo, ciano e violeta, animações discretas e indicadores baseados nos dados do seu espaço.

## Usar

Baixe o instalador Setup ou o executável Portable na página Releases. Windows x64. O portátil dispensa instalação, mas guarda os dados no perfil do Windows. Os binários não têm assinatura digital comercial. Verifique os downloads com SHA256SUMS.txt.

## Recursos

- Central com notas recentes, conexões e tarefas pendentes.
- Editor Markdown com prévia lado a lado e barra de formatação.
- Pastas, tags, favoritos, busca e notas diárias.
- Wikilinks, backlinks, afinidades por tags e mapa com zoom/arraste.
- Central de tarefas ligada às notas originais.
- Modelos de projeto, reunião, leitura e revisão semanal.
- Histórico de até 20 versões por nota, agrupadas em intervalos de 30 segundos; inspeção e restauração do conteúdo.
- Lixeira recuperável, duplicação, modo foco e progresso de leitura.
- Paleta de comandos: Ctrl Shift P. Busca: Ctrl K. Nova nota: Ctrl N.
- Temas claro/escuro; movimento reduzido respeita a preferência do sistema.
- Importação de Markdown e JSON; exportação de notas e do espaço.

## Dados

A web usa armazenamento do navegador e preserva as notas da versão anterior. No Windows, vault.json fica em %APPDATA%/amago (capitalização pode variar); Configurações → Abrir pasta de dados mostra o caminho exato. Gravações são serializadas, usando arquivo temporário e renomeação. O fechamento aguarda a gravação final. A primeira gravação de cada dia preserva uma cópia anterior na pasta backups.

Para transferir notas da web ao Windows, exporte o espaço na web e importe o JSON no desktop. A importação adiciona notas; não substitui as existentes. Não há sincronização automática. A exportação inclui histórico e lixeira, mas a importação atual recupera somente notas ativas. Para recuperação integral no Windows, feche o app e substitua vault.json por um backup válido, preservando antes o arquivo atual.

Markdown suporta títulos, parágrafos, listas, tarefas, citações, código, negrito, itálico, links HTTP(S) e wikilinks. HTML é escapado. Tabelas, LaTeX, plugins e Canvas do Obsidian não estão implementados. O conteúdo das notas não é enviado para servidores. Fontes externas opcionais têm fallback local.

## Desenvolvimento

Requer Node.js 24 e npm.

```sh
npm ci
npm test
npm run web
npm start
npm run dist:win
```

A web abre em http://localhost:4173. Se o npm local bloquear a instalação do runtime Electron, execute `node node_modules/electron/install.js` antes de `npm start`.

## Releases

O workflow .github/workflows/windows.yml testa e compila instalador/portátil em Windows. Tags v* geram uma GitHub Release com executáveis e SHA256. A tag precisa corresponder à versão de package.json. Execução manual gera artefatos sem publicar release.

```sh
git tag v2.0.0
git push github main --tags
```

O job de compilação tem somente leitura; apenas o job de publicação recebe contents: write. Não requer token pessoal no workflow.

## Arquitetura e validação

Interface estática em dist/. Electron em desktop/, com sandbox, isolamento de contexto, Node desativado no renderer, protocolo local e ponte IPC restrita. Links externos abrem no navegador. A evolução preserva a chave e IDs das notas da versão original.

Os testes verificam Markdown seguro, links, tarefas, persistência e retenção do histórico. Inspeção visual no Windows validou a central e criação de nota por modelo. A geração dos executáveis não substitui testar o instalador em todas as versões do Windows.

Referências: [segurança Electron](https://www.electronjs.org/docs/latest/tutorial/security) e [NSIS/portable](https://www.electron.build/docs/nsis/).
