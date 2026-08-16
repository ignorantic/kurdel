import type { IoCContainer } from '@kurdel/ioc';
import { Database } from '@kurdel/db';
import type { AppModule, AppConfig } from '@kurdel/core/app';
import type { ModelList } from '@kurdel/core/db';

/**
 * ModelModule
 *
 * - Registers models from all HttpModules
 * - Models depend on Database
 */
export class ModelModule implements AppModule<AppConfig> {
  readonly imports = { db: Database };

  constructor(private models: ModelList) {}

  async register(ioc: IoCContainer): Promise<void> {
    this.models.forEach(model => {
      if ('use' in model) {
        ioc.put(model.use).with({ db: Database, ...model.deps });
      } else {
        ioc.put(model).with({ db: Database });
      }
    });
  }
}
