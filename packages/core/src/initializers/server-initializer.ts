import { IoCContainer } from '@kurdel/ioc';
import { IServerAdapter } from '../http/interfaces.js';
import { NativeHttpServerAdapter } from '../http/native-http-server-adapter.js';
import { Router } from '../router.js';
import { AppConfig } from '../config.js';
import { Initializer } from './initializer.js';

export class ServerInitializer implements Initializer {
  run(ioc: IoCContainer, config: AppConfig) {
    const server = config.server ?? NativeHttpServerAdapter;
    ioc.bind(IServerAdapter).to(server).inSingletonScope().with({ router: Router });
  }
}
