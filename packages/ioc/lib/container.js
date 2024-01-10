export class IoCContainer {
    dependencies = new Map();
    register(name, constructor, dependencies) {
        this.dependencies.set(name, { constructor, dependencies });
    }
    registerInstance(name, instance) {
        if (this.dependencies.has(name)) {
            throw new Error(`Dependency ${name.toString()} already registered.`);
        }
        this.dependencies.set(name, { instance });
    }
    put(constructor, dependencies) {
        this.dependencies.set(constructor, { constructor, dependencies });
    }
    get(name) {
        const target = this.dependencies.get(name);
        if (!target) {
            throw new Error(`No dependency found for ${name.toString()}`);
        }
        if (target.instance) {
            return target.instance;
        }
        const { constructor, dependencies = [] } = target;
        const resolvedDependencies = dependencies.map((dep) => this.get(dep));
        return new constructor(...resolvedDependencies);
    }
}
