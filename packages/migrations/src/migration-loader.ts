import { promises as fs } from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import type { Newable } from '@kurdel/common';
import { MIGRATIONS_DIR } from './consts.js';
import type { Migration } from './migration.js';

const migrationsDirectory = path.resolve(process.cwd(), MIGRATIONS_DIR);
const migrationsDirUrl = pathToFileURL(migrationsDirectory + path.sep);

export class MigrationLoader {
  async load(): Promise<Newable<Migration>[]> {
    const entries = await fs.readdir(migrationsDirectory, { withFileTypes: true });

    const files = entries
      .filter(e => e.isFile())
      .map(e => e.name)
      .filter(name => /\.(m?js|cjs)$/i.test(name));

    return Promise.all(
      files.map(async file => {
        const url = new URL(file, migrationsDirUrl.toString());
        const mod = await import(url.href);
        return mod.default as Newable<Migration>;
      })
    );
  }
}
