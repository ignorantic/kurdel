import { IDatabase } from '@kurdel/db';
/**
 * ModelModule
 *
 * - Registers application models from AppConfig
 * - Models depend on IDatabase
 */
export class ModelModule {
    constructor() {
        this.imports = { db: IDatabase };
    }
    async register(ioc, config) {
        const { models = [] } = config;
        models.forEach((model) => ioc.put(model).with({ db: IDatabase }));
    }
}
//# sourceMappingURL=model-module.js.map