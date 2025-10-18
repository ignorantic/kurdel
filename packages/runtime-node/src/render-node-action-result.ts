import type { ServerResponse } from 'node:http';

import type { ActionResult } from '@kurdel/core/http';
import { renderActionResult } from '@kurdel/runtime/http';

import { adaptNodeResponse } from 'src/node-http-adapter.js';

export function renderNodeActionResult(res: ServerResponse, r: ActionResult): void {
  renderActionResult(adaptNodeResponse(res), r);
}
