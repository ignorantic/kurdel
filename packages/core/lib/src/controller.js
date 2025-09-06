// helpers to build URL and query map
function buildURL(req) {
    const host = req.headers.host ?? 'localhost';
    return new URL(req.url ?? '/', `http://${host}`);
}
function toQuery(u) {
    // Keep compatibility with ParsedUrlQuery: string | string[]
    const out = {};
    u.searchParams.forEach((value, key) => {
        if (key in out) {
            const prev = out[key];
            out[key] = Array.isArray(prev) ? [...prev, value] : [prev, value];
        }
        else {
            out[key] = value;
        }
    });
    return out;
}
export class Controller {
    _request;
    _response;
    _query;
    _responded = false;
    async execute(request, response, actionName) {
        this._request = request;
        this._response = response;
        // Parse query
        const url = buildURL(request);
        this._query = toQuery(url);
        // Resolve action safely
        const action = this.resolveAction(actionName);
        if (!action) {
            response.statusCode = 404;
            response.setHeader('Content-Type', 'text/plain; charset=utf-8');
            response.end(`The method '${actionName}' was not found in '${this.constructor.name}' class.`);
            return;
        }
        await action.call(this);
    }
    /** Allow only own, public methods and ones present in routes */
    resolveAction(name) {
        const candidate = this[name];
        if (typeof candidate !== 'function')
            return undefined;
        // must be a method defined on this class' prototype (not inherited helpers)
        const proto = Object.getPrototypeOf(this);
        const isOwn = Object.prototype.hasOwnProperty.call(proto, name);
        if (!isOwn)
            return undefined;
        // reject private/utility methods
        if (name.startsWith('_'))
            return undefined;
        // optional: whitelist by routes map if you keep it
        if (this.routes && !Object.prototype.hasOwnProperty.call(this.routes, name)) {
            return undefined;
        }
        return candidate;
    }
    /** Send JSON response once (ignores subsequent calls) */
    send(statusCode, data) {
        if (!this._request || !this._response)
            return;
        if (this._responded || this._response.headersSent)
            return; // <-- Step 2 guard
        const body = JSON.stringify(data);
        this._response.writeHead(statusCode, {
            'Content-Type': 'application/json; charset=utf-8',
            'Content-Length': Buffer.byteLength(body).toString(),
        });
        this._response.end(body);
        this._responded = true;
    }
    sendError(statusCode, message) {
        this.send(statusCode, { error: message });
    }
    get query() {
        return this._query ?? {};
    }
    queryOne(name) {
        const v = this.query[name];
        return Array.isArray(v) ? v[0] : v;
    }
}
