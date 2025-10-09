export class MiddlewareRegistryImpl {
    constructor() {
        this.global = [];
        this.perController = new Map();
    }
    use(mw) {
        this.global.push(mw);
    }
    useFor(controller, mw) {
        if (!this.perController.has(controller)) {
            this.perController.set(controller, []);
        }
        this.perController.get(controller).push(mw);
    }
    all() {
        return [...this.global];
    }
    for(controller) {
        return this.perController.get(controller) ?? [];
    }
}
//# sourceMappingURL=middleware-registry-impl.js.map