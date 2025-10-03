/**
 * Binding
 *
 * Stores information about how a dependency is resolved:
 * - boundEntity → class or instance
 * - depsMap → dependencies for constructor injection
 * - toFactory → custom factory function
 * - scope → lifecycle (Transient or Singleton)
 * - cache → cached instance (for Singleton)
 */
export class Binding {
    constructor() {
        this.boundEntity = null;
        this.scope = 'Transient';
        this.cache = null;
        this.activated = false;
        this.depsMap = undefined;
        this.toFactory = undefined;
    }
}
//# sourceMappingURL=binding.js.map