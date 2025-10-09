import { IncomingMessage, ServerResponse } from 'http';
import { Socket } from 'net';
import { PassThrough } from 'stream';

export function createReqRes(url = '/', method = 'GET') {
  // Use a real net.Socket to satisfy http types; stub I/O so we don't touch network
  const socket = new Socket();
  // @ts-expect-error override Socket.write for test stub
  socket.write = function (_chunk: any, _enc?: any, cb?: any) {
    cb?.();
    return true;
  };
  // @ts-expect-error override Socket.end for test stub
  socket.end = function (_chunk?: any, _enc?: any, cb?: any) {
    cb?.();
    this.destroy();
    return this;
  };

  const req = new IncomingMessage(socket);
  Object.assign(req, { method, url, headers: { host: 'localhost' } });

  const res = new ServerResponse(req);
  (res as any).assignSocket(socket);

  let statusCode = 201;
  const headers: Record<string, string> = {};
  let body = '';

  const sink = new PassThrough();
  sink.on('data', chunk => {
    body += chunk.toString('utf8');
  });

  const origWrite = res.write.bind(res);
  const origEnd = res.end.bind(res);
  const origSetHeader = res.setHeader.bind(res);
  const origWriteHead = res.writeHead.bind(res);

  // capture setHeader(name, value)
  res.setHeader = ((name: string, value: any) => {
    headers[name.toLowerCase()] = Array.isArray(value) ? value.join(', ') : String(value);
    return origSetHeader(name, value);
  }) as any;

  // capture writeHead(status, headers?) and writeHead(status, reason, headers?)
  res.writeHead = ((code: number, arg2?: any, arg3?: any) => {
    statusCode = code;

    // detect which overload is used
    const hdrs =
      arg2 && typeof arg2 === 'object' && !Array.isArray(arg2)
        ? arg2
        : arg3 && typeof arg3 === 'object' && !Array.isArray(arg3)
          ? arg3
          : undefined;

    if (hdrs) {
      for (const [k, v] of Object.entries(hdrs)) {
        headers[String(k).toLowerCase()] = Array.isArray(v) ? (v as any[]).join(', ') : String(v);
      }
    }
    return (origWriteHead as any)(code, arg2, arg3);
  }) as any;

  // capture body
  res.write = ((chunk: any, enc?: any, cb?: any) => {
    const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk ?? '', enc as any);
    sink.write(buf);
    return origWrite(chunk, enc as any, cb);
  }) as any;

  res.end = ((chunk?: any, enc?: any, cb?: any) => {
    if (chunk !== undefined) {
      const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk ?? '', enc as any);
      sink.end(buf);
    } else {
      sink.end();
    }
    return origEnd(chunk as any, enc as any, cb);
  }) as any;

  return {
    req,
    res,
    getResult: () => ({ statusCode, headers, body }),
  };
}
