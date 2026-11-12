import {readFileSync,writeFileSync} from 'node:fs';
const {version}=JSON.parse(readFileSync(new URL('../package.json',import.meta.url),'utf8'));
writeFileSync(new URL('../dist/version.js',import.meta.url),'// Generated from package.json by scripts/version.mjs.\nwindow.amagoVersion='+JSON.stringify(version)+';\n');
