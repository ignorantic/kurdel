/**
 * Describes expected input for a given route.
 * Framework-agnostic: any validator (Zod, Valibot, Yup) can implement it.
 */
export interface RouteSchema<TBody = unknown, TParams = Record<string, string>, TQuery = Record<string, string>> {
  readonly body?: SchemaValidator<TBody>;
  readonly params?: SchemaValidator<TParams>;
  readonly query?: SchemaValidator<TQuery>;
}

/**
 * Minimal contract any schema validator must satisfy.
 */
export interface SchemaValidator<T> {
  /** Validates value and returns it typed, or throws ValidationError */
  validate(value: unknown): T  | Promise<T>;
}
