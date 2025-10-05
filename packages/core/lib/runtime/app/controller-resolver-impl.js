export class ControllerResolverImpl {
    constructor(container) {
        this.container = container;
    }
    get(cls) {
        return this.container.get(cls);
    }
}
//# sourceMappingURL=controller-resolver-impl.js.map