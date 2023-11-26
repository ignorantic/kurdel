export class IoCContainer {
    dependencies = new Map();
    register(name, constructor, dependencies) {
        this.dependencies.set(name, { constructor, dependencies });
    }
    registerInstance(name, instance) {
        if (this.dependencies.has(name)) {
            throw new Error(`Dependency ${name} already registered.`);
        }
        this.dependencies.set(name, { instance });
    }
    resolve(name) {
        const target = this.dependencies.get(name);
        if (!target) {
            throw new Error(`No dependency found for ${name}`);
        }
        if (target.instance) {
            return target.instance;
        }
        const { constructor, dependencies = [] } = target;
        const resolvedDependencies = dependencies.map((dep) => this.resolve(dep));
        return new constructor(...resolvedDependencies);
    }
}
