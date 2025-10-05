import { Newable } from '@kurdel/common';
import { Container } from '@kurdel/ioc';

import { ControllerResolver } from 'src/api/http/interfaces.js';

export class IoCControllerResolver implements ControllerResolver {
  private readonly container: Container;

  constructor(container: Container) {
    this.container = container;
  }

  get<T>(cls: Newable<T>): T {
    return this.container.get<T>(cls);
  }
}
