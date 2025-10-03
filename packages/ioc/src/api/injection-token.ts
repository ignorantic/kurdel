export type InjectionToken<T> = symbol & { __type?: T };
export type TokenFor<T> = InjectionToken<T>;

export function createToken<T>(key: string, global = false): InjectionToken<T> {
  const s = global ? Symbol.for(key) : Symbol(key);
  return s as InjectionToken<T>;
 }

export const createGlobalToken = <T>(key: string) => createToken<T>(key, true);
export const createLocalToken  = <T>(key: string) => createToken<T>(key, false);

