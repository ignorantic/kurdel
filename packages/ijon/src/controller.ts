import { IncomingMessage, ServerResponse } from 'http';

export class Controller {
  private request?: IncomingMessage;
  private response?: ServerResponse;
  
  async execute(request: IncomingMessage, response: ServerResponse, actionName: string) {
    this.request = request;
    this.response = response;
    const action = this[actionName as keyof this];
    if (typeof action === 'function') {
      await (action as Function).call(this);
    } else {
      this.response.statusCode = 404;
      this.response.end(`The method '${actionName}' was not found in '${this.constructor.name}' class.`);
    }
  }

  send(statusCode: number, data: Record<string, unknown>) {
    if (this.request && this.response) {
      this.response.writeHead(statusCode, { 'Content-Type': 'application/json' });
      this.response.end(JSON.stringify(data));
    }
  }

  sendError(statusCode: number, message: string) {
    this.send(statusCode, { error: message });
  }
}
