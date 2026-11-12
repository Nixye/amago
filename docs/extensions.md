# Extensões do Âmago

O Âmago 2.2 oferece formatos próprios para paletas e plugins. A instalação é local, por arquivo JSON; não há marketplace, atualização automática ou compatibilidade binária com extensões do Obsidian.

## Temas da comunidade

Em **Configurações → Temas e comunidade**, exporte um tema nativo, altere suas cores e importe o JSON. O formato usa `format: "amago-theme-v1"`, `id`, `name`, `author`, `mode` (`dark` ou `light`) e `colors`.

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

Instale em **Configurações → Plugins e extensões → Instalar pacote .json**. Revise as permissões e ative. Os comandos aparecem em **Ctrl Shift P**, tanto no espaço pessoal quanto em projetos. Desativar encerra o runtime e remove os comandos; remover exclui o pacote da biblioteca local.

### API v1

| Método | Permissão | Resultado |
| --- | --- | --- |
| `api.registerCommand(id, handler)` | Nenhuma | Registra um comando declarado no pacote |
| `await api.getActiveNote()` | `note:read` | `{ id, title, body, source }`, com `source` igual a `vault` ou `project` |
| `await api.proposeContent(markdown)` | `note:write` | Abre revisão lado a lado; retorna `{ applied: boolean }` |
| `await api.showMessage(text)` | Nenhuma | Mostra uma mensagem identificada com o nome do plugin |

`getActiveNote()` usa a nota selecionada do espaço pessoal ou o Markdown aberto no projeto. Não lista o acervo inteiro. A proposta nunca é aplicada silenciosamente: o usuário vê o conteúdo atual e o proposto. Se a nota mudar enquanto a proposta estiver aberta, a aplicação é bloqueada. Em projetos, a escrita também verifica a versão do arquivo no disco.

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

### Execução e limites

Cada plugin roda em um iframe com `sandbox="allow-scripts"`, sem `allow-same-origin`, e se comunica por um `MessageChannel` exclusivo. Não recebe a ponte do Electron. A CSP do runtime bloqueia rede, imagens, formulários e recursos externos; a política da página principal restringe frames à origem do app. A API não expõe filesystem, shell, credenciais ou armazenamento da biblioteca.

O pacote pode ter até 250 KB, com código de até 200 mil caracteres, 1–12 comandos e apenas as permissões documentadas. Propostas são limitadas a 1 milhão de caracteres. Instale código de autores confiáveis: isolamento restringe capacidades, mas um plugin com falhas ainda pode consumir recursos ou prejudicar a responsividade. O gerenciador permite desativá-lo.

A API v1 é deliberadamente pequena: comandos, leitura do documento ativo, propostas revisáveis e mensagens. Painéis personalizados, acesso em lote ao acervo, rede e acesso nativo não fazem parte desta versão.
