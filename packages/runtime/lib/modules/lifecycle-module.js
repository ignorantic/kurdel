import { TOKENS } from '@kurdel/core/app';
export class LifecycleModule {
    constructor() {
        this.exports = {
            onStart: TOKENS.OnStart,
            onShutdown: TOKENS.OnShutdown,
        };
    }
    async register(ioc) {
        // Initialize arrays only once; if already present, keep them
        if (!ioc.has(TOKENS.OnStart))
            ioc.set(TOKENS.OnStart, []);
        if (!ioc.has(TOKENS.OnShutdown))
            ioc.set(TOKENS.OnShutdown, []);
    }
}
//# sourceMappingURL=lifecycle-module.js.map