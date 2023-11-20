import { IncomingMessage, ServerResponse } from 'http';
import { ParsedUrlQuery } from 'querystring';
import { parse } from 'url';

export class Controller {
  private _request?: IncomingMessage;
  private _response?: ServerResponse;
  private _query?: ParsedUrlQuery;
  
  async execute(request: IncomingMessage, response: ServerResponse, actionName: string) {
    this._request = request;
    this._response = response;

    if (request.url) {
      const { query } = parse(request.url ?? '', true);
      this._query = query;
    } else {
      this._query = {};
    }

    const action = this[actionName as keyof this];
    if (typeof action === 'function') {
      await (action as Function).call(this);
    } else {
      this._response.statusCode = 404;
      this._response.end(`The method '${actionName}' was not found in '${this.constructor.name}' class.`);
    }
  }

  protected get query(): ParsedUrlQuery {
    return this._query ?? {};
  }

  send(statusCode: number, data: Record<string, unknown>) {
    if (this._request && this._response) {
      this._response.writeHead(statusCode, { 'Content-Type': 'application/json' });
      this._response.end(JSON.stringify(data));
    }
  }

  sendError(statusCode: number, message: string) {
    this.send(statusCode, { error: message });
  }
}
