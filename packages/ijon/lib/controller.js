export class Controller {
    request;
    response;
    async execute(request, response, actionName) {
        this.request = request;
        this.response = response;
        const action = this[actionName];
        if (typeof action === 'function') {
            await action.call(this);
        }
        else {
            this.response.statusCode = 404;
            this.response.end(`The method '${actionName}' was not found in '${this.constructor.name}' class.`);
        }
    }
    send(statusCode, data) {
        if (this.request && this.response) {
            this.response.writeHead(statusCode, { 'Content-Type': 'application/json' });
            this.response.end(JSON.stringify(data));
        }
    }
    sendError(statusCode, message) {
        this.send(statusCode, { error: message });
    }
}
