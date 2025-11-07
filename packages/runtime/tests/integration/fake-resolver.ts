import type { Newable } from '@kurdel/common';
import type { Container } from '@kurdel/ioc';
import type { ControllerResolver } from '@kurdel/core/http';

export class FakeResolver implements ControllerResolver {
  constructor(private readonly root: Container) {}

  resolve<T>(cls: Newable<T>, scope?: Container): T {
    return (scope ?? this.root).get<T>(cls);
  }
}
