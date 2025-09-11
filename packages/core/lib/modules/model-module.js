import { IDatabase } from '@kurdel/db';
/**
 * ModelModule
 *
 * - Exports: none
 * - Imports: IDatabase
 *
 * Registers application models in the IoC container.
 * Each model receives the database instance automatically
 * injected through constructor parameter mapping.
 */
export const ModelModule = {
    imports: { db: IDatabase },
    register(ioc, config) {
        config.models?.forEach((model) => {
            ioc.put(model).with({ db: IDatabase });
        });
    },
};
//# sourceMappingURL=model-module.js.map