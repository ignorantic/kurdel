import { HttpError } from '@kurdel/core/http';
import type { Controller } from '@kurdel/core/http';

/**
 * Thrown when a controller action returns `undefined`,
 * which violates the ActionResult contract.
 */
export class ControllerActionMissingResultError extends HttpError {
  constructor(controller: Controller, action: string) {
    super(
      500,
      `Controller action returned undefined: ${controller.constructor.name}.${action}`,
      {
        controller: controller.constructor.name,
        action,
      }
    );
  }
}
