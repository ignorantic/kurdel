export class IoCContainer {
  private readonly dependencies = new Map<string, any>();

  public register<T>(name: string, constructor: { new(...args: any[]): T }, dependencies: string[]) {
    this.dependencies.set(name, { constructor, dependencies });
  }

  public registerInstance<T>(name: string, instance: T) {
    if (this.dependencies.has(name)) {
      throw new Error(`Dependency ${name} already registered.`);
    }
    this.dependencies.set(name, { instance });
  }

  public resolve<T>(name: string): T {
    const target = this.dependencies.get(name);

    if (!target) {
        throw new Error(`No dependency found for ${name}`);
    }
    
    if (target.instance) {
        return target.instance;
    }

    const { constructor, dependencies = [] } = target;
    const resolvedDependencies = dependencies.map((dep: string) => this.resolve(dep));

    return new constructor(...resolvedDependencies);
  }
}

