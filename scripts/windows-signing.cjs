// electron-builder 26: certificate supplied by a Windows token/HSM provider.
const { build } = require('../package.json');
const certificateSha1 = (process.env.AMAGO_SIGN_CERT_SHA1 || '').replace(/\s/g, '').toUpperCase();
if (!/^[A-F0-9]{40}$/.test(certificateSha1)) {
  throw new Error('Configure AMAGO_SIGN_CERT_SHA1 com o thumbprint do certificado de Code Signing emitido para a empresa. Consulte docs/windows-signing.md.');
}
module.exports = {
  ...build,
  forceCodeSigning: true,
  directories: { ...build.directories, output: 'release-signed' },
  win: {
    ...build.win,
    signExecutable: true,
    signtoolOptions: {
      certificateSha1,
      publisherName: process.env.AMAGO_SIGN_PUBLISHER || 'TECHHORIZON LTDA',
      signingHashAlgorithms: ['sha256'],
      rfc3161TimeStampServer: 'http://timestamp.digicert.com',
    },
  },
};
