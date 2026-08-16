import { spawnSync } from 'node:child_process';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const dryRun = process.argv.includes('--dry-run');

if (!dryRun && process.env.GITHUB_ACTIONS !== 'true') {
  console.error('Package publication is restricted to the GitHub Actions release workflow.');
  process.exit(1);
}

const root = process.cwd();
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const directories = (await readdir(path.join(root, 'packages'), { withFileTypes: true }))
  .filter(entry => entry.isDirectory())
  .map(entry => `packages/${entry.name}`)
  .sort();

const packages = new Map();
for (const directory of directories) {
  const manifest = JSON.parse(await readFile(path.join(root, directory, 'package.json'), 'utf8'));
  if (manifest.private === true) continue;
  packages.set(manifest.name, { directory, manifest });
}

const ordered = [];
const visiting = new Set();
const visited = new Set();

const visit = name => {
  if (visited.has(name)) return;
  if (visiting.has(name)) throw new Error(`Circular package dependency involving ${name}`);
  visiting.add(name);
  const current = packages.get(name);
  for (const dependency of Object.keys(current.manifest.dependencies ?? {})) {
    if (packages.has(dependency)) visit(dependency);
  }
  visiting.delete(name);
  visited.add(name);
  ordered.push(current);
};

for (const name of packages.keys()) visit(name);

for (const { directory, manifest } of ordered) {
  if (dryRun) {
    console.log(`Would publish ${manifest.name}@${manifest.version} from ${directory}.`);
    continue;
  }

  const response = await fetch(`https://registry.npmjs.org/${encodeURIComponent(manifest.name)}`);
  if (response.ok) {
    const metadata = await response.json();
    if (metadata.versions?.[manifest.version]) {
      console.log(`Skipping ${manifest.name}@${manifest.version}: already published.`);
      continue;
    }
  } else if (response.status !== 404) {
    throw new Error(`Registry lookup failed for ${manifest.name}: HTTP ${response.status}`);
  }

  console.log(`Publishing ${manifest.name}@${manifest.version} from ${directory}.`);
  const packageDirectory = path.join(root, directory);
  const result = spawnSync(
    npmCommand,
    ['publish', packageDirectory, '--access', 'public', '--tag', 'beta', '--provenance'],
    { cwd: root, env: process.env, stdio: 'inherit' }
  );
  if (result.status !== 0) process.exit(result.status ?? 1);
}
