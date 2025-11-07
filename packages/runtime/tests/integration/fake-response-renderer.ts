import type { HttpResponse } from '@kurdel/common';
import type { ActionResult, ResponseRenderer } from '@kurdel/core/http';

/** No-op renderer used for non-platform runtime tests. */
export class FakeResponseRenderer implements ResponseRenderer {
  render(res: any, result: any) {
    if (!result) return;
    res.status(result.status);
    if (result.kind === 'json') res.json(result.body);
    else res.send(result.body ?? '');
  }

  handleError(res: any, err: any) {
    const code = err?.status ?? 500;
    res.status(code);
    res.send(`${code} ${err?.message ?? 'Error'}`);
  }
}