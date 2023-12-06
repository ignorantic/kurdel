import fs from 'fs';
import path from 'path';
import { MIGRATIONS_DIR, Application, } from 'ijon';
const migrationsDirectory = path.join(process.cwd(), MIGRATIONS_DIR);
export class MigrationsLoader {
    connection;
    constructor(connection) {
        this.connection = connection;
    }
    static async create() {
        const application = await Application.create();
        return new MigrationsLoader(application.getDBConnection());
    }
    async up() {
        const migrations = await this.load();
        migrations.forEach(async (migration) => {
            migration.up();
        });
    }
    async down() {
        const migrations = await this.load();
        migrations.forEach(async (migration) => {
            migration.down();
        });
    }
    async load() {
        return Promise.all(fs.readdirSync(migrationsDirectory).map(async (file) => {
            const { default: MigrationClass } = await import(path.join(migrationsDirectory, file));
            return new MigrationClass(this.connection);
        }));
    }
}
//# sourceMappingURL=migrations-loader.js.map