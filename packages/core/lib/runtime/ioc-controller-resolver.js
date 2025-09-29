export class IoCControllerResolver {
    constructor(container) {
        this.container = container;
    }
    get(cls) {
        return this.container.get(cls);
    }
}
//# sourceMappingURL=ioc-controller-resolver.js.map