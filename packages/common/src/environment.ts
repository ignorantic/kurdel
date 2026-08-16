export type EnvironmentSource = Readonly<Record<string, string | undefined>>;

export type EnvironmentIssue = {
  key: string;
  message: string;
};

export class EnvironmentValidationError extends Error {
  constructor(readonly issues: readonly EnvironmentIssue[]) {
    super([
      'Invalid environment configuration:',
      ...issues.map(issue => `- ${issue.key}: ${issue.message}`),
    ].join('\n'));
    this.name = 'EnvironmentValidationError';
  }
}

export interface EnvironmentVariable<T> {
  parse(value: string | undefined): T;
}

type BaseOptions<T> = {
  default?: T;
};

type StringOptions = BaseOptions<string> & {
  trim?: boolean;
  minLength?: number;
  maxLength?: number;
};

type NumberOptions = BaseOptions<number> & {
  integer?: boolean;
  min?: number;
  max?: number;
};

function requiredValue<T>(
  value: string | undefined,
  options: BaseOptions<T>,
): string | T {
  if (value !== undefined && value.trim() !== '') return value;
  if (Object.prototype.hasOwnProperty.call(options, 'default')) return options.default as T;
  throw new Error('is required');
}

function variable<T>(parse: (value: string | undefined) => T): EnvironmentVariable<T> {
  return { parse };
}

export const env = {
  optional<T>(definition: EnvironmentVariable<T>): EnvironmentVariable<T | undefined> {
    return variable(value => value === undefined || value.trim() === ''
      ? undefined
      : definition.parse(value));
  },

  string(options: StringOptions = {}): EnvironmentVariable<string> {
    return variable(value => {
      const resolved = requiredValue(value, options);
      if (typeof resolved !== 'string') return resolved;
      const parsed = options.trim === false ? resolved : resolved.trim();
      if (options.minLength !== undefined && parsed.length < options.minLength) {
        throw new Error(`must contain at least ${options.minLength} characters`);
      }
      if (options.maxLength !== undefined && parsed.length > options.maxLength) {
        throw new Error(`must contain at most ${options.maxLength} characters`);
      }
      return parsed;
    });
  },

  number(options: NumberOptions = {}): EnvironmentVariable<number> {
    return variable(value => {
      const resolved = requiredValue(value, options);
      const parsed = typeof resolved === 'number' ? resolved : Number(resolved);
      if (!Number.isFinite(parsed)) throw new Error('must be a finite number');
      if (options.integer && !Number.isInteger(parsed)) throw new Error('must be an integer');
      if (options.min !== undefined && parsed < options.min) {
        throw new Error(`must be greater than or equal to ${options.min}`);
      }
      if (options.max !== undefined && parsed > options.max) {
        throw new Error(`must be less than or equal to ${options.max}`);
      }
      return parsed;
    });
  },

  boolean(options: BaseOptions<boolean> = {}): EnvironmentVariable<boolean> {
    return variable(value => {
      const resolved = requiredValue(value, options);
      if (typeof resolved === 'boolean') return resolved;
      const normalized = resolved.trim().toLowerCase();
      if (['true', '1', 'yes', 'on'].includes(normalized)) return true;
      if (['false', '0', 'no', 'off'].includes(normalized)) return false;
      throw new Error('must be a boolean');
    });
  },

  enum<const T extends readonly [string, ...string[]]>(
    values: T,
    options: BaseOptions<T[number]> = {},
  ): EnvironmentVariable<T[number]> {
    return variable(value => {
      const resolved = requiredValue(value, options);
      const normalized = typeof resolved === 'string' ? resolved.trim() : resolved;
      if (values.includes(normalized as T[number])) return normalized as T[number];
      throw new Error(`must be one of: ${values.join(', ')}`);
    });
  },
};

type EnvironmentSchema = Record<string, EnvironmentVariable<unknown>>;

export type InferEnvironment<T extends EnvironmentSchema> = {
  [K in keyof T]: T[K] extends EnvironmentVariable<infer V> ? V : never;
};

/** Parses all configured variables and reports every validation issue at once. */
export function loadEnv<const T extends EnvironmentSchema>(
  schema: T,
  source: EnvironmentSource = process.env,
): InferEnvironment<T> {
  const output: Record<string, unknown> = {};
  const issues: EnvironmentIssue[] = [];
  for (const [key, definition] of Object.entries(schema)) {
    try {
      output[key] = definition.parse(source[key]);
    } catch (error) {
      issues.push({
        key,
        message: error instanceof Error ? error.message : 'is invalid',
      });
    }
  }
  if (issues.length > 0) throw new EnvironmentValidationError(issues);
  return output as InferEnvironment<T>;
}
