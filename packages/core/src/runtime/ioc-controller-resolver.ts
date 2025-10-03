import { Container } from '@kurdel/ioc';
import { Newable } from '@kurdel/common';
import { ControllerResolver } from 'src/api/types.js';

export class IoCControllerResolver implements ControllerResolver {
  private readonly container: Container;

  constructor(container: Container) {
    this.container = container;
  }

  get<T>(cls: Newable<T>): T {
    return this.container.get<T>(cls);
  }
}
