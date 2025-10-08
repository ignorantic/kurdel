import { createServer } from 'node:http';
export class NativeHttpServerAdapter {
    constructor() {
        // The server delegates to the registered handler; if none, 404.
        this.server = createServer((req, res) => {
            const h = this.handler;
            if (!h) {
                res.statusCode = 404;
                res.end?.();
                return;
            }
            Promise.resolve(h(req, res)).catch(() => {
                // Best-effort fallback in case upstream didn't handle the error.
                if (!res.headersSent) {
                    try {
                        res.statusCode = 500;
                        res.end?.();
                    }
                    catch { }
                }
            });
        });
    }
    on(cb) {
        this.handler = cb;
    }
    listen(port, hostOrCb, cb) {
        const done = (typeof hostOrCb === 'function' ? hostOrCb : cb) ?? (() => { });
        if (typeof hostOrCb === 'string') {
            this.server.listen(port, hostOrCb, done);
        }
        else {
            this.server.listen(port, done);
        }
    }
    async close() {
        await new Promise((resolve, reject) => this.server.close((err) => (err ? reject(err) : resolve())));
    }
    /** Unified raw getter used by ApplicationImpl/RunningServer. */
    raw() {
        return this.server;
    }
}
//# sourceMappingURL=native-http-server-adapter.js.map