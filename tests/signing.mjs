import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, copyFileSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const root = fileURLToPath(new URL('../', import.meta.url));
const env = { ...process.env, AMAGO_SIGN_CERT_SHA1: '' };
const missing = spawnSync(process.execPath, ['scripts/build-signed-windows.mjs'], { cwd: root, env, encoding: 'utf8' });
assert.equal(missing.status, 1, 'Missing certificate must fail before packaging');
if (process.platform === 'win32') assert.match(missing.stderr, /AMAGO_SIGN_CERT_SHA1/);
process.env.AMAGO_SIGN_CERT_SHA1 = 'A'.repeat(40);
const { validateConfiguration } = require('app-builder-lib/out/util/config/config.js');
const { DebugLogger } = require('builder-util');
await validateConfiguration(require('../scripts/windows-signing.cjs'), new DebugLogger(false));

if (process.platform === 'win32') {
  const fixture = mkdtempSync(path.join(tmpdir(), 'amago-signing-test-'));
  try {
    mkdirSync(path.join(fixture, 'scripts'));
    mkdirSync(path.join(fixture, 'release-signed/win-unpacked'), { recursive: true });
    writeFileSync(path.join(fixture, 'package.json'), JSON.stringify({ version: '0.0.0' }));
    copyFileSync(path.join(root, 'scripts/verify-windows-signatures.ps1'), path.join(fixture, 'scripts/verify.ps1'));
    const files = ['Amago-0.0.0-Setup-x64.exe', 'Amago-0.0.0-Portable-x64.exe', 'win-unpacked/Amago.exe'];
    const run = (script) => spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', script], { cwd: fixture, encoding: 'utf8' });
    const verify = "& './scripts/verify.ps1' -CertificateThumbprint ('A' * 40)";
    assert.notEqual(run(verify).status, 0, 'Missing artifacts must fail');
    for (const file of files) writeFileSync(path.join(fixture, 'release-signed', file), 'unsigned test fixture');
    const unsigned = run(verify);
    assert.notEqual(unsigned.status, 0, 'Real Authenticode must reject unsigned files');
    assert.match(unsigned.stderr, /Invalid Authenticode signature/);

    // Mock only the OS trust response to exercise the post-signing policy.
    // These fixtures are not certificates and do not test an actual signing service.
    function response(status = 'Valid', thumbprint = 'A'.repeat(40), publisher = 'TECHHORIZON LTDA', timestamp = true) {
      return `function Get-AuthenticodeSignature {
        param($LiteralPath)
        $cert = [pscustomobject]@{ Thumbprint = '${thumbprint}' }
        $cert | Add-Member -MemberType ScriptMethod -Name GetNameInfo -Value { param($kind, $issuer) '${publisher}' }
        [pscustomobject]@{ Status = '${status}'; SignerCertificate = $cert; TimeStamperCertificate = ${timestamp ? '$cert' : '$null'} }
      }; ${verify}`;
    }
    for (const script of [response('HashMismatch'), response('Valid', 'B'.repeat(40)), response('Valid', 'A'.repeat(40), 'Other Publisher'), response('Valid', 'A'.repeat(40), 'TECHHORIZON LTDA', false)]) {
      assert.notEqual(run(script).status, 0);
      assert.equal(existsSync(path.join(fixture, 'release-signed/SHA256SUMS.txt')), false, 'Failed verification must not generate checksums');
    }
    const valid = run(response());
    assert.equal(valid.status, 0, valid.stderr);
    assert.equal(existsSync(path.join(fixture, 'release-signed/SHA256SUMS.txt')), true);
  } finally {
    // mkdtemp creates this isolated fixture; never delete the project's output.
    assert.ok(path.basename(fixture).startsWith('amago-signing-test-'));
    assert.equal(path.dirname(fixture), path.resolve(tmpdir()));
    rmSync(fixture, { recursive: true, force: true });
  }
}
console.log('Signing checks passed (configuration, fail-closed build and Windows verification policy).');
