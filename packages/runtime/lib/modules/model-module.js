import { IDatabase } from '@kurdel/db';
/**
 * ModelModule
 *
 * - Registers models from all HttpModules
 * - Models depend on IDatabase
 */
export class ModelModule {
    constructor(models) {
        this.models = models;
        this.imports = { db: IDatabase };
    }
    async register(ioc) {
        this.models.forEach(model => {
            if ('use' in model) {
                ioc.put(model.use).with({ db: IDatabase, ...model.deps });
            }
            else {
                ioc.put(model).with({ db: IDatabase });
            }
        });
    }
}
//# sourceMappingURL=model-module.js.map