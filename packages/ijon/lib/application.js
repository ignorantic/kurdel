import http from 'http';
export class Application {
    router;
    constructor(router) {
        this.router = router;
    }
    listen(port, callback) {
        const server = http.createServer((req, res) => {
            const { method, url } = req;
            const handler = this.router.resolve(method, url);
            if (handler) {
                handler(req, res);
            }
            else {
                res.statusCode = 404;
                res.end('Not Found');
            }
        });
        server.listen(port, callback);
    }
}
