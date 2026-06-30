import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const settingsPath = execSync(
  `node --print "require.resolve('@react-native/gradle-plugin/settings.gradle.kts', { paths: [require.resolve('react-native/package.json')] })"`,
  { cwd: projectRoot, encoding: 'utf8' },
).trim();

const original = fs.readFileSync(settingsPath, 'utf8');
const patched = original.replace(
  'foojay-resolver-convention").version("0.5.0")',
  'foojay-resolver-convention").version("1.0.0")',
);

if (original === patched) {
  if (original.includes('foojay-resolver-convention").version("1.0.0")')) {
    console.log('Gradle foojay plugin already patched.');
  } else {
    console.warn('Could not find foojay-resolver-convention 0.5.0 to patch.');
  }
} else {
  fs.writeFileSync(settingsPath, patched);
  console.log('Patched @react-native/gradle-plugin foojay-resolver-convention to 1.0.0.');
}
