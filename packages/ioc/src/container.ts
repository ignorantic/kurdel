import { Newable } from '@kurdel/common';

export type Identifier<T = unknown> = string | symbol | Newable<T>;

export class IoCContainer {
  private readonly dependencies = new Map<Identifier, any>();

  public register<T>(name: Identifier<T>, constructor: { new(...args: any[]): T }, dependencies: Identifier[]) {
    this.dependencies.set(name, { constructor, dependencies });
  }

  public registerInstance<T>(name: Identifier<T>, instance: T) {
    if (this.dependencies.has(name)) {
      throw new Error(`Dependency ${name.toString()} already registered.`);
    }
    this.dependencies.set(name, { instance });
  }

  public put<T>(constructor: { new(...args: any[]): T }, dependencies: Identifier[]) {
    this.dependencies.set(constructor, { constructor, dependencies });
  }

  public get<T>(name: Identifier<T>): T {
    const target = this.dependencies.get(name);

    if (!target) {
        throw new Error(`No dependency found for ${name.toString()}`);
    }
    
    if (target.instance) {
        return target.instance;
    }

    const { constructor, dependencies = [] } = target;
    const resolvedDependencies = dependencies.map((dep: Identifier<T>) => this.get(dep));

    return new constructor(...resolvedDependencies);
  }
}

