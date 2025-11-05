import type { HttpResponse } from '@kurdel/common';
import type { ActionResult } from '@kurdel/core/http';
import type { Response } from 'express';
import { renderExpressActionResult } from './render-express-action-result.js';

/**
 * Type bridge between platform-agnostic HttpResponse and Express.Response.
 *
 * Keeps RuntimeResponseRenderer generic while delegating to
 * Express-specific rendering logic.
 */
export function renderExpressResultAdapter(res: HttpResponse, result: ActionResult): void {
  renderExpressActionResult(res as unknown as Response, result);
}
