import http from 'http';
export class NativeHttpServerAdapter {
    constructor(router) {
        this.server = http.createServer((req, res) => {
            const { method, url } = req;
            const handler = router.resolve(method, url);
            if (handler) {
                handler(req, res);
            }
            else {
                res.statusCode = 404;
                res.end('Not Found');
            }
        });
    }
    listen(port, callback) {
        this.server.listen(port, callback);
    }
}
//# sourceMappingURL=native-http-server-adapter.js.map