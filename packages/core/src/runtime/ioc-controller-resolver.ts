import type { IoCContainer } from '@kurdel/ioc';
import type { Newable } from '@kurdel/common';
import { ControllerResolver } from 'src/api/types.js';

export class IoCControllerResolver implements ControllerResolver {
  private readonly container: IoCContainer;

  constructor(container: IoCContainer) {
    this.container = container;
  }

  get<T>(cls: Newable<T>): T {
    return this.container.get<T>(cls);
  }
}
