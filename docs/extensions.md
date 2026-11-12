# Extensões do Âmago

O Âmago 2.4 oferece formatos próprios para paletas e plugins. A instalação é local, por arquivo JSON; não há marketplace, atualização automática ou compatibilidade binária com extensões do Obsidian.

## Temas da comunidade

Em **Configurações → Aparência**, exporte um tema nativo, altere suas cores e importe o JSON. O formato usa `format: "amago-theme-v1"`, `id`, `name`, `author`, `mode` (`dark` ou `light`) e `colors`.

Todas as cores abaixo são obrigatórias, no formato hexadecimal `#RRGGBB`:

```json
{
  "format": "amago-theme-v1",
  "id": "oceano",
  "name": "Oceano",
  "author": "Sua comunidade",
  "mode": "dark",
  "colors": {
    "bg": "#0c1520",
    "sidebar": "#09121c",
    "panel": "#172c3d",
    "raised": "#1a3447",
    "hover": "#23465d",
    "border": "#35566b",
    "text": "#c0d4df",
    "strong": "#edf7ff",
    "muted": "#8daabb",
    "subtle": "#6b879a",
    "accent": "#73dfd3",
    "accent-bg": "#173b45",
    "purple": "#afa8f3"
  }
}
```

Os temas não aceitam CSS ou JavaScript arbitrário. Use contraste suficiente entre texto e superfície, e teste com acrílico ativado e desativado. Pacotes têm limite de 50 KB.

## Plugins

Um pacote contém os metadados, permissões, comandos e um módulo JavaScript no campo `code`. Use [word-count.amago-plugin.json](../examples/word-count.amago-plugin.json) como exemplo executável.

```json
{
  "format": "amago-plugin-v1",
  "id": "meu-plugin",
  "name": "Meu plugin",
  "version": "1.0.0",
  "author": "Seu nome",
  "description": "Descreva a função e o uso dos dados.",
  "permissions": ["note:read"],
  "commands": [{"id": "hello", "title": "Mostrar título"}],
  "code": "export default function(api) { api.registerCommand('hello', async () => { const note = await api.getActiveNote(); await api.showMessage(note.title); }); }"
}
```

Instale em **Configurações → Plugins → Instalar pacote .json**. Revise as permissões e ative. Os comandos aparecem em **Ctrl Shift P**, tanto no espaço pessoal quanto em projetos. Desativar encerra o runtime e remove os comandos; remover exclui o pacote da biblioteca local.

### API v2 e compatibilidade v1

`api.version` retorna `2`. Os métodos abaixo mantêm compatibilidade com pacotes `amago-plugin-v1`. Pacotes novos podem usar `amago-plugin-v2` e todas as capacidades documentadas nesta página.

| Método | Permissão | Resultado |
| --- | --- | --- |
| `api.registerCommand(id, handler)` | Nenhuma | Registra um comando declarado no pacote |
| `await api.getActiveNote()` | `note:read` | `{ id, title, body, source }`, com `source` igual a `vault` ou `project` |
| `await api.proposeContent(markdown)` | `note:write` | Abre revisão lado a lado; retorna `{ applied: boolean }` |
| `await api.showMessage(text)` | Nenhuma | Mostra uma mensagem identificada com o nome do plugin |

`getActiveNote()` usa a nota selecionada do espaço pessoal ou o texto editável aberto no projeto e inclui `metadata`. `getActiveDocument()` é um alias desse método. A proposta nunca é aplicada silenciosamente: o usuário vê o conteúdo atual e o proposto. Se a nota mudar enquanto a proposta estiver aberta, a aplicação é bloqueada. Em projetos, a escrita também verifica a versão do arquivo no disco.

Exemplo de módulo para normalizar espaços no final de cada linha:

```js
export default function (api) {
  api.registerCommand('trim', async () => {
    const note = await api.getActiveNote();
    const body = note.body.replace(/[\t ]+$/gm, '');
    const result = await api.proposeContent(body);
    if (result.applied) await api.showMessage('Espaços finais removidos.');
  });
}
```

Esse comando precisa declarar `note:read`, `note:write` e o comando `trim` no pacote. O módulo deve ser autocontido; dependências remotas não são carregadas.

### Workspace, seleção, painéis e armazenamento

Todos os métodos assíncronos retornam Promises e rejeitam com erro quando a permissão ou o documento não estiver disponível.

