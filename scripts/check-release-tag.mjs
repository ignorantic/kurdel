import process from 'node:process';
import { readFile } from 'node:fs/promises';

const tag = process.argv[2];
const { version } = JSON.parse(await readFile(new URL('../lerna.json', import.meta.url), 'utf8'));
const expectedTag = `v${version}`;

if (tag !== expectedTag) {
  console.error(`Release tag ${tag ?? '<missing>'} does not match ${expectedTag}.`);
  process.exitCode = 1;
} else {
  console.log(`Release tag ${tag} matches the workspace version.`);
}
