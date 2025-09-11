import { IDatabase } from '@kurdel/db';
export class ModelInitializer {
    run(ioc, config) {
        config.models?.forEach((model) => {
            ioc.put(model).with({ db: IDatabase });
        });
    }
}
//# sourceMappingURL=model-initializer.js.map