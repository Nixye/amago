import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
process.chdir(fileURLToPath(new URL('../', import.meta.url)));
function run(command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit', shell: false });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`Etapa de assinatura falhou (código ${result.status ?? 'interrompido'}). Nenhum artefato foi publicado.`);
}
try {
  if (process.platform !== 'win32') throw new Error('O build assinado requer Windows e um provedor de certificado configurado.');
  const config = require('./windows-signing.cjs');
  const { certificateSha1, publisherName } = config.win.signtoolOptions;
  run(process.execPath, ['scripts/version.mjs']);
  run(process.execPath, [require.resolve('electron-builder/cli.js'), '--config', 'scripts/windows-signing.cjs', '--win', 'nsis', 'portable', '--x64', '--publish', 'never']);
  run('powershell.exe', ['-NoProfile', '-NonInteractive', '-File', 'scripts/verify-windows-signatures.ps1', '-CertificateThumbprint', certificateSha1, '-PublisherName', publisherName]);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