| Método | Permissão | Resultado |
| --- | --- | --- |
| `getSelection()` | `note:read` | `{id, source, start, end, text}` da seleção no editor |
| `replaceSelection(text)` | `note:write` | Propõe substituição da seleção, com revisão |
| `listDocuments()` | `workspace:read` | Lista de `{id, title, path, kind, tags}`, sem conteúdo |
| `readDocument(id)` | `workspace:read` | `{id, title, body, source, metadata}` |
| `openDocument(id)` | `workspace:read` | Navega para um documento do workspace atual |
| `getSettings()` / `setSettings(values)` | Nenhuma | Lê ou atualiza valores validados pelo esquema |
| `storage.get()` / `storage.set(value)` | `storage` | Lê ou substitui um valor JSON persistente exclusivo do plugin |
| `showPanel({title, width, html, css})` | `ui:panel` | Abre o painel; largura entre 280 e 900 px |
| `hidePanel()` | `ui:panel` | Oculta o painel |
| `on(event, handler)` | Conforme o evento | Registra listener; retorna função para cancelá-lo |

No projeto, documentos editáveis incluem Markdown e texto. `listDocuments` aguarda o índice quando necessário; `readDocument` considera rascunhos abertos. IDs são opacos: use os retornados pela API, sem construir caminhos. A API não acessa arquivos fora do workspace selecionado. A seleção é invalidada quando seu documento ou conteúdo muda.

### Barra superior e configurações

O campo opcional `toolbar` contém IDs de comandos que também aparecem no botão **Extensões** da barra superior. Declare cada comando em `commands` e registre seu handler.

`settings` declara os campos do formulário **Configurar** no gerenciador. Tipos: `text`, `number`, `boolean` e `select`; cada campo usa `key`, `label` e `default`. Números aceitam `min`/`max`; seletores exigem `options` com valores textuais. Trecho de manifesto:

```json
{
  "format": "amago-plugin-v2",
  "permissions": ["workspace:read", "ui:panel", "storage"],
  "commands": [{"id": "open", "title": "Abrir painel"}],
  "toolbar": ["open"],
  "settings": [{"key": "limit", "label": "Limite", "type": "number", "default": 20, "min": 1, "max": 100}]
}
```

Inclua também os metadados e o campo `code` do pacote. Veja o exemplo completo [explorador do workspace](../examples/workspace-inspector.amago-plugin.json), com painel, navegação, tags, configurações e armazenamento.

### DOM, temas e eventos

O plugin pode criar e manipular DOM, estilos e eventos dentro de seu próprio iframe. Depois de `await api.showPanel(...)`, use `document` para conectar botões e componentes. Cada chamada a `showPanel` substitui o corpo do painel, portanto registre novamente seus handlers. Esconder preserva o DOM; desativar encerra o runtime.

```js
export default function (api) {
  api.registerCommand('open', async () => {
    const docs = await api.listDocuments();
    await api.showPanel({
      title: 'Resumo', width: 400,
      html: '<main></main>',
      css: 'body{background:var(--bg);color:var(--text);font:16px system-ui}'
    });
    document.querySelector('main').textContent = docs.length + ' documentos';
  });
}
```

O painel recebe as variáveis CSS do tema, incluindo `--bg`, `--text`, `--strong`, `--accent`, `--panel` e `--border`. Use `textContent` ao apresentar conteúdo de documentos. Imagens embutidas em URLs `data:` ou `blob:` são permitidas.

| Evento | Permissão | Payload |
| --- | --- | --- |
| `document:change` | `note:read` | `{id, title, source}`; releia o documento se necessário |
| `workspace:change` | `workspace:read` | `{source}` ao trocar o workspace |
| `theme:change` | Nenhuma | `{id, colors}`, também ao iniciar |
| `settings:change` | Nenhuma | Valores validados, também ao iniciar |
| `view:close` | `ui:panel` | Objeto vazio ao fechar pelo botão do painel |

Mudanças de documentos são agrupadas com um pequeno atraso. Um evento pode ocorrer mais de uma vez sem alterar o conteúdo; mantenha handlers idempotentes. Para a lista inicial, chame `listDocuments` ao abrir seu painel.

### Execução e limites

Cada plugin roda em um iframe com `sandbox="allow-scripts"`, sem `allow-same-origin`, e se comunica por um `MessageChannel` exclusivo. Não recebe a ponte do Electron. A CSP do runtime bloqueia rede, formulários e recursos externos; a política da página principal restringe frames à origem do app. A API não expõe filesystem, shell ou credenciais. Documentos são acessíveis apenas pelas permissões concedidas.

Limites: pacote de 250 KB, código de 200 mil caracteres, 1–24 comandos, até 4 comandos na barra, até 20 configurações e 64 KiB de armazenamento JSON por plugin. Leituras e propostas têm limite de 1 milhão de caracteres. Há até 3.000 documentos por listagem e 60 solicitações por segundo. Painéis aceitam até 200 mil caracteres de HTML e 100 mil de CSS. O armazenamento é local ao dispositivo, separado por ID e não é sincronizado.

Instale código de autores confiáveis: isolamento restringe capacidades, mas um plugin com falhas ainda pode consumir recursos ou prejudicar a responsividade. O gerenciador permite desativá-lo. Plugins do Obsidian exigem adaptação à API do Âmago.
