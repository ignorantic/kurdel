import type { IoCContainer } from '@kurdel/ioc';
import type { Newable } from '@kurdel/common';
import { ControllerResolver } from './types.js';

export class IoCControllerResolver implements ControllerResolver {
  constructor(private readonly container: IoCContainer) {}

  get<T>(cls: Newable<T>): T {
    return this.container.get<T>(cls);
  }
}