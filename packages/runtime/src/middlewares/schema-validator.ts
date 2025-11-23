import {
  type Middleware,
  type HttpContext,
  type RouteSchema,
  ValidationError,
} from '@kurdel/core/http';

/**
 * ## schemaValidator
 *
 * Global middleware that performs runtime validation of incoming
 * requests based on the {@link RouteSchema} defined in `ctx.route.schema`.
 *
 * No explicit schema injection required — it works automatically
 * for any route that defines `schema` in its metadata.
 *
 * If validation fails, it returns a 400 JSON response.
 */
export const schemaValidator: Middleware = async (ctx: HttpContext, next) => {
  const schema: RouteSchema | undefined = ctx.route?.schema;
  if (!schema) {
    // No schema — just pass through
    return next();
  }

  try {
    // Validate each part if present in schema
    if (schema.params) {
      (ctx as any).params = await schema.params.validate(ctx.params);
    }
    if (schema.query) {
      (ctx as any).query = await schema.query.validate(ctx.query);
    }
    if (schema.body) {
      (ctx as any).body = await schema.body.validate(ctx.body);
    }
  } catch (err) {
    if (err instanceof ValidationError) {
      return ctx.json(400, {
        error: 'Bad Request',
        message: err.message,
        field: err.field,
        details: err.details,
      });
    }
    throw err;
  }

  return next();
};
