# Assinatura de executáveis Windows

Os binários da versão 2.7.0 não possuem assinatura Authenticode. A preparação de build abaixo não altera os arquivos já publicados nem representa um certificado emitido. O editor pretendido é **TECHHORIZON LTDA**; o nome definitivo precisa corresponder exatamente ao certificado validado pela certificadora.

## Certificado necessário

É necessário um certificado de **Code Signing para Microsoft Authenticode**, com cadeia pública reconhecida pelo Windows e uso de assinatura de código. A empresa precisa passar pela validação da certificadora. A simples inclusão de um nome no instalador não autentica o editor.

Para GitHub Actions com runners hospedados, prefira avaliar um serviço de assinatura em nuvem com integração de CI. Token USB requer uma máquina com acesso ao dispositivo. Serviços que oferecem adaptador compatível com o repositório de certificados do Windows também podem usar o comando abaixo, depois da instalação e autenticação do adaptador.

A escolha e contratação do provedor, a emissão do certificado e a integração das credenciais no GitHub ainda estão pendentes. A preparação atual suporta certificado exposto pelo provedor no Windows; não inclui uma integração REST específica de certificadora.

Referências para contratação e elegibilidade:

- [GlobalSign: assinatura de código no Brasil](https://www.globalsign.com/pt-br/code-signing-certificate).
- [SSL.com eSigner: assinatura remota e integrações de CI](https://www.ssl.com/guide/remote-ev-code-signing-with-esigner/).
- [Azure Artifact Signing: países elegíveis](https://learn.microsoft.com/en-us/azure/artifact-signing/quickstart). Na consulta de 12/11/2026, Brasil não consta entre os países elegíveis para validação pública de organizações; a existência de uma região Azure no Brasil não implica elegibilidade.

## Gerar executáveis assinados

1. Instale e configure o provedor de chave/token/HSM conforme as instruções da certificadora. Disponibilize o certificado com sua chave de assinatura para a conta Windows que executará o build.
2. Obtenha o thumbprint do certificado de Code Signing no gerenciador de certificados ou no painel do provedor. Ele identifica o certificado e não é a chave privada.
3. Configure as variáveis e execute em PowerShell:

```powershell
$env:AMAGO_SIGN_CERT_SHA1 = 'THUMBPRINT_DE_40_CARACTERES_HEXADECIMAIS'
$env:AMAGO_SIGN_PUBLISHER = 'TECHHORIZON LTDA' # nome exato no certificado
npm ci
npm test
npm run dist:win:signed
```

O SHA-1 acima é apenas o identificador do certificado; os arquivos são assinados com **SHA-256** e carimbo de tempo RFC 3161. A configuração usa a API do electron-builder 26 instalada no projeto.

O comando exige assinatura (`forceCodeSigning`), gera instalador e portátil em `release-signed/` e verifica os dois arquivos e o executável principal em `win-unpacked/`. A verificação exige Authenticode válido, o certificado escolhido, o editor esperado e carimbo de tempo. Só depois gera `SHA256SUMS.txt`. Falhas retornam código diferente de zero e não publicam arquivos.

`npm run dist:win` continua sendo o build sem assinatura em `release/`. Não use esse comando para uma release anunciada como assinada. O workflow atual `windows.yml` ainda usa esse modo: antes da primeira release assinada, será necessário configurar o provedor no runner, trocar o comando e o diretório de artefatos para o modo assinado. Nunca adicione um fallback silencioso para build sem assinatura.

Credenciais do serviço devem ser configuradas como secrets no ambiente de CI, nunca no repositório ou em mensagens. Chaves privadas permanecem no token/HSM ou serviço contratado. Não publique uma nova assinatura sobre binários de uma release existente: gere uma nova versão e calcule os hashes após a assinatura.

## Avisos do Windows

Uma assinatura válida identifica o editor e permite detectar alterações posteriores no executável. Ela **não garante a remoção imediata do aviso SmartScreen**: arquivos novos também dependem de reputação. Certificados EV não oferecem mais dispensa automática desse processo. Não é necessário desativar proteções do Windows.

Veja a [documentação de reputação do SmartScreen](https://learn.microsoft.com/en-us/windows/apps/package-and-deploy/smartscreen-reputation). Distribuir um pacote MSIX certificado pela Microsoft Store é outra opção; isso requer empacotamento e submissão próprios, ainda não configurados neste projeto.
