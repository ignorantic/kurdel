import { parse } from 'url';
export class Controller {
    _request;
    _response;
    _query;
    async execute(request, response, actionName) {
        this._request = request;
        this._response = response;
        if (request.url) {
            const { query } = parse(request.url ?? '', true);
            this._query = query;
        }
        else {
            this._query = {};
        }
        const action = this[actionName];
        if (typeof action === 'function') {
            await action.call(this);
        }
        else {
            this._response.statusCode = 404;
            this._response.end(`The method '${actionName}' was not found in '${this.constructor.name}' class.`);
        }
    }
    send(statusCode, data) {
        if (this._request && this._response) {
            this._response.writeHead(statusCode, { 'Content-Type': 'application/json' });
            this._response.end(JSON.stringify(data));
        }
    }
    sendError(statusCode, message) {
        this.send(statusCode, { error: message });
    }
    get query() {
        return this._query ?? {};
    }
}
