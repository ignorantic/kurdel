import { IoCContainer } from '@kurdel/ioc';
import { IDatabase } from '@kurdel/db';
import { AppModule, AppConfig } from '@kurdel/core/app';
import { ModelList } from '@kurdel/core/db';

/**
 * ModelModule
 *
 * - Registers models from all HttpModules
 * - Models depend on IDatabase
 */
export class ModelModule implements AppModule<AppConfig> {
  readonly imports = { db: IDatabase };

  constructor(private models: ModelList) {}

  async register(ioc: IoCContainer): Promise<void> {
    this.models.forEach((model) => {
      if ('use' in model) {
        ioc.put(model.use).with({ db: IDatabase, ...model.deps });
      } else {
        ioc.put(model).with({ db: IDatabase });
      }
    });
  }
}
