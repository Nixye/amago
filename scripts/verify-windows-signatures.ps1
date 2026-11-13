param(
    [Parameter(Mandatory = $true)]
    [ValidatePattern('^[A-Fa-f0-9]{40}$')]
    [string]$CertificateThumbprint,
    [string]$PublisherName = 'TECHHORIZON LTDA'
)
$ErrorActionPreference = 'Stop'
# Use the module matching this PowerShell runtime, even when launched from pwsh 7.
Import-Module (Join-Path $PSHOME 'Modules/Microsoft.PowerShell.Security/Microsoft.PowerShell.Security.psd1') -ErrorAction Stop
$projectRoot = Split-Path -Parent $PSScriptRoot
$package = Get-Content -LiteralPath (Join-Path $projectRoot 'package.json') -Raw | ConvertFrom-Json
$output = Join-Path $projectRoot 'release-signed'
$artifacts = @(
    "Amago-$($package.version)-Setup-x64.exe",
    "Amago-$($package.version)-Portable-x64.exe",
    'win-unpacked/Amago.exe'
)
foreach ($relativePath in $artifacts) {
    $file = Join-Path $output $relativePath
    if (-not (Test-Path -LiteralPath $file -PathType Leaf)) {
        throw "Missing signed artifact: $relativePath"
    }
    $signature = Get-AuthenticodeSignature -LiteralPath $file
    if ($signature.Status -ne 'Valid') {
        throw "Invalid Authenticode signature: $relativePath ($($signature.Status))"
    }
    if ($signature.SignerCertificate.Thumbprint -ne $CertificateThumbprint) {
        throw "Unexpected signing certificate: $relativePath"
    }
    $publisher = $signature.SignerCertificate.GetNameInfo([System.Security.Cryptography.X509Certificates.X509NameType]::SimpleName, $false)
    if ($publisher -cne $PublisherName) {
        throw "Unexpected publisher: $relativePath ($publisher)"
    }
    if (-not $signature.TimeStamperCertificate) {
        throw "Missing trusted timestamp: $relativePath"
    }
    Write-Host "Verified: $relativePath | $publisher"
}
# Only write checksums after all expected signatures pass verification.
$artifacts[0..1] | ForEach-Object {
    $stream = [System.IO.File]::OpenRead((Join-Path $output $_))
    $algorithm = [System.Security.Cryptography.SHA256]::Create()
    try {
        $hash = [System.BitConverter]::ToString($algorithm.ComputeHash($stream)).Replace('-', '').ToLowerInvariant()
    } finally {
        $stream.Dispose()
        $algorithm.Dispose()
    }
    "$hash  $_"
} | Set-Content -LiteralPath (Join-Path $output 'SHA256SUMS.txt') -Encoding ascii
