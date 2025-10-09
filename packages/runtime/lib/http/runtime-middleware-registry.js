export class RuntimeMiddlewareRegistry {
    constructor() {
        this.global = [];
        // eslint-disable-next-line @typescript-eslint/no-empty-object-type
        this.perController = new Map();
    }
    use(mw) {
        this.global.push(mw);
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
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
//# sourceMappingURL=runtime-middleware-registry.js.map