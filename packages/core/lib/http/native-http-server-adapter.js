import http from 'http';
export class NativeHttpServerAdapter {
    constructor(deps) {
        this.deps = deps;
        this.server = http.createServer((req, res) => {
            const { method, url } = req;
            const handler = this.deps.router.resolve(method, url);
            if (handler) {
                handler(req, res);
            }
            else {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'text/plain; charset=utf-8');
                res.end('Not Found');
            }
        });
    }
    listen(port, callback) {
        this.server.listen(port, callback);
    }
}
//# sourceMappingURL=native-http-server-adapter.js.map