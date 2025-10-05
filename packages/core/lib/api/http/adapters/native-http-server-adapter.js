import http from 'http';
export class NativeHttpServerAdapter {
    constructor() {
        this.server = http.createServer();
    }
    on(h) {
        this.server.removeAllListeners('request');
        this.server.on('request', (req, res) => { void Promise.resolve(h(req, res)); });
    }
    listen(port, callback) {
        this.server.listen(port, callback);
    }
    getHttpServer() {
        return this.server;
    }
}
//# sourceMappingURL=native-http-server-adapter.js.map