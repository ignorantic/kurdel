export type InjectionToken<T> = symbol & {
    __type?: T;
};
export type TokenFor<T> = InjectionToken<T>;
export declare function createToken<T>(key: string, global?: boolean): InjectionToken<T>;
export declare const createGlobalToken: <T>(key: string) => InjectionToken<T>;
export declare const createLocalToken: <T>(key: string) => InjectionToken<T>;
//# sourceMappingURL=injection-token.d.ts.map