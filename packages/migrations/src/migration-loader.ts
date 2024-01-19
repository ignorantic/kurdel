import fs from 'fs';
import path from 'path';
import { Newable } from '@kurdel/common';
import { MIGRATIONS_DIR } from './consts.js';
import { Migration } from './migration.js';

const migrationsDirectory = path.join(process.cwd(), MIGRATIONS_DIR);

export class MigrationLoader {
  async load(): Promise<Newable<Migration>[]> {
    return Promise.all(
      fs.readdirSync(migrationsDirectory).map(async file => {
        const { default: MigrationClass } = await import(path.join(migrationsDirectory, file));
        return MigrationClass;
      })
    );
  }
}
