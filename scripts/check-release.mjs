import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const expectedRepository = 'git+https://github.com/ignorantic/kurdel.git';
const expectedIssues = 'https://github.com/ignorantic/kurdel/issues';
const expectedEngines = '^20.19.0 || ^22.12.0 || >=24.0.0';

const readJson = async relativePath =>
  JSON.parse(await readFile(path.join(root, relativePath), 'utf8'));

const exists = async relativePath => {
  try {
    await stat(path.join(root, relativePath));
    return true;
  } catch {
    return false;
  }
};

const collectTargets = value => {
  if (typeof value === 'string') return [value];
  if (!value || typeof value !== 'object') return [];
  return Object.values(value).flatMap(collectTargets);
};

const failures = [];
const fail = message => failures.push(message);
const lerna = await readJson('lerna.json');
const lockfile = await readJson('package-lock.json');
const packageNames = new Map();
const publicPackages = [];

for (const group of ['packages', 'sample']) {
  const directories = (await readdir(path.join(root, group), { withFileTypes: true }))
    .filter(entry => entry.isDirectory())
    .map(entry => `${group}/${entry.name}`)
    .sort();

  for (const directory of directories) {
    const manifest = await readJson(`${directory}/package.json`);
    packageNames.set(manifest.name, manifest.version);
    if (group === 'packages') publicPackages.push({ directory, manifest });
    if (group === 'sample' && manifest.private !== true) {
      fail(`${manifest.name} must be private`);
    }
  }
}

for (const directory of Object.keys(lockfile.packages)) {
  if (!/^(packages|sample)\/[^/]+$/.test(directory)) continue;
  if (!(await exists(`${directory}/package.json`))) {
    fail(`package-lock.json contains a stale workspace: ${directory}`);
  }
}

for (const { directory, manifest } of publicPackages) {
  const label = manifest.name;
  if (manifest.private === true) fail(`${label} must be publishable`);
  if (manifest.version !== lerna.version) {
    fail(`${label} version ${manifest.version} does not match Lerna ${lerna.version}`);
  }
  if (manifest.license !== 'MIT') fail(`${label} must use the MIT license`);
  if (manifest.engines?.node !== expectedEngines) fail(`${label} has inconsistent Node.js support`);
  if (manifest.repository?.url !== expectedRepository) fail(`${label} has an invalid repository URL`);
  if (manifest.repository?.directory !== directory) fail(`${label} has an invalid repository directory`);
  if (manifest.bugs?.url !== expectedIssues) fail(`${label} has an invalid issue tracker URL`);
  if (manifest.publishConfig?.access !== 'public') fail(`${label} must publish with public access`);
  if (manifest.publishConfig?.tag !== 'beta') fail(`${label} must publish under the beta tag`);
  if (manifest.scripts?.prepack !== 'npm run build') fail(`${label} must build during prepack`);

  for (const requiredFile of ['README.md', 'LICENSE']) {
    if (!(await exists(`${directory}/${requiredFile}`))) fail(`${label} is missing ${requiredFile}`);
  }

  for (const target of [manifest.main, manifest.types, ...collectTargets(manifest.exports)]) {
    if (!target) continue;
    const normalized = target.replace(/^\.\//, '');
    if (!(await exists(`${directory}/${normalized}`))) fail(`${label} entry point is missing: ${target}`);
  }

  const binTargets = typeof manifest.bin === 'string' ? [manifest.bin] : Object.values(manifest.bin ?? {});
  for (const target of binTargets) {
    const normalized = target.replace(/^\.\//, '');
    if (!(await exists(`${directory}/${normalized}`))) fail(`${label} binary is missing: ${target}`);
  }

  for (const section of ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']) {
    for (const [dependency, range] of Object.entries(manifest[section] ?? {})) {
      const workspaceVersion = packageNames.get(dependency);
      if (workspaceVersion && range !== workspaceVersion) {
        fail(`${label} ${section}.${dependency} must be ${workspaceVersion}, received ${range}`);
      }
    }
  }

  const locked = lockfile.packages[directory];
  if (locked?.version !== manifest.version) fail(`${label} is out of sync with package-lock.json`);
}

if (publicPackages.length === 0) fail('No publishable packages found');

if (failures.length > 0) {
  console.error('Release validation failed:');
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log(`Release validation passed for ${publicPackages.length} packages at ${lerna.version}.`);
}
