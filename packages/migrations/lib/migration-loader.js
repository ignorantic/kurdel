import fs from 'fs';
import path from 'path';
import { MIGRATIONS_DIR } from './consts.js';
const migrationsDirectory = path.join(process.cwd(), MIGRATIONS_DIR);
export class MigrationLoader {
    async load() {
        return Promise.all(fs.readdirSync(migrationsDirectory).map(async (file) => {
            const { default: MigrationClass } = await import(path.join(migrationsDirectory, file));
            return MigrationClass;
        }));
    }
}
